"""
商检清单 - INV pack sales 导出。

对照原 Delphi「商检清单-INV pack sales」source.pas。

模版（``template/`` 目录）：
- ``hr=1`` → ``bestorebips.xlsx``
- ``hr=2``（默认，与原 Pascal ``hr := '2'`` 一致）→ ``bestorebips1.xlsx``

每条「合并产品」行生成一份四联单 Excel（报关单 / 发票 / 装箱单 / 合同）。
"""

from any import *
from .model import *

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

TEMPLATE_BIPS = "bestorebips"  # hr=1
TEMPLATE_BIPS1 = "bestorebips1"  # hr=2（默认）
_MONTH_EN = {
    "01": "JAN",
    "02": "FEB",
    "03": "MAR",
    "04": "APR",
    "05": "MAY",
    "06": "JUN",
    "07": "JUL",
    "08": "AUG",
    "09": "SEP",
    "10": "OCT",
    "11": "NOV",
    "12": "DEC",
}


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


def _col_row_to_coord(col, row):
    return f"{xw.utils.col_name(col)}{row}"


def _add_picture_at(ws, coord, path, x_pad, y_pad, width, height):
    if not path or not os.path.isfile(path):
        return
    anchor = ws.range(coord)
    pic = ws.pictures.add(path, left=anchor.left + x_pad, top=anchor.top + y_pad)
    if width is not None:
        pic.width = width
    if height is not None:
        pic.height = height
    return pic


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def _open_workbook(app, path):
    return app.books.open(path)


def _save_and_close(wb, path):
    wb.save(path)
    wb.close()


def _esc_sql(v):
    return str(v or "").replace("'", "''")


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default) if row else default
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


def _to_int(v):
    if v in ("", None):
        return 0
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return 0


def _upper(v):
    s = str(v or "").strip()
    return s.upper() if s else ""


def _safe_filename(s):
    s = str(s or "").strip() or "export"
    for c in r'\/:*?"<>|':
        s = s.replace(c, "_")
    return s


def _fmt_fprq_parts(fprq):
    if fprq is None or fprq == "":
        return "", "", ""
    if hasattr(fprq, "strftime"):
        return fprq.strftime("%Y"), fprq.strftime("%m"), fprq.strftime("%d")
    s = str(fprq).strip().replace("/", "-")
    if " " in s:
        s = s.split()[0]
    if "T" in s and len(s) > 10:
        s = s[:10]
    parts = s.split("-")
    if len(parts) >= 3:
        return parts[0], parts[1], parts[2]
    return "", "", ""



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


def _image_path_from_tpzx(cpbh):
    rows = run_sql(f"select tpmc from tpzx where (cpbh='{_esc_sql(cpbh)}') and (LENGTH(tpmc) > 5) limit 1")
    if not rows:
        return None
    src = _parse_tpzx_tpmc_first_src(rows[0].get("tpmc"))
    return _tpzx_src_to_local_path(src)


def _image_path_from_kh(company_name):
    rows = run_sql(
        f"select tpmc from kh where (company_name='{_esc_sql(company_name)}') and (LENGTH(tpmc) > 5) limit 1"
    )
    if not rows:
        return None
    src = _parse_tpzx_tpmc_first_src(rows[0].get("tpmc"))
    return _tpzx_src_to_local_path(src)



def _template_stem(hr):
    """hr=1 → bestorebips；hr=2 → bestorebips1（对照 source.pas filename 分支）。"""
    if str(hr or "2").strip() == "1":
        return TEMPLATE_BIPS
    return TEMPLATE_BIPS1


def _template_path(base_path, hr="2"):
    stem = _template_stem(hr)
    for name in (f"{stem}.xlsx", f"{stem}.xls"):
        p = os.path.join(base_path, name)
        if os.path.isfile(p):
            return p
    return os.path.join(base_path, f"{stem}.xlsx")


def _resolve_hbdm(header):
    if get_field_value(header, "RMBkh") == "是":
        return "RMB"
    hbdm = get_field_value(header, "hbdm")
    if hbdm in ("USD", "USD$"):
        return "USD"
    return hbdm or "USD"


