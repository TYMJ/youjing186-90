import os
import subprocess
import sys
import textwrap
import time
import zipfile

from any import *

from .__default__ import get_uuid
from sqlalchemy.sql import func, or_
from .model import *
from datetime import datetime

try:
    import cn2an
    import xlwings as xw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "xlwings", "cn2an"])
    import cn2an
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
    应在写入该行所有内容后调用；仅针对指定列，避免整表 AutoFit 卡死服务器。"""
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


SYS_FIELDS = ["sid", "rid", "uid", "ctime", "mtime", "has_att", "modi_uid", "wf_status", "wf_unit", "pid", "archived"]


def process_hdfy_data(rid, i4, bgpm, gcmc, rmbsb, mjsb):
    # 货代信息
    try:
        d = run_sql(
            f"select cdmc,rid,zdhd,zrhd,bghd,bank1,zh1,bank2,zh2,bank3,zh3,sbje,sbjem,sjhd \
                from hdfy \
                where (rid='{rid}') and (ifnull(sbdy,'') = '')"
        )
        if len(d) > 0:
            for row in d:
                i4 += 1
                bgpm.append(row.get("rid"))
                gcmc = str(row.get("sjhd", gcmc)).strip()
                rmbsb = "1" if float(row.get("sbje") or 0) > 0 else rmbsb
                mjsb = "1" if float(row.get("sbjem") or 0) > 0 else mjsb
        return i4, bgpm, gcmc, rmbsb, mjsb, d
    except:
        logger.error(trace_error())
        raise


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


def process_report_file(file_path, save_path, bgpm, mj, jl, currency, username, files, session):
    excel = None
    wb = None
    try:
        fn = ""
        excel = xw.App(visible=False, add_book=False)
        wb = excel.books.open(file_path)
        ws = wb.sheets[0]
        template_row = 5
        e = 0
        result = ""

        # 取消合并模板行以下的合并单元格，避免后续写入/插行失败
        for mr_addr in _get_merged_cell_addresses(ws):
            rng = ws.range(mr_addr)
            if rng.row > template_row:
                rng.unmerge()

        for rid in bgpm:
            d = run_sql(
                f"select * from hdfy where (rid='{rid}') and ((dzqr4='通过') and (ywqr4='通过')) and ({currency}>0)"
            )
            if len(d) > 0:
                mj = mj + float(d[0].get(currency, 0.0))
                jl = str(d[0].get("dzsp4", "")).strip()
                e += 1
                insert_row = template_row + e

                # 插入新数据行并复制模板行格式（对照 Delphi Rows[number].copy + PasteSpecial）
                ws.range(insert_row, insert_row).api.EntireRow.Insert()
                src_rng = ws.range((template_row, 1), (template_row, 3))
                tgt_rng = ws.range((insert_row, 1), (insert_row, 3))
                src_rng.copy()
                tgt_rng.paste(paste="all")

                # 模板第 5 行未解除合并，复制格式后新行可能仍含合并区 → 用 safe_write
                if d[0].get("ysfp", ""):
                    safe_write(ws, f"A{insert_row}", str(d[0].get("ysfp", "")).strip())
                else:
                    safe_write(ws, f"A{insert_row}", str(d[0].get("fphm", "")).strip())
                safe_write(ws, f"B{insert_row}", str(d[0].get("sbnr", "")).strip())
                fmt = "¥#,##0.00" if currency == "sbje" else "$#,##0.00"
                safe_write(ws, f"C{insert_row}", float(d[0].get(currency, 0.0)), num_format=fmt)
                # 对照 source.pas Rows.AutoFit：A 列发票号 / B 列申报内容均可能换行
                adjust_row_height(ws, insert_row, col="B")
                adjust_row_height(ws, insert_row, col="A")

                sbdy = time.strftime("%Y-%m-%d")
                now = datetime.now()
                session.query(hdfy).filter(hdfy.rid == rid, func.ifnull(hdfy.sbdy, "") == "").update(
                    {"sbdy": sbdy, "mtime": now}, synchronize_session=False
                )

        if mj > 0:
            what = f"{mj:.2f}"
            result = cn2an.an2cn(float(what), "rmb")

        # 合计行：插行前已解除第 5 行以下合并，B/C 为独立单元格，直接写
        ws[f"B{7 + e}"].value = result
        ws[f"C{7 + e}"].value = mj
        if result:
            adjust_row_height(ws, 7 + e, col="B")
        # 签名行：A:D 合并区域，写入左上角主单元格
        ws.range(f"A{8 + e}:D{8 + e}").merge()
        safe_write(ws, f"A{8 + e}", f"部门经理:{jl}   财务审核 :                 报销人:{username}")
        adjust_row_height(ws, 8 + e, col="A")

        # 删除模板行
        ws.range(template_row, template_row).api.EntireRow.Delete()

        fn = f"{username}{time.strftime('%Y%m%d%H%M%S')}_{currency}_dzfybx.xlsx"
        save_file_path = os.path.join(save_path, fn)
        wb.save(save_file_path)
        wb.close()
        files.append({"name": fn, "path": save_file_path})

        return files
    except:
        logger.error(trace_error())
        raise
    finally:
        if wb:
            try:
                wb.close()
            except Exception:
                pass
        if excel:
            try:
                excel.quit()
            except Exception:
                pass


@any_route("/api/saier/document/fee/generate", methods=["POST", "GET"])
@require_token
async def view_saier_document_fee_generate(request):  # 单证费用
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        bgpm = []
        sss = []
        sss1 = []
        gcmc = ""
        mj = 0.0
        rmb = 0.0
        mjsb = ""
        rmbsb = ""
        i4 = 0
        sjhjgh = ""
        kpxhz = 0

        # 检查当前用户 单证
        d = run_sql(f"select * from sys_user where username='{user.username}' and (position like '%单证%')")
        if len(d) == 0:
            return json_result(-1, "权限不足")

        # 选择模版文件
        file_path = os.path.join(config.data_upload_path, "template/dzfybx.xlsx")
        if not os.path.exists(file_path):
            return json_result(-1, "未找到报表模版")

        # 用户选择导出范围(当前/全部)
        save_path = config.tmp_path
        da2 = j.get("iekedit", "1")
        rid = j.get("rid", "")
        rids = j.get("rids", [])

        if not save_path:
            return json_result(-1, "请提供文件保存路径")

        logger.error(f"单证费用生成: da2={da2}, rid={rid}, rids={rids}")
        if da2 == "2":
            for rid in rids:
                i4, bgpm, gcmc, rmbsb, mjsb, d = process_hdfy_data(rid, i4, bgpm, gcmc, rmbsb, mjsb)
        else:
            i4, bgpm, gcmc, rmbsb, mjsb, d = process_hdfy_data(rid, i4, bgpm, gcmc, rmbsb, mjsb)

        logger.error(f"处理完成: i4={i4}, bgpm={bgpm}, gcmc={gcmc}, rmbsb={rmbsb}, mjsb={mjsb}")
        mj = 0.0
        kpxhn = time.strftime("%y")
        kpxhy = time.strftime("%m")
        kpxhr = time.strftime("%d")
        kpxh1 = f"HDFY{kpxhn}{kpxhy}{kpxhr}"
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
        what = ""
        mw = ""
        result = ""
        jl = ""
        # 获取 船代资料(cdzl) 和 银行编码(yhbm)
        d = run_sql(
            f"select cdzl.bank,cdzl.zh,cdzl.shui,yh.yhdm,yh.yhdz,yh.wyjgh,yh.lhh,yh.jgh,yh.sjyh,yh.sjlhh \
                from cdzl left join(select yhbm.yhdm,yhbm.yhdz,yhbm.wyjgh,yhbm.lhh,yhbm.jgh,yhbm.sjyh,yhbm.sjlhh,yhbm.yhmc from yhbm) as yh on yh.yhmc=cdzl.bank \
                where (cdzl.cdmc='{gcmc}')"
        )
        if len(d) > 0:
            sh = str(d[0].get("shui", "")).strip()
            bank = str(d[0].get("bank", "")).strip()
            zh2 = str(d[0].get("zh", "")).strip()
            yhdm = str(d[0].get("yhdm", "")).strip()
            yhdz = str(d[0].get("yhdz", "")).strip()
            wyjgh = str(d[0].get("wyjgh", "")).strip()
            lhh = str(d[0].get("lhh", "")).strip()
            jgh = str(d[0].get("jgh", "")).strip()
            sjyh = str(d[0].get("sjyh", "")).strip()
            sjlhh = str(d[0].get("sjlhh", "")).strip()

        # 根据 姓名和职能 判断是否有权限 生成单证费用
        dzfysb = ""
        d = run_sql(f"select * from cyzglsheet where (xm='{user.username}') and (zm='单证费用生成')")
        dzfysb = "1" if len(d) > 0 else dzfysb
        if not dzfysb:
            d = run_sql("select * from cyzglsheet where (zm='单证费用生成')")
            dzfysb = "1" if len(d) == 0 else dzfysb

        if dzfysb == "1":
            d = run_sql(f"select jzpz from dzfy where jzpz like '%{kpxh1}%' order by jzpz desc limit 1")
            kpxhz = int(d[0].get("jzpz")[10:14]) + 1 if len(d) > 0 else 1
            # 生成单证费用
            jzpz = f"{kpxh1}{kpxhz:04d}"
            if jzpz:
                row = {
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
                    "sjhjgh": sjhjgh,
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
                for k, v in row.items():
                    if k in SYS_FIELDS:
                        continue
                    if hasattr(m, k):
                        setattr(m, k, v)
                m.rid = get_uuid()
                m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                s.add(m)
                father = m.rid

        for rid in bgpm:
            d = run_sql(
                f"select * from hdfy \
                    where (rid='{rid}') and ((dzqr4='通过') and (ywqr4='通过')) and ((sbje>0) or (sbjem>0))"
            )
            fphm = ""
            sjfy = 0.0
            sjfym = 0.0
            tdh = ""
            kkje = 0.0
            yfje1 = 0.0
            if len(d) > 0:
                fphm = str(d[0].get("fphm", "")).strip()
                sjfy = float(d[0].get("sbje", 0.0))
                sjfym = float(d[0].get("sbjem", 0.0))
                tdh = str(d[0].get("tdh", "")).strip()
                kkje = float(d[0].get("sbje", 0.0))
                yfje1 = float(d[0].get("sbjem", 0.0))

            if father:
                d1 = run_sql(
                    f"select rid from dzfysheet \
                        where (pid='{father}') and (fphm='{fphm}') and (sjfy='{sjfy}') and (sjfym='{sjfym}') and (fylx='商检费用')"
                )
                if len(d1) == 0:
                    row = {
                        "fphm": fphm,
                        "tdh": tdh,
                        "zdfy": 0,
                        "zlzbfy": 0,
                        "dbgfy": 0,
                        "tbfy": 0,
                        "sjfy": sjfy,
                        "xgzf": 0,
                        "zdfym": 0,
                        "zlzbfym": 0,
                        "dbgfym": 0,
                        "tbfym": 0,
                        "sjfym": sjfym,
                        "xgzfm": 0,
                        "kkje": kkje,
                        "yfje1": yfje1,
                        "fylx": "商检费用",
                    }
                    m1 = dzfysheet()
                    for k, v in row.items():
                        if k in SYS_FIELDS:
                            continue
                        if hasattr(m1, k):
                            setattr(m1, k, v)
                    m1.rid = get_uuid()
                    m1.pid = father
                    m1.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                    s.add(m1)
                    sl += 1

        # 打印报表
        files = []
        if rmbsb == "1" and i4 > 0:
            files = process_report_file(file_path, save_path, bgpm, mj, jl, "sbje", user.username, files, s)

        # 美金处理 mjsb='1'
        if mjsb == "1" and i4 > 0:
            files = process_report_file(file_path, save_path, bgpm, rmb, jl, "sbjem", user.username, files, s)

        logger.error(f"files:{files}")
        filename = ""
        if len(files) > 0:
            # filename = "现金导入" + time.strftime("%Y%m%d%H%M%S") + ".zip"_dzfybx
            filename = time.strftime("%Y%m%d%H%M%S") + "_dzfybx.zip"
            sZipPath = os.path.join(save_path, filename)  # 压缩包路径
            zipFile = zipfile.ZipFile(
                sZipPath, "w"
            )  # 生成一个压缩包，第二个参数默认值为'r'，表示读已经存在的zip文件，'w'表示新建一个zip文档或覆盖一个已经存在的zip文档
            for f in files:
                file_path = os.path.join(save_path, str(f.get("path")))
                if os.path.exists(file_path):
                    zipFile.write(file_path, f.get("name"), zipfile.ZIP_DEFLATED)  # 将file_path的文件重命名为sfilename

            zipFile.close()

        if sl == 0 and father:
            s.query(dzfy).filter(dzfy.rid == father).delete(synchronize_session=False)
        else:
            if father:
                d = run_sql(f"select sum(kkje) as kkje,sum(yfje1) as yfje1 from dzfysheet where (rid='{father}')")
                if len(d) > 0:
                    kkjez1 = float(d[0].get("kkjez1", 0) or 0)
                    yfje1 = float(d[0].get("yfje1", 0) or 0)
                    s.query(dzfy).filter(dzfy.rid == father).update(
                        {"kkje": kkje, "yfje1": yfje1}, synchronize_session=False
                    )
        s.commit()
        if os.path.exists(save_path + "/" + filename):
            logger.error(f"单证费用报表生成成功: {save_path}/{filename}")

        return json_result(1, "生成成功", filename)
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
