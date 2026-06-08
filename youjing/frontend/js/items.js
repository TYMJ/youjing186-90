// const module_Form_Search_Show = (evt_id, form) => {
//     form.toolbar.insert([{
//         "name": 'excel_import_btn',
//         "caption": '导入',
//         "icon": '#ext-xlsx',
//         "divided": true
//     }], 'close');
// }
// _.evts.on([_.evtids.MODULE_SEARCH_SHOW], module_Form_Search_Show)


const module_Form_Editor_Show = (evt_id, form) => {
    // let modules = ['潜在工厂']
    // if (modules.indexOf(form.module.name) != -1) {
    //     return
    // }
    form.toolbar.insert([{
        "name": 'module_unlock_btn',
        "caption": '记录解锁',
        "icon": 'any-unlock',
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], module_Form_Editor_Show)


const module_from_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'excel_import_btn') {
        _.ui.show_dialog('image-export-form', {
            "rids": [form.current_rid]
        });
    };
    if (form.is_editor && btn.name == 'module_unlock_btn') {
        _.http.post('/api/saier/module/unlock', {
            rid: form.current_rid.value,
            module: form.module.name
        }).then(res => {
            _.ui.message.success('解锁成功');
            _.platform.active.reload_data();
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], module_from_BtnClick)

// 查询界面或编辑界面打开事件
const items_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        if (form.module.name == '专业产品') {
            btns.push({
                "name": 'record_trance_zs_btn',
                "caption": '专业转专属',
                "icon": 'any-function',
                "divided": true
            });
            btns.push({
                "name": 'update_name_btn',
                "caption": '更新报关品名英',
                "icon": 'any-server-update',
                "divided": true
            })
        }
        if (form.module.name == '专属产品') {
            btns.push({
                "name": 'record_trance_zy_btn',
                "caption": '专属转专业',
                "icon": 'any-function',
                "divided": true
            });
            btns.push({
                "name": 'update_purchase_btn',
                "caption": '更改采购人员',
                "icon": 'any-server-update',
                "divided": true
            })
            btns.push({
                "name": 'update_zdml_btn',
                "caption": '批量低毛利',
                "icon": 'any-server-update',
                "divided": true
            })
            btns.push({
                "name": 'update_barcode_btn',
                "caption": '批量引入EAN条码',
                "icon": 'any-server-update',
                "divided": true
            })
            btns.push({
                "name": 'quotation_insert_btn',
                "caption": '当前产品生成报价',
                "icon": 'any-server-update',
                "divided": true
            })
            btns.push({
                "name": 'quotation_export_btn',
                "caption": '选中产品生成报价',
                "icon": 'any-server-update',
                "divided": true
            })
        }
        btns.push({
            "name": 'update_price_btn',
            "caption": '更新原始采购价及点数',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'insert_items_btn',
            "caption": '导入产品',
            "icon": '#ext-xlsx',
            "divided": true
        })
    } else {
        btns.push({
            "name": 'update_cpbh_btn',
            "caption": '更新货号',
            "icon": 'any-server-update',
            "divided": true
        })
        if (form.module.name == '专属产品') {
            btns.push({
                "name": 'update_zycpbh_btn',
                "caption": '更新专业产品编号',
                "icon": 'any-server-update',
                "divided": true
            })
            btns.push({
                "name": 'apply_gckm_btn',
                "caption": '开模申请',
                "icon": 'any-server-update',
                "divided": true
            })
        }
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], items_Form_Show, '专业产品')
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], items_Form_Show, '专属产品')

