const ship_agent_record_load = (evt_id, recordset) => {
    const hdmc = recordset.val('货代名称') || ''
    if (hdmc != '') {
        _.http.post('/api/saier/ship_agent/load/check_hdmc_lock', {
            hdmc: hdmc
        }).then(res => {
            if (res.code == 1) {
                if (res.data?.hdmcdata == 1) {
                    recordset.module.field_by_full_name('货代名称').disabled = true;
                }
            }
            
        })

    }
}
_.evts.on([_.evtids.RECORD_AFTER_EMPTY, _.evtids.RECORD_LOAD], ship_agent_record_load, '船代资料')



const ship_agent_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/ship_agent/before_save', {
            main: {
                hdbh: Number(recordset.val('货代编号') || 0)
            }
        }).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '保存前处理失败')
                reject()
                return
            }

            const new_hdbh = Number(res.data?.hdbh || 0)
            if (new_hdbh > 0) {
                recordset.val('货代编号', new_hdbh)
            }

            // 简单子表回填放前端
            const t = recordset.tables['货代协议']
            if (t && t.view_data) {
                const hdmc = recordset.val('货代名称') || ''
                const hdbh = Number(recordset.val('货代编号') || 0)

                for (let r of t.view_data) {
                    r.cdbh = hdbh
                    r.cdmc = hdmc
                    if (r.rid) t.push_modi_rid(r.rid)
                }
                t.sync_operate_data()
                t.modified = true
            }

            resolve()
        }).catch(err => {
            _.ui.message.error(err.msg || '请求失败')
            reject()
        })
    })
}

_.evts.on(_.evtids.RECORD_BEFORE_SAVE, ship_agent_before_save, '船代资料')

const ship_agent_form_btn_click = (evt_id, btn, form) => {
    const recordset = form.recordset

    // 按钮1：生成货代编号
    if (btn.name == 'ship_agent_next_hdbh_btn') {
        _.http.post('/api/saier/ship_agent/button/get_next_hdbh', {}).then(res => {
            if (res.code != 1) {
                _.ui.message.error(res.msg || '获取货代编号失败')
            } else {
                const hdbh = Number((res.data && res.data.hdbh) || 0)
                if (hdbh > 0) recordset.val('货代编号', hdbh)
            }
        }).catch(err => {
            _.ui.message.error(err.msg || '请求失败')
        })
    }
}

_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], ship_agent_form_btn_click, '船代资料')

const ship_agent_form_show = (evt_id, form) => {
    let btns = []
    btns.push({
        name: 'ship_agent_next_hdbh_btn',
        caption: '生成货代编号',
        icon: 'any-keyborad',
    })
    form.toolbar.insert([{
        name: 'ship_agent_ext_btn',
        caption: '扩展',
        icon: '#ext-add_database',
        btns: btns
    }], 'close')
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], ship_agent_form_show, '船代资料')

const ship_agent_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '查看人员') {
            if (recordset.val('查看人员') == _.user.username) {
                _.ui.message.error('不好意思,不能删除自已的数据!')
                reject()
            }

            _.http.post('/api/saier/ship_agent/viewer/delete/before', {
                rid: recordset.val('rid'),
                ckry: recordset.val('查看人员')
            }).then(res => {
                if (res.code == 1) resolve()
                else {
                    _.ui.message.error(res.msg || '删除前校验失败')
                    reject()
                }
            }).catch(err => {
                _.ui.message.error(err.msg || '请求失败')
                reject()
            })
        } else {
            resolve()
        }
    })
}

_.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, ship_agent_table_delete_before, '船代资料')