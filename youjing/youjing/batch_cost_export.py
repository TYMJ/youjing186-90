from any import *
from .model import *
from sqlalchemy.sql import func, or_
from .__default__ import get_uuid
import os
import time
from datetime import datetime
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
    # 二维合并区须用 (1,1) 取左上角单格；area[0] 会得到第一整行
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
    """在 insert_row 插入一行并复制 template_row 的格式。"""
    ws.range(insert_row, insert_row).api.EntireRow.Insert()
    ws.range(template_row, template_row).copy()
    ws.range(insert_row, insert_row).paste(paste="formats")


def delete_row(ws, row_num):
    ws.range(row_num, row_num).api.EntireRow.Delete()


SYS_FIELDS = ["sid", "rid", "uid", "ctime", "mtime", "has_att", "modi_uid", "wf_status", "wf_unit", "pid", "archived"]

# excel配置
_BASE_INFO_FIELDS = {
    "E2": ("khmc", str),
    "G2": ("chyrq", str),
    "B3": ("cyka", str),
    "E3": ("mdka", str),
    "G3": ("hglx", str),
}

_ZYFQR_FIELDS = {
    **_BASE_INFO_FIELDS,
    "B5": ("zdcf", float),
    "C5": ("THCf", float),
    "D5": ("wjf", float),
    "E5": ("zczf", float),
    "F5": ("AMSENS", float),
    "G5": ("dfzd", float),
    "H5": ("dcf", float),
    "I5": ("zxf", float),
    "B7": ("xdf", float),
    "C7": ("gzf", float),
    "D7": ("cdlrf", float),
    "E7": ("gbf", float),
    "F7": ("tcf", float),
    "G7": ("tjf", float),
    "H7": ("zbgf_tbf", str),
    "I7": ("pxnz", float),
    "C8": ("gdf", float),
    "E8": ("cyf", float),
    "G8": ("qtfy", float),
    "B9": ("hjnl", float),
    "F9": ("hjhy", float),
    "B11": ("fytj", str),
    "E11": ("fytj1", str),
    "H11": ("zdry", str),
}

_2ZYFQR_FIELDS = {
    **_BASE_INFO_FIELDS,
    "B5": ("tcf1", float),
    "C5": ("tjf1", float),
    "D5": ("dsf1", float),
    "E5": ("gyf1", float),
    "F5": ("tmfy1", float),
    "G5": ("jff1", float),
    "H5": ("zczf1", float),
    "I5": ("sjhd1", float),
    "B7": ("zbgf1_tbf1", str),
    "C7": ("ldf1", float),
    "D7": ("gyd1", float),
    "E7": ("cyf1", float),
    "F7": ("mdf1", float),
    "G7": ("lwf1", float),
    "H7": ("jtf1", float),
    "I7": ("gdf1", float),
    "C8": ("xdf1", float),
    "E8": ("zxckf1", float),
    "G8": ("qtfy1", float),
    "B9": ("hjnl1", float),
    "F9": ("hjhy1", float),
    "B11": ("ywsp1", str),
    "E11": ("dzsp1", str),
    "H11": ("zdry", str),
}

_DYFQR_FIELDS = {
    **_BASE_INFO_FIELDS,
    "B5": ("zbgf2_tbf2", str),
    "C5": ("ldf2", float),
    "D5": ("gyd2", float),
    "E5": ("cyf2", float),
    "F5": ("mdf2", float),
    "G5": ("lwf2", float),
    "H5": ("jtf2", float),
    "I5": ("gdf2", float),
    "B7": ("xdf2", float),
    "C7": ("zczf2", float),
    "D7": ("sjhd2", float),
    "E7": ("zxck2", float),
    "F7": ("qtfy2", float),
    "B8": ("hjnl2", float),
    "F8": ("hjhy2", float),
    "B10": ("ywsp2", str),
    "E10": ("dzsp2", str),
    "H10": ("zdry", str),
}

_BASE_BUSINESS_CONFIGS = [
    ("zdhd", "bank1", "zh1", "dzqr", "ywqr", "zddy"),  # 指定货代, 银行, 账号, 单证确认, 业务确认, 指定打印
    ("zrhd", "bank2", "zh2", "dzqr1", "ywqr1", "zldy"),  # 自拉自报
    ("bghd", "bank3", "zh3", "dzqr2", "ywqr2", "dbdy"),  # 单报关
]


