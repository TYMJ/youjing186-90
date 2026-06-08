from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

def _get_dbbqd_rows(selected_rids, fktt):
    rows_ok = []
    rows_non_wait = []
    for rid in selected_rids:
        q = (
            "select * from dbbqd "
            f"where rid='{str(rid)}' and (ifnull(bbfp,'')='') and ck='是' "
            f"and (ifnull(fktt,'')='' or fktt like '%{str(fktt)}%') "
            "limit 1"
        )
        d = run_sql(q)
        if len(d) == 0:
            continue
        row = d[0]
        cywyzd = row.get('cywyzd', '')
        d2 = run_sql(
            "select rid from cymxsheet "
            f"where cywyzd='{str(cywyzd)}' and sfdb='是' limit 1"
        )
        if len(d2) > 0:
            rows_ok.append(row)
        else:
            rows_non_wait.append(row)
    return rows_ok, rows_non_wait

@any_route('/api/saier/shipment/bgmxd/make/prepare', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_bgmxd_make_prepare(request):
    j = await request.json()
    user = request.current_user
    try:
        fphm = str(j.get('fphm', ''))
        selected_rids = j.get('selected_rids', [])

        d_user = run_sql(
            "select rid from sys_user "
            f"where username='{str(user.username)}' and position like '%单证%' limit 1"
        )
        if len(d_user) == 0:
            return json_result(-1, '当前用户不是单证岗位，不能执行')

        d_head = run_sql(
            "select rid,bggs from bgmxd "
            f"where fphm='{str(fphm)}' "
            "limit 1"
        )
        if len(d_head) == 0:
            return json_result(-1, '发票号不存在。不能生成')

        fktt = d_head[0].get('bggs', '') or ''
        rows_ok, rows_non_wait = _get_dbbqd_rows(selected_rids, fktt)

        gczj = 0
        for r in rows_ok:
            gczj += float(r.get('gczj', 0) or 0)

        return json_result(1, 'ok', {
            'gczj': gczj,
            'ok_count': len(rows_ok),
            'non_wait_count': len(rows_non_wait)
        })
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())

@any_route('/api/saier/shipment/bgmxd/make/confirm', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_bgmxd_make_confirm(request):
    s = Session()
    j = await request.json()
    user = request.current_user
    try:
        fphm = str(j.get('fphm', ''))
        selected_rids = j.get('selected_rids', [])

        d_head = run_sql(
            "select rid,bggs from bgmxd "
            f"where fphm='{str(fphm)}' "
            "limit 1"
        )
        if len(d_head) == 0:
            return json_result(-1, '发票号不存在。不能生成')
        srid = str(d_head[0].get('rid'))
        fktt = d_head[0].get('bggs', '') or ''
        now_dt = time.strftime("%Y-%m-%d %H:%M:%S")

        rows_ok, rows_non_wait = _get_dbbqd_rows(selected_rids, fktt)
        warnings = []

        for row in rows_ok:
            rid = str(row.get('rid', ''))
            m = bgmxdsheet()
            m.rid = get_uuid()
            m.uid = user.rid
            m.ctime = now_dt
            m.mtime = now_dt
            m.pid = srid

            for k, v in row.items():
                if k in ['rid', 'uid', 'ctime', 'mtime', 'pid', 'sid']:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)

            m.yfph = row.get('fphm', '')
            m.fphm = fphm

            chsl = float(row.get('chsl', 0) or 0)
            wxjg = float(row.get('wxjg', 0) or 0)
            fo = float(row.get('FOBrmb', 0) or 0)
            wxmz = float(row.get('wxmz', 0) or 0)
            wxjz = float(row.get('wxjz', 0) or 0)
            wxtj = float(row.get('wxtj', 0) or 0)
            yjdj = float(row.get('yjdj', 0) or 0)
            mjdj1 = float(row.get('mjdj1', 0) or 0)

            m.wxzj = wxjg * chsl
            m.FOBzrmb = fo * chsl
            m.zmz = wxmz * float(row.get('chxs', 0) or 0)
            m.zjz = wxjz * float(row.get('chxs', 0) or 0)
            m.ztj = wxtj * float(row.get('chxs', 0) or 0)
            m.yjzj = yjdj * chsl
            m.mjzj = mjdj1 * chsl
            m.yysfp = row.get('ysfp', '')
            m.zwpmts = f"{row.get('zhwbgpm','')}{row.get('tsl','')}{row.get('hyd','')}{row.get('hgbm','')}"

            s.add(m)

            check = s.query(bgmxdsheet).filter(
                bgmxdsheet.pid == srid,
                bgmxdsheet.fphm == fphm,
                bgmxdsheet.yfph == row.get('fphm', ''),
                bgmxdsheet.cywyzd == row.get('cywyzd', '')
            ).first()

            if check:
                s.query(dbbqd).filter(dbbqd.rid == rid).delete()
            else:
                warnings.append(f"请注意发票号码:{row.get('fphm','')} 中文品名:{row.get('zhwbgpm','')} 没能成功补报")
                s.query(dbbqd).filter(dbbqd.rid == rid).update({'ck': '是', 'wxfp': ''})

        # 非待报
        for row in rows_non_wait:
            s.query(dbbqd).filter(dbbqd.rid == str(row.get('rid', ''))).update({'sjfl': '非待报'})

        # 回写主单
        d_sum = run_sql(f"select ifnull(sum(chsl),0) chslz from bgmxdsheet where pid='{str(srid)}'")
        chslz = float(d_sum[0].get('chslz', 0) or 0) if len(d_sum) > 0 else 0

        s.query(bgmxd).filter(
            bgmxd.fphm == fphm,
            bgmxd.ry == user.username
        ).update({'chzsl': chslz})

        s.commit()
        return json_result(1, '处理成功', {'warnings': warnings})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()