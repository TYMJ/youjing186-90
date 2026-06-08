// 费用申请-字段改变主函数
const cost_apply_field_change = async (evt_id, opts) => {
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
    if (field.full_name == m + '.货款类型' && value != '') {
        _.http.post('/api/saier/cost_apply/hklx/change', {
            hklx: value
        }).then((res) => {
            let d = res.data || {};
            recordset.val('识别', d.wb10);
            recordset.val('付款类型', d.wb1);
            let t = recordset.tables['费用详情'];
            let v = t.view_data || [];
            for (let r of v) {
                recordset.val('费用详情.货款类型', d.wb1, r);
            }
            if (recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用' || recordset.val('货款类型') == '其他') {
                if (recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用') {
                    recordset.val('详情审批状态', '没通过');
                }
                recordset.module.field_by_full_name(m + '.费用内容').disabled = false
                recordset.module.field_by_full_name(m + '.费用详情.申请人员').disabled = false;
            } else {
                recordset.val('详情审批状态', '不需要');
                recordset.module.field_by_full_name(m + '.费用内容').disabled = true;
                recordset.module.field_by_full_name(m + '.费用详情.申请人员').disabled = true;
            }
            if (recordset.val('付款类型') == '差旅费' || recordset.val('付款类型') == '业务招待费') {
                recordset.module.group_by_name('报销费用').visible = true;
            } else {
                recordset.module.group_by_name('报销费用').visible = false;
            }
            if (recordset.val('货款类型') == '检测费') {
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
            } else {
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error('获取货款类型失败');
            recordset.val('货款类型', '');
        });
    }
    if (field.full_name == m + '.经办人员' && value != '') {
        _.http.post('/api/saier/cost_apply/jbry/change', {
            jbry: value
        }).then((res) => {
            let d = res.data || '';
            recordset.val('业务部门', d);
        }).catch((err) => {
            console.error(err);
            _.ui.message.error('获取经办人员失败');
            recordset.val('经办人员', '');
            recordset.val('业务部门', '');
        });
    }
    if (field.full_name == m + '.是否入部门费用' && value != '') {
        if (recordset.val('是否入部门费用') != '是') {
            recordset.module.field_by_full_name(m + '.核算部门').disabled = true;
        } else {
            recordset.module.field_by_full_name(m + '.核算部门').disabled = false;
        }
    }
    if (field.full_name == m + '.外销发票号' && value != '') {
        _.http.post('/api/saier/cost_apply/fphm/change', {
            fphm: value
        }).then((res) => {
            let d = res.data || {};
            let khmc = recordset.val('客户名称') || '';
            khmc = khmc.toUpperCase();

            if (khmc.indexOf('AMAZON') !== -1 || khmc.indexOf('AMZ') !== -1) {
                recordset.val('我方公司', '宁波景业国际贸易有限公司');
            }
            let khpd = d.khpd || '';
            if (khpd === '是') {
                recordset.val('合同金额', d.khrmbhj);
            } else {
                recordset.val('合同金额', d.htje);
            }
            let ysfp = d.ysfp || '';
            if (ysfp != null && ysfp != '') {
                recordset.val('核算发票', ysfp);
            } else {
                recordset.val('核算发票', recordset.val('外销发票号'));
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '获取外销发票号失败');
            recordset.val('外销发票号', '');
        });
    }

    if (field.full_name == m + '.客户名称') {
        if (recordset.val('客户名称') == '王超') {
            recordset.val('客户名称', '');
        } else {
            let khmc = recordset.val('客户名称') || '';
            khmc = khmc.toUpperCase();
            console.log(khmc)
            console.log(khmc.indexOf('AMAZON'))
            console.log(khmc.indexOf('AMZ'))
            if (khmc.indexOf('AMAZON') !== -1 || khmc.indexOf('AMZ') !== -1) {
                recordset.val('我方公司', '宁波景业国际贸易有限公司');
            }
        }
    }
    if (field.full_name == m + '.费用收回') {
        if (recordset.val('拜访单号') != '') {
            _.http.post('/api/saier/cost_apply/fysh/change', {
                fysh: value,
                bfdh: recordset.val('拜访单号')
            }).then((res) => {
                let d = res.data || '';
                recordset.val('业务部门', d);
            }).catch((err) => {
                console.error(err);
                _.ui.message.error('获取费用收回失败');
            });
        }
    }
    if (field.full_name == m + '.费用详情.外销发票号' && value != '') {
        _.http.post('/api/saier/cost_apply/fphm/change', {
            fphm: value,
            flag: 1
        }).then((res) => {
            let d = res.data || {};
            let f = d.cymx || 0
            if (f == 1) {
                recordset.val('费用详情.是否已出', '是', row);
                recordset.val('费用详情.客户名称', d.khmc, row);
                recordset.val('费用详情.RMB客户', d.RMBkh, row);
                recordset.val('费用详情.核算发票', d.ysfp, row);
            } else {
                recordset.val('费用详情.是否已出', '否', row);
                recordset.val('费用详情.核算发票', recordset.val('外销发票号'), row);
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '获取外销发票号失败');
            recordset.val('费用详情.外销发票号', '', row);
            recordset.val('费用详情.是否入部门费用', '否', row);
        });
    }
    if (field.full_name == m + '.费用详情.是否入部门费用' && value != '') {
        if (recordset.value('费用详情.是否入部门费用', row) == '是') {
            recordset.val('费用详情.外销发票号', '', row);
        }
    }
    if (field.full_name == m + '.费用详情.申请部门' && value != '') {
        if (recordset.value('费用详情.申请人员', row) == '') {
            _.http.post('/api/saier/cost_apply/sqbm/change', {
                sqbm: value
            }).then((res) => {
                let d = res.data || '';
                recordset.val('费用详情.提交主管', d, row);
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '申请部门取数号失败');
            });
        }
    }
    if (field.full_name == m + '.提交主管' && value != '') {
        let htje = 0;
        let cght = [];
        let sbz = '0';
        let zgsb = '1';
        let sb12 = '0';
        let t = recordset.tables['费用详情'];
        let v = t.view_data || [];
        for (let r of v) {
            htje += recordset.value('费用详情.申请金额', r) || 0;
            if (recordset.value('费用详情.采购合同', r) && cght.indexOf(recordset.value('费用详情.采购合同', r)) === -1) {
                cght.push(recordset.value('费用详情.采购合同', r));
            }
            if ((recordset.value('费用内容') === '' || recordset.value('费用详情.申请部门', r) === '' || recordset.value('费用详情.申请人员', r) === '') &&
                (recordset.value('货款类型') === '办公费用' || recordset.value('货款类型') === '快件费用')) {
                sbz = '1';
            }
            if ((recordset.value('费用详情.提交主管', r) !== recordset.value('提交主管')) && (recordset.value('货款类型') === '办公费用' || recordset.value('货款类型') === '快件费用')) {
                zgsb = '0';
            }
        }
        recordset.val('合同金额1', round(htje * 100) / 100);
        if (sbz == '1') {
            _.ui.message.error('请检查费用内容及详情里申请部门、申请人员是否填写，谢谢!');
            recordset.val('提交主管', '');
            recordset.val('提交总监', '');
            recordset.val('提交总经理', '');
            return
        }
        if (recordset.val('付款编号') == '' || recordset.val('详情审批状态') == '没通过' || recordset.job != 1) {
            _.ui.message.error('请先保存,或检查所有主管是否已批');
            recordset.val('提交主管', '');
            recordset.val('提交总监', '');
            recordset.val('提交总经理', '');
            return
        }
        if ((recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用') && (recordset.val('提交主管') == '谢培雅' || recordset.val('提交主管') == '王彬彬U' || zgsb == '1')) {
            sb12 = '1'
        }
        recordset.module.field_by_full_name(m + '.付款编号').disabled = true;
        recordset.module.field_by_full_name(m + '.我方公司').disabled = true;
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
        recordset.module.field_by_full_name(m + '.财务工厂').disabled = true;
        recordset.module.field_by_full_name(m + '.工厂编号').disabled = true;
        recordset.module.field_by_full_name(m + '.厂商名称').disabled = true;
        recordset.module.field_by_full_name(m + '.申请金额').disabled = true;
        recordset.module.field_by_full_name(m + '.开户银行').disabled = true;
        recordset.module.field_by_full_name(m + '.银行帐号').disabled = true;
        recordset.module.field_by_full_name(m + '.社会统一信用代码').disabled = true;
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.申请付款日期').disabled = true;
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.货款类型').disabled = true;
        recordset.module.field_by_full_name(m + '.付款形式').disabled = true;
        recordset.module.field_by_full_name(m + '.RMB客户').disabled = true;
        recordset.module.field_by_full_name(m + '.预计出货量').disabled = true;
        recordset.module.field_by_full_name(m + '.是否入部门费用').disabled = true;
        recordset.module.field_by_full_name(m + '.货款类型').disabled = true;
        recordset.module.field_by_full_name(m + '.付款形式').disabled = true;
        recordset.module.field_by_full_name(m + '.外销发票号').disabled = true;
        recordset.module.field_by_full_name(m + '.发票号码').disabled = true;
        recordset.module.field_by_full_name(m + '.采购合同').disabled = true;
        recordset.module.field_by_full_name(m + '.中文品名').disabled = true;
        recordset.module.field_by_full_name(m + '.开票工厂').disabled = true;
        recordset.module.field_by_full_name(m + '.已付金额').disabled = true;
        recordset.module.field_by_full_name(m + '.已收定金').disabled = true;
        recordset.module.field_by_full_name(m + '.数量').disabled = true;
        recordset.module.field_by_full_name(m + '.核算部门').disabled = true;
        recordset.module.field_by_full_name(m + '.是否收回').disabled = true;
        recordset.module.field_by_full_name(m + '.预计船期').disabled = true;
        recordset.module.field_by_full_name(m + '.经办人员').disabled = true;
        recordset.module.field_by_full_name(m + '.业务部门').disabled = true;
        recordset.module.field_by_full_name(m + '.合同金额').disabled = true;
        recordset.module.field_by_full_name(m + '.分配完成').disabled = true;
        recordset.module.field_by_full_name(m + '.备  注').disabled = true;
        recordset.module.field_by_full_name(m + '.领用人员').disabled = true;
        recordset.module.field_by_full_name(m + '.单据图片').disabled = true;
        recordset.module.field_by_full_name(m + '.提交主管').disabled = true;
        recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
        recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
        recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
        recordset.module.field_by_full_name(m + '.提交总监').disabled = true;
        recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
        recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
        recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
        recordset.module.field_by_full_name(m + '.提交财务').disabled = true;
        recordset.module.field_by_full_name(m + '.财务审批').disabled = true;
        recordset.module.field_by_full_name(m + '.批准金额').disabled = true;
        recordset.module.field_by_full_name(m + '.审批日期1').disabled = true;
        recordset.module.field_by_full_name(m + '.财务意见').disabled = true;
        recordset.module.field_by_full_name(m + '.付款类型').disabled = true;
        recordset.module.field_by_full_name(m + '.付款日期').disabled = true;
        recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
        recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
        recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
        recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.申请金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.发票号码').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.采购合同').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.外销发票号').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.合同金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.收支情况').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.费用详情').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.单据图片').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.时间').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.地点').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.天数').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.陪同人员').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.花费金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补贴天数').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补贴金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.公交费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.出租费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.其他费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.预支费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补领金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.归还金额').disabled = true;

        _.http.post('/api/saier/cost_apply/tjzg/change', {
            hklx: recordset.val('货款类型'),
            tjzg: recordset.val('提交主管'),
            rid: recordset.val('rid'),
            fkbh: recordset.val('付款编号'),
            wysp: recordset.val('唯一审批'),
            sb12: sb12
        }).then((res) => {
            let d = res.data || 0
            let khmc = recordset.val('客户名称') || '';
            let wxfp = recordset.val('外销发票号') || '';
            let wfgs = recordset.val('我方公司') || '';
            if (!d.user){
                return
            }
            khmc = khmc.toUpperCase();
            if (_.user.username == recordset.val('提交主管') && sb12 != '1') {
                recordset.val('业务部门', d.bm);
                if (d.user2.wb2) {
                    recordset.val('提交总监', d.user2.wb2);
                } else {
                    recordset.val('提交总监', d.user.wb2);
                }
                if (recordset.val('货款类型') == '检测费') {
                    recordset.val('提交总经理', '谢培雅');
                } else {
                    recordset.val('提交总经理', d.user.wb3);
                }
                if (khmc.indexOf('AMAZON') !== -1 || wxfp.indexOf('AMZ') !== -1 || wfgs == '宁波景业国际贸易有限公司') {
                    recordset.val('提交财务', d.user.wb8);
                } else {
                    recordset.val('提交财务', d.user.wb6);
                }
                recordset.val('是否提交', '是');
                if (recordset.val('提交主管') == recordset.val('唯一审批')) {
                    recordset.val('主管审批', '通过');
                }
                console.log('bbbbbbbbbb ')
                recordset.save(false)
            } else {
                recordset.val('业务部门', d.bm);
                recordset.val('提交总监', d.user.wb2);
                if (recordset.val('货款类型') == '检测费') {
                    recordset.val('提交总经理', '谢培雅');
                } else {
                    recordset.val('提交总经理', d.user.wb3);
                }
                if (khmc.indexOf('AMAZON') !== -1 || wxfp.indexOf('AMZ') !== -1 || wfgs == '宁波景业国际贸易有限公司') {
                    recordset.val('提交财务', d.user.wb8);
                } else {
                    recordset.val('提交财务', d.user.wb6);
                }
                recordset.val('是否提交', '是');
                recordset.val('主管审批', '通过');
                console.log('aaaaaaaaa ')
                if (recordset.val('总监审批') != '通过' && recordset.val('经理识别') == '') {
                    recordset.val('经理识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                }
                recordset.save(false)
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '提交主管失败');
            recordset.val('提交主管', '');
            recordset.val('提交总监', '');
            recordset.val('提交总经理', '');
        });
    }
    if (field.full_name == m + '.主管审批' && value != '') {
        if (recordset.val('主管审批') == '通过') {
            _.http.post('/api/saier/cost_apply/zgsp/change', {
                hklx: recordset.val('付款类型'),
                tjzg: recordset.val('提交主管')
            }).then((res) => {
                let d = res.data || 0
                let sb = ''
                if (recordset.val('申请金额') <= d) {
                    sb = '1'
                }
                console.log(recordset.val('申请金额'))
                console.log(d)
                console.log(sb)
                recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                if (_.user.username == recordset.val('提交总监') || sb == '1') {
                    recordset.val('总监审批', '通过');
                };
                if (_.user.username == recordset.val('提交总经理') || sb == '1') {
                    recordset.val('总经理审批', '通过');
                }
                recordset.module.field_by_full_name(m + '.提交总监').disabled = false;
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '主管审批失败');
            });
        } else {
            recordset.val('总监审批', '待审批');
            recordset.val('总经理审批', '待审批');
        }
    }
    if (field.full_name == m + '.经理识别' && value != '') {
        if (recordset.val('主管审批') != '待审批' && recordset.val('主管审批') != '') {
            let spyj = ''
            // if (recordset.val('主管审批') == '不通过' && recordset.val('主管意见') == '') {
            //     spyj = await _.ui.show_input_dialog('请输入主管意见');
            // }
            _.http.post('/api/saier/cost_apply/jlsb/change', {
                hklx: recordset.val('付款类型'),
                tjzg: recordset.val('提交主管'),
                spyj: spyj,
                zgsp: recordset.val('主管审批')
            }).then((res) => {
                let d = res.data || 0
                let sb = d.sb || '0'
                if (recordset.val('主管审批') == '不通过') {
                    recordset.val('主管意见', spyj);
                    recordset.val('主管审批', '待审批');
                    recordset.val('是否提交', '否');
                    recordset.val('提交主管', '');
                    recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                    recordset.tables['分配详情'].clear()
                } else if (recordset.val('主管审批') == '通过') {
                    if (sb == '1') {
                        recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.module.field_by_full_name(m + '.提交总监').disabled = false;
                        if (recordset.val('唯一审批') != recordset.val('提交总监') && recordset.val('提交总监') != '') {
                            if (recordset.val('提交总监') == _.user.username) {
                                recordset.val('总监审批', '通过');
                            }
                        } else if (recordset.val('唯一审批') == recordset.val('提交总监') && recordset.val('提交总监') != '') {
                            recordset.val('总监审批', '通过');
                        }
                        recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                        recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
                    } else {
                        recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
                        recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                        recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
                        recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                        recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
                        recordset.val('总监审批', '通过');
                        recordset.val('总经理审批', '通过');
                    }
                }
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '主管审批失败');
            });
        } else {
            recordset.val('总监审批', '待审批');
            recordset.val('总经理审批', '待审批');
        }
    }
    if (field.full_name == m + '.提交总监' && value != '') {
        if (recordset.val('付款编号') == '') {
            return
        }
        if (recordset.val('货款类型') == '检测费' && recordset.val('提交总监') == '侯柳红') {
            recordset.val('提交总监', '侯柳红');
        }
        _.http.post('/api/saier/cost_apply/tjzj/change', {
            hklx: recordset.val('货款类型'),
            tjzj: recordset.val('提交总监'),
            rid: recordset.val('rid'),
            fkbh: recordset.val('付款编号'),
            zgsp: recordset.val('主管审批'),
            wysp: recordset.val('唯一审批'),
        }).then((res) => {
            let d = res.data || 0
            if (_.user.username == recordset.val('提交总监')) {
                recordset.val('总监审批', '通过');
                recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
                recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
                recordset.save(false)
            } else {
                if (recordset.val('提交总监') != '' && recordset.val('提交总监') == recordset.val('唯一审批')) {
                    recordset.val('总监审批', '通过');
                    recordset.val('审批日期', new Date().format('yyyy-MM-dd'));
                    recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
                    recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                    recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
                    recordset.save(false)
                }
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '提交总监失败');
            recordset.val('提交总监', '');
        });
    }
    if (field.full_name == m + '.总监识别' && value != '') {
        if (recordset.val('总监审批') != '待审批' && recordset.val('总监审批') != '') {
            let spyj = ''
            // if (recordset.val('总监审批') == '不通过' && recordset.val('总监意见') == '') {
            //     spyj = await _.ui.show_input_dialog('请输入总监意见');
            // }
            _.http.post('/api/saier/cost_apply/zjsb/change', {
                hklx: recordset.val('货款类型'),
                tjzj: recordset.val('提交总监'),
                spyj: spyj,
                zjsp: recordset.val('总监审批')
            }).then((res) => {
                let d = res.data || 0
                let sb = d.sb || '0'
                if (recordset.val('总监审批') == '不通过') {
                    recordset.val('总监意见', spyj);
                    recordset.val('主管审批', '待审批');
                    recordset.val('总监审批', '待审批');
                    recordset.val('是否提交', '否');
                    recordset.val('提交总监', '');
                    recordset.val('提交主管', '');
                    recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                    recordset.tables['分配详情'].clear()
                } else if (recordset.val('总监审批') == '通过') {
                    if (sb == '1') {
                        recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
                        if (recordset.val('唯一审批') != recordset.val('提交总经理') && recordset.val('提交总经理') != '') {
                            if (recordset.val('提交总经理') == _.user.username) {
                                recordset.val('总经理审批', '通过');
                            }
                        } else if (recordset.val('唯一审批') == recordset.val('提交总经理') && recordset.val('提交总经理') != '') {
                            recordset.val('总经理审批', '通过');
                        }
                        recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                        recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                    } else {
                        recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                        recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
                        recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                        recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
                        recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                        recordset.val('总经理审批', '通过');
                    }
                }
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '主管审批失败');
            });
        } else {
            recordset.val('总监审批', '待审批');
            recordset.val('总经理审批', '待审批');
        }
    }
    if (field.full_name == m + '.总监审批' && value != '') {
        if (recordset.val('总监审批') == '通过') {
            _.http.post('/api/saier/cost_apply/zgsp/change', {
                hklx: recordset.val('货款类型'),
                tjzg: recordset.val('提交总监')
            }).then((res) => {
                let d = res.data || 0
                let sb = ''
                if (recordset.val('申请金额') <= d) {
                    sb = '1'
                }
                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                if (_.user.username == recordset.val('提交总经理') || sb == '1') {
                    recordset.val('总经理审批', '通过');
                }
                if (recordset.val('货款类型') == '检测费') {
                    recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
                } else {
                    recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
                }
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '总监审批失败');
            });
        } else {
            recordset.val('总经理审批', '待审批');
        }
    }
    if (field.full_name == m + '.提交总经理') {
        if (recordset.val('付款编号') == '') {
            return
        }
        if (recordset.val('提交总经理') == '') {
            recordset.val('总经理审批', '待审批');
            return
        }
        _.http.post('/api/saier/cost_apply/tjzj/change', {
            tjzjl: recordset.val('提交总经理'),
            rid: recordset.val('rid'),
            fkbh: recordset.val('付款编号'),
            zgsp: recordset.val('总监审批'),
            wysp: recordset.val('唯一审批'),
        }).then((res) => {
            let d = res.data || 0
            if (_.user.username == recordset.val('提交总经理')) {
                recordset.val('总经理审批', '通过');
                recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
                recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
                recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
                recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
                recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
                recordset.save(false)
            } else {
                if (recordset.val('提交总经理') != '' && recordset.val('提交总经理') == recordset.val('唯一审批')) {
                    recordset.val('总经理审批', '通过');
                    recordset.val('1审批日期', new Date().format('yyyy-MM-dd'));
                    recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                    recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
                    recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                    recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
                    recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
                    recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
                    recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
                    recordset.save(false)
                }
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '提交总监失败');
            recordset.val('提交总监', '');
        });
    }
    if (field.full_name == m + '.总经理识别' && value != '') {
        if (recordset.val('总经理审批') != '待审批' && recordset.val('总经理审批') != '') {
            let spyj = ''
            // if (recordset.val('总经理审批') == '不通过' && recordset.val('总经理意见') == '') {
            //     spyj = await _.ui.show_input_dialog('请输入总经理意见');
            // }
            _.http.post('/api/saier/cost_apply/zjlsb/change', {
                hklx: recordset.val('货款类型'),
                tjzj: recordset.val('提交总经理'),
                tjcw: recordset.val('提交财务'),
                rid: recordset.val('rid'),
                spyj: spyj,
                zjlsp: recordset.val('总经理审批')
            }).then((res) => {
                let d = res.data || 0
                let sb = d.sb || '0'
                if (recordset.val('总经理审批') == '不通过') {
                    recordset.val('总监意见', spyj);
                    recordset.val('总经理审批', '待审批');
                    recordset.val('总监审批', '待审批');
                    recordset.val('主管审批', '待审批');
                    recordset.val('提交总经理', '');
                    recordset.val('是否提交', '否');
                    recordset.val('提交总监', '');
                    recordset.val('提交主管', '');
                    recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
                    // recordset.tables['分配详情'].clear()
                } else if (recordset.val('总经理审批') == '通过') {
                    // if (recordset.val('提交总经理') == _.user.username) {
                    //     recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
                    // }
                    recordset.val('1审批日期1', new Date().format('yyyy-MM-dd'));
                    recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
                }
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '总经理审批失败');
            });
        } else {
            recordset.val('总监审批', '待审批');
            recordset.val('总经理审批', '待审批');
        }
    }
    if (field.full_name == m + '.提交财务' && value != '') {
        if (recordset.val('付款编号') == '') {
            return
        }
        _.http.post('/api/saier/cost_apply/tjcw/change', {
            tjcw: recordset.val('提交财务'),
            rid: recordset.val('rid'),
            fkbh: recordset.val('付款编号'),
            zjlsp: recordset.val('总经理审批'),
        }).then((res) => {
            let d = res.data || 0
            if (recordset.val('总经理审批') == '通过') {
                recordset.module.field_by_full_name(m + '.提交主管').disabled = true;
                recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
                recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
                recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
                recordset.module.field_by_full_name(m + '.提交总监').disabled = true;
                recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
                recordset.module.field_by_full_name(m + '.1审批日期').disabled = true;
                recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
                recordset.module.field_by_full_name(m + '.提交财务').disabled = true;
                recordset.module.field_by_full_name(m + '.财务审批').disabled = true;
                recordset.module.field_by_full_name(m + '.批准金额').disabled = true;
                recordset.module.field_by_full_name(m + '.审批日期1').disabled = true;
                recordset.module.field_by_full_name(m + '.财务意见').disabled = true;
                recordset.module.field_by_full_name(m + '.付款类型').disabled = true;
                recordset.module.field_by_full_name(m + '.付款日期').disabled = true;
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
                recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
                recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
                recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
                recordset.save(false)
            }
        }).catch((err) => {
            console.error(err);
            _.ui.message.error(err.msg || '提交总监失败');
            recordset.val('提交财务', '');
        });
    }
    if (field.full_name == m + '.财务识别' && value != '') {
        if (recordset.val('财务审批') != '待审批') {
            let cwyj = ''
            if (recordset.val('财务审批') == '不通过' && recordset.val('财务意见') == '') {
                cwyj = await _.ui.show_input_dialog('请输入财务意见');
            }
            _.http.post('/api/saier/cost_apply/cwsp/change', {
                hklx: recordset.val('货款类型'),
                cwsp: recordset.val('财务审批'),
                tjcw: recordset.val('提交财务'),
                fkbh: recordset.val('付款编号'),
                jbry: recordset.val('经办人员'),
                khmc: recordset.val('客户名称'),
                gsmc: recordset.val('我方公司'),
                wxfp: recordset.val('外销发票号'),
                sqje: recordset.val('申请金额'),
                rid: recordset.val('rid'),
                cwyj: cwyj || '',
                lines: recordset.tables['费用详情'].view_data
            }).then((res) => {
                let d = res.data || 0
                recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
                let t = recordset.tables['费用详情'];
                let v = t.view_data || [];
                let cw1 = d.cw1 || '';
                let strnumber = d.strnumber || '';
                let cwzj = d.cwzj || '';

                for (let r of v) {
                    recordset.val('费用详情.财务审批', recordset.val('财务审批'), r);
                    recordset.val('费用详情.货币代码', recordset.val('货币代码'), r);
                    recordset.val('费用详情.是否入部门费用', recordset.val('是否入部门费用'), r);
                    if (recordset.val('财务审批') == '通过' || recordset.val('财务审批') == '通过返回') {
                        recordset.val('费用详情.付款编号', recordset.val('付款编号'), r);
                        recordset.val('费用详情.付款日期', recordset.val('付款日期'), r);
                        recordset.val('费用详情.核算部门', recordset.val('核算部门'), r);
                        if (recordset.val('货币代码').indexOf('RMB') != -1 || recordset.val('货币代码').indexOf('rmb') != -1 || recordset.val('货币代码').indexOf('￥') != -1) {
                            recordset.val('费用详情.RMB费用', recordset.value('费用详情.申请金额', r), r);
                        } else {
                            recordset.val('费用详情.USD费用', recordset.value('费用详情.申请金额', r), r);
                        }
                    }
                }
                if (recordset.val('财务审批') == '不通过') {
                    recordset.val('财务审批', '待审批');
                    recordset.val('主管审批', '待审批');
                    recordset.val('总经理审批', '待审批');
                    recordset.val('总监审批', '待审批');
                    recordset.val('提交主管', '');
                    recordset.val('提交总监', '');
                    recordset.val('提交总经理', '');
                    recordset.val('提交财务', '');
                    recordset.val('是否提交', '否');
                    recordset.val('付款日期', '');
                    recordset.val('批准金额', 0);
                    recordset.val('财务意见', cwyj || '');
                } else if (recordset.val('财务审批') == '通过' || (recordset.val('财务审批') == '通过返回')) {
                    if (recordset.val('付款日期') == '' || recordset.val('付款日期') == null) {
                        recordset.val('付款日期', new Date().format('yyyy-MM-dd'));
                    }
                    recordset.val('批准金额', recordset.val('申请金额'));
                    if (cw1 != '' && cw1 != null && strnumber != '' && strnumber != null) {
                        recordset.val('打印财务', cw1);
                    }
                    if (cwzj != '' && cwzj != null && cwzj != recordset.val('提交财务')) {
                        recordset.val('财务审批', '待审批');
                        recordset.val('提交财务', cwzj);
                    }
                }
                recordset.val('审批日期1', new Date().format('yyyy-MM-dd'));
            }).catch((err) => {
                console.error(err);
                _.ui.message.error(err.msg || '总监审批失败');
            });
        } else {
            recordset.val('财务审批', '待审批');
            recordset.val('提交财务', '待审批');
        }
    }
}
// 注册字段变更事件
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, cost_apply_field_change, '费用申请')


