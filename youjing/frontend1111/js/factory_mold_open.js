// 编辑界面数据加载以后执行
const factory_mold_open_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    _.http.post('/api/saier/factory_mold_open/load/check').then(res => {
        if (res.code == 1){
            if (res.data.cdfysh == 1){
                recordset.module.field_by_full_name('承担费用收回').disabled = false;
            }
            if (res.data.cdfysh != 1){
                recordset.module.field_by_full_name('承担费用收回').disabled = true;
            }
            if (res.data.cyzgl == 1){
                recordset.module.field_by_full_name('开模确认').disabled = false;
                recordset.module.field_by_full_name('不批原因').disabled = false;
            }
            if (res.data.cyzgl != 1){
                recordset.module.field_by_full_name('开模确认').disabled = true;
                recordset.module.field_by_full_name('不批原因').disabled = true;
                recordset.module.field_by_full_name('图纸超期期').disabled = true;
                recordset.module.field_by_full_name('材料超期期').disabled = true;
                recordset.module.field_by_full_name('试模超期期').disabled = true;
                recordset.module.field_by_full_name('产前超期期').disabled = true;
                recordset.module.field_by_full_name('交期超期期').disabled = true;
            }
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })

    if (recordset.val('开模审批') != '') {
        recordset.module.field_by_full_name('开模审批').disabled = true;
        recordset.module.field_by_full_name('产品编号').disabled = true;
        recordset.module.field_by_full_name('产品规格').disabled = true;
        recordset.module.field_by_full_name('中文品名').disabled = true;
        recordset.module.field_by_full_name('计量单位').disabled = true;
        recordset.module.field_by_full_name('采购单价').disabled = true;
        recordset.module.field_by_full_name('中文包装').disabled = true;
        recordset.module.field_by_full_name('产品克重').disabled = true;
        recordset.module.field_by_full_name('材质中文').disabled = true;
        recordset.module.field_by_full_name('厚    度').disabled = true;
        recordset.module.field_by_full_name('壁    厚').disabled = true;
        recordset.module.field_by_full_name('底    厚').disabled = true;
        recordset.module.field_by_full_name('其他材质').disabled = true;
        recordset.module.field_by_full_name('报价人员').disabled = true;
        recordset.module.field_by_full_name('模具采购').disabled = true;
        recordset.module.field_by_full_name('业务人员').disabled = true;
        recordset.module.field_by_full_name('设计人员').disabled = true;
        recordset.module.field_by_full_name('生产厂家').disabled = true;
        recordset.module.field_by_full_name('开模费用').disabled = true;
        recordset.module.field_by_full_name('模具数量').disabled = true;
        recordset.module.field_by_full_name('模具厂家').disabled = true;
        recordset.module.field_by_full_name('承担费用').disabled = true;
        recordset.module.field_by_full_name('承担金额').disabled = true;
        recordset.module.field_by_full_name('协定数量').disabled = true;
        recordset.module.field_by_full_name('费用收回').disabled = true;
        recordset.module.field_by_full_name('预计天数').disabled = true;
        recordset.module.field_by_full_name('预计接单数量').disabled = true;
        recordset.module.field_by_full_name('图纸超期期').disabled = true;
        recordset.module.field_by_full_name('材料超期期').disabled = true;
        recordset.module.field_by_full_name('试模超期期').disabled = true;
        recordset.module.field_by_full_name('产前超期期').disabled = true;
        recordset.module.field_by_full_name('交期超期期').disabled = true;
    } else {
        if (recordset.val('开模编号') != '') {
            recordset.module.field_by_full_name('开模审批').disabled = false;
        }
    }

    if (username != '侯柳红'){
        recordset.module.field_by_full_name('总经理审批').disabled = true;
    }else{
        recordset.module.field_by_full_name('总经理审批').disabled = false;
        recordset.module.field_by_full_name('不批原因').disabled = false;
    }
    if (recordset.val('审批人') != username){
        recordset.module.field_by_full_name('是否核准').disabled = true;
    }
}
_.evts.on([_.evtids.RECORD_LOAD], factory_mold_open_recordLoad, '工厂开模')

