// 编辑界面数据加载以后执行
const bol_apply_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username;
    if (recordset.val('发票号码') != '') {
        recordset.module.field_by_full_name(m + '.发票号码').disabled = true
        recordset.module.field_by_full_name(m + '.发票简写').disabled = true
    }
    recordset.module.field_by_full_name(m + '.申请备注').disabled = true;
    recordset.module.field_by_full_name(m + '.货值合计').disabled = true;
    recordset.module.field_by_full_name(m + '.申请日期').disabled = true;
    recordset.module.field_by_full_name(m + '.出运日期').disabled = true;
    recordset.module.field_by_full_name(m + '.实际出运').disabled = true;
    recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
    recordset.module.field_by_full_name(m + '.RMB客户').disabled = true;
    recordset.module.field_by_full_name(m + '.是否信保').disabled = true;
    recordset.module.field_by_full_name(m + '.单证人员').disabled = true;
    recordset.module.field_by_full_name(m + '.业务部门').disabled = true;
    recordset.module.field_by_full_name(m + '.外销总额').disabled = true;
    recordset.module.field_by_full_name(m + '.客户RMB总价').disabled = true;
    recordset.module.field_by_full_name(m + '.佣金金额').disabled = true;
    recordset.module.field_by_full_name(m + '.暗佣合计').disabled = true;
    recordset.module.field_by_full_name(m + '.明佣合计').disabled = true;
    recordset.module.field_by_full_name(m + '.货值合计').disabled = true;
    recordset.module.field_by_full_name(m + '.提交主管').disabled = true;
    recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
    recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
    recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
    recordset.module.field_by_full_name(m + '.提交财务').disabled = true;
    recordset.module.field_by_full_name(m + '.财务审批').disabled = true;
    recordset.module.field_by_full_name(m + '.审批日期1').disabled = true;
    recordset.module.field_by_full_name(m + '.应收汇日期').disabled = true;
    recordset.module.field_by_full_name(m + '.收汇日期').disabled = true;
    recordset.module.field_by_full_name(m + '.收汇金额').disabled = true;
    recordset.module.field_by_full_name(m + '.未收汇金额').disabled = true;
    recordset.module.field_by_full_name(m + '.此票结清').disabled = true;
    recordset.module.field_by_full_name(m + '.财务意见').disabled = true;
    recordset.module.field_by_full_name(m + '.累计未收汇').disabled = true;
    recordset.module.field_by_full_name(m + '.提交风控').disabled = true;
    recordset.module.field_by_full_name(m + '.风控审批').disabled = true;
    recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
    recordset.module.field_by_full_name(m + '.风控意见').disabled = true;
    recordset.module.field_by_full_name(m + '.是否超限').disabled = true;
    recordset.module.field_by_full_name(m + '.超限金额').disabled = true;
    recordset.module.field_by_full_name(m + '.超限次数').disabled = true;
    recordset.module.field_by_full_name(m + '.平均超限天数').disabled = true;
    recordset.module.field_by_full_name(m + '.超限天数').disabled = true;
    recordset.module.field_by_full_name(m + '.逾期天数').disabled = true;
    recordset.module.field_by_full_name(m + '.逾期金额').disabled = true;
    recordset.module.field_by_full_name(m + '.有无逾期').disabled = true;
    recordset.module.field_by_full_name(m + '.合同已交').disabled = true;
    recordset.module.field_by_full_name(m + '.债务确认函').disabled = true;
    recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
    recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
    recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
    recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
    recordset.module.field_by_full_name(m + '.放单清单.发票号码').disabled = true;
    recordset.module.field_by_full_name(m + '.放单清单.发票简写').disabled = true;
    recordset.module.field_by_full_name(m + '.放单清单.此票结清').disabled = true;
    recordset.module.field_by_full_name(m + '.放单清单.单证人员').disabled = true;
    if ((recordset.val('申请人员') == '' || recordset.val('申请人员') == username || recordset.val('业务人员') == username) && (recordset.val('提交财务') == '')) {
        if (recordset.val('是否特殊审批') == '是') {
            recordset.module.field_by_full_name('单证人员').disabled = false;
            recordset.module.field_by_full_name(m + '.放单清单.单证人员').disabled = false;
        }
        if (recordset.val('放单编号') != '') {
            recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
        }
        recordset.module.field_by_full_name(m + '.提交主管').disabled = false;
        recordset.module.field_by_full_name(m + '.提交风控').disabled = false;
        recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
        recordset.module.field_by_full_name('发票号码').disabled = false;
        recordset.module.field_by_full_name('发票简写').disabled = false;
        recordset.module.field_by_full_name('申请备注').disabled = false;
        recordset.module.field_by_full_name('货值合计').disabled = false;
        recordset.module.field_by_full_name('出运日期').disabled = false;
        recordset.module.field_by_full_name('实际出运').disabled = false;
        recordset.module.field_by_full_name('客户名称').disabled = false;
        recordset.module.field_by_full_name('RMB客户').disabled = false;
        recordset.module.field_by_full_name('是否信保').disabled = false;
        recordset.module.field_by_full_name('单证人员').disabled = false;
        recordset.module.field_by_full_name('业务部门').disabled = false;
        recordset.module.field_by_full_name('外销总额').disabled = false;
        recordset.module.field_by_full_name('客户RMB总价').disabled = false;
        recordset.module.field_by_full_name('佣金金额').disabled = false;
        recordset.module.field_by_full_name('暗佣合计').disabled = false;
        recordset.module.field_by_full_name('明佣合计').disabled = false;
        recordset.module.field_by_full_name(m + '.放单清单.发票号码').disabled = false;
        recordset.module.field_by_full_name(m + '.放单清单.发票简写').disabled = false;
    }
    if (recordset.val('提交财务') == username) {
        recordset.module.field_by_full_name(m + '.放单清单.此票结清').disabled = false;
    }
    if ((recordset.val('主管审批') == '待审批') && (recordset.val('提交财务') == username)) {
        recordset.module.field_by_full_name(m + '.放单清单.业务确认').disabled = true;
        if (recordset.val('财务审批') == '通过') {
            recordset.module.field_by_full_name(m + '.提交主管').disabled = false;
        } else {
            recordset.module.field_by_full_name(m + '.此票结清').disabled = false;
            recordset.module.field_by_full_name(m + '.财务审批').disabled = false;
            recordset.module.field_by_full_name(m + '.审批日期1').disabled = false;
            recordset.module.field_by_full_name(m + '.应收汇日期').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇日期').disabled = false;
            recordset.module.field_by_full_name(m + '.收汇金额').disabled = false;
            recordset.module.field_by_full_name(m + '.未收汇金额').disabled = false;
            recordset.module.field_by_full_name(m + '.财务意见').disabled = false;
            recordset.module.field_by_full_name(m + '.累计未收汇').disabled = false;
        }
    }
    if ((recordset.val('风控审批') == '待审批') && (recordset.val('提交主管') == username)) {
        if (recordset.val('主管审批') == '通过') {
            recordset.module.field_by_full_name(m + '.提交风控').disabled = false;
        }
        if (recordset.val('财务审批') == '通过') {
            recordset.module.field_by_full_name(m + '.主管审批').disabled = false;
            recordset.module.field_by_full_name(m + '.审批日期').disabled = false;
            recordset.module.field_by_full_name(m + '.审批意见').disabled = false;
        }
    }
    if ((recordset.val('总经理审批') == '待审批') && (recordset.val('提交风控') == username)) {
        recordset.module.field_by_full_name(m + '.放单清单.业务确认').disabled = true;
        if (recordset.val('风控审批') == '通过') {
            recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
        } else {
            if (recordset.val('主管审批') == '通过') {
                recordset.module.field_by_full_name(m + '.风控审批').disabled = false;
                recordset.module.field_by_full_name(m + '.1审批日期').disabled = false;
                recordset.module.field_by_full_name(m + '.风控意见').disabled = false;
                recordset.module.field_by_full_name(m + '.是否超限').disabled = false;
                recordset.module.field_by_full_name(m + '.超限金额').disabled = false;
                recordset.module.field_by_full_name(m + '.超限次数').disabled = false;
                recordset.module.field_by_full_name(m + '.平均超限天数').disabled = false;
                recordset.module.field_by_full_name(m + '.超限天数').disabled = false;
                recordset.module.field_by_full_name(m + '.逾期天数').disabled = false;
                recordset.module.field_by_full_name(m + '.逾期金额').disabled = false;
                recordset.module.field_by_full_name(m + '.有无逾期').disabled = false;
                recordset.module.field_by_full_name(m + '.合同已交').disabled = false;
                recordset.module.field_by_full_name(m + '.债务确认函').disabled = false;
            };
        }
    }
    if ((recordset.val('风控审批') == '通过') && (recordset.val('提交总经理') == username)) {
        recordset.module.field_by_full_name(m + '.总经理审批').disabled = false;
        recordset.module.field_by_full_name(m + '.1审批日期1').disabled = false;
        recordset.module.field_by_full_name(m + '.总经理意见').disabled = false;
    }
    _.http.post('/api/saier/bol_apply/load/check', {
        rid: recordset.val('rid'),
        khmc: recordset.val('客户名称'),
        tjzg: recordset.val('提交主管'),
        tjcw: recordset.val('提交财务'),
        tjfk: recordset.val('提交风控'),
        zjl: recordset.val('提交总经理'),
        kh_id: recordset.val('客户编号'),
        zjlsp: recordset.val('总经理审批'),
        zgsp: recordset.val('主管审批'),
        fksp: recordset.val('风控审批'),
        cwsp: recordset.val('财务审批'),
        shje: recordset.val('收汇金额'),
        path: recordset.val('业务'),
        lines: recordset.tables['放单清单'].view_data
    }).then(res => {
        let d = res.data;
        if (recordset.val('业务') == '') {
            recordset.val('业务', d.path)
        }
        if (recordset.val('提交主管') == '') {
            recordset.val('提交主管', d.tjzg)
            recordset._list[m + '.提交主管'] = d.zg_list;
        }
        if (recordset.val('提交风控') == '') {
            recordset.val('提交风控', d.tjfk)
        }
        if (recordset.val('提交总经理') == '') {
            recordset.val('提交总经理', d.zjl)
        }
        if (recordset.val('提交财务') == '') {
            recordset._list[m + '.提交财务'] = d.cw_list;
        }
        let qg_list = d.qg_list
        if (recordset.val('主管审批') == '待审批' && recordset.val('提交财务') == username && recordset.val('财务审批') != '通过' && recordset.val('收汇金额') == 0) {
            let data = d.data
            if (d.ljsh && Number(d.ljsh) != recordset.val('收汇金额')) {
                // _.ui.message.error('请注意收收汇金额由' + recordset.val('收汇金额') + '变更为' + Number(d.ljsh));
                recordset.val('收汇金额', Number(d.ljsh));
            }
            if (d.ljsh) recordset.val('未收汇金额', recordset.val('货值合计') - Number(d.ljsh));
            if (d.syrq) recordset.val('收汇日期', d.syrq);
            if (d.ljwsh) recordset.val('累计未收汇', recordset.val('未收汇金额') + Number(d.ljwsh));
            let t = recordset.tables['放单清单'];
            for (let l of t.view_data) {
                if (l.rid in data) {
                    l.sydje = data[l.rid]
                    t.push_modi_rid(l.rid)
                }
            }
            t.sync_operate_data()
            t.modified = true
        }
        if (recordset.val('总经理审批') == '待审批' && recordset.val('提交风控') == username && recordset.val('风控审批') != '通过' && recordset.val('主管审批') == '通过') {
            recordset.val('超限次数', d.cxcs)
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], bol_apply_recordLoad, '放单申请')

// 编辑界面字段change后执行
const bol_apply_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.是否超限') {
        _.http.post('/api/saier/bol_apply/sfcx/change', {
            kh_id: recordset.val('客户编号'),
            fphm: recordset.val('发票号码'),
            rid: recordset.val('rid')
        }).then(function (res) {
            let d = res.data;
            let cxcs = d.cxcs
            let cxts = d.cxts
            recordset.val('超限天数', 0)
            recordset.module.field_by_full_name('放单申请.超限次数').disabled = true
            if (recordset.val('是否超限') == '是') {
                recordset.module.field_by_full_name('放单申请.超限次数').disabled = false
                if (cxcs != 0) recordset.val('平均超限天数', Math.floor((cxts / cxcs) * 10) / 10)
            }
            recordset.val('超限次数', cxcs);

        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (field.full_name == m + '.超限天数') {
        _.http.post('/api/saier/bol_apply/sfcx/change', {
            kh_id: recordset.val('客户编号'),
            fphm: recordset.val('发票号码'),
            rid: recordset.val('rid')
        }).then(function (res) {
            let d = res.data;
            let cxcs = d.cxcs
            let cxts = d.cxts
            if (recordset.val('超限天数') > 0) {
                cxts = cxts + recordset.val('超限天数');
            }
            cxcs = cxcs + 1;
            if (cxcs != 0) recordset.val('平均超限天数', Math.floor((cxts / cxcs) * 10) / 10)
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (field.full_name == m + '.发票号码') {
        let fphm = recordset.val('发票号码');
        let tjcw = recordset.val('提交财务');
        let path = recordset.val('业务');
        if (fphm != '' && tjcw == '') {
            _.http.post('/api/saier/bol_apply/fphm/change', {
                fphm: fphm,
                path: path,
                khmc: recordset.val('客户名称'),
                kh_id: recordset.val('客户编号'),
                rid: recordset.val('rid'),
            }).then(function (res) {
                let d = res.data;
                if (d.fpsb == 0) {
                    _.ui.message.error('请注意此外销发票号为错误');
                    recordset.val('发票号码', '');
                    recordset.val('是否特殊审批', '否');
                    recordset.module.field_by_full_name(m + '.单证人员').disabled = true;
                    recordset.module.field_by_full_name(m + '.放单清单.单证人员').disabled = true;
                } else {
                    recordset.val('客户名称', d.khmc);
                    recordset.val('客户编号', d.kh_id);
                    recordset.val('出运日期', d.chyrq);
                    recordset.val('业务人员', d.ywry);
                    recordset.val('业务部门', d.ywbm);
                    recordset.val('RMB客户', d.khpd);
                    if (d.xybx == '有' || d.xybx == '是') {
                        recordset.val('是否信保', '是');
                    } else {
                        recordset.val('是否信保', '否');
                    }
                    recordset.val('结汇方式', d.jhfs);
                    // recordset.val('外销总额', d.wxje);
                    // recordset.val('货值合计', d.hzhj);
                    // recordset.val('佣金金额', d.yjje);
                    // recordset.val('客户RMB总价', d.mjzj);
                    // recordset.val('暗佣合计', d.ayjje);
                    // recordset.val('明佣合计', d.myjje);
                    if (d.sjcy1) {
                        recordset.val('实际出运', d.sjcy1)
                    } else {
                        recordset.val('实际出运', 0);
                    }
                    if (d.zdry) {
                        recordset.val('单证人员', d.zdry)
                    } else {
                        recordset.val('单证人员', '');
                    }
                    // if (d.hzry) { recordset.val('核账人员', d.hzry) } else { recordset.val('核账人员', ''); }
                    if (d.eta) {
                        recordset.val('预计到港', d.eta)
                    } else {
                        recordset.val('预计到港', '');
                    }
                    if (d.hxdh) {
                        recordset.val('单据确认时间', d.hxdh)
                    } else {
                        recordset.val('单据确认时间', '');
                    }
                    if (d.dfrq) {
                        recordset.val('电放日期', d.dfrq)
                    } else {
                        recordset.val('电放日期', '');
                    }
                    if (d.tshz != '否') {
                        recordset.val('是否特殊审批', '是');
                        _.ui.message.error('请注意此外销发票号为特殊审批')
                    } else {
                        recordset.val('是否特殊审批', '否');
                    }
                    let t = recordset.tables['放单清单'];
                    let v = t.view_data
                    let f = 0
                    for (let r of v) {
                        if (r.fphm == fphm) {
                            f = 1
                            break
                        }
                    }
                    if (f == 0) {
                        recordset.tables['放单清单'].append().then(() => {
                            recordset.val('放单清单.发票号码', fphm);
                        })
                    }
                    recordset.module.field_by_full_name(m + '.单证人员').disabled = false;
                    recordset.module.field_by_full_name(m + '.放单清单.单证人员').disabled = false;
                }
                if (d.path1 != '') {
                    recordset.val('业务', d.path1)
                }
                recordset.val('提交总经理', d.zjl);
                recordset.val('提交风控', d.fkzg);
                recordset.val('提交主管', d.tjzg);
                recordset._list[m + '.提交主管'] = d.zg_list;
                recordset._list[m + '.提交财务'] = d.cw_list;
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('发票号码', '');
            })
        }
    }
    if (field.full_name == m + '.放单清单.业务确认') {
        let ywqr = recordset.val('放单清单.业务确认');
        if (ywqr != '' && recordset.job == 1) {

        }
    }
    if (field.full_name == m + '.放单清单.发票号码') {
        let fphm = recordset.val('放单清单.发票号码');
        let khmc = recordset.val('放单清单.客户名称');
        let zbfp = recordset.val('发票号码');

        if (fphm == '' && khmc != '') {
            recordset.val('放单清单.客户名称', '');
        } else if (fphm != '' && khmc == '') {
            _.http.post('/api/saier/bol_apply/child/fphm/change', {
                fphm: fphm,
                zbfp: zbfp,
                xybx: recordset.val('是否信保'),
                rmbkh: recordset.val('RMB客户'),
                kh_id: recordset.val('客户编号'),
                rid: recordset.val('rid'),
            }).then(function (res) {
                let d = res.data;
                recordset.val('放单清单.客户名称', d.khmc);
                recordset.val('放单清单.出运日期', d.chyrq);
                recordset.val('放单清单.业务人员', d.ywry);
                recordset.val('放单清单.业务部门', d.ywbm);
                recordset.val('放单清单.RMB客户', d.khpd);
                if (d.xybx == '有' || d.xybx == '是') {
                    recordset.val('放单清单.是否信保', '是');
                } else {
                    recordset.val('放单清单.是否信保', '否');
                }
                recordset.val('放单清单.结汇方式', d.jhfs);
                recordset.val('放单清单.外销总额', d.wxje);
                recordset.val('放单清单.货值合计', d.hzhj);
                recordset.val('放单清单.佣金金额', d.yjje);
                recordset.val('放单清单.客户RMB总价', d.mjzj);
                recordset.val('放单清单.暗佣合计', d.ayjje);
                recordset.val('放单清单.明佣合计', d.myjje);
                if (d.sjcy1) {
                    recordset.val('放单清单.实际出运', d.sjcy1)
                } else {
                    recordset.val('放单清单.实际出运', 0);
                }
                if (d.zdry) {
                    recordset.val('放单清单.单证人员', d.zdry)
                } else {
                    recordset.val('放单清单.单证人员', '');
                }
                // if (d.hzry) { recordset.val('放单清单.核账人员', d.hzry) } else { recordset.val('放单清单.核账人员', ''); }
                if (d.eta) {
                    recordset.val('放单清单.预计到港', d.eta)
                } else {
                    recordset.val('放单清单.预计到港', '');
                }
                if (d.hxdh) {
                    recordset.val('放单清单.单据确认时间', d.hxdh)
                } else {
                    recordset.val('放单清单.单据确认时间', '');
                }
                if (d.dfrq) {
                    recordset.val('放单清单.电放日期', d.dfrq)
                } else {
                    recordset.val('放单清单.电放日期', '');
                }
                recordset.val('放单清单.收汇金额', d.hjsh);
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('放单清单.发票号码', '');
            })
        }
    }
    if (field.full_name == m + '.提交财务' && value != '') {
        if (recordset.val('放单编号') == '') {
            _.ui.message.error('请先填写放单编号');
            recordset.val('提交财务', '');
            return
        }
        if (recordset.val('提交财务') == _.user.username) {
            _.ui.message.error('提交财务不能是自己，请重新选择');
            recordset.val('提交财务', '');
        } else {
            _.http.post('/api/saier/bol_apply/tjcw/change', {
                bjdl: recordset.val('业务'),
                tjcw: recordset.val('提交财务'),
                tjzg: recordset.val('提交主管')
            }).then(function (res) {
                let d = res.data;
                if (recordset.val('提交主管') == '') {
                    recordset.val('提交主管', d.tjzg)
                }
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('提交财务', '');
            })
        }
    }
    if (field.full_name == m + '.提交主管' && value != '') {
        if (recordset.val('提交主管') == _.user.username) {
            _.ui.message.error('提交主管不能是自己，请重新选择');
            recordset.val('提交主管', '');
        } else {
            _.http.post('/api/saier/bol_apply/tjzg/change', {
                bjdl: recordset.val('业务'),
                tjzg: recordset.val('提交主管')
            }).then(function (res) {

            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('提交主管', '');
            })
        }
    }
    if (field.full_name == m + '.提交风控' && value != '') {
        if (recordset.val('提交风控') == _.user.username) {
            _.ui.message.error('提交风控不能是自己，请重新选择');
            recordset.val('提交风控', '');
        } else {
            _.http.post('/api/saier/bol_apply/tjcw/change', {
                bjdl: recordset.val('业务'),
                tjfk: recordset.val('提交风控'),
            }).then(function (res) {}).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('提交风控', '');
            })
        }
    }
    if (field.full_name == m + '.提交总经理') {
        if (value == '') {
            recordset.val('总经理审批', '')
            return
        }
        if (recordset.val('放单编号') == '') {
            _.ui.message.error('请先填写放单编号');
            recordset.val('提交总经理', '');
            return
        }
        if (recordset.val('提交总经理') == _.user.username) {
            _.ui.message.error('提交总经理不能是自己，请重新选择');
            recordset.val('提交总经理', '');
        } else {
            _.http.post('/api/saier/bol_apply/tjzjl/change', {
                bjdl: recordset.val('业务'),
                tjzjl: recordset.val('提交总经理')
            }).then(function (res) {
                if (recordset.val('提交主管') == recordset) {
                    recordset.val('总经理审批', '通过')
                }
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                recordset.val('提交总经理', '');
            })
        }

    }
    if (field.full_name == m + '.财务审批' && value != '' && value != '待审批') {
        if (recordset.val('财务审批') == '不通过') {
            recordset.val('财务审批', '待审批');
            recordset.val('提交财务', '');
            recordset.val('是否提交', '否');
            recordset.module.field_by_full_name('放单申请.财务审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批日期1').disabled = true;
            recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
            if (recordset.val('财务意见') == '') {
                _.ui.show_input_dialog('请输入财务意见', '').then(value => {
                    recordset.val('财务意见', value);
                })
            }
        } else if (recordset.val('财务审批') == '通过') {
            recordset.module.field_by_full_name('放单申请.提交主管').disabled = false;
            recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
            recordset.module.field_by_full_name('放单申请.财务审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批日期1').disabled = true;
            recordset.module.field_by_full_name('放单申请.应收汇日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.收汇日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.收汇金额').disabled = true;
            recordset.module.field_by_full_name('放单申请.未收汇金额').disabled = true;
            recordset.module.field_by_full_name('放单申请.财务意见').disabled = true;
            recordset.module.field_by_full_name('放单申请.累计未收汇').disabled = true;
            _.http.post('/api/saier/bol_apply/cwsp/change', {
                rid: recordset.val('rid'),
                khmc: recordset.val('客户名称')
            }).then(function (res) {
                let d = res.data;
                let ms = d.ms
                let zm = d.zm
                let tjzg = recordset.val('提交主管')
                if (ms == 1) {
                    if (tjzg == '侯柳红' || zm == '侯柳红') {
                        recordset.val('主管审批', '通过');
                        recordset.val('主管免审', '是');
                    }
                }
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        }
    }
    if (field.full_name == m + '.主管审批' && value != '' && value != '待审批') {
        if (recordset.val('主管审批') == '不通过') {
            recordset.val('主管审批', '待审批');
            recordset.val('提交财务', '');
            recordset.val('是否提交', '否');
            recordset.val('财务审批', '待审批');
            recordset.module.field_by_full_name('放单申请.主管审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批意见').disabled = true;
            recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
            if (recordset.val('审批意见') == '') {
                _.ui.show_input_dialog('请输入审批意见', '').then(value => {
                    recordset.val('审批意见', value);
                })
            }
        } else if (recordset.val('主管审批') == '通过') {
            recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
            recordset.module.field_by_full_name('放单申请.主管审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.审批意见').disabled = true;
        }
    }
    if (field.full_name == m + '.风控审批' && value != '' && value != '待审批') {
        let sb = 0
        if ((recordset.val('是否信保') != '是' && recordset.val('未收汇金额') > 0) || (recordset.val('是否信保') == '是' && recordset.val('超限金额') >0)) {
            sb = 1
        }
        if (recordset.val('合同已交') != '是' || recordset.val('债务确认函') != '是' || recordset.val('有无逾期') == '是') {
            sb = 1
        }
        if (recordset.val('客户名称')!='' && recordset.val('客户名称').indexOf('BEST PRICE') > -1) {
            sb = 1
        }
        if (recordset.val('风控审批') == '不通过') {
            recordset.val('主管审批', '待审批');
            recordset.val('提交财务', '');
            recordset.val('是否提交', '否');
            recordset.val('财务审批', '待审批');
            recordset.val('总经理审批', '待审批');
            recordset.val('风控审批', '待审批');

            recordset.module.field_by_full_name('放单申请.风控审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.1审批日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.风控意见').disabled = true;

            recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
            if (recordset.val('风控意见') == '') {
                _.ui.show_input_dialog('请输入风控意见', '').then(value => {
                    recordset.val('风控意见', value);
                })
            }
        } else if (recordset.val('风控审批') == '通过') {
            recordset.module.field_by_full_name('放单申请.主管审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.1审批日期').disabled = true;
            recordset.module.field_by_full_name('放单申请.风控意见').disabled = true;
            let tjzg = ''
            if (recordset.val('业务') != '') {
                tjzg = recordset.val('提交主管');
            }
            if (recordset.val('提交总经理') == tjzg) {
                recordset.val('总经理审批', '通过');
                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
            } else {
                _.ui.show_input_select_dialog('请选择是否提交总经理审批', '', ['总经理','单证']
                ).then(value => {
                    if (value != '总经理' && value != '单证') {
                        recordset.val('风控审批', '待审批');
                        recordset.val('1审批日期', null);
                    } else if (value == '单证') {
                        sb = 1
                    }
                })
            }
        }
    }
    if (field.full_name == m + '.总经理审批' && value != '' && value != '待审批') {
        if (recordset.val('总经理审批') == '不通过') {
            recordset.val('主管审批', '待审批');
            recordset.val('提交财务', '');
            recordset.val('是否提交', '否');
            recordset.val('财务审批', '待审批');
            recordset.val('风控审批', '待审批');
            recordset.module.field_by_full_name('放单申请.总经理审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.1审批日期1').disabled = true;
            recordset.module.field_by_full_name('放单申请.总经理意见').disabled = true;
            recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
            if (recordset.val('总经理意见') == '') {
                _.ui.show_input_dialog('请输入总经理意见', '').then(value => {
                    recordset.val('总经理意见', value);
                })
            }
        } else if (recordset.val('总经理审批') == '通过') {
            recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
            recordset.module.field_by_full_name('放单申请.总经理审批').disabled = true;
            recordset.module.field_by_full_name('放单申请.1审批日期1').disabled = true;
            recordset.module.field_by_full_name('放单申请.总经理意见').disabled = true;
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, bol_apply_field_change, '放单申请')


const bol_apply_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group != '放单清单') {
            resolve()
            return
        }
        if (recordset.val('提交财务') != '') {
            _.ui.message.error('不好意思已提交,您没有权限删除此资料,不能保存，请关闭再打开，谢谢')
            reject()
            return
        }
        if (recordset.val('发票号码') == recordset.val('放单清单.发票号码')) {
            _.ui.message.error('请注意此外销发票号为主要信息发票号码，主要信息发票号码将清空，请注意填写！');
            recordset.val('发票号码', '');
            recordset.val('发票简写', '');
            recordset.module.field_by_full_name('放单申请.发票号码').disabled = false;
            recordset.module.field_by_full_name('放单申请.发票简写').disabled = false;
        }
        _.http.post('/api/saier/bol_apply/child/delete/before', {
            fphm: recordset.val('放单清单.发票号码'),
        }).then(function (res) {
            resolve()
            recordset.save()
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
            reject()
        })
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], bol_apply_table_delete_before, '放单申请')


const bol_apply_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'batch_confirm_btn',
        "caption": '批量刷结清',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], bol_apply_FormShow, '放单申请')

const bol_apply_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '放单清单') {
        let btns = []
        btns.push({
            "name": 'incomes_update_btn',
            "caption": '刷新收汇',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'shipment_update_btn',
            "caption": '单证批量电放',
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
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], bol_apply_EditorChildShow, '放单申请')


const bol_apply_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'batch_confirm_btn') {
        let recordset = form.recordset
        if (form.is_editor === true) {
            if (recordset.modified == true) {
                _.ui.message.error('请先保存数据后再进行此操作')
                return
            }
        }
        _.http.post('/api/saier/bol_apply/batch/confirm', {
            // rid: recordset.val('rid'),
        }).then(res => {
            console.log(res)
            _.ui.message.success(res.msg)
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (btn.name == 'incomes_update_btn') {
        let recordset = form.recordset
        if (form.is_editor === true) {
            if (recordset.modified == true) {
                _.ui.message.error('请先保存数据后再进行生成费用申请操作')
                return
            }
        }
        _.http.post('/api/saier/bol_apply/batch/incomes', {
            fphm: recordset.val('发票号码'),
            kh_id: recordset.val('客户编号'),
            lines: recordset.tables['放单清单'].view_data
        }).then(res => {
            let d = res.data;
            let data = d.data
            if (Number(d.ljsh) != recordset.val('收汇金额')) {
                _.ui.message.error('请注意收收汇金额由' + recordset.val('收汇金额') + '变更为' + Number(d.ljsh));
                recordset.val('收汇金额', Number(d.ljsh));
            }
            if (d.ljsh) recordset.val('未收汇金额', recordset.val('货值合计') - Number(d.ljsh));
            if (d.syrq) recordset.val('收汇日期', d.syrq);
            if (d.ljwsh) recordset.val('累计未收汇', recordset.val('未收汇金额') + Number(d.ljwsh));
            let t = recordset.tables['放单清单'];
            for (let l of t.view_data) {
                if (l.rid in data) {
                    l.sydje = data[l.rid]
                    t.push_modi_rid(l.rid)
                }
            }
            t.sync_operate_data()
            t.modified = true
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }

    if (btn.name == 'shipment_update_btn') {
        let recordset = form.recordset
        if (form.is_editor === true) {
            if (recordset.modified === true) {
                _.ui.message.error('请先保存数据后再进行生成费用申请操作')
                return
            }
        }
        if (recordset.val('总经理审批') != '通过') {
            _.ui.message.error('总经理审批未通过，不能进行单证批量电放操作')
            return
        }
        _.http.post('/api/saier/bol_apply/batch/shipment', {
            rid: recordset.val('rid'),
            lines: recordset.tables['放单清单'].view_data
        }).then(res => {
            if (res.code == 0) {
                _.ui.message.error(res.msg)
                return
            }
            let d = res.data;
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                        file: d
                    },
                    recordset.val('发票号码') + '.xlsx'
                );
            }
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], bol_apply_BtnClick, '放单申请')


// 编辑界面记录保存前执行
const bol_apply_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let flag = 0
        let fp_list = []
        let dz_list = []
        if (recordset.val('财务审批') == '通过' && recordset.val('提交财务') == '') {
            _.ui.message.error(' 财务审批通过时提交财务为空不能保存');
            reject()
            return
        }
        if (recordset.val('提交财务') == _.user.username && recordset.val('财务审批') != '待审批' && recordset.val('主管审批') != '通过') {
            recordset.val('财务识别', _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'));
        } else {
            if (recordset.val('提交主管') == _.user.username && recordset.val('主管审批') != '待审批' && recordset.val('风控审批') != '通过') {
                recordset.val('经理识别', _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'));
            } else {
                if (recordset.val('风控审批') == _.user.username && recordset.val('风控审批') != '待审批' && recordset.val('总经理审批') != '通过') {
                    recordset.val('风控识别', _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'));
                } else {
                    if (recordset.val('总经理审批') == _.user.username && recordset.val('总经理审批') != '待审批') {
                        recordset.val('总经理识别', _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'));
                    }
                }
            }
        }
        let t = recordset.tables['放单清单']
        let d = t.view_data
        for (let r of d) {
            let fphm = r.fphm
            if (fphm != '' && fphm != undefined && fp_list.indexOf(fphm) < 0) {
                fp_list.push(r.fphm)
            }
            if (recordset.val('是否特殊审批') == '是' && (r.dzry == '' || r.dzry == undefined)) {
                r.dzry = recordset.val('单证人员')
                r.push_modi_rid(r.rid)
                flag = 1
            }
            let dzry = r.dzry
            if (dzry != '' && dzry != undefined && dz_list.indexOf(dzry) < 0) {
                dz_list.push(dzry)
            }
        }
        if (flag == 1) {
            t.sync_operate_data()
            t.modified = true
        }
        let x = recordset.tables['单证人员']
        let y = []
        x.clear()
        recordset.val('发票清单', fp_list.join('\n'));
        for (let dzry of dz_list) {
            let r = {}
            r.rid = _.utils.guid()
            r.pid = recordset.val('rid')
            r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
            r.uid = _.user.rid
            r.dzry = dzry
            y.push(r)
            t.push_new_rid(r.rid)
        }
        x.data = y
        x.sync_operate_data()
        x.modified = true
        resolve();
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, bol_apply_before_save, '放单申请')


const bol_apply_after_save = (evt_id, recordset) => {
    if ((recordset.val('wf_status') == 0 || recordset.val('wf_status') == 3)) {
        if (recordset.val('提交财务') == '') return
        if (recordset.val('uid') !== _.user.rid) return
        _.ui.confirm('是否提交审批？').then(() => {
            _.http.post('/api/saier/workflow/start', {
                rid: recordset.val('rid'),
                module: recordset.module.name,
                flow_name: '放单申请'
            }).then(res => {
                recordset.val('wf_status', 1)
                recordset.val('wf_status', '提交财务')
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    } else if (recordset.val('wf_status') == 1) {
        let current_unit = recordset.val('wf_unit')
        let next_unit = ''
        let wf_status = 1
        if (recordset.val('uid') == _.user.rid && recordset.val('提交财务') != '' && current_unit == '提交人员'){
            next_unit = '财务审批'
        } else if (recordset.val('提交财务') == _.user.username  && current_unit == '财务审批' && recordset.val('财务审批') != '待审批') {
            if (recordset.val('财务审批') != '通过') {
                next_unit = '提交人员'
                wf_status = 2
            } else {
                if (recordset.val('主管免审') == '是') {
                    next_unit = '风控审批'
                } else {
                    next_unit = '主管审批'
                }
            }
        } else if (recordset.val('提交主管') == _.user.username && current_unit == '主管审批' && recordset.val('主管审批') != '待审批' && recordset.val('财务审批') == '通过') {
            if (recordset.val('主管审批') != '通过') {
                next_unit = '提交人员'
                wf_status = 2
            } else {
                next_unit = '风控审批'
            }
        } else if (recordset.val('提交风控') == _.user.username && recordset.val('风控审批') != '待审批' && current_unit == '风控审批' && recordset.val('主管审批') == '通过') {
            if (recordset.val('风控审批') != '通过') {
                next_unit = '提交人员'
                wf_status = 2
            } else {
                if (recordset.val('总经理免审') == '是') {
                    next_unit = ''
                } else {
                    next_unit = '总经理审批'
                }
            }
        } else if (recordset.val('单证人员') == _.user.username && recordset.val('总经理审批') != '待审批' && current_unit == '总经理审批' && recordset.val('风控审批') == '通过') {
            if (recordset.val('总经理审批') != '通过') {
                next_unit = '提交人员'
                wf_status = 2
            } else {
                next_unit = ''
            }
        } else {
            return
        }
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
                status: wf_status,
                task_id: d.task_rid
            }).then(res => {
                recordset.val('wf_unit', next_unit)
                recordset.val('wf_status', wf_status)
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }).catch(r => {
            _.ui.message.error(r.msg);
            console.log(r);
        })
    }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, bol_apply_after_save, '放单申请')