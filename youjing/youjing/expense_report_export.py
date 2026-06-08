"""
费用申请报表导出（差旅费报销单、业务招待费、费用付款审批单、打样费、可思达付款审批单）。

对照原 Delphi 费用报表输出逻辑；模版目录：``data_upload_path/template/``。
"""

from any import *
from .__default__ import user_task_delete
from .model import *
from .payment import chinese_amount

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
            ws[coord].number_format = num_format
        ws[coord].value = value


def merge_cells(ws, range_addr):
    ws.range(range_addr).merge()


def unmerge_cells(ws, range_addr):
    ws.range(range_addr).unmerge()


def insert_row_at(ws, row):
    ws.range(row, row).api.EntireRow.Insert()


def delete_row_at(ws, row):
    ws.range(row, row).api.EntireRow.Delete()


def copy_row_style(ws, source_row, target_row):
    ws.range(source_row, source_row).copy()
    ws.range(target_row, target_row).paste(paste="formats")


def _add_picture_at(ws, coord, path, x_pad, y_pad, width, height):
    anchor = ws.range(coord)
    pic = ws.pictures.add(path, left=anchor.left + x_pad, top=anchor.top + y_pad)
    if width is not None:
        pic.width = width
    if height is not None:
        pic.height = height
    return pic


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


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default)
    if as_type is float:
        return float(value) if value not in ("", None) else 0.0
    if value is None:
        return ""
    return str(value).strip()


def _safe_filename(s):
    s = str(s or "").strip() or "export"
    for c in r'\/:*?"<>|':
        s = s.replace(c, "_")
    return s


def convert_excel_to_pdf(excel_path, output_dir=None):
    try:
        if output_dir is None:
            output_dir = os.path.dirname(excel_path)
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


# 模版文件名（放在 template 目录下）
TEMPLATE_CSD = "CSD付款审批单.xlsx"
TEMPLATE_TRAVEL = "差旅费报销单.xlsx"
TEMPLATE_ENTERTAIN = "业务招待费.xlsx"
TEMPLATE_PAYMENT = "费用付款审批单.xlsx"
TEMPLATE_SAMPLE = "打样费.xlsx"

REQUIRED_TEMPLATES = [TEMPLATE_CSD, TEMPLATE_TRAVEL, TEMPLATE_ENTERTAIN, TEMPLATE_PAYMENT, TEMPLATE_SAMPLE]

TRAVEL_TYPES = ("差旅费",)
ENTERTAIN_TYPES = ("业务招待费",)
NORMAL_PAY_TYPES = ("正常付款",)
SAMPLE_TYPES = ("打样费", "样品费")


def _set_cell_center(ws, coord):
    rng = ws.range(coord)
    area = rng.merge_area
    rows, cols = area.shape
    cell = area(1, 1) if rows * cols > 1 else rng
    api = cell.api
    api.WrapText = True
    api.HorizontalAlignment = -4108
    api.VerticalAlignment = -4108


def _record_eligible(row, sb, user_name):
    """对照 Delphi: (sb='1') or (jbry=当前用户 and 差旅费/业务招待费 and 审批通过)。"""
    cwsp = get_field_value(row, "cwsp")
    if cwsp not in ("通过", "通过返回"):
        return False
    if sb == "1":
        return True
    fklx = get_field_value(row, "fklx")
    jbry = get_field_value(row, "jbry")
    return jbry == user_name and fklx in TRAVEL_TYPES + ENTERTAIN_TYPES


def _format_sqrq1(dt_val):
    if dt_val is None or dt_val == "":
        return ""
    if hasattr(dt_val, "strftime"):
        s = dt_val.strftime("%Y-%m-%d")
    else:
        s = str(dt_val).strip()
        if " " in s:
            s = s.split()[0]
        if "T" in s and len(s) > 10:
            s = s[:10]
    if len(s) >= 10 and s[4] == "-" and s[7] == "-":
        return f"{s[0:4]}年{s[5:7]}月{s[8:10]}日"
    return s


def _resolve_hbdm(row):
    raw = get_field_value(row, "hbdm")
    if raw in ("RMB￥", "RMB"):
        code = "RMB"
    elif raw in ("USD", "USD$"):
        code = "USD"
    else:
        code = raw or "RMB"
    hbdmfh = ""
    d = run_sql(f"select bjdh from hbdm where bjdid='{code}' limit 1")
    if d:
        hbdmfh = get_field_value(d[0], "bjdh")
    return code, hbdmfh


