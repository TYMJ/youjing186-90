// 编辑界面数据加载以后执行
const pur_payment_verify_load = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    let rq = recordset.val('截止日期') + recordset.val('截止时间');
    let rq1 = new Date().format('yyyy-MM-dd HH:mm:ss');

    _.http.post('/api/saier/purchase_payment_verify/load/check',{rid: recordset.val('rid'),
        sccj: recordset.val('生产厂家'),
        data_list: recordset.tables['付款资料'].view_data
    }).then(res => {
        if (res.code == 1){
            let data = res.data
            rq1 = data.date
            if (data.data_list.length > 0){
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                for (let r of d) {
                    for (let key of data.data_list) {
                        if (r.rid == key.rid) {
                            r.cxbg = key.sfsh1;
                            t.push_modi_rid(r.rid)
                        }
                    }
                }
                t.sync_operate_data()
                t.modified = true;
                
            }
            if (data.khsheet3_data.length > 0){
                let new_data = data.khsheet3_data;
                let t = recordset.tables['查看人员清单'];
                if (new_data.length > 0) {
                    for (let row of new_data) {
                        row['rid'] = _.utils.guid()
                        row['pid'] = recordset.val('rid')
                        row['module1'] = '客户资料'
                        row['objectkind1'] = 1
                    }
                }
                if (new_data.length > 0) {
                    t.data = new_data
                    t.sync_operate_data()
                }

            }
        }}).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })


    if (((recordset.val('财务核对') == '是') || (rq < rq1)) && (recordset.val('财务人员') != username)){
        recordset.module.field_by_full_name('批量核对').disabled = true;
        recordset.module.field_by_full_name('财务核对').disabled = true;
        recordset.module.field_by_full_name('批量暂扣').disabled = true;
        recordset.module.field_by_full_name('暂扣原因').disabled = true;
        recordset.module.field_by_full_name('备注').disabled = true;
        recordset.module.field_by_full_name('批量付款日期').disabled = true;
        recordset.module.field_by_full_name('财务核对日期').disabled = true;
        recordset.module.field_by_full_name('业务核对状态').disabled = true;
        recordset.module.field_by_full_name('财务核对状态').disabled = true;
        recordset.module.field_by_full_name('付款资料.付款日期').disabled = true;
        recordset.module.field_by_full_name('付款资料.付款金额').disabled = true;
        recordset.module.field_by_full_name('付款资料.开户银行').disabled = true;
        recordset.module.field_by_full_name('付款资料.银行帐号').disabled = true;
        recordset.module.field_by_full_name('付款资料.合同收回').disabled = true;
        recordset.module.field_by_full_name('付款资料.业务核对').disabled = true;
        recordset.module.field_by_full_name('付款资料.业务不通过原因').disabled = true;
        recordset.module.field_by_full_name('付款资料.备注说明').disabled = true;
        recordset.module.field_by_full_name('付款资料.是否暂扣').disabled = true;
        recordset.module.field_by_full_name('付款资料.暂扣金额').disabled = true;
        recordset.module.field_by_full_name('付款资料.是否结清').disabled = true;
    }else{
        if (recordset.val('财务人员') == username){
            recordset.module.field_by_full_name('批量核对').disabled = true;
            recordset.module.field_by_full_name('业务核对状态').disabled = true;
            recordset.module.field_by_full_name('批量暂扣').disabled = true;
            recordset.module.field_by_full_name('暂扣原因').disabled = true;
            recordset.module.field_by_full_name('备注').disabled = true;
            recordset.module.field_by_full_name('付款资料.业务核对').disabled = false;
            recordset.module.field_by_full_name('付款资料.业务不通过原因').disabled = false;
            recordset.module.field_by_full_name('付款资料.是否暂扣').disabled = true;
            recordset.module.field_by_full_name('付款资料.暂扣金额').disabled = true;
            if (recordset.val('财务核对') != '是'){
                recordset.module.field_by_full_name('批量付款日期').disabled = true;
                recordset.module.field_by_full_name('付款资料.付款日期').disabled = true;
                recordset.module.field_by_full_name('付款资料.付款金额').disabled = true;
                recordset.module.field_by_full_name('付款资料.合同收回').disabled = true;
                recordset.module.field_by_full_name('付款资料.备注说明').disabled = true;
                recordset.module.field_by_full_name('付款资料.是否结清').disabled = true;
            }
        }
        if (recordset.val('经手人名') == username){
            recordset.module.field_by_full_name('财务核对状态').disabled = true;
            recordset.module.field_by_full_name('批量暂扣').disabled = false;
            recordset.module.field_by_full_name('暂扣原因').disabled = false;
            recordset.module.field_by_full_name('财务核对').disabled = true;
            recordset.module.field_by_full_name('批量付款日期').disabled = true;
            recordset.module.field_by_full_name('付款资料.付款日期').disabled = true;
            recordset.module.field_by_full_name('付款资料.付款金额').disabled = true;
            recordset.module.field_by_full_name('付款资料.合同收回').disabled = true;
            recordset.module.field_by_full_name('付款资料.备注说明').disabled = true;
            recordset.module.field_by_full_name('付款资料.是否结清').disabled = true;
            recordset.module.field_by_full_name('付款资料.暂扣金额').disabled = false;
        }
    }
    if ((recordset.val('经手人名') != username) && (recordset.val('财务人员') != username)){
        recordset.module.field_by_full_name('批量核对').disabled = true;
        recordset.module.field_by_full_name('财务核对').disabled = true;
        recordset.module.field_by_full_name('财务核对日期').disabled = true;
        recordset.module.field_by_full_name('业务核对状态').disabled = true;
        recordset.module.field_by_full_name('财务核对状态').disabled = true;
        recordset.module.field_by_full_name('备注').disabled = true;
        recordset.module.field_by_full_name('批量付款日期').disabled = true;
        recordset.module.field_by_full_name('批量暂扣').disabled = true;
        recordset.module.field_by_full_name('暂扣原因').disabled = true;
        recordset.module.field_by_full_name('付款资料.付款日期').disabled = true;
        recordset.module.field_by_full_name('付款资料.付款金额').disabled = true;
        recordset.module.field_by_full_name('付款资料.开户银行').disabled = true;
        recordset.module.field_by_full_name('付款资料.银行帐号').disabled = true;
        recordset.module.field_by_full_name('付款资料.合同收回').disabled = true;
        recordset.module.field_by_full_name('付款资料.业务核对').disabled = true;
        recordset.module.field_by_full_name('付款资料.业务不通过原因').disabled = true;
        recordset.module.field_by_full_name('付款资料.备注说明').disabled = true;
        recordset.module.field_by_full_name('付款资料.是否暂扣').disabled = true;
        recordset.module.field_by_full_name('付款资料.暂扣金额').disabled = true;
        recordset.module.field_by_full_name('付款资料.是否结清').disabled = true;
    }
}
_.evts.on([_.evtids.RECORD_LOAD], pur_payment_verify_load, '采购付款核对')

