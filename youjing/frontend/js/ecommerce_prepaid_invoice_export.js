// // 电商预填费用：页面无预置「扩展」时，用 insert 整块插入「扩展」下拉（与 purchase_ap 一致）

// const ecommerce_prepaid_invoice_FormShow = (evt_id, form) => {
//     let btns = []
//     if (form.is_search) {
//         btns.push({
//             name: 'billed_download_btn',
//             caption: '开票信息导出',
//             icon: 'any-keyborad',
//         })
//     }
//     if (btns.length === 0) {
//         return
//     }
//     form.toolbar.insert([{
//         name: 'export_btn',
//         caption: '扩展',
//         icon: '#ext-add_database',
//         btns: btns,
//     }], 'close')
// }
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], ecommerce_prepaid_invoice_FormShow, '电商预填费用')


// const ecommerce_prepaid_invoice_BtnClick = async (evt_id, btn, form) => {
//     if (btn.name == 'billed_download_btn') {
//         let rids = form.current_rids.value
//         if (rids.length == 0) {
//             if (form.current_rid.value && form.current_rid.value != '') {
//                 rids = [form.current_rid.value]
//             }
//         }
//         if (rids.length == 0) {
//             _.ui.message.error('电商预填费用记录不能为空');
//             return
//         }
//         let tp = await _.ui.show_input_select_dialog('请选择开票信息导出类型', '', ['PDF', '批量PDF'])
//         if (tp == '' || tp == null || tp == undefined) {
//             _.ui.message.error('请选择开票信息导出模板类型');
//             return
//         }
//         _.http.post('/api/saier/ecommerce_prepaid_invoice/billed/download', {
//             rids: rids,
//             kind: tp
//         }).then(r => {
//             _.http.download("/api/tmp/file/get", {
//                     file: r.data.path
//                 },
//                 r.data.name + '.xlsx'
//             ).then(res => {
//                 _.ui.message.success('下载成功');
//             }).catch(res => {
//                 _.ui.message.error(res.msg);
//                 console.log(res);
//             });
//         }).catch(r => {
//             _.ui.message.error(r.msg);
//             console.log(r);
//         });
//     }
// }
// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], ecommerce_prepaid_invoice_BtnClick, '电商预填费用')
