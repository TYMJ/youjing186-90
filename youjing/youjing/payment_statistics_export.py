"""
付款审批 - 付款统计表导出。

对照原 Delphi「付款统计表」source.pas；基于 ``data_upload_path/template/空白.xlsx`` 模版填充数据。
"""

from any import *
from .model import *
from datetime import datetime, timedelta
import os
import shutil
import time

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

from sqlalchemy import text

TEMPLATE_BLANK = "空白.xlsx"


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



def _safe_write_center(ws, coord, value, num_format=None):
    safe_write(ws, coord, value, num_format)
    rng = ws.range(coord)
    area = rng.merge_area
    rows, cols = area.shape
    cell = area(1, 1) if rows * cols > 1 else rng
    cell.api.HorizontalAlignment = -4108
    cell.api.VerticalAlignment = -4108
    cell.api.WrapText = True


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


def _sql_date_between(field, da1, da2):
    """日期区间判断（与 batch_cost_export、payment 等模块一致，字段直接比较 yyyy-mm-dd）。"""
    d1, d2 = _esc_sql(da1), _esc_sql(da2)
    return f"({field}>='{d1}' and {field}<='{d2}')"


def _sql_empty(field):
    return f"(ifnull({field},'')='')"


def _to_float(v):
    if v in ("", None):
        return 0.0
    try:
        return float(v)
    except (TypeError, ValueError):
        return 0.0


def _parse_date(s, default=None):
    s = str(s or "").strip()
    if not s:
        return default
    if " " in s:
        s = s.split()[0]
    if "T" in s and len(s) > 10:
        s = s[:10]
    try:
        return datetime.strptime(s[:10], "%Y-%m-%d").date()
    except ValueError:
        return default


def _fmt_date(d):
    if d is None:
        return ""
    if hasattr(d, "strftime"):
        return d.strftime("%Y-%m-%d")
    return str(d)[:10]


def _pct(numerator, denominator):
    if not denominator:
        return "0.00%"
    return f"{round(numerator / denominator * 10000) / 100:.2f}%"


def _is_finance_scope(username):
    """对照 Pascal：sys_users.name → sys_user.username。"""
    u = _esc_sql(username)
    rows = run_sql(
        f"select rid from sys_user where (username='{u}') and ((username='侯柳红') or (position like '%财务%')) limit 1"
    )
    return bool(rows)


def _load_scope_lists(username, finance_scope):
    bm_list = []
    cgry_list = []
    bm1_list = []
    seen_bm = set()
    seen_cgry = set()

    if finance_scope:
        rows = run_sql("select bm, yhm from ywrybiao")
    else:
        u = _esc_sql(username)
        rows = run_sql(
            f"select bm, yhm from ywrybiao where ((yhm='{u}') or (bmjl='{u}') or (sybzj='{u}') or (sybdzj='{u}'))"
        )
    for r in rows or []:
        bm = str(r.get("bm") or "").strip()
        yhm = str(r.get("yhm") or "").strip()
        if bm and bm not in seen_bm:
            seen_bm.add(bm)
            bm_list.append(bm)
        if yhm and yhm not in seen_cgry:
            seen_cgry.add(yhm)
            cgry_list.append(yhm)
            bm1_list.append(bm)
    return bm_list, cgry_list, bm1_list