// // 编辑界面字段change后执行
const pur_payment_verify_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    let username = _.user.username

    if (field.full_name == n + '.批量核对') {

        _.http.post('/api/saier/purchase_payment_verify/plhd/change', {
            data_list: recordset.tables['付款资料'].view_data,
            sccj1:recordset.val('生产厂家'),
            plhd:recordset.val('批量核对')
        }).then(res => {
            if (res.code == 1){
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                for (let r of d) {
                    for (let key of data.data_list) {
                        if (r.rid == key.rid) {
                            r = key
                            t.push_modi_rid(r.rid)
                        }
                    }
                }
                t.sync_operate_data()
                t.modified = true;
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })

    }

    if (field.full_name == n + '.批量付款日期') {

        _.http.post('/api/saier/purchase_payment_verify/plfkrq/change', {
            data_list: recordset.tables['付款资料'].view_data,
            sccj1:recordset.val('生产厂家'),
            plhd:recordset.val('批量核对')
        }).then(res => {
            if (res.code == 1){
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                for (let r of d) {
                    for (let key of data.data_list) {
                        if (r.rid == key.rid) {
                            r = key
                            t.push_modi_rid(r.rid)
                        }
                    }
                }
                t.sync_operate_data()
                t.modified = true;
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })

    }

    if (field.full_name == n + '.财务核对') {
        recordset.val('财务核对日期', new Date().format('yyyy-MM-dd'));
        if (recordset.val('财务核对') != '是'){
            recordset.module.field_by_full_name('批量付款日期').disabled = true;
            recordset.module.field_by_full_name('付款资料.付款日期').disabled = true;
            recordset.module.field_by_full_name('付款资料.付款金额').disabled = true;
            recordset.module.field_by_full_name('付款资料.合同收回').disabled = true;
            recordset.module.field_by_full_name('付款资料.备注说明').disabled = true;
        }
        else{
            recordset.module.field_by_full_name('批量付款日期').disabled = false;
            recordset.module.field_by_full_name('付款资料.付款日期').disabled = false;
            recordset.module.field_by_full_name('付款资料.付款金额').disabled = false;
            recordset.module.field_by_full_name('付款资料.合同收回').disabled = false;
            recordset.module.field_by_full_name('付款资料.备注说明').disabled = false;
        }
    }

    if (field.full_name == n + '.批量暂扣') {
        if (recordset.val('批量暂扣') == '是') {
            _.ui.show_input_dialog('请输入暂扣原因', '').then(val => {
                if (val == '' || val == null || val == undefined) {
                    _.ui.message.error('暂扣原因不能为空')
                    return
                }
                _.http.post('/api/saier/purchase_payment_verify/plzk/change', {
                    data_list: recordset.tables['付款资料'].view_data,
                    yy : val
                }).then(res => {
                    if (res.code != 1){
                        _.ui.message.error(res.msg);
                    }else{
                        let data = res.data
                        let t = recordset.tables['付款资料']
                        let d = t.view_data;
                        for (let r of d) {
                            for (let key of data.data_list) {
                                if (r.rid == key.rid) {
                                    r = key
                                    t.push_modi_rid(r.rid)
                                }
                            }
                        }
                        t.sync_operate_data()
                        t.modified = true;
                    }
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                })
            })
            
        }else{
            let t = recordset.tables['付款资料']
            let d = t.view_data;
            for (let r of d) {
                r.Field = '是'
                if(r.sfzk == '' && r.ywbtgyy == recordset.val('暂扣原因')){
                    r.zkje = 0
                    r.sfzk = '否'
                    r.ywbtgyy = ''
                }
                r.Field = '否'
                t.push_modi_rid(r.rid)

            }
            t.sync_operate_data()
            t.modified = true;
            recordset.val('暂扣原因',)

        }
        recordset.val('核对日期', new Date().format('yyyy-MM-dd'));
    }

    if (field.full_name == n + '.付款资料.付款金额') {

        _.http.post('/api/saier/purchase_payment_verify/fkzl/fkje/change', {
            fkzl: recordset.tables['付款资料'].current_data
        }).then(res => {
            if (res.code == 1){
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                i = 0
                for (let r of d) {
                    if (i == recordset.tables['付款资料'].cursor){
                        r = key
                        t.push_modi_rid(r.rid)
                        break
                    }
                    i++
                }
                t.sync_operate_data()
                t.modified = true;
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })

    }

    if (field.full_name == n + '.付款资料.付款日期') {

        _.http.post('/api/saier/purchase_payment_verify/fkzl/fkrq/change', {
            fkzl: recordset.tables['付款资料'].current_data
        }).then(res => {
            if (res.code == 1){
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                i = 0
                for (let r of d) {
                    if (i == recordset.tables['付款资料'].cursor){
                        r = key
                        t.push_modi_rid(r.rid)
                        break
                    }
                    i++
                }
                t.sync_operate_data()
                t.modified = true;
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })

    }

    if (field.full_name == n + '.付款资料.暂扣金额') {
        if (recordset.val('付款资料.批量识别') != '是'){
            _.http.post('/api/saier/purchase_payment_verify/fkzl/zkje/change', {
                ly: recordset.val('付款资料.来源'),
                sb: recordset.val('付款资料.识别')
            }).then(res => {
                if (res.code == 1){
                    if (res.data.fkje1 != ''){
                        recordset.val('付款资料.付款合计', res.data.fkje1);
                    }

                    if (recordset.val('付款资料.暂扣金额') > 1){
                        recordset.val('付款资料.是否暂扣', '是');
                        if (recordset.val('付款资料.发票金额') > 0){
                            recordset.val('付款资料.付款金额', recordset.val('付款资料.发票金额') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                        }
                        else{
                            recordset.val('付款资料.付款金额', recordset.val('付款资料.应付合计') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                        }
                    }
                    else{
                        recordset.val('付款资料.是否暂扣', '否');
                        if (recordset.val('付款资料.发票金额') > 0){
                            recordset.val('付款资料.付款金额', recordset.val('付款资料.发票金额') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                        }
                        else{
                            recordset.val('付款资料.付款金额', recordset.val('付款资料.应付合计') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                        }
                    }
                    
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }

    }

    if (field.full_name == n + '.付款资料.业务核对') {
        if (recordset.val('付款资料.业务核对') == '通过'){
            _.http.post('/api/saier/purchase_payment_verify/fkzl/zkje/change', {
                ly: recordset.val('付款资料.来源'),
                sb: recordset.val('付款资料.识别')
            }).then(res => {
                if (res.code == 1){
                    if (recordset.val('付款资料.诚信报告') == '待提供'){
                        recordset.val('付款资料.业务核对', '不通过')
                        recordset.val('付款资料.付款金额', 0)
                    }else{
                        if (recordset.val('付款资料.批量识别') != '是'){
                            if (res.data.fkje1 != ''){
                                recordset.val('付款资料.付款合计', res.data.fkje1);
                            }
                            if (recordset.val('付款资料.发票金额') > 0){
                                recordset.val('付款资料.付款金额', recordset.val('付款资料.发票金额') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                            }else{
                                recordset.val('付款资料.付款金额', recordset.val('付款资料.应付合计') - recordset.val('付款资料.暂扣金额') - recordset.val('付款资料.付款合计'));
                            }
                        }
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }else{
            recordset.val('付款资料.付款金额',0)
        }
    }

    if (field.full_name == n + '.付款资料.是否暂扣') {
        if (recordset.val('付款资料.批量识别') != '是'){
            if (recordset.val('付款资料.是否暂扣') == '是'){
                if (recordset.val('付款资料.发票金额') > 0){
                    recordset.val('付款资料.暂扣金额', recordset.val('付款资料.发票金额') - recordset.val('付款资料.付款合计'));
                }else{
                    recordset.val('付款资料.暂扣金额', recordset.val('付款资料.应付合计') - recordset.val('付款资料.付款合计'));
                }
                recordset.val('付款资料.付款金额', 0);
            }
            else{
                recordset.val('付款资料.暂扣金额', 0);
                if (recordset.val('付款资料.业务核对') != '不通过'){
                    recordset.val('付款资料.业务不通过原因', '');
                }
            }
        }
        
    }

    if (field.full_name == n + '.查看人员清单.业务员') {
        if (recordset.val('查看人员清单.业务员') != "") {
            _.http.post('/api/saier/purchase_payment_verify/user/change', {
                rid: recordset.val('rid'),
                line: recordset.tables['查看人员清单'].current_data
            }).then(res => {
                if (res.code == 1){
                    if (res.data.bm != '' && res.data.rybh != ''){
                        recordset.val('查看人员清单.业务部门', res.data.bm)
                        recordset.val('查看人员清单.业务员编号', res.data.rybh)
                    }else{
                        recordset.val('查看人员清单.业务部门', '')
                    }
                    if (res.data.objectnumber1 != ''){
                        recordset.val('查看人员清单.objectnumber1', res.data.objectnumber1)
                        recordset.val('查看人员清单.objectkind1', 1)
                    }
                }
            }).catch(e => {
                _.ui.message.error(e.msg)
                console.log(e)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, pur_payment_verify_field_change, '采购付款核对')

const pur_payment_verify_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '查看人员清单') {
            if (recordset.val('查看人员清单.业务员') == '') {
                resolve()
                return
            }
            if (recordset.val('查看人员清单.业务员') != _.user.username) {
                _.http.post("/api/saier/purchase_payment_verify/user/delete", {
                    ywry: recordset.val('业务人员'),
                    line: recordset.tables['查看人员清单'].current_data
                }).then(res => {
                    resolve()
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                    reject()
                })
            } else {
                _.ui.message.error('不好意思,不能删除自已的数据!')
                reject()
                return
            }
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], pur_payment_verify_table_delete_before, '采购付款核对')

const pur_payment_verify_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        _.http.post('/api/saier/purchase_payment_verify/save/before', {
            rid : recordset.val('rid'),
            jsrm : recordset.val('经手人名'),
            jzrq : recordset.val('截止日期'),
            jzsj : recordset.val('截止时间'),
            gcmyd : recordset.val('工厂满意度'),
            yy : recordset.val('原   因'),
            sccj : recordset.val('生产厂家'),
            data_list: recordset.tables['付款资料'].view_data,
            fkdh : recordset.val('付款单号'),
            ywhdzt : recordset.val('业务核对状态')
        }).then(res => {
            if (res.code == 1){
                if (res.data != ''){
                    _.ui.message.error(res.data);
                }
                let t = recordset.tables['付款资料']
                let d = t.view_data;
                t_flag = false
                for (let r of d) {
                    if (r.ywhd == ''){
                        r.ywhd = '不通过'
                        t.push_modi_rid(r.rid)
                        t_flag = true
                    }
                }
                if (t_flag){
                    t.sync_operate_data()
                    t.modified = true;
                }

                resolve();
            }else{
                reject(res.msg);
            }

        }).catch(err => {
            reject();
            console.log(err)
            _.ui.message.error(err.msg)
        })

    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, pur_payment_verify_before_save, '采购付款核对')


// 查询界面或编辑界面、子表上按钮点击事件
const pur_payment_verify_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset

    if (btn.name == 'purchase_payment_cxgc_btn') {
        
        _.http.post('/api/saier/purchase_payment_verify/button/cxgc', {
            sccj: recordset.val('生产厂家'),
            data_list: recordset.tables['付款资料'].view_data
        }).then(res => {
            if (res.code == 1){
                let data = res.data
                rq1 = data.date
                if (data.data_list.length > 0){
                    let t = recordset.tables['付款资料']
                    let d = t.view_data;
                    for (let r of d) {
                        for (let key of data.data_list) {
                            if (r.rid == key.rid) {
                                r.cxbg = key.sfsh1;
                                t.push_modi_rid(r.rid)
                            }
                        }
                    }
                    t.sync_operate_data()
                    t.modified = true;
                }
            }else{
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }    
    
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], pur_payment_verify_form_BtnClick, '采购付款核对')