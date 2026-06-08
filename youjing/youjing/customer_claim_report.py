import textwrap

from any import *
from .model import *
from datetime import datetime
import json
import os
import subprocess
import sys
import time

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

_CLAIM_PRINT_AREA = "A1:G11"


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


def _add_picture_at(ws, coord, path, x_pad, y_pad, width, height):
    anchor = ws.range(coord)
    pic = ws.pictures.add(path, left=anchor.left + x_pad, top=anchor.top + y_pad)
    if width is not None:
        pic.width = width
    if height is not None:
        pic.height = height
    return pic


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


def _collect_signature_paths(tjjl, tjzj, zjl):
    out = {"zjl": None, "tjzj": None, "tjjl": None}
    for key, cpbh in (("tjjl", tjjl), ("tjzj", tjzj), ("zjl", zjl)):
        if not cpbh:
            continue
        rows = run_sql(f"select tpmc from tpzx where (cpbh='{cpbh}') and (LENGTH(tpmc) > 5)")
        if not rows or rows[0].get("tpmc", "") in ("", None) or str(rows[0].get("tpmc", "")).strip() == "[]":
            continue
        src = _parse_tpzx_tpmc_first_src(rows[0].get("tpmc"))
        path = _tpzx_src_to_local_path(src)
        if path:
            out[key] = path
    return out


def _set_cell_center(ws, coord):
    rng = ws.range(coord)
    area = rng.merge_area
    rows, cols = area.shape
    cell = area(1, 1) if rows * cols > 1 else rng
    api = cell.api
    api.WrapText = True
    api.HorizontalAlignment = -4108
    api.VerticalAlignment = -4108


def _add_signature_image(ws, col_letter, row, abs_path, pad=0):
    if not abs_path or not os.path.isfile(abs_path):
        return False
    coord = f"{col_letter}{row}"
    area = ws.range(coord).merge_area
    pic = ws.pictures.add(abs_path, left=area.left, top=area.top)
    if pic.width and pic.height:
        scale = min(1, (area.width - pad * 2) / pic.width, (area.height - pad * 2) / pic.height)
        if scale < 1:
            pic.width *= scale
    pic.left = area.left + (area.width - pic.width) / 2
    pic.top = area.top + (area.height - pic.height) / 2
    return pic


def fill_signature_cells(ws, sig_paths, labels, img_row, sqr_text):
    for col, key in (("B", "zjl"), ("D", "tjzj"), ("F", "tjjl")):
        coord = f"{col}{img_row}"
        if not _add_signature_image(ws, col, img_row, sig_paths.get(key)):
            safe_write(ws, coord, labels.get(key, ""))
            _set_cell_center(ws, coord)
    safe_write(ws, f"G{img_row}", f"经办人：{sqr_text}")
    _set_cell_center(ws, f"G{img_row}")


def _print_area_range(ws):
    pa = ws.api.PageSetup.PrintArea
    if not pa:
        return _CLAIM_PRINT_AREA
    return str(pa).split("!")[-1].replace("$", "")


def _capture_page_setup(ws):
    ps = ws.api.PageSetup
    zoom = ps.Zoom
    fit_w = ps.FitToPagesWide
    fit_h = ps.FitToPagesTall
    return {
        "print_area": _print_area_range(ws),
        "scale": zoom if zoom else None,
        "orientation": ps.Orientation,
        "paperSize": ps.PaperSize,
        "fitToWidth": fit_w,
        "fitToHeight": fit_h,
        "fitToPage": bool(fit_w or fit_h),
        "margins": (ps.LeftMargin, ps.RightMargin, ps.TopMargin, ps.BottomMargin, ps.HeaderMargin, ps.FooterMargin),
    }


def _apply_page_setup_snapshot(ws, snap):
    ps = ws.api.PageSetup
    ps.PrintArea = snap.get("print_area") or _CLAIM_PRINT_AREA
    if snap.get("fitToPage"):
        ps.Zoom = False
        if snap.get("fitToWidth") is not None:
            ps.FitToPagesWide = snap.get("fitToWidth")
        if snap.get("fitToHeight") is not None:
            ps.FitToPagesTall = snap.get("fitToHeight")
    else:
        val = snap.get("scale")
        if val is not None:
            ps.Zoom = val
    for key, attr in (("orientation", "Orientation"), ("paperSize", "PaperSize")):
        val = snap.get(key)
        if val is not None:
            setattr(ps, attr, val)
    m = snap.get("margins")
    if m:
        ps.LeftMargin, ps.RightMargin, ps.TopMargin, ps.BottomMargin, ps.HeaderMargin, ps.FooterMargin = m


