// const document_fee_form_BtnClick = (evt_id, btn, form) => {
//     if (btn.name == "document_fee_btn") {
//         let rid = form.current_rid.value
//         let rids = form.current_rids.value
//         if (rids.length == 0) {
//             if (form.current_rid.value != '' && form.current_rid.value != null) {
//                 rids.push(form.current_rid.value)
//             }
//         }
//         if (rids.length == 0) {
//             _.ui.message.error('请先选择要操作的记录!')
//             return;
//         }
//         _.ui.show_input_dialog('当前输1, 全部输2, 不输为当前').then(tp => {
//             if (tp == null || tp == undefined) return
//             if (tp != '2') tp = '1'

//             _.http.post('/api/saier/document/fee/generate', {
//                 rid: rid,
//                 rids: rids,
//                 iekedit: tp,
//             }).then(res => {
//                 if (res.code != 1) {
//                     _.ui.message.error(res.msg)
//                     return
//                 }
//                 let d = res.data;
//                 console.log("生成结果", res)
//                 if (d && d != '') {
//                     _.http.download("/api/tmp/file/get", {
//                         file: d
//                     }, d
//                     );
//                 }
//                 _.ui.message.success(res.msg)
//             }).catch(err => {
//                 _.ui.message.error(err.msg)
//                 console.log(err)
//             })
//         })
//     }
// }
// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], document_fee_form_BtnClick, '货代费用')


// const document_fee_FormShow = (evt_id, form) => {
//     // console.log("单证费用单据显示", evt_id, form)
//     let btns = form.toolbar.btns?.[20]?.[0]?.btns
//     // console.log("123213", btns)
//     if (!form.is_editor) {
//         btns.push({
//             "name": "document_fee_btn",
//             "caption": "商检费用导出",
//             "icon": "any-keyborad",
//         })
//     }
//     if (btns?.length == 0) {
//         return;
//     }
// }
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], document_fee_FormShow, '货代费用')