// 编辑界面数据加载以后执行
const payment_approval_load = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    recordset.tables['正常付款详情']._.toolbar.show('new', false);
    recordset.tables['正常付款详情']._.toolbar.show('insert-data', false);
    recordset.tables['产品资料']._.toolbar.show('new', false);
    recordset.tables['产品资料']._.toolbar.show('insert-data', false);

    if (recordset.val('经办人员') != '' && recordset.val('经办人员') != _.user.username) {
        recordset.tables['预付分配']._.toolbar.show('delete', false);
        recordset.tables['产品资料']._.toolbar.show('delete', false);
        recordset.tables['付款分配']._.toolbar.show('delete', false);
        recordset.tables['正常付款详情']._.toolbar.show('delete', false);
        recordset.tables['预付分配']._.toolbar.show('new', false);
        recordset.tables['预付分配']._.toolbar.show('insert-data', false);
        recordset.tables['产品资料']._.toolbar.show('new', false);
        recordset.tables['产品资料']._.toolbar.show('insert-data', false);
        recordset.tables['付款分配']._.toolbar.show('new', false);
        recordset.tables['付款分配']._.toolbar.show('insert-data', false);
        recordset.tables['正常付款详情']._.toolbar.show('new', false);
        recordset.tables['正常付款详情']._.toolbar.show('insert-data', false);

    }
    if (recordset.val('财务审批识别') == '通过') {
        recordset.tables['付款分配']._.toolbar.show('delete', false);
    }

    recordset.module.group_by_name('预付分配').visible = false;
    recordset.module.group_by_name('产品资料').visible = false;
    recordset.module.group_by_name('付款分配').visible = false;
    recordset.module.group_by_name('正常付款详情').visible = false;
    if (recordset.val('付款类型') == '预付款') {
        recordset.module.group_by_name('付款分配').visible = true;
        if (recordset.val('财务审批') == '通过') {
            recordset.module.group_by_name('预付分配').visible = true;
        }
    }
    if (recordset.val('付款类型') == '提前付款') {
        recordset.module.group_by_name('产品资料').visible = true;
    }
    if (recordset.val('付款类型') == '正常付款') {
        recordset.module.group_by_name('正常付款详情').visible = true;
    }
    recordset.module.field_by_full_name('正常日期').disabled = true;
    recordset.module.field_by_full_name('工厂选取').disabled = true;
    recordset.module.field_by_full_name('客户编号').disabled = true;
    recordset.module.field_by_full_name('开票序号').disabled = true;
    recordset.module.field_by_full_name('工厂编号').disabled = true;
    recordset.module.field_by_full_name('审请付款日期').disabled = true;
    recordset.module.field_by_full_name('结算方式').disabled = true;
    recordset.module.field_by_full_name('经办人员').disabled = true;
    recordset.module.field_by_full_name('采购合同').disabled = true;
    recordset.module.field_by_full_name('外销合同').disabled = true;
    recordset.module.field_by_full_name('发票号码').disabled = true;
    recordset.module.field_by_full_name('审请日期').disabled = true;
    recordset.module.field_by_full_name('审请金额').disabled = true;
    recordset.module.field_by_full_name('折扣费用').disabled = true;
    recordset.module.field_by_full_name('出货日期').disabled = true;
    recordset.module.field_by_full_name('财务工厂').disabled = true;
    recordset.module.field_by_full_name('付款币种').disabled = true;
    recordset.module.field_by_full_name('货款类型').disabled = true;
    recordset.module.field_by_full_name('我方公司').disabled = true;
    recordset.module.field_by_full_name('备注说明').disabled = true;
    recordset.module.field_by_full_name('付款抬头').disabled = true;
    recordset.module.field_by_full_name('厂商名称').disabled = true;
    recordset.module.field_by_full_name('联系方式').disabled = true;
    recordset.module.field_by_full_name('联系人').disabled = true;
    recordset.module.field_by_full_name('手机号码').disabled = true;
    recordset.module.field_by_full_name('银行帐号').disabled = true;
    recordset.module.field_by_full_name('开户银行').disabled = true;
    recordset.module.field_by_full_name('付款地区').disabled = true;
    recordset.module.field_by_full_name('付款形式').disabled = true;
    recordset.module.field_by_full_name('审请付款日期').disabled = true;
    recordset.module.field_by_full_name('是否开票').disabled = true;
    recordset.module.field_by_full_name('增值税率').disabled = true;
    recordset.module.field_by_full_name('开票工厂').disabled = true;
    recordset.module.field_by_full_name('预付货值合计').disabled = true;
    recordset.module.field_by_full_name('客户名称').disabled = true;
    recordset.module.field_by_full_name('RTS采购单号').disabled = true;
    recordset.module.field_by_full_name('中文品名').disabled = true;
    recordset.module.field_by_full_name('是否暂扣').disabled = true;
    recordset.module.field_by_full_name('暂扣金额').disabled = true;
    recordset.module.field_by_full_name('工厂满意度').disabled = true;
    recordset.module.field_by_full_name('原   因').disabled = true;
    recordset.module.field_by_full_name('退    返').disabled = true;
    recordset.module.field_by_full_name('查询编号').disabled = true;
    recordset.module.field_by_full_name('合同起始').disabled = true;
    recordset.module.field_by_full_name('合同结束').disabled = true;
    recordset.module.field_by_full_name('提交主管').disabled = true;
    recordset.module.field_by_full_name('主管审批').disabled = true;
    recordset.module.field_by_full_name('审批日期').disabled = true;
    recordset.module.field_by_full_name('审批意见').disabled = true;
    recordset.module.field_by_full_name('提交总监').disabled = true;
    recordset.module.field_by_full_name('总监审批').disabled = true;
    recordset.module.field_by_full_name('1审批日期').disabled = true;
    recordset.module.field_by_full_name('总监意见').disabled = true;
    recordset.module.field_by_full_name('提交财务').disabled = true;
    recordset.module.field_by_full_name('财务审批').disabled = true;
    recordset.module.field_by_full_name('批准金额').disabled = true;
    recordset.module.field_by_full_name('审批日期1').disabled = true;
    recordset.module.field_by_full_name('财务意见').disabled = true;
    recordset.module.field_by_full_name('付款类型').disabled = true;
    recordset.module.field_by_full_name('付款日期').disabled = true;
    recordset.module.field_by_full_name('提交总经理').disabled = true;
    recordset.module.field_by_full_name('总经理审批').disabled = true;
    recordset.module.field_by_full_name('1审批日期1').disabled = true;
    recordset.module.field_by_full_name('总经理意见').disabled = true;
    recordset.module.field_by_full_name('产品资料.审请金额').disabled = true;
    recordset.module.field_by_full_name('产品资料.使用备注').disabled = true;
    recordset.module.field_by_full_name('产品资料.付款抬头').disabled = true;
    recordset.module.field_by_full_name('预付分配.预付金额').disabled = true;
    recordset.module.field_by_full_name('正常付款详情.审请金额').disabled = true;
    recordset.module.field_by_full_name('正常付款详情.是否暂扣').disabled = true;
    recordset.module.field_by_full_name('正常付款详情.暂扣金额').disabled = true;
    recordset.module.field_by_full_name('付款分配.总 金 额').disabled = true;
    recordset.module.field_by_full_name('付款分配.合同日期').disabled = true;
    recordset.module.field_by_full_name('付款分配.交货日期').disabled = true;
    recordset.module.field_by_full_name('付款分配.付款抬头').disabled = true;
    recordset.module.field_by_full_name('付款分配.审请金额').disabled = true;
    recordset.module.field_by_full_name('付款分配.采购合同').disabled = true;
    recordset.module.field_by_full_name('付款分配.跟单人员').disabled = true;
    recordset.module.field_by_full_name('付款分配.业务人员').disabled = true;
    recordset.module.field_by_full_name('付款分配.采购人员').disabled = true;
    recordset.module.field_by_full_name('付款分配.是否开票').disabled = true;
    recordset.module.field_by_full_name('付款分配.开票工厂').disabled = true;
    recordset.module.field_by_full_name('付款分配.增值税率').disabled = true;
    recordset.module.field_by_full_name('付款分配.联系方式').disabled = true;
    recordset.module.field_by_full_name('付款分配.联系人').disabled = true;
    recordset.module.field_by_full_name('付款分配.手机号码').disabled = true;
    recordset.module.field_by_full_name('付款分配.结算方式').disabled = true;

    _.http.post('/api/saier/payment_approval/load/check', {
        rid: recordset.val('rid'),
        khmc: recordset.val('客户名称'),
        sfkp: recordset.val('是否开票'),
        xbdm: recordset.val('信保代码'),
        wfgs1: recordset.val('我方公司'),
        cxsb: recordset.val('诚信识别'),
        csmc: recordset.val('厂商名称'),
        cwgc: recordset.val('财务工厂'),
        yw: recordset.val('业务'),
        fkbh: recordset.val('付款编号')
    }).then(res => {
        if (res.code == 1) {
            let data = res.data
            if (data.msgdata == 1) {
                _.ui.message.warning('请注意此客人为信保客人' + '\r\n' + '有报关率要求:' + recordset.val('报关率要求'))
            }
            if (data.wfgsdata == 1) {
                recordset.val('我方公司', data.wfgs2)
                recordset.val('业务部门', data.bm)
            }
            if (data.cxsbdata == 1) {
                recordset.val('诚信识别', '已提供')
            }
            if (data.zsrq != '') {
                recordset.val('正常日期', data.zsrq)
            }
            if (data.path != '') {
                recordset.val('业务', data.path)
            }
            if (data.sb != 3) {
                if ((recordset.val('经办人员') == '') || (recordset.val('经办人员') == username)) {
                    if (recordset.val('提交主管') == '') {
                        if (recordset.val('经办人员') == '') {
                            recordset.val('经办人员', username);
                        }
                        recordset.module.field_by_full_name('客户编号').disabled = false;
                        recordset.module.field_by_full_name('工厂选取').disabled = false;
                        recordset.module.field_by_full_name('我方公司').disabled = false;
                        recordset.module.field_by_full_name('经办人员').disabled = false;
                        recordset.module.field_by_full_name('厂商名称').disabled = false;
                        recordset.module.field_by_full_name('外销合同').disabled = false;
                        recordset.module.field_by_full_name('发票号码').disabled = false;
                        recordset.module.field_by_full_name('采购合同').disabled = false;
                        recordset.module.field_by_full_name('预付货值合计').disabled = false;
                        recordset.module.field_by_full_name('审请付款日期').disabled = false;
                        recordset.module.field_by_full_name('折扣费用').disabled = false;
                        recordset.module.field_by_full_name('审请日期').disabled = false;
                        recordset.module.field_by_full_name('审请金额').disabled = false;
                        recordset.module.field_by_full_name('出货日期').disabled = false;
                        recordset.module.field_by_full_name('财务工厂').disabled = false;
                        recordset.module.field_by_full_name('付款抬头').disabled = false;
                        recordset.module.field_by_full_name('付款币种').disabled = false;
                        recordset.module.field_by_full_name('货款类型').disabled = false;
                        recordset.module.field_by_full_name('RTS采购单号').disabled = false;
                        recordset.module.field_by_full_name('备注说明').disabled = false;
                        recordset.module.field_by_full_name('中文品名').disabled = false;
                        recordset.module.field_by_full_name('厂商名称').disabled = false;
                        recordset.module.field_by_full_name('联系方式').disabled = false;
                        recordset.module.field_by_full_name('联系人').disabled = false;
                        recordset.module.field_by_full_name('手机号码').disabled = false;
                        recordset.module.field_by_full_name('银行帐号').disabled = false;
                        recordset.module.field_by_full_name('开户银行').disabled = false;
                        recordset.module.field_by_full_name('付款地区').disabled = false;
                        recordset.module.field_by_full_name('付款形式').disabled = false;
                        recordset.module.field_by_full_name('是否开票').disabled = false;
                        recordset.module.field_by_full_name('增值税率').disabled = false;
                        recordset.module.field_by_full_name('客户名称').disabled = false;
                        recordset.module.field_by_full_name('工厂满意度').disabled = false;
                        recordset.module.field_by_full_name('查询编号').disabled = false;
                        recordset.module.field_by_full_name('合同起始').disabled = false;
                        recordset.module.field_by_full_name('合同结束').disabled = false;
                        recordset.module.field_by_full_name('原   因').disabled = false;
                        recordset.module.field_by_full_name('退    返').disabled = false;

                        if ((recordset.val('付款编号') != '待生成') && (recordset.val('付款编号') != '')) {
                            recordset.module.field_by_full_name('提交主管').disabled = false;
                            recordset.module.field_by_full_name('提交总监').disabled = false;
                            recordset.module.field_by_full_name('提交总经理').disabled = false;
                            recordset.module.field_by_full_name('提交财务').disabled = false;
                        }

                        recordset.module.field_by_full_name('工厂编号').disabled = false;
                        recordset.module.field_by_full_name('审请付款日期').disabled = false;
                        recordset.module.field_by_full_name('结算方式').disabled = false;
                        recordset.module.field_by_full_name('开票工厂').disabled = false;

                        if (recordset.val('付款类型') != '正常付款') {
                            recordset.module.field_by_full_name('产品资料.审请金额').disabled = false;
                            recordset.module.field_by_full_name('产品资料.使用备注').disabled = false;
                            recordset.module.field_by_full_name('产品资料.付款抬头').disabled = false;
                        }

                        recordset.module.field_by_full_name('付款分配.付款抬头').disabled = false;
                        recordset.module.field_by_full_name('付款分配.审请金额').disabled = false;
                        recordset.module.field_by_full_name('付款分配.采购合同').disabled = false;
                        recordset.module.field_by_full_name('正常付款详情.审请金额').disabled = false;
                        recordset.module.field_by_full_name('正常付款详情.是否暂扣').disabled = false;
                        recordset.module.field_by_full_name('正常付款详情.暂扣金额').disabled = false;
                    }

                    if ((recordset.val('财务审批') == '通过') && (recordset.val('付款类型') == '预付款')) {
                        recordset.module.field_by_full_name('预付分配.预付金额').disabled = false;
                    }
                }

                if ((recordset.val('经办人员') == username) && (recordset.val('rts识别') == '是') && (recordset.val('提交财务') == '') && (recordset.val('总经理审批') == '通过')) {
                    recordset.module.field_by_full_name('工厂选取').disabled = false;
                    recordset.module.field_by_full_name('经办人员').disabled = false;
                    recordset.module.field_by_full_name('厂商名称').disabled = false;
                    recordset.module.field_by_full_name('外销合同').disabled = false;
                    recordset.module.field_by_full_name('发票号码').disabled = false;
                    recordset.module.field_by_full_name('采购合同').disabled = false;
                    recordset.module.field_by_full_name('审请付款日期').disabled = false;
                    recordset.module.field_by_full_name('折扣费用').disabled = false;
                    recordset.module.field_by_full_name('审请日期').disabled = false;
                    recordset.module.field_by_full_name('我方公司').disabled = false;
                    recordset.module.field_by_full_name('财务工厂').disabled = false;
                    recordset.module.field_by_full_name('付款抬头').disabled = false;
                    recordset.module.field_by_full_name('付款币种').disabled = false;
                    recordset.module.field_by_full_name('备注说明').disabled = false;
                    recordset.module.field_by_full_name('中文品名').disabled = false;
                    recordset.module.field_by_full_name('厂商名称').disabled = false;
                    recordset.module.field_by_full_name('联系方式').disabled = false;
                    recordset.module.field_by_full_name('联系人').disabled = false;
                    recordset.module.field_by_full_name('手机号码').disabled = false;
                    recordset.module.field_by_full_name('银行帐号').disabled = false;
                    recordset.module.field_by_full_name('开户银行').disabled = false;
                    recordset.module.field_by_full_name('付款地区').disabled = false;
                    recordset.module.field_by_full_name('客户名称').disabled = false;
                    recordset.module.field_by_full_name('提交财务').disabled = false;
                }

                if (((recordset.val('总监审批') == '待审批') || (recordset.val('总监审批') == '不通过')) && (recordset.val('提交主管') == username)) {
                    if (recordset.val('主管审批') == '通过') {
                        recordset.module.field_by_full_name('提交总监').disabled = false;
                    }
                    recordset.module.field_by_full_name('主管审批').disabled = false;
                    recordset.module.field_by_full_name('审批日期').disabled = false;
                    recordset.module.field_by_full_name('审批意见').disabled = false;
                }

                if (((recordset.val('总经理审批') == '待审批') || (recordset.val('总经理审批') == '不通过')) && (recordset.val('提交总监') == username) && (recordset.val('主管审批') == '通过')) {
                    if (recordset.val('总监审批') == '通过') {
                        recordset.module.field_by_full_name('提交总经理').disabled = false;
                    }
                    if ((recordset.val('主管审批') == '通过') && (((recordset.val('诚信识别') == '不需要') || (recordset.val('诚信识别') == '已提供') || (recordset.val('诚信识别') == '是')) || (recordset.val('付款类型') == '预付款'))) {
                        recordset.module.field_by_full_name('总监审批').disabled = false;
                        recordset.module.field_by_full_name('1审批日期').disabled = false;
                        recordset.module.field_by_full_name('总监意见').disabled = false;
                    }
                }

                if (((recordset.val('财务审批') == '待审批') || (recordset.val('财务审批') == '不通过')) && (recordset.val('提交总经理') == username)) {
                    if (recordset.val('总经理审批') == '通过') {
                        recordset.module.field_by_full_name('提交财务').disabled = false;
                    }
                    if (recordset.val('总监审批') == '通过') {
                        recordset.module.field_by_full_name('总经理审批').disabled = false;
                        recordset.module.field_by_full_name('1审批日期1').disabled = false;
                        recordset.module.field_by_full_name('总经理意见').disabled = false;
                    }
                }

                if (recordset.val('提交财务') == username.toUpperCase()) {
                    recordset.val('财务人员', '是');

                    recordset.module.field_by_full_name('工厂选取').visible = true;
                    recordset.module.field_by_full_name('工厂编号').visible = true;
                    recordset.module.field_by_full_name('我方公司').visible = true;
                    recordset.module.field_by_full_name('联系方式').visible = true;
                    recordset.module.field_by_full_name('手机号码').visible = true;
                    recordset.module.field_by_full_name('联系人').visible = true;
                    recordset.module.field_by_full_name('审请分配').visible = true;
                    recordset.module.field_by_full_name('增值税率').visible = true;
                    recordset.module.field_by_full_name('合同日期').visible = true;
                    recordset.module.field_by_full_name('开票合计').visible = true;
                    recordset.module.field_by_full_name('不开票合计').visible = true;
                    recordset.module.field_by_full_name('是否提交').visible = true;
                    recordset.module.field_by_full_name('退    返').visible = true;
                    recordset.module.field_by_full_name('工厂满意度').visible = true;
                    recordset.module.field_by_full_name('合同起始').visible = true;
                    recordset.module.field_by_full_name('合同结束').visible = true;
                    recordset.module.field_by_full_name('查询编号').visible = true;
                    recordset.module.field_by_full_name('原   因').visible = true;
                    recordset.module.field_by_full_name('抹零识别').visible = true;
                    recordset.module.field_by_full_name('正常日期').visible = true;
                    recordset.module.field_by_full_name('产品编号').visible = true;
                    recordset.module.field_by_full_name('总数量').visible = true;
                    recordset.module.field_by_full_name('预计出货').visible = true;
                    recordset.module.field_by_full_name('合同预付').visible = true;
                    recordset.module.field_by_full_name('提前发票总').visible = true;
                    recordset.module.field_by_full_name('审批意见').visible = true;
                    recordset.module.field_by_full_name('总监意见').visible = true;
                    recordset.module.field_by_full_name('总经理意见').visible = true;
                    recordset.module.field_by_full_name('付款类型').visible = true;
                    recordset.module.field_by_full_name('付款日期').visible = true;

                    if (recordset.val('总经理审批') == '通过') {
                        if (recordset.val('付款类型') != '') {
                            recordset.module.field_by_full_name('财务审批').disabled = false;
                        }
                        recordset.module.field_by_full_name('批准金额').disabled = false;
                        recordset.module.field_by_full_name('审批日期1').disabled = false;
                        recordset.module.field_by_full_name('财务意见').disabled = false;
                        recordset.module.field_by_full_name('付款类型').disabled = false;
                        recordset.module.field_by_full_name('提交总经理').disabled = false;
                        recordset.module.field_by_full_name('付款日期').disabled = false;
                    }
                }
            }


        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })

}
_.evts.on([_.evtids.RECORD_LOAD], payment_approval_load, '付款审批')


