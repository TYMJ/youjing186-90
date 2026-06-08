// 查询界面或编辑界面打开事件
const staff_Form_Show = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'excel_import_btn',
        "caption": 'Excel导入',
        "icon": 'any-server-update',
        "divided": true
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW], staff_Form_Show, '业务人员')

const staff_form_BtnClick = (evt_id, btn, form) => {
    // let recordset = form.recordset;
    if (btn.name == 'excel_import_btn') {
        _.ui.show_dialog('image-export-form', {
            "rids": [form.current_rid]
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], staff_form_BtnClick, '业务人员')