def _normalize_cwjsq(s):
    """对照 Pascal：导出前规范化 fkspsheet.cwjsq。"""
    flag = False

    rows = run_sql("select cwjsq, rid from fkspsheet where (LENGTH(cwjsq) < 9) and (LENGTH(cwjsq) > 7)")
    for r in rows or []:
        cw = str(r.get("cwjsq") or "")
        if len(cw) < 8:
            continue
        n, y, r1 = cw[:5], cw[5:7], cw[7:8]
        new_cw = f"{n}0{y}0{r1}"
        rid = _esc_sql(r.get("rid"))
        s.execute(text(f"update fkspsheet set cwjsq='{_esc_sql(new_cw)}' where (rid='{rid}')"))
        flag = True

    rows = run_sql(
        "select cwjsq, rid from fkspsheet where (LENGTH(cwjsq) < 10) and (cwjsq like '%-_') and (LENGTH(cwjsq) > 8)"
    )
    for r in rows or []:
        cw = str(r.get("cwjsq") or "")
        if len(cw) < 9:
            continue
        new_cw = f"{cw[:8]}0{cw[8:9]}"
        rid = _esc_sql(r.get("rid"))
        s.execute(text(f"update fkspsheet set cwjsq='{_esc_sql(new_cw)}' where (rid='{rid}')"))
        flag = True

    rows = run_sql("select cwjsq, rid from fkspsheet where (LENGTH(cwjsq) < 10) and (LENGTH(cwjsq) > 7)")
    for r in rows or []:
        cw = str(r.get("cwjsq") or "")
        if len(cw) < 8:
            continue
        new_cw = f"{cw[:5]}0{cw[5:9]}"
        rid = _esc_sql(r.get("rid"))
        s.execute(text(f"update fkspsheet set cwjsq='{_esc_sql(new_cw)}' where (rid='{rid}')"))
        flag = True

    s.execute(text("update fkspsheet set cwjsq='' where (LENGTH(cwjsq) < 7)"))
    if flag:
        s.commit()


def _sync_fkrq(s, cda2):
    """对照 Pascal：补全已通过且未填付款日期的 fkrq。"""
    rows = run_sql(
        f"select rid, pzrq, cywyzd from fkspsheet where "
        f"{_sql_date_between('pzrq', '2019-01-01', cda2)} and (cwsp='通过') "
        f"and {_sql_empty('fkrq')}"
    )
    if not rows:
        return

    for r in rows:
        fkrq = ""
        cywyzd = str(r.get("cywyzd") or "").strip()
        if cywyzd:
            cy = _esc_sql(cywyzd)
            d = run_sql(f"select pid from gchksheet where (cywyzd='{cy}') limit 1")
            if d:
                father = _esc_sql(d[0].get("pid"))
                d2 = run_sql(f"select hkrq from gchk where (rid='{father}') limit 1")
                if d2:
                    fkrq = str(d2[0].get("hkrq") or "").strip()
        if not fkrq:
            fkrq = str(r.get("pzrq") or "").strip()
        rid = _esc_sql(r.get("rid"))
        s.execute(text(f"update fkspsheet set fkrq='{_esc_sql(fkrq)}' where (rid='{rid}')"))
    s.commit()


def _sum_field(sql):
    rows = run_sql(sql)
    if not rows:
        return 0.0
    key = next(iter(rows[0].keys()))
    return _to_float(rows[0].get(key))


def _mode_col(mode):
    if mode == "4":
        return "cgry"
    if mode == "2":
        return "wxbm"
    if mode == "3":
        return "cgbm"
    return "ywbm"


def _paid_amount(mode, key_value, da1, da2):
    col = _mode_col(mode)
    key = _esc_sql(key_value)
    sql = (
        f"select sum(seje) as amt from fkspsheet where ({col}='{key}') "
        f"and {_sql_date_between('fkrq', da1, da2)} and (cwsp='通过') "
        f"and {_sql_empty('fkwyO')}"
    )
    return _sum_field(sql)


def _advance_pay_amount(mode, key_value, da1, da2):
    col = _mode_col(mode)
    key = _esc_sql(key_value)
    sql = (
        f"select sum(seje) as amt from fkspsheet where ({col}='{key}') "
        f"and {_sql_date_between('fkrq', da1, da2)} and (fklx='提前付款') "
        f"and ((ifnull(cwjsq,'')='') or (cwjsq>fkrq)) "
        f"and (cwsp='通过') and {_sql_empty('fkwyO')}"
    )
    return _sum_field(sql)


def _prepay_amount(mode, key_value, da1, da2):
    col = _mode_col(mode)
    key = _esc_sql(key_value)
    sql = (
        f"select sum(pzje) as amt from fkspsheet3 where ({col}='{key}') "
        f"and {_sql_date_between('pzrq', da1, da2)} and (cwsp='通过')"
    )
    return _sum_field(sql)


