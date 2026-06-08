"""
付款审批 - 付款报表输出。

对照原 Delphi「付款报表输出」source.pas；基于 template 目录下 Excel 模版填充并导出 PDF/Excel。
"""

from any import *
from .model import *
from .__default__ import user_task_delete

import json
import os
import subprocess
import sys
import time
import zipfile

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

from sqlalchemy import text

TEMPLATE_NORMAL = "正常付款表"
TEMPLATE_PREPAY = "预付款审批"
TEMPLATE_ADVANCE = "提前付款表"

_MONEY_FMT = "¥#,##0.00"
_TEXT_FMT = "@"


def safe_write(ws, coord, value, num_format=None):
    """合并单元格安全写入：coord 若在合并区内则写入该区域左上角主单元格。"""
    rng = ws.range(coord)
    area = rng.merge_area
    rows, cols = area.shape
    if rows * cols > 1:
        cell = area(1, 1)
        cell.value = value
        if num_format:
            cell.number_format = num_format
    else:
        if num_format:
            rng.number_format = num_format
        rng.value = value


def _safe_write_center(ws, coord, value, num_format=None):
    safe_write(ws, coord, value, num_format)
    rng = ws.range(coord)
    area = rng.merge_area
    rows, cols = area.shape
    cell = area(1, 1) if rows * cols > 1 else rng
    cell.api.HorizontalAlignment = -4108
    cell.api.VerticalAlignment = -4108
    cell.api.WrapText = True


def _esc_sql(v):
    return str(v or "").replace("'", "''")


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default)
    if as_type is float:
        return float(value) if value not in ("", None) else 0.0
    if value is None:
        return ""
    return str(value).strip()


def _to_float(v):
    if v in ("", None):
        return 0.0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _safe_filename(s):
    s = str(s or "").strip() or "export"
    for c in r'\/:*?"<>|':
        s = s.replace(c, "_")
    return s


def _fmt_date(v):
    if v is None or v == "":
        return ""
    if hasattr(v, "strftime"):
        return v.strftime("%Y-%m-%d")
    s = str(v).strip()
    if " " in s:
        return s.split()[0]
    if "T" in s and len(s) > 10:
        return s[:10]
    return s


def _unique_join(values):
    seen = []
    for v in values:
        v = str(v or "").strip()
        if v and v not in seen:
            seen.append(v)
    return "\n".join(seen)


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def _autofit_row(ws, row):
    try:
        ws.range(f"{row}:{row}").api.AutoFit()
    except Exception:
        pass


def _set_cell_borders(ws, range_addr, weight=2):
    try:
        rng = ws.range(range_addr).api
        for b in (7, 8, 9, 10, 11, 12):
            bd = rng.Borders(b)
            bd.LineStyle = 1
            bd.Weight = weight
            bd.Color = 0
    except Exception:
        pass


def _clear_cell_borders(ws, range_addr):
    """清除指定区域的单元格边框"""
    try:
        rng = ws.range(range_addr).api
        for b in (7, 8, 9, 10, 11, 12):
            bd = rng.Borders(b)
            bd.LineStyle = 0
    except Exception:
        pass


