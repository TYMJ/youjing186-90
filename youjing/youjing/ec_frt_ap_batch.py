# 电商运费审批单批量导出（对照原 Delphi：dsyf + 多类 Excel 模版）
# 模版放在 config.data_upload_path/template/，与 ecommerce_prepaid 等一致
from any import *
from .model import *
import os
import time
import zipfile
from datetime import datetime

try:
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings"])
    import xlwings as xw

try:
    import cn2an
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cn2an"])
    import cn2an


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



# Excel PasteSpecial：全部（值+格式+边框等）
_XL_PASTE_ALL = -4104


def copy_row_style(ws, source_row, target_row):
    """复制整行格式（边框、字体、填充等），对齐 Delphi PasteSpecial 格式粘贴。
    仅复制工作表已用区域内的列，避免 EntireRow 操作 16384 列导致 Excel 卡死。"""
    source_row = int(source_row)
    target_row = int(target_row)

    # 取工作表已用区域的最大列号，防止操作整行 16384 列
    try:
        last_col = ws.api.UsedRange.Columns.Count
    except Exception:
        last_col = 50  # 兜底：万一取不到，默认前 50 列

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


def insert_row_at(ws, row):
    ws.range(row, row).api.EntireRow.Insert()


def insert_rows_at(ws, row, count):
    for _ in range(count):
        ws.range(row, row).api.EntireRow.Insert()


def delete_row_at(ws, row):
    ws.range(row, row).api.EntireRow.Delete()


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def _open_workbook(app, path):
    return app.books.open(path)


def _save_workbook(wb, path):
    wb.save(path)
    wb.close()


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default)
    if as_type is float:
        return float(value) if value not in ("", None) else 0.0
    if value is None:
        return ""
    return str(value).strip()


def _esc_rid(rid):
    return str(rid or "").replace("'", "''")


def _in_rids_clause(rids):
    return ",".join(f"'{_esc_rid(r)}'" for r in rids if r)


def _amount_cn(v):
    try:
        return cn2an.an2cn(float(v), "rmb")
    except Exception:
        return str(v)


def _today_cn():
    return datetime.now().strftime("%Y 年 %m 月 %d 日")


def _today_sql():
    return datetime.now().strftime("%Y-%m-%d")


def _check_dz_permission(username):
    u = str(username or "").replace("'", "''")
    d = run_sql(f"select * from sys_user where username='{u}' and position like '%单证%'")
    return bool(d)


def _tpl_path(base, name):
    return os.path.join(base, name)


# 与旧系统文件名一致，扩展名为 xlsx（请把原 .xls 另存为 xlsx 放入 template）
TPL = {
    "1": "电商(人民币部分).xlsx",
    "2": "电商(拖柜费).xlsx",
    "3": "电商(美金部分).xlsx",
    "4": "电商(海运费-另外申请部分).xlsx",
    "5": "电商(额外费用).xlsx",
}

# 明细 Sheet：多条时每条在下方插入 8 行并复制模版第 1～8 行（与 Delphi Rows['1:8'].copy 一致，含第 1 行）
BLOCK_ROWS = 8


def _fill_block_rmb(ws, row, seg_top):
    """人民币明细块（对应模版第 1～8 行结构，数据区从 seg_top+1 行起）"""
    safe_write(ws, f"B{seg_top + 1}", get_field_value(row, "fphm"))
    safe_write(ws, f"E{seg_top + 1}", get_field_value(row, "khmc"))
    safe_write(ws, f"G{seg_top + 1}", get_field_value(row, "cyrq"))
    safe_write(ws, f"I{seg_top + 1}", get_field_value(row, "Rhd"))
    safe_write(ws, f"B{seg_top + 2}", get_field_value(row, "qyg"))
    safe_write(ws, f"E{seg_top + 2}", get_field_value(row, "mdg"))
    lr = get_field_value(row, "localfyR", as_type=float)
    safe_write(ws, f"B{seg_top + 3}", lr)
    safe_write(ws, f"B{seg_top + 4}", lr)
    safe_write(ws, f"B{seg_top + 6}", get_field_value(row, "tjyw"))
    safe_write(ws, f"E{seg_top + 6}", get_field_value(row, "tjdz"))
    safe_write(ws, f"H{seg_top + 6}", get_field_value(row, "jbr"))


