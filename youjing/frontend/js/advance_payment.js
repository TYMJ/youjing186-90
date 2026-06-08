// 预付货款导出（来源：/需求文件/oldCode.groovy）

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

// 查询界面按钮：增加“预付货款导出”
const advancePaymentButtonShow = (evt_id, form) => {
    const btns = [{
        name: 'advance_payment_export_btn',
        caption: '预付货款导出',
        icon: 'any-keyborad'
    }];

    btns.push({
        name: 'advance_payment_sync_payment_date_parts',
        caption: '付款日期拆分同步',
        icon: 'any-keyborad'
    });

    btns.push({
        name: 'advance_payment_batch_settlement',
        caption: '批量结清',
        icon: 'any-keyborad'
    });
    btns.push({
        name: 'advance_payment_batch_bank_apply',
        caption: '批量银行提交',
        icon: 'any-keyborad'
    });
    
    btns.push({
        name: 'advance_payment_batch_update_excel',
        caption: '批量预付款回导',
        icon: 'any-keyborad'
    });
    btns.push({
        name: 'advance_payment_batch_export_excel',
        caption: '批量付款批次信息导出',
        icon: 'any-keyborad'
    });
    btns.push({
        name: 'advance_payment_batch_update_payment',
        caption: '付款批次回导',
        icon: 'any-keyborad'
    });
    btns.push({
        name: 'advance_payment_prepay_export_excel',
        caption: '预付款/提前付款导出',
        icon: 'any-keyborad'
    });
    btns.push({
        name: 'advance_payment_kingdee_export_excel',
        caption: '金蝶付款(单笔)',
        icon: 'any-keyborad'
    });
    form.toolbar.insert([{
        name: 'advance_payment_ext_btn',
        caption: '扩展',
        icon: '#ext-add_database',
        btns
    }], 'close');
};

_.evts.on([_.evtids.MODULE_SEARCH_SHOW], advancePaymentButtonShow, '预付货款');

// 编辑界面按钮
const advancePaymentEditorShow = (evt_id, form) => {
    const btns = [{
        name: 'bank_apply_status_back_btn',
        caption: '银行申请状态还原',
        icon: 'any-keyborad'
    }];

    form.toolbar.insert([{
        name: 'advance_payment_ext_btn',
        caption: '扩展',
        icon: '#ext-add_database',
        btns
    }], 'close');
};

_.evts.on([_.evtids.MODULE_EDITOR_SHOW], advancePaymentEditorShow, '预付货款');

// 按钮点击：调用后端生成导出文件
const advancePaymentButtonClick = async (evt_id, btn, form) => {
    // 仅处理预付货款导出按钮的点击事件
    if (btn.name === 'advance_payment_export_btn') {
        advanceAwaitPaymentExport(evt_id, btn, form);
    }
    // 日期批量小写
    if (btn.name === 'advance_payment_sync_payment_date_parts') {
        advancePaymentSyncPaymentDatePartsButtonClick(evt_id, btn, form);
    }
    // 批量结清
    if (btn.name === 'advance_payment_batch_settlement') {
        advancePaymentBatchSettlementButtonClick(evt_id, btn, form);
    }
    // 批量银行提交
    if (btn.name === 'advance_payment_batch_bank_apply') {
        advancePaymentBatchBankApplyButtonClick(evt_id, btn, form);
    }
    // 银行申请状态还原
    if (btn.name === 'bank_apply_status_back_btn') {
        advancePaymentBankApplyStatusBackButtonClick(evt_id, btn, form);
    }
    // 批量付款批次信息导出
    if (btn.name === 'advance_payment_batch_export_excel') {
        advancePaymentBatchExportExcel(evt_id, btn, form);
    }
    // 付款批次回导
    if (btn.name === 'advance_payment_batch_update_payment') {
        advancePaymentBatchUpdatePayment(evt_id, btn, form);
    }
    // 批量预付款回导
    if (btn.name === 'advance_payment_batch_update_excel') {
        advancePaymentBatchUpdateExcel(evt_id, btn, form);
    }
    // 金蝶付款（单笔）
    if (btn.name === 'advance_payment_kingdee_export_excel') {
        advancePaymentKingdeeExportExcel(evt_id, btn, form);
    }
    // 优景预付款,提前付款导出
    if (btn.name === 'advance_payment_prepay_export_excel') {
        advancePaymentPrepayExportExcel(evt_id, btn, form);
    }
};

