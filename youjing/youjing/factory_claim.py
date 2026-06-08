from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/factory_claim/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {'cwck':0}

        d = run_sql(f"select rid from sys_user where (username='{str(user.username)}') and (position like '%财务%')")
        if len(d)>0:
            data['cwck'] = 1
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_claim/save/before/check', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_save_before_check(request):
    j = await request.json()
    user = request.current_user
    try:
        ajbh = j.get('ajbh','')
        y = datetime.now().strftime('%y-%m') 
        if ajbh == '':
            d = run_sql(f"select sid from gongcsp order by sid desc LIMIT 1")
            if len(d) > 0:
                next_number = d[0] + 1
            else:
                next_number = 1
            i1 = f"{next_number:06d}"  # 等价于 formatfloat('000000', ...)

            # 生成案件编号
            ajbh = f"{y}-{i1}"
        
        cdsb = ''
        d = run_sql(f"select ajbh,rid from gongcsp where (ajbh=:ajbh) and (tjsq='') and (sqr<>:sqr)", {'ajbh': str(ajbh), 'sqr': str(user.username)})
        if len(d) > 0:
            cdsb = '1'
        data = {'cdsb': cdsb, 'ajbh': ajbh}
        return json_result(1, '检查成功！', data)
    except: 
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/factory_claim/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        sfjq = j.get('sfjq','')
        spje = j.get('spje','0')
        cjbh = j.get('cjbh','')
        data_list = j.get('data_list',[])
        path = j.get('path','')
        fphm = j.get('fphm','')
        ajbh = j.get('ajbh','')
        tjsq = j.get('tjsq','')
        tjcw = j.get('tjcw','')
        shjg = j.get('shjg','')
        sqr = j.get('sqr','')
        bpyy = j.get('bpyy','')
        
        if (sfjq != '是') and (float(spje) > 0):
            update_json = {'pfzt': '待赔付'}
            s.query(zycs).filter(zycs.cs_id == str(cjbh)).update(update_json)
        
        if len(data_list) > 0:
            for item in data_list:
                hsfp = item.get('hsfp','')
                if hsfp != '':
                    update_json1 = {'webpdfy': '是'}
                    s.query(fpgl).filter(fpgl.wxfp == str(hsfp),fpgl.hsfp == str(hsfp),fpgl.sfjd == '否').update(update_json1)
                
                gcpk = item.get('gcpk','')
                wyzd = item.get('wyzd','')
                if gcpk != '' and wyzd != '':
                    update_json2 = {'gcpk': gcpk}
                    s.query(khspsheet1).filter(khspsheet1.wyzd == str(wyzd)).update(update_json2)
        
        if path != '':
            gongcsp_data = s.query(gongcsp.cljg).filter(gongcsp.fphm == str(fphm),gongcsp.ajbh != str(ajbh)).all()
            if len(gongcsp_data) > 0:
                gongcsp_data = alchemy_object_list_to_dict(gongcsp_data)
                for gc in gongcsp_data:
                    path += ';' + '\r\n' + gc.get('cljg','')
                    
            update_json2 = {'gccljg': path}
            s.query(khsp).filter(khsp.ajbh == str(ajbh)).update(update_json2)
            
        if tjsq != '':
            if tjsq != user.username:
                xxnr = '案件编号:' + str(ajbh) + '工厂索赔需审核'
                row = {
                    "xxly": '工厂索赔',
                    "bjdh": '',
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": xxnr,
                    "jsr": tjsq,
                    "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                }
                res = module_xxck_new([row],user,s)
                if res.get('code')!=1:
                    return json_result(res.get('code'), res.get('code'))
            siddata = 0 
            d = run_sql(f"select sid from gongcsp where ajbh='{str(ajbh)}'")
            if len(d)>0:
                siddata = d[0].get('sid',0)
            if siddata > 0:
                res = user_task_delete('工厂索赔', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                content = '工厂索赔' + str(ajbh) + '' + user.username 
                xxnr = '[审批]' + user.username + '的工厂索赔:' + str(ajbh) + '需审批,日期:' + datetime.now().strftime('%Y-%m-%d')
                # res = user_task_new('工厂索赔', rid, '案件编号',xxnr,content, user, s, [tjsq],True)
                res = user_task_new('工厂索赔', rid, '案件编号', content, xxnr, user, s, [tjsq], True)
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('msg'))
        
        if tjcw != '':
            if tjcw != user.username:
                xxnr = '案件编号:' + str(ajbh) + '工厂索赔需审核'
                row = {
                    "xxly": '工厂索赔',
                    "bjdh": '',
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": xxnr,
                    "jsr": tjcw,
                    "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                }
                res = module_xxck_new([row],user,s)
                if res.get('code')!=1:
                    return json_result(res.get('code'), res.get('code'))
                
        if shjg != '' and shjg != '待审批':
            if shjg == '通过':
                if tjsq == '':
                    d = run_sql(f"select xm,bz from cyzglsheet where (zm='财务工厂索赔通知')")
                    if len(d)>0:
                        for cz in d:
                                xxnr = '案件编号:' + str(ajbh) + '客户索赔审核通过'
                                row = {
                                    "xxly": '工厂索赔',
                                    "bjdh": '',
                                    "wxht": '',
                                    "cght": '',
                                    "yhdh": '',
                                    "xxnr": xxnr,
                                    "jsr": cz.get('xm',''),
                                    "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                                }
                                res = module_xxck_new([row],user,s)
                                if res.get('code')!=1:
                                    return json_result(res.get('code'), res.get('code'))
                    
            else:
                if sqr !='' and sqr != user.username:
                    xxnr = '案件编号:' + str(ajbh) + '工厂索赔审核不通过,原因' + str(bpyy)
                    row = {
                        "xxly": '工厂索赔',
                        "bjdh": '',
                        "wxht": '',
                        "cght": '',
                        "yhdh": '',
                        "xxnr": xxnr,
                        "jsr": sqr,
                        "sys_path": "我的公司\\宁波优景进出口有限公司\\"
                    }
                    res = module_xxck_new([row],user,s)
                    if res.get('code')!=1:
                        return json_result(res.get('code'), res.get('code'))
            
            siddata = 0
            d = run_sql(f"select sid from gongcsp where ajbh='{str(ajbh)}'")
            if len(d)>0:
                siddata = d[0].get('sid',0)
            if siddata > 0:
                res = user_task_delete('工厂索赔', rid, s, [])
                if res.get('code',1) != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '保存成功！')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_claim/tjsq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_tjsq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sh = j.get('sh','')
        data = {'spdata':0}

        d = run_sql(f"select wb1,wb2,wb3 from zx where (ly='付款审批') and ((wb1='{str(sh)}') or (wb2='{str(sh)}') or (wb3='{str(sh)}'))")
        if len(d)>0:
            data['spdata'] = 1
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/factory_claim/tjcw/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_tjcw_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sh = j.get('sh','')
        data = {'spdata':0}

        d = run_sql(f"select * from sys_user where (username='{str(sh)}') and (position like '%财务工厂%')")
        if len(d)>0:
            data['spdata'] = 1
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_claim/shjg/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_shjg_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sh = j.get('sh','')
        data = {}
        sh1 = ''

        d = run_sql(f"select wb1,wb2,wb3 from zx where (ly='付款审批') and ((wb1='{str(user.username)}') or (wb2='{str(user.username)}') or (wb3='{str(user.username)}'))")
        if len(d)>0:
            if d[0].get('wb2','') != str(user.username) and d[0].get('wb3','') != str(user.username):
                sh1 = d[0].get('wb2','')
            else:
                if d[0].get('wb3','') != str(user.username):
                    sh1 = d[0].get('wb3','')
        data = {'sh1': sh1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_claim/pkmx/fphs/change', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_pkmx_fphs_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hsfp = j.get('hsfp','')
        data = {}
        sb = ''

        d = run_sql(f"select rid from fpgl where (zfph='{str(hsfp)}') and (sfjd='是')")
        if len(d)>0:
            sb = '1'
        if sb == '':
            d1 = run_sql(f"select rid from cymx where (fphm='{str(hsfp)}')")
            if len(d1)>0:
                sb = '2'
        data = {'sb': sb}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/factory_claim/button/gqdsq', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_button_gqdsq(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        tjsq = j.get('tjsq','')
        ajbh = j.get('ajbh','')
        yy = j.get('yy','')
        
        if tjsq != user.username and tjsq != '':
            xxnr = '工厂索赔案件编号:' + str(ajbh) + '退改单审请,原因:' + str(yy)
            row = {
                "xxly": '工厂索赔',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": xxnr,
                "jsr": tjsq,
                "sys_path": "我的公司\\宁波优景进出口有限公司\\"
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))
        siddata = 0 
        d = run_sql(f"select sid from gongcsp where ajbh='{str(ajbh)}'")
        if len(d)>0:
            siddata = d[0].get('sid',0)
        if siddata > 0:
            res = user_task_delete('工厂索赔', rid, s, [])
            if res.get('code',1) != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))
            
            xxnr = user.username + '工厂索赔案件编号:' + str(ajbh) + '退改单审请,原因:' + str(yy) + ',日期:' + datetime.now().strftime('%Y-%m-%d')
            res = user_task_new('工厂索赔', rid, '案件编号',xxnr, user, s, [tjsq])
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
        
@any_route('/api/saier/factory_claim/button/cxsp', methods=['POST', 'GET'])
@require_token
async def view_saier_factory_claim_button_cxsp(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        
        d = run_sql(f"select rid,ajbh from gongcsp where (rid='{str(rid)}') and (sqr='{str(user.username)}') and (shsq='')")
        if len(d)>0:
            update_json = {'tjsq': ''}
            s.query(gongcsp).filter(gongcsp.rid == str(rid)).update(update_json)
            
            res = user_task_delete('工厂索赔', rid, s, [])
            if res.get('code',1) != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))
            
            s.commit()
            return json_result(1, '查询成功')
            
        else:
            return json_result(-1, '不好意思已批,撤单无效!')
        
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()