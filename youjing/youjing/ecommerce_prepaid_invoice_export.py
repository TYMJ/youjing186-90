# 电商预填费用开票信息导出（对照 source.pas / purchase_ap.view_saier_purchase_ap_billed_download，数据源 dsytfy）
import json
import os
import shutil
import subprocess
import time
import zipfile

from any import *
from .model import *
from datetime import date, datetime, timedelta

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
    if rows * cols > 1:
        cell = area(1, 1)
        cell.value = value
        if num_format:
            cell.number_format = num_format
    else:
        if num_format:
            ws[coord].number_format = num_format
        ws[coord].value = value


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


def _start_excel_app():
    app = xw.App(visible=False, add_book=False)
    app.display_alerts = False
    app.screen_updating = False
    return app


def _open_workbook(app, path):
    return app.books.open(path)


def _clean_path_part(text):
    """对照 Pascal：发票号/生产厂家截断非法文件名字符。"""
    cx = (text or "").upper() if isinstance(text, str) else str(text or "")
    zs = len(cx)
    zs2 = 0
    zs3 = 0
    sbcx = ""
    for _ in range(zs):
        zs2 += 1
        zsw = cx[zs2 - 1]
        if zsw in ("/", "\n", "\r", "\\", ":", "*", "?", '"', "<", ">", "|", ""):
            sbcx = "1"
            if zs3 == 0:
                zs3 = zs2
    if zs3 >= 1 and sbcx == "1":
        return (text or "")[: zs3 - 1]
    return text or ""


def _floattostr_pascal(v):
    """模拟 Pascal floattostr：整数不带小数点，去掉末尾无意义的 0。"""
    if v is None or v == "":
        return ""
    try:
        f = float(v)
        if f == int(f):
            return str(int(f))
        s = str(f)
        if "." in s:
            s = s.rstrip("0").rstrip(".")
        return s
    except (TypeError, ValueError):
        return str(v)


