// const samples_BtnClick1 = (evt_id, btn, form) => {
//     // 当前产品导出（图）
//     if (btn.name == "current_product_export_btn") {
//         if (form.is_search == true) {
//           rids = form.current_rid.value;
//         }
//         if (form.is_editor == true) {
//           rids = form.recordset.rid;
//         }

//         if (rids.length == 0) {
//           if (form.current_rid.value && form.current_rid.value != "") {
//             rids = [form.current_rid.value];
//           }
//         }
//         if (rids.length == 0) {
//           _.ui.message.error("未选中数据,无法操作");
//           return;
//         }
//         _.ui.show_input_dialog("请输入要导出的地区(宁波，义乌),不输为全部", '').then((region) => {
//             // 调用后端接口进行数据导出
//             _.http.post("/api/saier/samples/export_current_product", {
//                 rids: rids,
//                 region: region
//             }).then((res) => {
//                 if (res.code === 1) {
//                     let d = res.data;
//                     let filename = (d && typeof d === 'object') ? d.filename : d;
//                     if (filename != '' && filename != null) {
//                         _.http.download("/api/tmp/file/get", {
//                             file: filename
//                         }, filename);
//                     }
//                 } else {
//                     _.ui.message.error(res.msg);
//                 }
//             }).catch(res => {
//                 console.error("导出失败", res);
//                 _.ui.message.error(res.msg);
//             });
//         });
//     }
// };
// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], samples_BtnClick1, "样品管理");

// const samples_FormShow1 = (evt_id, form) => {
//     let btns = [];
//     btns.push({
//         name: "current_product_export_btn",
//         caption: "当前产品导出（图）",
//         icon: "any-keyborad",
//     });
//     form.toolbar.insert([{
//             name: "export_btn1",
//             caption: "扩展1",
//             icon: "#ext-add_database",
//             btns: btns,
//         },],"close",);
// };
    
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], samples_FormShow1, "样品管理");