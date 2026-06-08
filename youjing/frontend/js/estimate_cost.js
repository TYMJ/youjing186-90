// 电商运费-字段改变主函数
const estimate_cost_field_change = async (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record
    let m = module.name;
    if (field.full_name == m + '.R提交单证') {
        recordset.val('R单证', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('R单证1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.E提交单证') {
        recordset.val('E单证', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('E单证1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.T提交单证') {
        recordset.val('T单证', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('T单证1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.M提交单证') {
        recordset.val('M单证', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('M单证1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.H提交单证') {
        recordset.val('H单证', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('H单证1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.R提交业务') {
        recordset.val('R业务', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('R业务1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.E提交业务') {
        recordset.val('E业务', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('E业务1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.T提交业务') {
        recordset.val('T业务', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('T业务1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.M提交业务') {
        recordset.val('M业务', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('M业务1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.H提交业务') {
        recordset.val('H业务', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('H业务1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.R单证审批') {
        if (recordset.val('R单证审批') == '通过' && recordset.val('R提交业务') == '') {
            recordset.val('R提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.R提交业务').disabled = false
        } else if (recordset.val('R单证审批') != '通过') {
            recordset.val('R提交业务', '');
            recordset.module.field_by_full_name(m + '.R提交业务').disabled = true
        }
        recordset.val('R单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('R单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.R单证审批') {
        if (recordset.val('R单证审批') == '通过' && recordset.val('R提交业务') == '') {
            recordset.val('R提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.R提交业务').disabled = false
        } else if (recordset.val('R单证审批') != '通过') {
            recordset.val('R提交业务', '');
            recordset.module.field_by_full_name(m + '.R提交业务').disabled = true
        }
        recordset.val('R单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('R单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.E单证审批') {
        if (recordset.val('E单证审批') == '通过' && recordset.val('E提交业务') == '') {
            recordset.val('E提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.E提交业务').disabled = false
        } else if (recordset.val('E单证审批') != '通过') {
            recordset.val('E提交业务', '');
            recordset.module.field_by_full_name(m + '.E提交业务').disabled = true
        }
        recordset.val('E单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('E单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.T单证审批') {
        if (recordset.val('T单证审批') == '通过' && recordset.val('T提交业务') == '') {
            recordset.val('T提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.T提交业务').disabled = false
        } else if (recordset.val('T单证审批') != '通过') {
            recordset.val('T提交业务', '');
            recordset.module.field_by_full_name(m + '.T提交业务').disabled = true
        }
        recordset.val('T单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('T单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.M单证审批') {
        if (recordset.val('M单证审批') == '通过' && recordset.val('M提交业务') == '') {
            recordset.val('M提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.M提交业务').disabled = false
        } else if (recordset.val('M单证审批') != '通过') {
            recordset.val('M提交业务', '');
            recordset.module.field_by_full_name(m + '.M提交业务').disabled = true
        }
        recordset.val('M单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('M单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.H单证审批') {
        if (recordset.val('H单证审批') == '通过' && recordset.val('H提交业务') == '') {
            recordset.val('H提交业务', '林叶');
            recordset.module.field_by_full_name(m + '.H提交业务').disabled = false
        } else if (recordset.val('H单证审批') != '通过') {
            recordset.val('H提交业务', '');
            recordset.module.field_by_full_name(m + '.H提交业务').disabled = true
        }
        recordset.val('H单证批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('H单证批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    if (field.full_name == m + '.R业务审批') {
        recordset.val('R业务批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('R业务批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.E业务审批') {
        recordset.val('E业务批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('E业务批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.T业务审批') {
        recordset.val('T业务批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('T业务批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.M业务审批') {
        recordset.val('M业务批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('M业务批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }
    if (field.full_name == m + '.H业务审批') {
        recordset.val('H业务批', new Date().format('yyyy-MM-dd hh:mm:ss'));
        recordset.val('H业务批1', new Date().format('yyyy-MM-dd hh:mm:ss'));
    }

    let fields = [m + '.FORM费用', m + '.价 格 单', m + '.商 检 费', m + '.仓库名称', m + '.装柜费用', m + '.进仓费用', m + '.杂费名称', m + '.其它杂费', m + '.核对时间', m + '.费用合计'];

    if (fields.indexOf(field.full_name) !== -1) {
        let hdcw = recordset.value('相关杂费.核对财务', row);
        let wyzd = recordset.value('相关杂费.唯一字段', row);
        let hdsj = recordset.value('相关杂费.核对时间', row);
        if (hdcw == _.user.username) {
            if (hdsj != '' && hdsj != null) {
                recordset.val('相关杂费.核对财务', _.user.username, row);
            } else {
                recordset.val('相关杂费.核对财务', '', row);
            }
        }
    }
}
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, estimate_cost_field_change, '电商运费')

// 子表记录scroll事件
const estimate_cost_table_scroll = (evt_id, table, recordset) => {
    // let module = recordset.module.name
    let rids = recordset.tables['相关杂费'].new_rids
    if (table.group == '相关杂费') {
        if (rids.indexOf(recordset.val('相关杂费.rid')) != -1) {
            return
        }
        let hdcw = recordset.value('相关杂费.核对财务');
        let wyzd = recordset.value('相关杂费.唯一字段');

        if (rids.indexOf(recordset.val('相关杂费.rid')) == -1 && hdcw != '' && hdcw != _.user.username && wyzd != '') {
            for (let field of recordset.module.groups[1].fields) {
                recordset.module.field_by_full_name('电商运费.相关杂费.' + field.name).disabled = true
            }
        } else {
            for (let field of _.model.get_module_by_name('电商运费').group_by_name('相关杂费').fields) {
                if (field.disabled) {
                    continue
                }
                recordset.module.field_by_full_name('电商运费.相关杂费.' + field.name).disabled = false
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, estimate_cost_table_scroll, '电商运费')



// 编辑界面数据加载以后执行
const estimate_cost_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    _.http.post('/api/saier/estimate_cost/load/check', {}).then(res => {
        let d = res.data || {}
        let cwsb = d.cwsb || 0
        if (recordset.val('唯一字段') == '') {
            recordset.module.field_by_full_name(m + '.R单证审批').disabled = true
            recordset.module.field_by_full_name(m + '.T单证审批').disabled = true
            recordset.module.field_by_full_name(m + '.M单证审批').disabled = true
            recordset.module.field_by_full_name(m + '.H单证审批').disabled = true
            recordset.module.field_by_full_name(m + '.E单证审批').disabled = true
        }

        recordset.module.field_by_full_name(m + '.发票号码').disabled = true
        recordset.module.field_by_full_name(m + '.业务部门').disabled = true
        recordset.module.field_by_full_name(m + '.海外仓').disabled = true
        recordset.module.field_by_full_name(m + '.FBA').disabled = true
        recordset.module.field_by_full_name(m + '.起运港').disabled = true
        recordset.module.field_by_full_name(m + '.目的港').disabled = true
        recordset.module.field_by_full_name(m + '.运输方式').disabled = true
        recordset.module.field_by_full_name(m + '.柜型').disabled = true
        recordset.module.field_by_full_name(m + '.体积').disabled = true
        recordset.module.field_by_full_name(m + '.贷代名称').disabled = true
        recordset.module.field_by_full_name(m + '.船公司名称').disabled = true
        recordset.module.field_by_full_name(m + '.单证组别').disabled = true
        recordset.module.field_by_full_name(m + '.出运日期').disabled = true
        recordset.module.field_by_full_name(m + '.经办人').disabled = true
        recordset.module.field_by_full_name(m + '.业务人员').disabled = true
        recordset.module.field_by_full_name(m + '.汇率').disabled = true
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true

        recordset.module.field_by_full_name(m + '.人民币已付').disabled = true
        recordset.module.field_by_full_name(m + '.local费用￥').disabled = true
        recordset.module.field_by_full_name(m + '.人民币货代').disabled = true
        recordset.module.field_by_full_name(m + '.R提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.R单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.R单证备注').disabled = true
        recordset.module.field_by_full_name(m + '.R提交业务').disabled = true
        recordset.module.field_by_full_name(m + '.R业务审批').disabled = true
        recordset.module.field_by_full_name(m + '.R业务备注').disabled = true
        recordset.module.field_by_full_name(m + '.人民币合计').disabled = true
        recordset.module.field_by_full_name(m + '.R财务付款日期').disabled = true

        recordset.module.field_by_full_name(m + '.拖柜已付').disabled = true
        recordset.module.field_by_full_name(m + '.拖柜地点').disabled = true
        recordset.module.field_by_full_name(m + '.拖柜费用').disabled = true
        recordset.module.field_by_full_name(m + '.T提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.T单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.T单证备注').disabled = true
        recordset.module.field_by_full_name(m + '.T提交业务').disabled = true
        recordset.module.field_by_full_name(m + '.T业务审批').disabled = true
        recordset.module.field_by_full_name(m + '.T业务备注').disabled = true
        recordset.module.field_by_full_name(m + '.T财务付款日期').disabled = true

        recordset.module.field_by_full_name(m + '.美金已付').disabled = true
        recordset.module.field_by_full_name(m + '.清关运费$').disabled = true
        recordset.module.field_by_full_name(m + '.海运费$').disabled = true
        recordset.module.field_by_full_name(m + '.关税费用$').disabled = true
        recordset.module.field_by_full_name(m + '.征税费$').disabled = true
        recordset.module.field_by_full_name(m + '.关税费用￥').disabled = true
        recordset.module.field_by_full_name(m + '.征税费￥').disabled = true
        recordset.module.field_by_full_name(m + '.M提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.M单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.M单证备注').disabled = true
        recordset.module.field_by_full_name(m + '.M提交业务').disabled = true
        recordset.module.field_by_full_name(m + '.M业务审批').disabled = true
        recordset.module.field_by_full_name(m + '.M业务备注').disabled = true
        recordset.module.field_by_full_name(m + '.美金合计$').disabled = true
        recordset.module.field_by_full_name(m + '.美金合计￥').disabled = true
        recordset.module.field_by_full_name(m + '.M财务付款日期').disabled = true

        recordset.module.field_by_full_name(m + '.H已付').disabled = true
        recordset.module.field_by_full_name(m + '.海运费另$').disabled = true
        recordset.module.field_by_full_name(m + '.海运费另￥').disabled = true
        recordset.module.field_by_full_name(m + '.H货代').disabled = true
        recordset.module.field_by_full_name(m + '.H提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.H单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.H单证备注').disabled = true
        recordset.module.field_by_full_name(m + '.H提交业务').disabled = true
        recordset.module.field_by_full_name(m + '.H业务审批').disabled = true
        recordset.module.field_by_full_name(m + '.H业务备注').disabled = true
        recordset.module.field_by_full_name(m + '.海运合计$').disabled = true
        recordset.module.field_by_full_name(m + '.海运合计￥').disabled = true
        recordset.module.field_by_full_name(m + '.H财务付款日期').disabled = true

        recordset.module.field_by_full_name(m + '.额外已付').disabled = true
        recordset.module.field_by_full_name(m + '.额外海运费$').disabled = true
        recordset.module.field_by_full_name(m + '.额外海运费￥').disabled = true
        recordset.module.field_by_full_name(m + '.额外备注').disabled = true
        recordset.module.field_by_full_name(m + '.E提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.E单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.E单证备注').disabled = true
        recordset.module.field_by_full_name(m + '.E提交业务').disabled = true
        recordset.module.field_by_full_name(m + '.E业务审批').disabled = true
        recordset.module.field_by_full_name(m + '.E业务备注').disabled = true
        recordset.module.field_by_full_name(m + '.额外合计$').disabled = true
        recordset.module.field_by_full_name(m + '.额外合计￥').disabled = true
        recordset.module.field_by_full_name(m + '.E财务付款日期').disabled = true

        recordset.module.field_by_full_name(m + '.头程美金合计').disabled = true
        recordset.module.field_by_full_name(m + '.头程人民币合计').disabled = true
        recordset.module.field_by_full_name(m + '.关税合计$').disabled = true
        recordset.module.field_by_full_name(m + '.关税合计￥').disabled = true
        recordset.module.field_by_full_name(m + '.财务锁定').disabled = true
        recordset.module.field_by_full_name(m + '.财务备注').disabled = true

        if (cwsb == 1) {
            recordset.module.field_by_full_name(m + '.财务锁定').disabled = false
            recordset.module.field_by_full_name(m + '.财务备注').disabled = false
            recordset.module.field_by_full_name(m + '.E财务付款日期').disabled = false
            recordset.module.field_by_full_name(m + '.H财务付款日期').disabled = false
            recordset.module.field_by_full_name(m + '.M财务付款日期').disabled = false
            recordset.module.field_by_full_name(m + '.T财务付款日期').disabled = false
            recordset.module.field_by_full_name(m + '.R财务付款日期').disabled = false
            recordset.module.field_by_full_name(m + '.人民币已付').disabled = false
            recordset.module.field_by_full_name(m + '.拖柜已付').disabled = false
            recordset.module.field_by_full_name(m + '.美金已付').disabled = false
            recordset.module.field_by_full_name(m + '.H已付').disabled = false
            recordset.module.field_by_full_name(m + '.额外已付').disabled = false
        }
        if (recordset.val('经办人') == _.user.username && recordset.val('R提交单证') == '' && recordset.val('T提交单证') == '' &&
            recordset.val('M提交单证') == '' && recordset.val('H提交单证') == '' && recordset.val('E提交单证') == '') {
            recordset.module.field_by_full_name(m + '.发票号码').disabled = false
            recordset.module.field_by_full_name(m + '.业务部门').disabled = false
            recordset.module.field_by_full_name(m + '.海外仓').disabled = false
            recordset.module.field_by_full_name(m + '.FBA').disabled = false
            recordset.module.field_by_full_name(m + '.起运港').disabled = false
            recordset.module.field_by_full_name(m + '.目的港').disabled = false
            recordset.module.field_by_full_name(m + '.运输方式').disabled = false
            recordset.module.field_by_full_name(m + '.柜型').disabled = false
            recordset.module.field_by_full_name(m + '.体积').disabled = false
            recordset.module.field_by_full_name(m + '.贷代名称').disabled = false
            recordset.module.field_by_full_name(m + '.船公司名称').disabled = false
            recordset.module.field_by_full_name(m + '.单证组别').disabled = false
            recordset.module.field_by_full_name(m + '.出运日期').disabled = false
            recordset.module.field_by_full_name(m + '.客户名称').disabled = false
            recordset.module.field_by_full_name(m + '.业务人员').disabled = false
            recordset.module.field_by_full_name(m + '.汇率').disabled = false
        }
        if (recordset.val('R提交单证') == _.user.username && recordset.val('R提交业务') == '') {
            recordset.module.field_by_full_name(m + '.R单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.R单证备注').disabled = false
            if (recordset.val('R单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.R提交业务').disabled = false
            }
        } else {
            if (recordset.val('R提交业务') == _.user.username && (recordset.val('R财务付款日期') == '' || recordset.val('R财务付款日期') == null)) {
                recordset.module.field_by_full_name(m + '.R业务审批').disabled = false
                recordset.module.field_by_full_name(m + '.R业务备注').disabled = false
            } else {
                if (recordset.val('经办人') == _.user.username && recordset.val('R提交单证') == '') {
                    recordset.module.field_by_full_name(m + '.local费用￥').disabled = false
                    recordset.module.field_by_full_name(m + '.人民币货代').disabled = false
                    recordset.module.field_by_full_name(m + '.R提交单证').disabled = false
                }
            }
        }

        if (recordset.val('T提交单证') == _.user.username && recordset.val('T提交业务') == '') {
            recordset.module.field_by_full_name(m + '.T单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.T单证备注').disabled = false
            if (recordset.val('T单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.T提交业务').disabled = false
            }
        } else {
            if (recordset.val('T提交业务') == _.user.username && (recordset.val('T财务付款日期') == '' || recordset.val('T财务付款日期') == null)) {
                recordset.module.field_by_full_name(m + '.T业务审批').disabled = false
                recordset.module.field_by_full_name(m + '.T业务备注').disabled = false
            } else {
                if (recordset.val('经办人') == _.user.username && recordset.val('T提交单证') == '') {
                    recordset.module.field_by_full_name(m + '.拖柜地点').disabled = false
                    recordset.module.field_by_full_name(m + '.拖柜费用').disabled = false
                    recordset.module.field_by_full_name(m + '.T提交单证').disabled = false
                }
            }
        }
        if (recordset.val('M提交单证') == _.user.username && recordset.val('M提交业务') == '') {
            recordset.module.field_by_full_name(m + '.M单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.M单证备注').disabled = false
            if (recordset.val('M单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.M提交业务').disabled = false
            }
        } else {
            if (recordset.val('M提交业务') == _.user.username && (recordset.val('M财务付款日期') == '' || recordset.val('M财务付款日期') == null)) {
                recordset.module.field_by_full_name(m + '.M业务审批').disabled = false
                recordset.module.field_by_full_name(m + '.M业务备注').disabled = false
            } else {
                if (recordset.val('经办人') == _.user.username && recordset.val('M提交单证') == '') {
                    recordset.module.field_by_full_name(m + '.清关运费$').disabled = false
                    recordset.module.field_by_full_name(m + '.海运费$').disabled = false
                    recordset.module.field_by_full_name(m + '.关税费用$').disabled = false
                    recordset.module.field_by_full_name(m + '.征税费$').disabled = false
                    recordset.module.field_by_full_name(m + '.关税费用￥').disabled = false
                    recordset.module.field_by_full_name(m + '.征税费￥').disabled = false
                    recordset.module.field_by_full_name(m + '.M提交单证').disabled = false
                    recordset.module.field_by_full_name(m + '.美金合计$').disabled = false
                    recordset.module.field_by_full_name(m + '.美金合计￥').disabled = false
                }
            }
        }

        if (recordset.val('H提交单证') == _.user.username && recordset.val('H提交业务') == '') {
            recordset.module.field_by_full_name(m + '.H单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.H单证备注').disabled = false
            if (recordset.val('H单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.H提交业务').disabled = false
            }
        } else {
            if (recordset.val('H提交业务') == _.user.username && (recordset.val('H财务付款日期') == '' || recordset.val('H财务付款日期') == null)) {
                recordset.module.field_by_full_name(m + '.H业务审批').disabled = false
                recordset.module.field_by_full_name(m + '.H业务备注').disabled = false
            } else {
                if (recordset.val('经办人') == _.user.username && recordset.val('H提交单证') == '') {
                    recordset.module.field_by_full_name(m + '.海运费另$').disabled = false
                    recordset.module.field_by_full_name(m + '.海运费另￥').disabled = false
                    recordset.module.field_by_full_name(m + '.H货代').disabled = false
                    recordset.module.field_by_full_name(m + '.H提交单证').disabled = false
                    recordset.module.field_by_full_name(m + '.海运合计$').disabled = false
                    recordset.module.field_by_full_name(m + '.海运合计￥').disabled = false

                }
            }
        }
        if (recordset.val('E提交单证') == _.user.username && recordset.val('E提交业务') == '') {
            recordset.module.field_by_full_name(m + '.E单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.E单证备注').disabled = false
            if (recordset.val('E单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.E提交业务').disabled = false
            }
        } else {
            if (recordset.val('E提交业务') == _.user.username && (recordset.val('E财务付款日期') == '' || recordset.val('E财务付款日期') == null)) {
                recordset.module.field_by_full_name(m + '.E业务审批').disabled = false
                recordset.module.field_by_full_name(m + '.E业务备注').disabled = false
            } else {
                if (recordset.val('经办人') == _.user.username && recordset.val('E提交单证') == '') {
                    recordset.module.field_by_full_name(m + '.额外海运费$').disabled = false
                    recordset.module.field_by_full_name(m + '.额外海运费￥').disabled = false
                    recordset.module.field_by_full_name(m + '.额外备注').disabled = false
                    recordset.module.field_by_full_name(m + '.E提交单证').disabled = false
                    recordset.module.field_by_full_name(m + '.额外合计$').disabled = false
                    recordset.module.field_by_full_name(m + '.额外合计￥').disabled = false
                }
            }
        }
        if (recordset.val('经办人') == _.user.username && recordset.val('财务锁定') == '是') {
            recordset.module.field_by_full_name(m + '.头程美金合计').disabled = false
            recordset.module.field_by_full_name(m + '.头程人民币合计').disabled = false
            recordset.module.field_by_full_name(m + '.关税合计$').disabled = false
            recordset.module.field_by_full_name(m + '.关税合计￥').disabled = false
        }
        recordset.refresh_ui(true)
    }).catch(err => {
        console.error('加载检查失败', err);
        _.ui.message.error((err && err.msg) || '加载检查失败');
    });
}
_.evts.on([_.evtids.RECORD_LOAD], estimate_cost_recordLoad, '电商运费')

const cost_apply_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '相关杂费') {
        let btns = []
        btns.push({
            "name": 'update_cost_btn',
            "caption": '更新仓库费用',
            "icon": 'any-server-update',
        })
        form.toolbar.add([{
            "name": 'audit_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], cost_apply_EditorChildShow, '电商运费')



// 界面加载添加按钮
const estimate_cost_formShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            name: 'again_apply_btn',
            caption: '额外再次申请',
            icon: 'any-keyborad'
        })
    } else {
        btns.push({
            name: 'update_payment_date_btn',
            caption: '财务批量付款日期',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'update_cwth_btn',
            caption: '财务退回',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'ec_frt_ap_batch_export_btn',
            caption: '审批单批量导出',
            icon: 'any-keyborad',
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
};

_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], estimate_cost_formShow, '电商运费');

// 获取当前选中的 rid 列表，等价 Pascal 的 datacenter.getnumberlist
const getSelectedRids = (form) => {
    const rids = [];

    if (form && form.current_rids && Array.isArray(form.current_rids.value)) {
        for (const v of form.current_rids.value) {
            if (v !== undefined && v !== null && String(v).trim() !== '') {
                rids.push(String(v).trim());
            }
        }
    }

    if (rids.length === 0 && form && form.current_rid && form.current_rid.value) {
        rids.push(String(form.current_rid.value).trim());
    }

    return rids;
};

// 电商运费-按钮点击事件
const estimateCostButtonClick = async (evt_id, btn, form) => {
    const recordset = form.recordset;
    // 更新仓库费用
    if (btn.name == 'update_cost_btn') {
        if (form.recordset.val('发票号码') == '') {
            _.ui.message.error('发票号码不能为空，请先填写发票号码');
            return
        }
        _.http.post('/api/saier/estimate_cost/update_cost', {
            fphm: form.recordset.val('发票号码'),
        }).then(res => {
            let d = res.data || [];
            let new_data = []
            for (let r of d) {
                let t = form.recordset.tables['相关杂费'];
                let v = t.view_data || [];
                let i1 = 0
                for (let l of v) {
                    let sqdh = form.recordset.value('相关杂费.唯一字段', l);
                    let hdsj = form.recordset.value('相关杂费.核对时间', l);
                    let hdcw = form.recordset.value('相关杂费.核对财务', l);
                    if (r.sqdh == sqdh) {
                        i1 = i1 + 1
                        if (hdcw != '' && hdcw != _.user.username && (hdsj == '' || hdsj == null)) {
                            form.recordset.val('相关杂费.装柜费用', r.zgf, l);
                            form.recordset.val('相关杂费.唯一字段', r.sqdh, l);
                            form.recordset.val('相关杂费.仓库名称', r.WarehouseName, l);
                        }
                    }
                }
                if (i1 == 0) {
                    new_data.push(r)
                }
            }
            for (let r of new_data) {
                let t = form.recordset.tables['相关杂费'];
                t.append().then(new_row => {
                    let r = t.view_data[t.view_data.length - 1]
                    form.recordset.val('相关杂费.装柜费用', r.zgf, r);
                    form.recordset.val('相关杂费.费用合计', r.zgfy, r);
                    form.recordset.val('相关杂费.唯一字段', r.sqdh, r);
                    form.recordset.val('相关杂费.仓库名称', r.WarehouseName, r);
                });
            }
            _.ui.message.success('更新仓库费用成功');
        }).catch(err => {
            console.error('更新仓库费用失败', err);
            _.ui.message.error((err && err.msg) || '更新仓库费用失败');
        });
    }
    // 财务批量付款日期
    if (btn.name == 'update_payment_date_btn') {
        let rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return
        }
        let res = await _.http.post('/api/saier/estimate_cost/cwry_check').then(v => {
            return v
        }).catch(e => {
            console.error('财务批量付款日期用户校验失败', e);
            return e
        });
        if (!res || res.code != 1) {
            _.ui.message.error((res && res.msg) || '财务批量付款日期用户校验失败');
            return
        }
        let kind = await _.ui.show_input_dialog('￥1,拖柜2,$3,海运4,额外5,任意组合,所有12345:').then(val => {
            if (val == null || val.trim() == '') {
                return ''
            }
            return val
        }).catch(e => {
            console.error('财务批量付款日期类型输入失败', e);
            return null
        })
        console.log('财务批量付款日期类型输入结果', kind);
        if (!kind) {
            return
        }
        if (!/^[12345]+$/.test(kind)) {
            _.ui.message.error('输入有误，请输入任意组合的12345，或者直接输入12345');
            return
        }
        let date = await _.ui.show_input_date_dialog('请输入付款日期:').then(val => {
            if (val == null || val == '') {
                return ''
            }
            return val
        }).catch(e => {
            console.error('财务批量付款日期输入失败', e);
            return null
        })
        if (!date) {
            return
        }
        if (date == '' || date == null) {
            _.ui.message.error('请输入付款日期');
            return
        }
        _.http.post('/api/saier/estimate_cost/update_payment_date', {
            kind: kind,
            rids: rids,
            date: date
        }).then(res => {
            _.ui.message.success('财务批量付款日期更新成功');
        }).catch(err => {
            console.error('财务批量付款日期更新失败', err);
            _.ui.message.error((err && err.msg) || '财务批量付款日期更新失败');
        });
    }
    // 财务退回
    if (btn.name == 'update_cwth_btn') {
        let res = await _.http.post('/api/saier/estimate_cost/cwry_check', {}).catch(err => {
            console.error('财务退回检查失败', err);
            // _.ui.message.error((err && err.msg) || '财务退回检查失败');
        });
        if (!res || res.code != 1) {
            _.ui.message.error((res && res.msg) || '财务退回检查失败');
            return
        }
        let kind = await _.ui.show_input_dialog('￥1,拖柜2,$3,海运4,额外5,任意组合,所有12345:').then(val => {
            if (val == null || val.trim() == '') {
                return ''
            }
            return val
        })
        if (!kind) {
            return
        }
        if (!/^[12345]+$/.test(kind)) {
            _.ui.message.error('输入有误，请输入任意组合的12345，或者直接输入12345');
            return
        }
        let params = {
            kind: kind,
            rid: form.current_rid.value
        };
        _.http.post('/api/saier/estimate_cost/update_cwth', params).then(res => {
            _.ui.message.success('财务退回成功');
            if (form && form.is_editor) {
                _.platform.active.reload_data()
            }
        }).catch(err => {
            console.error('财务退回失败', err);
            _.ui.message.error((err && err.msg) || '财务退回失败');
        });
    }
    // 额外再次申请
    if (btn.name == 'again_apply_btn') {
        if (recordset.val('经办人') != _.user.username) {
            _.ui.message.error('只有经办人才能进行额外再次申请');
            return
        }
        let t = recordset.tables['历史额外费用'];
        t.append().then(new_row => {
            let r = t.view_data[t.view_data.length - 1]
            recordset.val('历史额外费用.额外打印时间', recordset.val('额外打印时间'));
            recordset.val('历史额外费用.额外费用$', recordset.val('额外海运费$'));
            recordset.val('历史额外费用.额外费用￥', recordset.val('额外海运费￥'));
            recordset.val('历史额外费用.备注', '单证备注:' + recordset.val('E单证备注') + ';业务备注:' + recordset.val('E业务备注'));
            recordset.val('额外打印时间', null);
            recordset.val('额外已付', '');
            recordset.val('额外海运费$', 0);
            recordset.val('额外海运费￥', 0);
            recordset.val('额外备注', '');
            recordset.val('E提交单证', '');
            recordset.val('E单证审批', '');
            recordset.val('E单证备注', '');
            recordset.val('E提交业务', '');
            recordset.val('E业务审批', '');
            recordset.val('E业务备注', '');
            recordset.val('E财务付款日期', null);
        })
    }
    if (btn.name == 'ec_frt_ap_batch_export_btn') {
        let rid = form.current_rid.value
        let rids = form.current_rids.value || []
        if (rids.length === 0) {
            if (form.current_rid.value != null && form.current_rid.value !== '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length === 0) {
            _.ui.message.error('请先选择要操作的记录')
            return
        }
        let mode = await _.ui.show_input_dialog('1 为当前记录，2 为批量（默认 1）', '', '')
        if (mode === null || mode === undefined) {
            return
        }
        if (String(mode).trim() !== '2') {
            mode = '1'
        }
        let kinds = await _.ui.show_input_dialog(
            '费用类型（可组合）：1人民币 2拖柜 3美金 4海运另外申请 5额外，如 123 或 135',
            '',
            ''
        )
        if (kinds === null || kinds === undefined || String(kinds).trim() === '') {
            return
        }
        kinds = String(kinds).replace(/\s/g, '')
        try {
            const res = await _.http.post('/api/saier/ec/frt/ap/batch/export', {
                rid: rid,
                rids: rids,
                mode: mode,
                kinds: kinds,
            })
            if (res.code !== 1) {
                _.ui.message.error(res.msg || '导出失败')
                return
            }
            const d = res.data
            if (d) {
                _.http.download(
                    '/api/tmp/file/get', {
                        file: d
                    },
                    d
                )
            }
            _.ui.message.success(res.msg || '导出成功')
        } catch (err) {
            _.ui.message.error((err && err.msg) || String(err))
        }
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], estimateCostButtonClick, '电商运费');


const estimate_cost_before_save = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        let m = recordset.module.name
        if (recordset.val('R货代') == '' && recordset.val('R提交单证') != '') {
            recordset.val('R货代', recordset.val('贷代名称'));
        }
        if (recordset.val('T货代') == '' && recordset.val('T提交单证') != '') {
            recordset.val('T货代', recordset.val('贷代名称'));
        }
        if (recordset.val('M货代') == '' && recordset.val('M提交单证') != '') {
            recordset.val('M货代', recordset.val('贷代名称'));
        }
        if (recordset.val('H货代') == '' && recordset.val('H提交单证') != '') {
            recordset.val('H货代', recordset.val('贷代名称'));
        }
        if (recordset.val('E货代') == '' && (recordset.val('E提交单证') != '')) {
            recordset.val('E货代', recordset.val('贷代名称'));
        }
        if (recordset.val('唯一字段') == '') {
            recordset.val('唯一字段', recordset.val('rid'));
            if (recordset.val('R提交单证') == '') {
                recordset.module.field_by_full_name(m + '.R提交单证').disabled = false
            }
            if (recordset.val('T提交单证') == '') {
                recordset.module.field_by_full_name(m + '.T提交单证').disabled = false
            }
            if (recordset.val('M提交单证') == '') {
                recordset.module.field_by_full_name(m + '.M提交单证').disabled = false
            }
            if (recordset.val('H提交单证') == '') {
                recordset.module.field_by_full_name(m + '.H提交单证').disabled = false
            }
            if (recordset.val('E提交单证') == '') {
                recordset.module.field_by_full_name(m + '.E提交单证').disabled = false
            }
            resolve()
            return
        } else {
            let jsr = recordset.val('经办人');
            let tjdz = '';
            let TNR = '';
            let Rtjdz = '';
            let Ttjdz = '';
            let Mtjdz = '';
            let Htjdz = '';
            let Etjdz = '';
            let messages = [];
            if (recordset.val('R单证') != '' && jsr == _.user.username) {
                Rtjdz = '';
                if (recordset.val('R提交单证') != '' && recordset.val('R单证审批') != '通过') {
                    Rtjdz = recordset.val('R提交单证');
                    recordset.module.field_by_full_name(m + '.local费用￥').disabled = true;
                    recordset.module.field_by_full_name(m + '.人民币部分', '人民币货代').disabled = true;
                    recordset.module.field_by_full_name(m + '.人民币部分', 'R提交单证').disabled = true;
                }
                tjdz = '';
                tjdz = Rtjdz;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '人民币部分提交审批';
                messages.push({
                    'user': tjdz,
                    'TNR': TNR
                })
            }
            if (recordset.val('T单证') != '' && jsr == _.user.username) {
                Ttjdz = '';
                if (recordset.val('T提交单证') != '' && recordset.val('T单证审批') != '通过') {
                    Ttjdz = recordset.val('T提交单证');
                    recordset.module.field_by_full_name(m + '.拖柜地点').disabled = true;
                    recordset.module.field_by_full_name(m + '.拖柜费', '拖柜费用').disabled = true;
                    recordset.module.field_by_full_name(m + '.拖柜费', 'T提交单证').disabled = true;
                }
                tjdz = '';
                tjdz = Ttjdz;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '拖柜费提交审批';
                messages.push({
                    'user': tjdz,
                    'TNR': TNR
                })
            }
            if (recordset.val('M单证') != '' && jsr == _.user.username) {
                Mtjdz = '';
                if (recordset.val('M提交单证') != '' && recordset.val('M单证审批') != '通过') {
                    Mtjdz = recordset.val('M提交单证');
                    recordset.module.field_by_full_name(m + '.清关运费$').disabled = true;
                    recordset.module.field_by_full_name(m + '.海运费$').disabled = true;
                    recordset.module.field_by_full_name(m + '.关税费用$').disabled = true;
                    recordset.module.field_by_full_name(m + '.征税费$').disabled = true;
                    recordset.module.field_by_full_name(m + '.关税费用￥').disabled = true;
                    recordset.module.field_by_full_name(m + '.征税费￥').disabled = true;
                    recordset.module.field_by_full_name(m + '.M提交单证').disabled = true;
                    recordset.module.field_by_full_name(m + '.美金合计$').disabled = true;
                    recordset.module.field_by_full_name(m + '.美金合计￥').disabled = true;
                }
                tjdz = '';
                tjdz = Mtjdz;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '美金部分提交审批';
                messages.push({
                    'user': tjdz,
                    'TNR': TNR
                })
            }
            if (recordset.val('H单证') != '' && jsr == _.user.username) {
                Htjdz = '';
                if (recordset.val('H提交单证') != '' && recordset.val('H单证审批') != '通过') {
                    Htjdz = recordset.val('H提交单证');
                    recordset.module.field_by_full_name(m + '.海运费另$').disabled = true;
                    recordset.module.field_by_full_name(m + '.海运费另￥').disabled = true;
                    recordset.module.field_by_full_name(m + '.H货代').disabled = true;
                    recordset.module.field_by_full_name(m + '.H提交单证').disabled = true;
                    recordset.module.field_by_full_name(m + '.海运合计$').disabled = true;
                    recordset.module.field_by_full_name(m + '.海运合计￥').disabled = true;
                }
                tjdz = '';
                tjdz = Htjdz;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)提交审批';
                messages.push({
                    'user': tjdz,
                    'TNR': TNR
                })
            }
            if (recordset.val('E单证') != '' && jsr == _.user.username) {
                Etjdz = '';
                if (recordset.val('E提交单证') != '' && recordset.val('E单证审批') != '通过') {
                    Etjdz = recordset.val('E提交单证');
                    recordset.module.field_by_full_name(m + '.额外海运费$').disabled = true;
                    recordset.module.field_by_full_name(m + '.额外海运费￥').disabled = true;
                    recordset.module.field_by_full_name(m + '.额外备注').disabled = true;
                    recordset.module.field_by_full_name(m + '.E提交单证').disabled = true;
                    recordset.module.field_by_full_name(m + '.额外合计$').disabled = true;
                    recordset.module.field_by_full_name(m + '.额外合计￥').disabled = true;
                }
                tjdz = '';
                tjdz = Etjdz;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '额外费用提交审批';
                messages.push({
                    'user': tjdz,
                    'TNR': TNR
                })
            }
            recordset.module.field_by_full_name(m + '.发票号码').disabled = true;
            recordset.module.field_by_full_name(m + '.业务部门').disabled = true;
            recordset.module.field_by_full_name(m + '.海外仓').disabled = true;
            recordset.module.field_by_full_name(m + '.FBA').disabled = true;
            recordset.module.field_by_full_name(m + '.起运港').disabled = true;
            recordset.module.field_by_full_name(m + '.目的港').disabled = true;
            recordset.module.field_by_full_name(m + '.运输方式').disabled = true;
            recordset.module.field_by_full_name(m + '.柜型').disabled = true;
            recordset.module.field_by_full_name(m + '.体积').disabled = true;
            recordset.module.field_by_full_name(m + '.贷代名称').disabled = true;
            recordset.module.field_by_full_name(m + '.船公司名称').disabled = true;
            recordset.module.field_by_full_name(m + '.单证组别').disabled = true;
            recordset.module.field_by_full_name(m + '.出运日期').disabled = true;
            recordset.module.field_by_full_name(m + '.业务人员').disabled = true;
            recordset.module.field_by_full_name(m + '.汇率').disabled = true;

            let dzsp = '';
            let nr = '';
            let Rdzsp = '';
            TNR = '';
            let Tdzsp = '';
            let Mdzsp = '';
            let Hdzsp = '';
            let Edzsp = '';
            if (recordset.val('R单证批') != '' && recordset.val('R提交单证') == _.user.username) {
                Rdzsp = '';
                if (recordset.val('R单证审批') != '') {
                    Rdzsp = recordset.val('R单证审批');
                    recordset.module.field_by_full_name(m + '.R单证审批').disabled = true;
                }
                dzsp = '';
                dzsp = Rdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '人民币部分提交审批';
                if (recordset.val('R单证审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '人民币部分单证审批通过';
                } else {
                    if (recordset.val('R单证审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '人民币部分单证审批不通过';
                        recordset.module.field_by_full_name(m + '.R单证审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.R提交单证').disabled = true;
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('T单证批') != '' && recordset.val('T提交单证') == _.user.username) {
                Tdzsp = '';
                if (recordset.val('T单证审批') != '') {
                    Tdzsp = recordset.val('T单证审批');
                    recordset.module.field_by_full_name(m + '.T单证审批').disabled = true;
                }
                dzsp = '';
                dzsp = Tdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '拖柜费提交审批';
                if (recordset.val('T单证审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '拖柜费单证审批通过';
                } else {
                    if (recordset.val('T单证审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '拖柜费单证审批不通过';
                        recordset.val('T单证审批', '');
                        recordset.val('T提交单证', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('M单证批') != '' && recordset.val('M提交单证') == _.user.username) {
                Mdzsp = '';
                if (recordset.val('M单证审批') != '') {
                    Mdzsp = recordset.val('M单证审批');
                    recordset.module.field_by_full_name(m + '.M单证审批').disabled = true;
                }
                dzsp = '';
                dzsp = Mdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '美金部分提交审批';
                if (recordset.val('M单证审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '美金部分单证审批通过';
                } else {
                    if (recordset.val('M单证审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '美金部分单证审批不通过';
                        recordset.val('美金部分', 'M单证审批', '');
                        recordset.val('美金部分', 'M提交单证', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('H单证批') != '' && recordset.val('H提交单证') == _.user.username) {
                Hdzsp = '';
                if (recordset.val('H单证审批') != '') {
                    Hdzsp = recordset.val('H单证审批');
                    recordset.module.field_by_full_name(m + '.H单证审批').disabled = true;
                }
                dzsp = '';
                dzsp = Hdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)提交审批';
                if (recordset.val('H单证审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)单证审批通过';
                } else {
                    if (recordset.val('H单证审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)单证审批不通过';
                        recordset.val('H单证审批', '');
                        recordset.val('H提交单证', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('E单证批') != '' && recordset.val('E提交单证') == _.user.username) {
                Edzsp = '';
                if (recordset.val('E单证审批') != '') {
                    Edzsp = recordset.val('E单证审批');
                    recordset.module.field_by_full_name(m + '.E单证审批').disabled = true;
                }
                dzsp = '';
                dzsp = Edzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '额外费用提交审批';
                if (recordset.val('E单证审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '额外费用单证审批通过';
                } else {
                    if (recordset.val('E单证审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '额外费用单证审批不通过';
                        recordset.val('E单证审批', '');
                        recordset.val('E提交单证', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            let Rtjyw = '';
            let Ttjyw = '';
            let Mtjyw = '';
            let Htjyw = '';
            let Etjyw = '';
            let tjyw = '';
            if (recordset.val('R业务') != '' && recordset.val('R提交单证') == _.user.username) {
                Rtjyw = '';
                if (recordset.val('R提交业务') != '' && recordset.val('R业务审批') != '通过') {
                    Rtjyw = recordset.val('R提交业务');
                    recordset.module.field_by_full_name(m + '.R提交业务').disabled = true;
                    recordset.module.field_by_full_name(m + '.R单证备注').disabled = true;
                }
                tjyw = '';
                tjyw = Rtjyw;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '人民币部分提交审批';
                messages.push({
                    'user': tjyw,
                    'TNR': TNR
                });
            }
            if (recordset.val('T业务') != '' && recordset.val('T提交单证') == _.user.username) {
                Ttjyw = '';
                if (recordset.val('T提交业务') != '' && recordset.val('T业务审批') != '通过') {
                    Ttjyw = recordset.val('T提交业务');
                    recordset.fieldbyname('拖柜费', 'T提交业务').disabled = true;
                    recordset.fieldbyname('拖柜费', 'T单证备注').disabled = true;
                }
                tjyw = '';
                tjyw = Ttjyw;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '拖柜费提交审批';
                messages.push({
                    'user': tjyw,
                    'TNR': TNR
                })
            }
            if (recordset.val('M业务') != '' && recordset.val('M提交单证') == _.user.username) {
                Mtjyw = '';
                if (recordset.val('M提交业务') != '' && recordset.val('M业务审批') != '通过') {
                    Mtjyw = recordset.val('M提交业务');
                    recordset.module.field_by_full_name(m + '.M提交业务').disabled = true;
                    recordset.module.field_by_full_name(m + '.M单证备注').disabled = true;
                }
                tjyw = '';
                tjyw = Mtjyw;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '美金部分提交审批';
                messages.push({
                    'user': tjyw,
                    'TNR': TNR
                });
            }
            if (recordset.val('H业务') != '' && recordset.val('H提交单证') == _.user.username) {
                Htjyw = '';
                if (recordset.val('H提交业务') != '' && recordset.val('H业务审批') != '通过') {
                    Htjyw = recordset.val('H提交业务');
                    recordset.module.field_by_full_name(m + '.H提交业务').disabled = true;
                    recordset.module.field_by_full_name(m + '.H单证备注').disabled = true;
                }
                tjyw = '';
                tjyw = Htjyw;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)提交审批';
                messages.push({
                    'user': tjyw,
                    'TNR': TNR
                });
            }
            if (recordset.val('E业务') != '' && recordset.val('E提交单证') == _.user.username) {
                Etjyw = '';
                if (recordset.val('E提交业务') != '' && recordset.val('E业务审批') != '通过') {
                    Etjyw = recordset.val('E提交业务');
                    recordset.fieldbyname('额外费用', 'E提交业务').disabled = true;
                    recordset.fieldbyname('额外费用', 'E单证备注').disabled = true;
                }
                tjyw = '';
                tjyw = Etjyw;
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '额外费用提交审批';
                messages.push({
                    'user': tjyw,
                    'TNR': TNR
                });
            }
            Rdzsp = '';
            Tdzsp = '';
            Mdzsp = '';
            Hdzsp = '';
            Edzsp = '';
            dzsp = '';
            nr = '';
            if (recordset.val('R业务批') != '' && recordset.val('R提交业务') == _.user.username) {
                Rdzsp = '';
                if (recordset.val('R业务审批') != '') {
                    Rdzsp = recordset.val('R业务审批');
                    recordset.module.field_by_full_name(m + '.R业务审批').disabled = true;
                }
                dzsp = '';
                dzsp = Rdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '人民币部分提交审批';
                if (recordset.val('R业务审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '人民币部分业务审批通过';
                } else {
                    if (recordset.val('R业务审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '人民币部分业务审批不通过';
                        recordset.val('R单证审批', '');
                        recordset.val('R提交单证', '');
                        recordset.val('R业务审批', '');
                        recordset.val('R提交业务', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('T业务批') != '' && recordset.val('T提交业务') == _.user.username) {
                Tdzsp = '';
                if (recordset.val('T业务审批') != '') {
                    Tdzsp = recordset.val('T业务审批');
                    recordset.module.field_by_full_name(m + '.T业务审批').disabled = true;
                }
                dzsp = '';
                dzsp = Tdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '拖柜费提交审批';
                if (recordset.val('T业务审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '拖柜费业务审批通过';
                } else {
                    if (recordset.val('T业务审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '拖柜费业务审批不通过';
                        recordset.val('T单证审批', '');
                        recordset.val('T提交单证', '');
                        recordset.val('T业务审批', '');
                        recordset.val('T提交业务', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('M业务批') != '' && recordset.val('M提交业务') == _.user.username) {
                Mdzsp = '';
                if (recordset.val('M业务审批') != '') {
                    Mdzsp = recordset.val('M业务审批');
                    recordset.module.field_by_full_name(m + '.M业务审批').disabled = true;
                }
                dzsp = '';
                dzsp = Mdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '美金部分提交审批';
                if (recordset.val('M业务审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '美金部分业务审批通过';
                } else {
                    if (recordset.val('M业务审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '美金部分业务审批不通过';
                        recordset.val('M单证审批', '');
                        recordset.val('M提交单证', '');
                        recordset.val('M业务审批', '');
                        recordset.val('M提交业务', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('H业务批') != '' && recordset.val('H提交业务') == _.user.username) {
                Hdzsp = '';
                if (recordset.val('H业务审批') != '') {
                    Hdzsp = recordset.val('H业务审批');
                    recordset.module.field_by_full_name(m + '.H业务审批').disabled = true;
                }
                dzsp = '';
                dzsp = Hdzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)提交审批';
                if (recordset.val('H业务审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)业务审批通过';
                } else {
                    if (recordset.val('H业务审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '海运费(另外申请部分)业务审批不通过';
                        recordset.val('H单证审批', '');
                        recordset.val('H提交单证', '');
                        recordset.val('H业务审批', '');
                        recordset.val('H提交业务', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            if (recordset.val('E业务批') != '' && recordset.val('E提交业务') == _.user.username) {
                Edzsp = '';
                if (recordset.val('E业务审批') != '') {
                    Edzsp = recordset.val('E业务审批');
                    recordset.module.field_by_full_name(m + '.E业务审批').disabled = true;
                }
                dzsp = '';
                dzsp = Edzsp;
                nr = '';
                TNR = '';
                TNR = '发票号码:' + recordset.val('发票号码') + '额外费用提交审批';
                if (recordset.val('E业务审批') == '通过') {
                    nr = '发票号码:' + recordset.val('发票号码') + '额外费用业务审批通过';
                } else {
                    if (recordset.val('E业务审批') == '不通过') {
                        nr = '发票号码:' + recordset.val('发票号码') + '额外费用)业务审批不通过';
                        recordset.val('E单证审批', '');
                        recordset.val('E提交单证', '');
                        recordset.val('E业务审批', '');
                        recordset.val('E提交业务', '');
                    }
                }
                messages.push({
                    'user': dzsp,
                    'nr': nr,
                    'TNR': TNR
                })
            }
            await _.http.post('/api/saier/estimate_cost/save/before', {
                rid: recordset.val('rid'),
                messages: messages
            }).then(res => {
                let d = res.data || {};

                resolve()
            }).catch(err => {
                _.ui.message.error(err.msg);
                console.error('电商运费保存前检查失败', err);
                reject();
            });
        }
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, estimate_cost_before_save, '电商运费')