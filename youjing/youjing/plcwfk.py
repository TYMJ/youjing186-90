# -*- coding: utf-8 -*-
"""
付款审批 - 财务批量审批（对照原 Delphi 财务批量审批脚本）。

参数约定（与采购跟单导出类似）：
  da2: '1' 当前记录；'2' 批量（需 rid_list）
  cwcp1 / cwsp: '1'|'2' 或 '通过'|'不通过'，默认通过
  rid: 当前主表 rid
  rid_list: 批量 rid 列表（逗号分隔或 JSON 数组）
"""

from any import *
from .model import *
from .__default__ import module_xxck_new, user_task_delete, user_task_new
import json
import time

_MODULE = "付款审批"
_SYS_PATH = "我的公司\\宁波优景进出口有限公司\\"


def _esc_sql(v):
    return str(v or "").replace("'", "''")


def _today():
    return time.strftime("%Y-%m-%d")


def _now_dt():
    return time.strftime("%Y-%m-%d %H:%M:%S")


def _parse_rid_list(raw):
    if not raw:
        return []
    if isinstance(raw, list):
        return [str(x).strip() for x in raw if str(x).strip()]
    s = str(raw).strip()
    if not s:
        return []
    if s.startswith("["):
        try:
            arr = json.loads(s)
            if isinstance(arr, list):
                return [str(x).strip() for x in arr if str(x).strip()]
        except Exception:
            pass
    return [p.strip() for p in s.split(",") if p.strip()]


def _normalize_cwcp1(raw):
    v = str(raw or "").strip()
    if v in ("2", "不通过"):
        return "不通过"
    return "通过"


def _normalize_da2(raw, rid_list):
    da2 = str(raw or "").strip()
    if da2 != "2":
        da2 = "1"
    if da2 == "2" and not rid_list:
        return "1"
    return da2


def _is_finance_user(username):
    rows = run_sql(
        f"select rid from sys_user where (username='{_esc_sql(username)}') "
        f"and (position like '%财务%') limit 1"
    )
    return bool(rows)


def _multi_report_collect(rid_key, tjcw):
    """对照 Pascal MultiReport：收集待财务审批且总经理已通过的主表 rid。"""
    out = []
    rows = run_sql(
        f"select rid from fksp where (rid='{_esc_sql(rid_key)}') and (tjcw='{_esc_sql(tjcw)}') "
        f"and (cwsp='待审批') and (zjlhz='通过')"
    )
    for r in rows or []:
        v = str(r.get("rid") or "").strip()
        if v and v not in out:
            out.append(v)
    return out


def _collect_rid_list(da2, rid, rid_list, username):
    """da2='1' 当前 rid；da2='2' 批量 rid_list + MultiReport。"""
    da2 = _normalize_da2(da2, rid_list)
    bgpmstr = []
    if da2 == "1":
        if not rid:
            return [], "参数缺失：当前模式需要 rid"
        bgpmstr = _multi_report_collect(rid, username)
        if not bgpmstr:
            return [], "当前记录不符合财务批量审批条件（需提交财务为本人、财务待审批、总经理已通过）"
    else:
        if not rid_list:
            return [], "批量模式需要 rid_list"
        for item_rid in rid_list:
            for v in _multi_report_collect(item_rid, username):
                if v not in bgpmstr:
                    bgpmstr.append(v)
        if not bgpmstr:
            return [], "批量审批未匹配到可处理记录"
    return bgpmstr, ""


def _resolve_cwzj(fklx, seje, username):
    """付款审批付款限额 → 上级财务 cwzj。"""
    cwzj = ""
    jesx1 = 0.0
    rows = run_sql(f"select * from zx where ly='付款审批付款限额'")
    if not rows:
        return cwzj
    zx = rows[0]
    seje_f = float(seje or 0)
    if fklx == "预付款" and zx.get("wb1") == "预付款":
        jesx1 = float(zx.get("sz1") or 0)
        if seje_f >= jesx1:
            cwzj = str(zx.get("wb2") or "")
    elif fklx == "提前付款" and zx.get("wb3") == "提前付款":
        jesx1 = float(zx.get("sz2") or 0)
        if seje_f >= jesx1:
            cwzj = str(zx.get("wb4") or "")
    elif fklx == "正常付款" and zx.get("wb5") == "正常付款":
        jesx1 = float(zx.get("sz3") or 0)
        if seje_f >= jesx1:
            cwzj = str(zx.get("wb6") or "")
    return cwzj.strip()


def _resolve_cw1(sfkp):
    """付款审批付款财务 → 打印财务 dycw。"""
    cw1 = ""
    rows = run_sql(f"select * from zx where ly='付款审批付款财务'")
    if not rows:
        return cw1
    zx = rows[0]
    if sfkp == "是" and zx.get("wb1") == "开票":
        cw1 = str(zx.get("wb2") or "")
    elif sfkp != "是" and zx.get("wb3") == "现金":
        cw1 = str(zx.get("wb4") or "")
    return cw1.strip()


def _date_str(v):
    if v is None:
        return ""
    s = str(v).strip()
    return s[:10] if len(s) >= 10 else s