def get_business_configs():
    # 指定货代、自拉自报、单报关 配置
    return [
        {
            "type": "1",
            "name": "zdhd",
            "bank": "bank1",
            "zh": "zh1",
            "dzqr": "dzqr",
            "ywqr": "ywqr",
            "print": "zddy",
            "hjnl": "hjnl",
            "hjhy": "hjhy",
            "fy_type": "指定货代",
            "template": "zyfqr",
            "excel_fields": _ZYFQR_FIELDS,
            "special": {
                "B2": lambda row: get_field_value(row, "ysfp") or get_field_value(row, "fphm"),
                "H7": lambda row: (
                    f"{get_field_value(row, 'zbgf', as_type=float)}/{get_field_value(row, 'tbf', as_type=float)}"
                ),
            },
            "amount_fields": ("zdfy", "zdfym"),
        },
        {
            "type": "2",
            "name": "zrhd",
            "bank": "bank2",
            "zh": "zh2",
            "dzqr": "dzqr1",
            "ywqr": "ywqr1",
            "print": "zldy",
            "hjnl": "hjnl1",
            "hjhy": "hjhy1",
            "fy_type": "自拉自报",
            "template": "2zyfqr",
            "excel_fields": _2ZYFQR_FIELDS,
            "special": {
                "B2": lambda row: get_field_value(row, "ysfp") or get_field_value(row, "fphm"),
                "B7": lambda row: (
                    f"{get_field_value(row, 'zbgf1', as_type=float)}/{get_field_value(row, 'tbf1', as_type=float)}"
                ),
            },
            "amount_fields": ("zlzbfy", "zlzbfym"),
        },
        {
            "type": "3",
            "name": "bghd",
            "bank": "bank3",
            "zh": "zh3",
            "dzqr": "dzqr2",
            "ywqr": "ywqr2",
            "print": "dbdy",
            "hjnl": "hjnl2",
            "hjhy": "hjhy2",
            "fy_type": "单报关",
            "template": "dyfqr",
            "excel_fields": _DYFQR_FIELDS,
            "special": {
                "B2": lambda row: get_field_value(row, "ysfp") or get_field_value(row, "fphm"),
                "B5": lambda row: (
                    f"{get_field_value(row, 'zbgf2', as_type=float)}/{get_field_value(row, 'tbf2', as_type=float)}"
                ),
            },
            "amount_fields": ("dbgfy", "dbgfym"),
        },
    ]


def query_summary_row(rid, business_name, export_data, print_date, configs):
    # 7种情况，1，2，3，12/21， 13/31， 23/32， 123/...
    active_configs = [cfg for cfg in configs if cfg["type"] in export_data]

    if not active_configs:
        return None

    # 三种类型匹配
    name_conditions = []
    for cfg in active_configs:
        name_conditions.append(f"({cfg['name']}='{business_name}')")

    # 三种类型对应的 确认状态，打印状态
    status_conditions = []
    for cfg in active_configs:
        status_conditions.append(
            f"({cfg['dzqr']}='通过' and {cfg['ywqr']}='通过' "
            f"and (ifnull({cfg['print']},'')='' or {cfg['print']}='{print_date}'))"
        )

    d = run_sql(
        f"select * from hdfy where(rid='{rid}') and \
        ({' or '.join(name_conditions)}) and \
        ({' or '.join(status_conditions)})"
    )
    return d


def add_business_info(name, bank, account, gcmc, yh_list, zh_list):
    if name and name not in gcmc:
        gcmc.append(name)
        yh_list.append(bank)
        zh_list.append(account)
    return gcmc, yh_list, zh_list


def get_field_value(row, field_name, default="", as_type=str):
    value = row.get(field_name, default)
    if as_type is float:
        return float(value) if value not in ("", None) else 0.0
    if value is None:
        return ""
    return str(value).strip()


def check_business_status(row, name, dzqr, ywqr, is_print):
    name = get_field_value(row, name)
    dzqr = get_field_value(row, dzqr)
    ywqr = get_field_value(row, ywqr)
    is_print = get_field_value(row, is_print)
    if name and dzqr == "通过" and ywqr == "通过" and not is_print:
        return name
    return None