def _calc_merged_height(ws, row, col):
    """计算指定单元格（含合并区域）按内容所需的行高，返回 needed_height 或 0"""
    try:
        cell = ws.range(f"{col}{row}")
        area = cell.merge_area
        content = str(area(1, 1).value or "")
        if not content:
            return 0

        font_size = area(1, 1).api.Font.Size or 11
        area_width = area.width
        if area_width is None or area_width <= 0:
            area_width = cell.width
        if area_width is None or area_width <= 0:
            area_width = 100

        # 英文/数字比中文窄
        if content and not any("\u4e00" <= c <= "\u9fff" for c in content):
            char_width = font_size * 0.55
        else:
            char_width = font_size * 0.6
        chars_per_line = max(1, int(area_width / char_width))

        lines = content.split("\n")
        total_lines = 0
        for line in lines:
            total_lines += max(1, (len(line) + chars_per_line - 1) // chars_per_line)

        return total_lines * (font_size + 4) + 4
    except Exception:
        return 0


def _autofit_row_all(ws, row, key_cols=None, max_height=None):
    """遍历该行关键列的所有合并区域，按内容最多的单元格设置行高"""
    try:
        max_needed = 0
        seen_addrs = set()
        cols = key_cols or [chr(ord("A") + i) for i in range(10)]  # 默认 A-J
        for col_letter in cols:
            try:
                cell = ws.range(f"{col_letter}{row}")
                area = cell.merge_area
                addr = area.address
                if addr in seen_addrs:
                    continue
                seen_addrs.add(addr)

                needed = _calc_merged_height(ws, row, col_letter)
                if needed > max_needed:
                    max_needed = needed
            except Exception:
                continue

        if max_needed == 0:
            try:
                ws.range(f"{row}:{row}").api.AutoFit()
            except Exception:
                pass
            return

        try:
            current = float(ws.range(f"{row}:{row}").api.RowHeight)
        except Exception:
            current = 15

        if max_height is not None and max_needed > max_height:
            max_needed = max_height

        if max_needed > current or current > max_needed + 3:
            ws.range(f"{row}:{row}").api.RowHeight = max_needed
    except Exception:
        try:
            ws.range(f"{row}:{row}").api.AutoFit()
        except Exception:
            pass


def _try_set_checkbox(ws, name, checked):
    val = 1 if checked else 0
    # 方式1: xlwings shapes API (参考 booking.py)
    try:
        shape = ws.shapes[name]
        shape.api.OLEFormat.Object.Value = val
        return True
    except Exception:
        pass
    # 方式2: 直接通过 COM OLEObjects
    try:
        ole = ws.api.OLEObjects(name)
        ole.Object.Value = checked
        return True
    except Exception:
        pass
    # 方式3: 遍历 COM OLEObjects
    try:
        ole_objects = ws.api.OLEObjects
        count = ole_objects.Count
        for idx in range(1, count + 1):
            ole = ole_objects(idx)
            if ole.Name == name:
                ole.Object.Value = checked
                return True
    except Exception:
        pass
    # 方式4: 遍历 COM Shapes (Form Controls)
    try:
        for sh in ws.api.Shapes:
            if sh.Name == name:
                try:
                    sh.ControlFormat.Value = val
                except Exception:
                    try:
                        sh.OLEFormat.Object.Value = val
                    except Exception:
                        pass
                return True
    except Exception:
        pass
    return False


def _add_picture_fitted_to_cell(ws, coord, path, pad=2):
    """将图片缩放并居中放入单元格，保持纵横比。"""
    area = ws.range(coord).merge_area
    pic = ws.pictures.add(path, left=area.left, top=area.top)
    if pic.width and pic.height:
        scale = min(1, (area.width - pad * 2) / pic.width, (area.height - pad * 2) / pic.height)
        if scale < 1:
            pic.width *= scale
    pic.left = area.left + (area.width - pic.width) / 2
    pic.top = area.top + (area.height - pic.height) / 2
    return pic


def _parse_tpzx_tpmc_first_src(tpmc_raw):
    if tpmc_raw is None:
        return None
    raw = str(tpmc_raw).strip()
    if raw in ("", "[]", "null"):
        return None
    try:
        data = json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None
    if not isinstance(data, list) or len(data) == 0:
        return None
    first = data[0]
    if not isinstance(first, dict):
        return None
    return first.get("src")


def _tpzx_src_to_local_path(file_path):
    if not file_path:
        return None
    fp = str(file_path).strip()
    if not fp:
        return None
    fn = os.path.join(config.data_upload_path, fp)
    if os.path.isfile(fn):
        return fn
    rel = fp.lstrip("/\\").replace("\\", "/")
    if rel != fp:
        fn2 = os.path.join(config.data_upload_path, rel)
        if os.path.isfile(fn2):
            return fn2
    if os.path.isabs(fp) and os.path.isfile(fp):
        return fp
    return None


def _sig_path(cpbh):
    if not cpbh:
        return None
    rows = run_sql(f"select tpmc from tpzx where (cpbh='{_esc_sql(cpbh)}') and (LENGTH(tpmc) > 5) limit 1")
    if not rows:
        return None
    src = _parse_tpzx_tpmc_first_src(rows[0].get("tpmc"))
    return _tpzx_src_to_local_path(src)


def _collect_signature_paths(tjjl, tjfk, tjzjl, tjcw):
    out = {}
    for key, cpbh in (("tjjl", tjjl), ("tjfk", tjfk), ("tjzjl", tjzjl), ("tjcw", tjcw)):
        path = _sig_path(cpbh)
        if path:
            out[key] = path
    return out


def _add_signature_or_text(ws, col_letter, row, img_path, text, watermark_text=None):
    run_time = time.time()
    coord = f"{col_letter}{row}"
    if img_path and os.path.isfile(img_path):
        if watermark_text:
            safe_write(ws, coord, watermark_text)
            rng = ws.range(coord)
            area = rng.merge_area
            rows, cols = area.shape
            cell = area(1, 1) if rows * cols > 1 else rng
            cell.api.Font.Color = 0xC0C0C0
            cell.api.Font.Size = 8
        _add_picture_fitted_to_cell(ws, coord, img_path, pad=0)
        run_time1 = time.time()
        print(f"添加签名图片 {img_path} 到 {coord}，耗时 {run_time1 - run_time:.2f} 秒")
        return
    _safe_write_center(ws, coord, text)
    run_time2 = time.time()
    print(f"添加签名文本 '{text}' 到 {coord}，耗时 {run_time2 - run_time:.2f} 秒")


def convert_excel_to_pdf(excel_path, output_dir=None):
    try:
        pdf_path = os.path.splitext(excel_path)[0] + ".pdf"
        if not getattr(config, "java_path", None):
            return {"success": False, "error": "Java路径未配置（config.java_path）"}
        if not getattr(config, "report_jar", None):
            return {"success": False, "error": "whale_report.jar路径未配置（config.report_jar）"}
        if not os.path.exists(config.report_jar):
            return {"success": False, "error": f"whale_report.jar文件不存在: {config.report_jar}"}
        cmd = [config.java_path, "-jar", config.report_jar, "a", "b", excel_path, pdf_path, "2"]
        result = subprocess.run(cmd, capture_output=True, timeout=120, text=True)
        if result.returncode != 0:
            return {
                "success": False,
                "error": f"PDF转换失败（返回码 {result.returncode}）：{result.stderr or result.stdout}",
            }
        if not os.path.exists(pdf_path):
            return {"success": False, "error": f"PDF文件未生成（期望路径：{pdf_path}）"}
        return {"success": True, "pdf_path": pdf_path, "error": None}
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "PDF转换超时（超过2分钟）"}
    except Exception:
        logger.error(trace_error())
        return {"success": False, "error": trace_error()}


