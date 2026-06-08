/**
 * 金额数字转中文大写
 * @param {number|string} money 金额数字（支持负数、小数，最多两位小数）
 * @returns {string} 中文大写金额
 */
function _convertAmount(money) {
    // 负数处理
    let isNegative = false;
    if (typeof money === 'number' && isNaN(money)) return '不是有效数字';
    if (typeof money === 'string' && money.trim() === '') return '金额不能为空';

    let num = parseFloat(money);
    if (isNaN(num)) return '不是有效数字';

    if (num < 0) {
        isNegative = true;
        num = Math.abs(num);
    }
    // 保留两位小数并分割整数小数部分
    const numStr = num.toFixed(2);
    const [integerPart, decimalPart] = numStr.split('.');
    // 中文数字映射
    const chineseNumbers = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    // 整数部分单位（万、亿等）
    const units = ['', '拾', '佰', '仟'];
    const bigUnits = ['', '万', '亿'];

    // 处理整数部分（支持到万亿以内，可扩展）
    function convertInteger(intStr) {
        if (intStr === '0') return '零';

        // 从低位到高位每4位一组
        const len = intStr.length;
        const groups = [];
        for (let i = len; i > 0; i -= 4) {
            const start = Math.max(0, i - 4);
            groups.unshift(intStr.slice(start, i));
        }
        let result = '';
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const groupValue = parseInt(group, 10);
            if (groupValue === 0) continue;

            // 处理每组内（千位以内）
            let groupStr = '';
            const groupLen = group.length;
            let zeroFlag = false;
            for (let j = 0; j < groupLen; j++) {
                const digit = parseInt(group[j], 10);
                const pos = groupLen - j - 1; // 个位0，十位1...
                if (digit === 0) {
                    zeroFlag = true;
                    continue;
                }
                if (zeroFlag) {
                    groupStr += '零';
                    zeroFlag = false;
                }
                groupStr += chineseNumbers[digit] + units[pos];
            }
            // 加上大单位
            const bigUnitIndex = groups.length - i - 1;
            result += groupStr + bigUnits[bigUnitIndex];
        }
        return result;
    }
    // 处理小数部分（角、分）
    function convertDecimal(decimalStr) {
        if (!decimalStr || decimalStr === '00') return '';
        const jiao = parseInt(decimalStr[0], 10);
        const fen = parseInt(decimalStr[1], 10);
        let result = '';
        if (jiao !== 0) result += chineseNumbers[jiao] + '角';
        if (fen !== 0) result += chineseNumbers[fen] + '分';
        return result;
    }
    const intChinese = convertInteger(integerPart);
    const decChinese = convertDecimal(decimalPart);

    let finalResult = intChinese;
    if (decChinese) {
        finalResult += '元' + decChinese;
    } else {
        finalResult += '元整';
    }

    if (isNegative) finalResult = '负' + finalResult;
    return finalResult;
}

function _convertDate(num, isTraditional) {
    const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const n = parseInt(num);
    return isNaN(n) ? '' : chineseNums[n];
}

const overhead_fees_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        // recordset.val('唯一字段', recordset.val('采购合同') + '_' + new Date().format('yyyy-MM-dd hh:mm:ss'))
        _.http.post('/api/saier/overhead_fees/save/check',{
            ssbm: recordset.val('所属部门'),
        }).then(res => {
            let d = res.data
            if (recordset.val('唯一字段') == '') {
                recordset.val('唯一字段', recordset.val('rid'))
            }
            const yhje = String(recordset.val('银行金额'));
            let yhje1 = '';

            for (let i = 0; i < yhje.length; i++) {
                yhje1 += yhje[i] + ' ';
            }
            recordset.val('银行金额1', yhje1);

            recordset.val('付款大写', _convertAmount(recordset.val('付款金额')))
            if (recordset.val('付款日期') !== '' && recordset.val('付款日期') != null) {
                const paymentDate = recordset.val('付款日期');
                // 提取年（前4位）
                const d1 = _convertDate(paymentDate.substring(0, 1), false);
                const d2 = _convertDate(paymentDate.substring(1, 2), false);
                const d3 = _convertDate(paymentDate.substring(2, 3), false);
                const d4 = _convertDate(paymentDate.substring(3, 4), false);
                recordset.val('付 款 年', d1 + d2 + d3 + d4);
                // 提取月（第6、7位，索引5、6）
                const d5 = _convertDate(paymentDate.substring(5, 6), false);
                const d6 = _convertDate(paymentDate.substring(6, 7), false);
                const dd6 = paymentDate.substring(6, 7);
                const dd5 = paymentDate.substring(5, 6);

                if (dd6 === '0') {
                    let d9 = '零' + d5 + '拾';
                    recordset.val('付 款 月', d9);
                } else {
                    recordset.val('付 款 月', d5 + '拾' + d6);
                }

                if (dd5 === '0') {
                    recordset.val('付 款 月', d5 + d6);
                }
                // 提取日（第9、10位，索引8、9）
                const d7 = _convertDate(paymentDate.substring(8, 9), false);
                const d8 = _convertDate(paymentDate.substring(9, 10), false);
                const dd8 = paymentDate.substring(9, 10);
                const dd7 = paymentDate.substring(8, 9);
                if (dd8 === '0') {
                    let t = '零' + d7 + '拾';
                    recordset.val('付 款 日', t);
                } else {
                    recordset.val('付 款 日', d7 + '拾' + d8);
                }

                if (dd7 === '0') {
                    recordset.val('付 款 日', d7 + d8);
                }
            }
            if (recordset.val('所属部门') == '') {
                recordset.val('所属部门', d)
            }
            resolve()
        }).catch(err => {
            _.ui.message.error('保存失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
            reject();
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, overhead_fees_before_save, '管理费用')


// 编辑界面字段change后执行
const overhead_fees_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record.row
    let m = module.name
    if (field.full_name == m + '.采购付款.银行金额') {
        let yhje = recordset.val('银行金额');
        let yhje1 = yhje.split('').join(' ') + (yhje ? ' ' : '');
        recordset.val('银行金额1', yhje1);
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, overhead_fees_field_change, '管理费用')