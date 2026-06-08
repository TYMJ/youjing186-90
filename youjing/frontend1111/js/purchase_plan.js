const purchase_plan_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('唯一字段') == '') {
            recordset.val('唯一字段', recordset.val('rid'))
        }
        let username = _.user.username
        let m = recordset.module.name
        if (recordset.val('计划确认') == '通过' || recordset.val('计划确认') == '不通过') {
            if (recordset.val('制单日期') == '' || recordset.val('制单日期') == null) {
                recordset.val('制单日期', new Date().format('yyyy-MM-dd'))
            }
        }
        _.http.post('/api/saier/purchase_plan/save/before', {
            rid: recordset.val('rid'),
            khmc: recordset.val('客户名称'),
            jhqr: recordset.val('计划确认'),
            spsq: recordset.val('审核申请'),
        }).then(res => {
            let d = res.data
            let sqry = recordset.val('审核申请');
            let cywyzdsl = 0;
            let gssb = d.gssb;
            let gsmc = d.gsmc;
            let hthm = recordset.val('合同号码')
            if (hthm != "" && hthm.indexOf('CSD-') != -1) {
                recordset.val('我方公司', '宁波可思达进出口有限公司');
            } else {
                if (gssb != 1 && gsmc && gsmc != '') {
                    recordset.val('我方公司', gsmc)
                }
            }
            let cdsb = d.cdsb
            if (cdsb == 0) {
                if ((recordset.val('计划确认') == '通过') && (recordset.val('审核申请') == username)) {
                    if (recordset.val('宁波合同数') > 0 && recordset.val('宁波合同') == '') {
                        _.ui.message.error('请注意宁波合同末提交采购主管');
                    };
                    if (recordset.val('义乌合同数') > 0 && recordset.val('义乌合同') == '') {
                        _.ui.message.error('请注意义乌合同末提交采购主管');
                    };
                    if (recordset.val('汕头合同数') > 0 && recordset.val('汕头合同') == '') {
                        _.ui.message.error('请注意汕头合同末提交采购主管');
                    };
                };
                recordset.val('竞价识别', '123');
                if (recordset.val('业务人员') == username) {
                    recordset.module.field_by_full_name(m + '.审核申请').disabled = false
                }
                let ywhts = 0;
                let nbhts = 0;
                let sthts = 0;
                let jh_data = d.jh_data
                let xgsb = d.xgsb
                if (recordset.val('完成查看') == '锁定') {
                    _.ui.message.error('合同分配人员不必保存信息,直接关闭便可');
                    xgsb = 1;
                } else {
                    if (jh_data) {
                        if (jh_data.nbht != '' || jh_data.stht != '' || jh_data.ywht != '') {
                            if (jh_data.nbht == username || jh_data.stht == username || jh_data.ywht == username) {
                                _.ui.message.error('合同分配人员不必保存信息,直接关闭便可');
                                xgsb = 1;
                                reject()
                                return
                            } else {
                                if (jh_data.tjsh == username) {
                                    _.ui.message.error('合同已提交采购主管,不能修改');
                                    xgsb = 1;
                                    reject()
                                    return
                                } else if (jh_data.tjsh != '') {
                                    _.ui.message.error('合同已提交,不能修改');
                                    xgsb = 1;
                                    reject()
                                    return
                                }
                            }
                        } else {
                            if (jh_data.tjsh != username && jh_data.tjsh != '') {
                                _.ui.message.error('合同已提交,不能修改');
                                xgsb = 1;
                                reject()
                                return
                            }
                        }
                    }
                }
                recordset.val('完成查看', '');
                if (xgsb == 0) {
                    recordset.val('修改人员', username + recordset.val('计划确认'));
                    if (sqry != '') {
                        recordset.val('审核申请1', recordset.val('审核申请'));
                    }
                    let qss = [];
                    let qs = [];
                    let i = 0;
                    let i1 = 0;
                    let sfsq = [];
                    let qs2 = [];
                    let qs1 = [];
                    let jzz = [];
                    let t = recordset.tables['产品资料'];
                    let v = t.view_data;
                    let khmc = recordset.val('客户名称');
                    for (let r of v) {
                        i = i + 1;
                        let jz = 0;
                        let xdsl1 = 0;
                        if ((r.htrq == '' || r.htrq == null) && recordset.val('计划确认') != '通过') {
                            r.htrq = new Date().format('yyyy-MM-dd');
                        }
                        if (khmc.indexOf('BEST PRICE') != -1 || khmc.indexOf('SIA FP LV') != -1 || khmc.indexOf('Fix Price General Trading LLC') != -1 || khmc == '') {

                        } else {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.最低毛利率').db.name] == 0.15) {
                                r[recordset.module.field_by_full_name(m + '.产品资料.最低毛利率').db.name] = 0;;
                            };
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.是否赔款').db.name] == '是') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.特殊报价').db.name] = '是';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.可否重复').db.name] != '可以') {
                            jz = jzz.indexOf(r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name] +
                                ';' + r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name]);
                            if (jz == -1) {
                                jzz.push(r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] +
                                    ';' + r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name]);
                            } else {
                                cywyzdsl = cywyzdsl + 1;
                            }
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] == 0) {
                            qss.push('请注意第' + i + '条记录下单数量为0');
                        }
                        if (recordset.val('产品计划') != '是' && recordset.val('产品计划') != '是1') {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.合同号码').db.name] != recordset.val('外销合同')) {
                                qs2.push('请注意第' + i + '条记录合同号' + r[recordset.module.field_by_full_name(m + '.产品资料.合同号码').db.name] + '和外销合同不符');
                            }
                        }
                        r[recordset.module.field_by_full_name(m + '.产品资料.图片货号').db.name] = username + new Date().format('yyyyMMdd hhmmss') + ';' + i;
                        xdsl1 = r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name] * r[recordset.module.field_by_full_name(m + '.产品资料.外箱装箱量').db.name];
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name] > 0 && r[recordset.module.field_by_full_name(m + '.产品资料.外箱装箱量').db.name] > 0 && r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] != xdsl1) {
                            r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] = xdsl1;
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name] == 0 && r[recordset.module.field_by_full_name(m + '.产品资料.外箱装箱量').db.name] > 0 && r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] > 0) {
                            r[recordset.module.field_by_full_name(m + '.产品资料.下单箱数').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name] / r[recordset.module.field_by_full_name(m + '.产品资料.外箱装箱量').db.name];
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.是否授权').db.name] == '是') {
                            sfsq.push('授权货号:' + r[recordset.module.field_by_full_name(m + '.产品资料.专业货号').db.name]);
                        }
                        let sl6 = r[recordset.module.field_by_full_name(m + '.产品资料.合同数量').db.name];
                        sl6 = sl6 - r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name];
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '义乌' && r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] != '待定' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '待定') {
                            ywhts = ywhts + 1;
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '宁波' && r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] != '待定' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '待定') {
                            nbhts = nbhts + 1;
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '汕头' && r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] != '待定' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '待定') {
                            sthts = sthts + 1;
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.最低毛利率').db.name] != 0 && r[recordset.module.field_by_full_name(m + '.产品资料.最低毛利率').db.name] > r[recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').db.name]) {
                            r[recordset.module.field_by_full_name(m + '.产品资料.低成本确认').db.name] = '否';
                            qs1.push('请注意产品:' + r[recordset.module.field_by_full_name(m + '.产品资料.专业货号').db.name] + '的毛利低于' + r[recordset.module.field_by_full_name(m + '.产品资料.最低毛利率').db.name] + '请记得填写成本核算表');
                        } else {
                            r[recordset.module.field_by_full_name(m + '.产品资料.低成本确认').db.name] = '是';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] == '') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] = '待定';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] == '') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = '待定';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name] != '' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name] != '') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name] = '';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家').db.name] != '' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家').db.name] = '';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] == '待定') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] = '待定';
                            r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name] = '';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] != '待定' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '待定' && r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] != '待定') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.是否确认').db.name] = '是';
                        } else {
                            r[recordset.module.field_by_full_name(m + '.产品资料.是否确认').db.name] = '否';
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '' && r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] != '待定') {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.工厂评分').db.name] < 60) {
                                if (recordset.val('我方公司') == '宁波优景进出口有限公司') {
                                    r[recordset.module.field_by_full_name(m + '.产品资料.是否确认').db.name] = '否';
                                    qs.push('请注意产品:' + r[recordset.module.field_by_full_name(m + '.产品资料.专业货号').db.name] + '的工厂评分低于60!');
                                }
                            }
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.是否赔款').db.name] == '否') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name];
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name] == 0) {
                            r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name];
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.计划唯一').db.name] == '') {
                            r[recordset.module.field_by_full_name(m + '.产品资料.计划唯一').db.name] = i + username + recordset.val('合同号码') + new Date().format('yyyy-MM-dd hh:mm:ss');
                            let bjpath = '';
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.报价path').db.name] != '') {
                                bjpath = r[recordset.module.field_by_full_name(m + '.产品资料.报价path').db.name].substring(1, r[recordset.module.field_by_full_name(m + '.产品资料.报价path').db.name].length - 1);
                            }
                            r[recordset.module.field_by_full_name(m + '.产品资料.报价path').db.name] = bjpath;
                        }
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.计划唯一').db.name] != '') {
                            i1 = i1 + 1;
                        }
                        t.push_modi_rid(r.rid);
                    }
                    if (qs.length != 0 || (qs1.length != 0) || (qs2 != 0) || (qss != 0)) {
                        recordset.val('多下清单', qs.join(';') + '\r\n' + qs1.join(';') + '\r\n' + qs2.join(';') + '\r\n' + qss.join(';'));
                    } else {
                        recordset.val('多下清单', '');
                    }
                    t.sync_operate_data();
                    recordset.do_re_sum_by_trigger_table('产品资料');
                    t.modified = true;
                    let w = recordset.tables['完成资料'];
                    let y = w.view_data;
                    for (let r of y) {
                        if (r[recordset.module.field_by_full_name(m + '.完成资料.可否重复').db.name] != '可以') {
                            jz = jzz.indexOf(r[recordset.module.field_by_full_name(m + '.完成资料.外销唯一字段').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.专业厂家id').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.下单数量').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.采购总额').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.下单箱数').db.name]);
                            if (jz < 0) {
                                jzz.add(r[recordset.module.field_by_full_name(m + '.完成资料.外销唯一字段').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.专业厂家id').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.下单数量').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.采购总额').db.name] + ';' + r[recordset.module.field_by_full_name(m + '.完成资料.下单箱数').db.name]);
                            } else {
                                cywyzdsl = cywyzdsl + 1;
                            }
                        }
                    }
                    recordset.val('授权产品', sfsq.join(';'));
                    if (i1 == 0) {
                        recordset.val('完成情况', '已完成');
                    } else {
                        recordset.val('完成情况', '未完成');
                    }
                    recordset.val('义乌合同数', ywhts);
                    recordset.val('宁波合同数', nbhts);
                    recordset.val('汕头合同数', sthts);
                    recordset.val('web判断', '是');
                    if (recordset.val('多下清单') != '') {
                        _.ui.message.error(recordset.val('多下清单') + '\r\n' + '请注意以上产品不能下单!!!');
                    }
                    if (cywyzdsl > 0) {
                        _.ui.message.error('有重复数据' + cywyzdsl + '条请注意');
                        reject()
                        return
                    }
                    recordset.val('竞价识别', '');
                } else {
                    recordset.val('竞价识别', '');
                }
            } else {
                _.ui.message.error('不好意思,业务撤单，不能保存!');
                reject()
                return
            }
            resolve()
        }).catch(err => {
            console.log(err)
            reject(err)
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, purchase_plan_before_save, '采购计划')


// 编辑界面数据加载以后执行
const purchase_plan_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username;
    _.http.post('/api/saier/purchase_plan/load/check', {
        rid: recordset.val('rid')
    }).then(res => {
        let d = res.data
        let zjl = d.zjl;
        let path = d.path;
        let position = d.position;
        let empty = d.empty;
        let cgsb = 0;
        let sb12 = '';
        let wxsb = 0;
        // let t = recordset.tables['产品资料'];
        // let v = t.view_data;
        // if (recordset.val('产品计划') == '是1') {
        //     for (let r of v) {
        //         if (r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段').db.name] != '') {
        //             let wxwyzd = r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段').db.name];
        //             r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段').db.name] = '';
        //             r[recordset.module.field_by_full_name(m + '.产品资料.外销唯一字段1').db.name] = wxwyzd;
        //         };
        //     };
        //     recordset.val('产品计划', '是');
        // };
        if (recordset.val('业务人员') != username || recordset.val('审核申请') != '') {
            recordset.tables['产品资料']._.toolbar.show('new', false);
            recordset.tables['产品资料']._.toolbar.show('delete', false);
        };
        if (recordset.val('审核申请') == '') {
            recordset.val('宁波合同', '');
            recordset.val('义乌合同', '');
            recordset.val('汕头合同', '');
        } else {
            if (recordset.val('审核申请') == username) {
                recordset.module.field_by_full_name(m + '.宁波合同').disabled = (recordset.val('宁波合同数') == 0);
                recordset.module.field_by_full_name(m + '.义乌合同').disabled = (recordset.val('义乌合同数') == 0);
                recordset.module.field_by_full_name(m + '.汕头合同').disabled = (recordset.val('汕头合同数') == 0);
            }
        }
        recordset.module.field_by_full_name(m + '.产品资料.采购主管确认').hide();
        if (recordset.val('宁波合同') == username || recordset.val('义乌合同') == username || recordset.val('汕头合同') == username) {
            recordset.module.field_by_full_name(m + '.完成查看').hide();
            recordset.module.field_by_full_name(m + '.产品资料.采购主管确认').show()
        };

        if (recordset.val('我方公司') == '') {
            recordset.val('我方公司', '宁波优景进出口有限公司');
        }
        if (recordset.val('合同号码') == '') {
            recordset.module.field_by_full_name(m + '.审核申请').disabled = true
        }
        if (empty == false) {
            if (position.indexOf('外销') >= 0) {
                wxsb = 1;
            } else {
                recordset.module.field_by_full_name(m + '.产品资料.赔款单价').hide();
                recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').hide();
                recordset.module.field_by_full_name(m + '.产品资料.客户RMB单价').hide();
                recordset.module.field_by_full_name(m + '.产品资料.外销单价').hide();
                recordset.module.field_by_full_name(m + '.产品资料.跟单提成').hide();
                recordset.module.field_by_full_name(m + '.产品资料.采购提成').hide();
                recordset.module.field_by_full_name(m + '.产品资料.外销总额').hide();
                if (recordset.val('宁波合同') != username && recordset.val('义乌合同') != username && recordset.val('汕头合同') != username) {
                    recordset.module.group_by_name('产品资料').visible = false;
                    recordset.module.field_by_full_name(m + '.完成查看').disabled = true
                    recordset.module.group_by_name('完成资料').visible = false;
                    recordset.module.group_by_name('备注信息').visible = false;
                    recordset.module.field_by_full_name(m + '.详情查看').disabled = true
                    recordset.module.field_by_full_name(m + '.出运查看').disabled = true
                    recordset.module.field_by_full_name(m + '.计划确认').disabled = true
                    recordset.module.field_by_full_name(m + '.宁波合同').disabled = true
                    recordset.module.field_by_full_name(m + '.义乌合同').disabled = true
                    recordset.module.field_by_full_name(m + '.汕头合同').disabled = true
                    recordset.module.field_by_full_name(m + '.审核申请').disabled = true
                    recordset.module.field_by_full_name(m + '.合同号码').disabled = true
                    recordset.module.field_by_full_name(m + '.外销合同').disabled = true
                    cgsb = 1;
                }
            }
        }
        if (cgsb !== 1) {
            recordset.module.group_by_name('完成资料').visible = false;
            let yw1 = 0;
            let st1 = 0;
            let nb1 = 0;
            let zjl1 = 0;
            let spsq = 0;
            let a = 0;
            if ((recordset.val('我方公司') == '宁波优景进出口有限公司') || (recordset.val('审核申请') !== '')) {
                recordset.module.field_by_full_name(m + '.预计船期').disabled = true
            }
            if (recordset.val('审核申请') !== '') {
                recordset.module.field_by_full_name(m + '.合同类型').disabled = true
                recordset.module.field_by_full_name(m + '.提前天数').disabled = true
            }
            // 这三个查看的作用是什么？
            // recordset.val('完成查看', '否');
            // recordset.val('详情查看', '否');
            // recordset.val('出运查看', '否');
            let yw = recordset.val('业务');
            recordset.module.field_by_full_name(m + '.计划确认').disabled = true
            recordset.module.field_by_full_name(m + '.宁波合同').disabled = true
            recordset.module.field_by_full_name(m + '.义乌合同').disabled = true
            recordset.module.field_by_full_name(m + '.汕头合同').disabled = true
            recordset.module.field_by_full_name(m + '.产品资料.采购单价1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.采购原价1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.采购总额1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.厂商编号1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.生产厂家1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.专业厂家id1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.专业厂家1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.工厂电话1').hide();
            recordset.module.field_by_full_name(m + '.产品资料.联 系 人1').hide();

            if (recordset.val('审核申请') !== '') {
                recordset.module.field_by_full_name(m + '.产品资料.跟单人员').disabled = true
            } else {
                recordset.module.field_by_full_name(m + '.产品资料.跟单人员').disabled = false;
            }
            if (yw === '') {
                recordset.module.field_by_full_name(m + '.计划确认').disabled = true
                recordset.module.field_by_full_name(m + '.宁波合同').disabled = true
                recordset.module.field_by_full_name(m + '.义乌合同').disabled = true
                recordset.module.field_by_full_name(m + '.汕头合同').disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.是否确认').disabled = true
                recordset.module.field_by_full_name(m + '.产品资料.低成本确认').disabled = true
            } else {
                if (recordset.val('审核申请') == username) {
                    spsq = 1;
                    recordset.module.field_by_full_name(m + '.计划确认').disabled = false;
                    if (recordset.val('计划确认') == '通过') {
                        if ((recordset.val('宁波合同') == '') && (recordset.val('宁波合同数') > 0)) {
                            recordset.module.field_by_full_name(m + '.宁波合同').disabled = false;
                        }
                        if ((recordset.val('汕头合同') == '') && (recordset.val('汕头合同数') > 0)) {
                            recordset.module.field_by_full_name(m + '.汕头合同').disabled = false;
                        }
                        if ((recordset.val('义乌合同') == '') && (recordset.val('义乌合同数') > 0)) {
                            recordset.module.field_by_full_name(m + '.义乌合同').disabled = false;
                        }
                    }
                    recordset.module.field_by_full_name(m + '.未批原因').disabled = false;
                } else {
                    recordset.module.field_by_full_name(m + '.计划确认').disabled = true
                    recordset.module.field_by_full_name(m + '.宁波合同').disabled = true
                    recordset.module.field_by_full_name(m + '.义乌合同').disabled = true
                    recordset.module.field_by_full_name(m + '.汕头合同').disabled = true
                    recordset.module.field_by_full_name(m + '.未批原因').disabled = true
                };
                if (recordset.val('审核申请') !== '') {
                    recordset.module.field_by_full_name(m + '.审核申请').disabled = true
                    recordset.module.field_by_full_name(m + '.合同号码').disabled = true
                    recordset.module.field_by_full_name(m + '.外销合同').disabled = true
                    recordset.module.field_by_full_name(m + '.佣金点数').disabled = true
                    recordset.module.field_by_full_name(m + '.采购合同期限').disabled = true
                    recordset.module.field_by_full_name(m + '.外销部门').disabled = true
                    recordset.module.field_by_full_name(m + '.正面唛头').disabled = true
                    recordset.module.field_by_full_name(m + '.侧面唛头').disabled = true
                    recordset.module.field_by_full_name(m + '.合同备注').disabled = true
                    recordset.module.field_by_full_name(m + '.装柜备注').disabled = true
                };
                if (recordset.val('宁波合同') == username) {
                    a = a + 1;
                    nb1 = nb1 + 1;
                }
                if (recordset.val('义乌合同') == username) {
                    a = a + 1;
                    yw1 = yw1 + 1;
                }
                if (recordset.val('汕头合同') == username) {

                    a = a + 1;
                    st1 = st1 + 1;
                }
                if (recordset.val('审核申请') == username) {
                    zjl1 = zjl1 + 1;
                }
                if ((nb1 == 1) || (yw1 == 1) || (st1 == 1)) {
                    if (zjl !== username) {
                        recordset.module.field_by_full_name(m + '.详情查看').hide();
                        recordset.module.field_by_full_name(m + '.出运查看').hide();
                        recordset.module.field_by_full_name(m + '.完成查看').hide();
                        recordset.module.field_by_full_name(m + '.佣金点数').disabled = true
                        recordset.module.field_by_full_name(m + '.采购合同期限').disabled = true
                        recordset.module.field_by_full_name(m + '.外销部门').disabled = true
                        recordset.module.field_by_full_name(m + '.正面唛头').disabled = true
                        recordset.module.field_by_full_name(m + '.侧面唛头').disabled = true
                        recordset.module.field_by_full_name(m + '.合同备注').disabled = true
                        recordset.module.field_by_full_name(m + '.装柜备注').disabled = true
                        recordset.module.field_by_full_name(m + '.产品资料.采购原价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.采购单价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.代开金额').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.代开点数').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.采购总额').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.厂商编号').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.生产厂家').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.厂商编号1').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.生产厂家1').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.专业厂家').hide();

                        recordset.module.field_by_full_name(m + '.产品资料.客户RMB单价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.工厂电话').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.联 系 人').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.采购单价1').show()
                        recordset.module.field_by_full_name(m + '.产品资料.采购总额1').show()


                        recordset.module.field_by_full_name(m + '.产品资料.专业厂家id1').show()
                        recordset.module.field_by_full_name(m + '.产品资料.专业厂家1').show()
                        recordset.module.field_by_full_name(m + '.产品资料.采购原价1').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.工厂电话1').show()
                        recordset.module.field_by_full_name(m + '.产品资料.联 系 人1').show()
                        recordset.module.field_by_full_name(m + '.产品资料.跟单人员').disabled = false;
                        recordset.module.field_by_full_name(m + '.产品资料.赔款单价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.外销单价').hide();
                        recordset.module.field_by_full_name(m + '.产品资料.外销总额').hide();

                    };
                    recordset.module.field_by_full_name(m + '.产品资料.跟单提成').hide();
                    recordset.module.field_by_full_name(m + '.产品资料.采购提成').hide();
                    recordset.module.field_by_full_name(m + '.产品资料.跟单提成').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购提成').disabled = true
                } else {
                    recordset.module.field_by_full_name(m + '.产品资料.是否确认').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.低成本确认').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.是否生成').hide();
                };
                if (recordset.val('审核申请') !== '') {
                    if (zjl1 > 0) {
                        if ((nb1 === 0) || (yw1 === 0) || (st1 === 0)) {
                            recordset.module.field_by_full_name(m + '.产品资料.跟单人员').disabled = false;
                        };
                    } else {
                        recordset.module.field_by_full_name(m + '.产品资料.是否确认').disabled = true
                        recordset.module.field_by_full_name(m + '.产品资料.低成本确认').disabled = true
                    };
                    if (spsq == 0) {
                        recordset.module.field_by_full_name(m + '.产品资料.交货日期').disabled = true
                    };
                    recordset.module.field_by_full_name(m + '.产品资料.预计船期').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品编号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.临时货号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.自编货号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.专业货号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品规格').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.客户货号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.开票点数').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.规格英语').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.工厂货号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.开模编号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.下单地点').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.入库地点').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.英文品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.颜    色').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.英文品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.颜    色').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.颜色英文').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.款  式').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.货币代码').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外销单价').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购提成').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.跟单提成').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购原价').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.客户RMB单价').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.箱    数').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.增值税率').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.内盒装箱量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.内盒/外箱').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外箱装箱量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.合同数量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.计量单位').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外销总额').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购总额').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.厂商编号').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.生产厂家').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').disabled = true

                    recordset.module.field_by_full_name(m + '.产品资料.专业厂家').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.是否开模').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装单位').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.毛    重').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.总 毛 重').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.净    重').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.总 净 重').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文包装').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.英文包装').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装长度').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装宽度').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装高度').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外箱体积').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.总 体 积').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.出货数量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.未出数量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.下单箱数').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.下单数量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.待订数量').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.退 税 率').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.统计条件').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.克    重').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.材质中文').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.材质英语').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.材质外语').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.测试种类').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.是否赔款').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.报关单位').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.开票工厂').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.目的仓库').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.是否授权').disabled = true

                    if (a == 0) {
                        recordset.module.field_by_full_name(m + '.产品资料.采购人员').disabled = true
                    } else {
                        recordset.module.field_by_full_name(m + '.产品资料.采购人员').disabled = true
                        recordset.module.field_by_full_name(m + '.产品资料.是否确认').disabled = false;
                        recordset.module.field_by_full_name(m + '.产品资料.低成本确认').disabled = false;
                    };
                    recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.出货样要求').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.验 货 费').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装费用').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.优惠金额').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.交货天数').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品尺寸').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.top材质').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.bottom材质').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.内部材质').disabled = true

                    recordset.module.field_by_full_name(m + '.产品资料.其它材质').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.厚    度').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.壁    厚').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.底    厚').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文尺寸').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.英文尺寸').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.工厂电话').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.联 系 人').disabled = true
                    // recordset.module.field_by_full_name(m + '.产品资料.内 盒').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.备注英').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品大类').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.一级分类').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.二级分类').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.三级分类').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文说明').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.英文说明').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外语说明').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.采购日期').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.规格外语').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.外语品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.颜色外语').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.单据品名').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.单据品名英').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.单据品名外').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.客人CODE').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.中文计量单位').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品来源').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.客人条码').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.费用承担').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.包装要求').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.运输方式').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.结算方式').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.品质保证').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.违约责任').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.合同纠纷').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.产品要求').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.验收标准').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.签约地点').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.交货地点').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.其它说明').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.备    注').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.业务人员').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.设计人员').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.代开金额').disabled = true
                    recordset.module.field_by_full_name(m + '.产品资料.代开点数').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.专业厂家').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.中文品名').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.采购总额').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.采购人员').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.下单地点').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.增值税率').disabled = true
                    recordset.module.field_by_full_name(m + '.额外费用.退 税 率').disabled = true
                    let t = recordset.tables['产品资料'];
                    let v = t.view_data
                    for (let r of v) {
                        r[recordset.module.field_by_full_name(m + '.产品资料.采购日期识别').db.name] = '是';
                        if (st1 == 1) {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '汕头') {
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购原价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购单价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购总额1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人').db.name];
                            };
                        };
                        if (yw1 == 1) {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '义乌') {
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购原价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购单价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购总额1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人').db.name];
                            };
                        };
                        if (nb1 == 1) {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] == '宁波') {
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购原价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购原价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购单价1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.采购总额1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.生产厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name];
                                r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人1').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人').db.name];
                            };
                        };
                    }
                };
            };
            if (recordset.val('计划确认') == '通过' && (recordset.val('宁波合同') != '' || recordset.val('义乌合同') != '' || recordset.val('汕头合同') != '')) {
                recordset.module.field_by_full_name(m + '.计划确认').disabled = true
            };
        };
        if (sb12 == '1') {
            recordset.module.field_by_full_name(m + '.计划确认').disabled = true
            recordset.module.field_by_full_name(m + '.宁波合同').disabled = true
            recordset.module.field_by_full_name(m + '.义乌合同').disabled = true
            recordset.module.field_by_full_name(m + '.汕头合同').disabled = true
            recordset.module.field_by_full_name(m + '.产品资料.是否确认').disabled = true
            recordset.module.field_by_full_name(m + '.产品资料.低成本确认').disabled = true
        };
        recordset.module.field_by_full_name(m + '.产品资料.采购人员').disabled = true
        if (recordset.val('产品计划') == '是' || recordset.val('产品计划') == '是1') {
            recordset.module.field_by_full_name(m + '.合同类型').disabled = true
        };
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], purchase_plan_recordLoad, '采购计划')



