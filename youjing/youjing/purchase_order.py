
from ast import mod

from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os,re
from .__default__ import get_user_path,module_xxck_new, user_task_delete,user_task_new, module_workflow_get_task
from .purchase_plan import purchase_process_main_new, purchase_process_child_new, purchase_process_fees_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


# 采购合同的编辑界面加载校验
@any_route('/api/saier/purchase_order/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        gdry = j.get('gdry', '')
        ywry = j.get('ywry', '')
        sffl = j.get('sffl', '')
        yw = j.get('yw', '').replace('\\','_')
        yjsb = 0
        jcsb = 0
        gsmc = j.get('gsmc', '')
        cgbm = j.get('cgbm', '')
        gdbm = j.get('gdbm', '')
        wxbm = j.get('wxbm', '')
        hthm = j.get('hthm', '')
        htnr = ''
        gdcg = 0
        yqpd = 0
        bmsb = 0
        ywpd = 0
        ggsb = 0
        zjl = ''
        cr = '否'
        sp_list = []

        if sffl == '是':
            d = run_sql(f"select bmjl as dlr from ywrybiao where ((yhm='{gdry}') or (yhm='{ywry}')) and (flqx<>'无')")
        else:
            d = run_sql(f"select dlr FROM spwt where ('{yw}' like concat('%', replace(cgdl,'\\\\','_'),'%')) and (dlr<>'{ywry}') order by yhms desc")
        for r in d:
            if r.get('dlr','') =='陈妍科':
                jcsb = 1
            if r.get('dlr','') =='侯柳红':
                yjsb = 1
            if r.get('dlr','') not in sp_list:
                sp_list.append(r.get('dlr',''))

        if jcsb == 0:
            if (gsmc == '宁波景驰进出口有限公司' or gsmc == '宁波景业国际贸易有限公司') and '陈妍科' not in sp_list:
                sp_list.append('陈妍科')
            if ('景驰' in cgbm or '景驰' in gdbm or '景驰' in wxbm) and '陈妍科' not in sp_list:
                sp_list.append('陈妍科')

        if yjsb==0 and '侯柳红' not in sp_list:
            sp_list.append('侯柳红')
        d = run_sql(f"select nr from zx where (ly='采购合同签订注意要点') limit 1")
        if len(d)>0:
            htnr = d[0].get('nr','')

        d = run_sql(f"select ry from cght where (hthm='{hthm}') and (RIGHT(hthm, 1) NOT IN ('S', 'n', 'y') OR sffl = '是') limit 1")
        if len(d)>0:
            gdcg = 1

        if ywry != None and ywry != '':
            d = run_sql(f"select yhm from ywrybiao where ((bmjl='{user.username}') or (sybzj='{user.username}')) and (yhm='{ywry}') limit 1")
            if len(d)>0:
                yqpd = 1
        if ywry == user.username:
            yqpd = 1
        d = run_sql(f"select username,position,memo from sys_user where username='{user.username}' limit 1")
        if len(d)>0:
            position = ''
            if d[0].get('position','')!='' and d[0].get('position','')!=None:
                position = d[0].get('position','')
            elif d[0].get('memo','')!='' and d[0].get('memo','')!=None:
                position = d[0].get('memo','')

            if '总经理' in position:
                yqpd = 1
                zjl = d[0].get('username','')
            if '总' in position or '采购主管' in position:
                ywpd = 1
            if '外销' in position or '采购主管' in position:
                cr = '是'
                bmsb = 1
                ywpd = 1
            if '跟单' in position or '采购主管' in position:
                cr = '是'
        if hthm != '' and hthm != None:
            d = run_sql(f"select rid from fkspsheet3 where (hthm='{hthm}') and (seje>0) limit 1")
            if len(d)>0:
                ggsb = 1

        return json_result(1, '操作成功', {'sp_list': sp_list, 'htnr': htnr, 'gdcg': gdcg, 'yqpd': yqpd, 'bmsb': bmsb, 'ywpd': ywpd, 'zjl': zjl, 'cr': cr, 'ggsb': ggsb})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的专业厂家id修改校验
@any_route('/api/saier/purchase_order/sccjid/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_sccjid_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cs_id = j.get('cs_id', '')
        code = 1
        msg = '操作成功'
        d = s.query(zycs.hzdj1).filter(zycs.cs_id==cs_id).first()
        if not d:
            code = -1
            msg = '注意该工厂在专业工厂中不存在'
        elif d.hzdj1==None or float(d.hzdj1) < 60:
            code = -1
            msg = '注意该工厂在专业工厂中评分低于60!'
        
        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的是否辅料修改校验
@any_route('/api/saier/purchase_order/sffl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_sffl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sffl = j.get('sffl', '')
        ywry = j.get('ywry', '')
        gdry = j.get('gdry', '')
        yw = j.get('yw', '')
        gsmc = j.get('gsmc', '')
        cgbm = j.get('cgbm', '')
        gdbm = j.get('gdbm', '')
        wxbm = j.get('wxbm', '')
        yw = yw.replace('\\','_')
        code = 1
        msg = '操作成功'
        jcsb = 0
        yjsb = 0
        sp_list = []
        if sffl == '是':
            d = run_sql(f"select bmjl as dlr from ywrybiao where ((yhm='{ywry}') or (yhm='{gdry}')) and (flqx<>'无')")
        else:
            d = run_sql(f"select dlr from spwt where ('{yw}' like concat('%', replace(cgdl,'\\\\','_'),'%')) and (dlr<>'{ywry}') order by yhms desc")
        for r in d:
            if r.get('dlr','') =='陈妍科':
                jcsb = 1
            if r.get('dlr','') =='侯柳红':
                yjsb = 1
            if r.get('dlr','') not in sp_list:
                sp_list.append(r.get('dlr',''))

        if jcsb == 0:
            if (gsmc == '宁波景驰进出口有限公司' or gsmc == '宁波景业国际贸易有限公司') and '陈妍科' not in sp_list:
                sp_list.append('陈妍科')
            if ('景驰' in cgbm or '景驰' in gdbm or '景驰' in wxbm) and '陈妍科' not in sp_list:
                sp_list.append('陈妍科')

        if yjsb==0 and '侯柳红' not in sp_list:
            sp_list.append('侯柳红')

        return json_result(code, msg, sp_list)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的采购人员修改校验
# @any_route('/api/saier/purchase_order/cgry/change', methods=['POST', 'GET'])
# @require_token
# async def view_saier_purchase_order_cgry_change(request):
#     s = Session()
#     user = request.current_user
#     j = await request.json()
#     try:
#         rid = j.get('rid', '')
#         cgry = j.get('cgry', '')
#         hthm = j.get('hthm', '')
#         rid = j.get('rid', '')
#         cgry1 = ''
#         path1 = ''
#         code = 1
#         msg = '操作成功'
#         d = run_sql(f"select cgry from cght where rid='{rid}' limit 1")
#         if len(d)>0:
#             cgry1 = d[0].get('cgry','')
#         d = run_sql(f"select bz from cyzglsheet where (xm='{cgry}') and (zm='采购特殊查看权限') limit 1")
#         if len(d)>0:
#             path1 = d[0].get('bz','')
#         if path1=='':
#             org = get_user_path(cgry)
#             path1 = org.get('path','')
#         if path1 == '' or path1 == None:
#             return json_result(-1, '请检查采购人员名字是否正确')

#         return json_result(code, msg, path1)
#     except:
#         logger.error(trace_error())
#         return json_result(-1, trace_error())
#     finally:
#         s.close()


# 采购合同的合同号码修改校验
@any_route('/api/saier/purchase_order/hthm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_hthm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        hthm = j.get('hthm', '')
        code = 1
        msg = '操作成功'
        d = run_sql(f"select rid from cght where (hthm like '%{hthm}%') AND ((hthm='{str(hthm)+'N'}') OR (hthm='{str(hthm)+'Y'}') OR (hthm='{str(hthm)+'S'}')) AND (hthm<>'{hthm}') limit 1")
        if len(d)>0 and rid!=d[0].get('rid',''):
            code = -1
            msg = '相似合同号码已存在'
        
        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
# 采购合同的开票工厂修改校验
@any_route('/api/saier/purchase_order/kpgc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_kpgc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {'hyd': '', 'zzjgdm': '', 'kplxr': '', 'kpdh': ''}
        kpgc = j.get('kpgc', '')
        code = 1
        msg = '操作成功'
        d = run_sql(f"select hyd,zzjgdm,kplxr,kpdh from ozycs where (company_name='{kpgc}') limit 1")
        if len(d)>0:
            data = d[0] 
        
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的开票工厂修改校验
@any_route('/api/saier/purchase_order/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_khmc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {'RMBkh': '否', 'cghtqx': 0, 'xsht': ''}
        khmc = j.get('khmc', '')
        hthm = j.get('hthm', '')
        code = 1
        msg = '操作成功'
        d = run_sql(f"select RMBkh,cghtqx from kh where company_name='{khmc}' limit 1")
        if len(d)>0:
            data['RMBkh'] = d[0].get('RMBkh', '否')
            data['cghtqx'] = d[0].get('cghtqx', 0)

        bz1 = ''
        if 'AMAZON' in khmc.upper() and (hthm=='' or hthm==None):
            d = run_sql(f"select bz1 from cyzglsheet where (bz='{khmc}') and (zm='跨境电商') limit 1")
            if len(d)>0:
                bz1 = d[0].get('bz1','')
            d3 = time.strftime('%Y-%m-%d')
            d1 = d3[2:4]
            d2 = d3[5:7]
            d4 = d3[8:10]
            htpb = 'AMZ' + str(d1) + str(d2) + str(d4) + str(bz1)
            d = run_sql(f"select ifnull(count(rid),0) as no from cght where wxht like '%{htpb}%' limit 1")
            if len(d)>0:
                no = d[0].get('no',0)+1
                data['xsht'] = str(htpb) + str(no).zfill(2)

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的客户货号批量更新按钮
@any_route('/api/saier/purchase_order/khhh/btn', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_khhh_btn(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khhh = j.get('khhh', '')
        rids = j.get('rids', [])
        code = 1
        msg = '操作成功'
        for rid in rids:
            d = run_sql(f"select rid from cght where rid='{rid}' and (ywry='{user.username}' or gdry='{user.username}')  limit 1")
            if len(d)==0:
                continue
            c = s.query(cghtsheet).filter(cghtsheet.pid==rid,cghtsheet.khhh==khhh).all()
            for r in c:
                r.khhh = ''
                s.add(r)
                g = s.query(cggdsheet).filter(cggdsheet.wyzd==r.wyzd,cggdsheet.krhh==khhh).all()
                for l in g:
                    l.krhh = ''
                    l.cpbh = r.zycpbh
                    s.add(l)

        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的专业货号修改校验
@any_route('/api/saier/purchase_order/zyhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_zyhh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cgry = ''
        zyhh = j.get('zyhh', '')
        sccj = j.get('sccj', '')
        code = 1
        msg = '操作成功'
        if zyhh == '' or sccj == '' or sccj == None or sccj == '待定' or zyhh == None:
            return json_result(code, msg, cgry)
        
        d = run_sql(f"select cgry from zscpsheet5 where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
        if len(d)>0:
            cgry = d[0].get('cgry', '')
        if cgry == '' or cgry == None:
            d = run_sql(f"select cgry from zscp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
            if len(d)>0:
                cgry = d[0].get('cgry', '')
        if cgry == '' or cgry == None:
            d = run_sql(f"select cgry from cjcp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
            if len(d)>0:
                cgry = d[0].get('cgry', '')

        return json_result(code, msg, cgry)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的主产品货号修改校验
@any_route('/api/saier/purchase_order/zcphh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_zcphh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fljg = 0
        zyhh = j.get('zyhh', '')
        code = 1
        msg = '操作成功'

        d = run_sql(f"select ifnull(fljg, 0) fljg from zscp where (cpbh='{zyhh}') limit 1")
        if len(d)>0:
            fljg = d[0].get('fljg', 0)

        return json_result(code, msg, fljg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的客户货号修改校验
@any_route('/api/saier/purchase_order/khhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_khhh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fljg = 0
        khhh = j.get('khhh', '')
        zyhh = j.get('zyhh', '')
        khbh = j.get('khbh', '')
        cpbh = ''
        code = 1
        msg = '操作成功'

        d = run_sql(f"select cpbh from zscpsheet7 where (krhh='{khhh}' and krID='{khbh}') limit 1")
        if len(d)>0:
            cpbh = d[0].get('cpbh', '')
        if cpbh == '' or cpbh == None:
            d = run_sql(f"select cpbh from zscp where (krhh='{khhh}') limit 1")
            if len(d)>0:
                cpbh = d[0].get('cpbh', '')
        if cpbh == '' or cpbh == None:
            d = run_sql(f"select cpbh from cjcp where (krhh='{khhh}') limit 1")
            if len(d)>0:
                cpbh = d[0].get('cpbh', '')

        return json_result(code, msg, cpbh)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的采购单价修改校验
@any_route('/api/saier/purchase_order/cgdj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_cgdj_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {}
        wxwyzd = j.get('wxwyzd', '')
        zyhh = j.get('zyhh', '')
        code = 1
        msg = '操作成功'

        d = run_sql(f"select wxdj,Twxdj,mjdj1,pkRMB,aybl,asl6,sl6,yjbl from wxhtsheet where (bjhh='{zyhh}' and wxwyzd='{wxwyzd}') limit 1")
        if len(d)>0:
            data = d[0]

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的采购单价修改校验
@any_route('/api/saier/purchase_order/zyhh/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_zyhh_update(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        data = {}
        khbh = j.get('khbh', '')
        zyhh = j.get('zyhh', '')
        code = 1
        msg = '操作成功'
        khhh = ''
        krtm = ''
        d = run_sql(f"select * from zscp where (cpbh='{zyhh}') limit 1")
        if len(d)>0:
            data = d[0]
        if len(data) == 0:
            d = run_sql(f"select * from cjcp where (cpbh='{zyhh}') limit 1")
            if len(d)>0:
                data = d[0]
        if len(data) > 0:
            c = run_sql(f"select krhh,krtm from zscpsheet7 where (cpbh='{zyhh}') and (krID='{khbh}') limit 1")
            if len(c)>0:
                if c[0].get('krhh','') != None and c[0].get('krhh','') != '' and c[0].get('krhh','') != '无':
                    khhh = c[0].get('krhh','')
                if c[0].get('krtm','') != None and c[0].get('krtm','') != '' and c[0].get('krtm','') != '无':
                    krtm = c[0].get('krtm','')
            if khhh != '' and khhh != None:
                data['khhh'] = khhh
            if krtm != '' and krtm != None:
                data['krtm'] = krtm

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的采购单价修改校验
@any_route('/api/saier/purchase_order/wxzl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_wxzl_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        chsl = 0
        xssl = 0
        cgsl = 0
        cgxs = 0
        wxrl = 0
        saved = 0
        wxwyzd = j.get('wxwyzd', '')
        cgwyzd = j.get('cgwyzd', '')
        cghth = j.get('cghth', '')
        htsl = j.get('htsl', 0)
        code = 1
        msg = '操作成功'
        if cgwyzd!='' and cgwyzd!=None:
            d = run_sql(f"select ifnull(sum(ifnull(chsl,0)),0) as chsl from cymxsheet where (chydh=fphm) and (cght='{cghth}') and (pgwy='{cgwyzd}') and ((zs='否') or (ifnull(zs,'')='')) limit 1")
            if len(d)>0:
                chsl = d[0].get('chsl', 0)
        if htsl < chsl:
            return json_result(-1, "此合同总体出货数大于下单数请核实,合同数将变为出货数", {'chsl': chsl, 'xssl': xssl, 'cgsl': cgsl, 'cgxs': cgxs, 'wxrl': wxrl})
        
        if wxwyzd != '' and wxwyzd != None:
            d = run_sql(f"select htsl from wxhtsheet where (wxwyzd='{wxwyzd}') limit 1")
            if len(d)>0:
                xssl = d[0].get('htsl', 0)

            d = run_sql(f"select ifnull(sum(ifnull(xdsl,0)),0) as cgsl from cghtsheet where (wxwyzd='{wxwyzd}') and wyzd<>'{cgwyzd}' and xjht<>'作废' limit 1")
            if len(d)>0:
                cgsl = d[0].get('cgsl', 0)
            if xssl < htsl + cgsl:
                d = run_sql(f"select cgsl,wxrl,cgxs from cghtsheet where (wxwyzd='{wxwyzd}') and wyzd='{cgwyzd}' and xjht<>'作废' limit 1")
                if len(d)>0:
                    saved = 1
                    cgxs = d[0].get('cgxs', 0)
                    wxrl = d[0].get('wxrl', 0)   

        data = {'chsl': chsl, 'xssl': xssl, 'cgsl': cgsl, 'cgxs': cgxs, 'wxrl': wxrl, 'saved': saved}
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的开票工厂修改校验
@any_route('/api/saier/purchase_order/item/kpgc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_item_kpgc_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sdpd = 0
        ytsb = 0
        data = {}
        wxwyzd = j.get('wxwyzd', '')
        cgwyzd = j.get('cgwyzd', '')
        cghth = j.get('cghth', '')
        rid = j.get('rid', '')
        code = 1
        line = {}
        msg = '操作成功'
        d = run_sql(f"select rid from cymxsheet where (cght='{cghth}') and (wxwyzd='{wxwyzd}') limit 1")
        if len(d)>0:
            sdpd = 1
        d = run_sql(f"select cght from ytfysheet where (cght='{cghth}') limit 1")
        if len(d)>0:
            ytsb = 1
        if ytsb == 0:
            d = run_sql(f"select cght from dsytfysheet where (cght='{cghth}') limit 1")
            if len(d)>0:
                ytsb = 1
        if ytsb == 1 or sdpd == 1:
            d = run_sql(f"select cgjg,nhrl,nhwx,wxrl,kpgc,zzjgdm,kplxr,kpdh,cpgg,sccj1,jsfs,cgsl,cgxs from cghtsheet where (pid='{rid}') and wyzd='{cgwyzd}' limit 1")
            if len(d)>0:
                line = d[0] 

        data = {'line':line, 'sdpd':sdpd, 'ytsb':ytsb}

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的总金额修改校验
@any_route('/api/saier/purchase_order/item/zje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_item_zje_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        nxkh = '否'
        cghl = 1
        yjpd = 0
        data = {}
        cgbz = j.get('cgbz', '')
        khmc = j.get('khmc', '')
        code = 1
        msg = '操作成功'
        
        d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='按佣金单价计算佣金') limit 1")
        if len(d)>0:
            yjpd = 1
        if cgbz != '' and cgbz != None and 'RMB' not in cgbz.upper():
            d = run_sql(f"select hhl from hbdm where hbdm='{cgbz}' limit 1")
            if len(d)>0:
                cghl = d[0].get('hhl', 1)
        if khmc != '' and khmc != None:
            d = run_sql(f"select nxkh from kh where company_name='{khmc}' limit 1")
            if len(d)>0:
                nxkh = d[0].get('nxkh', '否')

        data = {'nxkh':nxkh, 'yjpd':yjpd, 'cghl':cghl}

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的总金额修改校验
@any_route('/api/saier/purchase_order/view/ckry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_view_ckry_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        ckry = j.get('wyzd', '')
        code = 1
        msg = '操作成功'
        org = get_user_path(ckry)
        path = org.get('path','')
        uid = org.get('rid','')
        return json_result(code, msg, {'path': path, 'uid': uid})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的总金额修改校验
@any_route('/api/saier/purchase_order/view/cksj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_view_cksj_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        ckry = j.get('wyzd', '')
        code = 1
        msg = '操作成功'
        data = []
        d = run_sql(f"select  bmjl,sybzj from ywrybiao where (yhm='{ckry}') limit 1")
        if len(d)>0:
            bmjl = d[0].get('bmjl','')
            sybzj = d[0].get('sybzj','')
            if bmjl!=None and bmjl!='' and ckry != bmjl:
                org = get_user_path(bmjl)
                path = org.get('path','')
                uid = org.get('rid','')
                data.append({'path': path, 'uid': uid, 'name': bmjl})
            if sybzj!=None and sybzj != bmjl and sybzj != '' and ckry != sybzj:
                org = get_user_path(sybzj)
                path = org.get('path','')
                uid = org.get('rid','')
                data.append({'path': path, 'uid': uid, 'name': sybzj})

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的外销单价更新
@any_route('/api/saier/purchase_order/cancel/btn', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_cancel_btn(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sfhz = j.get('sfhz', '')
        hthm = j.get('hthm', '')
        ywry = j.get('ywry', '')
        cgry = j.get('cgry', '')
        gdry = j.get('gdry', '')
        rid = j.get('rid', '')
        val = j.get('val', '')
        code = 1
        msg = '操作成功'
        data = {}
        if sfhz != '通过':
            code = -1
            msg = '请注意此合同已审批通过,需提交改单申请后方可取消!'
            return json_result(code, msg, data)
        
        # d = run_sql(f"select rid from cymxsheet where (cght='{hthm}') limit 1")
        # if len(d)>0:
        #     code = -1
        #     msg = '请注意该合同在单证处请先让单证删除才能作废!'
        #     return json_result(code, msg, data)
        
        d = s.query(cght).filter(cght.rid==rid).first()
        if d :
            # if (ywry != '' and ywry != None and ywry == user.username) or (cgry != '' and cgry != None and cgry == user.username) or (gdry != '' and gdry != None and gdry == user.username):
            d.xjht = '作废'
            d.zt = '作废'
            d.jlts = 0
            if d.htbz == None or d.htbz == '':
                d.htbz = '作废原因: ' + str(val)
            else:
                d.htbz = d.htbz + ';作废原因: ' + str(val)
            s.add(d)
            c = s.query(zycjcpsheet).filter(cghtsheet.hthm==hthm).all()
            for r in c:
                s.delete(r)
            c = s.query(cghtsheet).filter(cghtsheet.pid==rid).all()
            for r in c:
                wxwyzd = copy.deepcopy(r.wxwyzd)
                jhwy = r.cgjhid
                wyzd = r.wyzd
                r.wxwyzd1 = wxwyzd
                r.wxwyzd = str(wxwyzd) + '作废'
                s.add(r)
                cgsl = 0
                cgxs = 0
                if jhwy != None and jhwy != '':
                    l = run_sql(f"select ifnull(sum(ifnull(cgsl,0)),0) as cgsl1z,ifnull(sum(ifnull(cgxs,0)),0) as cgxs1z from cghtsheet where (wxwyzd='{wxwyzd}') and (cgjhid='{jhwy}') and (wyzd<>'{wyzd}') limit 1")
                    if len(l)>0:
                        cgsl = l[0].get('cgsl1z', 0)
                        cgxs = l[0].get('cgxs1z', 0)
                    s.query(cgjhsheet3).filter(cghtsheet.wxwyzd==wxwyzd,cgjhsheet3.jhwy==jhwy).update({'xdxs': cgxs, 'yxdsl': cgsl})
            c = s.query(cggd).filter(cggd.wyzd==d.wyzd, cggd.hthm==d.hthm).first()
            if c:
                l = s.query(cggdsheet).filter(cggdsheet.pid==c.rid).all()
                for r in l:
                    s.delete(r)
                s.delete(c)
            s.commit()
        
        return json_result(code, msg, data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的外销单价更新
@any_route('/api/saier/purchase_order/wxdj/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_wxdj_update(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        lines = j.get('lines', [])
        code = 1
        msg = '操作成功'
        data = {}
        for r in lines:
            rid = r.get('rid','')
            wxwyzd = r.get('wxwyzd','')
            if wxwyzd == None or wxwyzd == '':
                continue
            d = run_sql(f"select hydj,hyRMBdj,sl6,asl6 from cyzglsheet where (wxwyzd='{wxwyzd}') limit 1")
            if len(d)>0:
                data[rid] = d[0]

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#采购合同的产品资料刷新单证锁定
@any_route('/api/saier/purchase_order/item/update/dzsd', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_item_update_dzsd(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        dzsd = 0
        cghth = j.get('cghth','')
        pgwy = j.get('pgwy','')
        d = run_sql(f"select rid from cymxsheet where (sfgd='解锁') and (cght='{cghth}') and ((fpsb1='是') or (fksb='是')) and (pgwy='{pgwy}') limit 1")
        if len(d)>0:
            dzsd = 1
        else:
            d = run_sql(f"select rid from cymxsheet where (cght='{cghth}' and pgwy='{pgwy}') limit 1")
            if len(d)==0:
                dzsd = 1

        return json_result(1, '校验成功', dzsd)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#采购合同的产品资料删除记录
@any_route('/api/saier/purchase_order/item/delete/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_item_delete_check(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        cghth = j.get('cghth','')
        wxwyzd = j.get('wxwyzd','')
        cgwyzd = j.get('cgwyzd','')
        zyhh = j.get('zyhh','')
        dzsd = j.get('dzsd', '')
        if dzsd != None and dzsd !='':
            return json_result(-1, f"不好意思,货号{zyhh}已经由单证:{dzsd}锁定，您无权删除，请联系相关单证人员解锁")
        
        d = run_sql(f"select rid from cymxsheet where (wxwyzd='{wxwyzd}') and (cght='{cghth}') limit 1")
        if len(d)>0:
            return json_result(-1, '请注意该产品在单证处请先让单证删除才能删除')

        d = run_sql(f"select rid from chyjhsheet where (cght='{cghth}' and wxwyzd='{wxwyzd}') limit 1")
        if len(d)>0:
            return json_result(-1, '请注意该产品有出运计划请先删除才能删除')

        return json_result(1, '校验成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#采购合同的产品资料删除记录
@any_route('/api/saier/purchase_order/view/delete/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_view_delete_check(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        user_list = j.get('ckry',[])
        module = j.get('module','采购合同')
        o = get_module(module)

        table = get_model_by_table_name(str('sys_')+o.table_name+str('_share'))
        uid_list=[]
        for user_row in user_list:
            d = s.query(sys_user.rid).filter(sys_user.username==user_row).first()
            if d and not str(d.rid) in uid_list:
                uid_list.append(str(d.rid))

        if len(uid_list)==0:
            return {'code':1, 'msg':'分享人员为空,无须处理'}
        
        for uid in uid_list:
            d = s.query(table).filter(table.record_id==rid,table.to_uid==uid).first()
            if d:
                s.delete(d)

        s.commit()
        return json_result(1, '校验成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的保存之前操作
@any_route('/api/saier/purchase_order/sccj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_sccj_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sccj = j.get('sccj', '')
        lines = j.get('lines', [])
        cgry = ''
        code = 1
        msg = '操作成功'
        for r in lines:
            zyhh = r.get('zyhh', '')
            if zyhh == '' or sccj == '' or sccj == None or sccj == '待定' or zyhh == None:
                continue
            d = run_sql(f"select cgry from zscpsheet5 where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
            if len(d)>0:
                cgry = d[0].get('cgry', '')
            if cgry == '' or cgry == None:
                d = run_sql(f"select cgry from zscp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
                if len(d)>0:
                    cgry = d[0].get('cgry', '')
            if cgry == '' or cgry == None:
                d = run_sql(f"select cgry from cjcp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
                if len(d)>0:
                    cgry = d[0].get('cgry', '')
            if cgry != '' and cgry != None:
                break

        return json_result(code, msg, cgry)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的下单申请操作
@any_route('/api/saier/purchase_order/apply/btn', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_apply_btn(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        spsq = j.get('spsq', '')
        gsmc = j.get('gsmc', '')
        rid = j.get('rid', '')
        yw = j.get('yw', '')
        ywry = j.get('ywry', '')
        gdry = j.get('gdry', '')
        sffl = j.get('sffl', '')
        hthm = j.get('hthm', '')
        jsfs = j.get('jsfs', '')
        tssp = j.get('tssp', '')
        job = 0
        b = 0
        jsfs1 = ''
        zjl = ''
        code = 1
        gd_flag = 0
        path1 = ''
        msg = '操作成功'
        m = s.query(cght).filter(cght.rid==rid).first()
        if m:
            jsfs1 = m.jsfs
            job = 1
        d = run_sql(f"select rid from cyzglsheet where (xm='{spsq}') and (zm='总经理') AND (bz='{gsmc}') limit 1")
        if len(d)>0:
            zjl = spsq
        if user.username == spsq: 
            d = run_sql(f"select rid from spwt where (dlr='{spsq}') limit 1")
            if len(d)==0:
                b = 1
        else:
            yw  = yw.replace('\\','_')
            d = run_sql(f"select rid from spwt where (dlr='{spsq}') and ('{yw}' like concat('%', replace(cgdl,'\\\\','_'),'%')) limit 1")
            if len(d)==0:
                b = 1
            if sffl == '是':
                d = run_sql(f"select rid from ywrybiao where ((yhm='{ywry}') or (yhm='{gdry}')) and (((bmjl='{spsq}') and (flqx<>'无')) or (sybzj='{spsq}')) limit 1")
                if len(d)>0:
                    b = 0
        if b == 0:
            code = -1
            msg = f'不好意思,此人没有下单审批权限,请重新选择,谢谢'
            return json_result(code, msg)
        
        if (jsfs1 != '' and jsfs1 != jsfs):
            tssp = '是'
        if tssp == '是' and spsq == zjl:
            code = -1
            msg = '不好意思,这个合同需总经理审批,请重新选择,谢谢'
            return json_result(code, msg)
        
        if zjl == user.username:
            if spsq != user.username:
                gd_flag = 1
            m.tssp = tssp
            m.xdsq1 = spsq
            s.add(m)
        else:
            org = get_user_path(spsq)
            path1 = org.get('path','')
            if job == 1:
                xxnr = '审批' + user.username + '的采购合同:' + str(hthm) + '需审批,日期:' + time.strftime('%Y-%m-%d')
                if (jsfs1 != '' and jsfs1 != jsfs):
                    xxnr = user.username + '的采购合同:' + str(hthm) + '更改结算方式需审批,日期:' + time.strftime('%Y-%m-%d')
            res = user_task_new('采购合同', rid, '合同号码', '[合同号码]采购合同需审批',xxnr, user, s, [spsq], True)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            m.path1 = path1
            m.xdsq1 = spsq
            m.fxsb = '是'
            m.sfhz = '待审批'
            m.zjsm = 0
            m.tssp = tssp
            s.add(m)
        s.commit()
        return json_result(code, msg, gd_flag)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的下单申请操作
@any_route('/api/saier/purchase_order/item/tsl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_item_tsl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wxwyzd = j.get('wxwyzd', '')
        code = 1
        msg = '操作成功'
        m = s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).first()
        if m and m.cgze!=None and m.cgze!=0:
            m.cgze = 0
            s.add(m)
            s.commit()

        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的下单申请改变时
@any_route('/api/saier/purchase_order/xdsq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_xdsq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        gsmc = j.get('gsmc', '')
        xdsq = j.get('xdsq', '')
        rid = j.get('rid', '')
        tssp = j.get('tssp', '')
        jsfs1 = j.get('jsfs', '')
        sffl = j.get('sffl', '')
        gdry = j.get('gdry', '')
        bjdl = j.get('bjdl', '')
        bjdl = bjdl.replace('\\','_')
        jsfs = ''
        lines = j.get('lines', [])
        code = 1
        hz = '1'
        kp = 0
        q = 0
        b = 0
        msg = '操作成功'
        d = run_sql(f"select rid from cyzglsheet where (xm='{xdsq}') and (zm='总经理') AND (bz='{gsmc}') limit 1")
        if len(d)>0:
            hz = xdsq
        d = run_sql(f"select rid,jsfs from cggd where rid='{rid}' limit 1")
        if len(d)>0:
            jsfs = d[0].get('jsfs','')
        for r in lines:
            if r.get('sfhs')=='是' and (r.get('zzsl')==0 or r.get('zzsl')==None or r.get('hgbm')=='' or r.get('hgbm')==None or r.get('kpgc')=='' or r.get('kpgc')==None or r.get('zhwbgpm')=='' \
                or r.get('zhwbgpm')==None or r.get('zhwbgpm')=='无' or r.get('bgjldw')=='' or r.get('bgjldw')==None or r.get('hyd')=='' or r.get('hyd')==None):
                kp = 1
            if r.get('jsfy') and r.get('jsfy') < 0:
                q = q + 1
        if kp == 1:
            code = -1
            msg = '有开票必填信息没填:增退税,中文报关品名,海关编码，报关单位,开票工厂,货 源 地'
            return json_result(-1, msg)
        
        if jsfs != '' and jsfs != None and jsfs != jsfs1:
            tssp = '是'

        if tssp == '是' and hz != xdsq:
            code = -1
            msg = '不好意思,这个合同需总经理审批,请重新选择,谢谢'
            return json_result(code, msg)
        
        d = run_sql(f"select rid from spwt where (dlr='{xdsq}') limit 1")
        if len(d)==0:
            b = 1
        else:
            d = run_sql(f"select rid from spwt where (dlr='{xdsq}') and ('{bjdl}' like concat('%', replace(cgdl,'\\\\','_'), '%')) limit 1")
            if len(d)==0:
                b = 1
            if sffl == '是':
                d = run_sql(f"select rid from ywrybiao where ((yhm='{xdsq}') or (yhm='{gdry}')) and (((bmjl='{xdsq}') and (flqx<>'无')) or (sybzj='{xdsq}')) limit 1")
                if len(d)>0:
                    b = 0
        if b == 1:
            code = -1
            msg = f'不好意思,此人没有下单审批权限,请重新选择,谢谢'
            return json_result(code, msg)
        
        path1 = ''
        if user.username != hz:
            org = get_user_path(xdsq)
            path1 = org.get('path','')

        return json_result(code, msg, {'q': q, 'tssp': tssp, 'path1': path1, 'hz': hz})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的下单申请操作
@any_route('/api/saier/purchase_order/field/update', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_apply_btn(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        gdry = j.get('val', '')
        rid = j.get('rid', '')
        code = 1
        msg = '操作成功'
        m = s.query(cght).filter(cght.rid==rid).first()
        if m:
            m.gdry = gdry
            d = run_sql(f"select bm from ywrybiao where yhm='{gdry}' limit 1")
            if len(d)>0:
                m.gdbm = d[0].get('bm','')
            s.add(m)
            s.commit()

        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的保存之前操作
@any_route('/api/saier/purchase_order/save/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_save_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        cgry = j.get('cgry', '')
        sccj = j.get('sccj', '')
        gdry = j.get('gdry', '')
        ywry = j.get('ywry', '')
        khmc = j.get('khmc', '')
        hthm = j.get('hthm', '')
        gsmc = ''
        sfhz = j.get('sfhz', '')
        kppm = j.get('kppm', '')
        bjbm = j.get('bjbm', '')
        if bjbm == '' or bjbm == None:
            org = get_user_path(ywry)
            bjbm = org.get('path','')
        lines = j.get('lines', [])
        cgry1 = ''
        cgry2 = ''
        path1 = ''
        path2 = ''
        szdq = ''
        cgbm = ''
        gdbm = ''
        cg_uid = ''
        gd_uid = ''
        ywpath = ''
        code = 1
        cdsb = 0
        hgbm = ''
        tsl = 0
        zzsl = 0
        msg = '操作成功'
        d = run_sql(f"select * from cyzglsheet where (xm='{khmc}') and (zm='我方公司不锁定') and (ifnull(xm,'')<>'') limit 1")
        if len(d)==0:
            d = run_sql(f"select Vendorgs from kh where (company_name='{khmc}') and (ifnull(Vendorgs, '')<>'') limit 1")
            if len(d)>0:
                gsmc = d[0].get('Vendorgs','')
        if sfhz != '待审核':
            d = run_sql(f"select rid from cght where (hthm='{hthm}') and (xdsq='') and (ywry<>'{ywry}') and (gdry<>'{gdry}') limit 1")
            if len(d)>0:
                cdsb = 1
        if ywry != '' and ywry != None:
            org = get_user_path(ywry)
            ywpath = org.get('path','')
        if kppm != '' and kppm != None:
            d = run_sql(f"select hwmc,hgbm,tsl,zzsl from hgbmbsheet where hwmc='{kppm}' limit 1")
            if len(d)>0:
                hgbm = d[0].get('hgbm','')
                tsl = d[0].get('tsl',0)
                zzsl = d[0].get('zzsl',0)

        d = run_sql(f"select cgry from cght where rid='{rid}' limit 1")
        if len(d)>0:
            cgry1 = d[0].get('cgry','')
        d = run_sql(f"select bz from cyzglsheet where (xm='{cgry}') and (zm='采购特殊查看权限') limit 1")
        if len(d)>0:
            path1 = d[0].get('bz','')
        org = get_user_path(cgry)
        if path1=='':
            path1 = org.get('path','')
        if path1 == '' or path1 == None:
            return json_result(-1, '请检查采购人员名字是否正确')
        if gdry != '' and gdry != None:
            org = get_user_path(gdry)
            path2 = org.get('path','')
            gd_uid = org.get('rid','')
            if path2 == '' or path2 == None:
                return json_result(-2, '请检查跟单人员名字是否正确')
            d = run_sql(f"select bm,ssdq from ywrybiao where yhm='{gdry}' limit 1")
            if len(d)>0:
                gdbm = d[0].get('bm','')
                szdq = d[0].get('ssdq','')

        for r in lines:
            zyhh = r.get('zyhh', '')
            if zyhh == '' or sccj == '' or sccj == None or sccj == '待定' or zyhh == None:
                continue
            d = run_sql(f"select cgry from zscpsheet5 where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
            if len(d)>0:
                cgry2 = d[0].get('cgry', '')
            if cgry2 == '' or cgry2 == None:
                d = run_sql(f"select cgry from zscp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
                if len(d)>0:
                    cgry2 = d[0].get('cgry', '')
            if cgry2 == '' or cgry2 == None:
                d = run_sql(f"select cgry from cjcp where (cpbh='{zyhh}' and sccj='{sccj}') limit 1")
                if len(d)>0:
                    cgry2 = d[0].get('cgry', '')
            if cgry2 != '' and cgry2 != None:
                cgry = cgry2
                break

        if (cgry1!='' and cgry1!=None and cgry != cgry1):
            code = 0
            msg = '采购人员发生变更'
            org = get_user_path(cgry)
            path1 = org.get('path','')
            cg_uid = org.get('rid','')
            if path1 == '' or path1 == None:
                return json_result(-1, '请检查采购人员名字是否正确')
            d = run_sql(f"select ssdq,bm from ywrybiao where yhm='{cgry}' limit 1")
            if len(d)>0:
                szdq = d[0].get('ssdq','')
                cgbm = d[0].get('bm','')

        data = {'cg_uid': cg_uid, 'szdq': szdq, 'cgbm': cgbm, 'path1': path1, 'cgry': cgry, 'path2': path2, 'gdbm': gdbm, 'gd_uid': gd_uid, 'gdry': gdry, 'cdsb': cdsb, 'gsmc': gsmc, 'ywpath':ywpath, 'hgbm':hgbm, 'tsl':tsl, 'zzsl':zzsl,'bjbm':bjbm}
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购合同的保存之前操作
@any_route('/api/saier/purchase_order/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        khyq = j.get('khyq', None)
        lines = j.get('lines', [])
        cgry = j.get('cgry', '')
        gdry = j.get('gdry', '')
        gdbm = j.get('gdbm', '')
        khmc = j.get('khmc', '')
        xsht = j.get('xsht', '')
        ywry = j.get('ywry', '')
        spsq = j.get('spsq', '')
        hthm = j.get('hthm', '')
        val = j.get('val', '')
        sffl = j.get('sffl', '')
        sfhz = j.get('sfhz', '')
        gd_uid = j.get('gd_uid', '')
        delete_rids = j.get('delete_rids', [])
        path1 = ''
        code = 1
        cghth = ''
        msg = '操作成功'
        flag = 0
        m = s.query(cght).filter(cght.rid==rid).first()
        if not m:
            flag = 1
        else:
            if khyq!='' and khyq!=None and m.khyq != khyq:
                flag = 1
        # else:
        #     if uid != '' and uid != None :
        #         logger.error('--bbbaaa--')
        #         m.uid = uid
        #         s.add(m)


        if (hthm == '' or hthm == None) and (xsht != '' and xsht != None):
            hthm = xsht
            d = run_sql(f"select hthm from cght where (wxht='{xsht}') and (ifnull(hthm,'')<>'') order by sid desc limit 1")
            if len(d)>0:
                no = 0
                hm = d[0].get('hthm','')
                if len(hm) > len(xsht):
                    index = len(hm).rfind('-')
                    h = hm[index+1:]
                    no = re.findall(r'\d+', h)
                    if no:
                        no = int(no[0])
                if 'AMAZON' in khmc.upper() and sffl=='否':
                    cghth = xsht + '-' + str(int(no)+1) + 'N'
                else:
                    cghth = xsht + '-' + str(int(no)+1)
            else:
                if 'AMAZON' in khmc.upper() and sffl=='否':
                    cghth = xsht + '-1N'
                else:
                    cghth = xsht + '-1'

            if cgry != '' and cgry != None:
                row = {
                    "xxly": '采购合同',
                    "bjdh": '',
                    "wxht": '',
                    "cght": hthm,
                    "yhdh": '',
                    "xxnr": str(user.username) + '的采购通知:' + hthm + '采购人员' + str(cgry) + ',更换原因:' + val + '请查看,日期:' + time.strftime('%Y-%m-%d'),
                    "jsr": str(cgry),
                    "sys_path": "",
                    "spsq": cgry
                }
                res = module_xxck_new([row], user, s)
                if res.get('code',1) != 1:
                    return json_result(-1, res.get('msg'))
            

        if khmc!='' and khmc != None and 'AMAZON' in khmc.upper():
            org = get_user_path(ywry)
            path1 = org.get('path','')
        if val != '' and val != None:
            for r in [ywry, spsq]:
                row = {
                    "xxly": '采购合同',
                    "bjdh": '',
                    "wxht": '',
                    "cght": hthm,
                    "yhdh": '',
                    "xxnr": str(user.username) + '的更改采购通知:' + hthm + '采购人员' + str(cgry) + ',更换原因:' + val + '请查看,日期:' + time.strftime('%Y-%m-%d'),
                    "jsr": str(r),
                    "sys_path": "",
                    "spsq": r
                }
                res = module_xxck_new([row], user, s)
                if res.get('code',1) != 1:
                    return json_result(-1, res.get('msg'))
            
        if flag == 1 or sfhz == '通过':
            if sfhz == '通过':
                s.query(cggd).filter(cggd.hthm==hthm).update({'uid': gd_uid, 'gdry': gdry, 'gdbm': gdbm}, synchronize_session=False)
                s.query(storage).filter(storage.PurchaseOrderNo==hthm).update({'uid': gd_uid, 'gdry': gdry}, synchronize_session=False)
                s.query(inventorydetail).filter(inventorydetail.PurchaseOrderNo==hthm).update({'uid': gd_uid, 'gdry': gdry}, synchronize_session=False)
                s.query(chyjhsheet).filter(chyjhsheet.cght==hthm).update({'gdry': gdry}, synchronize_session=False)
                s.query(cymxsheet).filter(cymxsheet.cght==hthm).update({'gdry': gdry}, synchronize_session=False)
                s.query(dbbqd).filter(dbbqd.cght==hthm).update({'gdry': gdry}, synchronize_session=False)
                s.query(bgmxdsheet).filter(bgmxdsheet.cght==hthm).update({'gdry': gdry}, synchronize_session=False)
            for r in lines:
                wxwyzd = r.get('wxwyzd','')
                cgwyzd = r.get('wyzd','')
                cgjg = r.get('cgjg', 0)
                zje = r.get('zje', 0)
                cpbh = r.get('khhh','')
                dzsd = r.get('dzsd','')
                if cpbh == None or cpbh == '':
                    cpbh = r.get('zyhh','')
                if cpbh == None or cpbh == '':
                    cpbh = r.get('cpbh','')
                if flag == 1 :
                    s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).update({'yjcq': khyq}, synchronize_session=False)
                if sfhz == '通过':
                    l = s.query(cggdsheet).filter(cggdsheet.wyzd==cgwyzd,cggdsheet.cpbh==cpbh).all()
                    for c in l:
                        if (dzsd == None or dzsd == '') and cgjg != None and cgjg != 0 and spsq == user.username:
                            c.cgjg = cgjg
                            c.zje = zje
                            s.add(c)

        for r in delete_rids:
            d = s.query(cghtsheet.wyzd,cghtsheet.wxwyzd).filter(cghtsheet.pid==rid,cghtsheet.rid==r).first()
            if d:
                wxwyzd = d.wxwyzd
                s.query(cggdsheet).filter(and_(cggdsheet.hthm==cghth,cggdsheet.wyzd==cgwyzd)).delete(synchronize_session=False)
                s.query(cghtsheet).filter(and_(cghtsheet.pid==rid,cghtsheet.wyzd==cgwyzd)).delete(synchronize_session=False)
                cgze = 0
                c = s.query(func.ifnull(func.sum(func.ifnull(cghtsheet.zje, 0)), 0).label('total')).filter(cghtsheet.wxwyzd==wxwyzd).first()
                if c and c.total != None:
                    cgze = c.total
                c = s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).first()
                if c:
                    c.cgze = cgze
                    s.add(c)

        if sfhz == '通过' and gdry != '' and gdry != None:
            gd_rid = get_uuid()
            res = purchase_process_child_new(gd_rid, rid, user, s)
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
            res = purchase_process_fees_new(gd_rid, rid, user, s)
            logger.error('--fees--')
            logger.error(res)
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
            res = purchase_process_main_new(gd_rid, rid, user, s)
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
            
            for r in [ywry, gdry]:
                if r == '' or r == None or r == user.username:
                    continue
                row = {
                    "xxly": '采购合同',
                    "bjdh": '',
                    "wxht": '',
                    "cght": hthm,
                    "yhdh": '',
                    "xxnr": str(user.username) + '跟单人员:' + str(r) + '的跟单通知' + str(hthm) + '请查看,日期:' + time.strftime('%Y-%m-%d'),
                    "jsr": str(r),
                    "sys_path": "",
                    "spsq": r
                }
                res = module_xxck_new([row], user, s)
                if res.get('code',1) != 1:
                    return json_result(-1, res.get('msg'))
                
        s.commit()
        return json_result(code, msg, path1)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的保存之后操作
@any_route('/api/saier/purchase_order/save/after', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_save_after(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        code = 1
        msg = '操作成功'
        d = s.query(cghtsheet).filter(cghtsheet.pid==rid).all()
        for r in d:
            wxwyzd = r.wxwyzd
            if wxwyzd == None or wxwyzd == '':
                continue
            cgze = 0
            c = s.query(func.ifnull(func.sum(func.ifnull(cghtsheet.zje, 0)), 0).label('total')).filter(cghtsheet.wxwyzd==wxwyzd).first()
            if c and c.total != None:
                cgze = c.total
            c = s.query(wxhtsheet).filter(wxhtsheet.wxwyzd==wxwyzd).first()
            if c:
                c.cgze = cgze
                s.add(c)

        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的改单申请操作
@any_route('/api/saier/purchase_order/modify/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_modify_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        val = j.get('val', '')
        code = 1
        flag = j.get('flag', 0)
        msg = '操作成功'
        for rid in rids:
            d = s.query(cght).filter(cght.rid==rid).first()
            if not d:
                continue
            ywry = d.ywry
            cgry = d.cgry
            sffl = d.sffl
            gdry = d.gdry
            sfhz = d.sfhz
            hthm = d.hthm
            xdsq = d.xdsq
            x = '改单申请'
            if not (sfhz == '通过' and ((sffl == '是' and gdry == user.username) or (cgry == user.username) or (ywry == user.username))):
                continue
            if flag == 1:
                c = run_sql(f"select tsdl from spwt where (dlr='{xdsq}') limit 1")
                if len(c)==0:
                    continue
                if c[0].get('tsdl','') == '' or c[0].get('tsdl','') == None:
                    continue
                tsdl = c[0].get('tsdl','')
                path1 = c[0].get('path','')
                d.xdsq = tsdl
                d.xdsq1 = tsdl
                d.path1 = path1
                s.add(d)
                xdsq = tsdl
                x = '特殊改单审请'
            res = user_task_new('采购合同', rid, '合同号码', f"{user.username}采购合同{hthm}{x}",f"采购合同: {str(hthm)}要{x},原因:{val}", user, s, [xdsq], True)
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


# 采购合同的特殊审批调用前校验
@any_route('/api/saier/purchase_order/get/status', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_get_status(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        module = j.get('module', '')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t.wf_status,t.sfhz,t.cgry,t.ywry,t.gdry,t.xdsq).filter(t.rid==rid).first()
        if not d:
            return json_result(-1, '未找到采购合同记录')
        status = int(d.wf_status)
        sfhz = str(d.sfhz)
        cgry = str(d.cgry)
        if cgry != user.username and str(d.ywry) != user.username and str(d.gdry) != user.username and str(d.xdsq) != user.username:
            return json_result(-1, '该采购合同记录的采购人员、业务人员、跟单人员、下单申请都不是当前用户，不能进行此操作')
        if status == 2 or sfhz == '通过':
            return json_result(-1, '该采购合同记录已通过审批，不能进行此操作')

        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的特殊审批调用
@any_route('/api/saier/purchase_order/special/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_special_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        module = j.get('module', '')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.rid==rid).first()
        if not d:
            return json_result(-1, '未找到采购合同记录')
        status = int(d.wf_status)
        xdsq = str(d.xdsq)
        sfhz = str(d.sfhz)
        cgry = str(d.cgry)
        ywry = str(d.ywry)
        gdry = str(d.gdry)
        if (status != 2 or sfhz == '待审批') and xdsq!=None and xdsq!="" and (cgry == user.username or ywry == user.username or gdry == user.username or xdsq == user.username):
            # and tsdl<>'{xdsq}'
            c = run_sql(f"select tsdl from spwt where (dlr='{xdsq}') limit 1")
            if len(c)==0:
                return json_result(-1, '未找到下单申请人对应的审批流程')
            if c[0].get('tsdl','') == '' or c[0].get('tsdl','') == None:
                return json_result(-1, '下单申请人对应的审批流程未设置特殊审批流程')
            tsdl = c[0].get('tsdl','')
            d.xdsq = tsdl
            d.xdsq1 = tsdl
            
            if status == 1:
                d.wf_status = 0
            s.add(d)
            c = s.query(sys_workflow_instance).filter(sys_workflow_instance.record_id == rid,sys_workflow_instance.module == module,sys_workflow_instance.status==0).first()
            if c:
                c.wf_status = 2
                s.add(c)
                s.query(sys_workflow_task).filter(sys_workflow_task.instance==c.rid).update({sys_workflow_task.status: 3}, synchronize_session=False)
                s.query(sys_workflow_user_task).filter(sys_workflow_user_task.instance==c.rid).update({sys_workflow_user_task.status: 3}, synchronize_session=False)

            s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购合同的批量通过按钮
@any_route('/api/saier/purchase_order/batch/pass', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_order_batch_pass(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        module = j.get('module', '')
        code = 1
        msg = '操作成功'
        index = 0
        await messages.message(user.username,{'msg': '正在处理中。。。','kind':'0'},MSG_KIND_NORMAL)
        for rid in rids:
            index = index + 1
            d = s.query(cght.hthm,cght.gdry,cght.ywry,cght.cgry).filter(cght.rid==rid,cght.xdsq==user.username,or_(cght.wf_status==1,cght.sfhz=='待审批')).first()
            if not d:
                continue
            await messages.message(user.username,{'msg': f"正在处理采购合同:{str(d.hthm)}",'total':99,'progress': math.floor(index / len(rids) * 99),"kind":"0"},MSG_KIND_NORMAL)
            # d.tssp = "否"
            # d.sfhz = "通过"
            # d.tgsb = "是"
            # d.cgsh = "1"
            # d.wf_status = 2
            # s.add(d)
            user_list = []
            gdry = d.gdry
            if gdry != '' and gdry != None:
                user_list.append(gdry)
            user_list.append(d.ywry)
            user_list.append(d.cgry)
            for u in user_list:
                if u == '' or u == None or u == user.username:
                    continue
                row = {
                    "xxly": '采购合同',
                    "bjdh": '',
                    "wxht": '',
                    "cght": d.hthm,
                    "yhdh": '',
                    "xxnr": '采购合同:' + d.hthm + '审批通过,日期:' + time.strftime('%Y-%m-%d'),
                    "jsr": str(u),
                    "sys_path": "",
                    "spsq": u
                }
                res = module_xxck_new([row], user, s)
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
            for u in user_list:
                if u == d.cgry:
                    continue
                if u == '' or u == None or u == user.username:
                    continue
                row = {
                    "xxly": '采购合同',
                    "bjdh": '',
                    "wxht": '',
                    "cght": d.hthm,
                    "yhdh": '',
                    "xxnr": str(user.username) + '跟单人员:' + d.gdry + '的跟单通知:' + str(d.hthm) + ',日期:' + time.strftime('%Y-%m-%d'),
                    "jsr": str(u),
                    "sys_path": "",
                    "spsq": str(u)
                }
                res = module_xxck_new([row], user, s)
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))

            res = user_task_delete('采购合同', rid, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))

            res = await module_workflow_get_task(module, rid, user, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))

            data = res.get('data', {})
            instance = data.get('instance_rid',None)
            task_id = data.get('task_rid',None)
            status = 1

            memo = ''
            if is_none(instance,task_id,status):
                s.rollback()
                return json_result(ERR_PARAM_NOT_ENOUGH)

            wf = WorkFlowInstance(user)
            if not wf.load_instance(instance):
                s.rollback()
                return json_result(-1,'无法找到工作流实例')

            if wf.process_task(task_id,status,memo) != True:
                s.rollback()
                return json_result(-1,msg=wf.stop_msg)
            await wf.send_notify_to_user()

        await messages.message(user.username,{'msg': f"处理完成",'total':100,'progress': 100,"kind":"1"},MSG_KIND_NORMAL)
        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()