def _save_workbook_as_pdf(wb, excel_path, save_dir, want_pdf):
    os.makedirs(os.path.dirname(excel_path) or save_dir, exist_ok=True)
    wb.save(excel_path)
    wb.close()
    if not want_pdf:
        return excel_path, None
    pdf_res = convert_excel_to_pdf(excel_path, save_dir)
    if not pdf_res.get("success"):
        raise RuntimeError(pdf_res.get("error") or "PDF转换失败")
    return excel_path, pdf_res["pdf_path"]


def _is_finance_user(username):
    u = _esc_sql(username)
    rows = run_sql(
        f"select rid from sys_user where (username='{u}') and ((username='侯柳红') or (position like '%财务%')) limit 1"
    )
    return bool(rows)


def _template_path(base_path, stem):
    for name in (f"{stem}.xlsx", f"{stem}.xls"):
        p = os.path.join(base_path, name)
        if os.path.isfile(p):
            return p
    return os.path.join(base_path, f"{stem}.xlsx")


def _gsjc_for_fktt(fktt):
    if not fktt:
        return ""
    fk = _esc_sql(fktt)
    d = run_sql(f"select gsjc from kpnr where wfgs='{fk}' limit 1")
    if d:
        return get_field_value(d[0], "gsjc")
    d = run_sql(f"select gsjc from wfgs where wfgs='{fk}' limit 1")
    return get_field_value(d[0], "gsjc") if d else ""


def _build_bzsmz(jsfs, zfxs):
    parts = []
    if str(jsfs or "").strip():
        parts.append(f"结算方式：{jsfs}")
    if str(zfxs or "").strip():
        parts.append(f"备注说明：{zfxs}")
    return "\n".join(parts)


def _load_fksp_header(pid):
    rows = run_sql(
        f"select fklx,cwsp,cwgc,csmc,khh,yhzh,sfkp,fkxs,fkbh,tjjl,tjfk,tjzjl,tjcw,jbry,"
        f"chyrq,hzhj,seje,RMBkh,khmc,jsfs,zfxs,chrq "
        f"from fksp where rid='{_esc_sql(pid)}' limit 1"
    )
    return rows[0] if rows else None


def _update_print_status(session, pid, user_name):
    today = time.strftime("%Y-%m-%d")
    session.execute(text(f"update fksp set ywdy='有', dyrq='{_esc_sql(today)}' where rid='{_esc_sql(pid)}'"))


def _clear_payment_tasks(session, pid, username):
    if not pid:
        return
    res = user_task_delete("付款审批", pid, session, [username])
    if res.get("code") != 1:
        logger.warning(f"清除付款审批待办失败: {res.get('msg', '')}")


def _collect_cymx_from_sb(sb):
    """从采购付款 sb 汇总 zwpm/sjcy/jsfs/cgry（对照 Pascal gchk→gchksheet→cymxsheet）。"""
    zwpm, sjcy, jsfs, cgry = [], [], [], []
    fksb = ""
    if not sb:
        return zwpm, sjcy, jsfs, cgry, fksb
    d = run_sql(f"select rid, sfjq from gchk where sb='{_esc_sql(sb)}' limit 1")
    if not d:
        return zwpm, sjcy, jsfs, cgry, fksb
    if get_field_value(d[0], "sfjq") == "是":
        fksb = "/(已付确认)"
    father_rid = get_field_value(d[0], "rid")
    sheets = run_sql(f"select cywyzd, cght from gchksheet where pid='{_esc_sql(father_rid)}'")
    for sh in sheets or []:
        cywyzd = get_field_value(sh, "cywyzd")
        cght = get_field_value(sh, "cght")
        if cywyzd:
            rows = run_sql(f"select jsfs,zwpm,sjcy,ywrya from cymxsheet where cywyzd='{_esc_sql(cywyzd)}' limit 1")
            if rows:
                r = rows[0]
                for lst, key in ((zwpm, "zwpm"), (jsfs, "jsfs"), (sjcy, "sjcy"), (cgry, "ywrya")):
                    v = get_field_value(r, key)
                    if key == "sjcy":
                        v = _fmt_date(v)
                    if v and v not in lst:
                        lst.append(v)
        elif cght:
            rows = run_sql(f"select jsfs,zwpm,sjcy,ywrya from cymxsheet where cght='{_esc_sql(cght)}'")
            for r in rows or []:
                for lst, key in ((zwpm, "zwpm"), (jsfs, "jsfs"), (sjcy, "sjcy"), (cgry, "ywrya")):
                    v = get_field_value(r, key)
                    if key == "sjcy":
                        v = _fmt_date(v)
                    if v and v not in lst:
                        lst.append(v)
    return zwpm, sjcy, jsfs, cgry, fksb


