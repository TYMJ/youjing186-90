// 编辑界面数据加载以后执行
const shipment_amendment_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username;

    // 默认先锁定
    recordset.module.field_by_full_name('提交单证').disabled = true;
    recordset.module.field_by_full_name('单证审批').disabled = true;
    recordset.module.field_by_full_name('单证意见').disabled = true;
    recordset.module.field_by_full_name('提交风控').disabled = true;
    recordset.module.field_by_full_name('风控审批').disabled = true;
    recordset.module.field_by_full_name('风控意见').disabled = true;
    recordset.module.field_by_full_name('提交主管').disabled = true;
    recordset.module.field_by_full_name('主管审批').disabled = true;
    recordset.module.field_by_full_name('意见备注').disabled = true;
    recordset.module.field_by_full_name('提交总经理').disabled = true;
    recordset.module.field_by_full_name('总经理审批').disabled = true;
    recordset.module.field_by_full_name('总经理意见').disabled = true;
    recordset.module.field_by_full_name('提交财务').disabled = true;
    recordset.module.field_by_full_name('财务审批').disabled = true;
    recordset.module.field_by_full_name('财务意见').disabled = true;
    recordset.module.field_by_full_name('发票号码').disabled = true;
    recordset.module.field_by_full_name('加项名称1').disabled = true;
    recordset.module.field_by_full_name('加项金额1').disabled = true;
    recordset.module.field_by_full_name('加项名称2').disabled = true;
    recordset.module.field_by_full_name('加项金额2').disabled = true;
    recordset.module.field_by_full_name('加项名称3').disabled = true;
    recordset.module.field_by_full_name('加项金额3').disabled = true;
    recordset.module.field_by_full_name('减项名称1').disabled = true;
    recordset.module.field_by_full_name('减项金额1').disabled = true;
    recordset.module.field_by_full_name('减项名称2').disabled = true;
    recordset.module.field_by_full_name('减项金额2').disabled = true;
    recordset.module.field_by_full_name('减项名称3').disabled = true;
    recordset.module.field_by_full_name('减项金额3').disabled = true;
    recordset.module.field_by_full_name('注意事项').disabled = true;
    recordset.module.field_by_full_name('其它说明').disabled = true;
    recordset.module.field_by_full_name('产品资料.产品编号').disabled = true;
    recordset.module.field_by_full_name('产品资料.中文品名').disabled = true;
    recordset.module.field_by_full_name('产品资料.中文报关品名').disabled = true;
    recordset.module.field_by_full_name('产品资料.工厂名称').disabled = true;
    recordset.module.field_by_full_name('产品资料.增值税率').disabled = true;
    recordset.module.field_by_full_name('产品资料.退 税 率').disabled = true;
    recordset.module.field_by_full_name('产品资料.结算方式').disabled = true;
    recordset.module.field_by_full_name('产品资料.进仓日期').disabled = true;
    recordset.module.field_by_full_name('产品资料.采购单价').disabled = true;
    recordset.module.field_by_full_name('产品资料.采购总价').disabled = true;
    recordset.module.field_by_full_name('产品资料.外销单价').disabled = true;
    recordset.module.field_by_full_name('产品资料.外销总价').disabled = true;
    recordset.module.field_by_full_name('产品资料.客户RMB单价').disabled = true;
    recordset.module.field_by_full_name('产品资料.客户RMB总价').disabled = true;
    recordset.module.field_by_full_name('产品资料.外箱容量').disabled = true;
    recordset.module.field_by_full_name('产品资料.箱    数').disabled = true;
    recordset.module.field_by_full_name('产品资料.出货数量').disabled = true;
    recordset.module.field_by_full_name('产品资料.毛    重').disabled = true;
    recordset.module.field_by_full_name('产品资料.总 毛 重').disabled = true;
    recordset.module.field_by_full_name('产品资料.净    重').disabled = true;
    recordset.module.field_by_full_name('产品资料.总 净 重').disabled = true;
    recordset.module.field_by_full_name('产品资料.外箱体积').disabled = true;
    recordset.module.field_by_full_name('产品资料.总 体 积').disabled = true;

    _.http.post('/api/saier/shipment_amendment/load/check', {
        fphm: recordset.val('发票号码'),
        hz_old: recordset.val('货值合计'),
        hz_new: recordset.val('货值合计1')
    }).then(res => {
        if (res.code != 1) return;

        // 财务审批组显示控制
        if (res.data.sbc != 1) {
            recordset.module.group_by_name('财务审批').visible = false;
        }

        // 风控审批组显示控制
        if (res.data.sbf != 1) {
            recordset.module.group_by_name('风控审批').visible = false;
        }

        // 经办人可编辑区
        if (recordset.val('提交主管') == '' && recordset.val('经办人员') == username) {
            if (recordset.val('申请编号') != '') {
                recordset.module.field_by_full_name('提交单证').disabled = false;
                recordset.module.field_by_full_name('提交风控').disabled = false;
                recordset.module.field_by_full_name('提交主管').disabled = false;
                recordset.module.field_by_full_name('提交总经理').disabled = false;
                recordset.module.field_by_full_name('提交财务').disabled = false;
            }
            recordset.module.field_by_full_name('发票号码').disabled = false;
            recordset.module.field_by_full_name('加项名称1').disabled = false;
            recordset.module.field_by_full_name('加项金额1').disabled = false;
            recordset.module.field_by_full_name('加项名称2').disabled = false;
            recordset.module.field_by_full_name('加项金额2').disabled = false;
            recordset.module.field_by_full_name('加项名称3').disabled = false;
            recordset.module.field_by_full_name('加项金额3').disabled = false;
            recordset.module.field_by_full_name('减项名称1').disabled = false;
            recordset.module.field_by_full_name('减项金额1').disabled = false;
            recordset.module.field_by_full_name('减项名称2').disabled = false;
            recordset.module.field_by_full_name('减项金额2').disabled = false;
            recordset.module.field_by_full_name('减项名称3').disabled = false;
            recordset.module.field_by_full_name('减项金额3').disabled = false;
            recordset.module.field_by_full_name('注意事项').disabled = false;
            recordset.module.field_by_full_name('其它说明').disabled = false;
            recordset.module.field_by_full_name('产品资料.产品编号').disabled = false;
            recordset.module.field_by_full_name('产品资料.中文品名').disabled = false;
            recordset.module.field_by_full_name('产品资料.进仓日期').disabled = false;
            recordset.module.field_by_full_name('产品资料.箱    数').disabled = false;
            recordset.module.field_by_full_name('产品资料.出货数量').disabled = false;
            recordset.module.field_by_full_name('产品资料.毛    重').disabled = false;
            recordset.module.field_by_full_name('产品资料.总 毛 重').disabled = false;
            recordset.module.field_by_full_name('产品资料.净    重').disabled = false;
            recordset.module.field_by_full_name('产品资料.总 净 重').disabled = false;
            recordset.module.field_by_full_name('产品资料.外箱体积').disabled = false;
            recordset.module.field_by_full_name('产品资料.总 体 积').disabled = false;
        }

        // 单证审批
        if (recordset.val('提交单证') == username
            && (recordset.val('风控审批') == '通过' || res.data.sbf != 1)
            && (recordset.val('财务审批') == '待审批' || res.data.sbc != 1)
            && recordset.val('总经理审批') == '通过') {
            recordset.module.field_by_full_name('单证审批').disabled = false;
            recordset.module.field_by_full_name('单证意见').disabled = false;
            recordset.module.field_by_full_name('提交财务').disabled = false;
        }

        // 风控审批
        if (recordset.val('提交风控') == username
            && recordset.val('单证审批') == '待审批'
            && recordset.val('总经理审批') == '通过') {
            recordset.module.field_by_full_name('风控审批').disabled = false;
            recordset.module.field_by_full_name('风控意见').disabled = false;
            recordset.module.field_by_full_name('提交单证').disabled = false;
        }

        // 主管审批
        if (recordset.val('提交主管') == username
            && recordset.val('总经理审批') == '待审批') {
            recordset.module.field_by_full_name('主管审批').disabled = false;
            recordset.module.field_by_full_name('意见备注').disabled = false;
            recordset.module.field_by_full_name('提交总经理').disabled = false;
        }

        // 总经理审批
        if (recordset.val('提交总经理') == username
            && recordset.val('主管审批') == '通过'
            && (recordset.val('风控审批') == '待审批'
                || (res.data.sbf != 1 && recordset.val('单证审批') == '待审批'))) {
            recordset.module.field_by_full_name('总经理审批').disabled = false;
            recordset.module.field_by_full_name('总经理意见').disabled = false;
            recordset.module.field_by_full_name('提交单证').disabled = false;
            recordset.module.field_by_full_name('提交风控').disabled = false;
        }

        // 财务审批
        if (recordset.val('提交财务') == username
            && recordset.val('单证审批') == '通过') {
            recordset.module.field_by_full_name('财务审批').disabled = false;
            recordset.module.field_by_full_name('财务意见').disabled = false;
        }

        // 非可见角色：隐藏敏感字段
        if (res.data.wx != 1) {
            recordset.module.group_by_name('原数据').visible = false;
            recordset.module.group_by_name('更改后数据').visible = false;
            recordset.module.group_by_name('风控审批').visible = false;

            recordset.module.field_by_full_name('产品资料.外销单价').visible = false;
            recordset.module.field_by_full_name('产品资料.外销总价').visible = false;
            recordset.module.field_by_full_name('产品资料.客户RMB单价').visible = false;
            recordset.module.field_by_full_name('产品资料.客户RMB总价').visible = false;
            recordset.module.field_by_full_name('产品资料.佣金单价').visible = false;
            recordset.module.field_by_full_name('产品资料.佣金总价').visible = false;
            recordset.module.field_by_full_name('产品资料.外销总价总').visible = false;
            recordset.module.field_by_full_name('产品资料.毛利率').visible = false;
            recordset.module.field_by_full_name('产品资料.佣金比率').visible = false;
            recordset.module.field_by_full_name('产品资料.佣    金').visible = false;
            recordset.module.field_by_full_name('产品资料.暗佣比率').visible = false;
            recordset.module.field_by_full_name('产品资料.暗佣单价').visible = false;
            recordset.module.field_by_full_name('产品资料.暗佣佣金').visible = false;
            recordset.module.field_by_full_name('产品资料.采购总价rmb').visible = false;
            recordset.module.field_by_full_name('产品资料.原外销单价').visible = false;
            recordset.module.field_by_full_name('产品资料.原外销总价').visible = false;
            recordset.module.field_by_full_name('产品资料.原客户RMB单价').visible = false;
            recordset.module.field_by_full_name('产品资料.原客户RMB总价').visible = false;
        }
    }).catch(err => {
        console.log(err);
        _.ui.message.error(err.msg || '加载失败');
    });
};
_.evts.on([_.evtids.RECORD_LOAD], shipment_amendment_recordLoad, '出运改单')

