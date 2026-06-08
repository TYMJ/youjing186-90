from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


@any_route('/api/saier/forwarder_expense/ywsp/check', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_ywsp_check(request):
    """
    货代费用.业务审批.change 校验
    Pascal口径：
      zx.ly='货代费用审批' and zx.wb1=业务审批人
      有记录 -> 业务1='1'
      无记录 -> 提示无权限并清空业务审批/业务1
    """
    j = await request.json()
    sh = j.get('sh','')  # 业务审批
    try:
        # 业务审批为空：仅清空业务1
        if sh == '':
            return json_result(1, 'ok', {"pass": 0, "clear_sh": 0, "yw1": ""})

        r = run_sql(f"select rid from zx where ly='货代费用审批' and wb1='{sh}' limit 1")
        if len(r) > 0:
            return json_result(1, 'ok', {"pass": 1, "clear_sh": 0, "yw1": "1"})
        else:
            return json_result(1, 'ok', {"pass": 0, "clear_sh": 1, "yw1": ""})
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())

@any_route('/api/saier/forwarder_expense/dzsp/check', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_dzsp_check(request):
    """
    货代费用.单证审批.change
    Pascal对齐:
    - sh!=空 且 指定货代!=空 -> 校验 zx(ly='货代费用审批', wb2=sh)
      - 有权限: 单证1='1'
      - 无权限: 提示无单证审核权限，清空 单证审批/单证1
    - 否则:
      - 若指定货代为空: 提示请输入指定货代
      - 清空 单证审批/业务审批/单证1
    """
    j = await request.json()
    sh = j.get('sh','')
    zdhd = j.get('zdhd','')  # 指定货代
    try:
        data = {"pass": 0}
        if sh != '' and zdhd != '':
            r = run_sql(f"select rid from zx where (ly='货代费用审批') and (wb2='{sh}')")
            if len(r) > 0:
                data["pass"] = 1

        return json_result(1, 'ok', data)
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/forwarder_expense/fphm/change', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_fphm_change(request):
    """
    货代费用.发票号码.change
    Pascal口径：
      ckzgfy where wxfp=:发票号码 and ywsp='通过'
      返回可引入到“相关杂费”的数据
    """
    j = await request.json()
    fphm = str(j.get('fphm', '')).strip()
    try:
        data = {"rows": []}
        if fphm == '':
            return json_result(1, 'ok', data)

        rows = run_sql(f"select sqdh, zgfy from ckzgfy where wxfp='{fphm}' and ywsp='通过'", {})
        if len(rows) == 0:
            return json_result(1, 'ok', data)
        
        data = {"rows": rows}

        return json_result(1, 'ok', data)
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/forwarder_expense/xgzf/change/check', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_xgzf_change_check(request):
    """
    相关杂费字段变更校验：
    - 若被他人核对且有唯一字段，则回查 hdfysheet 快照用于前端回滚
    """
    try:
        j = await request.json()
        wyzd = j.get('wyzd','')
        if wyzd == '':
            return json_result(1, 'ok', {"locked": 0, "row": {}})

        rows = run_sql(f"select FORMfy,JGDsjf,ckmc,ckfy,jcfy,zfmc,qtzf,hdsj from hdfy sheetwhere wyzd='{wyzd}' limit 1")

        if len(rows) == 0:
            return json_result(1, 'ok', {"locked": 0, "row": {}})

        r = rows[0]
        return json_result(1, 'ok', {"locked": 1,"row": r})
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/forwarder_expense/load/check', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_load_check(request):
    """
    货代费用 afterload/afterempty 元数据（不处理记录锁）
    """
    j = await request.json()
    user = request.current_user
    username = str(getattr(user, 'username', '') or '')
    try:
        data = {
            'wb1_list': [],
            'wb2_list': [],
            'cwck': 0,          # 财务
            'dzzk': 0,          # 单证
            'hide_special': 0   # 单证查验角色隐藏组
        }

        r1 = run_sql(f"select wb1 as v from zx where ly='货代费用审批' and ifnull(wb1,'') <>'' group by wb1")
        data['wb1_list'] = [str(x.get('v', '')) for x in r1 if str(x.get('v', '')).strip() != '']

        r2 = run_sql(f"select wb2 as v from zx where ly='货代费用审批' and ifnull(wb2,'')<>'' group by wb2")
        data['wb2_list'] = [str(x.get('v', '')) for x in r2 if str(x.get('v', '')).strip() != '']
        
        org = get_user_path(user.username)
        postion = org.get('position', '')
        if '财务' in postion:
            data['cwck'] = 1

        if '单证' in postion:
            data['dzzk'] = 1

        rh = run_sql(f"select rid from zx where ly='单证查验'and :u in (ifnull(wb1,''),ifnull(wb2,''),ifnull(wb3,''),ifnull(wb4,''),ifnull(wb5,''), \
            ifnull(wb6,''),ifnull(wb7,''),ifnull(wb8,''),ifnull(wb9,''),ifnull(wb10,'')) limit 1", {'u': username}) or []
        if len(rh) > 0:
            data['hide_special'] = 1

        return json_result(1, '查询成功', data)
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/forwarder_expense/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_forwarder_expense_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        def _f(v):
            try:
                return float(v or 0)
            except:
                return 0.0

        def _s(v):
            return str(v or '')

        def _msg(jsr, xxnr):
            if _s(jsr) == '' or _s(jsr) == user.username:
                return {'code': 1}
            row = {
                "xxly": '货代费用',
                "bjdh": "",
                "wxht": "",
                "cght": "",
                "yhdh": "",
                "xxnr": xxnr,
                "jsr": jsr,
                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
            }
            return module_xxck_new([row], user, s)

        rid = _s(j.get('rid', ''))
        fphm = _s(j.get('fphm', ''))
        sz = _s(j.get('sz', ''))
        wz = _s(j.get('wz', ''))
        khmc = _s(j.get('khmc', ''))
        cydt = _s(j.get('cydt', ''))
        hznf = _s(j.get('hznf', ''))
        zjhy = _f(j.get('zjhy', 0))
        zfy = _f(j.get('zfy', 0))
        zfhj = _f(j.get('zfhj', 0))
        hdxq_list = j.get('hdxq_list', []) or []
        xgzf_list = j.get('xgzf_list', []) or []
        sp = j.get('sp', {}) or {}

        if hznf == '' and cydt != '':
            hznf = cydt[:4]

        # 1) fpgl 更新
        s.query(fpgl).filter(
            or_(fpgl.wxfp == fphm, fpgl.hsfp == fphm),
            fpgl.sfjd == '否'
        ).update({'webpdfy': '是'}, synchronize_session=False)

        # 2) 价格单费用建议
        append_xgzf = None
        if len(xgzf_list) == 0 and wz.isdigit() and ('BEST PRICE LLC' in khmc):
            d = run_sql("select jgdfy from ywbdzb where dyywzm=:dyywzm limit 1", {'dyywzm': sz})
            if len(d) > 0 and _f(d[0].get('jgdfy', 0)) > 0:
                jgdfy = _f(d[0].get('jgdfy', 0))
                append_xgzf = {
                    '杂费名称': '价格单费用',
                    '价 格 单': jgdfy,
                    '费用合计': jgdfy,
                    '唯一字段': '1:' + user.username + datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }

        # 3) cymx/cymxsheet（强制 rid 链路）
        cy = s.query(cymx).filter(cymx.fphm == fphm).first()
        if cy:
            cy_rid = _s(getattr(cy, 'rid', ''))
            rmbkh = _s(getattr(cy, 'RMBkh', ''))
            huilv = _f(getattr(cy, 'huilv', 0))
            qtusd = _f(getattr(cy, 'qtusd', 0))
            jxusd = _f(getattr(cy, 'jxUSD', 0))
            ckfy = _f(getattr(cy, 'ckfy', 0))
            cghjzje = _f(getattr(cy, 'cghjzje', 0))
            zgfy = _f(getattr(cy, 'zgfy', 0))
            yzaf_old = _f(getattr(cy, 'yzaf', 0))
            jxrmb = _f(getattr(cy, 'jxRMB', 0))
            qtrmb = _f(getattr(cy, 'qtrmb', 0))
            kpfyz = _f(getattr(cy, 'kpfyz', 0))
            htje = _f(getattr(cy, 'htje', 0))
            myjje = _f(getattr(cy, 'myjje', 0))
            bf = _f(getattr(cy, 'bf', 0))
            bfs = _f(getattr(cy, 'bf$', 0))
            tszje = _f(getattr(cy, 'tszje', 0))
            ayjje = _f(getattr(cy, 'ayjje', 0))
            zmyhl = _f(getattr(cy, 'zmyhl', 0))
            wxjez = _f(getattr(cy, 'wxjez', 0))

            if rmbkh == '是':
                hyfz = zjhy + qtusd - (jxusd / huilv if huilv != 0 else 0)
            else:
                hyfz = zjhy + qtusd

            cbzje = cghjzje + ckfy + zgfy + zfy + yzaf_old + jxrmb + qtrmb + kpfyz

            lirun, lirbl = 0.0, 0.0
            if rmbkh == '是':
                lirun = (htje - myjje - zjhy * huilv) - bfs * huilv - bf - cghjzje - ckfy + tszje - zgfy - ayjje - jxrmb - qtrmb - zfy
                if htje != 0:
                    lirbl = 100 * lirun / htje
            else:
                lirun = ((htje - zjhy - myjje) * zmyhl - bfs) * huilv - cghjzje - ckfy + tszje - zgfy - jxrmb - qtrmb - zfy - bf - ayjje * zmyhl * huilv
                if (htje * huilv * zmyhl) != 0:
                    lirbl = 100 * (lirun / (htje * huilv))

            usdjee = wxjez - zjhy - qtusd

            s.query(cymx).filter(cymx.rid == cy_rid).update({
                'zfhj': zfhj,
                'hyf': zjhy,
                'yzaf': zfy,
                'usdjee': usdjee,
                'cbzje': cbzje,
                'lirun': lirun,
                'lirbl': lirbl
            }, synchronize_session=False)

            # pid是对的
            ds = []

            # ds = s.query(cymxsheet.rid, cymxsheet.tjbl).filter(cymxsheet.pid == cy_rid).all()
            # for r in ds:
            #     s.query(cymxsheet).filter(cymxsheet.rid == _s(r.rid)).update({
            #         'fpfy$': hyfz * _f(r.tjbl)
            #     }, synchronize_session=False)

        # 4) cdhz 补齐
        def ensure_cdhz(cdmc):
            cdmc = _s(cdmc)
            if cdmc == '' or hznf == '':
                return
            ex = run_sql("select 1 from cdhz where cdmc=:cdmc and hznf=:hznf limit 1", {'cdmc': cdmc, 'hznf': hznf})
            if len(ex) == 0:
                obj = cdhz()
                obj.rid = get_uuid()
                obj.ctime = datetime.now()
                obj.uid = user.rid
                obj.cdmc, obj.hznf = cdmc, hznf
                obj.zdcs = obj.zlcs = obj.dbcs = obj.qtcs = obj.cjcs = 0
                s.add(obj)

        ensure_cdhz(j.get('zdhd', ''))
        ensure_cdhz(j.get('zlhd', ''))
        ensure_cdhz(j.get('dbhd', ''))
        ensure_cdhz(j.get('sjhd', ''))
        for row in hdxq_list:
            ensure_cdhz(row.get('货代名称', '') or row.get('hdmc', ''))

        # 5) hdfy rid（替代旧 number）
        st_rid = ''
        d_h = run_sql("select rid from hdfy where fphm=:fphm limit 1", {'fphm': fphm})
        if len(d_h) > 0:
            st_rid = _s(d_h[0].get('rid', ''))

        zdr = _s(sp.get('zdr', ''))

        first_round = [
            (sp.get('yw1','')!='' and sp.get('dzsp','')==user.username and sp.get('dzqr','')=='通过', sp.get('ywsp',''), f'发票号码:{fphm}货代费用需审核(指定货代业务)', 'fytj'),
            (sp.get('dz1','')!='' and zdr==user.username and sp.get('dzqr','')=='', sp.get('dzsp',''), f'发票号码:{fphm}货代费用需审核(指定货代单证)', ''),
            (sp.get('yw2','')!='' and sp.get('dzsp1','')==user.username and sp.get('dzqr1','')=='通过', sp.get('ywsp1',''), f'发票号码:{fphm}货代费用需审核(自拉自报业务)', 'ywsp1'),
            (sp.get('dz2','')!='' and zdr==user.username and sp.get('dzqr1','')=='', sp.get('dzsp1',''), f'发票号码:{fphm}货代费用需审核(自拉自报单证)', ''),
            (sp.get('yw3','')!='' and sp.get('dzsp2','')==user.username and sp.get('dzqr2','')=='通过', sp.get('ywsp2',''), f'发票号码:{fphm}货代费用需审核(单报关业务)', 'ywsp2'),
            (sp.get('dz3','')!='' and zdr==user.username and sp.get('dzqr2','')=='', sp.get('dzsp2',''), f'发票号码:{fphm}货代费用需审核(单报关单证)', ''),
            (sp.get('yw4','')!='' and sp.get('dzsp3','')==user.username and sp.get('dzqr3','')=='通过', sp.get('ywsp3',''), f'发票号码:{fphm}货代费用需审核(特报费用业务)', 'ywsp3'),
            (sp.get('dz4','')!='' and zdr==user.username and sp.get('dzqr3','')=='', sp.get('dzsp3',''), f'发票号码:{fphm}货代费用需审核(特报费用单证)', ''),
            (sp.get('yw5','')!='' and sp.get('dzsp4','')==user.username and sp.get('dzqr4','')=='通过', sp.get('ywsp4',''), f'发票号码:{fphm}货代费用需审核(商检费用业务)', 'ywsp4'),
            (sp.get('dz5','')!='' and zdr==user.username and sp.get('dzqr4','')=='', sp.get('dzsp4',''), f'发票号码:{fphm}货代费用需审核(商检费用单证)', '')
        ]
        
        _hdfy_cols = {'fytj', 'ywsp1', 'ywsp2', 'ywsp3', 'ywsp4'}

        for cond, sh, xxnr, hdfy_field in first_round:
            sh = _s(sh)
            if not cond or sh == '':
                continue

            if hdfy_field in _hdfy_cols:
                col = getattr(hdfy, hdfy_field)
                s.query(hdfy).filter(hdfy.fphm == fphm).update(
                    {col: sh},
                    synchronize_session=False
                )

            r = _msg(sh, xxnr)
            if r.get('code', -1) != 1:
                s.rollback()
                return json_result(-1, r.get('msg', '消息失败'))

            if st_rid != '':
                user_task_delete('货代费用', rid, s, [])
                user_task_new('货代费用', rid, '发票号码', '[审批]'+xxnr, user, s, [sh])

        second_round = [
            (sp.get('ywqf','')!='' and sp.get('ywsp','')==user.username, sp.get('ywqr',''), sp.get('ywbth',''), f'发票号码:{fphm}货代费用需审核(指定货代业务)', f'发票号码:{fphm}指定货代费用业务确认', f'发票号码:{fphm}指定货代费用业务不确认,原因'),
            (sp.get('dzqf','')!='' and sp.get('dzsp','')==user.username, sp.get('dzqr',''), sp.get('dzbth',''), f'发票号码:{fphm}货代费用需审核(指定货代单证)', f'发票号码:{fphm}指定货代费用单证确认', f'发票号码:{fphm}指定货代费用单证不确认,原因'),
            (sp.get('ywqf2','')!='' and sp.get('ywsp1','')==user.username, sp.get('ywqr1',''), sp.get('ywbth2',''), f'发票号码:{fphm}货代费用需审核(自拉自报业务)', f'发票号码:{fphm}自拉货代费用业务确认', f'发票号码:{fphm}自拉货代费用业务不确认,原因'),
            (sp.get('dzqf2','')!='' and sp.get('dzsp1','')==user.username, sp.get('dzqr1',''), sp.get('dzbth2',''), f'发票号码:{fphm}货代费用需审核(自拉自报单证)', f'发票号码:{fphm}自拉货代费用单证确认', f'发票号码:{fphm}自拉货代费用单证不确认,原因'),
            (sp.get('ywqf3','')!='' and sp.get('ywsp2','')==user.username, sp.get('ywqr2',''), sp.get('ywbth3',''), f'发票号码:{fphm}货代费用需审核(单报关业务)', f'发票号码:{fphm}单报关货代费用业务确认', f'发票号码:{fphm}单报关货代费用业务不确认,原因'),
            (sp.get('dzqf3','')!='' and sp.get('dzsp2','')==user.username, sp.get('dzqr2',''), sp.get('dzbth3',''), f'发票号码:{fphm}货代费用需审核(单报关单证)', f'发票号码:{fphm}单报关货代费用单证确认', f'发票号码:{fphm}单报关货代费用单证不确认,原因'),
            (sp.get('ywqf4','')!='' and sp.get('ywsp3','')==user.username, sp.get('ywqr3',''), sp.get('ywbth4',''), f'发票号码:{fphm}货代费用需审核(特报费用业务)', f'发票号码:{fphm}特报费用业务确认', f'发票号码:{fphm}特报费用业务不确认,原因'),
            (sp.get('dzqf4','')!='' and sp.get('dzsp3','')==user.username, sp.get('dzqr3',''), sp.get('dzbth4',''), f'发票号码:{fphm}货代费用需审核(特报费用单证)', f'发票号码:{fphm}特报费用单证确认', f'发票号码:{fphm}特报费用单证不确认,原因'),
            (sp.get('ywqf5','')!='' and sp.get('ywsp4','')==user.username, sp.get('ywqr4',''), sp.get('ywbth5',''), f'发票号码:{fphm}货代费用需审核(商检费用业务)', f'发票号码:{fphm}商检费用业务确认', f'发票号码:{fphm}商检费用业务不确认,原因'),
            (sp.get('dzqf5','')!='' and sp.get('dzsp4','')==user.username, sp.get('dzqr4',''), sp.get('dzbth5',''), f'发票号码:{fphm}货代费用需审核(商检费用单证)', f'发票号码:{fphm}商检费用单证确认', f'发票号码:{fphm}商检费用单证不确认,原因')
        ]

        for cond, qr, yy, xxnr1, ok_msg, ng_prefix in second_round:
            if not cond:
                continue
            sh = zdr
            xxnr = ok_msg if _s(qr) == '通过' else (ng_prefix + _s(yy))
            r = _msg(sh, xxnr)
            if r.get('code', -1) != 1:
                s.rollback()
                return json_result(-1, r.get('msg', '消息失败'))
            if st_rid != '':
                user_task_delete('货代费用', rid, s, [])

        s.commit()
        return json_result(1, '保存前处理成功', {'hznf': hznf, 'append_xgzf': append_xgzf})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/forwarder_expense/button/cwqr', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_button_cwqr(request):
    s = Session()
    user = request.current_user
    try:
        j = await request.json()

        def _s(v):
            return str(v or '').strip()

        def _f(v):
            try:
                return float(v or 0)
            except:
                return 0.0

        fphm = _s(j.get('fphm'))
        sb1 = _s(j.get('sb1'))
        tp = _s(j.get('tp'))
        if tp not in ['1', '2', '3', '4', '5']:
            tp = '6'

        if fphm == '':
            return json_result(-1, '发票号码不能为空')

        # Pascal: sb1=1 时不处理
        if sb1 == '1':
            return json_result(1, '无需处理', {'xx': '', 'patches': []})

        # 财务岗位校验
        org = get_user_path(user.username)
        postion = org.get('position', '')
        if '财务' not in postion:
            return json_result(-1, '当前用户非财务岗位，不能执行财务确认')

        today = datetime.now().strftime('%Y-%m-%d')
        patches = []
        lines = []

        zd = j.get('zd', {}) or {}
        zl = j.get('zl', {}) or {}
        db = j.get('db', {}) or {}
        tb = j.get('tb', {}) or {}
        sj = j.get('sj', {}) or {}

        if tp in ['1', '6'] and _s(zd.get('dzqr')) == '通过' and _s(zd.get('ywqr')) == '通过':
            patches.append({'table': '指定货代', 'field': '财务确认', 'value': today})
            lines.append(f"指定货代:￥{_f(zd.get('nl'))}/${_f(zd.get('hy'))};{today}")

        if tp in ['2', '6'] and _s(zl.get('ywqr')) == '通过' and _s(zl.get('dzqr')) == '通过':
            patches.append({'table': '自拉自报', 'field': '自财务确认', 'value': today})
            lines.append(f"自拉自报:￥{_f(zl.get('nl'))}/${_f(zl.get('hy'))};{today}")

        if tp in ['3', '6'] and _s(db.get('ywqr')) == '通过' and _s(db.get('dzqr')) == '通过':
            patches.append({'table': '单报关', 'field': '单财务确认', 'value': today})
            lines.append(f"单报关:￥{_f(db.get('nl'))}/${_f(db.get('hy'))};{today}")

        if tp in ['4', '6'] and _s(tb.get('ywqr')) == '通过' and _s(tb.get('dzqr')) == '通过':
            patches.append({'table': '特报费用', 'field': '特财务确认', 'value': today})
            lines.append(f"特报费用:￥{_f(tb.get('je'))};{today}")

        if tp in ['5', '6'] and _s(sj.get('ywqr')) == '通过' and _s(sj.get('dzqr')) == '通过':
            patches.append({'table': '商检费用', 'field': '商财务确认', 'value': today})
            lines.append(f"商检费用:￥{_f(sj.get('je'))};{today}")

        xx = ''.join([f"\r\n{line}" for line in lines])

        # Pascal: 立即写 fpgl.hdfyxq
        s.query(fpgl).filter(
            or_(fpgl.wxfp == fphm, fpgl.hsfp == fphm)
        ).update({'hdfyxq': xx}, synchronize_session=False)

        s.commit()
        return json_result(1, '处理成功', {'xx': xx, 'patches': patches})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/forwarder_expense/button/cw_plqr', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_button_cw_plqr(request):
    s = Session()
    user = request.current_user
    try:
        j = await request.json()

        def _s(v):
            return str(v or '').strip()

        def _f(v):
            try:
                return float(v or 0)
            except:
                return 0.0

        tp = _s(j.get('tp', '6'))
        if tp not in ['1', '2', '3', '4', '5']:
            tp = '6'

        rids = j.get('rids', []) or []
        rids = list(dict.fromkeys([_s(x) for x in rids if _s(x) != '']))
        if len(rids) == 0:
            return json_result(-1, '请先选择要操作的记录')

        # 财务权限
        org = get_user_path(user.username)
        postion = org.get('position', '')
        if '财务' not in postion:
            return json_result(-1, '当前用户非财务岗位，不能执行财务确认')

        rows = s.query(hdfy).filter(hdfy.rid.in_(rids)).all()
        if len(rows) == 0:
            return json_result(-1, '未找到可处理记录')

        today = datetime.now().strftime('%Y-%m-%d')
        count = 0

        for row in rows:
            rid = _s(getattr(row, 'rid', ''))
            fphm = _s(getattr(row, 'fphm', ''))

            # Pascal: xx = 旧cwqrqk + 换行 + 总计费用
            xx = _s(getattr(row, 'cwqrqk', '')) + '\r\n' + f"总计费用:￥{_f(getattr(row, 'zjfy', 0))}{today}"

            upd = {}

            # 1 指定
            if tp in ['1', '6'] and _s(getattr(row, 'dzqr', '')) == '通过' and _s(getattr(row, 'ywqr', '')) == '通过':
                upd['cwqr'] = today
                xx += '\r\n' + f"指定货代费用:￥{_f(getattr(row, 'hjnl', 0))}/${_f(getattr(row, 'hjhy', 0))};{today}"

            # 2 自拉
            if tp in ['2', '6'] and _s(getattr(row, 'ywqr1', '')) == '通过' and _s(getattr(row, 'dzqr1', '')) == '通过':
                upd['zcwqr'] = today
                xx += '\r\n' + f"自拉自报:￥{_f(getattr(row, 'hjnl1', 0))}/${_f(getattr(row, 'hjhy1', 0))};{today}"

            # 3 单报关
            if tp in ['3', '6'] and _s(getattr(row, 'ywqr2', '')) == '通过' and _s(getattr(row, 'dzqr2', '')) == '通过':
                upd['dcwqr'] = today
                xx += '\r\n' + f"单报关:￥{_f(getattr(row, 'hjnl2', 0))}/${_f(getattr(row, 'hjhy2', 0))};{today}"

            # 4 特报
            if tp in ['4', '6'] and _s(getattr(row, 'ywqr3', '')) == '通过' and _s(getattr(row, 'dzqr3', '')) == '通过':
                upd['tcwqr'] = today
                xx += '\r\n' + f"特报费用:￥{_f(getattr(row, 'fyje1', 0))};{today}"

            # 5 商检
            if tp in ['5', '6'] and _s(getattr(row, 'ywqr4', '')) == '通过' and _s(getattr(row, 'dzqr4', '')) == '通过':
                upd['scwqr'] = today
                xx += '\r\n' + f"商检费用:￥{_f(getattr(row, 'sbje', 0))};{today}"

            # Pascal: 无论如何都更新 cwqrqk
            upd['cwqrqk'] = xx

            s.query(hdfy).filter(hdfy.rid == rid).update(upd, synchronize_session=False)

            # Pascal: 同步 fpgl.hdfyxq
            if fphm != '':
                s.query(fpgl).filter(
                    or_(fpgl.wxfp == fphm, fpgl.hsfp == fphm)
                ).update({'hdfyxq': xx}, synchronize_session=False)

            count += 1

        s.commit()
        return json_result(1, 'ok', {'count': count})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/forwarder_expense/button/cw_th', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_button_cw_th(request):
    s = Session()
    user = request.current_user
    try:
        j = await request.json()

        def _s(v):
            return str(v or '').strip()

        rid = _s(j.get('rid', ''))
        tp = _s(j.get('tp', '6'))
        if tp not in ['1', '2', '3', '4', '5']:
            tp = '6'

        if rid == '':
            return json_result(-1, '当前记录不能为空')

        # 财务权限
        org = get_user_path(user.username)
        postion = org.get('position', '')
        if '财务' not in postion:
            return json_result(-1, '当前用户非财务岗位，不能执行财务确认')

        row = s.query(hdfy).filter(hdfy.rid == rid).first()
        if not row:
            return json_result(-1, '未找到当前记录')

        today = datetime.now().strftime('%Y-%m-%d')
        uname = _s(getattr(user, 'username', ''))
        xx = _s(getattr(row, 'cwqrqk', ''))

        upd = {}

        if tp in ['1', '6'] and _s(getattr(row, 'dzqr', '')) == '通过' and _s(getattr(row, 'ywqr', '')) == '通过':
            upd['cwqr'] = ''
            xx += f"\r\n指定货代退回{uname}{today}"

        if tp in ['2', '6'] and _s(getattr(row, 'ywqr1', '')) == '通过' and _s(getattr(row, 'dzqr1', '')) == '通过':
            upd['zcwqr'] = ''
            xx += f"\r\n自拉自报退回{uname}{today}"

        if tp in ['3', '6'] and _s(getattr(row, 'ywqr2', '')) == '通过' and _s(getattr(row, 'dzqr2', '')) == '通过':
            upd['dcwqr'] = ''
            xx += f"\r\n单报关退回{uname}{today}"

        if tp in ['4', '6'] and _s(getattr(row, 'ywqr3', '')) == '通过' and _s(getattr(row, 'dzqr3', '')) == '通过':
            upd['tcwqr'] = ''
            xx += f"\r\n特报费用退回{uname}{today}"

        if tp in ['5', '6'] and _s(getattr(row, 'ywqr4', '')) == '通过' and _s(getattr(row, 'dzqr4', '')) == '通过':
            upd['scwqr'] = ''
            xx += f"\r\n商检费用退回{uname}{today}"

        upd['cwqrqk'] = xx

        s.query(hdfy).filter(hdfy.rid == rid).update(upd, synchronize_session=False)
        s.commit()
        return json_result(1, 'ok')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/forwarder_expense/button/gxckfy/options', methods=['POST'])
@require_token
async def view_saier_forwarder_expense_button_gxckfy_options(request):
    try:
        j = await request.json()
        fphm = str(j.get('fphm', '') or '').strip()
        if fphm == '':
            return json_result(-1, '发票号码不能为空')

        rows = run_sql(
            "select sqdh, zgfy, WarehouseName as warehouse_name "
            "from ckzgfy where wxfp=:wxfp and ywsp=:ywsp",
            {'wxfp': fphm, 'ywsp': '通过'}
        ) or []

        return json_result(1, 'ok', {'rows': rows})
    except Exception:
        logger.error(trace_error())
        return json_result(-1, trace_error())