def fill_excel_template(ws, row, excel_fields, special_fields=None):
    # 根据配置填充excel模版
    special_fields = special_fields or {}

    for cell, cell_fn in special_fields.items():
        safe_write(ws, cell, cell_fn(row))

    for cell, (field, field_type) in excel_fields.items():
        if cell not in special_fields:
            if cell == "G2":
                # 处理日期字段，去掉时间部分
                date_str = get_field_value(row, field, as_type=str)
                date_only = "'" + date_str.split()[0].replace("/", "-") if date_str else ""
                safe_write(ws, cell, date_only)
            else:
                safe_write(ws, cell, get_field_value(row, field, as_type=field_type))

    return ws


def get_bank_info(business_name):
    # 查询船代资料，相关银行信息
    d = run_sql(
        f"select cdzl.bank,cdzl.zh,cdzl.shui,yh.yhdm,yh.yhdz,yh.wyjgh,yh.lhh,yh.jgh,yh.sjyh,yh.sjlhh \
            from cdzl left join(select yhbm.yhdm,yhbm.yhdz,yhbm.wyjgh,yhbm.lhh,yhbm.jgh,yhbm.sjyh,yhbm.sjlhh,yhbm.yhmc from yhbm) as yh on yh.yhmc=cdzl.bank \
            where (cdzl.cdmc='{business_name}')"
    )
    return d[0] if d else {}


def check_dzfy_permission(username):
    # 查询用户 单证费用生成 权限
    d = run_sql(f"select * from cyzglsheet where (xm='{username}') and (zm='单证费用生成')")
    if d:
        return True
    d = run_sql("select * from cyzglsheet where (zm='单证费用生成')")
    return len(d) == 0


def generate_jzpz():
    # 生成凭证号
    now = datetime.now()
    prefix = f"HDFY{now.strftime('%y%m%d')}"
    # 查询 单证费用 当天最大 申请单号
    d = run_sql(f"select jzpz from dzfy where jzpz like '%{prefix}%' order by jzpz desc limit 1")
    next_num = int(d[0].get("jzpz")[10:14]) + 1 if d else 1
    return f"{prefix}{next_num:04d}"


