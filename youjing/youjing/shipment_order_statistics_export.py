"""
出货接单统计 - 报表导出（下单出货数据表、其他客人统计表）。

对照原 Pascal「下单出货数据表.pas」「其他客人统计表.pas」；
模版目录：``data_upload_path/template/``。
"""

from any import *
from .model import *
from datetime import datetime
import os
import shutil

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

TEMPLATE_ORDER_SHIPMENT = "下单出货数据表.xls"
TEMPLATE_OTHER_CUSTOMER = "其他客人统计表.xls"
OTHER_CUSTOMER_MLB = 0.06
TOP20_EXPORT_COLS = [
    "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK",
]
CITY_COMPARE_COLS = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
CITY_KEYS = [
    "MOSCOW", "KAZAN", "EKATERINBURG", "VORONESH", "KRASNODAR", "NOVOSIBIRSK",
    "ST. PETERSBURG", "PUSHKINO", "SAMARA", "NOVOSIBIRSK2", "DOMODEDOVO",
]


def esc_sql(v):
    return str(v or "").replace("\\", "\\\\").replace("'", "''")


def esc_like(v):
    s = esc_sql(str(v or ""))
    return s.replace("%", "\\%").replace("_", "\\_")


def _wxbm_like(wxbmm):
    if not wxbmm:
        return "like '%'"
    return f"like '%{esc_like(wxbmm)}%'"


def _to_float(v):
    if v in ("", None):
        return 0.0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _fmt_dt(v):
    if v is None:
        return ""
    if hasattr(v, "strftime"):
        return v.strftime("%Y-%m-%d")
    s = str(v).strip()
    return s[:10] if s else ""


def _safe_write(ws, coord, value, num_format=None):
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


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def _insert_data_row(ws, template_row, insert_row):
    ws.range(insert_row, insert_row).api.EntireRow.Insert()
    ws.range(template_row, template_row).copy()
    ws.range(insert_row, insert_row).paste(paste="formats")


def _delete_row(ws, row_num):
    ws.range(row_num, row_num).api.EntireRow.Delete()


def _get_mlb_switch(sb, gykr1):
    """Pascal: cyzglsheet 毛利比开关 + wfgs/kh 客户毛利比"""
    mlb = 1.0
    if sb not in ("费用不扣开", "全扣后开"):
        return mlb
    d = run_sql("select mlb from wfgs where mlb>0 limit 1")
    if d:
        mlb = 1 - _to_float(d[0].get("mlb")) / 100
    if gykr1:
        d = run_sql(f"select mlb from kh where (company_name='{esc_sql(gykr1)}') and (mlb>0) limit 1")
        if d:
            mlb = 1 - _to_float(d[0].get("mlb"))
    if mlb == 0:
        mlb = 1.0
    return mlb


def _period_labels(qsrq, jsrq, qsrq1):
    """Pascal: dy/sy/dy1 及 qsrq/qsrq1 年月标签"""
    qsrq_s = _fmt_dt(qsrq)
    jsrq_s = _fmt_dt(jsrq)
    qsrq1_s = _fmt_dt(qsrq1)
    qsrqz = qsrq_s[:7]
    qsrq1z = qsrq1_s[:7]
    dy = qsrq_s[:4] + "年" + qsrq_s[5:7] + "月" if len(qsrq_s) >= 7 else ""
    sy = qsrq1_s[:4] + "年" + qsrq1_s[5:7] + "月" if len(qsrq1_s) >= 7 else ""
    dy1 = qsrq_s[5:7] + "月" if len(qsrq_s) >= 7 else ""
    lbl_qsrq = qsrqz
    lbl_qsrq1 = qsrq1z
    if qsrqz != jsrq_s[:7]:
        lbl_qsrq = qsrq_s[:4]
        lbl_qsrq1 = qsrq1_s[:4]
        dy = qsrq_s[:4] + "年"
        sy = qsrq1_s[:4] + "年"
        dy1 = qsrq_s[2:4] + "年" if len(qsrq_s) >= 4 else dy1
    return lbl_qsrq, lbl_qsrq1, dy, sy, dy1, qsrqz, qsrq1z


def _query_cymx_product(cpbh, qsrq2, jsrq2, wxbm1, gykr, gykr1):
    wxbm_cond = f"wxbm1 {_wxbm_like(wxbm1)}"
    if gykr:
        kh_cond = f"khmc like '%{esc_sql(gykr)}%'"
    else:
        kh_cond = f"khmc='{esc_sql(gykr1)}'"
    sql = (
        f"select sum(yjR11) as yjR11, sum(yjM11) as yjM11, sum(ayR11) as ayR11, sum(ayM11) as ayM11, "
        f"sum(gczj) as gczj, sum(tse) as tse, sum(mjzjj) as mjzjj, sum(zjej*zmyhl) as zjej, "
        f"sum(bf) as bf, sum(bfmy) as bfmy, sum(fpfy) as fpfy, sum(fpfymy) as fpfymy, "
        f"sum(kpfy) as kpfy, sum(flzj) as flzj1, "
        f"GROUP_CONCAT(DISTINCT gdry SEPARATOR '/') as gdry, "
        f"GROUP_CONCAT(DISTINCT ywry SEPARATOR '/') as ywry "
        f"from cymxsheet where (sjcy>='{esc_sql(qsrq2)}') and (sjcy<='{esc_sql(jsrq2)}') "
        f"and (ifnull(sjcy,'')<>'') and ({kh_cond}) and (zycpbh='{esc_sql(cpbh)}') "
        f"and ({wxbm_cond}) and (fksb='是') and (ewchy<>'是') group by zycpbh"
    )
    d = run_sql(sql)
    return d[0] if d else None


