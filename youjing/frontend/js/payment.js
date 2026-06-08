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

/**
 * 银行申请状态
 */
async function paymentBankApplyStatusFieldChanged(evt_id, opts) {
    const {
        recordset,
        module,
        field
    } = opts || {};
    let m = module.name
    if (!recordset || !field) {
        return;
    }
    if (field.full_name !== m + '.银行申请状态') {
        return;
    }

    const status = String(recordset.val('银行申请状态') || '').trim();
    if (status !== '待提交') {
        return;
    }
    if (recordset.val('我方银行帐号') == '' || recordset.val('我方银行帐号') == null) {
        _.ui.message.error('我方我方银行帐号为空不能提交');
        recordset.val('银行申请状态', '无');
        return
    }
    recordset.val('银行申请状态1', recordset.val('银行申请状态'));
    const res = await _.http.post('/api/saier/advance_payment/bank_apply_status', {
        khyh: recordset.val('开户银行') || '',
        wfyh: recordset.val('我方银行名称') || '',
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '银行状态校验失败');
        return;
    }
    let d = res.data || {};
    let tc1 = d.tc1
    let tc2 = d.tc2
    let th1 = d.th1
    let th2 = d.th2
    let yhdm1 = d.yhdm1;
    if ((tc1 != '') && (tc2 != '')) {
        if (tc1 == tc2) {
            recordset.val('同城异地', '同城');
        } else {
            recordset.val('同城异地', '异地');
        }
    }
    if ((th1 != '') && (th2 != '')) {
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
    if (yhdm1 == '' || yhdm1 == null) {
        recordset.val('银行申请状态', '无');
        _.ui.message.error('请注意,我方银行名称和银行数据不匹配不能提交');
        return;
    }
    if (recordset.val('我方银行帐号') == '' || recordset.val('我方银行名称') == '' || recordset.val('同行转账') == '' || recordset.val('同城异地') == '' || recordset.val('客户号') == '' ||
        recordset.val('单位code') == '' || recordset.val('开户银行') == '' || recordset.val('银行帐号') == '' || recordset.val('用途') == '' || recordset.val('付款金额') < 1) {
        recordset.val('银行申请状态', '无');
        _.ui.message.error('请注意,银行付款提交模块或用途、收款信息、付款金额未填不能提交');
    } else {
        recordset.module.field_by_full_name('预付货款.银行申请状态').disabled = true;
    }
}

/**
 * 银行申请状态1
 */
async function paymentBankApplyStatusFieldChanged1(evt_id, opts) {
    const {
        recordset,
        module,
        field
    } = opts || {};
    let m = module.name
    if (!recordset || !field) {
        return;
    }
    if (field.full_name !== m + '.开户银行' && field.full_name !== m + '.我方银行帐号' && field.full_name !== m + '.我方银行名称') {
        return;
    }

    const status = String(recordset.val('银行申请状态') || '').trim();
    if (status !== '待提交') {
        return;
    }
    if (recordset.val('我方银行帐号') == '' || recordset.val('我方银行帐号') == null || recordset.val('我方银行名称') == '' || recordset.val('我方银行名称') == null || recordset.val('开户银行') == '' || recordset.val('开户银行') == null) {
        return
    }
    recordset.val('银行申请状态1', recordset.val('银行申请状态'));
    const res = await _.http.post('/api/saier/advance_payment/bank_apply_status', {
        khyh: recordset.val('开户银行') || '',
        wfyh: recordset.val('我方银行名称') || '',
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '银行状态校验失败');
        return;
    }
    let d = res.data || {};
    let tc1 = d.tc1
    let tc2 = d.tc2
    let th1 = d.th1
    let th2 = d.th2
    if ((tc1 != '') && (tc2 != '')) {
        if (tc1 == tc2) {
            recordset.val('同城异地', '同城');
        } else {
            recordset.val('同城异地', '异地');
        }
    }
    if ((th1 != '') && (th2 != '')) {
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
}

// 阿拉伯数字转中文大写数字的函数
function ArabiaToChinese(num) {
    const map = {
        '0': '零',
        '1': '壹',
        '2': '贰',
        '3': '叁',
        '4': '肆',
        '5': '伍',
        '6': '陆',
        '7': '柒',
        '8': '捌',
        '9': '玖'
    };
    return map[num] || num;
}

// 编辑界面字段change后执行
const payment_field_change = async (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts
    let row = current_record
    let m = module.name
    if (field.full_name == m + '.银行金额' && value != 0) {
        let yhje = recordset.val('银行金额');
        let yhje1 = '';
        for (let i = 0; i < yhje.length; i++) {
            yhje1 += yhje[i] + ' ';
        }
        recordset.val('银行金额1', yhje1);
    }
    if (field.full_name == m + '.付款金额') {
        let fkje = recordset.val('付款金额');
        let i2 = recordset.tables['付款详情'].view_data.length;
        let i1 = recordset.tables['详细用途'].view_data.length;
        if (fkje > 0 && i1 == 0) {
            recordset.tables['详细用途'].append()
            recordset.val('详细用途.付款地区', recordset.val('付款地区'));
            recordset.val('详细用途.发票为空', recordset.val('发票为空'));
            recordset.val('详细用途.是否结清', recordset.val('是否结清'));
            recordset.val('详细用途.发票号码', recordset.val('外销发票'));
            recordset.val('详细用途.采购合同', recordset.val('采购合同'));
            recordset.val('详细用途.付款日期', recordset.val('付款日期'));
            if (recordset.val('出货工厂') != '') {
                recordset.val('详细用途.生产厂家', recordset.val('出货工厂'));
            } else {
                recordset.val('详细用途.生产厂家', recordset.val('生产厂家'));
            }
            recordset.val('详细用途.付款抬头', recordset.val('我司抬头'));
            recordset.val('详细用途.实际出运', recordset.val('出货日期'));
            recordset.val('详细用途.跟单人员', recordset.val('经手人名'));
            recordset.val('详细用途.付款地区', recordset.val('付款地区'));
            recordset.val('详细用途.发票为空', recordset.val('发票为空'));
            recordset.val('详细用途.是否结清', recordset.val('是否结清'));
            if (recordset.val('发票金额') > 0) {
                recordset.val('详细用途付款合计', recordset.val('发票金额'));
                recordset.val('详细用途应付金额', recordset.val('发票金额'));
            } else {
                recordset.val('详细用途付款合计', recordset.val('应付合计'));
                recordset.val('详细用途应付金额', recordset.val('应付合计'));
            }
        }
        if (fkje > 0 && i2 > 0) {
            _.ui.message.warning('如果是更改已保存过的数据,请将付款详情中相关记录冲红,以免出错')
        }
    }
    if (field.full_name == m + '.发票验证') {
        if (value == '0' || value == 0) {
            recordset.val('发票代码', '');
            recordset.val('工厂发票', 0);
            recordset.val('发票验证', '');
        }
    }
    if (field.full_name == m + '.融资收益') {
        if (value > 0) {
            recordset.val('是否融资', '是');
        } else {
            recordset.val('是否融资', '否');
        }
    }
    if (field.full_name == m + '.生产厂家') {
        if (recordset.val('出货工厂') == '') {
            recordset.val('出货工厂', recordset.val('生产厂家'));
        }
    }
    if (field.full_name == m + '.税    额') {
        if (recordset.val('增值税率') == recordset.val('退税率(%)')) {
            recordset.val('退 税 额', recordset.val('税    额'));
        } else {
            recordset.val('退 税 额', recordset.val('不含税价') * recordset.val('退税率(%)') / 100);
        }
    }
    if (field.full_name == m + '.是否电汇') {
        if (recordset.val('是否电汇') == '是') {
            recordset.val('电汇日期', new Date().format('yyyy-MM-dd'));
        } else {
            recordset.val('电汇日期', null);
        }
    }
    if (field.full_name == m + '.盖章收回') {
        if (recordset.val('盖章收回') == '是') {
            recordset.val('盖章日期', new Date().format('yyyy-MM-dd'));
        } else {
            recordset.val('盖章日期', null);
        }
    }
    if (field.full_name == m + '.出货日期') {
        if (recordset.val('出货日期') != '' && recordset.val('出货日期') != null) {
            _.http.post('/api/saier/payment/chrq/change', {}).then(res => {
                let d = res.data || {};
                let sz1 = d.sz1 || 0;
                let jsts = d.jsts || 0;
                let rq = recordset.val('出货日期');

                function dateAddDays(dateStr, days) {
                    let date = new Date(dateStr);
                    date.setDate(date.getDate() + days);
                    return date;
                }

                function formatDate(date) {
                    return date.format('yyyy-MM-dd');
                }
                let date = dateAddDays(rq, 30);

                function dayOfWeek(date) {
                    let day = date.getDay();
                    return day === 0 ? 7 : day;
                }
                let s = dayOfWeek(date);
                let addDays = 0;
                for (let i = 1; i <= 7; i++) {
                    if (s === sz1) {
                        // 如果等于目标值，继续往后找
                        currentDate = dateAddDays(rq, jsts + i);
                        s = dayOfWeek(currentDate);
                        addDays = i;
                    } else {
                        // 找到不等于目标值的日期，跳出循环
                        break;
                    }
                }
                recordset.val('预计付款', formatDate(dateAddDays(rq, jsts + addDays)));
            }).catch(err => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
        }
    }
    if (field.full_name == m + '.采购合同') {
        if (recordset.val('采购合同') != '' && recordset.val('采购合同') != null && recordset.val('经手人名') == '') {
            _.http.post('/api/saier/payment/cght/change', {
                hthm: recordset.val('采购合同'),
                jsrm: recordset.val('经手人名')
            }).then(res => {
                let d = res.data;
                if (d && d != '' && d != null) {
                    recordset.val('经手人名', d);
                }
            }).catch(err => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
        }
    }
    let fields = ['开户银行', '银行帐号', '备注说明', '记录备注', '生产厂家', '出货工厂'];
    if (fields.indexOf(field.full_name) !== -1) {
        if (recordset.val('采购合同') != '' && recordset.val('采购合同') != null && recordset.val('经手人名') == '') {
            _.http.post('/api/saier/payment/user/check', {
                position: '财务修改',
                field: 'position'
            }).then(res => {
                let d = res.data;
                let fkdq = recordset.val('付款地区');
                if (d != 1) {
                    _.ui.message.error('无权修改,请与' + fkdq + '财务联系');
                    recordset.reload_data()
                }
            }).catch(err => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
        }
    }
    if (field.full_name == m + '.工厂发票') {
        if (recordset.val('工厂发票') != '') {
            _.http.post('/api/saier/payment/gcfp/change', {
                gcfp: recordset.val('工厂发票')
            }).then(res => {

            }).catch(err => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
        }
    }
    fields = ['增值税率', '发票金额', '税    额', '退税率(%)'];
    if (fields.indexOf(field.full_name) !== -1) {
        let zzsl = recordset.val('增值税率');
        let fpje = recordset.val('发票金额');
        let tsl = recordset.val('退税率(%)');
        let se = recordset.val('税    额');
        if (fpje != 0 && tsl != 0 && zzsl == 0) {
            if (se == 0) {
                se = fpje - recordset.val('不含税价');
            }
            if (tsl == zzsl) {
                recordset.val('退 税 额', se);
            } else {
                recordset.val('退 税 额', round((fpje / (1 + zzsl / 100) * tsl / 100) * 100) / 100);
            }
        }
        if (recordset.val('增值税率') == 3) {
            let jy = 0;
            let cjs1 = 0.07;
            let yhs1 = 0.0003;
            let cjs = 0;
            let yhs = 0;
            if (recordset.val('税    额') > 0) {
                cjs = (recordset.val('税    额') * cjs1) / 2;
                recordset.val('城 建 税', round(cjs * 100) / 100);
                jy = (recordset.val('税    额') * 0.05) / 2;
            }
            if (recordset.val('发票金额') > 0) {
                yhs = (recordset.val('发票金额') / 1.03 * yhs1) / 2;
                recordset.val('印 花 税', round(yhs * 100) / 100);
            }
            recordset.val('税金合计', round((recordset.val('税    额') + cjs + yhs) * 100) / 100);
        } else {
            recordset.val('税金合计', recordset.val('税    额'));
        }
    }
    if (field.full_name == m + '.是否结清') {
        let htje = 0;
        let i = 0;
        let i1 = 0;
        let t = recordset.tables['详细用途'];
        let v = t.view_data;
        for (let r of v) {
            let yfje = r.Yfje || 0;
            let yfje1 = r.yfje1 || 0;
            htje = htje + yfje - yfje1;
        }
        let htje1 = recordset.val('付款合计');
        let htje2 = recordset.val('付款合计');
        let htje4 = recordset.val('付款合计');
        if (recordset.val('是否结清') == '是') {
            if (recordset.val('是否暂扣') != '是') {
                for (let r of v) {
                    i1 = i1 + 1;
                    recordset.val('详细用途.付款日期', recordset.val('付款日期'), r);
                    recordset.val('详细用途.付款地区', recordset.val('付款地区'), r);
                    recordset.val('详细用途.发票为空', recordset.val('发票为空'), r);
                    recordset.val('详细用途.是否结清', recordset.val('是否结清'), r);
                    recordset.val('详细用途.发票号码', recordset.val('外销发票'), r);
                    if (recordset.value('详细用途.增值税率', r) == 0) {
                        recordset.val('详细用途.增值税率', recordset.val('增值税率'), r);
                    }
                    if (recordset.value('详细用途.退 税 率', r) == 0 && recordset.value('详细用途.增值税率', r) == 0) {
                        recordset.val('详细用途.退 税 率', recordset.val('退税率(%)'), r);
                        recordset.val('详细用途.退 税 率', recordset.val('退税率(%)'), r);
                    }
                    if (htje > 0) {
                        if (i1 === i) {
                            recordset.val('详细用途.付款金额', htje2);
                        } else {
                            htje3 = 0;
                            htje3 = trunc(((recordset.value('详细用途.应付金额', r) - recordset.value('详细用途.预付金额', r)) / htje) * htje1);
                            recordset.val('详细用途.付款金额', htje3, r);
                            htje2 = htje2 - htje3;
                        }
                    } else {
                        if (i == 1) {
                            recordset.val('详细用途.付款金额', htje2, r);
                        } else {
                            if (i1 == i) {
                                recordset.val('详细用途.付款金额', htje4, r);
                            } else {
                                recordset.val('详细用途.付款金额', round(htje2 / i), r);
                                htje4 = htje4 - round(htje2 / i);
                            }
                        }
                    }
                }
            } else {
                _.ui.message.error('请注意备注信息里是否暂扣为是不能结清');
                recordset.val('是否结清', '否');
            }
        } else {
            for (let r of v) {
                recordset.val('详细用途.付款日期', null, r);
            }
        }
    }
    if (field.full_name == m + '.付款日期') {
        if (recordset.val('付款日期') != '' && recordset.val('付款日期') != null) {
            let cxbg = '不需要';
            let chgc = recordset.val('出货工厂');
            let fkrq = recordset.val('付款日期');
            let nf = new Date(fkrq).getFullYear();
            let yf = new Date(fkrq).format('MM');
            let rq = new Date(fkrq).format('dd');
            let d1 = ArabiaToChinese(nf.toString().charAt(0));
            let d2 = ArabiaToChinese(nf.toString().charAt(1));
            let d3 = ArabiaToChinese(nf.toString().charAt(2));
            let d4 = ArabiaToChinese(nf.toString().charAt(3));
            recordset.val('付 款 年', d1 + d2 + d3 + d4);
            let d5 = ArabiaToChinese(yf.toString().charAt(0));
            let d6 = ArabiaToChinese(yf.toString().charAt(1));
            let dd5 = yf.toString().charAt(0);
            let dd6 = yf.toString().charAt(1);
            if (dd6 == '0' || dd6 == 0) {
                let d9 = '零' + d5 + '拾';
                recordset.val('付 款 月', d9);
            } else {
                recordset.val('付 款 月', d5 + '拾' + d6);
            }
            if (dd5 == '0' || dd5 == 0) {
                recordset.val('付 款 月', d5 + d6);
            }
            let d7 = ArabiaToChinese(rq.toString().charAt(0));
            let d8 = ArabiaToChinese(rq.toString().charAt(1));
            let dd7 = rq.toString().charAt(0);
            let dd8 = rq.toString().charAt(1);
            if (dd8 == '0' || dd8 == 0) {
                let t = '零' + d7 + '拾';
                recordset.val('付 款 日', t);
            } else {
                recordset.val('付 款 日', d7 + '拾' + d8);
            }
            if (dd7 == '0' || dd7 == 0) {
                recordset.val('付 款 日', d7 + d8);
            }

            recordset.val('年数字', new Date(fkrq).getFullYear());
            recordset.val('月数字', new Date(fkrq).format('MM'));
            recordset.val('日数字', new Date(fkrq).format('dd'));
        }
    }
    // 银行申请状态
    paymentBankApplyStatusFieldChanged(evt_id, opts);
    // 银行申请状态1
    paymentBankApplyStatusFieldChanged1(evt_id, opts);
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, payment_field_change, '采购付款')


// 金蝶付款（单笔）
const paymentKingdeeExportExcel = async (evt_id, btn, form) => {
    const rids = getSelectedRids(form);
    if (!rids || rids.length === 0) {
        _.ui.message.error('请先选择要导出的记录');
        return;
    }
    let pzh = await _.ui.show_input_dialog('请输入凭证号', '');
    if (pzh === undefined || pzh === null || String(pzh).trim() === '') {
        _.ui.message.error('请输入有效的凭证号');
        return;
    }
    let kmdm = await _.ui.show_input_dialog('请输入科目代码', '204');
    if (kmdm === undefined || kmdm === null || String(kmdm).trim() === '') {
        kmdm = '204';
    }
    let bank = await _.ui.show_input_dialog('请输入银行名', '宁波银行');
    if (bank === undefined || bank === null || String(bank).trim() === '') {
        bank = '宁波银行';
    }
    const res = await _.http.post('/api/advance_payment/kingdee_export_excel', {
        rids: rids,
        pzh: pzh,
        kmdm: kmdm,
        bank: bank,
        module: form.module.name
    }).then(res => {
        return res;
    }).catch(err => {
        console.error('导出失败', err);
        return err;
    });

    if (!res || Number(res.code) !== 1 || !res.data) {
        _.ui.message.error((res && res.msg) || '导出失败');
        return;
    }

    const fileName = res.data.file_name || '金蝶付款导出.xlsx';
    const filePath = res.data.file_path || '';
    if (!filePath) {
        _.ui.message.error('导出失败：未返回文件路径');
        return;
    }

    _.http.download('/api/tmp/file/get', {
        file: filePath
    }, fileName);
}


// 界面加载添加按钮
const paymentButtonShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            name: 'bank_apply_status_back_btn',
            caption: '银行申请状态还原',
            icon: 'any-keyborad'
        })
        btns.push({
            "name": 'payment_invoice_validation',
            "caption": '更新发票验证',
            "icon": 'any-keyborad',
        })
    } else {
        btns.push({
            name: 'payment_batch_bank_apply',
            caption: '批量银行提交',
            icon: 'any-keyborad'
        });
        btns.push({
            "name": 'payment_confirm_btn',
            "caption": '批量确认',
            "icon": 'any-keyborad',
        })
        btns.push({
            name: 'payment_batch_update_payment',
            caption: '付款批次回导',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_printing_cost_btn',
            caption: '刷印费合计',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_contract_details',
            caption: '刷合同详情',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_business_area',
            caption: '刷新业务地区',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_complete_invoice',
            caption: '完成开票',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_batch_year_month',
            caption: '批量实际出货年月',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_shipment_date_update',
            caption: '批量更新出货日期',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_invoice_tax_export',
            caption: '3%发票税金格式',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_integrity_export',
            caption: '批量诚信导出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_electronic_export',
            caption: '电子口岸数据引入',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_refund_tax_export',
            caption: '外贸企业出口退税进货明细',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_risk_supplier_export',
            caption: '风险供应商导出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_amount_query',
            caption: '报关金额金蝶编号查看',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'payment_kingdee_export_excel',
            caption: '金蝶付款导出',
            icon: 'any-keyborad'
        });
        btns.push({
            "name": 'payment_receipt_btn',
            "caption": '签收单批量导出',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_receipt1_btn',
            "caption": '签收单批量导出1',
            "icon": 'any-keyborad',
        })


        btns.push({
            "name": 'payment_change_no_btn',
            "caption": '换单号导出',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_change_receipt_btn',
            "caption": '换单收条打印',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_paied_btn',
            "caption": '宁波批量付款回导',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_invoice_btn',
            "caption": '导入发票',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_cash_btn',
            "caption": '现金导入(详细)',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_account_list_btn',
            "caption": '销售帐入帐清单(优胜)',
            "icon": 'any-keyborad',
        })

        btns.push({
            "name": 'payment_batch_audit_btn',
            "caption": '批量付款核对',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_kingdee_payment_btn',
            "caption": '金蝶付货款',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_kingdee_contract_btn',
            "caption": '金蝶合同入账',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_kingdee_close_btn',
            "caption": '金蝶合同结转',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_voucher_api_btn',
            "caption": '宁波新金蝶入账new',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_voucher_excel_btn',
            "caption": '宁波新金蝶入账',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_export_txt_btn',
            "caption": '付款资料导出txt',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_payment_date',
            "caption": '付款日期批量更改',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_date_lower',
            "caption": '日期批量小写',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_update_date_flag',
            "caption": '标记导出日期',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_amount_audit_btn',
            "caption": '当前现金审核',
            "icon": 'any-keyborad',
        })
        btns.push({
            name: 'purchase_payment_accounting_export_btn',
            caption: '做账导出',
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

_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], paymentButtonShow, '采购付款');


/**
 * 银行申请状态还原
 */
const paymentBankApplyStatusBackButtonClick = async (evt_id, btn, form) => {
    const res = await _.http.post('/api/saier/payment_approval/user_check', {}).then(res => {
        return res;
    }).catch(err => {
        console.error('用户校验失败', err);
        return err;
    });
    console.log('用户校验结果', res);
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res.msg));
        return;
    }
    if (form.recordset.val('银行申请状态') == '已提交' || form.recordset.val('银行申请状态') == '申请失败') {
        form.recordset.val('银行申请状态', '无');
        form.recordset.module.field_by_full_name('预付货款.银行申请状态').disabled = false;
    }
};

/**
 * 批量银行提交
 */
const paymentBatchBankApplyButtonClick = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'payment_batch_bank_apply') {
        return;
    }
    const rids = getSelectedRids(form);
    let res = await _.http.post('/api/saier/advance_payment/batch_bank_apply_check', {
        rids: rids,
        module: form.module.name
    }).then(res => {
        return res;
    }).catch(err => {
        console.error('银行申请检查失败', err);
        return err;
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '用户校验失败');
        return;
    }
    let d = res.data || {};
    let wstt1 = d.wstt1 || '';
    let fkdq = d.fkdq || '';
    let yhzh = d.yhzh || '';
    let banks = d.banks || [];
    let new_rids = d.new_rids || [];
    _.ui.show_input_select_dialog('请输入或选择银行账号', '', yhzh).then(async (zh) => {
        if (zh === '' || zh === undefined || zh === null) {
            return
        }
        const res = await _.http.post('/api/saier/advance_payment/batch_bank_apply_update', {
            new_rids: new_rids,
            yhzh: zh,
            banks: banks,
            module: form.module.name
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('批量银行提交失败', err);
            return err;
        });
        if (!res || Number(res.code) !== 1) {
            _.ui.message.error((res && res.msg) || '批量银行提交失败');
            return
        }
        if (res.data && res.data != '') {
            _.ui.message_box({
                title: '更新提示',
                width: '450px',
                message: _.vue.h(
                    'pre', {
                        style: 'font-weight:500;line-height:20px;width:400px;overflow:auto',
                    },
                    res.data,
                ),
            })
        } else {
            _.ui.message.success('批量银行提交成功');
        }
    })

};


