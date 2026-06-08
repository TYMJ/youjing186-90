// const evt_ckd_FieldChanged = (evt_id, opts) => {
//     let {
//         recordset,
//         module,
//         field,
//         value,
//         old_value
//     } = opts;
//     //是否完成判断字段
//     if (field.full_name == '出库单.是否完成') {
//         if (recordset.val('出库单.是否完成') == '是') {
//             recordset.val('修改人员', recordset.user.username)
//             if (recordset.val('出库单.费用生成') != '是') {
//                 recordset.module.field_by_full_name('费用生成').disabled = false;
//             }

//         } else {
//             if (recordset.val('出库单.费用生成') != '是') {
//                 recordset.module.field_by_full_name('费用生成').disabled = false;
//             }

//         }


//     }
//     //箱号、封号改变
//     var aFullName = ['出库单.箱  号', '出库单.封  号']
//     if (aFullName.indexOf(field.full_name) != -1) {
//         var xh = recordset.val('出库单.箱  号');
//         var fh = recordset.val('出库单.封  号');

//         // 检查箱号长度

//         if (xh) {
//             if (xh.length !== 11) {
//                 _.ui.error_message('箱号必须是11个字符！当前为' + xh.length + '个字符');

//             } else {
//                 var cd = xh + '/' + fh;
//                 recordset.val('出库单.箱封号', cd);
//             }
//         }

//     }
//     //是否散货 发票号码数据填充
//     if (field.full_name == '出库单.是否散货') {
//         if (recordset.val('出库单.是否散货') == '是') {
//             recordset.val('发票号码', '散货' + recordset.user.username + (new Date()).format("yyyy-MM-dd hh:mm:ss"))
//         } else {
//             recordset.val('发票号码', '')
//         }
//     }
//     if (field.full_name == '出库单.发票号码') {
//         if (recordset.val('出库单.发票号码') != '' && recordset.val('出库单.是否散货') == '否') {
//             _.http.post('/api/Ravencloud/Select_wxht', {
//                     "fphm": recordset.val('发票号码')

//                 },

//                 true).then(res => {
//                 if (res.code == 1) {
//                     if (res.data == '') {
//                         _.ui.error_message('此发票号不存在请查证无误后与业务人员联系！');
//                         recordset.val('出库单.发票号码', '')
//                     }

//                 }
//             })
//         }

//     }
//     if (field.full_name == '出库单.装柜日期') {
//         if (recordset.val('出库单.装柜日期') != '') {
//             recordset.val('出库单.出库日期', recordset.val('出库单.装柜日期'));
//             var DeliveryDate = recordset.val('装柜日期');


//             var oSalesOrderslineData = recordset.tables["产品资料"].view_data;
//             for (let line_row of oSalesOrderslineData) {
//                 var aDeliveryDate = line_row["ckrq"];
//                 if (aDeliveryDate != DeliveryDate) {
//                     line_row["ckrq"] = DeliveryDate;
//                     if (recordset.tables["产品资料"].modi_rids.indexOf(line_row["rid"]) < 0) {
//                         recordset.tables["产品资料"].modi_rids.push(line_row["rid"])
//                     }
//                 }
//                 if (recordset.tables["产品资料"].modi_rids.length > 0) {
//                     recordset.tables["产品资料"].modified = true;
//                 }
//             }



//         }

//     }
//     var aFullName = ['出库单.产品资料.出库日期', '出库单.产品资料.入库日期', '出库单.产品资料.出库总体积']
//     if (aFullName.indexOf(field.full_name) != -1) {
//         var ckrq = recordset.val('出库单.产品资料.出库日期');
//         var rkrq = recordset.val('出库单.产品资料.入库日期');
//         var cktj = recordset.val('出库单.产品资料.出库总体积');
//         var ckrqYear2 = ckrq ? ckrq.slice(0, 4) : '';
//         var rkrqYear2 = rkrq ? rkrq.slice(0, 4) : '';
//         var ckmc = recordset.val('出库单.仓库名称');
//         if ((rkrq != '') && (ckrq != '') && (cktj > 0)) {
//             var start = new Date(rkrq);
//             var end = new Date(ckrq);
//             var days = Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
//             recordset.val('出库单.产品资料.在仓天数', days);
//             _.http.post('/api/Ravencloud/Select_ckfy', {
//                     "ckmc": ckmc,
//                     "days": days,
//                     "ckrq": ckrq,
//                     "tj": cktj
//                 },

//                 true).then(res => {
//                 if (res.code == 1) {
//                     console.log('仓库费用')
//                     recordset.val('产品资料.综合仓库费用', res.data * 100 / 100)

//                 }
//             })




//         }



//     }

//     var aFullName = ['出库单.产品资料.出库箱数.', '出库单.产品资料.退货箱数']
//     if (aFullName.indexOf(field.full_name) != -1) {
//         var cght = recordset.val('产品资料.采购合同');
//         var cpbh = recordset.val('产品资料.产品编号');
//         var rkrq = recordset.val('产品资料.入库日期');
//         var rksj = recordset.val('产品资料.入库时间');
//         var thxs = recordset.val('产品资料.退货箱数');
//         var cks = recordset.val('产品资料.出库箱数');
//         var thzyh = recordset.val('退货作业号');
//         console.log('我执行呢 你知道不知道1')

//         if (cght != '' && cpbh != '' && rkrq != '' && rksj != '' && (thxs > 0 || cks > 0)) {
//             if (thzyh != '' && thxs > 0 && cks == 0) {
//                 console.log('我执行呢 你知道不知道2')
//                 recordset.val('产品资料.出库箱数', thxs);
//                 _.http.post('/api/Ravencloud/Thpd', {
//                         "cght": cght,
//                         "cpbh": cpbh,
//                         "rkrq": rkrq,
//                         "rksj": rksj,
//                         "thxs": thxs
//                     },

