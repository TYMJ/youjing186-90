from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new

@any_route('/api/saier/payment_approval/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        khmc = j.get('khmc','')
        sfkp = j.get('sfkp','')
        xbdm = j.get('xbdm','')
        wfgs1 = j.get('wfgs','')
        cxsb = j.get('cxsb','')
        csmc = j.get('csmc','')
        cwgc = j.get('cwgc','')
        yw = j.get('yw','')
        fkbh = j.get('fkbh','')
        
        jsts = ''
        sz1 = ''
        rq = ''
        msgdata = 0
        wfgsdata = 0
        wfgs2 = ''
        bm = ''
        zsrq = ''
        cxsbdata = 0
        path = ''
        sb = 0
        if sfkp == '是' and xbdm != '':
            if khmc != '':
                d = run_sql(f"select * from cyzglsheet where (xm like '%{str(khmc)}%') and (zm='无报关率要求客户')")
                if len(d)==0:
                    msgdata = 1
        
        d = run_sql(f"select cs,sz1,NOW() AS date from zx where ly='财务付款结算期'")
        if len(d)>0:
            jsts = d[0].get('cs','')
            sz1 = d[0].get('sz1','')
            rq = str(d[0].get('date',''))[:10]
            
        if wfgs1 == '':
            d = run_sql(f"select wfgs,bm from ywrybiao where yhm='{str(user.username)}'")
            if len(d)>0:
                wfgsdata = 1
                wfgs2 = d[0].get('wfgs','')
                bm = d[0].get('bm','')
                
        if rq != '':
            if sz1 > 0:
                dt = datetime.strptime(rq, '%Y-%m-%d')
                python_weekday = dt.weekday()
                s = (python_weekday + 1) % 7 + 1 
                
                if s < sz1:
                    s1 = s + 7 - sz1
                else:
                    s1 = s - sz1
                    
                result_dt = dt - timedelta(days=jsts) - timedelta(days=s1) + timedelta(days=1)
                zsrq = result_dt.strftime('%Y-%m-%d %H:%M:%S')  # 或按需格式化
            else:
                dt = datetime.strptime(rq, '%Y-%m-%d')
                result_dt = dt - timedelta(days=jsts)
                zsrq = result_dt.strftime('%Y-%m-%d %H:%M:%S')
        else:
            zsrq = ''
        
        if cxsb == '待提供':
            d = run_sql(f"select * from cxgc where ((gcmc='{str(csmc)}') or (chgc='{str(csmc)}') or (gcmc='{str(cwgc)}')) and (sfsh='是')")
            if len(d)>0:
                cxsbdata = 1
        
        if yw == '':
            d = run_sql(f"select path from sys_user where username='{str(user.username)}'")
            if len(d)>0:
                path = str(d[0].get('path',''))[:100]
        
        if fkbh != '' and fkbh != '待生成':
            d = run_sql(f"select rid from sys_record_lock where rid='{str(rid)}' and module='{str(module)}' and uid!='{str(user.rid)}'")
            if len(d)>0:
                sb = 3

        data = {'msgdata':msgdata,'wfgsdata': wfgsdata, 'cxsbdata': cxsbdata, 'path': path, 'sb': sb,'wfgs2': wfgs2, 'bm': bm, 'zsrq': zsrq}

        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/save/before/check', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_save_before_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        fklx = j.get('fklx','')
        fphm = j.get('fphm','')
        khmc = j.get('khmc','')
        fkbh = j.get('fkbh','')
        rtscgdh = j.get('rtscgdh','')
        zgsp = j.get('zgsp','')
        tjzg = j.get('tjzg','')
        sfkp = j.get('sfkp','')
        xbdm = j.get('xbdm','')
        jbry = j.get('jbry','')
        cwgc = j.get('cwgc','')
        
        fktt = ''
        fkbh1 = ''
        cdsb = ''
        msgdata = 0
        cwgcdata = 0
        bank = ''
        zh = ''
        
        if fklx == '预付款':
            d = run_sql(f"select bz from cyzglsheet where (xm='{str(khmc)}') and (zm='预付款锁定付款抬头')")
            if len(d)>0:
                fktt = d[0].get('bz','')
        gssb = '' 
        d = run_sql(f"select rid from cyzglsheet where (xm='{str(khmc)}') and (zm='我方公司不锁定') and (xm<>'') and (xm is not null)")
        if len(d)>0:
            gssb = '1'
        if 'CSD-' not in fphm:
            fktt = '宁波可思达进出口有限公司'
        else:
            if gssb != '1':
                d = run_sql(f"select Vendorgs from kh where (company_name='{str(khmc)}') and (Vendorgs<>'') and (Vendorgs is not null)")
                if len(d)>0:
                    fktt = d[0].get('Vendorgs','')
        
        if fkbh == '' and fkbh == '待生成':
            kpxh1 = datetime.now().strftime("%y-%m-")
            d = run_sql(f"select fkbh from fksp where fkbh like '%{str(kpxh1)}%' order by fkbh desc limit 1")
            if len(d)>0:
                fkbh = d[0].get('fkbh','')
                num_part = fkbh[6:11]
                kpxhz = int(num_part) + 1
            else:
                kpxhz = 1
                
            kpxh = kpxh1 + f"{kpxhz:05d}"
            if rtscgdh != '':
                fkbh1 = kpxh + 'RT'
            else:
                fkbh1 = kpxh + 'FK'
        
        if zgsp != '待审批' and tjzg != user.username:
            fkbhcs = ''
            if fkbh1 != '':
                fkbhcs = fkbh1
            else:
                fkbhcs = fkbh
            d = run_sql(f"select fkbh,rid from fksp where (fkbh='{fkbhcs}') and (tjjl='') and (jbry<>'{str(user.username)}')")
            if len(d)>0:
                cdsb = '1'
        
        if cdsb == '':
            if sfkp == '否' and xbdm != '' and jbry == user.username:
                if khmc != '':
                    d = run_sql(f"select * from cyzglsheet where (xm like '%{str(khmc)}%') and (zm='无报关率要求客户')")
                    if len(d)>0:
                        msgdata = 1
            
            if cwgc != '':
                d = run_sql(f"select bank,zh from newcwcs where company_name='{str(cwgc)}'")
                if len(d)>0:
                    cwgcdata = 1
                    bank = d[0].get('bank','')
                    zh = d[0].get('zh','')
                    
        data = {'fktt': fktt, 'fkbh1': fkbh1, 'msgdata': msgdata, 'cdsb': cdsb, 'cwgcdata': cwgcdata, 'bank': bank, 'zh': zh}
        return json_result(1, '保存成功！',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        fklx = j.get('sccj','')
        hzhj = j.get('hzhj',0)
        fkbh = j.get('fkbh','')
        tjzg = j.get('tjzg','')
        tjzj = j.get('tjzj','')
        tjzjl = j.get('tjzjl','')
        tjcw = j.get('tjcw','')
        jbry = j.get('jbry','')
        jlsb = j.get('jlsb','')
        zjsb = j.get('zjsb','')
        zjlsb = j.get('zjlsb','')
        cwsb = j.get('cwsb','')
        zgsp = j.get('zgsp','')
        spyj = j.get('spyj','')
        zjsp = j.get('zjsp','')
        zjyj = j.get('zjyj','')
        zjlsp = j.get('zjlsp','')
        zjlyj = j.get('zjlyj','')
        cwsp = j.get('cwsp','')
        cwyj = j.get('cwyj','')
        sqje = j.get('zjlyj',0)
        yw = j.get('yw','')
        sfkp = j.get('sfkp','')
        khmc = j.get('khmc','')
        fphm = j.get('fphm','')
        cwsprq = j.get('cwsprq','')
        
        if fkbh !='':
            if tjzg != '':
                d = run_sql(f"select rid,tjjl from fksp where fkbh='{str(fkbh)}'")
                if len(d)>0:
                    srid = d[0].get('rid','')
                    tjjl = d[0].get('tjjl','')
                if tjjl != tjzg:
                    if tjzg != user.username:
                        if srid != '' :
                            res = user_task_delete('付款审批', rid, s, [])
                            if res.get('code',1) != 1:
                                s.rollback()
                                return json_result(-1, res.get('msg'))
                            
                            xxnr = '[审批]' + user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjzg])
                            if res.get('code') != 1:
                                s.rollback()
                                return json_result(res.get('code'), res.get('msg'))
                            
            if tjzj != '':
                d = run_sql(f"select rid,tjfk from fksp where fkbh='{str(fkbh)}'")
                if len(d)>0:
                    tjfk = d[0].get('tjfk','')
                if tjfk != tjzj:
                    if tjzj != user.username:
                        if zgsp == '通过':
                            res = user_task_delete('付款审批', rid, s, [])
                            if res.get('code',1) != 1:
                                s.rollback()
                                return json_result(-1, res.get('msg'))
                            
                            xxnr = '[审批]' + user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjzj])
                            if res.get('code') != 1:
                                s.rollback()
                                return json_result(res.get('code'), res.get('msg'))
                            
            if tjzjl != '':
                d = run_sql(f"select rid,tjzjl from fksp where fkbh='{str(fkbh)}'")
                if len(d)>0:
                    tjzjl1 = d[0].get('tjzjl','')
                if tjzjl1 != tjzjl:
                    if tjzjl != user.username:
                        if zjsp == '通过':
                            res = user_task_delete('付款审批', rid, s, [])
                            if res.get('code',1) != 1:
                                s.rollback()
                                return json_result(-1, res.get('msg'))
                            
                            xxnr = '[审批]' + user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjzj])
                            if res.get('code') != 1:
                                s.rollback()
                                return json_result(res.get('code'), res.get('msg'))

            if fklx == '预付款':
                d = run_sql(f"select cs from zx where mc = '预付额度'")
                if len(d)>0:
                    if float(d[0].get('cs',0)) < hzhj and float(d[0].get('cs',0)) > 0:
                        sb1 = '1'
            else:
                d = run_sql(f"select cs from zx where mc = '提前额度'")
                if len(d)>0:
                    if float(d[0].get('cs',0)) < hzhj and float(d[0].get('cs',0)) > 0:
                        sb1 = '1'
                        
            d = run_sql(f"select rid,tjcw from fksp where fkbh='{str(fkbh)}'")
            if len(d)>0:
                tjcw1 = d[0].get('tjcw','')
            if tjcw1 != tjcw:
                if tjcw != user.username:
                    if sb1 == '1':
                        ds = run_sql(f"select wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and ((wb5='{str(tjcw)}') or (wb9='{str(tjcw)}'))")
                    else:
                        ds = run_sql(f"select wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and ((wb4='{str(tjcw)}') or (wb5='{str(tjcw)}') or (wb8='{str(tjcw)}') or (wb9='{str(tjcw)}'))")
                    if len(ds) > 0:
                        if zjlsp == '通过':
                            res = user_task_delete('付款审批', rid, s, [])
                            if res.get('code',1) != 1:
                                s.rollback()
                                return json_result(-1, res.get('msg'))
                            
                            row = {
                                "xxly": '付款审批',
                                "bjdh": '',
                                "wxht": '',
                                "cght": '',
                                "yhdh": '',
                                "xxnr": user.username + '的' + fklx + '审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S"),
                                "jsr": tjcw,
                                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                            }
                            res = await module_xxck_new([row],user,s)
                            if res.get('code')!=1:
                                return json_result(res.get('code'), res.get('code'))
                            
                            xxnr = '[审批]' + user.username + '的' + fklx + '审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjcw])
                            if res.get('code') != 1:
                                s.rollback()
                                return json_result(res.get('code'), res.get('msg'))
                    
        if jlsb !='':
            if zgsp != '' and zgsp != '待审批':
                res = user_task_delete('付款审批', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                if zgsp == '不通过':
                    xxnr = user.username + '付款审批:' + fkbh + '主管不能通过没通过,原因:' + spyj
                    res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [jbry])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                if zgsp == '通过':
                    if tjzj != user.username:
                        xxnr = '[审批]' + user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                        res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjzj])
                        if res.get('code') != 1:
                            s.rollback()
                            return json_result(res.get('code'), res.get('msg'))
                        
                        row = {
                            "xxly": '付款审批',
                            "bjdh": '',
                            "wxht": '',
                            "cght": '',
                            "yhdh": '',
                            "xxnr": user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S"),
                            "jsr": tjzj,
                            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                        }
                        res = await module_xxck_new([row],user,s)
                        if res.get('code')!=1:
                            return json_result(res.get('code'), res.get('code'))
        
        if zjsb !='':
            if zjsp != '' and zjsp != '待审批':
                res = user_task_delete('付款审批', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                if zjsp == '不通过':
                    xxnr = user.username + '付款审批:' + fkbh + '总监不能通过没通过,原因:' + zjyj
                    res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [jbry])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                if zjsp == '通过':
                    d = run_sql(f"select sz from cyzglsheet where (xm='{user.username}') and (zm='总监付款审批限额')")
                    if len(d)>0:
                        if sqje > float(d[0].get('cs',0)):
                            if yw != '':
                                if tjzjl != user.username:
                                    xxnr = '[审批]' + user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                                    res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjzjl])
                                    if res.get('code') != 1:
                                        s.rollback()
                                        return json_result(res.get('code'), res.get('msg'))
                                    
                                    row = {
                                        "xxly": '付款审批',
                                        "bjdh": '',
                                        "wxht": '',
                                        "cght": '',
                                        "yhdh": '',
                                        "xxnr": user.username + '的付款审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S"),
                                        "jsr": tjzjl,
                                        "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                                    }
                                    res = await module_xxck_new([row],user,s)
                                    if res.get('code')!=1:
                                        return json_result(res.get('code'), res.get('code'))
                    
        if zjlsb !='':
            if zjlsp != '' and zjlsp != '待审批':
                res = user_task_delete('付款审批', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                if zjlsp == '不通过':
                    xxnr = user.username + '付款审批:' + fkbh + '总经理不能通过,原因:' + zjlyj
                    res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [jbry])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                if zjlsp == '通过':
                    u = s.query(sys_user.rid).filter(or_(sys_user.username == tjcw, sys_user.rid == tjcw)).first()
                    d = run_sql(f"select rid from sys_task where module = '付款审批' and pid = '{str(rid)}' and uid = '{u.rid}'")
                    if len(d)==0:
                        xxnr = '[审批]' + user.username + '的' + fklx + '审批:' + fkbh + '总经理通过请查看,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
                        res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [tjcw])
                        if res.get('code') != 1:
                            s.rollback()
                            return json_result(res.get('code'), res.get('msg'))
                        
                        row = {
                            "xxly": '付款审批',
                            "bjdh": '',
                            "wxht": '',
                            "cght": '',
                            "yhdh": '',
                            "xxnr": user.username + '的' + fklx + '审批:' + fkbh + '总经理通过请查看,日期:' + time.strftime("%Y-%m-%d %H:%M:%S"),
                            "jsr": tjcw,
                            "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                        }
                        res = await module_xxck_new([row],user,s)
                        if res.get('code')!=1:
                            return json_result(res.get('code'), res.get('code'))
                    
        if cwsb != '':
            if cwsp != '' and cwsp != '待审批':
            
                cwzj = ''
                jesx1 = 0
                fkxe = '付款审批付款限额'
                fkdy = '付款审批付款财务'
                srid = ''
                
                if ('AMAZON' in khmc.upper()) or ('AMZ' in fphm.upper()) or (wfgs == '宁波景业国际贸易有限公司'):
                    fkxe = '电商付款审批付款限额'
                    fkdy = '电商付款审批付款财务'
                    d = run_sql(f"select wb1,wb2,wb3,wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and (wb1='{str(tjzg)}')")
                    if len(d)>0:
                        cwzj = d[0].get('wb9','')
                        
                d = run_sql(f"select * from zx where ly='{str(fkxe)}'")
                if len(d)>0:
                    if fklx == '预付款':
                        if d[0].get('wb1','') == '预付款':
                            jesx1 = d[0].get('sz1',0)
                            if sqje > jesx1:
                                cwzj = d[0].get('wb2','')
                    
                    if fklx == '提前付款':
                        if d[0].get('wb3','') == '提前付款':
                            jesx1 = d[0].get('sz2',0)
                            if sqje > jesx1:
                                cwzj = d[0].get('wb4','')
                                
                    if fklx == '预付款':
                        if d[0].get('wb5','') == '预付款':
                            jesx1 = d[0].get('sz3',0)
                            if sqje > jesx1:
                                cwzj = d[0].get('wb6','')
                                
                d = run_sql(f"select dymc from zxsheet where (ly='付款审批') and (sj='{user.username.upper()}') and (lx='付款审批财务') and (xtxh>0)")
                if len(d)>0:
                    cwzj = d[0].get('dymc','')

                cw1 = ''
                cw2 = ''
                d = run_sql(f"select * from zx where (ly='{str(fkdy)}')")
                if len(d)>0:
                    if sfkp == '是':
                        if d[0].get('wb1','') == '开票':
                            cw1 = d[0].get('wb2','')
                    else:
                        if d[0].get('wb3','') == '现金':
                            cw1 = d[0].get('wb4','')
                            
                d = run_sql(f"select rid from fksp where (fkbh='{str(fkbh)}')")
                if len(d)>0:
                    srid = d[0].get('rid','')
                if srid != '':
                    res = user_task_delete('付款审批', rid, s, [])
                    if res.get('code',1) != 1:
                        s.rollback()
                        return json_result(-1, res.get('msg'))
                if cwsp == '不通过':
                    if '爱马士电商组' in yw.upper():
                        update_json = {'sys_path': yw}
                        s.query(fksp).filter(fksp.rid == str(rid)).update(update_json)
                    update_json1 = {'cwsp': '待审批'}
                    s.query(fkspsheet).filter(fkspsheet.pid == str(rid)).update(update_json1)
                    s.query(fkspsheet3).filter(fkspsheet3.pid == str(rid)).update(update_json1)
                    
                    xxnr = user.username + '付款审批:' + fkbh + '财务不能通过没通过,原因:' + cwyj
                    res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [jbry])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                
                if cwsp == '通过':
                    if not (cwzj != '' and cwzj != user.username):
                        update_json = {'cwsp': '待审批','pzrq':cwsprq}
                        s.query(fkspsheet).filter(fkspsheet.pid == str(rid)).update(update_json)
                        s.query(fkspsheet3).filter(fkspsheet3.pid == str(rid)).update(update_json)
                        
                        if cw1 != '' and srid != '':
                            xxnr = user.username + fklx + '审批:' + fkbh + '通过请安排打印'
                            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [cw1])
                            if res.get('code') != 1:
                                s.rollback()
                                return json_result(res.get('code'), res.get('msg'))
                            
                            row = {
                                "xxly": '付款审批',
                                "bjdh": '',
                                "wxht": '',
                                "cght": '',
                                "yhdh": '',
                                "xxnr": user.username + fklx + '审批:' + fkbh + '通过请安排打印',
                                "jsr": cw1,
                                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                            }
                            res = await module_xxck_new([row],user,s)
                            if res.get('code')!=1:
                                return json_result(res.get('code'), res.get('code'))
                            
                            row = {
                                "xxly": '付款审批',
                                "bjdh": '',
                                "wxht": '',
                                "cght": '',
                                "yhdh": '',
                                "xxnr": user.username + fklx + '审批:' + fkbh + '通过',
                                "jsr": jbry,
                                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                            }
                            res = await module_xxck_new([row],user,s)
                            if res.get('code')!=1:
                                return json_result(res.get('code'), res.get('code'))
        s.commit()
        return json_result(1, '保存成功！')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/tjcw/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_tjcw_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fklx = j.get('sccj','')
        hzhj = j.get('hzhj',0)
        fkbh = j.get('fkbh','')
        tjcw = j.get('tjcw','')
        
        sb1 = '0'
        strid = ''
        tjcw1 = ''
        
        if fklx == '预付款':
            d = run_sql(f"select cs from zx where mc = '预付额度'")
            if len(d)>0:
                if float(d[0].get('cs',0)) < hzhj and float(d[0].get('cs',0)) > 0:
                    sb1 = '1'
        else:
            d = run_sql(f"select cs from zx where mc = '提前额度'")
            if len(d)>0:
                if float(d[0].get('cs',0)) < hzhj and float(d[0].get('cs',0)) > 0:
                    sb1 = '1'
                    
        d = run_sql(f"select rid,tjcw from fksp where fkbh='{str(fkbh)}'")
        if len(d)>0:
            strid = d[0].get('rid','')
            tjcw1 = d[0].get('tjcw','')
        if tjcw1 != tjcw:
            if tjcw != user.username:
                if sb1 == '1':
                    ds = run_sql(f"select wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and ((wb5='{str(tjcw)}') or (wb9='{str(tjcw)}'))")
                else:
                    ds = run_sql(f"select wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and ((wb4='{str(tjcw)}') or (wb5='{str(tjcw)}') or (wb8='{str(tjcw)}') or (wb9='{str(tjcw)}'))")
                if len(ds)==0:
                    return json_result(0, '不好意思,此人没有审批权限,请重新选择,谢谢!', '')
                         
            else:
                return json_result(0, '不好意思,自已不能审批自已,请重新选择,谢谢!', '')
            
        return json_result(1, '查询成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/tjzg/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_tjzg_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh','')
        tjzg = j.get('tjzg','')
        jbry = j.get('jbry','')
        
        tjjl = ''
        bm = ''
        wb2= ''
        wb3= ''
        wb4= ''
        wb8= ''
        
        d = run_sql(f"select rid,tjjl from fksp where fkbh='{str(fkbh)}'")
        if len(d)>0:
            tjjl = d[0].get('tjjl')
        if tjjl != tjzg:
            d = run_sql(f"select wb1,wb2,wb3,wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and (wb1='{str(tjzg)}')")
            if len(d)==0:
                return json_result(0, '不好意思,此人没有审批权限,请重新选择,谢谢!', '')
        else:
            d = run_sql(f"select bm from ywrybiao where yhm='{str(jbry)}'")
            if len(d)>0:
                bm = d[0].get('bm','')
            
            ds = run_sql(f"select wb1,wb2,wb3,wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and (wb1='{str(tjzg)}') and (mc=''{str(bm)})")
            wb2 = ds[0].get('wb2',0)
            wb3 = ds[0].get('wb3',0)
            wb4 = ds[0].get('wb4',0)
            wb8 = ds[0].get('wb8',0)
            
        data = {'bm':bm,'wb2':wb2,'wb3':wb3,'wb4':wb4,'wb8':wb8}
                    
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/tjzjl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_tjzjl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh','')
        tjzjl = j.get('tjzjl','')
        
        tjzjl1 = ''
        
        d = run_sql(f"select rid,tjzjl from fksp where fkbh='{str(fkbh)}'")
        if len(d)>0:
            tjzjl1 = d[0].get('tjzjl')
        if tjzjl1 != tjzjl:
            d = run_sql(f"select wb3 from zx where (ly='付款审批') and (wb3='{str(tjzjl)}')")
            if len(d)==0:
                return json_result(0, '不好意思,此人没有审批权限,请重新选择,谢谢!', '')
            
        return json_result(1, '查询成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/tjzj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_tjzj_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh','')
        tjzj = j.get('tjzj','')
        
        tjzj1 = ''
        
        d = run_sql(f"select rid,tjfk from fksp where fkbh='{str(fkbh)}'")
        if len(d)>0:
            tjzj1 = d[0].get('tjfk')
        if tjzj1 != tjzj:
            d = run_sql(f"select wb2 from zx where (ly='付款审批') and (wb2='{str(tjzj)}')")
            if len(d)==0:
                return json_result(0, '不好意思,此人没有审批权限,请重新选择,谢谢!', '')
            
        return json_result(1, '查询成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/zjsb/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_zjsb_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkbh = j.get('fkbh','')
        cxje = 0
        d = run_sql(f"select sz from cyzglsheet where (xm='{str(user.username)}') and (zm='总监付款审批限额')")
        if len(d)>0:
            cxje = d[0].get('sz','')
        data = {"cxje":cxje}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/cwgc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_cwgc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cwgc = j.get('cwgc','')
        cwgcdata = 0
        bank = ''
        zh = ''
        shui = ''
        d = run_sql(f"select company_name,bank,zh,shui from newcwcs where (company_name='{str(cwgc)}')")
        if len(d)>0:
            cwgcdata = 1
            bank = d[0].get('bank','')
            zh = d[0].get('zh','')
            shui = d[0].get('shui','')
        data = {"cwgcdata":cwgcdata,"bank":bank,"zh":zh,"shui":shui}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/csmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_csmc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        csmc = j.get('csmc','')
        csmcdata = 0
        d = run_sql(f"select rid from bmlgc where (gcmc='{str(csmc)}')")
        if len(d)>0:
            csmcdata = 1
        data = {"csmcdata":csmcdata}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/sqje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_sqje_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sqje = j.get('sqje',0)
        mlsb = j.get('mlsb','')
        fklx = j.get('fklx','')
        rtscgdh = j.get('rtscgdh','')
        gcbh = j.get('gcbh','')
        cxhc = ''
        
        d = run_sql(f"select sz from cyzglsheet where xm='公司' and zm='抹零金额'")
        if len(d)>0:
            if sqje <= d[0].get('sz',0):
                mlsb = '否'
        
        if sqje > 0 and mlsb == '':
            if (fklx == '预付款' or fklx == '提前付款') and rtscgdh == '':
                sqje = math.trunc(sqje / 10) * 10
        
        cxjez1 = 0
        d = run_sql(f"select cs,sz1 from zx where mc='诚信金额'")
        if len(d)>0:
            cxjez1 = d[0].get('sz1',0)
            if cxjez1 == 0:
                cxjez1 = 1000000
        if sqje > cxjez1:
            d = run_sql(f"select cxhc from zycs where (cs_id='{str(gcbh)}')")
            if len(d)>0:
                cxhc = d[0].get('cxhc',0)
                
        data = {"mlsb":mlsb,"cxhc":cxhc}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/fphm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_fphm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fphm = j.get('fphm','')
        cwgc = j.get('cwgc','')
        csmc = j.get('csmc','')
        
        khmc = ''
        RMBkh = ''
        kh_id = ''
        bggs = ''
        fphmdata = 0
        chrq = 0
        d = run_sql(f"select khmc,RMBkh,kh_id,bggs from cymx where (fphm='{str(fphm)}')")
        if len(d)>0:
            khmc = d[0].get('khmc','')
            RMBkh = d[0].get('RMBkh','')
            kh_id = d[0].get('kh_id','')
            bggs = d[0].get('bggs','')
            fphmdata = 1
        else:
            d = run_sql(f"select customer,khpd,kh_id from wxht where (order_id='{str(fphm)}')")
            if len(d)>0:
                khmc = d[0].get('customer','')
                RMBkh = d[0].get('khpd','')
                kh_id = d[0].get('kh_id','')
                bggs = ''
                fphmdata = 1
                
        d = run_sql(f"select chrq from gchk where (wxfp='{str(fphm)}') and ((gcmc='{str(cwgc)}') or (gcmc1='{str(csmc)}')) and (chrq<>"") and (chrq is not null) limit 1")
        if len(d)>0:
            chrq = d[0].get('chrq','')
            
        data = {"fphmdata":fphmdata,"khmc":khmc,"RMBkh":RMBkh,"kh_id":kh_id,"bggs":bggs,"chrq":chrq}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/cwsb/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_cwsb_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        fphm = j.get('fphm','')
        wfgs = j.get('wfgs','')
        tjzg = j.get('tjzg','')
        fklx = j.get('fklx','')
        sqje = j.get('sqje',0)
        
        cwzj = ''
        jesx1 = 0
        fkxe = '付款审批付款限额'
        # fkdy = '付款审批付款财务'
        # srid = ''
        
        if ('AMAZON' in khmc.upper()) or ('AMZ' in fphm.upper()) or (wfgs == '宁波景业国际贸易有限公司'):
            fkxe = '电商付款审批付款限额'
            # fkdy = '电商付款审批付款财务'
            d = run_sql(f"select wb1,wb2,wb3,wb4,wb5,wb8,wb9 from zx where (ly='付款审批') and (wb1='{str(tjzg)}')")
            if len(d)>0:
                cwzj = d[0].get('wb9','')
                
        d = run_sql(f"select * from zx where ly='{str(fkxe)}'")
        if len(d)>0:
            if fklx == '预付款':
                if d[0].get('wb1','') == '预付款':
                    jesx1 = d[0].get('sz1',0)
                    if sqje > jesx1:
                        cwzj = d[0].get('wb2','')
            
            if fklx == '提前付款':
                if d[0].get('wb3','') == '提前付款':
                    jesx1 = d[0].get('sz2',0)
                    if sqje > jesx1:
                        cwzj = d[0].get('wb4','')
                        
            if fklx == '预付款':
                if d[0].get('wb5','') == '预付款':
                    jesx1 = d[0].get('sz3',0)
                    if sqje > jesx1:
                        cwzj = d[0].get('wb6','')
                        
        d = run_sql(f"select dymc from zxsheet where (ly='付款审批') and (sj='{user.username.upper()}') and (lx='付款审批财务') and (xtxh>0)")
        if len(d)>0:
            cwzj = d[0].get('dymc','')

        # cw1 = ''
        # cw2 = ''
        # d = run_sql(f"select * from zx where (ly='{str(fkdy)}')")
        # if len(d)>0:
        #     if sfkp == '是':
        #         if d[0].get('wb1','') == '开票':
        #             cw1 = d[0].get('wb2','')
        #     else:
        #         if d[0].get('wb3','') == '现金':
        #             cw1 = d[0].get('wb4','')
                    
        # d = run_sql(f"select rid from fksp where (fkbh='{str(bjdh)}')")
        # if len(d)>0:
        #     srid = d[0].get('rid','')
        
        data = {"cwzj":cwzj}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/fkfp/sqje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_fkfp_sqje_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cght = j.get('cght','')
        fkbh = j.get('fkbh','')

        yfhj = 0
        seje1 = 0
        lszk1 = 0
        if fkbh != '':
            d = run_sql(f"select sum(seje) as seje1 from fkspsheet3 where (hthm='{str(cght)}') and (fkbh<>'{str(fkbh)}')")
        else:
            d = run_sql(f"select sum(seje) as seje1  from fkspsheet3 where  (hthm='{str(cght)}')")
        if len(d)>0:
            yfhj = d[0].get('seje1',0)
            
        d = run_sql(f"select sum(seje) as seje1,sum(zkfy1) as lszk1 from fkspsheet where  (hthm='{str(cght)}')")
        if len(d)>0:
            seje1 = d[0].get('seje1',0)
            lszk1 = d[0].get('lszk1',0)
            
        data = {"yfhj":yfhj,"seje1":seje1,"lszk1":lszk1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/fkfp/cght/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_fkfp_cght_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cght = j.get('cght','')
        fktt = j.get('fktt','')

        ttsb12 = ''
        ttsb = ''
        fktt1 = ''
        rtspdata = 0
        rtspdata1 = {}
        zzsl= 0
        cpbh = ''
        zsl = ''
        zwpm = ''
        yjcq = ''
        yjch1 = ''
        yfhj = 0
        seje1 = 0
        lszk1 = 0
        
        d = run_sql(f"select fktt from bgmxdsheet where (cght='{str(cght)}')")
        if len(d)>0:
            ttsb12 = d[0].get('fktt','')

        d = run_sql(f"select fktt from ytfysheet where (cght='{str(cght)}')")
        if len(d)>0:
            ttsb12 = d[0].get('fktt','')
        
        if not (ttsb12 != '' and ttsb12 != fktt):
            father =''
            father1 =''
            d = run_sql(f"select fktt from fkspsheet3 where (hthm='{str(cght)}')")
            if len(d)>0:
                fktt1 = d[0].get('fktt','')
                if fktt1 != fktt:
                    ttsb = '1'
            if ttsb != '1':
                if cght != '' and sb !='':
                    ds = run_sql(f"select rid,hthm,jhrq,wfgs,khmc,ywry,cgry,gcdh,lxry,sjhm,htje,sccj1,gdry,yhje,htrq,jsfs,hbdm,gdbm,cgbm,wxht,kpgc,sccj1id,wxbm,sfsh from cght where (hthm='{str(cght)}')")
                    if len(ds)==0:
                        d = run_sql(f"select * from rtspurchaseorder where (PurchaseOrderNo='{str(cght)}')")
                        if len(d)==0:
                            rtspdata = 1
                        else:
                            rtspdata = 2
                            rtspdata1 = {'DeliveryDate':d[0].get('DeliveryDate',''),'OurCompany':d[0].get('OurCompany',''),
                                         'Purchaser':d[0].get('Purchaser',''),'TotalPurchaseAmount':d[0].get('TotalPurchaseAmount',0),
                                         'OrderDate':d[0].get('OrderDate',''),'SettlementMethod':d[0].get('SettlementMethod',''),
                                         'PurchaseCurrency':d[0].get('PurchaseCurrency',''),'Department':d[0].get('Department',''),'kpgc':d[0].get('kpgc','')}
                            father1 = d[0].get('rid','')
                            
                    else:
                        rtspdata = 3
                        rtspdata1 = {'jhrq':ds[0].get('jhrq',''),'wfgs':ds[0].get('wfgs',''),'khmc':ds[0].get('khmc',''),'ywry':ds[0].get('ywry',''),
                                    'cgry':ds[0].get('cgry',''),'gcdh':ds[0].get('gcdh',''),'lxry':ds[0].get('lxry',''),'sjhm':ds[0].get('sjhm',''),
                                    'htje':ds[0].get('htje',0),'gdry':ds[0].get('gdry',''),'yhje':ds[0].get('yhje',0),'htrq':ds[0].get('htrq',''),
                                    'jsfs':ds[0].get('jsfs',''),'hbdm':ds[0].get('hbdm',''),'gdbm':ds[0].get('gdbm',''),'cgbm':ds[0].get('cgbm',''),
                                    'wxht':ds[0].get('wxht',''),'kpgc':ds[0].get('kpgc',''),'wxbm':ds[0].get('wxbm',''),'sfsh':ds[0].get('sfsh','')}
                        father = d[0].get('rid','')

                    if father1 != '':
                        d = run_sql(f"select * from rtspurchaseordergoods where (pid='{str(father1)}')")
                        if len(d)>0:
                            for r in d:
                                if r.get('VAT',0) > 0:
                                    zzsl = str(r.get('VAT',0))
                                if cpbh == '':
                                    cpbh = r.get('ProductNo','')
                                else:
                                    cpbh = cpbh + "\r\n" + r.get('ProductNo','')
                                if zsl == '':
                                    zsl = r.get('Quantity','') + r.get('UnitOfMeasurement','')
                                else:
                                    zsl = zsl + "\r\n" + r.get('Quantity','') + r.get('UnitOfMeasurement','')
                                if zwpm == '':
                                    zwpm = r.get('ProductName','')
                                else:
                                    zwpm = zwpm + "\r\n" + r.get('ProductName','')
                                    
                    if father != '':
                        d = run_sql(f"select bjhh,zwpm,cgsl,jldw,zzsl,yjcq from cghtsheet where (pid='{str(father)}')")
                        if len(d)>0:
                            for r in d:
                                if r.get('yjcq','') !='':
                                    yjch1 = r.get('yjcq','')
                                if yjcq == '':
                                    yjcq = r.get('yjcq','')
                                else:
                                    yjcq = yjcq + "\r\n" + r.get('yjcq','')
                                if r.get('VAT',0) > 0:
                                    zzsl = str(r.get('VAT',0))
                                if cpbh == '':
                                    cpbh = r.get('ProductNo','')
                                else:
                                    cpbh = cpbh + "\r\n" + r.get('ProductNo','')
                                if zsl == '':
                                    zsl = r.get('Quantity','') + r.get('UnitOfMeasurement','')
                                else:
                                    zsl = zsl + "\r\n" + r.get('Quantity','') + r.get('UnitOfMeasurement','')
                                if zwpm == '':
                                    zwpm = r.get('ProductName','')
                                else:
                                    zwpm = zwpm + "\r\n" + r.get('ProductName','')
                    if cght != '':
                        d = run_sql(f"select sum(seje) as seje1  from fkspsheet3 where  (hthm='{str(cght)}')")
                        if len(d)>0:
                            yfhj = d[0].get('seje1',0)
                        
                        d = run_sql(f"select sum(seje) as seje1,sum(zkfy1) as lszk1 from fkspsheet where  (hthm='{str(cght)}')")
                        if len(d)>0:
                            seje1 = d[0].get('seje1',0)
                            lszk1 = d[0].get('lszk1',0)

        data = {"ttsb12":ttsb12,"ttsb":ttsb,"fktt1":fktt1,"rtspdata":rtspdata,"rtspdata1":rtspdata1,"zzsl":zzsl,"cpbh":cpbh,"zsl":zsl,"zwpm":zwpm,"yjcq":yjcq,"yjch1":yjch1,"yfhj":yfhj,"seje1":seje1,"lszk1":lszk1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/cpzl/sqje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_cpzl_sqje_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        cght = j.get('cght','')
        ywfp = j.get('ywfp','')
        cywyzd = j.get('cywyzd','')
        wxwyzd = j.get('wxwyzd','')
        jsfs = j.get('jsfs','')
        jcrq = j.get('jcrq','')

        sqjedata = 0
        seje1 = 0
        sb = ''

        d = run_sql(f"select sum(seje) as seje1 from fkspsheet where (pid<>'{str(rid)}') \
            and (cwsp='通过')  and (hthm='{str(cght)}') and (wxfp='{str(ywfp)}') and (cywyzd='{str(cywyzd)}') and (wxwyzd='{str(wxwyzd)}')")
        if len(d)>0:
            sqjedata = 1
            seje1 = d[0].get('seje1',0)
            
        d = run_sql(f"select jsts,jsjc,week from jsfs where ('" + jsfs + "' like '%' + jsfs + '%' ) limit 1")
        if len(d)>0:
            if ('进仓' in d[0].get('jsjc')):
                if jcrq == '':
                 sb = '1'

        data = {"sqjedata":sqjedata,"seje1":seje1,"sb":sb}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/cpzl/jsfs/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_cpzl_jsfs_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        jsfs = j.get('jsfs','')
        yjch = j.get('yjch','')

        jsts = ''
        jsjc = ''
        week = ''
        jsts = 45
        sz1 = 0

        d = run_sql(f"select jsts,jsjc,week from jsfs where ('" + jsfs + "' like '%' + jsfs + '%' ) limit 1")
        if len(d)>0:
            jsts = d[0].get('jsts','')
            jsjc = d[0].get('jsjc','')
            week = d[0].get('week','')
        
        if yjch != '':
            d = run_sql(f"select cs,sz1 from zx where ly='财务付款结算期'")
            if len(d)>0:
                jsts = math.trunc(d[0].get('cs',0))
                sz1 = math.trunc(d[0].get('sz1',0))

        data = {"jsts":jsts,"jsjc":jsjc,"week":week,'jsts':jsts,'sz1':sz1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/zcfkxq/sb/change', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_zcfkxq_sb_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:

        sb = j.get('sb','')
        rid = j.get('rid','')
        ysqje1 = j.get('ysqje',0)
        
        yjch = j.get('yjch','')
        
        zwpm12 = []
        yfqk12 = []

        sb1 = ''
        zwpm1 = ''
        yffp = 0
        yfhj = 0
        tqhj = 0
        tqfp = 0
        seje1 = "0"
        
        sbdata = 0
        sbdata1 = {}
        
        d = run_sql(f"select rid from gchk where sb='{str(sb)}'")
        if len(d)>0:
            sb1 = '本地'
            ds = run_sql(f"select * from gchksheet where pid='{str(rid)}'")
            if len(ds)>0:
                for r in ds:
                    zwpm_val = r.get('zwpm', '')
                    if zwpm_val not in zwpm12:
                        zwpm12.append(zwpm_val)
                        if zwpm1 == "":
                            zwpm1 = zwpm_val
                        else:
                            zwpm1 += "\r\n" + zwpm_val

                    fphm = r.get('fphm', '')
                    cght = r.get('cght', '')
                    ysqje = r.get('ysqje', '')
                    yfje1 = r.get('yfje1', '')
                    fkxq = r.get('fkxq', '')

                    yfqk_key = (
                        f"发票号码{fphm};合同号:{cght};提前付款:{ysqje};"
                        f"预付金额:{yfje1};付款详情:{fkxq}"
                    )

                    if yfqk_key not in yfqk12:
                        yfqk12.append(yfqk_key)
                        if yfqk == "":
                            yfqk = yfqk_key
                        else:
                            yfqk += "\r\n" + yfqk_key
                    
                    yffp = yffp + r.get('yfje1',0)
                    tqfp = yffp + r.get('tqfp',0)
                    dt = run_sql(f"select sum(seje) as seje1 from fkspsheet3 where (hthm='{str(r.get('cght',''))}') and (cwsp='通过')")
                    if len(dt)>0:
                        yfhj = yfhj + dt[0].get('seje1',0)
                    
                    dy = run_sql(f"select sum(seje) as seje2 from fkspsheet where (hthm='{str(r.get('cght',''))}') and (cwsp='通过')")
                    if len(dy)>0:
                        tqhj = tqhj + dt[0].get('seje2',0)
        
        if ysqje1 == 0:
            d = run_sql(f"select sum(seje) as seje1 from fkspsheet4 where sb='{str(sb)}'")
            if len(d)>0:
                seje1 = float(d[0].get('seje1',0))
                    
        d = run_sql(f"select * from gchk where sb='{str(sb)}'")
        if len(d)>0:
            sbdata = 1
            sbdata1 = d[0]
            
        data = {"sb1":sb1,"zwpm1":zwpm1,"yffp":yffp,'yfhj':yfhj,'tqhj':tqhj,"tqfp":tqfp,"seje1":seje1,"sbdata":sbdata,"sbdata1":sbdata1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/button/scyfhk', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_scyfhk(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')

        sb = '' 
        fkbh = ''
        cwsp = ''
        fklx = ''
        tjcw = ''
        path = ''
        yfhkdata = {}
        flag = False
        d = run_sql(f"select rid,path,position,path from sys_user where (username='{user.username}') and (position like '%财务%' or memo like '%财务%') limit 1")
        if len(d)>0:
            sb = '1'
            path = str(d[0].get('path',''))[:100]
            ds = run_sql(f"select fkbh,wxfp,fphm,hthm,hzhj,sqrq1,seje,fkbz,\
                        chrq,jbry,cwgc,csmc,yhzh,khh,gcbh,zfxs,fkdq,zwpm,ywbm,\
                        rxfs,hklx,fkxs,tjcw,cwsp,fklx from fksp where (rid='{str(rid)}')")
            if len(ds)>0:
                yfhkdata = ds[0]
                fkbh = ds[0].get('fkbh','')
                cwsp = ds[0].get('cwsp','')
                fklx = ds[0].get('fklx','')
                tjcw = ds[0].get('tjcw','')
                
        if sb == '1':
            if (fkbh != '') and (tjcw == user.username or sb == '1') and (cwsp == '通过') and (fklx == '预付款'):
                d = run_sql(f"select rid from yfhk where fkbh='{str(fkbh)}'")
                if len(d)>0:
                    return json_result(-1, '不好意思,付款编号已有预付款!')
                else:
                    m = yfhk()
                    for k,v in yfhkdata.items():
                        setattr(m,k,v)
                    srid = get_uuid()
                    m.rid = srid
                    m.uid = user.rid
                    m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                    m.sys_path = path
                    m.sqrq = yfhkdata.get("sqrq1", '')
                    m.wyzd = '优景本地' + fkbh + user.username + time.strftime("%Y-%m-%d %H:%M:%S")
                    m.wyzd = time.strftime("%Y-%m-%d")
                    m.sb = '优景本地' + fkbh + user.username + time.strftime("%Y-%m-%d %H:%M:%S")
                    s.add(m)
                    flag = True
                    
                    d = run_sql(f"select hthm,seje,csmc,rxfs,rxr,sjhm from fkspsheet3 where pid='{str(rid)}'")
                    if len(d)>0:
                        for r in d:
                            ms = gcdjsheet()
                            ms.rid = get_uuid()
                            ms.pid = srid
                            ms.uid = user.rid
                            ms.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                            ms.cght = r.get('hthm','')
                            ms.sydje= r.get('seje',0)
                            ms.gcmc = r.get('csmc','')
                            ms.rxfs = r.get('rxfs','')
                            ms.rxr = r.get('rxr','')
                            ms.sjhm = r.get('sjhm','')
                            ms.fkbh = fkbh
                            s.add(ms)
        if flag == True:
            s.commit()
            return json_result(1, '新增成功', srid)
        
        return json_result(1, '操作成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/button/cwtssp', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_cwtssp(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        fphm = j.get('fphm','')
        tjcw = j.get('tjcw','')
        wfgs = j.get('wfgs','')
        
        cwtsspdata = 0
        cwzj = ''
        if ('AMAZON' in khmc.upper()) or ('AMZ' in fphm.upper()) or (wfgs == '宁波景业国际贸易有限公司'):
            d = run_sql(f"select wb5,wb9 from zx where (ly='付款审批') and (wb8='{str(tjcw)}')")
            if len(d)>0:
                cwtsspdata = 1
                cwzj = d[0].get('wb9','')
        else:
            d = run_sql(f"select wb5,wb9 from zx where (ly='付款审批') and (wb4='{str(tjcw)}')")
            if len(d)>0:
                cwtsspdata = 1
                cwzj = d[0].get('wb5','')
        data = {'cwtsspdata':cwtsspdata,'cwzj':cwzj}
        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/button/fksbm', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_fksbm(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        
        flag = False
        d = run_sql(f"select cgry from fkspsheet group by cgry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('cgry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'cgbm':ds[0].get('bm','')}
                        s.query(fkspsheet).filter(fkspsheet.cgry == str(r.get('cgry',''))).update(update_json)
                        flag = True
                        
        d = run_sql(f"select gdry from fkspsheet group by gdry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('gdry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'gdbm':ds[0].get('bm','')}
                        s.query(fkspsheet).filter(fkspsheet.gdry == str(r.get('gdry',''))).update(update_json)
                        flag = True
        
        d = run_sql(f"select ywry from fkspsheet group by ywry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('ywry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'wxbm':ds[0].get('bm','')}
                        s.query(fkspsheet).filter(fkspsheet.ywry == str(r.get('ywry',''))).update(update_json)
                        flag = True
                        
        d = run_sql(f"select rid,jbry from fksp")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm = '{r.get('jbry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'ywbm':ds[0].get('bm','')}
                        s.query(fkspsheet).filter(fkspsheet.pid == str(r.get('rid',''))).update(update_json)
                        s.query(fkspsheet3).filter(fkspsheet3.pid == str(r.get('rid',''))).update(update_json)
                        s.query(fkspsheet2).filter(fkspsheet2.pid == str(r.get('rid',''))).update(update_json)
                        s.query(fksp).filter(fksp.pid == str(r.get('rid',''))).update(update_json)
                        flag = True
                        
        d = run_sql(f"select cgry from fkspsheet3 group by cgry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('cgry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'cgbm':ds[0].get('bm','')}
                        s.query(fkspsheet3).filter(fkspsheet3.cgry == str(r.get('cgry',''))).update(update_json)
                        flag = True
        
        d = run_sql(f"select gdry from fkspsheet3 group by gdry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('gdry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'gdbm':ds[0].get('bm','')}
                        s.query(fkspsheet3).filter(fkspsheet3.gdry == str(r.get('gdry',''))).update(update_json)
                        flag = True
                
        d = run_sql(f"select ywry from fkspsheet3 group by ywry")
        if len(d)>0:
            for r in d:
                ds = run_sql(f"select bm from ywrybiao where yhm='{r.get('ywry','')}'")
                if len(ds)>0:
                    if ds[0].get('bm','') != '':
                        update_json = {'wxbm':ds[0].get('bm','')}
                        s.query(fkspsheet3).filter(fkspsheet3.ywry == str(r.get('ywry',''))).update(update_json)
                        flag = True
                        
        if flag == True:
            s.commit()

        return json_result(1, '更新成功！')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/button/sxtj', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_fksbm(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        tjzg = j.get('tjzg','')
        tjzz = j.get('tjzz','')
        tjzjl = j.get('tjzjl','')
        tjcw = j.get('tjcw','')
        zgsp = j.get('zgsp','')
        zjsp = j.get('zjsp','')
        zjlsp = j.get('zjlsp','')
        cwsp = j.get('cwsp','')
        fklx = j.get('fklx','')
        fkbh = j.get('fkbh','')
        
        flag = False
        
        if tjzg !='' and (tjzz =='' or tjzjl =='' or tjcw == ''):
            d = run_sql(f"select wb1,wb2,wb3,wb4,wb5 from zx where (ly='付款审批') and (wb1='{str(tjzg)}')")
            if len(d)>0:
                tjzz = d[0].get('wb2','')
                tjzjl = d[0].get('wb3','')
                tjcw = d[0].get('wb4','')
                update_json = {'tjfk':d[0].get('wb2',''),'tjzjl':d[0].get('wb3',''),'tjcw':d[0].get('wb4','')}
                s.query(fksp).filter(fksp.rid == str(rid)).update(update_json)
                flag = True
        
        spsq = ''
        if tjzg != '' and zgsp == '待审核':
            spsq = tjzg
        else:
            if tjzz != '' and zgsp =='通过' and zjsp == '待审批':
                spsq = tjzz
            else:
                if tjzjl != '' and zjsp =='通过' and zjlsp == '待审批':
                    spsq = tjzjl
                else:
                    if tjcw != '' and zjlsp =='通过' and cwsp == '待审批':
                        spsq = tjcw

        if spsq != '':
            xxnr = '[审批]' + user.username + '的' + fklx + '审批:' + fkbh + '需审批,日期:' + time.strftime("%Y-%m-%d %H:%M:%S")
            res = user_task_new('付款审批', rid, '付款编号',xxnr, user, s, [spsq])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            flag = True
        
        if flag == True:
            s.commit()

        return json_result(1, '更新成功！')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/button/cxsp', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_cxsp(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        
        d = run_sql(f"select rid from fksp where (rid='{str(rid)}') and (jbry='{str(user.username)}') and (jlhz='待审批')")
        if len(d)>0:
            update_json = {'tjjl':'','tjfk':'','tjzjl':'','tjcw':'','cwsp':'待审批','zjlhz':'待审批','zjhz':'待审批'} 
            s.query(fksp).filter(fksp.rid == str(rid)).update(update_json)
            
            res = user_task_delete('付款审批', rid, s, [])
            if res.get('code',1) != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))
            
            s.commit()
            
        else:
            return json_result(-1, '不好意思已批,撤单无效!')
        
        return json_result(1, '撤销成功！')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/button/cxscfkbh', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_cxscfkbh(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        fkbh = j.get('fkbh','')
        rtscgdh = j.get('rtscgdh','')
        
        d = run_sql(f"select fkbh from fksp where (fkbh='{fkbh}') and (jbry<>'{user.username}')")
        if len(d)>0:
            fkbh = '1'
            
        if fkbh == '1':
            kpxh1 = datetime.now().strftime("%y-%m-")
            d = run_sql(f"select fkbh from fksp where fkbh like '%{str(kpxh1)}%' order by fkbh desc limit 1")
            if len(d)>0:
                fkbh = d[0].get('fkbh','')
                num_part = fkbh[6:11]
                kpxhz = int(num_part) + 1
            else:
                kpxhz = 1
                
            kpxh = kpxh1 + f"{kpxhz:05d}"
            if rtscgdh != '':
                fkbh1 = kpxh + 'RT'
            else:
                fkbh1 = kpxh + 'FK'
            return json_result(1, '生成成功！',fkbh1)
            
        else:
            return json_result(-1, '请注意付款编号没有重复!')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_approval/button/sxcwjsq', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_sxcwjsq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
           
        flag = False
        d = run_sql(f"select * from fkspsheet where cwjsq="" or cwjsq is null")
        if len(d)>0:
            for r in d:
                htjsq = ''
                cwjsq = ''
                if r.get('cywyzd','') != '':
                    if r.get('jsfs','') != '':
                        sw = 0
                        s1 = 0
                        ds = run_sql(f"select jsts,jsjc,week from jsfs where ('" + r.get('jsfs','') + "' like '%' + jsfs + '%' ) limit 1")
                        if len(ds)>0:
                            if "进仓" in r.get('jsfs',''):
                                if r.get('scrq','') != "":
                                    scrq = datetime.strptime(r.get('scrq',''), "%Y-%m-%d")
                                    
                                    if ds[0].get('week',0) > 0:
                                        base_date = scrq + timedelta(days=ds[0].get('jsts',0))
                                        python_weekday = base_date.weekday()  
                                        sw = (python_weekday + 1) % 7 + 1
                                        
                                        if sw > ds[0].get('week',0):
                                            s1 = 7 - sw + ds[0].get('week',0)
                                            htjsq_date = base_date + timedelta(days=s1)
                                        elif sw < ds[0].get('week',0):
                                            s1 = ds[0].get('week',0) - sw
                                            htjsq_date = base_date + timedelta(days=s1)
                                        else:
                                            htjsq_date = base_date
                                        
                                        htjsq = htjsq_date.strftime("%Y-%m-%d %H:%M:%S")
                                    else:
                                        htjsq_date = scrq + timedelta(days=ds[0].get('jsts',0))
                                        htjsq = htjsq_date.strftime("%Y-%m-%d %H:%M:%S")

                            if "出运" in r.get('jsfs',''):
                                if r.get('yjch','') != "":
                                    yjch = datetime.strptime(r.get('yjch',''), "%Y-%m-%d")

                                    if ds[0].get('week',0) > 0:
                                        base_date = yjch + timedelta(days=ds[0].get('jsts',0))
                                        
                                        python_weekday = base_date.weekday()  # Mon=0, Sun=6
                                        sw = (python_weekday + 1) % 7 + 1      # → 1~7
                                        
                                        if sw > ds[0].get('week',0):
                                            s1 = 7 - sw + ds[0].get('week',0)
                                            htjsq_date = base_date + timedelta(days=s1)
                                        elif sw < ds[0].get('week',0):
                                            s1 = ds[0].get('week',0) - sw
                                            htjsq_date = base_date + timedelta(days=s1)
                                        else:
                                            htjsq_date = base_date
                                        
                                        htjsq = htjsq_date.strftime("%Y-%m-%d %H:%M:%S")
                                    else:
                                        htjsq_date = yjch + timedelta(days=ds[0].get('jsts',0))
                                        htjsq = htjsq_date.strftime("%Y-%m-%d %H:%M:%S")
                    
                        if r.get('yjch','') != '':
                            cwjsq =''
                            sw = 0
                            s1 = 0
                            jsts = 45
                            sz1 = 0
                            ds = run_sql(f"select cs,sz1 from zx where ly='财务付款结算期'")
                            if len(ds)>0:
                                jsts = math.trunc(ds[0].get('cs',0))
                                sz1 = math.trunc(ds[0].get('sz1',0))
                                
                            if r.get('yjch','') != "":
                                yjch = datetime.strptime(r.get('yjch',''), "%Y-%m-%d")
                            else:
                                if sz1 > 0:
                                    base_date = yjch + timedelta(days=jsts)
                                    
                                    python_weekday = base_date.weekday() 
                                    sw = (python_weekday + 1) % 7 + 1 
                                    
                                    if sw > sz1:
                                        s1 = 7 - sw + sz1
                                    elif sw < sz1:
                                        s1 = sz1 - sw
                                    else:
                                        s1 = 0
                                    
                                    result_date = base_date + timedelta(days=s1)
                                    cwjsq = result_date.strftime("%Y-%m-%d %H:%M:%S")
                                else:
                                    result_date = yjch + timedelta(days=jsts)
                                    cwjsq = result_date.strftime("%Y-%m-%d %H:%M:%S")
                            
                        
                update_json = {'htjsq':htjsq,'cwjsq':cwjsq} 
                s.query(fkspsheet).filter(fkspsheet.rid == str(r.rid)).update(update_json)
                flag = True
                
        if flag == True:
            s.commit()

        return json_result(1, '更新成功!')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/payment_approval/button/gxyfhk', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_approval_button_gxyfhk(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')

        sb = '' 
        fkbh = ''
        tjcw = ''
        cwsp = ''
        fklx = ''
        seje = 0
        
        path = ''
        yfhkdata = {}
        flag = False
        d = run_sql(f"select rid,path,position,path from sys_user where (username='{user.username}') and (position like '%财务% ' or memo like '%财务%') limit 1")
        if len(d)>0:
            sb = '1'
            path = str(d[0].get('path',''))[:100]
            ds = run_sql(f"select fkbh,seje,cwsp,fklx,tjcw where (rid='{str(rid)}')")
            if len(ds)>0:
                yfhkdata = ds[0]
                fkbh = ds[0].get('fkbh','')
                tjcw = ds[0].get('tjcw','')
                cwsp = ds[0].get('cwsp','')
                fklx = ds[0].get('fklx','')
                seje = ds[0].get('seje',0)
        
        if sb == '1':
            if fkbh != '' and fklx == '预付款':
                d = run_sql(f"select rid,sqje from yfhk where fkbh='{str(fkbh)}'")
                if len(d)>0:
                    if seje != d[0].get('sqje',0):
                        return json_result(-1, '请注意现申请金额和财务预付货款中的金额不一致，不能更新')
                else:
                    srid = d[0].get('rid','')
                    if srid != '':
                        l = s.query(gcdjsheet).filter(gcdjsheet.pid==srid).all()
                        for r in l:
                            s.delete(r)
                    
                        d = run_sql(f"select hthm,seje,csmc,rxfs,rxr,sjhm from fkspsheet3 where (pid='{str(rid)}') and (seje>0)")
                        if len(d)>0:
                            for r in d:
                                ms = gcdjsheet()
                                ms.rid = get_uuid()
                                ms.pid = srid
                                ms.uid = user.rid
                                ms.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                                ms.cght = r.get('hthm','')
                                ms.sydje= r.get('seje',0)
                                ms.gcmc = r.get('csmc','')
                                ms.rxfs = r.get('rxfs','')
                                ms.rxr = r.get('rxr','')
                                ms.sjhm = r.get('sjhm','')
                                ms.fkbh = fkbh
                                s.add(ms)
        if flag == True:
            s.commit()
            return json_result(1, '更新成功', srid)
        
        return json_result(1, '操作成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()