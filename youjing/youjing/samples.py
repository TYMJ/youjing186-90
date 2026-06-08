from any import *
from .model import *
from sqlalchemy.sql import func,not_,or_,and_
import time,re
import shutil,json,os
from .__default__ import get_user_path


# try:
from PIL import Image
# except ImportError:
#     subprocess.check_call([sys.executable, "-m", "pip", "install", 'PIL'])

try:
    import qrcode
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", 'qrcode'])

# try:
from pystrich.code128 import Code128Encoder
from pystrich.code39 import Code39Encoder
from pystrich.ean13 import EAN13Encoder
# except ImportError:
#     subprocess.check_call([sys.executable, "-m", "pip", "install", 'pystrich'])


def calculate_checksum(digits):
    try:    
        if len(str(digits)) == 12:        
            sc = str(digits)        # 在此处添加计算校验码的逻辑        
            a = int(sc[1])+int(sc[3])+int(sc[5])+int(sc[7])+int(sc[9])+int(sc[11])        
            b = +int(sc[0])+int(sc[2])+int(sc[4])+int(sc[6])+int(sc[8])+int(sc[10])         
            c = b + a * 3        
            jym = 10 - c % 10  
            if jym==10:
                jym=0
            return  jym   
        else:        
            return ''
    except:
        logger.error(trace_error())
        return ''

def _make_barcode(code):
    # c = s.query(Barcodes.BarcodeNo).filter(Barcodes.ItemCode==ItemCode,Barcodes.CountryCode==CountryCode
    #     ).order_by(Barcodes.BarcodeNo.desc()).first()
    # if not c:
    #     BarcodeNo = 1
    # else:
    #     BarcodeNo = int(c.BarcodeNo) + 1

    # code = str(CountryCode) + str(ItemCode) + f"{BarcodeNo:0{5}d}"
    # code = str(code).strip().replace('-', '').replace(' ', '')

    if len(code) != 12 and len(code) != 13:
        return '','',''
    # 检查是否为纯数字
    if not code.isdigit():
        return '','',''

    # code_str = calculate_checksum(code)
    # if code_str == '':
    #     return '','',''
    # full_code = str(code) + str(code_str)

    path = config.get_today_upload_path()
    if not os.path.exists(path):
        make_dirs(path)
    sbs_path = path[-10:]
    
    photo_list = []
    encode = EAN13Encoder(code)
    encode.save(path + '/'+ str(code)+'_br.png',bar_width=2)
    photo_list.append({"src":str(sbs_path)+"/"+str(code)+"_br.png","name":str(code)+"_br.png"})
    barcode_str = str(photo_list)
    
    photo_list = []
    qr = qrcode.QRCode(version=2,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
    ) 
    # version：控制二维码的大小，取值范围从1到40。取最小值1时，二维码大小为21*21。取值为 None （默认）或者使用fit=true参数（默认）时，二维码会自动调整大小(数值越大二维码越复杂)。
    qr.add_data(code)
    qr.make(fit=True)
    img = qr.make_image()
    img.save(os.path.join(path,str(code)+'_qr.png'))
    photo_list.append({"src":str(sbs_path)+"/"+str(code)+"_qr.png","name":str(code)+"_qr.png"})
    qrcode_str = str(photo_list)
    
    # m = Barcodes()
    # m.BarcodeNo = BarcodeNo
    # m.ItemCode = ItemCode
    # m.CountryCode = CountryCode
    # m.rid = get_uuid()
    # m.uid = user.rid
    # m.ctime = time.strftime("%Y-%m-%d %H:%M:%S")
    # s.add(m)

    return code, barcode_str, qrcode_str

