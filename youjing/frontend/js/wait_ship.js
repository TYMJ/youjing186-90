// 编辑界面字段change后执行
const wait_ship_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let username = _.user.username;
    let m = module.name;
    let row = current_record;
    if (field.full_name == m + ".出运日期" && value != "" && value != null) {
        let cur_date = new Date().format("yyyy-MM-dd");
        let ship_date = recordset.val("出运日期");
        let days = _getDistanceDays(cur_date, ship_date);
        let fkts = recordset.val("付款天数");
        if (days > 30) {
            _.ui.message.error("请注意时间超30天");
        }
        let pay_date = _addDaysDate(ship_date, 30);
        if (fkts > 0) {
            pay_date = _addDaysDate(ship_date, fkts);
        }
        recordset.val("付款日期", pay_date);
        recordset.val("收汇期限", pay_date);
        recordset.val("发信识别", "否");
    }
    if (field.full_name == m + ".发票日期" && value != "" && value != null) {
        let cur_date = new Date().format("yyyy-MM-dd");
        let invoice_date = recordset.val("发票日期");
        let days = _getDistanceDays(cur_date, invoice_date);
        if (days > 30) {
            _.ui.message.error("请注意时间超30天");
        }
    }
    // if (field.full_name == m + '.货柜类型' && value != '' && value != null) {
    //     let hglx = recordset.val('货柜类型')
    //     if (hglx.includes('LCL')) {
    //         recordset.module.field_by_full_name(m + '.收到进仓回执').show()
    //     } else {
    //         recordset.module.field_by_full_name(m + '.收到进仓回执').hide()
    //     }
    // }

    // if (field.full_name == m + '.RMB客户') {
    //     let ywhj = recordset.val('义乌1合计')
    //     let rmbkh = recordset.val('RMB客户')
    //     let hl = recordset.val('汇    率')
    //     if (ywhj < 1) {
    //         let t = recordset.tables['产品资料']
    //         let v = t.view_data
    //         for (let r of v) {
    //             let wxzj = r.wxzj
    //             let zmyhl = r.zmyhl
    //             let khrbzj = r.mjzj
    //             r.wxzjz = round(Math.floor(wxzj * zmyhl * 10000) / 10000, 3)
    //             if (rmbkh == '是' && khrbzj > 0 && hl != 0 && hl != 1) {
    //                 if (sfgd != '' && sfgd != undefined && sfgd != null) {
    //                     r.wxzjz = round(Math.floor((khrbzj / hl) * 10000), 3)
    //                 }
    //             }
    //             t.push_modi_rid(r.rid)
    //         }
    //         t.sync_operate_data()
    //         t.modified = true
    //         recordset.do_re_sum_by_trigger_table('产品资料')
    //     }
    // }

    // if (field.full_name == m + '.汇    率') {
    //     let hl = recordset.val('汇    率')
    //     if (hl == 0 || hl == '' || hl == 1) {
    //         _.http
    //             .post('/api/saier/shipment/khmc/change', {
    //                 khmc: value,
    //             })
    //             .then((res) => {
    //                 let d = res.data
    //                 if (d && d != null && d != 0) {
    //                     recordset.val('汇    率', d)
    //                 }
    //             })
    //             .catch((err) => {
    //                 _.ui.message.error(err.msg)
    //                 console.error(err)
    //             })
    //     }
    // }
    // if (
    //     field.full_name == m + '.货币代码' ||
    //     field.full_name == m + '.发票号码'
    // ) {
    //     let xszb = recordset.val('货币代码')
    //     let fphm = recordset.val('发票号码')
    //     if (xszb != '' && fphm != '') {
    //         if (fphm.toUpperCase().includes('AMZ')) {
    //             recordset.module.group_by_name('电商费用').visible = true
    //             _.http
    //                 .post('/api/saier/shipment/get/dshl', {
    //                     xszb: xszb,
    //                     fphm: fphm,
    //                 })
    //                 .then((res) => {
    //                     let d = res.data
    //                     if (d && d != null && d != 0) {
    //                         recordset.val('电商汇率', d)
    //                     }
    //                 })
    //                 .catch((err) => {
    //                     _.ui.message.error(err.msg)
    //                     console.error(err)
    //                 })
    //         } else {
    //             recordset.module.group_by_name('电商费用').visible = false
    //         }
    //     }
    // }
    // if (
    //     field.full_name == m + '.货币代码' ||
    //     field.full_name == m + '.汇    率' ||
    //     field.full_name == m + '.RMB客户'
    // ) {
    //     let xszb = recordset.val('货币代码')
    //     let rmbkh = recordset.val('RMB客户')
    //     let hl = recordset.val('汇    率')
    //     if (
    //         xszb != '' &&
    //         rmbkh != '是' &&
    //         hl > 0 &&
    //         xszb != 'USD' &&
    //         xszb != 'USD$' &&
    //         xszb != 'RMB'
    //     ) {
    //         _.http
    //             .post('/api/saier/shipment/hl/change', {
    //                 xszb: xszb,
    //                 fphm: fphm,
    //             })
    //             .then((res) => {
    //                 let d = res.data
    //                 if (d && d != null && d != 0) {
    //                     recordset.val(
    //                         '转美元汇率',
    //                         round(Math.floor((hl / d) * 1000000) / 1000000, 3),
    //                     )
    //                 } else {
    //                     recordset.val('转美元汇率', 1)
    //                 }
    //                 if (
    //                     recordset.val('转美元汇率') <= 0 ||
    //                     recordset.val('转美元汇率') == ''
    //                 ) {
    //                     recordset.val('转美元汇率', 1)
    //                 }
    //                 calc_items_usd_amount(recordset, rmbkh, recordset.val('转美元汇率'))
    //             })
    //             .catch((err) => {
    //                 _.ui.message.error(err.msg)
    //                 console.error(err)
    //             })
    //     } else {
    //         recordset.val('转美元汇率', 1)
    //         calc_items_usd_amount(recordset, rmbkh, 1)
    //     }
    // }
    if (
        field.full_name == m + ".核算发票" ||
        field.full_name == m + ".业务人员"
    ) {
        let hxfp = recordset.val("核算发票");
        let ywry = recordset.val("业务人员");
        let fphm = recordset.val("发票号码");
        _.http
            .post("/api/saier/shipment/ywry/change", {
                hxfp: hxfp,
                ywry: ywry,
                fphm: fphm,
            })
            .then((res) => {
                let d = res.data;
                if (d && d != null && d != "") recordset.val("业务部门", d);
            })
            .catch((err) => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
    }
    // if (field.full_name == m + '.提运单号') {
    //     let tydh = recordset.val('提运单号')
    //     if (
    //         recordset.val('飞驼提运单号') == '' ||
    //         recordset.val('飞驼提运单号') == null
    //     ) {
    //         recordset.val('飞驼提运单号', tydh)
    //     }
    // }
    if (field.full_name == m + ".装柜日期") {
        if (value != "" && value != null) {
            let zgrq = recordset.val("装柜日期");
            let date = _addDaysDate(zgrq, 10);
            recordset.val("装柜日期加", date);
            _.http
                .post("/api/saier/shipment/zgrq/change", {
                    fphm: recordset.val("发票号码"),
                    zgrq: zgrq,
                    zgrqj: date,
                })
                .then((res) => {
                    let d = res.data;
                    if (d && d != null && d != 0) {
                        recordset.val("汇    率", d);
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        } else {
            recordset.val("装柜日期加", null);
        }
    }
    if (field.full_name == m + ".进港日期") {
        let jgrq = recordset.val("进港日期");
        let cydh = recordset.val("出运单号");
        if (cydh != "" && cydh != null) {
            _.http
                .post("/api/saier/shipment/jgrq/change", {
                    jgrq: jgrq,
                    cydh: cydh,
                })
                .then((res) => {})
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }
    if (field.full_name == m + ".LC信保" || field.full_name == m + ".是否信保") {
        let sfxb = recordset.val("是否信保");
        let lcxb = recordset.val("LC信保");
        _.http
            .post("/api/saier/shipment/sfxb/change", {
                sfxb: sfxb,
                khbh: recordset.val("客户编号"),
            })
            .then((res) => {
                let d = res.data;
                if (sfxb == "是") {
                    if (lcxb == "是") {
                        recordset.val("信保费率", d.LCfl);
                        recordset.val("约定期限", d.LCydqx);
                    } else {
                        recordset.val("约定期限", d.ydqx);
                        recordset.val("付款天数", d.ydqx);
                    }
                } else {
                    if (d.zfqx > 0) {
                        recordset.val("约定期限", d.zfqx);
                        recordset.val("付款天数", d.zfqx);
                    } else {
                        recordset.val("约定期限", d.fkys);
                        recordset.val("付款天数", d.fkys);
                    }
                    recordset.val("LC信保", "否");
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
    }
    let fields = [
        m + ".发票日期",
        m + ".实际出运",
        m + ".预计到港",
        m + ".付款日期",
        m + ".出运日期",
        m + ".进港日期",
    ];
    if (fields.includes(field.full_name)) {
        if (
            recordset.val("出运日期") == "" ||
            recordset.val("出运日期") == null ||
            recordset.val("发票日期") == "" ||
            recordset.val("发票日期") == null ||
            recordset.val("实际出运") == "" ||
            recordset.val("实际出运") == null ||
            recordset.val("付款日期") == "" ||
            recordset.val("付款日期") == null ||
            recordset.val("进港日期") == "" ||
            recordset.val("进港日期") == null ||
            recordset.val("预计到港") == "" ||
            recordset.val("预计到港") == null
        ) {
            let cur_date = new Date().format("yyyy-MM-dd");
            let invoice_date = recordset.val("发票日期");
            let days = _getDistanceDays(cur_date, invoice_date);
            if (days > 30) {
                _.ui.message.error("请注意时间超30天");
            }
            // 定义常量
            const DATE_FIELDS = {
                1: "发票日期",
                2: "实际出运",
                3: "预计到港",
                4: "付款日期",
                5: "出运日期",
                6: "进港日期",
            };
            const MONTH_MAP = {
                "01": "JAN",
                1: "JAN",
                "02": "FEB",
                2: "FEB",
                "03": "MAR",
                3: "MAR",
                "04": "APR",
                4: "APR",
                "05": "MAY",
                5: "MAY",
                "06": "JUN",
                6: "JUN",
                "07": "JUL",
                7: "JUL",
                "08": "AUG",
                8: "AUG",
                "09": "SEP",
                9: "SEP",
                10: "OCT",
                11: "NOV",
                12: "DEC",
            };
            const ENGLISH_FIELDS = {
                发票日期: "发票日期英",
                实际出运: "实际出运英",
                预计到港: "预计到港英",
                付款日期: "付款日期英",
                进港日期: "进港日期英",
            };
            // 解析日期字符串
            function parseDateString(dateStr) {
                if (!dateStr || dateStr.length < 8) return null;
                const result = {
                    year: "",
                    month: "",
                    day: "",
                    monthNum: "",
                };
                // 获取年份（前4位）
                result.year = dateStr.substring(0, 4);
                // 判断分隔符格式（第8位是否为'-'）
                const separator = dateStr.substring(7, 8);
                if (separator === "-") {
                    // 格式：YYYY-MM-DD
                    result.month = dateStr.substring(5, 7);
                    result.monthNum = dateStr.substring(5, 7);
                    // 检查是否有两位数日期
                    const daySeparator = dateStr.substring(9, 10);
                    if (daySeparator !== "") {
                        result.day = dateStr.substring(8, 10);
                    } else {
                        result.day = "0" + dateStr.substring(8, 10);
                    }
                } else {
                    // 格式：YYYY-M-D
                    result.month = "0" + dateStr.substring(5, 6);
                    result.monthNum = "0" + dateStr.substring(5, 6);
                    // 检查日期位数
                    const dayCheck = dateStr.substring(8, 9);
                    if (dayCheck !== "") {
                        result.day = dateStr.substring(7, 9);
                    } else {
                        result.day = "0" + dateStr.substring(7, 8);
                    }
                }
                return result;
            }
            // 主处理函数
            function processDates(recordset) {
                for (let i = 1; i <= 6; i++) {
                    const ly = DATE_FIELDS[i];
                    if (!ly) continue;
                    // 根据i的值选择数据源
                    const dateStr = recordset.val(ly);

                    // 解析日期
                    const parsedDate = parseDateString(dateStr);
                    if (!parsedDate) continue;

                    // 获取月份英文缩写
                    const qsy = MONTH_MAP[parsedDate.monthNum] || "";
                    if (!qsy) continue;

                    // 格式化英文日期
                    const englishDate = `${qsy}.${parsedDate.day},${parsedDate.year}`;

                    // 设置英文日期字段
                    if (ENGLISH_FIELDS[ly]) {
                        recordset.val(ENGLISH_FIELDS[ly], englishDate);
                    }
                    // 特殊处理"出运日期"
                    if (ly === "出运日期") {
                        recordset.val("起始年", parsedDate.year);
                        recordset.val("起始月", parsedDate.month);
                        recordset.val("起始日", parsedDate.day);
                        recordset.val("起始月英", qsy);
                    }
                }
            }
            processDates(recordset);
        }
    }
    fields = [m + ".实际出运", m + ".出运日期", m + ".货物状态"];
    if (fields.includes(field.full_name)) {
        // 定义日期字段配置
        const dateFields = [{
                field: "出运日期",
                resultField: "出运周",
                yearField: "出运年",
                monthField: "出运年月",
            },
            {
                field: "实际出运",
                resultField: "实际周",
            },
        ];
        // 计算周数的核心函数
        function calculateWeekNumber(year, month, day) {
            // 构建当月第一天的日期字符串
            const firstDayOfMonth = `${year}-${month}-01`;
            // 获取当月第一天是星期几（转换为数字，1-7，周一为1，周日为7）
            const firstDayWeekday = getChineseWeekDay(firstDayOfMonth);
            // 获取当前日期
            const currentDay = parseInt(day, 10);
            // 计算周数
            return getWeekOfMonth(currentDay, firstDayWeekday);
        }
        // 获取中文习惯的星期几（周一=1，周日=7）
        function getChineseWeekDay(dateStr) {
            const date = new Date(dateStr);
            // JavaScript中getDay()返回：0=周日，1=周一，...，6=周六
            const jsDay = date.getDay();
            // 转换为中文习惯：周一=1，周日=7
            return jsDay === 0 ? 7 : jsDay;
        }
        // 计算一个月中的第几周
        function getWeekOfMonth(day, firstDayWeekday) {
            // 如果日期在当月第一周内
            if (day <= 8 - firstDayWeekday) {
                return 1;
            }
            // 计算剩余天数
            const remainingDays = day - (8 - firstDayWeekday);
            // 计算周数：剩余天数除以7，向上取整，再加1
            return Math.ceil(remainingDays / 7) + 1;
        }
        dateFields.forEach((config, index) => {
            const dateStr = recordset.val(config.field);
            // 如果日期为空，跳过处理
            if (dateStr) {
                // 解析日期
                const year = dateStr.substring(0, 4);
                const month = dateStr.substring(5, 7);
                const day = dateStr.substring(8, 10);

                // 为第一个字段（出运日期）设置年份和年月
                if (index === 0) {
                    recordset.val("出运年", year);
                    recordset.val("出运年月", `${year}-${month}`);
                }
                // 计算周数
                const weekNumber = calculateWeekNumber(year, month, day);
                // 设置结果
                recordset.val(config.resultField, weekNumber.toString());
            }
        });
    }
    if (field.full_name == m + ".客户名称" && value != "") {
        _.http
            .post("/api/saier/shipment/khmc/change", {
                khmc: value,
            })
            .then((res) => {
                let d = res.data;
                if (d) {
                    recordset.val("约定期限", d.ydqx);
                    if (recordset.val("RMB客户") == "") recordset.val("RMB客户", d.RMBkh);
                    if (d.RMBkh == "是") recordset.val("货币代码", "RMB");
                    if (recordset.val("付款天数") == 0) {
                        if (d.fkys > 0 || d.zfqx) {
                            if (d.zfqx > 0) {
                                recordset.val("付款天数", d.zfqx);
                            } else {
                                recordset.val("付款天数", d.fkys);
                            }
                        } else {
                            if (d.ydqx > 0) {
                                recordset.val("付款天数", d.ydqx);
                            } else {
                                recordset.val("付款天数", d.LCydqx);
                            }
                        }
                    }
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
    }
    if (
        field.full_name == m + ".货物状态" ||
        field.full_name == m + ".出运日期"
    ) {
        let wxfp = recordset.val("发票号码");
        if (
            wxfp != "" &&
            wxfp != null &&
            recordset.val("出运日期") != "" &&
            recordset.val("出运日期") != null
        ) {
            let fpsb = "," + wxfp.substring(0, 4) + ",";
            let ysfs = recordset.val("运输方式");
            if (ysfs != "" && ysfs != null) {
                ysfs = "," + ysfs;
            }
            _.http
                .post("/api/saier/shipment/hhzt/change", {
                    khmc: recordset.val("客户名称"),
                    hwzt: recordset.val("货物状态"),
                    ysfs: ysfs,
                    fpsb: fpsb,
                    wxfp: wxfp,
                    hglx: recordset.val("货柜类型"),
                })
                .then((res) => {
                    let d = res.data;
                    if (d) {
                        let gdsb = d.gdsb;
                        let bptjx = d.bptjx;
                        let bptjd = d.bptjd;
                        if (bptjx > 0 || bptjd > 0) {
                            if (
                                recordset.val("体积合计") > bptjd ||
                                recordset.val("体积合计") < bptjx
                            ) {
                                recordset.val("货物状态", "体积不对");
                                _.ui.message.error(
                                    "请注意BP客人体积要在" + bptjx + "-" + bptjd + "之间",
                                );
                            }
                        }
                        let t = recordset.tables["产品资料"];
                        let v = t.view_data;
                        if (gdsb == 0) {
                            for (let r of v) {
                                let sfgd = r.sfgd;
                                if (sfgd != "" && sfgd != undefined && sfgd != null) {
                                    if (sfgd == "解锁") {
                                        gdsb = 1;
                                        break;
                                    } else {
                                        gdsb = 2;
                                        break;
                                    }
                                }
                            }
                        }
                        if (gdsb == 1 || gdsb == 2 || gdsb == 3) {
                            if (gdsb == 3) {
                                _.ui.message.error("此票在出运计划为风控暂扣状态");
                                recordset.val("货物状态", "风控暂扣");
                            } else {
                                if (gdsb == 1) {
                                    recordset.val("货物状态", "有改价");
                                    _.ui.message.error(
                                        "有改单产品，请核实(产品资料——扩展——更新信息)",
                                    );
                                } else {
                                    recordset.val("货物状态", "有改出运");
                                    _.ui.message.error(
                                        "有改单产品，请核实(产品资料——扩展——批量更新出运信息)",
                                    );
                                }
                            }
                        } else {
                            if (
                                recordset.val("货物状态") == "已出运" &&
                                recordset.val("出运日期") != "" &&
                                recordset.val("出运日期") != null
                            ) {
                                recordset.val("web判断1", "是1");
                                recordset.val("web判断3", "是1");
                            } else {
                                recordset.val("web判断1", "是2");
                            }
                        }
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }
    if (
        field.full_name == m + ".产品资料.外箱容量" ||
        field.full_name == m + ".产品资料.箱    数"
    ) {
        if (
            recordset.val("强制更新") != "是" &&
            recordset.val("强制更新") != "是1" &&
            (recordset.value("产品资料.是否拼箱", row) == "否" ||
                recordset.value("产品资料.是否拼箱", row) == "") &&
            recordset.value("产品资料.箱    数", row) > 0
        ) {
            recordset.val(
                "产品资料.出货数量",
                recordset.value("产品资料.箱    数", row) *
                recordset.value("产品资料.外箱容量", row),
                row,
            );
        }
    }
    if (
        field.full_name == m + ".产品资料.包装长度" ||
        field.full_name == m + ".产品资料.包装宽度" ||
        field.full_name == m + ".产品资料.包装高度"
    ) {
        if (
            recordset.val("强制更新") != "是" &&
            recordset.val("强制更新") != "是1"
        ) {
            let bzcd = recordset.value("产品资料.包装长度", row);
            let bzkd = recordset.value("产品资料.包装宽度", row);
            let bzgd = recordset.value("产品资料.包装高度", row);
            let bztj = (bzcd * bzkd * bzgd) / 1000000;
            let khmc = recordset.val("客户名称");
            if (bztj != 0) {
                if (
                    (khmc != "" &&
                        khmc != null &&
                        khmc.toUpperCase().includes("AMAZON")) ||
                    recordset.val("特殊出运") == "是"
                ) {
                    recordset.val("产品资料.外箱体积", bztj, row);
                } else {
                    recordset.val(
                        "产品资料.外箱体积",
                        Math.round(bztj * 1000) / 1000,
                        row,
                    );
                    if (recordset.value("产品资料.外箱体积", row) < 0.001) {
                        recordset.val("产品资料.外箱体积", 0.001, row);
                    }
                }
            }
        }
    }
    if (field.full_name == m + ".产品资料.出运唯一字段12" && value != "") {
        if (
            recordset.val("强制更新") != "是" &&
            recordset.val("强制更新") != "是1"
        ) {
            _.http
                .post("/api/saier/shipment/cywyzd/change", {
                    cywyzd: value,
                })
                .then((res) => {
                    let d = res.data;
                    if (d) {
                        let zyhh = d.zyhh;
                        let khhh = d.khhh;
                        if (khhh != "" && khhh != null) {
                            recordset.val("产品资料.产品编号", khhh, row);
                        } else {
                            recordset.val("产品资料.产品编号", zyhh, row);
                        }
                        recordset.val("产品资料.专业产品编号", zyhh, row);
                        recordset.val("产品资料.原产品编号", zyhh, row);
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }
    if (field.full_name == m + ".产品资料.出运唯一字段123" && value != "") {
        if (
            recordset.val("强制更新") != "是" &&
            recordset.val("强制更新") != "是1"
        ) {
            if (
                recordset.val("产品引入") != "是" &&
                recordset.val("产品引入") != "否1"
            ) {} else {
                _.http
                    .post("/api/saier/shipment/cywyzd/change", {
                        cywyzd: value,
                    })
                    .then((res) => {
                        let d = res.data;
                        if (d) {
                            let zyhh = d.zyhh;
                            let khhh = d.khhh;
                            if (khhh != "" && khhh != null) {
                                recordset.val("产品资料.产品编号", khhh, row);
                            } else {
                                recordset.val("产品资料.产品编号", zyhh, row);
                            }
                            recordset.val("产品资料.专业产品编号", zyhh, row);
                            recordset.val("产品资料.原产品编号", zyhh, row);
                        }
                    })
                    .catch((err) => {
                        _.ui.message.error(err.msg);
                        console.error(err);
                    });
            }
        }
    }
    fields = [
        m + ".产品资料.退 税 率",
        m + ".产品资料.工厂名称",
        m + ".产品资料.进仓日期",
        m + ".产品资料.结算方式",
        m + ".产品资料.采购总价",
    ];
    if (fields.includes(field.full_name)) {
        let cywyzd = recordset.value("产品资料.出运唯一字段", row);
        if (
            recordset.val("强制更新") != "是" &&
            recordset.val("强制更新") != "是1" &&
            recordset.val("强制更新") == "是123" &&
            cywyzd != "" &&
            cywyzd != null
        ) {
            _.http
                .post("/api/saier/shipment/tsl/change", {
                    cywyzd: cywyzd,
                })
                .then((res) => {
                    let d = res.data;
                    if (d == 0) {
                        if (recordset.value("产品资料.引用识别", row) == "是") {
                            recordset.val("产品资料.改价判断2", "是", row);
                            recordset.val("产品资料.web判断2", "是", row);
                        }
                    } else {
                        _.ui.message.error("此票已生成开票通知，更改请通知财务");
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }
    if (field.full_name == m + ".产品资料.毛    重" && value != "") {
        if (recordset.val("强制更新") != "是") {
            let wxzmz =
                recordset.value("产品资料.毛    重", row) *
                recordset.val("产品资料.箱    数", row);
            recordset.val("产品资料.总 毛 重", Math.round(wxzmz * 10) / 10, row);
            if (recordset.value("产品资料.毛    重1", row) > 0) {
                if (recordset.value("自动净重", row) != "否") {
                    if (recordset.value("产品资料.毛    重", row) > 0) {
                        let yjz = recordset.value("产品资料.净    重1", row);
                        if (yjz == 0) {
                            yjz = recordset.value("产品资料.净    重", row);
                        }
                        let mz1 = recordset.value("产品资料.毛    重1", row);
                        if (mz1 == 0) {
                            mz1 = recordset.value("产品资料.毛    重", row);
                        }
                        let mz2 = recordset.value("产品资料.毛    重", row);
                        if (mz2 > mz1) {
                            let mz = mz2 - mz1;
                            let xjz = yjz / mz1;
                            let mz3 = Math.round(mz * xjz * 100) / 100;
                            recordset.val("产品资料.净    重", yjz + mz3, row);
                            recordset.val("产品资料.净    重1", yjz + mz3, row);
                        } else if (mz2 < mz1) {
                            let mz = mz1 - mz2;
                            let xjz = yjz / mz1;
                            let mz3 = Math.round(mz * xjz * 100) / 100;
                            recordset.val("产品资料.净    重", yjz - mz3, row);
                            recordset.val("产品资料.净    重1", yjz - mz3, row);
                        }
                    }
                }
            } else {
                recordset.val(
                    "产品资料.毛    重1",
                    recordset.value("产品资料.毛    重", row),
                    row,
                );
            }
        }
    }
    if (field.full_name == m + ".产品资料.净    重" && value != "") {
        if (recordset.val("强制更新") != "是") {
            recordset.val(
                "产品资料.净    重1",
                recordset.value("产品资料.净    重", row),
                row,
            );
        }
    }
    // if (field.full_name == m + '.产品资料.赠送' && value != '') {
    //     if (
    //         recordset.val('强制更新') != '是' &&
    //         (recordset.value('产品资料.赠送', row) == '是' ||
    //             recordset.value('产品资料.赠送', row) == '工厂' ||
    //             recordset.value('产品资料.赠送', row) == '客人')
    //     ) {
    //         recordset.val(
    //             '产品资料.外销唯一字段2',
    //             recordset.value('产品资料.外销唯一字段', row), row
    //         )
    //         recordset.val('产品资料.唯一字段2', recordset.value('产品资料.唯一字段', row), row)
    //         if (
    //             recordset.value('产品资料.赠送', row) == '是' ||
    //             recordset.value('产品资料.赠送', row) == '客人'
    //         ) {
    //             recordset.val('产品资料.外销唯一字段', '', row)
    //             recordset.val(
    //                 '产品资料.外销合同',
    //                 recordset.value('产品资料.外销合同', row) + '赠送', row
    //             )
    //             recordset.val('产品资料.外销单价', 0, row)
    //             recordset.val('产品资料.外销总价', 0, row)
    //             recordset.val('产品资料.赔款单价', 0, row)
    //             recordset.val('产品资料.客户RMB单价', 0, row)
    //             recordset.val('产品资料.赔款RMB', 0, row)
    //             recordset.val('产品资料.客户RMB总价', 0, row)
    //             recordset.val('产品资料.外销总价总', 0, row)
    //             recordset.val('产品资料.佣金单价', 0, row)
    //             recordset.val('产品资料.佣金比率', 0, row)
    //             recordset.val('产品资料.佣    金', 0, row)
    //             recordset.val('产品资料.暗佣比率', 0, row)
    //             recordset.val('产品资料.暗佣单价', 0, row)
    //             recordset.val('产品资料.暗佣佣金', 0, row)
    //             recordset.val('产品资料.客户RMB总价9', 0, row)
    //             recordset.val('产品资料.总 金 额9', 0, row)
    //             recordset.val('产品资料.佣金M', 0, row)
    //             recordset.val('产品资料.佣金R', 0, row)
    //             recordset.val('产品资料.外销总价总分', 0, row)
    //             recordset.val('产品资料.佣金R1', 0, row)
    //             recordset.val('产品资料.佣金M1', 0, row)
    //             recordset.val('产品资料.暗佣R1', 0, row)
    //             recordset.val('产品资料.暗佣M1', 0, row)
    //             recordset.val('产品资料.佣金R11', 0, row)
    //             recordset.val('产品资料.佣金M11', 0, row)
    //             recordset.val('产品资料.佣金总价', 0, row)
    //         }
    //         if (
    //             recordset.val('产品资料.赠送') == '是' ||
    //             recordset.val('产品资料.赠送') == '工厂'
    //         ) {
    //             recordset.val('产品资料.唯一字段', '', row)
    //             recordset.val('产品资料.配柜唯一', '', row)
    //             recordset.val(
    //                 '产品资料.采购合同',
    //                 recordset.value('产品资料.采购合同', row) + '赠送',
    //                 row
    //             )
    //             recordset.val('产品资料.采购单价', 0, row)
    //             recordset.val('产品资料.辅料价格', 0, row)
    //             recordset.val('产品资料.辅料总价', 0, row)
    //             recordset.val('产品资料.采购总价', 0, row)
    //         }
    //     }
    // }
    if (field.full_name == m + ".产品资料.海关编码" && value != "") {
        let hgbm = recordset.value("产品资料.海关编码", row);
        let zzsl = recordset.val("产品资料.增值税率", row);
        if (zzsl != 3 && zzsl != 1 && zzsl == 0) {
            _.http
                .post("/api/saier/shipment/hgbm/change", {
                    hgbm: hgbm,
                })
                .then((res) => {
                    let d = res.data;
                    if (d) {
                        recordset.val("产品资料.退 税 率", d.tsl, row);
                        recordset.val("产品资料.申报要素", d.cznr, row);
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }
    // if (field.full_name == m + '.产品资料.采购单价' && value != '') {
    //     _.http
    //         .post('/api/saier/shipment/hgbm/change', {
    //             hgbm: hgbm,
    //         })
    //         .then((res) => {
    //             let d = res.data
    //             if (d) {
    //                 let sz1 = d.sz1
    //                 let sz = d.sz
    //                 let cgdj = recordset.value('产品资料.采购单价', row)
    //                 if (Number(sz1) > 0) {
    //                     let qgdj = round((cgdj * Number(sz)) / Number(sz1), 3)
    //                     recordset.val('产品资料.清关单价', qgdj, row)
    //                 }
    //             }
    //         })
    //         .catch((err) => {
    //             _.ui.message.error(err.msg)
    //             console.error(err)
    //         })
    // }

    // if (field.full_name == m + '.预填情况.预填数量') {
    //     if (
    //         recordset.value('预填情况.预填数量', row) == recordset.value('产品资料.出运数量', row)
    //     ) {
    //         recordset.val('产品资料.数量有无差值', '无', row)
    //     } else {
    //         recordset.val('产品资料.数量有无差值', '有', row)
    //     }
    // }
    if (field.full_name == m + ".产品资料.出货数量") {
        if (
            recordset.val("强制更新") != "是123" &&
            recordset.val("强制更新") != "是1" &&
            recordset.val("强制更新") != "是"
        ) {
            if (
                recordset.value("产品资料.出货数量", row) != 0 &&
                recordset.value("产品资料.采购单价", row) != 0
            ) {
                recordset.val(
                    "产品资料.采购总价",
                    round(
                        recordset.value("产品资料.出货数量", row) *
                        recordset.value("产品资料.采购单价", row),
                        2,
                    ),
                    row,
                );
            }
            let zje = 0;
            _.http
                .post("/api/saier/shipment/item/chsl/change", {})
                .then((res) => {
                    let d = res.data;
                    if (recordset.value("产品资料.RMB客户", row) != "是") {
                        if (
                            recordset.value("产品资料.出货数量", row) != 0 &&
                            recordset.value("产品资料.外销单价", row) != 0
                        ) {
                            recordset.val(
                                "产品资料.外销总价",
                                recordset.value("产品资料.外销单价", row) *
                                recordset.value("产品资料.出货数量", row),
                                row,
                            );
                        }
                        zje = recordset.value("产品资料.外销总价", row);
                    } else {
                        if (
                            recordset.value("产品资料.出货数量", row) != 0 &&
                            recordset.value("产品资料.客户RMB单价", row) != 0
                        ) {
                            recordset.val(
                                "产品资料.客户RMB总价",
                                recordset.value("产品资料.客户RMB单价", row) *
                                recordset.value("产品资料.出货数量", row),
                                row,
                            );
                        }
                        zje = recordset.value("产品资料.客户RMB总价", row);
                    }
                    if (recordset.value("产品资料.出货数量", row) != 0) {
                        if (recordset.value("产品资料.佣金比率", row) > 0 && d != 1) {
                            recordset.val(
                                "产品资料.佣    金",
                                zje * recordset.value("产品资料.佣金比率", row),
                                row,
                            );
                        } else {
                            if (recordset.value("产品资料.佣金单价", row) > 0) {
                                recordset.val(
                                    "产品资料.佣    金",
                                    recordset.value("产品资料.佣金单价", row) *
                                    recordset.value("产品资料.出货数量", row),
                                    row,
                                );
                            }
                        }
                        if (recordset.value("产品资料.暗佣比率", row) > 0 && d != 1) {
                            recordset.val(
                                "产品资料.暗佣佣金",
                                zje * recordset.value("产品资料.暗佣比率", row),
                                row,
                            );
                        } else {
                            if (recordset.value("产品资料.暗佣单价", row) > 0) {
                                recordset.val(
                                    "产品资料.暗佣佣金",
                                    recordset.value("产品资料.暗佣单价", row) *
                                    recordset.value("产品资料.出货数量", row),
                                    row,
                                );
                            }
                        }
                    } else {
                        recordset.val("产品资料.佣    金", 0, row);
                        recordset.val("产品资料.暗佣佣金", 0, row);
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.error(err);
                });
        }
    }

    if (field.full_name == m + ".出运单号" && value != "") {
        _.http
            .post("/api/saier/shipment/cydh/change", {
                cydh: value,
                fphm: (recordset.val("发票号码") || "").trim(),
                wyzd: (recordset.val("唯一字段") || "").trim(),
            })
            .then((res) => {
                const d = res.data || {};
                // 1) 后端基础校验失败：提示并清空出运单号
                if (d.has_error) {
                    _.ui.message.error(d.error_msg || "出运单号校验失败");
                    recordset.val("出运单号", "");
                    return;
                }
                // 2) 回填基础字段：核算发票、装柜费用、出票判断、发票order、唯一字段
                if (d.hxfp) {
                    recordset.val("核算发票", d.hxfp);
                }
                // if (Number(d.zgfy || 0) > 0) {
                //     recordset.val('装柜费用', Number(d.zgfy || 0))
                // }
                if (d.duplicate_ysfp) {
                    _.ui.message.error("请注意此发票号已用在核算发票上需更改");
                    recordset.val("发票号码", "");
                }
                recordset.val("出票判断", d.cpd || "否");
                if (d.fporder !== undefined) {
                    recordset.val("发票order", d.fporder || "");
                }
                if (d.new_wyzd) {
                    recordset.val("唯一字段", d.new_wyzd);
                }
                // 3) 按 chyjh 查询结果做批量字段联动
                const chyjh = d.chyjh || {};
                if (chyjh.ysfp) {
                    recordset.val("核算发票", chyjh.ysfp);
                }

                if (!recordset.val("核算发票")) {
                    shipment_set_if_empty(
                        recordset,
                        "核算发票",
                        recordset.val("发票号码"),
                    );
                }
                // shipment_set_if_empty(recordset, '明佣合计', Number(chyjh.myjje || 0))
                // shipment_set_if_empty(recordset, '暗佣合计', Number(chyjh.ayjje || 0))
                shipment_set_if_empty(recordset, "目的仓库", chyjh.mdck || "");
                shipment_set_if_empty(recordset, "我方公司", chyjh.wfgs || "");
                shipment_set_if_empty(recordset, "客户名称", (chyjh.khmc || "").trim());
                shipment_set_if_empty(recordset, "客户编号", chyjh.kh_id || "");
                shipment_set_if_empty(recordset, "RMB客户", chyjh.khpd || "");
                shipment_set_if_empty(recordset, "是否信保", chyjh.xybx || "");
                if (chyjh.LCxb) {
                    recordset.val("LC信保", chyjh.LCxb === "是" ? "是" : "否");
                }
                shipment_set_if_empty(recordset, "信保费率", Number(chyjh.xbfl || 0));
                // if (chyjh.jxmc3 === '无') {
                //     recordset.val('加项名称3', '')
                //     recordset.val('加项金额3', 0)
                // }
                // if (chyjh.jjxmc3 === '无') {
                //     recordset.val('减项名称3', '')
                //     recordset.val('减项金额3', 0)
                // }
                shipment_set_if_empty(recordset, "箱    号", chyjh.hgxh1 || "");
                shipment_set_if_empty(recordset, "装柜地点", chyjh.zgdd || "");
                shipment_set_if_empty(recordset, "封    号", chyjh.SealNo || "");
                shipment_set_if_empty(recordset, "合同号码", chyjh.order_id || "");
                shipment_set_if_empty(recordset, "期限内容", chyjh.qxnr || "");
                shipment_set_if_empty(recordset, "船运公司", chyjh.cygs || "");
                shipment_set_if_empty(
                    recordset,
                    "船公司代码",
                    chyjh.FTShipCompany || "",
                );
                shipment_set_if_empty(recordset, "出运口岸", chyjh.cyka || "");
                shipment_set_if_empty(
                    recordset,
                    "港区代码",
                    chyjh.FTPortAreaCode || "",
                );
                shipment_set_if_empty(recordset, "目的口岸", chyjh.mdka || "");
                shipment_set_if_empty(recordset, "提运单号", chyjh.tdh || "");
                shipment_set_if_empty(recordset, "监装人员", chyjh.jzry || "");
                shipment_set_if_empty(recordset, "车子重量", Number(chyjh.czzl || 0));
                shipment_set_if_empty(recordset, "货柜重量", Number(chyjh.hgzl || 0));
                shipment_set_if_empty(recordset, "车加空柜", Number(chyjh.cjkg || 0));
                shipment_set_if_empty(recordset, "车加重柜", Number(chyjh.cjgz || 0));
                shipment_set_if_empty(recordset, "货代名称", chyjh.cdmc || "");
                shipment_set_if_empty(recordset, "货币代码", chyjh.hbdm || "");
                shipment_set_if_empty(recordset, "价格条款", chyjh.jgtk || "");
                shipment_set_if_empty(recordset, "结汇方式", chyjh.jhfs || "");
                shipment_set_if_empty(recordset, "运输方式", chyjh.ysfs || "");
                shipment_set_if_empty(recordset, "货柜数量", Number(chyjh.hgzsl || 0));
                shipment_set_if_empty(recordset, "总 品 名", chyjh.hwzpm || "");
                shipment_set_if_empty(recordset, "我方抬头", chyjh.wftt || "");
                shipment_set_if_empty(recordset, "收 货 人", chyjh.shr || "");
                shipment_set_if_empty(recordset, "抬 头 人", chyjh.ttr || "");
                shipment_set_if_empty(recordset, "通 知 人", chyjh.tzr || "");
                shipment_set_if_empty(recordset, "唛    头", chyjh.wxmt || "");
                shipment_set_if_empty(recordset, "开证银行", chyjh.kzyh || "");
                shipment_set_if_empty(recordset, "业务人员", chyjh.ywry || "");
                shipment_set_if_empty(recordset, "提交人员", chyjh.ywry || "");
                shipment_set_if_empty(recordset, "预计到港", chyjh.eta || "");
                shipment_set_if_empty(
                    recordset,
                    "Insurance 是否做保险",
                    chyjh.Insurancesfzbx || "",
                );
                shipment_set_if_empty(recordset, "所需服务", chyjh.sxfw || "");
                shipment_set_if_empty(recordset, "付款方式", chyjh.fkfs || "");
                shipment_set_if_empty(recordset, "口岸国家", chyjh.kagj || "");
                shipment_set_if_empty(recordset, "货好日期", chyjh.hhrq || "");
                shipment_set_if_empty(recordset, "出运电放", chyjh.hxdate || "");
                shipment_set_if_empty(recordset, "口岸洲别", chyjh.kazb || "");
                // shipment_set_if_empty(
                //     recordset,
                //     '业务额外费用￥',
                //     Number(chyjh.ywewfy || 0),
                // )
                shipment_set_if_empty(recordset, "货柜容积", Number(chyjh.hgcc || 0));
                shipment_set_if_empty(recordset, "货柜类型", chyjh.hglx || "");
                shipment_set_if_empty(recordset, "客户合同", chyjh.khht || "");
                shipment_set_if_empty(recordset, "预计出运", chyjh.etd || "");
                shipment_set_if_empty(recordset, "小柜数量", Number(chyjh.xgsl || 0));
                shipment_set_if_empty(recordset, "平柜数量", Number(chyjh.pgsl || 0));
                shipment_set_if_empty(recordset, "高柜数量", Number(chyjh.ggsl || 0));
                shipment_set_if_empty(recordset, "注意事项", chyjh.zysx || "");
                shipment_set_if_empty(recordset, "其它说明", chyjh.qtshm || "");
                shipment_set_if_empty(recordset, "货代资料", chyjh.hdxx || "");
                if (chyjh.fksm !== undefined)
                    recordset.val("风控说明", chyjh.fksm || "");
                if (chyjh.sdsm !== undefined)
                    recordset.val("审单说明", chyjh.sdsm || "");
                if (chyjh.dzsm !== undefined)
                    recordset.val("单证说明", chyjh.dzsm || "");
                // 4) 刷新界面，触发表单展示更新
                // recordset.refresh_ui();
            })
            .catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || "出运单号联动失败");
            });
    }
    if (field.full_name == m + ".实际出运" && value != "" && value != null) {
        /**
         * 判断值是否为空
         * @param {*} value
         * @returns {boolean}
         */
        function isEmpty(value) {
            return value === "" || value === null || value === undefined;
        }
        const actualShip = recordset.val("实际出运");
        const invoiceNo = recordset.val("发票号码");
        const shipNo = recordset.val("出运单号");
        if (isEmpty(recordset.val("原出运单号"))) {
            recordset.val("原出运单号", shipNo);
        }
        _.http
            .post("/api/saier/shipment/sjcy/change", {
                chydh: shipNo,
                ychydh: recordset.val("原出运单号"),
                fphm: invoiceNo,
                wxfp: recordset.val("核算发票"),
                kh_id: recordset.val("客户编号"),
                khmc: recordset.val("客户名称"),
                ywry: recordset.val("业务人员"),
                ydqx: recordset.val("约定期限"),
                yjdg: recordset.val("预计到港"),
                sjcy1: actualShip,
            })
            .then((res) => {
                if (res.code === 0) {
                    _.ui.message.error(res.msg || "当前数据状态不允许更新");
                    return;
                }

                if (res.code !== 1) {
                    _.ui.message.error(res.msg || "后端处理失败");
                    return;
                }

                const data = res.data || {};

                if (
                    !isEmpty(data.original_cydh) &&
                    isEmpty(recordset.val("原出运单号"))
                ) {
                    recordset.val("原出运单号", data.original_cydh);
                }
                if (!isEmpty(data.actual_year)) {
                    recordset.val("实际年", data.actual_year);
                }
                if (!isEmpty(data.actual_year_month)) {
                    recordset.val("实际年月", data.actual_year_month);
                }
                recordset.val("web判断", "是");

                if (!isEmpty(data.insurance_rate)) {
                    recordset.val("信保费率", data.insurance_rate);
                }
                if (!isEmpty(data.receivable_deadline)) {
                    recordset.val("收汇期限", data.receivable_deadline);
                }
                if (!isEmpty(data.warning_msg)) {
                    _.ui.message.error(data.warning_msg);
                }
            })
            .catch((err) => {
                _.ui.message.error(err && err.msg ? err.msg : "调用后端接口失败");
                console.error(err);
            });
    }
    // 检查是否是制单人员字段变更
    if (field.full_name == m + ".制单人员" && value != "" && value != null) {
        const username = _.user.name;
        // 如果制单人员是当前用户，跳过处理
        if (value == username) {
            return;
        }
        // 调用后端API处理业务逻辑
        _.http
            .post("/api/saier/shipment/zdry/change", {
                fphm: recordset.val("发票号码"),
                zdry: value,
            })
            .then((res) => {
                if (res.code == 1) {
                    let d = res.data;
                    let sb1 = d.sb1 || 0;
                    if (sb1 == 1) {
                        recordset.val("提交判断", "有");
                        recordset.val("原有发票号", recordset.val("发票号码"));
                        if (value != username) {
                            recordset.val("提交人员", username);
                        }
                    }
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg || "调用后端接口失败");
                console.error(err);
                recordset.val("制单人员", "");
            });
    }
    if (field.full_name == m + ".发票号码" && value != "" && value != null) {
        // 对应 Pascal: recordset.val('实际出运', '')
        recordset.val("实际出运", "");
        // 对应 Pascal: fphm = trim(...); val('发票号码', fphm)
        const fphm = (recordset.val("发票号码") || "").trim();
        recordset.val("发票号码", fphm);
        if (fphm !== "") {
            // Step 3: 计算 hzf（末位字母）
            // 条件：出运单号非空 且 出运单号 ≠ 发票号码
            // 规则：末位为非数字字符时 hzf=末位字符，否则 hzf=''
            // 对应 Pascal: hzf = copy(fphm, length(fphm), 1);
            //              if hzf in ['0'..'9'] then hzf = ''
            const chydh = (recordset.val("出运单号") || "").trim();
            let hzf = "";
            if (chydh !== "" && chydh !== fphm) {
                const lastChar = fphm.slice(-1);
                if (!/\d/.test(lastChar)) {
                    hzf = lastChar;
                }
            }
            const payload = {
                fphm, // 发票号码（已trim）
                chydh, // 出运单号（已trim）
                hzf, // 末位字母（前端计算后传给后端）
                khmc: (recordset.val("客户名称") || "").trim(), // 查询我方公司用
                job: recordset.job || 0, // 记录主键，对应 Pascal self.getnumber
                zdry: (recordset.val("制单人员") || "").trim(), // 当前制单人员
                hwzt: (recordset.val("货物状态") || "").trim(), // 货物状态
                qzgx: (recordset.val("强制更新") || "").trim(), // 强制更新标志
                wyzd1: (recordset.val("唯一字段") || "").trim(), // 唯一字段当前值（非空才触发checksave）
            };
            _.http
                .post("/api/saier/shipment/fphm/change", payload)
                .then(function (res) {
                    const d = res.data || {};
                    // 自动净重置"否"
                    // 对应 Pascal: val('自动净重', '否')
                    if (d.zjz_no) {
                        recordset.val("自动净重", "否");
                    }
                    // 合同简写
                    // 对应 Pascal: val('合同简写', htjc)
                    if (d.htjc !== undefined) {
                        recordset.val("合同简写", d.htjc);
                    }
                    // 核算发票
                    // 对应 Pascal: val('核算发票', ...)
                    if (d.hxfp !== undefined) {
                        recordset.val("核算发票", d.hxfp);
                    }
                    // 我方公司
                    // 对应 Pascal: val('我方公司', ...)
                    if (d.wfgs !== undefined) {
                        recordset.val("我方公司", d.wfgs);
                    }
                    // 出运单号（原为空时解锁字段并赋值）
                    // 对应 Pascal: fieldbyname(...).enabled = true; setfielddataasstring(fphm)
                    if (d.chydh_new !== undefined) {
                        recordset.module.field_by_full_name("预出运单.出运单号").disabled =
                            false;
                        recordset.val("出运单号", d.chydh_new);
                    }
                    // 出票判断（是/否）
                    // 对应 Pascal: val('出票判断', '是'/'否')
                    if (d.cpjd !== undefined) {
                        recordset.val("出票判断", d.cpjd);
                    }

                    // 已收定金：解锁字段
                    // 对应 Pascal: fieldbyname('利润核算', '已收定金').enabled = true
                    // if (d.enable_ysj) {
                    //     recordset.module.field_by_full_name('预出运单.已收定金').disabled =
                    //         false
                    // }
                    // 业务人员（直接覆盖）
                    // 对应 Pascal: val('业务人员', ywry)
                    if (d.ywry !== undefined) {
                        recordset.val("业务人员", d.ywry);
                    }
                    // 客户合同：原字段为空时才填入
                    // 对应 Pascal: if 客户合同='' then setfielddataasstring(dforder_id)
                    if (d.khht && !recordset.val("客户合同")) {
                        recordset.val("客户合同", d.khht);
                    }
                    // 接单日期：原字段为空时才填入
                    if (d.jdrq && !recordset.val("接单日期")) {
                        recordset.val("接单日期", d.jdrq);
                    }
                    // 价格条款：原字段为空时才填入
                    if (d.jgtk && !recordset.val("价格条款")) {
                        recordset.val("价格条款", d.jgtk);
                    }
                    // 目的仓库：原字段为空时才填入
                    if (d.mdck && !recordset.val("目的仓库")) {
                        recordset.val("目的仓库", d.mdck);
                    }
                    // 发票order（后端截取第一个"-"后的部分）
                    // 对应 Pascal: val('发票order', fporder)
                    if (d.fporder !== undefined) {
                        recordset.val("发票order", d.fporder);
                    }
                    // 唯一字段新值
                    // 对应 Pascal: val('唯一字段', wyzd)
                    if (d.new_wyzd) {
                        recordset.val("唯一字段", recordset.val("rid"));
                    }
                    // 制单人员（货物状态非"已出运"且与登录用户不同时同步）
                    // 对应 Pascal: if 制单人员<>user and 货物状态<>'已出运' then 制单人员=user
                    if (d.new_zdry) {
                        recordset.val("制单人员", d.new_zdry);
                    }
                })
                .catch(function (err) {
                    recordset.val("发票号码", "");
                    console.error("[预出运单.发票号码] 联动接口异常", err);
                    _.ui.message.error("网络异常，发票号码联动失败");
                });
        } else {
            // 发票号码为空：清空合同简写
            // 对应 Pascal: else recordset.val('合同简写', '')
            recordset.val("合同简写", "");
        }
    }
};
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, wait_ship_field_change, "预出运单");

/**
 * 仅在目标字段当前为空时回填，避免覆盖用户已手工录入的数据。
 */
const wait_ship_set_if_empty = (recordset, fieldName, value) => {
    if (value === undefined || value === null || value === "") {
        return;
    }
    const oldVal = recordset.val(fieldName);
    if (oldVal === "" || oldVal === null || oldVal === undefined) {
        recordset.val(fieldName, value);
    }
};

const wait_ship_FormShow = (evt_id, form) => {
    let btns = [];
    if (form.is_editor) {
        btns.push({
            name: "shipping_list_import_btn",
            caption: "出货清单导入",
            icon: "any-keyborad",
        });
    } else {}
    if (btns.length == 0) {
        return;
    }
    form.toolbar.insert(
        [{
            name: "export_btn",
            caption: "扩展",
            icon: "#ext-add_database",
            btns: btns,
        }, ],
        "close",
    );
};
_.evts.on(
    [_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW],
    wait_ship_FormShow,
    "预出运单",
);

const wait_ship_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == "产品资料") {
        let btns = [];
        btns.push({
            name: "item_update_weight_btn",
            caption: "更新毛重(限0.1KG)",
            icon: "any-server-update",
            divided: true,
        });
        btns.push({
            name: "item_update_shipment_btn",
            caption: "批量更新出运信息",
            icon: "any-server-update",
            divided: true,
        });
        btns.push({
            name: "item_update_volume_btn",
            caption: "更新总体积",
            icon: "any-server-update",
            divided: true,
        });
        btns.push({
            name: "item_empty_btn",
            caption: "清空资料",
            icon: "any-server-update",
            divided: true,
        });
        form.toolbar.add([{
            name: "export_btn",
            caption: "扩展",
            icon: "any-server-update",
            btns: btns,
        }, ]);
    }
};
_.evts.on(
    [_.evtids.MODULE_EDITOR_GROUP_SHOW],
    wait_ship_EditorChildShow,
    "预出运单",
);

const wait_ship_BtnClick = async (evt_id, btn, form) => {
    let recordset = form.recordset;
    let username = _.user.username;
    let m = form.module.name;
    //  出货清单导入 优景
    if (btn.name == "shipping_list_import_btn") {
        // 1. 权限拦截：对应原代码检查制单人
        let zdry = recordset.val("制单人员");
        let tjry = recordset.val("提交人员");
        if (zdry && zdry !== username && tjry !== username) {
            _.ui.error_message("只有制单人员或提交人员才能导入！");
            return;
        }
        _.ui
            .show_input_dialog("请输入导入模式（1:新引，2:在原有上新增）", "1")
            .then((val) => {
                // 3. 容错处理：只要业务员敲的不是 '2'，一律按 '1'(覆盖) 处理。完美还原老系统逻辑！
                let mode = val === "2" ? "2" : "1";
                // 4. 直接呼出上传对话框执行导入
                _.ui.show_upload_dialog({
                        title: mode === "1" ?
                            "导入出货清单 (覆盖模式)" :
                            "导入出货清单 (追加模式)",
                        url: "/api/saier/shipment/shipping_list/import",
                        accept: ".xlsx,.xls",
                        auto_close: true,
                        params: {
                            mode: mode,
                            module: form.module.name,
                            rid: recordset.rid, // 把当前主单的 rid 传给后端
                        },
                        success_msg: "解析成功，正在处理数据...",
                        error_msg: "导入失败",
                    },
                    (res) => {
                        console.log("传来的data", res.data);
                        if (res.data) {
                            let d = res.data;
                            recordset.val("强制更新", "是1"); // 原先代码不判断mode 直接赋值
                            // --- 渲染主表信息 (mode=1 覆盖模式时才更新表头和表尾) ---
                            if (mode === "1" && d.header) {
                                recordset.val("客户名称", d.header.khmc);

                                recordset.val("业务人员", d.header.ywry);
                                recordset.val("发票号码", d.header.fphm);
                                recordset.val("出运上传识别", "是");
                                recordset.val("合同号码", d.header.fphm);
                                if (!recordset.val("出运单号")) {
                                    recordset.val("出运单号", d.header.fphm);
                                }
                                recordset.val("箱    号", d.header.xh);
                                recordset.val("封    号", d.header.fh);
                                recordset.val("期限内容", d.header.qxnr);

                                if (d.footer) {
                                    recordset.val("注意事项", d.footer.zysx);
                                    recordset.val("出运说明", d.footer.cysm);
                                    recordset.val("结汇方式", d.footer.jhfs);
                                    recordset.val("提运单号", d.footer.tydh);
                                    recordset.val("监装人员", d.footer.jzry);
                                    recordset.val("车子重量", d.footer.czzl);
                                    recordset.val("货柜重量", d.footer.hgzl);
                                    recordset.val("车加空柜", d.footer.cjkg);
                                    recordset.val("车加重柜", d.footer.cjgz);
                                    recordset.val("费用引入1", "是");
                                }
                            }

                            // --- 渲染子表信息 (产品资料) ---
                            let subTable = recordset.tables["产品资料"];
                            console.log("子表", subTable);
                            if (mode === "1") {
                                subTable.clear(); // 覆盖模式：先清空原有记录
                            }

                            if (d.items && d.items.length > 0) {
                                let viewData = subTable.view_data;
                                for (let r of d.items) {
                                    viewData.push(r);
                                    subTable.push_new_rid(r.rid);
                                }
                                subTable.modified = true;
                                subTable.sync_operate_data();
                                recordset.do_re_sum_by_trigger_table("产品资料");
                                // _.ui.success_message(`成功导入 ${d.items.length} 条产品资料！`)
                            }
                            recordset.val("强制更新", "否"); // 原代码  最后强行赋值 什么都不管。。
                            // --- 处理异常日志流下载 ---
                            if (d.duplicate_file_name) {
                                _.ui.message.warning(
                                    "发现异常数据(如缺少合同或发货超量)，正在下载错误详情日志...",
                                );
                                _.http.download(
                                    "/api/tmp/file/get", {
                                        file: d.duplicate_file_name,
                                    },
                                    d.duplicate_file_name,
                                );
                            }
                        } else {
                            _.ui.error_message(res.msg);
                        }
                    },
                );
            })
            .catch(() => {
                // 用户点击了输入框的“取消”按钮，安静地退出即可，不需要报错
                console.log("用户取消了导入操作");
            });
    }

    if (btn.name == "item_update_weight_btn") {
        let t = recordset.tables["产品资料"];
        let v = t.view_data;
        let flag = false;
        let xshj1 = recordset.val("箱数合计1");
        let mzhj = recordset.val("毛重合计");
        let cjzg = recordset.val("车加重柜");
        let cjkg = recordset.val("车加空柜");
        if (cjzg - cjkg == mzhj) {
            _.ui.message.error("毛重已正确，无需更新");
            return;
        }
        _.http
            .post("/api/saier/shipment/item/update/weight", {
                lines: v,
                cjzg: cjzg,
                cjkg: cjkg,
                mzhj: mzhj,
                xshj1: xshj1,
            })
            .then((res) => {
                let d = res.data;
                let zxs = d.zxs;
                // let zmz = d.zmz;
                let mz2 = Number(d.mz2);
                let rids_json = d.rids_json;
                let mzjl = Number(Math.trunc(mz2 * 100)) / 100 + 0.01;
                if (mzjl > 0.1) {
                    mzjl = mz2;
                }
                _.ui
                    .show_input_number_dialog(
                        "请输入每箱最大能加毛重(kg),不填为(" + mzjl + "KG):",
                        mzjl,
                    )
                    .then((val) => {
                        if (val == "" || val == null || val <= 0) {
                            val = mzjl;
                        }
                        let mz = (Number(xshj1) - Number(zxs)) * val;
                        let xshj = Number(xshj1) - Number(zxs);
                        if (
                            recordset.val("车加重柜") -
                            recordset.val("车加空柜") -
                            recordset.val("毛重合计") >
                            mz ||
                            recordset.val("毛重合计") +
                            recordset.val("车加空柜") -
                            recordset.val("车加重柜") >
                            mz
                        ) {
                            _.ui.message.error(
                                "毛重差距大于" + mz + "请先向业务员核实后,手动更改",
                            );
                            return;
                        }
                        let jzz = 0;
                        let jz = 0;
                        let jz1 = 0;
                        let jz5 = 0;
                        let check = true;
                        if (xshj != 0) {
                            if (
                                recordset.val("车加重柜") -
                                recordset.val("车加空柜") -
                                recordset.val("毛重合计") >
                                0
                            ) {
                                jzz =
                                    recordset.val("车加重柜") -
                                    recordset.val("车加空柜") -
                                    recordset.val("毛重合计");
                                jz =
                                    (recordset.val("车加重柜") -
                                        recordset.val("车加空柜") -
                                        recordset.val("毛重合计")) /
                                    xshj;
                                jz1 = Math.trunc(jz * 100);
                                jz5 =
                                    recordset.val("车加重柜") -
                                    recordset.val("车加空柜") -
                                    recordset.val("毛重合计");
                            } else {
                                jzz =
                                    recordset.val("毛重合计") -
                                    recordset.val("车加重柜") +
                                    recordset.val("车加空柜");
                                jz =
                                    (recordset.val("毛重合计") -
                                        recordset.val("车加重柜") +
                                        recordset.val("车加空柜")) /
                                    xshj;
                                jz1 = Math.trunc(jz * 100);
                                jz5 =
                                    recordset.val("毛重合计") -
                                    recordset.val("车加重柜") +
                                    recordset.val("车加空柜");
                                check = false;
                            }
                        }
                        let xss = 0;
                        for (let r of v) {
                            let rid = r.rid;
                            let f = false;
                            if (rids_json[rid] != r.mzpd) {
                                r.mzpd = rids_json[rid];
                                f = true;
                            }
                            let chxs = r.chxs;
                            let mz1 = r.wxmz;
                            let mjz1 = 0;
                            let mjz = 0;
                            if (r.mzpd != "否" && chxs > 0) {
                                if (xss == 0) {
                                    xss = chxs;
                                } else {
                                    if (xss < chxs) {
                                        xss = chxs;
                                    }
                                }
                                if (jz1 != 0) {
                                    let jz3 = round(jz1 / 100, 2);
                                    let jz2 = jz5 - round(jz3 * xshj, 2);
                                    if (jz3 < val && jz2 > 0 && chxs != 0) {
                                        mjz = round(jz2 / chxs + jz3, 2);
                                        if (mjz > val) {
                                            mjz1 = Math.trunc((val - jz3) * 100) / 100;
                                            jz2 = jz2 - round(mjz1 * chxs, 2);
                                        } else {
                                            mjz1 = round(jz2 / chxs, 2);
                                            jz2 = 0;
                                            mjz = round(jz2 / chxs, 2) + jz3;
                                        }
                                    }
                                    if (check) {
                                        r.wxmz = round(mz1 + jz3 + mjz1, 2);
                                    } else {
                                        r.wxmz = round(mz1 - jz3 - mjz1, 2);
                                    }
                                    jzz = jzz - round((jz3 + mjz1) * chxs, 2);
                                } else {
                                    if (jzz != 0 && chxs * val < jzz) {
                                        if (check) {
                                            r.wxmz = round(mz1 + val, 2);
                                        } else {
                                            r.wxmz = round(mz1 - val, 2);
                                        }
                                        jzz = jzz - round(chxs * val, 2);
                                    }
                                }
                                r.zmz = round(r.wxmz * r.chxs, 2);
                                f = true;
                            }
                            if (f) {
                                flag = true;
                                t.push_modi_rid(r.rid);
                            }
                        }
                        if (jzz != 0) {
                            for (let r of v) {
                                let f = false;
                                let chxs = r.chxs;
                                let mz1 = r.wxmz;
                                if (r.mzpd != "否" && chxs > 0) {
                                    if (check) {
                                        r.wxmz = round(mz1 + jzz / chxs, 2);
                                    } else {
                                        r.wxmz = round(mz1 - jzz / chxs, 2);
                                    }
                                    r.zmz = round(r.wxmz * r.chxs, 2);
                                    f = true;
                                }
                                if (f) {
                                    flag = true;
                                    t.push_modi_rid(r.rid);
                                }
                            }
                        }
                        if (flag) {
                            t.sync_operate_data();
                            t.modified = true;
                            recordset.do_re_sum_by_trigger_table("产品资料");
                        }
                        _.ui.message.success("操作成功");
                    });
            })
            .catch((err) => {
                _.ui.message.error(err.msg);
                console.error(err);
            });
    }

    if (btn.name == "item_update_shipment_btn") {
        let t = recordset.tables["产品资料"];
        let v = t.view_data;
        let khmc = recordset.val("客户名称");
        let fphm = recordset.val("发票号码");
        if (khmc == "" || khmc == null || fphm == "" || fphm == null) {
            _.ui.message.error("客户名称和发票号码为空不能执行此操作");
            return;
        }
        if (
            khmc.toUpperCase().includes("BEST PRICE") ||
            fphm.toUpperCase().includes("SFT")
        ) {
            _.ui.message.error(
                "客户名称包含BEST PRICE或发票号码包含SFT，不能执行此操作",
            );
            return;
        }
        _.http
            .post("/api/saier/shipment/item/update/check", {
                kind: 0,
                job: recordset.job,
                rid: recordset.val("rid"),
            })
            .then((x) => {
                _.ui
                    .show_input_select_dialog("请选择更新数据", "所有记录", [
                        "当前记录",
                        "所有记录",
                    ])
                    .then((selected) => {
                        let lines = [];
                        if (t.current_data) {
                            lines.push(t.current_data);
                        }
                        if (selected != "当前记录") {
                            lines = v;
                        }
                        _.http
                            .post("/api/saier/shipment/item/update/items", {
                                lines: lines,
                                fphm: fphm,
                            })
                            .then((res) => {
                                let d = res.data;
                                let flag = 0;
                                for (let r of v) {
                                    let rid = r.rid;
                                    if (rid in d) {
                                        let item = d[rid];
                                        if (item.selected) {
                                            r.sfgd = "";
                                            r.cywyzd123 = r.cywyzd12;
                                            if (item.cyjh) {
                                                let l = item.cyjh;
                                                let zyhh = l.bjhh;
                                                let khhh = l.khhh;
                                                if (khhh != null && khhh != "") {
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.产品编号",
                                                        ).db.name
                                                    ] = khhh;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.专业产品编号",
                                                        ).db.name
                                                    ] = zyhh;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.原产品编号",
                                                        ).db.name
                                                    ] = zyhh;
                                                } else {
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.产品编号",
                                                        ).db.name
                                                    ] = zyhh;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.专业产品编号",
                                                        ).db.name
                                                    ] = zyhh;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.原产品编号",
                                                        ).db.name
                                                    ] = zyhh;
                                                }
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.箱    号",
                                                    ).db.name
                                                ] = l.hgxh1;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.货件编号",
                                                    ).db.name
                                                ] = l.hjbh;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.店铺名称",
                                                    ).db.name
                                                ] = l.dpmc;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.爱马士国家",
                                                    ).db.name
                                                ] = l.amsgj;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.Seller ID",
                                                    ).db.name
                                                ] = l.SellerID;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.marketplace_id",
                                                    ).db.name
                                                ] = l.marketplace_id;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.船公司代码",
                                                    ).db.name
                                                ] = l.FTShipCompany;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.港区代码",
                                                    ).db.name
                                                ] = l.FTPortAreaCode;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.外销合同",
                                                    ).db.name
                                                ] = l.wxht;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.货件编号",
                                                    ).db.name
                                                ] = l.hjbh;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.客户合同",
                                                    ).db.name
                                                ] = l.khht;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.预计船期",
                                                    ).db.name
                                                ] = l.yjcq;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.中文品名",
                                                    ).db.name
                                                ] = l.zwpm;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.英文品名",
                                                    ).db.name
                                                ] = l.ywpm;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.采购合同",
                                                    ).db.name
                                                ] = l.cght;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.是否代开",
                                                    ).db.name
                                                ] = l.ewchy;
                                                if (
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.工厂名称",
                                                        ).db.name
                                                    ] == ""
                                                )
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.工厂名称",
                                                        ).db.name
                                                    ] = l.sccj1;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.工厂货号",
                                                    ).db.name
                                                ] = l.gchh;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.箱    数",
                                                    ).db.name
                                                ] = l.chxs2;
                                                if (
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.进仓日期",
                                                        ).db.name
                                                    ] == "" ||
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.进仓日期",
                                                        ).db.name
                                                    ] == null
                                                )
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.进仓日期",
                                                        ).db.name
                                                    ] = l.jcsj;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.出货数量",
                                                    ).db.name
                                                ] = l.chsl;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.外箱容量",
                                                    ).db.name
                                                ] = l.wxrl;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.包装单位",
                                                    ).db.name
                                                ] = l.bzdw;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.毛    重",
                                                    ).db.name
                                                ] = l.wxmz;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.净    重",
                                                    ).db.name
                                                ] = l.wxjz;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.总 净 重",
                                                    ).db.name
                                                ] = l.zjz;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.包装长度",
                                                    ).db.name
                                                ] = l.bzcd;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.包装宽度",
                                                    ).db.name
                                                ] = l.bzkd;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.包装高度",
                                                    ).db.name
                                                ] = l.bzgd;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.外箱体积",
                                                    ).db.name
                                                ] = l.wxtj;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.总 体 积",
                                                    ).db.name
                                                ] = l.ztj;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.备    注",
                                                    ).db.name
                                                ] = l.bz;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.是否拼箱",
                                                    ).db.name
                                                ] = l.sfpx;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.出货数量1",
                                                    ).db.name
                                                ] = l.chsl1;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.定金金额",
                                                    ).db.name
                                                ] = l.djje;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.是否商检",
                                                    ).db.name
                                                ] = l.sfsj;
                                                if (l.cght == "" && l.wxwyzd == "") {
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.外销总价",
                                                        ).db.name
                                                    ] = l.wxzj;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.采购总价",
                                                        ).db.name
                                                    ] = l.gczj;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.客户RMB总价",
                                                        ).db.name
                                                    ] = l.mjzj;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.外语品名",
                                                        ).db.name
                                                    ] = l.wypp;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.客人CODE",
                                                        ).db.name
                                                    ] = l.krcode;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.跟单人员",
                                                        ).db.name
                                                    ] = l.gdry;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.验货人员",
                                                        ).db.name
                                                    ] = l.yhry;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.业务人员",
                                                        ).db.name
                                                    ] = l.ywrya;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.采购人员",
                                                        ).db.name
                                                    ] = l.ywry;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.代开点数",
                                                        ).db.name
                                                    ] = l.dkds;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.交货日期",
                                                        ).db.name
                                                    ] = l.jhrq;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.客人条码",
                                                        ).db.name
                                                    ] = l.krtm;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.外销唯一字段",
                                                        ).db.name
                                                    ] = l.wxwyzd;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.入库地点",
                                                        ).db.name
                                                    ] = l.rkdd;
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.材质英文",
                                                        ).db.name
                                                    ] = l.czyw;
                                                }

                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.专业货号1",
                                                    ).db.name
                                                ] = l.bjhh1;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.专属编号",
                                                    ).db.name
                                                ] = l.zsbh;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.审单建议",
                                                    ).db.name
                                                ] = l.sdjy;
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.RMB客户",
                                                    ).db.name
                                                ] = l.RMBkh;
                                                if (l.fktt != "") {
                                                    r[
                                                        recordset.module.field_by_full_name(
                                                            "产品资料.付款抬头",
                                                        ).db.name
                                                    ] = l.fktt;
                                                }
                                                r[
                                                    recordset.module.field_by_full_name(
                                                        "产品资料.赠送",
                                                    ).db.name
                                                ] = l.zs;
                                            }
                                            t.push_modi_rid(rid);
                                            flag = 1;
                                        }
                                    }
                                }
                                if (flag == 1) {
                                    t.sync_operate_data();
                                    t.modified = true;
                                    recordset.do_re_sum_by_trigger_table("产品资料");
                                }
                                _.ui.message.success("操作成功");
                            })
                            .catch((err) => {
                                _.ui.message.error(err.msg);
                                console.log(err);
                            });
                    });
            })
            .catch((e) => {
                _.ui.message.error(e.msg);
                console.log(e);
            });
    }

    if (btn.name == "item_update_volume_btn") {
        let t = recordset.tables["产品资料"];
        let v = t.view_data;
        let flag = false;
        if (recordset.val("制单人员") != username) {
            _.ui.message.error("只有制单人员才能更新总体积");
            return;
        }
        _.ui.show_input_number_dialog("请输入总体积:", 0).then((tj) => {
            _.http
                .post("/api/saier/shipment/item/update/volume", {
                    lines: v,
                })
                .then((res) => {
                    let wxbms = res.data.data;
                    let tjhj = res.data.tjhj;
                    let rid = res.data.rid;
                    let tjhj2 = Number(tj);
                    for (let r of v) {
                        if (!wxbms.includes(r.wxbm1)) {
                            let f = false;
                            let tjhj1 = 0;
                            if (tjhj > 0) {
                                tjhj1 = Math.round((r.ztj / tjhj) * Number(tj) * 100) / 100;
                                tjhj2 = Number(tj) - tjhj1;
                            }
                            if (rid != r.rid) {
                                r.ztj = Number(r.ztj) + tjhj1;
                                f = true;
                            } else {
                                r.ztj = Number(r.ztj) + tjhj2;
                                f = true;
                            }
                            if (f) {
                                flag = true;
                                t.push_modi_rid(r.rid);
                            }
                        }
                    }
                    if (flag) {
                        t.sync_operate_data();
                        t.modified = true;
                    }
                    _.ui.message.success("批量更新总体积成功");
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                });
        });
    }

    if (btn.name == "item_empty_btn") {
        if (
            recordset.val("记录复制") == "是" &&
            recordset.val("制单人员") == username
        ) {
            recordset.tables["产品资料"].clear();
        } else {
            _.ui.message.error("只有复制记录且当前记录的制单人员才能清空资料");
        }
    }
};
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], wait_ship_BtnClick, "预出运单");

