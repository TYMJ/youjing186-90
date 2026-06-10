const salesorder_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('MSN') == '1') {
            _.ui.message.error('不好意思,你删除了锁定的数据，系统不能保存，请直接关闭系统')
            reject()
            return
        }
        if (recordset.val('汇    率') == 1) {
            _.ui.message.warning('请注意,汇率为rmb和美金比值');
        }
        let zhmjhl = 1;
        if (recordset.val('转美元汇率') <=0) {
            recordset.val('转美元汇率', 1);
        } else {
            zhmjhl = recordset.val('转美元汇率');
        }
        _.http.post("/api/saier/salesorder/save/before", {
            khmc: recordset.val('客户名称'),
            mdka: recordset.val('目的口岸'),
            kh_id: recordset.val('客户编号'),
            spjg: recordset.val('审批结果'),
            spsq: recordset.val('审批申请'),
            order_id: recordset.val('合同号码'),
            ywry: recordset.val('业务人员'),
            ssgs: recordset.val('上属公司'),
            htwy: recordset.val('合同唯一'),
            // rid: recordset.val('rid'),
        }).then(res => {
            console.log(res)
            let d = res.data;
            let i1 = d.i1;
            let username = _.user.username;
            let n = recordset.module.name;
            let spsq = recordset.val('审批申请');
            let spsq1 = recordset.val('审批申请1');
            if (d.kfxg != '是' && d.ywry1 != username && (spsq != '' && spsq != username)) {
                _.ui.message.error('不好意思,你没有权利修改,请与相关业务人员或主管联系,谢谢')
                reject()
                return
            }
            console.log(i1)
            if (i1 != 1) {
                _.ui.message.error('不好意思,此人没有审批权限,请重新选择,谢谢')
                reject()
                return
            }
            if (username !== spsq1 && spsq1 !== '' && d.kfxg !== '是') {
                _.ui.message.error('不好意思,此记录已提交,您没有权限更改此资料,请与审批人员联系,谢谢')
                reject()
                return
            }
            if (d.path != "") {
                recordset.val('业务', d.path);
            }
            if (d.gsmc != "") {
                recordset.val('我方公司', d.gsmc);
            }
            if (recordset.val('目的仓库') == "") {
                recordset.val('目的仓库', recordset.val('目的口岸'));
            }
            if (recordset.val('目的口岸') == "") {
                recordset.val('目的口岸', recordset.val('目的仓库'));
            }
            if (recordset.val('合同号码') !== '') {
                let wxht = recordset.val('合同号码')
                let i2 = wxht.length;
                sb2 = i2 > 0 ? wxht.toUpperCase().charAt(i2 - 1) : '';
                if ('0123456789'.includes(sb2)) {
                    recordset.val('合同号码', wxht + res.data.bz);
                }
                recordset.val('唯一字段', recordset.val('rid'));
                recordset.val('外销审核', '123');
                let htjc = ''
                let uvIndex = recordset.val('合同号码').indexOf('UV');
                if (uvIndex !== -1 && htjc === '') {
                    if (res.data.jxsb1 === 1 && res.data.jxsb2 !== 1) {
                        // 取UV前2个字符开始到结尾
                        let startIndex = Math.max(uvIndex - 2, 0);
                        htjc = recordset.val('合同号码').substring(startIndex);
                    } else {
                        // 取UV开始到结尾
                        htjc = recordset.val('合同号码').substring(uvIndex);
                    }
                }
            } else {
                recordset.val('合同简写', '');
            }
            let tj2 = recordset.val('修改清单');
            recordset.val('审批申请1', spsq);
            recordset.val('修改清单', tj2 + '\n' + username + new Date().format('yyyy-MM-dd hh:mm:ss'));
            let tjz = [];
            let dmlqd = [];
            let ml = 0
            let mdck = recordset.val('目的仓库');
            let jdrq = recordset.val('接单日期');
            let wfgs = recordset.val('我方公司');
            let mldx = recordset.val('毛利底线');
            let bjql = recordset.val('审批结果');
            let khmc = recordset.val('客户名称');
            let hthm = recordset.val('合同号码');
            let a = recordset.val('合同日期');
            let hr2 = recordset.val('贸易国别');
            let yjhb = recordset.val('所属地区');
            let yjcq = recordset.val('预计船期');
            let hr1 = recordset.val('汇    率');
            let hrhb = recordset.val('货币代码');
            recordset.val('审批结果1', bjql);
            if (d.path1 != "") {
                recordset.val('path1', d.path1);
            }
            let hr = new Date().format('yyyy-MM-dd hh:mm:ss');
            let ryn = []
            let ryy = []
            let sfsq = [];
            let khrmbhjz = 0;
            let htjezz = 0;
            let i = 0
            let t = recordset.tables['产品资料']
            let v = t.view_data
            let m = recordset.tables['修改记录']
            let l = m.view_data
            for (let r of v) {
                i = i + 1;
                let aydj = 0;
                let mydj = 0;
                if (r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0) {
                    aydj = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] = Math.floor((aydj + 0.0000001) * 100) / 100;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0) {
                    mydj = r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] = Math.floor((mydj + 0.0000001) * 100) / 100;
                }
                r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣单价').db.name];
                r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').db.name];
                if (r[recordset.module.field_by_full_name(n + '.产品资料.图片货号').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.图片货号').db.name] = username + new Date().format('yyyyMMdd hhmmss') + ';' + i;
                }
                r[recordset.module.field_by_full_name(n + '.产品资料.合同号码').db.name] = recordset.val('合同号码');
                // r[recordset.module.field_by_full_name(n + '.产品资料.客户合同').db.name] = recordset.val('客户合同');
                if (r[recordset.module.field_by_full_name(n + '.产品资料.目的仓库').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.目的仓库').db.name] = mdck;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.是否授权').db.name] == '是') {
                    sfsq.push('授权货号:' + r[recordset.module.field_by_full_name(n + '.产品资料.专业货号').db.name]);
                }
                if ((r[recordset.module.field_by_full_name(n + '.产品资料.可思达货号').db.name] != '') && (recordset.val('我方公司') == '宁波可思达进出口有限公司')) {
                    r[recordset.module.field_by_full_name(n + '.产品资料.报表货号').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.可思达货号').db.name];
                } else {
                    r[recordset.module.field_by_full_name(n + '.产品资料.报表货号').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.专业货号').db.name];
                }
                let yj = r[recordset.module.field_by_full_name(n + '.产品资料.自编货号').db.name];
                let bm = r[recordset.module.field_by_full_name(n + '.产品资料.编码').db.name];
                let ls = r[recordset.module.field_by_full_name(n + '.产品资料.临时货号').db.name];
                r[recordset.module.field_by_full_name(n + '.产品资料.客户名称').db.name] = khmc;
                r[recordset.module.field_by_full_name(n + '.产品资料.客户编号').db.name] = recordset.val('客户编号');
                r[recordset.module.field_by_full_name(n + '.产品资料.客户判断').db.name] = recordset.val('RMB客户');
                if (r[recordset.module.field_by_full_name(n + '.产品资料.客户判断').db.name] === '是') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价9').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额9').db.name] = 0;
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金汇率').db.name] = 1;
                    khrmbhjz = khrmbhjz + r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name] * r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金R').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.暗佣R').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name];
                    if (hr1 !== 0) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.佣金M').db.name] = Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] / hr1) * zhmjhl * 1000) / 1000;
                        r[recordset.module.field_by_full_name(n + '.产品资料.暗佣M').db.name] = Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] / hr1) * zhmjhl * 1000) / 1000;
                    }
                } else {
                    r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额9').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价9').db.name] = 0;
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金汇率').db.name] = hr1;
                    htjezz = htjezz + r[recordset.module.field_by_full_name(n + '.产品资料.外销单价').db.name] * r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金R').db.name] = Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] * hr1) * 1000) / 1000;
                    r[recordset.module.field_by_full_name(n + '.产品资料.暗佣R').db.name] = Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] * hr1) * 1000) / 1000;
                    r[recordset.module.field_by_full_name(n + '.产品资料.佣金M').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] * zhmjhl;
                    r[recordset.module.field_by_full_name(n + '.产品资料.暗佣M').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] * zhmjhl;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.业务人员').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.业务人员').db.name] = recordset.val('业务人员');
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.外销部门').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.外销部门').db.name] = recordset.val('外销部门');
                }
                r[recordset.module.field_by_full_name(n + '.产品资料.合同业务path').db.name] = recordset.val('业务');
                r[recordset.module.field_by_full_name(n + '.产品资料.合同业务').db.name] = recordset.val('业务人员');
                if (r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] < mldx) {
                    dmlqd.push('请注意，产品' + r[recordset.module.field_by_full_name(n + '.产品资料.产品编号').db.name] + r[recordset.module.field_by_full_name(n + '.产品资料.专业货号').db.name] + '的毛 利 率为' + r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] + '低于' + mldx + '!');
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.交货日期').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.交货日期').db.name] = jhrq;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.日期').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.日期').db.name] = new Date().format('yyyy-MM-dd');
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] == '' || r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] == null || r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] == undefined) {
                    r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] = yjcq;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.外销唯一字段').db.name] == '') {
                    // r[recordset.module.field_by_full_name(n + '.产品资料.外销唯一字段').db.name] = r.rid;
                    r[recordset.module.field_by_full_name(n + '.产品资料.外销唯一字段').db.name] = hthm + new Date().format('yyyyMMddhhmmss') + i;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] != '' && r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name] != yjcq) {
                    let jn = ryn.indexOf(r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name]);
                    if (jn < 0) {
                        ryn.push(r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name]);
                        ryy.push(r[recordset.module.field_by_full_name(n + '.产品资料.产品货号1').db.name] + '\\' + r[recordset.module.field_by_full_name(n + '.产品资料.箱    数').db.name]);
                    } else {
                        ryy[jn] = ryy[jn] + ', ' + (r[recordset.module.field_by_full_name(n + '.产品资料.产品货号1').db.name] + '\\' + r[recordset.module.field_by_full_name(n + '.产品资料.箱    数').db.name]);
                    }
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.汇    率').db.name] == '' || r[recordset.module.field_by_full_name(n + '.产品资料.汇    率').db.name] == 1) {
                    r[recordset.module.field_by_full_name(n + '.产品资料.汇    率').db.name] = hr1;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.合同日期').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.合同日期').db.name] = a;
                }
                if (r[recordset.module.field_by_full_name(n + '.产品资料.我方公司').db.name] == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.我方公司').db.name] = wfgs;
                }
                r[recordset.module.field_by_full_name(n + '.产品资料.贸易国别').db.name] = hr2;
                r[recordset.module.field_by_full_name(n + '.产品资料.所属地区').db.name] = yjhb;
                r[recordset.module.field_by_full_name(n + '.产品资料.交货日期').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name];
                r[recordset.module.field_by_full_name(n + '.产品资料.货币代码').db.name] = hrhb;
                if (bm == '') {
                    if (yj != '') {
                        r[recordset.module.field_by_full_name(n + '.产品资料.编码').db.name] = khmc + yj + hr;
                        if (ls == '') {
                            r[recordset.module.field_by_full_name(n + '.产品资料.临时货号').db.name] = khmc + yj + hr;
                            r[recordset.module.field_by_full_name(n + '.产品资料.货号备注').db.name] = khmc + yj + hr;
                        }
                    }
                }
                if ((r[recordset.module.field_by_full_name(n + '.产品资料.下单数   量5').db.name] == 0) || (r[recordset.module.field_by_full_name(n + '.产品资料.下单箱数   量4').db.name] == 0)) {
                    r[recordset.module.field_by_full_name(n + '.产品资料.下单数   量5').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                    r[recordset.module.field_by_full_name(n + '.产品资料.下单箱数   量4').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.箱    数').db.name];
                }
                let cpbh = r[recordset.module.field_by_full_name(n + '.产品资料.产品编号').db.name];
                let zwpm = r[recordset.module.field_by_full_name(n + '.产品资料.中文品名').db.name];
                let ywpm = r[recordset.module.field_by_full_name(n + '.产品资料.英文品名').db.name];
                let khhh = r[recordset.module.field_by_full_name(n + '.产品资料.客户货号').db.name];
                let bjhh = r[recordset.module.field_by_full_name(n + '.产品资料.专业货号').db.name];
                let zhwbzh = r[recordset.module.field_by_full_name(n + '.产品资料.中文包装').db.name];
                let bzhfsh = r[recordset.module.field_by_full_name(n + '.产品资料.英文包装').db.name];
                let zbhh = r[recordset.module.field_by_full_name(n + '.产品资料.自编货号').db.name];
                let zhwbzh2 = r[recordset.module.field_by_full_name(n + '.产品资料.中文包装1').db.name];
                if (zhwbzh2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.中文包装1').db.name] = zhwbzh;
                    zhwbzh2 = r[recordset.module.field_by_full_name(n + '.产品资料.中文包装').db.name];
                }
                let bzhfsh2 = r[recordset.module.field_by_full_name(n + '.产品资料.英文包装1').db.name];
                if (bzhfsh2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.英文包装1').db.name] = bzhfsh;
                    bzhfsh2 = r[recordset.module.field_by_full_name(n + '.产品资料.英文包装').db.name];
                }
                let cgdj = r[recordset.module.field_by_full_name(n + '.产品资料.采购单价').db.name];
                let jg = r[recordset.module.field_by_full_name(n + '.产品资料.外销单价').db.name];
                let cgdj2 = r[recordset.module.field_by_full_name(n + '.产品资料.采购单价1').db.name];
                let khrmbdj = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name];
                let khrmbdj1 = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价1').db.name];
                let pkRMB = r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB').db.name];
                let pkRMB1 = r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB1').db.name];
                if (pkRMB1 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB1').db.name] = pkRMB;
                    pkRMB1 = r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB').db.name];
                }
                if (khrmbdj1 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价1').db.name] = khrmbdj;
                    khrmbdj1 = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name];
                }
                if (cgdj2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.采购单价1').db.name] = cgdj;
                    cgdj2 = r[recordset.module.field_by_full_name(n + '.产品资料.采购单价').db.name];
                }
                let jg2 = r[recordset.module.field_by_full_name(n + '.产品资料.外销单价1').db.name];
                if (jg2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.外销单价1').db.name] = jg;
                    jg2 = r[recordset.module.field_by_full_name(n + '.产品资料.外销单价').db.name];
                }
                let htxs = r[recordset.module.field_by_full_name(n + '.产品资料.箱    数').db.name];
                let htxs2 = r[recordset.module.field_by_full_name(n + '.产品资料.箱数1').db.name];
                if (htxs2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.箱数1').db.name] = htxs;
                    htxs2 = r[recordset.module.field_by_full_name(n + '.产品资料.箱    数').db.name];
                }
                let nhs = r[recordset.module.field_by_full_name(n + '.产品资料.内盒装箱量').db.name];
                let nhs2 = r[recordset.module.field_by_full_name(n + '.产品资料.内盒装箱1').db.name];
                if (nhs2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.内盒装箱1').db.name] = nhs;
                    nhs2 = r[recordset.module.field_by_full_name(n + '.产品资料.内盒装箱量').db.name];
                }
                let nhwx = r[recordset.module.field_by_full_name(n + '.产品资料.内盒/外箱').db.name];
                let nhwx2 = r[recordset.module.field_by_full_name(n + '.产品资料.内盒/外箱1').db.name];
                if (nhwx2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.内盒/外箱1').db.name] = nhwx;
                    nhwx2 = r[recordset.module.field_by_full_name(n + '.产品资料.内盒/外箱').db.name];
                }
                let wxrl = r[recordset.module.field_by_full_name(n + '.产品资料.外箱装箱量').db.name];
                let wxrl2 = r[recordset.module.field_by_full_name(n + '.产品资料.外箱装箱1').db.name];
                if (wxrl2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.外箱装箱1').db.name] = wxrl;
                    wxrl2 = r[recordset.module.field_by_full_name(n + '.产品资料.外箱装箱量').db.name];
                }
                let htsl = r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                let htsl2 = r[recordset.module.field_by_full_name(n + '.产品资料.合同数量1').db.name];
                if (htsl2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.合同数量1').db.name] = htsl;
                    htsl2 = r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                }
                let pkdj = r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价').db.name];
                let pkdj2 = r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价1').db.name];
                if (pkdj2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价1').db.name] = pkdj;
                    pkdj2 = r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价').db.name];
                }
                let yjcq1 = r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name];
                let yjcq2 = r[recordset.module.field_by_full_name(n + '.产品资料.预计船期1').db.name];
                if (yjcq2 == '') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.预计船期1').db.name] = yjcq1;
                    yjcq2 = r[recordset.module.field_by_full_name(n + '.产品资料.预计船期').db.name];
                }
                if ((khrmbdj !== khrmbdj1) || (cgdj !== cgdj2) || (jg !== jg2) || (htxs !== htxs2) || (zhwbzh !== zhwbzh2) || (bzhfsh !== bzhfsh2) || (nhs !== nhs2) || (nhwx !== nhwx2) || (wxrl !== wxrl2) || (htsl !== htsl2) || (pkdj !== pkdj2) || (yjcq1 !== yjcq2) || (pkRMB !== pkRMB1)) {
                    let x = {}
                    x['rid'] = _.utils.guid()
                    x['pid'] = r.pid;
                    x['uid'] = _.user.rid
                    x['ctime'] = new Date().format('yyyy-MM-dd hh:mm:ss')
                    x[recordset.module.field_by_full_name(n + '.修改记录.修改时间').db.name] = new Date().format('yyyy-MM-dd hh:mm:ss')
                    x[recordset.module.field_by_full_name(n + '.修改记录.产品编号').db.name] = cpbh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.客户货号').db.name] = khhh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.专业货号').db.name] = bjhh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.自编货号').db.name] = zbhh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.中文品名').db.name] = zwpm;
                    x[recordset.module.field_by_full_name(n + '.修改记录.英文品名').db.name] = ywpm;
                    x[recordset.module.field_by_full_name(n + '.修改记录.采购单价').db.name] = cgdj;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原采购单价').db.name] = cgdj2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.外销单价').db.name] = jg;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原外销单价').db.name] = jg2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.箱    数').db.name] = htxs;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原箱数').db.name] = htxs2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.中文包装').db.name] = zhwbzh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原中文包装').db.name] = zhwbzh2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.英文包装').db.name] = bzhfsh;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原英文包装').db.name] = bzhfsh2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.内盒装箱量').db.name] = nhs;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原内盒装箱').db.name] = nhs2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.内盒/外箱').db.name] = nhwx;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原内盒/外箱').db.name] = nhwx2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.外箱装箱量').db.name] = wxrl;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原外箱装箱').db.name] = wxrl2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.合同数量').db.name] = htsl;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原赔款单价').db.name] = pkdj2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.赔款单价').db.name] = pkdj;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原赔款单价').db.name] = pkdj2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.预计船期').db.name] = yjcq1;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原预计船期').db.name] = yjcq2;
                    x[recordset.module.field_by_full_name(n + '.修改记录.修改人员').db.name] = username;
                    x[recordset.module.field_by_full_name(n + '.修改记录.客户RMB单价').db.name] = khrmbdj;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原客户RMB单价').db.name] = khrmbdj1;
                    x[recordset.module.field_by_full_name(n + '.修改记录.赔款RMB').db.name] = pkRMB;
                    x[recordset.module.field_by_full_name(n + '.修改记录.原赔款RMB').db.name] = pkRMB1;
                    l.push(x)
                    m.push_new_rid(x.rid)
                };
                r[recordset.module.field_by_full_name(n + '.产品资料.内盒装箱1').db.name] = nhs;
                r[recordset.module.field_by_full_name(n + '.产品资料.内盒/外箱1').db.name] = nhwx;
                r[recordset.module.field_by_full_name(n + '.产品资料.外箱装箱1').db.name] = wxrl;
                r[recordset.module.field_by_full_name(n + '.产品资料.合同数量1').db.name] = htsl;
                r[recordset.module.field_by_full_name(n + '.产品资料.箱数1').db.name] = htxs;
                r[recordset.module.field_by_full_name(n + '.产品资料.外销单价1').db.name] = jg;
                r[recordset.module.field_by_full_name(n + '.产品资料.采购单价1').db.name] = cgdj;
                r[recordset.module.field_by_full_name(n + '.产品资料.英文包装1').db.name] = bzhfsh;
                r[recordset.module.field_by_full_name(n + '.产品资料.中文包装1').db.name] = zhwbzh;
                r[recordset.module.field_by_full_name(n + '.产品资料.赔款单价1').db.name] = pkdj;
                r[recordset.module.field_by_full_name(n + '.产品资料.预计船期1').db.name] = yjcq1;
                r[recordset.module.field_by_full_name(n + '.产品资料.赔款RMB1').db.name] = pkRMB;
                r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价1').db.name] = khrmbdj;
                if (jdrq === '1999-01-01') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.起始年月').db.name] = '';
                    r[recordset.module.field_by_full_name(n + '.产品资料.起始年').db.name] = '';
                    r[recordset.module.field_by_full_name(n + '.产品资料.起始月').db.name] = '';

                } else {
                    if (jdrq != null && jdrq.length >= 10) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.起始年月').db.name] = jdrq.substring(1, 7);
                        r[recordset.module.field_by_full_name(n + '.产品资料.起始年').db.name] = jdrq.substring(1, 5);
                        r[recordset.module.field_by_full_name(n + '.产品资料.起始月').db.name] = jdrq.substring(6, 8);
                    }
                }
                r[recordset.module.field_by_full_name(n + '.产品资料.接单日期').db.name] = jdrq;

                ml = ml + r[recordset.module.field_by_full_name(n + '.产品资料.毛  利').db.name];
                t.push_modi_rid(r.rid)
            }

            t.sync_operate_data()
            t.modified = true;
            m.sync_operate_data()
            m.modified = true;
            recordset.do_re_sum_by_trigger_table('产品资料');
            recordset.val('发信识别', '否');
            recordset.val('授权产品', sfsq.join('\n'));
            if (recordset.val('RMB客户') != '是') {
                recordset.val('货值合计总(不含佣金)', recordset.val('货值合计总') - recordset.val('佣金金额') * zhmjhl);
                if (recordset.val('价格条款') != "" && recordset.val('价格条款').toUpperCase() == 'CIF') {
                    if (recordset.val('保险加成') < 100) {
                        recordset.val('保险费用', recordset.val('货值合计') * recordset.val('保险比率') * (100 + recordset.val('保险加成')) / 10000);
                    } else {
                        recordset.val('保险费用', recordset.val('货值合计') * recordset.val('保险比率') * recordset.val('保险加成') / 10000);
                    }
                } else {
                    recordset.val('保险费用', recordset.val('货值合计') * recordset.val('保险比率') / 100);
                }
                recordset.val('合同净额', (recordset.val('货值合计') - recordset.val('海 运 费') - recordset.val('保险费用') - recordset.val('银行费用') - recordset.val('明佣合计')) * zhmjhl - recordset.val('其他USD'));
                recordset.val('成本总额', recordset.val('辅料总价') + recordset.val('采购合计') + recordset.val('运 杂 费') + recordset.val('其他 RMB') + recordset.val('包 干 费') + recordset.val('暗佣合计') * hr1  * zhmjhl);
                if ((recordset.val('合同净额') !== 0)) {
                    recordset.val('换汇成本', recordset.val('成本总额') / recordset.val('合同净额'));
                }
                let ml1 = (recordset.val('合同净额') * hr1) - (recordset.val('成本总额') * (1 + recordset.val('费 用 率'))) + recordset.val('退税总额');
                recordset.val('利润金额', ml1 - ((recordset.val('海 运 费') + recordset.val('保险费用') + recordset.val('银行费用')) * zhmjhl + recordset.val('其他USD')) * hr1 - recordset.val('运 杂 费') - recordset.val('包 干 费'));
                if ((recordset.val('货值合计') * hr1 - recordset.val('明佣合计') * hr1) !== 0) {
                    recordset.val('利 润 率', recordset.val('利润金额') / (recordset.val('货值合计') * hr1 * zhmjhl - recordset.val('明佣合计') * hr1 * zhmjhl));
                }
                recordset.val('客户RMB合计(不含佣金)', 0);
                recordset.val('货值合计（不含佣金)', recordset.val('货值合计') - recordset.val('佣金金额'));
            } else {
                recordset.val('货值合计总(不含佣金)', recordset.val('货值合计总') - recordset.val('佣金金额') / hr1);
                if (recordset.val('价格条款') != "" && recordset.val('价格条款').toUpperCase() == 'CIF') {
                    if (recordset.val('保险加成') < 100) {
                        recordset.val('保险费用', recordset.val('客户RMB合计') * recordset.val('保险比率') * (100 + recordset.val('保险加成')) / 10000);
                    } else {
                        recordset.val('保险费用', recordset.val('客户RMB合计') * recordset.val('保险比率') * recordset.val('保险加成') / 10000);
                    }
                } else {
                    recordset.val('保险费用', recordset.val('客户RMB合计') * recordset.val('保险比率') / 100);
                }
                recordset.val('发信识别', '否');
                recordset.val('合同净额', recordset.val('客户RMB合计') - recordset.val('海 运 费') * hr1 - recordset.val('保险费用') - recordset.val('银行费用') * hr1 - recordset.val('其他USD') * hr1 - recordset.val('明佣合计'));
                recordset.val('成本总额', recordset.val('辅料总价') + recordset.val('采购合计') + recordset.val('运 杂 费') + recordset.val('其他 RMB') + recordset.val('包 干 费') + recordset.val('暗佣合计'));
                let ml1 = recordset.val('合同净额') - (recordset.val('成本总额') * (1 + recordset.val('费 用 率'))) + recordset.val('退税总额');
                recordset.val('利润金额', ml1 - (recordset.val('海 运 费') + recordset.val('其他USD')) * hr1 - recordset.val('保险费用') - recordset.val('银行费用') * hr1 - recordset.val('运 杂 费') - recordset.val('包 干 费'));
                if ((recordset.val('客户RMB合计') - recordset.val('明佣合计')) !== 0) {
                    recordset.val('利 润 率', recordset.val('利润金额') / (recordset.val('客户RMB合计') - recordset.val('明佣合计')));
                }
                recordset.val('客户RMB合计(不含佣金)', recordset.val('客户RMB合计') - recordset.val('佣金金额'));
                recordset.val('货值合计（不含佣金)', 0);
            }
            for (let n1 = 0; n1 < ryn.count; n1++) {
                recordset.val('发信识别', '否');
                tjz.push(ryy.strings[n1] + ': ' + ryn.strings[n1]);
            }
            if (tjz.length > 0) {
                recordset.val('其它交期', yjcq + '(' + tjz.join('; ') + ')');
            } else {
                recordset.val('其它交期', yjcq);
            }
            recordset.val('低毛利清单', dmlqd.join('\n'));
            resolve();
        }).catch(res => {
            reject()
            _.ui.message.error(res.msg);
            console.log(res);
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, salesorder_before_save, '外销合同')

function formatToTwoDecimals(value) {
    // 处理科学计数法
    if (Math.abs(value) < 0.01) {
        return value.toFixed(2);
    }
    
    // 转换为字符串，确保有两位小数
    return value.toFixed(2);
}

function _calc_commission_ratio(value, returnNumber=false) {
    // 输入验证
    if (typeof value !== 'number' || isNaN(value)) {
        return returnNumber ? 0 : '0.000';
    }
    const isNegative = value < 0;
    let absValue = Math.abs(value);
    // 递归函数
    function convert(val) {
        if (val < 1) return val;
        if (val < 100) return val / 100;
        if (val < 1000) return val / 1000;
        if (val < 10000) return val / 10000;
        if (val < 100000) return val / 100000;
        if (val < 1000000) return val / 1000000;
        if (val < 10000000) return val / 10000000;
        if (val < 100000000) return val / 100000000;
        // 超过1亿的处理
        return convert(val / 1000000000);
    }
    
    let result = convert(absValue);
    // 确保结果小于1
    while (result >= 1) {
        result = result / 10;
    }
    result = isNegative ? -result : result;
    return returnNumber ? result : formatToTwoDecimals(result);
}

// // 编辑界面字段change后执行
const salesorder_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        current_record,
        old_value
    } = opts;
    let row = current_record;
    let n = module.name
    if (field.full_name == n + '.审批结果') {
        if (recordset.val('审批申请')==_.user.username){
            _.platform.active.toolbar.dicts.save.disabled = false;
        }
    }
    if (field.full_name == n + '.更改合计') {
        if (recordset.val('更改合计') > 0 && recordset.val('更改合计') > recordset.val('当前更改数')) {
            _.ui.message.error('请注意采购合同需下单数大于合同数量');
        }
    }
    if (field.full_name == n + '.客户合同') {
        if (recordset.val('客户合同') != '' && recordset.val('客户合同') != '取消') {
            _.http.post("/api/saier/salesorder/khht/change", {
                khmc: recordset.val('客户名称'),
                rid: recordset.val('rid'),
                khht: recordset.val('客户合同')
            }).then(res => {

            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                recordset.val('客户合同', '');
            })
        }
    }
    if (field.full_name == n + '.客户名称') {
        if (recordset.val('客户名称') != '') {
            _.http.post("/api/saier/salesorder/khmc/change", {
                khmc: recordset.val('客户名称'),
            }).then(res => {
                let d = res.data;
                recordset.val('自动计算含佣价', d.zdjs);
                if (d.khxx) {
                    if (d.khxx.xybx != '无') {
                        recordset.val('是否信保', d.khxx.xybx);
                        recordset.val('保险', 1)
                    }
                    if (d.khxx.myds > 0 && d.khxx.ayds > 0) {
                        recordset.val('佣金类型', '明佣+暗佣');
                        recordset.val('佣金点数', d.khxx.myds);
                        recordset.val('暗佣点数', d.khxx.ayds);
                    } else if (d.khxx.myds > 0) {
                        recordset.val('佣金类型', '明佣');
                        recordset.val('佣金点数', d.khxx.myds);
                        recordset.val('暗佣点数', 0);
                    } else if (d.khxx.ayds > 0) {
                        recordset.val('佣金类型', '暗佣');
                        recordset.val('暗佣点数', d.khxx.ayds);
                        recordset.val('佣金点数', 0);
                    }
                    if (d.khxx.bxbl > 0) {
                        recordset.val('保险比率', d.khxx.bxbl);
                    } else {
                        recordset.val('保险比率', 0);
                    }
                    if (d.khxx.bxjc > 0) {
                        recordset.val('保险加成', d.khxx.bxjc);
                    }
                    if (recordset.val('目的口岸') == '') {
                        recordset.val('目的口岸', d.khxx.mdka);
                    }
                    if (d.khxx.zdml > 0) {
                        recordset.val('最低毛利率', d.khxx.zdml);
                        if (d.khxx.zdml > recordset.val('毛利底线')) {
                            recordset.val('毛利底线', d.khxx.jgtk);
                        }
                    } else {
                        recordset.val('最低毛利率', 0);
                    }
                    if (d.khxx.fkry != '') {
                        recordset.val('风控人员', d.khxx.fkry);
                    } else {
                        recordset.val('风控人员', '赵波');
                    }
                    if (d.khxx.RMBkh != '') {
                        recordset.val('RMB客户', d.khxx.RMBkh);
                    }
                } else {
                    recordset.val('保险比率', 0.78);
                    recordset.val('保险加成', 110);
                    recordset.val('价格条款', '');
                    recordset.val('佣金点数', 0);
                    recordset.val('暗佣点数', 0);
                    recordset.val('最低毛利率', 0);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                recordset.val('客户合同', '');
            })
        }
    }
    if (field.full_name == n + '.佣金类型' || field.full_name == n + '.自动计算含佣价') {
        if (recordset.val('自动计算含佣价') != '是' && recordset.val('佣金类型') == '明佣+暗佣') {
            recordset.module.field_by_full_name(n + '.产品资料.佣金单价').disabled = false;
            recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.产品资料.佣金单价').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').disabled = true;
        }
        if ((recordset.val('佣金类型')).indexOf('明佣') != -1) {
            recordset.module.field_by_full_name(n + '.佣金点数').disabled = false;
            recordset.module.field_by_full_name(n + '.明佣合计').disabled = false;
            recordset.module.field_by_full_name(n + '.产品资料.佣金比率').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.佣金点数').disabled = true;
            recordset.module.field_by_full_name(n + '.明佣合计').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.佣金比率').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.佣金单价').disabled = true;
            recordset.val('佣金点数', 0);
        }
        if ((recordset.val('佣金类型')).indexOf('暗佣') != -1) {
            recordset.module.field_by_full_name(n + '.暗佣点数').disabled = false;
            recordset.module.field_by_full_name(n + '.暗佣合计').disabled = false;
            recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.暗佣点数').disabled = true;
            recordset.module.field_by_full_name(n + '.暗佣合计').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').disabled = true;
            recordset.val('暗佣点数', 0);
        }
        if (recordset.val('佣金类型') == '无') {
            recordset.val('佣金点数', 0);
            recordset.val('暗佣点数', 0);
            recordset.module.field_by_full_name(n + '.产品资料.含佣单价').disabled = true;
            recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').disabled = true;

        } else {
            if (recordset.val('RMB客户') != '是') {
                recordset.module.field_by_full_name(n + '.产品资料.含佣单价').disabled = false;
            } else {
                recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').disabled = false;
            }
        }
    }
    if (field.full_name == n + '.佣金点数') {
        let yjds = recordset.val('佣金点数');
        if (String(yjds).indexOf('0.') == 0) {
            recordset.val('佣金点数', yjds * 100);
            recordset.val('佣金比率', recordset.val('佣金点数'));
        }
        let t = recordset.tables['产品资料']
        let d = t.view_data
        let f = false
        for (let r of d) {
            if (r.dzsd == '' || r.dzsd == undefined) {
                // r.yjbl = recordset.val('佣金点数') / 100;
                recordset.val('产品资料.佣金比率', recordset.val('佣金点数') / 100, r)
                // t.push_modi_rid(r.rid);
            } else {
                f = true
            }
        }
        // t.sync_operate_data()
        // t.modified = true;
        if (f) {
            _.ui.message.info('此票有出货单证锁数据，请核实并联系相关单证人员解锁');
        }
    }
    if (field.full_name == n + '.暗佣点数') {
        let ayds = recordset.val('暗佣点数');
        if (String(ayds).indexOf('0.') == 0) {
            recordset.val('暗佣点数', ayds * 100);
        }
        let t = recordset.tables['产品资料']
        let d = t.view_data
        let f = false
        for (let r of d) {
            if (r.dzsd == '' || r.dzsd == undefined) {
                // r.aybl = recordset.val('暗佣点数') / 100;
                recordset.val('产品资料.暗佣比率', recordset.val('暗佣点数') / 100, r)
                // t.push_modi_rid(r.rid);
            } else {
                f = true
            }
        }
        // t.sync_operate_data()
        // t.modified = true;
        if (f) {
            _.ui.message.info('此票有出货单证锁数据，请核实并联系相关单证人员解锁');
        }
    }
    if (field.full_name == n + '.产品资料.佣金比率' || field.full_name == n + '.产品资料.暗佣比率') {
        let yjds = recordset.value('产品资料.佣金比率', row);
        if (String(yjds).indexOf('0.') != 0) {
            recordset.val('产品资料.佣金比率', yjds / 100, row);
        }
        let ayds = recordset.value('产品资料.暗佣比率', row);
        if (String(ayds).indexOf('0.') != 0) {
            recordset.val('产品资料.暗佣比率', ayds / 100, row);
        }
    }
    if (field.full_name == n + '.合同号码') {
        if (recordset.val('合同号码') !== '') {
            let wxht = recordset.val('合同号码')
            let i2 = wxht.length;
            let sb2 = i2 > 0 ? recordset.val('合同号码').toUpperCase().charAt(i2 - 1) : '';
            if (sb2 === 'A' || sb2 === 'B' || sb2 === 'C') {
                let hthm3 = recordset.val('合同号码');
                _.ui.message.warning('合同号码最后位不能为A-C后面将加.！');
                recordset.val('合同号码', hthm3 + '.');
            }

            let hthm = recordset.val('合同号码');
            let hthm2 = '';
            let zs3 = 0;
            let sbcx = '0';
            const invalidChars = ['/', '\n', '\r', '\\', ':', '*', '?', '"', '<', '>', '|', '-', '_'];
            // 从第10个字符开始检查（因为zs2 > 9）
            for (let i = 9; i < hthm.length; i++) {
                let char = hthm.charAt(i);
                if (invalidChars.includes(char)) {
                    sbcx = '1';
                    if (zs3 === 0) {
                        zs3 = i + 1; // +1 因为Delphi是1-based索引
                        break; // 找到第一个无效字符后就可以退出循环
                    }
                }
            }
            if (zs3 >= 1) {
                hthm2 = sbcx === '1' ? hthm.substring(0, zs3 - 1) : hthm;
            }
            if (hthm2.trim() === '') {
                hthm2 = hthm;
            }
            _.http.post("/api/saier/salesorder/hthm/change", {
                rid: recordset.val('rid'),
                order_id: recordset.val('合同号码'),
                hthm2: hthm2,
                htwy: recordset.val('合同唯一'),
                rid: recordset.val('rid'),
            }).then(res => {
                if (hthm.indexOf('CSD-') > 0) {
                    recordset.val('我方公司', '宁波可思达进出口有限公司');
                } else {
                    if (res.data.b === 1) {
                        _.ui.message.error('合同号码已存在!');
                        recordset.val('合同号码', '');
                    }
                }
                if (hthm.indexOf('退回合同') == -1) {
                    if (res.data) {
                        recordset.val('合同唯一', res.data.wyzd);
                        recordset.val('客户名称', res.data.khmc.trim());
                        recordset.val('目的口岸', res.data.mdka);
                        recordset.val('我方公司', res.data.wfgs);
                    } else {
                        if (recordset.val('合同唯一') === '') {
                            _.ui.message.error('这个合同号在合同中不存在，请重新选择');
                            recordset.val('合同号码', '');
                        }
                    }
                }
                if ((recordset.val('合同号码') !== '') && (recordset.val('我方公司') !== '宁波可思达进出口有限公司')) {
                    if (recordset.val('我方公司') === '') {
                        if (res.data.wfgs !== '') {
                            recordset.val('我方公司', res.data.bz);
                        }
                    }
                }
                recordset.val('合同简写', recordset.val('合同号码'));
                if (recordset.val('合同号码') != "" && (res.data.jxsb1 === 1 || res.data.jxsb2 === 1)) {
                    let htjc = ''
                    let uvIndex = recordset.val('合同号码').indexOf('UV');
                    if (uvIndex !== -1 && htjc === '') {
                        if (res.data.jxsb1 === 1 && res.data.jxsb2 !== 1) {
                            // 取UV前2个字符开始到结尾
                            let startIndex = Math.max(uvIndex - 2, 0);
                            htjc = recordset.val('合同号码').substring(startIndex);
                        } else {
                            // 取UV开始到结尾
                            htjc = recordset.val('合同号码').substring(uvIndex);
                        }
                    }
                    recordset.val('合同简写', htjc);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        } else {
            recordset.val('合同简写', '');
        }
    }
    if (field.full_name == n + '.业务人员') {
        if (recordset.val('业务人员') != '') {
            _.http.post("/api/saier/salesorder/ywry/change", {
                ywry: recordset.val('业务人员')
            }).then(res => {
                let d = res.data;
                if (d.path1 != "") {
                    recordset.val('业务', d.path1);
                } else {
                    recordset.val('业务', d.path);
                }
                if (d.wxsh != '') recordset.val('外销审核', d.wxsh);
                recordset.val('是否免审', d.htms);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }
    }
    let fields = [n + '.RMB客户', n + '.毛利底线', n + '.费 用 率', n + '.汇    率'];
    if (fields.indexOf(field.full_name) !== -1) {
        _.http.post("/api/saier/salesorder/rmbkh/change", {
            khmc: recordset.val('客户名称'),
            lines: recordset.tables['产品资料'].view_data,
        }).then(res => {
            let d = res.data;
            let hl_json = d.hl
            let sb = d.flag
            let nxkh = d.nxkh
            let t = recordset.tables['产品资料']
            let v = t.view_data
            let fyl = recordset.val('费 用 率');
            let hl = recordset.val('汇    率');
            let mldx = recordset.val('毛利底线');
            let zdjs = recordset.val('自动计算含佣价')
            let yjlx = recordset.val('佣金类型')
            let dzsd = 0
            let RMBkh = recordset.val('RMB客户');
            let zhmjhl = 1;
            if (recordset.val('转美元汇率')<= 0) {
                zhmjhl = 1
            } else {
                zhmjhl = recordset.val('转美元汇率');
            }
            for (let r of v) {
                let cgbz = r['cghbdm']
                let hlcg = hl_json[cgbz] ? hl_json[cgbz] : 1;
                if (r[recordset.module.field_by_full_name(n + '.产品资料.单证锁定').db.name].trim() != '' && r[recordset.module.field_by_full_name(n + '.产品资料.单证锁定').db.name] != ' ' && r[recordset.module.field_by_full_name(n + '.产品资料.单证锁定').db.name] != undefined) {
                    dzsd = 1
                    continue;
                }
                let zzsl = r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name];
                let tsl = r[recordset.module.field_by_full_name(n + '.产品资料.退 税 率').db.name];
                let htsl = r[recordset.module.field_by_full_name(n + '.产品资料.合同数量').db.name];
                let wxdj = r[recordset.module.field_by_full_name(n + '.产品资料.外销单价').db.name];
                let dkje = r[recordset.module.field_by_full_name(n + '.产品资料.代开金额').db.name];
                let zzsl1 = 0;
                let zzsl2 = 0
                let mll = 0;
                let sj1 = 0;
                let mjdj = 0;
                if (zzsl > 3) {
                    zzsl1 = zzsl;
                }
                zzsl2 = 1 + (zzsl1 / 100);
                if (RMBkh != '是') {
                    r[recordset.module.field_by_full_name(n + '.产品资料.刷新单价').db.name] = new Date().format('yyyy-MM-dd');
                    r[recordset.module.field_by_full_name(n + '.产品资料.汇    率').db.name] = hl;
                    if (((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0) || (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0)) && (zdjs != '否') && (yjlx != '明佣+暗佣') && (zdjs != '按含佣价计算')) {
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣单价').db.name] - wxdj;
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] * htsl;
                        }
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣单价').db.name] - wxdj;
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] * htsl;
                        }
                    }
                    let cgzj = r[recordset.module.field_by_full_name(n + '.产品资料.采购总额').db.name] * hlcg + r[recordset.module.field_by_full_name(n + '.产品资料.辅料总价').db.name];
                    if (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] > 0) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额总').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] * zhmjhl;
                        r[recordset.module.field_by_full_name(n + '.产品资料.赔款总额').db.name] = (r[recordset.module.field_by_full_name(n + '.产品资料.系统外销单价').db.name] * htsl) - (wxdj * htsl);
                    }
                    let zje = r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name];
                    if ((r[recordset.module.field_by_full_name(n + '.产品资料.佣金比率').db.name] >= 0) && (sb == 0)) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = zje * r[recordset.module.field_by_full_name(n + '.产品资料.佣金比率').db.name];
                    } else {
                        if ((r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] >= 0) && (sb == 1)) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] * htsl
                        }
                    }
                    if ((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').db.name] >= 0) && (sb == 0)) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = zje * r[recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').db.name];
                    } else {
                        if ((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] >= 0) && (sb == 1)) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] * htsl;
                        }
                    }
                    if (nxkh == '是') {
                        mjdj = r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] * hl;
                        if (zzsl2 != 0) {
                            sj1 = round((mjdj - cgzj - dkje) / zzsl2 * (zzsl1 / 100) + (r[recordset.module.field_by_full_name(n + '.产品资料.代开点数').db.name] * dkje), 3);
                        }
                        if (mjdj - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] * hl != 0) {
                            mll = round(((mjdj - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] * hl) - cgzj - dkje - r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] * hl) / (mjdj - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] * hl), 3);
                        }
                        r[recordset.module.field_by_full_name(n + '.产品资料.毛  利').db.name] = (Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name]) * hl * mll * 1000)) / 1000;
                        r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] = mll;
                        r[recordset.module.field_by_full_name(n + '.产品资料.税   金').db.name] = sj1;
                        if ((mldx > 0) && (mll < mldx)) {
                            // let wxdj =((cgzj + recordset.module.field_by_full_name(n+'.产品资料.代开金额') + recordset.module.field_by_full_name(n+'.产品资料.暗佣佣金') * hl) / (1 - mldx)) / hl / recordset.module.field_by_full_name(n+'.产品资料.合同数量');
                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '否';
                        } else {
                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '是';
                        }
                    } else {
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] > 0) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额总').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name]* zhmjhl;
                        }
                        if ((r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] > 0) && (cgzj > 0)) {
                            if (tsl == 17) {
                                r[recordset.module.field_by_full_name(n + '.产品资料.退 税 率').db.name] = 13;
                            }
                            if (zzsl == 17) {
                                r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = 16;
                            }
                            zzsl = r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name];
                            tsl = r[recordset.module.field_by_full_name(n + '.产品资料.退 税 率').db.name];
                            if (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] > 1) {
                                if (tsl == 0) {
                                    zzsl = 0;
                                }
                                if ((tsl > 0) || (tsl > zzsl)) {
                                    if (tsl == 3) {
                                        zzsl = 3;
                                        r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                    if (tsl > 3) {
                                        zzsl = zzsl1;
                                        r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                }
                                if (htsl > 0 && hl > 0) {
                                    let a = 0
                                    // let hhcb1 = 0
                                    let hhcb = 0
                                    let zkfy = r[recordset.module.field_by_full_name(n + '.产品资料.纸卡费用').db.name]
                                    let yhf = r[recordset.module.field_by_full_name(n + '.产品资料.验 货 费').db.name]
                                    let bzf = r[recordset.module.field_by_full_name(n + '.产品资料.包装费用').db.name]
                                    if (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] != 0) {
                                        hhcb = (cgzj + zkfy + yhf + bzf + r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] * hl) / (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name]);
                                    }
                                    if (zzsl == zzsl1) {
                                        if (tsl == 5) {
                                            a = 1.11;
                                        } else {
                                            a = 1 + (zzsl - tsl) / 100;
                                        }

                                        if ((fyl == 0) && (a * hl != 0)) {
                                            mll = ((zzsl2 / a * hl) - hhcb) / (zzsl2 / a * hl);
                                            // if ((hl - hl * mldx) != 0) {
                                            //     hhcb1 =zzsl2 / a * (hl - hl * mldx);
                                            // }
                                        } else {
                                            if ((a * hl) != 0) {
                                                mll = ((zzsl2 / a * hl) - (zzsl2 / a * hl * fyl) - hhcb) / (zzsl2 / a * hl);
                                            }
                                            // if ((a * (hl - hl * fyl - hl * mldx)) != 0) {
                                            //     hhcb1 =zzsl2 / a * (hl - hl * fyl - hl * mldx);
                                            // }
                                        }
                                    }
                                    if ((zzsl == 3) && (tsl == 3)) {
                                        mll = ((1.03 * hl) - (1.03 * hl * fyl) - hhcb) / (1.03 * hl);
                                        // hhcb1 =1.03 * (hl - hl * fyl - hl * mldx);
                                    }
                                    if ((zzsl == 1) && (tsl == 1)) {
                                        mll = ((1.01 * hl) - (1.01 * hl * fyl) - hhcb) / (1.01 * hl);
                                        // hhcb1 =1.01 * (hl - hl * fyl - hl * mldx);
                                    }
                                    if ((zzsl == 0) && (tsl == 0)) {
                                        mll = (hl - hl * fyl - hhcb) / hl;
                                        // hhcb1 =hl - hl * fyl - hl * mldx;
                                    }
                                    console.log('毛利率 b', mll, '换汇成本 b', hhcb)
                                    r[recordset.module.field_by_full_name(n + '.产品资料.毛  利').db.name] = (Math.floor((r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name]) * hl * mll * 1000)) / 1000;
                                    r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] = mll;
                                    console.log('毛利率', mll, '换汇成本', hhcb)
                                    r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率m').db.name] = mll;
                                    r[recordset.module.field_by_full_name(n + '.产品资料.换汇成本').db.name] = hhcb;
                                    if (recordset.val('毛利底线') > 0) {
                                        if (mll < recordset.val('毛利底线')) {
                                            // if (hhcb1 != 0) {
                                            //     wxdj =(cgzj + recordset.module.field_by_full_name(n+'.产品资料.纸卡费用') + recordset.module.field_by_full_name(n+'.产品资料.验 货 费') + recordset.module.field_by_full_name(n+'.产品资料.包装费用') + recordset.module.field_by_full_name(n+'.产品资料.暗佣佣金') * hl) / (hhcb1 * htsl);
                                            // }
                                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '否';
                                        } else {
                                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '是';
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // hl =1;
                    let tsl3 = 0
                    if (((r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0) || (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0)) && (recordset.val('自动计算含佣价') != '否') && (yjlx != '明佣+暗佣') && (recordset.val('自动计算含佣价') != '按含佣价计算')) {
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name];
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] * htsl;
                        }
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name];
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] * htsl;
                        }

                    }
                    r[recordset.module.field_by_full_name(n + '.产品资料.刷新单价').db.name] = new Date().format('yyyy-MM-dd');
                    cgzj = r[recordset.module.field_by_full_name(n + '.产品资料.采购总额').db.name] * hlcg + r[recordset.module.field_by_full_name(n + '.产品资料.辅料总价').db.name];
                    let zje = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name];
                    if (r[recordset.module.field_by_full_name(n + '.产品资料.佣金比率').db.name] > 0 && sb == 0) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = zje * r[recordset.module.field_by_full_name(n + '.产品资料.佣金比率').db.name];
                    } else {
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] > 0 && sb == 1) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.佣金单价').db.name] * htsl;
                        }
                    }
                    if (r[recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').db.name] > 0 && sb == 0) {
                        r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = zje * r[recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').db.name];
                    } else {
                        if (r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] > 0 && sb == 1) {
                            r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name] = r[recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').db.name] * htsl;
                        }
                    }
                    if (nxkh == '是') {
                        mjdj = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name];
                        if (zzsl2 != 0) {
                            sj1 = (mjdj - cgzj - dkje) / zzsl2 * (zzsl1 / 100) + (r[recordset.module.field_by_full_name(n + '.产品资料.代开点数').db.name] * dkje);
                        }
                        if ((mjdj - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name]) != 0) {
                            mll = (mjdj - cgzj - dkje - r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name]) / (mjdj - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name]);
                        }
                        r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] = mll;
                        r[recordset.module.field_by_full_name(n + '.产品资料.税   金').db.name] = sj1;
                        r[recordset.module.field_by_full_name(n + '.产品资料.毛  利').db.name] = (Math.floor(r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name] * mll * 1000)) / 1000;
                        if ((mldx > 0) && (mll < mldx)) {
                            // let wxdj1 =(cgzj + recordset.module.field_by_full_name(n+'.产品资料.代开金额') + recordset.module.field_by_full_name(n+'.产品资料.暗佣佣金')) / (1 - mldx) / recordset.module.field_by_full_name(n+'.产品资料.合同数量');
                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '否';
                        } else {
                            r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '是';
                        }
                    } else {
                        if ((r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name] > 0) && (cgzj > 0)) {
                            if (tsl == 17) {
                                r[recordset.setfieldmodule.field_by_full_name(n + '.产品资料.退 税 率').db.name] = 13;
                            }
                            if (zzsl == 17) {
                                r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = 13;
                            }
                            zzsl = r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name];
                            tsl = r[recordset.module.field_by_full_name(n + '.产品资料.退 税 率').db.name];
                            if (r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name] > 0.0001) {
                                if (tsl == 0) {
                                    zzsl = 0;
                                }
                                if ((tsl > 0) || (tsl > zzsl)) {
                                    if (tsl == 3) {
                                        zzsl = 3;
                                        r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                    if (tsl > 3) {
                                        zzsl = zzsl1;
                                        r[recordset.module.field_by_full_name(n + '.产品资料.增值税率').db.name] = zzsl;
                                    }
                                }
                                zzsl2 = 1 + (zzsl / 100);
                                let wxdj2 = r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name] - r[recordset.module.field_by_full_name(n + '.产品资料.佣    金').db.name];
                                if (tsl >= 1) {
                                    let tsl2 = tsl / 100;
                                    if (zzsl2 != 0) {
                                        tsl3 = (r[recordset.module.field_by_full_name(n + '.产品资料.采购总额').db.name] + r[recordset.module.field_by_full_name(n + '.产品资料.辅料总价').db.name]) / zzsl2 * tsl2;
                                    }
                                }
                                if (tsl == 0) {
                                    tsl3 = 0;
                                }
                                if (wxdj2 != 0) {
                                    mll = (wxdj2 - wxdj2 * fyl - cgzj + tsl3 - r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name]) / wxdj2;
                                }
                                r[recordset.module.field_by_full_name(n + '.产品资料.毛  利').db.name] = (Math.floor((wxdj2 - wxdj2 * fyl - cgzj + tsl3 - r[recordset.module.field_by_full_name(n + '.产品资料.暗佣佣金').db.name]) * 1000)) / 1000;
                                r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率').db.name] = mll;
                                r[recordset.module.field_by_full_name(n + '.产品资料.毛 利 率1').db.name] = mll;
                                if (recordset.val('毛利底线') > 0) {
                                    if (mll < recordset.val('毛利底线')) {
                                        r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '否';
                                    } else {
                                        r[recordset.module.field_by_full_name(n + '.产品资料.毛利核准').db.name] = '是';
                                    }
                                }
                            }
                        }
                    }
                    if (hl > 0) {
                        let pkdj = Math.floor(((r[recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').db.name] / hl) * 1000) + 0.5) / 1000;
                        r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额总').db.name] = pkdj * htsl;
                        r[recordset.module.field_by_full_name(n + '.产品资料.赔款总额').db.name] = (r[recordset.module.field_by_full_name(n + '.产品资料.系统客户RMB单价').db.name] * htsl) - (r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB单价').db.name] * htsl);
                    };
                }
                t.push_modi_rid(r.rid);
            }
            if (dzsd == 1) _.ui.message.error('请注意此票中有货号已经由单证锁定，请联系相关单证人员解锁');
            t.sync_operate_data()
            t.modified = true;
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
    if (field.full_name == n + '.审批申请') {
        if (recordset.val('唯一字段') == '') {
            recordset.val('唯一字段', recordset.val('rid'));
        }
        if (recordset.val('审批申请') != '') {
            let sb = '';
            let t = recordset.tables['产品资料'];
            let d = t.view_data
            if (d.length == 0) {
                sb = '1';
            }
            for (let r of d) {
                if ((r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额总').db.name] == 0) && ((r[recordset.module.field_by_full_name(n + '.产品资料.客户RMB总价').db.name] !== 0) || (r[recordset.module.field_by_full_name(n + '.产品资料.总 金 额').db.name] !== 0))) {
                    sb = '1';
                    break;
                }
            }
            if ((recordset.val('货值合计总') == 0) && ((recordset.val('客户RMB合计') != 0) || (recordset.val('货值合计') != 0))) {
                sb = '1';
            }
            if (sb != '1') {
                if (recordset.val('审批申请') == _.user.username) {
                    _.ui.message.error('不好意思,自已不能审批自已,请重新选择,谢谢!');
                    recordset.val('审批申请', '');
                    recordset.val('审批申请1', '');
                }

            } else {
                _.ui.message.error('不好意思,货值合计总为0不能提交,请与IT联系谢谢!');
                recordset.val('审批申请', '');
                recordset.val('审批申请1', '');
            }
        }
    }
    if (field.full_name == n + '.审批结果') {
        if ((recordset.val('审批结果') == '取消订单' && recordset.val('审批申请') == _.user.username) || (recordset.val('审批结果') == '待审批' && recordset.val('业务人员') == _.user.username)) {
            _.http.post("/api/saier/salesorder/spjg/change", {
                rid: recordset.val('rid'),
                hthm: recordset.val('合同号码'),
                htwy: recordset.val('合同唯一')
            }).then(res => {
                let khht = recordset.val('客户合同');
                recordset.val('客户合同', '取消' + khht);
                recordset.val('接单日期', '');
                recordset.val('结单年月', '');
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                recordset.val('审批结果', '不通过');
            })
        }
    }
    if (field.full_name == n + '.产品资料.外箱装箱量' || field.full_name == n + '.产品资料.箱    数') {
        let xs = recordset.value('产品资料.箱    数',row);
        let wxzl = recordset.value('产品资料.外箱装箱量',row);
        let pxbj = recordset.value('产品资料.拼箱标记', row);
        if (xs > 0 && wxzl > 0 && pxbj != '是' && recordset.val('强制更新') != '杂货' ){
            // && (recordset.value('产品资料.合同数量', row) == 0 || recordset.value('产品资料.合同数量', row) != wxzl * xs)) {
            recordset.val('产品资料.合同数量', wxzl * xs, row);
        }
    }
    if (field.full_name == n + '.产品资料.包装长度' || field.full_name == n + '.产品资料.包装高度' || field.full_name == n + '.产品资料.包装宽度') {
        let bzcd = recordset.value('产品资料.包装长度', row);
        let bzkd = recordset.value('产品资料.包装宽度', row);
        let bzgd = recordset.value('产品资料.包装高度', row);
        let bztj = bzcd * bzkd * bzgd / 1000000;
        if (bztj != 0) {
            recordset.val('产品资料.外箱体积', round(bztj, 3), row);
            if (recordset.value('产品资料.外箱体积', row) < 0.001) {
                recordset.val('产品资料.外箱体积', 0.001, row);
            }
        }
    }
    if (field.full_name == n + '.产品资料.客人条码') {
        let krtm = recordset.value('产品资料.客人条码', row);
        if (krtm != "" && recordset.val('强制更新') != '杂货') {
            recordset.val('产品资料.客人code7', krtm.substring(0, 7), row);
        }
    }
    if (field.full_name == n + '.产品资料.代开点数') {
        let dkds = recordset.value('产品资料.代开点数', row);
        if (dkds > 1) {
            recordset.val('产品资料.代开点数', dkds / 100, row);
        }
    }
    if (field.full_name == n + '.产品资料.专业货号' || field.full_name == n + '.产品资料.客户货号') {
        let khhh = recordset.value('产品资料.客户货号', row);
        let zyhh = recordset.value('产品资料.专业货号', row);
        if (recordset.val('强制更新') != '杂货') {
            if (khhh != "") {
                recordset.val('产品资料.产品货号1', khhh.trim(), row);
            } else {
                recordset.val('产品资料.产品货号1', zyhh.trim(), row);
            }
        }
    }
    if (field.full_name == n + '.产品资料.外箱体积') {
        if (recordset.val('强制更新') != '杂货') {
            let wxtj = recordset.value('产品资料.外箱体积', row);
            let sb = '';
            if (wxtj > 0.001 && sb == '') {
                let bzcd = recordset.value('产品资料.包装长度', row);
                let bzkd = recordset.value('产品资料.包装宽度', row);
                let bzgd = recordset.value('产品资料.包装高度', row);
                let bztj = bzcd * bzkd * bzgd / 1000000;
                if (bztj > 0) {
                    let bztj1 = bztj * 0.2;
                    if (wxtj > bztj) {
                        if (wxtj - bztj > bztj1) {
                            sb = '1';
                            recordset.val('产品资料.外箱体积', round(bztj,3), row);
                        }
                    } else {
                        if (bztj - wxtj > bztj1) {
                            sb = '1';
                            recordset.val('产品资料.外箱体积', round(bztj,3), row);
                        }
                    }
                }
            }
        }
    }
    if (field.full_name == n + '.产品资料.是否含税') {
        if (recordset.value('产品资料.是否含税', row) != '是') {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
        }
    }
    if (field.full_name == n + '.产品资料.增值税率') {
        if (recordset.value('产品资料.是否含税', row) != '是'  && recordset.value('产品资料.增值税率', row) != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，增值税率必须为0');
        }
    }
    if (field.full_name == n + '.产品资料.退 税 率') {
        if (recordset.value('产品资料.是否含税', row) != '是' && recordset.value('产品资料.退 税 率', row) != 0) {
            recordset.val('产品资料.中文报关品名', '无', row);
            recordset.val('产品资料.增值税率', 0, row);
            recordset.val('产品资料.退 税 率', 0, row);
            // _.ui.message.error('是否含税等于否时，退税率必须为0');
        }
    }
    if (field.full_name == n + '.产品资料.含佣单价' || field.full_name == n + '.产品资料.含佣RMB单价') {
        let hydj = recordset.value('产品资料.含佣单价', row);
        let hydj_rmb = recordset.value('产品资料.含佣RMB单价', row);
        recordset.val('产品资料.赔款单价', hydj, row);
        recordset.val('产品资料.赔款RMB', hydj_rmb, row);
    }
    if (field.full_name == n + '.产品资料.外销单价' || field.full_name == n + '.产品资料.客户RMB单价') {
        if (recordset.value('产品资料.单证锁定', row) != '') {
            if (recordset.value('RMB客户') == '是') {
                if (recordset.value('产品资料.外销单价', row) != recordset.value('产品资料.外销单价1', row)) {
                    _.ui.message.error('不好意思,这个货号已经由单证:' + recordset.value('产品资料.单证锁定', row) + '锁定，请联系相关单证人员解锁');
                    recordset.val('产品资料.外销单价', recordset.value('产品资料.外销单价1', row), row);
                }
            } else {
                if (recordset.value('产品资料.客户RMB单价', row) != recordset.value('产品资料.客户RMB单价1', row)) {
                    _.ui.message.error('不好意思,这个货号已经由单证:' + recordset.value('产品资料.单证锁定', row) + '锁定，请联系相关单证人员解锁');
                    recordset.val('产品资料.客户RMB单价', recordset.value('产品资料.客户RMB单价1', row), row);
                }
            }
        }
    }
    if (field.full_name == n + '.产品资料.外销单价' || field.full_name == n + '.产品资料.客户RMB单价' || field.full_name == '外销合同.产品资料.合同数量' || field.full_name == n + '.产品资料.刷新单价' ||
        field.full_name == n + '.产品资料.佣金单价' || field.full_name == n + '.产品资料.暗佣单价') {
        if (recordset.value('自动计算含佣价') == '否' && recordset.value('佣金类型') == '明佣+暗佣' && recordset.value('产品资料.单证锁定', row) == '') {
            if (recordset.value('RMB客户') != '是') {
                recordset.val('产品资料.含佣单价', Math.floor((recordset.value('产品资料.外销单价', row) + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row) + 0.0000001) * 100) / 100, row);
                recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
            } else {
                recordset.val('产品资料.含佣RMB单价', Math.floor((recordset.value('产品资料.客户RMB单价', row) + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row) + 0.0000001) * 100) / 100, row);
                recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
            };
            if (recordset.value('RMB客户') != '是') {
                recordset.val('产品资料.客户RMB单价', 0, row);
                recordset.val('产品资料.含佣RMB单价', 0, row);
            } else {
                recordset.val('产品资料.外销单价', 0, row);
                recordset.val('产品资料.含佣单价', 0, row);
            };
        }
    }
    if (field.full_name == n + '.产品资料.含佣RMB单价' || field.full_name == n + '.产品资料.含佣单价' || field.full_name == n + '.产品资料.佣金比率' || field.full_name == n + '.产品资料.暗佣比率' || (field.full_name == '外销合同.产品资料.合同数量')) {
        if (recordset.value('自动计算含佣价') == '按含佣价计算' && recordset.value('佣金类型') != '' && recordset.value('佣金类型') != '无' && recordset.value('产品资料.单证锁定') == '') {
            if (recordset.value('RMB客户') != '是') {
                if (recordset.value('佣金类型').indexOf('明佣') != -1) {
                    if (recordset.value('产品资料.佣金比率', row) > 0) {
                        recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.含佣单价', row) * (1 - recordset.value('产品资料.佣金比率', row))) * 100) / 100, row);
                    } else {
                        if (recordset.value('佣金类型') == '明佣') {
                            recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row) + 0.00000001) * 100) / 100, row);
                        };
                    };
                    recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                };
                if (recordset.value('佣金类型').indexOf('暗佣') != -1) {
                    if (recordset.value('产品资料.暗佣比率', row) > 0) {
                        recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.含佣单价', row) * (1 - recordset.value('产品资料.暗佣比率', row))) * 100) / 100, row);
                    } else {
                        if (recordset.value('佣金类型') == '暗佣') {
                            recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row) + 0.00000001) * 100) / 100, row);
                        };
                    };
                    recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                };
                recordset.val('产品资料.外销单价', recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.佣金单价', row) - recordset.value('产品资料.暗佣单价', row), row);
            } else {
                if (recordset.value('佣金类型').indexOf('明佣') != -1) {
                    if (recordset.value('产品资料.佣金比率', row) > 0) {
                        recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.含佣RMB单价', row) * (1 - recordset.value('产品资料.佣金比率', row))) * 100) / 100, row);
                    } else {
                        if (recordset.value('佣金类型') == '明佣') {
                            recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row) + 0.00000001) * 100) / 100, row);
                        };
                    };
                    recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                };
                if (recordset.value('佣金类型').indexOf('暗佣') != -1) {
                    if (recordset.value('产品资料.暗佣比率', row) > 0) {
                        recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.含佣RMB单价', row) * (1 - recordset.value('产品资料.暗佣比率', row))) * 100) / 100, row);
                    } else {
                        if (recordset.value('佣金类型') == '暗佣') {
                            recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row) + 0.00000001) * 100) / 100, row);
                        };
                    };
                    recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                };
                recordset.val('产品资料.客户RMB单价', recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.佣金单价', row) - recordset.value('产品资料.暗佣单价', row), row);
            };
            if (recordset.value('RMB客户') != '是') {
                recordset.val('产品资料.客户RMB单价', 0, row);
                recordset.val('产品资料.含佣RMB单价', 0, row);
            } else {
                recordset.val('产品资料.外销单价', 0, row);
                recordset.val('产品资料.含佣单价', 0, row);
            };
        }
    }
    if (field.full_name == n + '.产品资料.外销单价' || field.full_name == n + '.产品资料.含佣单价' || field.full_name == n + '.产品资料.客户RMB单价' || field.full_name == n + '.产品资料.含佣RMB单价' ||
        (field.full_name == '外销合同.产品资料.合同数量') || field.full_name == n + '.产品资料.刷新单价') {
        if (recordset.val('自动计算含佣价') == '否' && recordset.val('佣金类型') != '明佣+暗佣' && recordset.value('产品资料.单证锁定', row) == '') {
            if (recordset.val('佣金类型') == '无') {
                recordset.val('产品资料.佣金单价', 0, row);
                recordset.val('产品资料.暗佣单价', 0, row);
                recordset.val('产品资料.佣    金', 0, row);
                recordset.val('产品资料.暗佣佣金', 0, row);
                if (recordset.value('RMB客户') != '是') {
                    recordset.val('产品资料.含佣单价', recordset.value('产品资料.外销单价', row), row);
                } else {
                    recordset.val('产品资料.含佣RMB单价', recordset.value('产品资料.客户RMB单价', row), row);
                };
            } else {
                if (recordset.value('RMB客户') != '是') {
                    if (recordset.value('产品资料.含佣单价', row) != recordset.value('产品资料.外销单价', row)) {
                        if (recordset.value('佣金类型') == '明佣') {
                            recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row) + 0.0000001) * 100) / 100, row);
                            recordset.val('产品资料.暗佣单价', 0, row);
                            recordset.val('产品资料.暗佣佣金', 0, row);
                            recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                        } else {
                            if (recordset.value('佣金类型') == '暗佣') {
                                recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row) + 0.0000001) * 100) / 100, row);
                                recordset.val('产品资料.佣金单价', 0, row);
                                recordset.val('产品资料.佣    金', 0, row);
                                recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                            };
                        };
                    };
                } else {
                    if (recordset.value('产品资料.含佣RMB单价', row) != recordset.value('产品资料.客户RMB单价', row)) {
                        if (recordset.value('佣金类型') == '明佣') {
                            recordset.val('产品资料.佣金单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row) + 0.0000001) * 100) / 100, row);
                            recordset.val('产品资料.暗佣单价', 0, row);
                            recordset.val('产品资料.暗佣佣金', 0, row);
                            recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                        } else {
                            if (recordset.value('佣金类型') == '暗佣') {
                                recordset.val('产品资料.暗佣单价', Math.floor((recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row) + 0.0000001) * 100) / 100, row);
                                recordset.val('产品资料.佣金单价', 0, row);
                                recordset.val('产品资料.佣    金', 0, row);
                                recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                            };
                        };
                    };
                };
            };
            if (recordset.value('RMB客户') != '是') {
                recordset.val('产品资料.含佣RMB单价', 0, row);
            } else {
                recordset.val('产品资料.含佣单价', 0, row);
            };
        }
    }
    if (field.full_name == n + '.产品资料.外销单价' || field.full_name == n + '.产品资料.客户RMB单价' || (field.full_name == '外销合同.产品资料.合同数量') || field.full_name == n + '.产品资料.刷新单价' ||
        field.full_name == n + '.产品资料.暗佣比率' || field.full_name == n + '.产品资料.佣金比率') {
        if (recordset.value('自动计算含佣价') == '是' && recordset.value('产品资料.单证锁定', row) == '') {
            _.http.post("/api/saier/salesorder/khmc/get", {
                khmc: recordset.val('客户名称')
            }).then(res => {
                let sb = res.data;
                let gcpf = 0;
                if (recordset.val('佣金类型') == '无') {
                    recordset.val('产品资料.佣金单价', 0, row);
                    recordset.val('产品资料.暗佣单价', 0, row);
                    recordset.val('产品资料.佣    金', 0, row);
                    recordset.val('产品资料.暗佣佣金', 0, row);
                    if (recordset.val('RMB客户') !== '是') {
                        recordset.val('产品资料.含佣单价', recordset.value('产品资料.外销单价', row), row);
                        recordset.val('产品资料.含佣RMB单价', 0, row);
                    } else {
                        recordset.val('产品资料.含佣RMB单价', recordset.value('产品资料.客户RMB单价', row), row);
                        recordset.val('产品资料.含佣单价', 0, row);
                    }
                } else {
                    if (recordset.val('RMB客户') !== '是') {
                        gcpf = recordset.value('产品资料.外销单价', row);
                        if (recordset.value('产品资料.含佣单价', row) === 0) {
                            recordset.val('产品资料.含佣单价', recordset.value('产品资料.外销单价', row), row);
                        }
                    } else {
                        gcpf = recordset.value('产品资料.客户RMB单价', row);
                        if (recordset.value('产品资料.含佣RMB单价', row) === 0) {
                            recordset.val('产品资料.含佣RMB单价', recordset.value('产品资料.客户RMB单价', row), row);
                        }
                    }
                    let mydj = 0;
                    let aydj = 0;
                    let yjbl = 0;
                    let yjbl1 = 0;
                    let jec1 = 0;
                    let yjds = recordset.value('产品资料.佣金比率', row);
                    let ayds = recordset.value('产品资料.暗佣比率', row);
                    if (gcpf > 0) {
                        // if (yjds > 1) {
                        //     yjbl = recordset.val('产品资料.佣金比率');
                        //     recordset.val('产品资料.佣金比率', _calc_commission_ratio(yjbl));
                        // }
                        if (sb === '1') {
                            mydj = Math.floor(gcpf * recordset.value('产品资料.佣金比率', row) * 100 + 0.000001) / 100;
                        } else {
                            mydj = Math.floor(((gcpf / (1 - recordset.value('产品资料.佣金比率', row))) - gcpf) * 100 + 0.000001) / 100;
                        }
                        if (recordset.value('产品资料.佣金比率', row) > 0) {
                            recordset.val('产品资料.佣金单价', mydj, row);
                        } else {
                            recordset.val('产品资料.佣金单价', 0, row);
                        }
                    }
                    if (gcpf > 0) {
                        // if (ayds > 1) {
                        //     yjbl1 = recordset.val('产品资料.暗佣比率');
                        //     recordset.val('产品资料.暗佣比率', _calc_commission_ratio(yjbl1));
                        // }
                        if (sb === '1') {
                            aydj = Math.floor(gcpf * recordset.value('产品资料.暗佣比率', row) * 100 + 0.000001) / 100;
                        } else {
                            aydj = Math.floor(((gcpf / (1 - recordset.value('产品资料.暗佣比率', row))) - gcpf) * 100 + 0.000001) / 100;
                        }
                        if (recordset.value('产品资料.暗佣比率', row) > 0) {
                            recordset.val('产品资料.暗佣单价', aydj, row);
                        } else {
                            recordset.val('产品资料.暗佣单价', 0, row);
                        }
                    }
                    if (recordset.val('佣金类型').indexOf('明佣') == -1 && recordset.val('佣金类型').indexOf('暗佣') == -1) {
                        recordset.val('产品资料.佣金单价', 0, row);
                        recordset.val('产品资料.暗佣单价', 0, row);
                    }
                    if (gcpf > 0 && recordset.val('佣金类型') !== '明佣+暗佣') {
                        if (recordset.val('RMB客户') !== '是') {
                            recordset.val('产品资料.含佣单价', gcpf + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row), row);
                        } else {
                            recordset.val('产品资料.含佣RMB单价', gcpf + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row), row);
                        }
                    }
                    if (gcpf > 0 && recordset.val('佣金类型') == '明佣+暗佣') {
                        if (recordset.val('RMB客户') !== '是') {
                            if (sb === '1') {
                                recordset.val('产品资料.含佣单价', gcpf + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row), row);
                            } else {
                                jec1 = (gcpf + Math.floor(((gcpf / (1 - recordset.value('产品资料.暗佣比率', row) - recordset.value('产品资料.佣金比率', row))) - gcpf) * 100 + 0.000001) / 100) - recordset.value('产品资料.外销单价', row);
                                recordset.val('产品资料.佣金单价', Math.floor((jec1 / (recordset.value('产品资料.暗佣比率', row) * 100 + recordset.value('产品资料.佣金比率', row) * 100)) * (recordset.value('产品资料.佣金比率', row) * 100) * 100 + 0.000001) / 100);
                                recordset.val('产品资料.暗佣单价', Math.floor((jec1 - recordset.value('产品资料.佣金单价', row)) * 100 + 0.000001) / 100);
                                recordset.val('产品资料.含佣单价', gcpf + Math.floor(((gcpf / (1 - recordset.value('产品资料.暗佣比率', row) - recordset.value('产品资料.佣金比率', row))) - gcpf) * 100 + 0.000001) / 100, row);
                            }
                        } else {
                            if (sb === '1') {
                                recordset.val('产品资料.含佣RMB单价', gcpf + recordset.value('产品资料.佣金单价', row) + recordset.value('产品资料.暗佣单价', row), row);
                            } else {
                                jec1 = (gcpf + Math.floor(((gcpf / (1 - recordset.value('产品资料.暗佣比率', row) - recordset.value('产品资料.佣金比率', row))) - gcpf) * 100 + 0.000001) / 100) - recordset.value('产品资料.客户RMB单价', row);
                                recordset.val('产品资料.佣金单价', Math.floor((jec1 / (recordset.value('产品资料.暗佣比率', row) * 100 + recordset.value('产品资料.佣金比率', row) * 100)) * (recordset.value('产品资料.佣金比率', row) * 100) * 100 + 0.000001) / 100, row);
                                recordset.val('产品资料.暗佣单价', Math.floor((jec1 - recordset.value('产品资料.佣金单价', row)) * 100 + 0.000001) / 100, row);
                                recordset.val('产品资料.含佣RMB单价', gcpf + Math.floor(((gcpf / (1 - recordset.value('产品资料.暗佣比率', row) - recordset.value('产品资料.佣金比率', row))) - gcpf) * 100 + 0.000001) / 100, row);
                            }
                        }
                    }
                    let zje = 0;
                    if (recordset.val('RMB客户') !== '是') {
                        zje = recordset.value('产品资料.含佣单价', row) * recordset.value('产品资料.合同数量', row);
                    } else {
                        zje = recordset.value('产品资料.含佣RMB单价', row) * recordset.value('产品资料.合同数量', row);
                    }
                    if (recordset.value('产品资料.佣金比率', row) >= 0 && sb == '') {
                        recordset.val('产品资料.佣    金', zje * recordset.value('产品资料.佣金比率', row), row);
                    } else {
                        if (recordset.value('产品资料.佣金单价', row) >= 0 && sb == '1') {
                            recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                        }
                    }
                    if (recordset.value('产品资料.暗佣比率', row) >= 0 && sb == '') {
                        recordset.val('产品资料.暗佣佣金', zje * recordset.value('产品资料.暗佣比率', row), row);
                    } else {
                        if (recordset.value('产品资料.暗佣单价', row) >= 0 && sb == '1') {
                            recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                        }
                    }
                }
                if (recordset.val('RMB客户') !== '是') {
                    recordset.val('产品资料.含佣RMB单价', 0, row);
                } else {
                    recordset.val('产品资料.含佣单价', 0, row);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }
    }

    if (field.full_name == n + '.产品资料.客户货号') {
        let qzgx = recordset.val('强制更新');
        let krhh = recordset.value('产品资料.客户货号', row);
        let zyhh = recordset.value('产品资料.专业货号', row);
        if (qzgx != '杂货' && krhh != '' && zyhh == '') {
            _.http.post("/api/saier/salesorder/item/khhh/change", {
                khhh: krhh,
                krID: recordset.val('客户编号'),
            }).then(res => {
                let cpbh = res.data;
                if (cpbh != '') {
                    recordset.val('产品资料.专业货号', cpbh, row);
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }
    }

    if (field.full_name == n + '.产品资料.业务人员') {
        let spsq = recordset.val('审批申请');
        let ywry = recordset.value('产品资料.业务人员', row);
        if (ywry != '' && spsq == '' && (recordset.value('业务人员') == _.user.username || spsq == _.user.username)) {
            _.http.post("/api/saier/salesorder/item/ywry/change", {
                ywry: ywry,
                wyzd: recordset.value('产品资料.外销唯一字段', row),
            }).then(res => {
                let d = res.data;
                recordset.val('产品资料.报价path', d, row);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                recordset.val('产品资料.业务人员', '', row);
            })
        }
    }
    if (field.full_name == n + '.产品资料.总 金 额' || field.full_name == n + '.产品资料.退 税 率' || field.full_name == n + '.产品资料.客户RMB总价' || field.full_name == n + '.产品资料.采购总额' ||
        field.full_name == n + '.产品资料.暗佣佣金' || field.full_name == n + '.产品资料.佣    金') {
        let zje = 0;
        let zhmjhl = 1;
        if (recordset.val('转美元汇率') != 0){
            zhmjhl = recordset.val('转美元汇率');
        }
        if ((recordset.value('产品资料.暗佣单价', row) > 0 || recordset.value('产品资料.佣金单价', row) > 0) && recordset.val('自动计算含佣价') != '否' && recordset.val('佣金类型') != '明佣+暗佣' && recordset.val('自动计算含佣价') != '按含佣价计算') {
            if (recordset.val('RMB客户') == '是') {
                if (recordset.value('产品资料.暗佣单价', row) > 0) {
                    recordset.val('产品资料.暗佣单价', recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row), row);
                    recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                }
                if (recordset.value('产品资料.佣金单价', row) > 0) {
                    recordset.val('产品资料.佣金单价', recordset.value('产品资料.含佣RMB单价', row) - recordset.value('产品资料.客户RMB单价', row), row);
                    recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                }
            } else {
                if (recordset.val('产品资料.暗佣单价', row) > 0) {
                    recordset.val('产品资料.暗佣单价', recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row), row);
                    recordset.val('产品资料.暗佣佣金', recordset.value('产品资料.暗佣单价', row) * recordset.value('产品资料.合同数量', row), row);
                }
                if (recordset.val('产品资料.佣金单价', row) > 0) {
                    recordset.val('产品资料.佣金单价', recordset.value('产品资料.含佣单价', row) - recordset.value('产品资料.外销单价', row), row);
                    recordset.val('产品资料.佣    金', recordset.value('产品资料.佣金单价', row) * recordset.value('产品资料.合同数量', row), row);
                }
            }
        }
        if (recordset.val('RMB客户') != '是') {
            zje = recordset.value('产品资料.总 金 额', row);
            recordset.val('产品资料.赔款总额', (recordset.value('产品资料.系统外销单价', row) * recordset.value('产品资料.合同数量', row)) - (recordset.value('产品资料.外销单价', row) * recordset.value('产品资料.合同数量', row)), row);
            recordset.val('产品资料.总 金 额总', recordset.value('产品资料.总 金 额', row) * zhmjhl, row);
        } else {
            zje = recordset.value('产品资料.客户RMB总价', row);
            if (recordset.val('汇    率') > 0) {
                let pkdj = Math.floor(((recordset.value('产品资料.客户RMB总价', row) / recordset.value('汇    率')) * 1000) + 0.5) / 1000;
                recordset.val('产品资料.总 金 额总', pkdj, row);
                recordset.val('产品资料.赔款总额', (recordset.value('产品资料.系统客户RMB单价', row) * recordset.value('产品资料.合同数量', row)) - (recordset.value('产品资料.客户RMB单价', row) * recordset.value('产品资料.合同数量', row)), row);
            }
        }
        if ((recordset.val('强制更新') != '杂货') && ((recordset.value('产品资料.总 金 额', row) != 0) || (recordset.value('产品资料.客户RMB总价', row) != 0)) && (recordset.value('产品资料.采购总额', row) != 0)) {
            _.http.post("/api/saier/salesorder/item/hlb/set", {
                cgbz: recordset.value('产品资料.采购货币', row),
                khmc: recordset.value('客户名称')
            }).then(res => {
                let d = res.data;
                let hlcg = 1
                let nxkh = d.nxkh;
                let cgbz = recordset.value('产品资料.采购货币', row);
                if (cgbz == '') {
                    cgbz = 'RMB';
                }
                if (cgbz.indexOf('RMB') != -1) {
                    hlcg = d.cghl
                }
                if (recordset.val('RMB客户') != '是') {
                    recordset.val('产品资料.总 金 额总', recordset.value('产品资料.总 金 额', row), row);
                    if (recordset.value('产品资料.总 金 额', row) > 0 && recordset.value('产品资料.采购总额', row) > 0) {
                        let cgzj = recordset.value('产品资料.采购总额', row) * hlcg + recordset.value('产品资料.辅料总价', row);
                        let htsl = recordset.value('产品资料.合同数量', row);
                        let zzsl = recordset.value('产品资料.增值税率', row);
                        let tsl = recordset.value('产品资料.退 税 率', row);
                        if (tsl == 17) {
                            recordset.val('产品资料.退 税 率', 16, row);
                        }
                        if (zzsl == 17) {
                            recordset.val('产品资料.增值税率', 16, row);
                        }
                        tsl = recordset.value('产品资料.退 税 率', row);
                        zzsl = recordset.value('产品资料.增值税率', row);
                        let zzsl1 = 0;
                        if (zzsl > 3) {
                            zzsl1 = recordset.value('产品资料.增值税率', row);
                        }
                        let zzsl2 = 1 + (zzsl1 / 100);

                        if (recordset.value('产品资料.单证锁定', row).trim() == '') {
                            let fyl = recordset.value('费 用 率');
                            let hl = recordset.value('汇    率');
                            let mldx = recordset.value('毛利底线');
                            if (nxkh == '是') {
                                let mjdj = recordset.value('产品资料.总 金 额', row) * hl;
                                let sj1 = (mjdj - cgzj - recordset.value('产品资料.代开金额', row)) / zzsl2 * (zzsl1 / 100) + (recordset.value('产品资料.代开点数', row) * recordset.value('产品资料.代开金额', row));
                                let mll = ((mjdj - recordset.value('产品资料.佣    金', row) * hl) - cgzj - recordset.value('产品资料.代开金额', row) - recordset.value('产品资料.暗佣佣金', row) * hl) / (mjdj - recordset.value('产品资料.佣    金', row) * hl);
                                recordset.val('产品资料.毛  利', (Math.floor((recordset.value('产品资料.总 金 额', row)) * hl * mll * 1000)) / 1000, row);
                                recordset.val('产品资料.毛 利 率', mll, row);
                                recordset.val('产品资料.税   金', sj1, row);
                                if (mldx > 0 && mll < mldx) {
                                    // let wxdj = ((cgzj + recordset.val('产品资料.代开金额') + recordset.val('产品资料.暗佣佣金') * hl) / (1 - mldx)) / hl / recordset.val('产品资料.合同数量');
                                    recordset.val('产品资料.毛利核准', '否', row);
                                } else {
                                    recordset.val('产品资料.毛利核准', '是', row);
                                }
                            } else {
                                if (recordset.value('产品资料.总 金 额', row) == 0 || cgzj == 0) {
                                    return
                                }
                                if (recordset.value('产品资料.总 金 额', row) <= 1) {
                                    return
                                }
                                if (tsl == 0) {
                                    zzsl = 0;
                                }
                                if (tsl > 0 || (tsl > zzsl)) {
                                    if (tsl == 3) {
                                        zzsl = 3;
                                        recordset.val('产品资料.增值税率', zzsl, row);
                                    }
                                    if (tsl > 3) {
                                        zzsl = zzsl1;
                                        recordset.val('产品资料.增值税率', zzsl, row);
                                    }
                                }
                                if (htsl <= 0 || hl <= 0) {
                                    return
                                }
                                let hhcb = (cgzj + recordset.value('产品资料.纸卡费用', row) + recordset.value('产品资料.验 货 费', row) + recordset.value('产品资料.包装费用', row) + recordset.value('产品资料.暗佣佣金', row) * hl) / (recordset.value('产品资料.总 金 额', row) - recordset.value('产品资料.佣    金', row));
                                console.log('hhcb 111:' + hhcb);
                                let a = 0;
                                let mll = 0;
                                let hhcb1 = 0;
                                if (zzsl == zzsl1) {
                                    if (tsl == 5) {
                                        a = 1.11;
                                    } else {
                                        a = 1 + (zzsl - tsl) / 100;
                                    }
                                    if (fyl == 0 && (a * hl != 0)) {
                                        console.log('zzsl2 aaaa:' + zzsl2);
                                        console.log('hl bbbb:' + hl);
                                        console.log('a aaaa:' + a);
                                        console.log('hhcb hhcb:' + hhcb);
                                        mll = ((zzsl2 / a * hl) - hhcb) / (zzsl2 / a * hl);
                                        if ((hl - hl * mldx) != 0) {
                                            hhcb1 = zzsl2 / a * (hl - hl * mldx);
                                        }
                                    } else {
                                        if (a * hl != 0) {
                                            mll = ((zzsl2 / a * hl) - (zzsl2 / a * hl * fyl) - hhcb) / (zzsl2 / a * hl);
                                        }
                                        if (a * (hl - hl * fyl - hl * mldx) != 0) {
                                            hhcb1 = zzsl2 / a * (hl - hl * fyl - hl * mldx);
                                        }
                                    }
                                }
                                console.log('zzsl 111:' + zzsl);
                                console.log('tsl 111:' + tsl);
                                if ((zzsl == 3) && (tsl == 3)) {
                                    mll = ((1.03 * hl) - (1.03 * hl * fyl) - hhcb) / (1.03 * hl);
                                    hhcb1 = 1.03 * (hl - hl * fyl - hl * mldx);
                                }
                                if ((zzsl == 1) && (tsl == 1)) {
                                    mll = ((1.01 * hl) - (1.01 * hl * fyl) - hhcb) / (1.01 * hl);
                                    hhcb1 = 1.01 * (hl - hl * fyl - hl * mldx);
                                }
                                console.log('zzsl 000:' + zzsl);
                                console.log('tsl 000:' + tsl);
                                if ((zzsl == 0) && (tsl == 0)) {
                                    mll = (hl - hl * fyl - hhcb) / hl;
                                    hhcb1 = hl - hl * fyl - hl * mldx;
                                }
                                console.log('zzsl 222:' + zzsl);
                                console.log('tsl 222:' + tsl);
                                recordset.val('产品资料.毛  利', (Math.floor((recordset.value('产品资料.总 金 额', row) - recordset.value('产品资料.佣    金', row)) * hl * mll * 1000)) / 1000, row);
                                recordset.val('产品资料.毛 利 率', mll, row);
                                recordset.val('产品资料.毛 利 率m', mll, row);
                                recordset.val('产品资料.汇    率', hl, row);
                                recordset.val('产品资料.换汇成本', hhcb, row);
                                if (recordset.value('毛利底线') > 0) {
                                    if (mll < recordset.value('毛利底线')) {
                                        // if (hhcb1 != 0) {
                                        //     let wxdj = (cgzj + recordset.value('产品资料.纸卡费用', row) + recordset.value('产品资料.验 货 费', row) + recordset.value('产品资料.包装费用', row) + recordset.value('产品资料.暗佣佣金', row) * hl) / (hhcb1 * htsl);
                                        // }
                                        recordset.val('产品资料.毛利核准', '否', row);
                                    } else {
                                        recordset.val('产品资料.毛利核准', '是', row);
                                    }
                                }
                            }
                        } else {
                            if ((recordset.value('产品资料.含佣单价', row) != recordset.value('产品资料.赔款单价1', row)) || (recordset.value('产品资料.外销单价', row) != recordset.value('产品资料.外销单价1', row)) || (recordset.value('产品资料.采购单价', row) != recordset.value('产品资料.采购单价1', row))) {
                                _.ui.message.error('不好意思,这个货号已经由单证:' + recordset.value('产品资料.单证锁定', row) + '锁定，请联系相关单证人员解锁');
                                recordset.val('产品资料.外销单价', recordset.value('产品资料.外销单价1', row), row);
                                recordset.val('产品资料.含佣单价', recordset.value('产品资料.赔款单价1', row), row);
                                recordset.val('产品资料.采购单价', recordset.value('产品资料.采购单价1', row), row);
                                // self.recordset.undosave;
                            }
                        }
                    } else {
                        if (recordset.value('产品资料.总 金 额', row) > 0) {
                            recordset.val('产品资料.毛  利', (Math.floor((recordset.value('产品资料.总 金 额', row) - recordset.value('产品资料.佣    金', row)) * hl * 1000)) / 1000, row);
                            recordset.val('产品资料.毛利核准', '是', row);
                            recordset.val('产品资料.汇    率', hl, row);
                        }
                    }
                } else {
                    if (recordset.value('产品资料.客户RMB总价', row) > 0 && recordset.value('产品资料.采购总额', row) > 0) {
                        if (recordset.value('产品资料.单证锁定', row) == '') {
                            // let hl = 1;
                            let fyl = recordset.value('费 用 率');
                            let mldx = recordset.value('毛利底线');
                            // let htsl = recordset.value('产品资料.合同数量', row);
                            let zzsl = recordset.value('产品资料.增值税率', row);
                            let tsl = recordset.value('产品资料.退 税 率', row);
                            let cgzj = recordset.value('产品资料.采购总额', row) * hlcg + recordset.value('产品资料.辅料总价', row);
                            if (tsl == 17) {
                                recordset.val('产品资料.退 税 率', 16, row);
                            }
                            tsl = recordset.value('产品资料.退 税 率', row);
                            if (zzsl == 17) {
                                recordset.val('产品资料.增值税率', 16, row);
                            }
                            zzsl = recordset.value('产品资料.增值税率', row);
                            let zzsl1 = 0;
                            if (zzsl > 3) {
                                zzsl1 = recordset.value('产品资料.增值税率', row);
                            }
                            let zzsl2 = 1 + (zzsl1 / 100)
                            if (nxkh == '是') {
                                let mjdj = recordset.value('产品资料.客户RMB总价', row);
                                let sj1 = (mjdj - cgzj - recordset.value('产品资料.代开金额', row)) / zzsl2 * (zzsl1 / 100) + (recordset.value('产品资料.代开点数', row) * recordset.value('产品资料.代开金额', row));
                                let mll = (mjdj - cgzj - recordset.value('产品资料.代开金额', row) - recordset.value('产品资料.佣    金', row) - recordset.value('产品资料.暗佣佣金', row)) / (mjdj - recordset.value('产品资料.佣    金', row));
                                recordset.val('产品资料.毛 利 率', mll, row);
                                recordset.val('产品资料.税   金', sj1, row);
                                recordset.val('产品资料.毛  利', (Math.floor(recordset.value('产品资料.客户RMB总价', row) * mll * 1000)) / 1000, row);
                                if (mldx > 0 && mll < mldx) {
                                    // let wxdj1 = (cgzj + recordset.val('产品资料.代开金额') + recordset.val('产品资料.暗佣佣金')) / (1 - mldx) / recordset.val('产品资料.合同数量');
                                    recordset.val('产品资料.毛利核准', '否', row);
                                } else {
                                    recordset.val('产品资料.毛利核准', '是', row);
                                }
                            } else {
                                if (recordset.value('产品资料.客户RMB总价', row) > 0 && cgzj > 0) {
                                    if (tsl == 17) {
                                        recordset.val('产品资料.退 税 率', 16, row);
                                    }
                                    if (zzsl == 17) {
                                        recordset.val('产品资料.增值税率', 16, row);
                                    }
                                    zzsl = recordset.value('产品资料.增值税率', row);
                                    tsl = recordset.value('产品资料.退 税 率', row);
                                    if (recordset.value('产品资料.客户RMB总价', row) > 0.0001) {
                                        if (tsl == 0) {
                                            zzsl = 0;
                                        }
                                        if (tsl > 0 || tsl > zzsl) {
                                            if (tsl == 3) {
                                                zzsl = 3;
                                                recordset.val('产品资料.增值税率', zzsl, row);
                                            }
                                            if (tsl > 3) {
                                                zzsl = zzsl1;
                                                recordset.val('产品资料.增值税率', zzsl, row);
                                            }
                                        }
                                        zzsl2 = 1 + (zzsl / 100);
                                        let tsl2 = 0;
                                        let tsl3 = 0;
                                        let mll = 0;
                                        let wxdj2 = recordset.value('产品资料.客户RMB总价', row) - recordset.value('产品资料.佣    金', row);
                                        if (tsl >= 1) {
                                            tsl2 = tsl / 100;
                                            tsl3 = (recordset.value('产品资料.采购总额', row) + recordset.value('产品资料.辅料总价', row)) / zzsl2 * tsl2;
                                        }
                                        if (tsl = 0) {
                                            tsl3 = 0;
                                        }
                                        console.log('客户RMB总价:', wxdj2)
                                        console.log('费用率:', fyl)
                                        console.log('采购总额:', cgzj)
                                        console.log('暗佣佣金:', recordset.value('产品资料.暗佣佣金', row))
                                        console.log('tsl3:', tsl3)
                                        console.log('tsl2:', tsl2)
                                        console.log('zzsl2:', zzsl2)
                                        mll = (wxdj2 - wxdj2 * fyl - cgzj + tsl3 - recordset.value('产品资料.暗佣佣金', row)) / wxdj2;
                                        console.log(mll)
                                        recordset.val('产品资料.毛  利', (Math.floor((wxdj2 - wxdj2 * fyl - cgzj + tsl3 - recordset.value('产品资料.暗佣佣金', row)) * 1000)) / 1000, row);
                                        recordset.val('产品资料.毛 利 率', mll, row);
                                        recordset.val('产品资料.毛 利 率1', mll, row);
                                        if (recordset.value('毛利底线', row) > 0) {
                                            if (mll < recordset.value('毛利底线', row)) {
                                                recordset.val('产品资料.毛利核准', '否', row);
                                            } else {
                                                recordset.val('产品资料.毛利核准', '是', row);
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            if ((recordset.value('产品资料.客户RMB单价', row) != recordset.value('产品资料.客户RMB单价1', row)) || (recordset.value('产品资料.含佣RMB单价', row) != recordset.value('产品资料.赔款RMB1', row))) {
                                _.ui.message.error('不好意思,这个货号已经由单证:' + recordset.value('产品资料.单证锁定', row) + '锁定，请联系相关单证人员解锁');
                                recordset.val('产品资料.客户RMB单价', recordset.val('产品资料.客户RMB单价1', row), row);
                                recordset.val('产品资料.含佣RMB单价', recordset.val('产品资料.赔款RMB1', row), row);
                                // self.recordset.undosave;
                            }
                        }
                    } else {
                        if (recordset.value('产品资料.客户RMB总价', row) > 0) {
                            recordset.val('产品资料.毛  利', (Math.floor((recordset.value('产品资料.客户RMB总价', row) - recordset.value('产品资料.佣    金', row)) * 1000)) / 1000, row);
                            recordset.val('产品资料.毛利核准', '是', row);
                        }
                    }
                }
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        }
    }
    if (field.full_name == n + '.产品资料.专业货号') {
        if (recordset.val('强制更新') != '杂货') {
            recordset.val('产品资料.专业货号1', recordset.value('产品资料.专业货号', row), row);
            recordset.val('产品资料.货号备注', recordset.value('产品资料.专业货号', row), row);
            let zyhh = recordset.value('产品资料.专业货号', row).trim();
            if (recordset.value('产品资料.专业货号', row) != '') {
                // if (recordset.val('产品资料.专业货号') != zyhh) {
                //     // recordset.val('产品资料.测试货号', zyhh);
                //     if (old_value == zyhh || old_value == recordset.val('产品资料.专业货号')) {
                //         return
                //     }
                // }
                if (recordset.val('佣金点数') > 0) {
                    recordset.val('产品资料.佣金比率', recordset.val('佣金点数') / 100, row);
                }
                if (recordset.val('暗佣点数') > 0) {
                    recordset.val('产品资料.暗佣比率', recordset.val('暗佣点数') / 100, row);
                }
                krID = recordset.val('客户编号');
                _.http.post("/api/saier/salesorder/item/zyhh/change", {
                    zyhh: zyhh,
                    krID: krID,
                }).then(res => {
                    let d = res.data;
                    let cp = d.cp;
                    let cs = d.cs;
                    let kr = d.kr;
                    let flag = d.flag;
                    if (cp) {
                        if (flag == 2) {
                            // if (cp.csdhh != '') {
                            //     recordset.val('产品资料.测试货号', cp.csdhh);
                            // }
                            recordset.val('产品资料.辅料价格', cp.fljg, row);
                            // recordset.val('产品资料.超长客人货号', cp.czkrhh);
                        }
                        // 2026-01-30 测试注销专业货号
                        // recordset.val('产品资料.专业货号', cp.cpbh);
                        recordset.val('产品资料.退 税 率', cp.tsl, row);
                        recordset.val('产品资料.报价报价唯一字段', cp.bjbjwyzd, row);
                        recordset.val('产品资料.客户货号', '', row);
                        recordset.val('产品资料.客人条码', '', row);
                        let wxdj = 0;
                        let khrmbdj = 0;
                        if (kr) {
                            if ((kr.krhh != '无') && (kr.krhh != '')) {
                                recordset.val('产品资料.客户货号', kr.krhh, row);
                            }
                            if (kr.krtm != '无' && kr.krtm != '') {
                                recordset.val('产品资料.客人条码', kr.krtm, row);
                            }
                            if (kr.Twxdj > 0) {
                                wxdj = kr.Twxdj;
                            } else {
                                wxdj = kr.mjfob;
                            }
                            if (kr.pkRMB > 0) {
                                khrmbdj = kr.pkRMB;
                            } else {
                                khrmbdj = kr.rmbdj;
                            }
                            recordset.val('产品资料.单据品名', kr.djpm, row);
                            recordset.val('产品资料.单据品名英', kr.djpmy, row);
                            recordset.val('产品资料.单据品名外', kr.djpmw, row);
                            recordset.val('产品资料.客人CODE', kr.krcode, row);
                            recordset.val('产品资料.客人税率', kr.krsl, row);
                            recordset.val('产品资料.外语品名', kr.wypp, row);
                            recordset.val('产品资料.规格外语', kr.ggwy, row);
                        }
                        if ((recordset.value('产品资料.客户货号', row) == '') && (cp.krhh != '无')) {
                            recordset.val('产品资料.客户货号', cp.krhh, row);
                        }
                        if (recordset.value('产品资料.客人条码', row) == '') {
                            recordset.val('产品资料.客人条码', cp.krtm, row);
                        }
                        // recordset.val('产品资料.可思达货号', cp.ksdhh);
                        recordset.val('产品资料.克    重', cp.chpkzh, row);
                        recordset.val('产品资料.采购货币', cp.cghbdm, row);
                        recordset.val('产品资料.开票点数', cp.ljrk, row);
                        recordset.val('产品资料.规格英语', cp.cpgg, row);
                        recordset.val('产品资料.产品规格', cp.cpggz, row);
                        recordset.val('产品资料.颜    色', cp.yse, row);
                        recordset.val('产品资料.颜色英文', cp.ysez, row);
                        recordset.val('产品资料.中文品名', cp.zwpm, row);
                        recordset.val('产品资料.英文品名', cp.ywpm, row);
                        recordset.val('产品资料.计量单位', cp.jldw, row);
                        recordset.val('产品资料.中文计量单位', cp.zwdw, row);
                        recordset.val('产品资料.换汇成本', cp.hhcb, row);
                        recordset.val('产品资料.增值税率', cp.zzsl, row);
                        recordset.val('产品资料.包装单位', cp.bzdw, row);
                        recordset.val('产品资料.内盒/外箱', cp.nhwx, row);
                        recordset.val('产品资料.包装长度', cp.bzcd, row);
                        recordset.val('产品资料.包装宽度', cp.bzkd, row);
                        recordset.val('产品资料.包装高度', cp.bzgd, row);
                        recordset.val('产品资料.外箱体积', cp.bztj, row);
                        recordset.val('产品资料.中文包装', cp.zhwbzh, row);
                        recordset.val('产品资料.英文包装', cp.bzhfsh, row);
                        recordset.val('产品资料.毛    重', cp.mxmz, row);
                        recordset.val('产品资料.净    重', cp.mxjz, row);
                        recordset.val('产品资料.产品尺寸', cp.chpchc, row);
                        recordset.val('产品资料.材质英语', cp.caizi, row);
                        recordset.val('产品资料.厚    度', cp.houd, row);
                        recordset.val('产品资料.壁    厚', cp.bh123, row);
                        recordset.val('产品资料.中文说明', cp.cpsm, row);
                        recordset.val('产品资料.英文说明', cp.ywsm, row);
                        recordset.val('产品资料.底    厚', cp.dh123, row);
                        recordset.val('产品资料.内部材质', cp.coating, row);
                        recordset.val('产品资料.外部材质', cp.wbcz, row);
                        recordset.val('产品资料.其他材质', cp.qtcz, row);
                        // recordset.val('产品资料.测式种类', cp.cszl);
                        recordset.val('产品资料.中文尺寸', cp.zwcc, row);
                        recordset.val('产品资料.英文尺寸', cp.ywcc, row);
                        recordset.val('产品资料.专业厂家', cp.sccj, row);
                        recordset.val('产品资料.款式英', cp.ksy, row);
                        recordset.val('产品资料.款式外', cp.ksw, row);
                        recordset.val('产品资料.款  式', cp.ks, row);
                        recordset.val('产品资料.产品大类', cp.cpfl, row);
                        recordset.val('产品资料.一级分类', cp.yjfl, row);
                        recordset.val('产品资料.二级分类', cp.ejfl, row);
                        recordset.val('产品资料.三级分类', cp.sjfl, row);
                        recordset.val('产品资料.分类名称', cp.flmc, row);
                        if (recordset.value('产品资料.外语品名', row) == '') {
                            recordset.val('产品资料.外语品名', cp.wypp, row);
                        }
                        if (recordset.value('产品资料.规格外语', row) == '') {
                            recordset.val('产品资料.规格外语', cp.ggwy, row);
                        }
                        recordset.val('产品资料.材质外语', cp.czwy, row);
                        recordset.val('产品资料.颜色外语', cp.yswy, row);
                        recordset.val('产品资料.外语说明', cp.wysm, row);
                        if (recordset.value('产品资料.单据品名', row) == '') {
                            recordset.val('产品资料.单据品名', cp.djpm, row);
                        }
                        if (recordset.value('产品资料.单据品名英', row) == '') {
                            recordset.val('产品资料.单据品名英', cp.djpmy, row);
                        }
                        if (recordset.value('产品资料.单据品名外', row) == '') {
                            recordset.val('产品资料.单据品名外', cp.djpmw, row);
                        }
                        if (recordset.value('产品资料.客人CODE', row) == '') {
                            recordset.val('产品资料.客人CODE', cp.krcode, row);
                        }
                        if (recordset.value('产品资料.客人税率', row) == '') {
                            recordset.val('产品资料.客人税率', cp.krsl, row);
                        }
                        recordset.val('产品资料.材质中文', cp.caiziz, row);
                        recordset.val('产品资料.中文报关品名', cp.bgpm, row);
                        recordset.val('产品资料.海关编码', cp.hgbm, row);
                        recordset.val('产品资料.内盒装箱量', cp.nhrl, row);
                        recordset.val('产品资料.外箱装箱量', cp.bzrl, row);
                        recordset.val('产品资料.报关单位', cp.bgjldw, row);
                        recordset.val('产品资料.入库地点', cp.rkdd, row);
                        recordset.val('产品资料.产品来源', cp.topcz, row);
                        recordset.val('产品资料.备注', cp.bz3, row);
                        recordset.val('产品资料.专业产品编号', cp.cpbh, row);
                        recordset.val('产品资料.采购人员', cp.cgry, row);
                        recordset.val('产品资料.工厂货号', cp.gchh1, row);
                        // recordset.val('产品资料.组合产品', cp.zhcp);
                        recordset.val('产品资料.是否含税', cp.sfhs, row);
                        recordset.val('产品资料.业务人员', cp.bjyw, row);
                        recordset.val('产品资料.实业务人员', cp.bjyw, row);
                        recordset.val('产品资料.是否授权', cp.sfsq, row);
                        recordset.val('产品资料.原始采购价', cp.yscgj, row);
                        recordset.val('产品资料.工厂退点', cp.gctd, row);
                        recordset.val('产品资料.检测项目', cp.jcxm, row);
                        recordset.val('产品资料.检测费用', cp.jcfy, row);
                        recordset.val('产品资料.采购单价', cp.cgdj, row);
                        recordset.val('产品资料.客户RMB单价', cp.rmbdj, row);
                        recordset.val('产品资料.含佣RMB单价', cp.rmbdj, row);
                        recordset.val('产品资料.系统客户RMB单价', cp.rmbdj, row);
                        recordset.val('产品资料.系统外销单价', cp.mjfob, row);
                        if (cp.bzyq != '') {
                            recordset.val('产品资料.包装要求', cp.bzyq, row);
                        }
                        if (flag == 2) {
                            if (wxdj <= 0) {
                                if (cp.Twxdj > 0) {
                                    recordset.val('产品资料.外销单价', cp.Twxdj, row);
                                } else {
                                    recordset.val('产品资料.外销单价', cp.mjfob, row);
                                }
                            } else {
                                recordset.val('产品资料.外销单价', wxdj, row);
                            }
                            if (khrmbdj <= 0) {
                                if (cp.pkRMB > 0) {
                                    recordset.val('产品资料.客户RMB单价', cp.pkRMB, row);
                                } else {
                                    recordset.val('产品资料.客户RMB单价', cp.rmbdj, row);
                                }
                            } else {
                                recordset.val('产品资料.客户RMB单价', khrmbdj, row);
                            }
                            recordset.val('产品资料.结算方式', cp.jsfs, row);
                        } else {
                            recordset.val('产品资料.客户RMB单价', cp.rmbdj, row);
                            recordset.val('产品资料.外销单价', cp.mjfob, row);
                        }
                    }
                    if (cs) {
                        recordset.val('产品资料.专业厂家id', cs.cs_id, row);
                        recordset.val('产品资料.工厂电话', cs.phone, row);
                        recordset.val('产品资料.有无拜访', cs.ywbf, row);
                        recordset.val('产品资料.结算方式', cs.jsfs, row);
                    }
                }).catch(err => {
                    _.ui.message.error(err.msg);
                    console.log(err);
                });
            }
            // 2026-01-30 测试注销专业货号
            // if (zyhh != recordset.val('产品资料.专业货号')) recordset.val('产品资料.专业货号', zyhh)
        }
    }
    if ((field.full_name == '外销合同.产品资料.合同数量')) {
        if (recordset.val('强制更新') != '杂货') {
            if (recordset.value('产品资料.合同数量', row) > 0 && recordset.value('产品资料.外箱装箱量', row) > 0 && recordset.value('产品资料.拼箱标记', row) != '是') {
                let boxs = Math.ceil(recordset.value('产品资料.合同数量', row) / recordset.value('产品资料.外箱装箱量', row));
                if (recordset.value('产品资料.箱    数', row) != boxs) {
                    recordset.val('产品资料.箱    数', boxs, row);
                }
            }
            if (recordset.value('产品资料.外销唯一字段', row) != "" && recordset.val('审批申请') == '') {
                _.http.post("/api/saier/salesorder/item/htsl/change", {
                    wyzd: recordset.value('产品资料.外销唯一字段', row),
                }).then(res => {
                    let d = res.data;
                    let cgsl = d.cgsl;
                    let cysl = d.cysl;
                    let yxds = d.yxds;
                    let yjhs = d.yjhs;
                    let lines = d.lines;
                    if (cgsl) {
                        let t = recordset.tables['采购数量更新']
                        t.clear();
                        recordset.module.group_by_name('采购数量更新').visible = true;
                        if (cysl > 0 && recordset.value('产品资料.出运改数量', row) == '是' && recordset.value('产品资料.单证锁定', row) == '') {} else {
                            if (cysl > recordset.value('产品资料.合同数量', row)) {
                                _.ui.message.error('请注意已有出运且数量大于合同数量');
                            } else {
                                recordset.val('当前更改数', recordset.value('产品资料.合同数量', row));
                                for (let r of lines) {
                                    r.rid = _.utils.guid();
                                    r.pid = recordset.rid;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.拼箱标记').db.name] = r.pxbj;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.专业货号').db.name] = r.bjhh;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.跟单人员').db.name] = r.gdry;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.厂商名称').db.name] = r.csmc;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.合同号码').db.name] = r.hthm;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.外箱装箱量').db.name] = r.wxrl;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.合同数量').db.name] = r.cgsl;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.合同数量1').db.name] = r.cgsl;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.毛    重').db.name] = r.mz;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.净    重').db.name] = r.jz;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.外箱体积').db.name] = r.tj;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.唯一字段').db.name] = r.wyzd;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.外销唯一字段').db.name] = r.wxwyzd;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.采购单价').db.name] = r.cgjg;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.father').db.name] = r.pid;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.外销改数备注').db.name] = r.wxgsbz;
                                    r[recordset.module.field_by_full_name(n + '.采购数量更新.采购产品Rid').db.name] = r.rid;
                                }
                            };
                            if (lines.length > 0) {
                                t.data = lines;
                                t.sync_operate_data()
                            }
                            if (cgsl > recordset.value('产品资料.合同数量', row) && recordset.value('产品资料.合同数量', row) != cgsl) {
                                _.ui.message.error('请注意已下单采购合同数大于外销合同数，数据回滚到已下单采购合同数');
                                recordset.val('产品资料.合同数量', cgsl, row);
                                if (recordset.value('产品资料.合同数量', row) > 0 && recordset.value('产品资料.外箱装箱量', row) > 0 && recordset.value('产品资料.拼箱标记', row) != '是') {
                                    let boxs = Math.ceil(recordset.value('产品资料.合同数量', row) / recordset.value('产品资料.外箱装箱量', row));
                                    recordset.val('产品资料.箱    数', boxs, row);
                                }
                            }
                        }
                    }
                    let sl6 = recordset.value('产品资料.合同数量', row);
                    if (yxds > 0) {
                        sl6 = sl6 - yxds;
                    }
                    if (yjhs > 0) {
                        sl6 = sl6 - yjhs;
                    }
                    recordset.val('产品资料.下单数   量5', sl6, row);
                    if (recordset.value('产品资料.外箱装箱量', row) > 0 && recordset.value('产品资料.拼箱标记', row) !== '是') {
                        recordset.val('产品资料.下单箱数   量4', sl6 / recordset.value('产品资料.外箱装箱量', row), row);
                    }
                }).catch(err => {
                    _.ui.message.error(err.msg);
                    console.log(err);
                });
            } else {
                recordset.val('产品资料.下单数   量5', recordset.value('产品资料.合同数量', row), row);
                // let boxs = Math.ceil(recordset.value('产品资料.合同数量', row) / recordset.value('产品资料.外箱装箱量', row));
                // if (recordset.value('产品资料.箱    数', row) != boxs) {
                //     recordset.val('产品资料.箱    数', boxs, row);
                // }
                if (recordset.value('产品资料.外箱装箱量', row) > 0) {
                    if (recordset.value('产品资料.拼箱标记', row) != '是') {
                        let boxs = Math.ceil(recordset.value('产品资料.合同数量', row) / recordset.value('产品资料.外箱装箱量', row));
                        recordset.val('产品资料.下单箱数   量4', boxs, row);
                    } else {
                        recordset.val('产品资料.下单箱数   量4', recordset.value('产品资料.箱    数', row), row);
                    }
                }
            }
        }
    }
    if (field.full_name == n + '.采购数量更新.合同数量') {
        if (recordset.val('当前更改数') < recordset.val('更改合计')) {
            _.ui.message.error('请注意采购合同需下单数大于合同数量，下单数将清0');
            recordset.val('采购数量更新.合同数量', 0, row);
        } else {
            if (recordset.value('采购数量更新.合同数量', row) > 0 || recordset.value('采购数量更新.箱    数', row) > 0) {
                if (recordset.value('采购数量更新.拼箱标记', row) != '是') {
                    recordset.val('采购数量更新.合同数量', recordset.value('采购数量更新.箱    数', row) * recordset.value('采购数量更新.外箱装箱量', row), row);
                }
                recordset.val('采购数量更新.总 毛 重', recordset.value('采购数量更新.箱    数', row) * recordset.value('采购数量更新.毛    重', row), row);
                recordset.val('采购数量更新.总 净 重', recordset.value('采购数量更新.箱    数', row) * recordset.value('采购数量更新.净    重', row), row);
                recordset.val('采购数量更新.总 体 积', recordset.value('采购数量更新.箱    数', row) * recordset.value('采购数量更新.外箱体积', row), row);
                recordset.val('采购数量更新.总 金 额', recordset.value('采购数量更新.合同数量', row) * recordset.value('采购数量更新.采购单价', row), row);
                _.http.post("/api/saier/salesorder/cgcp/htsl/change", {
                    wxht: recordset.value('产品资料.外销唯一字段', row),
                    line: recordset.tables['采购数量更新'].current_data,
                }).then(res => {

                }).catch(err => {
                    _.ui.message.error(err.msg);
                    console.log(err);
                });
            }
        }
    }
    if (field.full_name == n + '.货币代码' && value != '') {
        _.http.post("/api/saier/salesorder/get/exchange", {
            xsbz: recordset.val('货币代码'),
        }).then(res => {
            recordset.val('汇    率', res.data, row);
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.log(err);
        });
    }
    if (field.full_name == n + '.货币代码' || field.full_name == n + '.RMB客户' || field.full_name == n + '.汇    率') {
        _.http.post("/api/saier/salesorder/hbdm/change", {
            xsbz: recordset.val('货币代码'),
            rmbkh: recordset.val('RMB客户'),
            hl: recordset.val('汇    率'),
        }).then(res => {
            let d = res.data;
            let zhmjhl = 1
            let hl = recordset.val('汇    率')
            let rmbkh = recordset.val('RMB客户')
            if (!d || d==null || d==0) {
                recordset.val('转美元汇率', 1);
            } else {
                recordset.val('转美元汇率', d);
                zhmjhl = d;
            }
            let t = recordset.tables['产品资料']
            let v = t.view_data
            // for (let r of v) {
            //     r.zhmjhl = zhmjhl;
            //     if (rmbkh != '是') {
            //         r.zjez = round(r.zje * zhmjhl,4);
            //     } else {
            //         r.zjez = round(Number(Math.ceil(r.mjzj/ hl * 1000+0.5)/1000), 4);
            //     }
            //     t.push_modi_rid(r.rid);
            // }
            for (let r of v) {
                r.zhmjhl = zhmjhl;
                let hyRMBdj = r.hyRMBdj ? r.hyRMBdj : 0;
                let hydj = r.hydj ? r.hydj : 0;
                let htsl = r.htsl ? r.htsl : 0;
                if (rmbkh != '是') {
                    // r.zjez = round(r.zje * zhmjhl,4);
                    recordset.val('产品资料.总 金 额', round(hydj * htsl,4), r);
                    recordset.val('产品资料.总 金 额总', round(r.zje * zhmjhl, 4), r);
                } else {
                    
                    // r.zjez = round(Number(Math.ceil(r.mjzj/ hl * 1000+0.5)/1000), 4);
                    recordset.val('产品资料.客户RMB总价', round(hyRMBdj * htsl,4), r);
                    recordset.val('产品资料.总 金 额总', round(Number(Math.ceil(r.mjzj/ hl * 1000+0.5)/1000), 4), r);
                }
                t.push_modi_rid(r.rid);
            }
            t.sync_operate_data()
            recordset.do_re_sum_by_trigger_table('产品资料');
            t.modified = true
        }).catch(err => {
            _.ui.message.error(err.msg);
            console.log(err);
        });
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, salesorder_field_change, '外销合同')


