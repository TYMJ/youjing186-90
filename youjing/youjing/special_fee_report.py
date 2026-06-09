from any import *
from .model import *
from sqlalchemy.sql import func, or_
from .__default__ import get_uuid
import zipfile
from datetime import datetime
import os
import textwrap
import time

try:
    import xlwings as xw
    import cn2an
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings", "cn2an"])
    import xlwings as xw
    import cn2an

SYS_FIELDS = ["sid", "rid", "uid", "ctime", "mtime", "has_att", "modi_uid", "wf_status", "wf_unit", "pid", "archived"]


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


def _get_merged_cell_addresses(ws):
    """获取工作表中所有合并单元格的地址列表（去除 $ 符号）"""
    addresses = []
    try:
        ma = ws.api.merge_areas
        if ma:
            try:
                count = ma.count
                for i in range(1, count + 1):
                    addresses.append(ma(i).address.replace("$", ""))
            except (AttributeError, TypeError):
                addresses.append(ma.address.replace("$", ""))
    except Exception:
        pass
    return addresses


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


def insert_data_row(ws, template_row, insert_row):
    """在 insert_row 插入一行并复制 template_row 的格式（对照 Delphi Rows[number].copy + PasteSpecial）。"""
    ws.range(insert_row, insert_row).api.EntireRow.Insert()
    src_rng = ws.range((template_row, 1), (template_row, 3))
    tgt_rng = ws.range((insert_row, 1), (insert_row, 3))
    src_rng.copy()
    tgt_rng.paste(paste="all")


def delete_row_at(ws, row_num):
    ws.range(row_num, row_num).api.EntireRow.Delete()


def _wrapped_lines(text, width_chars):
    """根据列宽（字符数）估算文本折行后的行数。"""
    if not text or width_chars <= 0:
        return 1
    s = str(text).replace("\r\n", "\n").replace("\r", "\n")
    total = 0
    for para in s.split("\n"):
        if not para:
            total += 1
            continue
        wrapped = textwrap.wrap(para, width=max(1, int(width_chars * 0.85)))
        total += len(wrapped) if wrapped else 1
    return max(1, total)


def adjust_row_height(ws, row, col="A"):
    """对照 Delphi Rows[行号].AutoFit：根据内容长度手动估算并设置行高（不调用 Excel AutoFit）。
    应在写入该行所有内容后调用一次。"""
    try:
        coord = f"{col}{row}"
        rng = ws.range(coord)
        area = rng.merge_area
        rows, cols = area.shape
        is_merge = rows * cols > 1

        if is_merge:
            text = area(1, 1).value
            total_width = 0
            for c in range(1, cols + 1):
                total_width += area(1, c).column_width
            col_w = total_width
            target = area
        else:
            text = rng.value
            col_w = rng.column_width
            target = rng

        if not text:
            return

        lines = _wrapped_lines(text, col_w)
        if lines > 1:
            target.api.WrapText = True
            target_h = lines * 20 + 5
            current_h = ws.range(row, row).row_height
            if target_h > current_h:
                ws.range(row, row).row_height = target_h
    except Exception:
        pass


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default)
    if as_type is float:
        return float(value) if value not in ("", None) else 0.0
    if value is None:
        return ""
    return str(value).strip()


def generate_jzpz():
    # 生成凭证号
    now = datetime.now()
    prefix = f"HDFY{now.strftime('%y%m%d')}"
    # 查询 单证费用 当天最大 申请单号
    d = run_sql(f"select jzpz from dzfy where jzpz like '%{prefix}%' order by jzpz desc limit 1")
    next_num = int(d[0].get("jzpz")[10:14]) + 1 if d else 1
    jzpz = f"{prefix}{next_num:04d}"
    return jzpz if jzpz else ""


