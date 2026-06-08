// 编辑界面数据加载以后执行
const customer_claim_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    if (recordset.val('赔款申请') == _.user.username) {
        recordset.module.field_by_full_name(m + '.审核结果').disabled = false
        recordset.module.field_by_full_name(m + '.不批原因').disabled = false
        recordset.module.field_by_full_name(m + '.赔款申请').disabled = false
    } else {
        recordset.module.field_by_full_name(m + '.审核结果').disabled = true
        recordset.module.field_by_full_name(m + '.不批原因').disabled = true
    }
    if (recordset.val('赔款申请') != '') {
        recordset.module.field_by_full_name(m + '.赔款申请').disabled = true
        recordset.module.field_by_full_name(m + '.索赔金额').disabled = true
        recordset.module.field_by_full_name(m + '.过 错 方').disabled = true
        recordset.module.field_by_full_name(m + '.承担比例').disabled = true
        recordset.module.field_by_full_name(m + '.发票号码').disabled = true
        recordset.module.field_by_full_name(m + '.客户编号').disabled = true
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true
        recordset.module.field_by_full_name(m + '.外销总额').disabled = true
        recordset.module.field_by_full_name(m + '.索赔日期').disabled = true
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true
        recordset.module.field_by_full_name(m + '.外销合同').disabled = true
        recordset.module.field_by_full_name(m + '.索赔金额').disabled = true
        recordset.module.field_by_full_name(m + '.实际赔付').disabled = true
        recordset.module.field_by_full_name(m + '.赔款类型').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.外销合同').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.外销金额').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.赔款金额').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.专业货号').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.产品编号').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.客户货号').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.中文品名').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.发票号码').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.采购合同').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.工厂赔款').disabled = true
        recordset.module.field_by_full_name(m + '.索赔详细.核算发票').disabled = true
    } else {
        recordset.module.field_by_full_name(m + '.索赔金额').disabled = false
        recordset.module.field_by_full_name(m + '.过 错 方').disabled = false
        recordset.module.field_by_full_name(m + '.承担比例').disabled = false
        recordset.module.field_by_full_name(m + '.发票号码').disabled = false
        recordset.module.field_by_full_name(m + '.客户编号').disabled = false
        recordset.module.field_by_full_name(m + '.客户名称').disabled = false
        recordset.module.field_by_full_name(m + '.外销总额').disabled = false
        recordset.module.field_by_full_name(m + '.索赔日期').disabled = false
        recordset.module.field_by_full_name(m + '.货币代码').disabled = false
        recordset.module.field_by_full_name(m + '.外销合同').disabled = false
        recordset.module.field_by_full_name(m + '.索赔金额').disabled = false
        recordset.module.field_by_full_name(m + '.实际赔付').disabled = false
        recordset.module.field_by_full_name(m + '.赔款类型').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.外销合同').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.外销金额').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.赔款金额').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.专业货号').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.产品编号').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.客户货号').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.中文品名').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.发票号码').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.采购合同').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.工厂赔款').disabled = false
        recordset.module.field_by_full_name(m + '.索赔详细.核算发票').disabled = false
    }
    if (recordset.val('审核结果') === '通过') {
        recordset.module.field_by_full_name(m + '.现金赔款').disabled = false
        recordset.module.field_by_full_name(m + '.赔款合计').disabled = false
        recordset.module.field_by_full_name(m + '.赔付状态').disabled = false

        recordset.module.field_by_full_name(m + '.赔款进展表.外销合同').disabled = false
        recordset.module.field_by_full_name(m + '.赔款进展表.专业货号').disabled = false
        recordset.module.field_by_full_name(m + '.赔款进展表.外销单价').disabled = false
        recordset.module.field_by_full_name(m + '.赔款进展表.赔款单价').disabled = false
        recordset.module.field_by_full_name(m + '.赔款进展表.合同数量').disabled = false
        recordset.module.field_by_full_name(m + '.赔款进展表.赔款金额').disabled = false
    } else {
        recordset.module.field_by_full_name(m + '.现金赔款').disabled = true
        recordset.module.field_by_full_name(m + '.赔款合计').disabled = true
        recordset.module.field_by_full_name(m + '.赔付状态').disabled = true

        recordset.module.field_by_full_name(m + '.赔款进展表.外销合同').disabled = true
        recordset.module.field_by_full_name(m + '.赔款进展表.专业货号').disabled = true
        recordset.module.field_by_full_name(m + '.赔款进展表.外销单价').disabled = true
        recordset.module.field_by_full_name(m + '.赔款进展表.赔款单价').disabled = true
        recordset.module.field_by_full_name(m + '.赔款进展表.合同数量').disabled = true
        recordset.module.field_by_full_name(m + '.赔款进展表.赔款金额').disabled = true
    }
}
_.evts.on([_.evtids.RECORD_LOAD], customer_claim_recordLoad, '客户索赔')