/**
 * 银行申请状态还原
 */
const advancePaymentBankApplyStatusBackButtonClick = async (evt_id, btn, form) => {
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
 * 批量结清
 */
const advancePaymentBatchSettlementButtonClick = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'advance_payment_batch_settlement') {
        return;
    }

    _.ui.show_input_dialog('请输入工厂名称', '').then(async (factoryRet) => {
        const factoryName = factoryRet === undefined || factoryRet === null ? '' : String(factoryRet).trim();
        if (factoryName === '') {
            return;
        }
        _.ui.show_input_dialog('1为当前信息，输2为批量，默认当前', '1').then(async (modeRet) => {
            let mode = modeRet === undefined || modeRet === null ? '1' : String(modeRet).trim();
            if (mode !== '2') {
                mode = '1';
            }
            const rids = getSelectedRids(form);
            const currentRid = (form && form.current_rid && form.current_rid.value) ? String(form.current_rid.value).trim() : '';
            let username = _.user.username;
            const res = await _.http.post('/api/bill/advance_payment/batch_settlement', {
                mode,
                sccj: factoryName,
                current_rid: currentRid,
                rids,
                username
            });
            if (!res || Number(res.code) !== 1) {
                _.ui.message.error((res && res.msg) || '批量结清失败');
                return;
            }
        })


    })
};

/**
 * 批量银行提交
 */
const advancePaymentBatchBankApplyButtonClick = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'advance_payment_batch_bank_apply') {
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
        if (res.data && res.data !=''){
            _.ui.message_box({
                title: '更新提示',
                message: _.vue.h(
                    'pre', {
                        style: 'font-weight:500;line-height:20px',
                    },
                    res.data,
                ),
            })
        } else {
            _.ui.message.success('批量银行提交成功');
        }
    })

};

/**
 * 日期批量小写
 */
const advancePaymentSyncPaymentDatePartsButtonClick = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'advance_payment_sync_payment_date_parts') {
        return;
    }
    const rids = getSelectedRids(form);
    if (!rids.length) {
        _.ui.message.error('请选择需要处理的数据');
        return;
    }

    const recordset = form && form.recordset ? form.recordset : null;
    const formFields = {
        fkrq: recordset ? (recordset.val('fkrq') || '') : ''
    };

    const res = await _.http.post('/api/bill/advance_payment/sync_payment_date_parts', {
        rids,
        form_fields: formFields,
        username: _.user.username
    }).then(r => {
        return r;
    }).catch(e => {
        console.error('日期同步失败', e);
        return e;
    });
    _.ui.message.success((res && res.msg) || '操作失败');
};


