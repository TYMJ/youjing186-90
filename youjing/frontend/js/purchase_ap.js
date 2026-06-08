// 编辑界面数据加载以后执行
const purchase_ap_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    _.http.post('/api/saier/purchase_ap/load/check', {
        sqry: recordset.val('申请人员'),
        sqbm: recordset.val('申请部门'),
    }).then(res => {
        let sb = ''
        let cwsb = res.data.cwsb
        let bm = res.data.bm
        let bmdm = res.data.bmdm
        if (recordset.val('申请部门') == '' && bm != '' && bm != null) {
            recordset.val('申请部门', bm)
        }
        if (recordset.val('部门代码') == '' && bmdm != '' && bmdm != null) {
            recordset.val('部门代码', bmdm)
        }
        recordset.module.field_by_full_namename(m + '.提交单证').disabled = true
        recordset.module.field_by_full_namename(m + '.单证审批').disabled = true
        recordset.module.field_by_full_namename(m + '.审批日期').disabled = true
        recordset.module.field_by_full_namename(m + '.审批意见').disabled = true
        recordset.module.field_by_full_namename(m + '.提交预填').disabled = true
        recordset.module.field_by_full_namename(m + '.预填审批').disabled = true
        recordset.module.field_by_full_namename(m + '.审批日期1').disabled = true
        recordset.module.field_by_full_namename(m + '.意    见').disabled = true
        recordset.module.field_by_full_namename(m + '.是否到票').disabled = true
        if (cwsb == 1 && recordset.val('预填审批') == '通过') {
            recordset.module.field_by_full_namename(m + '.财务锁定').disabled = false
            recordset.module.field_by_full_namename(m + '.是否到票').disabled = false
        } else {
            recordset.module.field_by_full_namename(m + '.财务锁定').disabled = true
            recordset.module.field_by_full_namename(m + '.可否打印').disabled = true
        }
        if (recordset.val('财务锁定') != '锁定') {
            recordset.module.field_by_full_namename(m + '.可否打印').disabled = true
        }
        recordset.module.field_by_full_namename(m + '.采购合同.采购合同').disabled = true
        recordset.module.field_by_full_namename(m + '.采购合同.付款抬头').disabled = true
        if ((recordset.val('申请人员') == '' || recordset.val('申请人员') == username) && (recordset.val('提交单证') == '')) {
            sb = 1
            recordset.module.field_by_full_namename(m + '.采购合同.采购合同').disabled = false
            recordset.module.field_by_full_namename(m + '.采购合同.付款抬头').disabled = false
            if (recordset.val('预填单号') != '') {
                recordset.module.field_by_full_namename(m + '.提交单证').disabled = false
            }
        }
        if ((recordset.val('提交预填') == '' && recordset.val('提交单证') == username)) {
            sb = 1
            recordset.module.field_by_full_namename(m + '.提交单证').disabled = false
            recordset.module.field_by_full_namename(m + '.单证审批').disabled = false
            recordset.module.field_by_full_namename(m + '.审批日期').disabled = false
            recordset.module.field_by_full_namename(m + '.审批意见').disabled = false
            if (recordset.val('单证审批') == '通过') {
                recordset.module.field_by_full_namename(m + '.提交预填').disabled = false
            }
        }
        if (recordset.val('提交预填') == username && recordset.val('财务锁定') != '锁定') {
            sb = 1
            recordset.module.field_by_full_namename(m + '.预填审批').disabled = false
            recordset.module.field_by_full_namename(m + '.审批日期1').disabled = false
            recordset.module.field_by_full_namename(m + '.意    见').disabled = false
        }
        if (sb == 1 && recordset.val('财务锁定') != '锁定') {} else {
            if (cwsb == 1 && recordset.val('预填审批') == '通过') {} else {
                recordset.module.field_by_full_namename(m + '.发票号码').disabled = true
                recordset.module.field_by_full_namename(m + '.出货日期').disabled = true
                recordset.module.field_by_full_namename(m + '.合同日期').disabled = true
                recordset.module.field_by_full_namename(m + '.外销合同').disabled = true
                recordset.module.field_by_full_namename(m + '.采购合同').disabled = true
                recordset.module.field_by_full_namename(m + '.申请日期').disabled = true
                recordset.module.field_by_full_namename(m + '.付款抬头').disabled = true
                recordset.module.field_by_full_namename(m + '.申请人员').disabled = true
                recordset.module.field_by_full_namename(m + '.申请部门').disabled = true
                recordset.module.field_by_full_namename(m + '.预计出货').disabled = true
                recordset.module.field_by_full_namename(m + '.生产厂家').disabled = true
                recordset.module.field_by_full_namename(m + '.联系方式').disabled = true
                recordset.module.field_by_full_namename(m + '.联系电话').disabled = true
                recordset.module.field_by_full_namename(m + '.货 源 地').disabled = true
                recordset.module.field_by_full_namename(m + '.中文品名').disabled = true
                recordset.module.field_by_full_namename(m + '.预填数量').disabled = true
                recordset.module.field_by_full_namename(m + '.海关计量单位').disabled = true
                recordset.module.field_by_full_namename(m + '.材   质').disabled = true
                recordset.module.field_by_full_namename(m + '.增值税率').disabled = true
                recordset.module.field_by_full_namename(m + '.退 税 率').disabled = true
                recordset.module.field_by_full_namename(m + '.预填金额').disabled = true
                recordset.module.field_by_full_namename(m + '.业务人员').disabled = true
                recordset.module.field_by_full_namename(m + '.采购人员').disabled = true
                recordset.module.field_by_full_namename(m + '.跟单人员').disabled = true
                recordset.module.field_by_full_namename(m + '.注意事项').disabled = true
                recordset.module.field_by_full_namename(m + '.财务锁定').disabled = true
                recordset.module.field_by_full_namename(m + '.预填箱数').disabled = true
                recordset.module.field_by_full_namename(m + '.可否打印').disabled = true
                recordset.module.field_by_full_namename(m + '.采购合同.预填金额').disabled = true
                recordset.module.field_by_full_namename(m + '.备    注').disabled = true
            }
        }
        if (cwsb == 1) {
            recordset.module.field_by_full_namename(m + '.注意事项').disabled = false
            recordset.module.field_by_full_namename(m + '.采购合同.采购合同').disabled = false
            recordset.module.field_by_full_namename(m + '.采购合同.预填金额').disabled = false
            recordset.module.field_by_full_namename(m + '.采购合同.预填数量').disabled = false
        }
        if (recordset.val('提交预填') == '' && recordset.val('提交单证') == username) {
            recordset.module.field_by_full_namename(m + '.材   质').disabled = false
        }
        recordset.refresh_ui();
    }).catch(err => {
        _.ui.message.error('请求失败: ' + (err.msg || err));
        console.error('请求失败: ', err);
    })
}
_.evts.on(_.evtids.RECORD_LOADED, purchase_ap_recordLoad, '预填费用')


