// // 电商运费：无预置「扩展」时整块 insert（与电商预填费用、预填费用一致）

// const ec_frt_ap_batch_form_BtnClick = async (evt_id, btn, form) => {
//     if (btn.name !== 'ec_frt_ap_batch_export_btn') {
//         return
//     }
//     let rid = form.current_rid.value
//     let rids = form.current_rids.value || []
//     if (rids.length === 0) {
//         if (form.current_rid.value != null && form.current_rid.value !== '') {
//             rids = [form.current_rid.value]
//         }
//     }
//     if (rids.length === 0) {
//         _.ui.message.error('请先选择要操作的记录')
//         return
//     }
//     let mode = await _.ui.show_input_dialog('1 为当前记录，2 为批量（默认 1）', '', '')
//     if (mode === null || mode === undefined) {
//         return
//     }
//     if (String(mode).trim() !== '2') {
//         mode = '1'
//     }
//     let kinds = await _.ui.show_input_dialog(
//         '费用类型（可组合）：1人民币 2拖柜 3美金 4海运另外申请 5额外，如 123 或 135',
//         '',
//         ''
//     )
//     if (kinds === null || kinds === undefined || String(kinds).trim() === '') {
//         return
//     }
//     kinds = String(kinds).replace(/\s/g, '')
//     try {
//         const res = await _.http.post('/api/saier/ec/frt/ap/batch/export', {
//             rid: rid,
//             rids: rids,
//             mode: mode,
//             kinds: kinds,
//         })
//         if (res.code !== 1) {
//             _.ui.message.error(res.msg || '导出失败')
//             return
//         }
//         const d = res.data
//         if (d) {
//             _.http.download(
//                 '/api/tmp/file/get',
//                 { file: d },
//                 d
//             )
//         }
//         _.ui.message.success(res.msg || '导出成功')
//     } catch (err) {
//         _.ui.message.error((err && err.msg) || String(err))
//     }
// }

// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], ec_frt_ap_batch_form_BtnClick, '电商运费')

// const ec_frt_ap_batch_FormShow = (evt_id, form) => {
//     let btns = []
//     if (!form.is_editor) {
//         btns.push({
//             name: 'ec_frt_ap_batch_export_btn',
//             caption: '审批单批量导出',
//             icon: 'any-keyborad',
//         })
//     }
//     if (btns.length === 0) {
//         return
//     }
//     form.toolbar.insert(
//         [
//             {
//                 name: 'export_btn',
//                 caption: '扩展',
//                 icon: '#ext-add_database',
//                 btns: btns,
//             },
//         ],
//         'close'
//     )
// }

// _.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], ec_frt_ap_batch_FormShow, '电商运费')
