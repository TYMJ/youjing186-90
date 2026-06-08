from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,module_share_new
import pymssql

SYS_FIELDS = ['sid','rid','uid','ctime','mtime','has_att','modi_uid','wf_status','wf_unit','pid','archived']

class MyDB:
    def __init__(self, server, user, password, database, port):
        self.server = server
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.conn = None

    def connect(self):
        self.conn = pymssql.connect(
            server=self.server,
            user=self.user,
            password=self.password,
            database=self.database,
            port=self.port
        )
        print('已连接数据库')

    def query(self, command):
        with self.conn.cursor(as_dict=True) as cursor:
            cursor.execute(command)
            return cursor.fetchall()

    def execute_command(self, command, params=None):
        with self.conn.cursor() as cursor:
            if params:
                cursor.execute(command, params)
            else:
                cursor.execute(command)
            self.conn.commit()  # 确保提交更改

    def close(self):
        if self.conn:
            self.conn.close()


async def order_wfgs_kind(wfgs_n,bmdm,htlx,khmc,ywbm):
    try:
        year = time.strftime('%Y')[2:4]
        month = time.strftime('%m')
        xhtqd = 0
        bz = ''
        date = time.strftime('%Y-%m-%d')
        if wfgs_n =='宁波可思达进出口有限公司':
            d = run_sql(f"select xm from cyzglsheet where (zm='新合同号启动时间')")
            if len(d) > 0 and d[0].get('xm','') != '' and date >= d[0].get('xm',''):
                xhtqd = 1
            if xhtqd == 0:
                d = run_sql(f"select bz1,bz2 from cyzglsheet where (xm='{wfgs_n}') and (zm='特殊合同号') and (bz='{ywbm}')")
                if len(d) > 0:
                    bmdm = d[0].get('bz2','')
                    bz = str(d[0].get('bz1',''))
                d = run_sql(f"select bz1,bz2 from cyzglsheet where (xm='{ywbm}') and (zm='合同号申请合同判别') and (bz='{khmc}')")
                if len(d) > 0:
                    bz = str(d[0].get('bz1',''))

            htlx = str(year) + str(bz) + str(month)

        return htlx,bmdm
    except:
        logger.error(trace_error())
        return '', ''
    
async def order_khmc_kind(khmc,htlx,bmdm,ywbm,ywy):
    try:
        year = time.strftime('%Y')[2:4]
        month = time.strftime('%m')
        # xhtqd = 0
        # date = time.strftime('%Y-%m-%d')
        # if khmc !='' and khmc != None:
        # xhtqd = 0
        # d = run_sql(f"select xm from cyzglsheet where (zm='新合同号启动时间') limit 1")
        # if len(d)>0:
        #     xhtqd = 1
        d = run_sql(f"select ywzyw from ywrybiao where (yhm='{ywy}') limit 1")
        if len(d)>0:
            bmdm = d[0].get('ywzyw','') + '-'

        if 'BEST PRICE LLC' in khmc:
            d = run_sql(f"select dyywzm,htbh from ywbdzb where (ywb='{ywbm}') and (tsbs<>'是')")
            if len(d) > 0:
                bmdm = d[0].get('dyywzm','')
                htlx = str(year) + str(d[0].get('htbh','')) + str(month)
        else:
            d = run_sql(f"select dyywzm,htbh from ywbdzb where (ywb='{ywbm}') and (tsbs='是')")
            if len(d) > 0:
                htlx = str(year) + str(d[0].get('htbh','')) + str(month)

        d = run_sql(f"select bz1,bz2,xm from cyzglsheet where (zm='合同号申请合同判别') and (bz='{khmc}') and (xm='{ywbm}')")
        if len(d) > 0:
            htlx = str(year) + str(d[0].get('bz1','')) + str(month)

        if ywy!='' and ywy!=None:
            d = run_sql(f"select bz3,bz2,bz4 from cyzglsheet where (zm='合同号申请合同业务判别') and (bz1='{khmc}')")
            if len(d) > 0:
                htlx = str(year) + str(d[0].get('bz2','')) + str(month)
                if 'BEST PRICE LLC' in khmc:
                    bmdm= d[0].get('bz3','')
            d = run_sql(f"select bz3,bz2,bz4 from cyzglsheet where (zm='合同号申请合同业务部门判别') and (bz1='{khmc}') and (bz='{ywbm}')")
            if len(d) > 0:
                htlx = str(year) + str(d[0].get('bz2','')) + str(month)
                if 'BEST PRICE LLC' in khmc:
                    bmdm= d[0].get('bz3','')

        return htlx,bmdm
    except:
        logger.error(trace_error())
        return '', ''

