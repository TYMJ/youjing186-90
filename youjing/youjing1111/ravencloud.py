from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time
import json,os
from .__default__ import get_user_path, user_task_new

from datetime import datetime  # 确保有这行

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
# #获取path 
# def get_storagepath(name):
#     path = ''
#     org = get_user_path(name)
#     path = org.get('path','')
#     return path[:100] 
def get_storagepath(name):
    if not name:
        return ''
    path = ''
    org = get_user_path(name)
    if org is None or not isinstance(org, dict):
        return ''
    path = org.get('path', '')
    return path[:100] if path else ''

def get_path_if_exists(value):
    """如果值存在则获取存储路径，否则返回空字符串"""
    return get_storagepath(value) if value else ''
#获取仓库path 
def get_storageckpath(name):
    if not name:
            return ''
    path = ''
    org = get_user_path(name, " and ((position like '%仓库操作%'))")
    if org is None or not isinstance(org, dict):
        return '没有'
    path = org.get('path', '')
    return path[:100] if path else '没有'



         
@any_route('/api/Ravencloud/storagezyh', methods=['POST','GET']) 
@require_token
async def fnview_storagezyhu(request):
    try:
        JSONRes = await request.json()
        s = Session()
        try:
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
            #获取业务部门  
            if (ywry):
                ywbm = get_storageywbm(ywry)
        
            #获取仓库管理员path 因为需要postion。条件 所以不能用get_path_if_exists
            if (name):
                print('dasjkhdasjdhasjdhsajdhsakjdhakhdasjhdj')
                print(get_storageckpath(name))
                result['path'] = get_storageckpath(name)
            #获取业务员path
            if (ywry):
                ywypath = get_path_if_exists(ywry)
            #获取采购员path
            if (cgy):
                cgypath = get_path_if_exists(cgy)
                
            if (result['path']):  
                hh  =  0
                messages=[]
                messages1=[]
                for i in range(len(ItemsData)):
                    item = ItemsData[i]
                    hh = hh + 1
                    errors = [] 
                    if (item.get('ckzd') or 0) > 100:
                        errors.append('仓库长度')
                    if (item.get('ckkd') or 0) > 100:
                        errors.append('仓库宽度')
                    if (item.get('ckgd') or 0) > 100:
                        errors.append('仓库高度')     
                    if (item.get('ckmz') or 0 > 10):
                        errors.append('仓库毛重')
                    if (item.get('ckjz') or 0 > 10):
                        errors.append('仓库净重')
                    if errors:
                       ggxx_list.append(f'请注意第{hh}条记录的{", ".join(errors)}，大于100')    
                   
                    oTempData={}
                        
                    oTempData['khmc']=khmc
                    oTempData['StorageDate'] = rkrq
                    oTempData['StorageTime'] = rksj
                    oTempData['jcrqc'] = jcrq
                    oTempData['Operatorc'] = sdry
                    oTempData['SalesOrderNoc'] = wxht
                    oTempData['Exporterc'] = gsmc
                    oTempData['Salesmanc'] = ywy
                    oTempData['PurchaseOrderNoc'] = cght
                    oTempData['SupplierShortNamec'] = csmc
                    oTempData['PurchasingAgentc'] = cgy

                    oTempData['Collatorc'] = lhy
                    oTempData['WarehouseNamec'] = ckmc
                    oTempData['SNIDc'] = jcdh

                    oTempData['sfjcc'] = sfjc
                    oTempData['gdryc'] = gdry
                    oTempData['yzrqc'] = yzrq
                    oTempData['rkddc'] = rkdd
                    oTempData['ywpath'] = ywypath
                    oTempData['cgpath'] = cgypath
                    oTempData["rid"] = item['rid']
                    # print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd-wyzd')
                    # print(item['wyzd'])
                
                    
                    if (item['wyzd']=='' or item['wyzd'] is None):
                        print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd')
                        wyzd =jcdh + rkrq + username + datetime.now().strftime('%Y-%m-%d %H:%M:%S')+ str(hh); # ✅ 生成唯一值
                        print(wyzd)
                        oTempData['wyzd'] = wyzd
                    else:
                        print('dasdjsalkdj-daskldljsakldjaskldjsakdjaskdjaskldajslkdjaslkdjaslkdjaslkdjasldjasdasjdlasjdlsdjsalkd=======')
                        wyzd = item['wyzd']
                        oTempData['wyzd'] = item['wyzd']
                 
                    
                    result['oShipmentsCostsDetail'].append(oTempData)   
                    #保存不处理插入库存的操作 通过按钮进仓进行处理
                     
                    # if (item['CartonQty1'] >0):
                    #     if (item['CartonQty'] >0):
                    #         ssql ='select * from inventorydetail where wyzd=:wyzd '
                    #         jsql = run_sql(ssql, {"wyzd": wyzd})
                    #         print(f'查询sql内容如下------------------------------------------------------------------------{jsql}')
                    #         print(len(jsql))
                    #         if len(jsql) <= 0:
                             
                    #             kcwyzd = wyzd +rkrq+rksj
                    #             for i3 in range(1, 3): 
                    #                 if i3 == 1:
                    #                    gdry1 = gdry
                    #                 else:
                    #                    gdry1 = ywy
                               
                                # if (gdry1 != username):
                                #     print('djashdksajdhaskjdh-dsakjdhksa-dhaskjdhsakld-daskjdhsakjdhsjkah')
                                #     print(username)
                                #     print(jcdh)
                                #     print(item['ItemNo'])
                                #     print(str(item['CartonQty']))
                                #     print(csmc)
                                #     print(jcrq)
                         
                                #         #插入消息查看
                                #     mm=xxck()
                                #     mm.rid=get_uuid()
                                #     mm.uid=uid
                                #     mm.ctime=datetime.now()
                                #     mm.mtime=datetime.now()
                                #     mm.fsrq =  datetime.now().strftime('%Y-%m-%d'),
                                #     mm.fsr = username,
                                #     mm.xxly = '已进仓通知',
                                #     mm.xxnr = username+'的进仓单号'+jcdh+'产品:'+item['ItemNo']+'箱数'+str(item['CartonQty'])+'工厂'+csmc+'的进仓日期:'+ jcrq+'已进仓请查看,请查看,日期:'+ datetime.now().strftime('%Y-%m-%d'),
                                #     mm.jsr = gdry1
                                #     messages.append(mm)
                                    
                                # aa = inventorydetail()      
                                # aa.rid=get_uuid()
                                # aa.uid=uid
                                # aa.ctime=datetime.now()
                                # aa.mtime=datetime.now()
                                # #这个字段没有 aa.sys_path='ravencloud'
                                # aa.SNID = jcdh
                                # aa.Exporter = gsmc
                                # aa.gdry = gdry
                                # aa.Salesman = ywy
                                # aa.PurchasingAgent = cgy
                                # aa.PurchaseOrderNo = cght
                                # aa.SupplierShortName = csmc
                                # aa.ItemNo = item['ItemNo']
                                # aa.PalletQty = item['PalletQty']
                                # aa.CartonQty = item['CartonQty1']
                                # aa.InCartonQty = item['CartonQty']     
                                # if int(item['CartonQty'] or 0) - int(item['CartonQty1'] or 0) > 0:
                                #    aa.OutCartonQty = int(item['CartonQty'] or 0) - int(item['CartonQty1'] or 0)
                                # else:
                                #    aa.OutCartonQty = 0
                  
                                # aa.ReturnCartonQty = item['ReturnCartonQty']
                                # aa.thyy = item['thyy']
               
      
                                # aa.OuterLength = item['ckzd']
                                # aa.OuterWidth = item['ckkd']
                                # aa.OuterHeight = item['ckgd']
                                # aa.OuterVolume = item['cktj']
                                # aa.Volume = item['ckztj']
                                # aa.OuterGrossWeight = item['ckmz']
                                # aa.GrossWeight = item['ckzmz']
                                # aa.OuterNetWeight = item['ckjz']
                                # aa.WarehousePosition = item['WarehousePosition']
                    
                                # aa.Collator = lhy
                                # aa.StorageDate = item['StorageDate']
                                # aa.StorageTime = item['StorageTime']
                                # aa.LotNumber = item['LotNumber']
                                # aa.SalesOrderNo = wxht
                                # aa.WarehouseName = ckmc
                                # aa.Operator = sdry
                                # aa.rkdd = rkdd
                                # aa.wyzd = wyzd
                                # aa.Memo = item['Memo']
                                # aa.jcf = item['jcf']
                                # aa.PalletQty =  item['PalletQty'],
                                # aa.wxwyzd = item['wxwyzd']
                                # aa.cgwyzd = item['cgwyzd']
                                # aa.OuterLength1 = item['OuterLength']
                                # aa.OuterWidth1 = item['OuterWidth']
                                # aa.OuterHeight1 = item['OuterHeight']
                                # aa.OuterGrossWeight1 = item['OuterGrossWeight']
                                # aa.OuterNetWeight1 = item['OuterNetWeight']
                                # aa.OuterVolume1 = item['OuterVolume']
                                # aa.Volume1 = item['Volume']
                                # aa.GrossWeight1 = item['GrossWeight']
                                # aa.ywpath = ywypath
                                # aa.cgpath = cgypath
                                # aa.zwmc = item['zwmc']
                    
                   
                                # aa.UserID = '有'
                                # aa.ReturnCartonQty2 = 0
                                # aa.kcwyzd = kcwyzd
                                # aa.sfyh = item['sfyh']
                                # aa.ywbm = ywbm
                                # aa.wyzdz = wyzdzb
                                # aa.khmc = khmc
                                # messages1.append(aa) 
                            # else:   
                            #     print(f'sdsdsad-dsadjkhsakdjhsakjdhsakjdsa-dsakjkdhsahddsajhdsaj')
                            #     print(wyzd)
                            #     print(rkrq)
                            #     print(rksj)
                            #     s.query(inventorydetail).filter(
                            #     and_(
                            #         inventorydetail.wyzd == wyzd,
                            #         inventorydetail.StorageDate == rkrq,
                                #     inventorydetail.StorageTime == rksj
                                # )
                                # ).update({
                                    
                                #     'mtime': datetime.now(),
                                #     'SNID': jcdh,
                                #     'Exporter': gsmc,
                                #     'gdry': gdry,
                                #     'Salesman': ywy,
                                #     'PurchasingAgent': cgy,
                                #     'PurchaseOrderNo': cght,
                                #     'SupplierShortName': csmc,
                                #     'ItemNo':  item['ItemNo'],
                                #     'zwmc':  item['zwmc'],
                                #     'CartonQty': item['CartonQty1'],
                                #     'InCartonQty':  item['CartonQty'],
                  
                                #     'OuterLength':  item['ckzd'],
                                #     'OuterWidth': item['ckkd'],
                                #     'OuterHeight':  item['ckgd'],
                                #     'OuterVolume':  item['cktj'],
                                #     'Volume':  item['ckztj'],
                                #     'OuterGrossWeight':  item['ckmz'],
                                #     'OuterNetWeight':  item['ckjz'],
                                #     'GrossWeight':  item['ckzmz'],
                                #     'WarehousePosition': item['WarehousePosition'],
                                #     'Collator': lhy,
                    #                 'LotNumber': item['LotNumber'],
                    #                 'SalesOrderNo': wxht,
                    #                 'WarehouseName': ckmc,
                    #                 'Operator': sdry,
                    #                 'rkdd': rkdd,
                    #                 'Memo':  item['Memo'],
                    #                 'jcf':  item['jcf'],
                    #                 "PalletQty":  item['PalletQty'],
            
             
                    #                 'sfyh':  item['sfyh'],
                    #                 'wxwyzd': item['wxwyzd'],
                    #                 'cgwyzd': item['cgwyzd'],
                    #                 'OuterLength1': item['OuterLength'],
                    #                 'OuterWidth1': item['OuterWidth'],
                    #                 'OuterHeight1': item['OuterHeight'],
                    #                 'OuterGrossWeight1': item['OuterGrossWeight'],
                    #                 'OuterNetWeight1': item['OuterNetWeight'],
                    #                 'OuterVolume1': item['OuterVolume'],
                    #                 'Volume1':  item['Volume'],
                    #                 'GrossWeight1': item['GrossWeight'],
                    #                 'ywpath': ywypath,
                    #                 'cgpath': cgypath
                    # })
                       
                        # if messages or messages1:
                        #    s.add_all(messages)
                        #    s.add_all(messages1)
                        # s.commit()
                    
                    
                        
                    # ✅ 用换行符连接所有错误（前端显示时换行）
                result['ggxx'] = '\n'.join(ggxx_list) if ggxx_list else ''        
                        
               

          
                return json_result(code=1,data=result, msg='success')    
        except:
              s.rollback()   
              logger.error(trace_error())
              return json_result(-1, trace_error())
        finally:
            s.close()

    except :
         return json_result(code=-1, msg=trace_error()) 






