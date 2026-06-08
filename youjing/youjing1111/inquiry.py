from datetime import date
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

#业务询价编辑界面加载
@any_route('/api/saier/inquiry/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        yhm = j.get('yhm','')
        bm = j.get('bm','')
        # fssb = j.get('fssb','是')
        rid = j.get('rid','')
        bmjl = j.get('bmjl','')
        sybzj = j.get('sybzj','')
        xjcg_data = [] # j.get('xjcg_data',[])
        xjcg_visible = False
        # xjcg1_visible = False
        
        zxjsb = 0
        xjsb1 = 0
        data_bm = ""
        data_bmjl = ""
        data_sybzj = ""
        new_data = []
        i = 0
        i1 = 0
        i2 = 0
        d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(yhm)}') and ((bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}'))")
        if len(d)>0:
            zxjsb = 1
            logger.error(f'{user.username} 1111')
        if (yhm==user.username or bmjl==user.username or sybzj==user.username or '侯柳红'==user.username or '周玲燕'==user.username or zxjsb==1):
            xjcg_visible = True
            logger.error(f'{user.username} aaa')
        else:
            xjcg_data = run_sql(f"select bjry,bmjl,sybzj,cgbm,zgxz,zjxz,bjdh,sfbj,pid from khxjsheet1 where pid='{rid}' and \
                (bmjl='{str(user.username)}' or sybzj='{str(user.username)}' or sybdzj='{str(user.username)}')")
            for row in xjcg_data:
                # xjsb = 0
                # d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(row.get('bjry',''))}') and ((bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}'))")
                # if len(d)>0:
                #     i2 = i2 + 1
                if (row.get('bmjl','')==user.username and row.get('zgxz','')=='是') or (row.get('sybzj','')==user.username and row.get('zjxz','')=='是') :
                    i1 = i1 + 1
                    logger.error(f'{user.username} 2222')
                if row.get('bmjl','')==user.username or row.get('sybzj','')==user.username or zxjsb == 1 :
                    i2 = i2 + 1
                    logger.error(f'{user.username} 4444')
                if i2==0 and row.get('bjry','') != '' and row.get('bjry','') != None:
                    d = run_sql(f"select bm,bmjl,sybzj from ywrybiao where (bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}')")
                    if len(d)>0:
                        i2 = i2 + 1
            if i2 > 0:
                logger.error(f'{user.username} bbb')
                xjcg_visible = True
            
        if yhm == '' or bm == '' :
            d = run_sql(f"select bm,bmjl,sybzj from ywrybiao where (yhm='{str(user.username)}')")
            if len(d)>0:
                data_bm = d[0].get('bm','')
                data_bmjl = d[0].get('bmjl','')
                data_sybzj = d[0].get('sybzj','')
        else:
            for row in xjcg_data:
                i= i + 1
                d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(row.get('bjry',''))}') and ((bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}'))")
                if len(d)>0:
                    xjsb1 = 1

                if row.get('bjry','')==user.username or row.get('bmjl','')==user.username or row.get('sybzj','')==user.username or xjsb1==1:
                    new_json={}
                    new_json['rid'] = get_uuid()
                    new_json['pid'] = row.get('pid','')
                    new_json["uid"] = user.rid
                    new_json['ctime'] = time.strftime('%Y-%m-%d %H:%M:%S')
                    new_json['mtime'] = time.strftime('%Y-%m-%d %H:%M:%S')
                    new_json['Field1'] = row.get('bmjl','')
                    new_json['Field16'] = "是"
                    new_json['Field2'] = row.get('sybzj','')
                    new_json['Field13'] = row.get('cgbm','')
                    new_json['Field14'] = row.get('zgxz','')
                    new_json['Field15'] = row.get('zjxz','')
                    new_json['Field'] = row.get('bjry','')
                    new_json['Field11'] = row.get('bjdh','')
                    new_json['Field10'] = row.get('sfbj','')
                    
                    new_data.append(new_json)
            
        data = {
            'xjcg_visible': xjcg_visible,
            # 'xjcg1_visible': xjcg1_visible,
            'data_bm': data_bm,
            'data_bmjl': data_bmjl,
            'data_sybzj': data_sybzj,
            'new_data': new_data,
            "i1": i1,
            "i2": i2,
            "i" : i
        }
            
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#业务询价取消询价校验
@any_route('/api/saier/inquiry/cancel/check', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_cancel_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        xj_dh = j.get('xj_dh','')
        rid = j.get('rid','')
        ywry = j.get('ywry','')
        module = j.get('module','业务询价')   
        d = s.query(bj.bj_id).filter(bj.xj_dh==xj_dh).first()
        if d:
            return json_result(-1, '此询价单已有对应客户报价，不能取消询价')
        d = s.query(cgbj.bj_id).filter(cgbj.xj_dh==xj_dh).first()
        if d:
            return json_result(-1, '此询价单已有对应采购报价，不能取消询价')        
        s.query(sys_khxj_share).filter(sys_khxj_share.record_id==rid).delete()

        d =s.query(khxjsheet1).filter(khxjsheet1.pid==rid).all()
        for r in d:
            row = {
                "xxly": module,
                "bjdh": xj_dh,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": str(ywry) + "的询价取消,询盘单号为" + str(xj_dh),
                "jsr": str(r.bjry),
                "sys_path": "",
                "spsq": ywry
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                return json_result(res.get('code'), res.get('code'))
            s.delete(r)
        s.query(khxj).filter(khxj.rid==rid).update({'qxxj':'是'})

        s.commit()
        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#业务询价取消询价校验
@any_route('/api/saier/inquiry/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        xj_dh = j.get('xj_dh','')
        rid = j.get('rid','')
        ywry = j.get('ywry','')
        jzrq = j.get('jzrq','')
        lines = j.get('lines',[])
        module = j.get('module','业务询价')   
        flag = 0
        user_list = []
        # 校验报价人员是否存在重复记录，校验报价人员是否在业务人员表中存在，不存在则提示错误
        users = []
        # if xj_dh==None or xj_dh=='':
        #     return json_result(0, '询价单号为空不执行')
        for r in lines:
            # if r.get('fssb','')=='是':
            #     continue
            if r.get('bjry','')!= None and r.get('bjry','')!='' and r.get('bjry') in users:
                return json_result(-1, '询价采购列表里面有重复报价人员:' + str(r.get('bjry','')))
            users.append(r.get('bjry',''))
            if r.get('bjry','')!= None and r.get('bjry','')!='' and r.get('bjry') not in user_list:
                d = run_sql(f"select rid from khxjsheet1 where (bjry='{str(r.get('bjry',''))} ') and pid='{rid}' and rid !='{r.get('rid','')}' limit 1")
                if len(d)>0:
                    return json_result(-1, '询价单里面有重复报价人员:' + str(r.get('bjry','')))
                user_list.append(r.get('bjry','')) 
                d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(r.get('bjry',''))}')")
                if len(d)==0:
                    return json_result(-1, '业务人员表未找到报价人员记录')
            
            # if r.get('bmjl','')!= None and r.get('bmjl','')!='' and r.get('bmjl') not in user_list:
            #     user_list.append(r.get('bmjl',''))
            # if r.get('sybzj','')!= None and r.get('sybzj','')!='' and r.get('sybzj') not in user_list:
            #     user_list.append(r.get('sybzj',''))
            # if r.get('sybdzj','')!= None and r.get('sybdzj','')!='' and r.get('sybdzj') not in user_list:
            #     user_list.append(r.get('sybdzj',''))  
            # if r.get('bjry','')!= None and r.get('bjry','')!='' and r.get('bjry') not in user_list:
            #     user_list.append(r.get('bjry',''))
        
        # for u in user_list:
        #     row = {
        #         "xxly": module,
        #         "bjdh": xj_dh,
        #         "wxht": '',
        #         "cght": '',
        #         "yhdh": '',
        #         "xxnr": str(ywry) + '的询盘单号:' + str(xj_dh) + '请' + str(u) + '报价,日期:' + time.strftime('%Y-%m-%d %H:%M:%S') + ';截止日期:' + str(jzrq),
        #         "jsr": str(u),
        #         "sys_path": "",
        #         "spsq": ywry
        #     }
        #     flag = 1
        #     res = await module_xxck_new([row],user,s)
        #     if res.get('code')!=1:
        #         s.rollback()
        #         return json_result(res.get('code'), res.get('code'))

        # res = await module_share_new('业务询价',user_list,rid,user,s)
        # if res.get('code')!=1:
        #     s.rollback()
        #     return json_result(res.get('code'),res.get('msg'))
        
        # s.commit()
        return json_result(1, '操作成功', flag)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#业务询价取消询价校验
@any_route('/api/saier/inquiry/save/after', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_save_after(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bmjl = j.get('bmjl','')
        rid = j.get('rid','')
        ywry = j.get('ywry','')
        sybzj = j.get('sybzj','')
        xj_dh = j.get('xj_dh','')
        jzrq = j.get('jzrq','')
        kh_id = j.get('kh_id','')
        wxbm = j.get('wxbm','')
        khlx = j.get('khlx','')
        dateis = j.get('dateis','')
        module = j.get('module','业务询价')   
        flag = 0
        user_list = []
        message_user = []
        user_json = {}
        c = s.query(khxjsheet1).filter(khxjsheet1.pid==rid).all()
        lines = alchemy_object_list_to_dict(c)
        if len(lines)==0:
            s.query(sys_khxj_share).filter(sys_khxj_share.record_id==rid).delete()
            s.commit()
            return json_result(1, '操作成功')
        
        for row in lines:
            if row.get('bjry','') not in user_json:
                d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(row.get('bjry',''))}')")
                if len(d)==0:
                    return json_result(-1, '业务人员表未找到报价人员记录')
                user_json[row.get('bjry','')] = d[0]
                org = get_user_path(row.get('bjry',''))
                uid = org.get('rid','')
                if uid == None or uid == '':
                    return json_result(-1, '未找到报价人员的用户信息')
                user_json[row.get('bjry','')]['uid'] = uid

            u = user_json.get(row.get('bjry',''))
            if u.get('bmjl','')!= None and u.get('bmjl','')!='' and u.get('bmjl') not in user_list:
                user_list.append(u.get('bmjl',''))
            if u.get('sybzj','')!= None and u.get('sybzj','')!='' and u.get('sybzj') not in user_list:
                user_list.append(u.get('sybzj',''))
            if u.get('sybdzj','')!= None and u.get('sybdzj','')!='' and u.get('sybdzj') not in user_list:
                user_list.append(u.get('sybdzj',''))  
            if  row.get('bjry','')!= None and row.get('bjry','')!='' and row.get('bjry','') not in user_list:
                user_list.append(row.get('bjry',''))
            if row.get('xj_dh') == '' or row.get('xj_dh') == None or row.get('fssb') == '' or row.get('fssb') == None:
                s.query(khxjsheet1).filter(khxjsheet1.pid==rid,khxjsheet1.rid==row.get('rid','')
                    ).update({'fssb':'是','xj_dh': xj_dh, 'dateis': dateis, 'khlx': khlx,
                    'kh_id':kh_id, 'jzrq': jzrq, 'ywry': ywry, 'wxbm': wxbm, 'uid': u.get('uid')}, synchronize_session=False)
                
            if row.get('fssb','')=='是':
                continue
            if u.get('bmjl','')!= None and u.get('bmjl','')!='' and u.get('bmjl') not in message_user:
                message_user.append(u.get('bmjl',''))
            if u.get('sybzj','')!= None and u.get('sybzj','')!='' and u.get('sybzj') not in message_user:
                message_user.append(u.get('sybzj',''))
            if u.get('sybdzj','')!= None and u.get('sybdzj','')!='' and u.get('sybdzj') not in message_user:
                message_user.append(u.get('sybdzj',''))  
            if row.get('bjry','')!= None and row.get('bjry','')!='' and row.get('bjry') not in message_user:
                message_user.append(row.get('bjry',''))
            
        if bmjl!= None and bmjl!='' and bmjl not in user_list:
            user_list.append(bmjl)
        if sybzj!= None and sybzj!='' and sybzj not in user_list:
            user_list.append(sybzj)
        if ywry!= None and ywry!='' and ywry not in user_list:
            user_list.append(ywry)
        if '侯柳红' not in user_list:
            user_list.append('侯柳红')
        if '周玲燕' not in user_list:
            user_list.append('周玲燕')
        res = module_share_new('业务询价',user_list,rid,user,s)
        if res.get('code')!=1:
            s.rollback()
            return json_result(res.get('code'),res.get('msg'))
        for u in message_user:
            row = {
                "xxly": module,
                "bjdh": xj_dh,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": str(ywry) + '的询盘单号:' + str(xj_dh) + '请' + str(u) + '报价,日期:' + time.strftime('%Y-%m-%d %H:%M:%S') + ';截止日期:' + str(jzrq),
                "jsr": str(u),
                "sys_path": "",
                "spsq": ywry
            }
            flag = 1
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))
        if flag == 1:
            s.query(khxj).filter(khxj.rid==rid).update({'xpfb':'是'}, synchronize_session=False)
        logger.error(f'user_json{user_json}' )
        for r in c:
            u = user_json.get(r.bjry)
            if u and r.uid != u.get('uid'):
                r.uid = u.get('uid')
                s.add(r)
        s.commit()
        return json_result(1, '操作成功', flag)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()



#业务询价取消询价校验
@any_route('/api/saier/inquiry/purchase/quotation', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_purchase_quotation(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        xj_dh = j.get('xj_dh','')
        rid = j.get('rid','')
        ywry = j.get('ywry','')
        jzrq = j.get('jzrq','')
        xjcgrid = j.get('xjcgrid','')
        lines = j.get('lines',[])
        module = j.get('module','业务询价')
        if  jzrq[:10] < time.strftime('%Y-%m-%d'):
            return json_result(-1, '不好意思,该询价已过截止日期')
        
        bmjl = ''
        sybzj = ''
        # bm = ''
        # wfgs_n = ''
        bj_id = xj_dh + '-' + time.strftime('%Y%m%d%H%M%S')
        d = run_sql(f"select sybzj,bmjl,sybdzj,wfgs,bm from ywrybiao where (yhm='{str(user.username)}')")
        if len(d)>0:
            bmjl = d[0].get('bmjl','')
            sybzj = d[0].get('sybzj','')
        #     bm = d[0].get('bm','')
        m = s.query(khxj).filter(khxj.rid==rid).first()
        if not m:
            return json_result(-1, '未找到对应业务询价记录')
        m = alchemy_object_to_dict(m)
        msg = '接单成功'
        pid_list = []
        pid = get_uuid()
        d = None
        c = s.query(cgbj).filter(cgbj.xj_dh==xj_dh, cgbj.bjry==user.username).order_by(cgbj.sid.desc()).all()
        for r in c:
            pid_list.append(r.rid)
            if r.wf_status==2 or r.wf_status==1:
                msg = '当前业务询价采购人员已经接单,且已启动审批或审批通过，已新生成一个采购报价'
            else:
                if not d:
                    d = r
                    pid = r.rid
                msg = '当前业务询价采购人员已有接单产品，已在原采购报价里面添加了新产品'

        if not d:
            d = cgbj()
            d.rid = pid
            d.bj_id = bj_id
            d.uid = user.rid
            d.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            
        for k,v in m.items():
            if k in SYS_FIELDS:
                continue
            if hasattr(d, k):
                setattr(d, k, v)
        d.hbdm = 'RMB'
        d.xj_dh = xj_dh
        d.bjrq = time.strftime('%Y-%m-%d')
        d.bmjl = bmjl
        d.sybzj = sybzj
        d.bjry = user.username
        d.ywry = m.get('bjry', '')
        d.xjcgrid = xjcgrid
        s.add(d)
        flag = 0
        old_pid = ''
        for row in lines:
            c = s.query(cgbjsheet).filter(cgbjsheet.xjcprid==row.get('rid'), cgbjsheet.pid.in_(pid_list)).first()
            if c:
                old_pid = c.pid
                msg = '当前业务询价采购人员已有接单产品，在原采购报价里面添加了新产品'
                continue
            flag = 1
            c = cgbjsheet()
            for k,v in row.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(c, k):
                    setattr(c, k, v)

            c.rid = get_uuid()
            c.pid = pid
            c.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            c.uid = user.rid
            c.xjcprid = row.get('rid','')
            c.cghbdm = 'RMB'
            s.add(c)
        if flag == 0:
            return json_result(2, '选中产品都已接过单,请勿重复接单', old_pid)
        
        if flag == 1:
            c = s.query(khxjsheet1).filter(khxjsheet1.bjry==user.username, khxjsheet1.pid==rid).all()
            for r in c:
                r.bjdh = bj_id
                r.sfbj = '是'
                s.add(r)

            row = {
                "xxly": module,
                "bjdh": xj_dh,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": '业务询价:' + str(xj_dh) + '已由' + str(user.username) + '准备报价,时间:' + time.strftime('%Y-%m-%d %H:%M:%S'),
                "jsr": str(ywry),
                "sys_path": "",
                "spsq": user.username
            }
            res = module_xxck_new([row],user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'), res.get('code'))
        
        s.commit()
        return json_result(1, msg, pid)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#业务询价取消询价校验
@any_route('/api/saier/inquiry/cgry/change', methods=['POST', 'GET'])
@require_token
async def view_saier_inquiry_cgry_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        cgry = j.get('cgry','')
        data = {}
        lines = j.get('询价采购2',[])   
        index = 0
        flag = 0

        d = s.query(khxjsheet1.rid).filter(khxjsheet1.pid==rid,khxjsheet1.bjry==cgry).first()
        if d:
            flag = 1
        if flag==0:
            for row in lines:
                if (row.get('bmjl','')==user.username and row.get('Field14','')=='是') or (row.get('Field2','')==user.username and row.get('Field15','')=='是') :
                    index += 1
                if cgry == row.get('bjry',''):
                    flag = 1

        if flag==0 and index<2:
            d = run_sql(f"select sybzj,bmjl,sybdzj from ywrybiao where (yhm='{str(cgry)}') and ((bmjl='{str(user.username)}') or (sybzj='{str(user.username)}') or (sybdzj='{str(user.username)}')) limit 1")
            if len(d)>0:
                data = d[0]

        return json_result(1, '操作成功', {'data':data, 'index':index, 'flag':flag})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
