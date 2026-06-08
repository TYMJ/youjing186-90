"""
工厂索赔「优景赔款说明表g」Excel 填充与 PDF 输出。

自包含 xlwings 与转 PDF 逻辑；模版路径为 ``template/优景赔款说明表g.xlsx``（首张工作表为工厂版式）。
"""

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

from any import *
from .model import *
from datetime import datetime


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
    return True


def fill_signature_cells(ws, sig_paths, labels, img_row, sqr_text):
    for col, key in (("B", "zjl"), ("D", "tjzj"), ("F", "tjjl")):
        coord = f"{col}{img_row}"
        if not _add_signature_image(ws, col, img_row, sig_paths.get(key)):
            safe_write(ws, coord, labels.get(key, ""))
            _set_cell_center(ws, coord)
    safe_write(ws, f"G{img_row}", f"经办人：{sqr_text}")
    _set_cell_center(ws, f"G{img_row}")


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


def _format_date(v):
    """
    将数据库中的日期字段格式化为 Excel 显示用字符串（对齐 Delphi 里 pzrq 等写法）。
    """
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
    """
    按老 Delphi 流程，把一条已审核通过的 gongcsp 记录写入工厂版赔款说明表工作表。

    :param ws: xlwings worksheet（工厂模版对应的工作表）
    :param grow: dict，来自 ``select * from gongcsp`` 的一行
    :param khmc_g: 客户名称；由调用方传入（工厂 PDF 仅在有 ``kh.company_name`` 时传入非空值）
    """
    # ---------- 1) 从 gongcsp 取主表字段（对应 Delphi tmpcom 打开 gongcsp） ----------
    hbdm = get_field_value(grow, "hbdm")
    rmbkh = "是" if "RMB" in hbdm else "否"

    sccj = get_field_value(grow, "sccj")
    pzrq = _format_date(grow.get("pzrq"))

    # Delphi: cght1 作为发票/采购合同号码写入 C3
    fphm = get_field_value(grow, "cght1")
    # Delphi: cgje 作为合同总额写入 D4（字段名 pkhj1 在注释里写的是 cgje）
    pkhj1 = get_field_value(grow, "cgje")
    if pkhj1 in ("", None):
        pkhj1 = get_field_value(grow, "pkhj1")

    sqr = get_field_value(grow, "sqr")
    # Delphi 里索赔金额用 pfhj 写入 G4
    spje = get_field_value(grow, "pfhj")
    if spje in ("", None):
        spje = get_field_value(grow, "spje")

    # 原 Delphi 注释写「合同操作人」，但代码把 yjrq 也赋成了 sqr，此处保持同一取值以免与老打印不一致
    yjrq = sqr

    spyy = "索赔原因:" + get_field_value(grow, "spyy") + "过错原因:" + get_field_value(grow, "gcyy")
    gccljg = get_field_value(grow, "cljg")
    ffhjy = get_field_value(grow, "jjjy")

    khmc = str(khmc_g or "").strip()

    # ---------- 2) 客户处理结果：khsp，Delphi 用 gongcsp.fphm 关联 khsp.ajbh ----------
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

    # ---------- 3) 审批链签名：ywrybiao -> zx -> tpzx ----------
    tjjl, tjzj, zjl = _bmjl_and_zx(sqr)
    sig_labels = {"zjl": zjl, "tjzj": tjzj, "tjjl": tjjl}
    sig_paths = _collect_signature_paths(tjjl, tjzj, zjl)

    # ---------- 4) 写入单元格（行列对齐 Delphi 对「优景赔款说明表g」的操作顺序） ----------
    safe_write(ws, "G2", "'" + pzrq)

    safe_write(ws, "A3", "采购合同号码：")
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
    safe_write(ws, "C6", sccj)

    # 第 7 行：索赔原因（Delphi 用 I7 辅助 AutoFit 再清空）
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

    # 工厂版签名区在第 11 行（Delphi B11/D11/F11 插图，G11 经办人）
    fill_signature_cells(ws, sig_paths, sig_labels, 11, sqr)


@any_route("/api/saier/factory_claim/report", methods=["POST", "GET"])
@require_token
async def view_saier_factory_claim_report(request):
    """
    单条工厂索赔记录生成 PDF。

    请求 JSON：``rid`` — 当前 ``gongcsp`` 记录 rid；须 ``shjg='通过'``。
    成功时 ``data`` 为临时目录下 PDF 文件名，前端用 ``/api/tmp/file/get`` 下载。
    """
    s = Session()
    user = request.current_user
    j = await request.json()

    app = None
    wb = None
    try:
        rid = j.get("rid", "")
        if not rid:
            return json_result(-1, "参数缺失：rid")

        gong_rows = run_sql(f"select * from gongcsp where rid='{rid}' and shjg='通过'")
        if not gong_rows:
            return json_result(-1, "未找到已审核通过的工厂索赔记录")

        grow = gong_rows[0]
        ajbh = get_field_value(grow, "ajbh")

        khmc_g = ""
        khbh = get_field_value(grow, "khbh")
        if khbh:
            kd = run_sql(f"select company_name from kh where kh_id='{khbh}'")
            if kd:
                cn = get_field_value(kd[0], "company_name")
                if cn:
                    khmc_g = cn

        save_path = config.tmp_path
        os.makedirs(save_path, exist_ok=True)
        base_path = os.path.join(config.data_upload_path, "template")
        template_path = os.path.join(base_path, "优景赔款说明表g.xlsx")
        if not os.path.exists(template_path):
            return json_result(-1, "模版文件缺失：优景赔款说明表g.xlsx")

        app = xw.App(visible=False, add_book=False)
        app.display_alerts = False
        app.screen_updating = False
        wb = app.books.open(template_path)
        if not wb.sheets:
            return json_result(-1, "模版工作簿为空")
        ws = wb.sheets[0]

        _fill_factory_claim_sheet(ws, grow, khmc_g)
        # 对齐老客户端 Sleep(500)，避免刚写完单元格/图片即存盘偶发问题
        time.sleep(0.5)

        stem = _safe_filename(ajbh) or _safe_filename(rid)
        excel_full = os.path.join(save_path, f"{stem}工厂索赔{datetime.now().strftime('%Y-%m-%d')}.xlsx")
        wb.save(excel_full)  # 与 PDF 一并保留在 tmp，便于备查
        wb.close()
        wb = None

        time.sleep(0.05)  # 对齐 Delphi Sleep(50)，再交 Java 转 PDF

        pdf_res = convert_excel_to_pdf(excel_full, save_path)
        if not pdf_res.get("success"):
            s.rollback()
            return json_result(-1, pdf_res.get("error") or "PDF转换失败")

        out_name = os.path.basename(pdf_res["pdf_path"])

        if ("U" in user.username) or ("JY" in user.username):
            grow_rid = get_field_value(grow, "rid")
            s.query(gongcsp).filter(gongcsp.rid == grow_rid, gongcsp.shjg == "通过").update(
                {gongcsp.cwdy: user.username + datetime.now().strftime("%Y-%m-%d")}, synchronize_session=False
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