const purchase_ap_record_copy_after = (evt_id, recordset) => {
    _.http.post('/api/saier/purchase_ap/load/check', {
        sqry: recordset.val('申请人员'),
        sqbm: recordset.val('申请部门'),
        flag: 1
    }).then(res => {
        let bm = res.data.bm
        let bmdm = res.data.bmdm
        if (recordset.val('申请部门') == '' && bm != '' && bm != null) {
            recordset.val('申请部门', bm)
        }
        if (recordset.val('部门代码') == '' && bmdm != '' && bmdm != null) {
            recordset.val('部门代码', bmdm)
        }
    }).catch(err => {
        _.ui.message.error('请求失败: ' + (err.msg || err));
        console.error('请求失败: ', err);
    })
}
_.evts.on([_.evtids.RECORD_AFTER_COPY], purchase_ap_record_copy_after, '预填费用')


// 编辑界面字段change后执行
const purchase_ap_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.财务锁定') {
        if (recordset.val('财务锁定') != '锁定') {
            recordset.val('提交打印识别', '')
            recordset.val('可否打印', '不可')
        } else {
            recordset.module.field_by_full_name(m + '.可否打印').disabled = false;
            recordset.val('提交打印识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
        }
    }
    if (field.full_name == m + '.提交单证') {
        if (recordset.val('提交单证') == '') {
            recordset.val('提交单证识别', '')
        } else {
            recordset.val('提交单证识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
        }
    }
    if (field.full_name == m + '.提交预填') {
        if (recordset.val('提交预填') == '') {
            recordset.val('提交预填识别', '')
        } else {
            recordset.val('提交预填识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
            recordset.val('审批日期', new Date().format('yyyy-MM-dd'))
        }
    }
    if (field.full_name == m + '.预填审批') {
        if (recordset.val('预填审批') == '待审批' || recordset.val('预填审批') == '不通过') {
            recordset.val('提交财务识别', '')
        } else {
            recordset.val('提交财务识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
            recordset.val('审批日期1', new Date().format('yyyy-MM-dd'))
        }
    }
    if (field.full_name == m + '.单证审批') {
        if (recordset.val('单证审批') == '通过') {
            recordset.module.field_by_full_name(m + '.提交预填').disabled = false;
        } else {
            recordset.module.field_by_full_name(m + '.提交预填').disabled = true;
        }
    }
    if (field.full_name == m + '.可否打印') {
        if (recordset.val('可否打印') == '可以') {
            recordset.val('提交打印识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
        } else {
            recordset.val('提交打印识别', null)
        }
    }
    if (field.full_name == m + '.预填金额') {
        _.http.post('/api/saier/purchase_ap/ytje/change', {
            ytje: value,
            gcmc: recordset.val('生产厂家')
        }).then(res => {
            let d = res.data
            if (d > 0) {
                recordset.val('预填金额', d)
            }
        }).catch(err => {
            _.ui.message.error('请求失败: ' + (err.msg || err));
            console.error('请求失败: ', err);
        })
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, purchase_ap_field_change, '预填费用')

const purchase_ap_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/purchase_ap/save/before', {
            data: recordset.tables['预填费用'].view_data,
            lines: recordset.tables['采购合同'].view_data
        }).then(res => {
            let lines = res.data.lines
            let modi_rids = res.data.modi_rids
            let t = recordset.tables['采购合同']
            for (let r of modi_rids) {
                t.push_modi_rid(r)
            } 
            t.view_data = lines
            t.sync_operate_data();
            t.modified = true
            recordset.do_re_sum_by_trigger_table('采购合同')
            if (recordset.val('预填审批') == '不通过') {
                recordset.val('提交单证', '');
                recordset.val('单证审批', '待审批');
                recordset.val('提交预填', '');
                recordset.val('预填审批', '待审批');
            }
            if (recordset.val('预填单号') != '' && recordset.tables['采购合同'].view_data.length > 0) {
                recordset.module.field_by_full_name('提交单证').disabled = false;
            }
            return resolve();
        }).catch(res => {
            console.log(res)
            return reject(res.msg);
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, purchase_ap_before_save, '预填费用')

const purchase_ap_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'billed_download_btn',
            "caption": '开票信息导出',
            "icon": 'any-keyborad',
        })
    }
    btns.push({
        "name": 'return_back_btn',
        "caption": '单证财务退回',
        "icon": 'any-keyborad',
    })

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
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], purchase_ap_FormShow, '预填费用')


