from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/shipment_amendment/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_amendment_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fphm = j.get('fphm', '')
        hz_old = float(j.get('hz_old', 0) or 0)
        hz_new = float(j.get('hz_new', 0) or 0)

        data = {'sbc': 0, 'sbf': 0, 'wx': 0}

        # 1) 发票是否命中(kaiptz/gchk/xjhc)
        if fphm != '':
            d1 = run_sql(f"select rid from kaiptz where fphm like '%{str(fphm)}%' limit 1")
            d2 = run_sql(f"select rid from gchk where wxfp like '%{str(fphm)}%' limit 1")
            d3 = run_sql(f"select rid from xjhc where fphm like '%{str(fphm)}%' limit 1")
            if len(d1) > 0 or len(d2) > 0 or len(d3) > 0:
                data['sbc'] = 1

        # 2) 货值是否变化
        if hz_old != hz_new:
            data['sbf'] = 1

        # 3) 岗位可见权限
        
        org = get_user_path(user.username)
        path = org.get('path','')
        postion = org.get('position', '')
        if '总经理' in postion or '外销' in postion or '财务' in postion or '单证' in postion:
            data['wx'] = 1

        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/save/before', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_save_before(request):
    try:
        j = await request.json()
        user = request.current_user
        username = user.username

        sqbh = j.get('sqbh', '')
        jbry = j.get('jbry', '')
        tjzg = j.get('tjzg', '')

        patch = {}

        # Pascal: 申请编号为空则生成 yy-mm-00001
        if sqbh == '':
            prefix = datetime.now().strftime('%y-%m-')
            rows = run_sql(
                "select fkbh from cygd where fkbh like :lk order by fkbh desc limit 1",
                {'lk': f'%{prefix}%'}
            ) or []

            seq = 1
            if len(rows) > 0:
                last_fkbh = rows[0].get('fkbh', '')
                try:
                    seq = int(last_fkbh[6:11]) + 1
                except:
                    seq = 1

            sqbh = f'{prefix}{seq:05d}'
            patch['sqbh'] = sqbh

        unlock_submit_fields = 1 if (tjzg == '' and jbry == username and sqbh != '') else 0

        return json_result(1, 'ok', {
            'patch': patch,
            'unlock_submit_fields': unlock_submit_fields
        })
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())