def _process_one_fksp(s, user, pid, cwcp1):
    """单条付款审批主表财务批量处理（对照 Pascal 内层 for l 循环）。"""
    rows = run_sql(f"select * from fksp where rid='{_esc_sql(pid)}'")
    if not rows:
        return
    hdr = rows[0]
    username = user.username
    jbry1 = str(hdr.get("jbry") or "")
    bjdh = str(hdr.get("fkbh") or "")
    fklx = str(hdr.get("fklx") or "")
    seje = float(hdr.get("seje") or 0)
    sfkp = str(hdr.get("sfkp") or "")
    sprq1_hdr = _date_str(hdr.get("sprq1"))

    cwzj = _resolve_cwzj(fklx, seje, username)
    cw1 = _resolve_cw1(sfkp)

    res = user_task_delete(_MODULE, pid, s, [])
    if res.get("code", 1) != 1:
        raise RuntimeError(res.get("msg", "清除待办失败"))

    if cwcp1 == "不通过":
        run_sql(f"update fkspsheet set cwsp='待审批' where pid='{_esc_sql(pid)}'")
        run_sql(f"update fkspsheet3 set cwsp='待审批' where pid='{_esc_sql(pid)}'")

        xxnr = username + "付款审批:" + bjdh + "财务不能通过没通过,原因:"
        res = user_task_new(_MODULE, pid, "付款编号", xxnr, user, s, [jbry1])
        if res.get("code") != 1:
            raise RuntimeError(res.get("msg", "创建待办失败"))

        today = _today()
        run_sql(
            f"update fksp set cwspsb='待审批',webpd='是',cwsp='待审批',jlhz='待审批',"
            f"zjlhz='待审批',zjhz='待审批',tjjl='',sftj='否',fkrq=null,pzje=0,tf=0,"
            f"sprq1='{today}' where rid='{_esc_sql(pid)}' and fklx<>'预付款'"
        )
        run_sql(
            f"update fksp set cwspsb='待审批',webpd='是',cwsp='待审批',jlhz='待审批',"
            f"zjlhz='待审批',zjhz='待审批',tjjl='',sftj='否',fkrq=null,pzje=0,tf=0 "
            f"where rid='{_esc_sql(pid)}' and fklx='预付款'"
        )
        run_sql(
            f"update fksp set sprq1='{today}' where rid='{_esc_sql(pid)}' "
            f"and fklx='预付款' and (sprq1 is null or sprq1='')"
        )
    elif cwcp1 == "通过":
        if cwzj and cwzj != username:
            run_sql(
                f"update fksp set cwsp='待审批',tjcw='{_esc_sql(cwzj)}' "
                f"where rid='{_esc_sql(pid)}'"
            )
            xx = "的付款审批:" + bjdh + "需审批,日期:" + _today()
            xxnr = username + xx
            res = user_task_new(_MODULE, pid, "付款编号", xxnr, user, s, [cwzj])
            if res.get("code") != 1:
                raise RuntimeError(res.get("msg", "创建待办失败"))
        else:
            run_sql(
                f"update fksp set webpd='是',cwsp='通过',cwspsb='通过' "
                f"where rid='{_esc_sql(pid)}'"
            )
            run_sql(
                f"update fkspsheet set cwsp='通过',pzrq='{_esc_sql(sprq1_hdr)}' "
                f"where pid='{_esc_sql(pid)}'"
            )
            run_sql(f"update fkspsheet3 set cwsp='通过' where pid='{_esc_sql(pid)}'")
            run_sql(
                f"update fkspsheet3 set pzrq='{_esc_sql(sprq1_hdr)}' "
                f"where pid='{_esc_sql(pid)}' and (pzrq is null or pzrq='')"
            )

            fkrq = _today() if not _date_str(hdr.get("fkrq")) else _date_str(hdr.get("fkrq"))
            pzje1 = seje
            sprq1 = _today()

            run_sql(
                f"update fksp set fkrq='{fkrq}',pzje={pzje1},sprq1='{sprq1}' "
                f"where rid='{_esc_sql(pid)}' and fklx<>'预付款'"
            )
            run_sql(
                f"update fksp set fkrq='{fkrq}',pzje={pzje1} "
                f"where rid='{_esc_sql(pid)}' and fklx='预付款'"
            )
            run_sql(
                f"update fksp set sprq1='{sprq1}' where rid='{_esc_sql(pid)}' "
                f"and fklx='预付款' and (sprq1 is null or sprq1='')"
            )

            if cw1:
                run_sql(f"update fksp set dycw='{_esc_sql(cw1)}' where rid='{_esc_sql(pid)}'")
                xxnr_alarm = username + "付款审批:" + bjdh + "通过请安排打印付款"
                res = user_task_new(_MODULE, pid, "付款编号", xxnr_alarm, user, s, [cw1])
                if res.get("code") != 1:
                    raise RuntimeError(res.get("msg", "创建待办失败"))

                for i1, (xxnr1, fsr1) in enumerate(
                    [
                        (username + "付款审批:" + bjdh + "通过请安排打印", cw1),
                        (username + "付款审批审批:" + bjdh + "通过", jbry1),
                    ],
                    start=1,
                ):
                    row = {
                        "xxly": _MODULE,
                        "bjdh": "",
                        "wxht": "",
                        "cght": "",
                        "gdht": "",
                        "yhdh": "",
                        "xxnr": xxnr1,
                        "jsr": fsr1,
                        "sys_path": _SYS_PATH,
                    }
                    res = module_xxck_new([row], user, s)
                    if res.get("code") != 1:
                        raise RuntimeError(res.get("msg", "消息推送失败"))

    if cwcp1 == "不通过" or not cwzj or cwzj == username:
        if fklx == "预付款":
            sheet_rows = run_sql(f"select rid from fkspsheet3 where pid='{_esc_sql(pid)}'") or []
            for sh in sheet_rows:
                sh_rid = str(sh.get("rid") or "")
                if cwcp1 == "通过":
                    run_sql(
                        f"update fkspsheet3 set fkbh='{_esc_sql(bjdh)}',cwsp='通过',pzje=seje,"
                        f"hklx='{_esc_sql(hdr.get('hklx') or '')}',"
                        f"fkxs='{_esc_sql(hdr.get('fkxs') or '')}',"
                        f"csmc='{_esc_sql(hdr.get('csmc') or '')}' "
                        f"where pid='{_esc_sql(pid)}' and rid='{_esc_sql(sh_rid)}'"
                    )
                    run_sql(
                        f"update fkspsheet3 set pzrq='{_esc_sql(sprq1_hdr)}' "
                        f"where pid='{_esc_sql(pid)}' and rid='{_esc_sql(sh_rid)}' "
                        f"and (pzrq is null or pzrq='')"
                    )
                else:
                    run_sql(
                        f"update fkspsheet3 set cwsp='待审批',pzje=0 "
                        f"where pid='{_esc_sql(pid)}' and rid='{_esc_sql(sh_rid)}'"
                    )

        if fklx == "提前付款":
            sheet_rows = run_sql(f"select rid from fkspsheet where pid='{_esc_sql(pid)}'") or []
            sqrq1 = _date_str(hdr.get("sqrq1"))
            for sh in sheet_rows:
                sh_rid = str(sh.get("rid") or "")
                if cwcp1 == "通过":
                    if sprq1_hdr and sqrq1 and sqrq1 > sprq1_hdr:
                        pzrq = sqrq1
                    else:
                        pzrq = sprq1_hdr
                    run_sql(
                        f"update fkspsheet set cwsp='通过',pzrq='{_esc_sql(pzrq)}',pzje=seje "
                        f"where pid='{_esc_sql(pid)}' and rid='{_esc_sql(sh_rid)}'"
                    )
                else:
                    run_sql(
                        f"update fkspsheet set cwsp='待审批',pzrq='',fkwy='',pzje=0 "
                        f"where pid='{_esc_sql(pid)}' and rid='{_esc_sql(sh_rid)}'"
                    )


