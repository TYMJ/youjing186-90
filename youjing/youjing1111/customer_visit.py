from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


# 客户拜访的编辑界面加载校验
@any_route('/api/saier/customer_visit/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_visit_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        djry = j.get('djry', '')
        data = {}
        d = run_sql(f"select * from ywrybiao where (yhm='{djry}') limit 1")
        if len(d) > 0:
            data = d[0]
        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户拜访的记录保存前校验
@any_route('/api/saier/customer_visit/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_visit_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        djry = j.get('djry', '')
        d = run_sql(f"select rid from sys_user where (username='{user.username}') and ((position like '%总%') or (memo like '%总%')) limit 1")
        if user.username!=djry and len(d) == 0:
            return json_result(-1, '不好意思,您没有权利修改此记录')

        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户拜访的记录保存后校验
@any_route('/api/saier/customer_visit/save/after', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_visit_save_after(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc', '')
        lfrq = j.get('lfrq', '')
        djry = j.get('djry', '')
        rid = j.get('rid', '')
        xxnl = '请注意客人:' + str(khmc) + '将于' + str(lfrq) + '到访,登记人:' + str(djry)
        d = run_sql(f"select xm from cyzglsheet where zm='客人来访通知'")
        for r in d:
            xm = r['xm']
            row = {
                "xxly": '客户来访',
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

            res = user_task_new('客户来访', rid, '公司名称', '[公司名称] 客户来访', xxnl, user, s, [xm], True)
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

# 获取客户拜访的审批主管
def customer_visit_get_approver(username):
    d = run_sql(f"select bmjl from ywrybiao where (yhm='{username}') limit 1")
    if len(d) > 0:
        return d[0]['bmjl']
    return 'zjnblh'

# 获取客户拜访的国家是否为国外
def customer_visit_check_country(rid):
    d = run_sql(f"select rid from khbfsheet2 where (pid='{rid}') and country<>'CHINA' limit 1")
    if len(d) > 0:
        return ''
    return '侯柳红'