// 预付款导出
const advanceAwaitPaymentExport = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'advance_payment_export_btn') {
        return;
    }

    const rids = getSelectedRids(form);
    if (!rids || rids.length === 0) {
        _.ui.message.error('请先选择要导出的记录');
        return;
    }

    const res = await _.http.post('/api/bill/advance_payment/yfhk/export_excel', {
        rids
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

    const fileName = res.data.file_name || '预付货款导出.xlsx';
    const filePath = res.data.file_path || '';
    if (!filePath) {
        _.ui.message.error('导出失败：未返回文件路径');
        return;
    }

    _.http.download('/api/tmp/file/get', {
        file: filePath
    }, fileName);
}
// 批量付款批次信息导出
const advancePaymentBatchExportExcel = async (evt_id, btn, form) => {
    if (!btn || btn.name !== 'advance_payment_batch_export_excel') {
        return;
    }

    const rids = getSelectedRids(form);
    if (!rids || rids.length === 0) {
        _.ui.message.error('请先选择要导出的记录');
        return;
    }

    const res = await _.http.post('/api/advance_payment/batch_export_excel', {
        rids: rids
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

    const fileName = res.data.file_name || '付款批次导出.xlsx';
    const filePath = res.data.file_path || '';
    if (!filePath) {
        _.ui.message.error('导出失败：未返回文件路径');
        return;
    }

    _.http.download('/api/tmp/file/get', {
        file: filePath
    }, fileName);
}

// 付款批次回导
const advancePaymentBatchUpdatePayment = async (evt_id, btn, form) => {
    _.ui.show_upload_dialog({
        title: '付款批次回导',
        url: '/api/advance_payment/batch_update_payment',
        accept: '.xlsx',
        auto_close: true,
        success_msg: '导入成功',
        error_msg: '导入失败',
        params: {'module': form.module.name}
    },
    (res) => {
    })
}

// 批量预付款回导
const advancePaymentBatchUpdateExcel = async (evt_id, btn, form) => {
    _.ui.show_upload_dialog({
        title: '批量预付款回导',
        url: '/api/advance_payment/batch_update_excel',
        accept: '.xlsx',
        auto_close: true,
        success_msg: '导入成功',
        error_msg: '导入失败',
        params: {'module': form.module.name}
    },
    (res) => {
    })
}

// 金蝶付款（单笔）
const advancePaymentKingdeeExportExcel = async (evt_id, btn, form) => {
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


// 优景预付款,提前付款导出
const advancePaymentPrepayExportExcel = async (evt_id, btn, form) => {
    const rids = getSelectedRids(form);
    if (!rids || rids.length === 0) {
        _.ui.message.error('请先选择要导出的记录');
        return;
    }
    let ksrq = await _.ui.show_input_date_dialog('请输入查询起始日期', '');
    if (ksrq === undefined || ksrq === null || String(ksrq).trim() === '') {
        _.ui.message.error('请输入有效的查询起始日期');
        return;
    }
    let jsrq = await _.ui.show_input_date_dialog('请输入查询结束日期', '');
    if (jsrq === undefined || jsrq === null || String(jsrq).trim() === '') {
        _.ui.message.error('请输入有效的查询结束日期');
        return;
    }
    if (ksrq > jsrq) {
        _.ui.message.error('查询起始日期不能晚于结束日期');
        return;
    }
    const res = await _.http.post('/api/advance_payment/prepay_export_excel', {
        ksrq: ksrq,
        jsrq: jsrq
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

    const fileName = res.data.file_name || '预付款导出.xlsx';
    const filePath = res.data.file_path || '';
    if (!filePath) {
        _.ui.message.error('导出失败：未返回文件路径');
        return;
    }

    _.http.download('/api/tmp/file/get', {
        file: filePath
    }, fileName);
}

_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], advancePaymentButtonClick, '预付货款');


// 预付货款-字段改变

// 触发重算的字段（根据业务需求定义）
const TRIGGER_FIELDS = [
    // TODO: 添加需要触发计算的字段名
    // '预付款金额',
    // '实际付款金额',
    // '汇率',
];

// 统一数值转换，避免 NaN 参与计算
const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

// 安全取值：字段不存在时返回空字符串
const getValue = (recordset, fieldName) => {
    try {
        return recordset.val(fieldName);
    } catch (e) {
        return '';
    }
};


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

/**
 * 付款日期字段联动：回填中文年/月/日和数字年/月/日。
 */
const fillPaymentDateFields = (recordset, paymentDate) => {
    const dateText = String(paymentDate || '').slice(0, 10);
    if (!dateText) {
        return;
    }

    const d1 = arabiaToChinese(dateText.slice(0, 1));
    const d2 = arabiaToChinese(dateText.slice(1, 2));
    const d3 = arabiaToChinese(dateText.slice(2, 3));
    const d4 = arabiaToChinese(dateText.slice(3, 4));
    recordset.val('付 款 年', `${d1}${d2}${d3}${d4}`);

    const d5 = arabiaToChinese(dateText.slice(5, 6));
    const d6 = arabiaToChinese(dateText.slice(6, 7));
    const dd5 = dateText.slice(5, 6);
    const dd6 = dateText.slice(6, 7);
    if (dd6 === '0') {
        recordset.val('付 款 月', `零${d5}拾`);
    } else {
        recordset.val('付 款 月', `${d5}拾${d6}`);
    }
    if (dd5 === '0') {
        recordset.val('付 款 月', `${d5}${d6}`);
    }

    const d7 = arabiaToChinese(dateText.slice(8, 9));
    const d8 = arabiaToChinese(dateText.slice(9, 10));
    const dd7 = dateText.slice(8, 9);
    const dd8 = dateText.slice(9, 10);
    if (dd8 === '0') {
        recordset.val('付 款 日', `零${d7}拾`);
    } else {
        recordset.val('付 款 日', `${d7}拾${d8}`);
    }
    if (dd7 === '0') {
        recordset.val('付 款 日', `${d7}${d8}`);
    }

    recordset.val('年数字', dateText.slice(0, 4));
    recordset.val('月数字', dateText.slice(5, 7));
    recordset.val('日数字', dateText.slice(8, 10));
};


// 判断本次字段变更是否需要触发重算
const shouldTrigger = (field) => {
    if (!field || !field.name) {
        return false;
    }
    return TRIGGER_FIELDS.includes(field.name);
};


// 将计算结果回填到界面字段
const applyCalcResult = (recordset, data = {}) => {
    // TODO: 添加需要回填的计算结果字段
    // recordset.val('计算结果字段', toNumber(data['计算结果字段']));
};

const round2 = (value) => Math.round(toNumber(value) * 100) / 100;


// 预付货款-字段改变主函数
const advance_payment_field_change = async (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name;

    // 付款日期
    advancePaymentPaymentDateFieldChanged(evt_id, opts);

    // 经手人名
    advancePaymentOperatorNameFieldChanged(evt_id, opts);

    // 付款编号
    advancePaymentPaymentNoFieldChanged(evt_id, opts);
    // 经手人名1
    advancePaymentOperatorNameOneFieldChanged(evt_id, opts);
    // 银行申请状态
    advancePaymentBankApplyStatusFieldChanged(evt_id, opts);
    // 银行申请状态1
    advancePaymentBankApplyStatusFieldChanged1(evt_id, opts);
}

/**
 * 经手人名1
 */
const advancePaymentOperatorNameOneFieldChanged = async (evt_id, opts) => {
    const {
        recordset,
        field
    } = opts || {};
    if (!recordset || !field) {
        return;
    }
    if (field.full_name !== '预付货款.经手人名') {
        return;
    }

    const operatorName = String(recordset.val('经手人名') || '').trim();
    if (operatorName === '') {
        return;
    }

    const res = await _.http.post('/api/bill/advance_payment/operator_name_one', {
        form_fields: {
            operator_name: operatorName
        },
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '经手人名校验失败');
        return;
    }

    const data = (res && res.data) || {};
    if (Number(data.clear_operator || 0) === 1) {
        _.ui.message.error(data.error_msg || '不好意思,无此人员,请重新输入,谢谢!');
        recordset.val('经手人名', '');
        return;
    }

    const businessDepartment = String(data.business_department || '').trim();
    const businessArea = String(data.business_area || '').trim();
    if (businessDepartment !== '') {
        recordset.val('业务部门', businessDepartment);
    }
    if (businessArea !== '') {
        recordset.val('业务地区', businessArea);
    }
};


/**
 * 银行申请状态
 */
async function advancePaymentBankApplyStatusFieldChanged(evt_id, opts){
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
    if (recordset.val('我方银行帐号') == '' || recordset.val('我方银行名称') == '' || recordset.val('同行转账') == '' 
        || recordset.val('同城异地') == '' || recordset.val('客户号') == '' ||
        recordset.val('单位code') == '' || recordset.val('开户银行') == '' || recordset.val('银行帐号') == '' || recordset.val('付款金额') < 1) {
        recordset.val('银行申请状态', '无');
        _.ui.message.error('请注意,银行付款提交模块、付款金额未填不能提交');
    } else {
        recordset.module.field_by_full_name('预付货款.银行申请状态').disabled = true;
    }
}

/**
 * 银行申请状态1
 */
async function advancePaymentBankApplyStatusFieldChanged1(evt_id, opts){
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


/**
 * 付款编号
 */
const advancePaymentPaymentNoFieldChanged = async (evt_id, opts) => {
    const {
        recordset,
        field
    } = opts || {};
    if (!recordset || !field) {
        return;
    }
    if (field.full_name !== '预付货款.付款编号') {
        return;
    }

    const paymentNo = String(recordset.val('付款编号') || '').trim();
    if (paymentNo === '') {
        return;
    }


    const res = await _.http.post('/api/bill/advance_payment/payment_no', {
        form_fields: {
            payment_no: paymentNo
        }
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '付款编号查询失败');
        return;
    }

    const data = (res && res.data) || {};
    recordset.val('外销合同', String(data.outer_sales_contract || ''));
    recordset.val('外销发票', String(data.outer_invoice_no || ''));
    recordset.val('采购合同', String(data.purchase_contract || ''));
    recordset.val('合同金额', Number(data.contract_amount || 0));
    recordset.val('审请付款日期', String(data.request_payment_date || ''));
    recordset.val('申请金额', Number(data.request_amount || 0));
    recordset.val('付款币种', String(data.payment_currency || ''));
    recordset.val('预计出货日期', String(data.estimated_shipping_date || ''));
    recordset.val('经手人名', String(data.operator_name || ''));
    recordset.val('生产厂家', String(data.manufacturer || ''));
    recordset.val('出货工厂', String(data.shipping_factory || ''));
    recordset.val('银行帐号', String(data.bank_account || ''));
    recordset.val('开户银行', String(data.bank_name || ''));
    recordset.val('工厂编号', String(data.factory_code || ''));
    recordset.val('备注说明', String(data.remark || ''));
    recordset.val('付款地区', String(data.payment_area || ''));
    recordset.val('中文品名', String(data.chinese_product_name || ''));
    recordset.val('业务部门', String(data.business_department || ''));
    recordset.val('联系方式', String(data.contact || ''));
    recordset.val('货款类型', String(data.payment_type || ''));
    recordset.val('付款形式', String(data.payment_form || ''));
};


// 经手人名

/**
 * 经手人名
 */
const advancePaymentOperatorNameFieldChanged = async (evt_id, opts) => {
    const {
        recordset,
        field
    } = opts || {};
    if (!recordset || !field) {
        return;
    }
    if (field.full_name !== '预付货款.采购合同') {
        return;
    }

    const purchaseContract = String(recordset.val('采购合同') || '').trim();
    if (purchaseContract === '') {
        return;
    }

    const operatorName = String(recordset.val('经手人名') || '').trim();
    if (operatorName !== '') {
        return;
    }

    let username = _.user.username;
    const res = await _.http.post('/api/bill/advance_payment/operator_name', {
        form_fields: {
            purchase_contract: purchaseContract,
            operator_name: operatorName
        },
        username
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '获取经手人名失败');
        return;
    }

    const data = (res && res.data) || {};
    const newOperatorName = String(data.operator_name || '').trim();
    if (newOperatorName !== '') {
        recordset.val('经手人名', newOperatorName);
    }
};


// #region 付款日期字段变更及同步
const advancePaymentPaymentDateFieldChanged = async (evt_id, opts) => {
    const recordset = opts && opts.recordset;
    const field = (opts && opts.field) || {};
    const fieldName = String(field.name || field.field_name || field.full_name || '');
    if (!recordset || fieldName !== '付款日期') {
        return;
    }

    const paymentDate = String(getValue(recordset, '付款日期')).trim();
    if (!paymentDate) {
        return;
    }

    fillPaymentDateFields(recordset, paymentDate);
    await syncPaymentDate(recordset);
};

const syncPaymentDate = async (recordset) => {
    const paymentNo = String(getValue(recordset, '付款编号')).trim();
    const paymentDate = String(getValue(recordset, '付款日期')).trim();
    if (!paymentNo || !paymentDate) {
        return;
    }

    const res = await _.http.post('/api/bill/advance_payment/payment_date', {
        form_fields: {
            付款编号: paymentNo,
            付款日期: paymentDate
        }
    });
    if (!res || Number(res.code) !== 1) {
        _.ui.message.error((res && res.msg) || '付款日期同步失败');
    }
};
// #endregion
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, advance_payment_field_change, '预付货款')



// #region 预付货款-工具函数
// 预付货款加载后

/**
 * 获取当前时间字符串。
 */
const getNowText = () => {
    try {
        return _.date.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
};

/**
 * 安全读取字段值，字段不存在时返回空字符串。
 */
// const getValue = (recordset, fieldName) => {
//     try {
//         return recordset.val(fieldName) || '';
//     } catch (e) {
//         return '';
//     }
// };

/**
 * 调用后端计算并回填正式付款日期。
 */
const advancePaymentFormalPaymentDateApply = async (recordset) => {
    const earlyPayment = String(getValue(recordset, '提前付款')).trim();
    const expectedShipDate = String(getValue(recordset, '预计出货日期')).trim();
    const factoryName = String(getValue(recordset, '生产厂家')).trim();

    if (earlyPayment !== '是') {
        return true;
    }

    const res = await _.http.post('/api/bill/advance_payment/formal_payment_date', {
        form_fields: {
            提前付款: earlyPayment,
            预计出货日期: expectedShipDate,
            生产厂家: factoryName
        }
    });
    if (!res || Number(res.code) !== 1 || !res.data) {
        _.ui.message.error((res && res.msg) || '正式付款日期计算失败');
        return false;
    }

    const formalPaymentDate = String((res.data && res.data.formal_payment_date) || '').trim();
    if (formalPaymentDate) {
        recordset.val('正式付款日期', formalPaymentDate);
    }
    return true;
};

// #endregion

// /**
//  * 新建时统一调度：一个挂载点内按功能顺序执行。
//  */
// const advancePaymentRecordNewUnified = async (evt_id, recordset) => {
//     try {

//     } catch (error) {
//         _.ui.message.error('新建处理失败');
//     }
// };
// _.evts.on(_.evtids.RECORD_NEW, advancePaymentRecordNewUnified, '预付货款');

/**
 * 新建记录时执行修改信息更新。
 */
const advancePaymentModifyStaffRecordNew = async (evt_id, recordset) => {
    updateModifyInfo(recordset);
};

// 新建基础初始化
const advance_payment_record_new = async (evt_id, recordset) => {


};


// 生成编码
const advancePaymentGenerateCodeRecordNew = async (evt_id, recordset) => {
    const res = await _.http.post('/api/bill/advance_payment/generate_code', {
        form_fields: {
            识别: recordset.val('识别') || ''
        }
    });
    if (!res || Number(res.code) !== 1 || !res.data) {
        _.ui.message.error((res && res.msg) || '生成编码失败');
        return;
    }

    const identifyCode = (res.data.identify_code || '').trim();
    if (identifyCode) {
        recordset.val('识别', identifyCode);
    }
};


// 所属部门
const advancePaymentOwnerDepartmentRecordNew = async (evt_id, recordset) => {
    const res = await _.http.post('/api/bill/advance_payment/owner_department', {});
    if (!res || Number(res.code) !== 1 || !res.data) {
        _.ui.message.error((res && res.msg) || '所属部门获取失败');
        return;
    }

    const ownerDepartment = (res.data.owner_department || '').trim();
    if (ownerDepartment) {
        recordset.val('所属部门', ownerDepartment);
    }
};
// ===========================================================================
// #endregion

const advancePaymentBeforeSaveUnified = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 生成唯一字段值
            recordset.val('唯一字段', recordset.val('rid'));
            // 功能1：付款金额转换与经手人员部门补全
            await onAdvancePaymentLoad_fkje(evt_id, recordset);

            // 功能2：预付单号兜底生成
            await advancePaymentPrepaymentNoBeforeSave(evt_id, recordset);

            // 功能3：修改信息更新（修改清单、修改人员等）
            await advancePaymentModifyStaffBeforeSave(evt_id, recordset);


            // 功能4：正式付款日期计算
            await advancePaymentFormalPaymentDateBeforeSave(evt_id, recordset);

            // 功能5：工厂定金管理同步
            await advancePaymentFactoryDepositManagementBeforeSave(evt_id, recordset);


            // 功能6：预付款通知
            await advancePaymentPrepaymentNoticeBeforeSave(evt_id, recordset);

            // 更改权限
            await advancePaymentNewPaymentMergeBeforeSave(evt_id, recordset);

            // // 功能1：新建基础初始化（唯一字段、所属部门、识别编码）
            // await advance_payment_record_new(evt_id, recordset);

            // 所属部门
            await advancePaymentOwnerDepartmentRecordNew(evt_id, recordset);
            // 生成编码
            await advancePaymentGenerateCodeRecordNew(evt_id, recordset);

            // // 功能2：预付单号兜底生成
            // await advancePaymentPrepaymentNoRecordNew(evt_id, recordset);

            // 功能3：修改信息更新（修改清单、修改人员等）
            await advancePaymentModifyStaffRecordNew(evt_id, recordset);

            // // 功能4：正式付款日期计算
            // await advancePaymentFormalPaymentDateApply(recordset);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
};
// #region 预付货款-修改人员
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, advancePaymentBeforeSaveUnified, '预付货款');
/**
 * 保存前统一调度：一个挂载点内按功能顺序执行。
 */

/**
 * 更改权限
 */
const advancePaymentNewPaymentMergeBeforeSave = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = _.user.username;
            const res = await _.http.post('/api/bill/advance_payment/new_payment_merge', {
                main: recordset.tables['预付货款'].view_data || {},
                module: recordset.module.name,
            });
            if (!res || Number(res.code) == -1) {
                const msg = (res && res.msg)
                _.ui.message.error(msg);
                reject(msg);
                return;
            }

            resolve();
        } catch (e) {
            const msg = (e && e.message)
            _.ui.message.error(msg);
            reject(msg);
        }
    });
};