//                     true).then(res => {
//                     if (res.code == 1) {
//                         console.log('退货匹配成功');
//                         recordset.val('产品资料.入库箱数', res.data)

//                     }
//                 })
//                 //出库箱数
//                 if (recordset.val('产品资料.出库箱数') > 0) {
//                     if (recordset.val('产品资料.退货箱数') > 0) {
//                         if (recordset.val('产品资料.出库箱数') > recordset.val('产品资料.退货箱数')) {
//                             _.ui.message.error('出库箱数大于退货箱数,请再输入');
//                             recordset.val('产品资料.出库箱数', 0)
//                         }

//                     }
//                     var i2 = 0;
//                     var i3 = 0;

//                     _.http.post('/api/Ravencloud/choose_pd', {
//                             "cght": cght,
//                             "cpbh": cpbh,
//                             "rkrq": rkrq,
//                             "rksj": rksj,
//                             "wyzd1": recordset.val('产品资料.出库唯一字段')
//                         },

//                         true).then(res => {
//                         if (res.code == 1) {
//                             console.log('退货匹配成功');
//                             i2 = (parseFloat(recordset.val('产品资料.入库箱数')) || 0) - (parseFloat(res.data) || 0);
//                             if (i2 > 0) {
//                                 recordset.val('产品资料.在仓箱数1', i2)
//                                 i3 = (parseFloat(i2) || 0) - (parseFloat(recordset.val('产品资料.出库箱数')) || 0);
//                                 if (i3 > 0) {
//                                     recordset.val('产品资料.库存箱数', i3);
//                                     recordset.val('产品资料.在仓箱数', i3);
//                                     recordset.val('产品资料.前出库箱数', res.data);
//                                 } else {
//                                     _.ui.message.error('出库总箱数大于入库箱数,请检查后输入');
//                                     recordset.val('产品资料.出库箱数', 0)
//                                 }
//                             } else {
//                                 _.ui.message.error('出库总箱数大于入库箱数,请检查后输入');
//                                 recordset.val('产品资料.出库箱数', 0)
//                             }


//                             // recordset.val('产品资料.入库箱数', res.data)

//                         }
//                     })


//                 }
//             }

//         }

//     }
//     // if (field.full_name == '出库单.费用生成') {
//     // var sb = '';
//     // if (recordset.val('出库单.费用生成') == '是') {
//     //     if (recordset.val('出库单.人员') == '人员') {
//     //         _.ui.message.error('有无权删除产品资料信息，不能生成费用!!!');
//     //         recordset.val('出库单.费用生成', '否');
//     //     }else{
//     //         if (recordset.val('箱  号')=='' && recordset.val('申请类型')!='散货运费') {
//     //              _.ui.message.error('请箱号没填且申请类型非散货运费，请修正!');
//     //              recordset.val('出库单.费用生成', '否');
//     //         }else{

//     //         }

//     //     }

//     // }


//     // }

//     // 费用生成字段变更处理 - 在 evt_ckd_FieldChanged 中添加
//     // 费用生成字段变更处理
//     if (field.full_name == '出库单.费用生成') {
//         if (recordset.val('出库单.费用生成') == '是') {
//             // 验证：人员权限检查
//             if (recordset.val('出库单.人员') == '人员') {
//                 _.ui.message.error('有无权删除产品资料信息，不能生成费用!');
//                 recordset.val('出库单.费用生成', '否');
//                 return;
//             }

//             // 验证：箱号检查
//             const xh = recordset.val('出库单.箱  号');
//             const sqlx = recordset.val('出库单.申请类型');
//             if (!xh && sqlx !== '散货运费') {
//                 _.ui.message.error('请箱号没填且申请类型非散货运费，请修正!');
//                 recordset.val('出库单.费用生成', '否');
//                 return;
//             }

//             // 收集表单数据
//             const formData = {
//                 ckdh: recordset.val('出库单.出库单号') || '',
//                 sqdh: recordset.val('出库单.申请单号') || '',
//                 sqlx: sqlx || '',
//                 fylb: recordset.val('出库单.费用类别') || '',
//                 sfsh: recordset.val('出库单.是否散货') || '',
//                 warehouseName: recordset.val('出库单.仓库名称') || '',
//                 stuffingDate: recordset.val('出库单.装柜日期') || '',
//                 zchm: recordset.val('出库单.装车货名') || '',
//                 containerNo: xh || '',
//                 sealNo: recordset.val('出库单.封  号') || '',
//                 salesman: recordset.val('出库单.业务员') || '',
//                 ywbm: recordset.val('出库单.业务部门') || '',
//                 cph: recordset.val('出库单.车 牌 号') || '',
//                 yflx: recordset.val('出库单.运费路线') || '',
//                 zgfy: parseFloat(recordset.val('出库单.装柜费用')) || 0,
//                 jcfy: parseFloat(recordset.val('出库单.进仓费用')) || 0,
//                 gbf: parseFloat(recordset.val('出库单.过 磅 费')) || 0,
//                 yf: parseFloat(recordset.val('出库单.运   费')) || 0,
//                 qtfy: parseFloat(recordset.val('出库单.其它费用')) || 0,
//                 fyhj: parseFloat(recordset.val('出库单.费用合计')) || 0,
//                 zggr: recordset.val('出库单.装柜工人') || '',
//                 loadingSupervi: recordset.val('出库单.监装人员') || '',
//                 zjjz: recordset.val('出库单.质检监装') || '',
//                 ckfybz: recordset.val('出库单.仓库费用备注') || '',
//                 sfkp: recordset.val('出库单.是否开票') || '',
//                 wxfp: recordset.val('出库单.发票号码') || '',
//                 khmc: recordset.val('出库单.客户名称') || '',
//                 tyb: recordset.val('出库单.托 运 部') || '',
//                 ckfy: parseFloat(recordset.val('出库单.综合仓库费用')) || 0,
//                 totalCartons: parseInt(recordset.val('出库单.箱数合计')) || 0,
//                 totalVolumn: parseFloat(recordset.val('出库单.体积合计')) || 0,
//                 userName: recordset.user.username,
//                 uid: recordset.val('uid')
//             };

