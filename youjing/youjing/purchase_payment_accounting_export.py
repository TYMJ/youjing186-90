"""
采购付款 - 做账导出。

对照原 Delphi「采购付款-做账导出」source.pas；基于 template 目录下「财务做账模板」填充 Excel。
第 8 行复制第 1 行表头样式与内容，明细从第 9 行起按第 2 行样式逐条插入（A–G），不重复表头、不写 H 列。
"""

from any import *
from .model import *
from .__default__ import get_user_path

import os
import time

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

TEMPLATE_ACCOUNTING = "财务做账模板"

# 模版：第 1 行表头、第 2 行明细样式；第 8 行复制第 1 行，数据从第 9 行起写
_ROW_HEADER = 1
_ROW_HEADER_COPY = 8
_ROW_DETAIL = 2
_DATA_INSERT_ROW = 9
_TEMPLATE_COLS = 7  # A–G，H 列不写数据

# Excel PasteSpecial：全部（值+格式+边框等），对照 Delphi PasteSpecial
_XL_PASTE_ALL = -4104

_FMT_AMOUNT = "0.00"
_FMT_PERCENT = "0%"


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



def _used_col_count(ws):
    try:
        return max(ws.api.UsedRange.Columns.Count, _TEMPLATE_COLS)
    except Exception:
        return _TEMPLATE_COLS


def copy_row_style(ws, source_row, target_row):
    """对照 Pascal Rows[n].Copy + PasteSpecial：复制值、格式、边框与行高。"""
    source_row = int(source_row)
    target_row = int(target_row)
    last_col = _used_col_count(ws)

    src_rng = ws.range((source_row, 1), (source_row, last_col))
    tgt_rng = ws.range((target_row, 1), (target_row, last_col))
    row_h = ws.range(source_row, 1).row_height

    try:
        src_rng.api.Copy()
        tgt_rng.api.PasteSpecial(Paste=_XL_PASTE_ALL)
        ws.book.app.api.CutCopyMode = False
    except Exception:
        src_rng.copy()
        tgt_rng.paste(paste="all")
        try:
            ws.book.app.api.CutCopyMode = False
        except Exception:
            pass

    if row_h:
        ws.range(target_row, 1).row_height = row_h


def _autofit_row(ws, row):
    """对照 Pascal Rows[b].AutoFit。"""
    try:
        ws.range(row, row).api.EntireRow.AutoFit()
    except Exception:
        pass


def insert_row_at(ws, at_row):
    ws.range(at_row, at_row).api.EntireRow.Insert()


def _clear_template_sample_rows(ws, from_row):
    """删除模版数据区示例行，避免与导出明细混在一起。"""
    try:
        used = ws.api.UsedRange
        last_row = used.Row + used.Rows.Count - 1
        if last_row < from_row:
            return
        ws.range((from_row, 1), (last_row, _TEMPLATE_COLS)).api.EntireRow.Delete()
    except Exception:
        pass


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


def _safe_filename(s):
    s = str(s or "").strip() or "export"
    for c in r'\/:*?"<>|':
        s = s.replace(c, "_")
    return s


def _template_path(base_path):
    for name in (f"{TEMPLATE_ACCOUNTING}.xlsx", f"{TEMPLATE_ACCOUNTING}.xls"):
        p = os.path.join(base_path, name)
        if os.path.isfile(p):
            return p
    return os.path.join(base_path, f"{TEMPLATE_ACCOUNTING}.xlsx")


def _get_user_rid(username):
    """对照 declaration._kptz_get_user_rid"""
    rows = run_sql(
        "select rid from sys_user where username=:username limit 1",
        {"username": str(username)},
    )
    return str(rows[0].get("rid", "")) if rows else ""


def _has_sys_role(username, role_name_like, role_path_like=""):
    """
    强制按三步：sys_user -> sys_user_role -> sys_role（禁止 join）
    对照 declaration._kptz_has_role
    """
    user_rid = _get_user_rid(username)
    if not user_rid:
        return False

    role_rows = run_sql(
        "select role_id from sys_user_role where user_id=:user_id",
        {"user_id": user_rid},
    )
    if not role_rows:
        return False

    for row in role_rows:
        role_id = str(row.get("role_id", ""))
        if not role_id:
            continue
        if role_path_like:
            matched = run_sql(
                "select rid from sys_role where rid=:rid and name like :name and path like :path limit 1",
                {"rid": role_id, "name": role_name_like, "path": role_path_like},
            )
        else:
            matched = run_sql(
                "select rid from sys_role where rid=:rid and name like :name limit 1",
                {"rid": role_id, "name": role_name_like},
            )
        if matched:
            return True
    return False


def _is_finance_user(username):
    """对照 Pascal：角色名含「财务」；兼 declaration 岗位兜底。"""
    if _has_sys_role(username, "%财务%"):
        return True
    org = get_user_path(username)
    position = (org or {}).get("position", "")
    return "财务" in position


def _multi_report_expand(selected_sids):
    """
    对照 Pascal MultiReport：按选中 sid 展开 gchk 列表。
    原库字段为 number，现表以 sid 为主键，等价处理。
    """
    out = []
    seen = set()
    for sid in selected_sids:
        try:
            sid_i = int(sid)
        except (TypeError, ValueError):
            continue
        rows = run_sql(f"select sid from gchk where sid={sid_i}")
        for r in rows or []:
            n = str(r.get("sid") or "")
            if n and n not in seen:
                seen.add(n)
                out.append(n)
    return out


def _unique_preserve_order(values):
    out = []
    seen = set()
    for v in values:
        v = str(v or "").strip()
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out


