"""
出货接单统计 相关按钮
"""

from any import *
from .model import *
import time
from datetime import datetime
import json, os
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import get_user_path, module_xxck_new, module_share_new, user_task_delete, user_task_new

SYS_FIELDS = ["sid", "rid", "uid", "ctime", "mtime", "has_att", "modi_uid", "wf_status", "wf_unit", "pid", "archived"]


def esc_sql(v):
    """SQL 字符串转义：转义单引号和反斜杠"""
    return str(v or "").replace("\\", "\\\\").replace("'", "''")


def esc_like(v):
    """SQL LIKE 条件值转义：额外转义 LIKE 通配符 % 和 _"""
    s = esc_sql(str(v or ""))
    return s.replace("%", "\\%").replace("_", "\\_")


def _can_run_statistics(dept, company_stat, qsrq, jsrq):
    """Pascal: (部门<>'' OR 公司统计='是') AND 起始/结束日期<>''"""
    if not qsrq or not jsrq:
        return False
    return bool(dept) or str(company_stat or "").strip() == "是"


def _top_n_sql(tjws):
    """Pascal: select top {统计位数}，MySQL 用 LIMIT N（0 表示不取行）"""
    return f"LIMIT {int(tjws)}"


def _fl_key(val):
    """空分类在 Pascal 中用 '1' 占位"""
    s = str(val or "")
    return "1" if s == "" else s


def _fl_sql(val):
    """SQL 条件：占位符 '1' 转回空串"""
    s = str(val or "")
    return "" if s == "1" else s


def _fl_out(val):
    """输出到前端：占位符转空串"""
    return _fl_sql(val)


def _wxbm_like(wxbmm):
    if not wxbmm:
        return "like '%'"
    return f"like '%{esc_like(wxbmm)}%'"


def _dept_in_field(wxbmm, field_val):
    """Pascal: wxbmm='' 则全计，否则 POS(wxbmm, field)"""
    if not wxbmm:
        return True
    return wxbmm in str(field_val or "")


def _sum_sheet_by_fathers(numbers, sql_tpl, wxbmm):
    total = {}
    for num in numbers:
        if not num:
            continue
        d = run_sql(sql_tpl.format(pid=esc_sql(num), wxbm=_wxbm_like(wxbmm)))
        if d:
            for k, v in d[0].items():
                total[k] = float(total.get(k) or 0) + float(v or 0)
    return total


def _customer_period_totals(kh_name, qsrq, jsrq, hl, wxbmm, sjcy1):
    """客户级 jdjez/chjez/hy*（Pascal 对照表客户循环前段）"""
    jdjez = hyjdjez = chjez = hychjez = 0.0
    wxht_sql = f"SELECT rid FROM wxht WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') and (customer='{esc_sql(kh_name)}')"
    wxht_nums = [str(r.get("rid") or "") for r in run_sql(wxht_sql)]
    wxht_sheet_sql = (
        f"SELECT SUM(ROUND((CASE WHEN khpd = '是' THEN (mjzj) / {hl} "
        f"ELSE (zje*zmyhl) END), 2)) as hychjez, "
        f"SUM(ROUND((CASE WHEN khpd = '是' THEN (mjzj-yjR1-ayR1) / {hl} "
        f"ELSE (zje*zmyhl-yjM1-ayM1) END), 2)) as chjez "
        f"FROM wxhtsheet WHERE (pid='{{pid}}') and (wxbm1 {{wxbm}})"
    )
    wxht_sum = _sum_sheet_by_fathers(wxht_nums, wxht_sheet_sql, wxbmm)
    jdjez = wxht_sum.get("chjez", 0)
    hyjdjez = wxht_sum.get("hychjez", 0)

    cymx_sql = (
        f"SELECT rid FROM cymx WHERE ({sjcy1}>='{qsrq}') and ({sjcy1}<='{jsrq}') "
        f"and (khmc='{esc_sql(kh_name)}') and (fksb='是')"
    )
    cymx_nums = [str(r.get("rid") or "") for r in run_sql(cymx_sql)]
    cymx_sheet_sql = (
        f"SELECT SUM(ROUND((CASE WHEN RMBkh = '是' THEN (mjzj) / {hl} "
        f"ELSE (wxzj*zmyhl) END), 2)) as hychjez, "
        f"SUM(ROUND((CASE WHEN RMBkh = '是' THEN (mjzj-yjR1-ayR1) / {hl} "
        f"ELSE (wxzj*zmyhl-yjM1-ayM1) END), 2)) as chjez "
        f"FROM cymxsheet WHERE (pid='{{pid}}') and (wxbm1 {{wxbm}}) and (ewchy<>'是')"
    )
    cymx_sum = _sum_sheet_by_fathers(cymx_nums, cymx_sheet_sql, wxbmm)
    chjez = cymx_sum.get("chjez", 0)
    hychjez = cymx_sum.get("hychjez", 0)
    return jdjez, hyjdjez, chjez, hychjez


