// // 采购付款：「报表」工具栏（写法同 payment.js「扩展」）

// const _getSelectedRids = (form) => {
//     const rids = []
//     if (form && form.current_rids && Array.isArray(form.current_rids.value)) {
//         for (const v of form.current_rids.value) {
//             if (v !== undefined && v !== null && String(v).trim() !== '') {
//                 rids.push(String(v).trim())
//             }
//         }
//     }
//     // 单条点选时常在 current_rid，不在 current_rids
//     if (rids.length === 0 && form && form.current_rid && form.current_rid.value) {
//         rids.push(String(form.current_rid.value).trim())
//     }
//     return rids
// }

// const purchase_payment_accounting_export_BtnClick = async (evt_id, btn, form) => {
//     if (btn.name !== 'purchase_payment_accounting_export_btn') {
//         return
//     }

//     const rids = _getSelectedRids(form)
//     if (rids.length === 0) {
//         _.ui.message.error('请先选择要导出的记录!')
//         return
//     }

//     await _.http.post('/api/saier/purchase_payment/accounting/export', {
//         rids: rids,
//     }).then(res => {
//         if (res.code != 1) {
//             _.ui.message.error(res.msg)
//             return
//         }
//         const d = res.data
//         if (d && d !== '') {
//             _.http.download('/api/tmp/file/get', { file: d }, d)
//         }
//         _.ui.message.success(res.msg)
//     }).catch(err => {
//         _.ui.message.error(err.msg || String(err))
//         console.log(err)
//     })
// }

// const purchase_payment_accounting_export_FormShow = (evt_id, form) => {
//     let btns = []
//     if (!form.is_editor) {
//         btns.push({
//             name: 'purchase_payment_accounting_export_btn',
//             caption: '做账导出',
//             icon: 'any-keyborad',
//         })
//     }
//     if (btns.length == 0) {
//         return
//     }
//     form.toolbar.insert([{
//         name: 'purchase_payment_report_ext_btn',
//         caption: '报表',
//         icon: '#ext-add_database',
//         btns: btns,
//     }], 'close')
// }

// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], purchase_payment_accounting_export_BtnClick, '采购付款')
// _.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], purchase_payment_accounting_export_FormShow, '采购付款')
