// 编辑界面数据加载以后执行
const order_apply_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let user = _.user.username;
    if (recordset.val('合同状态') == '作废') {
        recordset.module.field_by_full_name(n + '.合同状态').disabled = true;
    }
    _.http.post('/api/saier/order_apply/load/check', {
        rid: recordset.val('rid'),
        ywy: recordset.val('业务员'),
        ywbm: recordset.val('业务部门'),
        zsht: recordset.val('正式合同')
    }).then(function (res) {
        let d = res.data;
        if (recordset.val('业务员') == '' || recordset.val('业务部门') == '') {
            recordset.val('业务员', user);
            recordset.val('业务部门', d.ywbm);
            recordset.val('部门代码', d.bmdm);
            recordset.val('合同判别', d.htlx);
        }
        if (user == recordset.val('业务员') || user == recordset.val('下单人员') || d.path2 == '' || d.path2.indexOf(d.path1) != -1) {
            recordset.module.field_by_full_name(n + '.接单金额').show();
            recordset.module.field_by_full_name(n + '.接单金额￥').show();
            recordset.module.field_by_full_name(n + '.收汇合计').show();
            recordset.module.field_by_full_name(n + '.采购合计').show();
            recordset.module.field_by_full_name(n + '.付款合计').show();
            recordset.module.field_by_full_name(n + '.预计船期').show();
            recordset.module.field_by_full_name(n + '.备  注').show();
            recordset.module.field_by_full_name(n + '.客户名称').disabled = false;
            recordset.module.field_by_full_name(n + '.目的仓库').disabled = false;
            recordset.module.field_by_full_name(n + '.是否新客人').disabled = false;
            recordset.module.field_by_full_name(n + '.客人来源').disabled = false;
            recordset.module.field_by_full_name(n + '.合同状态').disabled = false;
            recordset.module.group_by_name('采购清单').visible = true;
            recordset.module.group_by_name('出运清单').visible = true;
            recordset.module.group_by_name('付款清单').visible = true;
            recordset.module.group_by_name('收汇清单').visible = true;

            recordset.module.field_by_full_name(n + '.客户名称').disabled = (recordset.val('客户名称') != '')
            recordset.module.field_by_full_name(n + '.目的仓库').disabled = (recordset.val('目的仓库') != '')
        } else {
            recordset.module.field_by_full_name(n + '.接单金额').hide();
            recordset.module.field_by_full_name(n + '.接单金额￥').hide();
            recordset.module.field_by_full_name(n + '.收汇合计').hide();
            recordset.module.field_by_full_name(n + '.采购合计').hide();
            recordset.module.field_by_full_name(n + '.付款合计').hide();
            recordset.module.field_by_full_name(n + '.预计船期').hide();
            recordset.module.field_by_full_name(n + '.备  注').hide();
            recordset.module.field_by_full_name(n + '.客户名称').disabled = true;
            recordset.module.field_by_full_name(n + '.目的仓库').disabled = true;
            recordset.module.field_by_full_name(n + '.是否新客人').disabled = true;
            recordset.module.field_by_full_name(n + '.客人来源').disabled = true;
            recordset.module.field_by_full_name(n + '.合同状态').disabled = true;
            recordset.module.group_by_name('采购清单').visible = false;
            recordset.module.group_by_name('出运清单').visible = false;
            recordset.module.group_by_name('付款清单').visible = false;
            recordset.module.group_by_name('收汇清单').visible = false;
        }

        let t = recordset.tables['采购清单'];
        t.data = d.cght_list;
        t.sync_operate_data()
        recordset.do_re_sum_by_trigger_table('采购清单')

        let c = recordset.tables['出运清单'];
        c.data = d.cymx_list;
        c.sync_operate_data()
        recordset.do_re_sum_by_trigger_table('出运清单')

        let f = recordset.tables['付款清单'];
        f.data = d.fkqd_list;
        f.sync_operate_data()
        recordset.do_re_sum_by_trigger_table('付款清单')

        let s = recordset.tables['收汇清单'];
        s.data = d.skqd_list;
        s.sync_operate_data()
        recordset.do_re_sum_by_trigger_table('收汇清单')
        
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], order_apply_recordLoad, '合同申请')


// 编辑界面字段change后执行
const order_apply_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    if (field.full_name == n + '.合同状态' && value == '完成') {
        recordset.val('完成日期', new Date().format('yyyy-MM-dd'));
    }

    if (field.full_name == n + '.我方公司') {
        if (recordset.val('我方公司') != '') {
            _.http.post('/api/saier/order_apply/wfgs/change', {
                // ywy: recordset.val('业务员'),
                wfgs: recordset.val('我方公司'),
                khmc: recordset.val('客户名称'),
                ywbm: recordset.val('业务部门')
            }).then(function (res) {
                let d = res.data;
                let bmdm = d.bmdm;
                let htlx = d.htlx;
                recordset.val('部门代码', bmdm);
                recordset.val('合同判别', htlx);
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.客户名称') {
        if (recordset.val('客户名称') != '') {
            _.http.post('/api/saier/order_apply/khmc/change', {
                ywy: recordset.val('业务员'),
                khmc: recordset.val('客户名称'),
                ywbm: recordset.val('业务部门')
            }).then(function (res) {
                let d = res.data;
                console.log(d);
                let bmdm = d.bmdm;
                let htlx = d.htlx;
                recordset.val('部门代码', bmdm);
                recordset.val('合同判别', htlx);
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, order_apply_field_change, '合同申请')

// 编辑界面记录保存前执行
const order_apply_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('是否新客人') == '是' && recordset.val('客人来源') == '') {
            _.ui.message.error('请先填客人来源在确定是否新客人');
            recordset.val('是否新客人', '');
            reject();
            return
        }
        recordset.val('唯一字段', recordset.val('rid'))
        if (recordset.val('合同号码') != '' && recordset.val('合同号码') != null) {
            resolve();
            return;
        }
        _.http.post('/api/saier/order_apply/save/before', {
            khmc: recordset.val('客户名称'),
            htlx: recordset.val('合同判别'),
            wfgs_n: recordset.val('我方公司'),
            bmdm: recordset.val('部门代码'),
            ckyw: recordset.val('仓库英文')
        }).then(function (res) {
            let d = res.data;
            recordset.val('合同号码', d.hthm);
            if (d.path && d.path != '') {
                recordset.val('业务path', d.path);
                // if (recordset.val('sys_path') == '' || recordset.val('sys_path') == null) {
                //     recordset.val('sys_path', d.path);
                // }
            }
            resolve();
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject();
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, order_apply_before_save, '合同申请')


// 查询界面或编辑界面打开事件
const order_apply_Form_Show = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'batch_apply_btn',
        "caption": '批量申请',
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW], order_apply_Form_Show, '合同申请')


const order_apply_form_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'batch_apply_btn') {
        _.http.post('/api/saier/order_apply/get/wfgs', {}).then(res => {
            _.ui.show_input_select_dialog('请选择我方公司:', '', res.data).then(val => {
                _.ui.show_dialog('order_apply_form', {
                    wfgs: val,
                })
            });
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], order_apply_form_BtnClick, '合同申请')