// // 编辑界面字段change后执行
const factory_mold_open_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    let username = _.user.username

    if (field.full_name == n + '.图纸确认') {
        if (recordset.val('图纸确认') != "") {
            recordset.val('图纸核实',username)
        } 
    }

    if (field.full_name == n + '.材料确认') {
        if (recordset.val('材料确认') != "") {
            recordset.val('材料核实',username)
        } 
    }

    if (field.full_name == n + '.试模完成') {
        if (recordset.val('试模完成') != "") {
            recordset.val('试模核实',username)
        } 
    }

    if (field.full_name == n + '.产前确认') {
        if (recordset.val('产前确认') != "") {
            recordset.val('产前核实',username)
        } 
    }

    if (field.full_name == n + '.交期确认') {
        if (recordset.val('交期确认') != "") {
            recordset.val('交期核实',username)
        } 
    }

    if (field.full_name == n + '.是否核准') {
        recordset.val('核准识别',new Date().format('yyyy-MM-dd hh:mm:ss'))
    }

    if (field.full_name == n + '.开模审批') {
        let sh = recordset.val('开模审批')
        if (sh != '') {
            _.http.post('/api/saier/factory_mold_open/kmsp/change', {sh: sh}).then(res => {
                if (res.code == 1){
                    if (res.data.shdata == 1){
                        if (sh != ''){
                            recordset.val('申请日期',new Date().format('yyyy-MM-dd'))
                        }
                    }else{
                        _.ui.message.error('不好意思,此人无审核权限!')
                        recordset.val('开模审批','')
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })

        }
    }

    if (field.full_name == n + '.产品编号') {
        if (recordset.val('产品编号') != '') {
            let kmbh = recordset.val('产品编号')
            let rid = ''
            recordset.val('专属货号',kmbh)

            if (recordset.job == 0 || recordset.job == 2){
                rid = recordset.val('rid')
            }
            _.http.post('/api/saier/factory_mold_open/cpbh/change', {kmbh: kmbh, rid: rid}).then(res => {
                if (res.code == 1){
                    if (res.data.cpbhdata == 1){
                        if (kmbh == res.data.cpbh){
                            recordset.val('开模编号',kmbh + '-1')
                        }else{
                            let fc = kmbh.length + 2;
                            let zc = res.data.cpbh.asString.length;
                            let i = parseInt(res.data.cpbh.asString.substring(fc - 1, zc)) + 1 || 1;
                            console.log(i);
                            
                            recordset.val('开模编号', kmbh + '-' + i.toString());
                        }
                    }else{
                        recordset.val('开模编号',kmbh)
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })

        }
    }

    if (field.name === '开模确认') {
        const kmqr = recordset.val('开模确认')
        if (kmqr != '待审批') {
            if (kmqr === '确认' || kmqr === '通过'){
                recordset.val('审 批 人', username)
                recordset.val('不批原因', '')
                if (recordset.val('承担金额')<=0){
                    recordset.val('总经理审批', '通过')
                }
            }else{
                recordset.val('审 批 人', username)
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

    if (field.name === '总经理审批') {
        if (username != '侯柳红' && recordset.val('总经理审批') != '待审批') {
            if (recordset.val('总经理审批') != '待审批'){
                if (kmqr === '确认' || kmqr === '通过'){
                    recordset.val('审 批 人', username)
                    recordset.val('不批原因', '')

                }else{
                    recordset.val('审 批 人', username)
                    _.ui.show_input_dialog('请输入不批原因', '').then(val => {
                        if (val == '' || val == null || val == undefined) {
                            _.ui.message.error('不批原因不能为空')
                            return
                        }
                        recordset.val('不批原因', val)
                    })
                    recordset.val('开模确认', '待审批')
                    recordset.val('总经理审批', '待审批')
                    recordset.val('开模审批', '')
                }
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, factory_mold_open_field_change, '工厂开模')

const factory_mold_open_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        if ((recordset.val('审请人') != username) && (recordset.val('开模审批') != username) && (username == '侯柳红')){
            _.ui.message.error('不好意思,您没有权利修改此记录.')
            reject()
        }else{
            if (recordset.val('开模审批') == '不通过' || recordset.val('总经理审批') == '不通过'){
                recordset.val('开模确认','待审批')
                recordset.val('总经理审批','待审批')
                recordset.val('开模审批','')
            }

            if ((recordset.val('开模审批') == '') && (recordset.val('审请人') == username)){
                recordset.module.field_by_full_name('开模审批').disabled = false;
            }

            if (recordset.val('唯一字段') == '') {
                recordset.val('唯一字段',recordset.val('产品编号') + recordset.val('生产厂家'))
            }

            _.http.post('/api/saier/factory_mold_open/save/before', {
                rid: recordset.val('rid'), 
                sh: recordset.val('开模审批'), 
                tg: recordset.val('开模确认'), 
                spr: recordset.val('审批人'),
                zjlsp: recordset.val('总经理审批'),
                wcqk: recordset.val('完成情况'),
                hzsb: recordset.val('核准识别'),
                sfhz: recordset.val('是否核准'),
                sqr: recordset.val('审请人'), 
                cpbh: recordset.val('产品编号'),
                kmbh: recordset.val('开模编号'),
                cdje: recordset.val('承担金额'),
                mjcg: recordset.val('模具采购'),
                bpyy: recordset.val('不批原因')
            }).then(res => {
                if (res.code == 1){
                    if ((recordset.val('开模审批') != '') && (username != '侯柳红')) {
                        if ((recordset.val('开模审批') != '') && (recordset.val('开模确认') == '待审批')){
                            if ((recordset.val('开模审批') != username) && (recordset.val('开模审批') != '')) {
                                recordset.val('申请日期',new Date().format('yyyy-MM-dd'))
                            }
                        }
                    }
                    if ((recordset.val('审批人') == username) && (recordset.val('总经理审批') == '通过') && (recordset.val('完成情况') == '完成') && (recordset.val('核准识别') != '')){
                        if (recordset.val('是否核准') == '通过'){
                            recordset.val('核准日期',new Date().format('yyyy-MM-dd'))
                        }else{
                            recordset.val('是否核准','待审批')
                        }
                    }
                    resolve()
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }

    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, factory_mold_open_before_save, '工厂开模')


// 查询界面或编辑界面、子表上按钮点击事件
const factory_mold_open_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset
    if (btn.name == 'factory_gqdsq_btn') {
        _.http.post('/api/saier/factory_mold_open/button/gqdsq/check', {
            bfdh: recordset.val('开模编号')
        }).then(res => {
            if (res.code == 1) {
                if (recordset.val('总经理审批')=='通过' && res.data.fysb == ''){
                    _.ui.show_input_dialog('请输入退改单原因', '').then(val => {
                        if (val == '' || val == null || val == undefined) {
                            _.ui.message.error('退改单原因不能为空')
                            return
                        }
                        _.http.post('/api/saier/factory_mold_open/button/gqdsq', {
                            rid: recordset.val('rid'),
                            cdje : recordset.val('承担金额'),
                            kmsp : recordset.val('开模审批'),
                            cpbh : recordset.val('产品编号'),
                            yy : val
                        }).then(res => {
                            if (res.code != 1){
                                _.ui.message.error(res.msg);
                            }
                        }).catch(res => {
                            _.ui.message.error(res.msg);
                            console.log(res);
                        })
                    })
                }else{
                    if (res.data.fysb == '1'){
                        _.ui.message.error('已有费用申请,不能撤回,请先退回')
                        return
                    }
                }
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    }

    if (btn.name == 'factory_fksq_btn') {
        if ((recordset.val('开模审批') != '') && (recordset.val('审批人') == '') && (recordset.val('审请人') == username) && (recordset.val('总经理审批') == '通过') && (recordset.val('完成情况') == '完成')){ 
            _.http.post('/api/saier/factory_mold_open/button/fksq', {
                rid: recordset.val('rid'),
                kmbh : recordset.val('开模编号'),
                kmsp : recordset.val('开模审批')
            }).then(res => {
                if (res.code != 1){
                    _.ui.message.error(res.msg);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }else{
            _.ui.message.error('不能提交,请注意必需为申请人本人且总经理通过且完成情况为已完成')
        }
    }    

    if (btn.name == 'factory_tbfysq_btn') {
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后操作')
                return
            }
        }
        if ((recordset.val('审请人') == username) && (recordset.val('总经理审批') == '通过') && (recordset.val('完成情况') == '完成') && (recordset.val('是否核准') == '通过')){
            _.http.post('/api/saier/factory_mold_open/button/scfysq', {
                rid: recordset.val('rid'),
                wcqk: recordset.val('完成情况'),
                sfhz: recordset.val('是否核准'),
                kmsp: recordset.val('开模审批'),
                kmbh: recordset.val('开模编号'),
                wfgs: recordset.val('我方公司'),
                cdje: recordset.val('承担金额'),
                mjsl: recordset.val('模具数量'),
                mjcg: recordset.val('模具采购'),
                ywbm: recordset.val('业务部门'),
                cpbh: recordset.val('产品编号'),
                zwpm: recordset.val('中文品名'),
                yjjdsl: recordset.val('预计接单数量'),
                sccj: recordset.val('生产厂家')
            }).then(res => {
                if (res.code == 1) {
                    _.ui.message.success(res.msg)
                    if (res.data != '') {
                        _.platform.open_record('费用申请', res.data)
                    }
                } else {
                    _.ui.message.error(res.msg)
                }
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        }
    } 
    
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], factory_mold_open_form_BtnClick, '工厂开模')

const factory_mold_open_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'factory_gqdsq_btn',
        "caption": '退改单审请',
        "icon": 'any-keyborad',
    },{
        "name": 'factory_fksq_btn',
        "caption": '付款申请',
        "icon": 'any-keyborad',
    },{
        "name": 'factory_tbfysq_btn',
        "caption": '同步到费用申请',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], factory_mold_open_FormShow, '工厂开模')