@any_route('/api/Ravencloud/sys_record_lock', methods=['POST','GET']) 
@require_token
async def fnview_sys_record_lock(request):
    user = request.current_user
    try:
        JSONRes = await request.json()
        s = Session()
    
        rid = JSONRes.get("rid")
        name = user.username
        wyzd = JSONRes.get("wyzd")
        rkrq = JSONRes.get("rkrq")
        rksj = JSONRes.get("rksj")
        zxpd = JSONRes.get("zxpd")
        ckmc = JSONRes.get("ckmc")
        
        sb = '1' 
        ckyh = 0
        ckpd =''
            
        # asql = 'select position from sys_user where username=:name '    
        org = get_user_path(name)
        postion = org.get('position', '') if org else ''
        # tmpcom = run_sql(asql, {"name": name})
        # if len(tmpcom) > 0:
        if '仓库验货' in postion:
            ckyh = 1
        if '仓库操作' in postion:
            ckyh = 2 
        # if '仓库' in postion:
        #     ckpd = '1'
        return json_result(code=1,data={"ckyh":ckyh,"ckpd":ckpd}, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
     
     
@any_route('/api/Ravencloud/thsj', methods=['POST','GET']) 
@require_token
async def fnview_thsj(request):
   
    try:
        JSONRes = await request.json()
        s = Session()
    
        wyzd = JSONRes.get("wyzd")
        rkrq = JSONRes.get("rkrq")
        rksj = JSONRes.get("rksj")
        OutCartonQty = 0
        ReturnCartonQty2=0
        sl = 0
       
        sSql = """
            select * from inventorydetail where (wyzd=:wyzd) and (StorageDate=:StorageDate) and (StorageTime=:StorageTime) limit 1
           """
        mmsql = run_sql(sSql, {"wyzd": wyzd, "StorageDate": rkrq, "StorageTime": rksj})
        if len(mmsql) > 0:
            OutCartonQty = mmsql[0]['OutCartonQty']
            ReturnCartonQty2 = mmsql[0]['ReturnCartonQty2']
            sl = OutCartonQty + ReturnCartonQty2
        
          
 
        return json_result(code=1,data=sl, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
          
@any_route('/api/RavenCloud/Update_xxck', methods=['POST','GET']) 
@require_token
async def fnview_Update_xxck(request):
  
    try:
        JSONRes = await request.json()
        s = Session()
    
        jcdh = JSONRes.get("jcdh","")
        jcrq = JSONRes.get("jcrq","")
        gdry = JSONRes.get("gdry","")
        ywry = JSONRes.get("ywry","")
        sjjc = JSONRes.get("sjjc","")  
        sfjc= JSONRes.get("sfjc","")
        name = JSONRes.get("name","")
        hth = JSONRes.get("hth","")
        xs = JSONRes.get("xs","")
        gcmc = JSONRes.get("gcmc","")
        hr = JSONRes.get("nr","")
        cpbh = JSONRes.get("cpbh","")
        uid = JSONRes.get("uid","")
  
        # 遍历两个角色
        for i3 in range(1, 3): 
            if i3 == 1:
                gdry1 = gdry
            else:
                gdry1 = ywry
        if  gdry!=name:       
        #插入消息查看
            mm=xxck()
            mm.rid=get_uuid()
            mm.uid=uid
            mm.ctime=datetime.now()
            mm.mtime=datetime.now()
            mm.sys_owner = gdry1
            mm.fsrq =  datetime.now().strftime('%Y-%m-%d'),
            mm.fsr = name,
            mm.xxly = '退货通知',
            mm.cght=hth,
            mm.xxnr = name+'的进仓单号'+jcdh+'产品:'+cpbh+'新增退货箱数'+str(xs)+'工厂'+gcmc+',退货原因:'+ hr+'请查看,日期:'+ datetime.now().strftime('%Y-%m-%d'),
            mm.jsr = gdry1
     
            s.add(mm)
            s.commit()
          
 
        return json_result(code=1, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
     
          
@any_route('/api/RavenCloud/Update_SJXS', methods=['POST','GET']) 
@require_token
async def fnview_Update_SJXS(request):
    try:
        JSONRes = await request.json()
        s = Session()
    
        rkrq = JSONRes.get("rkrq","")
        rksj = JSONRes.get("rksj","")
        sjxs = JSONRes.get("sjxs","")
        zcxs = JSONRes.get("zpxs","")
        zpxs = JSONRes.get("zpxs","")
        cgwyzd = JSONRes.get("cgwyzd","")
        cght = JSONRes.get("cght","")
        wyzd = JSONRes.get("wyzd","")
        ckmc = JSONRes.get("ckmc","")
        cpbh = JSONRes.get("cpbh","")
        thxs=   JSONRes.get("thxs","")
        sb=''
        i = 0
        zcxs = 0
        sjxsz = 0
        ckxs= 0 
        pd =''
        if rkrq!='' and rksj!='' and (sjxs>0 or zcxs>0): 
            pd = 'n'
            if cgwyzd!='':
                sSql = """
                   select htzxs from cggdsheet where (wyzd=:wyzd) and  (hthm=:hthm) limit 1
                   """
                msql=run_sql(sSql, {"wyzd": cgwyzd, "hthm": cght})   
                if len(msql) > 0:
                    htzxs = msql[0]['htzxs']
                else:
                    htzxs = 0    
                if wyzd!='' :  
                    asql='''
                    select sum(CartonQty-ReturnCartonQty) as CartonQty3,sum(zpxs) as zpxs1 from storageline where 
                    (PurchaseOrderNoc=:PurchaseOrderNoc) and (cgwyzd=:cgwyzd) and (wyzd<>:wyzd) and (wyzd<>"") and (wyzd is not null) and (WarehouseNamec=:WarehouseNamec);
                    '''     
                    amsql=run_sql(asql, {"PurchaseOrderNoc": cght, "cgwyzd": cgwyzd, "wyzd": wyzd,"WarehouseNamec": ckmc})   
                else:
                    asql='''
                   select sum(CartonQty-ReturnCartonQty) as CartonQty3,sum(zpxs) as zpxs1 from storageline where 
                  (PurchaseOrderNoc=:PurchaseOrderNoc) and (cgwyzd=:cgwyzd)  and (wyzd<>"") and (wyzd is not null) and (WarehouseNamec=:WarehouseNamec)

                    '''
                    amsql=run_sql(asql, {"PurchaseOrderNoc": cght, "cgwyzd": cgwyzd,"WarehouseNamec": ckmc})   
                if len(amsql) > 0:
                    CartonQty3 = (float(amsql[0]['CartonQty3'] or 0) + float(sjxs or 0) - float(zpxs or 0) - float(amsql[0]['zpxs1'] or 0))
                else:
                    CartonQty3 = 0
            else:
                sSql='''
                
                  select htzxs from cggdsheet where (cpbh=:cpbh) and (hthm=:hthm)
                '''
                msql = run_sql(sSql, {"cpbh": cpbh, "hthm": cght})
                if len(msql) > 0:
                    htzxs =float(msql[0]['htzxs'] or 0)
                else:
                    htzxs = 0    
                    
                if wyzd!='' :  
                    asql='''
                    select sum(CartonQty-ReturnCartonQty) as CartonQty3,sum(zpxs) as zpxs1 from storageline where
                     (ItemNo=:cpbh) and (PurchaseOrderNoc=:hthm) and (wyzd<>:wyzd) and (wyzd<>"") and (wyzd is not null) and (WarehouseNamec=:WarehouseNamec)
                    '''    
                    amsql = run_sql(asql, {"cpbh": cpbh, "hthm": cght,"wyzd":wyzd,"WarehouseNamec": ckmc})
                else:
                    asql='''
                    select sum(CartonQty-ReturnCartonQty) as CartonQty3,sum(zpxs) as zpxs1 from storageline where (ItemNo=:cpbh)
                      and (PurchaseOrderNoc=:hthm)  and (wyzd<>"") and (wyzd is not null) and (WarehouseNamec=:WarehouseNamec
                    '''
                    amsql = run_sql(asql, {"cpbh": cpbh, "hthm": cght,"WarehouseNamec": ckmc})
                if len(amsql) > 0:
                    CartonQty = (float(amsql[0]['CartonQty3'] or 0) + float(sjxs or 0) - float(zpxs or 0) - float(amsql[0]['zpxs1'] or 0)-float(thxs or 0))    
                else:
                    CartonQty = 0
                if  CartonQty==0: 
                    CartonQty = float(sjxs or 0)
                if  (htzxs > 0) and (CartonQty > htzxs) :
                    sb='1'
                if sb!='1':
                    bsql='''
                    select sum(OutCartonQty1) as number1 from deliveryline where ((StorageDate=:StorageDate) and 
                    (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (wyzd=:wyzd) and (PurchaseOrderNo=:PurchaseOrderNo))
                    
                    '''
                    bmsql=run_sql(bsql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "wyzd": wyzd, "PurchaseOrderNo": cght})
                    if len(bmsql) > 0:
                        ckxs = float(bmsql[0]['number1'] or 0) 
                    else:
                        ckxs = 0
                    if float(sjxs or 0)>=ckxs:   
                        zcxs =  float(sjxs or 0) - ckxs
                        csql = '''
                        update deliveryline set InCartonQty=:InCartonQty,CartonQty=:CartonQty where ((StorageDate=:StorageDate) 
                        and (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (wyzd=:wyzd) and (PurchaseOrderNo=:PurchaseOrderNo))
                        '''
                        cmsql = run_sql(csql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "wyzd": wyzd, "PurchaseOrderNo": cght,"InCartonQty": sjxs,"CartonQty": sjxs})
                       
               
                    else:
                        zcxs=0
                        i = 1
                    if zcxs == 0:
                        dsql = 'delete from inventorydetail where (StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (wyzd=:wyzd)'
                        dmsql = run_sql(dsql, {"StorageDate": rkrq, "StorageTime": rksj, "wyzd": wyzd})
                    if (i==1):
                        sjxsz=ckxs    
        else:
            
            if float(sjxs or 0)==0 and  wyzd!='':   
                pd = 'nn'
                asql =''' select sum(OutCartonQty1) as number1 from deliveryline where 
                     ((StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (wyzd=:wyzd) and (PurchaseOrderNo=:PurchaseOrderNo))
                '''    
                amsql = run_sql(asql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "wyzd": wyzd, "PurchaseOrderNo": cght})
                if len(amsql) > 0:
                    ckxs = float(amsql[0]['number1'] or 0) 
                else:
                    ckxs = 0
                if ckxs>0:
                   a ='sdsadsasa'
                else:
                    bsql='''
                    delete from inventorydetail where (StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (wyzd=:wyzd)
                    '''
                    bmsql = run_sql(bsql, {"StorageDate": rkrq, "StorageTime": rksj, "wyzd": wyzd})
                       
                   
                           
                    
                
                    
                
                   
                   
    
          
 
        return json_result(code=1,data={'ckxs':ckxs,'sb':sb,'pd':pd,'i':i}, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
          
@any_route('/api/RavenCloud/delete_inventorydetail', methods=['POST','GET']) 
@require_token
async def fnview_delete_inventorydetail(request):
    try:
        j = await request.json()
        s = Session()
        StorageDate = j.get("StorageDate","")
        StorageTime = j.get("StorageTime","")
        wyzd = j.get("wyzd","")
        rid  = j.get("rid","")
        qty = s.query(func.sum(func.ifnull(deliveryline.OutCartonQty1, 0))).filter(deliveryline.wyzd == wyzd).scalar()
        if qty and qty > 0:
            return json_result(-1, f"该入库单产品已有出库记录,出货箱数为{qty}，无法删除")       
        # 删除对应的库存记录
        s.query(storageline).filter(storageline.rid == rid).delete(synchronize_session=False)
        s.query(inventorydetail).filter(inventorydetail.wyzd == wyzd, inventorydetail.StorageDate == StorageDate, inventorydetail.StorageTime == StorageTime).delete(synchronize_session=False)
        # sSql = 'delete from inventorydetail where (StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (wyzd=:wyzd)'
        # mmsql= run_sql(sSql, {"StorageDate": StorageDate, "StorageTime": StorageTime, "wyzd": wyzd})
        s.commit()
        return json_result(code=1, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
     
     
     
#新增出库单     
@any_route('/api/Ravencloud/delivery_dh', methods=['POST','GET']) 
@require_token
async def fnview_delivery_dh(request):
    try:
        JSONRes = await request.json()
        s = Session()
    
        rid = JSONRes.get("rid","")
        ckdh = JSONRes.get("ckdh","")
  
    
       
        sSql = 'select rid from delivery where (rid<>:rid) and (ckdh=:ckdh)'
        mmsql= run_sql(sSql, {"rid": rid, "ckdh": ckdh})
        if len(mmsql) > 0:
            return json_result(code=1, msg='出库单号已存在')
        else:
            return json_result(code=2, msg='success')
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
@any_route('/api/Ravencloud/Select_wxht', methods=['POST','GET']) 
@require_token
async def fnview_Select_wxht(request):
    try:
        JSONRes = await request.json()
        s = Session()
    
        fphm = JSONRes.get("fphm","")
        sb = ''
   
        sSql = 'select order_id from wxht where (order_id=:order_id)'
        mmsql= run_sql(sSql, {"order_id": fphm})
        
        
        if len(mmsql) > 0:
            sb = '1'
        if sb=='':
            msql = 'select wxfp from chyjh where (wxfp=:wxfp)'
            mmsql = run_sql(msql, {"wxfp": fphm})
            if len(mmsql) > 0:
                sb = '1'
                
        return json_result(code=1,data = sb, msg='出库单号已存在')
      
    
       
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error()) 
    finally:
        s.close()
     
     
          
@any_route('/api/RavenCloud/delete_deliveryline', methods=['POST','GET']) 
@require_token
async def fnview_delete_deliveryline(request):
    try:
        JSONRes = await request.json()
        s = Session()
    
        ckzd = JSONRes.get("ckzd","")
        ckxs1 = JSONRes.get("ckxs","")
        ckxs=0
        sb = ''
   
        sSql = 'select OutCartonQty1 from deliveryline where wyzd1=:wyzd1'
        mmsql= run_sql(sSql, {"wyzd1": ckzd})
        
        
        if len(mmsql) > 0:
            ckxs = mmsql[0]['OutCartonQty1'] 
        else:
            ckxs = 0    
        if ckxs>0 or ckxs1>0:
            sb = '1'    
        else:
            sb= ''    
       
        return json_result(code=1,data = sb, msg='成功')
      
    
       
    except :
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close() 
 
     
     
@any_route('/api/ravencloud/check_ckzgfy', methods=['POST','GET']) 
@require_token
async def fnview_check_ckzgfy(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        sqdh = JSONRes.get("sqdh","")
        
        # 检查申请单号是否存在
        sSql = "SELECT * FROM ckzgfy WHERE sqdh=:sqdh"
        mmsql = run_sql(sSql, {"sqdh": sqdh})
        
        if len(mmsql) > 0:
            return json_result(code=1, data={"exists": True}, msg='success')
        else:
            return json_result(code=1, data={"exists": False}, msg='success')
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()


@any_route('/api/ravencloud/get_max_sqdh', methods=['POST','GET']) 
@require_token
async def fnview_get_max_sqdh(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        kpxh1 = JSONRes.get("kpxh1","")
        
        # 查询当天最大的申请单号
        sSql = """
            SELECT sqdh 
            FROM delivery 
            WHERE sqdh LIKE CONCAT('%', :kpxh1, '%') 
            ORDER BY sqdh DESC 
            LIMIT 1
        """
        mmsql = run_sql(sSql, {"kpxh1": kpxh1})
        
        if len(mmsql) > 0:
            max_sqdh = mmsql[0]['sqdh']
            return json_result(code=1, data={"max_sqdh": max_sqdh}, msg='success')
        else:
            return json_result(code=1, data={"max_sqdh": ""}, msg='success')
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:    
        s.close()
    
    
@any_route('/api/Ravencloud/Select_ckfy', methods=['POST','GET']) 
@require_token
async def fnview_Select_ckfy(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        ckmc = JSONRes.get("ckmc","")
        days = JSONRes.get("days","")
        ckrq = JSONRes.get("ckrq","")
        tj= JSONRes.get("tj","")
       
        iq = 0
        ckfy = 0
        
        # 查询当天最大的申请单号
        sSql = """
            select sz1,sz2,sz,sz3,sz4,bz2,bz3 from cyzglsheet where 
            (xm=:name) and (zm="仓库费用表") and (sz1<=:sz1z)
          and (sz2>=:sz1z1) and (bz2>=:bz2) and (bz3<=:bz3)
        """
        mmsql = run_sql(sSql, {"name": ckmc, "sz1z": days, "sz1z1": days, "bz2": ckrq, "bz3": ckrq})
        
        if len(mmsql) > 0:
            iq = mmsql[0]['sz3']
            if iq<=days:
                ckfy = float(tj) * float(mmsql[0]['sz']) * float(days)
            else:
                ckfy = (float(tj)*float(mmsql[0]['sz'])*float(iq) )+(float(tj)*float(mmsql[0]['sz4'])*(float(days)-float(iq)))   
        return json_result(code=1, data=ckfy, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()   
    
@any_route('/api/Ravencloud/Thpd', methods=['POST','GET']) 
@require_token
async def fnview_Thpd(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        cght = JSONRes.get("cght","")
        cpbh = JSONRes.get("cpbh","")
        rkrq = JSONRes.get("rkrq","")
        rksj = JSONRes.get("rksj","")
        thxs = JSONRes.get("thxs","")
       
        iq = 0
        ckfy = 0
        rkxs = 0
        
        # 查询当天最大的申请单号
        sSql = """
          select CartonQty,ReturnCartonQty from storageline  where ((StorageDate=:StorageDate) and 
        (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (PurchaseOrderNoc=:PurchaseOrderNoc))
        """
        mmsql = run_sql(sSql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "PurchaseOrderNoc": cght})
        
        if len(mmsql) > 0:
            rkxs = mmsql[0]['CartonQty'] 
            if mmsql[0]['ReturnCartonQty'] == 0 and thxs>0:
                usql = '''
                update storageline set ReturnCartonQty=:ReturnCartonQty,ReturnCartonQty2=:ReturnCartonQty2 
               where ((StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (PurchaseOrderNoc=:PurchaseOrderNoc))
                '''
                umsql = run_sql(usql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "PurchaseOrderNoc": cght, "ReturnCartonQty": thxs, "ReturnCartonQty2": thxs})
            
        return json_result(code=1, data=rkxs, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:    
        s.close()
    
    
@any_route('/api/Ravencloud/choose_pd', methods=['POST','GET']) 
@require_token
async def fnview_choose_pd(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        cght = JSONRes.get("cght","")
        cpbh = JSONRes.get("cpbh","")
        rkrq = JSONRes.get("rkrq","")
        rksj = JSONRes.get("rksj","")
        wyzd1 = JSONRes.get("wyzd1","")
        i1 = 0
        if wyzd1 == '':
           asql ='''select sum(OutCartonQty1) as number1 from deliveryline  where ((StorageDate=:StorageDate)
           and (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (PurchaseOrderNo=:PurchaseOrderNo))'''
           amsql = run_sql(asql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "PurchaseOrderNo": cght})
        
        else:
            asql ='''select sum(OutCartonQty1) as number1 from deliveryline where
         ((StorageDate=:StorageDate) and (StorageTime=:StorageTime) and (ItemNo=:ItemNo) and (PurchaseOrderNo=:PurchaseOrderNo)) and (wyzd1<>:wyzd1)'''
            amsql = run_sql(asql, {"StorageDate": rkrq, "StorageTime": rksj, "ItemNo": cpbh, "PurchaseOrderNo": cght,"wyzd1": wyzd1})
            
        
       
        if len(amsql) > 0:
               i1 = amsql[0]['number1']
        else:
               i1 = 0
               
               
               
        return json_result(code=1, data=i1, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()
        
    
@any_route('/api/ravencloud/generate_ckzgfy', methods=['POST','GET'])
@require_token
async def fnview_generate_ckzgfy(request):
    """生成出库仓库费用记录"""
    try:
        JSONRes = await request.json()
        s = Session()
        
        user_name = JSONRes.get('userName', '')
        now = datetime.now()
        date_str = now.strftime('%Y-%m-%d')
        datetime_str = now.strftime('%Y-%m-%d %H:%M:%S')
        
        # 1. 获取用户position的第一个字符作为部门编码
        bm1 = ''
        sSql = "SELECT position FROM sys_user WHERE username = :name"
        mmsql = run_sql(sSql, {"name": 'zjnblh'})
        if len(mmsql) > 0 and mmsql[0]['position']:
            bm1 = mmsql[0]['position'][:1]
        
        # 2. 生成出库单号（如果为空）
        ckdh = JSONRes.get('ckdh', '')
        if not ckdh:
            kpxh1 = 'ck' + bm1 + now.strftime('%Y%m%d')
            sSql = "SELECT ckdh FROM delivery WHERE ckdh LIKE CONCAT('%', :kpxh1, '%') ORDER BY ckdh DESC LIMIT 1"
            mmsql = run_sql(sSql, {"kpxh1": kpxh1})
            if len(mmsql) > 0 and mmsql[0]['ckdh']:
                try:
                    seq = int(mmsql[0]['ckdh'][11:15]) + 1
                except:
                    seq = 1
            else:
                seq = 1
            ckdh = f"{kpxh1}{seq:04d}"
        
        # 3. 生成申请单号（如果为空）
        sqdh = JSONRes.get('sqdh', '')
        if not sqdh:
            kpxh1 = 'ck' + bm1 + now.strftime('%y%m%d')
            print('kpxh1----------',kpxh1)
            sSql = "SELECT sqdh FROM delivery WHERE sqdh LIKE CONCAT('%', :kpxh1, '%') ORDER BY sqdh DESC LIMIT 1"
            mmsql = run_sql(sSql, {"kpxh1": kpxh1})
            print('单号--------单号')
            if len(mmsql) > 0 and mmsql[0]['sqdh']:
                try:
                    seq = int(mmsql[0]['sqdh'][9:12]) + 1
                except:
                    seq = 1
            else:
                seq = 1
            sqdh = f"{kpxh1}{seq:03d}"
            
        print('dah;-------------dadadsdad-------------- ', sqdh)
        # 4. 检查是否已存在该申请单号的费用记录
        sSql = "SELECT rid as number FROM ckzgfy WHERE sqdh = :sqdh"
        mmsql = run_sql(sSql, {"sqdh": sqdh})
        if len(mmsql) > 0:
            return json_result(code=0, data={'conflict': True}, msg='申请单号已存在，请重新提交')
        
        # 5. 获取用户路径
        # path = ''
        # sSql = "SELECT path FROM sys_user WHERE username = :name"
        # mmsql = run_sql(sSql, {"name": user_name})
        # if len(mmsql) > 0 and mmsql[0]['path']:
        #     path = mmsql[0]['path'][:100]
        path = ''
        org = get_user_path(user_name)
        path = org.get('path','')
        path = path[:100] 
        
        # 6. 确定公司名称
        gsmc = '宁波优景进出口有限公司'
        wxfp = JSONRes.get('wxfp', '')
        khmc = JSONRes.get('khmc', '')
        if wxfp:
            if khmc and 'BEST PRICE LLC' in khmc:
                gsbm = wxfp[1:2] if len(wxfp) > 1 else ''
            else:
                gsbm = wxfp[0:1] if len(wxfp) > 0 else ''
            if gsbm:
                sSql = "SELECT gsmc FROM ywbdzb WHERE dyywzm = :dyywzm AND htbh = 'VC'"
                mmsql = run_sql(sSql, {"dyywzm": gsbm})
                if len(mmsql) > 0 and mmsql[0]['gsmc']:
                    gsmc = mmsql[0]['gsmc']
        
        # 7. 确定费用类型
        fylx = '装柜' if JSONRes.get('fylb',"") == '装卸费' else '其它'
        
        # 8. 插入ckzgfy主表
        insert_sql = """
            INSERT INTO ckzgfy (
                rid,uid, ctime, mtime,
                ckfy, gsmc, sfsh, sqrq, sqdh, ckdh, sqlx, fylb,
                WarehouseName, StuffingDate, zchm, TotalCartons, TotalVolumn,
                ContainerNo, SealNo, Salesman, ywbm, cph, yflx,
                zgfy, jcfy, gbf, yf, qtfy, fyhj, zggr, sqry,
                LoadingSupervi, zjjz, ckfybz, sfkp, wxfp, khmc,
                xgry, tjyw, ywsp, tjcw, cwzg, zgsp, fkrq, sjyr,
                ckxs, cyxs, cktj, cytj, tyb, fylx,wf_status
            ) VALUES (
                :rid,:uid, :sys_created, :sys_lastmodified,
                :ckfy, :gsmc, :sfsh, :sqrq, :sqdh, :ckdh, :sqlx, :fylb,
                :warehouseName, :stuffingDate, :zchm, :totalCartons, :totalVolumn,
                :containerNo, :sealNo, :salesman, :ywbm, :cph, :yflx,
                :zgfy, :jcfy, :gbf, :yf, :qtfy, :fyhj, :zggr, :sqry,
                :loadingSupervi, :zjjz, :ckfybz, :sfkp, :wxfp, :khmc,
                '', '', '待审批', '', '', '', Null, '',
                0, 0, 0, 0, :tyb, :fylx,:wf_status
            )
        """
        run_sql(insert_sql, {
            'rid':get_uuid(),
            'uid': JSONRes.get('uid', 0),

            'sys_created': datetime_str,
            'sys_lastmodified': datetime_str,
            'ckfy': JSONRes.get('ckfy', 0),
            'gsmc': gsmc,
            'sfsh': JSONRes.get('sfsh', ''),
            'sqrq': date_str,
            'sqdh': sqdh,
            'ckdh': ckdh,
            'sqlx': JSONRes.get('sqlx', ''),
            'fylb': JSONRes.get('fylb', ''),
            'warehouseName': JSONRes.get('warehouseName', ''),
            'stuffingDate': JSONRes.get('stuffingDate') or None,
            'zchm': JSONRes.get('zchm', ''),
            'totalCartons': JSONRes.get('totalCartons', 0),
            'totalVolumn': JSONRes.get('totalVolumn', 0),
            'containerNo': JSONRes.get('containerNo', ''),
            'sealNo': JSONRes.get('sealNo', ''),
            'salesman': JSONRes.get('salesman', ''),
            'ywbm': JSONRes.get('ywbm', ''),
            'cph': JSONRes.get('cph', ''),
            'yflx': JSONRes.get('yflx', ''),
            'zgfy': JSONRes.get('zgfy', 0),
            'jcfy': JSONRes.get('jcfy', 0),
            'gbf': JSONRes.get('gbf', 0),
            'yf': JSONRes.get('yf', 0),
            'qtfy': JSONRes.get('qtfy', 0),
            'fyhj': JSONRes.get('fyhj', 0),
            'zggr': JSONRes.get('zggr', ''),
            'sqry': user_name,
            'loadingSupervi': JSONRes.get('loadingSupervi', ''),
            'zjjz': JSONRes.get('zjjz', ''),
            'ckfybz': JSONRes.get('ckfybz', ''),
            'sfkp': JSONRes.get('sfkp', ''),
            'wxfp': wxfp,
            'khmc': khmc,
            'tyb': JSONRes.get('tyb', ''),
            'fylx': fylx,
            'wf_status':0
        })
        
        # 9. 获取刚插入记录的number，插入子表
        sSql = "SELECT rid FROM ckzgfy WHERE sqdh = :sqdh"
        mmsql = run_sql(sSql, {"sqdh": sqdh})
        if len(mmsql) > 0:
            father = mmsql[0]['rid']
            sheet_sql = """
                INSERT INTO ckzgfysheet (
                    rid,pid, ckfy, sqrq, sqdh, ckdh, sqlx, fylb,
                    WarehouseName, StuffingDate, zchm, TotalCartons, TotalVolumn,
                    ContainerNo, SealNo, cph, yflx, zgfy, jcfy, gbf, yf,
                    qtfy, fyhj, zggr, sqry, LoadingSupervi, zjjz, ckfybz, sfkp
                ) VALUES (
                    :rid,:father, :ckfy, :sqrq, :sqdh, :ckdh, :sqlx, :fylb,
                    :warehouseName, :stuffingDate, :zchm, :totalCartons, :totalVolumn,
                    :containerNo, :sealNo, :cph, :yflx, :zgfy, :jcfy, :gbf, :yf,
                    :qtfy, :fyhj, :zggr, :sqry, :loadingSupervi, :zjjz, :ckfybz, :sfkp
                )
            """
            run_sql(sheet_sql, {
                'rid':get_uuid(),
                'uid':JSONRes.get('uid', 0),
                'father': father,
                'ckfy': JSONRes.get('ckfy', 0),
                'sqrq': date_str,
                'sqdh': sqdh,
                'ckdh': ckdh,
                'sqlx': JSONRes.get('sqlx', ''),
                'fylb': JSONRes.get('fylb', ''),
                'warehouseName': JSONRes.get('warehouseName', ''),
                'stuffingDate':JSONRes.get('stuffingDate') or None,
                'zchm': JSONRes.get('zchm', ''),
                'totalCartons': JSONRes.get('totalCartons', 0),
                'totalVolumn': JSONRes.get('totalVolumn', 0),
                'containerNo': JSONRes.get('containerNo', ''),
                'sealNo': JSONRes.get('sealNo', ''),
                'cph': JSONRes.get('cph', ''),
                'yflx': JSONRes.get('yflx', ''),
                'zgfy': JSONRes.get('zgfy', 0),
                'jcfy': JSONRes.get('jcfy', 0),
                'gbf': JSONRes.get('gbf', 0),
                'yf': JSONRes.get('yf', 0),
                'qtfy': JSONRes.get('qtfy', 0),
                'fyhj': JSONRes.get('fyhj', 0),
                'zggr': JSONRes.get('zggr', ''),
                'sqry': user_name,
                'loadingSupervi': JSONRes.get('loadingSupervi', ''),
                'zjjz': JSONRes.get('zjjz', ''),
                'ckfybz': JSONRes.get('ckfybz', ''),
                'sfkp': JSONRes.get('sfkp', '')
            })
        
        return json_result(code=1, data={'ckdh': ckdh, 'sqdh': sqdh}, msg='费用生成成功')
        
    except:
        return json_result(code=-1, msg=trace_error())
    
    
@any_route('/api/RavenCloud/select_cangkuzl', methods=['POST','GET']) 
@require_token
async def fnview_select_cangkuzl(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
   
        ckmc = JSONRes.get("ckmc","")
        jcf = 0
        sql ='select * from cangkuzl where ckmc=:ckmc limit 1'
        msql = run_sql(sql, {"ckmc": ckmc})
        if len(msql) > 0:
            jcf = msql[0].get('jcf', 0) 
        else:
            jcf = 0    
  
               
               
        return json_result(code=1, data=jcf, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()
   
@any_route('/api/ravencloud/generate_ckdh_ckd', methods=['POST','GET']) 
@require_token
async def fnview_generate_ckdh_ckd(request):
    try:
        JSONRes = await request.json()
        s = Session()
        ckdh=''
   
        ckdh = generate_ckdh(ckdh)  # ✅ 调用函数生成单号
       
  
               
               
        return json_result(code=1, data=ckdh, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()
@any_route('/api/ravencloud/delivery_beforesave', methods=['POST','GET'])
@require_token
async def fnview_delivery_beforesave(request):
    """出库单保存前处理"""
    try:
        JSONRes = await request.json()
        s = Session()
        
        mainData = JSONRes.get('mainData', {})
        cpzlList = JSONRes.get('cpzlList', [])
        print('dsadhaskjdhakjdhlas-daskhdasjkdhasjkdas')
        print(cpzlList)
        rid = JSONRes.get('rid', '')
        uid = JSONRes.get('uid', '')
   
        
        user_name = mainData.get('userName', '')
        now = datetime.now()
        datetime_str = now.strftime('%Y-%m-%d %H:%M:%S')
        date_str = now.strftime('%Y-%m-%d')
        
        result = {
            'ckdh': '',
            'ywbm': '',
            'zchm': '',
            'bz': '',
            'cpzlUpdates': [],
            'jcbhList': []
        }
        
        # 1. 更新退货通知表
        thzyh = mainData.get('thzyh', '')
        xshj = mainData.get('xshj', 0)
        ckmc = mainData.get('ckmc', '')
        if thzyh and xshj > 0 and ckmc:
            update_thtz_table(thzyh, xshj, ckmc)  # ✅ 调用提取的函数
       
        
  
            # 2. 获取业务部门
        ywy = mainData.get('ywy', '')
        ywbm = mainData.get('ywbm', '')
        if ywy and not ywbm:
            ywbm = get_ywbm(ywy)  # ✅ 接收返回值
            if ywbm:
                result['ywbm']  = ywbm  # ✅ 存储在ywbm里面 返回到前端进行插入
                
              
        # 3. 生成出库单号
        ckdh = mainData.get('ckdh', '')
        print('dashudhashdasuchukudand ---jdkjaskldjsalkdjsakdjsakdjsalkdjaslkdjaslkjdkj----')
        if not ckdh:
            # 3. 生成出库单号
           ckdh = mainData.get('ckdh', '')
           ckdh = generate_ckdh(ckdh)  # ✅ 调用函数生成单号
           result['ckdh'] = ckdh
        
        path = ''
        if not user_name:  
       
           org = get_user_path(user_name)
           path = org.get('path','')
           path = path[:100]   

        # 5. 处理产品资料
        zwpm = ''
        thyy_list = []
        xh = mainData.get('xh', '')
        fh = mainData.get('fh', '')
        zyck = mainData.get('zyck', '')
        ckmc = mainData.get('ckmc', '')
        jcrq = mainData.get('jcrq', '')
        ckrq = mainData.get('ckrq', '')
        
        # ✅ 改用数组 + set去重（性能优化）
        jcbh_list = []
        jcbh_set = set()
        
        for idx, cpzl in enumerate(cpzlList):
            update_item = {'index': idx}
            
            # 设置装车货名（第一个产品的中文名称）
            if not zwpm and cpzl.get('zwmc'):
                zwpm = cpzl.get('zwmc')
                result['zchm'] = zwpm
            
            zcxs1 = cpzl.get('zcxs1', 0)
            wyzd = cpzl.get('wyzd', '')
            ckwyzd = cpzl.get('ckwyzd', '')
            #箱数大于0 以及出库唯一字段不为空
            if zcxs1 > 0 and ckwyzd:
                # 计算在仓箱数
                cght = cpzl.get('cght', '')
                cpbh = cpzl.get('cpbh', '')
                rkrq = cpzl.get('rkrq', '')
                rksj = cpzl.get('rksj', '')
                rkxs = cpzl.get('rkxs', 0)
                ckxs = cpzl.get('ckxs', 0)
                
                # 【修改】：允许日期为空，动态构建SQL查询
                conditions = []
                params = {}
                
                if rkrq:
                    conditions.append("StorageDate = :StorageDate")
                    params['StorageDate'] = rkrq
                
                if rksj:
                    conditions.append("StorageTime = :StorageTime")
                    params['StorageTime'] = rksj
                
                if cpbh:
                    conditions.append("ItemNo = :ItemNo")
                    params['ItemNo'] = cpbh
                
                if cght:
                    conditions.append("PurchaseOrderNo = :PurchaseOrderNo")
                    params['PurchaseOrderNo'] = cght
                
                if ckwyzd:
                    conditions.append("wyzd1 <> :wyzd1")
                    params['wyzd1'] = ckwyzd
                
                # 至少需要产品编号或合同编号
                if conditions:
                    where_clause = " AND ".join(conditions)
                    sSql = f"""
                        SELECT SUM(OutCartonQty1) as number1 FROM deliveryline 
                        WHERE {where_clause}
                    """
                    mmsql = run_sql(sSql, params)
                    print('10101010101010101010101010101010101010101010101010101010101010101010101010101010-mmmmmmmmm')
                    print(sSql)
                    
                    if len(mmsql) > 0:
                        i1 = int(mmsql[0]['number1'] or 0)
                        i2 = rkxs - i1
                        if i2 >= 0:
                            update_item['zcxs1'] = i2
                            i3 = i2 - ckxs
                            if i3 >= 0:
                                update_item['kcxs'] = i3
                                update_item['zcxs'] = i3
                                update_item['qckxs'] = i1
                            else:
                                update_item['ckxs'] = 0
                        else:
                            update_item['ckxs'] = 0
            
            # 生成唯一字段
            if zcxs1 != 0:
                jcdh = cpzl.get('jcdh', '')
                rkrq = cpzl.get('rkrq', '')
                
                if not wyzd:
                    wyzd = f"{jcdh}{rkrq}{user_name}{datetime_str}:{idx+1}"
                    update_item['wyzd'] = wyzd
                
                if not ckwyzd:
                    ckwyzd = f"{jcdh}{user_name}{datetime_str}:{idx+1}"
                    update_item['ckwyzd'] = ckwyzd
                
                # ✅ 收集进仓编号（使用set快速去重）
                if jcdh and jcdh not in jcbh_set:
                    print(f"Adding jcdh to jcbh_lis----1-1-1-2-3-3-4-5-6-7-8-89-----------")
                    print(jcbh_set)
                    print(cpzl.get('gsmc', ''))
                    jcbh_set.add(jcdh)
                    jcbh_list.append({
                        'rid':get_uuid(),
                        'uid': uid,
                        'pid':rid,
                        'SNID': jcdh,
                        'gdry': cpzl.get('gdry', ''),
                        'Exporter': cpzl.get('gsmc', ''),
                        'SalesOrderNo': cpzl.get('wxht', ''),
                        'cght': cpzl.get('cght', ''),
                        'Salesman': cpzl.get('ywy', ''),
                        'cgy': cpzl.get('cgy', ''),
                        'SupplierShortName': cpzl.get('csmc', '')
                    })
                
                # 收集备注和退货原因
                bz = cpzl.get('bz', '')
                thyy = cpzl.get('thyy', '')
                cght = cpzl.get('cght', '')
                cpbh = cpzl.get('cpbh', '')
                zwmc = cpzl.get('zwmc', '')
                
                if bz:
                    thyy_list.append(f"合同:{cght}产品:{cpbh}备注信息:{bz}")
                if thyy:
                    thyy_list.append(f"{cpbh}/{zwmc},退货原因:{thyy}")
                
                # 填充箱号封号
                if not cpzl.get('xh'):
                    update_item['xh'] = xh
                if not cpzl.get('fh'):
                    update_item['fh'] = fh
                
                # 填充出库日期
                if not cpzl.get('ckrq') and ckrq:
                    update_item['ckrq'] = ckrq
            
            result['cpzlUpdates'].append(update_item)
        
        # 设置备注信息
        if thyy_list:
            result['bz'] = ';\n'.join(thyy_list)
        
        # 6. 处理转移仓库逻辑
        if zyck and zyck != ckmc:
            # ✅ 直接赋值，无需list()转换
            result['jcbhList'] = jcbh_list
            
            # 获取仓库联系人
            jcry = ''
            path = ''
            sSql = "SELECT lxr FROM cangkuzl WHERE ckmc = :ckmc LIMIT 1"
            mmsql = run_sql(sSql, {'ckmc': zyck})
            if len(mmsql) > 0:
                jcry = mmsql[0]['lxr']
               
                org = get_user_path(jcry)
                path = org.get('path','')
                path = path[:100] 
                
                # sSql = "SELECT path FROM sys_user WHERE username = :name"
                # mmsql = run_sql(sSql, {'name': jcry})
                # if len(mmsql) > 0 and mmsql[0]['path']:
                #     path = mmsql[0]['path'][:100]
            
            # ✅ 直接遍历列表
            for jcbh_info in jcbh_list:
                jcbh = jcbh_info['SNID']
                wyzd = f"{jcbh}{jcrq if jcrq else ''}{datetime_str}"
                
                # 检查storage是否存在
                conditions = ["SNID = :SNID", "WarehouseName = :WarehouseName"]
                params = {'SNID': jcbh, 'WarehouseName': zyck}
                
                if jcrq:
                    conditions.append("jcrq = :jcrq")
                    params['jcrq'] = jcrq
                
                where_clause = " AND ".join(conditions)
                sSql = f"SELECT rid FROM storage WHERE {where_clause}"
                mmsql = run_sql(sSql, params)
                
                if len(mmsql) == 0:
                    # 插入storage
                    insert_sql = """
                        INSERT INTO storage (
                            rid, uid, ctime, mtime, jcrq, Operator, SalesOrderNo,
                            Exporter, Salesman, PurchaseOrderNo, SupplierShortName, PurchasingAgent,
                            WarehouseName, SNID, sfjc, gdry, yzrq, rkdd, wyzd, StorageTime, StorageDate, khmc
                        ) VALUES (
                            :rid, :uid, :ctime, :mtime, :jcrq, :Operator, :SalesOrderNo,
                            :Exporter, :Salesman, :PurchaseOrderNo, :SupplierShortName, :PurchasingAgent,
                            :WarehouseName, :SNID, :sfjc, :gdry, :yzrq, :rkdd, :wyzd, :StorageTime, :StorageDate, :khmc
                        )
                    """
                    run_sql(insert_sql, {
                        'uid': jcbh_info['gdry'],
                        'rid': get_uuid(),
                        'ctime': datetime_str,
                        'mtime': datetime_str,
                        'jcrq': jcrq if jcrq else None,
                        'Operator': jcry,
                        'SalesOrderNo': jcbh_info['SalesOrderNo'],
                        'Exporter': jcbh_info['Exporter'],
                        'Salesman': jcbh_info['Salesman'],
                        'PurchaseOrderNo': jcbh_info['cght'],
                        'SupplierShortName': jcbh_info['SupplierShortName'],
                        'PurchasingAgent': jcbh_info['cgy'],
                        'WarehouseName': zyck,
                        'SNID': jcbh,
                        'sfjc': '否',
                        'gdry': jcbh_info['gdry'],
                        'yzrq': mainData.get('yzrq', '') or None,
                        'rkdd': mainData.get('rkdd', ''),
                        'wyzd': wyzd,
                        'StorageTime': None,
                        'StorageDate': None,
                        'khmc': mainData.get('khmc', '')
                    })
                
                # 发送消息通知
                if jcry and jcry != user_name:
                    msg_sql = """
                        INSERT INTO xxck (
                            sys_owner, ctime, mtime, fsrq, fsr, xxly, xxnr, jsr,rid,uid
                        ) VALUES (
                            :sys_owner, :ctime, :mtime, :fsrq, :fsr, :xxly, :xxnr, :jsr,:rid,:uid
                        )
                    """
                    xxnr = f"{user_name}的仓库转移通知:进仓单号:{jcbh},的进仓日期:{jcrq if jcrq else '未填'}请查看,日期:{date_str}"
                    run_sql(msg_sql, {
                        'sys_owner': jcry,
                        'ctime': datetime_str,
                        'mtime': datetime_str,
                        'fsrq': date_str,
                        'fsr': user_name,
                        'xxly': '仓库转移',
                        'xxnr': xxnr,
                        'jsr': jcry,
                        'rid': rid,
                        'uid': uid
                    })
                
                # 获取storage的rid作为father
                conditions = ["SNID = :SNID", "WarehouseName = :WarehouseName"]
                params = {'SNID': jcbh, 'WarehouseName': zyck}
                
                if jcrq:
                    conditions.append("jcrq = :jcrq")
                    params['jcrq'] = jcrq
                
                where_clause = " AND ".join(conditions)
                sSql = f"SELECT rid FROM storage WHERE {where_clause}"
                mmsql = run_sql(sSql, params)
                father1 = mmsql[0]['rid'] if len(mmsql) > 0 else ''
                
                # 为该进仓单号的产品资料创建storageline记录
                for cpzl in cpzlList:
                    if cpzl.get('jcdh') == jcbh and cpzl.get('zcxs1', 0) != 0:
                        ckwyzd = cpzl.get('ckwyzd', '')
                        
                        # 检查storageline是否存在
                        sSql = "SELECT rid FROM storageline WHERE wyzd = :wyzd"
                        mmsql = run_sql(sSql, {'wyzd': ckwyzd})
                        
                        if len(mmsql) == 0 and father1:
                            insert_sql = """
                                INSERT INTO storageline (
                                    rid, pid, OuterLength, OuterWidth, OuterHeight, ItemNo,
                                    OuterGrossWeight, OuterNetWeight, ExpectedCartonQty, OuterVolume,
                                    Volume, GrossWeight, wyzd, ckzd, ckkd, ckgd, ckmz, ckjz,
                                    PalletQty, cktj, ckztj, ckzmz, wxwyzd, cgwyzd, ywpath, cgpath, zwmc, khmc
                                ) VALUES (
                                    :rid, :father, :OuterLength, :OuterWidth, :OuterHeight, :ItemNo,
                                    :OuterGrossWeight, :OuterNetWeight, :ExpectedCartonQty, :OuterVolume,
                                    :Volume, :GrossWeight, :wyzd, :ckzd, :ckkd, :ckgd, :ckmz, :ckjz,
                                    :PalletQty, :cktj, :ckztj, :ckzmz, :wxwyzd, :cgwyzd, :ywpath, :cgpath, :zwmc, :khmc
                                )
                            """
                            ckxs = cpzl.get('ckxs', 0)
                            run_sql(insert_sql, {
                                'rid': get_uuid(),
                                'father': father1,
                                'wyzd': ckwyzd,
                                'OuterLength': cpzl.get('wxcd', 0),
                                'OuterWidth': cpzl.get('wxkd', 0),
                                'OuterHeight': cpzl.get('wxgd', 0),
                                'ItemNo': cpzl.get('cpbh', ''),
                                'OuterGrossWeight': cpzl.get('wxmz', 0),
                                'OuterNetWeight': cpzl.get('wxjz', 0),
                                'ExpectedCartonQty': ckxs,
                                'OuterVolume': cpzl.get('wxtj', 0),
                                'Volume': cpzl.get('wxtj', 0) * ckxs,
                                'GrossWeight': cpzl.get('wxmz', 0) * ckxs,
                                'ckzd': cpzl.get('ckcd', 0),
                                'ckkd': cpzl.get('ckkd', 0),
                                'ckgd': cpzl.get('ckgd', 0),
                                'ckmz': cpzl.get('ckmz', 0),
                                'ckjz': cpzl.get('ckjz', 0),
                                'PalletQty': cpzl.get('ts', ''),
                                'cktj': cpzl.get('cktj', 0),
                                'ckztj': cpzl.get('cktj', 0) * ckxs,
                                'ckzmz': cpzl.get('ckmz', 0) * ckxs,
                                'wxwyzd': cpzl.get('wxwyzd', ''),
                                'cgwyzd': cpzl.get('cgwyzd', ''),
                                'ywpath': cpzl.get('ywpath', ''),
                                'cgpath': cpzl.get('cgpath', ''),
                                'zwmc': cpzl.get('zwmc', ''),
                                'khmc': mainData.get('khmc', '')
                            })
        
        # 7. 更新storageline和inventorydetail表
        for cpzl in cpzlList:
            wyzd = cpzl.get('wyzd', '')
            rkrq = cpzl.get('rkrq', '')
            rksj = cpzl.get('rksj', '')
            zcxs = cpzl.get('zcxs', 0)
            ckxs = cpzl.get('ckxs', 0)
            thxs = cpzl.get('thxs', 0)
            parentID = cpzl.get('parentID', '')
            qckxs = cpzl.get('qckxs', 0)
            qthxs = cpzl.get('qthxs', 0)
            
            if wyzd:
                # 【修改】：动态构建WHERE条件
                conditions = ["wyzd = :wyzd"]
                params = {'wyzd': wyzd, 'CartonQty1': zcxs}
                
                if rkrq:
                    conditions.append("StorageDate = :StorageDate")
                    params['StorageDate'] = rkrq
                
                if rksj:
                    conditions.append("StorageTime = :StorageTime")
                    params['StorageTime'] = rksj
                
                where_clause = " AND ".join(conditions)
                
                # 更新storageline
                update_sql = f"""
                    UPDATE storageline SET CartonQty1 = :CartonQty1 
                    WHERE {where_clause}
                """
                run_sql(update_sql, params)
                
                # 退货处理
                if parentID == '有':
                    rtn1 = max(0, thxs - ckxs)
                    rtn2 = ckxs + qthxs
                    params2 = dict(params)
                    params2['ReturnCartonQty1'] = rtn1
                    params2['ReturnCartonQty2'] = rtn2
                    
                    update_sql = f"""
                        UPDATE storageline SET ReturnCartonQty1 = :ReturnCartonQty1, ReturnCartonQty2 = :ReturnCartonQty2 
                        WHERE {where_clause}
                    """
                    run_sql(update_sql, params2)
                
                # 更新或删除inventorydetail
                if zcxs == 0:
                    # 删除
                    del_sql = f"DELETE FROM inventorydetail WHERE {where_clause}"
                    run_sql(del_sql, {k: v for k, v in params.items() if k != 'CartonQty1'})
                else:
                    # 检查是否存在
                    sSql = f"SELECT rid FROM inventorydetail WHERE {where_clause}"
                    mmsql = run_sql(sSql, {k: v for k, v in params.items() if k != 'CartonQty1'})
                    
                    if len(mmsql) > 0:
                        # 更新
                        update_params = dict(params)
                        update_params.update({
                            'mtime': datetime_str,
                            'xgry': user_name,
                            'CartonQty': zcxs,
                            'Volume': cpzl.get('cktj', 0) * zcxs,
                            'GrossWeight': cpzl.get('ckmz', 0) * zcxs,
                            'WarehousePosition': cpzl.get('cw', '')
                        })
                        
                        if parentID == '有':
                            rtn = max(0, thxs - ckxs)
                            rtn2 = ckxs + qthxs
                            update_params['ReturnCartonQty'] = rtn
                            update_params['ReturnCartonQty2'] = rtn2
                            
                            update_sql = f"""
                                UPDATE inventorydetail SET 
                                    mtime = :mtime, xgry = :xgry, CartonQty = :CartonQty,
                                    ReturnCartonQty = :ReturnCartonQty, ReturnCartonQty2 = :ReturnCartonQty2,
                                    Volume = :Volume, GrossWeight = :GrossWeight, WarehousePosition = :WarehousePosition
                                WHERE {where_clause}
                            """
                        else:
                            update_params['OutCartonQty'] = ckxs + qckxs
                            
                            update_sql = f"""
                                UPDATE inventorydetail SET 
                                    mtime = :mtime, xgry = :xgry, CartonQty = :CartonQty,
                                    OutCartonQty = :OutCartonQty,
                                    Volume = :Volume, GrossWeight = :GrossWeight, WarehousePosition = :WarehousePosition
                                WHERE {where_clause}
                            """
                        
                        run_sql(update_sql, update_params)
        
        # 8. 更新ckzgfy表
        ckdh_main = mainData.get('ckdh', '') or result.get('ckdh', '')
        if ckdh_main:
            fylx = '装柜' if mainData.get('fylb') == '装卸费' else '其它'
            update_sql = """
                UPDATE ckzgfy SET 
                    ckfy = :ckfy, TotalCartons = :TotalCartons, TotalVolumn = :TotalVolumn,
                    fylx = :fylx, WarehouseName = :WarehouseName, StuffingDate = :StuffingDate,
                    ContainerNo = :ContainerNo, SealNo = :SealNo, zchm = :zchm,
                    Salesman = :Salesman, ywbm = :ywbm, cph = :cph, yflx = :yflx,
                    zgfy = :zgfy, jcfy = :jcfy, gbf = :gbf, yf = :yf, qtfy = :qtfy,
                    fyhj = :fyhj, zggr = :zggr, LoadingSupervi = :LoadingSupervi,
                    zjjz = :zjjz, ckfybz = :ckfybz, sfkp = :sfkp, wxfp = :wxfp,
                    khmc = :khmc, tyb = :tyb
                WHERE ckdh = :ckdh AND (ywsp = '' OR wf_status != '2' OR ywsp IS NULL)
            """
            run_sql(update_sql, {
                'ckdh': ckdh_main,
                'ckfy': mainData.get('zhckfy', 0),
                'TotalCartons': mainData.get('xshj', 0),
                'TotalVolumn': mainData.get('tyhj', 0),
                'fylx': fylx,
                'WarehouseName': ckmc,
                'StuffingDate': mainData.get('zggjrq') or None,
                'ContainerNo': xh,
                'SealNo': fh,
                'zchm': result.get('zchm', ''),
                'Salesman': ywy,
                'ywbm': result.get('ywbm', '') or ywbm,
                'cph': mainData.get('cph', ''),
                'yflx': mainData.get('yflx', ''),
                'zgfy': mainData.get('zgfy', 0),
                'jcfy': mainData.get('jcfy', 0),
                'gbf': mainData.get('gbf', 0),
                'yf': mainData.get('yf', 0),
                'qtfy': mainData.get('qtfy', 0),
                'fyhj': mainData.get('fyhj', 0),
                'zggr': mainData.get('zggr', ''),
                'LoadingSupervi': mainData.get('jzry', ''),
                'zjjz': mainData.get('zjjz', ''),
                'ckfybz': mainData.get('ckfybz', ''),
                'sfkp': mainData.get('sfkp', ''),
                'wxfp': mainData.get('fphm', ''),
                'khmc': mainData.get('khmc', ''),
                'tyb': mainData.get('tyb', '')
            })
        
        return json_result(code=1, data=result, msg='success')
        
    except:
        return json_result(code=-1, msg=trace_error())
    
    
    
def update_thtz_table(thzyh, xshj, ckmc):
        """
    更新退货通知表
    
    Args:
        thzyh: 退货专用号
        xshj: 箱数合计
        ckmc: 仓库名称
    """
        # 更新实退箱数
        update_sql = """
            UPDATE thtz SET stxs = :stxs 
            WHERE zyh = :zyh AND WarehouseName = :WarehouseName
        """
        run_sql(update_sql, {'stxs': xshj, 'zyh': thzyh, 'WarehouseName': ckmc})
        
        # 更新剩余箱数和处置标记
        update_sql2 = """
            UPDATE thtz SET mtxs = thxs - stxs, sfcz = '是' 
            WHERE zyh = :zyh AND WarehouseName = :WarehouseName
        """
        run_sql(update_sql2, {'zyh': thzyh, 'WarehouseName': ckmc})   
    
    
def get_ywbm(ywy):
    """
    获取业务部门
    """
    sSql = "SELECT bm FROM ywrybiao WHERE yhm = :yhm"
    mmsql = run_sql(sSql, {'yhm': ywy})
    
    # ✅ 返回查询结果
    if len(mmsql) > 0:
        return mmsql[0]['bm']  # 返回业务部门
    else:
        return ''  # 没有数据返回空字符串
    
    
def generate_ckdh(ckdh_existing=''):
    """
    生成出库单号
    
    Args:
        ckdh_existing: 已有的出库单号（如果为空则生成新的）
        ck+部门编号（1）+年月日8位+4位序列号
    
    Returns:
        str: 出库单号
    """
    if ckdh_existing:
        return ckdh_existing
    
    # 获取部门编码
    bm1 = ''
    sSql = "SELECT position FROM sys_user WHERE username = :name"
    mmsql = run_sql(sSql, {'name': 'zjnblh'})
    if len(mmsql) > 0 and mmsql[0]['position']:
        bm1 = mmsql[0]['position'][:1]
    
    # 生成单号前缀
    now = datetime.now()
    kpxh1 = 'ck' + bm1 + now.strftime('%Y%m%d')
    
    # 查询最大单号
    sSql = "SELECT ckdh FROM delivery WHERE ckdh LIKE CONCAT('%', :kpxh1, '%') ORDER BY ckdh DESC LIMIT 1"
    mmsql = run_sql(sSql, {'kpxh1': kpxh1})
    
    # 生成序列号
    if len(mmsql) > 0 and mmsql[0]['ckdh']:
        try:
            seq = int(mmsql[0]['ckdh'][11:15]) + 1
        except:
            seq = 1
    else:
        seq = 1
    
    # 返回完整单号
    return f"{kpxh1}{seq:04d}"    
    
@any_route('/api/RavenCloud/delivery_beforesavenew2', methods=['POST','GET']) 
@require_token
async def fnview_delivery_beforesavenew2(request):
    try:
        JSONRes = await request.json()
        s = Session()
        
        
        result = {
            'ckdh': '',
            'ywbm': '',
            'zchm': '',
            'bz': '',
            'cpzlUpdates': [],
            'jcbhList': []
        }
        
   
        dataData = JSONRes.get("dataData","")
        mainData = JSONRes.get("mainData","")
        
        # 1. 更新退货通知表
        thzyh = mainData.get('thzyh', '')
        xshj = mainData.get('xshj', 0)
        ckmc = mainData.get('ckmc', '')
        user_name = mainData.get('userName', '')
        if thzyh and xshj > 0 and ckmc:
            update_thtz_table(thzyh, xshj, ckmc)  # ✅ 调用提取的函数
            
            
        # 2. 获取业务部门
        ywy = mainData.get('ywy', '')
        ywbm = mainData.get('ywbm', '')
        if ywy and not ywbm:
            ywbm = get_ywbm(ywy)  # ✅ 接收返回值
            if ywbm:
                result['ywbm']  = ywbm  # ✅ 存储在ywbm里面 返回到前端进行插入
                
              
        # 3. 生成出库单号
        ckdh = mainData.get('ckdh', '')
        if not ckdh:
            # 3. 生成出库单号
           ckdh = mainData.get('ckdh', '')
           ckdh = generate_ckdh(ckdh)  # ✅ 调用函数生成单号
           result['ckdh'] = ckdh
        
        path = ''
        if not user_name:  
       
           org = get_user_path(user_name)
           path = org.get('path','')
           path = path[:100]   

      
  
               
               
        return json_result(code=1, data=result, msg='success')
        
            
    except:
        s.rollback()
        return json_result(code=-1, msg=trace_error())
    finally:
        s.close()
        
        

@any_route('/api/Ravencloud/Select_sys_username_ck', methods=['POST', 'GET'])
@require_token
async def fnview_Select_sys_username_ck(request):
    s=Session()
    j = await request.json()
    try:
        field = ''
        username = j.get('username','')
        position = ''
        
        msql = 'select position from sys_user where username = :username'
        amsl = run_sql(msql, {'username': username})
        if len(amsl) > 0 :
            position = amsl[0]['position']
        
    

       
   

        return json_result(code = 1, data =position, msg='success')
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass


# @any_route('/api/Ravencloud/Update_inven_depertment', methods=['POST', 'GET'])
# @require_token
# async def fnview_Update_inven_depertment(request):
#     s=Session()
#     j = await request.json()
#     try:
        
        
#         msql = 'select Salesmane from inventorydetail group by Salesmane'
#         amsl = run_sql(msql, {})
#         if len(amsl) > 0 :
#             for data in amsl:
#                 Salesmane = data['Salesmane']
#                 msql2 = 'select ywbm from ywrybiao where yhm = :yhm'
#                 amsl2 = run_sql(msql2, {'yhm': Salesmane})
#                 if len(amsl2) > 0 :
#                     ywbm = amsl2[0]['ywbm']
#                     update_sql = 'update inventorydetail set ywbm = :ywbm where Salesmane = :Salesmane'
#                     run_sql(update_sql, {'ywbm': ywbm, 'Salesmane': Salesmane})
           
            
#         return json_result(code = 1, msg='success')
#     except Exception as e:
#         logger.error(trace_error())
#         return json_result(-1, trace_error())
#     finally:
#         s.close()
#     pass

@any_route('/api/Ravencloud/Update_inven_depertment', methods=['POST', 'GET'])
@require_token
async def fnview_Update_inven_depertment(request):
    try:
        JSONRes = await request.json()
        
        # ✅ 先查询所有业务员（主线程）
        msql = 'SELECT Salesman FROM inventorydetail GROUP BY Salesman'
        salesmane_list = run_sql(msql, {})
        
        if not salesmane_list:
            return json_result(code=1, msg='没有需要更新的数据', data={'updated': 0})
        
        # ✅ 获取事件循环
        loop = asyncio.get_running_loop()
        
        # ✅ 并发执行所有更新任务
        tasks = [
            loop.run_in_executor(
                None,  # 默认线程池
                _update_single_salesmane_worker,  # worker 函数
                data['Salesman']
            )
            for data in salesmane_list
        ]
        
        # ✅ 等待所有任务完成
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 统计结果
        updated = sum(1 for r in results if r is True)
        failed = [r for r in results if isinstance(r, Exception)]
        
        return json_result(
            code=1, 
            msg='success', 
            data={
                'updated': updated,
                'total': len(salesmane_list),
                'failed': len(failed)
            }
        )
        
    except Exception:
        return json_result(code=-1, msg=trace_error())


def _update_single_salesmane_worker(Salesman):
    """
    单个业务员更新的 worker 函数
    在线程池中执行
    """
    s = Session()
    try:
        # 查询业务部门
        msql2 = 'SELECT bm FROM ywrybiao WHERE yhm = :yhm'
        amsl2 = run_sql(msql2, {'yhm': Salesman})
        
        if not amsl2:
            return False
        
        ywbm = amsl2[0]['bm']
        
        # 更新inventorydetail
        update_sql = 'UPDATE inventorydetail SET ywbm = :ywbm WHERE Salesman = :Salesman and ywbm<>:ywbm1'
        run_sql(update_sql, {'ywbm': ywbm, 'Salesman': Salesman,'ywbm1': ywbm})
        
        s.commit()
        return True
        
    except Exception as e:
        s.rollback()
        logger.error(f"更新 {Salesman} 失败: {trace_error()}")
        return e
    finally:
        s.close()
@any_route('/api/Ravencloud/get_ckpath', methods=['POST','GET']) 
@require_token
async def fnview_get_ckpath(request):
    s = Session()
    user = request.current_user
    try:
        j = await request.json()
        rid = j.get('rid', '')            
        # 获取入库单主表记录
        d = s.query(storage).filter(storage.rid == rid).first()
        if not d:
            return json_result(-1, '未找到对应的入库单记录')
        # 获取入库单产品资料子表记录
        c = s.query(storageline).filter(storageline.pid == rid).all()
        for r in c:
            wyzd = r.wyzd
            # 检查是否有出库记录
            qty = s.query(func.sum(func.ifnull(deliveryline.OutCartonQty1, 0))).filter(deliveryline.wyzd == wyzd).scalar()
            logger.info(f"Checking wyzd: {wyzd}, OutCartonQty1 sum: {qty}")
            if qty and qty > 0:
                return json_result(-1, f"该入库单下的产品{r.ItemNo}已有出库记录,出货箱数为{qty}，无法删除")
            # 删除对应的库存记录
            s.query(inventorydetail).filter(inventorydetail.wyzd == wyzd).delete(synchronize_session=False)
        # 校验删除记录用户权限 
        if d.WarehouseName == '宁波仓库' and d.gdry != user.username and d.uid != user.rid:
            return json_result(-1, '宁波仓库的入库单只有跟单人员或创建人才能删除')
        elif d.uid != user.rid:
            return json_result(-1, '非宁波仓库的入库单只有该入库单的创建人才能删除')
        
        s.commit()
        return json_result(1, '校验成功')
    except Exception as e:
        logger.error(f"Error in get_ckpath: {str(e)}")
        # 只返回错误消息字符串，避免循环引用
        return json_result(-1, str(e))
    finally:
        s.close()