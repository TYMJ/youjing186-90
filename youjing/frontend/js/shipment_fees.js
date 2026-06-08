// 编辑界面数据加载以后执行
const shipment_fees_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username

    recordset.module.field_by_full_name(m + '.货代公司').disabled = true
    recordset.module.field_by_full_name(m + '.申请日期').disabled = true
    recordset.module.field_by_full_name(m + '.发票金额').disabled = true
    recordset.module.field_by_full_name(m + '.申请金额').disabled = true
    recordset.module.field_by_full_name(m + '.付款日期').disabled = true
    recordset.module.field_by_full_name(m + '.付款金额').disabled = true
    recordset.module.field_by_full_name(m + '.财务人员').disabled = true
    recordset.module.field_by_full_name(m + '.申请金额').disabled = true
    recordset.module.field_by_full_name(m + '.税   号').disabled = true
    recordset.module.field_by_full_name(m + '.开户银行').disabled = true
    recordset.module.field_by_full_name(m + '.银行帐号').disabled = true
    recordset.module.field_by_full_name(m + '.所在省份').disabled = true
    recordset.module.field_by_full_name(m + '.所在城市').disabled = true

    recordset.module.field_by_full_name(m + '.用途').disabled = true
    recordset.module.field_by_full_name(m + '.发票为空').disabled = true
    recordset.module.field_by_full_name(m + '.是否结清').disabled = true
    recordset.module.field_by_full_name(m + '.我司抬头').disabled = true
    recordset.module.field_by_full_name(m + '.付款地区').disabled = true
    recordset.module.field_by_full_name(m + '.是否到票').disabled = true
    recordset.module.field_by_full_name(m + '.状  态').disabled = true

    if (recordset.val('经 办 人') == username && recordset.val('财务人员') == '') {
        recordset.module.field_by_full_name(m + '.货代公司').disabled = false;
        recordset.module.field_by_full_name(m + '.申请日期').disabled = false;
        recordset.module.field_by_full_name(m + '.发票金额').disabled = false;
        recordset.module.field_by_full_name(m + '.申请金额').disabled = false;

        recordset.module.field_by_full_name(m + '.税   号').disabled = false;
        recordset.module.field_by_full_name(m + '.开户银行').disabled = false;
        recordset.module.field_by_full_name(m + '.银行帐号').disabled = false;
        recordset.module.field_by_full_name(m + '.所在省份').disabled = false;
        recordset.module.field_by_full_name(m + '.所在城市').disabled = false;
        recordset.module.field_by_full_name(m + '.付款日期').disabled = true
        recordset.module.field_by_full_name(m + '.付款金额').disabled = true
        recordset.module.field_by_full_name(m + '.用途').disabled = false;
        recordset.module.field_by_full_name(m + '.发票为空').disabled = false;

        recordset.module.field_by_full_name(m + '.我司抬头').disabled = false;
        recordset.module.field_by_full_name(m + '.付款地区').disabled = false;
        recordset.module.field_by_full_name(m + '.是否到票').disabled = false;
    }
    if (recordset.val('财务人员') == username) {
        recordset.module.field_by_full_name(m + '.货代公司').disabled = false;
        recordset.module.field_by_full_name(m + '.申请日期').disabled = false;
        recordset.module.field_by_full_name(m + '.发票金额').disabled = false;
        recordset.module.field_by_full_name(m + '.申请金额').disabled = false;
        recordset.module.field_by_full_name(m + '.财务人员').disabled = false;
        recordset.module.field_by_full_name(m + '.申请金额').disabled = false;
        recordset.module.field_by_full_name(m + '.税   号').disabled = false;
        recordset.module.field_by_full_name(m + '.开户银行').disabled = false;
        recordset.module.field_by_full_name(m + '.银行帐号').disabled = false;
        recordset.module.field_by_full_name(m + '.所在省份').disabled = false;
        recordset.module.field_by_full_name(m + '.所在城市').disabled = false;
        recordset.module.field_by_full_name(m + '.是否结清').disabled = false;
        recordset.module.field_by_full_name(m + '.用途').disabled = false;
        recordset.module.field_by_full_name(m + '.发票为空').disabled = false;

        recordset.module.field_by_full_name(m + '.我司抬头').disabled = false;
        recordset.module.field_by_full_name(m + '.付款地区').disabled = false;
        recordset.module.field_by_full_name(m + '.是否到票').disabled = false;
    }
    recordset.refresh_ui();
}
_.evts.on(_.evtids.RECORD_LOADED, shipment_fees_recordLoad, '单证费用')

