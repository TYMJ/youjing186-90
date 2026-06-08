from pdb import run

from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time,re
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_delete,user_task_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_khmc_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        data = {}
        code = 1
        msg = '查询成功'
        d = run_sql(f"select bxbl,bxjc,RMBkh,jgtk,yjds,cghtqx from kh where company_name='{khmc}' limit 1")
        if len(d) > 0:
            data = d[0]
        
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/wxwyzd2/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_wxwyzd2_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        zyhh = j.get('zyhh','')
        wxwyzd = j.get('wxwyzd','')

        code = 1
        msg = '查询成功'
        if wxwyzd != '' and wxwyzd != None:
            d = run_sql(f"select rid from wxhtsheet where bjhh='{str(zyhh)}' and wxwyzd='{wxwyzd}' limit 1")
            if len(d)==0:
                return json_result(-1, '请注意外销合同中无此下单货号，请核对')
        
        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/get/cghl', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_get_cghl(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sb = 0
        nxkh = '否'
        cghl = 1
        code = 1
        khmc = j.get('khmc','')
        msg = '查询成功'
        cgbz = j.get('cgbz','')
        d = run_sql(f"select hhl from hbdm where hbdm='{cgbz}' limit 1")
        if len(d)>0:
            cghl = float(d[0].get('hhl',1))
        d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='按佣金单价计算佣金') limit 1")
        if len(d)>0:
            sb = 1
        d = run_sql(f"select nxkh from kh where company_name='{khmc}' limit 1")
        if len(d)>0:
            nxkh = str(d[0].get('nxkh','否'))
        return json_result(code, msg, {"cghl": cghl, "sb": sb, "nxkh": nxkh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/csbh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_csbh_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        cs_id = j.get('cs_id','')
        code = 1
        msg = '查询成功'
        data = {}
        d = run_sql(f"select cs_id,company_name,cslxr,phone,sjhm,jsfs,fax,province1,city1,address,kpgc,hzdj1,ywbf from zycs where cs_id='{cs_id}' limit 1")
        if len(d)>0:
            data = d[0]

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/sccj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_sccj_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        zyhh = j.get('zyhh','')
        sccj = j.get('sccj','')
        sfkm = '否'
        kmbh = ''
        code = 1
        msg = '查询成功'
        data = {}
        d = run_sql(f"select cpbh from gckm where (kmbh='{zyhh}') and (sccj='{sccj}') limit 1")
        if len(d)>0:
            sfkm = '是'
            kmbh = str(d[0].get('cpbh',''))
        if sfkm == '否':
            d = run_sql(f"select cpbh from gckm where (kmbh='{zyhh}') limit 1")
            if len(d)>0:
                sfkm = '是'
                kmbh = str(d[0].get('cpbh',''))

        data = {'sfkm': sfkm, 'kmbh': kmbh}

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/wxwyzd/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_wxwyzd_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        wxwyzd = j.get('wxwyzd','')
        code = 1
        msg = '查询成功'
        data = {}
        wxhtsl = 0
        cgjhsl = 0
        cghtsl = 0
        d = run_sql(f"select htsl from wxhtsheet where wxwyzd='{wxwyzd}' limit 1")
        if len(d)>0:
            wxhtsl = d[0].get('htsl',0)

        d = run_sql(f"select ifnull(sum(ifnull(yxdsl,0)),0) as yxdsl1 from cgjhsheet where (wxwyzd='{wxwyzd}') limit 1")
        if len(d)>0:
            cgjhsl = d[0].get('yxdsl1',0)

        d = run_sql(f"select ifnull(sum(ifnull(cgsl,0)),0) as yxdslz from cghtsheet where (wxwyzd='{wxwyzd}') and (xjht<>'作废') limit 1")
        if len(d)>0:
            cghtsl = d[0].get('yxdslz',0)

        data = {'wxhtsl': wxhtsl, 'cgjhsl': cgjhsl, 'cghtsl': cghtsl}
    
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/cgry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_cgry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wxwyzd = j.get('wxwyzd','')
        code = 1
        msg = '查询成功'
        data = {}
        nbht = j.get('nbht','')
        ywht = j.get('ywht','')
        stht = j.get('stht','')
        xddd = j.get('xddd','')
        wyzd = j.get('jhwy','')
        sccj = j.get('sccj','')
        gdry = j.get('gdry','')
        cgry = j.get('cgry','')
        ssdq = ''
        path = ''
        pd = ''
        sfqr = '否'

        if (nbht == user.username or ywht==user.username or stht == user.username):
            if (user.username == nbht and xddd != '宁波') or (user.username == ywht and xddd != '义乌') or (user.username == stht and xddd != '汕头'):
                msg = '不好意思,此记录下单地点和合同批准地区不符,请与业务人员联系,谢谢'
                code = 0
                pd = '待定'
        if cgry=='' or cgry==None:
            pd = '待定'
            sfqr = '否'
        else:
            org = get_user_path(j.get('cgry',''))
            path = org.get('path','')

        d = run_sql(f"select bm,ssdq from ywrybiao where yhm='{cgry}' limit 1")
        if len(d)>0:
            ssdq = d[0].get('ssdq','')

        if cgry != '待定' and sccj!='待定' and gdry!='待定' and cgry!= '' and gdry!=None and sccj!=None and cgry!=None and gdry!='' and sccj!='':
            sfqr = '是'

        s.query(cgjhsheet).filter(cgjhsheet.jhwy==wyzd).update({'cgry': cgry, 'sfqr': sfqr})
        s.commit()

        data = {'sfqr': sfqr, 'ssdq': ssdq, 'pd': pd, 'path': path}
    
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/zyhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_zyhh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        zyhh = j.get('zyhh','')
        khmc = j.get('khmc','')
        code = 1
        msg = '查询成功'
        data = {}
        jzrq = time.strftime('%Y-%m-%d')
        d = run_sql(f"select bzyq,gdry,cgry,ifnull(zdml,0) zdml,wbcz from zscp where cpbh='{zyhh}' limit 1")
        if len(d)>0:
            data = d[0]
            khmc1 = 'BEST PRICE'
            khmc2 = 'SIA FP LV'
            khmc3 = 'Fix Price General Trading LLC'
            if d[0].get('mll',0)>0:
                data['zdml'] = d[0].get('mll', 0) / 100
            if ('BEST PRICE' in khmc ) or ('SIA FP LV' in khmc) or ('Fix Price General Trading LLC' in khmc ) or (khmc == ''):
                data['zdml'] = 0.15
                c = run_sql(f"select ifnull(mll,0) zdml from zscpsheet1 where (cpbh='{zyhh}') and ((khmc like '%{khmc1}%') or (khmc like '%{khmc2}%') or (khmc like '%{khmc3}%')) and ((jzrq>='{jzrq}') or (ifnull(jzrq,'')='')）) order by mll limit 1")
                if len(c) > 0:
                    data['zdml'] = c[0].get('zdml', 0) / 100
            else:
                c = run_sql(f"select ifnull(mll,0) zdml from zscpsheet1 where (cpbh='{zyhh}') and (khmc='{khmc}') and ((jzrq>='{jzrq}') or (ifnull(jzrq,'')='')) order by mll limit 1") 
                if len(c) > 0:
                    data['zdml'] = c[0].get('zdml', 0) / 100
        else:
            d = run_sql(f"select bzyq,gdry,cgry,0 zdml,'' wbcz from cjcp where cpbh='{zyhh}' limit 1")
            if len(d)>0:
                data = d[0]
    
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/gdry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_gdry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        gdry = j.get('gdry','')
        nbht = j.get('nbht','')
        ywht = j.get('ywht','')
        stht = j.get('stht','')
        rid = j.get('rid','')
        sccj = j.get('sccj','')
        cgry = j.get('cgry','')
        sfqr = '否'
        code = 1
        msg = '查询成功'
        data = {}

        path = ''
        bm = ''
        d = run_sql(f"select rid from sys_user where username='{gdry}' limit 1")
        if len(d)>0:
            path = '1'
        else:
            gdry = '待定'
        d = run_sql(f"select bm,ssdq from ywrybiao where yhm='{gdry}' limit 1")
        if len(d)>0:
            bm = d[0].get('bm','')
        if gdry=='待定' or gdry=='' or gdry==None:
            sfqr = '否'
        if (gdry != '待定') and (sccj != '待定') and (cgry !=  '待定') and (gdry !=  '') and (sccj !=  '') and (cgry != ''):
            sfqr = '是'
        if (nbht == user.username or ywht==user.username or stht == user.username):
            s.query(cgjhsheet).filter(cgjhsheet.rid==rid).update({'gdry': gdry, 'sfqr': sfqr})
            s.commit()

        data = {'sfqr': sfqr, 'bm': bm, 'path': path}
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/xdsl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_xdsl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wxwyzd = j.get('wxwyzd','')
        rid = j.get('rid','')
        xdsl = j.get('xdsl',0)
        code = 1
        msg = '查询成功'
        data = {}
        wxhtsl = 0
        jhhtsl = j.get('xdsl',0)
        jzrq = time.strftime('%Y-%m-%d')
        d = run_sql(f"select ifnull(htsl,0) htsl from wxhtsheet where wxwyzd=='{wxwyzd}' limit 1")
        if len(d)>0:
            wxhtsl = d[0].get('htsl',0)

        d = run_sql(f"select ifnull(sum(ifnull(yxdsl,0)),0) as yxdsl1 from cgjhsheet where (wxwyzd='{wxwyzd}') and rid<>'{rid}' limit 1")
        if len(d)>0:
            jhhtsl = d[0].get('yxdsl1',0)

        d = run_sql(f"select ifnull(sum(ifnull(cgsl,0)),0) as yxdslz from cghtsheet where (wxwyzd='{wxwyzd}') and (xjht<>'作废') limit 1")
        if len(d)>0:
            jhhtsl = jhhtsl + d[0].get('yxdslz',0)

        if jhhtsl <= wxhtsl and jhwy != '' and jhwy !='zjnblhjhwy123456':
            s.query(cgjhsheet).filter(cgjhsheet.rid==rid).update({'yxdsl': xdsl})
            s.commit()

        data = {'wxhtsl': wxhtsl, 'jhhtsl': jhhtsl}
        return json_result(code, msg, data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/items/delete', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_delete(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        lines = j.get('lines', '')
        ywry = j.get('ywry', '')
        spsq = j.get('spsq', '')
        code = 1
        if (spsq != '' and spsq!=None) or ywry!=user.username:
            return json_result(-1, '删除失败')
        rids = []
        for line in lines:
            sl5 = 0
            rids.append(line.get('rid',''))
            if line.get('htsl',None) != None:
                sl5 = line.get('htsl',0)
            logger.error(sl5)
            wxwyzd = line.get('wxwyzd','')
            jhwy = line.get('jhwy','')
            wxrl = 0
            if line.get('wxrl',None) != None:
                wxrl = line.get('wxrl',0)
            xs = 0
            d = run_sql(f"select ifnull(sum(ifnull(yxdsl,0)),0) as yxdsl1 from cgjhsheet where (wxwyzd='{wxwyzd}') and (jhwy<>'{jhwy}') ")
            if len(d)>0:
                logger.error(d[0].get('yxdsl1',0))
                sl5 = sl5 - d[0].get('yxdsl1',0)
            d = run_sql(f"select ifnull(sum(ifnull(yxdsl,0)),0) as yxdsl1 from cgjhsheet3 where (wxwyzd='{wxwyzd}') limit 1")
            if len(d)>0:
                logger.error(d[0].get('yxdsl1',0))
                sl5 = sl5 - d[0].get('yxdsl1',0)
            m = s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).first()
            if m:
                # code = 1
                m.sl5 = sl5
                if wxrl!=0:
                    xs = round(sl5/float(wxrl),2)
                m.sl4 = xs
                s.add(m)
            
        # if code == 1:
        s.query(cgjhsheet).filter(cgjhsheet.rid.in_(rids),cgjhsheet.pid==rid).delete(synchronize_session=False)
        s.commit()
        return json_result(code, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/items/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_update(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        lines = j.get('lines', '')
        krID = j.get('kh_id', '')
        code = 1
        data = {}
        for r in lines:
            flag = 0
            zyhh = r.get('bjhh','')
            rid = str(r.get('rid',''))
            sccj = r.get('sccj1','')
            data[rid] = {}
            data[rid]['krtm'] = ''
            data[rid]['khhh'] = ''
            data[rid]['mz'] = 0
            data[rid]['jz'] = 0
            data[rid]['wxdj'] = 0
            data[rid]['Twxdj'] = 0
            data[rid]['mjdj1'] = 0
            data[rid]['pkRMB'] = 0
            data[rid]['items'] = {}
            data[rid]['cs_data'] = {}
            d = s.query(zscp).filter(zscp.cpbh==zyhh).first()
            if not d:
                d = s.query(cjcp).filter(cjcp.cpbh==zyhh).first()
            else:
                flag = 1
            if d:
                if flag==1 and d.fljg != None:
                    data[rid]['fljg'] = float(d.fljg)
                data[rid]['flag'] = flag
                c = s.query(zscpsheet7.krhh,zscpsheet7.krtm).filter(zscpsheet7.cpbh==zyhh,zscpsheet7.krID==krID).first()
                if c:
                    data[rid]['krtm'] = str(c.krtm)
                    data[rid]['khhh'] = str(c.krhh)
                if (data[rid]['krtm']=='' or data[rid]['krtm']==None) and d.krtm != None and d.krtm !='无':
                    data[rid]['krtm'] = str(d.krtm)
                if (data[rid]['khhh']=='' or data[rid]['khhh']==None) and d.krhh != None and d.krhh !='无':
                    data[rid]['khhh'] = str(d.krhh)
                data[rid]['items'] = alchemy_object_to_dict(d)

            c = s.query(wxhtsheet.khhh,func.ifnull(wxhtsheet.mz,0).label('mz'),
                func.ifnull(wxhtsheet.jz,0).label('jz'),
                func.ifnull(wxhtsheet.wxdj,0).label('wxdj'),
                func.ifnull(wxhtsheet.Twxdj,0).label('Twxdj'),
                func.ifnull(wxhtsheet.mjdj1,0).label('mjdj1'),
                func.ifnull(wxhtsheet.pkRMB,0).label('pkRMB')
            ).filter(wxhtsheet.rid==r.get('wxwyzd','')).first()
            if c:
                if data[rid]['khhh']=='' or data[rid]['khhh']==None:
                    data[rid]['khhh'] = str(c.khhh)
                data[rid]['mz'] = float(c.mz)
                data[rid]['jz'] = float(c.jz)
                data[rid]['wxdj'] = float(c.wxdj)
                data[rid]['Twxdj'] = float(c.Twxdj)
                data[rid]['mjdj1'] = float(c.mjdj1)
                data[rid]['pkRMB'] = float(c.pkRMB)
            if sccj != '' and sccj != None:
                c = s.query(zycs.cs_id,zycs.phone,zycs.ywbf,zycs.jsfs,zycs.hzdj1).filter(zycs.company_name==sccj).first()
                if c:
                    data[rid]['cs_data'] = alchemy_object_to_dict(c)

        return json_result(code, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/items/invoice/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_invoice_update(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        lines = j.get('lines', '')
        code = 1
        data = {}
        for r in lines:
            rid = str(r.get('rid',''))
            cs_id = r.get('sccj1id','')
            kpgc = r.get('kpgc','')
            data[rid] = {}
            data[rid]['hyd'] = ''
            data[rid]['items'] = {}
            d = s.query(zycs).filter(zycs.cs_id==cs_id).first()
            if d:
                data[rid]['items'] = alchemy_object_to_dict(d)
                kpgc = str(d.kpgc)
            if kpgc!='' and kpgc!=None:
                c = s.query(ozycs.hyd).filter(ozycs.company_name==kpgc).first()
                if c:
                    data[rid]['hyd'] = str(c.hyd)
            
        return json_result(code, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/ratio/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_ratio_update(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sb = 0
        nxkh = '否'
        cghl = 1
        code = 1
        khmc = j.get('khmc','')
        msg = '查询成功'
        lines = j.get('lines', '')
        cghl = {}
  
        d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='按佣金单价计算佣金') limit 1")
        if len(d)>0:
            sb = 1
        d = run_sql(f"select nxkh from kh where company_name='{khmc}' limit 1")
        if len(d)>0:
            nxkh = str(d[0].get('nxkh','否'))
        for r in lines:
            cgbz = r.get('cgbz','')
            if cgbz == '' or cgbz == None or cgbz == 'RMB':
                cghl[cgbz] = 1
                continue
            if not cgbz in cghl:
                cghl[cgbz] = 1
                d = run_sql(f"select hhl from hbdm where hbdm='{cgbz}' limit 1")
                if len(d)>0:
                    cghl[cgbz] = float(d[0].get('hhl',1))

        return json_result(code, msg, {"cghl": cghl, "sb": sb, "nxkh": nxkh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/items/supplier/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_items_supplier_update(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        code = 1
        khmc = j.get('khmc','')
        msg = '查询成功'
        lines = j.get('lines', '')
        cp_data = {}
        cs_data = {}
        er1_data = []
        er2_data = []
        er_data = []
        jzrq = time.strftime('%Y-%m-%d')
        for r in lines:
            zyhh = r.get('bjhh','')
            sccj = r.get('sccj1','')
            # rid = str(r.get('rid',''))
            zdml = r.get('zdml',0)
            mll = r.get('mll',0)
            gcpf = r.get('gcpf',0)
            ggxm = r.get('ggxm','')
            if zyhh != '' and zyhh != None and (ggxm == '否' or ggxm == '' or ggxm == None):
                if zyhh not in cp_data:
                    cp_data[zyhh] = 0
                    d = run_sql(f"select ifnull(zdml,0) zdml from zscp where cpbh='{zyhh}' limit 1")
                    if len(d)>0:
                        cp_data[zyhh] = d[0].get('zdml',0)
                        zdml = d[0].get('zdml',0)

                    khmc1 = 'BEST PRICE'
                    khmc2 = 'SIA FP LV'
                    khmc3 = 'Fix Price General Trading LLC'
                    if d[0].get('mll',0)>0:
                        cp_data[zyhh] = d[0].get('mll', 0) / 100
                    if ('BEST PRICE' in khmc ) or ('SIA FP LV' in khmc) or ('Fix Price General Trading LLC' in khmc ) or (khmc == ''):
                        cp_data[zyhh] = 0.15
                        zdml = 0.15
                        c = run_sql(f"select ifnull(mll,0) zdml from zscpsheet1 where (cpbh='{zyhh}') and ((khmc like '%{khmc1}%') or (khmc like '%{khmc2}%') \
                            or (khmc like '%{khmc3}%')) and ((jzrq>='{jzrq}') or (ifnull(jzrq,'')='')) order by mll limit 1")
                        if len(c) > 0:
                            cp_data[zyhh] = c[0].get('zdml', 0) / 100
                            zdml = c[0].get('zdml', 0) / 100
                    else:
                        c = run_sql(f"select ifnull(mll,0) zdml from zscpsheet1 where (cpbh='{zyhh}') and ((khmc='{khmc}') and ((jzrq>='{jzrq}') or (ifnull(jzrq,'')='')) order by mll limit 1") 
                        if len(c) > 0:
                            cp_data[zyhh] = c[0].get('zdml', 0) / 100
                            zdml = c[0].get('zdml', 0) / 100

            if sccj != '' and sccj != None:
                if sccj not in cs_data:
                    cs_data[sccj] = {}
                    c = run_sql(f"select ifnull(hzdj1,0) hzdj1 from zycs where company_name='{sccj}' limit 1")
                    if len(c)>0:
                        cs_data[sccj] = c[0].get('hzdj1',0)
                        gcpf =  c[0].get('hzdj1',0)
                else:
                    gcpf = cs_data[sccj]
            if float(gcpf) < 60:
                er1_data.append("请注意产品:" + str(zyhh) + "的工厂评分低于60")

            if float(zdml) != 0 and float(mll) < float(zdml):
                er2_data.append(f"请注意产品:" + str(zyhh) + f"的毛利低于{str(zdml)}请记得填写成本核算表")           
            # c = run_sql(f"select ifnull(gcpf,0) gcpf from cgjhsheet where rid='{rid}' limit 1")
            # if len(c)>0:
            #     if float(c[0].get('gcpf',0)) > 0:
            #         cp_data[zyhh] = cp_data[zyhh] + float(c[0].get('gcpf',0))
        if len(er1_data) > 0:
            er_data.append(";".join(er1_data))
        if len(er2_data) > 0:
            er_data.append(";".join(er2_data))
        return json_result(code, msg, {"cp_data": cp_data, "cs_data": cs_data, "er_data": ";".join(er_data)})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/ywry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_ywry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ywry = j.get('ywry','')
        code = 1
        msg = '查询成功'
        org = get_user_path(ywry)
        path = org.get('path','')

        return json_result(code, msg, path)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/hthm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_hthm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        hthm = j.get('hthm','')
        code = 1
        msg = '查询成功'
        d = s.query(cgjh.rid).filter(cgjh.order_id1==hthm, cgjh.rid != rid).first()
        if d:
            code = -1
            msg = '合同号码已存在'

        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/user/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_user_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        code = 1
        msg = '查询成功'
        ry = ''
        d = s.query(cgjh.ry).filter(cgjh.order_id1==rid).first()
        if d:
            ry = d.ry

        return json_result(code, msg, ry)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/wxht/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_wxht_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        order_id = j.get('order_id','')
        code = 1
        msg = '查询成功'
        gsmc = ''
        d = s.query(wxhtsheet.wxwyzd,wxhtsheet.htsl,wxhtsheet.wxrl).filter(wxhtsheet.order_id==order_id).all()
        for r in d:
            wxwyzd = r.wxwyzd
            sl5 = 0
            sl4 = 0
            if r.htsl:
                sl6 = float(r.htsl)
            wxrl = 0
            if r.wxrl:
                wxrl = float(r.wxrl)
            
            c = run_sql(f"select ifnull(sum(ifnull(yxdsl,0)),0) as yxdsl1 from cgjhsheet where (wxwyzd='{wxwyzd}') limit 1")
            if len(c)>0:
                sl5 = c[0].get('yxdsl1',0)

            c = run_sql(f"select ifnull(sum(ifnull(cgsl,0)),0) as yxdslz from cghtsheet where (wxwyzd='{wxwyzd}') and (xjht<>'作废') limit 1")
            if len(c)>0:
                sl5 = sl5 + c[0].get('yxdslz',0)
            if wxrl!=0 and wxrl!=None:
                sl4 = round(sl5/float(wxrl),2)

            s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).update({'sl5': sl5, 'sl4': sl4})
        d = run_sql(f"select bz from cyzglsheet where ('{order_id}' like '%xm%') and (zm='外销合同识别公司') limit 1")
        if len(d)>0:
            gsmc = d[0].get('bz','')

        s.commit()
        return json_result(code, msg, gsmc)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/fieldno/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_fieldno_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        order_no = j.get('order_no','')
        ywry = j.get('ywry','')
        kind = j.get('kind','')
        bjdl = j.get('bjdl','').replace('\\','\\\\')
        fields = {'宁波合同':{'field':'nbhtsc','no':'nbht'}, '义乌合同':{'field':'ywhtsc','no':'ywht'}, '汕头合同':{'field':'sthtsc','no':'stht'}}
        f = fields.get(kind,'')
        if f==None or f == '':
            return json_result(-1, '合同类型错误,请重新选择')
        field = f.get('field','')
        no = f.get('no','')
        code = 1
        msg = '查询成功'
        c =run_sql(f"select rid from spwt where (dlr='{order_no}') and ('{bjdl}' like '%{field}%') limit 1")
        # if len(c)==0:
        #     return json_result(-1, f"不好意思,此人没有安排{kind}权利,请重新选择,谢谢")

        jhdh = ''
        d = s.query(cgjh.order_id1,cgjh.nbht,cgjh.ywht,cgjh.stht,cgjh.tjsh).filter(cgjh.rid==rid).first()
        if d:
            jhdh = d.order_id1
            hthm = ''
            if hasattr(d,no):
                hthm = getattr(d,no)
            if hthm != '' and hthm != None and hthm != order_no and hthm != ywry and d.tjsh!=hthm and d.stht!=hthm and d.ywht!=hthm:
                res = user_task_delete('采购计划', rid, s, [hthm])
                if res.get('code',1) != 1:
                    return json_result(-1, res.get('msg'))

            res = user_task_new('采购计划', rid, '合同号码', '[合同号码]安排采购','审批采购计划:' + str(jhdh) + '已通过,请安排采购.日期:' + time.strftime('%Y-%m-%d'), user, s, [order_no], True)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))

        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/apply/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_apply_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        d = s.query(cgjh.tjsh,cgjh.ywry).filter(cgjh.rid==rid).first()
        if not d:
            return json_result(-1, '采购计划不存在,请重新操作')
        if d.tjsh == None or d.tjsh == '' or d.ywry != user.username:            
            return json_result(-1, '无权限操作或审核申请为空')

        return json_result(1, '查询成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/purchase_plan/apply/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_apply_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        val = j.get('val','')
        code = 1
        msg = '操作成功'
        path = ''
        tjsh = ''
        jhdh = ''
        d = s.query(cgjh).filter(cgjh.rid==rid).first()
        if d:
            tjsh = d.tjsh
            jhdh = d.order_id1
            res = user_task_delete('采购计划', rid, s, [tjsh])
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
            # org = get_user_path(tjsh)
            # path = org.get('path','')
        c = s.query(ywrybiao.c.zt).filter(ywrybiao.yhm==d.ywry).first()
        if not c:
            return json_result(-1, '用户信息校验失败,请重新操作')
        if str(c.zt)=='离职':
            return json_result(-1, '当前用户已离职,无法提交审核申请')
    
        c = s.query(cgjhsheet.rid).filter(cgjhsheet.pid==rid).first()
        if c : # and path != '':
            res = user_task_new('采购计划', rid, '合同号码', f"审批{user.username}的采购计划:[合同号码]改单申请",'采购计划:' + str(jhdh) + '需再次审批，原因:'+str(val)+',日期:' + time.strftime('%Y-%m-%d'), user, s, [tjsh], True)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
        # logger.error(f"tjsh:{tjsh}, path:{path}")
        d.nbht=''
        d.ywht=''
        d.stht=''
        d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
        d.modi_uid = user.rid
        s.add(d)
        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#采购计划的审核申请变更查询
@any_route('/api/saier/purchase_plan/shsq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_shsq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        shsq = j.get('shsq','')
        bjdl = j.get('bjdl','').replace('\\','_')
        code = 1
        msg = '查询成功'

        d = run_sql(f"select rid from spwt where (dlr='{shsq}') and ('{bjdl}' like concat('%', replace(jhsh,'\\\\','_'), '%')) limit 1")
        if len(d)==0:
            return json_result(-1, f"不好意思,此人没有审批权限,请重新选择")
        
        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        zjl = ''
        org = get_user_path(user.username," and path like '%采购%' ")
        path = org.get('path','')
        position = org.get('position','')
        empty = org.get('empty',True)
        d = run_sql(f"select username from sys_user where (position like '%总经理%' or memo like '%总经理%') limit 1")
        if len(d)>0:
            zjl = d[0].get('username','')
        ywry = ''
        d = s.query(cgjh.ywry).filter(cgjh.rid==rid).first()
        if d:
            ywry = d.ywry

        return json_result(1, '操作成功', {'zjl': zjl, 'path': path, 'position': position, 'ywry': ywry, 'empty': empty })
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/purchase/return', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_purchase_return(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        d = s.query(cgjh).filter(cgjh.rid==rid).first()
        if not d:
            return json_result(-1, '采购计划不存在,请重新操作')
        nbht = d.nbht
        ywht = d.ywht
        stht = d.stht
        htmc = ''
        if nbht == user.username or user.username == d.tjsh:
            d.nbht = ''
            htmc = '宁波合同'
        if ywht == user.username or user.username == d.tjsh:
            d.ywht = ''
            htmc = '义乌合同'
        if stht == user.username or user.username == d.tjsh:
            d.stht = ''
            htmc = '汕头合同'
        s.add(d)
        res = user_task_delete('采购计划', rid, s, [user.username])
        if res.get('code') != 1:
            return json_result(res.get('code'), res.get('msg'))
        row = {
            "xxly": '采购计划',
            "bjdh": '',
            "wxht": d.order_id1,
            "cght": '',
            "yhdh": '',
            "xxnr": str(user.username) + '采购计划' + htmc + '已退回,合同号:' + str(d.order_id1) + ',日期:' + time.strftime('%Y-%m-%d'),
            "jsr": str(d.tjsh),
            "sys_path": "",
            "spsq": str(d.tjsh)
        }
        res = module_xxck_new([row], user, s)
        if res.get('code',1) != 1:
            return json_result(-1, res.get('msg'))

        s.commit()

        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        khmc = j.get('khmc', '')
        jhqr = j.get('jhqr', '')
        spsq = j.get('spsq', '')
        ywry = j.get('ywry', '')
        gsmc = j.get('gsmc', '')
        gssb = 0
        gsmc = ''
        xgsb = 0
        cdsb = 0
        jh_data = {}
        org = get_user_path(user.username," and path like '%采购报价单%' ")
        path = org.get('path','')
        position = org.get('position','')
        d = run_sql(f"select rid from cyzglsheet where (xm='{khmc}') and (zm='我方公司不锁定') and (ifnull(xm,'')<>'') limit 1")
        if len(d)>0:
            gssb = 1

        d = run_sql(f"select Vendorgs from kh where (company_name='{khmc}') and (ifnull(Vendorgs,'')<>'') limit 1")
        if len(d)>0:
            gsmc = d[0].get('Vendorgs','')

        d = run_sql(f"select * from sys_user where (username='{user.username}') and ((position like '%外销%') or (position like '%总经理%') or (memo like '%总经理%') or (memo like '%外销%')) limit 1")
        if len(d)==0:
            xgsb = 1

        d = s.query(cgjh.nbht, cgjh.ywht, cgjh.stht, cgjh.ywry, cgjh.tjsh, cgjh.tjsh1).filter(cgjh.rid==rid).first()
        if d:
            if jhqr!='待审批' and spsq==user.username and d.ywry != user.username and (d.tjsh==None or d.tjsh == '') and (d.tjsh1 == None or d.tjsh1 == ''):
                cdsb = 1
            jh_data = alchemy_object_to_dict(d)
            if jh_data.get('tjsh', '') == '' or jh_data.get('tjsh', '') == None and spsq != '' and spsq != None:
                if ywry == '' or ywry == None:
                    ywry = user.username
                # phdm = 0
                # c = run_sql(f"select phdm from wfgs where wfgs='{gsmc}' limit 1")
                # if len(c)>0:
                #     phdm = c[0].get('phdm','')
                # c = run_sql(f"select bmjl from ywrybiao where yhm='{ywry}' limit 1")
                # if len(c)>0:
                #     bmjl = c[0].get('bmjl','')
                res = user_task_delete('采购计划', rid, s, [], title='已生成,请安排.日期')
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('msg'))
                s.commit()

        return json_result(1, '操作成功', {'gssb': gssb, 'path': path, 'position': position, 'cdsb': cdsb, 'xgsb': xgsb, 'gsmc': gsmc, 'jh_data': jh_data})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

async def purchase_plan_child_new(r, user, s):
    try:
        d = s.query(cgjhsheet3.rid).filter(cgjhsheet3.pid==r.get('pid'),cgjhsheet3.jhwy==r.get('jhwy')).first()
        if not d:
            m = cgjhsheet3()
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)

            rid = get_uuid()
            m.zje = math.floor(float(r.get('zje', 0)) * 100) / 100
            m.cgzje = math.floor(float(r.get('cgzje', 0)) * 100) / 100
            m.mjzj = math.floor(float(r.get('mjzj', 0)) * 100) / 100
            m.rid = rid
            m.pid = r.get('pid')
            m.uid = user.rid
            m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(m)

        return {'code': 1, 'msg': '操作成功'}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}

    
async def purchase_order_child_new(pid, items, cgry, user, bm, path, s):
    try:
        htje = 0
        cgzje = 0
        htzsl = 0
        htzxs = 0
        htzmz = 0
        htzjz = 0
        htztj = 0
        yhje = 0
        zkfy = 0
        sysl = 0
        syje = 0
        order_id = items[0].get('order_id','')
        no_data = {'宁波': 'N', '义乌': 'Y', '汕头': 'S'}
        no = 0
        key = 'N'
        if items[0].get('xddd') in no_data:
            key = no_data.get(items[0].get('xddd'),'N')
        d = s.query(cght.hthm).filter(cght.wxht==order_id).order_by(cght.sid.desc()).first()
        if d:
            index = d.hthm.rfind('-')
            h = d.hthm[index+1:]
            no = re.findall(r'\d+', h)
            if not no:
                no = 1
            else:
                no = int(no[0])
        logger.error('---no aa----')
        logger.error(no)
        hthm = str(order_id) + '-' + str(int(no)+1) + str(key)

        for r in items:
            m = cghtsheet()
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)
            m.chsy = 0
            m.chzl = 0
            m.cgzje1 = math.floor(float(r.get('cgzje1', 0)) * 100) / 100
            m.flzj = math.floor(float(r.get('flzj', 0)) * 100) / 100
            m.cgbm = bm
            m.hthm = hthm
            m.cgpath = path
            m.cgjg = r.get('cgdj', 0)
            m.hbdm = r.get('cghbdm', '')
            if m.hbdm == '' or m.hbdm == None:
                m.hbdm = 'RMB'
                m.cghl = 1
            m.nhrl = r.get('nhs', 0)
            m.zje = math.floor(float(r.get('cgzje', 0)) * 100) / 100
            m.csbh = r.get('cs_id', '')
            m.csmc = r.get('sccj', '')
            if r.get('gcpf', 0) <=0:
                m.gcpf = 0
            else:
                m.gcpf = r.get('gcpf', 0)
            m.qtcz = r.get('cz', 0)
            m.ysdj = r.get('cgdj', 0)
            m.sfqr = '是'
            m.drbz = '否'
            m.sd = '否'
            m.cgsl = r.get('yxdsl', 0)
            m.cgxs = r.get('xdxs', 0)
            m.wxrl = r.get('wxrl', 0)
            m.wlks = r.get('yxdsl', 0)
            m.sysl = r.get('yxdsl', 0)
            m.syxs = r.get('cgxs', 0)
            m.cgjhid = r.get('jhwy', '')
            m.syje = m.zje
            m.yjcq = r.get('krjq')
            m.chrq = r.get('krjq')
            m.bgjldw = r.get('bzdw','')
            m.wxht = order_id
            m.zycpbh = r.get('bjhh','')
            m.ywpath = r.get('bjpath','')
            m.cgbh = r.get('ywry','')
            m.wbcz = r.get('sjry','')
            if r.get('htrq')>time.strftime('%Y-%m-%d'):
                m.htrq = r.get('htrq')
            else:
                m.htrq = time.strftime('%Y-%m-%d')
            m.xjht = '新'
            m.cgry = cgry

            rid = get_uuid()
            m.wyzd = rid
            m.rid = rid
            m.pid = pid
            m.uid = user.rid
            m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(m)
            res = await purchase_plan_child_new(r, user, s)
            if res.get('code') != 1:
                return res
            c = s.query(cgjhsheet).filter(cgjhsheet.rid==r.get('rid','')).first()
            if c:
                # c.drbz = '是'
                # s.add(c)
                s.delete(c)
            htje = htje + r.get('cgzje',0)
            cgzje = cgzje + r.get('cgzje1',0)
            htzsl = htzsl + r.get('yxdsl',0)
            htzxs = htzxs + r.get('xdxs',0)
            htzmz = htzmz + r.get('zmz',0)
            htzjz = htzjz + r.get('zjz',0)
            htztj = htztj + r.get('ztj',0)
            yhje = yhje + r.get('yhje',0)
            zkfy = zkfy + r.get('zkfy',0)
            sysl = sysl + r.get('yxdsl',0)
            syje = syje + r.get('syje',0)

        data = {
            'htje': math.floor(htje * 100) / 100,
            'cgzje': math.floor(cgzje * 100) / 100,
            'htzsl': htzsl,
            'htzxs': htzxs, 
            'htzmz': htzmz,
            'htzjz': htzjz,
            'htztj': htztj,
            'syzsl': sysl,
            'syzje': math.floor(syje * 100) / 100,
            'yhje': math.floor(yhje * 100) / 100,
            'zkfy': math.floor(zkfy * 100) / 100,
        }
        return {'code': 1, 'msg': '操作成功', 'data': data, 'hthm': hthm}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}


async def purchase_order_main_new(rid, d, r, cgry, bm, hthm, path, total, user, s):
    try:
        m = cght()
        # for k, v in data.items():
        #     if k in SYS_FIELDS:
        #         continue
        #     if hasattr(m, k):
        #         setattr(m, k, v)
        m.sffl = '否'
        m.hbdm = r.get('cghbdm','')
        if m.hbdm == '' or m.hbdm == None:
            m.hbdm = 'RMB'
            m.cghl = 1
        m.bjpath = d.get('yw','')
        m.cgbm = bm
        m.phdm = d.get('dforder_id','')
        for k, v in r.items():
            if k in SYS_FIELDS:
                continue
            if hasattr(m, k):
                setattr(m, k, v)
        if r.get('sccj1','')!=None and r.get('sccj1','')!='' and r.get('sccj1','')!='待定':
            m.sccj1 = r.get('sccj1','')
            m.sccj = ''
        else:
            m.sccj1 = ''
            m.sccj = r.get('sccj','')
        if r.get('sccj1id','')!=None and r.get('sccj1id','')!='' and r.get('sccj1id','')!='待定':
            m.sccj1id = r.get('sccj1id','')
            m.cs_id = ''
        else:
            m.sccj1id = ''
            m.cs_id = r.get('cs_id','')
        m.cgsh = '123'
        # m.cxnf = '2017'
        m.wyzd = rid
        # m.cgzje1 = math.floor(float(r.get('cgzje1', 0)) * 100) / 100
        # m.htzsl = r.get('yxdsl', 0)
        # m.htzxs = r.get('xdxs', 0)
        # m.htzmz = r.get('zmz', 0)
        # m.htzjz = r.get('zjz', 0)
        # m.htztj = r.get('ztj', 0)


        m.htje = total.get('htje', 0)
        m.cgzje1 = total.get('cgzje1', 0)
        m.htzsl = total.get('htzsl', 0)
        m.htzxs = total.get('htzxs', 0)
        m.htzmz = total.get('htzmz', 0)
        m.htzjz = total.get('htzjz', 0)
        m.htztj = total.get('htztj', 0)
        m.yhje = total.get('yhje', 0)
        m.zkfy = total.get('zkfy', 0)

        m.hthm = hthm
        m.wxht = r.get('order_id','')
        m.wfgs = d.get('wfgs','')
        m.khmc = d.get('customer','')
        m.cgry = cgry
        org = get_user_path(cgry)
        uid = org.get('uid','')
        m.szdq = r.get('xddd','')
        m.xjht = '新'
        if r.get('gdry') != None and r.get('gdry') != '':
            m.gdry = r.get('gdry','')
            c = run_sql(f"select bm from ywrybiao where yhm='{m.gdry}' limit 1")
            if len(c)>0:
                m.gdbm = c[0].get('bm','')
            m.sfhz = '通过'
            m.xdsq = user.username
            m.xdsq1 = user.username
            m.gd = '有'
            m.cgsh = '1'
        else:
            m.sfhz = '待审批'
        m.zt = '正常'
        m.yhdd = r.get('gcdz','')
        m.htbz = d.get('htbz','')
        m.kh_id = d.get('kh_id','')
        m.khpd = d.get('khpd','')
        m.mldx = d.get('mldx',0)
        m.fyl = d.get('fyl',0)
        m.huilv = d.get('huilv',0)
        m.yw = path
        m.rid = rid
        m.uid = uid
        m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')

        if r.get('qydd') != None and r.get('qydd') != '':
            m.qydd = r.get('qydd','')
        else:
            m.qydd = r.get('xddd','')
        s.add(m)

        return {'code': 1, 'msg': '操作成功'}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}
    
def purchase_process_fees_new(pid, cg_rid, user, s):
    try:
        uid = ''
        d = s.query(cght.wyzd,cght.hthm).filter(cght.rid==cg_rid).first()
        if not d:
            return {'code': -1, 'msg': '采购合同不存在,请重新操作'}
        l = s.query(cggd.rid).filter(cggd.wyzd==d.wyzd).order_by(cggd.sid.desc()).first()
        if l:
            pid = l.rid
        c = s.query(cghtsheet4).filter(cghtsheet4.pid==cg_rid).all()
        items = alchemy_object_list_to_dict(c)
        for r in items:
            c = s.query(cggdsheet5).filter(cggdsheet5.wyzd==r.get('rid',''),func.ifnull(cggdsheet5.wyzd,'')!='').first()
            if c:
                m = c
                m.modi_uid = user.rid
                m.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            else:
                m = cggdsheet5()
                rid = get_uuid()
                m.rid = rid
                m.pid = pid
                m.uid = user.rid
                m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')

            m.wyzd = r.get('rid','')
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)

            s.add(m)

        return {'code': 1, 'msg': '操作成功', 'data': uid}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}

def purchase_process_child_new(pid, cg_rid, user, s):
    try:
        uid = ''
        d = s.query(cght).filter(cght.rid==cg_rid).first()
        if not d:
            return {'code': -1, 'msg': '采购合同不存在,请重新操作'}
        d = alchemy_object_to_dict(d)
        l = s.query(cggd.rid).filter(cggd.wyzd==d.get('wyzd')).first()
        if l:
            pid = l.rid
        c = s.query(cghtsheet).filter(cghtsheet.pid==cg_rid).all()
        items = alchemy_object_list_to_dict(c)
        for r in items:
            c = s.query(cggdsheet).filter(cggdsheet.wyzd==r.get('wyzd','')).first()
            if c:
                m = c
                m.modi_uid = user.rid
                m.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            else:
                m = cggdsheet()
                rid = get_uuid()
                m.rid = rid
                m.pid = pid
                m.uid = user.rid
                m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            for k, v in d.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)

            cpbh = r.get('khhh','')
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)
            cpbh = r.get('khhh','')
            if cpbh==None or cpbh=='':
                cpbh = r.get('bjhh','')
            m.cpbh = cpbh
            m.zwmc = r.get('zwpm','')
            m.hthm = r.get('hthm','')
            m.hwms = r.get('cpgg','')
            m.zwsm = r.get('cpsm','')
            m.ysks = r.get('yse','')
            m.bzyq = r.get('zhwbzh','')
            m.dw = r.get('jldw', 0)
            m.zxl = r.get('wxrl', '')
            m.nxrl = r.get('nhrl', 0)
            m.htzxs = r.get('cgsl', 0)
            m.htzsl = r.get('cgxs', 0)
            m.wxcc = r.get('tj', 0)
            m.htzjz = r.get('zjz', 0)
            m.htzmz = r.get('zmz', 0)
            m.htztj = r.get('ztj', 0)
            m.tsl = r.get('sl', 0)
            m.bz = r.get('bz3', '')
            m.yskd = r.get('bzkd', 0)
            m.yszd = r.get('bzcd', 0)
            m.ysgd = r.get('bzgd', 0)
            m.ysjz = r.get('jz', 0)
            m.ysmz = r.get('mz', 0)
            m.zycpbh = r.get('bjhh', '')
            s.add(m)

        return {'code': 1, 'msg': '操作成功', 'data': uid}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}
    