def _quota_amount(mode, key_value, da1, da2):
    key = _esc_sql(key_value)
    if mode == "4":
        sql = (
            f"select sum(gczj) as amt from cymxsheet where "
            f"{_sql_date_between('sjcy', da1, da2)} and (fpsb1='是') and (ywrya='{key}')"
        )
    else:
        sql = (
            f"select sum(gczj) as amt from cymxsheet where "
            f"{_sql_date_between('sjcy', da1, da2)} and (fpsb1='是') "
            f"and ((wxbm1='{key}') or (cgbm1='{key}'))"
        )
    return _sum_field(sql)


def _collect_rows(mode, keys, bm1_list, da1, da2):
    rows = []
    totals = {"paid": 0.0, "advance": 0.0, "prepay": 0.0, "quota": 0.0}

    for idx, key in enumerate(keys):
        if not key:
            continue
        paid = _paid_amount(mode, key, da1, da2)
        advance = _advance_pay_amount(mode, key, da1, da2)
        prepay = _prepay_amount(mode, key, da1, da2)
        paid_total = paid + prepay
        if paid_total <= 0 and advance <= 0 and prepay <= 0:
            continue
        quota = _quota_amount(mode, key, da1, da2)
        dept = bm1_list[idx] if mode == "4" and idx < len(bm1_list) else ""
        rows.append(
            {
                "name": key,
                "dept": dept,
                "paid": paid_total,
                "prepay": prepay,
                "advance": advance,
                "advance_prepay": prepay + advance,
                "quota": quota,
                "advance_pct": _pct(advance, quota),
                "prepay_pct": _pct(prepay, quota),
                "mix_pct": _pct(prepay + advance, quota),
            }
        )
        totals["paid"] += paid_total
        totals["advance"] += advance
        totals["prepay"] += prepay
        totals["quota"] += quota

    totals["advance_prepay"] = totals["prepay"] + totals["advance"]
    totals["advance_pct"] = _pct(totals["advance"], totals["quota"])
    totals["prepay_pct"] = _pct(totals["prepay"], totals["quota"])
    totals["mix_pct"] = _pct(totals["advance_prepay"], totals["quota"])
    return rows, totals


def _blank_template_path():
    return os.path.join(config.data_upload_path, "template", TEMPLATE_BLANK)


def _write_statistics_workbook(mode, rows, totals, da1, da2):
    template_path = _blank_template_path()
    if not os.path.isfile(template_path):
        raise FileNotFoundError(f"模版文件缺失：{TEMPLATE_BLANK}（路径：{template_path}）")

    save_dir = config.tmp_path
    os.makedirs(save_dir, exist_ok=True)
    mode_label = {"1": "经办", "2": "外销", "3": "采购", "4": "采购人员"}.get(mode, "经办")
    out_name = f"付款统计表_{mode_label}_{da1}_{da2}_{time.strftime('%Y%m%d%H%M%S')}.xlsx"
    out_path = os.path.join(save_dir, out_name)
    shutil.copy2(template_path, out_path)

    app = _start_excel_app()
    try:
        wb = _open_workbook(app, out_path)
        try:
            ws = wb.sheets[0]

            for col in ("A", "B", "C", "D", "E", "F", "G", "H"):
                ws.range(f"{col}:{col}").column_width = 14.3

            if mode == "4":
                headers = {
                    "A1": "人员",
                    "B1": "已付款金额",
                    "C1": "预付款金额",
                    "D1": "提前付款金额",
                    "E1": "提前+预付款金额",
                    "F1": "额  度",
                    "G1": "提前付款比值",
                    "H1": "预付款比值",
                    "I1": "提前+预付总比值",
                    "J1": "部门",
                }
            else:
                headers = {
                    "A1": "组别",
                    "B1": "已付款金额",
                    "C1": "预付款金额",
                    "D1": "提前付款金额",
                    "E1": "提前+预付款金额",
                    "F1": "额  度",
                    "G1": "提前付款比值",
                    "H1": "预付款比值",
                    "I1": "提前+预付总比值",
                }

            for coord, val in headers.items():
                _safe_write_center(ws, coord, val)

            row_idx = 2
            for item in rows:
                _safe_write_center(ws, f"A{row_idx}", item["name"])
                _safe_write_center(ws, f"B{row_idx}", item["paid"])
                _safe_write_center(ws, f"C{row_idx}", item["prepay"])
                _safe_write_center(ws, f"D{row_idx}", item["advance"])
                _safe_write_center(ws, f"E{row_idx}", item["advance_prepay"])
                _safe_write_center(ws, f"F{row_idx}", item["quota"])
                _safe_write_center(ws, f"G{row_idx}", item["advance_pct"])
                _safe_write_center(ws, f"H{row_idx}", item["prepay_pct"])
                _safe_write_center(ws, f"I{row_idx}", item["mix_pct"])
                if mode == "4":
                    _safe_write_center(ws, f"J{row_idx}", item["dept"])
                row_idx += 1

            _safe_write_center(ws, f"A{row_idx}", "合计：")
            _safe_write_center(ws, f"B{row_idx}", totals["paid"])
            _safe_write_center(ws, f"C{row_idx}", totals["prepay"])
            _safe_write_center(ws, f"D{row_idx}", totals["advance"])
            _safe_write_center(ws, f"E{row_idx}", totals["advance_prepay"])
            _safe_write_center(ws, f"F{row_idx}", totals["quota"])
            _safe_write_center(ws, f"G{row_idx}", totals["advance_pct"])
            _safe_write_center(ws, f"H{row_idx}", totals["prepay_pct"])
            _safe_write_center(ws, f"I{row_idx}", totals["mix_pct"])

            _save_and_close(wb, out_path)
            wb = None
        except Exception:
            if wb is not None:
                wb.close()
            raise
    finally:
        try:
            app.quit()
        except Exception:
            pass

    return out_name


