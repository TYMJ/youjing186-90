/**入库日期change 入库时间与制表人默认当前 **/

const evt_rkd_FieldChanged = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    //入库日期change 入库时间与制表人默认当前
    if (field.full_name == '入库单.入库日期') {
        console.log('入库日期change')
        let username = recordset.user.username;
        let dqdate = (new Date()).format("yyyy-MM-dd");
        console.log(dqdate)
        console.log(username)
        let date = recordset.val('入库日期');
        if (date) {
            recordset.val('入库时间', new Date().format("hh:mm:ss"));
            recordset.val('制 表 人', username)
        } else {
            recordset.val('入库时间', '')
            recordset.val('制 表 人', '')
        }

    }

    var aFullName = ['入库单.入库日期', '入库单.入库时间']
    if (aFullName.indexOf(field.full_name) != -1) {
        //入库日期与入库数据更改 更新子表数据
        var ItemsData = recordset.tables['产品资料'].view_data;
        var modiRidsSet = new Set(recordset.tables['产品资料'].modi_rids);
        var newRidsSet = new Set(recordset.tables['产品资料'].new_rids);

        // 批量修改数据
        for (let data of ItemsData) {
            if (data.ReturnCartonQty > 0) {
                data.ReturnCartonQty = 0;
            }
            if (data.ReturnCartonQty1 > 0) {
                data.ReturnCartonQty1 = 0;
            }
            if (data.ReturnCartonQty2 > 0) {
                data.ReturnCartonQty2 = 0;
            }
            if (data.thyy) {
                data.thyy = '';
            }

            // 关键修正：不是新增记录的，都要加入 modi_rids
            if (!newRidsSet.has(data.rid) && !modiRidsSet.has(data.rid)) {
                modiRidsSet.add(data.rid);
            }
        }

        // 转回数组
        recordset.tables['产品资料'].modi_rids = Array.from(modiRidsSet);
        recordset.tables['产品资料'].modified = true;
        recordset.tables['产品资料'].cursor = 0;
    }

    if (field.full_name == '入库单.是否进仓') {
        /**根据是否进仓来判断是否允许修改入库日期和入库时间 如果是 则判断当前行的实际箱数是否大于0 如果大于0 则子表入库时间Z更新值的内容为data.rksjz+'\n'+dqdate+';'+String(data.CartonQty)+';'+String(data.CartonQty)
        如果等于0 更新内容为dqdate +';'+String(data.CartonQty)+';'+String(data.CartonQty) 判断是否进仓还需要判断当前子表是否实际箱数全部大于0 如果全部大于则允许进仓 否则不允许**/
        var ckxs = 0;
        var ItemsData = recordset.tables['产品资料'].view_data;
        var modiRidsSet = new Set(recordset.tables['产品资料'].modi_rids);
        var newRidsSet = new Set(recordset.tables['产品资料'].new_rids);

        var username = recordset.user.username;

        var dqdate = (new Date()).format("yyyy-MM-dd");
        if (recordset.val('是否进仓') == '是') {
            recordset.val('输单人员', username);
            recordset.module.field_by_full_name('入库日期').disabled = true;
            recordset.module.field_by_full_name('入库时间').disabled = true;
            for (let data of ItemsData) {
                if (data.CartonQty > 0) {
                    if (data.rksjz == '') {
                        var bz = dqdate + ';' + String(data.CartonQty) + ';' + String(data.CartonQty);
                        data.rksjz = bz;
                    } else {
                        var bz = data.rksjz + '\n' + dqdate + ';' + String(data.CartonQty) + ';' + String(data.CartonQty);
                        data.rksjz = bz;
                    }

                } else {
                    ckxs += 1;
                }


                // 关键修正：不是新增记录的，都要加入 modi_rids
                if (!newRidsSet.has(data.rid) && !modiRidsSet.has(data.rid)) {
                    modiRidsSet.add(data.rid);
                }
            }

            // 转回数组
            recordset.tables['产品资料'].modi_rids = Array.from(modiRidsSet);
            recordset.tables['产品资料'].modified = true;
            recordset.tables['产品资料'].cursor = 0;

        }

        if (ckxs > 0) {
            recordset.val('是否进仓', '否');
            //  recordset.module.field_by_full_name('入库日期').disabled = false;
            //  recordset.module.field_by_full_name('入库时间').disabled = false;
            //  recordset.val('输单人员', '');
            _.ui.error_message('请注意有实际箱数为0，请检查后进仓！');
            return;

        }
        if (recordset.val('是否进仓') == '否') {
            recordset.module.field_by_full_name('入库日期').disabled = false;
            recordset.module.field_by_full_name('入库时间').disabled = false;
            recordset.val('输单人员', '');
        }
    }
    if (field.full_name == '入库单.产品资料.仓库总体积') {
        _.http.post('/api/RavenCloud/select_cangkuzl', {
            "ckmc": recordset.val('仓库名称')

        }).then(res => {
            if (res.code == 1) {
                let jcf = res.data;
                let ckztj = recordset.val('产品资料.仓库总体积');
                let js = (parseFloat(jcf) || 0) * (parseFloat(ckztj) || 0);

                recordset.val('产品资料.进仓费', js);

            } else {
                _.ui.message.error(res.msg);
            }
        });



    }
    if (field.full_name == '入库单.产品资料.退货箱数') {
        if (recordset.val('产品资料.退货箱数') > 0) {
            var wyzd = recordset.val('产品资料.唯一字段');
            var rkrq = recordset.val('入库日期');
            var rksj = recordset.val('入库时间');
            //更新其他模块数据通过py
            _.http.post('/api/Ravencloud/thsj', {
                    "wyzd": wyzd,
                    "rkrq": rkrq,
                    "rksj": rksj

                },
                true).then(res => {
                if (res.code == 1) {
                    console.log('数据处理成功');
                    console.log(res);
                    var sl = 0

                    sl = parseFloat(recordset.val('产品资料.实际箱数')) - parseFloat(res.data);
                    if (parseFloat(recordset.val('产品资料.退货箱数')) > sl) {
                        _.ui.error_message('退货箱数大于剩余库存箱数,请在输入！');
                        recordset.val('产品资料.退货箱数', 0);
                    } else {
                        var hr1 = recordset.val('产品资料.退货原因');
                        var nr = '';

                        _.ui.show_input_dialog('请输入退货原因:', '').then((res) => {
                            console.log(res)
                            if (res) {
                                if (hr1) {
                                    nr = hr1 + ';' + res;
                                } else {
                                    nr = res;
                                }
                            } else {
                                nr = hr1;
                            }
                            console.log('dddddd')
                            console.log(nr)
                            recordset.val('产品资料.退货原因', nr);
                            if (nr) {
                                console.log('我是younger的')
                                _.http.post('/api/RavenCloud/Update_xxck', {
                                    "jcdh": recordset.val('进仓单号'),
                                    "jcrq": recordset.val('进仓日期'),
                                    "gdry": recordset.val('跟单人员'),
                                    "ywry": recordset.val('业务员'),
                                    "sjjc": recordset.val('入库日期'),
                                    "sfjc": recordset.val('是否进仓'),
                                    "name": recordset.user.username,
                                    "hth": recordset.val('外销合同'),
                                    "xs": parseFloat(recordset.val('产品资料.退货箱数')) - parseFloat(recordset.val('产品资料.剩余退货箱数')),
                                    "gcmc": recordset.val('厂商名称'),
                                    "nr": nr,
                                    "cpbh": recordset.val('产品资料.产品编号'),
                                    "uid": recordset.val('uid')

                                }).then(res => {
                                    if (res.code == 1) {
                                        console.log('数据更新成功');

                                    } else {
                                        _.ui.message.error(res.msg);
                                    }
                                });

                            } else {
                                console.log('我是没有younger的')
                                _.ui.error_message('请输入退货原因后在输入!!!');
                                recordset.val('产品资料.退货箱数', 0);
                            }

                        }).catch((err) => {
                            // 如果对话框出错或被取消

                            console.log('对话框取消或出错', err);
                            if (recordset.val('产品资料.退货原因')) {
                                _.http.post('/api/RavenCloud/Update_xxck', {
                                    "jcdh": recordset.val('进仓单号'),
                                    "jcrq": recordset.val('进仓日期'),
                                    "gdry": recordset.val('跟单人员'),
                                    "ywry": recordset.val('业务员'),
                                    "sjjc": recordset.val('入库日期'),
                                    "sfjc": recordset.val('是否进仓'),
                                    "name": recordset.user.username,
                                    "hth": recordset.val('外销合同'),
                                    "xs": parseFloat(recordset.val('产品资料.退货箱数')) - parseFloat(recordset.val('产品资料.剩余退货箱数')),
                                    "gcmc": recordset.val('厂商名称'),
                                    "nr": recordset.val('产品资料.退货原因'),
                                    "cpbh": recordset.val('产品资料.产品编号'),
                                    "uid": recordset.val('uid')

                                }).then(res => {
                                    if (res.code == 1) {
                                        console.log('数据更新成功');

                                    } else {
                                        _.ui.message.error(res.msg);
                                    }
                                });
                            } else {

                                _.ui.error_message('已取消输入退货原因');
                                recordset.val('产品资料.退货箱数', 0);
                            }

                        });



                    }
                } else {
                    _.ui.message.error(res.msg);
                }
            })



        }



    }
    if (field.full_name == '入库单.产品资料.实际箱数') {
        fnsjxs(opts.recordset);
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, evt_rkd_FieldChanged, '入库单')
//修改事件