@any_route('/api/saier/shipment_amendment/field/tjdz/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_tjdz_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        tjdz = str(j.get('tjdz', '') or '').strip()
        fkbh = str(j.get('fkbh', '') or '').strip()
        jbry = str(j.get('jbry', '') or '').strip()
        fksp = str(j.get('fksp', '') or '').strip()
        zjlsp = str(j.get('zjlsp', '') or '').strip()
        rid = str(j.get('rid', '') or '').strip()

        hz_old = float(j.get('hz_old', 0) or 0)
        hz_new = float(j.get('hz_new', 0) or 0)

        # Pascal: sb1 判定
        sb1 = ''
        if (hz_old != hz_new) and (fksp == '通过'):
            sb1 = '1'
        else:
            if zjlsp == '通过':
                sb1 = '1'

        # Pascal: 仅在 提交单证不空 且 sb1=1 时继续
        if tjdz == '' or sb1 != '1':
            return json_result(1, 'ok', {'clear_tjdz': 0})

        # Pascal: 查 ywrybiao 是否单证岗位
        sb = ''
        d_role = run_sql(
            'select rid from ywrybiao where yhm=:yhm and zw like :zw limit 1',
            {'yhm': tjdz, 'zw': '%单证%'}
        ) or []
        if len(d_role) > 0:
            sb = '1'

        # Pascal: 查 cygd.number（按迁移规范映射为 rid）
        st_rid = ''
        if fkbh != '':
            d_cygd = run_sql(
                'select rid from cygd where fkbh=:fkbh limit 1',
                {'fkbh': fkbh}
            ) or []
            if len(d_cygd) > 0:
                st_rid = str(d_cygd[0].get('rid', '') or '')

        # Pascal: 单证人需同时满足“角色命中”且“已保存(有主记录)”
        if sb == '1':
            if st_rid != '':
                sb = '1'
            else:
                sb = ''

        if sb != '1':
            return json_result(0, '此人非单证人员或没保存，请重新选择!', {'clear_tjdz': 1})

        # Pascal: xx = '的出运改单:fkbh需审批,日期:yyyy-mm-dd'
        xx = '的出运改单:' + fkbh + '需审批,日期:' + time.strftime('%Y-%m-%d')
        spsq = tjdz

        # Pascal: instantmessage -> 项目规范用 module_xxck_new
        if (user.username != spsq) and (spsq != ''):
            row = {
                'xxly': '出运改单',
                'xxnr': jbry + xx,
                'jsr': spsq,
                'spsq': spsq
            }
            res = module_xxck_new([row], user, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(-1, res.get('msg', '发送消息失败'))

        # Pascal: delete/insert sys_alarm -> 项目规范用 user_task_delete/user_task_new
        if st_rid != '':
            res = user_task_delete('出运改单', st_rid, s, [])
            if res.get('code') != 1:
                s.rollback()
                return json_result(-1, res.get('msg', '删除待办失败'))

            subject = jbry + xx
            res = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需审批',
                subject,
                user,
                s,
                [spsq],
                True
            )
            if res.get('code') != 1:
                s.rollback()
                return json_result(-1, res.get('msg', '创建待办失败'))

        s.commit()
        return json_result(1, 'ok', {'clear_tjdz': 0})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/dzsp/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_dzsp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = str(j.get('fkbh', '') or '').strip()
        dzsp = str(j.get('dzsp', '') or '').strip()  # 单证审批
        dzyj = str(j.get('dzyj', '') or '').strip()  # 单证意见
        jbry = str(j.get('jbry', '') or '').strip()  # 经办人员
        tjcw = str(j.get('tjcw', '') or '').strip()  # 提交财务
        fphm = str(j.get('fphm', '') or '').strip()  # 发票号码

        if dzsp == '' or dzsp == '待审批':
            return json_result(1, 'ok', {'patch': {}})

        # Pascal: select number from cygd where fkbh=:fkbh
        # 迁移规范: number -> rid
        st_rid = ''
        d = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d) > 0:
            st_rid = str(d[0].get('rid', '') or '')

        # Pascal 先删 sys_alarm；迁移为 user_task_delete
        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

        today = time.strftime('%Y-%m-%d')
        patch = {'单证日期': today}

        # =========================
        # 分支1：单证审批 = 不通过
        # =========================
        if dzsp == '不通过':
            # instantmessage -> module_xxck_new
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '单证不能通过,原因:' + dzyj,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            # Pascal 回写字段
            patch['主管审批'] = '待审批'
            patch['总经理审批'] = '待审批'
            patch['风控审批'] = '待审批'
            patch['提交主管'] = ''
            patch['单证审批'] = '待审批'
            patch['改单状况'] = '驳回'

            # sys_alarm insert -> user_task_new（驳回给经办人员）
            if st_rid != '' and jbry != '':
                subject = user.username + '出运改单:' + fkbh + '单证不能通过没通过,原因:' + dzyj
                r_new = user_task_new(
                    '出运改单',
                    st_rid,
                    '申请编号',
                    '出运改单[申请编号]驳回',
                    subject,
                    user,
                    s,
                    [jbry],
                    True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_dz_group': 1,
                'enable_tjcw': 0
            })

        # =======================
        # 分支2：单证审批 = 通过
        # =======================
        if dzsp == '通过':
            # 通知经办人员
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '单证通过请查看,日期:' + today,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg1 = module_xxck_new([row], user, s)
                if r_msg1.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg1.get('msg', '发送消息失败'))

            # Pascal: kaiptz/gchk/xjhc 命中任一则需要财务审批
            sbc = 0
            if fphm != '':
                d1 = run_sql(
                    'select rid from kaiptz where fphm like :fphm limit 1',
                    {'fphm': '%' + fphm + '%'}
                ) or []
                d2 = run_sql(
                    'select rid from gchk where wxfp like :fphm limit 1',
                    {'fphm': '%' + fphm + '%'}
                ) or []
                d3 = run_sql(
                    'select rid from xjhc where fphm like :fphm limit 1',
                    {'fphm': '%' + fphm + '%'}
                ) or []
                if len(d1) > 0 or len(d2) > 0 or len(d3) > 0:
                    sbc = 1

            # 需要财务审批
            if sbc == 1:
                spsq = tjcw
                xx = '的出运改单:' + fkbh + '需审批,日期:' + today

                if user.username != spsq and spsq != '':
                    row = {
                        'xxly': '出运改单',
                        'xxnr': jbry + xx,
                        'jsr': spsq,
                        'spsq': spsq
                    }
                    r_msg2 = module_xxck_new([row], user, s)
                    if r_msg2.get('code') != 1:
                        s.rollback()
                        return json_result(-1, r_msg2.get('msg', '发送消息失败'))

                if st_rid != '' and spsq != '':
                    subject = jbry + xx
                    r_new = user_task_new(
                        '出运改单',
                        st_rid,
                        '申请编号',
                        '出运改单[申请编号]需审批',
                        subject,
                        user,
                        s,
                        [spsq],
                        True
                    )
                    if r_new.get('code') != 1:
                        s.rollback()
                        return json_result(-1, r_new.get('msg', '创建待办失败'))

                s.commit()
                return json_result(1, 'ok', {
                    'patch': patch,
                    'lock_dz_group': 1,
                    'enable_tjcw': 1
                })

            # 不需要财务审批：cygd.cwsp=通过，改单状况=完成
            s.query(cygd).filter(cygd.fkbh == fkbh).update({
                'cwsp': '通过'
            })
            patch['改单状况'] = '完成'

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_dz_group': 1,
                'enable_tjcw': 0
            })

        s.rollback()
        return json_result(0, '单证审批值无效')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/cwsp/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_cwsp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = str(j.get('fkbh', '') or '').strip()
        cwsp = str(j.get('cwsp', '') or '').strip()  # 财务审批
        cwyj = str(j.get('cwyj', '') or '').strip()  # 财务意见
        jbry = str(j.get('jbry', '') or '').strip()  # 经办人员

        if cwsp == '' or cwsp == '待审批':
            return json_result(1, 'ok', {'patch': {}})

        # Pascal: select number from cygd where fkbh=:fkbh
        # 迁移规范: number -> rid
        st_rid = ''
        d = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d) > 0:
            st_rid = str(d[0].get('rid', '') or '')

        # Pascal: delete from sys_alarm -> user_task_delete
        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

        today = time.strftime('%Y-%m-%d')
        patch = {'财务日期1': today}

        # 不通过
        if cwsp == '不通过':
            # instantmessage -> module_xxck_new
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '财务不能通过,原因:' + cwyj,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            # Pascal 回写字段
            patch['主管审批'] = '待审批'
            patch['总经理审批'] = '待审批'
            patch['风控审批'] = '待审批'
            patch['单证审批'] = '待审批'
            patch['财务审批'] = '待审批'
            patch['提交主管'] = ''
            patch['改单状况'] = '驳回'

            # sys_alarm insert -> user_task_new
            if st_rid != '' and jbry != '':
                subject = user.username + '出运改单:' + fkbh + '财务不能通过没通过,原因:' + cwyj
                r_new = user_task_new(
                    '出运改单',
                    st_rid,
                    '申请编号',
                    '出运改单[申请编号]驳回',
                    subject,
                    user,
                    s,
                    [jbry],
                    True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_cw_group': 1
            })

        # 通过
        if cwsp == '通过':
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '财务通过请查看,日期:' + today,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            patch['改单状况'] = '完成'

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_cw_group': 1
            })

        s.rollback()
        return json_result(0, '财务审批值无效')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/shipment_amendment/field/tjzg/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_tjzg_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        tjzg = str(j.get('tjzg', '') or '').strip()
        fkbh = str(j.get('fkbh', '') or '').strip()
        fphm = str(j.get('fphm', '') or '').strip()
        jbry = str(j.get('jbry', '') or '').strip()
        tjdz = str(j.get('tjdz', '') or '').strip()
        tjfk = str(j.get('tjfk', '') or '').strip()
        tjzjl = str(j.get('tjzjl', '') or '').strip()
        tjcw = str(j.get('tjcw', '') or '').strip()

        rmbkh = str(j.get('rmbkh', '') or '').strip()
        hl = float(j.get('hl', 1) or 1)

        jx1 = float(j.get('jx1', 0) or 0)
        jx2 = float(j.get('jx2', 0) or 0)
        jx3 = float(j.get('jx3', 0) or 0)
        jxj1 = float(j.get('jxj1', 0) or 0)
        jxj2 = float(j.get('jxj2', 0) or 0)
        jxj3 = float(j.get('jxj3', 0) or 0)

        detail_rows = j.get('detail_rows', []) or []

        if tjzg == '':
            return json_result(1, 'ok', {'clear_tjzg': 0, 'patch': {}})

        if fkbh == '':
            return json_result(0, '请先保存，请重新选择!', {'clear_tjzg': 1, 'patch': {}})

        if hl == 0:
            hl = 1

        def _f(v):
            try:
                return float(v or 0)
            except:
                return 0.0

        patch = {}
        father_rid = ''
        sbz = ''

        # 1) 主记录 + stnumber 近似语义（sid）
        st_rid = ''
        st_sid = 0
        d_cygd = run_sql(
            'select rid,sid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d_cygd) > 0:
            st_rid = str(d_cygd[0].get('rid', '') or '')
            try:
                st_sid = int(d_cygd[0].get('sid', 0) or 0)
            except:
                st_sid = 0

        # 2) cymx 默认值
        d_cymx = run_sql(
            '''select rid,ygnlf,zgfy,ckfy,yzaf,qtusd,qtrmb,zkfy,ewhj,zdry,hyf
               from cymx where fphm=:fphm limit 1''',
            {'fphm': fphm}
        ) or []
        if len(d_cymx) > 0:
            c = d_cymx[0]
            father_rid = str(c.get('rid', '') or '')

            patch['更改后数据.预估内陆费'] = _f(c.get('ygnlf', 0))
            patch['更改后数据.装柜费用'] = _f(c.get('zgfy', 0))
            patch['更改后数据.仓库费用'] = _f(c.get('ckfy', 0))
            patch['更改后数据.运 杂 费'] = _f(c.get('yzaf', 0))
            patch['更改后数据.其他 USD'] = _f(c.get('qtusd', 0))
            patch['更改后数据.其他 RMB'] = _f(c.get('qtrmb', 0))
            patch['更改后数据.纸卡费用'] = _f(c.get('zkfy', 0))
            patch['更改后数据.额外货值'] = _f(c.get('ewhj', 0))
            patch['更改后数据.海 运 费'] = _f(c.get('hyf', 0))

            if tjdz == '':
                patch['提交单证'] = str(c.get('zdry', '') or '')

        # 3) 默认风控
        d_chyjh = run_sql(
            'select fkry from chyjh where wxfp=:wxfp limit 1',
            {'wxfp': fphm}
        ) or []
        if len(d_chyjh) > 0 and tjfk == '':
            patch['提交风控'] = str(d_chyjh[0].get('fkry', '') or '')

        # 4) 权限校验 + 默认审批链
        d_zx = run_sql(
            'select wb2,wb3,wb4,wb5 from zx where ly=:ly and wb3=:wb3 limit 1',
            {'ly': '改单申请', 'wb3': tjzg}
        ) or []
        if len(d_zx) > 0:
            sbz = '1'
            zx = d_zx[0]
            if tjfk == '':
                patch['提交风控'] = str(zx.get('wb2', '') or '')
            if tjzjl == '':
                patch['提交总经理'] = str(zx.get('wb4', '') or '')
            if tjcw == '':
                patch['提交财务'] = str(zx.get('wb5', '') or '')

        # Pascal：sbz=1 后还要 stnumber>1
        if sbz == '1':
            if st_sid > 1:
                sbz = '1'
            else:
                sbz = ''

        if sbz != '1':
            return json_result(0, '此人非可提交主管或没保存，请重新选择!', {'clear_tjzg': 1, 'patch': {}})

        # 5) 按 Pascal 口径重算：当前页面行 + 库内剩余行
        myjje = 0.0
        ayjje = 0.0
        rmbche = 0.0
        wxje1 = 0.0
        mjzj1 = 0.0
        wxjez1 = 0.0
        jxusd = 0.0
        jxusd1 = 0.0
        jxrmb = 0.0
        tjhjz = 0.0
        ts = 0.0
        bfz = 0.0
        bfmz = 0.0
        kpfyz = 0.0

        cywyzd_list = []

        if father_rid != '':
            # 5.1 先清空标记
            s.query(cymxsheet).filter(cymxsheet.pid == father_rid).update({'sb': ''}, synchronize_session=False)

            # 5.2 用前端传入明细计算“当前页面行”，并标记 sb=1
            for r in detail_rows:
                cywyzd = str(r.get('cywyzd', '') or '').strip()
                cpbh = str(r.get('cpbh', '') or '').strip()
                chsl = _f(r.get('chsl', 0))
                r_rmbkh = str(r.get('rmbkh', '') or '').strip()
                cghbdm = str(r.get('cghbdm', '') or '').strip().upper()

                cgzj = _f(r.get('cgzj', 0))
                wxzj = _f(r.get('wxzj', 0))
                mjzj = _f(r.get('mjzj', 0))
                wxzjz = _f(r.get('wxzjz', 0))
                ztj = _f(r.get('ztj', 0))
                tse = _f(r.get('tse', 0))
                yj = _f(r.get('yj', 0))
                ayj = _f(r.get('ayj', 0))

                hlcg = 1.0
                if cghbdm not in ['', 'RMB']:
                    d_hl = run_sql('select hhl from hbdm where hbdm=:hbdm limit 1', {'hbdm': cghbdm}) or []
                    if len(d_hl) > 0:
                        hlcg = _f(d_hl[0].get('hhl', 1) or 1)
                        if hlcg == 0:
                            hlcg = 1.0
                gczj = cgzj * hlcg

                # 当前页面行分组（对齐 Pascal 主逻辑）
                if chsl == 0 and cpbh == '':
                    if r_rmbkh == '是':
                        jxusd1 += mjzj
                        wxjez1 += (mjzj / hl if hl != 0 else 0)
                    else:
                        jxusd += wxzj
                        wxjez1 += wxzj
                    jxrmb += gczj
                else:
                    rmbche += gczj
                    myjje += yj
                    ayjje += ayj
                    if rmbkh == '是':
                        mjzj1 += mjzj
                    else:
                        wxje1 += wxzj
                    wxjez1 += wxzjz

                tjhjz += ztj
                ts += tse

                if cywyzd != '':
                    cywyzd_list.append(cywyzd)

            # 5.3 标记 sb=1（当前页面行）
            if len(cywyzd_list) > 0:
                s.query(cymxsheet).filter(
                    cymxsheet.pid == father_rid,
                    cymxsheet.cywyzd.in_(cywyzd_list)
                ).update({'sb': '1'}, synchronize_session=False)

            # 5.4 统计库内剩余行（sb<>1）
            d_left = run_sql(
                '''
                select
                    ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' and ifnull(RMBkh,'')<>'是' then ifnull(wxzj,0) else 0 end),0) as l_jxusd,
                    ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' and ifnull(RMBkh,'')='是' then ifnull(mjzj,0) else 0 end),0) as l_jxusd1,
                    ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' then ifnull(gczj,0) else 0 end),0) as l_jxrmb,
                    ifnull(sum(case when not(ifnull(chsl,0)=0 and ifnull(cpbh,'')='') then ifnull(gczj,0) else 0 end),0) as l_rmbche,
                    ifnull(sum(case when not(ifnull(chsl,0)=0 and ifnull(cpbh,'')='') and ifnull(RMBkh,'')<>'是' then ifnull(wxzj,0) else 0 end),0) as l_wxje1,
                    ifnull(sum(case when not(ifnull(chsl,0)=0 and ifnull(cpbh,'')='') and ifnull(RMBkh,'')='是' then ifnull(mjzj,0) else 0 end),0) as l_mjzj1,
                    ifnull(sum(ifnull(wxzjz,0)),0) as l_wxjez1,
                    ifnull(sum(ifnull(ztj,0)),0) as l_tjhjz,
                    ifnull(sum(ifnull(tse,0)),0) as l_ts,
                    ifnull(sum(ifnull(yj,0)),0) as l_myjje,
                    ifnull(sum(ifnull(ayj,0)),0) as l_ayjje,
                    ifnull(sum(ifnull(bf,0)),0) as l_bfz,
                    ifnull(sum(ifnull(`bf$`,0)),0) as l_bfmz,
                    ifnull(sum(ifnull(kpfy,0)),0) as l_kpfyz
                from cymxsheet
                where pid=:pid and ifnull(sb,'')<>'1'
                ''',
                {'pid': father_rid}
            ) or []

            if len(d_left) > 0:
                dl = d_left[0]
                jxusd += _f(dl.get('l_jxusd', 0))
                jxusd1 += _f(dl.get('l_jxusd1', 0))
                jxrmb += _f(dl.get('l_jxrmb', 0))
                rmbche += _f(dl.get('l_rmbche', 0))

                # 剩余行按主表 RMB客户口径分入外销总额/客户RMB总价
                if rmbkh == '是':
                    mjzj1 += _f(dl.get('l_mjzj1', 0))
                else:
                    wxje1 += _f(dl.get('l_wxje1', 0))

                wxjez1 += _f(dl.get('l_wxjez1', 0))
                tjhjz += _f(dl.get('l_tjhjz', 0))
                ts += _f(dl.get('l_ts', 0))
                myjje += _f(dl.get('l_myjje', 0))
                ayjje += _f(dl.get('l_ayjje', 0))
                bfz += _f(dl.get('l_bfz', 0))
                bfmz += _f(dl.get('l_bfmz', 0))
                kpfyz += _f(dl.get('l_kpfyz', 0))

        patch['更改后数据.明佣合计.'] = myjje
        patch['更改后数据.暗佣合计.'] = ayjje
        patch['更改后数据.人民币出货额.'] = rmbche
        patch['更改后数据.外销总额'] = wxje1
        patch['更改后数据.客户RMB总价'] = mjzj1
        patch['更改后数据.外销总额总'] = wxjez1
        patch['更改后数据.加项USD'] = jxusd
        patch['更改后数据.加项客户RMB'] = jxusd1
        patch['更改后数据.加项RMB'] = jxrmb
        patch['更改后数据.体积合计'] = tjhjz
        patch['更改后数据.退税总额.'] = ts

        # 成本总额
        ygnlf = _f(patch.get('更改后数据.预估内陆费', 0))
        zgfy = _f(patch.get('更改后数据.装柜费用', 0))
        ckfy = _f(patch.get('更改后数据.仓库费用', 0))
        yzaf = _f(patch.get('更改后数据.运 杂 费', 0))
        qtrmb = _f(patch.get('更改后数据.其他 RMB', 0))

        if ygnlf > 0:
            cbze = rmbche + jxrmb + zgfy + ckfy + ygnlf + qtrmb
        else:
            cbze = rmbche + jxrmb + zgfy + ckfy + yzaf + qtrmb
        patch['更改后数据.成本总额.'] = cbze

        # 货值合计（含加减项）
        jjhj = (jx1 + jx2 + jx3) - (jxj1 + jxj2 + jxj3)
        patch['更改后数据.加减项合计'] = jjhj

        ewhz = _f(patch.get('更改后数据.额外货值', 0))
        if rmbkh == '是':
            hz_total = mjzj1 + wxje1 * hl + jxusd1 + jxusd * hl + ewhz
            patch['更改后数据.货值合计.'] = hz_total
            patch['更改后数据.货值合计￥.'] = mjzj1 + jxusd1 + ewhz
            patch['更改后数据.货值合计$.'] = wxje1 + jxusd
        else:
            hz_total = wxje1 + (mjzj1 / hl if hl != 0 else 0) + (jxusd1 / hl if hl != 0 else 0) + ewhz + jxusd
            patch['更改后数据.货值合计.'] = hz_total
            patch['更改后数据.货值合计$'] = wxje1 + jxusd + ewhz
            patch['更改后数据.货值合计￥'] = mjzj1 + jxusd1

        # 核算毛利 + 毛利率
        hyf = _f(patch.get('更改后数据.海 运 费', 0))
        if rmbkh == '是':
            hsml = hz_total - myjje - (hyf + bfmz) * hl - bfz - cbze + ts - kpfyz - ayjje
            mlv = 0 if hz_total == 0 else 100 * (hsml / hz_total)
        else:
            hsml = (hz_total - myjje - hyf - bfmz) * hl - bfz - cbze + ts - kpfyz - ayjje * hl
            mlv = 0 if (hz_total == 0 or hl == 0) else 100 * (hsml / (hz_total * hl))

        patch['更改后数据.核算毛利.'] = hsml
        patch['更改后数据.毛 利 率.'] = mlv

        # 6) 消息 + 待办
        today = time.strftime('%Y-%m-%d')
        xx = '的出运改单:' + fkbh + '需审批,日期:' + today
        spsq = tjzg

        if user.username != spsq and spsq != '':
            row = {
                'xxly': '出运改单',
                'xxnr': user.username + xx,
                'jsr': spsq,
                'spsq': spsq
            }
            r_msg = module_xxck_new([row], user, s)
            if r_msg.get('code') != 1:
                s.rollback()
                return json_result(-1, r_msg.get('msg', '发送消息失败'))

        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

            r_new = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需审批',
                user.username + xx,
                user,
                s,
                [spsq],
                True
            )
            if r_new.get('code') != 1:
                s.rollback()
                return json_result(-1, r_new.get('msg', '创建待办失败'))

        # 7) 还原 sb（对齐 Pascal）
        if father_rid != '':
            s.query(cymxsheet).filter(cymxsheet.pid == father_rid).update({'sb': ''}, synchronize_session=False)

        patch['改单状况'] = '进行中'

        s.commit()
        return json_result(1, 'ok', {
            'clear_tjzg': 0,
            'patch': patch
        })
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/tjzjl/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_tjzjl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '') 
        tjzjl = j.get('tjzjl', '') 
        tjzg = j.get('tjzg', '') 
        zgsp = j.get('zgsp', '') 
        jbry = j.get('jbry', '') 

        # Pascal入口条件：
        # 提交总经理不空 且 主管审批=通过
        if tjzjl == '' or zgsp != '通过':
            return json_result(1, 'ok', {'clear_tjzjl': 0})

        # zx校验：(ly='改单申请') and (wb3=提交主管) and (wb4=提交总经理)
        sbz = ''
        d_zx = run_sql(
            'select rid from zx where ly=:ly and wb3=:wb3 and wb4=:wb4 limit 1',
            {'ly': '改单申请', 'wb3': tjzg, 'wb4': tjzjl}
        ) or []
        if len(d_zx) > 0:
            sbz = '1'

        # 申请编号对应 cygd 主记录（number -> rid 映射）
        st_rid = ''
        if fkbh != '':
            d_cygd = run_sql(
                'select rid from cygd where fkbh=:fkbh limit 1',
                {'fkbh': fkbh}
            ) or []
            if len(d_cygd) > 0:
                st_rid = str(d_cygd[0].get('rid', '') or '')

        # Pascal: sbz=1 时还要 stnumber>1；迁移后以“存在有效主记录”判定
        if sbz == '1':
            if st_rid != '':
                sbz = '1'
            else:
                sbz = ''

        if sbz != '1':
            return json_result(0, '此人非可提交总经理或没保存，请重新选择!', {'clear_tjzjl': 1})

        xx = '的出运改单:' + fkbh + '需审批,日期:' + time.strftime('%Y-%m-%d')
        spsq = tjzjl

        # Pascal instantmessage -> module_xxck_new
        if user.username != spsq and spsq != '':
            row = {
                'xxly': '出运改单',
                'xxnr': jbry + xx,
                'jsr': spsq,
                'spsq': spsq
            }
            r1 = module_xxck_new([row], user, s)
            if r1.get('code') != 1:
                s.rollback()
                return json_result(-1, r1.get('msg', '发送消息失败'))

        # Pascal delete/insert sys_alarm -> user_task_delete + user_task_new
        if st_rid != '':
            r2 = user_task_delete('出运改单', st_rid, s, [])
            if r2.get('code') != 1:
                s.rollback()
                return json_result(-1, r2.get('msg', '删除待办失败'))

            subject = jbry + xx
            r3 = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需审批',
                subject,
                user,
                s,
                [spsq],
                True
            )
            if r3.get('code') != 1:
                s.rollback()
                return json_result(-1, r3.get('msg', '创建待办失败'))

        s.commit()
        return json_result(1, 'ok', {'clear_tjzjl': 0})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/tjfk/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_tjfk_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '')
        tjfk = j.get('tjfk', '')
        zjlsp = j.get('zjlsp', '')
        jbry = j.get('jbry', '')

        # Pascal入口：提交风控不空 且 总经理审批=通过
        if tjfk == '' or zjlsp != '通过':
            return json_result(1, 'ok', {'clear_tjfk': 0})

        # 原 Pascal: sys_users(name like 风控)
        # 迁移规则：sys_user + username，并用position判断
        sbz = ''
        org = get_user_path(user.username)
        postion = org.get('position', '')
        if '风控' in postion:
            sbz = '1'

        # 原 Pascal: cygd.number -> 迁移为 rid
        st_rid = ''
        if fkbh != '':
            d_cygd = run_sql(
                'select rid from cygd where fkbh=:fkbh limit 1',
                {'fkbh': fkbh}
            ) or []
            if len(d_cygd) > 0:
                st_rid = str(d_cygd[0].get('rid', '') or '')

        # Pascal stnumber>1 语义：已保存且有效主记录
        if sbz == '1':
            if st_rid != '':
                sbz = '1'
            else:
                sbz = ''

        if sbz != '1':
            return json_result(0, '此人非可提交风控或没保存，请重新选择!', {'clear_tjfk': 1})

        xx = '的出运改单:' + fkbh + '需审批,日期:' + time.strftime('%Y-%m-%d')
        spsq = tjfk

        # Pascal instantmessage -> module_xxck_new
        if user.username != spsq and spsq != '':
            row = {
                'xxly': '出运改单',
                'xxnr': jbry + xx,
                'jsr': spsq,
                'spsq': spsq
            }
            r1 = module_xxck_new([row], user, s)
            if r1.get('code') != 1:
                s.rollback()
                return json_result(-1, r1.get('msg', '发送消息失败'))

        # Pascal sys_alarm delete/insert -> user_task_delete/user_task_new
        if st_rid != '':
            r2 = user_task_delete('出运改单', st_rid, s, [])
            if r2.get('code') != 1:
                s.rollback()
                return json_result(-1, r2.get('msg', '删除待办失败'))

            subject = jbry + xx
            r3 = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需审批',
                subject,
                user,
                s,
                [spsq],
                True
            )
            if r3.get('code') != 1:
                s.rollback()
                return json_result(-1, r3.get('msg', '创建待办失败'))

        s.commit()
        return json_result(1, 'ok', {'clear_tjfk': 0})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/tjcw/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_tjcw_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '')
        tjcw = j.get('tjcw', '')
        dzsp = j.get('dzsp', '')
        jbry = j.get('jbry', '')

        # Pascal入口：单证审批=通过 且 提交财务不空
        if dzsp != '通过' or tjcw == '':
            return json_result(1, 'ok', {'clear_tjcw': 0})

        # 角色校验：财务人员（按技能规范使用 get_user_path 判断 position）
        sb = ''
        org = get_user_path(tjcw)
        position = org.get('position', '')
        if '财务' in position:
            sb = '1'

        # 原 Pascal: cygd.number -> 迁移为 rid
        st_rid = ''
        if fkbh != '':
            d_cygd = run_sql(
                'select rid from cygd where fkbh=:fkbh limit 1',
                {'fkbh': fkbh}
            ) or []
            if len(d_cygd) > 0:
                st_rid = str(d_cygd[0].get('rid', '') or '')

        # Pascal stnumber>1 判定：迁移后以存在有效主记录判定
        if sb == '1':
            if st_rid != '':
                sb = '1'
            else:
                sb = ''

        if sb != '1':
            return json_result(0, '此人非财务人员或没保存，请重新选择!', {'clear_tjcw': 1})

        xx = '的出运改单:' + fkbh + '需审批,日期:' + time.strftime('%Y-%m-%d')
        spsq = tjcw

        # Pascal instantmessage -> module_xxck_new
        if user.username != spsq and spsq != '':
            row = {
                'xxly': '出运改单',
                'xxnr': jbry + xx,
                'jsr': spsq,
                'spsq': spsq
            }
            r1 = module_xxck_new([row], user, s)
            if r1.get('code') != 1:
                s.rollback()
                return json_result(-1, r1.get('msg', '发送消息失败'))

        # Pascal delete/insert sys_alarm -> user_task_delete/user_task_new
        if st_rid != '':
            r2 = user_task_delete('出运改单', st_rid, s, [])
            if r2.get('code') != 1:
                s.rollback()
                return json_result(-1, r2.get('msg', '删除待办失败'))

            subject = jbry + xx
            r3 = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需审批',
                subject,
                user,
                s,
                [spsq],
                True
            )
            if r3.get('code') != 1:
                s.rollback()
                return json_result(-1, r3.get('msg', '创建待办失败'))

        s.commit()
        return json_result(1, 'ok', {'clear_tjcw': 0})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/zgsp/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_zgsp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '') 
        zgsp = j.get('zgsp', '') 
        yjbz = j.get('yjbz', '') 
        jbry = j.get('jbry', '') 
        tjzjl = j.get('tjzjl', '') 

        if zgsp == '' or zgsp == '待审批':
            return json_result(1, 'ok', {'patch': {}})

        st_rid = ''
        d = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d) > 0:
            st_rid = str(d[0].get('rid', '') or '')

        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

        patch = {}
        today = time.strftime('%Y-%m-%d')

        if zgsp == '不通过':
            if yjbz == '':
                s.rollback()
                return json_result(0, '请输入审批意见')

            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '主管不能通过,原因:' + yjbz,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            if st_rid != '' and jbry != '':
                subject = user.username + '出运改单:' + fkbh + '主管不能通过,原因:' + yjbz
                r_new = user_task_new(
                    '出运改单', st_rid, '申请编号',
                    '出运改单[申请编号]驳回', subject, user, s, [jbry], True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            patch['提交主管'] = ''
            patch['主管日期'] = today
            patch['主管审批'] = '待审批'
            patch['意见备注'] = yjbz
            patch['改单状况'] = '驳回'

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_zgsp_fields': 1,
                'enable_tjzjl': 0
            })

        if zgsp == '通过':
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '主管通过请查看,日期:' + today,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg1 = module_xxck_new([row], user, s)
                if r_msg1.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg1.get('msg', '发送消息失败'))

            xx = '的出运改单:' + fkbh + '需审批,日期:' + today
            if user.username != tjzjl and tjzjl != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': jbry + xx,
                    'jsr': tjzjl,
                    'spsq': tjzjl
                }
                r_msg2 = module_xxck_new([row], user, s)
                if r_msg2.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg2.get('msg', '发送消息失败'))

            if st_rid != '' and tjzjl != '':
                subject = jbry + xx
                r_new = user_task_new(
                    '出运改单', st_rid, '申请编号',
                    '出运改单[申请编号]需审批', subject, user, s, [tjzjl], True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            patch['主管日期'] = today

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_zgsp_fields': 1,
                'enable_tjzjl': 1
            })

        s.rollback()
        return json_result(0, '主管审批无效')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/shipment_amendment/field/zjlsp/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_zjlsp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '') 
        zjlsp = j.get('zjlsp', '') 
        zjlyj = j.get('zjlyj', '') 
        jbry = j.get('jbry', '') 
        tjfk = j.get('tjfk', '') 
        tjdz = j.get('tjdz', '') 
        hz_old = j.get('hz_old', 0)
        hz_new = j.get('hz_new', 0)

        if zjlsp == '' or zjlsp == '待审批':
            return json_result(1, 'ok', {'patch': {}})

        st_rid = ''
        d = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d) > 0:
            st_rid = str(d[0].get('rid', '') or '')

        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

        today = time.strftime('%Y-%m-%d')
        patch = {}

        if zjlsp == '不通过':
            # Pascal 这里直接用“总经理意见”
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '总经理不能通过,原因:' + zjlyj,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            # 按 Pascal 回写
            patch['主管审批'] = '待审批'
            patch['提交主管'] = ''
            patch['总经理日期'] = today
            patch['总经理审批'] = '待审批'
            patch['改单状况'] = '驳回'

            if st_rid != '' and jbry != '':
                subject = user.username + '出运改单:' + fkbh + '总经理不能通过没通过,原因:' + zjlyj
                r_new = user_task_new(
                    '出运改单', st_rid, '申请编号',
                    '出运改单[申请编号]驳回', subject, user, s, [jbry], True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_zg_group': 1,
                'lock_zjl_group': 1,
                'enable_tjfk': 0,
                'enable_tjdz': 0
            })

        if zjlsp == '通过':
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '总经理通过请查看,日期:' + today,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg1 = module_xxck_new([row], user, s)
                if r_msg1.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg1.get('msg', '发送消息失败'))

            # Pascal 分支：货值变化 -> 风控，否则直接把cygd.fksp置通过并走单证
            enable_tjfk = 0
            enable_tjdz = 0
            spsq = ''
            xx = '的出运改单:' + fkbh + '需审批,日期:' + today

            if hz_old != hz_new:
                enable_tjfk = 1
                spsq = tjfk
            else:
                s.query(cygd).filter(cygd.fkbh == fkbh).update({'fksp': '通过'})
                enable_tjdz = 1
                spsq = tjdz

            patch['总经理日期'] = today

            if user.username != spsq and spsq != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': jbry + xx,
                    'jsr': spsq,
                    'spsq': spsq
                }
                r_msg2 = module_xxck_new([row], user, s)
                if r_msg2.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg2.get('msg', '发送消息失败'))

            if st_rid != '' and spsq != '':
                subject = jbry + xx
                r_new = user_task_new(
                    '出运改单', st_rid, '申请编号',
                    '出运改单[申请编号]需审批', subject, user, s, [spsq], True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_zg_group': 1,
                'lock_zjl_group': 1,
                'enable_tjfk': enable_tjfk,
                'enable_tjdz': enable_tjdz
            })

        s.rollback()
        return json_result(0, '总经理审批无效')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/fksp/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_fksp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh', '')
        fksp = j.get('fksp', '')
        fkyj = j.get('fkyj', '')
        jbry = j.get('jbry', '')
        tjdz = j.get('tjdz', '')

        if fksp == '' or fksp == '待审批':
            return json_result(1, 'ok', {'patch': {}})

        # Pascal: select number from cygd where fkbh=:fkbh
        # 迁移：number -> rid
        st_rid = ''
        d = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d) > 0:
            st_rid = str(d[0].get('rid', '') or '')

        # Pascal: 先 delete sys_alarm
        if st_rid != '':
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

        today = time.strftime('%Y-%m-%d')
        patch = {}

        if fksp == '不通过':
            # 通知经办人员
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '风控不能通过,原因:' + fkyj,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg = module_xxck_new([row], user, s)
                if r_msg.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg.get('msg', '发送消息失败'))

            # 按 Pascal 回写
            patch['主管审批'] = '待审批'
            patch['总经理审批'] = '待审批'
            patch['提交主管'] = ''
            patch['风控日期'] = today
            patch['风控审批'] = '待审批'
            patch['改单状况'] = '驳回'

            if st_rid != '' and jbry != '':
                subject = user.username + '出运改单:' + fkbh + '风控不能通过没通过,原因:' + fkyj
                r_new = user_task_new(
                    '出运改单',
                    st_rid,
                    '申请编号',
                    '出运改单[申请编号]驳回',
                    subject,
                    user,
                    s,
                    [jbry],
                    True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_fk_group': 1,
                'enable_tjdz': 0
            })

        if fksp == '通过':
            # 通知经办人员
            if user.username != jbry and jbry != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': '出运改单:' + fkbh + '风控通过请查看,日期:' + today,
                    'jsr': jbry,
                    'spsq': jbry
                }
                r_msg1 = module_xxck_new([row], user, s)
                if r_msg1.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg1.get('msg', '发送消息失败'))

            patch['风控日期'] = today

            spsq = tjdz
            xx = '的出运改单:' + fkbh + '需审批,日期:' + today

            # 通知单证审批人
            if user.username != spsq and spsq != '':
                row = {
                    'xxly': '出运改单',
                    'xxnr': jbry + xx,
                    'jsr': spsq,
                    'spsq': spsq
                }
                r_msg2 = module_xxck_new([row], user, s)
                if r_msg2.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_msg2.get('msg', '发送消息失败'))

            if st_rid != '' and spsq != '':
                subject = jbry + xx
                r_new = user_task_new(
                    '出运改单',
                    st_rid,
                    '申请编号',
                    '出运改单[申请编号]需审批',
                    subject,
                    user,
                    s,
                    [spsq],
                    True
                )
                if r_new.get('code') != 1:
                    s.rollback()
                    return json_result(-1, r_new.get('msg', '创建待办失败'))

            s.commit()
            return json_result(1, 'ok', {
                'patch': patch,
                'lock_fk_group': 1,
                'enable_tjdz': 1
            })

        s.rollback()
        return json_result(0, '风控审批值无效')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/field/gdzk/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_gdzk_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()

    def _s(v):
        return str(v or '').strip()

    def _f(v, d=0.0):
        try:
            return float(v or d)
        except:
            return d

    def _i(v, d=0):
        try:
            return int(v or d)
        except:
            return d

    def _model_update_dict(model_cls, data_dict):
        cols = set([c.name for c in model_cls.__table__.columns])
        return {k: v for k, v in data_dict.items() if k in cols}

    def _set_if_has_attr(obj, data_dict):
        for k, v in data_dict.items():
            if hasattr(obj, k):
                setattr(obj, k, v)

    try:
        gdzk = _s(j.get('gdzk', ''))
        fkbh = _s(j.get('fkbh', ''))
        fphm = _s(j.get('fphm', ''))
        jbry = _s(j.get('jbry', ''))
        rmbkh = _s(j.get('rmbkh', ''))
        hl = _f(j.get('hl', 1), 1.0)

        jx1 = _f(j.get('jx1', 0))
        jx2 = _f(j.get('jx2', 0))
        jx3 = _f(j.get('jx3', 0))
        jxj1 = _f(j.get('jxj1', 0))
        jxj2 = _f(j.get('jxj2', 0))
        jxj3 = _f(j.get('jxj3', 0))

        zysx = _s(j.get('zysx', ''))
        qtshm = _s(j.get('qtshm', ''))

        detail_rows = j.get('detail_rows', []) or []

        if gdzk != '完成':
            return json_result(1, '忽略非完成状态', {'patch': {}})

        if fkbh == '' or fphm == '':
            return json_result(0, '申请编号或发票号码不能为空')

        if hl == 0:
            hl = 1

        now_dt = datetime.now()
        now_str = now_dt.strftime('%Y-%m-%d %H:%M:%S')
        today = now_dt.strftime('%Y-%m-%d')

        # 1) 查询主记录
        cygd_row = s.query(cygd).filter(cygd.fkbh == fkbh).first()
        if cygd_row is None:
            return json_result(0, '未找到出运改单主记录，请先保存')

        # 2) 对应出运明细主表（cymx）
        cymx_row = s.query(cymx).filter(cymx.fphm == fphm).first()
        if cymx_row is None:
            return json_result(0, '未找到出运明细主记录')

        father_rid = _s(cymx_row.rid)

        # 3) xjhc 主键（用于同步 xjhcsheet / xjhcsheet1）
        xjhc_row = s.query(xjhc).filter(xjhc.fphm == fphm).first()
        xjhc_rid = _s(xjhc_row.rid) if xjhc_row else ''

        row_patch = []
        cywyzd_list = []

        # 4) 逐行处理（更新已存在行；缺失时按 cywyzd12 从 chyjhsheet 补建）
        for idx, r in enumerate(detail_rows):
            cywyzd = _s(r.get('cywyzd', ''))
            cywyzd12 = _s(r.get('cywyzd12', ''))

            # 毛利标识 mlsb（工厂在 bmlgc 中存在则 否，否则 是）
            gcmc = _s(r.get('gcmc', ''))
            mlpd = '是'
            if gcmc != '':
                d_bmlgc = run_sql(
                    'select rid from bmlgc where gcmc=:gcmc limit 1',
                    {'gcmc': gcmc}
                ) or []
                if len(d_bmlgc) > 0:
                    mlpd = '否'

            row_vals = {
                'cpbh': _s(r.get('cpbh', '')),
                'zwpm': _s(r.get('zwpm', '')),
                'zhwbgpm': _s(r.get('zhwbgpm', '')),
                'gcmc': gcmc,
                'zzsl': _i(r.get('zzsl', 0)),
                'tsl': _i(r.get('tsl', 0)),
                'tse': _f(r.get('tse', 0)),
                'jsfs': _s(r.get('jsfs', '')),
                'scrq': _s(r.get('scrq', '')),
                'gcjg': _f(r.get('gcjg', 0)),
                'gczj': _f(r.get('gczj', 0)),
                'wxjg': _f(r.get('wxjg', 0)),
                'wxzj': _f(r.get('wxzj', 0)),
                'mjdj1': _f(r.get('mjdj1', 0)),
                'mjzj': _f(r.get('mjzj', 0)),
                'wxrl': _f(r.get('wxrl', 0)),
                'chxs': _i(r.get('chxs', 0)),
                'chsl': _f(r.get('chsl', 0)),
                'wxmz': _f(r.get('wxmz', 0)),
                'zmz': _f(r.get('zmz', 0)),
                'wxjz': _f(r.get('wxjz', 0)),
                'zjz': _f(r.get('zjz', 0)),
                'wxtj': _f(r.get('wxtj', 0)),
                'ztj': _f(r.get('ztj', 0)),
                'yj': _f(r.get('yj', 0)),
                'yjzj': _f(r.get('yjzj', 0)),
                'ayj': _f(r.get('ayj', 0)),
                'gczjrmb': _f(r.get('gczjrmb', 0)),
                'sj': _f(r.get('sj', 0)),
                'kpfy': _f(r.get('kpfy', 0)),
                'wxzjz': _f(r.get('wxzjz', 0)),
                'ljrk': _f(r.get('ljrk', 0)),
                'xddd': _s(r.get('xddd', '')),
                'hyd': _s(r.get('hyd', '')),
                'mlsb': mlpd,
                'mtime': now_dt
            }

            # 已有 cywyzd：更新 cymxsheet + bgmxdsheet + dbbqd + xjhcsheet
            if cywyzd != '':
                cywyzd_list.append(cywyzd)

                s.query(cymxsheet).filter(cymxsheet.cywyzd == cywyzd).update(
                    _model_update_dict(cymxsheet, row_vals),
                    synchronize_session=False
                )
                s.query(bgmxdsheet).filter(bgmxdsheet.cywyzd == cywyzd).update(
                    _model_update_dict(bgmxdsheet, row_vals),
                    synchronize_session=False
                )
                s.query(dbbqd).filter(dbbqd.cywyzd == cywyzd).update(
                    _model_update_dict(dbbqd, row_vals),
                    synchronize_session=False
                )
                if xjhc_rid != '':
                    s.query(xjhcsheet).filter(
                        xjhcsheet.pid == xjhc_rid,
                        xjhcsheet.cywyzd == cywyzd
                    ).update(
                        _model_update_dict(xjhcsheet, row_vals),
                        synchronize_session=False
                    )
                continue

            # 缺失 cywyzd：按 cywyzd12 从 chyjhsheet 拷贝一条新明细
            if cywyzd12 == '':
                continue

            exists_new = s.query(cymxsheet).filter(cymxsheet.cywyzd12 == cywyzd12).first()
            if exists_new is not None:
                continue

            src = s.query(chyjhsheet).filter(chyjhsheet.cywyzd == cywyzd12).first()
            if src is None:
                continue

            new_cywyzd = str(idx + 1) + '出运改单' + fphm + user.username + now_str
            cywyzd_list.append(new_cywyzd)
            row_patch.append({'row_index': idx, 'cywyzd': new_cywyzd})

            m1 = cymxsheet()
            m1.rid = get_uuid()
            m1.pid = father_rid
            m1.uid = user.rid
            m1.ctime = now_dt
            m1.mtime = now_dt

            # 补建继承增强：尽量保持与旧逻辑口径一致（缺字段时自动忽略）
            copy_vals = {
                'fphm': fphm,
                'wxht': _s(getattr(src, 'wxht', '')),
                'cght': _s(getattr(src, 'cght', '')),
                'khht': _s(getattr(src, 'khht', '')),
                'zycpbh': _s(getattr(src, 'zycpbh', '')),
                'cpgg': _s(getattr(src, 'cpgg', '')),
                'khhh': _s(getattr(src, 'khhh', '')),
                'ywpm': _s(getattr(src, 'ywpm', '')),
                'ywbgpm': _s(getattr(src, 'ywbgpm', '')),
                'gchh': _s(getattr(src, 'gchh', '')),
                'gcdh': _s(getattr(src, 'gcdh', '')),
                'jhrq': _s(getattr(src, 'jhrq', '')),
                'jldw': _s(getattr(src, 'jldw', '')),
                'bzdw': _s(getattr(src, 'bzdw', '')),
                'krcode': _s(getattr(src, 'krcode', '')),
                'wypp': _s(getattr(src, 'wypp', '')),
                'fktt': _s(getattr(src, 'fktt', '')),
                'sfdb': _s(getattr(src, 'sfdb', '')),
                'sfsq': _s(getattr(src, 'sfsq', '')),
                'mdck': _s(getattr(src, 'mdck', '')),
                'wxbm': _s(getattr(src, 'wxbm', '')),
                'wxbm1': _s(getattr(src, 'wxbm1', '')),
                'ywpath': _s(getattr(src, 'ywpath', '')),
                'cgpath': _s(getattr(src, 'cgpath', '')),
                'cgbm': _s(getattr(src, 'cgbm', '')),
                'cgdq': _s(getattr(src, 'cgdq', '')),
                'ywrya': _s(getattr(src, 'ywrya', '')),
                'ywryb': _s(getattr(src, 'ywryb', '')),
                'gdry': _s(getattr(src, 'gdry', '')),
                'gdrq': _s(getattr(src, 'gdrq', '')),
                'fkxq': _s(getattr(src, 'fkxq', '')),
                'szxq': _s(getattr(src, 'szxq', '')),
                'sl': _f(getattr(src, 'sl', 0)),
                'tax': _f(getattr(src, 'tax', 0)),
                'rmbkh': rmbkh,
                'khmc': _s(getattr(cygd_row, 'khmc', '')),
                'sjcy': _s(getattr(cygd_row, 'sjcy1', '')),
                'chyrq': _s(getattr(cygd_row, 'chyrq', '')),
                'cywyzd12': cywyzd12,
                'cywyzd': new_cywyzd,
                'fpsb1': '是',
                'ywchy': '是'
            }
            copy_vals.update(row_vals)
            _set_if_has_attr(m1, copy_vals)
            s.add(m1)

            if xjhc_rid != '':
                m2 = xjhcsheet()
                m2.rid = get_uuid()
                m2.pid = xjhc_rid
                m2.uid = user.rid
                m2.ctime = now_dt
                m2.mtime = now_dt
                _set_if_has_attr(m2, copy_vals)
                s.add(m2)

        # 5) 汇总：全口径增强（含税率分桶/字符串汇总）
        agg = run_sql(
            '''
            select
                ifnull(sum(ifnull(yj,0)),0) as myjje,
                ifnull(sum(ifnull(ayj,0)),0) as ayjje,
                ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' then ifnull(gczj,0) else 0 end),0) as jxrmb,
                ifnull(sum(case when not(ifnull(chsl,0)=0 and ifnull(cpbh,'')='') then ifnull(gczj,0) else 0 end),0) as rmbche,
                ifnull(sum(case when ifnull(RMBkh,'')='是' then ifnull(mjzj,0) else 0 end),0) as mjzj1,
                ifnull(sum(case when ifnull(RMBkh,'')<>'是' then ifnull(wxzj,0) else 0 end),0) as wxje1,
                ifnull(sum(ifnull(wxzjz,0)),0) as wxjez1,
                ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' and ifnull(RMBkh,'')='是' then ifnull(mjzj,0) else 0 end),0) as jxusd1,
                ifnull(sum(case when ifnull(chsl,0)=0 and ifnull(cpbh,'')='' and ifnull(RMBkh,'')<>'是' then ifnull(wxzj,0) else 0 end),0) as jxusd,
                ifnull(sum(ifnull(ztj,0)),0) as tjhjz,
                ifnull(sum(ifnull(tse,0)),0) as ts,
                ifnull(sum(ifnull(bf,0)),0) as bfz,
                ifnull(sum(ifnull(`bf$`,0)),0) as bfmz,
                ifnull(sum(ifnull(kpfy,0)),0) as kpfyz,
                ifnull(sum(ifnull(chxs,0)),0) as xshj2,
                ifnull(sum(ifnull(chsl,0)),0) as htzsl1,
                ifnull(sum(ifnull(zmz,0)),0) as mzhj,
                ifnull(sum(ifnull(zjz,0)),0) as jzhj,
                ifnull(sum(ifnull(wxzj,0)),0) as hj,
                ifnull(sum(ifnull(tse,0)),0) as tshj,
                ifnull(sum(case when round(ifnull(sl,0),2)=0 then ifnull(wxzj,0) else 0 end),0) as hj0,
                ifnull(sum(case when round(ifnull(sl,0),2)=6 then ifnull(wxzj,0) else 0 end),0) as hj6,
                ifnull(sum(case when round(ifnull(sl,0),2)=13 then ifnull(wxzj,0) else 0 end),0) as hj13,
                ifnull(sum(case when round(ifnull(sl,0),2)=0 then ifnull(tse,0) else 0 end),0) as tshj0,
                ifnull(sum(case when round(ifnull(sl,0),2)=6 then ifnull(tse,0) else 0 end),0) as tshj6,
                ifnull(sum(case when round(ifnull(sl,0),2)=13 then ifnull(tse,0) else 0 end),0) as tshj13,
                group_concat(distinct cast(ifnull(chsl,0) as char) separator '+') as htzsl,
                group_concat(distinct cast(ifnull(chxs,0) as char) separator '+') as xshj,
                count(1) as itemsl
            from cymxsheet
            where pid=:pid
            ''',
            {'pid': father_rid}
        ) or []

        a = agg[0] if len(agg) > 0 else {}

        myjje = _f(a.get('myjje', 0))
        ayjje = _f(a.get('ayjje', 0))
        jxrmb = _f(a.get('jxrmb', 0))
        rmbche = _f(a.get('rmbche', 0))
        mjzj1 = _f(a.get('mjzj1', 0))
        wxje1 = _f(a.get('wxje1', 0))
        wxjez1 = _f(a.get('wxjez1', 0))
        jxusd1 = _f(a.get('jxusd1', 0))
        jxusd = _f(a.get('jxusd', 0))
        tjhjz = _f(a.get('tjhjz', 0))
        ts = _f(a.get('ts', 0))
        bfz = _f(a.get('bfz', 0))
        bfmz = _f(a.get('bfmz', 0))
        kpfyz = _f(a.get('kpfyz', 0))
        xshj2 = _i(a.get('xshj2', 0))
        htzsl1 = _f(a.get('htzsl1', 0))
        mzhj = _f(a.get('mzhj', 0))
        jzhj = _f(a.get('jzhj', 0))
        itemsl = _i(a.get('itemsl', 0))

        hj = _f(a.get('hj', 0))
        tshj = _f(a.get('tshj', 0))
        hj0 = _f(a.get('hj0', 0))
        hj6 = _f(a.get('hj6', 0))
        hj13 = _f(a.get('hj13', 0))
        tshj0 = _f(a.get('tshj0', 0))
        tshj6 = _f(a.get('tshj6', 0))
        tshj13 = _f(a.get('tshj13', 0))
        htzsl = _s(a.get('htzsl', ''))
        xshj = _s(a.get('xshj', ''))

        # 6) 成本总额 + 货值合计 + 毛利
        ygnlf = _f(getattr(cymx_row, 'ygnlf', 0))
        zgfy = _f(getattr(cymx_row, 'zgfy', 0))
        ckfy = _f(getattr(cymx_row, 'ckfy', 0))
        yzaf = _f(getattr(cymx_row, 'yzaf', 0))
        qtrmb = _f(getattr(cymx_row, 'qtrmb', 0))
        qthusd = _f(getattr(cymx_row, 'qtusd', 0))
        ewhj = _f(getattr(cymx_row, 'ewhj', 0))
        hyf = _f(getattr(cymx_row, 'hyf', 0))
        zkfy = _f(getattr(cymx_row, 'zkfy', 0))

        cbzje = rmbche + jxrmb + zgfy + ckfy + (ygnlf if ygnlf > 0 else yzaf) + qtrmb

        hzjx = jx1 + jx2 + jx3
        hzjix = jxj1 + jxj2 + jxj3

        if rmbkh == '是':
            htje = mjzj1 + wxje1 * hl + jxusd1 + jxusd * hl + ewhj
            htjer = mjzj1 + jxusd1 + ewhj
            htjem = wxje1 + jxusd
            lirun = htje - myjje - (hyf + bfmz) * hl - bfz - cbzje + ts - kpfyz - ayjje
            lirbl = 0 if htje == 0 else (100 * lirun / htje)
        else:
            htje = wxje1 + (mjzj1 / hl if hl != 0 else 0) + (jxusd1 / hl if hl != 0 else 0) + ewhj + jxusd
            htjer = mjzj1 + jxusd1
            htjem = wxje1 + jxusd + ewhj
            lirun = (htje - myjje - hyf - bfmz) * hl - bfz - cbzje + ts - kpfyz - ayjje * hl
            lirbl = 0 if (htje == 0 or hl == 0) else (100 * lirun / (htje * hl))

        # 7) 更新 cygd（ORM）
        cygd_update = {
            'gdzk': '完成',
            'mtime': now_dt,
            'modi_uid': user.rid,

            'itemsl': itemsl,
            'xshj2': xshj2,
            'htzsl1': htzsl1,
            'mzhj': mzhj,
            'jzhj': jzhj,

            'xshj': xshj,
            'htzsl': htzsl,
            'hj': hj,
            'tshj': tshj,
            'hj0': hj0,
            'hj6': hj6,
            'hj13': hj13,
            'tshj0': tshj0,
            'tshj6': tshj6,
            'tshj13': tshj13,

            'wxje': wxje1,
            'mjzj': mjzj1,
            'wxjez': wxjez1,

            'jxUSD': jxusd,
            'jxKHRMB': jxusd1,
            'jxRMB': jxrmb,
            'hzjx': hzjx,
            'hzjix': hzjix,

            'jxje1': jx1, 'jxje2': jx2, 'jxje3': jx3,
            'jjxje1': jxj1, 'jjxje2': jxj2, 'jjxje3': jxj3,

            'zysx': zysx,
            'qtshm': qtshm,

            'tjhj': tjhjz,
            'tszje': ts,
            'cghjzje': rmbche,
            'cbzje': cbzje,
            'htje': htje,
            'htjer': htjer,
            'htjem': htjem,

            'myjje': myjje,
            'ayjje': ayjje,
            'zkfy': zkfy,
            'hyf': hyf,
            'qtusd': qthusd,

            'lirun': lirun,
            'lirbl': lirbl
        }

        s.query(cygd).filter(cygd.rid == cygd_row.rid).update(
            _model_update_dict(cygd, cygd_update),
            synchronize_session=False
        )

        # 8) 回写 cymx 汇总（ORM）
        cymx_update = {
            'mtime': now_dt,
            'modi_uid': user.rid,

            'wxje': wxje1,
            'mjzj': mjzj1,
            'wxjez': wxjez1,
            'jxUSD': jxusd,
            'jxKHRMB': jxusd1,
            'jxRMB': jxrmb,
            'tjhj': tjhjz,
            'tszje': ts,
            'myjje': myjje,
            'ayjje': ayjje,

            'htje': htje,
            'htjer': htjer,
            'htjem': htjem,
            'cbzje': cbzje,
            'lirun': lirun,
            'lirbl': lirbl,

            'itemsl': itemsl
        }
        s.query(cymx).filter(cymx.rid == cymx_row.rid).update(
            _model_update_dict(cymx, cymx_update),
            synchronize_session=False
        )

        # 9) xjhcsheet1 重建（若存在 xjhc 主记录）
        if xjhc_rid != '':
            s.query(xjhcsheet1).filter(xjhcsheet1.pid == xjhc_rid).delete(synchronize_session=False)

            g_rows = run_sql(
                '''
                select
                    ifnull(gcmc,'') as gcmc,
                    ifnull(gdry,'') as gdry,
                    max(ifnull(gcdh,'')) as gcdh,
                    max(ifnull(cght,'')) as cght,
                    max(ifnull(ywrya,'')) as ywrya,
                    max(ifnull(wxbm1,'')) as ywbm,
                    max(ifnull(cghbdm,'')) as cghbdm,
                    sum(ifnull(gczj,0)) as gczj,
                    sum(ifnull(chsl,0)) as zsl,
                    sum(ifnull(chxs,0)) as xshj,
                    sum(ifnull(kkje,0)) as kkje,
                    sum(ifnull(zkfy1,0)) as zkfy1,
                    sum(ifnull(yfje,0)) as yfje,
                    sum(ifnull(ysqje,0)) as ysqhj,
                    group_concat(ifnull(fkxq,'') separator ';') as fkxq,
                    group_concat(ifnull(szxq,'') separator ';') as szxq
                from xjhcsheet
                where pid=:pid
                group by ifnull(gcmc,''), ifnull(gdry,'')
                ''',
                {'pid': xjhc_rid}
            ) or []

            htsh = ''
            d_htsh = run_sql("select cs from zx where ly='合同收回金额' limit 1") or []
            if len(d_htsh) > 0:
                htsh = _s(d_htsh[0].get('cs', ''))

            for gr in g_rows:
                m = xjhcsheet1()
                m.rid = get_uuid()
                m.pid = xjhc_rid
                m.uid = user.rid
                m.ctime = now_dt
                m.mtime = now_dt

                tmp = {
                    'gcmc': _s(gr.get('gcmc', '')),
                    'gdry': _s(gr.get('gdry', '')),
                    'gcdh': _s(gr.get('gcdh', '')),
                    'cght': _s(gr.get('cght', '')) if _s(gr.get('cght', '')) != '' else '无',
                    'gczj': _f(gr.get('gczj', 0)),
                    'ywrya': _s(gr.get('ywrya', '')) if _s(gr.get('ywrya', '')) != '' else '无',
                    'ywbm': _s(gr.get('ywbm', '')) if _s(gr.get('ywbm', '')) != '' else '无',
                    'cghbdm': _s(gr.get('cghbdm', '')),
                    'zsl': _f(gr.get('zsl', 0)),
                    'xshj': _f(gr.get('xshj', 0)),
                    'kkje': _f(gr.get('kkje', 0)),
                    'zkfy1': _f(gr.get('zkfy1', 0)),
                    'yfje': _f(gr.get('yfje', 0)),
                    'ysqhj': _f(gr.get('ysqhj', 0)),
                    'fkxq': _s(gr.get('fkxq', '')),
                    'szxq': _s(gr.get('szxq', '')),
                    'yfhj': int(_f(gr.get('zsl', 0)) // 10 * 10),
                    'yhfy': _f(gr.get('gczj', 0)),
                    'tqfk': '否'
                }

                dq = ''
                if tmp['gdry'] != '':
                    d_dq = run_sql(
                        'select dq from ywrylx where ryxm=:ryxm limit 1',
                        {'ryxm': tmp['gdry']}
                    ) or []
                    if len(d_dq) > 0:
                        dq = _s(d_dq[0].get('dq', ''))
                tmp['dq'] = dq

                if htsh != '' and _f(tmp['gczj']) >= _f(htsh):
                    tmp['htsh'] = '待收回'
                else:
                    tmp['htsh'] = '不需要'

                _set_if_has_attr(m, tmp)
                s.add(m)

        # 10) 待办清理（完成后不再挂审批待办）
        r_del = user_task_delete('出运改单', cygd_row.rid, s, [])
        if r_del.get('code') != 1:
            s.rollback()
            return json_result(-1, r_del.get('msg', '删除待办失败'))

        # 11) 发送完成通知给经办
        if jbry != '' and jbry != user.username:
            row_msg = {
                'xxly': '出运改单',
                'xxnr': '出运改单:' + fkbh + '已完成更新,日期:' + today,
                'jsr': jbry,
                'spsq': jbry
            }
            r_msg = module_xxck_new([row_msg], user, s)
            if r_msg.get('code') != 1:
                s.rollback()
                return json_result(-1, r_msg.get('msg', '发送消息失败'))

        s.commit()

        patch = {
            '改单状况': '完成',
            '更改后数据.明佣合计.': myjje,
            '更改后数据.暗佣合计.': ayjje,
            '更改后数据.人民币出货额.': rmbche,
            '更改后数据.外销总额': wxje1,
            '更改后数据.客户RMB总价': mjzj1,
            '更改后数据.外销总额总': wxjez1,
            '更改后数据.加项USD': jxusd,
            '更改后数据.加项客户RMB': jxusd1,
            '更改后数据.加项RMB': jxrmb,
            '更改后数据.体积合计': tjhjz,
            '更改后数据.退税总额.': ts,
            '更改后数据.成本总额.': cbzje,
            '更改后数据.货值合计.': htje,
            '更改后数据.货值合计￥.': htjer,
            '更改后数据.货值合计$.': htjem,
            '更改后数据.核算毛利.': lirun,
            '更改后数据.毛 利 率.': lirbl
        }

        return json_result(1, '处理成功', {
            'patch': patch,
            'row_patch': row_patch,
            'cy_rid': _s(cymx_row.rid)
        })
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/shipment_amendment/field/cgry/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_cgry_change(request):
    try:
        j = await request.json()
        cgry = str(j.get('cgry', '') or '').strip()

        uv = ''
        org1 = get_user_path('zjnblh')
        postion1 = org1.get('position', '')

        if postion1 != '':
            pos = str(postion1)
            if pos[:1] == 'D':
                uv = '1'

        data = {
            'uv': uv,
            'cgbm': '',
            'cgdq': '',
            'cgpath': ''
        }

        if cgry != '':
            d1 = run_sql(
                'select bm,ssdq from ywrybiao where yhm=:yhm',
                {'yhm': cgry}
            ) or []
            if len(d1) > 0:
                data['cgbm'] = str(d1[0].get('bm', '') or '')
                if uv != '1':
                    ssdq = str(d1[0].get('ssdq', '') or '')
                    data['cgdq'] = '义乌' if ssdq == '义乌' else '宁波'

            org2 = get_user_path(cgry)
            path2 = org2.get('path','')
            if path2 != '':
                p = str(path2)
                data['cgpath'] = p[:100]

        return json_result(1, 'ok', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/shipment_amendment/field/ywry/change', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_field_ywry_change(request):
    try:
        j = await request.json()
        ywry = str(j.get('ywry', '') or '').strip()

        data = {
            'wxbm': '',
            'ywpath': ''
        }

        if ywry != '':
            d1 = run_sql(
                'select bm from ywrybiao where yhm=:yhm',
                {'yhm': ywry}
            ) or []
            if len(d1) > 0:
                data['wxbm'] = str(d1[0].get('bm', '') or '')

            
            org1 = get_user_path(ywry)
            path1 = org1.get('path','')
            if path1 != '':
                p = str(path1)
                data['ywpath'] = p[:-1] if len(p) > 0 else ''  # Pascal: copy(path,1,Length(path)-1)

        return json_result(1, 'ok', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/shipment_amendment/button/unlock_tjdz', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_button_unlock_tjdz(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = str(j.get('fkbh', '') or '').strip()
        fphm = str(j.get('fphm', '') or '').strip()
        jbry = str(j.get('jbry', '') or '').strip()

        # Pascal: 仅经办人员本人可触发
        if jbry != user.username:
            return json_result(0, '仅经办人员本人可操作')

        # Pascal: 申请编号为空提示“请先保存”
        if fkbh == '':
            return json_result(0, '请先保存!')

        # 1) 取 cymx.zdry
        spsq = ''
        d_cymx = run_sql(
            'select zdry from cymx where fphm=:fphm limit 1',
            {'fphm': fphm}
        ) or []
        if len(d_cymx) > 0:
            spsq = str(d_cymx[0].get('zdry', '') or '').strip()

        # 2) 校验是否单证人员
        sb = ''
        if spsq != '':
            d_role = run_sql(
                'select rid from ywrybiao where yhm=:yhm and zw like :zw limit 1',
                {'yhm': spsq, 'zw': '%单证%'}
            ) or []
            if len(d_role) > 0:
                sb = '1'

        if sb != '1':
            return json_result(0, '此人非单证人员或无此发票号，请重新选择!')

        # 3) 主记录（Pascal number -> 迁移为 rid）
        st_rid = ''
        d_cygd = run_sql(
            'select rid from cygd where fkbh=:fkbh limit 1',
            {'fkbh': fkbh}
        ) or []
        if len(d_cygd) > 0:
            st_rid = str(d_cygd[0].get('rid', '') or '').strip()

        # Pascal stnumber>0 时才写 sys_alarm；迁移后 rid 存在才写待办
        if st_rid != '':
            # 删除旧待办
            r_del = user_task_delete('出运改单', st_rid, s, [])
            if r_del.get('code') != 1:
                s.rollback()
                return json_result(-1, r_del.get('msg', '删除待办失败'))

            today = time.strftime('%Y-%m-%d')
            subject = jbry + '的出运改单:' + fkbh + '需解锁,日期:' + today

            # 新建待办给单证人员
            r_new = user_task_new(
                '出运改单',
                st_rid,
                '申请编号',
                '出运改单[申请编号]需解锁',
                subject,
                user,
                s,
                [spsq],
                True
            )
            if r_new.get('code') != 1:
                s.rollback()
                return json_result(-1, r_new.get('msg', '创建待办失败'))

        s.commit()
        return json_result(1, '提交单证解锁成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_amendment/button/update_info/query', methods=['POST'])
@require_token
async def view_saier_shipment_amendment_button_update_info_query(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        jbry = str(j.get('jbry', '') or '').strip()
        rows = j.get('rows', []) or []

        # Pascal 是外层判断，非经办人不处理；接口层仍保留安全校验
        if jbry != user.username:
            return json_result(0, '仅经办人员本人可操作')

        result_rows = []

        for r in rows:
            row_index = int(r.get('row_index', 0) or 0)
            wxwyzd = str(r.get('wxwyzd', '') or '').strip()
            wxht = str(r.get('wxht', '') or '').strip()
            bjhh = str(r.get('bjhh', '') or '').strip()
            khhh = str(r.get('khhh', '') or '').strip()
            zyhh = str(r.get('zyhh', '') or '').strip()
            cght = str(r.get('cght', '') or '').strip()

            if zyhh == '':
                if bjhh != '':
                    zyhh = bjhh
                else:
                    zyhh = '无货号'

            item = {
                'row_index': row_index,
                'cghtsheet': None,
                'wxhtsheet': None,
                'cght': None,
                'wxpd': '',
                'wxht_rid': ''
            }

            # 分支A：有外销唯一字段 + 有采购合同
            if wxwyzd != '' and cght != '':
                d_cghtsheet = run_sql(
                    '''select cgjg,pkRMB,mjdj1,zzsl,zhwbgpm,jcsj,wxrl,Twxdj,wxdj,sl,xddd,hyd
                       from cghtsheet
                       where wxwyzd=:wxwyzd and hthm=:hthm
                       order by sid desc limit 1''',
                    {'wxwyzd': wxwyzd, 'hthm': cght}
                ) or []
                if len(d_cghtsheet) > 0:
                    item['cghtsheet'] = d_cghtsheet[0]

                d_wxhtsheet = run_sql(
                    '''select Twxdj,wxdj,jldw,yjcq,mjdj1,cply1,pkrmb as pkRMB,dkje,dkds,yjbl,yj,sj,khpd,
                              htsl,aybl,asl6,ayj,sl6,krddh,sfsq,mdck,wxwyzd
                       from wxhtsheet where wxwyzd=:wxwyzd limit 1''',
                    {'wxwyzd': wxwyzd}
                ) or []
                if len(d_wxhtsheet) > 0:
                    item['wxhtsheet'] = d_wxhtsheet[0]
                else:
                    item['wxpd'] = '1'

                d_cght = run_sql(
                    '''select sccj,sccj1,jsfs
                       from cght where hthm=:hthm limit 1''',
                    {'hthm': cght}
                ) or []
                if len(d_cght) > 0:
                    item['cght'] = d_cght[0]

            # 分支B：无外销唯一字段 + 有采购合同
            elif wxwyzd == '' and cght != '':
                d_cghtsheet2 = run_sql(
                    '''select cgjg,pkRMB,mjdj1,zzsl,zhwbgpm,jcsj,wxrl,Twxdj,wxdj,sl,xddd,hyd
                       from cghtsheet
                       where hthm=:hthm and (bjhh=:a or cpbh=:b or khhh=:c)
                       order by sid desc limit 1''',
                    {'hthm': cght, 'a': zyhh, 'b': bjhh, 'c': bjhh}
                ) or []
                if len(d_cghtsheet2) > 0:
                    item['cghtsheet'] = d_cghtsheet2[0]

                d_wxht = run_sql(
                    'select rid from wxht where order_id=:order_id limit 1',
                    {'order_id': wxht}
                ) or []
                if len(d_wxht) > 0:
                    item['wxht_rid'] = str(d_wxht[0].get('rid', '') or '')

                if item['wxht_rid'] != '':
                    d_wxhtsheet2 = run_sql(
                        '''select Twxdj,wxdj,jldw,yjcq,mjdj1,cply1,pkrmb as pkRMB,dkje,dkds,yjbl,yj,sj,khpd,
                                  htsl,aybl,asl6,ayj,sl6,krddh,sfsq,mdck,wxwyzd
                           from wxhtsheet
                           where pid=:pid and (bjhh=:a or cpbh=:b or khhh=:c)
                           limit 1''',
                        {'pid': item['wxht_rid'], 'a': zyhh, 'b': bjhh, 'c': bjhh}
                    ) or []
                    if len(d_wxhtsheet2) > 0:
                        item['wxhtsheet'] = d_wxhtsheet2[0]

                d_cght2 = run_sql(
                    '''select sccj,sccj1,jsfs
                       from cght where hthm=:hthm limit 1''',
                    {'hthm': cght}
                ) or []
                if len(d_cght2) > 0:
                    item['cght'] = d_cght2[0]

            # 分支C：wxpd=1 时补查（Pascal 末段）
            if item['wxpd'] == '1':
                if item['wxht_rid'] == '':
                    d_wxht3 = run_sql(
                        'select rid from wxht where order_id=:order_id limit 1',
                        {'order_id': wxht}
                    ) or []
                    if len(d_wxht3) > 0:
                        item['wxht_rid'] = str(d_wxht3[0].get('rid', '') or '')

                if item['wxht_rid'] != '':
                    d_wxhtsheet3 = run_sql(
                        '''select Twxdj,wxdj,jldw,yjcq,mjdj1,cply1,pkrmb as pkRMB,dkje,dkds,yjbl,yj,sj,khpd,
                                  htsl,aybl,asl6,ayj,sl6,krddh,sfsq,mdck,wxwyzd
                           from wxhtsheet
                           where pid=:pid and (bjhh=:a or cpbh=:b or khhh=:c)
                           limit 1''',
                        {'pid': item['wxht_rid'], 'a': zyhh, 'b': bjhh, 'c': bjhh}
                    ) or []
                    if len(d_wxhtsheet3) > 0:
                        item['wxhtsheet'] = d_wxhtsheet3[0]

                # Pascal 的 wxpd=1 分支末段还会再查 cght
                d_cght3 = run_sql(
                    '''select sccj,sccj1,jsfs
                       from cght where hthm=:hthm limit 1''',
                    {'hthm': cght}
                ) or []
                if len(d_cght3) > 0:
                    item['cght'] = d_cght3[0]

            result_rows.append(item)

        return json_result(1, '查询成功', {'rows': result_rows})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()