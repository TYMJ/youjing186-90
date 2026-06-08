// 编辑界面数据加载以后执行
const declaration_load = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username

    recordset.module.field_by_full_name('核算发票').enabled = false;

    if (recordset.val('收 货 人') !== '') {
        const inputString = recordset.val('收 货 人');
        const lineBreakPos = inputString.indexOf('\r\n');

        if (lineBreakPos >= 0) {
            recordset.val('收 货 人y', inputString.substring(0, lineBreakPos + 2));
        } else {
            recordset.val('收 货 人y', '');
        }
    }

    recordset.module.field_by_full_name('装柜日期').enabled = false;

    if (recordset.val('流转财务') !== '' && recordset.val('流转财务') !== '否') {
        recordset.module.field_by_full_name('流转财务').enabled = false;
    }

    if (recordset.val('价格条款') !== 'CNF' && recordset.val('价格条款') !== 'CIF') {
        recordset.module.field_by_full_name('CNF运费$').enabled = false;
    }

    _.http.post('/api/saier/declaration/load/check', {
        fphm: recordset.val('发票号码'),
        zdry: recordset.val('制单人员')
    }).then(res => {
        if (res.code == 1) {
            let data = res.data
            if (data.dzdata == 1) {
                recordset.module.field_by_full_name('装柜日期').enabled = true;
                if (recordset.val('制单人员') !== '' && recordset.val('制单人员') === username) {} else {
                    if (recordset.val('制单人员') === '') {
                        recordset.val('制单人员', username);
                    } else {
                        recordset.module.group_by_name('补报清单').visible = false;
                    }
                }
            }

            if (data.dzdata == 2) {
                recordset.module.group_by_name('补报清单').visible = false;
            }

            if (data.dzdata == 3) {
                recordset.module.group_by_name('分别报关').visible = false;
                recordset.module.group_by_name('不报关汇总').visible = false;
                recordset.module.group_by_name('报关单信息').visible = false;
                recordset.module.group_by_name('合计信息').visible = false;
                recordset.module.group_by_name('报关合计信息').visible = false;
                recordset.module.group_by_name('备注信息').visible = false;
                recordset.module.group_by_name('补报清单').visible = false;

                recordset.module.field_by_full_name('报关&外销').enabled = false;
                recordset.module.field_by_full_name('发票号码').enabled = false;
                recordset.module.field_by_full_name('外运编号').enabled = false;
                recordset.module.field_by_full_name('对方号码').enabled = false;
                recordset.module.field_by_full_name('信用证号').enabled = false;
                recordset.module.field_by_full_name('合 同 号').enabled = false;
                recordset.module.field_by_full_name('发票日期').enabled = false;
                recordset.module.field_by_full_name('客户名称').enabled = false;
                recordset.module.field_by_full_name('我方公司').enabled = false;
                recordset.module.field_by_full_name('出运口岸').enabled = false;
                recordset.module.field_by_full_name('中转口岸').enabled = false;
                recordset.module.field_by_full_name('目的口岸').enabled = false;
                recordset.module.field_by_full_name('出运日期').enabled = false;
                recordset.module.field_by_full_name('装运期限').enabled = false;
                recordset.module.field_by_full_name('运输方式').enabled = false;
                recordset.module.field_by_full_name('结汇方式').enabled = false;
                recordset.module.field_by_full_name('价格条款').enabled = false;
                recordset.module.field_by_full_name('货币代码').enabled = false;
                recordset.module.field_by_full_name('报关单号').enabled = false;
                recordset.module.field_by_full_name('分别报关').enabled = false;
                recordset.module.field_by_full_name('海关编号').enabled = false;
                recordset.module.field_by_full_name('贸易方式').enabled = false;
                recordset.module.field_by_full_name('贸易国别').enabled = false;
                recordset.module.field_by_full_name('包装种类').enabled = false;
                recordset.module.field_by_full_name('船代名称').enabled = false;
                recordset.module.field_by_full_name('付 款 期').enabled = false;
                recordset.module.field_by_full_name('出 运 期').enabled = false;
                recordset.module.field_by_full_name('报关公司').enabled = false;
                recordset.module.field_by_full_name('封    号').enabled = false;
                // recordset.module.field_by_full_name('单展位数').enabled = false;
                recordset.module.field_by_full_name('装柜日期').enabled = false;
                recordset.module.field_by_full_name('运    费').enabled = false;
                recordset.module.field_by_full_name('可否转运').enabled = false;
                recordset.module.field_by_full_name('有效日期').enabled = false;
                recordset.module.field_by_full_name('业务人员').enabled = false;
                recordset.module.field_by_full_name('制单人员').enabled = false;
                recordset.module.field_by_full_name('所属公司').enabled = false;
                recordset.module.field_by_full_name('产品资料.外销合同').enabled = false;
                recordset.module.field_by_full_name('产品资料.产品编号').enabled = false;
                recordset.module.field_by_full_name('产品资料.客户货号').enabled = false;
                recordset.module.field_by_full_name('产品资料.产品规格').enabled = false;
                recordset.module.field_by_full_name('产品资料.中文品名').enabled = false;
                recordset.module.field_by_full_name('产品资料.英文品名').enabled = false;
                recordset.module.field_by_full_name('产品资料.英文报关品名').enabled = false;
                recordset.module.field_by_full_name('产品资料.申报要素').enabled = false;
                recordset.module.field_by_full_name('产品资料.海关编码').enabled = false;
                recordset.module.field_by_full_name('产品资料.出货数量').enabled = false;
                recordset.module.field_by_full_name('产品资料.计量单位').enabled = false;
                recordset.module.field_by_full_name('产品资料.外箱容量').enabled = false;
                recordset.module.field_by_full_name('产品资料.箱    数').enabled = false;
                recordset.module.field_by_full_name('产品资料.包装单位').enabled = false;
                recordset.module.field_by_full_name('产品资料.外销单价').enabled = false;
                recordset.module.field_by_full_name('产品资料.外销总价').enabled = false;
                recordset.module.field_by_full_name('产品资料.采购总价').enabled = false;
                recordset.module.field_by_full_name('产品资料.采购单价').enabled = false;
                recordset.module.field_by_full_name('产品资料.毛    重').enabled = false;
                recordset.module.field_by_full_name('产品资料.总 毛 重').enabled = false;
                recordset.module.field_by_full_name('产品资料.净    重').enabled = false;
                recordset.module.field_by_full_name('产品资料.总 净 重').enabled = false;
                recordset.module.field_by_full_name('产品资料.包装长度').enabled = false;
                recordset.module.field_by_full_name('产品资料.包装宽度').enabled = false;
                recordset.module.field_by_full_name('产品资料.包装高度').enabled = false;
                recordset.module.field_by_full_name('产品资料.外箱体积').enabled = false;
                recordset.module.field_by_full_name('产品资料.总 体 积').enabled = false;
                recordset.module.field_by_full_name('产品资料.运抵国家').enabled = false;
                recordset.module.field_by_full_name('产品资料.货币代码').enabled = false;
                recordset.module.field_by_full_name('产品资料.外语品名').enabled = false;
                recordset.module.field_by_full_name('产品资料.客人CODE').enabled = false;
                recordset.module.field_by_full_name('产品资料.预填识别').enabled = false;
                recordset.module.field_by_full_name('产品资料.海关计量单位').enabled = false;
                recordset.module.field_by_full_name('产品资料.单据品名英').enabled = false;
                recordset.module.field_by_full_name('产品资料.是否商检').enabled = false;
                recordset.module.field_by_full_name('产品资料.工厂名称').enabled = false;
                recordset.module.field_by_full_name('产品资料.地区').enabled = false;
                recordset.module.field_by_full_name('产品资料.业务人员').enabled = false;
                recordset.module.field_by_full_name('合并产品.项    号').enabled = false;
                recordset.module.field_by_full_name('合并产品.海关编码').enabled = false;
                recordset.module.field_by_full_name('合并产品.中文品名').enabled = false;
                recordset.module.field_by_full_name('合并产品.申报要素').enabled = false;
                recordset.module.field_by_full_name('合并产品.英文品名').enabled = false;
                recordset.module.field_by_full_name('合并产品.出货数量').enabled = false;
                recordset.module.field_by_full_name('合并产品.计量单位').enabled = false;
                recordset.module.field_by_full_name('合并产品.装 箱 率').enabled = false;
                recordset.module.field_by_full_name('合并产品.箱    数').enabled = false;
                recordset.module.field_by_full_name('合并产品.包装单位').enabled = false;
                recordset.module.field_by_full_name('合并产品.采购总价').enabled = false;
                recordset.module.field_by_full_name('合并产品.采购单价').enabled = false;
                recordset.module.field_by_full_name('合并产品.报关单价').enabled = false;
                recordset.module.field_by_full_name('合并产品.报关总价').enabled = false;
                recordset.module.field_by_full_name('合并产品.毛    重').enabled = false;
                recordset.module.field_by_full_name('合并产品.总 毛 重').enabled = false;
                recordset.module.field_by_full_name('合并产品.净    重').enabled = false;
                recordset.module.field_by_full_name('合并产品.总 净 重').enabled = false;
                recordset.module.field_by_full_name('合并产品.外箱体积').enabled = false;
                recordset.module.field_by_full_name('合并产品.总 体 积').enabled = false;
                recordset.module.field_by_full_name('合并产品.运抵国家').enabled = false;
                recordset.module.field_by_full_name('合并产品.海关计量单位').enabled = false;
                recordset.module.field_by_full_name('合并产品.货币代码').enabled = false;
                recordset.module.field_by_full_name('合并产品.识别').enabled = false;
                recordset.module.field_by_full_name('合并产品.中文品名1').enabled = false;
                recordset.module.field_by_full_name('合并产品.外销单价').enabled = false;
                recordset.module.field_by_full_name('合并产品.外销总价').enabled = false;
                recordset.module.field_by_full_name('合并产品.外语品名').enabled = false;
                recordset.module.field_by_full_name('合并产品.客人CODE').enabled = false;
                recordset.module.field_by_full_name('合并产品.报 关 量').enabled = false;
                recordset.module.field_by_full_name('合并产品.征    免').enabled = false;
                recordset.module.field_by_full_name('合并产品.是否商检').enabled = false;
                recordset.module.field_by_full_name('合并产品.单价锁定').enabled = false;
            }

            if (data.fphmdata == 1) {
                recordset.module.field_by_full_name('发票号码').enabled = false;
            }

            if (data.dzzgdata == 1) {
                recordset.module.field_by_full_name('单证主管复核').enabled = true;
            }

            if (data.dzzgdata == 2) {
                recordset.module.field_by_full_name('发票号码').enabled = false;
            }

            if (data.dzcydata == 1) {
                recordset.module.group_by_name('分别报关').visible = false;
                recordset.module.group_by_name('不报关汇总').visible = false;
                recordset.module.group_by_name('报关合计信息').visible = false;
                recordset.module.group_by_name('补报清单').visible = false;
                recordset.module.group_by_name('电商费用').visible = false;
                recordset.module.group_by_name('预填信息').visible = false;
                recordset.module.group_by_name('报关单').visible = false;
                recordset.module.field_by_full_name('风控补报').visible = false;
                recordset.module.field_by_full_name('报关&外销').visible = false;
                recordset.module.field_by_full_name('我方公司').visible = false;
                recordset.module.field_by_full_name('分别报关').visible = false;
                recordset.module.field_by_full_name('上属公司').visible = false;
                recordset.module.field_by_full_name('报关公司').visible = false;
                recordset.module.field_by_full_name('所属公司').visible = false;
                recordset.module.field_by_full_name('是否查验').visible = false;
                recordset.module.field_by_full_name('业务小组').visible = false;
                recordset.module.field_by_full_name('业务部门').visible = false;
                recordset.module.field_by_full_name('单展位数').visible = false;
                recordset.module.field_by_full_name('RMB客户').visible = false;
                recordset.module.field_by_full_name('出 运 期').visible = false;
                recordset.module.field_by_full_name('付 款 期').visible = false;
                recordset.module.field_by_full_name('运输工具').visible = false;
                recordset.module.field_by_full_name('信保特定').visible = false;
                recordset.module.field_by_full_name('数值1').visible = false;
                recordset.module.field_by_full_name('我方抬头').visible = false;
                recordset.module.field_by_full_name('产品资料.原发票号').visible = false;
                recordset.module.field_by_full_name('产品资料.开票单价').visible = false;
                recordset.module.field_by_full_name('产品资料.中文报关品名').visible = false;
                recordset.module.field_by_full_name('产品资料.申报要素').visible = false;
                recordset.module.field_by_full_name('产品资料.英文报关品名').visible = false;
                recordset.module.field_by_full_name('产品资料.增值税率').visible = false;
                recordset.module.field_by_full_name('产品资料.退税率').visible = false;
                recordset.module.field_by_full_name('产品资料.退 税 额').visible = false;
                recordset.module.field_by_full_name('产品资料.海关编码').visible = false;
                recordset.module.field_by_full_name('产品资料.是否代开').visible = false;
                recordset.module.field_by_full_name('产品资料.是否商检').visible = false;
                recordset.module.field_by_full_name('产品资料.单据品名').visible = false;
                recordset.module.field_by_full_name('产品资料.单据品名英').visible = false;
                recordset.module.field_by_full_name('产品资料.单据品名外').visible = false;
                recordset.module.field_by_full_name('产品资料.开票工厂').visible = false;
                recordset.module.field_by_full_name('产品资料.开票联系人').visible = false;
                recordset.module.field_by_full_name('产品资料.开票电话').visible = false;
                recordset.module.field_by_full_name('产品资料.预填识别').visible = false;
                recordset.module.field_by_full_name('产品资料.预填信息').visible = false;
                recordset.module.field_by_full_name('产品资料.开票税点').visible = false;
                recordset.module.field_by_full_name('产品资料.是否待报').visible = false;
                recordset.module.field_by_full_name('产品资料.付款抬头').visible = false;
                recordset.module.field_by_full_name('产品资料.单证备注').visible = false;
                recordset.module.field_by_full_name('产品资料.备    注').visible = false;
                recordset.module.field_by_full_name('产品资料.外销单价').visible = false;
                recordset.module.field_by_full_name('产品资料.外销总价').visible = false;
                recordset.module.field_by_full_name('产品资料.客户RMB单价').visible = false;
                recordset.module.field_by_full_name('产品资料.客户RMB总价').visible = false;
                recordset.module.field_by_full_name('产品资料.电商费用').visible = false;
                recordset.module.field_by_full_name('产品资料.电商单价').visible = false;
                recordset.module.field_by_full_name('产品资料.可思达货号').visible = false;
                recordset.module.field_by_full_name('产品资料.补报完成').visible = false;
                recordset.module.field_by_full_name('产品资料.原核算发票').visible = false;
                recordset.module.field_by_full_name('产品资料.核算发票').visible = false;
                recordset.module.field_by_full_name('合并产品.换汇成本').visible = false;
                recordset.module.field_by_full_name('合并产品.原报关单价').visible = false;
                recordset.module.field_by_full_name('合并产品.佣金总价').visible = false;
                recordset.module.field_by_full_name('合并产品.采购总价').visible = false;
                recordset.module.field_by_full_name('合并产品.采购单价').visible = false;
                recordset.module.field_by_full_name('合并产品.是否禁止').visible = false;
                recordset.module.field_by_full_name('合并产品.CNF运费$').visible = false;
                recordset.module.field_by_full_name('合并产品.CNF单价$').visible = false;
            }
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })

}
_.evts.on([_.evtids.RECORD_LOAD], declaration_load, '报关明细')


