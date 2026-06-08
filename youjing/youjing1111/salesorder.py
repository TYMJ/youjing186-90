from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new,module_workflow_get_task,user_task_delete

#外销合同保存前
@any_route('/api/saier/salesorder/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        ssgs = j.get('ssgs','')
        mdka = j.get('mdka','')
        order_id = j.get('order_id','')
        ywry = j.get('ywry','')
        spjg = j.get('spjg','')
        spsq = j.get('spsq','')
        kh_id = j.get('kh_id','')
        htwy = j.get('htwy','')
        # rid = j.get('rid','')
        BZ = ""
        jxsb1 = 0
        jxsb2 = 0
        cdsb = 0
        gsmc = ''
        path = ''
        ywry1 = ywry
        path1 = ''
        kfxg = 0
        i1 = 1
        if spjg!='待审批' and spsq==user.username:
            d = run_sql(f"select order_id,number from wxht where (order_id='{str(order_id)}') and (ifnull(spsq,'')='') and (spsq1='') and (ywry<>'{user.username}') ")
            if len(d)>0:
                return json_result(-1, '不好意思,业务撤单，不能保存')
            
        d = run_sql(f"select ywry from wxht where (order_id='{str(order_id)}') limit 1")
        if len(d)>0:
            ywry1 = d[0].get('ywry','')

        if ywry!='' and ywry!=None:
            org = get_user_path(ywry)
            path = org.get('path','')

        d = run_sql(f"select bz from cyzglsheet where (xm='{user.username}') and (zm='外销合同修改')")
        if len(d)>0:
            kfxg = 1

        if order_id!='' and order_id!=None:
            d = run_sql(f"select rid from cyzglsheet where ('{str(order_id)}' like concat(xm, '%')) and (zm='特殊合同简写')")
            if len(d)>0:
                jxsb1 = 1
            if '-DMD-' in order_id.upper() or '-N2-' in order_id.upper():
                jxsb2 = 1
            d = run_sql(f"select bz from cyzglsheet where (xm='{str(khmc)}') and (zm='BP外销合同后缀')")
            if len(d)>0:
                BZ = d[0].get('bz','')
            if 'CSD-' in order_id.upper():
                gsmc = '宁波可思达进出口有限公司'
            else:
                d = run_sql(f"select bz from cyzglsheet where (xm='{str(khmc)}' or xm='{ssgs}') and (zm='我方公司不锁定')")
                if len(d)>0:
                    c = run_sql(f"select Vendorgs from kh where (company_name='{str(khmc)}') and (ifnull(Vendorgs,'')<>'')")
                    if len(c)>0:
                        gsmc = c[0].get('Vendorgs','')
        d = s.query(spwt.path1).filter(spwt.dlr==spsq).first()
        if d:
            path1 = d.path1
        # path2 = path.replace('\\','_')
        # d = run_sql(f"select rid from spwt where (dlr='{spsq}') and ('{path2}' like concat('%',concat('%', replace(wxdl,'\\\\','_'), '%')) limit 1")
        # if len(d)==0:
        #     i1 = 0

        logger.error(user.username)
        if (user.username == '陈妍科' and spsq == '陈妍科') or (user.username == '侯柳红' and spsq == '侯柳红'):
            i1 = 1
        if BZ=="":
            d = run_sql(f"select bz from cyzglsheet where (xm='{str(mdka)}') and (zm='BP港口外销合同后缀')")
            if len(d)>0:
                BZ = d[0].get('bz','')

        d = s.query(kh).filter(kh.kh_id==kh_id,kh.hzdj=="潜在客人").first()
        if d:
            d.hzdj = "一级"
            d.khlx = "合作客户"
            d.qzzghrq = None
            s.add(d)
        d = s.query(htsq).filter(htsq.wyzd==htwy).first()
        if d:
            d.xq='是'
            d.xdry=ywry1
            s.add(d)

        if user.username != ywry and user.username!=spsq and spsq!='':
            row = {
                "xxly": '外销合同',
                "bjdh": '',
                "wxht": order_id,
                "cght": '',
                "yhdh": '',
                "xxnr": '外销合同:' + str(order_id) + '已由' + str(user.username) + '修改,时间' + time.strftime('%Y-%m-%d %H:%M:%S'),
                "jsr": str(ywry),
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('code'))

        data = {
            "bz": BZ,
            "jxsb1": jxsb1,
            'jxsb2': jxsb2,
            'wfgs': gsmc,
            'path': path,
            'cdsb': cdsb,
            'ywry1': ywry1,
            'kfxg': kfxg,
            'path1': path1,
            'i1': i1,
            'hr': time.strftime('%Y-%m-%d %H:%M:%S')
        }   

        s.commit()
        return json_result(1, '查询成功', data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
#外销合同的合同号码变更查询
@any_route('/api/saier/salesorder/hthm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_hthm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        order_id = j.get('order_id','')
        hthm2 = j.get('hthm2','')
        htwy = j.get('htwy','')
        b = 0
        f = 0
        wyzd = ''
        khmc = ''
        mdka = ''
        wfgs_n = ''
        jxsb1 = 0
        jxsb2 = 0
        if 'CSD-' not in order_id:
            d = run_sql(f"select order_id from wxht where ((order_id='{str(order_id)}') or ((order_id like '%" + hthm2 + "%') and (order_id like '%-%'))) and (rid<>'"+ str(rid) +"') and (order_id not like '%退回合同%') ")
            if len(d)>0:
                b= 1
        if '退回合同' not in order_id: 
            # c = s.query(wxht.htwy).filter(wxht.rid==rid).first()
            # if c and c.htwy!=None and c.htwy!='' and c.htwy != htwy:
            #     logger.error('-aaa-')
            l = s.query(wxht.rid).filter(wxht.htwy==htwy, wxht.rid!=rid).first()
            if not l:
                c = s.query(htsq).filter(htsq.wyzd==htwy).first()
                if c:
                    c.xq='否'
                    s.add(c)
                    s.commit()
            d = run_sql(f"select rid,wyzd,khmc,mdka,wfgs from htsq where (hthm='{str(order_id)}') or (hthm='{str(hthm2)}')")
            if len(d)>0:
                wyzd = d[0].get('wyzd','')
                khmc = d[0].get('khmc','')
                mdka = d[0].get('mdka','')
                wfgs_n = d[0].get('wfgs','')
                if wyzd!=None and wyzd!='':
                    c = s.query(htsq).filter(htsq.wyzd==wyzd).first()
                    if c:
                        c.xq = '是'
                        s.add(c)
                        s.commit()
            else:
                f = 1

        d = run_sql(f"select bz from cyzglsheet where ('{str(order_id)}' like concat('%', xm, '%')) and (zm='外销合同识别公司')")
        if len(d)>0:
            wfgs_n = d[0].get('bz','')

        d = run_sql(f"select rid from cyzglsheet where ('{str(order_id)}' like concat(xm, '%')) and (zm='特殊合同简写')")
        if len(d)>0:
            jxsb1 = 1
        if '-DMD-' in order_id.upper() or '-N2-' in order_id.upper():
            jxsb2 = 1

        data = {
            "b": b,
            "f": f,
            "jxsb1": jxsb1,
            'jxsb2': jxsb2,
            'wfgs': wfgs_n,
            "wyzd": wyzd,
            "khmc": khmc,
            "mdka": mdka
        }
        logger.error(data)   
        return json_result(1, '查询成功', data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的客户合同号变更查询
@any_route('/api/saier/salesorder/khht/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_khht_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        khht = j.get('khht','')
        khmc = j.get('khmc','')
        where_str = ''
        if khmc!='' and khmc !=None and 'BEST PRICE' in khmc:
            where_str = " and customer like '%BEST PRICE%' "
        code = 1
        msg = '查询成功'
        d = run_sql(f"select dforder_id from wxht where dforder_id='{str(khht)}' and rid<>'{rid}' {where_str} limit 1")
        if len(d)>0:
            code = -1
            msg = '客户合同号已存在，请重新输入！'
            
        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的货币代码变更查询
@any_route('/api/saier/salesorder/hbdm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_hbdm_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        xsbz = j.get('xsbz','')
        hl = j.get('hl',0)
        rmbkh = j.get('rmbkh', '否')
        zhmjhl = 1
        code = 1
        msg = '查询成功'
        if rmbkh != '是' and xsbz!='' and xsbz!='USD$' and xsbz!='USD' and hl>0:
            d = run_sql(f"select * from hbdm where hbdm='USD$' limit 1")
            if len(d)>0:
                zhmjhl = d[0].get('hhl',1)
            
        return json_result(code, msg, zhmjhl)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户名称变更查询
@any_route('/api/saier/salesorder/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_khmc_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        data = {'zdjs':'否','khxx':{}}
        code = 1
        msg = '查询成功'
        d = run_sql(f"select bz from cyzglsheet where xm='{str(khmc)}' and zm='自动计算含佣价' limit 1")
        if len(d)>0:
            data['zdjs'] = d[0].get('bz','')

        d = run_sql(f"select bxbl,bxjc,RMBkh,jgtk,yjds,zdml,fkry,xybx,mdka,country,ssdq,ssgs,zffs,kh_id,mt,dmt,myds,ayds,wfgs,lCompany,lBank,lAccount,TBank,TAccount,lBankAddress,lBank1,TBank1 from kh where company_name='{str(khmc)}' limit 1")
        if len(d)>0:
            data['khxx'] = d[0]
        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的产品资料采购人员查询
@any_route('/api/saier/salesorder/items/purchase/get', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_items_purchase_get(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sccj = j.get('sccj','')
        zyhh = j.get('zyhh','')
        cgry = ''
        code = 1
        msg = '查询成功'
        d = run_sql(f"select cgry from zscpsheet5 where cpbh='{str(zyhh)}' and sccj='{str(sccj)}' limit 1")
        if len(d)>0:
            cgry = d[0].get('cgry','')
        if cgry=='':
            d = run_sql(f"select cgry from zscp where cpbh='{str(zyhh)}' limit 1")
            if len(d)>0:
                cgry = d[0].get('cgry','')
        if cgry=='':
            d = run_sql(f"select cgry from cjcp where cpbh='{str(zyhh)}' limit 1")
            if len(d)>0:
                cgry = d[0].get('cgry','')

        return json_result(code, msg, cgry)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的业务人员变更查询
@any_route('/api/saier/salesorder/ywry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_ywry_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        ywry = j.get('ywry','')
        wxsh = ''
        htms = '否'
        org = get_user_path(ywry)
        path = org.get('path','')
        path1 = ''
        logger.error(config.__dict__)
        d = run_sql(f"select bz from cyzglsheet where (xm='{str(ywry)}') and (zm='外销合同特殊查看权限') limit 1")
        if len(d)>0:
            path1 = d[0].get('bz','')
        if path!='':
            path3 = path.replace('\\','_')
            d = run_sql(f"select rid from spwt where ('{path3}' like concat('%', replace(wxdl,'\\\\','_'), '%')) limit 1")
            if len(d)>0:
                wxsh = '123'
        d = run_sql(f"select rid from spwt where (dlr='{ywry}') and (wxms='是') limit 1")
        if len(d)>0:
            htms = '是'
            
        return json_result(1, '查询成功', {'path':path,'path1':path1,'wxsh':wxsh,'htms':htms})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的RMB客户变更查询
@any_route('/api/saier/salesorder/rmbkh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_rmbkh_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        lines = j.get('lines',[])
        flag = 0
        nxkh = '否'
        code = 1
        msg = '查询成功'
        RMBkh = '否'
        if khmc !='' and khmc!=None:
            c = s.query(kh.nxkh,kh.RMBkh).filter(kh.company_name==khmc).first()
            if c and c.nxkh:
                nxkh = c.nxkh

        d = run_sql(f"select bz from cyzglsheet where xm='{str(khmc)}' and zm='按佣金单价计算佣金' limit 1")
        if len(d)>0:
            flag = 1
        hl = {'RMB':1}
        for r in lines:
            cgbz = str(r.get('cghbdm'))
            if cgbz=='' or cgbz==None:
                hl['RMB'] = 1
                continue
            if cgbz in hl:
                continue
            if 'RMB' in cgbz:
                hl['RMB'] = 1
                continue
            d = run_sql(f"select hhl from hbdm where hbdm='{cgbz}' limit 1")
            if len(d)>0:
                hl[cgbz] = d[0].get('hhl',1)

        return json_result(code, msg, {'flag':flag,'hl':hl,'nxkh':nxkh, 'RMBkh':RMBkh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 合同申请更新函数
async def order_apply_update(hthm, htwy, data, user, s):
    try:
        d = run_sql(f"select rid from cght where (wxht='{hthm}') and (xjht<>'作废')")
        if len(d)>0:
            return {'code':-1, 'msg':'不好意思,此合同号还有末作废采购合同存在，不能取消'}
        d = s.query(htsq).filter(htsq.wyzd==htwy).first()
        if d:
            for k,v in data.items():
                if k in SYS_FIELDS or k == 'hthm':
                    continue
                if hasattr(d, k):
                    setattr(d, k, v)
            d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            d.modi_uid = user.rid
            s.add(d)


        return {'code':1, 'msg':'更新成功'}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}


#外销合同的审批结果变更查询
@any_route('/api/saier/salesorder/spjg/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_spjg_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hthm = j.get('hthm','')
        htyw = j.get('htwy','')
        data = {'qrrq':None,
            'htzt':'取消订单',
            'ywz':None,
            'htje':0,
            'jdjermb':0
        }
        res = await order_apply_update(hthm, htyw, data, user, s)
        code = res.get('code',-1)
        msg = res.get('msg','')
        if code !=1:
            s.rollback()
        else:
            s.commit()

        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        

#外销合同的编辑界面加载后
@any_route('/api/saier/salesorder/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ywry = j.get('ywry','')
        xshl = j.get('hl',0)
        hthm = j.get('hthm','')
        spsq = j.get('spsq','')
        spsq1 = j.get('spsq1','')
        hl = 0
        htzd = 0
        code = 1
        msg = '查询成功'
        org = get_user_path(ywry)
        path = org.get('path','')
        path1 = 0
        path2 = 0
        if xshl==0:
            d = run_sql(f"select hhl from hbdm where hbdm='USD$' limit 1")
            if len(d)>0:
                hl = d[0].get('hhl',1)
        d = run_sql(f"select rid from cght where (wxht='{hthm}') and (xjht<>'作废')")
        if len(d)>0:
            htzd = 1
        path3 = path.replace('\\','_')
        ywbm = ''
        u = s.query(ywrybiao.bm).filter(ywrybiao.yhm==user.username).first()
        if u and u.bm:
            ywbm = u.bm
        d = run_sql(f"select rid from spwt where ('{path3}' like concat('%', replace(wxdl,'\\\\','_'), '%')) and ifnull(wxdl,'')<>'' and ifnull(wxdl,'')<>'无' limit 1")
        logger.error('')
        if len(d)>0:
            path1 = 1
            if ywry!="" and ywry!=None :
                if (ywry!=user.username):
                    if spsq!="" and spsq!=None and spsq1!="" and spsq1!=None:
                        if spsq==ywry:
                            c = run_sql(f"select bz from spwt where (dlr='{str(user.username)}') and ('{path3}' like concat('%', replace(wxdl,'\\\\','_'), '%')) limit 1")
                            if len(c)>0:
                                path2 = 1
                        else:
                            c = run_sql(f"select bz from cyzglsheet where (xm='{str(user.username)}') and zm='总经理' limit 1")
                            if len(c)>0:
                                path2 = 1

        return json_result(code, msg, {'htzd':htzd,'hl':hl,'path1':path1, 'path2':path2, 'ywbm':ywbm, 'path':path})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的船期更新按钮
@any_route('/api/saier/salesorder/update/chrq', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_update_chrq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        order_id = j.get('hthm')
        yjcq = j.get('yjcq',None)
        lines = j.get('lines',[])
        cghts = []
        d = s.query(cgjh).filter(cgjh.order_id==order_id).all()
        for r in d:
            r.jhrq = yjcq
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        for l in lines:
            wxwyzd = l.get('wxwyzd','')
            c = s.query(cgjhsheet).filter(cgjhsheet.wxwyzd==wxwyzd).all()
            for r in c:
                r.krjq = yjcq
                r.yjcq = yjcq
                r.modi_uid = user.rid
                r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(r)
            c = s.query(cghtsheet).filter(cghtsheet.wxwyzd==wxwyzd).all()
            for r in c:
                r.yjcq = yjcq
                r.chrq = yjcq
                r.modi_uid = user.rid
                r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(r)
                if r.pid not in cghts:
                    cghts.append(r.pid)
            c = s.query(cggdsheet).filter(cggdsheet.wxwyzd==wxwyzd).all()
            for r in c:
                r.yjcq = yjcq
                r.modi_uid = user.rid
                r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(r)

        for r in cghts:
            c = s.query(cght).filter(cght.rid==r).first()
            if c:
                c.yjcq = yjcq
                c.modi_uid = user.rid
                c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(c)

        s.commit()
        return json_result(1, '更新成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的客户回签按钮
@any_route('/api/saier/salesorder/update/jdrq', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_update_jdrq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        jdrq = j.get('jdrq','')
        if jdrq=='' or jdrq==None:
            jdrq = time.strftime('%Y-%m-%d')
        hqrq = time.strftime('%Y-%m-%d')
        rids = j.get('rids',[])
        bmbgrq = ''
        c = run_sql(f"select bm from ywrybiao where (yhm='{user.username}') and (bmbgrq<='{time.strftime('%Y-%m-%d')}') and (ifnull(bmbgrq,'')<>'')")
        if len(c)>0:
            bmbgrq = c[0].get('bm','')
        bmbgrq1 = {}
        flag = 0
        for rid in rids:
            d = s.query(wxht).filter(wxht.rid==rid,
                wxht.ywry==user.username,
                or_(wxht.wf_status==2,wxht.bjql=='通过')).first()
            if d:
                flag = 1
                htwy = str(d.htwy)
                jdrq1 = str(d.jdrq1)
                # bmbgrq = str(d.wxbm)
                kh_id = str(d.kh_id)
                hthm = str(d.order_id)
                yjcq = str(d.yjcq)
                htje = float(d.htje) if d.htje!=None else 0
                n = jdrq[:4]
                y = jdrq[5:7]
                ny = jdrq[:4] + '-' + jdrq[5:7]
                dycjdrq = d.dycjdrq
                if (dycjdrq==None or dycjdrq == '' or dycjdrq == '1999-01-01'):
                    dycjdrq = jdrq
                yjdq = str(d.yjdq)
                jdjermb = float(d.khrmbhj) if d.khrmbhj!=None else 0
                if bmbgrq != '' and bmbgrq != None:
                    d.wxbm =  bmbgrq
                d.khhq =  '是'
                d.yjdq =  jdrq
                d.dycjdrq =  dycjdrq
                if (jdrq1!=None and jdrq1 != '' and yjdq != jdrq and jdrq1 != '1999-01-01'):
                    d.jdrq =  jdrq
                    d.jdrq1 =  jdrq1 + '' + jdrq + ',' + str(htje)
                else:
                    d.jdrq =  jdrq
                    d.jdrq1 =  jdrq + ',' + str(htje)
                d.qsn =  n
                d.qsy =  y
                d.qsny =  ny
                d.jdny =  ny
                d.mtime =  time.strftime('%Y-%m-%d %H:%M:%S')
                d.modi_uid =  user.rid
                s.add(d)
                c = s.query(kh).filter(kh.kh_id==kh_id).first()
                if c:
                    c.khlx = '合作客户'
                    s.add(c)
                c = s.query(wxhtsheet).filter(wxhtsheet.pid==d.rid).all()
                for r in c:
                    if str(r.bjyw) not in bmbgrq1:
                        b = run_sql(f"select bm from ywrybiao where (yhm='{r.bjyw}') and (bmbgrq<='{time.strftime('%Y-%m-%d')}') and (ifnull(bmbgrq,'')<>'')")
                        if len(b)>0:
                            bmbgrq1[str(r.bjyw)] = b[0].get('bm','')
                    r.wxbm1 = bmbgrq1.get(str(r.bjyw))
                    r.modi_uid = user.rid
                    r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    r.jdrq = jdrq
                    r.qsn =  n
                    r.qsy =  y
                    r.qsny =  ny
                    if (r.hqrq==None or r.hqrq==''):
                        r.hqrq = hqrq
                    s.add(r)

                data = {
                    'xq':'是',
                    'xdry':'',
                    'zsht':hthm,
                    'qrrq':None,
                    'ywz':jdrq,
                    'wcrq':None,
                    'htje':htje,
                    'jdjermb':jdjermb,
                    'jhcy':yjcq,
                    'htzt':'接单'
                }
                res = await order_apply_update(hthm, htwy, data, user, s)
                code = res.get('code',-1)
                msg = res.get('msg','')
                if code !=1:
                    s.rollback()
                    return json_result(code, msg)
        if flag == 0:
            return json_result(-1, '没有符合条件的订单可以回签,可能是审批还未通过或业务人员不匹配')
        code = 1
        msg = '更新成功'
        s.commit()
        
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的更改合同号按钮
@any_route('/api/saier/salesorder/update/hthm', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_update_hthm(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        xhth = j.get('xhth')
        yhth = j.get('yhth')
        khht = j.get('khht')
        hth1 = str(yhth) + '-'
        c = s.query(fkspsheet3).filter(fkspsheet3.hthm.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.wxht = xhth
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        
        c = s.query(yfhk).filter(yfhk.cght.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.cght.replace(yhth,xhth)
            r.wxht = xhth
            r.cght = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(gcdjsheet).filter(gcdjsheet.cght.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.cght.replace(yhth,xhth)
            r.cght = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(cgjh).filter(cgjh.order_id==yhth).all()
        for r in c:
            hth = r.order_id1.replace(yhth,xhth)
            r.order_id = xhth
            r.dforder_id = khht
            r.order_id1 = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(cgjhsheet).filter(cgjhsheet.order_id==yhth).all()
        for r in c:
            r.order_id = xhth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(cght).filter(cght.wxht==yhth).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.wxht = xhth
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(cghtsheet).filter(cghtsheet.wxht==yhth).all()
        for r in c:
            r.wxht = xhth
            r.khht = khht
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)


        c = s.query(cggd).filter(cggd.wxht==yhth).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.wxht = xhth
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(cggdsheet).filter(cggdsheet.hthm.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(yanhuobaog).filter(yanhuobaog.wxht.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.wxht = xhth
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(yanhuobaogcp).filter(yanhuobaogcp.hthm.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.hthm.replace(yhth,xhth)
            r.hthm = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        c = s.query(chyjhsheet).filter(chyjhsheet.cght.like(f"%{hth1}%")).all()
        for r in c:
            hth = r.cght.replace(yhth,xhth)
            r.wxht = xhth
            r.cght = hth
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)

        s.commit()
        
        return json_result(1, '更新成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的退回合同号按钮
@any_route('/api/saier/salesorder/return/hthm', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_return_hthm(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hthm = j.get('hthm')        
        htwy = j.get('htwy','')
        data = {
            'xq':'否',
            'xdry':'',
            'zsht':'',
            'qrrq':None,
            'ywz':None,
            'wcrq':None,
            'htje':0,
            'jdjermb':0,
            'jhcy':'',
            'htzt':'申请'
        }
        res = await order_apply_update(hthm, htwy, data, user, s)
        code = res.get('code',-1)
        msg = res.get('msg','')
        if code !=1:
            s.rollback()
        else:
            s.commit()
        
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的退回合同号按钮
@any_route('/api/saier/salesorder/modify/batch', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_modify_batch(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids')
        val = j.get('val','')
        flag = j.get('flag',0)
        filters = []
        if flag == 0:
            filters.append(wxht.ywry==user.username)
        for rid in rids:
            d = s.query(wxht).filter(wxht.rid==rid,*filters).first()
            if not d:
                continue
            order_id = str(d.order_id)
            # wyzd = str(d.wyzd)
            # bjql = str(d.bjql)
            # wyzd = str(d.wyzd)
            spsq = str(d.spsq)
            # htwy = str(d.htwy)
            sjzg = ''
            path3 = ''
            if order_id=='' or order_id==None or spsq=='' or spsq==None:
                continue
            if flag ==1:
                c = s.query(spwt.tsdl,spwt.path3).filter(spwt.dlr==spsq).first()
                if c:
                    sjzg = str(c.tsdl)
                    path3 = str(c.path3)
            c = s.query(cgjh.rid,cgjh.ywry,cgjh.wcqk).filter(cgjh.order_id==order_id).first()
            if c:
                ywry = str(c.ywry)
                wcqk = str(c.wcqk)
                pid = str(c.rid)
                if flag == 1:
                    m = s.query(cgjhsheet.rid).filter(cgjhsheet.pid==pid).first()
                    if m:
                        return json_result(-1, '不好意思,采购计划里还有未采购产品不能审请改单!')
                if flag == 0 and wcqk=='未完成' and ywry!="" and ywry!=None:
                    m = s.query(cgjhsheet).filter(cgjhsheet.pid==pid).all()
                    for r in m:
                        s.delete(r)
                    m = s.query(cgjhsheet.rid).filter(cgjhsheet.pid==pid).first()
                    if m:
                        return json_result(-1, '不好意思,采购计划里还有未采购产品不能审请改单!')
                    row = {
                        "xxly": '采购计划',
                        "bjdh": '',
                        "wxht": order_id,
                        "cght": '',
                        "yhdh": '',
                        "xxnr":  user.username + '的退回外销合同通知:' + str(order_id) + '你还有末下单产品，请等外销合同通过后，再做采购计划，时间:' + time.strftime('%Y-%m-%d %H:%M:%S'),
                        "jsr": str(ywry),
                        "sys_path": "",
                        "spsq": ywry
                    }
                    res = module_xxck_new([row],user,s)
                    if res.get('code')!=1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('code'))
                    
            if (flag==0 and str(d.bjql)=='通过' and str(d.ywry)==user.username) or flag==1:
                if sjzg != '' and sjzg != None:
                    spsq = sjzg
                res = user_task_new('外销合同', rid, '合同号码', '[合同号码]申请改单','【审批】' + '外销合同:' + str(order_id) + '要重新审批,原因:' + str(val), user, s, [spsq])
                logger.error(res)
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('msg'))
                
            if flag ==1:
                d.spsq = sjzg
                d.spsq1 = sjzg
                d.path1 = path3
                d.modi_uid = user.rid
                d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(d)

        s.commit()
        
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()




#外销合同的退回合同号按钮
@any_route('/api/saier/salesorder/return/batch', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_return_batch(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids')
        # kind = j.get('kind',[])
        # filters = []
        # if kind!='所有改单':
        #     filters.append(wxht.htzt=='审批通过')
        # else:
        #     filters.append(wxht.rid==rids[0])
        for rid in rids:
            d = s.query(wxht).filter(wxht.rid==rid,wxht.spsq==user.username,wxht.bjql=='通过').first()
            if not d:
                continue
            data = {
                'xq':'否',
                'xdry':'',
                'zsht':'',
                'qrrq':None,
                'htzt':'取消订单',
                'ywz':None,
                'wcrq':None,
                'htje':0,
                'jdjermb':0,
                'jhcy':None,
                'htzt':'申请'
            }
            res = await order_apply_update(d.order_id, d.htwy, data, user, s)
            code = res.get('code',-1)
            msg = res.get('msg','')
            if code !=1:
                s.rollback()
                return json_result(code, msg)
            d.bjql = '待审批'
            d.tgsb="否"
            d.fxsb="否"
            d.jdrq="1999-01-01"
            d.qsn=""
            d.qsy=""
            d.qsny=""
            d.spsq=""
            d.bjql1="待审批"
            d.spsq1=""
            d.wxsh="123"
            d.fkqr=""
            d.modi_uid = user.rid
            d.wf_status = 3
            d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(d)
            s.query(wxhtsheet).filter(wxhtsheet.pid==d.rid).update(
                {"jdrq":'1999-01-01',"qsn":'',"qsy":'',"qsny":''},
                synchronize_session=False
            )
            row = {
                "xxly": '外销合同',
                "bjdh": '',
                "wxht": d.order_id,
                "cght": '',
                "yhdh": '',
                "xxnr":  '外销合同:' + str(d.order_id) + '被退回,时间:' + time.strftime('%Y-%m-%d'),
                "jsr": str(d.ywry),
                "spsq": str(d.ywry)
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            
            res = user_task_delete('外销合同', rid, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            res = user_task_new('外销合同', rid, '合同号码', '外销合同:[合同号码]被退回','外销合同:' + str(d.order_id) + '被退回,日期:' + time.strftime('%Y-%m-%d'), user, s, [str(d.ywry)])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            
        s.commit()
        
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的退回合同号按钮
@any_route('/api/saier/salesorder/purchase/plan', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_purchase_plan(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids')
        kind = j.get('kind',[])
        group = {}
        org = get_user_path(user.username)
        path = org.get('path','')
        user_json = {}
        new_rids = []
        for rid in rids:
            d = s.query(wxhtsheet.bjhh,wxhtsheet.bjyw,wxhtsheet.bjpath,wxht.kh_id,wxhtsheet.pid,wxhtsheet.htsl,wxhtsheet.wxwyzd
                ).filter(wxhtsheet.pid==str(rid),func.ifnull(wxht.jdrq,"")>"2020-01-01",func.ifnull(wxht.jdrq,"")!=""
                ).outerjoin(wxht,wxht.rid==wxhtsheet.pid).all()
            for r in d:
                group_str = ''
                bjhh = str(r.bjhh)
                bjyw = str(r.bjyw)
                kh_id = str(r.kh_id)
                path1 = ''
                if kind=='按产品生成':
                    group_str = bjhh + '-' + bjyw + '-' + kh_id
                else:
                    if r.bjpath and r.bjpath!='' and r.bjpath!=None:
                        path1 = r.bjpath
                    else:
                        if r.bjyw!='' and r.bjyw!=None:
                            if str(r.bjyw) not in user_json:
                                path1 = get_user_path(str(r.bjyw))
                                user_json[str(r.bjyw)] = path1
                            else:
                                path1 = user_json.get(str(r.bjyw))

                    if path1!="" and path in path1:
                        bjyw = user.username
                    else:
                        bjyw = str(r.bjyw)

                    if bjyw!='' and bjyw!=user.username:
                        group_str = str(r.bjhh)+ '-' + bjyw + '-' + kh_id
                if group_str=='':
                    continue
                if rid not in new_rids:
                    new_rids.append(rid)
                if group_str not in group:
                    group[group_str] = {'bjhh':str(r.bjhh), 'bjyw':bjyw, 'kh_id':kh_id}
        
        logger.error(group)
        if kind!='按产品生成':
            group['所有'] = {'bjhh':'所有', 'bjyw':user.username}
        if len(group)==0:
            return json_result(-1, '没有找到符合生成采购计划要求的信息')
        for k,v in group.items():
            ywryb = ''
            bm = ''
            ywryb = v['bjyw']
            c = s.query(ywrybiao.wfgs,ywrybiao.bm,ywrybiao.zt,ywrybiao.bmjl).filter(ywrybiao.yhm==v['bjyw']).first()
            if c:
                bm = str(c.bm)
                if str(c.zt)=='离职':
                    ywryb = str(c.bmjl)
            logger.error('----group-------')
            org = get_user_path(ywryb)
            uid = org.get('rid','')
            path3 = org.get('path','')
            path = path3.replace('\\','_')
            order_id1 = v['bjhh'][:238] + ';' + time.strftime('%Y%m%d%H%M%S')
            if k == '所有':
                order_id1 = v['bjhh'][:238] + '等;' + time.strftime('%Y%m%d%H%M%S')
            logger.error(new_rids)
            # 检验是否有未完成的采购计划
            flag = 0
            for l in new_rids:
                d = s.query(wxht
                        # wxht.kh_id,wxht.customer,wxht.dateis,wxht.wfgs,wxht.mt,wxht.dmt,wxht.jdrq,wxht.yjcq,wxht.khpd,wxht.mldx,wxht.fyl,wxht.huilv,wxht.yjbl,wxht.ayjds,wxht.order_id
                    ).filter(wxht.rid==l).first()
                if not d:
                    return json_result(-1, '没有找到对应的外销合同记录')
                index = 0
                d = alchemy_object_to_dict(d)

                rid = get_uuid()
                if k == '所有':
                    b = run_sql(f"select * from wxhtsheet where (pid='{l}') and (replace(bjpath,'\\','_') like '%%{path}%%') and kh_id='{v['kh_id']}'")
                else:  
                    b = run_sql(f"select * from wxhtsheet where (pid='{l}') and bjhh='{v['bjhh']}' and (ifnull(bjyw,'')='{v['bjyw']}') and kh_id='{v['kh_id']}'")
                for  c in b:
                    yxdsl = 0
                    
                    x = s.query(func.ifnull(func.sum(func.ifnull(cgjhsheet.yxdsl,0)),0).label('yxdsl')).filter(cgjhsheet.wxwyzd==c.get('wxwyzd','')).first()
                    if x and float(x.yxdsl)>0:
                        yxdsl = float(x.yxdsl)
                    x = s.query(func.ifnull(func.sum(func.ifnull(cghtsheet.cgsl,0)),0).label('cgsl')).filter(cghtsheet.wxwyzd==c.get('wxwyzd',''),cghtsheet.xjht!="作废").first()
                    if x and float(x.cgsl)>0: 
                        yxdsl = yxdsl + float(x.cgsl)
                    if float(c.get('htsl',0))<=yxdsl:
                        continue
                    flag = 1
                    index = index + 1
                    if index == 1:
                        m = cgjh()
                        for r,l in d.items():
                            if r in SYS_FIELDS:
                                continue
                            if hasattr(m, r):
                                setattr(m, r, l)
                        m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                        m.uid = uid
                        m.rid = rid
                        m.order_id1 = order_id1
                        m.order_id = v['bjhh'][:238]
                        m.dforder_id = ''
                        m.zdrq =  time.strftime('%Y-%m-%d')
                        m.zdry = user.username
                        m.wyzd = rid
                        m.yw = path3
                        m.wxbm = bm
                        m.jhqr = '待审批'
                        m.jhrq = d.get('yjcq')
                        m.ywry = v['bjyw']
                        m.nbht = ''
                        m.ywht = ''
                        m.stht = ''
                        # m.cpjh = '是1'
                        m.cpjh = '是'
                        if k == '所有':
                            m.htlx = '工厂'
                        else:
                            m.htlx = '产品'
                        s.add(m)

                    n = cgjhsheet()
                    for r,l in c.items():
                        if r in SYS_FIELDS or r in ['Field','Field1','Field2','Field3','Field4','Field5']:
                            continue
                        if hasattr(n, r):
                            setattr(n, r, l)
                    u = s.query(zscp.gdry,zscp.cgry,zscp.bzyq,zscp.zdml,zscp.wbcz).filter(zscp.cpbh==c.get('bjhh')).first()
                    if u:
                        n.cgry = str(u.cgry)
                        n.gdry = str(u.gdry)
                        # n.bzyq = str(u.bzyq)
                        n.zdml = str(u.zdml)
                        n.sjry = str(u.wbcz)
                    n.wxwyzd = c.get('wxwyzd','')
                    n.pid = rid
                    n.rid = get_uuid()
                    n.wyzd = n.rid
                    n.jhwy = m.rid
                    n.krjq = d.get('yjcq')
                    n.yxdsl = c.get('htsl',0) - yxdsl
                    n.yxdsl1 = c.get('htsl',0) - yxdsl
                    n.xdxs = math.ceil((c.get('htsl',0) - yxdsl)/float(c.get('wxrl'))) if float(c.get('wxrl'))>0 else 0
                    n.xdxs12 = math.ceil((c.get('htsl',0) - yxdsl)/float(c.get('wxrl'))) if float(c.get('wxrl'))>0 else 0
                    n.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                    n.uid = uid
                    n.sfdd = '否'
                    n.cgzgqr = '是'
                    n.cghl = 1
                    n.ggxm = '是'
                    n.order_id = d.get('order_id')
                    n.wxwyzd1 = c.get('wxwyzd','')
                    n.ywry = c.get('bjyw','')
                    s.add(n)

                    y = s.query(wxhtsheet).filter(wxhtsheet.rid==c.get('rid')).first()
                    y.sl5 = c.get('htsl',0)
                    y.sl4 = math.ceil(float(c.get('htsl',0))/float(c.get('wxrl'))) if float(c.get('wxrl'))>0 else 0
                    y.modi_uid = user.rid
                    y.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    s.add(y)
                    res = user_task_new('采购计划', rid, '合同号码', '[合同号码]已生成','采购计划:' + str(order_id1[:60]) + '已生成,请安排.日期:' + time.strftime('%Y-%m-%d'), user, s, [ywryb])
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(res.get('code'), res.get('msg'))
                    for zz1 in range(1, 3):
                        jsr = ''
                        xxnr = ''
                        if zz1 == 1 :
                            jsr = ywryb
                            xxnr = '采购计划:' + str(order_id1) + '已生成,请安排.日期' + time.strftime('%Y-%m-%d %H:%M:%S')
                        if zz1 == 2:
                            jsr = user.username
                            xxnr = '采购计划:' + str(order_id1) + '已生成,业务员' + str(ywryb) + '.日期' + time.strftime('%Y-%m-%d')
                        row = {
                            "xxly": '采购计划',
                            "bjdh": '',
                            "wxht": order_id1,
                            "cght": '',
                            "yhdh": '',
                            "xxnr":  xxnr,
                            "jsr": str(jsr),
                            "sys_path": "",
                            "spsq": jsr
                        }
                        res = module_xxck_new([row],user,s)
                        if res.get('code')!=1:
                            s.rollback()
                            return json_result(res.get('code'), res.get('code'))
        if flag == 0 and len(group)>0:
            return json_result(1, '未找到符合生成采购计划要求的信息，或都已生成采购计划了')
        s.commit()
    
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的产品资料客人货号变更查询
@any_route('/api/saier/salesorder/item/khhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_khhh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        krhh = j.get('krhh','')
        krID = j.get('krID','')
        cpbh = ''
        d = run_sql(f"select cpbh from zscpsheet7 where (krhh='{krhh}') and (krID='{krID}') limit 1")
        if len(d)>0:
            cpbh = d[0].get('cpbh','')
            return json_result(1, '取数成功', cpbh)
        d = run_sql(f"select cpbh from zscp where (krhh='{krhh}') limit 1")
        if len(d)>0:
            cpbh = d[0].get('cpbh','')
            return json_result(1, '取数成功', cpbh)
        d = run_sql(f"select cpbh from cjcp where (krhh='{krhh}') limit 1")
        if len(d)>0:
            cpbh = d[0].get('cpbh','')
            return json_result(1, '取数成功', cpbh)        

        return json_result(1, '取数成功', cpbh)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的获取客户名称的佣金代码
@any_route('/api/saier/salesorder/khmc/get', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_khmc_get(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc','')
        sb = ''
        d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='按原价计算佣金') limit 1")
        if len(d)>0:
            sb = '1'    

        return json_result(1, '取数成功', sb)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的获取采购币种的汇率
@any_route('/api/saier/salesorder/cgbz/get', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_cgbz_get(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cgbz = j.get('cgbz','')
        hl = ''
        d = run_sql(f"select hhl from hbdm where (hbdm='{cgbz}') limit 1")
        if len(d)>0:
            hl = d[0].get('hhl',1)    

        return json_result(1, '取数成功', hl)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料更新货号
@any_route('/api/saier/salesorder/update/cpbh', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_update_cpbh(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khhh = j.get('khhh','')
        zyhh = j.get('zyhh','')
        wyzd = j.get('wyzd','')
        d = s.query(cgjhsheet).filter(cgjhsheet.wxwyzd==wyzd).all() 
        for r in d:
            r.bjhh = zyhh
            r.hhbz = zyhh
            r.khhh = khhh
            r.bjhh1 = zyhh
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        d = s.query(cghtsheet).filter(cghtsheet.wxwyzd==wyzd).all() 
        for r in d:
            r.bjhh = zyhh
            r.hhbz = zyhh
            r.khhh = khhh
            r.bjhh1 = zyhh
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        d = s.query(cggdsheet).filter(cggdsheet.wxwyzd==wyzd).all() 
        for r in d:
            r.zycpbh = zyhh
            if khhh!='':
                r.cpbh = khhh
            else:
                r.cpbh = zyhh
            r.bjhh1 = zyhh
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        d = s.query(yanhuobaogcp).filter(yanhuobaogcp.wxwyzd==wyzd).all() 
        for r in d:
            if khhh!='':
                r.cpbh = khhh
            else:
                r.cpbh = zyhh
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        d = s.query(chyjhsheet).filter(chyjhsheet.wxwyzd==wyzd).all() 
        for r in d:
            r.bjhh = zyhh
            r.khhh = khhh
            r.bjhh1 = zyhh
            if khhh!='':
                r.cpbh = khhh
            else:
                r.cpbh = zyhh
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        s.commit()
        return json_result(1, '更新成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料更新货号
@any_route('/api/saier/salesorder/item/ywry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_ywry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ywry = j.get('ywry','')
        wyzd = j.get('wyzd','')
        org = get_user_path(ywry)
        path = org.get('path','')
        uid = org.get('rid','')
        if uid=='':
            return json_result(-1, '不好意思,无此业务人员')
        rid_list = []
        d = s.query(cgjhsheet).filter(cgjhsheet.wxwyzd==wyzd,).all() 
        for r in d:
            r.ywry = ywry
            r.bjyw = ywry
            r.bjpath = path
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
        d = s.query(cghtsheet).filter(cghtsheet.wxwyzd==wyzd,).all() 
        for r in d:
            r.ywpath = path
            r.cgbh = ywry
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
            if r.pid in rid_list:
                continue
            rid_list.append(r.pid)
            c = s.query(cght).filter(cght.rid==r.pid).first()
            if c: 
                c.ywry = ywry
                c.ypath = path
                c.modi_uid = user.rid
                c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(c)
                hthm = str(c.hthm)
                m = s.query(cggd).filter(cggd.hthm==hthm).all() 
                for l in m:
                    l.ywry = ywry
                    l.modi_uid = user.rid
                    l.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    l.add(r)

        s.commit()
        return json_result(1, '更新成功', path)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料删除校验
@any_route('/api/saier/salesorder/item/delete/check', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_delete_check(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        wyzd = j.get('wyzd','')
        d = run_sql(f"select rid from cghtsheet where (wxwyzd='{wyzd}') limit 1")
        if len(d)>0:
            return json_result(-1, '不好意思,此货号还有采购合同存在，不能删除')
        d = run_sql(f"select rid from cgjhsheet where (wxwyzd='{wyzd}') limit 1")
        if len(d)>0:
            return json_result(-1, '不好意思,此货号还有采购计划存在，不能删除')
                
        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料刷新单证锁定
@any_route('/api/saier/salesorder/item/update/dzsd', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_update_dzsd(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        wyzd = j.get('wyzd','')
        dzsd = 0
        d = run_sql(f"select rid from cymxsheet where (sfgd='解锁') and (wxwyzd='{wyzd}') and ((fpsb1='是') or (fksb='是')) and (ifnull(sjcy,'')='') limit 1")
        if len(d)>0:
            dzsd = 1
        else:
            d = run_sql(f"select rid from cymxsheet where (wxwyzd='{wyzd}') limit 1")
            if len(d)==0:
                dzsd = 1
                
        return json_result(1, '校验成功', dzsd)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

    
#外销合同的产品资料刷新单证锁定
@any_route('/api/saier/salesorder/item/zyhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_zyhh_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        zyhh = j.get('zyhh','')
        krID = j.get('krID','')
        flag = 0
        sccj = ''
        kr = {}
        cp = {}
        cs = {}
        d = run_sql(f"select * from zscp where (krhh='{zyhh}' and ifnull(krhh,'')<>'') or (cpbh='{zyhh}') limit 1")
        if len(d)>0:
            flag = 2
        else:
            d = run_sql(f"select * from cjcp where (krhh='{zyhh}' and ifnull(krhh,'')<>'') or (cpbh='{zyhh}') limit 1")
            if len(d)>0:
                flag = 1
        if len(d)>0:
            sccj = d[0].get('sccj','')
            cp = d[0]
        c = run_sql(f"select cs_id,phone,ywbf,jsfs from zycs where company_name='{sccj}' limit 1")
        if len(c)>0:
            cs = c[0]
        k = run_sql(f"select krhh,krtm,mjfob,Twxdj,rmbdj,pkRMB,djpm,djpmy,djpmw,krcode,krsl,wypp,ggwy from zscpsheet7 where (cpbh='{zyhh}') and (krID='{krID}') limit 1")
        if len(k)>0:
            kr = k[0]
        return json_result(1, '取数成功', {'cp': cp, 'cs': cs, 'kr': kr, 'flag': flag})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料刷新单证锁定
@any_route('/api/saier/salesorder/item/hlb/set', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_hlb_set(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        cgbz = j.get('cgbz','')
        khmc = j.get('khmc','')
        cghl = 1
        nxkh = ''
        if cgbz != '' and cgbz != None and  'RNB' in cgbz:
            d = run_sql(f"select hhl from hbdm where hbdm='{cgbz}' limit 1")
            if len(d)>0:
                cghl = d[0].get('hhl',1)
        d = run_sql(f"select nxkh from kh where company_name='{khmc}' limit 1")
        if len(d)>0:
            nxkh = d[0].get('nxkh','')

        return json_result(1, '取数成功', {'cghl': cghl, 'nxkh': nxkh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同的产品资料合同数量修改
@any_route('/api/saier/salesorder/item/htsl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_item_htsl_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        wyzd = j.get('wyzd','')
        cgsl = 0
        cysl = 0
        yxds = 0
        yjhs = 0
        lines = []
        if wyzd == '' or wyzd == None:
            return json_result(1, {'cgsl': 0, 'cysl': 0, 'yxds': 0, 'yjhs': 0, 'lines': lines})
        d = run_sql(f"select sum(ifnull(cgsl,0)) cgsl from cghtsheet where wxwyzd='{wyzd}' and xjht<>'作废' and ifnull(dzsd,'')='' limit 1")
        if len(d)>0:
            cgsl = d[0].get('cgsl',0)
        d = run_sql(f"select sum(ifnull(chsl,0)) chsl from cymxsheet where (wxwyzd='{wyzd}' and ifnull(cywyzd,'')<>'') and (zs='是') and fksb<>'是' limit 1")
        if len(d)>0:
            cysl = d[0].get('chsl',0)
        lines = run_sql(f"select rid,bjhh,csmc,wxrl,cgsl,mz,jz,tj,hthm,wyzd,wxwyzd,cgjg,pid,gdry,wxgsbz,pxbj from cghtsheet where (wxwyzd='{wyzd}') and (xjht<>'作废')")

        d = run_sql(f"select sum(ifnull(yxdsl,0)) as yxdsl from cgjhsheet where (wxwyzd='{wyzd}') limit 1")
        if len(d)>0:
            yxds = d[0].get('yxdsl',0)
        d = run_sql(f"select sum(ifnull(yxdsl,0)) as yjhsl from cgjhsheet3 where (wxwyzd='{wyzd}') limit 1")
        if len(d)>0:
            yjhs = d[0].get('yjhsl',0)

        return json_result(1, '取数成功', {'cgsl': cgsl, 'cysl': cysl, 'yxds': yxds, 'yjhs': yjhs, 'lines': lines})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#外销合同的采购产品合同数量修改
@any_route('/api/saier/salesorder/cgcp/htsl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_cgcp_htsl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        l = j.get('line',{})
        wxht = j.get('wxht','')

        wxwyzd = l.get('wxwyzd','')
        cgwyzd = l.get('cgwyzd','')
        zyhh = l.get('zyhh','')
        hthm = l.get('hthm','')
        gdry = l.get('gdry','')
        htsl = l.get('htsl',0)
        gdry = l.get('gdry','')
        father = l.get('father','')
        xs = l.get('cgxs',0)
        wxzl = l.get('wxrl',0)
        cgcprid = l.get('cgcprid','')

        m = cghtsheet1()
        m.cphh =  zyhh
        m.rid = get_uuid()
        m.uid =  str(user.rid)
        m.ctime =  time.strftime('%Y-%m-%d %H:%M:%S')
        m.xgrq =  time.strftime('%Y-%m-%d %H:%M:%S')
        m.yygc =  str(wxht) + str(user.username)
        m.xdgc =  ''
        m.ysdj =  0
        m.xddj =  0
        m.ggry =  gdry
        m.yjsfs =  ''
        m.xjsfs =  ''
        m.ysl =  htsl
        m.xsl =  xs * wxzl
        s.add(m)
        wxgsbz = l.get('wxgsbz','')
        if wxgsbz=='' or wxgsbz==None:
            wxgsbz = str(wxht) + str(user.username) + str(xs) + str(wxzl) + time.strftime('%Y-%m-%d %H:%M:%S')
        else:
            wxgsbz = wxgsbz + '\n' + str(wxht) + str(user.username) + str(xs) + str(wxzl) + time.strftime('%Y-%m-%d %H:%M:%S')
        m = s.query(cghtsheet).filter(cghtsheet.wxwyzd==wxwyzd,cghtsheet.rid==cgcprid,cghtsheet.hthm==hthm,cghtsheet.xjht!='作废').first()
        if m:
            m.cgxs = xs
            m.cgsl = htsl
            m.zmz = math.floor(l.get('zmz',0) * 100) / 100
            m.zjz = math.floor(l.get('zjz',0) * 100) / 100
            m.ztj = math.floor(l.get('ztj',0) * 100) / 100
            m.zje = math.floor(l.get('zje',0) * 100) / 100
            m.wxrl = l.get('wxrl',0)
            m.wxgsbz = wxgsbz
            if m.cghl==0 or m.cghl==None:
                m.cghl = 1
            m.cgzje1 = float(m.zje) * float(m.cghl)
            if m.fljg!=0 and m.fljg!=None:
                m.flzj = float(m.fljg) * float(m.cgsl)
            m.modi_uid = user.rid
            m.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(m)
            d = s.query(func.ifnull(func.sum(func.ifnull(cghtsheet.cgzje1,0)),0).label('cgzje11'), 
                func.ifnull(func.sum(cghtsheet.zje),0).label('zje1'), 
                func.ifnull(func.sum(cghtsheet.cgsl),0).label('cgsl1'), 
                func.ifnull(func.sum(cghtsheet.cgxs),0).label('cgxs1'), 
                func.ifnull(func.sum(cghtsheet.zmz),0).label('zmz1'), 
                func.ifnull(func.sum(cghtsheet.zjz),0).label('zjz1'), 
                func.ifnull(func.sum(cghtsheet.ztj),0).label('ztj1')
            ).filter(cghtsheet.hthm==hthm,cghtsheet.xjht!="作废",cghtsheet.pid==father).first()
            if d:
                c = s.query(cght).filter(cght.rid==father,cght.hthm==hthm).first()
                if c: 
                    c.htje = math.floor(float(d.zje1) * 100) / 100
                    c.htzsl = float(d.cgsl1)
                    c.htzxs = float(d.cgxs1)
                    c.cgzje1 = float(d.cgzje11)
                    c.htzmz = math.floor(float(d.zmz1) * 100) / 100
                    c.htzjz = math.floor(float(d.zjz1) * 100) / 100
                    c.htztj = math.floor(float(d.ztj1) * 1000) / 1000
                    c.modi_uid = user.rid
                    c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    s.add(c)
                c = s.query(cggd).filter(cggd.hthm==hthm).first()
                if c:
                    c.htje = math.floor(float(d.zje1) * 100) / 100
                    c.modi_uid = user.rid
                    c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    s.add(c)
                c = s.query(cggdsheet).filter(cggdsheet.hthm==hthm, cggdsheet.wxwyzd==wxwyzd, cggdsheet.wyzd==cgwyzd).first()
                if c:
                    c.htzxs = xs
                    c.htzsl = htsl
                    c.htzmz = math.floor(l.get('zmz',0) * 100) / 100
                    c.htzjz = math.floor(l.get('zjz',0) * 100) / 100
                    c.htztj = math.floor(l.get('ztj',0) * 1000) / 1000
                    c.zje = math.floor(l.get('zje',0) * 100) / 100
                    c.zxl = wxzl
                    c.modi_uid = user.rid
                    c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                    s.add(c)
            
            row = {
                "xxly": '外销合同',
                "bjdh": '',
                "wxht": hthm,
                "cght": '',
                "yhdh": '',
                "xxnr": user.username + '的数量更新通知:合同号：' + str(hthm) + '产品名为:' + str(zyhh) + '箱数' + str(xs) + '数量' + str(htsl) + '日期:' + time.strftime('%Y-%m-%d %H:%M:%S'),
                "jsr": str(gdry),
                "sys_path": "",
                "spsq": gdry
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('code'))
            
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同审批通过接口（批量）
@any_route('/api/saier/salesorder/confirm/batch', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_confirm_batch(request):
    user = request.current_user
    j = await request.json()
    s = Session()
    try:
        module = j.get('module','外销合同')
        rids = j.get('rids',[])        
        for rid in rids:
            d = s.query(wxht).filter(wxht.rid==str(rid),wxht.bjql=='待审批',wxht.spsq==user.username).first()
            if d:    
                res = await module_workflow_get_task(module, rid, user, s)
                if res.get('code') != 1:
                    return json_result(res.get('code'), res.get('msg'))
                
                instance = res.get('data').get('instance_rid',None)
                task_id = res.get('data').get('task_rid',None)
                logger.error(f"instance:{instance}, task_id:{task_id}")
                status = 1
                memo = ''
                if is_none(instance,task_id,status):
                    return json_result(ERR_PARAM_NOT_ENOUGH)
                wf = WorkFlowInstance(user)
                if not wf.load_instance(instance):
                    return json_result(-1,'无法找到工作流实例')
                if wf.process_task(task_id,status,memo) != True:
                    return json_result(-1,msg=wf.stop_msg)
                await wf.send_notify_to_user()

        return json_result(1, '操作成功')
    except:
        # s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#外销合同特殊审批接口（批量）
@any_route('/api/saier/salesorder/special/approval', methods=['POST', 'GET'])
@require_token
async def view_saier_salesorder_special_approval(request):
    user = request.current_user
    j = await request.json()
    s = Session()
    try:
        module = j.get('module','外销合同')
        rid = j.get('rid','')    
        val = j.get('val','')
        d = s.query(wxht).filter(wxht.rid==str(rid),wxht.bjql=='待审批',or_(wxht.spsq==user.username,wxht.ywry==user.username)).first()
        if not d:
            return json_result(-1, '没有找到待审批或权限内的记录')
        if d.wf_status == 2:
            return json_result(-1, '已经审批通过的记录不能进行特殊审批')
        if d.spsq == '' or d.spsq == None:
            return json_result(-1, '审批申请为空，无法进行特殊审批')
        c = s.query(spwt.tsdl).filter(spwt.dlr==d.spsq).first()
        if not c:
            return json_result(-1, '没有找到审批申请人的特殊代理人')
        logger.error(f"审批申请人:{d.spsq}, 特殊代理人:{c.tsdl}")
        if c.tsdl!=None and c.tsdl !='' and c.tsdl != d.spsq:
            d.spsq = c.tsdl
            d.spsq1 = c.tsdl
            s.add(d)

        res = user_task_delete(module, rid, s)
        if res.get('code') != 1:
            return json_result(res.get('code'), res.get('msg'))

        s.commit()

        if is_none(module,rid):
            return json_result(ERR_PARAM_NOT_ENOUGH)

        if module_record_has_processing_workflow(module, rid):
            return json_result(-1,'已启动工作流')
        
        wf_define = get_module_workflow_define(module)
        wf = WorkFlowInstance(user)
        wf.memo = '特殊审批,原因:' + val
        wf._flow_memo = '特殊审批,原因:' + val
        wf.load_from_define(data = wf_define.data)
        if not wf.new_instance(rid):
            return json_result(-1,msg=wf.stop_msg)
        await wf.send_notify_to_user()
        SystemLog.insert(SL_WORKFLOW_START,user,module=module,pid=wf.rid,title=wf._title)
    
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()