// const evt_rkd_Beforesave = (evt_id, recordset) => {
//     //主要用于插入库存明细的操作 细节太多 无法一一解释
//     return new Promise((resolve, reject) => {
//         try {
//             var zd = ''
//             recordset.val('修改人员', recordset.user.username);
//             omain = recordset.tables['入库单'].view_data;
   
//             if (recordset.val('唯一字段') == '') {
//                 zd = recordset.val('进仓单号') + recordset.val('入库日期') + recordset.user.username + (new Date()).format("yyyy-MM-dd")
//                 recordset.val('唯一字段', zd);
//             }
//             var path = '';
//             if (recordset.val('是否进仓') == '是') {
//                 if (recordset.val('入库日期') != '' && recordset.val('入库时间') != '') {
//                     var i1 = 0;
//                     var n = new Date().getFullYear();
//                     var now = new Date();
//                     // 如果需要补0（01, 02, 03...）
//                     var y = String(now.getMonth() + 1).padStart(2, '0'); // "02"
//                     var r = String(now.getDate()).padStart(2, '0'); // "11"
//                     var zyh1 = n + y + r;
//                     console.log('----');
//                     console.log(zyh1);
//                     _.http.post('/api/Ravencloud/storagezyh', {
//                             "omain":omain,
//                             "zyh1": zyh1,
//                             "ItemsData": recordset.tables['产品资料'].view_data
//                         },
//                         true).then(res => {
//                         if (res.code == 1) {
//                             console.log('进仓处理成功')
//                             console.log(res.code)
//                             console.log(res.data)
//                             const result = res.data;
//                             if (result.ggxx) {
//                                 recordset.val('超规格信息', result.ggxx);
//                             }

//                             let obj2 = recordset.tables['产品资料'].view_data
//                             let obj1 = result.oShipmentsCostsDetail
//                             for (let oTempData of obj2) {
//                                 for (let oData1 of obj1) {
//                                     if (oTempData.rid == oData1.rid) {
//                                         oTempData.khmc = oData1.khmc
//                                         oTempData.StorageDate = oData1.StorageDate
//                                         oTempData.Cp = oData1.Cp
//                                         oTempData.StorageTime = oData1.StorageTime;
//                                         oTempData.jcrqc = oData1.jcrqc;
//                                         oTempData.Operatorc = oData1.Operatorc
//                                         oTempData.SalesOrderNoc = oData1.SalesOrderNoc;
//                                         oTempData.Exporterc = oData1.Exporterc;
//                                         oTempData.Salesmanc = oData1.Salesmanc;
//                                         oTempData.PurchaseOrderNoc = oData1.PurchaseOrderNoc;
//                                         oTempData.SupplierShortNamec = oData1.SupplierShortNamec;
//                                         oTempData.PurchasingAgentc = oData1.PurchasingAgentc;

//                                         oTempData.Collatorc = oData1.Collatorc;
//                                         oTempData.WarehouseNamec = oData1.WarehouseNamec;
//                                         oTempData.SNIDc = oData1.SNIDc;

//                                         oTempData.sfjcc = oData1.sfjcc;
//                                         oTempData.gdryc = oData1.gdryc;
//                                         oTempData.yzrqc = oData1.yzrqc;
//                                         oTempData.rkddc = oData1.rkddc;
//                                         oTempData.ywpath = oData1.ywpath;
//                                         oTempData.cgpath = oData1.cgpath;
//                                         oTempData.wyzd = oData1.wyzd;

