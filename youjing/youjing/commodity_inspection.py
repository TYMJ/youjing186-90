from any import *
from .model import *
from sqlalchemy.sql import func, not_, or_, and_
import time
from datetime import datetime


@any_route('/api/saier/commodity_inspection/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_commodity_inspection_save_before(request):
    j = await request.json()
    try:
        main = j.get('main', {}) or {}
        merge_items = j.get('merge_items', []) or []

        s = lambda v, d='': d if v is None else str(v)
        def f(v, d=0.0):
            try:
                if v in [None, '']:
                    return float(d)
                return float(v)
            except:
                return float(d)

        def i(v, d=0):
            try:
                if v in [None, '']:
                    return int(d)
                return int(float(v))
            except:
                return int(d)

        r3 = lambda v: round(f(v) * 1000) / 1000
        esc = lambda v: s(v).replace("'", "''")

        rid = s(main.get('rid', ''))
        rmbkh = s(main.get('rmbkh', ''))
        ssgs = s(main.get('ssgs', ''))
        hbdm = s(main.get('hbdm', ''))
        bggs = s(main.get('bggs', ''))
        khmc = s(main.get('khmc', ''))
        sbrq = s(main.get('htrq', ''))  # 前端已赋值：申报日期=合同日期

        is_rmb = (rmbkh == '是')
        if is_rmb and ('RMB' not in ssgs):
            ssgs = ssgs + 'RMB'

        rule_cache = {}

        def get_rule(_ssgs, zzsl, tsl, _hbdm, _is_rmb):
            key = (_ssgs, i(zzsl), i(tsl), _hbdm, _is_rmb)
            if key in rule_cache:
                return rule_cache[key]

            zzsl = i(zzsl)
            tsl = i(tsl)

            if _is_rmb:
                rs = run_sql(
                    f"select zzsbz,tsbz,sb from bgdjjs "
                    f"where ssgs like '%{esc(_ssgs)}%' and zzsl={zzsl} and tsl={tsl} limit 1"
                )
                if len(rs) == 0:
                    rs = run_sql(
                        f"select zzsbz,tsbz,sb from bgdjjs "
                        f"where ssgs like '%优景RMB%' and zzsl={zzsl} and tsl={tsl} limit 1"
                    )
            else:
                if s(_hbdm).upper() in ['USD', 'USD$']:
                    rs = run_sql(
                        f"select zzsbz,tsbz,sb from bgdjjs "
                        f"where ssgs='{esc(_ssgs)}' and zzsl={zzsl} and tsl={tsl} limit 1"
                    )
                else:
                    # rs = run_sql(
                    #     f"select zzsbz,tsbz,sb from bgdjjssheet "
                    #     f"where ssgs='{esc(_ssgs)}' and hbdm='{esc(_hbdm)}' and zzsl={zzsl} and tsl={tsl} limit 1"
                    # )
                    
                    rs = run_sql(
                        f"select zzsbz,tsbz,sb from bgdjjs "
                        f"where ssgs='{esc(_ssgs)}' and zzsl={zzsl} and tsl={tsl} limit 1"
                    )

            if len(rs) == 0:
                rule_cache[key] = (0.0, 0.0, '')
            else:
                row = rs[0]
                rule_cache[key] = (f(row.get('zzsbz', 0)), f(row.get('tsbz', 0)), s(row.get('sb', '')))
            return rule_cache[key]

        def calc_price(cgdj, factor, sb):
            if factor <= 0:
                return 0.0
            if sb in ['', '除']:
                return cgdj / factor
            if sb == '乘':
                return cgdj * factor
            return cgdj / factor

        out_merge = []
        for row in merge_items:
            r = dict(row)

            bgdj = f(r.get('bgdj', 0))
            if bgdj < 0.0000001:
                zzsl = i(r.get('zzsl', 0))
                tsl = i(r.get('tsl', 0))
                cgdj = f(r.get('cgdj', 0))
                wxdj = f(r.get('wxdj', 0))
                djsd = s(r.get('djsd', ''))

                bz, bz1, sb = get_rule(ssgs, zzsl, tsl, hbdm, is_rmb)
                new_price = 0.0

                if bz > 0 and bz1 <= 0:
                    new_price = calc_price(cgdj, bz, sb)
                    if (not is_rmb) and abs(bz - 1.0) < 0.000001:
                        new_price = wxdj
                elif bz1 > 0:
                    new_price = calc_price(cgdj, bz1, sb)
                    if (not is_rmb) and abs(bz1 - 1.0) < 0.000001:
                        new_price = wxdj

                if djsd != '是' and new_price > 0:
                    r['bgdj'] = r3(new_price)
                    r['ybgdj'] = r3(new_price)

            if s(r.get('zwpm1', '')) == '':
                r['zwpm1'] = s(r.get('zwpm', ''))

            r['rmbkh'] = rmbkh
            r['bggs'] = bggs
            r['sbrq'] = sbrq

            hgjldw = s(r.get('hgjldw', ''))
            r['bgl'] = r.get('zjz', 0) if hgjldw in ['KGS', '千克'] else r.get('chsl', 0)

            out_merge.append(r)

        # 重建报关单（短字段）
        declaration_items = []
        for r in out_merge:
            zjz = f(r.get('zjz', 0))
            if 'BEST PRICE' in khmc.upper():
                zjz = round(zjz * 10) / 10
            else:
                zjz = round(zjz * 100) / 100

            bgzj = f(r.get('bgzj', 0))
            wxzj1 = f(r.get('wxzj1', 0))
            khrmbzj = bgzj  # Pascal 实际两分支都赋值为报关总价

            declaration_items.append({
                'rid': s(r.get('rid', '')),
                'pid': rid,
                'hgbm': s(r.get('hgbm', '')),
                'zwpm': s(r.get('zwpm', '')),
                'ywpm': s(r.get('ywpm', '')),
                'chsl': f(r.get('chsl', 0)),
                'jldw': s(r.get('jldw', '')),
                'bgzj1': r3(wxzj1),
                'bgzj': bgzj,
                'sbys': s(r.get('sbys', '')),
                'hyd': s(r.get('hyd', '')),
                'zjz': zjz,
                'hgjldw': s(r.get('hgjldw', '')),
                'khrmbzj': khrmbzj,
                'khrmbzj1': r3(khrmbzj)
            })

        # 保留 Pascal 尾部空白行
        declaration_items.append({
            'rid': '',
            'pid': rid,
            'hgbm': '',
            'zwpm': '',
            'ywpm': '',
            'chsl': 0,
            'jldw': '',
            'bgzj': 0,
            'bgzj1': 0,
            'zjz': 0,
            'khrmbzj': 0,
            'khrmbzj1': 0,
            'hgjldw': '',
            'sbys': '',
            'hyd': ''
        })
        
        d = run_sql(f"select rid from sjqdhbcp where sjqdhbcp.pid = '{esc(rid)}'")
        # 取数据库已有 rid 集合
        db_rid_set = set()
        for x in d:
            xr = s(x.get('rid', ''))
            if xr != '':
                db_rid_set.add(xr)

        # 标记 out_merge：不存在于数据库则 new_flag=1，否则 0
        for r in out_merge:
            rr = s(r.get('rid', ''))
            if rr == '' or rr not in db_rid_set:
                r['new_flag'] = 1
            else:
                r['new_flag'] = 0
                
        d = run_sql(f"select rid from sjqdsheet2 where sjqdsheet2.pid = '{esc(rid)}'")
        # 取数据库已有 rid 集合
        db_rid_set = set()
        for x in d:
            xr = s(x.get('rid', ''))
            if xr != '':
                db_rid_set.add(xr)
        
        for r in declaration_items:
            rr = s(r.get('rid', ''))
            if rr == '' or rr not in db_rid_set:
                r['new_flag'] = 1
            else:
                r['new_flag'] = 0
            
        return json_result(1, 'ok', {
            'merge_items': out_merge,
            'declaration_items': declaration_items
        })
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