/**
 * 预付款通知
 */
const advancePaymentPrepaymentNoticeBeforeSave = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            const paymentAmount = Number(recordset.val('付款金额') || 0);
            if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
                resolve();
                return;
            }

            let username = _.user.username;
            const res = await _.http.post('/api/bill/advance_payment/prepayment_notice', {
                form_fields: {
                    purchase_contract: String(recordset.val('采购合同') || '').trim(),
                    operator_name: String(recordset.val('经手人名') || '').trim(),
                    manufacturer: String(recordset.val('生产厂家') || '').trim(),
                    shipping_factory: String(recordset.val('出货工厂') || '').trim(),
                    payment_amount: String(recordset.val('付款金额') || '').trim()
                },
                username
            });
            if (!res || Number(res.code) !== 1) {
                const msg = (res && res.msg) || '预付款通知失败';
                _.ui.message.error(msg);
                reject(msg);
                return;
            }

            resolve();
        } catch (e) {
            const msg = (e && e.message) || '预付款通知失败';
            _.ui.message.error(msg);
            reject(msg);
        }
    });
};



// 工厂定金管理
const advancePaymentFactoryDepositManagementBeforeSave = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            const formFields = {
                purchase_contract_id: recordset.val('采购合同ID') || '',
                purchase_contract: recordset.val('采购合同') || '',
                payment_amount: recordset.val('付款金额') || '',
                payment_date: recordset.val('付款日期') || '',
                payment_approval_id: recordset.val('付款审批id') || ''
            };

            let username = _.user.username;
            const res = await _.http.post('/api/bill/advance_payment/factory_deposit_management', {
                rid: recordset.rid || '',
                form_fields: formFields,
                username
            });

            if (!res || Number(res.code) !== 1) {
                const msg = (res && res.msg) || '保存前同步失败';
                _.ui.message.error(msg);
                reject(msg);
                return;
            }

            resolve();
        } catch (e) {
            const msg = (e && e.message) || '保存前同步失败';
            _.ui.message.error(msg);
            reject(msg);
        }
    });
};

