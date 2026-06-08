# -*- coding:utf-8 -*-
'''
Author: Grays
Date: 2023-07-16 22:32:40
LastEditors: Grays
LastEditTime: 2023-07-17 11:22:33
Description: 
'''
from any import *
from .model import *
import json



def insert_user_log(data, user, s):
    try:
        m = user_log()
        rid = get_uuid()
        m.rid = rid
        uid = user.rid
        m.uid = uid
        m.UserName = user.username
        m.Kind = data.get('Kind','样品扫码')
        m.KeyModule = data.get('KeyModule','样品查询')
        m.KeyField = data.get('KeyField', '产品条码')
        m.KeyValue = data.get('KeyValue','')
        m.Date= datetime.datetime.now()
        s.add(m)
        return {'code':1, 'msg':'插入日志成功'}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    
def get_app_data_test(j,s):
    try:
        kind = j.get('kind','')
        Barcode = j.get('barcode')

        Products = get_model_by_table_name('ypgl')
        data = s.query(Products).filter(or_(Products.cpbh==Barcode,Products.lxm==Barcode)).first()
        if not data:
            return {'code':-1,'msg':'未找到样品记录'}
        
        row = alchemy_object_to_dict(data)

        
        fields = s.query(MobileSet).filter(ydsz.isEnabled==1, MobileSet.Kind==kind
            ).outerjoin(MobileSet,MobileSet.rid==MobileSetLine.pid
            ).order_by(MobileSetLine.seq.asc(),MobileSetLine.sid.asc()).all()
        if not fields:
            return {'code':-1,'msg':'未找到配置文件'}
        fields = alchemy_object_list_to_dict(fields)

        data_json = {}
        photo = []
        if row.get('Photo')!=None and row.get('Photo')!='' and row.get('Photo')!='[]':
            photos = json.loads(row.get('Photo'))
            # if len(photos)>0:
            photo = [r.get('src',) for r in photos]

        data_json['photo']=photo
        data_json['data'] = row
        for f in fields:
            if f.get('DataType')=='图片':
                continue
            FieldName = f.get('FieldName')
            value = row.get(FieldName)
            # if FieldName=='StockQTY':
            #     d = run_sql(f"select sum(ifnull(v_stock.EndQty,0)) Qty from v_stock where ItemNo='{row.get('ItemNo')}' limit 1")
            #     if len(d)>0:
            #         value = d[0].get('Qty')
            field_list = []
            field_list.append({'caption':f.get('FieldCaption'),'name':f.get('FieldName'),'value':value})

            if len(field_list)==0:
                continue
            if data_json.get(f.get('Position'))==None:
                data_json[f.get('Position')]=field_list
            else:
                data_json[f.get('Position')].extend(field_list)
                  
        return {'code':1, 'msg':'取数成功','data':data_json}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    pass


def get_app_data(j,s):
    try:
        module_name = j.get('module_name','样品管理')
        cpbh = j.get('barcode','')
        # d = get_user_data(username, s)
        # if d.get('code') !=1 :
        #     return d
        # user_data = d.get('data')
        # logger.error(d.get('Department'))
        data = s.query(ypgl).filter(ypgl.lxm==cpbh).first()
        if not data:
            return {'code':-1,'msg':'未找到样品记录11'}
        
        row = alchemy_object_to_dict(data)
        logger.error(row)
        # logger.error('----------dddd-----------')
        # price = s.query(bzcpgcbj).filter(bzcpgcbj.pid==row.get('rid')
        #     ).order_by(bzcpgcbj.seq.asc(),bzcpgcbj.sid.asc()).first()
        # price_data = alchemy_object_to_dict(price)

        # logger.error('-----------price_data---------')
        # logger.error(price_data)

        cpfl = row.get('cpfl')
        fields = s.query(ydszzdmx).filter(ydsz.mkmc==module_name,
                # ydsz.tjnr==cpfl
            ).outerjoin(ydsz,ydsz.rid==ydszzdmx.pid).order_by(ydszzdmx.seq.asc(),ydszzdmx.sid.asc()).all()
        if not fields:
            return {'code':-1,'msg':'未找到配置文件'}
        fields = alchemy_object_list_to_dict(fields)
        # table = get_module(module_name)
        # main_table = m.table_name
        # model = get_model_by_table_name(v['table'])
        # o = table()
        pid = row.get('rid')
        data_json = {}
        photo = ''
        if row.get('yytp')!=None and row.get('yytp')!='' and row.get('yytp')!='[]':
            photos = json.loads(row.get('yytp'))
            if len(photos)>0:
                photo = photos[0].get('src',)

        data_json['yytp']=photo
        # data_json['mjfob']=row.get('mjfob')
        data_json['data'] = row
        for f in fields:
            bzdm = f.get('bzdm')
            field_list = []
            # if f.get('jszd')==0:
            if f.get('sfzb')==False:
                if f.get('sjlx')[:2]=='日期' and row.get(bzdm)!=None and row.get(bzdm)!='':
                    field_list.append({'caption':f.get('xsmc'),'name':f.get('bzdm'),'value':row.get(bzdm)[:10],'kind':f.get('sjlx')})
                else:
                    field_list.append({'caption':f.get('xsmc'),'name':f.get('bzdm'),'value':row.get(bzdm),'kind':f.get('sjlx')})
            else:
                field_list.append({'caption':f.get('xsmc'),'name':f.get('bzdm'),'value':'','kind':f.get('sjlx')})
            # else:
            #     attr_list = s.query(bzcpcpsx).filter(bzcpcpsx.pid==pid,bzcpcpsx.zhxs==1).all()
            #     if attr_list:
            #         attr_list = alchemy_object_list_to_dict(attr_list)
            #         for attr_row in attr_list:
            #             if f.get('bzdm')=='ywjson':
            #                 field_list.append({'caption':attr_row.get('ywsx'),'name':'ywsx','value':attr_row.get('ywz'),'kind':row.get('sjlx')})
            #             else:
            #                 field_list.append({'caption':attr_row.get('zwsx'),'name':'zwsx','value':attr_row.get('zwz'),'kind':row.get('sjlx')})
            
                # if row.get(bzdm) !=None and row.get(bzdm)!="" and row.get(bzdm)!="[]":
                #     json.loads(row.get(f.get('bzdm')))
                #     field_list.extend(json.loads(row.get(f.get('bzdm'))))

            if len(field_list)==0:
                continue
            if data_json.get(f.get('xswz'))==None:
                data_json[f.get('xswz')]=field_list
            else:
                data_json[f.get('xswz')].extend(field_list)      
        # logger.error(data_json)
        return {'code':1, 'msg':'取数成功','data':data_json}
    except:
        logger.error(trace_error())
        return {'code':-1, 'msg':trace_error()}
    pass


@any_route('/api/scan/item', methods=['POST', 'GET'])
@require_token
async def api_scan_item(request):
    s=Session()
    j = await request.json()
    try:
        Barcode = j.get('barcode')
        user = request.current_user

        # data = {'KeyValue':Barcode}
        # res = insert_user_log(data, user, s)
        # if res.get('code')!=1:
        #     s.rollback()
        # else:
        #     s.commit()

        d = get_app_data(j, s)
        if d.get('code')!=1:
            return json_result(d.get('code'), d.get('msg'), d.get('data'))

        return json_result(d.get('code'), d.get('msg'), d.get('data'))
    except Exception as e:
        logger.error(trace_error())
        s.rollback()
        return json_result(-1, trace_error())
    finally:
        s.close()
    pass