def _port_period_detail(kh_name, gk_name, qsrq, jsrq, hl, hl_div, wxbmm, sjcy1):
    """客户+港口+周期明细（Pascal 对照表 n2 循环内）"""
    jdje = hyjdje = 0.0
    mjzj1 = hymjzj1 = wxzj1 = hywxzj1 = 0.0
    fpfy1 = fpfy01 = bf1 = bf11 = gczj1 = tse1 = yj = ayj = 0.0
    xdlf = chlf = 0.0
    xdgs = chgs = 0

    wxht_nums = run_sql(
        f"SELECT rid FROM wxht WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
        f"and (customer='{esc_sql(kh_name)}') and (mdka='{esc_sql(gk_name)}')"
    )
    fathers = [str(r.get("rid") or "") for r in wxht_nums]
    for num in fathers:
        if not num:
            continue
        d = run_sql(
            f"SELECT SUM(ROUND((CASE WHEN khpd = '是' THEN (mjzj) / {hl} "
            f"ELSE (zje*zmyhl) END), 2)) as hychjez1, "
            f"SUM(ROUND((CASE WHEN khpd = '是' THEN (mjzj-yjR1-ayR1) / {hl} "
            f"ELSE (zje*zmyhl-yjM1-ayM1) END), 2)) as chjez1 "
            f"FROM wxhtsheet WHERE (pid='{esc_sql(num)}') and (wxbm1 {_wxbm_like(wxbmm)})"
        )
        if d:
            jdje += float(d[0].get("chjez1") or 0)
            hyjdje += float(d[0].get("hychjez1") or 0)

    yxd_rows = run_sql(
        f"SELECT wxbm FROM wxht WHERE (yjcq>='{qsrq}') and (yjcq<='{jsrq}') "
        f"and (customer='{esc_sql(kh_name)}') and (mdka='{esc_sql(gk_name)}')"
    )
    for r in yxd_rows:
        if _dept_in_field(wxbmm, r.get("wxbm")):
            xdgs += 1

    d = run_sql(
        f"SELECT sum(ztj) as ztj1 FROM wxhtsheet "
        f"WHERE (yjcq>='{qsrq}') and (yjcq<='{jsrq}') "
        f"and (mdka='{esc_sql(gk_name)}') and (khmc='{esc_sql(kh_name)}') "
        f"and (wxbm1 {_wxbm_like(wxbmm)})"
    )
    if d:
        xdlf += float(d[0].get("ztj1") or 0)

    cymx_rows = run_sql(
        f"SELECT rid, ywbm FROM cymx "
        f"WHERE ({sjcy1}>='{qsrq}') and ({sjcy1}<='{jsrq}') "
        f"and (khmc='{esc_sql(kh_name)}') and (mdck='{esc_sql(gk_name)}') and (fksb='是')"
    )
    cymx_fathers = []
    for r in cymx_rows:
        cymx_fathers.append(str(r.get("rid") or ""))
        if _dept_in_field(wxbmm, r.get("ywbm")):
            chgs += 1

    for num in cymx_fathers:
        if not num:
            continue
        d = run_sql(
            f"SELECT sum(wxzj*zmyhl) as hychjez1, sum(wxzj*zmyhl-yjM1-ayM1) as chjez1, "
            f"sum(mjzj) as hymjzj1, sum(mjzj-yjR1-ayR1) as mjzj1, "
            f"sum(fpfy) as fpfy1, sum(fpfy$) as fpfy01, sum(bf) as bf1, sum(bf$) as bf11, "
            f"sum(gczjrmb) as gczj1, sum(tse) as tse1, sum(yj*zmyhl) as yj1, "
            f"sum(ayj*zmyhl) as ayj1, sum(ztj) as ztj1 "
            f"FROM cymxsheet WHERE (pid='{esc_sql(num)}') and (RMBkh<>'是') "
            f"and (wxbm1 {_wxbm_like(wxbmm)}) and (ewchy<>'是')"
        )
        if d:
            row = d[0]
            wxzj1 += float(row.get("chjez1") or 0)
            hywxzj1 += float(row.get("hychjez1") or 0)
            yj += float(row.get("yj1") or 0) * hl_div
            ayj += float(row.get("ayj1") or 0) * hl_div
            fpfy1 += float(row.get("fpfy1") or 0)
            fpfy01 += float(row.get("fpfy01") or 0)
            bf1 += float(row.get("bf1") or 0)
            bf11 += float(row.get("bf11") or 0)
            gczj1 += float(row.get("gczj1") or 0)
            tse1 += float(row.get("tse1") or 0)
            chlf += float(row.get("ztj1") or 0)

        d = run_sql(
            f"SELECT sum(mjzj) as hymjzj1, sum(mjzj-yjR1-ayR1) as mjzj1, "
            f"sum(fpfy) as fpfy1, sum(fpfy$) as fpfy01, sum(bf) as bf1, sum(bf$) as bf11, "
            f"sum(gczjrmb) as gczj1, sum(tse) as tse1, sum(yj) as yj1, "
            f"sum(ayj) as ayj1, sum(ztj) as ztj1 "
            f"FROM cymxsheet WHERE (pid='{esc_sql(num)}') and (RMBkh='是') "
            f"and (wxbm1 {_wxbm_like(wxbmm)}) and (ewchy<>'是')"
        )
        if d:
            row = d[0]
            yj += float(row.get("yj1") or 0)
            ayj += float(row.get("ayj1") or 0)
            mjzj1 += float(row.get("mjzj1") or 0)
            hymjzj1 += float(row.get("hymjzj1") or 0)
            fpfy1 += float(row.get("fpfy1") or 0)
            fpfy01 += float(row.get("fpfy01") or 0)
            bf1 += float(row.get("bf1") or 0)
            bf11 += float(row.get("bf11") or 0)
            gczj1 += float(row.get("gczj1") or 0)
            tse1 += float(row.get("tse1") or 0)
            chlf += float(row.get("ztj1") or 0)

    chje = wxzj1 + mjzj1 / hl_div
    hychje = hywxzj1 + hymjzj1 / hl_div
    return {
        "jdje": jdje,
        "hyjdje": hyjdje,
        "chje": chje,
        "hychje": hychje,
        "mjzj1": mjzj1,
        "hymjzj1": hymjzj1,
        "wxzj1": wxzj1,
        "hywxzj1": hywxzj1,
        "fpfy1": fpfy1,
        "fpfy01": fpfy01,
        "bf1": bf1,
        "bf11": bf11,
        "gczj1": gczj1,
        "tse1": tse1,
        "yj": yj,
        "ayj": ayj,
        "xdlf": xdlf,
        "chlf": chlf,
        "xdgs": xdgs,
        "chgs": chgs,
    }