def _build_bz2(row):
    bz1 = get_field_value(row, "bz1")
    hklx = get_field_value(row, "hklx")
    if get_field_value(row, "cwsp") == "通过返回":
        return f"{bz1}(通过返回)货款类型:{hklx}"
    return f"{bz1}货款类型:{hklx}"


def _ywbm(row):
    if get_field_value(row, "sfrbmfy") == "是":
        return get_field_value(row, "hsbm")
    return get_field_value(row, "ywbm")


def _wxfp_main(row):
    ysfp = get_field_value(row, "ysfp")
    if ysfp:
        return ysfp
    return get_field_value(row, "wxfp")


def _sig_path(cpbh):
    if not cpbh:
        return None
    rows = run_sql(f"select tpmc from tpzx where (cpbh='{cpbh}') and (LENGTH(tpmc) > 5) limit 1")
    if not rows:
        return None
    src = _parse_tpzx_tpmc_first_src(rows[0].get("tpmc"))
    return _tpzx_src_to_local_path(src)


def _collect_expense_signatures(tjjl, tjfk, tjzjl, tjcw):
    return {"tjjl": _sig_path(tjjl), "tjfk": _sig_path(tjfk), "tjzjl": _sig_path(tjzjl), "tjcw": _sig_path(tjcw)}


def _add_signature_or_text(ws, col_letter, row, img_path, text, watermark_text=None):
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
        _add_picture_fitted_to_cell(ws, coord, img_path, pad=2)
        return
    safe_write(ws, coord, text)
    _set_cell_center(ws, coord)


def _fill_signatures(ws, row, mapping, sig_paths, watermark_text=None):
    """mapping: [(col, sig_key, label_text), ...]"""
    for col, key, label in mapping:
        _add_signature_or_text(ws, col, row, sig_paths.get(key), label, watermark_text=watermark_text)


def _update_print_status(session, row, user_name):
    rid = get_field_value(row, "rid")
    sid = row.get("sid")
    today = time.strftime("%Y-%m-%d")
    dyrq = f"{user_name}:{today}"
    if rid:
        session.query(fysq).filter(fysq.rid == rid).update(
            {fysq.ywdy: "有", fysq.dyrq: dyrq}, synchronize_session=False
        )
    elif sid is not None:
        session.query(fysq).filter(fysq.sid == sid).update(
            {fysq.ywdy: "有", fysq.dyrq: dyrq}, synchronize_session=False
        )


def _clear_expense_tasks(session, row, username):
    """对照 Delphi 删除 sys_alarm；新系统用 user_task_delete 清除待办。"""
    rid = get_field_value(row, "rid")
    if not rid:
        return
    res = user_task_delete("费用申请", rid, session, [username])
    if res.get("code") != 1:
        logger.warning(f"清除费用申请待办失败: {res.get('msg', '')}")


def _load_fysqsheet(pid):
    return run_sql(f"select * from fysqsheet where pid='{pid}' order by seq, sid")


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