// 子表记录新建复制后事件
const cost_apply_table_new_copy_after = (evt_id, table, recordset) => {
    if (table.group == "费用详情") {
        recordset.val('费用详情.发送识别', '否');
        recordset.val('费用详情.费用唯一', recordset.val('费用详情.rid'));
        _.http.post('/api/saier/cost_apply/child/new', {
            hklx: recordset.val('货款类型'),
        }).then(res => {
            let d = res.data || ''
            recordset.val('费用详情.货款类型', d);
        }).catch(err => {
            console.error('费用详情新建复制后检查失败', err);
            _.ui.message.error((err && err.msg) || '费用详情新建复制后检查失败');
        });
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], cost_apply_table_new_copy_after, '费用申请')


const cost_apply_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '费用详情审批') {
        let btns = []
        btns.push({
            "name": 'audit_pass_btn',
            "caption": '通过',
            "icon": 'any-server-update',
        })
        btns.push({
            "name": 'batch_pass_btn',
            "caption": '批量通过',
            "icon": 'any-copy',
        })
        form.toolbar.add([{
            "name": 'audit_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
    if (form.group.value.name == '费用详情') {
        console.log('费用详情显示 b');
        let btns = []
        btns.push({
            "name": 'cost_apply_excel_import',
            "caption": 'Excel导入',
            "icon": 'any-server-update',
        });
        
        form.toolbar.add([{
            "name": 'detail_export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
        console.log('费用详情显示 a');
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], cost_apply_EditorChildShow, '费用申请')

const cost_apply_before_save = (evt_id, recordset) => {
    return new Promise(async (resolve, reject) => {
        if (recordset.val('是否开票') == '否' && recordset.val('信保代码') != '' && recordset.val('付款类型') == '打样费') {
            _.ui.message.error('请注意此客人为信保客人\n有报关率要求:' + recordset.val('报关率要求'));
            reject()
            return
        }
        if ((recordset.val('是否开票') == '' || recordset.val('客户名称') == '') && recordset.val('付款类型') == '打样费' && recordset.val('经办人员') == _.user.username) {
            _.ui.message.error('请注意货款类型为开模费、制版费或打样费则客户名称和是否开票为必填');
            reject()
            return
        }
        if (recordset.val('识别') == '是' && (recordset.val('客户名称') == '' || recordset.val('工厂编号') == '' || recordset.val('厂商名称') == '' || recordset.val('产品编号') == '' || recordset.val('中文品名') == '' || recordset.val('RMB客户') == '')) {
            _.ui.message.error('客户名称,工厂编号,厂商名称,产品编号,中文品名,RMB客户为必填!');
            reject()
            return
        }
        if (recordset.val('是否入部门费用') == '是' && recordset.val('外销发票号') != '') {
            _.ui.message.error('外销发票号和是否入部门费用只能选一个!');
            reject()
            return
        }
        if (recordset.val('是否入部门费用') != '是' && recordset.val('外销发票号') == '') {
            _.ui.message.error('请填写外销发票号后在保存!');
            reject()
            return
        }
        if (recordset.val('是否入部门费用') == '是' && recordset.val('核算部门') == '') {
            _.ui.message.error('请填写核算部门后在保存!');
            reject()
            return
        }
        if (recordset.val('是否入部门费用') != '是' && recordset.val('申请金额1') != recordset.val('申请金额')) {
            _.ui.message.error('请注意申请金额有问题请核对后在保存!');
            reject()
            return
        }
        if ((recordset.val('预计船期') == '' || recordset.val('预计船期') == null) && recordset.val('外销发票号') != '') {
            _.ui.message.error('预计船期为必填!');
            reject()
            return
        }
        _.http.post('/api/saier/cost_apply/save/before', {
            main: recordset.tables['费用申请'].view_data,
            lines: recordset.tables['费用详情审批'].view_data,
            costs: recordset.tables['费用详情'].view_data,
        }).then(res => {
            let d = res.data || {};
            let zdzt = d.zdzt || '';
            let jbpath = d.jbpath || '';
            let rid_json = d.rid_json || {};
            let cwsb = d.cwsb || '';
            let sb = ''
            let khmc = recordset.val('客户名称') || '';
            khmc = khmc.toUpperCase();
            if (zdzt == 1) {
                recordset.val('详情审批状态', '全通过');
                // console.log('主管审批通过aaaa', zdzt);
                // 注销，因为提交主管是需要手动选择，这个时候如果没有选择提交主管而直接通过会导致下面流程有问题
                // recordset.val('主管审批', '通过');
            } else {
                recordset.val('详情审批状态', '没通过');
                recordset.val('主管审批', '待审批');
            }
            if (recordset.val('是否开票') == '是' && d.gsmc != '' && d.gsmc != null) {
                recordset.val('我方公司', d.gsmc);
            }
            if (recordset.val('付款类型') == '') {
                recordset.val('付款类型', '正常付款');
            }
            recordset.val('唯一字段', recordset.val('rid'));
            if (recordset.val('货款类型') == '检测费') {
                recordset.val('提交总经理', '谢培雅');
            }
            let i2 = 0
            let i3 = 0
            let fssb = ''
            let hsbm = []
            let hsbm1 = ''
            let wysp = ''
            let wysp1 = ''
            let t = recordset.tables['费用详情'];
            let v = t.view_data || [];

            for (let r of v) {
                console.log('费用详情r', r);
                let rid = recordset.value('费用详情.rid', r);
                console.log('费用详情rid', rid);
                let zgqr = rid_json[rid];
                console.log('费用详情主管确认', zgqr);
                if (recordset.value('费用详情.经办path', r) != jbpath) {
                    recordset.val('费用详情.经办path', jbpath, r);
                }
                recordset.val('费用详情.是否入部门费用', recordset.val('是否入部门费用'), r);
                recordset.val('费用详情.货款类型', recordset.val('货款类型'), r);
                if (recordset.value('费用详情.外销发票号', r) == '') {
                    recordset.val('费用详情.外销发票号', recordset.val('外销发票号'), r);
                }
                i2 = i2 + 1;
                if (recordset.val('外销发票号') == recordset.value('费用详情.外销发票号', r)) {
                    i3 = i3 + 1;
                }
                if (zgqr !== undefined && zgqr != '' && zgqr != null) {
                    recordset.val('费用详情.主管确认', zgqr, r);
                }
                if (recordset.val('外销发票号') != '') {
                    if (recordset.value('费用详情.提交主管', r) != '') {
                        if (recordset.value('费用详情.申请部门', r) != '') {
                            if (hsbm.indexOf(recordset.value('费用详情.申请部门', r)) < 0) {
                                hsbm.push(recordset.value('费用详情.申请部门', r));
                                if (hsbm1 == '') {
                                    hsbm1 = recordset.value('费用详情.申请部门', r);
                                } else {
                                    hsbm1 += ';' + recordset.value('费用详情.申请部门', r);
                                }
                            }
                        }
                        if (wysp == '') {
                            wysp = recordset.value('费用详情.提交主管', r);
                            wysp1 = '1';
                        } else {
                            if (wysp != recordset.value('费用详情.提交主管', r)) {
                                wysp1 = '2';
                            }
                        }
                    }
                    if (khmc == 'SIA FP LV' && recordset.val('货款类型') == '检测费' && recordset.value('费用详情.产品编号', r) == '' && recordset.value('费用详情.外销合同', r) == '') {
                        fssb = '1';
                    }
                }
            }
            console.log('i2', i2);
            if (recordset.val('外销发票号') != '') {
                if ((recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用') && (hsbm.length != 0) && (recordset.val('是否入部门费用') == '是')) {
                    recordset.val('核算部门', hsbm.join(';'));
                }
                if (wysp1 == '1' && (recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用')) {
                    recordset.val('唯一审批', wysp);
                } else {
                    recordset.val('唯一审批', 'zjnblh');
                }
            }
            if (i2 > 0 && i3 == 0) {
                if (cwsb != '1') {
                    _.ui.message.error('请注意,费用详情需有主发票号,请核对后在保存!');
                    reject();
                    return
                }
            }
            console.log('3333', '');
            if (i2 == 0) {
                let t = recordset.tables['费用详情'];
                t.append();
                let r = t.view_data[0];
                recordset.val('费用详情.外销发票号', recordset.val('外销发票号'), r);
                recordset.val('费用详情.申请金额', recordset.val('申请金额'), r);
                recordset.val('费用详情.货款类型', recordset.val('付款类型'), r);
                recordset.val('费用详情.是否入部门费用', recordset.val('是否入部门费用'), r);
                recordset.val('费用详情.客户名称', recordset.val('客户名称'), r);
                recordset.val('详情审批状态', '没通过');
            }
            if (recordset.val('保存') == '否') {
                _.ui.message.error('非法删除，系统不能保存!');
                reject();
                return
            }
            console.log('aaa', '');
            if (recordset.val('提交主管') == _.user.username || recordset.val('经办人员') == _.user.username || recordset.val('提交总监') == _.user.username || recordset.val('提交总经理') == _.user.username || recordset.val('提交财务') == _.user.username) {
                if ((recordset.val('提交主管') == _.user.username && recordset.val('主管审批') != '待审批') && recordset.val('总监审批') == '待审批') {
                    recordset.val('经理识别', new Date().format('yyyy-MM-dd hh:mm:ss'))
                    console.log('bbbb111', '');
                } else {
                    if ((recordset.val('提交总监') == _.user.username || recordset.val('总监审批') != '待审批') && recordset.val('总经理审批') == '待审批' && recordset.val('主管审批') == '通过') {
                        recordset.val('总监识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                        console.log('ccc', '');
                    } else {
                        if ((recordset.val('提交总经理') == _.user.username || recordset.val('总经理审批') != '待审批') && recordset.val('财务审批') == '待审批' &&
                            recordset.val('主管审批') == '通过' && recordset.val('总监审批') == '通过') {
                            recordset.val('总经理识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                            console.log('ddd', '');
                        } else {
                            if (recordset.val('提交财务') == _.user.username && recordset.val('财务审批') != '待审批' && recordset.val('主管审批') == '通过' && recordset.val('总经理审批') == '通过' &&
                                recordset.val('总监审批') == '通过' && recordset.val('主管审批') == '通过') {
                                recordset.val('财务识别', new Date().format('yyyy-MM-dd hh:mm:ss'));
                                console.log('eee', '');
                            }
                        }
                    }
                }
            }
            console.log('fff', '');
            recordset.val('修改人员', _.user.username);
            console.log('bbb', '');
            let n = '';
            let y = '';
            let sb2 = '';
            let sb1 = '';
            let kpxhz = 0;
            let zkfy = 0;
            let zkfy1 = 0;
            let zkfyz1 = 0;
            let syzk = 0;
            let zkfyz2 = 0;
            let sqzk = 0;
            let sffp1 = 0
            let i4 = 0;
            let sb121 = 0;
            let sb12 = '';
            let x = recordset.tables['费用详情'];
            for (let r of x.view_data) {
                if (recordset.value('费用详情.提交主管', r) != '') {
                    sb12 = '1';
                    if (recordset.value('费用详情.主管确认', r) == '待审批') {
                        sb121 = sb121 + 1;
                        recordset.val('详情审批状态', '没通过');
                    }
                }
                i4 = i4 + 1;
                recordset.val('费用详情.费用内容', recordset.val('费用内容'), r);
                recordset.val('费用详情.付款编号', recordset.val('付款编号'), r);
                recordset.val('费用详情.厂商名称', recordset.val('厂商名称'), r);
                recordset.val('费用详情.申请付款日期', recordset.val('申请付款日期'), r);
                recordset.val('费用详情.1审批日期1', recordset.val('1审批日期1'), r);
                recordset.val('费用详情.付款形式', recordset.val('付款形式'), r);
                if (recordset.value('费用详情.唯一字段', r) == '') {
                    recordset.val('费用详情.唯一字段', recordset.value('费用详情.rid', r), r);
                }
                if (recordset.value('费用详情.客户名称', r) == '') {
                    recordset.val('费用详情.客户名称', recordset.value('客户名称'), r);
                }
                recordset.val('费用详情.RMB客户', recordset.val('RMB客户'), r);
                recordset.val('费用详情.经办人员', recordset.val('经办人员'), r);
                recordset.val('费用详情.付款类型', recordset.val('付款类型'), r);
                recordset.val('费用详情.付款日期', recordset.val('付款日期'), r);
                recordset.val('费用详情.核算部门', recordset.val('核算部门'), r);
                recordset.val('费用详情.领用人员', recordset.val('领用人员'), r);
                recordset.val('费用详情.货币代码', recordset.val('货币代码'), r);
                if (recordset.value('费用详情.是否已出', r) == '') {
                    recordset.val('费用详情.是否已出', '否', r);
                }
                if (recordset.value('费用详情.是否已入', r) == '') {
                    recordset.val('费用详情.是否已入', '否', r);
                }
                if (recordset.value('费用详情.费用唯一', r) == '') {
                    recordset.val('费用详情.费用唯一', recordset.value('费用详情.rid', r), r);
                }
            }
            console.log('1111', '');
            if (cwsb == '2') {
                if (sb12 == '1' && sb121 > 0) {
                    recordset.val('详情审批状态', '没通过');
                } else {
                    if (sb12 == '1') {
                        recordset.val('详情审批状态', '全通过');
                    } else {
                        recordset.val('详情审批状态', '不需要');
                    }
                }
            }
            console.log('ccc', '');
            if (recordset.val('费用内容') == '' && (recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用')) {
                _.ui.message.error('货款类型为办公费用或快件费用则费用内容为必填!');
                reject();
                return
            }
            if (fssb == '1') {
                _.ui.message.error('请注意SIA FP LV客人的检测费用详情中申请产品和外销合同号为必填!');
                reject();
                return
            }
            console.log('ddd', '');
            setTimeout(() => {
                resolve();
            }, 300);
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.error('费用申请保存前检查失败', err);
            reject();
        });
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, cost_apply_before_save, '费用申请')



const cost_apply_after_save = (evt_id, recordset) => {
    _.http.post('/api/saier/cost_apply/save/after', {
        rid: recordset.val('rid'),
        main: recordset.tables['费用申请'].view_data,
    }).then(res => {
        // 保存后无需处理返回结果
        if (recordset.val('付款编号') != '' && recordset.val('付款编号') != '待生成' && recordset.val('提交主管') == '' && recordset.val('经办人员') == _.user.username){
            recordset.module.field_by_full_name('费用申请.提交主管').disabled = false;
            recordset.module.field_by_full_name('费用申请.提交总监').disabled = false;
            recordset.module.field_by_full_name('费用申请.提交财务').disabled = false;
            recordset.module.field_by_full_name('费用申请.提交总经理').disabled = false;
        }
        if (recordset.val('主管审批')=='待审批'){
            recordset.module.field_by_full_name('费用申请.总监审批').disabled = true;
            recordset.module.field_by_full_name('费用申请.总经理审批').disabled = true;
            recordset.module.field_by_full_name('费用申请.财务审批').disabled = true;
        }
        if (recordset.val('总监审批')=='待审批'){
            recordset.module.field_by_full_name('费用申请.总经理审批').disabled = true;
            recordset.module.field_by_full_name('费用申请.财务审批').disabled = true;
        }
        if (recordset.val('总经理审批')=='待审批'){
            recordset.module.field_by_full_name('费用申请.财务审批').disabled = true;
        }
        if (recordset.val('财务审批')=='通过'){
            recordset.module.field_by_full_name('费用申请.总经理审批').disabled = true;
        }
    }).catch(err => {
        console.error('费用申请保存后处理失败', err);
        _.ui.message.error((err && err.msg) || '费用申请保存后处理失败');
        // 不需要提示用户保存后处理失败，避免用户误以为保存失败
    });
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, cost_apply_after_save, '费用申请')


// 编辑界面数据加载以后执行
const cost_apply_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username
    let i = 0;
    if (recordset.val('是否开票') == '否' && recordset.val('信保代码') != '' && recordset.val('付款类型') == '打样费') {
        _.ui.message.error('请注意此客人为信保客人\n有报关率要求:' + recordset.val('报关率要求'));
    }
    if ((recordset.val('经办人员') != _.user.username && recordset.val('经办人员') != '') || recordset.val('提交主管') != '') {
        recordset.tables['费用详情']._.toolbar.show('delete', false)
        recordset.tables['费用详情']._.toolbar.show('new', false)
        recordset.tables['费用详情']._.toolbar.show('copy', false)
        recordset.tables['费用详情']._.toolbar.show('insert-data', false)
    }
    recordset.module.group_by_name('费用详情审批').visible = false;
    console.log('费用详情审批 99999');
    recordset.module.group_by_name('报销费用').visible = false;
    if (recordset.val('货款类型') == '检测费') {
        recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
    } else {
        recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
    }
    _.http.post('/api/saier/cost_apply/load/check', {
        gsmc: recordset.val('我方公司'),
    }).then(res => {
        let data = res.data || {}
        let position = data.position || '';
        let bm = data.bm || '';
        let wfgs = data.wfgs || '';
        if (recordset.val('我方公司') == '') {
            recordset.val('我方公司', wfgs);
        }
        recordset.module.group_by_name('费用详情审批').visible = false;
        console.log('费用详情审批 88888');
        recordset.module.field_by_full_name(m + '.我方公司').disabled = true;
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true;
        recordset.module.field_by_full_name(m + '.是否开票').disabled = true;
        recordset.module.field_by_full_name(m + '.财务工厂').readonly = true
        recordset.module.field_by_full_name(m + '.工厂编号').disabled = true;
        recordset.module.field_by_full_name(m + '.厂商名称').disabled = true;
        recordset.module.field_by_full_name(m + '.申请金额').disabled = true;
        recordset.module.field_by_full_name(m + '.开户银行').disabled = true;
        recordset.module.field_by_full_name(m + '.银行帐号').disabled = true;
        recordset.module.field_by_full_name(m + '.社会统一信用代码').disabled = true;
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.申请付款日期').disabled = true;
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true;
        recordset.module.field_by_full_name(m + '.货款类型').disabled = true;
        recordset.module.field_by_full_name(m + '.付款形式').disabled = true;
        recordset.module.field_by_full_name(m + '.汇    率').disabled = true;
        recordset.module.field_by_full_name(m + '.RMB客户').disabled = true;
        recordset.module.field_by_full_name(m + '.预计出货量').disabled = true;
        recordset.module.field_by_full_name(m + '.是否入部门费用').disabled = true;
        recordset.module.field_by_full_name(m + '.外销发票号').disabled = true;
        recordset.module.field_by_full_name(m + '.发票号码').disabled = true;
        recordset.module.field_by_full_name(m + '.采购合同').disabled = true;
        recordset.module.field_by_full_name(m + '.中文品名').disabled = true;
        recordset.module.field_by_full_name(m + '.开票工厂').disabled = true;
        recordset.module.field_by_full_name(m + '.已付金额').disabled = true;
        recordset.module.field_by_full_name(m + '.已收定金').disabled = true;
        recordset.module.field_by_full_name(m + '.数量').disabled = true;
        recordset.module.field_by_full_name(m + '.核算部门').disabled = true;
        recordset.module.field_by_full_name(m + '.是否收回').disabled = true;
        recordset.module.field_by_full_name(m + '.预计船期').disabled = true;
        recordset.module.field_by_full_name(m + '.经办人员').disabled = true;
        recordset.module.field_by_full_name(m + '.业务部门').disabled = true;
        recordset.module.field_by_full_name(m + '.合同金额').disabled = true;
        recordset.module.field_by_full_name(m + '.分配完成').disabled = true;
        recordset.module.field_by_full_name(m + '.备  注').disabled = true;
        recordset.module.field_by_full_name(m + '.费用内容').disabled = true;
        recordset.module.field_by_full_name(m + '.单据图片').readonly = true;
        // recordset.fieldbyname('主要信息','备注说明').enabled:=false;
        recordset.module.field_by_full_name(m + '.领用人员').disabled = true;
        recordset.module.field_by_full_name(m + '.提交主管').disabled = true;
        recordset.module.field_by_full_name(m + '.主管审批').disabled = true;
        recordset.module.field_by_full_name(m + '.审批日期').disabled = true;
        recordset.module.field_by_full_name(m + '.审批意见').disabled = true;
        recordset.module.field_by_full_name(m + '.提交总监').disabled = true;
        recordset.module.field_by_full_name(m + '.总监审批').disabled = true;
        recordset.module.field_by_full_name(m + '.审批日期1').disabled = true;
        recordset.module.field_by_full_name(m + '.总监意见').disabled = true;
        recordset.module.field_by_full_name(m + '.提交财务').disabled = true;
        recordset.module.field_by_full_name(m + '.财务审批').disabled = true;
        recordset.module.field_by_full_name(m + '.批准金额').disabled = true;
        recordset.module.field_by_full_name(m + '.1审批日期1').disabled = true;
        recordset.module.field_by_full_name(m + '.财务意见').disabled = true;
        recordset.module.field_by_full_name(m + '.付款类型').disabled = true;
        recordset.module.field_by_full_name(m + '.付款日期').disabled = true;
        //recordset.fieldbyname('财务审批','批准金额').enabled:=false;
        recordset.module.field_by_full_name(m + '.提交总经理').disabled = true;
        recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
        recordset.module.field_by_full_name(m + '.总经理意见').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.采购合同').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.外销发票号').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.合同金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.收支情况').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.费用详情').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.单据图片').readonly = true;
        recordset.module.field_by_full_name(m + '.费用详情.申请人员').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.时间').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.地点').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.天数').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.陪同人员').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.花费金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补贴天数').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补贴金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.公交费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.出租费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.其他费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.预支费用').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.补领金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.归还金额').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.是否已出').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情审批.主管确认').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.提交主管').disabled = true;
        recordset.module.field_by_full_name(m + '.费用详情.申请部门').disabled = true;
        let sp1 = '';
        // recordset.val('审批识别', '1');
        let t = recordset.tables['费用详情'];
        let v = t.view_data || [];
        let new_data = [];
        for (let r of v) {
            if (recordset.value('费用详情.提交主管', r) === _.user.username) {
                sp1 = '1';
                new_json = _deepClone(r);
                new_json['rid'] = _.utils.guid()
                new_json['uid'] = _.user.rid
                new_data.push(new_json);
                console.log(new_json);
            }
        }
        recordset.tables['费用详情审批'].view_data = new_data;
        recordset.tables['费用详情审批'].sync_operate_data();
        console.log(new_data);
        // recordset.val('审批识别', '');
        if ((recordset.val('货款类型') === '办公费用' || recordset.val('货款类型') === '快件费用' || recordset.val('货款类型') === '其他') 
            && ((recordset.val('经办人员') !== '' &&
                recordset.val('经办人员') !== _.user.username && recordset.val('提交主管') !== _.user.username && recordset.val('提交总监') !== _.user.username &&
                recordset.val('提交总经理') !== _.user.username && recordset.val('提交财务') !== _.user.username) || sp1 === '1')) {
            recordset.module.group_by_name('费用详情').visible = false;
            recordset.module.group_by_name('费用详情审批').visible = true;
            console.log('费用详情审批 11111');
            if (recordset.val('主管审批') === '通过') {
                recordset.module.field_by_full_name(m + '.费用详情审批.主管确认').disabled = false;
            }
        }
        if (recordset.val('付款类型') === '差旅费' || (recordset.val('付款类型') === '业务招待费')) {
            recordset.module.group_by_name('报销费用').visible = true;
        } else {
            recordset.module.group_by_name('报销费用').visible = false;
        }
        if (recordset.val('经办人员') === '' || recordset.val('经办人员') === _.user.username) {
            if (recordset.val('提交主管') === '') {
                if (recordset.val('经办人员') === '') {
                    recordset.val('经办人员', _.user.username);
                    recordset.val('业务部门', bm);
                }
                recordset.module.field_by_full_name(m + '.我方公司').disabled = false;
                recordset.module.field_by_full_name(m + '.客户名称').disabled = false;
                recordset.module.field_by_full_name(m + '.是否开票').disabled = false;
                recordset.module.field_by_full_name(m + '.财务工厂').readonly = false;
                recordset.module.field_by_full_name(m + '.工厂编号').disabled = false;
                recordset.module.field_by_full_name(m + '.厂商名称').disabled = false;
                recordset.module.field_by_full_name(m + '.申请金额').disabled = false;
                recordset.module.field_by_full_name(m + '.开户银行').disabled = false;
                recordset.module.field_by_full_name(m + '.银行帐号').disabled = false;
                recordset.module.field_by_full_name(m + '.领用人员').disabled = false;
                recordset.module.field_by_full_name(m + '.货币代码').disabled = false;
                recordset.module.field_by_full_name(m + '.申请付款日期').disabled = false;

                recordset.module.field_by_full_name(m + '.货款类型').disabled = false;
                recordset.module.field_by_full_name(m + '.付款形式').disabled = false;
                recordset.module.field_by_full_name(m + '.RMB客户').disabled = false;
                recordset.module.field_by_full_name(m + '.汇    率').disabled = false;
                recordset.module.field_by_full_name(m + '.预计出货量').disabled = false;
                recordset.module.field_by_full_name(m + '.是否入部门费用').disabled = false;
                recordset.module.field_by_full_name(m + '.货币代码').disabled = false;
                recordset.module.field_by_full_name(m + '.外销发票号').disabled = false;
                recordset.module.field_by_full_name(m + '.发票号码').disabled = false;
                recordset.module.field_by_full_name(m + '.采购合同').disabled = false;
                recordset.module.field_by_full_name(m + '.中文品名').disabled = false;
                recordset.module.field_by_full_name(m + '.费用内容').disabled = false;
                recordset.module.field_by_full_name(m + '.已付金额').disabled = false;
                recordset.module.field_by_full_name(m + '.已收定金').disabled = false;
                recordset.module.field_by_full_name(m + '.合同金额').disabled = false;
                recordset.module.field_by_full_name(m + '.数量').disabled = false;
                recordset.module.field_by_full_name(m + '.预计出货量').disabled = false;
                recordset.module.field_by_full_name(m + '.是否入部门费用').disabled = false;
                if (recordset.val('是否入部门费用') == '是') {
                    recordset.module.field_by_full_name(m + '.核算部门').disabled = false;
                }
                recordset.module.field_by_full_name(m + '.是否收回').disabled = false;
                recordset.module.field_by_full_name(m + '.预计船期').disabled = false;
                recordset.module.field_by_full_name(m + '.经办人员').disabled = false;

                recordset.module.field_by_full_name(m + '.分配完成').disabled = false;
                recordset.module.field_by_full_name(m + '.备  注').disabled = false;
                recordset.module.field_by_full_name(m + '.单据图片').readonly = false;

                if (recordset.val('付款编号') !== '待生成' && recordset.val('付款编号') !== '') {
                    recordset.module.field_by_full_name(m + '.提交主管').disabled = false;
                }
                recordset.module.field_by_full_name(m + '.费用详情.发票号码').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.采购合同').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.外销发票号').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.合同金额').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.收支情况').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.费用详情').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.申请金额').disabled = false;

                recordset.module.field_by_full_name(m + '.费用详情.单据图片').readonly = false;
                recordset.module.field_by_full_name(m + '.费用详情.时间').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.地点').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.天数').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.陪同人员').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.花费金额').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.补贴天数').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.补贴金额').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.公交费用').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.出租费用').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.其他费用').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.预支费用').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.补领金额').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.归还金额').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.提交主管').disabled = false;
                recordset.module.field_by_full_name(m + '.费用详情.申请部门').disabled = false;
                if (recordset.val('货款类型') === '办公费用' || recordset.val('货款类型') === '快件费用' || recordset.val('货款类型') === '其他') {
                    recordset.module.field_by_full_name(m + '.费用详情.申请人员').disabled = false;
                }
            }
        }
        if (recordset.val('总监审批') === '待审批' && recordset.val('总经理审批') === '待审批' && recordset.val('财务审批') === '待审批' && recordset.val('提交主管') === _.user.username) {
            if (recordset.val('主管审批') === '通过') {
                recordset.module.field_by_full_name(m + '.提交总监').disabled = false;
            }
            recordset.module.field_by_full_name(m + '.主管审批').disabled = false;
            recordset.module.field_by_full_name(m + '.审批日期').disabled = false;
            recordset.module.field_by_full_name(m + '.审批意见').disabled = false;
        }
        if (recordset.val('总经理审批') === '待审批' && recordset.val('主管审批') === '通过' && recordset.val('财务审批') === '待审批' && recordset.val('提交总监') === _.user.username) {
            if (recordset.val('总监审批') === '通过') {
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
            }
            if (recordset.val('主管审批') === '通过') {
                recordset.module.field_by_full_name(m + '.总监审批').disabled = false;
                recordset.module.field_by_full_name(m + '.审批日期').disabled = false;
                recordset.module.field_by_full_name(m + '.总监意见').disabled = false;
            }
        }
        if (recordset.val('财务审批') === '待审批' && recordset.val('总监审批') === '通过' && recordset.val('提交总经理') === _.user.username) {
            if (recordset.val('总经理审批') === '通过') {
                recordset.module.field_by_full_name(m + '.提交财务').disabled = false;
            }
        }
        if (recordset.val('总监审批') === '通过') {
            recordset.module.field_by_full_name(m + '.总经理审批').disabled = false;
            recordset.module.field_by_full_name(m + '.审批日期').disabled = false;
            recordset.module.field_by_full_name(m + '.总经理意见').disabled = false;
        }
        if (recordset.val('提交财务') === _.user.username) {
            if (recordset.val('总经理审批') === '通过') {
                recordset.module.field_by_full_name(m + '.财务审批').disabled = false;

                recordset.module.field_by_full_name(m + '.批准金额').disabled = false;
                recordset.module.field_by_full_name(m + '.1审批日期1').disabled = false;
                recordset.module.field_by_full_name(m + '.财务意见').disabled = false;
                recordset.module.field_by_full_name(m + '.付款类型').disabled = false;
                recordset.module.field_by_full_name(m + '.提交总经理').disabled = false;
                recordset.module.field_by_full_name(m + '.付款日期').disabled = false;
            }
            if (recordset.val('财务审批') === '通过') {
                recordset.module.field_by_full_name(m + '.总经理审批').disabled = true;
            }
        }
        if (position.indexOf('财务') != -1) {
            recordset.module.group_by_name('费用详情').visible = true;
            recordset.module.group_by_name('费用详情审批').visible = false;
            console.log('费用详情审批 33333');
            recordset.module.field_by_full_name(m + '.费用详情.外销发票号').disabled = false;
            recordset.module.group_by_name('主管审批').visible = false;
            recordset.module.group_by_name('总监审批').visible = false;
            recordset.module.group_by_name('总经理审批').visible = false;
            recordset.module.field_by_full_name(m + '.领用人员').hide();
            recordset.module.field_by_full_name(m + '.已收定金').hide();
            recordset.module.field_by_full_name(m + '.产品编号').hide();
            recordset.module.field_by_full_name(m + '.所在省份').hide();
            recordset.module.field_by_full_name(m + '.费用收回').disabled = false;
        } else {
            recordset.module.field_by_full_name(m + '.费用收回').disabled = true;
        }
        recordset.refresh_ui(true)
    }).catch(err => {
        console.error('加载检查失败', err);
        _.ui.message.error((err && err.msg) || '加载检查失败');
    });
}
_.evts.on([_.evtids.RECORD_LOAD], cost_apply_recordLoad, '费用申请')

