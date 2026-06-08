# -*- coding:utf-8 -*-
from any import *
from .model import *
import json

def get_products_list_data(j, s):
    try:
        # 1. 获取查询参数
        module_name = j.get('module_name', '样品管理')
        cpbh = j.get('barcode', '')       # 客人条码
        zwpm = j.get('productname', '') # 中文品名
        
        # 2. 构建查询基础对象
        query = s.query(ypgl)
        
        # 3. 增加模糊查询过滤条件
        if cpbh:
            # 使用 .like 实现模糊匹配，% 是通配符
            query = query.filter(ypgl.lxm.like(f'%{cpbh}%'))
        
        if zwpm:
            # 假设中文品名字段在数据库中叫 zwpm
            query = query.filter(ypgl.zwpm.like(f'%{zwpm}%'))
        
        # 4. 执行查询，获取列表（限制前50条，防止数据过多崩溃）
        products = query.limit(50).all()
        
        if not products:
            return {'code': -1, 'msg': '未找到相关产品'}

        # 5. 获取字段显示配置（这部分复用原逻辑，决定列表里每项显示什么内容）
        fields = s.query(ydszzdmx).filter(ydsz.mkmc == module_name
            ).outerjoin(ydsz, ydsz.rid == ydszzdmx.pid
            ).order_by(ydszzdmx.seq.asc()).all()
        fields_dict = alchemy_object_list_to_dict(fields)

        results = []

        # 6. 循环处理每一个产品对象
        for item in products:
            row = alchemy_object_to_dict(item)
            
            # 处理图片逻辑
            photo = ''
            if row.get('yytp'):
                try:
                    photos = json.loads(row.get('yytp'))
                    if photos and len(photos) > 0:
                        photo = photos[0].get('src', '')
                except:
                    photo = ''

            # 格式化该产品的显示字段
            product_data = {
                'rid': row.get('rid'),
                'yytp': photo,
                'raw_data': row, # 保留原始数据备用
                'display_info': {} # 存放按位置分类后的字段
            }

            for f in fields_dict:
                bzdm = f.get('bzdm') # 字段名
                pos = f.get('xswz') # 显示位置
                
                # 获取值并处理日期
                val = row.get(bzdm, '')
                if f.get('sjlx', '')[:2] == '日期' and val:
                    val = str(val)[:10]

                field_item = {
                    'caption': f.get('xsmc'),
                    'name': bzdm,
                    'value': val
                }

                if pos not in product_data['display_info']:
                    product_data['display_info'][pos] = []
                product_data['display_info'][pos].append(field_item)

            results.append(product_data)

        return {'code': 1, 'msg': f'查询成功，共{len(results)}条', 'data': results}

    except Exception as e:
        logger.error(trace_error())
        return {'code': -1, 'msg': f'查询失败: {str(e)}'}

@any_route('/api/sample/products/list/query', methods=['POST'])
@require_token
async def api_products_info_list(request):
    """
    模糊查询产品列表接口
    参数: { "barcode": "xxx", "productname": "xxx" }
    """
    s = Session()
    j = await request.json()
    try:
        # 调用逻辑处理函数
        res = get_products_list_data(j, s)
        return json_result(res.get('code'), res.get('msg'), res.get('data'))
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()