def _hbdm_symbol(hbdm):
    rows = run_sql(f"select bjdh from hbdm where bjdid='{_esc_sql(hbdm)}' limit 1")
    return get_field_value(rows[0], "bjdh") if rows else ""


def _gsyw(bggs):
    if not bggs:
        return ""
    rows = run_sql(f"select ywmc from wfgs where wfgs='{_esc_sql(bggs)}' limit 1")
    return _upper(get_field_value(rows[0], "ywmc")) if rows else ""


def _blue_stamp_text(bggs):
    cpbh = f"{bggs}蓝章"
    rows = run_sql(f"select sb,dyyy,bgh from tpzx where cpbh='{_esc_sql(cpbh)}' limit 1")
    if not rows:
        return ""
    r = rows[0]
    return "\n".join(x for x in (get_field_value(r, "sb"), get_field_value(r, "dyyy"), get_field_value(r, "bgh")) if x)


def _is_best_price(khmc):
    return "BEST PRICE" in str(khmc or "").upper()


def _round_weight(v, best_price):
    x = _to_float(v)
    if best_price:
        return round(x * 10) / 10
    return round(x * 100) / 100


def _consignee_a10(header):
    shr = get_field_value(header, "shr")
    if not shr:
        return "BEST PRICE"
    if "可思达" in get_field_value(header, "wfgs"):
        return _upper(get_field_value(header, "khmc"))
    return _upper(shr)


def _consignee_c6_sheet4(header):
    shr = get_field_value(header, "shr")
    if not shr:
        return "BEST PRICE"
    if "可思达" in get_field_value(header, "wfgs"):
        return _upper(get_field_value(header, "khmc"))
    return _upper(shr)


def _quantity_cell(product):
    chsl = _to_float(product.get("chsl"))
    if chsl <= 0:
        return ""
    unit = get_field_value(product, "hgjldw")
    zjz = _to_float(product.get("zjz"))
    if unit not in ("KGS", "千克"):
        return f"{chsl:.0f}{unit}/{zjz}千克"
    return f"{chsl:.0f}/{zjz}千克"


def _money_fmt(hbdm, hbdmfh):
    if hbdm == "RMB":
        return "￥#,##0.000"
    sym = hbdmfh or hbdm
    return f'"{sym}"#,##0.00'


def _load_sjqd_header(rid):
    rows = run_sql(f"select * from sjqd where rid='{_esc_sql(rid)}' limit 1")
    return rows[0] if rows else None


def _load_merged_products(rid):
    return run_sql(f"select * from sjqdhbcp where pid='{_esc_sql(rid)}' order by seq, sid") or []


def _product_fphm(product, header):
    return get_field_value(product, "fphm") or get_field_value(header, "fphm") or get_field_value(header, "ysfp")


