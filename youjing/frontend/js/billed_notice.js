// 辅助函数
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getInt(str) {
    return parseInt(str, 10) || 0;
}

// 主处理函数
function processInvoiceData(recordset, r) {
    let t = recordset.tables['资料合并']
    let v = t.view_data || []
    // for (let r of v) {
    // 检查工厂发票字段是否为空
    const factoryInvoice = recordset.value('资料合并.工厂发票', r);

    if (factoryInvoice === '') {
        return;
    }

    const zs = factoryInvoice.length;
    let b1 = 0; // 用于生成登记时间的序号
    let a = 0; // 记录分隔符数量
    let c = 0; // 记录处理次数

    // 构建到票详情字符串
    const dpxq1 = '工厂发票:' + factoryInvoice +
        '到票日期:' + recordset.value('资料合并.到票日期', r) +
        '开票工厂:' + recordset.value('资料合并.开票工厂', r) +
        '到票金额:' + recordset.value('资料合并.到票金额', r) +
        '到票数量:' + recordset.value('资料合并.到票数量', r);

    let dpxq = recordset.value('资料合并.到票详情', r);
    if (dpxq === '') {
        recordset.val('资料合并.到票详情', dpxq1, r);
    } else {
        recordset.val('资料合并.到票详情', dpxq + ';\r\n' + dpxq1, r);
    }
    // 重置变量
    let zs2 = 0,
        zs4 = 1,
        zs6 = 0;
    let cx = '';
    let cx1 = 0,
        cx2 = 0,
        cx8 = 0,
        cx9 = 0;
    let ws1 = 0,
        ws2 = 0,
        ws3 = 0;
    let cx3 = '';
    // 处理逗号分隔的部分
    for (let zs1 = 1; zs1 <= zs; zs1++) {
        zs2++;
        zs6++;
        const zsw = factoryInvoice.charAt(zs2 - 1); // Delphi从1开始，JS从0开始
        if (zsw === ',' || zsw === '，') {
            // 提取分隔符之间的内容
            cx = factoryInvoice.substring(zs4 - 1, zs4 - 1 + zs6 - 1);
            zs4 = zs2 + 1;
            zs6 = 0;
            a++;
            c++;
            // 添加开票详情记录
            b1++;
            console.log('分隔符处理', cx);
            addInvoiceDetail(recordset, r, b1, cx);
        }
    }
    // 处理剩余部分
    if (a > 0) {
        cx = factoryInvoice.substring(zs4 - 1, zs4 - 1 + zs6);
        b1++;
        console.log('剩余部分处理', cx);
        addInvoiceDetail(recordset, r, b1, cx);
    }
    // 重置变量用于处理 * 分隔符
    zs2 = 0;
    zs4 = 1;
    zs6 = 0;
    cx9 = 0;
    // 处理 * 分隔符
    for (let zs5 = 1; zs5 <= zs; zs5++) {
        zs2++;
        zs6++;
        const zsw = factoryInvoice.charAt(zs2 - 1);
        if (zsw === '*') {
            cx1 = getInt(factoryInvoice.substring(zs4 - 1, zs4 - 1 + zs6 - 1));
            zs4 = zs2 + 1;
            zs6 = 0;
            c++;
            cx9++;
        }
    }
    // 处理最后一个数字范围
    cx2 = getInt(factoryInvoice.substring(zs4 - 1));
    const lastPart = factoryInvoice.substring(zs4 - 1);
    ws1 = lastPart.length;
    const cx2Str = String(cx2);
    ws2 = cx2Str.length;

    if (ws1 !== ws2) {
        ws3 = ws1 - ws2;
        cx3 = '0'.repeat(ws3);
    }

    // 处理数字范围
    if (cx9 > 0) {
        for (let zs1 = cx1; zs1 <= cx2; zs1++) {
            cx8 = zs1;
            b1++;
            let invoiceNumber = '';
            if (cx3 !== '') {
                invoiceNumber = cx3 + zs1;
            } else {
                invoiceNumber = String(zs1);
            }
            console.log('数字范围处理', invoiceNumber);
            addInvoiceDetail(recordset, r, b1, invoiceNumber);
        }
    }

    // 如果没有处理任何分隔符，添加完整的发票详情
    if (c === 0) {
        cx = factoryInvoice.substring(zs4 - 1, zs4 - 1 + zs6);
        b1++;
        console.log('完整发票详情处理', cx);
        addInvoiceDetail(recordset, r, b1, cx);
    }

    // 更新原始记录
    recordset.val('资料合并.代理发票', factoryInvoice, r);
    recordset.val('资料合并.代理金额', recordset.value('资料合并.到票金额', r), r);
    recordset.val('资料合并.工厂发票', '', r);
    recordset.val('资料合并.到票金额', 0, r);
    recordset.val('资料合并.到票数量', 0, r);
    // }
}

// 添加开票详情记录的公共函数
function addInvoiceDetail(recordset, r, b1, cx) {
    const now = new Date();
    const registerTime = formatDateTime(now) + b1;

    let t = recordset.tables['开票详情'];
    // 设置所有字段
    const commonFields = {
        '出货日期': recordset.val('出货日期'),
        '付款金额': 0,
        '付款日期': null,
        '退税率(%)': recordset.value('资料合并.退 税 率', r),
        '经手人名': recordset.value('资料合并.业务人员', r),
        '开票日期': recordset.value('资料合并.发票日期', r),
        '外销发票': recordset.value('资料合并.外销发票号', r),
        '业务发票': recordset.value('资料合并.业务发票', r),
        '到票地点': recordset.value('资料合并.到票地点', r),
        '发票为空': '否',
        '出货工厂': recordset.value('资料合并.合并厂家', r),
        '中文品名': recordset.value('资料合并.中文品名', r),
        '到票日期': recordset.value('资料合并.到票日期', r),
        '认证有效期': recordset.value('资料合并.认证有效期', r),
        '开票唯一': recordset.value('资料合并.开票唯一', r),
        '合同金额': recordset.value('资料合并.合同总额', r),
        '业务部门': recordset.value('资料合并.业务部门', r),
        '开票工厂': recordset.value('资料合并.开票工厂', r),
        '采购合同': recordset.value('资料合并.采购合同', r),
        '我司抬头': recordset.value('资料合并.我司抬头', r),
        '发票详情': recordset.value('资料合并.工厂发票', r),
        '到票金额': recordset.value('资料合并.到票金额', r),
        '发票金额': recordset.value('资料合并.到票金额', r),
        '备注说明': recordset.value('资料合并.备注说明', r),
        '是否认证': '否',
        '登记时间': registerTime,
        '材   质': recordset.value('资料合并.材   质', r),
        '开票序号': recordset.value('资料合并.开票序号', r),
        '发票代码': ',',
        '是否电汇': recordset.value('资料合并.是否电汇', r),
        '盖章收回': recordset.value('资料合并.盖章收回', r),
        '付款详情': recordset.value('资料合并.付款详情', r),
        '收支详情': recordset.value('资料合并.收支详情', r),
        '折扣费用': recordset.value('资料合并.折扣费用', r),
        '采购货币': recordset.value('资料合并.采购货币', r),
        '业务地区': recordset.value('资料合并.业务地区', r),
        '出口货物报关单号': recordset.value('资料合并.出口货物报关单号', r)
    };

    let l = {}
    l.rid = _.utils.guid()
    l.ctime = new Date().format('yyyy-MM-dd hh:mm:ss');
    l.uid = _.user.rid;
    l.pid = r.pid;
    l.kpgc = cx
    for (const [fieldName, fieldValue] of Object.entries(commonFields)) {
        // console.error(`Setting field ${fieldName} to value ${fieldValue} for record ${l.rid}`);
        // recordset.val('开票详情.' + fieldName, fieldValue, l);
        l[recordset.module.field_by_full_name('开票通知.开票详情.' + fieldName).db.name] = fieldValue;
    }
    t.view_data.push(l);
    t.push_new_rid(l.rid)
    t.sync_operate_data()
    t.modified = true
    // t.append().then(() => {
    //     let index = t.view_data.length;
    //     let l = t.view_data[index - 1];
    //     console.log('输入的记录', r);
    //     console.log('输入的记录', l);
    //     console.log('输入的cx', cx);
        // console.log('l.rid', l.rid);
        // 设置字段值
        // for (const [fieldName, fieldValue] of Object.entries(commonFields)) {
        //     // console.error(`Setting field ${fieldName} to value ${fieldValue} for record ${l.rid}`);
        //     recordset.val('开票详情.' + fieldName, fieldValue, l);
        // }
        // 设置特殊的工厂发票字段
        recordset.val('开票详情.工厂发票', cx, l);
    // }).catch(err => {
    //     console.error('添加开票详情记录失败', err);
    // });
}