//                                     }



//                                 }
//                                 if ((recordset.tables["产品资料"].modi_rids.indexOf(oTempData.rid) < 0) && (recordset.tables["产品资料"].new_rids.indexOf(oTempData.rid) < 0))
//                                     recordset.tables["产品资料"].modi_rids.push(oTempData.rid)

//                             }

//                             recordset.tables['产品资料'].sync_operate_data();
//                             recordset.tables["产品资料"].modified = true
//                             recordset.tables["产品资料"].cursor = 0;
//                             resolve();
//                         } else {
//                             _.ui.message.error(res.msg);
//                             reject(res.msg);
//                         }
//                     }).catch(err => {
//                         _.ui.message.error('请求失败：' + (err.message || err));
//                         reject(err);
//                     })

//                 } else {
//                     resolve();
//                 }

//             } else {
//                 resolve();
//             }

//         } catch (error) {
//             reject(error);
//         }
//     })
// }

// _.evts.on(_.evtids.RECORD_BEFORE_SAVE, evt_rkd_Beforesave, '入库单')

const rkd_record_load = (evt_id, recordset) => {
    //加载过程中判断有没有人打开 有的话进行提示
    if (recordset.val('是否进仓') == '否') {
        recordset.module.field_by_full_name('输单人员').disabled = false;
        recordset.module.field_by_full_name('入库日期').disabled = false;
        recordset.module.field_by_full_name('入库时间').disabled = false;
    }
    var sb = 1;
    // if (recordset.val('唯一字段') != '') {
    //     _.http.post('/api/Ravencloud/sys_record_lock', {
    //             "rid": recordset.val('rid'),
    //             "name": recordset.user.username,
    //             "wyzd": recordset.val('唯一字段'),
    //             "rkrq": recordset.val('入库日期'),
    //             "rksj": recordset.val('入库时间'),
    //             "zxpd": recordset.val('在线判断'),
    //             "ckmc": recordset.val('仓库名称')

    //         },
    //         true).then(res => {

    //         },
    //         true).then(res => {
    //         if (res.code == 1) {
    //             if (res.data.namelist){
    //                _.ui.error_message('请注意这票有人打开!,打开人:' + res.data);
    //              }
    //              console.log(res.data);
    //             if (res.data.sb='1'){
    //                 if (recordset.val('入库日期')==''|| recordset.val('入库时间')=='')
    //                     recordset.module.field_by_full_name('产品资料.实际箱数').disabled = true;
    //                 recordset.module.field_by_full_name('是否进仓').disabled = true;
    //                 recordset.module.field_by_full_name('可否进仓').disabled = true;
    //                 recordset.module.field_by_full_name('产品资料.是否验货').disabled = true;
    //                 if(recordset.val('是否进仓')=='是'){
    //                     recordset.module.field_by_full_name('输单人员').disabled = true;
    //                     recordset.module.field_by_full_name('入库日期').disabled = true;
    //                     recordset.module.field_by_full_name('入库时间').disabled = true;
    //                 }
    //                 if (res.data.ckyh==1){
    //                      recordset.module.field_by_full_name('产品资料.是否验货').disabled = false;
    //                 }
    //                 if (res.data.ckyh==2){
    //                      recordset.module.field_by_full_name('是否进仓').disabled = false;
    //                      recordset.module.field_by_full_name('可否进仓').disabled = false;
    //                 }
    //             }
    //             console.log(res.data);

    //         } else {
    //             _.ui.message.error(res.msg);
    //         }
    //     })

    // }
    if (recordset.val('唯一字段') != '') {

        if (recordset.val('入库日期') == '' || recordset.val('入库时间') == '')
            recordset.module.field_by_full_name('产品资料.实际箱数').disabled = true;
        recordset.module.field_by_full_name('是否进仓').disabled = true;
        recordset.module.field_by_full_name('可否进仓').disabled = true;
        recordset.module.field_by_full_name('产品资料.是否验货').disabled = true;

        if (recordset.val('是否进仓') == '是') {
            recordset.module.field_by_full_name('输单人员').disabled = true;
            recordset.module.field_by_full_name('入库日期').disabled = true;
            recordset.module.field_by_full_name('入库时间').disabled = true;
        }

        _.http.post('/api/Ravencloud/sys_record_lock', {
                "rid": recordset.val('rid'),
                // "name": recordset.user.username,
                "wyzd": recordset.val('唯一字段'),
                "rkrq": recordset.val('入库日期'),
                "rksj": recordset.val('入库时间'),
                "zxpd": recordset.val('在线判断'),
                "ckmc": recordset.val('仓库名称')

            },

            true).then(res => {
            if (res.code == 1) {
                console.log(res.data);

                if (res.data.ckyh == 1) {
                    recordset.module.field_by_full_name('产品资料.是否验货').disabled = false;
                }
                if (res.data.ckyh == 2) {
                    recordset.module.field_by_full_name('是否进仓').disabled = false;
                    recordset.module.field_by_full_name('可否进仓').disabled = false;
                }

            } else {
                _.ui.message.error(res.msg);
            }
        })



    }




}
// 模块编辑界面记录加载后接挂点
_.evts.on([_.evtids.RECORD_LOAD], rkd_record_load, '入库单')