def create_dzfy_main(session, user, business_name, bank_info, jzpz):
    # 创建单证费用主表记录
    row = {
        "jzpz": jzpz,
        "jbr": user.username,
        "gcmc": business_name,
        "sh": get_field_value(bank_info, "shui"),
        "bank": get_field_value(bank_info, "bank"),
        "zh": get_field_value(bank_info, "zh"),
        "yt": "贷款",
        "fpwk": "",
        "sfjq": "否",
        "sqrq": time.strftime("%Y-%m-%d"),
        "yhdm": get_field_value(bank_info, "yhdm"),
        "lhh": get_field_value(bank_info, "lhh"),
        "jgh": get_field_value(bank_info, "jgh"),
        "wyjgh": get_field_value(bank_info, "wyjgh"),
        "sjyh": get_field_value(bank_info, "sjyh"),
        "sjlhh": get_field_value(bank_info, "sjlhh"),
        "yhdz": get_field_value(bank_info, "yhdz"),
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
    for k, v in row.items():
        if k in SYS_FIELDS:
            continue
        if hasattr(m, k):
            setattr(m, k, v)
    m.rid = get_uuid()
    m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
    session.add(m)
    return m.rid


def create_dzfysheet_detail(session, father_rid, row, config):
    # 创建单证费用明细记录
    fphm = get_field_value(row, "fphm")
    hjnl = get_field_value(row, config["hjnl"], as_type=float)
    hjhy = get_field_value(row, config["hjhy"], as_type=float)
    rmb_field, usd_field = config["amount_fields"]

    d = run_sql(
        f"select rid from dzfysheet where pid='{father_rid}' and fphm='{fphm}' and '{rmb_field}={hjnl}' and '{usd_field}={hjhy}' and fylx='{config['fy_type']}'"
    )
    if d:
        return 0

    row_data = {
        "fphm": fphm,
        "tdh": get_field_value(row, "tdh"),
        "fylx": config["fy_type"],
        "kkje": hjnl,
        "yfje1": hjhy,
        "zdfy": 0,
        "zlzbfy": 0,
        "dbgfy": 0,
        "tbfy": 0,
        "sjfy": 0,
        "xgzf": 0,
        "zdfym": 0,
        "zlzbfym": 0,
        "dbgfym": 0,
        "tbfym": 0,
        "sjfym": 0,
        "xgzfm": 0,
    }
    row_data[rmb_field] = hjnl
    row_data[usd_field] = hjhy

    m = dzfysheet()
    for k, v in row_data.items():
        if k in SYS_FIELDS:
            continue
        if hasattr(m, k):
            setattr(m, k, v)
    m.rid = get_uuid()
    m.pid = father_rid
    m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
    session.add(m)
    return 1


def update_print_status(session, rid, print_field):
    # 更新打印状态
    print_date = time.strftime("%Y-%m-%d")
    now = datetime.now()
    session.query(hdfy).filter(
        hdfy.rid == rid, or_(getattr(hdfy, print_field) == None, func.ifnull(getattr(hdfy, print_field), "") == "")
    ).update({print_field: print_date, "mtime": now}, synchronize_session=False)


# excel文件生成
def generate_excel_files(session, user, export_data, bgpm, business_name, save_path, base_path):
    configs = get_business_configs()
    files = []
    sl = 0
    father_rid = ""
    # ------ 1.生成单证费用主表 ------
    if check_dzfy_permission(user.username):
        bank_info = get_bank_info(business_name)
        jzpz = generate_jzpz()
        if jzpz:
            father_rid = create_dzfy_main(session, user, business_name, bank_info, jzpz)

    app = _start_excel_app()
    new_date = time.strftime("%Y-%m-%d")
    exported_prints = set()
    try:
        # ------ 2.处理单个货代，导出excel + 创建单证明细 ------
        file_index = 0
        for rid in bgpm:
            for cfg in configs:
                if cfg["type"] not in export_data:
                    continue

                d = run_sql(
                    f"select * from hdfy where rid='{rid}' and \
                        {cfg['name']}='{business_name}' and \
                        {cfg['dzqr']}='通过' and {cfg['ywqr']}='通过' and \
                        ifnull({cfg['print']},'')=''"
                )
                if not d:
                    continue
                row = d[0]

                if father_rid:
                    sl += create_dzfysheet_detail(session, father_rid, row, cfg)

                file_index += 1
                template_path = os.path.join(base_path, f"{cfg['template']}.xlsx")
                wb = _open_workbook(app, template_path)
                try:
                    ws = wb.sheets["Sheet1"]
                    fill_excel_template(ws, row, cfg["excel_fields"], cfg.get("special", {}))
                    fn = f"{user.username}{time.strftime('%Y%m%d%H%M%S')}_{file_index}_{cfg['template']}.xlsx"
                    out_path = os.path.join(save_path, fn)
                    _save_and_close(wb, out_path)
                    wb = None
                    files.append({"name": fn, "path": out_path})
                except Exception:
                    if wb is not None:
                        wb.close()
                    raise

                update_print_status(session, rid, cfg["print"])
                exported_prints.add((rid, cfg["print"]))

        # ------ 3.生成付款审批单 ------
        fyhj = 0
        fyhj1 = 0
        i5 = 0
        mc12 = ""
        zh12 = ""
        yh12 = ""
        zd12 = ""
        for rid in bgpm:
            d = run_sql(
                f"select * from hdfy where rid='{rid}' and \
                ((zdhd='{business_name}') or (zrhd='{business_name}') or (bghd='{business_name}')) and \
                (((dzqr='通过') and (ywqr='通过')) or \
                ((dzqr1='通过') and (ywqr1='通过')) or \
                ((dzqr2='通过') and (ywqr2='通过'))) and \
                fphm like '%CSD-%'"
            )
            if not d:
                continue

            row = d[0]

            for cfg in configs:
                if cfg["type"] not in export_data:
                    continue

                dzqr_val = get_field_value(row, cfg["dzqr"])
                ywqr_val = get_field_value(row, cfg["ywqr"])
                print_val = get_field_value(row, cfg["print"])
                if (rid, cfg["print"]) in exported_prints:
                    print_val = new_date

                if dzqr_val != "通过" or ywqr_val != "通过":
                    continue
                if print_val != new_date:
                    continue

                i5 += 1
                zd12 = zd12 or print_val
                mc12 = mc12 or get_field_value(row, cfg["name"])
                zh12 = zh12 or get_field_value(row, cfg["zh"])
                yh12 = yh12 or get_field_value(row, cfg["bank"])

                hjnl = get_field_value(row, cfg["hjnl"], as_type=float)
                hjhy = get_field_value(row, cfg["hjhy"], as_type=float)
                if hjnl > 0:
                    fyhj += hjnl
                elif hjhy > 0:
                    fyhj1 += hjhy

        if i5 > 0:
            wb = _open_workbook(app, os.path.join(base_path, "CSD付款审批单.xlsx"))
            try:
                ws = wb.sheets["审批单"]
                safe_write(ws, "A3", zd12)
                safe_write(ws, "B4", mc12)
                safe_write(ws, "B5", zh12)
                safe_write(ws, "B6", yh12)
                if fyhj > 0:
                    safe_write(ws, "B10", fyhj)
                if fyhj1 > 0 and fyhj == 0:
                    safe_write(ws, "B10", fyhj1, num_format="$#,##0.00")
                fn = f"可思达{business_name}{time.strftime('%Y-%m-%d')}付款审批单.xlsx"
                out_path = os.path.join(save_path, fn)
                _save_and_close(wb, out_path)
                wb = None
                files.append({"name": fn, "path": out_path})
            except Exception:
                if wb is not None:
                    wb.close()
                raise

        # ------ 4.生成费用汇总表 ------
        e = 0
        number = 7
        mj = 0
        rmb = 0
        sb1 = 0
        summary_wb = None
        for rid in bgpm:
            d = query_summary_row(rid, business_name, export_data, new_date, configs)
            if not d:
                continue
            row = d[0]
            sb1 += 1

            if sb1 == 1:
                summary_wb = _open_workbook(app, os.path.join(base_path, "yfsp.xlsx"))
                ws = summary_wb.sheets[0]
                for mr_addr in _get_merged_cell_addresses(ws):
                    rng = ws.range(mr_addr)
                    if rng.row > number:
                        rng.unmerge()
                safe_write(ws, "A2", datetime.now().strftime("%Y 年 %m 月 %d 日"))
                safe_write(ws, "B3", business_name)

            row_hjhy = 0.0
            row_hjnl = 0.0
            for cfg in configs:
                if cfg["type"] not in export_data:
                    continue
                if get_field_value(row, cfg["name"]) == business_name:
                    row_hjhy += get_field_value(row, cfg["hjhy"], as_type=float)
                    row_hjnl += get_field_value(row, cfg["hjnl"], as_type=float)
            mj += row_hjhy
            rmb += row_hjnl

            e += 1
            insert_row = number + e
            insert_data_row(ws, number, insert_row)
            ysfp = get_field_value(row, "ysfp")
            safe_write(ws, f"A{insert_row}", ysfp or get_field_value(row, "fphm"))
            ws[f"B{insert_row}"].value = row_hjhy
            ws[f"C{insert_row}"].value = row_hjnl
            ws[f"D{insert_row}"].value = get_field_value(row, "chyrq")

        if sb1 > 0 and summary_wb is not None:
            ws = summary_wb.sheets[0]
            ws[f"B{10 + e}"].value = mj
            ws[f"C{10 + e}"].value = rmb
            ws[f"D{14 + e}"].value = f"经办人: {user.username}"
            for del_row in sorted([number, 8 + e, 9 + e], reverse=True):
                delete_row(ws, del_row)
            fn = f"{business_name}付款审批单.xlsx"
            out_path = os.path.join(save_path, fn)
            _save_and_close(summary_wb, out_path)
            summary_wb = None
            files.append({"name": fn, "path": out_path})
    finally:
        try:
            app.quit()
        except Exception:
            pass

    # ------ 5.删除无明细空单 ------
    if sl == 0 and father_rid:
        session.query(dzfy).filter(dzfy.rid == father_rid).delete(synchronize_session=False)
    else:
        if father_rid:
            d = run_sql(f"select sum(kkje) as kkjez1,sum(yfje1) as yfjez1 from dzfysheet where (pid='{father_rid}')")
            if d:
                kkje = get_field_value(d[0], "kkjez1", as_type=float)
                yfje1 = get_field_value(d[0], "yfjez1", as_type=float)
                session.query(dzfy).filter(dzfy.rid == father_rid).update(
                    {"kkje": kkje, "yfje1": yfje1}, synchronize_session=False
                )

    return files


def collect_business_info(mode, rid, rids):
    # rid, 货代名称，银行列表，账号列表
    bgpm, gcmc, yh_list, zh_list = [], [], [], []
    message = ""
    printed_name = ""
    if mode == "1":
        d = run_sql(
            f"select cdmc,rid,zdhd,zrhd,bghd,bank1,zh1,bank2,zh2,bank3,zh3, zddy,zldy,dbdy from hdfy where rid='{rid}'"
        )
        if d:
            bgpm.append(rid)
            for name_f, bank_f, zh_f, dzqr_f, ywqr_f, dy_f in _BASE_BUSINESS_CONFIGS:
                if get_field_value(d[0], dy_f):
                    if name_f == "zdhd":
                        printed_name += "指定货代/"
                    elif name_f == "zrhd":
                        printed_name += "自拉自报/"
                    elif name_f == "bghd":
                        printed_name += "单报关/"
                    continue
                gcmc, yh_list, zh_list = add_business_info(
                    get_field_value(d[0], name_f),
                    get_field_value(d[0], bank_f),
                    get_field_value(d[0], zh_f),
                    gcmc,
                    yh_list,
                    zh_list,
                )
        if not gcmc:
            message = printed_name + "不可重复打印"
    else:
        for rid in rids:
            d = run_sql(
                f"select cdmc,rid,zdhd,zrhd,bghd,bank1,zh1,bank2,zh2,bank3,zh3,zddy,zldy,dbdy,dzqr,ywqr,dzqr1,ywqr1,dzqr2,ywqr2 from hdfy where rid='{rid}'"
            )
            if d:
                for row in d:
                    logger.error(f"{gcmc}")
                    bgpm.append(rid)
                    for name_f, bank_f, zh_f, dzqr_f, ywqr_f, dy_f in _BASE_BUSINESS_CONFIGS:
                        name = check_business_status(row, name_f, dzqr_f, ywqr_f, dy_f)
                        if get_field_value(row, dy_f):
                            if name_f == "zdhd":
                                printed_name += "指定货代/"
                            elif name_f == "zrhd":
                                printed_name += "自拉自报/"
                            elif name_f == "bghd":
                                printed_name += "单报关/"
                            continue
                        if name:
                            gcmc, yh_list, zh_list = add_business_info(
                                name, get_field_value(row, bank_f), get_field_value(row, zh_f), gcmc, yh_list, zh_list
                            )
            if not gcmc:
                message = printed_name + "不可重复打印"
    return bgpm, gcmc, yh_list, zh_list, message


@any_route("/api/saier/batch/cost/export", methods=["POST", "GET"])
@require_token
async def view_saier_batch_cost_export(request):
    s = Session()
    user = request.current_user
    j = await request.json()

    try:
        # 权限检查
        d = run_sql(f"select * from sys_user where username='{user.username}' and position like '%单证%'")
        if not d:
            return json_result(-1, "权限不足")

        mode = j.get("mode", "1")  # 用户选择导出内容, 1为当前，2为批量，默认当前
        rid = j.get("rid", "")
        rids = j.get("rids", "")
        export_data = j.get("export_data", "")  # 请要导出的内容,指定货代输1,自拉自报输2,单报关输3,可任意组合,所有为123
        save_path = config.tmp_path
        base_path = os.path.join(config.data_upload_path, "template")

        if not export_data:
            return json_result(-1, "请选择导出内容")

        # 获取基础信息
        bgpm, gcmc, yh_list, zh_list, message = collect_business_info(mode, rid, rids)
        logger.error(
            f"基础信息 - bgpm: {bgpm}, gcmc: {gcmc}, yh_list: {yh_list}, zh_list: {zh_list}, message: {message}"
        )
        if message:
            return json_result(-1, message)

        if not gcmc:
            return json_result(-1, "没有符合条件的数据")

        # 检查模版文件
        required_templates = ["zyfqr", "2zyfqr", "dyfqr", "yfsp", "CSD付款审批单"]
        for tpl in required_templates:
            if not os.path.exists(os.path.join(base_path, f"{tpl}.xlsx")):
                return json_result(-1, f"模版文件缺失：{tpl}.xlsx")

        # 处理导出
        all_files = []
        for business_name in gcmc:
            files = generate_excel_files(s, user, export_data, bgpm, business_name, save_path, base_path)
            all_files.extend(files)

        # 压缩文件
        filename = ""
        if len(all_files) > 0:
            filename = time.strftime("%Y%m%d%H%M%S") + "_batch_cost_export.zip"
            sZipPath = os.path.join(save_path, filename)
            zipFile = zipfile.ZipFile(sZipPath, "w")
            for f in all_files:
                file_path = f.get("path", "")
                if os.path.exists(file_path):
                    zipFile.write(file_path, f.get("name"), zipfile.ZIP_DEFLATED)
            zipFile.close()

        if os.path.exists(save_path + "/" + filename):
            logger.error(f"报表生成成功: {save_path}/{filename}")
        s.commit()
        return json_result(1, "导出成功", filename)

    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