//             // 调用后端API生成费用
//             _.http.post('/api/ravencloud/generate_ckzgfy', formData, true)
//                 .then(res => {
//                     if (res.code == 1) {
//                         // 更新单号
//                         if (res.data.ckdh) {
//                             recordset.val('出库单.出库单号', res.data.ckdh);
//                         }
//                         if (res.data.sqdh) {
//                             recordset.val('出库单.申请单号', res.data.sqdh);
//                         }
//                         // 禁用费用生成字段
//                         recordset.module.field_by_full_name('费用生成').disabled = true;
//                         _.ui.message.success('费用生成成功!');
//                     } else if (res.code == 0 && res.data && res.data.conflict) {
//                         _.ui.message.error('请注意有人同时提交，请重新提交!');
//                         recordset.val('出库单.申请单号', '');
//                         recordset.module.field_by_full_name('费用生成').disabled = false;
//                         recordset.val('出库单.费用生成', '否');
//                     } else {
//                         _.ui.message.error(res.msg || '费用生成失败');
//                         recordset.val('出库单.费用生成', '否');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('费用生成错误:', error);
//                     _.ui.message.error('费用生成失败: ' + error.message);
//                     recordset.val('出库单.费用生成', '否');
//                 });
//         }
//     }

// }
// _.evts.on(_.evtids.RECORD_FIELD_CHANGED, evt_ckd_FieldChanged, '出库单')
// //加载事件
// const ckd_record_load = (evt_id, recordset) => {
//     if (recordset.val('出库单.仓库名称') == '') {
//         recordset.module.field_by_full_name('仓库名称').disabled = false;
//     } else {
//         recordset.module.field_by_full_name('仓库名称').disabled = true;
//     }
//     if (recordset.val('出库单.是否完成') != '是') {

//         recordset.module.field_by_full_name('费用生成').disabled = true;
//     } else {
//         recordset.module.field_by_full_name('是否完成').disabled = true;
//     }
//     if (recordset.val('出库单.费用生成') == '是') {
//         recordset.module.field_by_full_name('费用生成').disabled = true;
//     }


// }
// // 模块编辑界面记录加载后接挂点
// _.evts.on([_.evtids.RECORD_LOAD], ckd_record_load, '出库单')

// const evt_ckd_FormShow = (evt_id, form) => {
//     if (form.is_editor) {
//         form.toolbar.insert({
//             "name": 'shujusuaxin_btn',
//             "caption": '刷新出库单号',
//             "icon": 'any-newspaper',
//             "color": 'red',

//             "divided": true, //分割线

//         }, 'close');
//         form.toolbar.insert({
//             "name": 'dh_btn',
//             "caption": '再次生成申请单号',
//             "icon": 'any-newspaper',
//             "color": 'blue',

//             "divided": true, //分割线

//         }, 'close');

//         form.toolbar.insert({
//             "name": 'dh1_report',
//             "caption": '出库单导入',
//             "icon": 'any-newspaper',
//             "color": 'green',

//             "divided": true, //分割线

//         }, 'close');
//     }
// }
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW], evt_ckd_FormShow, '出库单')

// const ckd_order_form_btn = (evt_id, btn, form) => {
//     if (btn.name == 'shujusuaxin_btn') {
//         fnModify(form.recordset);
//     }
//     if (btn.name == 'dh_btn') {
//         fngenerate_sqdh(form.recordset);
//     }
//     if (btn.name == 'dh_report') {
//         fnExportJcExcel(form.recordset);
//     }
//     if (btn.name == 'dh1_report') {
//         fnImportExcel(form.recordset);
//     }
//     if (btn.name == 'Decomposing_products') {

//         _.ui.show_dialog('copy_from_excel', {
//             "rid": form.recordset.rid,
//             "group_name": "产品资料",
//             "run_fill": true,
//         })
//     }
// }
// // 菜单按钮click接挂点
// _.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], ckd_order_form_btn, '出库单')
// var fnModify = (recordset) => {
//     _.http.post('/api/Ravencloud/delivery_dh', {
//             "rid": recordset.val('rid'),
//             "ckdh": recordset.val('出库单号')
//         },

//         true).then(res => {
//         if (res.code == 1) {
//             recordset.val('出库单号', '');

//         }
//     })



// }


// //产品资料删除
// const ckd_table_delete_before1 = (evt_id, table, recordset) => {
//     return new Promise((resolve, reject) => {
//         if (table.group == '产品资料') {
//             if (recordset.val('产品资料.出库唯一字段') != '') {


//                 _.http.post('/api/RavenCloud/delete_deliveryline', {
//                     "ckzd": recordset.val('产品资料.出库唯一字段'),
//                     "ckxs": recordset.val('产品资料.出库箱数')

//                 }).then(res => {
//                     if (res.code == 1) {
//                         console.log('删除成功');
//                         console.log(res.data);

//                         if (res.data == '1') {
//                             var ckxs = recordset.val('产品资料.出库箱数');
//                             _.ui.message.error('不好意思,出库箱数' + ckxs + '>0,数据不能删除,不能保存');
//                             recordset.val('人员', '人员');
//                             return;
//                         }
//                         resolve();
//                         console.log('数据更新成功');

//                     } else {
//                         console.log('数据更新失败');
//                         _.ui.message.error(res.msg);
//                     }
//                 });





//             } else {

//                 resolve();
//             }


//         }

