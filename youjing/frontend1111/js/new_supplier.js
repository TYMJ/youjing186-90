const new_supplier_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = recordset.module.name
    if (field.full_name == m + '.合作等级') {
        if (recordset.val('合作等级') == '黑名单(国税关注)' || recordset.val('合作等级') == '黑名单') {
            if (recordset.set('备    注') == '') {
                recordset.set('备    注', recordset.set('合作等级'))
            } else {
                recordset.set('备    注', recordset.set('备    注') + ';' + recordset.set('合作等级'))
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, new_supplier_field_change, '新财务工厂资料')

// 查询界面或编辑界面打开事件
const new_supplier_Form_Show = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'confirm_btn',
        "caption": '财务确认',
        "icon": 'any-function',
        "divided": true
    });
    btns.push({
        "name": 'btn_import_excel',
        "caption": '批量导入',
        "icon": 'any-function',
        "divided": true
    });
    if (btns.length == 0) {
        return;
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], new_supplier_Form_Show, '新财务工厂资料')

const handleToolbarClick = (form) => {
    // 打开文件选择对话框
    _.ui.show_upload_dialog({
            title: '导入财务工厂资料',
            url: '/api/finance/import_factory_excel',
            accept: '.xlsx',
            auto_close: true,
            success_msg: '导入成功',
            error_msg: '导入失败'
        },
        (res) => {
            if (res.data) {
                let d = res.data
                console.log(d)
                if (d.duplicate_file_name != null && d.duplicate_file_name != '') {
                    _.ui.message.error(_l('请注意有重复工厂记录，正在下载重复记录文件'))
                    _.http.download("/api/tmp/file/get", {
                            file: d.duplicate_file_name
                        },
                        d.duplicate_file_name
                    );
                }
            } else {
                _.ui.error_message(_l('导入失败'))
            }
        })
};


const new_supplier_form_BtnClick = (evt_id, btn, form) => {
    let m = form.module.name;
    let username = _.user.username
    if (btn.name == 'btn_import_excel') {
        handleToolbarClick(form)
    }
    if (btn.name == 'confirm_btn') {
        if (form.is_editor && form.recordset.modified) {
            _.ui.message.error('请先保存数据后再执行该操作')
            return
        }
        _.ui.show_input_select_dialog('请选择确认状态:', '否', ['是', '否']).then(val => {
            if (val == null || val == '') {
                _.ui.message.error('确认状态不能为空');
                return
            }
            let rids = []
            if (form.is_search) {
                rids = form.current_rids.value
            }
            if (rids.length == 0) {
                if (form.current_rid.value != null && form.current_rid.value != '') {
                    rids.push(form.current_rid.value)
                }
            }
            if (rids.length == 0) {
                _.ui.message.error('没有选中任何记录');
                return
            }
            _.http.post('/api/saier/new_supplier/confirm/btn', {
                rids: rids,
                cwqr: val
            }).then(res => {
                // console.log(res)
                _.ui.message.success('财务确认提交成功');
                if (form.is_editor) {
                    form.reload_data()
                } else {
                    form.load_data()
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], new_supplier_form_BtnClick, '新财务工厂资料')


const new_supplier_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/new_supplier/save/before/check', {
            xydm: recordset.val('社会统一信用代码'),
            csmc: recordset.val('厂商名称'),
            rid: recordset.val('rid'),
            yhzh: recordset.val('银行帐号'),
            yhmc: recordset.val('开户银行'),
            csbh: recordset.val('厂商编号')
        }).then(res => {
            let d = res.data
            if (recordset.val('厂商编号') == '' || recordset.val('厂商编号') == null) {
                recordset.val('厂商编号', d.csdm)
            }
            if (recordset.val('社会统一信用代码') == '' || recordset.val('社会统一信用代码') == null) {
                recordset.val('社会统一信用代码', d.xydm)
            }
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '保存失败');
            reject()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, new_supplier_before_save, '新财务工厂资料')