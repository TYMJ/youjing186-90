// 编辑界面字段change后执行
const quotation_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts
    let row = current_record
    let n = module.name
    if (field.full_name == n + '.客户名称') {
        if (recordset.val('客户名称') != '') {
            _.http
                .post('/api/saier/quotation/khmc/change', {
                    khmc: recordset.val('客户名称'),
                })
                .then(function (res) {
                    // _.ui.message.success(res.msg)
                    let d = res.data
                    recordset.val('保险比率', d.bxbl)
                    recordset.val('保险加成', d.bxjc)
                    recordset.val('客户判断', d.RMBkh)
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    if (field.full_name == n + '.修改查看') {
        recordset.module.group_by_name('修改记录').visible =
            recordset.val('修改查看') == '是'
        // if (recordset.val('修改查看') == '是') {
        //     recordset.module.group_by_name('修改记录').show()
        // } else {
        //     recordset.module.group_by_name('修改记录').hide()
        // }
    }
    if (field.full_name == n + '.报价单号') {
        if (recordset.val('报价单号') != '') {
            _.http
                .post('/api/saier/quotation/bjdh/change', {
                    bj_id: recordset.val('报价单号'),
                    rid: recordset.rid,
                })
                .then(function (res) {
                    // _.ui.message.success(res.msg)
                    if (recordset.val('唯一字段') == '')
                        recordset.val('唯一字段', recordset.rid)
                    recordset.val('审批申请', '')
                    recordset.val('审批申请1', '')
                    // recordset.val('报价审批', '');
                    // recordset.val('报价结果', '待审批');
                    recordset.val('审批结果', '待审批')
                    recordset.val('审批结果1', '待审批')
                    recordset.val('发信识别', '否')
                    recordset.val('通过识别', '否')
                    recordset.val('采购权限', '有')
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                    recordset.val('报价单号', '')
                })
        }
    }

    // 考虑到报价单号自动编号，这段代码注销
    // if (recordset.val('业务人员') != '' && recordset.val('业务人员') != _.user.username && recordset.val('报价单号') == '' && recordset.val('报价结果') == '通过' && recordset.val('唯一字段') != '') {
    //     if (recordset.val('业务人员') != '' && recordset.val('业务人员') != _.user.username && recordset.val('报价单号') == '' && recordset.val('唯一字段') != '') {
    //         _.ui.message.error('报价单号不能为空')
    //         recordset.val('业务人员', '')
    //         recordset.val('外销部门', '')
    //         return
    //     }
    // }
    if (field.full_name == n + '.采购单号') {
        if (recordset.val('采购单号') != '') {
            if (
                recordset.val('报价人员') != '' &&
                recordset.val('报价人员') != _.user.username
            ) {
                recordset.val('报价唯一字段', '')
                recordset.val('采购单号', '')
            }
        }
    }

    // 考虑到报价单号自动编号，这段代码注销
    // if (field.full_name == n + '.报价审批识别') {
    //     if (recordset.val('报价审批识别') == '1') {
    //         return
    //     }
    //     _.http.post('/api/saier/quotation/bjdh/change', {
    //         bj_id: recordset.val('报价单号'),
    //         rid: recordset.rid
    //     }).then(function (res) {
    //         // _.ui.message.success(res.msg)
    //         if (recordset.val('唯一字段') == '') recordset.val('唯一字段', recordset.rid)
    //         recordset.val('审批申请', '');
    //         recordset.val('审批申请1', '');
    //         recordset.val('报价审批', '');
    //         recordset.val('报价结果', '待审批');
    //         recordset.val('审批结果', '待审批');
    //         recordset.val('审批结果1', '待审批');
    //         recordset.val('发信识别', '否');
    //         recordset.val('通过识别', '否');
    //         recordset.val('采购权限', '有');
    //     }).catch(err => {
    //         console.log(err)
    //         _.ui.message.error(err.msg)
    //         recordset.val('报价单号', '')
    //     })
    // }

    if (field.full_name == n + '.佣金点数') {
        let yjds = recordset.val('佣金点数')
        if (String(yjds).indexOf('0.') == 0) {
            recordset.val('佣金点数', yjds * 100)
        }
        let t = recordset.tables['产品资料']
        let d = t.view_data
        let idx = 0
        for (let r of d) {
            // r.yjbl = recordset.val('佣金点数') / 100
            recordset.val('产品资料.佣金比率', recordset.val('佣金点数') / 100, r)
            // idx++
            // t.push_modi_rid(r.rid)
        }
        // t.sync_operate_data()
        // t.modified = true
    }

    if (field.full_name == n + '.暗佣点数') {
        let ayds = recordset.val('暗佣点数')
        if (String(ayds).indexOf('0.') == 0) {
            recordset.val('暗佣点数', ayds * 100)
        }
        let t = recordset.tables['产品资料']
        let d = t.view_data
        for (let r of d) {
            // r.aybl = recordset.val('暗佣点数') / 100
            // t.push_modi_rid(r.rid)
            recordset.val('产品资料.暗佣比率', recordset.val('暗佣点数') / 100, r)
        }
        // t.sync_operate_data()
        // t.modified = true
    }
    if (
        field.full_name == n + '.产品资料.佣金比率' || field.full_name == n + '.产品资料.暗佣比率'
    ) {
        let yjds = recordset.value('产品资料.佣金比率', row)
        if (String(yjds).indexOf('0.') == -1 ) {
            recordset.val('产品资料.佣金比率', yjds / 100, row)
        }
        let ayds = recordset.value('产品资料.暗佣比率', row)
        if (String(ayds).indexOf('0.') == -1 ) {
            recordset.val('产品资料.暗佣比率', ayds / 100, row)
        }
    }
    if (field.full_name == n + '.询价单号') {
        recordset.module.field_by_full_name('客户报价.产品资料.预计数量').visible =
            recordset.val('询价单号') != ''
        recordset.module.field_by_full_name('客户报价.产品资料.难度指数').visible =
            recordset.val('询价单号') != ''
        recordset.module.field_by_full_name('客户报价.产品资料.目标价格').visible =
            recordset.val('询价单号') != ''
        recordset.module.field_by_full_name('客户报价.产品资料.询价货号').visible =
            recordset.val('询价单号') != ''
    }
    // 考虑到采购报价取消，这段代码注销
    // if (field.full_name == n + '.报价审批') {
    //     if (recordset.val('报价审批') != '') {
    //         recordset.val('新旧报价', '旧');
    //     } else {
    //         recordset.val('新旧报价', '新');
    //     }
    // }
    if (
        field.full_name == n + '.产品资料.包装长度cm' ||
        field.full_name == n + '.产品资料.包装高度cm' ||
        field.full_name == n + '.产品资料.包装宽度cm'
    ) {
        let bzcd = recordset.value('产品资料.包装长度cm', row)
        let bzkd = recordset.value('产品资料.包装宽度cm', row)
        let bzgd = recordset.value('产品资料.包装高度cm', row)
        let bztj = bzcd * bzkd * bzgd
        console.log('体积', bztj)
        if (bztj != 0) {
            recordset.val(
                '产品资料.外箱体积m3',
                round(bztj / 1000000,3), row
            )
            console.log('外箱体积m3', recordset.value('产品资料.外箱体积m3', row))
            if (recordset.value('产品资料.外箱体积m3', row) < 0.001) {
                recordset.val('产品资料.外箱体积m3', 0.001, row);
            }
        }
    }
    if (field.full_name == n + '.产品资料.客人条码') {
        let code = recordset.value('产品资料.客人条码', row)
        if (code != '' && code != null && code.length >= 7) {
            recordset.val('产品资料.客人code7', code.slice(0, 7), row)
        }
    }
    if (field.full_name == n + '.产品资料.客户货号') {
        let krhh = recordset.value('产品资料.客户货号', row)
        let zyhh = recordset.value('产品资料.专业货号', row)
        if (
            recordset.val('部门识别') == '1' &&
            krhh != '' &&
            krhh != null &&
            (zyhh == '' || zyhh == null)
        ) {
            _.http
                .post('/api/saier/quotation/krhh/change', {
                    khbh: recordset.val('客户编号'),
                    krhh: krhh,
                })
                .then(function (res) {
                    if (res.data != '') {
                        recordset.val('产品资料.专业货号', res.data, row)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    if (
        field.full_name == n + '.产品资料.客户货号' ||
        field.full_name == n + '.产品资料.专业货号'
    ) {
        let krhh = recordset.value('产品资料.客户货号', row)
        let zyhh = recordset.value('产品资料.专业货号', row)
        if (krhh != '' && krhh != null) {
            recordset.val('产品资料.产品货号1', krhh.trim(), row)
        } else if (zyhh != '' && zyhh != null) {
            recordset.val('产品资料.产品货号1', zyhh.trim(), row)
        }
    }
    if (field.full_name == n + '.产品资料.专业货号') {
        if (recordset.value('产品资料.货号备注', row) != '') {
            if (
                recordset.value('产品资料.货号备注', row) !=
                recordset.value('产品资料.临时货号', row) &&
                recordset.val('报价来源') != '手机报价'
            )
                recordset.val('产品资料.货号备注', recordset.value('产品资料.专业货号', row), row)
        } else {
            recordset.val('产品资料.货号备注', recordset.value('产品资料.专业货号', row), row)
        }
    }
    if (field.full_name == n + '.产品资料.代开点数') {
        let dkd = recordset.value('产品资料.代开点数', row)
        if (dkd > 1) {
            recordset.val('产品资料.代开点数', dkd / 100, row)
        }
    }
    // if (field.full_name == n + '.产品资料.产品大类') {
    //     let cpfl = recordset.val('产品资料.产品大类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
    //     }
    // }
    // if (field.full_name == n + '.产品资料.一级分类') {
    //     let cpfl = recordset.val('产品资料.一级分类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
    //     }
    // }
    // if (field.full_name == n + '.产品资料.二级分类') {
    //     let cpfl = recordset.val('产品资料.二级分类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
    //     }
    // }
    if (field.full_name == n + '.产品资料.产品大类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        if (cpfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl, row);
                recordset.val('产品资料.产品类别', cpfl, row);
                if ((recordset.value('产品资料.一级分类', row) != '') && d.yjfl.indexOf(recordset.value('产品资料.一级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                    recordset.val('产品资料.一级分类', '', row);
                }
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.产品大类', '', row);
                recordset.val('产品资料.三级分类', '', row);
                recordset.val('产品资料.二级分类', '', row);
                recordset.val('产品资料.一级分类', '', row);
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            })
        } else {
            recordset.val('产品资料.分类名称', '', row);
            recordset.val('产品资料.产品类别', '', row);
            recordset.val('产品资料.三级分类', '', row);
            recordset.val('产品资料.二级分类', '', row);
            recordset.val('产品资料.一级分类', '', row);
        }
    }
    if (field.full_name == n + '.产品资料.一级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        if (cpfl != '' && yjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl, row);
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.一级分类', '', row);
                recordset.val('产品资料.三级分类', '', row);
                recordset.val('产品资料.二级分类', '', row);
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
            }
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
            recordset.val('产品资料.三级分类', '', row);
            recordset.val('产品资料.二级分类', '', row);
        }
    }
    if (field.full_name == n + '.产品资料.二级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        let ejfl = recordset.value('产品资料.二级分类', row);
        if (cpfl != '' && yjfl != '' && ejfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl, row);
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.二级分类', '', row);
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                }
            }
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
            recordset.val('产品资料.三级分类', '', row);
        }
    }
    if (field.full_name == n + '.产品资料.三级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        let ejfl = recordset.value('产品资料.二级分类', row);
        let sjfl = recordset.value('产品资料.三级分类', row);
        if (cpfl != '' && yjfl != '' && ejfl != '' && sjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl,
                sjfl: sjfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl, row);
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.三级分类', '', row);
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                    if (ejfl != '') fl_list.push(ejfl);
                }
            }
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
        }
    }
    if (
        field.full_name == n + '.产品资料.克    重' ||
        field.full_name == n + '.产品资料.外箱装箱量' ||
        field.full_name == n + '.产品资料.外箱体积m3'
    ) {
        if (
            recordset.value('产品资料.外箱装箱量', row) > 0 &&
            recordset.value('产品资料.克    重', row) > 0
        ) {
            if (
                recordset.value('产品资料.毛    重', row) == 0 &&
                recordset.value('产品资料.外箱体积m3', row) > 0
            ) {
                let xm = '1'
                _.http
                    .post('/api/saier/items/get/size', {
                        xm: xm,
                        sz: recordset.value('产品资料.外箱体积m3', row),
                    })
                    .then(function (res) {
                        if (res.data.f && res.data.f == 0) {
                            recordset.val(
                                '产品资料.毛    重',
                                (recordset.value('产品资料.外箱装箱量', row) *
                                    recordset.value('产品资料.克    重', row)) /
                                1000 +
                                res.data.v, row
                            )
                        } else {
                            recordset.val(
                                '产品资料.毛    重',
                                (recordset.value('产品资料.外箱装箱量', row) *
                                    recordset.value('产品资料.克    重', row)) /
                                1000 +
                                1, row
                            )
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                    })
            }
            if (recordset.value('产品资料.净    重') == 0) {
                recordset.val(
                    '产品资料.净    重',
                    (recordset.value('产品资料.外箱装箱量', row) *
                        recordset.value('产品资料.克    重', row)) /
                    1000, row
                )
            }
        }
    }
    if (
        field.full_name == n + '.产品资料.毛    重' ||
        field.full_name == n + '.产品资料.外箱体积m3'
    ) {
        if (recordset.value('产品资料.外箱体积m3', row) > 0) {
            recordset.val(
                '产品资料.小柜箱数',
                Math.trunc(28 / recordset.value('产品资料.外箱体积m3', row)), row
            )
            recordset.val(
                '产品资料.平柜箱数',
                Math.trunc(58 / recordset.value('产品资料.外箱体积m3', row)), row
            )
            recordset.val(
                '产品资料.高柜箱数',
                Math.trunc(68 / recordset.value('产品资料.外箱体积m3', row)), row
            )
            recordset.val(
                '产品资料.冷冻柜箱数',
                Math.trunc(58 / recordset.value('产品资料.外箱体积m3', row)), row
            )
            recordset.val(
                '产品资料.超高柜箱数',
                Math.trunc(76 / recordset.value('产品资料.外箱体积m3', row)), row
            )
        }
        if (recordset.value('产品资料.毛    重', row) > 0) {
            recordset.val(
                '产品资料.小柜箱数(毛)',
                Math.trunc(21500 / recordset.value('产品资料.毛    重', row)), row
            )
            recordset.val(
                '产品资料.平柜箱数(毛)',
                Math.trunc(26000 / recordset.value('产品资料.毛    重', row)), row
            )   
            recordset.val(
                '产品资料.高柜箱数(毛)',
                Math.trunc(26000 / recordset.value('产品资料.毛    重', row)), row
            )
            if (!item_weight_check(recordset.value('产品资料.净    重', row), recordset.value('产品资料.毛    重', row))) {
                _.ui.message.error('净重不能大于毛重');
                recordset.val('产品资料.毛    重', 0, row);
            }
        }
    }
    if (field.full_name == n + '.产品资料.净    重' && value != 0 && recordset.value('产品资料.毛    重', row) != 0) {
        if (!item_weight_check(recordset.value('产品资料.净    重', row), recordset.value('产品资料.毛    重', row))) {
            _.ui.message.error('净重不能大于毛重');
            recordset.val('产品资料.净    重', 0, row);
        }
    }
    if (field.full_name == n + '.产品资料.中文报关品名') {
        if (
            recordset.value('产品资料.中文报关品名', row) != '' &&
            recordset.value('产品资料.一级分类', row) == ''
        ) {
            _.http
                .post('/api/saier/quotation/bgpm/change', {
                    bgpm: recordset.value('产品资料.中文报关品名', row),
                })
                .then(function (res) {
                    if (res.data) {
                        let d = res.data
                        recordset.val('产品资料.产品大类', d.cpfl, row)
                        recordset.val('产品资料.一级分类', d.yjfl, row)
                        recordset.val('产品资料.二级分类', d.ejfl, row)
                        recordset.val('产品资料.三级分类', d.sjfl, row)
                        recordset.val('产品资料.分类名称', d.flmc, row)
                        recordset.val('产品资料.产品类别', d.cplb, row)
                        // recordset.val('产品资料.一级子目录', d.yjlb);
                        // recordset.val('产品资料.二级子目录', d.ejlb);
                        // recordset.val('产品资料.三级类别', d.sjlb);
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    // n + '.产品资料.代开点数',
    let fields = [
        n + '.产品资料.客户RMB单价',
        n + '.产品资料.外销单价',
        n + '.产品资料.退 税 率',
        n + '.产品资料.代开金额',
        n + '.产品资料.佣金比率',
        n + '.产品资料.暗佣比率',
        n + '.产品资料.采购单价',
    ]
    if (fields.indexOf(field.full_name) != -1) {
        if (
            (recordset.val('产品资料.外销单价') > 0 ||
                recordset.val('产品资料.客户RMB单价') > 0) &&
            recordset.val('产品资料.采购单价') > 0 &&
            recordset.val('新旧报价') == '新'
        ) {
            _.http
                .post('/api/saier/quotation/get/nxkh', {
                    khmc: recordset.val('客户名称'),
                })
                .then(function (res) {
                    // let d = res.data;
                    let hlcg = 1
                    let cgdj =
                        recordset.val('产品资料.采购单价') * hlcg +
                        recordset.val('产品资料.辅料价格')
                    let mldx = recordset.val('毛 利 率')
                    let hl = recordset.val('汇    率')
                    let fyl = recordset.val('费 用 率')
                    let zzsl = recordset.val('产品资料.增值税率')
                    let zzsl1 = recordset.val('产品资料.增值税率')
                    let zzsl2 = 1 + zzsl / 100
                    let tsl = recordset.val('产品资料.退 税 率')
                    let mll = 0
                    let mll1 = 0
                    if (tsl === 0) {
                        zzsl = 0
                    }
                    if (recordset.val('客户判断') !== '是') {
                        recordset.val(
                            '产品资料.佣    金',
                            recordset.val('产品资料.外销单价') *
                            recordset.val('产品资料.佣金比率'),
                        )
                        recordset.val(
                            '产品资料.暗佣',
                            recordset.val('产品资料.外销单价') *
                            recordset.val('产品资料.暗佣比率'),
                        )
                    } else {
                        recordset.val(
                            '产品资料.佣    金',
                            recordset.val('产品资料.客户RMB单价') *
                            recordset.val('产品资料.佣金比率'),
                        )
                        recordset.val(
                            '产品资料.暗佣',
                            recordset.val('产品资料.客户RMB单价') *
                            recordset.val('产品资料.暗佣比率'),
                        )
                    }
                    let nxkh = ''
                    if (recordset.val('客户名称') !== '') nxkh = res.data
                    if (nxkh === '是') {
                        if (recordset.val('客户判断') == '是') {
                            if (recordset.val('产品资料.客户RMB单价') !== 0 && cgdj !== 0) {
                                if (recordset.val('产品资料.佣    金') == 0)
                                    recordset.val(
                                        '产品资料.佣    金',
                                        recordset.val('产品资料.客户RMB单价') *
                                        recordset.val('产品资料.佣金比率'),
                                    )
                                // let sj = (recordset.val('产品资料.客户RMB单价') - cgdj - recordset.val('产品资料.代开金额')) / 1.13 * 0.13 + (recordset.val('产品资料.代开点数') * recordset.val('产品资料.代开金额'));
                                mll1 =
                                    (recordset.val('产品资料.客户RMB单价') -
                                        cgdj -
                                        recordset.val('产品资料.代开金额') -
                                        recordset.val('产品资料.佣    金')) /
                                    recordset.val('产品资料.客户RMB单价')
                                recordset.val('产品资料.利 润 率', round(mll1,2))
                                if (mldx > 0 && mll1 < mldx) {
                                    if (
                                        recordset.val('强制更新') === '' &&
                                        recordset.val('采购单号') === ''
                                    )
                                        _.ui.message.error(
                                            '请注意，该产品客户人民币单价毛 利 率低于' + mldx + '!',
                                        )
                                }
                            }
                        } else {
                            if (recordset.val('产品资料.外销单价') !== 0 && cgdj !== 0) {
                                if (recordset.val('产品资料.佣    金') === 0)
                                    recordset.val(
                                        '产品资料.佣    金',
                                        recordset.val('产品资料.外销单价') *
                                        hl *
                                        recordset.val('产品资料.佣金比率'),
                                    )
                                let mjdj = recordset.val('产品资料.外销单价') * hl
                                // let sj = (mjdj - cgdj - recordset.val('产品资料.代开金额')) / 1.13 * 0.13 + (recordset.val('产品资料.代开点数') * recordset.val('产品资料.代开金额'));
                                mll1 = 0
                                if (mjdj != 0)
                                    mll1 =
                                    (mjdj -
                                        cgdj -
                                        recordset.val('产品资料.代开金额') -
                                        recordset.val('产品资料.佣    金')) /
                                    mjdj
                                recordset.val('产品资料.利 润 率', round(mll1,2))
                                if (mldx > 0 && mll1 < mldx) {
                                    if (
                                        recordset.val('强制更新') === '' &&
                                        recordset.val('采购单号') === ''
                                    )
                                        _.ui.message.error(
                                            '请注意，该产品外销单价毛 利 率低于' + mldx + '!',
                                        )
                                }
                            }
                        }
                    } else {
                        if (tsl > 0 || tsl > zzsl) {
                            if (tsl === 3) {
                                zzsl = 3
                                recordset.val('产品资料.增值税率', zzsl)
                            }
                            if (tsl > 3) {
                                zzsl = zzsl1
                                recordset.val('产品资料.增值税率', zzsl)
                            }
                        }
                        let rmbdj1 = recordset.val('产品资料.客户RMB单价')
                        let wxdj1 = recordset.val('产品资料.外销单价')
                        if (rmbdj1 > 0) {
                            wxdj1 = recordset.val('产品资料.客户RMB单价')
                            hl = 1
                        }
                        let tsl1 = 0
                        let tsl2 = 0
                        if (hl > 0 && wxdj1 !== 0 && cgdj !== 0) {
                            if (rmbdj1 > 0) {
                                wxdj1 =
                                    recordset.val('产品资料.客户RMB单价') -
                                    recordset.val('产品资料.佣    金')
                                if (tsl >= 1) {
                                    tsl2 = tsl / 100
                                    tsl1 = (recordset.val('产品资料.采购单价') / zzsl2) * tsl2
                                }
                                if (tsl === 0) {
                                    tsl1 = 0
                                }
                                mll =
                                    (wxdj1 -
                                        wxdj1 * fyl -
                                        cgdj +
                                        tsl1 -
                                        recordset.val('产品资料.暗佣')) /
                                    wxdj1
                            } else {
                                // 计算换汇成本
                                let hhcb = cgdj / wxdj1
                                if (zzsl === zzsl1) {
                                    let a = 1 + (zzsl - tsl) / 100
                                    if (fyl > 0) {
                                        if (a * hl * fyl !== 0) {
                                            mll =
                                                ((zzsl2 / a) * hl - (zzsl2 / a) * hl * fyl - hhcb) /
                                                ((zzsl2 / a) * hl)
                                        }
                                    } else if (a * hl !== 0) {
                                        mll = ((zzsl2 / a) * hl - hhcb) / ((zzsl2 / a) * hl)
                                    }
                                }
                                if (zzsl === 3 && tsl === 3) {
                                    if (1.03 * hl !== 0) {
                                        mll = (1.03 * hl - 1.03 * hl * fyl - hhcb) / (1.03 * hl)
                                    }
                                }
                                if (zzsl === 1 && tsl === 1) {
                                    if (1.01 * hl !== 0) {
                                        mll = (1.01 * hl - 1.01 * hl * fyl - hhcb) / (1.01 * hl)
                                    }
                                }
                                if (zzsl === 0 && tsl === 0) {
                                    mll = (hl - hl * fyl - hhcb) / hl
                                }
                                recordset.val('产品资料.换汇成本', hhcb)
                            }
                            // console.log('毛利率: ', round(mll,2))
                            recordset.val('产品资料.利 润 率', round(mll, 2))
                            if (mldx > 0 && mll < mldx) {
                                if (
                                    recordset.val('强制更新') === '' &&
                                    recordset.val('采购单号') === ''
                                )
                                    _.ui.message.error(
                                        '请注意，该产品外销单价毛 利 率低于' + mldx + '!',
                                    )
                            }
                        }
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    if (field.full_name == n + '.产品资料.货号备注') {
        if (
            recordset.value('产品资料.专业货号', row) != '' &&
            recordset.value('产品资料.上传识别', row) != '是' &&
            recordset.value('强制更新') != '采购单号' &&
            recordset.value('产品资料.货号备注', row) != ''
        ) {
            _.http
                .post('/api/saier/quotation/hhbz/change', {
                    khbh: recordset.val('客户编号'),
                    cpbh: recordset.value('产品资料.专业货号', row),
                    bmsb: recordset.val('部门识别'),
                    // yw: recordset.val('业务')
                })
                .then(function (res) {
                    let d = res.data
                    let i1 = 0
                    // let path = recordset.val('业务');
                    // let path1 = d.path;
                    let zyhh1 = recordset.value('产品资料.专业货号', row).trim()
                    // let row = recordset.tables['产品资料'].current_data
                    recordset.val('强制更新', '更新')
                    // recordset.val('产品资料.专业货号', zyhh1)
                    if (recordset.val('部门识别') == '1') {
                        // recordset.val('产品资料.报价报价唯一字段1', recordset.val('产品资料.rid'));
                    }
                    // console.log(d)
                    // console.log(recordset.val('产品资料.货号备注'))
                    if (d.cp) {
                        recordset.val('产品资料.退 税 率', d.cp.tsl, row)
                        if (recordset.value('产品资料.报价报价唯一字段1', row) == '')
                            recordset.val('产品资料.报价报价唯一字段1', d.cp.bjbjwyzd, row)
                        recordset.val('产品资料.采购货币', d.cp.cghbdm, row)
                        recordset.val('产品资料.开票点数', d.cp.ljrk, row)
                        recordset.val('产品资料.颜    色', d.cp.yse, row)
                        recordset.val('产品资料.颜色英文', d.cp.ysez, row)
                        recordset.val('产品资料.产品规格', d.cp.cpggz, row)
                        recordset.val('产品资料.规格英语', d.cp.cpgg, row)
                        recordset.val('产品资料.中文品名', d.cp.zwpm, row)
                        recordset.val('产品资料.英文品名', d.cp.ywpm, row)
                        recordset.val('产品资料.计量单位', d.cp.jldw, row)
                        recordset.val('产品资料.可思达货号', d.cp.ksdhh, row)
                        recordset.val('产品资料.客户货号', '', row)
                        recordset.val('产品资料.客人条码', '', row)
                        if (i1 == 2) recordset.val('产品资料.辅料价格', d.cp.fljg, row)
                        if (recordset.val('部门识别') == '1') {
                            recordset.val('产品资料.换汇成本', d.cp.hhcb, row)
                            let wxdj = 0
                            let khrmbdj = 0
                            if (d.kh) {
                                if (d.kh.krhh != '无' && d.kh.krhh != '')
                                    recordset.val('产品资料.客户货号', d.kh.krhh, row)
                                if (d.kh.krtm != '无' && d.kh.krtm != '')
                                    recordset.val('产品资料.客人条码', d.kh.krtm, row)
                                if (d.kh.rmbdj > 0) khrmbdj = d.kh.rmbdj
                                if (d.kh.mjfob > 0) wxdj = d.kh.mjfob
                            }
                            if (recordset.value('产品资料.客户货号', row) == '' && d.cp.krhh != '无')
                                recordset.val('产品资料.客户货号', d.cp.krhh, row)
                            if (recordset.value('产品资料.客人条码', row) == '')
                                recordset.val('产品资料.客人条码', d.cp.krtm, row)
                            if (wxdj > 0) {
                                recordset.val('产品资料.外销单价', wxdj, row)
                            } else {
                                recordset.val('产品资料.外销单价', d.cp.mjfob, row)
                            }
                            if (khrmbdj > 0) {
                                recordset.val('产品资料.客户RMB单价', khrmbdj, row)
                            } else {
                                recordset.val('产品资料.客户RMB单价', d.cp.rmbdj, row)
                            }
                        }
                        recordset.val('产品资料.采购单价', d.cp.cgdj, row)
                        recordset.val('产品资料.内盒装箱量', d.cp.nhrl, row)
                        recordset.val('产品资料.外箱装箱量', d.cp.bzrl, row)
                        recordset.val('产品资料.包装长度cm', d.cp.bzcd, row)
                        recordset.val('产品资料.包装宽度cm', d.cp.bzkd, row)
                        recordset.val('产品资料.包装高度cm', d.cp.bzgd, row)
                        recordset.val('产品资料.外箱体积m3', d.cp.bztj, row)
                        recordset.val('产品资料.毛    重', d.cp.mxmz, row)
                        recordset.val('产品资料.净    重', d.cp.mxjz, row)
                        recordset.val('产品资料.克    重', d.cp.chpkzh, row)
                        recordset.val('产品资料.材质英语', d.cp.caizi, row)
                        recordset.val('产品资料.中文说明', d.cp.cpsm, row)
                        recordset.val('产品资料.英文说明', d.cp.ywsm, row)
                        recordset.val('产品资料.产品尺寸', d.cp.chpchc, row)
                        recordset.val('产品资料.专业厂家', d.cp.sccj, row)
                        recordset.val('产品资料.采购人员', d.cp.cgry, row)
                        recordset.val('产品资料.内部材质', d.cp.coating, row)
                        recordset.val('产品资料.外部材质', d.cp.wbcz, row)
                        recordset.val('产品资料.其他材质', d.cp.qtcz, row)
                        recordset.val('产品资料.厚    度', d.cp.houd, row)
                        recordset.val('产品资料.产品来源', d.cp.topcz, row)
                        recordset.val('产品资料.bottom材质', d.cp.bottomcz, row)
                        recordset.val('产品资料.其他材质', d.cp.qtcz, row)
                        recordset.val('产品资料.起 订 量', d.cp.zxcgl, row)
                        recordset.val('产品资料.壁    厚', d.cp.bh123, row)
                        recordset.val('产品资料.底    厚', d.cp.dh123, row)
                        recordset.val('产品资料.中文尺寸', d.cp.zwcc, row)
                        recordset.val('产品资料.英文尺寸', d.cp.ywcc, row)
                        recordset.val('产品资料.内盒/外箱', d.cp.nhwx, row)
                        recordset.val('产品资料.外语品名', d.cp.wypp, row)
                        recordset.val('产品资料.规格外语', d.cp.ggwy, row)
                        recordset.val('产品资料.材质外语', d.cp.czwy, row)
                        recordset.val('产品资料.颜色外语', d.cp.yswy, row)
                        recordset.val('产品资料.外语说明', d.cp.wysm, row)
                        recordset.val('产品资料.产品大类', d.cp.cpfl, row)
                        recordset.val('产品资料.一级分类', d.cp.yjfl, row)
                        recordset.val('产品资料.二级分类', d.cp.ejfl, row)
                        recordset.val('产品资料.三级分类', d.cp.sjfl, row)
                        recordset.val('产品资料.分类名称', d.cp.flmc, row)
                        recordset.val('产品资料.包装单位', d.cp.bzdw, row)
                        recordset.val('产品资料.中文包装', d.cp.zhwbzh, row)
                        recordset.val('产品资料.英文包装', d.cp.bzhfsh, row)
                        recordset.val('产品资料.单据品名', d.cp.djpm, row)
                        recordset.val('产品资料.单据品名英', d.cp.djpmy, row)
                        recordset.val('产品资料.单据品名外', d.cp.djpmw, row)
                        recordset.val('产品资料.客人CODE', d.cp.krcode, row)
                        recordset.val('产品资料.中文计量单位', d.cp.zwdw, row)
                        recordset.val('产品资料.材质中文', d.cp.caiziz, row)
                        recordset.val('产品资料.款式英', d.cp.ksy, row)
                        recordset.val('产品资料.款式外', d.cp.ksw, row)
                        recordset.val('产品资料.增值税率', d.cp.zzsl, row)
                        recordset.val('产品资料.客人税率', d.cp.krsl, row)
                        recordset.val('产品资料.产品类别', d.cp.cplb, row)
                        recordset.val('产品资料.中文报关品名', d.cp.bgpm, row)
                        recordset.val('产品资料.海关编码', d.cp.hgbm, row)
                        recordset.val('产品资料.报关单位', d.cp.bgjldw, row)
                        recordset.val('产品资料.入库地点', d.cp.rkdd, row)
                        recordset.val('产品资料.包装要求', d.cp.bzyq, row)
                        recordset.val('产品资料.款  式', d.cp.ks, row)
                        recordset.val('产品资料.备注', d.cp.bz3, row)
                        recordset.val('产品资料.是否含税', d.cp.sfhs, row)
                        recordset.val('产品资料.专业产品编号', d.cp.cpbh, row)
                        recordset.val('产品资料.工厂货号', d.cp.gchh1, row)
                        recordset.val('产品资料.原始采购价', d.cp.yscgj, row)
                        recordset.val('产品资料.工厂退点', d.cp.gctd, row)
                        recordset.val('产品资料.是否授权', d.cp.sfsq, row)

                        // recordset.val('产品资料.外箱材质', d.cp.wxcz2);
                        // recordset.val('产品资料.外箱单价M2', d.cp.wxdj2);
                        // recordset.val('产品资料.内盒长cm', d.cp.nhzcm);
                        // recordset.val('产品资料.内盒宽cm', d.cp.nhkcm);
                        // recordset.val('产品资料.内盒高cm', d.cp.nhgcm);
                        // recordset.val('产品资料.内盒材质', d.cp.nhcz3);
                        // recordset.val('产品资料.内盒单价M2', d.cp.nhdj2);
                        // recordset.val('产品资料.箱子总成本', d.cp.xzzcb);
                        // recordset.val('产品资料.发货地点', d.cp.fhdd);
                        // recordset.val('产品资料.运费计算条件', d.cp.yfjstj);
                        // recordset.val('产品资料.运费价格', d.cp.yfjg);
                        // recordset.val('产品资料.进仓费', d.cp.jcf);
                        // recordset.val('产品资料.运费成本', d.cp.yfcb);
                        // recordset.val('产品资料.纸卡长(cm)', d.cp.zkzcm);
                        // recordset.val('产品资料.纸卡宽(cm)', d.cp.zkkcm);
                        // recordset.val('产品资料.纸卡材质', d.cp.zkcz);
                        // recordset.val('产品资料.纸卡单价M2', d.cp.zkdj2);
                        // recordset.val('产品资料.纸卡单价', d.cp.zkdj);
                        // recordset.val('产品资料.纸卡泡壳长(cm)', d.cp.zkpkzcm);
                        // recordset.val('产品资料.纸卡泡壳宽(cm)', d.cp.zkpkkcm);
                        // recordset.val('产品资料.纸卡泡壳厚(cm)', d.cp.zkphcm);
                        // recordset.val('产品资料.纸卡泡壳价格', d.cp.zkpkjg2);
                        // recordset.val('产品资料.泡壳长cm', d.cp.pkzcm);
                        // recordset.val('产品资料.泡壳宽cm', d.cp.pkkcm);
                        // recordset.val('产品资料.泡壳高cm', d.cp.pkgcm);
                        // recordset.val('产品资料.泡壳厚度cm', d.cp.pkhdcm);
                        // recordset.val('产品资料.泡壳单价', d.cp.pkdj2);
                        // recordset.val('产品资料.袋子长cm', d.cp.dzzcm);
                        // recordset.val('产品资料.袋子宽cm', d.cp.dzkcm);
                        // recordset.val('产品资料.袋子厚度cm', d.cp.dzhdcm);
                        // recordset.val('产品资料.密度', d.cp.md);
                        // recordset.val('产品资料.版费/色', d.cp.bfs);
                        // recordset.val('产品资料.颜色数量', d.cp.yssl);
                        // recordset.val('产品资料.订单数量', d.cp.ddsl);
                        // recordset.val('产品资料.袋子单价', d.cp.dzdj);
                        // recordset.val('产品资料.盒子长cm', d.cp.hzzcm);
                        // recordset.val('产品资料.盒子宽cm', d.cp.hzkcm);
                        // recordset.val('产品资料.盒子高cm', d.cp.hzgcm);
                        // recordset.val('产品资料.盒子材质', d.cp.hzcz);
                        // recordset.val('产品资料.盒子单价M2', d.cp.zkdj3);
                        // recordset.val('产品资料.盒子单价', d.cp.hzdj);

                        recordset.val('产品资料.Washing', d.cp.Washing, row)
                        recordset.val('产品资料.Bleach', d.cp.Bleach, row)
                        recordset.val('产品资料.Drying', d.cp.Drying, row)
                        recordset.val('产品资料.Ironing', d.cp.Ironing, row)
                        recordset.val(
                            '产品资料.Professional Textile Care',
                            d.cp.ProfessionalTextileCare,
                        )
                        recordset.val('产品资料.检测项目', d.cp.jcxm, row)
                        recordset.val('产品资料.检测费用', d.cp.jcfy, row)
                        if (i1 == 2) recordset.val('产品资料.结算方式', d.cp.jsfs, row)
                    } else {
                        if (recordset.val('部门识别') != '1' && i1 != 0) {
                            recordset.val('产品资料.专业货号', '', row)
                            recordset.val('产品资料.专业货号1', '', row)
                            recordset.val('强制更新', '')
                            recordset.val('产品资料.货号备注', '', row)
                        }
                    }
                    recordset.val(
                        '产品资料.专业货号1',
                        recordset.val('产品资料.专业货号'),
                        row
                    )
                    recordset.val('产品资料.识别', '', row)
                    if (recordset.value('产品资料.专业厂家', row) != '' && d.cs) {
                        recordset.val('产品资料.专业厂家id', d.cs.cs_id, row)
                        recordset.val('产品资料.工厂电话', d.cs.phone, row)
                        recordset.val('产品资料.有无拜访', d.cs.ywbf, row)
                        if (d.cs.jsfs != '') recordset.val('产品资料.结算方式', d.cs.jsfs, row)
                    }
                    recordset.val('强制更新', '')
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    if (field.full_name == n + '.审批申请' && value != '') {
        if (
            recordset.val('唯一字段') == '' ||
            recordset.val('报价单号') == '' ||
            recordset.val('客户名称') == '' ||
            recordset.val('客户编号') == '' ||
            recordset.val('报价日期') == '' ||
            recordset.val('我方公司') == ''
        ) {
            recordset.val('审批申请', '')
            recordset.val('审批申请1', '')
            _.ui.message.error('不好意思,请先输入报价单号后保存,谢谢!')
        } else {
            let user = _.user.username
            if (value == user && value != 'admin') {
                _.ui.message.error('不能将自己设置为审批申请人！')
                recordset.val('审批申请', '')
            } else {
                let t = recordset.tables['产品资料']
                let d = t.view_data
                let flag = true
                let errs = []
                let index = 0
                for (let r of d) {
                    index += 1
                    // if (r.yytp == '' || r.yytp == '[]' || r.yytp == null) {
                    //     _.ui.message.error('请注意有没有提交图片的产品不能提交');
                    //     flag = false;
                    //     errs = []
                    //     break;
                    // }
                    if (r.lrlv && r.lrlv < 0) {
                        flag = false
                        errs.push(index)
                    }
                    if (
                        (r.ljrk == 0 ||
                            r.zhwbgpm == '' ||
                            r.hgbm == '' ||
                            r.zhwbgpm == '无' ||
                            r.tsl == 0 ||
                            r.zzsl == 0) &&
                        r.sfhs == '是'
                    ) {
                        flag = false
                        errs.push(index)
                    }
                }
                if (!flag) {
                    recordset.val('审批申请', '')
                    recordset.val('审批结果', '待审批')
                    if (errs.length > 0) {
                        let err_str = errs.join(',')
                        _.ui.message.error(
                            '请注意' +
                            err_str +
                            '中文报关,开票点数,海关编码,增税,退税,有没填,不能提交',
                        )
                    }
                } else {
                    if (recordset.val('业务人员') == '')
                        recordset.val('业务人员', recordset.val('报价人员'))
                }
            }
        }
    }
    if (field.full_name == n + '.产品资料.是否含税') {
        if (recordset.val('产品资料.是否含税') != '是') {
            recordset.val('产品资料.中文报关品名', '无' , row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
        }
    }
    if (field.full_name == n + '.产品资料.增值税率') {
        if (recordset.val('产品资料.是否含税') != '是'  && recordset.val('产品资料.增值税率') != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，增值税率必须为0');
        }
    }
    if (field.full_name == n + '.产品资料.退 税 率') {
        if (recordset.val('产品资料.是否含税') != '是' && recordset.val('产品资料.退 税 率') != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，退税率必须为0');
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, quotation_field_change, '客户报价')

// 编辑界面数据加载以后执行
const quotation_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name
    let user = _.user.username
    if (user == 'zjnblh') {
        recordset.module.field_by_full_name(n + '.出运起始').show()
        recordset.module.field_by_full_name(n + '.出运结束').show()
        recordset.module.field_by_full_name(n + '.采购数量').show()
        recordset.module.field_by_full_name(n + '.采购金额').show()
        recordset.module.field_by_full_name(n + '.修改清单').show()
    } else {
        recordset.module.field_by_full_name(n + '.出运起始').hide()
        recordset.module.field_by_full_name(n + '.出运结束').hide()
        recordset.module.field_by_full_name(n + '.采购数量').hide()
        recordset.module.field_by_full_name(n + '.采购金额').hide()
        recordset.module.field_by_full_name(n + '.修改清单').hide()
    }
    // recordset.val('修改查看', '否');
    // recordset.module.group_by_name('修改记录').visible = false
    recordset.module.group_by_name('修改记录').visible =
        recordset.val('修改查看') == '是'
    // 考虑到采购报价取消，这段代码注销
    // if ((recordset.val('审批申请') != '' || recordset.val('报价审批') != '') && recordset.val('审批申请') != user && recordset.val('报价审批') != user) {
    if (recordset.val('审批申请') != '' && recordset.val('审批申请') != user) {
        recordset.module.field_by_full_name(n + '.报价单号').disabled = true
        recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.换汇成本').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.专业厂家id').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.专业厂家').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.外销单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.采购单价').disabled =
            true
        // recordset.module.field_by_full_name(n + '.修改记录.外销单价').disabled =
        //     true
        recordset.module.field_by_full_name(n + '.修改记录.原外销单价').disabled =
            true
    } else {
        // 考虑到采购报价取消，这段代码注销
        // if (recordset.val('审批申请') == '' && recordset.val('报价审批') == '') recordset.module.field_by_full_name(n + '.报价单号').disabled = false
        if (recordset.val('审批申请') == '')
            recordset.module.field_by_full_name(n + '.报价单号').disabled = false
    }
    // 考虑到采购报价取消，这段代码注销
    // if ((recordset.val('审批申请') != '') && (recordset.val('审批结果') == '通过') || ((recordset.val('报价审批') != '') && (recordset.val('报价结果') = '通过'))) {
    if (recordset.val('审批申请') != '' && recordset.val('审批结果') == '通过') {
        recordset.module.field_by_full_name(n + '.报价单号').disabled = true
        recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.换汇成本').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.专业厂家id').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.外销单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.产品资料.采购单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.修改记录.外销单价').disabled =
            true
        recordset.module.field_by_full_name(n + '.修改记录.原外销单价').disabled =
            true
    }
    // if (recordset.val('报价人员') == '')
    //     recordset.val('报价人员', user);

    // if ((recordset.val('报价人员') == user) || (recordset.val('报价审批') == user)) {
    //     recordset.module.field_by_full_name(n + '.采购备注').show()
    // } else {
    //     recordset.module.field_by_full_name(n + '.采购备注').hide()
    // }

    recordset.module.field_by_full_name(n + '.审批结果').disabled = true
    // recordset.module.field_by_full_name(n + '.报价结果').disabled = true

    // recordset.module.field_by_full_name(n + '.报价审批').disabled = true
    recordset.module.field_by_full_name(n + '.未批原因').disabled = true
    recordset.module.field_by_full_name(n + '.查看情况').hide()
    // recordset.module.field_by_full_name(n + '.报价结果').hide()
    // recordset.module.field_by_full_name(n + '.报价审批').hide()

    // recordset.module.field_by_full_name(n + '.审批申请').disabled = true
    // recordset.module.field_by_full_name(n + '.审批申请').hide()
    recordset.module.field_by_full_name(n + '.审批结果').hide()
    if (recordset.val('询价单号') == '') {
        recordset.module.field_by_full_name(n + '.产品资料.预计数量').hide()
        recordset.module.field_by_full_name(n + '.产品资料.难度指数').hide()
        recordset.module.field_by_full_name(n + '.产品资料.目标价格').hide()
        recordset.module.field_by_full_name(n + '.产品资料.询价货号').hide()
    }
    if (recordset.val('报价来源') == 'PDA') {
        recordset.module.field_by_full_name(n + '.产品资料.加点单价').show()
        recordset.module.field_by_full_name(n + '.产品资料.报价毛利率').show()
    } else {
        recordset.module.field_by_full_name(n + '.产品资料.加点单价').hide()
        recordset.module.field_by_full_name(n + '.产品资料.报价毛利率').hide()
    }
    recordset.module.field_by_full_name(n + '.已看标志').disabled = true
    // recordset.module.field_by_full_name(n + '.产品资料.产品图片').hide()

    let wfgs = recordset.val('我方公司')
    // let bjsp = recordset.val('报价审批');
    // let bjry = recordset.val('报价人员');
    let ry = recordset.val('业务人员')
    let sp = recordset.val('审批申请')
    let sp1 = recordset.val('审批申请1')
    let ywry1 = recordset.val('业务人员')
    let bjql = recordset.val('审批结果')
    let bjql1 = recordset.val('审批结果1')
    let bjdl = recordset.val('业务')
    if (recordset.val('货币代码') == '') recordset.val('货币代码', 'USD$')
    _.http
        .post('/api/saier/quotation/load/check', {
            wfgs: wfgs,
        })
        .then(function (res) {
            let d = res.data
            // if (recordset.val('报价部门') == '') recordset.val('报价部门', d.bm);
            if (recordset.val('我方公司') == '') {
                recordset.val('我方公司', wfgs)
                recordset.val('毛 利 率', d.mldx)
                recordset.val('费 用 率', d.fyl)
            }
            if (recordset.val('wf_status') != 1 && recordset.val('wf_status') != 2) {
                if (d.position.indexOf('全部') != -1) {
                    recordset.val('部门识别', '1');
                } else {
                    recordset.val('部门识别', '');
                }
                if (d.wx == 1) {
                    recordset.val('部门识别', '1');
                    if (recordset.val('业务人员') == '') {
                        recordset.val('业务人员', user);
                    }
                } else {
                    if (recordset.val('部门识别') != '1') {
                        recordset.val('部门识别', '');
                    }
                }
            }
            if (d.cg == 1 && d.wx != 1)
                recordset.module.field_by_full_name(n + '.查看情况').show()
            let path = d.path
            if (recordset.val('业务') == '') {
                recordset.val('业务', path)
            }
            // recordset._list['客户报价.报价审批'] = d.spjg_list;
            recordset._list['客户报价.审批申请'] = d.spsq_list

            if (d.username != 'zhbblh') {
                if (d.wxgd == 1) {
                    recordset.module
                        .field_by_full_name(n + '.产品资料.客户RMB单价')
                        .show()
                    recordset.module.field_by_full_name(n + '.产品资料.换汇成本').show()
                    recordset.module.field_by_full_name(n + '.产品资料.专业厂家id').show()
                    recordset.module.field_by_full_name(n + '.产品资料.外销单价').show()
                    recordset.module.field_by_full_name(n + '.产品资料.客户选中').show()
                    recordset.module.field_by_full_name(n + '.修改记录.外销单价').show()
                    recordset.module.field_by_full_name(n + '.修改记录.原外销单价').show()
                } else {
                    recordset.module.field_by_full_name(n + '.询价单号').disabled = true
                    recordset.module
                        .field_by_full_name(n + '.产品资料.客户RMB单价')
                        .hide()
                    recordset.module.field_by_full_name(n + '.产品资料.换汇成本').hide()
                    recordset.module.field_by_full_name(n + '.产品资料.客户选中').hide()
                    recordset.module.field_by_full_name(n + '.产品资料.专业厂家id').hide()
                    recordset.module.field_by_full_name(n + '.产品资料.外销单价').hide()
                    recordset.module.field_by_full_name(n + '.修改记录.外销单价').hide()
                    recordset.module.field_by_full_name(n + '.修改记录.原外销单价').hide()
                }
                if (d.wx == 1) {
                    recordset.module.field_by_full_name(n + '.审批申请').show()
                    recordset.module.field_by_full_name(n + '.审批结果').show()
                    if (recordset.val('审批申请') == '') {
                        recordset.module.field_by_full_name(n + '.审批申请').disabled =
                            false
                    } else {
                        recordset.module.field_by_full_name(n + '.审批申请').disabled = true
                    }
                    if (recordset.val('新旧报价') == '') {
                        recordset.val('新旧报价', '新')
                    }
                    if (recordset.val('外销部门') == '') {
                        recordset.val('外销部门', d.bm)
                    }
                    if (d.nblh == 0) {
                        if (d.cg != 1 && d.wx == 1) {
                            if (recordset.val('业务人员') == '')
                                recordset.val('业务人员', 'zjnblh')
                        }
                    } else {
                        if (
                            recordset.val('报价结果') != '通过' &&
                            recordset.val('报价审批') != ''
                        )
                            recordset.module.field_by_full_name(n + '.外销部门').disabled =
                            true
                    }
                    // if (cg == 1) {
                    //     recordset.module.field_by_full_name(n + '.报价结果').show()
                    //     recordset.module.field_by_full_name(n + '.报价审批').show()
                    //     if (recordset.val('报价审批') == '') recordset.module.field_by_full_name(n + '.报价审批').disabled = false
                    // }
                }
                // else {
                //     recordset.module.field_by_full_name(n + '.报价结果').show()
                //     recordset.module.field_by_full_name(n + '.报价审批').show()
                //     if (recordset.val('新旧报价') == '') {
                //         recordset.val('新旧报价', '旧');
                //     }
                //     recordset.module.field_by_full_name(n + '.采购单号').disabled = true
                //     recordset.module.field_by_full_name(n + '.报价结果').disabled = true
                //     recordset.module.field_by_full_name(n + '.外销部门').disabled = true

                //     if (recordset.val('报价审批') == '') {
                //         recordset.module.field_by_full_name(n + '.报价审批').disabled = false
                //     }
                //     if (d.flag1 == 0) {
                //         recordset.val('报价结果', '通过');
                //         recordset.module.field_by_full_name(n + '.业务人员').disabled = false
                //     }
                //     if (d.nblh == 1) {
                //         if (recordset.val('报价结果') == '通过') {
                //             recordset.module.field_by_full_name(n + '.外销部门').disabled = false
                //             recordset.module.field_by_full_name(n + '.业务人员').disabled = false
                //         }
                //     } else {
                //         if (d.msbz == 1) {
                //             if (recordset.val('报价结果') == '通过') {
                //                 recordset.module.field_by_full_name(n + '.外销部门').disabled = false
                //                 recordset.module.field_by_full_name(n + '.业务人员').disabled = false
                //             }
                //         }
                //     }
                // }
                if (recordset.val('审批结果') == '通过') {
                    recordset.module.field_by_full_name(n + '.外销部门').disabled = true
                    recordset.module.field_by_full_name(n + '.业务人员').disabled = true
                }
            } else {
                recordset.module.field_by_full_name(n + '.产品资料.报关单位').hide()

                // if (d.flag1 == 0) {
                //     recordset.val('报价结果', '通过');
                // } else {
                //     recordset.module.field_by_full_name(n + '.报价结果').show()
                //     recordset.module.field_by_full_name(n + '.报价审批').show()
                //     if (recordset.val('报价审批') == '') {
                //         recordset.module.field_by_full_name(n + '.报价审批').disabled = false
                //     }
                // }
                if (d.flag2 == 1 || _.user.admin) {
                    recordset.module.field_by_full_name(n + '.审批申请').show()
                    recordset.module.field_by_full_name(n + '.审批结果').show()
                    if (recordset.val('审批申请') == '') {
                        recordset.module.field_by_full_name(n + '.审批申请').disabled =
                            false
                    }
                }
                if (recordset.val('新旧报价') == '') {
                    recordset.val('新旧报价', '新')
                }

                if (recordset.val('业务人员') == '') {
                    recordset.val('业务人员', _.user.name)
                }

                if (recordset.val('外销部门') == '') {
                    recordset.val('外销部门', d.bm)
                }
            }
            if (recordset.val('审批申请') == 'zjnblh') {
                recordset.module.field_by_full_name(n + '.审批结果').show()
                recordset.module.field_by_full_name(n + '.审批申请').show()
                recordset.module.field_by_full_name(n + '.审批申请').disabled = true
                recordset.module.field_by_full_name(n + '.未批原因').show()
                recordset.module.field_by_full_name(n + '.审批结果').disabled = false
                recordset.module.field_by_full_name(n + '.未批原因').disabled = false
            }
            if (recordset.val('报价审批') == 'zjnblh' || d.zjl == 1) {
                // recordset.module.field_by_full_name(n + '.报价审批').show()
                // recordset.module.field_by_full_name(n + '.报价审批').disabled = true
                // recordset.module.field_by_full_name(n + '.报价结果').show()
                recordset.module.field_by_full_name(n + '.未批原因').show()
                // recordset.module.field_by_full_name(n + '.报价结果').disabled = false
                recordset.module.field_by_full_name(n + '.未批原因').disabled = false
            }

            // if (recordset.val('审批申请') != '' || recordset.val('报价审批') != '') {
            //     recordset.module.field_by_full_name(n + '.产品资料.产品图片').disabled =
            //         true
            // }
            if (recordset.val('报价单号') == '') {
                recordset.module.field_by_full_name(n + '.审批申请').disabled = true
                // recordset.module.field_by_full_name(n + '.报价审批').disabled = true
            }
            recordset.refresh_ui()
        })
        .catch((err) => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
}
_.evts.on([_.evtids.RECORD_LOAD], quotation_recordLoad, '客户报价')

// 编辑界面记录保存前执行
const quotation_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('唯一字段') == '')
            recordset.val('唯一字段', recordset.rid)
        if (recordset.val('报价日期') != '' && recordset.val('报价日期') != null) {
            let d1 = recordset.val('报价日期').substring(0, 4)
            let d2 = recordset.val('报价日期').substring(5, 7)
            recordset.val('起始年', d1)
            recordset.val('起始月', d2)
        }
        //考虑到采购报价取消，这段代码注销
        // if (recordset.val('报价结果') == '待审批' && recordset.val('报价审批') != '') {
        //     recordset.val('采购权限', '无');
        // }
        _.http
            .post('/api/saier/quotation/save/before', {
                bj_id: recordset.val('报价单号'),
                rid: recordset.rid,
                // bjry: recordset.val('报价人员'),
                xj_dh: recordset.val('询价单号'),
                spjg: recordset.val('审批结果'),
                // bjjg: recordset.val('报价结果'),
                spsq: recordset.val('审批申请'),
                // bjsp: recordset.val('报价审批'),
                kh_id: recordset.val('客户编号'),
                khmc: recordset.val('客户名称'),
                xjbj: recordset.val('新旧报价'),
                yw: recordset.val('业务'),
                ywry: recordset.val('业务人员'),
                bjly: recordset.val('报价来源'),
            })
            .then((res) => {
                let d = res.data
                if (d.cdsb == 1) {
                    _.ui.message.error('不好意思,业务撤单，不能保存')
                    reject()
                    return
                }
                // if (d.tjsb == 1) {
                //     _.ui.message.error('不好意思,业务撤单，不能保存22')
                //     reject()
                //     return
                // }
                // if ((d.tjsb == 1) && ((recordset.val('审批申请') != '') || (recordset.val('报价审批') != '')) && (recordset.val('审批申请') != _.user.username) && (recordset.val('报价审批') != _.user.username)) {
                if (
                    d.tjsb == 1 &&
                    recordset.val('审批申请') != '' &&
                    recordset.val('审批申请') != _.user.username
                ) {
                    _.ui.message.error('不好意思,已提交不能更改,谢谢!')
                    reject()
                    return
                }
                if (
                    d.wxl == 1 &&
                    (recordset.val('客户名称') == '' ||
                        recordset.val('客户编号') == '') &&
                    recordset.val('新旧报价') == '新'
                ) {
                    _.ui.message.error('不好意思,请先填写客户名称和客户编号,谢谢!')
                    reject()
                    return
                }
                if (d.msbz) {
                    recordset.val('是否免审', d.msbz)
                }
                if (recordset.val('报价单号') == '' && d.bj_id != '')
                    recordset.val('报价单号', d.bj_id)
                // if (recordset.val('报价审批识别') == '1') recordset.val('报价审批识别', _.user.username + new Date().format('yyyy-mm-dd hh:mm:ss'))
                // if (recordset.val('报价结果识别') == '1') recordset.val('报价结果识别', _.user.username + new Date().format('yyyy-mm-dd hh:mm:ss'))
                if (recordset.val('审批申请识别') == '1')
                    recordset.val(
                        '审批申请识别',
                        _.user.username + new Date().format('yyyy-mm-dd hh:mm:ss'),
                    )
                if (recordset.val('审批结果识别') == '1')
                    recordset.val(
                        '审批结果识别',
                        _.user.username + new Date().format('yyyy-mm-dd hh:mm:ss'),
                    )

                let bjly = recordset.val('报价来源')
                let kkmc = recordset.val('客户名称')
                let a2 = recordset.val('报价日期')
                let hr2 = recordset.val('贸易国别')
                let yj2 = recordset.val('所属地区')
                let wfgs2 = recordset.val('我方公司')
                let bjry2 = recordset.val('报价人员')
                // recordset.val('报价人员', bjry2);
                let bjdh = recordset.val('报价单号')
                let i = 0
                let t = recordset.tables['产品资料']
                let v = t.view_data
                let m = recordset.tables['修改记录']
                let c = m.view_data
                for (let r of v) {
                    i = i + 1
                    // r[recordset.module.field_by_full_name('客户报价.产品资料.报价PATH').db.name]=recordset.val('业务');
                    if (
                        recordset.val('强制更新') == '' &&
                        recordset.val('采购单号') == ''
                    ) {
                        let xdsb =
                            r[
                                recordset.module.field_by_full_name(
                                    '客户报价.产品资料.报价报价唯一字段',
                                ).db.name
                            ]
                        if (xdsb != '') {
                            let cgdj3 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.采购单价',
                                    ).db.name
                                ]
                            let cgdj2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.采购单价1',
                                    ).db.name
                                ]
                            let jg =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.外销单价',
                                    ).db.name
                                ]
                            let jg2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.外销单价1',
                                    ).db.name
                                ]
                            let htxs =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.箱    数',
                                    ).db.name
                                ]
                            let htxs2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.箱    数1',
                                    ).db.name
                                ]
                            let zhwbzh =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.中文包装',
                                    ).db.name
                                ]
                            let zhwbzh2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.中文包装1',
                                    ).db.name
                                ]
                            let bzhfsh =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.英文包装',
                                    ).db.name
                                ]
                            let bzhfsh2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.英文包装1',
                                    ).db.name
                                ]
                            let zxcgl =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.起 订 量',
                                    ).db.name
                                ]
                            let zxcgl2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.起 订 量1',
                                    ).db.name
                                ]
                            let xdsl =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.下单数量',
                                    ).db.name
                                ]
                            let xdsl2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.下单数量1',
                                    ).db.name
                                ]
                            let rmb =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.客户RMB单价',
                                    ).db.name
                                ]
                            let rmb2 =
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.RMB单价',
                                    ).db.name
                                ]
                            if (
                                cgdj3 != cgdj2 ||
                                jg != jg2 ||
                                htxs != htxs2 ||
                                zhwbzh != zhwbzh2 ||
                                bzhfsh != bzhfsh2 ||
                                zxcgl != zxcgl2 ||
                                xdsl != xdsl2 ||
                                rmb != rmb2
                            ) {
                                let l = {}
                                l.rid = _.utils.guid()
                                l.pid = recordset.val('rid')
                                l.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                                l.uid = _.user.rid
                                let cpbh =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.产品编号',
                                        ).db.name
                                    ]
                                let zwpm =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.中文品名',
                                        ).db.name
                                    ]
                                let ywpm =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.英文品名',
                                        ).db.name
                                    ]
                                let khhh =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.客户货号',
                                        ).db.name
                                    ]
                                let bjhh =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.专业货号',
                                        ).db.name
                                    ]
                                let zbhh =
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.自编货号',
                                        ).db.name
                                    ]
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.修改时间',
                                    ).db.name
                                ] = new Date().format('yyyy-MM-dd hh:mm:ss')
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.产品编号',
                                    ).db.name
                                ] = cpbh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.客户货号',
                                    ).db.name
                                ] = khhh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.专业货号',
                                    ).db.name
                                ] = bjhh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.自编货号',
                                    ).db.name
                                ] = zbhh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.中文品名',
                                    ).db.name
                                ] = zwpm
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.英文品名',
                                    ).db.name
                                ] = ywpm
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.采购单价',
                                    ).db.name
                                ] = cgdj3
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原采购单价',
                                    ).db.name
                                ] = cgdj2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.外销单价',
                                    ).db.name
                                ] = jg
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原外销单价',
                                    ).db.name
                                ] = jg2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.箱    数',
                                    ).db.name
                                ] = htxs
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原箱数',
                                    ).db.name
                                ] = htxs2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.中文包装',
                                    ).db.name
                                ] = zhwbzh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原中文包装',
                                    ).db.name
                                ] = zhwbzh2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.英文包装',
                                    ).db.name
                                ] = bzhfsh
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原英文包装',
                                    ).db.name
                                ] = bzhfsh2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.起 订 量',
                                    ).db.name
                                ] = zxcgl
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原起订量',
                                    ).db.name
                                ] = zxcgl2
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.下单数量',
                                    ).db.name
                                ] = xdsl
                                l[
                                    recordset.module.field_by_full_name(
                                        '客户报价.修改记录.原下单数量',
                                    ).db.name
                                ] = xdsl2
                                // l[recordset.module.field_by_full_name('客户报价.修改记录.RMB单价').db.name]= rmb;
                                // l[recordset.module.field_by_full_name('客户报价.修改记录.原RMB单价').db.name]= rmb2;
                                m.push_new_rid(l.rid)
                                c.push(l)
                            }
                        }
                    }
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.询价单号',
                        ).db.name
                    ] = recordset.val('询价单号')
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.外销部门',
                        ).db.name
                    ] = recordset.val('外销部门')
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.审批结果',
                        ).db.name
                    ] = recordset.val('审批结果')
                    if (
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.图片货号')
                            .db.name
                        ] == ''
                    ) {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.图片货号',
                            ).db.name
                        ] = _.user.username + new Date().format('yyyyMMdd hhmmss') + ';' + i
                    }
                    bjbjwyzd =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价报价唯一字段1',
                            ).db.name
                        ]
                    if (recordset.val('审批结果') != '通过') {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价通过',
                            ).db.name
                        ] = '否'
                    } else {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价通过',
                            ).db.name
                        ] = '是'
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.外销选中',
                            ).db.name
                        ] = '是'
                        if (
                            r[
                                recordset.module.field_by_full_name(
                                    '客户报价.产品资料.产品来源',
                                ).db.name
                            ] == ''
                        ) {
                            r[
                                recordset.module.field_by_full_name(
                                    '客户报价.产品资料.产品来源',
                                ).db.name
                            ] = '采购推荐'
                        }
                    }
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.货币代码',
                        ).db.name
                    ] = recordset.val('货币代码')
                    if (
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.专业货号')
                            .db.name
                        ] == ''
                    ) {
                        let yj =
                            r[
                                recordset.module.field_by_full_name(
                                    '客户报价.产品资料.自编货号',
                                ).db.name
                            ]
                        let bm =
                            r[
                                recordset.module.field_by_full_name('客户报价.产品资料.编码').db
                                .name
                            ]
                        let ls =
                            r[
                                recordset.module.field_by_full_name(
                                    '客户报价.产品资料.临时货号',
                                ).db.name
                            ]
                        if (bm == '') {
                            if (yj != '') {
                                r[
                                    recordset.module.field_by_full_name(
                                        '客户报价.产品资料.编码',
                                    ).db.name
                                ] = kkmc + yj + r.rid
                                if (ls == '') {
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.临时货号',
                                        ).db.name
                                    ] = kkmc + yj + r.rid
                                    r[
                                        recordset.module.field_by_full_name(
                                            '客户报价.产品资料.货号备注',
                                        ).db.name
                                    ] = kkmc + yj + r.rid
                                }
                            }
                        }
                    }
                    let tsl2 =
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.有效期限')
                            .db.name
                        ]
                    if (tsl2 == '') {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.有效期限',
                            ).db.name
                        ] = recordset.val('有效期限')
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.我方公司')
                            .db.name
                        ] == ''
                    ) {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.我方公司',
                            ).db.name
                        ] = wfgs2
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.采购人员')
                            .db.name
                        ] == '' ||
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.采购人员')
                            .db.name
                        ] == '20120803' ||
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.采购人员')
                            .db.name
                        ] == '卢洪云1'
                    ) {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.采购人员',
                            ).db.name
                        ] = bjry2
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价报价唯一字段',
                            ).db.name
                        ] == ''
                    ) {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价报价唯一字段',
                            ).db.name
                        ] = bjdh + new Date().format('yyyy-MM-dd hh:mm:ss') + ';' + i
                    }
                    if (
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.报价人员')
                            .db.name
                        ] == '' ||
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.报价人员')
                            .db.name
                        ] == '20120803' ||
                        r[
                            recordset.module.field_by_full_name('客户报价.产品资料.报价人员')
                            .db.name
                        ] == '卢洪云1'
                    ) {
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.报价人员',
                            ).db.name
                        ] = bjry2
                    }
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.报价日期',
                        ).db.name
                    ] = a2
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.贸易国别',
                        ).db.name
                    ] = hr2
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.所属地区',
                        ).db.name
                    ] = yj2
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.新旧报价',
                        ).db.name
                    ] = recordset.val('新旧报价')
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.下单识别1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.下单识别',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.下单数量1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.下单数量',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.起 订 量1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.起 订 量',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.箱    数1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.箱    数',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.外销单价1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.外销单价',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.采购单价1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.采购单价',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.英文包装1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.英文包装',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.中文包装1',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.中文包装',
                            ).db.name
                        ]
                    r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.RMB单价',
                            ).db.name
                        ] =
                        r[
                            recordset.module.field_by_full_name(
                                '客户报价.产品资料.客户RMB单价',
                            ).db.name
                        ]
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.客户名称',
                        ).db.name
                    ] = recordset.val('客户名称')
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.报价PATH',
                        ).db.name
                    ] = recordset.val('业务')
                    r[
                        recordset.module.field_by_full_name(
                            '客户报价.产品资料.报价来源',
                        ).db.name
                    ] = bjly
                    t.push_modi_rid(r.rid)
                }
                recordset.module.field_by_full_name('客户报价.审批申请').disabled =
                    false
                // recordset.module.field_by_full_name('客户报价.报价审批').disabled = false;
                t.sync_operate_data()
                t.modified = true
                m.sync_operate_data()
                m.modified = true
                resolve()
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
                reject()
            })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, quotation_before_save, '客户报价')

