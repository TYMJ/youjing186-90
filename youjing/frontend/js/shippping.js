// 编辑界面字段change后执行
const shipping_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts
    let username = _.user.username
    let m = module.name
    let row = current_record
    if (field.full_name == m + '.是否新客' || field.full_name == '新客时间') {
        if (
            recordset.val('是否新客') == '是' &&
            (recordset.val('新客时间') == '' || recordset.val('新客时间') == null)
        ) {
            recordset.val('新客时间', new Date().format('yyyy-MM-dd'))
        }
    }
    if (field.full_name == m + '.出运单号' && value != '') {
        if (recordset.val('制单人员') == '') recordset.val('制单人员', username)
        let shipmentNo = recordset.val('出运单号').trim()
        let lastChar = shipmentNo.charAt(shipmentNo.length - 1).toUpperCase()
        if (lastChar >= 'A' && lastChar <= 'S') {
            _.ui.message.error('出运单号最后位不能为字符请检查后输入！')
            recordset.val('出运单号', '')
        } else {
            if (recordset.val('出运单号') != recordset.val('外销发票'))
                recordset.val('外销发票', value)
        }
        _.http
            .post('/api/saier/shipping/cydh/change', {
                zdry: recordset.val('制单人员'),
            })
            .then((res) => {
                let d = res.data
                if (d) {
                    recordset.val('业务', d.path)
                    recordset.val('出运审核', d.cysh)
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.风控确认' && value != '待审批') {
        if (
            recordset.val('是否新客') == '新客新出' ||
            recordset.val('是否新客') == '老客新出'
        ) {
            _.ui.message.error('请注意是否新客不能为新客新出或老客新出')
            recordset.val('风控确认', '待审批')
        } else {
            recordset.val('风控确认1', recordset.val('风控确认'))
            if (recordset.val('风控确认') == '通过') {
                if (recordset.val('单证人员') == '') {
                    recordset.module.field_by_full_name(m + '.风控审单').disabled = false
                    recordset.module.field_by_full_name(m + '.风控单证').disabled = false
                }
            } else {
                recordset.module.field_by_full_name(m + '.风控审单').disabled = true
                recordset.module.field_by_full_name(m + '.风控单证').disabled = true
            }
        }
    }
    if (field.full_name == m + '.产品资料.出货箱数') {
        if (
            recordset.value('产品资料.是否拼箱', row) != '是' &&
            recordset.value('产品资料.出货箱数', row) > 0 &&
            recordset.value('产品资料.外箱容量', row) > 0
        ) {
            if (
                recordset.value('产品资料.外箱容量', row) *
                recordset.value('产品资料.出货箱数', row) !==
                recordset.value('产品资料.出货数量', row)
            ) {
                recordset.val(
                    '产品资料.出货数量',
                    recordset.value('产品资料.外箱容量', row) *
                    recordset.value('产品资料.出货箱数', row),
                    row,
                )
            }
        }
    }
    if (
        field.full_name == m + '.产品资料.包装长度' ||
        field.full_name == m + '.产品资料.包装宽度' ||
        field.full_name == m + '.产品资料.包装高度'
    ) {
        let bzcd = recordset.value('产品资料.包装长度', row)
        let bzkd = recordset.value('产品资料.包装宽度', row)
        let bzgd = recordset.value('产品资料.包装高度', row)
        let bztj = (bzcd * bzkd * bzgd) / 1000000
        if (bztj != 0) {
            recordset.val('产品资料.外箱体积', round(bztj, 3), row)
            if (recordset.value('产品资料.外箱体积', row) < 0.001) {
                recordset.val('产品资料.外箱体积', '0.001', row)
            }
        }
    }
    if (
        field.full_name == m + '.产品资料.客户货号' ||
        field.full_name == m + '.产品资料.专业货号'
    ) {
        let khhh = recordset.value('产品资料.客户货号', row)
        let zyhh = recordset.value('产品资料.专业货号', row)
        if (khhh != '') {
            recordset.val('产品资料.产品货号1', khhh.trim(), row)
        } else if (zyhh != '') {
            recordset.val('产品资料.产品货号1', zyhh.trim(), row)
        }
    }
    if (
        field.full_name == m + '.产品资料.毛    重' ||
        field.full_name == m + '.产品资料.出货箱数'
    ) {
        if (recordset.value('产品资料.是否拼箱', row) != '是') {
            if (
                recordset.value('产品资料.毛    重', row) > 0 &&
                recordset.value('产品资料.出货箱数', row) > 0
            ) {
                recordset.val(
                    '产品资料.总 毛 重',
                    (recordset.value('产品资料.出货箱数', row) *
                        recordset.value('产品资料.毛    重', row)),
                    row,
                )
            } else {
                recordset.val('产品资料.总 毛 重', 0, row)
            }
        } else {
            recordset.val('产品资料.总 毛 重', 0, row)
        }
    }
    if (
        field.full_name == m + '.产品资料.净    重' ||
        field.full_name == m + '.产品资料.出货箱数'
    ) {
        if (recordset.value('产品资料.是否拼箱', row) != '是') {
            if (
                recordset.value('产品资料.净    重', row) > 0 &&
                recordset.value('产品资料.出货箱数', row) > 0
            ) {
                recordset.val(
                    '产品资料.总 净 重',
                    (recordset.value('产品资料.出货箱数', row) *
                        recordset.value('产品资料.净    重', row)),
                    row,
                )
            } else {
                recordset.val('产品资料.总 净 重', 0, row)
            }
        } else {
            recordset.val('产品资料.总 净 重', 0, row)
        }
    }
    if (field.full_name == m + '.产品资料.采购总价') {
        if (recordset.value('产品资料.增值税率', row) == 3) {
            recordset.val('产品资料.退 税 率', 3, row)
        }
        if (recordset.value('产品资料.增值税率', row) == 0) {
            recordset.val('产品资料.退 税 率', 0, row)
        }
        let zzsl = recordset.value('产品资料.增值税率', row)
        if (recordset.value('产品资料.退 税 率', row) == 3) {
            zzsl = 3
        }
        let zzsl1 = 1 + zzsl / 100
        if (zzsl !== 0 && recordset.value('产品资料.退 税 率', row) !== 0) {
            if (recordset.value('产品资料.退 税 率', row) == 1) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / 1.01) * 0.01, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 0) {
                recordset.val('产品资料.退税金额', 0, row)
            }
            if (recordset.value('产品资料.退 税 率', row) == 6) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.06, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 4) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / 1.04) * 0.04, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 13) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.13, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 11) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.11, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 9) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.09, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 14) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.14, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 5) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.05, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 3) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / 1.03) * 0.03, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 8) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.08, 2),
                    row,
                )
            }
            if (recordset.value('产品资料.退 税 率', row) == 15) {
                recordset.val(
                    '产品资料.退税金额',
                    round((recordset.value('产品资料.采购总价', row) / zzsl1) * 0.15, 2),
                    row,
                )
            }
        } else {
            recordset.val('产品资料.退税金额', '0', row)
        }
    }
    if (
        field.full_name == m + '.产品资料.店铺名称' ||
        field.full_name == m + '.产品资料.爱马士国家'
    ) {
        if (
            recordset.value('产品资料.店铺名称', row) == '' ||
            recordset.value('产品资料.爱马士国家', row) == ''
        ) {
            if (recordset.value('产品资料.店铺名称', row) == '') {
                recordset.val('产品资料.爱马士国家', '', row)
            }
            recordset.val('产品资料.店铺id', '', row)
            recordset.val('产品资料.市场id', '', row)
        }
    }
    if (field.full_name == m + '.产品资料.货 源 地') {
        if (
            recordset.value('产品资料.货 源 地', row) != '' &&
            (recordset.value('产品资料.货 源 地', row).indexOf('其他') != -1 ||
                recordset.value('产品资料.货 源 地', row).indexOf('其它') != -1)
        ) {
            _.ui.message.error('请注意货源地中不能包含其他或其它')
            recordset.val('产品资料.货 源 地', '', row)
        }
    }
    if (field.full_name == m + '.产品资料.出货数量') {
        if (
            recordset.value('产品资料.出货数量', row) == 0 &&
            recordset.value('产品资料.专业货号', row) != ''
        ) {
            recordset.val('产品资料.出货识别', '无', row)
        } else {
            recordset.val('产品资料.出货识别', '有', row)
        }
    }
    if (
        (field.full_name == m + '.产品资料.采购人员' ||
            field.full_name == m + '.产品资料.业务人员') &&
        value != ''
    ) {
        _.http
            .post('/api/saier/shipping/user/change', {
                username: value,
            })
            .then((res) => {
                let d = res.data
                if (field.full_name == m + '.产品资料.采购人员') {
                    recordset.val('产品资料.采购部门', d.bm, row)
                    recordset.val('产品资料.采购path', d.path, row)
                } else {
                    recordset.val('产品资料.外销部门', d.bm, row)
                    recordset.val('产品资料.业务path', d.path, row)
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.产品资料.专业货号') {
        if (value != '' && value != null) {
            _.http
                .post('/api/saier/shipping/zyhh/change', {
                    cpbh: value,
                })
                .then((res) => {
                    let d = res.data
                    if (d) {
                        if (d.wypp != '' && d.wypp != null) {
                            recordset.val('产品资料.外语品名', d.wypp, row)
                        }
                        recordset.val('产品资料.单据品名英', d.djpmy, row)
                        recordset.val('产品资料.单据品名外', d.djpmw, row)
                        recordset.val('产品资料.单据品名', d.djpm, row)
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
        recordset.val('产品资料.货号备注', value, row)
    }
    if (field.full_name == m + '.产品资料.采购合同') {
        if (value != '' && value != null) {
            _.http
                .post('/api/saier/shipping/cght/change', {
                    hthm: value,
                })
                .then((res) => {
                    let d = res.data
                    if (d && d.fktt != '' && d.fktt != null) {
                        recordset.val('产品资料.付款抬头', d.fktt, row)
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    if (field.full_name == m + '.产品资料.海关编码') {
        if (value != '' && value != null) {
            _.http
                .post('/api/saier/shipping/hgbm/change', {
                    hgbm: value,
                })
                .then((res) => {
                    let d = res.data
                    recordset.val('产品资料.禁止报关识别', d, row)
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    let fields = [
        m + '.产品资料.佣金比率',
        m + '.产品资料.佣金单价',
        m + '.产品资料.外销总价',
        m + '.产品资料.客户RMB总价',
        m + '.产品资料.暗佣比率',
        m + '.产品资料.暗佣单价',
    ]
    if (fields.indexOf(field.full_name) !== -1) {
        if (value != '' && value != null) {
            _.http
                .post('/api/saier/shipping/yjbl/change', {
                    khmc: recordset.val('客户名称'),
                })
                .then((res) => {
                    let d = res.data
                    if (recordset.val('RMB客户') != '是') {
                        if (recordset.value('产品资料.暗佣比率', row) > 0 && d != 1) {
                            recordset.val(
                                '产品资料.暗佣佣金',
                                Math.floor(
                                    recordset.value('产品资料.暗佣比率', row) *
                                    recordset.value('产品资料.外销总价', row) *
                                    1000,
                                ) / 1000,
                                row,
                            )
                        } else {
                            if (recordset.value('产品资料.暗佣单价', row) > 0) {
                                recordset.val(
                                    '产品资料.暗佣佣金',
                                    Math.floor(
                                        recordset.value('产品资料.暗佣单价', row) *
                                        recordset.value('产品资料.出货数量', row) *
                                        1000,
                                    ) / 1000,
                                    row,
                                )
                            } else {
                                recordset.val('产品资料.暗佣佣金', 0, row)
                            }
                        }
                        if (recordset.value('产品资料.佣金比率', row) > 0 && d != 1) {
                            recordset.val(
                                '产品资料.佣    金',
                                Math.floor(
                                    recordset.value('产品资料.佣金比率', row) *
                                    recordset.value('产品资料.外销总价', row) *
                                    1000,
                                ) / 1000,
                                row,
                            )
                        } else {
                            if (recordset.value('产品资料.佣金单价', row) > 0) {
                                recordset.val(
                                    '产品资料.佣    金',
                                    Math.floor(
                                        recordset.value('产品资料.佣金单价', row) *
                                        recordset.value('产品资料.出货数量', row) *
                                        1000,
                                    ) / 1000,
                                    row,
                                )
                            } else {
                                recordset.val('产品资料.佣    金', 0, row)
                            }
                        }
                    } else {
                        if (recordset.value('产品资料.暗佣比率', row) > 0 && d != 1) {
                            recordset.val(
                                '产品资料.暗佣佣金',
                                Math.floor(
                                    recordset.value('产品资料.暗佣比率', row) *
                                    recordset.value('产品资料.客户RMB总价', row) *
                                    1000,
                                ) / 1000,
                                row,
                            )
                        } else {
                            if (recordset.value('产品资料.暗佣单价', row) > 0) {
                                recordset.val(
                                    '产品资料.暗佣佣金',
                                    Math.floor(
                                        recordset.value('产品资料.暗佣单价', row) *
                                        recordset.value('产品资料.出货数量', row) *
                                        1000,
                                    ) / 1000,
                                    row,
                                )
                            } else {
                                recordset.val('产品资料.暗佣佣金', 0, row)
                            }
                        }
                        if (recordset.value('产品资料.佣金比率', row) > 0 && d != 1) {
                            recordset.val(
                                '产品资料.佣    金',
                                Math.floor(
                                    recordset.value('产品资料.佣金比率', row) *
                                    recordset.value('产品资料.客户RMB总价', row) *
                                    1000,
                                ) / 1000,
                                row,
                            )
                        } else {
                            if (recordset.value('产品资料.佣金单价', row) > 0) {
                                recordset.val(
                                    '产品资料.佣    金',
                                    Math.floor(
                                        recordset.value('产品资料.佣金单价', row) *
                                        recordset.value('产品资料.出货数量', row) *
                                        1000,
                                    ) / 1000,
                                    row,
                                )
                            } else {
                                recordset.val('产品资料.佣    金', 0, row)
                            }
                        }
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    if (field.full_name == m + '.产品资料.赠送' && value != '') {
        if (
            recordset.value('产品资料.赠送', row) == '是' ||
            recordset.value('产品资料.赠送', row) == '工厂' ||
            recordset.value('产品资料.赠送', row) == '客人'
        ) {
            if (recordset.value('单证确认', row) == '再审') {
                recordset.val('产品资料.是否改单', '是', row)
            }
            recordset.val(
                '产品资料.外销唯一字段2',
                recordset.value('产品资料.外销唯一字段', row),
                row,
            )
            recordset.val(
                '产品资料.唯一字段2',
                recordset.value('产品资料.唯一字段', row),
                row,
            )
            if (
                recordset.value('产品资料.赠送', row) == '是' ||
                recordset.value('产品资料.赠送', row) == '工厂'
            ) {
                recordset.val('产品资料.唯一字段', '', row)
                recordset.val(
                    '产品资料.采购合同',
                    recordset.value('产品资料.采购合同', row) + '赠送',
                    row,
                )
                recordset.val('产品资料.采购单价', 0, row)
            }
            if (
                recordset.value('产品资料.赠送', row) == '是' ||
                recordset.value('产品资料.赠送', row) == '客人'
            ) {
                recordset.val('产品资料.外销唯一字段', '', row)
                recordset.val(
                    '产品资料.外销合同',
                    recordset.value('产品资料.外销合同', row) + '赠送',
                    row,
                )
                recordset.val('产品资料.外销单价', 0, row)
                recordset.val('产品资料.赔款单价', 0, row)
                recordset.val('产品资料.客户RMB单价', 0, row)
                recordset.val('产品资料.赔款RMB', 0, row)
                recordset.val('产品资料.佣金比率', 0, row)
                recordset.val('产品资料.佣金单价', 0, row)
                recordset.val('产品资料.佣    金', 0, row)
                recordset.val('产品资料.暗佣比率', 0, row)
                recordset.val('产品资料.暗佣单价', 0, row)
                recordset.val('产品资料.暗佣佣金', 0, row)
            }
            _.ui
                .show_input_select_dialog('请输确认是否报关:', '否', ['否', '是'])
                .then((val) => {
                    if (val == '否') {
                        recordset.val('产品资料.中文报关品名', '无', row)
                        recordset.val('产品资料.增值税率', 0, row)
                        recordset.val('产品资料.开票工厂', '', row)
                        recordset.val('产品资料.退 税 率', 0, row)
                        recordset.val('产品资料.货 源 地', '', row)
                        recordset.val('产品资料.开票点数', 0, row)
                        recordset.val('产品资料.组织机构代码', '', row)
                        recordset.val('产品资料.开票联系人', '', row)
                        recordset.val('产品资料.开票电话', '', row)
                    }
                })
        } else {
            if (recordset.value('产品资料.赠送', row) == '单报关') {
                recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled =
                    false
                recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
                    false
                recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
                    false
                recordset.module.field_by_full_name(
                    m + '.产品资料.客户RMB单价',
                ).disabled = false
            } else if (recordset.value('产品资料.赠送', row) == '否') {
                if (recordset.value('单证确认') == '再审') {
                    recordset.val('产品资料.是否改单', '是', row)
                }
                if (recordset.value('产品资料.外销唯一字段2', row) != '') {
                    recordset.val(
                        '产品资料.外销唯一字段',
                        recordset.value('产品资料.外销唯一字段2', row),
                        row,
                    )
                }
                if (recordset.value('产品资料.唯一字段2', row) != '') {
                    recordset.val(
                        '产品资料.唯一字段',
                        recordset.value('产品资料.唯一字段2', row),
                        row,
                    )
                }
                recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.采购总价').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.外销总价').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.客户RMB总价',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
                    true
                _.http
                    .post('/api/saier/shipping/zs/change', {
                        wyzd: recordset.value('产品资料.唯一字段', row),
                        wxwyzd: recordset.value('产品资料.外销唯一字段', row),
                        zs: value,
                    })
                    .then((res) => {
                        let d = res.data
                        let cg_data = d.cg_data
                        let wx_data = d.wx_data
                        if (cg_data) {
                            recordset.val('产品资料.采购单价', cg_data.cgjg, row)
                            recordset.val('产品资料.采购合同', cg_data.hthm, row)
                            recordset.val('产品资料.中文报关品名', cg_data.zhwbgpm, row)
                            recordset.val('产品资料.增值税率', cg_data.zzsl, row)
                            recordset.val('产品资料.开票工厂', cg_data.kpgc, row)
                            recordset.val('产品资料.退 税 率', cg_data.sl, row)
                            recordset.val('产品资料.货 源 地', cg_data.hyd, row)
                            recordset.val('产品资料.开票点数', cg_data.ljrk, row)
                            recordset.val('产品资料.组织机构代码', cg_data.zzjgdm, row)
                            recordset.val('产品资料.开票联系人', cg_data.kplxr, row)
                            recordset.val('产品资料.开票电话', cg_data.kpdh, row)
                        }
                        if (wx_data) {
                            recordset.val('产品资料.外销单价', wx_data.wxdj, row)
                            recordset.val('产品资料.赔款单价', wx_data.Twxdj, row)
                            recordset.val('产品资料.客户RMB单价', wx_data.mjdj1, row)
                            recordset.val('产品资料.赔款RMB', wx_data.pkRMB, row)
                            recordset.val('产品资料.外销合同', wx_data.order_id, row)
                        }
                    })
                    .catch((err) => {
                        _.ui.message.error(err.msg)
                        console.error(err)
                    })
            }
        }
    }
    if (field.full_name == m + '.产品资料.出货数量') {
        if (recordset.value('产品资料.出货数量', row) > 0) {
            if (recordset.value('产品资料.出运唯一字段', row) == '') {
                recordset.val(
                    '产品资料.出运唯一字段',
                    recordset.value('产品资料.rid', row),
                    row,
                )
            }
            _.http
                .post('/api/saier/shipping/chsl/change', {
                    hthm: recordset.value('产品资料.采购合同', row),
                    cpbh: recordset.value('产品资料.专业货号', row),
                    wyzd: recordset.value('产品资料.唯一字段', row),
                    cywyzd: recordset.value('产品资料.出运唯一字段', row),
                    rid: recordset.value('产品资料.rid', row),
                })
                .then((res) => {
                    let d = res.data
                    let cgsl = 0
                    let jhhj = recordset.value('产品资料.出货数量', row)
                    let yjhs = 0
                    let cysl = 0
                    if (d) {
                        console.log(d)
                        if (d.cgsl != null && d.cgsl != 0) {
                            cgsl = Number(d.cgsl)
                        }
                        if (d.cysl != null && d.cysl != 0) {
                            cysl = Number(d.cysl)
                        }
                        if (d.yjhs != null && d.yjhs != 0) {
                            jhhj = jhhj + Number(d.yjhs)
                            yjhs = Number(d.yjhs)
                        }
                    }
                    if (
                        cgsl - jhhj >= 0 &&
                        recordset.value('产品资料.出货数量', row) > 0
                    ) {
                        // console.log('拼箱不计算箱数 bbbbb');
                        recordset.val('产品资料.剩余数量', cgsl - jhhj, row)
                    } else {
                        // console.log('拼箱不计算箱数 00000');
                        if (
                            cgsl - jhhj >= 0 &&
                            recordset.value('产品资料.出货数量', row) == 0
                        ) {
                            recordset.val('产品资料.出货数量', cgsl - jhhj, row)
                            recordset.val('产品资料.剩余数量', 0, row)
                        }
                        if (cgsl - jhhj <= 0) {
                            recordset.val('产品资料.出货数量', cgsl - yjhs, row)
                            recordset.val('产品资料.剩余数量', 0, row)
                        }
                    }
                    // let sysl = recordset.val('产品资料.剩余数量');
                    recordset.val('产品资料.实际出运余数', cgsl - cysl, row)
                    recordset.val('产品资料.webpd', '是', row)
                    if (recordset.value('产品资料.是否拼箱', row) != '是') {
                        if (
                            recordset.value('产品资料.出货数量', row) > 0 &&
                            recordset.value('产品资料.外箱容量', row) > 0
                        ) {
                            recordset.val(
                                '产品资料.出货箱数',
                                Math.ceil(
                                    recordset.value('产品资料.出货数量', row) /
                                    recordset.value('产品资料.外箱容量', row)
                                ),
                                row
                            )
                            // console.log('计算箱数 sss :', Math.ceil(
                            //         recordset.value('产品资料.出货数量', row) /
                            //         recordset.value('产品资料.外箱容量', row)
                            //     ))
                        } else {
                            // if (recordset.value('产品资料.出货数量', row) == 0) {
                            //     recordset.val('产品资料.出货箱数', 0, row);
                            // } else {
                            //     if (recordset.value('产品资料.出货数量', row) < 0) {
                            //         recordset.val('产品资料.出货箱数', 0, row);
                            //     } else {
                            recordset.val('产品资料.出货箱数', 0, row)
                            console.log('拼箱不计算箱数 aaaaa')
                            // }
                            // }
                        }
                    } else {
                        recordset.val('产品资料.出货数量', 0, row)
                        recordset.val('产品资料.出货箱数', 0, row)
                        console.log('拼箱不计算箱数 cccc')
                    }
                    if (
                        recordset.value('产品资料.出货数量', row) > 0 &&
                        recordset.value('产品资料.合同数量', row) == 0 &&
                        recordset.value('产品资料.采购数量', row) == 0
                    ) {
                        recordset.val(
                            '产品资料.合同数量',
                            recordset.value('产品资料.出货数量', row),
                            row,
                        )
                        recordset.val(
                            '产品资料.采购数量',
                            recordset.value('产品资料.出货数量', row),
                            row
                        )
                        if (
                            recordset.value('产品资料.外箱容量', row) > 1 &&
                            recordset.value('产品资料.箱    数', row) == 0
                        ) {
                            recordset.val(
                                '产品资料.箱    数',
                                recordset.value('产品资料.合同数量', row) /
                                recordset.value('产品资料.外箱容量', row),
                                row
                            )
                            console.log('拼箱不计算箱数 bbbb')
                        }
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        } else {
            recordset.val('产品资料.出货箱数', 0, row)
            console.log('拼箱不计算箱数 dddd')
        }
    }

    if (field.full_name == m + '.产品资料.唯一字段' && value != '') {
        if (recordset.value('产品资料.出运唯一字段', row) == '') {
            recordset.val(
                '产品资料.出运唯一字段',
                recordset.value('产品资料.rid', row),
                row,
            )
        }
        _.http
            .post('/api/saier/shipping/wyzd/change', {
                hthm: recordset.value('产品资料.采购合同', row),
                // cpbh: recordset.value('产品资料.专业货号', row),
                wyzd: recordset.value('产品资料.唯一字段', row),
                cywyzd: recordset.value('产品资料.出运唯一字段', row),
            })
            .then((res) => {
                let d = res.data
                let cgsl = 0
                let yjhs = 0
                let jhsl = recordset.value('产品资料.出货数量', row)
                // let chsl = recordset.value('产品资料.出货数量', row)
                let cysl = 0
                if (d) {
                    if (d.cgsl != null && d.cgsl != '') {
                        cgsl = Number(d.cgsl)
                    }
                    if (d.yjhs != null && d.yjhs != '') {
                        yjhs = Number(d.yjhs)
                    }
                    // if (d.jhsl != null && d.jhsl != '') {
                    //     jhhj = jhhj + Number(d.jhsl)
                    // }
                }
                if (
                    cgsl - jhsl - yjhs >= 0 &&
                    recordset.value('产品资料.出货数量', row) > 0
                ) {
                    // recordset.val('产品资料.剩余数量', cgsl - jhsl - chsl);
                } else {
                    if (
                        cgsl - jhsl - yjhs >= 0 &&
                        recordset.value('产品资料.出货数量', row) == 0
                    ) {
                        recordset.val('产品资料.出货数量', cgsl - jhsl - yjhs, row)
                        // recordset.val('产品资料.剩余数量', 0);
                    }
                    if (cgsl - jhsl - yjhs <= 0) {
                        recordset.val('产品资料.出货数量', cgsl - jhsl, row)
                        // recordset.val('产品资料.剩余数量', 0);
                    }
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.产品资料.替换合同') {
        _.http
            .post('/api/saier/shipping/thht/change', {
                thht: recordset.value('产品资料.替换合同', row),
                wyzd: recordset.value('产品资料.唯一字段', row),
                fphm: recordset.value('外销发票'),
                rid: recordset.value('产品资料.rid', row),
            })
            .then((res) => {})
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    fields = [
        m + '.补报信息.发票号码',
        m + '.补报信息.产品编号',
        m + '.补报信息.采购合同',
        m + '.补报信息.出运唯一字段',
        m + '.补报信息.外销唯一字段',
    ]
    if (fields.indexOf(field.full_name) !== -1) {
        _.http
            .post('/api/saier/shipping/bbxx/change', {
                cghth: recordset.value('补报信息.采购合同', row),
                wxwyzd: recordset.value('补报信息.外销唯一字段', row),
                cywyzd: recordset.value('补报信息.出运唯一字段', row),
                cpbh: recordset.value('补报信息.产品编号', row),
                fphm: recordset.value('补报信息.发票号码', row),
                wxfp: recordset.value('外销发票'),
            })
            .then((res) => {})
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.是否有敏感产品') {
        if (value == '是') {
            _.ui.message_box({
                title: '敏感产品提示',
                message: _.vue.h(
                    'pre', {
                        style: 'font-weight:500;line-height:20px',
                    },
                    '①.如有电池/疑似危险品，请上传MSDS和运输鉴定书；\n②.如有危险品，请按危险品流程操作;',
                ),
            })
        }
    }
    if (field.full_name == m + '.目的口岸' && value != '') {
        if (
            !(
                recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1 ||
                recordset.val('外销发票').toUpperCase().indexOf('AMZ') != -1
            )
        ) {
            _.http
                .post('/api/saier/shipping/mdka/change', {
                    kamc: recordset.val('目的口岸'),
                })
                .then((res) => {})
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                    recordset.val('目的口岸', '')
                })
        }
    }
    if (field.full_name == m + '.已收定金' && value > 0.1) {
        let t = recordset.tables['产品资料']
        let lines = t.view_data
        _.http
            .post('/api/saier/shipping/ysdj/change', {
                fphm: recordset.val('外销发票'),
                cydh: recordset.val('出运单号'),
                lines: lines,
            })
            .then((res) => {
                let sydje = res.data
                recordset.val('定金预测', sydje)
                if (recordset.val('已收定金') > Number(sydje) + 300) {
                    _.ui.message.error('已收定金>定金预测+300,请和财务确认定金是否到账')
                    recordset.val('已收定金', 0)
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.LC信保') {
        _.http
            .post('/api/saier/shipping/lcxb/change', {
                khmc: recordset.val('客户名称'),
                lcxb: recordset.val('LC信保'),
            })
            .then((res) => {
                let d = res.data
                recordset.val('信保费率', d)
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.是否信保') {
        _.http
            .post('/api/saier/shipping/sfxb/change', {
                khmc: recordset.val('客户名称'),
                sfxb: recordset.val('是否信保'),
            })
            .then((res) => {
                let d = res.data
                recordset.val('信保费率', d.xbfl)
                if (d.flag == 1) {
                    recordset.module.field_by_full_name(m + '.LC信保').disabled = false
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }

    if (field.full_name == m + '.合同号码' && value != '') {
        _.http
            .post('/api/saier/shipping/wxht/change', {
                order_id: recordset.val('合同号码'),
            })
            .then((res) => {
                let d = res.data
                if (d) {
                    recordset.val('所属地区', d.ssdq)
                    recordset.val('货柜类型', d.hglx)
                    recordset.val('货柜容积', d.hgcc)
                    recordset.val('可否转运', d.kfzy)
                    recordset.val('可否分批', d.kffp)
                    recordset.val('价格条款', d.jgtk)
                    if (d.jhfs !== '') {
                        recordset.val('结汇方式', d.jhfs)
                    }
                    recordset.val('客户合同', d.dforder_id)
                    recordset.val('货币代码', d.hbdm)
                    recordset.val('客户名称', d.customer)
                    recordset.val('运输方式', d.ysfs)
                    recordset.val('出运口岸', d.cyka)
                    recordset.val('我方公司', d.wfgs)
                    recordset.val('目的口岸', d.mdka)
                    recordset.val('目的仓库', d.mdka)
                    recordset.val('业务人员1', d.ywry)
                    recordset.val('唛    头', d.mt)
                    recordset.val('客户编号', d.kh_id)
                    recordset.val('合同备注', d.htbz)
                    recordset.val('装柜备注', d.zgbz)
                    recordset.val('贸易国别', d.country)
                    recordset.val('预计船期', d.yjcq)
                    recordset.val('RMB客户', d.khpd)
                    recordset.val('所有合同', recordset.val('合同号码'))
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.外销发票' && value != '') {
        if (
            recordset.val('外销发票') != '' &&
            recordset.val('外销发票') != recordset.val('出运单号')
        ) {
            recordset.val('出运单号', recordset.val('外销发票'))
        }
        _.http
            .post('/api/saier/shipping/wxfp/change', {
                fphm: recordset.val('外销发票'),
            })
            .then((res) => {
                let d = res.data
                if (d) {
                    if (
                        recordset.val('外销发票') != '' &&
                        recordset.val('外销发票') == recordset.val('出运单号')
                    ) {
                        if (d.ysdj) recordset.val('定金预测', d.ysdj)
                        recordset.module.field_by_full_name(m + '.已收定金').disabled =
                            false
                        if (recordset.val('进仓合同') == '' && d.SNID) {
                            recordset.val('进仓合同', d.SNID)
                        }
                        if (
                            (recordset.val('装柜日期') == '' ||
                                recordset.val('装柜日期') == null) &&
                            d.StuffingDate
                        ) {
                            recordset.val('装柜日期', d.StuffingDate)
                        }
                        if (recordset.val('封  号') == '' && d.SealNo) {
                            recordset.val('封  号', d.SealNo)
                        }
                        if (recordset.val('监装人员') == '' && d.LoadingSupervi) {
                            recordset.val('监装人员', d.LoadingSupervi)
                        }
                        if (recordset.val('装柜人员') == '' && d.zggr) {
                            recordset.val('装柜人员', d.zggr)
                        }
                        if (recordset.val('货柜箱号') == '' && d.ContainerNo) {
                            recordset.val('货柜箱号', d.ContainerNo)
                        }
                    }
                    if (recordset.val('外销发票').indexOf('CSD-') != -1) {
                        recordset.val('我方公司', '宁波可思达进出口有限公司')
                    } else {
                        if (d.gsmc) recordset.val('我方公司', d.gsmc)
                    }
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }
    if (field.full_name == m + '.HSCODE位数') {
        let j = recordset.val('HSCODE位数')
        if (j > 1) {
            let t = recordset.tables['产品资料']
            let d = t.view_data
            for (let r of d) {
                let hgbm = r.hgbm
                if (hgbm != null && hgbm != '') {
                    r.hgbm2 = hgbm.substring(0, j)
                    t.push_modi_rid(r.rid)
                }
            }
            t.sync_operate_data()
            t.modified = true
        }
    }
    if (field.full_name == m + '.品 名 数') {
        if (value >= 1) {
            _.http
                .post('/api/saier/shipping/pms/change', {
                    rid: recordset.val('rid'),
                    pms: recordset.val('品 名 数'),
                })
                .then((res) => {
                    let d = res.data
                    if (d && d.length > 0) {
                        recordset.val('总 品 名', d.join('\n'))
                    }
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    if (field.full_name == m + '.定金查看') {
        if (value == '是') {
            let t = recordset.tables['产品资料']
            let lines = t.view_data
            let ht_list = []
            for (let r of lines) {
                if (r.wxht == null || r.wxht == '') {
                    continue
                }
                if (ht_list.indexOf(r.wxht) == -1) {
                    ht_list.push(r.wxht)
                }
            }
            _.http
                .post('/api/saier/shipping/djck/change', {
                    rid: recordset.val('rid'),
                    ht_list: ht_list,
                })
                .then((res) => {
                    let d = res.data
                    let x = recordset.tables['定金明细']
                    x.clear()
                    x.data = d
                    x.sync_operate_data()
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    if (field.full_name == m + '.客户名称' && value != '') {
        _.http
            .post('/api/saier/shipping/khmc/change', {
                khbh: recordset.val('客户编号'),
                khmc: recordset.val('客户名称'),
            })
            .then((res) => {
                let d = res.data
                if (d) {
                    if (d.sfxk && d.sfxk != '' && d.sfxk != null) {
                        recordset.val('是否新客', d.sfxk)
                    }
                    if (d.xksj && d.xksj != '' && d.xksj != null) {
                        recordset.val('新客时间', d.xksj)
                    }
                    if (d.kh_data) {
                        let k = d.kh_data
                        if (recordset.val('结汇方式') == '') {
                            recordset.val('结汇方式', k.zffs)
                        }
                        if (k.xybx != '') {
                            recordset.val('是否信保', k.xybx)
                        }
                        if (k.yjds > 0) {
                            recordset.val('佣金点数', k.yjds)
                        }
                        recordset.val('客户简称', k.khjc)
                        recordset.val('客户编号', k.kh_id)
                        recordset.val('风控管理', k.fkgl)
                        recordset.val('所属地区', k.ssdq)
                        recordset.val('贸易国别', k.country)
                        recordset.val('信保代码', k.xbdm)
                        recordset.val('报关率要求', k.bglyq)
                        recordset.val('支付期限', k.ydqx)
                        recordset.val('信保额度', k.xbed)
                        recordset.val('已用额度', k.yyed)
                        recordset.val('剩余额度', k.syed)
                        recordset.val('信保支付方式', k.xbzffs)
                        recordset.val('信保期限', k.xbqx)
                    }
                    recordset._list[m + '.出运申请'] = d.dl_list
                    if (d.ttr) {
                        recordset.val('抬 头 人', d.ttr.ttr)
                        recordset.val('收 货 人', d.ttr.shr)
                        recordset.val('通 知 人', d.ttr.tzr)
                    }
                    if (d.cdgs) {
                        recordset.val('货代资料', d.cdgs.hdxx)
                        recordset.val('船运公司', d.cdgs.cygs)
                        recordset.val('货代名称', d.cdgs.Forwarder)
                    }
                }
                if (recordset.val('客户名称').indexOf('AMAZON') != -1) {
                    recordset.module.field_by_full_name(m + '.风控单证').disabled = true
                }
                if (
                    recordset.val('风控管理') == '是' ||
                    recordset.val('客户名称').indexOf('AMAZON') != -1
                ) {
                    recordset.module.field_by_full_name(m + '.出运申请').disabled = false
                } else {
                    recordset.module.field_by_full_name(m + '.出运申请').disabled = true
                    console.log('bbbb')
                }
            })
            .catch((err) => {
                _.ui.message.error(err.msg)
                console.error(err)
            })
    }

    if (field.full_name == m + '.风控人员' && value != '') {
        if (recordset.val('客户名称').indexOf('AMAZON') == -1) {
            _.http
                .post('/api/saier/shipping/fkry/change', {
                    fkry: recordset.val('风控人员'),
                    szgs: recordset.val('我方公司'),
                })
                .then((res) => {})
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                    recordset.val('风控人员', '')
                })
        }
    }

    if (field.full_name == m + '.单证人员' && value != '') {
        if (recordset.val('客户名称').indexOf('AMAZON') == -1) {
            _.http
                .post('/api/saier/shipping/dzry/change', {
                    dzry: recordset.val('单证人员'),
                })
                .then((res) => {})
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                    recordset.val('单证人员', '')
                })
        }
    }

    if (field.full_name == m + '.数值') {
        if (
            recordset.val('风控人员') == username ||
            recordset.val('风控审单') == username
        ) {
            _.http
                .post('/api/saier/shipping/sz/change', {})
                .then((res) => {
                    let ds = 7.1
                    let xs = 5
                    let d = res.data
                    if (d) {
                        ds = d.sz1
                        xs = d.sz2
                    }
                    let csz = recordset.val('数值')
                    let tsez = 0
                    let kpjez = 0
                    let bgjez = 0
                    let i = 0
                    let dhhcb = ''
                    let hl = recordset.val('汇    率')
                    if (hl == 0) {
                        hl = 1
                    }
                    let t = recordset.tables['产品资料']
                    let lines = t.view_data
                    let hhcbz = 0
                    let htsm = ''
                    for (let r of lines) {
                        i = i + 1
                        if (r.zzsl == 0) {
                            continue
                        }
                        let wxzj = 0
                        let hhcb1 = 0
                        if (recordset.val('RMB客户') != '是') {
                            wxzj = r.wxzj
                        } else {
                            wxzj = r.wxzj / hl
                        }
                        let zzsl2 = 1 + r.zzsl / 100
                        tsez = tsez + r.tsje
                        kpjez = kpjez + r.gczj / zzsl2
                        bgjez = bgjez + wxzj
                        if (csz > 0 && wxzj > 0) {
                            r.hhcb = round(r.gczj / zzsl2 / (wxzj * csz), 2)
                            t.push_modi_rid(r.rid)
                            hhcb1 = round(r.gczj / zzsl2 / (wxzj * csz), 2)
                            if (hhcb1 > ds || hhcb1 < xs) {
                                if (dhhcb == '') {
                                    dhhcb =
                                        '第' +
                                        i +
                                        '条记录换汇成本' +
                                        hhcb1 +
                                        '大于' +
                                        ds +
                                        '或小于' +
                                        xs
                                } else {
                                    dhhcb =
                                        dhhcb +
                                        '\n' +
                                        '第' +
                                        i +
                                        '条记录换汇成本' +
                                        hhcb1 +
                                        '大于' +
                                        ds +
                                        '或小于' +
                                        xs
                                }
                            }
                        }
                    }
                    recordset.val('异常换汇成本', dhhcb)
                    if (bgjez * csz > 1) {
                        // console.log(bgjez * csz)
                        htsm = '请注意'
                        hhcbz = Math.floor((kpjez / (bgjez * csz)) * 1000) / 1000
                        recordset.val('总换汇成本', hhcbz)
                        if (hhcbz > ds || hhcbz < xs) {
                            htsm = htsm + '\n' + '此票总换汇成本为' + hhcbz
                        }
                        if (dhhcb != '') {
                            htsm = htsm + '\n' + dhhcb
                        }
                        if (hhcbz > ds || hhcbz < xs || dhhcb != '') {
                            _.ui.message_box({
                                title: '换汇成本提示',
                                message: _.vue.h(
                                    'pre', {
                                        style: 'font-weight:500;line-height:20px',
                                    },
                                    htsm,
                                ),
                            })
                        }
                    }
                    t.sync_operate_data()
                    t.modified = true
                })
                .catch((err) => {
                    _.ui.message.error(err.msg)
                    console.error(err)
                })
        }
    }
    if (field.full_name == m + '.出运核准') {
        let khmc = recordset.val('客户名称')
        if (khmc.indexOf('AMAZON') != -1 && value == '通过') {
            recordset.val('风控确认1', '通过')
        }
    }
    if (field.full_name == m + '.出运申请' && value != '') {
        if (recordset.val('是否信保') == '' || recordset.job != 1) {
            recordset.val('出运核准', '待审批')
            recordset.val('出运申请', '')
            _.ui.message.error('主要信息-是否信保没填或没先保存不能提交')
        }
        if (
            recordset.val('货柜类型') != 'LCL' &&
            recordset.val('小柜数量') == 0 &&
            recordset.val('平柜数量') == 0 &&
            recordset.val('高柜数量') == 0 &&
            recordset.val('出运申请') != ''
        ) {
            _.ui.message.error(
                '不好意思,柜型不为LCL的情况下必需要填写小柜、平柜或高柜的数量',
            )
            recordset.val('出运核准', '待审批')
            recordset.val('出运申请', '')
        }
        if (
            (recordset.val('外销发票') != recordset.val('出运单号') ||
                recordset.val('外销发票') == '') &&
            recordset.val('出运申请') != ''
        ) {
            _.ui.message.error('不好意思,出运单号和外销发票不一致或为空')
            recordset.val('出运核准', '待审批')
            recordset.val('出运申请', '')
        }
        if (
            (recordset.val('货代资料') == '' ||
                recordset.val('我方抬头') == '' ||
                recordset.val('收 货 人') == '' ||
                recordset.val('抬 头 人') == '' ||
                recordset.val('通 知 人') == '' ||
                (recordset.val('唛    头') == '' &&
                    recordset.val('运输方式') != 'by post')) &&
            recordset.val('出运申请') != ''
        ) {
            _.ui.message.error(
                '不好意思,货代资料、唛    头、通 知 人、抬 头 人、收 货 人、我方抬头不能为空',
            )
            recordset.val('出运核准', '待审批')
            recordset.val('出运申请', '')
        }
        if (
            recordset.val('出运申请') == username &&
            recordset.val('出运申请') != ''
        ) {
            _.ui.message.error('不好意思,自已不能审批自已,请重新选择')
            recordset.val('出运核准', '待审批')
            recordset.val('出运申请', '')
        }
        let cysq = recordset.val('出运申请')
        if (cysq != '') {
            _.http
                .post('/api/saier/shipping/cysq/change', {
                    wxfp: recordset.val('外销发票'),
                    wyzd: recordset.val('唯一字段'),
                    rid: recordset.val('rid'),
                    spsq: recordset.val('出运申请'),
                    dzry: recordset.val('单证人员'),
                    lines: recordset.tables['产品资料'].view_data,
                })
                .then((res) => {
                    let d = res.data
                    let bgdsc = d.bgdsc
                    let zjhz = d.zjhz
                    let cyhz = d.cyhz
                    let fkqr = d.fkqr
                    if (zjhz != '') {
                        recordset.val('总监核准', zjhz)
                    }
                    if (cyhz != '') {
                        recordset.val('出运核准', cyhz)
                        recordset.val('出运核准1', cyhz)
                    }
                    if (fkqr != '') {
                        recordset.val('风控确认', fkqr)
                    }
                    if (recordset.val('报关单上传') != '已上传' && bgdsc == '待上传') {
                        recordset.val('报关单上传', '待上传')
                    } else {
                        bgdsc = '已上传'
                    }
                    if (bgdsc == '待上传') {
                        _.ui.message.error(
                            '该票需向工厂拿回报关单复印件，且要签订委托报关协议，出货后7天内请在出运计划界面上传附件',
                        )
                    }
                    if (recordset.val('出运申请') != '')
                        recordset.module.field_by_full_name(m + '.出运申请').disabled = true
                })
                .catch((err) => {
                    let d = err.data
                    if (d) {
                        let error1 = d.error1
                        let error2 = d.error2
                        let cywyzdsl = d.cywyzdsl
                        let error = []
                        if (cywyzdsl > 0) {
                            error.push('有重复数据' + cywyzdsl + '请注意')
                        }
                        if (error2.length > 0) {
                            error.push(
                                '第' +
                                error2.join(',') +
                                '\n行记录中文报关，增税，退税，开票工厂,货源地,进仓时间没填\n或代开没填点数不能提交',
                            )
                        }
                        if (error1.length > 0) {
                            error.push(
                                '第' +
                                error1.join(',') +
                                '\n行记录现金工厂请填写收款户名、开户银行、银行帐号',
                            )
                        }
                        _.ui.message_box({
                            title: '提示',
                            message: _.vue.h(
                                'pre', {
                                    style: 'font-weight:500;line-height:20px',
                                },
                                error.join('\n'),
                            ),
                        })
                    } else {
                        _.ui.message.error(err.msg)
                    }
                    console.error(err)
                    recordset.val('出运核准', '待审批')
                    recordset.val('出运申请', '')
                })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shipping_field_change, '出运计划')

function shipping_table_new_after(evt_id, table, recordset) {
    if (table.group == '产品资料') {
        recordset.val('产品资料.出运唯一字段', recordset.val('产品资料.rid'))
    }
}
_.evts.on(
    [_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY],
    shipping_table_new_after,
    '出运计划',
)

// 查询界面或编辑界面打开事件
const shipping_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            name: 'dgmb_download_btn',
            caption: '优景定柜信息汇总表导出',
            icon: 'any-function',
            divided: true,
        })
        btns.push({
            name: 'dgmb_upload_btn',
            caption: '优景定柜信息汇总表回导',
            icon: 'any-function',
            divided: true,
        })
        btns.push({
            name: 'cyjh_return_btn',
            caption: '单证退回',
            icon: 'any-function',
            divided: true,
        })
    } else {
        btns.push({
            name: 'fphm_update_btn',
            caption: '更改发票号',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'gdsq_update_btn',
            caption: '改单申请',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'dzzt_update_btn',
            caption: '单证确认状态变更',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'lv_export_btn',
            caption: 'lv出运清单',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'ec_require_btn',
            caption: '电商询价表',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'fkkh_open_btn',
            caption: '链接风控客户',
            icon: 'any-server-update',
            divided: true,
        })
    }
    btns.push({
        name: 'booking_download_btn',
        caption: '优景Booking',
        icon: 'any-server-update',
        divided: true,
    })
    btns.push({
        name: 'cymx_new_btn',
        caption: '生成出运明细',
        icon: 'any-server-update',
        divided: true,
    })
    if (btns.length == 0) {
        return
    }
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
_.evts.on(
    [_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW],
    shipping_Form_Show,
    '出运计划',
)

const shipping_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = []
        btns.push({
            name: 'supplier_update_btn',
            caption: '更新现金工厂开票',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'hyd_update_btn',
            caption: '刷货源地',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'item_all_update_btn',
            caption: '更新所有产品',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'item_row_update_btn',
            caption: '更新当前产品',
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
}
_.evts.on(
    [_.evtids.MODULE_EDITOR_GROUP_SHOW],
    shipping_EditorChildShow,
    '出运计划',
)

const shipping_form_BtnClick = (evt_id, btn, form) => {
    let recordset = form.recordset
    let m = form.module.name
    let username = _.user.username
        //  出运计划退回
    if (btn.name == 'cyjh_return_btn') {
        _.ui.show_input_dialog('请输入退回原因,如果不需统计则留空:', '').then(val => {
            _.http
                .post('/api/saier/shipment/cyjh_return', {
                    rid: form.current_rid.value,
                    bgyy: val,
                    flag: 1,
                })
                .then((res) => {
                    _.ui.message.success(res.msg)
                })
                .catch((err) => {
                    console.error(err)
                    _.ui.message.error(err.msg || '操作失败')
                })
        })
    }

    if (btn.name == 'supplier_update_btn') {
        let t = recordset.tables['产品资料']
        let lines = t.view_data
        _.http
            .post('/api/saier/shipping/items/update/supplier', {
                lines: lines,
            })
            .then((res) => {
                let d = res.data
                for (let r of lines) {
                    console.log(r)
                    console.log(r.sccj1id)
                    if (r.sccj1id == null || r.sccj1id == '' || r.zzsl > 0) {
                        continue
                    }
                    if (
                        r.zhwbgpm == null ||
                        r.zhwbgpm == '' ||
                        r.skfm == null ||
                        r.skfm == '' ||
                        r.bank == null ||
                        r.bank == '' ||
                        r.zh == null ||
                        r.zh == ''
                    ) {
                        console.log(r)
                        if (r.sccj1id in d) {
                            let l = d[r.sccj1id]
                            // r.zhwbgpm = l.zhwbgpm
                            r.skfm = l.fkhm
                            r.bank = l.bank1
                            r.zh = l.zh1
                            t.push_modi_rid(r.rid)
                        }
                    }
                }
                t.sync_operate_data()
                t.modified = true
                _.ui.message.success(res.msg)
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'hyd_update_btn') {
        let t = recordset.tables['产品资料']
        let lines = t.view_data
        _.http
            .post('/api/saier/shipping/items/update/hyd', {
                lines: lines,
            })
            .then((res) => {
                let d = res.data
                for (let r of lines) {
                    let rid = r.rid
                    let flag = false
                    if (rid in d) {
                        let l = d[rid]
                        if (l.hyd && (r.hyd == '' || r.hyd == null)) {
                            r.hyd = l.hyd
                            flag = true
                        }
                        if (l.kpmc && (r.kpmc == '' || r.kpmc == null)) {
                            r.kpmc = l.kpmc
                            flag = true
                        }
                        if (flag) t.push_modi_rid(r.rid)
                    }
                }
                t.sync_operate_data()
                t.modified = true
                _.ui.message.success(res.msg)
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'dzzt_update_btn') {
        if (recordset.val('单证人员') != username) {
            return
        }
        _.http
            .post('/api/saier/shipping/update/dzzt', {})
            .then((res) => {
                let d = res.data
                if (d && d != '' && d != null) {
                    _.ui.message.warning(d)
                }
                recordset.module.field_by_full_name(m + '.单证确认').disabled = false
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'dgmb_download_btn') {
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
        _.http
            .post('/api/saier/shipping/download/dgmb', {
                rids: rids,
            })
            .then((res) => {
                let d = res.data
                if (d && d.path != '' && d.path != null) {
                    _.http.download(
                        '/api/tmp/file/get', {
                            file: d.path,
                        },
                        d.name,
                    )
                }
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    // 优景Booking
    if (btn.name == 'booking_download_btn') {
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
        _.http
            .post('/api/saier/shipping/booking/export', {
                rids: rids,
            })
            .then((res) => {
                let d = res.data
                if (d && d.path != '' && d.path != null) {
                    _.http.download(
                        '/api/tmp/file/get', {
                            file: d,
                        },
                        d,
                    )
                }
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    // clb
    if (btn.name == 'lv_export_btn') {
        _.http
            .post('/api/saier/shipping/lv/export', {
                rid: recordset.rid,
            })
            .then((res) => {
                if (res.code === 1 && res.data) {
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'ec_require_btn') {
        _.http
            .post('/api/saier/shipping/e_commerce_inquiry/export', {
                rid: recordset.rid,
            })
            .then((res) => {
                if (res.code === 1 && res.data) {
                    _.http.download('/api/tmp/file/get', {
                        file: res.data
                    }, res.data)
                }
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }

    if (btn.name == 'dgmb_upload_btn') {
        if (!_.user.can('chyjh_dgmb_import')) {
            _.ui.message.error('您没有权限执行此操作，请联系管理员')
            return
        }
        _.ui.show_dialog('update_from_excel', {
            module: form.module.name,
            kind: '订柜信息',
            params: [],
        })
    }
    if (btn.name == 'fkkh_open_btn') {
        if (recordset.val('风控人员') != username) {
            return
        }
        _.http
            .post('/api/saier/shipping/open/fkkh', {
                lines: lines,
            })
            .then((res) => {
                let d = res.data
                if (d && d != '' && d != null) {
                    _.platform.show_module_edit('风控客户', d)
                }
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }

    if (btn.name == 'item_all_update_btn' || btn.name == 'item_row_update_btn') {
        if (recordset.val('出运核准') != '待审批') {
            return
        }
        let t = recordset.tables['产品资料']
        let lines = t.view_data
        if (btn.name == 'item_row_update_btn') {
            if (!t.current_data) {
                _.ui.message.error('请先选中一行记录再点击此按钮')
                return
            }
            lines = [t.current_data]
        }
        _.http
            .post('/api/saier/shipping/items/update/data', {
                lines: lines,
            })
            .then((res) => {
                let d = res.data
                for (let r of lines) {
                    let rid = r.rid
                    if (rid in d) {
                        let l = d[rid]
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.货币代码',
                            ).db.name
                        ] = l.hbdm
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.报关单位',
                            ).db.name
                        ] = l.bgjldw
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.中文报关品名',
                            ).db.name
                        ] = l.zhwbgpm
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.增值税率',
                            ).db.name
                        ] = l.zzsl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.退 税 率',
                            ).db.name
                        ] = l.sl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.备    注',
                            ).db.name
                        ] = l.bz3
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.交货日期',
                            ).db.name
                        ] = l.jhrq
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.客户货号',
                            ).db.name
                        ] = l.khhh
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.海关编码',
                            ).db.name
                        ] = l.hgbm
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.完成数量',
                            ).db.name
                        ] = l.wcsl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.毛    重',
                            ).db.name
                        ] = l.mz
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.付款抬头',
                            ).db.name
                        ] = l.fktt
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.净    重',
                            ).db.name
                        ] = l.jz
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.包装长度',
                            ).db.name
                        ] = l.bzcd
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.包装宽度',
                            ).db.name
                        ] = l.bzkd
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.货 源 地',
                            ).db.name
                        ] = l.hyd
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.包装高度',
                            ).db.name
                        ] = l.bzgd
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.外箱体积',
                            ).db.name
                        ] = l.tj
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.纸卡费用',
                            ).db.name
                        ] = l.zkfy
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.是否商检',
                            ).db.name
                        ] = l.sjqk
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.开票工厂',
                            ).db.name
                        ] = l.kpgc
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.专业厂家',
                            ).db.name
                        ] = l.sccj1
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.工厂名称',
                            ).db.name
                        ] = l.csmc
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.组织机构代码',
                            ).db.name
                        ] = l.zzjgdm
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.开票联系人',
                            ).db.name
                        ] = l.kplxr
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.开票电话',
                            ).db.name
                        ] = l.kpdh
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.进仓时间',
                            ).db.name
                        ] = l.jcsj
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.其它说明',
                            ).db.name
                        ] = l.qtsm1
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.预计船期',
                            ).db.name
                        ] = l.yjcq
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.专业产品编号',
                            ).db.name
                        ] = l.zycpbh
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.采购人员',
                            ).db.name
                        ] = l.cgry
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.跟单人员',
                            ).db.name
                        ] = l.gdry
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.开票点数',
                            ).db.name
                        ] = l.ljrk
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.采购单价',
                            ).db.name
                        ] = l.cgjg
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.采购数量',
                            ).db.name
                        ] = l.cgsl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.合同数量',
                            ).db.name
                        ] = l.cgsl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.箱    数',
                            ).db.name
                        ] = Math.trunc(l.cgxs)
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.可思达货号',
                            ).db.name
                        ] = l.ksdhh

                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.外销单价',
                            ).db.name
                        ] = l.wxdj
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.赔款单价',
                            ).db.name
                        ] = l.Twxdj
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.客户RMB单价',
                            ).db.name
                        ] = l.mjdj1
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.赔款RMB',
                            ).db.name
                        ] = l.pkRMB
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.客户货号',
                            ).db.name
                        ] = l.khhh
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.暗佣比率',
                            ).db.name
                        ] = l.aybl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.暗佣单价',
                            ).db.name
                        ] = l.asl6
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.佣金比率',
                            ).db.name
                        ] = l.yjbl
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.佣金单价',
                            ).db.name
                        ] = l.sl6
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.RMB客户',
                            ).db.name
                        ] = l.khpd
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.业务人员',
                            ).db.name
                        ] = l.bjyw
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.客人订单号',
                            ).db.name
                        ] = l.krddh
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.转美元汇率',
                            ).db.name
                        ] = l.zmyhl
                        if (l.djpm != '' && l.djpm != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.单据品名',
                                ).db.name
                            ] = l.djpm
                        }
                        if (l.caizi != '' && l.caizi != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.材质英文',
                                ).db.name
                            ] = l.caizi
                        }
                        if (l.krtm != '' && l.krtm != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.客人条码',
                                ).db.name
                            ] = l.krtm
                        }
                        if (l.ywpm != '' && l.ywpm != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.英文品名',
                                ).db.name
                            ] = l.ywpm
                        }
                        r[
                            recordset.module.field_by_full_name(
                                m + '.产品资料.是否授权',
                            ).db.name
                        ] = l.sfsq
                        if (l.wypp != '' && l.wypp != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.外语品名',
                                ).db.name
                            ] = l.wypp
                        }
                        if (l.krCODE != '' && l.krCODE != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.客人CODE',
                                ).db.name
                            ] = l.krCODE
                        }
                        if (l.djpmy != '' && l.djpmy != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.单据品名英',
                                ).db.name
                            ] = l.djpmy
                        }
                        if (l.djpmw != '' && l.djpmw != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.单据品名外',
                                ).db.name
                            ] = l.djpmw
                        }
                        if (l.wypp != '' && l.wypp != null) {
                            r[
                                recordset.module.field_by_full_name(
                                    m + '.产品资料.外语品名',
                                ).db.name
                            ] = l.wypp
                        }
                        t.push_modi_rid(r.rid)
                    }
                }
                t.sync_operate_data()
                t.modified = true
                _.ui.message.success(res.msg)
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'fphm_update_btn') {
        if (
            recordset.val('出运申请') != '' ||
            recordset.val('制单人员') != username
        ) {
            _.ui.message.error('出运申请为空且由本人的记录才能更改发票号码')
            return
        }
        let t = recordset.tables['产品资料']
        let lines = t.view_data
        _.http
            .post('/api/saier/shipping/update/fphm', {
                lines: lines,
            })
            .then((res) => {
                let d = res.data
                for (let r of lines) {
                    let rid = r.rid
                    let flag = false
                    if (rid in d) {
                        let l = d[rid]
                        if (l.wxht) {
                            r.wxht = l.wxht
                            flag = true
                        }
                        if (l.hthm) {
                            r.cght = l.hthm
                            flag = true
                        }
                        if (flag) t.push_modi_rid(r.rid)
                    }
                }
                t.sync_operate_data()
                t.modified = true
                recordset.module.field_by_full_name(m + '.外销发票').disabled = false
                // _.ui.message.success(res.msg)
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'gdsq_update_btn') {
        if (
            recordset.val('外销发票') == '' ||
            recordset.val('出运申请') == '' ||
            recordset.val('制单人员') != username
        ) {
            _.ui.message.error(
                '外销发票、出运申请不能为空且由本人的记录才能进行改单申请',
            )
            return
        }
        _.ui.confirm('确认要提交改单申请吗？', '提示').then(() => {
            _.http
                .post('/api/saier/shipping/update/apply', {
                    wxfp: recordset.val('外销发票'),
                    spsq: recordset.val('出运申请'),
                    rid: recordset.val('rid'),
                })
                .then((res) => {
                    _.ui.message.success(res.msg)
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        })
    }
    if (btn.name == 'dzry_update_btn') {
        _.http
            .post('/api/saier/shipping/check/dzry', {
                rid: form.current_rid.value,
            })
            .then((res) => {
                let d = res.data
                _.ui.show_input_select_dialog('请输入单证人员', '').then(() => {
                    _.http
                        .post('/api/saier/shipping/update/apply', {
                            wxfp: recordset.val('外销发票'),
                            spsq: recordset.val('出运申请'),
                            rid: recordset.val('rid'),
                        })
                        .then((res) => {
                            _.ui.message.success(res.msg)
                        })
                        .catch((err) => {
                            console.log(err)
                            _.ui.message.error(err.msg)
                        })
                })
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
    if (btn.name == 'cymx_new_btn') {
        _.http
            .post('/api/saier/shipping/new/shipment', {
                rid: form.current_rid.value,
            })
            .then((res) => {
                let d = res.data
                _.ui.message.success(res.msg)
            })
            .catch((err) => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shipping_form_BtnClick, '出运计划')

const shipping_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        let m = recordset.module.name
        let wxfp = recordset.val('外销发票')
        let error = []
        if (wxfp.indexOf('CSD-') != -1) {
            recordset.val('我方公司', '宁波可思达进出口有限公司')
        }
        if (recordset.val('是否集团协同') == '是' && (recordset.val('协同公司') == '' || recordset.val('协同合同号') == '')) {
            _.ui.message.error('协同合同需填协同公司和协同合同号');
            recordset.val('出运审请', '');
            reject();
            return;
        }
        if (recordset.val('新建日期') >= '2023-11-13' && recordset.val('是否有敏感产品') == '') {
            _.ui.message.error('请注意辅助信息——是否有敏感产品 为必填');
            reject();
            return;
        }
        if (recordset.val('合同号码') != '' && recordset.val('外销发票') != '' && recordset.val('外销发票').indexOf(recordset.val('合同号码')) == -1) {
            _.ui.message.error('合同号码错误或合同号码和发票号码不符')
            reject()
            return
        }
        let hl = recordset.val('汇    率');
        if (hl == 0) {
            hl = 1;
            recordset.val('汇    率', 1);
        }
        if (recordset.val('人民币出货额￥') > 450000 || (recordset.val('人民币出货额￥') / hl) > 60000) {
            error.push('请注意采购总和超过45万人民币或6万美金,请检查是否正确');
        }
        if (recordset.val('货值合计$') > 60000) {
            error.push('请注意外销总和超过6万美金,请检查是否正确');
        }
        if (
            recordset.val('风控暂扣') == '是' &&
            recordset.val('单证确认') == '结束'
        ) {
            recordset.val('单证确认', '待审批')
        }
        if (recordset.val('唯一字段') == '' || recordset.val('唯一字段') == null) {
            recordset.val('唯一字段', recordset.val('rid'))
        }
        if (recordset.val('制单人员') == '' || recordset.val('制单人员') == null) {
            recordset.val('制单人员', username)
        }
        _.http.post('/api/saier/shipping/save/before', {
            rid: recordset.val('rid'),
            cydh: recordset.val('出运单号'),
            dzry: recordset.val('单证人员'),
            fkry: recordset.val('风控人员'),
            order_id: recordset.val('合同号码'),
            wxfp: recordset.val('外销发票'),
            sdsm: recordset.val('审单说明'),
            fksm: recordset.val('风控说明'),
            dzsm: recordset.val('单证说明'),
            fkzk: recordset.val('风控暂扣'),
            sfxk: recordset.val('是否新客'),
            khbh: recordset.val('客户编号'),
            sdqr: recordset.val('审单状态'),
            cysq: recordset.val('出运申请'),
            mdka: recordset.val('目的口岸'),
            dzzt: recordset.val('单证确认'),
            lines: recordset.tables['产品资料'].view_data,
        }).then((res) => {
            if (res.code == 0) {
                _.ui.message.error(res.msg)
                recordset.val('是否新客', '否')
            }
            let d = res.data
            let bank = d.bank
            let l = d.lines
            let cywyzdsl = 0
            let sjtx = '否'
            let khmc = recordset.val('客户名称') ? recordset.val('客户名称').toUpperCase() : ''
            if (d && d.cdsb == 1 && recordset.val('出运核准') != '待审批' && recordset.val('出运申请') !='' && recordset.val('出运申请') != username) {
                _.ui.message.error('业务撤单，不能保存')
                recordset.val('出运申请', '')
                reject()
                return
            }
            if (recordset.val('已收定金') == -1) {
                _.ui.message.error('已收定金不能为负数')
                reject()
                return
            }
            if (d && d.zwmc != null && d.zwmc.length > 0) {
                recordset.val('口岸国家', d.zwmc)
            }
            if (d && d.dqzw != null && d.dqzw.length > 0) {
                recordset.val('口岸国家', d.dqzw)
            }
            let t = recordset.tables['产品资料']
            let lines = t.view_data
            let index = 0
            let wxzj = 0
            let wxzj1 = 0
            let cgzj = 0
            let cgzj1 = 0
            let khrmbzj = 0
            let jzz = []
            let djpmy = []
            let hb_data = []
            for (let r of lines) {
                index += 1
                let sfcg = '否'
                let chhj = recordset.value('产品资料.出货合计', r)
                if (r.wxjz > r.wxmz || r.zjz > r.zmz) {
                    _.ui.message.error('产品资料第' + index + '行记录的净重或毛重异常，请检查')
                    recordset.val('出运申请', '');
                    reject()
                    return
                }
                if (r.wxwyzd == '' || r.wxwyzd == null) {
                    if (recordset.value('产品资料.外销合同', r) != '' && recordset.value('产品资料.外销合同', r) != null && recordset.value('产品资料.外销合同', r).slice(-1) != '.') {
                        recordset.val('产品资料.外销合同', recordset.value('产品资料.外销合同', r) + '.', r)
                    }
                    recordset.val('产品资料.外销单价', 0, r);
                    recordset.val('产品资料.赔款单价', 0, r);
                    recordset.val('产品资料.客户RMB单价', 0, r);
                    recordset.val('产品资料.赔款RMB', 0, r);
                }
                if (bank && (r.sccj1id != null && r.sccj1id != '') && bank[r.sccj1id] && r.zzsl == 0 && (recordset.value('产品资料.开户银行', r) == '' || recordset.value('产品资料.开户银行', r) == null ||
                        recordset.value('产品资料.收款户名', r) == '' || recordset.value('产品资料.收款户名', r) == null || recordset.value('产品资料.银行账号', r) == '' || recordset.value('产品资料.银行账号', r) == null) &&
                    (recordset.value('产品资料.中文报关品名', r) == '' || recordset.value('产品资料.中文报关品名', r) == null || recordset.value('产品资料.中文报关品名', r) == '无')) {
                    recordset.val('产品资料.开户银行', bank[r.sccj1id].fkhm, r);
                    recordset.val('产品资料.收款户名', bank[r.sccj1id].bank1, r);
                    recordset.val('产品资料.银行帐号', bank[r.sccj1id].zh1, r);
                } else if (r.zzsl != 0 && r.zzsl != null) {
                    recordset.val('产品资料.开户银行', '', r);
                    recordset.val('产品资料.收款户名', '', r);
                    recordset.val('产品资料.银行帐号', '', r);
                }
                if (recordset.val('风控管理') != '是' && khmc.indexOf('AMAZON') != -1) {
                    if (recordset.value('产品资料.增值税率', r) == 0 && recordset.value('产品资料.赠送', r) != '是' && recordset.value('产品资料.赠送', r) != '工厂' && recordset.value('产品资料.专业厂家id', r) != '' &&
                        ((recordset.value('产品资料.中文报关品名', r) == '') || (recordset.value('产品资料.中文报关品名', r) == '无')) &&
                        ((recordset.value('产品资料.收款户名', r) == '') || (recordset.value('产品资料.开户银行', r) == '') || (recordset.value('产品资料.银行帐号', r) == ''))) {
                        _.ui.message.error('产品资料第' + index + '行记录的现金工厂请填写收款户名、开户银行、银行帐号')
                        recordset.val('出运申请', '');
                        reject()
                        return
                    }
                    if (recordset.value('产品资料.增值税率', r) != 0 && (recordset.value('产品资料.中文报关品名', r) == '' || recordset.value('产品资料.中文报关品名', r) == '无' || recordset.value('产品资料.开票工厂', r) == '' ||
                            recordset.value('产品资料.退 税 率', r) == '' || recordset.value('产品资料.货 源 地', r) == '')) {
                        _.ui.message.error('产品资料第' + index + '行记录的中文报关，增税，退税，开票工厂,货源地有没填;或代开没填点数不能提交')
                        recordset.val('出运申请', '');
                        reject()
                        return
                    }
                    if (recordset.value('产品资料.中文报关品名', r) != '' && recordset.value('产品资料.中文报关品名', r) != '无' && (recordset.value('产品资料.开票工厂', r) == '' || recordset.value('产品资料.增值税率', r) == 0 ||
                            recordset.value('产品资料.退 税 率', r) == '' || recordset.value('产品资料.货 源 地', r) == '')) {
                        _.ui.message.error('产品资料第' + index + '行记录的中文报关，增税，退税，开票工厂,货源地有没填;或代开没填点数不能提交')
                        recordset.val('出运申请', '');
                        reject()
                        return
                    }
                    if (recordset.value('产品资料.代开点数', r) < 1 && recordset.value('产品资料.代开点数', r) > 0) {
                        let dkds = recordset.value('产品资料.代开点数', r);
                        recordset.val('产品资料.代开点数', dkds * 100, r);
                    }
                    if (recordset.value('产品资料.是否代开', r) == '是' && recordset.value('产品资料.代开点数', r) == 0) {
                        _.ui.message.error('产品资料第' + index + '行记录的中文报关，增税，退税，开票工厂,货源地有没填;或代开没填点数不能提交')
                        recordset.val('出运申请', '');
                        reject()
                        return
                    }
                }
                if (recordset.value('产品资料.RMB客户', r) == '') {
                    recordset.val('产品资料.RMB客户', recordset.value('产品资料.RMB客户', r), r);
                }
                if (recordset.value('产品资料.付款抬头', r) == '') {
                    recordset.val('产品资料.付款抬头', recordset.value('付款抬头'), r);
                }
                recordset.val('产品资料.是否改单', '');
                if (recordset.value('产品资料.唯一字段1', r) == '') {
                    recordset.val('产品资料.唯一字段1', recordset.val('唯一字段'), r);
                }
                recordset.val('产品资料.识别号', index, r);
                if (recordset.value('产品资料.地    区', r) == '') {
                    recordset.val('产品资料.地    区', recordset.val('地    区'), r);
                }
                if (recordset.value('产品资料.出货数量', r) != 0) {
                    wxzj = wxzj + recordset.value('产品资料.外销总价', r);
                    cgzj = cgzj + recordset.value('产品资料.采购总价', r);
                    khrmbzj = khrmbzj + recordset.value('产品资料.客户RMB总价', r);
                } else {
                    if (recordset.value('产品资料.外销总价', r) != 0 && recordset.value('产品资料.客户RMB总价', r) == 0) {
                        wxzj1 = wxzj1 + recordset.value('产品资料.外销总价', r);
                    } else {
                        if (hl != 0) {
                            wxzj1 = wxzj1 + recordset.value('产品资料.客户RMB总价', r) / hl;
                        }
                    }
                    cgzj1 = cgzj1 + recordset.value('产品资料.采购总价', r);
                }
                if (recordset.value('产品资料.出运唯一字段', r) == '') {
                    recordset.val('产品资料.出运唯一字段', recordset.value('产品资料.rid', r), r);
                }
                if (recordset.value('产品资料.外销编号', r) != '') {
                    if (recordset.value('产品资料.采购数量', r) > 0) {
                        sfcg = '是';
                    } else {
                        sfcg = '否';
                    }
                }
                if (khmc.indexOf('BEST PRICE') == -1 && recordset.val('单证确认') == '再审') {
                    if (l && l.lines && l.lines[r.rid] && l.lines[r.rid] == '是') {
                        recordset.val('产品资料.是否改单', '是', r);
                    }
                }
                if (recordset.value('产品资料.唯一字段', r) != '') {
                    let cgdj = recordset.value('产品资料.采购单价', r);
                    let sysl = recordset.value('产品资料.剩余数量', r);
                    if (sysl == 0) {
                        cgdj = recordset.value('产品资料.采购单价', r);
                    }
                    if (sysl < 0) {
                        _.ui.message.error('产品资料第' + index + '剩余数量负请检查')
                        recordset.val('出运申请', '');
                        reject()
                        return
                    }
                }
                jz = jzz.indexOf(recordset.value('产品资料.专业货号', r) + recordset.value('产品资料.客人订单号', r) + recordset.value('产品资料.客户货号', r) + recordset.value('产品资料.中文品名', r) + recordset.value('产品资料.采购合同', r) + String(recordset.value('产品资料.出货数量', r)) + String(recordset.value('产品资料.采购总价', r)) + String(recordset.value('产品资料.外销总价', r)) + String(recordset.value('产品资料.客户RMB总价', r)) + String(recordset.value('产品资料.退 税 率', r)) + recordset.value('产品资料.唯一字段', r) + recordset.value('产品资料.店铺名称', r));
                if (jz < 0) {
                    jzz.push(recordset.value('产品资料.专业货号', r) + recordset.value('产品资料.客人订单号', r) + recordset.value('产品资料.客户货号', r) + recordset.value('产品资料.中文品名', r) + recordset.value('产品资料.采购合同', r) + String(recordset.value('产品资料.出货数量', r)) + String(recordset.value('产品资料.采购总价', r)) + String(recordset.value('产品资料.外销总价', r)) + String(recordset.value('产品资料.客户RMB总价', r)) + String(recordset.value('产品资料.退 税 率', r)) + recordset.value('产品资料.唯一字段', r) + recordset.value('产品资料.店铺名称', r));
                } else {
                    cywyzdsl = cywyzdsl + 1;
                    recordset.val('出运申请', '');
                    _.ui.message.error('产品资料第' + index + '行记录与之前的记录重复，请检查')
                    reject()
                    return
                }
                if (recordset.value('产品资料.商检提醒', r) != '' && recordset.value('产品资料.商检提醒', r).indexOf('商检') != -1) sjtx = '是'
                let hj = djpmy.indexOf(recordset.value('产品资料.单据品名英', r));
                if (hj < 0) {
                    djpmy.push(recordset.value('产品资料.单据品名英', r));
                    hb_data.push(_deepClone(r));
                } else {
                    let row = hb_data[hj];
                    if (row['mjzj'] != undefined && row['mjzj'] != null) {
                        row['mjzj'] = round(Number(row['mjzj']) + recordset.value('产品资料.客户RMB总价', r), 2);
                    }
                    if (row['wxzj'] != undefined && row['wxzj'] != null) {
                        row['wxzj'] = round(Number(row['wxzj']) + recordset.value('产品资料.外销总价', r), 2);
                    }
                    if (row['chsl'] != undefined && row['chsl'] != null) {
                        row['chsl'] = round(Number(row['chsl']) + recordset.value('产品资料.出货数量', r));
                    }
                    if (row['chxs2'] != undefined && row['chxs2'] != null) {
                        row['chxs2'] = Number(Number(row['chxs2']) + recordset.value('产品资料.出货箱数', r));
                    }
                    if (row['zmz'] != undefined && row['zmz'] != null) {
                        row['zmz'] = round(Number(row['zmz']) + recordset.value('产品资料.总 毛 重', r), 2);
                    }
                    if (row['zjz'] != undefined && row['zjz'] != null) {
                        row['zjz'] = round(Number(row['zjz']) + recordset.value('产品资料.总 净 重', r), 2);
                    }
                    if (row['ztj'] != undefined && row['ztj'] != null) {
                        row['ztj'] = round(Number(row['ztj']) + recordset.value('产品资料.总 体 积', r), 3);
                    }
                }
                // if (r.cgjg < 0) {
                //     _.ui.message.error('采购单价不能为负数')
                // }
            }
            recordset.val('外销总额', wxzj);
            recordset.val('客户RMB总价', khrmbzj);
            recordset.val('商检提醒', sjtx);
            let ayhj = 0;
            let myhj = 0;
            let ygxb = 0;
            if (recordset.val('RMB客户') != '是') {
                ayhj = recordset.val('暗佣合计');
                myhj = recordset.val('明佣合计');
                recordset.val('货值合计$', wxzj + wxzj1);
                ygxb = round(((wxzj + wxzj1 - myhj) * recordset.val('信保费率')) * 100) / 100;
            } else {
                if (hl !== 0) {
                    recordset.val('货值合计$', round((recordset.val('客户RMB总价') / hl + wxzj1) * 1000) / 1000);
                    ayhj = recordset.val('暗佣合计') / hl;
                    myhj = recordset.val('明佣合计') / hl;
                    ygxb = round(((recordset.val('客户RMB总价') / hl + wxzj1 - myhj) * recordset.val('信保费率')) * 100) / 100;
                }
            }
            recordset.val('人民币出货额', cgzj);
            recordset.val('人民币出货额￥', cgzj + cgzj1);
            recordset.val('预估毛利', round(((recordset.val('货值合计$') - ayhj - myhj - ygxb) * hl - cgzj - cgzj1 + recordset.val('退税总额')) * 100) / 100);
            if (recordset.val('货值合计$') - myhj != 0) {
                recordset.val('预估毛利率', round((100 * (recordset.val('预估毛利') / ((recordset.val('货值合计$') - myhj) * hl))) * 100) / 100);
            }
            let x = recordset.tables['产品合并']
            x.clear()
            for (let r of hb_data) {
                r.rid = _.utils.guid()
                r.pid = recordset.val('rid')
                r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                r.uid = _.user.rid
                r.kfrmbz = r.mjzj ? r.mjzj : 0
                x.push_new_rid(r.rid)
            }
            x.view_data = hb_data
            x.sync_operate_data()
            x.modified = true
            resolve()
        }).catch((err) => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, shipping_before_save, '出运计划')

// 编辑界面数据加载以后执行
const shipping_recordLoad = (evt_id, recordset) => {
    _.http
        .post('/api/saier/shipping/load/check', {
            rid: recordset.val('rid'),
            fphm: recordset.val('外销发票'),
            khmc: recordset.val('客户名称'),
        })
        .then(function (res) {
            let d = res.data
            let ysdj = d.ysdj
            let m = recordset.module.name
            let username = _.user.username
            if (recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1) {
                recordset.module.field_by_full_name(m + '.风控单证').disabled = true
            }
            if (
                recordset.val('风控管理') == '是' ||
                recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1
            ) {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = false
            } else {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = true
            }
            if (recordset.val('单证确认') == '结束') {
                recordset.module.field_by_full_name(m + '.单证确认').disabled = true
            }
            recordset.module.field_by_full_name(m + '.报关单上传').disabled = true

            if (
                (recordset.val('出运申请') == '' ||
                    recordset.val('单证确认') == '再审') &&
                recordset.val('制单人员') == username
            ) {} else {
                recordset.tables['产品资料']._.toolbar.show('delete', false)
            }
            recordset.module.group_by_name('定金明细').visible = false
            recordset.module.group_by_name('补报信息').visible = false
            recordset.module.field_by_full_name(m + '.补报品名').hide()
            recordset.module.field_by_full_name(m + '.支付期限').hide()
            recordset.module.field_by_full_name(m + '.信保额度').hide()
            recordset.module.field_by_full_name(m + '.已用额度').hide()
            recordset.module.field_by_full_name(m + '.剩余额度').hide()
            recordset.module.field_by_full_name(m + '.信保支付方式').hide()
            recordset.module.field_by_full_name(m + '.信保期限').hide()
            if (
                username == recordset.val('风控审单') ||
                username == recordset.val('风控人员') ||
                username == 'zjnblh' ||
                username == '赵波' ||
                username == '赵波U'
            ) {
                recordset.module.field_by_full_name(m + '.支付期限').show()
                recordset.module.field_by_full_name(m + '.信保额度').show()
                recordset.module.field_by_full_name(m + '.已用额度').show()
                recordset.module.field_by_full_name(m + '.剩余额度').show()
                recordset.module.field_by_full_name(m + '.信保支付方式').show()
                recordset.module.field_by_full_name(m + '.信保期限').show()
                recordset.module.field_by_full_name(m + '.报关单上传').disabled = false
                if (recordset.val('商检提醒') == '是') {
                    _.ui.message.error(
                        '该票含有需商检材质，请检查产品资料是否要商检\n可通过产品资料——商检提醒查看',
                    )
                }
            }
            if (
                recordset.val('单证人员') == username &&
                (recordset.val('风控确认') == '通过' ||
                    recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1) &&
                recordset.val('出运核准') == '通过'
            ) {} else {
                recordset.module.field_by_full_name(m + '.单证确认').disabled = true
            }
            if (
                recordset.val('风控管理') == '是' ||
                recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1
            ) {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = false
            } else {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = true
            }
            recordset.module.field_by_full_name(m + '.风控人员').disabled = true
            recordset.module.field_by_full_name(m + '.出运核准').disabled = true
            recordset.module.field_by_full_name(m + '.风控确认').disabled = true
            recordset.module.field_by_full_name(m + '.风控审单').disabled = true
            recordset.module.field_by_full_name(m + '.审单状态').disabled = true
            recordset.module.field_by_full_name(
                m + '.审单状态',
            ).view.can_modi_in_workflow = false
            recordset.module.field_by_full_name(
                m + '.信保特定',
            ).view.can_modi_in_workflow = false
            recordset.module.field_by_full_name(
                m + '.报关单上传',
            ).view.can_modi_in_workflow = false
            recordset.module.field_by_full_name(
                m + '.审单说明',
            ).view.can_modi_in_workflow = false

            recordset.module.field_by_full_name(m + '.风控暂扣').disabled = true
            recordset.module.field_by_full_name(m + '.风控单证').disabled = true
            recordset.module.field_by_full_name(m + '.单证状态').disabled = true
            recordset.module.field_by_full_name(m + '.风控说明').disabled = true
            recordset.module.field_by_full_name(m + '.审单说明').disabled = true
            recordset.module.field_by_full_name(m + '.单证说明').disabled = true
            recordset.module.field_by_full_name(m + '.单证人员').disabled = true
            recordset.module.field_by_full_name(m + '.是否新客').disabled = true
            recordset.module.field_by_full_name(m + '.新客时间').disabled = true
            recordset.module.field_by_full_name(m + '.信保特定').disabled = true
            recordset.module.field_by_full_name(m + '.数值').hide()
            let sp = recordset.val('出运申请')
            recordset.module.field_by_full_name(m + '.报关率要求').hide()
            recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled =
                true
            recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
                true
            recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
                true
            if (recordset.val('出运申请') != '') {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = true
            }
            if (
                username == recordset.val('风控审单') ||
                username == recordset.val('风控人员') ||
                username == recordset.val('风控单证') ||
                username == recordset.val('出运申请') ||
                username == recordset.val('总监核准') ||
                username == recordset.val('单证人员') ||
                recordset.val('出运申请') != ''
            ) {
                recordset.module.field_by_full_name(m + '.出运申请').disabled = true
                recordset.module.field_by_full_name(m + '.外销发票').disabled = true
                recordset.module.field_by_full_name(m + '.出运单号').disabled = true
                recordset.module.field_by_full_name(m + '.合同号码').disabled = true
                recordset.module.field_by_full_name(m + '.所有合同').disabled = true
                recordset.module.field_by_full_name(m + '.未出清单').disabled = true
                recordset.module.field_by_full_name(m + '.客户编号').disabled = true
                recordset.module.field_by_full_name(m + '.客户名称').disabled = true
                recordset.module.field_by_full_name(m + '.客户合同').disabled = true
                recordset.module.field_by_full_name(m + '.货币代码').disabled = true
                recordset.module.field_by_full_name(m + '.价格条款').disabled = true
                recordset.module.field_by_full_name(m + '.结汇方式').disabled = true
                recordset.module.field_by_full_name(m + '.运输方式').disabled = true
                recordset.module.field_by_full_name(m + '.出运口岸').disabled = true
                recordset.module.field_by_full_name(m + '.中转口岸').disabled = true
                recordset.module.field_by_full_name(m + '.目的口岸').disabled = true
                recordset.module.field_by_full_name(m + '.我方公司').disabled = true
                recordset.module.field_by_full_name(m + '.贸易国别').disabled = true
                recordset.module.field_by_full_name(m + '.是否信保').disabled = true
                recordset.module.field_by_full_name(m + '.LC信保').disabled = true
                recordset.module.field_by_full_name(m + '.货物状态').disabled = true
                recordset.module.field_by_full_name(m + '.采购完成').disabled = true
                recordset.module.field_by_full_name(m + '.装柜人员').disabled = true
                recordset.module.field_by_full_name(m + '.信保费率').disabled = true
                recordset.module.field_by_full_name(m + '.信用证号').disabled = true
                recordset.module.field_by_full_name(m + '.目的仓库').disabled = true
                recordset.module.field_by_full_name(m + '.所属地区').disabled = true
                recordset.module.field_by_full_name(m + '.抬头代码').disabled = true
                recordset.module.field_by_full_name(m + '.货代名称').disabled = true
                recordset.module.field_by_full_name(m + '.船运公司').disabled = true
                recordset.module.field_by_full_name(m + '.运费支付').disabled = true
                recordset.module.field_by_full_name(m + '.信保费率').disabled = true
                // recordset.module.field_by_full_name(m + '.业务人员.').disabled = true;
                recordset.module.field_by_full_name(m + '.可否转运').disabled = true
                recordset.module.field_by_full_name(m + '.可否分批').disabled = true
                recordset.module.field_by_full_name(m + '.装柜日期').disabled = true
                recordset.module.field_by_full_name(m + '.装柜地点').disabled = true
                recordset.module.field_by_full_name(m + '.起始船期').disabled = true
                recordset.module.field_by_full_name(m + '.结束船期').disabled = true
                recordset.module.field_by_full_name(m + '.贸易方式').disabled = true
                recordset.module.field_by_full_name(m + '.预计船期').disabled = true
                recordset.module.field_by_full_name(m + '.预计到港').disabled = true
                recordset.module.field_by_full_name(m + '.货柜类型').disabled = true
                recordset.module.field_by_full_name(m + '.货柜容积').disabled = true
                recordset.module.field_by_full_name(m + '.货柜箱号').disabled = true
                recordset.module.field_by_full_name(m + '.封  号').disabled = true
                recordset.module.field_by_full_name(m + '.箱号明细').disabled = true
                recordset.module.field_by_full_name(m + '.佣金点数').disabled = true
                recordset.module.field_by_full_name(m + '.地    区').disabled = true
                recordset.module.field_by_full_name(m + '.监装人员').disabled = true
                recordset.module.field_by_full_name(m + '.车子重量').disabled = true
                recordset.module.field_by_full_name(m + '.货柜重量').disabled = true
                recordset.module.field_by_full_name(m + '.车加空柜').disabled = true
                recordset.module.field_by_full_name(m + '.车加重柜').disabled = true
                recordset.module.field_by_full_name(m + '.货好日期').disabled = true
                recordset.module.field_by_full_name(m + '.是否电放').disabled = true
                recordset.module.field_by_full_name(m + '.所需服务').disabled = true
                recordset.module.field_by_full_name(m + '.付款方式').disabled = true
                recordset.module.field_by_full_name(
                    m + '.Insurance 是否做保险',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.数量合计').disabled = true
                recordset.module.field_by_full_name(m + '.箱数合计').disabled = true
                recordset.module.field_by_full_name(m + '.毛重合计').disabled = true
                recordset.module.field_by_full_name(m + '.净重合计').disabled = true
                recordset.module.field_by_full_name(m + '.体积合计').disabled = true
                recordset.module.field_by_full_name(m + '.出货数量').disabled = true
                recordset.module.field_by_full_name(m + '.出货毛重').disabled = true
                recordset.module.field_by_full_name(m + '.出货净重').disabled = true
                recordset.module.field_by_full_name(m + '.出货体积').disabled = true
                recordset.module.field_by_full_name(m + '.货柜数量').disabled = true
                recordset.module.field_by_full_name(m + '.出货箱数').disabled = true
                recordset.module.field_by_full_name(m + '.汇    率').disabled = true
                recordset.module.field_by_full_name(m + '.外销总额').disabled = true
                recordset.module.field_by_full_name(m + '.人民币出货额').disabled = true
                recordset.module.field_by_full_name(m + '.客户RMB总价').disabled = true
                recordset.module.field_by_full_name(m + '.加项名称').disabled = true
                recordset.module.field_by_full_name(m + '.减项名称').disabled = true
                recordset.module.field_by_full_name(m + '.减项金额').disabled = true
                recordset.module.field_by_full_name(m + '.减项名称').disabled = true
                recordset.module.field_by_full_name(m + '.已收定金').disabled = true
                recordset.module.field_by_full_name(m + '.佣金金额').disabled = true
                recordset.module.field_by_full_name(m + '.暗佣合计').disabled = true
                recordset.module.field_by_full_name(m + '.明佣合计').disabled = true
                if (
                    username == recordset.val('风控审单') ||
                    username == recordset.val('风控人员') ||
                    username == recordset.val('风控单证') ||
                    username == recordset.val('单证人员')
                ) {
                    recordset.module.field_by_full_name(m + '.定金查看').hide()
                    recordset.module.field_by_full_name(m + '.预估毛利率').hide()
                    recordset.module.field_by_full_name(m + '.预估毛利').hide()
                }
                recordset.module.field_by_full_name(m + '.总 品 名').disabled = true
                recordset.module.field_by_full_name(m + '.我方抬头').disabled = true
                recordset.module.field_by_full_name(m + '.收 货 人').disabled = true
                recordset.module.field_by_full_name(m + '.抬 头 人').disabled = true
                recordset.module.field_by_full_name(m + '.通 知 人').disabled = true
                recordset.module.field_by_full_name(m + '.唛    头').disabled = false
                recordset.module.field_by_full_name(m + '.唛    头').disabled = true
                recordset.module.field_by_full_name(m + '.唛头图片').disabled = true
                recordset.module.field_by_full_name(m + '.开证银行').disabled = false
                recordset.module.field_by_full_name(m + '.开证银行').disabled = true
                recordset.module.field_by_full_name(m + '.注意事项').disabled = false
                recordset.module.field_by_full_name(m + '.注意事项').disabled = true
                recordset.module.field_by_full_name(m + '.其它说明').disabled = false
                recordset.module.field_by_full_name(m + '.其它说明').disabled = true
                recordset.module.field_by_full_name(m + '.发票备注').disabled = false
                recordset.module.field_by_full_name(m + '.发票备注').disabled = true
                recordset.module.field_by_full_name(m + '.合同备注').disabled = false
                recordset.module.field_by_full_name(m + '.合同备注').disabled = true
                recordset.module.field_by_full_name(m + '.装柜备注').disabled = false
                recordset.module.field_by_full_name(m + '.装柜备注').disabled = true
                recordset.module.field_by_full_name(m + '.货代资料').disabled = false
                recordset.module.field_by_full_name(m + '.货代资料').disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.外销合同').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.预计船期').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.中文报关品名',
                ).disabled = true
                recordset.module.field_by_full_name(
                    m + '.产品资料.英文报关品名',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.增值税率').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.交货日期').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.箱    数').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.出货数量').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.剩余数量').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.报关单位').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.海关编码').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.退 税 率').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.出货箱数').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.业务人员').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.采购人员').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.备    注').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.中文品名').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.是否代开').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.代开点数').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.结算方式').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.专业货号').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.专业厂家id',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.专业厂家').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.交货地点').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.签约地点').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.内盒装箱量',
                ).disabled = true
                recordset.module.field_by_full_name(
                    m + '.产品资料.内盒/外箱',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.跟单人员').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.验货人员').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.是否拼箱').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.客人CODE').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.是否商检').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.单据品名').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.单据品名英',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.RMB客户').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.单据品名外',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.开票工厂').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.组织机构代码',
                ).disabled = true
                recordset.module.field_by_full_name(
                    m + '.产品资料.开票联系人',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.开票电话').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.进仓时间').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.客人条码').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.入库地点').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.材质英文').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.审单建议').disabled =
                    true
                recordset.module.field_by_full_name(
                    m + '.产品资料.先前出运数量',
                ).disabled = true
                recordset.module.field_by_full_name(
                    m + '.产品资料.采购合同数',
                ).disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.付款抬头').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.RMB客户').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.赠送').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.采购总价').disabled =
                    true
                if (
                    username == recordset.val('出运申请') &&
                    username !== recordset.val('制单人员')
                ) {
                    recordset.module.field_by_full_name(m + '.产品资料.外销总价').hide()
                    recordset.module
                        .field_by_full_name(m + '.产品资料.客户RMB总价')
                        .hide()
                } else {
                    recordset.module.field_by_full_name(
                        m + '.产品资料.外销总价',
                    ).disabled = true
                    recordset.module.field_by_full_name(
                        m + '.产品资料.客户RMB总价',
                    ).disabled = true
                }
                recordset.module.field_by_full_name(m + '.产品资料.RMB客户').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
                    true
                recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
                    true
                if (
                    (username == recordset.val('出运申请') ||
                        username == recordset.val('总监核准')) &&
                    recordset.val('风控人员') == '' &&
                    recordset.val('出运核准') == '通过'
                ) {
                    if (recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1) {} else {
                        recordset.module.field_by_full_name(m + '.风控人员').disabled =
                            false
                    }
                }
                if (username == recordset.val('风控人员')) {
                    recordset.module.field_by_full_name(m + '.数值').show()
                    recordset.module.field_by_full_name(m + '.信保特定').disabled = false
                    recordset.module.field_by_full_name(m + '.报关率要求').show()
                    if (recordset.val('单证确认') !== '结束') {
                        recordset.module.field_by_full_name(m + '.风控暂扣').disabled =
                            false
                    }
                    if (recordset.val('风控确认') !== '通过') {
                        recordset.module.field_by_full_name(m + '.风控确认').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.是否新客').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.新客时间').disabled =
                            false
                    } else {
                        if (recordset.val('风控审单') === '') {
                            recordset.module.field_by_full_name(m + '.风控审单').disabled =
                                false
                        }
                        if (recordset.val('风控单证') === '') {
                            recordset.module.field_by_full_name(m + '.风控单证').disabled =
                                false
                        }
                    }
                    recordset.module.field_by_full_name(m + '.风控说明').disabled = false
                }
                if (username == recordset.val('风控审单')) {
                    recordset.module.field_by_full_name(
                        m + '.审单状态',
                    ).view.can_modi_in_workflow = true
                    recordset.module.field_by_full_name(
                        m + '.信保特定',
                    ).view.can_modi_in_workflow = true
                    recordset.module.field_by_full_name(
                        m + '.报关单上传',
                    ).view.can_modi_in_workflow = true
                    recordset.module.field_by_full_name(
                        m + '.审单说明',
                    ).view.can_modi_in_workflow = true
                    recordset.module.field_by_full_name(m + '.审单状态').disabled = false
                    recordset.module.field_by_full_name(m + '.审单说明').disabled = false
                    recordset.module.field_by_full_name(m + '.报关率要求').show()
                    if (recordset.val('单证确认') !== '结束') {
                        recordset.module.field_by_full_name(m + '.信保特定').disabled =
                            false
                    }
                    recordset.module.field_by_full_name(
                        m + '.产品资料.审单建议',
                    ).disabled = false
                }
                if (username == recordset.val('风控单证')) {
                    if (recordset.val('单证状态') === '通过') {
                        recordset.module.field_by_full_name(m + '.单证人员').disabled =
                            false
                    } else {
                        recordset.module.field_by_full_name(m + '.单证状态').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.预计到港').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.货柜类型').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.货柜容积').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.货柜箱号').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.封  号').disabled = false
                        recordset.module.field_by_full_name(m + '.箱号明细').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.货柜数量').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.预计船期').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.货代名称').disabled =
                            false
                        recordset.module.field_by_full_name(m + '.船运公司').disabled =
                            false
                    }
                    recordset.module.field_by_full_name(m + '.单证说明').disabled = false
                }
                if (username == recordset.val('单证人员')) {
                    recordset.module.field_by_full_name(m + '.预计船期').disabled = false
                    recordset.module.field_by_full_name(m + '.货代名称').disabled = false
                    recordset.module.field_by_full_name(m + '.船运公司').disabled = false
                    recordset.module.field_by_full_name(m + '.预计到港').disabled = false
                    recordset.module.field_by_full_name(m + '.货柜类型').disabled = false
                    recordset.module.field_by_full_name(m + '.货柜容积').disabled = false
                    recordset.module.field_by_full_name(m + '.货柜箱号').disabled = false
                    recordset.module.field_by_full_name(m + '.封  号').disabled = false
                    recordset.module.field_by_full_name(m + '.箱号明细').disabled = false
                    recordset.module.field_by_full_name(m + '.货柜数量').disabled = false
                    if (
                        recordset.val('风控确认') === '通过' ||
                        recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1
                    ) {
                        recordset.module.field_by_full_name(m + '.单证确认').disabled =
                            false
                    }
                }
            } else {
                recordset.module.field_by_full_name(m + '.产品资料.审单建议').disabled =
                    true
            }
            if (recordset.val('出运免审') === '是') {} else {
                recordset.module.field_by_full_name(m + '.出运核准').disabled = true
                recordset.module.field_by_full_name(m + '.未批原因').disabled = true
                if (sp !== '') {
                    recordset.module.field_by_full_name(m + '.出运申请').disabled = true
                    if (sp === username || username === recordset.val('总监核准')) {
                        if (recordset.val('出运核准') !== '通过') {
                            recordset.module.field_by_full_name(m + '.出运核准').disabled =
                                false
                        }
                        if (
                            recordset.val('客户名称').toUpperCase().indexOf('AMAZON') != -1
                        ) {
                            recordset.module.field_by_full_name(m + '.出运核准').disabled =
                                false
                        }
                        recordset.module.field_by_full_name(m + '.未批原因').disabled =
                            false
                    }
                }
            }
            if (recordset.val('外销发票') != '') {
                recordset.val('定金预测', ysdj)
                recordset.module.field_by_full_name(m + '.外销发票').disabled =
                    d.cybz == 1
            } else {
                recordset.module.field_by_full_name(m + '.已收定金').disabled = true
            }
            recordset._list[m + '.出运申请'] = d.dl_list
            recordset.refresh_ui()
        })
        .catch((err) => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
}
_.evts.on([_.evtids.RECORD_LOAD], shipping_recordLoad, '出运计划')

