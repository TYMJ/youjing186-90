// 编辑界面数据加载以后执行
const finance_payment_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    let rq = recordset.val('截止日期') + recordset.val('截止时间');
    // let rq1 = new Date().format('yyyy-MM-dd hh:mm:ss');
    recordset.module.field_by_full_name(m + '.财务核对').disabled = true;
    recordset.module.field_by_full_name(m + '.财务核对日期').disabled = true;
    recordset.module.field_by_full_name(m + '.批量付款日期').disabled = true;
    recordset.module.field_by_full_name(m + '.备注').disabled = true;
    recordset.module.field_by_full_name(m + '.财务核对状态').disabled = true;
    if (recordset.val('财务人员') == _.user.username && recordset.val('截止日期') != '' && recordset.val('截止日期') != null) {
        recordset.module.field_by_full_name(m + '.财务核对').disabled = false;
        recordset.module.field_by_full_name(m + '.财务核对日期').disabled = false;
        recordset.module.field_by_full_name(m + '.批量付款日期').disabled = false;
        recordset.module.field_by_full_name(m + '.备注').disabled = false;
        recordset.module.field_by_full_name(m + '.财务核对状态').disabled = false;
    }
    if (recordset.val('经手人名') != _.user.username && recordset.val('财务人员') != _.user.username) {
        recordset.module.field_by_full_name(m + '.批量核对').disabled = true;
        recordset.module.field_by_full_name(m + '.财务核对').disabled = true;
        recordset.module.field_by_full_name(m + '.备注').disabled = true;
        recordset.module.field_by_full_name(m + '.批量付款日期').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.付款日期').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.付款金额').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.开户银行').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.银行帐号').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.合同收回').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.业务核对').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.业务不通过原因').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.备注说明').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.是否暂扣').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.暂扣金额').disabled = true;
        recordset.module.field_by_full_name(m + '.付款资料.是否结清').disabled = true;
    }
}
_.evts.on([_.evtids.RECORD_LOAD], finance_payment_recordLoad, '财务付款核对')


function copyStr(value, start, len) {
    const s = String(value || '');
    const begin = Math.max(0, start - 1);
    return s.substring(begin, begin + len);
}
/**
 * 阿拉伯数字单字符转中文数字。
 */
const arabiaToChinese = (char) => {
    const map = {
        '0': '零',
        '1': '一',
        '2': '二',
        '3': '三',
        '4': '四',
        '5': '五',
        '6': '六',
        '7': '七',
        '8': '八',
        '9': '九'
    };
    return map[String(char || '')] || '';
};

function updatePaymentDateFields(recordset, r) {
    const payDate = recordset.value('付款资料.付款日期', r) || '';
    let d1 = copyStr(payDate, 1, 4);
    recordset.val('付款资料.年数字', d1, r);
    let d5 = copyStr(payDate, 6, 2);
    recordset.val('付款资料.月数字', d5, r);
    let d7 = copyStr(payDate, 9, 2);
    d1 = '';
    d5 = '';
    d7 = '';
    // 按原 Pascal 逻辑，此处在清空后写入“日数字”
    recordset.val('付款资料.日数字', d7, r);
    d1 = arabiaToChinese(copyStr(payDate, 1, 1));
    const d2 = arabiaToChinese(copyStr(payDate, 2, 1));
    const d3 = arabiaToChinese(copyStr(payDate, 3, 1));
    const d4 = arabiaToChinese(copyStr(payDate, 4, 1));
    recordset.val('付款资料.付 款 年', d1 + d2 + d3 + d4, r);

    d5 = arabiaToChinese(copyStr(payDate, 6, 1), false);
    const d6 = arabiaToChinese(copyStr(payDate, 7, 1), false);
    const dd6 = copyStr(payDate, 7, 1);
    const dd5 = copyStr(payDate, 6, 1);

    if (dd6 === '0') {
        const d9 = '零' + d5 + '拾';
        recordset.val('付款资料.付 款 月', d9, r);
    } else {
        recordset.val('付款资料.付 款 月', d5 + '拾' + d6, r);
    }

    if (dd5 === '0') {
        recordset.val('付款资料.付 款 月', d5 + d6, r);
    }

    d7 = arabiaToChinese(copyStr(payDate, 9, 1), false);
    const d8 = arabiaToChinese(copyStr(payDate, 10, 1), false);
    const dd8 = copyStr(payDate, 10, 1);
    const dd7 = copyStr(payDate, 9, 1);

    if (dd8 === '0') {
        const t = '零' + d7 + '拾';
        recordset.val('付款资料.付 款 日', t, r);
    } else {
        recordset.val('付款资料.付 款 日', d7 + '拾' + d8, r);
    }

    if (dd7 === '0') {
        recordset.val('付款资料.付 款 日', d7 + d8, r);
    }
}