// 查询界面或编辑界面打开事件
const quotation_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        // btns.push({
        //     "name": 'record_trance_zs_btn',
        //     "caption": '专业转专属',
        //     "icon": 'any-function',
        //     "divided": true
        // });
    } else {
        btns.push({
            name: 'unclock_quottation_btn',
            caption: '解锁报价单号',
            icon: 'any-server-update',
            divided: true,
        })
    }
    btns.push({
        name: 'modify_apply_btn',
        caption: '改单申请',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'special_apply_btn',
        caption: '特殊改单申请',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'quotation_stats_btn',
        caption: '报价统计表',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'quotation_stats_b_btn',
        caption: '报价统计表（不按客户）',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'special_report_btn',
        caption: '特殊报表打印',
        icon: 'any-server-update',
        divided: true,
    })
    form.toolbar.insert(
        [{
            name: 'export_btn',
            caption: '扩展',
            icon: '#ext-add_database',
            btns: btns,
            divided: true,
        }, ],
        'close',
    )
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW],quotation_Form_Show,'客户报价')

const quotation_form_BtnClick = async(evt_id, btn, form) => {
    let recordset = form.recordset
    if (btn.name == 'bCopyFromExcel') {
        _.ui.show_dialog('copy_from_excel', {
            "rid": form.recordset.rid,
            "group_name": form.group.value.name,
            "run_fill": true,
        });
    }
    if (btn.name == 'unclock_quottation_btn') {
        // 考虑到采购报价取消，这段代码注销
        // if ((recordset.val('审批申请') == '') || (recordset.val('报价审批') == '')) {
        if (recordset.val('审批申请') == '' || recordset.val('报价审批') == '') {
            recordset.module.field_by_full_name('客户报价.报价单号').disabled = false
            recordset.module.field_by_full_name('客户报价.报价单号').readonly = false
        }
    }

    if (btn.name == 'items_source_btn') {
        let recordset = form.recordset
        let t = recordset.tables['产品资料']
        let v = t.view_data
        for (let r of v) {
            if (
                r[
                    recordset.module.field_by_full_name('客户报价.产品资料.产品来源').db
                    .name
                ] == ''
            )
                r[
                    recordset.module.field_by_full_name(
                        '客户报价.产品资料.产品来源',
                    ).db.name
                ] = recordset.val('产品来源')
            if (
                r[
                    recordset.module.field_by_full_name('客户报价.产品资料.有效期限').db
                    .name
                ] == '' ||
                r[
                    recordset.module.field_by_full_name('客户报价.产品资料.有效期限').db
                    .name
                ] == null
            )
                r[
                    recordset.module.field_by_full_name(
                        '客户报价.产品资料.有效期限',
                    ).db.name
                ] = recordset.val('有效期限')
            t.push_modi_rid(r.rid)
        }
        t.sync_operate_data()
        t.modified = true
    }
    if (btn.name == 'items_empty_btn') {
        let recordset = form.recordset
        let t = recordset.tables['产品资料']
        t.clear()
    }
    if (btn.name == 'barcode_input_btn') {
        _.ui.show_dialog('barcode_form', {
            rids: [form.current_rid],
        })
    }
    if (btn.name == 'import_photo_btn') {
        _.ui.show_dialog('photo_from_excel', {
            rid: form.current_rid,
            group: '客户报价.产品资料',
            option: 'append',
            kfield: 'bjhh',
            pfield: 'yytp',
        })
    }
    if (btn.name == 'modify_apply_btn') {
        _.http
            .post('/api/saier/quotation/get/status', {
                rid: form.current_rid.value,
                module: form.module.name,
            })
            .then((res) => {
                _.ui.show_input_dialog('请输入改单原因', '').then((val) => {
                    _.http
                        .post('/api/saier/quotation/modify/apply', {
                            val: val,
                            flag: 0,
                            module: form.module.name,
                            rid: form.current_rid.value,
                            key_field: '报价单号',
                            title: '客户报价:[报价单号] [客户名称]' + '需修改重新审批',
                            content: _.user.username +
                                '的客户报价:[报价单号]申请重新审批,原因:' +
                                val,
                            kind: '改单申请',
                        })
                        .then((r) => {
                            _.ui.message.success('改单申请已提交')
                        })
                        .catch((r) => {
                            console.log(r)
                            _.ui.message.error(r.msg)
                        })
                })
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'special_apply_btn') {
        _.http
            .post('/api/saier/quotation/get/status', {
                rid: form.current_rid.value,
                module: form.module.name,
            })
            .then((res) => {
                _.ui.show_input_dialog('请输入改单原因', '').then((val) => {
                    _.http
                        .post('/api/saier/quotation/modify/apply', {
                            val: val,
                            flag: 1,
                            module: form.module.name,
                            rid: form.current_rid.value,
                            key_field: '报价单号',
                            title: '客户报价:[报价单号] [客户名称]' + '需修改重新审批',
                            content: _.user.username +
                                '的客户报价:[报价单号]申请特殊改单,原因:' +
                                val,
                            kind: '改单申请',
                        })
                        .then((r) => {
                            _.ui.message.success('改单申请已提交')
                        })
                        .catch((r) => {
                            console.log(r)
                            _.ui.message.error(r.msg)
                        })
                })
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'items_update_btn') {
        if (recordset.val('适合市场') == '') {
            _.ui.message.error('不好意思,请先输入适合市场内容,谢谢')
            return
        }
        _.ui
            .confirm('专业产品更新会覆盖现有的专业产品数据，是否继续？')
            .then(() => {
                _.ui.show_loading_dialog('正在更新专业产品')
                _.http
                    .post('/api/saier/quotation/items/new', {
                        wfgs_n: form.recordset.val('我方公司'),
                        rid: form.recordset.rid,
                        shsc: form.recordset.val('适合市场'),
                        lines: form.recordset.tables['产品资料'].view_data,
                    })
                    .then((res) => {
                        _.ui.message.success('操作成功')
                    })
                    .catch((err) => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                    })
                    .finally(() => {
                        _.ui.hide_loading_dialog('正在更新专业产品')
                    })
            })
    }

    //  报价统计表
    if (btn.name == 'quotation_stats_btn') {
        _.ui.show_dialog('quotation_stats_dialog')
    }
    if (btn.name == 'quotation_stats_b_btn') {
        _.ui.show_dialog('Quotation_Station_Table')
    }
    if (btn.name == 'special_report_btn') {
        // 1. 发送请求获取 zm 列表
        _.http
            .post('/api/saier/quotation/special/get_list')
            .then((res) => {
                if (res.code === 1 && res.data.length > 0) {
                    // 2. 请求成功且有数据，弹出对话框并传参
                    _.ui.show_dialog('special_report_dialog', {
                        rid: form.current_rid.value, // 当前报价单ID
                        template_options: res.data, // 刚才查到的模板数组
                        default_zm: res.data[0], // 默认选中第一个
                    })
                } else {
                    _.ui.message.error(res.msg || '未找到可用的报表模板')
                }
            })
            .catch((err) => {
                console.error(err)
            })
    }
    if (btn.name == 'return_purchase_btn') {
        // 1. 发送请求获取 zm 列表
        if (recordset.val('审批结果') == '通过' || recordset.val('wf_status') == 1 || recordset.val('wf_status') == 2) {
            _.ui.message.error('审批通过或正在审批的客户报价不能退回')
            return
        }
        let thyy = await _.ui.show_input_dialog('请输入退回原因', '').then((val) => {
            if (val=='' || val==null) {
                _.ui.message.error('退回原因不能为空')
                return null
            }
            if (val.trim()=='' ) {
                _.ui.message.error('退回原因不能为空')
                return null
            }
            return val
        })
        if (!thyy) {
            _.ui.message.error('退回原因不能为空')
            return
        }
        _.http.post('/api/saier/quotation/items/return/purchase', {
            rid: form.recordset.rid,
            bj_id: recordset.val('产品资料.报价单号'),
            cgbjwyzd: recordset.val('产品资料.采购报价唯一字段'),
            bjwyzd: recordset.val('产品资料.报价唯一字段'),
            val: thyy,
            bjry: recordset.val('产品资料.报价人员'),
            bjbjsp: recordset.val('产品资料.报价报价审批')
        }).then((res) => {
            let t = recordset.tables['产品资料']
            let v = t.view_data
            let bjdh = recordset.val('产品资料.报价单号')
            for (let i=v.length - 1; i>=0; i--) {
                let r = v[i]
                if(r.bj_id == '' || r.bj_id == null) continue
                if (r.bj_id == bjdh) {
                    t.delete(r.rid)
                    v.splice(i, 1)
                }
            }
            t.sync_operate_data()
            t.modified = true
            recordset.do_re_sum_by_trigger_table('产品资料')
            recordset.save(false)
            _.ui.message.success('退回成功')
        }).catch((err) => {
            console.error(err)
            _.ui.message.error(err.msg || '退回失败')
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], quotation_form_BtnClick, '客户报价')

const quotation_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = []
        // btns.push({
        //     name: 'barcode_input_btn',
        //     caption: '条码输入',
        //     icon: 'any-server-update',
        // })
        btns.push({
            name: 'items_source_btn',
            caption: '刷产品来源',
            icon: 'any-server-update',
        })
        btns.push({
            name: 'items_empty_btn',
            caption: '清空',
            icon: 'any-server-update',
        })
        btns.push({
            name: 'import_photo_btn',
            caption: '导入图片',
            icon: 'any-server-update',
        })
        btns.push({
            name: 'items_update_btn',
            caption: '专业产品更新',
            icon: 'any-server-update',
        })
        btns.push({
            name: 'return_purchase_btn',
            caption: '退回当前报价',
            icon: 'any-server-update',
        })
        form.toolbar.add([{
            "name": 'bCopyFromExcel',
            "caption": '粘贴数据',
            "icon": 'any-server-update',
        }]);
        form.toolbar.add([{
            name: 'export_btn',
            caption: '扩展',
            icon: 'any-server-update',
            btns: btns,
        }, ])
        // form.toolbar.add([{
        //     "name": 'export_btn',
        //     "caption": '扩展',
        //     "icon": '#ext-add_database',
        //     "btns": btns,
        //     "divided": true
        // }], 'close');
    }
}
_.evts.on(
    [_.evtids.MODULE_EDITOR_GROUP_SHOW],
    quotation_EditorChildShow,
    '客户报价',
)

function quotation_table_new_after(evt_id, table, recordset, a, b) {
    console.log('a is ', a)
    console.log('b is ', b)
    if (table.group == '产品资料') {
        recordset.val('产品资料.图片货号', '')
        recordset.val('产品资料.报价报价唯一字段', recordset.val('rid'))
        if (recordset.val('产品资料.自编货号') == '') {
            recordset.val('产品资料.识别', '')
        }
        recordset.val('产品资料.图片货号', '')
        recordset.val('产品资料.佣金比率', recordset.val('佣金点数') / 100)
        recordset.val('产品资料.暗佣比率', recordset.val('暗佣点数') / 100)
    }
}
_.evts.on(
    [_.evtids.RECORD_TABLE_AFTER_NEW],
    quotation_table_new_after,
    '客户报价',
)

const workflow_before_cancel = (evt_id, module_name, record_id) => {
    return new Promise((resolve, reject) => {
        let modules = ['客户报价', '采购报价']
        if (modules.indexOf(module_name) == -1) {
            resolve()
            return
        }
        // if (_.user.roles.admin == true) {
        //     resolve()
        //     return;
        // }
        _.http
            .post('/api/saier/workflow/checked', {
                rid: record_id,
                module: module_name,
            })
            .then((res) => {
                resolve()
                return
            })
            .catch((res) => {
                reject(res.msg)
                return
            })
    })
}
_.evts.on(_.evtids.WORKFLOW_BEFORE_CANCEL, workflow_before_cancel)

function item_weight_check(net, gross) {
    if (net == '' || gross == '') {
        return true
    }
    if (isNaN(net) || isNaN(gross)) {
        return true
    }
    if (Number(net) > Number(gross)) {
        return false
    }
    return true
}

const quotation_after_save = (evt_id, recordset) => {
    if (recordset.val('审批申请') == '') return
    if (recordset.val('wf_status') == 0 || recordset.val('wf_status') == 3){
        _.http.post('/api/saier/workflow/start', {
            rid: recordset.val('rid'),
            module: recordset.module.name,
            flow_name: '客户报价',
        }).then((res) => {
            recordset.val('wf_status', 1)
            // _.platform.active.reload_data()
            _.platform.active.close()
        }).catch((res) => {
            _.ui.message.error(res.msg)
            console.log(res)
        })
    } else if (recordset.val('wf_status') == 1 && recordset.val('审批申请') == _.user.username) {
        console.log('审批人审批')
        if (recordset.val('审批结果') == '' || recordset.val('审批结果') == '待审批') {
            return
        }
        let status = 1
        let memo = ''
        if (recordset.val('审批结果') == '不通过') {
            status = 2
            memo = recordset.val('未批原因')
        }
        _.http.post('/api/saier/audit/save/after', {
            rid: recordset.val('rid'),
            module: recordset.module.name
        }).then(r => {
            console.log('审批保存结果', r)
            let instance = r.data.instance_rid
            let task_id = r.data.task_rid
            console.log('task_id ',task_id)
            console.log('instance ', instance)
            _.http.post('/api/workflow/task/flow', {
                instance: instance,
                status: status,
                task_id: task_id,
                memo: memo
            }).then(res => {
                _.platform.active.reload_data()
                // _.platform.active.close()
            }).catch((res) => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }).catch((e) => {
            console.log(e)
            _.ui.message.error(e.msg)
        })
    }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, quotation_after_save, '客户报价')

// const quotation_after_save = (evt_id, recordset) => {
//     if (recordset.val('wf_status') == 1 || recordset.val('wf_status') == 2) return
//     if (recordset.val('审批申请') == '') return
//     _.ui.confirm('是否提交审批？').then(() => {
//         _.http
//             .post('/api/saier/workflow/start', {
//                 rid: recordset.val('rid'),
//                 module: recordset.module.name,
//                 flow_name: '客户报价',
//             })
//             .then((res) => {
//                 recordset.val('wf_status', 1)
//                 _.platform.active.reload_data()
//             })
//             .catch((res) => {
//                 _.ui.message.error(res.msg)
//                 console.log(res)
//             })
//     })
// }
// _.evts.on(_.evtids.RECORD_AFTER_SAVE, quotation_after_save, '客户报价')