#样品管理保存前
@any_route('/api/saier/samples/save/before', methods=['POST', 'GET'])
@require_token
async def view_saier_samples_save_before(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        cpfl = j.get('cpfl','')
        yjfl = j.get('yjfl','')
        ejfl = j.get('ejfl','')
        sjfl = j.get('sjfl','')
        ccwz = j.get('ccwz','')
        cpbh = j.get('cpbh','')
        txm = j.get('txm','')
        txmt = j.get('txmt','')
        ewmt = j.get('ewmt','')

        tmbh = ''
        barcode_str = ''
        qrcode_str = ''
        if (txm==None or txm=='') and yjfl!='' and ccwz!='':
            d = run_sql(f"select cpdlbh from zycpfenglb where (cpfl='{cpfl}') and (yjfl='{yjfl}') and (ejfl='{ejfl}') limit 1")
            if len(d)>0:
                tmbh = d[0].get('cpdlbh')
                d = run_sql(f"select bz from cyzglsheet where (xm='{ccwz}') and (zm='样品间区域标志') limit 1")
                if len(d)>0:
                    tmbh = str(tmbh) + str(d[0].get('bz'))
                else:
                    tmbh = str(tmbh) + '0'

            if tmbh!='':
                d = run_sql("select ypjtmbh from ywrybiao where yhm='{user.username}}' limit 1")
                if len(d)>0:
                    tmbh = str(tmbh) + str(d[0].get('ypjtmbh'))
                else:
                    tmbh = str(tmbh) + '0'

                c = run_sql(f"select lxm from ypgl where lxm like '{tmbh}%' and length(lxm)=12 order by lxm desc limit 1")
                if len(c)>0:
                    txm = str(c[0].get('lxm'))[-5:]
                    tmbh = str(tmbh) + f"{int(txm)+1:0{5}d}"
                else:
                    tmbh = str(tmbh) + '00001'

                tm = run_sql(f"select cpbh from ypgl where lxm='{tmbh}' and cpbh<>'{cpbh}' and ifnull(lxm,'')<>'' limit 1")
                if len(tm)>0:
                    return json_result(-1, f"请注意此条码已有产品货号{cpbh}请重新保存")
                
        if (txm!="" or tmbh!="") and cpbh!="":
            d = s.query(cjcp).filter(cjcp.cpbh==cpbh,func.ifnull(cjcp.lxm,"")=="").first()
            if d:
                d.lxm = tmbh
                d.modi_uid = user.rid
                d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(d)

            d = s.query(zscp).filter(or_(zscp.cpbh==cpbh,func.ifnull(zscp.krhh,"")==cpbh)).filter(func.ifnull(zscp.lxm,"")=="").first()
            if d:
                d.lxm = tmbh
                d.modi_uid = user.rid
                d.mtime = time.strftime('%Y-%m-%d %H:%M:%S')
                s.add(d)
            code = tmbh
            if tmbh == '':
                code = txm
            if txmt=='' or ewmt=='' or tmbh=='':
                txm, barcode_str, qrcode_str = _make_barcode(code)

        s.commit()
        return json_result(1, '查询成功', {'txmh':tmbh,'txmt':barcode_str.replace("'",'"'),'ewmt':qrcode_str.replace("'",'"')})
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()



#样品管理产品编号change
@any_route('/api/saier/samples/itemno/change', methods=['POST', 'GET'])
@require_token
async def view_saier_samples_itemno_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        rid = j.get('rid')
        cpbh = j.get('itemno')
        c = s.query(ypgl.rid).filter(ypgl.cpbh==cpbh,ypgl.rid!=rid).first()
        if c:
            return json_result(0, '此产品货号已存在', c.rid)

        return json_result(1, '操作成功', '')
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()

#样品管理加载后
@any_route('/api/saier/samples/load/check', methods=['POST', 'GET'])
@require_token
async def view_saier_samples_load_check(request):
    s = Session()
    user = request.current_user
    j = await request.json()
    try:
        data = 0
        org = get_user_path(user.username," and position like '%条码编写%'")
        if org.get('rid')!='':
            data = 1

        return json_result(1, '操作成功', data)
    except:
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()


#样品管理出库信息是否核销 change后
@any_route('/api/saier/samples/sfhx/change', methods=['POST', 'GET'])
@require_token
async def view_saier_samples_sfhx_change(request):
    s = Session()
    # user = request.current_user
    j = await request.json()
    try:
        sfhx = j.get('sfhx')
        wyzd = j.get('wyzd')
        s.query(ypxjglsheet).filter(ypxjglsheet.wyzd==wyzd).update({'sfhx':sfhx})
        s.commit()
        return json_result(1, '操作成功', '')
    except:
        s.rollback()
        logger.error(trace_error())
        return json_result(-1, trace_error())
    finally:
        s.close()