def _duizhao_row(
    seq,
    tjyf,
    kh_name,
    gk_name,
    port,
    cust_chjez,
    cust_jdjez,
    cust_hychjez,
    cust_hyjdjez,
    hl_fee,
    hl_mll_check,
    hl_mll_div,
    mlb,
):
    """组装对照表单行（Pascal append 块）"""
    chje = port["chje"]
    jdje = port["jdje"]
    if chje <= 0 and jdje <= 0:
        return None

    wxzj1, mjzj1 = port["wxzj1"], port["mjzj1"]
    hywxzj1, hymjzj1 = port["hywxzj1"], port["hymjzj1"]
    yj, ayj, gczj1, tse1 = port["yj"], port["ayj"], port["gczj1"], port["tse1"]
    fpfy1, fpfy01 = port["fpfy1"], port["fpfy01"]
    bf1, bf11 = port["bf1"], port["bf11"]

    mlhj = (hywxzj1 * hl_fee - yj + hymjzj1) - (hywxzj1 * hl_fee - yj + hymjzj1) * (1 - mlb / 100) - gczj1 - ayj + tse1
    if wxzj1 * hl_mll_check + mjzj1 - yj > 0:
        mll = (mlhj / (hywxzj1 * hl_mll_div + hymjzj1 - yj)) * 100
    else:
        mll = 0.0

    return {
        "seq": seq,
        "tjyf": tjyf,
        "customer": kh_name,
        "gkmc": gk_name,
        "chje": round(chje, 2),
        "hychje": round(port["hychje"], 2),
        "jdje": round(jdje, 2),
        "chze": round(cust_chjez, 2),
        "jdze": round(cust_jdjez, 2),
        "chkh_rmb": round(mjzj1, 2),
        "ch_usd": round(wxzj1, 2),
        "hyjdje": round(port["hyjdje"], 2),
        "hychze": round(cust_hychjez, 2),
        "hyjdze": round(cust_hyjdjez, 2),
        "hychkh_rmb": round(hymjzj1, 2),
        "hych_usd": round(hywxzj1, 2),
        "cgrmb": round(gczj1, 2),
        "tshj": round(tse1, 2),
        "fyhj": round(fpfy01 * hl_fee + fpfy1, 2),
        "bfhj": round(bf11 * hl_fee + bf1, 2),
        "mlhj": round(mlhj, 2),
        "mll": round(mll, 2),
        "yxdgs": port["xdgs"],
        "yxdlf": format(round(port["xdlf"], 3), ".3f"),
        "chgs": port["chgs"],
        "chlf": format(round(port["chlf"], 3), ".3f"),
    }


def _collect_duizhao_lists(qsrq, jsrq, qsrq1, jsrq1, khmc_sql, sjcy1):
    """收集对照表客户/港口列表（Pascal kh/gkmc 收集）"""
    kh_list, gkmc_list = [], []

    def _add_rows(rows):
        for r in rows:
            k = str(r.get("kh") or "").strip()
            g = str(r.get("gk") or "").strip()
            if k and k not in kh_list:
                kh_list.append(k)
            if g and g not in gkmc_list:
                gkmc_list.append(g)

    _add_rows(
        run_sql(
            f"SELECT distinct customer as kh, mdka as gk FROM wxht "
            f"WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') and (customer {khmc_sql})"
        )
    )
    _add_rows(
        run_sql(
            f"SELECT distinct khmc as kh, mdck as gk FROM cymx "
            f"WHERE ({sjcy1}>='{qsrq}') and ({sjcy1}<='{jsrq}') "
            f"and (fksb='是') and (khmc {khmc_sql})"
        )
    )
    if qsrq1 and jsrq1:
        _add_rows(
            run_sql(
                f"SELECT distinct customer as kh, mdka as gk FROM wxht "
                f"WHERE (jdrq>='{qsrq1}') and (jdrq<='{jsrq1}') and (customer {khmc_sql})"
            )
        )
        _add_rows(
            run_sql(
                f"SELECT distinct khmc as kh, mdck as gk FROM cymx "
                f"WHERE ({sjcy1}>='{qsrq1}') and ({sjcy1}<='{jsrq1}') "
                f"and (fksb='是') and (khmc {khmc_sql})"
            )
        )
    return kh_list, gkmc_list


def _build_duizhao(kh_list, gkmc_list, qsrq, jsrq, qsrq1, jsrq1, hl, hl1, wxbmm, sjcy1, mlb):
    """对照表：每客户×港口×（本期+去年）两行"""
    duizhao_list = []
    seq = 0
    for kh_name in kh_list:
        jdjez, hyjdjez, chjez, hychjez = _customer_period_totals(kh_name, qsrq, jsrq, hl, wxbmm, sjcy1)
        jdjez1 = hyjdjez1 = chjez1 = hychjez1 = 0.0
        if qsrq1 and jsrq1:
            jdjez1, hyjdjez1, chjez1, hychjez1 = _customer_period_totals(kh_name, qsrq1, jsrq1, hl, wxbmm, sjcy1)

        for gk_name in gkmc_list:
            port_cur = _port_period_detail(kh_name, gk_name, qsrq, jsrq, hl, hl, wxbmm, sjcy1)
            row = _duizhao_row(
                seq + 1, qsrq[:7], kh_name, gk_name, port_cur, chjez, jdjez, hychjez, hyjdjez, hl, hl, hl, mlb
            )
            if row:
                seq += 1
                row["seq"] = seq
                duizhao_list.append(row)

            if qsrq1 and jsrq1:
                port_ly = _port_period_detail(kh_name, gk_name, qsrq1, jsrq1, hl, hl1, wxbmm, sjcy1)
                row_ly = _duizhao_row(
                    seq + 1, qsrq1[:7], kh_name, gk_name, port_ly, chjez1, jdjez1, hychjez1, hyjdjez1, hl1, hl, hl1, mlb
                )
                if row_ly:
                    seq += 1
                    row_ly["seq"] = seq
                    duizhao_list.append(row_ly)
    return duizhao_list