// 查询界面或编辑界面、子表上按钮点击事件
const items_form_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'update_cpbh_btn') {
        _.ui.show_input_dialog('请输入新的产品编号', '').then(val => {
            // if (form.is_editor && form.recordset.modified) {
            //     _.ui.message.error('请先保存记录再操作')
            //     return
            // }
            if (val == '' || val == null || val == undefined) {
                _.ui.message.error('产品编号不能为空')
                return
            }
            _.http.post('/api/saier/items/update/cpbh', {
                rid: form.current_rid.value,
                module: form.module.name,
                // cpbh: form.recordset.val('产品编号'),
                cpbh_new: val
            }).then(res => {
                form.recordset.val('产品编号', val);
                form.recordset.val('条 形 码', '');
                // if (form.is_editor) {
                //     _.platform.active.reload_data();
                // } else {
                //     _.platform.active.load_data();
                // }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    }

    if (btn.name == 'update_zycpbh_btn') {
        form.recordset.val('专业产品编号', form.recordset.val('产品编号'))
    }

    if (btn.name == 'record_trance_zs_btn') {
        if (form.is_editor && form.recordset.modified) {
            _.ui.message.error('请先保存记录再操作')
            return
        }
        _.ui.show_dialog('items_trans_form', {
            "module": form.module.name,
            "rids": [form.current_rid.value]
        });
        // _.http.post('/api/saier/items/update/cpbh', {
        //     rid: form.current_rid.value,
        //     module: form.module.name,
        //     cpbh: val
        // }).then(res => {
        //     form.recordset.val('产品编号', val);
        // }).catch(res => {
        //     _.ui.message.error(res.msg);
        //     console.log(res);
        // });
    }

    if (btn.name == 'record_trance_zy_btn') {
        _.http.post('/api/saier/items/trans/zycp/check', {
            module: form.module.name,
            rid: form.current_rid.value
        }).then(res => {
            if (res.code == 0) {
                _.ui.show_input_dialog('请输入业务人员', _.user.username).then(val => {
                    if (val == '' || val == null || val == undefined) {
                        _.ui.message.error('业务人员不能为空')
                        return
                    }
                    _.http.post('/api/saier/items/trans/zycp', {
                        module: form.module.name,
                        rid: form.current_rid.value,
                        retain: false,
                        ywry: val
                    }).then(res => {
                        _.ui.message.success('转换成功');
                        _.platform.active.load_data();
                    }).catch(res => {
                        _.ui.message.error(res.msg);
                        console.log(res);
                    })
                })
            } else {
                _.http.post('/api/saier/items/trans/zycp', {
                    module: form.module.name,
                    rid: form.current_rid.value,
                    retain: false,
                    ywry: res.data
                }).then(res => {
                    _.ui.message.success('转换成功');
                    _.platform.active.load_data();
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                })
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_name_btn') {
        _.http.post('/api/saier/module/user/check', {
            position: "外销"
        }).then(res => {
            _.ui.show_dialog('update_from_excel', {
                "rid": form.current_rid.value,
                "module": form.module.name,
                "kind": "更新报关品名英",
                "params": []
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_barcode_btn') {
        _.http.post('/api/saier/module/user/check', {
            position: "外销"
        }).then(res => {
            _.ui.show_dialog('update_from_excel', {
                "rid": form.current_rid.value,
                "module": form.module.name,
                "kind": "批量引入EAN条码",
                "params": []
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_price_btn') {
        _.ui.show_dialog('update_from_excel', {
            "rid": form.current_rid.value,
            "module": form.module.name,
            "kind": "更新原始采购价及点数",
            "params": []
        });
    }

    if (btn.name == 'insert_items_btn') {
        _.http.post('/api/saier/module/user/group/check', {
            group: "专业产品引入"
        }).then(res => {
            _.ui.show_dialog('insert_from_excel', {
                "rid": form.current_rid.value,
                "module": form.module.name,
                "params": []
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_purchase_btn') {
        _.http.post('/api/saier/module/user/group/check', {
            group: "专业专属更改采购人员"
        }).then(res => {
            _.ui.show_dialog('items_purchase_form', {
                "rid": form.current_rid.value,
                "module": form.module.name,
                "params": []
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_supplier_qty_btn') {
        _.http.post('/api/saier/items/supplier/update/qty', {
            cpbh: form.recordset.val('产品编号'),
            lines: form.recordset.tables['工厂报价'].view_data
        }).then(res => {
            let t = form.recordset.tables['工厂报价']
            let d = t.view_data;
            let data = res.data;
            let i = 0;
            for (let r of d) {
                r.chsl = data[i].chsl;
                t.push_modi_rid(r.rid)
                i += 1;
            }
            t.sync_operate_data()
            t.modified = true;
            _.ui.message.success('更新成功')
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'update_zdml_btn') {
        _.http.post('/api/saier/module/user/group/check', {
            group: "特殊毛利率"
        }).then(res => {
            _.ui.show_dialog('update_from_excel', {
                "rid": form.current_rid.value,
                "module": form.module.name,
                "kind": "批量低毛利",
                "params": []
            });
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'apply_gckm_btn') {
        if (form.is_editor && form.recordset.modified == true) {
            _.ui.message.error('请先保存数据')
            return
        }
        _.http.post('/api/saier/items/gckm/insert',
            form.recordset.tables['专属产品'].view_data
        ).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg)
            }
            _.platform.open_record('工厂开模', res.data);
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'quotation_insert_btn') {
        _.http.post('/api/saier/items/quotation/get').then(res => {
            _.ui.show_input_select_dialog('请选择或输入报价单号:', '', res.data).then(val => {
                if (val == '' || val == null || val == undefined) {
                    _.ui.message.error('报价单号不能为空');
                    return
                }
                // let rids = []
                // for (let r of form.data.value) {
                //     rids.push(r.zscp_rid)
                // }
                let rids = form.current_rids.value
                if (rids.length == 0) {
                    if (form.current_rid.value && form.current_rid.value != '') {
                        rids = [form.current_rid.value]
                    }
                }
                if (rids.length == 0) {
                    _.ui.message.error('专属产品记录不能为空');
                    return
                }
                _.http.post('/api/saier/items/quotation/insert', {
                    rids: rids,
                    bj_id: val
                }).then(r => {
                    console.log(r);
                    _.ui.message.success(r.msg);
                }).catch(r => {
                    console.log(r);
                    _.ui.message.error(r.msg);
                });
            })
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'quotation_export_btn') {
        // let rids = []
        // for (let r of form.data.value) {
        //     rids.push(r.zscp_rid)
        // }
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('专属产品记录不能为空');
            return
        }

        let table = form.module.table_name
        let index = 1
        let col = form.grid_options.columns
        let columns = {}
        for (let c of col) {
            if (!c.params)
                continue
            if (!c.visible)
                continue
            let field = c.params.field
            if (!field)
                continue
            if (field.table != table)
                continue
            if (field.data_type == 5)
                continue
            index = index + 1
            columns[c.title] = {
                'name': field.field,
                'index': index
            }
        }
        _.http.post('/api/saier/items/quotation/export', {
            rids: rids,
            columns: columns,
            module: form.module.name
        }).then(res => {
            _.http.download("/api/file/get", {
                    file: res.data.path
                },
                res.data.name + '.xlsx'
            );
        }).catch(res => {
            console.log(res);
            _.ui.message.error(res.msg);
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], items_form_BtnClick, '专业产品')
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], items_form_BtnClick, '专属产品')

// 编辑界面记录保存前执行
const items_zy_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if ((recordset.val('是否开模') == '是') && (recordset.val('模具费承担方') == '')) {
            reject('是否开模为是，则模具费承担方为必填');
            return;
        }
        if (recordset.val('开票点数') < 0) {
            _.ui.message.error('开票点数不能小于0,请输入大于或等于0的数字');
            reject();
        }
        let sjfl = recordset.val('三级分类');
        let ejfl = recordset.val('二级分类');
        let yjfl = recordset.val('一级分类');
        let cpfl = recordset.val('产品大类');
        let cpbh = recordset.val('产品编号');
        recordset.val('产品编号', cpbh.trim());
        // if (recordset.val('查询年份') == '') {
        //     recordset.val('查询年份', '2017');
        // }
        if (recordset.val('原始采购价') == 0) {
            recordset.val('原始采购价', recordset.val('采购单价'));
        }
        if (recordset.val('分类名称') == '') {
            if (cpfl != '') {
                recordset.val('分类名称', cpfl);
            }
            if ((cpfl != '') && (yjfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl);
            }
            if ((cpfl != '') && (yjfl != '') && (ejfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
            }
            if ((cpfl != '') && (yjfl != '') && (ejfl != '') && (sjfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl);
            }
        }
        if (recordset.val('报关品名') == '') {
            recordset.val('报关品名', '无');
        }
        let t = recordset.tables['工厂报价']
        let d = t.view_data;
        for (let r of d) {
            let flag = false;
            if (r.xjry != recordset.val('产品编号')) {
                r.xjry = recordset.val('产品编号')
                flag = true;
            }
            if (flag) {
                t.push_modi_rid(r.rid);
            }
        }
        t.sync_operate_data();
        recordset.do_re_sum_by_trigger_table('工厂报价');

        // resolve();
        _.http.post('/api/saier/items/user/check', {
            cpbh: recordset.val('产品编号'),
            wfgs: recordset.val('我方公司'),
            rid: recordset.val('rid')
        }).then(res => {
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, items_zy_before_save, '专业产品')

// 编辑界面记录保存前执行
const items_zs_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let sjfl = recordset.val('三级分类');
        let ejfl = recordset.val('二级分类');
        let yjfl = recordset.val('一级分类');
        let cpfl = recordset.val('产品大类');
        let cpbh = recordset.val('产品编号');
        let krhh = recordset.val('客人货号');
        if (recordset.val('辅料价格') < 0) {
            _.ui.message.error('辅料价格不能小于0,请输入大于或等于0的数字');
            reject();
        }
        // if (recordset.val('查询年份') == '') {
        //     recordset.val('查询年份', '2017');
        // }
        recordset.val('产品编号', cpbh.trim());
        if (recordset.val('原始采购价') == 0) {
            recordset.val('原始采购价', recordset.val('采购单价'));
        }
        if (recordset.val('分类名称') == '') {
            if (cpfl != '') {
                recordset.val('分类名称', cpfl);
            }
            if ((cpfl != '') && (yjfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl);
            }
            if ((cpfl != '') && (yjfl != '') && (ejfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
            }
            if ((cpfl != '') && (yjfl != '') && (ejfl != '') && (sjfl != '')) {

                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl);
            }
        }
        if ((recordset.val('有无产品测试') == '有') && ((recordset.val('测试国家') == '') || (recordset.val('有效期限') == '') || (recordset.val('通过日期') == '') || (recordset.val('测试种类') == ''))) {
            _.ui.message.error('产品测试中测试国家、有效期限、通过日期、测试种类不能为空');
            reject()
            return
        };
        if ((recordset.val('是否开模') == '是') && (recordset.val('模具费承担方') == '')) {
            _.ui.message.error('是否开模为是，则模具费承担方为必填');
            reject()
            return
        }
        if (recordset.val('专业产品货号(判)') == '') recordset.val('专业产品货号(判)', recordset.val('专业产品编号'));
        if (recordset.val('报关品名') == '') recordset.val('报关品名', '无');

        let flag = true;
        let modi = false
        let cpbh1 = recordset.val('产品编号');
        let t = recordset.tables['客人条码资料'];
        let d = t.view_data
        for (let r of d) {
            modi = false
            if (r.cpbh != cpbh1) {
                r.cpbh = cpbh1
                modi = true
            }
            if (r.krID == undefined || r.krID == '') {
                flag = true
                r.krtm = recordset.val('客人条码')
                r.krhh = recordset.val('客人货号')
                r.krhh = recordset.val('IR产品条码')
                r.krhh = recordset.val('lv客人条码')
                r.krhh = recordset.val('RU客人条码')
                r.mtime = new Date().format('yyyy-MM-dd hh:mm:ss')
                r.xgrq = new Date().format('yyyy-MM-dd hh:mm:ss')
                r.modi_uid = _.user.rid
                r.xgry = _.user.username
                modi = true
            }
            if (r.wyzd == undefined || r.wyzd == '') {
                r.wyzd = cpbh1 + ';' + r.krID + ';' + r.krhh;
                modi = true
            }
            if (modi) {
                t.push_modi_rid(r.rid)
            }
        }
        if (flag == false) {
            let r = {}
            r.rid = _.utils.guid()
            r.pid = recordset.val('rid')
            r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
            r.uid = _.user.rid

            r.krtm = recordset.val('客人条码')
            r.krhh = recordset.val('客人货号')
            r.IRcptm = recordset.val('IR产品条码')
            r.lvkrtm = recordset.val('lv客人条码')
            r.RUkrtm = recordset.val('RU客人条码')
            r.wyzd = cpbh1 + ';' + '' + ';' + r.krhh;
            r.cpbh = cpbh1
            r.ly = 'ZS'
            r.xgrq = new Date().format('yyyy-MM-dd hh:mm:ss')
            r.xgry = _.user.username
            d.push(r)
            t.push_new_rid(r.rid)
        }

        if (flag || modi) {
            t.sync_operate_data()
            t.modified = true
        }

        let g = recordset.tables['工厂报价'];
        let l = g.view_data
        for (let r of l) {
            modi = false
            if (r.cpbh != cpbh1) {
                r.cpbh = cpbh1
                modi = true
            }
            if (modi) {
                g.push_modi_rid(r.rid)
            }
        }
        if (modi) {
            g.sync_operate_data()
            g.modified = true
        }

        let dh = 0;
        let xm = [];
        let y = recordset.tables['共享业务'];
        let x = y.view_data
        for (let r of x) {
            modi = false
            if (r.cpyw == r.ywry) {
                modi = true
                r.cpyw = recordset.val('业务人员')
                r.ywry = recordset.val('业务人员')
            } else {
                dh = dh + 1;
                if (xm.indexOf(r.ywry)) xm.push(r.ywry)
            }
            if (r.cpbh != cpbh1) {
                r.cpbh = cpbh1
                modi = true
            };
            if (modi) y.push_modi_rid(r.rid)
        };

        if (x.length == 0) {
            let r = {}
            r.rid = _.utils.guid()
            r.pid = recordset.val('rid')
            r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
            r.uid = _.user.rid
            r.cpbh = cpbh1
            r.ywry = recordset.val('业务人员')
            r.cpyw = recordset.val('业务人员')
            r.gxqx = '完全'
            modi = true
            x.push(r)
            y.push_new_rid(r.rid)
        }
        y.sync_operate_data()
        y.modified = true

        recordset.val('单据品名外文本', recordset.val('单据品名外').substring(1, 254));
        if (dh > 0) {
            recordset.val('底    厚', '有');
            // recordset.val('查询年份', xm.join(';').substring(1, 254));
        } else {
            recordset.val('底    厚', '');
            // recordset.val('查询年份', '');
        }

        let z = recordset.tables['特殊毛利率'];
        let m = z.view_data
        flag = false
        for (let r of m) {
            if (r.cpbh != cpbh1) {
                r.cpbh = cpbh1
                flag = true
                z.push_modi_rid(r.rid)
            };
        }
        if (flag) {
            z.sync_operate_data()
            z.modified = true
        }

        let o = recordset.tables['产品详情'];
        let n = o.view_data
        flag = false
        for (let r of n) {
            if (r.cpbh != cpbh1) {
                r.cpbh = cpbh1
                flag = true
            };
            if (r.krhh != krhh) {
                r.krhh = krhh
                flag = true
            };
            if (flag) o.push_modi_rid(r.rid)
        }
        if (flag) {
            o.sync_operate_data()
            o.modified = true
        }

        let xzgc = {
            cpbh: recordset.val('产品编号'),
            cgdj: recordset.val('新增单价'),
            lshh: recordset.val('厂商货号'),
            sfhs: recordset.val('是否含税1'),
            gcpp: recordset.val('工厂品牌1'),
            zwpm: recordset.val('中文品名'),
            cs_id: recordset.val('新增编号'),
            xzcj: recordset.val('新增厂家'),
            syq: recordset.val('新增采购'),
            kbgpm: recordset.val('报关品名1'),
            kfkp: recordset.val('开票点数1'),
            tsl: recordset.val('退税率1'),
            zzsl: recordset.val('增值税率1'),
            hgbm: recordset.val('海关编码1'),
            rkdd: recordset.val('入库地点1'),
            jsfs: recordset.val('结算方式1'),
            bz: recordset.val('备注1'),
            fljg: recordset.val('辅料价格1'),
            sccj: recordset.val('新增厂家'),
            gcID: recordset.val('新增编号'),
            cshh: recordset.val('厂商货号'),
            bgjldw: recordset.val('报关单位1'),
            ljrk: recordset.val('开票点数1'),
            bgpm: recordset.val('报关品名1'),
            sccj1: recordset.val('新增厂家'),
            cgry: recordset.val('新增采购'),
            pid: recordset.val('rid')
        }
        _.http.post('/api/saier/items/get/zx/data', {
            cpbh: recordset.val('产品编号'),
            rid: recordset.val('rid'),
            job: recordset.job,
            xzgc: xzgc,
            wfgs: recordset.val('我方公司'),
            sbbz: recordset.val('识别标志')
        }).then(res => {
            if (recordset.job == 0) {
                let t = recordset.tables['特殊毛利率']
                let data = res.data.tsml
                for (let r of data) {
                    t.push_new_rid(r.rid)
                }
                if (data.length > 0) {
                    t.data = data
                    t.sync_operate_data()
                    t.modified = true;
                }
            }
            let ywry = res.data.ywry
            if (recordset.val('业务人员') != ywry) {
                let d = recordset.tables['共享业务']
                let x = d.view_data
                for (let i = x.length - 1; i >= 0; i--) {
                    r = x[i]
                    if (ywry == r.ywry) {
                        console.log(r.ywry)
                        d.push_delete_rid(r.rid)
                        x.splice(i, 1)
                    }
                }
                d.sync_operate_data()
                d.modified = true;
            }
            if (recordset.val('识别标志') == '是') {
                if (res.data.test_data.csgj != recordset.val('测试国家') || res.data.test_data.cszl != recordset.val('测试种类') || res.data.test_data.tgrq != recordset.val('通过日期') || res.data.test_data.yxqx != recordset.val('有效期限')) {
                    let csjl = recordset.val('测试记录');
                    if (csjl == '')
                        csjl = '测试国家:' + recordset.val('测试国家') + '测试种类:' + recordset.val('测试种类') + '通过日期:' + recordset.val('通过日期') + '有效期限:' + recordset.val('有效期限') +
                        '业务:' + _.user.name + ';' + new Date().format('yyyy-MM-dd')
                    else csjl = csjl + '\n' + '测试国家:' + recordset.val('测试国家') + '测试种类:' + recordset.val('测试种类') + '通过日期:' + recordset.val('通过日期') + '有效期限:' + recordset.val('有效期限') +
                        '业务:' + _.user.name + ';' + new Date().format('yyyy-MM-dd')
                    recordset.val('测试记录', csjl)
                }
            }
            if (recordset.val('我方公司') == '') recordset.val('我方公司', res.data.wfgs);
            if (recordset.val('专属编号') == '') recordset.val('专属编号', cpbh1 + '=' + res.data.zs_sid);
            if (res.data.dycp == 1) {
                let a = recordset.tables['对应工厂']
                let b = a.view_data
                let check = 0
                for (let l of b) {
                    if (l.gcID == xzgc.gcID || l.sccj == xzgc.sccj) {
                        flag = 1
                        break
                    }
                }
                if (flag) {
                    b.push(xzgc)
                    a.sync_operate_data()
                }
            }
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
        // if (recordset.val('报关品名') == '') {
        //     recordset.val('报关品名', '无');
        // }
        // let t = recordset.tables['工厂报价']
        // let d = t.view_data;
        // for (let r of d) {
        //     if (r.xjry != recordset.val('产品编号')) {
        //         r.xjry = recordset.val('产品编号')
        //         flag = true;
        //     }
        //     if (flag) {
        //         t.push_modi_rid(r.rid);
        //     }
        // }
        // t.sync_operate_data();
        // recordset.do_re_sum_by_trigger_table('工厂报价');

        // resolve();
        // _.http.post('/api/saier/items/user/check', {
        //     cpbh: recordset.val('产品编号'),
        //     wfgs: recordset.val('我方公司'),
        //     rid: recordset.val('rid')
        // }).then(res => {
        //     resolve()
        // }).catch(err => {
        //     console.log(err)
        //     _.ui.message.error(err.msg)
        //     reject()
        // })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, items_zs_before_save, '专属产品')


// 编辑界面记录保存后执行
const items_zy_after_save = (evt_id, recordset) => {
    _.http.post('/api/saier/items/zy/save/after', {
        cpbh: recordset.val('产品编号'),
        cgry: recordset.val('采购人员'),
        sccj: recordset.val('生产厂家'),
        gcID: recordset.val('厂商编号'),
        rid: recordset.val('rid'),
        uid: recordset.val('uid'),
        module: recordset.module.name
    }).then(res => {
        if (res.data && res.data != '') {
            recordset.val('uid', res.data)
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, items_zy_after_save, '专业产品')

// 编辑界面记录保存后执行
const items_zs_after_save = (evt_id, recordset) => {
    _.http.post('/api/saier/items/zs/save/after', {
        rid: recordset.val('rid')
    }).then(res => {

    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, items_zs_after_save, '专属产品')

// 编辑界面字段change后执行
const items_zy_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    if (field.full_name == n + '.产品大类') {
        let cpfl = recordset.val('产品大类');
        if (cpfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl);
                recordset.val('产品类别', cpfl);
                if ((recordset.val('一级分类') != '') && d.yjfl.indexOf(recordset.val('一级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                    recordset.val('一级分类', '');
                }
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品大类', '');
                recordset.val('三级分类', '');
                recordset.val('二级分类', '');
                recordset.val('一级分类', '');
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            })
        } else {
            recordset.val('分类名称', '');
            recordset.val('产品类别', '');
            recordset.val('三级分类', '');
            recordset.val('二级分类', '');
            recordset.val('一级分类', '');
        }
    }
    if (field.full_name == n + '.一级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        if (cpfl != '' && yjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl);
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('一级分类', '');
                recordset.val('三级分类', '');
                recordset.val('二级分类', '');
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl == '') {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
            }
            recordset.val('分类名称', fl_list.join('\\'));
        }
    }
    if (field.full_name == n + '.二级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        let ejfl = recordset.val('二级分类');
        if (cpfl != '' && yjfl != '' && ejfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('二级分类', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                }
            }
            recordset.val('分类名称', fl_list.join('\\'));
            recordset.val('三级分类', '');
        }
    }
    if (field.full_name == n + '.三级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        let ejfl = recordset.val('二级分类');
        let sjfl = recordset.val('三级分类');
        if (cpfl != '' && yjfl != '' && ejfl != '' && sjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl,
                sjfl: sjfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl);
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('三级分类', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                    if (ejfl != '') {
                        fl_list.push(ejfl)
                    }
                }
            }
            recordset.val('分类名称', fl_list.join('\\'));
        }
    }
    if (field.full_name == n + '.产品编号') {
        let cpbh = recordset.val('产品编号');
        // recordset.module.field_by_full_name(n+'.产品编号').disabled = (cpbh!='');
        recordset.module.field_by_full_name(n + '.产品图片').visible = (cpbh == '');
        if (cpbh != '') {
            _.http.post('/api/saier/items/cpbh/check', {
                cpbh: cpbh,
                rid: recordset.val('rid')
            }).then(res => {
                if (res.code == 0) {
                    _.ui.message.error(res.msg)
                    recordset.val('产品编号', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品编号', '');
            })
        }
    }
    if (field.full_name == n + '.采购单价') {
        if (recordset.val('原始采购价') == 0) {
            recordset.val('原始采购价', recordset.val('采购单价'));
        }
    }
    if (field.full_name == n + '.产品克重G' || field.full_name == n + '.外箱容量' || field.full_name == n + '.外箱体积') {
        if ((recordset.val('外箱容量') > 0) && (recordset.val('产品克重G') > 0)) {
            if ((recordset.val('毛    重') == 0) && (recordset.val('外箱体积') > 0)) {
                let xm = '1';
                _.http.post('/api/saier/items/get/size', {
                    xm: xm,
                    sz: recordset.val('外箱体积')
                }).then(function (res) {
                    if (res.data.f && res.data.f == 0) {
                        recordset.val('毛    重', ((recordset.val('外箱装箱量') * recordset.val('克    重') / 1000) + res.data.v))
                    } else {
                        recordset.val('毛    重', (recordset.val('外箱容量') * recordset.val('产品克重G') / 1000 + 1))
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
            if (recordset.val('净    重') == 0) {
                recordset.val('净    重', ((recordset.val('外箱容量') * recordset.val('产品克重G') / 1000)));
            }
        }
    }
    if (field.full_name == n + '.包装长度' || field.full_name == n + '.包装宽度' || field.full_name == n + '.包装高度') {
        let bzcd = recordset.val('包装长度');
        let bzkd = recordset.val('包装宽度');
        let bzgd = recordset.val('包装高度');
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj != 0) {
            recordset.val('外箱体积', round(bztj, 3));
        }
    }
    if (field.full_name == n + '.外箱体积') {
        check_item_Volume(recordset, null, '包装长度', '包装宽度', '包装高度', '外箱体积')
        // if (recordset.val('外箱体积') > 0) {
        //     let bzcd = recordset.val('包装长度');
        //     let bzkd = recordset.val('包装宽度');
        //     let bzgd = recordset.val('包装高度');
        //     let bztj = (bzcd * bzkd * bzgd / 1000000);
        //     if (bztj > 0) {
        //         let bztj1 = bztj * 0.2;
        //         if (bztj <= 0.001) {
        //             recordset.val('外箱体积', 0.001);
        //         } else if (recordset.val('外箱体积') - bztj > bztj1) {
        //             _.ui.message.error('体积误差超20%，由系统计算');
        //             recordset.val('外箱体积', round(bztj, 3));
        //         } else if (bztj - recordset.val('外箱体积') > bztj1) {
        //             _.ui.message.error('体积误差超20%，由系统计算');
        //             recordset.val('外箱体积', round(bztj, 3));
        //         }
        //     }
        // }
    }

    if (field.full_name == n + '.条 形 码') {
        if ((recordset.val('条 形 码') != "")) {
            let xm = '1';
            _.http.post('/api/saier/items/txm/check', {
                rid: recordset.val('rid'),
                txm: recordset.val('条 形 码')
            }).then(function (res) {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('条 形 码', '')
            })
        }
    }
    if (field.full_name == n + '.采购人员') {
        if ((recordset.val('采购人员') != "")) {
            _.http.post('/api/saier/items/cgry/change', {
                rid: recordset.val('rid'),
                cgry: recordset.val('采购人员'),
                cpbh: recordset.val('产品编号')
            }).then(function (res) {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('采购人员', err.data)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, items_zy_field_change, '专业产品')


// 编辑界面字段change后执行
const items_zs_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    if (field.full_name == n + '.产品编号') {
        let cpbh = recordset.val('产品编号');
        if (cpbh != '') {
            let t = recordset.tables['特殊毛利率']
            let d = t.view_data
            let flag = false
            for (let r of d) {
                if (r.cpbh != cpbh) {
                    r.cpbh = cpbh
                    flag = true
                    t.push_modi_rid(r.rid)
                }
            }
            if (flag) {
                t.sync_operate_data()
                t.modified = true
            }
            _.http.post('/api/saier/items/cpbh/check', {
                cpbh: cpbh,
                rid: recordset.val('rid')
            }).then(res => {
                if (res.code == 0) {
                    _.ui.message.error(res.msg)
                    recordset.val('产品编号', '');
                } else {
                    recordset.val('专业产品编号', cpbh)
                }
                recordset.val('条 形 码', '')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品编号', '');
            })
        }
    }

    if (field.full_name == n + '.产品大类') {
        let cpfl = recordset.val('产品大类');
        if (cpfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl);
                recordset.val('产品类别', cpfl);
                if ((recordset.val('一级分类') != '') && d.yjfl.indexOf(recordset.val('一级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                    recordset.val('一级分类', '');
                }
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品大类', '');
                recordset.val('三级分类', '');
                recordset.val('二级分类', '');
                recordset.val('一级分类', '');
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            })
        } else {
            recordset.val('分类名称', '');
            recordset.val('产品类别', '');
            recordset.val('三级分类', '');
            recordset.val('二级分类', '');
            recordset.val('一级分类', '');
        }
    }
    if (field.full_name == n + '.一级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        if (cpfl != '' && yjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl);
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('一级分类', '');
                recordset.val('三级分类', '');
                recordset.val('二级分类', '');
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
            }
            recordset.val('分类名称', fl_list.join('\\'));
            recordset.val('三级分类', '');
            recordset.val('二级分类', '');
        }
    }
    if (field.full_name == n + '.二级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        let ejfl = recordset.val('二级分类');
        if (cpfl != '' && yjfl != '' && ejfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
                if ((recordset.val('二级分类') != '') && d.ejfl.indexOf(recordset.val('二级分类')) == -1) {
                    recordset.val('三级分类', '');
                    recordset.val('二级分类', '');
                }
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('二级分类', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                }
            }
            recordset.val('分类名称', fl_list.join('\\'));
            recordset.val('三级分类', '');
        }
    }
    if (field.full_name == n + '.三级分类') {
        let cpfl = recordset.val('产品大类');
        let yjfl = recordset.val('一级分类');
        let ejfl = recordset.val('二级分类');
        let sjfl = recordset.val('三级分类');
        if (cpfl != '' && yjfl != '' && ejfl != '' && sjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl,
                sjfl: sjfl
            }).then(res => {
                let d = res.data
                recordset.val('分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl);
                if ((recordset.val('三级分类') != '') && d.sjfl.indexOf(recordset.val('三级分类')) == -1) {
                    recordset.val('三级分类', '');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('三级分类', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                    if (ejfl != '') fl_list.push(ejfl);
                }
            }
            recordset.val('分类名称', fl_list.join('\\'));
        }
    }
    if (field.full_name == n + '.包装长度' || field.full_name == n + '.包装宽度' || field.full_name == n + '.包装高度') {
        let bzcd = recordset.val('包装长度');
        let bzkd = recordset.val('包装宽度');
        let bzgd = recordset.val('包装高度');
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj != 0) {
            recordset.val('外箱体积', round(bztj, 3));
        }
    }

    if (field.full_name == n + '.条 形 码') {
        if ((recordset.val('条 形 码') != "")) {
            let xm = '1';
            _.http.post('/api/saier/items/txm/check', {
                rid: recordset.val('rid'),
                txm: recordset.val('条 形 码')
            }).then(function (res) {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('条 形 码', '')
            })
        }
    }

    if (field.full_name == n + '.采购人员') {
        if ((recordset.val('采购人员') != "")) {
            _.http.post('/api/saier/items/cgry/change', {
                rid: recordset.val('rid'),
                cgry: recordset.val('采购人员'),
                cpbh: recordset.val('产品编号')
            }).then(function (res) {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('采购人员', err.data)
            })
        }
    }

    if (field.full_name == n + '.业务人员') {
        if ((recordset.val('业务人员') != "")) {
            _.http.post('/api/saier/items/ywry/change', {
                rid: recordset.val('rid'),
                ywry: recordset.val('业务人员'),
                cpbh: recordset.val('产品编号')
            }).then(function (res) {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('业务人员', err.data)
            })
        }
    }

    if (field.full_name == n + '.采购单价') {
        if (recordset.val('原始采购价') == 0) {
            recordset.val('原始采购价', recordset.val('采购单价'));
        }
    }

    if (field.full_name == n + '.外箱体积') {
        check_item_Volume(recordset, '包装长度', '包装宽度', '包装高度', '外箱体积')
        // if (recordset.val('外箱体积') > 0) {
        //     let bzcd = recordset.val('包装长度');
        //     let bzkd = recordset.val('包装宽度');
        //     let bzgd = recordset.val('包装高度');
        //     let bztj = (bzcd * bzkd * bzgd / 1000000);
        //     if (bztj > 0) {
        //         let bztj1 = bztj * 0.2;
        //         if (bztj <= 0.001) {
        //             recordset.val('外箱体积', 0.001);
        //         } else if (recordset.val('外箱体积') - bztj > bztj1) {
        //             _.ui.message.error('体积误差超20%，由系统计算');
        //             recordset.val('外箱体积', round(bztj, 3));
        //         } else if (bztj - recordset.val('外箱体积') > bztj1) {
        //             _.ui.message.error('体积误差超20%，由系统计算');
        //             recordset.val('外箱体积', round(bztj, 3));
        //         }
        //     }
        // }
    }

    if (field.full_name == n + '.退 税 率') {
        if ((recordset.val('退 税 率') == 17)) {
            recordset.val('退 税 率', 13)
        }
    }
    if (field.full_name == n + '.美金 FOB') {
        recordset.val('赔款美金', recordset.val('美金 FOB'))
    }
    if (field.full_name == n + '.客户RMB单价') {
        recordset.val('赔款RMB', recordset.val('客户RMB单价'))
    }
    let fields = ['专属产品.国家简称', '专属产品.测试国家', '专属产品.通过日期', '专属产品.有效期限']
    if (fields.indexOf(field.full_name) != -1) {
        recordset.val('识别标志', '是')
    }
    if (field.full_name == n + '.测试国家') {
        recordset.module.field_by_full_name('专属产品.国家简称').disabled = ((recordset.val('测试国家') != '其他'))
    }

    if (field.full_name == n + '.产品克重G' || field.full_name == n + '.外箱容量' || field.full_name == n + '.外箱体积') {
        if ((recordset.val('外箱容量') > 0) && (recordset.val('产品克重G') > 0)) {
            if ((recordset.val('毛    重') == 0) && (recordset.val('外箱体积') > 0)) {
                let xm = '1';
                _.http.post('/api/saier/items/get/size', {
                    xm: xm,
                    sz: recordset.val('外箱体积')
                }).then(function (res) {
                    if (res.data.f && res.data.f == 0) {
                        recordset.val('毛    重', ((recordset.val('外箱装箱量') * recordset.val('克    重') / 1000) + res.data.v))
                    } else {
                        recordset.val('毛    重', (recordset.val('外箱容量') * recordset.val('产品克重G') / 1000 + 1))
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
            if (recordset.val('净    重') == 0) {
                recordset.val('净    重', ((recordset.val('外箱容量') * recordset.val('产品克重G') / 1000)));
            }
        }
    }

    if (field.full_name == n + '.有无产品测试') {
        if (recordset.val('有无产品测试') != '无') {
            recordset.module.group_by_name('产品测试').show()
        } else {
            recordset.module.group_by_name('产品测试').hide()
        }
    }

    if (field.full_name == n + '.客人货号') {
        if (recordset.val('客人货号') != '' && recordset.val('客人货号') != '无') {
            if (recordset.val('客户货号').length > 240) {
                recordset.val('客户货号', '无')
            } else {
                _.http.post('/api/saier/items/krhh/check', {
                    krhh: recordset.val('客人货号')
                }).then(res => {

                }).catch(function (res) {
                    _.ui.message.error(res.msg)
                    recordset.val('客人货号', '')
                })
            }
        }
    }

    if (field.full_name == n + '.客人条码资料.客人货号') {
        if (recordset.val('客人条码资料.客人货号') != '' && recordset.val('客人条码资料.客人货号') != '无') {
            if (recordset.val('客人条码资料.客人货号').length > 99) {
                recordset.val('客人条码资料.客人货号', '无')
                _.ui.message.error('客人货号过长将变为无')
            }
        }
    }

    if (field.full_name == n + '.客人CODE') {
        if (recordset.val('客人CODE') != '' && recordset.val('客人CODE').length > 6) {
            recordset.val('客人CODE', recordset.val('客人CODE').substring(0, 6))
        }
    }

    if (field.full_name == n + '.特殊毛利率.毛 利 率') {
        let mll = recordset.val('特殊毛利率.毛 利 率')
        if ((recordset.val('特殊毛利率.毛 利 率') > 1 || recordset.val('特殊毛利率.毛 利 率') < -1)) {
            mll = recordset.val('特殊毛利率.毛 利 率') / 100;
        }
        _.http.post('/api/saier/items/mll/change', {
            rid: recordset.val('rid'),
            mll: recordset.val('特殊毛利率.毛 利 率'),
            cpbh: recordset.val('产品编号')
        }).then(function (res) {
            _.ui.message.success(res.msg)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (field.full_name == n + '.对应工厂.采购人员') {
        if (recordset.val('对应工厂.采购人员') != '') {
            _.http.post('/api/saier/items/supplier/change', {
                rid: recordset.val('对应工厂.rid'),
                sccj: recordset.val('对应工厂.生产厂家'),
                cgry: recordset.val('对应工厂.采购人员'),
                gcID: recordset.val('对应工厂.厂商编号'),
                cpbh: recordset.val('产品编号')
            }).then(function (res) {
                _.ui.message.success(res.msg)
                if (recordset.val('对应工厂.生产厂家') == recordset.val('生产厂家')) {
                    recordset.val('对应工厂.厂商编号', recordset.val('厂商编号'))
                    recordset.val('对应工厂.采购人员', recordset.val('采购人员'))
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('对应工厂.采购人员', err.data)
            })
        }
    }

    if (field.full_name.indexOf('对应工厂') != -1) {
        if (field.full_name != n + '.对应工厂.采购人员') {
            _.http.post('/api/saier/items/supplier/update/jsfs', {
                data: recordset.tables['对应工厂'].current_data
            }).then(function (res) {
                _.ui.message.success(res.msg)
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, items_zs_field_change, '专属产品')


// 编辑界面数据加载以后执行
const items_zs_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    // recordset.module.field_by_full_name(n + '.产品图片').disabled = ((recordset.val('产品编号') != ''))
    recordset.module.field_by_full_name(n + '.国家简称').disabled = ((recordset.val('测试国家') == '其他'))
    if (recordset.val('有无产品测试') != '无') {
        recordset.module.group_by_name('产品测试').show()
    } else {
        recordset.module.group_by_name('产品测试').hide()
    }
    // recordset.module.field_by_full_name(n + '.FNSKU编号').show()
    recordset.module.field_by_full_name(n + '.业务人员').disabled = true
    recordset.module.field_by_full_name(n + '.工厂退点').disabled = (recordset.val('采购单价') > 0);
    recordset.module.field_by_full_name(n + '.最低毛利').hide()
    recordset.module.group_by_name('开模信息').hide()
    recordset.module.group_by_name('特殊毛利率').hide()
    recordset.module.group_by_name('客人条码资料').hide()
    recordset.module.group_by_name('开模信息').hide()
    recordset.module.group_by_name('产品详情').hide()
    // recordset.module.group_by_name('共享业务').hide()
    let lines = recordset.tables['共享业务'].view_data
    _.http.post('/api/saier/items/zs/load/check', {
        cpbh: recordset.val('产品编号'),
        wfgs: recordset.val('我方公司'),
        ywry: recordset.val('业务人员'),
    }).then(res => {
        let d = res.data
        let price = d.price
        let dygc = d.dygc
        recordset.module.field_by_full_name(n + '.业务人员').disabled = (d.ywry != 1)
        recordset.module.field_by_full_name(n + '.业务人员').disabled = (d.ywry != 1)
        if (recordset.val('我方公司') == '' || recordset.val('我方公司') == null) {
            recordset.val('我方公司', d.wfgs)
        }
        if (d.gckm == 1) recordset.val('是否开模', '是')
        if (d.tsml == 1) {
            recordset.module.group_by_name('特殊毛利率').show()
            recordset.module.field_by_full_name(n + '.最低毛利').show()
            recordset.module.field_by_full_name(n + '.业务人员').disabled = false
        }
        recordset.module.field_by_full_name(n + '.产品编号').disabled = (d.cpbh == 1)
        if (d.gxyw == 1) {
            recordset.module.group_by_name('共享业务').show()
        }
        if (d.dygc == 1) {
            recordset.module.group_by_name('对应工厂').show()
            recordset.module.group_by_name('新增对应工厂').show()
        } else {
            recordset.module.group_by_name('对应工厂').hide()
            recordset.module.group_by_name('新增对应工厂').hide()
        }
        recordset.module.field_by_full_name(n + '.采购人员').disabled = (d.cgry != 1)

        let zdsb = 0
        let path = d.path
        let cgsb = d.cgsb
        for (let r of lines) {
            if (r.ywry == _.user.username && r.gxqx == '完全') {
                zdsb = 2
                break;
            }
            let sys_path = ''
            if (r.syspath) sys_path = r.syspath
            if ((r.ywry == _.user.username || sys_path.indexOf(path) != -1) && (r.gxqx == '只读')) {
                zdsb = 1
            }
        }
        if (price == 1) {
            recordset.module.field_by_full_name(n + '.客户RMB单价').show();
            recordset.module.field_by_full_name(n + '.美金 FOB').show();
            recordset.module.field_by_full_name(n + '.换汇成本').show();
            recordset.module.field_by_full_name(n + '.赔款RMB').show();
            recordset.module.field_by_full_name(n + '.赔款美金').show();
            recordset.module.field_by_full_name(n + '.出货合计$').show();
            recordset.module.field_by_full_name(n + '.出货合计$').show();
            recordset.module.field_by_full_name('工厂报价.专业厂家id1').hide();
            recordset.module.field_by_full_name('工厂报价.专业厂家1').hide();
            recordset.module.field_by_full_name('工厂报价.采购单价1').hide();
            recordset.module.field_by_full_name('工厂报价.采购总额1').hide();
            recordset.module.field_by_full_name('工厂报价.客户RMB单价').show();
            // recordset.module.field_by_full_name(n + '.查询货样').disabled = false;
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
            recordset.module.field_by_full_name(n + '.条码编号').disabled = false;
            recordset.module.group_by_name('客人条码资料').visible = true;
        }
        if (cgsb == 1 || zdsb == 1) {
            if (cgsb == 1) {
                recordset.module.field_by_full_name(n + '.客户RMB单价').hide();
                recordset.module.field_by_full_name(n + '.美金 FOB').hide();
                recordset.module.field_by_full_name(n + '.换汇成本').hide();
                // recordset.module.field_by_full_name(n + '.赔款RMB').hide();
                // recordset.module.field_by_full_name(n + '.赔款美金').hide();
                recordset.module.field_by_full_name(n + '.出货合计$').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.采购总额1').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.采购单价1').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.专业厂家id').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.专业厂家').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.采购单价').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.采购总额').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.客户RMB单价').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.客户条码').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.客户货号').hide();
                recordset.module.field_by_full_name(n + '.工厂报价.开票点数').hide();
            } else {
                // recordset.module.field_by_full_name(n + '.查询货样').disabled = true;
                recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
                recordset.module.field_by_full_name(n + '.条码编号').disabled = true;
                recordset.module.field_by_full_name(n + '.客户RMB单价').disabled = true;
                recordset.module.field_by_full_name(n + '.美金 FOB').disabled = true;
                recordset.module.field_by_full_name(n + '.换汇成本').disabled = true;
                recordset.module.field_by_full_name(n + '.赔款RMB').disabled = true;
                recordset.module.field_by_full_name(n + '.赔款美金').disabled = true;
                recordset.module.field_by_full_name(n + '.出货合计$').disabled = true;
                recordset.module.field_by_full_name(n + '.工厂报价.专业厂家id1').disabled = true;
                recordset.module.field_by_full_name(n + '.工厂报价.专业厂家1').disabled = true;
                recordset.module.field_by_full_name(n + '.工厂报价.采购单价1').disabled = true;
                recordset.module.field_by_full_name(n + '.工厂报价.采购总额1').disabled = true;
                recordset.module.field_by_full_name(n + '.工厂报价.客户RMB单价').disabled = true;
                recordset.module.group_by_name('对应工厂').visible = false
                recordset.module.group_by_name('新增对应工厂').visible = false
            }
            recordset.module.field_by_full_name(n + '.进仓品名').disabled = true;
            recordset.module.field_by_full_name(n + '.采购人员').disabled = true;
            recordset.module.field_by_full_name(n + '.产品编号').disabled = true;
            recordset.module.field_by_full_name(n + '.产品图片').disabled = true;
            recordset.module.field_by_full_name(n + '.赔款RMB').hide();
            recordset.module.field_by_full_name(n + '.赔款美金').hide();
            // recordset.module.field_by_full_name(n + '.查询货样').disabled = true;
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
            recordset.module.field_by_full_name(n + '.条码编号').disabled = true;
            recordset.module.field_by_full_name(n + '.客户售价').hide();
            recordset.module.field_by_full_name(n + '.客人货号').disabled = true;
            recordset.module.field_by_full_name(n + '.工厂货号').disabled = true;
            recordset.module.field_by_full_name(n + '.报关单位').disabled = true;
            recordset.module.field_by_full_name(n + '.客人条码').disabled = true;
            recordset.module.field_by_full_name(n + '.入库日期').disabled = true;
            recordset.module.field_by_full_name(n + '.规格英语').disabled = true;
            recordset.module.field_by_full_name(n + '.产品规格').disabled = true;
            recordset.module.field_by_full_name(n + '.颜    色').disabled = true;
            recordset.module.field_by_full_name(n + '.颜色英文').disabled = true;
            recordset.module.field_by_full_name(n + '.中文品名').disabled = true;
            recordset.module.field_by_full_name(n + '.转入时间').disabled = true;
            recordset.module.field_by_full_name(n + '.英文品名').disabled = true;
            recordset.module.field_by_full_name(n + '.计量单位').disabled = true;
            recordset.module.field_by_full_name(n + '.中文计量单位').disabled = true;
            recordset.module.field_by_full_name(n + '.外文计量单位').disabled = true;
            recordset.module.field_by_full_name(n + '.采购单价').disabled = true;
            recordset.module.field_by_full_name(n + '.是否含税').disabled = true;
            recordset.module.field_by_full_name(n + '.开票点数').disabled = true;
            recordset.module.field_by_full_name(n + '.报关品名').disabled = true;
            recordset.module.field_by_full_name(n + '.海关编码').disabled = true;
            recordset.module.field_by_full_name(n + '.增值税率').disabled = true;
            recordset.module.field_by_full_name(n + '.退 税 率').disabled = true;
            recordset.module.field_by_full_name(n + '.包装单位').disabled = true;
            recordset.module.field_by_full_name(n + '.内盒容量').disabled = true;
            recordset.module.field_by_full_name(n + '.内盒/外箱').disabled = true;
            recordset.module.field_by_full_name(n + '.外箱容量').disabled = true;
            recordset.module.field_by_full_name(n + '.包装长度').disabled = true;
            recordset.module.field_by_full_name(n + '.包装宽度').disabled = true;
            recordset.module.field_by_full_name(n + '.包装高度').disabled = true;
            recordset.module.field_by_full_name(n + '.外箱体积').disabled = true;
            recordset.module.field_by_full_name(n + '.中文包装').disabled = true;
            recordset.module.field_by_full_name(n + '.英文包装').disabled = true;
            recordset.module.field_by_full_name(n + '.包装要求').disabled = true;
            recordset.module.field_by_full_name(n + '.毛    重').disabled = true;
            recordset.module.field_by_full_name(n + '.净    重').disabled = true;
            recordset.module.field_by_full_name(n + '.产品克重G').disabled = true;
            recordset.module.field_by_full_name(n + '.材质英文').disabled = true;
            recordset.module.field_by_full_name(n + '.材质中文').disabled = true;
            recordset.module.field_by_full_name(n + '.产品类型').disabled = true;
            recordset.module.field_by_full_name(n + '.测试种类').disabled = true;
            recordset.module.field_by_full_name(n + '.产品来源').disabled = true;
            recordset.module.field_by_full_name(n + '.起 订 量').disabled = true;
            recordset.module.field_by_full_name(n + '.厂商编号').disabled = true;
            recordset.module.field_by_full_name(n + '.生产厂家').disabled = true;
            recordset.module.field_by_full_name(n + '.业务人员').disabled = true;
            recordset.module.field_by_full_name(n + '.报价人员').disabled = true;
            recordset.module.field_by_full_name(n + '.设计人员').disabled = true;
            recordset.module.field_by_full_name(n + '.款  式').disabled = true;
            recordset.module.field_by_full_name(n + '.材质英文').disabled = true;
            recordset.module.field_by_full_name(n + '.材质中文').disabled = true;
            recordset.module.field_by_full_name(n + '.产品类型').disabled = true;
            recordset.module.field_by_full_name(n + '.测试种类').disabled = true;
            recordset.module.field_by_full_name(n + '.产品来源').disabled = true;
            recordset.module.field_by_full_name(n + '.起 订 量').disabled = true;
            recordset.module.field_by_full_name(n + '.产品大类').disabled = true;
            recordset.module.field_by_full_name(n + '.一级分类').disabled = true;
            recordset.module.field_by_full_name(n + '.二级分类').disabled = true;
            recordset.module.field_by_full_name(n + '.三级分类').disabled = true;
            recordset.module.field_by_full_name(n + '.外语品名').disabled = true;
            recordset.module.field_by_full_name(n + '.规格外语').disabled = true;
            recordset.module.field_by_full_name(n + '.材质外语').disabled = true;
            recordset.module.field_by_full_name(n + '.颜色外语').disabled = true;
            recordset.module.field_by_full_name(n + '.外语说明').disabled = true;
            recordset.module.field_by_full_name(n + '.跟单人员').disabled = true;
            recordset.module.field_by_full_name(n + '.单据品名').disabled = true;
            recordset.module.field_by_full_name(n + '.单据品名英').disabled = true;
            recordset.module.field_by_full_name(n + '.单据品名外').disabled = true;
            recordset.module.field_by_full_name(n + '.客人CODE').disabled = true;
            recordset.module.field_by_full_name(n + '.客人税率').disabled = true;
            recordset.module.field_by_full_name(n + '.存放区域').disabled = true;
            // recordset.module.field_by_full_name(n + '.查询货样').disabled = true;
            recordset.module.field_by_full_name(n + '.是否开模').disabled = true;
            recordset.module.field_by_full_name(n + '.入库地点').disabled = true;
            recordset.module.field_by_full_name(n + '.专业产品编号').disabled = true;
            // recordset.module.field_by_full_name(n + '.选中报价').disabled = true;
            recordset.module.field_by_full_name(n + '.是否授权').disabled = true;
            recordset.module.field_by_full_name(n + '.特殊标记').disabled = true;
            recordset.module.field_by_full_name(n + '.促销名称').disabled = true;
            recordset.module.field_by_full_name(n + '.客户类别').disabled = true;
            recordset.module.field_by_full_name(n + '.集团货号').disabled = true;
            recordset.module.field_by_full_name(n + '.客人品牌').disabled = true;
            recordset.module.field_by_full_name(n + '.备    注').disabled = true;
            recordset.module.field_by_full_name(n + '.中文尺寸').disabled = true;
            recordset.module.field_by_full_name(n + '.中文说明').disabled = true;
            recordset.module.field_by_full_name(n + '.英文说明').disabled = true;
            recordset.module.field_by_full_name(n + '.适合市场').disabled = true;
            recordset.module.field_by_full_name(n + '.采购员1').disabled = true;
            // recordset.module.field_by_full_name(n + '.图片名1').disabled = true;
            // recordset.module.field_by_full_name(n + '.图片名2').disabled = true;
            // recordset.module.field_by_full_name(n + '.图片名3').disabled = true;
            // recordset.module.field_by_full_name(n + '.图片名4').disabled = true;
            recordset.module.field_by_full_name(n + '.IR产品条码').disabled = true;
            recordset.module.field_by_full_name(n + '.lv客人条码').disabled = true;
            recordset.module.field_by_full_name(n + '.RU客人条码').disabled = true;
            recordset.module.field_by_full_name(n + '.警告标语').disabled = true;
            recordset.module.field_by_full_name(n + '.条码图片').disabled = true;
            recordset.module.field_by_full_name(n + '.成本核算表').disabled = true;
            recordset.module.field_by_full_name(n + '.Washing').disabled = true;
            recordset.module.field_by_full_name(n + '.Bleach').disabled = true;
            recordset.module.field_by_full_name(n + '.Drying').disabled = true;
            recordset.module.field_by_full_name(n + '.Ironing').disabled = true;
            recordset.module.field_by_full_name(n + '.Professional Textile Care').disabled = true;
            recordset.module.field_by_full_name(n + '.测试国家').disabled = true;
            recordset.module.field_by_full_name(n + '.测试种类').disabled = true;
            recordset.module.field_by_full_name(n + '.通过日期').disabled = true;
            recordset.module.field_by_full_name(n + '.有效期限').disabled = true;
            recordset.module.field_by_full_name(n + '.检测项目').disabled = true;
            recordset.module.field_by_full_name(n + '.检测费用').disabled = true;
        }
        recordset.refresh_ui()
    }).catch(res => {
        _.ui.message.error(res.msg)
        console.log(res)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], items_zs_recordLoad, '专属产品')


// 编辑界面数据加载以后执行
const items_zy_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    recordset.module.field_by_full_name(n + '.工厂退点').disabled = (recordset.val('采购单价') > 0);
    recordset.module.field_by_full_name(n + '.产品编号').disabled = (recordset.val('产品编号') != '' && recordset.job == 1);
    // recordset.module.field_by_full_name(n + '.产品图片').disabled = (recordset.val('产品编号') == '');
    recordset.module.field_by_full_name('工厂报价.客户条码').hide();
    recordset.module.field_by_full_name('工厂报价.客户货号').hide();
    recordset.module.field_by_full_name('工厂报价.开票点数').hide();
    // recordset.val('开模信息', '关闭');
    _.http.post('/api/saier/items/zy/load/check').then(res => {
        let d = res.data.check;
        let wfgs = res.data.wfgs;
        if (recordset.val('我方公司') == '' || recordset.val('我方公司') == null) {
            recordset.val('我方公司', wfgs)
        }
        if (d == 1) {
            // recordset.val('时间', new Date().format('yyyy-MM-dd'));
            recordset.module.field_by_full_name(n + '.客户RMB单价').show();
            recordset.module.field_by_full_name(n + '.美金 FOB').show();
            recordset.module.field_by_full_name(n + '.换汇成本').show();
            recordset.module.field_by_full_name(n + '.出货合计$').show();
            recordset.module.field_by_full_name('工厂报价.专业厂家id1').hide();
            recordset.module.field_by_full_name('工厂报价.专业厂家1').hide();
            recordset.module.field_by_full_name('工厂报价.采购单价1').hide();
            recordset.module.field_by_full_name('工厂报价.采购总额1').hide();
            recordset.module.field_by_full_name('工厂报价.客户RMB单价').show();
            // recordset.module.field_by_full_name(n + '.查询货样').disabled = false;
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
            recordset.module.field_by_full_name(n + '.条码编号').disabled = false;
            // recordset.module.group_by_name('客人条码资料').visible = true;
        } else {
            recordset.module.field_by_full_name(n + '.客户RMB单价').hide();
            recordset.module.field_by_full_name(n + '.美金 FOB').hide();
            recordset.module.field_by_full_name(n + '.换汇成本').hide();
            recordset.module.field_by_full_name(n + '.出货合计$').hide();
            recordset.module.field_by_full_name('工厂报价.专业厂家id').hide();
            recordset.module.field_by_full_name('工厂报价.专业厂家').hide();
            recordset.module.field_by_full_name('工厂报价.采购单价').hide();
            recordset.module.field_by_full_name('工厂报价.采购总额').hide();
            recordset.module.field_by_full_name('工厂报价.客户RMB单价').hide();
            // recordset.module.field_by_full_name(n + '.查询货样').disabled = true;
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
            recordset.module.field_by_full_name(n + '.条码编号').disabled = true;
        }
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], items_zy_recordLoad, '专业产品')


// python 端给前端发送消息
_.evts.on(_.evtids.PLATFORM_USER_MESSAGE, (eid, data) => {
    let _data = data.data
    console.log(_data)
    if (_data.kind == '0')
        _.ui.show_process_dialog(_data.msg, true, 100)
    else if (_data.kind == '1')
        _.ui.set_process_dialog_position(_data.progress)
    else if (_data.kind == '2') {
        let recordset = _.platform.active.recordset;
        if (_data.data) {
            console.log(_data.data)
            let group = _data.group
            let g = '产品资料'
            if (group) {
                g = group.split('.')[1]
            }
            let t = recordset.tables[g]
            let lines = t.view_data
            if (_data.option == 'update') {
                for (let r of lines) {
                    let kfield = _data.kfield
                    if (r[kfield] && r[kfield] != '' && r[kfield] in _data.data) {
                        let f = r[kfield]
                        let val = _data.data[f]
                        console.log(val)
                        for (let k in val) {
                            if (kfield == k) {
                                continue
                            }
                            r[k] = val[k]
                        }
                        t.push_modi_rid(r.rid)
                    }
                }
            } else if (_data.option == 'append') {
                for (let r of _data.data) {
                    r.rid = _.utils.guid()
                    r.uid = _.user.rid
                    r.pid = recordset.val('rid')
                    r.ctime = new Date().format('yyyy-MM-dd HH:mm:ss')
                    r.mtime = new Date().format('yyyy-MM-dd HH:mm:ss')
                    t.view_data.push(r)
                    t.push_new_rid(r.rid)
                }
            }
            t.sync_operate_data()
            t.modified = true
        }
        if (_data.err && _data.err != '') {
            _.ui.message.error(_data.err);
        }
        _.ui.set_process_dialog_position(100)
    } else if (_data.kind == '3') {
        // console.error(_data)
        _.ui.message.error(_data.msg);
        _.ui.set_process_dialog_position(100)
    }
})

// 工厂报价添加更新出货数量按钮
const items_zy_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '工厂报价') {
        form.toolbar.add([{
            "name": 'update_supplier_qty_btn',
            "caption": '刷新出货数',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], items_zy_EditorChildShow, '专业产品')


// 共享业务添加按部门填加按钮
// const items_zs_EditorChildShow = (evt_id, form) => {
//     if (form.group.value.name == '对应工厂') {
//         form.toolbar.add([{
//             "name": 'update_supplier_qty_btn',
//             "caption": '按部门填加',
//             "icon": 'any-server-update',
//         }]);
//     }
// }
// _.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], items_zs_EditorChildShow, '专属产品')

function items_tsml_table_new_after(evt_id, table, recordset) {
    if (table.group == '特殊毛利率') {
        recordset.val('特殊毛利率.产品编号', recordset.val('产品编号'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW], items_tsml_table_new_after, '专属产品')

// 获取完整组织架构 _.organizations.get_org_name_path()


function items_record_copy_after(evt_id, recordset) {
    recordset.val('产品编号', '');
    recordset.module.field_by_full_name(recordset.module.name + '.产品编号').disabled = false;
    if (recordset.module.name == '专属产品') {
        recordset.tables['对应工厂'].clear();
        recordset.tables['共享业务'].clear();
        recordset.tables['工厂报价'].clear();
        recordset.tables['特殊毛利率'].clear();
        recordset.tables['客人条码资料'].clear();
    }
}
_.evts.on([_.evtids.RECORD_AFTER_COPY], items_record_copy_after, '专业产品')
_.evts.on([_.evtids.RECORD_AFTER_COPY], items_record_copy_after, '专属产品')