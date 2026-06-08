// 编辑界面数据加载以后执行
const factory_claim_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    _.http.post('/api/saier/factory_claim/load/check').then(res => {
        if (res.code == 1){
            if (res.data.cwck == 1){
                recordset.module.field_by_full_name('客户编号').disabled = true;
                recordset.module.field_by_full_name('客户名称').disabled = true;
                recordset.module.field_by_full_name('客人索赔号').disabled = true;
                recordset.module.field_by_full_name('采购合同').disabled = true;
                recordset.module.field_by_full_name('产品编号').disabled = true;
                recordset.module.field_by_full_name('中文品名').disabled = true;
                recordset.module.field_by_full_name('采购金额').disabled = true;
                recordset.module.field_by_full_name('厂家编号').disabled = true;
                recordset.module.field_by_full_name('生产厂家').disabled = true;
                recordset.module.field_by_full_name('索赔日期').disabled = true;
                recordset.module.field_by_full_name('赔款金额').disabled = true;
                recordset.module.field_by_full_name('货币代码').disabled = true;
                recordset.module.field_by_full_name('索赔金额').disabled = true;
                recordset.module.field_by_full_name('实际赔付').disabled = true;
                recordset.module.field_by_full_name('赔付方式').disabled = true;
                recordset.module.field_by_full_name('现金赔款').disabled = true;
                recordset.module.field_by_full_name('赔款合计').disabled = true;
                recordset.module.field_by_full_name('赔付状态').disabled = false;
                recordset.module.field_by_full_name('是否结清').disabled = false;
                recordset.module.field_by_full_name('提交审请').disabled = true;
                recordset.module.field_by_full_name('审核结果').disabled = true;
                recordset.module.field_by_full_name('不批原因').disabled = true;
                recordset.module.field_by_full_name('提交账务').disabled = true;
                recordset.module.field_by_full_name('财务结果').disabled = false;
                recordset.module.field_by_full_name('财务建议').disabled = false;
                recordset.module.field_by_full_name('索赔原因').disabled = true;
                recordset.module.field_by_full_name('处理结果').disabled = true;
                recordset.module.field_by_full_name('解决建议').disabled = true;
                recordset.module.field_by_full_name('赔款明细.采购合同').disabled = true;
                recordset.module.field_by_full_name('赔款明细.产品编号').disabled = true;
                recordset.module.field_by_full_name('赔款明细.专业货号').disabled = true;
                recordset.module.field_by_full_name('赔款明细.客户货号').disabled = true;
                recordset.module.field_by_full_name('赔款明细.合同金额').disabled = true;
                recordset.module.field_by_full_name('赔款明细.外销赔款').disabled = true;
                recordset.module.field_by_full_name('赔款明细.利  率').disabled = true;
                recordset.module.field_by_full_name('赔款明细.赔款金额').disabled = true;
                recordset.module.field_by_full_name('赔款明细.工厂赔款').disabled = true;
                recordset.module.field_by_full_name('赔款明细.验货人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.监装人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.中文品名').disabled = true;
                recordset.module.field_by_full_name('赔款明细.采购人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.业务人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.跟单人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.进仓地址').disabled = true;
                recordset.module.field_by_full_name('赔款明细.制单人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.单证人员').disabled = true;
                recordset.module.field_by_full_name('赔款明细.核算发票').disabled = true;
            }else{
                recordset.module.field_by_full_name('是否结清').disabled = true;
                recordset.module.field_by_full_name('扣款详情.财务核算发票').disabled = true;
                if (recordset.val('提交审请') != ''){
                    recordset.module.field_by_full_name('现金赔款').disabled = true;
                    recordset.module.field_by_full_name('赔付状态').disabled = true;
                    recordset.module.field_by_full_name('提交账务').disabled = true;
                    recordset.module.field_by_full_name('客户编号').disabled = true;
                    recordset.module.field_by_full_name('客户名称').disabled = true;
                    recordset.module.field_by_full_name('客人索赔号').disabled = true;
                    recordset.module.field_by_full_name('采购合同').disabled = true;
                    recordset.module.field_by_full_name('产品编号').disabled = true;
                    recordset.module.field_by_full_name('中文品名').disabled = true;
                    recordset.module.field_by_full_name('采购金额').disabled = true;
                    recordset.module.field_by_full_name('厂家编号').disabled = true;
                    recordset.module.field_by_full_name('生产厂家').disabled = true;
                    recordset.module.field_by_full_name('索赔日期').disabled = true;
                    recordset.module.field_by_full_name('赔款金额').disabled = true;
                    recordset.module.field_by_full_name('货币代码').disabled = true;
                    recordset.module.field_by_full_name('索赔金额').disabled = true;
                    recordset.module.field_by_full_name('实际赔付').disabled = true;
                    recordset.module.field_by_full_name('赔付方式').disabled = true;
                    recordset.module.field_by_full_name('赔款合计').disabled = true;
                    recordset.module.field_by_full_name('是否结清').disabled = true;
                    recordset.module.field_by_full_name('提交审请').disabled = true;
                    recordset.module.field_by_full_name('审核结果').disabled = true;
                    recordset.module.field_by_full_name('不批原因').disabled = true;
                    recordset.module.field_by_full_name('财务结果').disabled = true;
                    recordset.module.field_by_full_name('索赔原因').disabled = true;
                    recordset.module.field_by_full_name('处理结果').disabled = true;
                    recordset.module.field_by_full_name('解决建议').disabled = true;
                    recordset.module.field_by_full_name('财务建议').disabled = true;
                    recordset.module.field_by_full_name('过错原因').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.采购合同').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.产品编号').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.专业货号').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.客户货号').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.合同金额').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.外销赔款').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.利  率').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.赔款金额').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.工厂赔款').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.验货人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.监装人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.中文品名').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.采购人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.业务人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.跟单人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.进仓地址').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.制单人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.单证人员').disabled = true;
                    recordset.module.field_by_full_name('赔款明细.核算发票').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.采购合同').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.产品编号').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.原 单 价').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.赔款单价').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.合同数量').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.金    额').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.专业货号').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.客户货号').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.扣款日期').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.中文品名').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.采购人员').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.业务人员').disabled = true;
                    recordset.module.field_by_full_name('扣款详情.跟单人员').disabled = true;
                    if (recordset.val('审核结果') === '通过') {
                        recordset.module.field_by_full_name('现金赔款').disabled = false;
                        recordset.module.field_by_full_name('赔付状态').disabled = false;
                        
                        if (recordset.val('审 核 人') === username) {
                            recordset.module.field_by_full_name('提交账务').disabled = false;
                        }
                        
                        recordset.module.field_by_full_name('扣款详情.采购合同').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.产品编号').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.原 单 价').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.赔款单价').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.合同数量').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.金    额').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.专业货号').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.客户货号').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.扣款日期').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.中文品名').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.采购人员').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.业务人员').disabled = false;
                        recordset.module.field_by_full_name('扣款详情.跟单人员').disabled = false;
                    }

                }else{
                    recordset.module.field_by_full_name('现金赔款').disabled = true;
                    recordset.module.field_by_full_name('审核结果').disabled = true;
                    recordset.module.field_by_full_name('不批原因').disabled = true;
                    recordset.module.field_by_full_name('提交账务').disabled = true;
                    recordset.module.field_by_full_name('财务结果').disabled = true;
                    recordset.module.field_by_full_name('赔付状态').disabled = true;
                    recordset.module.field_by_full_name('提交账务').disabled = true;
                    recordset.module.field_by_full_name('是否结清').disabled = true;
                    recordset.module.field_by_full_name('财务建议').disabled = true;
                    recordset.module.field_by_full_name('客户编号').disabled = false;
                    recordset.module.field_by_full_name('客户名称').disabled = false;
                    recordset.module.field_by_full_name('客人索赔号').disabled = false;
                    recordset.module.field_by_full_name('采购合同').disabled = false;
                    recordset.module.field_by_full_name('产品编号').disabled = false;
                    recordset.module.field_by_full_name('中文品名').disabled = false;
                    recordset.module.field_by_full_name('采购金额').disabled = false;
                    recordset.module.field_by_full_name('厂家编号').disabled = false;
                    recordset.module.field_by_full_name('生产厂家').disabled = false;
                    recordset.module.field_by_full_name('索赔日期').disabled = false;
                    recordset.module.field_by_full_name('赔款金额').disabled = false;
                    recordset.module.field_by_full_name('货币代码').disabled = false;
                    recordset.module.field_by_full_name('索赔金额').disabled = false;
                    recordset.module.field_by_full_name('实际赔付').disabled = false;
                    recordset.module.field_by_full_name('赔付方式').disabled = false;
                    recordset.module.field_by_full_name('赔款合计').disabled = false;
                    recordset.module.field_by_full_name('提交审请').disabled = false;
                    recordset.module.field_by_full_name('索赔原因').disabled = false;
                    recordset.module.field_by_full_name('处理结果').disabled = false;
                    recordset.module.field_by_full_name('解决建议').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.采购合同').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.产品编号').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.专业货号').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.客户货号').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.合同金额').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.外销赔款').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.利  率').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.赔款金额').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.工厂赔款').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.验货人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.监装人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.中文品名').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.采购人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.业务人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.跟单人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.进仓地址').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.制单人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.单证人员').disabled = false;
                    recordset.module.field_by_full_name('赔款明细.核算发票').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.采购合同').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.产品编号').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.原 单 价').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.赔款单价').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.合同数量').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.金    额').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.专业货号').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.客户货号').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.扣款日期').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.中文品名').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.采购人员').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.业务人员').disabled = false;
                    recordset.module.field_by_full_name('扣款详情.跟单人员').disabled = false;
                }

            }
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })

    if (recordset.val('提交审请') == username) {
        recordset.module.field_by_full_name('审核结果').disabled = false;
        recordset.module.field_by_full_name('不批原因').disabled = false;
        recordset.module.field_by_full_name('提交审请').disabled = false;
        recordset.module.field_by_full_name('解决建议').disabled = false;
        recordset.module.field_by_full_name('过错原因').disabled = true;
        recordset.module.field_by_full_name('财务结果').disabled = true;
        recordset.module.field_by_full_name('是否结清').disabled = true;
        recordset.module.field_by_full_name('财务建议').disabled = true;
        recordset.module.field_by_full_name('索赔原因').disabled = true;
        recordset.module.field_by_full_name('处理结果').disabled = true;

    }else{
        recordset.module.field_by_full_name('审核结果').disabled = true;
        recordset.module.field_by_full_name('不批原因').disabled = true;

    }

    if (recordset.val('提交账务') == username) {
        recordset.module.field_by_full_name('财务结果').disabled = false;
        recordset.module.field_by_full_name('财务建议').disabled = false;
        recordset.module.field_by_full_name('是否结清').disabled = false;

    }else{
        recordset.module.field_by_full_name('财务结果').disabled = true;
        recordset.module.field_by_full_name('财务建议').disabled = true;
        recordset.module.field_by_full_name('是否结清').disabled = true;
    }
    if (recordset.val('审 请 人') == username) {
        recordset.module.field_by_full_name('客人索赔号').disabled = false;
    }
}
_.evts.on([_.evtids.RECORD_LOAD], factory_claim_recordLoad, '工厂索赔')