const billed_notice_before_save = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        // await processInvoiceData(recordset);
        _.http.post('/api/saier/billed_notice/save/before', {
            main: recordset.tables['开票通知'].view_data,
            lines: recordset.tables['资料合并'].view_data,
            items: recordset.tables['开票详情'].view_data,
        }).then(res => {
            let d = res.data || {}
            recordset.val('唯一字段', recordset.val('外销发票号') + '-' + recordset.val('生产厂家'));
            recordset.val('唯一字段10', recordset.val('外销发票号') + '-' + recordset.val('生产厂家') + '-' + new Date().format('yyyy-MM-dd hh:mm:ss'));
            let t = recordset.tables['资料合并']
            let v = t.view_data || []
            for (let r of v) {
                if (r.rid in d) {
                    recordset.val('资料合并.开票序号', d[r.rid], r);
                }
                processInvoiceData(recordset, r);
                let gcfp = ''
                let dlje = 0
                let yqrq = ''
                let x = recordset.tables['开票详情']
                let y = x.view_data || []
                for (let l of y) {
                    if (recordset.value('开票详情.到票日期', l) > recordset.value('资料合并.逾期日期', r)) {
                        yqrq = '是';
                    } 
                    if (recordset.value('开票详情.开票序号', l) == recordset.value('资料合并.开票序号', r)) {
                        if (gcfp == '' || gcfp == null) {
                            gcfp = recordset.value('开票详情.工厂发票', l);
                        } else {                            
                            gcfp = gcfp + ',' + recordset.value('开票详情.工厂发票', l);
                        }
                        dlje = recordset.value('开票详情.发票金额', l);
                    }
                }
                if (gcfp != '' && gcfp != null) {
                    recordset.val('资料合并.代理发票', gcfp, r);
                    recordset.val('资料合并.是否到票', '是', r);
                    recordset.val('资料合并.代理金额', dlje, r);
                    recordset.val('资料合并.发票逾期', yqrq, r);

                    if (recordset.value('资料合并.实际开票总额', r) - dlje < 10) {
                        if (recordset.value('资料合并.完成识别', r) == '') {
                            recordset.val('资料合并.完成开票', '是', r);
                        }
                    }
                    if (recordset.value('资料合并.完成开票', r) == '是') {
                        recordset.val('资料合并.到票数量总', recordset.value('资料合并.报关数量', r), r);
                    }
                }
            }
            resolve();
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.error(err);
            if (err.msg == '此生产厂家在这个外销发票号下已有开票通知请检查') {
                recordset.val('唯一字段', '');
                recordset.val('唯一字段10', '');
                recordset.val('外销发票号', '');
                recordset.val('生产厂家', '');
            }
            reject();
        });
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, billed_notice_before_save, '开票通知')


const billed_notice_after_save = (evt_id, recordset) => {
        _.http.post('/api/saier/billed_notice/save/after', {
            main: recordset.tables['开票通知'].view_data,
            items: recordset.tables['开票详情'].view_data,
        }).then(res => {
            
        }).catch(err => {
            console.error('保存后检查失败', err);
            _.ui.message.error((err && err.msg) || '保存后检查失败');
        });
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, billed_notice_after_save, '开票通知')



// 编辑界面数据加载以后执行
const billed_notice_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    recordset.module.group_by_name('查看人员').visible = false
    // recordset.module.field_by_full_name(m + '.修改清单').hide();
    if (username == 'zjnblh') {
        recordset.module.group_by_name('查看人员').visible = true
        // recordset.module.field_by_full_name(m + '.修改清单').show();
    }
    _.http.post('/api/saier/billed_notice/load/check', {}).then(res => {
        let data = res.data || {}
        let htsh = data.htsh || ''
        let position = data.position || ''
        if (htsh == '') {
            recordset.module.field_by_full_name(m + '.资料合并.合同收回').hide();
        }
        if (position.indexOf('义乌') != -1) {
            recordset.module.field_by_full_name(m + '.义乌确认').disabled = false;
        } else {
            recordset.module.field_by_full_name(m + '.义乌确认').disabled = true;
        }
        recordset.refresh_ui(true)
    }).catch(err => {
        console.error('加载检查失败', err);
        _.ui.message.error((err && err.msg) || '加载检查失败');
    });
}
_.evts.on([_.evtids.RECORD_LOAD], billed_notice_recordLoad, '开票通知')