def _other_customer_kh_filter(da6, alias=""):
    """Pascal da6: 1=引LV UAE，2=不引（默认）"""
    p = f"{alias}." if alias else ""
    parts = [f"({p}khmc not like '%BEST PRICE%')"]
    if str(da6 or "2") != "1":
        parts.append(f"({p}khmc<>'SIA FP LV')")
        parts.append(f"({p}khmc<>'FIX PRICE GENERAL TRADING LLC')")
    return " and ".join(parts)


def _calc_other_customer_sheet1_margin(row, hl, mlb, sb):
    """其他客人统计表 Sheet1 行毛利率/创利（Pascal 公式与下单出货 Sheet3 不同）"""
    zjej = _to_float(row.get("zjej"))
    mjzjj = _to_float(row.get("mjzjj"))
    yjr = _to_float(row.get("yjR11"))
    yjm = _to_float(row.get("yjM11"))
    ayr = _to_float(row.get("ayR11"))
    aym = _to_float(row.get("ayM11"))
    tse = _to_float(row.get("tse"))
    gczj = _to_float(row.get("gczj"))
    flzj1 = _to_float(row.get("flzj1"))
    kpfy = _to_float(row.get("kpfy"))
    fpfy = _to_float(row.get("fpfy"))
    fpfy_usd = _to_float(row.get("fpfy$")) * hl
    bf = _to_float(row.get("bf"))
    bf_usd = _to_float(row.get("bf$")) * hl
    base = zjej * hl + mjzjj - yjr - yjm * hl
    if base <= 0:
        return 0.0, "0"
    cost = gczj + flzj1
    if sb == "费用不扣开":
        profit = base - base * mlb - ayr - aym * hl + tse - cost
        rate = round(profit / base * 10000) / 100
    elif sb == "全扣后开":
        profit = base - base * mlb - ayr - aym * hl + tse - kpfy - cost - fpfy - fpfy_usd - bf - bf_usd
        rate = round(profit / base * 10000) / 100
    else:
        profit = base - ayr - aym * hl + tse - kpfy - cost - fpfy - fpfy_usd - bf - bf_usd
        rate = round(profit / base * 10000) / 100
    return profit, f"{rate}%"


def _calc_other_customer_sheet2_margin(row, hl, mlb, sb):
    """其他客人统计表 Sheet2 行毛利率/创利"""
    zjej = _to_float(row.get("zjej")) * hl
    mjzjj = _to_float(row.get("mjzjj"))
    yjr = _to_float(row.get("yjR11"))
    yjm = _to_float(row.get("yjM11")) * hl
    ayr = _to_float(row.get("ayR11"))
    aym = _to_float(row.get("ayM11")) * hl
    tse = _to_float(row.get("tse"))
    gczj = _to_float(row.get("gczj"))
    flzj1 = _to_float(row.get("flzj1"))
    kpfy = _to_float(row.get("kpfy"))
    fpfy = _to_float(row.get("fpfy"))
    fpfy_usd = _to_float(row.get("fpfy$")) * hl
    bf = _to_float(row.get("bf"))
    bf_usd = _to_float(row.get("bf$")) * hl
    base = zjej + mjzjj - yjr - yjm
    if base <= 0:
        return 0.0, 0.0
    cost = gczj + flzj1
    if sb == "费用不扣开":
        profit = base - ayr - aym + tse - cost - base * mlb
        rate = profit / base
    elif sb == "全扣后开":
        profit = base - ayr - aym + tse - kpfy - cost - fpfy - fpfy_usd - bf - bf_usd - base * mlb
        rate = profit / base
    else:
        profit = base - ayr - aym + tse - kpfy - cost - fpfy - fpfy_usd - bf - bf_usd
        rate = profit / base
    return rate, profit


def _calc_product_margin(row, hl, mlb, sb):
    zjej = _to_float(row.get("zjej")) * hl
    mjzjj = _to_float(row.get("mjzjj"))
    yjr = _to_float(row.get("yjR11"))
    yjm = _to_float(row.get("yjM11")) * hl
    ayr = _to_float(row.get("ayR11"))
    aym = _to_float(row.get("ayM11")) * hl
    tse = _to_float(row.get("tse"))
    gczj = _to_float(row.get("gczj"))
    flzj1 = _to_float(row.get("flzj1"))
    kpfy = _to_float(row.get("kpfy"))
    fpfy = _to_float(row.get("fpfy"))
    fpfymy = _to_float(row.get("fpfymy")) * hl
    bf = _to_float(row.get("bf"))
    bfmy = _to_float(row.get("bfmy")) * hl
    base = zjej + mjzjj - yjr - yjm
    if base <= 0:
        return 0.0, 0.0
    cost = gczj + flzj1
    if sb == "费用不扣开":
        num = base * 1 - ayr - aym + tse - cost - base * mlb
    elif sb == "全扣后开":
        num = base * 1 - ayr - aym + tse - kpfy - cost - fpfy - fpfymy - bf - bfmy - base * mlb
    else:
        num = base * 1 - ayr - aym + tse - kpfy - cost - fpfy - fpfymy - bf - bfmy
    return num / base, num