// // 编辑界面字段change后执行
const factory_claim_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    let username = _.user.username

    if (field.full_name == n + '.提交审请') {
        if (recordset.val('客户编号') == "" || 
            recordset.val('客户名称') == "" || 
            recordset.val('采购合同') == "" || 
            recordset.val('产品编号') == "" || 
            recordset.val('采购金额') == 0 || 
            recordset.val('厂家编号') == "" || 
            recordset.val('生产厂家') == "" || 
            recordset.val('索赔日期') == "" || 
            recordset.val('货币代码') == "" || 
            recordset.val('赔款金额') == 0 || 
            recordset.val('索赔金额') == 0 ||
            recordset.val('实际赔付') == 0 || 
            recordset.val('赔付方式') == "") {
            _.ui.message.error('不好意思,有没填写内容!');
            recordset.val('提交审请', '');
        } else {
            if (recordset.val('提交审请') != '') {
                _.http.post('/api/saier/factory_claim/tjsq/change', {sh: recordset.val('提交审请')}).then(res => {
                    if (res.code == 1){
                        if (res.data.spdata == 1){
                            if (recordset.val('提交审请') != ''){
                                recordset.val('申请日期',new Date().format('yyyy-MM-dd'))
                            }
                        }else{
                            _.ui.message.error('不好意思,此人无审核权限!')
                            recordset.val('提交审请','')
                        }
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
        }
    }

    if (field.full_name == n + '.审核结果') {
        if (recordset.val('审核结果') != '' && recordset.val('审核结果') != '待审批') {
            if (recordset.val('审核结果') == '通过') {
                recordset.val('审 请 人',username)
                recordset.val('不批原因','')
                recordset.module.field_by_full_name('提交账务').disabled = false;
                _.http.post('/api/saier/factory_claim/shjg/change', {sh:''}).then(res => {
                    if (res.code == 1){
                        if(res.data.sh1 != ''){
                            recordset.val('审核结果', '待审批');
                            recordset.val('提交审请', res.data.sh1);
                        }else{
                            recordset.val('批准日期', new Date().format('yyyy-MM-dd'));
                        }
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }else{
                recordset.val('审 请 人','')
                _.ui.show_input_dialog('请输入不批原因', '').then(val => {
                    if (val == '' || val == null || val == undefined) {
                        _.ui.message.error('不批原因不能为空')
                        return
                    }
                    recordset.val('不批原因', val)
                })

            }
            
        }
    }

    if (field.full_name == n + '.剩余金额') {
        if (recordset.val('剩余金额') <= 0) {
            recordset.val('赔付状态', '已赔付');
        }else{
            recordset.val('赔付状态', '待赔付');
        }
    }

    if (field.full_name == n + '.提交账务') {
        if (recordset.val('提交账务') != '') {
            _.http.post('/api/saier/factory_claim/tjcw/change', {sh: recordset.val('提交账务')}).then(res => {
                if (res.code == 1){
                    if (res.data.spdata == 1){
                        recordset.val('审 请 人',username)
                    }else{
                        _.ui.message.error('不好意思,此人无审核权限!')
                        recordset.val('提交账务','')
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }

    if (field.full_name == n + '.赔款明细.核算发票') {
        if (recordset.val('赔款明细.核算发票') != '') {
            _.http.post('/api/saier/factory_claim/pkmx/fphs/change', {hsfp: recordset.val('赔款明细.核算发票')}).then(res => {
                if (res.code == 1){
                    if (res.data.sb == '1'){
                        _.ui.message.error('该发票号码已结单,请更换发票号!!!')
                        recordset.val('赔款明细.核算发票','')
                    }
                    if (res.data.sb == '2'){
                        _.ui.message.error('无此出运发票号,请更换发票号!!!')
                        recordset.val('赔款明细.核算发票','')
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, factory_claim_field_change, '工厂索赔')


const factory_claim_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '赔款明细') {
            if (recordset.val('审核结果') == '通过') {
                _.ui.message.error('不好意思,您没有权限修改此资料,请先更改审核结果,谢谢!')
                reject()
                return
            }
            resolve()
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE, _.evtids.RECORD_TABLE_BEFORE_NEW, _.evtids.RECORD_TABLE_BEFORE_COPY], factory_claim_table_delete_before, '工厂索赔')

const factory_claim_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        _.http.post('/api/saier/factory_claim/save/before/check', {ajbh: recordset.val('案件编号')}).then(res => {
            if (res.code == 1){
                if (recordset.val('案件编号') == '') {
                    recordset.val('案件编号', res.data.ajbh)
                }
                if (res.data.cdsb == '') {
                    let bjdh = recordset.val('审核结果');
                    let sb = '';
                    
                    // 权限验证
                    if (recordset.val('审 请 人') !== username && recordset.val('提交审请') !== username && 
                        recordset.val('提交账务') !== username && recordset.val('审 核 人') !== username) {
                        _.ui.message.error('不好意思,您没有权利修改此记录.');
                        sb = '1';
                    } else {
                        // 审核不通过时重置状态
                        if (bjdh === '不通过') {
                            recordset.val('提交审请', '');
                            recordset.val('审核结果', '待审批');
                        }
                        
                        let qs = '';
                        let cpbh = '';
                        let zwpm = '';
                        recordset.val('修改人员', username);

                        let pcmx = recordset.tables['赔款明细']
                        let data_list = pcmx.view_data
                        for (let r of  data_list){
                                r.shjg = recordset.val('审核结果')
                                if (qs === '') {
                                    qs = r.cght
                                } else {
                                    qs += '\r\n' + r.cght
                                }
                                const prodId = r.zyhh + r.cpbm + r.khh;
                                if (cpbh === '') {
                                    cpbh = prodId;
                                } else {
                                    cpbh += '\r\n' + prodId;
                                }
                                if (zwpm === '') {
                                    zwpm = r.zwpm
                                } else {
                                    zwpm += '\r\n' + r.zwpm;
                                }
                                pcmx.push_modi_rid(r.rid)
                            
                        }
                        pcmx.sync_operate_data()
                        pcmx.modified = true;

                        recordset.val('采购合同', qs);
                        recordset.val('产品编号', cpbh);
                        recordset.val('中文品名', zwpm);
                        
                        // 验证必填字段
                        if (qs === '' || cpbh === '') {
                            sb = '1';
                            _.ui.message.error('不好意思,采购合同,产品编号,中文品名不能为空');
                        }
                        
                        if (sb !== '1') {
                            if (recordset.val('提交审请') === username) {
                                recordset.module.field_by_full_name('审核结果').disabled = false;
                                recordset.module.field_by_full_name('不批原因').disabled = false;
                                recordset.module.field_by_full_name('提交审请').disabled = false;
                                recordset.module.field_by_full_name('解决建议').disabled = false;
                                recordset.module.field_by_full_name('过错原因').disabled = true;
                                recordset.module.field_by_full_name('财务结果').disabled = true;
                                recordset.module.field_by_full_name('是否结清').disabled = true;
                                recordset.module.field_by_full_name('财务建议').disabled = true;
                                recordset.module.field_by_full_name('索赔原因').disabled = true;
                                recordset.module.field_by_full_name('处理结果').disabled = true;
                            } else {
                                recordset.module.field_by_full_name('审核结果').disabled = true;
                                recordset.module.field_by_full_name('不批原因').disabled = true;
                            }
                        }
                    }
                    
                    if (sb === '1') {
                        reject();
                    }
                    _.http.post('/api/saier/factory_claim/save/before', {
                        rid:recordset.val('rid'),
                        sfjq:recordset.val('是否结清'),
                        spje:recordset.val('索赔金额'),
                        cjbh:recordset.val('厂家编号'),
                        data_list:recordset.tables['赔款明细'].view_data,
                        path:recordset.val('处理结果'),
                        fphm:recordset.val('客人索赔号'),
                        ajbh:recordset.val('案件编号'),
                        tjsq:recordset.val('提交审请'),
                        shjg:recordset.val('审核结果'),
                        sqr:recordset.val('审 请 人')

                    }).then(res => { 
                        if (res.code == 1){
                            if (recordset.val('提交审请') != '' && recordset.val('提交审请') != username) {
                                _.message.message_to_user(recordset.val('提交审请'), {
                                    title: '审核通知',
                                    msg: '案件编号:' + recordset.val('案件编号') + '工厂索赔需审核',
                                    type: 'warning',
                                    duration: 30000,
                                }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)
                            }
                            if (recordset.val('提交账务') != '' && recordset.val('提交账务') != username) {
                                _.message.message_to_user(recordset.val('提交账务'), {
                                    title: '审核通知',
                                    msg: '案件编号:' + recordset.val('案件编号') + '工厂索赔需审核',
                                    type: 'warning',
                                    duration: 30000,
                                }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)

                            }
                            if (recordset.val('审核结果') == '通过' && recordset.val('审 请 人') != username && recordset.val('审 请 人') != '' ) {
                                _.message.message_to_user(recordset.val('审 请 人'), {
                                    title: '审核通知',
                                    msg: '案件编号:' + recordset.val('案件编号') + '工厂索赔申请审核通过',
                                    type: 'warning',
                                    duration: 30000,
                                }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)

                            }

                            resolve();
                        }else{
                            reject();
                        }
                        }).catch(err => {
                            reject();
                            console.log(err)
                            _.ui.message.error(err.msg)
                        })


                } else {
                    _.ui.message.error('不好意思,业务撤单，不能保存!');
                    reject();
                }
            }
        }).catch(err => {
            reject();
            console.log(err)
            _.ui.message.error(err.msg)
        })

    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, factory_claim_before_save, '工厂索赔')


// 查询界面或编辑界面、子表上按钮点击事件
const factory_claim_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset
    if (btn.name == 'factory_gqdsq_btn') {
        if (recordset.val('提交审请') != ''){
            _.ui.show_input_dialog('请输入退改单原因', '').then(val => {
                if (val == '' || val == null || val == undefined) {
                    _.ui.message.error('退改单原因不能为空')
                    return
                }
                _.http.post('/api/saier/factory_claim/button/gqdsq', {
                    rid: recordset.val('rid'),
                    tjsq : recordset.val('提交审请'),
                    ajbh : recordset.val('案件编号'),
                    yy : val
                }).then(res => {
                    if (res.code != 1){
                        _.ui.message.error(res.msg);
                    }else{
                        if (recordset.val('提交审请') != username && recordset.val('提交审请') != '' ) {
                            _.message.message_to_user(recordset.val('提交审请'), {
                                title: '改退单通知',
                                msg: '工厂索赔案件编号:' + recordset.val('案件编号') + '退改单审请,原因:' + val,
                                type: 'warning',
                                duration: 30000,
                            }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)
                        }
                    }
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                })
            })
         }

    }

    if (btn.name == 'factory_cxsp_btn') {
        
        _.http.post('/api/saier/factory_claim/button/cxsp', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.code != 1){
                _.ui.message.error(res.msg);
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }    
    
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], factory_claim_form_BtnClick, '工厂索赔')

const factory_claim_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'factory_gqdsq_btn',
        "caption": '退改单审请',
        "icon": 'any-keyborad',
    },{
        "name": 'factory_cxsp_btn',
        "caption": '撤销审批',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], factory_claim_FormShow, '工厂索赔')