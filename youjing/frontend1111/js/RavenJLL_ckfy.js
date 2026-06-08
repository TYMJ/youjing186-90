// // 查询界面或编辑界面打开事件
// const ckfy_Form_Show = (evt_id, form) => {
//     let btns = []
//     if (form.is_search) {
//         btns.push({
//             "name": 'export_btn1',
//             "caption": '选中库存导出',
//             "icon": 'any-function',
//             "divided": true
//         });
      
//     }
//     if (btns.length == 0) {
//         return;
//     }
//     form.toolbar.insert([{
//         "name": 'export_btn',
//         "caption": '报表按钮',
//         "icon": '#ext-add_database',
//         "btns": btns,
//         "divided": true
//     }], 'close');
// }
// _.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], ckfy_Form_Show, '仓库费用')


// // 查询界面或编辑界面、子表上按钮点击事件
// const ckfy_form_BtnClick = (evt_id, btn, form) => {
//     let username = _.user.username
//     let recordset = form.recordset
  
//     if (btn.name === 'export_btn1') {
//     let rids = form.current_rids.value;
    
//     if (rids.length === 0) {
//         if (form.current_rid.value !== '' && form.current_rid.value != null) {
//             rids = [form.current_rid.value];
//         }
//     }
    
//     if (rids.length === 0) {
//         _.ui.message.error('请先选中要导出的记录');
//         return;
//     }
    
//     _.http.post('/api/RavenCloud/ckfy/report/export', {
//         rids: rids
//     }).then(res => {
//         let d = res.data;
//         if (d && d.path !== '' && d.path != null) {
//             _.http.download('/api/tmp/file/get', {
//                 file: d.path
//             }, d.name || '出库单.xlsx');
//         }
//     }).catch(err => {
//         console.log(err);
//         _.ui.message.error(err.msg || '导出失败');
//     });
// }
//     // 在你现有 cggd_form_BtnClick 里面替换 tsmt 分支
 




// }
// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], ckfy_form_BtnClick, '仓库费用')
