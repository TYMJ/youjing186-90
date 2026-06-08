// 编辑界面记录保存前执行
const exchange_finance_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let t = recordset.tables['汇率详情']
        let d = t.view_data
        for (let r of d){
            recordset.val('汇率详情.核算日期', recordset.val('核算日期'), r);
            recordset.val('汇率详情.核算年月', recordset.val('核算年月'), r);
        }
        if (d.length == 0){
            recordset.append('汇率详情')
            recordset.val('汇率详情.核算日期', recordset.val('核算日期'))
            recordset.val('汇率详情.核算年月', recordset.val('核算年月'))
            recordset.val('汇率详情.货币代码', 'USD$')
            recordset.val('汇率详情.汇  率', recordset.val('汇  率'))
        }
        if (recordset.val('核算日期') != '' && recordset.val('核算日期') != null){
            recordset.val('核算年月', recordset.val('核算日期').substring(0, 7))
        }
        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, exchange_finance_before_save, '财务核算汇率')


// 编辑界面记录保存前执行
const exchange_declaration_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let t = recordset.tables['详情']
        let d = t.view_data
        for (let r of d){
            recordset.val('详情.所属公司', recordset.val('所属公司'), r);
            recordset.val('详情.增值税率', recordset.val('增值税率'), r);
            recordset.val('详情.退税率', recordset.val('退税率'), r);
            recordset.val('详情.报关公司', recordset.val('报关公司'), r);
        }
        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, exchange_declaration_before_save, '报关单价计算')