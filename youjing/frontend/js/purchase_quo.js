// 编辑界面数据加载以后执行
const purchase_quo_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let user = _.user.username;
    _.http.post('/api/saier/purchase_quo/load/check', {
        bjry: recordset.val('采购人员')
    }).then(function (res) {
        let d = res.data;
        // console.log(d);
        recordset._list['采购报价.审批申请'] = d;

    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], purchase_quo_recordLoad, '采购报价')


function check_item_Volume(recordset, row=null, c='产品资料.包装长度cm', k='产品资料.包装宽度cm', g='产品资料.包装高度cm', t='产品资料.外箱体积m3') {
    let bzcd = recordset.value(c, row);
    let bzkd = recordset.value(k, row);
    let bzgd = recordset.value(g, row);
    let wxtj = recordset.value(t, row)
    if (row==null){
        bzcd = recordset.value(c);
        bzkd = recordset.value(k);
        bzgd = recordset.value(g);
        wxtj = recordset.value(t);
    }
    let bztj = (bzcd * bzkd * bzgd / 1000000);
    if (bztj > 0 && Number(wxtj) != 0.001) {
        let bztj1 = round(bztj, 3) * 0.2;
        if (wxtj<= 0.001) {
            recordset.val(t, 0.001, row);
        }else if (wxtj - bztj > bztj1) {
            _.ui.message.error('体积误差超20%，由系统计算');
            recordset.val(t, round(bztj, 3), row);
        } else if (bztj - wxtj > bztj1) {
            _.ui.message.error('体积误差超20%，由系统计算');
            recordset.val(t, round(bztj, 3), row);
        }
    }
}

