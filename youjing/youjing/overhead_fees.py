from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import user_task_new, module_xxck_new, get_user_path
import time, re
from datetime import datetime, timedelta


# 专业产品保存后
@any_route('/api/saier/overhead_fees/save/check', methods=['POST', 'GET'])
@require_token
async def view_saier_overhead_fees_save_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        path = ''
        ssbm = j.get('ssbm')
        if ssbm == '' and ssbm == None:
            org = get_user_path(user.username)
            path = org.get('path')
        return json_result(1,'操作成功', path)
    except Exception as e:
        return json_result(-1, trace_error())
    finally:
        s.close()