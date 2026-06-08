
from ast import mod
from calendar import c
from dataclasses import field, fields
from math import log, pi
from any import *
from .model import *
import json,time,re

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

# 获取模块编辑界面字段必填、显示设置模块对应的条件字段
@any_route('/api/saier/get/module/field/key', methods=['POST', 'GET'])
@require_token
async def api_saier_get_module_field_key(request):
    s=Session()
    j = await request.json()
    try:
        field = ''
        kind = j.get('kind','显示')
        module = j.get('module','专业产品')
        if kind == '必填':
            d = s.query(btsz.tjzd).filter(btsz.mkmc==module,btsz.sfqy==1).first()
        else:
            d = s.query(xssz.tjzd).filter(xssz.mkmc==module,xssz.sfqy==1).first()
        if d:
            field = str(d.tjzd)

        return json_result(1, '取数成功', field)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass

# 获取模块编辑界面字段组或字段显示、只读的设置
@any_route('/api/saier/get/module/field/view_attr', methods=['POST', 'GET'])
@require_token
async def api_saier_get_module_field_view_attr(request):
    s=Session()
    j = await request.json()
    try:
        module = j.get('module')
        field = j.get('field')
        value = j.get('value')
        data = []
        d = s.query(xsszzdmx).filter(xssz.tjzd==field,xssz.mkmc==module,xssz.tjnr==value,xssz.sfqy==1).outerjoin(xssz,xsszzdmx.pid==xssz.rid).all()
        if d:
            data = alchemy_object_list_to_dict(d)

        return json_result(1, '取数成功', data)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 获取模块编辑界面字段组或字段必填项设置
@any_route('/api/saier/get/module/field/check_attr', methods=['POST', 'GET'])
@require_token
async def api_saier_get_module_field_check_attr(request):
    s=Session()
    j = await request.json()
    try:
        data_json = {}
        user = request.current_user
        module = j.get('module')
        field = j.get('field')
        value = j.get('value')
        d = s.query(btszzdmx).filter(btsz.tjzd==field,btsz.tjnr==value,btsz.mkmc==module,btsz.sfqy==1).outerjoin(btsz,btszzdmx.pid==btsz.rid).all()
        if d:
            d = alchemy_object_list_to_dict(d)
            for r in d:
                group_name = r.get('zdzm')
                if r.get('sfzb')==0:
                    group_name = module
                if not group_name in data_json.keys():
                    data_json[group_name]={'is_table':r.get('sfzb',0),'fields':[{'name':r.get('bzdm'),'caption':r.get('zdmc'),'group':r.get('zdzm'),'sjlx':r.get('sjlx')}]}
                else:
                    data_json[group_name]['fields'].append({'name':r.get('bzdm'),'caption':r.get('zdmc'),'group':r.get('zdzm'),'sjlx':r.get('sjlx')})
        
        return json_result(1, '取数成功', data_json)
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


def module_share_new(module, to_users, record_id, user, s, old_users=[]):
    try:
        o = get_module(module)
        uid_list = []
        table = get_model_by_table_name(str('sys_')+o.table_name+str('_share'))
        user_list=[]
        for user_row in to_users:
            d = s.query(sys_user.rid).filter(sys_user.username==user_row).first()
            if d and not str(d.rid) in uid_list:
                uid_list.append(str(d.rid))
        logger.error(uid_list)
        if len(uid_list)==0:
            return {'code':1, 'msg':'分享人员为空,无须处理'}
        
        for uid in uid_list:
            d = s.query(table).filter(table.record_id==record_id,table.to_uid==uid).first()
            if d:
                continue
            m = table()
            m.rid = get_uuid()
            m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
            m.strategy = '[1041, 1030, 1025, 1020, 1021, 1022]'
            m.record_id = record_id
            m.from_uid = user.rid
            m.to_uid = uid
            s.add(m)
        for old_user in old_users:
            if not old_user in to_users:
                u = s.query(sys_user.rid).filter(sys_user.username==old_user).first()
                if u:
                    d = s.query(table).filter(table.record_id==record_id,table.to_uid==u.rid).first()
                    if d:
                        s.delete(d)

        return {'code':1, 'msg':'操作成功', 'user_list':user_list}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    
def module_xxck_new(data, user, s):
    try:
        for r in data:
            uid = ''
            path = ''
            spsq = r.get('spsq','')
            if spsq=='' or spsq == None:
                spsq = r.get('jsr')
            d = run_sql(f"select sys_user.rid,sys_user.path from sys_user where sys_user.username='{spsq}' limit 1")
            if len(d)>0:
                uid = str(d[0].get('rid'))
                path = str(d[0].get('path'))
            m = xxck()
            for k,v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m,k):
                    setattr(m,k,v)
            m.rid = get_uuid()
            m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
            m.uid = uid
            m.sys_path = path
            m.sys_owner = spsq
            m.fsrq = time.strftime("%Y-%m-%d")
            m.fsr = user.username
            s.add(m)

        return {'code':1, 'msg':'操作成功'}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    

def get_user_path(username, where_str=''):
    try:
        res = {}
        res['path']=''
        res['rid']=''
        oid = ''
        res['empty'] = False
        d = run_sql(f"select * from sys_user where (username='{username}' or rid='{username}') {where_str} limit 1")
        if len(d)>0:
            oid = d[0].get('oid')
            res=d[0]
        else:
            res['empty'] = True
        logger.error(res)
        logger.error(oid)
        if oid == "":
            res['path'] = ''
            return res
        path = organizations.get_org_name_path(oid)
        if path == None:
            res['path'] = ''
            return res
        if res.get('path')==None:
            res['path'] = ''
        if res.get('rid')==None:
            res['rid'] = ''
            res['uid'] = ''
        if (res.get('position') == None or res.get('position') == '') and res.get('memo') != '' and res.get('memo') != None:
            res['position'] = res.get('memo')
        res['uid'] = res['rid']
        res['path'] = path[:100]

        return res
    except:
        return {'path':'','rid':'','position':''}

# 获取正文或者标题里面的有[]字段参数
def get_field_params(text):
    """
    提取字符串中所有方括号[]中的内容
    """
    pattern = r"\[(.*?)\]"
    return re.findall(pattern, text)