def _export_one_record(session, app, tpl_path, d_row, ctx):
    """
    填充模板并保存。返回 dict: excel_path, pdf_path(可选), display_name, rid。
    """
    tp = ctx.get("tp", "1")
    want_pdf = True
    ywcs = ctx["ywcs"]
    uv = ctx.get("uv", "0")
    user_name = ctx["user_name"]
    save_dir = ctx["save_dir"]
    i1 = ctx["i1"]

    d = alchemy_object_to_dict(d_row)
    rid = d.get("rid")
    yssb = 1 if "优景" in (d.get("fktt") or "") else 0
    ywsb = 1 if "义乌" in (d.get("fktt") or "") else 0
    chyrq = d.get("chrq")
    if isinstance(chyrq, (datetime, date)):
        chyrq_str = chyrq.strftime("%Y-%m-%d")
    else:
        chyrq_str = str(chyrq or "")
    fktt = d.get("fktt") or ""
    wstt = d.get("wstt") or ""

    jjdz = ""
    wstt1 = ""
    gs = dz = sw = bank = ""
    kpcxdh = ""
    for r in run_sql("select * from kpnr"):
        wstt2 = r.get("gsjc")
        if wstt2 and wstt2 in fktt:
            gs = r.get("wfgs")
            dz = r.get("kpdz")
            sw = r.get("kpsh")
            bank = r.get("kpyh")
            jjdz = r.get("kpjjdz")
            kpcxdh = r.get("kpcxdh")
            wstt1 = r.get("gsjc")

    if not jjdz:
        if "义乌" in wstt:
            jjdz = "寄件地址：义乌市宗泽北路531号赛尔集团二楼   /邮编：322000/ 吴春燕 收/0579-85096055"
        else:
            jjdz = "寄件地址：宁波高新区光华路288号赛尔大厦25层  邮编315103/财务收/0574-27833931"

    cx1 = (d.get("fphm") or "").upper()
    cx1z = _clean_path_part(d.get("fphm"))
    cx = _clean_path_part(d.get("sccj"))

    if d.get("yjch") not in ("", None):
        cx2 = d.get("yjch")
    else:
        cx2 = d.get("chrq")

    zsl_v = d.get("zsl")
    if zsl_v is None:
        zsl_v = 0
    zsl_f = float(zsl_v)
    if zsl_f < 0:
        return None

    gdry_esc = (d.get("gdry") or "").replace("'", "''")
    u = run_sql(f"select * from ywrylx where (ryxm='{gdry_esc}')")
    if len(u) > 0 and u[0].get("Msn"):
        jjdz = u[0].get("Msn")

    cpbh = gs + "合同章"
    cpbh_esc = cpbh.replace("'", "''")
    stamp_path = None
    stamp_rows = run_sql(f"select tpmc,tpmc1 from tpzx where (cpbh='{cpbh_esc}') and (length(tpmc) > 5) limit 1")
    if stamp_rows:
        raw = stamp_rows[0].get("tpmc")
        src = _parse_tpzx_tpmc_first_src(raw)
        stamp_path = _tpzx_src_to_local_path(src)

    wb = _open_workbook(app, tpl_path)
    try:
        ws = wb.sheets[0]
        if stamp_path and os.path.isfile(stamp_path):
            try:
                # 对照 source.pas：绝对定位 Left=70, Top=600，原图大小（-1,-1）
                ws.pictures.add(stamp_path, left=70, top=600)
            except Exception:
                logger.error(f"插入合同章失败: {trace_error()}")

        safe_write(ws, "A8", gs)
        safe_write(ws, "C14", gs)
        safe_write(ws, "C15", dz)
        safe_write(ws, "C16", sw)
        safe_write(ws, "C17", bank)
        safe_write(ws, "G11", cx1)
        safe_write(ws, "G12", "")
        safe_write(ws, "C22", "'" + cx2)
        safe_write(ws, "G44", cx1)
        safe_write(ws, "C21", d.get("zwpm"))
        safe_write(ws, "G24", "'" + cx2.split()[0])
        safe_write(ws, "B22", _floattostr_pascal(d.get("chsl")))
        safe_write(ws, "E22", d.get("hgjldw"))
        safe_write(ws, "E24", "0")
        safe_write(ws, "G23", d.get("ytje"))

        ytje = float(d.get("ytje") or 0)
        if zsl_f > 3:
            safe_write(ws, "B23", round(ytje / 1.13 * 100) / 100)
            safe_write(ws, "G22", "13%")
            safe_write(ws, "E23", ytje - round(ytje / 1.13 * 100) / 100)
        if zsl_f == 3:
            safe_write(ws, "B23", round(ytje / 1.03 * 100) / 100)
            safe_write(ws, "G22", "3%")
            safe_write(ws, "E23", ytje - round(ytje / 1.03 * 100) / 100)
        if zsl_f == 1:
            safe_write(ws, "B23", round(ytje / 1.01 * 100) / 100)
            safe_write(ws, "G22", "1%")
            safe_write(ws, "E23", ytje - round(ytje / 1.01 * 100) / 100)

        safe_write(ws, "G45", "(预填单号:" + str(d.get("ytbh") or "") + ")")
        safe_write(ws, "A20", "发票快件查询 资料不清晰请拨打电话:" + str(kpcxdh))

        if uv != "1":
            a9_val = "★" + str(jjdz or "")
            try:
                ws.range("A9").api.Font.Color = 0x0000FF
            except Exception:
                pass
            safe_write(ws, "A9", a9_val)

        safe_write(ws, "C18", d.get("gdry"))
        if d.get("lxdh"):
            safe_write(ws, "G18", d.get("lxdh"))
        else:
            t = run_sql(f"select zjdh from ywrylx where (ryxm='{gdry_esc}')")
            if len(t) > 0:
                safe_write(ws, "G18", t[0].get("zjdh"))

        safe_write(ws, "B24", d.get("hyd"))
        if ywsb == 1:
            safe_write(ws, "C25", d.get("cz"))
            safe_write(ws, "A16", "统一社会信用代码")
            safe_write(ws, "A19", _floattostr_pascal(d.get("zsl")) + "%")
            safe_write(ws, "A11", "合同签订日期:")
            try:
                ywcs_days = int(float(str(ywcs if ywcs not in (None, "") else 0)))
            except (TypeError, ValueError):
                ywcs_days = 0
            if isinstance(chyrq, (datetime, date)):
                safe_write(ws, "B11", (chyrq - timedelta(days=ywcs_days)).strftime("%Y-%m-%d"))
            elif chyrq_str:
                try:
                    dt = datetime.strptime(chyrq_str[:10], "%Y-%m-%d")
                    safe_write(ws, "B11", (dt - timedelta(days=ywcs_days)).strftime("%Y-%m-%d"))
                except ValueError:
                    safe_write(ws, "B11", chyrq_str)
            else:
                safe_write(ws, "B11", "")
        else:
            safe_write(ws, "G21", _floattostr_pascal(d.get("zsl")) + "%")

        if uv == "1" and len(wb.sheets) > 1:
            ws2 = wb.sheets[1]
            safe_write(ws2, "G4", cx1)
            htxs = d.get("htxs") or ""
            safe_write(ws2, "J7", htxs)
            safe_write(ws2, "C7", htxs)
            safe_write(ws2, "C8", d.get("sccj"))
            safe_write(ws2, "C9", f"{zsl_v}%")
            safe_write(ws2, "C10", chyrq_str)
            safe_write(ws2, "J11", jjdz)
            safe_write(ws2, "C11", jjdz)
            if yssb == 1:
                try:
                    ws2.range("C11").api.Font.Color = 0x0000FF
                    ws2.range("J11").api.Font.Color = 0x0000FF
                except Exception:
                    pass

        zb1 = ""
        ps = ctx.get("ps", 0) + 1
        ctx["ps"] = ps
        base_name = _safe_filename(f"{zb1}{cx}{cx1z}({i1})")
        if tp == "4":
            base_name = _safe_filename(f"{cx}{cx1}{d.get('zwpm') or ''}{ps}{wstt1}")

        excel_path = os.path.join(save_dir, get_unique(16) + ".xlsx")
        wb.save(excel_path)
        wb.close()

        pdf_path = None
        if want_pdf:
            pdf_res = convert_excel_to_pdf(excel_path, save_dir)
            if not pdf_res.get("success"):
                raise RuntimeError(pdf_res.get("error") or "PDF转换失败")
            pdf_path = pdf_res["pdf_path"]
        extra_outputs = []
        if uv == "1" and pdf_path and os.path.isfile(pdf_path):
            copy_name = _safe_filename(base_name + "副本") + ".pdf"
            copy_path = os.path.join(save_dir, get_unique(16) + "_copy.pdf")
            shutil.copy2(pdf_path, copy_path)
            extra_outputs.append({"path": copy_path, "name": copy_name})

        out_path = pdf_path if want_pdf and pdf_path else excel_path
        ext = ".pdf" if want_pdf else ".xlsx"
        display_name = base_name + ext

        today = time.strftime("%Y-%m-%d")
        piece = f"{user_name}:{today}"
        ywdyjl_run = ctx.get("ywdyjl_run", "")
        if not (ywdyjl_run or "").strip():
            ywdyjl_run = piece
        else:
            ywdyjl_run = f"{ywdyjl_run}/ {piece}"
        session.query(dsytfy).filter(dsytfy.rid == rid).update(
            {dsytfy.sfdy: "是", dsytfy.ywdyjl: ywdyjl_run}, synchronize_session=False
        )
        ctx["ywdyjl_run"] = ywdyjl_run

        return {
            "excel_path": excel_path,
            "pdf_path": pdf_path,
            "path": out_path,
            "name": display_name,
            "rid": rid,
            "extra": extra_outputs,
        }
    except Exception:
        try:
            wb.close()
        except Exception:
            pass
        raise