def _finalize_sheet_for_pdf(ws, snap, max_row=11):
    for r in range(1, max_row + 1):
        ws.range(f"I{r}").value = None
    ws.range("I:I").api.EntireColumn.Hidden = True
    if snap:
        _apply_page_setup_snapshot(ws, snap)


def _trim_merge_workbook(wb):
    while len(wb.sheets) > 2:
        wb.sheets[2].delete()


def _factory_template_ws(wb):
    """合并模版第 2 张为工厂版式（与老系统「优景赔款说明表合并」一致，不引用其它 xlsx）。"""
    if len(wb.sheets) < 2:
        return None
    return wb.sheets[1]


def _prepare_merge_workbook(wb, gong_count):
    """财务合并：保留客户+工厂模版，按工厂条数复制工厂表，返回页面设置快照。"""
    _trim_merge_workbook(wb)
    customer_snap = _capture_page_setup(wb.sheets[0])
    factory_snap = _capture_page_setup(wb.sheets[1]) if len(wb.sheets) > 1 else None
    if gong_count > 0:
        factory_tpl = _factory_template_ws(wb)
        if factory_tpl is None:
            return customer_snap, factory_snap, "合并模版须至少包含两个工作表（客户、工厂）"
        while len(wb.sheets) < 1 + gong_count:
            factory_tpl.copy(after=wb.sheets[-1])
    return customer_snap, factory_snap, None


def _format_date(v):
    if v is None or v == "":
        return ""
    if hasattr(v, "strftime"):
        return v.strftime("%Y-%m-%d")
    s = str(v).strip()
    if not s:
        return ""
    if " " in s:
        return s.split()[0]
    if "T" in s and len(s) > 10:
        return s[:10]
    return s


