from any import *
from .model import *
import os,json
import tempfile
from datetime import datetime
import zipfile
import xlwings as xw
from sqlalchemy import func, text

# 假设已有的 ORM 模型（需根据实际表结构定义）
# from your_models import Chyjh, Ywrybiao, Chyjhsheet, Kh

def get_chn_spell_full(text_str: str) -> str:
    """模拟 Delphi 的 GetChnSpellFull 函数"""
    # 需要安装 pypinyin: pip install pypinyin
    from pypinyin import lazy_pinyin, Style
    return ''.join(lazy_pinyin(text_str, style=Style.NORMAL)).upper()


def booking_excel_report(rids, pms: int, user, s):
    """
    主处理函数
    :param rids: 类似 Delphi TStringList 的对象，有 count 和 Strings 属性
    :param filename: 源 Excel 模板文件路径
    :param filename1: 输出文件前缀路径
    :param pms: 用于 SQL 查询的 TOP 参数
    """
    pms = 1
    try:
        file_list = []
        for rid in rids:
            # tpxh = ''

            # 查询 chyjh 表
            chyjh_record = s.query(chyjh).filter(chyjh.rid == rid).first()
            if not chyjh_record:
                continue

            # 启动 Excel 应用
            filename = os.path.join(config.data_upload_path, 'template', '优景最新版BOOKING格式.xlsx')
            app = xw.App(visible=False, add_book=False)
            try:
                wb = app.books.open(filename)
                ws = wb.sheets[0]  # worksheets[1] 对应第一个工作表
                # 填充基本字段
                ws.range('B1').value = chyjh_record.khmc.upper() if chyjh_record.khmc else ''
                ws.range('M1').value = chyjh_record.kh_id.upper() if chyjh_record.kh_id else ''
                ws.range('A3').value = chyjh_record.ttr.upper() if chyjh_record.ttr else ''
                ws.range('B6').value = get_chn_spell_full(chyjh_record.ywry or '')

                # 查询 ywrybiao 表
                ywry_record = s.query(ywrybiao).filter(ywrybiao.yhm == chyjh_record.ywry).first()
                if ywry_record:
                    ws.range('E6').value = ywry_record.lxdh.upper() if ywry_record.lxdh else ''
                    ws.range('E7').value = ywry_record.czhm if ywry_record.czhm else '0574-27903600 '

                # 继续填充
                ws.range('A9').value = chyjh_record.shr.upper() if chyjh_record.shr else ''
                ws.range('A14').value = chyjh_record.tzr.upper() if chyjh_record.tzr else ''
                ws.range('K14').value = chyjh_record.wxfp.upper() if chyjh_record.wxfp else ''

                # 复选框处理（假设形状存在）
                shapes = ws.shapes
                # for shape in ws.shapes:
                #     try:
                #         # if shape.api.Type == 7:  # msoOLEControlObject = 7
                #         logger.error(shape.api.__dict__)
                #     except:
                #         pass
                logger.error('111111---bbbb')
                if chyjh_record.sxfw == 'FCL柜货':
                    shapes['复选框 245'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.sxfw == 'LCL散货':
                    shapes['复选框 246'].api.OLEFormat.Object.Value = 1

                logger.error('aaaaa---bbbb')
                if chyjh_record.fkfs == '到付':
                    shapes['复选框 247'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.fkfs == '预付':
                    shapes['复选框 248'].api.OLEFormat.Object.Value = 1

                if chyjh_record.jgtk == 'FOB':
                    shapes['复选框 249'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.jgtk == 'CNF':
                    shapes['复选框 250'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.jgtk == 'CIF':
                    shapes['复选框 251'].api.OLEFormat.Object.Value = 1

                ws.range('D19').value = chyjh_record.cyka.upper() if chyjh_record.cyka else ''
                ws.range('L19').value = chyjh_record.mdka.upper() if chyjh_record.mdka else ''

                if chyjh_record.hxdate == '是':
                    shapes['复选框 252'].api.OLEFormat.Object.Value = 1
                else:  # '否' 或空
                    shapes['复选框 253'].api.OLEFormat.Object.Value = 1

                if chyjh_record.ysfs == 'BY AIR':
                    shapes['复选框 254'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.ysfs == 'BY SEA':
                    shapes['复选框 255'].api.OLEFormat.Object.Value = 1
                elif chyjh_record.ysfs == 'BY TRAIN':
                    shapes['复选框 256'].api.OLEFormat.Object.Value = 1

                if chyjh_record.Insurancesfzbx == '是':
                    shapes['复选框 257'].api.OLEFormat.Object.Value = 1
                else:
                    shapes['复选框 258'].api.OLEFormat.Object.Value = 1

                # 自动调整行高
                # ws.rows(28).autofit()
                ws.range('28:28').autofit()
                # 处理图片或文字
                if chyjh_record.wxmt:
                    ws.range('P28').value = chyjh_record.wxmt.upper()
                    ws.range('A28').value = chyjh_record.wxmt.upper()
                else:
                    # tpxh = chyjh_record.wxfp or ''
                    # 查询 mttp 字段（BLOB 或文本，长度 > 5）
                    # mttp_record = s.query(Chyjh).filter(
                    #     Chyjh.number == number,
                    #     func.length(Chyjh.mttp) > 5
                    # ).first()
                    if chyjh_record.mttp != None and  chyjh_record.mttp != '' and chyjh_record.mttp != '[]':
                        photo = json.loads(chyjh_record.mttp)
                        if photo != None:
                            file_path = photo[0]['src']
                            fn = os.path.join(config.data_upload_path, str(file_path))
                            if (os.path.exists(fn)):
                                # 添加图片到 Excel
                                cell_a28 = ws.range('A28')
                                left = cell_a28.left + 2
                                top = cell_a28.top + 2
                                pic = ws.pictures.add(fn, left=left, top=top)

                        # 设置图片属性
                        pic.shape_range.lock_aspect_ratio = True

                        fwidth = cell_a28.width - 3
                        fheight = cell_a28.height - 3

                        if pic.shape_range.height >= pic.shape_range.width / (fwidth / fheight):
                            bz = fheight / pic.shape_range.height
                            pic.shape_range.scale_height(bz, 0, 0)
                            pic.shape_range.scale_width(bz, True, 0)
                            bz1 = (fwidth - pic.shape_range.width) // 2
                            pic.shape_range.increment_left(bz1)
                        else:
                            bz = fwidth / pic.shape_range.width
                            pic.shape_range.scale_width(bz, 0, 0)
                            pic.shape_range.scale_height(bz, True, 0)
                            bz1 = (fheight - pic.shape_range.height) // 2
                            pic.shape_range.increment_top(bz1)
                        # 置于底层
                        pic.shape_range.z_order(0)
                    else:
                        ws.range('A28').value = 'N/M'

                # 填充其他单元格
                ws.range('C28').value = f"{chyjh_record.xshj2 or ''}CARTONS"
                ws.range('K28').value = float(chyjh_record.mzhj or 0)
                ws.range('L28').value = float(chyjh_record.tjhj or 0)
                # 处理产品明细
                ywpm = ''
                if chyjh_record.khpd == '是':
                    # 使用 text() 构造 TOP 查询
                    top_sql = text(f"SELECT djpmy, SUM(mjzj) AS mjzj1 FROM chyjhsheet WHERE pid=:pid GROUP BY djpmy ORDER BY mjzj1 DESC LIMIT {pms}")
                    result = s.execute(top_sql, {'pid': rid})
                    rows = result.fetchall()
                    for row in rows:
                        if ywpm:
                            ywpm += ';\r\n' + (row.djpmy or '')
                        else:
                            ywpm = row.djpmy or ''
                else:
                    top_sql = text(f"SELECT djpmy, SUM(wxzj) AS wxzj1 FROM chyjhsheet WHERE pid=:pid GROUP BY djpmy ORDER BY wxzj1 DESC LIMIT {pms}")
                    result = s.execute(top_sql, {'pid': rid})
                    rows = result.fetchall()
                    for row in rows:
                        if ywpm:
                            ywpm += ';\r\n' + (row.djpmy or '')
                        else:
                            ywpm = row.djpmy or ''

                ws.range('O28').value = ywpm.upper()
                ws.range('E28').value = ywpm.upper()

                # 金额格式化
                if chyjh_record.khpd == '是':
                    ws.range('M28').number_format_local = '￥#,###0.000'
                    ws.range('M28').value = float(chyjh_record.mjzj or 0)
                else:
                    ws.range('M28').number_format_local = '$#,###0.000'
                    ws.range('M28').value = float(chyjh_record.wxje or 0)

                # 其他条件填充
                if chyjh_record.hglx == 'LCL':
                    ws.range('N32').value = float(chyjh_record.tjhj or 0)
                if int(chyjh_record.xgsl or 0) > 0:
                    ws.range('N33').value = int(chyjh_record.xgsl)
                if int(chyjh_record.pgsl or 0) > 0:
                    ws.range('N34').value = int(chyjh_record.pgsl)
                if int(chyjh_record.ggsl or 0) > 0:
                    ws.range('N36').value = int(chyjh_record.ggsl)

                ws.range('E32').value = chyjh_record.hhrq or ''
                ws.range('E33').value = chyjh_record.zgdd or ''
                ws.range('C38').value = chyjh_record.fkry or ''
                ws.range('G38').value = chyjh_record.fksm or ''

                # for shape in ws.shapes:
                #     try:
                #         if shape.api.Type == 7:  # msoOLEControlObject = 7
                #             logger.error(shape.api.__dict__)
                #     except:
                #         pass

                # 查询客户表
                kh_record = s.query(kh).filter(kh.kh_id == chyjh_record.kh_id).first()
                if kh_record:
                    ws.range('E36').value = kh_record.xbtt.upper() if kh_record.xbtt else ''
                    if kh_record.xbtt:
                        shapes['复选框 259'].api.OLEFormat.Object.Value = 1
                    else:
                        if chyjh_record.xybx == '是':
                            shapes['复选框 259'].api.OLEFormat.Object.Value = 1
                        else:
                            shapes['复选框 260'].api.OLEFormat.Object.Value = 1

                # 自动调整行高并填充备注
                # ws.rows(41).autofit()
                ws.range('41:41').autofit()
                ws.range('A41').value = chyjh_record.hdxx.upper() if chyjh_record.hdxx else ''
                ws.range('O41').value = chyjh_record.hdxx.upper() if chyjh_record.hdxx else ''

                # 签名
                sign_str = f"{chyjh_record.ywry or ''}\n{datetime.now().strftime('%Y-%m-%d')}"
                ws.range('M41').value = sign_str

                # 保存并关闭
                output_name = f"{user.username}_{chyjh_record.wxfp}_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.xlsx"
                output_path = os.path.join(config.tmp_path, output_name)
                file_list.append(output_name)
                wb.save(output_path)
                wb.close()
            finally:
                app.quit()
        
        filename = ''
        if len(file_list) > 0:
            filename = f"{user.username}{datetime.now().strftime('%Y%m%d%H%M%S')}_booking.zip"
            sZipPath = os.path.join(config.tmp_path, filename)  # 压缩包路径
            zipFile = zipfile.ZipFile(
                sZipPath, "w"
            )  # 生成一个压缩包，第二个参数默认值为'r'，表示读已经存在的zip文件，'w'表示新建一个zip文档或覆盖一个已经存在的zip文档
            for f in file_list:
                file_path = os.path.join(config.tmp_path, str(f))
                if os.path.exists(file_path):
                    zipFile.write(file_path, f, zipfile.ZIP_DEFLATED)  # 将file_path的文件重命名为sfilename

            zipFile.close()
            # return {'code': 0, 'msg': '没有可处理的记录'}
        return {'code': 1, 'msg': '操作成功', 'data': filename}
        
    except Exception as e:
        # app.quit()
        logger.error(f"处理 Excel 报告失败: {str(e)}")
        return {'code': -1, 'msg': f'操作失败: {str(e)}'}


"""
出运计划.优景Booking
对应原Pascal: 优景Booking
"""
@any_route('/api/saier/shipping/booking/export', methods=['POST'])
@require_token
async def view_shpping_booking_export(request):
    s = Session()
    try:
        user = request.current_user
        j = await request.json()
        rids = j.get('rids', [])
        res = booking_excel_report(rids, 1, user, s)

        return json_result(res.get('code'), res.get('msg'), res.get('data'))
    except Exception as e:
        logger.error(trace_error())
        return json_result(-1, f'货款类型校验失败: {str(e)}')
    finally:
        s.close()