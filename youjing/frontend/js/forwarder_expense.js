const _fe_set_enabled = (recordset, names, enabled) => {
    for (const fn of names) {
        const f = recordset.module.field_by_full_name(fn)
        if (f) f.disabled = enabled
    }
}

// 编辑界面数据加载以后执行
const forwarder_expense_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    recordset.tables['特报详情']._.toolbar.show('new', false);
    recordset.tables['特报详情']._.toolbar.show('insert-data', false);
    recordset.tables['特报详情']._.toolbar.show('delete', false);

    if (recordset.val('货柜类型') !== '') recordset.module.field_by_full_name('货柜类型').disabled = true
    if (recordset.val('货柜类型') !== '' && recordset.val('制单人员') !== username) recordset.module.field_by_full_name('发票号码').disabled = true
    if (recordset.val('制单人员') !== '') recordset.module.field_by_full_name('制单人员').disabled = true

    // 默认禁用（Pascal 起始段）
    _fe_set_enabled(recordset, [
        '指定打印', '自拉打印', '单报打印', '特报打印', '商检打印',
        '业务审批', '业务审批1', '业务审批2', '业务审批3', '业务审批4',
        '单证审批', '单证审批1', '单证审批2', '单证审批3', '单证审批4',
        '单证确认', '单证确认1', '单证确认2', '单证确认3', '单证确认4',
        '业务确认', '业务确认1', '业务确认2', '业务确认3', '业务确认4',
        '相关杂费.进仓费用', '相关杂费.核对时间'
    ], true)

    if (recordset.val('制单人员') === '' || recordset.val('制单人员') === username) {
        _fe_set_enabled(recordset, ['指定打印', '自拉打印', '单报打印', '特报打印', '商检打印'], true)
    }

    _.http.post('/api/saier/forwarder_expense/load/check', {
        fphm: recordset.val('发票号码'),
        username: username
    }).then(res => {
        if (res.code != 1) return
        const d = res.data || {}

        const zdhLockFields = [
            '订 舱 费', 'THC 费', '文 件 费', '操 作 费', 'AMS/ENS', '电放/转单', '堆 存 费', '滞 箱 费', '箱 单 费', '港 杂 费',
            '舱单录入费', '过 磅 费', '拖 车 费', '提 进 费', '报 关 费', '拼箱/内装', '改 单 费', '查 验 费', '其它费用', '指定内陆￥', '指定海运$', '特报费', '指定备注'
        ]
        if ((recordset.val('业务审批') !== '' || recordset.val('单证审批') !== '' || recordset.val('财务确认') !== '')) {
            if (recordset.val('指定货代') !== '') _fe_set_enabled(recordset, ['指定货代'], false)
            _fe_set_enabled(recordset, zdhLockFields, false)
        }

        const zlzbLockFields = [
            '拖车费', '提进费', '待 时 费', '过夜费', '条码费用', '加封费', '操作费', '商检换单1', '报关费', '联单费', '改 运 低',
            '查验费', '摩的费', '劳务费', '交通费', '改单费', '箱单费', '重箱出卡费', '其它费用1', '自报内陆￥', '自报海运$', '特报费1', '自拉备注'
        ]
        if (recordset.val('业务审批1') !== '' || recordset.val('单证审批1') !== '' || recordset.val('自财务确认') !== '') {
            if (recordset.val('自拉货代') !== '') _fe_set_enabled(recordset, ['自拉货代'], false)
            _fe_set_enabled(recordset, zlzbLockFields, false)
        }

        const dbgLockFields = [
            '报关费2', '联单费2', '改运抵2', '查验费2', '摩的费2', '劳务费2', '交通费2', '改单费2', '箱单费2', '操作费2',
            '商检换单', '重箱出卡', '其它费用2', '单报内陆￥', '单报海运$', '特报费2', '单报备注'
        ]
        if (recordset.val('业务审批2') !== '' || recordset.val('单证审批2') !== '' || recordset.val('单财务确认') !== '') {
            if (recordset.val('报关货代') !== '') _fe_set_enabled(recordset, ['报关货代'], false)
            _fe_set_enabled(recordset, dbgLockFields, false)
        }

        const tbLockFields = ['费用内容', '费用金额 ￥', '费用金额 $', '特报备注']
        if (recordset.val('业务审批3') !== '' || recordset.val('单证审批3') !== '' || recordset.val('特财务确认') !== '') {
            _fe_set_enabled(recordset, tbLockFields, false)
        }

        const sjLockFields = ['报关单抬头', '商检日期', '商检金额￥', '商检金额$', '商检内容', '商检备注']
        if (recordset.val('业务审批4') !== '' || recordset.val('单证审批4') !== '' || recordset.val('商财务确认') !== '') {
            if (recordset.val('商检货代') !== '') _fe_set_enabled(recordset, ['商检货代'], false)
            _fe_set_enabled(recordset, sjLockFields, false)
        }

        // ===== Pascal 翻译：单证审批人可确认/触发业务审批 =====
        if (recordset.val('单证审批') === username) {
            _fe_set_enabled(recordset, ['指定货代', '指定日期', ...zdhLockFields], true)
            if (recordset.val('业务审批') === '') recordset.module.field_by_full_name('单证确认').disabled = false
            if (recordset.val('单证确认') === '通过' && recordset.val('业务确认') !== '通过') recordset.module.field_by_full_name('业务审批').disabled = false
        }

        if (recordset.val('单证审批1') === username) {
            _fe_set_enabled(recordset, ['自拉货代', '自拉日期', ...zlzbLockFields], true)
            if (recordset.val('业务审批1') === '') recordset.module.field_by_full_name('单证确认1').disabled = false
            if (recordset.val('单证确认1') === '通过' && recordset.val('业务确认1') !== '通过') recordset.module.field_by_full_name('业务审批1').disabled = false
        }

        if (recordset.val('单证审批2') === username) {
            _fe_set_enabled(recordset, ['报关货代', '单报日期', ...dbgLockFields], true)
            if (recordset.val('业务审批2') === '') recordset.module.field_by_full_name('单证确认2').disabled = false
            if (recordset.val('单证确认2') === '通过' && recordset.val('业务确认2') !== '通过') recordset.module.field_by_full_name('业务审批2').disabled = false
        }

        if (recordset.val('单证审批3') === username) {
            _fe_set_enabled(recordset, ['特报日期', ...tbLockFields], true)
            if (recordset.val('业务审批3') === '') recordset.module.field_by_full_name('单证确认3').disabled = false
            if (recordset.val('单证确认3') === '通过' && recordset.val('业务确认3') !== '通过') recordset.module.field_by_full_name('业务审批3').disabled = false
        }

        if (recordset.val('单证审批4') === username) {
            _fe_set_enabled(recordset, ['商检货代', ...sjLockFields], true)
            if (recordset.val('业务审批4') === '') recordset.module.field_by_full_name('单证确认4').disabled = false
            if (recordset.val('单证确认4') === '通过' && recordset.val('业务确认4') !== '通过') recordset.module.field_by_full_name('业务审批4').disabled = false
        }

        // ===== Pascal 翻译：业务审批人可做业务确认 =====
        console.log('----username-----')
        console.log(username)
        if (recordset.val('业务审批') === username && recordset.val('单证确认') === '通过' && (recordset.val('财务确认') === null || recordset.val('财务确认') === '')) recordset.module.field_by_full_name('业务确认').disabled = false
        if (recordset.val('业务审批1') === username && recordset.val('单证确认1') === '通过' && (recordset.val('自财务确认') === null || recordset.val('自财务确认') === '')) recordset.module.field_by_full_name('业务确认1').disabled = false
        if (recordset.val('业务审批2') === username && recordset.val('单证确认2') === '通过' && (recordset.val('单财务确认') === null || recordset.val('单财务确认') === '')) recordset.module.field_by_full_name('业务确认2').disabled = false
        if (recordset.val('业务审批3') === username && recordset.val('单证确认3') === '通过' && (recordset.val('特财务确认') === null || recordset.val('特财务确认') === '')) recordset.module.field_by_full_name('业务确认3').disabled = false
        if (recordset.val('业务审批4') === username && recordset.val('单证确认4') === '通过' && (recordset.val('商财务确认') === null || recordset.val('商财务确认') === '')) recordset.module.field_by_full_name('业务确认4').disabled = false

        // 财务可改核对时间（后端字段 cwck）
        if (d.cwck == 1) {
            recordset.module.field_by_full_name('相关杂费.核对时间').disabled = false
        }

        // 非单证（后端字段 dzzk）
        if (d.dzzk != 1) {
            _fe_set_enabled(recordset, [
                '指定货代', '自拉货代', '报关货代', '指定日期', '自拉日期', '单报日期', '特报日期', '订 舱 费', 'THC 费', '文 件 费', '操 作 费', 'AMS/ENS', '电放/转单',
                '堆 存 费', '滞 箱 费', '箱 单 费', '港 杂 费', '舱单录入费', '过 磅 费', '拖 车 费', '提 进 费', '报 关 费', '拼箱/内装', '改 单 费', '查 验 费',
                '其它费用', '指定内陆￥', '指定海运$', '特报费', '指定备注', '拖车费', '提进费', '待 时 费', '过夜费', '条码费用', '加封费', '操作费', '商检换单1',
                '报关费', '联单费', '改 运 低', '查验费', '摩的费', '劳务费', '交通费', '改单费', '箱单费', '重箱出卡费', '其它费用1', '自报内陆￥', '自报海运$',
                '特报费1', '自拉备注', '报关费2', '联单费2', '改运抵2', '查验费2', '摩的费2', '劳务费2', '交通费2', '改单费2', '箱单费2', '操作费2', '商检换单',
                '重箱出卡', '其它费用2', '单报内陆￥', '单报海运$', '特报费2', '单报备注', '费用内容', '费用金额 ￥', '费用金额 $', '特报备注', '商检货代', '报关单抬头',
                '商检日期', '商检金额￥', '商检金额$', '商检内容', '商检备注', '总计内陆￥', '总计海运$', '不批原因', '备   注', '杂费合计￥', '杂费合计$',
                '相关杂费.FORM费用', '相关杂费.价 格 单', '相关杂费.商 检 费', '相关杂费.仓库名称', '相关杂费.杂费名称', '相关杂费.其它杂费', '相关杂费.费用合计',
                '货代详情.费用名称', '货代详情.货代名称', '货代详情.开户银行', '货代详情.银行帐号', '货代详情.费用金额'
            ], true)

            _fe_set_enabled(recordset, ['相关杂费.装柜费用', '相关杂费.进仓费用'], true)
        } else {
            if (recordset.val('单证审批') == '') recordset.module.field_by_full_name('单证审批').disabled = false
            if (recordset.val('单证审批1') == '') recordset.module.field_by_full_name('单证审批1').disabled = false
            if (recordset.val('单证审批2') == '') recordset.module.field_by_full_name('单证审批2').disabled = false
            if (recordset.val('单证审批3') == '') recordset.module.field_by_full_name('单证审批3').disabled = false
            if (recordset.val('单证审批4') == '') recordset.module.field_by_full_name('单证审批4').disabled = false
        }

        if (d.hide_special == 1) {
            recordset.module.group_by_name('特报费用').visible = false
            recordset.module.group_by_name('商检费用').visible = false
            recordset.module.group_by_name('特报详情').visible = false
            recordset.module.field_by_full_name('费用金额￥').hide()
            recordset.module.field_by_full_name('费用金额').hide()
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg || '加载失败')
    })
}
_.evts.on([_.evtids.RECORD_LOAD], forwarder_expense_recordLoad, '货代费用')