def _fill_block_drag(ws, row, seg_top):
    safe_write(ws, f"B{seg_top + 1}", get_field_value(row, "fphm"))
    safe_write(ws, f"E{seg_top + 1}", get_field_value(row, "khmc"))
    safe_write(ws, f"G{seg_top + 1}", get_field_value(row, "cyrq"))
    safe_write(ws, f"I{seg_top + 1}", get_field_value(row, "Thd"))
    safe_write(ws, f"B{seg_top + 2}", get_field_value(row, "qyg"))
    safe_write(ws, f"E{seg_top + 2}", get_field_value(row, "mdg"))
    yg = get_field_value(row, "ygfy", as_type=float)
    safe_write(ws, f"E{seg_top + 3}", yg)
    safe_write(ws, f"B{seg_top + 4}", yg)
    safe_write(ws, f"B{seg_top + 6}", get_field_value(row, "Ttjyw"))
    safe_write(ws, f"E{seg_top + 6}", get_field_value(row, "Ttjdz"))
    safe_write(ws, f"H{seg_top + 6}", get_field_value(row, "jbr"))


def _fill_block_usd_sheet1(ws, row, seg_top):
    """美金：海运/清关美金（hyfm、qgyfm）明细块"""
    safe_write(ws, f"B{seg_top + 1}", get_field_value(row, "fphm"))
    safe_write(ws, f"E{seg_top + 1}", get_field_value(row, "khmc"))
    safe_write(ws, f"G{seg_top + 1}", get_field_value(row, "cyrq"))
    safe_write(ws, f"I{seg_top + 1}", get_field_value(row, "Mhd"))
    safe_write(ws, f"B{seg_top + 2}", get_field_value(row, "qyg"))
    safe_write(ws, f"E{seg_top + 2}", get_field_value(row, "mdg"))
    hf = get_field_value(row, "hyfm", as_type=float)
    qg = get_field_value(row, "qgyfm", as_type=float)
    safe_write(ws, f"B{seg_top + 3}", hf)
    safe_write(ws, f"E{seg_top + 3}", qg)
    safe_write(ws, f"B{seg_top + 4}", hf + qg)
    safe_write(ws, f"B{seg_top + 6}", get_field_value(row, "Mtjyw"))
    safe_write(ws, f"E{seg_top + 6}", get_field_value(row, "Mtjdz"))
    safe_write(ws, f"H{seg_top + 6}", get_field_value(row, "jbr"))


def _fill_block_h_extra(ws, row, seg_top):
    """海运费另外申请：Hhyfm"""
    safe_write(ws, f"B{seg_top + 1}", get_field_value(row, "fphm"))
    safe_write(ws, f"E{seg_top + 1}", get_field_value(row, "khmc"))
    safe_write(ws, f"G{seg_top + 1}", get_field_value(row, "cyrq"))
    safe_write(ws, f"I{seg_top + 1}", get_field_value(row, "Hhd"))
    safe_write(ws, f"B{seg_top + 2}", get_field_value(row, "qyg"))
    safe_write(ws, f"E{seg_top + 2}", get_field_value(row, "mdg"))
    h = get_field_value(row, "Hhyfm", as_type=float)
    safe_write(ws, f"B{seg_top + 3}", h)
    safe_write(ws, f"B{seg_top + 4}", h)
    safe_write(ws, f"B{seg_top + 6}", get_field_value(row, "Htjyw"))
    safe_write(ws, f"E{seg_top + 6}", get_field_value(row, "Htjdz"))
    safe_write(ws, f"H{seg_top + 6}", get_field_value(row, "jbr"))


def _prepare_multi_block(ws, idx):
    """与 Delphi 一致：在 ins 行插入 8 行后，将模版第 1～8 行复制到该位置。"""
    if idx == 0:
        return
    ins_at = 1 + idx * BLOCK_ROWS
    insert_rows_at(ws, ins_at, BLOCK_ROWS)
    for r in range(BLOCK_ROWS):
        copy_row_style(ws, 1 + r, ins_at + r)