def _export_csd(row, ctx):
    if "可思达" not in get_field_value(row, "wfgs"):
        return None
    tpl = os.path.join(ctx["base_path"], TEMPLATE_CSD)
    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        sheet_names = [s.name for s in wb.sheets]
        ws = wb.sheets["审批单"] if "审批单" in sheet_names else wb.sheets[0]
        sprq1 = row.get("sprq1")
        if hasattr(sprq1, "strftime"):
            sprq1 = sprq1.strftime("%Y-%m-%d")
        else:
            sprq1 = get_field_value(row, "sprq1")
        safe_write(ws, "A3", sprq1)
        safe_write(ws, "B4", get_field_value(row, "cwgc"))
        safe_write(ws, "B5", get_field_value(row, "yhzh"))
        safe_write(ws, "B6", get_field_value(row, "khh"))
        seje1 = round(get_field_value(row, "seje", as_type=float), 2)
        safe_write(ws, "B10", seje1)
        fkbh = get_field_value(row, "fkbh")
        cwgc = get_field_value(row, "cwgc")
        name = f"可思达{cwgc}付款审批单({fkbh})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(name) + ".xlsx")
        logger.error(f"test excel_path: {excel_path}")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _export_travel(row, ctx):
    tpl = os.path.join(ctx["base_path"], TEMPLATE_TRAVEL)
    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]
        details = _load_fysqsheet(get_field_value(row, "rid"))
        seje1 = round(get_field_value(row, "seje", as_type=float), 2)
        bz2 = ctx["bz2"]
        ywbm = ctx["ywbm"]
        yjfy = get_field_value(row, "yzfy", as_type=float)
        blje = get_field_value(row, "blje", as_type=float)
        ghje = get_field_value(row, "ghje", as_type=float)
        fkbh = get_field_value(row, "fkbh")
        jbry = get_field_value(row, "jbry")

        safe_write(ws, "A3", ctx["sqrq1"])
        safe_write(ws, "B5", ywbm)
        safe_write(ws, "H6", bz2)
        safe_write(ws, "M6", bz2)
        safe_write(ws, "M6", "")

        # 模版：第 10 行主明细，11-13 行「其它」，第 14 行起为汇总/签字区
        template_row = 11
        first_detail_row = 10
        footer_start_row = 14
        min_detail_count = 4  # 1 行主明细 + 3 行其它

        def _ensure_other_row(detail_idx):
            """第 2 条明细起写入其它区；超出模版 3 行时才插行，使第 14 行汇总区随之下移。"""
            r = first_detail_row + detail_idx - 1
            if detail_idx > min_detail_count:
                insert_row_at(ws, r)
                copy_row_style(ws, template_row, r)
            return r

        i = 0
        for det in details:
            i += 1
            if i == 1:
                r = first_detail_row
                safe_write(ws, f"A{r}", get_field_value(det, "sj"))
                safe_write(ws, f"B{r}", get_field_value(det, "dd"))
                safe_write(ws, f"C{r}", get_field_value(det, "ts"))
                safe_write(ws, f"D{r}", get_field_value(det, "hfje"))
                safe_write(ws, f"E{r}", round(get_field_value(det, "seje", as_type=float), 2))
                safe_write(ws, f"G{r}", get_field_value(det, "btje"))
                safe_write(ws, f"H{r}", get_field_value(det, "gjfy"))
                safe_write(ws, f"I{r}", get_field_value(det, "czfy"))
                safe_write(ws, f"J{r}", get_field_value(det, "qtfy"))
            else:
                r = _ensure_other_row(i)
                parts = [f"{i - 1}、"]
                for label, fld in (("时间", "sj"), ("何地", "dd"), ("天数", "ts"), ("金额", "hfje"), ("报销", "seje")):
                    v = det.get(fld)
                    if v not in ("", None) and float(v or 0) != 0:
                        parts.append(f"{label}:{v};")
                sj_txt = "".join(parts)
                bt = "￥"
                if float(det.get("btts") or 0) > 0:
                    bt += f"天数:{det.get('btts')};"
                if float(det.get("btje") or 0) > 0:
                    bt += f"金额:{det.get('btje')};"
                safe_write(ws, f"B{r}", sj_txt)
                safe_write(ws, f"F{r}", bt)
                safe_write(ws, f"H{r}", get_field_value(det, "gjfy"))
                safe_write(ws, f"I{r}", get_field_value(det, "czfy"))
                safe_write(ws, f"J{r}", get_field_value(det, "qtfy"))

        while i < min_detail_count:
            i += 1
            _ensure_other_row(i)

        detail_count = max(i, min_detail_count)
        other_end_row = first_detail_row + detail_count - 1
        summary_row = footer_start_row + max(0, detail_count - min_detail_count)
        try:
            merge_cells(ws, f"A{template_row}:A{other_end_row}")
        except Exception:
            pass
        safe_write(ws, "A11", "其它")
        safe_write(ws, f"B{summary_row}", chinese_amount(seje1))
        _set_cell_center(ws, f"B{summary_row}")
        safe_write(ws, f"F{summary_row}", seje1)
        _set_cell_center(ws, f"F{summary_row}")
        safe_write(ws, f"H{summary_row}", yjfy)
        safe_write(ws, f"I{summary_row}", f"补领金额:{blje}")
        safe_write(ws, f"I{summary_row + 1}", f"归还金额:{ghje}")

        sig_row = summary_row + 2
        sig_paths = _collect_expense_signatures(
            get_field_value(row, "tjjl"),
            get_field_value(row, "tjfk"),
            get_field_value(row, "tjzjl"),
            get_field_value(row, "tjcw"),
        )
        _fill_signatures(
            ws,
            sig_row,
            [
                ("B", "tjzjl", get_field_value(row, "tjzjl")),
                ("E", "tjfk", get_field_value(row, "tjfk")),
                ("H", "tjcw", get_field_value(row, "tjcw")),
            ],
            sig_paths,
            watermark_text=fkbh,
        )
        safe_write(ws, f"J{sig_row + 1}", f"报销人:{jbry}")
        _set_cell_center(ws, f"J{sig_row + 1}")

        ctx["j1"] += 1
        name = f"{get_field_value(row, 'cwgc')}{time.strftime('%Y-%m-%d')}差旅费报销单({ctx['j1']})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(name) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _export_entertain(row, ctx):
    tpl = os.path.join(ctx["base_path"], TEMPLATE_ENTERTAIN)
    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]
        details = _load_fysqsheet(get_field_value(row, "rid"))
        seje1 = round(get_field_value(row, "seje", as_type=float), 2)
        khmcz1 = get_field_value(row, "khmc")
        fkbh = get_field_value(row, "fkbh")
        jbry = get_field_value(row, "jbry")

        safe_write(ws, "E3", ctx["sqrq1"])
        safe_write(ws, "B4", ctx["ywbm"])

        template_row = 6
        i = 0
        for det in details:
            i += 1
            r = 6 + i
            insert_row_at(ws, r)
            copy_row_style(ws, template_row, r)
            safe_write(ws, f"A{r}", get_field_value(det, "sj"))
            safe_write(ws, f"B{r}", khmcz1)
            safe_write(ws, f"C{r}", get_field_value(det, "rs"))
            safe_write(ws, f"D{r}", get_field_value(det, "dd"))
            safe_write(ws, f"E{r}", round(get_field_value(det, "seje", as_type=float), 2))
            safe_write(ws, f"F{r}", get_field_value(det, "ptry"))
            safe_write(ws, f"G{r}", get_field_value(det, "fyxq"))

        while i < 4:
            i += 1
            r = 6 + i
            insert_row_at(ws, r)
            copy_row_style(ws, template_row, r)

        delete_row_at(ws, template_row)

        summary_row = 6 + i + 1
        safe_write(ws, f"B{summary_row}", chinese_amount(seje1))
        _set_cell_center(ws, f"B{summary_row}")
        safe_write(ws, f"F{summary_row}", seje1)
        _set_cell_center(ws, f"F{summary_row}")

        sig_row = summary_row + 2
        sig_paths = _collect_expense_signatures(
            get_field_value(row, "tjjl"),
            get_field_value(row, "tjfk"),
            get_field_value(row, "tjzjl"),
            get_field_value(row, "tjcw"),
        )
        _fill_signatures(
            ws,
            sig_row,
            [
                ("B", "tjzjl", get_field_value(row, "tjzjl")),
                ("F", "tjfk", get_field_value(row, "tjfk")),
                ("D", "tjcw", get_field_value(row, "tjcw")),
            ],
            sig_paths,
            watermark_text=fkbh,
        )
        safe_write(ws, f"G{sig_row}", f"报销人:{jbry}")
        _set_cell_center(ws, f"G{sig_row}")

        ctx["j1"] += 1
        name = f"{get_field_value(row, 'cwgc')}{time.strftime('%Y-%m-%d')}业务招待费({ctx['j1']})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(name) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _write_invoice_detail_block(ws, details, header_row=13):
    """费用付款审批单 / 打样费 明细区。循环写数据，最后一次性加外边框。"""
    i = 0
    for det in details:
        i += 1
        r = header_row + i
        if i == 1:
            merge_cells(ws, f"D{header_row}:E{header_row}")
            safe_write(ws, f"D{header_row}", "外销发票号")
            merge_cells(ws, f"F{header_row}:G{header_row}")
            safe_write(ws, f"F{header_row}", "跟单人员")
            safe_write(ws, f"H{header_row}", "审请金额")
        wx = get_field_value(det, "ysfp") or get_field_value(det, "wxfp")
        merge_cells(ws, f"D{r}:E{r}")
        safe_write(ws, f"D{r}", wx, num_format="@")
        merge_cells(ws, f"F{r}:G{r}")
        safe_write(ws, f"F{r}", get_field_value(det, "gdry"))
        safe_write(ws, f"H{r}", round(get_field_value(det, "seje", as_type=float), 2))

    if i:
        rng = ws.range(f"D{header_row}:H{header_row + i}").api
        for b in (7, 8, 9, 10, 11, 12):  # 左、上、下、右、内竖、内横
            bd = rng.Borders(b)
            bd.LineStyle = 1
            bd.Weight = 4
            bd.Color = 0
    return i