// 编辑界面字段change后执行
const shipment_fees_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.银行申请状态') {
        if (recordset.val('银行申请状态') != '待提交') {
            return
        }
        if (recordset.val('我方银行帐号') == '') {
            recordset.val('银行申请状态', '无')
            recordset.val('银行申请状态1', '无')
            _.ui.message.error('我方银行帐号为空不能提交')
            return
        }
        _.http.post('/api/saier/shipment_fees/yhzt/change', {
            khyh: recordset.val('开户银行'),
            wfyh: recordset.val('我方银行名称')
        }).then(res => {
            let d = res.data
            let tc1 = ''
            let th1 = ''
            let tc2 = ''
            let th2 = ''
            if (tc1 != '' && tc2 != '') {
                if (tc1 == tc2) {
                    recordset.val('同城异地', '同城');
                } else {
                    recordset.val('同城异地', '异地');
                }
            }
            if (th1 != '' && th2 != '') {
                if (th1 == th2) {
                    recordset.val('同行转账', '同行');
                } else {
                    recordset.val('同行转账', '他行');
                }
            } else {
                if (recordset.val('我方银行名称') == recordset.val('开户银行')) {
                    recordset.val('同行转账', '同行');
                } else {
                    recordset.val('同行转账', '他行');
                }
            }

            if (recordset.val('我方银行帐号') == '' || recordset.val('我方银行名称') == '' || recordset.val('同行转账') == '' || recordset.val('同城异地') == '' || recordset.val('客户号') == '' ||
                recordset.val('单位code') == '' || recordset.val('开户银行') == '' || recordset.val('银行帐号') == '' || recordset.val('用途') == '' || recordset.val('付款金额') < 1) {
                recordset.val('银行申请状态', '无');
                _.ui.message.error('银行付款提交模块或用途、收款信息、付款金额未填不能提交')
            } else {
                recordset.module.field_by_full_name('银行申请状态').disabled = true;
            }
            recordset.val('银行申请状态1', recordset.val('银行申请状态'))
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
            recordset.val('银行申请状态', '无')
            recordset.val('银行申请状态1', '无')
        })
    }
    if (field.full_name == m + '.财务人员' && value != '') {
        _.http.post('/api/saier/shipment_fees/cwry/change', {
            cwry: value,
            rid: recordset.val('rid'),
            module: m,
            sqdh: recordset.val('申请单号')
        }).then(res => {

        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
        })
    }
    if (field.full_name == m + '.是否结清' && value == '是') {
        _.http.post('/api/saier/shipment_fees/sfjq/change', {
            cwry: value,
            rid: recordset.val('rid'),
            module: m,
            sqdh: recordset.val('申请单号')
        }).then(res => {

        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
        })
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shipment_fees_field_change, '单证费用')

const shipment_fees_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('银行申请状态1') != '待提交') {
            return resolve();
        }
        _.http.post('/api/saier/shipment_fees/save/before', {
            rid: recordset.rid,
            data: recordset.tables['单证费用'].view_data
        }).then(res => {
            recordset.val('银行申请状态1', '')
            return resolve();
        }).catch(res => {
            console.log(res)
            return reject(res.msg);
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, shipment_fees_before_save, '单证费用')

const shipment_fees_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'yhzt_cancel_btn',
            "caption": '银行申请状态还原',
            "icon": 'any-keyborad',
        })
    } else {
        btns.push({
            "name": 'yhzt_apply_btn',
            "caption": '批量银行提交',
            "icon": 'any-keyborad',
        })
    }
    if (btns.length == 0) {
        return
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], shipment_fees_FormShow, '单证费用')


const shipment_fees_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'yhzt_cancel_btn') {
        if (form.recordset.val('银行申请状态') != '已提交' && form.recordset.val('银行申请状态') != '申请失败') {
            _.ui.message.error('当前银行申请状态不是已提交或申请失败不能还原')
            return
        }
        _.http.post('/api/saier/shipment_fees/yhzt/cancel', {
            rids: [form.current_rid.value],
            flag: 0
        }).then(res => {
            _.ui.confirm('确定要银行申请状态还原吗？').then(() => {
                form.recordset.val('银行申请状态', '无');
                form.recordset.val('银行申请状态1', '无');
                form.recordset.module.field_by_full_name('银行申请状态').disabled = false;
            })
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    };
    if (btn.name == 'yhzt_apply_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('单证费用记录不能为空');
            return
        }
        _.http.post('/api/saier/shipment_fees/yhzt/cancel', {
            rids: rids,
            flag: 1
        }).then(res => {
            let tllist = res.data.tlist
            _.ui.show_input_select_dialog('请输入或选择银行账号','',tllist).then(val => {
                if (val == '' || val == null || val == undefined) {
                    _.ui.message.error('银行账号不能为空');
                    return
                }
                _.http.post('/api/saier/shipment_fees/yhzt/apply', {
                    rids: rids,
                    module: form.module.name,
                    wsttz: val,
                }).then(res => {
                    if (form.is_editor) {
                        _.platform.active.reload_data()
                    } else {
                        _.platform.active.load_data();
                    }
                    _.ui.message.success(res.msg);
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                });
            })
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shipment_fees_BtnClick, '单证费用')