/**
 * 保存前计算正式付款日期。
 */
const advancePaymentFormalPaymentDateBeforeSave = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ok = await advancePaymentFormalPaymentDateApply(recordset);
            if (!ok) {
                reject();
                return;
            }
            resolve();
        } catch (error) {
            _.ui.message.error('正式付款日期处理失败');
            reject(error);
        }
    });
};


//  付款金额
const onAdvancePaymentLoad_fkje = async (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 收集所有需要的参数
            const params = {
                // 金额转换所需参数
                payment_amount: recordset.val('付款金额') || '',

                // 部门查询所需参数
                handler_name: recordset.val('经手人名') || '',

                // 判断是否需要查询部门（仅当经手人存在且部门为空时）
                need_dept_query: !!(recordset.val('经手人名') && !recordset.val('经手人员部门'))
            };

            // 如果没有金额且不需要查询部门，则无需调用接口
            if (!params.payment_amount && !params.need_dept_query) {
                resolve();
                return;
            }

            try {
                // 调用后端统一接口
                const res = await _.http.post('/api/advance_payment/process_before_save_fkje', params);

                if (res && res.code === 1 && res.data) {
                    const data = res.data;

                    // 1. 处理金额转换结果
                    if (data.chinese_amount) {
                        recordset.val('付款大写', data.chinese_amount);
                        console.log('预付货款-金额转换成功：', data.chinese_amount);
                    }

                    // 2. 处理部门查询结果
                    if (data.department) {
                        recordset.val('经手人员部门', data.department);
                        console.log('预付货款-部门查询成功：', data.department);
                    }

                    // 3. 处理警告信息（非阻断性错误）
                    if (data.warnings && data.warnings.length > 0) {
                        console.warn('预付货款-处理警告：', data.warnings.join('; '));
                        // 可选：是否显示给用户 _.ui.message.warning(...)
                    }
                } else {
                    console.warn('预付货款-后端处理返回异常：', res ? res.msg : '无响应');
                    // 接口调用失败时的降级处理
                    if (params.payment_amount) {
                        recordset.val('付款大写', params.payment_amount + '元');
                    }
                }
            } catch (error) {
                console.error('预付货款-接口调用异常：', error);
                // 异常时的降级处理
                if (params.payment_amount) {
                    recordset.val('付款大写', params.payment_amount + '元');
                }
            }

            // 所有操作完成，resolve Promise
            resolve();

        } catch (error) {
            console.error('预付货款-记录处理失败：', error);
            _.ui.message.error('记录处理失败：' + error.message);
            // 发生严重错误时reject，阻止保存
            reject(error);
        }
    });
}