def _collect_zzrqj(gchk_numbers):
    zzrqj_list = []
    for num in gchk_numbers:
        rows = run_sql(f"select wxfp, zzrqj from gchk where sid={int(num)}")
        if not rows:
            continue
        zz = get_field_value(rows[0], "zzrqj")
        if zz and zz not in zzrqj_list:
            zzrqj_list.append(zz)
    return zzrqj_list


def _tsl_list_for_zzrqj(zzrqj):
    rows = run_sql(f"select tsl from gchk where zzrqj='{_esc_sql(zzrqj)}' order by tsl")
    return _unique_preserve_order(get_field_value(r, "tsl") for r in (rows or []))


def _detail_rows(zzrqj, tsl):
    return (
        run_sql(
            f"select wxfp, gcmc, fpje, bhsj, se, tsl, tse from gchk "
            f"where zzrqj='{_esc_sql(zzrqj)}' and tsl='{_esc_sql(tsl)}'"
        )
        or []
    )


def _all_detail_records(gchk_numbers):
    """按做账日期、退税率顺序展平全部明细，一行一条。"""
    records = []
    for zzrqj in _collect_zzrqj(gchk_numbers):
        for tsl in _tsl_list_for_zzrqj(zzrqj):
            records.extend(_detail_rows(zzrqj, tsl))
    return records


def _insert_styled_row(ws, template_row, at_row, autofit=False):
    insert_row_at(ws, at_row)
    copy_row_style(ws, template_row, at_row)
    if autofit:
        _autofit_row(ws, at_row)
    return at_row


def _fill_detail_row(ws, row, det):
    safe_write(ws, f"A{row}", get_field_value(det, "wxfp"))
    safe_write(ws, f"B{row}", get_field_value(det, "gcmc"))
    safe_write(ws, f"C{row}", _to_float(det.get("fpje")), num_format=_FMT_AMOUNT)
    safe_write(ws, f"D{row}", _to_float(det.get("bhsj")), num_format=_FMT_AMOUNT)
    safe_write(ws, f"E{row}", _to_float(det.get("se")), num_format=_FMT_AMOUNT)
    tsl = _to_float(det.get("tsl"))
    safe_write(ws, f"F{row}", tsl / 100 if tsl else 0, num_format=_FMT_PERCENT)
    safe_write(ws, f"G{row}", _to_float(det.get("tse")), num_format=_FMT_AMOUNT)


def _build_workbook(app, tpl_path):
    wb = _open_workbook(app, tpl_path)
    ws = wb.sheets[0]
    return wb, ws


def _export_accounting(gchk_numbers):
    base_path = os.path.join(config.data_upload_path, "template")
    tpl_path = _template_path(base_path)
    if not os.path.isfile(tpl_path):
        raise FileNotFoundError(f"模版文件缺失：{TEMPLATE_ACCOUNTING}.xlsx 或 {TEMPLATE_ACCOUNTING}.xls")

    save_dir = config.tmp_path
    os.makedirs(save_dir, exist_ok=True)
    out_name = time.strftime("%Y-%m-%d") + "采购付款.xlsx"
    out_path = os.path.join(save_dir, _safe_filename(out_name))

    app = _start_excel_app()
    try:
        wb, ws = _build_workbook(app, tpl_path)
        try:
            records = _all_detail_records(gchk_numbers)
            if not records:
                raise ValueError("选中记录无做账日期，无法导出")

            copy_row_style(ws, _ROW_HEADER, _ROW_HEADER_COPY)
            _clear_template_sample_rows(ws, _DATA_INSERT_ROW)
            current = _DATA_INSERT_ROW
            for det in records:
                _insert_styled_row(ws, _ROW_DETAIL, current, autofit=True)
                _fill_detail_row(ws, current, det)
                current += 1

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

    return out_name, out_path


def _resolve_selected_sids(j):
    """对照 Pascal datacenter.getnumberlist：前端勾选 rids → gchk.sid。"""
    sids = []
    raw = j.get("sids") or j.get("numbers") or []
    if isinstance(raw, (str, int)):
        raw = [raw]
    for x in raw or []:
        if str(x).strip():
            sids.append(str(x).strip())

    rids = j.get("rids") or []
    if isinstance(rids, str):
        rids = [rids] if rids else []

    for one in rids:
        one = str(one or "").strip()
        if not one:
            continue
        rows = run_sql(
            "select sid from gchk where rid=:rid limit 1",
            {"rid": one},
        )
        if rows:
            sids.append(str(rows[0]["sid"]))

    out = []
    seen = set()
    for s in sids:
        if s not in seen:
            seen.add(s)
            out.append(s)
    return out


@any_route("/api/saier/purchase_payment/accounting/export", methods=["POST", "GET"])
@require_token
async def view_saier_purchase_payment_accounting_export(request):
    """
    采购付款 - 做账导出（对照 Delphi 采购付款-做账导出）。

    请求 JSON：
    - rids: 列表勾选的采购付款 rid（对照 getnumberlist）
    - sids / numbers: 可选，直接传 gchk.sid（与 Pascal number 等价）
    """
    user = request.current_user
    j = await request.json()

    try:
        if not _is_finance_user(user.username):
            return json_result(-1, "仅财务人员可做账导出")

        selected = _resolve_selected_sids(j)
        if not selected:
            return json_result(-1, "请指定要导出的采购付款记录")

        gchk_numbers = _multi_report_expand(selected)
        if not gchk_numbers:
            return json_result(-1, "未找到可导出的采购付款数据")

        out_name, out_path = _export_accounting(gchk_numbers)
        if not os.path.isfile(out_path):
            return json_result(-1, "导出失败")
        return json_result(1, "导出成功", out_name)

    except ValueError as e:
        return json_result(-1, str(e))
    except FileNotFoundError as e:
        return json_result(-1, str(e))
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
