// 编辑界面字段change后执行
const incomes_field_change = async (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record;
    let m = module.name;
    if (field.full_name == m + ".详细用途.发票号码") {
        if (value != "") {
            _.http
                .post("/api/saier/incomes/fphm/change", {
                    rid: recordset.val("rid"),
                    row: row,
                })
                .then((res) => {
                    let d = res.data;
                    let yshje_rmb = d.yshje_rmb || 0;
                    let yshje_usd = d.yshje_usd || 0;
                    let hj = d.hj || 0;
                    let chyrq = null;
                    let djrq = null;
                    if (m == '客户收汇') {
                        djrq = recordset.val("收汇日期");
                    } else if (m == '定金调整') {
                        djrq = recordset.value("详细用途.收汇日期", row);
                    }
                    let l = d.line || {};
                    let htjer = 0;
                    let htjem = 0;
                    let chyrq1 = null;
                    let hbdm = recordset.value("详细用途.货币代码", row).toUpperCase() || "";
                    let fphm = recordset.value("详细用途.发票号码", row) || "";
                    if (l) {
                        if (l.htjer) {
                            htjer = l.htjer;
                        } else if (l.htje) {
                            htjer = l.htje;
                        }
                        if (l.htjem) {
                            htjem = l.htjem;
                        } else if (l.htje) {
                            htjem = l.htje;
                        }
                        if (
                            recordset.value("详细用途.货币代码", row) == "" &&
                            module != "定金调整"
                        ) {
                            recordset.value(
                                "详细用途.货币代码",
                                row,
                                recordset.value("货币代码"),
                                row,
                            );
                        }
                        if (l.ysfp && l.ysfp == "" && module != "定金调整") {
                            recordset.value("详细用途.核算发票", l.ywfp, row);
                        }
                        recordset.val("详细用途.RMB客户", l.RMBkh, row);
                        recordset.val("详细用途.业务人员", l.ywry, row);
                        recordset.val("详细用途.业务部门", l.ywbm, row);
                        if (l.sjcy1 != "" && l.sjcy1 != null) {
                            recordset.val("详细用途.出运日期", l.sjcy1, row);
                        } else if (l.chyrq != "" && l.chyrq != null) {
                            recordset.val("详细用途.出运日期", l.chyrq, row);
                        }
                        chyrq = recordset.value("详细用途.出运日期", row);
                        recordset.val("详细用途.货值合计", l.htje || 0 - l.myjje || 0, row);
                        if (l.khmc && l.khmc != "" && module != "定金调整") {
                            recordset.val("详细用途.客户名称", l.khmc, row);
                            recordset.val("客户名称", l.khmc);
                        }
                        recordset.val("详细用途.明佣合计", l.myjje || 0, row);
                        recordset.val("详细用途.暗佣合计", l.ayjje || 0, row);
                        recordset.val("详细用途.佣金金额", l.yjje || 0, row);
                        if (hbdm != "") {
                            if (hbdm.indexOf("RMB") != -1) {
                                recordset.val("详细用途.货值合计￥", htjer, row);
                                recordset.val("详细用途.货值合计$", htjem || 0, row);
                            } else {
                                recordset.val("详细用途.货值合计￥", htjer || 0, row);
                                recordset.val("详细用途.货值合计$", htjem || 0, row);
                            }
                        } else {
                            if (l.RMBkh == "是") {
                                recordset.val("详细用途.货值合计￥", htjer || 0, row);
                                recordset.val("详细用途.货值合计$", htjem || 0, row);
                            } else {
                                recordset.val("详细用途.货值合计￥", htjer || 0, row);
                                recordset.val("详细用途.货值合计$", htjem || 0, row);
                            }
                        }
                    } else {
                        recordset.val("详细用途.业务人员", "", row);
                        recordset.val("详细用途.业务部门", "", row);
                        recordset.val("详细用途.出运日期", "", row);
                        recordset.val("详细用途.RMB客户", "", row);
                        recordset.val("详细用途.客户名称", "", row);
                        recordset.val("详细用途.明佣合计", 0, row);
                        recordset.val("详细用途.暗佣合计", 0, row);
                        recordset.val("详细用途.佣金金额", 0, row);
                        recordset.val("详细用途.货值合计", 0, row);
                        recordset.val("详细用途.货值合计￥", 0, row);
                        recordset.val("详细用途.货值合计", 0, row);
                        recordset.val("详细用途.货值合计$", 0, row);
                    }
                    if (recordset.value("详细用途.使用外汇", row) > 0) {
                        let hbdm = recordset.value("详细用途.货币代码", row) || "";
                        recordset.val(
                            "详细用途.结算外汇",
                            recordset.value("详细用途.使用外汇", row),
                            row,
                        );
                        if (recordset.value("详细用途.RMB客户", row) == "是") {
                            if (hbdm.toUpperCase().indexOf("RMB") != -1) {
                                recordset.val(
                                    "详细用途.结算外汇",
                                    recordset.value("详细用途.使用外汇", row),
                                    row,
                                );
                            } else {
                                recordset.val(
                                    "详细用途.结算外汇",
                                    recordset.value("详细用途.使用外汇", row) *
                                    recordset.value("详细用途.银行汇率", row),
                                    row,
                                );
                            }
                        } else {
                            if (hbdm.toUpperCase().indexOf("RMB") > 0) {
                                if (recordset.value("详细用途.银行汇率", row)) {
                                    recordset.val(
                                        "详细用途.结算外汇",
                                        recordset.value("详细用途.使用外汇", row) /
                                        recordset.value("详细用途.银行汇率", row),
                                        row,
                                    );
                                }
                            }
                        }
                        let htje = recordset.value("详细用途.货值合计", row) || 0;
                        let sywh = recordset.value("详细用途.使用外汇", row) || 0;
                        recordset.val("详细用途.原收汇金额￥", yshje_rmb, row);
                        recordset.val("详细用途.原收汇金额$", yshje_usd, row);
                        if (hbdm.toUpperCase().indexOf("RMB") != -1) {
                            recordset.val(
                                "详细用途.收汇金额Z￥",
                                sywh + recordset.value("详细用途.原收汇金额￥", row),
                                row,
                            );
                        } else {
                            recordset.val(
                                "详细用途.收汇金额Z$",
                                sywh + recordset.value("详细用途.原收汇金额$", row),
                                row,
                            );
                        }
                        recordset.val(
                            "详细用途.未收金额",
                            htje - hj - recordset.value("详细用途.结算外汇", row),
                            row,
                        );
                        if (chyrq == "" || chyrq == null) {
                            chyrq1 = "3000-01-01";
                        } else {
                            chyrq1 = chyrq;
                        }
                        if (
                            recordset.value("详细用途.是否定金", row) == "" &&
                            m == "客户收汇"
                        ) {
                            if (
                                recordset.value("详细用途.未收金额", row) < -10 &&
                                (chyrq1 > djrq || chyrq == "" || chyrq == null)
                            ) {
                                recordset.val("详细用途.是否定金", "是", row);
                            } else {
                                recordset.val("详细用途.是否定金", "否", row);
                            }
                        }
                        if (chyrq != "" && chyrq != null && djrq != "" && djrq != null) {
                            recordset.val(
                                "详细用途.收汇天数",
                                _getDistanceDays(djrq, chyrq),
                                row,
                            );
                        }
                        recordset.val(
                            "详细用途.合计收汇",
                            hj + recordset.value("详细用途.结算外汇", row),
                            row,
                        );
                    } else {
                        recordset.val(
                            "详细用途.结算外汇",
                            recordset.value("详细用途.使用外汇", row),
                            row,
                        );
                    }
                    recordset.val("详细用途.发票号码1", fphm, row);
                    if (m == "客户收汇") {
                        recordset.val("认领业务", _.user.username, row);
                    }
                    recordset.value("详细用途.使用外汇1", 0, row);
                })
                .catch((err) => {
                    _.ui.message.error("请求失败: " + (err.msg || err));
                    console.error("请求失败: ", err);
                    recordset.val("详细用途.发票号码", "");
                });
        }
    }
    if (
        field.full_name == m + ".收汇日期" ||
        field.full_name == m + ".提前收汇"
    ) {
        if (
            recordset.val("收汇日期") != "" &&
            recordset.val("收汇日期") != null &&
            recordset.val("提前收汇") == "提前收汇"
        ) {
            recordset.val("合同收汇日期", recordset.val("收汇日期"));
        }
    }
    if (field.full_name == m + ".客户名称") {
        if (recordset.val("对方户名") == "" || recordset.val("对方户名") == null) {
            recordset.val("对方户名", recordset.val("客户名称"));
        }
    }
    if (
        field.full_name == m + ".货币代码" ||
        field.full_name == m + ".银行汇率"
    ) {
        if (
            recordset.val("货币代码") != "" &&
            recordset.val("银行汇率") != null &&
            recordset.val("银行汇率") != "" &&
            recordset.val("货币代码") != null &&
            recordset.val("银行汇率") != 0
        ) {
            let t = recordset.tables["详细用途"];
            let d = t.view_data;
            for (let r of d) {
                recordset.val("详细用途.货币代码", recordset.val("货币代码"), r);
                recordset.val("详细用途.银行汇率", recordset.val("银行汇率"), r);
                recordset.val(
                    "详细用途.使用外汇识别",
                    new Date().format("yyyy-MM-dd hh:mm:ss"),
                    r,
                );
            }
            if (
                recordset.val("货币代码") != "USD$" &&
                recordset.val("货币代码") != "USD" &&
                recordset.val("货币代码") != "RMB"
            ) {
                _.http
                    .post("/api/saier/incomes/hbdm/change", {})
                    .then((res) => {
                        let d = res.data;
                        if (d && d != 0) {
                            recordset.val(
                                "转美元汇率",
                                round(recordset.val("银行汇率") / d, 6),
                            );
                        } else {
                            recordset.val("转美元汇率", 1);
                        }
                    })
                    .catch((err) => {
                        _.ui.message.error("请求失败: " + (err.msg || err));
                        console.error("请求失败: ", err);
                    });
            } else {
                recordset.val("转美元汇率", 1);
            }
        } else {
            recordset.val("转美元汇率", 1);
        }
    }
    if (
        (field.full_name == m + ".详细用途.使用日期" ||
        field.full_name == m + ".详细用途.使用外汇") && m == "客户收汇"
    ) {
        if (
            recordset.value("详细用途.使用日期", row) != "" &&
            recordset.value("详细用途.使用日期", row) != null
        ) {
            recordset.val(
                "详细用途.起始年",
                recordset.value("详细用途.使用日期", row).substring(0, 4),
                row,
            );
            recordset.val(
                "详细用途.起始月",
                recordset.value("详细用途.使用日期", row).substring(5, 7),
                row,
            );
        } else {
            recordset.val("详细用途.起始年", "", row);
            recordset.val("详细用途.起始月", "", row);
        }
    }
    if (
        (field.full_name == m + ".详细用途.使用外汇识别" ||
        field.full_name == m + ".详细用途.使用外汇") && m == '客户收汇'
    ) {
        if (recordset.val('货币代码') != '') {
            recordset.val('详细用途.货币代码', recordset.val('货币代码'), row);
            recordset.val('详细用途.银行汇率', recordset.val('银行汇率'), row);
        }
        recordset.val('详细用途.结算外汇', recordset.value('详细用途.使用外汇', row), row);
        if (recordset.value('详细用途.RMB客户', row) == '是') {
            if (recordset.value('货币代码', row).indexOf('RMB') != -1) {
                recordset.val('详细用途.结算外汇', recordset.value('详细用途.使用外汇', row), row);
            } else {
                recordset.val('详细用途.结算外汇', recordset.value('详细用途.使用外汇', row) * Number(recordset.val('银行汇率')), row);
            }
        } else {
            if (recordset.value('货币代码', row).indexOf('RMB') != -1) {
                if (Number(recordset.val('银行汇率')) > 0) {
                    recordset.val('详细用途.结算外汇', recordset.value('详细用途.使用外汇', row) / Number(recordset.val('银行汇率')), row);
                }
            } else {
                recordset.val('详细用途.结算外汇', recordset.value('详细用途.使用外汇', row), row);
            }
        }
    }
    if (field.full_name == m + ".详细用途.外销合同" && m == "客户收汇") {
        if (
            recordset.value("详细用途.外销合同", row) != "" &&
            recordset.value("详细用途.外销合同", row) != null
        ) {
            recordset.val(
                "详细用途.发票号码",
                recordset.value("详细用途.外销合同", row),
                row,
            );
        }
    }
    if (field.full_name == m + ".认领提交" && m == "客户收汇") {
        if (recordset.value("认领提交") == "是") {
            recordset.val('认领业务', _.user.username);
            if (recordset.val('认领业务') == '') {
                recordset.val('经手人名', _.user.username);
            }
            recordset.val('通知业务认领', '否');
            recordset.val('uid', _.user.rid);
            recordset.modlue.field_by_full_name('客户名称').disabled = true;
            recordset.modlue.field_by_full_name('客户编号').disabled = true;
            recordset.modlue.field_by_full_name('代理名称').disabled = true;
            recordset.modlue.field_by_full_name('合同号码').disabled = true;
            recordset.modlue.field_by_full_name('贸易国别').disabled = true;
            recordset.modlue.field_by_full_name('出运日期').disabled = true;
            recordset.modlue.field_by_full_name('经手人名').disabled = true;
            recordset.modlue.field_by_full_name('业务部门').disabled = true;
            recordset.modlue.field_by_full_name('合同收汇日期').disabled = true;
            recordset.modlue.field_by_full_name('认领提交').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.发票号码').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.外销合同').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.使用外汇').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.使用公司').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.使用备注').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.出运日期').disabled = true;
            recordset.modlue.field_by_full_name('详细用途.是否结清').disabled = true;
        }
    }
    if (field.full_name == m + ".详细用途.是否结清" && value != "" && value != null && m == "客户收汇") {
        let tjje = 200
        if (recordset.value("货币代码") != "RMB" && recordset.value("货币代码") != "￥" && recordset.value("货币代码") != "RMB￥") {
            tjje = 100
        }

        _.http.post("/api/saier/incomes/child/sfjq/check", {
            row: recordset.tables["详细用途"].current_data,
            skbz: recordset.value("货币代码"),
            tjje: tjje
        }).then(res => {
            if (res.code == 1) {
                _.http.post("/api/saier/incomes/child/sfjq/change", {
                    row: recordset.tables["详细用途"].current_data,
                    skbz: recordset.value("货币代码"),
                    rid: recordset.value("rid"),
                    tjje: tjje
                }).then(res => {
                    let d = res.data;
                }).catch(err => {
                    recordset.val("详细用途.是否结清", "否", row);
                    _.ui.message.error("请求失败: " + (err.msg || err));
                    console.error("请求失败: ", err);
                });
            } else if (res.code == 2) {
                _.ui.confirm("未收金额大于" + tjje + "或小于-100,是否确认结清？").then(() => {
                    _.http.post("/api/saier/incomes/child/sfjq/change", {
                        row: recordset.tables["详细用途"].current_data,
                        skbz: recordset.value("货币代码"),
                        rid: recordset.value("rid"),
                        tjje: tjje
                    }).then(res => {
                        let d = res.data;
                    }).catch(err => {
                        recordset.val("详细用途.是否结清", "否", row);
                        _.ui.message.error("请求失败: " + (err.msg || err));
                        console.error("请求失败: ", err);
                    });
                }).catch(() => {
                    recordset.val("详细用途.是否结清", "否", row);
                });
            }

        }).catch(err => {
            recordset.val("详细用途.是否结清", "否", row);
            _.ui.message.error("请求失败: " + (err.msg || err));
            console.error("请求失败: ", err);
        });
    }
    if (field.full_name == m + ".详细用途.发票结清" && m == "客户收汇") {
        _.http.post("/api/saier/incomes/fpjq/change", {
            main: recordset.tables["客户收汇"].view_data,
            row: row,
        }).then((res) => {
            if (recordset.value("详细用途.发票结清", row) == '是') {
                recordset.val('详细用途.结清财务', _.user.username, row);
            }
            if (recordset.value('详细用途.wyzd', row) == '') {
                recordset.val('详细用途.wyzd', recordset.value('详细用途.rid', row));
            }
            if (recordset.value('详细用途.发票号码', row) != '' && recordset.value("详细用途.发票结清", row) == '是' && recordset.value("详细用途.是否结清", row) != '是') {
                recordset.val('详细用途.是否结清', '是', row);
            }

            let sywh = recordset.value('详细用途.使用外汇', row)
            if (recordset.value('详细用途.货币代码', row) == 'RMB' || recordset.value('详细用途.货币代码', row) == 'RMB￥') {
                recordset.val('详细用途.收汇金额Z￥', sywh + recordset.value('详细用途.原收汇金额￥', row), row)
            } else {
                recordset.val('详细用途.收汇金额Z$', sywh + recordset.value('详细用途.原收汇金额$', row), row)
            }
        }).catch(res => {
            console.log(res)
            _.ui.message.error(res.msg)
            recordset.val('详细用途.发票结清', '', row)
        })
    }
};
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, incomes_field_change, "客户收汇");
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, incomes_field_change, "定金调整");