const wait_ship_recordset_load = (evt_id, recordset) => {
    const currentUser = _.user.name; // 等同于 Pascal IApplication.LoginInfo.userinfo.name
    // 以下两个账号用于特殊权限判断
    const SPECIAL_USER = "zjnblh"; // 对应 Pascal 变量 c
    const SPECIAL_USER2 = "谢晓霞"; // 对应 Pascal 变量 d
    // ── Step 1: 基础初始化 ────────────────────────────────────────────────
    // 对应 Pascal: val('只读状态', '否')
    recordset.val("只读状态", "否");
    // 对应 Pascal: recordset.fieldbyname('主要信息', '核算发票').enabled = false
    recordset.module.field_by_full_name("预出运单.核算发票").disabled = true;

    const sdsb = ""; // 此标志仅在后端某些情况设置，前端默认空字符串走主逻辑
    const zdry = (recordset.val("制单人员") || "").trim();
    const fphm = (recordset.val("发票号码") || "").trim();
    // const fphm1 = (recordset.val('出运单号') || '').trim();
    // ── Step 3A: 正常模式下的字段初始化 ──────────────────────────────────
    // 对应 Pascal: recordset.fieldbyname(...).enabled = false
    recordset.module.field_by_full_name("预出运单.实际出运").disabled = true;
    recordset.module.field_by_full_name("预出运单.电放日期").disabled = true;
    recordset.module.field_by_full_name("预出运单.出运日期").disabled = true;
    recordset.module.field_by_full_name("预出运单.货物状态").disabled = true;

    // ── Step 3B: 保险字段权限
    // 对应 Pascal: if (保险提交='待提交' or '') and 制单人员=loginUser then enabled
    const baoxian = (recordset.val("保险提交") || "").trim();
    const canEditBaoxian =
        (baoxian === "待提交" || baoxian === "") && zdry === currentUser;
    recordset.module.field_by_full_name("预出运单.保险提交").disabled = !canEditBaoxian;
    recordset.module.field_by_full_name("预出运单.保险货物名称").disabled = !canEditBaoxian;
    // ── Step 3C: 强制更新=出运更改识别 时清空出运单号
    // 对应 Pascal: if 强制更新='出运更改识别' then 出运单号=''; 强制更新=''
    if (recordset.val("强制更新") === "出运更改识别") {
        recordset.val("出运单号", "");
        recordset.val("强制更新", "");
    }
    // ── Step 3D: 出运单号回写逻辑
    // 对应 Pascal: 产品引入='否1' 时清空出运单号；否则按 fphm1 或 fphm 赋值
    if (recordset.val("产品引入") === "否1") {
        recordset.val("出运单号", "");
    }
    const currentChydh = (recordset.val("出运单号") || "").trim();
    if (!currentChydh) {
        recordset.val("出运单号", fphm);
    }
    // ── Step 3F: 货柜类型含LCL时显示"收到进仓回执"
    const hglx = recordset.val("货柜类型") || "";
    if (hglx.includes("LCL")) {
        recordset.module.field_by_full_name("预出运单.收到进仓回执").show();
    } else {
        // 特殊账号始终显示"收到进仓回执"
        recordset.module.field_by_full_name("预出运单.收到进仓回执").hide();
    }

    // ── Step 3I: 若是制单人员/特殊账号，则核算发票可编辑
    // 对应 Pascal: if 制单人员=b or b=c or b=d then 核算发票.enabled=true
    if (
        zdry === currentUser ||
        currentUser === SPECIAL_USER ||
        currentUser === SPECIAL_USER2
    ) {
        recordset.module.field_by_full_name("预出运单.核算发票").disabled = false;
        // 出运日期非空且货物状态='已出运'时，实际出运可编辑
        if (recordset.val("出运日期") && recordset.val("货物状态") === "已出运") {
            recordset.module.field_by_full_name("预出运单.实际出运").disabled = false;
        }
    }
    // ── Step 3J: 固定显示若干字段
    // 对应 Pascal: fieldbyname(...).visible = true
    recordset.module.field_by_full_name("预出运单.提交人员").show();
    recordset.module.field_by_full_name("预出运单.是否做废").show();
    // recordset.module.field_by_full_name('预出运单.原外销额').show()
    // 隐藏产品详情分组
    // recordset.module.group_by_name('产品详情').visible = false;
    // ── Step 3L: AMZ出运时显示电商费用分组
    // 对应 Pascal: if POS('AMZ', fphm) or POS('AMZ', chydh) then 电商费用 visible
    const chydhVal = recordset.val("出运单号") || "";
    const hasAMZ = fphm.includes("AMZ") || chydhVal.includes("AMZ");
    // ── Step 3M: 设置"更改时间1"为当前时间
    // 对应 Pascal: val('更改时间1', formatdatetime(..., now))
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    // ── Step 3O: 出运单号：非空或发票号码为空时禁用
    // 对应 Pascal: if 出运单号<>'' or fphm='' then 出运单号.enabled=false
    const chydhNow = (recordset.val("出运单号") || "").trim();
    if (chydhNow !== "" || fphm === "") {
        recordset.module.field_by_full_name("预出运单.出运单号").disabled = true;
    }
    // ── Step 3P: 调用后端，获取权限/查询信息
    // 后端负责：
    //   1. 查询 sys_users 获取 position（判断是否单证/单证经理）
    //   2. 查询 cyzglsheet 判断是否"单证查验"用户
    //   3. 若发票号码非空：查询 cymxsheet 柜号数量
    //   4. 若实际出运非空：查询 shipmentapply 是否有进行中申请
    const actualShipment = (recordset.val("实际出运") || "").trim();
    // const sid = ((recordset.data || {}).sid || 0);

    _.http
        .post("/api/saier/shipment/load/check", {
            fphm,
            job: recordset.job,
            rid: recordset.val("rid"),
            actual_shipment: actualShipment,
            item_count: recordset.val("ITEM数量") || 0,
        })
        .then(function (res) {
            if (res.code !== 0) return;
            const d = res.data || {};
            // 是否单证人员 → 解锁出运日期、货物状态、电放日期
            // 对应 Pascal: if position LIKE '%单证%' then enable
            if (d.is_zdz) {
                recordset.module.field_by_full_name("预出运单.出运日期").disabled =
                    false;
                recordset.module.field_by_full_name("预出运单.货物状态").disabled =
                    false;
                recordset.module.field_by_full_name("预出运单.电放日期").disabled =
                    false;
            }
            // 制单人员字段可编辑性
            // 对应 Pascal: 单证经理 → enable; 单证 → disable; 非单证 → enable
            if (zdry !== "") {
                if (d.is_zdz_mgr) {
                    // 单证经理：可改制单人员
                    recordset.module.field_by_full_name("预出运单.制单人员").disabled =
                        false;
                } else if (d.is_zdz) {
                    // 普通单证：不可改制单人员
                    recordset.module.field_by_full_name("预出运单.制单人员").disabled =
                        true;
                } else {
                    // 非单证人员：可改制单人员
                    recordset.module.field_by_full_name("预出运单.制单人员").disabled =
                        false;
                }
            }
            // 实际出运申请中/已批复时，禁用实际出运字段
            // 对应 Pascal: if shipmentapply.state in ('申请中','已批复') then enable=false
            if (d.shipment_apply_locked) {
                recordset.module.field_by_full_name("预出运单.实际出运").disabled =
                    true;
            }
            // 发票号码非空时：cymxsheet 柜号>1张警告；ITEM数量不一致警告
            // 对应 Pascal: if i>1 then ShowError('请注意此票有两票不同柜号')
            if (d.multi_guihao) {
                _.ui.message.error("请注意此票有两票不同柜号，不能保存！");
                recordset.val("只读状态", "是");
            }
            // 对应 Pascal: if i1<>ITEM数量 and i1>0 and ITEM数量>0 then ShowError
            if (d.item_count_mismatch) {
                _.ui.message.error("请注意因某种原因保存数和记录数不一样");
            }
            // 单证查验用户：隐藏大量分组和字段
            // 对应 Pascal: if cyzglsheet WHERE xm=user AND zm='单证查验' then hide many fields
            if (d.is_dz_check_user) {
                // 隐藏分组
                // 主要信息字段
                ["我方公司", "RMB客户"].forEach((f) => {
                    recordset.module.field_by_full_name("预出运单." + f).hide();
                });

                // 辅助信息字段
                [
                    "报关类型",
                    "申报日期",
                    "市场模式抬头",
                    "货件编号",
                    "特殊出运",
                    "自动净重",
                ].forEach((f) => {
                    recordset.module.field_by_full_name("预出运单." + f).hide();
                });
                // 备注信息字段
                [
                    "我方抬头",
                    "付款抬头",
                    "其它说明",
                    "开证银行",
                    "注意事项",
                    "单证备注",
                    "发票备注",
                    "货代资料",
                    "风控说明",
                    "审单说明",
                    "单证说明",
                    "出运说明",
                    "财务结清",
                    "工厂品牌",
                ].forEach((f) => {
                    recordset.module.field_by_full_name("预出运单." + f).hide();
                });
                // 产品资料字段
                [
                    "中文报关品名",
                    "申报要素",
                    "英文报关品名",
                    "增值税率",
                    "退 税 率",
                    "退 税 额",
                    "海关编码",
                    "是否代开",
                    "代开点数",
                    "备    注",
                    "单据品名",
                    "单据品名英",
                    "单据品名外",
                    "开票工厂",
                    "开票联系人",
                    "开票电话",
                    "预填识别",
                    "预填信息",
                    "开票点数",
                    "开票费用",
                    "是否待报",
                    "付款抬头",
                    "是否授权",
                    "补报详情",
                    "电商费用",
                    "补报查看",
                    "电商总费用",
                    "电商单价",
                    "电商外销单价",
                    "电商外销总价",
                    "电商外销单价(关)",
                    "电商外销总价(关)",
                    "换汇成本",
                    "可思达货号",
                    "货件编号",
                    "FNSKU编号",
                    "店铺名称",
                    "爱马士国家",
                    "Seller ID",
                    "marketplace_id",
                    "外销单价",
                    "外销总价",
                    "客户RMB单价",
                    "客户RMB总价",
                    "外销总价总",
                ].forEach((f) => {
                    recordset.module.field_by_full_name("预出运单.产品资料." + f).hide();
                });
            }
            // 统计日期非空时禁用出运日期
            // 对应 Pascal: if 统计日期<>'' then 出运日期.enabled=false
            if (d.has_tongji_date) {
                recordset.module.field_by_full_name("预出运单.出运日期").disabled =
                    true;
            }
            // 只读模式处理
            // 对应 Pascal: else recordset.readonly = true; 部分字段除外
            if (d.is_readonly) {
                recordset.val("只读状态", "是");
                // 以下字段即使只读模式也需要可编辑（先设只读再解锁，模拟 Pascal 行为）
                // 对应 Pascal: fieldbyname.readonly=true 再 =false 的组合
                const editableInReadonly = [
                    "实际出运",
                    "实际年月",
                    "web判断",
                    "收汇期限",
                ];
                editableInReadonly.forEach((f) => {
                    // 在WhaleCloud中"只读模式除外"字段保持正常可编辑
                    recordset.module.field_by_full_name("预出运单." + f).disabled = false;
                });
            }
        })
        .catch(function (err) {
            console.error("[预出运单.RECORD_LOAD] 后端接口异常", err);
        });
};
_.evts.on([_.evtids.RECORD_LOAD], wait_ship_recordset_load, "预出运单");

