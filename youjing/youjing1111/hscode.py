from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/hscode/load/check_user', methods=['POST', 'GET'])
@require_token
async def view_saier_hscode_load_check_user(request):
    s = Session()
    user = request.current_user
    try:
        username = str(user.username)
        rows = run_sql(
            f"select username from sys_user where username='{username}' and position like '%海关%' limit 1"
        )
        is_hg_user = 1 if len(rows) > 0 else 0
        return json_result(1, '查询成功', {'is_hg_user': is_hg_user})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/hscode/hgbm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_hscode_hgbm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hgbm1 = str(j.get('海关编码', ''))

        fields = {}

        if hgbm1 != '':
            d1 = run_sql(
                f"select rid from cyzglsheet "
                f"where '{hgbm1}' like concat(xm, '%') and zm='禁止出运海关编码' limit 1"
            )
            fields['禁止出运识别'] = '禁止出运' if len(d1) > 0 else '否'

            d2 = run_sql(
                f"select rid from cyzglsheet "
                f"where xm='{hgbm1}' and zm='禁止报关海关编码' limit 1"
            )
            fields['禁止报关识别'] = '禁止报关' if len(d2) > 0 else '否'
        else:
            fields['禁止出运识别'] = '否'
            fields['禁止报关识别'] = '否'

        return json_result(1, '处理成功', {'fields': fields})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/hscode/detail/check_duplicate', methods=['POST', 'GET'])
@require_token
async def view_saier_hscode_detail_check_duplicate(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hwmc = str(j.get('中文品名', ''))
        cznr = str(j.get('申报要素', ''))
        hgbm = str(j.get('海关编码', ''))
        sb = str(j.get('识别', ''))

        duplicate = 0
        if sb == '' and hwmc != '' and cznr != '' and hgbm != '':
            d = run_sql(
                f"select rid from hgbmbsheet "
                f"where hgbm='{hgbm}' and hwmc='{hwmc}' and cznr='{cznr}' limit 1"
            )
            if len(d) > 0:
                duplicate = 1

        return json_result(1, '处理成功', {'duplicate': duplicate})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/hscode/load/check_user', methods=['POST', 'GET'])
@require_token
async def view_saier_hscode_load_check_user(request):
    s = Session()
    user = request.current_user
    try:
        username = str(user.username)
        rows = run_sql(
            f"select username from sys_user where username='{username}' and position like '%海关%' limit 1"
        )
        return json_result(1, '查询成功', {'is_hg_user': 1 if len(rows) > 0 else 0})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/hscode/before_save', methods=['POST', 'GET'])
@require_token
async def view_saier_hscode_before_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        main = j.get('main', {})
        details = j.get('details', [])

        hgbm1 = str(main.get('hgbm', ''))
        jzbgsb = str(main.get('jzbgsb', ''))
        now_dt = time.strftime("%Y-%m-%d %H:%M:%S")
        now_day = time.strftime("%Y-%m-%d")

        # 禁止报关海关编码 -> cyzglsheet
        if hgbm1 != '' and jzbgsb == '禁止报关':
            row = s.query(cyzglsheet).filter(
                cyzglsheet.xm == hgbm1,
                cyzglsheet.zm == '禁止报关海关编码'
            ).first()
            if not row:
                parent_row = s.query(cyzgl).filter(cyzgl.zm == '禁止报关海关编码').first()
                if parent_row:
                    m = cyzglsheet()
                    m.rid = get_uuid()
                    m.uid = user.rid
                    m.ctime = now_dt
                    m.mtime = now_dt
                    m.pid = str(parent_row.rid)
                    m.zm = '禁止报关海关编码'
                    m.xm = hgbm1
                    m.qxzl = '禁止报关海关编码'
                    s.add(m)

        for r in details:
            sfpz = str(r.get('sfpz', ''))
            if sfpz == '重复':
                s.rollback()
                return json_result(-1, f"中文品名:{str(r.get('中文品名', ''))}已有请检查!不能提交保存")

            # 否：发消息/任务（不处理 ddsp）
            if sfpz == '否':
                xzry = str(r.get('xzry', ''))
                mgr = ''
                mgr_row = s.query(sys_user).filter(sys_user.username == xzry).first()
                if mgr_row and getattr(mgr_row, 'mgr', ''):
                    mgr = str(mgr_row.mgr)

                if mgr != '' and mgr != user.username:
                    xxnr = f"{user.username}的海关编码:{hgbm1}申请请查看:{now_day}"
                    xx_row = {
                        'sys_owner': mgr,
                        'sys_path': '我的公司\\宁波优景进出口有限公司\\',
                        'fsrq': now_day,
                        'fsr': user.username,
                        'xxly': '海关编码',
                        'bjdh': '',
                        'wxht': hgbm1,
                        'cght': '',
                        'gdht': '',
                        'yhdh': '',
                        'xxnr': xxnr,
                        'jsr': mgr
                    }
                    res = module_xxck_new([xx_row], user, s)
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))

            # 是：同步税率 + hgbm维护
            if sfpz == '是':
                hgbm_val = str(r.get('hgbm', ''))
                hwmc = str(r.get('hwmc', ''))
                ywpm = str(r.get('ywpm', ''))
                cznr = str(r.get('cznr', ''))
                dw = str(r.get('dw', ''))
                sfsj = str(r.get('sfsj', ''))
                sjbz = str(r.get('sjbz', ''))
                tsl = float(r.get('tsl', 0) or 0)
                zzsl = float(r.get('zzsl', 0) or 0)

                s.query(cjcp).filter(cjcp.hgbm == hgbm_val).update({'tsl': tsl, 'zzsl': zzsl})
                s.query(zscp).filter(zscp.hgbm == hgbm_val).update({'tsl': tsl, 'zzsl': zzsl})

                one = s.query(hgbm).filter(
                    hgbm.hgbm == hgbm_val,
                    hgbm.hwmc == hwmc,
                    hgbm.cznr == cznr
                ).first()

                if one:
                    s.query(hgbm).filter(hgbm.rid == str(one.rid)).update({
                        'hgbm': hgbm1,
                        'tsl': tsl,
                        'zzsl': zzsl,
                        'ywpm': ywpm,
                        'dw': dw,
                        'sfsj': sfsj,
                        'sjbz': sjbz,
                        'cznr': cznr
                    })
                else:
                    ms = hgbm()
                    ms.rid = get_uuid()
                    ms.uid = user.rid
                    ms.ctime = now_dt
                    ms.mtime = now_dt
                    ms.hgbm = hgbm1
                    ms.hwmc = hwmc
                    ms.tsl = tsl
                    ms.zzsl = zzsl
                    ms.ywpm = ywpm
                    ms.dw = dw
                    ms.sfsj = sfsj
                    ms.sjbz = sjbz
                    ms.cznr = cznr
                    s.add(ms)

        s.commit()
        return json_result(1, '处理成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()