const payment_approval_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let n = module.name
    let row = current_record
    let username = _.user.username

    if (field.full_name == n + '.提交财务') {

        if (recordset.val('付款编号') != '') {
            if (recordset.val('提交财务') != '') {
                _.http.post('/api/saier/payment_approval/tjcw/change', {
                    fklx: recordset.val('付款类型'),
                    hzhj: recordset.val('货值合计'),
                    fkbh: recordset.val('付款编号'),
                    tjcw: recordset.val('提交财务')
                }).then(res => {
                    if (res.code == 0) {
                        _.ui.message.error(res.msg)
                        recordset.val('提交财务', '')

                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })

            }
        }
    }

    if (field.full_name == n + '.提交主管') {
        const fksb = ''

        if (recordset.val('付款类型') !== '预付款') {
            if (recordset.val('审请金额') === recordset.val('提前合计')) {
                recordset.val('是否分配', '是');
            } else {
                recordset.val('是否分配', '否');
                fksb = '1';
            }

            const chengXinStatus = recordset.val('诚信识别');
            const isChengXinValid = ['不需要', '已提供', '是'].includes(chengXinStatus);
            const isPrepayment = recordset.val('付款类型') === '预付款';

            if (!(isChengXinValid || isPrepayment)) {
                _.ui.message.error('不好意思,请先提供诚信识别,谢谢!')
                recordset.val('提交主管', '');
            }
        } else {
            if (recordset.val('审请金额') !== recordset.val('预付合计')) {
                fksb = '1';
            }
        }

        if (recordset.val('付款类型') === '正常付款') {
            fksb = '';
        }

        if (fksb == '1') {
            _.ui.message.error('不好意思,请先分配好金额,谢谢!')
            recordset.val('提交主管', '');
        } else {
            if (recordset.val('审请金额') == 0) {
                _.ui.message.error('不好意思,请填写申请金额,谢谢!')
                recordset.val('提交主管', '');
            } else {
                if (recordset.val('付款编号') != '' && recordset.val('付款编号') != '待生成') {
                    if (recordset.val('提交主管') != '') {
                        _.http.post('/api/saier/payment_approval/tjzg/change', {
                            fkbh: recordset.val('付款编号'),
                            tjzg: recordset.val('提交主管'),
                            jbry: recordset.val('经办人员')
                        }).then(res => {
                            if (res.code == 0) {
                                _.ui.message.error(res.msg)
                                recordset.val('提交主管', '')

                            }
                            if (res.code == 1) {
                                recordset.val('提交总监', res.data.wb2)
                                recordset.val('提交总经理', res.data.wb3)

                                const isAmzInvoice = recordset.val('发票号码').toUpperCase().indexOf('AMZ') > -1;
                                const isAmazonCustomer = recordset.val('客户名称').toUpperCase().indexOf('AMAZON') > -1;
                                const isNingboJingye = recordset.val('我方公司') === '宁波景业国际贸易有限公司';

                                if (isAmzInvoice || isAmazonCustomer || isNingboJingye) {
                                    recordset.val('提交财务', res.data.wb8);
                                } else {
                                    recordset.val('提交财务', res.data.wb4);
                                }
                                recordset.val('是否提交', '是');
                                if (recordset.val('提交主管') == username) {
                                    recordset.val('主管审批', '通过');
                                }

                            }
                        }).catch(err => {
                            console.log(err)
                            _.ui.message.error(err.msg)
                        })


                    }

                } else {
                    _.ui.message.error('不好意思,请先保存,谢谢!')
                    recordset.val('提交主管', '');
                }

            }
        }

    }

    if (field.full_name == n + '.提交总经理') {
        if (recordset.val('付款编号') != '') {
            if (recordset.val('提交总经理') == '') {
                recordset.val('总经理审批', '待审批')
            } else {
                if (recordset.val('提交总经理') != '') {
                    _.http.post('/api/saier/payment_approval/tjzjl/change', {
                        fkbh: recordset.val('付款编号'),
                        tjzjl: recordset.val('提交总经理')
                    }).then(res => {
                        if (res.code == 0) {
                            _.ui.message.error(res.msg)
                            recordset.val('提交总经理', '')

                        }
                        if (res.code == 1) {
                            if (recordset.val('总监审批') == '通过') {
                                if (recordset.val('提交总经理') == username) {
                                    recordset.val('总经理审批', '通过');
                                }
                            }
                        }
                    }).catch(err => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                    })
                }
            }
        }
    }

    if (field.full_name == n + '.经理识别') {
        if (recordset.val('经理识别') != '') {
            if (recordset.val('主管审批') != '待审批' && recordset.val('主管审批') != '') {
                if (recordset.val('主管审批') == '不通过') {
                    if (recordset.val('审批意见') == '') {
                        _.ui.show_input_dialog('请输入审批意见', '').then(val => {
                            if (val == '' || val == null || val == undefined) {
                                _.ui.message.error('审批意见不能为空')
                                return
                            }
                            recordset.val('审批意见', val)
                        })
                    }
                    recordset.val('主管审批', '待审批');
                    recordset.val('是否提交', '否');
                    recordset.val('提交主管', '');
                    recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                    recordset.module.field_by_full_name(m + '.主管审批').enabled = false;
                    recordset.module.field_by_full_name(m + '.审批日期').enabled = false;
                    recordset.module.field_by_full_name(m + '.审批意见').enabled = false;

                } else {
                    if (recordset.val('主管审批') == '通过') {
                        if (recordset.val('提交总监') == username) {
                            recordset.val('总监审批', '通过');
                        }

                        recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.module.field_by_full_name(m + '.提交总监').enabled = true;
                        recordset.module.field_by_full_name(m + '.主管审批').enabled = false;
                        recordset.module.field_by_full_name(m + '.审批日期').enabled = false;
                        recordset.module.field_by_full_name(m + '.审批意见').enabled = false;

                    }

                }
            }
        }
    }

    if (field.full_name == n + '.总经理识别') {
        if (recordset.val('总经理识别') != '') {
            if (recordset.val('总经理审批') != '待审批' && recordset.val('总经理审批') != '') {
                if (recordset.val('总经理审批') == '不通过') {
                    if (recordset.val('总经理意见') == '') {
                        _.ui.show_input_dialog('请输入总经理意见', '').then(val => {
                            if (val == '' || val == null || val == undefined) {
                                _.ui.message.error('总经理意见不能为空')
                                return
                            }
                            recordset.val('总经理意见', val)
                        })
                    }
                    recordset.val('提交主管', '');
                    recordset.val('主管审批', '待审批');
                    recordset.val('是否提交', '否');
                    recordset.val('提交总监', '');
                    recordset.val('总监审批', '待审批');

                    recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
                    recordset.val('提交总经理', '');
                    recordset.val('总经理审批', '待审批');
                    recordset.module.field_by_full_name(m + '.总经理审批').enabled = false;
                    recordset.module.field_by_full_name(m + '.1审批日期').enabled = false;
                    recordset.module.field_by_full_name(m + '.总经理意见').enabled = false;
                    recordset.module.field_by_full_name(m + '.总监审批').enabled = false;
                    recordset.module.field_by_full_name(m + '.1审批日期1').enabled = false;
                    recordset.module.field_by_full_name(m + '.总监意见').enabled = false;
                    recordset.module.field_by_full_name(m + '.主管审批').enabled = false;
                    recordset.module.field_by_full_name(m + '.审批日期').enabled = false;
                    recordset.module.field_by_full_name(m + '.审批意见').enabled = false;

                } else {
                    if (recordset.val('总经理审批') == '通过') {
                        if (recordset.val('提交总经理') == username) {
                            recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
                        }
                        recordset.module.field_by_full_name(m + '.提交财务').enabled = true;
                        recordset.module.field_by_full_name(m + '.总经理审批').enabled = false;
                        recordset.module.field_by_full_name(m + '.1审批日期1').enabled = false;
                        recordset.module.field_by_full_name(m + '.总经理意见').enabled = false;
                        recordset.module.field_by_full_name(m + '.总监审批').enabled = false;
                        recordset.module.field_by_full_name(m + '.1审批日期').enabled = false;
                        recordset.module.field_by_full_name(m + '.总监意见').enabled = false;
                        recordset.module.field_by_full_name(m + '.主管审批').enabled = false;
                        recordset.module.field_by_full_name(m + '.审批日期').enabled = false;
                        recordset.module.field_by_full_name(m + '.审批意见').enabled = false;

                    }

                }
            }
        }
    }

    if (field.full_name == n + '.提交总监') {
        if (recordset.val('付款编号') != '') {
            if (recordset.val('提交总监') != '') {
                _.http.post('/api/saier/payment_approval/tjzj/change', {
                    fkbh: recordset.val('付款编号'),
                    tjzjl: recordset.val('提交总监')
                }).then(res => {
                    if (res.code == 0) {
                        _.ui.message.error(res.msg)
                        recordset.val('提交总监', '')
                    }
                    if (res.code == 1) {
                        if (recordset.val('主管审批') == '通过') {
                            if (recordset.val('提交总监') == username) {
                                recordset.val('总监审批', '通过');
                            }
                        }
                        recordset.module.field_by_full_name('主管审批', '主管审批').enabled = false;
                        recordset.module.field_by_full_name('主管审批', '审批日期').enabled = false;
                        recordset.module.field_by_full_name('主管审批', '审批意见').enabled = false;
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
        }
    }

    if (field.full_name == n + '.总监识别') {
        if (recordset.val('总监识别') != '') {
            if (recordset.val('总监审批') != '待审批' && recordset.val('总监审批') != '') {
                if (recordset.val('总监审批') == '不通过') {
                    if (recordset.val('总监意见') == '') {
                        _.ui.show_input_dialog('请输入审批意见', '').then(val => {
                            if (val == '' || val == null || val == undefined) {
                                _.ui.message.error('审批意见不能为空')
                                return
                            }
                            recordset.val('总监意见', val)
                        })
                    }
                    recordset.val('是否提交', '否');
                    recordset.val('主管审批', '待审批');
                    recordset.val('总监审批', '待审批');
                    recordset.val('提交主管', '');
                    recordset.val('提交总监', '');
                    recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));

                    recordset.module.field_by_full_name('总监审批').enabled = false;
                    recordset.module.field_by_full_name('1审批日期').enabled = false;
                    recordset.module.field_by_full_name('总监意见').enabled = false;
                    recordset.module.field_by_full_name('主管审批').enabled = false;
                    recordset.module.field_by_full_name('审批日期').enabled = false;
                    recordset.module.field_by_full_name('审批意见').enabled = false;

                } else {
                    if (recordset.val('总监审批') == '通过') {
                        _.http.post('/api/saier/payment_approval/zjsb/change', {
                            fkbh: recordset.val('付款编号')
                        }).then(res => {
                            if (res.data.cxje < recordset.val('审请金额')) {
                                recordset.module.field_by_full_name('提交总经理').enabled = true;
                                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                                if (recordset.val('提交总经理') == username) {
                                    recordset.module.field_by_full_name('财务审批', '提交财务').enabled = true;
                                    recordset.val('总经理审批', '通过');
                                }
                                recordset.module.field_by_full_name('总监审批').enabled = false;
                                recordset.module.field_by_full_name('1审批日期').enabled = false;
                                recordset.module.field_by_full_name('总监意见').enabled = false;
                                recordset.module.field_by_full_name('主管审批').enabled = false;
                                recordset.module.field_by_full_name('审批日期').enabled = false;
                                recordset.module.field_by_full_name('审批意见').enabled = false;
                                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));

                            } else {
                                recordset.module.field_by_full_name('总监审批').enabled = false;
                                recordset.module.field_by_full_name('1审批日期').enabled = false;
                                recordset.module.field_by_full_name('总监意见').enabled = false;
                                recordset.module.field_by_full_name('主管审批').enabled = false;
                                recordset.module.field_by_full_name('审批日期').enabled = false;
                                recordset.module.field_by_full_name('审批意见').enabled = false;
                                recordset.module.field_by_full_name('提交财务').enabled = true;
                                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));

                                recordset.val('总经理审批', '通过');

                            }

                        }).catch(err => {
                            console.log(err)
                            _.ui.message.error(err.msg)
                        })
                    }

                }
            }
        }
    }

    if (field.full_name == n + '.货款类型') {
        if (recordset.val('货款类型') != '') {
            if (recordset.val('货款类型') == '预付款') {
                recordset.module.group_by_name('预付分配').visible = false;
                recordset.module.group_by_name('产品资料').visible = false;
                recordset.module.group_by_name('付款分配').visible = true;
                recordset.module.group_by_name('正常付款详情').visible = false;

                if (recordset.val('财务审批') == '通过') {
                    recordset.module.group_by_name('预付分配').visible = true;
                }
                if (recordset.val('审请金额') > 0) {
                    recordset.val('审请金额', Math.trunc(recordset.val('审请金额') / 10) * 10)
                }
            }
            if (recordset.val('货款类型') == '正常付款') {
                recordset.module.group_by_name('预付分配').visible = false;
                recordset.module.group_by_name('产品资料').visible = false;
                recordset.module.group_by_name('付款分配').visible = false;
                recordset.module.group_by_name('正常付款详情').visible = true;
            }
            if (recordset.val('货款类型') == '提前付款') {
                recordset.module.group_by_name('预付分配').visible = false;
                recordset.module.group_by_name('产品资料').visible = true;
                recordset.module.group_by_name('付款分配').visible = false;
                recordset.module.group_by_name('正常付款详情').visible = false;
            }

        } else {
            recordset.module.group_by_name('预付分配').visible = false;
            recordset.module.group_by_name('产品资料').visible = false;
            recordset.module.group_by_name('付款分配').visible = false;
            recordset.module.group_by_name('正常付款详情').visible = false;
        }

    }

    if (field.full_name == n + '.财务工厂' || field.full_name == n + '.是否开票') {
        if (recordset.val('财务工厂') != "") {
            _.http.post('/api/saier/payment_approval/cwgc/change', {
                cwgc: recordset.val('财务工厂')
            }).then(res => {
                if (res.data.cwgcdata == 0) {
                    if (recordset.val('是否开票') == '是') {
                        _.ui.message.error('不好意思,财务工厂没提交财务审批,请先审批在提交,谢谢!')
                        recordset.val('财务工厂', '')
                        recordset.val('开户银行', '')
                        recordset.val('银行帐号', '')
                        recordset.val('社会统一信用代码', '')
                    }
                }
                if (res.data.cwgcdata == 1) {
                    recordset.val('开户银行', res.data.bank)
                    recordset.val('银行帐号', res.data.zh)
                    recordset.val('社会统一信用代码', res.data.shui)

                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })
        }
    }

    if (field.full_name == n + '.审请金额') {
        _.http.post('/api/saier/payment_approval/sqje/change', {
            sqje: recordset.val('审请金额'),
            mlsb: recordset.val('抹零识别'),
            fklx: recordset.val('付款类型'),
            rtscgdh: recordset.val('RTS采购单号'),
            gcbh: recordset.val('工厂编号')
        }).then(res => {
            recordset.val('抹零识别', res.data.mlsb);

            if (recordset.val('货值合计') > 0 && recordset.val('审请金额') > 0) {
                const totalRequested = recordset.val('审请金额') + recordset.val('历史审请') + recordset.val('暂扣金额');
                if (totalRequested > recordset.val('货值合计')) {
                    _.ui.message.error('请注意总审请费用大于合同金额!')
                    recordset.val('审请金额', 0);
                }
            }

            let mlje = recordset.val('审请分配');
            let mlje1 = 0;
            let i = 0;
            let sqje1 = 0;

            if (recordset.val('审请金额') > 0 && recordset.val('抹零识别') === '') {
                if (recordset.val('付款类型') === '预付款' && recordset.val('RTS采购单号') === '') {
                    sqje = Math.trunc(recordset.val('审请金额') / 10) * 10;
                    recordset.val('审请金额', sqje);
                    mlje1 = mlje - sqje;

                    if (mlje1 > 0) {
                        let t = recordset.tables['付款分配']
                        let d = t.view_data;
                        for (let r of d) {
                            if (r.seje - mlje1 > 50) {
                                i++;
                                sqje1 = currentApplyAmount;
                            }
                            if (i === 1) {
                                r.seje = sqje1 - mlje1
                                t.push_modi_rid(r.rid)
                            }
                        }
                        t.sync_operate_data()
                        t.modified = true;
                    }
                }

                if (recordset.val('付款类型') === '提前付款' && recordset.val('RTS采购单号') === '') {
                    sqje = Math.trunc(recordset.val('审请金额') / 10) * 10;
                    recordset.val('审请金额', sqje);

                    mlje1 = mlje - sqje;

                    if (mlje1 > 0) {
                        let t = recordset.tables['产品资料']
                        let d = t.view_data;
                        for (let r of d) {
                            if (r.seje - mlje1 > 50) {
                                i++;
                                sqje1 = currentApplyAmount;
                            }
                            if (i === 1) {
                                r.seje = sqje1 - mlje1
                                t.push_modi_rid(r.rid)
                            }
                        }
                        t.sync_operate_data()
                        t.modified = true;
                    }
                }

                if (res.data.cxhc == '否') {
                    _.ui.message.error('请注意需提交诚信报告')
                    recordset.val('诚信识别', '待提供');

                }
                if (res.data.cxhc == '是') {
                    recordset.val('诚信识别', '已提供');
                }

            }
        }).catch(e => {
            _.ui.message.error(e.msg)
            console.log(e)
        })

    }

    if (field.full_name == n + '.是否暂扣') {
        if (recordset.val('是否暂扣') === '否') {
            recordset.module.field_by_full_name('暂扣金额').enabled = true;
        } else {
            recordset.module.field_by_full_name('暂扣金额').enabled = false;
        }
    }

    if (field.full_name == n + '.主管审批') {
        if (recordset.val('主管审批') === '通过') {
            recordset.val('审批日期', new Date().format('yyyy-MM-dd'));

            if (username === recordset.val('提交总监') &&
                (['不需要', '已提供'].includes(recordset.val('财务审批', '诚信识别')) || recordset.val('财务审批', '付款类型') === '预付款')) {
                recordset.val('总监审批', '通过');
            }

            if (username === recordset.val('提交总经理') && recordset.val('总监审批') === '通过') {
                recordset.val('总经理审批', '通过');
            }

            recordset.module.field_by_full_name('提交总监').enabled = true;
        } else {
            recordset.val('总监审批', '待审批');
            recordset.val('总经理审批', '待审批');
        }
    }

    if (field.full_name == n + '.总监审批') {
        if (recordset.val('总监审批') === '通过') {
            recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));

            if (username === recordset.val('提交总经理')) {
                recordset.val('总经理审批', '通过');
            }

            recordset.module.field_by_full_name('提交总经理').enabled = true;
        } else {
            recordset.val('总经理审批', '待审批');
        }
    }

    if (field.full_name == n + '.厂商名称') {
        if (recordset.val('厂商名称') != '') {
            _.http.post('/api/saier/payment_approval/csmc/change', {
                csmc: recordset.val('厂商名称')
            }).then(res => {
                if (res.data.csmcdata == 1) {
                    recordset.val('抹零识别', '否')
                } else {
                    recordset.val('抹零识别', '')
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })
        }
    }

    if (field.full_name == n + '.发票号码') {
        if (recordset.val('发票号码') != '') {
            if (recordset.val('发票号码').toUpperCase().indexOf('AMZ') > -1) {
                recordset.val('我方公司', '宁波景业国际贸易有限公司');
            }
            _.http.post('/api/saier/payment_approval/fphm/change', {
                fphm: recordset.val('发票号码'),
                cwgc: recordset.val('财务工厂'),
                csmc: recordset.val('厂商名称')
            }).then(res => {
                if (res.data.fphmdata == 1) {
                    recordset.val('客户名称', res.data.khmc)
                    recordset.val('RMB客户', res.data.RMBkh)
                    recordset.val('客户编号', res.data.kh_id)
                    recordset.val('报关抬头', res.data.bggs)
                }
                if (res.data.char != 0) {
                    recordset.val('付款出货期', res.data.chrq)
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })
        }
    }

    if (field.full_name == n + '.财务识别') {
        if (recordset.val('财务识别') != '') {
            _.http.post('/api/saier/payment_approval/cwsb/change', {
                khmc: recordset.val('客户名称'),
                fphm: recordset.val('发票号码'),
                wfgs: recordset.val('我方公司'),
                tjzg: recordset.val('提交主管'),
                fklx: recordset.val('付款类型'),
                sqje: recordset.val('审请金额')
            }).then(res => {
                if (recordset.val('财务审批') != '待审批' && recordset.val('财务审批') != '') {
                    if (recordset.val('财务审批') == '不通过') {
                        if (['预付款', '提前付款'].includes(recordset.val('付款类型'))) {
                            recordset.val('web判断', '是');
                        }

                        if (recordset.val('财务意见') == '') {
                            _.ui.show_input_dialog('请输入财务意见', '').then(val => {
                                if (val == '' || val == null || val == undefined) {
                                    _.ui.message.error('财务意见不能为空')
                                    return
                                }
                                recordset.val('财务意见', val)
                            })
                        }
                        recordset.val('财务审批', '待审批');
                        recordset.val('主管审批', '待审批');
                        recordset.val('总经理审批', '待审批');
                        recordset.val('总监审批', '待审批');
                        recordset.val('提交主管', '');
                        recordset.val('提交总监', '');
                        recordset.val('提交总经理', '');
                        recordset.val('提交财务', '');
                        recordset.val('是否提交', '否');
                        recordset.val('付款日期', '');
                        recordset.val('批准金额', 0);

                        if (!(recordset.val('付款类型') === '预付款' && recordset.val('审批日期1') !== '')) {
                            recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
                        }
                        recordset.val('退    返', 0);

                        recordset.module.field_by_full_name('批准金额').enabled = false;
                        recordset.module.field_by_full_name('审批日期1').enabled = false;
                        recordset.module.field_by_full_name('财务意见').enabled = false;
                        recordset.module.field_by_full_name('付款类型').enabled = false;
                    } else {
                        if (recordset.val('财务审批') == '通过') {
                            if (!(res.data.cwzj != '' && res.data.cwzj != username.toUpperCase())) {
                                if (['预付款', '提前付款'].includes(recordset.val('付款类型'))) {
                                    recordset.val('web判断', '是');
                                }

                                if (recordset.val('付款日期') === '') {
                                    recordset.val('付款日期', new Date().format('yyyy-MM-dd'));
                                }
                                recordset.val('批准金额', recordset.val('审请金额'));

                                if (!(recordset.val('付款类型') === '预付款' && recordset.val('审批日期1') !== '')) {
                                    recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
                                }
                                recordset.val('批准金额', recordset.val('审请金额'));

                            }

                        }

                    }
                    if (recordset.val('财务审批') == '不通过' || res.data.cwzj == '' || res.data.cwzj == username.toUpperCase()) {
                        if (recordset.val('付款类型') == '预付款') {
                            let t = recordset.tables['付款分配']
                            let d = t.view_data;
                            for (let r of d) {
                                if (recordset.val('财务审批') == '通过') {
                                    r.fkbh = recordset.val('付款编号')
                                    r.cwsp = recordset.val('财务审批')
                                    r.pzje = recordset.val('审请金额')
                                    r.hklx = recordset.val('货款类型')
                                    r.fkxs = recordset.val('付款形式')
                                    if (r.pzrq === '' && (res.data.cwzj === '' || res.data.cwzj === username.toUpperCase())) {
                                        r.pzrq = recordset.val('财务审批', '审批日期1')
                                    }
                                    r.csmc = recordset.val('厂商名称')

                                } else {
                                    r.cwsp = '待审批'
                                    r.pzje = 0
                                }
                                t.push_modi_rid(r.rid)
                            }
                            t.sync_operate_data()
                            t.modified = true;

                            let yf = recordset.tables['预付分配']
                            let yd = yf.view_data;
                            for (let r of yd) {

                                r.pzrq = ''
                                r.cwsp = '待审批'
                                r.yfje = 0
                                r.pzje = 0
                                r.yfje1 = 0
                                r.fpje = 0
                                yf.push_modi_rid(r.rid)
                            }
                            yf.sync_operate_data()
                            yf.modified = true;
                        }

                        if (recordset.val('付款类型') == '提前付款') {
                            let t = recordset.tables['产品资料']
                            let d = t.view_data;
                            for (let r of d) {
                                if (recordset.val('财务审批') == '通过') {
                                    r.pzje = r.
                                        r.cwsp = recordset.val('财务审批')

                                    if (recordset.val('审批日期1') != '') {
                                        if (recordset.val('审请付款日期') !== '' && recordset.val('审请付款日期') > recordset.val('审批日期1') &&
                                            recordset.val('财务审批') === '通过') {
                                            r.pzrq = recordset.val('审请付款日期')
                                        } else {
                                            r.pzrq = recordset.val('审批日期1')
                                        }

                                    }

                                } else {
                                    r.pzrq = ''
                                    r.cwsp = '待审批'
                                    r.fkwy = ''
                                    r.pzje = 0
                                }
                                t.push_modi_rid(r.rid)
                            }
                            t.sync_operate_data()
                            t.modified = true;
                        }

                    }
                }
                if (res.data.cwzj !== '' && res.data.cwzj !== username.toUpperCase() && recordset.val('财务审批') === '通过') {
                    recordset.val('财务审批', '待审批');
                    recordset.val('提交财务', res.data.cwzj);
                } else {
                    if (recordset.val('财务审批') === '通过') {
                        recordset.val('财务审批识别', '通过');
                    } else {
                        recordset.val('财务审批识别', '待审批');
                    }
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })

        }
    }

    if (field.full_name == n + '.付款分配.审请金额' || field.full_name == n + '.付款分配.进仓日期' || field.full_name == n + '.付款分配.实际出运') {
        if (recordset.value('付款分配.采购合同',row) != '') {
            _.http.post('/api/saier/payment_approval/fkfp/sqje/change', {
                cght: recordset.value('付款分配.采购合同',row),
                fkbh: recordset.value('付款分配.付款编号',row)
            }).then(res => {
                if (res.data.yfhj > 0) {
                    recordset.val('付款分配.历史预付', res.data.yfhj,row)
                } else {
                    recordset.val('付款分配.历史预付', 0,row)
                }
                if (res.data.seje1 > 0) {
                    recordset.val('付款分配.历史审请', res.data.seje1 + res.data.yfhj,row)
                    recordset.val('付款分配.历史折扣', res.data.lszk1,row)
                } else {
                    recordset.val('付款分配.历史审请', 0 + res.data.yfhj,row)
                    recordset.val('付款分配.历史折扣', 0,row)
                }
                const totalAvailable = recordset.value('付款分配.总 金 额',row) - recordset.value('付款分配.历史审请',row) -
                    recordset.value('付款分配.历史折扣',row) - recordset.value('付款分配.优惠金额',row);

                if ((totalAvailable - recordset.value('付款分配.审请金额',row)) < -0.1) {
                    _.ui.message.error('请注意审请金额合计大于总的出货金额!')
                    recordset.val('付款分配.审请金额', 0,row);
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })

        } else {
            const totalAvailable = recordset.value('付款分配.总 金 额',row) - recordset.value('付款分配.历史审请',row) -
                recordset.value('付款分配.历史折扣',row) - recordset.value('付款分配.优惠金额',row);

            if ((totalAvailable - recordset.value('付款分配.审请金额',row)) < -0.1) {
                _.ui.message.error('请注意审请金额合计大于总的出货金额!')
                recordset.val('付款分配.审请金额', 0,row);
            }
        }
    }

    if (field.full_name == n + '.付款分配.审请金额' || field.full_name == n + '.付款分配.进仓日期' || field.full_name == n + '.付款分配.折扣点数' || field.full_name == n + '.付款分配.分配完成') {
        if (recordset.value('付款分配.唯一字段',row) != '') {
            if (
                recordset.value('付款分配.审请金额1',row) !== recordset.value('付款分配.审请金额',row) ||
                recordset.value('付款分配.折扣点数1',row) !== recordset.value('付款分配.折扣点数',row)
            ) {
                _.ui.message.error('请注意数据锁定不能修改!')
                recordset.val('付款分配.审请金额', recordset.value('付款分配.审请金额1',row),row);
                recordset.val('付款分配.折扣点数', recordset.value('付款分配.折扣点数1',row),row);
                recordset.val('付款分配.折扣费用', recordset.value('付款分配.折扣费用1',row),row);
            }
        }
    }

    if (field.full_name == n + '.付款分配.采购合同') {
        if (recordset.value('付款分配.采购合同',row) != '') {
            if (recordset.val('付款抬头') == '') {
                _.ui.message.error('不好意思,请先输入付款抬头,谢谢!')
                recordset.val('付款分配.采购合同', '',row)
            } else {
                _.http.post('/api/saier/payment_approval/fkfp/cght/change', {
                    cght: recordset.value('付款分配.采购合同',row),
                    fktt: recordset.val('付款抬头')
                }).then(res => {
                    if (res.data.ttsb12 != '' && res.data.ttsb12 != recordset.val('付款抬头')) {
                        _.ui.message.error('不好意思,此采购合同已有付款抬头为' + res.data.ttsb12 + '请更改,谢谢!')
                        recordset.val('付款分配.采购合同', '',row)
                    } else {
                        if (res.data.ttsb == '1') {
                            _.ui.message.error('不好意思,此采购合同已有付款抬头为' + res.data.fktt1 + '请更改,谢谢!')
                            recordset.val('付款分配.采购合同', '',row)
                        } else {
                            if (recordset.value('付款分配.采购合同',row) != '') {
                                if (res.data.rtspdata == 1) {
                                    recordset.module.field_by_full_name('付款分配.总 金 额').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.合同日期').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.交货日期').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.付款抬头').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.跟单人员').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.业务人员').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.采购人员').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.是否开票').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.开票工厂').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.增值税率').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.联系方式').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.联系人').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.手机号码').enabled = true;
                                    recordset.module.field_by_full_name('付款分配.结算方式').enabled = true;
                                }
                                if (res.data.rtspdata == 2) {
                                    recordset.val('付款分配.交货日期', res.data.rtspdata1.DeliveryDate, row)
                                    recordset.val('付款分配.我方公司', res.data.rtspdata1.OurCompany, row)
                                    recordset.val('付款分配.采购人员', res.data.rtspdata1.Purchaser, row)
                                    recordset.val('付款分配.总 金 额', res.data.rtspdata1.TotalPurchaseAmount, row)
                                    recordset.val('付款分配.跟单人员', res.data.rtspdata1.Purchaser, row)
                                    recordset.val('付款分配.合同日期', res.data.rtspdata1.OrderDate, row)
                                    recordset.val('付款分配.结算方式', res.data.rtspdata1.SettlementMethod, row)
                                    recordset.val('付款分配.货币代码', res.data.rtspdata1.PurchaseCurrency, row)
                                    recordset.val('付款分配.跟单部门', res.data.rtspdata1.Department, row)
                                    recordset.val('付款分配.采购部门', res.data.rtspdata1.Department, row)
                                    recordset.val('付款分配.开票工厂', res.data.rtspdata1.kpgc, row)

                                }
                                if (res.data.rtspdata == 3) {
                                    recordset.val('付款分配.交货日期', res.data.rtspdata1.jhrq, row)
                                    recordset.val('付款分配.我方公司', res.data.rtspdata1.wfgs, row)
                                    recordset.val('付款分配.客户名称', res.data.rtspdata1.khmc, row)
                                    recordset.val('付款分配.业务人员', res.data.rtspdata1.ywry, row)
                                    recordset.val('付款分配.采购人员', res.data.rtspdata1.cgry, row)
                                    recordset.val('付款分配.联系方式', res.data.rtspdata1.gcdh, row)
                                    recordset.val('付款分配.联系人', res.data.rtspdata1.lxry, row)
                                    recordset.val('付款分配.手机号码', res.data.rtspdata1.sjhm, row)
                                    recordset.val('付款分配.总 金 额', res.data.rtspdata1.htje, row)
                                    recordset.val('付款分配.跟单人员', res.data.rtspdata1.gdry, row)
                                    recordset.val('付款分配.优惠金额', res.data.rtspdata1.yhje, row)
                                    recordset.val('付款分配.合同日期', res.data.rtspdata1.htrq, row)
                                    recordset.val('付款分配.结算方式', res.data.rtspdata1.jsfs, row)
                                    recordset.val('付款分配.货币代码', res.data.rtspdata1.hbdm, row)
                                    recordset.val('付款分配.跟单部门', res.data.rtspdata1.gdbm, row)
                                    recordset.val('付款分配.采购部门', res.data.rtspdata1.cgbm, row)
                                    recordset.val('付款分配.外销合同', res.data.rtspdata1.wxht, row)
                                    recordset.val('付款分配.开票工厂', res.data.rtspdata1.kpgc, row)
                                    recordset.val('付款分配.外销部门', res.data.rtspdata1.wxbm, row)
                                    recordset.val('付款分配.诚信识别', res.data.rtspdata1.sfsh, row)
                                    recordset.val('付款分配.业务部门', recordset.val('业务部门'), row)
                                }
                                if (res.data.zzsl !== '') {
                                    recordset.val('付款分配.是否开票', '是', row);
                                    recordset.val('付款分配.增值税率', res.data.zzsl, row);
                                } else {
                                    recordset.val('付款分配.是否开票', '否', row);
                                    recordset.val('付款分配.增值税率', '0', row);
                                }
                                recordset.val('付款分配.产品编号', res.data.cpbh, row);
                                recordset.val('付款分配.中文品名', res.data.zwpm, row);
                                recordset.val('付款分配.预计出货', res.data.yjcq, row);
                                recordset.val('付款分配.总数量', res.data.zsl, row);
                                recordset.val('付款分配.预计出货1', res.data.yjch1, row);

                                recordset.val('付款分配.历史预付', res.data.yfhj, row);
                                if (res.data.seje1 > 0) {
                                    recordset.val('付款分配.历史审请', res.data.seje1 + res.data.yfhj, row);
                                    recordset.val('付款分配.历史折扣', res.data.lszk1, row);

                                } else {
                                    recordset.val('付款分配.历史审请', 0 + res.data.yfhj, row);
                                    recordset.val('付款分配.历史折扣', 0, row);
                                }

                            }

                            let i = 0;
                            let i1 = 0;
                            let i2 = 0;
                            let i3 = 0;

                            if (recordset.val('付款分配.采购合同') != '') {
                                let t = recordset.tables['付款分配']
                                let d = t.view_data;
                                for (let r of d) {
                                    i2++
                                    if (r.chht == recordset.val('付款分配.采购合同')) {
                                        i++;
                                        if (i > 1) {
                                            i3 = i2; // 记录重复项的位置
                                        }

                                    }
                                }
                            }

                            i1 = 0;
                            if (i > 1) {
                                _.ui.message.error('请注意,此采购合同在此票已有,请重新输入,谢谢!');
                                let t = recordset.tables['付款分配']
                                let d = t.view_data;
                                for (let r of d) {
                                    i1++;
                                    if (i1 === i3) {
                                        r.cght == ''
                                        t.push_modi_rid(r.rid)
                                    }
                                }
                                t.sync_operate_data()
                                t.modified = true;
                            }
                        }
                    }

                }).catch(e => {
                    _.ui.message.error(e.msg)
                    console.log(e)
                })

            }


        }
    }

    if (field.full_name == n + '.产品资料.审请金额') {
        if (recordset.value('产品资料.出运唯一字段',row) !== '') {
            if (recordset.val('提交主管') !== '') {
                if (recordset.value('产品资料.审请金额1',row) !== recordset.value('产品资料.审请金额',row) &&
                    recordset.value('产品资料.审请金额1',row) > 0) {
                    _.ui.message.error('请注意审请金额分配后就不能修改，数据将回滚到修改前!');
                    recordset.val('产品资料.审请金额', recordset.value('产品资料.审请金额1',row), row);
                } else {
                    _.http.post('/api/saier/payment_approval/cpzl/sqje/change', {
                        rid: recordset.val('rid'),
                        cght: recordset.value('产品资料.采购合同',row),
                        ywfp: recordset.value('产品资料.业务发票',row),
                        cywyzd: recordset.value('产品资料.出运唯一字段',row),
                        wxwyzd: recordset.value('产品资料.外销唯一字段',row),
                        jsfs: recordset.value('产品资料.结算方式',row),
                        jcrq: recordset.value('产品资料.进仓日期',row)
                    }).then(res => {
                        if (res.data.sqjedata == 1) {
                            recordset.val('产品资料.历史审请', res.data.seje1,row)
                        }
                        if (res.data.sb == '1') {
                            recordset.val('产品资料.审请金额', 0, row);
                        }
                        let sqje = 0;
                        if (res.data.sb === '') {
                            if (recordset.value('产品资料.已申请金额',row) > 0) {
                                _.ui.message.error('请注意此票已有提前申请');
                                sqje = recordset.value('产品资料.总 金 额',row) - recordset.value('产品资料.预付金额',row) -
                                    recordset.value('产品资料.折扣费用',row) - recordset.value('产品资料.已申请金额',row);
                            } else {
                                sqje = recordset.value('产品资料.总 金 额',row) - recordset.value('产品资料.预付金额',row) -
                                    recordset.value('产品资料.折扣费用',row) - recordset.value('产品资料.历史审请',row);
                            }

                            if (recordset.value('产品资料.审请金额',row) > sqje) {
                                recordset.val('产品资料.审请金额', sqje, row);
                            } else {
                                recordset.val('产品资料.批准金额', recordset.value('产品资料.审请金额',row), row);
                            }
                        }

                    }).catch(e => {
                        _.ui.message.error(e.msg)
                        console.log(e)
                    })

                }
            }
        }

    }

    if (field.full_name == n + '.产品资料.进仓日期' || field.full_name == n + '.产品资料.实际出运' || field.full_name == n + '.产品资料.结算方式' || field.full_name == n + '.产品资料.出运唯一字段') {
        if (recordset.value('产品资料.付款唯一',row) === '') {
            if (recordset.value('产品资料.出运唯一字段',row) !== '') {
                if (recordset.value('产品资料.结算方式',row) !== '') {
                    _.http.post('/api/saier/payment_approval/cpzl/sqje/change', {
                        jsfs: recordset.value('产品资料.结算方式',row),
                        yjch: recordset.value('产品资料.预计出货',row)
                    }).then(res => {
                        if (res.data.jsjc.indexOf('进仓') > -1) {
                            if (recordset.value('产品资料.进仓日期',row) !== '') {
                                const delayDays = res.data.jsts
                                const targetWeekday = res.data.week

                                if (targetWeekday > 0) {
                                    const initialDate = new Date(Date.parse(recordset.value('产品资料.进仓日期',row)) + delayDays * 24 * 60 * 60 * 1000);
                                    const initialDayOfWeek = initialDate.getDay();

                                    let finalDate;
                                    if (initialDayOfWeek > targetWeekday) {
                                        const daysToAdd = 7 - initialDayOfWeek + targetWeekday;
                                        finalDate = new Date(initialDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                                    } else if (initialDayOfWeek < targetWeekday) {
                                        const daysToAdd = targetWeekday - initialDayOfWeek;
                                        finalDate = new Date(initialDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                                    } else {
                                        finalDate = initialDate;
                                    }

                                    recordset.val('产品资料.合同结算期', finalDate.toISOString().split('T')[0], row);
                                } else {
                                    const calculatedDate = new Date(Date.parse(recordset.value('产品资料.进仓日期',row)) + delayDays * 24 * 60 * 60 * 1000);
                                    recordset.val('产品资料.合同结算期', calculatedDate.toISOString().split('T')[0], row);
                                }
                            } else {
                                recordset.val('产品资料.审请金额', 0, row);
                            }
                        }

                        if (res.data.jsjc.indexOf('出运') > -1) {
                            if (recordset.value('产品资料.预计出货',row) !== '') {
                                const delayDays = res.data.jsts
                                const targetWeekday = res.data.week

                                if (targetWeekday > 0) {
                                    const initialDate = new Date(Date.parse(recordset.value('产品资料.预计出货',row)) + delayDays * 24 * 60 * 60 * 1000);
                                    const initialDayOfWeek = initialDate.getDay();

                                    let finalDate;
                                    if (initialDayOfWeek > targetWeekday) {
                                        const daysToAdd = 7 - initialDayOfWeek + targetWeekday;
                                        finalDate = new Date(initialDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                                    } else if (initialDayOfWeek < targetWeekday) {
                                        const daysToAdd = targetWeekday - initialDayOfWeek;
                                        finalDate = new Date(initialDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
                                    } else {
                                        finalDate = initialDate;
                                    }

                                    recordset.val('产品资料.合同结算期', finalDate.toISOString().split('T')[0], row);
                                } else {
                                    const calculatedDate = new Date(Date.parse(recordset.value('产品资料.预计出货',row)) + delayDays * 24 * 60 * 60 * 1000);
                                    recordset.val('产品资料.合同结算期', calculatedDate.toISOString().split('T')[0], row);
                                }
                            } else {
                                recordset.val('产品资料.审请金额', 0, row);
                            }
                        }

                        recordset.val('产品资料.批准金额', recordset.val('产品资料.审请金额', row));

                        if (recordset.value('产品资料.预计出货', row) !== '') {
                            let cwjsq = '';
                            let s = 0;
                            let s1 = 0;

                            if (res.data.sz1 > 0) {
                                const initialDate = new Date(Date.parse(recordset.value('产品资料.预计出货', row)) + res.data.jsts * 24 * 60 * 60 * 1000);
                                s = initialDate.getDay();

                                if (s > sz1) {
                                    s1 = 7 - s + res.data.sz1;
                                    cwjsq = (new Date(initialDate.getTime() + s1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
                                } else if (s < sz1) {
                                    s1 = sz1 - s;
                                    cwjsq = (new Date(initialDate.getTime() + s1 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
                                } else {
                                    cwjsq = initialDate.toISOString().split('T')[0];
                                }
                            } else {
                                cwjsq = (new Date(Date.parse(recordset.value('产品资料.预计出货', row)) + res.data.jsts * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
                            }

                            recordset.val('产品资料.财务结算期', cwjsq, row);
                        }

                    }).catch(e => {
                        _.ui.message.error(e.msg)
                        console.log(e)
                    })


                }
            }
        }

    }

    if (field.full_name == n + '.预付分配.预付金额') {
        if (recordset.value('预付分配.预付金额', row) != 0) {
            if (recordset.value('预付分配.出运唯一字段', row) != '') {
                let sb = '';
                let hthm = '';

                if (recordset.value('预付分配.付款识别', row) != '' && recordset.value('预付分配.预付金额1', row) !== 0) {
                    if (recordset.value('预付分配.预付金额1', row) != recordset.value('预付分配.预付金额', row) &&
                        recordset.value('预付分配.预付金额1', row) !== 0) {
                        _.ui.message.error('请注意预付分配后就不能修改，数据将回滚到修改前!');
                        recordset.val('预付分配.预付金额', recordset.val('预付分配.预付金额1', row), row);
                        recordset.val('预付分配.批准金额', recordset.val('预付分配.预付金额', row), row);
                        sb = '1';
                    }
                } else {
                    const availableAmount = recordset.value('预付分配.采购总价', row) - recordset.value('预付分配.前预付金额', row);

                    if (recordset.value('预付分配.预付金额', row) > availableAmount) {
                        recordset.val('预付分配.预付金额', availableAmount, row);
                        recordset.val('预付分配.批准金额', availableAmount, row);
                    } else {
                        let yfje = 0;
                        recordset.val('预付分配.批准金额', recordset.val('预付分配.预付金额', row), row);
                        let yfjez = recordset.value('预付分配.分配金额', row);
                        let wxfp = recordset.value('预付分配.外销发票', row);
                        let cywyzd = recordset.value('预付分配.出运唯一字段', row);
                        let hthm = recordset.value('预付分配.采购合同', row);

                        let t = recordset.tables['预付分配']
                        let d = t.view_data;
                        for (let r of d) {
                            if (hthm === r.hthm) {
                                yfje += r.yfje;
                            }
                        }

                        if ((yfje - yfjez) > 0.002) {
                            _.ui.message.error('请注意总预付分配高于预付分配,!可分配金额差为' + (yfje - yfjez).toString());
                            let yfjez1 = 0;

                            for (let r of d) {
                                if (wxfp === r.wxfp && cywyzd === r.cywyzd) {
                                    yfjez1 = r.yfje
                                    const newAmount = Math.round((yfjez1 - yfje + yfjez) * 1000) / 1000;
                                    r.yfje = newAmount
                                    r.pzje = newAmount
                                    t.push_modi_rid(r.rid)
                                }
                            }
                            t.sync_operate_data()
                            t.modified = true;

                        }
                    }
                }
            }
        }

    }

    if (field.full_name == n + '.正常付款详情.识别') {
        if (recordset.value('正常付款详情.识别', row) != '') {
            _.http.post('/api/saier/payment_approval/zcfkxq/sb/change', {
                sb: recordset.value('正常付款详情.识别', row),
                yjch: recordset.value('产品资料.预计出货', row),
                ysqje: recordset.value('正常付款详情.已申请金额', row)
            }).then(res => {
                if (recordset.value('正常付款详情.已申请金额', row) === 0) {
                    if (res.data.seje1 != '0') {
                        recordset.val('正常付款详情.已申请金额', res.data.seje1, row);
                    }
                }
                if (res.data.sbdata == 1) {
                    recordset.val('正常付款详情.工厂编号', res.data.sbdata1.gcbh, row)
                    recordset.val('正常付款详情.厂商名称', res.data.sbdata1.gcmc1, row)
                    recordset.val('正常付款详情.来源', res.data.sb1, row);

                    if (res.data.sbdata1.fpwk === '否') {
                        recordset.val('正常付款详情.是否开票', '是', row);
                    } else {
                        recordset.val('正常付款详情.是否开票', '否', row);
                    }

                    recordset.val('正常付款详情.财务工厂', res.data.sbdata1.gcmc, row);
                    recordset.val('正常付款详情.我方公司', res.data.sbdata1.wstt, row);
                    recordset.val('正常付款详情.付款抬头', res.data.sbdata1.wstt, row);
                    recordset.val('正常付款详情.付款地区', res.data.sbdata1.fkdq, row);

                    recordset.val('正常付款详情.联系方式', res.data.sbdata1.gcdh, row);
                    recordset.val('正常付款详情.开户银行', res.data.sbdata1.bank, row);
                    recordset.val('正常付款详情.银行帐号', res.data.sbdata1.zh, row);

                    if (res.data.sbdata1.fpje > 0) {
                        recordset.val('正常付款详情.货值合计', res.data.sbdata1.fpje, row);
                        recordset.val('正常付款详情.发票金额', res.data.sbdata1.fpje, row);
                    } else {
                        recordset.val('正常付款详情.货值合计', res.data.sbdata1.yfhj, row);
                        recordset.val('正常付款详情.应付合计', res.data.sbdata1.yfhj, row);
                    }

                    recordset.val('正常付款详情.付款币种', res.data.sbdata1.fkbz, row);
                    recordset.val('正常付款详情.合同日期', res.data.sbdata1.htrq, row);
                    recordset.val('正常付款详情.已付金额', res.data.sbdata1.fkhj, row);
                    recordset.val('正常付款详情.社会统一信用代码', res.data.sbdata1.sh, row);
                    recordset.val('正常付款详情.暂扣金额', res.data.sbdata1.zkje, row);
                    recordset.val('正常付款详情.是否暂扣', res.data.sbdata1.sfzk, row);
                    console.log(res.data.sbdata1.sfzk);
                    
                    recordset.val('正常付款详情.货款类型', '正常付款', row);
                    recordset.val('正常付款详情.发票号码', res.data.sbdata1.wxfp, row);
                    recordset.val('正常付款详情.工厂发票', res.data.sbdata1.gcfp, row);
                    recordset.val('正常付款详情.中文品名', (res.data.zwpm1 || '').substring(0, 500), row);
                    recordset.val('正常付款详情.预付情况', (res.data.yfqk || '').substring(0, 1000), row);
                    recordset.val('正常付款详情.出运预付总', res.data.yffp, row);
                    recordset.val('正常付款详情.合同预付总', res.data.yfhj, row);
                    recordset.val('正常付款详情.合同提前总', res.data.tqhj, row);
                    recordset.val('正常付款详情.出运提前总', res.data.tqfp, row);

                    const total = Number(recordset.value('正常付款详情.货值合计', row) || 0);
                    const applied = Number(recordset.value('正常付款详情.已申请金额', row) || 0);
                    const paid = Number(recordset.value('正常付款详情.已付金额', row) || 0);
                    const hold = Number(recordset.value('正常付款详情.暂扣金额', row) || 0);

                    
                    let sqje = total - hold - Math.max(applied, paid);
                    console.log(sqje);
                    if (sqje < 0) {
                        sqje = 0;
                    }
                    recordset.val('正常付款详情.审请金额', sqje, row);
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })

        }
    }

    if (field.full_name == n + '.正常付款详情.暂扣金额') {
        const remainingValueForApproval = recordset.value('正常付款详情.货值合计', row) - recordset.value('正常付款详情.已申请金额', row);
        const remainingValueForPayment = recordset.value('正常付款详情.货值合计', row) - recordset.value('正常付款详情.已付金额', row);

        if (remainingValueForApproval > remainingValueForPayment) {
            recordset.val('正常付款详情.审请金额', remainingValueForPayment - recordset.value('正常付款详情.暂扣金额', row), row);
        } else {
            recordset.val('正常付款详情.审请金额', remainingValueForApproval - recordset.value('正常付款详情.暂扣金额', row), row);
        }

    }

    if (field.full_name == n + '.正常付款详情.是否暂扣') {
        if (recordset.value('正常付款详情.是否暂扣', row) === '否') {
            recordset.val('正常付款详情.暂扣金额', 0, row);
        }
    }

    if (field.full_name == n + '.正常付款详情.审请金额') {
        const maxAllowed = 0
        if (recordset.value('正常付款详情.审请金额', row) > 0) {
            const remainingValueForApproval = recordset.value('正常付款详情.货值合计', row) - recordset.value('正常付款详情.已申请金额', row);
            const remainingValueForPayment = recordset.value('正常付款详情.货值合计', row) - recordset.value('正常付款详情.已付金额', row);

            if (remainingValueForApproval > remainingValueForPayment) {
                maxAllowed = remainingValueForPayment - recordset.value('正常付款详情.暂扣金额', row);
                if (recordset.value('正常付款详情.审请金额', row) > maxAllowed) {
                    recordset.val('正常付款详情.审请金额', maxAllowed, row);
                }
            } else {
                maxAllowed = remainingValueForApproval - recordset.value('正常付款详情.暂扣金额', row);
                if (recordset.value('正常付款详情.审请金额', row) > maxAllowed) {
                    recordset.val('正常付款详情.审请金额', maxAllowed, row);
                }
            }
        }
        if (recordset.value('正常付款详情.已申请金额', row) > 0 && recordset.value('正常付款详情.审请金额', row) != maxAllowed) {
            _.ui.message.error('请注意此票已有正常付款申请')
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, payment_approval_field_change, '付款审批')

const payment_approval_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        let iz = 0
        let sb1 = ''
        let sb = ''
        let cfsb1 = 0
        let cfsb2 = 0
        let yfk = 0
        let tqfk = 0
        let zsfk = 0
        let sffp1 = 0
        let j = 0
        let j1 = 0
        let j2 = 0
        let cght = ''
        let cpbh1 = ''
        let zsl1 = ''
        let zwpm1 = ''
        let yjch = ''
        let fkfsz = ''
        let htrqz = ''
        let cgryz = ''
        let sjcy12 = ''
        let bz = ''
        let htyf1 = ''
        let father2 = ''
        let yfje = 0
        let cfsb = []
        if (recordset.val('预付合计') > 0) {
            iz = iz + 1
        }
        if (recordset.val('提前合计') > 0) {
            iz = iz + 1
        }
        if (recordset.val('正常总额') > 0) {
            iz = iz + 1
        }

        if (iz > 1) {
            _.ui.message.error('不好意思,正常付款、提前付款、预付款三者只能申请一个')
            reject('不好意思,正常付款、提前付款、预付款三者只能申请一个')
        } else {
            _.http.post('/api/saier/payment_approval/save/before/check', {
                fklx: recordset.val('付款类型'),
                fphm: recordset.val('发票号码'),
                khmc: recordset.val('客户名称'),
                fkbh: recordset.val('付款编号'),
                rtscgdh: recordset.val('RTS采购单号'),
                zgsp: recordset.val('主管审批'),
                tjzg: recordset.val('提交主管'),
                sfkp: recordset.val('是否开票'),
                xbdm: recordset.val('信保代码'),
                jbry: recordset.val('经办人员'),
                cwgc: recordset.val('财务工厂')
            }).then(res => {
                if (res.code == 1) {
                    sb1 = ''
                    if (res.data.fktt != '') {
                        recordset.val('付款抬头', res.data.fktt)
                    }
                    if (recordset.val('付款编号') == '待生成' || recordset.val('付款编号') == '') {
                        recordset.val('唯一字段', '')
                        if (res.data.fkbh1 != '') {
                            recordset.val('付款编号', res.data.fkbh1)
                        }
                        if ((recordset.val('审请金额') > 0) && (recordset.val('抹零识别') == '') && (recordset.val('财务审批', '付款类型') != '正常付款')) {
                            if (!((recordset.val('财务审批', '付款类型') == '预付款') && (recordset.val('RTS采购单号') != ''))) {
                                let fpje = Math.trunc(recordset.val('审请分配') / 10) * 10;

                                if (recordset.val('财务审批', '付款类型') == '提前付款') {
                                    recordset.val('提前合计', fpje);
                                } else {
                                    recordset.val('提前合计', 0);
                                }

                                if (recordset.val('财务审批', '付款类型') == '预付款') {
                                    recordset.val('预付合计', fpje);
                                } else {
                                    recordset.val('预付合计', 0);
                                }

                                recordset.val('审请分配', fpje);
                            }
                        }
                        if ((recordset.val('付款编号') != '') && (recordset.val('付款编号') != '待生成') &&
                            (recordset.val('提交主管') == '') && (recordset.val('经办人员') == username)) {
                            recordset.module.field_by_full_name('提交主管').disabled = false;
                            recordset.module.field_by_full_name('提交总监').disabled = false;
                            recordset.module.field_by_full_name('提交总经理').disabled = false;
                            recordset.module.field_by_full_name('提交财务').disabled = false;
                        }
                    }
                    if (res.data.cdsb == '') {
                        sb=''
                        if ((recordset.val('保存') == '否') || ((recordset.val('工厂满意度') == '不满意') && (recordset.val('原   因') == '')) ||
                            ((recordset.val('工厂满意度') == '满意') && (recordset.val('原   因') == ''))) {
                            _.ui.message.error('非法删除，或需填写不满意、不满意原因，系统不能保存!')
                            sb1 = '1'
                            reject()
                        } else {
                            if (recordset.val('提交主管') === username || recordset.val('提交总监') === username ||
                                recordset.val('提交总经理') === username || recordset.val('提交财务') === username) {
                                if (recordset.val('提交主管') === username && recordset.val('主管审批') !== '待审批' && recordset.val('总监审批') === '待审批') {
                                    recordset.val('经理识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                                }
                                else if (recordset.val('提交总监') === username && recordset.val('总监审批') !== '待审批' && recordset.val('总经理审批') === '待审批') {
                                    recordset.val('总监识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                                }
                                else if (recordset.val('提交总经理') === username && recordset.val('总经理审批') !== '待审批' && recordset.val('财务审批') === '待审批') {
                                    recordset.val('总经理识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                                }
                                else if (recordset.val('提交财务') === username && recordset.val('财务审批') !== '待审批') {
                                    recordset.val('财务识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                                }
                            }
                            recordset.val('修改人员', username);
                            recordset.val('web判断', '是');
                            if (recordset.val('提交财务') != username && recordset.val('财务人员') != '是') {
                                if (recordset.val('唯一字段') == '' && recordset.val('付款编号') != '待生成' && recordset.val('付款编号') != '') {
                                    recordset.val('唯一字段', 'fksp' + recordset.val('付款编号') + username + new Date().format('yyyy-MM-dd hh:mm:ss'))
                                }
                                if (recordset.val('财务工厂') != '') {
                                    if (res.data.cwgcdata == 1) {
                                        if ((recordset.val('开户银行') != res.data.bank) || (recordset.val('银行帐号') != res.data.zh)) {
                                            recordset.val('原银行信息', res.data.bank + ';' + res.data.zh)
                                        } else {
                                            recordset.val('原银行信息', '')
                                        }
                                    }
                                } else {
                                    recordset.val('原银行信息', '')
                                }
                            }
                            if (recordset.val('审请分配') !== recordset.val('审请金额') &&
                                (Math.abs(recordset.val('审请分配') - recordset.val('审请金额')) > 9) &&
                                (recordset.val('经办人员') === username)) {
                                _.ui.message.error('请注意总审请金额和付款分配金额不一致，系统不能保存!')
                                sb = '1'
                                reject('')
                            }
                            if (recordset.val('RTS采购单号').indexOf('RTS') >= 0 ||
                                recordset.val('外销合同').indexOf('RTS') >= 0 ||
                                recordset.val('发票号码').indexOf('RTS') >= 0) {
                                recordset.val('rts识别', '是');
                            } else {
                                recordset.val('rts识别', '否');
                            }
                            if (sb != '1') {
                                if (recordset.val('RMB客户') == '是') {
                                    if (recordset.val('客户RMB总价') > 0) {
                                        const ratio = (recordset.val('货值合计') / recordset.val('客户RMB总价'));
                                        recordset.val('比  值1', Math.round(ratio * 1000) / 1000);
                                    }
                                } else {
                                    if (recordset.val('外销总价') > 0) {
                                        const ratio = (recordset.val('货值合计') / recordset.val('外销总价'));
                                        recordset.val('比  值1', Math.round(ratio * 1000) / 1000);
                                    }
                                }
                                let fpjez = 0
                                let cghtjez = 0
                                let cgzsl = 0
                                let htrqM = ''
                                let htyfc = []
                                let htyf = []
                                let yfhjz = 0
                                let yfjezz = 0

                                let fktt = []
                                let ts = []
                                if (recordset.val('付款类型') == '提前付款') {
                                    let cp_data = recordset.tables['产品资料'].view_data;
                                    let cp_table = recordset.tables['产品资料']
                                    for (let row of cp_data) {
                                        if (row.fkwy == '') {
                                            if (recordset.val('提交主管') != '') {
                                                row.fkwy = row.hsfp + '-' + recordset.val('采购合同') + username + new Date().format('yyyy-MM-dd hh:mm:ss');
                                            }
                                            row.seje4 = row.seje
                                        }
                                        if (row.fktt == '') {
                                            row.fktt = recordset.val('付款抬头')
                                        }
                                        if (recordset.val('是否开票') == '否') {
                                            row.fktt = recordset.val('付款抬头')
                                            row.fkrq = recordset.val('付款日期')
                                        }
                                        fpjez = fpjez + row.seje
                                        if (htrqM == '') {
                                            htrqM = row.htrq
                                        }
                                        if (row.htrq != '' && row.htrq > htrqM) {
                                            htrqM = row.htrq
                                        }
                                        row.fkbh = recordset.val('付款编号')
                                        row.sfkp = recordset.val('是否开票')
                                        row.fkxs = recordset.val('付款形式')
                                        row.ywbm = recordset.val('业务部门')
                                        row.fklx = recordset.val('付款类型')
                                        row.cwsp = recordset.val('财务审批')
                                        if (recordset.val('审批日期1') != '') {
                                            if (recordset.val('审请付款日期') != '' && recordset.val('审请付款日期') > recordset.val('审批日期1') && recordset.val('财务审批') == '通过') {
                                                row.pzrq = recordset.val('审请付款日期')
                                            } else {
                                                row.pzrq = recordset.val('审批日期1')
                                            }
                                        }
                                        if (row.seje > 0) {
                                            if (cghtjez == '') {
                                                sjcy12 = row.sjcy
                                                zwpm1 = row.zwpm
                                                bz = row.cpbh + '比值:' + row.bz
                                                fkfsz = row.jsfs
                                                htrqz = row.htrq
                                                cgryz = row.cgry
                                                if (row.bhsfp != '') {
                                                    cght = cght + '(补报发票号' + row.bhsfp + ')';
                                                    cghtjez = row.hsfp + '(补报发票号' + row.bhsfp + ')' + '产品编号:' + row.cpbh + '金额:' + row.zje;
                                                    cgzsl = row.hsfp + '(补报发票号' + row.bhsfp + ')' + '产品编号:' + row.cpbh + '数量:' + row.zsl + ' ' + row.dw;
                                                } else {
                                                    cght = row.hsfp
                                                    cghtjez = row.hsfp + '产品编号:' + row.cpbh + '金额:' + row.zje;
                                                    cgzsl = row.hsfp + '产品编号:' + row.cpbh + '数量:' + row.zsl + ' ' + row.dw;

                                                }
                                            } else {
                                                sjcy12 += '\n' + row.sjcy
                                                zwpm1 += '\n' + row.zwpm
                                                bz += '\n' + row.cpbh + '比值:' + row.bz
                                                fkfsz += '\n' + row.jsfs
                                                htrqz += '\n' + row.htrq
                                                cgryz += '\n' + row.cgry
                                                if (row.bhsfp != '') {
                                                    cght += '\n' + cght + '(补报发票号' + row.bhsfp + ')';
                                                    cghtjez += '\n' + row.hsfp + '(补报发票号' + row.bhsfp + ')' + '产品编号:' + row.cpbh + '金额:' + row.zje;
                                                    cgzsl += '\n' + row.hsfp + '(补报发票号' + row.bhsfp + ')' + '产品编号:' + row.cpbh + '数量:' + row.zsl + ' ' + row.dw;
                                                } else {
                                                    cght += '\n' + row.hsfp
                                                    cghtjez += '\n' + row.hsfp + '产品编号:' + row.cpbh + '金额:' + row.zje;
                                                    cgzsl += '\n' + row.hsfp + '产品编号:' + row.cpbh + '数量:' + row.zsl + ' ' + row.dw;
                                                }
                                            }
                                        }
                                        j = fktt.indexOf(row.fktt)
                                        if (j < 0) {
                                            fktt.push(row.fktt)
                                            ts.push(1)
                                        } else {
                                            ts[j] = Number(ts[j]) + 1
                                        }

                                        if (row.cywyzd != '') {
                                            cfsb2 = cfsb.indexOf(row.cywyzd)
                                            if (cfsb2 < 0) {
                                                cfsb.push(row.cywyzd);
                                            } else {
                                                cfsb1 = cfsb1 + 1
                                            }
                                        }

                                        if (row.htyf > 0) {
                                            j2 = htyfc.indexOf(row.hthm);
                                            if (j2 < 0) {
                                                htyfc.push(row.hthm);
                                                htyf.push(row.hthm + '预付金额:' + row.htyf + '此票分配:' + row.yfje);
                                                yfhjz += row.htyf;
                                                yfjezz += row.yfje;
                                            }
                                        }
                                        row.cwgc = recordset.val('财务工厂')
                                        cp_table.push_modi_rid(row.rid)
                                    }
                                    cp_table.sync_operate_data()
                                    cp_table.modified = true;


                                }

                                htyf1 = '';
                                for (let i = 0; i < htyf.length; i++) {
                                    htyf1 = htyf1 === '' ? htyf[i] : htyf1 + '\n' + htyf[i];
                                }
                                if (htyf1 !== '') {
                                    htyf1 += '\n预付合计:' + yfhjz + '已分配金额合计:' + yfjezz;
                                }

                                recordset.val('合同预付', htyf1);

                                if (recordset.val('预付金额') > 0 || htyf1 !== '') {
                                    recordset.val('有无预付', '有');
                                } else {
                                    recordset.val('有无预付', '无');
                                }

                                if (recordset.val('付款类型') == '预付款') {
                                    let fkfp_data = recordset.tables['付款分配'].view_data;
                                    let fkfp_table = recordset.tables['付款分配']
                                    for (let row of fkfp_data) {
                                        yfk = yfk + 1
                                        if (row.hthm != '') {
                                            cfsb2 = cfsb.indexOf(row.hthm)
                                            if (cfsb2 < 0) {
                                                cfsb.push(row.hthm);
                                            } else {
                                                cfsb1 = cfsb1 + 1
                                            }
                                        }
                                        row.fkbh = recordset.val('付款编号')
                                        row.rtssb = recordset.val('rts识别')
                                        row.fktt = recordset.val('付款日期')

                                        if (htrqM == '') {
                                            htrqM = row.htrq
                                        }
                                        if (row.htrq != '' && row.htrq > htrqM) {
                                            htrqM = row.htrq
                                        }

                                        if (row.seje > 0) {
                                            if (cght == '') {
                                                cght = row.hthm
                                                cpbh1 = row.cpbh
                                                zsl1 = row.zsl
                                                zwpm1 = row.zwpm
                                                yjch = row.yjch
                                                fkfsz = row.jsfs
                                                htrqz = row.htrq
                                                cgryz = row.cgry
                                            } else {
                                                fkfsz += '\n' + row.jsfs
                                                htrqz += '\n' + row.htrq
                                                cgryz += '\n' + row.cgry
                                                cght += '\n' + row.hthm
                                                cpbh1 += '\n' + row.cpbh
                                                zsl1 += '\n' + row.zsl
                                                zwpm1 += '\n' + row.zwpm
                                                yjch += '\n' + row.yjch
                                            }
                                        }

                                        j = fktt.indexOf(row.fktt)
                                        if (j < 0) {
                                            fktt.push(row.fktt)
                                            ts.push(1)
                                        } else {
                                            ts[j] = Number(ts[j]) + 1
                                        }

                                        fkfp_table.push_modi_rid(row.rid)
                                    }
                                    fkfp_table.sync_operate_data()
                                    fkfp_table.modified = true;

                                }

                                if (recordset.val('付款类型') == '正常付款') {
                                    let zcfk_data = recordset.tables['正常付款详情'].view_data;
                                    let zcfk_table = recordset.tables['正常付款详情']
                                    for (let row of zcfk_data) {
                                        if (row.sb != '') {
                                            cfsb2 = cfsb.indexOf(row.sb)
                                            if (cfsb2 < 0) {
                                                cfsb.push(row.sb);
                                            } else {
                                                cfsb1 = cfsb1 + 1
                                            }
                                        }
                                        row.fkbh = recordset.val('付款编号')
                                        row.rtssb = recordset.val('rts识别')
                                        row.PurchaseOrderNo = recordset.val('RTS采购单号')

                                        if (recordset.val('是否开票') == '否') {
                                            row.fktt = recordset.val('付款抬头')
                                        }
                                        zsfk = zsfk + 1

                                        if (zwpm1 == '') {
                                            zwpm1 = row.zwpm
                                        } else {
                                            zwpm1 += '\n' + row.zwpm
                                        }

                                        j = fktt.indexOf(row.fktt)
                                        if (j < 0) {
                                            fktt.push(row.fktt)
                                            ts.push(1)
                                        } else {
                                            ts[j] = Number(ts[j]) + 1
                                        }

                                        zcfk_table.push_modi_rid(row.rid)
                                    }
                                    zcfk_table.sync_operate_data()
                                    zcfk_table.modified = true;
                                }

                                let tt_table = recordset.tables['抬头']
                                let y = []
                                tt_table.clear()
                                for (let j = 0; j < fktt.length - 1; j++) {
                                    let r = {}
                                    r.rid = _.utils.guid()
                                    r.pid = recordset.val('rid')
                                    r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                                    r.uid = _.user.rid
                                    r.fktt = fktt[j]
                                    r.ts = Number(ts[j])
                                    let tqfp = []
                                    let tqfps = 0
                                    let cp_data = recordset.tables['产品资料'].view_data;
                                    for (let row of cp_data) {
                                        if (r.fktt == row.fktt) {
                                            j1 = tqfp.indexOf(row.hsfp)
                                            if (j1 < 0) {
                                                tqfp.push(row.hsfp)
                                                tqfps = tqfps + 1
                                            }
                                        }
                                    }
                                    r.tqfps = tqfps
                                    y.push(r)
                                    tt_table.push_new_rid(r.rid)
                                }
                                tt_table.data = y
                                tt_table.sync_operate_data()
                                tt_table.modified = true

                                recordset.val('合同日期', htrqM)

                                if (recordset.val('财务审批') == '通过' && recordset.val('经办人员') == username) {
                                    let yffp_data = recordset.tables['预付分配'].view_data;
                                    let yffp_table = recordset.tables['预付分配']
                                    for (let row of yffp_data) {
                                        recordset.val('web判断', '是');
                                        sffp1 = sffp1 + 1;
                                        row.bcsb = '是'
                                        if (row.fksb == '') {
                                            if (row.yfje > 0) {
                                                row.fksb = row.wxfp + '-' + row.hthm + username + new Date().format('yyyy-MM-dd hh:mm:ss');
                                            }
                                        }
                                        row.yfje1 = row.yfje
                                        yfje = yfje + row.yfje + row.qyfje
                                        father2 = ''
                                        yffp_table.push_modi_rid(row.rid)
                                    }
                                    yffp_table.sync_operate_data()
                                    yffp_table.modified = true;
                                }

                                if (cfsb1 > 0) {
                                    _.ui.message.error('请注意存在重复审请记录，系统不能保存!')
                                    sb = '1'
                                    reject()
                                }
                                if (recordset.val('付款类型') == '正常付款') {
                                    if (yfk > 0 || tqfk > 0) {
                                        _.ui.message.error('请注意存在预付款或提前付款记录，系统不能保存!')
                                        sb = '1'
                                        reject()
                                    }
                                }
                                if (recordset.val('付款类型') == '预付款') {
                                    if (zsfk > 0 || tqfk > 0) {
                                        _.ui.message.error('请注意存在正常付款或提前付款记录，系统不能保存!')
                                        sb = '1'
                                        reject()
                                    }
                                }
                                if (recordset.val('付款类型') == '提前付款') {
                                    if (yfk > 0 || zsfk > 0) {
                                        _.ui.message.error('请注意存在正常付款或预付款记录，系统不能保存!')
                                        sb = '1'
                                        reject()
                                    }
                                }
                                recordset.val('结算方式总', fkfsz)
                                recordset.val('合同日期总', htrqz)
                                recordset.val('产品编号', cpbh1)

                                if (zwpm1 != '') {
                                    recordset.val('产品名称', zwpm1)
                                }

                                recordset.val('总数量', zsl1);
                                recordset.val('预计出货', yjch);
                                recordset.val('比  值', bz);
                                recordset.val('采购合同总', cght);
                                recordset.val('采购人员总', cgryz);
                                recordset.val('采购合同金额总', cghtjez);
                                recordset.val('采购总数量', cgzsl);
                                recordset.val('实际出运', sjcy12);

                                if (recordset.val('审请金额') > 0) {
                                    if (recordset.val('付款类型') === '预付款') {
                                        if (recordset.val('审请金额') === recordset.val('预付分配总')) {
                                            recordset.val('是否分配', '是');
                                        } else {
                                            recordset.val('是否分配', '否');
                                        }
                                    } else {
                                        if (recordset.val('审请金额') === recordset.val('提前合计')) {
                                            recordset.val('是否分配', '是');
                                        } else {
                                            recordset.val('是否分配', '否');
                                        }
                                    }
                                } else {
                                    recordset.val('是否分配', '否');
                                }
                                if (recordset.val('是否开票') === '否' && recordset.val('信保代码') !== '' && recordset.val('经办人员') === username) {
                                    const msgdata = res.data && res.data.msgdata
                                    if (msgdata == 1) {
                                        _.ui.message.warning('请注意此客人为信保客人\n有报关率要求:' + recordset.val('报关率要求'))
                                    }
                                }
                                if (htyf1 !== '') {
                                    _.ui.message.warning(htyf1);
                                }

                            }

                        }
                        resolve()

                    } else {
                        _.ui.message.error('不好意思,业务撤单，不能保存!')
                        reject()
                    }
                    _.http.post('/api/saier/payment_approval/save/before', {
                        rid: recordset.val('rid'),
                        fklx: recordset.val('付款类型'),
                        hzhj: recordset.val('货值合计'),
                        fkbh: recordset.val('付款编号'),
                        tjzg: recordset.val('提交主管'),
                        tjzj: recordset.val('提交总监'),
                        tjzjl: recordset.val('提交总经理'),
                        tjcw: recordset.val('提交财务'),
                        jbry: recordset.val('经办人员'),
                        jlsb: recordset.val('经理识别'),
                        zjsb: recordset.val('总监识别'),
                        zjlsb: recordset.val('总经理识别'),
                        cwsb: recordset.val('财务识别'),
                        zgsp: recordset.val('主管审批'),
                        spyj: recordset.val('审批意见'),
                        zjsp: recordset.val('总监审批'),
                        zjyj: recordset.val('总监意见'),
                        zjlsp: recordset.val('总经理审批'),
                        zjlyj: recordset.val('总经理意见'),
                        cwsp: recordset.val('财务审批'),
                        cwyj: recordset.val('财务意见'),
                        sqje: recordset.val('审请金额'),
                        yw: recordset.val('业务'),
                        sfkp : recordset.val('是否开票'),
                        khmc: recordset.val('客户名称'),
                        fphm: recordset.val('发票号码'),
                        cwsprq: recordset.val('审批日期1')
                    }).then(res => {
                        if (res.code == 1){
                            resolve()
                        }

                    }).catch(err => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                        reject(err.msg)
                    })
                } else {
                    _.ui.message.error(res.msg)
                    reject(res.msg)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                reject(err.msg)
            })


        }
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, payment_approval_before_save, '付款审批')

const payment_approval_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = []
        btns.push({
            "name": 'batch_import_paied_btn',
            "caption": '批量引付款信息',
            "icon": 'any-server-update',
        })
        btns.push({
            "name": 'batch_import_billed_btn',
            "caption": '批量引已开票信息',
            "icon": 'any-copy',
        })
        btns.push({
            "name": 'batch_open_record_btn',
            "caption": '批量打开采购付款',
            "icon": 'any-copy',
        })
        form.toolbar.add([{
            "name": 'audit_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
    if (form.group.value.name == '付款分配') {
        let btns = []
        btns.push({
            "name": 'batch_yffp_btn',
            "caption": '批量预付分配',
            "icon": 'any-server-update',
        });
        
        form.toolbar.add([{
            "name": 'detail_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
        console.log('费用详情显示 a');
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], payment_approval_EditorChildShow, '付款审批')


// 界面加载添加按钮
const payment_approval_formShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            name: 'payment_approval_sxtj_btn',
            caption: '刷新提交',
            icon: 'any-keyborad'
        })
        btns.push({
            name: 'payment_approval_fksbm_btn',
            caption: '付款刷部门',
            icon: 'any-keyborad'
        })
        btns.push({
            name: 'payment_approval_cwtssp_btn',
            caption: '财务特殊审批',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_approval_cxscfkbh_btn',
            caption: '重新生成付款编号',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_approval_sxcwjsq_btn',
            caption: '刷新财务结算期',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_approval_gxyfhk_btn',
            caption: '更新预付货款',
            icon: 'any-keyborad'
        });
    } else {
        btns.push({
            name: 'payment_approval_scyfhk_btn',
            caption: '生成预付货款',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_approval_cwplsp_btn',
            caption: '财务批量审批',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_approval_cxsp_btn',
            caption: '撤销审批',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_statistics_export_btn',
            caption: '付款统计表',
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], payment_approval_formShow, '付款审批');


const payment_approval_form_BtnClick = async (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset

    if (form.is_editor && btn.name == 'module_unlock_btn') {
        _.http.post('/api/saier/module/unlock', {
            rid: form.current_rid.value,
            module: form.module.name
        }).then(res => {
            _.ui.message.success('解锁成功');
            _.platform.active.reload_data();
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'payment_approval_scyfhk_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }

        _.http.post('/api/saier/payment_approval/button/scyfhk', {
            rid: form.current_rid.value
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
                if (res.data != '') {
                    _.platform.open_record('预付货款', res.data)
                }
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }

    if (btn.name == 'payment_approval_cwtssp_btn') {
        if (recordset.val('提交财务') === username && recordset.val('财务审批') === '待审批') {
            _.http.post('/api/saier/payment_approval/button/cwtssp', {
                khmc: recordset.val('客户名称'),
                fphm: recordset.val('发票号码'),
                tjcw: recordset.val('我方公司'),
                wfgs: recordset.val('提交财务')
            }).then(res => {
                if (res.code == 1) {
                    _.ui.message.success(res.msg)
                    if (res.data.cwtsspdata == 1) {
                        recordset.val('提交财务', res.data.cwzj)
                    }
                } else {
                    _.ui.message.error(res.msg);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })

        }

    }
    if (btn.name == 'payment_approval_fksbm_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }

        _.http.post('/api/saier/payment_approval/button/fksbm', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }
    if (btn.name == 'payment_approval_cwplsp_btn') {

        _.http.post('/api/saier/payment_approval/button/cwplsp', {
            rid: form.current_rid.value,
            rids: form.current_rids.value,
            da2:'1'
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
        })
    }
    
    if (btn.name == 'payment_approval_cxsp_btn') {
        _.http.post('/api/saier/payment_approval/button/cxsp', {
            rid: form.current_rid.value
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }
    if (btn.name == 'payment_approval_sxtj_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }

        _.http.post('/api/saier/payment_approval/button/sxtj', {
            rid: recordset.val('rid'),
            tjzg: recordset.val('提交主管'),
            tjzz: recordset.val('提交总监'),
            tjzjl: recordset.val('提交总经理'),
            tjcw: recordset.val('提交财务'),
            zgsp: recordset.val('主管审批'),
            zjsp: recordset.val('总监审批'),
            zjlsp: recordset.val('总经理审批'),
            cwsp: recordset.val('财务审批'),
            fklx: recordset.val('付款类型'),
            fkbh: recordset.val('付款编号')
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
                _.platform.active.reload_data();
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }

    if (btn.name == 'payment_approval_cxscfkbh_btn') {
        if (recordset.val('经办人员') == username || username == 'zjnblh') {
            _.http.post('/api/saier/payment_approval/button/cxscfkbh', {
                fkbh: recordset.val('付款编号'),
                rtscgdh: recordset.val('RTS采购单号')
            }).then(res => {
                if (res.code == 1) {
                    _.ui.message.success(res.msg)
                    recordset.val('付款编号',res.data)
                } else {
                    _.ui.message.error(res.msg);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })

        }
    }

    if (btn.name == 'payment_approval_sxcwjsq_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }

        _.http.post('/api/saier/payment_approval/button/sxcwjsq', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    if (btn.name == 'payment_approval_gxyfhk_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }

        _.http.post('/api/saier/payment_approval/button/gxyfhk', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
                if (res.data != '') {
                    _.platform.open_record('预付货款', res.data)
                }
            } else {
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    if (btn.name == 'batch_import_paied_btn') {
        if (form.is_editor === true && recordset.modified === true) {
            _.ui.message.error('请先保存数据后操作');
            return;
        }

        if (
            recordset.val('经办人员') !== _.user.username ||
            recordset.val('提交主管') !== '' ||
            recordset.val('发票号码') === ''
        ) {
            _.ui.message.error('仅限经办人员且未提交主管且有发票号码时操作');
            return;
        }

        const input = await _.ui.show_input_dialog('输1按外销发票引，输2为所有，默认所有', '');
        if (input === null || input === undefined) {
            return;
        }
        const djws = input === '1' ? '1' : '2';

        // Pascal 默认合同起始/结束
        const qsrq = recordset.val('合同起始') || '2011-01-01';
        const jsrq = recordset.val('合同结束') || new Date().format('yyyy-MM-dd');

        _.ui.message.info('正在更新数据...');

        _.http.post('/api/saier/payment_approval/product/batch_import/paid', {
            rid: recordset.val('rid'),
            djws: djws,
            cwjsqz: recordset.val('正常日期'),
            qsrq: qsrq,
            jsrq: jsrq,
            cpbh1: recordset.val('查询编号'),
            fpje: recordset.val('审请金额'),
            csmc: recordset.val('厂商名称'),
            gcbh: recordset.val('工厂编号'),
            wxfp: recordset.val('发票号码'),
            khmc: recordset.val('客户名称'),
            cwgc: recordset.val('财务工厂'),
            wstt: recordset.val('付款抬头'),
            jsrm: recordset.val('经办人员'),
            sfkp: recordset.val('是否开票'),
            fklx: recordset.val('付款类型'),
            zkds: recordset.val('付款分配.折扣点数'),
            ywbm: recordset.val('业务部门')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg);
                return;
            }

            const new_data = res.data && res.data.rows ? res.data.rows : [];
            for (let r of new_data) {
                let t = recordset.tables['产品资料'];
                t.append().then(new_row => {
                    let r = t.view_data[t.view_data.length - 1]
                    recordset.val('产品资料.多笔审请', r.duobishenqing,r);
                    recordset.val('产品资料.到票明细', r.daopiaomingxi,r);
                    recordset.val('产品资料.补报发票号', r.bbfph,r);
                    recordset.val('产品资料.补报业务发票', r.bbfywfp,r);

                    recordset.val('产品资料.外销发票', r.ysfp,r);
                    recordset.val('产品资料.业务发票', r.ywfp,r);
                    recordset.val('产品资料.外销合同', r.wxht,r);
                    recordset.val('产品资料.采购合同', r.cght,r);
                    recordset.val('产品资料.厂商名称', r.gcmc,r);
                    recordset.val('产品资料.交货日期', r.jhrq,r);
                    recordset.val('产品资料.专业货号', r.zycpbh,r);
                    recordset.val('产品资料.开票工厂', r.kpgc,r);
                    recordset.val('产品资料.历史审请', r.ysqje,r);
                    recordset.val('产品资料.预付金额', r.yfje,r);
                    recordset.val('产品资料.历史批准金额', r.lspzje,r);

                    recordset.val('产品资料.诚信识别', r.cxsb,r);
                    recordset.val('产品资料.合同预付', r.htyf,r);

                    recordset.val('产品资料.进仓日期', r.scrq,r);
                    recordset.val('产品资料.实际出运', r.sjcy,r);
                    recordset.val('产品资料.预计出货', r.chyrq,r);
                    recordset.val('产品资料.财务出运日期', r.cwcy,r);
                    recordset.val('产品资料.退税率', r.tsl,r);
                    recordset.val('产品资料.产品编号', r.cpbh,r);
                    recordset.val('产品资料.总 金 额', r.gczj,r);
                    recordset.val('产品资料.中文品名', r.zwpm,r);
                    recordset.val('产品资料.单  价', r.gcjg,r);
                    recordset.val('产品资料.单  位', r.jldw,r);
                    recordset.val('产品资料.包  装', r.bzdw,r);
                    recordset.val('产品资料.箱  数', r.chxs,r);
                    recordset.val('产品资料.总数量', r.chsl,r);
                    recordset.val('产品资料.外销单价', r.wxjg,r);
                    recordset.val('产品资料.客户RMB单价', r.mjdj1,r);
                    recordset.val('产品资料.外销总价', r.wxzj,r);
                    recordset.val('产品资料.业务人员', r.ywry,r);
                    recordset.val('产品资料.采购人员', r.ywrya,r);
                    recordset.val('产品资料.跟单人员', r.gdry,r);
                    recordset.val('产品资料.合同日期', r.htrq,r);
                    recordset.val('产品资料.付款抬头', r.fktt,r);

                    recordset.val('产品资料.是否含税', r.sfhs,r);
                    recordset.val('产品资料.跟单部门', r.gdbm,r);
                    recordset.val('产品资料.RMB客户', r.rmbkh,r);
                    recordset.val('产品资料.外销部门', r.wxbm,r);
                    recordset.val('产品资料.采购部门', r.cgbm,r);
                    recordset.val('产品资料.外销唯一字段', r.wxwyzd,r);
                    recordset.val('产品资料.客户RMB总价', r.mjzj,r);
                    recordset.val('产品资料.比  值', r.bz,r);

                    recordset.val('产品资料.折扣费用', r.zkfy,r);
                    recordset.val('产品资料.付款类型', r.fklx,r);
                    recordset.val('产品资料.付款形式', r.fkxs,r);
                    recordset.val('产品资料.业务部门', r.ywbm,r);
                    recordset.val('产品资料.分配金额', r.fpje,r);
                    recordset.val('产品资料.审请金额', r.sqje,r);
                    recordset.val('产品资料.已申请金额', r.ysqje1,r);
                    recordset.val('产品资料.结算方式', r.jsfs,r);
                    recordset.val('产品资料.出运唯一字段', r.cywyzd,r);
                });
            }

            if (recordset.val('报关抬头') === '' && res.data.bgtt) {
                recordset.val('报关抬头', res.data.bgtt);
            }
            _.ui.message.success('批量引付款信息完成');
        }).catch(e => {
            _.ui.message.error(e.msg);
            console.log(e);
        });
    }
    
    if (btn.name == 'payment_statistics_export_btn') {
        const da1 = await _.ui.show_input_dialog('请输入付款起始日期，格式 2010-01-18')
        if (da1 == null || da1 === undefined) {
            return
        }

        const da2 = await _.ui.show_input_dialog('请输入付款结束日期，格式 2010-01-18')
        if (da2 == null || da2 === undefined) {
            return
        }

        const da3 = await _.ui.show_input_dialog('1经办人,2外销,3采购,4采购人员（默认1）')
        if (da3 == null || da3 === undefined) {
            return
        }

        await _.http.post('/api/saier/payment_approval/statistics/export', {
            da1: da1,
            da2: da2,
            da3: da3 || '1',
            sync_data: true,
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg)
                return
            }
            const d = res.data
            if (d && d !== '') {
                _.http.download('/api/tmp/file/get', { file: d }, d)
            }
            _.ui.message.success(res.msg)
        }).catch(err => {
            _.ui.message.error(err.msg || String(err))
            console.log(err)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], payment_approval_form_BtnClick, '付款审批')