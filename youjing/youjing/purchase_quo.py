from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new,module_share_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


# 采购报价的界面加载
@any_route('/api/saier/purchase_quo/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        # bj_id = j.get('bj_id', '')
        bjry = j.get('bjry', '')
        org = get_user_path(bjry)
        path = org.get('path','') + '_' 
        d = run_sql(f"select bz from cyzglsheet where (xm='{bjry}') and (zm='报价提交') group by bz")
        path = path.replace('\\','_')
        bjsp_list = [r.get('bz','') for r in d]
        d = run_sql(f"SELECT dlr bz FROM spwt WHERE ('{path}' LIKE CONCAT('%', replace(cgbjdl, '\\\\', '_'), '%')) AND (spwt.dlr <> '{bjry}') ORDER BY yhms DESC")
        for r in d :
            if r.get('bz','') not in bjsp_list:
                bjsp_list.append(r.get('bz',''))
        return json_result(1, '操作成功', bjsp_list)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购报价的工作流启动
@any_route('/api/saier/purchase_quo/workflow/start', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_workflow_start(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bjry = ''
        xj_dh = ''
        bj_id = ''
        rid = j.get('rid', '')
        d = s.query(cgbj.bjry,cgbj.xj_dh,cgbj.bj_id).filter(cgbj.rid==rid).first()
        if d:
            bjry = str(d.bjry)
            xj_dh = str(d.xj_dh)
            bj_id = str(d.bj_id)

        if bjry == '':
            return json_result(-1, '操作失败,未找到采购人员信息')

        # 更新产品资料的是否报价、报价人员
        d = s.query(cgbjsheet.xjcprid).filter(cgbjsheet.pid==rid).all()
        for r in d:
            c = s.query(khxjsheet).filter(khxjsheet.rid==r.xjcprid).first()
            if c:
                c.sfbj = '是'
                c.bjry = user.username
                s.add(c)

        # 更新询价采购的是否报价、报价单号
        c = s.query(khxjsheet1).filter(khxj.xj_dh==xj_dh,khxjsheet1.bjry==bjry).outerjoin(khxj,khxj.rid==khxjsheet1.pid).first()
        if c:
            c.sfbj = '是'
            c.bjdh = bj_id
            s.add(c)

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 采购报价的审批申请修改校验
@any_route('/api/saier/purchase_quo/spsq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_spsq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        code = 1
        msg = '操作成功'
        spsq = j.get('spsq', '') 
        d = run_sql(f"select rid from cyzglsheet where (xm='{user.username}') and (zm='报价提交') and (bz='{spsq}') order by sid desc limit 1")
        if len(d)>0:
            code = -1
            msg = '此人没有审批权限,请重新选择'

        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购报价产品资料删除时更新询价采购的报价状态和报价单号
def inquiry_update_purchase_quo(bjry, delete_rids, s):
    try:
        for r in delete_rids:
            c = s.query(cgbjsheet.xjcprid,cgbjsheet.rid).filter(cgbjsheet.rid==r).first()
            if not c:
                continue
            a = s.query(khxjsheet).filter(khxjsheet.rid==c.xjcprid).first()
            if not a:
                continue
            s.query(khxjsheet1).filter(khxjsheet1.pid==a.pid, khxjsheet1.bjry==bjry).update({"sfbj": '否', "bjdh": ''}, synchronize_session=False)
            if a.bjry == bjry:
                b = s.query(cgbjsheet.rid, cgbj.bj_id, cgbj.bjry).filter(cgbjsheet.xjcprid==c.xjcprid, cgbjsheet.rid!=c.rid, 
                    or_(cgbj.wf_status==1, cgbj.wf_status==1)).outerjoin(cgbj,cgbj.rid==cgbjsheet.pid).order_by(cgbj.sid.desc()).first()
                if not b:
                    a.sfbj = '否'
                    a.bjry = ''
                else:
                    a.bjry = b.bjry
                    # a.bjdh = b.bj_id 
                    s.add(a)

        return {"code": 1, "msg": "操作成功"}
    except:
        logger.error(trace_error())
        return {"code": -1, "msg": trace_error()}


# 采购报价的审批申请修改校验
@any_route('/api/saier/purchase_quo/before/save', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_before_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        code = 1
        msg = '操作成功'
        msbz = '否'
        ywry = j.get('ywry', '')
        rid = j.get('rid', '')
        cgry = j.get('cgry', '')
        delete_rids = j.get('delete_rids', [])
        res = inquiry_update_purchase_quo(cgry, delete_rids, s)
        if res.get('code', 1) != 1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))
        
        d = run_sql(f"select rid from tsqxsheet where (qxlx='采购报价') and (xm='{user.username}') and (qxzl='免审') limit 1")
        if len(d)>0:
            msbz = '是'

        d = s.query(cgbj).filter(cgbj.rid==rid).first()
        if d and d.bjry != ywry and d.wf_status == 2:
            res = user_task_new('采购报价', rid, '报价单号', f'采购人员{d.bjry}产品推荐', f"{d.bjry}向你推荐了采购报价{d.bj_id}", user, s, [ywry])
            logger.error(res)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            row = {
                "xxly": '采购报价',
                "bjdh": d.bj_id,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": f"{d.bjry}向你推荐了采购报价{d.bj_id},日期:{time.strftime('%Y-%m-%d')}",
                "jsr": str(d.bjry),
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row], user, s)
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
            
        s.commit()
        return json_result(code, msg, msbz)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 采购报价的记录删除之前的校验和相关记录更新
@any_route('/api/saier/purchase_quo/before/delete', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_before_delete(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        code = 1
        msg = '操作成功'
        rid = j.get('rid', '')
        d = s.query(cgbj).filter(cgbj.rid==rid).first()
        if not d:
            return json_result(-1, '未找到相关记录')
        cgry = d.bjry
        c = s.query(cgbjsheet.rid).filter(cgbjsheet.pid==rid).all()
        delete_rids = [r.rid for r in c]
        res = inquiry_update_purchase_quo(cgry, delete_rids, s)
        if res.get('code', 1) != 1:
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


# 采购报价的审批申请修改校验
@any_route('/api/saier/purchase_quo/after/save', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_quo_after_save(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        ywry = j.get('ywry', '')
        user_list = [ywry]
        bm = ''
        code = 1
        msg = '操作成功'
        d = run_sql(f"select bm from ywrybiao where (yhm='{ywry}') limit 1")
        if len(d)>0:
            bm = str(d[0].get('bm',''))
        if bm !='' and bm != None:
            d = run_sql(f"select yhm from ywrybiao where (bm='{bm}')")
            for r in d:
                yhm = r.get('yhm','')
                if yhm !='' and yhm != None and yhm not in user_list:
                    user_list.append(yhm)

        res = module_share_new('采购报价',user_list,rid,user,s,['all'])
        if res.get('code',1) != 1:
            s.rollback()
            return json_result(-1, res.get('msg'))  
            
        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()