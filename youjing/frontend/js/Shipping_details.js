// const shipping_BtnClick = (evt_id, btn, form) => {
//     let username = _.user.username;
//     let recordset = form.recordset;

// };

// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shipping_BtnClick, "出运明细");

// const shipping_FormShow = (evt_id, form) => {
//     let btns = [];

//     if (!form.is_editor) {
//         btns.push({
//             name: "BP_OC_btn",
//             caption: "BP CO清单",
//             icon: "any-keyborad",
//         });
//     }
//     if (!form.is_editor) {
//         btns.push({
//             name: "Special_list_btn",
//             caption: "特殊报表打印",
//             icon: "any-keyborad",
//         });
//     }
//     if (!form.is_editor) {
//         btns.push({
//             name: "IR_list_btn",
//             caption: "优景I.R",
//             icon: "any-keyborad",
//         });
//     }
  
//     if (btns.length == 0) {
//         return;
//     }
    
//     form.toolbar.insert(
//         [{
//             name: "export_btn2",
//             caption: "扩展1",
//             icon: "#ext-add_database",
//             btns: btns,
//         }, ],
//         "close",
//     );
// };
// _.evts.on(
//     [_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW],
//     shipping_FormShow,
//     "出运明细",
// );