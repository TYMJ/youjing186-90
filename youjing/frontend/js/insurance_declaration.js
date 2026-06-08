const insurance_declaration_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    if (recordset.val('保险提交') == '提交中' || recordset.val('保险提交') == '已提交') {
        recordset.module.field_by_full_name('发票号码').disabled = true;
        recordset.module.field_by_full_name('起始地名称').disabled = true;
        recordset.module.field_by_full_name('目的地名称').disabled = true;
        recordset.module.field_by_full_name('途经地名称').disabled = true;
        recordset.module.field_by_full_name('大船船名航次').disabled = true;
        recordset.module.field_by_full_name('驳船船名航次').disabled = true;
        recordset.module.field_by_full_name('发票金额').disabled = true;
        recordset.module.field_by_full_name('提单号').disabled = true;
        recordset.module.field_by_full_name('起运日期').disabled = true;
        recordset.module.field_by_full_name('保额币种').disabled = true;
        recordset.module.field_by_full_name('保费币种').disabled = true;
        recordset.module.field_by_full_name('保费').disabled = true;
        recordset.module.field_by_full_name('费率').disabled = true;
        recordset.module.field_by_full_name('数量').disabled = true;
        recordset.module.field_by_full_name('包装').disabled = true;
        recordset.module.field_by_full_name('运输方式').disabled = true;
        recordset.module.field_by_full_name('货物名称').disabled = true;
        recordset.module.field_by_full_name('保险提交').disabled = true;
        recordset.module.field_by_full_name('预 投 保').disabled = true;
        recordset.module.field_by_full_name('投保人名称').disabled = true;
        recordset.module.field_by_full_name('投保人税务登记号').disabled = true;
        recordset.module.field_by_full_name('投保人地址').disabled = true;
        recordset.module.field_by_full_name('投保人电话').disabled = true;
        recordset.module.field_by_full_name('被保人名称').disabled = true;
        recordset.module.field_by_full_name('被保人税务登记号').disabled = true;
        recordset.module.field_by_full_name('被保人地址').disabled = true;
        recordset.module.field_by_full_name('被保人电话').disabled = true;
    }
}
_.evts.on([_.evtids.RECORD_LOAD], insurance_declaration_recordLoad, '保险申报')

const insurance_declaration_beforeSave = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let bf = Number(recordset.val('保费') || 0)
        bf = Math.trunc(bf * 100) / 100
        recordset.val('保费', bf)

        if (Number(recordset.val('保费') || 0) < 3) {
            recordset.val('保费', 3)
        }

        const qsd = String(recordset.val('起始地名称') || '').toUpperCase()
        const mdd = String(recordset.val('目的地名称') || '').toUpperCase()
        const tjd = String(recordset.val('途经地名称') || '').trim()

        if ((qsd === 'ZHAPU' || mdd === 'ATLANTA') && tjd === '') {
            _.ui.message.error('途经地名称名称必填!')
            reject()
        } else {
            resolve()
        }
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, insurance_declaration_beforeSave, '保险申报')

const insurance_declaration_fieldChange = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    if (field.full_name == n + '.发票号码') {
        if (recordset.val('发票号码') != '') {
            _.http.post('/api/saier/insurance_declaration/fphm/change', {
                fphm: recordset.val('发票号码')
            }).then(res => {
                if(res.code == 1) {
                    recordset.val('货物名称', res.data.djpmy_text)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }

    if (field.full_name == n + '.大船船名航次' || field.full_name == n + '.驳船船名航次') {
        if (recordset.val('大船船名航次') == '/') {
            recordset.val('大船船名航次', '')
        }
        if (recordset.val('驳船船名航次') == '/') {
            recordset.val('驳船船名航次', '')
        }
    }

    if (field.full_name == n + '.投保人税务登记号' ||
        field.full_name == n + '.投保人地址' || field.full_name == n + '.投保人电话'
    ) {
        recordset.val('被保人税务登记号', recordset.val('投保人税务登记号'))
        recordset.val('被保人地址', recordset.val('投保人地址'))
        recordset.val('被保人电话', recordset.val('投保人电话'))
    }

    if (field.full_name == n + '.目的地名称' || field.full_name == n + '.起始地名称') {
        if (recordset.val('目的地名称') != '' || recordset.val('起始地名称') != '') {
            _.http.post('/api/saier/insurance_declaration/port/change', {
                '目的地名称': recordset.val('目的地名称'),
                '起始地名称': recordset.val('起始地名称')
            }).then(res => {
                if (res.code == 1) {
                    let fields = (res.data && res.data.fields) ? res.data.fields : {}
                    Object.keys(fields).forEach(k => recordset.val(k, fields[k]))

                    let errors = (res.data && res.data.errors) ? res.data.errors : []
                    for (let m of errors) _.ui.message.error(m)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
}

_.evts.on(_.evtids.RECORD_FIELD_CHANGE, insurance_declaration_fieldChange, '保险申报')