// 开票通知-字段改变主函数
const billed_notice_field_change = async (evt_id, opts) => {
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
    if (field.full_name == m + '.义乌确认' && value != '不可') {
        if (recordset.val('可否打印') != '不可' && recordset.val('可否打印') != '不可') {
            recordset.val('义乌确认', '不可');
            _.ui.message.error('宁波还没确认,请先通知宁波确认');
        }
    }
    if (field.full_name == m + '.可否打印' && value == '可以') {
        let chyrq = recordset.val('出货日期')
        let date = new Date().format('yyyy-MM-dd')
        let kpxh = []
        if (recordset.val('可否打印') == '可以') {
            if (recordset.val('开票生成') == '' || recordset.val('开票生成') == null) {
                recordset.val('开票生成', date);
            }
        }
        let lines = recordset.tables['资料合并'].view_data || []
        let flag = 0
        for (let r of lines) {
            if (recordset.value('资料合并.开票序号', r) == '' && recordset.value('资料合并.开票序号', r) == null) {
                _.ui.message.error('请注意有相同开票序号，请保存后在点选');
                recordset.val('可否打印', '不可');
                flag = 1
                break
            }
            kpxh.push(recordset.value('资料合并.开票序号', r));
        }
        if (flag == 0 && chyrq != '' && chyrq != null) {
            _.http.post('/api/saier/billed_notice/kfdy/change', {
                main: recordset.tables['开票通知'].view_data,
                lines: lines,
                kfdy: value,
            }).then(res => {
                let days = res.data || 30
                let new_date = _addDaysDate(chyrq, days)
                let lines = recordset.tables['资料合并'].view_data || []
                for (let r of lines) {
                    recordset.val('资料合并.逾期日期', new_date, r);
                    if (recordset.value('资料合并.到票日期', r) != '' && recordset.value('资料合并.到票日期', r) != null && recordset.value('资料合并.到票日期', r) > new_date) {
                        recordset.val('资料合并.发票逾期', '是', r);
                    } else {
                        if ((recordset.value('资料合并.到票日期', r) == '' || recordset.value('资料合并.到票日期', r) == null) && (date > recordset.value('资料合并.逾期日期', r))) {
                            recordset.val('资料合并.发票逾期', '是', r);
                        } else {
                            recordset.val('资料合并.发票逾期', '否', r);
                        }
                    }
                }
            }).catch(err => {
                console.error('可否打印修改检查失败', err);
                _.ui.message.error((err && err.msg) || '可否打印修改检查失败');
            });
        }
    }
    if (field.full_name == m + '.出货日期' && value != '' && value != null) {
        _.http.post('/api/saier/billed_notice/shipping_date/change', {

        }).then(res => {
            let data = res.data || 30
            let date = _addDaysDate(value, data)
            let t = recordset.tables['资料合并'].view_data || []
            for (let r of t) {
                recordset.val('资料合并.逾期日期', date, r);
            }
        }).catch(err => {
            console.error('出货日期修改检查失败', err);
            _.ui.message.error((err && err.msg) || '出货日期修改检查失败');
        });
    }
    if (field.full_name == m + '.外销发票号' && value != '' && value != null) {
        let t = recordset.tables['资料合并'].view_data || []
        for (let r of t) {
            recordset.val('资料合并.外销发票号', recordset.val('资料合并.外销发票号'), r);
            recordset.val('资料合并.业务发票', recordset.val('资料合并.业务发票'), r);
        }
        let d = recordset.tables['开票详情'].view_data || []
        for (let r of d) {
            recordset.val('开票详情.外销发票', recordset.val('资料合并.外销发票号'), r);
            recordset.val('开票详情.业务发票', recordset.val('资料合并.业务发票'), r);
        }
    }
    if (field.full_name == m + '.跟单人员' && value != '' && value != null) {
        _.http.post('/api/saier/billed_notice/gdry/change', {

        }).then(res => {}).catch(err => {
            console.error('跟单人员修改检查失败', err);
            _.ui.message.error((err && err.msg) || '跟单人员修改检查失败');
        });
    }
    if (field.full_name == m + '.资料合并.发票日期' && value != '' && value != null) {
        let date = _addDaysDate(value, 180)
        recordset.val('资料合并.认证有效期', date, row);
    }
    if (field.full_name == m + '.资料合并.到票金额' || field.full_name == m + '.资料合并.到票金额总') {
        let amount = recordset.value('资料合并.到票金额总', row) || 0
        let total = recordset.value('资料合并.实际开票总额', row) || 0
        let qty = recordset.value('资料合并.报关数量', row) || 0
        if (total - amount < 10) {
            recordset.val('资料合并.完成开票', '是', row);
            recordset.val('资料合并.到票数量总', qty, row);
        }
    }
    if (field.full_name == m + '.资料合并.到票金额') {
        let amount = recordset.value('资料合并.到票金额总', row) || 0
        let total = recordset.value('资料合并.到票金额', row) || 0
        let qty = recordset.value('资料合并.报关数量', row) || 0
        if (total > 0) {
            recordset.val('资料合并.是否到票', '是', row);
            recordset.val('资料合并.到票数量总', total + amount, row);
        }
    }
    if (field.full_name == m + '.资料合并.到票数量') {
        let total = recordset.value('资料合并.到票数量总', row) || 0
        let qty = recordset.value('资料合并.到票数量', row) || 0
        if (qty > 0) {
            recordset.val('资料合并.到票数量总', total + qty, row);
        }
    }
    if (field.full_name == m + '.资料合并.我司抬头') {
        let wstt = recordset.value('资料合并.我司抬头', row) || 0
        if (wstt != '' && wstt != null) {
            recordset.val('我司抬头', wstt);
        }
    }
    if (field.full_name == m + '.资料合并.实际开票总额' && value > 0) {
        let bhsje = 0
        if (recordset.value('资料合并.退 税 率', row) <= 4) {
            if (recordset.value('资料合并.退 税 率', row) == 3) {
                bhsje = recordset.value('资料合并.实际开票总额', row) / 1.03;
            }
            if (recordset.value('资料合并.退 税 率', row) == 1) {
                bhsje = recordset.value('资料合并.实际开票总额', row) / 1.01;
            }
            recordset.val('资料合并.不含税金额', bhsje, row);
            recordset.val('资料合并.税额', recordset.value('资料合并.实际开票总额', row) - bhsje, row);
        } else {
            bhsje = recordset.value('资料合并.实际开票总额', row) / 1.13;
            recordset.val('资料合并.不含税金额', bhsje, row);
            recordset.val('资料合并.税额', recordset.value('资料合并.实际开票总额', row) - bhsje, row);
        }
    }
    if (field.full_name == m + '.资料合并.中文品名') {
        let zwpm = recordset.value('资料合并.中文品名1', row) || ''
        if (zwpm == '' || zwpm == null) {
            recordset.val('资料合并.中文品名1', zwpm, row);
        }
    }
    if (field.full_name == m + '.资料合并.是否电汇' && value > 0) {
        if (value == '是') {
            recordset.val('资料合并.电汇日期', new Date().format('yyyy-MM-dd'), row);
        } else {
            recordset.val('资料合并.电汇日期', null, row);
        }
        let dpxq = recordset.t.value('资料合并.到票详情', row) || ''
        let dpxq1 = _.user.username + '电汇日期:' + recordset.value('资料合并.是否电汇', row) + new Date().format('yyyy-MM-dd')
        if (dpxq == '' || dpxq == null) {
            recordset.val('资料合并.到票详情', dpxq1, row);
        } else {
            recordset.val('资料合并.到票详情', dpxq + '\n' + dpxq1, row);
        }
    }
    if (field.full_name == m + '.资料合并.盖章收回' && value > 0) {
        if (value == '是') {
            recordset.val('资料合并.盖章日期', new Date().format('yyyy-MM-dd'), row);
        } else {
            recordset.val('资料合并.盖章日期', null, row);
        }
        let dpxq = recordset.t.value('资料合并.到票详情', row) || ''
        let dpxq1 = _.user.username + '盖章日期:' + recordset.value('资料合并.是否盖章', row) + new Date().format('yyyy-MM-dd')
        if (dpxq == '' || dpxq == null) {
            recordset.val('资料合并.到票详情', dpxq1, row);
        } else {
            recordset.val('资料合并.到票详情', dpxq + '\n' + dpxq1, row);
        }
    }
    if (field.full_name == m + '.资料合并.货 源 地') {
        if (value != recordset.value('资料合并.原货源地', row)) {
            recordset.val('资料合并.货源地更换', '是', row)
        }
    }
    if (field.full_name == m + '.资料合并.合同收回' && value > 0) {
        if (value != '' && value != '不需要') {
            recordset.val('资料合并.盖章日期', new Date().format('yyyy-MM-dd'), row);
        } else {
            recordset.val('资料合并.盖章日期', null, row);
        }
        let dpxq = recordset.t.value('资料合并.到票详情', row) || ''
        let dpxq1 = _.user.username + '合同收回更改日期:' + recordset.value('资料合并.合同收回', row) + new Date().format('yyyy-MM-dd')
        if (dpxq == '' || dpxq == null) {
            recordset.val('资料合并.到票详情', dpxq1, row);
        } else {
            recordset.val('资料合并.到票详情', dpxq + '\n' + dpxq1, row);
        }
    }
    if (field.full_name == m + '.资料合并.完成开票') {
        if (value == '是') {
            recordset.val('资料合并.完成识别', '', row);
            recordset.val('资料合并.到票日期', new Date().format('yyyy-MM-dd'), row);
            recordset.val('资料合并.是否到票', '是', row);
            if (recordset.value('资料合并.到票日期', row) > recordset.value('资料合并.逾期日期', row)) {
                recordset.val('资料合并.发票逾期', '是', row);
            }
            if (recordset.value('资料合并.登记时间', row) == '' || recordset.value('资料合并.登记时间', row) == null) {
                recordset.val('资料合并.登记时间', new Date().format('yyyy-MM-dd hh:mm:ss'), row);
            }
        } else {
            recordset.val('资料合并.完成识别', '否', row);
        }
        _.http.post('/api/saier/billed_notice/wckp/change', {
            wckp: value,
            rid: recordset.val('rid') || '',
            wxfp: recordset.value('外销发票号') || '',
            ywfp: recordset.value('业务发票') || '',
            kpxh: recordset.value('资料合并.开票序号', row) || '',
        }).then(res => {
            let data = res.data || {}
            let position = data.position || ''
            if (value == '是') {
                if (position.indexOf('义乌') != -1) {
                    recordset.val('资料合并.到票地点', '义乌', row);
                } else {
                    recordset.val('资料合并.到票地点', '宁波', row);
                }
            }
        }).catch(err => {
            console.error('完成开票修改检查失败', err);
            _.ui.message.error((err && err.msg) || '完成开票修改检查失败');
        });
    }
    if (field.full_name == m + '.资料合并.抹零识别') {
        _.http.post('/api/saier/billed_notice/mlsb/change', {
            lines: recordset.tables['产品资料'].view_data || [],
            rid: recordset.val('rid') || '',
            zwpm: recordset.value('资料合并.中文品名', row) || '',
            mlsb: recordset.value('资料合并.开票序号', row) || '',
        }).then(res => {

        }).catch(err => {
            console.error('抹零识别修改检查失败', err);
            _.ui.message.error((err && err.msg) || '抹零识别修改检查失败');
        });
    }
    if (field.full_name == m + '.资料合并.商品分类') {
        _.http.post('/api/saier/billed_notice/spfl/change', {
            lines: recordset.tables['产品资料'].view_data || [],
            rid: recordset.val('rid') || '',
            zwpm: recordset.value('资料合并.中文品名', row) || '',
            spflmc: recordset.value('资料合并.商品分类', row) || '',
        }).then(res => {

        }).catch(err => {
            console.error('商品分类修改检查失败', err);
            _.ui.message.error((err && err.msg) || '商品分类修改检查失败');
        });
    }
    if (field.full_name == m + '.资料合并.工厂发票') {
        if (recordset.value('资料合并.开票唯一', row) != '') {
            recordset.val('资料合并.开票唯一', _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'), row);
        }
        let zs = 0
        if (recordset.value('资料合并.外销发票号', row) != '' && recordset.value('资料合并.外销发票号', row) != null) {
            zs = recordset.value('资料合并.外销发票号', row).length;
        }
        let zs1 = 0;
        let zs2 = 0;
        let zs6 = 0;
        recordset.val('资料合并.到票日期', new Date().format('yyyy-MM-dd'), row);
        recordset.val('资料合并.是否到票', '是', row);
        if (recordset.value('资料合并.逾期日期', row) != '' && recordset.value('资料合并.逾期日期', row) != null) {
            if (recordset.value('资料合并.到票日期', row) > recordset.value('资料合并.逾期日期', row)) {
                recordset.val('资料合并.发票逾期', '是', row);
            }
        }
        let fw = recordset.value('资料合并.外销发票号', row).substring(0, 2);
        if (fw == 'fw' || fw == 'fW' || fw == 'FW' || fw == 'Fw') {
            let zm = recordset.value('资料合并.外销发票号', row).substring(4, 1) + '组';
            recordset.val('资料合并.业务部门', zm, row);
            recordset.val('资料合并.合同来源', '代理', row);
        } else {
            recordset.val('资料合并.合同来源', '自营', row);
            let zsw = recordset.value('资料合并.外销发票号', row).substring(0, 1);
            let n = recordset.value('资料合并.外销发票号', row).substring(1, 1);
            if ((zsw == 'S' || zsw == 's') && (n == 'C' || n == 'c')) {
                let zm = recordset.value('资料合并.外销发票号', row).substring(4, 1) + '组';
                recordset.val('资料合并.业务部门', zm, row);
            }
            const invoiceNo = recordset.value('资料合并.外销发票号', row);
            recordset.val('资料合并.合同来源', '自营', row);
            for (let i = 0; i < invoiceNo.length - 1; i++) {
                zs2++;
                zs6++;
                const current = invoiceNo[i].toLowerCase();
                const next = invoiceNo[i + 1].toLowerCase();
                if (current === 's' && next === 'c' && i >= 3) {
                    const department = invoiceNo[i - 3] + '组';
                    recordset.val('资料合并.业务部门', department, row);
                }
            }
        }
        _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '义乌'
        }).then(res => {
            let data = res.data || 0
            if (data > 0) {
                recordset.val('资料合并.到票地点', '义乌', row);
            } else {
                recordset.val('资料合并.到票地点', '宁波', row);
            }
        }).catch(err => {
            console.error('工厂发票修改检查失败', err);
            _.ui.message.error((err && err.msg) || '工厂发票修改检查失败');
        });
    }


    if (field.full_name == m + '.开票详情.开票日期' && value != '' && value != null) {
        let date = _addDaysDate(value, 180)
        recordset.val('开票详情.认证有效期', date, row);
    }
    if (field.full_name == m + '.开票详情.发票验证' && value != '' && value != null) {
        recordset.val('开票详情.登记时间', new Date().format('yyyy-MM-dd'), row);
        recordset.val('开票详情.到票金额', recordset.value('开票详情.发票金额', row), row);
    }
    if (field.full_name == m + '.开票详情.工厂发票' && value != '' && value != null) {
        _.http.post('/api/saier/billed_notice/gcfp/change', {
            gcfp: value,
            wstt: recordset.value('我司抬头', row) || '',
        }).then(res => {
            let d = res.data || {}
            if (d) {
                recordset.val('开票详情.发票代码', d.CodeOfInvoice, row);
                // recordset.val('开票详情.开票金额', d.TaxIncludedAmountInFigures, row);
                if (d.DateOfIssue != '' && d.DateOfIssue != null) {
                    recordset.val('开票详情.开票日期', d.DateOfIssue, row);
                }
                // recordset.val('开票详情.不含税金额', d.TotalAmountExcludingTax, row);
                recordset.val('开票详情.税    额', d.TotalTaxAmount, row);
                // recordset.val('开票详情.开票工厂税号', d.kpgcsh, row);
                recordset.val('开票详情.发票验证', d.UniqueCodeOfInvoice, row);
            }
        }).catch(err => {
            console.error('工厂发票修改检查失败', err);
            _.ui.message.error((err && err.msg) || '工厂发票修改检查失败');
        });
    }
}
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, billed_notice_field_change, '开票通知')


