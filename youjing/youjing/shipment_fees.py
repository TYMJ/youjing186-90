import os
from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import user_task_new, module_xxck_new, get_user_path
import time

@any_route('/api/saier/shipment_fees/yhzt/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_yhzt_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wfyh = j.get('wfyh')
        khyh = j.get('khyh')
        yhdm = ''
        tc1 = ''
        th1 = ''
        tc2 = ''
        th2 = ''
        yhdm1 = ''
        d = s.query(newcwcs.yhdm).filter(newcwcs.bank == khyh).first()
        if d:
            yhdm = d.yhdm
        d = s.query(yhbm.province,yhbm.city,yhbm.ssyh).filter(or_(yhbm.yhmc == khyh, and_(yhbm.yhdm == yhdm, func.ifnull(yhbm.yhdm,'')!=''))).first()
        if d:
            tc1 = str(d.province) + '' + str(d.city)
            th1 = d.ssyh
        d = s.query(yhbm.province,yhbm.city,yhbm.ssyh).filter(yhbm.yhmc == khyh).first()
        if d:
            tc2 = str(d.province) + '' + str(d.city)
            th2 = d.ssyh

        d = s.query(yhbm.yhdm).filter(yhbm.yhmc == wfyh).first()
        if not d:
            return json_result(-1, '我方银行名称和银行数据不匹配不能提交')
        
        yhdm1 = d.yhdm
        return json_result(1, '取数成功', {
            'yhdm1': yhdm1,
            'tc1': tc1,
            'th1': th1,
            'tc2': tc2,
            'th2': th2,
        })
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/shipment_fees/cwry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_cwry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cwry = j.get('cwry')
        rid = j.get('rid')
        module = j.get('module', '单证费用')
        sqdh = j.get('sqdh')
        content = user.username + '单证费用单号:' + str(sqdh) + ',请查看:' + time.strftime('%Y-%m-%d')
        title = '单证费用' + str(sqdh) + '申请通知'
        res = user_task_new(module, rid, '申请单号', title, content, user, s, [cwry], True)
        if res.get('code') != 1:
            logger.error(res.get('msg','创建任务失败'))
            return json_result(-1, res.get('msg'))
        row = {
            "xxly": module,
            "bjdh": '',
            "wxht": '',
            "cght": sqdh,
            "yhdh": '',
            "xxnr": content,
            "jsr": str(cwry),
            "sys_path": '',
            "spsq": user.username,
        }
        res = module_xxck_new([row], user, s)
        if res.get('code',1) != 1:
            return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/shipment_fees/sfjq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_sfjq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cwry = j.get('cwry')
        rid = j.get('rid')
        module = j.get('module', '单证费用')
        sqdh = j.get('sqdh')
        content = user.username + '单证费用单号:' + str(sqdh) + '已结清,请查看:' + time.strftime('%Y-%m-%d')
        title = '单证费用' + str(sqdh) + '已结清通知'
        res = user_task_new(module, rid, '申请单号', title, content, user, s, [cwry], True)
        if res.get('code') != 1:
            logger.error(res.get('msg','创建任务失败'))
            return json_result(-1, res.get('msg'))
        row = {
            "xxly": module,
            "bjdh": '',
            "wxht": '',
            "cght": sqdh,
            "yhdh": '',
            "xxnr": content,
            "jsr": str(cwry),
            "sys_path": '',
            "spsq": user.username,
        }
        res = module_xxck_new([row], user, s)
        if res.get('code',1) != 1:
            return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

def shipment_fees_new_fkhc_single(module, data, user, s):
    try:
        d = fkhc()
        d.uid = user.rid
        d.rid = get_uuid()
        d.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
        m = get_module(module)
        d.custId = data.get(m.field_by_full_name(module+'.客户号').db.name)
        d.serialNo = ''
        d.corpCode = data.get(m.field_by_full_name(module+'.单位code').db.name)
        d.zh = data.get(m.field_by_full_name(module+'.银行帐号').db.name)
        d.wfyhzh = data.get(m.field_by_full_name(module+'.我方银行帐号').db.name)
        d.bank = data.get(m.field_by_full_name(module+'.开户银行').db.name)
        d.yhdm = data.get(m.field_by_full_name(module+'.银行代码').db.name)
        d.gcmc = data.get(m.field_by_full_name(module+'.生产厂家').db.name)
        d.yt = data.get(m.field_by_full_name(module+'.用途').db.name)
        d.hkje = data.get(m.field_by_full_name(module+'.付款金额').db.name, 0)
        d.yyzf = data.get(m.field_by_full_name(module+'.预约支付').db.name)
        d.thzz = data.get(m.field_by_full_name(module+'.同行转账').db.name)
        d.tcyd = data.get(m.field_by_full_name(module+'.同城异地').db.name)
        d.yhstate = '无'
        d.wfyhmc = data.get(m.field_by_full_name(module+'.我方银行名称').db.name)
        d.tjrq = time.strftime('%Y-%m-%d')
        d.numberhz = data.get(m.field_by_full_name(module+'.rid').db.name)
        d.jsrm = data.get(m.field_by_full_name(module+'.经 办 人').db.name)
        d.fkhz = '申请单号:' + data.get(m.field_by_full_name(module+'.申请单号').db.name) + '付款金额' + str(data.get(m.field_by_full_name(module+'.付款金额').db.name, 0))
        d.ly = '单证费用'
        d.wstt = data.get(m.field_by_full_name(module+'.我司抬头').db.name)
        s.add(d)

        return {'code': 1, 'msg': '操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code': -1, 'msg': str(e)}

def shipment_fees_new_fkh_all(module, wsttz, rid_list, user, s):
    try:
        d = run_sql(f"select distinct xm xm from cyzglsheet where (zm='特殊银行付款')")
        user_list = [r.get('xm') for r in d if r.get('xm')!=None and r.get('xm')!='']
        data_list = s.query(dzfy).filter(dzfy.rid.in_(rid_list)).all()
        # data_list = alchemy_object_list_to_dict(c)
        xgqd = []
        qb1 = []
        custId1 = []
        corpCode1 = []
        zh1 = []
        wfyhzh1 = []
        bank1 = []
        yhdm1 = []
        gcmc1 = []
        yt1 = []
        hkje1 = []
        wstt12 = []
        fpwk = []
        yyzf1 = []
        thzz1 = []
        tcyd1 = []
        wfyhmc1 = []
        numberhz1 = []
        jsrm1 = []
        fkhz1 = []
        xx = []
        for r in data_list:
            flag = 0
            for u in user_list:
                if u in r.bzsm:
                    flag = 1
                    break
            if flag == 1:
                continue
            xgqd.append(r.xgqd)
            b = run_sql(f"select * from fkyh where (ifnull(wstt,'')='{r.wstt}' and ifnull(fkdq,'')='{r.fkdq}') and payAcc='{wsttz}'")
            if len(b) == 0:
                continue
            yhdm = ''
            tc1 = ''
            th1 = ''
            tc2 = ''
            th2 = ''
            d = s.query(newcwcs.yhdm).filter(newcwcs.bank == r.bank).first()
            if d:
                yhdm = d.yhdm
            if yhdm == '' or yhdm == None:
                d = s.query(yhbm.yhdm).filter(yhbm.yhmc == r.bank).first()
                if d:
                    yhdm = d.yhdm

            d = s.query(yhbm.province,yhbm.city,yhbm.ssyh).filter(or_(yhbm.yhmc == r.bank, and_(yhbm.yhdm == yhdm, func.ifnull(yhbm.yhdm,'')!=''))).first()
            if d:
                tc1 = str(d.province) + '' + str(d.city)
                th1 = d.ssyh
            d = s.query(yhbm.province,yhbm.city,yhbm.ssyh).filter(yhbm.yhmc == r.wfyhmc).first()
            if d:
                tc2 = str(d.province) + '' + str(d.city)
                th2 = d.ssyh
            tcyd = ''
            thzz = ''
            if tc1 != '' and tc2 != '' :
                if tc1 == tc2:
                    tcyd = '同城'
                else:
                    tcyd = '异地'
            if th1 != '' and th2 != '':
                if th1 == th2:
                    thzz = '同行'
                else:
                    thzz = '他行'
            else:
                if r.bank == r.wfyhmc:
                    thzz = '同行'
                else:
                    thzz = '他行'
            zh = r.zh
            gcmc = r.gcmc
            jbr = r.jbr
            wstt = r.wstt
            fpwk = r.fpwk
            if thzz != '' and tcyd != '':
                if not str(zh) + '' + str(gcmc) + '' + str(jbr) + '' + str(wstt) + '' + str(fpwk) in qb1:
                    qb1.append(str(zh) + '' + str(gcmc) + '' + str(jbr) + '' + str(wstt) + '' + str(fpwk))
                    custId1.append(b[0].get('custId', ''))
                    corpCode1.append(b[0].get('corpCode', ''))
                    zh1.add(r.zh)
                    wfyhzh1.add(b[0].get('payAcc'))
                    bank1.add(r.bank)
                    yhdm1.add(yhdm)
                    gcmc1.add(r.gcmc)
                    yt1.add(r.yt)
                    hkje1.add(r.hkje)
                    wstt12.add(r.wstt)
                    fpwk.add(r.fpwk)
                    if r.yyzf == '' or r.yyzf == None:
                        yyzf1.add('非预约')
                    else:
                        yyzf1.add(r.yyzf)
                    thzz1.add(thzz)
                    tcyd1.add(tcyd)
                    wfyhmc1.add(b[0].get('wfyhmc'))
                    numberhz1.add(r.rid)
                    jsrm1.add(r.jbr)
                    fkhz1.add('申请单号:' + r.jzpz + '付款金额' + str(r.hkje))
                else:
                    j = qb1.index(str(zh) + '' + str(gcmc) + '' + str(jbr) + '' + str(wstt) + '' + str(fpwk))
                    hkje1[j] = round(float(hkje1[j]) + r.hkje, 2)
                    numberhz1[j] = numberhz1[j] + ',' + r.rid
                    fkhz1[j] = fkhz1[j] + '\n' + '申请单号:' + r.jzpz + '付款金额' + str(r.hkje)

                r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                r.modi_uid = user.rid
                r.xgqd = xgqd
                r.corpCode = d[0].get('corpCode')
                r.custId = d[0].get('custId')
                r.wfyhzh = d[0].get('payAcc')
                r.wfyhmc = d[0].get('wfyhmc')
                r.subaAccountSerial = d[0].get('subaAccountSerial')
                r.thzz = thzz
                r.tcyd = tcyd
                s.add(r)
              
            else:
                xx.append('申请单号:' + r.jzpz + '货代公司' + r.gcmc + '开户银行' + r.bank + '我司抬头' + r.wstt + '发票为空:' + r.fpwk)

        index = 0
        for l in qb1:
            r = {}
            r['fpwk'] = fpwk[index]
            r['custId'] = custId1[index]
            r['serialNo'] = ''
            r['corpCode'] = corpCode1[index]
            r['zh'] = zh1[index]
            r['wfyhzh'] = wfyhzh1[index]
            r['bank'] = bank1[index]
            r['yhdm'] = yhdm1[index]
            r['gcmc'] = gcmc1[index]
            r['yt'] = yt1[index]
            r['hkje'] = float(hkje1[index])
            r['yyzf'] = yyzf1[index]
            r['thzz'] = thzz1[index]
            r['tcyd'] = tcyd1[index]
            r['yhstate'] = '无'
            r['wfyhmc'] = wfyhmc1[index]
            r['tjrq'] = time.strftime('%Y-%m-%d')
            r['numberhz'] = numberhz1[index]
            r['jsrm'] = jsrm1[index]
            r['fkhz'] = fkhz1[index]
            r['ly'] = '单证费用'
            r['wstt'] = wstt12[index]
            res = shipment_fees_new_fkhc_single(module, r, user, s)
            if res.get('code', 1) != 1:
                return res
            index = index + 1

        return {'code': 1, 'msg': '操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code': -1, 'msg': str(e)}

@any_route('/api/saier/shipment_fees/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        data = j.get('data')
        module = j.get('module', '单证费用')
        res = shipment_fees_new_fkhc_single(module, data, user, s)
        if res.get('code', 1) != 1:
            s.rollback()
            return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/shipment_fees/yhzt/cancel', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_yhzt_cancel(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        org = get_user_path(user.username)
        position = org.get('position', '')
        rids = j.get('rids')
        flag = j.get('flag', 0)
        wstt = ''
        fkdq = ''
        tlist = []
        ridlist = []
        if not '财务' in position:
            return json_result(-1, '只有财务才能执行此操作')
        if flag == 1:
            c = s.query(dzfy.wstt,dzfy.fkdq,dzfy.zh,dzfy.rid,dzfy.bank,dzfy.hkje,dzfy.yt,dzfy.fkdq,dzfy.wstt).filter(dzfy.rid.in_(rids),or_(dzfy.yhstate=='无', func.ifnull(dzfy.yhstate,'')=='')).all()
            for r in c:
                if r.bank !='' and r.bank != None and r.zh !='' and r.zh != None and r.hkje!=None and float(r.hkje)>1 and r.yt !='' and r.yt != None:
                    tlist.append(r.zh)
                    ridlist.append(r.rid)
                    fkdq = r.fkdq
                    wstt = r.wstt
            if fkdq !='' and fkdq != None and wstt !='' and wstt != None:
                d = run_sql(f"select distinct payAcc xm from fkyh where (ifnull(wstt,'')='{wstt}' and ifnull(fkdq,'')='{fkdq}')")
                tlist = [r.get('xm') for r in d]

        return json_result(1, '操作成功', {'tlist': tlist, 'ridlist': ridlist})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/shipment_fees/yhzt/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_shipment_fees_yhzt_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids')
        module = j.get('module', '单证费用')
        wsttz = j.get('wsttz')

        res = shipment_fees_new_fkh_all(module, wsttz, rids, user, s)
        if res.get('code', 1) != 1:
            s.rollback()
            return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()