// 查询界面或编辑界面打开事件
const purchase_plan_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'apply_update_btn',
            "caption": '改单申请',
            "icon": 'any-function',
            "divided": true
        });
    } else {
        // btns.push({
        //     "name": 'select_purchase_btn',
        //     "caption": '选择采购',
        //     "icon": 'any-server-update',
        //     "divided": true
        // })
        btns.push({
            "name": 'cgrq_update_btn',
            "caption": '刷交货采购日期',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'user_update_btn',
            "caption": '再次选择合同生成人员',
            "icon": 'any-server-update',
            "divided": true
        })
    }
    btns.push({
        "name": 'purchase_mgr_btn',
        "caption": '采购主管退回',
        "icon": 'any-server-update',
        "divided": true
    })
    // 生成采购合同有很多限制条件，主要信息的完成查看不等于"锁定"；义乌、宁波、汕头合同等于当前用户；计划确认等于通过或工作流等于审批通过；合同类型不等于“追加到采购合同”
    // 产品资料的专业厂家不等于空且不为“待定“；导入标志不等于”是”；采购日期不为空；是否确认等于“是”；低成本确认等于“是”
    btns.push({
        "name": 'item_order_new_btn',
        "caption": '生成采购合同(产品)',
        "icon": 'any-server-update',
        "divided": true
    })
    btns.push({
        "name": 'supplier_order_new_btn',
        "caption": '生成采购合同(工厂)',
        "icon": 'any-server-update',
        "divided": true
    })
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], purchase_plan_Form_Show, '采购计划')

