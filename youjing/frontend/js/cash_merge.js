const cash_merge_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'payment_new_btn',
            "caption": '现金付款生成(详细)',
            "icon": 'any-keyborad',
        })
        // btns.push({
        //     "name": 'factory_new_btn',
        //     "caption": '工厂合并',
        //     "icon": 'any-keyborad',
        // })
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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], cash_merge_FormShow, '现金合成')


const cash_merge_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '现金工厂') {
        form.toolbar.add([{
            "name": 'import_excel_btn',
            "caption": '现金更新',
            "icon": 'any-server-update',
        }]);
    }
    if (form.group.value.name == '产品资料') {
        // form.toolbar.add([{
        //     "name": 'refresh_amount_btn',
        //     "caption": '刷新采购总价',
        //     "icon": 'any-server-update',
        // }]);
        let btns = []
        btns.push({
            "name": 'refresh_amount_btn',
            "caption": '刷新采购总价',
            "icon": 'any-server-update',
        });
        btns.push({
            "name": 'factory_new_btn',
            "caption": '工厂合并',
            "icon": 'any-server-update',
        });
        if (btns.length == 0) {
            return
        }
        form.toolbar.add([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": '#ext-add_database',
            "btns": btns
        }]);
    }

}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], cash_merge_EditorChildShow, '现金合成')