def _export_normal_payment(pid, header, sheet5_row, ctx, seq_no):
    tpl = _template_path(ctx["base_path"], TEMPLATE_NORMAL)
    if not os.path.isfile(tpl):
        raise FileNotFoundError(f"模版文件缺失：{TEMPLATE_NORMAL}")

    fktt = get_field_value(sheet5_row, "fktt")
    ts = int(_to_float(sheet5_row.get("ts")))
    fkjc = _gsjc_for_fktt(fktt)
    cwgc = get_field_value(header, "cwgc") or get_field_value(header, "csmc")
    chyrq = _fmt_date(header.get("chyrq"))
    sfkp = get_field_value(header, "sfkp")
    hzhj1 = _to_float(header.get("hzhj"))
    seje1 = _to_float(header.get("seje"))

    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]

        _safe_write_center(ws, "A2", f"{fkjc}付 款 审 批 单")
        _safe_write_center(ws, "A3", chyrq)

        batch_mode = ts > 5
        # 表头只在 ts > 5 时显示（Delphi 逻辑）
        if batch_mode:
            _safe_write_center(ws, "A15", f"{fkjc} 分批出货登记表")
            for coord, val in (
                ("A16", "序号"),
                ("B16", "出货外销合同号"),
                ("F16", "数量"),
                ("G16", "金额"),
                ("I16", "业务员"),
            ):
                _safe_write_center(ws, coord, val)

        if sfkp == "是":
            sheet4_rows = run_sql(
                f"select lssqje,hzhj,seje,sb,fphm,gcfp from fkspsheet4 "
                f"where pid='{_esc_sql(pid)}' and fktt='{_esc_sql(fktt)}'"
            )
        else:
            sheet4_rows = run_sql(f"select lssqje,hzhj,seje,sb,fphm,gcfp from fkspsheet4 where pid='{_esc_sql(pid)}'")

        zwpm_all, sjcy_all, jsfs_all, cgry_all = [], [], [], []
        lssqje = hzhj = seje = 0.0
        i = 1
        for row in sheet4_rows or []:
            i += 1
            lssqje += _to_float(row.get("lssqje"))
            hzhj += _to_float(row.get("hzhj"))
            seje += _to_float(row.get("seje"))

            zp, sc, jf, cr, fksb = _collect_cymx_from_sb(get_field_value(row, "sb"))
            zwpm_all.extend(x for x in zp if x not in zwpm_all)
            sjcy_all.extend(x for x in sc if x not in sjcy_all)
            jsfs_all.extend(x for x in jf if x not in jsfs_all)
            cgry_all.extend(x for x in cr if x not in cgry_all)

            fphm = get_field_value(row, "fphm")
            gcfp = get_field_value(row, "gcfp")
            row_seje = _to_float(row.get("seje"))
            row_hzhj = _to_float(row.get("hzhj"))

            # 无论 ts 多少都写分批出货登记表（对照 Delphi）
            r = i + 15
            ws.range(f"B{r}:D{r}").merge()
            ws.range(f"E{r}:F{r}").merge()
            ws.range(f"G{r}:H{r}").merge()
            _safe_write_center(ws, f"A{r}", i - 1)
            _safe_write_center(ws, f"B{r}", fphm, _TEXT_FMT)
            _safe_write_center(ws, f"E{r}", f"工厂发票：{gcfp}{fksb}")
            _safe_write_center(ws, f"G{r}", row_seje, _MONEY_FMT)
            _set_cell_borders(ws, f"A{r}:I{r}")
            _autofit_row(ws, r)

            # ts <= 5 时同时写到主表（Delphi 逻辑）
            if not batch_mode:
                _safe_write_center(ws, f"F{i + 3}", fphm, _TEXT_FMT)
                _safe_write_center(ws, f"H{i + 3}", row_hzhj, _MONEY_FMT)

        # 合计行（始终写，不加边框）
        total_row = i + 16
        ws.range(f"E{total_row}:F{total_row}").merge()
        ws.range(f"G{total_row}:H{total_row}").merge()
        _safe_write_center(ws, f"E{total_row}", "合计：")
        _safe_write_center(ws, f"G{total_row}", seje if seje >= 1 else seje1, _MONEY_FMT)
        _autofit_row(ws, total_row)

        if hzhj < 1:
            hzhj = hzhj1
        if seje < 1:
            seje = seje1

        _safe_write_center(ws, "B4", cwgc)
        _safe_write_center(ws, "B5", get_field_value(header, "yhzh"))
        _safe_write_center(ws, "B6", get_field_value(header, "khh"))
        _safe_write_center(ws, "B7", hzhj, _MONEY_FMT)
        _safe_write_center(ws, "B8", lssqje, _MONEY_FMT)
        _safe_write_center(ws, "B9", seje, _MONEY_FMT)
        _safe_write_center(ws, "E7", _unique_join(zwpm_all))
        _safe_write_center(ws, "E8", _unique_join(sjcy_all))
        _safe_write_center(ws, "E9", get_field_value(header, "fkxs"))
        _safe_write_center(ws, "I13", _unique_join(cgry_all))
        _safe_write_center(ws, "I12", get_field_value(header, "jbry"))

        # 正常付款表自动行高
        for r in (4, 5, 6, 7, 8, 9, 10, 11, 12, 13):
            _autofit_row_all(ws, r)

        sigs = _collect_signature_paths(
            get_field_value(header, "tjjl"),
            get_field_value(header, "tjfk"),
            get_field_value(header, "tjzjl"),
            get_field_value(header, "tjcw"),
        )
        fkbh = get_field_value(header, "fkbh")
        try:
            ws.api.Rows(11).RowHeight = 30
        except Exception:
            pass
        for col, key, fallback in (
            ("B", "tjzjl", get_field_value(header, "tjzjl")),
            ("E", "tjfk", get_field_value(header, "tjfk")),
            ("G", "tjjl", get_field_value(header, "tjjl")),
            ("I", "tjcw", get_field_value(header, "tjcw")),
        ):
            _add_signature_or_text(ws, col, 11, sigs.get(key), fallback, watermark_text=fkbh)

        # 避免表格被分页切割：宽度适配一页
        try:
            ps = ws.api.PageSetup
            ps.Zoom = False
            ps.FitToPagesWide = 1
            ps.FitToPagesTall = False
        except Exception:
            pass

        today = time.strftime("%Y-%m-%d")
        out_stem = f"{cwgc}{today}正常付款表({seq_no})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(out_stem) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _export_prepay(pid, header, sheet5_row, ctx, seq_no):
    tpl = _template_path(ctx["base_path"], TEMPLATE_PREPAY)
    if not os.path.isfile(tpl):
        raise FileNotFoundError(f"模版文件缺失：{TEMPLATE_PREPAY}")

    fktt = get_field_value(sheet5_row, "fktt")
    fkjc = _gsjc_for_fktt(fktt)
    cwgc = get_field_value(header, "cwgc") or get_field_value(header, "csmc")
    chyrq = _fmt_date(header.get("chyrq"))
    hzhj1 = _to_float(header.get("hzhj"))
    seje1 = _to_float(header.get("seje"))
    sfkp = get_field_value(header, "sfkp")

    yjcqy = ""
    d = run_sql(f"select chrq from fksp where rid='{_esc_sql(pid)}' limit 1")
    if d:
        yjcqy = _fmt_date(d[0].get("chrq"))

    htrq, hthm, jsfs, cgry, yjcq, khmc = [], [], [], [], [], []
    rows = run_sql(f"select htrq,hthm,yjch1,cgry,jsfs,khmc from fkspsheet3 where pid='{_esc_sql(pid)}'")
    for r in rows or []:
        for lst, key in (
            (htrq, "htrq"),
            (jsfs, "jsfs"),
            (hthm, "hthm"),
            (cgry, "cgry"),
            (yjcq, "yjch1"),
            (khmc, "khmc"),
        ):
            v = get_field_value(r, key)
            if v and v not in lst:
                lst.append(v)

    hthmz = _unique_join(hthm)
    htrqz = _unique_join(htrq)
    jsfsz = _unique_join(jsfs)
    cgryz = _unique_join(cgry)
    yjcqz = _unique_join(yjcq)
    khmcz = _unique_join(khmc)

    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]

        _safe_write_center(ws, "A1", f"{fkjc}预付款申请表")
        _safe_write_center(ws, "A2", "'" + chyrq)  # 防止excel自动识别为日期导致格式混乱
        safe_write(ws, "A3", get_field_value(header, "fkbh"))
        _safe_write_center(ws, "B4", cwgc)
        _safe_write_center(ws, "B5", get_field_value(header, "yhzh"))
        _safe_write_center(ws, "B6", get_field_value(header, "khh"))
        _safe_write_center(ws, "B7", hthmz)
        _safe_write_center(ws, "I7", htrqz)
        _safe_write_center(ws, "B8", khmcz)
        _safe_write_center(ws, "I8", yjcqy or yjcqz)
        _safe_write_center(ws, "I10", get_field_value(header, "fkxs"))
        _safe_write_center(ws, "F7", hzhj1)
        _safe_write_center(ws, "F8", seje1)
        _safe_write_center(ws, "I11", f"经办人员：{get_field_value(header, 'jbry')}")
        _safe_write_center(ws, "I12", f"采购人员：{cgryz}")
        if sfkp == "是":
            ws.range("A9").api.Font.Bold = True
        _safe_write_center(ws, "A9", "开票情况")

        # 预付款表自动行高
        for r in (4, 5, 6, 7, 8, 9, 10, 11, 12):
            if r == 8:
                _autofit_row_all(ws, r, max_height=50)
            else:
                _autofit_row_all(ws, r)

        sigs = _collect_signature_paths(
            get_field_value(header, "tjjl"),
            get_field_value(header, "tjfk"),
            get_field_value(header, "tjzjl"),
            get_field_value(header, "tjcw"),
        )
        fkbh = get_field_value(header, "fkbh")
        try:
            ws.api.Rows(11).RowHeight = 30
        except Exception:
            pass
        for col, key, fallback in (
            ("B", "tjzjl", get_field_value(header, "tjzjl")),
            ("D", "tjfk", get_field_value(header, "tjfk")),
            ("F", "tjjl", get_field_value(header, "tjjl")),
            ("H", "tjcw", get_field_value(header, "tjcw")),
        ):
            _add_signature_or_text(ws, col, 11, sigs.get(key), fallback, watermark_text=fkbh)

        # 避免表格被分页切割：宽度适配一页
        try:
            ps = ws.api.PageSetup
            ps.Zoom = False
            ps.FitToPagesWide = 1
            ps.FitToPagesTall = False
        except Exception:
            pass

        today = time.strftime("%Y-%m-%d")
        out_stem = f"{cwgc}{today}预付款审批({seq_no})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(out_stem) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _gchk_fpje(bbfph, cwgc, fpwk):
    rows = run_sql(
        f"select sum(fpje) as fpje1, sum(yfhj) as yfhj1 from gchk "
        f"where wxfp='{_esc_sql(bbfph)}' and gcmc='{_esc_sql(cwgc)}' and fpwk='{_esc_sql(fpwk)}'"
    )
    if not rows:
        return 0.0
    if fpwk == "是":
        return _to_float(rows[0].get("yfhj1"))
    return _to_float(rows[0].get("fpje1"))


