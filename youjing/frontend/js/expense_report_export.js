// 费用申请：向预置「扩展」菜单追加「费用报表输出」（勿 insert 整块扩展）

const expense_report_export_BtnClick = async (evt_id, btn, form) => {
    if (btn.name !== 'expense_report_export_btn') {
        return
    }

    let rid = form.current_rid.value
    let rids = form.current_rids.value || []
    if (rids.length === 0 && rid) {
        rids = [rid]
    }

    let mode = await _.ui.show_input_dialog('1为当前信息，输2为批量，默认当前')
    if (mode == null || mode === undefined) {
        return
    }
    if (mode !== '2') {
        mode = '1'
    }

    let tp = '1'
    if (mode === '2') {
        if (rids.length === 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return
        }
        tp = await _.ui.show_input_dialog('PDF输1,批量PDF输2,不输为1')
        if (tp == null || tp === undefined) {
            return
        }
        if (tp !== '2') {
            tp = '1'
        }
    } else {
        if (!rid) {
            _.ui.message.error('请先打开当前费用申请记录!')
            return
        }
    }

    await _.http.post('/api/saier/expense/report/export', {
        rid: rid,
        rids: mode === '2' ? rids : [],
        mode: mode,
        tp: tp,
    }).then(res => {
        if (res.code != 1) {
            _.ui.message.error(res.msg)
            return
        }
        const d = res.data
        if (d && d !== '') {
            _.http.download('/api/tmp/file/get', { file: d }, d)
        }
        _.ui.message.success(res.msg)
    }).catch(err => {
        _.ui.message.error(err.msg || String(err))
        console.log(err)
    })
}

const expense_report_export_FormShow = (evt_id, form) => {
    const btns = form.toolbar.btns?.[20]?.[0]?.btns
    if (!btns || form.is_editor) {
        return
    }
    if (btns.some(b => b.name === 'expense_report_export_btn')) {
        return
    }
    btns.push({
        name: 'expense_report_export_btn',
        caption: '费用报表输出',
        icon: 'any-keyborad',
    })
}

_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], expense_report_export_BtnClick, '费用申请')
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], expense_report_export_FormShow, '费用申请')