def _fill_sheet1(ws, rid, header):
    hl = _to_float(header.get("hl"))
    lbl_qsrq, lbl_qsrq1, dy, sy, dy1, qsrqz, qsrq1z = _period_labels(
        header.get("qsrq"), header.get("jsrq"), header.get("qsrq1")
    )

    headers = {
        "B1": f"{lbl_qsrq}接单", "C1": f"{lbl_qsrq1}接单",
        "E1": f"{lbl_qsrq}出货", "F1": f"{lbl_qsrq1}出货",
        "G1": f"{lbl_qsrq}出货毛利", "H1": f"{lbl_qsrq1}出货毛利",
        "I1": f"{lbl_qsrq}出货毛利率", "J1": f"{lbl_qsrq1}出货毛利率",
        "K1": f"{lbl_qsrq}预接单柜数", "L1": f"{lbl_qsrq1}预接单柜数",
        "M1": f"{lbl_qsrq}预接单立方数", "N1": f"{lbl_qsrq1}预接单立方数",
        "O1": f"{lbl_qsrq}出柜数", "P1": f"{lbl_qsrq1}出货柜数",
        "Q1": f"{lbl_qsrq}出货立方数", "R1": f"{lbl_qsrq1}出货立方数",
    }
    for coord, val in headers.items():
        _safe_write(ws, coord, val)

    city_totals = {k: {"cur_jd": 0.0, "cur_ch": 0.0, "ly_jd": 0.0, "ly_ch": 0.0} for k in CITY_KEYS}
    ports = run_sql(
        f"select gkmc from chjdtjsheet where (pid='{esc_sql(rid)}') group by gkmc"
    )
    i1 = 0
    for port_row in ports or []:
        gkmc = str(port_row.get("gkmc") or "")
        i1 += 1
        row_no = 2 + i1
        _insert_data_row(ws, 2, row_no)
        _safe_write(ws, f"A{row_no}", gkmc)

        detail_rows = run_sql(
            f"select sum(chje) as chje3, sum(jdje) as jdje3, sum(mlhj) as mlhj3, "
            f"sum(chgs) as chgs3, sum(chlf) as chlf3, sum(xdgs) as xdgs3, sum(xdlf) as xdlf3, gkmc, chyf "
            f"from chjdtjsheet where (pid='{esc_sql(rid)}') and (gkmc='{esc_sql(gkmc)}') group by gkmc, chyf"
        )
        for dr in detail_rows or []:
            chyf = str(dr.get("chyf") or "")
            jdje3 = _to_float(dr.get("jdje3"))
            chje3 = _to_float(dr.get("chje3"))
            mlhj3 = _to_float(dr.get("mlhj3"))

            ck = str(gkmc or "").upper()
            if ck in ("NOVOSIBIRSK", "NOVOSIBIRSK1"):
                ck = "NOVOSIBIRSK"
            if ck in city_totals:
                if chyf == qsrqz:
                    city_totals[ck]["cur_jd"] += jdje3
                    city_totals[ck]["cur_ch"] += chje3
                elif chyf == qsrq1z:
                    city_totals[ck]["ly_jd"] += jdje3
                    city_totals[ck]["ly_ch"] += chje3

            if chyf == qsrqz:
                _safe_write(ws, f"B{row_no}", jdje3)
                _safe_write(ws, f"E{row_no}", chje3)
                _safe_write(ws, f"G{row_no}", mlhj3)
                if chje3 > 0 and hl > 0:
                    num = round(mlhj3 * 100) / 100
                    den = round(chje3 * hl * 100) / 100
                    rate = round(num / den * 10000) / 10000 if den else 0
                else:
                    rate = 0
                _safe_write(ws, f"I{row_no}", rate)
                _safe_write(ws, f"K{row_no}", _to_float(dr.get("xdgs3")))
                _safe_write(ws, f"M{row_no}", _to_float(dr.get("xdlf3")))
                _safe_write(ws, f"O{row_no}", _to_float(dr.get("chgs3")))
                _safe_write(ws, f"Q{row_no}", _to_float(dr.get("chlf3")))
            elif chyf == qsrq1z:
                _safe_write(ws, f"C{row_no}", jdje3)
                _safe_write(ws, f"F{row_no}", chje3)
                _safe_write(ws, f"H{row_no}", mlhj3)
                if chje3 > 0 and hl > 0:
                    num = round(mlhj3 * 100) / 100
                    den = round(chje3 * hl * 100) / 100
                    rate = round(num / den * 10000) / 10000 if den else 0
                else:
                    rate = 0
                _safe_write(ws, f"J{row_no}", "0%" if rate == 0 else rate)
                _safe_write(ws, f"L{row_no}", _to_float(dr.get("xdgs3")))
                _safe_write(ws, f"N{row_no}", _to_float(dr.get("xdlf3")))
                _safe_write(ws, f"P{row_no}", _to_float(dr.get("chgs3")))
                _safe_write(ws, f"R{row_no}", _to_float(dr.get("chlf3")))

    _delete_row(ws, 2)
    i1 += 1
    _safe_write(ws, f"A{2 + i1}", f"{dy1}同比接单数据")
    i1 += 2
    ly_row = 2 + i1
    _safe_write(ws, f"A{ly_row}", sy)
    cur_row = ly_row + 1
    _safe_write(ws, f"A{cur_row}", dy)
    for idx, ck in enumerate(CITY_KEYS):
        col = CITY_COMPARE_COLS[idx]
        ct = city_totals[ck]
        _safe_write(ws, f"{col}{ly_row}", ct["ly_jd"])
        _safe_write(ws, f"{col}{cur_row}", ct["cur_jd"])

    i1 += 25
    _safe_write(ws, f"A{2 + i1}", f"{dy1}同比实际出货数据")
    i1 += 2
    ly_row2 = 2 + i1
    _safe_write(ws, f"A{ly_row2}", sy)
    cur_row2 = ly_row2 + 1
    _safe_write(ws, f"A{cur_row2}", dy)
    for idx, ck in enumerate(CITY_KEYS):
        col = CITY_COMPARE_COLS[idx]
        ct = city_totals[ck]
        _safe_write(ws, f"{col}{ly_row2}", ct["ly_ch"])
        _safe_write(ws, f"{col}{cur_row2}", ct["cur_ch"])