const cash_merge_BtnClick = async (evt_id, btn, form) => {
    if (btn.name == 'import_excel_btn') {
        _.ui.show_dialog('photo_from_excel', {
            "rid": form.current_rid,
            "group": '现金合成.现金工厂',
            "option": 'append'
        });
    };

    if (btn.name == 'refresh_amount_btn') {
        // 刷新采购总价的逻辑
        let check = await _.ui.confirm('确定要刷新采购总价吗？').then(() => {
            return true
        }).catch(() => {
            return false
        })
        if (!check) {
            return
        }
        let recordset = form.recordset;
        let t = recordset.tables['产品资料'];
        let lines = t.view_data
        for (let r of lines) {
            if (r.gczj != null && r.gczj != 0) {
                continue
            }
            let chsl = r.chsl
            let gcjg = r.gcjg
            let gczj = round(chsl * gcjg, 3)
            r.gczj = gczj
            t.push_modi_rid(r.rid)
        }
        t.sync_operate_data()
        t.modified = true
        _.ui.message.success('采购总价已刷新');
    }

    if (btn.name == 'payment_new_btn') {
        if (form.recordset.modified == true) {
            _.ui.message.error('请先保存记录再进行此操作');
            return
        }
        _.ui.show_input_select_dialog('请输入付款地区','',['宁波','义乌']).then(val => {
            if (val == null || val == '') {
                _.ui.message.error('付款地区不能为空');
                return
            }
            _.http.post('/api/saier/cash_merge/payment/new', {
                rid: form.current_rid.value,
                area: val
            }).then(res => {
                if (res.code == 1) {
                    _.ui.message.success('操作成功');
                } else {
                    _.ui.message_box({
                        title: '异常提示',
                        message: _.vue.h('pre', {
                            style: 'font-weight:800;line-height:20px'
                        }, res.data.join('\r\n'))
                    })
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
    if (btn.name == 'factory_new_btn') {
        let t = form.recordset.tables['产品资料'];
        let lines = t.view_data
        if (lines.length == 0) {
            _.ui.message.error('产品资料记录为空,操作被取消');
            return
        }
        let check = true
        if (form.recordset.tables['现金工厂'].view_data.length > 0) {
            check = await _.ui.confirm('现金工厂已有记录，再次操作会被清空，确定要合并工厂吗？').then(() => {
                return true
            }).catch(() => {
                return false
            })
        }
        if (!check) {
            return
        }
        _.http.post('/api/saier/cash_merge/factory/new', {
            lines: lines
        }).then(r => {
            let data = r.data.data
            let new_rids = r.data.new_rids
            let x = form.recordset.tables['现金工厂'];
            x.clear()
            x.view_data = data
            x.sync_operate_data()
            x.modified = true
            x.new_rids.push(...new_rids)
            _.ui.message.success('操作成功');
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], cash_merge_BtnClick, '现金合成')



// 编辑界面字段change后执行
const cash_merge_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record.row
    let m = module.name
    if (field.full_name == m + '.现金工厂.合同收回') {
        if (recordset.value('现金工厂.合同收回', row) != '已收回') {
            _.http.post('/api/saier/cash_merge/htsh/change', {}).then(res => {
                let d = res.data
                if (d != null && d != '' && recordset.value('现金工厂.采购总价') > Number(d)) {
                    recordset.val('现金工厂.合同收回', '待收回', row)
                } else {
                    recordset.val('现金工厂.合同收回', '不需要', row)
                }
            }).catch(err => {
                _.ui.message.error('请求失败: ' + (err.msg || err));
                console.error('请求失败: ', err);
            })
        }
    }
    if (field.full_name == m + '.发票号码') {
        _.http.post('/api/saier/cash_merge/fphm/change', {
            fphm: value,
            cwry: recordset.val('财务人员')
        }).then(res => {
            let d = res.data
            let position = d.position
            let data = d.data
            let flag = d.flag
            if (recordset.val('财务人员') != '' && recordset.val('发票号码') != '') {
                if (position.indexOf('义乌') != -1) {
                    recordset.val('财务区域', '义乌');
                    recordset.val('唯一字段', '义乌-' + recordset.val('发票号码'));
                } else {
                    recordset.val('财务区域', '宁波');
                    recordset.val('唯一字段', '宁波-' + recordset.val('发票号码'));
                }
            }
            if (data) {
                if (data.khjc != null && data.khjc != '') {
                    recordset.val('客户名称', data.khjc);
                } else {
                    recordset.val('客户名称', data.khmc);
                }
                if (flag == 1) {
                    if (data.ywbm != null && data.ywbm != '') {
                        recordset.val('业务部门', data.ywbm);
                    }
                    if (data.fphm != null && data.fphm != '') {
                        recordset.val('业务发票', data.fphm)
                    }
                    recordset.val('发票识别', recordset.val('发票号码'));
                    if (data.zgrq != null && data.zgrq != '') {
                        recordset.val('出运日期', data.zgrqj);
                        recordset.val('实际出运', data.sjcy1);
                    } else if (data.chyrq != null && data.chyrq != '') {
                        recordset.val('出运日期', data.chyrq);
                        recordset.val('实际出运', data.sjcy1);
                    }
                } else {
                    if (recordset.val('出运日期') == '' || recordset.val('出运日期') == null) {
                        recordset.val('出运日期', data.zgrqj);
                    }
                    recordset.val('优胜发票', recordset.val('发票号码'));
                }
            }
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
        })
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, cash_merge_field_change, '现金合成')

const cash_merge_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        // recordset.val('唯一字段1', recordset.val('发票号码') + '_' + recordset.val('财务区域'))
        recordset.val('唯一字段1', recordset.val('rid'))
        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, cash_merge_before_save, '现金合成')

// 编辑界面数据加载以后执行
const cash_merge_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    _.http.post('/api/saier/cash_merge/load/check', {}).then(res => {
        let d = res.data
        let flag = d.flag
        let htsh = d.htsh
        if (flag == 0) {
            recordset.module.field_by_full_name(m + '.现金工厂.付款户名').show();
            recordset.module.field_by_full_name(m + '.现金工厂.开户银行').show();
            recordset.module.field_by_full_name(m + '.现金工厂.银行帐号').show();
        } else {
            recordset.module.field_by_full_name(m + '.现金工厂.付款户名').hide();
            recordset.module.field_by_full_name(m + '.现金工厂.开户银行').hide();
            recordset.module.field_by_full_name(m + '.现金工厂.银行帐号').hide();
        }
        if (htsh == '') {
            recordset.module.field_by_full_name[m + '.现金工厂.合同收回'].hide()
        } else {
            recordset.module.field_by_full_name[m + '.现金工厂.合同收回'].show()
        }
        recordset.refresh_ui();
    }).catch(err => {
        _.ui.message.error('请求失败: ' + (err.msg || err));
        console.error('请求失败: ', err);
    })
}
_.evts.on(_.evtids.RECORD_LOADED, cash_merge_recordLoad, '现金合成')