// 界面加载添加按钮
const cost_apply_formShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            name: 'detail_audit_apply_btn',
            caption: '详情审批提交',
            icon: 'any-keyborad'
        })
        // btns.push({
        //     "name": 'payment_invoice_validation',
        //     "caption": '更新发票验证',
        //     "icon": 'any-keyborad',
        // })
    } else {
        btns.push({
            name: 'update_sfyc_val_btn',
            caption: '刷新已出',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'update_audit_val_btn',
            caption: '撤销审批',
            icon: 'any-keyborad'
        });
        btns.push({
            name: 'advance_payment_new_btn',
            caption: '生成预付货款',
            icon: 'any-keyborad'
        });
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

_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], cost_apply_formShow, '费用申请');

// 费用申请-按钮点击事件
const costApplyButtonClick = async (evt_id, btn, form) => {
    // 费用详情审批-通过按钮
    let recordset = form.recordset
    if (btn.name == 'audit_pass_btn') {
        let d = recordset.tables['费用详情审批'].current_data
        if (Object.keys(d).length==0) {
            _.ui.message.error('请先选择一条费用详情审批记录');
            return;
        }
        if (recordset.val('费用详情审批.提交主管') != _.user.username) {
            _.ui.message.error('只有当前用户提交主管才可以审批');
            return;
        }
        recordset.val('费用详情审批.主管确认', '通过');
    }
    // 费用详情审批-批量通过按钮
    if (btn.name == 'batch_pass_btn') {
        let t = recordset.tables['费用详情审批'];
        let v = t.view_data || [];
        for (let r of v) {
            if (recordset.value('费用详情审批.提交主管', r) != _.user.username) {
                continue;
            }
            recordset.val('费用详情审批.主管确认', '通过', r);
        }
    }
    // 刷新已出按钮
    if (btn.name == 'update_sfyc_val_btn') {
        _.http.post('/api/saier/cost_apply/update_sfyc', {}).then(res => {
            _.ui.message.success('刷新已出成功');
        }).catch(err => {
            console.error('刷新已出失败', err);
            _.ui.message.error((err && err.msg) || '刷新已出失败');
        });
    }
    // 撤销审批按钮
    if (btn.name == 'update_audit_val_btn') {
        _.http.post('/api/saier/cost_apply/update_audit', {
            rid: form.current_rid.value
        }).then(res => {
            _.ui.message.success('撤销审批成功');
        }).catch(err => {
            console.error('撤销审批失败', err);
            _.ui.message.error((err && err.msg) || '撤销审批失败');
        });
    }
    // Excel导入按钮
    if (btn.name == 'cost_apply_excel_import') {
        if (recordset.val('经办人员') != _.user.username && recordset.val('经办人员') != '') {
            _.ui.message.error('只有当前经办人员才可以导入');
            return;
        } else {
            _.ui.show_dialog('photo_from_excel', {
                "rid": form.current_rid,
                "group": '费用申请.费用详情',
                "option": 'append',
                "kfield": 'wyzd',
                "pfield": 'yytp'
            });
        }
    }
    // 生成预付货款按钮
    if (btn.name == 'advance_payment_new_btn') {
        _.http.post('/api/saier/cost_apply/advance_payment_new', {
            rid: form.current_rid.value
        }).then(res => {
            _.ui.message.success('生成预付货款成功');
            _.platform.open_record('预付货款', res.data);
        }).catch(err => {
            console.error('生成预付货款失败', err);
            _.ui.message.error((err && err.msg) || '生成预付货款失败');
        });
    }

    // 详情审批提交按钮
    if (btn.name == 'detail_audit_apply_btn') {
        if (form.recordset.modified == true) {
            _.ui.message.error('请先保存数据，再提交审批');
            return;
        }
        if ((recordset.val('货款类型') == '办公费用' || recordset.val('货款类型') == '快件费用' || recordset.val('货款类型') == '其他') && recordset.val('经办人员') == _.user.username) {
            let kind = await _.ui.show_input_select_dialog('请选择审批类型', '正常提交', ['正常提交', '重复提交']);
            if (!kind) {
                return;
            }
            _.http.post('/api/saier/cost_apply/detail_audit_apply', {
                rid: form.recordset.val('rid'),
                jbry: form.recordset.val('经办人员'),
                fkbh: form.recordset.val('付款编号'),
                kind: kind || '正常提交'
            }).then(res => {
                _.ui.message.success('提交审批成功');
                _.platform.active.reload_data();
            }).catch(err => {
                console.error('提交审批失败', err);
                _.ui.message.error((err && err.msg) || '提交审批失败');
            });
        } else {
            _.ui.message.error('只有当前经办人员且货款类型为办公费用、快件费用或其他才可以提交审批');
            return;
        }
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], costApplyButtonClick, '费用申请');