def _export_normal_payment(row, ctx):
    tpl = os.path.join(ctx["base_path"], TEMPLATE_PAYMENT)
    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]
        gsjc = ctx.get("gsjc", "")
        hbdmfh = ctx["hbdmfh"]
        rmbkh = get_field_value(row, "RMBkh")
        fkbh = get_field_value(row, "fkbh")
        jbry = get_field_value(row, "jbry")
        chyrq = row.get("yjcq")
        if hasattr(chyrq, "strftime"):
            chyrq = chyrq.strftime("%Y-%m-%d")
        else:
            chyrq = get_field_value(row, "yjcq")

        safe_write(ws, "B2", f"{gsjc}付 款 审 批 单")
        safe_write(ws, "A3", ctx["sqrq1"])
        safe_write(ws, "G5", _wxfp_main(row))
        ws.range("G5").number_format = "@"
        if rmbkh == "是":
            safe_write(ws, "I5", get_field_value(row, "fpje", as_type=float), "￥#,##0.00")
        else:
            safe_write(ws, "I5", get_field_value(row, "fpje", as_type=float), f'"{hbdmfh}"#,##0.00')
        safe_write(ws, "C4", get_field_value(row, "cwgc"))
        safe_write(ws, "C5", get_field_value(row, "yhzh"))
        safe_write(ws, "C6", get_field_value(row, "khh"))
        safe_write(ws, "F6", get_field_value(row, "khmc"))
        safe_write(ws, "F8", chyrq)
        safe_write(ws, "F9", get_field_value(row, "fkxs"))
        fmt = f'"{hbdmfh}"#,##0.00'
        for cell in ("C8", "C9", "C10"):
            ws.range(cell).number_format = fmt
        safe_write(ws, "C8", get_field_value(row, "htje1", as_type=float))
        safe_write(ws, "C9", get_field_value(row, "yfdj", as_type=float))
        seje1 = round(get_field_value(row, "seje", as_type=float), 2)
        safe_write(ws, "C10", seje1)

        sig_paths = _collect_expense_signatures(
            get_field_value(row, "tjjl"),
            get_field_value(row, "tjfk"),
            get_field_value(row, "tjzjl"),
            get_field_value(row, "tjcw"),
        )
        sig_row = 11
        _fill_signatures(
            ws,
            sig_row,
            [
                ("B", "tjzjl", get_field_value(row, "tjzjl")),
                ("D", "tjfk", get_field_value(row, "tjfk")),
                ("F", "tjjl", get_field_value(row, "tjjl")),
                ("H", "tjcw", get_field_value(row, "tjcw")),
            ],
            sig_paths,
            watermark_text=fkbh,
        )
        safe_write(ws, "I11", f"经办人:{jbry}")

        details = run_sql(f"select * from fysqsheet where pid='{get_field_value(row, 'rid')}' order by wxfp")
        i = _write_invoice_detail_block(ws, details, header_row=13)
        remark_row = 15 + max(i, 0)
        safe_write(ws, f"E{remark_row}", "备     注")
        merge_cells(ws, f"F{remark_row}:I{remark_row}")
        safe_write(ws, f"F{remark_row}", ctx["bz2"])
        safe_write(ws, f"J{remark_row}", ctx["bz2"])

        ctx["j1"] += 1
        name = f"{get_field_value(row, 'cwgc')}{time.strftime('%Y-%m-%d')}费用付款审批单({ctx['j1']})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(name) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        logger.error(f"test-pdf_path: {pdf_path}, {excel_path}")
        return pdf_path or excel_path
    finally:
        app.quit()