def _fill_category_rows(ws, rid, table_name, i1, template_row):
    """写入分类统计行，返回最新行号"""
    rows = run_sql(
        f"select yjfl, sum(wxzj) as wxzj, sum(chsl) as chsl, sum(zlgs) as zlgs, sum(xds) as xds, "
        f"sum(fds) as fds, sum(xjs) as xjs, sum(cgtj) as cgtj, sum(wxtj) as wxtj, sum(khzx) as khzx, "
        f"sum(yplr) as yplr, sum(jysl) as jysl "
        f"from {table_name} where (pid='{esc_sql(rid)}') group by yjfl"
    )
    for r in rows or []:
        i1 += 1
        _insert_data_row(ws, template_row, i1)
        zlgs = int(_to_float(r.get("zlgs")))
        fds = int(_to_float(r.get("fds")))
        ratio = round(fds / zlgs * 10000) / 10000 if zlgs > 0 else 0
        _safe_write(ws, f"A{i1}", str(r.get("yjfl") or ""))
        _safe_write(ws, f"B{i1}", zlgs)
        _safe_write(ws, f"C{i1}", fds)
        _safe_write(ws, f"D{i1}", zlgs - fds)
        _safe_write(ws, f"E{i1}", int(_to_float(r.get("khzx"))))
        _safe_write(ws, f"F{i1}", int(_to_float(r.get("jysl"))))
        _safe_write(ws, f"G{i1}", ratio)
        _safe_write(ws, f"H{i1}", round(_to_float(r.get("wxzj")) * 100) / 100)
    _delete_row(ws, template_row)
    return i1


def _fill_sheet2(ws, rid, header):
    _, _, dy, sy, _, _, _ = _period_labels(header.get("qsrq"), header.get("jsrq"), header.get("qsrq1"))
    _safe_write(ws, "A1", f"{sy}下单产品个数及货号表分析")
    _safe_write(ws, "H2", f"{sy}下单总金额")
    i1 = _fill_category_rows(ws, rid, "chjdtjsheet6", 3, 3)

    i1 += 1
    _safe_write(ws, f"A{i1 + 1}", f"{dy}下单产品个数及货号表分析")
    i1 += 1
    _safe_write(ws, f"H{i1 + 1}", f"{dy}下单总金额")
    i1 += 1
    number = i1 + 1
    i1 += 1
    _fill_category_rows(ws, rid, "chjdtjsheet2", i1, number)


