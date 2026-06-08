from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
import time
import httpx
import os
import json
import re
import zipfile
from .items import insert_script_log, get_user_path, SYS_FIELDS
from datetime import datetime
from .__default__ import user_task_new,module_workflow_get_task,user_task_delete,module_workflow_start_check


# 潜在工厂货源地change
@any_route('/api/saier/suppliers/hyd/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_hyd_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        hyd = j.get('hyd', '')
        kpgc = j.get('kpgc', '')
        cs_id = j.get('cs_id', '')
        flag = False
        d = s.query(cgjhsheet).filter(cgjhsheet.kpgc == kpgc).all()
        for r in d:
            hyd_old = r.hyd
            r.hyd = hyd
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(r)
            flag = True
        if flag:
            res = await insert_script_log('潜在产品', cs_id, '货源地更新', '成功', user, str({"厂商编号:": cs_id, "原货源地": hyd_old, '新货源地': hyd}), s=s)
            s.commit()

        return json_result(1, '更新成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()


# 潜在工厂保存前-厂商编号
@any_route('/api/saier/suppliers/get/rate', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_get_rate(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        flag = 0
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm ==user.username, cyzglsheet.zm == '工厂审核').first()
        if d:
            flag = 1
        # 删除提醒功能待加入
        return json_result(1, '取数成功', flag)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()

# 潜在工厂保存前-厂商编号


@any_route('/api/saier/suppliers/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        bhbm = ''
        bhjg = ''
        gcsh = 0
        data = j.get('data')
        job = j.get('job', 1)
        cs_id = j.get('cs_id')
        cs_name = j.get('cs_name')
        gcpf = j.get('gcpf')
        sccj = ''
        hzdj1 = 0
        module = j.get('module')
        rid = j.get('rid')
        xjsb = 1
        gd_list = []
        xgsb1 = 0
        xgsb = 0
        hzdj1 = 0
        kpgc = j.get('kpgc')
        splx = j.get('splx')
        gclx = j.get('gclx')
        if splx == '加分申请':
            if gclx == '潜在工厂':
                d = s.query(ozycs.hzdj1).filter(ozycs.cs_id == cs_id).first()
            else:
                d = s.query(zycs.hzdj1).filter(zycs.cs_id == cs_id).first()
            if d:
                hzdj1 = float(d.hzdj1)

        # sqry = j.get('sqry')
        # rzsq = j.get('ycsq')
        # sqrq = j.get('sqrq')
        # cs_id = j.get('cs_id')
        c = s.query(newcwcs.rid).filter(
            newcwcs.company_name == kpgc).first()
        if not c:
            kpgc = ''

        if module == '潜在工厂':
            org = get_user_path(user.username)
            path = org.get('path')
            if job != 1:
                if '义乌' in path:
                    bhjg = 'Y'
                d = s.query(ywrybiao.bm).filter(
                    ywrybiao.yhm.like('%nblh%')).first()
                if d:
                    bhbm = str(d.bm)
                # if module=='专业工厂':
                #     con = Session()
                #     try:
                #         csbh = auto_number.generate(s,'专业工厂.厂商编号',{'rid':rid,'专业工厂.编号结构':bhjg,'编号部门':bhbm})
                #         c = s.query(ozycs.rid).filter(ozycs.cs_id==csbh).first()
                #         if c:
                #             return json_resualt(-1,f"不好意思,潜在工厂已有厂商编号【{csbh}】，请重新保存")
                #     except:
                #         logger.error(trace_error())
                #         return json_resualt(-1,'校验厂商编号出错')
                #     finally:
                #         con.rollback()
                #         con.close()

        if module == '专业工厂':
            zhkp = data.get('zhkp')
            hyd = data.get('hyd')
            kkppm = data.get('kkppm')
            # xgsb = data.get('xgsb')
            d = s.query(zycs.yyzz, zycs.nsrdjb, zycs.nssbb,
                zycs.sccj1).filter(zycs.rid == rid).first()
            logger.error("d: %s", d)

            if d and d.yyzz!=None and d.nsrdjb!=None and d.nssbb!=None and d.sccj1!=None and d.yyzz != '' and d.yyzz != '[]' and d.nsrdjb != '' and d.nsrdjb != '[]' and d.nssbb!=None and d.nssbb != '' and d.sccj1 != '[]' and d.sccj1 != '[]':
                xjsb = 0
                logger.error("xjsb: %s", xjsb)
                
            d = s.query(cymxsheet.gdry).filter(
                cymxsheet.sccj1id == cs_id, cymxsheet.gdry == user.username).first()
            if d and d.gdry and d.gdry != "" and not d.gdry in gd_list:
                gd_list.append(d.gdry)

            d = s.query(func.distinct(cght.ywry).label('ywry')
                        ).filter(cght.sccj1id == cs_id).all()
            for r in d:
                if r.ywry and r.ywry != "" and not r.ywry in gd_list:
                    gd_list.append(r.ywry)
                    c = s.query(ywrybiao.bmjl, ywrybiao.sybzj).filter(
                        ywrybiao.yhm == r.ywry).first()
                    if c:
                        xgsb1 = 1
                        if c.bmjl and c.bmjl != "" and not c.bmjl in gd_list:
                            gd_list.append(c.bmjl)
                        if c.sybzj and c.sybzj != "" and not c.sybzj in gd_list:
                            gd_list.append(c.sybzj)

            d = s.query(func.distinct(cght.cgry).label('ywry')
                        ).filter(cght.sccj1id == cs_id).all()
            for r in d:
                if r.ywry and r.ywry != "" and not r.ywry in gd_list:
                    gd_list.append(r.ywry)
                    c = s.query(ywrybiao.bmjl, ywrybiao.sybzj).filter(
                        ywrybiao.yhm == r.ywry).first()
                    if c:
                        xgsb1 = 1
                        if c.bmjl and c.bmjl != "" and not c.bmjl in gd_list:
                            gd_list.append(c.bmjl)
                        if c.sybzj and c.sybzj != "" and not c.sybzj in gd_list:
                            gd_list.append(c.sybzj)

            d = s.query(func.distinct(cght.gdry).label('ywry')
                        ).filter(cght.sccj1id == cs_id).all()
            for r in d:
                if r.ywry and r.ywry != "" and not r.ywry in gd_list:
                    gd_list.append(r.ywry)
                    c = s.query(ywrybiao.bmjl, ywrybiao.sybzj).filter(
                        ywrybiao.yhm == r.ywry).first()
                    if c:
                        xgsb1 = 1
                        if c.bmjl and c.bmjl != "" and not c.bmjl in gd_list:
                            gd_list.append(c.bmjl)
                        if c.sybzj and c.sybzj != "" and not c.sybzj in gd_list:
                            gd_list.append(c.sybzj)
            logger.error("xgsb1: %s", xgsb1 )
            if xgsb1 == 1:
                d = s.query(func.distinct(cyzglsheet.xm).label(
                    'ywry')).filter(cyzglsheet.zm == "专业工厂修改").all()
                for r in d:
                    if r.ywry and r.ywry != "" and not r.ywry in gd_list:
                        gd_list.append(r.ywry)

                d = s.query(func.distinct(zycssheet3.kggry).label('ywry')).filter(
                    zycssheet3.kggry == user.username, zycssheet3.pid == rid).all()
                for r in d:
                    if r.ywry and r.ywry != "" and not r.ywry in gd_list:
                        gd_list.append(r.ywry)
                if user.username in gd_list:
                    xgsb = 1
            else:
                xgsb = 1

            if xgsb == 0:
                return json_result(-1, '您无权修改此记录,如有认证已自动提交')

            if not (zhkp == '是' and (hyd == '' or kkppm == '' and xgsb != '1')):
                d = s.query(ozycs).filter(ozycs.cs_id == cs_id).first()
                if d:
                    d.jsfs = data.get('jsfs')
                    d.company_name = data.get('company_name')
                    d.ywbf = data.get('ywbf')
                    d.phone = data.get('phone')
                    d.sjhm = data.get('sjhm')
                    d.hyd = data.get('hyd')
                    d.kpgc = data.get('kpgc')
                    d.zzjgdm = data.get('zzjgdm')
                    d.kplxr = data.get('kplxr')
                    d.kpdh = data.get('kpdh')
                    d.city1 = data.get('city1')
                    d.province1 = data.get('province1')
                    d.cymch = data.get('cymch')
                    d.fmqk = data.get('fmqk')
                    s.add(d)

                if job == 1:
                    jsfs_n = data.get('jsfs')
                    d = s.query(zycs.jsfs).filter(
                        zycs.cs_id == cs_id).first()
                    if d and jsfs_n != d.jsfs:
                        c = s.query(zscp).filter(zscp.gcID == cs_id).all()
                        for r in c:
                            r.jsfs = jsfs_n
                            s.add(r)
                        c = s.query(zscpsheet5).filter(
                            zscpsheet5.gcID == cs_id).all()
                        for r in c:
                            r.jsfs = jsfs_n
                            s.add(r)

        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm==user.username, cyzglsheet.zm == '工厂审核').first()
        if d:
            gcsh = 1

        d = s.query(zycs.company_name, zycs.hzdj1).filter(
            zycs.cs_id == cs_id).first()
        if d:
            sccj = str(d.company_name)
            hzdj1 = int(d.hzdj1)

        if gcpf > 60 and hzdj1 != gcpf:
            d = s.query(cgjhsheet).filter(cgjhsheet.sccj1id == cs_id).all()
            for r in d:
                r.gcpf = gcpf
                r.sfqr = '是'
                s.add(r)

        if sccj != cs_name:
            d = s.query(zscpsheet5).filter(zscpsheet5.gcID == cs_id).all()
            for r in d:
                r.sccj = cs_name
                s.add(r)

            d = s.query(cjcp).filter(cjcp.sccj == cs_name).all()
            for r in d:
                r.sccj = cs_name
                s.add(r)

            d = s.query(zscp).filter(zscp.sccj == cs_name).all()
            for r in d:
                r.sccj = cs_name
                s.add(r)

            d = s.query(gckm).filter(gckm.sccj == cs_name).all()
            for r in d:
                r.sccj = cs_name
                s.add(r)

        # ywjl = ''
        # ywzj = ''
        # d = s.query(ywrybiao.bm).filter(ywrybiao.yhm==sqry).first()
        # if d:
        #     ywjl = str(d.bmjl)
        #     ywzj = str(d.sybzj)
        # org = get_user_path(sqry)
        # path = org.get('path')
        # if sqrq!=None and sqrq!="":
        #     sqrq = sqrq[:10]
        # if rzsq!=None and rzsq!='' and sqrq==user.username and sqrq==time.strftime('%Y-%m-%d'):
        #     d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm==rzsq,cyzglsheet.zm=='工厂审核').first()
        #     if d:
        #         sqrq = time.strftime('%Y-%m-%d')
        #         c = s.query(ddsp).filter(ddsp.wyzd==cs_id,ddsp.ddly=='潜在工厂认证审请').first()
        #         if c:
        #             t = s.query(cyzglsheet).filter().first()
        #         else:
        #             json_result(-1, '不好意思,此人无审核权限')

        s.commit()
        return json_result(1, '取数成功', {'bhbm': bhbm, 'bhjg': bhjg, 'gcsh': gcsh, 'xjsb': xjsb, 'xgsb': xgsb, 'kpgc':kpgc, 'hzdj1': hzdj1})
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()


# 潜在工厂开票工厂change
@any_route('/api/saier/suppliers/kpgc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_kpgc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        kpgc = j.get('kpgc', '')
        sccj = j.get('sccj', '')
        data = {}
        d = s.query(ozycs.zzjgdm, ozycs.kplxr, ozycs.kpdh).filter(
            ozycs.company_name == kpgc).first()
        if d:
            c = s.query(newcwcs.rid).filter(
                newcwcs.company_name == kpgc).first()
            if not c:
                return json_result(-1, '请注意无此财务工厂,需通知财务增加')
            data['zzjgdm'] = d.zzjgdm
            data['kplxr'] = d.kplxr
            data['kpdh'] = d.kpdh
        else:
            if sccj != kpgc:
                return json_result(-1, '请注意无此开票工厂')
            data['zzjgdm'] = ''
            data['kplxr'] = ''
            data['kpdh'] = ''

        return json_result(1, '校验成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 潜在工厂结算详细change
@any_route('/api/saier/suppliers/jsxq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_jsxq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        jsxx = j.get('jsxx')
        d = s.query(dxkz.rid).filter(
            dxkz.szmk == '专业工厂', dxkz.zdmc == '结算详细').first()
        if d:
            c = s.query(dxkzsheet.rid).filter(dxkzsheet.pid ==
                                              d.rid, dxkzsheet.xznr == jsxx).first()
            if not c:
                return json_result(-1, '不好意思,无此结算详细,请重新选择,谢谢!')

        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 潜在工厂结算方式change
@any_route('/api/saier/suppliers/jsfs/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_jsfs_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = 0
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm ==
                                           user.username, cyzglsheet.zm == '结算方式变更').first()
        if d:
            data = 1

        return json_result(1, '校验成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


async def suppliers_trans_main(pid, d, user, s):
    try:
        m = zycs()
        for k, v in d.items():
            if k in SYS_FIELDS:
                continue
            if hasattr(m, k):
                setattr(m, k, v)
        m.rid = pid
        m.uid = user.rid
        m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
        m.zrsj = time.strftime('%Y-%m-%d %H:%M:%S')
        m.zrry = user.username
        m.has_att = d.get('has_att')
        m.ycsq = ''
        m.hmd1 = '否'
        m.pdry = ''
        m.zycs_id = d.get('cs_id')
        m.Field2 = time.strftime('%Y-%m-%d')
        s.add(m)

        return {"code": 1, "msg": "操作成功"}
    except:
        logger.error(trace_error())
        return {"code": -1, "msg": trace_error()}


async def suppliers_trans_line(pid, d, user, s):
    try:
        for r in d:
            m = zycslxr()
            for k, v in r.items():
                if k in SYS_FIELDS:
                    continue
                if hasattr(m, k):
                    setattr(m, k, v)
            m.rid = get_uuid()
            m.pid = pid
            m.uid = user.rid
            m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
            s.add(m)

        return {"code": 1, "msg": "操作成功"}
    except:
        logger.error(trace_error())
        return {"code": -1, "msg": trace_error()}


async def suppliers_trans_zy(rids, user, s):
    try:
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm==user.username,cyzglsheet.zm=="潜在转专业").first()
        if not d:
            return {'code': -1, 'msg': '权限校验失败'}
        org = get_user_path(user.username)
        path = org.get('path')
        for rid in rids:
            o = s.query(ozycs).filter(ozycs.rid == rid).first()
            if not o:
                return {'code': -1, 'msg': '潜在工厂记录不存在'}
            d = alchemy_object_to_dict(o)
            cs_id = d.get('cs_id')
            c = s.query(zycs.rid).filter(zycs.cs_id == cs_id).first()
            if c:
                return {'code': -1, 'msg': f"专业工厂{cs_id}已经存在"}
            if d.get('hzdj1', 0) < 60:
                return {'code': -1, 'msg': '综合评分低于60分'}
            if d.get('yyzz') == None or d.get('yyzz') == '' or d.get('yyzz') == '[]':
                return {'code': -1, 'msg': '营业执照为空'}
            if d.get('sccj1') == None or d.get('sccj1') == '' or d.get('sccj1') == '[]':
                return {'code': -1, 'msg': '生产车间'}
            if d.get('nsrdjb') == None or d.get('nsrdjb') == '' or d.get('nsrdjb') == '[]':
                return {'code': -1, 'msg': '纳税人登记表'}
            if d.get('nssbb') == None or d.get('nssbb') == '' or d.get('nssbb') == '[]':
                return {'code': -1, 'msg': '纳税申报表'}
            pid = get_uuid()
            res = await suppliers_trans_main(pid, d, user, s)
            if res.get('code') != 1:
                return res
            c = s.query(ozycslxr).filter(ozycslxr.pid == rid).all()
            c = alchemy_object_list_to_dict(c)
            res = await suppliers_trans_line(pid, c, user, s)
            if res.get('code') != 1:
                return res
            res = user_task_delete('潜在工厂', rid, s, [user.username], '转专业工厂申请')
            if res.get('code') != 1:
                return res
            m = zycssheet4()
            m.rid = get_uuid()
            m.pid = pid
            m.uid = user.rid
            m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            m.jsfs = d.get('jsfs')
            m.bgsj = time.strftime('%Y-%m-%d %H:%M:%S')
            m.zt = '无'
            m.bgry = user.username
            m.jsfs1 = d.get('jsfs')
            s.add(m)

            o.sfzs = '是'
            s.add(o)

            res = await insert_script_log('潜在工作', cs_id, '潜在转专业工厂', '成功', user, str({"厂商编号": cs_id, "潜在工厂": d, "联系人表": c}), s=s)
            if res.get('code') != 1:
                return res

        return {"code": 1, "msg": "操作成功"}
    except:
        logger.error(trace_error())
        return {"code": -1, "msg": trace_error()}

# 潜在工厂转专业工厂


@any_route('/api/saier/suppliers/trans/zy', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_trans_zy(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', '')
        res = await suppliers_trans_zy(rids, user, s)
        if res.get('code') != 1:
            s.rollback()
        else:
            s.commit()
        return json_result(res.get('code'), res.get('msg'), res.get('data'))
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 潜在工厂可否更改


@any_route('/api/saier/suppliers/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        module = j.get('module')
        data = {}
        data['deleted'] = 0
        data['rzsq'] = 0
        data['gcrz'] = 0
        data['gcsh'] = 0
        data['sfgd'] = 0
        data['hmd'] = 0
        data['gcgg'] = 0
        data['sfcw'] = 0
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '结算变更删除').first()
        if d:
            data['deleted'] = 1

        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '工厂认证').first()
        if d:
            data['gcrz'] = 1

        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '工厂审核').first()
        if d:
            data['gcsh'] = 1

        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '黑 名 单').first()
        if d:
            data['hmd'] = 1

        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '工厂名称更改').first()
        if d:
            data['gcgg'] = 1

        org = get_user_path(user.username, " and (position like '%外销%' or memo like '%外销%')")
        if org.get('rid') != None and org.get('rid') != "":
            data['rzsq'] = 1

        org = get_user_path(user.username, " and (position like '%跟单%' or memo like '%跟单%')")
        if org.get('rid') != None and org.get('rid') != "":
            data['sfgd'] = 1

        if module == '专业工厂':
            org = get_user_path(user.username, " and (position like '%财务%' or memo like '%财务%')")
            if org.get('rid') != None and org.get('rid') != "":
                data['sfcw'] = 1

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 潜在工厂启信宝获取数据 未启用


@any_route('/api/saier/suppliers/get/qxb', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_get_qxb(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        # data = 0
        url = j.get('url', 'http://221.12.55.50:8413/qxb/external_blacklist/')
        params = j.get('sccj', "蚌埠万耀玻璃制品有限公司")
        body = {
            "sccj": params
        }
        res = httpx.post(url=url, data=body, timeout=60).json()
        logger.error(res)
        # d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm==user.username,cyzglsheet.zm=='结算方式变更').first()
        # if d:
        #     data = 1

        return json_result(1, '校验成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 潜在工厂认证申请change 未启用
@any_route('/api/saier/suppliers/rzsq/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_rzsq_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        gcID = j.get('kpgc', '厂商编号')
        data = 0
        d = s.query(ddsp.rid).filter(ddsp.wyzd == gcID,
            or_(ddsp.ddly == '潜在工厂认证审请', ddsp.ddly=='工厂认证审请')).first()
        if not d:
            data = 1

        return json_result(1, '校验成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 专业工厂下载图片
@any_route('/api/saier/suppliers/download/photo', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_download_photo(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        kind = j.get('kind', '专业工厂')
        fields = [
            {'field': 'bgs', 'title': '办公室'},
            {'field': 'gcwg', 'title': '工厂外观'},
            {'field': 'gcwg1', 'title': '工厂外观1'},
            {'field': 'gcwg2', 'title': '工厂外观2'},
            {'field': 'sccj1', 'title': '生产车间'},
            {'field': 'sccj4', 'title': '生产车间1'},
            {'field': 'sccj3', 'title': '生产车间2'},
            {'field': 'ck', 'title': '仓 库'},
            {'field': 'yclt1', 'title': '原材料1'},
            {'field': 'ycl2', 'title': '原材料2'},
            {'field': 'ypj', 'title': '样品间'},
            {'field': 'zzjg', 'title': '样品间1'},
            {'field': 'gccptp', 'title': '产品图片'},
            {'field': 'swdjz', 'title': '产品图片1'},
            {'field': 'sccj2', 'title': '包装车间'},
            {'field': 'grtp', 'title': '工人图片'},
            {'field': 'qttp', 'title': '设备图片'},
            {'field': 'yyzz', 'title': '营业执照'},
            {'field': 'gcqz', 'title': '工厂签字'},
            {'field': 'nsrdjb', 'title': '纳税人登记表'},
            {'field': 'nssbb', 'title': '纳税申报表'},
            {'field': 'gccxs', 'title': '工厂诚信书'}
        ]
        o = zycs
        if kind == '专业工厂':
            d = s.query(zycs).filter(zycs.rid == rid).first()
        else:
            d = s.query(ozycs).filter(zycs.rid == rid).outerjoin(
                zycs, zycs.cs_id == ozycs.cs_id).first()
        if not d:
            return json_result(-1, '请选择需要导出图片的厂商记录')

        flag = -1
        msg = '未找到厂商图片'
        path = config.data_upload_path
        tmp = config.tmp_path
        sZipPath = os.path.join(
            tmp, str(user.username)+'_'+str(d.cs_id)+'.zip')  # 压缩包路径
        # 生成一个压缩包，第二个参数默认值为'r'，表示读已经存在的zip文件，'w'表示新建一个zip文档或覆盖一个已经存在的zip文档
        zipFile = zipfile.ZipFile(sZipPath, 'w')
        m = alchemy_object_to_dict(d)
        for r in fields:
            k = r.get('field')
            v = r.get('title')
            if m.get(k) == None or m.get(k) == '' or m.get(k) == '[]':
                continue
            photos = json.loads(m.get(k))
            if len(photos) > 0 and len(photos[0].get('src')) != "":
                src = photos[0].get('src')
                fn = os.path.join(path, src)
                if os.path.exists(fn):
                    flag = 1
                    msg = '下载成功'
                    # 将sPath的文件重命名为sfilename
                    zipFile.write(
                        fn, str(v) + '_' + str(photos[0].get('name')), zipfile.ZIP_DEFLATED)
        zipFile.close()

        return json_result(flag, msg, data={'path': str(user.username)+'_'+str(d.cs_id)+'.zip', 'name': str(user.username)+'_'+str(d.cs_id)+'.zip'})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 专业工厂下载图片
@any_route('/api/saier/suppliers/upload/photo', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_upload_photo(request):
    s = Session()
    user = request.current_user
    j = await request.form()
    try:
        rid = j.get('rid')
        kind = j.get('kind')
        # file = j.get('file', None)
        file  = j.get('file.raw',None)
        if is_none(file):
            return json_result(-1, '文件错误')
        d = await file.read()
        # logger.error(d)
        path = config.get_today_upload_path()
        if not os.path.exists(path):
            make_dirs(path)
        sbs_path = path[-10:]
        name = get_uuid()
        fn = os.path.join(path, name+'.zip')
        write_file(fn, d, 'wb', encoding=None)
        # os.environ['LANG'] = 'en_US.UTF-8'
        # os.environ['LC_ALL'] = 'en_US.UTF-8'
        fp = os.path.join(path, name)
        with zipfile.ZipFile(fn, 'r') as zip_ref:
            zip_ref.extractall(fp)

        if kind == '专业工厂':
            d = s.query(zycs).filter(zycs.rid == rid).first()
        else:
            d = s.query(ozycs).filter(zycs.rid == rid).outerjoin(zycs, zycs.cs_id == ozycs.cs_id).first()
        if not d:
            return json_result(-1, '请选择需要导出图片的厂商记录')

        fields = {
            '办公室': 'bgs',
            '工厂外观': 'gcwg',
            '工厂外观1': 'gcwg1',
            '工厂外观2': 'gcwg2',
            '生产车间': 'sccj1',
            '生产车间1': 'sccj4',
            '生产车间2': 'sccj3',
            '仓 库': 'ck',
            '原材料1': 'yclt1',
            '原材料2': 'ycl2',
            '样品间': 'ypj',
            '样品间1': 'zzjg',
            '产品图片': 'gccptp',
            '产品图片1': 'swdjz',
            '包装车间': 'sccj2',
            '工人图片': 'grtp',
            '设备图片': 'qttp',
            '营业执照': 'yyzz',
            '工厂签字': 'gcqz',
            '纳税人登记表': 'nsrdjb',
            '纳税申报表': 'nssbb',
            '工厂诚信书': 'gccxs'
        }

        # for f in os.listdir(fp):
        #     p_path = os.path.join(fp, f)
        #     photo_list = []
        #     if os.path.isfile(p_path):
        #         photo_list.append({"src": str(sbs_path)+"/"+str(name)+'/'+str(f), "name": str(f)})
        #         l = f.split('.')
        #         k = fields.get(l[0])
        #         if fields.get(l[0]) and hasattr(d,k):
        #             Photo = str(photo_list)
        #             setattr(d, k, Photo.replace("'", '"'))
        #     logger.error(f)

        def set_field_val(src,name):
            photo_list = []
            photo_list.append({"src":src,"name":str(name)})
            l = name.split('.')
            k = fields.get(l[0])
            if fields.get(l[0]) and hasattr(d,k):
                Photo = str(photo_list)
                setattr(d, k, Photo.replace("'", '"'))

        for p in os.listdir(fp):
            p_path = os.path.join(fp, p)
            if os.path.isfile(p_path):
                set_field_val(str(sbs_path)+"/"+str(name)+'/'+str(p),p)
            else:
                for f in os.listdir(p_path):
                    f_path = os.path.join(p_path, f)
                    if os.path.isfile(f_path):
                        set_field_val(str(sbs_path)+"/"+str(name)+'/'+str(p)+'/'+str(f),f)
                    logger.error(f)
            logger.error(p)
        s.add(d)
        s.commit()

        return json_result(1, '文件上传')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# # 专业工厂保存前更新，综合评分、工厂简称修改
# @any_route('/api/saier/suppliers/save/before', methods=['POST', 'GET'])
# @require_token
# async def view_saier_suppliers_save_before(request):
#     s = Session()
#     user = request.current_user
#     j = await request.json()
#     try:
#         cs_id = j.get('cs_id')
#         cs_name = j.get('cs_name')
#         gcpf = j.get('gcpf')
#         sccj = ''
#         hzdj1 = 0
#         d = s.query(zycs.company_name,zycs.hzdj1).filter(zycs.cs_id==cs_id).first()
#         if not d:
#             sccj = str(d.company_name)
#             hzdj1 = int(d.hzdj1)
#         if gcpf>60 and hzdj1!=gcpf:
#             d = s.query(cgjhsheet).filter(cyzglsheet.sccj1id==cs_id).all()
#             for r in d:
#                 r.gcpf = gcpf
#                 r.sfqr = '是'
#                 s.add(r)
#                 flag = 1

#         if sccj!=cs_name:
#             d = s.query(zscpsheet5).filter(zscpsheet5.gcID==cs_id).all()
#             for r in d:
#                 r.sccj = cs_name
#                 s.add(r)

#             d = s.query(cjcp).filter(cjcp.sccj==cs_name).all()
#             for r in d:
#                 r.sccj = cs_name
#                 s.add(r)

#             d = s.query(zscp).filter(zscp.sccj==cs_name).all()
#             for r in d:
#                 r.sccj = cs_name
#                 s.add(r)

#             d = s.query(gckm).filter(gckm.sccj==cs_name).all()
#             for r in d:
#                 r.sccj = cs_name
#                 s.add(r)

#         s.commit()
#         return json_result(1, '更新成功')
#     except:
#         s.rollback()
#         logger.error(trace_error())
#         return json_result(-1, trace_error(),'')
#     finally:
#         s.close()


# 专业工厂产品工厂更改
@any_route('/api/saier/suppliers/udpate/sccj', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_udpate_sccj(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        code = -1
        msg = '权限校验失败'
        org = get_user_path(user.username, " and (position like '%外销%' or memo like '%外销%')")
        if org.get('rid') != '':
            data = 1
            msg = '权限校验成功'

        # s.commit()
        return json_result(code, msg)
    except:
        # s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()

# 潜在工厂获取转到专业工厂用户列表


@any_route('/api/saier/suppliers/get/user', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_get_user(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        d = s.query(cyzglsheet.xm).filter(cyzglsheet.zm == "潜在转专业").all()
        data = [r.xm for r in d]
        if len(data) == 0:
            return json_result(-1, '没有找到潜在转专业工厂审批用户')

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()

# 专业工厂-诚信经营书上传
@any_route('/api/saier/suppliers/update/cxgc', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_update_cxgc(request):
    s = Session()
    user = request.current_user
    j = await request.form()
    try:
        rid = j.get('rid')
        file = j.get('file',None)
        file_name = file.filename
        file_size = 123
        if file_size>520880:
            return (-1,'文件大于500K,不能导入,请压缩后再试')
        
        f = await file.read()
        # logger.error(d)
        ext = get_suffix(file_name)
        path = config.get_today_upload_path()
        if not os.path.exists(path):
            make_dirs(path)
        sbs_path = path[-10:]
        name = get_uuid()
        fn = os.path.join(path, name + ext)
        write_file(fn, f, 'wb', encoding=None)
        photo_list = []
        photo_list.append({"src":str(sbs_path)+'/'+str(name + ext),"name":str(file_name)})
        Photo = str(photo_list)
        d = s.query(zycs).filter(zycs.rid == rid).first()
        if not d:
            return json_result(-1, '请选择需要更新的厂商记录')
        cs_id = d.cs_id
        cs_name = d.company_name
        c = s.query(cxgc.rid,cxgc.qrrq).filter(cxgc.cs_id==cs_id,cxgc.sfsh=="是").first()
        if c:
            if c.qrrq!=None and c.qrrq!="":
                qrrq = str(c.qrrq)[:10]
                date_obj = datetime.strptime(qrrq, "%Y-%m-%d")
                # 当前日期
                current_date = datetime.now()
                # 计算日期差
                date_difference = current_date - date_obj
                if date_difference.days<300:
                    return json_result(-1, '最近一次上传期不到300天，不能上传，如果要更改图片请去风控管理诚信工厂')

        ywbm = ''
        c = s.query(ywrybiao.bm).filter(ywrybiao.yhm == user.username).first()
        if c:
            ywbm = c.bm
        c = s.query(cght.sfsh).filter(cght.sccj1id==cs_id,cght.sfsh!='已提供').all()
        for r in c:
            r.sfsh = '已提供'
            s.add(r)

        c = s.query(fksp.sfsh).filter(fksp.gcbh==cs_id,cght.sfsh!='已提供').all()
        for r in c:
            r.sfsh = '已提供'
            s.add(r)

        c = s.query(gchk.cxbg,gchk.modi_uid,gchk.mtime).filter(or_(gchk.gcmc1==cs_name,gchk.gcmc==cs_name),gchk.cxbg!='已提供').all()
        for r in c:
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            r.cxbg  = '已提供'
            s.add(r)

        c = s.query(cgfkhdsheet.cxbg,cgfkhdsheet.modi_uid,cgfkhdsheet.mtime).filter(or_(cgfkhdsheet.gcmc1==cs_name,cgfkhdsheet.gcmc==cs_name),cgfkhdsheet.cxbg!='已提供').all()
        for r in c:
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            r.cxbg = '已提供'
            s.add(r)

        c = s.query(cgfkhdsheet.cxbg,cgfkhdsheet.modi_uid,cgfkhdsheet.mtime).filter(or_(cgfkhdsheet.gcmc1==cs_name,cgfkhdsheet.gcmc==cs_name),cgfkhdsheet.cxbg!='已提供').all()
        for r in c:
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            r.cxbg = '已提供'
            s.add(r)

        c = s.query(cgfkhdsheet.ywhd,cgfkhdsheet.modi_uid,cgfkhdsheet.mtime).filter(or_(cgfkhdsheet.gcmc1==cs_name,cgfkhdsheet.gcmc==cs_name),
            func.ifnull(cgfkhdsheet.ywbtgyy,'')=='',cgfkhdsheet.ywhd=='不通过',cgfkhdsheet.cxbg=='已提供').all()
        for r in c:
            r.modi_uid = user.rid
            r.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            r.ywhd = '已提供'
            s.add(r)

        c = s.query(cxgc).filter(or_(cxgc.cs_id==cs_id,cxgc.gcmc==cs_name)).first()
        if not c:
            c = cxgc()
            c.rid = get_uuid()
            c.uid = user.rid
            c.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            c.cs_id = cs_id
        else:
            c.modi_uid = user.rid
            c.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            c.cs_id1 = cs_id
        c.gcmc = cs_name
        s.chgc = cs_name
        c.ywry = user.username
        c.ywz = ywbm
        c.sfsh = '是'
        c.yrgs = '宁波优景进出口有限公司'
        c.qrrq = time.strftime('%Y-%m-%d')
        c.cxsc= file_name
        c.cxscrq = time.strftime('%Y-%m-%d')
        c.gccxs = Photo.replace("'", '"')
        s.add(c)

        d.cxsc = file_name
        d.cxhc = '是'
        d.hcrq = time.strftime('%Y-%m-%d')
        d.cxscrq = time.strftime('%Y-%m-%d')
        s.add(d)

        s.commit()
        return json_result(0, '取数成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()

# 专业工厂结算变更删除
@any_route('/api/saier/suppliers/jsfs/delete', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_jsfs_delete(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        code = 1
        msg = '校验成功'
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username,cyzglsheet.zm=='结算变更删除').first()
        if not d:
            code = -1
            msg = '此记录无权删除'

        return json_result(code, msg)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 专业工厂可更改人员获取用户列表
@any_route('/api/saier/suppliers/child/kggry/get', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_child_kggry_get(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = []
        d = s.query(ywrybiao.yhm).filter(ywrybiao.zt!='离职').all()
        data = [r.yhm for r in d]

        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 专业工厂可更改人员更新
@any_route('/api/saier/suppliers/child/jsfs/change', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_child_jsfs_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        jsbg = 0
        jscz = 0
        jscz_1 = ''
        msg = '校验成功'
        jsfs_n= j.get('jsfs')
        jsfs_1= j.get('jsfs1')
        rid = j.get('rid')
        d = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username,cyzglsheet.zm=='结算方式变更').first()
        if d:
            jsbg = 1

        d = s.query(dxkzsheet.xznr).filter(dxkzsheet.xznr==jsfs_n).first()
        if d:
            jscz = 1
        d = s.query(zycssheet4).filter(zycssheet4.rid==rid).first()
        if d:
            jsfs_1 = d.jsfs

        return json_result(1, msg, {'jsbg':jsbg,'jscz':jscz,'jsfs_1':jsfs_1})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/supplier/task/new', methods=['POST'])
@require_token
async def api_saier_supplier_task_new(request):
    j = await request.json()
    s = Session()
    user = request.current_user
    try:
        title = j.get('title', '')
        content = j.get('content', '')
        user_list = j.get('to_list', [])
        module = j.get('module')
        key_field = j.get('key_field')
        kined = j.get('kind')
        rid = j.get('rid')
        res = user_task_new(module, rid, key_field, title, content, user, s, user_list, True)
        if res.get('code') != 1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))
        title = res.get('title')
        key_no = res.get('key_no')
        res = await insert_script_log(module, key_no, kined, '成功', user, str(title), s=s)
        if res.get('code') != 1:
            s.rollback()
            return json_result(res.get('code'), res.get('msg'))

        s.commit()
        return json_result(res.get('code'), res.get('msg'))
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# 工厂审批流转前事件
# @any_route('/api/saier/suppliers/audit/flow/before', methods=['POST', 'GET'])
# @require_token
# async def view_saier_suppliers__audit_flow_before(request):
#     s = Session()
#     user = request.current_user
#     j = await request.json()
#     try:
#         rid = j.get('rid')
#         module = j.get('module')
#         unit = j.get('unit')
#         o=get_module(module)
#         t=get_model_by_table_name(o.table_name)
#         d = s.query(t).filter(t.rid == rid).first()
#         if not d:
#             return json_result(-1, '未找到对应记录')
#         if unit == '审批处理':
#             if d.rzry == '' or d.rzry == None:
#                 return json_result(-1, '请先填写认证人员')
            
#         return json_result(1, '操作成功')
#     except:
#         logger.error(trace_error())
#         return json_result(-1, trace_error(),'')
#     finally:
#         s.close()


# 专业工厂的诚信经营书下载
@any_route('/api/saier/suppliers/download/file', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_download_file(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        c = s.query(zycs.cs_id,zycs.company_name).filter(zycs.rid == rid).first()
        if not c:
            return json_result(-1, '未选中或未找到对应记录')
        cs_id = c.cs_id
        gcmc = c.company_name
        src = ''
        fn = ''
        d = s.query(cxgc).filter(cxgc.cs_id == cs_id, cxgc.gcmc == gcmc).first()
        if not d:
            return json_result(-1, '未找到诚信工厂记录')
        if d.gccxs == None or d.gccxs == '' or d.gccxs == '[]':
            f = s.query(sys_attachment).filter(sys_attachment.pid == d.rid, sys_attachment.module == '诚信工厂').first()
            if not f:
                return json_result(-1, '未找到工厂诚信书记录')
            fp = os.path.join(config.data_upload_path, f.path)
            fn = os.path.basename(f.name)
            src = f.path
            if not os.path.exists(fp):
                return json_result(-1, '工厂诚信书文件不存在')
        else:
            logger.error(d.gccxs)
            photos = json.loads(d.gccxs)
            fp = os.path.join(config.data_upload_path, photos[0].get('src'))
            fn = photos[0].get('name')
            if not os.path.exists(fp):
                return json_result(-1, '工厂诚信书文件不存在')
            src = photos[0].get('src')
        
        return json_result(1, '操作成功', {'path': src, 'name': fn})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error(),'')
    finally:
        s.close()


@any_route('/api/saier/suppliers/save/check', methods=['POST', 'GET'])
@require_token
async def view_saier_suppliers_save_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cs_id = j.get('cs_id')
        kind = '认证申请'
        module = '工厂审批'
        rzsq = j.get('rzsq')
        sqry = j.get('sqry')
        if rzsq == '' or rzsq == None:
            return json_result(0, '无需审批')
        if sqry == '' or sqry == None or sqry!=user.username:
            return json_result(0, '无需审批')
        res = module_workflow_start_check(module, cs_id, kind, s)
        if res.get('code') == -1:
            return json_result(0, '无需审批')

        return json_result(1, '更新成功')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error(), '')
    finally:
        s.close()