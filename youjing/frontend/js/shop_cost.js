// 电商预填费用-字段改变主函数
const shop_cost_field_change = async (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record
    let m = module.name;
    if (field.full_name == m + '.财务锁定') {
        if (recordset.val('财务锁定') == '锁定') {
            recordset.module.field_by_full_name(m + '.可否打印').disabled = true
            recordset.val('提交打印识别', '');
            recordset.val('可否打印', '不可');
        } else {
            recordset.module.field_by_full_name(m + '.可否打印').disabled = false;
            recordset.val('提交打印识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        }
    }
    if (field.full_name == m + '.提交单证') {
        if (recordset.val('提交单证') == '') {
            recordset.val('提交单证识别', '');
        } else {
            recordset.val('提交单证识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        }
    }
    if (field.full_name == m + '.提交预填') {
        if (recordset.val('提交预填') == '') {
            recordset.val('提交预填识别', '');
        } else {
            recordset.val('提交预填识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
            recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
        }
    }
    if (field.full_name == m + '.预填审批') {
        if (recordset.val('预填审批') == '待审批' || recordset.val('预填审批') == '不通过') {
            recordset.val('提交财务识别', '');
        } else {
            recordset.val('提交财务识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
            recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
        }
    }
    if (field.full_name == m + '单证审批') {
        if (recordset.val('单证审批') == '通过') {
            recordset.module.field_by_full_name(m + '.提交预填').disabled = false
        } else {
            recordset.module.field_by_full_name(m + '.提交预填').disabled = true
        }
    }
    if (field.full_name == m + '.可否打印') {
        if (recordset.val('可否打印') == '可以') {
            recordset.val('提交打印识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
        } else {
            recordset.val('提交打印识别', '');
        }
    }
    if (field.full_name == m + '.预填金额') {
        _.http.post('/api/saier/shop_cost/ytje/change', {
            rid: recordset.val('rid'),
            gcmc: recordset.val('生产厂家'),
            ytje: recordset.val('预填金额')
        }).then((res) => {
            let d = res.data;
            let flag = d.flag
            if (d.mlsb == '是' && flag == 0 && recordset.val('预填金额') > 10) {
                recordset.val('预填金额', d.ytje);
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '预填金额请求失败');
        });
    }
    if (field.full_name == m + '.采购合同.采购合同') {
        _.http.post('/api/saier/shop_cost/cght/change', {
            rid: recordset.val('rid'),
            hthm: recordset.value('采购合同.采购合同', row),
            fphm: recordset.value('采购合同.发票号码', row),
        }).then((res) => {
            let d = res.data;
            let fktt = d.fktt
            let htje = d.htje
            let chje = d.chje
            if (fktt) {
                recordset.val('采购合同.付款类型', fktt, row);
            }
            if (htje) {
                recordset.val('采购合同.预填金额', htje, row);
                recordset.val('采购合同.合同金额', htje, row);
            }
            if (chje) {
                recordset.val('采购合同.发票出货金额', chje, row);
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '预填金额请求失败');
        });
    }
}
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shop_cost_field_change, '电商预填费用')


// 编辑界面数据加载以后执行
const shop_cost_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    _.http.post('/api/saier/shop_cost/load/check', {
        sqbm: recordset.val('申请部门'),
    }).then(res => {
        let d = res.data || {}
        let bm = d.bm || ''
        let bmdm = d.bmdm || ''
        let cwsb = d.cwsb || '0'
        let sb = '0'
        if (recordset.val('申请人员') == '') {
            recordset.val('申请人员', username);
            recordset.val('申请部门', bm)
            recordset.val('部门代码', bmdm)
        }
        recordset.module.field_by_full_name(m + '.提交单证').disabled = true
        recordset.module.field_by_full_name(m + '.单证审批').disabled = true
        recordset.module.field_by_full_name(m + '.审批日期').disabled = true
        recordset.module.field_by_full_name(m + '.审批意见').disabled = true
        recordset.module.field_by_full_name(m + '.提交预填').disabled = true
        recordset.module.field_by_full_name(m + '.预填审批').disabled = true
        recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true
        recordset.module.field_by_full_name(m + '.意    见').disabled = true
        recordset.module.field_by_full_name(m + '.是否到票').disabled = true
        if (cwsb == '1' && recordset.val('预填审批') == '通过' && sb1 == '1') {
            recordset.module.field_by_full_name(m + '.财务锁定').disabled = false
            recordset.module.field_by_full_name(m + '.是否到票').disabled = false
        } else {
            recordset.module.field_by_full_name(m + '.财务锁定').disabled = true
            recordset.module.field_by_full_name(m + '.可否打印').disabled = true
        }
        if (recordset.val('财务锁定') != '锁定') {
            recordset.module.field_by_full_name(m + '.可否打印').disabled = true
        }
        recordset.module.field_by_full_name(m + '.采购合同.采购合同').disabled = true
        recordset.module.field_by_full_name(m + '.采购合同.付款抬头').disabled = true
        if ((recordset.val('申请人员') == '' || recordset.val('申请人员') == username) && recordset.val('提交单证') == '') {
            recordset.module.field_by_full_name(m + '.采购合同.采购合同').disabled = false
            recordset.module.field_by_full_name(m + '.采购合同.付款抬头').disabled = false
            sb = '1';
            if (recordset.val('预填单号') != '') {
                recordset.module.field_by_full_name(m + '.提交单证').disabled = false
            }
        }
        if (recordset.val('提交预填') == '' && recordset.val('提交单证') == username) {
            sb = '1';
            recordset.module.field_by_full_name(m + '.提交单证').disabled = false
            recordset.module.field_by_full_name(m + '.单证审批').disabled = false
            recordset.module.field_by_full_name(m + '.审批日期').disabled = false
            recordset.module.field_by_full_name(m + '.审批意见').disabled = false
            if (recordset.val('单证审批') == '通过') {
                recordset.module.field_by_full_name(m + '.提交预填').disabled = false
            }
        }
        if (recordset.val('提交预填') == username && recordset.val('财务锁定') != '锁定') {
            sb = '1';
            recordset.module.field_by_full_name(m + '.预填审批').disabled = false
            recordset.module.field_by_full_name(m + '.1审批日期1').disabled = false
            recordset.module.field_by_full_name(m + '.意    见').disabled = false
        }
        if (sb == '1' && recordset.val('财务锁定') != '锁定') {} else {
            if (cwsb == '1' && recordset.val('预填审批') == '通过') {} else {
                recordset.module.field_by_full_name(m + '.发票号码').disabled = true
                recordset.module.field_by_full_name(m + '.出货日期').disabled = true
                recordset.module.field_by_full_name(m + '.合同日期').disabled = true
                recordset.module.field_by_full_name(m + '.外销合同').disabled = true
                recordset.module.field_by_full_name(m + '.采购合同').disabled = true
                recordset.module.field_by_full_name(m + '.申请日期').disabled = true
                recordset.module.field_by_full_name(m + '.付款抬头').disabled = true
                recordset.module.field_by_full_name(m + '.申请人员').disabled = true
                recordset.module.field_by_full_name(m + '.申请部门').disabled = true
                recordset.module.field_by_full_name(m + '.预计出货').disabled = true
                recordset.module.field_by_full_name(m + '.生产厂家').disabled = true
                recordset.module.field_by_full_name(m + '.联系方式').disabled = true
                recordset.module.field_by_full_name(m + '.联系电话').disabled = true
                recordset.module.field_by_full_name(m + '.货 源 地').disabled = true
                recordset.module.field_by_full_name(m + '.中文品名').disabled = true
                recordset.module.field_by_full_name(m + '.预填数量').disabled = true
                recordset.module.field_by_full_name(m + '.海关计量单位').disabled = true
                recordset.module.field_by_full_name(m + '.材   质').disabled = true
                recordset.module.field_by_full_name(m + '.增值税率').disabled = true
                recordset.module.field_by_full_name(m + '.退 税 率').disabled = true
                recordset.module.field_by_full_name(m + '.预填金额').disabled = true
                recordset.module.field_by_full_name(m + '.业务人员').disabled = true
                recordset.module.field_by_full_name(m + '.采购人员').disabled = true
                recordset.module.field_by_full_name(m + '.跟单人员').disabled = true
                recordset.module.field_by_full_name(m + '.注意事项').disabled = true
                recordset.module.field_by_full_name(m + '.财务锁定').disabled = true
                recordset.module.field_by_full_name(m + '.预填箱数').disabled = true
                recordset.module.field_by_full_name(m + '.可否打印').disabled = true
                recordset.module.field_by_full_name(m + '.采购合同.预填金额').disabled = true
                recordset.module.field_by_full_name(m + '.备    注').disabled = true
            }
        }
        if (cwsb == '1') {
            recordset.module.field_by_full_name(m + '.注意事项').disabled = false
            recordset.module.field_by_full_name(m + '.采购合同.采购合同').disabled = false
            recordset.module.field_by_full_name(m + '.采购合同.预填金额').disabled = false
            recordset.module.field_by_full_name(m + '.采购合同.预填数量').disabled = false
        }
        if (recordset.val('提交预填') == '' && recordset.val('提交单证') == username) {
            recordset.module.field_by_full_name(m + '.材   质').disabled = false
        }
        recordset.refresh_ui(true)
    }).catch(err => {
        console.error('加载检查失败', err);
        _.ui.message.error((err && err.msg) || '加载检查失败');
    });
}
_.evts.on([_.evtids.RECORD_LOAD], shop_cost_recordLoad, '电商预填费用')



// 界面加载添加按钮
const shop_cost_formShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        // btns.push({
        //     name: 'update_dzth_btn',
        //     caption: '详情审批提交',
        //     icon: 'any-keyborad'
        // })
    } else {
        btns.push({
            name: 'update_dzth_btn',
            caption: '单证财务退回',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'billed_download_btn',
            caption: '开票信息导出',
            icon: 'any-keyborad',
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
};

_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], shop_cost_formShow, '电商预填费用');

// 电商预填费用-按钮点击事件
const shopCostButtonClick = async (evt_id, btn, form) => {
    // 单证财务退回
    if (btn.name == 'update_dzth_btn') {
        _.http.post('/api/saier/shop_cost/update_dzth', {}).then(res => {
            _.ui.message.success('单证财务退回成功');
            if (form && form.is_editor) {
                _.platform.active.reload_data()
            }
        }).catch(err => {
            console.error('单证财务退回失败', err);
            _.ui.message.error((err && err.msg) || '单证财务退回失败');
        });
    }
    if (btn.name == 'billed_download_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('电商预填费用记录不能为空');
            return
        }
        let da2 = await _.ui.show_input_dialog('1为当前信息，输2为批量，默认当前', '1')
        if (da2 == null || da2 === undefined) {
            return
        }
        if (da2 !== '2') {
            da2 = '1'
        }
        if (da2 === '2' && rids.length === 0) {
            _.ui.message.error('批量导出请先勾选记录')
            return
        }
        let tp = await _.ui.show_input_select_dialog('请选择开票信息导出类型', '', ['PDF', '批量PDF'])
        if (tp == '' || tp == null || tp == undefined) {
            _.ui.message.error('请选择开票信息导出模板类型');
            return
        }
        let payload = {
            rids: da2 === '2' ? rids : [],
            kind: tp,
            da2: da2,
        }
        if (da2 === '1') {
            payload.rid = form.current_rid.value || (rids.length ? rids[0] : '')
        }
        _.http.post('/api/saier/ecommerce_prepaid_invoice/billed/download', payload).then(r => {
            const dlName = r.data.name || 'export'
            _.http.download("/api/tmp/file/get", {
                    file: r.data.path
                },
                dlName
            ).then(res => {
                _.ui.message.success('下载成功');
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shopCostButtonClick, '电商预填费用');


const shop_cost_before_save = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        if (recordset.val('是否开票') == '否' && recordset.val('信保代码') != '' && recordset.val('付款类型') == '打样费') {
            _.ui.message.error('请注意此客人为信保客人\n有报关率要求:' + recordset.val('报关率要求'));
            reject()
            return
        }
        _.http.post('/api/saier/shop_cost/save/before', {
            main: recordset.tables['电商预填费用'].view_data,
            lines: recordset.tables['采购合同'].view_data,
        }).then(res => {
            let d = res.data || {};
            let t = recordset.tables['采购合同'];
            let v = t.view_data || [];
            let ht_json = d.ht_json || {};
            for (let r of v) {
                let hthm = r.cght
                if (hthm in ht_json) {
                    recordset.val('采购合同.付款抬头', ht_json[hthm], r);
                }
                recordset.val('采购合同.预填单号', recordset.val('预填单号'), r);
                recordset.val('采购合同.申请日期', recordset.val('申请日期'), r);
                recordset.val('采购合同.生产厂家', recordset.val('生产厂家'), r);
                recordset.val('采购合同.增值税率', recordset.val('增值税率'), r);
                recordset.val('采购合同.退 税 率', recordset.val('退 税 率'), r);
                recordset.val('采购合同.货 源 地', recordset.val('货 源 地'), r);
            }
            if (recordset.val('预填单号') != '') {
                recordset.module.field_by_full_name('电商预填费用.提交单证').disabled = false
            }
            if (recordset.val('预填审批') == '不通过') {
                recordset.val('提交单证', '');
                recordset.val('单证审批', '待审批');
                recordset.val('提交预填', '');
                recordset.val('预填审批', '待审批');
            }
            resolve()
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.error('电商预填费用保存前检查失败', err);
            reject();
        });
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, shop_cost_before_save, '电商预填费用')