def _fill_sheet3(ws, rid, header, sb):
    qsrq2 = _fmt_dt(header.get("qsrq"))
    jsrq2 = _fmt_dt(header.get("jsrq"))
    hl = _to_float(header.get("hl"))
    wxbm1 = str(header.get("bm") or "")
    gykr = str(header.get("gykr") or "").strip()
    gykr1 = gykr if gykr else str(header.get("khmc") or "").strip()
    mlb = _get_mlb_switch(sb, gykr1)
    _, _, dy, _, dy1, _, _ = _period_labels(header.get("qsrq"), header.get("jsrq"), header.get("qsrq1"))

    _safe_write(ws, "A1", f"{dy}出货产品及数量")
    _safe_write(ws, "R1", "TOP 20 产品各类别占比")

    fnumberz, fnumber1, fnumber3 = {}, {}, {}
    cpbh_seen = set()
    tjws2 = tjws3 = tjws7 = 0
    zjej = mjzjj = yj_r11 = yj_m11 = ay_r11 = ay_m11 = tse = gczj = flzj1 = 0.0
    i1 = 1

    products = run_sql(
        f"select * from chjdtjsheet4 where (pid='{esc_sql(rid)}') and (cpbh<>'') and (cpbh is not null) "
        f"order by wxzj desc"
    )
    for pr in products or []:
        i1 += 1
        row_no = i1 + 1
        tjws2 += 1
        cpfl = str(pr.get("cpfl") or "")
        yjfl = str(pr.get("yjfl") or "")
        cpbh = str(pr.get("cpbh") or "")
        wxzj = _to_float(pr.get("wxzj"))

        if tjws2 <= 20:
            key = f"{cpfl}-{yjfl}"
            if key not in fnumberz:
                fnumberz[key] = len(fnumberz)
                fnumber1[fnumberz[key]] = yjfl
                fnumber3[fnumberz[key]] = 1
                tjws3 += 1
            else:
                idx = fnumberz[key]
                fnumber3[idx] = int(fnumber3[idx]) + 1
            tjws7 += 1

        _safe_write(ws, f"A{row_no}", str(i1 - 1))
        _safe_write(ws, f"B{row_no}", cpbh)
        _safe_write(ws, f"C{row_no}", str(pr.get("ywpm") or ""))
        _safe_write(ws, f"D{row_no}", yjfl)
        _safe_write(ws, f"E{row_no}", int(_to_float(pr.get("chsl"))))
        _safe_write(ws, f"F{row_no}", round(wxzj * 100) / 100)

        if cpbh not in cpbh_seen:
            cpbh_seen.add(cpbh)
            zscp_rows = run_sql(
                f"select cgdj, rmbdj, khsj, tsl, topcz, ctime from zscp "
                f"where (cpbh='{esc_sql(cpbh)}') limit 1"
            )
            if zscp_rows:
                zs = zscp_rows[0]
                _safe_write(ws, f"G{row_no}", round(_to_float(zs.get("cgdj")) * 100) / 100)
                _safe_write(ws, f"H{row_no}", round(_to_float(zs.get("rmbdj")) * 100) / 100)
                _safe_write(ws, f"I{row_no}", _to_float(zs.get("tsl")))
                _safe_write(ws, f"M{row_no}", str(zs.get("topcz") or ""))
                _safe_write(ws, f"N{row_no}", _fmt_dt(zs.get("ctime")))
                _safe_write(ws, f"O{row_no}", str(zs.get("khsj") or ""))
            _safe_write(ws, f"J{row_no}", f"=H{row_no}/G{row_no}")

            cymx = _query_cymx_product(cpbh, qsrq2, jsrq2, wxbm1, gykr, gykr1)
            if cymx and hl != 0:
                _safe_write(ws, f"P{row_no}", str(cymx.get("ywry") or ""))
                _safe_write(ws, f"Q{row_no}", str(cymx.get("gdry") or ""))
                zjej += _to_float(cymx.get("zjej")) * hl
                mjzjj += _to_float(cymx.get("mjzjj"))
                yj_r11 += _to_float(cymx.get("yjR11"))
                yj_m11 += _to_float(cymx.get("yjM11")) * hl
                ay_r11 += _to_float(cymx.get("ayR11"))
                ay_m11 += _to_float(cymx.get("ayM11")) * hl
                tse += _to_float(cymx.get("tse"))
                flzj1 += _to_float(cymx.get("flzj1"))
                base = (
                    _to_float(cymx.get("zjej")) * hl + _to_float(cymx.get("mjzjj"))
                    - _to_float(cymx.get("yjR11")) - _to_float(cymx.get("yjM11")) * hl
                )
                if base > 0:
                    gczj += _to_float(cymx.get("gczj"))
                k_val, l_val = _calc_product_margin(cymx, hl, mlb, sb)
                _safe_write(ws, f"K{row_no}", k_val if base > 0 else 0)
                _safe_write(ws, f"L{row_no}", l_val if base > 0 else 0)

    if i1 >= 3:
        border_rng = ws.range(f"A3:O{i1}")
        for edge in (7, 8, 9, 10, 11, 12):
            border_rng.api.Borders(edge).LineStyle = 1

    base_total = zjej + mjzjj - yj_r11 - yj_m11
    if base_total > 0:
        avg = round(
            ((base_total * 1 - ay_r11 - ay_m11 + tse - (gczj + flzj1) - base_total * mlb) / base_total) * 10000
        ) / 100
        _safe_write(ws, f"K{i1 + 1}", f"{dy1}{wxbm1}出货产品平均毛利率：{avg}%")

    if tjws7 > 0:
        tjws4 = 0.0
        for n4 in range(len(fnumberz)):
            col = TOP20_EXPORT_COLS[n4]
            _safe_write(ws, f"{col}2", fnumber1.get(n4, ""))
            ratio = round(int(fnumber3.get(n4, 0)) / tjws7 * 10000) / 10000
            tjws4 += ratio
            if n4 + 1 == tjws3:
                ratio = ratio + 1 - tjws4
            _safe_write(ws, f"{col}3", ratio)


