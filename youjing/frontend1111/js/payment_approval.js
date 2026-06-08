
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
    recordset.module.field_by_full_name('1审批日期.').disabled = true;
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
                _.ui.message.warn('请注意此客人为信保客人' + '\r\n' + '有报关率要求:' + recordset.val('报关率要求'))
            }
            if (data.wfgsdata == 1) {
                recordset.val('我方公司', data.wfgs2)
                recordset.val('业务部门', data.bm)
            }
            if (data.cxsbdata == 1) {
                recordset.val('诚信识别', '已提供')
            }
            if (data.zsrq != '') {
                recordset.val('正常日期', trim(data.zsrq))
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
                        recordset.module.field_by_full_name('1审批日期.').disabled = false;
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
        old_value
    } = opts;
    let n = module.name
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
                    recordset.module.field_by_full_name('主管审批').enabled = false;
                    recordset.module.field_by_full_name('审批日期').enabled = false;
                    recordset.module.field_by_full_name('审批意见').enabled = false;

                } else {
                    if (recordset.val('主管审批') == '通过') {
                        if (recordset.val('提交总监') == username) {
                            recordset.val('总监审批', '通过');
                        }

                        recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.module.field_by_full_name('提交总监').enabled = true;
                        recordset.module.field_by_full_name('主管审批').enabled = false;
                        recordset.module.field_by_full_name('审批日期').enabled = false;
                        recordset.module.field_by_full_name('审批意见').enabled = false;

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

                    recordset.val('1审批日期.', new Date().format('yyyy-MM-dd'));
                    recordset.val('提交总经理', '');
                    recordset.val('总经理审批', '待审批');
                    recordset.module.field_by_full_name('总经理审批').enabled = false;
                    recordset.module.field_by_full_name('1审批日期.').enabled = false;
                    recordset.module.field_by_full_name('总经理意见').enabled = false;
                    recordset.module.field_by_full_name('总监审批').enabled = false;
                    recordset.module.field_by_full_name('1审批日期').enabled = false;
                    recordset.module.field_by_full_name('总监意见').enabled = false;
                    recordset.module.field_by_full_name('主管审批').enabled = false;
                    recordset.module.field_by_full_name('审批日期').enabled = false;
                    recordset.module.field_by_full_name('审批意见').enabled = false;

                } else {
                    if (recordset.val('总经理审批') == '通过') {
                        if (recordset.val('提交总经理') == username) {
                            recordset.val('1审批日期.', new Date().format('yyyy-MM-dd'));
                        }
                        recordset.module.field_by_full_name('提交财务').enabled = true;
                        recordset.module.field_by_full_name('总经理审批').enabled = false;
                        recordset.module.field_by_full_name('1审批日期.').enabled = false;
                        recordset.module.field_by_full_name('总经理意见').enabled = false;
                        recordset.module.field_by_full_name('总监审批').enabled = false;
                        recordset.module.field_by_full_name('1审批日期').enabled = false;
                        recordset.module.field_by_full_name('总监意见').enabled = false;
                        recordset.module.field_by_full_name('主管审批').enabled = false;
                        recordset.module.field_by_full_name('审批日期').enabled = false;
                        recordset.module.field_by_full_name('审批意见').enabled = false;

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
        if (recordset.val('付款分配.采购合同') != '') {
            _.http.post('/api/saier/payment_approval/fkfp/sqje/change', {
                cght: recordset.val('付款分配.采购合同'),
                fkbh: recordset.val('付款分配.付款编号')
            }).then(res => {
                if (res.data.yfhj > 0) {
                    recordset.val('付款分配.历史预付', res.data.yfhj)
                } else {
                    recordset.val('付款分配.历史预付', 0)
                }
                if (res.data.seje1 > 0) {
                    recordset.val('付款分配.历史审请', res.data.seje1 + res.data.yfhj)
                    recordset.val('付款分配.历史折扣', res.data.lszk1)
                } else {
                    recordset.val('付款分配.历史审请', 0 + res.data.yfhj)
                    recordset.val('付款分配.历史折扣', 0)
                }
                const totalAvailable = recordset.val('付款分配.总 金 额') - recordset.val('付款分配.历史审请') -
                    recordset.val('付款分配.历史折扣') - recordset.val('付款分配.优惠金额');

                if ((totalAvailable - recordset.val('付款分配.审请金额')) < -0.1) {
                    _.ui.message.error('请注意审请金额合计大于总的出货金额!')
                    recordset.val('付款分配.审请金额', 0);
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })

        } else {
            const totalAvailable = recordset.val('付款分配.总 金 额') - recordset.val('付款分配.历史审请') -
                recordset.val('付款分配.历史折扣') - recordset.val('付款分配.优惠金额');

            if ((totalAvailable - recordset.val('付款分配.审请金额')) < -0.1) {
                _.ui.message.error('请注意审请金额合计大于总的出货金额!')
                recordset.val('付款分配.审请金额', 0);
            }
        }
    }

    if (field.full_name == n + '.付款分配.审请金额' || field.full_name == n + '.付款分配.进仓日期' || field.full_name == n + '.付款分配.折扣点数' || field.full_name == n + '.付款分配.分配完成') {
        if (recordset.val('付款分配.唯一字段') != '') {
            if (
                recordset.val('付款分配.审请金额1') !== recordset.val('付款分配.审请金额') ||
                recordset.val('付款分配.折扣点数1') !== recordset.val('付款分配.折扣点数')
            ) {
                _.ui.message.error('请注意数据锁定不能修改!')
                recordset.val('付款分配.审请金额', recordset.val('付款分配.审请金额1'));
                recordset.val('付款分配.折扣点数', recordset.val('付款分配.折扣点数1'));
                recordset.val('付款分配.折扣费用', recordset.val('付款分配.折扣费用1'));
            }
        }
    }

    if (field.full_name == n + '.付款分配.采购合同') {
        if (recordset.val('付款分配.采购合同') != '') {
            if (recordset.val('付款抬头') == '') {
                _.ui.message.error('不好意思,请先输入付款抬头,谢谢!')
                recordset.val('付款分配.采购合同', '')
            } else {
                _.http.post('/api/saier/payment_approval/fkfp/cght/change', {
                    cght: recordset.val('付款分配.采购合同'),
                    fktt: recordset.val('付款抬头')
                }).then(res => {
                    if (res.data.ttsb12 != '' && res.data.ttsb12 != recordset.val('付款抬头')) {
                        _.ui.message.error('不好意思,此采购合同已有付款抬头为' + res.data.ttsb12 + '请更改,谢谢!')
                        recordset.val('付款分配.采购合同', '')
                    } else {
                        if (res.data.ttsb == '1') {
                            _.ui.message.error('不好意思,此采购合同已有付款抬头为' + res.data.fktt1 + '请更改,谢谢!')
                            recordset.val('付款分配.采购合同', '')
                        } else {
                            if (recordset.val('付款分配.采购合同') != '') {
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
                                    recordset.val('付款分配.交货日期', res.data.rtspdata1.DeliveryDate)
                                    recordset.val('付款分配.我方公司', res.data.rtspdata1.OurCompany)
                                    recordset.val('付款分配.采购人员', res.data.rtspdata1.Purchaser)
                                    recordset.val('付款分配.总 金 额', res.data.rtspdata1.TotalPurchaseAmount)
                                    recordset.val('付款分配.跟单人员', res.data.rtspdata1.Purchaser)
                                    recordset.val('付款分配.合同日期', res.data.rtspdata1.OrderDate)
                                    recordset.val('付款分配.结算方式', res.data.rtspdata1.SettlementMethod)
                                    recordset.val('付款分配.货币代码', res.data.rtspdata1.PurchaseCurrency)
                                    recordset.val('付款分配.跟单部门', res.data.rtspdata1.Department)
                                    recordset.val('付款分配.采购部门', res.data.rtspdata1.Department)
                                    recordset.val('付款分配.开票工厂', res.data.rtspdata1.kpgc)

                                }
                                if (res.data.rtspdata == 3) {
                                    recordset.val('付款分配.交货日期', res.data.rtspdata1.jhrq)
                                    recordset.val('付款分配.我方公司', res.data.rtspdata1.wfgs)
                                    recordset.val('付款分配.客户名称', res.data.rtspdata1.khmc)
                                    recordset.val('付款分配.业务人员', res.data.rtspdata1.ywry)
                                    recordset.val('付款分配.采购人员', res.data.rtspdata1.cgry)
                                    recordset.val('付款分配.联系方式', res.data.rtspdata1.gcdh)
                                    recordset.val('付款分配.联系人', res.data.rtspdata1.lxry)
                                    recordset.val('付款分配.手机号码', res.data.rtspdata1.sjhm)
                                    recordset.val('付款分配.总 金 额', res.data.rtspdata1.htje)
                                    recordset.val('付款分配.跟单人员', res.data.rtspdata1.gdry)
                                    recordset.val('付款分配.优惠金额', res.data.rtspdata1.yhje)
                                    recordset.val('付款分配.合同日期', res.data.rtspdata1.htrq)
                                    recordset.val('付款分配.结算方式', res.data.rtspdata1.jsfs)
                                    recordset.val('付款分配.货币代码', res.data.rtspdata1.hbdm)
                                    recordset.val('付款分配.跟单部门', res.data.rtspdata1.gdbm)
                                    recordset.val('付款分配.采购部门', res.data.rtspdata1.cgbm)
                                    recordset.val('付款分配.外销合同', res.data.rtspdata1.wxht)
                                    recordset.val('付款分配.开票工厂', res.data.rtspdata1.kpgc)
                                    recordset.val('付款分配.外销部门', res.data.rtspdata1.wxbm)
                                    recordset.val('付款分配.诚信识别', res.data.rtspdata1.sfsh)
                                    recordset.val('付款分配.业务部门', recordset.val('业务部门'))
                                }
                                if (res.data.zzsl !== '') {
                                    recordset.val('付款分配.是否开票', '是');
                                    recordset.val('付款分配.增值税率', res.data.zzsl);
                                } else {
                                    recordset.val('付款分配.是否开票', '否');
                                    recordset.val('付款分配.增值税率', '0');
                                }
                                recordset.val('付款分配.产品编号', res.data.cpbh);
                                recordset.val('付款分配.中文品名', res.data.zwpm);
                                recordset.val('付款分配.预计出货', res.data.yjcq);
                                recordset.val('付款分配.总数量', res.data.zsl);
                                recordset.val('付款分配.预计出货1', res.data.yjch1);

                                recordset.val('付款分配.历史预付', res.data.yfhj);
                                if (res.data.seje1 > 0) {
                                    recordset.val('付款分配.历史审请', res.data.seje1 + res.data.yfhj);
                                    recordset.val('付款分配.历史折扣', res.data.lszk1);

                                } else {
                                    recordset.val('付款分配.历史审请', 0 + res.data.yfhj);
                                    recordset.val('付款分配.历史折扣', 0);
                                }

                            }

                            let i = 0;
                            let i1 = 0;
                            let i2 = 0;

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
        if (recordset.val('产品资料.出运唯一字段') !== '') {
            if (recordset.val('提交主管') !== '') {
                if (recordset.val('产品资料.审请金额1') !== recordset.val('产品资料.审请金额') &&
                    recordset.val('产品资料.审请金额1') > 0) {
                    _.ui.message.error('请注意审请金额分配后就不能修改，数据将回滚到修改前!');
                    recordset.val('产品资料.审请金额', recordset.val('产品资料.审请金额1'));
                } else {
                    _.http.post('/api/saier/payment_approval/cpzl/sqje/change', {
                        rid: recordset.val('rid'),
                        cght: recordset.val('产品资料.采购合同'),
                        ywfp: recordset.val('产品资料.业务发票'),
                        cywyzd: recordset.val('产品资料.出运唯一字段'),
                        wxwyzd: recordset.val('产品资料.外销唯一字段'),
                        jsfs: recordset.val('产品资料.结算方式'),
                        jcrq: recordset.val('产品资料.进仓日期')
                    }).then(res => {
                        if (res.data.sqjedata == 1) {
                            recordset.val('产品资料.历史审请', res.data.seje1)
                        }
                        if (res.data.sb == '1') {
                            recordset.val('产品资料.审请金额', 0);
                        }
                        let sqje = 0;
                        if (res.data.sb === '') {
                            if (recordset.val('产品资料.已申请金额') > 0) {
                                _.ui.message.error('请注意此票已有提前申请');
                                sqje = recordset.val('产品资料.总 金 额') - recordset.val('产品资料.预付金额') -
                                    recordset.val('产品资料.折扣费用') - recordset.val('产品资料.已申请金额');
                            } else {
                                sqje = recordset.val('产品资料.总 金 额') - recordset.val('产品资料.预付金额') -
                                    recordset.val('产品资料.折扣费用') - recordset.val('产品资料.历史审请');
                            }

                            if (recordset.val('产品资料.审请金额') > sqje) {
                                recordset.val('产品资料.审请金额', sqje);
                            } else {
                                recordset.val('产品资料.批准金额', recordset.val('产品资料.审请金额'));
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
        if (recordset.val('产品资料.付款唯一') === '') {
            if (recordset.val('产品资料.出运唯一字段') !== '') {
                if (recordset.val('产品资料.结算方式') !== '') {
                    _.http.post('/api/saier/payment_approval/cpzl/sqje/change', {
                        jsfs: recordset.val('产品资料.结算方式'),
                        yjch: recordset.val('产品资料.预计出货')
                    }).then(res => {
                        if (res.data.jsjc.indexOf('进仓') > -1) {
                            if (recordset.val('产品资料.进仓日期') !== '') {
                                const delayDays = res.data.jsts
                                const targetWeekday = res.data.week

                                if (targetWeekday > 0) {
                                    const initialDate = new Date(Date.parse(recordset.val('产品资料.进仓日期')) + delayDays * 24 * 60 * 60 * 1000);
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

                                    recordset.val('产品资料.合同结算期', finalDate.toISOString().split('T')[0]);
                                } else {
                                    const calculatedDate = new Date(Date.parse(recordset.val('产品资料.进仓日期')) + delayDays * 24 * 60 * 60 * 1000);
                                    recordset.val('产品资料.合同结算期', calculatedDate.toISOString().split('T')[0]);
                                }
                            } else {
                                recordset.val('产品资料.审请金额', 0);
                            }
                        }

                        if (res.data.jsjc.indexOf('出运') > -1) {
                            if (recordset.val('产品资料.预计出货') !== '') {
                                const delayDays = res.data.jsts
                                const targetWeekday = res.data.week

                                if (targetWeekday > 0) {
                                    const initialDate = new Date(Date.parse(recordset.val('产品资料.预计出货')) + delayDays * 24 * 60 * 60 * 1000);
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

                                    recordset.val('产品资料.合同结算期', finalDate.toISOString().split('T')[0]);
                                } else {
                                    const calculatedDate = new Date(Date.parse(recordset.val('产品资料.预计出货')) + delayDays * 24 * 60 * 60 * 1000);
                                    recordset.val('产品资料.合同结算期', calculatedDate.toISOString().split('T')[0]);
                                }
                            } else {
                                recordset.val('产品资料.审请金额', 0);
                            }
                        }

                        recordset.val('产品资料.批准金额', recordset.val('产品资料.审请金额'));

                        if (recordset.val('产品资料.预计出货') !== '') {
                            let cwjsq = '';
                            let s = 0;
                            let s1 = 0;

                            if (res.data.sz1 > 0) {
                                const initialDate = new Date(Date.parse(recordset.val('产品资料', '预计出货')) + res.data.jsts * 24 * 60 * 60 * 1000);
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
                                cwjsq = (new Date(Date.parse(recordset.val('产品资料', '预计出货')) + jsts * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
                            }

                            recordset.val('产品资料', '财务结算期', cwjsq);
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
        if (recordset.val('预付分配.预付金额') != 0) {
            if (recordset.val('预付分配.出运唯一字段') != '') {
                let sb = '';
                let hthm = '';

                if (recordset.val('预付分配.付款识别') != '' && recordset.val('预付分配.预付金额1') !== 0) {
                    if (recordset.val('预付分配.预付金额1') != recordset.val('预付分配.预付金额') &&
                        recordset.val('预付分配.预付金额1') !== 0) {
                        _.ui.message.error('请注意预付分配后就不能修改，数据将回滚到修改前!');
                        recordset.val('预付分配.预付金额', recordset.val('预付分配.预付金额1'));
                        recordset.val('预付分配.批准金额', recordset.val('预付分配.预付金额'));
                        sb = '1';
                    }
                } else {
                    const availableAmount = recordset.val('预付分配.采购总价') - recordset.val('预付分配.前预付金额');

                    if (recordset.val('预付分配.预付金额') > availableAmount) {
                        recordset.val('预付分配.预付金额', availableAmount);
                        recordset.val('预付分配.批准金额', availableAmount);
                    } else {
                        let yfje = 0;
                        recordset.val('预付分配.批准金额', recordset.val('预付分配.预付金额'));
                        let yfjez = recordset.val('预付分配.分配金额');
                        let wxfp = recordset.val('预付分配.外销发票');
                        let cywyzd = recordset.val('预付分配.出运唯一字段');
                        let hthm = recordset.val('预付分配.采购合同');

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
        if (recordset.val('正常付款详情.识别') != '') {
            _.http.post('/api/saier/payment_approval/zcfkxq/sb/change', {
                sb: recordset.val('正常付款详情.识别'),
                yjch: recordset.val('产品资料.预计出货')
            }).then(res => {
                if (recordset.val('正常付款详情.已申请金额') === 0) {
                    if (res.data.seje1 != '0') {
                        recordset.val('正常付款详情.已申请金额', res.data.seje1);
                    }
                }
                if (res.data.sbdata == 1) {
                    recordset.val('正常付款详情.工厂编号', res.data.sbdata1.gcbh)
                    recordset.val('正常付款详情.厂商名称', res.data.sbdata1.gcmc1)
                    recordset.val('正常付款详情.来源', res.data.sb1);

                    if (res.data.sbdata1.fpwk === '否') {
                        recordset.val('正常付款详情.是否开票', '是');
                    } else {
                        recordset.val('正常付款详情.是否开票', '否');
                    }

                    recordset.val('正常付款详情.财务工厂', res.data.sbdata1.gcmc);
                    recordset.val('正常付款详情.我方公司', res.data.sbdata1.wstt);
                    recordset.val('正常付款详情.付款抬头', res.data.sbdata1.wstt);
                    recordset.val('正常付款详情.付款地区', res.data.sbdata1.fkdq);

                    recordset.val('正常付款详情.联系方式', res.data.sbdata1.gcdh);
                    recordset.val('正常付款详情.开户银行', res.data.sbdata1.bank);
                    recordset.val('正常付款详情.银行帐号', res.data.sbdata1.zh);

                    if (res.data.sbdata1.fpje > 0) {
                        recordset.val('正常付款详情.货值合计', res.data.sbdata1.fpje);
                        recordset.val('正常付款详情.发票金额', res.data.sbdata1.fpje);
                    } else {
                        recordset.val('正常付款详情.货值合计', res.data.sbdata1.yfhj);
                        recordset.val('正常付款详情.应付合计', res.data.sbdata1.yfhj);
                    }

                    recordset.val('正常付款详情.付款币种', res.data.sbdata1.fkbz);
                    recordset.val('正常付款详情.合同日期', res.data.sbdata1.htrq);
                    recordset.val('正常付款详情.已付金额', res.data.sbdata1.fkhj);
                    recordset.val('正常付款详情.社会统一信用代码', res.data.sbdata1.sh);
                    recordset.val('正常付款详情.暂扣金额', res.data.sbdata1.zkje);
                    recordset.val('正常付款详情.是否暂扣', res.data.sbdata1.sfzk);
                    recordset.val('正常付款详情.货款类型', '正常付款');
                    recordset.val('正常付款详情.发票号码', res.data.sbdata1.wxfp);
                    recordset.val('正常付款详情.工厂发票', res.data.sbdata1.gcfp);
                    recordset.val('正常付款详情.中文品名', res.data.zwpm1.substring(0, 500));
                    recordset.val('正常付款详情.预付情况', res.data.yfqk.substring(0, 1000));
                    recordset.val('正常付款详情.出运预付总', res.data.yffp);
                    recordset.val('正常付款详情.合同预付总', res.data.yfhj);
                    recordset.val('正常付款详情.合同提前总', res.data.tqhj);
                    recordset.val('正常付款详情.出运提前总', res.data.tqfp);

                    const remainingValueForApproval = recordset.val('正常付款详情.货值合计') - recordset.val('正常付款详情.已申请金额');
                    const remainingValueForPayment = recordset.val('正常付款详情.货值合计') - res.data.sbdata1.fkhj;

                    if (remainingValueForApproval > remainingValueForPayment) {
                        recordset.val('正常付款详情.审请金额', remainingValueForPayment - recordset.val('正常付款详情.暂扣金额'));
                    } else {
                        recordset.val('正常付款详情.审请金额', remainingValueForApproval - recordset.val('正常付款详情.暂扣金额'));
                    }
                }
                if (recordset.val('正常付款详情.审请金额') === 0) {
                    recordset.table_delete('正常付款详情', -1);
                }

            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })

        }
    }

    if (field.full_name == n + '.正常付款详情.暂扣金额') {
        const remainingValueForApproval = recordset.val('正常付款详情.货值合计') - recordset.val('正常付款详情.已申请金额');
        const remainingValueForPayment = recordset.val('正常付款详情.货值合计') - recordset.val('正常付款详情.已付金额');

        if (remainingValueForApproval > remainingValueForPayment) {
            recordset.val('正常付款详情.审请金额', remainingValueForPayment - recordset.val('正常付款详情.暂扣金额'));
        } else {
            recordset.val('正常付款详情.审请金额', remainingValueForApproval - recordset.val('正常付款详情.暂扣金额'));
        }

    }

    if (field.full_name == n + '.正常付款详情.是否暂扣') {
        if (recordset.val('正常付款详情.是否暂扣') === '否') {
            recordset.val('正常付款详情.暂扣金额', 0);
        }
    }

    if (field.full_name == n + '.正常付款详情.审请金额') {
        if (recordset.val('正常付款详情.已申请金额') > 0) {
            _.ui.message.error('请注意此票已有正常付款申请')
        }

        if (recordset.val('正常付款详情.审请金额') > 0) {
            const remainingValueForApproval = recordset.val('正常付款详情.货值合计') - recordset.val('正常付款详情.已申请金额');
            const remainingValueForPayment = recordset.val('正常付款详情.货值合计') - recordset.val('正常付款详情.已付金额');

            if (remainingValueForApproval > remainingValueForPayment) {
                const maxAllowed = remainingValueForPayment - recordset.val('正常付款详情.暂扣金额');
                if (recordset.val('正常付款详情.审请金额') > maxAllowed) {
                    recordset.val('正常付款详情.审请金额', maxAllowed);
                }
            } else {
                const maxAllowed = remainingValueForApproval - recordset.val('正常付款详情.暂扣金额');
                if (recordset.val('正常付款详情.审请金额') > maxAllowed) {
                    recordset.val('正常付款详情.审请金额', maxAllowed);
                }
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, payment_approval_field_change, '付款审批')

const payment_approval_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        let iz = 0
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
                    if (recordset.val('付款编号') == '待生成' && recordset.val('付款编号') == '待生成') {
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
                                let htrqM = ''
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
                                            fktt.add(paymentHeader);
                                            ts.add(intToStr(1));
                                        } else {
                                            ts.strings(j, intToStr(getInt(ts.strings(j)) + 1));
                                        }

                                        if (row.cywyzd != '') {
                                            cfsb2 = cfsb.indexOf(row.cywyzd)
                                            if (cfsb2 < 0) {
                                                cfsb.add(row.cywyzd);
                                            } else {
                                                cfsb1 = cfsb1 + 1
                                            }
                                        }

                                        if (row.htyf > 0) {
                                            j2 = htyfc.indexof(row.hthm);
                                            if (j2 < 0) {
                                                htyfc.add(row.hthm);
                                                htyf.add(row.hthm + '预付金额:' + row.htyf + '此票分配:' + row.yfje)
                                                yfhjz = yfhjz + row.htyf
                                                yfjezz = yfjezz + row.yfje
                                            }
                                        }
                                        row.cwgc = recordset.val('财务工厂')
                                        cp_table.push_modi_rid(row.rid)
                                    }
                                    cp_table.sync_operate_data()
                                    cp_table.modified = true;


                                }

                                htyf1 = '';
                                for (let j = 0; j < htyfc.count(); j++) {
                                    if (htyf1 === '') {
                                        htyf1 = htyf.strings(j);
                                    } else {
                                        htyf1 += '\n' + htyf.strings(j);
                                    }
                                }
                                if (htyf1 !== '') {
                                    htyf1 += '\n预付合计:' + floatToStr(yfhjz) + '已分配金额合计:' + floatToStr(yfjezz);
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
                                                cfsb.add(row.hthm);
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
                                            fktt.add(paymentHeader);
                                            ts.add(intToStr(1));
                                        } else {
                                            ts.strings(j, intToStr(getInt(ts.strings(j)) + 1));
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
                                                cfsb.add(row.sb);
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
                                            fktt.add(paymentHeader);
                                            ts.add(intToStr(1));
                                        } else {
                                            ts.strings(j, intToStr(getInt(ts.strings(j)) + 1));
                                        }

                                        fkfp_table.push_modi_rid(row.rid)
                                    }
                                    fkfp_table.sync_operate_data()
                                    fkfp_table.modified = true;
                                }

                                let tt_table = recordset.tables['抬头']
                                let y = []
                                tt_table.clear()
                                for (let j = 0; j < fktt.count(); j++) {
                                    let r = {}
                                    r.rid = _.utils.guid()
                                    r.pid = recordset.val('rid')
                                    r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                                    r.uid = _.user.rid
                                    r.fktt = fktt.strings(j)
                                    r.ts = getInt(ts.strings(j))
                                    let cp_data = recordset.tables['产品资料'].view_data;
                                    for (let row of cp_data) {
                                        if (r.fktt == row.fktt) {
                                            j1 = tqfp.indexOf(row.hsfp)
                                            if (j1 < 0) {
                                                tqfp.add(row.hsfp)
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
                                    if (data.msgdata == 1) {
                                        _.ui.message.warn('请注意此客人为信保客人\n有报关率要求:' + recordset.val('报关率要求'))
                                    }
                                }
                                if (htyf1 !== '') {
                                    _.ui.message.warn(htyf1);
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

const payment_approval_form_BtnClick = (evt_id, btn, form) => {
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

    }
    if (btn.name == 'payment_approval_cxsp_btn') {
        _.http.post('/api/saier/payment_approval/button/cxsp', {
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
                _.platform.active.load_data();
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

}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], payment_approval_form_BtnClick, '付款审批')