def _export_sample_fee(row, ctx):
    tpl = os.path.join(ctx["base_path"], TEMPLATE_SAMPLE)
    app = _start_excel_app()
    try:
        wb = app.books.open(tpl)
        ws = wb.sheets[0]
        gsjc = ctx.get("gsjc", "")
        fklx = get_field_value(row, "fklx")
        hbdmfh = ctx["hbdmfh"]
        title = f"{gsjc}打样费申请表" if fklx == "打样费" else f"{gsjc}样品费申请表"
        seje1 = round(get_field_value(row, "seje", as_type=float), 2)
        fkbh = get_field_value(row, "fkbh")
        jbry = get_field_value(row, "jbry")
        chyrq = row.get("yjcq")
        if hasattr(chyrq, "strftime"):
            chyrq = chyrq.strftime("%Y-%m-%d")
        else:
            chyrq = get_field_value(row, "yjcq")

        safe_write(ws, "B1", title)
        _set_cell_center(ws, "B1")
        safe_write(ws, "A2", ctx["sqrq1"])
        safe_write(ws, "C3", get_field_value(row, "cwgc"))
        safe_write(ws, "C4", get_field_value(row, "yhzh"))
        safe_write(ws, "I4", _wxfp_main(row))
        ws.range("I4").number_format = "@"
        safe_write(ws, "C5", get_field_value(row, "khh"))
        safe_write(ws, "I5", get_field_value(row, "khmc"))
        safe_write(ws, "F6", get_field_value(row, "zwpm"))
        safe_write(ws, "I6", get_field_value(row, "yjchl", as_type=float))
        safe_write(ws, "C7", ctx["ywbm"])
        safe_write(ws, "F7", get_field_value(row, "sl", as_type=float))
        safe_write(ws, "C8", get_field_value(row, "sfrbmfy"))
        safe_write(ws, "F8", get_field_value(row, "sfsh"))
        safe_write(ws, "I8", chyrq)
        fmt = f'"{hbdmfh}"#,##0.00'
        ws.range("C6").number_format = fmt
        ws.range("I7").number_format = fmt
        safe_write(ws, "C6", seje1)
        safe_write(ws, "I7", get_field_value(row, "ysdj"))
        safe_write(ws, "C9", ctx["bz2"])
        safe_write(ws, "N9", ctx["bz2"])

        sig_paths = _collect_expense_signatures(
            get_field_value(row, "tjjl"),
            get_field_value(row, "tjfk"),
            get_field_value(row, "tjzjl"),
            get_field_value(row, "tjcw"),
        )
        sig_row = 10
        _fill_signatures(
            ws,
            sig_row,
            [
                ("B", "tjzjl", get_field_value(row, "tjzjl")),
                ("D", "tjfk", get_field_value(row, "tjfk")),
                ("F", "tjjl", get_field_value(row, "tjjl")),
                ("H", "tjcw", get_field_value(row, "tjcw")),
            ],
            sig_paths,
            watermark_text=fkbh,
        )
        safe_write(ws, "I10", f"经办人:{jbry}")

        details = run_sql(f"select * from fysqsheet where pid='{get_field_value(row, 'rid')}' order by wxfp")
        _write_invoice_detail_block(ws, details, header_row=13)

        ctx["j1"] += 1
        label = "打样费" if fklx == "打样费" else "样品费"
        name = f"{get_field_value(row, 'cwgc')}{time.strftime('%Y-%m-%d')}{label}({ctx['j1']})"
        excel_path = os.path.join(ctx["save_dir"], _safe_filename(name) + ".xlsx")
        _, pdf_path = _save_workbook_as_pdf(wb, excel_path, ctx["save_dir"], ctx["want_pdf"])
        return pdf_path or excel_path
    finally:
        app.quit()