async def payment_approval_cwplsp_process(user, da2, rid, rid_list, cwcp1):
    """财务批量审批核心逻辑。"""
    if not _is_finance_user(user.username):
        return -1, "只有财务岗位用户才能执行此操作", {}

    cwcp1 = _normalize_cwcp1(cwcp1)
    rid_list = _parse_rid_list(rid_list)
    da2 = _normalize_da2(da2, rid_list)

    bgpmstr, err = _collect_rid_list(da2, rid, rid_list, user.username)
    if err:
        return -1, err, {}

    s = Session()
    try:
        ok = 0
        for pid in bgpmstr:
            _process_one_fksp(s, user, pid, cwcp1)
            ok += 1
        s.commit()
        return 1, f"已处理 {ok} 条付款审批", {"count": ok, "rids": bgpmstr}
    except Exception:
        s.rollback()
        logger.error(trace_error())
        return -1, trace_error(), {}
    finally:
        s.close()


@any_route("/api/saier/payment_approval/button/cwplsp", methods=["POST", "GET"])
@require_token
async def api_payment_approval_cwplsp(request):
    """
    付款审批 - 财务批量审批（对照 Delphi 财务批量审批 / payment_approval_cwplsp_btn）。

    JSON/表单参数：
      da2: 1 当前 / 2 批量
      rid: 当前主表 rid
      rid_list / rids: 批量 rid
      cwcp1 / cwsp: 1|2 或 通过|不通过
    """
    user = request.current_user
    try:
        # if request.content_type and "json" in request.content_type.lower():
        #     j = await request.json()
        # else:
        #     j = await request.form()
        #     j = {k: form_value(j, k, "") for k in j.keys()} if j else {}
        j = await request.json()
        da2 = j.get("da2", "")
        rid = j.get("rid")  or ""
        rid_list = j.get("rids") or ""
        cwcp1 =  "1"

        if not str(da2 or "").strip():
            if rid_list:
                da2 = "2"
            else:
                da2 = "1"

        code, msg, data = await payment_approval_cwplsp_process(
            user, da2, rid, rid_list, cwcp1
        )
        return json_result(code, msg, data)
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