def _build_xiadan_stats(qsrq, jsrq, khmc_sql, wxbmm, hl_rmb):
    """下单/前下单产品统计表（Pascal 2736+ 段）"""
    stats = []
    sql = (
        f"SELECT yjfl, ejfl FROM wxhtsheet "
        f"WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
        f"and (khmc {khmc_sql}) and (wxbm1 {_wxbm_like(wxbmm)})"
    )
    cpfl_set = set()
    for r in run_sql(sql):
        cpfl_set.add((str(r.get("yjfl") or ""), str(r.get("ejfl") or "")))

    cply_keywords = [
        ("返单", "fds"),
        ("询价", "xjs"),
        ("采购推荐", "cgtj"),
        ("外销推荐", "wxtj"),
        ("客户自选", "khzx"),
        ("样品录入", "yplr"),
    ]

    for yjfl_val, ejfl_val in cpfl_set:
        chsl_sum = wxzj_sum = hywxzj_sum = 0.0
        xds = fds = xjs = cgtj = wxtj = khzx = yplr = jycp = cpbh2 = 0
        cpbh1_list = []

        d = run_sql(
            f"SELECT htsl, zycpbh, zje, mjzj, khpd, yjR1, ayR1, yjM1, ayM1, zmyhl FROM wxhtsheet "
            f"WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
            f"and (wxbm1 {_wxbm_like(wxbmm)}) "
            f"and (yjfl='{esc_sql(yjfl_val)}') and (khmc {khmc_sql}) "
            f"and (ejfl='{esc_sql(ejfl_val)}')"
        )
        for r in d:
            cpbhz = str(r.get("zycpbh") or "")
            if cpbhz and cpbhz not in cpbh1_list:
                cpbh1_list.append(cpbhz)
                cpbh2 += 1
            chsl_sum += float(r.get("htsl") or 0)
            if str(r.get("khpd") or "") == "是":
                wxzj_sum += (float(r.get("mjzj") or 0) - float(r.get("yjR1") or 0) - float(r.get("ayR1") or 0)) / hl_rmb
                hywxzj_sum += float(r.get("mjzj") or 0) / hl_rmb
            else:
                wxzj_sum += (
                    float(r.get("zje") or 0) * float(r.get("zmyhl") or 1)
                    - float(r.get("yjM1") or 0)
                    - float(r.get("ayM1") or 0)
                )
                hywxzj_sum += float(r.get("zje") or 0) * float(r.get("zmyhl") or 1)
            xds += 1

        for cpbh_item in cpbh1_list:
            for kw, field in cply_keywords:
                d = run_sql(
                    f"SELECT 1 FROM wxhtsheet "
                    f"WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
                    f"and (wxbm1 {_wxbm_like(wxbmm)}) "
                    f"and (yjfl='{esc_sql(yjfl_val)}') and (zycpbh='{esc_sql(cpbh_item)}') "
                    f"and (cply1 like '%{kw}%') and (khmc {khmc_sql}) "
                    f"and (ejfl='{esc_sql(ejfl_val)}') limit 1"
                )
                if d:
                    if field == "fds":
                        fds += 1
                    elif field == "xjs":
                        xjs += 1
                    elif field == "cgtj":
                        cgtj += 1
                    elif field == "wxtj":
                        wxtj += 1
                    elif field == "khzx":
                        khzx += 1
                    elif field == "yplr":
                        yplr += 1

        d = run_sql(
            f"SELECT count(*) as counts FROM jyglcp "
            f"WHERE (jysj>='{qsrq}') and (jysj<='{jsrq}') "
            f"and (yjfl='{esc_sql(yjfl_val)}') and (jsr<>jsr1) "
            f"and (khmc {khmc_sql}) and (ejfl='{esc_sql(ejfl_val)}') "
            f"and (ywbm {_wxbm_like(wxbmm)})"
        )
        if d:
            jycp = int(d[0].get("counts") or 0)

        stats.append(
            {
                "xds": xds,
                "cpfl1": yjfl_val,
                "yjfl": yjfl_val,
                "ejfl": ejfl_val,
                "wxzj": round(wxzj_sum, 2),
                "chsl": round(chsl_sum, 2),
                "fds": fds,
                "xjs": xjs,
                "cgtj": cgtj,
                "wxtj": wxtj,
                "khzx": khzx,
                "yplr": yplr,
                "jycp": jycp,
                "cpbh2": cpbh2,
                "hywxzj": round(hywxzj_sum, 2),
            }
        )
    return stats