// 编辑界面记录保存前执行
const incomes_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let khmc = recordset.val("客户名称");
        if (khmc != "" && khmc != null && khmc.indexOf("BEST PRICE") != -1) {
            if (recordset.val("对方户名") == "" || recordset.val("对方户名") == null || recordset.val("对方开户行名") == "" || recordset.val("对方开户行名") == null || recordset.val("对方账号") == "" || recordset.val("对方账号") == null) {
                _.ui.message.error("请注意非BP客人在银行信息中对方户名、对方开户行名、对方账号为必填");
                reject();
                return;
            }
        }
        if (recordset.val("银行合计$") > recordset.val("银行费用$")) {
            _.ui.message.error("银行费用$分配出错!请重新核算");
            reject();
            return;
        }
        if (recordset.val("剩余外汇") < 0) {
            _.ui.message.error("剩余外汇金额为负!请重新核算");
            reject();
            return;
        } else if (recordset.val("剩余外汇") == 0) {
            recordset.val("是否结清", "是");
        } else {
            recordset.val("是否结清", "否");
        }
        if (recordset.tables["详细用途"].view_data.length == 0) {
            recordset.tables["详细用途"].append().then(r => {
                if (recordset.val('货币代码') != 'RMB' && recordset.val('货币代码') != '￥' && recordset.val('货币代码') != 'RMB￥') {
                    recordset.val('详细用途.使用外汇', recordset.val('收汇净额'));
                } else {
                    recordset.val('详细用途.使用外汇', recordset.val('收汇净额'));
                }
                if (recordset.val('收汇日期') != '' && recordset.val('收汇日期') != null) {
                    recordset.val('详细用途.起始月', recordset.val('收汇日期').substring(5, 7));
                    recordset.val('详细用途.起始年', recordset.val('收汇日期').substring(1, 5));
                }
                recordset.val('详细用途.收款银行', recordset.val('收汇银行'));
                recordset.val('详细用途.是否定金', '否');
                recordset.val('详细用途.是否结清', '否');
                recordset.val('详细用途.发票号码', recordset.val('合同号码'));
                recordset.val('详细用途.外销合同', recordset.val('合同号码'));
                recordset.val('详细用途.发票号码1', recordset.val('合同号码'));
                recordset.val('详细用途.银行汇率', recordset.val('银行汇率'));
            })
        } else {
            let t = recordset.tables["详细用途"];
            let d = t.view_data;
            for (let r of d) {
                recordset.val('详细用途.使用外汇1', recordset.val('详细用途.使用外汇'), r);
                recordset.val('详细用途.银行汇率', recordset.val('银行汇率'), r);
                recordset.val('详细用途.客户名称', recordset.val('客户名称'), r);
            }
        }
        _.http
            .post("/api/saier/incomes/save/before", {
                rid: recordset.val("rid"),
                module: recordset.module_name,
                lines: recordset.tables["详细用途"].view_data,
                ssbm: recordset.value("所属部门"),
            })
            .then((res) => {
                let d = res.data;
                let ssbm = d.ssbm;
                let shmxts = d.shmxts || 0;
                let js_data = d.js_data || {};
                if (
                    (recordset.value("所属部门") == "" ||
                        recordset.value("所属部门") == null) &&
                    recordset.module_name != "定金调整"
                ) {
                    recordset.value("所属部门", ssbm);
                }
                if (
                    recordset.value("唯一字段") == "" &&
                    recordset.module_name != "定金调整"
                ) {
                    recordset.value("唯一字段", recordset.value("rid"));
                }
                if (
                    recordset.val("收汇日期") != "" &&
                    recordset.val("收汇日期") != null &&
                    recordset.val("提前收汇") == "提前收汇"
                ) {
                    recordset.val("合同收汇日期", _addDaysDate(recordset.val("收汇日期") + shmxts));
                }

                let t = recordset.tables["详细用途"];
                let v = t.view_data;
                let djrq = recordset.value("收汇日期");
                for (let r of v) {
                    if (js_data[r.rid]) {
                        let djr = js_data[r.rid].djr || 0;
                        let djm = js_data[r.rid].djm || 0;
                        let hj = js_data[r.rid].hj || 0;
                        let yshje_rmb = js_data[r.rid].yshje_rmb || 0;
                        let yshje_usd = js_data[r.rid].yshje_usd || 0;
                        let htje = recordset.value('详细用途.货值合计', r);
                        let sywh = recordset.value('详细用途.使用外汇', r);
                        let sywh1 = recordset.value('详细用途.使用外汇1', r);
                        let chyrq = recordset.value('详细用途.出运日期', r);

                        recordset.val('详细用途.原收汇金额￥', yshje_rmb, r);
                        recordset.val('详细用途.原收汇金额$', yshje_usd, r);

                        if (recordset.value('详细用途.货币代码', r) == 'RMB' || recordset.value('详细用途.货币代码', r) == 'RMB￥') {
                            recordset.val('详细用途.收汇金额Z￥', sywh + recordset.value('详细用途.原收汇金额￥', r), r);
                        } else {
                            recordset.val('详细用途.收汇金额Z$', sywh + recordset.value('详细用途.原收汇金额$', r), r);
                        }
                        let chyrq1 = null;
                        recordset.val('详细用途.未收金额', htje - hj - sywh + sywh1, r);
                        if (chyrq == '' || chyrq == null) {
                            chyrq1 = '3000-01-01';
                        } else {
                            chyrq1 = recordset.value('详细用途.出运日期', r);
                        }

                        if (recordset.value('详细用途.是否定金', r) == '') {
                            if (recordset.value('详细用途.未收金额', r) < -10 && ((chyrq1 > djrq || chyrq == '' || chyrq == null))) {
                                recordset.val('详细用途.是否定金', '是', r);
                            } else {
                                recordset.val('详细用途.是否定金', '否', r);
                            }
                        }
                        if (recordset.value('详细用途.是否定金', r) == '是') {
                            djr = djr + recordset.value('详细用途.货值合计￥', r);
                            djm = djm + recordset.value('详细用途.货值合计$', r);
                        }
                        if (chyrq != '' && chyrq != null && djrq != '' && djrq != null) {
                            recordset.val('详细用途.收汇天数', _getDistanceDays(chyrq, djrq), r);
                        }
                        recordset.val('详细用途.合计收汇', hj + sywh - sywh1, r);
                        if (recordset.value('详细用途.业务人员', r) == '') {
                            recordset.val('详细用途.业务人员', _.user.username, r);
                            recordset.val('详细用途.ywpath', _.user.org_path, r);
                        }
                    }
                }
                resolve();
            })
            .catch((err) => {
                _.ui.message.error("请求失败: " + (err.msg || err));
                console.error("请求失败: ", err);
                reject();
            });
    });
};
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, incomes_before_save, "客户收汇");
// _.evts.on(_.evtids.RECORD_BEFORE_SAVE, incomes_before_save, "定金调整");