const salesorder_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    let username = _.user.username;
    if (username != 'zjnblh' && username != 'admin') {
        recordset.module.group_by_name('修改记录').visible = false;
        recordset.module.group_by_name('出运汇总').visible = false;
        recordset.module.group_by_name('采购数量更新').visible = false;
        recordset.module.field_by_full_name(n + '.佣金点数').disabled = true;
        recordset.module.field_by_full_name(n + '.暗佣点数').disabled = true;
        recordset.module.field_by_full_name(n + '.暗佣合计').disabled = true;
        recordset.module.field_by_full_name(n + '.明佣合计').disabled = true;
        recordset.module.field_by_full_name(n + '.产品资料.佣金比率').disabled = true;
        recordset.module.field_by_full_name(n + '.产品资料.佣金单价').disabled = true;
        recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').disabled = true;
        recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').disabled = true;

    }
    if (recordset.val('佣金类型') == '') {
        recordset.val('佣金类型', '无');
    }
    if ((recordset.val('业务人员') == '' || recordset.val('业务人员') == username) && ((recordset.val('审批申请') == '') || recordset.val('审批申请') == username)) {
        recordset.module.field_by_full_name(n + '.业务人员').disabled = false;
    } else {
        recordset.module.field_by_full_name(n + '.业务人员').disabled = true;
    }

    if (recordset.val('自动计算含佣价') !== '是' && recordset.val('佣金类型') === '明佣+暗佣') {
        recordset.module.field_by_full_name(n + '.产品资料.佣金单价').disabled = false;
        recordset.module.field_by_full_name(n + '.产品资料.暗佣单价').disabled = false;
    }
    if (recordset.val('佣金类型') === '明佣' || recordset.val('佣金类型') === '明佣+暗佣') {
        recordset.module.field_by_full_name(n + '.佣金点数').disabled = false;
        recordset.module.field_by_full_name(n + '.明佣合计').disabled = false;
        recordset.module.field_by_full_name(n + '.产品资料.佣金比率').disabled = false;
    }
    if (recordset.val('佣金类型') == '暗佣' || recordset.val('佣金类型') == '明佣+暗佣') {
        recordset.module.field_by_full_name(n + '.暗佣点数').disabled = false;
        recordset.module.field_by_full_name(n + '.暗佣合计').disabled = false;
        recordset.module.field_by_full_name(n + '.产品资料.暗佣比率').disabled = false;
    }
    if (recordset.val('佣金类型') == '无') {
        recordset.val('佣金点数', 0);
        recordset.val('暗佣点数', 0);
        recordset.module.field_by_full_name(n + '.产品资料.含佣单价').disabled = false;
        recordset.module.field_by_full_name(n + '.产品资料.含佣RMB单价').disabled = false;
    }
    recordset.module.field_by_full_name(n + '.产品资料.产品图片').visible = false;
    recordset.val('修改查看', '否');

    let ywry = recordset.val('业务人员');
    let spsq = recordset.val('审批申请');
    let spsq1 = recordset.val('审批申请1');
    // let spjg = recordset.val('审批结果');
    // let spjg1 = recordset.val('审批结果1');
    if (username !== 'zjnblh') {
        recordset.module.field_by_full_name(n + '.修改清单').visible = false;
    } else {
        recordset.module.field_by_full_name(n + '.修改清单').visible = true;
    }
    if (recordset.val('审批申请') !== '') {
        recordset.module.field_by_full_name(n + '.产品资料.产品图片').disabled = true;
        recordset.module.group_by_name('产品资料')._.toolbar.show('new', false);
        // recordset.module.group_by_name('产品资料')._.toolbar.show('delete', false);
        recordset.module.group_by_name('产品资料')._.toolbar.show('modify', false);
        recordset.module.field_by_full_name(n + '.恢复末保存删除').visible = false;
    } else {
        recordset.module.field_by_full_name(n + '.产品资料.产品图片').disabled = false;
        recordset.module.group_by_name('产品资料')._.toolbar.show('new', true);
        recordset.module.group_by_name('产品资料')._.toolbar.show('delete', true);
        recordset.module.group_by_name('产品资料')._.toolbar.show('modify', true);
        if (recordset.val('业务人员') === username) {
            recordset.module.field_by_full_name(n + '.恢复末保存删除').visible = true;
        }
    }
    if (recordset.val('是否免审') != '是' || username != recordset.val('审批申请')) {
        _.http.post("/api/saier/salesorder/load/check", {
            hthm: recordset.val('合同号码'),
            ywry: ywry,
            xshl: recordset.val('汇    率'),
            spsq: spsq,
            spsq1: spsq1
        }).then(res => {
            let d = res.data;
            let hl = d.hl;
            let htzd = d.htzd
            recordset._list['外销合同.审批申请'] = d.spsq_list
            if (recordset.val('汇    率') == 0 || recordset.val('汇    率') == '' || recordset.val('汇    率') == null) {
                recordset.val('汇    率', hl);
            }
            if (recordset.val('外销部门') == '') {
                recordset.val('外销部门', d.ywbm);
            }
            if (recordset.val('业务') == '') {
                recordset.val('业务', d.path);
            }
            recordset.module.field_by_full_name(n + '.合同号码').disabled = !(recordset.val('审批申请') == "");
            recordset.module.field_by_full_name(n + '.审批申请').disabled = true;
            recordset.module.field_by_full_name(n + '.审批结果').disabled = true;
            recordset.module.field_by_full_name(n + '.未批原因').disabled = true;
            recordset.module.field_by_full_name(n + '.合同号码').disabled = (htzd == 1)
            if (d.path1 == 1) {
                recordset.module.field_by_full_name(n + '.审批申请').disabled = false;
                if (ywry != "") {
                    if (ywry != username) {
                        recordset.module.field_by_full_name(n + '.合同号码').disabled = false;
                        if (d.path2 == 1) {
                            if (recordset.val('风控确认') != '待批') {
                                recordset.module.field_by_full_name(n + '.审批结果').disabled = false;
                                recordset.module.field_by_full_name(n + '.未批原因').disabled = false;
                            }
                        }
                    } else {
                        recordset.module.field_by_full_name(n + '.审批申请').disabled = (spsq != '');
                        if (spsq1 == '') {
                            recordset.val('审批申请1', spsq)
                        }
                    }
                }
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }
}
_.evts.on([_.evtids.RECORD_LOAD], salesorder_recordLoad, '外销合同')


// 查询界面或编辑界面打开事件
const sales_order_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'update_chrq_btn',
            "caption": '更新船期',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'update_hthm_btn',
            "caption": '更改合同号',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'return_hthm_btn',
            "caption": '退回合同号',
            "icon": 'any-server-update',
            "divided": true
        })
    } else {
        btns.push({
            "name": 'special_approval_btn',
            "caption": '特殊审批',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'confirm_batch_btn',
            "caption": '批量通过',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'modify_workflow_status_btn',
            "caption": '改单申请',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'modify_workflow_special_btn',
            "caption": '特殊改单申请',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'update_jdrq_btn',
            "caption": '客户回签',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'purchase_plan_btn',
            "caption": '生成采购计划',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'return_batch_btn',
            "caption": '批量退回',
            "icon": 'any-server-update',
            "divided": true
        })
    }
    if (form.is_editor) {
        form.toolbar.show('workflow_approve', false)
    }
    if (btns.length > 0) {
        form.toolbar.insert([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": '#ext-add_database',
            "btns": btns,
            "divided": true
        }], 'close');
    }
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], sales_order_Form_Show, '外销合同')


