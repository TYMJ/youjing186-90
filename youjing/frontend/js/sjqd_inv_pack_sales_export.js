// 商检清单详情页：向预置「扩展」追加 INV pack sales
// - commodity_inspection.js 已 insert export_btn，本脚本只 push 子按钮
// - 请求仅传主表 rid，hr 固定为 2（bestorebips1.xlsx）

const _sjqd_extension_btns = (form) => {
    const rows = form.toolbar?.btns
    if (Array.isArray(rows)) {
        for (const row of rows) {
            if (!Array.isArray(row)) {
                continue
            }
            for (const item of row) {
                if (item && item.name === 'export_btn' && Array.isArray(item.btns)) {
                    return item.btns
                }
            }
        }
    }
    return form.toolbar.btns?.[20]?.[0]?.btns || null
}

const sjqd_inv_pack_sales_export_BtnClick = async (evt_id, btn, form) => {
    if (btn.name !== 'sjqd_inv_pack_sales_btn') {
        return
    }

    const rid = form.current_rid && form.current_rid.value
        ? String(form.current_rid.value).trim()
        : ''
    if (!rid) {
        _.ui.message.error('请先打开当前商检清单记录!')
        return
    }
    _.ui.show_loading_dialog('正在批量生成INV pack sales...');
    await _.http.post('/api/saier/commodity_inspection/sjqd_inv_sales/export', {
        rid: rid,
        hr: '2',
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
    }).finally(() => {
        _.ui.hide_loading_dialog()
    })
}

const sjqd_inv_pack_sales_export_FormShow = (evt_id, form) => {
    if (!form.is_editor) {
        return
    }

    const append = () => {
        const btns = _sjqd_extension_btns(form)
        if (!btns) {
            return false
        }
        if (btns.some(b => b.name === 'sjqd_inv_pack_sales_btn')) {
            return true
        }
        btns.push({
            name: 'sjqd_inv_pack_sales_btn',
            caption: 'INV pack sales',
            icon: 'any-server-update',
            divided: true,
        })
        return true
    }

    if (!append()) {
        setTimeout(append, 0)
    }
}

_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], sjqd_inv_pack_sales_export_BtnClick, '商检清单')
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], sjqd_inv_pack_sales_export_FormShow, '商检清单')