function incomes_table_new_after(evt_id, table, recordset) {
    if (table.group == "详细用途") {
        recordset.val("详细用途.货币代码", recordset.val("货币代码"));
        recordset.val("详细用途.银行汇率", recordset.val("银行汇率"));
        recordset.val("详细用途.唯一字段", recordset.val("详细用途.rid"));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], incomes_table_new_after, "客户收汇");


// 子表记录scroll事件
const incomes_record_table_scroll = (evt_id, table, recordset) => {
    // let module = recordset.module.name
    let rids = recordset.tables['详细用途'].new_rids
    if (table.group == '详细用途') {
        if (rids.indexOf(recordset.val('详细用途.rid')) != -1) {
            return
        }
        if (rids.indexOf(recordset.val('详细用途.rid')) == -1 && recordset.val('详细用途.发票结清') == '是' && recordset.val('详细用途.结清财务') != _.user.username && recordset.val('详细用途.结清财务') != '') {
            for (let field of recordset.module.groups[1].fields) {
                recordset.module.field_by_full_name('客户收汇.详细用途.' + field.name).disabled = true
            }
        } else {
            for (let field of _.model.get_module_by_name('客户收汇').group_by_name('详细用途').fields) {
                if (field.disabled) {
                    continue
                }
                recordset.module.field_by_full_name('客户收汇.详细用途.' + field.name).disabled = false
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, incomes_record_table_scroll, '客户收汇')

const incomes_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '详细用途') {
        form.toolbar.add([{
            "name": 'fphm_update_btn',
            "caption": '更改发票号',
            "icon": 'any-server-update',
        }]);
    }
    if (form.group.value.name == '收款合并') {
        form.toolbar.add([{
            "name": 'incomes_merge_btn',
            "caption": '合并收汇',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], incomes_EditorChildShow, '客户收汇')


const income_EditorFormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        name: 'incomes_import_btn',
        caption: '收汇导入',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'incomes_notice_btn',
        caption: '批量认领通知',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'incomes_data_export_btn',
        caption: '收汇资料导出',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'incomes_date_export_btn',
        caption: '收汇周期导出',
        icon: 'any-server-update',
        divided: true,
    })
    if (btns.length == 0) {
        return
    }
    form.toolbar.add([{
        name: 'export_btn',
        caption: '扩展',
        icon: 'any-server-update',
        btns: btns,
    }, ])
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW], income_EditorFormShow, '客户收汇')