//     })
// }
// const ckd_table_delete_before = (evt_id, table, recordset) => {
//     return new Promise((resolve, reject) => {
//         // ✅ 只处理产品资料表的删除验证
//         if (table.group == '产品资料') {
//             if (recordset.val('产品资料.出库唯一字段') != '') {
//                 _.http.post('/api/RavenCloud/delete_deliveryline', {
//                     "ckzd": recordset.val('产品资料.出库唯一字段'),
//                     "ckxs": recordset.val('产品资料.出库箱数')
//                 }).then(res => {
//                     if (res.code == 1) {
//                         console.log('删除成功');
//                         console.log(res.data);

//                         if (res.data == '1') {
//                             var ckxs = recordset.val('产品资料.出库箱数');
//                             _.ui.message.error('不好意思,出库箱数' + ckxs + '>0,数据不能删除,不能保存');
//                             recordset.val('人员', '人员');
//                             reject(); // ✅ 明确拒绝
//                             return;
//                         }
//                         resolve();
//                         console.log('数据更新成功');
//                     } else {
//                         console.log('数据更新失败');
//                         _.ui.message.error(res.msg);
//                         reject(); // ✅ 明确拒绝
//                     }
//                 }).catch(err => {
//                     _.ui.message.error('删除失败: ' + err.message);
//                     reject(); // ✅ 捕获异常
//                 });
//             } else {
//                 resolve();
//             }
//         } else {
//             // ✅ 其他子表（包括进仓编号）直接允许删除
//             resolve();
//         }
//     })
// }
// // _.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, ckd_table_delete_before, '出库单')
// _.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, ckd_table_delete_before, '出库单')

// const fngenerate_sqdh = async (recordset) => {
//     try {
//         if (recordset.val('输单人员') == recordset.user.username) {
//             const sqdh = recordset.val('申请单号');
//             console.log('执行再次生成申请单号');

//             if (sqdh == '') {
//                 return;
//             }
//             console.log('执行再次生成申请单号1');
//             // 1. 检查申请单号是否在 ckzgfy 表中存在
//             const checkRes = await _.http.post('/api/ravencloud/check_ckzgfy', {
//                 "sqdh": sqdh
//             }, true);
//             console.log('执行再次生成申请单号2');
//             if (checkRes.code !== 1) {
//                 _.ui.message.error(checkRes.msg);
//                 return;
//             }

//             // 如果不存在记录，直接返回
//             if (!checkRes.data.exists) {
//                 return;
//             }

//             // 2. 生成新的申请单号前缀
//             const now = new Date();
//             const kpxhn = String(now.getFullYear()).slice(-2); // ✅ 年份后2位，用 slice 代替 substr
//             const kpxhy = String(now.getMonth() + 1).padStart(2, '0'); // 月份补0
//             const kpxhr = String(now.getDate()).padStart(2, '0'); // 日期补0

//             const kpxh1 = 'ck' + kpxhn + kpxhy + kpxhr;

//             // 3. 查询当天最大的申请单号
//             const maxRes = await _.http.post('/api/ravencloud/get_max_sqdh', {
//                 "kpxh1": kpxh1
//             }, true);

//             if (maxRes.code !== 1) {
//                 _.ui.message.error(maxRes.msg);
//                 return;
//             }

//             // 4. 计算新的序号
//             let kpxhz = 1;
//             if (maxRes.data.max_sqdh) {
//                 // ✅ 从第9位开始取3位数字（字符串索引从0开始）
//                 const lastNum = maxRes.data.max_sqdh.slice(9, 12);
//                 kpxhz = parseInt(lastNum || '0') + 1;
//             }

//             // 5. ✅ 生成完整的申请单号（用 padStart 简化）
//             const kpxh = kpxh1 + String(kpxhz).padStart(3, '0');

//             // 6. 更新字段
//             recordset.module.field_by_full_name('费用生成').disabled = false;
//             recordset.val('申请单号', kpxh);

//             console.log('生成的申请单号：', kpxh);
//         }


//     } catch (error) {
//         console.error('生成申请单号失败：', error);
//         _.ui.message.error('生成申请单号失败');
//     }
// };

// const fnExportJcExcel1 = async (recordset) => {
//     try {
//         const sfwc = recordset.val('是否完成');

//         if (sfwc === '否' || sfwc === '') {
//             _.ui.error_message('请先完成出库单！');
//             return;
//         }

//         const zyck = recordset.val('转移仓库');
//         const jcrq = recordset.val('进仓日期');

//         // ✅ 根据转移仓库映射到仓库名称
//         let ckmc = '';
//         if (zyck.indexOf('龙和') > -1) {
//             ckmc = '宁波龙和';
//         } else if (zyck.indexOf('志恒') > -1) {
//             ckmc = '宁波志恒';
//         } else if (zyck.indexOf('汕头') > -1) {
//             ckmc = '汕头办';
//         } else if (zyck.indexOf('义乌') > -1 || zyck.indexOf('柳青') > -1) {
//             ckmc = '义乌大富';
//         } else {
//             ckmc = zyck; // 默认使用原值
//         }

//         // 从"进仓编号"子表获取数据
//         const jcbhData = recordset.tables['进仓编号'].view_data;
//         const jcbh_list = jcbhData.map(item => ({
//             jcbh: item['SNID'],
//             cght: item['cght'],
//             csmc: item['SupplierShortName'],
//             gdry: item['gdry']
//         }));

//         // 从"产品资料"子表获取数据
//         const cpzlData = recordset.tables['产品资料'].view_data;
//         const cpzl_list = cpzlData.map(item => ({
//             jcdh: item['SNID'],
//             cpbh: item['ItemNo'],
//             ckxs: item['OutCartonQty1'],
//             ckmz: item['ckmz'],
//             cktj: item['cktj']
//         }));

