const customer_claim_report_form_BtnClick = async (evt_id, btn, form) => {  
    if (btn.name == "customer_claim_report_btn") {
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
        const res = await _.http.post('/api/saier/customer/claim/report', {
            rid: rid,
            rids: rids,
        }).then(res => {
            // if (res.code != 1) {
            //     _.ui.message.error(res.msg)
            //     return;
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
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], customer_claim_report_form_BtnClick, '客户索赔')

const customer_claim_report_FormShow = (evt_id, form) => {
    let btns = form.toolbar.btns?.[20]?.[0]?.btns
    if (!form.is_editor) {
        btns.push({
            "name": "customer_claim_report_btn",
            "caption": "客户索赔报表",
            "icon": "any-keyborad"
        })
    }
}

_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], customer_claim_report_FormShow, '客户索赔')