def _gsjc_for_wfgs(wfgs_name):
    d = run_sql(f"select gsjc from wfgs where wfgs='{wfgs_name}' limit 1")
    return get_field_value(d[0], "gsjc") if d else ""


def _export_one_record(row, ctx, session, user_name):
    fklx = get_field_value(row, "fklx")
    cwsp = get_field_value(row, "cwsp")
    if cwsp not in ("通过", "通过返回"):
        return None

    ctx = dict(ctx)
    ctx["bz2"] = _build_bz2(row)
    ctx["ywbm"] = _ywbm(row)
    ctx["sqrq1"] = _format_sqrq1(row.get("sqrq1"))
    _, ctx["hbdmfh"] = _resolve_hbdm(row)
    ctx["gsjc"] = _gsjc_for_wfgs(get_field_value(row, "wfgs"))

    out_path = None
    if "可思达" in get_field_value(row, "wfgs") and ctx.get("has_csd"):
        try:
            out_path = _export_csd(row, ctx)
        except Exception:
            logger.error(trace_error())

    if fklx in TRAVEL_TYPES:
        out_path = _export_travel(row, ctx) or out_path
    elif fklx in ENTERTAIN_TYPES:
        out_path = _export_entertain(row, ctx) or out_path
    elif fklx in NORMAL_PAY_TYPES:
        out_path = _export_normal_payment(row, ctx) or out_path
    elif fklx in SAMPLE_TYPES:
        out_path = _export_sample_fee(row, ctx) or out_path

    if out_path:
        _update_print_status(session, row, user_name)
        _clear_expense_tasks(session, row, user_name)
    return out_path