def export_order_shipment_workbook(rid):
    header_rows = run_sql(
        f"select qsrq, jsrq, qsrq1, jsrq1, hl, bm, khmc, gykr from chjdtj "
        f"where rid='{esc_sql(rid)}' limit 1"
    )
    if not header_rows:
        raise ValueError("未找到统计记录")
    header = header_rows[0]

    sb_rows = run_sql("select bz from cyzglsheet where (zm='毛利比开关') limit 1")
    sb = str(sb_rows[0].get("bz") or "") if sb_rows else ""

    base_path = os.path.join(config.data_upload_path, "template")
    tpl_path = None
    for name in (TEMPLATE_ORDER_SHIPMENT, "下单出货数据表.xlsx"):
        p = os.path.join(base_path, name)
        if os.path.exists(p):
            tpl_path = p
            break
    if not tpl_path:
        raise FileNotFoundError("模版文件不存在，请将 下单出货数据表.xls 或 .xlsx 放入 template 目录")

    out_name = f"下单出货数据表_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    out_path = os.path.join(config.tmp_path, out_name)
    shutil.copy2(tpl_path, out_path)

    app = None
    wb = None
    try:
        app = _start_excel_app()
        wb = app.books.open(out_path)
        _fill_sheet1(wb.sheets[0], rid, header)
        _fill_sheet2(wb.sheets[1], rid, header)
        _fill_sheet3(wb.sheets[2], rid, header, sb)
        wb.save()
        wb.close()
        wb = None
        return out_name
    finally:
        if wb is not None:
            wb.close()
        if app is not None:
            try:
                app.quit()
            except Exception:
                pass


def _fill_other_customer_sheet1(ws, da1, da2, wxbm, hl, sb, da6):
    """Sheet1: 出货产品货号明细（Pascal 其他客人统计表 worksheet[1]）"""
    headers = {
        "A1": "出货产品货号明细如下",
        "B1": "出运合同明细如下",
        "C1": "其他客户明细如下",
        "D1": "出货额$",
        "E1": "出货创利￥",
        "F1": "出货利率",
    }
    for coord, val in headers.items():
        _safe_write(ws, coord, val)

    kh_filter = _other_customer_kh_filter(da6)
    wxbm_cond = f"WXBM1 {_wxbm_like(wxbm)}"
    sql = (
        f"select sum(wxzjz) as wxzjz, sum(yjR11) as yjR11, sum(yjM11) as yjM11, "
        f"sum(ayR11) as ayR11, sum(ayM11) as ayM11, sum(gczj) as gczj, sum(tse) as tse, "
        f"sum(mjzjj) as mjzjj, sum(zjej*zmyhl) as zjej, sum(bf) as bf, sum(`bf$`) as `bf$`, "
        f"sum(flzj) as flzj1, sum(fpfy) as fpfy, sum(`fpfy$`) as `fpfy$`, sum(kpfy) as kpfy, "
        f"zycpbh, "
        f"GROUP_CONCAT(DISTINCT wxht SEPARATOR '/') as wxht, "
        f"GROUP_CONCAT(DISTINCT khmc SEPARATOR '/') as khmc "
        f"from cymxsheet where (sjcy>='{esc_sql(da1)}') and (sjcy<='{esc_sql(da2)}') "
        f"and (zycpbh<>'') and (zycpbh is not null) and ({wxbm_cond}) "
        f"and (fpsb1='是') and ({kh_filter}) and (wxzjz>0) group by zycpbh"
    )
    rows = run_sql(sql) or []
    mlb = OTHER_CUSTOMER_MLB
    i = 1
    for row in rows:
        i += 1
        zjej = _to_float(row.get("zjej"))
        mjzjj = _to_float(row.get("mjzjj"))
        yjr = _to_float(row.get("yjR11"))
        yjm = _to_float(row.get("yjM11"))
        ch_usd = zjej + mjzjj / hl - yjr / hl - yjm if hl else 0
        profit, rate_str = _calc_other_customer_sheet1_margin(row, hl, mlb, sb)
        _safe_write(ws, f"A{i}", str(row.get("zycpbh") or ""))
        _safe_write(ws, f"B{i}", str(row.get("wxht") or ""))
        _safe_write(ws, f"C{i}", str(row.get("khmc") or ""))
        _safe_write(ws, f"D{i}", ch_usd)
        base = zjej * hl + mjzjj - yjr - yjm * hl
        if base > 0:
            _safe_write(ws, f"E{i}", profit)
            _safe_write(ws, f"F{i}", rate_str)
        else:
            _safe_write(ws, f"E{i}", 0)
            _safe_write(ws, f"F{i}", 0)


def _query_other_customer_cymx(cpbh, da1, da2, wxbm, da6):
    kh_filter = _other_customer_kh_filter(da6)
    wxbm_cond = f"wxbm1 {_wxbm_like(wxbm)}"
    sql = (
        f"select zycpbh, sum(yjR11) as yjR11, sum(yjM11) as yjM11, sum(ayR11) as ayR11, "
        f"sum(ayM11) as ayM11, sum(gczj) as gczj, sum(tse) as tse, sum(mjzjj) as mjzjj, "
        f"sum(zjej*zmyhl) as zjej, sum(bf) as bf, sum(`bf$`) as `bf$`, sum(fpfy) as fpfy, "
        f"sum(`fpfy$`) as `fpfy$`, sum(kpfy) as kpfy, sum(flzj) as flzj1, "
        f"GROUP_CONCAT(DISTINCT khmc SEPARATOR '/') as khmc, "
        f"GROUP_CONCAT(DISTINCT gdry SEPARATOR '/') as gdry, "
        f"GROUP_CONCAT(DISTINCT ywry SEPARATOR '/') as ywry "
        f"from cymxsheet where (sjcy>='{esc_sql(da1)}') and (sjcy<='{esc_sql(da2)}') "
        f"and (ifnull(sjcy,'')<>'') and (zycpbh='{esc_sql(cpbh)}') and ({wxbm_cond}) "
        f"and ({kh_filter}) and (fksb='是') and (ewchy<>'是') group by zycpbh"
    )
    d = run_sql(sql)
    return d[0] if d else None