# 部门判断 - 部门字段变化时校验权限
@any_route("/api/saier/shipment_order_statistics/dept/change", methods=["POST", "GET"])
@require_token
async def view_saier_shipment_order_statistics_dept_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        dept = j.get("dept", "")
        tjry = j.get("tjry", "")

        if not dept:
            return json_result(1, "", {"clear_dept": 0})

        # 1. 高管免审（Pascal: select * from sys_users where name=:name and position like...）
        is_executive = (
            s.query(sys_user)
            .filter(
                sys_user.username == user.username,
                or_(
                    sys_user.position.like("%公司%"),
                    sys_user.position.like("%总经理%"),
                    sys_user.position.like("%外销总监%"),
                ),
            )
            .first()
        )

        if is_executive:
            return json_result(1, "", {"clear_dept": 0})

        # 2. 非高管：查 ywrybiao 验证权限（Pascal: select bm from ywrybiao where ...）
        has_perm = (
            s.query(ywrybiao)
            .filter(ywrybiao.bm == dept, or_(ywrybiao.bmjl == tjry, ywrybiao.sybzj == tjry, ywrybiao.yhm == tjry))
            .first()
        )

        if not has_perm:
            return json_result(1, "不好意思,此组不在您的部门,请重新选择,谢谢!", {"clear_dept": 1})

        return json_result(1, "", {"clear_dept": 0})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 新样识别 - 记录加载时初始化字段状态
