// 编辑界面数据加载以后执行
const customers_gh_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    _.http.post('/api/saier/customer/load/check', {
        kh_id: recordset.val('客户编号')
    }).then(res => {
        let ghsb = res.data.ghsb
        // if (recordset.val('客户类型') == '公海客户') {
        //     recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
        //     if (ghsb == 1) {
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').disabled = false
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').visible = true;
        //     } else {
        //         // recordset.module.field_by_full_name(n + '.客户类型').disabled = true;
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').visible = false;
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').disabled = true
        //     }
        // }
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
// _.evts.on([_.evtids.RECORD_LOAD], customers_gh_recordLoad, '公海客户')


// 编辑界面数据加载以后执行
const customers_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username
    _.http.post('/api/saier/customer/load/check', {
        kh_id: recordset.val('客户编号')
    }).then(res => {
        let ry2 = res.data.ry2
        let position = res.data.position;
        let ghsb = res.data.ghsb

        recordset.module.group_by_name('延期信息').visible = false;
        // if (recordset.val('申请单号') == '') {
        //     recordset.module.field_by_full_name(n + '.申请单号').disabled = false;
        // } else {
        //     recordset.module.field_by_full_name(n + '.申请单号').disabled = true;
        // }

        if (username != 'zjnblh') {
            recordset.module.group_by_name('收件信息').visible = false;
            recordset.module.group_by_name('发件信息').visible = false;

            recordset.tables['开户银行']._.toolbar.show('new', false);
            recordset.tables['开户银行']._.toolbar.show('insert-data', false);
            recordset.tables['开户银行']._.toolbar.show('delete', false);
            recordset.tables['客人采购习惯分析']._.toolbar.show('delete', false);
            recordset.tables['出货汇总']._.toolbar.show('delete', false);

            recordset.module.field_by_full_name(n + '.邮件起始').hide();
            recordset.module.field_by_full_name(n + '.邮件结束').hide();
            recordset.module.field_by_full_name(n + '.客人报关章').hide();
            recordset.module.field_by_full_name(n + '.开户银行.开户名称').disabled = true;
            recordset.module.field_by_full_name(n + '.开户银行.开户银行').disabled = true;
            recordset.module.field_by_full_name(n + '.开户银行.银行地址').disabled = true;
            recordset.module.field_by_full_name(n + '.开户银行.银行帐号').disabled = true;
            recordset.module.field_by_full_name(n + '.开户银行.备注').disabled = true;

            recordset.module.field_by_full_name(n + '.唛头代码').hide();
            recordset.module.field_by_full_name(n + '.修改清单').hide();
        } else {
            recordset.module.field_by_full_name(n + '.唛头代码').show();
            recordset.module.field_by_full_name(n + '.修改清单').show();
        }

        recordset.module.group_by_name('出货情况').visible = false;
        recordset.module.group_by_name('客人采购习惯分析').visible = true;

        if (recordset.val('业务开发进入模式') != '') {
            if (recordset.val('登记当年时间') != '' && recordset.val('登记当年时间') != null) {
                recordset.module.field_by_full_name(n + '.业务开发进入模式').disabled = true;
            } else {
                recordset.module.field_by_full_name(n + '.业务开发进入模式').disabled = false;
            }
            recordset.module.field_by_full_name(n + '.进入模式产品品类').disabled = true;
        }

        if (recordset.val('业务开发进入模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.进入模式产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.进入模式产品品类').disabled = true;
        }

        if (recordset.val('当年主体合作模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.当年合作产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.当年合作产品品类').disabled = true;
        }

        if (recordset.val('业务模式需求趋势') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.需求趋势产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.需求趋势产品品类').disabled = true;
        }

        if (recordset.val('客户眼中的业务模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.客户眼中模式产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.客户眼中模式产品品类').disabled = true;
        }

        // if (recordset.val('公司名称').indexOf('BEST PRICE') != -1) {
        //     recordset.module.group_by_name('提成明细表').visible = true;
        // } else {        
        //     recordset.module.group_by_name('提成明细表').visible = false;
        // }
        recordset.val('出货情况', '否')
        recordset.val('出货汇总', '否')
        // recordset.val('出货接单', '否')

        recordset.module.group_by_name('接单情况表').visible = false;
        recordset.module.group_by_name('出货情况表').visible = false;

        recordset.module.field_by_full_name(n + '.最低毛利率').disabled = true;
        recordset.module.field_by_full_name(n + '.采购合同期限').disabled = true;

        if (recordset.val('客户编号') != '') {
            recordset.module.field_by_full_name(n + '.客户编号').disabled = true;
        } else {
            recordset.module.group_by_name('联系人表').visible = false;
        }
        recordset.module.field_by_full_name(n + '.保护延长期').hide();

        if (recordset.val('部    门') == '' && recordset.val('客户类型') != '公海客户') {
            recordset.val('部    门', res.data.bm);
        }
        if (position.indexOf('总') >= 0) {
            ry2 = 1;
            recordset.module.field_by_full_name(n + '.最低毛利率').disabled = false;
            recordset.module.field_by_full_name(n + '.采购合同期限').disabled = false;
        }
        if (position.indexOf('客户管理') >= 0) {
            ry2 = 1;
        }

        if (position.indexOf('超期') >= 0) {
            recordset.module.field_by_full_name(n + '.采购合同期限').disabled = false;
        }

        if (position.indexOf('财务') >= 0) {

            recordset.tables['开户银行']._.toolbar.show('new', true);
            recordset.tables['开户银行']._.toolbar.show('delete', true);

            recordset.module.field_by_full_name(n + '.开户银行.开户名称').disabled = false;
            recordset.module.field_by_full_name(n + '.开户银行.开户银行').disabled = false;
            recordset.module.field_by_full_name(n + '.开户银行.银行地址').disabled = false;
            recordset.module.field_by_full_name(n + '.开户银行.银行帐号').disabled = false;
            recordset.module.field_by_full_name(n + '.开户银行.备注').disabled = false;
        }

        if ((position.indexOf('风控') >= 0) || (position.indexOf('财务') >= 0)) {
            recordset.module.group_by_name('客人采购习惯分析').visible = false;
            recordset.module.group_by_name('业务模式标签').visible = false;
            recordset.module.group_by_name('抬头信息').visible = false;
            recordset.module.group_by_name('历史业务模式标签').visible = false;
            recordset.module.group_by_name('评审信息').visible = false;
            recordset.module.group_by_name('出货汇总').visible = false;
            recordset.module.group_by_name('出货情况').visible = false;
            recordset.module.group_by_name('联系人表').visible = false;
            recordset.module.group_by_name('备注信息').visible = false;

            recordset.module.field_by_full_name(n + '.采购合同期限').disabled = false;
            recordset.module.field_by_full_name(n + '.联 系 人').hide();
            recordset.module.field_by_full_name(n + '.内销客户').hide();
            recordset.module.field_by_full_name(n + '.电话号码').hide();
            recordset.module.field_by_full_name(n + '.最低毛利率').hide();
            recordset.module.field_by_full_name(n + '.目标毛利率').hide();
            recordset.module.field_by_full_name(n + '.毛 利 比').hide();
            recordset.module.field_by_full_name(n + '.年预计金额').hide();
            recordset.module.field_by_full_name(n + '.首次合作').hide();
            recordset.module.field_by_full_name(n + '.首次接单金额').hide();
            recordset.module.field_by_full_name(n + '.首次出货').hide();
            recordset.module.field_by_full_name(n + '.首次出货金额').hide();
            recordset.module.field_by_full_name(n + '.最新接单').hide();
            recordset.module.field_by_full_name(n + '.最新接单金额').hide();
            recordset.module.field_by_full_name(n + '.最新出货').hide();
            recordset.module.field_by_full_name(n + '.最新出货金额').hide();
            recordset.module.field_by_full_name(n + '.Vendor公司').hide();
            recordset.module.field_by_full_name(n + '.公海转潜在提交人').hide();
            recordset.module.field_by_full_name(n + '.潜在转公海日期').hide();

            recordset.module.field_by_full_name(n + '.手机号码').hide();
            recordset.module.field_by_full_name(n + '.传真号码').hide();
            recordset.module.field_by_full_name(n + '.电子邮件').hide();
            recordset.module.field_by_full_name(n + '.公司主页').hide();
            recordset.module.field_by_full_name(n + '.详细地址').hide();
            recordset.module.field_by_full_name(n + '.邮政编码').hide();
            recordset.module.field_by_full_name(n + '.客户来源').hide();
            recordset.module.field_by_full_name(n + '.客户密码').hide();
            recordset.module.field_by_full_name(n + '.网络查询').hide();
            recordset.module.field_by_full_name(n + '.出货情况').hide();
            recordset.module.field_by_full_name(n + '.出货汇总').hide();
            recordset.module.field_by_full_name(n + '.付款天数').hide();
            recordset.module.field_by_full_name(n + '.佣金点数').hide();
            recordset.module.field_by_full_name(n + '.开发日期').hide();
            recordset.module.field_by_full_name(n + '.上属公司').disabled = true;
            recordset.module.field_by_full_name(n + '.公司名称').disabled = true;
            recordset.module.field_by_full_name(n + '.代理名称').disabled = true;
            recordset.module.field_by_full_name(n + '.有无代理').disabled = true;
            recordset.module.field_by_full_name(n + '.贸易国别').disabled = true;
            recordset.module.field_by_full_name(n + '.目的口岸').disabled = true;
            recordset.module.field_by_full_name(n + '.客户类型').disabled = true;
            recordset.module.field_by_full_name(n + '.风控客户来源').disabled = true;
            recordset.module.field_by_full_name(n + '.业务范围').disabled = true;
            recordset.module.field_by_full_name(n + '.合作等级').disabled = true;
            // recordset.module.field_by_full_name(n + '.开户银行').disabled = true;
            // recordset.module.field_by_full_name(n + '.银行账号').disabled = true;
            recordset.module.field_by_full_name(n + '.业务人员').disabled = true;
            recordset.module.field_by_full_name(n + '.分配给谁').disabled = true;
            recordset.module.field_by_full_name(n + '.我方公司').disabled = true;
            recordset.module.field_by_full_name(n + '.部    门').disabled = true;
            recordset.module.field_by_full_name(n + '.支付方式').disabled = true;
            recordset.module.field_by_full_name(n + '.支付期限').disabled = true;
            recordset.module.field_by_full_name(n + '.明佣点数').disabled = true;
            recordset.module.field_by_full_name(n + '.暗佣点数').disabled = true;
            recordset.module.field_by_full_name(n + '.抬头代码').hide();
            recordset.module.field_by_full_name(n + '.指定货代').hide();
            recordset.module.field_by_full_name(n + '.开 证 行').hide();
            recordset.module.field_by_full_name(n + '.抬 头 人').hide();
            recordset.module.field_by_full_name(n + '.收 货 人').hide();
            recordset.module.field_by_full_name(n + '.通 知 人').hide();
            recordset.module.field_by_full_name(n + '.信保客人抬头').disabled = true;
        } else {
            recordset.module.field_by_full_name(n + '.信保预额').disabled = true;
        }

        if (ry2 == 1) {
            recordset.module.group_by_name('查看人员清单').show();
            let new_data = res.data.ryck;
            let t = recordset.tables['查看人员清单'];
            if (new_data.length > 0) {
                for (let row of new_data) {
                    row['rid'] = _.utils.guid()
                    row['pid'] = recordset.val('rid')
                    row['module1'] = '客户资料'
                    row['objectkind1'] = 1
                }
            }
            if (new_data.length > 0) {
                t.data = new_data
                t.sync_operate_data()
            }
        } else {
            recordset.module.group_by_name('查看人员清单').hide();
        }
        if (ghsb == 1) {
            recordset.module.field_by_full_name(n + '.保护延长期').show();
        }
        // if (recordset.val('客户类型') == '公海客户') {
        //     recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
        //     recordset.module.group_by_name('查看人员清单').show();
        //     if (ghsb == 1) {
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').show();
        //     } else {
        //         recordset.module.field_by_full_name(n + '.客户类型').disabled = true;
        //         recordset.module.field_by_full_name(n + '.公海转潜在提交人').hide();
        //         recordset.module.group_by_name('查看人员清单').hide();
        //     }
        // }
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], customers_recordLoad, '客户资料')

// 编辑界面字段change后执行
const customers_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    // field.full_name == n + '.出货接单' ||
    if (field.full_name == n + '.出货汇总' || field.full_name == n + '.延期查看') {
        // if (recordset.val('出货接单') == "是") {
        //     recordset.module.field_by_full_name('起始日期').disabled = false;
        //     recordset.module.field_by_full_name('结束日期').disabled = false;

        //     recordset.module.group_by_name('接单情况表').visible = true;
        //     recordset.module.group_by_name('出货情况表').visible = true;
        // }
        if (recordset.val('延期查看') != "") {
            recordset.module.group_by_name('延期信息').visible = true;
        }
    }
    if (field.full_name == n + '.登记当年时间') {
        if (recordset.val('登记当年时间') != '' && recordset.val('登记当年时间') != null) {
            recordset.module.field_by_full_name(n + '.业务开发进入模式').disabled = true;
        } else {
            recordset.module.field_by_full_name(n + '.业务开发进入模式').disabled = false;
        }
    }
    if (field.full_name == n + '.业务人员' || field.full_name == n + '.上属公司') {
        if (recordset.val('业务人员') != "" && recordset.val('客户编号') != "") {
            recordset.val('公海转潜在提交人', '')
            let t = recordset.tables['查看人员清单']
            let d = t.view_data
            let flag = 1
            for (let r of d) {
                if (r.ywry == recordset.val('业务人员')) {
                    flag = 0
                    break
                }
            }
            if (flag == 1) {
                t.append().then(res => {
                    recordset.val('查看人员清单.业务员', recordset.val('业务人员'))
                })
            }
        }
    }

    if (field.full_name == n + '.公司名称' && value !='' && recordset.val('上属公司') == '') {
        recordset.val('上属公司', recordset.val('公司名称'))
    }

    // if (field.full_name == n + '.业务人员' || field.full_name == n + '.上属公司') {
    //     if (recordset.val('业务人员') != "" && recordset.val('客户编号') != "") {
    //         recordset.val('出货汇总','')
    //     }
    // }

    if (field.full_name == n + '.权限清单') {
        if (recordset.val('权限清单') == "是") {
            recordset.module.group_by_name('查看人员清单').visible = true;
            recordset.refresh_ui()
        } else {
            recordset.module.group_by_name('查看人员清单').visible = false;
            recordset.refresh_ui()
        }
    }

    if (field.full_name == n + '.最低毛利率' && value != 0) {
        if (recordset.val('最低毛利率') > 100) {
            _.ui.message.error('最低毛利率不能大于100%!')
            recordset.val('最低毛利率', 0)
        }
        if (recordset.val('最低毛利率') > 1 && recordset.val('最低毛利率') < 100) {
            recordset.val('最低毛利率', round(recordset.val('最低毛利率') / 100, 3))
        }
    }

    if (field.full_name == n + '.公司名称') {
        if (recordset.val('公司名称') != "" && recordset.val('客户编号') != "") {
            if (recordset.val('公司名称').indexOf("'") >= 0) {
                _.ui.message.error('请注意公司名称中不能有单引号,如果一定要请用全角单引号‘代替')
                recordset.val('公司名称', '')
            } else {
                let khmc = String(recordset.val('公司名称'))
                recordset.val('公司名称', khmc.toUpperCase())
                if (recordset.val('公司名称').indexOf('BEST PRICE') != -1) {
                    recordset.val('风控管理', '否')
                } else {
                    recordset.val('风控管理', '是')
                }
            }
        }
    }

    if (field.full_name == n + '.毛 利 比' && value != 0) {
        if (recordset.val('毛 利 比') > 100) {
            _.ui.message.error('毛利率不能大于100%!')
            recordset.val('毛 利 比', 0)
        }
        if (recordset.val('毛 利 比') > 1 && recordset.val('毛 利 比') <= 100) {
            recordset.val('毛 利 比', round(recordset.val('毛 利 比') / 100, 3))
        }
    }

    if (field.full_name == n + '.佣金点数') {
        if (recordset.val('佣金点数').indexOf("0.") >= 0) {
            recordset.val('佣金点数', round(recordset.val('佣金点数') * 100, 3))
        }
    }

    if (field.full_name == n + '.风控管理' || field.full_name == n + '.风控人员') {
        if (recordset.val('风控人员') != "") {
            recordset.val('风控管理', "是")
        }
        if (recordset.val('风控管理') == "是") {
            let spsq = recordset.val('风控人员')
            if (spsq != "") {
                _.http.post('/api/saier/customer/fkgl/change', {
                    khmc: recordset.val('公司名称'),
                    spsq: spsq
                }).then(res => {

                }).catch(res => {
                    console.log(res)
                    _.ui.message.error(res.msg)
                })

            } else {
                _.ui.message.error('如需风控管理,请先填写风控人员')
                recordset.val('风控管理', "否")
            }
        } else {
            recordset.val('风控人员', "")
        }
    }
    if (field.full_name == n + '.联系人表.电子邮件') {
        if (recordset.val('联系人表.电子邮件') != "") {
            _.http.post('/api/saier/customer/email/check', {
                rid: recordset.val('rid'),
                lines: recordset.tables['联系人表'].view_data
            }).then(res => {

            }).catch(e => {
                _.ui.message.error(e.msg)
                recordset.val('联系人表.电子邮件', '');
                console.log(e)
            })
        }
    }
    if (field.full_name == n + '.开户银行.开户名称' || field.full_name == n + '.开户银行.银行帐号' || field.full_name == n + '.开户银行.开户银行') {
        if (recordset.val('开户银行.开户名称') != "" && recordset.val('开户银行.银行帐号') != "" && recordset.val('开户银行.开户银行') != "") {
            _.http.post('/api/saier/customer/bank/check', {
                rid: recordset.val('rid'),
                lines: [recordset.tables['开户银行'].current_data]
            }).then(res => {

            }).catch(e => {
                _.ui.message.error(e.msg)
                recordset.val('开户银行.银行帐号', '');
                console.log(e)
            })
        }
    }
    if (field.full_name == n + '.查看人员清单.业务员') {
        if (recordset.val('查看人员清单.业务员') != "" && recordset.job == 1) {
            _.http.post('/api/saier/customer/user/change', {
                rid: recordset.val('rid'),
                kh_id: recordset.val('客户编号'),
                khmc: recordset.val('公司名称'),
                zjl: recordset.val('总经理'),
                wxzj: recordset.val('外销总监'),
                line: recordset.tables['查看人员清单'].current_data
            }).then(res => {

            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })
        }
    }
    if (field.full_name == n + '.保护延长期') {
        let date = recordset.val('潜在转公海日期')
        if (date != '' && date != null) {
            recordset.val('潜在转公海日期', _addDaysDate(date, recordset.val('保护延长期')))
        }
    }
    if (field.full_name == n + '.业务开发进入模式' || field.full_name == n + '.当年主体合作模式' || field.full_name == n + '.业务模式需求趋势' || field.full_name == n + '.客户眼中的业务模式') {
        if (recordset.val('业务开发进入模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.进入模式产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.进入模式产品品类').disabled = true;
            recordset.val('进入模式产品品类', '');
        }
        if (recordset.val('当年主体合作模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.当年合作产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.当年合作产品品类').disabled = true;
            recordset.val('当年合作产品品类', '');
        }
        if (recordset.val('业务模式需求趋势') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.需求趋势产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.需求趋势产品品类').disabled = true;
            recordset.val('需求趋势产品品类', '');
        }
        if (recordset.val('客户眼中的业务模式') == '专业产品模式') {
            recordset.module.field_by_full_name(n + '.客户眼中模式产品品类').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.客户眼中模式产品品类').disabled = true;
            recordset.val('客户眼中模式产品品类', '');
        }
        if ((recordset.val('业务开发进入模式')).trim() == '') {
            recordset.module.field_by_full_name(n + '.业务开发进入模式').disabled = false;
        }
    }
    if (field.full_name == n + '.更改等级') {
        if (recordset.val('更改等级') != '') {
            recordset.val('申 请 人', _.user.username)
        } else {
            recordset.val('申 请 人', '');
            recordset.val('更改等级', '');
            recordset.val('提交申请', '');
            recordset.val('提交状态', '');
            recordset.val('申请原因', '');
        }
    }
    if (field.full_name == n + '.电子邮件') {
        if (recordset.val('电子邮件') != "") {
            _.http.post('/api/saier/customer/email/check', {
                rid: recordset.val('rid'),
                // job: recordset.job,
                check: true,
                lines: [{
                    'email': recordset.val('电子邮件'),
                    'rid': recordset.val('rid'),
                    'zfyx': '不可以'
                }]
            }).then(res => {

            }).catch(e => {
                _.ui.message.error(e.msg)
                recordset.val('电子邮件', '');
                console.log(e)
            })
        }
    }
    if (field.full_name == n + '.客户类型') {
        if (recordset.val('客户类型') == '公海客户') {
            _.http.post('/api/saier/customer/query/ghsb', {
                rid: recordset.val('rid'),
                kh_id: recordset.val('客户编号')
            }).then(res => {
                recordset.val('业务人员', '')
                recordset.module.field_by_full_name(n + '.业务人员').disabled = true;
                recordset.tables['查看人员清单'].data = []
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('客户类型', '');
            })
        } else {
            recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
        }
    }
    let fields = [n + '.贸易国别', n + '.目的口岸', n + '.所属地区', n + '.我方公司', n + '.公司名称', n + '.客户来源', n + '.客户类型', n + '.生意模式', n + '.业务范围', n + '.合作等级', n + '.电子邮件', n + '.客户简称', n + '.联 系 人', n + '.来源一级']
    if (fields.indexOf(field.full_name) != -1) {
        if (recordset.val('客户类型') != '公海客户') {
            let flag = 0
            for (let f of fields) {
                if (recordset.val(f) == '' || recordset.val(f) == null) {
                    flag = 1
                    break
                }
            }
            if (flag == 0) {
                recordset.val('总经理number', '386')
                recordset.val('总经理', '侯柳红')
                recordset.val('外销总监number', '14')
                recordset.val('外销总监', '周玲燕')
                _.http.post('/api/saier/customer/fields/change', {
                    rid: recordset.val('rid'),
                    module: recordset.module.name,
                    kh_id: recordset.val('客户编号')
                }).then(res => {
                    if (res.code == 1) {
                        if (res.data > 1) {
                            recordset.val('潜在转公海日期', _addDaysDate(new Date().format('yyyy-MM-dd'), res.data))
                        }
                        recordset.val('公海转潜在日期', new Date().format('yyyy-MM-dd'))
                        if (recordset.val('客户类型') == '合作客户') {
                            recordset.val('潜在转公海日期', '')
                        }
                        // 缺少自动保存功能
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
        } else {
            recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
        }
    }
    if (field.full_name == n + '.公海转潜在提交人') {
        if (recordset.val('公海转潜在提交人') == '退回') {
            _.http.post('/api/saier/customer/ghqzzy/change', {
                module: module.name,
                rid: recordset.val('rid')
            }).then(res => {
                recordset.val('公海转潜在提交人', '')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.贸易国别') {
        recordset.val('目的口岸', '')
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customers_field_change, '客户资料')


function validateEmail(email) {
    // 常见且相对严谨的正则表达式
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const customer_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'customer_to_futong_btn') {
        // let rids = []
        // for (let r of form.data.value) {
        //     rids.push(r.kh_rid)
        // }
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('客户资料记录不能为空');
            return
        }

        _.http.post("/api/saier/customer/excel/futong", {
            rids: rids
        }).then(res => {
            _.http.download("/api/tmp/file/get", {
                    file: res.data
                },
                '客户资料.xlsx'
            );
        }).catch(res => {
            _.ui.message.error(res);
            console.log(res);
        })
    };

    if (btn.name == 'customer_to_excel_btn') {
        // let rids = []
        // for (let r of form.data.value) {
        //     rids.push(r.kh_rid)
        // }
        // rids = [form.current_rid.value]
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('客户资料记录不能为空');
            return
        }

        _.http.post("/api/saier/customer/excel/data", {
            rids: rids
        }).then(res => {
            _.http.download("/api/tmp/file/get", {
                    file: res.data
                },
                '客户资料.xlsx'
            );
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    };

    if (btn.name == 'customer_trans_btn') {
        _.ui.confirm('是否转移到公海客户').then(res => {
            _.http.post('/api/saier/customer/trans/ghkh', {
                rid: form.current_rid.value,
                module: form.module.name
            }).then(r => {
                _.ui.message.success(r.msg);
                if (form.is_editor) {
                    form.close();
                } else {
                    form.load_data();
                }
            }).catch(r => {
                console.log(r);
                _.ui.message.error(r.msg);
            });
        })
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], customer_BtnClick, '客户资料')

const customer_FormShow = (evt_id, form) => {
    let btns = []
    if (!form.is_editor) {
        btns.push({
            "name": 'customer_to_futong_btn',
            "caption": '富通客户导出',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'customer_to_excel_btn',
            "caption": '当前客户导出',
            "icon": 'any-keyborad',
        })
    }
    btns.push({
        "name": 'customer_trans_btn',
        "caption": '潜在转公海',
        "icon": 'any-keyborad',
    })
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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], customer_FormShow, '客户资料')


function checkString(VendorID) {
    // 检查是否包含非字母数字字符
    const hasSpecialChar = /[^0-9a-zA-Z]/.test(VendorID);
    // 如果有特殊字符，返回 '1'，否则返回 null 或 ''
    return hasSpecialChar ? '1' : false;
}

const customer_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let t = recordset.tables['查看人员清单']
        let d = t.view_data
        let ywys = []
        for (let r of d) {
            if (r.ywry == undefined || r.ywry == '') continue
            if (ywys.indexOf(r.ywry) == -1) ywys.push(r.ywry)
        }
        if (recordset.val('公司名称') != '' && recordset.val('上属公司') == '') {
            recordset.val('上属公司', recordset.val('公司名称'))
        }
        if (recordset.val('有无代理') == '') {
            recordset.val('有无代理', '无')
        }
        // recordset.val('名片识别', '')
        recordset.val('业务人员全新', ywys.join(','))
        if (recordset.val('客户编号') != '') {
            let flag = false
            let x = recordset.tables['开户银行']
            let y = x.view_data
            for (let r of y) {
                if (r.kh_id == undefined || r.kh_id == '') {
                    r.kh_id = recordset.val('客户编号')
                    x.push_modi_rid(r.rid)
                    flag = true
                }
            }
            if (flag) {
                x.sync_operate_data()
                x.modified = true
            }
        }
        if (recordset.val('Vendor ID') == '' && recordset.val('上属公司') != 'BEST PRICE LLC' && recordset.val('客户类型') == '合作客户') {
            reject('注意客人如果需要锁定报关抬头请填 Vendor:')
            return
        }
        if (recordset.val('Vendor ID') == '') {
            recordset.val('Vendor公司', '')
            recordset.val('公司简称', '')
        }
        if (recordset.val('Vendor ID') != '' && checkString(recordset.val('Vendor ID')) == true) {
            reject('请注意字段 Vendor ID:  填写只能是数字和字母')
            return
        }
        if (recordset.val('风控管理') == '是' && recordset.val('客户类型') != '' && recordset.val('客户类型').indexOf('合作客户') != -1 && recordset.val('支付方式') == "") {
            reject('客户类型为合作客户，请填写支付方式')
            return
        }
        let shr = ''
        if (recordset.val('风控管理') == '是' && recordset.val('收 货 人') == '') {
            let x = recordset.tables['抬头信息']
            let y = x.view_data
            if (y.length > 0) {
                let r = y[0]
                shr = r.shr
                if (r.shr) recordset.val('收 货 人', r.shr.substring(0, 250))
                if (r.ttdm) recordset.val('抬头代码', r.ttdm.substring(0, 250))
                if (r.kzh) recordset.val('开 证 行', r.kzh.substring(0, 250))
                if (r.ttr) recordset.val('抬 头 人', r.ttr.substring(0, 250))
                if (r.tzr) recordset.val('通 知 人', r.tzr.substring(0, 250))
                if (r.xbkrtt) recordset.val('信保客人抬头', r.xbkrtt.substring(0, 250))
            }
        }
        if (recordset.val('风控管理') == '是') {
            if ((recordset.val('登记当年时间') == null || recordset.val('登记当年时间') == '') && (recordset.val('业务开发进入模式') != '' || recordset.val('当年主体合作模式') != '' || recordset.val('业务模式需求趋势') != '' || recordset.val('客户眼中的业务模式') != '' || recordset.val('当年主体合作模式'))) {
                reject('登记当年时间为空时，业务开发进入模式、当年主体合作模式、业务模式需求趋势、客户眼中的业务模式、当年主体合作模式必须都为空')
                return
            }
            if (recordset.val('业务开发进入模式') == '专业产品模式' && recordset.val('进入模式产品品类') == '') {
                reject('业务开发进入模式等于专业产品模式时，进入模式产品品类不能为空')
                return
            }
            if (recordset.val('当年主体合作模式') == '专业产品模式' && recordset.val('当年合作产品品类') == '') {
                reject('当年主体合作模式等于专业产品模式时，当年合作产品品类不能为空')
                return
            }
            if  (recordset.val('业务模式需求趋势') == '专业产品模式' && recordset.val('需求趋势产品品类') == '') {
                reject('业务模式需求趋势等于专业产品模式时，需求趋势产品品类不能为空')
                return
            }
            if (recordset.val('客户眼中的业务模式') == '专业产品模式' && recordset.val('客户眼中模式产品品类') == '') {
                reject('客户眼中的业务模式等于专业产品模式时，客户眼中模式产品品类不能为空')
                return
            }
        }
        if (recordset.val('风控管理') == '是' && recordset.val('登记当年时间') != '' && recordset.val('登记当年时间') != null) {
            let flag = false
            let x = recordset.tables['历史业务模式标签']
            let y = x.view_data
            recordset.val('登记当年时间', recordset.val('登记当年时间').substring(0, 4))
            for (let r of y) {
                if (r.djdnsj == recordset.val('登记当年时间').substring(0, 4)) {
                    r.ywkfjrms = recordset.val('业务开发进入模式')
                    r.zycppl = recordset.val('进入模式产品品类')
                    r.dnzthzms = recordset.val('当年主体合作模式')
                    r.dnhzcppl = recordset.val('当年合作产品品类')
                    r.ywmsxqqs = recordset.val('业务模式需求趋势')
                    r.xqqscppl = recordset.val('需求趋势产品品类')
                    r.khyzdywms = recordset.val('客户眼中的业务模式')
                    r.khyzmscppl = recordset.val('客户眼中模式产品品类')
                    flag = true
                    break
                }
            }
            if (!flag && recordset.val('登记当年时间') != '' && recordset.val('登记当年时间') != null) {
                let r = {}
                r.rid = _.utils.guid()
                r.pid = recordset.val('rid')
                r.uid = _.user.rid
                r.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                r.djdnsj = recordset.val('登记当年时间').substring(0, 4)
                r.ywkfjrms = recordset.val('业务开发进入模式')
                r.zycppl = recordset.val('进入模式产品品类')
                r.dnzthzms = recordset.val('当年主体合作模式')
                r.dnhzcppl = recordset.val('当年合作产品品类')
                r.ywmsxqqs = recordset.val('业务模式需求趋势')
                r.xqqscppl = recordset.val('需求趋势产品品类')
                r.khyzdywms = recordset.val('客户眼中的业务模式')
                r.khyzmscppl = recordset.val('客户眼中模式产品品类')
                y.push(r)
                x.push_modi_rid(r.rid)
                flag = true
            }
            if (flag) {
                x.sync_operate_data()
                x.modified = true
            }
        }

        let flag = true
        let x = recordset.tables['联系人表']
        let y = x.view_data
        for (let r of y) {
            if (r.xm != undefined && r.xm != '') {
                flag = false
                break
            }
        }
        if (flag && recordset.val('联 系 人') != '' && recordset.val('电子邮件') != '') {
            x.append().then(res => {
                recordset.val('联系人表.姓    名', recordset.val('联 系 人'))
                recordset.val('联系人表.办公电话', recordset.val('电话号码'))
                recordset.val('联系人表.传    真', recordset.val('传真号码'))
                recordset.val('联系人表.移动电话', recordset.val('手机号码'))
                recordset.val('联系人表.电子邮件', recordset.val('电子邮件'))
            })
        }
        if (recordset.job != 1) {
            resolve()
            return
        }
        _.http.post("/api/saier/customer/save/before", {
            rid: recordset.val('rid'),
            ywry: recordset.val('业务人员'),
            ssgs: recordset.val('上属公司'),
            kh_id: recordset.val('客户编号'),
            khmc: recordset.val('公司名称'),
            khlx: recordset.val('客户类型'),
            sqdh: recordset.val('申请单号'),
            fkgl: recordset.val('风控管理'),
            lxrb: recordset.tables['联系人表'].view_data,
        }).then(res => {
            if (recordset.val('上属公司') != recordset.val('公司名称')) {
                recordset.val('业务人员全', recordset.val('业务人员'))
            } else {
                recordset.val('业务人员全', res.data.ywys)
            }
            if (res.data.uid != '' && res.data.uid != null) {
                 recordset.val('uid', res.data.uid);
            }
            resolve();
        }).catch(res => {
            reject()
            _.ui.message.error(res.msg);
            console.log(res);
        })
        // 正常应该在保存前也需要校验联系人的 email和开户银行的账号
        // _.http.post("/api/saier/customer/email/check", {
        //     rid: recordset.val('rid'),
        //     lines: recordset.tables['联系人表'].view_data
        // }).then(res => {
        //     resolve();
        // }).catch(res => {
        //     reject()
        //     _.ui.message.error(res.msg);
        //     console.log(res);
        //     let t = recordset.tables['联系人表']
        //     let d = t.view_data
        //     for (let r of d){
        //         if (r.rid in res.data){
        //             r.email = ''
        //             t.push_modi_rid(r.rid)
        //         }
        //     }
        //     t.sync_operate_data()
        //     t.modified = true;
        // })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, customer_before_save, '客户资料')

const customer_after_save = (evt_id, recordset) => {
    let begin_date = recordset.val('开发日期')
    let date = _addDaysDate(begin_date, 1)
    // let now = new Date().format('yyyy-MM-dd')
    // if (recordset.val('业务人员') == _.user.username && (begin_date == now || date == now)) {
    _.http.post("/api/saier/customer/save/after", {
        rid: recordset.val('rid'),
        ywry: recordset.val('业务人员'),
        kh_id: recordset.val('客户编号'),
        khmc: recordset.val('公司名称'),
        zjl: recordset.val('总经理'),
        wxzj: recordset.val('外销总监'),
        khlx: recordset.val('客户类型'),
        fkgl: recordset.val('风控管理'),
        date: date,
        begin_date: begin_date
    }).then(res => {

    }).catch(res => {
        _.ui.message.error(res.msg);
        console.log(res);
    })
    // }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, customer_after_save, '客户资料')


const customer_table_new_after = (evt_id, table, recordset) => {
    if (table.group == '接单情况表') {
        recordset.val('接单情况表.公司名称', recordset.val('公司名称'));
    }
    if (table.group == '开户银行') {
        if (recordset.val('客户编号') != '') {
            recordset.val('开户银行.客户编号', recordset.val('客户编号'));
        }
    }
    if (table.group == '提成明细表') {
        recordset.val('提成明细表.公司名称', recordset.val('公司名称'));
    }
    if (table.group == '开户银行') {
        recordset.val('开户银行.唯一字段', recordset.val('开户银行.rid'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], customer_table_new_after, '客户资料')


const customer_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '查看人员清单') {
            if (recordset.val('查看人员清单.业务员') == '') {
                resolve()
                return
            }
            if (recordset.val('查看人员清单.业务员') != recordset.val('业务人员') && recordset.val('查看人员清单.业务员') != _.user.username && recordset.val('查看人员清单.业务员') != '侯柳红' &&
                recordset.val('查看人员清单.业务员') != '陈妍科' && recordset.val('查看人员清单.业务员') != recordset.val('总经理') && recordset.val('查看人员清单.业务员') != recordset.val('外销总监')) {
                _.http.post("/api/saier/customer/user/delete", {
                    ywry: recordset.val('业务人员'),
                    line: recordset.tables['查看人员清单'].current_data
                }).then(res => {
                    resolve()
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                    reject()
                })
            } else {
                _.ui.message.error('不好意思,你无权删除此记录,删除无效')
                reject()
                return
            }
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], customer_table_delete_before, '客户资料')


const customer_recordset_copy_after = (evt_id, recordset) => {
    recordset.tables['联系人表'].clear();
}
_.evts.on([_.evtids.RECORD_AFTER_COPY], customer_recordset_copy_after, '客户资料')


// 编辑界面字段change后执行
const customers_gh_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    // if (field.full_name == n + '.公海转潜在提交人') {
    //     if (recordset.val('公海转潜在提交人') == '退回') {
    //         _.http.post('/api/saier/customer/ghqzzy/change', {
    //             module: module.name,
    //             rid: recordset.val('rid')
    //         }).then(res => {
    //             recordset.val('公海转潜在提交人', '')
    //             _.ui.message.success('退回操作成功')
    //         }).catch(err => {
    //             console.log(err)
    //             _.ui.message.error(err.msg)
    //         })
    //     }
    // }
    if (field.full_name == n + '.客户类型') {
        if (recordset.val('客户类型') == '公海客户') {
            _.http.post('/api/saier/customer/query/ghsb', {
                rid: recordset.val('rid'),
                kh_id: recordset.val('客户编号')
            }).then(res => {
                recordset.val('业务人员', '')
                recordset.module.field_by_full_name(n + '.业务人员').disabled = true;
                recordset.tables['查看人员清单'].data = []
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('客户类型', '');
            })
        } else {
            recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
        }
    }
    let fields = [n + '.贸易国别', n + '.目的口岸', n + '.所属地区', n + '.我方公司', n + '.公司名称', n + '.客户来源', n + '.客户类型', n + '.生意模式', n + '.业务范围', n + '.合作等级', n + '.电子邮件', n + '.客户简称', n + '.联 系 人', n + '.来源一级']
    if (fields.indexOf(field.full_name) != -1) {
        if (recordset.val('客户类型') != '公海客户') {
            let flag = 0
            for (let f of fields) {
                if (recordset.val(f) == '' || recordset.val(f) == null) {
                    flag = 1
                    break
                }
            }
            if (flag == 1) {
                recordset.val('总经理number', '386')
                recordset.val('总经理', '侯柳红')
                recordset.val('外销总监number', '14')
                recordset.val('外销总监', '周玲燕')
                _.http.post('/api/saier/customer/fields/change', {
                    rid: recordset.val('rid'),
                    module: recordset.module.name,
                    kh_id: recordset.val('客户编号')
                }).then(res => {
                    if (res.code == 1) {
                        if (res.data > 1) {
                            recordset.val('潜在转公海日期', _addDaysDate(new Date().format('yyyyMM-dd'), res.data))
                        }
                        recordset.val('公海转潜在日期', new Date().format('yyyyMM-dd'))
                        if (recordset.val('客户类型' == '合作客户')) {
                            recordset.val('潜在转公海日期', '')
                        }
                        // 缺少自动保存功能
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
        } else {
            recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
            recordset.val('公海转潜在提交人', '')
            recordset.val('公海转潜在审核人', '')
            recordset.val('潜在转公海日期', '')
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customers_gh_field_change, '公海客户')


const customer_gh_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor == true) {
        btns.push({
            "name": 'customer_trans_apply_btn',
            "caption": '公海潜在转移申请',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'customer_trans_confirm_btn',
            "caption": '公海潜在转移通过',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'customer_trans_return_btn',
            "caption": '公海潜在转移退回',
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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], customer_gh_FormShow, '公海客户')

const customer_gh_BtnClick = async (evt_id, btn, form) => {
    if (btn.name == 'customer_trans_apply_btn') {
        if (form.recordset.val('公海转潜在提交人') != '') {
            _.ui.message.error('不好意思已提交申请')
            return
        }
        _.ui.confirm('确定要提交申请吗？').then(() => {
            _.http.post('/api/saier/customer/get/ghkh/user').then(res => {
                _.ui.show_input_select_dialog('请输入要提交的主管:', '', res.data).then(val => {
                    if (form.recordset.modified == true) {
                        _.ui.message.error('请先保存记录再操作');
                        return
                    }
                    _.http.post('/api/saier/customer/do/trans', {
                        rid: form.recordset.val('rid'),
                        module: form.module.name,
                        val: val
                    }).then(r => {
                        console.log(r);
                        _.ui.message.success(r.msg);
                        _.platform.active.reload_data()
                    }).catch(r => {
                        console.log(r);
                        _.ui.message.error(r.msg);
                    });
                })
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
    if (btn.name == 'customer_trans_return_btn') {
        if (form.recordset.val('公海转潜在审核人') != _.user.username) {
            _.ui.message.error('权限校验失败，只有公海转潜在审核人才能执行此操作')
            return
        }
        _.ui.confirm('确定要退回吗？').then(() => {
            _.http.post('/api/saier/customer/ghqzzy/change', {
                module: form.module.name,
                rid: form.recordset.val('rid')
            }).then(res => {
                // form.recordset.val('公海转潜在提交人', '')
                // form.recordset.val('公海转潜在审核人', '退回')
                _.platform.active.reload_data()
                _.ui.message.success('退回操作成功')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    };
    if (btn.name == 'customer_trans_confirm_btn') {
        if (form.recordset.val('公海转潜在审核人') != _.user.username) {
            _.ui.message.error('权限校验失败，只有公海转潜在审核人才能执行此操作')
            return
        }
        let confirm = await _.ui.confirm('确定要通过吗？').then(() => {
            return true
        })
        if (confirm == false) {
            return
        }
        let khlx = await _.ui.show_input_select_dialog('请选择客户类型', '', ['潜在客户A级', '潜在客户B级', '潜在客户C级']).then(val => {
            return val
        })
        if (khlx == '' || khlx == null) {
            _.ui.message.error('客户类型不能为空')
            return
        }
        _.http.post('/api/saier/customer/khlx/change', {
            module: form.module.name,
            rid: form.recordset.val('rid'),
            khlx: khlx
        }).then(res => {
            // form.recordset.val('公海转潜在提交人', '')
            // form.recordset.val('公海转潜在审核人', '退回')
            form.close();
            _.ui.message.success('通过操作成功')
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], customer_gh_BtnClick, '公海客户')