const purchase_plan_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = []
        // btns.push({
        //     "name": 'item_no_update_btn',
        //     "caption": '更改货号',
        //     "icon": 'any-server-update',
        //     "divided": true
        // })
        btns.push({
            "name": 'purchase_update_btn',
            "caption": '刷新采购',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'items_delete_btn',
            "caption": '资料清空',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'ratio_update_btn',
            "caption": '毛利刷新',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'supplier_update_btn',
            "caption": '更新工厂评分低毛利',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'invoice_update_btn',
            "caption": '刷新货源地开票工厂',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'item_all_update_btn',
            "caption": '更新所有产品',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'item_row_update_btn',
            "caption": '更新当前产品',
            "icon": 'any-server-update',
            "divided": true
        })

        form.toolbar.add([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], purchase_plan_EditorChildShow, '采购计划')

const purchase_plan_form_BtnClick = (evt_id, btn, form) => {
    let recordset = form.recordset;
    let m = form.module.name;
    if (btn.name == 'item_order_new_btn') {
        // _.ui.show_input_dialog('请输入要改单的原因:', '').then(val => {
        //     if (val == '' || val == null) {
        //         _.ui.message.error('请输入改单原因')
        //         return;
        //     }
        let rids = [form.current_rid.value]
        if (form.is_search) {
            rids = form.current_rids.value
        }
        _.http.post('/api/saier/purchase_plan/order/new', {
            rid: form.current_rid.value,
            rids: rids,
            kind: '产品',
        }).then(res => {
            _.ui.message.success(res.msg)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
        // })
    }
    if (btn.name == 'purchase_mgr_btn') {
        _.ui.confirm('确定要退回吗？').then(res => {
            _.http.post('/api/saier/purchase_plan/purchase/return', {
                rid: form.current_rid.value,
            }).then(res => {
                _.ui.message.success(res.msg)
                if (!form.is_search) {
                    form.reload_data()
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'supplier_order_new_btn') {
        // _.ui.show_input_dialog('请输入要改单的原因:', '').then(val => {
        //     if (val == '' || val == null) {
        //         _.ui.message.error('请输入改单原因')
        //         return;
        //     }
        let rids = [form.current_rid.value]
        if (form.is_search) {
            rids = form.current_rids.value
        }
        _.http.post('/api/saier/purchase_plan/order/new', {
            rid: form.current_rid.value,
            rids: rids,
            kind: '工厂',
        }).then(res => {
            _.ui.message.success(res.msg)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
        // })
    }
    if (btn.name == 'apply_update_btn') {
        _.http.post('/api/saier/purchase_plan/apply/check', {
            rid: form.current_rid.value
        }).then(res => {
            _.ui.show_input_dialog('请输入要改单的原因:', '').then(val => {
                if (val == '' || val == null) {
                    _.ui.message.error('请输入改单原因')
                    return;
                }
                _.http.post('/api/saier/purchase_plan/apply/change', {
                    rid: form.current_rid.value,
                    val: val,
                }).then(res => {
                    _.ui.message.success(res.msg)
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            })
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (btn.name == 'purchase_update_btn') {
        if (recordset.val('审核申请') == '' && recordset.val('产品资料.专业货号') != '' && recordset.val('产品资料.专业厂家') != '' && recordset.val('产品资料.专业厂家') != '待定') {
            _.http.post('/api/saier/salesorder/items/purchase/get', {
                sccj: recordset.val('产品资料.专业厂家'),
                zyhh: recordset.val('产品资料.专业货号'),
            }).then(res => {
                if (res.data != '') {
                    recordset.val('产品资料.采购人员', res.data);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            _.ui.message.error('审核申请不为空或专业货号、专业厂家不完整不能执行此操作')
            return
        }
    }
    if (btn.name == 'user_update_btn') {
        if (recordset.val('审核申请') == '' && (recordset.editor.is_record_locked.value == false || recordset.editor.is_record_locked.value == null) && recordset.val('产品资料.专业货号') != '' && recordset.val('产品资料.专业厂家') != '' && recordset.val('产品资料.专业厂家') != '待定') {
            _.http.post('/api/saier/purchase_plan/user/change', {
                rid: recordset.val('rid')
            }).then(res => {
                let t = recordset.tables['产品资料'];
                let d = t.view_data;
                let ywhts = 0
                let nbhts = 0
                let shhts = 0
                if (res.data != '' && res.data != user.username && recordset.val('审核申请') == _.user.username) {
                    for (let r of d) {
                        if (r.xddd == '宁波') {
                            nbhts += 1
                        }
                        if (r.xddd == '义乌') {
                            ywhts += 1
                        }
                        if (r.xddd == '汕头') {
                            shhts += 1
                        }
                    }
                    recordset.module.field_by_full_name(m + '.义乌合同').disabled = !(ywhts > 0 && recordset.val('义乌合同') == '');
                    recordset.module.field_by_full_name(m + '.宁波合同').disabled = !(nbhts > 0 && recordset.val('宁波合同') == '');
                    recordset.module.field_by_full_name(m + '.汕头合同').disabled = !(shhts > 0 && recordset.val('汕头合同') == '');
                    recordset.val('义乌合同数', ywhts);
                    recordset.val('宁波合同数', nbhts);
                    recordset.val('汕头合同数', shhts);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            _.ui.message.error('审核申请不为空或记录被锁定或专业货号、专业厂家不完整不能执行此操作')
            return
        }
    }
    if (btn.name == 'cgrq_update_btn') {
        let t = recordset.tables['产品资料'];
        let d = t.view_data;
        let tqts = recordset.val('提前天数');
        let cgqx = recordset.val('采购合同期限');
        let rq = new Date().format('yyyy-MM-dd');
        for (let r of d) {
            let krjq = r.krjq;
            if (krjq != '' && krjq != null && cgqx > 0) {
                let date = _addDaysDate(krjq, -(tqts + 7));
                r.htrq = date;
            } else {
                r.htrq = rq;
            }
            if (krjq != '' && krjq != null && tqts > 0) {
                let rq1 = _addDaysDate(krjq, -tqts);
                r.jhrq = rq1;
            }
            t.push_modi_rid(r.rid)
        }
        t.sync_operate_data();
        t.modified = true;
        _.ui.message.success('交货采购日期已刷新')
    }

    if (btn.name == 'items_delete_btn') {
        if (recordset.val('审核申请') == '' && recordset.val('业务人员') == _.user.username) {
            _.http.post('/api/saier/purchase_plan/items/delete', {
                rid: recordset.val('rid'),
                ywry: recordset.val('业务人员'),
                spsq: recordset.val('审核申请'),
                lines: recordset.tables['产品资料'].view_data,
            }).then(res => {
                recordset.tables['产品资料'].clear();
                recordset.save(false);
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            _.ui.message.error('已提交审核的订单或当前用户不是业务人员不能执行此操作')
            return
        }
    }

    if (btn.name == 'item_all_update_btn') {
        if (recordset.val('审核申请') != '') {
            _.ui.message.error('已提交审核的订单不能执行此操作')
            return
        }
        _.http.post('/api/saier/purchase_plan/items/update', {
            rid: recordset.val('rid'),
            kh_id: recordset.val('客户编号'),
            lines: recordset.tables['产品资料'].view_data,
        }).then(res => {
            let t = recordset.tables['产品资料'];
            let d = t.view_data;
            let l = res.data;
            for (let r of d) {
                let rid = r.rid;
                if (rid in l) {
                    purchase_plan_items_update(r, l, rid, m, recordset)
                    t.push_modi_rid(r.rid);
                }
            }
            t.sync_operate_data();
            recordset.do_re_sum_by_trigger_table('产品资料');
            t.modified = true;
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'ratio_update_btn') {
        _.http.post('/api/saier/purchase_plan/items/ratio/update', {
            rid: recordset.val('rid'),
            khmc: recordset.val('客户名称'),
            lines: recordset.tables['产品资料'].view_data,
        }).then(res => {
            let cghl = res.data.cghl;
            let nxkh = res.data.nxkh;
            let sb = res.data.sb;
            let t = recordset.tables['产品资料'];
            let d = t.view_data;
            let fyl = recordset.val('费 用 率');
            let hl = recordset.val('汇    率');
            let mldx = recordset.val('毛利底线');
            for (let r of d) {
                let zje = 0;
                if (recordset.val('客户判断') !== '是') {
                    zje = r[recordset.module.field_by_full_name(m + '.产品资料.外销总额').db.name];
                } else {
                    zje = r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name];
                }
                let cgbz = r[recordset.module.field_by_full_name(m + '.产品资料.采购货币').db.name];
                let hlcg = cghl[cgbz] || 1;
                let cgzj = r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name] * hlcg + r[recordset.module.field_by_full_name(m + '.产品资料.辅料总价').db.name];
                let zzsl = r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name];
                let tsl = r[recordset.module.field_by_full_name(m + '.产品资料.退 税 率').db.name];
                let htsl = r[recordset.module.field_by_full_name(m + '.产品资料.合同数量').db.name];
                let zzsl1 = 0;
                if (zzsl > 3) {
                    zzsl1 = r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name];
                }
                let zzsl2 = 1 + (zzsl1 / 100);
                if (r[recordset.module.field_by_full_name(m + '.产品资料.佣金比率').db.name] >= 0 && sb == 0) {
                    r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name] = zje * r[recordset.module.field_by_full_name(m + '.产品资料.佣金比率').db.name];
                } else {
                    if (r[recordset.module.field_by_full_name(m + '.产品资料.佣金单价').db.name] >= 0 && sb == 1) {
                        r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.佣金单价').db.name] * r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name];
                    }
                }
                if (r[recordset.module.field_by_full_name(m + '.产品资料.暗佣比率').db.name] >= 0 && sb == 0) {
                    r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] = zje * r[recordset.module.field_by_full_name(m + '.产品资料.暗佣比率').db.name];
                } else {
                    if (r[recordset.module.field_by_full_name(m + '.产品资料.暗佣单价').db.name] >= 0 && sb == 1) {
                        r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] = r[recordset.module.field_by_full_name(m + '.产品资料.暗佣单价').db.name] * r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name];
                    }
                }
                let mjdj = 0
                // let wxdj = 0
                if (nxkh == '是') {
                    if (recordset.val('客户判断') == '是') {
                        mjdj = r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name];
                        let sj1 = (mjdj - cgzj - r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name]) / zzsl2 * (zzsl1 / 100) + (r[recordset.module.field_by_full_name(m + '.产品资料.代开点数').db.name] * r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name]);
                        let mll = (mjdj - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name] - cgzj - r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name] - r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name]) / (mjdj - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name]);
                        r[recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').db.name] = mll;
                        r[recordset.module.field_by_full_name(m + '.产品资料.税   金').db.name] = sj1;
                        // if (mldx > 0 && mll < mldx) {
                        //     let wxdj1 = (cgzj + r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name]) / (1 - mldx) / r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name];
                        // };
                    } else {
                        mjdj = r[recordset.module.field_by_full_name(m + '.产品资料.外销总额').db.name] * hl;
                        let sj1 = (mjdj - cgzj - r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name]) / zzsl2 * (zzsl1 / 100) + (r[recordset.module.field_by_full_name(m + '.产品资料.代开点数').db.name] * r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name]);
                        let mll = (mjdj - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name] * hl - cgzj - r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name] - r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] * hl) / (mjdj - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name] * hl);
                        r[recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').db.name] = mll;
                        r[recordset.module.field_by_full_name(m + '.产品资料.税   金').db.name] = sj1;
                        // if (mldx > 0 && mll < mldx) {
                        //     wxdj = ((cgzj + r[recordset.module.field_by_full_name(m + '.产品资料.代开金额').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] * hl) / (1 - mldx)) / hl / r[recordset.module.field_by_full_name(m + '.产品资料.下单数量').db.name];
                        // }
                    }
                } else {
                    let a1 = '';
                    let a = 0;
                    let tsl2 = 0
                    let tsl3 = 0
                    let wxdj2 = 0
                    if ((r[recordset.module.field_by_full_name(m + '.产品资料.外销总额').db.name] > 0 || r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name] > 0) && (cgzj > 0)) {
                        if (r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name] > 0) {
                            a1 = '1';
                        } else {
                            a1 = '2';
                        }
                        zzsl = r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name];
                        tsl = r[recordset.module.field_by_full_name(m + '.产品资料.退 税 率').db.name];
                        htsl = r[recordset.module.field_by_full_name(m + '.产品资料.合同数量').db.name];
                        if (a1 == '2') {
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.外销总额').db.name] > 1) {
                                if (tsl == 0) {
                                    zzsl = 0;
                                }
                                if (tsl > 0 || tsl > zzsl) {
                                    if (tsl == 3) {
                                        zzsl = 3;
                                        r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                    if (tsl > 3) {
                                        zzsl = zzsl1;
                                        r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                }
                                // && mldx > 0
                                if (htsl > 0 && hl > 0) {
                                    let hhcb1 = 0;
                                    let hhcb = (cgzj + r[recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.验 货 费').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.包装费用').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] * hl) / (r[recordset.module.field_by_full_name(m + '.产品资料.外销总额').db.name] - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name]);
                                    if (zzsl == zzsl1) {
                                        if (tsl == 5) {
                                            a = 1.11;
                                        } else {
                                            a = 1 + (zzsl - tsl) / 100;
                                        }
                                        if ((a * hl) !== 0) {
                                            if (fyl === 0) {
                                                mll = ((zzsl2 / a * hl) - hhcb) / (zzsl2 / a * hl);
                                            } else {
                                                mll = ((zzsl2 / a * hl) - (zzsl2 / a * hl * fyl) - hhcb) / (zzsl2 / a * hl);
                                            }
                                        }
                                    }
                                    if (zzsl == 3 && tsl == 3) {
                                        if (1.03 * hl !== 0) {
                                            mll = ((1.03 * hl) - (1.03 * hl * fyl) - hhcb) / (1.03 * hl);
                                            hhcb1 = 1.03 * (hl - hl * fyl - hl * mldx);
                                        }
                                    }
                                    if ((zzsl == 1) && (tsl == 1)) {
                                        if (1.01 * hl !== 0) {
                                            mll = ((1.01 * hl) - (1.01 * hl * fyl) - hhcb) / (1.01 * hl);
                                            hhcb1 = 1.01 * (hl - hl * fyl - hl * mldx);
                                        }
                                    }
                                    if (zzsl == 0 && tsl == 0 && hl !== 0) {
                                        mll = (hl - hl * fyl - hhcb) / hl;
                                        hhcb1 = hl - hl * fyl - hl * mldx;
                                    }
                                    r[recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').db.name] = mll;
                                    r[recordset.module.field_by_full_name(m + '.产品资料.汇    率').db.name] = hl;
                                    r[recordset.module.field_by_full_name(m + '.产品资料.换汇成本').db.name] = hhcb;
                                    // if (mldx > 0 && mll < mldx && hhcb1 !== 0) {
                                    //     wxdj = (cgzj + r[recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.验 货 费').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.包装费用').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name] * hl) / (hhcb1 * htsl);
                                    // }
                                }
                            }
                        } else {
                            hl = 1;
                            if (r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name] > 1) {
                                if (tsl == 0) {
                                    zzsl = 0;
                                }
                                if ((tsl > 0) || (tsl > zzsl)) {
                                    if (tsl == 3) {
                                        zzsl = 3;
                                        r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                    if (tsl > 3) {
                                        zzsl = zzsl1;
                                        r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                }
                                zzsl2 = 1 + (zzsl / 100);
                                wxdj2 = r[recordset.module.field_by_full_name(m + '.产品资料.客户RMB总价').db.name] - r[recordset.module.field_by_full_name(m + '.产品资料.佣    金').db.name];
                                if (tsl >= 1) {
                                    tsl2 = tsl / 100;
                                    tsl3 = (r[recordset.module.field_by_full_name(m + '.产品资料.采购总额').db.name] + r[recordset.module.field_by_full_name(m + '.产品资料.辅料总价').db.name]) / zzsl2 * tsl2;
                                }
                                if (tsl == 0) {
                                    tsl3 = 0;
                                }
                                mll = (wxdj2 - wxdj2 * fyl - cgzj + tsl3 - r[recordset.module.field_by_full_name(m + '.产品资料.暗佣佣金').db.name]) / wxdj2;
                                r[recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').db.name] = mll;
                            }
                        }
                    }
                }
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'supplier_update_btn') {
        _.http.post('/api/saier/purchase_plan/items/supplier/update', {
            rid: recordset.val('rid'),
            khmc: recordset.val('客户名称'),
            lines: recordset.tables['产品资料'].view_data,
        }).then(res => {
            let t = recordset.tables['产品资料'];
            let d = t.view_data;
            let l = res.data;
            let cp_data = l.cp_data;
            let cs_data = l.cs_data;
            let mldx = recordset.val('毛利底线');
            for (let r of d) {
                let flag = 0
                let zyhh = r.bjhh;
                let sccj = r.sccj1;
                let gdry = r.gdry;
                let cgry = r.cgry;
                if (r.ggxm == '' || r.ggxm == null) {
                    r.ggxm = '否';
                    flag = 1;
                }
                if ((r.ggxm == '否' || r.ggxm == '' || r.ggxm == null) && zyhh != '' && zyhh != null && cp_data && zyhh in cp_data) {
                    r.zdml = cp_data[zyhh];
                    if (mldx > 0 && r.zdml > mldx) {
                        r.zdml = mldx
                    }
                    if (r.zdml != 0 && r.mll && r.zdml > r.mll) {
                        r.ggxm = '否';
                    } else {
                        r.ggxm = '是';
                    }
                    flag = 1;
                }
                if (cs_data && sccj != '' && sccj != null && sccj != '待定' && gdry != '' && gdry != null && gdry != '待定' && cgry != '' && cgry != null && cgry != '待定' && sccj in cs_data) {
                    r.gcpf = cs_data[sccj];
                    if (r.gcpf && r.gcpf >= 60) {
                        r.sfqr = '是';
                        flag = 1;
                    }
                }
                if (flag == 1) {
                    t.push_modi_rid(r.rid);
                }
            }
            t.sync_operate_data();
            recordset.do_re_sum_by_trigger_table('产品资料');
            t.modified = true;
            if (l.er_data) {
                recordset.val('多下清单', l.er_data);
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'invoice_update_btn') {
        _.http.post('/api/saier/purchase_plan/items/invoice/update', {
            rid: recordset.val('rid'),
            lines: recordset.tables['产品资料'].view_data,
        }).then(res => {
            let t = recordset.tables['产品资料'];
            let d = t.view_data;
            let l = res.data;
            for (let r of d) {
                let rid = r.rid;
                if (rid in l) {
                    if (l[rid].items) {
                        if (l[rid].kpgc != '' && l[rid].kpgc != null) {
                            r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] = l[rid].items.kpgc
                        }
                        r[recordset.module.field_by_full_name(m + '.产品资料.工厂地址').db.name] = l[rid].items.zwdw
                        r[recordset.module.field_by_full_name(m + '.产品资料.所在城市').db.name] = l[rid].items.bgjldw
                        r[recordset.module.field_by_full_name(m + '.产品资料.所在省份').db.name] = l[rid].items.bzyq
                        r[recordset.module.field_by_full_name(m + '.产品资料.手机号码').db.name] = l[rid].items.sccj
                        r[recordset.module.field_by_full_name(m + '.产品资料.工厂传真').db.name] = l[rid].items.hgbm

                        r[recordset.module.field_by_full_name(m + '.产品资料.工厂评分').db.name] = l[rid].items.rkdd
                        r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] = l[rid].items.cgdj
                        r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] = l[rid].items.cpbh
                        r[recordset.module.field_by_full_name(m + '.产品资料.联 系 人').db.name] = l[rid].items.yscgj
                        r[recordset.module.field_by_full_name(m + '.产品资料.结算方式').db.name] = l[rid].items.gctd
                        r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name] = l[rid].items.topcz
                    } else {
                        r[recordset.module.field_by_full_name(m + '.产品资料.工厂评分').db.name] = 0
                        r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] = '待定'
                        r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] = ''
                        r[recordset.module.field_by_full_name(m + '.产品资料.货 源 地').db.name] = ''
                    }
                    if (l[rid].hyd && l[rid].hyd != null && l[rid].hyd != '') {
                        r.hyd = l[rid].hyd;
                    }
                    t.push_modi_rid(r.rid);
                }
            }
            t.sync_operate_data();
            recordset.do_re_sum_by_trigger_table('产品资料');
            t.modified = true;
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'item_row_update_btn') {
        if (recordset.val('审核申请') != '') {
            _.ui.message.error('已提交审核的订单不能执行此操作')
            return
        }
        _.http.post('/api/saier/purchase_plan/items/update', {
            rid: recordset.val('rid'),
            kh_id: recordset.val('客户编号'),
            lines: [recordset.tables['产品资料'].current_data],
        }).then(res => {
            let t = recordset.tables['产品资料'];
            let l = res.data;
            let r = t.current_data;
            let rid = r.rid;
            if (rid in l) {
                purchase_plan_items_update(r, l, rid, m, recordset)
            }
            t.push_modi_rid(r.rid);
            t.sync_operate_data();
            recordset.do_re_sum_by_trigger_table('产品资料');
            t.modified = true;
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], purchase_plan_form_BtnClick, '采购计划')

const purchase_plan_items_update = (r, l, rid, m, recordset) => {
    if (l[rid].flag == 1) {
        r.fljg = l[rid].fljg;
        r.flzj = round(r.fljg * r.yxdsl, 2);
    }
    if (l[rid].items) {
        r[recordset.module.field_by_full_name(m + '.产品资料.是否授权').db.name] = l[rid].items.sfsq
        r[recordset.module.field_by_full_name(m + '.产品资料.产品规格').db.name] = l[rid].items.cpggz
        r[recordset.module.field_by_full_name(m + '.产品资料.规格英语').db.name] = l[rid].items.cpgg
        r[recordset.module.field_by_full_name(m + '.产品资料.规格外语').db.name] = l[rid].items.ggwy
        r[recordset.module.field_by_full_name(m + '.产品资料.可思达货号').db.name] = l[rid].items.ksdhh
        r[recordset.module.field_by_full_name(m + '.产品资料.采购货币').db.name] = l[rid].items.cghbdm
        r[recordset.module.field_by_full_name(m + '.产品资料.中文品名').db.name] = l[rid].items.zwpm
        r[recordset.module.field_by_full_name(m + '.产品资料.英文品名').db.name] = l[rid].items.ywpm
        r[recordset.module.field_by_full_name(m + '.产品资料.外语品名').db.name] = l[rid].items.wypp
        r[recordset.module.field_by_full_name(m + '.产品资料.颜    色').db.name] = l[rid].items.yse
        r[recordset.module.field_by_full_name(m + '.产品资料.颜色英文').db.name] = l[rid].items.ysez
        r[recordset.module.field_by_full_name(m + '.产品资料.颜色外语').db.name] = l[rid].items.yswy
        r[recordset.module.field_by_full_name(m + '.产品资料.款  式').db.name] = l[rid].items.ks
        r[recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name] = l[rid].items.zzsl
        r[recordset.module.field_by_full_name(m + '.产品资料.计量单位').db.name] = l[rid].items.jldw
        r[recordset.module.field_by_full_name(m + '.产品资料.包装单位').db.name] = l[rid].items.bzdw
        r[recordset.module.field_by_full_name(m + '.产品资料.毛    重').db.name] = l[rid].items.mxmz
        r[recordset.module.field_by_full_name(m + '.产品资料.净    重').db.name] = l[rid].items.mxjz
        r[recordset.module.field_by_full_name(m + '.产品资料.中文包装').db.name] = l[rid].items.zhwbzh
        r[recordset.module.field_by_full_name(m + '.产品资料.英文包装').db.name] = l[rid].items.bzhfsh
        r[recordset.module.field_by_full_name(m + '.产品资料.包装长度').db.name] = l[rid].items.bzcd
        r[recordset.module.field_by_full_name(m + '.产品资料.包装宽度').db.name] = l[rid].items.bzkd
        r[recordset.module.field_by_full_name(m + '.产品资料.包装高度').db.name] = l[rid].items.bzgd
        r[recordset.module.field_by_full_name(m + '.产品资料.外箱体积').db.name] = l[rid].items.bztj
        r[recordset.module.field_by_full_name(m + '.产品资料.退 税 率').db.name] = l[rid].items.tsl
        r[recordset.module.field_by_full_name(m + '.产品资料.克    重').db.name] = l[rid].items.chpkzh
        r[recordset.module.field_by_full_name(m + '.产品资料.材质中文').db.name] = l[rid].items.caiziz
        r[recordset.module.field_by_full_name(m + '.产品资料.材质英语').db.name] = l[rid].items.caizi
        r[recordset.module.field_by_full_name(m + '.产品资料.材质外语').db.name] = l[rid].items.czwy
        // r[recordset.module.field_by_full_name(m + '.产品资料.测式种类').db.name] = l[rid].items.cszl
        r[recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db.name] = l[rid].items.bgpm
        r[recordset.module.field_by_full_name(m + '.产品资料.产品尺寸').db.name] = l[rid].items.chpchc
        r[recordset.module.field_by_full_name(m + '.产品资料.bottom材质').db.name] = l[rid].items.bottomcz
        r[recordset.module.field_by_full_name(m + '.产品资料.内部材质').db.name] = l[rid].items.coating
        r[recordset.module.field_by_full_name(m + '.产品资料.外部材质').db.name] = l[rid].items.wbcz
        r[recordset.module.field_by_full_name(m + '.产品资料.其它材质').db.name] = l[rid].items.qtcz
        r[recordset.module.field_by_full_name(m + '.产品资料.厚    度').db.name] = l[rid].items.houd
        r[recordset.module.field_by_full_name(m + '.产品资料.壁    厚').db.name] = l[rid].items.bh123
        r[recordset.module.field_by_full_name(m + '.产品资料.底    厚').db.name] = l[rid].items.dh123
        r[recordset.module.field_by_full_name(m + '.产品资料.中文尺寸').db.name] = l[rid].items.zwcc
        r[recordset.module.field_by_full_name(m + '.产品资料.英文尺寸').db.name] = l[rid].items.ywcc
        r[recordset.module.field_by_full_name(m + '.产品资料.产品大类').db.name] = l[rid].items.cpfl
        r[recordset.module.field_by_full_name(m + '.产品资料.一级分类').db.name] = l[rid].items.yjfl
        r[recordset.module.field_by_full_name(m + '.产品资料.二级分类').db.name] = l[rid].items.ejfl
        r[recordset.module.field_by_full_name(m + '.产品资料.三级分类').db.name] = l[rid].items.sjfl
        r[recordset.module.field_by_full_name(m + '.产品资料.分类名称').db.name] = l[rid].items.flmc
        r[recordset.module.field_by_full_name(m + '.产品资料.中文说明').db.name] = l[rid].items.cpsm
        r[recordset.module.field_by_full_name(m + '.产品资料.英文说明').db.name] = l[rid].items.ywsm
        r[recordset.module.field_by_full_name(m + '.产品资料.外语说明').db.name] = l[rid].items.wysm
        r[recordset.module.field_by_full_name(m + '.产品资料.单据品名').db.name] = l[rid].items.djpm
        r[recordset.module.field_by_full_name(m + '.产品资料.单据品名英').db.name] = l[rid].items.djpmy
        r[recordset.module.field_by_full_name(m + '.产品资料.单据品名外').db.name] = l[rid].items.djpmw
        r[recordset.module.field_by_full_name(m + '.产品资料.客人CODE').db.name] = l[rid].items.krcode
        r[recordset.module.field_by_full_name(m + '.产品资料.中文计量单位').db.name] = l[rid].items.zwdw
        r[recordset.module.field_by_full_name(m + '.产品资料.报关单位').db.name] = l[rid].items.bgjldw
        r[recordset.module.field_by_full_name(m + '.产品资料.包装要求').db.name] = l[rid].items.bzyq
        r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] = l[rid].items.sccj
        r[recordset.module.field_by_full_name(m + '.产品资料.海关编码').db.name] = l[rid].items.hgbm
        if (l[rid].gdry && l[rid].gdry != null && l[rid].gdry != '') {
            r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = l[rid].items.gdry
        } else {
            r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = '待定';
        }
        r[recordset.module.field_by_full_name(m + '.产品资料.入库地点').db.name] = l[rid].items.rkdd
        r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name] = l[rid].items.cgdj
        r[recordset.module.field_by_full_name(m + '.产品资料.专业产品编号').db.name] = l[rid].items.cpbh
        r[recordset.module.field_by_full_name(m + '.产品资料.原始采购价').db.name] = l[rid].items.yscgj
        r[recordset.module.field_by_full_name(m + '.产品资料.工厂退点').db.name] = l[rid].items.gctd
        r[recordset.module.field_by_full_name(m + '.产品资料.产品来源').db.name] = l[rid].items.topcz
        if (l[rid].cgry && l[rid].cgry != null && l[rid].cgry != '') {
            r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] = l[rid].items.cgry
        } else {
            r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] = '待定';
        }
    }
    r.khhh = l[rid].khhh;
    r.krtm = l[rid].krtm;
    if (l[rid].mz && l[rid].mz != null && l[rid].mz != 0) {
        r.mz = l[rid].mz;
        r.zmz = round(r.mz * r.xdxs, 2);
    }
    if (l[rid].jz && l[rid].jz != null && l[rid].jz != 0) {
        r.jz = l[rid].jz;
        r.zjz = round(r.jz * r.xdxs, 2);
    }
    if (l[rid].wxdj && l[rid].wxdj != null && l[rid].wxdj != 0) {
        r.wxdj = l[rid].wxdj;
    }
    if (l[rid].Twxdj && l[rid].Twxdj != null && l[rid].Twxdj != 0) {
        r.Twxdj = l[rid].Twxdj;
    }
    if (l[rid].mjdj1 && l[rid].mjdj1 != null && l[rid].mjdj1 != 0) {
        r.mjdj1 = l[rid].mjdj1;
        r.mjzj = round(r.mjdj1 * r.yxdsl, 2);
    }
    if (l[rid].pkRMB && l[rid].pkRMB != null && l[rid].pkRMB != 0) {
        r.pkRMB = l[rid].pkRMB;
    }
    if (l[rid].cs_data) {
        r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name] = l[rid].cs_data.cs_id
        r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name] = l[rid].cs_data.phone
        r[recordset.module.field_by_full_name(m + '.产品资料.有无拜访').db.name] = l[rid].cs_data.ywbf
        if (l[rid].cs_data.jsfs && l[rid].cs_data.jsfs != null && l[rid].cs_data.jsfs != '') {
            r[recordset.module.field_by_full_name(m + '.产品资料.结算方式').db.name] = l[rid].cs_data.jsfs
        }
        if (l[rid].cs_data.hzdj1 && l[rid].cs_data.hzdj1 != null && l[rid].cs_data.hzdj1 != 0) {
            r[recordset.module.field_by_full_name(m + '.产品资料.工厂评分').db.name] = l[rid].cs_data.hzdj1
        }
    }
}

// 编辑界面字段change后执行
const purchase_plan_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    let username = _.user.username;
    if (field.full_name == n + '.额外费用.专业厂家') {
        if (recordset.val('额外费用.专业厂家') != '' && recordset.val('额外费用.专业厂家') != '待定') {
            recordset.val('额外费用.中转口岸', '额外费用' + recordset.val('额外费用.专业厂家') + ';' + _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'))
        }
    }
    if (field.full_name == n + '.完成查看') {
        recordset.module.group_by_name('完成资料').visible = (recordset.val('完成查看') == '是')
    }
    if (field.full_name == n + '.计划确认') {
        if (recordset.val('计划确认') == '通过') {
            if ((recordset.val('宁波合同') == '') && (recordset.val('宁波合同数') > 0)) {
                recordset.module.field_by_full_name(n + '.宁波合同').disabled = false;
            }
            if ((recordset.val('汕头合同') == '') && (recordset.val('汕头合同数') > 0)) {
                recordset.module.field_by_full_name(n + '.汕头合同').disabled = false;
            }
            if ((recordset.val('义乌合同') == '') && (recordset.val('义乌合同数') > 0)) {
                recordset.module.field_by_full_name(n + '.义乌合同').disabled = false;
            }
        } else if (recordset.val('计划确认') == '不通过') {
            recordset.val('宁波合同', '');
            recordset.val('汕头合同', '');
            recordset.val('义乌合同', '');
            recordset.val('完成情况', '未完成');
            recordset.val('计划确认', '待审批');
            recordset.module.field_by_full_name(n + '.宁波合同').disabled = true;
            recordset.module.field_by_full_name(n + '.汕头合同').disabled = true;
            recordset.module.field_by_full_name(n + '.义乌合同').disabled = true;
        }
    }

    if (field.full_name == n + '.提前天数') {
        let t = recordset.tables['产品资料'];
        let d = t.view_data;
        let tqts = recordset.val('提前天数');
        let cghtqx = recordset.val('采购合同期限');
        let rq = new Date().format('yyyy-MM-dd');
        for (let r of d) {
            let krjq = r.krjq;
            if (krjq == '' || krjq == null || cghtqx == '' || cghtqx == null) {
                r.htrq = rq;
                t.push_modi_rid(r.rid)
            } else {
                r.htrq = _addDaysDate(krjq, -cghtqx - 7);
                t.push_modi_rid(r.rid)
            }
            if (tqts != 0 && tqts != null && krjq != '' && krjq != null) {
                r.jhrq = _addDaysDate(krjq, -tqts);
                t.push_modi_rid(r.rid)
            }
        }
        t.sync_operate_data();
        t.modified = true;
    }
    if (field.full_name == n + '.客户名称') {
        if (recordset.val('客户名称') != '') {
            _.http.post('/api/saier/purchase_plan/khmc/change', {
                khmc: recordset.val('客户名称'),
            }).then(res => {
                let d = res.data;
                if (d) {
                    if (d.cghtqx) recordset.val('采购合同期限', d.cghtqx);
                    if (recordset.val('客户判断') == '' && d.RMBkh && d.RMBkh != '') {
                        recordset.val('客户判断', d.RMBkh)
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.产品资料.外销唯一字段' || field.full_name == n + '.产品资料.专业货号') {
        _.http.post('/api/saier/purchase_plan/items/wxwyzd2/change', {
            wyzd: recordset.val('产品资料.外销唯一字段'),
            zyhh: recordset.val('产品资料.专业货号'),
        }).then(res => {

        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            recordset.val('产品资料.专业货号', '')
        })
    }
    if (field.full_name == n + '.产品资料.外销唯一字段' && value != '' && value != null) {
        _.http.post('/api/saier/purchase_plan/items/wxwyzd/change', {
            wyzd: recordset.val('产品资料.外销唯一字段'),
        }).then(res => {
            let d = res.data;
            let flag = false;
            let wxhtsl = d.wxhtsl
            let cghtsl = 0
            let cgjhsl = d.cgjhsl
            if (recordset.val('产品资料.下单清单') != '是') {
                recordset.val('产品资料.下单清单', '是1');
                flag = true;
                cghtsl = d.cghtsl;
                cgjhsl = cgjhsl - cghtsl;
            }
            if (cgjhsl > wxhtsl) {
                recordset.val('产品资料.下单数量1', 0);
                recordset.val('产品资料.下单箱数1', 0);
                recordset.val('产品资料.下单箱数', 0);
                recordset.val('产品资料.下单数量', 0);
            } else {
                recordset.val('产品资料.下单数量1', wxhtsl - cgjhsl);
                if (recordset.val('产品资料.外箱装箱量') != 0) {
                    recordset.val('产品资料.下单箱数1', (wxhtsl - cgjhsl) / recordset.val('产品资料.外箱装箱量'));
                    recordset.val('产品资料.下单箱数', (wxhtsl - cgjhsl) / recordset.val('产品资料.外箱装箱量'));
                }
                recordset.val('产品资料.下单数量', wxhtsl - cgjhsl);
            }
            if (recordset.val('产品资料.下单清单') != '是') {
                recordset.val('产品资料.下单清单', '是');
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (field.full_name == n + '.产品资料.交货日期') {
        if (recordset.val('产品资料.交货日期') != '' && recordset.val('产品资料.交货日期') != null && recordset.val('产品资料.采购日期') != '' && recordset.val('产品资料.采购日期') != null) {
            if (recordset.val('产品资料.交货日期') < recordset.val('产品资料.采购日期') || recordset.val('产品资料.交货日期') < new Date().format('yyyy-MM-dd')) {
                _.ui.message.error('请注意交货日期早于今天，或交货日期早于采购日期请重输!')
                recordset.val('产品资料.交货日期', null)
            }
        }
    }
    if (field.full_name == n + '.产品资料.是否含税') {
        if (recordset.val('产品资料.是否含税') != '是') {
            recordset.val('产品资料.中文报关品名', '无')
            recordset.val('产品资料.开票工厂', '')
            recordset.val('产品资料.货 源 地', '')
            recordset.val('产品资料.退 税 率', 0)
            recordset.val('产品资料.增值税率', 0)
        }
    }
    if (field.full_name == n + '.产品资料.包装长度' || field.full_name == n + '.产品资料.包装宽度' || field.full_name == n + '.产品资料.包装高度') {
        let bzcd = recordset.val('产品资料.包装长度');
        let bzkd = recordset.val('产品资料.包装宽度');
        let bzgd = recordset.val('产品资料.包装高度');
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj != 0) {
            recordset.val('产品资料.外箱体积', round(bztj, 3));
            if (recordset.val('产品资料.外箱体积') < 0.001) {
                recordset.val('产品资料.外箱体积', '0.001');
            }
        }
    }
    if (field.full_name == n + '.产品资料.采购单价') {
        if (recordset.val('产品资料.是否赔款') == '否') {
            recordset.val('产品资料.采购原价', recordset.val('产品资料.采购单价'));
        }
    }
    if (field.full_name == n + '.产品资料.客户RMB总价' || field.full_name == n + '.产品资料.外销总额' || field.full_name == n + '.产品资料.采购总额' || field.full_name == n + '.产品资料.退 税 率'
        // || field.full_name == n + '.产品资料.采购单价' || field.full_name == n + '.产品资料.下单数量'
    ) {
        console.log('计算毛利率')
        _.http.post('/api/saier/purchase_plan/items/get/cghl', {
            khmc: recordset.val('客户名称'),
            cgbz: recordset.val('产品资料.采购货币')
        }).then(res => {
            let nxkh = res.data.nxkh;
            let sb = res.data.sb;
            if ((recordset.val('产品资料.外销唯一字段') != '' && recordset.val('产品资料.采购总额') != 0) && (recordset.val('产品资料.外销总额') != 0 || recordset.val('产品资料.客户RMB总价') != 0)) {
                let cgzj = 0
                let zzsl = 0
                let tsl = 0
                let zzsl1 = 0;
                let zzsl2 = 0
                let zje = 0;
                let hl = 1;
                let fyl = recordset.val('费 用 率');
                let mjdj = 0;
                let sj1 = 0;
                let mll = 0;
                let hlcg = 1;
                if (recordset.val('产品资料.采购货币') == '' || recordset.val('产品资料.采购货币').indexOf('RMB') != -1) {
                    hlcg = 1;
                } else {
                    hlcg = res.data.cghl;
                }
                cgzj = recordset.val('产品资料.采购总额') * hlcg + recordset.val('产品资料.辅料总价');
                console.log('采购总价 ', cgzj)

                zzsl = recordset.val('产品资料.增值税率');
                tsl = recordset.val('产品资料.退 税 率');
                if (zzsl > 3) {
                    zzsl1 = recordset.val('产品资料.增值税率');
                }
                zzsl2 = 1 + (zzsl1 / 100);
                if (recordset.val('客户判断') != '是') {
                    hl = recordset.val('汇    率');
                    zje = recordset.val('产品资料.外销总额');
                } else {
                    hl = 1;
                    zje = recordset.val('产品资料.客户RMB总价');
                }
                if (recordset.val('产品资料.佣金比率') >= 0 && sb == '') {
                    recordset.val('产品资料.佣    金', zje * recordset.val('产品资料.佣金比率'));
                } else {
                    if (recordset.val('产品资料.佣金单价') >= 0 && sb == '1') {
                        recordset.val('产品资料.佣    金', recordset.val('产品资料.佣金单价') * recordset.val('产品资料.下单数量'));
                    }
                }
                if (recordset.val('产品资料.暗佣比率') >= 0 && sb == '') {
                    recordset.val('产品资料.暗佣佣金', zje * recordset.val('产品资料.暗佣比率'));
                } else {
                    if (recordset.val('产品资料.暗佣单价') >= 0 && sb == '1') {
                        recordset.val('产品资料.暗佣佣金', recordset.val('产品资料.暗佣单价') * recordset.val('产品资料.下单数量'));
                    }
                }
                let mldx = recordset.val('毛利底线');
                if (recordset.val('客户名称') != '') {
                    if (nxkh == '是') {
                        if (recordset.val('客户判断') == '是') {
                            mjdj = recordset.val('产品资料.客户RMB总价');
                            sj1 = (mjdj - cgzj - recordset.val('产品资料.代开金额')) / zzsl2 * (zzsl1 / 100) + (recordset.val('产品资料.代开点数') * recordset.val('产品资料.代开金额'));
                            mll = (mjdj - recordset.val('产品资料.佣    金') - cgzj - recordset.val('产品资料.代开金额') - recordset.val('产品资料.暗佣佣金')) / (mjdj - recordset.val('产品资料.佣    金'));
                            recordset.val('产品资料.毛 利 率', mll);
                            recordset.val('产品资料.税   金', sj1);
                            // if (mldx > 0 && mll < mldx) {
                            //     wxdj1 = (cgzj + recordset.val('产品资料.代开金额') + recordset.val('产品资料.暗佣佣金')) / (1 - mldx) / recordset.val('产品资料.下单数量');
                            // }
                        } else {
                            mjdj = recordset.val('产品资料.外销总额') * hl;
                            sj1 = (mjdj - cgzj - recordset.val('产品资料.代开金额')) / zzsl2 * (zzsl1 / 100) + (recordset.val('产品资料.代开点数') * recordset.val('产品资料.代开金额'));
                            mll = (mjdj - recordset.val('产品资料.佣    金') * hl - cgzj - recordset.val('产品资料.代开金额') - recordset.val('产品资料.暗佣佣金') * hl) / (mjdj - recordset.val('产品资料.佣    金') * hl);
                            recordset.val('产品资料.毛 利 率', mll);
                            recordset.val('产品资料.税   金', sj1);
                            // if (mldx > 0 && mll < mldx) {
                            //     wxdj = ((cgzj + recordset.val('产品资料.代开金额') + recordset.val('产品资料.暗佣佣金') * hl) / (1 - mldx)) / hl / recordset.val('产品资料.下单数量');
                            // }
                        }
                    } else {
                        if (recordset.val('客户判断') != '是') {
                            hl = recordset.val('汇    率');
                            if (recordset.val('产品资料.外销总额') > 0 && cgzj > 0) {
                                zzsl = recordset.val('产品资料.增值税率');
                                tsl = recordset.val('产品资料.退 税 率');
                                let htsl = recordset.val('产品资料.下单数量');
                                if (recordset.val('产品资料.外销总额') > 1) {
                                    if (tsl == 0) {
                                        zzsl = 0;
                                    }
                                    if ((tsl > 0) || (tsl > zzsl)) {
                                        if (tsl == 3) {
                                            zzsl = 3;
                                            recordset.val('产品资料.增值税率', zzsl);
                                        }
                                        if (tsl > 3) {
                                            zzsl = zzsl1;
                                            recordset.val('产品资料.增值税率', zzsl);
                                        }
                                    }
                                    let a = 1
                                    let hhcb1 = 0;
                                    // && mldx > 0
                                    if (htsl > 0  && hl > 0) {
                                        let hhcb = (cgzj + recordset.val('产品资料.纸卡费用') + recordset.val('产品资料.验 货 费') + recordset.val('产品资料.包装费用') + recordset.val('产品资料.暗佣佣金') * hl) / (recordset.val('产品资料.外销总额') - recordset.val('产品资料.佣    金'));
                                        if (zzsl == zzsl1) {
                                            if (tsl == 5) {
                                                a = 1.11;
                                            } else {
                                                a = 1 + (zzsl - tsl) / 100;
                                            }
                                            if (a * hl != 0) {
                                                if (fyl == 0) {
                                                    mll = ((zzsl2 / a * hl) - hhcb) / (zzsl2 / a * hl);
                                                    if ((hl - hl * mldx) != 0) {
                                                        hhcb1 = zzsl2 / a * (hl - hl * mldx);
                                                    }
                                                } else {
                                                    mll = ((zzsl2 / a * hl) - (zzsl2 / a * hl * fyl) - hhcb) / (zzsl2 / a * hl);
                                                }
                                            }
                                        }
                                        if (zzsl == 3 && tsl == 3) {
                                            if (1.03 * hl != 0) {
                                                mll = ((1.03 * hl) - (1.03 * hl * fyl) - hhcb) / (1.03 * hl);
                                                hhcb1 = 1.03 * (hl - hl * fyl - hl * mldx);
                                            }
                                        }
                                        if (zzsl == 1 && tsl == 1) {
                                            if (1.01 * hl != 0) {
                                                mll = ((1.01 * hl) - (1.01 * hl * fyl) - hhcb) / (1.01 * hl);
                                                hhcb1 = 1.01 * (hl - hl * fyl - hl * mldx);
                                            }
                                        }
                                        if (zzsl == 0 && tsl == 0 && hl != 0) {
                                            mll = (hl - hl * fyl - hhcb) / hl;
                                            hhcb1 = hl - hl * fyl - hl * mldx;
                                        }
                                        recordset.val('产品资料.毛 利 率', mll);
                                    }
                                }
                            }
                        } else {
                            hl = 1;
                            if (recordset.val('产品资料.客户RMB总价') > 0 && cgzj > 0) {
                                fyl = recordset.val('费 用 率');
                                zzsl = recordset.val('产品资料.增值税率');
                                tsl = recordset.val('产品资料.退 税 率');
                                mldx = recordset.val('毛利底线');
                                let tsl2 = 0;
                                let tsl3 = 0;
                                let mll = 0;
                                if (recordset.val('产品资料.客户RMB总价') > 0.0001) {
                                    if (tsl == 0) {
                                        zzsl = 0;
                                    }
                                    if ((tsl > 0) || (tsl > zzsl)) {
                                        if (tsl == 3) {
                                            zzsl = 3;
                                            recordset.val('产品资料.增值税率', zzsl);
                                        }
                                        if (tsl > 3) {
                                            zzsl = zzsl1;
                                            recordset.val('产品资料.增值税率', zzsl);
                                        }
                                    }
                                    let zzsl2 = 1 + (zzsl / 100);
                                    let wxdj2 = recordset.val('产品资料.客户RMB总价') - recordset.val('产品资料.佣    金');
                                    if (tsl >= 1) {
                                        tsl2 = tsl / 100;
                                        if (zzsl2 != 0) tsl3 = (recordset.val('产品资料.采购总额') + recordset.val('产品资料.辅料总价')) / zzsl2 * tsl2;
                                    }
                                    if (wxdj2 != 0) mll = (wxdj2 - wxdj2 * fyl - cgzj + tsl3 - recordset.val('产品资料.暗佣佣金')) / wxdj2;
                                    recordset.val('产品资料.毛 利 率', mll);
                                }
                            }
                        }
                    }
                }
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (field.full_name == n + '.产品资料.预计船期') {
        let rq = new Date().format('yyyy-MM-dd');
        let tjts = recordset.val('提前天数');
        let cgqx = recordset.val('采购合同期限');
        if (recordset.val('产品资料.预计船期') != '' && cgqx > 0) {
            let d2 = recordset.val('产品资料.预计船期');
            let d = _addDaysDate(d2, -(cgqx + 7));
            recordset.val('产品资料.采购日期', d);
        } else {
            recordset.val('产品资料.采购日期', rq);
        }
        if (recordset.val('产品资料.预计船期') != '' && tjts > 0) {
            let rq1 = _addDaysDate(recordset.val('产品资料.预计船期'), -tjts);
            recordset.val('产品资料.交货日期', rq1);
        } else {
            // recordset.val('产品资料.交货日期', recordset.val('产品资料.预计船期'));
        }
    }
    if (field.full_name == n + '.产品资料.代开点数') {
        let yjbl = recordset.val('产品资料.代开点数');
        recordset.val('产品资料.代开点数', yjbl / 100);
    }
    if (field.full_name == n + '.产品资料.下单箱数') {
        if (recordset.val('竞价识别') != '123') {
            if (recordset.val('产品资料.下单箱数') > recordset.val('产品资料.箱    数')) {
                recordset.val('产品资料.下单箱数', recordset.val('产品资料.箱    数'));
            }
            if ((recordset.val('产品资料.下单箱数') > 1) && (recordset.val('产品资料.外箱装箱量') > 0) && (recordset.val('产品资料.拼箱标记') != '是')) {
                recordset.val('产品资料.下单数量', recordset.val('产品资料.下单箱数') * recordset.val('产品资料.外箱装箱量'));
            }
        }
    }
    if (field.full_name == n + '.产品资料.专业厂家id') {
        if (recordset.val('产品资料.专业厂家id') == '') {
            recordset.val('产品资料.专业厂家', '待定');
            recordset.val('产品资料.工厂评分', 0);
            recordset.val('产品资料.有无拜访', '');
        } else {
            _.http.post('/api/saier/purchase_plan/items/csbh/change', {
                cs_id: recordset.val('产品资料.专业厂家id'),
            }).then(res => {
                let d = res.data;
                if (d) {
                    recordset.val('产品资料.工厂评分', d.hzdj1);
                    recordset.val('产品资料.有无拜访', d.ywbf);
                    recordset.val('产品资料.联 系 人', d.cslxr);
                    recordset.val('产品资料.工厂电话', d.phone);
                    recordset.val('产品资料.手机号码', d.sjhm);
                    recordset.val('产品资料.结算方式', d.jsfs);
                    recordset.val('产品资料.工厂传真', d.fax);
                    recordset.val('产品资料.所在省份', d.province1);
                    recordset.val('产品资料.所在城市', d.city1);
                    recordset.val('产品资料.工厂地址', d.address);
                    recordset.val('产品资料.专业厂家', d.company_name);
                    recordset.val('产品资料.开票工厂', d.kpgc);
                } else {
                    recordset.val('产品资料.工厂评分', 0);
                    recordset.val('产品资料.专业厂家', '待定');
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.产品资料.专业厂家' || field.full_name == n + '.产品资料.专业货号') {
        let sccj = recordset.val('产品资料.生产厂家');
        if (sccj == '') {
            sccj = recordset.val('产品资料.专业厂家');
        }
        let cpbh = recordset.val('产品资料.产品编号');
        if (cpbh == '') {
            cpbh = recordset.val('产品资料.专业货号');
        }
        if (cpbh != '' && sccj != '' && sccj != '待定') {
            _.http.post('/api/saier/purchase_plan/items/sccj/change', {
                cs_id: recordset.val('产品资料.专业厂家id'),
                sccj: sccj,
                zyhh: cpbh
            }).then(res => {
                let d = res.data;
                if (d) {
                    recordset.val('产品资料.是否开模', d.sfkm);
                    recordset.val('产品资料.开模编号', d.kmbh);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.产品资料.采购人员') {
        let cgry = recordset.val('产品资料.采购人员');
        let nbht = recordset.val('宁波合同');
        let ywht = recordset.val('义乌合同');
        let stht = recordset.val('汕头合同');
        let xddd = recordset.val('产品资料.下单地点');
        let sccj = recordset.val('产品资料.专业厂家');
        let gdry = recordset.val('产品资料.跟单人员');
        let wyzd = recordset.val('产品资料.计划唯一');
        // if (cgry != '' && cgry != '待定') {
        _.http.post('/api/saier/purchase_plan/items/cgry/change', {
            cgry: cgry,
            nbht: nbht,
            ywht: ywht,
            stht: stht,
            xddd: xddd,
            sccj: sccj,
            gdry: gdry,
            wyzd: wyzd
        }).then(res => {
            let d = res.data;
            if (res.code == 0) {
                _.ui.message.error(res.msg);
            }
            if (d.pd && d.pd != '') {
                recordset.val('产品资料.采购人员', '待定');
            }
            if (d.sfqr) {
                recordset.val('产品资料.是否确认', d.sfqr);
            }
            if (d.ssdq && d.ssdq != '') {
                recordset.val('产品资料.下单地点', d.ssdq);
            }
            if (d.path && d.path != '') {
                recordset.val('产品资料.业务', d.path);
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
        // }
    }
    if (field.full_name == n + '.产品资料.专业货号') {
        let zyhh = recordset.val('产品资料.专业货号');
        let khhh = recordset.val('产品资料.专业货号');
        let khmc = recordset.val('客户名称');
        recordset.val('产品资料.专业产品编号', zyhh);
        if (zyhh != '' && zyhh != null) {
            if (khhh != '') {
                recordset.val('产品资料.产品货号1', khhh.trim());
            } else {
                recordset.val('产品资料.产品货号1', zyhh.trim());
            }
            if (zyhh != '' && (khmc == '' || khmc.indexOf('BEST PRICE') >= 0 || khmc.indexOf('SIA FP LV') >= 0 || khmc.indexOf('Fix Price General Trading LLC') >= 0)) {
                recordset.val('产品资料.最低毛利率', 0.15);
            } else {
                recordset.val('产品资料.最低毛利率', 0);
            }
            _.http.post('/api/saier/purchase_plan/items/zyhh/change', {
                zyhh: zyhh,
                khmc: khmc
            }).then(res => {
                let d = res.data;
                if (d.gdry && d.gdry != '') {
                    recordset.val('产品资料.跟单人员', d.gdry);
                }
                if (d.bzyq) {
                    recordset.val('产品资料.包装要求', d.bzyq);
                }
                if (d.cgry && d.cgry != '') {
                    recordset.val('产品资料.采购人员', d.cgry);
                }
                if (d.zdml && d.zdml > 0) {
                    recordset.val('产品资料.最低毛利率', d.zdml);
                }
                if (d.wbcz && d.wbcz != '') {
                    recordset.val('产品资料.设计人员', d.wbcz);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            recordset.val('产品资料.产品货号1', '');
        }
    }
    if (field.full_name == n + '.产品资料.跟单人员') {
        let gdry = recordset.val('产品资料.跟单人员');
        let cgry = recordset.val('产品资料.采购人员');
        let sccj = recordset.val('产品资料.专业厂家');
        let nbht = recordset.val('宁波合同');
        let ywht = recordset.val('义乌合同');
        let stht = recordset.val('汕头合同');
        let rid = recordset.val('产品资料.rid');
        recordset.val('产品资料.专业产品编号', gdry);
        if (gdry != '' && gdry != '待定') {
            _.http.post('/api/saier/purchase_plan/items/gdry/change', {
                gdry: gdry,
                cgry: cgry,
                sccj: sccj,
                nbht: nbht,
                ywht: ywht,
                stht: stht,
                rid: rid
            }).then(res => {
                let d = res.data;
                if (d.path && d.path == '') {
                    recordset.val('产品资料.跟单人员', '待定');
                }
                if (d.bm && d.bm != '') {
                    recordset.val('产品资料.跟单部门', d.bm);
                }
                if (d.sfqr && d.sfqr != '') {
                    recordset.val('产品资料.是否确认', d.sfqr);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            recordset.val('产品资料.跟单人员', '待定');
            recordset.val('产品资料.是否确认', '否');
        }
    }

    if (field.full_name == n + '.产品资料.下单数量') {
        let jjsb = recordset.val('竞价识别');
        let xdqd = recordset.val('产品资料.下单清单');
        let rid = recordset.val('产品资料.rid');
        let xdsl = recordset.val('产品资料.下单数量');
        let wxyzd = recordset.val('产品资料.外销唯一字段');
        // let jhwy = recordset.val('产品资料.计划唯一');
        // if (jhwy =='' || jhwy == null) {
        //     jhwy = 'zjnblhjhwy123456'
        // }
        if (jjsb != '' && xdqd != '是1') {
            _.http.post('/api/saier/purchase_plan/items/xdsl/change', {
                wxyzd: wxyzd,
                rid: rid,
                xdsl: xdsl
            }).then(res => {
                let d = res.data;
                let wxhtsl = d.wxhtsl
                let jhhtsl = d.jhhtsl
                if (jhhtsl > wxhtsl) {
                    recordset.val('产品资料.下单数量', 0);
                    recordset.val('产品资料.下单箱数', 0);
                } else {
                    let xdsl = recordset.val('产品资料.下单数量');
                    let wxrl = recordset.val('产品资料.外箱装箱量');
                    let xdsl1 = recordset.val('产品资料.下单数量1');
                    let xdxs1 = recordset.val('产品资料.下单箱数1');
                    let yjbl = recordset.val('产品资料.佣金比率');
                    if (xdsl < xdsl1 && wxrl > 0 && xdsl > 0) {
                        if (wxrl < 0.01) {
                            wxrl = 1;
                        }
                        if (recordset.val('产品资料.拼箱标记') !== '是') {
                            xdxs = xdsl / wxrl;
                        }
                        if (xdxs < 1 && xdxs > 0) {
                            xdxs = 1;
                        }
                        if (recordset.val('产品资料.拼箱标记') != '是') {
                            recordset.val('产品资料.下单箱数', xdxs);
                        }
                        recordset.val('产品资料.客户RMB总价', xdsl * recordset.val('产品资料.赔款RMB'));
                        recordset.val('产品资料.外销总额', xdsl * recordset.val('产品资料.赔款单价'));
                        recordset.val('产品资料.采购总额', xdsl * recordset.val('产品资料.采购单价'));
                        if (recordset.val('客户判断') === '是') {
                            recordset.val('产品资料.佣    金', yjbl * recordset.val('产品资料.客户RMB总价'));
                        } else {
                            recordset.val('产品资料.佣    金', yjbl * recordset.val('产品资料.外销总额'));
                        }
                        recordset.val('产品资料.总 毛 重', xdxs * recordset.val('产品资料.毛    重'));
                        recordset.val('产品资料.总 净 重', xdxs * recordset.val('产品资料.净    重'));
                        recordset.val('产品资料.总 体 积', xdxs * recordset.val('产品资料.外箱体积'));
                        // let mz = recordset.val('产品资料.毛    重');
                        // let jz = recordset.val('产品资料.净    重');
                        // let tj = recordset.val('产品资料.外箱体积');
                        recordset.val('产品资料.下单数量1', xdsl);
                        if (recordset.val('产品资料.拼箱标记') != '是') {
                            recordset.val('产品资料.下单箱数1', xdxs);
                        } else {
                            recordset.val('产品资料.下单箱数1', recordset.val('产品资料.下单箱数'));
                        }
                        let ddsl2 = xdxs1 - xdxs;
                        let ddsl = xdsl1 - xdsl;
                        recordset.tables['产品资料'].copy(1).then(res => {
                            recordset.val('产品资料.下单数量1', ddsl);
                            recordset.val('产品资料.下单箱数1', ddsl2);
                            recordset.val('产品资料.采购日期', null);
                            recordset.val('产品资料.采购计划唯一字段', '');
                            recordset.val('产品资料.下单箱数', ddsl2);
                            recordset.val('产品资料.下单数量', ddsl);
                            recordset.val('产品资料.客户RMB总价', ddsl * recordset.val('产品资料.赔款RMB'));
                            recordset.val('产品资料.外销总额', ddsl * recordset.val('产品资料.赔款单价'));
                            recordset.val('产品资料.采购总额', ddsl * recordset.val('产品资料.采购单价'));
                            if (recordset.val('客户判断') === '是') {
                                recordset.val('产品资料.佣    金', yjbl * recordset.val('产品资料.客户RMB总价'));
                            } else {
                                recordset.val('产品资料.佣    金', yjbl * recordset.val('产品资料.外销总额'));
                            }
                            recordset.val('产品资料.总 毛 重', ddsl2 * recordset.val('产品资料.毛    重'));
                            recordset.val('产品资料.总 净 重', ddsl2 * recordset.val('产品资料.净    重'));
                            recordset.val('产品资料.总 体 积', ddsl2 * recordset.val('产品资料.外箱体积'));
                        });

                    } else {
                        if (xdsl > xdsl1) {
                            recordset.val('产品资料.下单数量', xdsl1);
                        }
                    }
                    if (recordset.val('产品资料.下单箱数') === 0) {
                        let xdxs2 = 0;
                        if (wxrl > 0 && xdsl > 0) {
                            if (wxrl < 0.01) {
                                wxrl = 1;
                            }
                            xdxs2 = xdsl / wxrl;
                            if (xdxs2 < 1 && xdxs2 > 0) {
                                xdxs2 = 1;
                            }
                            recordset.val('产品资料.下单箱数', xdxs2);
                        }
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.业务人员') {
        _.http.post('/api/saier/purchase_plan/ywry/change', {
            ywry: recordset.val('业务人员'),
        }).then(res => {
            let d = res.data;
            recordset.val('业务', d.path)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (field.full_name == n + '.合同号码') {
        if (recordset.val('外销合同') != '') {
            _.http.post('/api/saier/purchase_plan/hthm/change', {
                rid: recordset.val('rid'),
                hthm: recordset.val('合同号码'),
            }).then(res => {

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.外销合同') {
        if (recordset.val('外销合同') != '') {
            recordset.val('合同号码', recordset.val('外销合同'));
            recordset.val('外销合同2', recordset.val('外销合同'));
            _.http.post('/api/saier/purchase_plan/wxht/change', {
                order_id: recordset.val('外销合同'),
            }).then(res => {
                let d = res.data;
                if (d) {
                    recordset.val('我方公司', d);
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == n + '.宁波合同') {
        if (recordset.val('宁波合同') != '') {
            if (recordset.val('宁波合同数') > 0) {
                _.http.post('/api/saier/purchase_plan/fieldno/change', {
                    order_no: recordset.val('宁波合同'),
                    rid: recordset.val('rid'),
                    bjdl: recordset.val('业务'),
                    ywry: recordset.val('业务人员'),
                    kind: '宁波合同'
                }).then(res => {

                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                    recordset.val('宁波合同', '')
                })
            } else {
                _.ui.message.error('不好意思,下单地点无宁波的产品，请检查后填写')
                recordset.val('宁波合同', '')
            }
        }
    }
    if (field.full_name == n + '.义乌合同') {
        if (recordset.val('义乌合同') != '') {
            if (recordset.val('义乌合同数') > 0) {
                _.http.post('/api/saier/purchase_plan/fieldno/change', {
                    order_no: recordset.val('义乌合同'),
                    rid: recordset.val('rid'),
                    bjdl: recordset.val('业务'),
                    ywry: recordset.val('业务人员'),
                    kind: '义乌合同'
                }).then(res => {

                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                    recordset.val('义乌合同', '')
                })
            } else {
                _.ui.message.error('不好意思,下单地点无义乌的产品，请检查后填写')
                recordset.val('义乌合同', '')
            }
        }
    }
    if (field.full_name == n + '.汕头合同') {
        if (recordset.val('汕头合同') != '') {
            if (recordset.val('汕头合同数') > 0) {
                _.http.post('/api/saier/purchase_plan/fieldno/change', {
                    order_no: recordset.val('汕头合同'),
                    rid: recordset.val('rid'),
                    bjdl: recordset.val('业务'),
                    ywry: recordset.val('业务人员'),
                    kind: '汕头合同'
                }).then(res => {

                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                    recordset.val('汕头合同', '')
                })
            } else {
                _.ui.message.error('不好意思,下单地点无汕头的产品，请检查后填写')
                recordset.val('汕头合同', '')
            }
        }
    }
    if (field.full_name == n + '.审核申请' && value != '') {
        if (recordset.val('审核申请') != username) {
            let rmbkh = recordset.val('客户判断')
            let wyzd = recordset.val('唯一字段');
            let ywry = recordset.val('业务人员');
            let t = recordset.tables['产品资料'];
            let d = t.view_data
            let a = 0;
            let a1 = 0;
            let a2 = 0;
            let a3 = 0;
            let cpbh2 = '';
            let cpbh3 = '';
            let cpbh4 = '';
            let i3 = 0;
            let i4 = 0;
            let i5 = 0;
            let cywyzdsl = 0;
            let cf_list = []
            let hydsb = '';
            for (let r of d) {
                a = a + 1;
                let jz = r.wxwyzd + r.zwpm + r.sccj1 + String(r.yxdsl) + r.gdry + r.xddd + String(r.cgzje);
                if (cf_list.indexOf(jz) < 0) {
                    cf_list.push(jz);
                } else {
                    cywyzdsl = cywyzdsl + 1;
                }
                if (r.krjq == '' || r.krjq == null) {
                    r.krjq = recordset.val('预计船期');
                }
                if (r.ywry == '') {
                    r.ywry = ywry;
                }
                if (r.cgywzd == '') {
                    r.cgywzd = 'cg' + r.rid
                }
                let hyd1 = r.hyd;
                if (hyd1.indexOf('其他') > 0 || hyd1.indexOf('其它') > 0) {
                    r.hyd = '';
                    hydsb = '1';
                }
                if (r.cgry != '待定' && r.sccj1 != '待定' && r.sccj != '待定' && r.gdry != '待定') {
                    r.sfqr = '是';
                } else {
                    r.sfqr = '否';
                }
                if (r.sfqr == '是' && r.kpgc != '待定') {
                    if (r.sfhs == '是' && (r.zzsl == 0 || r.zhwbgpm == '' || r.zhwbgpm == undefined || r.zhwbgpm == '无' || r.hgbm == '' || r.hgbm == undefined ||
                            r.bgjldw == '' || r.bgjldw == undefined || r.ljrk == '' || r.ljrk == 0 || r.ljrk == undefined ||
                            r.kpgc == '' || r.kpgc == undefined || r.tsl == 0 || r.tsl == undefined || r.hyd == '' || r.hyd == undefined)) {
                        console.log(r)
                        a3 = a3 + 1
                        if (i3 == 0) {
                            if (cpbh2 == '') {
                                cpbh2 = '第' + a;
                            } else {
                                cpbh2 = cpbh2 + '、' + a;
                            }
                            i3 = i3 + 1;
                        }
                    }
                }
                if (r.wxrl == 0 || r.cgry == '' || r.jhrq == '' || r.jhrq == null || r.ywry == '' || r.sccj1 == '' || (r.gcdh == '' && r.sccj1 != '待定') || (r.lxr == '' && r.sccj != '待定')) {
                    a1 = a1 + 1;
                    if (i4 == 0) {
                        if (cpbh3 == '') {
                            cpbh3 = '第' + a;
                        } else {
                            cpbh3 = cpbh3 + '、' + a;
                        }
                        i4 = i4 + 1;
                    }
                }
                // if (rmbkh == '是') {
                //     if (r.tsbj != '是') {
                //         if (r.cgdj <= 0 || r.cgzje <= 0) {
                //             a2 = a2 + 1;
                //             if (i5 == 0) {
                //                 if (cpbh4 == '') {
                //                     cpbh4 = '第' + a;
                //                 } else {
                //                     cpbh4 = cpbh4 + '、' + a;
                //                 }
                //                 i5 = i5 + 1;
                //             }
                //         }
                //     }
                // } else {
                if (r.tsbj != '是' && (r.cgdj <= 0 || r.cgzje <= 0)) {
                    a2 = a2 + 1;
                    if (i5 == 0) {
                        if (cpbh4 == '') {
                            cpbh4 = '第' + a;
                        } else {
                            cpbh4 = cpbh4 + '、' + a;
                        }
                        i5 = i5 + 1;
                    }
                }
                // }
                if (r.jhwy == '' || r.jhwy == null) {
                    r.jhwy = r.rid
                }
            }
            if (hydsb == '1') {
                _.ui.message.error('请注意货源地中不能包含其他或其它!');
            }
            if (a1 > 0 || a2 > 0 || a3 > 0 || cywyzdsl > 0) {
                if (cywyzdsl > 0) {
                    _.ui.message.error('有重复数据请注意' + cywyzdsl);
                }
                if (a1 > 0) {

                    _.ui.error_message('行号:' + cpbh3 + '的业务人员或采购人员,或交货日期,或工厂名称、电话、联系人、外箱装箱量为空，请检查后输入！', 5000);
                }
                if (a3 > 0) {
                    _.ui.error_message('行号:' + cpbh2 + '含税但增值税、退税、中文报关品名,海关编码,报关单位,开票点数没填，或此工厂无开票工厂或货源地！', 5000);
                }
                if (a2 > 0) {
                    _.ui.error_message('行号:' + cpbh4 + '的采购单价,或采购总额为0，请检查后输入！', 5000);
                }
                recordset.val('审核申请', '');
                recordset.val('审核申请1', '');
            } else {
                recordset.val('计划确认', '待审批');
                _.http.post('/api/saier/purchase_plan/shsq/change', {
                    shsq: recordset.val('审核申请'),
                    bjdl: recordset.val('业务'),
                }).then(res => {
                    recordset.val('完成情况', '已完成');
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                    recordset.val('审核申请', '');
                    recordset.val('审核申请1', '');
                })
            }
        } else {
            _.ui.message.error('不好意思,自已不能审批自已,请重新选择')
            recordset.val('审核申请', '')
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, purchase_plan_field_change, '采购计划')


function purchase_plan_table_new_after(evt_id, table, recordset) {
    if (table.group == '产品资料') {
        recordset.val('产品资料.采购计划唯一字段', recordset.val('产品资料.rid'))
        recordset.val('产品资料.计划唯一', '')
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], purchase_plan_table_new_after, '采购计划')


const purchase_plan_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group != '产品资料') {
            resolve();
            return
        }
        if (recordset.val('审核申请') == '' && recordset.val('业务人员') == _.user.username) {
            _.http.post('/api/saier/purchase_plan/items/delete', {
                rid: recordset.val('rid'),
                ywry: recordset.val('业务人员'),
                spsq: recordset.val('审核申请'),
                lines: [recordset.tables['产品资料'].current_data],
            }).then(res => {
                resolve();
                recordset.save(false);
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            _.ui.message.error('只有业务人员本人且未提交审核的单据才允许删除产品记录！');
            reject();
            return;
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], purchase_plan_table_delete_before, '采购计划')


const purchase_plan_after_save = (evt_id, recordset) => {
    if (recordset.val('wf_status') == 2) return
    if (recordset.val('审核申请') == '') return
    if (recordset.val('wf_status') == 1) {
        if (recordset.val('计划确认') == '待审批') return
        if (recordset.val('审核申请') != _.user.username) return
        _.http.post('/api/saier/audit/save/after', {
            rid: recordset.val('rid'),
            module: recordset.module.name,
        }).then(r => {
            console.log(r)
            if (r.code == 0) {
                return
            }
            let d = r.data
            _.http.post('/api/workflow/task/flow', {
                instance: d.instance_rid,
                status: 1,
                task_id: d.task_rid,
                memo: recordset.val('未批原因')
            }).then(res => {}).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        })
    } else {
        if (recordset.val('业务人员') != _.user.username) return
        _.ui.confirm('是否提交审批？').then(() => {
            _.http.post('/api/saier/workflow/start', {
                rid: recordset.val('rid'),
                module: recordset.module.name,
                flow_name: '采购计划'
            }).then(res => {
                recordset.val('wf_status', 1)
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, purchase_plan_after_save, '采购计划')


// 子表记录scroll事件
const purchase_plan_table_scroll = (evt_id, table, recordset) => {
    let module = recordset.module.name
    let username = _.user.username
    if (table.group == '产品资料') {
        // recordset.module.field_by_full_name(module + '.产品资料.是否确认').disabled = (recordset.val('宁波合同') != username && recordset.val('义乌合同') != username && recordset.val('汕头合同') != username);
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, purchase_plan_table_scroll, '采购计划')