// 子表记录新建复制后事件
const billed_notice_table_new_copy_after = (evt_id, table, recordset) => {
    if (table.group == "资料合并") {
        recordset.val('资料合并.开票序号', '');
        recordset.val('资料合并.开票唯一', recordset.val('资料合并.rid'));
        _.http.post('/api/saier/billed_notice/merge/new/copy/after', {
            chyrq: recordset.val('出货日期'),
        }).then(res => {
            let data = res.data || {}
            let cs = data.cs || 30
            let date = _addDaysDate(recordset.val('出货日期'), cs)
            recordset.val('资料合并.逾期日期', date);
        }).catch(err => {
            console.error('资料合并新建复制后检查失败', err);
            _.ui.message.error((err && err.msg) || '资料合并新建复制后检查失败');
        });
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], billed_notice_table_new_copy_after, '开票通知')


const billed_notice_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group != '开票详情') {
            resolve()
            return
        }
        let gcfp = recordset.val('开票详情.工厂发票') || ''
        let t = recordset.tables['资料合并'].view_data || []
        for (let r of t) {
            if (recordset.value('资料合并.代理发票', r) == gcfp) {
                if (recordset.value('开票详情.到票金额') > 0) {
                    let dpze = recordset.value('资料合并.到票金额总', r) || 0;
                    recordset.val('资料合并.到票金额总', dpze - recordset.val('开票详情.到票金额'), r);
                }
                recordset.val('资料合并.代理发票', '', r);
                recordset.val('资料合并.代理金额', 0, r);
            }
            let dpxq = recordset.value('资料合并.到票详情', r) || ''
            if (dpxq.indexOf(gcfp) != -1) {
                recordset.val('资料合并.到票详情', dpxq + ';' + '\n' + '工厂发票:' + gcfp + '作废时间;' + new Date().format('yyyy-MM-dd'), r);
                recordset.val('资料合并.开票序号', '', r);
            }
        }
        _.http.post('/api/saier/billed_notice/child/before/delete', {
            fpyz: recordset.val('开票详情.发票验证') || '',
        }).then(res => {
            resolve()
        }).catch(err => {
            console.error('删除检查失败', err);
            _.ui.message.error((err && err.msg) || '删除检查失败');
            reject();
        })
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], billed_notice_table_delete_before, '开票通知')

