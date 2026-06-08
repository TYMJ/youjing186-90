from math import e, trunc
from operator import inv


from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import user_task_delete, user_task_new, module_xxck_new, get_user_path
import time, re
from datetime import datetime, timedelta
# from aspose.cells_foss import Workbook as workbook
#  pip install aspose-cells-foss
#  linux 系统需要安装 sudo yum install -y java-11-openjdk-devel

@any_route('/api/saier/incomes/fphm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_fphm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        module = j.get('module')
        skbz = j.get('skbz')
        d = j.get('row')
        sydje = d.get('sydje') or 0
        if d.get('fphm') == None or d.get('fphm') == '':
            return json_result(0, '发票号码为空不用处理')

        c = s.query(fpgl.rid).filter(fpgl.fphm == d.get('fphm'), or_(fpgl.sfjd == '是', fpgl.shsd == '是')).first()
        if c:
            return json_result(-1, '该发票号码已结单或财务锁定,不能修改')
        
        fphm = d.get('fphm')
        fphm1 = d.get('fphm1')
        xsht = d.get('wxht')
        djrq = d.get('djrq')
        chyrq = d.get('chyrq')
        rid = d.get('rid')
        htje = 0
        cydh2 = []
        line = {}

        jjxje = 0
        field_str = 'ywry,ywbm,ysfp,khmc,htje,sjcy1,RMBkh,myjje,ayjje,yjje,htjer,htjem,jxje1,jxje2,jxje3,jjxje1,jjxje2,jjxje3'
        fields = field_str.split(',')
        c = s.query(*[getattr(cymx, field) for field in fields]).filter(cymx.fphm == fphm).first()
        if c:
            line = alchemy_object_to_dict(c)
        else:
            field_str = 'chyrq,ywry,ywbm,khmc,kh_id,RMBkh,myjje,ayjje,yjje,htje'
            fields = field_str.split(',')
            c = s.query(*[getattr(bgmxd, field) for field in fields]).filter(bgmxd.fphm == fphm).first()
            if c:
                line = alchemy_object_to_dict(c)
        hj = 0
        yshje_rmb = 0
        yshje_usd = 0
        if sydje > 0:
            # c = s.query(func.sum(khdjsheet.sydje).label('sydje')).filter(khdjsheet.wxht == xsht).first()
            # if c:
            #     hj = float(c.sydje) if c.sydje else 0
            c = s.query(func.sum(krshsheet.sydje).label('sydje')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid).first()
            if c:
                hj = hj + float(c.sydje) if c.sydje else 0     
            c = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥')).first()
            if c:
                yshje_rmb = float(c.syhj) if c.syhj else 0
            c = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥').first()
            if c:
                yshje_usd = float(c.syhj) if c.syhj else 0
    
        return json_result(1, '操作成功', {'line': line, 'yshje_rmb': yshje_rmb, 'yshje_usd': yshje_usd, 'hj': hj})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/hbdm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_hbdm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        mjhl = 1
        d = s.query(hbdm).filter(hbdm == "USD$").first()
        if d:
            mjhl = float(d.hhl)

        return json_result(1, '操作成功', mjhl)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

def shqk_new_update(d, djr, djm, user, s):
    try:
        fphm = d.get('fphm')
        c = s.query(shqk).filter(shqk.fphm == fphm).first()
        if not c:
            c = shqk()
            c.rid = get_uuid()
            c.uid = user.rid
            c.ctime = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
            c.fphm = fphm
        
        org = get_user_path(user.username)
        jpath = org.get('path')
        c.webpd = '是'
        c.kh_id = d.get('kh_id')
        c.khmc = d.get('khmc')
        c.fphm = d.get('fphm')
        c.htjez = d.get('htje')
        c.djjez = d.get('hjsh')
        c.wsjez = d.get('wsje')
        c.htje = d.get('htjer')
        c.htjem = d.get('htjem')
        c.wsje = round((d.get('htjer', 0) - d.get('djjerZ', 0)) * 1000) / 1000
        c.wsjem = round((d.get('htjem', 0) - d.get('djjemZ', 0)) * 1000) / 1000
        if (d.get('hbdm') == 'RMB') or (d.get('hbdm') == 'RMB￥'):
            c.RMBkh = '是'
        else:
            c.RMBkh = '否'
        c.djje = d.get('djjerZ')
        c.djjem = d.get('djjemZ')
        c.shrq = d.get('djrq')
        # c.xybx = ''
        # c.jgtk = ''
        # c.jhfs = ''
        c.ydqx = 0
        # c.sjcy1 = d.get('sjcy1')
        # c.yssj = ''
        c.yqts = 0
        c.ywry = d.get('ywry')
        c.ywpath = jpath
        c.sfjq = d.get('sfjq')
        c.djr = djr
        c.djm = djm
        c.sfdj = d.get('sfdj')

        return {'code': 1, 'msg': '操作成功'}
    except:
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}