//         if (jcbh_list.length === 0) {
//             _.ui.error_message('没有进仓编号数据！');
//             return;
//         }

//         _.ui.show_loading_dialog("正在生成报表...");

//         _.http.post('/api/ravencloud/export_jcexcel', {
//             "zyck": zyck,
//             "jcbh_list": jcbh_list,
//             "cpzl_list": cpzl_list,
//             "jcrq": jcrq
//         }, {
//             timeout: 300000
//         }).then(res => {
//             let data = res.data;
//             console.log('返回数据:', data);

//             // ✅ 判断是数组还是单个文件
//             if (Array.isArray(data)) {
//                 // 多个文件，循环下载
//                 data.forEach((filePath, index) => {
//                     const jcbh = jcbh_list[index] ? jcbh_list[index].jcbh : '';
//                     setTimeout(() => {
//                         _.http.download(
//                             "/api/file/get", {
//                                 file: filePath
//                             },
//                             // ✅ 文件名格式：进仓单 + 序号 + 仓库名称 + 进仓编号.xlsx
//                             (index + 1) + ckmc + jcbh + ".xlsx"
//                         );
//                     }, index * 500);
//                 });
//             } else {
//                 // 单个文件
//                 const jcbh = jcbh_list[0] ? jcbh_list[0].jcbh : '';
//                 _.http.download(
//                     "/api/file/get", {
//                         file: data
//                     },
//                     // ✅ 文件名格式：进仓单 + 1 + 仓库名称 + 进仓编号.xlsx
//                     ckmc + jcbh + ".xlsx"
//                 );
//             }

//         }).catch(res => {
//             console.log(res);
//             _.ui.message.error(res.msg);
//         }).finally(() => {
//             _.ui.hide_loading_dialog();
//         });
//     } catch (error) {
//         console.error('导出失败：', error);
//         _.ui.error_message('导出失败：' + error.message);
//     }
// };


// const fnImportExcel = (recordset) => {
//     // 创建文件选择器
//     const input = document.createElement('input');
//     input.type = 'file';
//     input.accept = '.xlsx,.xls';

//     input.onchange = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         try {
//             // 上传文件
//             const formData = new FormData();
//             formData.append('file', file);

//             const res = await fetch('/api/ravencloud/import_ckd_excel', {
//                 method: 'POST',
//                 body: formData,
//                 rid: recordset.id,
//                 headers: {
//                     'Authorization': 'Bearer ' + _.token
//                 }
//             });

//             const data = await res.json();

//             if (data.code !== 1) {
//                 _.ui.error_message(data.msg);
//                 return;
//             }

//             // 填充仓库名称
//             if (data.data.ckmc) {
//                 recordset.val('仓库名称', data.data.ckmc);
//                 recordset.module.field_by_full_name('仓库名称').disabled = true;
//             } else {
//                 recordset.module.field_by_full_name('仓库名称').disabled = false;
//             }

//             // 填充产品资料子表
//             const items = data.data.items;

//             let line_table1 = recordset.tables['产品资料']
//             // line_table.clear();
//             console.log('dsajdsaj')
//             console.log(items)


//             line_table1.view_data = items;

//             line_table1.sync_operate_data();


//             // for (const item of items) {
//             //     // 新增一行
//             //     recordset.tables['产品资料'].append();

//             //     // 填充数据
//             //     recordset.val('产品资料.入库日期', item.rkrq);
//             //     recordset.val('产品资料.入库时间', item.rksj);
//             //     recordset.val('产品资料.入库箱数', item.rkxs);
//             //     recordset.val('产品资料.实际箱数', item.sjxs);
//             //     recordset.val('产品资料.前退货箱数', item.qthxs);
//             //     recordset.val('产品资料.前出库箱数', item.qckxs);
//             //     recordset.val('产品资料.采购合同', item.cght);
//             //     recordset.val('产品资料.产品编号', item.cpbh);
//             //     recordset.val('产品资料.中文名称', item.zwmc);
//             //     recordset.val('产品资料.厂商名称', item.csmc);
//             //     recordset.val('产品资料.在仓箱数1', item.zcxs1);
//             //     recordset.val('产品资料.理货员', item.lhy);
//             //     recordset.val('产品资料.出库日期', item.ckrq);
//             //     recordset.val('产品资料.外箱长度', item.wxcd);
//             //     recordset.val('产品资料.外箱宽度', item.wxkd);
//             //     recordset.val('产品资料.外箱高度', item.wxgd);
//             //     recordset.val('产品资料.仓库长度', item.ckcd);
//             //     recordset.val('产品资料.仓库宽度', item.ckkd);
//             //     recordset.val('产品资料.仓库高度', item.ckgd);
//             //     recordset.val('产品资料.外箱毛重', item.wxmz);
//             //     recordset.val('产品资料.外箱净重', item.wxjz);
//             //     recordset.val('产品资料.仓库毛重', item.ckmz);
//             //     recordset.val('产品资料.仓库净重', item.ckjz);
//             //     recordset.val('产品资料.外箱体积', item.wxtj);
//             //     recordset.val('产品资料.总体积', item.ztj);
//             //     recordset.val('产品资料.总毛重', item.zmz);
//             //     recordset.val('产品资料.仓库体积', item.cktj);
//             //     recordset.val('产品资料.在仓总体积', item.zcztj);
//             //     recordset.val('产品资料.在仓总毛重', item.zczmz);
//             //     recordset.val('产品资料.出库总体积', item.ckztj);
//             //     recordset.val('产品资料.出库总毛重', item.ckzmz);
//             //     recordset.val('产品资料.托数', item.csts);
//             //     recordset.val('产品资料.剩余托数', item.syts);
//             //     recordset.val('产品资料.仓位', item.cw);
//             //     recordset.val('产品资料.转移仓位', item.zycw);
//             //     recordset.val('产品资料.批号', item.ph);
//             //     recordset.val('产品资料.跟单人员', item.gdry);
//             //     recordset.val('产品资料.业务员', item.ywy);
//             //     recordset.val('产品资料.进仓单号', item.jcdh);
//             //     recordset.val('产品资料.采购唯一字段', item.cgwyzd);
//             //     recordset.val('产品资料.外销唯一字段', item.wxwyzd);
//             //     recordset.val('产品资料.公司名称', item.gsmc);
//             //     recordset.val('产品资料.采购员', item.cgy);
//             //     recordset.val('产品资料.外销合同', item.wxht);
//             //     recordset.val('产品资料.唯一字段', item.wyzd);
//             //     recordset.val('产品资料.输单人员', item.sdry);
//             //     recordset.val('产品资料.入库地点', item.rkdd);
//             //     recordset.val('产品资料.备注信息', item.bz);
//             //     recordset.val('产品资料.进仓费', item.jcf);
//             //     recordset.val('产品资料.业务path', item.ywpath);
//             //     recordset.val('产品资料.采购业务', item.cgpath);
//             //     recordset.val('产品资料.客户名称', item.khmc);
//             //     recordset.val('产品资料.出库箱数', item.ckxs);
//             // }

