const special_fee_report_form_BtnClick = async (evt_id, btn, form) => {
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

}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], special_fee_report_form_BtnClick, '货代费用')

const special_fee_report_FormShow = (evt_id, form) => {
    let btns = form.toolbar.btns?.[20]?.[0]?.btns
    if (!form.is_editor) {
        btns.push({
            "name": "special_fee_report_btn",
            "caption": "特报费用导出",
            "icon": "any-keyborad",
        })
    }
    if (btns?.length == 0) {
        return;
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], special_fee_report_FormShow, '货代费用')