def _fill_sheet1(ws, header, product, gs, gs1, hbdm, hbdmfh, bgdmzhj, bgdjzhj):
    _add_picture_at(ws, _col_row_to_coord(6, 22), _image_path_from_tpzx(f"{gs}报关专用章"), x_pad=15, y_pad=8, width=130, height=90)

    safe_write(ws, "A4", _upper(gs1))
    safe_write(ws, "A8", _upper(gs1))
    safe_write(ws, "B4", _upper(get_field_value(header, "cyka")))
    safe_write(ws, "A6", _upper(get_field_value(header, "khmc")))
    safe_write(ws, "B6", _upper(get_field_value(header, "ysfs")))
    safe_write(ws, "D6", _upper(get_field_value(header, "ysgj")))
    safe_write(ws, "F6", _upper(get_field_value(header, "tdh")))
    safe_write(ws, "F8", _upper(get_field_value(header, "xkzh")))
    safe_write(ws, "A10", _upper(_product_fphm(product, header)))
    safe_write(ws, "B10", _upper(get_field_value(header, "kagjy")))
    safe_write(ws, "D10", _upper(get_field_value(header, "kagjy")))
    safe_write(ws, "F10", _upper(get_field_value(header, "mdka")))
    safe_write(ws, "I10", _upper(get_field_value(header, "cyka")))
    safe_write(ws, "E12", _upper(get_field_value(header, "jgtk")))
    ws["B12"].value = get_field_value(header, "bgxshb")
    ws["C12"].value = bgdmzhj
    ws["D12"].value = bgdjzhj
    safe_write(ws, "A12", _upper(get_field_value(header, "bzzl")))

    zmz = _to_float(product.get("zmz"))
    safe_write(ws, "A15", f"标记唛码及备注                VGM：{zmz + bgdmzhj:.2f}KGS")

    wxmt = get_field_value(header, "wxmt")
    if wxmt:
        safe_write(ws, "N16", _upper(wxmt))
        safe_write(ws, "A16", _upper(wxmt))
    else:
        safe_write(ws, "A16", "N/M")

    row = 19
    safe_write(ws, f"A{row}", f"1 {get_field_value(product, 'hgbm')}")
    safe_write(ws, f"B{row}", get_field_value(product, "zwpm"))
    safe_write(ws, f"D{row}", _quantity_cell(product))
    ws[f"H{row}"].value = "中国"
    wxzj = _to_float(product.get("wxzj"))
    if wxzj > 0:
        ws[f"F{row}"].number_format = _money_fmt(hbdm, hbdmfh)
        ws[f"F{row}"].value = wxzj
    else:
        ws[f"F{row}"].value = ""
    ws[f"J{row}"].value = get_field_value(product, "hyd")
    ws[f"K{row}"].value = get_field_value(header, "zmxz")


def _fill_sheet2(ws, header, product, gs, gsyw, hbdm, qsy, qsr, qsn):
    _add_picture_at(ws, _col_row_to_coord(7, 48), _image_path_from_tpzx(f"{gs}蓝章名"), x_pad=15, y_pad=8, width=130, height=90)

    safe_write(ws, "A10", _consignee_a10(header))
    safe_write(ws, "A6", gsyw)
    safe_write(ws, "C15", _upper(_product_fphm(product, header)))
    safe_write(ws, "C17", _upper(f"{qsy}.{qsr},{qsn}"))
    safe_write(ws, "B18", _upper(get_field_value(header, "cyka")))
    safe_write(ws, "B21", _upper(get_field_value(header, "mdka")))
    safe_write(ws, "F22", _upper(get_field_value(header, "jhfs")))
    safe_write(ws, "E25", _upper(f"{get_field_value(header, 'jgtk')} {get_field_value(header, 'cyka')}"))
    ws["G25"].value = hbdm
    ws["G47"].value = hbdm

    row = 26
    safe_write(ws, f"B{row}", _upper(get_field_value(product, "ywpm")))
    ws[f"C{row}"].value = _to_float(product.get("chsl"))
    ws[f"D{row}"].value = _upper(get_field_value(product, "jldw"))
    ws[f"E{row}"].value = hbdm
    ws[f"F{row}"].number_format = "0.000"
    ws[f"F{row}"].value = _to_float(product.get("price"))
    ws[f"G{row}"].value = hbdm
    ws[f"H{row}"].value = _to_float(product.get("wxzj"))

    wxmt = get_field_value(header, "wxmt")
    try:
        ws.range("A27:A27").merge()
    except Exception:
        pass
    safe_write(ws, "A27", _upper(wxmt) if wxmt else "N/M")


