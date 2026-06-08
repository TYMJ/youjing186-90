# 入库单  

from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path,module_xxck_new,user_task_new
from datetime import datetime  # 确保有这行



@any_route('/api/saier/warehouse_receipt/load', methods=['POST', 'GET'])
@require_token
async def view_saier_warehouse_receipt_load(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        module = j.get('module')
        data = s.query(storage).first()
        return json_result(1, '取数成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

# 潜在工厂启信宝获取数据 未启用
#作业号编号   
def get_storagezyh(zyh1):
    """
    获取出库单作业号
    """
     
    zyh=''
    sSql = """
        SELECT zyh 
        FROM storage 
        WHERE zyh LIKE CONCAT('%%', :zyh, '%%')
        ORDER BY zyh DESC 
        LIMIT 1
        """
    mmsql = run_sql(sSql, {"zyh": zyh1})
    print('dasdaskdjaskldjsaldjsadkjsadlksajdlaskdjslkadj-dsakdjsakdjsakdjaskldjasldjsalkdjsaldjsadsajld')
    print(mmsql)
    if len(mmsql) > 0:
        max_zyh = mmsql[0]['zyh']
        i1 = int(max_zyh[8:12]) + 1
        if i1 < 10:
            return zyh1 + '000' + str(i1)
        elif i1 < 100 and i1 >= 10:
            return zyh1 + '00' + str(i1)
        elif i1 < 1000 and i1 >= 100:
            return zyh1 + '0' + str(i1)
    else:
        return zyh1 + '0001'   

#获取业务部门   
def get_storageywbm(ywry):
    ywbm = ''
    sSql = """
              Select bm from ywrybiao where yhm=:yhm
           """
    mmsql = run_sql(sSql, {"yhm": ywry})
    if len(mmsql) > 0:
         return mmsql[0]['bm']
    else:
        return ''
#获取path 
def get_storagepath(name):
    path = ''
    org = get_user_path(name)
    path = org.get('path','')
    return path[:100] 
#获取path 
def get_storagepath(name):
    path = ''
    org = get_user_path(name)
    path = org.get('path','')
    return path[:100] 


def get_path_if_exists(value):
    """如果值存在则获取存储路径，否则返回空字符串"""
    return get_storagepath(value) if value else ''
#获取仓库path 
def get_storageckpath(name):
    path = ''
    org = get_user_path(name," and ((position like '%仓库操作%' or memo like '%仓库操作%'))")
    path = org.get('path','')
    return path[:100] 




@any_route('/api/saier/warehouse_receipt/historical/instock', methods=['POST', 'GET'])
@require_token
async def view_saier_warehouse_receipt_historical_instock(request):
    user = request.current_user
    JSONRes = await request.json()
    s = Session()
    try:
        # 1. 解析前端传入参数
        purchase_order_no = JSONRes.get('PurchaseOrderNo','')  # 采购单号
        receipt_rid = JSONRes.get('rid','')                    # 当前入库单rid (用于排除自身)
     
        detail_view_data = JSONRes.get('detail_view_data','') 
        zyh1 = JSONRes.get("zyh1", "")
        zyh =  JSONRes.get("zyh", "")
        ywry = JSONRes.get("ywry", "")
        name = JSONRes.get("name", "")
        cgy = JSONRes.get("cgy", "")
        ItemsData = JSONRes.get("ItemsData", "")
        rkrq = JSONRes.get("rkrq", "")
        rksj = JSONRes.get("rksj", "")
        jcrq = JSONRes.get("jcrq", "")
        sdry = JSONRes.get("sdry", "")
        wxht = JSONRes.get("wxht", "")
        gsmc = JSONRes.get("gsmc", "")
        ywy = JSONRes.get("ywy", "")
        cght = JSONRes.get("cght", "")
        csmc = JSONRes.get("csmc", "")
        cgy = JSONRes.get("cgy", "")
        lhy = JSONRes.get("lhy", "")
        ckmc = JSONRes.get("ckmc", "")
        jcdh = JSONRes.get("jcdh", "")
        sfjc = JSONRes.get("sfjc", "")
            
        gdry = JSONRes.get("gdyr", "")
        yzrq = JSONRes.get("yzrq", "")
        rkdd = JSONRes.get("rkdd", "")
        username = JSONRes.get("username", "")
        uid = JSONRes.get("uid", "")
        wyzdzb = JSONRes.get("wyzdzb", "")  
        khmc = JSONRes.get("khmc", "")
        
        ggxx_list = []
        ywypath = ''
        cgypath =''
        wyzd = ''
        ywbm = ''
        
        # 存储有问题的产品
        error_items = []
        has_qty_error = False
        has_contract_error = False
        error_messages = []
        
        for item in detail_view_data:
            cpbh = item['ItemNo']  # 产品编号
            dqrkxs = float(item.get('CartonQty', 0))  # 当前入库箱数
            zpxs = float(item.get('ckxs', 0))  # 出库箱数/赠品箱数
            
            #合同总箱数
            sql = 'select sum(b.cgxs) as cgxs from cght a,cghtsheet b where a.rid = b.pid and a.hthm=:hthm and ((b.khhh=:khhh and ifnull(b.khhh, "")<>"") or (b.bjhh=:bjhh and ifnull(b.bjhh, "")<>"")) '
            amsql = run_sql(sql, {'hthm': purchase_order_no, 'khhh': cpbh, 'bjhh': cpbh})
            contract_total = 0
            if len(amsql) > 0:
                contract_total = amsql[0]['cgxs'] or 0 
                
            # 历史入库箱数（不含当前入库单）
            asql = 'SELECT SUM(b.CartonQty) as total_qty FROM storage a INNER JOIN storageline b ON a.rid = b.pid WHERE a.PurchaseOrderNo =:PurchaseOrderNo AND b.ItemNo =:ItemNo AND a.rid <> :rid'
            aamsql = run_sql(asql, {'PurchaseOrderNo': purchase_order_no, 'ItemNo': cpbh, 'rid': receipt_rid})
            historical_qty = 0
            if len(aamsql) > 0:
                historical_qty = aamsql[0]['total_qty'] or 0
                
            # 计算差值：合同总箱数 - (当前入库箱数 + 历史入库箱数)
            cs = contract_total - (dqrkxs + historical_qty)
            
            # 验证1：实际箱数必须大于等于出库箱数
            print('dqrkxs---------------------------')
            print(dqrkxs)
            print('zpxs---------------------------')
            print(zpxs)
            is_qty_valid = dqrkxs >= zpxs
            print(is_qty_valid)
            
            
            # 验证2：不能超出合同数量
            is_contract_valid = cs > 0
            
            # 如果有错误，记录该产品
            if not is_qty_valid or not is_contract_valid:
                error_type = None
                if not is_qty_valid and not is_contract_valid:
                    error_type = 'BOTH'
                    error_messages.append(f'产品{cpbh}：实际箱数小于出库箱数且累计实际进仓数{dqrkxs + historical_qty}大于合同箱数{contract_total}！')
                elif not is_qty_valid:
                    error_type = 'QTY_ERROR'
                    has_qty_error = True
                    error_messages.append(f'产品{cpbh}：实际箱数小于出库箱数！')
                elif not is_contract_valid:
                    error_type = 'CONTRACT_ERROR'
                    has_contract_error = True
                    error_messages.append(f'产品{cpbh}：累计实际进仓数{dqrkxs + historical_qty}大于合同箱数{contract_total}！')
                
                error_items.append({
                    'rid': item['rid'],
                    'ErrorType': error_type
                })
        
        # 确定整体错误类型
        overall_error_type = 'SUCCESS'
        if has_qty_error and has_contract_error:
            overall_error_type = 'BOTH'
        elif has_qty_error:
            overall_error_type = 'QTY_ERROR'
        elif has_contract_error:
            overall_error_type = 'CONTRACT_ERROR'
        elif len(error_items) > 0:
            # 如果有BOTH类型的错误
            overall_error_type = 'BOTH'
        
        # 返回验证结果
        if len(error_items) > 0:
            return json_result(2, '; '.join(error_messages), {
                'errorItems': error_items,  # 有问题的产品列表
                'errorType': overall_error_type  # 整体错误类型
            })
        else:
            #执行入库操作
               
            result = {
                'zyh': '',
                'ywbm': '',
                'path': '',
                'ggxx':'',
                'oShipmentsCostsDetail':[]
                }
            #获取作业号
            if (zyh=='自动编号' or zyh==''):
                if (zyh1):
                    result['zyh']  = get_storagezyh(zyh1)
                    msql = 'update  storage set zyh=:zyh where rid=:rid'
                    dassqml = run_sql(msql, {"zyh": result['zyh'], "rid": receipt_rid})
            #获取业务部门  
            if (ywry):
                ywbm = get_storageywbm(ywry)
        
            #获取仓库管理员path 因为需要postion。条件 所以不能用get_path_if_exists
            if (name):
                result['path'] = get_storageckpath(name)
            #获取业务员path
            if (ywry):
                ywypath = get_path_if_exists(ywry)
            #获取采购员path
            if (cgy):
                cgypath = get_path_if_exists(cgy)
            print('pathdakljdaskldjsakdjaskldjaskldjaslkdjsalkdjaskldjs')  
            print(name)  
            print(result['path'])    
            if (result['path']):  
                hh  =  0
                messages=[]
                messages1=[]
                for i in range(len(ItemsData)):
                    item = ItemsData[i]
                    hh = hh + 1
                    errors = [] 
                   
                    oTempData={}
                        
                    oTempData['khmc']=khmc
                    oTempData['StorageDate'] = rkrq;
                    oTempData['StorageTime'] = rksj;
                    oTempData['jcrqc'] = jcrq;
                    oTempData['Operatorc'] = sdry;
                    oTempData['SalesOrderNoc'] = wxht;
                    oTempData['Exporterc'] = gsmc;
                    oTempData['Salesmanc'] = ywy;
                    oTempData['PurchaseOrderNoc'] = cght;
                    oTempData['SupplierShortNamec'] = csmc;
                    oTempData['PurchasingAgentc'] = cgy;

                    oTempData['Collatorc'] = lhy;
                    oTempData['WarehouseNamec'] = ckmc;
                    oTempData['SNIDc'] = jcdh;

                    oTempData['sfjcc'] = sfjc;
                    oTempData['gdryc'] = gdry;
                    oTempData['yzrqc'] = yzrq;
                    oTempData['rkddc'] = rkdd;
                    oTempData['ywpath'] = ywypath;
                    oTempData['cgpath'] = cgypath;
                    oTempData["rid"] = item['rid']
                    # print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd-wyzd')
                    # print(item['wyzd'])
                
                    
                    if (item['wyzd']=='' or item['wyzd'] is None):
                        print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd')
                        wyzd =jcdh + rkrq + username + datetime.now().strftime('%Y-%m-%d %H:%M:%S')+ str(hh); # ✅ 生成唯一值
                        print(wyzd)
                        oTempData['wyzd'] = wyzd;
                    else:
                        print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd=======')
                        wyzd = item['wyzd']
                        oTempData['wyzd'] = item['wyzd']
                 
                    
                    result['oShipmentsCostsDetail'].append(oTempData)   
                    
                     
                    if (item['CartonQty1'] >0):
                        if (item['CartonQty'] >0):
                            ssql ='select * from inventorydetail where wyzd=:wyzd '
                            jsql = run_sql(ssql, {"wyzd": wyzd})
                            print(f'查询sql内容如下------------------------------------------------------------------------{jsql}')
                            print(len(jsql))
                            if len(jsql) <= 0:
                             
                                kcwyzd = wyzd +rkrq+rksj
                                for i3 in range(1, 3): 
                                    if i3 == 1:
                                       gdry1 = gdry
                                    else:
                                       gdry1 = ywy
                               
                                if (gdry1 != username):
                                    print('djashdksajdhaskjdh-dsakjdhksa-dhaskjdhsakld-daskjdhsakjdhsjkah')
                                    print(username)
                                    print(jcdh)
                                    print(item['ItemNo'])
                                    print(str(item['CartonQty']))
                                    print(csmc)
                                    print(jcrq)
                         
                                        #插入消息查看
                                    mm=xxck()
                                    mm.rid=get_uuid()
                                    mm.uid=uid
                                    mm.ctime=datetime.now()
                                    mm.mtime=datetime.now()
                                    mm.fsrq =  datetime.now().strftime('%Y-%m-%d'),
                                    mm.fsr = username,
                                    mm.xxly = '已进仓通知',
                                    mm.xxnr = username+'的进仓单号'+jcdh+'产品:'+item['ItemNo']+'箱数'+str(item['CartonQty'])+'工厂'+csmc+'的进仓日期:'+ jcrq+'已进仓请查看,请查看,日期:'+ datetime.now().strftime('%Y-%m-%d'),
                                    mm.jsr = gdry1
                                    messages.append(mm)
                                    
                                aa = inventorydetail()      
                                aa.rid=get_uuid()
                                aa.uid=uid
                                aa.ctime=datetime.now()
                                aa.mtime=datetime.now()
                                #这个字段没有 aa.sys_path='ravencloud'
                                aa.SNID = jcdh
                                aa.Exporter = gsmc
                                aa.gdry = gdry
                                aa.Salesman = ywy
                                aa.PurchasingAgent = cgy
                                aa.PurchaseOrderNo = cght
                                aa.SupplierShortName = csmc
                                aa.ItemNo = item['ItemNo']
                                aa.PalletQty = item['PalletQty']
                                aa.CartonQty = item['CartonQty1']
                                aa.InCartonQty = item['CartonQty']     
                                if int(item['CartonQty'] or 0) - int(item['CartonQty1'] or 0) > 0:
                                   aa.OutCartonQty = int(item['CartonQty'] or 0) - int(item['CartonQty1'] or 0)
                                else:
                                   aa.OutCartonQty = 0
                  
                                aa.ReturnCartonQty = item['ReturnCartonQty']
                                aa.thyy = item['thyy']
               
      
                                aa.OuterLength = item['ckzd']
                                aa.OuterWidth = item['ckkd']
                                aa.OuterHeight = item['ckgd']
                                aa.OuterVolume = item['cktj']
                                aa.Volume = item['ckztj']
                                aa.OuterGrossWeight = item['ckmz']
                                aa.GrossWeight = item['ckzmz']
                                aa.OuterNetWeight = item['ckjz']
                                aa.WarehousePosition = item['WarehousePosition']
                    
                                aa.Collator = lhy
                                aa.StorageDate = item['StorageDate']
                                aa.StorageTime = item['StorageTime']
                                aa.LotNumber = item['LotNumber']
                                aa.SalesOrderNo = wxht
                                aa.WarehouseName = ckmc
                                aa.Operator = sdry
                                aa.rkdd = rkdd
                                aa.wyzd = wyzd
                                aa.Memo = item['Memo']
                                aa.jcf = item['jcf']
                                aa.PalletQty =  item['PalletQty'],
                                aa.wxwyzd = item['wxwyzd']
                                aa.cgwyzd = item['cgwyzd']
                                aa.OuterLength1 = item['OuterLength']
                                aa.OuterWidth1 = item['OuterWidth']
                                aa.OuterHeight1 = item['OuterHeight']
                                aa.OuterGrossWeight1 = item['OuterGrossWeight']
                                aa.OuterNetWeight1 = item['OuterNetWeight']
                                aa.OuterVolume1 = item['OuterVolume']
                                aa.Volume1 = item['Volume']
                                aa.GrossWeight1 = item['GrossWeight']
                                aa.ywpath = ywypath
                                aa.cgpath = cgypath
                                aa.zwmc = item['zwmc']
                    
                   
                                aa.UserID = '有'
                                aa.ReturnCartonQty2 = 0
                                aa.kcwyzd = kcwyzd
                                aa.sfyh = item['sfyh']
                                aa.ywbm = ywbm
                                aa.wyzdz = wyzdzb
                                aa.khmc = khmc
                                messages1.append(aa) 
                    
                       
                        if messages or messages1:
                           s.add_all(messages)
                           s.add_all(messages1)
                        s.commit()
                        
                        
            
            lsql ='update storage set zt ="已入库",sfjc="是" where rid=:rid '
            mdsql = run_sql(lsql, {"rid": receipt_rid})
            
            return json_result(1, data=result, msg='success')
            
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
        
        
        


@any_route('/api/saier/warehouse_receipt/historical/instockchange', methods=['POST', 'GET'])
@require_token
async def view_saier_warehouse_receipt_historical_instockchange(request):
    user = request.current_user
    JSONRes = await request.json()
    s = Session()
    try:
        # 1. 解析前端传入参数
        purchase_order_no = JSONRes.get('PurchaseOrderNo','')  # 采购单号
        receipt_rid = JSONRes.get('rid','')                    # 当前入库单rid (用于排除自身)
     
        detail_view_data = JSONRes.get('detail_view_data','') 
        zyh1 = JSONRes.get("zyh1", "")
        zyh =  JSONRes.get("zyh", "")
        ywry = JSONRes.get("ywry", "")
        name = JSONRes.get("name", "")
        cgy = JSONRes.get("cgy", "")
        ItemsData = JSONRes.get("ItemsData", "")
        rkrq = JSONRes.get("rkrq", "")
        rksj = JSONRes.get("rksj", "")
        jcrq = JSONRes.get("jcrq", "")
        sdry = JSONRes.get("sdry", "")
        wxht = JSONRes.get("wxht", "")
        gsmc = JSONRes.get("gsmc", "")
        ywy = JSONRes.get("ywy", "")
        cght = JSONRes.get("cght", "")
        csmc = JSONRes.get("csmc", "")
        cgy = JSONRes.get("cgy", "")
        lhy = JSONRes.get("lhy", "")
        ckmc = JSONRes.get("ckmc", "")
        jcdh = JSONRes.get("jcdh", "")
        sfjc = JSONRes.get("sfjc", "")
            
        gdry = JSONRes.get("gdyr", "")
        yzrq = JSONRes.get("yzrq", "")
        rkdd = JSONRes.get("rkdd", "")
        username = JSONRes.get("username", "")
        uid = JSONRes.get("uid", "")
        wyzdzb = JSONRes.get("wyzdzb", "")  
        khmc = JSONRes.get("khmc", "")
        
        ggxx_list = []
        ywypath = ''
        cgypath =''
        wyzd = ''
        ywbm = ''
        
        # 存储有问题的产品
        error_items = []
        has_qty_error = False
        has_contract_error = False
        error_messages = []
        
        for item in detail_view_data:
            cpbh = item['ItemNo']  # 产品编号
            dqrkxs = float(item.get('CartonQty', 0))  # 当前入库箱数
            zpxs = float(item.get('ckxs', 0))  # 出库箱数/赠品箱数
            
            #合同总箱数
            sql = 'select sum(b.cgxs) as cgxs from cght a,cghtsheet b where a.rid = b.pid and a.hthm=:hthm and ((b.khhh=:khhh and ifnull(b.khhh, "")<>"") or (b.bjhh=:bjhh and ifnull(b.bjhh, "")<>""))'
            amsql = run_sql(sql, {'hthm': purchase_order_no, 'khhh': cpbh, 'bjhh': cpbh})
            contract_total = 0
            if len(amsql) > 0:
                contract_total = amsql[0]['cgxs'] or 0 
                
            # 历史入库箱数（不含当前入库单）
            asql = 'SELECT SUM(b.CartonQty) as total_qty FROM storage a INNER JOIN storageline b ON a.rid = b.pid WHERE a.PurchaseOrderNo =:PurchaseOrderNo AND b.ItemNo =:ItemNo AND a.rid <> :rid'
            aamsql = run_sql(asql, {'PurchaseOrderNo': purchase_order_no, 'ItemNo': cpbh, 'rid': receipt_rid})
            historical_qty = 0
            if len(aamsql) > 0:
                historical_qty = aamsql[0]['total_qty'] or 0
                
            # 计算差值：合同总箱数 - (当前入库箱数 + 历史入库箱数)
            cs = contract_total - (dqrkxs + historical_qty)
            
            # 验证1：实际箱数必须大于等于出库箱数
            is_qty_valid = dqrkxs >= zpxs
            
            # 验证2：不能超出合同数量
            is_contract_valid = cs >= 0
            
            # 如果有错误，记录该产品
            if not is_qty_valid or not is_contract_valid:
                error_type = None
                if not is_qty_valid and not is_contract_valid:
                    error_type = 'BOTH'
                    error_messages.append(f'产品{cpbh}：实际箱数小于出库箱数且累计实际进仓数大于合同箱数！')
                elif not is_qty_valid:
                    error_type = 'QTY_ERROR'
                    has_qty_error = True
                    error_messages.append(f'产品{cpbh}：实际箱数小于出库箱数！')
                elif not is_contract_valid:
                    error_type = 'CONTRACT_ERROR'
                    has_contract_error = True
                    error_messages.append(f'产品{cpbh}：累计实际进仓数大于合同箱数！')
                
                error_items.append({
                    'rid': item['rid'],
                    'ErrorType': error_type
                })
        
        # 确定整体错误类型
        overall_error_type = 'SUCCESS'
        if has_qty_error and has_contract_error:
            overall_error_type = 'BOTH'
        elif has_qty_error:
            overall_error_type = 'QTY_ERROR'
        elif has_contract_error:
            overall_error_type = 'CONTRACT_ERROR'
        elif len(error_items) > 0:
            # 如果有BOTH类型的错误
            overall_error_type = 'BOTH'
        
        # 返回验证结果
        if len(error_items) > 0:
            return json_result(2, '; '.join(error_messages), {
                'errorItems': error_items,  # 有问题的产品列表
                'errorType': overall_error_type  # 整体错误类型
            })
        else:
            #执行入库操作
               
            result = {
                'zyh': '',
                'ywbm': '',
                'path': '',
                'ggxx':'',
                'oShipmentsCostsDetail':[]
                }
            # #获取作业号
            # if (zyh=='自动编号' or zyh==''):
            #     if (zyh1):
            #         result['zyh']  = get_storagezyh(zyh1)
            #         msql = 'update  storage set zyh=:zyh where rid=:rid'
            #         dassqml = run_sql(msql, {"zyh": result['zyh'], "rid": receipt_rid})
            #获取业务部门  
            if (ywry):
                ywbm = get_storageywbm(ywry)
        
            #获取仓库管理员path 因为需要postion。条件 所以不能用get_path_if_exists
            if (name):
                result['path'] = get_storageckpath(name)
            #获取业务员path
            if (ywry):
                ywypath = get_path_if_exists(ywry)
            #获取采购员path
            if (cgy):
                cgypath = get_path_if_exists(cgy)
            print('pathdakljdaskldjsakdjaskldjaskldjaslkdjsalkdjaskldjs')  
            print(name)  
            print(result['path'])    
            if (result['path']):  
                hh  =  0
                messages=[]
                messages1=[]
                for i in range(len(ItemsData)):
                    item = ItemsData[i]
                    hh = hh + 1
                    errors = [] 
      
                     
                    if (item['CartonQty1'] >0):
                        if (item['CartonQty'] >0):
                            ssql ='select * from inventorydetail where wyzd=:wyzd '
                            jsql = run_sql(ssql, {"wyzd": item['wyzd']})
                            print(f'查询sql内容如下------------------------------------------------------------------------{jsql}')
                            print(len(jsql))
                            if len(jsql) > 0:
         
                                s.query(inventorydetail).filter(
                                and_(
                                    inventorydetail.wyzd == item['wyzd'],
                                    inventorydetail.StorageDate == rkrq,
                                    inventorydetail.StorageTime == rksj
                                )
                                ).update({
                                    
                                    'mtime': datetime.now(),
                                    'SNID': jcdh,
                                    'Exporter': gsmc,
                                    'gdry': gdry,
                                    'Salesman': ywy,
                                    'PurchasingAgent': cgy,
                                    'PurchaseOrderNo': cght,
                                    'SupplierShortName': csmc,
                                    'ItemNo':  item['ItemNo'],
                                    'zwmc':  item['zwmc'],
                                    'CartonQty': item['CartonQty1'],
                                    'InCartonQty':  item['CartonQty'],
                  
                                    'OuterLength':  item['ckzd'],
                                    'OuterWidth': item['ckkd'],
                                    'OuterHeight':  item['ckgd'],
                                    'OuterVolume':  item['cktj'],
                                    'Volume':  item['ckztj'],
                                    'OuterGrossWeight':  item['ckmz'],
                                    'OuterNetWeight':  item['ckjz'],
                                    'GrossWeight':  item['ckzmz'],
                                    'WarehousePosition': item['WarehousePosition'],
                                    'Collator': lhy,
                                    'LotNumber': item['LotNumber'],
                                    'SalesOrderNo': wxht,
                                    'WarehouseName': ckmc,
                                    'Operator': sdry,
                                    'rkdd': rkdd,
                                    'Memo':  item['Memo'],
                                    'jcf':  item['jcf'],
                                    "PalletQty":  item['PalletQty'],
            
             
                                    'sfyh':  item['sfyh'],
                                    'wxwyzd': item['wxwyzd'],
                                    'cgwyzd': item['cgwyzd'],
                                    'OuterLength1': item['OuterLength'],
                                    'OuterWidth1': item['OuterWidth'],
                                    'OuterHeight1': item['OuterHeight'],
                                    'OuterGrossWeight1': item['OuterGrossWeight'],
                                    'OuterNetWeight1': item['OuterNetWeight'],
                                    'OuterVolume1': item['OuterVolume'],
                                    'Volume1':  item['Volume'],
                                    'GrossWeight1': item['GrossWeight'],
                                    'ywpath': ywypath,
                                    'cgpath': cgypath
                    })
                                
                    
                        s.commit()
                        

            return json_result(1, data=result, msg='success')
            
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
        
        
        
        
        