def _sheet2_rmb_summary(wb, rows_all, rows_last_fields):
    """Sheet2：人民币汇总（localfyR>0，不强制 ywsp，与旧逻辑一致）"""
    if len(wb.sheets) < 2:
        return
    ws2 = wb.sheets[1]
    safe_write(ws2, "A2", _today_cn())
    fyhj = 0.0
    i1 = 0
    base_tpl = 7
    for row in rows_all:
        i1 += 1
        tr = base_tpl + i1
        insert_row_at(ws2, tr)
        copy_row_style(ws2, base_tpl, tr)
        amt = get_field_value(row, "localfyR", as_type=float)
        safe_write(ws2, f"C{tr}", amt)
        fyhj += amt
        safe_write(ws2, f"D{tr}", get_field_value(row, "cyrq"))
        safe_write(ws2, f"A{tr}", get_field_value(row, "fphm"))
    last = base_tpl + i1
    safe_write(ws2, f"C{last + 3}", fyhj)
    if rows_last_fields is not None:
        safe_write(ws2, f"A{last + 7}", "经理审批:" + get_field_value(rows_last_fields, "tjdz"))
        safe_write(ws2, f"D{last + 7}", "经办人:" + get_field_value(rows_last_fields, "jbr"))
    delete_row_at(ws2, base_tpl)


def _sheet2_drag_summary(wb, rows_all, rows_last_fields):
    if len(wb.sheets) < 2:
        return
    ws2 = wb.sheets[1]
    safe_write(ws2, "A2", _today_cn())
    fyhj = 0.0
    i1 = 0
    base_tpl = 7
    for row in rows_all:
        i1 += 1
        tr = base_tpl + i1
        insert_row_at(ws2, tr)
        copy_row_style(ws2, base_tpl, tr)
        amt = get_field_value(row, "ygfy", as_type=float)
        safe_write(ws2, f"C{tr}", amt)
        fyhj += amt
        safe_write(ws2, f"D{tr}", get_field_value(row, "cyrq"))
        safe_write(ws2, f"A{tr}", get_field_value(row, "fphm"))
    last = base_tpl + i1
    safe_write(ws2, f"C{last + 3}", fyhj)
    if rows_last_fields is not None:
        safe_write(ws2, f"A{last + 7}", "经理审批:" + get_field_value(rows_last_fields, "tjdz"))
        safe_write(ws2, f"D{last + 7}", "经办人:" + get_field_value(rows_last_fields, "jbr"))
    delete_row_at(ws2, base_tpl)


def _sheet2_h_summary(wb, rows_all, rows_last_fields):
    if len(wb.sheets) < 2:
        return
    ws2 = wb.sheets[1]
    safe_write(ws2, "A2", _today_cn())
    fyhj_m = 0.0
    fyhj_r = 0.0
    i1 = 0
    base_tpl = 7
    for row in rows_all:
        i1 += 1
        tr = base_tpl + i1
        insert_row_at(ws2, tr)
        copy_row_style(ws2, base_tpl, tr)
        hm = get_field_value(row, "Hhyfm", as_type=float)
        hr = get_field_value(row, "Hhyfr", as_type=float)
        safe_write(ws2, f"B{tr}", hm)
        safe_write(ws2, f"C{tr}", hr)
        fyhj_m += hm
        fyhj_r += hr
        safe_write(ws2, f"D{tr}", get_field_value(row, "cyrq"))
        safe_write(ws2, f"A{tr}", get_field_value(row, "fphm"))
    last = base_tpl + i1
    safe_write(ws2, f"B{last + 3}", fyhj_m)
    safe_write(ws2, f"C{last + 3}", fyhj_r)
    if rows_last_fields is not None:
        safe_write(ws2, f"A{last + 7}", "经理审批:" + get_field_value(rows_last_fields, "Htjyw"))
        safe_write(ws2, f"D{last + 7}", "经办人:" + get_field_value(rows_last_fields, "jbr"))
    delete_row_at(ws2, base_tpl)