// 预付货款-预付单号（来源：/需求文件/oldCode.groovy）
const advancePaymentPrepaymentNoEnsure = async (recordset) => {
    const currentNo = (recordset.val('预付单号') || '').trim();
    if (currentNo) {
        return true;
    }

    const res = await _.http.post('/api/bill/advance_payment/prepayment_no', {
        form_fields: {
            预付单号: currentNo
        }
    });
    if (!res || Number(res.code) !== 1 || !res.data) {
        return false;
    }

    const prepaymentNo = (res.data.prepayment_no || '').trim();
    if (prepaymentNo) {
        recordset.val('预付单号', prepaymentNo);
    }
    return true;
};

// const advancePaymentPrepaymentNoRecordNew = async (evt_id, recordset) => {
//     const ok = await advancePaymentPrepaymentNoEnsure(recordset);
//     if (!ok) {
//         _.ui.message.error('生成预付单号失败');
//     }
// };


const advancePaymentPrepaymentNoBeforeSave = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ok = await advancePaymentPrepaymentNoEnsure(recordset);
            if (!ok) {
                _.ui.message.error('生成预付单号失败');
                reject();
                return;
            }
            resolve();
        } catch (error) {
            _.ui.message.error('生成预付单号失败');
            reject(error);
        }
    });
};


