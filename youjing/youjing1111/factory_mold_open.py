from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/factory_mold_open/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {'cdfysh':0,'cyzgl':0}

        d = run_sql(f"select rid,position,path from sys_user where (username='{str(user.username)}') and ((position like '%财务%') or memo like '%财务%')")
        if len(d)>0:
            data['cdfysh'] = 1
            
        d = run_sql(f"select rid from cyzglsheet where (xm='{str(user.username)}') and (zm='开模审批')")
        if len(d)>0:
            data['cyzgl'] = 1
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_mold_open/kmsp/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_kmsp_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sh = j.get('sh','')
        data = {'shdata':0}

        d = run_sql(f"select * from cyzglsheet where (xm='{str(sh)}') and (zm='开模审批')")
        if len(d)>0:
            data['shdata'] = 1

            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_mold_open/cpbh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_cpbh_change(request):
    s = Session()
    j = await request.json()
    try:
        kmbh = j.get('kmbh','')
        rid = j.get('rid','')
        data = {'cpbhdata':0}
        
        if rid == '':
            d = run_sql(f"select cpbh from gckm where (kmbh='{str(kmbh)}')  order by number desc")
        else:
            d = run_sql(f"select cpbh from gckm where (kmbh='{str(kmbh)}') and (rid<>'{str(rid)}') order by rid desc")
        if len(d)>0:
            data['cpbhdata'] = 1
            data['cpbh'] = d[0].get('cpbh','')

            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/factory_mold_open/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        username = user.username
        rid = j.get('rid','')
        sh = j.get('sh','')
        tg = j.get('tg','')
        cpbh = j.get('cpbh','')
        spr = j.get('spr','')
        zjlsp = j.get('zjlsp','')
        wcqk = j.get('wcqk','')
        hzsb = j.get('hzsb','')
        sfhz = j.get('sfhz','')
        sqr = j.get('sqr','')
        kmbh = j.get('kmbh','')
        cdje = float(j.get('cdje', 0))
        mjcg = j.get('mjcg', '')
        bpyy = j.get('bpyy', '')
        
        if tg != '待审批':
            res = user_task_delete('工厂开模', rid, s, [])
            if res.get('code', 1) != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))
            if tg in ['确认', '通过']:
                if cdje < 1:
                    xxnr = '产品编号:' + str(cpbh) + '开模申请审核通过'
                else:
                    xxnr = '产品编号:' + str(cpbh) + '开模申请已提交侯总'

                if mjcg != '' and mjcg != user.username:
                    row = {
                        "xxly": '开模审核',
                        "bjdh": '',
                        "wxht": '',
                        "cght": '',
                        "yhdh": '',
                        "xxnr": xxnr,
                        "jsr": mjcg,
                        "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                    }
                    res = module_xxck_new([row], user, s)
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                
                # 承担金额>0: 给侯柳红建任务 + 发送消息
                if cdje > 0:
                    sqrq = datetime.now().strftime('%Y-%m-%d')
                    subject = user.username + '产品编号:' + str(cpbh) + '开模需审核,日期:' + sqrq
                    res = user_task_new('工厂开模', rid, '开模编号', subject[:99], user, s, ['侯柳红'])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))

                    row = {
                        "xxly": '开模审核',
                        "bjdh": '',
                        "wxht": '',
                        "cght": '',
                        "yhdh": '',
                        "xxnr": '产品编号:' + str(cpbh) + '开模需审核',
                        "jsr": '侯柳红',
                        "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                    }
                    res = module_xxck_new([row], user, s)
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
        else:
            row = {
                "xxly": '开模审核',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": '产品编号:' + str(cpbh) + '开模申请审核不通过,原因' + str(bpyy),
                "jsr": mjcg,
                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
            }
            res = module_xxck_new([row], user, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            
        if username == '侯柳红' and zjlsp != '待审批':
            if zjlsp != '待审批':
                res = user_task_delete('工厂开模', rid, s, [])
                if res.get('code', 1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                
                if zjlsp in ['确认', '通过']:
                    if mjcg != '' and mjcg != user.username:
                        row = {
                            "xxly": '开模审核',
                            "bjdh": '',
                            "wxht": '',
                            "cght": '',
                            "yhdh": '',
                            "xxnr": '产品编号:' + str(cpbh) + '开模申请审核通过',
                            "jsr": mjcg,
                            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                        }
                        r = module_xxck_new([row], user, s)
                        if r.get('code') != 1:
                            s.rollback()
                            return json_result(res.get('code'), res.get('msg'))
            else:
                row = {
                    "xxly": '开模审核',
                    "bjdh": '',
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": '产品编号:' + str(cpbh) + '开模申请审核不通过,原因' + str(bpyy),
                    "jsr": mjcg,
                    "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                }
                res = module_xxck_new([row], user, s)
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('msg'))

        sqrq = datetime.now().strftime('%Y-%m-%d')
        if sh == '' and username != '侯柳红':
            if sh == '' and tg == '待审批':
                if sh != '' and sh != username:
                    d = s.query(sys_task).filter(sys_task.username == username,sys_task.module == '工厂开模',sys_task.pid == rid).first()
                    if not d:
                        res = user_task_new('工厂开模', rid, '开模编号', user.username + '产品编号:' + str(cpbh) + '开模需审核,日期:' + sqrq, user, s, [sh])
                        if res.get('code') != 1:
                            s.rollback()
                            return json_result(res.get('code'), res.get('msg'))
                        
                        row = {
                            "xxly": '开模审核',
                            "bjdh": '',
                            "wxht": '',
                            "cght": '',
                            "yhdh": '',
                            "xxnr": '产品编号:' + str(cpbh) + '开模需审核',
                            "jsr": sh,
                            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                        }
                        res = module_xxck_new([row],user,s)
                        if res.get('code')!=1:
                            return json_result(res.get('code'), res.get('code'))
        
        if spr == username and zjlsp == '通过' and wcqk == '已完成' and hzsb != '' :
            xxnr = ''
            if sfhz != '通过':
                res = user_task_delete('工厂开模', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                
                xxnr = username + '开模编号:' + str(kmbh) + '可生成费用,请去点扩展生成费用申请日期:' + sqrq
                res = user_task_new('工厂开模', rid, '开模编号',xxnr, user, s, [sqr])
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('msg'))
            else:
                xxnr = username + '开模编号:' + str(kmbh) + '生成费用申请已驳回，日期:' + sqrq
            row = {
                "xxly": '开模审核',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": xxnr,
                "jsr": sqr
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))
        
        s.commit()
        return json_result(1, '查询成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/factory_mold_open/button/gqdsq/check', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_button_gqdsq_check(request):
    j = await request.json()
    try:
        bfdh = j.get('bfdh','')
        
        fysb = ''
        d = run_sql(f"select * from fysq where (bfdh='{str(bfdh)}') and (tjjl<>'')")
        if len(d) > 0:
            fysb = '1'
        data = {'fysb': fysb}
        return json_result(1, '检查成功！', data)
    except: 
        logger.error(trace_error())
        return json_result(-1, trace_error())
        
@any_route('/api/saier/factory_mold_open/button/gqdsq', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_button_gqdsq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        cdje = j.get('cdje','')
        kmsp = j.get('kmsp','')
        cpbh = j.get('cpbh','')
        yy = j.get('yy','')
        
        sh = ''
        if cdje <= 1:
            sh = kmsp
        else:
            sh = '侯柳红'
            
        xxnr = '产品编号:' + str(cpbh) + '退改单审请,原因:'+ str(yy)
        row = {
            "xxly": '开模审核',
            "bjdh": '',
            "wxht": '',
            "cght": '',
            "yhdh": '',
            "xxnr": xxnr,
            "jsr": sh,
            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
        }
        res = module_xxck_new([row],user,s)
        if res.get('code')!=1:
            return json_result(res.get('code'), res.get('code'))
        
        res = user_task_delete('工厂开模', rid, s, [])
        if res.get('code',1) != 1:
            s.rollback()
            return json_result(-1, res.get('msg'))
        
        res = user_task_new('工厂开模', rid, '开模编号',xxnr[:99], user, s, [sh])
        if res.get('code') != 1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))
        
        s.commit()
        return json_result(1, '查询成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_mold_open/button/fksq', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_button_fksq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        kmbh = j.get('kmbh','')
        kmsp = j.get('kmsp','')
        
        xxnr = user.username +'产品编号:' + str(kmbh) + '开模付款申请需审核,日期:'+ datetime.now().strftime('%Y-%m-%d')
        
        res = user_task_new('工厂开模', rid, '开模编号',xxnr[:99], user, s, [kmsp])
        if res.get('code') != 1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))
        
        row = {
            "xxly": '开模审核',
            "bjdh": '',
            "wxht": '',
            "cght": '',
            "yhdh": '',
            "xxnr": xxnr,
            "jsr": kmsp,
            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
        }
        res = module_xxck_new([row],user,s)
        if res.get('code')!=1:
            return json_result(res.get('code'), res.get('code'))
        
        s.commit()
        return json_result(1, '查询成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/factory_mold_open/button/scfysq', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_mold_open_button_scfysq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        kmbh = j.get('kmbh', '')
        wfgs = j.get('wfgs', '')
        cdje = float(j.get('cdje', 0) or 0)
        mjsl = float(j.get('mjsl', 0) or 0)
        mjcg = j.get('mjcg', '')
        ywbm = j.get('ywbm', '')
        cpbh = j.get('cpbh', '')
        zwpm = j.get('zwpm', '')
        yjjdsl = float(j.get('yjjdsl', 0) or 0)
        sccj = j.get('sccj', '')

        fysb = ''
        father = ''
        fkbh = ''
        # 3) 删除提醒
        res = user_task_delete('工厂开模', rid, s, [])
        if res.get('code',1) != 1:
            s.rollback()
            return json_result(-1, res.get('msg'))

        # 5) 是否已有 fysq
        d = run_sql(f"select rid,fkbh from fysq where (bfdh='{str(kmbh)}') limit 1")
        if len(d) > 0:
            fysb = '有'
            father = d[0].get('rid', '')
            fkbh = d[0].get('fkbh', '')

        # 7) 生成 fkbh
        if fysb == '':
            kpxh1 = datetime.now().strftime('%y-%m-')
            d = run_sql(f"select fkbh from fysq where fkbh like '%{str(kpxh1)}%' order by fkbh desc limit 1")
            if len(d) > 0:
                old_fkbh = d[0].get('fkbh', '')
                try:
                    kpxhz = int(str(old_fkbh)[6:11]) + 1
                except:
                    kpxhz = 1
            else:
                kpxhz = 1
            kpxh = kpxh1 + f"{kpxhz:05d}"
            fkbh = kpxh + 'FY'

        now_dt = time.strftime("%Y-%m-%d %H:%M:%S")
        now_day = time.strftime("%Y-%m-%d")

        # 8) fysq 主表：新增/更新
        if fysb == '':
            m = fysq()
            m.rid = get_uuid()
            m.uid = user.rid
            m.ctime = now_dt
            m.mtime = now_dt

            m.fkbh = fkbh
            m.bfdh = kmbh
            m.wfgs = wfgs
            m.seje = cdje
            m.sl = mjsl
            m.yfdj = 0
            m.hbdm = 'RMB'
            m.huilv = 1
            m.sqrq1 = now_day
            m.hklx = '开模费'
            m.fkxs = '电汇'
            m.zxpd = '否'
            m.RMBkh = '是'
            m.sfrbmfy = '是'
            m.lyry = mjcg
            m.hsbm = ywbm
            m.jbry = mjcg
            m.fpje = cdje
            m.xgry = user.username
            m.wyzd = 'gckm' + fkbh + user.username + now_dt
            m.seje1 = cdje
            m.fynr = '开模编号' + str(kmbh) + '的费用申请'
            m.sqrq = now_day
            m.htje1 = cdje
            m.hfje = cdje
            m.jtfy = 0
            m.jlhz = '待审批'
            m.zjhz = '待审批'
            m.zjlhz = '待审批'
            m.cwsp = '待审批'
            m.fklx = '打样费'
            m.cpbh = cpbh
            m.zwpm = zwpm
            m.yjchl = yjjdsl

            s.add(m)
            father = m.rid
        else:
            update_json = {
                'wfgs': wfgs, 'cwgc': '', 'sfkp': '', 'khh': '', 'yhzh': '',
                'seje': cdje, 'sl': mjsl, 'yfdj': 0, 'hbdm': 'RMB', 'huilv': 1,
                'sqrq1': now_day, 'hklx': '开模费', 'fkxs': '电汇', 'zxpd': '否',
                'RMBkh': '是', 'sfrbmfy': '是', 'lyry': mjcg, 'hsbm': ywbm, 'jbry': mjcg,
                'fpje': cdje, 'bz1': '', 'xgry': user.username, 'seje1': cdje,
                'fynr': '开模编号' + str(kmbh) + '的费用申请',
                'sqrq': now_day, 'htje1': cdje, 'hfje': cdje, 'jtfy': 0,
                'tjjl': '', 'jlhz': '待审批', 'sprq': '', 'tjfk': '', 'zjhz': '待审批',
                'sprq2': '', 'tjzjl': '', 'zjlhz': '待审批', 'sprq3': '',
                'tjcw': '', 'cwsp': '待审批', 'fklx': '打样费', 'dycw': '',
                'cpbh': cpbh, 'zwpm': zwpm, 'yjchl': yjjdsl
            }
            s.query(fysq).filter(fysq.fkbh == str(fkbh)).update(update_json)

            d = run_sql(f"select rid from fysq where (fkbh='{str(fkbh)}') and (bfdh='{str(kmbh)}') limit 1")
            if len(d) > 0:
                father = d[0].get('rid', '')
                
        if father != '':
            d = run_sql(f"select rid from fysqsheet where pid='{str(father)}' limit 1")
            if fysb == '' or len(d) == 0:
                ms = fysqsheet()
                ms.rid = get_uuid()
                ms.pid = father
                ms.uid = user.rid
                ms.ctime = now_dt
                ms.mtime = now_dt
                ms.hbdm = 'RMB'
                ms.hklx = '打样费'
                ms.fpje = cdje
                ms.seje = cdje
                ms.jbry = mjcg
                ms.ywbm = ywbm
                ms.hsbm = ywbm
                ms.fywyzd = fkbh + user.username + now_dt
                ms.sfrbmfy = '是'
                ms.cpbh = cpbh
                ms.zwpm = zwpm
                ms.sfsh = '否'
                ms.csmc = sccj
                s.add(ms)
            else:
                update_json = {
                    'fpje': cdje, 'sj': '', 'dd': '', 'ts': 0, 'seje': cdje, 'rs': 0, 'ptry': '',
                    'jbry': mjcg, 'ywbm': ywbm, 'hsbm': ywbm, 'cpbh': cpbh, 'zwpm': zwpm, 'csmc': sccj
                }
                s.query(fysqsheet).filter(fysqsheet.pid == str(father)).update(update_json)

        s.commit()
        if father != '':
            return json_result(1, '生成成功', father)
        return json_result(1, '操作成功', '')

    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