def _sheet3_usd_freight(wb, rows_hy, rows_last_fields):
    """美金模版第 3 张表：hyfm+qgyfm 汇总"""
    if len(wb.sheets) < 3:
        return
    ws3 = wb.sheets[2]
    safe_write(ws3, "A2", _today_cn())
    fyhj1 = 0.0
    i1 = 0
    base_tpl = 7
    for row in rows_hy:
        i1 += 1
        tr = base_tpl + i1
        insert_row_at(ws3, tr)
        copy_row_style(ws3, base_tpl, tr)
        v = get_field_value(row, "hyfm", as_type=float) + get_field_value(row, "qgyfm", as_type=float)
        safe_write(ws3, f"B{tr}", v)
        fyhj1 += v
        safe_write(ws3, f"D{tr}", get_field_value(row, "cyrq"))
        safe_write(ws3, f"A{tr}", get_field_value(row, "fphm"))
    last = base_tpl + i1
    safe_write(ws3, f"B{last + 3}", fyhj1)
    if rows_last_fields is not None:
        safe_write(ws3, f"A{last + 7}", "经理审批:" + get_field_value(rows_last_fields, "Mtjyw"))
        safe_write(ws3, f"D{last + 7}", "经办人:" + get_field_value(rows_last_fields, "jbr"))
    delete_row_at(ws3, base_tpl)


def export_kind_rmb(session, rids, base_path, save_path):
    inc = _in_rids_clause(rids)
    if not inc:
        return None
    tpl = _tpl_path(base_path, TPL["1"])
    if not os.path.exists(tpl):
        return None
    detail = run_sql(f"select * from dsyf where rid in ({inc}) and ifnull(localfyR,0)>0 and ifnull(ywsp,'')='通过'")
    if not detail:
        return None
    summary = run_sql(f"select * from dsyf where rid in ({inc}) and ifnull(localfyR,0)>0")
    fn = f"{time.strftime('%Y-%m-%d')} 电商(人民币部分).xlsx"
    fp = os.path.join(save_path, fn)
    app = _start_excel_app()
    try:
        wb = _open_workbook(app, tpl)
        ws = wb.sheets[0]  # Delphi worksheets[1] → xlwings 0-based
        for idx, row in enumerate(detail):
            _prepare_multi_block(ws, idx)
            seg_top = 1 + idx * BLOCK_ROWS
            _fill_block_rmb(ws, row, seg_top)
        _sheet2_rmb_summary(wb, summary, detail[-1] if detail else None)
        _save_workbook(wb, fp)
    finally:
        try:
            app.quit()
        except Exception:
            pass
    now = datetime.now()
    for row in detail:
        session.query(dsyf).filter(dsyf.rid == row.get("rid")).update(
            {"dysj": now, "mtime": now}, synchronize_session=False
        )
    return fp


def export_kind_drag(session, rids, base_path, save_path):
    inc = _in_rids_clause(rids)
    if not inc:
        return None
    tpl = _tpl_path(base_path, TPL["2"])
    if not os.path.exists(tpl):
        return None
    detail = run_sql(f"select * from dsyf where rid in ({inc}) and ifnull(ygfy,0)>0 and ifnull(Tywsp,'')='通过'")
    if not detail:
        return None
    summary = run_sql(f"select * from dsyf where rid in ({inc}) and ifnull(ygfy,0)>0")
    fn = f"{time.strftime('%Y-%m-%d')} 电商(拖车费部分).xlsx"
    fp = os.path.join(save_path, fn)
    app = _start_excel_app()
    try:
        wb = _open_workbook(app, tpl)
        ws = wb.sheets[0]
        for idx, row in enumerate(detail):
            _prepare_multi_block(ws, idx)
            seg_top = 1 + idx * BLOCK_ROWS
            _fill_block_drag(ws, row, seg_top)
        _sheet2_drag_summary(wb, summary, detail[-1] if detail else None)
        _save_workbook(wb, fp)
    finally:
        try:
            app.quit()
        except Exception:
            pass
    now = datetime.now()
    for row in detail:
        session.query(dsyf).filter(dsyf.rid == row.get("rid")).update(
            {"ygfdy": now, "mtime": now}, synchronize_session=False
        )
    return fp


