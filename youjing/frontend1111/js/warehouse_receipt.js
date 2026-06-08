// 入库单

// 入库单数据加载
//   打开单条数据的时候实现加载
const warehouse_receipt_recordLoad = (evt_id, recordset) => {
  let module_name = recordset.module.name // name= 入库单
  let user_name = _.user.username
  // 判断是是否开始修改了  还是只是查看
  // console.log('wozhixinglesiuuuuuuu', user_name)
  // if (recordset.val('输单人员') == '') {
  //   recordset.val('输单人员', user_name)
  // }
  if (recordset.val('入库日期') == null || recordset.val('入库日期') == '') {
    recordset.module.field_by_full_name(
      module_name + '.产品资料.实际箱数',
    ).disabled = true
  }
}

_.evts.on([_.evtids.RECORD_LOAD], warehouse_receipt_recordLoad, '入库单')

//  新增入库单  仓库人员手动创建    采购员未及时生成预入库单的情况下

// // 入库单编辑界面【确认进仓】按钮  当仓库人员完成货物清点、并在系统中录入准确的“实际箱数”等数据后，通过此操作，正式确认货物已接收，系统生成对应的库存明细。
// const warehouse_receipt_EditFormShow = (evt_id, form) => {
//   // 新增按钮 add,插入按钮 insert,最后参数默认是前面,如果放后面用-1
//   form.toolbar.add([{
//     name: 'confirm_warehouse_receipt',
//     caption: '确认进仓',
//     icon: 'any-house',
//     divided: true,
//   }, ])
// }
// _.evts.on(
//   [_.evtids.MODULE_EDITOR_SHOW],
//   warehouse_receipt_EditFormShow,
//   '入库单',
// )

//==========================================  删除入库单=============================

// const deleteWarehouseReceipt = (evt_id, rid, form, recordset) => {
//   //  - 对于宁波仓库的入库单，若当前用户是单据的跟单人员，则该用户有删除入库单的权限。
// //   2. 删除规则：
// //   - 对于宁波仓库的入库单，若当前用户是单据的跟单人员，则该用户有删除入库单的权限。
// //   - 对于义乌/汕头仓库的入库单，若仓库人员未查看过该入库单，则跟单人员可以在【采购跟单】模块取消进仓；若义乌/汕头的仓库人员已经查看过此入库单，则跟单人员没有取消进仓的权限，只能联系仓库人员删除。
// //   - 若当前用户是仓库人员，则需要判断累计出库箱数（出库单表）是否大于0，若大于0则禁止仓库人员删除该入库单据，提示“累计出库箱数大于0，不能删除入库单据”，否则允许删除单据。
// // 3. 删除时，必须弹出提醒消息，用户选择是否确认删除。
// //   1. 单条删除：用户点击列表右侧操作栏的“删除”按钮或者只选择了一行点击列表上方“删除”按钮时，确认提示：“您确认删除作业号为{xxx}的入库单吗？”。其中，{xxx}替换为对应的作业号。
// //   2. 批量删除：用户勾选列表行后，点击列表上方的”删除“按钮弹出确认框，提示：“您选中了{x}条单据，确认全部删除吗？”。其中，{x}表示用户选择的行数。
// // 4. 用户点击“确认”后，执行逻辑删除并刷新列表，包括对应的库存明细表中的记录删掉。
//   let user_name = _.user.username
//   let follow_user = recordset.val('跟单人员')
//   if (recordset.val('仓库名称') && recordset.val('仓库名称').includes('宁波') && user_name == follow_user) {
//     // 允许删除
//   } else {
//     // 不允许删除
//     _.m.showNotify({
//       type: 'danger',
//       message: '您没有权限删除该入库单',
//     })
//     return
//   }







// }

// _.evts.on([_.evtids.RECORD_BEFORE_DELETE], deleteWarehouseReceipt, '入库单')

//RECORD_BEFORE_DELETE