@any_route("/api/saier/special/fee/report", methods=["POST", "GET"])
@require_token
async def view_saier_special_fee_report(request):
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        # 权限检查
        d = run_sql(f"select * from sys_user where username='{user.username}' and position like '%单证%'")
        if not d:
            return json_result(-1, "权限不足")

        mode = j.get("mode", "1")  # 1为当前，2为批量，默认当前
        rid = j.get("rid", "")
        rids = j.get("rids", "")
        save_path = config.tmp_path
        base_path = os.path.join(config.data_upload_path, "template")
        file_path = os.path.join(base_path, "dzfybx.xlsx")

        # 检查模版文件
        if not os.path.exists(file_path):
            return json_result(-1, "模版文件缺失")

        mode = "1" if mode != "2" else mode

        bgpm = []
        gcmc = ""  # 工程名称：特报费用
        rmbsb = ""
        mjsb = ""

        # 获取基础信息
        i4 = 0
        if mode == "2":
            for rid in rids:
                d = run_sql(
                    f"select cdmc,rid,zdhd,zrhd,bghd,bank1,zh1,bank2,zh2,bank3,zh3,fyje1,fyjem1,tbhd from hdfy where rid='{rid}' and ifnull(tbdy, '') = ''"
                )
                if not d:
                    continue
                for row in d:
                    i4 += 1
                    bgpm.append(rid)
                    tbhd = get_field_value(row, "tbhd")

                    if tbhd:
                        gcmc = tbhd
                    if get_field_value(row, "fyje1", as_type=float) > 0:
                        rmbsb = "1"
                    if get_field_value(row, "fyjem1", as_type=float) > 0:
                        mjsb = "1"
        else:
            d = run_sql(
                f"select cdmc,rid,zdhd,zrhd,bghd,bank1,zh1,bank2,zh2,bank3,zh3,fyje1,fyjem1,sjhd,tbhd from hdfy where rid='{rid}' and ifnull(tbdy, '') = ''"
            )
            if d:
                row = d[0]
                i4 += 1
                bgpm.append(rid)
                tbhd = get_field_value(row, "tbhd")

                if tbhd:
                    gcmc = tbhd
                if get_field_value(row, "fyje1", as_type=float) > 0:
                    rmbsb = "1"
                if get_field_value(row, "fyjem1", as_type=float) > 0:
                    mjsb = "1"

        # 处理导出
        sh = ""
        bank = ""
        zh2 = ""
        yhdm = ""
        lhh = ""
        jgh = ""
        wyjgh = ""
        sjyh = ""
        sjlhh = ""
        yhdz = ""
        sjhjgh = ""
        jzpz = ""
        father = ""
        sl = 0
        dzfysb = ""

        # 判断单证权限
        d = run_sql(f"select * from cyzglsheet where (xm='{user.username}') and (zm='单证费用生成')")
        if d:
            dzfysb = "1"
        if not dzfysb:
            d = run_sql(f"select * from cyzglsheet where (zm='单证费用生成')")
            dzfysb = "1"

        # ------ 1.创建单证费用主表记录------
        # 查询船代资料
        d = run_sql(
            f"select cdzl.bank,cdzl.zh,cdzl.shui,yh.yhdm,yh.yhdz,yh.wyjgh,yh.lhh,yh.jgh,yh.sjyh,yh.sjlhh \
            from cdzl left join(select yhbm.yhdm,yhbm.yhdz,yhbm.wyjgh,yhbm.lhh,yhbm.jgh,yhbm.sjyh,yhbm.sjlhh,yhbm.yhmc from yhbm) as yh on yh.yhmc=cdzl.bank \
            where (cdzl.cdmc='{gcmc}')"
        )
        if d:
            row = d[0]
            sh = get_field_value(row, "shui")
            bank = get_field_value(row, "bank")
            zh2 = get_field_value(row, "zh")
            yhdm = get_field_value(row, "yhdm")
            lhh = get_field_value(row, "lhh")
            jgh = get_field_value(row, "jgh")
            wyjgh = get_field_value(row, "wyjgh")
            sjyh = get_field_value(row, "sjyh")
            sjlhh = get_field_value(row, "sjlhh")
            yhdz = get_field_value(row, "yhdz")

        if dzfysb == "1":
            jzpz = generate_jzpz()
            if jzpz:
                row_data = {
                    "jzpz": jzpz,
                    "jbr": user.username,
                    "gcmc": gcmc,
                    "sh": sh,
                    "bank": bank,
                    "zh": zh2,
                    "yt": "贷款",
                    "fpwk": "",
                    "sfjq": "否",
                    "sqrq": time.strftime("%Y-%m-%d"),
                    "yhdm": yhdm,
                    "lhh": lhh,
                    "jgh": jgh,
                    "wyjgh": wyjgh,
                    "sjyh": sjyh,
                    "sjlhh": sjlhh,
                    "yhdz": yhdz,
                    "sjhjgh": "",
                    "wstt": "",
                    "fkdq": "宁波",
                    "hkje": 0,
                    "htje": 0,
                    "sqje": 0,
                    "zt": "待付款",
                    "hkrq": None,
                    "cwry": None,
                    "fpje": 0,
                }
                m = dzfy()
                for k, v in row_data.items():
                    if k in SYS_FIELDS:
                        continue
                    if hasattr(m, k):
                        setattr(m, k, v)
                m.rid = get_uuid()
                m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                s.add(m)

                father = m.rid

        # ------ 2.处理货代，创建单证明细 ------
        sl = 0
        for rid in bgpm:
            d = run_sql(
                f"select * from hdfy where rid='{rid}' and dzqr3='通过' and ywqr3='通过' and (fyje1>0 or fyjem1>0)"
            )
            if not d:
                continue
            row = d[0]

            fphm = get_field_value(row, "fphm")
            tbfy = get_field_value(row, "fyje1", as_type=float)
            tbfym = get_field_value(row, "fyjem1", as_type=float)
            # 创建单证明细
            if father:
                d = run_sql(
                    f"select rid from dzfysheet where pid='{father}' and fphm='{fphm}' and tbfy='{tbfy}' and tbfym='{tbfym}' and fylx='特报费用'"
                )
                if not d:
                    row_data = {
                        "fphm": fphm,
                        "tdh": get_field_value(row, "tdh"),
                        "zdfy": 0,
                        "zlzbfy": 0,
                        "dbgfy": 0,
                        "tbfy": tbfy,
                        "sjfy": 0,
                        "xgzf": 0,
                        "zdfym": 0,
                        "zlzbfym": 0,
                        "dbgfym": 0,
                        "tbfym": tbfym,
                        "sjfym": 0,
                        "xgzfm": 0,
                        "kkje": tbfy,
                        "yfje1": tbfym,
                        "fylx": "特报费用",
                    }
                    m = dzfysheet()
                    for k, v in row_data.items():
                        if k in SYS_FIELDS:
                            continue
                        if hasattr(m, k):
                            setattr(m, k, v)
                    m.rid = get_uuid()
                    m.pid = father
                    m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                    s.add(m)
                    sl += 1

        # ------ 3.RMB费用导出excel / 4.mj费用导出excel ------
        mj = 0
        jl = ""
        fn = ""
        files = []
        app = _start_excel_app()
        try:
            if rmbsb == "1" and i4 > 0:
                wb = _open_workbook(app, file_path)
                try:
                    ws = wb.sheets[0]
                    template_row = 5
                    e = 0
                    result = ""
                    for mr_addr in _get_merged_cell_addresses(ws):
                        rng = ws.range(mr_addr)
                        if rng.row > template_row:
                            rng.unmerge()
                    for rid in bgpm:
                        d = run_sql(
                            f"select * from hdfy where rid='{rid}' and dzqr3='通过' and ywqr3='通过' and fyje1>0"
                        )

                        if not d:
                            continue

                        row = d[0]
                        mj += get_field_value(row, "fyje1", as_type=float)
                        jl = get_field_value(row, "dzsp3")
                        e += 1
                        insert_row = template_row + e
                        insert_data_row(ws, template_row, insert_row)

                        ysfp = get_field_value(row, "ysfp")
                        safe_write(ws, f"A{insert_row}", ysfp if ysfp else get_field_value(row, "fphm"))
                        safe_write(ws, f"B{insert_row}", get_field_value(row, "fynr"))
                        safe_write(
                            ws, f"C{insert_row}", get_field_value(row, "fyje1", as_type=float), num_format="￥#,##0.00"
                        )
                        # 对照 source.pas Rows.AutoFit：A 列发票号 / B 列费用内容均可能换行
                        adjust_row_height(ws, insert_row, col="B")
                        adjust_row_height(ws, insert_row, col="A")

                        s.query(hdfy).filter(hdfy.rid == rid, func.ifnull(hdfy.tbdy, "") == "").update(
                            {hdfy.tbdy: time.strftime("%Y-%m-%d")}, synchronize_session=False
                        )

                    if mj > 0:
                        what = f"{mj:.2f}"
                        mw = str(int(mj * 100))[-1]
                        if mw == "0":
                            result = cn2an.an2cn(what) + "整"
                        else:
                            result = cn2an.an2cn(what)

                    ws[f"B{7 + e}"].value = result
                    ws[f"C{7 + e}"].value = mj
                    if result:
                        adjust_row_height(ws, 7 + e, col="B")
                    ws.range(f"A{8 + e}:D{8 + e}").merge()
                    safe_write(ws, f"A{8 + e}", f"部门经理:{jl}   财务审核 :                 报销人:{user.username}")
                    adjust_row_height(ws, 8 + e, col="A")
                    delete_row_at(ws, template_row)

                    fn = f"{time.strftime('%Y%m%d%H%M%S')}特报费用_rmb_{user.username}.xlsx"
                    out_path = os.path.join(save_path, fn)
                    _save_and_close(wb, out_path)
                    wb = None
                    files.append({"name": fn, "path": out_path})
                except Exception:
                    if wb is not None:
                        wb.close()
                    raise

            mj = 0
            if mjsb == "1" and i4 > 0:
                wb = _open_workbook(app, file_path)
                try:
                    ws = wb.sheets[0]
                    template_row = 5
                    e = 0
                    result = ""
                    for mr_addr in _get_merged_cell_addresses(ws):
                        rng = ws.range(mr_addr)
                        if rng.row > template_row:
                            rng.unmerge()
                    for rid in bgpm:
                        d = run_sql(
                            f"select * from hdfy where rid='{rid}' and dzqr3='通过' and ywqr3='通过' and fyjem1>0"
                        )

                        if not d:
                            continue

                        row = d[0]
                        mj += get_field_value(row, "fyjem1", as_type=float)
                        jl = get_field_value(row, "dzsp3")
                        e += 1
                        insert_row = template_row + e
                        insert_data_row(ws, template_row, insert_row)

                        ysfp = get_field_value(row, "ysfp")
                        safe_write(ws, f"A{insert_row}", ysfp if ysfp else get_field_value(row, "fphm"))
                        safe_write(ws, f"B{insert_row}", get_field_value(row, "fynr"))
                        safe_write(
                            ws, f"C{insert_row}", get_field_value(row, "fyjem1", as_type=float), num_format="$#,##0.00"
                        )
                        # 对照 source.pas Rows.AutoFit：A 列发票号 / B 列费用内容均可能换行
                        adjust_row_height(ws, insert_row, col="B")
                        adjust_row_height(ws, insert_row, col="A")

                        s.query(hdfy).filter(hdfy.rid == rid, func.ifnull(hdfy.tbdy, "") == "").update(
                            {hdfy.tbdy: time.strftime("%Y-%m-%d")}, synchronize_session=False
                        )

                    if mj > 0:
                        what = f"{mj:.2f}"
                        mw = str(int(mj * 100))[-1]
                        if mw == "0":
                            result = cn2an.an2cn(what) + "整"
                        else:
                            result = cn2an.an2cn(what)

                    ws[f"B{7 + e}"].value = result
                    ws[f"C{7 + e}"].value = mj
                    if result:
                        adjust_row_height(ws, 7 + e, col="B")
                    ws.range(f"A{8 + e}:D{8 + e}").merge()
                    safe_write(ws, f"A{8 + e}", f"部门经理:{jl}   财务审核 :                 报销人:{user.username}")
                    adjust_row_height(ws, 8 + e, col="A")
                    delete_row_at(ws, template_row)

                    fn = f"{time.strftime('%Y%m%d%H%M%S')}特报费用_mj_{user.username}.xlsx"
                    out_path = os.path.join(save_path, fn)
                    _save_and_close(wb, out_path)
                    wb = None
                    files.append({"name": fn, "path": out_path})
                except Exception:
                    if wb is not None:
                        wb.close()
                    raise

            if not files:
                return json_result(-1, "没有可导出的数据, 费用金额为0")
        finally:
            try:
                app.quit()
            except Exception:
                pass

        # 删除无明细空单
        if sl == 0 and father:
            s.query(dzfy).filter(dzfy.rid == father).delete(synchronize_session=False)
        else:
            if father:
                d = run_sql(f"select sum(kkje) as kkjez1,sum(yfje1) as yfjez1 from dzfysheet where (pid='{father}')")
                if d:
                    kkje = get_field_value(d[0], "kkjez1", as_type=float)
                    yfje1 = get_field_value(d[0], "yfjez1", as_type=float)
                    s.query(dzfy).filter(dzfy.rid == father).update(
                        {"kkje": kkje, "yfje1": yfje1}, synchronize_session=False
                    )

        # 压缩文件
        filename = ""
        if len(files) > 0:
            filename = time.strftime("%Y%m%d%H%M%S") + "_special_fee_report.zip"
            sZipPath = os.path.join(save_path, filename)
            zipFile = zipfile.ZipFile(sZipPath, "w")
            for f in files:
                file_path = f.get("path", "")
                if os.path.exists(file_path):
                    zipFile.write(file_path, f.get("name"), zipfile.ZIP_DEFLATED)
            zipFile.close()

        s.commit()
        return json_result(1, "导出成功", filename)
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