const declaration_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    let username = _.user.username

    if (field.full_name == n + '.我方公司') {
        if (recordset.val('报关公司') === '') {
            recordset.val('报关公司', recordset.val('我方公司'));
        }
    }

    if (field.full_name == n + '.所属公司') {
        if (recordset.val('所属公司') != '') {
            _.http.post('/api/saier/declaration/ssgs/change', {
                ssgs: recordset.val('所属公司'),
                fphm: recordset.val('发票号码'),
                khmc: recordset.val('客户名称'),
                rmbkh: recordset.val('RMB客户'),
            }).then(res => {
                if (res.code == 1) {
                    if (res.data.ssgsdata == 1) {
                        _.ui.message.error(res.data.msg)
                        recordset.val('所属公司', '')
                    }
                    if (res.data.rmbdata == 1) {
                        _.ui.message.error(res.data.msg1)
                    }
                    if (res.data.bggs != 0) {
                        recordset.val('报关公司', res.data.bggs)
                    }

                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }

    if (field.full_name == n + '.RMB客户' || field.full_name == n + '.汇 率') {
        if (recordset.val('RMB客户') !== '是' && recordset.val('汇 率') !== 0) {
            const hl = recordset.val('汇 率');
            let t = recordset.tables['产品资料'];
            for (let r of t.view_data) {
                if (r.wxzj == 0 && r.chsl != 0) {
                    r.wxzj = round(float(r.mjzj) / float(hl) * 1000 / 1000)
                    r.wxjg = round(float(r.wxzj) / float(r.chsl) * 1000 / 1000)
                    t.push_modi_rid(r.rid)
                }
            }
            t.sync_operate_data()
            t.modified = true
        }
    }

    if (field.full_name == n + '.业务人员' || field.full_name == n + '.发票号码') {
        _.http.post('/api/saier/declaration/fphm/change', {
            fphm: recordset.val('发票号码'),
            ywry: recordset.val('业务人员')
        }).then(res => {
            if (res.code == 1) {
                if (res.data.fphmdata == 1) {
                    _.ui.message.error('请注意出运明细中无此发票号')
                    recordset.val('发票号码', '')
                }
                if (res.data.chydh != '') {
                    if (res.data.bgdxxdata == 1) {
                        recordset.val('数值1', res.data.sz)
                        recordset.val('信保特定', res.data.xbtd)
                    }
                    if (res.data.fkbbdata == 1) {
                        _.ui.message.error('此票有风控补报，将自动引入')
                        recordset.val('风控补报', new Date().format('yyyy-MM-dd hh:mm:ss'))
                    }

                    recordset.val('业务小组', res.data.ywxz)
                }
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (field.full_name == n + '.装柜日期') {
        if (recordset.val('装柜日期') !== '') {
            recordset.val('装柜日期加', _addDaysDate(recordset.val('装柜日期'), 10));
        } else {
            recordset.val('装柜日期加', '');
        }
    }

    if (field.full_name == n + '.报关公司') {
        if (recordset.val('报关公司') != '') {
            _.http.post('/api/saier/declaration/bggs/change', {
                bggs: recordset.val('报关公司'),
                cpzl: recordset.tables['产品资料'].view_data
            }).then(res => {
                if (res.code == 1) {
                    if (res.data.rid_list.length > 0) {
                        let t = recordset.tables['产品资料'];
                        for (let r of t.view_data) {
                            for (let rt of res.data.rid_list) {
                                if (r.rid == rt) {
                                    r.fktt = recordset.val('报关公司')
                                    t.push_modi_rid(r.rid)
                                }
                            }
                        }
                        t.sync_operate_data()
                        t.modified = true
                    }
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }

    if (field.full_name == n + '.价格条款') {
        if (recordset.val('价格条款') !== 'CNF' && recordset.val('价格条款') !== 'CIF') {
            recordset.module.field_by_full_name('CNF运费$').enabled = false;
        } else {
            recordset.module.field_by_full_name('CNF运费$').enabled = true;
        }
    }

    if (field.full_name == n + '.收 货 人') {
        if (recordset.val('收 货 人') !== '') {
            const inputString = recordset.val('收 货 人');
            const lineBreakPos = inputString.indexOf('\r\n');

            if (lineBreakPos >= 0) {
                recordset.val('收 货 人y', inputString.substring(0, lineBreakPos + 2));
            } else {
                recordset.val('收 货 人y', '');
            }
        }
    }

    if (field.full_name == n + '.提运单号') {
        if (recordset.val('飞驼提运单号') === '') {
            recordset.val('飞驼提运单号', recordset.val('提运单号'));
        }
    }

    if (field.full_name == n + '.装柜日期') {
        if (recordset.val('装柜日期') != '') {
            recordset.val('装柜日期加', _addDaysDate(recordset.val('装柜日期'), 10));
        } else {
            recordset.val('装柜日期加', '');
        }
    }

    if (field.full_name == n + '.产品资料.中文报关品名' || field.full_name == n + '.产品资料.退税率' || field.full_name == n + '.产品资料.货 源 地' || field.full_name == n + '.产品资料.海关编码' || field.full_name == n + '.产品资料.报关编号') {
        if (recordset.val('产品资料.中文报关品名') !== '') {
            const value =
                recordset.val('产品资料.中文报关品名') +
                recordset.val('产品资料.退税率').toString() +
                recordset.val('产品资料.货 源 地') +
                recordset.val('产品资料.海关编码') +
                recordset.val('产品资料.报关编号');

            recordset.val('产品资料.中文品名退税', value);
        }
    }

    if (field.full_name == n + '.产品资料.包装长度' || field.full_name == n + '.产品资料.包装宽度' || field.full_name == n + '.产品资料.包装高度') {
        let bztj = recordset.val('产品资料.包装长度') * recordset.val('产品资料.包装宽度') * recordset.val('产品资料.包装高度')
        if (bztj !== 0) {
            if (recordset.val('客户名称').toUpperCase().includes('AMAZON')) {
                recordset.val('产品资料.外箱体积', bztj / 1000000);
            } else {
                let calculatedVolume = bztj / 1000000;
                if (calculatedVolume < 0.001) {
                    calculatedVolume = 0.001;
                }
                recordset.val('产品资料.外箱体积', calculatedVolume.toFixed(3));
            }
        }
    }

    if (field.full_name == n + '.产品资料.毛    重' || field.full_name == n + '.产品资料.箱    数') {
        let bztj = recordset.val('产品资料.毛    重') * recordset.val('产品资料.箱    数')
        if (bztj !== 0) {
            recordset.val('产品资料.总 毛 重', bztj.toFixed(2));
        }
    }

    if (field.full_name == n + '.产品资料.外箱体积' || field.full_name == n + '.产品资料.箱    数') {
        let bztj = recordset.val('产品资料.外箱体积') * recordset.val('产品资料.箱    数')
        if (bztj !== 0) {
            if (recordset.val('客户名称').toUpperCase().includes('AMAZON')) {
                recordset.val('产品资料.总 体 积', bztj);
            } else {
                recordset.val('产品资料.总 体 积', bztj.toFixed(3));
            }
        }
    }

    if (field.full_name == n + '.产品资料.开票单价') {
        if (recordset.val('产品资料.开票单价') > 0 && recordset.val('产品资料.出货数量') > 0) {
            const cgzj = recordset.val('产品资料.开票单价') * recordset.val('产品资料.出货数量');
            recordset.val('产品资料.采购总价', cgzj.toFixed(3));
        }
    }

    if (field.full_name == n + '.产品资料.原发票号') {
        if (recordset.val('产品资料.原发票号') != '') {
            recordset.val('产品资料.发票号码', recordset.val('发票号码'))
            _.http.post('/api/saier/declaration/cpzl/yfph/change', {
                yfph: recordset.val('产品资料.原发票号')
            }).then(res => {
                if (res.data.sjcydata == 1) {
                    recordset.val('产品资料.出运日期', res.data.sjcy1)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }

    }

    if (field.full_name == n + '.产品资料.外箱容量' || field.full_name == n + '.产品资料.箱    数') {
        if (recordset.val('产品资料.是否拼箱') === '否' || recordset.val('产品资料.是否拼箱') === '') {
            if (recordset.val('产品资料.箱    数') > 0) {
                recordset.val('产品资料.出货数量', recordset.val('产品资料.外箱容量') * recordset.val('产品资料.箱    数'));
            }
        }
    }

    if (field.full_name == n + '.合并产品.报关单价' || field.full_name == n + '.合并产品.出货数量') {
        const bgzj = round(recordset.val('合并产品.报关单价') * recordset.val('合并产品.出货数量') * 100) / 100;
        recordset.val('合并产品.报关总价', bgzj);
    }

    if (field.full_name == n + '.合并产品.增值税率' || field.full_name == n + '.合并产品.退税率') {
        _.http.post('/api/saier/declaration/hbcp/cwxg/change', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.data.cwxgdata == 1) {
                recordset.val('合并产品.财务修改', username)
            }
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (field.full_name == n + '.合并产品.海关编码') {
        if (recordset.val('合并产品.海关编码') != '') {
            _.http.post('/api/saier/declaration/hbcp/hgbm/change', {
                hgbm: recordset.val('合并产品.海关编码')
            }).then(res => {
                if (res.data.sb == '') {
                    recordset.val('合并产品.是否禁止', '否')
                }
                if (res.data.sb != '') {
                    recordset.val('合并产品.是否禁止', res.data.sb)
                }
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })

        }

    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, declaration_field_change, '报关明细')

const _apply_table_data = (recordset, tableName, rows) => {
    const t = recordset.tables[tableName];
    if (!t || !Array.isArray(rows)) return;
    for (let r of rows) {
        if (r.new_flag == 0) {
            t.push_modi_rid(r.rid);
        }
        if (r.new_flag == 1) {
            t.push_new_rid(r.rid);
        }
    }
    t.view_data = rows;
    t.sync_operate_data();
    t.modified = true;
    console.log(t);
};

const declaration_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        _.http.post('/api/saier/declaration/save/before', {
            rid: recordset.val('rid'), // self.getnumber -> rid
            // 主表
            fphm: recordset.val('发票号码'),
            hsfp: recordset.val('核算发票'),
            cyrq: recordset.val('出运日期'),
            sfxb: recordset.val('是否信保'),
            ssgs: recordset.val('所属公司'),
            bgsb: recordset.val('报关&外销'),
            rmbkh: recordset.val('RMB客户'),
            hbdm: recordset.val('货币代码'),
            sz: recordset.val('数值1'),
            cnfyf: recordset.val('CNF运费$'),
            bgtjhj: recordset.val('报关体积合计'),
            bggs: recordset.val('报关公司'),
            sjcy: recordset.val('实际出运'),
            htdate: recordset.val('合同日期'),
            zgrq: recordset.val('装柜日期'),
            hl: recordset.val('汇 率'),

            jgtk: recordset.val('价格条款'),
            bgje: recordset.val('报关金额合计'),
            khbh: recordset.val('客户编号'),
            khmc: recordset.val('客户名称'),
            zdry: recordset.val('制单人员'),
            bgdh: recordset.val('报关单号'),
            tdh: recordset.val('提运单号'),
            fttdh: recordset.val('飞驼提运单号'),
            xh: recordset.val('集装箱号'),
            fh: recordset.val('封    号'),
            sfcy: recordset.val('是否查验'),
            mygb: recordset.val('贸易国别'),
            xgxq: recordset.val('修改详情'),

            // 电商费用
            ds_hl: recordset.val('电商汇率'),
            ds_hyf_usd: recordset.val('电商海运费$'),
            ds_hyf_rmb: recordset.val('电商海运费￥'),

            myhj: recordset.val('明佣合计'),
            hzjhc: recordset.val('货值合计出'),
            wxzes: recordset.val('外销总额总出'),
            // 子表（全量）
            hbcplist: recordset.tables['合并产品'].view_data || [],
            cpzllist: recordset.tables['产品资料'].view_data || [],
            bgdlist: recordset.tables['报关单'].view_data || [],
            bbqdlist: recordset.tables['补报清单'].view_data || [],
            ytxxlist: recordset.tables['预填信息'].view_data || []
        }).then(res => {
            if (!res || res.code === -1) {
                console.log('111111');
                _.ui.message.error((res && res.msg));
                reject();
                return;
            }
            console.log(res)
            const data = res.data || {};
            const patch = data.patch || {};

            // 主表回填
            if (patch.hsfp !== undefined) recordset.val('核算发票', patch.hsfp);
            if (patch.sbrq !== undefined) recordset.val('申报日期', patch.sbrq);
            if (patch.sbny !== undefined) recordset.val('申报年月', patch.sbny);
            if (patch.zgrqj !== undefined) recordset.val('装柜日期加', patch.zgrqj);
            if (patch.mygbz !== undefined) recordset.val('贸易国别中', patch.mygbz);

            if (patch.hzdr !== undefined) recordset.val('货值合计DR', patch.hzdr);
            if (patch.hzdm !== undefined) recordset.val('货值合计DM', patch.hzdm);
            if (patch.fkje !== undefined) recordset.val('风控金额', patch.fkje);
            if (patch.xgxq !== undefined) recordset.val('修改详情', patch.xgxq);
            if (patch.ds_hl !== undefined) recordset.val('电商汇率', patch.ds_hl);

            if (patch.tshj13 !== undefined) recordset.val('13 合计', patch.tshj13);
            if (patch.tshj9 !== undefined) recordset.val('9  合计', patch.tshj9);
            if (patch.tshj3 !== undefined) recordset.val('3  合计', patch.tshj3);
            if (patch.tshj1 !== undefined) recordset.val('1  合计', patch.tshj1);
            if (patch.tshj0 !== undefined) recordset.val('0  合计', patch.tshj0);

            if (patch.zwpmz !== undefined) recordset.val('中文品名总', patch.zwpmz);
            if (patch.ytmx !== undefined) recordset.val('预填明细', patch.ytmx);

            if (patch.nbg_zmz !== undefined) recordset.val('不报关总毛重', patch.nbg_zmz);
            if (patch.nbg_zjz !== undefined) recordset.val('不报关总净重', patch.nbg_zjz);
            if (patch.nbg_ztj !== undefined) recordset.val('不报关总体积', patch.nbg_ztj);
            if (patch.nbg_zsl !== undefined) recordset.val('不报关总数量', patch.nbg_zsl);
            if (patch.nbg_zxs !== undefined) recordset.val('不报关总箱数', patch.nbg_zxs);

            if (patch.hj_xs !== undefined) recordset.val('箱数合计', patch.hj_xs);
            if (patch.hj_je !== undefined) recordset.val('金额合计', patch.hj_je);
            if (patch.hj_mz !== undefined) recordset.val('毛重合计', patch.hj_mz);
            if (patch.hj_jz !== undefined) recordset.val('净重合计', patch.hj_jz);
            if (patch.hj_tj !== undefined) recordset.val('体积合计', patch.hj_tj);

            // 子表回填（不遗漏）

            _apply_table_data(recordset, '合并产品', data.hbcplist);
            _apply_table_data(recordset, '产品资料', data.cpzllist);
            _apply_table_data(recordset, '报关单', data.bgdlist);
            _apply_table_data(recordset, '补报清单', data.bbqdlist);
            _apply_table_data(recordset, '预填信息', data.ytxxlist);

            // 汇总重算
            recordset.do_re_sum_by_trigger_table('合并产品');
            recordset.do_re_sum_by_trigger_table('产品资料');
            recordset.do_re_sum_by_trigger_table('报关单');
            recordset.do_re_sum_by_trigger_table('补报清单');
            recordset.do_re_sum_by_trigger_table('预填信息');
            if (Array.isArray(data.warnings) && data.warnings.length > 0) {
                _.ui.message.warning(data.warnings.join('\n'));
            }

            if (res.code === 0 || (Array.isArray(data.errors) && data.errors.length > 0)) {
                _.ui.message.error((data.errors || [res.msg || '校验失败']).join('\n'));
                reject();
                return;
            }

            resolve();
        }).catch(err => {
            _.ui.message.error((err && err.msg));
            reject();
        });
    });
};

_.evts.on(_.evtids.RECORD_BEFORE_SAVE, declaration_before_save, '报关明细');

const customs_merge_items = (recordset) => {
    let merge_table = recordset.tables['合并产品'];
    let items_table = recordset.tables['产品资料'];

    let items_data = items_table.view_data;
    let new_data = []
    let filter_list = []
    let seq = 0;

    for (let row of items_data) {
        if (row.sfdb != '是') {
            if (row.zzsl > 0) {
                let newTsl;
                newTsl = row.tsl;
                if (row.zzsl === '6') {
                    newTsl = '5';
                } else if (row.zzsl === '4') {
                    newTsl = '4';
                } else if (row.zzsl === '3') {
                    newTsl = '3';
                }
                if (newTsl !== undefined && newTsl !== '') {
                    row.tsl = newTsl;
                }
                let zwpmts = row.zwpmts
                let row_json = {}
                if (filter_list.indexOf(zwpmts) < 0) {
                    filter_list.push(zwpmts)
                    let rid = _.utils.guid()
                    seq += 1
                    row_json.rid = rid
                    row_json.pid = recordset.rid
                    row_json.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    row_json.mtime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    row_json.seq = seq
                    row_json.hgbm = row.hgbm
                    row_json.zwpm = row.zhwbgpm
                    row_json.ywpm = row.djpmy
                    row_json.sbys = row.sbys
                    row_json.chsl = row.chsl
                    row_json.jldw = row.jldw
                    row_json.chxs = row.chxs
                    row_json.bzdw = row.bzdw
                    row_json.gczj = row.gczj
                    row_json.wxzj1 = row.wxzj
                    // row_json.zxl = row.wxrl
                    row_json.zmz = row.zmz
                    row_json.zjz = row.zjz
                    row_json.ztj = row.ztj
                    row_json.dyg = row.dyg
                    row_json.hbdm = row.hbdm
                    row_json.zzsl = row.zzsl
                    row_json.tsl = row.tsl
                    row_json.hgjldw = row.hgjldw
                    row_json.zwpm1 = row.zhwbgpm
                    row_json.mjzj = row.mjzj
                    row_json.hyd = row.hyd
                    if (row.caiziz != '') {
                        row_json.cz = row.caiziz.substring(0, 48)
                    } else {
                        row_json.cz = '无'
                    }
                    row_json.zwpmts = row.zwpmts
                    row_json.bgbh = row.bgbh

                    new_data.push(row_json)
                    merge_table.push_new_rid(rid)
                } else {
                    let i = filter_list.indexOf(zwpmts)
                    if (row.caiziz != '' && new_data[i].cz == '') {
                        new_data[i].cz = row.caiziz.substring(0, 48);
                    }

                    new_data[i].chsl = new_data[i].chsl + row.chsl
                    new_data[i].gczj = new_data[i].gczj + row.gczj
                    new_data[i].wxzj1 = new_data[i].wxzj1 + row.wxzj
                    new_data[i].mjzj = new_data[i].mjzj + row.mjzj

                    if (row.yfph == '') {
                        new_data[i].chxs = new_data[i].chxs + row.chxs
                        new_data[i].zmz = new_data[i].zmz + row.zmz
                        new_data[i].zjz = new_data[i].zjz + row.zjz
                        new_data[i].ztj = new_data[i].ztj + row.ztj
                    }
                }
            }
        }
    }

    let zwpmhyd = [];
    let zwpm = [];
    let hyd1 = [];
    let bgbh1 = [];
    let yjhj = 0
    console.log(new_data)
    for (let i = 0; i < new_data.length; i++) {
        let r = new_data[i]
        if (recordset.val('RMB客户') == '是') {
            new_data[i].mjdj1 = round(new_data[i].mjzj / new_data[i].chsl, 3)
        } else {
            new_data[i].wxjg = round(new_data[i].wxzj1 / new_data[i].chsl, 3)
        }
        console.log(r)
        r.cgdj = round(r.gczj / r.chsl, 3)
        r.wxmz = round(r.zmz / r.chxs, 3)
        r.wxjz = round(r.zjz / r.chxs, 3)
        r.wxtj = round(r.ztj / r.chxs, 6)
        r.zxl = Math.trunc(r.chsl / r.chxs)
        // r.wxjg = round(r.wxzj1/r.chsl,6)
        r.price = round(r.wxzj / r.chsl, 6)
        // if (new_data[i].zmz > zdmz) {
        //     zdmz = new_data[i].zmz;
        //     zdtsl = new_data[i].tsl;
        //     zdbgpm = new_data[i].zwpm;
        //     zdhyd = new_data[i].hyd;
        // }

        const key = `${new_data[i].zwpm};${new_data[i].hyd};${new_data[i].bgbh}`;
        if (!zwpmhyd.includes(key)) {
            zwpmhyd.push(key);
            zwpm.push(new_data[i].zwpm);
            hyd1.push(new_data[i].hyd);
            bgbh1.push(new_data[i].bgbh);
        }

        if (recordset.val('明佣合计') > 0) {
            const myhj = recordset.val('明佣合计')
            if (recordset.val('RMB客户') == '是') {
                new_data[i].yjzj = Math.trunc(new_data[i].mjzj / recordset.val('合并金额RMB合计') * myhj, 3)
                new_data[i].mjdj1 = Math.trunc((new_data[i].mjzj - new_data[i].yjzj) / new_data[i].chsl * 1000 / 1000)
                new_data[i].yjzj = round((new_data[i].mjzj - new_data[i].mjdj1 * new_data[i].chsl) * 100 / 100, 3)
                yjhj = yjhj + new_data[i].yjzj
            } else {
                new_data[i].yjzj = Math.trunc(new_data[i].wxzj1 / recordset.val('合并金额合计') * myhj, 3)
                new_data[i].wxjg = Math.trunc((new_data[i].wxzj1 - new_data[i].yjzj) / new_data[i].chsl * 1000 / 1000)
                new_data[i].yjzj = round((new_data[i].wxzj1 - new_data[i].wxjg * new_data[i].chsl) * 100 / 100, 3)
                yjhj = yjhj + new_data[i].yjzj
            }

            if (i == new_data.length - 1 && new_data.length > 1) {
                new_data[i].yjzj = round(new_data[i].yjzj + myhj - yjhj, 3)
                if (recordset.val('RMB客户') == '是') {
                    new_data[i].mjdj1 = round((new_data[i].mjzj - new_data[i].yjzj) / new_data[i].chsl, 3)
                } else {
                    new_data[i].wxjg = round((new_data[i].wxzj1 - new_data[i].yjzj) / new_data[i].chsl, 3)
                }
            }
        }
    }

    for (let i2 = 0; i2 < zwpmhyd.length; i2++) {
        let j1 = 0;
        for (let i = 0; i < new_data.length; i++) {
            const key = `${new_data[i].zwpm};${new_data[i].hyd};${new_data[i].bgbh}`;
            if (key === zwpmhyd[i2]) {
                j1++;
                if (j1 > 1) {
                    const suffix = ['.', ' .', '  .', '   .'][j1 - 2];
                    new_data[i].hyd = hyd1[i2] + suffix;

                    for (const rc of items_table.view_data) {
                        if (rc.zhwbgpm === zwpm[i2] &&
                            rc.bgbh === bgbh1[i2] &&
                            new_data[i].hgbm === rc.hgbm &&
                            new_data[i].tsl === rc.tsl &&
                            rc.sfdb !== '是') {
                            rc.hyd = new_data[i].hyd;
                            items_table.push_modi_rid(rc.rid);
                        }
                    }
                }
            }
        }
    }

    merge_table.clear()
    merge_table.view_data = new_data
    console.log(new_data)
    merge_table.sync_operate_data()
    items_table.sync_operate_data()
    recordset.do_re_sum_by_trigger_table('合并产品')
    merge_table.modified = true;
    items_table.modified = true;
}


const customs_merge_items1 = (recordset) => {
    let merge_table = recordset.tables['合并产品'];
    let items_table = recordset.tables['产品资料'];

    let items_data = items_table.view_data;
    let new_data = [];
    let filter_list = [];
    let seq = 0;

    for (let row of items_data) {
        if (row.sfdb !== '是') {
            if (row.zzsl > 0) {
                let newTsl;
                newTsl = row.tsl;
                if (row.zzsl === '6') {
                    newTsl = '5';
                } else if (row.zzsl === '4') {
                    newTsl = '4';
                } else if (row.zzsl === '3') {
                    newTsl = '3';
                }
                if (newTsl !== undefined && newTsl !== '') {
                    row.tsl = newTsl;
                }
                row.tsl = newTsl;
                let zwpmts = row.zwpmts;
                let row_json = {}
                if (filter_list.indexOf(zwpmts) < 0) {
                    filter_list.push(zwpmts)
                    let rid = _.utils.guid()
                    seq += 1

                    row_json.rid = rid
                    row_json.pid = recordset.rid
                    row_json.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    row_json.mtime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    row_json.seq = seq
                    row_json.hgbm = row.hgbm
                    row_json.zwpm = row.zhwbgpm
                    row_json.sbys = row.sbys
                    row_json.chsl = row.chsl
                    row_json.jldw = row.jldw
                    row_json.chxs = row.chxs
                    row_json.bzdw = row.bzdw
                    row_json.gczj = row.gczj
                    row_json.wxzj1 = row.wxzj
                    // row_json.zxl = row.wxrl
                    row_json.zmz = row.zmz
                    row_json.zjz = row.zjz
                    row_json.ztj = row.ztj
                    row_json.dyg = row.dyg
                    row_json.hbdm = row.hbdm
                    row_json.zzsl = row.zzsl
                    row_json.tsl = row.tsl
                    row_json.hgjldw = row.hgjldw
                    row_json.zwpm1 = row.zhwbgpm
                    row_json.mjzj = row.mjzj
                    row_json.hyd = row.hyd
                    if (row.caiziz != '') {
                        row_json.cz = row.caiziz.substring(0, 48)
                    } else {
                        row_json.cz = '无'
                    }
                    row_json.zwpmts = row.zwpmts

                    new_data.push(row_json)
                    merge_table.push_new_rid(rid)
                } else {
                    let i = filter_list.indexOf(zwpmts)
                    if (row.caiziz != '' && new_data[i].cz == '') {
                        new_data[i].cz = row.caiziz.substring(0, 48);
                    }

                    new_data[i].chsl = new_data[i].chsl + row.chsl
                    new_data[i].gczj = new_data[i].gczj + row.gczj
                    new_data[i].wxzj1 = new_data[i].wxzj1 + row.wxzj
                    new_data[i].mjzj = new_data[i].mjzj + row.mjzj

                    if (row.yfph == '') {
                        new_data[i].chxs = new_data[i].chxs + row.chxs
                        new_data[i].zmz = new_data[i].zmz + row.zmz
                        new_data[i].zjz = new_data[i].zjz + row.zjz
                        new_data[i].ztj = new_data[i].ztj + row.ztj
                    }
                }
            }
        }
    }

    let zwpmhyd = [];
    let zwpm = [];
    let hyd1 = [];
    let bgbh1 = [];
    let yjhj = 0;

    for (let i = 0; i < new_data.length; i++) {
        const current_yw = [];
        let r = new_data[i]
        for (let row of items_data) {
            if (row.sfdb !== '是' && row.zwpmts === new_data[i].zwpmts) {
                if (!current_yw.includes(row.djpmy)) {
                    current_yw.push(row.djpmy);
                }
            }
        }
        console.log(r)
        r.cgdj = round(r.gczj / r.chsl, 3)
        r.wxmz = round(r.zmz / r.chxs, 3)
        r.wxjz = round(r.zjz / r.chxs, 3)
        r.wxtj = round(r.ztj / r.chxs, 6)
        // r.wxjg = round(r.wxzj1/r.chsl,6)
        r.price = round(r.wxzj / r.chsl, 6)
        r.zxl = Math.trunc(r.chsl / r.chxs)

        const ywbgpm1 = current_yw.join('; ') || '';
        new_data[i].ywpm = ywbgpm1
        new_data[i].ywhj = ywbgpm1

        if (recordset.val('RMB客户') == '是') {
            new_data[i].mjdj1 = round(new_data[i].mjzj / new_data[i].chsl, 3)
        } else {
            new_data[i].wxjg = round(new_data[i].wxzj1 / new_data[i].chsl, 3)
        }

        const key = `${new_data[i].zwpm};${new_data[i].hyd};${new_data[i].bgbh}`;
        if (!zwpmhyd.includes(key)) {
            zwpmhyd.push(key);
            zwpm.push(new_data[i].zwpm);
            hyd1.push(new_data[i].hyd);
            bgbh1.push(new_data[i].bgbh);
        }

        if (recordset.val('明佣合计') > 0) {
            const myhj = recordset.val('明佣合计')
            if (recordset.val('RMB客户') == '是') {
                new_data[i].yjzj = Math.trunc(new_data[i].mjzj / recordset.val('合并金额RMB合计') * myhj, 3)
                new_data[i].mjdj1 = Math.trunc((new_data[i].mjzj - new_data[i].yjzj) / new_data[i].chsl * 1000 / 1000)
                new_data[i].yjzj = round((new_data[i].mjzj - new_data[i].mjdj1 * new_data[i].chsl) * 100 / 100, 3)
                yjhj = yjhj + new_data[i].yjzj
            } else {
                new_data[i].yjzj = Math.trunc(new_data[i].wxzj1 / recordset.val('合并金额合计') * myhj, 3)
                new_data[i].wxjg = Math.trunc((new_data[i].wxzj1 - new_data[i].yjzj) / new_data[i].chsl * 1000 / 1000)
                new_data[i].yjzj = round((new_data[i].wxzj1 - new_data[i].wxjg * new_data[i].chsl) * 100 / 100, 3)
                yjhj = yjhj + new_data[i].yjzj
            }

            if (i == new_data.length - 1 && new_data.length > 1) {
                new_data[i].yjzj = round(new_data[i].yjzj + myhj - yjhj, 3)
                if (recordset.val('RMB客户') == '是') {
                    new_data[i].mjdj1 = round((new_data[i].mjzj - new_data[i].yjzj) / new_data[i].chsl, 3)
                } else {
                    new_data[i].wxjg = round((new_data[i].wxzj1 - new_data[i].yjzj) / new_data[i].chsl, 3)
                }
            }
        }
    }

    for (let i2 = 0; i2 < zwpmhyd.length; i2++) {
        let j1 = 0;
        for (let i = 0; i < new_data.length; i++) {
            const key = `${new_data[i].zwpm};${new_data[i].hyd};${new_data[i].bgbh}`;
            if (key === zwpmhyd[i2]) {
                j1++;
                if (j1 > 1) {
                    const suffix = ['.', ' .', '  .', '   .'][j1 - 2];
                    new_data[i].hyd = hyd1[i2] + suffix;

                    for (const rc of items_table.view_data) {
                        if (rc.zhwbgpm === zwpm[i2] &&
                            rc.bgbh === bgbh1[i2] &&
                            new_data[i].hgbm === rc.hgbm &&
                            new_data[i].tsl === rc.tsl &&
                            rc.sfdb !== '是') {
                            rc.hyd = new_data[i].hyd;
                            items_table.push_modi_rid(rc.rid);
                        }
                    }
                }
            }
        }
    }

    merge_table.clear()
    merge_table.view_data = new_data
    console.log(new_data)
    merge_table.sync_operate_data()
    items_table.sync_operate_data()
    recordset.do_re_sum_by_trigger_table('合并产品')
    merge_table.modified = true;
    items_table.modified = true;
};


const declaration_form_BtnClick = async(evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset

    if (btn.name == 'declaration_hbcpyj_btn') {
        console.log('点击了合并产品优景按钮')
        _.http.post('/api/saier/declaration/button/hbcpyj', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.data.hbcpyjdata == 1) {
                customs_merge_items(recordset)
            } else {
                _.ui.message.error('合并产品优景失败，请检查用户权限后重试');
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })

    }


    if (btn.name == 'declaration_hbcpbhb_btn') {
        console.log('点击了合并产品按钮')
        _.http.post('/api/saier/declaration/button/hbcpyj', {
            rid: recordset.val('rid')
        }).then(res => {
            if (res.data.hbcpyjdata == 1) {
                customs_merge_items1(recordset)
            } else {
                _.ui.message.error('合并产品优景失败，请检查用户权限后重试');
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    if (btn.name == 'declaration_gghsfpsd_btn') {
        if (recordset.val('制单人员') === username) {
            recordset.module.field_by_full_name('核算发票').enabled = true;
        }
    }

    if (btn.name == 'declaration_cwjs_btn') {
        if (recordset.val('通知财务') === username) {
            recordset.val('流转财务', '否');
            recordset.val('流转时间', '');
        } else {
            if (recordset.val('通知财务') === '') {
                _.http.post('/api/saier/declaration/button/hbcpyj', {
                    rid: recordset.val('rid')
                }).then(res => {
                    if (res.data.hbcpyjdata == 1) {
                        recordset.val('流转财务', '否');
                        recordset.val('流转时间', '');
                    }
                }).catch(res => {
                    _.ui.message.error(res.msg);
                    console.log(res);
                })
            }
        }
    }

    if (btn.name == 'declaration_sxhyd_btn') {
        _.http.post('/api/saier/declaration/button/sxhyd', {
            datalist: recordset.tables['产品资料'].view_data
        }).then(res => {
            if (res.data.redatalist.length > 0) {
                let t = recordset.tables['产品资料'];
                for (let r of t.view_data) {
                    for (let rt of res.data.redatalist) {
                        if (r.rid == rt.rid) {
                            r.hyd = rt.hyd
                            t.push_modi_rid(r.rid)
                        }
                    }
                }
                t.sync_operate_data()
                t.modified = true
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }

    if (btn.name == 'declaration_sxpmhyd_btn') {
        let t = recordset.tables['合并产品'];
        let tc = recordset.tables['产品资料'];
        for (let r of t.view_data) {
            if (r.zwpmts != '') {
                for (let rc of tc.view_data) {
                    if (r.zwpmts == rc.zwpmts) {
                        rc.tsl = r.tsl
                        rc.zhwbgpm = r.zhwbgpm
                        rc.hyd = r.hyd
                        rc.hgbm = r.hgbm
                        rc.bgbh = r.bgbh
                        tc.push_modi_rid(rc.rid)
                    }
                }

            }

            r.zwpmts = r.zwpm + r.tsl + r.hyd + r.hgbm + r.bgbh
            r.zwpm1 = r.zwpm
            t.push_modi_rid(r.rid)
        }
        t.sync_operate_data()
        t.modified = true
        tc.sync_operate_data()
        tc.modified = true
    }

    if (btn.name == 'declaration_plfktt_btn') {
        let yfktt = ''
        _.ui.show_input_dialog('请输入原付款抬头', '').then(val => {
            yfktt = val
            if (val == '' || val == null || val == undefined) {
                _.ui.message.error('原付款抬头不能为空')
            }
        })
        if (yfktt != '') {
            _.http.post('/api/saier/declaration/button/plfktt', {
                datalist: recordset.tables['产品资料'].view_data,
                bggs: recordset.val('报关公司'),
                yfktt: yfktt
            }).then(res => {
                if (res.data.redatalist.length > 0) {
                    let t = recordset.tables['产品资料'];
                    for (let r of t.view_data) {
                        for (let rt of res.data.redatalist) {
                            if (r.rid == rt.rid) {
                                r.fktt = recordset.val('报关公司')
                                t.push_modi_rid(r.rid)
                            }
                        }
                    }
                    t.sync_operate_data()
                    t.modified = true
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })

        }
    }

    if (btn.name == 'declaration_sxhwbgdh_btn') {
        if (recordset.val('制单人员') === username) {
            let t = recordset.tables['合并产品'];
            let ij = 0;

            for (let r of t.view_data) {
                ij++;
                if (recordset.val('报关单号') !== '' && r.bgmxdhbcp === '') { // 出口货物报关单号
                    r.bgmxdhbcp = recordset.val('报关单号') + String(ij).padStart(3, '0');
                    t.push_modi_rid(r.rid);
                }
            }

            t.sync_operate_data();
            t.modified = true;
        }
    }

    if (btn.name == 'declaration_cwplfj_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }
        _.http.post('/api/saier/declaration/button/cwplfj', {
            rids: rids
        }).then(function (res) {
            let d = res.data;
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                    file: d
                }, d);
            }
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }

    if (btn.name == 'declaration_drxjsc_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }
        _.http.post('/api/saier/declaration/button/drxjsc', {
            rids: rids
        }).then(function (res) {
            let d = res.data;
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                    file: d
                }, d);
            }
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }

    if (btn.name == 'declaration_dddrmb_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids.push(form.current_rid.value)
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请先选择要操作的记录!')
            return;
        }

        _.http.post('/api/saier/declaration/button/dddrmb/options', {
            rids: rids
        }).then(res => {
            _.ui.show_input_select_dialog('请选择报关公司', '', res.data.bggs_list).then(val => {
                if (val == '' || val == null || val == undefined) {
                    _.ui.message.error('报关公司不能为空');
                    return
                }

                _.ui.show_input_dialog('可否引已导数据(1可,2不可,默认2)', '2').then(flag => {
                    let allow_imported = (flag === '1') ? '1' : '2'

                    _.http.post('/api/saier/declaration/button/dddrmb', {
                        rids: rids,
                        bggs: val,
                        allow_imported: allow_imported
                    }).then(function (res) {
                        let d = res.data;
                        if (d && d != '') {
                            _.http.download("/api/tmp/file/get", {
                                file: d
                            }, d);
                        }
                    }).catch(err => {
                        _.ui.message.error(err.msg)
                        console.log(err)
                    })
                })
            })
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }

    if (btn.name === 'declaration_kptz_btn') {
        const rid = form.current_rid.value; // recordset.val('rid');

        const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '').trim());
        const CANCEL = { __cancel__: true };

        // let da = await _.http.post('/api/saier/declaration/button/kptz/check', {
        //     rid: rid
        // }).then(res => {
        //     return res.data;
        // }).catch(err => {
        //     _.ui.message.error(err.msg || '检查KPTZ执行条件失败');
        //     return err;
        // });
        // if (!da || da.code !== 0) {
        //     return _.ui.message.error(da && da.msg ? da.msg : '检查开票通知执行条件失败');
        // }

        const askDate = (title, defaultVal, errMsg) => {
            return _.ui.show_input_dialog(title, defaultVal || '').then(val => {
                if (val === undefined || val === null) throw CANCEL; // 取消=直接退出
                const t = String(val).trim();
                if (!isDate(t)) throw new Error(errMsg);
                return t;
            });
        };

        const submitKptz = (sbdateVal, gsfprqVal) => {
            return _.http.post('/api/saier/declaration/button/kptz/run_v2', {
                rid: rid,
                sbdate: sbdateVal || '',
                gsfprq: gsfprqVal || '',
                // ysfp: recordset.val('原始发票') || '',
                // ywrya: recordset.val('业务员') || ''
            }).then(res => {
                // 后端要求补录（1001）
                if (res && res.code === 1001) {
                    const req = (res.data && res.data.required) || [];
                    const def = (res.data && res.data.defaults) || {};

                    let p = Promise.resolve({
                        sbdate: def.sbdate || sbdateVal || '',
                        gsfprq: def.gsfprq || gsfprqVal || ''
                    });

                    if (req.includes('sbdate')) {
                        p = p.then(v =>
                            askDate('请输入报关日期格式2010-01-18', v.sbdate, '报关日期格式不正确')
                            .then(x => {
                                v.sbdate = x;
                                return v;
                            })
                        );
                    }
                    if (req.includes('gsfprq')) {
                        p = p.then(v =>
                            askDate('请输入国税发票日期格式2010-01-18', v.gsfprq, '国税发票日期格式不正确')
                            .then(x => {
                                v.gsfprq = x;
                                return v;
                            })
                        );
                    }

                    return p.then(v => submitKptz(v.sbdate, v.gsfprq));
                }

                if (!res || res.code !== 0) {
                    throw new Error((res && res.msg) || 'KPTZ执行失败');
                }

                const d = res.data || {};
                if (d.download_filename) {
                    _.http.download('/api/tmp/file/get', {
                        file: d.download_filename,
                        fn: d.download_filename
                    });
                }
                if (Array.isArray(d.warnings) && d.warnings.length) {
                    _.ui.message.warning(d.warnings.join('\n'));
                }
                _.ui.message.success('KPTZ全部完成');
            });
        };

        // 直接让后端决定是否需要补录
        submitKptz('', '').catch(err => {
            if (err && err.__cancel__) return; // Pascal: 取消直接退出
            _.ui.message.error((err && err.message) || 'KPTZ执行失败');
        });
    }

    if (btn.name == 'INV_pack_sales_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }
        console.log(1122211)
        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/export/detailed/INVpacksales/list1', {
            rids: rids,
        }).then(res => {
            let d = res.data;
            console.log(1231589)
            if (d != '' && d != null) {
                _.http.download("/api/tmp/file/get", {
                        file: d
                    },
                    d
                );
                console.log(7891011)
            }

        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'RMB_INV_pack_sales_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }

        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/export/detailed/INVpacksales/list2', {
            rids: rids,
        }).then(res => {
            let d = res.data;

            if (d != '' && d != null) {
                _.http.download("/api/tmp/file/get", {
                        file: d
                    },
                    d
                );

            }

        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }

    if (btn.name == 'BUY_INV_pack_sales_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value != '' && form.current_rid.value != null) {
                rids = [form.current_rid.value]
            }
        }

        if (rids.length == 0) {
            _.ui.message.error('请先选中要导出的记录')
            return
        }
        _.http.post('/api/saier/export/detailed/INVpacksales/list3', {
            rids: rids,
        }).then(res => {
            let d = res.data;

            if (d != '' && d != null) {
                _.http.download("/api/tmp/file/get", {
                        file: d
                    },
                    d
                );

            }

        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], declaration_form_BtnClick, '报关明细')

const declaration_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'declaration_hbcpyj_btn',
            "caption": '合并产品(优景)',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_hbcpbhb_btn',
            "caption": '合并产品(英文不合并)',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_kptz_btn',
            "caption": '(优景）自动生成开票信息',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_gghsfpsd_btn',
            "caption": '更改核算发票锁定',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_cwjs_btn',
            "caption": '财务解锁',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_sxhyd_btn',
            "caption": '刷新货源地',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_sxpmhyd_btn',
            "caption": '刷品名退税货源地',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_plfktt_btn',
            "caption": '批量付款抬头',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_sxhwbgdh_btn',
            "caption": '刷新出口货物报关单号',
            "icon": 'any-keyborad',
        })


    }
    if (!form.is_editor) {
        btns.push({
            "name": 'declaration_cwplfj_btn',
            "caption": '财务批量附件信息',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_drxjsc_btn',
            "caption": '导入现金生成',
            "icon": 'any-keyborad',
        })
        btns.push({
            "name": 'declaration_dddrmb_btn',
            "caption": '订单导入模板',
            "icon": 'any-keyborad',
        })
        btns.push({
            name: 'INV_pack_sales_btn',
            caption: '优景INV pack sales',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'RMB_INV_pack_sales_btn',
            caption: 'RMB 优景INV pack sales',
            icon: 'any-server-update',
            divided: true,
        })
        btns.push({
            name: 'BUY_INV_pack_sales_btn',
            caption: '买优景INV pack sales',
            icon: 'any-server-update',
            divided: true,
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


}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], declaration_FormShow, '报关明细')

const declaration_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '产品资料') {
            let a1 = 1
            let username = _.user.username
            if (recordset.val('产品资料.发票号码') == '') {
                recordset.val('产品资料.发票号码', recordset.val('发票号码'));
            }
            let fphm1 = recordset.val('发票号码');
            if (recordset.val('报关公司') != '') {
                recordset.val('产品资料.付款抬头', recordset.val('报关公司'));
            }

            if (recordset.val('产品资料.出运唯一字段') == '') {
                recordset.val('产品资料.出运唯一字段', a1.toString() + ';' + recordset.val('发票号码') + username + new Date().format('yyyy-mm-dd hh:mm:ss'));
            }

            _.http.post('/api/saier/declaration/items/delete', {
                zfphm: recordset.val('发票号码'),
                khbh: recordset.val('客户编号'),
                khmc: recordset.val('客户名称'),
                line: recordset.tables['产品资料'].current_data,
            }).then(res => {
                resolve();
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            resolve()
        }
    })
}
_.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, declaration_table_delete_before, '报关明细')