def export_kind_usd(session, rids, base_path, save_path):
    inc = _in_rids_clause(rids)
    if not inc:
        return None
    tpl = _tpl_path(base_path, TPL["3"])
    if not os.path.exists(tpl):
        return None
    q_m = (
        "rid in ({}) and (ifnull(hyfm,0)>0 or ifnull(qgyfm,0)>0 or ifnull(gsfym,0)>0 or ifnull(zsfm,0)>0 "
        "or ifnull(gsfyr,0)>0 or ifnull(zsfr,0)>0) and ifnull(Mywsp,'')='通过'"
    ).format(inc)
    if not run_sql(f"select rid from dsyf where {q_m} limit 1"):
        return None
    fn = f"{time.strftime('%Y-%m-%d')} 电商(美金部分).xlsx"
    fp = os.path.join(save_path, fn)
    app = _start_excel_app()
    try:
        wb = _open_workbook(app, tpl)
        ws = wb.sheets[0]
        detail_hy = run_sql(f"select * from dsyf where {q_m} and (ifnull(hyfm,0)>0 or ifnull(qgyfm,0)>0)")
        idx = 0
        for row in detail_hy:
            _prepare_multi_block(ws, idx)
            seg_top = 1 + idx * BLOCK_ROWS
            _fill_block_usd_sheet1(ws, row, seg_top)
            idx += 1
        now_s = _today_sql()
        for row in run_sql(f"select * from dsyf where {q_m}"):
            session.query(dsyf).filter(dsyf.rid == row.get("rid")).update(
                {"Mdysj": now_s, "mtime": datetime.now()}, synchronize_session=False
            )

        tax_rows = []
        # Sheet2：关税+征税（gsfym/zsfm 或 gsfyr/zsfr）
        if len(wb.sheets) >= 2:
            ws2 = wb.sheets[1]
            safe_write(ws2, "A3", _today_cn())
            tax_rows = run_sql(
                f"select * from dsyf where rid in ({inc}) and (ifnull(gsfym,0)>0 or ifnull(zsfm,0)>0 "
                f"or ifnull(gsfyr,0)>0 or ifnull(zsfr,0)>0)"
            )
            mhds = []
            i1 = 0
            base_tpl = 5
            fyhj = 0.0
            fyhjr = 0.0
            last_row = None
            for row in tax_rows:
                last_row = row
                j = get_field_value(row, "Mhd")
                if j and j not in mhds:
                    mhds.append(j)
                i1 += 1
                tr = base_tpl + i1
                insert_row_at(ws2, tr)
                copy_row_style(ws2, base_tpl, tr)
                gsr = get_field_value(row, "gsfyr", as_type=float) + get_field_value(row, "zsfr", as_type=float)
                gsm = get_field_value(row, "gsfym", as_type=float) + get_field_value(row, "zsfm", as_type=float)
                if gsr > 0:
                    safe_write(ws2, f"D{tr}", gsr, num_format="¥#,##0.00")
                else:
                    safe_write(ws2, f"D{tr}", gsm, num_format="$#,##0.00")
                fyhj += gsm
                fyhjr += gsr
                safe_write(ws2, f"C{tr}", "关税+征税")
                safe_write(ws2, f"B{tr}", get_field_value(row, "fphm"))
                safe_write(ws2, f"A{tr}", get_field_value(row, "ywbm"))
            if i1 > 0:
                last = base_tpl + i1
                if fyhjr > 0:
                    safe_write(ws2, f"D{last + 4}", fyhjr)
                    safe_write(ws2, f"C{last + 4}", _amount_cn(f"{fyhjr:.2f}"))
                else:
                    safe_write(ws2, f"D{last + 4}", fyhj)
                    safe_write(ws2, f"C{last + 4}", _amount_cn(f"{fyhj:.2f}"))
                if last_row:
                    safe_write(
                        ws2,
                        f"A{last + 5}",
                        "部门经理:"
                        + get_field_value(last_row, "Mtjyw")
                        + "           单证经理:"
                        + get_field_value(last_row, "Mtjdz")
                        + "             财务审核:",
                    )
                safe_write(ws2, "B2", "\n".join(mhds))
                if last_row:
                    safe_write(ws2, "D2", "报销人：" + get_field_value(last_row, "jbr"))
                delete_row_at(ws2, base_tpl)

        rows_hy_sum = run_sql(f"select * from dsyf where rid in ({inc}) and (ifnull(hyfm,0)>0 or ifnull(qgyfm,0)>0)")
        last_sign = None
        if detail_hy:
            last_sign = detail_hy[-1]
        elif tax_rows:
            last_sign = tax_rows[-1]
        _sheet3_usd_freight(wb, rows_hy_sum, last_sign)
        _save_workbook(wb, fp)
    finally:
        try:
            app.quit()
        except Exception:
            pass
    return fp


