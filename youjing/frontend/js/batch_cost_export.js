const batch_cost_export_form_BtnClick = async (evt_id, btn, form) => { 
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
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], batch_cost_export_form_BtnClick, '货代费用')

const batch_cost_export_FormShow = (evt_id, form) => {
    let btns = form.toolbar.btns?.[20]?.[0]?.btns
    if (!form.is_editor) {
        btns.push({
            "name": "batch_cost_export_btn",
            "caption": "批量费用导出",
            "icon": "any-keyborad",
        })
    }
    if (btns?.length == 0) {
        return;
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], batch_cost_export_FormShow, '货代费用')