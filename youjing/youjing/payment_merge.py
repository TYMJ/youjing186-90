import os
from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import user_task_new, module_xxck_new, get_user_path
import time, re


def split_by_comma(numberhz: str):
    # 按中英文逗号分割，去除空白段
    parts = re.split(r'[，,]', numberhz)
    # 去掉每个部分首尾空格，并过滤掉空字符串
    return [p.strip() for p in parts if p.strip()]


@any_route('/api/saier/payment_merge/return', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_merge_return(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        module = j.get('module', '付款合成')
        org = get_user_path(user.username)
        path = org.get('path')
        if '财务' not in path:
            return json_result(-1, '只有财务部门的用户才能提交申请')

        for rid in rids:
            d = s.query(fkhc).filter(fkhc.rid == rid, or_(func.ifnull(fkhc.yhstate,'') == '', fkhc.yhstate == '无', fkhc.yhstate == '已失败')).first()
            if not d:
                continue
            ly = d.ly
            rid_list = split_by_comma(d.numberhz)
            for r in rid_list:
                if ly == '预付货款':
                    s.query(yfhk).filter(yfhk.rid == r).update({yfhk.yhstate: '无', yfhk.modi_uid: user.rid, yfhk.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
                elif ly == '单证费用':
                    s.query(dzfy).filter(dzfy.rid == r).update({dzfy.yhstate: '无', dzfy.modi_uid: user.rid, dzfy.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
                else:
                    s.query(gchk).filter(gchk.rid == r).update({gchk.yhstate: '无', gchk.modi_uid: user.rid, gchk.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
            s.delete(d)

        s.commit()
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/payment_merge/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_payment_merge_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        module = j.get('module', '付款合成')
        org = get_user_path(user.username)
        path = org.get('path')
        if '财务' not in path:
            return json_result(-1, '只有财务部门的用户才能提交申请')
        for rid in rids:
            d = s.query(fkhc).filter(fkhc.rid == rid, or_(func.ifnull(fkhc.yhstate,'') == '', fkhc.yhstate == '无')).first()
            if not d:
                continue
            d.yhstate = '待提交'
            d.modi_uid = user.rid
            d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(d)
            jsry = d.jsrm
            content = '生产厂家:' + str(d.gcmc) + '的合计付款款项金额:' + str(d.hkje) + '已付,日期:' + time.strftime('%Y-%m-%d')
            title = '生产厂家:' + str(d.gcmc) + '付款通知'
            res = user_task_new(module, rids, 'rid', title, content, user, s, [jsry], True)
            if res.get('code') != 1:
                logger.error(res.get('msg','创建任务失败'))
                return json_result(-1, res.get('msg'))
            row = {
                "xxly": '采购付款(批量)',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": content,
                "jsr": str(jsry),
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