/**
 * 执行修改清单与修改人员更新逻辑。
 */
const updateModifyInfo = (recordset) => {
    const userName = _.user.username //getCurrentUserName();
    const nowText = getNowText();
    const currentList = String(getValue(recordset, '修改清单'));

    recordset.val('生产厂家', String(getValue(recordset, '生产厂家')).trim());
    recordset.val('出货工厂', String(getValue(recordset, '出货工厂')).trim());
    recordset.val('修改清单', `${currentList}${userName}${nowText}`);
    recordset.val('修改人员', userName);

    const purchaseContract = String(getValue(recordset, '采购合同')).trim();
    const businessDept = String(getValue(recordset, '业务部门')).trim();
    if (purchaseContract && !businessDept) {
        const ywbm1 = purchaseContract.slice(0, 2);
        const ywbm = `${ywbm1}组`;
        void ywbm;
    }
};

/**
 * 保存前执行修改信息更新，对应 Pascal 的 beforemodify 事件。
 */
const advancePaymentModifyStaffBeforeSave = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        try {
            updateModifyInfo(recordset);
            resolve();
        } catch (error) {
            _.ui.message.error('保存前处理失败');
            reject(error);
        }
    });
};
// #endregion

// 编辑界面数据加载以后执行
const advancePayment_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username;
    if (recordset.val('银行申请状态') == '待提交' || recordset.val('银行申请状态') == '已提交') {
        recordset.module.field_by_full_name('预付货款.银行申请状态').disabled = true;
    }
    if (username != 'zjnblh') {
        recordset.module.field_by_full_name('预付货款.修改清单').hide()
    } else {
        recordset.module.field_by_full_name('预付货款.修改清单').show()
    }
}
_.evts.on([_.evtids.RECORD_LOAD], advancePayment_recordLoad, '预付货款');