//             _.ui.message.success(`成功导入 ${items.length} 条数据！`);

//         } catch (error) {
//             console.error('导入失败：', error);
//             _.ui.error_message('导入失败：' + error.message);
//         }
//     };

//     input.click();
// };
// const fnExportJcExcel = async (rid) => {
//     try {
//         console.log('导出函数被调用');
//         console.log('当前记录RID:', rid);




//         _.ui.show_loading_dialog("正在生成报表...");

//         _.http.post('/api/ravencloud/export_jcexcel', {
//             "rid": rid
//         }, {
//             timeout: 300000
//         }).then(res => {
//             if (res.code !== 1) {
//                 _.ui.error_message(res.msg || '生成报表失败');
//                 return;
//             }

//             const data = res.data.files;
//             const sfqy = res.data.sfqy || ''; // 是否完成
//             const zyck = res.data.zyck || ''; // 转移仓库
//             const jcbh_list = res.data.jcbh_list || []; // 检查编号列表
//             console.log('返回数据:', res.data);
//             // 前端判断是否完成
//             if (sfqy === '否' || sfqy === '') {
//                 _.ui.error_message('请先完成出库单！');
//                 return;
//             }
//             // 根据转移仓库映射到仓库名称
//             let ckmc = '';
//             if (zyck.indexOf('龙和') > -1) {
//                 ckmc = '宁波龙和';
//             } else if (zyck.indexOf('志恒') > -1) {
//                 ckmc = '宁波志恒';
//             } else if (zyck.indexOf('汕头') > -1) {
//                 ckmc = '汕头办';
//             } else if (zyck.indexOf('义乌') > -1 || zyck.indexOf('柳青') > -1) {
//                 ckmc = '义乌大富';
//             } else {
//                 ckmc = zyck;
//             }

//             console.log('文件路径:', jcbh_list);
//             console.log('文件路径:', Array.isArray(data));
//             // ✅ 判断是数组还是单个文件
//             if (Array.isArray(data)) {
//                 // 多个文件，循环下载

//                 data.forEach((filePath, index) => {

//                     const jcbh = jcbh_list[index] ? jcbh_list[index].jcbh : '';
//                     setTimeout(() => {
//                         _.http.download(
//                             "/api/file/get", {
//                                 file: filePath
//                             },
//                             // ✅ 文件名格式：进仓单 + 序号 + 仓库名称 + 进仓编号.xlsx
//                             (index + 1) + ckmc + jcbh + ".xlsx"
//                         );
//                     }, index * 500);
//                 });
//             } else {
//                 // 单个文件
//                 // console.log('文件路径:', jcbh_list);
//                 const jcbh = jcbh_list[0] ? jcbh_list[0].jcbh : '';
//                 _.http.download(
//                     "/api/file/get", {
//                         file: data
//                     },
//                     // ✅ 文件名格式：进仓单 + 1 + 仓库名称 + 进仓编号.xlsx
//                     ckmc + jcbh + ".xlsx"
//                 );
//             }

//         }).catch(res => {
//             console.log(res);
//             _.ui.message.error(res.msg);
//         }).finally(() => {
//             _.ui.hide_loading_dialog();
//         });
//     } catch (error) {
//         console.error('导出失败：', error);
//         _.ui.error_message('导出失败：' + error.message);
//     }
// };

// const ckd_order_add_report_item = (eid, module, opts, props) => {
//     return new Promise((resolve, reject) => {
//         console.log('ckd_order_add_report_item')
//         console.log(opts)
//         console.log(props)
//         console.log(eid)
//         console.log(module)
//         opts.data.push({
//             kind: 1, //kind为1表示代码报表
//             rid: "sales_order_report1",
//             name: "进仓单",
//             action: (item, module, props, batch) => {
//                 fnExportJcExcel(props.rid)
//             },
//         })

//         resolve()
//     })
// }
// _.evts.on(_.evtids.REPORT_CENTER_DATA_LOADED, ckd_order_add_report_item, '出库单')

// const ckd_EDITOR_order_form_show = (evt_id, form) => {

//     if (form.group.value.name == '产品资料') {
//         form.toolbar.add([{
//             "name": 'Decomposing_products',
//             "caption": 'excel粘贴',
//             "color": 'blue',
//             "icon": 'any-keyborad'
//         }]);
//     }



// }
// // 模块编辑界面,查询界面打开时接挂点
// _.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], ckd_EDITOR_order_form_show, '出库单')







// const evt_ckd_BeforeSave = (evt_id, recordset) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const cpzlTable = '产品资料';
//             const jcbhTable = '进仓编号';

