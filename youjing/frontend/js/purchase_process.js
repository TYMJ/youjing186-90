// 编辑界面数据加载以后执行
const purchase_process_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    let username = _.user.username;
    recordset.module.group_by_name('查看人员').visible = false;
    recordset.module.group_by_name('预配柜清单').visible = false;
    recordset.module.group_by_name('预付款申请').visible = false;
    recordset.tables['产品资料']._.toolbar.show('new', false);
    recordset.tables['产品资料']._.toolbar.show('copy', false);
    recordset.module.field_by_full_name(m + '.跟单查看').disabled = true;
    recordset.module.field_by_full_name(m + '.配柜查看1').disabled = true;
    recordset.module.field_by_full_name(m + '.预付款审请').disabled = true;
    if (recordset.val('跟单人员') == username || username == 'zjnblh') {
        recordset.module.group_by_name('查看人员').visible = true
        recordset.module.field_by_full_name(m + '.配柜查看1').disabled = false;
        recordset.module.field_by_full_name(m + '.预付款审请').disabled = false;
        recordset.module.field_by_full_name(m + '.跟单查看').disabled = false;
    };
    recordset.module.field_by_full_name(m + '.跟单日期').disabled = false;
    recordset.module.field_by_full_name(m + '.验货人员').disabled = false;
    recordset.module.field_by_full_name(m + '.验货人员2').disabled = false;
    recordset.module.field_by_full_name(m + '.验货人员3').disabled = false;
    if (recordset.val('验货人员') != '') {
        recordset.module.field_by_full_name(m + '.验货人员').disabled = true;
    }
    if (recordset.val('验货人员2') != '') {
        recordset.module.field_by_full_name(m + '.验货人员2').disabled = true;
    }
    if (recordset.val('验货人员3') != '') {
        recordset.module.field_by_full_name(m + '.验货人员3').disabled = true;
    }
    recordset.module.group_by_name('历史进仓资料').visible = false;
    // recordset.val('进仓历史', '否');
    if (recordset.val('跟单查看') == '是') {
        recordset.module.field_by_full_name(m + '.跟单查看').disabled = true;
        if (recordset.val('跟单日期') != '' && recordset.val('跟单日期') != null) {
            recordset.module.field_by_full_name(m + '.跟单日期').disabled = true;
        }
    }
    recordset.module.field_by_full_name(m + '.辅料合同').hide();
    _.http.post('/api/saier/purchase_process/load/check', {

    }).then(function (res) {
        let d = res.data;
        let htnr = d.htnr
        let qc = d.qc
        // if ((recordset.val('合同签订要点') == '' || recordset.val('合同签订要点') == null) && htnr != '' && htnr != null && htnr != undefined) {
        //     recordset.val('合同签订要点', htnr)
        // }
        if (qc == 1) {
            recordset.module.group_by_name('历史进仓资料').visible = false;
            recordset.module.group_by_name('产品资料').visible = false;
            recordset.module.group_by_name('进仓资料').visible = false;
            recordset.module.field_by_full_name(m + '.产品资料.开票点数').disabled = true;
            recordset.module.field_by_full_name(m + '.产品资料.采购单价').disabled = true;
            recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').disabled = true;
            recordset.module.field_by_full_name(m + '.产品资料.总 金 额').disabled = true;
        }
        recordset.refresh_ui();
        // recordset._list['采购跟单.报价审批'] = d;
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], purchase_process_recordLoad, '采购跟单')