// 编辑界面字段change后执行
const customer_claim_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.赔款申请') {
        let flag = true;
        let fields = ['客户编号', '客户名称', '发票号码', '外销总额', '索赔日期', '货币代码', '外销合同', '索赔金额', '实际赔付', '过 错 方', '承担比例', '赔款类型'];
        for (let f of fields) {
            if (recordset.val(f) == null || recordset.val(f) == '' || recordset.val(f) == 0) {
                _.ui.message.error('不好意思,有没填写内容!');
                recordset.val('赔款申请', '');
                recordset.module.field_by_full_name(m + '.赔款申请').disabled = false;
                flag = false;
                break;
            }
        }
        if (flag && recordset.val('赔款申请') != '') {
            _.http.post('/api/saier/customer_claim/pksq/change', {
                ajbh: recordset.val('案件编号'),
                gcsp: recordset.val('工厂索赔情况'),
                spsq: recordset.val('赔款申请')
            }).then(function (res) {
                recordset.val('申请日期', new Date().format('yyyy-MM-dd'));
                recordset.module.field_by_full_name(m + '.赔款申请').disabled = true;

            }).catch(err => {
                recordset.val('赔款申请', '');
                recordset.module.field_by_full_name(m + '.赔款申请').disabled = false;
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == m + '.剩余金额') {
        if (recordset.val('剩余金额') == 0) {
            recordset.val('赔付状态', '已赔付');
        } else {
            recordset.val('赔付状态', '待赔付');
        }
    }
    if (field.full_name == m + '.客户名称') {
        if (recordset.val('客户名称') != '' && recordset.val('客户名称') != null) {
            _.http.post('/api/saier/customer_claim/khmc/change', {
                khmc: recordset.val('客户名称')
            }).then(function (res) {
                let d = res.data;
                if (d && d != '') {
                    recordset.val('货币代码', d);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == m + '.索赔详细.发票号码') {
        if (recordset.val('索赔详细.发票号码') != '' && recordset.val('索赔详细.发票号码') != null) {
            recordset.val('索赔详细.核算发票', recordset.val('索赔详细.发票号码'))
        }
    }
    if (field.full_name == m + '.索赔详细.核算发票') {
        if (recordset.val('索赔详细.核算发票') != '' && recordset.val('索赔详细.核算发票') != null) {
            _.http.post('/api/saier/customer_claim/hsfp/change', {
                hsfp: recordset.val('索赔详细.核算发票')
            }).then(function (res) {

            }).catch(err => {
                recordset.val('索赔详细.核算发票', '');
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == m + '.索赔详细.采购合同' || field.full_name == m + '.索赔详细.专业货号' || field.full_name == m + '.索赔详细.客户货号') {
        if (recordset.val('索赔详细.采购合同') != '' && recordset.val('索赔详细.采购合同') != null) {
            _.http.post('/api/saier/customer_claim/hthm/change', {
                hthm: recordset.val('索赔详细.采购合同'),
                bjhh: recordset.val('索赔详细.专业货号'),
                khhh: recordset.val('索赔详细.客户货号')
            }).then(function (res) {
                let d = res.data;
                if (d) {
                    recordset.val('索赔详细.专业工厂', d.sccj);
                    recordset.val('索赔详细.采购金额', d.zje);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customer_claim_field_change, '客户索赔')


const customer_claim_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '索赔详细') {
            if (recordset.val('审核结果') == '通过') {
                _.ui.message.error('不好意思,您没有权限修改此资料,请先更改审核结果,谢谢')
                reject()
                return
            }
            resolve()
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE, _.evtids.RECORD_TABLE_BEFORE_NEW, _.evtids.RECORD_TABLE_BEFORE_COPY], customer_claim_table_delete_before, '客户索赔')

const customer_claim_table_new_after = (evt_id, table, recordset) => {
    if (table.group == '索赔详细') {
        recordset.val('索赔详细.客户名称', recordset.val('客户名称'))
        recordset.val('索赔详细.货币代码', recordset.val('货币代码'))
        recordset.val('索赔详细.唯一字段', recordset.val('索赔详细.rid'))
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], customer_claim_table_new_after, '客户索赔')


const customer_claim_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'cancel_apply_btn',
        "caption": '退改单申请',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], customer_claim_FormShow, '客户索赔')

const customer_claim_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'cancel_apply_btn') {
        let recordset = form.recordset
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后再进行退改单操作')
                return
            }
            if (recordset.val('赔款申请') == '' || recordset.val('赔款申请') == _.user.username) {
                _.ui.message.error('操作被取消')
                return
            }
        }
        _.ui.show_input_dialog('请输入退改单原因:', '').then(val => {
            if (val == '' || val == null) {
                _.ui.message.error('退改单原因不能为空')
                return
            }
            _.http.post('/api/saier/customer_claim/cancel/apply', {
                rid: recordset.val('rid'),
                val: val
            }).then(function (res) {
                _.ui.message.success('退改单申请成功,请等待审核!')
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], customer_claim_BtnClick, '客户索赔')


// 编辑界面记录保存前执行
const customer_claim_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/customer_claim/save/before', {
            rid: recordset.val('rid'),
            shr: recordset.val('审 核 人'),
            sqr: recordset.val('申 请 人'),
            shjg: recordset.val('审核结果'),
            pksq: recordset.val('赔款申请'),
            lines: recordset.tables['索赔详细'].view_data
        }).then(function (res) {
            let d = res.data;
            recordset.val('发票号码', d.fp_list.join('\n'));
            recordset.val('外销合同', d.ht_list.join('\n'));
            recordset.val('专业工厂', d.cs_list.join(','));
            recordset.val('合同操作人', '业务人员:'+d.yw_list.join(',')+'\n'+'跟单人员:'+d.gd_list.join(','));
            let t = recordset.tables['索赔详细'];
            let v = t.view_data;
            let flag = 0
            for (let r of v) {
                let f = 0
                if (r.shjg!=recordset.val('审核结果')){
                    f = 1
                    r.shjg = recordset.val('审核结果');
                }
                if (r.shjg!=recordset.val('货币代码')){
                    f = 1
                    r.hbdm = recordset.val('货币代码');
                }
                if (r.shjg!=r.rid){
                    f = 1
                    r.wyzd = r.rid
                }
                if (f == 1){
                    t.push_modi_rid(r.rid);
                    flag = 1
                }
            }
            if (flag == 1){
                t.sync_operate_data();
                t.modified = true
            }
            resolve();
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject();
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, customer_claim_before_save, '客户索赔')