def _fill_other_customer_sheet2(ws, da1, da2, wxbm, hl, sb, da6, dy, dy1):
    """Sheet2: 出货产品及数量 + TOP20（Pascal 其他客人统计表 worksheet[2]）"""
    _safe_write(ws, "A1", f"{dy}出货产品及数量")
    _safe_write(ws, "R1", "TOP 20 产品各类别占比")

    kh_filter = _other_customer_kh_filter(da6)
    wxbm_cond = f"wxbm1 {_wxbm_like(wxbm)}"
    sql = (
        f"select sum(wxzjz) as wxzjz, cpfl, yjfl, sum(chsl) as chsl, zycpbh "
        f"from cymxsheet where (sjcy>='{esc_sql(da1)}') and (sjcy<='{esc_sql(da2)}') "
        f"and (ifnull(sjcy,'')<>'') and ({wxbm_cond}) and ({kh_filter}) "
        f"and (fksb='是') and (ewchy<>'是') and (wxzjz>0) "
        f"group by zycpbh, cpfl, yjfl order by wxzjz desc"
    )
    products = run_sql(sql) or []

    fnumberz, fnumber1, fnumber3 = {}, {}, {}
    tjws2 = tjws3 = tjws7 = 0
    zjej = mjzjj = yj_r11 = yj_m11 = ay_r11 = ay_m11 = tse = gczj = flzj1 = 0.0
    mlb = OTHER_CUSTOMER_MLB
    i1 = 1

    for pr in products:
        i1 += 1
        row_no = i1 + 1
        tjws2 += 1
        cpfl = str(pr.get("cpfl") or "")
        yjfl = str(pr.get("yjfl") or "")
        cpbh = str(pr.get("zycpbh") or "")
        wxzj = _to_float(pr.get("wxzjz"))

        if tjws2 <= 20:
            key = f"{cpfl}-{yjfl}"
            if key not in fnumberz:
                fnumberz[key] = len(fnumberz)
                fnumber1[fnumberz[key]] = yjfl
                fnumber3[fnumberz[key]] = 1
                tjws3 += 1
            else:
                idx = fnumberz[key]
                fnumber3[idx] = int(fnumber3[idx]) + 1
            tjws7 += 1

        _safe_write(ws, f"A{row_no}", str(i1 - 1))
        _safe_write(ws, f"B{row_no}", cpbh)
        _safe_write(ws, f"D{row_no}", yjfl)
        _safe_write(ws, f"E{row_no}", int(_to_float(pr.get("chsl"))))
        _safe_write(ws, f"F{row_no}", round(wxzj * 100) / 100)

        if cpbh:
            zscp_rows = run_sql(
                f"select cgdj, rmbdj, khsj, tsl, topcz, ctime, ywpm from zscp "
                f"where (cpbh='{esc_sql(cpbh)}') or (krhh='{esc_sql(cpbh)}') limit 1"
            )
            if zscp_rows:
                zs = zscp_rows[0]
                _safe_write(ws, f"G{row_no}", round(_to_float(zs.get("cgdj")) * 100) / 100)
                _safe_write(ws, f"C{row_no}", str(zs.get("ywpm") or ""))
                _safe_write(ws, f"I{row_no}", _to_float(zs.get("tsl")))
                _safe_write(ws, f"M{row_no}", str(zs.get("topcz") or ""))
                _safe_write(ws, f"N{row_no}", _fmt_dt(zs.get("ctime")))
                _safe_write(ws, f"O{row_no}", str(zs.get("khsj") or ""))

            cymx = _query_other_customer_cymx(cpbh, da1, da2, wxbm, da6)
            if cymx:
                _safe_write(ws, f"P{row_no}", str(cymx.get("ywry") or ""))
                _safe_write(ws, f"Q{row_no}", str(cymx.get("gdry") or ""))
                _safe_write(ws, f"H{row_no}", str(cymx.get("khmc") or ""))
                if hl != 0:
                    zjej += _to_float(cymx.get("zjej")) * hl
                    mjzjj += _to_float(cymx.get("mjzjj"))
                    yj_r11 += _to_float(cymx.get("yjR11"))
                    yj_m11 += _to_float(cymx.get("yjM11")) * hl
                    ay_r11 += _to_float(cymx.get("ayR11"))
                    ay_m11 += _to_float(cymx.get("ayM11")) * hl
                    tse += _to_float(cymx.get("tse"))
                    flzj1 += _to_float(cymx.get("flzj1"))
                    base = (
                        _to_float(cymx.get("zjej")) * hl + _to_float(cymx.get("mjzjj"))
                        - _to_float(cymx.get("yjR11")) - _to_float(cymx.get("yjM11")) * hl
                    )
                    if base > 0:
                        gczj += _to_float(cymx.get("gczj"))
                    k_val, l_val = _calc_other_customer_sheet2_margin(cymx, hl, mlb, sb)
                    _safe_write(ws, f"K{row_no}", k_val if base > 0 else 0)
                    _safe_write(ws, f"L{row_no}", l_val if base > 0 else 0)
                else:
                    _safe_write(ws, f"K{row_no}", 0)
                    _safe_write(ws, f"L{row_no}", 0)

    if i1 >= 3:
        border_rng = ws.range(f"A3:O{i1 + 1}")
        for edge in (7, 8, 9, 10, 11, 12):
            border_rng.api.Borders(edge).LineStyle = 1

    base_total = zjej + mjzjj - yj_r11 - yj_m11
    if base_total > 0:
        avg = round(
            ((base_total - ay_r11 - ay_m11 + tse - (gczj + flzj1) - base_total * mlb) / base_total) * 10000
        ) / 100
        _safe_write(ws, f"K{i1 + 2}", f"{dy1}{wxbm}出货产品平均毛利率：{avg}%")

    if tjws7 > 0:
        tjws4 = 0.0
        for n4 in range(len(fnumberz)):
            col = TOP20_EXPORT_COLS[n4]
            _safe_write(ws, f"{col}2", fnumber1.get(n4, ""))
            ratio = round(int(fnumber3.get(n4, 0)) / tjws7 * 1000) / 1000
            tjws4 += ratio
            if n4 + 1 == tjws3:
                ratio = ratio + 1 - tjws4
            _safe_write(ws, f"{col}3", ratio)