// // 编辑界面字段change后执行
const shipment_amendment_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value,
        current_record
    } = opts;
    let n = module.name
    let username = _.user.username
    let row = current_record

    if (field.full_name == n + '.提交单证') {
        const tjdz = (recordset.val('提交单证')).trim()

        _.http.post('/api/saier/shipment_amendment/field/tjdz/change', {
            tjdz: tjdz,
            fkbh: recordset.val('申请编号'),
            jbry: recordset.val('经办人员'),
            hz_old: recordset.val('货值合计'),
            hz_new: recordset.val('货值合计1'),
            fksp: recordset.val('风控审批'),
            zjlsp: recordset.val('总经理审批'),
            rid: recordset.val('rid')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交单证校验失败')
                if (res.data && res.data.clear_tjdz == 1) {
                    recordset.val('提交单证', '')
                }
                return
            }

            if (res.data && res.data.clear_tjdz == 1) {
                recordset.val('提交单证', '')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交单证校验失败')
            recordset.val('提交单证', '')
        })
    }

    if (field.full_name == n + '.提交主管') {
        const tjzg = (recordset.val('提交主管') || '').trim()
        if (tjzg == '') {
            return
        }

        const t = recordset.tables['产品资料']
        const details = (t && t.view_data) ? t.view_data : []

        const detail_rows = details.map(r => ({
            cywyzd: String(r['出运唯一字段'] || ''),
            cpbh: String(r['产品编号'] || ''),
            chsl: Number(r['出货数量'] || 0),
            rmbkh: String(r['RMB客户'] || recordset.val('RMB客户') || ''),
            cghbdm: String(r['采购货币'] || ''),
            cgzj: Number(r['采购总价'] || 0),
            wxzj: Number(r['外销总价'] || 0),
            mjzj: Number(r['客户RMB总价'] || 0),
            wxzjz: Number(r['外销总价总'] || 0),
            ztj: Number(r['总 体 积'] || 0),
            tse: Number(r['退 税 额'] || 0),
            yj: Number(r['佣    金'] || 0),
            ayj: Number(r['暗佣佣金'] || 0)
        }))

        _.http.post('/api/saier/shipment_amendment/field/tjzg/change', {
            tjzg: tjzg,
            fkbh: recordset.val('申请编号'),
            fphm: recordset.val('发票号码'),
            jbry: recordset.val('经办人员'),
            tjdz: recordset.val('提交单证'),
            tjfk: recordset.val('提交风控'),
            tjzjl: recordset.val('提交总经理'),
            tjcw: recordset.val('提交财务'),

            rmbkh: recordset.val('RMB客户'),
            hl: Number(recordset.val('汇    率') || 1),

            jx1: Number(recordset.val('加项金额1') || 0),
            jx2: Number(recordset.val('加项金额2') || 0),
            jx3: Number(recordset.val('加项金额3') || 0),
            jxj1: Number(recordset.val('减项金额1') || 0),
            jxj2: Number(recordset.val('减项金额2') || 0),
            jxj3: Number(recordset.val('减项金额3') || 0),

            detail_rows: detail_rows
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交主管处理失败')
                if (res.data && res.data.clear_tjzg == 1) {
                    recordset.val('提交主管', '')
                }
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交主管处理失败')
            recordset.val('提交主管', '')
        })
    }

    if (field.full_name == n + '.提交总经理') {
        const tjzjl = (recordset.val('提交总经理')).trim()
        if (tjzjl == '') {
            return
        }
        _.http.post('/api/saier/shipment_amendment/field/tjzjl/change', {
            fkbh: recordset.val('申请编号'),
            tjzjl: tjzjl,
            tjzg: recordset.val('提交主管'),
            zgsp: recordset.val('主管审批'),
            jbry: recordset.val('经办人员')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交总经理校验失败')
                if (res.data && res.data.clear_tjzjl == 1) {
                    recordset.val('提交总经理', '')
                }
                return
            }

            if (res.data && res.data.clear_tjzjl == 1) {
                recordset.val('提交总经理', '')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交总经理校验失败')
            recordset.val('提交总经理', '')
        })
    }

    if (field.full_name == n + '.提交风控') {
        const tjfk = (recordset.val('提交风控')).trim()
        if (tjfk == '') {
            return
        }

        _.http.post('/api/saier/shipment_amendment/field/tjfk/change', {
            fkbh: recordset.val('申请编号'),
            tjfk: tjfk,
            zjlsp: recordset.val('总经理审批'),
            jbry: recordset.val('经办人员')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交风控校验失败')
                if (res.data && res.data.clear_tjfk == 1) {
                    recordset.val('提交风控', '')
                }
                return
            }

            if (res.data && res.data.clear_tjfk == 1) {
                recordset.val('提交风控', '')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交风控校验失败')
            recordset.val('提交风控', '')
        })
    }

    if (field.full_name == n + '.提交财务') {
        const tjcw = (recordset.val('提交财务')).trim()
        if (tjcw == '') {
            return
        }

        _.http.post('/api/saier/shipment_amendment/field/tjcw/change', {
            fkbh: recordset.val('申请编号'),
            tjcw: tjcw,
            dzsp: recordset.val('单证审批'),
            jbry: recordset.val('经办人员')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交财务校验失败')
                if (res.data && res.data.clear_tjcw == 1) {
                    recordset.val('提交财务', '')
                }
                return
            }

            if (res.data && res.data.clear_tjcw == 1) {
                recordset.val('提交财务', '')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交财务校验失败')
            recordset.val('提交财务', '')
        })
    }

    if (field.full_name == n + '.主管审批1') {
        const zgsp = recordset.val('主管审批1')
        if (zgsp == '' || zgsp == '待审批') {
            return
        }

        const fkbh = recordset.val('申请编号')
        const jbry = recordset.val('经办人员')
        const tjzjl = recordset.val('提交总经理')

        // 不通过：先拿意见，再提交接口
        if (zgsp == '不通过') {
            _.ui.show_input_dialog('请输入审批意见', recordset.val('意见备注')).then(val => {
                const yjbz = (val).trim()
                if (yjbz == '') {
                    _.ui.message.error('审批意见不能为空')
                    return
                }

                recordset.val('意见备注', yjbz)

                _.http.post('/api/saier/shipment_amendment/field/zgsp/change', {
                    fkbh: fkbh,
                    zgsp: zgsp,
                    yjbz: yjbz,
                    jbry: jbry,
                    tjzjl: tjzjl
                }).then(res => {
                    if (res.code != 1) {
                        _.ui.message.error(res.msg || '主管审批处理失败')
                        return
                    }

                    const p = (res.data && res.data.patch) ? res.data.patch : {}
                    Object.keys(p).forEach(k => recordset.val(k, p[k]))

                    if (res.data && res.data.lock_zgsp_fields == 1) {
                        recordset.module.field_by_full_name('主管审批').disabled = true
                        recordset.module.field_by_full_name('主管日期').disabled = true
                        recordset.module.field_by_full_name('意见备注').disabled = true
                    }
                    if (res.data && res.data.enable_tjzjl == 1) {
                        recordset.module.field_by_full_name('提交总经理').disabled = false
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg || '主管审批处理失败')
                })
            }).catch(() => { })
            return
        }

        // 通过：直接提交
        _.http.post('/api/saier/shipment_amendment/field/zgsp/change', {
            fkbh: fkbh,
            zgsp: zgsp,
            yjbz: (recordset.val('意见备注')),
            jbry: jbry,
            tjzjl: tjzjl
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '主管审批处理失败')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            if (res.data && res.data.lock_zgsp_fields == 1) {
                recordset.module.field_by_full_name('主管审批').disabled = true
                recordset.module.field_by_full_name('主管日期').disabled = true
                recordset.module.field_by_full_name('意见备注').disabled = true
            }
            if (res.data && res.data.enable_tjzjl == 1) {
                recordset.module.field_by_full_name('提交总经理').disabled = false
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '主管审批处理失败')
        })
    }

    if (field.full_name == n + '.总经理审批1') {
        const zjlsp = recordset.val('总经理审批')
        if (zjlsp == '' || zjlsp == '待审批') {
            return
        }

        const fkbh = recordset.val('申请编号')
        const jbry = recordset.val('经办人员')
        const zjlyj = recordset.val('总经理意见')
        const tjfk = recordset.val('提交风控')
        const tjdz = recordset.val('提交单证')

        // 不通过：先拿意见再提交
        if (zjlsp == '不通过') {
            if (zjlyj == '') {
                _.ui.show_input_dialog('请输入总经理意见', '').then(val => {
                    const yj = val
                    if (yj == '') {
                        _.ui.message.error('总经理意见不能为空')
                        return
                    }
                    recordset.val('总经理意见', yj)

                    _.http.post('/api/saier/shipment_amendment/field/zjlsp/change', {
                        fkbh: fkbh,
                        zjlsp: zjlsp,
                        zjlyj: yj,
                        jbry: jbry,
                        tjfk: tjfk,
                        tjdz: tjdz,
                        hz_old: Number(recordset.val('货值合计') || 0),
                        hz_new: Number(recordset.val('货值合计1') || 0)
                    }).then(res => {
                        if (res.code != 1) {
                            _.ui.message.error(res.msg || '总经理审批处理失败')
                            return
                        }

                        const p = (res.data && res.data.patch) ? res.data.patch : {}
                        Object.keys(p).forEach(k => recordset.val(k, p[k]))

                        if (res.data && res.data.lock_zg_group == 1) {
                            recordset.module.field_by_full_name('主管审批').disabled = true
                            recordset.module.field_by_full_name('主管日期').disabled = true
                            recordset.module.field_by_full_name('意见备注').disabled = true
                        }
                        if (res.data && res.data.lock_zjl_group == 1) {
                            recordset.module.field_by_full_name('总经理审批').disabled = true
                            recordset.module.field_by_full_name('总经理意见').disabled = true
                        }
                        if (res.data && res.data.enable_tjfk == 1) {
                            recordset.module.field_by_full_name('提交风控').disabled = false
                        }
                        if (res.data && res.data.enable_tjdz == 1) {
                            recordset.module.field_by_full_name('提交单证').disabled = false
                        }
                    }).catch(err => {
                        console.log(err)
                        _.ui.message.error(err.msg || '总经理审批处理失败')
                    })
                }).catch(() => { })
                return
            }
        }

        // 通过 或 不通过(已有意见)：直接提交
        _.http.post('/api/saier/shipment_amendment/field/zjlsp/change', {
            fkbh: fkbh,
            zjlsp: zjlsp,
            zjlyj: zjlyj,
            jbry: jbry,
            tjfk: tjfk,
            tjdz: tjdz,
            hz_old: Number(recordset.val('货值合计') || 0),
            hz_new: Number(recordset.val('货值合计1') || 0)
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '总经理审批处理失败')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            if (res.data && res.data.lock_zg_group == 1) {
                recordset.module.field_by_full_name('主管审批').disabled = true
                recordset.module.field_by_full_name('主管日期').disabled = true
                recordset.module.field_by_full_name('意见备注').disabled = true
            }
            if (res.data && res.data.lock_zjl_group == 1) {
                recordset.module.field_by_full_name('总经理审批').disabled = true
                recordset.module.field_by_full_name('总经理意见').disabled = true
            }
            if (res.data && res.data.enable_tjfk == 1) {
                recordset.module.field_by_full_name('提交风控').disabled = false
            }
            if (res.data && res.data.enable_tjdz == 1) {
                recordset.module.field_by_full_name('提交单证').disabled = false
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '总经理审批处理失败')
        })
    }

    if (field.full_name == n + '.风控审批1') {
        const fksp = recordset.val('风控审批')
        if (fksp == '' || fksp == '待审批') {
            return
        }

        const fkbh = recordset.val('申请编号')
        const jbry = recordset.val('经办人员')
        const fkyj = recordset.val('风控意见')
        const tjdz = recordset.val('提交单证')

        _.http.post('/api/saier/shipment_amendment/field/fksp/change', {
            fkbh: fkbh,
            fksp: fksp,
            fkyj: fkyj,
            jbry: jbry,
            tjdz: tjdz
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '风控审批处理失败')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            if (res.data && res.data.lock_fk_group == 1) {
                recordset.module.field_by_full_name('风控审批').disabled = true
                recordset.module.field_by_full_name('风控意见').disabled = true
            }
            if (res.data && res.data.enable_tjdz == 1) {
                recordset.module.field_by_full_name('提交单证').disabled = false
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '风控审批处理失败')
        })
    }

    if (field.full_name == n + '.单证审批1') {
        const dzsp = recordset.val('单证审批')
        if (dzsp == '' || dzsp == '待审批') {
            return
        }

        const payload = {
            fkbh: recordset.val('申请编号'),
            dzsp: dzsp,
            dzyj: recordset.val('单证意见'),
            jbry: recordset.val('经办人员'),
            tjcw: recordset.val('提交财务'),
            fphm: recordset.val('发票号码')
        }

        _.http.post('/api/saier/shipment_amendment/field/dzsp/change', payload).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '单证审批处理失败')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            if (res.data && res.data.lock_dz_group == 1) {
                recordset.module.field_by_full_name('单证审批').disabled = true
                recordset.module.field_by_full_name('单证意见').disabled = true
            }

            if (res.data && res.data.enable_tjcw == 1) {
                recordset.module.field_by_full_name('提交财务').disabled = false
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '单证审批处理失败')
        })
    }

    if (field.full_name == n + '.财务审批1') {
        const cwsp = recordset.val('财务审批')
        if (cwsp == '' || cwsp == '待审批') {
            return
        }

        _.http.post('/api/saier/shipment_amendment/field/cwsp/change', {
            fkbh: recordset.val('申请编号'),
            cwsp: cwsp,
            cwyj: recordset.val('财务意见'),
            jbry: recordset.val('经办人员')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '财务审批处理失败')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            if (res.data && res.data.lock_cw_group == 1) {
                recordset.module.field_by_full_name('财务审批').disabled = true
                recordset.module.field_by_full_name('财务意见').disabled = true
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '财务审批处理失败')
        })
    }

    if (field.full_name == n + '.改单状况') {
        const gdzk = (recordset.val('改单状况') || '').trim()
        if (gdzk != '完成') {
            return
        }

        const t = recordset.tables['产品资料']
        const details = (t && t.view_data) ? t.view_data : []
        if (!t || details.length == 0) {
            _.ui.message.error('未找到子表产品资料')
            return
        }

        const fdb = (fname) => recordset.module.field_by_full_name(n + '.产品资料.' + fname).db.name
        const toNum = (v) => {
            const x = Number(v || 0)
            return Number.isNaN(x) ? 0 : x
        }

        const detail_rows = details.map((r, idx) => ({
            row_index: idx,
            cywyzd: String(r[fdb('出运唯一字段')] || ''),
            cywyzd12: String(r[fdb('出运唯一字段12')] || ''),
            wxht: String(r[fdb('外销合同')] || ''),
            cpbh: String(r[fdb('产品编号')] || ''),
            zwpm: String(r[fdb('中文品名')] || ''),
            zhwbgpm: String(r[fdb('中文报关品名')] || ''),
            gcmc: String(r[fdb('工厂名称')] || ''),
            zzsl: parseInt(toNum(r[fdb('增值税率')]), 10) || 0,
            tsl: parseInt(toNum(r[fdb('退 税 率')]), 10) || 0,
            tse: toNum(r[fdb('退 税 额')]),
            jsfs: String(r[fdb('结算方式')] || ''),
            scrq: String(r[fdb('进仓日期')] || ''),
            gcjg: toNum(r[fdb('采购单价')]),
            gczj: toNum(r[fdb('采购总价')]),
            wxjg: toNum(r[fdb('外销单价')]),
            wxzj: toNum(r[fdb('外销总价')]),
            mjdj1: toNum(r[fdb('客户RMB单价')]),
            mjzj: toNum(r[fdb('客户RMB总价')]),
            wxrl: toNum(r[fdb('外箱容量')]),
            chxs: parseInt(toNum(r[fdb('箱    数')]), 10) || 0,
            chsl: toNum(r[fdb('出货数量')]),
            wxmz: toNum(r[fdb('毛    重')]),
            zmz: toNum(r[fdb('总 毛 重')]),
            wxjz: toNum(r[fdb('净    重')]),
            zjz: toNum(r[fdb('总 净 重')]),
            wxtj: toNum(r[fdb('外箱体积')]),
            ztj: toNum(r[fdb('总 体 积')]),
            yj: toNum(r[fdb('佣    金')]),
            yjzj: toNum(r[fdb('佣金总价')]),
            ayj: toNum(r[fdb('暗佣佣金')]),
            gczjrmb: toNum(r[fdb('采购总价rmb')]),
            sj: toNum(r[fdb('税   金')]),
            kpfy: toNum(r[fdb('开票费用')]),
            wxzjz: toNum(r[fdb('外销总价总')]),
            ljrk: toNum(r[fdb('开票点数')]),
            xddd: String(r[fdb('下单地点')] || ''),
            hyd: String(r[fdb('货 源 地')] || ''),
            rmbkh: String(r[fdb('RMB客户')] || recordset.val('RMB客户') || ''),
            cghbdm: String(r[fdb('采购货币')] || '')
        }))

        _.http.post('/api/saier/shipment_amendment/field/gdzk/change', {
            gdzk: gdzk,
            fkbh: recordset.val('申请编号'),
            fphm: recordset.val('发票号码'),
            jbry: recordset.val('经办人员'),
            rmbkh: recordset.val('RMB客户'),
            hl: Number(recordset.val('汇    率') || 1),

            jx1: Number(recordset.val('加项金额1') || 0),
            jx2: Number(recordset.val('加项金额2') || 0),
            jx3: Number(recordset.val('加项金额3') || 0),
            jxj1: Number(recordset.val('减项金额1') || 0),
            jxj2: Number(recordset.val('减项金额2') || 0),
            jxj3: Number(recordset.val('减项金额3') || 0),

            zysx: recordset.val('注意事项'),
            qtshm: recordset.val('其它说明'),
            detail_rows: detail_rows
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '改单状况处理失败')
                recordset.val('改单状况', '进行中')
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            Object.keys(p).forEach(k => recordset.val(k, p[k]))

            const rowPatch = (res.data && res.data.row_patch) ? res.data.row_patch : []
            if (rowPatch.length > 0) {
                const cywyzdDb = fdb('出运唯一字段')
                for (const x of rowPatch) {
                    const idx = Number(x.row_index || -1)
                    if (idx >= 0 && details[idx]) {
                        details[idx][cywyzdDb] = x.cywyzd || ''
                    }
                }
                t.sync_operate_data()
                t.modified = true
            }

            _.ui.message.success(res.msg || '处理成功')

            const cyRid = res.data ? (res.data.cy_rid || '') : ''
            if (cyRid != '') {
                _.platform.open_record('出运明细', cyRid)
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '改单状况处理失败')
            recordset.val('改单状况', '进行中')
        })
    }

    if (field.full_name == n + '.主管审批') {
        const zgsp = recordset.val('主管审批')
        const today = new Date().format('yyyy-MM-dd')

        if (zgsp == '通过') {
            // Pascal: 主管日期=今天
            recordset.val('主管日期', today)

            // Pascal: 若当前用户=提交总经理，则总经理审批直接通过
            if (_.user.username == recordset.val('提交总经理')) {
                recordset.val('总经理审批', '通过')
            }

            // Pascal: 提交总经理可编辑
            recordset.module.field_by_full_name('提交总经理').disabled = false
        } else {
            // Pascal: 非“通过”分支
            recordset.val('总经理审批', '待审批')
            recordset.val('改单状况', '驳回')
        }
    }

    const cpzlFields = new Set([
        n + '.产品资料.退 税 率',
        n + '.产品资料.工厂名称',
        n + '.产品资料.进仓日期',
        n + '.产品资料.结算方式',
        n + '.产品资料.外销总价',
        n + '.产品资料.客户RMB总价'
    ])

    if (cpzlFields.has(field.full_name)) {
        // 外销总价总 = round(外销总价 * 1000) / 1000

        recordset.val('产品资料.外销总价总', Math.round(recordset.value('产品资料.外销总价', row) * 1000) / 1000, row);
        if (recordset.val('RMB客户') == '是' && recordset.val('汇    率') != 0 && recordset.value('产品资料.客户RMB总价', row) > 0 && recordset.val('汇    率') != 1) {
            recordset.val('产品资料.外销总价总', Math.round((recordset.value('产品资料.客户RMB总价', row) / recordset.val('汇    率')) * 1000) / 1000, row);
        }

        // 增值税率 -> 退税率
        let zzsl = recordset.value('产品资料.增值税率', row)
        if (Number.isNaN(zzsl)) zzsl = 0

        if (zzsl == 3) {
            recordset.val('产品资料.退 税 率', 3, row)
        }
        if (zzsl == 0) {
            recordset.val('产品资料.退 税 率', 0, row)
        }

        let tsl = recordset.value('产品资料.退 税 率', row)
        const zzsl1 = 1 + zzsl / 100
        let cgzj = recordset.value('产品资料.采购总价', row)

        if (zzsl != 0 && tsl != 0) {
            let tse = 0

            if (tsl == 16) tse = cgzj / zzsl1 * 0.16
            if (tsl == 0) tse = 0
            if (tsl == 6) tse = cgzj / zzsl1 * 0.06
            if (tsl == 4) tse = cgzj / 1.04 * 0.04
            if (tsl == 1) tse = cgzj / 1.01 * 0.01
            if (tsl == 13) tse = cgzj / zzsl1 * 0.13
            if (tsl == 11) tse = cgzj / zzsl1 * 0.11
            if (tsl == 9) tse = cgzj / zzsl1 * 0.09
            if (tsl == 14) tse = cgzj / zzsl1 * 0.14
            if (tsl == 5) tse = cgzj / zzsl1 * 0.05
            if (tsl == 3) tse = cgzj / 1.03 * 0.03
            if (tsl == 8) tse = cgzj / zzsl1 * 0.08
            if (tsl == 15) tse = cgzj / zzsl1 * 0.15

            recordset.val('产品资料.退 税 额', Number(tse).toFixed(2), row)
        } else {
            recordset.val('产品资料.退 税 额', '0', row)
        }
    }

    if (field.full_name == n + '.产品资料.出货数量') {
        let ychsl = Number(recordset.value('产品资料.原出货数量', row) || 0)
        let chsl = Number(recordset.value('产品资料.出货数量', row) || 0)
        if (Number.isNaN(ychsl)) ychsl = 0
        if (Number.isNaN(chsl)) chsl = 0

        if (ychsl != chsl && ychsl > 0 && chsl > 0) {
            let cght = recordset.value('产品资料.采购合同', row)
            if (cght != '') {
                _.http.post('/api/saier/shipment_amendment/field/chsl/check_contract', {
                    zycpbh: recordset.value('产品资料.专业产品编号', row),
                    cght: cght,
                    cywyzd: recordset.value('产品资料.出运唯一字段', row),
                    wxwyzd: recordset.value('产品资料.外销唯一字段', row),
                    chsl: chsl
                }).then(res => {
                    if (res.code != 1) {
                        _.ui.message.error(res.msg || '校验失败')
                        return
                    }

                    let d = res.data || {}
                    if (d.exceed == 1) {
                        _.ui.message.error('采购合同出货数量大于采购数量请核实!')
                        recordset.val('产品资料.出货数量', Number(recordset.value('产品资料.原出货数量', row) || 0), row)
                        recordset.val('产品资料.外箱容量', Number(recordset.value('产品资料.原外箱容量', row) || 0), row)
                        recordset.val('产品资料.箱    数', parseInt(recordset.value('产品资料.原 箱 数', row) || 0), row)
                        return
                    }

                    // 佣金
                    let yjbl = Number(recordset.value('产品资料.佣金比率', row) || 0)
                    let yjdj = Number(recordset.value('产品资料.佣金单价', row) || 0)
                    let wxdj = Number(recordset.value('产品资料.外销单价', row) || 0)
                    let rmbdj = Number(recordset.value('产品资料.客户RMB单价', row) || 0)
                    if (Number.isNaN(yjbl)) yjbl = 0
                    if (Number.isNaN(yjdj)) yjdj = 0
                    if (Number.isNaN(wxdj)) wxdj = 0
                    if (Number.isNaN(rmbdj)) rmbdj = 0

                    if (yjbl > 0) {
                        if ((recordset.value('产品资料.RMB客户', row)) == '是') {
                            recordset.val('产品资料.佣    金', chsl * rmbdj * yjbl, row)
                        } else {
                            recordset.val('产品资料.佣    金', chsl * wxdj * yjbl, row)
                        }
                    } else {
                        if (yjdj > 0) {
                            recordset.val('产品资料.佣    金', yjdj * chsl, row)
                        }
                    }

                    // 暗佣
                    let aybl = Number(recordset.value('产品资料.暗佣比率', row) || 0)
                    let aydj = Number(recordset.value('产品资料.暗佣单价', row) || 0)
                    if (Number.isNaN(aybl)) aybl = 0
                    if (Number.isNaN(aydj)) aydj = 0

                    if (aybl > 0) {
                        if ((recordset.value('产品资料.RMB客户', row)) == '是') {
                            recordset.val('产品资料.暗佣佣金', chsl * rmbdj * aybl, row)
                        } else {
                            recordset.val('产品资料.暗佣佣金', chsl * wxdj * aybl, row)
                        }
                    } else {
                        if (aydj > 0) {
                            recordset.val('产品资料.暗佣佣金', aydj * chsl, row)
                        }
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg || '出货数量校验失败')
                })
            }
        }
    }

    if (field.full_name == n + '.产品资料.外箱容量' || field.full_name == n + '.产品资料.箱    数') {
        if (recordset.value('产品资料.是否拼箱', row) == '否' || recordset.value('产品资料.是否拼箱', row) == '') {
            if (recordset.value('产品资料.箱    数', row) > 0 && recordset.value('产品资料.外箱容量', row) > 0) {
                recordset.val('产品资料.出货数量', recordset.value('产品资料.外箱容量', row) * recordset.value('产品资料.箱    数', row), row);
            }
        }
    }

    if (field.full_name == n + '.产品资料.采购人员') {
        const cgry = (recordset.value('产品资料.采购人员', row)).trim()

        _.http.post('/api/saier/shipment_amendment/field/cgry/change', {
            cgry: cgry
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '采购人员联动失败')
                return
            }

            const d = res.data || {}

            if (cgry != '') {
                if ((d.cgbm) != '') {
                    recordset.val('产品资料.采购部门', d.cgbm, row)
                }
                if ((d.cgdq) != '') {
                    recordset.val('产品资料.采购地区', d.cgdq, row)
                }
                if ((d.cgpath) != '') {
                    recordset.val('产品资料.采购path', d.cgpath, row)
                }
            }

            // Pascal: 下单地点为空时 = 采购地区
            if ((recordset.value('产品资料.下单地点', row)) == '') {
                recordset.val('产品资料.下单地点', recordset.value('产品资料.采购地区', row), row)
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '采购人员联动失败')
        })
    }

    if (field.full_name == n + '.产品资料.业务人员') {
        const ywry = (recordset.value('产品资料.业务人员', row)).trim()

        if (ywry != '') {
            _.http.post('/api/saier/shipment_amendment/field/ywry/change', {
                ywry: ywry
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg || '业务人员联动失败')
                    return
                }

                const d = res.data || {}

                if ((d.wxbm) != '') {
                    recordset.val('产品资料.外销部门', d.wxbm, row)
                }
                if ((d.ywpath) != '') {
                    recordset.val('产品资料.业务path', d.ywpath, row)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '业务人员联动失败')
            })
        }
    }

    if (field.full_name == n + '.产品资料.外销总价' || field.full_name == n + '.产品资料.客户RMB总价') {
        if (recordset.value('产品资料.RMB客户', row) != '是') {
            recordset.val('产品资料.外销总价总', Math.round((recordset.value('产品资料.外销总价', row) * 100)) / 100, row);
        }
        if (recordset.value('产品资料.RMB客户', row) == '是' && recordset.val('汇    率') != 0 && recordset.value('产品资料.客户RMB总价', row) > 0 && recordset.val('汇    率') != 1) {
            recordset.val('产品资料.外销总价总', Math.round((recordset.value('产品资料.客户RMB总价', row) / recordset.val('汇    率')) * 100) / 100, row);
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shipment_amendment_field_change, '出运改单')

const shipment_amendment_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        const username = _.user.username
        const now_str = new Date().format('yyyy-MM-dd hh:mm:ss')

        const tjzg = recordset.val('提交主管')
        const zgsp = recordset.val('主管审批')
        const tjzjl = recordset.val('提交总经理')
        const zjlsp = recordset.val('总经理审批')
        const tjfk = recordset.val('提交风控')
        const fksp = recordset.val('风控审批')
        const tjdz = recordset.val('提交单证')
        const dzsp = recordset.val('单证审批')
        const tjcw = recordset.val('提交财务')
        const cwsp = recordset.val('财务审批')

        if (tjzg == username || tjzjl == username || tjfk == username || tjdz == username || tjcw == username) {
            if (tjzg == username && zgsp != '待审批' && zjlsp == '待审批') {
                recordset.val('主管审批1', now_str)
            } else {
                if ((tjzjl == username && zjlsp != '待审批') && fksp == '待审批' && dzsp == '待审批') {
                    recordset.val('总经理审批1', now_str)
                } else {
                    if ((tjfk == username && fksp != '待审批') && dzsp == '待审批') {
                        recordset.val('风控审批1', now_str)
                    } else {
                        if (tjdz == username && dzsp != '待审批' && cwsp == '待审批') {
                            recordset.val('单证审批1', now_str)
                        } else {
                            if (tjcw == username && cwsp != '待审批') {
                                recordset.val('财务审批1', now_str)
                            }
                        }
                    }
                }
            }
        }
        _.http.post('/api/saier/shipment_amendment/save/before', {
            sqbh: recordset.val('申请编号'),
            jbry: recordset.val('经办人员'),
            tjzg: recordset.val('提交主管')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '保存前校验失败')
                reject()
                return
            }

            const p = (res.data && res.data.patch) ? res.data.patch : {}
            if (p['sqbh'] !== undefined) recordset.val('申请编号', p['sqbh'])

            if ((res.data && res.data.unlock_submit_fields) == 1) {
                recordset.module.field_by_full_name('提交单证').disabled = false
                recordset.module.field_by_full_name('提交风控').disabled = false
                recordset.module.field_by_full_name('提交主管').disabled = false
                recordset.module.field_by_full_name('提交总经理').disabled = false
                recordset.module.field_by_full_name('提交财务').disabled = false
            }

            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '保存前校验失败')
            reject()
        })
    })
}