const billed_notice_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '合并资料') {
        let btns = []
        btns.push({
            "name": 'invoice_new_btn',
            "caption": '开票',
            "icon": 'any-server-update',
        })
        btns.push({
            "name": 'invoice_empty_btn',
            "caption": '清空开票序号',
            "icon": 'any-copy',
        })
        form.toolbar.add([{
            "name": 'meger_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], billed_notice_EditorChildShow, ' 开票通知')


// 界面加载添加按钮
const billed_notice_formShow = (evt_id, form) => {
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
            name: 'billed_notice_compare_list',
            caption: '预录单对照表',
            icon: 'any-keyborad'
        });
        // btns.push({
        //     name: 'billed_notice_batch_invoice',
        //     caption: '批量开票汇总',
        //     icon: 'any-keyborad'
        // });
        btns.push({
            name: 'billed_notice_batch_source_place',
            caption: '批量货源地',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_invoice_summary',
            caption: '开票统计表',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_invoice_export',
            caption: '(优胜/优景)财务开票信息导出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_record_export',
            caption: '开票信息导出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_print_permit',
            caption: '开票打印批量许可',
            icon: 'any-keyborad'
        });
        

        btns.push({
            name: 'billed_notice_import_invoice',
            caption: '导入发票生成',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_excel_title_export',
            caption: '表头生成',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_incomplete',
            caption: '未齐发票',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_invoice_batch_import',
            caption: '批量到票信息导入',
            icon: 'any-keyborad'
        });
        // btns.push({
        //     name: 'billed_notice_out_stock_export',
        //     caption: '出库单批量',
        //     icon: 'any-keyborad'
        // });
        // btns.push({
        //     name: 'billed_notice_in_stock_export',
        //     caption: '入库单批量',
        //     icon: 'any-keyborad'
        // });
        btns.push({
            name: 'billed_notice_batch_memo_import',
            caption: '备注说明批量导入导出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_update_overdue',
            caption: '刷新逾期',
            icon: 'any-keyborad'
        });
        // btns.push({
        //     name: 'billed_notice_update_source_phone',
        //     caption: '批量更新业务地区电话',
        //     icon: 'any-keyborad'
        // });
        btns.push({
            name: 'billed_notice_update_shipment_date',
            caption: '刷新出货日期',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_update_invoice_date',
            caption: '批量国税发票日期',
            icon: 'any-keyborad'
        });
        // btns.push({
        //     name: 'billed_notice_kingdee_in_stock',
        //     caption: '金蝶预估入库',
        //     icon: 'any-keyborad'
        // });
        // btns.push({
        //     name: 'billed_notice_kingdee_contract',
        //     caption: '金蝶合同销售',
        //     icon: 'any-keyborad'
        // });
        // btns.push({
        //     name: 'billed_notice_batch_permit',
        //     caption: '批量到票',
        //     icon: 'any-keyborad'
        // });
        btns.push({
            name: 'billed_notice_update_permit',
            caption: '更改批量到票',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_finace_title',
            caption: '财务报关表头',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_batch_unlock',
            caption: '按合同批量解除锁定',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_batch_exchange_rate',
            caption: '批量换汇成本',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_batch_shipment_date',
            caption: '批量更新出货日期',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_invoice_adjust',
            caption: '批量核算发票',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_batch_responsible',
            caption: '批量离职交接人员',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_notice_batch_profit_list',
            caption: '账面利润表',
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

_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], billed_notice_formShow, '开票通知');


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


// 开票通知-按钮点击事件
const billedNoticeButtonClick = async (evt_id, btn, form) => {
    // 合并资料.开票
    let recordset = form.recordset
    if (btn.name == 'invoice_new_btn') {
        if (recordset.tables['资料合并'].current_data == null) {
            _.ui.message.error('请先选择一条资料合并记录');
            return;
        }
        recordset.val('资料合并.是否已开', '是');
        recordset.val('开票零头', recordset.val('资料合并.开票零头'));
        recordset.val('产品名称', recordset.val('资料合并.中文品名'));
        recordset.val('退 税 率', recordset.val('资料合并.退 税 率'));
        recordset.val('合同总金额', recordset.val('资料合并.合同总额'));
        recordset.val('出货总量', recordset.val('资料合并.出货总量'));
        recordset.val('报关总量', recordset.val('资料合并.报关总量'));
        recordset.val('资料备注', recordset.val('生产厂家') + recordset.val('退 税 率') + '%');
        recordset.val('数量单位', recordset.val('资料合并.报关数量') + recordset.val('资料合并.海关计量单位'));
        recordset.val('相关杂费', recordset.val('资料合并.相关杂费'));
        recordset.val('数量', recordset.val('资料合并.报关数量'));
    }
    if (btn.name == 'invoice_empty_btn') {
        if (recordset.tables['资料合并'].current_data == null) {
            _.ui.message.error('请先选择一条资料合并记录');
            return;
        }
        recordset.val('资料合并.开票序号', '');
    }
    // 批量开票汇总
    if (btn.name == 'billed_notice_batch_invoice') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        _.http.post('/api/saier/billed_notice/batch/invoice', {
            rids: rids,
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('批量开票汇总失败', err);
            _.ui.message.error((err && err.msg) || '批量开票汇总失败');
        });
    }
    // 预录单对照表
    if (btn.name == 'billed_notice_compare_list') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        let wxfp = await _.ui.show_input_dialog('请输入外销发票号', '').then(res => {
            if (!res || res.trim() === '') {
                _.ui.message.error('外销发票号不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!wxfp) {
            return;
        }
        _.http.post('/api/saier/billed_notice/compare_list', {
            wxfp: wxfp
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('预录单对照表失败', err);
            _.ui.message.error((err && err.msg) || '预录单对照表失败');
        });
    }
    // 批量货源地
    if (btn.name == 'billed_notice_batch_source_place') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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

        _.ui.show_upload_dialog({
                title: '批量货源地',
                url: '/api/saier/billed_notice/source_place',
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
    // 开票统计表
    if (btn.name == 'billed_notice_invoice_summary') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        let wxfp = await _.ui.show_input_dialog('请输入外销发票号', '').then(res => {
            if (!res || res.trim() === '') {
                _.ui.message.error('外销发票号不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!wxfp) {
            return;
        }
        let hl = await _.ui.show_input_number_dialog('请输入汇率,不输为当前汇率', 0).then(res => {
            if (!res || res === '') {
                return 0
            }
            console.log('输入的汇率 aa ', res);
            return res;
        }).catch(err => {
            return null;
        });
        console.log('输入的汇率 bb ', hl);
        if (hl == null || hl == undefined) {
            return;
        }
        _.http.post('/api/saier/billed_notice/invoice_summary', {
            wxfp: wxfp,
            hr: hl
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('开票统计表失败', err);
            _.ui.message.error((err && err.msg) || '开票统计表失败');
        });
    }
    // (优胜/优景)财务开票信息导出
    if (btn.name == 'billed_notice_invoice_export') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        _.http.post('/api/saier/billed_notice/invoice_export', {
            rids: rids
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('财务开票信息导出失败', err);
            _.ui.message.error((err && err.msg) || '财务开票信息导出失败');
        });
    }
    // 开票信息导出
    if (btn.name == 'billed_notice_record_export') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        _.http.post('/api/saier/billed_notice/invoice_export', {
            rids: rids
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('财务开票信息导出失败', err);
            _.ui.message.error((err && err.msg) || '财务开票信息导出失败');
        });
    }
    // 开票打印批量许可
    if (btn.name == 'billed_notice_print_permit') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        position = res.position || '';
        _.http.post('/api/saier/billed_notice/print_permit', {
            rids: rids,
            position: position
        }).then(res => {
            _.ui.message.success('批量开票打印许可成功');
        }).catch(err => {
            console.error('财务开票信息导出失败', err);
            _.ui.message.error((err && err.msg) || '财务开票信息导出失败');
        });
    }

    // 导入发票生成
    if (btn.name == 'billed_notice_import_invoice') {
        // const rids = getSelectedRids(form);
        // let res = await _.http.post('/api/saier/payment/user/check', {
        //     field: 'roles',
        //     position: '财务',
        //     module: form.module.name
        // }).then(res => {
        //     return res;
        // }).catch(err => {
        //     console.error('用户校验失败', err);
        //     return err;
        // });
        // if (!res || Number(res.code) !== 1) {
        //     _.ui.message.error((res && res.msg) || '用户校验失败');
        //     return;
        // }
        // position = res.position || '';
        let ksrq = await _.ui.show_input_date_dialog('请输入到票起始日', new Date().format('yyyy-MM-dd')).then(res => {   
            if (!res || res.trim() === '') {
                _.ui.message.error('到票起始日不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!ksrq) {
            return;
        }
        let jsrq = await _.ui.show_input_date_dialog('请输入到票截止日', new Date().format('yyyy-MM-dd')).then(res => {   
            if (!res || res.trim() === '') {
                _.ui.message.error('到票截止日不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!jsrq) {
            return;
        }
        _.ui.show_upload_dialog({
                title: '导入发票生成',
                url: '/api/saier/billed_notice/import_invoice',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '导入成功',
                error_msg: '导入失败',
                params: {
                    'module': form.module.name,
                    ksrq: ksrq,
                    jsrq: jsrq
                }
            },
            (res) => {
                let d = res.data || ''
                _.http.download('/api/tmp/file/get', {
                    file: d
                }, d);
            })
    }
    // 批量到票信息导入
    if (btn.name == 'billed_notice_invoice_batch_import') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        position = res.position || '';
        _.ui.show_upload_dialog({
                title: '批量到票信息导入',
                url: '/api/saier/billed_notice/invoice_batch_import',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '导入成功',
                error_msg: '导入失败',
                params: {
                    'module': form.module.name,
                    // ksrq: ksrq,
                    // jsrq: jsrq
                }
            },
            (res) => {
                let d = res.data || ''
                _.http.download('/api/tmp/file/get', {
                    file: d
                }, d);
            })
    }
    // 出库单批量
    if (btn.name == 'billed_notice_out_stock_export') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        position = res.position || '';
        let gd = await _.ui.show_input_number_dialog('请输入第17行调整高度', 12.75).then(res => {
            if (!res || res==null || res === '') {
                return 12.75
            }
            console.log('res', res)
            return res;
        }).catch(err => {
            console.error('输入调整高度失败', err);
            return null;
        });
        console.log('gd', gd)
        if (gd == null || gd == undefined) {
            return;
        }; 
        console.log('position', position)
        _.http.post('/api/saier/billed_notice/out_stock_export', {
            rids: rids,
            gd: gd,
            position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('出库单批量导出失败', err);
            _.ui.message.error((err && err.msg) || '出库单批量导出失败');
        });
    }
    // 入库单批量
    if (btn.name == 'billed_notice_in_stock_export') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        position = res.position || '';
        let gd = await _.ui.show_input_number_dialog('请输入第17行调整高度', 12.75).then(res => {
            if (!res || res==null || res === '') {
                return 12.75
            }
            console.log('res', res)
            return res;
        }).catch(err => {
            console.error('输入调整高度失败', err);
            return null;
        });
        console.log('gd', gd)
        if (gd == null || gd == undefined) {
            return;
        }; 
        console.log('position', position)
        _.http.post('/api/saier/billed_notice/in_stock_export', {
            rids: rids,
            gd: gd,
            position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('入库单批量导出失败', err);
            _.ui.message.error((err && err.msg) || '入库单批量导出失败');
        });
    }
    // 备注说明批量导入导出
    if (btn.name == 'billed_notice_batch_memo_import') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        // let res = await _.http.post('/api/saier/payment/user/check', {
        //     field: 'roles',
        //     position: '财务',
        //     module: form.module.name
        // }).then(res => {
        //     return res;
        // }).catch(err => {
        //     console.error('用户校验失败', err);
        //     return err;
        // });
        // if (!res || Number(res.code) !== 1) {
        //     _.ui.message.error((res && res.msg) || '用户校验失败');
        //     return;
        // }
        let kind = await _.ui.show_input_select_dialog('选择处理方式','导出',['导出', '导入']).then(res => {
            if (!res || res.trim() === '') {
                return 12.75
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (kind == null || kind == undefined) {
            return;
        }; 
        if (kind == '导入') {
            _.ui.show_upload_dialog({
                    title: '备注说明批量导入',
                    url: '/api/saier/billed_notice/memo_batch_import',
                    accept: '.xlsx',
                    auto_close: true,
                    success_msg: '导入成功',
                    error_msg: '导入失败',
                    params: {
                        'module': form.module.name
                    }
                },
                (res) => {
                })
        } else {
            _.http.post('/api/saier/billed_notice/memo_batch_export', {
                rids: rids
            }).then(res => {
                let d = res.data || ''
                _.http.download('/api/tmp/file/get', {
                    file: d
                }, d);
            }).catch(err => {
                console.error('备注说明批量导出失败', err);
                _.ui.message.error((err && err.msg) || '备注说明批量导出失败');
            });
        }
    }
    // 刷新逾期
    if (btn.name == 'billed_notice_update_overdue') {
        _.http.post('/api/saier/billed_notice/update_overdue', {
        }).then(res => {
            _.ui.message.success('刷新逾期成功');
        }).catch(err => {
            console.error('刷新逾期失败', err);
            _.ui.message.error((err && err.msg) || '刷新逾期失败');
        });
    }
    // 批量更新业务地区电话
    if (btn.name == 'billed_notice_update_source_phone') {
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
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
        let ywrya = await _.ui.show_input_dialog('请输入业务人员', '').then(res => {
            if (!res || res.trim() === '') {
                _.ui.message.error('业务人员不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!ywrya) {
            return;
        }
        let dq = await _.ui.show_input_dialog('请输入业务人员地区', '').then(res => {
            if (!res || res.trim() === '') {
                _.ui.message.error('业务人员地区不能为空');
                return '';
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!dq) {
            return;
        }
        let lxdh = await _.ui.show_input_dialog('请输入业务人员联系电话', '').then(res => {
            if (!res || res.trim() === '') {
                _.ui.message.error('联系电话不能为空');
                return '';
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!lxdh) {
            return;
        } 
        _.http.post('/api/saier/billed_notice/update_source_phone', {
            ywrya: ywrya,
            dq: dq,
            lxdh: lxdh
        }).then(res => {
            _.ui.message.success('刷新业务地区电话成功');
        }).catch(err => {
            console.error('刷新业务地区电话失败', err);
            _.ui.message.error((err && err.msg) || '刷新业务地区电话失败');
        });
    }
    // 刷新出货日期
    if (btn.name == 'billed_notice_update_shipment_date') {
        let rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let date = await _.ui.show_input_date_dialog('请输入出货日期', '').then(res => {
            if (!res || res==null || res.trim() === '') {
                _.ui.message.error('出货日期不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!date) {
            return;
        }
        _.http.post('/api/saier/billed_notice/update_shipment_date', {
            rids: rids,
            date: date
        }).then(res => {
            _.ui.message.success('刷新出货日期成功');
        }).catch(err => {
            console.error('刷新出货日期失败', err);
            _.ui.message.error((err && err.msg) || '刷新出货日期失败');
        });
    }
    // 刷新出货日期
    if (btn.name == 'billed_notice_batch_shipment_date') {
        let date = await _.ui.show_input_date_dialog('请输入出货日期', '').then(res => {
            if (!res || res==null || res.trim() === '') {
                _.ui.message.error('出货日期不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!date) {
            return;
        }
        let rids = getSelectedRids(form);
         if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        _.http.post('/api/saier/billed_notice/batch_shipment_date', {
            rids: rids,
            date: date
        }).then(res => {
            _.ui.message.success('刷新出货日期成功');
        }).catch(err => {
            console.error('刷新出货日期失败', err);
            _.ui.message.error((err && err.msg) || '刷新出货日期失败');
        });
    }
    // 批量国税发票日期
    if (btn.name == 'billed_notice_update_invoice_date') {
        let rids = getSelectedRids(form);
         if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务'
        }).then(v => {
            return v;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) !== 1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }   
        let date = await _.ui.show_input_date_dialog('请输入国税发票日期', '').then(res => {
            if (!res || res==null || res.trim() === '') {
                _.ui.message.error('国税发票日期不能为空');
                return null;
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (!date) {
            return;
        }
        _.http.post('/api/saier/billed_notice/update_invoice_date', {
            rids: rids,
            date: date
        }).then(res => {
            _.ui.message.success('批量国税发票日期成功');
        }).catch(err => {
            console.error('批量国税发票日期失败', err);
            _.ui.message.error((err && err.msg) || '批量国税发票日期失败');
        });
    }
    // 金蝶预估入库
    if (btn.name == 'billed_notice_kingdee_in_stock') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
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
        let tjrq = await _.ui.show_input_date_dialog('请输入统计月份:', new Date().format('yyyy-MM-dd')).then(res => {
            if (!res || res === null || res.trim() === '') {
                return new Date().format('yyyy-MM-dd')
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (tjrq == null || tjrq == undefined) {
            return;
        }; 
        position = res.position || '';
        _.http.post('/api/saier/billed_notice/kingdee_in_stock', {
            rids: rids,
            tjrq: tjrq,
            position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('金蝶预估入库导出失败', err);
            _.ui.message.error((err && err.msg) || '金蝶预估入库导出失败');
        });
    }
    // 金蝶合同销售
    if (btn.name == 'billed_notice_kingdee_contract') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
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
        position = res.position || '';
        let tjrq = await _.ui.show_input_date_dialog('请输入统计月份:', new Date().format('yyyy-MM-dd')).then(res => {
            if (!res || res === null || res.trim() === '') {
                return new Date().format('yyyy-MM-dd')
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (tjrq == null || tjrq == undefined) {
            return;
        }; 

        _.http.post('/api/saier/billed_notice/kingdee_contract', {
            rids: rids,
            tjrq: tjrq,
            position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('金蝶合同销售导出失败', err);
            _.ui.message.error((err && err.msg) || '金蝶合同销售导出失败');
        });
    }
    // 批量到票
    if (btn.name == 'billed_notice_batch_permit') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let dprq = await _.ui.show_input_date_dialog('请输入到票日期:', new Date().format('yyyy-MM-dd')).then(res => {
            if (!res || res === null || res.trim() === '') {
                return ''
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (dprq == '' || dprq == undefined) {
            _.ui.message.error('到票日期不能为空');
            return;
        }
        if (dprq == null || dprq == undefined) {
            return;
        }; 
        _.http.post('/api/saier/billed_notice/batch_permit', {
            rids: rids,
            dprq: dprq
        }).then(res => {
            _.ui.message.success('批量到票更新成功');
        }).catch(err => {
            console.error('批量到票更新失败', err);
            _.ui.message.error((err && err.msg) || '批量到票更新失败');
        });
    }
    
    // 更改批量到票
    if (btn.name == 'billed_notice_update_permit') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let dprq = await _.ui.show_input_date_dialog('请输入到票日期:', new Date().format('yyyy-MM-dd')).then(res => {
            if (!res || res === null || res.trim() === '') {
                return ''
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (dprq == '' || dprq == null || dprq == undefined) {
            _.ui.message.error('到票日期不能为空');
            return;
        }
        let sccj = await _.ui.show_input_dialog('请输入工厂名称:', '').then(res => {
            if (!res || res === null || res.trim() === '') {
                return ''
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (sccj == null || sccj == undefined) {
            _.ui.message.error('工厂名称不能为空');
            return;
        }
        if (sccj == '') {
            _.ui.message.error('工厂名称不能为空');
            return;
        }
        _.http.post('/api/saier/billed_notice/update_permit', {
            rids: rids,
            dprq: dprq,
            sccj: sccj
        }).then(res => {
            _.ui.message.success('更改批量到票成功');
        }).catch(err => {
            console.error('更改批量到票失败', err);
            _.ui.message.error((err && err.msg) || '更改批量到票失败');
        });
    }
    // 按合同批量解除锁定
    if (btn.name == 'billed_notice_batch_unlock') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务',
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) == -1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }
        let kind = await _.ui.show_input_select_dialog('请选择合同类型:', '采购合同',['采购合同', '外销合同']).then(res => {
            if (!res || res === null || res.trim() === '') {
                return '采购合同'
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (kind == null || kind == undefined) {
            return;
        }; 
        let lock = await _.ui.show_input_select_dialog('请选择处理类型:', '解锁',['解锁', '加锁']).then(res => {
            if (!res || res === null || res.trim() === '') {
                return '解锁'
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (lock == null || lock == undefined) {
            return;
        }; 
        _.ui.show_upload_dialog({
                title: 'A列采购合同号B列货号',
                url: '/api/saier/billed_notice/batch_unlock',
                accept: '.xlsx',
                auto_close: true,
                success_msg: '导入成功',
                error_msg: '导入失败',
                params: {
                    'module': form.module.name,
                    kind: kind,
                    lock: lock
                }
            },
            (res) => {
            })
        return;
    }
    // 批量换汇成本
    if (btn.name == 'billed_notice_batch_exchange_rate') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'position',
            position: '财务',
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) == -1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }
        _.http.post('/api/saier/billed_notice/batch_exchange_rate', {
            rids: rids
        }).then(res => {
            _.ui.message.success('批量换汇成本成功');
        }).catch(err => {
            console.error('批量换汇成本失败', err);
            _.ui.message.error((err && err.msg) || '批量换汇成本失败');
        });
    }
    
    // 财务报关表头
    if (btn.name == 'billed_notice_finace_title') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/billed_notice/user_check', {
            zm: '财务报关表头'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) == -1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }
        let kind = await _.ui.show_input_select_dialog('请选择处理方式:', '当前选中记录',['当前选中记录', 'Excel导入']).then(res => {
            if (!res || res === null || res.trim() === '') {
                return '当前选中记录'
            }
            return res;
        }).catch(err => {
            return null;
        });
        if (kind == null || kind == undefined) {
            return;
        }; 
        if (kind == 'Excel导入') {
            _.ui.show_upload_dialog({
                    title: '财务报关表头导出',
                    url: '/api/saier/billed_notice/finace_title_excel',
                    accept: '.xlsx',
                    auto_close: true,
                    success_msg: '导入成功',
                    error_msg: '导入失败',
                    params: {
                        'module': form.module.name
                    }
                },
                (res) => {
                    let d = res.data || ''
                    _.http.download('/api/tmp/file/get', {
                        file: d
                    }, d);
                })
            return;
        } else {
            _.http.post('/api/saier/billed_notice/finace_title_record', {
                rids: rids
            }).then(res => {
                let d = res.data || ''
                _.http.download('/api/tmp/file/get', {
                    file: d
                }, d);
            }).catch(err => {
                console.error('财务报关表头导出失败', err);
                _.ui.message.error((err && err.msg) || '财务报关表头导出失败');
            });
        }
    }
    // 批量核算发票
    if (btn.name == 'billed_notice_invoice_adjust') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/billed_notice/user_check', {
            zm: '批量核算发票号'
        }).then(res => {
            return res;
        }).catch(err => {
            console.error('用户校验失败', err);
            return err;
        });
        if (!res || Number(res.code) == -1) {
            _.ui.message.error((res && res.msg) || '用户校验失败');
            return;
        }
        _.ui.show_upload_dialog({
            title: '批量核算发票号',
            url: '/api/saier/billed_notice/invoice_adjust',
            accept: '.xlsx',
            auto_close: true,
            success_msg: '导入成功',
            error_msg: '导入失败',
            params: {
                'module': form.module.name
            }
        },
        (res) => {

        })
    }
    // 批量离职交接人员
    if (btn.name == 'billed_notice_batch_responsible') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let username = await _.ui.show_input_dialog('请输入交接人员名字:').then(res => {
            if (!res || res === null || res.trim() === '') {
                return ''
            }
            return res;
        }).catch(err => {
            return null;
        });

        if (username == null || username == undefined ) {
            return;
        }; 
        if (username.trim() == '') {
            _.ui.message.error('交接人员名字不能为空');
            return;
        }
        _.http.post('/api/saier/billed_notice/batch_responsible', {
            rids: rids,
            username: username
        }).then(res => {
            _.ui.message.success('批量交接成功');
        }).catch(err => {
            console.error('批量交接失败', err);
            _.ui.message.error((err && err.msg) || '批量交接失败');
        });
    }
    // 账面利润表
    if (btn.name == 'billed_notice_batch_profit_list') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
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
        _.http.post('/api/saier/billed_notice/batch_profit_list', {
            rids: rids,
            // position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('账面利润表导出失败', err);
            _.ui.message.error((err && err.msg) || '账面利润表导出失败');
        });
    }
    // 表头生成
    if (btn.name == 'billed_notice_excel_title_export') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
            return;
        }
        let res = await _.http.post('/api/saier/payment/user/check', {
            field: 'roles',
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
        _.http.post('/api/saier/billed_notice/excel_title_export', {
            rids: rids,
            // position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('表头生成导出失败', err);
            _.ui.message.error((err && err.msg) || '表头生成导出失败');
        });
    }
    // 未齐发票
    if (btn.name == 'billed_notice_incomplete') {
        const rids = getSelectedRids(form);
        if (rids.length == 0) {
            _.ui.message.error('请至少选择一条记录');
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
        _.http.post('/api/saier/billed_notice/incomplete', {
            rids: rids,
            // position: position
        }).then(res => {
            let d = res.data || ''
            _.http.download('/api/tmp/file/get', {
                file: d
            }, d);
        }).catch(err => {
            console.error('未齐发票导出失败', err);
            _.ui.message.error((err && err.msg) || '未齐发票导出失败');
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], billedNoticeButtonClick, '开票通知');