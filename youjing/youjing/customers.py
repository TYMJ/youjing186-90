import email

from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time,re
import shutil,json,os
from starlette.background import BackgroundTask
from .__default__ import module_share_new, module_xxck_new, get_user_path, user_task_delete,user_task_new
from datetime import datetime, timedelta

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

#客户资料校验业务人员
@any_route('/api/saier/customer/check/ywry', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_check_ywry(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        i = 0
        ry2 = ''
        bm = ''
        position = ''
        
        d = run_sql(f"select bm from ywrybiao where yhm='{str(user.username)}'")
        if len(d)>0:
            bm = d[0].get('bm','')
            
        d = run_sql(f"select count(*) qty from ywrybiao where (bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}' )")
        if len(d)>0:
            i = d[0].get('qty')
        if i > 0:
            ry2 = 1
        
        d = run_sql(f"select * from sys_user where username='{str(user.username)}'")
        if len(d)>0:
            if d[0].get('position')!=None and d[0].get('position')!='':
                position = d[0].get('position','')
            elif d[0].get('memo')!=None and d[0].get('memo')!='':
                position = d[0].get('memo','')

        data = {'bm':bm,'ry2':ry2,'position':position}

        return json_result(1, '校验成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#客户资料查询查看人员清单
@any_route('/api/saier/customer/query/ryckqd', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_query_ryckqd(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        kh_id = j.get('kh_id','')
        data = []
        
        d = run_sql(f"select * from khsheet3 where  (kh_id='{str(kh_id)}') and (module1='客户资料') and (sys_path<>'我方公司\优景') and (ywry<>'陈妍科') and (ywry<>'周玲燕') and (ywry<>'侯柳红')")
        if len(d)>0:
            data = d
            
        return json_result(1, '查询成功',data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()



#客户资料查询查看ghsb
@any_route('/api/saier/customer/query/ghsb', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_query_ghsb(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        kh_id = j.get('kh_id')
        code = -1
        msg = '不好意思,您无权设置公海客户'
        d = run_sql(f"select rid from cyzglsheet where (xm='{str(user.username)}') and (zm='公海客户')")
        if len(d)>0:
            code = 1
            msg = '查询成功'
            d = s.query(sys_kh_share).filter(sys_kh_share.record_id==rid).all()
            for r in d:
                s.delete(r)
            d = s.query(khsheet3).filter(khsheet3.kh_id==kh_id).all()
            for r in d:
                s.delete(r)

        s.commit()       
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料编辑界面加载
@any_route('/api/saier/customer/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        kh_id = j.get('kh_id','')
        data = {'bm':'', 'ry2':0, 'position':'', 'ryck':[], 'ghsb':0}

        d = run_sql(f"select bm from ywrybiao where yhm='{str(user.username)}'")
        if len(d)>0:
            data['bm'] = d[0].get('bm','')
            
        d = run_sql(f"select rid from ywrybiao where (bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}' )")
        if len(d)>0:
            data['ry2'] = 1
        
        d = run_sql(f"select position,memo from sys_user where username='{str(user.username)}'")
        if len(d)>0:
            if d[0].get('position') != None and d[0].get('position') != '':
                data['position'] = d[0].get('position','')
            elif d[0].get('memo') != None and d[0].get('memo') != '':
                data['position'] = d[0].get('memo','')

        d = run_sql(f"select * from khsheet3 where  (kh_id='{str(kh_id)}') and ifnull(kh_id,'')<>'' and (module1='客户资料') and (sys_path<>'我方公司\优景') and (ywry<>'陈妍科') and (ywry<>'周玲燕') and (ywry<>'侯柳红')")
        data['ryck'] = d

        d = run_sql(f"select rid from cyzglsheet where (xm='{str(user.username)}') and (zm='公海客户')")
        if len(d)>0:
            data['ghsb'] = 1
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 校验邮箱地址
def validate_email(email):
    """
    遵循RFC 5322标准的邮箱验证
    """
    pattern = r"(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])"
    return bool(re.match(pattern, email, re.IGNORECASE))

# def validate_email(email):
#     pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
#     return bool(re.match(pattern, email))

#取出邮箱地址域名
def extract_email(email):
    pattern = r'@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
    match = re.search(pattern, email)
    return '@' + str(match.group(1)) if match else None

def customer_email_exists_check(rid, data, s):
    try:
        email_all = []
        email_exists = []
        for l in data:
            e = l.get('email')
            c = l.get('zfyx')
            if not validate_email(e):
                return {'code': -1, 'msg': f"此email【{e}】有误,请更换"}
            logger.info(f"校验email: {e}, {c}")           
            if c == '不可以':
                if not e in email_exists and not e in email_all:
                    email_exists.append(e)
                else:
                    return {'code': -1, 'msg': f"此email【{e}】已有登记,请更换"}
                
            if not e in email_all:
                email_all.append(e)
        
        for e in email_all:
            b = s.query(khlxr.email,khlxr.zfyx,kh.kh_id,kh.ywry, kh.rid).filter(khlxr.pid!=rid, khlxr.email == e).outerjoin(kh,kh.rid==khlxr.pid).first()
            if b:
                if e in email_exists:
                    return {'code': -1, 'msg': f"请注意email【{e}】可能已有登记,客人ID{str(b.kh_id)}业务人员{str(b.ywry)}"}
                if b.zfyx == '不可以':
                    return {'code': -1, 'msg': f"请注意email【{e}】可能已有登记,客人ID{str(b.kh_id)}业务人员{str(b.ywry)}"}
            if e in email_exists:
                d = s.query(kh.kh_id, kh.rid).filter(kh.rid!=rid,kh.email==e).first()
                if d:             
                    return {'code': -1, 'msg': f"请注意email【{e}】可能已有登记,客人ID{str(d.kh_id)}"}
        
        return {'code': 1, 'msg': '校验成功'}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}


#客户资料联系人电子邮箱校验
@any_route('/api/saier/customer/email/check', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_email_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        pid = j.get('rid')
        lines = j.get('lines')
        res = customer_email_exists_check(pid, lines, s)
        code = res['code']
        msg = res['msg']

        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#客户资料联系人电子邮箱校验
@any_route('/api/saier/customer/bank/check', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_bank_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        pid = j.get('rid')
        lines = j.get('lines')
        data = {}
        code = 1
        msg = '校验成功'
        errs = []
        for l in lines:
            rid = l.get('pid')
            Company = l.get('Company')
            Bank = l.get('Bank')
            Account = l.get('Account')
            e = str(Company) + str(Bank) + str(Account) 
            if e in errs:
                msg = f"此账号{e}已有登记,请更换"
                data[rid] = msg
                continue
            errs.append(e)
            d = s.query(khlxr.rid).filter(customersbillto.Company==Company,customersbillto.Bank==Bank,customersbillto.Account==Account,customersbillto.pid!=pid).first()
            if d:
                msg = f"此账号{e}已有登记,请更换"
                data[rid] = msg
                if not e in errs:
                    errs.append(e)
        if len(data)>0:
            code = -1
            msg = "此账号" + "\n".join(errs) + "已有登记,请更换"

        return json_result(code, msg, data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料联系人电子邮箱校验
@any_route('/api/saier/customer/user/delete', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_user_delete(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        kh_id = j.get('kh_id')
        l = j.get('line')
        code = 1
        msg = '校验成功'
        yhm = l.get('ywry')
        uid = ''
        u = s.query(sys_user.rid).filter(sys_user.username==yhm).first()
        if u:
            uid = str(u.rid)
        d = s.query(ywrybiao.rid).filter(or_(ywrybiao.bmjl==user.username,ywrybiao.sybzj==user.username,ywrybiao.sybdzj==user.username,ywrybiao.yhm==yhm)).first()
        if d or user.username == '侯柳红' or user.username == 'zjnblh':
            s.query(sys_kh_share).filter(sys_kh_share.record_id==rid,sys_kh_share.to_uid==uid).delete()
            s.query(khsheet3).filter(khsheet3.kh_id==kh_id,khsheet3.module1=='客户资料',khsheet3.ywry==yhm).delete()
            s.commit()
        else:
            code = -1
            msg = '不好意思,你无权删除此记录,删除无效'

        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

async def customer_insert_khsheet3(uid_list, kh_id, khmc, pid, bm, rybh, zjl, wxzj, s, rid=''):
    try:
        for u in uid_list:
            uid = ''
            c = s.query(sys_user.rid).filter(sys_user.username==u).first()
            if c:
                uid = str(c.rid)

            d = s.query(khsheet3).filter(khsheet3.ywry==u,khsheet3.module1=='客户资料',khsheet3.father1==pid,khsheet3.objectnumber1==uid).first()
            if d:
                continue
            m = khsheet3()
            m.rid = get_uuid()
            m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
            m.kh_id = kh_id
            m.company_name = khmc
            m.ywry = u
            m.ywybh = rybh
            m.cyz = bm
            m.wyzd = str(u) + '-' + str(khmc) # rid
            m.kfsc = '可以'
            m.father1 =  pid
            m.module1 = '客户资料'
            m.objectnumber1 = uid
            m.ywry1 = u
            m.objectkind1 =  1
            m.permission1 = '读取,更改,删除'
            m.zjl = zjl
            m.wxzj = wxzj
            s.add(m)
        return {'code':1,'msg':'操作成功'}
    except:
        logger.error(trace_error())
        return {'code':-1,'msg':trace_error()}

#客户资料联系人电子邮箱校验
@any_route('/api/saier/customer/user/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_user_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        pid = j.get('rid')
        kh_id = j.get('kh_id')
        khmc = j.get('khmc')
        zjl = j.get('zjl')
        wxzj = j.get('wxzj')
        l = j.get('line')
        rid = l.get('rid')
        code = 1
        msg = '操作成功'
        yhm = l.get('ywry')
        user_list = []
        bm = ''
        rybh = ''
        d = s.query(ywrybiao.bmjl,ywrybiao.sybzj,ywrybiao.sybdzj,ywrybiao.bm,ywrybiao.rybh,sys_user.rid
            ).filter(ywrybiao.yhm==yhm).outerjoin(sys_user,sys_user.username==ywrybiao.yhm).first()
        if d:
            bmjl = str(d.bmjl)
            sybzj = str(d.sybzj)
            sybdzj = str(d.sybdzj)
            bm = str(d.bm)
            rybh = str(d.rybh)
            uid = str(d.rid)
            if yhm!='' and yhm not in user_list:
                user_list.append(yhm)
            if bmjl!='' and bmjl not in user_list:
                user_list.append(bmjl)
            if sybzj!='' and sybzj not in user_list:
                user_list.append(sybzj)
            if sybdzj!='' and sybdzj not in user_list:
                user_list.append(sybdzj)

        res = module_share_new('客户资料',user_list,pid,user,s)
        if res.get('code')!=1:
            s.rollback()
            return json_result(res.get('code'),res.get('msg'))
        res = await customer_insert_khsheet3(user_list, kh_id, khmc, pid, bm, rybh, zjl, wxzj, s, rid)
        if res.get('code')!=1:
            s.rollback()
            return json_result(res.get('code'),res.get('msg'))
        
        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#客户资料查询查看ghsb
@any_route('/api/saier/customer/fkgl/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_fkgl_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        spsq = j.get('spsq')
        khmc = j.get('khmc')
        d = s.query(chyjh).filter(chyjh.khmc==khmc).all()
        for r in d:
            r.fkgl = '是'
            s.add(r)
        if spsq!=user.username:
            row = {
                "xxly": "风控客户",
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": spsq + "风控客人:" + khmc + "请查看" + time.strftime("%Y-%m-%d"),
                "jsr": spsq,
                "sys_path": "",
                "spsq": spsq
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))
            
        s.commit() 
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料查询查看ghsb
@any_route('/api/saier/customer/fields/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_fields_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module','客户资料')
        sz = 0
        code = 0
        d = s.query(kh.khlx,kh.rid).filter(kh.rid==rid,kh.khlx=='公海客户').first()
        if d:
            code = 1
            c = run_sql(f"select xm,sz from cyzglsheet where (xm='{str(user.username)}') and (zm='公海客户')")
            if len(c)>0:
                sz = c[0].get('sz')
            s.query(kh).filter(kh.rid==rid).update({'ghzqzrq':time.strftime("%Y-%m-%d")})
            logger.error(sz)
            c = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.title.like("%申请公海转潜在客户%")).all()
            for r in c:
                x = s.query(sys_task_receiver).filter(sys_task_receiver.pid==r.rid).all()
                for l in x:
                    s.delete(l)
                s.delete(r)

        s.commit()
        return json_result(code, '操作成功', sz)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#客户资料保存后
@any_route('/api/saier/customer/ghqzzy/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_ghqzzy_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module','客户资料')
        c = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.title.like("%申请公海转潜在客户%")).all()
        for r in c:
            x = s.query(sys_task_receiver).filter(sys_task_receiver.pid==r.rid).all()
            for l in x:
                s.delete(l)
            s.delete(r)
        d = s.query(kh).filter(kh.rid==rid).first()
        if d :
            if d.khlx == '公海客户' and d.ghzqzshr!=user.username:
                return json_result(-1, '权限校验失败，只有公海转潜在审核人才能执行此操作')

            res = user_task_delete(module, rid, s, [d.ghzqzshr])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            res = user_task_new(module, rid, '客户编号', '公海转潜在退回', "客户编号:" + str(d.kh_id) + "公海转潜在退回", user, s, [d.ghzqztjr])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            
            d.ghzqztjr = ''
            d.ghzqzshr = '退回'
            s.add(d)
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 字符日期加天数算出新的日期
def add_days_to_date(date_str, days, format='%Y-%m-%d'):
    """
    将指定格式的日期字符串加上天数
    
    参数:
    date_str: 日期字符串，如 '2024-01-01'
    days: 要加的天数
    format: 日期格式，默认 '%Y-%m-%d'
    
    返回:
    新的日期字符串
    """
    # 将字符串转换为datetime对象
    date_obj = datetime.strptime(date_str, format)
    
    # 加上指定天数
    new_date = date_obj + timedelta(days=days)
    
    # 转换回字符串
    return new_date.strftime(format)


#客户资料保存后
@any_route('/api/saier/customer/khlx/change', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_khlx_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module','客户资料')
        val = j.get('khlx')  
        c = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.title.like("%申请公海转潜在客户%")).all()
        for r in c:
            x = s.query(sys_task_receiver).filter(sys_task_receiver.pid==r.rid).all()
            for l in x:
                s.delete(l)
            s.delete(r)
        d = s.query(kh).filter(kh.rid==rid).first()
        if d :
            if d.khlx != '公海客户':
                return json_result(-1, '客户类型不是公海客户，无需修改')
            if d.ghzqzshr!=user.username:
                return json_result(-1, '权限校验失败，只有公海转潜在审核人才能执行此操作')
            sz = 0
            c = run_sql(f"select xm,sz from cyzglsheet where (xm='{str(d.ghzqztjr)}') and (zm='公海客户') limit 1")
            if len(c)>0:
                sz = c[0].get('sz')
            logger.error('---------qzzghrq-bbbb--------') 
            if sz > 1:
                qzzghrq = add_days_to_date(time.strftime("%Y-%m-%d"), sz)
                logger.error('---------qzzghrq-aaaa--------') 
                logger.error(qzzghrq) 
                d.qzzghrq = qzzghrq

            d.ghzqzrq = time.strftime("%Y-%m-%d")
            res = user_task_new(module, rid, '客户编号', '公海转潜在通过', "客户编号:" + str(d.kh_id) + "公海转潜在通过", user, s, [d.ghzqztjr])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            res = user_task_delete(module, rid, s, [d.ghzqzshr])
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
            d.khlx = val
            d.ywry = d.ghzqztjr
            d.uid = get_user_path(d.ghzqztjr).get('rid')
            d.ghzqzshr = ''
            d.ghzqztjr = ''
            s.add(d)

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料保存后
@any_route('/api/saier/customer/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ywry = j.get('ywry')
        kh_id = j.get('kh_id','')
        khmc = j.get('khmc','')
        ssgs = j.get('ssgs','')
        rid = j.get('rid')
        khlx = j.get('khlx')
        sqdh = j.get('sqdh','')
        fkgl = j.get('fkgl')
        lxrb = j.get('lxrb',[])
        ywys = []
        res = customer_email_exists_check(rid, lxrb, s)
        if res.get('code')!=1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))
        uid = ''
        d = s.query(kh).filter(kh.rid==rid).first()
        if d and ywry!=str(d.ywry):
            org = get_user_path(ywry)
            # data['path'] = org.get('path')
            logger.info(f"用户路径: {org.get('uid')}")
            uid = org.get('rid')
            if uid != "":
                d.uid = uid
                s.add(d)
                c = s.query(zxtc).filter(zxtc.kh_id==kh_id).all()
                for r in c:
                    r.ywry = ywry
                    r.uid = uid
                    r.sqry = ywry
                    if sqdh!='':
                        r.sqdh = sqdh
                    s.add(r)
            
        if ssgs !="":
            c = s.query(kh.ywry).filter(kh.ssgs==ssgs).all()
            for r in c:
                if r.ywry and r.ywry not in ywys:
                    ywys.append(str(r.ywry))

            if ywry not in ywys:
                ywys.append(str(ywry))
            c = s.query(kh).filter(kh.company_name==ssgs).all()
            for r in c:
                r.ywryc = ",".join(ywys)
                s.add(r)
        if fkgl=="是" and khmc!="" and khmc!=str(d.company_name):
            row = {
                "xxly": "客户资料",
                "bjdh": kh_id,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": f"请注意客人:{d.company_name}于{time.strftime('%Y%m-%d %H:%M:%S')}改名为:{khmc}变更人:{user.username}",
                "jsr": "赵波",
                "sys_path": "",
                "spsq": ""
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))
            
        if khlx=='公海客户':
            user_list = ['侯柳红','陈妍科','周玲燕']
            u = s.query(sys_user.rid).filter(sys_user.username.in_(user_list)).all()
            uid_list = [r.rid for r in u]
            d = s.query(sys_kh_share).filter(sys_kh_share.record_id==rid,sys_kh_share.to_uid.notin_(uid_list)).all()
            for r in d:
                s.delete(r)
            
            d = s.query(khsheet3).filter(khsheet3.kh_id==kh_id,khsheet3.ywry.notin_(user_list)).all()
            for r in d:
                s.delete(r)

        s.commit()
        return json_result(1, '查询成功', {'ywys': ",".join(ywys), 'uid': uid})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料联系人电子邮箱校验
@any_route('/api/saier/customer/save/after', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_save_after(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        pid = j.get('rid')
        kh_id = j.get('kh_id')
        khmc = j.get('khmc')
        zjl = j.get('zjl')
        wxzj = j.get('wxzj')
        fkgl = j.get('fkgl')
        ywry = j.get('ywry')
        date = j.get('date')
        begin_date = j.get('begin_date')
        code = 1
        msg = '操作成功'
        yhm = j.get('ywry')
        user_list = []
        # uid_list = []
        bm = ''
        rybh = ''
        if ywry==user.username and (date==time.strftime('%Y-%m-%d') or begin_date==time.strftime('%Y-%m-%d')):
            d = s.query(ywrybiao.bmjl,ywrybiao.sybzj,ywrybiao.sybdzj,ywrybiao.bm,ywrybiao.rybh,sys_user.rid
                ).filter(ywrybiao.yhm==yhm).outerjoin(sys_user,sys_user.username==ywrybiao.yhm).first()
            if d:
                bmjl = str(d.bmjl)
                sybzj = str(d.sybzj)
                sybdzj = str(d.sybdzj)
                bm = str(d.bm)
                rybh = str(d.rybh)
                uid = str(d.rid)
                if yhm!='' and yhm not in user_list:
                    user_list.append(yhm)
                if bmjl!='' and bmjl not in user_list:
                    user_list.append(bmjl)
                if sybzj!='' and sybzj not in user_list:
                    user_list.append(sybzj)
                if sybdzj!='' and sybdzj not in user_list:
                    user_list.append(sybdzj)
            
            if '侯柳红' not in user_list:
                user_list.append('侯柳红')
            if '周玲燕' not in user_list:
                user_list.append('周玲燕')
            if '陈妍科' not in user_list:
                user_list.append('陈妍科')         

            res = module_share_new('客户资料',user_list,pid,user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'),res.get('msg'))
            res = await customer_insert_khsheet3(user_list, kh_id, khmc, pid, bm, rybh, zjl, wxzj, s, pid)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'),res.get('msg'))
            
        if fkgl=="是":
            d = s.query(kh).filter(kh.rid==pid).first()
            if d:
                fkry = d.fkry
            m = alchemy_object_to_dict(d)
            org = get_user_path(fkry)
            uid = org.get('rid')
            c = s.query(fkkh).filter(fkkh.khbh==kh_id).first()
            if not c:
                c = fkkh()
                c.rid = get_uuid()
                c.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                c.uid = uid
                c.djrq = d.kfrq
            for k,v in m.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(c,k):
                    setattr(c,k,v)
            c.ssgs = d.wfgs
            c.szbm = d.bm
            c.khbh = kh_id
            c.khmc = d.company_name
            c.khlx = d.syms
            c.ssgs1 = d.ssgs
            c.ssry = d.ywry
            c.shr = d.shr
            c.ckqx = '有'
            s.add(c)
        else:
            c = s.query(fkkh).filter(fkkh.khbh==kh_id).first()
            if c:
                c.uid = ''
                c.ckqx = '无'
                s.add(c)

        s.commit()
        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料公海潜在转移申请
@any_route('/api/saier/customer/get/ghkh/user', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_get_ghkh_user(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        c = s.query(cyzglsheet.xm).filter(cyzglsheet.zm=='公海客户').all()
        data = [r.xm for r in c]

        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#客户资料公海潜在转移申请
@any_route('/api/saier/customer/do/trans', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_do_trans(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        val = j.get('val')
        module = j.get('module','客户资料')
        c = s.query(kh).filter(kh.rid==rid).first()
        if c:
            c.ghzqztjr = user.username
            c.ghzqzshr = val
            s.add(c)
        kh_id = c.kh_id
        row = {
            "xxly": module,
            "bjdh": '',
            "wxht": '',
            "cght": '',
            "yhdh": '',
            "xxnr": "客户编号:" + kh_id + "申请公海转潜在客户,业务人员" + user.username,
            "jsr": val,
            "sys_path": "",
            "spsq": user.username
        }
        res = module_xxck_new([row],user,s)
        if res.get('code')!=1:
            return json_result(res.get('code'), res.get('code'))

        res = user_task_new(module, rid, '客户编号', '申请公海转潜在客户', "客户编号:" + kh_id + "申请公海转潜在客户,业务人员" + user.username, user, s, [val])
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


#客户资料潜在转公海按钮
@any_route('/api/saier/customer/trans/ghkh', methods=['POST', 'GET'])
@require_token
async def view_saier_customer_trans_ghkh(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module','客户资料')
        c = s.query(kh).filter(kh.rid==rid).first()
        if not c:
            return json_result(-1, '未选中或找到客户资料记录')
        mgr = 0
        uid = c.uid
        ywry = get_user_path(uid).get('username')
        if ywry!=user.username:
            d = s.query(ywrybiao.bmjl,ywrybiao.sybzj,ywrybiao.sybdzj).filter(ywrybiao.yhm==ywry).first()
            if user.username not in [str(d.bmjl),str(d.sybzj),str(d.sybdzj)] and user.username not in ['侯柳红','陈妍科','周玲燕']:
                return json_result(-1, '权限校验失败，只有业务人员或部门经理或总监才能执行此操作')
            mgr = 1
        if c.khlx == '公海客户':
            return json_result(-1, '客户类型已经是公海客户，无需修改')
        if c.khlx == '合作客户' and mgr==0:
            return json_result(-1, '合作客户只有部门经理或总监才能转公海')
        c.modi_uid = user.rid
        c.qzzghrq = time.strftime("%Y-%m-%d")
        c.mtime = time.strftime("%Y-%m-%d %H:%M:%S")
        c.ywry = ''
        c.khlx = '公海客户'
        s.add(c)
        if user.username != ywry:
            kh_id = c.kh_id
            row = {
                "xxly": module,
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": "客户编号:" + kh_id + "已转入公海客户,转移用户:" + user.username + ",日期:" + time.strftime("%Y-%m-%d"),
                "jsr": ywry,
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))

            res = user_task_new(module, rid, '客户编号', "客户编号:" + kh_id + '已转入公海客户', "客户编号:" + kh_id + "已转入公海客户,转移用户:" + user.username + ",日期:" + time.strftime("%Y-%m-%d"), user, s, [ywry])
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