def export_kind_h_sea(session, rids, base_path, save_path):
    inc = _in_rids_clause(rids)
    if not inc:
        return None
    tpl = _tpl_path(base_path, TPL["4"])
    if not os.path.exists(tpl):
        return None
    q = (
        f"select * from dsyf where rid in ({inc}) and (ifnull(Hhyfm,0)>0 or ifnull(Hhyfr,0)>0) "
        f"and ifnull(Hywsp,'')='通过'"
    )
    detail = run_sql(q)
    if not detail:
        return None
    fn = f"{time.strftime('%Y-%m-%d')} 电商(海运费-另外申请部分).xlsx"
    fp = os.path.join(save_path, fn)
    app = _start_excel_app()
    try:
        wb = _open_workbook(app, tpl)
        ws = wb.sheets[0]
        idx = 0
        for row in detail:
            if get_field_value(row, "Hhyfm", as_type=float) <= 0:
                continue
            _prepare_multi_block(ws, idx)
            seg_top = 1 + idx * BLOCK_ROWS
            _fill_block_h_extra(ws, row, seg_top)
            idx += 1
        now_s = _today_sql()
        for row in run_sql(f"select * from dsyf where rid in ({inc}) and (ifnull(Hhyfm,0)>0 or ifnull(Hhyfr,0)>0)"):
            if get_field_value(row, "Hhyfm", as_type=float) <= 0:
                continue
            session.query(dsyf).filter(dsyf.rid == row.get("rid")).update(
                {"Hdysj": now_s, "mtime": datetime.now()}, synchronize_session=False
            )
        summary = run_sql(f"select * from dsyf where rid in ({inc}) and (ifnull(Hhyfm,0)>0 or ifnull(Hhyfr,0)>0)")
        _sheet2_h_summary(wb, summary, detail[-1] if detail else None)
        _save_workbook(wb, fp)
    finally:
        try:
            app.quit()
        except Exception:
            pass
    return fp