@any_route("/api/saier/payment_approval/statistics/export", methods=["POST", "GET"])
@require_token
async def view_saier_payment_approval_statistics_export(request):
    """
    付款审批 - 付款统计表导出。

    请求 JSON：
    - da1: 付款起始日期（yyyy-mm-dd），空则 2000-01-01
    - da2: 付款结束日期，空则当天
    - da3: 统计维度，``1`` 经办 / ``2`` 外销 / ``3`` 采购 / ``4`` 采购人员（默认 ``1``）
    - sync_data: 是否执行 cwjsq 规范化与 fkrq 补全（默认 true）
    """
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        da1_in = j.get("da1", "")
        da2_in = j.get("da2", "")
        da3 = str(j.get("da3", "1") or "1").strip()
        if da3 not in ("2", "3", "4"):
            da3 = "1"
        sync_data = j.get("sync_data", True)
        if isinstance(sync_data, str):
            sync_data = sync_data.lower() not in ("0", "false", "no")

        today = datetime.now().date()
        da1_date = _parse_date(da1_in, datetime(2000, 1, 1).date())
        da2_date = _parse_date(da2_in, today)
        if da1_date > da2_date:
            return json_result(-1, "付款起始日期不能大于结束日期")

        da1 = _fmt_date(da1_date)
        da2 = _fmt_date(da2_date)
        cda2_date = da2_date if da2_date <= today else today
        cda2_date = cda2_date - timedelta(days=10)
        cda2 = _fmt_date(cda2_date)

        finance_scope = _is_finance_scope(user.username)
        bm_list, cgry_list, bm1_list = _load_scope_lists(user.username, finance_scope)
        if da3 == "4":
            if not cgry_list:
                return json_result(-1, "当前用户无可见采购人员数据")
            keys = cgry_list
        else:
            if not bm_list:
                return json_result(-1, "当前用户无可见部门数据")
            keys = bm_list
            bm1_list = []

        if sync_data:
            _normalize_cwjsq(s)
            _sync_fkrq(s, cda2)

        rows, totals = _collect_rows(da3, keys, bm1_list, da1, da2)
        if not rows:
            return json_result(-1, f"日期 {da1} ~ {da2} 内无符合条件的付款统计数据")

        out_name = _write_statistics_workbook(da3, rows, totals, da1, da2)
        return json_result(1, "导出成功", out_name)

    except FileNotFoundError as e:
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