def purchase_process_main_new(rid, cg_rid, user, s):
    try:
        g = s.query(cght).filter(cght.rid==cg_rid).first()
        if g:
            c = s.query(cggd).filter(cggd.wyzd==g.wyzd).first()
            if c:
                m = c
                rid = c.rid
                m.modi_uid = user.rid
                m.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            else:
                m = cggd()
                m.rid = rid
                m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')

            uid = ''
            m.sfhz = '待审批'
            m.gdck = '否'
            # l = s.query(cghtsheet).filter(cghtsheet.pid==cg_rid).first()
            # if l:
            #     r = alchemy_object_to_dict(l)
            #     for k, v in r.items():
            #         if k in SYS_FIELDS:
            #             continue
            #         if hasattr(m, k):
            #             setattr(m, k, v)
            #     m.ysbz = r.get('cpyq')
            #     m.cpyq = r.get('ysbz')
            #     m.yhdd = r.get('gcdz','')
            #     m.yjcq = r.get('krjq')
            #     m.lxry = r.get('lxr')
            r = alchemy_object_to_dict(g)
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)
            org = get_user_path(g.gdry)
            path = org.get('path','')
            uid = org.get('rid','')
            m.uid = uid
            m.yw = path
            # m.cgbm = g.cgbm
            # m.szdq = g.xddd
            # m.wyzd = g.wyzd
            # m.hthm = g.hthm
            # m.htrq = g.htrq
            # m.khmc = g.khmc
            # m.wxht = g.wxht
            # m.wfgs = g.wfgs
            # m.cgry = g.cgry
            # m.gdry = g.gdry
            # m.gdbm = g.gdbm
            # m.htbz = g.htbz
            # m.kh_id = g.kh_id
            # m.khpd = g.khpd
            # m.mldx = g.mldx
            # m.fyl = g.fyl
            # m.huilv = g.huilv
            m.gdck = '否'
            if g.sccj1 != None and g.sccj1 != '' and g.sccj1 != '待定':
                m.sccj = g.sccj1
            else:
                m.sccj = g.sccj
            if g.sccj1id != None and g.sccj1id != '' and g.sccj1id != '待定':
                m.cs_id = g.sccj1id
            else:
                m.cs_id = g.cs_id
            m.xjht = '新'
            m.zt = '正常'
            s.add(m)

        return {'code': 1, 'msg': '操作成功'}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}
    