@any_route("/api/saier/ecommerce_prepaid_invoice/billed/download", methods=["POST", "GET"])
@require_token
async def view_saier_ecommerce_prepaid_invoice_billed_download(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        kind = j.get("kind", "PDF") or "PDF"
        if kind in ("JPG", "JPG(Excel)", "JPG(Excel2003)"):
            return json_result(-1, "新系统不支持 JPG 格式导出，请选择 PDF 或批量PDF")
        if kind not in ("PDF", "批量PDF"):
            kind = "PDF"
        tp = "4" if kind == "批量PDF" else "1"
        da2 = str(j.get("da2", "1") or "1").strip()
        if da2 != "2":
            da2 = "1"
        rid = j.get("rid", "")
        rids = j.get("rids", [])
        if isinstance(rids, str):
            rids = [rids] if rids else []
        rids = [str(x).strip() for x in (rids or []) if str(x or "").strip()]
        parent_rids = j.get("parent_rids") or j.get("parent_numbers") or []

        user_esc = (user.username or "").replace("'", "''")
        urows = run_sql(f"select username from sys_user where (username='{user_esc}') limit 1")
        if not urows:
            return json_result(-1, "当前用户不存在于 sys_users，无法导出")

        filename17l = "锐亿17.xlsx"
        filename3l = "锐亿3.xlsx"
        f17l_path = os.path.join(config.data_upload_path, "template/" + filename17l)
        f31l_path = os.path.join(config.data_upload_path, "template/" + filename3l)
        if not os.path.exists(f17l_path) or not os.path.exists(f31l_path):
            return json_result(-1, "开票信息导出模板文件不存在，请联系管理员")

        ywcs = 0
        t = run_sql("select cs from zx where (ly='合同签订日期')")
        if len(t) > 0:
            ywcs = t[0].get("cs")

        if da2 == "1":
            one = str(rid or "").strip()
            export_rids = [one] if one else []
        else:
            export_rids = rids
        if da2 == "2" and export_rids:
            seen = set()
            expanded = []
            for parent_rid in export_rids:
                pr = str(parent_rid or "").strip()
                if not pr:
                    continue
                pr_esc = pr.replace("'", "''")
                rows = run_sql(f"select rid from dsytfy where (pid='{pr_esc}') and (rid<>'')")
                for r in rows or []:
                    child_rid = str(r.get("rid") or "").strip()
                    if child_rid and child_rid not in seen:
                        seen.add(child_rid)
                        expanded.append(child_rid)
            export_rids = expanded
        if not export_rids and parent_rids:
            seen = set()
            export_rids = []
            for parent_rid in parent_rids:
                pr = str(parent_rid or "").strip()
                if not pr:
                    continue
                pr_esc = pr.replace("'", "''")
                rows = run_sql(f"select rid from dsytfy where (pid='{pr_esc}') and (rid<>'')")
                for r in rows or []:
                    child_rid = str(r.get("rid") or "").strip()
                    if child_rid and child_rid not in seen:
                        seen.add(child_rid)
                        export_rids.append(child_rid)
        if export_rids:
            rows = s.query(dsytfy).filter(dsytfy.rid.in_(export_rids), dsytfy.kfdy == "可以").all()
            export_rids = [r.rid for r in rows]
        if not export_rids:
            return json_result(-1, "请选择要导出的记录")

        save_dir = config.tmp_path
        os.makedirs(save_dir, exist_ok=True)

        app = _start_excel_app()
        output_files = []
        try:
            i1 = 0
            ctx = {
                "tp": tp,
                "ywcs": ywcs,
                "uv": "",  # 对照 source.pas：局部 uv 未赋值，恒为非 '1'
                "ywdyjl_run": "",
                "user_name": user.username,
                "save_dir": save_dir,
                "i1": 0,
                "ps": 0,
            }
            for one_rid in export_rids:
                d_row = s.query(dsytfy).filter(dsytfy.rid == one_rid, dsytfy.kfdy == "可以").first()
                if not d_row:
                    continue
                i1 += 1
                ctx["i1"] = i1
                result = _export_one_record(s, app, f17l_path, d_row, ctx)
                if result and os.path.isfile(result["path"]):
                    output_files.append(result)
                    for extra in result.get("extra") or []:
                        if os.path.isfile(extra["path"]):
                            output_files.append(extra)

            if not output_files:
                return json_result(-1, "没有可导出的记录（需开票同意且增值税率>=0）")

            s.commit()

            if len(output_files) == 1:
                f = output_files[0]
                rel = os.path.basename(f["path"])
                if f["path"].startswith(save_dir):
                    rel = os.path.relpath(f["path"], save_dir)
                return json_result(1, "操作成功", {"path": rel, "name": f["name"]})

            zip_name = time.strftime("%Y%m%d%H%M%S") + "_ecommerce_prepaid_invoice.zip"
            zip_path = os.path.join(save_dir, zip_name)
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                for f in output_files:
                    zf.write(f["path"], f["name"])
            return json_result(1, "操作成功", {"path": zip_name, "name": zip_name})
        finally:
            try:
                app.quit()
            except Exception:
                pass
    except Exception:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