def export_other_customer_workbook(rid, da6="2"):
    """其他客人统计表导出（Pascal 其他客人统计表.pas）"""
    if str(da6 or "").strip() != "1":
        da6 = "2"

    header_rows = run_sql(
        f"select qsrq, jsrq, hl, bm from chjdtj where rid='{esc_sql(rid)}' limit 1"
    )
    if not header_rows:
        raise ValueError("未找到统计记录")
    header = header_rows[0]

    wxbm = str(header.get("bm") or "").strip()
    hl = _to_float(header.get("hl"))
    da1 = _fmt_dt(header.get("qsrq"))
    da2 = _fmt_dt(header.get("jsrq"))

    if not wxbm:
        raise ValueError("请先填写部门")
    if hl <= 0:
        raise ValueError("请先填写汇率")
    if not da1 or not da2:
        raise ValueError("请先填写起始日期和结束日期")

    qsrq_s = da1
    dy = qsrq_s[:4] + "年" + qsrq_s[5:7] + "月" if len(qsrq_s) >= 7 else ""
    dy1 = qsrq_s[5:7] + "月" if len(qsrq_s) >= 7 else ""

    sb_rows = run_sql("select bz from cyzglsheet where (zm='其他客人毛利比开关') limit 1")
    sb = str(sb_rows[0].get("bz") or "") if sb_rows else ""

    base_path = os.path.join(config.data_upload_path, "template")
    tpl_path = None
    for name in (TEMPLATE_OTHER_CUSTOMER, "其他客人统计表.xlsx"):
        p = os.path.join(base_path, name)
        if os.path.exists(p):
            tpl_path = p
            break
    if not tpl_path:
        raise FileNotFoundError("模版文件不存在，请将 其他客人统计表.xls 或 .xlsx 放入 template 目录")

    out_name = f"其他客人统计表_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    out_path = os.path.join(config.tmp_path, out_name)
    shutil.copy2(tpl_path, out_path)

    app = None
    wb = None
    try:
        app = _start_excel_app()
        wb = app.books.open(out_path)
        _fill_other_customer_sheet1(wb.sheets[0], da1, da2, wxbm, hl, sb, da6)
        _fill_other_customer_sheet2(wb.sheets[1], da1, da2, wxbm, hl, sb, da6, dy, dy1)
        wb.save()
        wb.close()
        wb = None
        return out_name
    finally:
        if wb is not None:
            wb.close()
        if app is not None:
            try:
                app.quit()
            except Exception:
                pass


@any_route("/api/saier/shipment_order_statistics/order_shipment/export", methods=["POST", "GET"])
@require_token
async def view_saier_shipment_order_statistics_order_shipment_export(request):
    """下单出货数据表导出（对应 Pascal 下单出货数据表.pas）"""
    j = await request.json()
    try:
        rid = str(j.get("rid") or "").strip()
        if not rid:
            return json_result(-1, "请先保存或打开统计记录")

        out_name = export_order_shipment_workbook(rid)
        return json_result(1, "导出成功", out_name)
    except FileNotFoundError as e:
        return json_result(-1, str(e))
    except ValueError as e:
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())


@any_route("/api/saier/shipment_order_statistics/other_customer/export", methods=["POST", "GET"])
@require_token
async def view_saier_shipment_order_statistics_other_customer_export(request):
    """其他客人统计表导出（对应 Pascal 其他客人统计表.pas）"""
    j = await request.json()
    try:
        rid = str(j.get("rid") or "").strip()
        if not rid:
            return json_result(-1, "请先保存或打开统计记录")

        da6 = str(j.get("da6") or "2").strip()
        if da6 != "1":
            da6 = "2"

        out_name = export_other_customer_workbook(rid, da6)
        return json_result(1, "导出成功", out_name)
    except FileNotFoundError as e:
        return json_result(-1, str(e))
    except ValueError as e:
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