# 创建用户看板上显示的任务
def user_task_new(module, rid, key_field, title, content, user, s, to_list=[], delete=False):
    try:
        key_no = ''
        t = get_module(module)
        o = get_model_by_table_name(t.table_name)
        d = s.query(o).filter(o.rid == rid).first()
        r = alchemy_object_to_dict(d)
        f = t.field_by_full_name(module+'.'+key_field)
        if f:
            key_no = r.get(f.db.name)
        l = get_field_params(title)
        logger.error(l)
        for k in l:
            if t.field_by_full_name(module+'.'+k):
                f = t.field_by_full_name(module+'.'+k)
                if f and r.get(f.db.name) != None:
                    v = r.get(f.db.name)
                    title = title.replace(f"[{k}]", v)
        l = get_field_params(content)
        logger.error(l)
        for k in l:
            if t.field_by_full_name(module+'.'+k):
                f = t.field_by_full_name(module+'.'+k)
                if f and r.get(f.db.name) != None:
                    v = r.get(f.db.name)
                    content = content.replace(f"[{k}]", v)
            
        c_rid = get_uuid()
        m = sys_task()
        m.module = module
        m.pid = rid
        m.title = title
        m.content = content
        m.uid = user.rid
        m.kind = 0
        m.status = 0
        m.deadline = time.strftime('%Y-%m-%d %H:%M:%S')
        m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
        m.rid = c_rid
        s.add(m)
        for r in to_list:
            u = s.query(sys_user.rid).filter(
                or_(sys_user.username == r, sys_user.rid == r)).first()
            if not u:
                return {"code": -1, "msg": f"未找到用户【{r}】信息"}
            if delete:
                d = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.title.like('%转专业工厂申请%'),sys_task.rid!=c_rid, sys_task.status==0).all()
                for r in d:
                    c = s.query(sys_task_receiver).filter(sys_task_receiver.pid == r.rid, sys_task_receiver.uid == u.rid, sys_task_receiver.status == 0).all()
                    if c:
                        for cr in c:
                            cr.status = 1
                            s.add(cr)
                        r.status = 1
                        s.add(r)

            c = sys_task_receiver()
            c.rid = get_uuid()
            c.pid = c_rid
            c.uid = str(u.rid)
            c.status = 0
            c.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(c)

        return {'code': 1, 'msg': '操作成功', 'title': title, 'key_no': key_no}
    except Exception as e:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}
    