// 编辑界面字段change后执行
const purchase_process_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let username = _.user.username
    let m = module.name
    let fields = [m + '.产品资料.采购单价', m + '.产品资料.内盒装箱量', m + '.产品资料.内盒/外箱', m + '.产品资料.外箱装箱量', m + '.产品资料.开票工厂',
    m + '.产品资料.组织机构代码', m + '.产品资料.开票联系人', m + '.产品资料.开票电话', m + '.产品资料.产品规格', m + '.产品资料.增值税率',
    m + '.产品资料.退税率', m + '.产品资料.货 源 地', m + '.产品资料.开票点数', m + '.产品资料.是否含税',
    m + '.生产厂家', m + '.结算方式', m + '.货 源 地'
    ];
    if (fields.indexOf(field.full_name) !== -1) {
        recordset.val('修改识别', '是')
    }
    if (field.full_name == m + '.验货人员') {
        if (recordset.val('唯一字段1') == '') {
            recordset.val('唯一字段1', recordset.val('rid') + '_1')
        }
    }
    if (field.full_name == m + '.验货人员2') {
        if (recordset.val('唯一字段2') == '') {
            recordset.val('唯一字段2', recordset.val('rid') + '_2')
        }
    }
    if (field.full_name == m + '.验货人员3') {
        if (recordset.val('唯一字段3') == '') {
            recordset.val('唯一字段3', recordset.val('rid') + '_3')
        }
    }
    if (field.full_name == m + '.进仓资料.预计进仓') {
        if (recordset.val('进仓资料.预计进仓') != '' && recordset.val('进仓资料.预计进仓') != null) {
            recordset.val('预计进仓', recordset.val('进仓资料.预计进仓'))
        }
    }
    if (field.full_name == m + '.进仓时间') {
        if (recordset.val('进仓时间') != '' && recordset.val('进仓时间') != null) {
            recordset.val('预计进仓', recordset.val('进仓时间'))
        }
        let t = recordset.tables['进仓资料'];
        let y = t.view_data;
        let x = recordset.tables['历史进仓资料'];
        let z = x.view_data;
        for (let r of y) {
            let l = _deepClone(r)
            l.rid = _.utils.guid()
            l.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
            l.uid = _.user.rid
            l.modi_uid = _.user.rid
            l.modi_time = new Date().format('yyyy-MM-dd hh:mm:ss')
            x.push_new_rid(l.rid)
            z.push(l)
        }
        x.sync_operate_data();
        x.modified = true;
        t.clear();
    }
    if (field.full_name == m + '.进仓历史') {
        recordset.module.group_by_name('历史进仓资料').visible = (recordset.val('进仓历史') == '是');
    }
    if (field.full_name == m + '.产品资料.结    论' && value != '') {
        if (recordset.val('业务人员') != username) {
            _.message.message_to_user(recordset.val('业务人员'), {
                title: '货物跟单结论通知',
                msg: username + '货物跟单结论通知:合同号:' + recordset.val('合同号码') + ',货号:' + recordset.val('产品资料.产品编号') + '结论:' + recordset.val('产品资料.结    论'),
                type: 'warning',
                duration: 30000,
            }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)
        }
        if (recordset.val('采购人员') != username && recordset.val('采购人员') != recordset.val('业务人员')) {
            _.message.message_to_user(recordset.val('采购人员'), {
                title: '货物跟单结论通知',
                msg: username + '货物跟单结论通知:合同号:' + recordset.val('合同号码') + ',货号:' + recordset.val('产品资料.产品编号') + '结论:' + recordset.val('产品资料.结    论'),
                type: 'warning',
                duration: 30000,
            }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)
        }
    }
    if (field.full_name == m + '.产品资料.包装长度' || field.full_name == m + '.产品资料.包装宽度' || field.full_name == m + '.产品资料.包装高度') {
        let bzcd = recordset.val('产品资料.包装长度');
        let bzkd = recordset.val('产品资料.包装宽度');
        let bzgd = recordset.val('产品资料.包装高度');
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj > 0) {
            let bztj1 = bztj * 0.2;
            if (recordset.val('产品资料.外箱体积') > bztj) {
                if (recordset.val('产品资料.外箱体积') - bztj > bztj1) recordset.val('产品资料.外箱体积', round(bztj, 3));
            } else {
                if (bztj - recordset.val('产品资料.外箱体积') > bztj1) recordset.val('产品资料.外箱体积', round(bztj, 3));
            }
        }
    }
    if (field.full_name == m + '.产品资料.进仓时间' && value != '' && value != null) {
        recordset.val('产品资料.实际进仓', recordset.val('产品资料.进仓时间'));
    }
    if (field.full_name == m + '.产品资料.外箱体积') {
        let bzcd = recordset.val('产品资料.包装长度');
        let bzkd = recordset.val('产品资料.包装宽度');
        let bzgd = recordset.val('产品资料.包装高度');
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj != 0) {
            recordset.val('产品资料.外箱体积', round(bztj, 3));
            if (recordset.val('产品资料.外箱体积') < 0.001) {
                recordset.val('产品资料.外箱体积', 0.001);
            }
        }
    }
    if (field.full_name == m + '.产品资料.进仓数量' || field.full_name == m + '.产品资料.进仓时间') {
        let sb = '';
        if (recordset.val('产品资料.进仓数量') == 0 && (recordset.val('产品资料.进仓箱数') > 0)) {
            if (recordset.val('产品资料.外箱装箱量') != 0) {
                recordset.val('产品资料.进仓数量', recordset.val('产品资料.进仓箱数') * recordset.val('产品资料.外箱装箱量'));
            } else {
                sb = '1';
            }
        }
        if (recordset.val('产品资料.进仓数量') > 0) {
            let jcsl = 0;
            let cpbh = '';
            let jcsj = recordset.val('产品资料.进仓时间');
            if ((recordset.val('进仓时间') == jcsj) && (jcsj != '') && (jcsj != null)) {
                if (recordset.val('产品资料.进仓数量') > 0) {
                    cpbh = recordset.val('产品资料.产品编号');
                    jcsl = jcsl + recordset.val('产品资料.进仓数量');
                    let t = recordset.tables['进仓资料'];
                    let d = t.view_data;
                    for (let r of d) {
                        if (cpbh == r.cpbh && recordset.val('产品资料.唯一字段') == r.cgwyzd) {
                            jcsl = jcsl + r.jcsl - r.thxs;
                        }
                    }
                    let y = recordset.tables['历史进仓资料'];
                    let x = y.view_data;
                    for (let r of x) {
                        if (cpbh == r.cpbh && recordset.val('产品资料.唯一字段') == r.cgwyzd) {
                            jcsl = jcsl + r.jcsl - r.thxs;
                        }
                    }
                    if ((jcsl > recordset.val('产品资料.完成数量')) || (jcsl > recordset.val('产品资料.数量合计'))) {
                        _.ui.message.error('累计进仓数大于完成数量或合同数量请修正!');
                        sb = '1';
                    } else {
                        recordset.val('产品资料.已进仓数', jcsl);
                    }
                }
            } else {
                if (jcsj == '' || jcsj == null) { } else {
                    _.ui.message.error('进仓时间不符请修正(产品进仓时间和主要信息中进仓时间要一致,并不能为空!');
                    recordset.val('产品资料.进仓时间', '')
                }
            }
            if (recordset.val('产品资料.外箱装箱量') != 0) {
                recordset.val('产品资料.进仓箱数', recordset.val('产品资料.进仓数量') / recordset.val('产品资料.外箱装箱量'));
            } else {
                recordset.val('产品资料.进仓箱数', 0);
            }
        }
        if (sb == '1') {
            recordset.val('产品资料.进仓箱数', 0);
            recordset.val('产品资料.进仓数量', 0);
        }
    }
    if (field.full_name == m + '.产品资料.开票工厂' && value != '') {
        _.http.post('/api/saier/purchase_process/kpgc/change', {
            kpgc: value
        }).then(function (res) {
            let d = res.data;
            if (d && d.hyd != '') recordset.val('产品资料.货 源 地', d.hyd)
            if (d && d.zzjgdm != '') recordset.val('产品资料.组织机构代码', d.zzjgdm)
            if (d && d.kplxr != '') recordset.val('产品资料.开票联系人', d.kplxr)
            if (d && d.kpdh != '') recordset.val('产品资料.开票电话', d.kpdh)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            recordset.val('产品资料.开票工厂', '')
        })
    }
    fields = [m + '.产品资料.图片1', m + '.产品资料.图片2', m + '.产品资料.图片3', m + '.产品资料.图片4', m + '.产品资料.图片5', m + '.产品资料.图片6', m + '.产品资料.图片7', m + '.产品资料.图片8']
    if (fields.indexOf(field.full_name) !== -1) {
        let i = 0
        for (let f of fields) {
            if (recordset.val(f) != '' && recordset.val(f) != '[]' && recordset.val(f) != null) {
                i = i + 1
            }
        }
        if (i >= 6) {
            let date = new Date().format('yyyy-MM-dd hh:mm:ss')
            recordset.val('产品资料.图片上传时间', date)
            _.http.post('/api/saier/purchase_process/image/change', {
                wyzd: recordset.val('产品资料.唯一字段'),
                wxwyzd: recordset.val('产品资料.外销唯一字段'),
                hthm: recordset.val('合同号码'),
                zycpbh: recordset.val('产品资料.专业产品编号'),
                tpscsj: date
            }).then(function (res) {
                let d = res.data;
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (field.full_name == m + '.查看人员.查看人员' && value != "") {
        let ckry = recordset.val('查看人员.查看人员');
        let sb = recordset.val('查看人员.识别');
        if (sb != '有') {
            _.http.post('/api/saier/purchase_order/view/ckry/change', {
                ckry: ckry,
                module: recordset.module.name,
                rid: recordset.val('rid')
            }).then(res => {
                let d = res.data;
                recordset.val('查看人员.father1', recordset.val('rid'));
                recordset.val('查看人员.module1', recordset.module.name);
                recordset.val('查看人员.objectnumber1', d.uid);
                recordset.val('查看人员.path', d.path);
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        } else {
            _.ui.message.error('该查看人员已存在，无需重复添加');
            _.plaform.active.reload_data()
        }
    }
    if (field.full_name == m + '.查看人员.查看人员') {
        let ckry = recordset.val('查看人员.查看人员');
        let sjck = recordset.val('查看人员.上级查看');
        if (ckry != '') {
            if (sjck == '是') {
                _.http.post('/api/saier/purchase_order/view/cksj/change', {
                    ckry: ckry,
                    module: recordset.module.name,
                    rid: recordset.val('rid')
                }).then(res => {
                    let d = res.data;
                    let t = recordset.tables['查看人员'];
                    let y = t.view_data;
                    for (let r of d) {
                        let l = {}
                        l.rid = _.utils.guid()
                        l.pid = recordset.val('rid')
                        l.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                        l.uid = _.user.rid
                        l.rejection1 = r.name
                        l.module1 = recordset.module.name
                        l.objectnumber1 = r.uid
                        l.path = r.path
                        l.father1 = recordset.val('rid')
                        y.push(l)
                        t.push_new_rid(l.rid)
                    }
                    if (d.length > 0) {
                        t.sync_operate_data();
                        t.modified = true;
                    }
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            }
        } else {
            _.ui.message.error('请先填写查看人员');
            _.plaform.active.reload_data()
        }
    }
    if (field.full_name == m + '.仓库名称' && value != '') {
        _.http.post('/api/saier/purchase_process/ckmc/change', {
            ckmc: value,
            khmc: recordset.val('客户名称'),
            hthm: recordset.val('合同号码')
        }).then(function (res) {
            let d = res.data;
            if (d && d.kamc != '') recordset.val('目的仓库', d.kamc)
            if (d && d.jcbh != '') recordset.val('进仓编号', d.jcbh)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            recordset.val('仓库名称', '')
        })
    }
    if (field.full_name == m + '.跟单人员' && value != '') {
        _.http.post('/api/saier/purchase_process/gdry/change', {
            gdry: value,
        }).then(function (res) {
            let d = res.data;
            if (d && d.path != '') recordset.val('业务', d.path)
            if (d && d.uid != '') recordset.val('uid', d.uid)
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            recordset.val('跟单人员', '')
        })
    }
    if (field.full_name == m + '.跟单查看') {
        purchase_process_gcxx_update(recordset)
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, purchase_process_field_change, '采购跟单')


const purchase_process_gcxx_update = (recordset) => {
    _.http.post('/api/saier/purchase_process/gdck/change', {
        // cs_id: recordset.val('厂商编号'),
        sccj: recordset.val('生产厂家'),
        kpgc: recordset.val('开票工厂')
    }).then(function (res) {
        let d = res.data;
        if (d) {
            if (d.cs_id != '' && d.cs_id != recordset.val('厂商编号')) recordset.val('厂商编号', d.cs_id)
            recordset.val('联系人员', d.cslxr)
            recordset.val('联系电话', d.phone)
            recordset.val('工厂手机', d.sjhm)
            recordset.val('工厂传真', d.fax)
            recordset.val('所在省份', d.province1)
            recordset.val('所在城市', d.city1)
            recordset.val('开票工厂', d.kpgc)
            recordset.val('信用代码', d.csdm)
            recordset.val('开票联系人', d.kplxr)
            recordset.val('开票电话', d.kpdh)
            if (recordset.val('验货地点') == '') recordset.val('验货地点', d.address)
            if (d.fktt != '') {
                let t = recordset.tables['产品资料'];
                let y = t.view_data;
                for (let r of y) {
                    r.fktt = d.fktt
                    t.push_modi_rid(r.rid)
                }
                t.sync_operate_data();
                t.modified = true;
            }
            if (d.hyd != '') recordset.val('货 源 地', d.hyd)
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}

const purchase_process_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let username = _.user.username
        let m = recordset.module.name
        if (recordset.val('跟单人员') != username) {
            reject('不好意思,您没有权限更改此资料,请与跟单人员联系,谢谢');
            return
        }
        let t = recordset.tables['产品资料'];
        let v = t.view_data;
        for (let r of v) {
            if (r.sfhs == '是' && (r.zzsl == 0 || r.zzsl == undefined || r.zhwbgpm == '' || r.zhwbgpm == '无' || r.zhwbgpm == undefined ||
                r.hgbm == '' || r.bgjldw == '' || r.kpgc == '' || r.hyd == '' ||
                r.hgbm == undefined || r.bgjldw == undefined || r.kpgc == undefined || r.hyd == undefined)) {
                if (recordset.val('货 源 地') != '') {
                    r.hyd = recordset.val('货 源 地')
                    t.push_modi_rid(r.rid)
                    continue
                }
                reject('不好意思,(增税退税不能为0，报关品名、海关编码、报关单位、开票工厂、货 源 地)有开票必填信息没填不能保存!');
                return
            }
        }
        if (recordset.val('货 源 地') != '' && (recordset.val('货 源 地').indexOf('其他') != -1 || recordset.val('货 源 地').indexOf('其它') != -1)) {
            _.ui.message.error('请注意货源地中不能包含其他或其它');
            recordset.val('货 源 地', '')
        }
        let kpgc = recordset.val('开票工厂');
        let kpzz = recordset.val('信用代码');
        let kplx = recordset.val('开票联系人');
        let kpdh = recordset.val('开票电话');
        let hyd = recordset.val('货 源 地');
        _.http.post('/api/saier/purchase_process/save/before', {
            main: recordset.tables['采购跟单'].view_data,
            lines: recordset.tables['产品资料'].view_data
        }).then(res => {
            let d = res.data;
            let uid = d.uid
            let items = d.items
            let x = recordset.tables['进仓资料'];
            let y = x.view_data;
            let g = recordset.module.group_by_name('进仓资料');
            let hzhj = 0
            let zwpm_list = []
            recordset.val('uid', uid)
            for (let r of v) {
                hzhj = hzhj + r.zje
                zwpm_list.push(r.zwpm + '-数量：' + r.htzsl)
                if (r.tphh == '' || r.tphh == null || r.tphh == undefined) {
                    r.tphh = r.rid
                }
                if (r.sfhs == '是') {
                    r.hyd = hyd;
                    r.mdka = recordset.val('目的仓库');
                    r.kpgc = kpgc;
                    r.zzjgdm = kpzz;
                    r.kplxr = kplx;
                    r.kpdh = kpdh;
                }
                if (recordset.val('进仓时间') != '' && recordset.val('进仓时间') != null && r.jcsj != '' && r.jcsj != null && recordset.val('进仓时间') == r.jcsj.substring(0, 10) &&
                    r.jcsl > 0 && r.yjcs <= r.wcsl) {
                    let l = {}
                    for (let f of g.fields) {
                        let c = f.db.name
                        if (c in r) {
                            l[c] = r[c]
                        }
                    }
                    l.rid = _.utils.guid()
                    l.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                    l.uid = _.user.rid
                    l.wyzd = l.rid
                    l.pid = recordset.val('rid')
                    l.jcbh = recordset.val('进仓编号')
                    l.ckmc = recordset.val('仓库名称')
                    l.yjjc = recordset.val('预计进仓')
                    l.cgwyzd = r.wyzd
                    y.push(l)
                    x.push_new_rid(l.rid)
                    r.jcsj = null
                    r.jcsl = 0
                }
                if (items && items[r.rid] && items[r.rid].dzsd) {
                    r.zdry = items[r.rid].dzsd;
                }
                let zzsl = r.zzsl;
                let tsl = r.tsl;
                if (tsl == 17) {
                    r.tsl = 16;
                }
                if (zzsl == 17) {
                    r.zzsl = 16;
                }
                r.xddd = recordset.val('下单地点');
                t.push_modi_rid(r.rid)
            }
            recordset.val('货值合计', hzhj)
            recordset.val('中文品名', zwpm_list.join('\n'))
            recordset.val('额外收入', d.ewsr)
            recordset.val('额外支出', d.ewzc)
            recordset.val('收支详情', d.szxq)
            t.sync_operate_data();
            t.modified = true;
            x.sync_operate_data();
            x.modified = true;
            resolve()
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            reject()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, purchase_process_before_save, '采购跟单')

const purchase_process_after_save = (evt_id, recordset) => {
    _.http.post('/api/saier/purchase_process/save/after', {}).then(res => {

    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, purchase_process_after_save, '采购跟单')

function purchase_process_table_new_after(evt_id, table, recordset) {
    if (table.group == '进仓资料') {
        recordset.val('进仓资料.唯一字段', recordset.val('进仓资料.rid'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], purchase_process_table_new_after, '采购跟单')


const purchase_process_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '历史进仓资料') {
        form.recordset.tables['历史进仓资料']._.toolbar.show('copy', false);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], purchase_process_EditorChildShow, '采购跟单')


function purchase_process_table_delete_before(evt_id, table, recordset) {
    return new Promise((resolve, reject) => {
        if (table.group == '进仓资料' || table.group == '历史进仓资料') {
            _.http.post('/api/saier/purchase_process/child/delete', {
                group: table.group,
                wyzd: recordset.val(table.group + '.唯一字段'),
                rid: recordset.val('rid'),
                hthm: recordset.val('合同号码'),
                jcsj: recordset.val(table.group + '.进仓时间'),
                ckmc: recordset.val(table.group + '.仓库名称'),
                cpbh: recordset.val(table.group + '.产品编号'),
                wxwyzd: recordset.val(table.group + '.外销唯一字段'),
                cgwyzd: recordset.val(table.group + '.采购唯一字段')
            }).then(res => {
                if (table.group == '历史进仓资料') {
                    let t = recordset.tables['产品资料'];
                    let d = t.view_data;
                    let jcsl = recordset.val('历史进仓资料.进仓数量');
                    let flag = 0
                    let cpbh = recordset.val('历史进仓资料.产品编号');
                    let hwms = recordset.val('历史进仓资料.货物描述');
                    for (let r of d) {
                        if (cpbh == r.cpbh && hwms == r.hwms) {
                            r.yjcs = r.yjcs - jcsl;
                            flag = 1
                            t.push_modi_rid(r.rid)
                            break
                        }
                    }
                    if (flag == 1) {
                        t.sync_operate_data();
                        recordset.do_re_sum_by_trigger_table('产品资料');
                        t.modified = true;
                    }
                }
                resolve()
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
                reject(err.msg)
            })
        } else if (table.group == '查看人员') {
            if (recordset.val('查看人员.查看人员') == '') {
                resolve()
                return
            }
            if (recordset.val('查看人员.查看人员') == _.user.username) {
                _.ui.message.error('自己不能删除自己查看权限');
                reject()
                return
            }
            _.http.post('/api/saier/purchase_order/view/delete/check', {
                ckry: recordset.val('查看人员.查看人员'),
                rid: recordset.val('rid'),
                module: recordset.module.name
            }).then(function (res) {
                resolve()
                return
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
                reject()
                return
            })
        } else {
            resolve()
        }
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], purchase_process_table_delete_before, '采购跟单')


const purchase_process_form_BtnClick = async (evt_id, btn, form) => {
    let recordset = form.recordset;
    let m = form.module.name;
    let username = _.user.username
    if (btn.name == 'gcxx_update_btn') {
        purchase_process_gcxx_update(recordset)
    }
    if (btn.name == 'cancel_update_btn') {
        if (recordset.val('跟单人员') != username) {
            _.ui.message.error('只有跟单人员操作执行此操作!');
            return
        }
        _.http.post('/api/saier/purchase_process/qxjc/btn', {
            ckry: recordset.val('合同号码'),
            rid: recordset.val('rid'),
            jcrq: recordset.val('预计进仓'),
            module: recordset.module.name
        }).then(function (res) { }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
            return
        })
    }
    if (btn.name == 'hyd_update_btn') {
        if (recordset.val('开票工厂') == '' || recordset.val('开票工厂') == null) {
            _.ui.message.error('开票工厂为空,操作被取消!');
            return
        }
        recordset.do_action('事_开票工厂_货源地')
    }
    if (btn.name == 'ccyh_update_btn') {
        if (recordset.val('唯一字段3') != '' && recordset.val('验货人员3') != '' && recordset.val('跟单人员') == _.user.username) {
            recordset.val('验货人员3', '');
            recordset.val('唯一字段3', '');
            recordset.val('验货审请3', '');
            recordset.val('申请日期3', '');
            recordset.val('验货说明3', '');
            recordset.val('验货情况3', '');
            recordset.val('确认3', '');
            recordset.val('验货3', '');
            recordset.val('验货部门3', '');
            recordset.module.field_by_full_name('采购跟单.验货人员3').disabled = false;
        }
    }
    if (btn.name == 'fktt_update_btn') {
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
        _.http.post('/api/saier/purchase_process/get/company', {}).then(function (res) {
            let d = res.data;
            _.ui.show_input_select_dialog('请输入付款抬头', '', d).then(fktt => {
                if (fktt == null || fktt == '') {
                    _.ui.message.error('付款抬头不能为空!')
                    return;
                }
                _.http.post('/api/saier/purchase_process/fktt/btn', {
                    fktt: fktt,
                    rids: rids
                }).then(function (res) {
                    _.ui.message.success('付款抬头更新完成!')
                }).catch(err => {
                    _.ui.message.error(err.msg)
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (btn.name == 'gcxx_batch_update') {
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
        _.http.post('/api/saier/purchase_process/batch/update/gcxx', {
            rids: rids
        }).then(function (res) {
            _.ui.message.success('批量更新工厂信息完成!')
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (btn.name == 'gdck_batch_update') {
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
        _.ui.show_input_date_dialog('请输入付款抬头', null).then(date => {
            _.http.post('/api/saier/purchase_process/batch/update/gdck', {
                rids: rids,
                date: date
            }).then(function (res) {
                _.ui.message.success('批量更新跟单查看完成!')
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        })
    }
    if (btn.name == 'cgrk_batch_btn') {
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
        let check = await _.http.post('/api/saier/purchase_process/batch/cgrk/check', {
        }).then(function (res) {
            return true
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            return false
        })
        if (!check) {
            return;
        }
        let ckmc = await _.ui.show_input_select_dialog('请输入仓库名称', '', ['义乌仓库', '宁波志恒', '汕头仓库', '宁波龙和', '宁波万纬']).then(val => {
            if (val == null || val == '') {
                _.ui.message.error('仓库名称不能为空!')
                return '';
            }
            return val
        }).catch(err => {
            return ''
        })
        if (ckmc == '') {
            return;
        }
        let jcrq = await _.ui.show_input_date_dialog('请输入进仓日期', null).then(date => {
            if (date == null || date == '') {
                return '';
            }
            return date
        }).catch(err => {
            return ''
        })
        _.http.post('/api/saier/purchase_process/batch/cgrk/btn', {
            rids: rids,
            jcrq: jcrq,
            ckmc: ckmc
        }).then(function (res) {
            let d = res.data;
            if (d && d != '') {
                _.http.download("/api/tmp/file/get", {
                    file: d
                },
                    ckmc + new Date().format('yyyyMMddhhmm') + '.zip'
                );
            }
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
    if (btn.name == 'report_print_btn') {
        if (form.recordset.modified == true) {
            return _.ui.message.error('请先保存数据再进行打印!')
        }
        let WarehouseName = recordset.val('仓库名称');
        let jcsj = recordset.val('预计进仓');
        let jcry = recordset.val('仓库操作');
        if (WarehouseName == '' || WarehouseName == null) {
            _.ui.message.error('仓库名称为空,请修正!')
            return;
        }
        if (jcsj == '' || jcsj == null) {
            _.ui.message.error('预计进仓为空,请修正!')
            return;
        }
        if (jcry == '' || jcry == null) {
            _.ui.message.error('仓库操作为空,请修正!')
            return;
        }
        // _.ui.show_input_date_dialog('请输入付款抬头', null).then(date => {
        _.http.post('/api/saier/purchase_process/report/print', {
            rid: recordset.val('rid'),
            ckmc: WarehouseName,
        }).then(function (res) {
            _.ui.message.success(res.msg)
        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
        // })
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], purchase_process_form_BtnClick, '采购跟单')


// 查询界面或编辑界面打开事件
const purchase_process_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'fktt_update_btn',
            "caption": '批量付款抬头',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'gcxx_batch_update',
            "caption": '批量更新工厂信息',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'gdck_batch_update',
            "caption": '批量跟单查看',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'cgrk_batch_btn',
            "caption": '批量入库',
            "icon": 'any-function',
            "divided": true
        });
    } else {
        btns.push({
            "name": 'hyd_update_btn',
            "caption": '刷货源地',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'gcxx_update_btn',
            "caption": '更新工厂信息',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'cancel_update_btn',
            "caption": '取消进仓',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'ccyh_update_btn',
            "caption": '超次验货',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'jcd',
            "caption": '进仓单',
            "icon": 'any-function',
            "divided": true
        })
        // 2026-6-10 注释掉报表打印按钮，后续如果需要再放开: 没有具体的报表打印代码，先隐藏此按钮，避免用户误点
        // btns.push({
        //     "name": 'report_print_btn',
        //     "caption": '报表打印',
        //     "icon": 'any-server-update',
        //     "divided": true
        // })
    }
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], purchase_process_Form_Show, '采购跟单')


// 子表记录scroll事件
const purchase_process_table_scroll = (evt_id, table, recordset) => {
    let module = recordset.module.name
    if (table.group == '产品资料') {
        recordset.module.field_by_full_name(module + '.产品资料.制单人员').disabled = (recordset.val('产品资料.制单人员') != '');
    }
    if (table.group == '进仓资料') {
        recordset.module.field_by_full_name(module + '.进仓资料.预计进仓').disabled = (recordset.val('进仓资料.锁定') == '是');
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, purchase_process_table_scroll, '采购跟单')