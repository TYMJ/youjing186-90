
from math import e, trunc
import os
from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
from .__default__ import user_task_new, module_xxck_new, get_user_path
import time, re
from datetime import datetime, timedelta

def split_by_comma(numberhz: str):
    # 按中英文逗号分割，去除空白段
    parts = re.split(r'[，,]', numberhz)
    # 去掉每个部分首尾空格，并过滤掉空字符串
    return [p.strip() for p in parts if p.strip()]


@any_route('/api/saier/cash_merge/return', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_return(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        module = j.get('module', '付款合成')
        org = get_user_path(user.username)
        path = org.get('path')
        if '财务' not in path:
            return json_result(-1, '只有财务部门的用户才能提交申请')

        for rid in rids:
            d = s.query(fkhc).filter(fkhc.rid == rid, or_(func.ifnull(fkhc.yhstate,'') == '', fkhc.yhstate == '无', fkhc.yhstate == '已失败')).first()
            if not d:
                continue
            ly = d.ly
            rid_list = split_by_comma(d.numberhz)
            for r in rid_list:
                if ly == '预付货款':
                    s.query(yfhk).filter(yfhk.rid == r).update({yfhk.yhstate: '无', yfhk.modi_uid: user.rid, yfhk.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
                elif ly == '单证费用':
                    s.query(dzfy).filter(dzfy.rid == r).update({dzfy.yhstate: '无', dzfy.modi_uid: user.rid, dzfy.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
                else:
                    s.query(gchk).filter(gchk.rid == r).update({gchk.yhstate: '无', gchk.modi_uid: user.rid, gchk.mtime: time.strftime('%Y-%m-%d %H:%M:%S')})
            s.delete(d)

        s.commit()
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/cash_merge/apply', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_apply(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rids = j.get('rids', [])
        module = j.get('module', '付款合成')
        org = get_user_path(user.username)
        position = org.get('position')
        if '财务' not in position:
            return json_result(-1, '只有财务部门的用户才能提交申请')
        for rid in rids:
            d = s.query(fkhc).filter(fkhc.rid == rid, or_(func.ifnull(fkhc.yhstate,'') == '', fkhc.yhstate == '无')).first()
            if not d:
                continue
            d.yhstate = '待提交'
            d.modi_uid = user.rid
            d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
            s.add(d)
            jsry = d.jsrm
            content = '生产厂家:' + str(d.gcmc) + '的合计付款款项金额:' + str(d.hkje) + '已付,日期:' + time.strftime('%Y-%m-%d')
            title = '生产厂家:' + str(d.gcmc) + '付款通知'
            res = user_task_new(module, rids, 'rid', title, content, user, s, [jsry], True)
            if res.get('code') != 1:
                logger.error(res.get('msg','创建任务失败'))
                return json_result(-1, res.get('msg'))
            row = {
                "xxly": '采购付款(批量)',
                "bjdh": '',
                "wxht": '',
                "cght": '',
                "yhdh": '',
                "xxnr": content,
                "jsr": str(jsry),
                "sys_path": '',
                "spsq": user.username,
            }
            res = module_xxck_new([row], user, s)
            if res.get('code',1) != 1:
                return json_result(-1, res.get('msg'))
        
        s.commit()
        return json_result(1, '操作成功')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/cash_merge/htsh/change', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_htsh_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cs = 0
        d = run_sql(f"select cs from zx where ly='合同收回金额' limit 1")
        if len(d) > 0:
            cs = d[0].get('cs', 0)
    
        return json_result(1, '操作成功', cs)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/cash_merge/fphm/change', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_fphm_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        fphm = j.get('fphm', '')
        cwry = j.get('cwry', '')
        position = ''
        if fphm != None and fphm != '' and cwry != None and cwry == '':
            org = get_user_path(user.username)
            position = org.get('position')
        flag = 0
        data = {}
        org = get_user_path('zjnblh')
        pos = org.get('position')
        if pos != None and pos != '' and pos[:1] != 'C':
            flag = 1
            d = run_sql(f"select khmc,chyrq,sjcy1,ywbm,khjc,zgrq,zgrqj,ysfp,fphm from cymx where (ysfp='{fphm}') limit 1")
        else:
            d = run_sql(f"select khmc,chyrq,khjc,zgrqj from bgmxd where (ysfp='{fphm}') limit 1")
        if len(d) > 0:
            data = d[0]
    
        return json_result(1, '操作成功', {'position': position, 'flag': flag, 'data': data})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


@any_route('/api/saier/cash_merge/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        flag = 0
        org = get_user_path('zjnblh')
        pos = org.get('position')
        if pos != None and pos != '' and pos[:1] != 'D':
            flag = 1
        htsh = ''
        d = run_sql(f"select cs from zx where ly='合同收回金额' limit 1")
        if len(d) > 0:
            htsh = d[0].get('cs', '')
    
        return json_result(1, '操作成功', {'htsh': htsh, 'flag': flag})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

@any_route('/api/saier/cash_merge/factory/new', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_factory_new(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        lines = j.get('lines', [])
        mlje = 0
        d = s.query(cyzglsheet.sz).filter(cyzglsheet.xm == '公司', cyzglsheet.zm == '抹零金额').first()
        if d:
            mlje = float(d.sz)
        htsh = 0
        d = run_sql(f"select cs from zx where ly='合同收回金额' limit 1")
        if len(d) > 0:
            htsh = d[0].get('cs', '')
        gc_json = {}
        cs_json = {}
        ry_json = {}
        fields = ['wxbm1', 'tqfk', 'fkxq', 'szxq', 'cght']
        new_data = {}
        new_rids = []
        bz_json = {}
        for line in lines:
            gczj = float(line.get('gczj', 0))
            gcmc = line.get('gcmc', '')
            gdry = line.get('gdry', '')
            bhb = line.get('bhb', '')
            hthm = line.get('cght', '') 
            if not str(gcmc)+'_'+str(gdry) + '_' + str(bhb) in bz_json and line.get('bz1', '') != None and line.get('bz1', '') != '' and line.get('bz1', '') != '0':
                bz_json[str(gcmc)+'_'+str(gdry)] = []
                if '合同号:' + str(hthm) + '备注:' + line.get('bz1', '') not in bz_json[str(gcmc)+'_'+str(gdry)]:
                    bz_json[str(gcmc)+'_'+str(gdry)].append('合同号:' + str(hthm) + ', 备注:' + line.get('bz1', ''))

            if not str(gcmc)+'_'+str(gdry) + '_' + str(bhb) in new_data:
                if line.get('chsl', 0) * line.get('gcjg', 0) != 0:
                    gczj = round(float(line.get('chsl', 0)) * float(line.get('gcjg', 0)), 2)
                for f in fields:
                    if f == 'tqfk':
                        if line.get(f) != '是':
                            line[f] = ['否']
                        else:                            
                            line[f] = ['是']
                        continue
                    if line.get(f) == None or line.get(f) == '':
                        if f == 'szxq' or f == 'fkxq':
                            line[f] = [' ']
                        else:
                            line[f] = ['无']
                    else:
                        line[f] = [line.get(f)]
                if gdry == None or gdry == '':
                    line['gdry'] = '无'
                line['rid'] = get_uuid()
                line['uid'] = user.rid
                line['ctime'] = time.strftime('%Y-%m-%d %H:%M:%S')
                line['mtime'] = time.strftime('%Y-%m-%d %H:%M:%S')
                line['modi_uid'] = user.rid
                line['gczj'] = gczj
                line['yfhj'] = gczj
                line['zsl'] = line.get('chsl', 0)
                line['xshj'] = line.get('chxs', 0)
                line['ysqhj'] = line.get('ysqje', 0)
                line['yhfy'] = line.get('mjje', 0)
                new_data[str(gcmc)+'_'+str(gdry) + '_' + str(bhb)] = line
                new_rids.append(line['rid'])
            else:
                r = new_data[str(gcmc)+'_'+str(gdry) + '_' + str(bhb)]
                if r.get('chsl', 0) * r.get('gcjg', 0) != 0:
                    gczj = round(float(line.get('chsl', 0)) * float(line.get('gcjg', 0)), 2)
                r['gczj'] = round(float(r.get('gczj', 0)) + gczj, 2)
                r['yhfy'] = round(float(r['yhfy']) + float(line.get('mjje', 0)), 2)
                r['yfhj'] = round(float(r['yfhj']) + gczj, 2)
                r['zsl'] = round(float(r['zsl']) + float(line.get('chsl', 0)), 2)
                r['xshj'] = round(float(r['xshj']) + float(line.get('chxs', 0)), 2)
                r['ysqhj'] = round(float(r['ysqhj']) + float(line.get('ysqje', 0)), 2)
                r['yfje'] = round(float(r['yfje']) + float(line.get('yfje', 0)), 2)
                r['kkje'] = round(float(r['kkje']) + float(line.get('kkje', 0)), 2)
                r['zkfy1'] = round(float(r['zkfy1']) + float(line.get('zkfy1', 0)), 2)
                for f in fields:
                    if f == 'tqfk':
                        if line.get(f) != '是' and line.get(f) not in r.get(f, []):
                            r[f].append('否')
                        elif line.get(f) not in r.get(f, []):
                            r[f].append('是')
                        continue
                    if line.get(f) == None or line.get(f) == '':
                        if f == 'szxq' or f == 'fkxq':
                            if ' ' not in r.get(f, []):
                                r[f].append(' ')
                        else:
                            if '无' not in r.get(f, []):
                                r[f].append('无')
                    else:
                        if line.get(f) not in r.get(f, []):
                            r[f].append(line.get(f))
            for line in new_data.values():
                gcmc = line.get('gcmc', '')
                gdry = line.get('gdry', '')
                gczj = float(line.get('gczj', 0))
                if str(gcmc)+'_'+str(gdry) in bz_json:
                    line['xjbz'] = '\n'.join(bz_json[str(gcmc)+'_'+str(gdry)])
                line['wxbm1'] = ';'.join(line.get('wxbm1', []))
                line['tqfk'] = ';'.join(line.get('tqfk', []))
                line['fkxq'] = '\n'.join(line.get('fkxq', []))
                line['szxq'] = '\n'.join(line.get('szxq', []))
                line['cght'] = ';'.join(line.get('cght', []))
                if gcmc not in gc_json:
                    gc_json[gcmc] = 0
                    c = s.query(bmlgc).filter(bmlgc.gcmc == gcmc).first()
                    if c:
                        gc_json[gcmc] = 1
                if gc_json.get(gcmc, 0) == 0:
                    line['yfhj'] = trunc(float(line.get('yfhj', 0)) / 10) * 10
                # if mlje != 0 and float(line.get('yfhj', 0)) <= mlje:
                #     line['yfhj'] = line['yfhj']
                if gcmc not in cs_json:
                    cs_json[gcmc] = {}
                    c = s.query(zycs.fkhm,zycs.bank1,zycs.zh1).filter(or_(zycs.company_name == gcmc, zycs.cymch == gcmc)).first()
                    if c:
                        cs_json[gcmc] = {
                            'fkhm': c.fkhm,
                            'bank1': c.bank1,
                            'zh1': c.zh1
                        }
                if cs_json.get(gcmc, {}) != {}:
                    line['fkhm'] = cs_json.get(gcmc).get('fkhm', '')
                    line['bank1'] = cs_json.get(gcmc).get('bank1', '')
                    line['zh1'] = cs_json.get(gcmc).get('zh1', '')
                if gdry not in ry_json:
                    ry_json[gdry] = ''
                    c = s.query(ywrybiao.ssdq).filter(ywrybiao.yhm == gdry).first()
                    if c:
                        ry_json[gdry] = c.ssdq
                if ry_json.get(gdry, '') != None and ry_json.get(gdry, '') != '':
                    line['dq'] = ry_json.get(gdry, '')
                if (htsh == 0 or htsh == None) or (gczj < float(htsh) and htsh != None and htsh != 0):
                    line['htsh'] = '不需要'
                else:
                    line['htsh'] = '待收回'

        data = list(new_data.values())
    
        return json_result(1, '操作成功', {'data': data, 'new_rids': new_rids})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


def to_zero(value):
    return value if value is not None and value !='' else 0 

def fpgl_api_new(d, user, s):
    try:
        cydh = ''
        zwpmzz1 = ''
        bggs = ''
        bgdh = ''
        sbz = 1
        xybx = ''
        khmc = ''
        RMBkh = ''
        hbdm1 = ''
        cyrq = ''
        jgtk = ''
        jhfs = ''
        shqx = ''
        dfrq = ''
        mdka = ''
        cdmc = ''
        mygb = ''
        ywry = ''
        ywbm = ''
        zdry = ''
        dlmc = ''
        shrq1 = ''
        xbfl = 0
        wxje = 0
        xbfy = 0
        htje12 = 0
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
        shje = 0
        bgje1 = 0
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
        cbze1 = 0
        sydje = 0
        xbfy1 = 0
        yghsml = 0
        ygmll = 0
        shhjz = 0
        ywhj = 0
        nbhj = 0
        ywxj = 0
        nbxj = 0
        zzdz = ''
        zzxz = ''
        zzbm = ''
        zzsw = ''
        CNFyf = 0
        ywhjr = 0
        ywhjm = 0
        nbhjr = 0
        nbhjm = 0
        xjhj = 0
        xjzk = 0
        xbdrsj = ''
        rmbkh = ''
        khmc = d.get('khmc', '').upper()
        ywxz = ''
        ywdz = d.get('ywbm', '')
        zbsb1 = ''
        zbsb2 = ''
        ywbm = ''
        zbsb = ''
        bh = d.get('fphm', '')
        bh1 = d.get('ywfp', '')
        zbsb = d.get('fphm', '')[:3]
        m = fpgl()
        m.rid = get_uuid()
        m.uid = user.rid
        m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
        if zbsb.upper() != 'AMZ':
            c = s.query(ywbdzb).filter(ywbdzb.ywb == ywdz).first()
            if c:
               ywbm = c.ywb
               ywdz = c.ywdz
               ywxz = c.ywzjc
               zzsw = c.dyywzm
        else:
            c = s.query(cyzglsheet).filter(cyzglsheet.bz == khmc, cyzglsheet.zm == '跨境电商').first()
            if c:
                ywbm = c.qxzl
                ywdz = str(c.qxzl) + str(c.xm)
                ywxz = c.xm

        yhhl = 1
        c = s.query(kpnr.tjhl).filter(kpnr.tjhl > 0).first()
        if c:
            yhhl = c.tjhl if c.tjhl != None else 1

        bglx = ''
        fpbz12 = ''
        c = s.query(cymx.chydh, cymx.bglx, cymx.rid, cymx.fpbz12).filter(cymx.fphm == d.get('ywfp', '')).first()
        if c:
            fpbz12 = c.fpbz12
            cydh = c.chydh
            bglx = c.bglx

        # if m.cydh != '' and m.cydh != None:
            # suffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
            # fphm_list = [str(m.chydh) + suffix for suffix in suffixes]
            # c = s.query(cymx.fphm).filter(cymx.fphm.in_(fphm_list)).order_by(cymx.htje.desc()).first()
            # if c:
            #     if c.fphm.upper() == d.get('fphm', '').upper():
            #         sbz = '1'
            # else:
            #     sbz = '1'

        c = s.query(xbsf).filter(xbsf.fphm == d.get('ywfp', '')).first()
        if c:
            xbfy1 = c.xbfy
            xbdrsj = c.yrrq

        djjer = 0
        djjem = 0
        shhjz = 0
        c = s.query(func.ifnull(func.sum(krshsheet.sydje), 0).label('syhj')).filter(or_(krshsheet.hbdm == 'RMB', krshsheet.hbdm == 'RMB￥'), krshsheet.fphm == d.get('ywfp', '')).first()
        if c:
            djjer = float(c.syhj)
            shhjz = float(c.syhj)
        
        c = s.query(func.ifnull(func.sum(krshsheet.sydje), 0).label('syhj')).filter(krshsheet.hbdm != 'RMB', krshsheet.hbdm != 'RMB￥', krshsheet.fphm == d.get('ywfp', '')).first()
        if c:
            djjem = float(c.syhj)
            shhjz = shhjz + round(float(c.syhj) * yhhl,2)

        pid = ''
        c = s.query(func.ifnull(krshsheet.sydje2, 0).label('syhj'),krshsheet.pid).filter(krshsheet.fphm == d.get('ywfp', '')).all()
        for r in c:
            pid = r.pid
            if r.syhj != None:
                shhjz = shhjz + float(r.syhj)
        if c:
            djjer = float(c.syhj)

        if pid != '':
            c = s.query(krsh.djrq).filter(krsh.rid == pid).first()
            if c:
                shrq1 = c.djrq

        shje = sydje
        cwqrqk = ''
        jgd = 0
        sjf1 = 0
        yzaf = 0
        jgd = 0
        ywfy = 0
        shhjz = shhjz
        djjem = djjem
        if sbz == 1:
            c = s.query(hdfy.zjfy, hdfy.zjhy1, hdfy.cwqrqk, hdfy.sbje).filter(hdfy.fphm==d.get('ywfp', '')).first()
            if c:
                yzaf = c.zjfy
                m.hyf = c.zjhy1
                m.cwqrqk = c.cwqrqk
                m.sjf1 = c.sbje
                a = s.query(func.sum(hdfysheet.sjf).label('sjf1'), func.sum(hdfysheet.ckfy).label('ckfy1'), func.sum(hdfysheet.jcfy).label('jcfy1'), 
                    func.sum(hdfysheet.JGD).label('JGD1')).filter(hdfysheet.pid == c.rid).first()
                if a:
                    m.zgfy1 = a.ckfy1
                    m.ckfy1 = a.jcfy1
                    m.sjf1 = a.sjf1
                    m.jgd1 = a.JGD1
                    jgd = float(a.JGD1)

            if 'BEST PRICE LLC' in khmc:
                yzaf = yzaf - jgd

            c = s.query(func.sum(khspsheet1.pkje).label('FKJE')).filter(khspsheet1.hsfp == d.get('ywfp', ''), khspsheet1.shjg == "通过").first()
            if c:
                m.khpk = c.FKJE

            c = s.query(func.sum(gongcspsheet1.gcpk).label('FKJE')).filter(gongcspsheet1.hsfp == d.get('ywfp', ''), gongcspsheet1.shjg == "通过").first()
            if c:
                m.gcpk = c.FKJE

            c = s.query(func.ifnull(func.sum(fysqsheet.seje), 0).label('FKJE')).filter(
                fysqsheet.wxfp == d.get('ywfp', ''),
                fysqsheet.cwsp == "通过",
                fysqsheet.sfrbmfy == "否",
                or_(fysqsheet.hbdm.like("%USD%"), fysqsheet.hbdm.like("%usd%"))
            ).first()
            if c:
                fyusd = c.FKJE
                ywfy = ywfy + float(c.FKJE) * yhhl
            c = s.query(func.ifnull(func.sum(fysqsheet.seje), 0).label('FKJE')).filter(
                fysqsheet.wxfp == d.get('ywfp', ''),
                fysqsheet.cwsp == "通过",
                fysqsheet.sfrbmfy == "否",
                or_(fysqsheet.hbdm.like("%RMB%"), fysqsheet.hbdm.like("%rmb%"))
            ).first()
            if c:
                fyrmb = c.FKJE
                ywfy = ywfy + float(c.FKJE) * yhhl
        c = s.query(bgmxd.bgbgzje,bgmxd.CNFyf,bgmxd.RMBkh).filter(bgmxd.fphm == d.get('ywfp', '')).first()
        if c:
            bgje = c.bgbgzje
            CNFyf = c.CNFyf
            if c.RMBkh == '是':
                if yhhl != 0:
                    bgje1 = round(bgje / yhhl * 100) / 100
                else :
                    bgje1 = 0
            else :
                bgje1 = bgje
        ysdj = 0
        jjxje = 0
        c = s.query(kaiptz.chrq).filter(
            kaiptz.fphm == d.get('ywfp', ''),
            kaiptz.cpmc == "正常",
            kaiptz.chrq.isnot(None)
        ).first()
        if c:
            cyrq = c.chrq
        ywry123 = ''
        ywbm123 = ''
        c = s.query(cymx).filter(cymx.fphm == d.get('ywfp', '')).first()
        if c:
            b = s.query(cymxsheet).filter(cymxsheet.pid == c.rid, cymxsheet.chxs > 1).order_by(cymxsheet.chxs.desc()).first()
            if b:
                ywry123 = b.ywry
                ywbm123 = b.wxbm1
            jjxje = float(c.jxje1) + float(c.jxje2) + float(c.jxje3) - float(c.jjxje1) - float(c.jjxje2) - float(c.jjxje3)

            ysdj = float(c.ysdj)
            jxKHRMB = float(c.jxKHRMB)
            xybx = c.xybx
            xbfl = float(c.xbfl)
            khmc = c.khmc
            if c.RMBkh == '是':
                hbdm1 = 'RMB'
                htje12 = float(c.htje) - float(c.myjje)
                wxje = float(c.mjzj)
                xbfy = ((htje12 - ysdj) * float(c.xbfl))
                htjer = float(c.htjer) - float(c.myjje)
                htjem = float(c.htjem)
            else :
                hbdm1 = 'USD$'
                htje12 = float(c.htje) - float(c.myjje)
                wxje = float(c.mjzj)
                xbfy = ((htje12 - ysdj) * float(c.xbfl))
                htjer = float(c.htjer)
                htjem = float(c.htjem) - float(c.myjje)

            if cyrq == '' or cyrq == None:
                cyrq = c.zgrqj

            jgtk = c.jgtk
            jhfs = c.jhfs
            shqx = c.shqx
            dfrq = c.dfrq
            yjje = c.yjje
            mdka = c.mdka
            cdmc = c.cdmc
            mygb = c.mygb
            rmbkh = c.RMBkh
            ywry = c.ywry
            zdry = c.zdry
            dlmc = c.dlmc
            ygnlf = float(c.ygnlf)
            jxUSD = float(c.jxUSD)
            kpfyz = float(c.kpfyz)
            jxRMB = float(c.jxRMB)
            qtrmb = float(c.qtrmb)
            ewhj = float(c.ewhj)
            if sbz != 1 :
                xbfy = 0
            b = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1'), cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.cghbdm, func.sum(cymxsheet.gczj).label('gczj1')
                ).filter(cymxsheet.pid == c.rid, cymxsheet.mlsb == "是"
                ).group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.zhwbgpm, cymxsheet.cghbdm).all()
            for r in b:
                if r.zzsl == 0:
                    if r.cgdq == '义乌':
                        if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                            ywhjm = ywhjm + (trunc(r.gczj1 / 10) * 10)
                        else:
                            ywhjr = ywhjr + (trunc(r.gczj1 / 10) * 10)
                            ywhjr = ywhjr + (trunc(r.gczj1 / 10) * 10)
                    else:
                        if 'USD' in r.cghbdm or 'usd' in r.cghbdm or '$' in r.cghbdm:
                            nbhjm = nbhjm + (trunc(r.gczj1 / 10) * 10)
                        else:
                            nbhjr = nbhjr + (trunc(r.gczj1 / 10) * 10)
                            nbhjr = nbhjr + (trunc(r.gczj1 / 10) * 10)

                if r.tsl == 16:
                    tshj16 = tshj16 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 13:
                    tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                    tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 10:
                    tshj10 = tshj10 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 6:
                    tshj6 = tshj6 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 3:
                    tshj3 = tshj3 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 1:
                    tshj1 = tshj1 + (trunc(r.gczjrmb1 / 10) * 10)
                    tshj1 = tshj1 + (trunc(r.gczjrmb1 / 10) * 10)

            b = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1'), cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.cghbdm, func.sum(cymxsheet.gczj).label('gczj1')
                ).filter(cymxsheet.pid == c.rid, cymxsheet.mlsb == "否"
                ).group_by(cymxsheet.gcmc, cymxsheet.tsl, cymxsheet.zzsl, cymxsheet.cgdq, cymxsheet.zhwbgpm, cymxsheet.cghbdm).all()
            for r in b:
                if r.zzsl == 0:
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
                            ywhjr = ywhjr + (trunc(r.gczj1 / 10) * 10)

                if r.tsl == 16:
                    tshj16 = tshj16 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 13:
                    tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                    tshj13 = tshj13 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 10:
                    tshj10 = tshj10 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 6:
                    tshj6 = tshj6 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 3:
                    tshj3 = tshj3 + (trunc(r.gczjrmb1 / 10) * 10)
                if r.tsl == 1:
                    tshj1 = tshj1 + (trunc(r.gczjrmb1 / 10) * 10)
                cghjzje = cghjzje + (trunc(r.gczjrmb1 / 10) * 10)

            b = s.query(func.sum(cymxsheet.gczjrmb).label('gczjrmb1')).filter(
                cymxsheet.pid == c.rid,
                cymxsheet.zzsl > 1,
                cymxsheet.tsl == 0
            ).first()
            if b:
                tshj0 = b.gczjrmb1 if b.gczjrmb1 != None else 0
            else:
                tshj0 = 0

            ywxj = ywhjr + ywhjm * yhhl
            nbxj = nbhjr + nbhjm * yhhl
            xjhj = ywxj + nbxj
            cghjzje = to_zero(tshj0) + to_zero(tshj16)  + to_zero(tshj13) + to_zero(tshj10) + to_zero(tshj6) + to_zero(tshj3) + to_zero(tshj1) + to_zero(ywxj) + to_zero(nbxj)
            cbzje = cghjzje + yzaf + float(c.qtrmb)
            cbze1 = cghjzje + ygnlf + float(c.qtrmb)
            ts16 = round((tshj16 / 1.16 * 0.16) * 100) / 100
            if ts16 > 0 :
                ts13 = round((tshj13 / 1.16 * 0.13) * 100) / 100
                ts10 = round((tshj10 / 1.16 * 0.10) * 100) / 100
                ts6 = round((tshj6 / 1.16 * 0.06) * 100) / 100
            else :
                ts13 = round((tshj13 / 1.13 * 0.13) * 100) / 100
                ts10 = round((tshj10 / 1.13 * 0.10) * 100) / 100
                ts6 = round((tshj6 / 1.13 * 0.06) * 100) / 100
            ts3 = round((tshj3 / 1.03 * 0.03) * 100) / 100
            ts1 = round((tshj1 / 1.01 * 0.01) * 100) / 100
            jklx = 0
            tszje = ts13 + ts10 + ts6 + ts3 + ts16 + ts1
            ayjje = float(c.ayjje)
            myjje = float(c.myjje)
            if c.RMBkh == '是':
                hsml = round((shhjz - hyf * yhhl - xbfy1 - cbzje + tszje - ayjje - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                yghsml = round((htje12 - hyf * yhhl - xbfy - cbzje + tszje - ayjje - jklx - kpfyz - ywfy + float(xjzk)) * 100) / 100
                if htje12 != 0:
                    mll = 100 * (hsml / htje12)
                    ygmll = 100 * (yghsml / htje12)
            else:
                if (htje12 != 0) and (yhhl != 0):
                    hsml = round((shhjz - (ayjje + hyf) * yhhl - cbzje - xbfy1 - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                    yghsml = round(((htje12 - ayjje - hyf - xbfy) * yhhl - cbzje - ywfy + tszje - jklx - kpfyz + float(xjzk)) * 100) / 100
                    mll = 100 * (hsml / (htje12 * yhhl))
                    ygmll = 100 * (yghsml / (htje12 * yhhl))

        if ('UV' in bh1) or ('uv' in bh1) or ('VC' in bh1) or ('vc' in bh1):
            m.webpdcy = ''
            m.webpdsh = ''
            m.webpdfk = ''
            m.webpdfy = ''
            m.webpdbg = ''
            m.hdfyxq = cwqrqk
            m.bglx = bglx
            m.fpbz = fpbz12
            m.CNFyf = CNFyf
            m.JGD = jgd
            m.sjf1 = sjf1
        if bglx == '内销':
            m.sfnm = '是'
        else:
            m.sfnm = '否'
        m.shsd = '否'
        m.tssd = '否'
        m.fpsq = '否'
        m.cysd = '否'
        m.cygg = '否'
        m.jjxje = jjxje
        m.fphm = bh
        m.wxfp = bh1
        m.hsfp = bh
        m.wxfp1 = bh
        m.xybx = xybx
        m.ysdj = ysdj
        m.qesh = '否'
        m.hkjq = '否'
        m.djjem = djjem
        m.djjer = djjer
        m.khmc = khmc
        m.RMBkh = rmbkh
        m.xjzk = float(xjzk)
        m.hbdm = hbdm1
        m.cyrq = cyrq
        m.jgtk = jgtk
        m.jhfs = jhfs
        m.shqx = shqx
        m.dfrq = dfrq
        m.mdka = mdka
        m.cdmc = cdmc
        m.mygb = mygb
        m.ywry = ywry123
        m.ywbm = ywbm123
        m.zdry = zdry
        m.dlmc = dlmc
        m.shrq1 = shrq1 if shrq1 != '' else None
        m.xbfl = xbfl
        m.wxje = wxje
        if rmbkh == '是':
            m.ygxbfy = round(xbfy * 100) / 100
        else:
            m.ygxbfy = round(xbfy * 100) / 100
        m.xbfy = xbfy1
        m.htje = htje12
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
        m.ayjje = ayjje
        m.myjje = myjje
        m.bgje = bgje
        m.shje = shje
        m.yhhl = yhhl
        m.wxce = round((htje12 - shje) * 100) / 100
        m.ywfy = ywfy
        m.qtfy = 0
        m.qtfysm = ''
        m.sfjd = '否'
        m.khpk = khpk
        m.gcpk = gcpk
        m.jxKHRMB = jxKHRMB
        m.fyUSD = fyUSD
        m.fyRMB = fyRMB
        if yhhl != 0:
            # m.shz$ = round((djjem + djjer / yhhl) * 100) / 100
            if rmbkh == '是':
                m.htjez1 = round(htje12 / yhhl * 100) / 100
            else:
                m.htjez1 = htje12
        m.bgje1 = bgje1
        m.bggs = bggs
        m.bgdh = bgdh
        m.zwpmz = zwpmzz1
        m.zfph = cydh
        m.zshsq = None
        m.yjhsq = None
        m.hxddf1 = '否'
        m.ywhj = ywxj
        m.nbhj = nbxj
        m.ywxj = ywxj
        m.nbxj = nbxj
        m.ywdz = ywdz
        m.ywxz = ywxz
        m.ywhjr = ywhjr
        m.nbhjr = nbhjr
        m.ywhjm = ywhjm
        m.nbhjm = nbhjm
        m.xbdrsj = xbdrsj if xbdrsj != '' else None
        m.xjhj = ywxj + nbxj
        m.fxhj = ywxj + nbxj
        s.add(m)

        return {'code': 1,'msg': '生成发票管理成功'}
    except:
       logger.error(trace_error())
       return {'code': -1,'msg': trace_error()}
  

def gchk_api_new(l, p, t, gsmc, uv, fkdq, yjgs, sz1, jsts, cxje, user, s):
    try:
        k = 0
        zsl11 = 0
        kkje11 = 0
        ii = 0
        gcfp = ''
        fpje = 0
        tmpstrh = []
        for r in p:
            htrq = None
            pid = '' 
            zsl11 = r.get('zsl', 0)
            kkje11 = r.get('kkje', 0)
            sh = r.get('gcmc', '')
            fkbz = r.get('cghbdm', '')
            yfjez = r.get('yfje', 0)
            if fkbz == '' or fkbz == None:
                fkbz = 'RMB'
            khmc = ''
            ywry = ''
            # xjbz = r.get('xjbz', '')
            yt = '货款' 
            pk = 0 
            fpwk = '是' 
            d = user.username 
            if fkdq == '' or fkdq == None:
                fkdq = '义乌' 
            hkje = 0
            hkrq = None
            # if hkrq == '' or hkrq == None:
            fksb = '否' 
            # else:
            #     fksb = '是' 
            wxfp = t.get('fphm')
            hthm = r.get('cght', '') 
            htje = r.get('gczj', 0) 
            yfhj = r.get('yfhj', 0) 
            xshj = r.get('xshj', 0) 
            yhfy = r.get('yhfy', 0) 
            kkhj1 = r.get('kkje', 0) 
            if uv == 1:
                chrq = t.get('chyrq') 
                chrq1 = t.get('chyrq') 
                jsrm = r.get('ywrya') 
                ywbm = r.get('ywbm') 
            else:
                chrq = t.get('chyrq') 
                chrq1 = t.get('chyrq') 
                jsrm = r.get('ywrya') 
                ywbm = t.get('ywbm') 
            gcmc1 = r.get('gcmc') 
            rxfs = r.get('gcdh') 
            kh = t.get('khmc') 
            gcdh = r.get('gcdh') 
            dlrq = time.strftime('%Y-%m-%d') 

            if t.get('wyzd') != '' and t.get('wyzd') != None:
                fpyz = gcmc1 + t.get('wyzd') + jsrm + r.get('bhb') 
            else:
                fpyz = gcmc1 + wxfp + jsrm + r.get('bhb') 

            tqfk = r.get('tqfk') 
            htsh = r.get('htsh') 
            if tqfk == '' or tqfk == None:
                tqfk = '否' 
            sfdl = '否' 
            ii = ii + 1 
            scqy = '' 
            fkxq = r.get('付款详情') 
            szxq = r.get('收支详情') 
            zkfy1 = r.get('折扣费用') 
            sb = str(ii) + gcmc1 + wxfp + str(time.strftime('%Y-%m-%d %H:%M:%S'))
            bank = r.get('bank1') 
            zh = r.get('zh1')
            gcmc = ''
            province = ''
            city = ''
            yhdm1 = ''
            yhdz1 = ''
            wyjgh1 = ''
            lhh1 = ''
            jgh1 = '' 
            sjyh1 = ''
            sjlhh1 = ''
            sjhjgh1 = ''
            if sh != '' and sh != None:
                c = s.query(newcwcs.shui,newcwcs.company_name,newcwcs.bank,newcwcs.zh,newcwcs.province,newcwcs.city,newcwcs.hzdj).filter(newcwcs.company_name == sh).first()
                if c:
                    gcmc = c.shui
                    if bank == '' or bank == None:
                        bank = c.bank
                    if zh == '' or zh == None :
                        zh = c.zh
                    province = c.province
                    city = c.city
                    if '黑名单' in c.hzdj:
                        hmd = hmd + 1
                        tmpstrh.append('请注意工厂发票: ' + gcfp + '工厂名称:' + gcmc + str(c.hzdj) + '！！')
                        scqy = c.hzdj
                    if bank != '' and bank != None:
                        b = s.query(yhbm.yhdm, yhbm.yhdz, yhbm.wyjgh, yhbm.lhh, yhbm.jgh, yhbm.sjyh, yhbm.sjlhh, yhbm.sjhjgh, yhbm.yhmc).filter(yhbm.yhmc == bank).first()
                        if b:
                            yhdm1 = b.yhdm
                            yhdz1 = b.yhdz
                            wyjgh1 = b.wyjgh
                            lhh1 = b.lhh
                            jgh1 = b.jgh
                            sjyh1 = b.sjyh
                            sjlhh1 = b.sjlhh
                            sjhjgh1 = b.sjhjgh

            c = s.query(gchk.rid).filter(gchk.gcmc1==gcmc1, gchk.wxfp==wxfp, gchk.fkdq==fkdq, gchk.fpyz.like('%\\%')).first()
            if (not c or fpyz == '' or fpyz == None) :
                pk = 0 
                if hthm != '' and hthm != None:
                    b = s.query(cght).filter(cght.hthm == hthm).first()
                    if b:
                        if jsrm == '' or jsrm == None:
                            if (yjgs == 1 and c.gdry != '' and c.gdry != None):
                                jsrm = c.gdry
                            else:
                                jsrm = c.cgry
                        if gcmc1 == '' or gcmc1 == None:
                            if c.sccj != '' and c.sccj != None:
                                gcmc1 = c.sccj
                            else:
                                gcmc1 = c.sccj1
                        if wxfp == '' or wxfp == None:
                            wxfp = c.wxht
                        if province == '' or province == None:
                            province = c.province1 
                        if city == '' or city == None:
                            city = c.city1 
                        if fkdq == '' or fkdq == None:
                            fkdq = c.szdq 
                        if c.wxbm != '':
                            ywbm = c.wxbm 
                        khmc = c.khmc
                        ywry = c.ywry  
            gcmc2 = gcmc1 
            c = s.query(newcwcs.hzdj).filter(newcwcs.company_name == gcmc2).first()
            if c:
                if '黑名单' in c.hzdj:
                    hmd = hmd + 1
                    tmpstrh.append('请注意工厂发票: ' + gcfp + '工厂名称:' + gcmc2 + str(c.hzdj) + '！！')
                    scqy = c.hzdj

            k = k + 1 
            jsrybm = '' 
            c = s.query(ywrybiao.bm).filter(ywrybiao.yhm == jsrm).first()
            if c:
                jsrybm = c.bm
            zsrq = '' 
            if chrq!= '' and chrq != None:
                i1 = 0 
                base_date = datetime.strptime(chrq, '%Y-%m-%d %H:%M:%S') 
                new_date = base_date + timedelta(days=int(jsts))
                sz = new_date.weekday()
                for i2 in range(1, 8):
                    if sz != sz1:
                        new_date2 = base_date + timedelta(days=int(jsts) + i2)
                        sz = new_date2.isoweekday()  # 或 weekday() 根据逻辑
                        i1 += 1

                final_date = base_date + timedelta(days=int(jsts) + i1)
                zsrq = final_date.strftime('%Y-%m-%d %H:%M:%S')  # 格式请调整
             
            m = gchk()
            m.rid = get_uuid()
            m.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            m.uid = user.rid
            m.yjfk = zsrq 
            m.jsrybm = jsrybm 
            m.fpbh = '' 
            m.yfje1 = yfjez 
            m.ysqhj = r.get('已审请合计') 
            m.cght = hthm 
            m.chrq = chrq 
            m.fkbz = fkbz 
            m.hkje = float(hkje) 
            m.htje = float(htje) 
            m.hkrq = hkrq 
            m.fpje = 0 # float(fpje) 
            m.bhsj = 0 # float(bhsj) 
            m.zzsl = 0# int(zzsl) 
            m.se = 0 # float(se) 
            m.tsl = 0 # int(tsl) 
            m.tse = 0 # round((float(fpje) / (1 + int(zzsl) / 100) * int(tsl) / 100) * 100) / 100 
            m.jsrm = jsrm 
            m.sh = gcmc 
            if r.get('fkhm') == '' or r.get('fkhm') is None:
                m.gcmc = sh 
            else:
                m.gcmc = sh 
            m.bank = bank 
            m.zh = zh 
            m.province = province 
            m.city = city 
            m.yt = yt 
            m.bzsm = r.get('xjbz')[:250] if r.get('xjbz') else ''
            m.fpyz = fpyz 
            m.wxfp = wxfp 
            m.ysfp = t.get('ywfp') 
            m.yfph = wxfp 
            m.fpwk = fpwk 
            m.fkdq = fkdq 
            m.sb = sb 
            m.kh = kh 
            m.gcdh = gcdh 
            m.gcmc1 = gcmc1 
            m.rxfs = rxfs 
            m.dlrq = dlrq 
            m.xjxh = str(k) 
            m.sfjq = '否' 
            m.kkhj1 = kkhj1 
            m.yhdm = yhdm1 
            m.yhdz = yhdz1 
            m.wyjgh = wyjgh1 
            m.lhh = lhh1 
            m.jgh = jgh1 
            m.sjyh = sjyh1 
            m.sjlhh = sjlhh1 
            m.sjhjgh = sjhjgh1 
            m.fksb = fksb 
            m.dkje = 0 
            m.sqrq = None # sqrq 
            m.ywbm = ywbm 
            m.sqje = 0 # float(sqje) 
            m.tqfk = tqfk 
            m.zsfkrq = None # zsfkrq 
            m.sfdl = sfdl 
            m.fkhb = '否' 
            m.pk = pk 
            m.zsl = zsl11 
            m.kkje = kkje11 
            m.customer = khmc 
            m.ywry = ywry 
            m.scqy = scqy 
            m.fjq = '否' 
            m.cxnf = '2017' 
            m.cxbg = '' # cxbg 
            m.xjbz = '' 
            m.yfhj = yfhj 
            m.yhfy = yhfy 
            m.xshj = xshj 
            m.sjzf = trunc((yfhj - kkhj1) / 10) * 10 
            m.htsh = htsh 
            m.fkxq = fkxq 
            m.szxq = szxq 
            m.zkfy1 = to_zero(zkfy1)
            m.ywdq = r.get('业务地区') 
            m.wstt = '' 
            pid = m.rid
            izz = 0
            yfjezz = 0
            y = [a for a in l if a.get('gcmc') == r.get('gcmc')]
            for x in y:
                sh = x.get('gcmc') 
                kkhj = x.get('kkje') 
                hthm = x.get('cght') 
                htje = x.get('gczj') 
                if uv == 1:
                    jsrm = x.get('gdry') 
                else:
                    jsrm = x.get('cgry') 
                if uv == 2:
                    if x.get('khhh') != '':
                        cphh = x.get('khhh') 
                    else:
                        cphh = ''  
                else:
                    cphh = x.get('cpbh') 
                bz = x.get('bz1') 
                zwpm = x.get('zwpm') 
                dj = x.get('gcjg') 
                dw = x.get('jldw') 
                bz1 = x.get('wxrl') 
                xs = x.get('chxs') 
                zsl = x.get('chsl') 
                gcmc1 = x.get('gcmc') 
                rxfs = x.get('gcdh') 
                gcdh = x.get('gcdh') 
                jsfs = x.get('jsfs') 
                tqfk = x.get('tqfk') 
                if tqfk == '' or tqfk is None: 
                    tqfk = '否' 

                izz = izz + 1 
                g = gchksheet()
                g.rid = get_uuid()
                g.pid = pid
                g.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                g.uid = user.rid
                g.zzsl = 0 
                g.tsl = 0 
                g.cphh = cphh 
                g.yjfk = zsrq 
                g.bh = '' 
                g.fkbz = fkbz 
                g.fphm = t.get('ywfp') 
                g.ysfp = t.get('fphm')  
                g.bz = bz 
                g.zwpm = zwpm 
                g.dj = float(dj) 
                g.dw = dw 
                g.bz1 = bz1 
                g.xs = float(xs) 
                g.zsl = zsl 
                g.Yfje = float(zsl) * float(dj) 
                g.hkrq = None
                g.gcmc = gcmc1 
                g.rxfs = rxfs 
                g.cght = hthm 
                g.ywrya = jsrm 
                g.tqfk = tqfk 
                g.jsfs = jsfs 
                g.kkje = kkhj 
                g.yfph = t.get('ywfp')  
                g.ysfp1 = t.get('fphm')  
                g.fkxq = x.get('fkxq') 
                g.szxq = x.get('szxq') 
                g.zkfy1 = x.get('zkfy1') 
                g.yfje1 = x.get('yfje') 
                g.yfkp = x.get('yfkp') 
                g.cywyzd = x.get('cywyzd') 
                g.fktt = x.get('fktt') 
                g.htrq = x.get('htrq')
                htrq = x.get('htrq') 
                g.ysqje = x.get('ysqje') 
                g.sjcy = x.get('sjcy') 
                g.cgry = x.get('ywrya') 
                g.gdry = x.get('gdry') 
                g.ywry = x.get('ywry') 
                g.ywbm = x.get('wxbm1')
                if yfhj>0:
                    g.fpwk = '是' 
                    if izz == len(y):
                        g.fkje = yfhj - yfjezz 
                    else:
                        g.fkje = trunc((g.Yfje / yfhj) * yfhj) 
                        yfjezz = yfjezz + trunc((g.Yfje / yfhj) * yfhj) 

                s.add(g)

            if 'YWB' in gcmc2 or '义乌办' in gcmc2 or gcmc2 == '' or 'WM' in gcmc2:
                cxbg = '不需要' 
            else:
                cxbg = '不需要' 
                if cxje > 0 and float(fpje) > cxje or float(htje) > cxje:
                    b = s.query(cxgc).filter(cxgc.gcmc == gcmc2).first()
                    if not b:
                        cxbg = '待提供' 
                        g = cxgc()
                        g.rid = get_uuid()
                        g.uid = user.rid
                        g.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
                        g.gcmc = gcmc2 
                        g.wxfp = wxfp 
                        g.ywry = jsrm 
                        g.ywz = ywbm 
                        g.yrrq = time.strftime('%Y-%m-%d')
                        g.sfsh = '否' 
                        g.yrgs = gsmc 
                        g.qrrq = '' 
                        g.chgc = gcmc2 
                        g.fkry = '' 
                        g.xgry = '' 
                        s.add(g)
                    else:
                        if b.qrrq == '' or b.qrrq == None:
                            qrrq = '1999-01-01' 
                        else:
                            qrrq = b.qrrq
                        if qrrq != '' and qrrq != None:
                            if time.strftime('%Y') == qrrq[:4]:
                                cxbg = '已提供'
                            else:
                                cxbg = '待提供'
                            cxbg = '待提供' 
                    cxje1 = cxje1 + 1
                    if cxbg == '待提供':
                        tmpstrh.Add('工厂名称:' + gcmc2 + '需提交诚信报告') 
                  
            m.htrq = htrq
            m.cxbg = cxbg
            s.add(m)

        return {'code': 1, 'msg': '操作成功', 'data': tmpstrh}
    except: 
        logger.error(trace_error())
        return {'code': -1, 'msg': trace_error()}

def cxgc_api_new():
    pass

@any_route('/api/saier/cash_merge/payment/new', methods=['POST', 'GET'])
@require_token
async def view_saier_cash_merge_payment_new(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = []
        rid = j.get('rid', '')
        fkdq = j.get('area', '')
        d = s.query(xjhc).filter(xjhc.rid == rid).first()
        if not d:
            return json_result(-1, '记录不存在')
        l = s.query(xjhcsheet).filter(xjhcsheet.pid == rid).all()
        p = s.query(xjhcsheet1).filter(xjhcsheet1.pid == rid).all()

        fphm = d.fphm
        ywfp = d.ywfp
        d = alchemy_object_to_dict(d)
        l = alchemy_object_list_to_dict(l)
        p = alchemy_object_list_to_dict(p)

        if fphm != None and fphm != '':
            s.query(cymx).filter(cymx.fphm == fphm).update({cymx.sfbg: '是', xjhc.modi_uid: user.rid, xjhc.mtime: time.strftime('%Y-%m-%d %H:%M:%S')}, synchronize_session=False)
            f = s.query(fpgl).filter(or_(fpgl.fphm == fphm, fpgl.hsfp == ywfp)).first()
            if not f:
                res = fpgl_api_new(d, user, s)
                if res.get('code', 1) != 1:
                    logger.error(res.get('msg', '创建发票记录失败'))
                    return json_result(-1, res.get('msg'))
        
        c = s.query(zx.cs).filter(zx.ly == '诚信金额').first()
        cxje = 0
        gsmc = ''
        # path = ''
        if c:
            cxje = c.cs
        c = s.query(ywrybiao.wfgs).filter(ywrybiao.yhm == 'zjnblh').first()
        if c:
            gsmc = c.wfgs
        org1 = get_user_path(user.username)
        path = org1.get('path', '')
        # t = time.strftime('%Y-%m-%d %H:%M:%S')
        # t1 = t[2:4] + t[5:7] + t[8:10] + t[11:13] + t[14:16] + t[17:19]
        # i = 0
        # a = 0
        # b = 0
        # d = 0
        yjgs = 0
        if '优景' in path:
            yjgs = 1
        #     c = s.query(cwjxrq).filter(cwjxrq.szgs.like('%优景%')).first()
        #     if c:
        #         a = c.kpjxts
        #         b = c.xjjxts
        # if '优胜' in path:
        #     c = s.query(cwjxrq).filter(cwjxrq.szgs.like('%优胜%')).first()
        #     if c:
        #         a = c.kpjxts
        #         b = c.xjjxts

        sz1 = 0 
        jsts = 0
        c = s.query(zx.cs, zx.sz1).filter(zx.ly == '财务付款结算期').first()
        if c:
            jsts = c.cs
            sz1 = c.sz1
    
        org = get_user_path('zjnblh')
        pos = org.get('position')
        uv = 1
        if pos != None and pos != '' and pos[:1] != 'D':
            uv = 2
        
        res = gchk_api_new(l, p, d, gsmc, uv, fkdq, yjgs, sz1, jsts, cxje, user, s)
        if res.get('code', 1) != 1:
            logger.error(res.get('msg', '创建付款记录失败'))
            return json_result(-1, res.get('msg'))
        data = res.get('data', [])
        # if len(data) > 0:
            
        s.commit()
        return json_result(1, '操作成功', data)
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()