# 客户报价的客户名称修改校验
@any_route('/api/saier/purchase_plan/order/new', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_plan_order_new(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        rids = j.get('rids', [])
        # kind = j.get('kind', '')
        plsb = 0
        errors = []
        d = run_sql(f"select rid from cyzglsheet where (xm='{user.username}') and (zm='采购计划批量生成采购合同') and (ifnull(xm,'')<>'') limit 1")
        if len(d)>0:
            plsb = 1
        if plsb==1 and (rids==None or len(rids)==0):
            rids.append(rid)
        if plsb==0:
            rids = [rid]
        
        flag = 0
        for r in rids:
            # 需要生成采购合同的条件：采购计划未锁定，审批通过或者无需审批，并且当前用户在宁波合同、义乌合同、汕头合同任一角色中
            d = s.query(cgjh).filter(cgjh.rid==r,cgjh.wcck!='锁定',cgjh.htlx!='追加到采购合同',
                or_(cgjh.nbht==user.username,cgjh.ywht==user.username,cgjh.stht==user.username),
                or_(cgjh.jhqr=='通过',cgjh.wf_status==2)
            ).first()
            if d:
                flag = 1
                item_data = {}
                sh = d.jhqr
                status = d.wf_status
                c = s.query(cgjhsheet).filter(cgjhsheet.pid==d.rid,cgjhsheet.ggxm=='是').all()
                s3 = len(c)
                if s3 == 0:
                    s3 = 1
                s1 = 50 /s3
                for l in c:
                    x = alchemy_object_to_dict(l)
                    xddd = str(l.xddd)
                    cgry = str(l.cgry)
                    sfqr = str(l.sfqr)
                    htrq = l.htrq
                    drbz = l.drbz
                    cgry = l.cgry
                    gdry = l.gdry
                    sfdd = l.sfdd
                    cgzgqr = l.cgzgqr
                    # order_id = l.order_id
                    sccj = ''
                    kind = d.htlx
                    # 如果生产厂家1不为空，优先取生产厂家1，否则取生产厂家
                    if l.sccj!=None and l.sccj!='' and l.sccj!='待定':
                        sccj = l.sccj
                    elif l.sccj1!=None and l.sccj1!='' and l.sccj1!='待定':
                        sccj= l.sccj1
                    if sfqr == '是' and (gdry == None or gdry == '' or gdry == '待定'):
                        errors.append(str(l.cpbh) + str(l.bjhh))
                    if sccj == '' and kind == '工厂':
                        continue
                    if htrq != None and htrq != '' and drbz !='是' and cgry != '' and cgry != '待定' and cgry != None:
                        if not xddd in item_data:
                            item_data[xddd] = {}
                            if kind == '产品':
                                item_data[xddd][cgry] = [x]
                            else:
                                item_data[xddd][cgry] = {}
                                item_data[xddd][cgry][sccj] = [x]
                        else:
                            if not cgry in item_data[xddd]:
                                if kind == '产品':
                                    item_data[xddd][cgry] = [x]     
                                else:
                                    item_data[xddd][cgry] = {}
                                    item_data[xddd][cgry][sccj] = [x]
                            else:
                                if kind == '产品':
                                    item_data[xddd][cgry].append(x)
                                else:
                                    if not sccj in item_data[xddd][cgry]:
                                        item_data[xddd][cgry][sccj] = [x]
                                    else:
                                        item_data[xddd][cgry][sccj].append(x)

                m = alchemy_object_to_dict(d)
                for k,v in item_data.items():
                    for c,l in v.items():
                        bm = ''
                        u = run_sql(f"select bm from ywrybiao where yhm='{c}' limit 1")
                        if len(u)>0:
                            bm = u[0].get('bm','')
                        org = get_user_path(c)
                        path = org.get('path','')
                        if path == '':
                            continue
                        if kind == '产品':
                            for k in l:
                                gdry = k.get('gdry','')
                                pid = get_uuid()
                                res = await purchase_order_child_new(pid, [k], c, user, bm, path, s)
                                if res.get('code',1) != 1:
                                    return json_result(-1, res.get('msg'))
                                total = res.get('data',{})
                                hthm = res.get('hthm')
                                res = await purchase_order_main_new(pid, m, k, c, bm, hthm, path, total, user, s)
                                if res.get('code',1) != 1:
                                    return json_result(-1, res.get('msg'))
                                cpbh = k.get('khhh','')
                                if cpbh == None or cpbh == '':
                                    cpbh = k.get('bjhh','')
                                if gdry != '' and gdry != None and gdry != user.username:
                                    org = get_user_path(gdry)
                                    path1 = org.get('path','')
                                    gd_rid = get_uuid()
                                    res = purchase_process_child_new(gd_rid, pid, user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                    res = purchase_process_main_new(gd_rid, pid, user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                    row = {
                                        "xxly": '采购计划',
                                        "bjdh": '',
                                        "wxht": '',
                                        "cght": hthm,
                                        "yhdh": '',
                                        "xxnr": str(user.username) + '的跟单通知:' + hthm + '请查看,产品名为:' + cpbh + '日期:' + time.strftime('%Y-%m-%d'),
                                        "jsr": str(gdry),
                                        "sys_path": "",
                                        "spsq": gdry
                                    }
                                    res = module_xxck_new([row], user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                if c != '' and c != None and c != user.username:
                                    row = {
                                        "xxly": '采购计划',
                                        "bjdh": '',
                                        "wxht": '',
                                        "cght": hthm,
                                        "yhdh": '',
                                        "xxnr": str(user.username) + '的采购已通过:' + hthm + '请查看,产品名为' + cpbh + '日期:' + time.strftime('%Y-%m-%d'),
                                        "jsr": str(c),
                                        "sys_path": "",
                                        "spsq": c
                                    }
                                    res = module_xxck_new([row], user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                        else:
                            for cj,k in l.items():
                                pid = get_uuid()
                                res = await purchase_order_child_new(pid, k, c, user, bm, path, s)
                                if res.get('code',1) != 1:
                                    return json_result(-1, res.get('msg'))
                                total = res.get('data',{})
                                hthm = res.get('hthm')
                                res = await purchase_order_main_new(pid, m, k[0], c, bm, hthm, path, total, user, s)
                                if res.get('code',1) != 1:
                                    return json_result(-1, res.get('msg'))
                                gdry = k[0].get('gdry','')
                                if gdry != '' and gdry != None and gdry != user.username:
                                    gd_rid = get_uuid()
                                    cpbh = k[0].get('khhh','')
                                    if cpbh == None or cpbh == '':
                                        cpbh = k[0].get('bjhh','')
                                    res = purchase_process_child_new(gd_rid, pid, user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                    res = purchase_process_main_new(gd_rid, pid, user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                    row = {
                                        "xxly": '采购计划',
                                        "bjdh": '',
                                        "wxht": '',
                                        "cght": hthm,
                                        "yhdh": '',
                                        "xxnr": str(user.username) + '的跟单通知:' + hthm + '请查看' + '日期:' + time.strftime('%Y-%m-%d'),
                                        "jsr": str(gdry),
                                        "sys_path": "",
                                        "spsq": gdry
                                    }
                                    res = module_xxck_new([row], user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                                if c != '' and c != None and c != user.username:
                                    row = {
                                        "xxly": '采购计划',
                                        "bjdh": '',
                                        "wxht": '',
                                        "cght": hthm,
                                        "yhdh": '',
                                        "xxnr": str(user.username) + '的采购已通过请查看,合同名为:' + hthm + '请查看' + '日期:' + time.strftime('%Y-%m-%d'),
                                        "jsr": str(c),
                                        "sys_path": "",
                                        "spsq": c
                                    }
                                    res = module_xxck_new([row], user, s)
                                    if res.get('code',1) != 1:
                                        return json_result(-1, res.get('msg'))
                wcqk = '未完成'
                if d.nbht == user.username:
                    d.nbht = ''
                    res = user_task_delete('采购计划', d.rid, s, [d.nbht])
                    if res.get('code',1) != 1:
                        return json_result(-1, res.get('msg'))
                if d.ywht == user.username:
                    d.ywht = ''
                    res = user_task_delete('采购计划', d.rid, s, [d.ywht])
                    if res.get('code',1) != 1:
                        return json_result(-1, res.get('msg'))
                if d.stht == user.username:
                    d.stht = ''
                    res = user_task_delete('采购计划', d.rid, s, [d.stht])
                    if res.get('code',1) != 1:
                        return json_result(-1, res.get('msg'))

                a = s.query(cgjhsheet.rid).filter(cgjhsheet.pid==d.rid).first()
                if not a:
                    wcqk = '已完成'
                    res = user_task_delete('采购计划', d.rid, s)
                    if res.get('code',1) != 1:
                        return json_result(-1, res.get('msg'))
                else:
                    if d.nbht == '' or d.nbht == None or d.ywht == '' or d.ywht == None or d.stht == '' or d.stht == None:
                       d.tjsh = ''
                       d.tjsh1 = ''
                       d.jhqr = '待审批'
                    row = {
                        "xxly": '采购计划',
                        "bjdh": '',
                        "wxht": d.order_id,
                        "cght": '',
                        "yhdh": '',
                        "xxnr":  str(user.username) + '采购计划需再审通知:合同号码:' + str(d.order_id) + '有没生成合同产品，请查看日期:' + time.strftime('%Y-%m-%d'),
                        "jsr": str(d.ywry),
                        "sys_path": "",
                        "spsq": d.ywry
                    }
                    res = module_xxck_new([row],user,s)
                    if res.get('code')!=1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('code'))
                    
                d.wcqk = wcqk
                s.add(d)
        if len(rids)>0 and flag == 0:
            return json_result(-1, '未找到符合条件的数据,请检查是否已锁定、审批是否通过、义乌合同、宁波合同、汕头合同是否是当前用户')

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()