//             // 1. 箱封号自动填充
//             const xh = recordset.val('箱  号') || '';
//             const fh = recordset.val('封  号') || '';
//             if ((xh || fh) && !recordset.val('箱封号')) {
//                 recordset.val('箱封号', xh + '/' + fh);
//             }

//             // 2. 人员权限检查
//             if (recordset.val('人员') === '人员') {
//                 _.ui.message.error('有无权删除产品资料信息，系统不能保存!');
//                 reject();
//                 return;
//             }

//             // 3. 箱号长度验证
//             const sqlx = recordset.val('申请类型');
//             if (sqlx !== '散货运费' && xh) {
//                 if (xh.trim().length !== 11) {
//                     _.ui.message.error('请注意箱号不为11个字符，请修正!');
//                     reject();
//                     return;
//                 }
//             }

//             // 4. 是否完成 = 是 时的主要逻辑
//             if (recordset.val('是否完成') === '是') {
//                 // 箱号验证
//                 if (!xh && sqlx !== '散货运费') {
//                     _.ui.message.error('箱号没填且申请类型非散货运费，请修正!');
//                     reject();
//                     return;
//                 }

//                 // 收集主表数据
//                 const mainData = {
//                     rid: recordset.val('rid'),
//                     uid: recordset.val('uid'),
//                     xh: xh,
//                     fh: fh,
//                     ckdh: recordset.val('出库单号') || '',
//                     thzyh: recordset.val('退货作业号') || '',
//                     xshj: recordset.val('箱数合计') || 0,
//                     ckmc: recordset.val('仓库名称') || '',
//                     ywy: recordset.val('业务员') || '',
//                     ywbm: recordset.val('业务部门') || '',
//                     zyck: recordset.val('转移仓库') || '',
//                     rkdd: recordset.val('入库地点') || '',
//                     jcrq: recordset.val('进仓日期') || '',
//                     yzrq: recordset.val('预装日期') || '',
//                     ckrq: recordset.val('出库日期') || '',
//                     khmc: recordset.val('客户名称') || '',
//                     zggjrq: recordset.val('装柜日期') || '',
//                     fylb: recordset.val('费用类别') || '',
//                     zchm: recordset.val('装车货名') || '',
//                     cph: recordset.val('车 牌 号') || '',
//                     yflx: recordset.val('运费路线') || '',
//                     zgfy: parseFloat(recordset.val('装柜费用')) || 0,
//                     jcfy: parseFloat(recordset.val('进仓费用')) || 0,
//                     gbf: parseFloat(recordset.val('过 磅 费')) || 0,
//                     yf: parseFloat(recordset.val('运   费')) || 0,
//                     qtfy: parseFloat(recordset.val('其它费用')) || 0,
//                     fyhj: parseFloat(recordset.val('费用合计')) || 0,
//                     zggr: recordset.val('装柜工人') || '',
//                     jzry: recordset.val('监装人员') || '',
//                     zjjz: recordset.val('质检监装') || '',
//                     ckfybz: recordset.val('仓库费用备注') || '',
//                     sfkp: recordset.val('是否开票') || '',
//                     fphm: recordset.val('发票号码') || '',
//                     tyb: recordset.val('托 运 部') || '',
//                     tyhj: parseFloat(recordset.val('体积合计')) || 0,
//                     zhckfy: parseFloat(recordset.val('综合仓库费用')) || 0,
//                     userName: recordset.user.username
//                 };

//                 // 收集产品资料子表数据
//                 const cpzlData = recordset.tables[cpzlTable].view_data;
//                 const cpzlList = cpzlData.map((item, index) => ({
//                     index: index,
//                     rid: item.rid || '',
//                     jcdh: item.SNID || item['进仓单号'] || '',
//                     cpbh: item.ItemNo || item['产品编号'] || '',
//                     cght: item.PurchaseOrderNo || item['采购合同'] || '',
//                     rkrq: item.StorageDate || item['入库日期'] || '',
//                     rksj: item.StorageTime || item['入库时间'] || '',
//                     rkxs: parseInt(item.InCartonQty || item['入库箱数']) || 0,
//                     ckxs: parseInt(item.OutCartonQty1 || item['出库箱数']) || 0,
//                     thxs: parseInt(item.ReturnCartonQty || item['退货箱数']) || 0,
//                     zcxs: parseInt(item.CartonQty || item['在仓箱数']) || 0,
//                     zcxs1: parseInt(item.CartonQty1 || item['在仓箱数1']) || 0,
//                     wyzd: item.wyzd || item['唯一字段'] || '',
//                     ckwyzd: item.wyzd1 || item['出库唯一字段'] || '',
//                     zwmc: item.zwmc || item['中文名称'] || '',
//                     csmc: item.SupplierShortName || item['厂商名称'] || '',
//                     ywy: item.Salesman || item['业务员'] || '',
//                     cgy: item.PurchasingAgent || item['采购员'] || '',
//                     gdry: item.gdry || item['跟单人员'] || '',
//                     gsmc: item.Exporter || item['公司名称'] || '',
//                     wxht: item.SalesOrderNo || item['外销合同'] || '',
//                     cw: item.WarehousePosition || item['仓位'] || '',
//                     ph: item.LotNumber || item['批号'] || '',
//                     lhy: item.Collator || item['理货员'] || '',
//                     sdry: item.Operator || item['输单人员'] || '',
//                     bz: item.Memo || item['备注信息'] || '',
//                     thyy: item.thyy || item['退货原因'] || '',
//                     wxcd: parseFloat(item.OuterLength1 || item['外箱长度']) || 0,
//                     wxkd: parseFloat(item.OuterWidth1 || item['外箱宽度']) || 0,
//                     wxgd: parseFloat(item.OuterHeight1 || item['外箱高度']) || 0,
//                     wxmz: parseFloat(item.OuterGrossWeight1 || item['外箱毛重']) || 0,
//                     wxjz: parseFloat(item.OuterNetWeight1 || item['外箱净重']) || 0,
//                     wxtj: parseFloat(item.OuterVolume1 || item['外箱体积']) || 0,
//                     ckcd: parseFloat(item.OuterLength || item['仓库长度']) || 0,
//                     ckkd: parseFloat(item.OuterWidth || item['仓库宽度']) || 0,
//                     ckgd: parseFloat(item.OuterHeight || item['仓库高度']) || 0,
//                     ckmz: parseFloat(item.OuterGrossWeight || item['仓库毛重']) || 0,
//                     ckjz: parseFloat(item.OuterNetWeight || item['仓库净重']) || 0,
//                     cktj: parseFloat(item.OuterVolume || item['仓库体积']) || 0,
//                     ts: item.PalletQty || item['托数'] || '',
//                     jcf: parseFloat(item.jcf || item['进仓费']) || 0,
//                     wxwyzd: item.wxwyzd || item['外销唯一字段'] || '',
//                     cgwyzd: item.cgwyzd || item['采购唯一字段'] || '',
//                     ywpath: item.ywpath || item['业务path'] || '',
//                     cgpath: item.cgpath || item['采购业务'] || '',
//                     parentID: item.UserID || item['ParentID'] || '',
//                     qckxs: parseInt(item['前出库箱数']) || 0,
//                     qthxs: parseInt(item['前退货箱数']) || 0
//                 }));