# 创建用户看板上显示的任务
def user_task_delete(module, rid, s, to_list=[], title=''):
    try:
        filters = []
        if title != '':
            filters.append(sys_task.title.like('%'+title+'%'))
        if len(to_list) == 0:
            d = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.status==0,*filters).all()
            for r in d:
                c = s.query(sys_task_receiver).filter(sys_task_receiver.pid == r.rid, sys_task_receiver.status == 0).all()
                if len(c)>0:
                    for cr in c:
                        cr.status = 1
                        s.add(cr)
                    r.status = 1
        else:
            for r in to_list:
                u = s.query(sys_user.rid).filter(or_(sys_user.username == r, sys_user.rid == r)).first()
                if u:
                    d = s.query(sys_task).filter(sys_task.module==module,sys_task.pid==rid,sys_task.status==0,*filters).all()
                    for r in d:
                        c = s.query(sys_task_receiver).filter(sys_task_receiver.pid == r.rid, sys_task_receiver.uid == u.rid, sys_task_receiver.status == 0).all()
                        if len(c)>0:
                            for cr in c:
                                cr.status = 1
                                s.add(cr)
                            r.status = 1
        
        return {'code': 1, 'msg': '操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}
    
# 获取模块记录审批状态
@any_route('/api/saier/workflow/checked', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_checked(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        module = j.get('module')
        rid = j.get('rid')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t.wf_status,t.uid).filter(t.rid==rid).first()
        if d and d.wf_status == 2 and str(d.uid) == str(user.rid):
            return json_result(-1, '该记录已通过审批，不能进行此操作')

        return json_result(1, '取数成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 工作流启动
def module_workflow_start(self, instance):
    s = Session()
    try:
        modules = ['采购报价']
        if not self.module in modules:
            return
        bjry = ''
        xj_dh = ''
        bj_id = ''
        rid = self.record_id
        d = s.query(cgbj.bjry,cgbj.xj_dh,cgbj.bj_id).filter(cgbj.rid==rid).first()
        if d:
            bjry = str(d.bjry)
            xj_dh = str(d.xj_dh)
            bj_id = str(d.bj_id)

        if bjry == '':
            return json_result(-1, '操作失败,未找到采购人员信息')

        d = s.query(cgbjsheet).filter(cgbjsheet.pid==rid).all()
        for r in d:
            if r.sfhs == '否':
                r.zzsl = 0
                r.tsl = 0
                s.add(r)
            c = s.query(khxjsheet).filter(khxjsheet.rid==r.xjcprid,func.ifnull(khxjsheet.sfbj,'')!='是').first()
            if c:
                c.sfbj = '是'
                c.bjry = bjry
                s.add(c)
        c = s.query(khxjsheet1).filter(khxj.xj_dh==xj_dh,khxjsheet1.bjry==bjry,func.ifnull(khxjsheet1.sfbj,'')!='是').outerjoin(khxj,khxj.rid==khxjsheet1.pid).first()
        if c:
            c.sfbj = '是'
            c.bjdh = bj_id
            s.add(c)

        s.commit()
        return json_result(1,'操作成功')
    except:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1,trace_error())
    finally:
        s.close()
add_event(WORKFLOW_START, module_workflow_start)


# 取消工作流后重新启动工作流
@any_route('/api/saier/workflow/cancel', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_cancel(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        module = j.get('module')
        rid = j.get('rid')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t.wf_status,t.uid).filter(t.rid==rid).first()
        if d and d.wf_status != 2:
            return json_result(-1, '该记录未通过审批，不能进行此操作')
        if not cancel_workflow_instance(module, rid, user):
            return json_result(-1, ERR_OPERATE)

        name = j.get('name','专业工厂')
        memo = j.get('memo','')
        if is_none(module,rid):
            return json_result(ERR_PARAM_NOT_ENOUGH)

        # has_right = True
        # if not user.can(ROLE_WORKFLOW_START,module):
        #     has_right =False
        # if not has_right:
        #     has_right = get_module_record_user_id(module,record_id)
        # if not has_right:
        #     return json_result(ERR_USER_HAS_NO_RIGHT)

        if module_record_has_processing_workflow(module,rid):
            return json_result(-1,'已启动工作流')
        wf_define = get_module_workflow_define(module,name)
        wf = WorkFlowInstance(user)
        wf.memo = memo
        wf._flow_memo = memo
        wf.load_from_define(data = wf_define.data)
        if not wf.new_instance(rid):
            return json_result(-1,msg=wf.stop_msg)
        await wf.send_notify_to_user()
        SystemLog.insert(SL_WORKFLOW_START,user,module=module,pid=wf.rid,title=wf._title)
        return json_result(1, '操作成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 工作流启动前检查
def module_workflow_start_check(module, cs_id, kind, s):
    try:
        o = get_module('工厂审批')
        t = get_model_by_table_name(o.table_name)
        d = s.query(t.wf_status,t.uid,t.ycsq).filter(t.cs_id==cs_id, t.splx==kind, t.gclx==module).order_by(t.sid.desc()).first()
        if d and d.wf_status == 1:
            return {'code':-1, 'msg':'该记录已有审批中的记录，不能进行此操作'}
        
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}

# 取工厂审批的审批用户
def supplier_get_audit_user_list(sqry, ycsq, kind='认证申请'):
    if ycsq != '' and ycsq != None and kind == '认证申请':
        return [ycsq]
    org  = get_user_path(sqry)
    path = org.get('path','')
    pathch = path.replace('\\','_')
    sp_list = []
    c = run_sql(f"select xm from cyzglsheet where (zm='黑 名 单') and ('{pathch}' like concat('%', replace(bz,'\\\\','_'), '%'))")
    logger.error(c)
    for r in c:
        sp_list.append(str(r.get('xm')))
    if len(sp_list)==0:
        return []

    return sp_list

# 取工厂审批的审批结束通知用户
def supplier_get_notice_user_list(sqry, rzry, kind='认证申请'):
    user_list = [sqry]
    if rzry != '' and rzry != None and kind == '认证申请':
        user_list.append(rzry)
    return user_list

# 工作流启动前检查
def module_workflow_start_new(module, rid, kind, user, s):
    try:
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.rid==rid).first()
        if not d:
            return {'code':-1, 'msg':'未找到记录信息，不能进行此操作'}
        if (d.ycsq == '' or d.ycsq == None) and kind == '认证申请':
            return {'code':-1, 'msg':'认证申请用户为空，不能进行此操作'}
        if kind == '加分申请' and d.hzdj1 != None and  float(d.hzdj1) >= 60:
            return {'code':-1, 'msg':'加分申请的当前综合分数已达60分，不能进行此操作'}
        # if str(d.shsq) != '' and str(d.shsq) != None:
        #     return {'code':-1, 'msg':'该记录已提交过申请，不能进行此操作'}
        cs_id = d.cs_id
        res = module_workflow_start_check(module, cs_id, kind, s)
        if res.get('code') != 1:
            return res
        # org  = get_user_path(user.username)
        # path = org.get('path','')
        # pathch = path.replace('\\','_')
        sp_list = []
        sfqr = '否'
        rzry = ''
        # if kind == '工厂审批':
            # c = run_sql(f"select xm from cyzglsheet where (zm='黑 名 单') and ('{pathch}' like concat('%', replace(bz,'\\\\','_'), '%')) limit 1")
            # logger.error(c)
            # for r in c:
            #     sp_list.append(str(r.get('xm')))
        sp_list = supplier_get_audit_user_list(user.username,str(d.ycsq),kind)
        if len(sp_list) == 0:
            return {'code':-1, 'msg':'未找到审批人员信息，不能进行此操作'}
        # else:
        #     sp_list.append(str(d.ycsq))

        if len(sp_list)==0:
            return {'code':-1, 'msg':'未找到审批人员信息，不能进行此操作'}
        data = alchemy_object_to_dict(d)
        o = gcsp()
        for k,v in data.items():
            if k in SYS_FIELDS:
                continue
            if k == 'shjg' or k == 'shr' or k == 'sfqr' or k == 'rzry' or k == 'rzrq':
                continue
            if kind == '认证申请' and (k == 'ewfz' or k== 'hzdj1'):
                continue
            if hasattr(o,k):
                setattr(o,k,v)
        
        o.rid = get_uuid()
        o.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
        o.uid = user.rid
        o.gclx = module
        o.spyh = ';'.join(sp_list)
        o.splx = kind
        o.shsq = user.username
        o.sqrq = time.strftime("%Y-%m-%d")
        o.sfqr = sfqr
        o.rzry = rzry
        o.jspf = d.hzdj1
        s.add(o)

        d.shsq = user.username
        d.sqrq = time.strftime("%Y-%m-%d")
        s.add(d)

        return {'code':1, 'msg':'操作成功', 'pid':o.rid}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    
def module_workflow_start_main(module, rid, kind, user):
    s = Session()
    try:
        res = module_workflow_start_new(module, rid, kind, user, s)
        if res.get('code') != 1:
            s.rollback()
            return {'code':-1, 'msg': res.get('msg','操作失败')}
        record_id = res.get('pid','')
        flow_name = '工厂审批'
        s.commit()
    
        return {'code':1, 'msg':'操作成功', 'record_id': record_id, 'flow_name': flow_name}
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    finally:
        s.close()


# 工厂审批工作流启动
@any_route('/api/saier/workflow/start', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_start(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        rid = j.get('rid')
        kind = j.get('kind','认证申请')
        module = j.get('module')
        flow_module = j.get('module')
        record_id = j.get('rid')
        flow_memo = j.get('memo','')
        flow_name = j.get('flow_name')

        if module == '专业工厂' or module == '潜在工厂':
            res = module_workflow_start_main(module, rid, kind, user)
            if res.get('code') != 1:
                return json_result(-1, res.get('msg','操作失败'))
            flow_module = '工厂审批'
            record_id = res.get('record_id','')
            flow_name = res.get('flow_name','工厂审批')
            flow_memo = res.get('flow_memo','')

        if is_none(flow_name,record_id):
            return json_result(ERR_PARAM_NOT_ENOUGH)

        if module_record_has_processing_workflow(flow_module, record_id):
            return json_result(-1,'已启动工作流')
        
        wf_define = get_module_workflow_define(flow_module, flow_name)
        wf = WorkFlowInstance(user)
        wf.memo = flow_memo
        wf._flow_memo = flow_memo
        wf.load_from_define(data = wf_define.data)
        if not wf.new_instance(record_id):
            return json_result(-1,msg=wf.stop_msg)
        await wf.send_notify_to_user()
        SystemLog.insert(SL_WORKFLOW_START,user,module=flow_module,pid=wf.rid,title=wf._title)
        return json_result(1, '操作成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 工厂审批工作流审批通过后更新认证信息或者工厂审核信息
# rid: 工厂审批记录id，s: 数据库session
def supplier_workflow_end(self, rid, s):
    try:
        m = s.query(gcsp).filter(gcsp.rid==rid).first()
        if not m:
            return {'code':-1, 'msg':'未找到审批记录信息，不能进行此操作'}
        splx = m.splx
        gclx = m.gclx
        cs_id = m.cs_id
        sqry = m.shsq
        tjry = m.bjry
        sccj = m.company_name
        sfqr = m.sfqr
        module = '专业工厂' if gclx == '专业工厂' else '潜在工厂'
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.cs_id==cs_id).first()
        if not d:
            return {'code':-1, 'msg':'未找到工厂记录，不能进行此操作'}
        fields = []
        if splx == '认证申请' :
            g = o.group_by_name('认证信息')
            for f in g.fields:
                if f.db.name in SYS_FIELDS:
                    continue
                fields.append(f.db.name)
            if d.ewfz != None and float(d.ewfz)!=0: 
                if m.jspf != None and float(m.jspf) >= 60:
                    m.ewfz = float(m.jspf) - 60
                    m.hzdj1 = float(m.jspf)
                else:
                    m.ewfz = 60 - float(m.jspf) if m.jspf != None and float(m.jspf) < 60 and float(m.jspf) > 0 else 60
                    m.hzdj1 = 60
                s.add(m)
        elif splx == '加分申请':
            fields = ['ewfz','bpyy','shjg','shr', 'hzdj1']
            m.shjg = '通过'
            m.shr = self.user.username
            if float(m.ewfz) == 0 or m.ewfz == None or m.jspf == None or float(m.jspf) <= 60:
                m.ewfz = 60 - float(m.jspf) if m.jspf != None else 60
                m.hzdj1 = 60
                s.add(m)

        flag = 0
        for f in fields:
            if f in SYS_FIELDS:
                continue
            if f == 'ewfz' and hasattr(d,'ewfz'):
                if m.ewfz != None and float(d.ewfz)>0:
                    if float(m.jspf)>=60:
                        setattr(d,'ewfz',float(m.jspf)-60)
                        setattr(d,'hzdj1',float(m.jspf))
                    else:
                        setattr(d,'ewfz',60-float(m.jspf))
                        setattr(d,'hzdj1',60)
                    flag = 1
                    continue
            if flag == 1 and f=='hzdj1':
                continue
            if hasattr(d,f) and hasattr(m,f):
                setattr(d,f,getattr(m,f))
        s.add(d)
        # if splx == '认证申请':
        #     user_list = []
        #     u = run_sql(f"select bmjl name from ywrybiao where yhm='{sqry}' limit 1")
        #     if len(u)>0 and u[0].get('name','') != '' and u[0].get('name','') != None:
        #         user_list.append(str(u[0].get('name')))
        #     if sqry!='' and sqry!=None and sqry not in user_list:
        #         user_list.append(sqry)
        #     # if tjry!='' and tjry!=None and tjry not in user_list:
        #     #     user_list.append(tjry)
        #     # logger.error(user_list)
        #     for r in user_list:
        #         user = s.query(sys_user).filter(sys_user.username == r).first()
        #         # title = '厂商编号:' + str(d.cs_id) + '认证申请'
        #         # content = user.username + module + ':' + sccj + ' 厂商编号:' + str(d.cs_id) + '认证申请'
        #         if sfqr == '是':
        #             title  = '厂商编号:' + str(d.cs_id) + '认证完成'
        #             content = user.username + module + ':' + sccj + ' 厂商编号:' + str(d.cs_id) + '认证完成'
        #             res = user_task_new(module, d.rid, '厂商编号', title, content, user, s, [r], True)
        #             if res.get('code') != 1:
        #                 logger.error(res.get('msg','创建任务失败'))
        #                 return {'code':-1, 'msg':res.get('msg')}
        #             row = {
        #                 "xxly": module,
        #                 "bjdh": '',
        #                 "wxht": '',
        #                 "cght": '',
        #                 "yhdh": '',
        #                 "xxnr": content,
        #                 "jsr": str(r),
        #                 "sys_path": '',
        #                 "spsq": r
        #             }
        #             res = module_xxck_new([row], user, s)
        #             if res.get('code',1) != 1:
        #                 return {'code':-1, 'msg':res.get('msg')}
                
        return {'code':1, 'msg':'工厂审批更新工厂信息成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    
def purchase_quo_workflow_end(rid, s):
    try:
        m = s.query(cgbj).filter(cgbj.rid==rid).first()
        if not m:
            return {'code':-1, 'msg':'未找到记录信息，不能进行此操作'}
        ywry = m.ywry
        xj_dh = m.xj_dh
        bjry = m.bjry
        date = time.strftime("%Y-%m-%d")
        if ywry == '' or ywry == None:
            return {'code':-1, 'msg':'未找到业务人员信息，不能进行此操作'}
        bjdh = m.bj_id
        user_list = []
        user_list.append(ywry)
        xxnr = str(bjry) + '给' + str(ywry) + '的客户报价:' + str(bjdh) + '(询价单号:' + str(xj_dh) + ')请查看,日期:' + str(date)
        if xj_dh == '' or xj_dh == None:
            xxnr = str(bjry) + '给' + str(ywry) + '的客户报价:' + str(bjdh) + '请查看,日期:' + str(date)
        d = s.query(ywrybiao.bmjl,ywrybiao.sybzj).filter(ywrybiao.yhm==ywry).first()
        if d:
            jsr = ''
            if d.bmjl != '' and d.bmjl != None and d.bmjl != ywry:
                jsr = d.bmjl
            elif d.sybzj != '' and d.sybzj != None and d.sybzj != ywry:
                jsr = d.sybzj
            if jsr != '' and jsr != None and jsr not in user_list:
                user_list.append(jsr)
        user = s.query(sys_user).filter(sys_user.username == bjry).first()
        for r in user_list:
            row = {
                "xxly": '采购报价',
                "bjdh": bjdh,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "zt": '待引用',   
                "xxnr": xxnr,
                "jsr": str(r),
                "sys_path": '',
                "spsq": r
            }
            res = module_xxck_new([row], user, s)
            if res.get('code',1) != 1:
                return {'code':-1, 'msg':res.get('msg')}
        m.bjql = '通过'
        s.add(m)
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}

def sales_order_workflow_end(rid, s):
    try:
        d = s.query(wxht).filter(wxht.rid==rid).first()
        if (d.dycjdrq != None and d.dycjdrq != '' and d.dycjdrq != '1999-01-01'):
            jdrq = d.dycjdrq
            qsn = jdrq[0:4]
            qsy = jdrq[5:7]
            qsny = jdrq[0:7]
            htzt = '接单'
            xq = '是'
        else:
            jdrq = '1999-01-01'
            qsn = jdrq[0:4]
            qsy = jdrq[5:7]
            qsny = jdrq[0:7]
            htzt = '批准'
            xq = ''
        d.qsny = qsny
        d.jdrq = jdrq
        d.qsn = qsn
        d.qsy = qsy
        d.bjql = '通过'
        d.bjql1 = '通过'
        d.wxsh = '1'
        d.fkqr = ''
        s.add(d)
        c = s.query(wxhtsheet).filter(wxhtsheet.pid==d.rid).update({
            'jdrq': jdrq,
            'qsn': qsn,
            'qsy': qsy,
            'qsny': qsny
        }, synchronize_session=False)
        c = s.query(htsq).filter(htsq.wyzd==d.htwy).update({
            'qrrq': time.strftime('%Y-%m-%d'),
            'htzt': '通过',
            'ywz': jdrq,
            'htje': float(d.htje),
            'jdjermb': d.khrmbhj,
            'jhcy': d.yjcq,
            'zsht': d.order_id,
            'xq': xq
        }, synchronize_session=False)

        row = {
            "xxly": '外销合同',
            "bjdh": '',
            "wxht": str(d.order_id),
            "cght": '',
            "yhdh": '',
            "xxnr": '外销合同:' + str(d.order_id) + '审批通过,日期:' + time.strftime('%Y-%m-%d'),
            "jsr": str(d.ywry),
            "spsq": d.ywry
        }
        user = s.query(sys_user).filter(sys_user.username == d.ywry).first()
        res = module_xxck_new([row],user,s)
        if res.get('code')!=1:
            return res
        
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}


def purchase_plan_workflow_end(rid, s):
    try:
        m = s.query(cgjh).filter(cgjh.rid==rid).first()
        if not m:
            return {'code':-1, 'msg':'未找到记录信息，不能进行此操作'}
        m.jhqr = '通过'
        s.add(m)
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    

def purchase_order_workflow_end(rid, s):
    try:
        m = s.query(cght).filter(cght.rid==rid).first()
        if not m:
            return {'code':-1, 'msg':'未找到记录信息，不能进行此操作'}
        m.sfhz = '通过'
        m.tgsb = "是"
        m.cgsh = "1"
        s.add(m)
        from .purchase_plan import purchase_process_main_new, purchase_process_child_new, purchase_process_fees_new
        gd_rid = get_uuid()
        user = s.query(sys_user).filter(sys_user.rid == m.uid).first()
        res = purchase_process_child_new(gd_rid, rid, user, s)
        if res.get('code',1) != 1:
            return {'code':-1, 'msg':res.get('msg')}
        res = purchase_process_fees_new(gd_rid, rid, user, s)
        logger.error('--fees--')
        logger.error(res)
        if res.get('code',1) != 1:
            return {'code':-1, 'msg':res.get('msg')}
        res = purchase_process_main_new(gd_rid, rid, user, s)
        if res.get('code',1) != 1:
            return {'code':-1, 'msg':res.get('msg')}
        
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    
# 工作流流转结束执行代码
def module_workflow_end(self):
    s = Session()
    try:
        m = self.module
        rid = self.record_id
        # modules = ['']
        o=get_module(self.module)
        t=get_model_by_table_name(o.table_name)
        if m == '工厂审批':
            res = supplier_workflow_end(self,rid,s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        if m == '采购报价':
            res = purchase_quo_workflow_end(rid,s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        if m == '外销合同':
            res = sales_order_workflow_end(rid,s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        if m == '采购计划':
            res = purchase_plan_workflow_end(rid,s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))           
        if m == '采购合同':
            res = purchase_order_workflow_end(rid,s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))        
        s.commit()

        return json_result(1,'操作成功')
    except:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1,trace_error())
    finally:
        s.close()
add_event(WORKFLOW_END, module_workflow_end)

# 报价审批工作流流转执行代码
def quotation_workflow_task_flow(rid, status, memo, s):
    try:
        bj_id = ''
        bjry = ''
        d = s.query(bj).filter(bj.rid==rid).first()
        if d:
            bj_id = str(d.bj_id)
            bjry = str(d.bjry)
            d.bjql = '通过' if status == 1 else '不通过'
            d.wpyy = memo if status == 2 else ''
            s.add(d)
            xxnr = '客户报价:' + str(bj_id) + '审批通过,日期:' + time.strftime("%Y-%m-%d")
            if status == 2:
                xxnr = '客户报价:' + str(bj_id) + '没通过,原因:' + str(memo)
            row = {
                "xxly": '客户报价',
                "bjdh": bj_id,
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "zt": '待引用',   
                "xxnr": xxnr,
                "jsr": bjry,
                "sys_path": '',
                "spsq": bjry
            }
            user = s.query(sys_user).filter(sys_user.username == bjry).first()
            res = module_xxck_new([row], user, s)
            if res.get('code',1) != 1:
                return {'code':-1, 'msg':res.get('msg')}
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return {'code':-1, 'msg':trace_error()}


# 出运计划审批工作流流转执行代码
def shipping_workflow_task_flow(rid, status, unit, memo, s, user):
    try:
        d = s.query(chyjh).filter(chyjh.rid==rid).first()
        if not d:
            return {'code':0, 'msg':'未找到记录信息，不能进行此操作'}
        khmc = str(d.khmc)
        flag = 0
        # 判断是否为亚马逊客户
        if khmc != '' and khmc != None and 'AMAZON' in khmc.upper():
            flag = 1
        # 出运计划的出运申请审批通过后更新对应字段状态
        if unit == '出运申请':
            if status == 1:
                d.jlhz = '通过'
                if flag == 1:
                    if d.fkry!= '' and d.fkry != None and  d.dzry != '' and d.dzry != None:
                        d.fkqr = '待审批'
                    if d.fkry == '' or d.fkry == None:
                        fkry1 = '范智超'
                        u = s.query(spwt.dlr).filter(spwt.fkyw=='有',spwt.szgs==d.wfgs).first()
                        if u and u.dlr != '' and u.dlr != None:
                            fkry1 = u.dlr
                        d.fkry = fkry1
            elif status == 2:
                d.jlhz = '待审批'
                d.cysq = ''
                d.zjhz = ''
                if flag == 1:
                    d.dzzt = '待审批'
                    d.fkry = ''
                    d.fkqr = '待审批'
                    d.fksd = ''
                    d.sdqr = '待审批'
                    d.dzry = ''
                    d.fkdz = ''
                    d.dzqr1 = '待审批'
        elif unit == '风控人员':
            if status == 1:
                d.fkqr = '通过'
            elif status == 2:
                d.fkqr = '待审批'
        # elif unit == '风控审单':
        #     if status == 1:
        #         d.sdqr = '结束'
        #     elif status == 2:
        #         d.sdqr = '待审批'
        elif unit == '风控单证':
            if status == 1:
                d.dzzt = '通过'
                d.dzqr1 = '结束'
            elif status == 2:
                d.dzzt = '待审批'
                d.jlhz = '待审批'
                d.cysq = ''
                d.zjhz = ''
                d.fkry = ''
                d.fkqr = '待审批'
                d.fksd = ''
                d.sdqr = '待审批'
                d.dzry = ''
                d.fkdz = ''
                d.dzqr1 = '待审批'
        # elif unit == '单证人员':
        #     if status == 1:
        #         d.dzqr1 = '结束'
        #         res = shipping_insert_shipment(d, s, user)
        #         if res.get('code') != 1:
        #             s.rollback()
        #             logger.error(res.get('msg','操作失败'))
        #             return {'code':-1, 'msg':res.get('msg','操作失败')}
        #     elif status == 2:
        #         d.jlhz = '待审批'
        #         d.cysq = ''                
        #         d.zjhz = ''
        #         d.dzqr1 = '再审'

        s.add(d)
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return {'code':-1, 'msg':trace_error()}

# 放单申请审批工作流流转执行代码
def bol_apply_workflow_task_flow(rid, status, unit, memo, s, user):
    try:
        d = s.query(fdsq1).filter(fdsq1.rid==rid).first()
        if not d:
            return {'code':0, 'msg':'未找到记录信息，不能进行此操作'}
        khmc = str(d.khmc)
        kh_id = str(d.kh_id)
        ljwsh = float(d.ljwsh)
        flag = 0
        # 判断是否为亚马逊客户
        if khmc != '' and khmc != None and 'AMAZON' in khmc.upper():
            flag = 1
        # 出运计划的出运申请审批通过后更新对应字段状态
        if unit == '财务审批':
            s.query(kh).filter(kh.kh_id==kh_id).update({kh.ljwsh: ljwsh}, synchronize_session=False)
            if status == 1:
                d.cwsp = '通过'
            elif status == 2:
                d.cwsp = '待审批'
                d.sftj = '否'
            d.sprq1 = time.strftime("%Y-%m-%d")
        elif unit == '主管审批':
            if status == 1:
                d.jlsp = '通过'
            elif status == 2:
                d.jlsp = '待审批'
                d.sftj = '否'
                d.tjcw = ''
                d.cwsp = '待审批'
            d.sprq = time.strftime("%Y-%m-%d")
        elif unit == '风控审批':
            hxdate = ''
            if status == 1:
                d.fksp = '通过'
                if d.zjlms == '是':
                    hxdate = '是'
                else:
                    d.zjlsp = '待审批'
            elif status == 2:
                hxdate = '否'
                d.fksp = '待审批'
                d.sftj = '否'
                d.tjcw = ''                
                d.jlsp = '待审批'
                d.cwsp = '待审批'
                d.tjfk = ''
            d.sprq2 = time.strftime("%Y-%m-%d")
            if hxdate != '' and hxdate != None:
                m = s.query(fdsq1sheet).filter(fdsq1sheet.pid==rid).all()
                for r in m:
                    s.query(cymx).filter(cymx.fphm==r.fphm).update({cymx.hxdate:hxdate}, synchronize_session=False)
        elif unit == '总经理审批':
            hxdate = ''
            if status == 1:
                d.zjlsp = '通过'
                hxdate = '是'
                m = s.query(fdsq1sheet).filter(fdsq1sheet.pid==rid).all()
                for r in m:
                    s.query(cymx).filter(cymx.fphm==r.fphm).update({cymx.hxdate:'是'}, synchronize_session=False)
            elif status == 2:
                hxdate = '否'
                d.zjlsp = '待审批'  
                d.cwsp = '待审批'
                d.fksp = '待审批'
                d.tjcw = ''
                d.tjfk = ''
                d.tjzjl = ''
                d.jlsp = '待审批'
            d.sprq3 = time.strftime("%Y-%m-%d")
            if hxdate != '' and hxdate != None:
                m = s.query(fdsq1sheet).filter(fdsq1sheet.pid==rid).all()
                for r in m:
                    s.query(cymx).filter(cymx.fphm==r.fphm).update({cymx.hxdate:hxdate}, synchronize_session=False)
        s.add(d)
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return {'code':-1, 'msg':trace_error()}

# 工厂拜访审批工作流流转执行代码
def supplier_visit_workflow_task_flow(rid, status, unit, memo, s, user):
    try:
        d = s.query(gcbf).filter(gcbf.rid==rid).first()
        if not d:
            return {'code':0, 'msg':'未找到记录信息，不能进行此操作'}
        # 工厂拜访的审批通过后更新对应字段状态
        if unit == '主管审批':
            if status == 1:
                d.jlhz = '通过'
            elif status == 2:
                d.jlhz = '待审批'
            if memo != '' and memo != None:
                d.spyj = memo
            d.sprq = time.strftime("%Y-%m-%d")
        elif unit == '拜访总监审':
            if status == 1:
                d.zjhz = '通过'
            elif status == 2:
                d.zjhz = '待审批'
            if memo != '' and memo != None:
                d.fkyj = memo
            d.sprq2 = time.strftime("%Y-%m-%d")
        elif unit == '付款总监审':
            if status == 1:
                d.zjhz1 = '通过'
            elif status == 2:
                d.zjhz1 = '待审批'
            d.zjhzrq = time.strftime("%Y-%m-%d")
        elif unit == '总经理审批':
            if status == 1:
                d.zjlhz1 = '通过'
            elif status == 2:
                d.zjlhz1 = '待审批'  
            d.zjlhzrq = time.strftime("%Y-%m-%d")

        s.add(d)
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return {'code':-1, 'msg':trace_error()}
    
# 工作流流转执行代码
def module_workflow_task_flow(self, task):
    s = Session()
    try:
        # logger.error('task--flow--')
        # logger.error(self.__dict__)
        modules = ['客户报价','出运计划','放单申请','工厂拜访']
        if not task.module in modules:
            return json_result(0,'操作成功')
        if task.module == '客户报价' and task.unit == '报价审批':
            res = quotation_workflow_task_flow(task.record_id, task.status, task.memo, s)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        elif task.module == '出运计划':
            res = shipping_workflow_task_flow(task.record_id, task.status, task.unit, task.memo, s, self.user)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        elif task.module == '放单申请':
            res = bol_apply_workflow_task_flow(task.record_id, task.status, task.unit, task.memo, s, self.user)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        elif task.module == '工厂拜访':
            res = supplier_visit_workflow_task_flow(task.record_id, task.status, task.unit, task.memo, s, self.user)
            if res.get('code') != 1:
                s.rollback()
                logger.error(res.get('msg','操作失败'))
                return json_result(-1, res.get('msg','操作失败'))
        
        s.commit()

        return json_result(1,'操作成功')
    except:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1,trace_error())
    finally:
        s.close()
add_event(WORKFLOW_TASK_FLOW_OUT, module_workflow_task_flow)


async def module_workflow_get_task(module, rid, user, s):
    try:
        instance_rid = ''
        task_rid = ''
        d = s.query(sys_workflow_user_task.instance,sys_workflow_user_task.task,sys_workflow_user_task.rid).filter(sys_workflow_user_task.record_id==rid,
            sys_workflow_user_task.module==module,sys_workflow_user_task.approver==user.rid,sys_workflow_user_task.status==0).first()
        if not d:
            return {'code':0, 'msg':'没有待办任务'}
        c = s.query(sys_workflow_task.rid).filter(sys_workflow_task.record_id==rid,sys_workflow_task.module==module,sys_workflow_task.rid==d.task,sys_workflow_user_task.status==0).first()
        if not c:
            return {'code':0, 'msg':'没有待办任务'}
        c = s.query(sys_workflow_instance.rid).filter(sys_workflow_instance.record_id==rid,sys_workflow_instance.module==module,sys_workflow_instance.rid==d.instance,sys_workflow_instance.status==0).first()
        if not c:
            return {'code':0, 'msg':'没有待办任务'}
                
        instance_rid = str(d.instance)
        task_rid = str(d.rid)

        return {'code':1, 'msg':'操作成功', 'data':{'instance_rid':instance_rid, 'task_rid':task_rid}}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}

async def module_workflow_set_task(module, rid, user, s):
    try:
        instance_rid = ''
        task_rid = ''
        d = s.query(sys_workflow_user_task).filter(sys_workflow_user_task.record_id==rid,
            sys_workflow_user_task.module==module,sys_workflow_user_task.approver==user.rid,sys_workflow_user_task.status==0).first()
        if d:
            d.status = 1
            d.op_time = time.strftime("%Y-%m-%d %H:%M:%S")
            s.add(d)
            c = s.query(sys_workflow_task).filter(sys_workflow_task.record_id==rid,sys_workflow_task.module==module,sys_workflow_task.rid==d.task,sys_workflow_user_task.status==0).first()
            if c:
                c.status = 1
                c.end_time = time.strftime("%Y-%m-%d %H:%M:%S")
                s.add(c)
            c = s.query(sys_workflow_instance).filter(sys_workflow_instance.record_id==rid,sys_workflow_instance.module==module,sys_workflow_instance.rid==d.instance,sys_workflow_instance.status==0).first()
            if c:
                c.status = 1
                c.op_time = time.strftime("%Y-%m-%d %H:%M:%S")
                s.add(c)
                
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}