// 关键修正：模块名必须是“出运改单”
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, shipment_amendment_before_save, '出运改单')


// 查询界面或编辑界面、子表上按钮点击事件
const shipment_amendment_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset
    const n = recordset.module.name

    if (btn.name == 'unlock_tjdz_btn') {
        _.http.post('/api/saier/shipment_amendment/button/unlock_tjdz', {
            fkbh: recordset.val('申请编号'),
            fphm: recordset.val('发票号码'),
            jbry: recordset.val('经办人员')
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '提交单证解锁失败')
                return
            }
            _.ui.message.success(res.msg || '提交单证解锁成功')
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '提交单证解锁失败')
        })
    }

    if (btn.name == 'factory_fksq_btn') {
        if ((recordset.val('开模审批') != '') && (recordset.val('审批人') == '') && (recordset.val('审请人') == username) && (recordset.val('总经理审批') == '通过') && (recordset.val('完成情况') == '完成')) {
            _.http.post('/api/saier/shipment_amendment/button/fksq', {
                rid: recordset.val('rid'),
                kmbh: recordset.val('开模编号'),
                kmsp: recordset.val('开模审批')
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        } else {
            _.ui.message.error('不能提交,请注意必需为申请人本人且总经理通过且完成情况为已完成')
        }
    }

    if (btn.name == 'shipment_amendment_update_info_btn') {

        // Pascal 语义：非经办人直接不执行（不弹错）
        if (recordset.val('经办人员') != _.user.username) {
            return
        }

        const t = recordset.tables['产品资料']
        const details = (t && t.view_data) ? t.view_data : []
        if (!t || details.length == 0) {
            _.ui.message.error('未找到子表产品资料')
            return
        }

        const rows = details.map((r, idx) => ({
            row_index: idx,
            wxwyzd: r[recordset.module.field_by_full_name(n + '.产品资料.外销唯一字段').db.name] || '',
            wxht: r[recordset.module.field_by_full_name(n + '.产品资料.外销合同').db.name] || '',
            bjhh: r[recordset.module.field_by_full_name(n + '.产品资料.产品编号').db.name] || '',
            khhh: r[recordset.module.field_by_full_name(n + '.产品资料.客户货号').db.name] || '',
            zyhh: r[recordset.module.field_by_full_name(n + '.产品资料.专业产品编号').db.name] || '',
            cght: r[recordset.module.field_by_full_name(n + '.产品资料.采购合同').db.name] || ''
        }))

        _.http.post('/api/saier/shipment_amendment/button/update_info/query', {
            jbry: recordset.val('经办人员'),
            rows: rows
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '更新信息失败')
                return
            }

            const outRows = (res.data && res.data.rows) ? res.data.rows : []
            const fdb = (fname) => recordset.module.field_by_full_name(n + '.产品资料.' + fname).db.name
            const toNum = (v) => {
                const x = Number(v || 0)
                return Number.isNaN(x) ? 0 : x
            }

            const applyFromCghtsheet = (r, d) => {
                if (!d) return

                if (toNum(d.cgjg) > 0) r[fdb('采购单价')] = toNum(d.cgjg)

                if (toNum(d.pkRMB) > 0) r[fdb('客户RMB单价')] = toNum(d.pkRMB)
                else if (toNum(d.mjdj1) > 0) r[fdb('客户RMB单价')] = toNum(d.mjdj1)

                if (toNum(d.zzsl) > 0 && (d.zhwbgpm || '') != '') r[fdb('中文报关品名')] = d.zhwbgpm || ''
                if ((d.jcsj || '') != '') r[fdb('进仓日期')] = d.jcsj || ''

                if (toNum(r[fdb('外箱容量')]) <= 1 && toNum(d.wxrl) > 1) r[fdb('外箱容量')] = toNum(d.wxrl)

                if (toNum(d.Twxdj) > 0) r[fdb('外销单价')] = toNum(d.Twxdj)
                else r[fdb('外销单价')] = toNum(d.wxdj)

                r[fdb('退 税 率')] = parseInt(toNum(d.sl), 10) || 0
                r[fdb('下单地点')] = d.xddd || ''
                r[fdb('增值税率')] = parseInt(toNum(d.zzsl), 10) || 0
                r[fdb('货 源 地')] = d.hyd || ''
            }

            const applyFromWxhtsheet = (r, d) => {
                if (!d) return

                r[fdb('RMB客户')] = d.khpd || ''

                if (toNum(d.pkRMB) > 0) r[fdb('客户RMB单价')] = toNum(d.pkRMB)
                else if (toNum(d.mjdj1) > 0) r[fdb('客户RMB单价')] = toNum(d.mjdj1)

                if (toNum(d.Twxdj) > 0) r[fdb('外销单价')] = toNum(d.Twxdj)
                else r[fdb('外销单价')] = toNum(d.wxdj)

                r[fdb('佣金比率')] = toNum(d.yjbl)
                r[fdb('暗佣比率')] = toNum(d.aybl)
                r[fdb('佣金单价')] = toNum(d.sl6)
                r[fdb('暗佣单价')] = toNum(d.asl6)

                const chsl = toNum(r[fdb('出货数量')])
                const yjbl = toNum(d.yjbl)
                const aybl = toNum(d.aybl)
                const sl6 = toNum(d.sl6)
                const asl6 = toNum(d.asl6)
                const htsl = toNum(d.htsl)
                const yj = toNum(d.yj)
                const ayj = toNum(d.ayj)
                const sj = toNum(d.sj)
                const khpd = d.khpd || ''

                if (yjbl > 0) {
                    if (khpd == '是') r[fdb('佣    金')] = chsl * toNum(r[fdb('客户RMB单价')]) * yjbl
                    else r[fdb('佣    金')] = chsl * toNum(r[fdb('外销单价')]) * yjbl
                } else if (sl6 > 0) {
                    r[fdb('佣    金')] = sl6 * chsl
                }

                if (aybl > 0) {
                    if (khpd == '是') r[fdb('暗佣佣金')] = chsl * toNum(r[fdb('客户RMB单价')]) * aybl
                    else r[fdb('暗佣佣金')] = chsl * toNum(r[fdb('外销单价')]) * aybl
                } else if (asl6 > 0) {
                    r[fdb('暗佣佣金')] = asl6 * chsl
                }

                if (htsl > 0) {
                    const ratio = chsl / htsl
                    if (ratio > 1) {
                        if (!(sl6 > 0 || yjbl > 0)) r[fdb('佣    金')] = yj
                        if (!(asl6 > 0 || aybl > 0)) r[fdb('暗佣佣金')] = ayj
                        r[fdb('税   金')] = sj
                    } else {
                        if (!(sl6 > 0 || yjbl > 0)) r[fdb('佣    金')] = yj * ratio
                        if (!(asl6 > 0 || aybl > 0)) r[fdb('暗佣佣金')] = ayj * ratio
                        r[fdb('税   金')] = sj * ratio
                    }
                }

                if ((d.wxwyzd || '') != '' && (r[fdb('外销唯一字段')] || '') == '') {
                    r[fdb('外销唯一字段')] = d.wxwyzd || ''
                }
            }

            const applyFactory = (r, d) => {
                if (!d) return
                if ((d.sccj1 || '') != '') {
                    r[fdb('工厂名称')] = d.sccj1 || ''
                    r[fdb('结算方式')] = d.jsfs || ''
                } else if ((d.sccj || '') != '') {
                    r[fdb('工厂名称')] = d.sccj || ''
                    r[fdb('结算方式')] = d.jsfs || ''
                }
            }

            for (const x of outRows) {
                const idx = Number(x.row_index || 0)
                if (!details[idx]) continue
                const r = details[idx]

                applyFromCghtsheet(r, x.cghtsheet)
                applyFromWxhtsheet(r, x.wxhtsheet)
                applyFactory(r, x.cght)
            }

            t.sync_operate_data()
            t.modified = true
            _.ui.message.success('更新成功')
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '更新信息失败')
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shipment_amendment_form_BtnClick, '出运改单')

const shipment_amendment_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'unlock_tjdz_btn',
        "caption": '提交单证解锁',
        "icon": 'any-keyborad',
    },{
        "name": 'shipment_amendment_update_info_btn',
        "caption": '更新信息',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], shipment_amendment_FormShow, '出运改单')