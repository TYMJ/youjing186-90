"""
EDI 出运申报
手动触发接口，将 state='待申请' 的出运申报数据发送到 MQ
"""

import json
from any import *
from .model import *
from .Edi_MQ import send_edi_message
from datetime import datetime


@any_route("/api/youjing/edi/shipment_declaration/send", methods=["POST", "GET"])
@require_token
async def edi_shipment_declaration_send(request):
    """
    EDI 出运申报 - 手动触发发送
    将 shipmentapply 表中 state='待申请' 的数据发送到 MQ
    """
    s = Session()
    try:
        # 1. 查询待申请数据
        records = s.query(shipmentapply).filter(shipmentapply.state == "待申请").all()
        if not records:
            return json_result(1, "EDI出运申报无数据", {"sent_count": 0, "batch_count": 0})

        batch_size = 50
        total_sent = 0
        total_batch = 0
        failed_batches = []
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 2. 按批次处理
        for i in range(0, len(records), batch_size):
            batch_records = records[i : i + batch_size]
            msg_data_list = []

            for r in batch_records:
                transport_date = ""
                if r.transportDate is not None:
                    transport_date = r.transportDate.strftime("%Y-%m-%d %H:%M:%S")

                vo = {
                    "buyerno": str(r.buyerNo or ""),  # 中信保买方代码
                    "invoiceno": str(r.invoiceNo or ""),  # 发票编号
                    "corpserialno": str(r.corpSerialNo or ""),  # 流水号
                    "invoicesum": str(r.invoiceSum or ""),  # 发票金额
                    "insuresum": str(r.insureSum or ""),  # 投保金额
                    "moneyid": str(r.moneyId or ""),  # 出运货币代码
                    "payterm": str(r.payTerm or ""),  # 合同支付期限
                    "paymode": str(r.payMode or ""),  # 合同支付方式
                    "feepaymode": str(r.feePayMode or ""),  # 缴费支付方式
                    "trafficcode": str(r.trafficCode or ""),  # 运输方式
                    "transportdate": transport_date,  # 出运日期
                    "code10": str(r.code10 or ""),  # 海关编码
                    "payername": str(r.payerName or ""),  # 付款人
                    "employeename": str(r.employeeName or ""),  # 业务员姓名
                }
                msg_data_list.append(vo)

            # 3. 构造 MQ 消息
            mq_payload = {"msgType": "doBprShipmentApply_002", "msgData": msg_data_list}

            # 4. 发送 MQ
            result = send_edi_message(mq_payload)
            logger.info(f"EDI出运申报发送结果: {json.dumps(result, ensure_ascii=False, default=str)}")
            if result.get("success"):
                # 5. 发送成功，更新状态为"申请中"并记录申请时间
                for r in batch_records:
                    s.query(shipmentapply).filter(shipmentapply.corpSerialNo == r.corpSerialNo).update(
                        {"applyTime": now_str, "state": "申请中"}
                    )
                s.commit()
                total_sent += len(batch_records)
                total_batch += 1
                logger.info(f"EDI出运申报批次发送成功，消息ID: {result.get('message_id')}")
            else:
                failed_batches.append(
                    {
                        "batch_no": total_batch + 1,
                        "record_count": len(batch_records),
                        "error": str(result.get("error"))[:500],
                    }
                )
                logger.error(f"EDI出运申报批次发送失败: {result.get('error')}")

        # 6. 返回结果
        if failed_batches:
            return json_result(
                1,
                "EDI出运申报部分发送成功",
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
                "EDI出运申报发送成功",
                {"sent_count": total_sent, "batch_count": total_batch, "total_records": len(records)},
            )

    except Exception as e:
        s.rollback()
        logger.error(f"EDI出运申报异常: {trace_error()}")
        return json_result(-1, f"EDI出运申报异常: {trace_error()}")
    finally:
        s.close()
