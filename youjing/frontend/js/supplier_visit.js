// 编辑界面数据加载以后执行
const supplier_visit_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username;
    if (recordset.val('登 记 人') == '') {
        recordset.val('登 记 人', username);
    }
    _.http.post('/api/saier/supplier_visit/load/check', {}).then(res => {
        let d = res.data;
        recordset.module.field_by_full_name(m + '.提交主管').disabled = false
        recordset.module.field_by_full_name(m + '.主管审批').disabled = false
        recordset.module.field_by_full_name(m + '.主管审批日期').disabled = false
        recordset.module.field_by_full_name(m + '.审批意见').disabled = false
        recordset.module.field_by_full_name(m + '.提交总监').disabled = false
        recordset.module.field_by_full_name(m + '.总监审批').disabled = false
        recordset.module.field_by_full_name(m + '.总监审批日期').disabled = false
        recordset.module.field_by_full_name(m + '.总监意见').disabled = false
        recordset.module.field_by_full_name(m + '.总   监').disabled = false
        recordset.module.field_by_full_name(m + '.总监核准').disabled = false
        recordset.module.field_by_full_name(m + '.总监核准日期').disabled = false
        recordset.module.field_by_full_name(m + '.总 经 理').disabled = false
        recordset.module.field_by_full_name(m + '.总经理核准').disabled = false
        recordset.module.field_by_full_name(m + '.总经理核准日期').disabled = false
        if ((recordset.val('总   监') != '') ||
            ((recordset.val('提交总监') != username) && (recordset.val('提交主管') != username) && (recordset.val('登 记 人') != username)) ||
            ((recordset.val('提交总监') == username) && (recordset.val('总监审批') == '通过')) ||
            ((recordset.val('提交主管') == username) && (recordset.val('主管审批') == '通过'))
        ) {
            let r = d.gcbf;
            for (let f of r) {
                if (f.xm == '' || f.bz == '') {
                    continue;
                }
                let xm = m
                if (f.xm == '拜访名单' || f.xm == '拜访费用' || f.xm == '行程明细') {
                    xm = m + '.' + f.xm
                }
                recordset.module.field_by_full_name(xm + '.' + f.bz).disabled = true;
            };
            recordset.tables['拜访名单']._.toolbar.show('delete', false);
            recordset.tables['拜访名单']._.toolbar.show('new', false);
            recordset.tables['拜访名单']._.toolbar.show('copy', false);
            recordset.tables['拜访名单']._.toolbar.show('insert-data', false);
            recordset.tables['拜访费用']._.toolbar.show('delete', false);
            recordset.tables['拜访费用']._.toolbar.show('new', false);
            recordset.tables['拜访费用']._.toolbar.show('copy', false);
            recordset.tables['拜访费用']._.toolbar.show('insert-data', false);
            recordset.tables['行程明细']._.toolbar.show('delete', false);
            recordset.tables['行程明细']._.toolbar.show('new', false);
            recordset.tables['行程明细']._.toolbar.show('copy', false);
            recordset.tables['行程明细']._.toolbar.show('insert-data', false);
            if (recordset.val('总   监') != '') {
                // recordset.module.group_by_name('主管审批').visible = false;
                // recordset.module.group_by_name('总监审批').visible = false;
            } else {
                // recordset.module.group_by_name('付款审批').visible = false;
                recordset.module.group_by_name('拜访费用').visible = false;
            }
            // if ((recordset.val('总   监') == username) || (recordset.val('总 经 理') == username)) {
            //     recordset.module.group_by_name('主管审批').visible = true;
            //     recordset.module.group_by_name('总监审批').visible = true;
            // }
        } else {
            if ((recordset.val('提交主管') != '') && (recordset.val('登 记 人') == username)) {
                recordset.tables['拜访名单']._.toolbar.show('delete', false);
                recordset.tables['拜访名单']._.toolbar.show('new', false);
                recordset.tables['拜访名单']._.toolbar.show('copy', false);
                recordset.tables['拜访名单']._.toolbar.show('insert-data', false);
            };
            if (recordset.val('总监审批') != '通过') {
                // recordset.module.group_by_name('付款审批').visible = false;
                recordset.module.group_by_name('拜访费用').visible = false;
            }
            recordset.module.field_by_full_name(m + '.提交主管').disabled = true
            recordset.module.field_by_full_name(m + '.主管审批').disabled = true
            recordset.module.field_by_full_name(m + '.主管审批日期').disabled = true
            recordset.module.field_by_full_name(m + '.审批意见').disabled = true
            recordset.module.field_by_full_name(m + '.提交总监').disabled = true
            recordset.module.field_by_full_name(m + '.总监审批').disabled = true
            recordset.module.field_by_full_name(m + '.总监审批日期').disabled = true
            recordset.module.field_by_full_name(m + '.总监意见').disabled = true
            recordset.module.field_by_full_name(m + '.总   监').disabled = true
            recordset.module.field_by_full_name(m + '.总监核准').disabled = true
            recordset.module.field_by_full_name(m + '.总监核准日期').disabled = true
            recordset.module.field_by_full_name(m + '.总 经 理').disabled = true
            recordset.module.field_by_full_name(m + '.总经理核准').disabled = true
            recordset.module.field_by_full_name(m + '.总经理核准日期').disabled = true
        }
        if (((recordset.val('登 记 人') == '') || (recordset.val('登 记 人') == username)) && (recordset.val('提交主管') == '')) {
            recordset.module.field_by_full_name(m + '.提交主管').disabled = false
        }
        if ((recordset.val('登 记 人') == username) && (recordset.val('总监审批') == '通过') && (recordset.val('总   监') == '')) {
            recordset.module.field_by_full_name(m + '.总   监').disabled = false
        }
        if (((recordset.val('提交主管') == username) || (recordset.val('提交总监') == username)) && (recordset.val('主管审批') != '通过')) {
            recordset.module.field_by_full_name(m + '.主管审批').disabled = false
            recordset.module.field_by_full_name(m + '.主管审批日期').disabled = false
            recordset.module.field_by_full_name(m + '.审批意见').disabled = false
        }
        if ((recordset.val('提交总监') == username) && (recordset.val('总监审批') != '通过') && (recordset.val('总   监') == '') && (recordset.val('主管审批') == '通过')) {
            recordset.module.field_by_full_name(m + '.总监审批').disabled = false
            recordset.module.field_by_full_name(m + '.总监审批日期').disabled = false
            recordset.module.field_by_full_name(m + '.总监意见').disabled = false
        }
        if ((recordset.val('总   监') == username) && (recordset.val('总监核准') != '通过')) {
            recordset.module.field_by_full_name(m + '.总监核准').disabled = false
            recordset.module.field_by_full_name(m + '.总监核准日期').disabled = false

        }
        if ((recordset.val('总 经 理') == username) && (recordset.val('总监核准') == '通过')) {
            recordset.module.field_by_full_name(m + '.总经理核准').disabled = false
            recordset.module.field_by_full_name(m + '.总经理核准日期').disabled = false
        }
        recordset.module.group_by_name('拜访名单').visible = (d && d.cwpd != 1);
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], supplier_visit_recordLoad, '工厂拜访')

