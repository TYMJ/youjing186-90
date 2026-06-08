from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path, user_task_new, module_xxck_new

# 客户报价的客户名称修改校验
@any_route('/api/saier/quotation/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_khmc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc', '')
        rid = j.get('rid', '')
        data = {'bxbl':0.78,'bxjc':110,'RMBkh':'否'}
        d = s.query(kh.bxbl,kh.bxjc,kh.RMBkh,kh.yjds,kh.myds,kh.ayds,kh.mbmll).filter(kh.company_name == khmc).first()
        if d:
            if float(d.bxbl)>0:
                data['bxbl'] = float(d.bxbl)
            if float(d.bxjc)>0:
                data['bxjc'] = float(d.bxjc)
            data['RMBkh'] = str(d.RMBkh)

        return json_result(1, '校验成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的报价单号修改校验
@any_route('/api/saier/quotation/bjdh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_bjdh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bj_id = j.get('bj_id', '')
        rid = j.get('rid', '')
        d = s.query(bj.rid).filter(bj.bj_id == bj_id, bj.rid!=rid).first()
        if d:
            return json_result(-1, '报价单号已存在，请修改后重新输入')

        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的客人货号修改校验
@any_route('/api/saier/quotation/krhh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_krhh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khhh = j.get('khhh', '')
        khbh = j.get('khbh', '')
        cpbh = ''
        if khhh != '' and khhh!= None and khbh != '' and khbh != None:
            d = s.query(zscpsheet7.cpbh).filter(zscpsheet7.krhh == khhh, zscpsheet7.krID!=khbh).first()
            if d:
                cpbh = str(d.cpbh)
            if cpbh == '':
                d = s.query(zscp.cpbh).filter(zscp.krhh == khhh).first()
                if d:
                    cpbh = str(d.cpbh)
            if cpbh == '':
                d = s.query(cjcp.cpbh).filter(cjcp.krhh == khhh).first()
                if d:
                    cpbh = str(d.cpbh)

        return json_result(1, '校验成功', cpbh)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的报关中文品名修改校验
@any_route('/api/saier/quotation/bgpm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_bgpm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {}
        bgpm = j.get('bgpm', '') 
        d = run_sql(f"select cpfl,yjfl,ejfl,sjfl,flmc,cplb,yjlb,ejlb,sjlb from zscp where (bgpm='{bgpm}') and (ifnull(yjfl,'')<>'') order by sid desc limit 1")
        if len(d)>0:
            data = d[0]

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的报关中文品名修改校验
@any_route('/api/saier/quotation/get/nxkh', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_get_nxkh(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = ''
        khmc = j.get('khmc', '') 
        d = run_sql(f"select nxkh from kh where company_name='{khmc}' limit 1")
        if len(d)>0:
            data = d[0].get('nxkh','')

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的货号备注修改校验
@any_route('/api/saier/quotation/hhbz/change', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_hhbz_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpbh = j.get('cpbh', '')
        bmsb = j.get('bmsb', '')
        # org = get_user_path(user.username)
        # path = org.get('path','')
        khbh = j.get('khbh', '')
        data = {'cp':{}, 'cs':{}, 'kh':{}, 'i2':0}
        i2 = 0
        # uid = ''
        # table = ''
        # d = s.query(cjcp.uid).filter(cjcp.cpbh==cpbh).first()
        # if not d:
        #     d = s.query(zscp.uid).filter(zscp.cpbh==cpbh).first()
        #     if d:
        #         uid = str(d.uid)
        #         table = 'zscp'
        # else:
        #     uid = str(d.uid)
        #     table = 'cjcp'
        #     i2 = 1

        # if uid != '':
        #     user_org = get_user_path(uid)
        #     path1 = user_org.get('path','')
        #     where_str = f"cpbh='{cpbh}'"
        #     if bmsb != '1':
        #         where_str += f" and ((uid='{user.rid}') or (({path1} like '%{path}%') and (path1 <> '{path}')))"
            # d = run_sql(f"select * from  {table} where {where_str} limit 1")

        where_str = f" cpbh='{cpbh}' "
        if bmsb != '1':
            where_str += f" and permission('专业产品')"
        d = run_sql(f"select * from cjcp where {where_str} limit 1",user=user)
        if len(d) == 0:
            d = run_sql(f"select * from zscp where {where_str} limit 1",user=user)
            if len(d) >0:
                i2 = 2
        else:
            i2 = 1
        data['i2'] = i2

        if len(d) >0:
            data['cp'] = d[0]
            c = run_sql(f"select krhh,krtm,mjfob,Twxdj,rmbdj,pkRMB from zscpsheet7 where (cpbh='{cpbh}') and (krID='{khbh}') order by sid desc limit 1")
            if len(c)>0:
                data['kh'] = c[0]
            sccj = str(d[0].get('sccj',''))
            if sccj!='' and sccj!=None:
                d = s.query(ozycs.cs_id,ozycs.phone,ozycs.ywbf,ozycs.jsfs).filter(ozycs.company_name==sccj).first()
                if d:
                    data['cs']['cs_id'] = str(d.cs_id)
                    data['cs']['phone'] = str(d.phone)
                    data['cs']['ywbf'] = str(d.ywbf)
                    data['cs']['jsfs'] = str(d.jsfs)

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的保存前校验
@any_route('/api/saier/quotation/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bj_id = j.get('bj_id', '')
        bjry = j.get('bjry', '')
        xj_dh = j.get('xj_dh', '')
        rid = j.get('rid', '')
        spjg = j.get('spjg', '待审批')
        # bjjg = j.get('bjjg', '待审批')
        spsq = j.get('spsq', '')
        # bjsp = j.get('bjsp', '')
        kh_id = j.get('kh_id', '')
        khmc = j.get('khmc', '')
        xjbj = j.get('xjbj', '')
        ywry = j.get('ywry', '')
        if ywry == None or ywry == '':
            ywry = user.username
        yw = j.get('yw')
        # bjly = j.get('bjly','')
        msbz = '否'
        flag = False
        tjsb = 0
        cdsb = 0
        ywry1 = ''
        spsq1 = ''  
        # bjry1 = ''
        # bjsp1 = ''
        spsq2 = ''
        zjl = 0
        wxl = 0
        kfxg = 0
        
        d = s.query(bj.rid,bj.xj_dh,bj.bj_id,func.ifnull(bj.bjql,'').label('spjg'),
            # func.ifnull(bj.bjjg,'').label('bjjg'),
            func.ifnull(bj.spsq1,'').label('spsq1'),
            bj.uid,bj.bjry,bj.ywry,bj.spsq,bj.bjsp).filter(bj.rid==rid).first()
        if d :
            ywry1 = str(d.ywry)
            spsq1 = str(d.spsq)
            # bjry1 = str(d.bjry)
            # bjsp1 = str(d.bjsp)
            # if bj_id != None and bj_id != '' and (str(d.spjg) != '' or str(d.bjjg) != ''):
            #     tjsb = 1
            # 注销了采购报价的判断
            # if (spjg != '待审批' or bjjg != '待审批') and (str(d.spsq) == '' and str(d.bjsp) == '' and str(d.spsq1) == '' and d.uid!=user.rid):
            if spjg != '待审批' and str(d.spsq) == '' and str(d.spsq1) == '' and d.uid!=user.rid:
                cdsb = 1
            # 更新原有询价单号的报价单号关联关系
            # if d.xj_dh != xj_dh:
            #     bj_no = ''
            #     c = s.query(bj.bj_id).filter(bj.bjry==user.username, bj.xj_dh==str(d.xj_dh), bj.rid!=rid).first()
            #     if c and c.bj_id:
            #         bj_no = c.bj_id
                # c = s.query(khxjsheet1).filter(khxjsheet1.bjry==user.username, khxjsheet1.xj_dh==str(d.xj_dh), khxjsheet1.bjdh==bj_id).all()
                # for r in c:
                #     r.bjdh = bj_no
                #     flag = True
                #     s.add(r)
                
        # # 更新当前询价单号的报价单号关联关系
        # if bj_id != None and bj_id != '' and xj_dh!='':
        #     c = s.query(khxjsheet1).filter(khxjsheet1.bjry==user.username, khxjsheet1.xj_dh==xj_dh).all()
        #     for r in c:
        #         r.bjdh = bj_id
        #         flag = True
        #         s.add(r)

        if cdsb==0:
            zjl = 0
            wxl = 0
            kfxg = 0
            
            l = run_sql(f"select position,memo from sys_user where username='{user.username}'")
            if len(l)>0:
                if l[0].get('position','')!=None and l[0].get('position','')!='':
                    pos = str(l[0].get('memo',''))
                else:
                    pos = str(l[0].get('position'))
                if '总经理' in pos:
                    zjl = 1
                if '外销' in pos:
                    wxl = 1

            # 注销了采购报价的判断
            # if ((tjsb  == 1) and (spsq != '') or (bjsp != '')) and (spsq != user.username) and (bjsp != user.username):
            if (tjsb  == 1) and (spsq != '') and (spsq != user.username):
                return json_result(-1, '不好意思,已提交不能更改')
            if ((wxl  == 1) and (khmc == '' or kh_id == '')) and (xjbj == '新'):
                return json_result(-1, '不好意思,请先填写客户名称和客户编号')
            if bj_id == None or bj_id == '':
                d = s.query(bj.sid).order_by(bj.sid.desc()).limit(1).first()
                if d:
                    sid = int(d.sid)+1
                else:
                    sid = 1
                bj_id = kh_id + time.strftime("%y%m%d")+str(sid).zfill(3)

            if yw !='':
                u = run_sql(f"select rid from sys_user where username='{user.username}' and path like '%{yw}%' limit 1")
                if len(u)==0:
                    kfxg = 1
            if spsq == user.username:
                kfxg = 1

            d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm==user.username, cyzglsheet.zm=="报价修改").first()
            if d:
                kfxg = 1
            org = get_user_path(bjry)
            path = org.get('path','')
            if spsq1 == user.username:
                kfxg=1

            # 考虑到采购报价取消，这段代码注销
            # if (bjry1 != '') and (bjry1 != '20120803') and (bjry1 != '卢洪云1'):
            #     if (bjry1 == user.username) or (bjsp1 == user.username) or (kfxg == 1) or (zjl == 1) or (bjly == '手机报价'):
            #         if (bjsp1 != '') and (bjsp1 != user.username) and (zjl != 1) and (kfxg != 1):
            #             return json_result(-1, '不好意思,此记录已提交,您没有权限更改此资料,请与采购审批人员联系,谢谢')
            #     else:
            #         return json_result(-1, '不好意思您没有权限更改此资料,请与采购人员联系谢谢')

            if ywry1 != '':
                if (ywry1 ==user.username) or (spsq1 ==user.username) or (kfxg == 1):
                    if (spsq1 != '') and (spsq1 != user.username) and (kfxg != 1):
                        return json_result(-1, '不好意思,此记录已提交,您没有权限更改此资料,请与业务审批人员联系,谢谢')
                    else:
                        spsq2 = spsq1
                else:
                    return json_result(-1, '不好意思您没有权限更改此资料,请与业务人员联系谢谢')
        
        d = run_sql(f"select *  from tsqxsheet where (qxlx='客户报价') and (xm='{ywry}') and (qxzl='免审')")
        if len(d)>0:
            msbz = '是'

        if flag:
            s.commit()
        return json_result(1, '操作成功', {'tjsb':tjsb, 'cdsb':cdsb, 'zjl':zjl, 'wxl':wxl, 'bj_id':bj_id, 'spsq':spsq2, 'msbz':msbz})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

    

# 客户报价的加载后校验
@any_route('/api/saier/quotation/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bj_id = j.get('bj_id', '')
        bjry = j.get('bjry', '')
        wfgs_n = j.get('wfgs_n', '')

        mldx = 0
        fyl = 0
        cg =0
        wx = 0
        zjl = 0
        wxgd = 0
        bm = ''
        bjsp_list = []
        spsq_list = []
        d = s.query(ywrybiao.bm,ywrybiao.wfgs).filter(ywrybiao.yhm==user.username).first()
        if d:
            bm = str(d.bm)
        if wfgs_n == '':
            d = s.query(wfgs).filter(wfgs.wfgs==wfgs_n).first()
            if d:
                wfgs_n = str(d.wfgs)
                mldx = float(d.mldx)
                fyl = float(d.fyl)
        org = get_user_path(user.username)
        path = org.get('path','')
        pos = org.get('position','')
        username = org.get('username','')
        nblh = 0
        flag1 = 0
        flag2 = 0
        msbz = 0
        if '总经理' in pos:
            zjl = 1
        if '外销' in pos or '跟单' in pos:
            wx = 1
            wxgd = 1
        if '采购' in pos:
            cg = 1
        path1 = path.replace('\\','_') + '_'
        d = run_sql(f"select bz from cyzglsheet where (xm='{user.username}') and (zm='报价提交') group by bz")
        # bjsp_list = [r.get('bz','') for r in d]
        spsq_list = [r.get('bz','') for r in d]
        # d = run_sql(f"SELECT dlr FROM spwt WHERE ('{path1}' LIKE CONCAT('%', replace(cgbjdl,'\\\\','_'), '%')) AND (spwt.dlr <> '{user.username}') ORDER BY yhms DESC")
        # _list = [r.get('bz','') for r in d if r.get('bz','') not in bjsp_list and r.get('bz','')!='' and r.get('bz','')!=None]
        # bjsp_list.extend(_list)
        logger.error(path1)
        d = run_sql(f"SELECT dlr FROM spwt WHERE ('{path1}' LIKE CONCAT('%', replace(bjdl,'\\\\','_'), '%')) AND (spwt.dlr <> '{user.username}') ORDER BY yhms DESC")
        _list = [r.get('dlr','') for r in d if r.get('dlr','') not in spsq_list and r.get('dlr','')!='' and r.get('dlr','')!=None]
        spsq_list.extend(_list)
        d = run_sql(f"SELECT dlr FROM spwt WHERE ('{path1}' LIKE CONCAT('%', replace(cgbjdl,'\\\\','_'), '%')) AND (spwt.dlr = 'zjlblh') ORDER BY yhms DESC")
        if len(d)>0:
            nblh = 1
        # d = run_sql(f"SELECT dlr FROM spwt WHERE ('{path1}' LIKE CONCAT('%', replace(cgbjdl,'\\\\','_'), '%')) ORDER BY yhms DESC")
        # if len(d)>0:
        #     flag1 = 1
        d = run_sql(f"select *  from tsqxsheet where (qxlx='客户报价') and (xm='{user.username}') and (qxzl='免审')")
        if len(d)>0:
            msbz = 1
        d = run_sql(f"select *  from spwt where ('{path1}' LIKE CONCAT('%', replace(bjdl,'\\\\','_'), '%')) ORDER BY yhms DESC")
        if len(d)>0:
            flag2 = 1

        return json_result(1, '操作成功', {'wfgs':wfgs_n, 'bm':bm, 'mldx':mldx, 'fyl':fyl, 'cg':cg, 'wx':wx, 'zjl':zjl, 'wxgd':wxgd, 'path':path, 'position':pos, 'bjsp_list':bjsp_list, 'spsq_list':spsq_list, 'username':username,'nblh':nblh, 'flag1':flag1, 'flag2':flag2, 'msbz':msbz})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户报价的专业产品更新
@any_route('/api/saier/quotation/items/new', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_items_new(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wxsb = 0
        wfgs_n = j.get('wfgs_n', '')
        shsc = j.get('shsc', '')
        bjry = j.get('bjry', '')
        lines = j.get('lines', [])
        org = get_user_path(user.username)
        # path = org.get('path','')
        pos = org.get('position','')
        if '外销' in pos or '总经理' in pos:
            wxsb = 1
        # d = run_sql(f"select ifnull(bz,'') as bz from cyzglsheet where (xm='{user.username}') and (zm='报价产品查看权限') group by bz")
        # if len(d)>0:
        #     path = d[0].get('bz','')[:100]
        data_path = config.data_upload_path
        file_path = config.get_today_upload_path()
        if not os.path.exists(file_path):
            make_dirs(file_path)
        
        check = 0
        for r in lines:
            flag = 0
            empty = 0
            cpbh = r.get('bjhh','')
            if cpbh == '':
                continue
            d = s.query(cjcp).filter(cjcp.cpbh==cpbh).first()
            if not d:
                c = s.query(zscp).filter(zscp.cpbh==cpbh).first()
                if not c:
                    empty = 1
                    d = cjcp()
                    d.rid = get_uuid()
                    d.cpbh = cpbh
                    d.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                    d.uid = user.rid
                else:
                    d = c
            else:
                c = s.query(bjsheet.rid).filter(bjsheet.bjhh==cpbh,bjsheet.jg>0).first()
                if c:
                    flag = 1

            # 专业产品为空时采购人员才能创建，如果专业产品不为空，且没有客户报价记录时，采购人员才能修改，外销人员或有权限的用户可以进行更新操作
            if empty==1 or wxsb ==1 or (flag==1 and wxsb==1) or (flag==0 and empty==0):
                logger.error('update cpbh:'+cpbh)
                for k,v in r.items():
                    if k in SYS_FIELDS or k == 'yytp' or k == 'cpbh':
                        continue
                    if hasattr(d, k):
                        setattr(d, k, v)
                if r.get('cghbdm','') == None and r.get('cghbdm','') == '':
                    d.cghbdm = 'RMB'
                new_photos = []
                d.shsc = shsc
                if r.get('yytp') != None and r.get('yytp') != '' and r.get('yytp') != '[]':
                    photos = json.loads(r.get('yytp'))
                    for photo in photos:
                        src = photo.get('src','')[:10]
                        fp = os.path.join(data_path, photo.get('src'))
                        if os.path.exists(fp):
                            fn = photo.get('name')
                            if os.path.join(data_path,src)==file_path:
                                fn = str(get_uuid()) + '_' + str(fn)
                            shutil.copy2(fp, os.path.join(file_path, fn))
                            sub_path = file_path[-10:]
                            new_photos.append({'name': fn, 'src': sub_path+'/'+fn})
                if len(new_photos) > 0:
                    d.yytp = str(new_photos).replace("'",'"')
                    photos = str(new_photos).replace("'",'"')
                    d.tgxy = user.username
                    d.wfgs = wfgs_n
                    d.sfxy = '否'
                    d.cgxg = '是'
                    d.cgry = user.username
                    d.kmxx = '否'
                    d.jcfy = math.floor(float(r.get('jcfy','0')))
                d.topcz = r.get('cply1')
                d.gcID = r.get('sccj1id')
                d.sccj = r.get('sccj1')
                d.krhh = r.get('khhh')
                d.gchh1 = r.get('gchh')
                d.ysez = r.get('yseew')
                d.bgpm = r.get('zhwbgpm')
                d.bzrl = r.get('wxrl')
                d.bztj = r.get('tj')
                d.mxmz = r.get('mz')
                d.mxjz = r.get('jz')
                d.chpkzh = r.get('kz')
                d.bjry = r.get('bjry') if r.get('bjry') != None and r.get('bjry') != '' else bjry
                d.cgry = r.get('bjry') if r.get('bjry') != None and r.get('bjry') != '' else bjry
                d.yscgj = r.get('cgdj')
                d.kmxx = '否'
                d.cgxg = '是'
                d.cghbdm = r.get('cghbdm','RMB')
                d.cpggz = r.get('cpgg')
                d.caiziz = r.get('cz')
                d.caizi = r.get('czyy')
                d.bz3 = r.get('bz')
                if r.get('jg') != None:
                    d.mjfob = r.get('jg')
                check = 1
                s.add(d)
            # logger.error(d.cpbh)
            # logger.error('update cpbh1111:'+cpbh)
        if check == 0:
            return json_result(-1, '没有需要更新的专业产品数据,请检查专业货号是否为空，专业产品是否已经存在客户报价记录')
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的加载后校验
@any_route('/api/saier/quotation/get/status', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_get_status(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        module = j.get('module', '')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t.wf_status,t.bjql,t.bjry).filter(t.rid==rid).first()
        if not d:
            return json_result(-1, '未找到报价记录')
        status = int(d.wf_status)
        bjql = str(d.bjql)
        bjry = str(d.bjry)
        if bjry != user.username:
            return json_result(-1, '该报价记录的报价人员不是当前用户，不能进行此操作')
        if status != 2 and bjql != '通过':
            return json_result(-1, '该报价记录还未通过审批，不能进行此操作')

        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户报价的加载后校验
@any_route('/api/saier/quotation/modify/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_modify_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        module = j.get('module', '')
        flag = j.get('flag', 0)
        val = j.get('val', '')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.rid==rid).first()
        if not d:
            return json_result(-1, '未找到报价记录')
        status = int(d.wf_status)
        spsq = str(d.spsq)
        bjql = str(d.bjql)
        bjry = str(d.bjry)
        bjdh = str(d.bj_id)
        if (status == 2 or bjql == '通过') and spsq!=None and spsq!="" and  spsq != user.username and bjry == user.username:
            title = j.get('title', '')
            content = j.get('content', '')
            user_list = [] # j.get('to_list', [])
            module = j.get('module')
            key_field = j.get('key_field')
            rid = j.get('rid')
            # u = s.query(sys_workflow_user_task.approver).filter(sys_workflow_user_task.module==module,
            #     sys_workflow_user_task.record_id==rid,sys_workflow_user_task.status==1).order_by(sys_workflow_user_task.sid.desc()).first()
            # if u and u.approver not in user_list:
            #     user_list.append(u.approver)
            if flag == 1:
                c = s.query(spwt.tsdl,spwt.path3).filter(spwt.dlr==spsq).first()
                if c and c.tsdl:
                    user_list.append(c.tsdl)
                    val = '要特殊改单审请,原因:'+str(val)
                    d.spsq = c.tsdl
                    d.spsq1 = c.tsdl
                    d.path1 = c.path3
                    s.add(d)
            else:
                user_list.append(spsq)
                val = '要重新审批,原因:'+str(val)
            res = user_task_new(module, rid, key_field, title, content, user, s, user_list, True)
            logger.error(res)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            for u in user_list:
                row = {
                    "xxly": module,
                    "bjdh": bjdh,
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": str(module) +str(bjdh) + str(val),
                    "jsr": str(u),
                    "sys_path": "",
                    "spsq": user.username
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


# 客户报价的加载后校验
@any_route('/api/saier/quotation/items/return/purchase', methods=['POST', 'GET'])
@require_token
async def view_saier_quotation_items_return_purchase(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        bj_id = j.get('bj_id', '')
        bjwyzd = j.get('bjwyzd', '')
        bjry = j.get('bjry', '')
        bjbjsp = j.get('bjbjsp', '')
        val = j.get('val', '')
        if bj_id == '' or bj_id == None or bjwyzd == '' or bjwyzd == None:
            return json_result(-1, ' 报价单号、报价唯一字段为空无需退回采购')
        user_list = []
        d = s.query(bj.wf_status, bj.bjql).filter(bj.rid==rid).first()
        if d and (d.wf_status == 1 or d.wf_status == 2 or d.bjql == '通过'):
            return json_result(-1, '已审批或审批中的客户报价不能退回采购')
        
        bj_rid = ''
        d = s.query(bj).filter(bj.wyzd==bjwyzd).first()
        if d:
            wf_status = int(d.wf_status)
            if wf_status == 2:
                if not cancel_workflow_instance('客户报价', d.rid, user):
                    return json_result(-1, ERR_OPERATE)
            d.cgqx = ''
            d.bjjg = '待审批'
            d.bjsp = ''
            d.bjry = ''
            d.bjbjsp = ''
            d.bjwyzd = ''
            d.wf_status = 3
            s.add(d)
        s.query(ddsp).filter(ddsp.wyzd==bjwyzd, ddsp.ddly=='采购报价').delete(synchronize_session=False)
        s.query(bjsheet).filter(bjsheet.bj_id==bj_id, bjsheet.pid==rid).delete(synchronize_session=False)
        d = s.query(cgbj).filter(cgbj.bj_id==bj_id).first()
        if d:
            wf_status = int(d.wf_status)
            if wf_status == 2:
                if not cancel_workflow_instance('采购报价', d.rid, user):
                    return json_result(-1, ERR_OPERATE)

            if d.bjry not in user_list and d.bjry != '' and d.bjry != None:
                user_list.append(d.bjry)
            if d.bjsp not in user_list and d.bjsp != '' and d.bjsp != None:
                user_list.append(d.bjsp) 
            d.spsq = ''
            d.bjql = '待审批'
            d.wf_status = 3
            bj_rid = d.rid
            s.add(d)

        if bjry not in user_list and bjry != '' and bjry != None:
            user_list.append(bjry)
        if bjbjsp not in user_list and bjbjsp != '' and bjbjsp != None:
            user_list.append(bjbjsp)
        for u in user_list:
            row = {
                "xxly": '报价',
                "bjdh": bj_id,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": '报价单被退回采购,原因:'+str(val),
                "jsr": str(u),
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row], user, s)
            if res.get('code',1) != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))
        if bj_rid != '' and bj_rid != None and len(user_list)>0:
            res = user_task_new('采购报价', bj_rid, '报价单号', f"采购报价{bj_id}退回通知", f"被业务人员{user.username}退回,原因:{str(val)}", user, s, user_list, True)
            if res.get('code') != 1:
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