const unhandled_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'make_bgmxd_btn') {
        let recordset = form.recordset
        _.ui.show_input_dialog('请输入发票号码', '').then(fphm => {
            if (!fphm || fphm == '') {
                _.ui.message.error('发票号码不能为空')
            } else {
                let rids = form.current_rids.value
                if (rids.length == 0){
                    if (form.current_rid.value && form.current_rid.value != '') {
                        rids = [form.current_rid.value]
                    }
                }
                if (rids.length == 0) {
                    _.ui.message.error('未处理清单记录不能为空');
                    return
                }

                _.http.post('/api/saier/shipment/bgmxd/make/prepare', {
                    fphm: fphm,
                    selected_rids: rids
                }).then(res => {
                    if (res.code != 1) {
                        _.ui.message.error(res.msg || '预检失败')
                    } else {
                        let d = res.data || {}
                        let gczj = Number(d.gczj || 0)
                        _.ui.show_input_select_dialog(
                            '请注意总金额' + gczj + '; 请选择',
                            '取消',
                            ['取消', '确认']
                        ).then(op => {
                            if (op != '确认') return

                            _.http.post('/api/saier/shipment/bgmxd/make/confirm', {
                                fphm: fphm,
                                selected_rids: rids
                            }).then(x => {
                                if (x.code != 1) {
                                    _.ui.message.error(x.msg || '处理失败')
                                } else {
                                    let w = (x.data && x.data.warnings) ? x.data.warnings : []
                                    if (w.length > 0) _.ui.message.error(w.join('\n'))
                                    _.ui.message.success('操作成功')
                                }
                            }).catch(err => {
                                _.ui.message.error(err.msg || '请求失败')
                            })
                        })
                    }
                }).catch(err => {
                    _.ui.message.error(err.msg || '请求失败')
                })
   
            }
        })
    }
}
_.evts.on(_.evtids.TOOLBAR_BUTTON_CLICK, unhandled_BtnClick, '未处理清单')


const unhandled_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'make_bgmxd_btn',
        "caption": '批量补报',
        "icon": 'any-keyborad',
    })
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW], unhandled_FormShow, '未处理清单')