def _export_advance_payment(pid, header, sheet5_row, ctx, seq_no):
    tpl = _template_path(ctx["base_path"], TEMPLATE_ADVANCE)
    if not os.path.isfile(tpl):
        raise FileNotFoundError(f"模版文件缺失：{TEMPLATE_ADVANCE}")

    fktt = get_field_value(sheet5_row, "fktt")
    tqfps = int(_to_float(sheet5_row.get("tqfps")))
    fkjc = _gsjc_for_fktt(fktt)
    cwgc = get_field_value(header, "cwgc") or get_field_value(header, "csmc")
    csmc = get_field_value(header, "csmc")
    chyrq = _fmt_date(header.get("chyrq"))
    sfkp = get_field_value(header, "sfkp")
    fpwk = "否" if sfkp == "是" else "是"
    bzsmz = _build_bzsmz(get_field_value(header, "jsfs"), get_field_value(header, "zfxs"))
    khmcz1 = get_field_value(header, "khmc")
    RMBkh = get_field_value(header, "RMBkh")

    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]

        _safe_write_center(ws, "A1", f"{fkjc}提前付款备案表")
        _safe_write_center(ws, "A13", f"{fkjc}提前付款申请表")
        _safe_write_center(ws, "A14", chyrq)
        _safe_write_center(ws, "B2", csmc)
        safe_write(ws, "I2", get_field_value(header, "fkbh"))

        batch_mode = tqfps > 1
        if batch_mode:
            _safe_write_center(ws, "A25", f"{fkjc} 分批出货登记表")
            for coord, val in (
                ("A26", "序号"),
                ("B26", "出货外销合同号"),
                ("F26", "数量"),
                ("G26", "金额"),
                ("I26", "发票金额"),
            ):
                _safe_write_center(ws, coord, val)
            ws.range("B26:E26").merge()
            ws.range("G26:H26").merge()
            ws.range("I26:J26").merge()
            _set_cell_borders(ws, "A26:J26")

        rows = run_sql(
            f"select mjzj,wxzj,zje,seje,wxfp,hsfp,bhsfp,bbfph,zsl,ywry,cgry,zwpm,jsfs,sjcy,cpbh,htrq,yjch,fkrq,fkrq1 "
            f"from fkspsheet where pid='{_esc_sql(pid)}' and fktt='{_esc_sql(fktt)}'"
        )

        zwpm, sjcy, jsfs, cgry = [], [], [], []
        htrq, cpbh, wxfp, yjcq = [], [], [], []
        mjzj = wxzj = zje = seje = 0.0
        i = 1

        for row in rows or []:
            i += 1
            mjzj += _to_float(row.get("mjzj"))
            wxzj += _to_float(row.get("wxzj"))
            zje += _to_float(row.get("zje"))
            seje += _to_float(row.get("seje"))

            for lst, key in (
                (yjcq, "yjch"),
                (wxfp, "hsfp"),
                (cpbh, "cpbh"),
                (htrq, "htrq"),
                (zwpm, "zwpm"),
                (jsfs, "jsfs"),
                (sjcy, "sjcy"),
                (cgry, "cgry"),
            ):
                v = get_field_value(row, key)
                if key == "yjch":
                    v = _fmt_date(v)
                if v and v not in lst:
                    lst.append(v)

            fksb = ""
            if get_field_value(row, "fkrq") and get_field_value(row, "fkrq1"):
                fksb = "/(已付确认)"

            hsfp = get_field_value(row, "hsfp")
            bhsfp = get_field_value(row, "bhsfp")
            bbfph = bhsfp or hsfp
            inv_text = f"{hsfp}/{bhsfp}{fksb}" if bhsfp else f"{hsfp}{fksb}"
            row_seje = _to_float(row.get("seje"))
            fpje = _gchk_fpje(bbfph, cwgc, fpwk)

            if batch_mode:
                r = i + 25
                ws.range(f"B{r}:E{r}").merge()
                ws.range(f"G{r}:H{r}").merge()
                ws.range(f"I{r}:J{r}").merge()
                _safe_write_center(ws, f"A{r}", i - 1)
                _safe_write_center(ws, f"B{r}", inv_text)
                _safe_write_center(ws, f"F{r}", "")
                _safe_write_center(ws, f"G{r}", row_seje, _MONEY_FMT)
                _safe_write_center(ws, f"I{r}", fpje)
                _set_cell_borders(ws, f"A{r}:J{r}")
                _autofit_row(ws, r)

        if batch_mode and i > 1:
            total_row = i + 26
            last_data_row = i + 25
            ws.range(f"G{total_row}:H{total_row}").merge()
            _safe_write_center(ws, f"F{total_row}", "合计：")
            _safe_write_center(ws, f"G{total_row}", seje, _MONEY_FMT)
            _clear_cell_borders(ws, f"F{total_row}:J{total_row}")
            _autofit_row(ws, total_row)
            # 合计行合并后可能覆盖最后一条数据行的底部边框，重新补上
            _set_cell_borders(ws, f"A{last_data_row}:J{last_data_row}")

        wxfpz = _unique_join(wxfp)
        cpbhz = _unique_join(cpbh)
        htrqz = _unique_join(htrq)
        zwpmz = _unique_join(zwpm)
        sjcyz = _unique_join(sjcy)
        cgryz = _unique_join(cgry)
        yjcqz = _unique_join(yjcq)

        _safe_write_center(ws, "B3", cwgc)
        _safe_write_center(ws, "I3", wxfpz, _TEXT_FMT)
        _safe_write_center(ws, "B4", zwpmz)
        if RMBkh == "是" and mjzj > 0:
            _safe_write_center(ws, "I4", round((zje / mjzj) * 1000) / 1000)
        elif wxzj > 0:
            _safe_write_center(ws, "I4", round((zje / wxzj) * 1000) / 1000)
        _safe_write_center(ws, "B5", cpbhz)
        _safe_write_center(ws, "G5", zje)
        _safe_write_center(ws, "B6", khmcz1)
        _safe_write_center(ws, "G6", get_field_value(header, "fkxs"))
        _safe_write_center(ws, "J6", htrqz)
        _safe_write_center(ws, "J7", yjcqz)
        _safe_write_center(ws, "B8", bzsmz)
        _safe_write_center(ws, "J10", cgryz)

        _safe_write_center(ws, "B15", cwgc)
        _safe_write_center(ws, "B16", get_field_value(header, "yhzh"))
        _safe_write_center(ws, "I16", get_field_value(header, "fkbh"))
        _safe_write_center(ws, "B17", get_field_value(header, "khh"))
        _safe_write_center(ws, "I17", chyrq)
        _safe_write_center(ws, "B18", wxfpz, _TEXT_FMT)
        _safe_write_center(ws, "G18", zje)
        _safe_write_center(ws, "J18", yjcqz)
        _safe_write_center(ws, "B19", khmcz1)
        _safe_write_center(ws, "G19", seje)
        _safe_write_center(ws, "J19", get_field_value(header, "fkxs"))
        if sfkp == "是":
            ws.range("A20").api.Font.Bold = True
            _safe_write_center(ws, "A20", "是否开票")
        _safe_write_center(ws, "I20", sjcyz)

        sigs = _collect_signature_paths(
            get_field_value(header, "tjjl"),
            get_field_value(header, "tjfk"),
            get_field_value(header, "tjzjl"),
            get_field_value(header, "tjcw"),
        )
        fkbh = get_field_value(header, "fkbh")
        try:
            ws.api.Rows(9).RowHeight = 30
            ws.api.Rows(21).RowHeight = 30
        except Exception:
            pass
        for col, key, fallback in (
            ("B", "tjzjl", get_field_value(header, "tjzjl")),
            ("D", "tjfk", get_field_value(header, "tjfk")),
            ("F", "tjjl", get_field_value(header, "tjjl")),
            ("H", "tjcw", get_field_value(header, "tjcw")),
        ):
            _add_signature_or_text(ws, col, 9, sigs.get(key), fallback, watermark_text=fkbh)
            _add_signature_or_text(ws, col, 21, sigs.get(key), fallback, watermark_text=fkbh)
        _safe_write_center(ws, "J9", get_field_value(header, "jbry"))
        _safe_write_center(ws, "J21", get_field_value(header, "jbry"))

        # 备案表开票情况复选框
        if sfkp == "是":
            _try_set_checkbox(ws, "复选框 12", True)
            _try_set_checkbox(ws, "复选框 13", False)
            # 申请表是否开票复选框（尝试常见命名）
            _try_set_checkbox(ws, "复选框 14", True)
            _try_set_checkbox(ws, "复选框 15", False)
        else:
            _try_set_checkbox(ws, "复选框 12", False)
            _try_set_checkbox(ws, "复选框 13", True)
            _try_set_checkbox(ws, "复选框 14", False)
            _try_set_checkbox(ws, "复选框 15", True)

        # 自动行高
        for r in (3, 4, 5, 6, 7, 8, 10, 15, 16, 17, 18, 19, 20):
            _autofit_row_all(ws, r)

        # 确保金额列和合同号列宽度足够
        for col_letter in ("G", "I"):
            current = ws.range(f"{col_letter}:{col_letter}").column_width
            ws.range(f"{col_letter}:{col_letter}").column_width = max(current or 8, 16)

        # 避免表格被分页切割：宽度适配一页
        try:
            ps = ws.api.PageSetup
            ps.Zoom = False
            ps.FitToPagesWide = 1
            ps.FitToPagesTall = False
        except Exception:
            pass

        today = time.strftime("%Y-%m-%d")
        out_stem = f"{cwgc}{today}提前付款表({seq_no})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(out_stem) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _export_one_fksp(pid, ctx, session, user_name):
    header = _load_fksp_header(pid)
    if not header:
        return []
    if get_field_value(header, "cwsp") != "通过":
        return []
    logger.info(f"Exporting payment report for pid={pid}, fklx={get_field_value(header, 'fklx')}")
    fklx = get_field_value(header, "fklx")
    outputs = []
    sheet5_rows = run_sql(f"select fktt, ts, tqfps from fkspsheet5 where pid='{_esc_sql(pid)}'")
    if not sheet5_rows:
        return []

    seq = ctx.get("seq_counter", [0])
    for s5 in sheet5_rows:
        seq[0] += 1
        n = seq[0]
        try:
            if fklx == "正常付款":
                p = _export_normal_payment(pid, header, s5, ctx, n)
            elif fklx == "预付款":
                p = _export_prepay(pid, header, s5, ctx, n)
            elif fklx == "提前付款":
                p = _export_advance_payment(pid, header, s5, ctx, n)
            else:
                continue
            if p:
                outputs.append(p)
        except Exception:
            logger.error(trace_error())
            raise

    if outputs:
        _update_print_status(session, pid, user_name)
        _clear_payment_tasks(session, pid, user_name)
    return outputs


