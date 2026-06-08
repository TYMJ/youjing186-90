from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

# 记录保存前校验
@any_route('/api/saier/inspection/fee/check', methods=['POST', 'GET'])
@require_token
async def view_saier_inspection_fee_check(request):
    s = Session()
    j = await request.json()
    try:
        sftj = j.get('sftj', '') 
        hthm = j.get('hthm', '') 
        d = s.query(yhfydj.rid).filter(yhfydj.sftj==sftj,yhfydj.hthm==hthm).first()
        if d:   
            return json_result(-1, '此验货费用登记已提交，不能更改')
        else:
            return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
