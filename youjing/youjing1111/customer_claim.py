from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


# 客户拜访的编辑界面加载校验
@any_route('/api/saier/customer_claim/pksq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_pksq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ajbh = j.get('ajbh', '')
        spsq = j.get('spsq', '')
        gcsp = j.get('gcsp', '')
        flag = 1
        if gcsp=='已谈妥' and spsq != '' and spsq != None:
            d = run_sql(f"select fphm from gongcsp where (fphm='{ajbh}' and ifnull(fphm,'')<>'') limit 1")
            if len(d) == 0:
                return json_result(-1, '不好意思,请先登记工厂索培')

        if spsq != '' and spsq != None:
            d = run_sql(f"select wb1,wb2,wb3 from zx where (ly='付款审批') and ((wb1='{spsq}') or (wb2='{spsq}') or (wb3='{spsq}')) limit 1")
            if len(d) == 0:
                return json_result(-1, '不好意思,此人无审核权限')

        return json_result(1, '操作成功', flag)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户拜访的编辑界面加载校验
@any_route('/api/saier/customer_claim/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_khmc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc', '')
        spbz = ''
        d = run_sql(f"select RMBkh from kh where (company_name='{khmc}') limit 1")
        if len(d) > 0 and d[0].get('RMBkh','')=='是':
            spbz = 'RMB'

        return json_result(1, '操作成功', spbz)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户拜访的编辑界面加载校验
@any_route('/api/saier/customer_claim/hsfp/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_hsfp_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        hsfp = j.get('hsfp', '')
        d = run_sql(f"select rid from fpgl where ((wxfp='{hsfp}') or (hsfp='{hsfp}')) and (sfjd='是') limit 1")
        if len(d) == 0:
            d = run_sql(f"select rid from cymx where (fphm='{hsfp}') limit 1")
            if len(d) == 0:
                return json_result(-1, '无此出运发票号,请更换发票号!!!')
        else:
            return json_result(-1, '该发票号码已结单,请更换发票号!!!')
        
        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 客户拜访的编辑界面加载校验
@any_route('/api/saier/customer_claim/hthm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_hthm_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        hthm = j.get('hthm', '')
        khhh = j.get('khhh', '')
        bjhh = j.get('bjhh', '')
        sccj = ''
        zje = 0
        d = run_sql(f"select zje,csmc,sccj1 from cghtsheet where (hthm='{hthm}') and ((khhh='{khhh}') or (bjhh='{bjhh}')) limit 1")
        if len(d) > 0:
            if d[0].get('sccj1','')!='' and d[0].get('sccj1',None)!=None:
                sccj = d[0]['sccj1']
            if d[0].get('csmc',0)!='' and d[0].get('csmc',None)!=None:
                sccj = d[0]['csmc']
            zje = d[0]['zje']

        return json_result(1, '操作成功', {'sccj':sccj,'zje':zje})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户拜访的记录保存后校验
@any_route('/api/saier/customer_claim/cancel/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_cancel_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        val = j.get('val', '')
        d = s.query(khsp).filter(khsp.rid==rid, or_(khsp.wf_status==1, khsp.wf_status==2, khsp.shjg=='通过')).first()
        if not d:
            return json_result(-1, '只能申请【审批中】和【已通过】的客户索赔单')
        if d.pksq!=None and d.pksq!='' and d.pksq != user.username: 
            xm = str(d.pksq)
            xxnl = '客户索赔案件编号:' + str(d.ajbh) + '退改单审请,原因:' + val
            row = {
                "xxly": '客户索赔',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": xxnl,
                "jsr": str(xm),
                "sys_path": "",
                "spsq": xm
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('code'))

            res = user_task_new('客户索赔', rid, '案件编号', '[案件编号]退改单申请', '【审批】'+str(user.username)+'客户索赔案件编号:' + str(d.ajbh) + '退改单申请,原因:' + val + ',日期:'+str(time.strftime('%Y-%m-%d')), user, s, [xm], True)
            logger.error(res)
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

# 客户拜访的记录保存前校验
@any_route('/api/saier/customer_claim/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_claim_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        shr = j.get('shr', '')
        sqr = j.get('sqr', '')
        shjg = j.get('shjg', '')
        pksq = j.get('pksq', '')
        lines = j.get('lines', [])
        gd_list = []
        cs_list = []
        yw_list = []
        fp_list = []
        ht_list = []
        flag = 0
        if shjg !='待审批':
            d = run_sql(f"select rid from khsp where (rid='{rid}') and (ifnull(pksq,'')='') and (ifnull(sqr,'')<>'{user.username}') limit 1")
            if user.username!=sqr and len(d) > 0:
                return json_result(-1, '不好意思,业务撤单，不能保存')
        if sqr != user.username and pksq != user.username and shr != user.username:
            return json_result(-1, '不好意思,您没有权利修改此记录')
        for r in lines:
            if r.get('hsfp','')!='' and r.get('hsfp',None)!=None:
                d = s.query(fpgl).filter(or_(fpgl.wxfp==r.get('hsfp',''),fpgl.hsfp==r.get('hsfp','')),fpgl.sfjd=='否').all()
                for c in d:
                    flag = 1
                    c.sfjd = '是'
                    s.add(c)
            gd = r.get('gdry','')
            if gd!='' and gd!=None and gd not in gd_list:
                gd_list.append(gd)
            cs = r.get('zygc','')
            if cs!='' and cs!=None and cs not in cs_list:
                cs_list.append(cs)
            yw = r.get('ywry','')
            if yw!='' and yw!=None and yw not in yw_list:
                yw_list.append(yw)
            ht = r.get('wxht','')
            if ht!='' and ht!=None and ht not in ht_list:
                ht_list.append(ht)
            fp = r.get('fphm','')
            if fp!='' and fp!=None and fp not in fp_list:
                fp_list.append(fp)
        if len(fp_list)==0 or len(ht_list)==0:
            return json_result(-1, '不好意思,发票号码或外销合同不能为空')
        if flag==1:
            s.commit()

        return json_result(1, '操作成功', {'gd_list':gd_list,'cs_list':cs_list,'yw_list':yw_list,'fp_list':fp_list,'ht_list':ht_list})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

        