// 财务付款核对-字段改变主函数
const finance_payment_field_change = async (evt_id, opts) => {
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
    if (field.full_name == m + '.财务核对') {
        recordset.val('财务核对日期', new Date().format('yyyy-MM-dd'));
        if (recordset.val('财务核对') != '是') {
            recordset.module.field_by_full_name(m + '.批量付款日期').disabled = true;
            recordset.module.field_by_full_name(m + '.付款资料.付款日期').disabled = true;
            recordset.module.field_by_full_name(m + '.付款资料.付款金额').disabled = true;
            recordset.module.field_by_full_name(m + '.付款资料.合同收回').disabled = true;
            recordset.module.field_by_full_name(m + '.付款资料.备注说明').disabled = true;
        } else {
            recordset.module.field_by_full_name(m + '.批量付款日期').disabled = false;
            recordset.module.field_by_full_name(m + '.付款资料.付款日期').disabled = false;
            recordset.module.field_by_full_name(m + '.付款资料.付款金额').disabled = false;
            recordset.module.field_by_full_name(m + '.付款资料.合同收回').disabled = false;
            recordset.module.field_by_full_name(m + '.付款资料.备注说明').disabled = false;
        }
    }
    if (field.full_name == m + '.付款资料.暂扣金额') {
        if (recordset.value('付款资料.暂扣金额', row) > 1) {
            recordset.val('付款资料.是否暂扣', '是', row);
        } else {
            recordset.val('付款资料.是否暂扣', '否', row);
        }
    }
    if (field.full_name == m + '.付款资料.业务核对') {
        if (recordset.value('付款资料.业务核对', row) == '通过' && recordset.value('付款资料.诚信报告', row) == '待提供') {
            recordset.val('付款资料.业务核对', '不通过', row);
        }
    }
    if (field.full_name == m + '.批量付款日期') {
        _.http.post('/api/saier/finance_payment/plfkrq/change', {
            hklx: value
        }).then((res) => {
            let d = res.data || {};
            items = d.items || {};
            let t = recordset.tables['付款资料'];
            let v = t.view_data || [];
            let fksb = '0'
            for (let r of v) {
                recordset.val('付款资料.批量识别', '是', r);
                if (recordset.value('付款资料.业务核对', r) == '通过') {
                    if ((recordset.value('付款资料.付款日期', r) == '' || recordset.value('付款资料.付款日期', r) == null) && value != '' && value != null) {
                        recordset.val('付款资料.付款日期', value, r);
                        let sb = '';
                        sb = recordset.value('付款资料.识别', row);
                        updatePaymentDateFields(recordset, r);
                        if (items.bzsm) {
                            recordset.val('付款资料.备注说明', items.bzsm, r);
                        }
                        if (items.htsh) {
                            recordset.val('付款资料.付款合计', items.fkhj, r);
                        }
                    }
                }
                let yfje = 0;
                if (recordset.value('付款资料.付款金额', row) == 0) {
                    if (recordset.value('付款资料.发票金额', row) > 0) {
                        recordset.val('付款资料.付款金额', recordset.value('付款资料.发票金额', row) - recordset.val('付款资料.暂扣金额', row) - recordset.value('付款资料.付款合计', row), row);
                    } else {
                        recordset.val('付款资料.付款金额', recordset.value('付款资料.应付合计', row) - recordset.value('付款资料.暂扣金额', row) - recordset.value('付款资料.付款合计', row), row);
                    }

                    if (recordset.value('付款资料.发票金额', row) > 0) {
                        yfje = recordset.value('付款资料.发票金额', row);
                    } else {
                        yfje = recordset.val('付款资料.应付合计', row);
                    }
                    recordset.val('付款资料.付款合计1', recordset.value('付款资料.付款金额', row) + recordset.value('付款资料.付款合计', row), row);
                    if (recordset.value('付款资料.付款合计1', row) + recordset.value('付款资料.暂扣金额', row) > yfje) {
                        fksb = '1';
                        recordset.val('付款资料.付款金额', 0, row);
                    } else {
                        if (yfje - (recordset.value('付款资料.付款合计1', row) + recordset.value('付款资料.暂扣金额', row)) <= 10) {
                            recordset.val('付款资料.是否结清', '是', row);
                        }
                    }
                    if (recordset.value('付款资料.付款金额', row) > 0) {
                        recordset.val('付款资料.付款识别', '', row);
                        recordset.val('付款资料.银行金额', Math.trunc(recordset.value('付款资料.付款金额', row) * 100), row);
                        recordset.val('付款资料.银行金额1', '', row);
                        let yhje1 = '';
                        let yhje = '';
                        let what = '';
                        // let mw = '';
                        // let result = '';
                        yhje = recordset.value('付款资料.银行金额', row);
                        i = yhje.length;
                        for (let j = 0; j < i; j++) {
                            yhje1 = yhje1 + yhje.charAt(j) + ' ';
                        }
                        recordset.val('付款资料.银行金额1', yhje1);
                        what = String(recordset.value('付款资料.付款金额', row));
                        const bank = recordset.value('付款资料.银行金额', row) || '';
                        const mw = bank.length > 0 ? bank.charAt(bank.length - 1) : '';
                        let result = arabiaToChinese(what);
                        if (mw === '0') {
                            result = result + '整';
                        }
                        recordset.val('付款资料.付款大写', result, row);
                    }
                }
            }
            if (fksb == '1') {
                _.ui.message.error('请有注意付款合计大于需付金额付款金额清0的记录，请查看!');
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error('获取货款类型失败');
            recordset.val('货款类型', '');
        });
    }

    if (field.full_name == m + '.截止日期') {
        _.http.post('/api/saier/finance_payment/jzrq/change', {
            cwry: recordset.val('财务人员')
        }).then((res) => {
            let d = res.data || '';
            if (d.indexOf('义乌') > -1) {
                recordset.val('财务区域', '义乌');
            } else {
                recordset.val('财务区域', '宁波');
            }

            if (recordset.val('截止日期') != '' && recordset.val('截止日期') != null) {
                let rq = recordset.val('截止日期') + ' 13:30:00';
                let rq1 = new Date().format('yyyy-MM-dd hh:mm:ss');
                if (rq > rq1) {
                    _.ui.message.error('请注意没到业务截止时间不能引入，截止时间在13:30');
                    recordset.val('截止日期', '');
                } else {
                    recordset.module.field_by_full_name(m + '.财务核对').disabled = false;
                    recordset.module.field_by_full_name(m + '.财务核对日期').disabled = false;
                    recordset.module.field_by_full_name(m + '.批量付款日期').disabled = false;
                    recordset.module.field_by_full_name(m + '.备注').disabled = false;
                    recordset.module.field_by_full_name(m + '.财务核对状态').disabled = false;
                }
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error('获取货款类型失败');
            recordset.val('货款类型', '');
        });
    }
    if (field.full_name == m + '.付款资料.付款金额') {
        _.http.post('/api/saier/finance_payment/plfkrq/change', {
            lines: [recordset.tables['付款资料'].current_data]
        }).then((res) => {
            let d = res.data || {};
            let items = d.items || {};
            let yfje = 0;
            if (recordset.value('付款资料.批量识别', row) != '是') {
                if (items.fkhj) {
                    recordset.val('付款资料.付款合计', items.fkhj, row);
                }
                if (recordset.value('付款资料.业务核对', row) != '通过') {
                    recordset.val('付款资料.付款金额', 0, row);
                }
                if (recordset.value('付款资料.发票金额', row) > 0) {
                    yfje = recordset.value('付款资料.发票金额', row);
                } else {
                    yfje = recordset.value('付款资料.应付合计', row);
                }
                recordset.val('付款资料.付款合计1', recordset.value('付款资料.付款金额', row) + recordset.value('付款资料.付款合计', row), row);
                if (recordset.value('付款资料.付款合计1', row) + recordset.value('付款资料.暂扣金额', row) > yfje) {
                    _.ui.message.error('请注意付款合计大于需付金额，付款金额清0!');
                    recordset.val('付款资料.付款金额', 0, row);
                } else {
                    if (yfje - (recordset.value('付款资料.付款合计1', row) + recordset.value('付款资料.暂扣金额', row)) <= 10) {
                        recordset.val('付款资料.是否结清', '是', row);
                    } else {
                        recordset.val('付款资料.是否结清', '否', row);
                    }
                }
                if (recordset.value('付款资料.付款金额', row) > 0) {
                    recordset.val('付款资料.银行金额', Math.trunc(recordset.value('付款资料.付款金额', row) * 100), row);
                    recordset.val('付款资料.银行金额1', '', row);
                    recordset.val('付款资料.付款识别', '', row);
                    let yhje1 = '';
                    let yhje = '';
                    let what = '';
                    // let mw = '';
                    // let result = '';
                    yhje = recordset.value('付款资料.银行金额', row);
                    i = yhje.length;
                    for (let j = 0; j < i; j++) {
                        yhje1 = yhje1 + yhje.charAt(j) + ' ';
                    }
                    recordset.val('付款资料.银行金额1', yhje1);
                    what = String(recordset.value('付款资料.付款金额', row));
                    const bank = recordset.value('付款资料.银行金额', row) || '';
                    const mw = bank.length > 0 ? bank.charAt(bank.length - 1) : '';
                    let result = arabiaToChinese(what);
                    if (mw === '0') {
                        result = result + '整';
                    }
                    recordset.val('付款资料.付款大写', result, row);
                }
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error('获取货款类型失败');
            recordset.val('货款类型', '');
        });
    }

    if (field.full_name == m + '.付款资料.付款日期') {
        if (recordset.value('付款资料.批量识别', row) != '是') {
            if (recordset.value('付款资料.业务核对', row) != '通过') {
                recordset.val('付款资料.付款日期', '', row);
            }
            if (recordset.value('付款资料.付款日期', row) != '' && recordset.value('付款资料.付款日期', row) != null) {
                updatePaymentDateFields(recordset, row);
            }
        }
    }
}
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, finance_payment_field_change, '财务付款核对')

// 界面加载添加按钮
const finance_payment_formShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        // btns.push({
        //     name: 'bank_apply_status_back_btn',
        //     caption: '银行申请状态还原',
        //     icon: 'any-keyborad'
        // })
        // btns.push({
        //     "name": 'payment_invoice_validation',
        //     "caption": '更新发票验证',
        //     "icon": 'any-keyborad',
        // })
    } else {
        btns.push({
            name: 'finance_payment_excel_export',
            caption: '批量付款资料导出',
            icon: 'any-keyborad'
        });
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], finance_payment_formShow, '财务付款核对');

// 财务付款核对-按钮点击事件
const financePaymentButtonClick = async (evt_id, btn, form) => {
    if (btn.name == 'finance_payment_excel_export') {
        if (form.current_rid.value == '' || form.current_rid.value == null) {
            _.ui.message.error('请选择需要导出的记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务',
            module: form.module.name
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) !== 1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }
        _.http.post('/api/saier/finance_payment/payment/export', {
            rid: form.current_rid.value
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('批量付款资料导出失败', err);
            _.ui.message.error((err && err.msg) || '批量付款资料导出失败');
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], financePaymentButtonClick, '财务付款核对');

const finance_payment_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '付款资料') {
            _.http.post('/api/saier/finance_payment/child/delete', {
                sb: recordset.val('付款资料.识别'),
                jzrq: recordset.val('付款资料.截止日期')
            }).then((res) => {
                resolve(); // 阻止删除
            }).catch((err) => {
                console.error(err);
                _.ui.message.error('删除验证失败');
                reject(); // 阻止删除
            });
        }
    });
};
_.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, finance_payment_table_delete_before, '财务付款核对')