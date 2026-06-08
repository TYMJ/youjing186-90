from hmac import new

from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']



# 客户拜访的编辑界面加载校验
@any_route('/api/saier/supplier_visit/sccj/change', methods=['POST', 'GET'])
@require_token
async def view_saier_supplier_visit_sccj_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        cname = j.get('cname', '')
        web = j.get('web', '')
        email = j.get('email', '')
        address = j.get('hsfp', '')
        phone = j.get('phone', '')
        sjhm = j.get('sjhm', '')
        qyQQ = j.get('qyQQ', '')
        cs_id = ''
        msg = '操作成功'
        code = 1
        d = run_sql(f"select cs_id from ozycs where (company_name like '%{cname}%' and ifnull(company_name,'')<>'') or (web='{web}' and ifnull(web,'')<>'' and web<>'无') \
            or (email='{email}' and ifnull(email,'')<>'' and email<>'无') or (address='{address}' and ifnull(address,'')<>'' and address<>'无') \
            or (phone='{phone}' and ifnull(phone,'')<>'' and phone<>'无') or (sjhm='{sjhm}' and ifnull(sjhm,'')<>'' and sjhm<>'无') \
            or (qyQQ='{qyQQ}' and ifnull(qyQQ,'')<>'' and qyQQ<>'无') limit 1")
        if len(d) > 0:
            cs_id = d[0]['cs_id']
        
        return json_result(code, msg, cs_id)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户拜访的编辑界面加载校验
