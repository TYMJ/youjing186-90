// // 付款审批：无预置「扩展」时，用 insert 整块插入「扩展」下拉（与 purchase_ap、电商预填费用一致）

// const payment_statistics_export_BtnClick = async (evt_id, btn, form) => {
//     if (btn.name !== 'payment_statistics_export_btn') {
//         return
//     }

//     const da1 = await _.ui.show_input_dialog('请输入付款起始日期，格式 2010-01-18')
//     if (da1 == null || da1 === undefined) {
//         return
//     }

//     const da2 = await _.ui.show_input_dialog('请输入付款结束日期，格式 2010-01-18')
//     if (da2 == null || da2 === undefined) {
//         return
//     }

//     const da3 = await _.ui.show_input_dialog('1经办人,2外销,3采购,4采购人员（默认1）')
//     if (da3 == null || da3 === undefined) {
//         return
//     }

//     await _.http.post('/api/saier/payment_approval/statistics/export', {
//         da1: da1,
//         da2: da2,
//         da3: da3 || '1',
//         sync_data: true,
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

// const payment_statistics_export_FormShow = (evt_id, form) => {
//     const btns = []
//     if (!form.is_editor) {
//         btns.push({
//             name: 'payment_statistics_export_btn',
//             caption: '付款统计表',
//             icon: 'any-keyborad',
//         })
//     }
//     if (btns.length === 0) {
//         return
//     }
//     form.toolbar.insert([{
//         name: 'payment_statistics_export_menu',
//         caption: '扩展',
//         icon: '#ext-add_database',
//         btns: btns,
//     }], 'close')
// }

// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], payment_statistics_export_BtnClick, '付款审批')
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], payment_statistics_export_FormShow, '付款审批')