def _fill_factory_claim_sheet(ws, grow, khmc_g):
    hbdm = get_field_value(grow, "hbdm")
    rmbkh = "是" if "RMB" in hbdm else "否"

    sccj = get_field_value(grow, "sccj")
    pzrq = _format_date(grow.get("pzrq"))

    fphm = get_field_value(grow, "cght1")
    pkhj1 = get_field_value(grow, "cgje")
    if pkhj1 in ("", None):
        pkhj1 = get_field_value(grow, "pkhj1")

    sqr = get_field_value(grow, "sqr")
    spje = get_field_value(grow, "pfhj")
    if spje in ("", None):
        spje = get_field_value(grow, "spje")

    yjrq = sqr

    spyy = "索赔原因:" + get_field_value(grow, "spyy") + "过错原因:" + get_field_value(grow, "gcyy")
    gccljg = get_field_value(grow, "cljg")
    ffhjy = get_field_value(grow, "jjjy")

    khmc = str(khmc_g or "").strip()

    khcljg = ""
    fphm_link = get_field_value(grow, "fphm")
    if fphm_link:
        sql_khsp = f"select khcljg,hbdm,spje,sjpf from khsp where ajbh='{fphm_link}'"
        rows = run_sql(sql_khsp)
        if rows:
            r1 = rows[0]
            khcljg = (
                get_field_value(r1, "khcljg")
                + ",合计"
                + get_field_value(r1, "hbdm")
                + get_field_value(r1, "sjpf")
                + "."
            )

    tjjl, tjzj, zjl = _bmjl_and_zx(sqr)
    sig_labels = {"zjl": zjl, "tjzj": tjzj, "tjjl": tjjl}
    sig_paths = _collect_signature_paths(tjjl, tjzj, zjl)

    safe_write(ws, "G2", "'" + pzrq)

    safe_write(ws, "A3", "采购合同号码：")
    safe_write(ws, "C3", fphm)
    safe_write(ws, "H3", fphm)
    # ws.range("C3").row_height = 33
    # 合并单元格 AutoFit 对行高和列宽都识别不全，借助非合并的 H 列来算
    cell = ws.range("C3")
    area = cell.merge_area
    area(1, 1).api.WrapText = True
    # # 用 H 列（非合并）辅助算出合适的列宽，再同步给 C 列
    # ws.range("H:H").api.EntireColumn.AutoFit()
    # fitted_width = ws.range("H:H").column_width
    # ws.range("C:C").column_width = max(fitted_width, 12)
    # 手动计算行高
    content = str(fphm or "")
    font_size = area(1, 1).api.Font.Size or 11
    area_width = area.width or cell.width or 100
    char_width = font_size * 0.55
    chars_per_line = max(1, int(area_width / char_width))
    lines = content.split("\n")
    total_lines = sum(max(1, (len(line) + chars_per_line - 1) // chars_per_line) for line in lines) + 1
    ws.range("3:3").row_height = max(33, total_lines * (font_size + 4))
    ws.range("C3").api.VerticalAlignment = -4160  # xlVAlignTop

    safe_write(ws, "H3", "")

    safe_write(ws, "G3", yjrq)
    safe_write(ws, "D4", pkhj1)

    if rmbkh == "是":
        safe_write(ws, "G4", spje, "￥#,##0.00")
    else:
        safe_write(ws, "G4", spje, "$#,##0.00")

    safe_write(ws, "C5", khmc)
    safe_write(ws, "C6", sccj)

    safe_write(ws, "C7", spyy)
    safe_write(ws, "I7", spyy)
    ws.range("7:7").row_height = 117.75
    safe_write(ws, "I7", "")

    safe_write(ws, "C8", khcljg)
    safe_write(ws, "I8", khcljg)
    ws.range("8:8").row_height = 189.75
    safe_write(ws, "I8", "")

    safe_write(ws, "C9", gccljg)
    safe_write(ws, "I9", gccljg)
    ws.range("9:9").row_height = 175.5
    safe_write(ws, "I9", "")

    safe_write(ws, "C10", ffhjy)
    safe_write(ws, "I10", ffhjy)
    ws.range("10:10").row_height = 97.5
    safe_write(ws, "I10", "")

    fill_signature_cells(ws, sig_paths, sig_labels, 11, sqr)


def _fill_customer_claim_sheet(ws, row0, sig_paths, sig_labels, sqr):
    fphm = get_field_value(row0, "fphm")
    pkhj1 = get_field_value(row0, "pkhj1")
    yjrq = get_field_value(row0, "yjrq")
    pzrq = _format_date(row0.get("pzrq"))
    khmc = get_field_value(row0, "khmc")
    spje = get_field_value(row0, "sjpf")
    rmbkh = "是" if "RMB" in get_field_value(row0, "hbdm") else "否"
    spyy = get_field_value(row0, "spyy")
    hbdm = get_field_value(row0, "hbdm")
    sjpf = get_field_value(row0, "sjpf")
    khcljg = f"{get_field_value(row0, 'khcljg')},合计{hbdm}{sjpf}."
    gccljg = f"{get_field_value(row0, 'gccljg')}\n{get_field_value(row0, 'zygc')}"
    ffhjy = get_field_value(row0, "ffhjy")

    safe_write(ws, "G2", "'" + pzrq)
    safe_write(ws, "C3", fphm)
    safe_write(ws, "H3", fphm)
    ws.range("3:3").row_height = 33

    safe_write(ws, "H3", "")
    safe_write(ws, "G3", yjrq)
    safe_write(ws, "D4", pkhj1)
    if rmbkh == "是":
        safe_write(ws, "G4", spje, "￥#,##0.00")
    else:
        safe_write(ws, "G4", spje, "$#,##0.00")
    safe_write(ws, "C5", khmc)
    safe_write(ws, "C6", spyy)
    safe_write(ws, "I6", spyy)
    ws.range("6:6").row_height = 117.75
    safe_write(ws, "I6", "")
    safe_write(ws, "C7", khcljg)
    safe_write(ws, "I7", khcljg)
    ws.range("7:7").row_height = 189.75
    safe_write(ws, "I7", "")
    safe_write(ws, "C8", gccljg)
    safe_write(ws, "I8", gccljg)
    ws.range("8:8").row_height = 175.5
    safe_write(ws, "I8", "")
    safe_write(ws, "C9", ffhjy)
    safe_write(ws, "I9", ffhjy)
    ws.range("9:9").row_height = 97.5
    safe_write(ws, "I9", "")
    fill_signature_cells(ws, sig_paths, sig_labels, 10, sqr)


def _bmjl_and_zx(sqr_login):
    tjjl = tjzj = zjl = ""
    if not sqr_login:
        return tjjl, tjzj, zjl
    d = run_sql(f"select bmjl from ywrybiao where yhm='{sqr_login}'")
    if d:
        tjjl = get_field_value(d[0], "bmjl")
    if tjjl:
        d = run_sql(f"select wb2,wb3 from zx where ly='付款审批' and wb1='{tjjl}'")
        if d:
            tjzj = get_field_value(d[0], "wb2")
            zjl = get_field_value(d[0], "wb3")
    return tjjl, tjzj, zjl


@any_route("/api/saier/customer/claim/report", methods=["POST", "GET"])
@require_token
async def view_saier_customer_claim_report(request):
    s = Session()
    user = request.current_user
    j = await request.json()

    app = None
    wb = None
    try:
        rid = j.get("rid", "")
        if not rid:
            return json_result(-1, "参数缺失：rid")

        save_path = config.tmp_path
        os.makedirs(save_path, exist_ok=True)
        base_path = os.path.join(config.data_upload_path, "template")

        khsp_d = run_sql(f"select * from khsp where rid='{rid}' and shjg='通过'")
        if not khsp_d:
            return json_result(-1, "未找到相关信息")
        row0 = khsp_d[0]
        ajbh = get_field_value(row0, "ajbh")

        d_link = run_sql(f"select fphm from gongcsp where fphm='{ajbh}'")
        cwsb = ""
        if d_link:
            d_fin = run_sql(f"select rid from sys_user where username='{user.username}' and position like '%财务%'")
            if d_fin:
                cwsb = "1"

        sqr = get_field_value(row0, "sqr")
        khmc = get_field_value(row0, "khmc")
        tjjl, tjzj, zjl = _bmjl_and_zx(sqr)
        sig_labels = {"zjl": zjl, "tjzj": tjzj, "tjjl": tjjl}
        sig_paths = _collect_signature_paths(tjjl, tjzj, zjl)

        gong_rows = []
        if cwsb == "1":
            gong_rows = run_sql(f"select * from gongcsp where fphm='{ajbh}' and shjg='通过'") or []

        template_path = os.path.join(base_path, "优景赔款说明表合并.xlsx" if cwsb == "1" else "优景赔款说明表.xlsx")
        if not os.path.exists(template_path):
            return json_result(-1, "模版文件缺失")

        app = xw.App(visible=False, add_book=False)
        app.display_alerts = False
        app.screen_updating = False
        wb = app.books.open(template_path)

        if cwsb == "1":
            customer_snap, factory_snap, merge_err = _prepare_merge_workbook(wb, len(gong_rows))
            if merge_err:
                return json_result(-1, merge_err)
            customer_ws = wb.sheets[0]
            _fill_customer_claim_sheet(customer_ws, row0, sig_paths, sig_labels, sqr)
            _finalize_sheet_for_pdf(customer_ws, customer_snap)
            for idx, grow in enumerate(gong_rows):
                wsg = wb.sheets[idx + 1]
                khmc_g = khmc
                khbh = get_field_value(grow, "khbh")
                if khbh:
                    kd = run_sql(f"select company_name from kh where kh_id='{khbh}'")
                    if kd:
                        khmc_g = get_field_value(kd[0], "company_name")
                time.sleep(0.5)
                _fill_factory_claim_sheet(wsg, grow, khmc_g)
                _finalize_sheet_for_pdf(wsg, factory_snap)
                time.sleep(0.05)
                grow_rid = get_field_value(grow, "rid")
                if ("U" in user.username) or ("JY" in user.username):
                    s.query(gongcsp).filter(gongcsp.rid == grow_rid, gongcsp.shjg == "通过").update(
                        {gongcsp.cwdy: user.username + datetime.now().strftime("%Y-%m-%d")}, synchronize_session=False
                    )
        else:
            customer_ws = wb.sheets[0]
            customer_snap = _capture_page_setup(customer_ws)
            _fill_customer_claim_sheet(customer_ws, row0, sig_paths, sig_labels, sqr)
            _finalize_sheet_for_pdf(customer_ws, customer_snap)

        excel_full = os.path.join(save_path, f"{_safe_filename(ajbh)}{datetime.now().strftime('%Y-%m-%d')}.xlsx")
        wb.save(excel_full)
        wb.close()
        wb = None

        pdf_res = convert_excel_to_pdf(excel_full, save_path)
        if not pdf_res.get("success"):
            try:
                os.remove(excel_full)
            except OSError:
                pass
            s.rollback()
            return json_result(-1, pdf_res.get("error") or "PDF转换失败")

        try:
            os.remove(excel_full)
        except OSError:
            pass

        out_name = os.path.basename(pdf_res["pdf_path"])

        if ("U" in user.username) or ("JY" in user.username):
            s.query(khsp).filter(khsp.rid == rid, khsp.shjg == "通过").update(
                {khsp.cwdy: user.username + datetime.now().strftime("%Y-%m-%d")}, synchronize_session=False
            )

        s.commit()
        return json_result(1, "生成成功", out_name)

    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        if wb is not None:
            try:
                wb.close()
            except Exception:
                pass
        if app is not None:
            try:
                app.quit()
            except Exception:
                pass
        s.close()
