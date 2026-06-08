from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/insurance_declaration/fphm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_insurance_declaration_fphm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fphm = j.get('fphm', '')
        djpmy_text = ''

        if fphm != '':
            arr = []
            rows = run_sql(f"select djpmy from cymxsheet where fphm='{fphm}'")
            if len(rows) > 0:
                for r in rows:
                    v = str(r.get('djpmy', ''))
                    if v != '' and v not in arr:
                        arr.append(v)

            djpmy_text = '\r\n'.join([x.upper() for x in arr])

        return json_result(1, '处理成功', {'djpmy_text': djpmy_text})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/insurance_declaration/port/change', methods=['POST', 'GET'])
@require_token
async def view_saier_insurance_declaration_port_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        mdd = j.get('目的地名称', '')
        qsd = j.get('起始地名称', '')

        fields = {}
        errors = []

        if mdd != '':
            rows = run_sql(f"select EngPortName from TianAnPorts where wfEngPortName='{str(mdd)}' limit 1")
            if len(rows) == 0:
                errors.append('不好意思,目的地名称错请重选!')
                fields['目的地名称'] = ''
                fields['途经地名称'] = ''
            else:
                fields['天安目的地名称'] = rows[0].get('EngPortName', '')

        if qsd != '':
            rows = run_sql(f"select EngPortName from TianAnPorts where wfEngPortName='{str(qsd)}' limit 1")
            if len(rows) == 0:
                errors.append('不好意思,起始地名称错请重选!')
                fields['起始地名称'] = ''
            else:
                fields['天安起始地名称'] = rows[0].get('EngPortName', '')

        return json_result(1, '处理成功', {'fields': fields, 'errors': errors})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()