def workflow_module_check(rid, module, s):
    try:
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        if module == '采购报价' or module == '外销合同' or module == '客户报价': 
            d = s.query(t.spsq).filter(t.rid==rid).first()
            if not d:
                return {'code': -1, 'msg': '未找到记录信息，工作流启动失败'}
            if str(d.spsq) == '' or str(d.spsq) == None:
                return {'code': -1, 'msg': '审批申请为空，工作流启动失败'}
            if module == '采购报价':
                c = s.query(cgbjsheet.rid).filter(cgbjsheet.pid==rid, func.ifnull(cgbjsheet.jldw,'')=='').first()
                if c:
                    return {'code': -1, 'msg': '产品资料行存在必填项为空记录，工作流启动失败'}
        elif module == '出运计划':
            d = s.query(t.cysq).filter(t.rid==rid).first()
            if not d:
                return {'code': -1, 'msg': '未找到记录信息，工作流启动失败'}
            if str(d.cysq) == '' or str(d.cysq) == None:
                return {'code': -1, 'msg': '出运申请为空，工作流启动失败'}
        elif module == '放单申请':
            d = s.query(t.tjcw).filter(t.rid==rid).first()
            if not d:
                return {'code': -1, 'msg': '未找到记录信息，工作流启动失败'}
            if str(d.fdsq) == '' or str(d.fdsq) == None:
                return {'code': -1, 'msg': '提交财务为空，工作流启动失败'}
        elif module == '工厂拜访':
            d = s.query(t.tjjl).filter(t.rid==rid).order_by(t.sid.desc()).first()
            if d and (d.tjjl == '' or d.tjjl == None):
                return {'code':-1, 'msg':'提交主管为空，工作流启动失败'}
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}


