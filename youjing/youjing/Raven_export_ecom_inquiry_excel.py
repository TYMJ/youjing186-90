# # 电商询价表导出
# from any import *
# import os
# import json
# from openpyxl import load_workbook

# ILLEGAL_CHARS = set('/\\:*?"<>|\r\n')


# def _safe_filename(text):
#     s = str(text or '').strip()
#     if not s:
#         return 'EMPTY'
#     s = ''.join('_' if ch in ILLEGAL_CHARS else ch for ch in s)
#     return s[:120]


# def _first_row(sql, params):
#     rows = run_sql(sql, params)
#     return rows[0] if rows else {}


# def _to_upload_rel_path(abs_path):
#     abs_path = os.path.abspath(abs_path)
#     base_upload = os.path.abspath(getattr(config, 'data_upload_path', '') or '')
#     if base_upload and abs_path.startswith(base_upload):
#         rel = abs_path[len(base_upload):].lstrip('/\\')
#         return rel.replace('\\', '/')
#     return abs_path.replace('\\', '/')


# def _to_int(v, default_value=-1):
#     try:
#         return int(float(v))
#     except Exception:
#         return default_value


# def _resolve_template_path():
#     data_upload = getattr(config, 'data_upload_path', '') or ''
#     base_dir = os.path.dirname(__file__)
#     names = [
#         '电商询价表.xlsx',
#         '电商询价表模板.xlsx',
#         '电商询价表.xls',
#     ]
#     candidates = []
#     for n in names:
#         candidates.extend([
#             os.path.join(data_upload, 'addonfiles', n),
#             os.path.join(data_upload, 'booking_templates', n),
#             os.path.join(base_dir, '..', 'frontend', 'static', 'addonfiles', n),
#             os.path.join(base_dir, '..', 'frontend', 'static', n),
#             os.path.join(base_dir, n),
#         ])
#     for p in candidates:
#         ap = os.path.abspath(p)
#         if os.path.exists(ap):
#             return ap
#     return ''


# def _build_unique_product_text(number):
#     rows = run_sql(
#         """
#         SELECT kpgc, zhwbgpm, djpmy
#         FROM chyjhsheet
#         WHERE pid=:father
#         """,
#         {'father': str(number)}
#     )

#     seen = set()
#     kpgc_lines, zhwbgpm_lines, ywbgpm_lines = [], [], []

#     for r in rows:
#         k = str(r.get('kpgc') or '')
#         z = str(r.get('zhwbgpm') or '')
#         y = str(r.get('djpmy') or '')

#         if not (k or z or y):
#             continue

#         key = f'{k};{z};{y}'
#         if key in seen:
#             continue
#         seen.add(key)

#         kpgc_lines.append(k)
#         zhwbgpm_lines.append(z)
#         ywbgpm_lines.append(y)

#     return '\n'.join(kpgc_lines), '\n'.join(zhwbgpm_lines), '\n'.join(ywbgpm_lines)


# def _build_unique_path(folder, base_name, ext):
#     name = f'{base_name}{ext}'
#     path = os.path.join(folder, name)
#     idx = 1
#     while os.path.exists(path):
#         name = f'{base_name}_{idx}{ext}'
#         path = os.path.join(folder, name)
#         idx += 1
#     return path


# @any_route('/api/Ravencloud/export_ecom_inquiry_excel', methods=['POST'])
# async def api_export_ecom_inquiry_excel(request):
#     try:
#         form = await request.form()
#         rid = str(form.get('rid') or '').strip()
    
    
#         if not rid :
#             return json_result(code=-1, msg='缺少参数 rid')

#         header = _first_row(
#             """
#             SELECT rid number, fphm, hhrq, cyka, hglx, mdck, xshj2, mzhj, tjhj
#             FROM chyjh
#             WHERE rid=:rid 
#             LIMIT 1
#             """,
#             {
#                 'rid': rid
#             }
#         )

#         if not header:
#             return json_result(code=-1, msg='未找到出运计划数据')

#         number = str( rid)

#         template_path = _resolve_template_path()
#         if not template_path:
#             return json_result(code=-1, msg='未找到模板：电商询价表.xlsx')
#         if template_path.lower().endswith('.xls'):
#             return json_result(code=-1, msg='模板为 .xls，请先另存为 .xlsx 再使用')

#         wb = load_workbook(template_path)
#         ws = wb.worksheets[0]

#         row_no = 2
#         ws[f'A{row_no}'] = str(header.get('fphm') or '').upper()
#         ws[f'B{row_no}'] = str(header.get('hhrq') or '')
#         ws[f'D{row_no}'] = str(header.get('cyka') or '')
#         ws[f'E{row_no}'] = '拼箱' if str(header.get('hglx') or '').upper() == 'LCL' else '整柜'
#         ws[f'F{row_no}'] = str(header.get('mdck') or '')
#         ws[f'I{row_no}'] = str(header.get('xshj2') or '')
#         ws[f'J{row_no}'] = str(header.get('mzhj') or '')
#         ws[f'L{row_no}'] = str(header.get('tjhj') or '')

#         kpgc, zhwbgpm, ywbgpm = _build_unique_product_text(number)
#         ws[f'C{row_no}'] = kpgc
#         ws[f'G{row_no}'] = zhwbgpm
#         ws[f'H{row_no}'] = ywbgpm

#         output_root = os.path.join(config.get_today_upload_path(), '电商询价表')
#         os.makedirs(output_root, exist_ok=True)

#         out_base = _safe_filename(f'{number}电商询价表')
#         out_abs = _build_unique_path(output_root, out_base, '.xlsx')

#         wb.save(out_abs)
#         wb.close()

#         return json_result(code=1, msg='导出成功', data={
#             'file': _to_upload_rel_path(out_abs),
#             'name': os.path.basename(out_abs),
#             'number': number
#         })

#     except Exception:
#         logger.error(trace_error())
#         return json_result(code=-1, msg=trace_error())