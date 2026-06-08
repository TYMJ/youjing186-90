from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']


@any_route('/api/saier/ship_agent/load/check_hdmc_lock', methods=['POST', 'GET'])
@require_token
async def view_saier_ship_agent_load_check_hdmc_lock(request):
    try:
        j = await request.json()
        hdmc = str(j.get('hdmc', ''))
        hdmcdata = 0

        d = run_sql(f"select rid from hdfy where zdhd='{hdmc}' or zrhd='{hdmc}' or bghd='{hdmc}' or sjhd='{hdmc}' limit 1")
        if len(d) > 0:
            hdmcdata = 1

        d = run_sql(f"select rid from dsyf where Rhd='{hdmc}' or Thd='{hdmc}' or Mhd='{hdmc}' or sjhd='{hdmc}' or Ehd='{hdmc}' limit 1")
        if len(d) > 0:
            hdmcdata = 1
        return json_result(1, 'ok', {'hdmcdata': hdmcdata})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    

@any_route('/api/saier/ship_agent/before_save', methods=['POST', 'GET'])
@require_token
async def view_saier_ship_agent_before_save(request):
    try:
        j = await request.json()
        main = j.get('main', {})
        hdbh = int(main.get('hdbh', 0) or 0)

        # MySQL: 取最大 cdbh
        if hdbh == 0:
            d = run_sql('select cdbh from cdzl order by cdbh desc limit 1')
            if len(d) > 0 and d[0].get('cdbh') is not None:
                hdbh = int(d[0].get('cdbh')) + 1

        return json_result(1, '处理成功', {'hdbh': hdbh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())

@any_route('/api/saier/ship_agent/button/get_next_hdbh', methods=['POST', 'GET'])
@require_token
async def view_saier_ship_agent_button_get_next_hdbh(request):
    try:
        hdbh = 0
        d = run_sql('select cdbh from cdzl order by cdbh desc limit 1')
        if len(d) > 0 and d[0].get('cdbh') is not None:
            hdbh = int(d[0].get('cdbh')) + 1
        return json_result(1, '处理成功', {'hdbh': hdbh})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    
@any_route('/api/saier/ship_agent/viewer/delete/before', methods=['POST', 'GET'])
@require_token
async def view_saier_ship_agent_viewer_delete_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ckry = j.get('ckry', '')
        rid = j.get('rid', '')

        if ckry == user.username:
            return json_result(-1, '不好意思,不能删除自已的数据!')

        if ckry != '':
            uid = ''
            u = s.query(sys_user.rid).filter(sys_user.username==ckry).first()
            if u:
                uid = str(u.rid)
            s.query(sys_cdzl_share).filter(sys_cdzl_share.record_id==rid,sys_cdzl_share.to_uid==uid).delete()
            s.commit()

        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()