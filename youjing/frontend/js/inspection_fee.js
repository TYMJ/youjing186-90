// 编辑界面字段change后执行
const inspection_fee_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name

    if (field.full_name == m + '.是否提交') {
        if (recordset.val('是否提交') == '是') {
            recordset.val('提交日期', new Date().format('yyyy-MM-dd hh:mm:ss'))
        }else{
            recordset.val('提交日期', '')
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, inspection_fee_field_change, '验货费用登记')

// 编辑界面记录保存前执行
const inspection_fee_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/inspection/fee/check', {
            sftj: '是',
            hthm: recordset.val('合同号码')
        }).then(res => {
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, inspection_fee_before_save, '验货费用登记')