async def order_excel_kind(khmc,ywbm,user):
    try:
        htlx = ''
        bmdm = ''
        # ywy = user.username
        year = time.strftime('%Y')[2:4]
        month = time.strftime('%m')
        xhtqd = 0
        bhfs = 0
        date = time.strftime('%Y-%m-%d')

        d = run_sql(f"select ywzyw from ywrybiao where (yhm='{user.username}') limit 1")
        if len(d) > 0:
            bmdm = d[0].get('ywzyw','') + '-'
        d = run_sql(f"select dyywzm,htbh from ywbdzb where (ywb='{ywbm}') and (tsbs<>'是')")
        if len(d) > 0 :
            bmdm = d[0].get('dyywzm','')
            htlx = str(year) + str(d[0].get('htbh','')) + str(month)
                                                                      
        if 'BEST PRICE LLC' in khmc:
            d = run_sql(f"select bz3,bz2,bz4 from cyzglsheet where (zm='合同号申请合同业务判别') and (bz1='{khmc}')")
            if len(d) > 0 :
                htlx = str(year) + str(d[0].get('bz2','')) + str(month)
                if (d[0].get('bz3','')!=''):
                    bmdm = d[0].get('bz3','')
                if (d[0].get('bz4','')=='后'):
                    bhfs = 1
        else:
            bhfs = 2
            d = run_sql(f"select xm from cyzglsheet where (zm='新合同号启动时间')")
            if len(d) > 0 and d[0].get('xm','') != '' and date >= d[0].get('xm',''):
                xhtqd = 1
            if xhtqd == 1:
                d = run_sql(f"select dyywzm,htbh from ywbdzb where (ywb='{ywbm}') and (tsbs='是')")
                if len(d) > 0 :
                    htlx = str(year) + str(d[0].get('htbh','')) + str(month)
                d = run_sql(f"select ywzyw from ywrybiao where (yhm='{user.username}') limit 1")
                if len(d) > 0:
                    bmdm = d[0].get('ywzyw','') + '-'
            else:
                d = run_sql(f"select dyywzm,htbh from ywbdzb where (ywb='{ywbm}') and (tsbs='是')")
                if len(d) > 0 :
                    htlx = str(year) + str(d[0].get('htbh','')) + str(month)
                    bmdm = d[0].get('dyywzm','')
                d = run_sql(f"select bz1,bz2 from cyzglsheet where (xm='{ywbm}') and (zm='合同号申请合同判别') and (bz='{khmc}')")
                if len(d) > 0:
                    bmdm = d[0].get('bz2','')
                    htlx = str(year) + str(d[0].get('bz1','')) + str(month) 
                d = run_sql(f"select bz3,bz2 from cyzglsheet where (zm='合同号申请合同业务判别') and (bz1='{khmc}')")
                if len(d) > 0 :
                    htlx = str(year) + str(d[0].get('bz2','')) + str(month)
                d = run_sql(f"select bz3,bz2 from cyzglsheet where (zm='合同号申请合同业务部门判别') and (bz1='{khmc}' and bz='{ywbm}')")
                if len(d) > 0 :
                    htlx = str(year) + str(d[0].get('bz2','')) + str(month)
                    if d[0].get('bz3','') != '':
                        bmdm = d[0].get('bz3','')
        logger.error('htlx:' + htlx + ' bmdm:' + bmdm + ' bhfs:' + str(bhfs))
        return htlx,bmdm,bhfs
    except:
        logger.error(trace_error())
        return '', ''
    