// 编辑界面字段change后执行
const supplier_visit_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.结束日期' || field.full_name == m + '.起始日期') {
        if (recordset.val('结束日期') != null && recordset.val('结束日期') != '' && recordset.val('起始日期') != null && recordset.val('起始日期') != '') {
            if (recordset.val('结束日期') < recordset.val('起始日期')) {
                _.ui.message.error('请注意结束日期早于起始日期');
                recordset.val('结束日期', '');
            }
        }
    }
    if (field.full_name == m + '.拜访名单.货 源 地') {
        let hyd = recordset.val('拜访名单.货 源 地');
        if (hyd != '' && (hyd.indexOf('其他') != -1 || hyd.indexOf('其它') != -1)) {
            _.ui.message.error('请注意货源地中不能包含其他或其它');
            recordset.val('拜访名单.货 源 地', '');
        }
    }
    let fields = [m + '.拜访名单.厂商名称', m + '.拜访名单.电话号码', m + '.拜访名单.手机号码', m + '.拜访名单.详细地址', m + '.拜访名单.电子邮件', m + '.拜访名单.企业QQ', m + '.拜访名单.公司主页']
    if (fields.indexOf(field.full_name) != -1) {
        let rid = recordset.val('rid');
        let cname = recordset.val('拜访名单.厂商名称');
        let phone = recordset.val('拜访名单.电话号码');
        let sjhm = recordset.val('拜访名单.手机号码');
        let address = recordset.val('拜访名单.详细地址');
        let email = recordset.val('拜访名单.电子邮件');
        let qyQQ = recordset.val('拜访名单.企业QQ');
        let web = recordset.val('拜访名单.公司主页');
        if (cname != '' || (web !== '' && web != '无') || qyQQ != '' || (email != '' && email != '无') || address != '' || sjhm != '' || phone != '') {
            _.http.post('/api/saier/supplier_visit/sccj/change', {
                rid: rid,
                cname: cname,
                phone: phone,
                sjhm: sjhm,
                address: address,
                email: email,
                qyQQ: qyQQ,
                web: web
            }).then(function (res) {
                recordset.val('拜访名单.厂商编号', res.data);
                recordset.val('拜访名单.识别', res.data);
                if (res.data != '') {
                    _.ui.message.error('请注意在系统中存在疑似工厂');
                }
            }).catch(err => {
                recordset.val('拜访名单.厂商编号', '');
                recordset.val('拜访名单.识别', '');
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == m + '.总   监' || field.full_name == m + '.总监核准') {
        if (recordset.val('总   监') != '') {
            if (recordset.val('付款户名') != '' && recordset.val('开户银行') != '' && recordset.val('银行帐号') != '') {
                recordset.val('总   监识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
            } else {
                _.ui.message.error('请注意登记信息：付款户名、开户银行、银行帐号为必填');
                recordset.val('总   监', '');
                recordset.val('总 经 理', '');
            }
        } else {
            recordset.val('总   监识别', '');
        }
    }
    if (field.full_name == m + '.总 经 理' || field.full_name == m + '.总经理核准') {
        if (recordset.val('总 经 理') != '') {
            recordset.val('总 经 理识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        } else {
            recordset.val('总 经 理识别', '');
        }
    }
    if (field.full_name == m + '.提交总监' || field.full_name == m + '.总监审批') {
        if (recordset.val('提交总监') != '') {
            recordset.val('总监识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        } else {
            recordset.val('总监识别', '');
        }
    }
    if (field.full_name == m + '.提交主管' || field.full_name == m + '.主管审批') {
        if (recordset.val('提交主管') != '') {
            recordset.val('主管识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        } else {
            recordset.val('主管识别', '');
        }
    }
    if (field.full_name == m + '.主管审批') {
        if (recordset.val('主管审批') != '待审批' && recordset.val('主管审批') != '') {
            recordset.val('主管审批日期', new Date().format('yyyy-MM-dd'));
        } else {
            recordset.val('主管审批日期', null);
        }
        if (recordset.val('提交总监') == recordset.val('提交主管')) {
            recordset.val('总监审批', recordset.val('主管审批'));
            recordset.val('总监审批日期', new Date().format('yyyy-MM-dd'));
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, supplier_visit_field_change, '工厂拜访')


const supplier_visit_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'fees_apply_btn',
        "caption": '生成费用申请',
        "icon": 'any-keyborad',
    })
    if (form.is_editor === true) {
        btns.push({
            "name": 'supplier_new_btn',
            "caption": '生成潜在工厂',
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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], supplier_visit_FormShow, '工厂拜访')


const supplier_visit_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'fees_apply_btn') {
        if (form.is_editor === true) {
            let recordset = form.recordset
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后再进行生成费用申请操作')
                return
            }
        }
        _.ui.confirm('是否生成费用申请？').then(() => {
            _.http.post('/api/saier/supplier_visit/fees/apply', {
                rid: form.current_rid.value,
            }).then(function (res) {
                _.ui.message.success('生成费用申请成功,请等待审核!')
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        })

    }
    if (btn.name == 'supplier_new_btn') {
        if (form.is_editor === true) {
            let recordset = form.recordset
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后再进行生成潜在工厂操作')
                return
            }
        }
        _.ui.confirm('是否生成潜在工厂？').then(() => {
            _.http.post('/api/saier/supplier_visit/supplier/new', {
                rid: form.current_rid.value,
            }).then(function (res) {
                _.ui.message.success('生成潜在工厂成功!')
                _.platform.active.reload_data()
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], supplier_visit_BtnClick, '工厂拜访')


const supplier_visit_get_row_class_name = (eid, {
    form,
    row,
    rowIndex,
    $rowIndex
}, res) => {
    if (row.sb == '' || row.sb == null) {
        res.class = "supplier_visit_class"
    }
}
_.evts.on(_.evtids.MODULE_EDITOR_GET_ROW_CLASS_NAME, supplier_visit_get_row_class_name, '工厂拜访.拜访名单')


const supplier_visit_after_save = (evt_id, recordset) => {
    let zgsp = recordset.val('主管审批')
    let zjhz = recordset.val('总监审批')
    let fkzj = recordset.val('总监核准')
    let zjl = recordset.val('总经理核准')
    let status = 1
    if (recordset.val('wf_unit') == '主管审批' && (zgsp == '' || recordset.val('提交主管').includes(_.user.username) == false 
        || zgsp == '待审批')) {
        return
    } else if (recordset.val('wf_unit') == '拜访总监审' && (zjhz == '' || recordset.val('提交总监').includes(_.user.username) == false 
        || zjhz == '待审批')) {
        return
    } else if (recordset.val('wf_unit') == '付款总监审' && (fkzj == '' || recordset.val('总   监').includes(_.user.username) == false 
        || fkzj == '待审批')) {
        return
    } else if (recordset.val('wf_unit') == '总经理审批' && (zjl == '' || recordset.val('总 经 理').includes(_.user.username) == false 
        || zjl == '待审批')) {
        return
    }
    if (recordset.val('wf_unit') == '主管审批') {
        status = (2 - (zgsp == '通过' ? 1 : 2))
    } else if (recordset.val('wf_unit') == '拜访总监审') {
        status = (2 - (zjhz == '通过' ? 1 : 2))
    } else if (recordset.val('wf_unit') == '付款总监审') {
        status = (2 - (fkzj == '通过' ? 1 : 2))
    } else if (recordset.val('wf_unit') == '总经理审批') {
        status = (2 - (zjl == '通过' ? 1 : 2))
    }
    _.http.post('/api/saier/audit/save/after', {
        rid: recordset.val('rid'),
        module: recordset.module.name,
    }).then(r => {
        console.log(r)
        if (r.code == 0) {
            return
        }
        let d = r.data
        _.http.post('/api/workflow/task/flow', {
            instance: d.instance_rid,
            status: status,
            task_id: d.task_rid,
            memo: ''
        }).then(res => {
            // if (recordset.val('wf_unit') == '审批处理') {
                // recordset.val('wf_unit', '认证人员')
                // recordset.module.field_by_full_name('工厂审批.是否确认').disabled = false
            // }
            _.platform.active.reload_data()
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }).catch(r => {
        _.ui.message.error(r.msg);
        console.log(r);
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, supplier_visit_after_save, '工厂拜访')