// // 编辑界面字段change后执行
const forwarder_expense_field_change = (evt_id, opts) => {
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

    const num = (...names) => {
        for (const k of names) {
            const v = Number(recordset.val(k))
            if (!Number.isNaN(v)) return v
        }
        return 0
    }

    if (field.full_name == n + '.业务审批') {
        const sh = recordset.val('业务审批') || ''
        _.http.post('/api/saier/forwarder_expense/ywsp/check', {
            sh: sh
        }).then(res => {
            if (res.code == 1) {
                // 审批人为空：清空业务1
                if (!sh) {
                    recordset.val('业务1', '')
                }

                if (res.data && res.data.pass == 1) {
                    recordset.val('业务1', '1')
                } else {
                    _.ui.message.error('不好意思,此人无业务审核权限!')
                    recordset.val('业务审批', '')
                    recordset.val('业务1', '')
                }
            } else {
                _.ui.message.error(res.msg || '校验失败')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '校验失败')
        })
    }

    if (field.full_name == n + '.单证审批') {
        const sh = recordset.val('单证审批') || ''
        const zdhd = recordset.val('指定货代') || ''

        if (sh != '' && zdhd != '') {
            _.http.post('/api/saier/forwarder_expense/dzsp/check', {
                sh: sh,
                zdhd: zdhd
            }).then(res => {
                if (res.code == 1) {
                    const d = res.data || {}
                    if (d.pass == 1) {
                        recordset.val('单证1', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无单证审核权限!')
                        recordset.val('单证审批', '')
                        recordset.val('业务审批', '')
                        recordset.val('单证1', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })

        } else {
            if (zdhd == '') {
                _.ui.message.error('请输入指定货代!')
            }
            recordset.val('单证审批', '')
            recordset.val('业务审批', '')
            recordset.val('单证1', '')
        }
    }

    if (field.full_name == n + '.业务确认') {
        const qr = recordset.val('业务确认') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 业务确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('业务确1', '1')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('业务不确认1', yy)
                    recordset.val('业务确1', '1')
                    recordset.val('业务确认', '')
                    recordset.val('单证确认', '')
                    recordset.val('业务审批', '')
                    recordset.val('单证审批', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('业务确认') || '') == '') {
                    recordset.val('业务确1', '')
                }
            }
        }
    }

    if (field.full_name == n + '.单证确认') {
        const qr = recordset.val('单证确认') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.module.field_by_full_name('业务审批').disabled = false;
                recordset.val('单证确1', '1')
                recordset.val('业务审批', '谢培雅')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('单证不确认1', yy)
                    recordset.val('单证确1', '1')
                    recordset.val('业务确认', '')
                    recordset.val('单证确认', '')
                    recordset.val('业务审批', '')
                    recordset.val('单证审批', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('单证确认') || '') == '') {
                    recordset.val('单证确1', '')
                }
            }
        }
    }

    if (field.full_name == n + '.业务确认1') {
        const qr = recordset.val('业务确认1') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('业务确2', '1')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('业务不确认2', yy)
                    recordset.val('业务确2', '1')
                    recordset.val('业务确认1', '')
                    recordset.val('单证确认1', '')
                    recordset.val('业务审批1', '')
                    recordset.val('单证审批1', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('业务确认1') || '') == '') {
                    recordset.val('业务确2', '')
                }
            }
        }
    }

    if (field.full_name == n + '.单证确认1') {
        const qr = recordset.val('单证确认1') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.module.field_by_full_name('业务审批1').disabled = false;
                recordset.val('单证确2', '1')
                recordset.val('业务审批1', '谢培雅')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('单证不确认2', yy)
                    recordset.val('单证确2', '1')
                    recordset.val('业务确认1', '')
                    recordset.val('单证确认1', '')
                    recordset.val('业务审批1', '')
                    recordset.val('单证审批1', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('单证确认1') || '') == '') {
                    recordset.val('单证确2', '')
                }
            }
        }
    }

    if (field.full_name == n + '.业务确认2') {
        const qr = recordset.val('业务确认2') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('业务确3', '1')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('业务不确认3', yy)
                    recordset.val('业务确3', '1')
                    recordset.val('业务确认2', '')
                    recordset.val('单证确认2', '')
                    recordset.val('业务审批2', '')
                    recordset.val('单证审批2', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('业务确认2') || '') == '') {
                    recordset.val('业务确3', '')
                }
            }
        }
    }

    if (field.full_name == n + '.单证确认2') {
        const qr = recordset.val('单证确认2') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.module.field_by_full_name('业务审批2').disabled = false;
                recordset.val('单证确3', '1')
                recordset.val('业务审批2', '谢培雅')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('单证不确认3', yy)
                    recordset.val('单证确3', '1')
                    recordset.val('业务确认2', '')
                    recordset.val('单证确认2', '')
                    recordset.val('业务审批2', '')
                    recordset.val('单证审批2', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('单证确认2') || '') == '') {
                    recordset.val('单证确3', '')
                }
            }
        }
    }

    if (field.full_name == n + '.业务确认3') {
        const qr = recordset.val('业务确认3') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('业务确4', '1')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('业务不确认4', yy)
                    recordset.val('业务确4', '1')
                    recordset.val('业务确认3', '')
                    recordset.val('单证确认3', '')
                    recordset.val('业务审批3', '')
                    recordset.val('单证审批3', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('业务确认3') || '') == '') {
                    recordset.val('业务确4', '')
                }
            }
        }
    }

    if (field.full_name == n + '.单证确认3') {
        const qr = recordset.val('单证确认3') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: 仅当 单证确认<>'' 且 制单人员<>'' 才进入
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.module.field_by_full_name('业务审批3').disabled = false;
                recordset.val('单证确4', '1')
                recordset.val('业务审批3', '谢培雅')
            } else if (qr == '不通过') {
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则退出
                    if (!yy) return
                    recordset.val('单证不确认4', yy)
                    recordset.val('单证确4', '1')
                    recordset.val('业务确认3', '')
                    recordset.val('单证确认3', '')
                    recordset.val('业务审批3', '')
                    recordset.val('单证审批3', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                // 保留 Pascal 的兜底分支
                if ((recordset.val('单证确认3') || '') == '') {
                    recordset.val('单证确4', '')
                }
            }
        }
    }

    if (field.full_name == n + '.业务审批1') {
        const sh = recordset.val('业务审批1') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/ywsp/check', {
                sh: sh
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 业务2 = '1'
                        recordset.val('业务2', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无业务审核权限!')
                        recordset.val('业务审批1', '')
                        recordset.val('业务2', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 业务审批1为空 -> 清空业务2
            recordset.val('业务2', '')
        }
    }

    if (field.full_name == n + '.单证审批1') {
        const sh = recordset.val('单证审批1') || ''
        const zlhd = recordset.val('自拉货代') || ''

        // Pascal: sh<>'' 且 自拉货代<>'' 才校验单证权限(wb2)
        if (sh != '' && zlhd != '') {
            _.http.post('/api/saier/forwarder_expense/dzsp/check', {
                sh: sh,
                zdhd: zlhd
            }).then(res => {
                if (res.code == 1) {
                    const d = res.data || {}
                    if (d.pass == 1) {
                        // Pascal: 单证2 = '1'
                        recordset.val('单证2', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无单证审核权限!')
                        recordset.val('单证审批1', '')
                        recordset.val('单证2', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 自拉货代为空时提示
            if (zlhd == '') {
                _.ui.message.error('请输入自拉货代!')
            }
            // Pascal: 清空 单证审批1/业务审批1/单证2
            recordset.val('单证审批1', '')
            recordset.val('业务审批1', '')
            recordset.val('单证2', '')
        }
    }

    if (field.full_name == n + '.业务审批2') {
        const sh = recordset.val('业务审批2') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/ywsp/check', {
                sh: sh
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 业务3 = '1'
                        recordset.val('业务3', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无业务审核权限!')
                        recordset.val('业务审批2', '')
                        recordset.val('业务3', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 业务审批2为空 -> 清空业务3
            recordset.val('业务3', '')
        }
    }

    if (field.full_name == n + '.单证审批2') {
        const sh = recordset.val('单证审批2') || ''
        const bghd = recordset.val('报关货代') || ''

        // Pascal: sh<>'' 且 报关货代<>'' 才校验单证权限(wb2)
        if (sh != '' && bghd != '') {
            _.http.post('/api/saier/forwarder_expense/dzsp/check', {
                sh: sh,
                zdhd: bghd
            }).then(res => {
                if (res.code == 1) {
                    const d = res.data || {}
                    if (d.pass == 1) {
                        // Pascal: 单证3 = '1'
                        recordset.val('单证3', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无单证审核权限!')
                        recordset.val('单证审批2', '')
                        recordset.val('单证3', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal 原文提示为“报关货代!”
            if (bghd == '') {
                _.ui.message.error('报关货代!')
            }
            // Pascal: 清空 单证审批2/业务审批2/单证3
            recordset.val('单证审批2', '')
            recordset.val('业务审批2', '')
            recordset.val('单证3', '')
        }
    }

    if (field.full_name == n + '.业务审批3') {
        const sh = recordset.val('业务审批3') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/ywsp/check', {
                sh: sh
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 业务4 = '1'
                        recordset.val('业务4', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无业务审核权限!')
                        recordset.val('业务审批3', '')
                        recordset.val('业务4', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 业务审批3为空 -> 清空业务4
            recordset.val('业务4', '')
        }
    }

    if (field.full_name == n + '.单证审批3') {
        const sh = recordset.val('单证审批3') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/dzsp/check', {
                sh: sh,
                zdhd: '1'
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 单证4 = '1'
                        recordset.val('单证4', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无单证审核权限!')
                        recordset.val('单证审批3', '')
                        recordset.val('单证4', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 单证审批3为空 -> 清空业务审批3、单证4
            recordset.val('业务审批3', '')
            recordset.val('单证4', '')
        }
    }

    if (field.full_name == n + '.发票号码') {
        const fphm = recordset.val('发票号码') || ''
        if (!fphm) return

        _.http.post('/api/saier/forwarder_expense/fphm/change', {
            fphm: fphm
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '加载相关杂费失败')
                return
            }
            const d = res.data
            if (d.rows.length > 0) {
                let t = recordset.tables['相关杂费'];
                let y = t.view_data;

                const exists = new Set(
                    y.map(x => String((x && x['wyzd']) || '').trim())
                )
                flag = false;
                d.rows.forEach(r => {
                    const key = String((r && r.sqdh) || '').trim()
                    if (!key) return
                    if (exists.has(key)) return


                    let l = {}
                    l.rid = _.utils.guid()
                    l.pid = recordset.val('rid')
                    l.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    l.uid = _.user.rid
                    l.ckfy = Number(r.zgfy || 0)
                    l.fyhj = Number(r.zgfy || 0)
                    l.wyzd = key
                    l.ckmc = Number(r.warehouse_name || '')
                    y.push(l)
                    t.push_new_rid(l.rid)
                    flag = true;
                })

                if (flag) {
                    t.sync_operate_data();
                    t.modified = true;
                }
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '加载相关杂费失败')
        })
    }

    const feeFields = new Set([
        n + '.订 舱 费', n + '.THC 费', n + '.文 件 费', n + '.操 作 费', n + '.AMS/ENS', n + '.电放/转单', n + '.堆 存 费',
        n + '.滞 箱 费', n + '.箱 单 费', n + '.港 杂 费', n + '.舱单录入费', n + '.过 磅 费', n + '.拖 车 费',
        n + '.提 进 费', n + '.报 关 费', n + '.特报费', n + '.拼箱/内装', n + '.改 单 费', n + '.查 验 费', n + '.其它费用'
    ])

    if (feeFields.has(field.full_name)) {
        const hjnl = num('订 舱 费') + num('THC 费') + num('文 件 费') + num('操 作 费') + num('AMS/ENS') +
            num('电放/转单') + num('堆 存 费') + num('滞 箱 费') + num('箱 单 费') + num('港 杂 费') +
            num('舱单录入费') + num('过 磅 费') + num('拖 车 费') + num('提 进 费') + num('报 关 费') + num('拼箱/内装') +
            num('改 单 费') + num('查 验 费') + num('其它费用') + num('特报费')

        recordset.val('指定内陆￥', hjnl)
    }

    const feeFieldsZlzb = new Set([
        n + '.拖车费', n + '.提进费', n + '.待 时 费', n + '.过夜费', n + '.条码费用', n + '.加封费', n + '.操作费', n + '.商检换单1',
        n + '.报关费', n + '.特报费1', n + '.联单费', n + '.改 运 低', n + '.查验费', n + '.摩的费', n + '.劳务费', n + '.交通费',
        n + '.改单费', n + '.箱单费', n + '.重箱出卡费', n + '.其它费用1'
    ])

    if (feeFieldsZlzb.has(field.full_name)) {
        const hjnl1 = num('拖车费') + num('提进费') + num('待 时 费') + num('过夜费') + num('条码费用') +
            num('加封费') + num('操作费') + num('商检换单1') + num('报关费') + num('联单费') + num('改 运 低') +
            num('查验费') + num('摩的费') + num('劳务费') + num('交通费') + num('改单费') + num('箱单费') + num('重箱出卡费') +
            num('其它费用1') + num('特报费1')

        recordset.val('自报内陆￥', hjnl1)
    }

    const feeFieldsDbg = new Set([
        n + '.报关费2', n + '.特报费2', n + '.联单费2', n + '.改运抵2', n + '.查验费2', n + '.摩的费2', n + '.劳务费2',
        n + '.交通费2', n + '.改单费2', n + '.箱单费2', n + '.操作费2', n + '.商检换单', n + '.重箱出卡', n + '.其它费用2'
    ])

    if (feeFieldsDbg.has(field.full_name)) {
        const hjnl2 =
            num('报关费2') + num('联单费2') + num('改运抵2') + num('查验费2') + num('摩的费2') + num('劳务费2') + num('交通费2') +
            num('改单费2') + num('箱单费2') + num('操作费2') + num('商检换单') + num('重箱出卡') + num('其它费用2') + num('特报费2')

        // Pascal: 单报内陆￥ = 汇总
        recordset.val('单报内陆￥', hjnl2)
    }

    if (field.full_name == n + '.业务确认4') {
        const qr = recordset.val('业务确认4') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: qr<>'' 且 制单人员<>'' 才处理
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('业务确5', '1')
            } else if (qr == '不通过') {
                // Pascal细节：先置 业务确5=1，再弹原因
                recordset.val('业务确5', '1')

                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    // Pascal: 取消输入则 exit（保留已置位的业务确5）
                    if (!yy) return
                    recordset.val('业务不确认5', yy)
                    recordset.val('业务确认4', '')
                    recordset.val('单证确认4', '')
                    recordset.val('业务审批4', '')
                    recordset.val('单证审批4', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                if ((recordset.val('业务确认4') || '') == '') {
                    recordset.val('业务确5', '')
                }
            }
        }
    }

    if (field.full_name == n + '.单证确认4') {
        const qr = recordset.val('单证确认4') || ''
        const sh = recordset.val('制单人员') || ''

        // Pascal: qr<>'' 且 制单人员<>'' 才处理
        if (qr != '' && sh != '') {
            if (qr == '通过') {
                recordset.val('单证确5', '1')
                recordset.module.field_by_full_name('业务审批4').disabled = false
                recordset.val('业务审批4', '谢培雅')
            } else if (qr == '不通过') {
                // Pascal: 先置 单证确5=1，再弹原因
                recordset.val('单证确5', '1')
                _.ui.show_input_dialog('请输入不确认原因', '').then(yy => {
                    if (!yy) return
                    recordset.val('业务确认4', '')
                    recordset.val('单证不确认5', yy)
                    recordset.val('单证确认4', '')
                    recordset.val('业务审批4', '')
                    recordset.val('单证审批4', '')
                }).catch(() => {
                    // cancel -> exit
                })
            } else {
                if ((recordset.val('单证确认4') || '') == '') {
                    recordset.val('单证确5', '')
                }
            }
        }
    }

    if (field.full_name == n + '.业务审批4') {
        const sh = recordset.val('业务审批4') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/ywsp/check', {
                sh: sh
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 业务5 = '1'
                        recordset.val('业务5', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无业务审核权限!')
                        recordset.val('业务审批4', '')
                        recordset.val('业务5', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 业务审批4为空 -> 清空业务5
            recordset.val('业务5', '')
        }
    }

    if (field.full_name == n + '.单证审批4') {
        const sh = recordset.val('单证审批4') || ''

        if (sh != '') {
            _.http.post('/api/saier/forwarder_expense/dzsp/check', {
                sh: sh,
                zdhd: '1'
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.pass == 1) {
                        // Pascal: 单证5 = '1'
                        recordset.val('单证5', '1')
                    } else {
                        _.ui.message.error('不好意思,此人无单证审核权限!')
                        recordset.val('单证审批4', '')
                        recordset.val('单证5', '')
                    }
                } else {
                    _.ui.message.error(res.msg || '校验失败')
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        } else {
            // Pascal: 单证审批4为空 -> 清空业务审批4、单证5
            recordset.val('业务审批4', '')
            recordset.val('单证5', '')
        }
    }

    const xgzfFields = new Set([
        n + '.相关杂费.FORM费用', n + '.相关杂费.价 格 单', n + '.相关杂费.商 检 费', n + '.相关杂费.仓库名称', n + '.相关杂费.装柜费用',
        n + '.相关杂费.进仓费用', n + '.相关杂费.杂费名称', n + '.相关杂费.其它杂费', n + '.相关杂费.核对时间', n + '.相关杂费.费用合计'
    ])

    if (xgzfFields.has(field.full_name)) {
        const hdcw = recordset.value('相关杂费.核对财务', row) || ''
        const wyzd = recordset.value('相关杂费.唯一字段', row) || ''

        // Pascal: 非本人核对 + 核对财务非空 + 唯一字段非空 => 无权修改，回滚
        if (hdcw != _.user.username && hdcw != '' && wyzd != '') {
            _.http.post('/api/saier/forwarder_expense/xgzf/change/check', {
                wyzd: wyzd
            }).then(res => {
                if (res.code == 1 && res.data && res.data.locked == 1) {
                    const r = res.data.row || {}
                    _.ui.message.error('您无权修改')
                    recordset.val('相关杂费.FORM费用', r['FORMfy'] || 0, row)
                    recordset.val('相关杂费.价 格 单', r['JGD'] || 0, row)
                    recordset.val('相关杂费.商 检 费', r['sjf'] || 0, row)
                    recordset.val('相关杂费.仓库名称', r['ckmc'] || '', row)
                    recordset.val('相关杂费.装柜费用', r['ckfy'] || 0, row)
                    recordset.val('相关杂费.进仓费用', r['jcfy'] || 0, row)
                    recordset.val('相关杂费.杂费名称', r['zfmc'] || '', row)
                    recordset.val('相关杂费.其它杂费', r['qtzf'] || 0, row)
                    recordset.val('相关杂费.核对时间', r['hdsj'] || '', row)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '校验失败')
            })
        }

        // Pascal: 核对时间为空 => 核对财务清空；否则=当前用户
        const hdsj = recordset.value('相关杂费.核对时间', row) || ''
        if (hdsj == '') {
            recordset.val('相关杂费.核对财务', '', row)
        } else {
            recordset.val('相关杂费.核对财务', username, row)
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, forwarder_expense_field_change, '货代费用')

const forwarder_expense_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username

        try {
            // -------------------------
            // 1) 基础信息
            // -------------------------
            let fphm = recordset.val('发票号码') || ''
            let sz = fphm ? fphm.substring(0, 1) : ''
            let wz = fphm ? fphm.substring(fphm.length - 1, fphm.length) : ''

            recordset.val('修改人员', username)

            // -------------------------
            // 2) 三块费用汇总
            // -------------------------
            let zdcf = Number(recordset.val('订 舱 费') || 0)
            let THCf = Number(recordset.val('THC 费') || 0)
            let wjf = Number(recordset.val('文 件 费') || 0)
            let zczf = Number(recordset.val('操 作 费') || 0)
            let AMSENS = Number(recordset.val('AMS/ENS') || 0)
            let dfzd = Number(recordset.val('电放/转单') || 0)
            let dcf = Number(recordset.val('堆 存 费') || 0)
            let zxf = Number(recordset.val('滞 箱 费') || 0)
            let xdf = Number(recordset.val('箱 单 费') || 0)
            let gzf = Number(recordset.val('港 杂 费') || 0)
            let cdlrf = Number(recordset.val('舱单录入费') || 0)
            let gbf = Number(recordset.val('过 磅 费') || 0)
            let tcf = Number(recordset.val('拖 车 费') || 0)
            let tjf = Number(recordset.val('提 进 费') || 0)
            let zbgf = Number(recordset.val('报 关 费') || 0)
            let pxnz = Number(recordset.val('拼箱/内装') || 0)
            let gdf = Number(recordset.val('改 单 费') || 0)
            let cyf = Number(recordset.val('查 验 费') || 0)
            let qtfy = Number(recordset.val('其它费用') || 0)
            let tbf = Number(recordset.val('特报费') || 0)

            let hjnl = zdcf + THCf + wjf + zczf + AMSENS + dfzd + dcf + zxf + xdf + gzf + cdlrf + gbf + tcf + tjf + zbgf + pxnz + gdf + cyf + qtfy + tbf
            recordset.val('指定内陆￥', hjnl)

            let tcf1 = Number(recordset.val('拖车费') || 0)
            let tjf1 = Number(recordset.val('提进费') || 0)
            let dsf1 = Number(recordset.val('待 时 费') || 0)
            let gyf1 = Number(recordset.val('过夜费') || 0)
            let tmfy1 = Number(recordset.val('条码费用') || 0)
            let jff1 = Number(recordset.val('加封费') || 0)
            let zczf1 = Number(recordset.val('操作费') || 0)
            let sjhd1 = Number(recordset.val('商检换单1') || 0)
            let zbgf1 = Number(recordset.val('报关费') || 0)
            let ldf1 = Number(recordset.val('联单费') || 0)
            let gyd1 = Number(recordset.val('改 运 低') || 0)
            let cyf1 = Number(recordset.val('查验费') || 0)
            let mdf1 = Number(recordset.val('摩的费') || 0)
            let lwf1 = Number(recordset.val('劳务费') || 0)
            let jtf1 = Number(recordset.val('交通费') || 0)
            let gdf1 = Number(recordset.val('改单费') || 0)
            let xdf1 = Number(recordset.val('箱单费') || 0)
            let zxckf1 = Number(recordset.val('重箱出卡费') || 0)
            let qtfy1 = Number(recordset.val('其它费用1') || 0)
            let tbf1 = Number(recordset.val('特报费1') || 0)

            let hjnl1 = tcf1 + tjf1 + dsf1 + gyf1 + tmfy1 + jff1 + zczf1 + sjhd1 + zbgf1 + ldf1 + gyd1 + cyf1 + mdf1 + lwf1 + jtf1 + gdf1 + xdf1 + zxckf1 + qtfy1 + tbf1
            recordset.val('自报内陆￥', hjnl1)

            let zbgf2 = Number(recordset.val('报关费2') || 0)
            let ldf2 = Number(recordset.val('联单费2') || 0)
            let gyd2 = Number(recordset.val('改运抵2') || 0)
            let cyf2 = Number(recordset.val('查验费2') || 0)
            let mdf2 = Number(recordset.val('摩的费2') || 0)
            let lwf2 = Number(recordset.val('劳务费2') || 0)
            let jtf2 = Number(recordset.val('交通费2') || 0)
            let gdf2 = Number(recordset.val('改单费2') || 0)
            let xdf2 = Number(recordset.val('箱单费2') || 0)
            let zczf2 = Number(recordset.val('操作费2') || 0)
            let sjhd2 = Number(recordset.val('商检换单') || 0)
            let zxck2 = Number(recordset.val('重箱出卡') || 0)
            let qtfy2 = Number(recordset.val('其它费用2') || 0)
            let tbf2 = Number(recordset.val('特报费2') || 0)

            let hjnl2 = zbgf2 + ldf2 + gyd2 + cyf2 + mdf2 + lwf2 + jtf2 + gdf2 + xdf2 + zczf2 + sjhd2 + zxck2 + qtfy2 + tbf2
            recordset.val('单报内陆￥', hjnl2)

            let hjhy = Number(recordset.val('指定海运$') || 0)
            let hjhy1 = Number(recordset.val('自报海运$') || 0)
            let hjhy2 = Number(recordset.val('单报海运$') || 0)

            recordset.val('总计内陆￥', hjnl + hjnl1 + hjnl2)
            recordset.val('总计海运$', hjhy + hjhy1 + hjhy2)

            let rmb = Number(recordset.val('总计内陆￥') || 0)
                + Number(recordset.val('杂费合计￥') || 0)
                + Number(recordset.val('费用金额￥') || 0)
                + Number(recordset.val('商检金额￥') || 0)
            recordset.val('总计费用￥', rmb)

            // -------------------------
            // 3) 审批状态默认“待审批”
            // -------------------------
            if ((recordset.val('业务审批') || '') != '' || (recordset.val('单证审批') || '') != '') {
                if ((recordset.val('业务确认') || '') == '') recordset.val('业务确认', '待审批')
                if ((recordset.val('单证确认') || '') == '') recordset.val('单证确认', '待审批')
            }
            if ((recordset.val('业务审批1') || '') != '' || (recordset.val('单证审批1') || '') != '') {
                if ((recordset.val('业务确认1') || '') == '') recordset.val('业务确认1', '待审批')
                if ((recordset.val('单证确认1') || '') == '') recordset.val('单证确认1', '待审批')
            }
            if ((recordset.val('业务审批2') || '') != '' || (recordset.val('单证审批2') || '') != '') {
                if ((recordset.val('业务确认2') || '') == '') recordset.val('业务确认2', '待审批')
                if ((recordset.val('单证确认2') || '') == '') recordset.val('单证确认2', '待审批')
            }
            if ((recordset.val('业务审批3') || '') != '' || (recordset.val('单证审批3') || '') != '') {
                if ((recordset.val('业务确认3') || '') == '') recordset.val('业务确认3', '待审批')
                if ((recordset.val('单证确认3') || '') == '') recordset.val('单证确认3', '待审批')
            }
            if ((recordset.val('业务审批4') || '') != '' || (recordset.val('单证审批4') || '') != '') {
                if ((recordset.val('业务确认4') || '') == '') recordset.val('业务确认4', '待审批')
                if ((recordset.val('单证确认4') || '') == '') recordset.val('单证确认4', '待审批')
            }

            // -------------------------
            // 4) 相关杂费“唯一字段”补齐
            // -------------------------
            let xgzf = recordset.tables['相关杂费']
            let i1 = 0
            if (xgzf && xgzf.view_data) {
                for (let i = 0; i < xgzf.view_data.length; i++) {
                    i1++
                    let row = xgzf.view_data[i]
                    if (!row.wyzd || row.wyzd == '') {
                        row.wyzd = String(i1) + ':' + username + new Date().format('yyyy-MM-dd hh:mm:ss')
                        if (xgzf.push_modi_rid && row.rid) xgzf.push_modi_rid(row.rid)
                    }
                }
                if (xgzf.sync_operate_data) xgzf.sync_operate_data()
                xgzf.modified = true
            }

            // -------------------------
            // 5) 调后端做 DB 侧处理（run_sql + model）
            //    说明：
            //    - cyz/cymx/cymxsheet/fpgl/cdhz/xxck/sys_alarm 等都放后端
            //    - “价格单费用自动补行”也放后端按同逻辑处理
            // -------------------------
            _.http.post('/api/saier/forwarder_expense/save/before', {
                rid: recordset.val('rid') || '',
                fphm: fphm,
                sz: sz,
                wz: wz,
                username: username,

                zfhj: Number(recordset.val('杂费合计￥') || 0),
                zjnl: Number(recordset.val('指定内陆￥') || 0),
                zbnl: Number(recordset.val('自报内陆￥') || 0),
                dbnl: Number(recordset.val('单报内陆￥') || 0),
                zjhy: Number(recordset.val('总计海运$') || 0),
                zfy: Number(recordset.val('总计费用￥') || 0),

                khmc: recordset.val('客户名称') || '',
                cydt: recordset.val('出运日期') || '',
                hznf: recordset.val('合作年份') || '',

                zdhd: recordset.val('指定货代') || '',
                zlhd: recordset.val('自拉货代') || '',
                dbhd: recordset.val('报关货代') || '',
                sjhd: recordset.val('商检货代') || '',

                xgzf_list: (recordset.tables['相关杂费'] && recordset.tables['相关杂费'].view_data) ? recordset.tables['相关杂费'].view_data : [],
                hdxq_list: (recordset.tables['货代详情'] && recordset.tables['货代详情'].view_data) ? recordset.tables['货代详情'].view_data : [],

                // Pascal 10+10 所需镜像字段
                sp: {
                    zdr: recordset.val('制单人员') || '',

                    yw1: recordset.val('业务1') || '',
                    dz1: recordset.val('单证1') || '',
                    ywsp: recordset.val('业务审批') || '',
                    dzsp: recordset.val('单证审批') || '',
                    ywqr: recordset.val('业务确认') || '',
                    dzqr: recordset.val('单证确认') || '',
                    ywqf: recordset.val('业务确1') || '',
                    dzqf: recordset.val('单证确1') || '',
                    ywbth: recordset.val('业务不确认1') || '',
                    dzbth: recordset.val('单证不确认1') || '',

                    yw2: recordset.val('业务2') || '',
                    dz2: recordset.val('单证2') || '',
                    ywsp1: recordset.val('业务审批1') || '',
                    dzsp1: recordset.val('单证审批1') || '',
                    ywqr1: recordset.val('业务确认1') || '',
                    dzqr1: recordset.val('单证确认1') || '',
                    ywqf2: recordset.val('业务确2') || '',
                    dzqf2: recordset.val('单证确2') || '',
                    ywbth2: recordset.val('业务不确认2') || '',
                    dzbth2: recordset.val('单证不确认2') || '',

                    yw3: recordset.val('业务3') || '',
                    dz3: recordset.val('单证3') || '',
                    ywsp2: recordset.val('业务审批2') || '',
                    dzsp2: recordset.val('单证审批2') || '',
                    ywqr2: recordset.val('业务确认2') || '',
                    dzqr2: recordset.val('单证确认2') || '',
                    ywqf3: recordset.val('业务确3') || '',
                    dzqf3: recordset.val('单证确3') || '',
                    ywbth3: recordset.val('业务不确认3') || '',
                    dzbth3: recordset.val('单证不确认3') || '',

                    yw4: recordset.val('业务4') || '',
                    dz4: recordset.val('单证4') || '',
                    ywsp3: recordset.val('业务审批3') || '',
                    dzsp3: recordset.val('单证审批3') || '',
                    ywqr3: recordset.val('业务确认3') || '',
                    dzqr3: recordset.val('单证确认3') || '',
                    ywqf4: recordset.val('业务确4') || '',
                    dzqf4: recordset.val('单证确4') || '',
                    ywbth4: recordset.val('业务不确认4') || '',
                    dzbth4: recordset.val('单证不确认4') || '',

                    yw5: recordset.val('业务5') || '',
                    dz5: recordset.val('单证5') || '',
                    ywsp4: recordset.val('业务审批4') || '',
                    dzsp4: recordset.val('单证审批4') || '',
                    ywqr4: recordset.val('业务确认4') || '',
                    dzqr4: recordset.val('单证确认4') || '',
                    ywqf5: recordset.val('业务确5') || '',
                    dzqf5: recordset.val('单证确5') || '',
                    ywbth5: recordset.val('业务不确认5') || '',
                    dzbth5: recordset.val('单证不确认5') || ''
                }
            }).then(res => {
                if (res.code == 1) {
                    if (res.data && res.data.hznf) {
                        recordset.val('合作年份', res.data.hznf)
                    }

                    // 补：后端建议追加“价格单费用”
                    if (res.data && res.data.append_xgzf) {
                        const t = recordset.tables['相关杂费']
                        if (t && t.view_data) {
                            const row = {
                                rid: _.utils.guid(),
                                pid: recordset.val('rid'),
                                uid: _.user.rid,
                                ctime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                                zfmc: res.data.append_xgzf['杂费名称'] || '价格单费用',
                                JGD: Number(res.data.append_xgzf['价 格 单'] || 0),
                                sjf: 0,
                                fyhj: Number(res.data.append_xgzf['费用合计'] || 0),
                                wyzd: res.data.append_xgzf['唯一字段'] || '',
                                ckmc: '' // 不要 Number('')
                            }
                            t.view_data.push(row)
                            if (t.push_new_rid) t.push_new_rid(row.rid)
                            if (t.sync_operate_data) t.sync_operate_data()
                            t.modified = true
                        }
                    }

                    resolve()
                } else {
                    _.ui.message.error(res.msg || '保存前检查失败')
                    reject()
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '保存前接口异常')
                reject()
            })

        } catch (e) {
            console.log(e)
            _.ui.message.error('保存前处理异常')
            reject()
        }
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, forwarder_expense_before_save, '货代费用')


// 查询界面或编辑界面、子表上按钮点击事件
const forwarder_expense_form_BtnClick = async(evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset

    if (btn.name == 'forwarder_expense_cwqr_btn') {
        _.ui.show_input_dialog('指定输1,自拉输2,单报关输3,特报输4,商检输5,不输为全部', '').then(tp => {
            if (tp == null || tp == undefined) return
            if (!['1', '2', '3', '4', '5'].includes(tp)) tp = '6'

            _.http.post('/api/saier/forwarder_expense/button/cwqr', {
                rid: recordset.val('rid') || '',
                fphm: recordset.val('发票号码') || '',
                sb1: recordset.val('sb1') || '',
                tp: tp,

                zd: {
                    dzqr: recordset.val('单证确认') || '',
                    ywqr: recordset.val('业务确认') || '',
                    nl: Number(recordset.val('指定内陆￥') || 0),
                    hy: Number(recordset.val('指定海运$') || 0)
                },
                zl: {
                    dzqr: recordset.val('单证确认1') || '',
                    ywqr: recordset.val('业务确认1') || '',
                    nl: Number(recordset.val('自报内陆￥') || 0),
                    hy: Number(recordset.val('自报海运$') || 0)
                },
                db: {
                    dzqr: recordset.val('单证确认2') || '',
                    ywqr: recordset.val('业务确认2') || '',
                    nl: Number(recordset.val('单报内陆￥') || 0),
                    hy: Number(recordset.val('单报海运$') || 0)
                },
                tb: {
                    dzqr: recordset.val('单证确认3') || '',
                    ywqr: recordset.val('业务确认3') || '',
                    je: Number(recordset.val('费用金额 ￥') || 0)
                },
                sj: {
                    dzqr: recordset.val('单证确认4') || '',
                    ywqr: recordset.val('业务确认4') || '',
                    je: Number(recordset.val('商检金额￥') || 0)
                }
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg || '财务确认失败')
                    return
                }

                const data = res.data || {}
                const patches = data.patches || []

                for (let p of patches) {
                    recordset.val(`${p.table}.${p.field}`, p.value || '')
                }
                recordset.val('财务确认情况', data.xx || '')

                _.ui.message.success('财务确认完成')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg || '财务确认接口异常')
            })
        })

    }

    if (btn.name == 'forwarder_expense_cwplqr_btn') {
        let rids = form.current_rids.value || []
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return
        }

        _.ui.show_input_dialog('指定输1,自拉输2,单报关输3,特报输4,商检输5,不输为全部', '').then(tp => {
            if (tp == null || tp == undefined) return
            if (!['1', '2', '3', '4', '5'].includes(tp)) tp = '6'

            _.http.post('/api/saier/forwarder_expense/button/cw_plqr', {
                rids: rids,
                tp: tp
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg || '财务确认失败')
                    return
                }

                _.ui.message.success(`财务确认完成，处理条数：${(res.data && res.data.count) || 0}`)

            }).catch(err => {
                _.ui.message.error(err.msg || '财务确认接口异常')
                console.log(err)
            })
        })
    }

    if (btn.name == "special_fee_report_btn") {
        let rid = form.current_rid.value
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }
        let mode = await _.ui.show_input_dialog('当前输1, 全部输2, 不输为当前');
        if (mode == null || mode == undefined) return;
        if (mode != '2') mode = '1';
        const res = await _.http.post('/api/saier/special/fee/report', {
            rid: rid,
            rids: rids,
            mode: mode,
        }).then(res => {
            // if (res.code != 1) {
            //     _.ui.message.error(res.msg)
            //     return
            // }
            let d = res.data;
            console.log("生成结果", res)
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                    file: d
                }, d
                );
            }
            _.ui.message.success(res.msg)
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (btn.name == "document_fee_btn") {
        let rid = form.current_rid.value
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }
        _.ui.show_input_dialog('当前输1, 全部输2, 不输为当前').then(tp => {
            if (tp == null || tp == undefined) return
            if (tp != '2') tp = '1'

            _.http.post('/api/saier/document/fee/generate', {
                rid: rid,
                rids: rids,
                iekedit: tp,
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg)
                    return
                }
                let d = res.data;
                console.log("生成结果", res)
                if (d && d != '') {
                    _.http.download("/api/tmp/file/get", {
                        file: d
                    }, d
                    );
                }
                _.ui.message.success(res.msg)
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        })
    }
    if (btn.name == "batch_cost_export_btn") {
        let rid = form.current_rid.value
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }
        let mode = await _.ui.show_input_dialog('当前输1, 全部输2, 不输为当前');
        if (mode == null || mode == undefined) return
        if (mode != '2') mode = '1'
        let export_data = await _.ui.show_input_dialog('请要导出的内容,指定货代输1,自拉自报输2,单报关输3,可任意组合,所有为123')
        if (export_data == null || export_data == undefined) return
        const res = await _.http.post('/api/saier/batch/cost/export', {
            rid: rid,
            rids: rids,
            mode: mode,
            export_data: export_data
        }).then(res => { 
            if (res.code != 1) {
                _.ui.message.error(res.msg)
                return
            }
            let d = res.data;
            console.log("生成结果", res)
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                    file: d
                }, d
                );
            }
            _.ui.message.success(res.msg)
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }

    if (btn.name == 'forwarder_expense_cwth_btn') {
        _.ui.show_input_dialog('指定输1,自拉输2,单报关输3,特报输4,商检输5,不输为全部', '').then(tp => {
            if (tp == null || tp == undefined) return
            if (!['1', '2', '3', '4', '5'].includes(tp)) tp = '6'

            _.http.post('/api/saier/forwarder_expense/button/cw_th', {
                rid: recordset.val('rid'),
                tp: tp
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg || '财务退回失败')
                    return
                }
                _.ui.message.success('财务退回完成')
            }).catch(err => {
                _.ui.message.error(err.msg || '财务退回接口异常')
                console.log(err)
            })
        })
    }

    if (btn.name == 'forwarder_expense_xjtb_btn') {
        if (recordset.val('费用内容') != '' && recordset.val('单证确认3') == '通过' && recordset.val('业务确认3') == '通过') {
            let t = recordset.tables['特报详情'];
            let y = t.view_data;

            let l = {}
            l.rid = _.utils.guid()
            l.pid = recordset.val('rid')
            l.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
            l.uid = _.user.rid
            l.fynr = recordset.val('费用内容')
            l.fyje = recordset.val('费用金额 ￥')
            l.fyjem = recordset.val('费用金额 $')
            l.tbbz = recordset.val('特报备注')
            l.ywsp3 = recordset.val('业务审批3')
            l.ywqr3 = recordset.val('业务确认3')
            l.dzsp3 = recordset.val('单证审批3')
            l.dzqr3 = recordset.val('单证确认3')
            l.tbdy = recordset.val('特报打印')
            l.tcwqr = recordset.val('特财务确认')
            l.tbrq = recordset.val('特报日期')
            l.tbhd = recordset.val('特报货代')
            y.push(l)
            t.push_new_rid(l.rid)

            t.sync_operate_data();
            t.modified = true;
            recordset.val('费用内容', '')
            recordset.val('费用金额 ￥', 0)
            recordset.val('费用金额 $', 0)
            recordset.val('特报备注', '')
            recordset.val('业务审批3', '')
            recordset.val('业务确认3', '')
            recordset.val('单证审批3', '')
            recordset.val('单证确认3', '')
            recordset.val('特报打印', null)
            recordset.val('特财务确认', '')
            recordset.val('特报日期', null)
            recordset.val('特报货代', '')
        }
    }

    if (btn.name == 'forwarder_expense_gxckfy_btn') {
        const fphm = (recordset.val('发票号码') || '').trim()
        if (!fphm) {
            _.ui.message.error('发票号码不能为空')
            return
        }

        _.http.post('/api/saier/forwarder_expense/button/gxckfy/options', { fphm: fphm }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '加载仓库费用失败')
                return
            }

            const rows = (res.data && res.data.rows) ? res.data.rows : []
            if (rows.length == 0) {
                _.ui.message.info('无可更新的仓库费用数据')
                return
            }

            const t = recordset.tables['相关杂费']
            if (!t || !t.view_data) {
                _.ui.message.error('未找到子表：相关杂费')
                return
            }

            const y = t.view_data
            let upd_count = 0
            let add_count = 0

            rows.forEach(r => {
                const key = String((r && r.sqdh) || '').trim()
                if (!key) return

                let hit = 0
                y.forEach(l => {
                    const wyzd = String((l && l.wyzd) || '').trim()
                    if (wyzd === key) {
                        hit += 1

                        const hdsj = String((l && l.hdsj) || '').trim()   // 核对时间
                        const hdcw = String((l && l.hdcw) || '').trim()   // 核对财务

                        if (hdsj === '' || hdcw === _.user.username) {
                            l.ckfy = Number((r && r.zgfy) || 0)            // 装柜费用
                            l.wyzd = key                                   // 唯一字段
                            l.ckmc = String((r && r.warehouse_name) || '') // 仓库名称
                            if (l.rid && t.push_modi_rid) t.push_modi_rid(l.rid)
                            upd_count += 1
                        }
                    }
                })

                if (hit === 0) {
                    const nrow = {
                        rid: _.utils.guid(),
                        pid: recordset.val('rid'),
                        ctime: new Date().format('yyyy-MM-dd hh:mm:ss'),
                        uid: _.user.rid,
                        ckfy: Number((r && r.zgfy) || 0),                 // 装柜费用
                        fyhj: Number((r && r.zgfy) || 0),                 // 费用合计（仅新增时赋值）
                        wyzd: key,                                        // 唯一字段
                        ckmc: String((r && r.warehouse_name) || '')       // 仓库名称
                    }
                    y.push(nrow)
                    if (t.push_new_rid) t.push_new_rid(nrow.rid)
                    add_count += 1
                }
            })

            if (upd_count > 0 || add_count > 0) {
                if (t.sync_operate_data) t.sync_operate_data()
                t.modified = true
            }

            _.ui.message.success(`仓库费用更新完成：更新${upd_count}条，新增${add_count}条`)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg || '更新仓库费用失败')
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], forwarder_expense_form_BtnClick, '货代费用')

const forwarder_expense_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'forwarder_expense_cwqr_btn',
            "caption": '财务确认',
            "icon": 'any-keyborad',
        }, {
            "name": 'forwarder_expense_cwth_btn',
            "caption": '财务退回',
            "icon": 'any-keyborad',
        }, {
            "name": 'forwarder_expense_xjtb_btn',
            "caption": '新建特报',
            "icon": 'any-keyborad',
        }, {
            "name": 'forwarder_expense_gxckfy_btn',
            "caption": '更新仓库费用',
            "icon": 'any-keyborad',
        })


    }
    if (!form.is_editor) {
        btns.push({
            "name": 'forwarder_expense_cwplqr_btn',
            "caption": '财务确认批量',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": "special_fee_report_btn",
            "caption": "特报费用导出",
            "icon": "any-keyborad",
        })
        btns.push({
            "name": "batch_cost_export_btn",
            "caption": "批量费用导出",
            "icon": "any-keyborad",
        })
        btns.push({
            "name": "document_fee_btn",
            "caption": "商检费用导出",
            "icon": "any-keyborad",
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


}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], forwarder_expense_FormShow, '货代费用')