const sales_order_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '产品资料') {
        let btns = []
        btns.push({
            "name": 'item_no_update_btn',
            "caption": '更改货号',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'item_dzsd_update_btn',
            "caption": '刷新单证锁定',
            "icon": 'any-server-update',
            "divided": true
        })
        btns.push({
            "name": 'purchase_update_btn',
            "caption": '刷新采购',
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
        btns.push({
            name: 'import_photo_btn',
            caption: '导入Excel',
            icon: 'any-server-update',
        })
        // form.toolbar.add([{
        //     "name": 'import_photo_btn',
        //     "caption": 'Excel导入',
        //     "icon": 'any-server-update',
        // }]);
        // form.toolbar.add([{
        //     "name": 'bCopyFromExcel',
        //     "caption": '粘贴数据',
        //     "icon": 'any-server-update',
        // }]);
        form.toolbar.add([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": 'any-server-update',
            "btns": btns,
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], sales_order_EditorChildShow, '外销合同')

const sales_order_form_BtnClick = (evt_id, btn, form) => {
    let recordset = form.recordset;
    let m = form.module.name;
    if (btn.name == 'bCopyFromExcel') {
        _.ui.show_dialog('copy_from_excel', {
            "rid": form.recordset.rid,
            "group_name": form.group.value.name,
            "run_fill": true,
        });
    }
    if (btn.name == 'import_photo_btn') {
        _.ui.show_dialog('photo_from_excel', {
            rid: form.current_rid,
            group: '外销合同.产品资料',
            option: 'append',
            kfield: 'bjhh',
            pfield: 'yytp',
        })
    }
    if (btn.name == 'update_chrq_btn') {
        if (recordset.val('审批结果') != '通过' || recordset.val('审批申请') == _.user.username) {
            _.http.post('/api/saier/salesorder/update/chrq', {
                rid: recordset.val('rid'),
                hthm: recordset.val('合同号码'),
                yjcq: recordset.val('预计船期'),
                lines: recordset.tables['产品资料'].view_data
            }).then(res => {
                _.ui.message.success('船期更新成功')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (btn.name == 'update_jdrq_btn') {
        let rids = []
        if (form.is_search) {
            rids = form.current_rids.value
        }
        if (rids.length == 0) {
            rids = [form.current_rid.value]
        }
        _.ui.show_input_date_dialog('请输入接单日期:', '').then(val => {
            _.http.post('/api/saier/salesorder/update/jdrq', {
                rids: rids,
                jdrq: val
            }).then(res => {
                _.ui.message.success('客户回签操作成功')

            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'update_hthm_btn') {
        if (recordset.val('审批申请') == '' && recordset.val('业务人员') == _.user.username) {
            _.ui.show_input_dialog('请输入原合同号:', '').then(yhth => {
                if (yhth == '') {
                    _.ui.message.error('原合同号不能为空')
                    return
                }
                _.ui.show_input_dialog('请输入新合同号:', '').then(xhth => {
                    if (xhth == '') {
                        _.ui.message.error('新合同号不能为空')
                        return
                    }
                    _.http.post('/api/saier/salesorder/update/hthm', {
                        yhth: yhth,
                        xhth: xhth,
                        khht: recordset.val('客户合同'),
                        rid: recordset.val('rid')
                    }).then(res => {
                        _.ui.message.success('合同修改成功')
                        recordset.val('合同号码', xhth);

                    }).catch(err => {
                        console.log(err)
                        _.ui.message.error(err.msg)
                    })
                })
            })
        }
    }
    if (btn.name == 'modify_workflow_status_btn') {
        let rids = []
        if (form.is_search) {
            rids = form.current_rids.value
        }
        if (rids.length == 0) {
            rids = [form.current_rid.value]
        }
        _.ui.show_input_dialog('请输入要改单的原因:', '').then(val => {
            if (val == '') {
                _.ui.message.error('改单原因不能为空')
                return
            }
            _.http.post('/api/saier/salesorder/modify/batch', {
                rids: rids,
                val: val,
                flag: 0
            }).then(res => {
                _.ui.message.success('改单申请成功')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'modify_workflow_special_btn') {
        let rids = [form.current_rid.value]
        _.ui.show_input_dialog('请输入要改单的原因:', '').then(val => {
            if (val == '') {
                _.ui.message.error('改单原因不能为空')
                return
            }
            _.http.post('/api/saier/salesorder/modify/batch', {
                rids: rids,
                val: val,
                flag: 1
            }).then(res => {
                _.ui.message.success('特殊改单申请成功')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'return_batch_btn') {
        // _.ui.show_input_select_dialog('请选择退回方式:', '当前合同', ['当前合同', '所有改单']).then(val => {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请选择要审批的合同')
            return
        }
        _.ui.confirm('确定要批量退回吗？').then(() => {
            _.http.post('/api/saier/salesorder/return/batch', {
                rids: rids,
                module: form.module.name,
                // kind: val
            }).then(res => {
                _.ui.message.success('批量退回成功')
                _.platform.active.load_data()
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'confirm_batch_btn') {
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请选择要审批的合同')
            return
        }
        _.ui.confirm('确定要批量审批通过吗？').then(() => {
            _.http.post('/api/saier/salesorder/confirm/batch', {
                rids: rids,
                module: form.module.name
            }).then(res => {
                _.ui.message.success('批量审批成功')
                _.platform.active.load_data()
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'purchase_plan_btn') {
        if (!_.user.can('new_purchase_plan')) {
            _.ui.message.error('您没有权限执行此操作，请联系管理员')
            return
        }
        let rids = form.current_rids.value
        if (rids.length == 0) {
            if (form.current_rid.value && form.current_rid.value != '') {
                rids = [form.current_rid.value]
            }
        }
        if (rids.length == 0) {
            _.ui.message.error('请选择要生成采购计划的订单记录')
            return
        }
        _.ui.show_input_select_dialog('请选择生成方式:', '按产品生成', ['按产品生成', '本组产品合并,他组按产品']).then(val => {
            _.http.post('/api/saier/salesorder/purchase/plan', {
                rids: rids,
                kind: val
            }).then(res => {
                _.ui.message.success(res.msg)
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }

    if (btn.name == 'item_no_update_btn') {
        if (recordset.val('审批申请') != '' || recordset.val('业务人员') != _.user.username) {
            _.ui.message.error('操作被取消')
            return
        }
        _.ui.show_input_dialog('请输入原货号:', '').then(yhh => {
            // if (yhh == '') {
            //     _.ui.message.error('原货号不能为空')
            //     return
            // }
            let flag = 0
            if (yhh != recordset.val('产品资料.客户货号') && yhh != recordset.val('产品资料.专业货号')) {
                _.ui.message.error('不好意思,货号选错，请重新输入')
                return
            }
            if (yhh == recordset.val('产品资料.专业货号')) {
                flag = 1
            }
            if (yhh == '') {
                yhh = '无'
            }
            _.ui.show_input_dialog('请输入更改后货号:', '').then(xhh => {
                if (xhh == '') {
                    xhh = '无'
                    // _.ui.message.error('新货号不能为空')
                    // return
                }
                let wyzd = recordset.val('产品资料.外销唯一字段');

                if (yhh == "" || xhh == "" || wyzd == "") {
                    return
                }
                if (yhh == '无') {
                    yhh = ''
                }
                if (xhh == '无') {
                    xhh = ''
                }
                let zyhh = ''
                if (flag == 1) {
                    recordset.val('产品资料.专业货号', xhh);
                    recordset.val('产品资料.货号备注', xhh);
                    zyhh = recordset.val('产品资料.专业货号');
                } else {
                    recordset.val('产品资料.客户货号', xhh);
                    zyhh = recordset.val('产品资料.专业货号');
                }
                let khhh = recordset.val('产品资料.客户货号');

                _.http.post('/api/saier/salesorder/update/cpbh', {
                    khhh: khhh,
                    zyhh: zyhh,
                    wyzd: wyzd
                }).then(res => {
                    _.ui.message.success('货号更新成功')
                }).catch(err => {
                    console.log(err)
                    _.ui.message.error(err.msg)
                })
            })
        })
    }
    if (btn.name == 'item_dzsd_update_btn') {
        if (recordset.val('产品资料.单证锁定') == '' || recordset.val('产品资料.单证锁定') == undefined) {
            return
        }
        _.http.post('/api/saier/salesorder/item/update/dzsd', {
            wyzd: recordset.val('产品资料.外销唯一字段'),
        }).then(res => {
            if (res.data == 1) recordset.val('产品资料.单证锁定', '');
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
        })
    }
    if (btn.name == 'return_hthm_btn') {
        if (recordset.val('审批申请') == '' && recordset.val('业务人员') == _.user.username) {
            _.http.post('/api/saier/salesorder/return/hthm', {
                rid: recordset.val('rid'),
                hthm: recordset.val('合同号码')
            }).then(res => {
                _.ui.message.success('合同退回成功')
                recordset.val('合同唯一', '');
                recordset.val('合同号码', '退回合同' + _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss'));
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        }
    }
    if (btn.name == 'purchase_update_btn') {
        if (recordset.val('审批申请') == '' && recordset.val('产品资料.专业货号') != '' && recordset.val('产品资料.专业厂家') != '' && recordset.val('产品资料.专业厂家') != '待定') {
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
        }
    }
    if (btn.name == 'special_approval_btn') {
        _.ui.show_input_dialog('请输入要特殊审批的原因:', '').then(val => {
            if (val == '') {
                _.ui.message.error('特殊审批原因不能为空')
                return
            }
            _.http.post('/api/saier/salesorder/special/approval', {
                val: val,
                rid: form.current_rid.value,
            }).then(res => {
                _.ui.message.success('操作成功')
            }).catch(err => {
                console.log(err)
                _.ui.message.error(err.msg)
            })
        })
    }
    if (btn.name == 'import_photo_btn') {
        _.ui.show_dialog('photo_from_excel', {
            "rid": form.current_rid,
            "group": '外销合同.产品资料',
            "option": 'append',
            "kfield": 'xjhh',
            "pfield": 'yytp'
        });
    };
    if (btn.name == 'item_all_update_btn') {
        if (recordset.val('审批申请') != '') {
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
                    sales_order_items_update(r, l, rid, m, recordset)
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
        if (recordset.val('审批申请') != '') {
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
                sales_order_items_update(r, l, rid, m, recordset)
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
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], sales_order_form_BtnClick, '外销合同')


const sales_order_items_update = (r, l, rid, m, recordset) => {
    if (l[rid].flag == 1) {
        r.fljg = l[rid].fljg;
        r.flzj = round(r.fljg * r.yxdsl, 2);
    }
    console.log(l)
    console.log(l[rid])
    if (!l[rid] || l[rid]==undefined) {
        return
    }
    if (l[rid].items) {
        // console.log('1111')
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
        // console.log('aaaa')
        // r[recordset.module.field_by_full_name(m + '.产品资料.克    重').db.name] = l[rid].items.chpkzh
        r[recordset.module.field_by_full_name(m + '.产品资料.材质中文').db.name] = l[rid].items.caiziz
        r[recordset.module.field_by_full_name(m + '.产品资料.材质英语').db.name] = l[rid].items.caizi
        r[recordset.module.field_by_full_name(m + '.产品资料.材质外语').db.name] = l[rid].items.czwy
        // console.log(3333)
        // r[recordset.module.field_by_full_name(m + '.产品资料.测式种类').db.name] = l[rid].items.cszl
        r[recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db.name] = l[rid].items.bgpm
        r[recordset.module.field_by_full_name(m + '.产品资料.产品尺寸').db.name] = l[rid].items.chpchc
        r[recordset.module.field_by_full_name(m + '.产品资料.bottom材质').db.name] = l[rid].items.bottomcz
        r[recordset.module.field_by_full_name(m + '.产品资料.内部材质').db.name] = l[rid].items.coating
        r[recordset.module.field_by_full_name(m + '.产品资料.外部材质').db.name] = l[rid].items.wbcz
        r[recordset.module.field_by_full_name(m + '.产品资料.其他材质').db.name] = l[rid].items.qtcz
        r[recordset.module.field_by_full_name(m + '.产品资料.厚    度').db.name] = l[rid].items.houd
        // console.log(4444)
        r[recordset.module.field_by_full_name(m + '.产品资料.壁    厚').db.name] = l[rid].items.bh123
        r[recordset.module.field_by_full_name(m + '.产品资料.底    厚').db.name] = l[rid].items.dh123
        r[recordset.module.field_by_full_name(m + '.产品资料.中文尺寸').db.name] = l[rid].items.zwcc
        r[recordset.module.field_by_full_name(m + '.产品资料.英文尺寸').db.name] = l[rid].items.ywcc
        // console.log(555)
        r[recordset.module.field_by_full_name(m + '.产品资料.产品大类').db.name] = l[rid].items.cpfl
        // console.log('bbbb')
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
        console.log(l[rid])
        console.log(l[rid].gdry)
        // console.log('ddddd')
        // if (l[rid].items.gdry && l[rid].items.gdry!=undefined && l[rid].items.gdry != null && l[rid].items.gdry != '') {
        //     r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = l[rid].items.gdry
        // } else {
        //     r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = '待定';
        // }
        r[recordset.module.field_by_full_name(m + '.产品资料.入库地点').db.name] = l[rid].items.rkdd
        r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name] = l[rid].items.cgdj
        r[recordset.module.field_by_full_name(m + '.产品资料.专业产品编号').db.name] = l[rid].items.cpbh
        r[recordset.module.field_by_full_name(m + '.产品资料.原始采购价').db.name] = l[rid].items.yscgj
        r[recordset.module.field_by_full_name(m + '.产品资料.工厂退点').db.name] = l[rid].items.gctd
        r[recordset.module.field_by_full_name(m + '.产品资料.产品来源').db.name] = l[rid].items.topcz
        // console.log(22222)
        if (l[rid].items.cgry && l[rid].items.cgry != null && l[rid].items.cgry != '') {
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


function sales_order_table_new_after(evt_id, table, recordset) {
    if (table.group == '产品资料') {
        recordset.val('产品资料.图片货号', '');
        recordset.val('产品资料.外销唯一字段', recordset.val('产品资料.rid'));
        recordset.val('产品资料.统计条件', recordset.val('产品资料.rid'));
        if (recordset.val('强制更新') != '杂货') {
            recordset.val('产品资料.佣金比率', recordset.val('佣金点数') / 100);
            recordset.val('产品资料.暗佣比率', recordset.val('暗佣点数') / 100);
        }

    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], sales_order_table_new_after, '外销合同')


const sales_order_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group != '产品资料') {
            resolve();
            return
        }
        if (recordset.val('合同号码') == '' || (recordset.val('合同号码') != '' && recordset.val('合同号码').indexOf('退回') != -1) || recordset.val('审批申请') != '') {
            resolve();
            return
        }
        if (recordset.val('产品资料.单证锁定') != '') {
            if (recordset.val('产品资料.客户RMB单价') != recordset.val('产品资料.客户RMB单价1') || recordset.val('产品资料.含佣RMB单价') != recordset.val('产品资料.赔款RMB1') ||
                recordset.val('产品资料.含佣单价') != recordset.val('产品资料.赔款单价1') || recordset.val('产品资料.外销单价') != recordset.val('产品资料.外销单价1') ||
                recordset.val('产品资料.采购单价') != recordset.val('产品资料.采购单价1')) {
                _.ui.message.error('不好意思,货号' + recordset.val('产品资料.专业货号') + '已经由单证:' + recordset.val('产品资料.单证锁定') + '锁定您无权删除,合同页面将关闭，请联系相关单证人员解锁');
                recordset.val('MSN', '1');
                reject();
                return;
            }
        }
        if (recordset.val('产品资料.外销唯一字段') == '') {
            resolve();
            return
        }
        _.http.post('/api/saier/salesorder/item/delete/check', {
            wyzd: recordset.val('产品资料.外销唯一字段'),
        }).then(res => {
            let d = res.data;
            resolve();
        }).catch(err => {
            console.log(err)
            _.ui.message.error(err.msg)
            recordset.val('MSN', '1');
            reject();
        })
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_DELETE], sales_order_table_delete_before, '外销合同')


const sales_order_after_save = (evt_id, recordset) => {
    // if (recordset.val('wf_status') == 1 || recordset.val('wf_status') == 2) return
    // if (recordset.val('审批申请') == '') return
    // _.ui.confirm('是否提交审批？').then(() => {
    //     _.http.post('/api/saier/workflow/start', {
    //         rid: recordset.val('rid'),
    //         module: recordset.module.name,
    //         flow_name: '外销合同'
    //     }).then(res => {
    //         recordset.val('wf_status',1)
    //         _.platform.active.reload_data()
    //     }).catch(res => {
    //         _.ui.message.error(res.msg);
    //         console.log(res);
    //     });
    // })
    if (recordset.val('审批申请') == '') return
    if ((recordset.val('wf_status') == 0 || recordset.val('wf_status') == 3) && recordset.val('业务人员') == _.user.username){
        _.http.post('/api/saier/workflow/start', {
            rid: recordset.val('rid'),
            module: recordset.module.name,
            flow_name: '外销合同',
        }).then((res) => {
            recordset.val('wf_status', 1)
            // _.platform.active.reload_data()
            _.platform.active.close()
        }).catch((res) => {
            _.ui.message.error(res.msg)
            console.log(res)
        })
    } else if (recordset.val('wf_status') == 1 && recordset.val('审批申请') == _.user.username) {
        if (recordset.val('审批结果') == '' || recordset.val('审批结果') == '待审批') {
            return
        }
        let status = 1
        let memo = ''
        if (recordset.val('审批结果') == '不通过' || recordset.val('审批结果') == '取消订单') {
            status = 2
            memo = recordset.val('未批原因')
        }
        _.http.post('/api/saier/audit/save/after', {
            rid: recordset.val('rid'),
            module: recordset.module.name
        }).then(r => {
            console.log('审批保存结果', r)
            let instance = r.data.instance_rid
            let task_id = r.data.task_rid
            _.http.post('/api/workflow/task/flow', {
                instance: instance,
                status: status,
                task_id: task_id,
                memo: memo
            }).then(res => {
                _.platform.active.reload_data()
                // _.platform.active.close()
            }).catch((res) => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }).catch((e) => {
            console.log(e)
            _.ui.message.error(e.msg)
        })
    }
}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, sales_order_after_save, '外销合同')



const sales_order_after_copy = (evt_id, recordset) => {
    _.http.post('/api/saier/salesorder/after/copy', {
    }).then(res => {
        recordset.val('外销部门', res.data.ywbm);
        recordset.val('业务', res.data.path);
    }).catch(res => {
        _.ui.message.error(res.msg);
        console.log(res);
    });
}
_.evts.on(_.evtids.RECORD_AFTER_COPY, sales_order_after_copy, '外销合同')