// 点击确认进仓按钮
// const warehouse_receipt_EditBtnClick = (evt_id, btn, form) => {
//   if (btn.name == 'confirm_warehouse_receipt') {
//     let products_detail = form.recordset.tables['产品资料']
//     // 验证实际箱数字段 CartonQty 是否为 0
//     if (products_detail && products_detail.view_data) {
//       for (let i = 0; i < products_detail.view_data.length; i++) {
//         let row = products_detail.view_data[i]
//         if (row.CartonQty === 0 || row.CartonQty === '0') {
//           _.ui.error_message('存在实际箱数为0的产品，无法完成进仓，请仔细核查数据');
//           return
//         }
//       }
//     } else {
//       _.ui.error_message('请先填写产品资料信息');

//       return
//     }
//     // 同一产品的累计历史入库箱数+本次实际箱数（不含赠品）不得超过其对应采购合同的总箱数。
//     // 若超出，系统应拒绝操作并提示：“累计实际进仓数大于合同箱数！”，并强制将 【实际箱数】 和 【赠品箱数】 重置为0，且中断当前操作。
//     // 排除本次采购合同号码下的 入库单里面的产品实际箱数
//     let detail_view_data = products_detail.view_data
//     let PurchaseOrderNo = form.recordset.val('采购合同')
//     let rid = form.recordset.val('rid')
//     let errorcount = 0
//     _.http.post('/api/saier/warehouse_receipt/historical/instock', {
//           PurchaseOrderNo: PurchaseOrderNo,
//           rid: rid,
//           detail_view_data:detail_view_data
//           // ProductNo: ProductNo,
//         })
//         .then((res) => {
//           if (res.code == -1) {
//               errorcount++
//             row.CartonQty = 0
//             row.zpxs = 0
//             products_detail.push_modi_rid(row.rid)
//           }
//         })
//     // for (let row of detail_view_data) {
//     //   let ProductNo = row.ItemNo
//     //   console.log('ProductNo', ProductNo)
//     //   _.http.post('/api/saier/warehouse_receipt/historical/instock', {
//     //       PurchaseOrderNo: PurchaseOrderNo,
//     //       rid: rid,
//     //       ProductNo: ProductNo,
//     //     })
//     //     .then((res) => {
//     //       if (res.code == -1) {
//     //           errorcount++
//     //         row.CartonQty = 0
//     //         row.zpxs = 0
//     //         products_detail.push_modi_rid(row.rid)
//     //       }
//     //     })
//     // }
//     products_detail.sync_operate_data()
//     // 刷新产品资料子表
//     products_detail.modified = true
//     if (errorcount > 0) {
//        _.ui.error_message('存在产品累计实际进仓数大于合同箱数的情况，已强制将 【实际箱数】 和 【赠品箱数】 重置为！');
     
//       return
//     }
//     form.recordset.val('是否进仓', '是')
 
//     // 【实际箱数】 不得小于该产品已记录的“已出库箱数”。
//     // 若小于，系统应提示：“实际箱数小于出库箱数，实际箱数变更为出库箱数!”，
//     // 并自动将 【实际箱数】 调整为 【已出库箱数】且中断当前操作。
//   }
// }
// _.evts.on(
//   [_.evtids.TOOLBAR_BUTTON_CLICK],
//   warehouse_receipt_EditBtnClick,
//   '入库单',
// )

// 产品资料子表中
//  - 前置禁用： 仅当主信息中 【入库日期】 已填写时，此字段才变为可编辑。
// -  核心校验： 当 【是否进仓】 = “是” 时，系统会校验所有产品的此字段必须 > 0，否则拒绝进仓。

const warehouse_receipt_field_change = (evt_id, opts) => {
  let {
    recordset,
    module,
    field,
    value,
    old_value
  } = opts
  let module_name = module.name


  if (recordset.val('入库日期') != null && recordset.val('入库时间') != '') {
    recordset.module.field_by_full_name(module_name + '.产品资料.实际箱数',).disabled = false
  
  }else{
    recordset.module.field_by_full_name(module_name + '.产品资料.实际箱数',).disabled = true
  }
}
_.evts.on(
  _.evtids.RECORD_FIELD_CHANGED,
  warehouse_receipt_field_change,
  '入库单',
)



