// 编辑界面数据加载以后执行
const inquiry_recordLoad = (evt_id, recordset) => {
    // recordset.module.group_by_name('询价采购2').visible = false;
    _.http.post('/api/saier/inquiry/load/check', {
        yhm: recordset.val('业务人员'),
        bm: recordset.val('外销部门'),
        rid: recordset.val('rid'),
        // fssb: recordset.val('发送识别'),
        bmjl: recordset.val('部门经理'),
        sybzj: recordset.val('事业部总监'),
        xjcg_data: recordset.tables['询价采购'].view_data
    }).then(res => {
        let module = recordset.module.name;
        recordset.module.group_by_name('询价采购').visible = false;
        recordset.module.group_by_name('产品资料').disabled = (recordset.val('业务人员') != _.user.username);
        recordset.tables['产品资料']._.toolbar.show('delete', recordset.val('业务人员') == _.user.username);
        recordset.tables['产品资料']._.toolbar.show('new', recordset.val('业务人员') == _.user.username);
        recordset.tables['产品资料']._.toolbar.show('copy', recordset.val('业务人员') == _.user.username);
        recordset.tables['产品资料']._.toolbar.show('insert-data', recordset.val('业务人员') == _.user.username);
        // recordset.module.field_by_full_name(module + '.询价采购.报价人员').disabled = false;
        // let rids = recordset.tables['询价采购'].new_rids;
        // if (rids.indexOf(recordset.val('询价采购.rid')) == -1) {
        //     recordset.module.field_by_full_name(module + '.询价采购.报价人员').disabled = true;
        // }
        if (res.code == 1) {
            let data = res.data
            if (recordset.val('询盘单号') == '') {
                recordset.module.group_by_name('询价采购').visible = true;
            }
            // 部门经理、事业部总监、侯柳红、周玲燕可见客户编号字段
            if (data.xjcg_visible == true) {
                recordset.module.group_by_name('询价采购').visible = true;
            }
            // else {
            // }
            if (recordset.val('业务人员') == "" || recordset.val('外销部门') == "") {
                recordset.val('业务人员', _.user.username);
                recordset.val('外销部门', data.data_bm);
                recordset.val('部门经理', data.data_bmjl);
                recordset.val('事业部总监', data.data_sybzj);
            } else {
                // let oTable = recordset.tables['询价采购2'];
                // if (data.new_data.length > 0) {
                //     oTable.data = data.new_data
                //     oTable.sync_operate_data()
                // }
                // console.log(data)
                // if (data.i1 >= 2) {
                //     recordset.module.field_by_full_name('询价采购2.报价人员').disabled = true;
                // }

                if (recordset.val('业务人员') != _.user.username) {
                    recordset.module.field_by_full_name('询价日期').disabled = true;
                    recordset.module.field_by_full_name('客户类型').disabled = true;
                    recordset.module.field_by_full_name('客户编号').disabled = true;
                    recordset.module.field_by_full_name('截止日期').disabled = true;
                    recordset.module.field_by_full_name('适合市场').disabled = true;
                    recordset.module.field_by_full_name('报价备注').disabled = true;
                    recordset.module.field_by_full_name('询价类别').disabled = true;
                }
                if ((recordset.val('业务人员') != _.user.username) && (recordset.val('部门经理') != _.user.username) && (recordset.val('事业部总监') != _.user.username) && ('侯柳红' != _.user.username) && ('周玲燕' != _.user.username)) {
                    recordset.module.field_by_full_name('客户编号').hide();
                } else {
                    recordset.module.field_by_full_name('客户编号').show();
                }

                recordset.module.field_by_full_name('产品资料.产品图片').disabled = (recordset.val('业务人员') != _.user.username);
                recordset.module.field_by_full_name('产品资料.产品图片1').disabled = (recordset.val('业务人员') != _.user.username);
                recordset.module.field_by_full_name('产品资料.产品图片2').disabled = (recordset.val('业务人员') != _.user.username);
                recordset.module.field_by_full_name('产品资料.产品图片3').disabled = (recordset.val('业务人员') != _.user.username);

                recordset.module.field_by_full_name('产品资料.中文品名').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.英文品名').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.产品规格').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.内盒装箱量').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.内盒/外箱').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.外箱装箱量').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.中文包装').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.测试种类').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.材质中文').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.产品大类').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.一级分类').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.二级分类').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.分类名称').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.产品来源').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.目标价格').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.预计数量').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.难度指数').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.备注').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.网页链接').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
                recordset.module.field_by_full_name('产品资料.询价属性').disabled = ((data.i > 0 && recordset.val('询盘单号') != '') || (recordset.val('业务人员') != _.user.username));
            }
        } else {
            _.ui.message.error(res.msg)
        }
        recordset.refresh_ui();
        // }, 200);
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], inquiry_recordLoad, '业务询价')


