const khjy_tButtonClick = async (evt_id, btn, form) => {
    if (btn.name == 'khjy_trans_btn_us4') {
        if (form.is_search == true) {
            rids = form.current_rid.value;
        }
        if (form.is_editor == true) {
            rids = form.recordset.rid;
        }

        // let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('未选中数据,无法操作');
            return
        }

        _.http.post("/api/khjy/generate_sample_tag_report", {
            rids: rids
        }).then(res => {
            console.log(res)
            _.http.download("/api/tmp/file/get", {
                file: res.data.filename
            },
                'US寄样打印4.xlsx'
            );
        }).catch(res => {
            _.ui.message.error(res);
            console.log(res);
        })
    }
    if (btn.name == 'khjy_trans_btn_uv4') {
        // _.ui.message('UV寄样打印4')
        if (form.is_search == true) {
            rids = form.current_rid.value;
        }
        if (form.is_editor == true) {
            rids = form.recordset.rid;
        }

        // let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('未选中数据,无法操作');
            return
        }

        _.http.post("/api/khjy/generate_sample_tag_report_UV", {
            rids: rids
        }).then(res => {
            console.log(res)
            _.http.download("/api/tmp/file/get", {
                file: res.data.filename
            },
                'UV寄样打印4.xlsx'
            );
        }).catch(res => {
            _.ui.message.error(res);
            console.log(res);
        })
    }
    if (btn.name == 'khjy_trans_btn_8') {
        // _.ui.message('寄样打印8')
        if (form.is_search == true) {
            rids = form.current_rid.value;
        }
        if (form.is_editor == true) {
            rids = form.recordset.rid;
        }

        // let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('未选中数据,无法操作');
            return
        }

        _.http.post("/api/khjy/generate_sample_tag_report_jydy8", {
            rids: rids
        }).then(res => {
            console.log(res)
            _.http.download("/api/tmp/file/get", {
                file: res.data.filename
            },
                '寄样打印8.xlsx'
            );
        }).catch(res => {
            _.ui.message.error(res);
            console.log(res);
        })
    }

    if (btn.name == 'khjy_trans_btn_1') {
        // _.ui.message('寄样打印8')
        if (form.is_search == true) {
            rids = form.current_rid.value;
        }
        if (form.is_editor == true) {
            rids = form.recordset.rid;
        }

        // let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('未选中数据,无法操作');
            return
        }
        _.ui.show_input_dialog('PDF输1,excel输2不输为1', '1').then(value => {
            let pdf = value || '1'; // 默认为1
            if (pdf !== '2') {
                pdf = '1'; // 除了2以外都视为1
            }

            _.ui.show_input_dialog('1优景2优胜不输为优景', '1').then(value => {
                let da2 = value || '1'; // 默认为1
                if (da2 !== '2') {
                    da2 = '1'; // 除了2以外都视为1
                }

                _.http.post("/api/khjy/generate_sample_tag_report_jydy1", {
                    rids: rids,
                    pdf: pdf,
                    da2: da2
                }).then(res => {
                    console.log(res)
                    if (pdf == '1') {
                        _.http.download("/api/tmp/file/get", {
                            file: res.data.pdf_filename
                        },
                            '寄样打印1.pdf'
                        );
                    } else {
                        console.log('222222222222222222')
                        console.log(res.data.filename)
                        _.http.download("/api/tmp/file/get", {
                            file: res.data.filename
                        },
                            '寄样打印1.xlsx'
                        );
                    }
                }).catch(res => {
                    _.ui.message.error(res);
                    console.log(res);
                })
            }).catch(() => {
                // 用户取消输入对话框
                console.log('用户取消导出');
            });
        }).catch(() => {
            // 用户取消输入对话框
            console.log('用户取消导出');
        });
    }
}

_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], khjy_tButtonClick, '客户寄样');

const khjygl_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'khjy_trans_btn_us4',
        "caption": 'US寄样打印4',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'khjy_trans_btn_uv4',
        "caption": 'UV寄样打印4',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'khjy_trans_btn_8',
        "caption": '寄样打印8',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'khjy_trans_btn_1',
        "caption": '寄样打印1',
        "icon": 'any-keyborad',
    })
    if (btns.length == 0) {
        return
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '寄样打印',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');

}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], khjygl_FormShow, '客户寄样')