@any_route('/api/saier/incomes/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        module = j.get('module')
        lines = j.get('lines', [])
        ssbm = j.get('ssbm', '')
        shdh = j.get('shdh')
        if ssbm == '' and ssbm == None:
            org = get_user_path(user.username)
            ssbm = org.get('path')
            ssbm = ssbm if ssbm != None else ''
        shmxts = 0
        if '优景' in ssbm:
            c = s.query(cwjxrq).filter(cwjxrq.szgs.like("%优景%")).first()
            if c and c.shmxts:
                shmxts = int(c.shmxts)
        
        new_data = []
        o = get_module(module)
        g = o.group_by_name('详细用途')
        c = get_model_by_table_name(g.table_name)
        a = s.query(c).filter(c.pid == rid).all()
        # old_data = [d.fphm for d in a if d.fphm != None and d.fphm != '' and d.fphm not in old_data]
        for d in lines:
            if d.get('fphm') == None or d.get('fphm') == '':
                return json_result(-1, '发票号码不能为空')
            if d.get('fphm') not in new_data:
                new_data.append(d.get('fphm'))
            else:
                return json_result(-1, '发票号码不能重复')
        # new_data = [d.get('fphm') for d in lines if d.get('fphm') != None and d.get('fphm') != '' and d.get('fphm') not in new_data]
        # lines.extend([alchemy_object_to_dict(i) for i in d])
        js_data = {}
        hj = 0
        for d in lines:
            if d.get('fphm') == None or d.get('fphm') == '':
                continue
                # return json_result(0, '发票号码为空不用处理')
            c = s.query(fpgl.rid).filter(fpgl.fphm == d.get('fphm'), or_(fpgl.sfjd == '是', fpgl.shsd == '是')).first()
            if c:
                return json_result(-1, '该发票号码已结单或财务锁定,不能修改')
            js_data[d.get('rid')] = {'yshje_rmb': 0, 'yshje_usd': 0, 'hj': 0, 'djr': 0, 'djm': 0}
            fphm = d.get('fphm')
            fphm1 = d.get('fphm1')
            xsht = d.get('wxht')
            cyrq = d.get('cyrq')
            rid = d.get('rid')
            djrq = d.get('djrq')
            htjer = d.get('htjer') or 0
            htjem = d.get('htjem') or 0
            sydje = d.get('sydje') or 0
            hjshz = 0
            hjshz2 = d.get('sydje2') or 0
            sfdj = d.get('sfdj')
            shlx = d.get('shlx')
            cpbh = d.get('cpbh')
            htje = 0
            djr = 0
            djm = 0
            cydh2 = []
            cydh = ''
            if (shlx == '检测费' and xsht != '' and xsht != None) and (cpbh != '' and cpbh != None):
                s.query(fysqsheet).update({fysqsheet.sfsh: '是', fysqsheet.shdh: shdh}, synchronize_session=False).filter(fysqsheet.wxht == xsht, fysqsheet.hklx1 == '检测费', fysqsheet.cpbh.like("%"+cpbh+"%"))
            s.query(fpgl).filter(or_(fpgl.wxfp == fphm, fpgl.hsfp==fphm), fpgl.sfjd == '否', fpgl.shsd == '否').update({fpgl.webpdsh: '是'}, synchronize_session=False)

            c = s.query(cymx.chydh).filter(cymx.fphm == fphm).first()
            if c and c.chydh and c.chydh != '':
                cydh2.append(c.chydh)
                cydh = c.chydh
            c = s.query(cymx.chydh).filter(cymx.fphm == xsht).first()
            if c and c.chydh and c.chydh != '' and c.chydh not in cydh2:
                cydh2.append(c.chydh)

            c = s.query(func.sum(krshsheet.sydje2).label('syhj')).filter(krshsheet.fphm == fphm).first()
            if c and c.syhj:
                hj = hj + float(c.syhj) if c.syhj else 0
            
            c = s.query(func.sum(krshsheet.sydje2).label('syhj')).filter(krshsheet.fphm == fphm, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥'), krshsheet.pid!=d.get('pid')).first()
            if c and c.syhj:
                js_data[d.get('rid')]['yshje_rmb'] = float(c.syhj) if c.syhj else 0
            c = s.query(func.sum(krshsheet.sydje2).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥', krshsheet.pid!=d.get('pid')).first()
            if c and c.syhj:
                js_data[d.get('rid')]['yshje_usd'] = float(c.syhj) if c.syhj else 0
            c = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥'), krshsheet.pid!=d.get('pid'), krshsheet.sfdj == '是').first()
            if c and c.syhj:
                js_data[d.get('rid')]['djr'] = float(c.syhj) if c.syhj else 0

            c = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥', krshsheet.pid!=d.get('pid'), krshsheet.sfdj == '是').first()
            if c and c.syhj:
                js_data[d.get('rid')]['djm'] = float(c.syhj) if c.syhj else 0

            if module == '客户收汇':
                suffixes = ['','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            else:
                suffixes = ['','A', 'B', 'C', 'D', 'E', 'F']
            index = 0
            for cydh3 in cydh2:
                index += 1
                htje1 = 0
                
                fphm_list = [str(cydh3) + suffix for suffix in suffixes]
                c = s.query(func.ifnull(func.sum(func.ifnull(krshsheet.sydje2,0)),0).label('syhj')).filter(krshsheet.fphm.in_(fphm_list)).first()
                if c and c.syhj:
                    hjshz = float(c.syhj)
                c = s.query(krshsheet.rid).filter(krshsheet.fphm.in_(fphm_list), krshsheet.pid != rid).first()
                if c:
                    b = s.query(krsh.djrq).filter(krsh.rid == rid).first()
                    if b:
                        djrq = b.djrq
                if sydje > 0:
                    hjshz = hjshz + hjshz2
                # 更新放单申请主表和子表的金额
                c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == cydh3).first()
                if c:
                    pid = c.pid
                    htje = copy.deepcopy(c.sydje)
                    c.sydje = hjshz
                    s.add(c)
                    sb1 = ''
                    htje1 = 0
                    sydje1 = 0
                    flag = 0
                    b = s.query(func.ifnull(func.sum(fdsq1sheet.sydje), 0).label('sydje1')).filter(fdsq1sheet.pid == pid).first()
                    if b and b.sydje1:
                        sydje1 = float(b.sydje1)
                    b = s.query(fdsq1).filter(fdsq1.rid == pid).first()
                    if b:
                        
                        htje1 = float(b.htje)
                        if b.shje and  sydje1 > b.shje:
                            sb1 = '1'
                        if index == 1:
                            b.shrq = djrq if djrq else None
                            flag = 1
                        if sb1 == '1':
                            b.shje = sydje1
                            b.wshje = htje1 - sydje1
                            flag = 1
                    if flag == 1:
                        s.add(b)

            if sydje > 0:
                b = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥'), krshsheet.sfdj == '是').first()
                if b:
                    djr = float(b.syhj) if b.syhj else 0
                b = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥', krshsheet.sfdj == '是').first()
                if b:
                    djm = float(b.syhj) if b.syhj else 0  
                if sfdj == '是':
                    djr = htjer + djr
                    djm = htjem + djm

            res = shqk_new_update(d, djr, djm, user, s)
            if res.get('code') != 1:
                s.rollback()
                return json_result(-1, res.get('msg'))

        cydh2 = []
        for r in a:
            if r.fphm in new_data:
                continue
            sydje = r.sydje or 0
            c = s.query(cymx.chydh).filter(cymx.fphm == r.fphm).first()
            if c and c.chydh and c.chydh != '' and c.chydh not in cydh2:
                cydh2.append(c.chydh)
            if module == '客户收汇':
                suffixes = ['','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            else:
                suffixes = ['','A', 'B', 'C', 'D', 'E', 'F']
            index = 0
            for cydh3 in cydh2:
                index += 1
                htje1 = 0
                
                fphm_list = [str(cydh3) + suffix for suffix in suffixes]
                c = s.query(func.sum(krshsheet.sydje2.label('syhj'))).filter(krshsheet.fphm.in_(fphm_list)).first()
                if c and c.syhj:
                    hjshz = float(c.syhj)
                c = s.query(krshsheet.rid).filter(krshsheet.fphm.in_(fphm_list), krshsheet.pid != rid).first()
                if c:
                    b = s.query(krsh.djrq).filter(krsh.rid == rid).first()
                    if b:
                        djrq = b.djrq
                if sydje > 0:
                    hjshz = hjshz + hjshz2
                # 更新放单申请主表和子表的金额
                c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == cydh3).first()
                if c:
                    pid = c.pid
                    c.sydje = hjshz
                    s.add(c)
                    sb1 = ''
                    htje1 = 0
                    sydje1 = 0
                    flag = 0
                    b = s.query(func.ifnull(func.sum(fdsq1sheet.sydje), 0).label('sydje1')).filter(fdsq1sheet.pid == pid).first()
                    if b and b.sydje1:
                        sydje1 = float(b.sydje1)
                    b = s.query(fdsq1).filter(fdsq1.rid == pid).first()
                    if b:
                        
                        htje1 = float(b.htje)
                        if b.shje and  sydje1 > b.shje:
                            sb1 = '1'
                        if index == 1:
                            b.shrq = djrq if djrq else None
                            flag = 1
                        if sb1 == '1':
                            b.shje = sydje1
                            b.wshje = htje1 - sydje1
                            flag = 1
                    if flag == 1:
                        s.add(b)

            djr = 0
            djm = 0
            b = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥'), krshsheet.sfdj == '是').first()
            if b:
                djr = float(b.syhj) if b.syhj else 0
            b = s.query(func.sum(krshsheet.sydje).label('syhj')).filter(krshsheet.fphm == fphm, krshsheet.pid != rid, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥', krshsheet.sfdj == '是').first()
            if b:
                djm = float(b.syhj) if b.syhj else 0
            l = s.query(krshsheet).filter(krshsheet.fphm == r.fphm, krshsheet.pid!=rid).order_by(krshsheet.sid.desc()).first()
            if l:
                l = alchemy_object_to_dict(l) if l else {}
                res = shqk_new_update(l, djr, djm, user, s)
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
            else:
                x = s.query(cymx.fphm,cymx.htje,cymx.ywry,cymx.shqx,cymx.myjje,cymx.ysdj,cymx.htjer,cymx.htjem,cymx.RMBkh,cymx.rid).filter(cymx.fphm == r.fphm).first()
                if x:
                    k = {}
                    k['fphm'] = r.fphm
                    k['djjez'] = 0
                    k['wsjez'] = (x.htje or 0) - (x.myjje or 0)
                    k['djjem'] = 0
                    k['djjer'] = 0
                    k['webpd'] = '是'
                    k['ysdj'] = x.ysdj or 0
                    if x.RMBkh == '是':
                        k['htje'] = k.htjer - k.myjje
                        k['wsje'] = round((k.htjer - k.myjje * 1000) / 1000)
                        k['htjem'] = k.htjem 
                        k['wsjem'] = round((k.htjem - k.myjje  * 1000) / 1000)
                        if round((k.htjer - k.myjje  * 1000) / 1000 < 200) and round((k.htjer - k.myjje  * 1000) / 1000 > -1):
                            k['sfjq']  = '是'
                        else:
                            k['sfjq']  = '否'
                    else:
                        k['htje'] = k.htjer 
                        k['wsje'] = round((k.htjer - k.myjje  * 1000) / 1000)
                        k['htjem'] = k.htjem - k.myjje 
                        k['wsjem'] = round((k.htjem - k.myjje  * 1000) / 1000)
                        if round((k.htjem - k.myjje  * 1000) < 30) and round((k.htjem - k.myjje  * 1000) > -1):
                            k['sfjq']  = '是'
                        else:
                            k['sfjq']  = '否'
                    res = shqk_new_update(k, 0, 0, user, s)
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(-1, res.get('msg'))
                else:
                    s.query(shqk).filter(shqk.fphm == r.fphm).delete()
        
        s.commit()
    
        return json_result(1, '操作成功', {'ssbm': ssbm, 'shmxts': shmxts, 'js_data': js_data})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        org = get_user_path(user.username)
        position = org.get('position')

        return json_result(1, '操作成功', {'position': position})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/child/delete/check', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_child_delete_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        d = j.get('row')
        rid = d.get('rid')
        fphm = d.get('fphm')
        RMBkh = d.get('RMBkh')
        yhhl = j.get('yhhl') or 1
        sywhz = 0
        sydje = d.get('sydje') or 0
        cxnf = j.get('cxnf') or ''
        org = get_user_path(user.username)
        position = org.get('position')
        flag = 0
        if '财务' in position:
            if cxnf != '是': 
                flag = 1
        else:
            if cxnf == '是':
                flag = 1
        # if flag == 0:
        #     return json_result(-1, '无权删除记录')

        if RMBkh == '是':
            if 'RMB' in RMBkh:
                sywhz = sydje
            else:
                sywhz = sydje * yhhl
        else:
            if 'RMB' in RMBkh:
                sywhz = sydje / yhhl
            else:
                sywhz = sydje

        cydh1 = ''
        djrq = None
        c = run_sql(f"select rid,fphm,htje,ywry,shqx,chydh from cymx where (fphm='{fphm}')")
        if len(c) > 0:
            cydh1 = c[0].chydh

        if cydh1 != '' and cydh1 != None:
            suffixes = ['','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            htje1 = 0
            fphm_list = [str(cydh1) + suffix for suffix in suffixes]
            c = s.query(func.sum(krshsheet.sydje2.label('syhj'))).filter(krshsheet.fphm.in_(fphm_list)).first()
            if c and c.syhj:
                hjshz = float(c.syhj)
            c = s.query(krshsheet.rid).filter(krshsheet.fphm.in_(fphm_list), krshsheet.pid != rid).first()
            if c:
                b = s.query(krsh.djrq).filter(krsh.rid != rid, krsh.fphm == fphm).first()
                if b:
                    djrq = b.djrq

            c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == cydh1).first()
            if c:
                pid = c.pid
                c.sydje = hjshz
                s.add(c)
                htje1 = 0
                sydje1 = 0
                b = s.query(func.ifnull(func.sum(fdsq1sheet.sydje), 0).label('sydje1')).filter(fdsq1sheet.pid == pid).first()
                if b and b.sydje1:
                    sydje1 = float(b.sydje1)
                b = s.query(fdsq1).filter(fdsq1.rid == pid).first()
                if b:
                    b.shrq = djrq if djrq else None
                    htje1 = float(b.htje)
                    if b.shje and  sydje1 > float(b.shje) - sywhz:
                        b.shje = sydje1
                        b.wshje = htje1 - sydje1
                    s.add(b)

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/notice/batch', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_notice_batch(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        flag = 0
        org = get_user_path(user.username)
        if not '财务' in org.get('position'):
            return json_result(-1, '无权操作')
        
        for rid in rids:
            c = s.query(krsh).filter(krsh.rid == rid,func.ifnull(krsh.jsrm,'')=='',krsh.rltj!='是' ).first()
            if not c:
                continue
            c.cxnf = '是'
            s.add(c)
            flag = 1
            user_list = []
            tz = '客户收汇认领通知:客户名称:' + str(c.khmc) + '收汇银行:' + c.shyh + '收汇日期' + str(c.djrq.strftime('%Y-%m-%d')) + '收汇净额' + str(c.djmj)
            d = run_sql(f"select ywry from khsheet3 where (company_name='{str(c.khmc)}') and (ywry<> '侯柳红') and (ywry<>'陈妍科') and (ywry<>'周玲燕')")
            user_list = [r.get('ywry') for r in d if r.get('ywry') and r.get('ywry') != '' and r.get('ywry') not in user_list]
            if len(user_list) == 0:
                d = run_sql(f"select yhm from ywrybiao where (zw like '%外销%')")
                user_list = [r.get('yhm') for r in d if r.get('yhm') and r.get('yhm') != '']

            if len(user_list) == 0:
                continue
            res = user_task_new('客户收汇', rid, '收汇单号', '客户收汇[收汇单号]认领通知', tz, user, s, user_list, True)
            if res.get('code') != 1:
                s.rollback()
                return json_result(res.get('code'), res.get('msg'))

        if flag == 0:            
            return json_result(-1, '没有符合条件的记录')

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/child/sfjq/check', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_child_sfjq_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        flag = 0
        org = get_user_path(user.username)
        d = j.get('row')
        wsje = d.get('wsje') or 0
        skbz = j.get('skbz')
        sfjq = d.get('sfjq')
        htje = d.get('htje') or 0
        if sfjq != '是':
            return json_result(0, '是否结清不为是跳过后续操作')
        if skbz !='RMB' and skbz != 'RMB￥' and skbz !='￥':
            tjje = 100
        if not '财务' in org.get('position') and (wsje > tjje or wsje < -100) and htje>10:
            return json_result(-1, '未收金额大于' + str(tjje) + ',请通知财务确认')
        if '财务' in org.get('position') and (wsje > tjje or wsje < -100) and htje>10:
            return json_result(2, '未收金额大于' + str(tjje) + ',请确认是否结清')

        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:        
        s.close()


@any_route('/api/saier/incomes/child/sfjq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_incomes_child_sfjq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        flag = 0
        org = get_user_path(user.username)
        d = j.get('row')
        wsje = d.get('wsje') or 0
        tjje = 200
        skbz = j.get('skbz')
        sfjq = d.get('sfjq')
        fphm = d.get('fphm')
        if sfjq != '是':
            return json_result(0, '是否结清不为是跳过后续操作')
        

        cydh = ''
        number = ''
        c = s.query(cymx.chydh, cymx.rid).filter(cymx.fphm == fphm).first()
        if c:
            cydh = c.chydh
            number = c.rid
    
        if sfjq == '是':
            if fphm != '' and fphm != None:
                res = user_task_delete('客户收汇', rid, s, [], '收汇提醒' + str(fphm))
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                res = user_task_delete('客户收汇', rid, s, [], '逾期收汇提醒' + str(fphm))
                if res.get('code') != 1:
                    s.rollback()
                    return json_result(-1, res.get('msg'))
                s.query(shqk).filter(shqk.fphm == fphm).update({shqk.sfjq: '是'}, synchronize_session=False)
                s.query(krshsheet).filter(krshsheet.fphm == fphm, krshsheet.pid != rid).update({krshsheet.sfjq: '是'}, synchronize_session=False)
                s.query(cymx).filter(cymx.fphm == fphm).update({cymx.cwjq: '是', cymx.dgsyts: 999}, synchronize_session=False)
                if number != '' and number != None:      
                    res = user_task_delete('出运明细', number, s, [], '出运发票')
                    if res.get('code') != 1:
                        s.rollback()
                        return json_result(-1, res.get('msg'))

            if cydh != '' and cydh != None:
                suffixes = ['','A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
                htje1 = 0
                fphm_list = [str(cydh) + suffix for suffix in suffixes]
                c = s.query(func.sum(krshsheet.sydje2).label('syhj')).filter(krshsheet.fphm.in_(fphm_list)).first()
                if not c or not c.syhj or c.syhj == 0:
                    c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == fphm).first()
                    if c:
                        pid = c.pid
                        c.cpjq = '是'
                        s.add(c)
                        c = s.query(fdsq1sheet).filter(fdsq1sheet.pid == pid, fdsq1sheet.cpjq == '否').first()
                        if not c:
                            b = s.query(fdsq1).filter(fdsq1.rid == pid).first()
                            if b:
                                b.cpjq = '是'
                                s.add(b)
        else:
            if fphm != '' and fphm != None:
                s.query(shqk).filter(shqk.fphm == fphm).update({shqk.sfjq: '否'}, synchronize_session=False)
                s.query(krshsheet).filter(krshsheet.fphm == fphm, krshsheet.pid != rid).update({krshsheet.sfjq: '否'}, synchronize_session=False)
                s.query(cymx).filter(cymx.fphm == fphm).update({cymx.cwjq: user.username + '不确认,' + str(time.strftime('%Y-%m-%d'))}, synchronize_session=False)
                c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == fphm).first()
                if c:
                    pid = c.pid
                    c.cpjq = '否'
                    s.add(c)
                    b = s.query(fdsq1).filter(fdsq1.rid == pid).first()
                    if b:
                        b.cpjq = '否'
                        s.add(b)

        s.commit()
        return json_result(1, '操作成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/incomes/date/export',methods=['POST'])
@require_token
async def api_saier_incomes_date_export(request):
    j = await request.json()
    s = Session()
    try:
        rids = j.get('rids',[])
        wb = Workbook() # 新建Excel文件
        ws = wb.active # wb.create_sheet() # 默认激活第一个sheet
        index = 2
        ws['A1'] = '业务组'
        ws['B1'] = '平均收汇天数'
        for rid in rids:
            d = s.query(krshsheet.ywbm,func.ifnull(func.sum(func.ifnull(krshsheet.shts,0)),0).label('shts'),
                func.sum(krshsheet.rid).label('qty')).filter(krshsheet.pid==rid, krshsheet.sfjq=='是').group_by(krshsheet.ywbm).all() 
            for r in d:
                ws['A%d'%index] = r.ywbm
                if r.shts and r.qty and r.qty != 0:
                    ws['B%d'%index] = float(r.shts)/float(r.qty)
                index += 1
                
        if index == 2:
            return json_result(-1, '没有数据可以导出')
        
        file_name = f"收汇周期导出_{get_uuid()}.xlsx"
        file_path = os.path.join(config.tmp_path, file_name)
        wb.save(file_path)
        return json_result(1, "success", {
            "file_name": "收汇周期导出.xlsx",
            "file_path": file_name
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, msg=trace_error())
    finally:
        s.close()
    pass


@any_route('/api/saier/incomes/test/export',methods=['POST'])
@require_token
async def api_saier_incomes_test_export(request):
    j = await request.json()
    s = Session()
    try:
        wb = workbook(os.path.join(config.tmp_path, '1234.xlsx')) # 加载Excel模板
        # wb = Workbook() # 新建Excel文件
        ws = wb.worksheets[0]   
        # 写入数据
        ws.cells["A1"].value = "Hello, Aspose.Cells!"
        ws.cells["A2"].value = 42
        ws.cells["A3"].value = "在 Linux 上运行"
        
        file_name = f"收汇周期导出_{get_uuid()}.xlsx"
        file_path = os.path.join(config.tmp_path, file_name)
        wb.save(file_path)
        return json_result(1, "success", {
            "file_name": "test.xlsx",
            "file_path": file_name
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, msg=trace_error())
    finally:
        s.close()
    pass


@any_route('/api/saier/incomes/data/export',methods=['POST'])
@require_token
async def api_saier_incomes_data_export(request):
    j = await request.json()
    s = Session()
    try:
        rids = j.get('rids',[])
        wb = Workbook() # 新建Excel文件
        ws = wb.active # wb.create_sheet() # 默认激活第一个sheet
        ws['A1'] = '收汇单号'
        ws['B1'] = '发票号码'
        ws['C1'] = '外销合同'
        ws['D1'] = '客户名称'
        ws['E1'] = '货币代码'
        ws['F1'] = '收汇（使用）日期'
        ws['G1'] = '收汇外汇'
        ws['H1'] = '已用外汇'
        ws['I1'] = '使用金额'
        ws['J1'] = '收款银行'
        ws['K1'] = '银行外汇'
        ws['L1'] = '剩余外汇'
        ws['M1'] = '收汇金额'
        ws['N1'] = '已用金额'
        ws['O1'] = '银行汇率'
        ws['P1'] = '银行费用'
        ws['Q1'] = '剩余金额'
        ws['R1'] = '合同号码'
        ws['S1'] = '经手人名'
        ws['T1'] = '是否结清'
        ws['U1'] = '业务人员'
        ws['V1'] = '使用公司'
        ws['W1'] = '使用备注'
        i = 1
        for rid in rids:
            d = s.query(krsh).filter(krsh.rid==rid).first()
            if not d:
                continue
            i += 1 
            ws['A%d'%i] = str(d.djdh)
            ws['D%d'%i] = d.khmc
            ws['E%d'%i] = d.hbdm
            if d.djrq != None and d.djrq != '':
                ws['F%d'%i] = str(d.djrq)[:10]
            ws['G%d'%i] = float(d.djmj) if d.djmj else 0
            ws['H%d'%i] = float(d.yymj) if d.yymj else 0
            ws['K%d'%i] = float(d.yhmj) if d.yhmj else 0
            ws['L%d'%i] = float(d.symj) if d.symj else 0
            ws['M%d'%i] = float(d.djje) if d.djje else 0
            ws['N%d'%i] = float(d.yyje) if d.yyje else 0
            ws['O%d'%i] = float(d.yhhl) if d.yhhl else 0
            ws['P%d'%i] = float(d.yhfy) if d.yhfy else 0
            ws['Q%d'%i] = float(d.syje) if d.syje else 0
            ws['R%d'%i] = d.hthm
            ws['S%d'%i] = d.jsrm
            ws['T%d'%i] = d.sfjq
            m = s.query(krshsheet).filter(krshsheet.pid==rid).all() 
            for c in m:
                i += 1
                ws['B%d'%i] = c.ysfp
                ws['C%d'%i] = c.wxht
                ws['H%d'%i] = float(c.sydje) if c.sydje else 0
                ws['E%d'%i] = c.hbdm
                if c.syrq != None and c.syrq != '':
                    ws['F%d'%i] = str(c.syrq)[:10]
                ws['I%d'%i] = float(c.syqje) if c.syqje else 0
                ws['J%d'%i] = c.skyh
                ws['O%d'%i] = float(c.yhhl) if c.yhhl else 0
                ws['U%d'%i] = c.ywry
                ws['V%d'%i] = c.sygs
                ws['W%d'%i] = c.sybz
        
        if i == 1:
            return json_result(-1, '没有数据可以导出')
        
        file_name = f"收汇资料导出_{get_uuid()}.xlsx"
        file_path = os.path.join(config.tmp_path, file_name)
        wb.save(file_path)
        return json_result(1, "success", {
            "file_name": "收汇资料导出.xlsx",
            "file_path": file_name
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, msg=trace_error())
    finally:
        s.close()
    pass


def convert_date(djrqz: str) -> str:
    """将日期字符串统一转换为 YYYY-MM-DD 格式"""
    
    # 尝试常见的日期格式
    formats = [
        '%Y/%m/%d',   # 2026/5/1
        '%Y/%m/%d',   # 2026/05/01
        '%Y-%m-%d',   # 2026-5-1
        '%Y%m%d',     # 20260501
        '%Y/%d/%m',   # 2026/1/5 (备用)
    ]
    if is_none(djrqz):
        raise ValueError("日期字符串不能为空")
    if len(str(djrqz)) > 10:
        djrqz = str(djrqz)[:10]
    for fmt in formats:
        try:
            dt = datetime.strptime(djrqz, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    raise ValueError(f"无法解析日期格式: {djrqz}")

@any_route('/api/incomes/excel/import', methods=['POST'])
@require_token
async def api_incomes_excel_import(request):
    """
    导入客户收汇Excel
    对应原Pascal: 导入收汇功能
    """
    try:
        user = request.current_user
        # 1. 检查用户是否是财务岗位 (对应 tmpcom2 查询)
        s = Session()
        try:
            org = get_user_path(user.username)
            position = org.get('position')
            if '财务' not in position:
                return json_result(-1, '只有财务岗位用户才能执行此操作')
            
            # 2. 获取上传的Excel文件
            j = await request.form()
            file = form_value(j,'file',None)
            if is_none(file):
                return json_result(ERR_PARAM_NOT_ENOUGH)
            # 保存临时文件
            temp_dir = config.tmp_path
            temp_file = os.path.join(temp_dir, f"{uuid.uuid4()}_{file.filename}")
            logger.error(f"Saving uploaded file to: {temp_file}")
            data = await file.read()
            write_file(temp_file, data, 'wb', encoding=None)
            
            # 3. 读取Excel文件
            wb = load_workbook(temp_file)
            ws = wb.worksheets[0]  # 读取第一个工作表
            
            # 4. 处理每一行数据
            duplicates = []  # 存储重复记录信息
            row_idx = 2  # 从第2行开始（第1行是表头）
            yhhl = 0
            i = 0
            c = s.query(kpnr.tjhl).filter(kpnr.tjhl).order_by(kpnr.sid.desc()).first()
            if c:
                yhhl = float(c.tjhl)
            while True:
                # 读取Excel单元格数据
                djrqz = str(ws.cell(row=row_idx, column=1).value or '').strip()  # A列 - 公司名称
                shyh = str(ws.cell(row=row_idx, column=2).value or '')  # B列 - 银行
                hthm = str(ws.cell(row=row_idx, column=3).value or '')  # C列 - 账号
                djmj = str(ws.cell(row=row_idx, column=4).value or '')  # D列 - 税号
                shbz = str(ws.cell(row=row_idx, column=5).value or '').strip()  # A列 - 公司名称
                khmc = str(ws.cell(row=row_idx, column=6).value or '')  # B列 - 银行
                jsrm = str(ws.cell(row=row_idx, column=7).value or '')  # C列 - 账号
                sybz = str(ws.cell(row=row_idx, column=8).value or '')  # D列 - 税号            
                chyrq = str(ws.cell(row=row_idx, column=9).value or '').strip()  # A列 - 公司名称
                ywbm = str(ws.cell(row=row_idx, column=10).value or '')  # B列 - 银行
                sfjq = str(ws.cell(row=row_idx, column=11).value or '')  # C列 - 账号
                country = str(ws.cell(row=row_idx, column=12).value or '')  # D列 - 税号   
                shfs = str(ws.cell(row=row_idx, column=13).value or '').strip()  # A列 - 公司名称
                shtt = str(ws.cell(row=row_idx, column=14).value or '')  # B列 - 银行
                fpjq = str(ws.cell(row=row_idx, column=15).value or '')  # C列 - 账号
                qesh = str(ws.cell(row=row_idx, column=16).value or '')  # D列 - 税号   
                shsd = str(ws.cell(row=row_idx, column=17).value or '').strip()  # A列 - 公司名称
                oppAccName = str(ws.cell(row=row_idx, column=18).value or '')  # B列 - 银行
                oppAccBank = str(ws.cell(row=row_idx, column=19).value or '')  # C列 - 账号
                oppAccNo = str(ws.cell(row=row_idx, column=20).value or '')  # D列 - 税号      
                # 如果单据日期或发票号码为空，结束循环
                if not djrqz or not hthm:
                    break
                cydh = ''
                xjzk = 0
                if qesh != '否':
                    qesh = '是'
                if shsd != '否':
                    shsd = '是'
                c = s.query(func.ifnull(func.sum(func.ifnull(krshsheet.sydje2,0)),0).label('syhj')).filter(krshsheet.fphm==shbz).first()
                if c and c.syhj:
                    djjez = float(c.syhj)

                i = i + 1
                kh_id = ''
                if (sfjq == '否') or (sfjq == ''):
                    sfjq = '否'
                    fpjq = '否'
                else:
                    fpjq = '是'
                    sfjq = '是'
                djrq = convert_date(djrqz)
                if (shbz == 'USD') or (shbz == 'usd') or (shbz == '$') or (shbz == ''):
                    shbz = 'USD$'
                if (shbz == '￥') or (shbz == 'RMB￥') or (shbz == 'RMB'):
                    shbz = 'RMB'
                receiptDate = djrq
                invoiceNo = hthm
                buyerNo = ''
                if 'BEST PRICE' in khmc:
                    c = s.query(kh.xbdm).filter(kh.company_name.like(f"%{khmc}%")).first()
                    if c:
                        buyerNo = c.xbdm
                else:
                    c = s.query(fkkh.xbdm).filter(fkkh.khmc == khmc).first()
                    if c:
                        buyerNo = c.xbdm
                jsrm = ''
                ywbm = ''
                c = s.query(wxht.ywry,wxht.wxbm).filter(wxht.order_id==hthm).first()
                if c and c.syhj:
                    jsrm = c.ywry
                    ywbm = c.wxbm

                bgje = 0
                chyrq = None
                kh_id = ''
                zwpmz = ''
                bggs = ''
                bgdh = ''
                myjje = 0
                ayjje = 0
                yjje = 0
                CNFyf = 0
                bgje1 = 0
                htjer = 0
                htjem = 0
                htje = 0
                xybx = ''
                
                bb = 0
                dk = 0
                c = s.query(bgmxd.chyrq,bgmxd.ywry,bgmxd.ywbm,bgmxd.khmc,bgmxd.kh_id,bgmxd.RMBkh,bgmxd.myjje,bgmxd.ayjje,bgmxd.yjje,bgmxd.htje,
                    bgmxd.bgbgzje,bgmxd.zwpmz,bgmxd.bggs,bgmxd.bgdh,bgmxd.CNFyf).filter(bgmxd.fphm==hthm).first()
                if c:
                    kh_id = c.kh_id
                    bgje = float(c.bgbgzje)
                    chyrq = c.chyrq
                    jsrm = c.ywry
                    ywbm = c.ywbm
                    khmc = c.khmc
                    kh_id = c.kh_id
                    zwpmz = c.zwpmz
                    bggs = c.bggs
                    bgdh = c.bgdh
                    myjje = float(c.myjje)
                    ayjje = float(c.ayjje)
                    yjje = float(c.yjje)
                    CNFyf = float(c.CNFyf)
                    htje = float(c.htje) - float(c.myjje)

                    if (shbz == '') and (c.RMBkh == '是'):
                        shbz = 'RMB'
                    if c.RMBkh == '是':
                        if yhhl != 0 :
                            bgje1 = round(bgje / yhhl * 100) / 100
                    else:
                        bgje1 = bgje
                    b = s.query(func.ifnull(func.sum(func.ifnull(fdsq1sheet, 0)), 0).label('gczj1')).filter(func.ifnull(bgmxdsheet.yfph,"") != "", bgmxdsheet.pid == c.rid).first()
                    if b:
                        bb = bb + float(b.gczj1)
                    b = s.query(func.ifnull(func.sum(func.ifnull(fdsq1sheet, 0)), 0).label('gczj1')).filter(func.ifnull(bgmxdsheet.yfph,"") == "", bgmxdsheet.ewchy=="是", bgmxdsheet.pid == c.rid).first()
                    if b:
                        dk = dk + float(b.gczj1)

                ywry = ''
                htje2 = ''
                wxjsq = ''
                number = ''
                bglx = ''
                jjxje = 0
                fpbz12 = ''
                c = s.query(cymx).filter(cymx.fphm == hthm).first()
                if c:
                    fpbz12 = c.fpbz12
                    transportDate = c.sjcy1
                    ysdj = float(c.ysdj) if c.ysdj else 0
                    jxKHRMB = float(c.jxKHRMB) if c.jxKHRMB else 0
                    xybx = c.xybx
                    xbfl = float(c.xbfl) if c.xbfl else 0
                    jjxje = float(c.jxje1) + float(c.jxje2) + float(c.jxje3) - float(c.jjxje1) - float(c.jjxje2) - float(c.jjxje3)
                    bglx = c.bglx
                    if c.RMBkh == '是':
                        shbz = 'RMB'
                        htje = float(c.htje) - float(c.myjje)
                        htjer = float(c.htjer) - float(c.myjje)
                        htjem = float(c.htjem) if c.htjem else 0
                        wxje = float(c.mjzj) if c.mjzj else 0
                        xbfy = ((htje - ysdj) * float(c.xbfl) if c.xbfl else 0)
                    else:
                        shbz = 'USD$'
                        htje = float(c.htje) - float(c.myjje)
                        wxje = float(c.wxje) if c.wxje else 0
                        xbfy = ((htje - ysdj) * float(c.xbfl) if c.xbfl else 0)
                        htjer = float(c.htjer) if c.htjer else 0
                        htjem = float(c.htjem) if c.htjem else 0

                    cyrq = c.chyrq
                    jgtk = c.jgtk
                    jhfs = c.jhfs
                    shqx = c.shqx
                    dfrq = c.dfrq
                    yjje = float(c.yjje) if c.yjje else 0
                    kamc = c.mdka
                    cdmc = c.cdmc
                    gjmc = c.mygb
                    RMBkh = c.RMBkh
                    ywry = c.ywry
                    zdry = c.zdry
                    dlmc = c.dlmc
                    hyf = float(c.hyf) if c.hyf else 0
                    ygnlf = float(c.ygnlf) if c.ygnlf else 0
                    zgfy = float(c.zgfy) if c.zgfy else 0
                    ckfy = float(c.ckfy) if c.ckfy else 0
                    yzaf = float(c.yzaf) if c.yzaf else 0
                    jxUSD = float(c.jxUSD) if c.jxUSD else 0
                    kpfyz = float(c.kpfyz) if c.kpfyz else 0
                    jxRMB = float(c.jxRMB) if c.jxRMB else 0
                    qtrmb = float(c.qtrmb) if c.qtrmb else 0
                    ewhj = float(c.ewhj) if c.ewhj else 0
                    cydh = c.chydh
                    jsrm = c.ywry
                    ywbm = c.ywbm
                    khmc = c.khmc
                    kh_id = c.kh_id
                    myjje = float(c.myjje) if c.myjje else 0
                    ayjje = float(c.ayjje) if c.ayjje else 0
                    htje2 = c.htje
                    wxjsq = c.shqx
                    number = c.rid
                    if c.sjcy1 != None and c.sjcy1 != '':
                        chyrq = c.sjcy1
                sbz = ''
                if khmc != '':
                    c = s.query(kh.kh_id, kh.country).filter((kh.company_name == khmc) | (kh.khjc == khmc)).first()
                    if c:
                        kh_id = c.kh_id
                    if country == '':
                        country = c.country
                c = s.query(krsh).filter(krsh.djrq == djrq,krsh.shyh == shyh,krsh.hthm == hthm,krsh.hbdm == shbz,krsh.djje == djmj, krsh.khmc == khmc,krsh.jsrm == jsrm).first()
                if c:
                    duplicates.append('收汇日期:' + str(djrqz) + '收汇银行:' + str(shyh) + '外销合同号:' + str(hthm) + '客人名称:' + str(khmc) + '收汇重复请校对')
                else:
                    t = time.strftime('%Y%m%d')
                    t1 = str(t[2:4]) + str(t[4:6]) + str(t[6:8])
                c = s.query(krsh.sid).order_by(krsh.sid.desc()).first()
                if c:
                    djdh = khmc + t1 + str(c.sid)
                else:
                    djdh = khmc + t1 + '00001'
                hl = 1
                if shbz != 'RMB' and shbz != 'RMB￥' and shbz != '￥':
                    c = s.query(kpnr.tjhl).filter(kpnr.tjhl > 0).order_by(kpnr.sid.desc()).first()
                    if c and c.tjhl:    
                        hl = float(c.tjhl)
                if cydh != '':
                    c = s.query(cymx.fphm).filter(cymx.fphm.in_([str(cydh) + suffix for suffix in ['','A', 'B', 'C']])).first()
                    if c:
                        if c.fphm == hthm.upper():
                            sbz = '1'
                    else:
                        sbz = '1'
                zs21 = 0
                zs31 = 0
                zsw1 = ''
                zs41 = 1
                zs61 = 0
                zs71 = 0
                zmyhl = 1
                zs8 = len(hthm)
                if ywbm == '':
                    for zs11 in range(1, zs8 + 1):
                        zs21 = zs21 + 1
                        zs61 = zs61 + 1
                        zsw1 = hthm[zs21 - 1:zs21]
                    n1 = hthm[zs21:zs21 + 1]
                    if ((zsw1 == 'S') or (zsw1 == 's')) and ((n1 == 'C') or (n1 == 'c')) :
                        ywbm = hthm[zs21 - 3:zs21 - 2] + '组'
                    if ((zsw1 == 'G') or (zsw1 == 'g')) and ((n1 == 'T') or (n1 == 't')) :
                        ywbm = hthm[zs21 - 3:zs21 - 2] + '组'

                if (shbz != '') and (yhhl > 0) and (shbz != 'USD$') and (shbz != 'RMB') and (shbz != 'USD'):
                    c = s.query(hbdm.hhl).filter(hbdm.hbdm == "USD$").order_by(hbdm.sid.desc()).first()
                    if c and c.hhl:
                        zmyhl = round(((yhhl / c.hhl) * 10000000) / 10000000)

                if (oppAccName != '') and (oppAccBank != '') and (oppAccNo != '') :
                    c = s.query(customersbillto.kh_id).filter(customersbillto.Company == oppAccName, customersbillto.Bank == oppAccBank, customersbillto.Account == oppAccNo).first()
                    if c:
                        kh_id = c.kh_id

                m = krsh()
                rid = get_uuid()
                m.rid = rid
                m.uid = user.rid
                m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                m.shfs = shfs
                m.shtt = shtt
                m.zmyhl = zmyhl
                m.oppAccName = oppAccName
                m.oppAccBank = oppAccBank
                m.oppAccNo = oppAccNo
                m.djrq = djrq
                m.shyh = shyh
                m.hthm = hthm
                m.hbdm = shbz
                m.khmc = khmc
                m.jsrm = jsrm
                m.sybz = sybz
                m.djdh = djdh
                m.ssbm = org.get('path')
                m.sfjq = sfjq
                m.ywbm = ywbm
                m.wyzd = rid
                m.xgry = user.username
                m.country = country
                if shbz == 'RMB':
                    if hl != 0:
                        m.djmj = float(djmj) / hl
                    else:
                        m.djmj = float(djmj)
                else:
                    m.djmj = float(djmj)
                if shbz == 'RMB':
                    if hl != 0:
                        m.yhmj = float(djmj) / hl
                    else:
                        m.yhmj = float(djmj)
                else:
                    m.yhmj = float(djmj)
                m.symj = 0
                if shbz == 'RMB':
                    if hl != 0:
                        m.yymj = float(djmj) / hl
                    else:
                        m.yymj = float(djmj)
                else:
                    m.yymj = float(djmj)
                if shbz != 'RMB':
                    m.djje = float(djmj) * hl
                else:
                    m.djje = float(djmj)
                m.yyje = m.djje
                m.yhhl = str(hl)
                m.dlrq = time.strftime('%Y-%m-%d')
                m.chyrq = chyrq
                m.kh_id = kh_id
                s.add(m)
            
                hjsh = 0
                djjer = 0
                djjeM = 0
                hjshz = 0
                c = s.query(func.sum(func.ifnull(krshsheet.sydje,0)).label('syhj')).filter(krshsheet.fphm == hthm, or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥')).first()
                if c and c.syhj:
                    djjer = float(c.syhj)
                c = s.query(func.sum(func.ifnull(krshsheet.sydje,0)).label('syhj')).filter(krshsheet.fphm == hthm, krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥').first()
                if c and c.syhj:
                    djjeM = float(c.syhj)
                # c = s.query(func.sum(func.ifnull(khdjsheet.sydje,0)).label('sjsh1')).filter(or_(khdjsheet.fphm == cydh, khdjsheet.fphm.in_([cydh + suffix for suffix in ['', 'A', 'B', 'C']]))).first()
                # if c and c.sjsh1:
                #     hjshz = float(c.sjsh1)
                # c = s.query(func.sum(func.ifnull(khdjsheet.sydje,0)).label('sjsh1')).filter(khdjsheet.wxht == hthm).first()
                # if c and c.sjsh1:
                #     hjsh = float(c.sjsh1)
                c = s.query(func.sum(func.ifnull(krshsheet.sydje,0)).label('sjsh1')).filter(or_(krshsheet.fphm == cydh, krshsheet.fphm.in_([cydh + suffix for suffix in ['', 'A', 'B', 'C']]))).first()
                if c and c.sjsh1:
                    hjshz = hjshz + float(c.sjsh1)
                c = s.query(func.sum(func.ifnull(krshsheet.sydje,0)).label('sjsh1')).filter(krshsheet.fphm == hthm).first()
                if c and c.sjsh1:
                    hjsh = hjsh + float(c.sjsh1)
                m = krshsheet()
                m.rid = get_uuid()
                m.pid = rid
                m.uid = user.rid
                m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                m.fphm = hthm
                m.fphm1 = hthm
                m.wxht = hthm
                m.wyzd = m.rid
                if shbz != 'RMB':
                    m.sydje2 = float(djmj)
                    m.sydje = float(djmj)
                    m.sydje1 = float(djmj)
                    m.hjsh = hjsh + float(djmj)
                    m.djjemZ = float(djmj) + djjeM
                    m.djjerZ = djjer
                    m.RMBkh = '否'
                else:
                    if hl != 0:
                        m.sydje = float(djmj) / hl
                        m.sydje2 = float(djmj) / hl
                        m.sydje1 = float(djmj) / hl
                        m.hjsh = hjsh + float(djmj) / hl
                        m.djjerZ = float(djmj) + djjer
                        m.djjemZ = djjeM
                        m.RMBkh = '是'
                m.syrq = djrq
                m.hbdm = shbz
                m.yhhl = hl
                if shbz != 'RMB':
                    m.syqje = float(djmj) * hl
                    m.htjer = htjer
                    m.htjem = htjem
                    m.htje = htje
                else:
                    m.syqje = float(djmj)
                    m.htjer = htjer
                    m.htjem = htjem
                    m.htje = htje
                m.djjer = djjer
                m.djjeM = djjeM
                m.skyh = shyh
                m.ywry = jsrm
                m.ywbm = ywbm
                m.qsn = djrq[:4]
                m.qsy = djrq[5:7]
                m.chyrq = chyrq
                m.sfjq = sfjq
                m.myjje = myjje
                m.ayjje = ayjje
                m.yjje = yjje
                m.fpjq = fpjq
                m.sfdj = '否'
                s.add(m)
                s.query(fpgl).filter(fpgl.wxfp == hthm, fpgl.shsd == '否', fpgl.sfjd == '否').update({'webpdsh': '是'}, synchronize_session=False)
                org = get_user_path(jsrm)
                jpath = org.get('path')
                a = s.query(shqk).filter(or_(shqk.fphm == hthm, and_(shqk.ysfp == hthm, func.ifnull(shqk.ysfp,'')!=''))).first()
                if a:
                    a.htjez = htje
                    a.webpd = '是'
                    a.jpath = jpath
                    a.kh_id = kh_id
                    a.khmc = khmc
                    a.htje = htje
                    a.djje = float(djmj) + djjez
                    a.wsje = htje - float(djmj) - djjez
                    if shbz == 'RMB':
                        a.djje = float(djmj) + djjer
                        a.wsje = htjer - float(djmj) - djjer
                    else:
                        a.djje = djjer
                        a.wsje = htjer - djjer
                    if shbz != 'RMB':
                        m.djjem = float(djmj) + djjeM
                        m.wsjem = htjem - float(djmj) - djjeM
                    else:
                        m.djjem = djjeM
                        m.wsjem = htjem - djjeM
                    m.htjem = htjem
                    m.sfjq = sfjq
                    if m.shrq == None or m.shrq == '':
                        m.shrq = djrqz
                    s.add(m)
                    
                if sfjq == '是':
                    if number != '':
                        res = user_task_delete('出运明细', number, s, [], '出运发票')
                        if res['code'] != 1:
                            return json_result(-1, res['msg'])
                    father1 = ''
                    c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == cydh).first()
                    if c:
                        c.cpjq = '是'
                        s.add(c)
                        father1 = c.pid
                    if father1 != '':
                        b = s.query(fdsq1sheet).filter(fdsq1sheet.pid == father1, fdsq1sheet.cpjq == '否').first()
                        if not b:
                            c = s.query(fdsq1).filter(fdsq1.rid == father1).first()
                            if c:
                                c.cpjq = '是'
                                s.add(c)

                father1 = ''
                sb = ''
                sb1 = ''
                hjsh = 0
                # c = s.query(func.sum(func.ifnull(khdjsheet.sydje,0)).label('sjsh1')).filter(khdjsheet.wxht == hthm).first()
                # if c and c.sjsh1:
                #     hjsh = float(c.sjsh1)
                c = s.query(func.sum(func.ifnull(krshsheet.sydje2,0)).label('sjsh1')).filter(krshsheet.fphm == hthm).first()
                if c and c.sjsh1:
                    hjsh = hjsh + float(c.sjsh1)

                c = s.query(fdsq1sheet).filter(fdsq1sheet.fphm == cydh).first()
                if c:
                    c.hjshz = hjsh
                    s.add(c)
                    father1 = c.pid
                if father1 != '':
                    b = s.query(func.sum(func.ifnull(fdsq1sheet.sydje, 0)).label('sydje1')).filter(fdsq1sheet.pid == father1).first()
                    if b:
                        sydje1 = float(b.sydje1) if b.sydje1 else 0
                        c = s.query(fdsq1).filter(fdsq1.rid == father1).first()
                        if c:
                            htje1 = float(c.htje)
                            if c.shrq == None or c.shrq == '':
                                sb = '1'
                            if sydje1 > float(c.shje):
                                sb1 = '1'
                            if sb == '1':
                                c.shrq = djrq
                            if sb1 == '1':
                                c.shje = sydje1
                                c.wshje = htje1 - sydje1
                            if sb == '1' or sb1 == '1':
                                s.add(c)
                
                row = {
                    "xxly": '客户收汇',
                    "gdht": djdh,
                    "wxht": '',
                    "cght": '',
                    "yhdh": '',
                    "xxnr": '发票号码:' + str(hthm) + '收汇单号:' + str(djdh) + '客户名称:' + str(khmc) + '的收汇共计:' + str(djmj) + '已收到,日期:' + time.strftime('%Y-%m-%d %H:%M:%S'),
                    "jsr": str(ywry),
                    "sys_path": "",
                    "spsq": user.username
                }
                res = module_xxck_new([row],user,s)
                if res.get('code')!=1:
                    s.rollback()
                    return json_result(res.get('code'), res.get('code'))
            
                if xybx == '是':
                    c = s.query(shipmentapply).filter(shipmentapply.invoiceNo == invoiceNo).first()
                    if c: 
                        insureSum = c.insureSum
                        moneyId = c.moneyId
                    c = s.query(receiptapply).filter(receiptapply.invoiceNo == invoiceNo).first()
                    if c:
                        c.insureSum = insureSum
                        c.moneyId = moneyId
                        c.receiptDate = receiptDate
                        if fpjq == '是':
                            c.receiptFlag = '1'
                        else:
                            c.receiptFlag = '2'
                        c.receiptSum = hjsh - ysdj
                        c.modi_uid = user.rid
                        c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                        s.add(c)

                if hthm != '' and fpjq == '是':
                    sydje = 0
                    ayjjez1 = 0
                    myjjez1 = 0
                    bh = hthm
                    if bh != '':
                        father = ''
                        c = s.query(xbsf.xbfy, xbsf.yrrq).filter(xbsf.fphm == hthm).first()
                        if c:
                            xbfy1 = c.xbfy
                            xbdrsj = c.yrrq
                        a = s.query(krshsheet.sydje2, krshsheet.pid).filter(krshsheet.fphm.like('%' + hthm + '%'))
                        for c in a:
                            if father == '':
                                father = c.pid
                            if c.sydje2:
                                sydje = sydje + float(c.sydje2)

                        if father != '':
                            c = s.query(krsh.djrq).filter(krsh.rid == father).first()
                            if c:
                                shrq1 = c.djrq
                        sydje12 = 0
                        shjez1 = sydje

                        if shbz != 'RMB':
                            sydje12 = djjer + (djjeM + float(djmj)) * yhhl
                        else:
                            sydje12 = djjer + float(djmj) + djjeM * yhhl
                        if sbz != '1':
                            xbfy = 0
                        cwqrqk = ''
                        jgd = 0
                        sjf1 = 0
                        yzaf = 0
                        hyf = 0
                        c = s.query(hdfy.zjfy,hdfy.zjhy1,hdfy.cwqrqk,hdfy.sbje,hdfy.rid).filter(hdfy.fphm == hthm).first()
                        if c:
                            cwqrqk = c.cwqrqk
                            yzaf = float(c.zjfy)
                            hyf = float(c.zjhy1)
                            sjf1 = float(c.sbje)
                            b = s.query(func.sum(func.ifnull(hdfysheet.sjf,0)).label('sjf1'),
                                func.sum(func.ifnull(hdfysheet.ckfy,0)).label('ckfy1'),
                                func.sum(func.ifnull(hdfysheet.jcfy,0)).label('jcfy1'),
                                func.sum(func.ifnull(hdfysheet.JGD,0)).label('JGD1')
                            ).filter(hdfysheet.pid == b.rid).first()
                            if b:
                                zgfy1 = float(b.ckfy1) if b.ckfy1 else 0
                                ckfy1 = float(b.jcfy1) if b.jcfy1 else 0
                                sjf = float(b.sjf1) if b.sjf1 else 0
                                jgd = float(b.JGD1) if b.JGD1 else 0

                        if 'BEST PRICE' in khmc:
                            yzaf = yzaf - jgd
                        if sbz == '1':
                            yzaf = yzaf - jgd
                        c = s.query(func.sum(func.ifnull(khspsheet1.pkje,0)).label('pkje')).filter(khspsheet1.fphm == cydh, khspsheet1.shjg == '通过').first()
                        if c and c.pkje:
                            khpk = float(c.pkje)
                        c = s.query(func.sum(func.ifnull(gongcspsheet1.gcpk,0)).label('gcpk')).filter(gongcspsheet1.fphm == cydh, gongcspsheet1.shjg == '通过').first()
                        if c and c.gcpk:
                            gcpk = float(c.gcpk)
                        c = s.query(func.sum(func.ifnull(fysqsheet.seje,0)).label('seje')).filter(fysqsheet.wxfp == cydh, 
                            fysqsheet.cwsp == '通过', fysqsheet.sfrbmfy == '否', or_(fysqsheet.hbdm.like("%USD%"), fysqsheet.hbdm.like("%usd%"))).first()
                        if c and c.seje:
                            fyusd = float(c.seje)
                            ywfy = ywfy + float(c.seje) * yhhl
                        c = s.query(func.sum(func.ifnull(fysqsheet.seje,0)).label('seje')).filter(fysqsheet.wxfp == cydh, 
                            fysqsheet.cwsp == '通过', fysqsheet.sfrbmfy == '否', or_(fysqsheet.hbdm.like("%RMB%"), fysqsheet.hbdm.like("%rmb%"))).first()   
                        if c and c.seje:
                            fyrmb = float(c.seje)
                            ywfy = ywfy + float(c.seje)
                        if number != '':
                            c = s.query(cymx.jxRMB,cymx.yzaf,cymx.qtrmb,cymx.RMBkh,cymx.ayjje,cymx.myjje).filter(cymx.fphm == cydh).first()
                            if c:
                                ywry123 = ''
                                ywbm123 = ''
                                b = s.query(cymxsheet.ywry,cymxsheet.wxbm1).filter(cymxsheet.pid == c.rid, cymxsheet.chxs > 1).first()
                                if b:
                                    ywry123 = b.ywry
                                    ywbm123 = b.wxbm1
                                b = s.query(func.sum(func.ifnull(cymxsheet.gczjrmb,0)).label('gczjrmb1')).filter(cymxsheet.pid == c.rid, cymxsheet.zzsl > 1, cymxsheet.tsl == 0).first()
                                if b and b.gczjrmb1:
                                    tshj0 = float(b.gczjrmb1)
                                else:                                    
                                    tshj0 = 0
                                a = s.query(func.sum(func.ifnull(cymxsheet.gczjrmb,0)).label('gczjrmb1'), cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.gcmc, 
                                    cymxsheet.cghbdm).filter(cymxsheet.pid == c.rid, cymxsheet.mlsb == "是").group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.zhwbpm, cymxsheet.cghbdm).all()
                                for l in a:   
                                    if l.zzsl==None or l.zzsl == 0:
                                        if l.cgdq == '义乌':
                                            if 'USD' in l.cghbdm or 'usd' in l.cghbdm or '$' in l.cghbdm:
                                                ywhjm = ywhjm + (trunc(float(l.gczj1) / 10) * 10)
                                            else:
                                                ywhjr = ywhjr + (trunc(float(l.gczj1) / 10) * 10)
                                        else:
                                            if 'USD' in l.cghbdm or 'usd' in l.cghbdm or '$' in l.cghbdm:
                                                nbhjm = nbhjm + (trunc(float(l.gczj1) / 10) * 10)
                                            else:
                                                nbhjr = nbhjr + (trunc(float(l.gczj1) / 10) * 10)
                                    else:
                                        if l.tsl == 16:
                                            tshj16 = tshj16 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                        if l.tsl == 13:
                                            tshj13 = tshj13 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                        if l.tsl == 10:
                                            tshj10 = tshj10 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                        if l.tsl == 6:
                                            tshj6 = tshj6 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                        if l.tsl == 3:
                                            tshj3 = tshj3 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                        if l.tsl == 1:
                                            tshj1 = tshj1 + (trunc(float(l.gczjrmb1) / 10) * 10)
                                a = s.query(func.sum(func.ifnull(cymxsheet.gczjrmb, 0)).label('gczjrmb1'), cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.cghbdm, 
                                    func.sum(func.ifnull(cymxsheet.gczj, 0)).label('gczj1'), cymxsheet.gcmc).filter(cymxsheet.pid == number
                                    ).group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.cghbdm).all()
                                for l in a:
                                    if l.zzsl == None or l.zzsl == 0:
                                        if l.cgdq == '义乌':
                                            if 'USD' in l.cghbdm or 'usd' in l.cghbdm or '$' in l.cghbdm:
                                                ywhjm = ywhjm + (trunc(float(l.gczj1) / 10) * 10)
                                            else:
                                                ywhjr = ywhjr + (trunc(float(l.gczj1) / 10) * 10)
                                        else:
                                            if 'USD' in l.cghbdm or 'usd' in l.cghbdm or '$' in l.cghbdm:
                                                nbhjm = nbhjm + (trunc(float(l.gczj1) / 10) * 10)
                                            else:
                                                nbhjr = nbhjr + (trunc(float(l.gczj1) / 10) * 10)
                                    else:
                                        if l.tsl == 16:
                                            tshj16 = tshj16 + float(l.gczjrmb1)
                                        if l.tsl == 13:
                                            tshj13 = tshj13 + float(l.gczjrmb1)
                                        if l.tsl == 10:
                                            tshj10 = tshj10 + float(l.gczjrmb1)
                                        if l.tsl == 6:
                                            tshj6 = tshj6 + float(l.gczjrmb1)
                                        if l.tsl == 3:
                                            tshj3 = tshj3 + float(l.gczjrmb1)
                                        if l.tsl == 1:
                                            tshj1 = tshj1 + float(l.gczjrmb1)

                                ywxj = ywhjr + ywhjm * yhhl
                                nbxj = nbhjr + nbhjm * yhhl
                                xjhj = ywxj + nbxj
                                cghjzje = tshj0 + tshj16 + tshj13 + tshj10 + tshj6 + tshj3 + tshj1 + ywxj + nbxj
                                cbzje = cghjzje + yzaf + float(c.qtrmb)
                                cbze1 = cghjzje + ygnlf + float(c.qtrmb)
                                ts16 = round((tshj16 / 1.16 * 0.16) * 100) / 100
                                if ts16 > 0:
                                    ts13 = round((tshj13 / 1.16 * 0.13) * 100) / 100
                                    ts10 = round((tshj10 / 1.16 * 0.10) * 100) / 100
                                    ts6 = round((tshj6 / 1.16 * 0.06) * 100) / 100
                                else:
                                    ts13 = round((tshj13 / 1.13 * 0.13) * 100) / 100
                                    ts10 = round((tshj10 / 1.13 * 0.10) * 100) / 100
                                    ts6 = round((tshj6 / 1.13 * 0.06) * 100) / 100
                                
                                ts3 = round((tshj3 / 1.03 * 0.03) * 100) / 100
                                ts1 = round((tshj1 / 1.01 * 0.01) * 100) / 100
                                jklx = 0
                                tszje = ts13 + ts10 + ts6 + ts3 + ts16 + ts1

                                ayjjez1 = float(c.ayjje) if c.ayjje else 0
                                myjjez1 = float(c.myjje) if c.myjje else 0
                                
                                if c.RMBkh == '是':
                                    hsml = round((sydje12 - hyf * yhhl - xbfy1 - cbzje + tszje - ayjjez1 - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                                    yghsml = round((htje - hyf * yhhl - xbfy - cbzje + tszje - ayjjez1 - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                                    if htje != 0:
                                        mll = 100 * (hsml / htje)
                                        ygmll = 100 * (yghsml / htje)
                                else:
                                    if (htje != 0) and (yhhl != 0):
                                        hsml = round((sydje12 - (ayjjez1 + hyf) * yhhl - cbzje - xbfy1 - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                                        yghsml = round(((htje - ayjjez1 - hyf - xbfy) * yhhl - cbzje - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                                        mll = 100 * (hsml / (htje * yhhl))
                                        ygmll = 100 * (yghsml / (htje * yhhl))

                        hsmlz = 0
                        c = s.query(fpgl).filter((fpgl.wxfp == bh) | (fpgl.hsfp == bh)).first()
                        if c:
                            c.hsml = hsmlz
                            c.mll = mll
                            if shbz != 'RMB':
                                c.djjer = djjer
                                c.djjem = djjeM + float(djmj)
                            else:
                                c.djjer = djjeM + float(djmj)
                                c.djjem = djjeM
                            c.shje = sydje
                            c.shrq1 = shrq1
                            c.shzmj = round((djmj + djjeM + djjer / yhhl) * 100) / 100
                            c.hdfyxq = cwqrqk
                            if c.RMBkh == '是':
                                hsmlz = round((sydje12 - c.ayjje + float(c.xjzk) - float(c.hyf) * float(c.yhhl) - float(c.xbfy) - float(c.cbzje) + float(c.tszje) - float(c.jklx) - float(c.kpfyz) - float(c.ywfy) - float(c.qtfy) + float(c.qtsr)) * 100) / 100
                                c.hsml = hsmlz
                            if c.htje != 0:
                                c.mll = 100 * (round((hsmlz / c.htje) * 100) / 100)
                            else:
                                if (c.htje !=0 ) and (c.yhhl != 0):
                                    hsmlz = round((sydje12 - (c.ayjje + c.hyf + c.xbfy) * c.yhhl - c.cbzje + c.xjzk + c.tszje - c.jklx - c.ywfy - c.qtfy + c.qtsr - c.kpfyz) * 100) / 100
                                    c.mll = 100 * (round((hsmlz / (c.htje * c.yhhl)) * 100) / 100)
                                    c.hsml = hsmlz
                            s.add(c)
                        else:
                            ywdz = ''
                            ywxz = ''
                            cx = ''
                            cx = ywbm
                            zs = 0
                            zs = len(ywbm)
                            zs2 = 0
                            zs3 = 0
                            zsw = ''
                            sbcx = ''
                            zzsw = ''
                            zbsb = ''
                            zbsb1 = ''
                            zbsb2 = ''
                            zbsb = hthm[0:3]
                            if zbsb != 'AMZ':
                                c = s.query(ywbdzb.ywb,ywbdzb.ywzjc,ywbdzb.ywdz,ywbdzb.dyywzm).filter(ywbdzb.ywb == ywbm).first()
                                if c:
                                    ywbm = c.ywb
                                    ywdz = c.ywdz
                                    ywxz = c.ywzjc
                                    zzsw = c.dyywzm
                            else:
                                ywbm12 = ''
                                c = s.query(cyzglsheet.qxzl,cyzglsheet.xm).filter(cyzglsheet.bz == ywbm, cyzglsheet.zm == '跨境电商').first()
                                if c:
                                    ywbm = c.qxzl
                                    ywdz = c.qxzl + c.xm
                                    ywxz = c.xm

                            if not 'CSD-' in hthm:
                                if 'UV' in hthm or 'uv' in hthm or 'VC' in hthm or 'vc' in hthm:
                                    m = fpgl()
                                    m.rid = get_uuid()
                                    m.uid = user.rid
                                    m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                                    m.bb = bb
                                    m.dk = dk
                                    m.bglx = bglx
                                    m.fpbz = fpbz12
                                    m.CNFyf = CNFyf
                                    m.JGD = jgd
                                    m.sjf1 = sjf1
                                    if bglx == '内销':
                                        m.sfnm = '是'
                                    else:
                                        m.sfnm = '否'
                                    m.hdfyxq = cwqrqk
                                    m.fphm = bh
                                    m.wxfp = bh
                                    m.hsfp = bh
                                    m.xybx = xybx
                                    m.ysdj = ysdj
                                    m.cysd = '否'
                                    m.cygg = '否'
                                    m.khmc = khmc
                                    m.RMBkh = RMBkh
                                    if shbz != 'RMB':
                                        m.djjem = float(djmj) + djjeM
                                        m.djjer = djjer
                                    else:
                                        m.djjem = djjeM
                                        m.djjer = float(djmj) + djjer
                                    m.xjzk = float(xjzk)
                                    m.hbdm = shbz
                                    m.cyrq = cyrq
                                    m.jgtk = jgtk
                                    m.jhfs = jhfs
                                    m.shqx = shqx
                                    m.dfrq = dfrq
                                    m.mdka = kamc
                                    m.cdmc = cdmc
                                    m.mygb = gjmc
                                    m.ywry = ywry123
                                    m.ywbm = ywbm123
                                    m.zdry = zdry
                                    m.dlmc = dlmc
                                    m.shrq1 = shrq1
                                    m.xbfl = xbfl
                                    m.wxje = wxje

                                    if RMBkh == '是':
                                        m.ygxbfy = round(xbfy * 100) / 100
                                    else:
                                        m.ygxbfy = round(xbfy * 100) / 100
                                        m.ygxbfy = round(xbfy * 100) / 100

                                    m.xbfy = xbfy1
                                    m.htje = htje
                                    m.htjer = htjer
                                    m.htjem = htjem
                                    m.yjje = yjje
                                    m.hyf = hyf
                                    m.ygnlf = ygnlf
                                    m.zgfy = zgfy1
                                    m.ckfy = ckfy1
                                    m.yzaf = yzaf - sjf - zgfy1 - ckfy1
                                    m.sjf = sjf
                                    m.jxUSD = jxUSD
                                    m.jxRMB = jxRMB
                                    m.kpfyz = kpfyz
                                    m.qtrmb = qtrmb
                                    m.ewhj = ewhj
                                    m.tshj16 = tshj16
                                    m.tshj13 = tshj13
                                    m.tshj10 = tshj10
                                    m.tshj6 = tshj6
                                    m.tshj0 = tshj0
                                    m.tshj3 = tshj3
                                    m.tshj1 = tshj1
                                    m.cghjzje = cghjzje - jxRMB
                                    m.cbzje = cbzje
                                    m.jklx = jklx
                                    m.tszje = tszje
                                    m.hsml = hsml
                                    m.yghsml = yghsml
                                    m.mll = round(mll * 100) / 100
                                    m.ygmll = round(ygmll * 100) / 100
                                    m.ayjje = ayjjez1
                                    m.myjje = myjjez1
                                    m.bgje = bgje
                                    m.shje = shjez1
                                    m.yhhl = yhhl
                                    m.wxce = round((htje - shjez1) * 100) / 100
                                    m.ywfy = ywfy
                                    m.qtfy = 0
                                    m.qtfysm = ''
                                    m.sfjd = '否'
                                    m.khpk = khpk
                                    m.gcpk = gcpk
                                    m.jxKHRMB = jxKHRMB
                                    m.fyUSD = fyUSD
                                    m.fyRMB = fyRMB
                                    m.fpsq = '否'
                                    m.jjxje = jjxje
                                    if yhhl != 0:
                                        if shbz != 'RMB':
                                            m.shzmj = round((float(djmj) + djjeM + djjer / yhhl) * 100) / 100
                                        else:
                                            m.shzmj = round((djjeM + (float(djmj) + djjer) / yhhl) * 100) / 100

                                        if RMBkh == '是':
                                            m.htjez1 = round(htje / yhhl * 100) / 100
                                        else:
                                            m.htjez1 = htje
                                    m.bgje1 = bgje1
                                    m.bggs = bggs
                                    m.bgdh = bgdh
                                    m.zwpmz = zwpmz
                                    m.zfph = cydh
                                    m.zshsq = ''
                                    m.yjhsq = ''
                                    m.hxddf1 = '否'
                                    m.ywhj = ywxj
                                    m.nbhj = nbxj
                                    m.ywxj = ywxj
                                    m.nbxj = nbxj
                                    m.tshj = tshj16 + tshj13 + tshj10 + tshj6 + tshj0 + tshj3 + tshj1
                                    m.fxhj = ywxj + nbxj
                                    m.xjhj = ywxj + nbxj
                                    m.ywdz = ywdz
                                    m.ywxz = ywxz
                                    m.ywhjr = ywhjr
                                    m.nbhjr = nbhjr
                                    m.ywhjm = ywhjm
                                    m.nbhjm = nbhjm
                                    m.xbdrsj = xbdrsj
                                    m.qesh = qesh
                                    m.shsd = shsd
                                    m.hkjq = '否'
                                    s.add(m)
            
                row_idx += 1
            
            # 提交事务
            s.commit()
            
            # 10. 如果有重复记录，生成文本文件
            result_data = {
                'has_duplicates': len(duplicates) > 0,
            }
            
            if duplicates:
                # 生成重复记录文件
                dup_filename = f"重复财务工厂_{datetime.now().strftime('%Y-%m-%d')}.txt"
                dup_filepath = os.path.join(temp_dir, dup_filename)
                # with open(dup_filepath, 'wb', encoding=None) as f:
                #     f.write('\n'.join(duplicates))
                val ='\n'.join(duplicates)
                logger.error(f"Writing duplicates to: {dup_filepath}")
                write_file(dup_filepath, val, 'w')

                # 这里应该上传文件到可下载的位置，返回URL
                # 简化处理：返回文件内容或保存到特定目录
                result_data['duplicate_file_name'] = dup_filename
            
            # 清理临时文件
            # os.remove(temp_file)
            
            s.commit()
            return json_result(0, data=result_data)
        except Exception as e:
            s.rollback()
            logger.error(trace_error())
            return json_result(-1, f'导入失败: {str(e)}')
        finally:
            s.close()
            wb.close()
            
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())



@any_route('/api/saier/incomes/fpjq/change', methods=['POST'])
@require_token
async def api_incomes_fpjq_change(request):
    j = await request.json()
    user = request.current_user
    s = Session()
    try:
        row = j.get('row', {})
        main = j.get('main', {})
        invoiceNo = row.get('fphm')
        fpjq = row.get('sfjq')
        hsfp = row.get('hsfp')
        khmc = main.get('khmc')
        receiptDate = main.get('djrq')
        if invoiceNo == None or invoiceNo == '' or fpjq == None or fpjq == '':
            return json_result(0, '无需更新')
        
        org = get_user_path(user.username)
        position = org.get('position')
        # if '财务' not in position:
        #     return json_result(-1, '只有财务岗位用户才能执行此操作')
        
        if fpjq == '否':
            s.query(fpgl).filter(or_(fpgl.wxfp==invoiceNo, fpgl.hsfp==hsfp)).update({fpgl.shsd:'否'}, synchronize_session=False)
            return json_result(1, '操作成功')
        
        jjxje = 0
        bglx = ''
        fpbz12 = ''
        ysdj = 0
        cydh = ''
        RMBkh = ''
        xybx = ''
        ywry123 = ''            
        ywbm123 = ''
        sbz = ''
        kamc = ''
        s.query(krshsheet).filter(krshsheet.fphm==invoiceNo).update({krshsheet.fpjq:'是', krshsheet.jqcw:user.username}, synchronize_session=False)
        c = s.query(cymx).filter(cymx.fphm==invoiceNo).first()
        if c:
            c.sfbg = '是'
            s.add(c)
            xybx = c.xybx
            khmc = c.khmc
            cydh = c.chydh
            RMBkh = c.RMBkh
            djje = float(c.ysdj) if c.ysdj else 0
            bglx = c.bglx
            fpbz12 = c.fpbz12
            d = s.query(cymxsheet.ywry, cymxsheet.wxbm1).filter(cymxsheet.pid==c.rid, cymxsheet.chxs>1).order_by(cymxsheet.chxs.desc()).first()
            if d:
                ywry123 = d.ywry
                ywbm123 = d.wxbm1

        if cydh != '' and cydh != None:
            suffixes = ['','A', 'B', 'C']
            fphm_list = [str(cydh) + suffix for suffix in suffixes]
            a = s.query(func.sum(cymx.fphm)).filter(cymx.fphm.in_(fphm_list)).first()
            if a and a.fphm!= None and a.fphm != '' and str(a.fphm).upper() == str(invoiceNo).upper():
                sbz = '1'
            else:
                sbz = '1'

        sydje = row.get('sydje2')
        wyzd = row.get('wyzd')
        a = None
        father = ''
        if wyzd != None and wyzd != '':
            a = s.query(krshsheet).filter(krshsheet.fphm==invoiceNo, krshsheet.wyzd!=wyzd).all()
        else:
            a = s.query(krshsheet).filter(krshsheet.fphm==invoiceNo).all()
        for r in a: 
            if r.pid != None and r.pid != '':
                father = r.pid
                sydje = sydje + float(r.sydje2) if r.sydje2 else 0
        qesh = '否'
        transportDate = row.get('chyrq')
        buyerNo = ''
        insureSum = 0
        moneyId = ''
        if xybx == '是':
            qesh = '是'
            if 'BEST PRICE' in khmc:
                a = s.query(kh).filter(kh.company_name.like("%" + khmc + "%")).first()
                if a:
                    buyerNo = a.xbdm
            else:
                a = s.query(fkkh).filter(fkkh.khmc.like("%" + khmc + "%")).first()
                if a:
                    buyerNo = a.xbdm

            a = s.query(shipmentapply).filter(shipmentapply.invoiceNo == invoiceNo).first()
            if a: 
                insureSum = c.insureSum
                moneyId = c.moneyId
            a = s.query(receiptapply).filter(receiptapply.invoiceNo == invoiceNo).first()
            if a:
                a.insureSum = insureSum
                a.moneyId = moneyId
                a.receiptDate = receiptDate
                if fpjq == '是':
                    a.receiptFlag = '1'
                else:
                    a.receiptFlag = '2'
                a.receiptSum = sydje - ysdj
                a.modi_uid = user.rid
                a.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(a)

        xjzk = ''
        if 'UV' in invoiceNo or 'uv' in invoiceNo or 'VC' in invoiceNo or 'vc' in invoiceNo:
            if xjzk == '' or xjzk == None:
                xjzk = '0'

            ts13 = 0
            ts10 = 0
            ts6 = 0
            ts3 = 0
            ts1 = 0
            ts16 = 0
            xybx = ''
            hbdm = ''
            cyrq = None
            jgtk = ''
            jhfs = ''
            shqx = ''
            dfrq = None
            kamc = ''
            cdmc = ''
            gjmc = ''
            ywry = ''
            ywbm = ''
            zdry = ''
            dlmc = ''
            shrq1 = ''
            xbfl = 0
            wxje = 0
            xbfy = 0
            htje = 0
            htjer = 0
            htjem = 0
            yjje = 0
            hyf = 0
            ygnlf = 0
            zgfy = 0
            ckfy = 0
            yzaf = 0
            jxUSD = 0
            jxRMB = 0
            kpfyz = 0
            qtrmb = 0
            ewhj = 0
            tshj16 = 0
            tshj13 = 0
            tshj10 = 0
            tshj6 = 0
            tshj3 = 0
            tshj1 = 0
            cghjzje = 0
            cbzje = 0
            jklx = 0
            tszje = 0
            hsml = 0
            mll = 0
            ayjje = 0
            myjje = 0
            bgje = 0
            bgje1 = 0
            shje = 0
            yhhl = 0
            ywfy = 0
            khpk = 0
            gcpk = 0
            jxKHRMB = 0
            fyUSD = 0
            fyRMB = 0
            zgfy1 = 0
            ckfy1 = 0
            sjf = 0
            cghjzje = 0
            hsmlz = 0
            cbze1 = 0
            hjshz = 0
            sywh = 0
            ywhj = 0
            nbhj = 0
            ywxj = 0
            nbxj = 0
            zzsw = ''
            zbsb = ''
            zbsb1 = ''
            zbsb2 = ''
            bggs = ''
            bgdh = ''
            zwpmz = ''
            ywdz = ''
            ywxz = ''
            ywhjr = 0
            nbhjr = 0
            ywhjm = 0
            nbhjm = 0
            xbdrsj = None
            ywbm = row.get('ywbm')
            zbsb = invoiceNo[0:3]

            if zbsb != 'AMZ':
                x = s.query(ywbdzb.ywb,ywbdzb.ywzjc,ywbdzb.ywdz,ywbdzb.dyywzm).filter(ywbdzb.ywb == ywbm).first()
                if x:
                    ywbm = x.ywb
                    ywdz = x.ywdz
                    ywxz = x.ywzjc
                    zzsw = x.dyywzm
            else:
                ywbm12 = ''
                x = s.query(cyzglsheet.qxzl,cyzglsheet.xm).filter(cyzglsheet.bz == ywbm, cyzglsheet.zm == '跨境电商').first()
                if x:
                    ywbm = x.qxzl
                    ywdz = x.qxzl + x.xm
                    ywxz = x.xm
            sywh = row.get('sydje') if row.get('sydje') else 0
            djjer = row.get('djjer') if row.get('djjer') else 0
            djjeM = row.get('djjeM') if row.get('djjeM') else 0
            djjerZ = sywh + djjer 
            djjemZ = sywh + djjeM
            xbfy1 = 0
            yghsml = 0
            ygmll = 0
            xbdrsj = None
            shrq1 = None
            a = s.query(xbsf).filter(xbsf.fphm == invoiceNo).first()
            if a:
                xbfy1 = a.xbfy
                xbdrsj = a.yrrq


            if father != '':
                a = s.query(krsh.djrq).filter(krsh.rid==main.get('rid')).first()
                if a:
                    shrq1 = a.djrq

            shje = sydje
            yhhl = 0
            a = s.query(kpnr.tjhl).filter(kpnr.tjhl > 0).order_by(kpnr.sid.desc()).first()
            if a:
                yhhl = float(a.tjhl)

            if yhhl == 0:
                yhhl = main.get('yhhl') 

            djjemZ = djjemZ if djjemZ and djjemZ!=None else 0
            yhhl = yhhl if yhhl and yhhl!=None else 0
            djjerZ = djjerZ if djjerZ and djjerZ!=None else 0
            hjshz = float(djjemZ) * float(yhhl) + float(djjerZ)

            cwqrqk = ''
            JGD = 0
            sjf1 = 0
            a = s.query(hdfy).filter(hdfy.fphm == invoiceNo).first()
            if a:
                cwqrqk = a.cwqrqk
                yzaf = a.zjfy
                hyf = a.zjhy1
                sjf1 = a.sbje

                b = s.query(func.sum(hdfysheet.sjf).label('sjf1'), func.sum(hdfysheet.ckfy).label('ckfy1'), 
                    func.sum(hdfysheet.jcfy).label('jcfy1'), func.sum(hdfysheet.JGD).label('JGD1')).filter(hdfysheet.pid == a.rid).first()
                if b:
                    sjf = b.sjf1
                    ckfy1 = b.ckfy1
                    jcfy1 = b.jcfy1
                    JGD = b.JGD1
    
            if 'BEST PRICE' in khmc:
                yzaf = yzaf - JGD

            khpk = 0
            gcpk = 0
            fyrmb = 0
            fyUSD = 0
            ywfy = 0
            if sbz == '1':
                a = s.query(func.sum(khspsheet1.pkje).label('pkje')).filter(khspsheet1.hsfp == invoiceNo, khspsheet1.shjg == '通过').first()
                if a and a.pkje:
                    khpk = a.pkje
                a = s.query(func.sum(gongcspsheet1.gcpk).label('gcpk')).filter(gongcspsheet1.hsfp == invoiceNo, gongcspsheet1.shjg == '通过').first()
                if a and a.gcpk:
                    gcpk = a.gcpk

                a = s.query(func.sum(fysqsheet.seje).label('FKJE')).filter(fysqsheet.wxfp == invoiceNo, fysqsheet.cwsp == '通过', fysqsheet.sfrbmfy == '否', or_(fysqsheet.hbdm.like('%USD%'), fysqsheet.hbdm.like('%usd%'))).first()
                if a and a.FKJE:
                    fyUSD = float(a.FKJE)
                    ywfy = ywfy + float(a.FKJE) * yhhl

                a = s.query(func.sum(fysqsheet.seje).label('FKJE')).filter(fysqsheet.wxfp == invoiceNo, fysqsheet.cwsp == '通过', fysqsheet.sfrbmfy == '否', or_(fysqsheet.hbdm.like('%RMB%'), fysqsheet.hbdm.like('%rmb%'))).first()
                if a and a.FKJE:
                        fyrmb = float(a.FKJE)
                        ywfy = ywfy + float(a.FKJE)
            CNFyf = 0
            dd = 0
            bb = 0
            dk = 0
            a = s.query(bgmxd.bgbgzje, bgmxd.CNFyf, bgmxd.RMBkh, bgmxd.zwpmz, bgmxd.bggs, bgmxd.bgdh, bgmxd.rid).filter(bgmxd.fphm == invoiceNo).first()
            if a:
                bgje = a.bgbgzje
                CNFyf = a.CNFyf
                zwpmz = a.zwpmz
                bggs = a.bggs
                bgdh = a.bgdh
                if a.RMBkh == '是':
                    if yhhl != 0:
                        bgje1 = round(bgje / yhhl * 100) / 100
                    else:
                        bgje1 = 0
                else:
                    bgje1 = bgje

                a2 = s.query(func.sum(bgmxdsheet.gczj).label('gczj1')).filter(bgmxdsheet.yfph != '', bgmxdsheet.pid == a.rid).first()
                if a2 and a2.gczj1:
                    bb = bb + float(a2.gczj1)

                a3 = s.query(func.sum(bgmxdsheet.gczj).label('gczj1')).filter(bgmxdsheet.ewchy == '是', bgmxdsheet.yfph == '', bgmxdsheet.pid == a.rid).first()
                if a3 and a3.gczj1:
                    dk = dk + float(a3.gczj1)

            ysdj = 0
            jjxje = 0
            tshj0 = 0
            tshj16 = 0
            tshj13 = 0
            tshj10 = 0
            tshj6 = 0
            tshj3 = 0
            tshj1 = 0
            a = s.query(kaiptz.chrq).filter(kaiptz.fphm == invoiceNo, kaiptz.cpmc == '正常', func.ifnull(kaiptz.chrq, '') != '').first()
            if a:
                cyrq = a.chrq
            shbz = ''
            if c:
                jjxje = float(c.jxje1) + float(c.jxje2) + float(c.jxje3) - float(c.jjxje1) - float(c.jjxje2) - float(c.jjxje3)
                ysdj = c.ysdj
                jxKHRMB = c.jxKHRMB
                xybx = c.xybx
                xbfl = c.xbfl
                khmc = c.khmc
                
                if c.RMBkh == '是':
                    shbz = 'RMB'
                    htje = c.htje
                    wxje = c.mjzj
                    xbfy = ((htje - ysdj) * c.xbfl)
                    htjer = c.htjer
                    htjem = c.htjem
                else:
                    shbz = 'USD$'
                    htje = c.htje
                    wxje = c.mjzj
                    xbfy = ((htje - ysdj) * c.xbfl)
                    htjer = c.htjer
                    htjem = c.htjem

                    if cyrq == '' or cyrq is None:
                        cyrq = c.zgrqj

                    jgtk = c.jgtk
                    jhfs = c.jhfs
                    shqx = c.shqx
                    dfrq = c.dfrq
                    yjje = c.yjje
                    kamc = c.mdka
                    cdmc = c.cdmc
                    gjmc = c.mygb
                    RMBkh = c.RMBkh
                    ywry = c.ywry

                    zdry = c.zdry
                    dlmc = c.dlmc

                    ygnlf = c.ygnlf

                    jxUSD = c.jxUSD
                    kpfyz = c.kpfyz
                    jxRMB = c.jxRMB
                    qtrmb = c.qtrmb
                    ewhj = c.ewhj


                    a = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1')).filter(cymxsheet.fphm == invoiceNo, cymxsheet.zzsl > 1, cymxsheet.tsl == 0).first()
                    if a and a.gczjrmb1:
                        tshj0 = a.gczjrmb1

                    a = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1'),cymxsheet.tsl,cymxsheet.zzsl,cymxsheet.cgdq,cymxsheet.gcmc,cymxsheet.cghbdm,
                        func.sum(cymxsheet.gczj).label('gczj1')).filter(cymxsheet.fphm == invoiceNo, cymxsheet.mlsb == '是'
                        ).group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.zhwbgpm, cymxsheet.cghbdm).all()
                    for r in a:
                        if r.zzsl == 0 or r.zzsl == None:
                            if r.cgdq == '义乌':
                                if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                                    ywhjm = ywhjm + (trunc(r.gczj1 / 10) * 10)
                                else:
                                    ywhjr = ywhjr + (trunc(r.gczj1 / 10) * 10)
                            else:
                                if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                                    nbhjm = nbhjm + (trunc(r.gczj1 / 10) * 10)
                                else:
                                    nbhjr = nbhjr + (trunc(r.gczj1 / 10) * 10)

                        if r.tsl == 16:
                            tshj16 = tshj16 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 13:
                            tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 10:
                            tshj10 = tshj10 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 6:
                            tshj6 = tshj6 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 3:
                            tshj3 = tshj3 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 1:
                            tshj1 = tshj1 + (trunc(r.gczjrmb1 / 10) * 10)

                    a = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1'),cymxsheet.tsl,cymxsheet.zzsl,cymxsheet.cgdq,cymxsheet.gcmc,cymxsheet.cghbdm,
                        func.sum(cymxsheet.gczj).label('gczj1')).filter(cymxsheet.fphm == invoiceNo, cymxsheet.mlsb == '否'
                        ).group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.zhwbgpm, cymxsheet.cghbdm).all()
                    for r in a:
                        if r.zzsl == 0 or r.zzsl == None:
                            if r.cgdq == '义乌':
                                if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                                    ywhjm = ywhjm + (trunc(r.gczj1 / 10) * 10)
                                else:
                                    ywhjr = ywhjr + (trunc(r.gczj1 / 10) * 10)
                            else:
                                if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                                    nbhjm = nbhjm + (trunc(r.gczj1 / 10) * 10)
                                else:
                                    nbhjr = nbhjr + (trunc(r.gczj1 / 10) * 10)

                        if r.tsl == 16:
                            tshj16 = tshj16 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 13:
                            tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 10:
                            tshj10 = tshj10 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 6:
                            tshj6 = tshj6 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 3:
                            tshj3 = tshj3 + (trunc(r.gczjrmb1 / 10) * 10)
                        if r.tsl == 1:
                            tshj1 = tshj1 + (trunc(r.gczjrmb1 / 10) * 10)
                    
                    ywxj = ywhjr + ywhjm * yhhl
                    nbxj = nbhjr + nbhjm * yhhl
                    xjhj = ywxj + nbxj
                    cghjzje = tshj0 + tshj16 + tshj13 + tshj10 + tshj6 + tshj3 + tshj1 + ywxj + nbxj

                    cbzje = cghjzje + yzaf + c.qtrmb
                    cbze1 = cghjzje + ygnlf + c.qtrmb
                    ts16 = round((tshj16 / 1.16 * 0.16) * 100) / 100
                    if ts16 > 0 :
                        ts13 = round((tshj13 / 1.16 * 0.13) * 100) / 100
                        ts10 = round((tshj10 / 1.16 * 0.10) * 100) / 100
                        ts6 = round((tshj6 / 1.16 * 0.06) * 100) / 100
                    else:
                        ts13 = round((tshj13 / 1.13 * 0.13) * 100) / 100
                        ts10 = round((tshj10 / 1.13 * 0.10) * 100) / 100
                        ts6 = round((tshj6 / 1.13 * 0.06) * 100) / 100
                    ts3 = round((tshj3 / 1.03 * 0.03) * 100) / 100
                    ts1 = round((tshj1 / 1.01 * 0.01) * 100) / 100
                    jklx = 0
                    tszje = ts13 + ts10 + ts6 + ts3 + ts16 + ts1

                    ayjje = c.ayjje
                    myjje = c.myjje
                    if sbz != '1':
                        xbfy = 0

                    if c.RMBkh == '是':
                        hsml = round((hjshz - hyf * yhhl - xbfy1 - cbzje + tszje - ayjje - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                        yghsml = round((htje - hyf * yhhl - xbfy - cbzje + tszje - ayjje - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                        if htje != 0:
                            mll = 100 * (hsml / htje)
                            ygmll = 100 * (yghsml / htje)
                    else:
                        if (htje != 0) and (yhhl != 0) :
                            hsml = round((hjshz - (ayjje + hyf) * yhhl - cbzje - xbfy1 - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                            yghsml = round(((htje - ayjje - hyf - xbfy) * yhhl - cbzje - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                            mll = 100 * (hsml / (htje * yhhl))
                            ygmll = 100 * (yghsml / (htje * yhhl))

            hsmlz = 0
            if 'CSD-' not in invoiceNo:
                a = s.query(fpgl).filter(or_(fpgl.wxfp == invoiceNo, fpgl.hsfp == invoiceNo)).first()
                if a:
                    a.shje = shje
                    a.shrq1 = shrq1
                    a.djjer = djjerZ
                    a.djjem = djjemZ
                    a.hdfyxq = cwqrqk
                    if yhhl != 0:
                        a.shzmj = round((float(djjemZ) + float(djjerZ) / float(yhhl)) * 100) / 100
                    else:
                        a.shzmj = 0
                    if RMBkh == '是':
                        hsmlz = round((float(djjerZ) + float(djjemZ) * float(yhhl) - ayjje - hyf * float(yhhl) - xbfy1 - cbzje + tszje - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                        a.hsml = hsmlz
                        if htje != 0:
                            a.mll = 100 * (hsmlz / htje)
                        else:
                            a.mll = 0
                    else:
                        if (htje != 0) and (yhhl != 0) :
                            hsmlz = round((float(djjerZ) + float(djjemZ) * float(yhhl) - ayjje - hyf * float(yhhl) - cbzje - xbfy1 - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                            a.hsml = hsmlz
                            a.mll = 100 * (hsmlz / (htje * float(yhhl)))
                        else:
                            a.hsml = 0
                            a.mll = 0
                else:
                    a = fpgl()
                    a.rid = get_uuid()
                    a.wxfp = invoiceNo
                    a.wxfp1 = hsfp
                    a.fphm = hsfp
                    a.hsfp = hsfp
                    a.bglx = bglx
                    a.fpbz = fpbz12
                    a.shsd = '是'
                    a.qesh = '是'
                    a.CNFyf = CNFyf
                    a.sjf1 = sjf1
                    a.JGD = JGD
                    if bglx == '内销':
                        a.sfnm = '是'
                    else:
                        a.sfnm = '否'
                    a.hdfyxq = cwqrqk
                    a.xybx = xybx
                    a.cysd = '否'
                    a.cygg = '否'
                    a.ysdj = ysdj
                    a.khmc = khmc
                    a.RMBkh = RMBkh
                    a.hbdm = shbz
                    a.xjzk = float(xjzk)
                    a.cyrq = cyrq
                    a.jgtk = jgtk
                    a.jhfs = jhfs
                    a.shqx = shqx
                    a.dfrq = dfrq
                    a.mdka = kamc
                    a.cdmc = cdmc
                    a.mygb = gjmc
                    a.ywry = ywry123
                    a.ywbm = ywbm123
                    a.zdry = zdry
                    a.dlmc = dlmc
                    a.shje = shje
                    a.shrq1 = shrq1
                    a.djjer = djjerZ
                    a.djjem = djjemZ
                    a.xbfl = xbfl
                    a.wxje = wxje
                    if RMBkh == '是':
                        a.ygxbfy = round(xbfy * 100) / 100
                    else:
                        a.ygxbfy = round(xbfy * 100) / 100
                    a.xbfy = xbfy1
                    a.htje = htje
                    a.htjer = htjer
                    a.htjem = htjem
                    a.yjje = yjje
                    a.hyf = hyf
                    a.ygnlf = ygnlf
                    a.zgfy = zgfy1
                    a.ckfy = ckfy1
                    a.yzaf = yzaf - sjf - zgfy1 - ckfy1
                    a.sjf = sjf
                    a.jxUSD = jxUSD
                    a.jxRMB = jxRMB
                    a.kpfyz = kpfyz
                    a.qtrmb = qtrmb
                    a.ewhj = ewhj
                    a.tshj16 = tshj16
                    a.tshj13 = tshj13
                    a.tshj10 = tshj10
                    a.tshj6 = tshj6
                    a.tshj0 = tshj0
                    a.tshj3 = tshj3
                    a.tshj1 = tshj1
                    a.cghjzje = cghjzje - jxRMB
                    a.cbzje = cbzje
                    a.jklx = jklx
                    a.tszje = tszje
                    a.hsml = hsml
                    a.yghsml = yghsml
                    a.mll = round(mll * 100) / 100
                    a.ygmll = round(ygmll * 100) / 100
                    a.ayjje = ayjje
                    a.myjje = myjje
                    a.bgje = bgje
                    a.shje = shje
                    a.yhhl = yhhl
                    a.wxce = round((htje - shje) * 100) / 100
                    a.ywfy = ywfy
                    a.qtfy = 0
                    a.qtfysm = ''
                    a.sfjd = '否'
                    a.khpk = khpk
                    a.gcpk = gcpk
                    a.jxKHRMB = jxKHRMB
                    a.fyUSD = fyUSD
                    a.fyRMB = fyRMB

                    if yhhl != 0:
                        if shbz != 'RMB':
                            a.shzmj = round((float(djjemZ) + float(djjerZ) / float(yhhl)) * 100) / 100
                        if RMBkh == '是':
                            a.htjez1 = round(float(htje) / float(yhhl) * 100) / 100
                        else:
                            a.htjez1 = htje
                    a.bgje1 = bgje1
                    a.bggs = bggs
                    a.bgdh = bgdh
                    a.zwpmz = zwpmz
                    a.zfph = cydh
                    a.zshsq = None
                    a.yjhsq = None
                    a.hxddf1 = '否'
                    a.ywhj = ywxj
                    a.nbhj = nbxj
                    a.ywxj = ywxj
                    a.nbxj = nbxj
                    a.tshj = tshj16 + tshj13 + tshj10 + tshj6 + tshj0 + tshj3 + tshj1
                    a.fxhj = ywxj + nbxj
                    a.xjhj = ywxj + nbxj
                    a.ywdz = ywdz
                    a.ywxz = ywxz
                    a.ywhjr = ywhjr
                    a.nbhjr = nbhjr
                    a.ywhjm = ywhjm
                    a.nbhjm = nbhjm
                    a.xbdrsj = xbdrsj
                    a.qesh = '是'
                    a.shsd = '是'
                    a.hkjq = '否'
                
                s.add(a)

        s.commit()
        return json_result(1, '操作成功')
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

