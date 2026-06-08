 
// 编辑界面数据加载以后执行
const customer_visit_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    // if (_.user.username == 'zjnblh') {
    //     recordset.module.field_by_full_name(n + '.修改清单').show();
    // } else {
    //     recordset.module.field_by_full_name(n + '.修改清单').hide();
    // }
    _.http.post('/api/saier/customer_visit/load/check', {
        djry: recordset.val('登 记 人')
    }).then(res => {
        let d = res.data;
        if (d && recordset.val('业务部门') == '') {
            recordset.val('业务部门', d.bm);
            recordset.val('手机号码', d.ydhm);
            recordset.val('固定电话', d.lxdh);
            recordset.val('业务经理', d.bmjl);
            recordset.val('经理电话', d.jldh);
            recordset.val('短 号', d.sjdh);
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], customer_visit_recordLoad, '客户拜访')
_.evts.on([_.evtids.RECORD_LOAD], customer_visit_recordLoad, '客户来访')

function calculateYearWeek(visitDate) {
  // 提取年、月、日部分
  if (!visitDate || visitDate == '' || visitDate.length < 10) {
    return '';
  }
  const year = visitDate.substring(0, 4);
  const y = visitDate.substring(5, 7); // 月份，注意substring索引是从5开始到6
  const t = visitDate.substring(8, 10); // 日期
  // 构建年初日期
  const n = year + '-01-01';
  // 计算一年中的第几天
  let number = 0;
  // 根据月份累加天数
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const monthIndex = parseInt(y, 10) - 1;
  for (let i = 0; i < monthIndex; i++) {
    number += monthDays[i];
  }
  // 加上当前月的天数
  number += parseInt(t, 10);
  // 计算年初第一天是星期几 (1=星期日, 2=星期一, ..., 7=星期六)
  const firstDayOfYear = new Date(n);
  let ts1 = firstDayOfYear.getDay() + 1; // 调整为1-7格式
  // 调整星期数：1(日)->7, 2(一)->1, 3(二)->2, ..., 7(六)->6
  let ts;
  if (ts1 === 1) {
    ts = 7;
  } else {
    ts = ts1 - 1;
  }
  let z = 0; // 周数
  // 计算周数
  if (number > (8 - ts)) {
    number = number - 8 + ts;
  } else {
    z = 1;
  }
  // 检查是否是闰年
  const yf = parseInt(year, 10);
  const isLeapYear = (yf % 4 === 0 && yf % 100 !== 0) || (yf % 400 === 0);
  if (isLeapYear) {
    if (z !== 1) {
      // 如果是闰年且月份在3月或之后，需要加1天
      if (parseInt(y, 10) >= 3) {
        number += 1;
      }
      // 计算周数
      if (number % 7 === 0) {
        z = Math.trunc(number / 7) + 1;
      } else {
        z = Math.trunc(number / 7) + 2;
      }
    }
  } else {
    if (z !== 1) {
      // 非闰年直接计算周数
      if (number % 7 === 0) {
        z = Math.trunc(number / 7) + 1;
      } else {
        z = Math.trunc(number / 7) + 2;
      }
    }
  }
  // 设置结果
  const weekString = year + '年第' + z + '周';  
  return weekString;
}

// 辅助函数：将字符串转换为整数（模拟Delphi的GetInt）
function getInt(str) {
  return parseInt(str, 10);
}

// 辅助函数：判断是否是闰年
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// 编辑界面字段change后执行
const customer_visit_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (recordset.module.field_by_full_name(m + '.拜访日期') && field.full_name == m + '.拜访日期') {
        if (recordset.val('拜访日期') != null && recordset.val('拜访日期') != '') {
            let nfzs = calculateYearWeek(recordset.val('拜访日期'));
            recordset.val('年份周数', nfzs);
        }
    }
    if (recordset.module.field_by_full_name(m + '.来访日期') && field.full_name == m + '.来访日期') {
        if (recordset.val('来访日期') != null && recordset.val('来访日期') != '') {
            let nfzs = calculateYearWeek(recordset.val('来访日期'));
            recordset.val('年份周数', nfzs);
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customer_visit_field_change, '客户拜访')
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customer_visit_field_change, '客户来访')

// 编辑界面记录保存前执行
const customer_visit_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let nfzs = ''
        if (recordset.module.field_by_full_name('拜访日期')){
            nfzs = calculateYearWeek(recordset.val('拜访日期'));
        } else {
            nfzs = calculateYearWeek(recordset.val('来访日期'));
        }
        recordset.val('年份周数', nfzs);
        _.http.post('/api/saier/customer_visit/save/before', {
            djry: recordset.val('登 记 人'),
        }).then(res => {
            resolve();
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
            reject();
        });
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, customer_visit_before_save, '客户拜访')
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, customer_visit_before_save, '客户来访')

// 编辑界面记录保存前执行
const customer_visit_after_save = (evt_id, recordset) => {
    if (recordset.val('来访日期') == null || recordset.val('来访日期') == '' || recordset.val('公司名称') == '' || recordset.val('公司名称') == '登 记 人') {
        return
    }
    _.http.post('/api/saier/customer_visit/save/after', {
        rid: recordset.val('rid'),
        djry: recordset.val('登 记 人'),
        khmc: recordset.val('公司名称'),
        lfrq: recordset.val('拜访日期')
    }).then(res => {
    }).catch(err => {
        _.ui.message.error(err.msg)
        console.log(err)
    });
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, customer_visit_after_save, '客户来访')