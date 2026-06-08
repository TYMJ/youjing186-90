
from any import *
from .model import *
from .__default__ import get_user_path, module_share_new, module_xxck_new, user_task_delete, user_task_new
import openpyxl
from openpyxl.styles import numbers
from sqlalchemy import create_engine, Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime


"""
财务付款核对.电商预填费用.预填金额
对应原Pascal: 电商预填费用.预填金额.change
"""
@any_route('/api/saier/shop_cost/ytje/change', methods=['POST'])
@require_token
async def view_shop_cost_ytje_change(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        j = await request.json()
        gcmc = j.get('gcmc', '')
        ytje = j.get('ytje', 0)
        gc50 = '0'
        mlsb = '否'
        mlje = 0
        flag = 1
        c = s.query(bmlgc).filter(bmlgc.gcmc == gcmc).first()
        if c:
            gc50 = '1'
            mlsb = '否'
        else:
            mlsb = '是'
        c = s.query(cyzglsheet.sz).filter(cyzglsheet.xm == '公司', cyzglsheet.zm == '抹零金额').first()
        if c:            
            mlje = float(c.sz) if c.sz else 0
        if ytje <= mlje :
            gc50 = '1'
            mlsb = '否'
        c = s.query(cyzglsheet.sz).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '财务预填费用').first()
        if not c:   
            if ytje > 0 and mlsb == '是':
                if ytje > 10:
                    ytje = math.trunc(ytje/10)*10
                    flag = 0

        return json_result(1, msg, data={
            'gc50': gc50,
            'mlsb': mlsb,
            'ytje': ytje,
            'flag': flag
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()


"""
电商预填费用.采购合同.采购合同.change
对应原Pascal: 电商预填费用.采购合同.采购合同.change
"""
@any_route('/api/saier/shop_cost/cght/change', methods=['POST'])
@require_token
async def view_shop_cost_cght_change(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        j = await request.json()
        hthm = j.get('hthm', '')
        fphm = j.get('fphm', '')
        fktt = ''
        htje = 0
        chje = 0
        c = s.query(dsytfysheet.fktt, dsytfysheet.pid).filter(dsytfysheet.cght == hthm, dsytfysheet.cght != '', dsytfysheet.cght != None).first()
        if c:
            fktt = c.fktt
        c = s.query(fkspsheet3.fktt).filter(fkspsheet3.hthm == hthm, fkspsheet3.hthm != '', fkspsheet3.hthm != None).first()
        if c:
            fktt = c.fktt
        c = s.query(cght.htje).filter(cght.hthm == hthm, cght.hthm != '', cght.hthm != None).first()
        if c:
            htje = float(c.htje) if c.htje else 0

        c = s.query(func.sum(func.ifnull(cymxsheet.gczj, 0)).label('chje')
            ).filter(cymxsheet.fphm == fphm, cymxsheet.fphm != '', cymxsheet.fphm != None).first()
        if c:
            chje = float(c.chje) if c.chje else 0

        return json_result(1, msg, data={
            'fktt': fktt,
            'htje': htje,
            'chje': chje
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()


"""
电商预填费用.界面加载
对应原Pascal: 电商预填费用.界面加载
"""
@any_route('/api/saier/shop_cost/load/check', methods=['POST'])
@require_token
async def view_shop_cost_load_check(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        j = await request.json()
        sqbm = j.get('sqbm', '')
        bm = ''
        bmdm = ''
        cwsb = '0'
        if sqbm == '' and sqbm is None:
            c = s.query(ywrybiao.bm).filter(ywrybiao.yhm == user.username).first()
            if c:
                bm = c.bm
                u = s.query(ywbdzb.dyywzm).filter(ywbdzb.ywb == bm).first()
                if u :
                    bmdm = u.dyywzm

        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '电商财务预填费用').first()
        if c:
            cwsb = '1'

        return json_result(1, msg, data={
            'ssbm': bm,
            'bmdm': bmdm,
            'cwsb': cwsb
        })
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()


"""
电商预填费用.单证财务退回
对应原Pascal: 电商预填费用.单证财务退回
"""
@any_route('/api/saier/shop_cost/update_dzth', methods=['POST'])
@require_token
async def view_shop_cost_update_dzth(request):
    s = Session()
    try:
        code = 1
        msg = '操作成功'
        user = request.current_user
        j = await request.json()
        rid = j.get('rid', '')
        cwsb = '0'
        flag = 0
        c = s.query(dsytfy).filter(dsytfy.rid == rid, func.ifnull(dsytfy.zjlhz,'').in_(['待审批', '不通过', ''])).first()
        if c:
            c.tjjl=""
            c.jlhz="待审批"
            c.zjlhz="待审批"
            c.tjzjl=""
            flag = 1
            s.add(c)
        c = s.query(cyzglsheet.rid).filter(cyzglsheet.xm == user.username, cyzglsheet.zm == '电商财务预填费用').first()
        if c:
            cwsb = '1'

        if cwsb == '1':
            c = s.query(dsytfy).filter(dsytfy.rid == rid, dsytfy.zjlhz == '通过').first()
            if c:
                c.tjjl=""
                c.jlhz="待审批"
                c.zjlhz="待审批"
                c.tjzjl=""
                c.cwsd=""
                c.kfdy="不可"
                c.zjlhz = '待审批'
                flag = 1
                s.add(c)
        if flag == 1:
            s.commit()
        else:
            code = -1
            s.rollback()
            msg = '退回无效'

        return json_result(code, msg)
    except Exception as e:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()