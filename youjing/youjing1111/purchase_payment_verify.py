from pdb import run
from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
from datetime import datetime
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new,user_task_delete,user_task_new
try:
    # pip install cn2an
    import cn2an 
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", 'cn2an'])

try:
    from num2words import num2words
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", 'num2words'])

    
def amu_to_cn(amount):
    try:        
        # 转换为中文金额
        return cn2an.an2cn(float(amount), "rmb")
    except Exception as e:
        logger.error(trace_error())
        return '金额转换错误!!!'
    
def calculate_date_difference(start_date, end_date, date_format="%Y-%m-%d"):
    def _parse_date(d):
        if isinstance(d, (date, datetime)):
            return d
        elif isinstance(d, str):
            return datetime.strptime(d, date_format).date()
        else:
            raise TypeError(f"日期类型错误: {type(d)}")

    parsed_start = _parse_date(start_date)
    parsed_end = _parse_date(end_date)
    
    # 使用 abs() 确保返回非负数
    return abs((parsed_end - parsed_start).days)
    
SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

@any_route('/api/saier/purchase_payment_verify/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        sccj1 = j.get('sccj','')
        data_list = j.get('data_list',[])
        khsheet3_data = []
        
        if sccj1 != '':
            if len(data_list) > 0:
                for item in data_list:
                    if item.get('cxbg','') == '待提供':
                        sfsh = '待提供'
                        sccj = item.get('gcmc','')
                        chgc = item.get('gcmc1','')
                        if sccj == '':
                            sccj = sccj1
                        if chgc == '':
                            chgc = sccj
                        d = run_sql(f"select * from cxgc where (gcmc='{str(sccj)}') or (chgc='{str(chgc)}') or (gcmc='{str(chgc)}')")
                        if len(d)>0:
                            if d[0].get('qrrq','') == '':
                                qrrq1 = '1999-01-01'
                            else:
                                qrrq1 = d[0].get('qrrq','')
                            if calculate_date_difference(qrrq1, datetime.now().strftime('%Y-%m-%d')) > 365:
                                sfsh = '待提供'
                            else:
                                sfsh = '已提供'
                        if sfsh != '待提供':
                            sfsh = '已提供'
                        
                        item['sfsh1'] = sfsh

        d = run_sql(f"select * from khsheet3 where (father1='{rid}') and (module1='采购付款核对')")
        if len(d)>0:
            khsheet3_data = d
        
        d = run_sql(f"SELECT NOW() AS date FROM sys_user where username='{str(user.username)}' LIMIT 1")
        if len(d)>0:
            date = d[0].get('date','')
            
        data = {'data_list':data_list,'khsheet3_data': khsheet3_data, 'date': date}

        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid','')
        jsrm = j.get('jsrm','')
        jzrq = j.get('jzrq','')
        jzsj = j.get('jzsj','')
        gcmyd = j.get('gcmyd','')
        yy = j.get('yy','')
        sccj = j.get('sccj','')
        data_list = j.get('data_list',[])
        fkdh = j.get('fkdh','')
        ywhdzt = j.get('ywhdzt','')
        
        sb = ''
        sb1 = ''
        jesb = ''
        btgsb = ''
        msg = ''
        
        if jsrm != '' and jsrm != user.username:
            rq = jzrq + ' ' + jzsj
            d = run_sql(f"SELECT sb, NOW() AS datetime FROM gchk LIMIT 1")
            if len(d)>0:
                if rq < d[0].get('datetime',''):
                    sb = '1'
                    return json_result(-1, '不好意思已过截止时间,系统不能保存!')
                
        if (gcmyd == '不满意' and yy == '') or (gcmyd == '满意' and yy == ''):
            sb = '1'
            return json_result(-1, '需填写满意、不满意原因系统不能保存!')
            
        if sb == '':
            csfather = ''
            if gcmyd == '不满意' or gcmyd == '满意':
                d = run_sql(f"select rid from zycs where (company_name='{str(sccj)}') or (cymch='{str(sccj)}') ")
                if len(d)>0:
                    csfather = d[0].get('rid','')
                    
                if csfather != '':
                    m = zycscpxx()
                    m.rid = str(get_uuid())
                    m.pid = str(csfather)
                    m.cpbh = str(user.username)
                    m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
                    m.uid = str(user.rid)
                    m.lxm = '工厂满意度'
                    m.cpgg = datetime.now().strftime('%Y-%m-%d') + ';' + yy
                    s.add(m)
                    
            if len(data_list) > 0:
                for row in data_list:
                    if row.get('ywhd','') == '':
                        row['ywhd'] = '不通过'
                    if row.get('sfzk','') =='是' and row.get('ywbtgyy','') == '':
                        sb1 = '1'
                        sb = '1'
                    if (row.get('ywhd','') == '不通过' and row.get('ywbtgyy','') == '') and (row.get('cxbg','') == '待提供'):
                        sb1 = '1'
                        sb = '1'
                    
                    if row.get('cxbg','') == '待提供' and row.get('ywhd','') == '通过':
                        jesb = '1'
 
                    if row.get('ywhd','') == '不通过':
                        btgsb = '1'
            
            if sb1 == '1':
                return json_result(-1, '请注意存在暂扣但但没填原因，或业务核对为不通过但没填原因的记录，系统不能保存!')
            
            if jesb == '1':
                msg = '请注意存在诚信报告为待提供的情况!'
            
            if btgsb == '1':
                msg = msg+'\n' +'请注意存在业务核对为不通过记录!'
                
            if jesb == '1' or btgsb == '1':
                xxnr = '付款单号:' + str(fkdh) + '生产厂家' + str(sccj) + '存在诚信报告为待提供或业务核对为不通过记录';
                row = {
                    "xxly": '采购付款核对',
                    "bjdh": fkdh,
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": xxnr,
                    "jsr": jsrm,
                    "sys_path": "我的公司"
                }
                res = module_xxck_new([row],user,s)
                if res.get('code')!=1:
                    return json_result(res.get('code'), res.get('code'))
            
            if sb == '1':
                return json_result(-1, '请注意存在不满足条件的记录，系统不能保存!')
            else:
                if jsrm != user.username and ywhdzt == '完成' and jesb != '1' and btgsb != '1':
                    res = user_task_delete('采购付款核对', rid, s, [])
                    if res.get('code',1) != 1:
                        s.rollback()
                        return json_result(-1, res.get('msg'))
                    
        s.commit()
        return json_result(1, '保存成功！',msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

def ArabiaToChinese(ch: str, flag: bool) -> str:
    mapping = {'0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
               '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'}
    return mapping.get(ch, ch) if len(ch) == 1 else ''

        
@any_route('/api/saier/purchase_payment_verify/plhd/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_plhd_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data_list = j.get('data_list',[])
        sccj1 = j.get('sccj','')
        plhd = j.get('plhd','')
        msg = ''
        i = 0
        
        for item in data_list:
            i = i + 1
            if item.get('cxbg','') == '待提供':
                sfsh = '待提供'
                sccj = item.get('gcmc','')
                chgc = item.get('gcmc1','')
                if sccj == '':
                    sccj = sccj1
                if chgc == '':
                    chgc = sccj
                d = run_sql(f"select * from cxgc where (gcmc='{str(sccj)}') or (chgc='{str(chgc)}') or (gcmc='{str(chgc)}')")
                if len(d)>0:
                    if d[0].get('qrrq','') == '':
                        qrrq1 = '1999-01-01'
                    else:
                        qrrq1 = d[0].get('qrrq','')
                    if calculate_date_difference(qrrq1, datetime.now().strftime('%Y-%m-%d')) > 365:
                        sfsh = '待提供'
                    else:
                        sfsh = '已提供'
                if sfsh != '待提供':
                    sfsh = '已提供'
                item['cxbg'] = sfsh
            else:
                if item.get('ywhd','') == '' and item.get('ywbtgyy','') == '':
                    item['ywhd'] = plhd
                else:
                    item['ywhd'] = '不通过'
            item['Field'] = '是'
            
            if item.get('ywhd','') == '通过':
                srid = ''
                yfje = 0
                if item.get('ly','') == '异地':
                    dl = run_sql(f"select rid,fkhj from ydhk where (sb='{item.get('sb','')}')")
                else:
                    dl = run_sql(f"select rid,fkhj from gchk where (sb='{item.get('sb','')}')")
                if len(dl)>0:
                    srid = dl[0].get('rid','')
                    item['fkhj'] = dl[0].get('fkhj','0')
                
                if item.get('hkje',0) == 0:
                    if item.get('fpje',0) > 0:
                        item['hkje'] = item.get('fpje',0) - item.get('zkje',0) -item.get('fkhj',0)
                        yfje = item.get('fpje',0)
                    else:
                        item['hkje'] = item.get('yfhj',0) - item.get('zkje',0) -item.get('fkhj',0)
                        yfje = item.get('yfhj',0)
                    item['fkhj1'] = item.get('hkje',0) + item.get('fkhj',0)
                    
                    if (item.get('fkh1',0) + item.get('zkje',0)) > yfje:
                        msg = msg + '请注意第'+str(i)+'条付款合计大于需付金额，付款金额清0!'
                        item['hkje'] = 0
                    else:
                        if (yfje - item.get('fkh1',0) + item.get('zkje',0)) <= 10:
                            item['sfjq'] = '是'
                    
                    if item.get('hkje',0) > 0:
                        item['fksb'] = ''
                        item['yhje'] = int(item.get('hkje',0) * 100)
                        item['yhje1'] = ' '.join(item.get('yhje',0)) + ' '
                        what =  f"{float(item.get('hkje',0)):.2f}"
                        mw = item.get('yhje',0)[-1]
                        if mw == '0':
                            item['fkdx'] = amu_to_cn(what) + '整'
                        else:
                            item['fkdx'] = amu_to_cn(what)
                        
            item['Field'] = '否'
                        
        data = {'data_list':data_list,'msg':msg}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/purchase_payment_verify/plfkrq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_plfkrq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data_list = j.get('data_list',[])
        plfkrq = j.get('plfkrq','')
        plhd = j.get('plhd','')
        msg = ''
        i = 0
        
        for item in data_list:
            item['Field'] = '是'
            i = i + 1
            if item.get('ywhd','') == '通过':
                
                if item.get('hkrq','') == '':
                    item['hkrq'] = plfkrq
                    if item.get('hkrq','') != '':
                        if item.get('ly','') == '异地':
                            dl = run_sql(f"select rid,fkhj from ydhk where (sb='{item.get('sb','')}')")
                        else:
                            dl = run_sql(f"select rid,fkhj from gchk where (sb='{item.get('sb','')}')")
                        if len(dl)>0:
                            srid = dl[0].get('rid','')
                            item['fkhj'] = dl[0].get('fkhj','0')
                        
                        pay_date = item.get('hkrq','')
                        
                        d1 = pay_date[0:4]
                        d5 = pay_date[5:7]
                        d7 = pay_date[8:10]
                        
                        item['nsz'] = d1
                        item['ysz'] = d5
                        # item['rsz'] = d7
                        d7 = ''
                        item['rsz'] = d7
                        
                        d1 = ArabiaToChinese(pay_date[0], False)
                        d2 = ArabiaToChinese(pay_date[1], False)
                        d3 = ArabiaToChinese(pay_date[2], False)
                        d4 = ArabiaToChinese(pay_date[3], False) 
                        item['fkn'] = d1 + d2 + d3 + d4
                        
                        d5 = ArabiaToChinese(pay_date[5], False) 
                        d6 = ArabiaToChinese(pay_date[6], False)
                        dd6 = pay_date[6]
                        dd5 = pay_date[5]
                        if dd6 == '0':
                            d9 = '零' + d5 + '拾'
                            item['fky'] = d9
                        else:
                            item['fky'] = d5 + '拾' + d6
                        
                        d7 = ArabiaToChinese(pay_date[8], False)
                        d8 = ArabiaToChinese(pay_date[9], False)
                        dd8 = pay_date[9]
                        dd7 = pay_date[8]

                        if dd8 == '0':
                            t = '零' + d7 + '拾'
                            item['fkr'] = t
                        else:
                            item['fkr'] = d7 + '拾' + d8

                        if dd7 == '0':
                            item['fkr'] = d7 + d8
                
                if item.get('hkje',0) == 0:
                    if item.get('fpje',0) > 0:
                        item['hkje'] = item.get('fpje',0) - item.get('zkje',0) -item.get('fkhj',0)
                        yfje = item.get('fpje',0)
                    else:
                        item['hkje'] = item.get('yfhj',0) - item.get('zkje',0) -item.get('fkhj',0)
                        yfje = item.get('yfhj',0)
                    item['fkhj1'] = item.get('hkje',0) + item.get('fkhj',0)
                    
                    if (item.get('fkh1',0) + item.get('zkje',0)) > yfje:
                        msg = msg + '请注意第'+str(i)+'条付款合计大于需付金额，付款金额清0!'
                        item['hkje'] = 0
                    else:
                        if (yfje - item.get('fkh1',0) + item.get('zkje',0)) <= 10:
                            item['sfjq'] = '是'
                    
                    if item.get('hkje',0) > 0:
                        item['fksb'] = ''
                        item['yhje'] = int(item.get('hkje',0) * 100)
                        item['yhje1'] = ' '.join(item.get('yhje',0)) + ' '
                        what =  f"{float(item.get('hkje',0)):.2f}"
                        mw = item.get('yhje',0)[-1]
                        item['fkdx'] = amu_to_cn(what)
                        
            item['Field'] = '否'
                        
        data = {'data_list':data_list,'msg':msg}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/purchase_payment_verify/plzk/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_plzk_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data_list = j.get('data_list',[])
        yy = j.get('val','')
        
        
        for item in data_list:
            item['Field'] = '是'
            if item.get('zkje',0) == 0 and item.get('sb','') != '':
                if item.get('ly','') != '异地':
                    dl = run_sql(f"select fkhj from gchk where (sb='{item.get('sb','')}')")

                if len(dl)>0:
                    item['hkje'] = dl[0].get('fkhj','0')
                
                if item.get('fpje',0) > 0:
                    item['zkje'] = item.get('fpje',0) - item.get('hkje',0)
                else:
                    item['zkje'] = item.get('yfhj',0) - item.get('hkje',0)
            
            item['sfzk'] = '是'     
            if item.get('ywbtgyy','') == '':
                item['ywbtgyy'] = yy
            
            item['Field'] = '否'
            data = {'data_list':data_list}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/fkzl/fkje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_fkzl_fkje_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkzl = j.get('fkzl',{})
        data = {}
        
        if fkzl.get('Field','') != '是':
            if fkzl.get('ly','') == '异地':
                dl = run_sql(f"select rid,fkhj from ydhk where (sb='{fkzl.get('sb','')}')")
            else:
                dl = run_sql(f"select rid,fkhj from gchk where (sb='{fkzl.get('sb','')}')")
            if len(dl)>0:
                fkzl['fkhj'] = dl[0].get('fkhj','0')
                
            if fkzl.get('ywhd','') != '通过':
                fkzl['hkje'] = 0
                
            if fkzl.get('fpje',0) > 0:
                yfje = fkzl.get('fpje',0)
            else:
                yfje = fkzl.get('yfhj',0)
            fkzl['fkhj1'] = fkzl.get('hkje',0) + fkzl.get('fkhj',0)
            
            if (fkzl.get('fkh1',0) + fkzl.get('zkje',0)) > yfje:
                msg = msg + '请注意第'+str(i)+'条付款合计大于需付金额，付款金额清0!'
                fkzl['hkje'] = 0
            else:
                if (yfje - fkzl.get('fkh1',0) + fkzl.get('zkje',0)) <= 10:
                    fkzl['sfjq'] = '是'
                else:
                    fkzl['sfjq'] = '否'
            
            if fkzl.get('hkje',0) > 0:
                fkzl['fksb'] = ''
                fkzl['yhje'] = int(fkzl.get('hkje',0) * 100)
                fkzl['yhje1'] = ' '.join(fkzl.get('yhje',0)) + ' '
                what =  f"{float(fkzl.get('hkje',0)):.2f}"
                fkzl['fkdx'] = amu_to_cn(what)
            

        data = {'fkzl': fkzl}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/fkzl/fkrq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_fkzl_fkrq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fkzl = j.get('fkzl',{})
        data = {}
        
        if fkzl.get('Field','') != '是':
            
            if fkzl.get('ywhd','') != '通过':
                fkzl['hkrq'] = ''
            if fkzl.get('hkrq','') != '':
                if fkzl.get('ly','') == '异地':
                    dl = run_sql(f"select rid from ydhk where (sb='{fkzl.get('sb','')}')")
                else:
                    dl = run_sql(f"select rid from gchk where (sb='{fkzl.get('sb','')}')")
                if len(dl)>0:
                    srid = dl[0].get('rid','')
                    
                    pay_date = fkzl.get('hkrq','')
                    
                    d1 = pay_date[0:4]
                    d5 = pay_date[5:7]
                    d7 = pay_date[8:10]
                    
                    fkzl['nsz'] = d1
                    fkzl['ysz'] = d5
                    # fkzl['rsz'] = d7
                    d7 = ''
                    fkzl['rsz'] = d7
                    
                    d1 = ArabiaToChinese(pay_date[0], False)
                    d2 = ArabiaToChinese(pay_date[1], False)
                    d3 = ArabiaToChinese(pay_date[2], False)
                    d4 = ArabiaToChinese(pay_date[3], False) 
                    fkzl['fkn'] = d1 + d2 + d3 + d4
                    
                    d5 = ArabiaToChinese(pay_date[5], False) 
                    d6 = ArabiaToChinese(pay_date[6], False)
                    dd6 = pay_date[6]
                    dd5 = pay_date[5]
                    if dd6 == '0':
                        d9 = '零' + d5 + '拾'
                        fkzl['fky'] = d9
                    else:
                        fkzl['fky'] = d5 + '拾' + d6
                    if dd5 == '0':
                        fkzl['fky'] = d5 + d6
                    
                    d7 = ArabiaToChinese(pay_date[8], False)
                    d8 = ArabiaToChinese(pay_date[9], False)
                    dd8 = pay_date[9]
                    dd7 = pay_date[8]

                    if dd8 == '0':
                        t = '零' + d7 + '拾'
                        fkzl['fkr'] = t
                    else:
                        fkzl['fkr'] = d7 + '拾' + d8

                    if dd7 == '0':
                        fkzl['fkr'] = d7 + d8
            

        data = {'fkzl': fkzl}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/fkzl/zkje/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_fkzl_zkje_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        ly = j.get('ly','')
        sb = j.get('sb','')
        data = {}
        fkje1 = ''
        srid = 0

        if ly == '异地':
            dl = run_sql(f"select rid,fkhj from ydhk where (sb='{str(sb)}')")
        else:
            dl = run_sql(f"select rid,fkhj from gchk where (sb='{str(sb)}')")
        if len(dl)>0:
            fkje1 = dl[0].get('fkhj',0)
            srid = dl[0].get('rid','')

        data = {'srid': srid,'fkje1': fkje1}
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/user/change', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_user_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        pid = j.get('rid')
        l = j.get('line')
        yhm = l.get('ywry')
        ywybh = l.get('ywybh')
        
        bm = ''
        rybh = ''
        objectnumber1 = ''
        path = ''
        d = s.query(ywrybiao.bm,ywrybiao.bmjl,ywrybiao.rybh,sys_user.rid,sys_user.path).filter(ywrybiao.yhm==yhm).outerjoin(sys_user,sys_user.username==ywrybiao.yhm).first()
        if d:
            bm = str(d.bm)
            rybh = str(d.rybh)
            objectnumber1 = str(d.rid)
            path = str(d.path)
            
        d = s.query(sys_cgfkhd_share).filter(sys_cgfkhd_share.record_id==pid,sys_cgfkhd_share.to_uid==objectnumber1).first()
        if not d:
            res = module_share_new('采购付款核对',yhm,pid,user,s)
            if res.get('code')!=1:
                s.rollback()
                return json_result(res.get('code'),res.get('msg'))
            
        d = s.query(khsheet3).filter(khsheet3.ywry==yhm,khsheet3.module1=='采购付款核对',khsheet3.father1==pid).first()
        if not d:
            m = khsheet3()
            m.rid = get_uuid()
            m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
            
            m.ywry = yhm
            m.ywybh = ywybh
            m.cyz = bm
            m.father1 = pid
            m.module1 = '采购付款核对'
            m.objectnumber1 = objectnumber1
            m.ywry1 = yhm
            m.objectkind1 =  1
            m.sys_path = path
            s.add(m)
        
        s.commit()
        data = {'bm': bm, 'rybh': rybh,'objectnumber1': objectnumber1}
        return json_result(1, '修改成功！', data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
@any_route('/api/saier/purchase_payment_verify/user/delete', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_user_delete(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        l = j.get('line')
        code = 1
        msg = '校验成功'
        ywry = l.get('ywry')
        spid = l.get('pid')
        uid = ''
        u = s.query(sys_user.rid).filter(sys_user.username==ywry).first()
        if u:
            uid = str(u.rid)

        if ywry != '':
            s.query(sys_cgfkhd_share).filter(sys_cgfkhd_share.record_id==spid,sys_cgfkhd_share.to_uid==uid).delete()
            s.query(khsheet3).filter(khsheet3.ywry==ywry,khsheet3.module1=='采购付款核对',khsheet3.father1==spid).delete()
            s.commit()

        return json_result(code, msg)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/purchase_payment_verify/button/cxgc', methods=['POST', 'GET'])
@require_token
async def view_saier_purchase_payment_verify_button_cxgc(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        sccj1 = j.get('sccj','')
        data_list = j.get('data_list','')
        
        if sccj1 != '':
            if len(data_list) > 0:
                for item in data_list:
                    if item.get('cxbg','') == '待提供':
                        sfsh = '待提供'
                        sccj = item.get('gcmc','')
                        chgc = item.get('gcmc1','')
                        if sccj == '':
                            sccj = sccj1
                        if chgc == '':
                            chgc = sccj
                        d = run_sql(f"select * from cxgc where (gcmc='{str(sccj)}') or (chgc='{str(chgc)}') or (gcmc='{str(chgc)}')")
                        if len(d)>0:
                            if d[0].get('qrrq','') == '':
                                qrrq1 = '1999-01-01'
                            else:
                                qrrq1 = d[0].get('qrrq','')
                            if calculate_date_difference(qrrq1, datetime.now().strftime('%Y-%m-%d')) > 365:
                                sfsh = '待提供'
                            else:
                                sfsh = '已提供'
                        if sfsh != '待提供':
                            sfsh = '已提供'
                        
                        item['sfsh1'] = sfsh
        data = {'data_list':data_list}
        
        return json_result(1, '查询成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