function wait_ship_table_new_before(evt_id, table, recordset) {
    return new Promise((resolve, reject) => {
        if (table.group == "产品资料") {
            if (
                recordset.val("产品资料.出运唯一字段") == "" ||
                recordset.val("产品资料.是否待报") == "是"
            ) {
                resolve();
                return;
            }
            _.http
                .post("/api/saier/purchase_order/item/delete/check", {
                    cywyzd: recordset.val("产品资料.出运唯一字段"),
                    hthm: recordset.val("产品资料.采购合同"),
                    wxwyzd: recordset.val("产品资料.外销唯一字段"),
                    cpbh: recordset.val("产品资料.产品编号"),
                    rid: recordset.val("产品资料.rid"),
                    fphm2: recordset.val("发票号码"),
                    fphm: recordset.val("产品资料.发票号码"),
                    cydh: recordset.val("产品资料.出运单号"),
                    sfdb: recordset.val("产品资料.是否待报"),
                    fksb: recordset.val("产品资料.风控识别12"),
                    cydh2: recordset.val("出运单号"),
                })
                .then((res) => {
                    resolve();
                    return;
                })
                .catch((err) => {
                    _.ui.message.error(err.msg);
                    console.log(err);
                    reject();
                    return;
                });
        } else {
            resolve();
            return;
        }
    });
}
_.evts.on(
    [_.evtids.RECORD_TABLE_BEFORE_DELETE],
    wait_ship_table_new_before,
    "预出运单",
);