def _fill_sheet3(ws, header, product, gs, gsyw, qsy, qsr, qsn, best_price):
    _add_picture_at(ws, _col_row_to_coord(5, 52), _image_path_from_tpzx(f"{gs}蓝章名"), x_pad=15, y_pad=8, width=130, height=90)

    safe_write(ws, "A10", _consignee_a10(header))
    safe_write(ws, "A6", gsyw)
    safe_write(ws, "C15", _upper(_product_fphm(product, header)))
    safe_write(ws, "C17", _upper(f"{qsy}.{qsr},{qsn}"))
    safe_write(ws, "B18", _upper(get_field_value(header, "cyka")))
    safe_write(ws, "B21", _upper(get_field_value(header, "mdka")))
    safe_write(ws, "D22", _upper(get_field_value(header, "jhfs")))

    row = 26
    gross = _round_weight(product.get("zmz"), best_price)
    net = _round_weight(product.get("zjz"), best_price)
    fmt = "0.0" if best_price else "0.00"

    safe_write(ws, f"B{row}", _upper(get_field_value(product, "ywpm")))
    ws[f"C{row}"].value = _to_float(product.get("chxs"))
    ws[f"D{row}"].number_format = fmt
    ws[f"D{row}"].value = gross
    ws[f"E{row}"].number_format = fmt
    ws[f"E{row}"].value = net
    ws[f"F{row}"].value = _to_float(product.get("ztj"))

    try:
        ws.range("A27:A27").merge()
    except Exception:
        pass
    wxmt = get_field_value(header, "wxmt")
    safe_write(ws, "A27", _upper(wxmt) if wxmt else "N/M")

    ws["D46"].number_format = fmt
    ws["D46"].value = gross
    ws["E46"].number_format = fmt
    ws["E46"].value = net


def _fill_sheet4(ws, header, product, gs, gsyw, hbdm, qsy, qsr, qsn):
    khmc = get_field_value(header, "khmc")
    _add_picture_at(ws, _col_row_to_coord(2, 31), _image_path_from_kh(khmc), x_pad=4, y_pad=4, width=120, height=80)
    _add_picture_at(ws, _col_row_to_coord(9, 31), _image_path_from_tpzx(f"{gs}蓝章名"), x_pad=8, y_pad=4, width=130, height=90)

    consignee = _consignee_c6_sheet4(header)
    safe_write(ws, "C6", consignee)
    ws["K6"].value = ""
    safe_write(ws, "I2", _upper(_product_fphm(product, header)))
    safe_write(ws, "I3", _upper(f"{qsy}.{qsr},{qsn}"))
    safe_write(ws, "G9", _upper(f"{get_field_value(header, 'jgtk')} {get_field_value(header, 'cyka')}"))

    row = 10
    ywpm = _upper(get_field_value(product, "ywpm"))
    safe_write(ws, f"A{row}", ywpm)
    safe_write(ws, f"M{row}", ywpm)
    ws[f"E{row}"].value = _to_float(product.get("chsl"))
    ws[f"F{row}"].value = _upper(get_field_value(product, "jldw"))
    ws[f"G{row}"].value = hbdm
    ws[f"H{row}"].number_format = "0.000"
    ws[f"H{row}"].value = _to_float(product.get("price"))
    ws[f"I{row}"].value = hbdm
    ws[f"J{row}"].value = _to_float(product.get("wxzj"))

    ws["I30"].value = hbdm
    safe_write(ws, "D32", _upper(get_field_value(header, "zyqx")))
    safe_write(ws, "E33", _upper(get_field_value(header, "cyka")))
    safe_write(ws, "I33", _upper(get_field_value(header, "mdka")))
    safe_write(ws, "A37", _upper(get_field_value(header, "jhfs")))
    wxmt = get_field_value(header, "wxmt")
    safe_write(ws, "D38", _upper(wxmt) if wxmt else "N/M")
    safe_write(ws, "C40", _upper(get_field_value(header, "bza")))


