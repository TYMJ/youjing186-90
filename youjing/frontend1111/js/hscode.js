const hscode_recordLoad = (evt_id, recordset) => {
    _.http.post('/api/saier/hscode/load/check_user', {}).then(res => {
        if (res.code != 1) {
            _.ui.message.error(res.msg || '加载校验失败')
            return
        }

        let is_hg_user = (res.data && res.data.is_hg_user == 1)

        if (is_hg_user) {
            recordset.module.field_by_full_name('海关编码').disabled = false
            recordset.module.field_by_full_name('退税率').disabled = false
            recordset.module.field_by_full_name('增值税率').disabled = false
            recordset.module.field_by_full_name('是否批准').disabled = false
            recordset.module.field_by_full_name('详细资料.是否批准').disabled = false
        } else {
            // 按 Pascal sb='1' 且非海关岗位逻辑：只禁用“是否批准”
            recordset.module.field_by_full_name('是否批准').disabled = true
            recordset.module.field_by_full_name('详细资料.是否批准').disabled = true
        }
    }).catch(err => {
        _.ui.message.error(err.msg || '请求失败')
    })
}

_.evts.on([_.evtids.RECORD_AFTER_EMPTY, _.evtids.RECORD_LOAD], hscode_recordLoad, '海关编码表')

const hscode_fieldChange = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name

    if (field.full_name == n + '.海关编码') {
        _.http.post('/api/saier/hscode/hgbm/change', {
            '海关编码': recordset.val('海关编码'),
            '是否批准': recordset.val('是否批准'),
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '处理失败')
                return
            }

            let fields = (res.data && res.data.fields) ? res.data.fields : {}
            Object.keys(fields).forEach(k => recordset.val(k, fields[k]))
        }).catch(err => {
            _.ui.message.error(err.msg || '请求失败')
        })
    }

    // 详细资料.是否批准.change
    if (field.full_name == n + '.详细资料.是否批准') {
        if (String(value || '') == '是') {
            let zzsl = Number(recordset.val('详细资料.增值税率') || 0)
            let tsl = Number(recordset.val('详细资料.退税率') || 0)

            // 子表逐行修改（不清空）
            let t = recordset.tables['详细资料']
            if (t && t.view_data) {
                for (let r of t.view_data) {
                    r.zzsl = zzsl
                    r.tsl = tsl
                    if (r.rid) t.push_modi_rid(r.rid)
                }
                t.sync_operate_data()
                t.modified = true
            }
            recordset.val('增值税率', zzsl)
            recordset.val('退税率', tsl)
        }
    }

    if (field.full_name == n + '.详细资料.退税率' ||
        field.full_name == n + '.详细资料.增值税率' ||
        field.full_name == n + '.详细资料.中文品名' ||
        field.full_name == n + '.详细资料.英文品名' ||
        field.full_name == n + '.详细资料.计量单位' ||
        field.full_name == n + '.详细资料.申报要素' ||
        field.full_name == n + '.详细资料.是否商检' ||
        field.full_name == n + '.详细资料.商检标志'
    ) {
        recordset.val('详细资料.新增人员', _.user.username)
        recordset.val('详细资料.是否批准', '否')
    }

    if (field.full_name == n + '.详细资料.中文品名' ||
        field.full_name == n + '.详细资料.申报要素' ||
        field.full_name == n + '.详细资料.计量单位'
    ) {
        let hwmc = recordset.val('详细资料.中文品名')
        let cznr = recordset.val('详细资料.申报要素')
        let hgbm = recordset.val('详细资料.海关编码')
        let sb = recordset.val('详细资料.识别')

        if (String(sb || '') == '' && String(hwmc || '') != '' && String(cznr || '') != '' && String(hgbm || '') != '') {
            _.http.post('/api/saier/hscode/detail/check_duplicate', {
                '中文品名': hwmc,
                '申报要素': cznr,
                '海关编码': hgbm,
                '识别': sb
            }).then(res => {
                if (res.code == 1 && res.data && res.data.duplicate == 1) {
                    _.ui.message.error('相同中文品名+报关要素的已有请检查!不能提交保存')
                    recordset.val('详细资料.是否批准', '重复')
                }
            }).catch(err => {
                _.ui.message.error(err.msg || '请求失败')
            })
        }
    }
}

_.evts.on(_.evtids.RECORD_FIELD_CHANGE, hscode_fieldChange, '海关编码表')

const hscode_table_new_after = (evt_id, table, recordset) => {
    if (table.group == '详细资料') {
        recordset.val('详细资料.退税率', recordset.val('退税率'))
        recordset.val('详细资料.增值税率', recordset.val('增值税率'))
        recordset.val('详细资料.海关编码', recordset.val('海关编码'))

        _.http.post('/api/saier/hscode/load/check_user', {}).then(res => {
            if (res.code == 1 && res.data && res.data.is_hg_user == 1) {
                recordset.val('详细资料.是否批准', '')
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
}

_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY],hscode_table_new_after,'海关编码表')

const hscode_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        recordset.val('修改人员', _.user.username)

        let has_repeat = false
        const t = recordset.tables['详细资料']
        const details = (t && t.view_data) ? t.view_data : []

        for (let r of details) {
            r.hgbm = recordset.val('海关编码')
            r.tdhgbm = recordset.val('替代海关编码')
            r.jzcysb = recordset.val('禁止出运识别')
            r.jzbgsb = recordset.val('禁止报关识别')
            r.zzsl = Number(recordset.val('增值税率') || 0)
            r.tsl = Number(recordset.val('退税率') || 0)
            r.sfsj = recordset.val('是否商检')

            if (!r.sb) {
                r.sb = `${recordset.val('海关编码') || ''}/${r['中文品名'] || ''}/${r['申报要素'] || ''}${new Date().format('yyyy-MM-dd hh:mm:ss')}`
            }

            if (r.sfpz == '重复') {
                has_repeat = true
                _.ui.message.error(`中文品名:${r['中文品名'] || ''}已有请检查!不能提交保存`)
            }

            if (r.rid && t) t.push_modi_rid(r.rid)
        }

        if (t) {
            t.sync_operate_data()
            t.modified = true
        }

        if (has_repeat) {
            reject()
            return
        }

        _.http.post('/api/saier/hscode/before_save', {
            main: {
                hgbm: recordset.val('海关编码'),
                jzbgsb: recordset.val('禁止报关识别')
            },
            details: details
        }).then(res => {
            if (res.code == 1) resolve()
            else {
                _.ui.message.error(res.msg || '保存前处理失败')
                reject()
            }
        }).catch(err => {
            _.ui.message.error(err.msg || '请求失败')
            reject()
        })
    })
}

_.evts.on(_.evtids.RECORD_BEFORE_SAVE, hscode_before_save, '海关编码表')