// 付款批次回导
const paymentBatchUpdatePayment = async (evt_id, btn, form) => {
    _.ui.show_upload_dialog({
            title: '付款批次回导',
            url: '/api/advance_payment/batch_update_payment',
            accept: '.xlsx',
            auto_close: true,
            success_msg: '导入成功',
            error_msg: '导入失败',
            params: {
                'module': form.module.name
            }
        },
        (res) => {})
}

// 按钮点击：调用后端生成导出文件
const paymentButtonClick = async (evt_id, btn, form) => {
    // // 仅处理预付货款导出按钮的点击事件
    // if (btn.name === 'advance_payment_export_btn') {
    //     advanceAwaitPaymentExport(evt_id, btn, form);
    // }
    // // 日期批量小写
    // if (btn.name === 'advance_payment_sync_payment_date_parts') {
    //     advancePaymentSyncPaymentDatePartsButtonClick(evt_id, btn, form);
    // }
    // // 批量结清
    // if (btn.name === 'advance_payment_batch_settlement') {
    //     advancePaymentBatchSettlementButtonClick(evt_id, btn, form);
    // }
    // 批量银行提交
    if (btn.name === 'payment_batch_bank_apply') {
        paymentBatchBankApplyButtonClick(evt_id, btn, form);
    }
    // 银行申请状态还原
    if (btn.name === 'bank_apply_status_back_btn') {
        paymentBankApplyStatusBackButtonClick(evt_id, btn, form);
    }
    // 付款批次回导
    if (btn.name === 'payment_batch_update_payment') {
        paymentBatchUpdatePayment(evt_id, btn, form);
    }
    // 金蝶付款（单笔）
    if (btn.name === 'payment_kingdee_export_excel') {
        paymentKingdeeExportExcel(evt_id, btn, form);
    }
    // 批量确认
    if (btn.name == 'payment_confirm_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.confirm('确定要进行确认操作吗？').then(() => {
            _.http.post("/api/saier/payment/confirm", {
                rids: [form.current_rid.value]
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        })
    }
    // 刷印费合计
    if (btn.name == 'payment_printing_cost_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.confirm('确定要进行刷印费合计操作吗？').then(() => {
            _.http.post("/api/saier/payment/printing_cost", {
                rids: [form.current_rid.value]
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        })
    }
    // 刷合同详情
    if (btn.name == 'payment_contract_details') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.confirm('确定要进行刷合同详情操作吗？').then(() => {
            _.http.post("/api/saier/payment/contract_details", {
                rids: [form.current_rid.value]
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        })
    }
    // 刷新业务地区
    if (btn.name == 'payment_business_area') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.confirm('确定要进行刷新业务地区操作吗？').then(() => {
            _.http.post("/api/saier/payment/business_area", {
                rids: [form.current_rid.value]
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        })
    }
    // 完成开票
    if (btn.name == 'payment_complete_invoice') {
        let val = await _.ui.show_input_dialog('输入发票号码，注意此发票下所有发票都应已收齐:')
        if (!val || val.trim() === '') {
            return;
        }
        _.http.post("/api/saier/payment/complete_invoice", {
            fphm: val.trim()
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 发票验证更新
    if (btn.name == 'payment_invoice_validation') {
        _.http.post("/api/saier/payment/user/check", {
            position: '财务'
        }).then(res => {
            let date = new Date().format('yyyy-MM-dd hh:mm:ss')
            if (recordset.val('工厂发票') == '') {
                let wxfp = recordset.val('外销发票');
                let cght = recordset.val('采购合同');
                let gcmc1 = recordset.val('出货工厂');
                let xm = _.user.username;
                recordset.val('发票代码', xm + date);
                recordset.val('发票验证', wxfp + '\\' + cght + '\\' + gcmc1 + date);
            } else {
                let bm = recordset.val('工厂发票');
                let xm = recordset.val('发票代码');
                recordset.val('发票验证', xm + '-' + bm + '-' + date);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 实际出货年月导入
    if (btn.name == 'payment_batch_year_month') {
        _.ui.show_upload_dialog({
                title: '批量实际出货年月',
                url: '/api/saier/payment/batch_update_year_month',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '导入成功',
                error_msg: '导入失败',
                params: {
                    'module': form.module.name
                }
            },
            (res) => {})
    }

    // 批量更新出货日期
    if (btn.name == 'payment_shipment_date_update') {
        let date = await _.ui.show_input_date_dialog('请输入查询起始日期(格式2010-01-18)', '');
        if (!date) {
            return;
        }
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post('/api/saier/payment/shipment_date_check', {

        }).then(res => {
            _.http.post('/api/saier/payment/shipment_date_update', {
                date: date,
                rids: rids
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.error(err);
        });
    }
    // 3%发票税金格式,包括当前和所有选中的记录
    if (btn.name == 'payment_invoice_tax_export') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post('/api/saier/payment/invoice_report', {
            rids: rids
        }).then(res => {
            let d = res.data || '';
            if (!d || d == '' || d == null) {
                _.ui.message.error('没有需要导出的数据');
                return
            }
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(res => {
            _.ui.message.error(res.msg);
        });
    }
    // 批量诚信导出,包括当前和所有选中的记录
    if (btn.name == 'payment_integrity_export') {
        let ksrq = await _.ui.show_input_date_dialog('请输入查询起始日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!ksrq) {
            return;
        }
        let jsrq = await _.ui.show_input_date_dialog('请输入查询结束日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!jsrq) {
            return;
        }
        let fpje = await _.ui.show_input_number_dialog('请输入发票金额', 0).then(res => {
            if (res === undefined || res === null || res === '') {
                return 0;
            }
            return res
        })
        if (fpje == undefined || fpje == null) {
            return;
        }
        _.http.post('/api/saier/payment/integrity_export', {
            ksrq: ksrq,
            jsrq: jsrq,
            fpje: fpje
        }).then(res => {
            let d = res.data || '';
            if (!d || d == '' || d == null) {
                _.ui.message.error('没有需要导出的数据');
                return
            }
            _.ui.message.success('正在下载文件，请稍候...');
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(res => {
            _.ui.message.error(res.msg);
        });
    }
    // 电子口岸的数据引入
    if (btn.name == 'payment_electronic_export') {
        let ksrq = await _.ui.show_input_date_dialog('请输入日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!ksrq) {
            return;
        }
        let bcbh = await _.ui.show_input_dialog('请输入申报批次', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return '001'
            }
            return res
        })
        if (!bcbh) {
            return;
        }
        _.ui.show_upload_dialog({
                title: '请选择要上传的文件',
                url: '/api/saier/payment/electronic_export',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '文件上传成功',
                error_msg: '文件上传失败',
                params: {
                    ksrq: ksrq,
                    bcbh: bcbh
                }
            },
            (res) => {
                if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                    _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
    }
    // 外贸企业出口退税进货明细
    if (btn.name == 'payment_refund_tax_export') {
        _.ui.show_upload_dialog({
                title: '请选择要上传的文件',
                url: '/api/saier/payment/refund_tax_export',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '文件上传成功',
                error_msg: '文件上传失败',
            },
            (res) => {
                if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                    _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
    }
    // 报关金额金蝶编号查看
    if (btn.name == 'payment_amount_query') {
        let ksrq = await _.ui.show_input_date_dialog('请输入查询起始日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!ksrq) {
            return;
        }
        let jsrq = await _.ui.show_input_date_dialog('请输入查询结束日期(格式2010-01-18)', new Date().format('yyyy-MM-dd')).then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!jsrq) {
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', new Date().format('yyyy-MM-dd')).then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!cxrq) {
            return;
        }
        let res = await _.http.post('/api/saier/payment/amount_query/check', {
            ksrq: ksrq,
            jsrq: jsrq,
            cxrq: cxrq
        }).then(res => {
            return res;
        }).catch(err => {
            console.error(err);
            return err;
        });
        if (!res || Number(res.code) !== 1) {
            _.ui.message.error((res && res.msg) || '查询失败');
            return
        }
        let data = res.data || {};
        let wstts = data.company || [];
        let wstt = await _.ui.show_input_select_dialog('请输入或选择我司抬头', '', wstts).then(res => {
            if (res === undefined || res === null || res === '') {
                return False
            }
            return res
        })
        if (!wstt) {
            return;
        }
        _.http.post('/api/saier/payment/amount_query', {
            ksrq: ksrq,
            jsrq: jsrq,
            cxrq: cxrq,
            wstt: wstt
        }).then(res => {
            let d = res.data || '';
            if (!d || d == '' || d == null) {
                _.ui.message.error('没有需要导出的数据');
                return
            }
            _.ui.message.success('正在下载文件，请稍候...');
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(res => {
            _.ui.message.error(res.msg);
        });
    }
    // 风控供应商
    if (btn.name == 'payment_risk_supplier_export') {
        let ksrq = await _.ui.show_input_date_dialog('请输入查询起始日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('2025-01-01');
            }
            return res
        })
        if (!ksrq) {
            return;
        }
        let jsrq = await _.ui.show_input_date_dialog('请输入查询结束日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!jsrq) {
            return;
        }
        let jlsl = await _.ui.show_input_number_dialog('请输入要查询条数', 20).then(res => {
            if (res === undefined || res === null || res === '') {
                return 20;
            }
            return res
        })
        if (jlsl == undefined || jlsl == null) {
            return;
        }
        _.http.post('/api/saier/payment/risk_supplier_export', {
            ksrq: ksrq,
            jsrq: jsrq,
            jlsl: jlsl
        }).then(res => {
            let d = res.data || '';
            if (!d || d == '' || d == null) {
                _.ui.message.error('没有需要导出的数据');
                return
            }
            _.ui.message.success('正在下载文件，请稍候...');
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(res => {
            _.ui.message.error(res.msg);
        });
    }
    // 签收单批量导出
    if (btn.name == 'payment_receipt_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.show_input_dialog('请输入公司名称', '').then((gsmc) => {
            _.http.post("/api/saier/payment/receipt/update", {
                rids: rids,
                gsmc: gsmc
            }).then(res => {
                _.platform.print_report({
                    report_name: '签收单1',
                    rid: form.current_rid.value,
                    rids: rids.join(','),
                    kind: 0
                })
                //     let filename = res.data || {};
                //     _.http.download('/api/tmp/file/get', {
                //         file: filename 
                //     }, filename);
                //     _.ui.message.success(res.msg);
                // }).catch(res => {
                //     _.ui.message.error(res.msg);
                //     console.log(res);
            })
        })
    }
    // 签收单批量导出1
    if (btn.name == 'payment_receipt1_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.ui.show_input_dialog('请输入公司名称', '').then((gsmc) => {
            _.http.post("/api/saier/payment/receipt/update", {
                rids: rids,
                gsmc: gsmc
            }).then(res => {
                _.platform.print_report({
                    report_name: '签收单1',
                    rid: form.current_rid.value,
                    rids: rids.join(','),
                    kind: 0
                })
                //     let filename = res.data || {};
                //     _.http.download('/api/tmp/file/get', {
                //         file: filename 
                //     }, filename);
                //     _.ui.message.success(res.msg);
                // }).catch(res => {
                //     _.ui.message.error(res.msg);
                //     console.log(res);
            })
        })
    }
    // 换单号导出
    if (btn.name == 'payment_change_no_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/change_no", {
            rids: rids
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 换单收条打印
    if (btn.name == 'payment_change_receipt_btn') {
        // let rids = form.current_rids.value;
        // if (rids.length == 0) {
        //     if (form.current_rid.value) {
        //         rids = [form.current_rid.value];
        //     }
        // }
        // if (rids.length == 0) {
        //     _.ui.message.error('请至少选择一条记录进行操作');
        //     return;
        // }
        let fkzb = await _.ui.show_input_select_dialog('请输入组别,A,B....', '', ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']).then((value) => {
            if (value === undefined || value === null || value.trim() === '') {
                return null;
            }
            return value.trim()
        })
        if (!fkzb) {
            return;
        }
        _.http.post("/api/saier/payment/change_receipt", {
            rid: form.current_rid.value,
            fkzb: fkzb
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 金蝶付货款
    if (btn.name == 'payment_kingdee_payment_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', '').then((value) => {
            if (value === undefined || value === null) {
                return null;
            }
            return value
        })
        if (!cxrq) {
            return;
        }
        _.http.post("/api/saier/payment/kingdee_payment", {
            rids: rids,
            cxrq: cxrq
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 批量付款核对
    if (btn.name == 'payment_batch_audit_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        let position = check.data
        let kind = await _.ui.show_input_select_dialog('请选择付款方式', '开票', ['开票', '现金']).then((value) => {
            if (value === undefined || value === null || value.trim() === '') {
                return '开票';
            }
            return value
        }).catch(err => {
            console.error('付款方式选择失败', err);
            return null;
        })
        if (!kind) {
            return;
        }
        let jzrq = await _.ui.show_input_date_dialog('请选择截止日期默认', new Date().format('yyyy-MM-dd')).then((value) => {
            if (value === undefined || value === null || value.trim() === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return value
        })
        if (!jzrq) {
            return;
        }
        _.http.post("/api/saier/payment/batch_audit", {
            position: position,
            rids: rids,
            kind: kind,
            jzrq: jzrq
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    // 金蝶合同入账
    if (btn.name == 'payment_kingdee_contract_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', '').then((value) => {
            if (value === undefined || value === null) {
                return null;
            }
            return value
        })
        if (!cxrq) {
            return;
        }
        _.http.post("/api/saier/payment/kingdee_contract", {
            rids: rids,
            cxrq: cxrq
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    // 金蝶合同结转
    if (btn.name == 'payment_kingdee_close_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', '').then((value) => {
            if (value === undefined || value === null) {
                return null;
            }
            return value
        })
        if (!cxrq) {
            return;
        }
        _.http.post("/api/saier/payment/kingdee_close", {
            rids: rids,
            cxrq: cxrq
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 现金导入(详细)
    if (btn.name == 'payment_update_cash_btn') {
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        let roles = check.data || [];
        console.log('权限校验结果11 ', check);
        _.ui.show_upload_dialog({
                title: '请选择要上传的文件',
                url: '/api/saier/payment/update_cash',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '文件上传成功',
                error_msg: '文件上传失败',
                params: {
                    'module': form.module.name,
                    'roles': roles.join(',')
                }
            },
            (res) => {
                if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                    _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
    }

    // 导入发票
    if (btn.name == 'payment_update_invoice_btn') {
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        // let roles = check.data || [];
        // console.log('权限校验结果11 ', check);
        _.ui.show_upload_dialog({
                title: '请选择要上传的文件',
                url: '/api/saier/payment/update_invoice',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '文件上传成功',
                error_msg: '文件上传失败',
                params: {
                    'module': form.module.name,
                    // 'roles': roles.join(',')
                }
            },
            (res) => {
                if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                    _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
    }

    // 销售帐入帐清单(优胜)
    if (btn.name == 'payment_account_list_btn') {
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        let kind = await _.ui.show_input_select_dialog('请选择类型', '当前选中记录', ['当前选中记录', 'Excel引入']).then((value) => {
            if (value === undefined || value === null || value.trim() === '') {
                return '当前选中记录';
            }
            return value
        }).catch(err => {
            console.error('类型选择失败', err);
            return null;
        })
        if (!kind) {
            return;
        }
        if (kind == '当前选中记录') {
            let rids = form.current_rids.value;
            if (rids.length == 0) {
                if (form.current_rid.value) {
                    rids = [form.current_rid.value];
                }
            }
            if (rids.length == 0) {
                _.ui.message.error('请至少选择一条记录进行操作');
                return;
            }
            _.http.post("/api/saier/payment/account_list_rids", {
                rids: rids
            }).then(res => {
                let filename = res.data || {};
                _.http.download('/api/tmp/file/get', {
                    file: filename
                }, filename);
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        } else {
            _.ui.show_upload_dialog({
                    title: '请选择要上传的文件',
                    url: '/api/saier/payment/account_list_excel',
                    accept: '.xlsx',
                    auto_close: true,
                    success_msg: '文件上传成功',
                    error_msg: '文件上传失败'
                },
                (res) => {
                    if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                        _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                        _.http.download('/api/tmp/file/get', {
                            file: res.data
                        }, res.data)
                    }
                })
        }
    }


    // 宁波新金蝶入账new
    if (btn.name == 'payment_voucher_api_btn') {
        let ksrq = await _.ui.show_input_date_dialog('请输入查询起始日期(格式2010-01-18)', '').then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!ksrq) {
            return;
        }
        let jsrq = await _.ui.show_input_date_dialog('请输入查询结束日期(格式2010-01-18)', new Date().format('yyyy-MM-dd')).then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!jsrq) {
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', new Date().format('yyyy-MM-dd')).then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!cxrq) {
            return;
        }
        let res = await _.http.post('/api/saier/payment/amount_query/check', {
            ksrq: ksrq,
            jsrq: jsrq,
            cxrq: cxrq,
        }).then(res => {
            return res;
        }).catch(err => {
            console.error(err);
            return err;
        });
        if (!res || Number(res.code) !== 1) {
            _.ui.message.error((res && res.msg) || '查询失败');
            return
        }
        let data = res.data || {};
        let wstts = data.company || [];
        let position = data.position || '';
        let wstt = await _.ui.show_input_select_dialog('请输入或选择我司抬头', '', wstts).then(res => {
            if (res === undefined || res === null || res === '') {
                return False
            }
            return res
        })
        if (!wstt) {
            return;
        }
        _.http.post("/api/saier/payment/voucher_api", {
            ksrq: ksrq,
            jsrq: jsrq,
            cxrq: cxrq,
            wstt: wstt,
            position: position
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    // 宁波新金蝶入账
    if (btn.name == 'payment_voucher_excel_btn') {
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        let cxrq = await _.ui.show_input_date_dialog('请输入统计月份', new Date().format('yyyy-MM-dd')).then(res => {
            if (res === undefined || res === null || res === '') {
                return new Date().format('yyyy-MM-dd');
            }
            return res
        })
        if (!cxrq) {
            return;
        }
        let kind = await _.ui.show_input_select_dialog('是否零退税', '否', ['否', '是']).then((value) => {
            if (value === undefined || value === null || value.trim() === '') {
                return '当前选中记录';
            }
            return value
        }).catch(err => {
            console.error('类型选择失败', err);
            return null;
        })
        if (!kind) {
            return;
        }

        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/voucher_excel", {
            rids: rids,
            cxrq: cxrq,
            kind: kind
        }).then(res => {
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename);
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    // 宁波批量付款回导
    if (btn.name == 'payment_update_paied_btn') {
        let check = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
            position: '财务'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('权限校验失败', err);
            return err;
        });
        console.log('权限校验结果00 ', check);
        if (Number(check.code) !== 1) {
            _.ui.message.error((check.msg) || '检查失败');
            return;
        }
        let roles = check.data || [];
        console.log('权限校验结果11 ', check);
        _.ui.show_upload_dialog({
                title: '请选择要上传的文件',
                url: '/api/saier/payment/update_paid',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '文件上传成功',
                error_msg: '文件上传失败',
                params: {
                    'module': form.module.name,
                    'roles': roles.join(',')
                }
            },
            (res) => {
                if (res && res.code == 0 && res.data && res.data != '' && res.data != null) {
                    _.ui.message.success('文件上传成功，正在处理数据，请稍候...');
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
    }


    // 付款资料导出txt
    if (btn.name == 'payment_export_txt_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        const hh = await _.ui.show_input_dialog('请输入付款联行号', '')
        if (!hh) {
            return;
        }
        const jg = await _.ui.show_input_dialog('请输入付款机构号', '');
        if (!jg) {
            return;
        }
        const zh = await _.ui.show_input_dialog('请输入付款账号', '');
        if (!zh) {
            return;
        }
        _.http.post("/api/saier/payment/export/txt", {
            rids: rids,
            hh: hh,
            jg: jg,
            zh: zh
        }).then(res => {
            _.ui.message.success(res.msg);
            let filename = res.data || {};
            _.http.download('/api/tmp/file/get', {
                file: filename
            }, filename).then(() => {
                _.ui.message.success('文件下载成功');
            }).catch(err => {
                _.ui.message.error('文件下载失败');
                console.error(err);
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 标记导出日期
    if (btn.name == 'payment_update_date_flag') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/update/date_flag", {
            rids: rids
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 付款日期批量更改
    if (btn.name == 'payment_update_payment_date') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        let date = await _.ui.show_input_date_dialog('请输入付款日期(格式如2010-01-18)', '')
        if (!date || date == '' || date == null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            _.ui.message.error('请输入正确的日期格式');
            return;
        }

        _.http.post("/api/saier/payment/update/payment_date", {
            rids: rids,
            date: date
        }).then(res => {
            let d = res.data;
            if (d && d != '' && d != null) {
                _.http.download('/api/tmp/file/get', {
                    file: d
                }, d).then(() => {
                    _.ui.message.success('文件下载成功');
                }).catch(err => {
                    _.ui.message.error('文件下载失败');
                    console.error(err);
                });
            } else {
                _.ui.message.success(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 日期批量小写
    if (btn.name == 'payment_update_date_lower') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/update/date_lower", {
            rids: rids
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 当前现金审核
    if (btn.name == 'payment_amount_audit_btn') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/amount_audit", {
            rids: rids
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    // 批量更新开票资料已到
    if (btn.name == 'batch_update_invoice_flag') {
        let rids = form.current_rids.value;
        if (rids.length == 0) {
            if (form.current_rid.value) {
                rids = [form.current_rid.value];
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录进行操作');
            return;
        }
        _.http.post("/api/saier/payment/batch/update/invoice_flag", {
            rids: rids
        }).then(res => {
            _.ui.message.success(res.msg);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    if (btn.name == 'purchase_payment_accounting_export_btn') {
        const rids = getSelectedRids(form)
        if (rids.length === 0) {
            _.ui.message.error('请先选择要导出的记录!')
            return
        }
        await _.http.post('/api/saier/purchase_payment/accounting/export', {
            rids: rids,
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
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], paymentButtonClick, '采购付款');


const payment_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/payment/save/before', {
            main: recordset.tables['采购付款'].view_data,
            lines: recordset.tables['详细用途'].view_data
        }).then(res => {
            let d = res.data || {};
            let cxbg = d.cxbg || '不需要';
            let position = d.position || '';
            let path = d.path || '';
            let jsrbm = d.jsrbm || '';
            let ywdq = d.ywdq || '';
            flag = 0
            let fkje = recordset.val('付款金额');
            let fpje = recordset.val('发票金额');
            let hyyf = 0;
            let fkrq = recordset.val('付款日期');
            let x = recordset.tables['换单详情'];
            if (recordset.val('换 单 号') != '') {
                for (let r of x.view_data) {
                    if (r.hdh == recordset.val('换 单 号')) {
                        flag = 1;
                        break;
                    }
                }
                if (flag == 0) {
                    x.append();
                    let r = x.view_data[x.view_data.length - 1];
                    recordset.val('换单详情.付款日期', fkrq, r);
                    recordset.val('换单详情.付款金额', fkje, r);
                    recordset.val('换单详情.换 单 号', recordset.val('换 单 号'), r);
                }
            }
            x = recordset.tables['详细用途'];
            for (let r of x.view_data) {
                recordset.val('详细用途.付款日期', fkrq, r);
                recordset.val('详细用途.发票号码', recordset.val('外销发票'), r);
                if (recordset.value('详细用途.合同预付', r) > 0) {
                    recordset.val('详细用途.付款币种', recordset.val('付款币种'), r);
                    recordset.val('详细用途.预计付款', recordset.val('预计付款'), r);
                }
            }
            if (x.view_data.length == 0) {
                recordset.tables['详细用途'].append();
                let r = x.view_data[x.view_data.length - 1];
                recordset.val('详细用途.发票号码', recordset.val('外销发票'), r);
                recordset.val('详细用途.应付金额', recordset.val('发票金额'), r);
                recordset.val('详细用途.付款金额', recordset.val('发票金额'), r);
                recordset.val('详细用途.增值税率', recordset.val('增值税率'), r);
                recordset.val('详细用途.退 税 率', recordset.val('退税率(%)'), r);
                recordset.val('详细用途.生产厂家', recordset.val('出货工厂'), r);
                recordset.val('详细用途.发票为空', recordset.val('发票为空'), r);
                recordset.val('详细用途.付款地区', recordset.val('付款地区'), r);
                recordset.val('详细用途.付款抬头', recordset.val('我司抬头'), r);
                recordset.val('详细用途.付款币种', recordset.val('付款币种'), r);
                recordset.val('详细用途.采购合同', recordset.val('采购合同'), r);
                recordset.val('详细用途.经手人员', recordset.val('经手人名'), r);
            }

            if (recordset.val('付款金额') > 0 && recordset.val('付款金额') >= 0) {
                let what = recordset.val('付款金额');
                let yhje = String(recordset.val('付款金额'));
                let mw = yhje.substring(yhje.length - 1, 1);
                if (mw == '0') {
                    let result = ArabiaToChinese(what, true) + '整';
                    recordset.val('付款大写', result);
                } else {
                    let result = ArabiaToChinese(what, true);
                    recordset.val('付款大写', result);
                }
            }

            if (recordset.val('发票为空') == '是') {
                if (recordset.val('不开票金额') <= 0) {
                    hyyf = recordset.val('付款合计');
                    recordset.val('不开票金额', hyyf);
                }
            }
            if (recordset.val('合同金额') <= 0) {
                hyyf1 = recordset.val('应付合计');
                if (hyyf1 <= 0) {
                    hyyf1 = recordset.val('发票金额');
                }
                recordset.val('合同金额', hyyf1);
            }
            // tj = recordset.val('修改清单');
            // fkxh = recordset.val('付款序号');
            // fk = recordset.val('付款金额');
            // fkrq = recordset.val('付款日期');
            // gc = recordset.val('生产厂家');
            // yh = recordset.val('开户银行');
            // zh = recordset.val('银行帐号');
            // bz = recordset.val('备注说明');
            // hdh = recordset.val('换 单 号');
            // recordset.val('修改清单', tj + '\n' + IApplication.LoginInfo.userinfo.name + formatdatetime('yyyy-mm-dd hh:mm:ss', now) + ';' + fk + ';' + fkrq + ';' + gc + '合同收回:' + recordset.val('合同收回') + ';是否结清:' + recordset.val('是否结清'));
            // recordset.val('修改人员', IApplication.LoginInfo.userinfo.Name);
            recordset.val('生产厂家', recordset.val('生产厂家').trim());
            recordset.val('出货工厂', recordset.val('出货工厂').trim());
            if (d.errors && d.errors.length > 0) {
                recordset.val('预付末清清单', d.errors.join('\n'));
            }
            if (recordset.val('工厂发票') == '') {
                let wxfp = recordset.val('外销发票');
                let cght = recordset.val('采购合同');
                let gcmc1 = recordset.val('出货工厂');
                let bm = new Date().format('yyyy-MM-dd hh:mm:ss');
                let xm = _.user.username;
                if (recordset.val('发票代码') == '') {
                    recordset.val('发票代码', xm + bm);
                }
                if (recordset.val('发票验证') == '') {
                    recordset.val('发票验证', wxfp + '\\' + cght + '\\' + gcmc1);
                }
            }
            if (recordset.val('工厂发票') != '') {
                if (recordset.val('发票验证') == '') {
                    let bm = recordset.val('工厂发票');
                    let xm = recordset.val('发票代码');
                    recordset.val('发票验证', xm + '-' + bm);
                }
            }
            if (recordset.val('提前付款') == '是') {
                if (recordset.val('出货日期') != '' && recordset.val('出货日期') != null) {
                    let days = d.days || 0;
                    let chrq = recordset.val('出货日期');
                    recordset.val('正式付款日期', _addDaysDate(chrq, days));
                } else {
                    recordset.val('正式付款日期', '2100-12-31');
                }
            }
            let hyyf1 = recordset.val('付款备注');
            let hyyf2 = recordset.val('付款金额');
            if (hyyf1 !== hyyf2) {
                recordset.val('付款备注', hyyf2);
            }
            let fkrq1 = recordset.val('付款日期比较');
            if (hyyf1 === hyyf2) {
                if (fkrq1 !== fkrq) {
                    if (fkrq !== '') {
                        recordset.val('付款备注', hyyf2);
                    }
                }
            }
            if (recordset.val('付款日期') != '' && recordset.val('付款日期') != null && fkje > 0) {
                let x = recordset.tables['付款详情'];
                let i = 0;
                let i1 = 0;
                let i2 = 0;
                let fkje1 = '';
                let fkrq2 = '';
                for (let r of x.view_data) {
                    i1 = i1 + 1;
                    fkje1 = recordset.value('付款详情.付款金额', r);
                    fkrq2 = recordset.value('付款详情.付款日期', r);
                    if (fkje1 != fkje || fkrq2 != fkrq) {
                        i = i + 1;
                    }
                    if (fkje1 == fkje && fkrq2 === fkrq) {
                        i2 = i2 + 1;
                    }
                }
                if (i2 == 0 && (i > 0 || i1 == 0) && fkrq != '' && fkrq != null && fkje > 0) {
                    if (recordset.val('工厂发票') == '' && recordset.val('付款日期') != '' && recordset.val('付款日期') != null && recordset.val('付款金额') > 0 && recordset.val('付款序号') == '') {
                        recordset.val('付款序号', d.fkxh || '');
                    }
                    x.append().then(() => {
                        let r = x.view_data[x.view_data.length - 1];
                        recordset.val('付款详情.付款金额', fkje, r);
                        recordset.val('付款详情.付款日期', fkrq, r);
                        recordset.val('付款详情.付款序号', recordset.val('付款序号'), r);
                        recordset.val('付款详情.操作人员', _.user.username, r);
                        recordset.val('付款详情.换 单 号', recordset.val('换 单 号'), r);
                        recordset.val('付款详情.经手人员部门', recordset.val('经手人员部门'), r);
                        recordset.val('付款详情.经手人名', recordset.val('经手人名'), r);
                    })
                }
                recordset.val('付款日期比较', fkrq);
                recordset.val('付款识别', '是');
            }
            if (recordset.val('付款日期') == '' || recordset.val('付款日期') == null) {
                recordset.val('付款日期比较', fkrq);
                recordset.val('付款识别', '否');
            }
            if (hyyf2 <= 0) {
                recordset.val('付款金额', 0);
            }
            x = recordset.tables['付款详情'];
            for (let r of x.view_data) {
                hyyf = hyyf + recordset.value('付款详情.付款金额', r);
            }
            recordset.val('付款合计', hyyf);
            if (fpje > 0) {
                if (hyyf > fpje) {
                    _.ui.message.error('请注意,付款合计大于发票金额!');
                }
            }
            let mlsb = ''
            let fkhj = recordset.val('付款合计');
            let yfhj = recordset.val('应付合计');
            let fkce = yfhj - fkhj;
            let fkce1 = yfhj - (Math.floor(yfhj / 10) * 10);
            if (fkhj !== yfhj && fkce < 10 && recordset.val('发票为空') === '是') {
                mlsb = '是';
            } else {
                if (fkhj == yfhj && fkce1 > 0 && recordset.val('发票为空') === '是') {
                    mlsb = '否';
                }
            }
            if (recordset.val('经手人员部门') == '' && recordset.val('经手人名') != '' && jsrbm != null) {
                recordset.val('经手人员部门', jsrbm);
            }
            if (position.indexOf('义乌') != -1) {
                recordset.val('付款地区', '义乌');
            }
            if (path != '') {
                recordset.val('所属部门', path);
            }
            recordset.val('唯一字段', recordset.val('rid'))
            recordset.val('识别', recordset.val('rid'))
            recordset.val('诚信报告', cxbg);
            if (recordset.val('业务发票') == '') {
                recordset.val('业务发票', recordset.val('外销发票'));
            }
            if (recordset.val('原发票号') == '') {
                recordset.val('原发票号', recordset.val('外销发票'));
                recordset.val('原核算发票', recordset.val('业务发票'));
            }
            let wk = '是';
            let wy = '否';
            if (recordset.val('预约支付') == '') {
                recordset.val('预约支付', '非预约');
            }
            if (recordset.val('工厂发票') == '') {
                recordset.val('发票为空', '是');
            }
            if (recordset.val('工厂发票') != '') {
                recordset.val('发票为空', '否');
            }
            if (ywdq != '' && ywdq != null) {
                recordset.val('业务地区', ywdq);
            }
            let msg = d.msg || '';
            if (msg != '') {
                _.ui.message.warning(msg);
            }
            if (recordset.val('付款差额') < 0) {
                _.ui.message.error('付款差额为负请核对!付款差额=合同金额-付款合计-赔款.');
            }
            if (recordset.val('是否结清') == '是') {
                if (recordset.val('付款金额') <= 0 && recordset.val('付款合计') <= 0) {
                    _.ui.message.error('付款金额和付款合计皆<=0,是否确定结清');
                }
                if (recordset.val('是否暂扣') == '是') {
                    _.ui.message.error('请注意备注信息里是否暂扣为是不能结清');
                    recordset.val('是否结清', '否');
                }
            }
            let pk = recordset.val('赔款');
            if (pk > 0) {
                _.ui.message.error('该合同有赔款，请注意！');
            }
            let b1 = recordset.val('发函税号');
            if (b1 != '' && b1 != null) {
                _.ui.message.error('该生产厂家要发函确认，请注意！');
            }

            recordset.val('银行申请状态1', '');
            resolve();
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.error(err);
            reject();
        });
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, payment_before_save, '采购付款')


// 编辑界面数据加载以后执行
const payment_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    recordset.module.group_by_name('查看人员').visible = false
    recordset.module.field_by_full_name(m + '.修改清单').hide();
    if (username == 'zjnblh') {
        recordset.module.group_by_name('查看人员').visible = true
        recordset.module.field_by_full_name(m + '.修改清单').show();
    }
    if (recordset.val('银行申请状态') != '' && recordset.val('银行申请状态') != '无') {
        recordset.module.field_by_full_name(m + '.银行申请状态').disabled = true;
    }
    let t = recordset.tables['详细用途'];
    let v = t.view_data;
    let zsl = 0;
    let xshj = 0;
    let kkje = 0;
    for (let r of v) {
        let sl = r.zsl || 0;
        let xs = r.xs || 0;
        let kk = r.kkje || 0;
        zsl = zsl + sl;
        xshj = xshj + xs;
        kkje = kkje + kk;
    }
    recordset.val('总数量', zsl);
    recordset.val('箱数合计', xshj);
    recordset.val('扣款金额', kkje);
    recordset.module.field_by_full_name(m + '.返 结 清').disabled = true;
    if (recordset.val('业务确认') == '通过') {
        recordset.module.field_by_full_name(m + '.业务经理').disabled = true;
    }
    if (recordset.val('提交业务') != '') {
        recordset.module.field_by_full_name(m + '.提交业务').disabled = true;
    }
    _.http.post('/api/saier/payment/load/check', {
        module: m
    }).then(res => {
        let d = res.data || {};
        let cwsb = d.cwsb || 0;
        let htsh = d.htsh || '';
        let position = d.position || '';
        let rid = recordset.val('rid');
        let fkdq = recordset.val('付款地区');
        if (cwsb == 1) {
            recordset.module.field_by_full_name(m + '.返 结 清').disabled = false;
        }
        if (htsh == '' || htsh == null) {
            recordset.module.field_by_full_name(m + '.返 结 清').hide();
        }
        if (position.indexOf('义乌') != -1) {
            if (fkdq == '') {
                recordset.val('付款地区', '义乌');
            }
            recordset.module.field_by_full_name(m + '.银行汇率').show();
            recordset.module.field_by_full_name(m + '.合同金额$').show();
            recordset.module.field_by_full_name(m + '.付款序号').show();
            recordset.module.field_by_full_name(m + '.签收单号').show();
            recordset.module.field_by_full_name(m + '.返 结 清').disabled = true;
            if (fkdq == '宁波') {
                recordset.module.field_by_full_name(m + '.发票代码').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂发票').disabled = true;
                recordset.module.field_by_full_name(m + '.预付单号').disabled = true;
                recordset.module.field_by_full_name(m + '.采购合同').disabled = true;
                recordset.module.field_by_full_name(m + '.出货日期').disabled = true;
                recordset.module.field_by_full_name(m + '.增值税率').disabled = true;
                recordset.module.field_by_full_name(m + '.退税率(%)').disabled = true;
                recordset.module.field_by_full_name(m + '.付款日期').disabled = true;
                recordset.module.field_by_full_name(m + '.付款币种').disabled = true;
                recordset.module.field_by_full_name(m + '.付款金额').disabled = true;
                recordset.module.field_by_full_name(m + '.合同金额').disabled = true;
                recordset.module.field_by_full_name(m + '.不含税价').disabled = true;
                recordset.module.field_by_full_name(m + '.发票金额').disabled = true;
                recordset.module.field_by_full_name(m + '.不开票金额').disabled = true;
                recordset.module.field_by_full_name(m + '.税    额').disabled = true;
                recordset.module.field_by_full_name(m + '.退 税 额').disabled = true;
                recordset.module.field_by_full_name(m + '.经手人名').disabled = true;
                recordset.module.field_by_full_name(m + '.税   号').disabled = true;
                recordset.module.field_by_full_name(m + '.应付合计').disabled = true;
                recordset.module.field_by_full_name(m + '.所在省份').disabled = true;
                recordset.module.field_by_full_name(m + '.所在城市').disabled = true;
                recordset.module.field_by_full_name(m + '.用途').disabled = true;
                recordset.module.field_by_full_name(m + '.赔款').disabled = true;
                recordset.module.field_by_full_name(m + '.付款差额').disabled = true;
                recordset.module.field_by_full_name(m + '.客户').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂电话').disabled = true;
                if (cwsb != 1) {
                    recordset.module.field_by_full_name(m + '.代').disabled = true;
                    recordset.module.field_by_full_name(m + '.返').disabled = true;
                    recordset.module.field_by_full_name(m + '.返 日 期').disabled = true;
                    recordset.module.field_by_full_name(m + '.确认备注').disabled = true;
                } else {
                    if (recordset.val('返 结 清') == '是') {
                        recordset.module.field_by_full_name(m + '.代').disabled = true;
                        recordset.module.field_by_full_name(m + '.返').disabled = true;
                        recordset.module.field_by_full_name(m + '.返 日 期').disabled = true;
                        recordset.module.field_by_full_name(m + '.确认备注').disabled = true;
                    }
                }
                recordset.module.field_by_full_name(m + '.更换财务').disabled = true;
                recordset.module.field_by_full_name(m + '.发票为空').disabled = true;
                recordset.module.field_by_full_name(m + '.是否结清').disabled = true;
                recordset.module.field_by_full_name(m + '.付款审核').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂编号').disabled = true;
                recordset.module.field_by_full_name(m + '.付款序号').disabled = true;
                recordset.module.field_by_full_name(m + '.银行汇率').disabled = true;
                recordset.module.field_by_full_name(m + '.合同金额$').disabled = true;
                recordset.module.field_by_full_name(m + '.银行标记').disabled = true;
                recordset.module.field_by_full_name(m + '.提前付款').disabled = true;
                recordset.module.field_by_full_name(m + '.审请日期').disabled = true;
                recordset.module.field_by_full_name(m + '.申请金额').disabled = true;
                recordset.module.field_by_full_name(m + '.扣款合计').disabled = true;
                recordset.module.field_by_full_name(m + '.发函税号').disabled = true;
                recordset.module.field_by_full_name(m + '.是否代理').disabled = true;
                recordset.module.field_by_full_name(m + '.付款合并').disabled = true;
                recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
                recordset.module.field_by_full_name(m + '.业务人员').disabled = true;
                recordset.module.field_by_full_name(m + '.中文品名').disabled = true;
                recordset.module.field_by_full_name(m + '.我司抬头').disabled = true;
            } else {
                recordset.module.group_by_name('查看人员').visible = false;
            }
        } else {
            if (fkdq == '') {
                recordset.val('付款地区', '宁波');
            }
            recordset.module.field_by_full_name(m + '.银行汇率').hide();
            recordset.module.field_by_full_name(m + '.合同金额$').hide();
            recordset.module.field_by_full_name(m + '.付款序号').hide();
            recordset.module.field_by_full_name(m + '.签收单号').hide();
            if (d == '义乌') {
                recordset.module.field_by_full_name(m + '.发票代码').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂发票').disabled = true;
                recordset.module.field_by_full_name(m + '.预付单号').disabled = true;
                recordset.module.field_by_full_name(m + '.采购合同').disabled = true;
                recordset.module.field_by_full_name(m + '.出货日期').disabled = true;
                recordset.module.field_by_full_name(m + '.增值税率').disabled = true;
                recordset.module.field_by_full_name(m + '.退税率(%)').disabled = true;
                recordset.module.field_by_full_name(m + '.付款日期').disabled = true;
                recordset.module.field_by_full_name(m + '.付款币种').disabled = true;
                recordset.module.field_by_full_name(m + '.付款金额').disabled = true;
                recordset.module.field_by_full_name(m + '.合同金额').disabled = true;
                recordset.module.field_by_full_name(m + '.不含税价').disabled = true;
                recordset.module.field_by_full_name(m + '.发票金额').disabled = true;
                recordset.module.field_by_full_name(m + '.不开票金额').disabled = true;
                recordset.module.field_by_full_name(m + '.税    额').disabled = true;
                recordset.module.field_by_full_name(m + '.退 税 额').disabled = true;
                recordset.module.field_by_full_name(m + '.经手人名').disabled = true;
                recordset.module.field_by_full_name(m + '.税   号').disabled = true;
                recordset.module.field_by_full_name(m + '.所在省份').disabled = true;
                recordset.module.field_by_full_name(m + '.所在城市').disabled = true;
                recordset.module.field_by_full_name(m + '.用途').disabled = true;
                recordset.module.field_by_full_name(m + '.赔款').disabled = true;
                recordset.module.field_by_full_name(m + '.应付合计').disabled = true;
                recordset.module.field_by_full_name(m + '.付款差额').disabled = true;
                recordset.module.field_by_full_name(m + '.客户').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂电话').disabled = true;
                if (cwsb != 1) {
                    recordset.module.field_by_full_name(m + '.代').disabled = true;
                    recordset.module.field_by_full_name(m + '.返').disabled = true;
                    recordset.module.field_by_full_name(m + '.返 日 期').disabled = true;
                    recordset.module.field_by_full_name(m + '.确认备注').disabled = true;
                } else {
                    if (recordset.val('返 结 清') == '是') {
                        recordset.module.field_by_full_name(m + '.代').disabled = true;
                        recordset.module.field_by_full_name(m + '.返').disabled = true;
                        recordset.module.field_by_full_name(m + '.返 日 期').disabled = true;
                        recordset.module.field_by_full_name(m + '.确认备注').disabled = true;
                    }
                }
                recordset.module.field_by_full_name(m + '.更换财务').disabled = true;
                recordset.module.field_by_full_name(m + '.发票为空').disabled = true;
                recordset.module.field_by_full_name(m + '.是否结清').disabled = true;
                recordset.module.field_by_full_name(m + '.付款审核').disabled = true;
                recordset.module.field_by_full_name(m + '.工厂编号').disabled = true;
                recordset.module.field_by_full_name(m + '.付款序号').disabled = true;
                recordset.module.field_by_full_name(m + '.银行汇率').disabled = true;
                recordset.module.field_by_full_name(m + '.合同金额$').disabled = true;
                recordset.module.field_by_full_name(m + '.银行标记').disabled = true;
                recordset.module.field_by_full_name(m + '.提前付款').disabled = true;
                recordset.module.field_by_full_name(m + '.审请日期').disabled = true;
                recordset.module.field_by_full_name(m + '.申请金额').disabled = true;
                recordset.module.field_by_full_name(m + '.记录备注').disabled = true;
                recordset.module.field_by_full_name(m + '.扣款合计').disabled = true;
                recordset.module.field_by_full_name(m + '.发函税号').disabled = true;
                recordset.module.field_by_full_name(m + '.是否代理').disabled = true;
                recordset.module.field_by_full_name(m + '.付款合并').disabled = true;
                recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
                recordset.module.field_by_full_name(m + '.业务人员').disabled = true;
                recordset.module.field_by_full_name(m + '.中文品名').disabled = true;
                recordset.module.field_by_full_name(m + '.我司抬头').disabled = true;
            } else {
                recordset.module.group_by_name('查看人员').visible = true;
            }
        }
        recordset.refresh_ui(true)
    }).catch(err => {
        console.error('加载检查失败', err);
        _.ui.message.error((err && err.msg) || '加载检查失败');
    });
}
_.evts.on([_.evtids.RECORD_LOAD], payment_recordLoad, '采购付款')