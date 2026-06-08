"""
EDI 资信调查
手动触发接口，将 edistate 为待申请的资信调查数据发送到 MQ
"""

import json

from any import *
from .model import *
from .Edi_MQ import send_edi_message
import uuid
from sqlalchemy import or_, text
from datetime import datetime, timedelta


@any_route("/api/youjing/edi/credit_investigation/send", methods=["POST", "GET"])
@require_token
async def edi_credit_investigation_send(request):
    """
    EDI 资信调查 - 手动触发发送
    将 zxtc 表中 edistate 为 null/空/待申请 的资信调查数据发送到 MQ
    """
    s = Session()
    try:
        # 1. 查询待申请数据
        thirty_days_ago = datetime.now() - timedelta(days=30)
        records = (
            s.query(zxtc)
            .filter(
                # zxtc.mtime >= thirty_days_ago,
                # zxtc.zjlhz == "通过",
                # zxtc.xbsq == "是",
                # zxtc.tjfk != None,
                # zxtc.tjfk != "",
                # or_(zxtc.edistate == None, zxtc.edistate == "", zxtc.edistate == "待申请"),
                zxtc.edistate == "待申请"
            )
            .all()
        )

        if not records:
            return json_result(1, "EDI资信调查无数据", {"sent_count": 0, "batch_count": 0})

        # 2. 数据分类与封装
        lc_records = []
        no_lc_records = []

        for r in records:
            # 关联 fkkh 获取信保买方代码
            fkkh_record = s.query(fkkh).filter(fkkh.khbh == r.kh_id).first()
            sinosurebuyerno = fkkh_record.xbdm if fkkh_record else ""

            # 关联 xbzxsheet 获取国家代码
            country_row = s.execute(
                text("SELECT dm FROM xbzxsheet WHERE mc = :mc AND ssmk = '国家代码'"), {"mc": r.country or ""}
            ).fetchone()
            country_code = country_row[0] if country_row else ""

            # 处理电话号码格式
            tel = ""
            if r.phone:
                tel = r.phone.replace("[", "").replace("]", "")

            # 处理地址格式
            address = ""
            if r.address:
                address = r.address.replace("\t", "").replace("\n", "")

            # 生成流水号
            corpserialno = r.corpserialno or f"YJQUOTA-{uuid.uuid4()}".upper()

            vo = {
                "recordID": str(r.rid),
                "corpserialno": corpserialno,
                "countrycode": country_code,
                "tel": tel,
                "fax": str(r.fax or ""),
                "mailaddr": str(r.email or ""),
                "contacter_address": address,
                "risk_manager": str(r.tjfk or ""),
                "regno": str(r.xgry or ""),
                "remarks": str(r.bz or ""),
                "customer_name": str(r.company_name or ""),
                "salesman": str(r.ywry or ""),
                "dept": str(r.bm or ""),
                "company": str(r.wfgs or ""),
                "linkman": str(r.cslxr or ""),
                "customer_no": str(r.kh_id or ""),
                "state": str(r.ssdq or ""),
                "paymode": str(r.zffs or ""),
                "paytermapply": str(r.zfqx) if r.zfqx is not None else "",
                "quotasumapply": str(r.sqed) if r.sqed is not None else "",
                "goodscode": "99",
                "outofdangerremark": str(r.qkjs or ""),
                "haveoutofdanger": str(r.ywlscx or ""),
                "relevancecompany": str(r.gltt or ""),
                "risk_result": str(r.fkqr or ""),
                "risk_remark": str(r.fkbz or ""),
                "sinosurebuyerno": sinosurebuyerno,
            }

            if r.zxtclx == "信用证调查":
                vo["applygenre"] = "4"
                lc_records.append((r, vo))
            elif r.zxtclx == "非信用证调查":
                vo["applygenre"] = "1"
                no_lc_records.append((r, vo))

        batch_size = 50
        total_sent = 0
        total_batch = 0
        failed_batches = []

        # 3. 发送非信用证调查
        for i in range(0, len(no_lc_records), batch_size):
            batch = no_lc_records[i : i + batch_size]
            msg_data_list = [item[1] for item in batch]

            mq_payload = {"msgType": "doBprQuotaApply_002", "msgData": msg_data_list}

            result = send_edi_message(mq_payload)
            logger.info(f"EDI非信用证调查发送结果: {json.dumps(result, ensure_ascii=False, default=str)}")
            if result.get("success"):
                for r, vo in batch:
                    s.query(zxtc).filter(zxtc.rid == r.rid).update(
                        {"corpserialno": vo["corpserialno"], "edistate": "申请中"}
                    )
                s.commit()
                total_sent += len(batch)
                total_batch += 1
                logger.info(f"EDI非信用证调查批次发送成功，消息ID: {result.get('message_id')}")
            else:
                failed_batches.append(
                    {
                        "batch_no": total_batch + 1,
                        "record_count": len(batch),
                        "msg_type": "doBprQuotaApply_002",
                        "error": str(result.get("error"))[:500],
                    }
                )
                logger.error(f"EDI非信用证调查批次发送失败: {result.get('error')}")

        # 4. 发送信用证调查
        for i in range(0, len(lc_records), batch_size):
            batch = lc_records[i : i + batch_size]
            msg_data_list = [item[1] for item in batch]

            mq_payload = {"msgType": "doBprQuotaApplyWithLC_002", "msgData": msg_data_list}

            result = send_edi_message(mq_payload)
            logger.info(f"EDI信用证调查发送结果: {json.dumps(result, ensure_ascii=False, default=str)}")
            if result.get("success"):
                for r, vo in batch:
                    s.query(zxtc).filter(zxtc.rid == r.rid).update(
                        {"corpserialno": vo["corpserialno"], "edistate": "申请中"}
                    )
                s.commit()
                total_sent += len(batch)
                total_batch += 1
                logger.info(f"EDI信用证调查批次发送成功，消息ID: {result.get('message_id')}")
            else:
                failed_batches.append(
                    {
                        "batch_no": total_batch + 1,
                        "record_count": len(batch),
                        "msg_type": "doBprQuotaApplyWithLC_002",
                        "error": str(result.get("error"))[:500],
                    }
                )
                logger.error(f"EDI信用证调查批次发送失败: {result.get('error')}")

        # 5. 返回结果
        if failed_batches:
            return json_result(
                1,
                "EDI资信调查部分发送成功",
                {
                    "sent_count": total_sent,
                    "batch_count": total_batch,
                    "total_records": len(records),
                    "failed_batches": failed_batches,
                },
            )
        else:
            return json_result(
                1,
                "EDI资信调查发送成功",
                {"sent_count": total_sent, "batch_count": total_batch, "total_records": len(records)},
            )

    except Exception as e:
        s.rollback()
        logger.error(f"EDI资信调查异常: {trace_error()}")
        return json_result(-1, f"EDI资信调查异常: {trace_error()}")
    finally:
        s.close()
