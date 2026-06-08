const factory_claim_report_form_BtnClick = async (evt_id, btn, form) => {
    if (btn.name == 'factory_claim_report_btn') {
        let rid = form.current_rid.value
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (rid != '' && rid != null && rid != undefined) {
                rids.push(rid)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return
        }
        const res = await _.http.post('/api/saier/factory_claim/report', {
            rid: rid,
            rids: rids,
        }).then(res => {
            let d = res.data
            if (d && d != '') {
                _.http.download('/api/tmp/file/get', { file: d }, d)
            }
            _.ui.message.success(res.msg)
        }).catch(err => {   
            _.ui.message.error(err.msg || String(err))
            console.log(err)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], factory_claim_report_form_BtnClick, '工厂索赔')

const factory_claim_report_FormShow = (evt_id, form) => {
    let btns = []
    if (!form.is_editor) {
        btns.push({
            name: 'factory_claim_report_btn',
            caption: '工厂索赔报表',
            icon: 'any-keyborad',
        })
    }
    if (btns.length == 0) {
        return
    }
    form.toolbar.insert(
        [
            {
                name: 'export_btn',
                caption: '扩展',
                icon: '#ext-add_database',
                btns: btns,
            },
        ],
        'close'
    )
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], factory_claim_report_FormShow, '工厂索赔')