def collect_eligible_records(mode, rid, rids, sb, user_name):
    logger.error(f"test-collect_eligible_records: {mode}, {rid}, {rids}, {sb}, {user_name}")
    keys = []
    seen = set()

    def add_row(row):
        key = get_field_value(row, "rid") or str(row.get("sid", ""))
        if not key or key in seen:
            return
        if not _record_eligible(row, sb, user_name):
            return
        seen.add(key)
        keys.append(row)

    if mode == "2":
        id_list = rids if rids else ([rid] if rid else [])
        for one_rid in id_list:
            if not one_rid:
                continue
            d = run_sql(f"select * from fysq where rid='{one_rid}' limit 1")
            if d:
                add_row(d[0])
    else:
        if not rid:
            return []
        d = run_sql(f"select * from fysq where rid='{rid}' limit 1")
        logger.error(f"test-d: {d}")
        if d:
            add_row(d[0])
    return keys


@any_route("/api/saier/expense/report/export", methods=["POST", "GET"])
@require_token
async def view_saier_expense_report_export(request):
    """
    费用申请报表导出。

    请求 JSON：
    - mode: ``1`` 当前单条（默认），``2`` 批量（传 rids）
    - rid / rids: 记录 rid
    - tp: ``1`` 仅 PDF（默认），``2`` 批量 PDF（打包 zip）
    """
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        mode = j.get("mode", "1")
        if mode != "2":
            mode = "1"
        tp = j.get("tp", "1")
        if tp != "2":
            tp = "1"
        rid = j.get("rid", "")
        rids = j.get("rids") or []
        if isinstance(rids, str):
            rids = [rids] if rids else []

        user_name = user.username
        sb = ""
        d = run_sql(f"select * from sys_user where username='{user.username}' and position like '%财务%'")
        logger.error(f"test-d: {d}, {user.username}")
        if d:
            sb = "1"
        records = collect_eligible_records(mode, rid, rids, sb, user_name)
        logger.error(f"test-records: {records}")
        if not records:
            return json_result(-1, "没有符合导出条件的费用申请（需财务审批通过，或非财务本人差旅/招待费）")

        base_path = os.path.join(config.data_upload_path, "template")
        save_dir = config.tmp_path
        os.makedirs(save_dir, exist_ok=True)

        for tpl in REQUIRED_TEMPLATES:
            if not os.path.isfile(os.path.join(base_path, tpl)):
                return json_result(-1, f"模版文件缺失：{tpl}")

        has_csd = any("可思达" in get_field_value(r, "wfgs") for r in records)
        ctx = {"base_path": base_path, "save_dir": save_dir, "want_pdf": True, "j1": 0, "has_csd": has_csd}

        output_files = []
        for row in records:
            path = _export_one_record(row, ctx, s, user_name)
            logger.error(f"test-path: {path}")
            if path and os.path.isfile(path):
                output_files.append({"name": os.path.basename(path), "path": path})

        if not output_files:
            return json_result(-1, "未生成任何报表，请检查模版与数据")

        if len(output_files) == 1:
            s.commit()
            return json_result(1, "导出成功", output_files[0]["name"])

        zip_name = time.strftime("%Y%m%d%H%M%S") + "_expense_report.zip"
        zip_path = os.path.join(save_dir, zip_name)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in output_files:
                zf.write(f["path"], f["name"])

        s.commit()
        return json_result(1, "导出成功", zip_name)

    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