// 查询界面或编辑界面打开事件
const inquiry_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        // btns.push({
        //     "name": 'record_trance_zs_btn',
        //     "caption": '专业转专属',
        //     "icon": 'any-function',
        //     "divided": true
        // });
    } else {
        let recordset = form.recordset;
        // recordset.module.group_by_name('询价采购').visible = false;
        // recordset.module.group_by_name('询价采购2').visible = false;
        btns.push({
            "name": 'select_purchase_btn',
            "caption": '选择采购',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'cancel_inquiry_btn',
            "caption": '取消询价',
            "icon": 'any-server-update',
            "divided": true
        })
    }
    if (btns.length == 0) {
        return;
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], inquiry_Form_Show, '业务询价')


const inquiry_form_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'select_purchase_btn') {
        let recordset = form.recordset;
        if (recordset.val('询价日期') == '' || recordset.val('询价日期') == null) {
            _.ui.message.error('请先填写询价日期！');
            return;
        }
        if (recordset.val('截止日期') == '' || recordset.val('截止日期') == null) {
            _.ui.message.error('请先填写截止日期！');
            return;
        }
        if (recordset.val('客户类型') == '') {
            _.ui.message.error('请先填写客户类型！');
            return;
        }
        if (recordset.val('适合市场') == '') {
            _.ui.message.error('请先填写适合市场！');
            return;
        }
        if (recordset.val('业务人员') != _.user.username) {
            _.ui.message.error('只有业务人员本人才能选择采购！');
            return;
        }
        if (recordset.val('询盘单号') == '') {
            _.ui.message.error('请先保存单据，再选择采购！');
            return;
        }
        let t = recordset.tables['产品资料'];
        let d = t.view_data;
        let i = 0
        let rids = []
        for (let r of d) {
            i += 1
            let flag = false;
            if (r.xjhh == undefined || r.xjhh == '') {
                r.xjhh = 'xj' + String(i) + _.user.username + new Date().format('yyyyMMddhhmmss');
                flag = true;
            }
            if (r.xj_dh == undefined || r.xj_dh == '') {
                r.xj_dh = recordset.val('询盘单号');
                flag = true;
            }
            if (r.cply1 == undefined || r.cply1 == '') {
                r.cply1 = new Date().format('yyyy') + '询价';
                flag = true;
            }
            if (flag) {
                t.push_modi_rid(r.rid);
                rids.push(r.rid);
            }
        }
        if (rids.length > 0) {
            recordset.module.group_by_name('询价采购').visible = true;
            t.sync_operate_data();
            t.modified = true;
        }
    }
    if (btn.name == 'cancel_inquiry_btn') {
        let recordset = form.recordset;
        if (recordset.val('业务人员') != _.user.username) {
            _.ui.message.error('只有业务人员本人才能取消发布！');
            return;
        }
        if (recordset.val('询盘单号') == '') {
            _.ui.message.error('请先保存单据再取消发布！');
            return;
        }
        _.http.post('/api/saier/inquiry/cancel/check', {
            xj_dh: recordset.val('询盘单号'),
            rid: recordset.val('rid'),
            ywry: recordset.val('业务人员'),
            module: form.module.name
        }).then(res => {
            _.platform.active.reload_data()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'purchase_quotation_btn') {
        let recordset = form.recordset;
        let l = recordset.tables['询价采购'];
        let flag = false;
        let xjcgrid = ''
        for (let r of l.view_data) {
            if (r.bjry == _.user.username) {
                flag = true;
                xjcgrid = r.rid
                break;
            }
        }
        if (xjcgrid == '' || xjcgrid == undefined || xjcgrid == null) {
            _.ui.message.error('只有报价人员才能操作采购接单！');
            return;
        }
        let t = recordset.tables['产品资料'];
        if (t.view_data.length == 0) {
            _.ui.message.error(' 产品资料为空,操作失败')
            return
        }
        let lines = t.operator.get_checked_records()
        if (lines.length == 0) {
            if (!form.recordset.tables['产品资料'].current_data) {
                _.ui.message.error('请选中需要操作的记录')
                return
            }
            if (t.view_data.length > 1) {
                _.ui.message.error('请选中需要操作的记录')
                return
            } else {
                lines.push(form.recordset.tables['产品资料'].current_data)
            }
        }
        _.http.post('/api/saier/inquiry/purchase/quotation', {
            xj_dh: recordset.val('询盘单号'),
            rid: recordset.val('rid'),
            jzrq: recordset.val('截止日期'),
            ywry: recordset.val('业务人员'),
            module: form.module.name,
            xjcgrid: xjcgrid,
            lines: lines
        }).then(res => {
            if (res.code == 1) {
                _.ui.message.success(res.msg)
            } else {
                _.ui.message.error(res.msg)
            }
            _.platform.open_record('采购报价', res.data)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (btn.name == 'purchase_empty_btn') {
        let recordset = form.recordset;
        recordset.tables['询价采购'].clear();
    }
    if (btn.name == 'items_empty_btn') {
        let recordset = form.recordset;
        recordset.tables['产品资料'].clear();
    }
    if (btn.name == 'import_photo_btn') {
        _.ui.show_dialog('photo_from_excel', {
            "rid": form.current_rid,
            "group": '业务询价.产品资料',
            "option": 'append',
            "kfield": 'xjhh',
            "pfield": 'yytp'
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], inquiry_form_BtnClick, '业务询价')


// 编辑界面记录保存前执行
const inquiry_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        // if (recordset.val('询盘单号') != '' && recordset.val('业务人员') != _.user.username && recordset.val('询价采购增加') != '是') {
        //     _.ui.message.error('非业务员本人，不能保存，请直接关闭，谢谢');
        //     reject()
        //     return;
        // }
        let x = recordset.tables['产品资料'];
        let y = x.view_data;
        let i = 0
        let rids = []
        for (let r of y) {
            i += 1
            let flag = false;
            if (r.xjhh == undefined || r.xjhh == '') {
                r.xjhh = 'xj' + String(i) + _.user.username + new Date().format('yyyyMMddhhmmss');
                flag = true;
            }
            if (r.xj_dh == undefined || r.xj_dh == '') {
                r.xj_dh = recordset.val('询盘单号');
                flag = true;
            }
            if (r.cply == undefined || r.cply == '') {
                r.cply = new Date().format('yyyy') + '询价';
                flag = true;
            }
            if (flag) {
                x.push_modi_rid(r.rid);
                rids.push(r.rid);
            }
        }
        if (rids.length > 0) {
            x.sync_operate_data();
            x.modified = true;
        }

        _.http.post('/api/saier/inquiry/save/before', {
            yhm: recordset.val('业务人员'),
            jzrq: recordset.val('截止日期'),
            rid: recordset.val('rid'),
            xj_dh: recordset.val('询盘单号'),
            module: recordset.module.name,
            lines: recordset.tables['询价采购'].view_data
        }).then(res => {
            //     if (res.data == 1) {
            //         recordset.val('询盘发布', '是')
            //     }
            // let t = recordset.tables['询价采购'];
            // let d = t.view_data;
            // for (let r of d) {
            //     r.fssb = '是'
            //     r.xj_dh = recordset.val('询盘单号')
            //     r.dateis = recordset.val('询价日期')
            //     r.khlx = recordset.val('客户类型')
            //     r.kh_id = recordset.val('客户编号')
            //     r.jzrq = recordset.val('截止日期')
            //     r.ywry = recordset.val('业务人员')
            //     r.wxbm = recordset.val('外销部门')
            //     t.push_modi_rid(r.rid);
            // }
            // t.sync_operate_data();
            // t.modified = true;
            // recordset.val('询价采购增加', '')

            // let l = recordset.tables['询价采购2'];
            // let v = l.view_data;
            // for (let r of v) {
            //     r.Field16 = '是'
            // }
            // l.sync_operate_data();
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
        // resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, inquiry_before_save, '业务询价')


// 编辑界面记录保存前执行
const inquiry_after_save = (evt_id, recordset) => {
    if (recordset.val('业务人员') != _.user.username) {
        return;
    }
    _.http.post('/api/saier/inquiry/save/after', {
        ywry: recordset.val('业务人员'),
        bmjl: recordset.val('部门经理'),
        xj_dh: recordset.val('询盘单号'),
        jzrq: recordset.val('截止日期'),
        rid: recordset.val('rid'),
        sybzj: recordset.val('事业部总监'),
        wxbm: recordset.val('外销部门'),
        kh_id: recordset.val('客户编号'),
        khlx: recordset.val('客户类型'),
        dateis: recordset.val('询价日期'),
        module: recordset.module.name,
        lines: recordset.tables['询价采购'].view_data
    }).then(res => {
        let d = res.data
        let t = recordset.tables['询价采购'];
        let v = t.view_data;
        if (v.length > 0 && recordset.tables['业务询价'].view_data.xpfb != '是') recordset.tables['业务询价'].view_data.xpfb = '是'
        for (let r of v) {
            r.fssb = '是'
            r.xj_dh = recordset.val('询盘单号')
            r.dateis = recordset.val('询价日期')
            r.khlx = recordset.val('客户类型')
            r.kh_id = recordset.val('客户编号')
            r.jzrq = recordset.val('截止日期')
            r.ywry = recordset.val('业务人员')
            r.wxbm = recordset.val('外销部门')
            t.push_modi_rid(r.rid);
        }
        t.sync_operate_data();
        // if (d && d==1) _.platform.active.reload_data()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, inquiry_after_save, '业务询价')


const inquiry_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let recordset = form.recordset;
        recordset.module.group_by_name('产品资料')._.toolbar.click('batch_select');
        form.toolbar.add([{
            "name": 'purchase_quotation_btn',
            "caption": '采购接单',
            "icon": 'any-server-update',
        }]);
        form.toolbar.add([{
            "name": 'import_photo_btn',
            "caption": '含图Excel导入',
            "icon": 'any-server-update',
        }]);
    }
    if (form.group.value.name == '询价采购') {
        form.toolbar.add([{
            "name": 'purchase_empty_btn',
            "caption": '清空',
            "icon": 'any-server-update',
        }]);
    }
    if (form.group.value.name == '产品资料') {
        form.toolbar.add([{
            "name": 'items_empty_btn',
            "caption": '清空',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], inquiry_EditorChildShow, '业务询价')


// 编辑界面字段change后执行
const inquiry_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let m = module.name
    let row = current_record
    // if (field.full_name == m  + '.产品资料.产品大类') {
    //     let cpfl = recordset.val('产品资料.产品大类');
    //     if (cpfl != '') {
    //         _.http.post('/api/saier/items/cpfl/check', {
    //             cpfl: cpfl
    //         }).then(res => {
    //             let d = res.data
    //             // recordset.val('产品资料.分类名称', cpfl);
    //             // recordset.val('产品资料.产品大类', cpfl);
    //             if ((recordset.val('产品资料.一级分类') != '') && d.yjfl.indexOf(recordset.val('产品资料.一级分类')) == -1) {
    //                 // recordset.val('产品资料.三级分类', '');
    //                 recordset.val('产品资料.二级分类', '');
    //                 recordset.val('产品资料.一级分类', '');
    //             }
    //             if ((recordset.val('产品资料.二级分类') != '') && d.ejfl.indexOf(recordset.val('产品资料.二级分类')) == -1) {
    //                 // recordset.val('产品资料.三级分类', '');
    //                 recordset.val('产品资料.二级分类', '');
    //             }
    //             // if ((recordset.val('产品资料.三级分类') != '') && d.sjfl.indexOf(recordset.val('产品资料.三级分类')) == -1) {
    //             // recordset.val('产品资料.三级分类', '');
    //             // }
    //             // recordset.val('三级类别', '');
    //             // recordset.val('二级子目录', '');
    //             // recordset.val('一级子目录', '');
    //         }).catch(err => {
    //             console.log(err)
    //             _.ui.message.error(err.msg)
    //             recordset.val('产品资料.产品大类', '');
    //             // recordset.val('产品资料.三级分类', '');
    //             recordset.val('产品资料.二级分类', '');
    //             recordset.val('产品资料.一级分类', '');
    //             // recordset.val('三级类别', '');
    //             // recordset.val('二级子目录', '');
    //             // recordset.val('一级子目录', '');
    //         })
    //     }
    // }
    // if (field.full_name == m  + '.产品资料.一级分类') {
    //     let cpfl = recordset.val('产品资料.产品大类');
    //     let yjfl = recordset.val('产品资料.一级分类');
    //     if (cpfl != '' && yjfl != '') {
    //         _.http.post('/api/saier/items/cpfl/check', {
    //             cpfl: cpfl,
    //             yjfl: yjfl,
    //         }).then(res => {
    //             let d = res.data
    //             recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl);
    //             if ((recordset.val('产品资料.二级分类') != '') && d.ejfl.indexOf(recordset.val('产品资料.二级分类')) == -1) {
    //                 // recordset.val('产品资料.三级分类', '');
    //                 recordset.val('产品资料.二级分类', '');
    //             }
    //             // if ((recordset.val('产品资料.三级分类') != '') && d.sjfl.indexOf(recordset.val('产品资料.三级分类')) == -1) {
    //             // recordset.val('产品资料.三级分类', '');
    //             // }
    //         }).catch(err => {
    //             console.log(err)
    //             _.ui.message.error(err.msg)
    //             recordset.val('产品资料.一级分类', '');
    //             // recordset.val('产品资料.三级分类', '');
    //             recordset.val('产品资料.二级分类', '');
    //             // recordset.val('三级类别', '');
    //             // recordset.val('二级子目录', '');
    //         })
    //     }
    // }
    // if (field.full_name == m  + '.产品资料.二级分类') {
    //     let cpfl = recordset.val('产品资料.产品大类');
    //     let yjfl = recordset.val('产品资料.一级分类');
    //     let ejfl = recordset.val('产品资料.二级分类');
    //     if (cpfl != '' && yjfl != '' && ejfl != '') {
    //         _.http.post('/api/saier/items/cpfl/check', {
    //             cpfl: cpfl,
    //             yjfl: yjfl,
    //             ejfl: ejfl
    //         }).then(res => {
    //             let d = res.data
    //             recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
    //             if ((recordset.val('产品资料.二级分类') != '') && d.ejfl.indexOf(recordset.val('产品资料.二级分类')) == -1) {
    //                 // recordset.val('产品资料.三级分类', '');
    //                 recordset.val('产品资料.二级分类', '');
    //             }
    //             // if ((recordset.val('产品资料.三级分类') != '') && d.sjfl.indexOf(recordset.val('产品资料.三级分类')) == -1) {
    //             //     recordset.val('产品资料.三级分类', '');
    //             // }
    //         }).catch(err => {
    //             console.log(err)
    //             _.ui.message.error(err.msg)
    //             recordset.val('产品资料.二级分类', '');
    //         })
    //     }
    // }
    if (field.full_name == m + '.产品资料.产品大类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        if (cpfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl, row);
                recordset.val('产品资料.产品类别', cpfl, row);
                if ((recordset.value('产品资料.一级分类', row) != '') && d.yjfl.indexOf(recordset.value('产品资料.一级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                    recordset.val('产品资料.一级分类', '', row);
                }
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.产品大类', '', row);
                recordset.val('产品资料.三级分类', '', row);
                recordset.val('产品资料.二级分类', '', row);
                recordset.val('产品资料.一级分类', '', row);
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
                // recordset.val('一级子目录', '');
            })
        } else {
            recordset.val('产品资料.分类名称', '', row);
            recordset.val('产品资料.产品类别', '', row);
            recordset.val('产品资料.三级分类', '', row);
            recordset.val('产品资料.二级分类', '', row);
            recordset.val('产品资料.一级分类', '', row);
        }
    }
    if (field.full_name == m + '.产品资料.一级分类') {
        let cpfl = recordset.val('产品资料.产品大类');
        let yjfl = recordset.val('产品资料.一级分类');
        if (cpfl != '' && yjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl);
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.一级分类', '', row);
                recordset.val('产品资料.三级分类', '', row);
                recordset.val('产品资料.二级分类', '', row);
                // recordset.val('三级类别', '');
                // recordset.val('二级子目录', '');
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
            }
            recordset.val('产品资料.分类名称', fl_list.join('\\'));
            recordset.val('产品资料.三级分类', '', row);
            recordset.val('产品资料.二级分类', '', row);
        }
    }
    if (field.full_name == m + '.产品资料.二级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        let ejfl = recordset.value('产品资料.二级分类', row);
        if (cpfl != '' && yjfl != '' && ejfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl);
                if ((recordset.value('产品资料.二级分类', row) != '') && d.ejfl.indexOf(recordset.value('产品资料.二级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                    recordset.val('产品资料.二级分类', '', row);
                }
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.二级分类', '', row);
            })
        } else {
            let fl_list = []
            if (cpfl != '') {
                fl_list.push(cpfl);
                if (yjfl != '') {
                    fl_list.push(yjfl)
                }
            }
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
            recordset.val('产品资料.三级分类', '', row);
        }
    }
    // if (field.full_name == m + '.询价采购2.报价人员') {
    //     let cgry = recordset.val('询价采购2.报价人员');
    //     let xzsb = recordset.val('询价采购2.新增识别');
    //     if (cgry != '' && xzsb != '是') {
    //         _.http.post('/api/saier/inquiry/cgry/change', {
    //             cgry: cgry,
    //             rid: recordset.val('rid'),
    //             lines: recordset.tables['询价采购'].view_data
    //         }).then(res => {
    //             let d = res.data
    //             if (d.index >= 2) {
    //                 recordset.module.field_by_full_name('询价采购2.报价人员').disabled = true;
    //             }
    //             if (d.index < 2 && d.flag == 0 && d.data) {
    //                 let l = recordset.tables['询价采购'];
    //                 let v = l.view_data;
    //                 let r = {}
    //                 r.rid = _.utils.guid()
    //                 r.pid = recordset.val('rid')
    //                 r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
    //                 r.uid = _.user.rid
    //                 r.bjry = cgry
    //                 r.bmjl = d.data.bmjl
    //                 // if (d.data.sybzj == _.user.username) 
    //                 r.sybzj = d.data.sybzj
    //                 // if (d.data.sybdzj == _.user.username) 
    //                 r.sybdzj = d.data.sybdzj
    //                 if (d.data.bmjl == _.user.username) r.zgxz = '是'
    //                 if (d.data.sybzj == _.user.username || d.data.sybdzj == _.user.username) r.zjxz = '是'
    //                 v.push(r)
    //                 l.push_new_rid(r.rid)
    //                 l.sync_operate_data();
    //                 l.modified = true;
    //                 recordset.val('询价采购增加', '是')
    //             }
    //         }).catch(err => {
    //             console.log(err)
    //             _.ui.message.error(err.msg)
    //         })
    //     }
    // }
    if (field.full_name == m + '.产品资料.产品图片') {
        if (recordset.val('保存识别') != '是' && recordset.value('产品资料.询价货号', row) == '') {
            recordset.val('产品资料.询价货号', 'xj' + _.user.username + new Date().format('yyyyMMddhhmmss'), row);
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, inquiry_field_change, '业务询价')


const inquiry_record_copy_after = (evt_id, recordset) => {
    recordset.tables['询价采购'].clear();
}
_.evts.on([_.evtids.RECORD_AFTER_COPY], inquiry_record_copy_after, '业务询价')


// 子表记录scroll事件
const inquiry_record_table_scroll = (evt_id, table, recordset) => {
    let module = recordset.module.name
    let rids = recordset.tables['询价采购'].new_rids
    if (table.group == '询价采购') {
        recordset.module.field_by_full_name(module + '.询价采购.报价人员').disabled = false;
        if (rids.indexOf(recordset.val('询价采购.rid')) == -1) {
            recordset.module.field_by_full_name(module + '.询价采购.报价人员').disabled = true;
        }
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, inquiry_record_table_scroll, '业务询价')