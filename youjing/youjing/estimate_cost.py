from any import *
from .model import *
from .__default__ import get_user_path, module_share_new, module_xxck_new, user_task_delete, user_task_new
from sqlalchemy import create_engine, Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import date, datetime
import time



"""
电商运费.相关杂费.更新仓库费用
对应原Pascal: 相关杂费.更新仓库费用
"""
@any_route('/api/saier/estimate_cost/update_cost', methods=['POST'])
@require_token
async def view_estimate_cost_update_cost(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        j = await request.json()
        fphm = j.get('fphm', '')
        c = s.query(ckzgfy).filter(ckzgfy.wxfp == fphm, ckzgfy.ywsp == '通过').all()
        data = alchemy_object_list_to_dict(c)

        return json_result(code, msg, data)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()


"""
电商运费.财务权限校验
对应原Pascal: 电商运费.财务权限校验
"""
@any_route('/api/saier/estimate_cost/cwry_check', methods=['POST'])
@require_token
async def view_estimate_cost_cwry_check(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '跨境财务').first()
        if not c:
            return json_result(-1, '无权限执行财务退回', 0)
        
        return json_result(code, msg, 1)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'财务退回权限校验失败: {str(e)}')
    finally:        
        s.close()

"""
电商运费.编辑界面加载
对应原Pascal: 电商运费.编辑界面加载
"""
@any_route('/api/saier/estimate_cost/load/check', methods=['POST'])
@require_token
async def view_estimate_cost_load_check(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        data = {'cwsb': 0}
        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '跨境财务').first()
        if c:
            data['cwsb'] = 1
        return json_result(code, msg, data)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'财务退回权限校验失败: {str(e)}')
    finally:        
        s.close()

"""
电商运费.财务退回
对应原Pascal: 电商运费.财务退回
"""
@any_route('/api/saier/estimate_cost/update_cwth', methods=['POST'])
@require_token
async def view_estimate_cost_update_cwth(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        j = await request.json()
        rid = j.get('rid', '')
        kind = j.get('kind', '')
        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '跨境财务').first()
        # if not c:
        #     return json_result(-1, '无权限执行财务退回')
        if kind == '' or kind == None:
            return json_result(-1, '缺失操作类型')
        kind = str(kind)
        if '1' not in kind and '2' not in kind and '3' not in kind and '4' not in kind and '5' not in kind:
            return json_result(-1, '操作类型无效')
        d = s.query(dsyf).filter(dsyf.rid == rid).first()
        if not d:
            return json_result(-1, '请选择需要更新的记录')
        if '1' in kind:
            d.yf = ''
            d.tjdz = ''
            d.dzsp = ''
            d.tjyw = ''
            d.ywsp = ''
        if '2' in kind:
            d.ygyf = ''
            d.Tdzsp = ''
            d.Ttjdz = ''
            d.Ttjyw = ''
            d.Tywsp = ''
        if '3' in kind:
            d.Myf = ''
            d.Mtjdz = ''
            d.Mdzsp = ''
            d.Mtjyw = ''
            d.Mywsp = ''
        if '4' in kind:
            d.Hyf = ''
            d.Htjyw = ''
            d.Hywsp = ''
            d.Htjdz = ''
            d.Hdzsp = ''
        if '5' in kind:
            d.yEyf = ''
            d.Etjdz = ''
            d.Edzsp = ''
            d.Eywsp = ''
            d.Etjyw = ''

        d.cwsd = '否'
        d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
        d.modi_uid = user.rid
        s.add(d)
        s.commit()
        return json_result(code, msg)
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()


"""
电商运费.财务批量付款日期
对应原Pascal: 电商运费.财务批量付款日期
"""
@any_route('/api/saier/estimate_cost/update_payment_date', methods=['POST'])
@require_token
async def view_estimate_cost_update_payment_date(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        j = await request.json()
        rids = j.get('rids', [])
        kind = j.get('kind', '')
        date = j.get('date', '')
        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '跨境财务').first()
        if not c:
            return json_result(-1, '无权限执行财务批量付款日期更新')
        if kind == '' or kind == None:
            return json_result(-1, '缺失操作类型')
        if date == '' or date == None:
            return json_result(-1, '付款日期不能为空')
        date = str(date)[:10] # 兼容日期时间格式
        kind = str(kind)
        if '1' not in kind and '2' not in kind and '3' not in kind and '4' not in kind and '5' not in kind:
            return json_result(-1, '操作类型无效')
        for rid in rids:
            d = s.query(dsyf).filter(dsyf.rid == rid).first()
            if not d:
                return json_result(-1, '请选择需要更新的记录')
            if '1' in kind:
                d.yf = '是'
                d.cwfkrq = date
            if '2' in kind:
                d.ygyf = '是'
                d.Tcwfkrq = date
            if '3' in kind:
                d.Myf = '是'
                d.Mcwfkrq = date
            if '4' in kind:
                d.Hyf = '是'
                d.Hcwfkrq = date
            if '5' in kind:
                d.Eyf = '是'
                d.Ecwfkrq = date
            d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            d.modi_uid = user.rid
            s.add(d)
        s.commit()
        return json_result(code, msg)
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()

"""
电商运费.记录保存前的权限校验与消息通知
对应原Pascal: 电商运费.修改人员
"""
@any_route('/api/saier/estimate_cost/save/before', methods=['POST'])
@require_token
async def view_estimate_cost_save_before(request):
    s = Session()
    try:
        user = request.current_user
        j = await request.json()
        rid = j.get('rid', '')
        # fphm = j.get('fphm', '')
        messages = j.get('messages', [])
        for m in messages:
            u = m.get('user', '')
            nr = m.get('nr', '')
            tnr = m.get('TNR', '')
            scnr = tnr
            tznr = nr
            if scnr == '' or scnr == None:
                scnr = nr
            if tznr == '' or tznr == None:
                tznr = tnr
            if u == '' or u == None:
                continue
            res = user_task_delete('电商运费', rid, s, [u], scnr)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))

            res = user_task_new('电商运费', rid, '发票号码', '电商运费审批通知', tznr, user, s, [u])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            
            row = {
                "xxly": '电商运费',
                "wxht": '',
                "gdht": '',
                "yhdh": '',
                "xxnr": tznr,
                "jsr": u,
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('code'))
            
        s.commit()
        return json_result(1, '操作成功')
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()