@any_route('/api/saier/supplier_visit/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_supplier_visit_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = {'gcbf':[],'cwpd':0}
        d = run_sql(f"select xm,bz from cyzglsheet where (zm='工厂拜访字段权限控制')")
        if len(d) > 0:
            data['gcbf'] = d

        d = run_sql(f"select position,path from sys_user where (username='{user.username}') and (position like '%财务%' or memo like '%财务%') limit 1")
        if len(d) > 0:
            data['cwpd'] = 1

        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 客户拜访的记录保存前校验
@any_route('/api/saier/supplier_visit/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_supplier_visit_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        djry = j.get('djry', '')
        d = run_sql(f"select rid from sys_user where (username='{user.username}') and (position like '%总%' or memo like '%总%') limit 1")
        if user.username!=djry and len(d) == 0:
            return json_result(-1, '不好意思,您没有权利修改此记录')

        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

def days_between_dates(date_str1, date_str2, date_format="%Y-%m-%d"):
    try:
        """
        计算两个字符日期之间的天数差
        Args:
            date_str1: 第一个日期字符串，如 "2024-01-01"
            date_str2: 第二个日期字符串，如 "2024-12-31"
            date_format: 日期格式，默认为 "%Y-%m-%d"
        
        Returns:
            两个日期之间的天数差（绝对值）
        """
        # 将字符串转换为datetime对象
        date1 = datetime.strptime(date_str1, date_format)
        date2 = datetime.strptime(date_str2, date_format)
        
        # 计算天数差
        delta = abs((date2 - date1).days)
        return delta
    except Exception as e:
        logger.error(f"日期转换错误: {e}")
        return -1


# 客户拜访的生成费用申请按钮
@any_route('/api/saier/supplier_visit/fees/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_supplier_visit_fees_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        d = s.query(gcbf).filter(gcbf.rid==rid).first()
        if not d:
            return json_result(-1, '记录不存在,请刷新后重试')
        djr = str(d.djr)
        if user.username != djr and user.username != 'zjnblh' and user.username != 'admin':
            return json_result(-1, '不好意思,您没有权利操作此记录')
        
        if str(d.zjlhz1) != '通过' and int(d.wf_status) != 2:
            return json_result(-1, '不好意思,只有总经理审核通过后才能申请费用报销')

        tjjl = str(d.tjjl)
        tjcw = ''
        c = run_sql(f"select wb1,wb2,wb3,wb4,wb5,wb6,wb7,wb8,wb9 from zx where (ly='付款审批') and (wb1='{tjjl}') limit 1")
        if len(c) > 0:
            if str(d.wfgs=='宁波景业国际贸易有限公司'):
                tjcw = c[0]['wb8']
            else:
                tjcw = c[0]['wb6']
        bfdh = str(d.bfdh)
        f = s.query(fysq.rid).filter(fysq.bfdh==bfdh).first()
        if f:
            return json_result(-1, '不好意思,拜访单号【' + bfdh + '】的费用申请已存在,不能重复申请')

        # org = get_user_path(djr)
        # path = org.get('path','')
        pid = get_uuid()
        fkbh = auto_number.generate(s,'费用申请.付款编号',{'rid':pid})
        m = fysq()
        x = alchemy_object_to_dict(d)
        for k in x:
            if k in SYS_FIELDS:
                continue
            if hasattr(m, k):
                setattr(m, k, x[k])
        m.sfkp = '否'
        m.cwgc = str(d.fkhm)  
        m.khh = str(d.bank1)
        m.yhzh = str(d.zh1)      
        m.seje = float(d.fyhj)
        m.hbdm = 'RMB'
        m.huilv = 1
        m.sqrq1 = time.strftime('%Y-%m-%d')
        m.hklx = '差旅费'
        m.fkxs = '电汇'
        m.zxpd = '否'
        m.RMBkh = '是'
        m.sfrbmfy = '是'
        m.lyry = str(d.djr)
        m.hsbm = str(d.ywbm)
        m.jbry = str(d.djr)
        m.fpje = float(d.fyhj)
        m.bz1 = '同行人员' + str(d.thry)
        m.xgry =  user.username
        m.wyzd =  pid
        m.seje1 = float(d.fyhj)
        m.fynr = '工厂拜访单号' + str(d.bfdh) + '的费用申请'
        m.sqrq = time.strftime('%Y-%m-%d')
        m.htje1 = float(d.fyhj)
        m.hfje = float(d.fyhj)
        if (d.jtfy) != None and float(d.fymc) != None:
            m.jtfy = float(d.fymc) + float(d.jtfy)
        m.tjfk = str(d.zj)
        m.tjfk = str(d.zj)
        m.zjhz = str(d.zjhz1)
        if d.zjhzrq:
            m.sprq2 = str(d.zjhzrq)
        else:
            m.sprq2 = time.strftime('%Y-%m-%d')
        m.tjzjl = str(d.zjl)
        m.zjlhz = str(d.zjlhz1)
        if d.zjlhzrq:
            m.sprq3 = str(d.zjlhzrq)
        else:
            m.sprq3 = time.strftime('%Y-%m-%d')
        m.tjcw = tjcw
        m.cwsp = '待审批'
        m.fklx = '差旅费'
        m.dycw = ''
        # m.path = path
        m.rid = pid
        m.uid = user.rid
        m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
        m.fkbh = fkbh
        s.add(m)

        c = fysqsheet()
        c.rid = get_uuid()
        c.pid = pid
        c.uid = user.rid
        c.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
        c.fpje = float(d.fyhj)
        c.sj = str(d.qsrq) + '——' + str(d.jsrq)
        c.dd = d.bfdd[:50]
        days = days_between_dates(str(d.qsrq), str(d.jsrq))
        c.ts = days + 1
        c.seje = float(d.fyhj)
        c.rs = int(d.thrs)
        if d.thry:
            c.ptry = d.thry[:100]
        c.jbry = str(d.djr)
        c.ywbm = str(d.ywbm)
        c.hsbm = str(d.ywbm)
        c.fywyzd = c.rid
        s.add(c)

        xxnl = '请注意客人:' + str(d.zjl) + '的费用审请' + str(fkbh) + '需审批,日期:' + time.strftime('%Y-%m-%d')
        row = {
            "xxly": '费用申请',
            "bjdh": '',
            "wxht": '',
            "cght": '',
            "yhdh": '',
            "gdht": fkbh,
            "xxnr": xxnl,
            "jsr": str(tjcw),
            "sys_path": "",
            "spsq": tjcw
        }
        res = module_xxck_new([row],user,s)
        if res.get('code')!=1:
            s.rollback()
            return json_result(res.get('code'), res.get('code'))

        res = user_task_new('费用申请', pid, '付款编号', f'审批{str(d.zjl)}的费用申请{fkbh}', xxnl, user, s, [tjcw], True)
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

    
# 客户拜访的生成潜在工厂按钮
@any_route('/api/saier/supplier_visit/supplier/new', methods=['POST', 'GET'])
@require_token
async def view_saier_supplier_visit_supplier_new(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        # 潜在工厂的厂商编号机构默认为 UV，义乌的用户生成潜在工厂时编号机构为 YUV
        bm = 'UV'
        m = s.query(gcbf).filter(gcbf.rid==rid).first()
        if not m:
            return json_result(-1, '记录不存在,请刷新后重试')
        # 工厂拜访登记人、总经理核准通过后或总经理、总监才能生成潜在工厂
        if not (((str(m.djr) == user.username or user.username == 'zjnblh' or user.username == 'admin') and (str(m.zjlhz1) == '通过' or m.wf_status==2)) or str(m.zjl) == user.username or str(m.zjl) == user.username):
            return json_result(-1, '不好意思,只有登记人且总经理核准通过后或总经理、总监才能生成潜在工厂')
        org = get_user_path(str(m.djr))
        path = org.get('path','')
        # 义乌的用户生成潜在工厂时编号机构为 YUV，其他为 UV
        if '义乌' in path:
            bm = 'YUV'
        uid = org.get('rid','')
        cs_list = []
        file_path = config.get_today_upload_path()
        if not os.path.exists(file_path):
            make_dirs(file_path)
        data_path = config.data_upload_path
        # 图片字段列表，后续如果有新增图片字段需要添加到这个列表中
        photo_fields = ['sccj1','sccj2','sccj3','sccj4','gcwg','bgs','ck','ypj','zzjg','gccptp','swdjz','grtp','qttp','yyzz','gcqz','nsrdjb','nssbb','gcwg1','gcwg2','yclt1','ycl2']
        d = s.query(gcbfsheet2).filter(gcbfsheet2.pid==rid).all()
        for r in d:
            c = None
            cs_id = r.cs_id
            csmc = r.company_name
            # 如果厂商名称为空，则不生成潜在工厂记录
            if csmc == None or csmc == '':
                continue
            # 如果当前拜访记录的厂商名称在之前的记录中已经出现过了，则不生成潜在工厂记录（避免同一拜访记录中多次出现同一厂商名称时生成多条潜在工厂记录）
            if csmc in cs_list:
                continue
            cs_list.append(csmc)
            # 如果有厂商编号且数据库中存在这条记录，则更新；否则新增
            if cs_id!= None and cs_id != '':
                c = s.query(ozycs).filter(ozycs.cs_id==cs_id).first()
            # 如果有厂商名称但没有厂商编号，或者有厂商编号但数据库中没有这条记录，则新增一条潜在工厂记录
            if not c:
                c = ozycs()
                cs_rid = get_uuid()
                c.rid = cs_rid
                c.uid = uid
                c.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                cs_id = auto_number.generate(s,'潜在工厂.厂商编号',{'rid':cs_rid,'潜在工厂.编号机构':'','潜在工厂.编号部门':bm})
                c.cs_id = str(cs_id)
                c.company_name = csmc
                c.csjc = r.csjc
                c.twhm = str(r.twhm)
            else:
                c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                c.modi_uid = user.rid
            # 如果有厂商名称但没有厂商编号，或者有厂商编号但数据库中没有这条记录，则新增一条潜在工厂记录；如果有厂商编号且数据库中存在这条记录，则更新这条潜在工厂记录
            l = alchemy_object_to_dict(r)
            for k, v in l.items():
                if k in SYS_FIELDS or k in photo_fields or k in ['cs_id','company_name','twhm','csjc']:
                    continue
                if hasattr(c, k):
                    setattr(c, k, v)
            # 更新修改人员、拜访人、拜访日期等字段
            c.xgry = user.username
            c.bfry = str(m.djr) + '、' + str(m.thry)
            c.bfrq = str(m.jsrq)
            # 处理图片字段，复制图片到潜在工厂的图片存储路径，并更新图片路径为新的存储路径
            for f in photo_fields:
                if not hasattr(c, f) or f not in l:
                    continue
                if l.get(f) == None or l.get(f) == '' or l.get(f) == '[]':
                    continue
                new_photos = []
                photos = json.loads(l.get(f))
                for photo in photos:
                    fp = os.path.join(data_path, photo.get('src'))
                    if os.path.exists(fp):
                        fn = photo.get('name')
                        ext = get_suffix(fp)
                        filename = get_unique(16) + ext
                        shutil.copy2(fp, os.path.join(file_path, filename))
                        sub_path = file_path[-10:]
                        new_photos.append({'name': fn, 'src': sub_path+'/'+filename})
                if len(new_photos) > 0:
                    setattr(c, f, str(new_photos).replace("'",'"'))
            s.add(c)
            # 如果有厂商编号且数据库中存在这条记录，则更新这条潜在工厂记录；如果厂商编号发生了变化，则更新这条潜在工厂记录的 cs_id 和 sb 字段为新的厂商编号
            if r.cs_id != cs_id:
                r.cs_id = cs_id
                r.sb = cs_id
                s.add(r)
            
        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()