const purchase_ap_BtnClick = async (evt_id, btn, form) => {
    if (btn.name == 'return_back_btn') {
        _.ui.confirm('确定要做退回吗？').then(() => {
            _.http.post('/api/saier/purchase_ap/return/back', {
                rid: form.current_rid.value,
            }).then(res => {
                let d = res.data
                if (d == 0) {
                    _.ui.message.error('不好意思,退回无效');
                } else {
                    if (form.is_editor) {
                        _.platform.active.reload_data()
                    }
                    _.ui.message.success('操作成功');
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
    if (btn.name == 'billed_download_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('预填费用记录不能为空');
            return
        }
        let tp = await _.ui.show_input_select_dialog('请选择开票信息导出类型', '', ['PDF','JPG','JPG(Excel)','批量PDF'])
        if (tp == '' || tp == null || tp == undefined) {
            _.ui.message.error('请选择开票信息导出模板类型');
            return
        }
        _.http.post('/api/saier/purchase_ap/billed/download', {
            rids: rids,
            kind: tp
        }).then(r => {
            _.http.download("/api/tmp/file/get", {
                    file: r.data.path
                },
                r.data.name + '.xlsx'
            ).then(res=>{
                _.ui.message.success('下载成功');
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], purchase_ap_BtnClick, '预填费用')