var fnsjxs = function (recordset) {
    var rkrq = recordset.val('入库日期');
    var rksj = recordset.val('入库时间');
    var sjxs = recordset.val('产品资料.实际箱数');
    var zcxs = recordset.val('产品资料.在仓箱数');
    var zpxs = recordset.val('产品资料.赠品箱数');
    var cgwyzd = recordset.val('产品资料.采购唯一字段');
    var cght = recordset.val('产品资料.采购合同');
    var wyzd = recordset.val('产品资料.唯一字段');
    var ckmc = recordset.val('产品资料.仓库名称');
    var cpbh = recordset.val('产品资料.产品编号');
    var thxs = recordset.val('产品资料.退货箱数');
    console.log('我在执行')


    _.http.post('/api/RavenCloud/Update_SJXS', {
        "rkrq": rkrq,
        "rksj": rksj,
        "sjxs": sjxs,
        "zcxs": zcxs,
        "zpxs": zpxs,
        "cgwyzd": cgwyzd,
        "cght": cght,
        "wyzd": wyzd,
        "ckmc": ckmc,
        "cpbh": cpbh,
        "thxs": thxs
    }).then(res => {
        if (res.code == 1) {
            console.log('你是谁')
            console.log(res.data);
            if (res.data.pd == 'n') {
                if (res.data.sb != 1) {
                    var ckxs = res.data.ckxs;
                    if ((parseFloat(sjxs) || 0) >= (parseFloat(ckxs) || 0)) {
                        recordset.val('产品资料.在仓箱数', (parseFloat(sjxs) || 0) - (parseFloat(ckxs) || 0));
                    } else {
                        _.ui.error_message('请注意实际箱数小于出库箱数，实际箱数变更为出库箱数');
                        recordset.val('产品资料.在仓箱数', 0);
                    }
                    if (res.data.i == 1) {
                        recordset.val('产品资料.实际箱数', (parseFloat(ckxs) || 0));
                    }

                } else {
                    _.ui.error_message('请注意累计实际进仓数大于下单箱数，实际箱数变更0');
                    recordset.val('产品资料.赠品箱数', 0);
                    recordset.val('产品资料.实际箱数', 0);

                }


            } else if (res.data.pd == 'nn') {
                if (res.data.ckxs > 0) {
                    _.ui.error_message('请注意实际箱数小于出库箱数，实际箱数变更为出库箱数');
                    recordset.val('产品资料.实际箱数', (parseFloat(ckxs) || 0));
                }

            }

            console.log('数据更新成功');

        } else {
            _.ui.message.error(res.msg);
        }
    });







}

// 子表记录新建复制后事件
const rkd_table_new_copy_after = (evt_id, table, recordset) => {
    console.log(table)
    if (table.group == "产品资料") {

        recordset.val('产品资料.入库日期', '');
        recordset.val('产品资料.入库时间', '');
        recordset.val('产品资料.进仓日期', '');
        recordset.val('产品资料.唯一字段', '');
        recordset.val('产品资料.进仓日期', '');
        recordset.val('产品资料.唯一字段', '');
        recordset.val('产品资料.实际箱数', 0);
        recordset.val('产品资料.在仓箱数', 0);
        recordset.val('产品资料.入库时间z', '');

    }
    //    if (table.group == "主要信息") {

    //     recordset.val('单据状态', '未入库');


    // }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], rkd_table_new_copy_after, '入库单')

// const rkd_table_delete_before = (evt_id, table, recordset) => {
//     return new Promise((resolve, reject) => {
//         if (table.group != '产品资料') {
//             resolve()
//             return
//         }
//         _.ui.confirm('删除记录将会删除对应的库存明细记录，并且会自动保存，是否继续？').then(() => {
//             _.http.post('/api/RavenCloud/delete_inventorydetail', {
//                 "StorageDate": recordset.val('入库日期'),
//                 "StorageTime": recordset.val('入库时间'),
//                 "wyzd": recordset.val('产品资料.唯一字段'),
//                 "rid": recordset.val('产品资料.rid'),
//             }).then(res => {
//                 recordset.save(false)
//                 resolve();
//                 return
//             }).catch(err => {
//                 console.log(err);
//                 _.ui.message.error(err.msg || '删除记录失败');
//                 reject();
//                 return
//             });
//         }).catch(e=>{
//             reject();
//             return
//         })
//     })
// }
// _.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, rkd_table_delete_before, '入库单')

// const warehouse_receipt_EditFormShow = (evt_id, form) => {
//     // 新增按钮 add,插入按钮 insert,最后参数默认是前面,如果放后面用-1
//     form.toolbar.add([{
//         name: 'confirm_warehouse_receipt',
//         caption: '确认进仓',
//         icon: 'any-house',
//         divided: true,
//     }, ])
//     form.toolbar.add([{
//         name: 'confirm_warehouse_change',
//         caption: '更新库存',
//         icon: 'any-house',
//         divided: true,
//     }, ])
// }
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW], warehouse_receipt_EditFormShow, '入库单')