# 工厂审批工作流启动
@any_route('/api/saier/workflow/start/check', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_start_check(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        module = j.get('module')
        rid = j.get('rid')
        res = workflow_module_check(rid, module, s)
        if res.get('code') != 1:
            return json_result(-1, res.get('msg'))
            
        return json_result(1, '操作成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass
    

def workflow_flow_out_check(rid, instance_id, task_id, s):
    try:
        c = s.query(sys_workflow_user_task).filter(sys_workflow_user_task.instance==instance_id, sys_workflow_user_task.rid==task_id).first()
        if not c:
            return {'code': -1, 'msg': '未找到待办任务信息，工作流流转失败'}
        module = c.module
        unit = c.unit
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.rid==rid).first()
        if module == '出运计划':
            if unit == '出运申请' and (d.fkry == '' or d.fkry == None):
                return {'code': -1, 'msg': '风控人员不能为空，工作流流转失败'}
            if unit == '风控人员' and (d.fksd == '' or d.fksd == None or d.fkdz == '' or d.fkdz == None):
                return {'code': -1, 'msg': '风控审单或者风控单证不能为空，工作流流转失败'}
            if unit == '风控单证' and (d.dzry == '' or d.dzry == None):
                return {'code': -1, 'msg': '单证人员不能为空，工作流流转失败'}
        elif module == '放单申请':
            if unit == '财务审批':
                if (d.tjjl == '' or d.tjjl == None):
                    return {'code': -1, 'msg': '是否提交主管不能为空，工作流流转失败'}
                khmc = str(d.khmc)
                d = run_sql(f"select xm from cyzglsheet where (bz='{khmc}') and (zm='放单免审公司') limit 1")
                logger.error(d)
                if len(d) > 0:
                    zm = d[0].get('xm', '')
                    if d.tjjl == '侯柳红' or zm == '侯柳红':
                        d.zgms = '是'
                        d.jlsp = '通过'
                        s.add(d)
                        s.commit()
            if unit == '主管审批' and (d.tjfk == '' or d.tjfk == None):
                return {'code': -1, 'msg': '是否提交风控不能为空，工作流流转失败'}
            if unit == '风控审批': 
                if (d.tjzjl == '' or d.tjzjl == None):
                    return {'code': -1, 'msg': '是否提交总经理不能为空，工作流流转失败'}
                bjdl = str(d.bjdl)
                tjjl = str(d.tjjl)
                spsq = ''
                if bjdl != '' and bjdl != None :
                    spsq = str(d.tjzjl)
                if spsq == tjjl:
                    d.zjlms = '是'
                    d.zjlsp = '通过'
                    s.add(d)
                    s.commit()
        elif module == '工厂拜访':
            if unit == '主管审批' and (d.tjfk == '' or d.tjfk == None):
                return {'code': -1, 'msg': '提交总监不能为空，工作流流转失败'}
            elif unit == '登记人' and (d.zj == '' or d.zj == None):
                return {'code': -1, 'msg': '总监不能为空，工作流流转失败'}
            elif unit == '付款总监审' and (d.zjl == '' or d.zjl == None):
                return {'code': -1, 'msg': '总经理不能为空，工作流流转失败'}
        elif module == '工厂审批':
            if unit == '审批处理' and (d.rzry == '' or d.rzry == None):
                return json_result(-1, '请先填写认证人员')    
            
        return {'code':1, 'msg':'操作成功'}
    except Exception as e:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    

# 模块的工作流流转前校验
@any_route('/api/saier/workflow/flow/out/check', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_flow_out_check(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        module = j.get('module')
        rid = j.get('rid')
        unit = j.get('unit')
        instance_id = j.get('instance_id')
        task_id = j.get('task_id')
        # status = j.get('status')
        res = workflow_flow_out_check(rid, instance_id, task_id, s)
        if res.get('code') != 1:
            return json_result(-1, res.get('msg'))
            
        return json_result(1, '操作成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass

# 取消工作流后更新记录状态或者其他信息
@any_route('/api/saier/workflow/cancel/after', methods=['POST', 'GET'])
@require_token
async def api_saier_workflow_cance_after(request):
    s=Session()
    j = await request.json()
    user = request.current_user
    try:
        module = j.get('module')
        rid = j.get('rid')
        o = get_module(module)
        t = get_model_by_table_name(o.table_name)
        d = s.query(t).filter(t.rid==rid).first()
        fields = [
            {'field':'shsq', 'value':''},
            {'field':'spsq', 'value':''},
            {'field':'spsq1', 'value':''},
            {'field':'tjsh', 'value':''},
            {'field':'jhqr', 'value':''},
            {'field':'sfhz', 'value':'待审批'},
            {'field':'xdsq', 'value':''},
            {'field':'xdsq1', 'value':''},
            {'field':'dzzt', 'value':'待审批'},
            {'field':'jlhz', 'value':'待审批'},
            {'field':'cysq', 'value':''},
            {'field':'zjhz', 'value':''},
            {'field':'fkry', 'value':''},
            {'field':'fkqr', 'value':'待审批'},
            {'field':'fksd', 'value':''},
            {'field':'sdqr', 'value':'待审批'},
            {'field':'dzry', 'value':''},
            {'field':'fkdz', 'value':''},
            {'field':'dzqr1', 'value':'待审批'},
            {'field':'tjcw', 'value':''},
            {'field':'cwsp', 'value':'待审批'},
            {'field':'sprq1', 'value':None},
            {'field':'cwyj', 'value':''},
            {'field':'tjjl', 'value':''},
            {'field':'jlsp', 'value':'待审批'},
            {'field':'sprq', 'value':None},
            {'field':'spyj', 'value':''},
            {'field':'tjfk', 'value':''},
            {'field':'fksp', 'value':'待审批'},
            {'field':'sprq2', 'value':None},
            {'field':'fkyj', 'value':''},
            {'field':'tjzjl', 'value':''},
            {'field':'zjlsp', 'value':'待审批'},
            {'field':'sprq3', 'value':None},
            {'field':'zjlyj', 'value':''},
        ]
        if not d:
            return json_result(-1, '未找到记录信息')
        if user.rid == d.uid and  (d.wf_status == 2 or (hasattr(d, 'bjql') and d.bjql == '通过') or (hasattr(d,'sfhz') and d.sfhz == '通过') or (hasattr(d,'jhqr') and d.jhqr == '通过')):
            return json_result(-1, '该记录已通过审批，不能进行此操作')
        if d.uid == user.rid and module != '出运计划' and (d.wf_status == 1 or (hasattr(d, 'bjql') and d.bjql == '待审批') or (hasattr(d,'sfhz') and d.sfhz == '待审批') or (hasattr(d,'jhqr') and d.jhqr == '待审批')):
            return json_result(-1, '只有业务人员才能进行此操作')
        for f in fields:
            if hasattr(d, f['field']):
                setattr(d, f['field'], f['value'])

        s.add(d)
        res = user_task_delete(module, rid, s)
        if res.get('code') != 1:
            return json_result(res.get('code'), res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 审批记录保存后事件
@any_route('/api/saier/audit/save/after', methods=['POST', 'GET'])
@require_token
async def view_saier_audit_save_after(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module')
        res = await module_workflow_get_task(module, rid, user, s)
        if res.get('code') != 1:
            return json_result(res.get('code'), res.get('msg'))
        
        return json_result(1, '更新成功', res.get('data'))
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error(),'')
    finally:
        s.close()