const shipping_after_save = (evt_id, recordset) => {
    if (recordset.val('wf_status') == 0 || recordset.val('wf_status') == 3) {
        if (recordset.val('出运申请') == '') return
        if (recordset.val('uid') !== _.user.rid) return
        _.ui.confirm('是否提交审批？').then(() => {
            _.http
                .post('/api/saier/workflow/start', {
                    rid: recordset.val('rid'),
                    module: recordset.module.name,
                    flow_name: '出运计划',
                })
                .then((res) => {
                    recordset.val('wf_status', 1)
                    recordset.val('wf_status', '出运申请')
                    _.ui.message.success('启动成功')
                    _.platform.active.reload_data()
                })
                .catch((res) => {
                    _.ui.message.error(res.msg)
                    console.log(res)
                })
        })
    } else if (recordset.val('wf_status') == 1) {
        let current_unit = recordset.val('wf_unit')
        let next_unit = ''
        let wf_status = 1
        if (
            recordset.val('uid') == _.user.rid &&
            recordset.val('出运申请') != '' &&
            current_unit == '业务人员'
        ) {
            next_unit = '出运申请'
        } else if (
            (recordset.val('出运申请') == _.user.username ||
                recordset.val('总监核准') == _.user.username) &&
            current_unit == '出运申请' &&
            recordset.val('出运核准') != '待审批'
        ) {
            if (recordset.val('出运核准') != '通过') {
                next_unit = '业务人员'
                wf_status = 2
            } else {
                next_unit = '风控人员'
            }
        } else if (
            recordset.val('风控人员') == _.user.username &&
            current_unit == '风控人员' &&
            recordset.val('风控确认') != '待审批' &&
            recordset.val('出运核准') == '通过'
        ) {
            if (recordset.val('风控确认') != '通过') {
                next_unit = '业务人员'
                wf_status = 2
            } else {
                next_unit = '风控单证'
            }
            // } else if (recordset.val('风控审单') == _.user.username && recordset.val('审单状态') != '待审批' && current_unit == '风控审单' && recordset.val('风控确认') == '通过') {
            //     next_unit = '风控单证'
        } else if (
            recordset.val('风控单证') == _.user.username &&
            recordset.val('单证状态') != '待审批' &&
            current_unit == '风控单证' &&
            recordset.val('审单状态') == '结束'
        ) {
            if (recordset.val('单证状态') != '通过') {
                next_unit = '业务人员'
                wf_status = 2
            } else {
                next_unit = ''
            }
            // } else if (recordset.val('单证人员') == _.user.username && recordset.val('单证确认') != '待审批' && current_unit == '单证人员' && recordset.val('风控暂扣') != '是' && recordset.val('单证状态') == '通过') {
            //     if (recordset.val('单证确认') != '结束') {
            //         next_unit = '业务人员'
            //         wf_status = 2
            //     } else {
            //         next_unit = ''
            //     }
        } else {
            return
        }
        _.http
            .post('/api/saier/audit/save/after', {
                rid: recordset.val('rid'),
                module: recordset.module.name,
            })
            .then((r) => {
                console.log(r)
                if (r.code == 0) {
                    return
                }
                let d = r.data
                _.http
                    .post('/api/workflow/task/flow', {
                        instance: d.instance_rid,
                        status: wf_status,
                        task_id: d.task_rid,
                    })
                    .then((res) => {
                        recordset.val('wf_unit', next_unit)
                        recordset.val('wf_status', wf_status)
                    })
                    .catch((res) => {
                        _.ui.message.error(res.msg)
                        console.log(res)
                    })
            })
            .catch((r) => {
                _.ui.message.error(r.msg)
                console.log(r)
            })
    }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, shipping_after_save, '出运计划')

// function shipping_table_delete_before(evt_id, table, recordset) {
//     return new Promise((resolve, reject) => {
//         if (table.group == '产品资料') {

//         } else if (table.group == '补报信息') {

//         } else {
//             resolve()
//         }
//     })
// }
// _.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], shipping_table_delete_before, '出运计划')