const warehouse_receipt_EditBtnClick = (evt_id, btn, form) => {
    if (btn.name == 'confirm_warehouse_receipt') {
        if (form.recordset.val('单据状态') == '已入库') {
            _.ui.error_message('单据已入库，无需重复操作');
            return;
        }
        // if (form.recordset.val('是否进仓') == '否') {
        //     _.ui.error_message('当前入库单为不可进仓，无法执行入库操作');
        //     return;
        // }
        if (form.recordset.val('入库日期') == '' || form.recordset.val('入库时间') == '') {
            _.ui.error_message('当前入库单入库日期为空，无法执行入库操作');
            return;
        }

        // 添加确认对话框
        _.ui.confirm('确认货物已清点完毕，执行入库操作？此操作将更新库存！').then(() => {
            // 用户点击确认后执行以下代码
            var zd = ''

            var jcdh = form.recordset.val('进仓单号');
            var jcrq = form.recordset.val('进仓日期');
            var gdry = form.recordset.val('跟单人员');
            var ywry = form.recordset.val('业务员');
            var sjjc = form.recordset.val('入库日期');
            var sfjc = form.recordset.val('是否进仓');
            var khmc = form.recordset.val('客户名称');
            var rkrq = form.recordset.val('入库日期');
            var rksj = form.recordset.val('入库时间');
            var jcrq = form.recordset.val('进仓日期');
            var sdry = form.recordset.val('输单人员');
            var wxht = form.recordset.val('外销合同');
            var gsmc = form.recordset.val('公司名称');
            var cght = form.recordset.val('采购合同');
            var csmc = form.recordset.val('厂商名称');
            var cgy = form.recordset.val('采购员');
            var lhy = form.recordset.val('理货员');
            var ckmc = form.recordset.val('仓库名称');
            var yzrq = form.recordset.val('预装日期');
            var rkdd = form.recordset.val('入库地点');
            console.log('点击了确认进仓按钮')
            let products_detail = form.recordset.tables['产品资料']

            // 验证实际箱数字段 CartonQty 是否为 0
            if (products_detail && products_detail.view_data) {
                for (let i = 0; i < products_detail.view_data.length; i++) {
                    let row = products_detail.view_data[i]
                    if (row.CartonQty === 0 || row.CartonQty === '0') {
                        _.ui.error_message('存在实际箱数为0的产品，无法完成进仓，请仔细核查数据');
                        return
                    }
                }
            } else {
                _.ui.error_message('请先填写产品资料信息');
                return
            }

            let detail_view_data = products_detail.view_data
            let PurchaseOrderNo = form.recordset.val('采购合同')
            let rid = form.recordset.val('rid')
            let errorcount = 0
            var i1 = 0;
            var n = new Date().getFullYear();
            var now = new Date();
            var y = String(now.getMonth() + 1).padStart(2, '0');
            var r = String(now.getDate()).padStart(2, '0');
            var zyh1 = n + y + r;
            console.log('----');
            console.log(zyh1);

            _.http.post('/api/saier/warehouse_receipt/historical/instock', {
                    "PurchaseOrderNo": PurchaseOrderNo,
                    "rid": rid,
                    "detail_view_data": detail_view_data,
                    "zyh": form.recordset.val('作 业 号'),
                    "zyh1": zyh1,
                    "ywry": ywry,
                    "name": form.recordset.user.username,
                    "cgy": form.recordset.val('采购员'),
                    "ItemsData": form.recordset.tables['产品资料'].view_data,
                    "rkrq": rkrq,
                    "rksj": rksj,
                    "jcrq": jcrq,
                    "sdry": sdry,
                    "wxht": wxht,
                    "gsmc": gsmc,
                    "ywy": ywry,
                    "cght": cght,
                    "csmc": csmc,
                    "cgy": cgy,
                    "lhy": lhy,
                    "ckmc": ckmc,
                    "jcdh": jcdh,
                    "sfjc": sfjc,
                    "gdyr": gdry,
                    "yzrq": yzrq,
                    "rkdd": rkdd,
                    "username": form.recordset.user.username,
                    "uid": form.recordset.val('uid'),
                    "wyzdzb": form.recordset.val('唯一字段'),
                    "khmc": khmc
                })
                .then((res) => {
                    if (res.code == 1) {
                        console.log('历史入库数据获取成功', res.data)
                        let result = res.data;
                        if (result.path == '') {
                            _.ui.error_message('非仓库出入库管理人员，进仓无效！');
                            return;
                        }
                        console.log('历史入库数据获取成功', res.data)
                        _.ui.message.warning('入库成功！已添加库存明细');

                        let oBillNotifiesLineData = form.recordset.tables['入库单'].view_data;
                        console.log(oBillNotifiesLineData)
                        oBillNotifiesLineData.zt = '已入库'
                        if (form.recordset.val('作 业 号') == '自动编号' || form.recordset.val('作 业 号') == '') {
                            oBillNotifiesLineData.zyh = result.zyh
                        }

                        form.recordset.val('是否进仓','是')
                        form.recordset.save(false)
                    } else if (res.code == 2) {
                        console.log('2', res.data)
                        let result = res.data.errorItems

                        console.log(result)

                        const viewData = form.recordset.tables['产品资料'].view_data;
                        for (const data of viewData) {
                            const rid = data.rid;
                            console.log('当前行rid:', rid);
                            for (let item of result) {
                                console.log('当前行rid1:', item.rid);
                                if (item.rid == rid) {
                                    console.log(item.ErrorType)

                                    if (item.ErrorType == 'BOTH') {
                                        data.CartonQty = 0;
                                        data.zpxs = 0;
                                    } else if (item.ErrorType == 'QTY_ERROR') {
                                        data.CartonQty = data.ckxs;
                                    } else if (item.ErrorType == 'CONTRACT_ERROR') {
                                        console.log('合同错误', item);
                                        data.CartonQty = 0;
                                        data.zpxs = 0;
                                    }
                                }
                            }

                            // 标记修改
                            if (form.recordset.tables['产品资料'].modi_rids.indexOf(data.rid) < 0) {
                                form.recordset.tables['产品资料'].modi_rids.push(data.rid);
                            }
                        }
                        form.recordset.tables['产品资料'].modified = true;
                        _.ui.error_message(res.msg);
                    }
                }).catch((err) => {
                    console.log(err);
                    _.ui.error_message(err.msg || '入库操作失败');
                });
        }).catch(() => {
            // 用户点击取消，不执行任何操作

            console.log('用户取消了入库操作');
        });
    }
    if (btn.name == 'confirm_warehouse_change') {
        if (form.recordset.val('单据状态') != '已入库') {
            _.ui.error_message('单据未入库，请先确认进仓');
            return;
        }

        // 添加确认对话框
        _.ui.confirm('此操作将调整库存明细，请确认！').then(() => {
            // 用户点击确认后执行以下代码
            var zd = ''

            var jcdh = form.recordset.val('进仓单号');
            var jcrq = form.recordset.val('进仓日期');
            var gdry = form.recordset.val('跟单人员');
            var ywry = form.recordset.val('业务员');
            var sjjc = form.recordset.val('入库日期');
            var sfjc = form.recordset.val('是否进仓');
            var khmc = form.recordset.val('客户名称');
            var rkrq = form.recordset.val('入库日期');
            var rksj = form.recordset.val('入库时间');
            var jcrq = form.recordset.val('进仓日期');
            var sdry = form.recordset.val('输单人员');
            var wxht = form.recordset.val('外销合同');
            var gsmc = form.recordset.val('公司名称');
            var cght = form.recordset.val('采购合同');
            var csmc = form.recordset.val('厂商名称');
            var cgy = form.recordset.val('采购员');
            var lhy = form.recordset.val('理货员');
            var ckmc = form.recordset.val('仓库名称');
            var yzrq = form.recordset.val('预装日期');
            var rkdd = form.recordset.val('入库地点');
            console.log('点击了确认进仓按钮')
            let products_detail = form.recordset.tables['产品资料']

            // 验证实际箱数字段 CartonQty 是否为 0
            if (products_detail && products_detail.view_data) {
                for (let i = 0; i < products_detail.view_data.length; i++) {
                    let row = products_detail.view_data[i]
                    if (row.CartonQty === 0 || row.CartonQty === '0') {
                        _.ui.error_message('存在实际箱数为0的产品，无法完成进仓，请仔细核查数据');
                        return
                    }
                }
            } else {
                _.ui.error_message('请先填写产品资料信息');
                return
            }

            let detail_view_data = products_detail.view_data
            let PurchaseOrderNo = form.recordset.val('采购合同')
            let rid = form.recordset.val('rid')
            let errorcount = 0
            var i1 = 0;
            var n = new Date().getFullYear();
            var now = new Date();
            var y = String(now.getMonth() + 1).padStart(2, '0');
            var r = String(now.getDate()).padStart(2, '0');
            var zyh1 = n + y + r;
            console.log('----');
            console.log(zyh1);

            _.http.post('/api/saier/warehouse_receipt/historical/instockchange', {
                    "PurchaseOrderNo": PurchaseOrderNo,
                    "rid": rid,
                    "detail_view_data": detail_view_data,
                    "zyh": form.recordset.val('作 业 号'),
                    "zyh1": zyh1,
                    "ywry": ywry,
                    "name": form.recordset.user.username,
                    "cgy": form.recordset.val('采购员'),
                    "ItemsData": form.recordset.tables['产品资料'].view_data,
                    "rkrq": rkrq,
                    "rksj": rksj,
                    "jcrq": jcrq,
                    "sdry": sdry,
                    "wxht": wxht,
                    "gsmc": gsmc,
                    "ywy": ywry,
                    "cght": cght,
                    "csmc": csmc,
                    "cgy": cgy,
                    "lhy": lhy,
                    "ckmc": ckmc,
                    "jcdh": jcdh,
                    "sfjc": sfjc,
                    "gdyr": gdry,
                    "yzrq": yzrq,
                    "rkdd": rkdd,
                    "username": form.recordset.user.username,
                    "uid": form.recordset.val('uid'),
                    "wyzdzb": form.recordset.val('唯一字段'),
                    "khmc": khmc
                })
                .then((res) => {
                    if (res.code == 1) {
                        console.log('历史入库数据获取成功', res.data)
                        let result = res.data;
                        if (result.path == '') {
                            _.ui.error_message('非仓库出入库管理人员，更新无效！');
                            return;
                        }
                        console.log('历史入库数据获取成功', res.data)
                        _.ui.message.warning('入库单修改成功，已更新库存明细');


                    } else if (res.code == 2) {
                        console.log('2', res.data)
                        let result = res.data.errorItems

                        console.log(result)

                        const viewData = form.recordset.tables['产品资料'].view_data;
                        for (const data of viewData) {
                            const rid = data.rid;
                            console.log('当前行rid:', rid);
                            for (let item of result) {
                                console.log('当前行rid1:', item.rid);
                                if (item.rid == rid) {
                                    console.log(item.ErrorType)

                                    if (item.ErrorType == 'BOTH') {
                                        data.CartonQty = 0;
                                        data.zpxs = 0;
                                    } else if (item.ErrorType == 'QTY_ERROR') {
                                        data.CartonQty = data.ckxs;
                                    } else if (item.ErrorType == 'CONTRACT_ERROR') {
                                        console.log('合同错误', item);
                                        data.CartonQty = 0;
                                        data.zpxs = 0;
                                    }
                                }
                            }

                            // 标记修改
                            if (form.recordset.tables['产品资料'].modi_rids.indexOf(data.rid) < 0) {
                                form.recordset.tables['产品资料'].modi_rids.push(data.rid);
                            }
                        }
                        form.recordset.tables['产品资料'].modified = true;

                        _.ui.error_message(res.msg);
                    }
                })
        }).catch(() => {
            // 用户点击取消，不执行任何操作
            console.log('用户取消了入库操作');
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], warehouse_receipt_EditBtnClick, '入库单')


const deleteWarehouseReceipt = (evt_id, rid, form, recordset) => {
    //  - 对于宁波仓库的入库单，若当前用户是单据的跟单人员，则该用户有删除入库单的权限。
    //   2. 删除规则：
    //   - 对于宁波仓库的入库单，若当前用户是单据的跟单人员，则该用户有删除入库单的权限。
    //   - 对于义乌/汕头仓库的入库单，若仓库人员未查看过该入库单，则跟单人员可以在【采购跟单】模块取消进仓；若义乌/汕头的仓库人员已经查看过此入库单，则跟单人员没有取消进仓的权限，只能联系仓库人员删除。
    //   - 若当前用户是仓库人员，则需要判断累计出库箱数（出库单表）是否大于0，若大于0则禁止仓库人员删除该入库单据，提示“累计出库箱数大于0，不能删除入库单据”，否则允许删除单据。
    // 3. 删除时，必须弹出提醒消息，用户选择是否确认删除。
    //   1. 单条删除：用户点击列表右侧操作栏的“删除”按钮或者只选择了一行点击列表上方“删除”按钮时，确认提示：“您确认删除作业号为{xxx}的入库单吗？”。其中，{xxx}替换为对应的作业号。
    //   2. 批量删除：用户勾选列表行后，点击列表上方的”删除“按钮弹出确认框，提示：“您选中了{x}条单据，确认全部删除吗？”。其中，{x}表示用户选择的行数。
    // 4. 用户点击“确认”后，执行逻辑删除并刷新列表，包括对应的库存明细表中的记录删掉。
    return new Promise((resolve, reject) => {
        _.http.post('/api/Ravencloud/get_ckpath', {
            rid: rid
        }).then(res => {
            resolve();
            return
        }).catch(err => {
            console.error('删除入库单失败', err);
            _.ui.error_message('删除入库单失败：' + (err.msg || '未知错误'));
            reject();
            return
        })
    })
}

_.evts.on([_.evtids.RECORD_BEFORE_DELETE], deleteWarehouseReceipt, '入库单')


const rkdr_recordset_copy_after = (evt_id, recordset) => {
    recordset.val('单据状态', '草稿');
    recordset.val('入库日期', '');
    recordset.val('入库时间', '');
    recordset.val('作 业 号', '');
    recordset.val('输单人员', _.user.username);
    recordset.val('制 表 人', _.user.username);
    recordset.val('修改人员', _.user.username);
}


_.evts.on([_.evtids.RECORD_AFTER_COPY], rkdr_recordset_copy_after, '入库单')

// // 入库单 - 完全根据单据状态判断的 BeforeSave 事件
// const evt_rkd_Beforesave = (evt_id, recordset) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const djzt = recordset.val('单据状态');
//            // 定义要检查的字段
//            const fields = [{
//                    name: '仓库名称',
//                    value: recordset.val('仓库名称')
//                },
//                {
//                    name: '进仓单号',
//                    value: recordset.val('进仓单号')
//                },
//                {
//                    name: '采购合同',
//                    value: recordset.val('采购合同')
//                }
//            ];

//            // 找出为空的字段
//            const emptyFields = fields.filter(f => !f.value).map(f => f.name);

//            if (emptyFields.length > 0) {
//                _.ui.message.error(`${emptyFields.join('、')}不能为空`);
//                reject();
//                return;
//            }




//            // 未入库状态，执行入库流程
//            if (!recordset.val('入库日期') || !recordset.val('入库时间')) {
//                _.ui.message.error('入库日期和时间不能为空');
//                reject('日期为空');
//                return;
//            }
            
//             // 验证产品资料
//             const products = recordset.tables['产品资料'];
//             if (!products || !products.view_data || products.view_data.length === 0) {
//                 _.ui.message.error('请先填写产品资料信息');
//                 reject('无产品资料');
//                 return;
//             }
            
//             for (let row of products.view_data) {
//                 if (!row.CartonQty || row.CartonQty == 0) {
//                     _.ui.message.error('存在实际箱数为0的产品，无法完成进仓');
//                     reject('实际箱数为0');
//                     return;
//                 }
//             }

//                   // 如果已是已入库，且用户只是普通修改（非库存相关），直接保存
//             // 需要通过对话框确认是否更新库存
//             if (djzt === '已入库') {
//                 // 检查是否有库存相关字段的修改
//                 const products = recordset.tables['产品资料'];
//                 const products1= recordset.tables['入库单'];
//                 console.log(products1);
//                 const hasModified = products && products.modified || products1 && products1.modified;
                
//                 if (!hasModified) {
//                     // 没有修改产品资料，普通保存
//                     resolve();
//                     return;
//                 }
                
//                 // 有修改，提示是否更新库存
//                 _.ui.confirm('单据已入库，是否同步更新库存明细？').then(() => {
//                     doInstockApi().then(resolve).catch(reject);
//                 }).catch(() => {
//                     // 用户选择不更新库存，只保存单据
//                     resolve();
//                 });
//                 return;
//             }
            
//             _.ui.confirm('确认货物已清点完毕，执行入库操作？').then(() => {
//                 doInstockApi().then(resolve).catch(reject);
//             }).catch(() => {
//                 reject('用户取消');
//             });
            
//             // 调用后端API
//             function doInstockApi() {
//                 return new Promise((apiResolve, apiReject) => {
//                     const now = new Date();
//                     const zyh1 = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
                    
//                     const products = recordset.tables['产品资料'];
//                     const products1= recordset.tables['入库单'];
//                     _.http.post('/api/saier/warehouse_receipt/historical/instock', {
//                         "products1":products1.view_data,
//                         "detail_view_data": products.view_data,
//                         "zyh1": zyh1
             
//                     }).then((res) => {
//                         console.log('ddddd')
//                         console.log(res);
//                         if (res.code === 1) {
//                             handleSuccess(res.data);
//                             apiResolve();
//                         } else if (res.code === 2) {
//                             handleError(res.data, res.msg);
//                             apiReject('验证失败');
//                         } else {
//                             _.ui.message.error(res.msg || '操作失败');
//                             apiReject(res.msg);
//                         }
//                     }).catch((err) => {
//                         _.ui.message.error(err.msg || '请求失败');
//                         apiReject(err);
//                     });
//                 });
//             }
            
//             // 处理成功
//             function handleSuccess(data) {
//                 if (!data.path) {
//                     _.ui.message.error('非仓库出入库管理人员，操作无效！');
//                     reject('无权限');
//                     return;
//                 }
                
//                 // 回填子表数据
//                 const obj2 = recordset.tables['产品资料'].view_data;
//                 const obj1 = data.oShipmentsCostsDetail || [];
                
//                 for (let oTempData of obj2) {
//                     for (let oData1 of obj1) {
//                         if (oTempData.rid === oData1.rid) {
//                             Object.assign(oTempData, {
//                                 khmc: oData1.khmc,
//                                 StorageDate: oData1.StorageDate,
//                                 StorageTime: oData1.StorageTime,
//                                 jcrqc: oData1.jcrqc,
//                                 Operatorc: oData1.Operatorc,
//                                 SalesOrderNoc: oData1.SalesOrderNoc,
//                                 Exporterc: oData1.Exporterc,
//                                 Salesmanc: oData1.Salesmanc,
//                                 PurchaseOrderNoc: oData1.PurchaseOrderNoc,
//                                 SupplierShortNamec: oData1.SupplierShortNamec,
//                                 PurchasingAgentc: oData1.PurchasingAgentc,
//                                 Collatorc: oData1.Collatorc,
//                                 WarehouseNamec: oData1.WarehouseNamec,
//                                 SNIDc: oData1.SNIDc,
//                                 sfjcc: oData1.sfjcc,
//                                 gdryc: oData1.gdryc,
//                                 yzrqc: oData1.yzrqc,
//                                 rkddc: oData1.rkddc,
//                                 ywpath: oData1.ywpath,
//                                 cgpath: oData1.cgpath,
//                                 wyzd: oData1.wyzd
//                             });
//                         }
//                     }
                    
//                     const modiRids = recordset.tables["产品资料"].modi_rids;
//                     const newRids = recordset.tables["产品资料"].new_rids;
//                     if (modiRids.indexOf(oTempData.rid) < 0 && newRids.indexOf(oTempData.rid) < 0) {
//                         modiRids.push(oTempData.rid);
//                     }
//                 }
                
//                 recordset.tables['产品资料'].sync_operate_data();
//                 recordset.tables["产品资料"].modified = true;
//                 recordset.tables["产品资料"].cursor = 0;
                
//                 // 设置超规格信息
//                 if (data.ggxx) {
//                     recordset.val('超规格信息', data.ggxx);
//                 }
                
//                 // 首次入库更新状态
//                 if (recordset.val('单据状态') !== '已入库') {
//                     if (recordset.val('作 业 号') === '自动编号' || !recordset.val('作 业 号')) {
//                         recordset.val('作 业 号', data.zyh);
//                     }
//                     recordset.val('单据状态', '已入库');
//                     recordset.val('是否进仓', '是');
//                     _.ui.message.success('入库成功！已添加库存明细');
//                 } else {
//                     _.ui.message.success('库存更新成功！');
//                 }
//             }
            
//             // 处理错误
          
//             function handleError(data,errorMsg) {
//                 console.log('error', data);
//                 const result = data.errorItems || [];
//                 const viewData = recordset.tables['产品资料'].view_data;
                
//                 for (const row of viewData) {
//                     for (let item of result) {
//                         if (item.rid === row.rid) {
//                             if (item.ErrorType === 'BOTH' || item.ErrorType === 'CONTRACT_ERROR') {
//                                 row.CartonQty = 0;
//                                 row.zpxs = 0;
//                             } else if (item.ErrorType === 'QTY_ERROR') {
//                                 row.CartonQty = row.ckxs || 0;
//                             }
//                         }
//                     }
                    
//                     const modiRids = recordset.tables["产品资料"].modi_rids;
//                     if (modiRids.indexOf(row.rid) < 0) {
//                         modiRids.push(row.rid);
//                     }
//                 }
                
//                 recordset.tables['产品资料'].modified = true;
//                 _.ui.error_message(errorMsg);
//             }
            
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

// // 只注册保存前事件，不需要按钮事件
// _.evts.on(_.evtids.RECORD_BEFORE_SAVE, evt_rkd_Beforesave, '入库单');
const evt_rkd_BeforeSavenew = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        const fields = [{
                name: '仓库名称',
                value: recordset.val('仓库名称')
            },
            {
                name: '进仓单号',
                value: recordset.val('进仓单号')
            },
            {
                name: '采购合同',
                value: recordset.val('采购合同')
            }
        ];

        // 找出为空的字段
        const emptyFields = fields.filter(f => !f.value).map(f => f.name);

        if (emptyFields.length > 0) {
            _.ui.message.error(`${emptyFields.join('、')}不能为空`);
            reject();
            return;
        }


        //            // 未入库状态，执行入库流程
        if (!recordset.val('入库日期') || !recordset.val('入库时间')) {
            _.ui.message.error('入库日期和时间不能为空');
            reject('日期为空');
            return;
        }

        // 验证产品资料
        const products = recordset.tables['产品资料'];
        if (!products || !products.view_data || products.view_data.length === 0) {
            _.ui.message.error('请先填写产品资料信息');
            reject('无产品资料');
            return;
        }

        for (let row of products.view_data) {
            if ((!row.CartonQty || row.CartonQty == 0) && recordset.val('是否进仓') == '是') {
                _.ui.message.error('存在实际箱数为0的产品，无法完成进仓');
                reject();
                return;
            }
        }
        recordset.val('修改人员', recordset.user.username);
        if (recordset.val('唯一字段') == '') {
            zd = recordset.val('进仓单号') + recordset.val('入库日期') + recordset.user.username + (new Date()).format("yyyy-MM-dd")
            recordset.val('唯一字段', zd);
        }
        const djzt = recordset.val('单据状态');


        const products1 = recordset.tables['入库单'];
        if (recordset.val('是否进仓') == '是') {
            if (recordset.val('入库日期') != '' && recordset.val('入库时间') != '') {
                const now = new Date();
                const zyh1 = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
                _.http.post('/api/saier/warehouse_receipt/historical/instock', {
                    "products1": products1.view_data,
                    "detail_view_data": products.view_data,
                    "ItemsData": products.view_data,
                    "zyh1": zyh1,
                    "PurchaseOrderNo": recordset.val('采购合同'),
                }).then(res => {
                    console.log(res);
                    if (res.code == 1) {
                        if (res.data.path == '') {
                            _.ui.message.error('非仓库出入库管理人员，操作无效！');
                            reject('无权限');
                            return;
                        }
                        // 回填子表数据
                        const obj2 = recordset.tables['产品资料'].view_data;
                        const obj1 = res.data.oShipmentsCostsDetail || [];

                        for (let oTempData of obj2) {
                            for (let oData1 of obj1) {
                                if (oTempData.rid === oData1.rid) {
                                    Object.assign(oTempData, {
                                        khmc: oData1.khmc,
                                        StorageDate: oData1.StorageDate,
                                        StorageTime: oData1.StorageTime,
                                        jcrqc: oData1.jcrqc,
                                        Operatorc: oData1.Operatorc,
                                        SalesOrderNoc: oData1.SalesOrderNoc,
                                        Exporterc: oData1.Exporterc,
                                        Salesmanc: oData1.Salesmanc,
                                        PurchaseOrderNoc: oData1.PurchaseOrderNoc,
                                        SupplierShortNamec: oData1.SupplierShortNamec,
                                        PurchasingAgentc: oData1.PurchasingAgentc,
                                        Collatorc: oData1.Collatorc,
                                        WarehouseNamec: oData1.WarehouseNamec,
                                        SNIDc: oData1.SNIDc,
                                        sfjcc: oData1.sfjcc,
                                        gdryc: oData1.gdryc,
                                        yzrqc: oData1.yzrqc,
                                        rkddc: oData1.rkddc,
                                        ywpath: oData1.ywpath,
                                        cgpath: oData1.cgpath,
                                        wyzd: oData1.wyzd
                                    });
                                }
                            }

                            const modiRids = recordset.tables["产品资料"].modi_rids;
                            const newRids = recordset.tables["产品资料"].new_rids;
                            if (modiRids.indexOf(oTempData.rid) < 0 && newRids.indexOf(oTempData.rid) < 0) {
                                modiRids.push(oTempData.rid);
                            }
                        }

                        recordset.tables['产品资料'].sync_operate_data();
                        recordset.tables["产品资料"].modified = true;
                        recordset.tables["产品资料"].cursor = 0;
                        // 设置超规格信息
                        if (res.data.ggxx) {
                            recordset.val('超规格信息', res.data.ggxx);
                        }
                        _.ui.message.success('库存更新成功！');
                        resolve();
                    } else if (res.code == 2) {
                        console.log('error', res.data);
                        const result = res.data.errorItems || [];
                        const viewData = recordset.tables['产品资料'].view_data;


                        for (const row of viewData) {
                            for (let item of result) {
                                if (item.rid === row.rid) {
                                    if (item.ErrorType === 'BOTH' || item.ErrorType === 'CONTRACT_ERROR') {
                                        row.CartonQty = 0;
                                        row.zpxs = 0;
                                    } else if (item.ErrorType === 'QTY_ERROR') {
                                        row.CartonQty = row.ckxs || 0;
                                    }
                                }
                            }

                            const modiRids = recordset.tables["产品资料"].modi_rids;
                            if (modiRids.indexOf(row.rid) < 0) {
                                modiRids.push(row.rid);
                            }
                        }

                        recordset.tables['产品资料'].modified = true;

                        _.ui.error_message(res.msg);
                        reject();

                    } else {
                        _.ui.message.error(res.msg || '操作失败');
                        reject(res.msg);
                    }

                }).catch(res => {
                    reject(_l(res.msg))
                })
            }

        } else {
            resolve();
        }

    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, evt_rkd_BeforeSavenew, '入库单')