def export_kind_extra(session, rids, base_path, save_path):
    inc = _in_rids_clause(rids)
    if not inc:
        return None
    tpl = _tpl_path(base_path, TPL["5"])
    if not os.path.exists(tpl):
        return None
    detail = run_sql(
        f"select * from dsyf where rid in ({inc}) and (ifnull(Ehyfm,0)>0 or ifnull(Ehyfr,0)>0) "
        f"and ifnull(Eywsp,'')='通过'"
    )
    if not detail:
        return None
    fn = f"{time.strftime('%Y-%m-%d')} 电商(额外费用).xlsx"
    fp = os.path.join(save_path, fn)
    app = _start_excel_app()
    try:
        wb = _open_workbook(app, tpl)
        ws = wb.sheets[0]
        safe_write(ws, "A3", _today_cn())
        ehds = []
        i1 = 0
        base_tpl = 5
        fyhj = 0.0
        last_row = None
        now_s = _today_sql()
        for row in detail:
            last_row = row
            session.query(dsyf).filter(dsyf.rid == row.get("rid")).update(
                {"edysj": now_s, "mtime": datetime.now()}, synchronize_session=False
            )
            hd = get_field_value(row, "Ehd")
            if hd and hd not in ehds:
                ehds.append(hd)
            i1 += 1
            tr = base_tpl + i1
            insert_row_at(ws, tr)
            copy_row_style(ws, base_tpl, tr)
            em = get_field_value(row, "Ehyfm", as_type=float)
            er = get_field_value(row, "Ehyfr", as_type=float)
            if em > 0:
                safe_write(ws, f"D{tr}", em, num_format="$#,##0.00")
            if er > 0:
                safe_write(ws, f"D{tr}", er, num_format="¥#,##0.00")
            fyhj += em + er
            safe_write(ws, f"C{tr}", get_field_value(row, "EBZ"))
            safe_write(ws, f"B{tr}", get_field_value(row, "fphm"))
            safe_write(ws, f"A{tr}", get_field_value(row, "ywbm"))
        if last_row:
            last = base_tpl + i1
            safe_write(ws, f"D{last + 4}", fyhj)
            safe_write(ws, f"C{last + 4}", _amount_cn(f"{fyhj:.2f}"))
            safe_write(
                ws,
                f"A{last + 5}",
                " 部门经理:"
                + get_field_value(last_row, "Etjyw")
                + "            单证经理:"
                + get_field_value(last_row, "Etjdz")
                + "            财务审核:",
            )
            safe_write(ws, "B2", "\n".join(ehds))
            safe_write(ws, "D2", "报销人：" + get_field_value(last_row, "jbr"))
        delete_row_at(ws, base_tpl)
        _save_workbook(wb, fp)
    finally:
        try:
            app.quit()
        except Exception:
            pass
    return fp


_EXPORTERS = {
    "1": export_kind_rmb,
    "2": export_kind_drag,
    "3": export_kind_usd,
    "4": export_kind_h_sea,
    "5": export_kind_extra,
}


@any_route("/api/saier/ec/frt/ap/batch/export", methods=["POST", "GET"])
@require_token
async def view_saier_ec_frt_ap_batch_export(request):
    """电商运费审批单批量导出。参数：mode 1 当前 rid，2 批量 rids；kinds 如 12345（人民币1拖柜2美金3海运另外4额外5）"""
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        if not _check_dz_permission(user.username):
            return json_result(-1, "权限不足（需单证岗位）")

        mode = str(j.get("mode", "1") or "1")
        rid = j.get("rid", "")
        rids = j.get("rids") or []
        if mode != "2":
            rids = [rid] if rid else []
        if isinstance(rids, str):
            rids = [rids] if rids else []
        rids = [x for x in rids if x]
        if not rids:
            return json_result(-1, "请选择要导出的记录")

        kinds = str(j.get("kinds", j.get("export_data", "12345")) or "")
        if not kinds.strip():
            return json_result(-1, "请选择导出费用类型（1人民币 2拖柜 3美金 4海运另外 5额外，可组合如 12345）")

        save_path = config.tmp_path
        os.makedirs(save_path, exist_ok=True)
        base_path = os.path.join(config.data_upload_path, "template")

        missing = []
        for k in kinds:
            if k in TPL and not os.path.exists(_tpl_path(base_path, TPL[k])):
                missing.append(TPL[k])
        if missing:
            return json_result(-1, "模版文件不存在，请将以下文件放入 template 目录：" + "、".join(missing))

        files = []
        for k in kinds:
            if k not in _EXPORTERS:
                continue
            fp = _EXPORTERS[k](s, rids, base_path, save_path)
            if fp and os.path.exists(fp):
                files.append(fp)

        if not files:
            return json_result(-1, "没有符合审批与金额条件的可导出数据")

        zip_name = time.strftime("%Y%m%d%H%M%S") + "_电商运费审批单批量导出.zip"
        zip_path = os.path.join(save_path, zip_name)
        with zipfile.ZipFile(zip_path, "w") as zf:
            for fp in files:
                zf.write(fp, os.path.basename(fp), zipfile.ZIP_DEFLATED)
        s.commit()
        return json_result(1, "导出成功", zip_name)
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