def _collect_pids(mode, rid, rids):
    out = []
    seen = set()

    def add(one):
        one = str(one or "").strip()
        if one and one not in seen:
            seen.add(one)
            out.append(one)

    if mode == "2":
        for x in rids or []:
            add(x)
        if not out and rid:
            add(rid)
    else:
        add(rid)
    return out


@any_route("/api/saier/payment_approval/report/export", methods=["POST", "GET"])
@require_token
async def view_saier_payment_approval_report_export(request):
    """
    付款审批 - 付款报表输出（对照 Delphi 付款报表输出）。

    请求 JSON：
    - mode: ``1`` 当前单条（默认），``2`` 批量（传 rids）
    - rid / rids: 付款审批主表 rid
    - tp: ``1`` 导出 PDF（默认），``2`` 导出 Excel（单条）或 zip（多条）
    """
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        if not _is_finance_user(user.username):
            return json_result(-1, "仅财务人员可导出付款报表")

        mode = str(j.get("mode", "1") or "1").strip()
        if mode != "2":
            mode = "1"
        tp = str(j.get("tp", "1") or "1").strip()
        if tp != "2":
            tp = "1"

        rid = j.get("rid", "")
        rids = j.get("rids") or []
        if isinstance(rids, str):
            rids = [rids] if rids else []

        pids = _collect_pids(mode, rid, rids)
        if not pids:
            return json_result(-1, "请指定要导出的付款审批记录")

        base_path = os.path.join(config.data_upload_path, "template")
        save_dir = config.tmp_path
        os.makedirs(save_dir, exist_ok=True)

        for stem in (TEMPLATE_NORMAL, TEMPLATE_PREPAY, TEMPLATE_ADVANCE):
            if not os.path.isfile(_template_path(base_path, stem)):
                return json_result(-1, f"模版文件缺失：{stem}.xlsx 或 {stem}.xls")

        want_pdf = tp == "1"
        ctx = {"base_path": base_path, "save_dir": save_dir, "want_pdf": want_pdf, "seq_counter": [0]}

        output_files = []
        for pid in pids:
            paths = _export_one_fksp(pid, ctx, s, user.username)
            for path in paths:
                if path and os.path.isfile(path):
                    output_files.append({"name": os.path.basename(path), "path": path})

        if not output_files:
            return json_result(-1, "未生成任何报表（需财务审批通过，且付款类型为正常付款/预付款/提前付款）")

        s.commit()

        if len(output_files) == 1:
            return json_result(1, "导出成功", output_files[0]["name"])

        zip_name = time.strftime("%Y%m%d%H%M%S") + "_payment_report.zip"
        zip_path = os.path.join(save_dir, zip_name)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in output_files:
                zf.write(f["path"], f["name"])
        return json_result(1, "导出成功", zip_name)

    except FileNotFoundError as e:
        s.rollback()
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