//                 // 调用后端API处理保存逻辑
//                 _.http.post('/api/ravencloud/delivery_beforesave', {
//                     mainData: mainData,
//                     cpzlList: cpzlList,
//                     rid: recordset.val('rid'),
//                     uid: recordset.val('uid')
//                 }).then(res => {
//                     if (res.code == 1) {

//                         // 更新前端数据
//                         const result = res.data;

//                         // 更新出库单号
//                         if (result.ckdh) {
//                             recordset.val('出库单号', result.ckdh);
//                         }

//                         // 更新业务部门
//                         if (result.ywbm) {
//                             recordset.val('业务部门', result.ywbm);
//                         }

//                         // 更新装车货名
//                         if (result.zchm) {
//                             recordset.val('装车货名', result.zchm);
//                         }

//                         // 更新备注信息
//                         if (result.bz) {
//                             recordset.val('备注信息', result.bz);
//                         }
//                         //更新修改人员
//                         recordset.val('修改人员', recordset.user.username);

//                         console.log('是大三大四打卡机打卡圣诞节啊是');


//                         // 更新产品资料子表
//                         if (result.cpzlUpdates && result.cpzlUpdates.length > 0) {
//                             const viewData = recordset.tables[cpzlTable].view_data;
//                             for (const update of result.cpzlUpdates) {
//                                 const row = viewData[update.index];
//                                 if (row) {
//                                     if (update.wyzd) row['唯一字段'] = update.wyzd;
//                                     if (update.ckwyzd) row['出库唯一字段'] = update.ckwyzd;
//                                     if (update.zcxs !== undefined) row['在仓箱数'] = update.zcxs;
//                                     if (update.zcxs1 !== undefined) row['在仓箱数1'] = update.zcxs1;
//                                     if (update.kcxs !== undefined) row['库存箱数'] = update.kcxs;
//                                     if (update.qckxs !== undefined) row['前出库箱数'] = update.qckxs;
//                                     if (update.xh) row['箱  号'] = update.xh;
//                                     if (update.fh) row['封  号'] = update.fh;
//                                     if (update.ckrq) row['出库日期'] = update.ckrq;
//                                     row['转移仓库'] = mainData.zyck;
//                                     row['仓库名称'] = mainData.ckmc;

//                                     // 标记修改
//                                     if (recordset.tables[cpzlTable].modi_rids.indexOf(row.rid) < 0) {
//                                         recordset.tables[cpzlTable].modi_rids.push(row.rid);
//                                     }
//                                 }
//                             }
//                             recordset.tables[cpzlTable].modified = true;
//                         }

//                         // 更新进仓编号子表（如果有转移仓库）
//                         if (result.jcbhList && result.jcbhList.length > 0) {
//                             recordset.tables["进仓编号"].clear();
//                             for (let row of result.jcbhList) {
                              
                           
//                                 recordset.tables["进仓编号"].append(row);
//                             }
//                             //     let line_table1 = recordset.tables['进仓编号']
//                             //       for (let row of result.jcbhList){
//                             //         console.log(row.rid)

//                             //            line_table1.push_new_rid(row.rid)

//                             //       }

//                             //   line_table1.view_data = result.jcbhList;
//                             //   line_table1.sync_operate_data();
//                             //   line_table1.modified = true;
//                             //     // line_table.clear();
//                             //     console.log('dsajdsaj')
//                             //     console.log(result.jcbhList)


//                         }
//                         resolve();
//                     }


//                 }).catch(err => {
//                     _.ui.message.error(err.msg);
//                     console.error(err);
//                 })
//                 // const res = _.http.post('/api/ravencloud/delivery_beforesave', {
//                 //     mainData: mainData,
//                 //     cpzlList: cpzlList,
//                 //     rid:recordset.val('rid'),
//                 //     uid:recordset.val('uid')
//                 // }, true);

//                 // console.log(res);
//                 // console.log(res.code);



//                 //



//                 resolve();
//             } else {
//                 resolve();
//             }

//         } catch (error) {
//             console.error('保存前处理失败:', error);
//             _.ui.message.error('保存失败: ' + error.message);
//             reject();
//         }

//     })
// }
// _.evts.on(_.evtids.RECORD_BEFORE_SAVE, evt_ckd_BeforeSave, '出库单')