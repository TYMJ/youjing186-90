const payment_merge_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'payment_apply_btn',
            "caption": '批量提交银行',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'payment_return_btn',
            "caption": '批量提交退回',
            "icon": 'any-keyborad',
        })
    }
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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], payment_merge_FormShow, '付款合成')


const payment_merge_BtnClick = async (evt_id, btn, form) => {
    if (btn.name == 'payment_return_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('付款合成记录不能为空');
            return
        }
        _.ui.confirm('确定要做退回吗？').then(() => {
            _.http.post('/api/saier/payment_merge/return', {
                rids: rids
            }).then(res => {
                _.ui.message.success('操作成功');
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
    if (btn.name == 'payment_apply_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('付款合成记录不能为空');
            return
        }
        _.http.post('/api/saier/payment_merge/apply', {
            rids: rids
        }).then(r => {
            _.ui.message.success('操作成功');
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], payment_merge_BtnClick, '付款合成')