@any_route("/api/saier/shipment_order_statistics/load/check", methods=["POST", "GET"])
@require_token
async def view_saier_shipment_order_statistics_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        dept = j.get("dept", "")

        # 判断当前用户是否为高管（Pascal: select * from sys_users where name=:name ...）
        is_executive = (
            s.query(sys_user)
            .filter(
                sys_user.username == user.username,
                or_(
                    sys_user.position.like("%公司%"),
                    sys_user.position.like("%总经理%"),
                    sys_user.position.like("%外销总监%"),
                ),
            )
            .first()
        )

        data = {"is_executive": bool(is_executive)}

        if is_executive:
            if not dept:
                # 高管且部门为空：公司统计="是"，公司统计可编辑，部门禁用
                data["gstj_default"] = "是"
                data["gstj_disabled"] = False
                data["dept_disabled"] = True
            else:
                # 高管且部门不为空：切换为按部门统计
                data["gstj_default"] = "否"
                data["gstj_disabled"] = False
                data["dept_disabled"] = False
        else:
            # 非高管：公司统计="否"，公司统计禁用
            data["gstj_default"] = "否"
            data["gstj_disabled"] = True
            data["dept_disabled"] = False

        return json_result(1, "", data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# ============================================================
# 统计操作 - 出货接单统计主接口（对应 Pascal 统计操作.pas，3673行）
# ============================================================
@any_route("/api/saier/shipment_order_statistics/do_statistics", methods=["POST", "GET"])
@require_token
async def view_saier_shipment_order_statistics_do(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        # ========== 基础参数 ==========
        qsrq = j.get("qsrq", "")
        jsrq = j.get("jsrq", "")
        qsrq1 = j.get("qsrq1", "")
        jsrq1 = j.get("jsrq1", "")
        dept = j.get("dept", "")
        company_stat = j.get("company_stat", "")
        customer = j.get("customer", "")
        gykr = j.get("gykr", "")
        stat_type = j.get("stat_type", "金额")
        tjws = int(j.get("tjws") or 0)
        hl = float(j.get("hl") or 0)
        sjcy = j.get("sjcy", "sjcy")
        sjcy1 = j.get("sjcy1", "sjcy1")
        wxbmm = dept

        if not qsrq or not jsrq:
            return json_result(-1, "起始日期和结束日期不能为空")

        can_run = _can_run_statistics(dept, company_stat, qsrq, jsrq)

        # ========== 1. 查询汇率（Pascal: 用起始日期1[:7] 查 hshl） ==========
        y = qsrq1[:7] if len(qsrq1) >= 7 else ""
        hl1 = 0.0
        if y:
            d = run_sql(f"select hl from hshl where hsrq like '%{esc_sql(y)}%' limit 1")
            if d:
                hl1 = float(d[0].get("hl") or 0)
        if hl1 <= 0.0000001:
            hl1 = hl

        # ========== 2. 查询毛利率（Pascal: select top 1 mlb from wfgs where mlb>0） ==========
        mlb = 100.0
        d = run_sql("select mlb from wfgs where mlb>0 limit 1")
        if d:
            mlb = float(d[0].get("mlb") or 100)

        # ========== 3. 更新空分类字段（Pascal: update ... set ejfl="" where ejfl is null） ==========
        run_sql('update wxhtsheet set ejfl="" where ejfl is null')
        run_sql('update wxhtsheet set yjfl="" where yjfl is null')
        run_sql('update cymxsheet set yjfl="" where yjfl is null')
        run_sql('update cymxsheet set ejfl="" where ejfl is null')

        # ========== 初始化统计结果 ==========
        result = {
            "summary": {"chuhuo": {}, "jiedan": {}, "qian_jiedan": {}, "qita": {}},
            "duizhao": [],
            "chuhuo_product": [],
            "xiadan_product": [],
            "chuhuo_category": [],
            "xiadan_stats": [],
            "qian_xiadan_stats": [],
        }

        chze = 0.0
        hychze = 0.0
        chzs = 0.0
        xdzs = 0.0
        gcpk = 0.0
        kfpk = 0.0

        # --------------------------------------------------------
        # 公共辅助：根据 customer 是否为空决定 khmc 条件
        # --------------------------------------------------------
        khmc_sql = f"like '%{esc_sql(gykr)}%'" if not customer else f"='{esc_sql(customer)}'"

        if not can_run:
            # Pascal: 不满足 gate 时不统计，仅保留末尾费用查询
            result["summary"]["chuhuo"] = {"chze": 0, "hychze": 0, "chzs": 0, "xdzs": 0}
            result["summary"]["jiedan"] = {"kfpk": 0, "gcpk": 0}
        else:
            # --------------------------------------------------------
            # 4. 基础合计统计
            # --------------------------------------------------------
            sql = (
                f"SELECT SUM(ROUND((CASE WHEN RMBkh = '是' THEN (mjzj) / {hl} "
                f"ELSE (wxzj*zmyhl) END), 2)) as hychze, "
                f"SUM(ROUND((CASE WHEN RMBkh = '是' THEN (mjzj-yjR1-ayR1) / {hl} "
                f"ELSE (wxzj*zmyhl-yjM1-ayM1) END), 2)) as chze "
                f"FROM cymxsheet WHERE ({sjcy}>='{qsrq}') and ({sjcy}<='{jsrq}') "
                f"and (khmc {khmc_sql}) and (wxbm1 {_wxbm_like(wxbmm)}) "
                f"and (fksb='是') and (ewchy<>'是')"
            )
            d = run_sql(sql)
            if d:
                hychze = float(d[0].get("hychze") or 0)
                chze = float(d[0].get("chze") or 0)

            sql = (
                f"SELECT pkje FROM gongcspsheet1 "
                f"WHERE (sprq>='{qsrq}') and (sprq<='{jsrq}') "
                f"and (khmc {khmc_sql}) and (wxbm {_wxbm_like(wxbmm)})"
            )
            for r in run_sql(sql):
                gcpk += float(r.get("pkje") or 0)

            sql = (
                f"SELECT pkje FROM khspsheet1 "
                f"WHERE (sprq>='{qsrq}') and (sprq<='{jsrq}') "
                f"and (hbdm<>'USD$') and (khmc {khmc_sql}) "
                f"and (wxbm {_wxbm_like(wxbmm)})"
            )
            for r in run_sql(sql):
                kfpk += float(r.get("pkje") or 0)

            sql = (
                f"SELECT pkje FROM khspsheet1 "
                f"WHERE (sprq>='{qsrq}') and (sprq<='{jsrq}') "
                f"and (hbdm='USD$') and (khmc {khmc_sql}) "
                f"and (wxbm {_wxbm_like(wxbmm)})"
            )
            for r in run_sql(sql):
                kfpk += float(r.get("pkje") or 0) * hl

            sql = (
                f"SELECT count(*) as chzs FROM cymxsheet "
                f"WHERE ({sjcy}>='{qsrq}') and ({sjcy}<='{jsrq}') "
                f"and (fksb='是') and (khmc {khmc_sql}) "
                f"and (wxbm1 {_wxbm_like(wxbmm)}) and (ewchy<>'是')"
            )
            d = run_sql(sql)
            if d:
                chzs = float(d[0].get("chzs") or 0)

            sql = (
                f"SELECT count(*) as xdzs FROM cymxsheet "
                f"WHERE ({sjcy}>='{qsrq}') and ({sjcy}<='{jsrq}') "
                f"and (fksb='是') and (khmc {khmc_sql}) "
                f"and (wxbm1 {_wxbm_like(wxbmm)}) and (ewchy<>'是') group by cpbh"
            )
            for r in run_sql(sql):
                xdzs += 1

            # --------------------------------------------------------
            # 5. 对照表（客户合计 + 客户×港口×两期两行）
            # --------------------------------------------------------
            kh_list, gkmc_list = _collect_duizhao_lists(qsrq, jsrq, qsrq1, jsrq1, khmc_sql, sjcy1)
            result["duizhao"] = _build_duizhao(kh_list, gkmc_list, qsrq, jsrq, qsrq1, jsrq1, hl, hl1, wxbmm, sjcy1, mlb)

            # --------------------------------------------------------
            # 6. 出货产品 / 下单产品 / 出货类别 / 下单统计
            # --------------------------------------------------------
            chuhuo_products = []
            xiadan_products = []
            chuhuo_category = []
            xiadan_stats = []
            qian_xiadan_stats = []

            order_col = "sum(wxzjz)" if stat_type == "金额" else "sum(chsl)"
            order_col2 = "sum(zjez)" if stat_type == "金额" else "sum(htsl)"
            top_clause = _top_n_sql(tjws)

            # --- 出货产品统计表 Top N ---
            cpflz, cpbh_list, yjfl_list, ejfl_list = [], [], [], []
            cp_rows = run_sql(
                f"SELECT cpbh, yjfl, ejfl, {order_col} as wxzj1 "
                f"FROM cymxsheet WHERE ({sjcy}>='{qsrq}') and ({sjcy}<='{jsrq}') "
                f"and (khmc {khmc_sql}) and (fksb='是') "
                f"and (wxbm1 {_wxbm_like(wxbmm)}) and (ewchy<>'是') "
                f"group by yjfl, ejfl, cpbh ORDER BY wxzj1 DESC {top_clause}"
            )
            for cp_row in cp_rows:
                yj_raw = str(cp_row.get("yjfl") or "")
                ej_raw = str(cp_row.get("ejfl") or "")
                cpbh_val = str(cp_row.get("cpbh") or "")
                key = f"{yj_raw}-{ej_raw}-{cpbh_val}"
                if key in cpflz:
                    continue
                cpflz.append(key)
                yjfl_list.append(_fl_key(yj_raw))
                ejfl_list.append(_fl_key(ej_raw))
                cpbh_list.append(cpbh_val)

            for i, cpbh_val in enumerate(cpbh_list):
                yjfl_val = yjfl_list[i]
                ejfl_val = ejfl_list[i]
                yj_sql = esc_sql(_fl_sql(yjfl_val))
                ej_sql = esc_sql(_fl_sql(ejfl_val))
                d = run_sql(
                    f"SELECT * FROM cymxsheet "
                    f"WHERE ({sjcy}>='{qsrq}') and ({sjcy}<='{jsrq}') "
                    f"and (fksb='是') and (cpbh='{esc_sql(cpbh_val)}') "
                    f"and (cpbh<>'') and (cpbh is not null) "
                    f"and (khmc {khmc_sql}) and (wxbm1 {_wxbm_like(wxbmm)}) "
                    f"and (yjfl='{yj_sql}') and (ejfl='{ej_sql}') and (ewchy<>'是')"
                )
                chsl_sum = wxzj_sum = hywxzj_sum = 0.0
                xds = fds1 = xjs1 = cgtj1 = wxtj1 = khzx1 = yplr1 = 0
                chly = cpfl1 = khhh = zycpbh = zwpm = ywpm = ""
                for r in d:
                    if not chly:
                        chly = str(r.get("cply1") or "")
                    cpfl1 = str(r.get("cpfl") or "")
                    khhh = str(r.get("khhh") or "")
                    zycpbh = str(r.get("zycpbh") or "")
                    zwpm = str(r.get("zwpm") or "")
                    ywpm = str(r.get("ywpm") or "")
                    chsl_sum += float(r.get("chsl") or 0)
                    if str(r.get("RMBkh") or "") == "是":
                        wxzj_sum += (
                            float(r.get("mjzj") or 0) - float(r.get("yjR1") or 0) - float(r.get("ayR1") or 0)
                        ) / hl
                        hywxzj_sum += float(r.get("mjzj") or 0) / hl
                    else:
                        wxzj_sum += (
                            float(r.get("wxzj") or 0) * float(r.get("zmyhl") or 1)
                            - float(r.get("yjM1") or 0)
                            - float(r.get("ayM1") or 0)
                        )
                        hywxzj_sum += float(r.get("wxzj") or 0) * float(r.get("zmyhl") or 1)
                    xds += 1
                    cply1 = str(r.get("cply1") or "")
                    if "返单" in cply1:
                        fds1 += 1
                    if "询价" in cply1:
                        xjs1 += 1
                    if "采购推荐" in cply1:
                        cgtj1 += 1
                    if "外销推荐" in cply1:
                        wxtj1 += 1
                    if "客户自选" in cply1:
                        khzx1 += 1
                    if "样品录入" in cply1:
                        yplr1 += 1
                chuhuo_products.append(
                    {
                        "xds": xds,
                        "cpfl1": cpfl1,
                        "yjfl": _fl_out(yjfl_val),
                        "ejfl": _fl_out(ejfl_val),
                        "wxzj": round(wxzj_sum, 2),
                        "chsl": round(chsl_sum, 2),
                        "zycpbh": zycpbh,
                        "khhh": khhh,
                        "zwpm": zwpm,
                        "ywpm": ywpm,
                        "chly": chly,
                        "fds1": fds1,
                        "xjs1": xjs1,
                        "cgtj1": cgtj1,
                        "wxtj1": wxtj1,
                        "khzx1": khzx1,
                        "yplr1": yplr1,
                        "hywxzj": round(hywxzj_sum, 2),
                    }
                )

            # --- 下单产品情况表 Top N ---
            cpflz2, cpbh_list2, yjfl_list2, ejfl_list2 = [], [], [], []
            xd_rows = run_sql(
                f"SELECT yjfl, ejfl, zycpbh, {order_col2} as wxzj1 "
                f"FROM wxhtsheet WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
                f"and (khmc {khmc_sql}) and (wxbm1 {_wxbm_like(wxbmm)}) "
                f"group by yjfl, ejfl, zycpbh ORDER BY wxzj1 DESC {top_clause}"
            )
            for xd_row in xd_rows:
                yj_raw = str(xd_row.get("yjfl") or "")
                ej_raw = str(xd_row.get("ejfl") or "")
                zycpbh_val = str(xd_row.get("zycpbh") or "")
                key = f"{yj_raw}-{ej_raw}-{zycpbh_val}"
                if key in cpflz2:
                    continue
                cpflz2.append(key)
                yjfl_list2.append(_fl_key(yj_raw))
                ejfl_list2.append(_fl_key(ej_raw))
                cpbh_list2.append(zycpbh_val)

            for i, zycpbh_val in enumerate(cpbh_list2):
                yjfl_val = yjfl_list2[i]
                ejfl_val = ejfl_list2[i]
                d = run_sql(
                    f"SELECT * FROM wxhtsheet "
                    f"WHERE (jdrq>='{qsrq}') and (jdrq<='{jsrq}') "
                    f"and (zycpbh='{esc_sql(zycpbh_val)}') and (khmc {khmc_sql}) "
                    f"and (wxbm1 {_wxbm_like(wxbmm)}) "
                    f"and (yjfl='{esc_sql(_fl_sql(yjfl_val))}') "
                    f"and (ejfl='{esc_sql(_fl_sql(ejfl_val))}')"
                )
                chsl_sum = wxzj_sum = hywxzj_sum = 0.0
                xdly = cpfl1 = khhh = zwpm = ywpm = ""
                for r in d:
                    if not xdly:
                        xdly = str(r.get("cply1") or "")
                    cpfl1 = str(r.get("cpfl") or "")
                    khhh = str(r.get("khhh") or "")
                    zwpm = str(r.get("zwpm") or "")
                    ywpm = str(r.get("ywpm") or "")
                    chsl_sum += float(r.get("htsl") or 0)
                    if str(r.get("khpd") or "") == "是":
                        wxzj_sum += (
                            float(r.get("mjzj") or 0) - float(r.get("yjR1") or 0) - float(r.get("ayR1") or 0)
                        ) / hl
                        hywxzj_sum += float(r.get("mjzj") or 0) / hl
                    else:
                        wxzj_sum += (
                            float(r.get("zje") or 0) * float(r.get("zmyhl") or 1)
                            - float(r.get("yjM1") or 0)
                            - float(r.get("ayM1") or 0)
                        )
                        hywxzj_sum += float(r.get("zje") or 0) * float(r.get("zmyhl") or 1)
                xiadan_products.append(
                    {
                        "cpfl1": cpfl1,
                        "yjfl": _fl_out(yjfl_val),
                        "ejfl": _fl_out(ejfl_val),
                        "wxzj": round(wxzj_sum, 2),
                        "chsl": round(chsl_sum, 2),
                        "zycpbh": zycpbh_val,
                        "khhh": khhh,
                        "zwpm": zwpm,
                        "ywpm": ywpm,
                        "xdly": xdly,
                        "hywxzj": round(hywxzj_sum, 2),
                    }
                )

            # --- 出货类别统计（Pascal 1411: hywxzj = wxzj + 行含佣外销总价）---
            cat_keys, cat_cpfl, cat_yj, cat_ej = [], [], [], []
            tjws1 = len(chuhuo_products)
            for p in chuhuo_products:
                key = f"{p['cpfl1']}|{p['yjfl']}|{p['ejfl']}"
                if key not in cat_keys:
                    cat_keys.append(key)
                    cat_cpfl.append(p["cpfl1"])
                    cat_yj.append(p["yjfl"])
                    cat_ej.append(p["ejfl"])
            for idx, key in enumerate(cat_keys):
                m = chsl = wxzj = 0.0
                xds = fds1 = xjs1 = cgtj1 = wxtj1 = khzx1 = yplr1 = 0
                hywxzj = 0.0
                cpfl1_v, yj_v, ej_v = cat_cpfl[idx], cat_yj[idx], cat_ej[idx]
                for p in chuhuo_products:
                    if p["cpfl1"] == cpfl1_v and p["yjfl"] == yj_v and p["ejfl"] == ej_v:
                        m += 1
                        chsl += p["chsl"]
                        wxzj += p["wxzj"]
                        hywxzj = wxzj + p["hywxzj"]
                        xds += p["xds"]
                        fds1 += p["fds1"]
                        xjs1 += p["xjs1"]
                        cgtj1 += p["cgtj1"]
                        wxtj1 += p["wxtj1"]
                        khzx1 += p["khzx1"]
                        yplr1 += p["yplr1"]
                chuhuo_category.append(
                    {
                        "cpfl1": cpfl1_v,
                        "yjfl": yj_v,
                        "ejfl": ej_v,
                        "chsl": chsl,
                        "wxzj": round(wxzj, 2),
                        "hywxzj": round(hywxzj, 2),
                        "xds": xds,
                        "fds1": fds1,
                        "xjs1": xjs1,
                        "cgtj1": cgtj1,
                        "wxtj1": wxtj1,
                        "khzx1": khzx1,
                        "yplr1": yplr1,
                        "m": int(m),
                        "zbl": round((m / tjws1) * 100, 2) if tjws1 > 0 else 0.0,
                    }
                )

            # --- 下单产品统计表 + 前下单产品统计表 ---
            xiadan_stats = _build_xiadan_stats(qsrq, jsrq, khmc_sql, wxbmm, hl)
            qian_xiadan_stats = []
            if qsrq1 and jsrq1:
                qian_xiadan_stats = _build_xiadan_stats(qsrq1, jsrq1, khmc_sql, wxbmm, hl1)

            result["chuhuo_product"] = chuhuo_products
            result["xiadan_product"] = xiadan_products
            result["chuhuo_category"] = chuhuo_category
            result["xiadan_stats"] = xiadan_stats
            result["qian_xiadan_stats"] = qian_xiadan_stats

            result["summary"]["chuhuo"] = {"chze": chze, "hychze": hychze, "chzs": chzs, "xdzs": xdzs}
            result["summary"]["jiedan"] = {"kfpk": kfpk, "gcpk": gcpk}

        # --------------------------------------------------------
        # 9. 其他费用（Pascal: 始终执行，3644-3668行）
        # --------------------------------------------------------
        rmb_fy = 0.0
        usd_fy = 0.0
        sql = (
            f"SELECT sum(seje) as RMBfy1 FROM fysq "
            f"WHERE (fkrq>='{qsrq}') and (fkrq<='{jsrq}') "
            f"and (hsbm='{esc_sql(dept)}') and (cwsp='通过') "
            f"and ((hbdm like '%RMB%') or (hbdm like '%￥%'))"
        )
        d = run_sql(sql)
        if d:
            rmb_fy = float(d[0].get("RMBfy1") or 0)

        sql = (
            f"SELECT sum(seje) as USDfy1 FROM fysq "
            f"WHERE (fkrq>='{qsrq}') and (fkrq<='{jsrq}') "
            f"and (hsbm='{esc_sql(dept)}') and (cwsp='通过') "
            f"and ((hbdm like '%USD%') or (hbdm like '%$%'))"
        )
        d = run_sql(sql)
        if d:
            usd_fy = float(d[0].get("USDfy1") or 0)

        # --------------------------------------------------------
        # 10. 组装最终返回结果
        # --------------------------------------------------------
        result["summary"]["qita"] = {"rmb_fy": rmb_fy, "usd_fy": usd_fy}

        return json_result(1, "", result)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