const wait_ship_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let t = recordset.tables["产品资料"];
        let v = t.view_data;
        let flag = false;
        let errors = [];
        let fphm = recordset.val("发票号码");
        let khmc = recordset.val("客户名称");
        let zmjhl = recordset.val("转美元汇率");
        let dywry = _.user.name;
        let khmc12 = recordset.val("客户名称");
        if (khmc != "" && khmc != null) {
            khmc = khmc.toUpperCase();
        } else {
            khmc = "";
        }
        if (fphm != "" && fphm != null) {
            fphm = fphm.toUpperCase();
        } else {
            fphm = "";
        }
        if (zmjhl == "" || zmjhl == null || zmjhl <= 0) {
            zmjhl = 1;
        }
        if (recordset.val("箱    号") != "" || recordset.val("封    号") != "") {
            recordset.val(
                "箱封号",
                recordset.val("箱    号") + "/" + recordset.val("封    号"),
            );
        }
        if (recordset.val("船    名") != "" || recordset.val("航    次") != "") {
            recordset.val(
                "船名航次",
                recordset.val("船    名") + "/" + recordset.val("航    次"),
            );
        }
        if (recordset.val("合同简写") == "" && fphm != "") {
            recordset.val("合同简写", fphm);
        }
        if (
            recordset.val("客户编号") != "" &&
            recordset.val("目的仓库") != "" &&
            recordset.val("客户编号分") == ""
        ) {
            recordset.val("客户编号分", recordset.val("客户编号"));
        }
        if (recordset.val("业务人员") != "") {
            dywry = recordset.val("业务人员");
        }
        if (recordset.val("客户合同") != "") {
            recordset.val("发票order", recordset.val("客户合同"));
        }
        if (recordset.val("口岸国家") != "") {
            recordset.val("口岸国家中", recordset.val("口岸国家"));
        }
        let ztj12 = recordset.val("体积合计");
        if (recordset.val("实际出运") != "") {
            recordset.val("信保日期", recordset.val("实际出运"));
        } else {
            recordset.val("信保日期", recordset.val("出运日期"));
        }
        if (recordset.val("目的仓库") == "") {
            recordset.val("目的仓库", recordset.val("目的口岸"));
        }

        let bb = 0;
        if (recordset.val("RMB客户") == "是") {
            hbdm12 = "￥";
            hbdm1 = "USD$";
        } else {
            hbdm12 = "$";
            hbdm1 = recordset.val("货币代码");
        }
        recordset.val("强制更新", "是");
        if (recordset.val("发票日期") == "" || recordset.val("发票日期") == null) {
            recordset.val("发票日期", new Date().format("yyyy-MM-dd"));
        }
        recordset.val(
            "柜加货重",
            recordset.val("货柜重量") + recordset.val("实际毛重"),
        );
        recordset.val("更改时间", new Date().format("yyyy-MM-dd hh:mm:ss"));
        recordset.val("更改时间1", new Date().format("yyyy-MM-dd hh:mm:ss"));
        if (recordset.val("出运单号") != "" && recordset.val("出运单号") != null) {
            recordset.val("出运单号", recordset.val("出运单号").trim());
        } else {
            recordset.val("出运单号", fphm);
        }
        let cydh = recordset.val("出运单号");
        if (recordset.val("唯一字段") == "") {
            recordset.val("唯一字段", recordset.val("rid"));
        }
        if (recordset.val("装柜日期") == "" || recordset.val("装柜日期") == null) {
            errors.push("装柜日期为空，请核实");
        }
        if (khmc.includes("AMAZON")) {
            recordset.val("跨境识别", "是");
            recordset.val("我方公司", "宁波景业国际贸易有限公司");
            recordset.val("统计公司", "宁波景业国际贸易有限公司");
        } else {
            recordset.val("跨境识别", "否");
        }
        let qtsm1 = "";
        if (khmc.includes('"')) {
            khmc12 = "zjnblh123456";
        }
        _.http
            .post("/api/saier/shipment/before/save", {
                zdry: recordset.val("制单人员"),
                tjry: recordset.val("提交人员"),
                fphm: fphm,
                cydh: cydh,
                khmc: khmc,
                zmjhl: zmjhl,
                dywry: dywry,
                khmc12: khmc12,
                module: recordset.module.name,
                rid: recordset.val("rid"),
            })
            .then((res) => {
                let d = res.data || {};
                let btsb = d.btsb || 0;
                let csz = d.csz || 0;
                let jh_data = d.jh_data || {};
                let dd = d.dd || 0;
                let sb = d.sb || 0;
                let fksb = d.fksb || "否";
                let cysb = d.cysb || "否";
                let ztj12 = recordset.val("体积合计");
                let dds = 7.1;
                let dxs = 5;
                recordset.val("风控识别12", fksb);
                recordset.val("出运识别1", cysb);
                // recordset.tables['投保品名'].clear()
                // if (recordset.val('合并识别') == '') {
                //     recordset.tables['产品合并'].clear()
                // }
                if (csz == 0) {
                    if (
                        (fphm.includes("VC0") || fphm.includes("VC1")) &&
                        fphm.includes("T")
                    ) {
                        recordset.val("我方公司", "宁波景驰进出口有限公司");
                        recordset.val("统计公司", "宁波景驰进出口有限公司");
                    }
                    csz = 1;
                    btsb = 0;
                    recordset.val("其它说明", "");
                    if (jh_data) {
                        xybx = jh_data.xybx || 0;
                        csz = jh_data.sz || 0;
                        recordset.val("注意事项", jh_data.zysx || "");
                        recordset.val("其它说明", jh_data.qtshm || "");
                        recordset.val("货件编号", jh_data.hjbh || "");
                        qtsm1 = jh_data.qtshm || "";
                        recordset.val("风控说明", jh_data.fksm || "");
                        recordset.val("审单说明", jh_data.sdsm || "");
                        recordset.val("单证说明", jh_data.dzsm || "");
                    }
                }
                if (fphm.includes("CSD-")) {
                    recordset.val("我方公司", "宁波可思达进出口有限公司");
                    if (
                        (fphm.includes("VC0") || fphm.includes("VC1")) &&
                        fphm.includes("T")
                    ) {
                        recordset.val("统计公司", "宁波景驰进出口有限公司");
                    } else {
                        recordset.val("统计公司", "宁波优景进出口有限公司");
                    }
                }
                if (recordset.val("我方公司") == "宁波景驰进出口有限公司") {
                    recordset.val("统计公司", recordset.val("我方公司"));
                }
                if (
                    recordset.val("我方公司") != "宁波可思达进出口有限公司" &&
                    recordset.val("统计公司") == ""
                ) {
                    recordset.val("统计公司", recordset.val("我方公司"));
                }
                if (csz == 0) {
                    csz = 1;
                }
                let tshj14 = 0;
                let tshj12 = 0;
                let tshj13 = 0;
                let tshj11 = 0;
                let tshj10 = 0;
                let tshj6 = 0;
                let tshj9 = 0;
                let ztshj9 = 0;
                let tshj0 = 0;
                let tshj7 = 0;
                let tshj5 = 0;
                let tshj4 = 0;
                let tshj3 = 0;
                let tshj2 = 0;
                let tshj1 = 0;
                let hj4 = 0;
                let hj1 = 0;
                let hj2 = 0;
                let hj5 = 0;
                let hj13 = 0;
                let hj3 = 0;
                let hj7 = 0;
                let hj6 = 0;
                let hj8 = 0;
                let hj10 = 0;
                let hj9 = 0;
                let hj11 = 0;
                let hj12 = 0;
                let zkfy = 0;
                let hjyw = 0;
                let zmz = 0;
                let zjz = 0;
                let ztj = 0;
                let zxs = 0;
                let zsl = 0;
                let ywtj = 0;
                let ywfpfy = 0;
                let ywywztj = 0;
                let ywtse = 0;
                let ywkpfyz = 0;
                let ywrmbche = 0;
                let ywhzhj = 0;
                let ywml = 0;
                let ywmlv = 0;
                let ywxj = 0;
                let ywhyf = 0;
                let ywyzf = 0;
                let ywyjje = 0;
                let aywyjje = 0;
                let ywckfy = 0;
                let ywywtshj17 = 0;
                let ywywtshj1 = 0;
                let ywywtshj16 = 0;
                let ywywtshj15 = 0;
                let ywywtshj12 = 0;
                let ywywtshj10 = 0;
                let ywywtshj9 = 0;
                let ywywtshj7 = 0;
                let ywywtshj5 = 0;
                let ywywtshj2 = 0;
                let ywywtshj13 = 0;
                let ywywtshj11 = 0;
                let ywywtshj8 = 0;
                let ywywtshj6 = 0;
                let ywywtshj4 = 0;
                let ywywtshj3 = 0;
                let ywywtshj14 = 0;
                let ygnlfy = 0;
                let bfz = 0;

                let fpzs = fphm.length - 8;
                let fphmhz = fphm.substr(fpzs, fpzs + 9);
                let xbfl = recordset.val("信保费率");
                let hbdm = recordset.val("货币代码");
                let nbhr = recordset.val("发票号码");
                let name = recordset.val("name");
                let rq = recordset.val("出运日期");
                let dl = recordset.val("代理");
                let ywbm = recordset.val("业务部门");

                let bxhw = "";
                let dsfy = 0;
                let sdsb1 = "";
                let hshz = "";
                let tsez = 0;
                let kpjez = 0;
                let bgjez = 0;

                let jdh = 0;
                let ywbgpm = [];
                let zwpmhz = [];
                let ywpmhz = [];
                let POhz = [];
                let wxjehz = [];
                let ywdjhz = [];
                let slhz = [];
                let gcpp = [];
                let hhsm = [];
                let cywyzd = [];
                let khhthz = [];
                let chxs12 = [];
                let djpmy12 = [];
                let zmz12 = [];
                let ztjz12 = [];
                let hgbm12 = [];
                let krcode12 = [];
                let zycp12 = [];
                let djpmyz2 = [];
                let djpm12 = [];
                let fktt = [];
                let fpbz = [];
                let dhhcb = [];
                let khhthz1 = [];
                let itemsl = 0;
                let items2 = 0;
                let items3 = 0;
                let cywyzdsl = 0;
                let hb_data = {};
                let jxusd = 0;
                let wxjez1 = 0;
                let jxusd1 = 0;
                let wxje1 = 0;
                let jxrmb = 0;
                let rmbche = 0;
                let mjzj1 = 0;
                let t = recordset.tables["产品资料"];
                let v = t.view_data;
                let a1 = 0;
                let hgbm = "";
                let kpgc = 0;
                let kpsb = 0;
                for (let r of v) {
                    let wxzmz = 0;
                    let wxztj = 0;
                    let wxzjz = 0;
                    let zzsl2 = 0;
                    let cgzj = 0;
                    let hlcg = 1;
                    // r[
                    //     recordset.module.field_by_full_name('产品资料.转美元汇率').db.name
                    // ] = zmjhl
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.包装长度").db.name
                        ] > 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.包装宽度").db.name
                        ] > 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.包装高度").db.name
                        ] > 0
                    ) {
                        r[
                                recordset.module.field_by_full_name("产品资料.外箱尺寸").db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name("产品资料.包装长度").db.name
                            ] +
                            "*" +
                            r[
                                recordset.module.field_by_full_name("产品资料.包装宽度").db.name
                            ] +
                            "*" +
                            r[
                                recordset.module.field_by_full_name("产品资料.包装高度").db.name
                            ] +
                            "CM";
                    }
                    itemsl = itemsl + 1;
                    zwpmhz.push(
                        r[recordset.module.field_by_full_name("产品资料.中文品名").db.name],
                    );
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.客人订单号").db.name
                        ] !== ""
                    ) {
                        POhz.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.客人订单号").db
                                .name
                            ],
                        );
                        wxjehz.push(
                            "USD" +
                            r[
                                recordset.module.field_by_full_name("产品资料.外销单价").db
                                .name
                            ] +
                            "/PC",
                        );
                        ywpmhz.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.单据品名英").db
                                .name
                            ],
                        );
                        slhz.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.出货数量").db.name
                            ] +
                            " " +
                            r[
                                recordset.module.field_by_full_name("产品资料.计量单位").db
                                .name
                            ],
                        );
                    }
                    r[recordset.module.field_by_full_name("产品资料.制单人员").db.name] =
                        recordset.val("制单人员");
                    if (khmc.includes("BEST PRICE LLC")) {
                        r[
                                recordset.module.field_by_full_name("产品资料.总 毛 重").db.name
                            ] =
                            Math.round(
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 毛 重").db
                                    .name
                                ] * 10,
                            ) / 10;
                        r[
                                recordset.module.field_by_full_name("产品资料.总 净 重").db.name
                            ] =
                            Math.round(
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 净 重").db
                                    .name
                                ] * 10,
                            ) / 10;
                    }
                    jdh = jdh + 1;
                    if (dd == 1) {
                        wxzmz =
                            r[
                                recordset.module.field_by_full_name("产品资料.总 毛 重").db.name
                            ];
                        wxztj =
                            r[
                                recordset.module.field_by_full_name("产品资料.总 体 积").db.name
                            ];
                        wxzjz =
                            r[
                                recordset.module.field_by_full_name("产品资料.总 净 重").db.name
                            ];
                        r[
                            recordset.module.field_by_full_name("产品资料.总 净 重").db.name
                        ] = Math.round(wxzjz * 10) / 10;
                        if (recordset.val("特殊出运") == "是") {} else {
                            if (recordset.val("我方公司") == "宁波景业国际贸易有限公司") {
                                r[
                                    recordset.module.field_by_full_name(
                                        "产品资料.总 体 积",
                                    ).db.name
                                ] = Math.round(wxztj * 1000) / 1000;
                            } else {
                                r[
                                    recordset.module.field_by_full_name(
                                        "产品资料.总 体 积",
                                    ).db.name
                                ] = Math.round(wxztj * 100) / 100;
                            }
                        }
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.箱    号").db.name
                        ] == ""
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.箱    号").db.name
                        ] = recordset.val("箱    号");
                    }
                    r[recordset.module.field_by_full_name("产品资料.封    号").db.name] =
                        recordset.val("封    号");
                    r[recordset.module.field_by_full_name("产品资料.提运单号").db.name] =
                        recordset.val("提运单号");
                    r[recordset.module.field_by_full_name("产品资料.来源一级").db.name] =
                        recordset.val("来源一级");
                    r[recordset.module.field_by_full_name("产品资料.客户来源").db.name] =
                        recordset.val("客户来源");
                    r[
                        recordset.module.field_by_full_name("产品资料.风控识别12").db.name
                    ] = recordset.val("风控识别12");
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.工厂品牌").db.name
                        ] !== "" &&
                        r[
                            recordset.module.field_by_full_name("产品资料.工厂品牌").db.name
                        ] != null
                    ) {
                        gcpp.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.工厂品牌").db.name
                            ],
                        );
                    }
                    // r[recordset.module.field_by_full_name('产品资料.汇    率').db.name] =
                    //     recordset.val('汇    率')
                    r[
                            recordset.module.field_by_full_name("产品资料.外销总价总").db.name
                        ] =
                        Math.round(
                            r[
                                recordset.module.field_by_full_name("产品资料.外销总价").db.name
                            ] *
                            zmjhl *
                            100,
                        ) / 100;
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                        ] == ""
                    ) {
                        r[recordset.module.field_by_full_name("产品资料.RMB客户").db.name] =
                            recordset.val("RMB客户");
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                        ] !== "" &&
                        r[
                            recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                        ] != null
                    ) {
                        hhsm.push(
                            "货号:" +
                            r[
                                recordset.module.field_by_full_name("产品资料.产品编号").db
                                .name
                            ] +
                            "暗佣金额:" +
                            hbdm12 +
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db
                                .name
                            ],
                        );
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.产品编号").db.name
                        ] !== ""
                    ) {
                        items2 = items2 + 1;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                        ] === "是"
                    ) {
                        r[
                                recordset.module.field_by_full_name(
                                    "产品资料.客户RMB总价9",
                                ).db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name(
                                    "产品资料.客户RMB总价",
                                ).db.name
                            ];
                        r[
                            recordset.module.field_by_full_name("产品资料.总 金 额9").db.name
                        ] = 0;
                        r[recordset.module.field_by_full_name("产品资料.佣金R").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ] +
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ];
                        r[recordset.module.field_by_full_name("产品资料.佣金M").db.name] =
                            0;
                        r[recordset.module.field_by_full_name("产品资料.佣金R1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ];
                        r[recordset.module.field_by_full_name("产品资料.暗佣R1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ];
                        r[recordset.module.field_by_full_name("产品资料.佣金R11").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ];
                        r[recordset.module.field_by_full_name("产品资料.暗佣R11").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ];
                        r[recordset.module.field_by_full_name("产品资料.佣金M11").db.name] =
                            0;
                        r[recordset.module.field_by_full_name("产品资料.暗佣M11").db.name] =
                            0;
                        if (recordset.val("汇    率") !== 0) {
                            r[
                                    recordset.module.field_by_full_name("产品资料.佣金M1").db.name
                                ] =
                                r[
                                    recordset.module.field_by_full_name("产品资料.佣    金").db
                                    .name
                                ] / recordset.val("汇    率");
                            r[
                                    recordset.module.field_by_full_name("产品资料.暗佣M1").db.name
                                ] =
                                r[
                                    recordset.module.field_by_full_name("产品资料.暗佣佣金").db
                                    .name
                                ] / recordset.val("汇    率");
                        }
                    } else {
                        r[recordset.module.field_by_full_name("产品资料.佣金R1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ] * recordset.val("汇    率");
                        r[recordset.module.field_by_full_name("产品资料.暗佣R1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ] * recordset.val("汇    率");
                        r[recordset.module.field_by_full_name("产品资料.佣金M1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ] * zmjhl;
                        r[recordset.module.field_by_full_name("产品资料.暗佣M1").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ] * zmjhl;
                        r[recordset.module.field_by_full_name("产品资料.佣金R11").db.name] =
                            0;
                        r[recordset.module.field_by_full_name("产品资料.暗佣R11").db.name] =
                            0;
                        r[recordset.module.field_by_full_name("产品资料.佣金M11").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.佣    金").db.name
                            ] * zmjhl;
                        r[recordset.module.field_by_full_name("产品资料.暗佣M11").db.name] =
                            r[
                                recordset.module.field_by_full_name("产品资料.暗佣佣金").db.name
                            ] * zmjhl;
                        r[
                                recordset.module.field_by_full_name("产品资料.总 金 额9").db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name("产品资料.外销总价").db.name
                            ];
                        r[
                            recordset.module.field_by_full_name(
                                "产品资料.客户RMB总价9",
                            ).db.name
                        ] = 0;
                        r[recordset.module.field_by_full_name("产品资料.佣金M").db.name] =
                            (r[
                                    recordset.module.field_by_full_name("产品资料.佣    金").db.name
                                ] +
                                r[
                                    recordset.module.field_by_full_name("产品资料.暗佣佣金").db
                                    .name
                                ]) *
                            zmjhl;
                        r[recordset.module.field_by_full_name("产品资料.佣金R").db.name] =
                            0;
                    }
                    if (
                        recordset.val("RMB客户") == "是" &&
                        recordset.val("汇    率") !== 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                            .name
                        ] > 0 &&
                        recordset.val("汇    率") !== 1
                    ) {
                        r[
                                recordset.module.field_by_full_name("产品资料.外销总价总").db.name
                            ] =
                            Math.round(
                                (r[
                                        recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                        .name
                                    ] /
                                    recordset.val("汇    率")) *
                                100,
                            ) / 100;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.出运唯一字段").db
                            .name
                        ] !== "" ||
                        r[
                            recordset.module.field_by_full_name("产品资料.出运唯一字段12").db
                            .name
                        ] !== ""
                    ) {
                        let cywyzdsl1 = cywyzd.indexOf(
                            r[
                                recordset.module.field_by_full_name("产品资料.出运唯一字段").db
                                .name
                            ] +
                            r[
                                recordset.module.field_by_full_name("产品资料.出运唯一字段12")
                                .db.name
                            ],
                        );
                        if (cywyzdsl1 < 0) {
                            cywyzd.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.出运唯一字段")
                                    .db.name
                                ] +
                                r[
                                    recordset.module.field_by_full_name(
                                        "产品资料.出运唯一字段12",
                                    ).db.name
                                ],
                            );
                        } else {
                            cywyzdsl = cywyzdsl + 1;
                        }
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.客户合同").db.name
                        ] !== ""
                    ) {
                        jkh = khhthz.indexOf(
                            r[
                                recordset.module.field_by_full_name("产品资料.客户合同").db.name
                            ],
                        );
                        if (jkh < 0) {
                            khhthz.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户合同").db
                                    .name
                                ],
                            );
                        }
                        khhthz1.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.客户合同").db.name
                            ],
                        );
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.单据品名英").db.name
                        ] &&
                        r[
                            recordset.module.field_by_full_name("产品资料.单据品名英").db.name
                        ] !== ""
                    ) {
                        r[
                                recordset.module.field_by_full_name("产品资料.单据品名英").db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name("产品资料.单据品名英").db
                                .name
                            ].toUpperCase();
                        dc12 = djpm12.indexOf(
                            r[
                                recordset.module.field_by_full_name("产品资料.单据品名英").db
                                .name
                            ] +
                            ";" +
                            r[
                                recordset.module.field_by_full_name("产品资料.专业产品编号")
                                .db.name
                            ],
                        );
                        if (dc12 < 0) {
                            djpm12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.单据品名英").db
                                    .name
                                ] +
                                ";" +
                                r[
                                    recordset.module.field_by_full_name("产品资料.专业产品编号")
                                    .db.name
                                ],
                            );
                            chxs12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.箱    数").db
                                    .name
                                ],
                            );
                            djpmy12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.单据品名英").db
                                    .name
                                ],
                            );
                            zmz12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 毛 重").db
                                    .name
                                ],
                            );
                            ztjz12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 体 积").db
                                    .name
                                ],
                            );
                            hgbm12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.海关编码").db
                                    .name
                                ],
                            );
                            krcode12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.客人CODE").db
                                    .name
                                ],
                            );
                            zycp12.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.专业产品编号")
                                    .db.name
                                ],
                            );
                            djpmyz2.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.单据品名英").db
                                    .name
                                ],
                            );
                        } else {
                            chxs12[dc12] =
                                Math.round(chxs12[dc12]) +
                                Number(
                                    r[
                                        recordset.module.field_by_full_name("产品资料.箱    数").db
                                        .name
                                    ],
                                );
                            zmz12[dc12] = round(
                                Number(zmz12[dc12]) +
                                Number(
                                    r[
                                        recordset.module.field_by_full_name("产品资料.总 毛 重")
                                        .db.name
                                    ],
                                ),
                                2,
                            );
                            if (
                                recordset.val("特殊出运") == "是" ||
                                recordset.val("我方公司") == "宁波景业国际贸易有限公司"
                            ) {
                                ztjz12[dc12] = round(
                                    Number(ztjz12[dc12]) +
                                    Number(
                                        r[
                                            recordset.module.field_by_full_name("产品资料.总 体 积")
                                            .db.name
                                        ],
                                    ),
                                    3,
                                );
                            } else {
                                ztjz12[dc12] = round(
                                    Number(ztjz12[dc12]) +
                                    Number(
                                        r[
                                            recordset.module.field_by_full_name("产品资料.总 体 积")
                                            .db.name
                                        ],
                                    ),
                                    2,
                                );
                            }
                        }
                    }

                    if ( 
                        r[recordset.module.field_by_full_name("产品资料.采购货币").db.name] && 
                        (r[recordset.module.field_by_full_name("产品资料.采购货币").db.name]
                        .indexOf("USD") > 0 ||
                        r[recordset.module.field_by_full_name("产品资料.采购货币").db.name]
                        .indexOf("$") > 0)
                    ) {
                        hlcg = recordset.val("汇    率") || 1;
                    }
                    cgzj =
                        r[
                            recordset.module.field_by_full_name("产品资料.采购总价").db.name
                        ] * hlcg;
                    console.log("cgzj : ", cgzj);
                    r[
                        recordset.module.field_by_full_name("产品资料.采购总价rmb").db.name
                    ] = cgzj;

                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] > 13
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] = 13;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.付款抬头").db.name
                        ] != ""
                    ) {
                        let fkj = fktt.indexOf(
                            r[
                                recordset.module.field_by_full_name("产品资料.付款抬头").db.name
                            ],
                        );
                        if (fkj < 0) {
                            fktt.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.付款抬头").db
                                    .name
                                ],
                            );
                        }
                    }

                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.出货数量").db.name
                        ] == 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.产品编号").db.name
                        ] == "" &&
                        r[
                            recordset.module.field_by_full_name("产品资料.是否代开").db.name
                        ] != "是"
                    ) {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.外销总价").db.name
                            ] > 0 ||
                            r[
                                recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                .name
                            ] > 0
                        ) {
                            let dhbdm = recordset.val("货币代码");
                            let dje =
                                r[
                                    recordset.module.field_by_full_name("产品资料.外销总价").db
                                    .name
                                ];
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] > 0
                            ) {
                                dhbdm = "RMB";
                                dje =
                                    r[
                                        recordset.module.field_by_full_name("产品资料.客户RMB总价")
                                        .db.name
                                    ];
                            }
                            fpbz.push(
                                r[
                                    recordset.module.field_by_full_name("产品资料.中文品名").db
                                    .name
                                ] +
                                dhbdm +
                                String(dje),
                            );
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                            ] != "是"
                        ) {
                            jxusd =
                                r[
                                    recordset.module.field_by_full_name("产品资料.外销总价").db
                                    .name
                                ] + jxusd;
                            wxjez1 =
                                r[
                                    recordset.module.field_by_full_name("产品资料.外销总价").db
                                    .name
                                ] *
                                zmjhl +
                                wxjez1;
                        } else {
                            jxusd1 =
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] + jxusd1;
                            wxjez1 =
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] /
                                recordset.val("汇    率") +
                                wxjez1;
                        }
                        jxrmb = cgzj + jxrmb;
                    } else {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.是否代开").db.name
                            ] != "是"
                        ) {
                            rmbche = cgzj + rmbche;
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                            ] == "是"
                        ) {
                            mjzj1 =
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] + mjzj1;
                        } else {
                            wxje1 =
                                r[
                                    recordset.module.field_by_full_name("产品资料.外销总价").db
                                    .name
                                ] + wxje1;
                        }
                        wxjez1 =
                            r[
                                recordset.module.field_by_full_name("产品资料.外销总价总").db
                                .name
                            ] *
                            zmjhl +
                            wxjez1;
                        r[recordset.module.field_by_full_name("产品资料.UR总价").db.name] =
                            0;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.计量单位").db.name
                        ] == "0"
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.计量单位").db.name
                        ] = "";
                    }
                    a1 = a1 + 1;
                    cgzj =
                        r[
                            recordset.module.field_by_full_name("产品资料.采购总价rmb").db
                            .name
                        ];
                    let ss =
                        r[recordset.module.field_by_full_name("产品资料.增值税率").db.name];
                    if (
                        recordset.val("装柜日期") == "" ||
                        recordset.val("装柜日期") == null
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期").db.name
                        ] = null;
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期加").db.name
                        ] = null;
                    } else {
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期").db.name
                        ] = recordset.val("装柜日期");
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期加").db.name
                        ] = recordset.val("装柜日期加");
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期").db.name
                        ] != null &&
                        r[
                            recordset.module.field_by_full_name("产品资料.装柜日期").db.name
                        ] != "" &&
                        r[
                            recordset.module.field_by_full_name("产品资料.交货日期1").db.name
                        ] != null &&
                        r[
                            recordset.module.field_by_full_name("产品资料.交货日期1").db.name
                        ] != ""
                    ) {
                        r[recordset.module.field_by_full_name("产品资料.天数差").db.name] =
                            Math.round(
                                (new Date(
                                        r[
                                            recordset.module.field_by_full_name("产品资料.装柜日期").db
                                            .name
                                        ],
                                    ) -
                                    new Date(
                                        r[
                                            recordset.module.field_by_full_name("产品资料.交货日期1")
                                            .db.name
                                        ],
                                    )) /
                                (1000 * 60 * 60 * 24),
                            );
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.配柜出运").db.name
                        ] == null ||
                        r[
                            recordset.module.field_by_full_name("产品资料.配柜出运").db.name
                        ] == ""
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.配柜出运").db.name
                        ] = "1999-01-01";
                    }
                    if (
                        sb == 1 &&
                        recordset.val("出运日期") != "" &&
                        recordset.val("出运日期") != null
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.单证判断").db.name
                        ] = "是";
                    } else {
                        r[
                            recordset.module.field_by_full_name("产品资料.单证判断").db.name
                        ] = "没交";
                    }
                    if (ss == 0) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] = 0;
                    }
                    if (ss == 4) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] = 4;
                    }
                    if (
                        ss == 3 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] != 0
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] = 3;
                    }

                    if (
                        ss == 1 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] != 0
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] = 1;
                    }
                    zzsl2 =
                        1 +
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] /
                        100;
                    if (
                        recordset.val("HSCODE位数") > 1 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.海关编码").db.name
                        ] != "" &&
                        r[
                            recordset.module.field_by_full_name("产品资料.海关编码").db.name
                        ] != null
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.海关编码2").db.name
                        ] = r[
                            recordset.module.field_by_full_name("产品资料.海关编码").db.name
                        ].substr(0, recordset.val("HSCODE位数"));
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.出运唯一字段").db
                            .name
                        ] == ""
                    ) {
                        if (dd == 1) {
                            r[
                                recordset.module.field_by_full_name(
                                    "产品资料.出运唯一字段",
                                ).db.name
                            ] = r.rid;
                        } else {
                            r[
                                recordset.module.field_by_full_name(
                                    "产品资料.出运唯一字段",
                                ).db.name
                            ] = r.rid;
                            //   copy(r[recordset.module.field_by_full_name('产品资料.中文品名').db.name] + ';' + CHYDHZ + ';' + r[recordset.module.field_by_full_name('产品资料.采购合同').db.name] + ';' + r[recordset.module.field_by_full_name('产品资料.箱    数').db.name] + ';' + floattostr(r[recordset.module.field_by_full_name('产品资料.外箱容量').db.name]) + ';' + inttostr(r[recordset.module.field_by_full_name('产品资料.退 税 率')) + r[recordset.module.field_by_full_name('产品资料.店铺名称').db.name] + r[recordset.module.field_by_full_name('产品资料.产品编号').db.name], 1, 248);
                        }
                    }
                    r[recordset.module.field_by_full_name("产品资料.发票识别1").db.name] =
                        recordset.val("出运识别1");
                    r[recordset.module.field_by_full_name("产品资料.客户id").db.name] =
                        recordset.val("客户编号");
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.合同客户").db.name
                        ] == ""
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.合同客户").db.name
                        ] = recordset.val("客户名称");
                    }
                    r[recordset.module.field_by_full_name("产品资料.客户名称").db.name] =
                        recordset.val("客户名称");
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.出货数量").db.name
                        ] > 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.产品编号").db.name
                        ] != ""
                    ) {
                        if (
                            ztj12 > 0 &&
                            r[
                                recordset.module.field_by_full_name("产品资料.总 体 积").db.name
                            ] > 0
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.体积比率").db.name
                            ] = round(
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 体 积").db
                                    .name
                                ] / ztj12,
                                4,
                            );
                            // r[
                            //         recordset.module.field_by_full_name(
                            //             '产品资料.电商总费用',
                            //         ).db.name
                            //     ] =
                            //     (r[
                            //             recordset.module.field_by_full_name('产品资料.总 体 积').db
                            //             .name
                            //         ] /
                            //         ztj12) *
                            //     recordset.val('头程费用')
                            // r[
                            //         recordset.module.field_by_full_name('产品资料.电商费用').db.name
                            //     ] =
                            //     Math.round(
                            //         (r[
                            //                 recordset.module.field_by_full_name('产品资料.电商总费用')
                            //                 .db.name
                            //             ] /
                            //             r[
                            //                 recordset.module.field_by_full_name('产品资料.出货数量')
                            //                 .db.name
                            //             ]) *
                            //         100,
                            //     ) / 100
                            // if (
                            //     r[
                            //         recordset.module.field_by_full_name('产品资料.RMB客户').db
                            //         .name
                            //     ] == '是'
                            // ) {
                            //     r[
                            //         recordset.module.field_by_full_name(
                            //             '产品资料.分配费用$',
                            //         ).db.name
                            //     ] = round(
                            //         r[
                            //             recordset.module.field_by_full_name('产品资料.体积比率').db
                            //             .name
                            //         ] *
                            //         (ywywhyf + ywywqtusd),
                            //         3,
                            //     )
                            //     r[
                            //         recordset.module.field_by_full_name(
                            //             '产品资料.分配费用',
                            //         ).db.name
                            //     ] = round(
                            //         r[
                            //             recordset.module.field_by_full_name('产品资料.体积比率').db
                            //             .name
                            //         ] *
                            //         (ywywckfy + ygnlfy + ywywyzf + ywywqtrmb),
                            //         3,
                            //     )
                            // } else {
                            //     r[
                            //         recordset.module.field_by_full_name(
                            //             '产品资料.分配费用$',
                            //         ).db.name
                            //     ] = round(
                            //         r[
                            //             recordset.module.field_by_full_name('产品资料.体积比率').db
                            //             .name
                            //         ] *
                            //         (ywywhyf + ywywqtusd),
                            //         3,
                            //     )
                            //     r[
                            //         recordset.module.field_by_full_name(
                            //             '产品资料.分配费用',
                            //         ).db.name
                            //     ] = round(
                            //         r[
                            //             recordset.module.field_by_full_name('产品资料.体积比率').db
                            //             .name
                            //         ] *
                            //         (ywywckfy + ygnlfy + ywywyzf + ywywqtrmb),
                            //         3,
                            //     )
                            // }
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.采购path").db.name
                            ] != "" && r[
                                recordset.module.field_by_full_name("产品资料.采购path").db.name
                            ]
                        ) {
                            r[
                                recordset.module.field_by_full_name(
                                    "产品资料.采购path1",
                                ).db.name
                            ] = r[
                                recordset.module.field_by_full_name("产品资料.采购path").db.name
                            ].substring(
                                1,
                                r[
                                    recordset.module.field_by_full_name("产品资料.采购path").db
                                    .name
                                ].length - 1,
                            );
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                            ] == "是"
                        ) {
                            r[recordset.module.field_by_full_name("产品资料.保费").db.name] =
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] *
                                xbfl -
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] *
                                xbfl *
                                bfz;
                        } else {
                            r[recordset.module.field_by_full_name("产品资料.保费$").db.name] =
                                (r[
                                        recordset.module.field_by_full_name("产品资料.外销总价").db
                                        .name
                                    ] *
                                    xbfl -
                                    r[
                                        recordset.module.field_by_full_name("产品资料.外销总价").db
                                        .name
                                    ] *
                                    xbfl *
                                    bfz) *
                                zmjhl;
                        }
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 0 ||
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 0
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                        ] = 0;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] > 0
                    ) {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 6
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.06, 2);
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 4
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / 1.04) * 0.04, 2);
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 13
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.13, 2);
                        }

                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 11
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.11, 2);
                        }

                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 9
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.09, 2);
                        }
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 10
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.1, 2);
                        }

                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 1
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / 1.01) * 0.01, 2);
                        }

                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 5
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.05, 2);
                        }

                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ] == 3
                        ) {
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                            ] = round((cgzj / zzsl2) * 0.03, 2);
                        }
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                        ] = round((cgzj / zzsl2) * 0.03, 2);
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 8
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 额").db.name
                        ] = round((cgzj / zzsl2) * 0.08, 2);
                    }
                    tsez =
                        tsez +
                        r[recordset.module.field_by_full_name("产品资料.退 税 额").db.name];
                    kpjez = kpjez + cgzj / zzsl2;
                    bgjez =
                        bgjez +
                        r[
                            recordset.module.field_by_full_name("产品资料.外销总价总").db.name
                        ];
                    if (
                        csz > 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.外销总价总").db.name
                        ] > 0
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.换汇成本").db.name
                        ] = round(
                            cgzj /
                            zzsl2 /
                            (r[
                                    recordset.module.field_by_full_name("产品资料.外销总价总").db
                                    .name
                                ] *
                                csz),
                            2,
                        );
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.换汇成本").db.name
                            ] > dds ||
                            r[
                                recordset.module.field_by_full_name("产品资料.换汇成本").db.name
                            ] < dxs
                        ) {
                            dhhcb.push(
                                "第" +
                                jdh +
                                "条记录换汇成本" +
                                r[
                                    recordset.module.field_by_full_name("产品资料.换汇成本").db
                                    .name
                                ] +
                                "大于" +
                                dds +
                                "或小于" +
                                dxs,
                            );
                        }
                    }
                    if (recordset.val("我方公司") == "宁波景业国际贸易有限公司") {
                        r[
                                recordset.module.field_by_full_name("产品资料.电商单价").db.name
                            ] =
                            (r[
                                    recordset.module.field_by_full_name("产品资料.采购单价").db.name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 额").db
                                    .name
                                ]) /
                            r[
                                recordset.module.field_by_full_name("产品资料.出货数量").db.name
                            ] /
                            recordset.val("电商汇率");
                        r[
                                recordset.module.field_by_full_name(
                                    "产品资料.电商外销单价",
                                ).db.name
                            ] =
                            Math.round(
                                (r[
                                        recordset.module.field_by_full_name("产品资料.电商单价").db
                                        .name
                                    ] +
                                    r[
                                        recordset.module.field_by_full_name("产品资料.电商费用").db
                                        .name
                                    ]) *
                                100,
                            ) / 100;
                        r[
                                recordset.module.field_by_full_name(
                                    "产品资料.电商外销总价",
                                ).db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name("产品资料.电商外销单价").db
                                .name
                            ] *
                            r[
                                recordset.module.field_by_full_name("产品资料.出货数量").db.name
                            ];
                        r[
                                recordset.module.field_by_full_name(
                                    "产品资料.电商外销单价(关)",
                                ).db.name
                            ] =
                            Math.round(
                                (r[
                                        recordset.module.field_by_full_name("产品资料.电商外销单价")
                                        .db.name
                                    ] +
                                    r[
                                        recordset.module.field_by_full_name("产品资料.关税单价").db
                                        .name
                                    ]) *
                                100,
                            ) / 100;
                        r[
                                recordset.module.field_by_full_name(
                                    "产品资料.电商外销总价(关)",
                                ).db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name("产品资料.电商外销单价(关)")
                                .db.name
                            ] *
                            r[
                                recordset.module.field_by_full_name("产品资料.出货数量").db.name
                            ];
                    }
                    if (recordset.val("货物状态") == "已出运") {
                        r[
                            recordset.module.field_by_full_name("产品资料.出运日期1").db.name
                        ] = recordset.val("出运日期");
                    } else {
                        r[
                            recordset.module.field_by_full_name("产品资料.出运日期1").db.name
                        ] = null;
                    }

                    let j = ywbgpm.indexOf(
                        r[
                            recordset.module.field_by_full_name("产品资料.英文报关品名").db
                            .name
                        ],
                    );
                    if (j < 0) {
                        ywbgpm.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.英文报关品名").db
                                .name
                            ],
                        );
                    }
                    if (hgbm == "") {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.海关编码").db.name
                            ] != ""
                        ) {
                            hgbm =
                                r[
                                    recordset.module.field_by_full_name("产品资料.海关编码").db
                                    .name
                                ];
                        }
                    }

                    recordset.module.field_by_full_name(
                        "产品资料.出货数量1",
                        r[recordset.module.field_by_full_name("产品资料.出货数量").db.name],
                    );
                    hwmc1 =
                        r[
                            recordset.module.field_by_full_name("产品资料.中文报关品名").db
                            .name
                        ];

                    if (hwmc1 != null && hwmc1 != "") {
                        hwmc = hwmc1.trim();
                        r[
                            recordset.module.field_by_full_name(
                                "产品资料.中文报关品名",
                            ).db.name
                        ] = hwmc;
                    }
                    r[recordset.module.field_by_full_name("产品资料.发票号码").db.name] =
                        nbhr;
                    r[recordset.module.field_by_full_name("产品资料.核算发票").db.name] =
                        recordset.val("核算发票");
                    r[recordset.module.field_by_full_name("产品资料.出运单号").db.name] =
                        cydh;
                    r[recordset.module.field_by_full_name("产品资料.货币代码").db.name] =
                        hbdm;
                    r[
                        recordset.module.field_by_full_name("产品资料.英文报关品名").db.name
                    ] = name;
                    r[recordset.module.field_by_full_name("产品资料.出运日期").db.name] =
                        rq;
                    r[recordset.module.field_by_full_name("产品资料.代理").db.name] = dl;
                    r[recordset.module.field_by_full_name("产品资料.业务部门").db.name] =
                        ywbm;
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 13
                    ) {
                        hj13 = hj13 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 12
                    ) {
                        hj12 = hj12 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 11
                    ) {
                        hj11 = hj11 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 10
                    ) {
                        hj10 = hj10 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 9
                    ) {
                        hj9 = hj9 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 8
                    ) {
                        hj8 = hj8 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 7
                    ) {
                        hj7 = hj7 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 6
                    ) {
                        hj6 = hj6 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 5
                    ) {
                        hj5 = hj5 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 4
                    ) {
                        hj4 = hj4 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 3
                    ) {
                        hj3 = hj3 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 2
                    ) {
                        hj2 = hj2 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 1
                    ) {
                        hj1 = hj1 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] > 0
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.是否开票").db.name
                        ] = "是";
                    } else {
                        r[
                            recordset.module.field_by_full_name("产品资料.是否开票").db.name
                        ] = "否";
                    }
                    zkfy =
                        zkfy +
                        r[recordset.module.field_by_full_name("产品资料.纸卡费用").db.name];
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 0
                    ) {
                        hjyw = hjyw + cgzj;
                        zmz =
                            zmz +
                            r[
                                recordset.module.field_by_full_name("产品资料.总 毛 重").db.name
                            ];
                        zjz =
                            zjz +
                            r[
                                recordset.module.field_by_full_name("产品资料.总 净 重").db.name
                            ];
                        ztj =
                            ztj +
                            r[
                                recordset.module.field_by_full_name("产品资料.总 体 积").db.name
                            ];
                        zsl =
                            zsl +
                            r[
                                recordset.module.field_by_full_name("产品资料.出货数量").db.name
                            ];
                        zxs =
                            zxs +
                            r[
                                recordset.module.field_by_full_name("产品资料.箱    数").db.name
                            ];
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 10
                    ) {
                        tshj10 = tshj14 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 13
                    ) {
                        tshj13 = tshj13 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 12
                    ) {
                        tshj12 = tshj12 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 11
                    ) {
                        tshj11 = tshj11 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 9 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 13
                    ) {
                        tshj9 = tshj9 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 9 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] == 9
                    ) {
                        ztshj9 = ztshj9 + cgzj;
                    }
                    if (
                        Number(
                            r[
                                recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                            ],
                        ) == 0 &&
                        Number(
                            r[
                                recordset.module.field_by_full_name("产品资料.增值税率").db.name
                            ],
                        ) > 0
                    ) {
                        tshj0 = tshj0 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 7
                    ) {
                        tshj7 = tshj7 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 2
                    ) {
                        tshj2 = tshj2 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 1
                    ) {
                        tshj1 = tshj1 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 6
                    ) {
                        tshj6 = tshj6 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 5
                    ) {
                        tshj5 = tshj5 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 4
                    ) {
                        tshj4 = tshj4 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 3
                    ) {
                        tshj3 = tshj3 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.退 税 率").db.name
                        ] == 8
                    ) {
                        tshj14 = tshj14 + cgzj;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.货号备注").db.name
                        ] !=
                        r[
                            recordset.module.field_by_full_name("产品资料.专业产品编号").db
                            .name
                        ] &&
                        r[
                            recordset.module.field_by_full_name("产品资料.专业产品编号").db
                            .name
                        ] != ""
                    ) {
                        r[
                                recordset.module.field_by_full_name("产品资料.货号备注").db.name
                            ] =
                            r[
                                recordset.module.field_by_full_name(
                                    "产品资料.专业产品编号",
                                ).db.name
                            ];
                    } else {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.货号备注").db.name
                            ] == "" &&
                            r[
                                recordset.module.field_by_full_name("产品资料.专业产品编号").db
                                .name
                            ] == ""
                        ) {
                            r[
                                    recordset.module.field_by_full_name("产品资料.货号备注").db.name
                                ] =
                                r[
                                    recordset.module.field_by_full_name(
                                        "产品资料.产品编号",
                                    ).db.name
                                ];
                        }
                    }
                    let ywywgcmc =
                        r[recordset.module.field_by_full_name("产品资料.工厂名称").db.name];
                    let ywywdq1 =
                        r[recordset.module.field_by_full_name("产品资料.地区").db.name];
                    let ywywdq2 = "义乌";
                    ywywztj =
                        ywywztj +
                        r[recordset.module.field_by_full_name("产品资料.总 体 积").db.name];
                    if (ywywdq1 != "") {
                        if (ywywdq1 == ywywdq2) {
                            let ywtse =
                                ywtse +
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 额").db
                                    .name
                                ];
                            let ywkpfyz =
                                ywkpfyz +
                                r[
                                    recordset.module.field_by_full_name("产品资料.开票费用").db
                                    .name
                                ];
                            let ywtj =
                                ywtj +
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 体 积").db
                                    .name
                                ];
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.是否代开").db
                                    .name
                                ] != "是"
                            ) {
                                let ywrmbche = ywrmbche + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.出货数量").db
                                    .name
                                ] > 0 &&
                                r[
                                    recordset.module.field_by_full_name("产品资料.产品编号").db
                                    .name
                                ] != ""
                            ) {
                                if (
                                    r[
                                        recordset.module.field_by_full_name("产品资料.RMB客户").db
                                        .name
                                    ] == "是"
                                ) {
                                    if (recordset.val("RMB客户") == "是") {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name(
                                                    "产品资料.客户RMB总价",
                                                ).db.name
                                            ];
                                    } else {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name(
                                                    "产品资料.客户RMB总价",
                                                ).db.name
                                            ] /
                                            ywywhlv1;
                                    }
                                } else {
                                    if (recordset.val("RMB客户") == "是") {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.外销总价")
                                                .db.name
                                            ] *
                                            ywywhlv1;
                                    } else {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.外销总价")
                                                .db.name
                                            ];
                                    }
                                }
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.增值税率").db
                                    .name
                                ] == 0
                            ) {
                                ywxj = ywxj + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 13
                            ) {
                                ywywtshj13 = ywywtshj13 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 12
                            ) {
                                ywywtshj12 = ywywtshj12 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 11
                            ) {
                                ywywtshj11 = ywywtshj11 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 9
                            ) {
                                ywywtshj9 = ywywtshj9 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 10
                            ) {
                                ywywtshj10 = ywywtshj10 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 7
                            ) {
                                ywywtshj7 = ywywtshj7 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 6
                            ) {
                                ywywtshj6 = ywywtshj6 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 5
                            ) {
                                ywywtshj5 = ywywtshj5 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 4
                            ) {
                                ywywtshj4 = ywywtshj4 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 3
                            ) {
                                ywywtshj3 = ywywtshj3 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 2
                            ) {
                                ywywtshj2 = ywywtshj2 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 1
                            ) {
                                ywywtshj1 = ywywtshj1 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 8
                            ) {
                                ywywtshj14 = ywywtshj14 + cgzj;
                            }
                            ywfpfy =
                                ywfpfy +
                                r[
                                    recordset.module.field_by_full_name("产品资料.体积比率").db
                                    .name
                                ] *
                                jxrmb;
                        }
                    }

                    if (ywywdq1 == "") {
                        if (ywywgcmc.length < 8 && ywywgcmc.length > 0) {
                            ywtse =
                                ywtse +
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 额").db
                                    .name
                                ];
                            ywkpfyz =
                                ywkpfyz +
                                r[
                                    recordset.module.field_by_full_name("产品资料.开票费用").db
                                    .name
                                ];
                            ywtj =
                                ywtj +
                                r[
                                    recordset.module.field_by_full_name("产品资料.总 体 积").db
                                    .name
                                ];
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.是否代开").db
                                    .name
                                ] != "是"
                            ) {
                                ywrmbche = ywrmbche + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.出货数量").db
                                    .name
                                ] > 0 &&
                                r[
                                    recordset.module.field_by_full_name("产品资料.产品编号").db
                                    .name
                                ] != ""
                            ) {
                                if (
                                    r[
                                        recordset.module.field_by_full_name("产品资料.RMB客户").db
                                        .name
                                    ] == "是"
                                ) {
                                    if (recordset.val("RMB客户") == "是") {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name(
                                                    "产品资料.客户RMB总价",
                                                ).db.name
                                            ];
                                    } else {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name(
                                                    "产品资料.客户RMB总价",
                                                ).db.name
                                            ] /
                                            ywywhlv1;
                                    }
                                } else {
                                    if (recordset.val("RMB客户") == "是") {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.外销总价")
                                                .db.name
                                            ] *
                                            ywywhlv1;
                                    } else {
                                        ywhzhj =
                                            ywhzhj +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.外销总价")
                                                .db.name
                                            ];
                                    }
                                }
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.增值税率").db
                                    .name
                                ] == 0
                            ) {
                                ywxj = ywxj + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 13
                            ) {
                                ywywtshj13 = ywywtshj13 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 12
                            ) {
                                ywywtshj12 = ywywtshj12 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 11
                            ) {
                                ywywtshj11 = ywywtshj11 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 9
                            ) {
                                ywywtshj9 = ywywtshj9 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 10
                            ) {
                                ywywtshj10 = ywywtshj10 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 7
                            ) {
                                ywywtshj7 = ywywtshj7 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 6
                            ) {
                                ywywtshj6 = ywywtshj6 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 5
                            ) {
                                ywywtshj5 = ywywtshj5 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 4
                            ) {
                                ywywtshj4 = ywywtshj4 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 3
                            ) {
                                ywywtshj3 = ywywtshj3 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 2
                            ) {
                                ywywtshj2 = ywywtshj2 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 1
                            ) {
                                ywywtshj1 = ywywtshj1 + cgzj;
                            }
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.退 税 率").db
                                    .name
                                ] == 8
                            ) {
                                ywywtshj14 = ywywtshj14 + cgzj;
                            }
                            ywfpfy =
                                ywfpfy +
                                r[
                                    recordset.module.field_by_full_name("产品资料.体积比率").db
                                    .name
                                ] *
                                jxrmb;
                        }
                    }
                    dj =
                        r[recordset.module.field_by_full_name("产品资料.外销单价").db.name];
                    r[recordset.module.field_by_full_name("产品资料.所属地区").db.name] =
                        recordset.val("所属地区");
                    r[recordset.module.field_by_full_name("产品资料.贸易国别").db.name] =
                        recordset.val("贸易国别");
                    r[recordset.module.field_by_full_name("产品资料.目的口岸").db.name] =
                        recordset.val("目的口岸");
                    r[
                        recordset.module.field_by_full_name("产品资料.贸易国别中").db.name
                    ] = recordset.val("贸易国别中");
                    r[recordset.module.field_by_full_name("产品资料.实际出运").db.name] =
                        recordset.val("实际出运");
                    if (
                        recordset.val("实际出运") != "" &&
                        recordset.val("实际出运") != null
                    ) {
                        r[
                            recordset.module.field_by_full_name("产品资料.实际年月").db.name
                        ] = recordset.val("实际出运").substr(1, 7);
                        r[recordset.module.field_by_full_name("产品资料.实际年").db.name] =
                            recordset.val("实际出运").substr(1, 4);
                    }
                    r[recordset.module.field_by_full_name("产品资料.实际周").db.name] =
                        recordset.val("实际周");
                    r[recordset.module.field_by_full_name("产品资料.出运周").db.name] =
                        recordset.val("出运周");
                    r[recordset.module.field_by_full_name("产品资料.出运年").db.name] =
                        recordset.val("出运年");
                    r[recordset.module.field_by_full_name("产品资料.出运年月").db.name] =
                        recordset.val("出运年月");
                    r[recordset.module.field_by_full_name("产品资料.毛    重1").db.name] =
                        r[recordset.module.field_by_full_name("产品资料.毛    重").db.name];
                    r[recordset.module.field_by_full_name("产品资料.净    重1").db.name] =
                        r[recordset.module.field_by_full_name("产品资料.净    重").db.name];
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.外箱容量").db.name
                        ] > 0
                    ) {
                        r[
                                recordset.module.field_by_full_name("产品资料.单个毛重").db.name
                            ] =
                            Math.round(
                                (r[
                                        recordset.module.field_by_full_name("产品资料.毛    重").db
                                        .name
                                    ] /
                                    r[
                                        recordset.module.field_by_full_name("产品资料.外箱容量").db
                                        .name
                                    ]) *
                                1000,
                            ) / 1000;
                        r[
                                recordset.module.field_by_full_name("产品资料.单个净重").db.name
                            ] =
                            Math.round(
                                (r[
                                        recordset.module.field_by_full_name("产品资料.净    重").db
                                        .name
                                    ] /
                                    r[
                                        recordset.module.field_by_full_name("产品资料.外箱容量").db
                                        .name
                                    ]) *
                                1000,
                            ) / 1000;
                    }
                    let mlf = 0;
                    let wxjef = 0;
                    let rmbf = 0;
                    let cgzjf = 0;
                    let kpsb = 0;

                    cgzjf =
                        r[
                            recordset.module.field_by_full_name("产品资料.采购总价rmb").db
                            .name
                        ] +
                        r[recordset.module.field_by_full_name("产品资料.辅料总价").db.name];
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.RMB客户").db.name
                        ] != "是"
                    ) {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.外销总价").db.name
                            ] != 0 &&
                            recordset.val("汇    率") > 0 &&
                            recordset.val("汇    率") != 1
                        ) {
                            wxjef =
                                r[
                                    recordset.module.field_by_full_name("产品资料.外销总价").db
                                    .name
                                ] *
                                zmjhl -
                                r[
                                    recordset.module.field_by_full_name("产品资料.分配费用$").db
                                    .name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.保费$").db.name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.佣    金").db
                                    .name
                                ] *
                                zmjhl;
                            mlf =
                                ((wxjef * recordset.val("汇    率") -
                                        (cgzjf +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.暗佣佣金")
                                                .db.name
                                            ] +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.暗佣佣金")
                                                .db.name
                                            ] *
                                            zmjhl *
                                            recordset.val("汇    率")) +
                                        r[
                                            recordset.module.field_by_full_name("产品资料.退 税 额").db
                                            .name
                                        ]) /
                                    ((r[
                                                recordset.module.field_by_full_name("产品资料.外销总价").db
                                                .name
                                            ] -
                                            r[
                                                recordset.module.field_by_full_name("产品资料.佣    金")
                                                .db.name
                                            ]) *
                                        zmjhl *
                                        recordset.val("汇    率"))) *
                                100;
                            r[
                                recordset.module.field_by_full_name("产品资料.毛利率").db.name
                            ] = mlf;
                        } else {
                            if (
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] != 0
                            ) {
                                rmbf =
                                    r[
                                        recordset.module.field_by_full_name("产品资料.客户RMB总价")
                                        .db.name
                                    ] -
                                    r[
                                        recordset.module.field_by_full_name("产品资料.分配费用").db
                                        .name
                                    ] -
                                    r[
                                        recordset.module.field_by_full_name("产品资料.保费").db.name
                                    ] -
                                    r[
                                        recordset.module.field_by_full_name("产品资料.佣    金").db
                                        .name
                                    ];
                                mlf =
                                    ((rmbf -
                                            (cgzjf +
                                                r[
                                                    recordset.module.field_by_full_name("产品资料.暗佣佣金")
                                                    .db.name
                                                ]) +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.退 税 额")
                                                .db.name
                                            ] -
                                            r[
                                                recordset.module.field_by_full_name("产品资料.开票费用")
                                                .db.name
                                            ]) /
                                        (r[
                                                recordset.module.field_by_full_name(
                                                    "产品资料.客户RMB总价",
                                                ).db.name
                                            ] -
                                            r[
                                                recordset.module.field_by_full_name("产品资料.佣    金")
                                                .db.name
                                            ])) *
                                    100;
                                r[
                                    recordset.module.field_by_full_name("产品资料.毛利率").db.name
                                ] = mlf;
                            }
                        }
                    } else {
                        if (
                            r[
                                recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                .name
                            ] != 0
                        ) {
                            rmbf =
                                r[
                                    recordset.module.field_by_full_name("产品资料.客户RMB总价").db
                                    .name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.分配费用").db
                                    .name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.保费").db.name
                                ] -
                                r[
                                    recordset.module.field_by_full_name("产品资料.佣    金").db
                                    .name
                                ];
                            mlf =
                                ((rmbf -
                                        (cgzjf +
                                            r[
                                                recordset.module.field_by_full_name("产品资料.暗佣佣金")
                                                .db.name
                                            ]) +
                                        r[
                                            recordset.module.field_by_full_name("产品资料.退 税 额").db
                                            .name
                                        ] -
                                        r[
                                            recordset.module.field_by_full_name("产品资料.开票费用").db
                                            .name
                                        ]) /
                                    (r[
                                            recordset.module.field_by_full_name("产品资料.客户RMB总价")
                                            .db.name
                                        ] -
                                        r[
                                            recordset.module.field_by_full_name("产品资料.佣    金")
                                            .db.name
                                        ])) *
                                100;
                            r[
                                recordset.module.field_by_full_name("产品资料.毛利率").db.name
                            ] = mlf;
                        }
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] > 0 &&
                        r[
                            recordset.module.field_by_full_name("产品资料.开票工厂").db.name
                        ] == ""
                    ) {
                        kpgc = 1;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.增值税率").db.name
                        ] > 0 &&
                        (r[
                                recordset.module.field_by_full_name("产品资料.中文报关品名").db
                                .name
                            ] == "" ||
                            r[
                                recordset.module.field_by_full_name("产品资料.中文报关品名").db
                                .name
                            ] == "无")
                    ) {
                        kpsb = 1;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.净    重").db.name
                        ] >
                        r[
                            recordset.module.field_by_full_name("产品资料.毛    重").db.name
                        ] ||
                        r[
                            recordset.module.field_by_full_name("产品资料.总 净 重").db.name
                        ] >
                        r[
                            recordset.module.field_by_full_name("产品资料.总 毛 重").db.name
                        ]
                    ) {
                        sdsb1 = 1;
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name("产品资料.单据品名英").db.name
                        ] != "" && r[
                            recordset.module.field_by_full_name("产品资料.单据品名英").db.name
                        ]
                    ) {
                        ywdjhz.push(
                            r[
                                recordset.module.field_by_full_name("产品资料.单据品名英").db
                                .name
                            ].toUpperCase() +
                            " " +
                            "HS CODE:" +
                            r[
                                recordset.module.field_by_full_name("产品资料.客人CODE").db
                                .name
                            ],
                        );
                        if (hshz == "") {
                            hshz =
                                r[
                                    recordset.module.field_by_full_name("产品资料.海关编码").db
                                    .name
                                ];
                        }
                    }
                    if (khmc.toUpperCase().includes("AMAZON")) {
                         cghtzs = 0
                        let hthm = r[
                            recordset.module.field_by_full_name('产品资料.采购合同').db.name
                        ]
                        if (hthm != '' && hthm != null && hthm.length > 9) {
                            cghtzs = hthm.length - 9
                            let startIndex = cghtzs - 1;
                            r[recordset.module.field_by_full_name('产品资料.采购合同1').db.name] = hthm.substr(startIndex, startIndex + 10) + '.' + fphmhz
                        }
                    }
                    if (
                        r.cywyzd != "" &&
                        r.cywyzd != null &&
                        cydh != "" &&
                        cydh != null &&
                        fphm != "" &&
                        fphm != null &&
                        cydh != fphm
                    ) {
                        if (r.fpsfytq != "是") {
                            flag = true;
                            r.fpsfytq = "是";
                        }
                    }
                    t.push_modi_rid(r.rid);
                }
                t.sync_operate_data();
                t.modified = true;
                recordset.do_re_sum_by_trigger_table("产品资料");

                recordset.val("hs汇总", hshz);
                recordset.val("品名code", ywdjhz.join("\r\n"));
                recordset.val("中文品名汇总", zwpmhz.join("\r\n"));
                if (cywyzdsl > 0) {
                    errors.push("有重复数据请注意" + cywyzdsl);
                }

                let ywywhlv = recordset.val("汇    率");

                recordset.val("客户名称", khmc);
                // if (recordset.val('RMB客户') != '是') {
                //     ywywhlv = recordset.val('汇    率')
                //     ywwxzjz = recordset.val('外销总额')
                //     recordset.val(
                //         '保费$',
                //         Math.round(
                //             (recordset.val('货值合计') * zmjhl -
                //                 recordset.val('明佣合计') * zmjhl -
                //                 recordset.val('已收定金')) *
                //             xbfl *
                //             100,
                //         ) / 100,
                //     )
                //     recordset.val(
                //         '外销总额总',
                //         Math.round(recordset.val('货值合计') * zmjhl * 100) / 100,
                //     )
                //     recordset.val(
                //         '货值合计总',
                //         Math.round(recordset.val('货值合计') * zmjhl * 100) / 100,
                //     )
                //     recordset.val(
                //         '风控金额',
                //         (recordset.val('货值合计') - recordset.val('明佣合计')) * zmjhl,
                //     )
                //     recordset.val('货值合计DR', 0)
                //     recordset.val(
                //         '货值合计DM',
                //         (recordset.val('货值合计') - recordset.val('明佣合计')) * zmjhl,
                //     )
                //     recordset.val('市场金额R', 0)
                //     recordset.val('市场金额M', recordset.val('市场金额') * zmjhl)
                //     recordset.val(
                //         '风控金额总',
                //         recordset.val('外销总额总') - recordset.val('明佣合计') * zmjhl,
                //     )
                //     recordset.val('市场美金总', recordset.val('市场金额') * zmjhl)
                // } else {
                //     ywywhlv = 1
                //     recordset.val(
                //         '货值合计',
                //         Math.round(
                //             (recordset.val('客户RMB总价') +
                //                 jjhj +
                //                 recordset.val('外销总额') * recordset.val('汇    率') +
                //                 recordset.val('加项客户RMB') +
                //                 recordset.val('加项金额') * zmjhl * recordset.val('汇    率') +
                //                 recordset.val('额外货值')) *
                //             100,
                //         ) / 100,
                //     )
                //     ywwxzjz = recordset.val('客户RMB总价')
                //     recordset.val(
                //         '保费',
                //         Math.round(
                //             (recordset.val('货值合计') -
                //                 recordset.val('明佣合计') -
                //                 recordset.val('已收定金')) *
                //             xbfl *
                //             100,
                //         ) / 100,
                //     )
                //     if (recordset.val('汇    率') > 0) {
                //         recordset.val(
                //             '外销总额总',
                //             Math.round(
                //                 (recordset.val('货值合计') / recordset.val('汇    率')) * 100,
                //             ) / 100,
                //         )
                //     }
                //     recordset.val('风控金额', recordset.val('外销总额总'))
                //     recordset.val('货值合计总', recordset.val('外销总额总'))
                //     recordset.val(
                //         '风控金额总',
                //         recordset.val('外销总额总') -
                //         recordset.val('明佣合计') / recordset.val('汇    率'),
                //     )
                //     recordset.val(
                //         '市场美金总',
                //         recordset.val('市场金额') / recordset.val('汇    率'),
                //     )
                //     recordset.val(
                //         '货值合计DR',
                //         recordset.val('货值合计') - recordset.val('明佣合计'),
                //     )
                //     recordset.val('货值合计DM', 0)
                //     recordset.val('市场金额R', recordset.val('市场金额'))
                //     recordset.val('市场金额M', 0)
                // }
                // if (recordset.val('RMB客户') == '是') {
                //     recordset.val(
                //         '货值合计￥',
                //         Math.round(
                //             (recordset.val('客户RMB总价') +
                //                 jjhj +
                //                 recordset.val('加项客户RMB') +
                //                 recordset.val('额外货值')) *
                //             100,
                //         ) / 100,
                //     )
                //     recordset.val(
                //         '货值合计$',
                //         Math.round(
                //             (recordset.val('外销总额') * zmjhl +
                //                 recordset.val('加项金额') * zmjhl) *
                //             100,
                //         ) / 100,
                //     )
                // } else {
                //     recordset.val(
                //         '货值合计$',
                //         Math.round(
                //             (recordset.val('外销总额') * zmjhl +
                //                 jjhj * zmjhl +
                //                 recordset.val('加项金额') * zmjhl +
                //                 recordset.val('额外货值')) *
                //             100,
                //         ) / 100,
                //     )
                //     recordset.val(
                //         '货值合计￥',
                //         Math.round(
                //             (recordset.val('客户RMB总价') + recordset.val('加项客户RMB')) *
                //             100,
                //         ) / 100,
                //     )
                // }
                // ywywhlv1 = recordset.val('汇    率')
                // ywywhyf = recordset.val('海 运 费')
                // ywywyzf = recordset.val('运 杂 费')
                // ywywyjje = recordset.val('明佣合计')
                // aywywyjje = recordset.val('暗佣合计')
                // ywywqtusd = recordset.val('其他 USD')
                // ywywqtrmb = recordset.val('其他 RMB')
                // ywywhzjx = recordset.val('货值加项合计')
                // ywywhzjjx = recordset.val('货值减项合计')
                // ywywckfy = recordset.val('仓库费用')
                // ygnlfy = 0
                // if (recordset.val('预估内陆费') > 0) {
                //     ygnlfy = recordset.val('预估内陆费')
                //     ywywyzf = 0
                // }
                ztj12 = recordset.val("体积合计");
                // recordset.val('修改清单', tj1 + _.user.username + formatdatetime('yyyy-mm-dd hh:mm:ss', now) + floattostr(recordset.val('货值合计') - recordset.val('明佣合计')) + ';' + recordset.val('实际出运'));
                // recordset.val('修改人员', IApplication.LoginInfo.userinfo.Name);
                if (fphm == cydh || fphm.indexOf("CSD-") > 0) {
                    recordset.val("出运识别", "是");
                } else {
                    recordset.val("出运识别", "否");
                }
                // fkttz = '';
                // for (let fkjz = 0; fkjz < fktt.count; fkjz++) {
                //     if (fkttz === '') {
                //         fkttz = fktt.strings[fkjz];
                //     } else {
                //         fkttz = fkttz + '\r\n' + fktt.strings[fkjz];
                //     }
                // }
                recordset.val("付款抬头", fktt.join("\r\n"));
                // recordset.val('13% 合计', round(hj13, 3))
                // recordset.val('12% 合计', round(hj12, 3))
                // recordset.val('11% 合计', round(hj11, 3))
                // recordset.val('10% 合计', round(hj10, 3))
                // recordset.val('9% 合计', round(hj9, 3))
                // recordset.val('8% 合计', round(hj8, 3))
                // recordset.val('7% 合计', round(hj7, 3))
                // recordset.val('6% 合计', round(hj6, 3))
                // recordset.val('5% 合计', round(hj5, 3))
                // recordset.val('4% 合计', round(hj4, 3))
                // recordset.val('3% 合计', round(hj3, 3))
                // recordset.val('2% 合计', round(hj2, 3))
                // recordset.val('1% 合计', round(hj1, 3))
                // recordset.val('现金合计', round(hjyw, 3))
                // recordset.val('不报关总金额', round(hjyw, 3))
                recordset.val("不报关总毛重", round(zmz, 2));
                recordset.val("不报关总净重", round(zjz, 2));
                recordset.val("不报关总体积", round(ztj, 4));
                recordset.val("不报关总数量", zsl);
                recordset.val("不报关总箱数", zxs);
                // recordset.val('13 合计', round(tshj13, 3))
                // recordset.val('12 合计', round(tshj12, 3))
                // recordset.val('11 合计', round(tshj11, 3))
                // recordset.val('10 合计', round(tshj10, 3))
                // recordset.val('9  合计', round(tshj9, 3))
                // recordset.val('增9合计', round(ztshj9, 3))
                // recordset.val('0  合计', round(tshj0, 3))
                // recordset.val('7  合计', round(tshj7, 3))
                // recordset.val('6  合计', round(tshj6, 3))
                // recordset.val('5  合计', round(tshj5, 3))
                // recordset.val('4  合计', round(tshj4, 3))
                // recordset.val('3  合计', round(tshj3, 3))
                // recordset.val('2  合计', round(tshj2, 3))
                // recordset.val('1  合计', round(tshj1, 3))
                // recordset.val('8  合计', round(tshj14, 3))
                // if (ywwxzjz != 0) {
                //     ywhyf = (ywhzhj / ywwxzjz) * ywywhyf
                //     ywyzf = (ywhzhj / ywwxzjz) * ywywyzf
                //     ywyjje = (ywhzhj / ywwxzjz) * ywywyjje
                //     aywyjje = (ywhzhj / ywwxzjz) * aywywyjje
                //     ywckfy = (ywhzhj / ywwxzjz) * ywywckfy
                //     ywhzhj =
                //         ywhzhj +
                //         (ywhzhj / ywwxzjz) * ywywhzjx -
                //         (ywhzhj / ywwxzjz) * ywywhzjjx
                //     ywml =
                //         ywhzhj -
                //         ywyjje -
                //         (ywhzhj / ywwxzjz) * ywywhyf * ywywhlv -
                //         ywfpfy -
                //         ywywtshj17 -
                //         ywywtshj16 -
                //         ywywtshj15 -
                //         ywywtshj13 -
                //         ywywtshj12 -
                //         ywywtshj11 -
                //         ywywtshj10 -
                //         ywywtshj9 -
                //         ywywtshj8 -
                //         ywywtshj7 -
                //         ywywtshj14 -
                //         ywywtshj6 -
                //         ywywtshj5 -
                //         ywywtshj4 -
                //         ywywtshj3 -
                //         ywywtshj2 -
                //         ywywtshj1 -
                //         ywxj -
                //         (ywhzhj / ywwxzjz) * (ywywckfy + ywywyzf) +
                //         ywtse -
                //         aywyjje -
                //         ywkpfyz
                // } else {
                //     ywhyf = 0
                //     ywyzf = 0
                //     ywyjje = 0
                //     ywckfy = 0
                //     ywhzhj = 0
                //     ywml = 0
                // }
                // if (ywhzhj != 0 && ywywhlv != 0) {
                //     ywmlv = (100 * ywml) / ywhzhj / ywywhlv
                // } else {
                //     ywmlv = 0
                // }
                xyzh = recordset.val("是否信保");
                htsm = "";
                if (sb == 1 && xyzh != "无" && btsb == 0) {
                    errors.push("此客人有" + xyzh + "保险请注意");
                }
                if (sb == 1 && recordset.val("制单人员") == _.user.username) {
                    if (!fphm.includes("SFT")) {
                        if (recordset.val("更新识别") == "") {
                            errors.push("请注意此票没点产品资料——扩展——更新信息");
                        }
                    }
                    if (kpgc == 1) {
                        errors.push("此票存在有增税无开票工厂情况，请检查后保存");
                    }
                    if (kpsb == 1) {
                        errors.push("此票存在有增税无报关情况，请检查后保存");
                    }
                }

                recordset.val("义乌体积", round(ywtj, 4));
                recordset.val("ITEM数量2", items2);
                recordset.val("ITEM数量", itemsl);
                recordset.val("保险货物", ywbgpm.join(","));
                recordset.val("海关编码1", hgbm);
                if (
                    recordset.val("出运日期") != "" &&
                    recordset.val("出运日期") != null
                ) {
                    recordset.val("发信识别", "是");
                }
                recordset.val("强制更新", "否");
                let shr1 = recordset.val("收 货 人");
                if (!khmc.includes("BEST PRICE LLC")) {
                    if (shr1 == "") {
                        shr1 = recordset.val("客户名称");
                    }
                }
                let ttr = recordset.val("抬 头 人");
                let ttrdz = recordset.val("抬头人地址");
                let tzr = recordset.val("通 知 人");
                let wftt = recordset.val("我方抬头");
                recordset.val("收 货 人", shr1);
                recordset.val("抬 头 人", ttr);
                recordset.val("抬头人地址", ttrdz);
                recordset.val("通 知 人", tzr);
                recordset.val("我方抬头", wftt);
                recordset.val("工厂品牌", gcpp.join("\r\n"));
                recordset.val("收汇备注", fpbz.join(";"));
                recordset.val("单据品名汇总", djpmyz2.join("\r\n"));
                recordset.val("强制更新", "否");
                recordset.val("PO汇总", POhz.join(";"));

                recordset.val("英文品名汇总", ywpmhz.join("\r\n"));
                recordset.val("数量汇总", slhz.join(";"));
                if (recordset.val("业务人员") !== _.user.username) {
                    if (recordset.val("只读状态") === "是") {
                        sdsb = 1;
                        reject("当前记录不能修改");
                        return;
                    } else {
                        if (recordset.val("提交判断") === "是") {
                            sdsb = 1;
                        } else {
                            sdsb = 0;
                            if (recordset.val("客户编号分") == "") {
                                recordset.val("客户编号分", recordset.val("客户编号"));
                            }
                            if (
                                recordset.val("出运日期") != "" &&
                                recordset.val("出运日期") != null
                            ) {
                                if (
                                    recordset.val("接单日期") == "" ||
                                    recordset.val("接单日期") == "1999-01-01"
                                ) {
                                    sz = 60 + getint(formatdatetime("ss", now));
                                    recordset.val(
                                        "接单日期",
                                        datetimetostr(
                                            strtodatetime(recordset.val("出运日期")) - sz,
                                        ),
                                    );
                                }
                            }
                            if (
                                recordset.val("市场模式抬头") == "" &&
                                recordset.val("市场金额") > 1
                            ) {
                                errors.push("请注意此票有市场金额,请填写市场模式抬头后保存!!");
                                sdsb = 1;
                            }
                            if (recordset.val("保存识别") == "否") {
                                errors.push("请注意此票有错误操作,系统不能保存!!");
                                sdsb = 1;
                            }
                            let wxhtsb = 0;
                            if (!fphm.includes("SFT")) {
                                if (
                                    recordset.val("出运日期") != "" &&
                                    recordset.val("出运日期") != null &&
                                    recordset.val("接单日期") != "" &&
                                    recordset.val("接单日期") != null
                                ) {
                                    if (recordset.val("接单日期") >= recordset.val("出运日期")) {
                                        errors.push(
                                            "请注意出运日期早于接单日期,请在辅助信息里手工选接单日期在保存",
                                        );
                                        sdsb = 1;
                                    }
                                }
                                if (
                                    recordset.val("合同号码") != "" &&
                                    recordset.val("合同号码") != null &&
                                    fphm != "" &&
                                    fphm != null
                                ) {
                                    if (
                                        fphm.includes(recordset.val("合同号码").toUpperCase()) ==
                                        false &&
                                        fphm.includes("CSD-") == false
                                    ) {
                                        wxhtsb = 1;
                                    }
                                }
                            }
                            if (wxhtsb == 1) {
                                sdsb = 1;
                                errors.push(
                                    "请注意合同号码【" +
                                    recordset.val("合同号码").toUpperCase() +
                                    "】错误或合同号码和发票号码【" +
                                    fphm +
                                    "】不符",
                                );
                            } else {
                                bb = 0;
                                iy = 0;
                                sfcy = "否";
                                if (recordset.val("货物状态") == "已出运") {
                                    sfcy = "是";
                                }
                                xyzh = recordset.val("是否信保");
                                if (d.sfdz == 0) {
                                    sb = "是";
                                    if (recordset.val("提交判断") == "是" && sb == "是") {
                                        sdsb = "1";
                                        errors.push("已提交不能再次修改");
                                    } else {
                                        if (recordset.val("制单人员") != "" && d.dzjy == 0) {
                                            if (recordset.val("制单人员") != _.user.username) {
                                                sdsb = 1;
                                                errors.push("制单人员必需是本人或单证人员");
                                            }
                                        } else if (recordset.val("制单人员") == "") {
                                            sdsb = 1;
                                            errors.push("请先填写制单人员后保存");
                                        }
                                        if (
                                            recordset.val("提交判断") == "有" &&
                                            sdsb != "1" &&
                                            sdsb1 != "1"
                                        ) {
                                            recordset.val("提交判断", "是");
                                        }
                                    }
                                } else {
                                    if (!fphm.includes("SFT")) {
                                        if (
                                            recordset.val("实际出运") != "" &&
                                            recordset.val("进港日期") == ""
                                        ) {
                                            errors.push("请输进港日期后在行保存");
                                            reject();
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                        if (sdsb1 == 1) {
                            errors.push("有净重大于毛重产品，请检查后保存");
                        }
                        if (sdsb == 1 || sdsb1 == 1) {
                            errors.push("当前记录不能修改");
                            _.ui.message_box({
                                title: "异常提示",
                                message: _.vue.h(
                                    "pre", {
                                        style: "font-weight:800;line-height:20px",
                                    },
                                    errors.join("*\r\n"),
                                ),
                            });
                            // reject();
                            // return;
                        } else {
                            if (
                                !(
                                    sb == 1 &&
                                    (kpgc == 1 || kpsb == 1) &&
                                    recordset.val("制单人员") == _.user.username
                                )
                            ) {
                                if (recordset.val("web判断1") == "") {
                                    recordset.val("web判断1", "是");
                                }
                            }
                        }
                    }
                } else {
                    if (recordset.val("web判断1") == "") {
                        recordset.val("web判断1", "是");
                    }
                }

                // for (let r of v) {
                //     if ((r.cywyzd != '' && r.cywyzd != null) && (cydh != '' && cydh != null) && (fphm != '' && fphm != null) && cydh != fphm) {
                //         if (r.fpsfytq != '是') {
                //             flag = true;
                //             r.fpsfytq = '是';
                //             t.push_modi_rid(r.rid);
                //         }
                //     }
                // }
                // if (flag) {
                // t.sync_operate_data()
                // t.modified = true;
                // }
                if (errors.length > 0) {
                    _.ui.message_box({
                        title: "异常提示",
                        message: _.vue.h(
                            "pre", {
                                style: "font-weight:800;line-height:20px",
                            },
                            errors.join("*\r\n"),
                        ),
                    });
                }
                resolve();
            })
            .catch((err) => {
                _.ui.message.error(err.msg);
                console.log(err);
                reject();
            });
    });
};
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, wait_ship_before_save, "预出运单");

const wait_ship_after_save = (evt_id, recordset) => {
    _.http
        .post("/api/saier/shipment/after/save", {
            rid: recordset.val("rid"),
            module: recordset.module.name,
            main: recordset.tables["预出运单"].view_data,
        })
        .then((res) => {})
        .catch((res) => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
};
_.evts.on(_.evtids.RECORD_AFTER_SAVE, wait_ship_after_save, "预出运单");