// 编辑界面字段change后执行
const purchase_quo_field_change = (evt_id, opts) => {
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
    if (field.full_name == m + '.审批申请' && value != '') {
        let user = _.user.username;
        if (value == user) {
            _.ui.message.error('不能将自己设置为审批申请人！');
            recordset.val('审批申请', '');
            return;
        }
        let t = recordset.tables['产品资料'];
        let d = t.view_data;
        let flag = true;
        let errs = [];
        let index = 0;
        for (let r of d) {
            index += 1;
            if (r.yytp == '' || r.yytp == '[]' || r.yytp == null) {
                _.ui.message.error('请注意有没有提交图片的产品不能提交');
                flag = false;
                errs = []
                break;
            }
            if ((r.ljrk == 0 || r.zhwbgpm == '' || r.hgbm == '' || r.zhwbgpm == '无' || r.tsl == 0 || r.zzsl == 0) && r.sfhs == '是') {
                flag = false;
                errs.push(index);
            }
        }
        if (!flag) {
            recordset.val('审批申请', '');
            recordset.val('报价结果', '待审批');
            if (errs.length > 0) {
                let err_str = errs.join(',');
                _.ui.message.error('请注意' + err_str + '中文报关,开票点数,海关编码,增税,退税,有没填,不能提交');
            }
        } else {
            _.http.post('/api/saier/purchase_quo/spsq/change', {
                spsq: value
            }).catch(function (res) {
                recordset.val('审批申请', '');
                _.ui.message.error(res.msg);
                console.log(res);
            });
        }
    }    
    if (
        field.full_name == m  + '.产品资料.包装长度cm' ||
        field.full_name == m  + '.产品资料.包装高度cm' ||
        field.full_name == m  + '.产品资料.包装宽度cm'
    ) {
        let bzcd = recordset.value('产品资料.包装长度cm', row)
        let bzkd = recordset.value('产品资料.包装宽度cm', row)
        let bzgd = recordset.value('产品资料.包装高度cm', row)
        let bztj = bzcd * bzkd * bzgd / 1000000
        if (bztj != 0) {
            recordset.val(
                '产品资料.外箱体积m3',
                round(bztj,3), row
            )
        }
        if (recordset.value(
                '产品资料.外箱体积m3', row) == 0){
            recordset.val('产品资料.外箱体积m3', 0.001, row)
        }
    }
    if (field.full_name == m  + '.产品资料.客人条码') {
        let code = recordset.value('产品资料.客人条码', row)
        if (code != '' && code != null && code.length >= 7) {
            recordset.val('产品资料.客人code7', code.slice(0, 7), row)
        }
    }
    if (field.full_name == m  + '.产品资料.客户货号') {
        let krhh = recordset.value('产品资料.客户货号', row)
        let zyhh = recordset.value('产品资料.专业货号', row)
        if (
            // recordset.val('部门识别') == '1' &&
            krhh != '' &&
            krhh != null &&
            (zyhh == '' || zyhh == null)
        ) {
            _.http
                .post('/api/saier/quotation/krhh/change', {
                    khbh: recordset.val('客户编号'),
                    krhh: krhh,
                })
                .then(function (res) {
                    if (res.data != '') {
                        recordset.val('产品资料.专业货号', res.data, row)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    if (
        field.full_name == m  + '.产品资料.客户货号' ||
        field.full_name == m  + '.产品资料.专业货号'
    ) {
        let krhh = recordset.value('产品资料.客户货号', row)
        let zyhh = recordset.value('产品资料.专业货号', row)
        if (krhh != '' && krhh != null) {
            recordset.val('产品资料.产品货号1', krhh.trim(), row)
        } else if (zyhh != '' && zyhh != null) {
            recordset.val('产品资料.产品货号1', zyhh.trim(), row)
        }
    }
    if (field.full_name == m  + '.产品资料.专业货号') {
        if (recordset.value('产品资料.货号备注', row) != '') {
            if (
                recordset.value('产品资料.货号备注', row) !=
                recordset.value('产品资料.临时货号', row) &&
                recordset.value('报价来源') != '手机报价'
            )
                recordset.val('产品资料.货号备注', recordset.value('产品资料.专业货号', row), row)
        } else {
            recordset.val('产品资料.货号备注', recordset.value('产品资料.专业货号', row), row)
        }
    }
    if (field.full_name == m  + '.产品资料.代开点数') {
        let dkd = recordset.value('产品资料.代开点数', row)
        if (dkd > 1) {
            recordset.val('产品资料.代开点数', dkd / 100, row)
        }
    }
    if (field.full_name == m + '.产品资料.中文报关品名' && value != '') {
        if (
            recordset.value('产品资料.一级分类', row) == ''
        ) {
            _.http
                .post('/api/saier/quotation/bgpm/change', {
                    bgpm: recordset.value('产品资料.中文报关品名', row),
                })
                .then(function (res) {
                    if (res.data) {
                        let d = res.data
                        recordset.val('产品资料.产品大类', d.cpfl, row)
                        recordset.val('产品资料.一级分类', d.yjfl, row)
                        recordset.val('产品资料.二级分类', d.ejfl, row)
                        recordset.val('产品资料.三级分类', d.sjfl, row)
                        recordset.val('产品资料.分类名称', d.flmc, row)
                        // recordset.val('产品资料.产品类别', d.cplb)
                    }
                })
                .catch((err) => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
        }
    }
    // if (field.full_name == m  + '.产品资料.产品大类') {
    //     let cpfl = recordset.val('产品资料.产品大类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
    //     }
    // }
    // if (field.full_name == m  + '.产品资料.一级分类') {
    //     let cpfl = recordset.val('产品资料.一级分类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
    //     }
    // }
    // if (field.full_name == m  + '.产品资料.二级分类') {
    //     let cpfl = recordset.val('产品资料.二级分类')
    //     if (cpfl != '') {
    //         recordset.val(
    //             '产品资料.分类名称',
    //             recordset.val('产品资料.产品大类') +
    //             '\\' +
    //             recordset.val('产品资料.一级分类') +
    //             '\\' +
    //             recordset.val('产品资料.二级分类'),
    //         )
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
                // recordset.val('产品资料.产品类别', cpfl, row);
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
            // recordset.val('产品资料.产品类别', '');
            recordset.val('产品资料.三级分类', '', row);
            recordset.val('产品资料.二级分类', '', row);
            recordset.val('产品资料.一级分类', '', row);
        }
    }
    if (field.full_name == m + '.产品资料.一级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        if (cpfl != '' && yjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl, row);
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
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
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
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl, row);
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
    if (field.full_name == m + '.产品资料.三级分类') {
        let cpfl = recordset.value('产品资料.产品大类', row);
        let yjfl = recordset.value('产品资料.一级分类', row);
        let ejfl = recordset.value('产品资料.二级分类', row);
        let sjfl = recordset.value('产品资料.三级分类', row);
        if (cpfl != '' && yjfl != '' && ejfl != '' && sjfl != '') {
            _.http.post('/api/saier/items/cpfl/check', {
                cpfl: cpfl,
                yjfl: yjfl,
                ejfl: ejfl,
                sjfl: sjfl
            }).then(res => {
                let d = res.data
                recordset.val('产品资料.分类名称', cpfl + '\\' + yjfl + '\\' + ejfl + '\\' + sjfl, row);
                if ((recordset.value('产品资料.三级分类', row) != '') && d.sjfl.indexOf(recordset.value('产品资料.三级分类', row)) == -1) {
                    recordset.val('产品资料.三级分类', '', row);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                recordset.val('产品资料.三级分类', '', row);
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
            recordset.val('产品资料.分类名称', fl_list.join('\\'), row);
        }
    }
    if (field.full_name == m  + '.产品资料.克    重' || field.full_name == m  + '.产品资料.外箱装箱量' || field.full_name == m  + '.产品资料.外箱体积m3'
    ) {
        if (
            recordset.value('产品资料.外箱装箱量', row) > 0 &&
            recordset.value('产品资料.克    重', row) > 0
        ) {
            if (
                recordset.value('产品资料.毛    重', row) == 0 &&
                recordset.value('产品资料.外箱体积m3', row) > 0
            ) {
                let xm = '1'
                _.http
                    .post('/api/saier/items/get/size', {
                        xm: xm,
                        sz: recordset.value('产品资料.外箱体积m3', row),
                    })
                    .then(function (res) {
                        if (res.data.f && res.data.f == 0) {
                            recordset.val(
                                '产品资料.毛    重',
                                (recordset.value('产品资料.外箱装箱量', row) *
                                    recordset.value('产品资料.克    重', row)) /
                                1000 + res.data.v, row
                            )
                        } else {
                            recordset.val(
                                '产品资料.毛    重',
                                (recordset.value('产品资料.外箱装箱量', row) *
                                    recordset.value('产品资料.克    重', row)) /
                                1000 + 1, row
                            )
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                    })
            }
            if (recordset.value('产品资料.净    重', row) == 0) {
                recordset.val(
                    '产品资料.净    重',
                    (recordset.value('产品资料.外箱装箱量', row) *
                        recordset.value('产品资料.克    重', row)) /
                    1000, row
                )
            }
        }
    }
    if (field.full_name == m  + '.产品资料.毛    重' || field.full_name == m  + '.产品资料.外箱体积m3'
    ) {
        if (recordset.value('产品资料.外箱体积m3', row) > 0) {
            recordset.val(
                '产品资料.小柜箱数',
                Math.trunc(28 / recordset.value('产品资料.外箱体积m3', row)),
            )
            recordset.val(
                '产品资料.平柜箱数',
                Math.trunc(58 / recordset.value('产品资料.外箱体积m3', row)),
            )
            recordset.val(
                '产品资料.高柜箱数',
                Math.trunc(68 / recordset.value('产品资料.外箱体积m3', row)),
            )
            recordset.val(
                '产品资料.冷冻柜箱数',
                Math.trunc(58 / recordset.value('产品资料.外箱体积m3', row)),
            )
            recordset.val(
                '产品资料.超高柜箱数',
                Math.trunc(76 / recordset.value('产品资料.外箱体积m3', row)),
            )
        }
        if (recordset.value('产品资料.毛    重', row) > 0) {
            if (!item_weight_check(recordset.value('产品资料.净    重', row), recordset.value('产品资料.毛    重', row))) {
                _.ui.message.error('净重不能大于毛重');
                recordset.val('产品资料.毛    重', 0, row);
            }
        }
    }
    if (field.full_name == m + '.产品资料.净    重' && value != 0 && recordset.value('产品资料.毛    重', row) != 0) {
        if (!item_weight_check(recordset.value('产品资料.净    重', row), recordset.value('产品资料.毛    重', row))) {
            _.ui.message.error('净重不能大于毛重');
            recordset.val('产品资料.净    重', 0, row);
        }
    }
    if (field.full_name == m  + '.产品资料.外箱体积m3') {
        check_item_Volume(recordset, row)
    }
    if (field.full_name == m + '.产品资料.是否含税') {
        if (recordset.value('产品资料.是否含税', row) != '是') {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
        }
    }
    if (field.full_name == m + '.产品资料.增值税率') {
        if (recordset.value('产品资料.是否含税', row) != '是'  && recordset.value('产品资料.增值税率', row) != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，增值税率必须为0');
        }
    }
    if (field.full_name == m + '.产品资料.退 税 率') {
        if (recordset.value('产品资料.是否含税', row) != '是' && recordset.value('产品资料.退 税 率', row) != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，退税率必须为0');
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, purchase_quo_field_change, '采购报价')


const purchase_quo_workflow_after_start = (evt_id, form) => {
    _.http.post('/api/saier/purchase_quo/workflow/start', {
        rid: form.current_rid.value,
        module: form.module.name
    }).then(res => {

    }).catch(res => {
        _.ui.message.error(res.msg);
        console.error(res.msg);
    })
}
_.evts.on(_.evtids.WORKFLOW_AFTER_START, purchase_quo_workflow_after_start, '采购报价')


const purchase_quo_after_save = (evt_id, recordset) => {
    _.http.post('/api/saier/purchase_quo/after/save', {
        rid: recordset.val('rid'),
        ywry: recordset.val('业务人员'),
    }).then(res => {

    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
    if (recordset.val('wf_status') == 1 || recordset.val('wf_status') == 2) return
    if (recordset.val('审批申请') == '') return
    _.ui.confirm('是否提交审批？').then(() => {
        _.http.post('/api/saier/workflow/start', {
            rid: recordset.val('rid'),
            module: recordset.module.name,
            flow_name: '采购报价'
        }).then(res => {
            recordset.val('wf_status', 1)
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, purchase_quo_after_save, '采购报价')


// 查询界面或编辑界面打开事件
const purchase_quo_Form_Show = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'modify_apply_btn',
        "caption": '改单申请',
        "icon": 'any-server-update',
        "divided": true
    })
    btns.push({
        "name": 'special_apply_btn',
        "caption": '特殊改单申请',
        "icon": 'any-server-update',
        "divided": true
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], purchase_quo_Form_Show, '采购报价')


const purchase_quo_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = [];
        btns.push({
            "name": 'items_update_btn',
            "caption": '专业产品更新',
            "icon": 'any-server-update',
        });
        form.toolbar.add([{
            "name": 'import_photo_btn',
            "caption": '含图Excel导入',
            "icon": 'any-server-update',
        }]);
        form.toolbar.add([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], purchase_quo_EditorChildShow, '采购报价')

const purchase_quo_form_BtnClick = (evt_id, btn, form) => {
    let recordset = form.recordset;
    if (btn.name == 'import_photo_btn') {
        _.ui.show_dialog('photo_from_excel', {
            "rid": form.current_rid,
            "group": '采购报价.产品资料',
            "option": 'append',
            "kfield": 'xjhh',
            "pfield": 'yytp'
        });
    };
    if (btn.name == 'items_update_btn') {
        if (recordset.val('适合市场') == '') {
            _.ui.message.error('不好意思,请先输入适合市场内容,谢谢');
            return;
        }
        _.ui.confirm('专业产品更新会覆盖现有的专业产品数据，是否继续？').then(() => {
            _.ui.show_loading_dialog('正在更新专业产品')
            _.http.post('/api/saier/quotation/items/new', {
                wfgs_n: form.recordset.val('我方公司'),
                rid: form.recordset.val('rid'),
                shsc: form.recordset.val('适合市场'),
                bjry: form.recordset.val('采购人员'),

                lines: form.recordset.tables['产品资料'].view_data
            }).then(res => {
                _.ui.message.success('操作成功');
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            }).finally(() => {
                _.ui.hide_loading_dialog('正在更新专业产品')
            })
        })
    };
    if (btn.name == 'modify_apply_btn') {
        _.http.post('/api/saier/quotation/get/status', {
            rid: form.current_rid.value,
            module: form.module.name
        }).then(res => {
            _.ui.show_input_dialog('请输入改单原因', '').then(val => {
                _.http.post('/api/saier/quotation/modify/apply', {
                    val: val,
                    flag: 0,
                    module: form.module.name,
                    rid: form.current_rid.value,
                    key_field: '报价单号',
                    title: '采购报价:[报价单号]' + '需修改重新审批',
                    content: _.user.username + '的采购报价:[报价单号]申请重新审批,原因:' + val,
                    kind: '改单申请'
                }).then(r => {
                    _.ui.message.success('改单申请已提交');
                }).catch(r => {
                    console.log(r)
                    _.ui.message.error(r.msg)
                });
            });
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        });
    }
    if (btn.name == 'special_apply_btn') {
        _.http.post('/api/saier/quotation/get/status', {
            rid: form.current_rid.value,
            module: form.module.name
        }).then(res => {
            _.ui.show_input_dialog('请输入改单原因', '').then(val => {
                _.http.post('/api/saier/quotation/modify/apply', {
                    val: val,
                    flag: 1,
                    module: form.module.name,
                    rid: form.current_rid.value,
                    key_field: '报价单号',
                    title: '采购报价:[报价单号]' + '要特殊改单申请',
                    content: _.user.username + '的采购报价:[报价单号]申请特殊改单,原因:' + val,
                    kind: '改单申请'
                }).then(r => {
                    _.ui.message.success('改单申请已提交');
                }).catch(r => {
                    console.log(r)
                    _.ui.message.error(r.msg)
                });
            });
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], purchase_quo_form_BtnClick, '采购报价')

// 编辑界面记录保存前执行
const purchase_quo_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/purchase_quo/before/save', {
            rid: recordset.val('rid'),
            spsq: recordset.val('审批申请'),
            ywry: recordset.val('业务人员'),
            cgry: recordset.val('采购人员'),
            delete_rids: recordset.tables['产品资料'].delete_rids
        }).then(res => {
            let d = res.data;
            if (d) {
                recordset.val('是否免审', d);
            }
            let t = recordset.tables['产品资料'];
            let v = t.view_data;
            let i = 0;
            for (let r of v) {
                i += 1;
                let sfhs = r.sfhs;
                let zzsl = r.zzsl;
                let tsl = r.tsl;
                let hgbm = r.hgbm;
                let zhwbgpm = r.zhwbgpm;
                let bgjldw = r.bgjldw;
                if (sfhs == '是' && (zzsl == 0 || tsl == 0 || zzsl == null || tsl == null || zhwbgpm == '' || hgbm == '' || zhwbgpm == '无' || bgjldw == '' || bgjldw == null || zhwbgpm == null || hgbm == null)) {
                    _.ui.message.error('产品资料第' + i + '行是否含税等于【是】，增税率、退税率、报关单位、中文报关品名、海关编码为空或者为0,保存被取消');
                    reject();
                    return;
                }
                if (sfhs != '是' && tsl != 0 && zzsl != 0 && tsl != null && zzsl != null){
                    // && (zhwbgpm != '' &&  zhwbgpm == '无' &&  zhwbgpm != null && tsl != 0 && zzsl != 0 && hgbm != '' && hgbm == null && tsl != null && zzsl != null && bgjldw != '' && bgjldw != null)) {
                    _.ui.message.error('产品资料第' + i + '行是否含税等于【否】，增税率、退税率必须为0,保存被取消');
                    reject();
                    return;
                }
            }
            resolve();
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg);
            reject();
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, purchase_quo_before_save, '采购报价')


// 记录删除前执行
const purchase_quo_before_delete = (evt_id, rid, form) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/purchase_quo/before/delete', {
            rid: rid
        }).then(res => {
            resolve();
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg);
            reject();
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_DELETE, purchase_quo_before_delete, '采购报价')