def _export_one_product_workbook(app, tpl_path, save_dir, header, product, seq_no):
    gs = get_field_value(header, "bggs")
    gsyw = _gsyw(gs)
    gs1 = _blue_stamp_text(gs)
    hbdm = _resolve_hbdm(header)
    hbdmfh = _hbdm_symbol(hbdm)
    best_price = _is_best_price(get_field_value(header, "khmc"))

    bgdmzhj = _round_weight(product.get("zmz"), best_price)
    bgdjzhj = _round_weight(product.get("zjz"), best_price)

    qsn, qsy1, qsr = _fmt_fprq_parts(header.get("fprq"))
    qsy = _MONTH_EN.get(qsy1, "")

    wb = _open_workbook(app, tpl_path)
    try:
        _fill_sheet1(wb.sheets[0], header, product, gs, gs1, hbdm, hbdmfh, bgdmzhj, bgdjzhj)
        _fill_sheet2(wb.sheets[1], header, product, gs, gsyw, hbdm, qsy, qsr, qsn)
        _fill_sheet3(wb.sheets[2], header, product, gs, gsyw, qsy, qsr, qsn, best_price)
        _fill_sheet4(wb.sheets[3], header, product, gs, gsyw, hbdm, qsy, qsr, qsn)

        fphm = _product_fphm(product, header)
        zwpm = get_field_value(product, "zwpm")
        out_name = _safe_filename(f"{fphm};{seq_no}{zwpm}BIPS") + ".xlsx"
        out_path = os.path.join(save_dir, out_name)
        _save_and_close(wb, out_path)
        wb = None
        return out_name, out_path
    except Exception:
        if wb is not None:
            wb.close()
        raise


def _export_sjqd_rid(rid, ctx):
    header = _load_sjqd_header(rid)
    logger.error(f"111111111,{header}")
    if not header:
        return []
    if get_field_value(header, "RMBkh") == "是":
        raise ValueError("此客人为RMB客人，请选RMB格式")

    products = _load_merged_products(rid)
    if not products:
        raise ValueError("合并产品为空，无法导出")

    outputs = []
    app = _start_excel_app()
    try:
        for idx, product in enumerate(products, start=1):
            name, path = _export_one_product_workbook(app, ctx["tpl_path"], ctx["save_dir"], header, product, idx)
            outputs.append({"name": name, "path": path})
    finally:
        try:
            app.quit()
        except Exception:
            pass
    return outputs


def _collect_rids(mode, rid, rids):
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


@any_route("/api/saier/commodity_inspection/inv_pack_sales/export", methods=["POST", "GET"])
@require_token
async def view_saier_commodity_inspection_inv_pack_sales_export(request):
    """
    商检清单 - INV pack sales（对照 Delphi 商检清单-INV pack sales）。

    请求 JSON：
    - mode: ``1`` 当前单条（默认），``2`` 批量
    - rid / rids: 商检清单主表 rid
    - hr: ``1`` 使用 bestorebips，``2`` 使用 bestorebips1（默认）
    """
    j = await request.json()

    try:
        mode = str(j.get("mode", "1") or "1").strip()
        if mode != "2":
            mode = "1"

        hr = str(j.get("hr", "2") or "2").strip()
        if hr != "1":
            hr = "2"

        rid = j.get("rid", "")
        rids = j.get("rids") or []
        if isinstance(rids, str):
            rids = [rids] if rids else []

        pids = _collect_rids(mode, rid, rids)
        if not pids:
            return json_result(-1, "请指定要导出的商检清单记录")

        base_path = os.path.join(config.data_upload_path, "template")
        tpl_path = _template_path(base_path, hr)
        tpl_stem = _template_stem(hr)
        if not os.path.isfile(tpl_path):
            return json_result(-1, f"模版文件缺失：{tpl_stem}.xlsx 或 {tpl_stem}.xls")

        save_dir = config.tmp_path
        os.makedirs(save_dir, exist_ok=True)
        ctx = {"tpl_path": tpl_path, "save_dir": save_dir}

        output_files = []
        for pid in pids:
            for item in _export_sjqd_rid(pid, ctx):
                if item["path"] and os.path.isfile(item["path"]):
                    output_files.append(item)

        if not output_files:
            return json_result(-1, "未生成任何报表")

        if len(output_files) == 1:
            return json_result(1, "导出成功", output_files[0]["name"])

        zip_name = time.strftime("%Y%m%d%H%M%S") + "_sjqd_inv_pack_sales.zip"
        zip_path = os.path.join(save_dir, zip_name)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for f in output_files:
                zf.write(f["path"], f["name"])
        return json_result(1, "导出成功", zip_name)

    except ValueError as e:
        return json_result(-1, str(e))
    except FileNotFoundError as e:
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
