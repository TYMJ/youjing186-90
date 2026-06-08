from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time,re
import shutil,json,os
from starlette.background import BackgroundTask
from .__default__ import module_share_new, module_xxck_new, get_user_path,user_task_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

#样品入库保存前校验
@any_route('/api/saier/samplestorage/before/save', methods=['POST', 'GET'])
@require_token
async def view_saier_samplestorage_before_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    flag = False
    try:
        rkxq = j.get('rkxq',[])
        if len(rkxq)==0:
            return json_result(0, '校验成功，无样品入库明细')
        
        for row in rkxq:
            d = s.query(ypglsheet1.pid).filter(ypglsheet1.wyzd==str(row.get('wyzd','')), ypglsheet1.pid==str(row.get('ypnumber',''))).first()
            if not d:
                m = ypglsheet1()
                for k,v in row.items():
                    if k in SYS_FIELDS:
                        continue
                    if hasattr(m,k):
                        setattr(m,k,v)
                        
                m.rid = get_uuid()
                m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                m.pid = str(row.get('ypnumber',''))
                s.add(m)
                flag = True
            
                r = s.query(func.ifnull(func.sum(func.ifnull(ypglsheet1.rksl,0)),0).label('rksl')).filter(ypglsheet1.pid==str(row.get('ypnumber',''))).first()
                if r:
                    ljrk = float(r.rksl) if r.rksl else 0
                    y = s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).first()
                    if y:
                        qckc = float(y.qckc) if y.qckc else 0
                        ljck = float(y.ljck) if y.ljck else 0
                        ljxj = float(y.ljxj) if y.ljxj else 0
                        y.ljrk = ljrk
                        y.kcsl = qckc + ljrk - ljck - ljxj
                        s.add(y)
                        # update_json = {'ljrk':ljrk, 'kcsl':qckc + ljrk - ljck - ljxj}
                        # s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).update(update_json)
                        # flag = True
                    
        if flag == True:
            s.commit()
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#出货样管理保存前校验
@any_route('/api/saier/shipmentsample/before/save/get', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_before_save_get(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpfl = j.get('cpfl','')
        yjfl = j.get('yjfl','')
        ejfl = j.get('ejfl','')
        cgdj = j.get('cgdj',0)
        tmbh = ''
        lxm = ''
        
        d = run_sql(f"select cpdlbh from zycpfenglb where (cpfl='{str(cpfl)}') and (yjfl='{str(yjfl)}') and (ejfl='{str(ejfl)}')")
        if len(d)>0:
            tmbh1 = d[0].get('cpdlbh','') 
            if tmbh1 != '':
                kpxhz = round(cgdj*100)
                tmbh = tmbh1 + "{:05d}".format(kpxhz)
        if tmbh != '':
            d = run_sql(f"select lxm from chypgl where (lxm like '{str(tmbh)}%') order by lxm desc limit 1")
            if len(d)>0:
                lxm1 = d[0].get('lxm','')
                lxm2 = lxm1[10:12]
                lxm = tmbh + f"{int(lxm2) + 1:02d}"
            else:
                lxm = tmbh + '01'
                
        return json_result(1, '校验成功',lxm)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#出货样管理保存前校验
@any_route('/api/saier/shipmentsample/before/save/update', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_before_save_update(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpbh = j.get('cpbh','')
        lxm = j.get('lxm','')
        flag = False
        
        d = run_sql(f"select lxm from cjcp where cpbh='{str(cpbh)}'")
        if len(d)>0:
            lxm1 = d[0].get('lxm','') 
            if lxm1 == '':
                update_json = {'mctime':time.strftime("%Y-%m-%d %H:%M:%S"),'lxm':lxm}
                s.query(cjcp).filter(cjcp.cpbh==str(cpbh)).update(update_json)
                flag = True
        
        d = run_sql(f"select lxm from zscp where cpbh='{str(cpbh)}' or krhh='{str(cpbh)}'")
        if len(d)>0:
            lxm1 = d[0].get('lxm','')
            if lxm1 == '':
                update_json = {'mctime':time.strftime("%Y-%m-%d %H:%M:%S"),'lxm':lxm}
                s.query(zscp).filter(or_(zscp.cpbh == str(cpbh), zscp.krhh == str(cpbh))).update(update_json)
                flag = True
                
        if flag == True:
            s.commit()
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#
@any_route('/api/saier/shipmentsample/cpbh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_cpbh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpbh = j.get('cpbh','')
        rid = j.get('rid','')
        data = {}
        
        d = run_sql(f"select cpbh from chypgl where (cpbh='{str(cpbh)}') and (rid<>'{str(rid)}')")
        if len(d)>0:
            return json_result(-1, '产品编号已存在请检查')
        
        d = run_sql(f"select * from cjcp where (cpbh='{str(cpbh)}') or (krhh='{str(cpbh)}')")
        if len(d)>0:
            data = d[0]
        
        d = run_sql(f"select * from zscp where (cpbh='{str(cpbh)}') or (krhh='{str(cpbh)}')")
        if len(d)>0:
            data = d[0]

        return json_result(1, '校验成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        

@any_route('/api/saier/shipmentsample/lxm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_lxm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpbh = j.get('cpbh','')
        lxm = j.get('lxm','')
        
        d = run_sql(f"select lxm from chypgl where (lxm='{str(lxm)}') and (cpbh<>'{str(cpbh)}')")
        if len(d)>0:
            return json_result(-1, '条 形 码已存在请检查')
        if cpbh !='' and lxm != '':
            d = run_sql(f"select cpbh from ypgl where (lxm='{str(lxm)}') and (cpbh<>'{str(cpbh)}')")
            if len(d)>0:
                return json_result(-1, '这个条码在样品管理中的货号为' + d[0].get('cpbh'))
        
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        

@any_route('/api/saier/shipmentsample/rkcp/wxwy/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_rkcp_wxwy_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wxwy = j.get('wxwy','')
        cght = j.get('cght','')
        data = {}
        
        d = run_sql(f"select ks,zwcc,zhwbzh,qdl,sccj1id,csbh,zwdw,cpgg,cpfl,yse from cghtsheet where (wxwyzd='{str(wxwy)}') and (hthm='{str(cght)}')")
        if len(d)>0:
            data = d[0]    
        return json_result(1, '校验成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/shipmentsample/rkcp/cpbh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_rkcp_cpbh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpbh = j.get('cpbh','')
        cpbh1 = j.get('cpbh1','')
        cght = j.get('cght','')
        wxbm1 = j.get('wxbm1','')
        data = {}
        
        d = run_sql(f"SELECT cymxsheet.wxbm1,cymxsheet.khmc,yw.dyywzm as b FROM cymxsheet  \
        left join (select ywb,khmc,dyywzm from ywbdzb) as yw \
        on (cymxsheet.wxbm1=yw.ywb) and (cymxsheet.khmc like '%'+ yw.khmc +'%') \
        WHERE (cymxsheet.cght='"+str(cght)+"') AND ((cymxsheet.cpbh='"+str(cpbh)+"') or (cymxsheet.zycpbh='"+str(cpbh1)+"'))  \
        AND (cymxsheet.wxbm1<>'"+str(wxbm1)+"')")
        if len(d)>0:
            data = d[0]    
        return json_result(1, '校验成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#样品出库保存前校验
@any_route('/api/saier/sampleoutbound/before/save', methods=['POST', 'GET'])
@require_token
async def view_saier_sampleoutbound_before_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ckxq = j.get('ckxq',[])
        if len(ckxq)==0:
            return json_result(0, '校验成功，无样品出库明细')
        
        # for row in ckxq:
        #     d = run_sql(f"select pid from ypglsheet where (wyzd='{str(row.get('wyzd',''))}') and (pid='{str(row.get('ypnumber',''))}')")
        #     if len(d) == 0:
        #         m = ypglsheet()
        #         for k,v in row.items():
        #             if k in SYS_FIELDS:
        #                 continue
        #             if hasattr(m,k):
        #                 setattr(m,k,v)
                        
        #         m.rid = get_uuid()
        #         m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
        #         m.pid = d[0].get('pid')
        #         m.ypxzh = row.get('cpbh','')
        #         s.add(m)
        #     else:
        #         update_json = {'sfhx':str(row.get('sfhx',''))}
        #         s.query(ypglsheet).filter(ypglsheet.pid==row.get('ypnumber',''),ypglsheet.wyzd==row.get('wyzd','')).update(update_json)
                
        #     r = run_sql(f"select sum(ljck) as ljck from ypglsheet where (pid='{str(row.get('ypnumber',''))}') and (cpzt<>'下架') ")
        #     if len(r)>0:
        #         ljck = r[0].get('ljck',0)
        #         y = s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).first()
        #         if y:
        #             qckc = y.qckc if y.qckc else 0
        #             ljxj = y.ljxj if y.ljxj else 0
        #             ljrk = y.ljrk if y.ljrk else 0
                    
        #             update_json = {'ljck':ljck, 'kcsl':qckc + ljrk - ljck - ljxj}
        #             s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).update(update_json)

        flag = False
        for row in ckxq:
            d = s.query(ypglsheet.pid).filter(ypglsheet.wyzd==str(row.get('wyzd','')), ypglsheet.pid==str(row.get('ypnumber',''))).first()
            if not d:
                m = ypglsheet()
                for k,v in row.items():
                    if k in SYS_FIELDS:
                        continue
                    if hasattr(m,k):
                        setattr(m,k,v)
                        
                m.rid = get_uuid()
                m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                m.pid = str(row.get('ypnumber',''))
                s.add(m)
                flag = True
            
                r = s.query(func.ifnull(func.sum(func.ifnull(ypglsheet.ljck,0)),0).label('ljck')).filter(ypglsheet.pid==str(row.get('ypnumber',''))).first()
                if r:
                    ljck = float(r.ljck) if r.ljck else 0
                    y = s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).first()
                    if y:
                        qckc = float(y.qckc) if y.qckc else 0
                        ljrk = float(y.ljrk) if y.ljrk else 0
                        ljxj = float(y.ljxj) if y.ljxj else 0
                        y.ljck = ljck
                        y.kcsl = qckc + ljrk - ljxj - ljck
                        s.add(y)
                        # update_json = {'ljrk':ljrk, 'kcsl':qckc + ljrk - ljck - ljxj}
                        # s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).update(update_json)
                        # flag = True
        if flag:
            s.commit()
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#样品下架保存前校验
@any_route('/api/saier/sampleremoval/before/save', methods=['POST', 'GET'])
@require_token
async def view_saier_sampleremoval_before_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        xjxq = j.get('xjxq',[])
        # flag = False
        if len(xjxq)==0:
            return json_result(0, '校验成功，无样品出库明细')
        
        # for row in xjxq:
        #     d = run_sql(f"select pid from ypglsheet where (wyzd='{str(row.get('wyzd',''))}') and (pid='{str(row.get('ypnumber',''))}')")
        #     if len(d) == 0:
        #         m = ypglsheet()
        #         m.rid = get_uuid()
        #         m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
        #         m.pid = d[0].get('pid')
        #         m.riqi = row.get('riqi',None)
        #         m.bzh = row.get('bzh',None)
        #         m.ljxj = row.get('ljck',None)
        #         m.wyzd = row.get('wyzd',None)
        #         m.czr = row.get('czr',None)
        #         m.cpzt = '下架'
        #         s.add(m)
        #         flag = True
                
        #     r = run_sql(f"select sum(ljxj) as ljxj from ypglsheet where (pid='{str(row.get('ypnumber',''))}') and (cpzt='下架') ")
        #     if len(r)>0:
        #         ljxj = r[0].get('ljxj',0)
        #         y = s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).first()
        #         if y:
        #             qckc = y.qckc if y.qckc else 0
        #             ljck = y.ljck if y.ljck else 0
        #             ljrk = y.ljrk if y.ljrk else 0
                    
        #             update_json = {'ljxj':ljxj, 'kcsl':qckc + ljrk - ljck - ljxj}
        #             s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).update(update_json)
        #             flag = True
                    
        flag = False
        for row in xjxq:
            d = s.query(ypglsheet.pid).filter(ypglsheet.wyzd==str(row.get('wyzd','')), ypglsheet.pid==str(row.get('ypnumber',''))).first()
            if not d:
                m = ypglsheet()
                for k,v in row.items():
                    if k in SYS_FIELDS:
                        continue
                    if hasattr(m,k):
                        setattr(m,k,v)
                m.ljck = 0
                m.ljxj = row.get('ljck',0) 
                m.rid = get_uuid()
                m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                m.pid = str(row.get('ypnumber',''))
                s.add(m)
                flag = True
            
                r = s.query(func.ifnull(func.sum(func.ifnull(ypglsheet.ljxj,0)),0).label('ljxj')).filter(ypglsheet.pid==str(row.get('ypnumber',''))).first()
                if r:
                    ljxj = float(r.ljxj) if r.ljxj else 0
                    y = s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).first()
                    if y:
                        qckc = float(y.qckc) if y.qckc else 0
                        ljrk = float(y.ljrk) if y.ljrk else 0
                        ljck = float(y.ljck) if y.ljck else 0
                        y.ljxj = ljxj
                        y.kcsl = qckc + ljrk - ljck - ljxj
                        s.add(y)
                        # update_json = {'ljrk':ljrk, 'kcsl':qckc + ljrk - ljck - ljxj}
                        # s.query(ypgl).filter(ypgl.rid==row.get('ypnumber','')).update(update_json)
                        # flag = True

        if flag == True:         
            s.commit()
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#条形码检查
@any_route('/api/saier/shipmentsample/lxm/button/check', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_lxm_button_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        username = user.username
        cpfl = j.get('cpfl','')
        yjfl = j.get('yjfl','')
        ejfl = j.get('ejfl','')
        cgdj = j.get('cgdj',0)
        tmbh = ''
        lxm = ''
        
        d = run_sql(f"select * from tsqxsheet where (xm='{str(username)}') and (qxlx='条码更换')")
        if len(d)>0:
            d = run_sql(f"select cpdlbh from zycpfenglb where (cpfl='{str(cpfl)}') and (yjfl='{str(yjfl)}') and (ejfl='{str(ejfl)}')")
            if len(d)>0:
                tmbh1 = d[0].get('cpdlbh','') 
                if tmbh1 != '':
                    kpxhz = round(cgdj*100)
                    tmbh = tmbh1 + "{:05d}".format(kpxhz)
            if tmbh != '':
                d = run_sql(f"select lxm from chypgl where (lxm like '{str(tmbh)}%') order by lxm desc limit 1")
                if len(d)>0:
                    lxm1 = d[0].get('lxm','')
                    lxm2 = lxm1[10:12]
                    lxm = tmbh + f"{int(lxm2) + 1:02d}"
                else:
                    lxm = tmbh + '01'
        else:
            return json_result(0, '校验成功')
                
        return json_result(1, '校验成功',lxm)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#条形码修改
@any_route('/api/saier/shipmentsample/lxm/button/update', methods=['POST', 'GET'])
@require_token
async def view_saier_shipmentsample_lxm_button_update(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        lxm = j.get('lxm','')
        cpbh = j.get('cpbh','')
        
        d = run_sql(f"select lxm from ypgl where (lxm='{str(lxm)}') and (cpbh<>'{str(cpbh)}')")
        if len(d)>0:
            return json_result(-1, '条 形 码已存在请检查')
        
        d = run_sql(f"select cpbh from chypgl where (lxm='{str(lxm)}') and (cpbh<>'{str(cpbh)}')")
        if len(d)>0:
            return json_result(-1, '这个条码在出货样管理中的货号为' + d[0].get('cpbh'))
        
        update_json = {'lxm':lxm}
        s.query(cjcp).filter(cjcp.cpbh==str(cpbh)).update(update_json)
        s.query(zscp).filter(zscp.cpbh==str(cpbh)).update(update_json)
        s.query(ypgl).filter(ypgl.cpbh==str(cpbh)).update(update_json)
        s.query(ypglsheet1).filter(ypglsheet1.cpbh==str(cpbh)).update(update_json)
        s.commit()
        return json_result(1, '修改成功',lxm)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#查询业务人员信息
@any_route('/api/saier/get/ywry/info', methods=['POST', 'GET'])
@require_token
async def view_saier_get_ywry_info(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        yhm = j.get('yhm','')
        bm = ''
        wfgs = '' 
        d = run_sql(f"select bm,wfgs from ywrybiao where yhm='{str(yhm)}'")
        if len(d)>0:
            bm = d[0].get('bm','')
            wfgs = d[0].get('wfgs','')
                
            
        data = {'bm':bm, 'wfgs':wfgs}

        return json_result(1, '查询成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/customersample/ydh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customersample_ydh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ydh = j.get('ydh','')
        
        d = run_sql(f"select ydh from jygl where ydh='{str(ydh)}'")
        if len(d)>0:
            return json_result(-1, '运 单 号已存在!')
        
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()