const incomes_form_BtnClick = async (evt_id, btn, form) => {
    let recordset = form.recordset;
    if (btn.name == 'fphm_update_btn') {
        if (recordset.val('详细用途.业务人员') != '' && recordset.val('详细用途.业务人员') != _.user.username) {
            _.ui.message.error('只有当前记录的业务人员才能更改发票号');
            return;
        }
        _.ui.show_input_dialog('请输入更改发票号:', '').then((value) => {
            if (value == '' || value == null) {
                _.ui.message.error('发票号不能为空');
                return;
            }
            recordset.val('详细用途.发票号码', value);
        });
    };
    if (btn.name == 'incomes_merge_btn') {
        merge_incomes_data(recordset);
    };

    if (btn.name == 'incomes_notice_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/incomes/notice/batch', {
            rids: rids,
        }).then(res => {
            _.ui.message.success('通知成功')
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err))
            console.error('请求失败: ', err)
        })
    }
    if (btn.name == 'incomes_data_export_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/incomes/data/export', {
            rids: rids,
        }).then(res => {
            _.http.download("/api/tmp/file/get", {
                    file: res.data.file_path
                },
                res.data.file_name
            );
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err))
            console.error('请求失败: ', err)
        })
    }
    if (btn.name == 'incomes_date_export_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/incomes/date/export', {
            rids: rids,
        }).then(res => {
            _.http.download("/api/tmp/file/get", {
                    file: res.data.file_path
                },
                res.data.file_name
            );
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err))
            console.error('请求失败: ', err)
        })
    }
    if (btn.name == 'incomes_import_btn') {
        // if (_.user.org_path.indexOf('财务')==-1){
        //     _.ui.message.error('权限校验失败,只有财务岗位才能执行此操作')
        //     return
        // }
        await _.ui.show_upload_dialog({
            title: '导入客户收汇',
            url: '/api/incomes/excel/import',
            accept: '.xlsx',
            auto_close: true,
            success_msg: '导入成功',
            error_msg: '导入失败'
        }, (res) => {
            if (res.data) {
                let d = res.data
                console.log(d)
                if (d.duplicate_file_name != null && d.duplicate_file_name != '') {
                    _.ui.message.error(_l('请注意有重复工厂记录，正在下载重复记录文件'))
                    _.http.download("/api/tmp/file/get", {
                            file: d.duplicate_file_name
                        },
                        d.duplicate_file_name
                    );
                }
            } else {
                _.ui.error_message(_l('导入失败'))
            }
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], incomes_form_BtnClick, '客户收汇')



const merge_incomes_data = (recordset) => {
    const companyMap = new Map();
    const t = recordset.tables['详细用途'];
    const d = t.view_data;
    // 收集数据
    for (let r of d) {
        const company = r.sygs || '未知公司';
        if (!companyMap.has(company)) {
            companyMap.set(company, {
                sydje: 0,
                syqje: 0,
                yhfy: 0
            });
        }
        const data = companyMap.get(company);
        data.sydje += r.sydje || 0;
        data.syqje += r.syqje || 0;
        data.yhfy += r.yhfy || 0;
    }
    let m = recordset.tables['收款合并'];
    let new_data = [];
    m.clear(); // 清空原有数据
    for (const [company, data] of companyMap) {
        let r = {}
        r.rid = _.utils.guid();
        r.uid = _.user.rid;
        r.ctime = new Date().format('yyyy-MM-dd hh:mm:ss');
        r.pid = recordset.val('rid');
        r.sydje = round(data.sydje, 3);
        r.syqje = round(data.syqje, 3);
        r.yhfy = round(data.yhfy, 3);
        r.sygs = company;
        new_data.push(r);
        m.push_new_rid(r.rid);
    }
    m.view_data = new_data;
    m.sync_operate_data()
    m.modified = true;
}

// 编辑界面数据加载以后执行
const incomes_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    _.http.post('/api/saier/incomes/load/check', {
        rid: recordset.val('rid')
    }).then(res => {
        let position = res.data.position;
        if (recordset.val('用途条数') == 9999) {
            recordset.val('用途条数', 0);
        }
        recordset.module.group_by_name('查看人员').visible = false;
        recordset.module.field_by_full_name(m + '.收汇单号').disabled = true;
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
        recordset.module.field_by_full_name(m + '.客户编号').disabled = true;
        recordset.module.field_by_full_name(m + '.代理名称').disabled = true;
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.收汇方式').disabled = true;
        recordset.module.field_by_full_name(m + '.收汇银行').disabled = true;
        recordset.module.field_by_full_name(m + '.收汇日期').disabled = true;
        recordset.module.field_by_full_name(m + '.收汇净额').disabled = true;
        recordset.module.field_by_full_name(m + '.已用外汇').disabled = true;
        recordset.module.field_by_full_name(m + '.银行收汇$').disabled = true;
        recordset.module.field_by_full_name(m + '.剩余外汇').disabled = true;
        recordset.module.field_by_full_name(m + '.收汇金额').disabled = true;
        recordset.module.field_by_full_name(m + '.已用金额').disabled = true;
        recordset.module.field_by_full_name(m + '.银行汇率').disabled = true;
        recordset.module.field_by_full_name(m + '.银行费用$').disabled = true;
        recordset.module.field_by_full_name(m + '.剩余金额').disabled = true;
        recordset.module.field_by_full_name(m + '.合同号码').disabled = true;
        recordset.module.field_by_full_name(m + '.出运日期').disabled = true;
        recordset.module.field_by_full_name(m + '.经手人名').disabled = true;
        recordset.module.field_by_full_name(m + '.业务部门').disabled = true;
        recordset.module.field_by_full_name(m + '.合同收汇日期').disabled = true;
        recordset.module.field_by_full_name(m + '.是否结清').disabled = true;
        recordset.module.field_by_full_name(m + '.更换财务').disabled = true;
        recordset.module.field_by_full_name(m + '.使用备注').disabled = true;
        recordset.module.field_by_full_name(m + '.提前收汇').disabled = true;
        recordset.module.field_by_full_name(m + '.认领提交').disabled = true;
        recordset.module.field_by_full_name(m + '.贸易国别').disabled = true;
        recordset.module.field_by_full_name(m + '.通知业务认领').disabled = true;
        recordset.module.field_by_full_name(m + '.备注说明').disabled = true;
        recordset.module.field_by_full_name(m + '.对方户名').disabled = true;
        recordset.module.field_by_full_name(m + '.对方开户行名').disabled = true;
        recordset.module.field_by_full_name(m + '.对方账号').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.发票号码').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.外销合同').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.使用外汇').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.出运日期').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.收汇天数').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.货值合计').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.未收金额').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.银行汇率').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.使用日期').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.使用金额￥').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.收款银行').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.银行费用$').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.银行合计').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.业务人员').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.业务部门').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.使用公司').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.使用备注').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.是否结清').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.是否定金').disabled = true;
        recordset.module.field_by_full_name(m + '.详细用途.发票结清').disabled = true;
        recordset.module.field_by_full_name(m + '.收款合并.使用外汇').disabled = true;
        recordset.module.field_by_full_name(m + '.收款合并.使用金额').disabled = true;
        recordset.module.field_by_full_name(m + '.收款合并.使用公司').disabled = true;
        recordset.module.field_by_full_name(m + '.收款合并.银行费用$').disabled = true;
        recordset.module.field_by_full_name(m + '.查看人员.查看人员').disabled = true;
        recordset.module.field_by_full_name(m + '.查看人员.上级查看').disabled = true;
        recordset.module.field_by_full_name(m + '.查看人员.登记人员').disabled = true;

        if (position.indexOf('财务') != -1) {
            recordset.module.group_by_name('查看人员').visible = true;
            recordset.module.field_by_full_name(m + '.收汇单号').disabled = false;
            recordset.module.field_by_full_name(m + '.客户名称').disabled = false;
            recordset.module.field_by_full_name(m + '.客户编号').disabled = false;
            recordset.module.field_by_full_name(m + '.代理名称').disabled = false;
            recordset.module.field_by_full_name(m + '.货币代码').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇方式').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇银行').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇日期').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇净额').disabled = false;
            recordset.module.field_by_full_name(m + '.已用外汇').disabled = false;
            recordset.module.field_by_full_name(m + '.贸易国别').disabled = false;
            recordset.module.field_by_full_name(m + '.银行收汇$').disabled = false;
            recordset.module.field_by_full_name(m + '.剩余外汇').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇金额').disabled = false;
            recordset.module.field_by_full_name(m + '.已用金额').disabled = false;
            recordset.module.field_by_full_name(m + '.银行汇率').disabled = false;
            recordset.module.field_by_full_name(m + '.银行费用$').disabled = false;
            recordset.module.field_by_full_name(m + '.剩余金额').disabled = false;
            recordset.module.field_by_full_name(m + '.合同号码').disabled = false;
            recordset.module.field_by_full_name(m + '.出运日期').disabled = false;
            recordset.module.field_by_full_name(m + '.经手人名').disabled = false;
            recordset.module.field_by_full_name(m + '.业务部门').disabled = false;
            recordset.module.field_by_full_name(m + '.合同收汇日期').disabled = false;
            recordset.module.field_by_full_name(m + '.是否结清').disabled = false;
            recordset.module.field_by_full_name(m + '.更换财务').disabled = false;
            recordset.module.field_by_full_name(m + '.使用备注').disabled = false;
            recordset.module.field_by_full_name(m + '.提前收汇').disabled = false;
            recordset.module.field_by_full_name(m + '.通知业务认领').disabled = false;
            recordset.module.field_by_full_name(m + '.备注说明').disabled = false;
            recordset.module.field_by_full_name(m + '.对方户名').disabled = false;
            recordset.module.field_by_full_name(m + '.对方开户行名').disabled = false;
            recordset.module.field_by_full_name(m + '.对方账号').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.发票号码').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.外销合同').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.使用外汇').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.出运日期').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.收汇天数').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.货值合计').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.未收金额').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.货币代码').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.银行汇率').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.使用日期').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.使用金额￥').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.收款银行').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.银行费用$').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.银行合计').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.业务人员').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.业务部门').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.使用公司').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.使用备注').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.是否定金').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.是否结清').disabled = false;
            recordset.module.field_by_full_name(m + '.详细用途.发票结清').disabled = false;
            recordset.module.field_by_full_name(m + '.收款合并.使用外汇').disabled = false;
            recordset.module.field_by_full_name(m + '.收款合并.使用金额').disabled = false;
            recordset.module.field_by_full_name(m + '.收款合并.使用公司').disabled = false;
            recordset.module.field_by_full_name(m + '.收款合并.银行费用$').disabled = false;
        } else {
            if (recordset.val('通知业务认领') == '是') {
                recordset.module.field_by_full_name(m + '.客户名称').disabled = false;
                recordset.module.field_by_full_name(m + '.客户编号').disabled = false;
                recordset.module.field_by_full_name(m + '.代理名称').disabled = false;
                recordset.module.field_by_full_name(m + '.合同号码').disabled = false;
                recordset.module.field_by_full_name(m + '.出运日期').disabled = false;
                recordset.module.field_by_full_name(m + '.经手人名').disabled = false;
                recordset.module.field_by_full_name(m + '.业务部门').disabled = false;
                recordset.module.field_by_full_name(m + '.贸易国别').disabled = false;
                recordset.module.field_by_full_name(m + '.合同收汇日期').disabled = false;
                recordset.module.field_by_full_name(m + '.认领提交').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.发票号码').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.外销合同').disabled = false;

                recordset.module.field_by_full_name(m + '.详细用途.使用外汇').disabled = false;

                recordset.module.field_by_full_name(m + '.详细用途.使用公司').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.使用备注').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.出运日期').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.是否结清').disabled = false;
                recordset.module.field_by_full_name(m + '.详细用途.是否定金').disabled = false;
            } else {
                if (recordset.val('认领业务') == username) {
                    recordset.module.field_by_full_name(m + '.详细用途.发票号码').disabled = false;
                }
            }
        }
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], incomes_recordLoad, '客户收汇')


const incomes_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '详细用途') {
            let t = recordset.tables['详细用途'];
            if (t.new_rids.length > 0 && t.new_rids.indexOf(recordset.val('详细用途.rid')) == -1) {
                resolve()
                return
            }
            _.http.post("/api/saier/incomes/child/delete/check", {
                yhhl: recordset.val('银行汇率'),
                cxnf: recordset.val('通知业务认领'),
                row: recordset.tables['详细用途'].current_data
            }).then(res => {
                // let d = res.data;
                resolve()
                recordset.save()
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                reject()
            })
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], incomes_table_delete_before, '客户收汇')