# 合同申请的我方公司修改取数
@any_route('/api/saier/order_apply/wfgs/change', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_wfgs_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        wfgs_n = j.get('wfgs', '')
        khmc = j.get('khmc', '')
        ywbm = j.get('ywbm', '')
        bmdm = j.get('bmdm', '')
        htlx = j.get('htlx', '')
        htlx, bmdm = await order_wfgs_kind(wfgs_n,bmdm,htlx,khmc,ywbm)

        return json_result(1, '操作成功', {'htlx':htlx,'bmdm':bmdm})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 合同申请的我方公司修改取数
@any_route('/api/saier/order_apply/khmc/change', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_khmc_change(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        # wfgs_n = j.get('wfgs', '')
        khmc = j.get('khmc', '')
        ywbm = j.get('ywbm', '')
        bmdm = j.get('bmdm', '')
        htlx = j.get('htlx', '')
        ywy = j.get('ywy', '')
        htlx, bmdm = await order_khmc_kind(khmc,htlx,bmdm,ywbm,ywy)

        return json_result(1, '操作成功', {'htlx':htlx,'bmdm':bmdm})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

async def order_excel_no(bmdm,mdck,ckyw,htlx,khmc,csd,bhfs,s):
    try:
        hthm = ''
        number = 1
        d = s.query(func.count(htsq.rid).label('number')).filter(htsq.hthm.like(f'%{htlx}%')).first()
        if d:
            number = int(d.number) + 1
        
        if 'BEST PRICE LLC' in khmc:
            no = str(number).zfill(2)  
        else:
            no = str(number).zfill(3)
        if ckyw == '' or ckyw == None or ckyw == 'None':
            ckyw = ''
        if bhfs == 0:
            hthm = str(ckyw) + str(bmdm) + str(htlx) + no
        elif bhfs == 1:
            hthm = str(bmdm) + str(ckyw) + str(htlx) + no
        else:
            hthm = str(bmdm) + str(htlx) + no

        bz = ''
        d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='BP港口外销合同中缀')")
        if len(d) > 0 and d[0].get('bz','') != '':
            bz = d[0].get('bz','')
        if bz == '':
            d = run_sql(f"select bz from cyzglsheet where (xm='{mdck.upper()}') and (zm='BP港口外销合同中缀')")
            if len(d) > 0 and d[0].get('bz','') != '':
                bz = str(d[0].get('bz',''))

        if bz !="":
            bz = '- ' + str(bz)
        hthm = str(hthm) +  bz
        if csd != '' and csd != None and len(csd)>0:
            hthm = str(csd) + str(hthm)

        return hthm
    except:
        logger.error(trace_error())
        return ''
    

async def order_get_no(wfgs_n,ywry,bmdm,mdck,ckyw,htlx,khmc,user,s,flag=0):
    try:
        hthm = ''
        number = 1
        # flag = 0
        # number = 1
        d = s.query(func.count(htsq.rid).label('number')).filter(htsq.hthm.like(f'%{htlx}%')).first()
        if d:
            number = int(d.number) + 1

        if ywry != '' and ywry != None:
            d = run_sql(f"select bz2,bz3,bz4 from cyzglsheet where (zm='合同号申请合同业务判别') and (bz1='{khmc}')")
            if len(d) > 0:
                flag = 1
        org = get_user_path(user.username)
        path = org.get('path','')
        # if (wfgs_n !='宁波可思达进出口有限公司' or flag==0) and 'BEST PRICE' in khmc:
        if 'BEST PRICE LLC' in khmc:
            if flag == 1:
                hthm = str(bmdm) + str(ckyw) + str(htlx) + str(number).zfill(2)
            else:
                hthm = str(ckyw) + str(bmdm) + str(htlx) + str(number).zfill(2)
        else:
            hthm = str(bmdm) + str(htlx) + str(number).zfill(3)

        if wfgs_n !='宁波可思达进出口有限公司':
            bz = ''
            d = run_sql(f"select bz from cyzglsheet where (xm='{khmc}') and (zm='BP港口外销合同中缀')")
            if len(d) > 0 and d[0].get('bz','') != '':
                bz = d[0].get('bz','')
            if bz == '':
                d = run_sql(f"select bz from cyzglsheet where (xm='{mdck.upper()}') and (zm='BP港口外销合同中缀')")
                if len(d) > 0 and d[0].get('bz','') != '':
                    bz = str(d[0].get('bz',''))
            if bz !="":
                bz = str(bz) + '-'
            hthm = str(hthm) +  bz
        else:
            if 'CSD-' not in hthm:
                hthm = 'CSD-' + str(hthm)

        return hthm,path
    except:
        logger.error(trace_error())
        return ''

# 合同申请的客户名称修改取数
@any_route('/api/saier/order_apply/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        khmc = j.get('khmc', '')
        htlx = j.get('htlx', '')
        wfgs_n  = j.get('wfgs_n', '')
        bmdm = j.get('bmdm', '')
        ckmc = j.get('mdka', '')
        ckyw = j.get('ckyw', '')
        ywry = j.get('ywry', '')
        hthm,path = await order_get_no(wfgs_n,ywry,bmdm,ckmc,ckyw,htlx,khmc,user,s,1)

        return json_result(1, '操作成功', {'hthm': hthm, 'path': path})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 合同申请的编辑界面加载取数
@any_route('/api/saier/order_apply/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid', '')
        zsht = j.get('zsht', '')
        ywy = j.get('ywy', '')
        ywbm = ''
        bmdm = ''
        htlx = ''
        ywy = j.get('ywy', '')
        # my_db = MyDB("192.168.1.2", 'sa', 'zjnblh78', 'cxtrade', '1433')
        # my_db.connect()
        org = get_user_path(user.username)
        path1 = org.get('path','')
        path2 = ''
        if ywy =='' or ywy == None:
            d = run_sql(f"select bm,ywzyw from ywrybiao where yhm='{user.username}' limit 1")
            if len(d) > 0:
                ywbm = d[0].get('bm','')
                bmdm = d[0].get('ywzyw','') + '-'
                c = run_sql(f"select dyywzm,htbh from ywbdzb where ywb='{ywbm}' limit 1")
                if len(c) > 0:
                    # bmdm= c[0].get('dyywzm','')
                    htlx = str(time.strftime('%Y')[2:4]) + str(c[0].get('htbh','')) + str(time.strftime('%m'))
        else:
            org = get_user_path(ywy)
            path2 = org.get('path','') 
        cght_list = []
        cymx_list = []
        fkqd_list = []
        skqd_list = []
        if (zsht!='' and zsht!=None and path2 != '' and  path1 in path2) or (ywy!='' and ywy != None and user.username == ywy):
            cght_list = run_sql(f"SELECT '{rid}' pid,cght.sid,cght.hthm,cght.sccj1 sccj,cght.cgry,cght.cgbm,cght.xdsq,cght.sfhz,\
                cght.gdry,cght.gdbm,cght.kppm,cght.qydd,cght.jhdd,cght.chyq,cght.bzyq,cght.ysfs,cght.jsfs,\
                cght.pzbz,cght.wyzren,cght.cpyq,cght.kpgc,cght.htje,cght.htzsl,cght.htzxs,cght.htzmz,cght.htzjz,cght.htztj \
                FROM cght WHERE (cght.wxht='{zsht}') AND permission('采购合同') ORDER BY cght.sid ASC ", user=user)
            for r in cght_list:
                r['yfje'] = 0
                c = run_sql(f"SELECT ifnull(sum(ifnull(fkje,0)),0) yfje FROM yfhk WHERE (cght='{r.get('hthm')}')")
                if len(c) > 0:
                    r['yfje'] = float(c[0].get('yfje',0))
                r['fkje'] = 0
                c = run_sql(f"SELECT ifnull(sum(ifnull(fkhj,0)),0) fkje FROM gchk WHERE (cght='{r.get('hthm')}')")
                if len(c) > 0:
                    r['fkje'] = float(c[0].get('fkje',0))

            cymx_list = run_sql(f"SELECT '{rid}' pid,cymxsheet.sid,cymx.chydh,cymx.fphm,cymx.chyrq,cymxsheet.cpbh,\
                cymxsheet.zwpm,cymxsheet.zhwbgpm,cymxsheet.cght,cymxsheet.gcmc,cymxsheet.chsl,cymxsheet.kpgc \
                FROM cymx,cymxsheet WHERE (cymx.rid=cymxsheet.pid) AND (cymxsheet.wxht='{zsht}') and ifnull(cymxsheet.wxht,'')<>'' \
                AND (ifnull(cymxsheet.chyrq,'')<>'') AND (cymxsheet.fpsb1='是') AND permission('出运明细') ORDER BY cymxsheet.sid ASC", user=user)
            
            fkqd_list = run_sql(f"SELECT '{rid}' pid,cght,htje,sqje,fkrq,fkje,\
                sccj,gcmc1,'是' sfyf,sb,'' gcfp, '' fpwk\
                FROM yfhk WHERE (yfhk.wxfp='{zsht}')")
            
            # 取其他服务器上的付款数据
            # sql = f"SELECT '{rid}' pid,cght,htje,sqje,fkrq,fkje,\
            #     sccj,gcmc1,'优胜是' sfyf,sb,'' gcfp, '' fpwk\
            #     FROM yfhk WHERE (yfhk.wxfp='{zsht}')"
            # c = my_db.query(sql)
            # fkqd_list.extend(c)

            d = run_sql(f"SELECT '{rid}' pid,cght,htje,sqje,hkrq fkrq,fkhj fkje,\
                gcmc sccj,gcmc1,'否' sfyf,sb,gcfp,fpwk\
                FROM gchk WHERE (gchk.wxfp='{zsht}')")
            fkqd_list.extend(d)

            # 取其他服务器上的付款数据
            # sql = f"SELECT '{rid}' pid,cght,htje,sqje,hkrq fkrq,fkhj fkje,\
            #     gcmc sccj,gcmc1,'优胜否' sfyf,sb,gcfp,fpwk\
            #     FROM gchk WHERE (gchk.wxfp='{zsht}')"
            # c = my_db.query(sql)
            # fkqd_list.extend(c)

            skqd_list = []
            d = run_sql(f"SELECT fphm FROM cymxsheet WHERE (cymxsheet.wxht='{zsht}')")
            for r in d:
                c = run_sql(f"SELECT '{rid}' pid,fphm,wxht,sydje FROM krshsheet WHERE (wxht='{r.get('fphm','')}') ")
                skqd_list.extend(c)
                # 取其他服务器上的收款数据
                # sql = f"select '{rid}' pid,fphm,wxht,sydje FROM krshsheet WHERE (wxht='{r.get('fphm','')}') "
                # c = my_db.query(sql)
                # skqd_list.extend(c)

        return json_result(1, '操作成功', {'cght_list':cght_list,'cymx_list':cymx_list,'fkqd_list':fkqd_list,'skqd_list':skqd_list,'ywbm':ywbm,'bmdm':bmdm,'htlx':htlx, 'path1':path1, 'path2':path2})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 合同申请的批量新增记录
async def order_apply_one_new(r,user,s):
    try:
        ts = r.get('ts',1)
        csd = r.get('csd','')
        logger.error("=-------csd----")
        logger.error(csd)
        for i in range(0,ts):
            o = htsq()
            for k in r:
                if k in SYS_FIELDS:
                    continue
                if hasattr(o, k):
                    setattr(o, k, r[k])
            ywbm = ''
            ckyw = ''
            bmdm = ''
            ywy = user.username
            khmc = r.get('khmc','')
            # wfgs_n = r.get('wfgs','')
            ckmc = r.get('mdck','')
            date = time.strftime('%Y-%m-%d')
            xhtqd = 0
            d = run_sql(f"select xm from cyzglsheet where (zm='新合同号启动时间')")
            if len(d) > 0 and d[0].get('xm','') != '' and date >= d[0].get('xm',''):
                xhtqd = 1

            d = s.query(ywrybiao.bm,ywrybiao.ywzyw).filter(ywrybiao.yhm==ywy).first()
            if d:
                ywbm = str(d.bm)
                bmdm = str(d.ywzyw)
            d = s.query(mdck.htzm).filter(mdck.ckmc==ckmc).first()
            if d:
                ckyw = str(d.htzm)
            htlx,bmdm,bhfs = await order_excel_kind(khmc,ywbm,user)
            hthm = await order_excel_no(bmdm,ckmc,ckyw,htlx,khmc,csd,bhfs,s)

            o.rid = get_uuid()
            o.ywy = ywy
            o.sqrq = time.strftime('%Y-%m-%d')
            o.ctime = time.strftime('%Y-%m-%d %H:%M:%S')
            o.uid = user.rid
            o.xdry = ywy
            o.ckyw = ckyw
            o.ywbm = ywbm
            o.bmdm = bmdm
            o.htpb = htlx
            o.hthm = hthm
            o.mdka = ckmc
            o.htzt = '申请'
            o.xq = '否'
            o.wyzd = o.rid
            o.bz = r.get('bz','')
            s.add(o)

        return {'code':1,'msg':'操作成功'}
    except:
        logger.error(trace_error())
        return {'code':-1,'msg':trace_error()}

# 合同申请的批量新增记录
async def order_apply_batch_new(data,user,s):
    try:
        for r in data:
            csd = r.get('csd','')
            sfxkr = r.get('sfxkr')
            if sfxkr != '是':
                sfxkr = '是'
            krly = r.get('krly','')
            # if krly == '' and sfxkr == '是':
            #     continue  # 如果不是客户则不生成合同申请单
            ts = r.get('ts',1)
            for i in range(1,ts):
                res = await order_apply_one_new(r,user,s)
                if res.get('code') != 1:
                    return res

        return {'code':1,'msg':'操作成功'}
    except:
        logger.error(trace_error())
        return {'code':-1,'msg':trace_error()}

# 合同申请的批量新增记录
@any_route('/api/saier/order_apply/new/data', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_new_data(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = j.get('data', [])
        res = await order_apply_batch_new(data,user,s)
        if res.get('code') != 1:
            s.rollback()
        else:
            s.commit()

        return json_result(res.get('code'), res.get('msg'))
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


# 合同申请的获取我方公司记录
@any_route('/api/saier/order_apply/get/wfgs', methods=['POST', 'GET'])
@require_token
async def view_saier_order_apply_get_wfgs(request):
    s = Session()
    # user = request.current_user
    # j = await request.json()
    try:
        d = s.query(cyzglsheet.xm).filter(cyzglsheet.zm=="合同申请公司").all()
        data = [r.xm for r in d]
        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()