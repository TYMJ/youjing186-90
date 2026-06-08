// 编辑界面数据加载以后执行
const purchase_order_recordLoad = (evt_id, recordset) => {
  let m = recordset.module.name
  let username = _.user.username
  let gdry = recordset.val('跟单人员')
  let ry = recordset.val('采购人员')
  let sp = recordset.val('下单申请')
  let cgry = recordset.val('采购人员')
  let hz = recordset.val('是否核准')
  let ywry = recordset.val('业务人员')
  if (recordset.val('合同预建') != '是') {
    recordset.module.field_by_full_name(m + '.合同预建').disabled = true
  }
  let items_btn = !(
    recordset.val('下单申请') != '' && recordset.val('下单申请') != username
  )
  recordset.tables['产品资料']._.toolbar.show('delete', items_btn)
  recordset.tables['产品资料']._.toolbar.show('new', items_btn)
  recordset.tables['产品资料']._.toolbar.show('copy', items_btn)
  recordset.tables['产品资料']._.toolbar.show('insert-data', items_btn)
  recordset.tables['产品资料']._.toolbar.show('fill', items_btn)
  recordset.module.field_by_full_name(m + '.跟单人员').disabled = true
  recordset.module.field_by_full_name(m + '.费用清单.费用名称').disabled = !(
    recordset.val('下单申请') == '' &&
    (recordset.val('业务人员') == username ||
      recordset.val('跟单人员') == username ||
      recordset.val('采购人员') == username)
  )
  recordset.module.field_by_full_name(m + '.费用清单.费用金额').disabled = !(
    recordset.val('下单申请') == '' &&
    (recordset.val('业务人员') == username ||
      recordset.val('跟单人员') == username ||
      recordset.val('采购人员') == username)
  )
  recordset.module.field_by_full_name(m + '.费用清单.收付情况').disabled = !(
    recordset.val('下单申请') == '' &&
    (recordset.val('业务人员') == username ||
      recordset.val('跟单人员') == username ||
      recordset.val('采购人员') == username)
  )
  recordset.module.field_by_full_name(m + '.费用清单.货币代码').disabled = !(
    recordset.val('下单申请') == '' &&
    (recordset.val('业务人员') == username ||
      recordset.val('跟单人员') == username ||
      recordset.val('采购人员') == username)
  )
  recordset.module.group_by_name('修改记录').visible = false
  recordset.module.group_by_name('查看人员').visible = false
  if (username == 'admin' || username == 'zjnblh') {
    recordset.module.field_by_full_name('修改清单').show()
  } else {
    recordset.module.field_by_full_name('修改清单').hide()
  }

  if (
    recordset.val('业务人员') == username ||
    recordset.val('下单申请') == username ||
    username == 'zjnblh' ||
    username == '侯柳红' ||
    username == '陈妍科'
  ) {
    recordset.module.field_by_full_name(m + '.业务人员').disabled = false
  }

  recordset.module.field_by_full_name(m + '.价格确认').hide()

  if (recordset.val('业务人员') == username || username == 'zjnblh') {
    if (recordset.val('合同对比') != '提成锁定') {
      recordset.module.field_by_full_name(m + '.跟单提成').disabled = false
      recordset.module.field_by_full_name(m + '.采购提成').disabled = false
    } else {
      recordset.module.field_by_full_name(m + '.跟单提成').disabled = true
      recordset.module.field_by_full_name(m + '.采购提成').disabled = true
    }
  } else {
    if (sp == username) {
      recordset.module.field_by_full_name(m + '.跟单提成').disabled = true
      recordset.module.field_by_full_name(m + '.采购提成').disabled = true
    } else {
      recordset.module.field_by_full_name(m + '.跟单提成').hide()
      recordset.module.field_by_full_name(m + '.采购提成').hide()
    }
  }
  if (recordset.val('合同日期') != '' && recordset.val('合同日期') != null) {
    if (ry == '待定' || ry == '' || recordset.val('专业厂家') == '待定') {
      recordset.module.field_by_full_name(m + '.合同日期').disabled = false
    } else {
      recordset.module.field_by_full_name(m + '.合同日期').disabled = true
    }
  }
  recordset.module.field_by_full_name(m + '.所有合同').hide()
  recordset.module.field_by_full_name(m + '.跟单申请').hide()
  recordset.module.field_by_full_name(m + '.验货申请').hide()
  recordset.module.field_by_full_name(m + '.验货人员').hide()
  recordset.module.field_by_full_name(m + '.批号识别').hide()
  recordset.module.field_by_full_name(m + '.注意事项').hide()
  recordset.module.field_by_full_name(m + '.产品资料.SM设计稿').show()
  recordset.module.field_by_full_name(m + '.产品资料.AW设计稿').show()
  recordset.module.field_by_full_name(m + '.产品资料.采购原价').show()

  _.http
    .post('/api/saier/purchase_order/load/check', {
      sffl: recordset.val('是否辅料'),
      wxbm: recordset.val('外销部门'),
      cgbm: recordset.val('采购部门'),
      gdbm: recordset.val('跟单部门'),
      yw: recordset.val('业务'),
      cgry: recordset.val('采购人员'),
      ywry: recordset.val('业务人员'),
      gdry: recordset.val('跟单人员'),
      gsmc: recordset.val('我方公司'),
    })
    .then(function (res) {
      let d = res.data
      let sp_list = d.sp_list
      let htnr = d.htnr
      let yqpd = d.yqpd
      let ggsb = d.ggsb
      let gdcg = d.gdcg
      let zjl = d.zjl
      let ywpd = d.ywpd
      let bmsb = d.bmsb
      let cr = d.cr
      if (bmsb == 1) {
        recordset.val('部门识别', '1')
      } else {
        recordset.val('部门识别', '')
      }
      if (
        (recordset.val('合同签订要点') == '' ||
          recordset.val('合同签订要点') == null) &&
        htnr != '' &&
        htnr != null &&
        htnr != undefined
      ) {
        recordset.val('合同签订要点', htnr)
      }
      recordset._list['采购合同.下单申请'] = sp_list
      recordset.module.field_by_full_name(m + '.客户延期').disabled = yqpd == 1
      recordset.module.field_by_full_name(m + '.客户说明').disabled = yqpd == 1
      if (recordset.val('合同号码') != '') {
        recordset.module.field_by_full_name(m + '.合同号码').disabled = true
        if (ggsb == '1') {
          recordset.module.field_by_full_name(m + '.专业厂家id').disabled = true
          recordset.module.field_by_full_name(m + '.专业厂家').disabled = true
          _.ui.message.error('请注意此票已有预付信息')
        }
      }
      if (
        (username == ywry ||
          (cr == '是' && ywry == '') ||
          (cr == '是' && ry == username) ||
          (cr == '是' && gdcg == 1 && gdry == username)) &&
        sp == ''
      ) {
        console.log(cr)
        console.log(ry)
        console.log(gdcg)
        console.log(gdry)
        console.log(sp)
        console.log(ywry)
        recordset.module.field_by_full_name(m + '.是否核准').disabled = true
        recordset.module.field_by_full_name(m + '.跟单申请').disabled = true
        recordset.module.field_by_full_name(m + '.验货申请').disabled = true
        recordset.module.field_by_full_name(m + '.验货人员').disabled = true
        recordset.module.field_by_full_name(m + '.验货地点').disabled = true
        recordset.module.field_by_full_name(m + '.验货日期').disabled = true
        recordset.module.field_by_full_name(m + '.未批原因').disabled = true
        recordset.module.field_by_full_name(m + '.跟单人员').disabled = false
        if (ywpd == 1) {
          recordset.module.field_by_full_name(m + '.预计船期').show()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').show()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').show()
        } else {
          recordset.module.field_by_full_name(m + '.预计船期').hide()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').hide()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').hide()
        }
        if (
          (username != ywry && username != cgry && username != gdry) ||
          sp != ''
        ) {
          recordset.module.field_by_full_name(m + '.合同号码').disabled = true
        } else {
          recordset.module.field_by_full_name(m + '.合同号码').disabled = false
        }
        recordset.module.field_by_full_name(m + '.外销合同').disabled = false
        recordset.module.field_by_full_name(m + '.厂商编号').disabled = false
        recordset.module.field_by_full_name(m + '.生产厂家').disabled = false
        recordset.module.field_by_full_name(m + '.专业厂家id').disabled = false
        recordset.module.field_by_full_name(m + '.专业厂家').disabled = false
        recordset.module.field_by_full_name(m + '.预计船期').disabled = false
        recordset.module.field_by_full_name(m + '.下单申请').disabled = false
        recordset.module.field_by_full_name(m + '.签约地点').disabled = false
        recordset.module.field_by_full_name(m + '.交货地点').disabled = false
        recordset.module.field_by_full_name(m + '.备    注').disabled = false
        recordset.module.field_by_full_name(m + '.设计人员').disabled = false
        recordset.module.field_by_full_name(m + '.合同备注').disabled = false
        recordset.module.field_by_full_name(m + '.开票工厂').disabled = false
        recordset.module.field_by_full_name(m + '.组织机构代码').disabled =
          false
        recordset.module.field_by_full_name(m + '.开票联系人').disabled = false
        recordset.module.field_by_full_name(m + '.开票电话').disabled = false

        recordset.module.field_by_full_name(m + '.交货日期').disabled = false
        if (username == sp) {
          recordset.module.field_by_full_name(m + '.是否核准').disabled = false
          recordset.module.field_by_full_name(m + '.采购人员').disabled = false
          recordset.module.field_by_full_name(m + '.未批原因').disabled = false
          recordset.module.field_by_full_name(m + '.交货日期').disabled = false
          if (hz == '通过') {
            recordset.module.field_by_full_name(m + '.验货人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.跟单验货备注').disabled =
              false
          }
        } else {
          recordset.module.field_by_full_name(m + '.采购人员').disabled = true
          recordset.module.field_by_full_name(m + '.是否核准').disabled = true
          recordset.module.field_by_full_name(m + '.未批原因').disabled = true
        }
        recordset.module.field_by_full_name(m + '.辅料合同').disabled = false
        recordset.module.field_by_full_name(m + '.我方公司').disabled = false
        recordset.module.field_by_full_name(m + '.客户编号').disabled = false
        recordset.module.field_by_full_name(m + '.客户名称').disabled = false
        recordset.module.field_by_full_name(m + '.货币代码').disabled = false
        recordset.module.field_by_full_name(m + '.已付定金').disabled = false
        recordset.module.field_by_full_name(m + '.定金日期').disabled = false
        recordset.module.field_by_full_name(m + '.业务人员').disabled = false
        recordset.module.field_by_full_name(m + '.采购部门').disabled = false
        recordset.module.field_by_full_name(m + '.跟单申请').disabled = false
        recordset.module.field_by_full_name(m + '.验货申请').disabled = false
        recordset.module.field_by_full_name(m + '.验货人员').disabled = false
        recordset.module.field_by_full_name(m + '.验货地点').disabled = false
        recordset.module.field_by_full_name(m + '.验货日期').disabled = false
        recordset.module.field_by_full_name(m + '.预计船期').disabled = false
        recordset.module.field_by_full_name(m + '.工厂联系').disabled = false
        recordset.module.field_by_full_name(m + '.工厂电话').disabled = false
        recordset.module.field_by_full_name(m + '.新旧合同').disabled = false
        recordset.module.field_by_full_name(m + '.跟单验货备注').disabled =
          false
        recordset.module.field_by_full_name(m + '.费用承担').disabled = false
        recordset.module.field_by_full_name(m + '.包装要求').disabled = false
        recordset.module.field_by_full_name(m + '.运输方式').disabled = false
        recordset.module.field_by_full_name(m + '.结算方式').disabled = false
        recordset.module.field_by_full_name(m + '.品质保证').disabled = false
        recordset.module.field_by_full_name(m + '.违约责任').disabled = false
        recordset.module.field_by_full_name(m + '.合同纠纷').disabled = false
        recordset.module.field_by_full_name(m + '.产品要求').disabled = false
        recordset.module.field_by_full_name(m + '.验收标准').disabled = false
        recordset.module.field_by_full_name(m + '.优惠金额').disabled = false
        recordset.module.field_by_full_name(m + '.纸卡费用').disabled = false
        recordset.module.field_by_full_name(m + '.验货报告').disabled = false
        if (username == zjl || username == sp) {
          if (sp !== '') {
            recordset.module.field_by_full_name(m + '.是否核准').disabled =
              false
          }

          recordset.module.field_by_full_name(m + '.采购人员').disabled = false
          recordset.module.field_by_full_name(m + '.未批原因').disabled = false
          recordset.module.field_by_full_name(m + '.交货日期').disabled = false
          if (hz == '通过') {
            recordset.module.field_by_full_name(m + '.跟单人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.验货人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.跟单验货备注').disabled =
              false
          }
        }
        recordset.module.field_by_full_name(m + '.产品资料.产品编号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.临时货号').disabled =
          false

        recordset.module.field_by_full_name(m + '.产品资料.产品规格').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.客户货号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.工厂货号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.专业货号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.开模编号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.厂商编号').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.厂商名称').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.专业厂家id',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.专业厂家').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.中文品名').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.英文品名').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.颜    色').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.默认价格').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.货币代码').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.开票点数').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.外销单价').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.客户RMB单价',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.采购原价').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.退 税 率').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.箱    数').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.中文计量单位',
        ).disabled = false
        recordset.module.field_by_full_name(
          m + '.产品资料.外箱装箱量',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.合同数量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.计量单位').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.总 金 额').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.增值税率').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.内盒装箱量',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.包装单位').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.毛    重').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.总 毛 重').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.净    重').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.总 净 重').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.中文包装').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.英文包装').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.包装长度').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.包装宽度').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.包装高度').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.外箱体积').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.总 体 积').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.出货数量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.出货金额').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.剩余数量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.剩余金额').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.统计条件').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.中文报关品名',
        ).disabled = false
        recordset.module.field_by_full_name(
          m + '.产品资料.出货样要求',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.出货合计').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.产品尺寸').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.客人交期').disabled =
          false

        recordset.module.field_by_full_name(m + '.产品资料.产品大类').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.厚    度').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.壁    厚').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.底    厚').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.中文尺寸').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.英文尺寸').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.实际重量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.克    重').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.中文说明').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.英文说明').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.备    注').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.工厂电话').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.确认交期').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.预计出货').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.进仓时间').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.验货数量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.不 良 率').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.结    论').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.分类名称').disabled =
          false
        recordset.module.field_by_full_name(
          m + '.产品资料.内盒/外箱',
        ).disabled = false
        recordset.module.field_by_full_name(m + '.产品资料.款  式').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.海关编码').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.一级分类').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.二级分类').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.三级分类').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.材  质').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.产品来源').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.起 订 量').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.比  值').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.报关单位').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.客人条码').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.代开金额').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.代开金额').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.代开点数').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.是否赔款').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.是否含税').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.货币代码').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.工厂品牌').disabled =
          false
        recordset.module.field_by_full_name(m + '.产品资料.款式编号').disabled =
          false
        if (ywpd == 1) {
          recordset.module.field_by_full_name(m + '.预计船期').show()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').show()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').show()
        } else {
          recordset.module.field_by_full_name(m + '.预计船期').hide()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').hide()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').hide()
        }
        if (username == ry && sp == '') {
        } else {
          if (hz == '通过' && sp == username) {
            recordset.module.field_by_full_name(
              m + '.产品资料.总 金 额',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.采购单价',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.代开金额',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.代开点数',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.是否含税',
            ).disabled = false
          } else {
          }
        }
        if (recordset.val('跟单人员') !== username) {
          recordset.module.field_by_full_name(
            m + '.产品资料.商检情况',
          ).disabled = true

          recordset.module.field_by_full_name(
            m + '.产品资料.交货日期',
          ).disabled = true
          recordset.module.field_by_full_name(
            m + '.产品资料.AW设计稿',
          ).disabled = true
          recordset.module.field_by_full_name(
            m + '.产品资料.SM设计稿',
          ).disabled = true
        }
      } else {
        if (
          (username !== ywry && username !== cgry && username !== gdry) ||
          sp !== ''
        ) {
          recordset.module.field_by_full_name(m + '.合同号码').disabled = true
        } else {
          recordset.module.field_by_full_name(m + '.合同号码').disabled = false
        }
        if (username == ry && sp == '') {
        } else {
          recordset.module.field_by_full_name(m + '.外销合同').disabled = true
          recordset.module.field_by_full_name(m + '.厂商编号').disabled = true
          recordset.module.field_by_full_name(m + '.生产厂家').disabled = true
          recordset.module.field_by_full_name(m + '.专业厂家id').disabled = true
          recordset.module.field_by_full_name(m + '.专业厂家').disabled = true
          recordset.module.field_by_full_name(m + '.预计船期').disabled = true
          recordset.module.field_by_full_name(m + '.下单申请').disabled = true
          recordset.module.field_by_full_name(m + '.签约地点').disabled = true
          recordset.module.field_by_full_name(m + '.交货地点').disabled = true
          recordset.module.field_by_full_name(m + '.备    注').disabled = true
          recordset.module.field_by_full_name(m + '.设计人员').disabled = true
          recordset.module.field_by_full_name(m + '.合同备注').disabled = true
          recordset.module.field_by_full_name(m + '.开票工厂').disabled = true
          recordset.module.field_by_full_name(m + '.组织机构代码').disabled =
            true
          recordset.module.field_by_full_name(m + '.开票联系人').disabled = true
          recordset.module.field_by_full_name(m + '.开票电话').disabled = true
          recordset.module.field_by_full_name(m + '.下单地点').disabled = true
        }
        recordset.module.field_by_full_name(m + '.交货日期').disabled = true
        if (username === sp) {
          recordset.module.field_by_full_name(m + '.是否核准').disabled = false
          recordset.module.field_by_full_name(m + '.采购人员').disabled = false
          recordset.module.field_by_full_name(m + '.未批原因').disabled = false
          recordset.module.field_by_full_name(m + '.交货日期').disabled = false
          if (hz == '通过') {
            recordset.module.field_by_full_name(m + '.验货人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.跟单验货备注').disabled =
              false
          }
        } else {
          recordset.module.field_by_full_name(m + '.采购人员').disabled = true
          recordset.module.field_by_full_name(m + '.是否核准').disabled = true
          recordset.module.field_by_full_name(m + '.未批原因').disabled = true
        }

        recordset.module.field_by_full_name(m + '.辅料合同').disabled = true
        recordset.module.field_by_full_name(m + '.我方公司').disabled = true
        recordset.module.field_by_full_name(m + '.客户编号').disabled = true
        recordset.module.field_by_full_name(m + '.客户名称').disabled = true
        recordset.module.field_by_full_name(m + '.货币代码').disabled = true
        recordset.module.field_by_full_name(m + '.已付定金').disabled = true
        recordset.module.field_by_full_name(m + '.定金日期').disabled = true
        recordset.module.field_by_full_name(m + '.业务人员').disabled = true
        recordset.module.field_by_full_name(m + '.采购部门').disabled = true
        recordset.module.field_by_full_name(m + '.跟单申请').disabled = true
        recordset.module.field_by_full_name(m + '.验货申请').disabled = true
        recordset.module.field_by_full_name(m + '.验货人员').disabled = true

        recordset.module.field_by_full_name(m + '.验货地点').disabled = true
        recordset.module.field_by_full_name(m + '.验货日期').disabled = true
        recordset.module.field_by_full_name(m + '.预计船期').disabled = true
        recordset.module.field_by_full_name(m + '.工厂联系').disabled = true
        recordset.module.field_by_full_name(m + '.工厂电话').disabled = true
        recordset.module.field_by_full_name(m + '.新旧合同').disabled = true
        recordset.module.field_by_full_name(m + '.跟单验货备注').disabled = true
        recordset.module.field_by_full_name(m + '.费用承担').disabled = true
        recordset.module.field_by_full_name(m + '.包装要求').disabled = true
        recordset.module.field_by_full_name(m + '.下单地点').disabled = true
        recordset.module.field_by_full_name(m + '.运输方式').disabled = true
        recordset.module.field_by_full_name(m + '.结算方式').disabled = true
        recordset.module.field_by_full_name(m + '.品质保证').disabled = true
        recordset.module.field_by_full_name(m + '.违约责任').disabled = true
        recordset.module.field_by_full_name(m + '.合同纠纷').disabled = true
        recordset.module.field_by_full_name(m + '.产品要求').disabled = true
        recordset.module.field_by_full_name(m + '.验收标准').disabled = true
        recordset.module.field_by_full_name(m + '.优惠金额').disabled = true
        recordset.module.field_by_full_name(m + '.纸卡费用').disabled = true
        recordset.module.field_by_full_name(m + '.验货报告').disabled = true
        if (username == zjl || username == sp) {
          if (sp !== '') {
            recordset.module.field_by_full_name(m + '.是否核准').disabled =
              false
          }
          recordset.module.field_by_full_name(m + '.采购人员').disabled = false
          recordset.module.field_by_full_name(m + '.未批原因').disabled = false
          recordset.module.field_by_full_name(m + '.交货日期').disabled = false
          if (hz == '通过') {
            recordset.module.field_by_full_name(m + '.跟单人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.验货人员').disabled =
              false
            recordset.module.field_by_full_name(m + '.跟单验货备注').disabled =
              false
          }
        }
        recordset.module.field_by_full_name(m + '.产品资料.产品编号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.临时货号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.产品规格').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.客户货号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.工厂货号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.专业货号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.开模编号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.厂商编号').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.厂商名称').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.专业厂家id',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.专业厂家').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.中文品名').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.英文品名').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.颜    色').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.默认价格').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.货币代码').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.开票点数').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.外销单价').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.客户RMB单价',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.赔款单价').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.采购原价').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.退 税 率').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.箱    数').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.工厂品牌').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.外箱装箱量',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.合同数量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.计量单位').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.总 金 额').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.增值税率').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.内盒装箱量',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.包装单位').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.毛    重').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.总 毛 重').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.净    重').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.总 净 重').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.中文包装').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.英文包装').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.包装长度').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.包装宽度').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.包装高度').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.外箱体积').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.总 体 积').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.出货数量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.出货金额').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.剩余数量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.剩余金额').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.统计条件').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.中文报关品名',
        ).disabled = true
        recordset.module.field_by_full_name(
          m + '.产品资料.出货样要求',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.出货合计').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.产品尺寸').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.客人交期').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.产品大类').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.厚    度').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.壁    厚').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.底    厚').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.中文尺寸').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.英文尺寸').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.实际重量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.克    重').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.中文说明').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.英文说明').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.备    注').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.工厂电话').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.确认交期').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.预计出货').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.进仓时间').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.验货数量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.不 良 率').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.结    论').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.分类名称').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.内盒/外箱',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.款  式').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.海关编码').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.一级分类').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.二级分类').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.三级分类').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.材  质').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.纸卡费用').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.产品来源').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.起 订 量').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.比  值').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.报关单位').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.客人条码').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.代开金额').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.代开金额').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.代开点数').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.是否赔款').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.是否含税').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.中文计量单位',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.货币代码').disabled =
          true
        recordset.module.field_by_full_name(m + '.产品资料.单据品名').disabled =
          true
        recordset.module.field_by_full_name(
          m + '.产品资料.单据品名英',
        ).disabled = true
        recordset.module.field_by_full_name(
          m + '.产品资料.单据品名外',
        ).disabled = true
        recordset.module.field_by_full_name(m + '.产品资料.款式编号').disabled =
          true
        if (ywpd == 1) {
          recordset.module.field_by_full_name(m + '.预计船期').show()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').show()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').show()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').show()
        } else {
          recordset.module.field_by_full_name(m + '.预计船期').hide()
          recordset.module
            .field_by_full_name(m + '.产品资料.客户RMB单价')
            .hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款RMB').hide()
          recordset.module.field_by_full_name(m + '.产品资料.外销单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.赔款单价').hide()
          recordset.module.field_by_full_name(m + '.产品资料.毛 利 率').hide()
        }
        if (username == ry && sp == '') {
        } else {
          if (hz == '通过' && sp == username) {
            recordset.module.field_by_full_name(
              m + '.产品资料.总 金 额',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.采购单价',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.代开金额',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.代开点数',
            ).disabled = false
            recordset.module.field_by_full_name(
              m + '.产品资料.是否含税',
            ).disabled = false
          } else {
            recordset.module.field_by_full_name(
              m + '.产品资料.采购单价',
            ).disabled = true
            recordset.module.field_by_full_name(
              m + '.产品资料.改价原因',
            ).disabled = true
            recordset.module.field_by_full_name(
              m + '.产品资料.代开金额',
            ).disabled = true
            recordset.module.field_by_full_name(
              m + '.产品资料.代开点数',
            ).disabled = true
            recordset.module.field_by_full_name(
              m + '.产品资料.是否含税',
            ).disabled = true
          }
        }
        if (
          recordset.val('跟单人员') != username &&
          recordset.val('跟单人员') != ''
        ) {
          recordset.module.field_by_full_name(
            m + '.产品资料.商检情况',
          ).disabled = true
          recordset.module.field_by_full_name(
            m + '.产品资料.交货日期',
          ).disabled = true
          recordset.module.field_by_full_name(
            m + '.产品资料.AW设计稿',
          ).disabled = true
          recordset.module.field_by_full_name(
            m + '.产品资料.SM设计稿',
          ).disabled = true
        }
      }
      if (recordset.val('采购人员') == '') {
        recordset.module.field_by_full_name(m + '.采购人员').disabled = false
      }
      recordset.refresh_ui()
    })
    .catch((err) => {
      console.log(err)
      _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], purchase_order_recordLoad, '采购合同')

// 编辑界面字段change后执行
const purchase_order_field_change = (evt_id, opts) => {
  let { recordset, module, field, value, old_value } = opts
  let m = module.name
  let username = _.user.username
  if (field.full_name == m + '.客户名称' && value != '') {
    _.http
      .post('/api/saier/purchase_order/khmc/change', {
        khmc: recordset.val('客户名称'),
        hthm: recordset.val('合同号码'),
      })
      .then(function (res) {
        let d = res.data
        if (d) {
          recordset.val('客户判断', d.RMBkh)
          recordset.val('采购合同期限', d.cghtqx)
          if (d.xsht != null && d.xsht != '') recordset.val('外销合同', d.xsht)
        }
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (field.full_name == m + '.专业厂家id' && value != '') {
    recordset.val('评分识别', ' 无')
    _.http
      .post('/api/saier/purchase_order/sccjid/change', {
        sccjid: recordset.val('专业厂家id'),
      })
      .then(function (res) {})
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
        recordset.val('分数不到', '是')
      })
  }
  if (
    field.full_name == m + '.专业厂家' &&
    value != '' &&
    value != null &&
    value != '待定'
  ) {
    _.http
      .post('/api/saier/purchase_order/sccj/change', {
        sccj: recordset.val('专业厂家'),
        lines: recordset.tables['产品资料'].view_data,
      })
      .then(function (res) {
        let d = res.data
        if (d == '' || d == null || d == undefined) {
          recordset.module.field_by_full_name(m + '.采购人员').disable = false
        }
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
        recordset.val('采购人员', '')
      })
  }
  if (field.full_name == m + '.是否辅料' && value != '') {
    if (recordset.val('下单申请') == '' && recordset.val('合同号码') != '') {
      let xddd = ''
      let ps = recordset.val('合同号码').length
      let hthm = recordset.val('合同号码')
      if (recordset.val('下单地点') == '宁波') {
        xddd = 'N'
      }
      if (recordset.val('下单地点') == '义乌') {
        xddd = 'Y'
      }
      if (recordset.val('下单地点') == '汕头') {
        xddd = 'S'
      }
      let da1 = hthm.substring(ps - 1, ps)
      if (
        recordset.val('是否辅料') == '是' &&
        (da1 == 'N' || da1 == 'S' || da1 == 'Y')
      ) {
        recordset.val('合同号码', hthm.substring(0, ps - 1))
      }
      if (
        recordset.val('是否辅料') == '否' &&
        da1 != 'N' &&
        da1 != 'S' &&
        da1 != 'Y'
      ) {
        recordset.val('合同号码', hthm + xddd)
      }
    }
    _.http
      .post('/api/saier/purchase_order/sffl/change', {
        sffl: recordset.val('是否辅料'),
        wxbm: recordset.val('外销部门'),
        cgbm: recordset.val('采购部门'),
        gdbm: recordset.val('跟单部门'),
        yw: recordset.val('业务'),
        cgry: recordset.val('采购人员'),
        ywry: recordset.val('业务人员'),
        gdry: recordset.val('跟单人员'),
        gsmc: recordset.val('我方公司'),
      })
      .then(function (res) {
        let d = res.data
        if (d) {
          recordset._list['采购合同.下单申请'] = d
        }
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  // if (field.full_name == m + '.采购人员' && value != '') {
  //     if (recordset.val('自建产品') != '1' && recordset.val('自建产品') == 1) {
  //         _.http.post('/api/saier/purchase_order/cgry/change', {
  //             cgry: recordset.val('采购人员')
  //         }).then(function (res) {

  //         }).catch(err => {
  //             console.log(err)
  //             _.ui.message.error(err.msg)
  //         })
  //     }
  // }

  if (field.full_name == m + '.合同日期' && value != '' && value != null) {
    let date = recordset.val('合同日期')
    recordset.val('起始年', date.substring(0, 4))
    recordset.val('起始月', date.substring(5, 7))
    recordset.val('起始年月', date.substring(0, 7))
  }
  if (field.full_name == m + '.合同号码' && value != '') {
    _.http
      .post('/api/saier/purchase_order/hthm/change', {
        hthm: recordset.val('合同号码'),
      })
      .then(function (res) {})
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
        recordset.val('合同号码', '')
      })
  }
  if (field.full_name == m + '.开票工厂') {
    if (recordset.val('开票工厂') == null || recordset.val('开票工厂') == '') {
      recordset.val('货 源 地', '')
      recordset.val('组织机构代码', '')
      recordset.val('开票联系人', '')
      recordset.val('开票电话', '')
    } else {
      _.http
        .post('/api/saier/purchase_order/kpgc/change', {
          kpgc: recordset.val('开票工厂'),
        })
        .then(function (res) {
          let d = res.data
          recordset.val('货 源 地', d.hyd)
          recordset.val('组织机构代码', d.zzjgdm)
          recordset.val('开票联系人', d.kplxr)
          recordset.val('开票电话', d.kpdh)
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    }
  }
  if (
    field.full_name == m + '.合同日期' ||
    field.full_name == m + '.交货日期'
  ) {
    if (
      recordset.val('合同日期') != '' &&
      recordset.val('交货日期') != '' &&
      recordset.val('合同日期') != null &&
      recordset.val('交货日期') != null
    ) {
      let date1 = recordset.val('交货日期')
      let date2 = recordset.val('合同日期')
      if (date1 < date2 || date1 < new Date().format('yyyy-MM-dd')) {
        _.ui.message.error('交货日期不能小于合同日期或小于今天日期！')
        recordset.val('交货日期', '')
      }
    }
  }
  if (field.full_name == m + '.产品资料.交货日期') {
    if (
      recordset.val('合同日期') != '' &&
      recordset.val('产品资料.交货日期') != '' &&
      recordset.val('合同日期') != null &&
      recordset.val('产品资料.交货日期') != null
    ) {
      let date1 = recordset.val('产品资料.交货日期')
      let date2 = recordset.val('合同日期')
      if (date1 < date2 || date1 < new Date().format('yyyy-MM-dd')) {
        _.ui.message.error('交货日期不能小于合同日期或小于今天日期！')
        recordset.val('产品资料.交货日期', '')
      }
    }
  }
  if (
    field.full_name == m + '.产品资料.内盒装箱量' ||
    field.full_name == m + '.产品资料.内盒/外箱'
  ) {
    let wxrl = recordset.val('产品资料.内盒装箱量')
    let nhwx = recordset.val('产品资料.内盒/外箱')
    if (nhwx != '1' && nhwx != '' && nhwx != '0' && nhwx != 0 && nhwx != 1) {
      recordset.val('产品资料.外箱装箱量', Number(wxrl) * Number(nhwx))
    }
  }
  if (field.full_name == m + '.产品资料.采购单价') {
    let mrdj = recordset.val('产品资料.默认价格')
    let sfpk = recordset.val('产品资料.是否赔款')
    let cgyj = recordset.val('产品资料.采购原价')
    let htsl = recordset.val('产品资料.合同数量')
    if (sfpk != '是') {
      cgyj = recordset.val('产品资料.采购单价')
    }
    if (mrdj > 0) {
      recordset.val('产品资料.节省费用', ((mrdj - cgyj) * htsl).toFixed(2))
    }
    if (recordset.val('产品资料.节省费用') < 0) {
      recordset.val('产品资料.是否确认', '否')
    } else {
      recordset.val('产品资料.是否确认', '是')
    }
  }
  if (field.full_name == m + '.产品资料.改价原因' && value != '') {
    let gjyy = recordset.val('改价原因')
    if (gjyy == null || gjyy == '') {
      gjyy =
        '产品编号:' +
        recordset.val('产品资料.产品编号') +
        '原采购单价:' +
        recordset.val('产品资料.默认价格') +
        '现采购单价:' +
        recordset.val('产品资料.采购单价') +
        '原因:' +
        recordset.val('产品资料.改价原因')
    } else {
      gjyy =
        '\n' +
        '产品编号:' +
        recordset.val('产品资料.产品编号') +
        '原采购单价:' +
        recordset.val('产品资料.默认价格') +
        '现采购单价:' +
        recordset.val('产品资料.采购单价') +
        '原因:' +
        recordset.val('产品资料.改价原因')
    }
    recordset.val('改价原因', gjyy)
  }
  if (
    field.full_name == m + '.产品资料.包装长度' ||
    field.full_name == m + '.产品资料.包装宽度' ||
    field.full_name == m + '.产品资料.包装高度'
  ) {
    let bzcd = recordset.val('产品资料.包装长度')
    let bzkd = recordset.val('产品资料.包装宽度')
    let bzgd = recordset.val('产品资料.包装高度')
    let bztj = (bzcd * bzkd * bzgd) / 1000000
    if (bztj != 0) {
      recordset.val('产品资料.外箱体积', round(bztj, 3))
      if (recordset.val('产品资料.外箱体积') < 0.001) {
        recordset.val('产品资料.外箱体积', 0.001)
      }
    }
  }
  if (
    field.full_name == m + '.产品资料.客户货号' ||
    field.full_name == m + '.产品资料.专业货号'
  ) {
    let khhh = recordset.val('产品资料.客户货号')
    let zyhh = recordset.val('产品资料.专业货号')
    if (khhh != '') {
      recordset.val('产品资料.产品货号1', khhh.trim())
    } else if (zyhh != '') {
      recordset.val('产品资料.产品货号1', zyhh.trim())
    }
  }
  if (field.full_name == m + '.产品资料.代开点数') {
    let dkds = recordset.val('产品资料.代开点数')
    if (dkds > 1) {
      recordset.val('产品资料.代开点数', dkds / 100)
    }
  }
  if (
    field.full_name == m + '.产品资料.合同数量' ||
    field.full_name == m + '.产品资料.佣金单价' ||
    field.full_name == m + '.产品资料.暗佣单价'
  ) {
    let yjdj = recordset.val('产品资料.佣金单价')
    let aydj = recordset.val('产品资料.暗佣单价')
    if (yjdj != 0) {
      recordset.val(
        '产品资料.佣    金',
        yjdj * recordset.val('产品资料.合同数量'),
      )
    } else if (aydj != 0) {
      recordset.val(
        '产品资料.暗佣佣金',
        aydj * recordset.val('产品资料.合同数量'),
      )
    }
  }
  if (field.full_name == m + '.产品资料.是否含税') {
    if (recordset.val('产品资料.是否含税') != '是') {
      recordset.val('产品资料.中文报关品名', '无')
      recordset.val('产品资料.开票工厂', '')
      recordset.val('产品资料.货 源 地', '')
      recordset.val('产品资料.退 税 率', 0)
      recordset.val('产品资料.增值税率', 0)
      recordset.val('产品资料.海关编码', '')
      recordset.val('产品资料.开票点数', 0)
    }
  }
  if (
    field.full_name == m + '.产品资料.外销唯一字段' ||
    field.full_name == m + '.产品资料.专业货号'
  ) {
    _.http
      .post('/api/saier/purchase_plan/items/wxwyzd2/change', {
        wyzd: recordset.val('产品资料.外销唯一字段'),
        zyhh: recordset.val('产品资料.专业货号'),
      })
      .then((res) => {})
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
        recordset.val('产品资料.专业货号', '')
      })
  }

  if (field.full_name == m + '.产品资料.专业货号') {
    if (
      recordset.val('专业厂家') == '' ||
      recordset.val('专业厂家') == '待定' ||
      recordset.val('产品资料.专业货号') == '' ||
      recordset.val('产品资料.专业货号') == null
    ) {
      recordset.module.field_by_full_name(m + '.采购人员').disable = false
    } else {
      _.http
        .post('/api/saier/purchase_order/zyhh/change', {
          sccj: recordset.val('专业厂家'),
          zyhh: recordset.val('产品资料.专业货号'),
        })
        .then((res) => {
          if (res.data.cgy != null && res.data.cgy != '') {
            recordset.val('采购人员', res.data.cgy)
          } else {
            recordset.module.field_by_full_name(m + '.采购人员').disable = false
          }
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    }
  }
  if (field.full_name == m + '.产品资料.主产品货号' && value != '') {
    _.http
      .post('/api/saier/purchase_order/zcphh/change', {
        zyhh: recordset.val('产品资料.主产品货号'),
      })
      .then((res) => {
        let d = res.data
        if (d && Number(d) < 0.00001) recordset.val('产品资料.主产品货号', '')
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (
    field.full_name == m + '.产品资料.客户货号' &&
    value != '' &&
    recordset.val('产品资料.专业货号') == ''
  ) {
    _.http
      .post('/api/saier/purchase_order/khhh/change', {
        zyhh: recordset.val('产品资料.专业货号'),
        khhh: recordset.val('产品资料.客户货号'),
        khbh: recordset.val('客户编号'),
      })
      .then((res) => {
        let d = res.data
        if (d && d != '') recordset.val('产品资料.专业货号', d)
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (
    field.full_name == m + '.产品资料.采购单价' ||
    field.full_name == m + '.产品资料.合同数量' ||
    field.full_name == m + '.产品资料.辅料价格'
  ) {
    let cgdj = recordset.val('产品资料.采购单价')
    let htsl = recordset.val('产品资料.合同数量')
    let fllj = recordset.val('产品资料.辅料价格')
    let cgzj = Math.floor(cgdj * htsl * 100) / 100
    recordset.val('产品资料.总 金 额', cgzj)
    recordset.val('产品资料.辅料总价', Math.floor(fllj * htsl * 100) / 100)
    if (recordset.val('产品资料.是否赔款') != '是') {
      recordset.val('产品资料.采购原价', cgdj)
    }
    let cgyj = recordset.val('产品资料.采购原价')
    if (cgyj == 0) {
      _.ui.message.error('请输入采购原价')
    }
    if (
      cgzj != 0 &&
      recordset.val('产品资料.单证锁定') == '' &&
      recordset.val('是否核准') == '通过' &&
      recordset.val('下单申请') == username
    ) {
      _.http
        .post('/api/saier/purchase_order/cgdj/change', {
          wyzd: recordset.val('产品资料.外销唯一字段'),
          zyhh: recordset.val('产品资料.专业货号'),
        })
        .then((res) => {
          let d = res.data
          if (d) {
            recordset.val('产品资料.外销单价', d.wxdj)
            recordset.val('产品资料.赔款单价', d.Twxdj)
            recordset.val('客户RMB单价', d.mjdj1)
            recordset.val('赔款RMB', d.pkRMB)
            recordset.val('暗佣比率', d.aybl)
            recordset.val('暗佣单价', d.asl6)
            recordset.val('佣金比率', d.yjbl)
            recordset.val('佣金单价', d.sl6)
          }
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
          recordset.val('产品资料.专业货号', '')
        })
    }
  }
  if (field.full_name == m + '.产品资料.专业货号') {
    let hthm = recordset.val('合同号码')
    hthm = hthm.toUpperCase()
    let wxht = recordset.val('外销合同')
    wxht = wxht.toUpperCase()
    if (recordset.val('产品资料.专业货号') != '') {
      let zyhh = recordset.val('产品资料.专业货号')
      let zs = zyhh.length
      let cx1z = zyhh.substring(zs - 1)
      if (
        cx1z.toUpperCase() == 'L' &&
        recordset.val('产品资料.主产品货号') == ''
      ) {
        _.ui.message.error('辅料产品请先填写主产品货号,谢谢!')
        recordset.val('产品资料.专业货号', '')
      }
    } else {
      recordset.val(
        '产品资料.专业货号',
        recordset.val('产品资料.专业货号').trim(),
      )
    }

    let khhh = recordset.val('产品资料.客户货号')
    let zyhh = recordset.val('产品资料.专业货号')
    if (khhh != '') {
      recordset.val('产品资料.产品货号1', khhh.trim())
    } else if (zyhh != '') {
      recordset.val('产品资料.产品货号1', zyhh.trim())
    }

    if (
      recordset.val('产品资料.专业货号') != '' &&
      (recordset.val('是否辅料') == '是' ||
        hthm.indexOf('AMZ') != -1 ||
        wxht.indexOf('AMZ') != -1)
    ) {
      recordset.val('产品资料.专业货号1', recordset.val('产品资料.专业货号'))
      let khbh = recordset.val('客户编号')
      let zyhh = recordset.val('产品资料.专业货号')
      if (recordset.val('部门识别') == '1') {
        _.http
          .post('/api/saier/purchase_order/zyhh/update', {
            sccj: recordset.val('专业厂家'),
            zyhh: recordset.val('产品资料.专业货号'),
          })
          .then((res) => {
            let d = res.data
            if (!d) {
              recordset.val('产品资料.客户货号', '')
              recordset.val(
                '产品资料.专业产品编号',
                recordset.val('产品资料.专业货号'),
              )
            } else {
              recordset.val('产品资料.客户货号', d.krhh)
              recordset.val('产品资料.客人条码', d.krtm)
              if (d.fljg) recordset.val('产品资料.辅料价格', d.fljg)
              recordset.val('产品资料.开票点数', d.ljrk)
              recordset.val('产品资料.产品规格', d.cpggz)
              recordset.val('产品资料.规格英语', d.cpgg)
              recordset.val('产品资料.可思达货号', d.ksdhh)
              recordset.val('产品资料.颜    色', d.yse)
              recordset.val('产品资料.货币代码', d.cghbdm)
              recordset.val('产品资料.颜色英文', d.ysez)
              recordset.val('产品资料.中文品名', d.zwpm)
              recordset.val('产品资料.英文品名', d.ywpm)
              recordset.val('产品资料.计量单位', d.jldw)
              recordset.val('产品资料.中文计量单位', d.zwdw)
              recordset.val('产品资料.采购单价', d.cgdj)
              recordset.val('产品资料.比  值', d.hhcb)
              recordset.val('产品资料.包装单位', d.bzdw)
              recordset.val('产品资料.包装长度', d.bzcd)
              recordset.val('产品资料.包装宽度', d.bzkd)
              recordset.val('产品资料.包装高度', d.bzgd)
              recordset.val('产品资料.内盒/外箱', d.nhwx)
              recordset.val('产品资料.外箱体积', d.bztj)
              recordset.val('产品资料.中文包装', d.zhwbzh)
              recordset.val('产品资料.英文包装', d.bzhfsh)
              recordset.val('产品资料.毛    重', d.mxmz)
              recordset.val('产品资料.净    重', d.mxjz)
              recordset.val('产品资料.产品尺寸', d.chpchc)
              recordset.val('产品资料.中文说明', d.cpsm)
              recordset.val('产品资料.英文说明', d.ywsm)
              recordset.val('产品资料.中文尺寸', d.zwcc)
              recordset.val('产品资料.英文尺寸', d.ywcc)
              recordset.val('产品资料.款  式', d.ks)
              recordset.val('产品资料.产品大类', d.cpfl)
              recordset.val('产品资料.一级分类', d.yjfl)
              recordset.val('产品资料.二级分类', d.ejfl)
              recordset.val('产品资料.三级分类', d.sjfl)
              recordset.val('产品资料.分类名称', d.flmc)
              recordset.val('产品资料.外语品名', d.wypp)
              recordset.val('产品资料.规格外语', d.ggwy)
              recordset.val('产品资料.材质外语', d.czwy)
              recordset.val('产品资料.颜色外语', d.yswy)
              recordset.val('产品资料.外语说明', d.wysm)
              recordset.val('产品资料.单据品名', d.djpm)
              recordset.val('产品资料.单据品名英', d.djpmy)
              recordset.val('产品资料.单据品名外', d.djpmw)
              recordset.val('产品资料.客人CODE', d.krcode)
              recordset.val('产品资料.材  质', d.caiziz)
              recordset.val('产品资料.中文报关品名', d.bgpm)
              recordset.val('产品资料.海关编码', d.hgbm)
              recordset.val('产品资料.备    注', d.bz3)
              recordset.val('产品资料.内盒装箱量', d.nhrl)
              recordset.val('产品资料.外箱装箱量', d.bzrl)
              recordset.val('产品资料.增值税率', d.zzsl)
              recordset.val('产品资料.退 税 率', d.tsl)
              recordset.val('产品资料.报关单位', d.bgjldw)
              recordset.val('产品资料.产品来源', d.topcz)
              recordset.val('产品资料.专业产品编号', d.cpbh)
              recordset.val('产品资料.工厂货号', d.gchh1)
            }
          })
          .catch((err) => {
            console.log(err)
            _.ui.message.error(err.msg)
          })
        recordset.val('产品资料.货号备注', zyhh)
      }
    }
  }
  if (
    field.full_name == m + '.产品资料.外箱装箱量' ||
    field.full_name == m + '.产品资料.箱 数'
  ) {
    let xs = recordset.val('产品资料.箱    数')
    let wxzl = recordset.val('产品资料.外箱装箱量')
    let wxwyzd = recordset.val('产品资料.外销唯一字段')
    let cgwyzd = recordset.val('产品资料.唯一字段')
    let htsl = 0
    if ((xs > 0 || recordset.val('产品资料.合同数量') > 0) && wxzl > 0) {
      if (recordset.val('产品资料.拼箱标记') != '是') {
        htsl =
          recordset.val('产品资料.外箱装箱量') *
          recordset.val('产品资料.箱    数')
      } else {
        htsl = recordset.val('产品资料.合同数量')
      }
      _.http
        .post('/api/saier/purchase_order/wxzl/change', {
          cghth: recordset.val('合同号码'),
          pgwy: cgwyzd,
          wxwy: wxwyzd,
          htsl: htsl,
        })
        .then((res) => {
          let d = res.data
          let xssl = d.xssl
          let cgsl = d.cgsl
          let cgxs = d.cgxs
          let wxrl = d.wxrl
          let saved = d.saved
          if (
            recordset.val('产品资料.外销唯一字段') == '' ||
            xssl >= htsl + cgsl
          ) {
            if (recordset.val('产品资料.拼箱标记') != '是') {
              recordset.val('产品资料.合同数量', wxzl * xs)
            }
            recordset.val(
              '产品资料.剩余数量',
              recordset.val('产品资料.合同数量'),
            )
            recordset.val('产品资料.出货数量', 0)
            recordset.val('产品资料.出货合计', 0)
          } else {
            if (saved == 1) {
              _.ui.message.error(
                '此合同总体下单数大于外销下单数请核实。请输入原箱数！' + cgxs,
              )
              recordset.val('产品资料.外箱装箱量', wxrl)
              recordset.val('产品资料.合同数量', 0)
              recordset.val('产品资料.箱    数', 0)
            } else {
              _.ui.message.error('此合同总体下单数大于外销下单数请核实')
              recordset.val('产品资料.合同数量', 0)
              recordset.val('产品资料.箱    数', 0)
            }
          }
        })
        .catch((r) => {
          console.log(r)
          _.ui.message.error(r.msg)
          let chsl = r.data.chsl
          recordset.val('产品资料.合同数量', chsl)
          recordset.val('产品资料.箱    数', round(chsl / wxzl, 2))
        })
    }
  }

  let fields = [
    m + '.产品资料.采购单价',
    m + '.产品资料.开票工厂',
    m + '.产品资料.组织机构代码',
    m + '.产品资料.开票联系人',
    m + '.产品资料.开票电话',
    m + '.产品资料.产品规格',
    m + '.产品资料.专业厂家',
    m + '.产品资料.结算方式',
  ]
  if (fields.indexOf(field.full_name) !== -1) {
    if (
      recordset.val('产品资料.单证锁定') != '' &&
      recordset.val('合同号码') != ''
    ) {
      let wxwyzd = recordset.val('产品资料.外销唯一字段')
      let cgwyzd = recordset.val('产品资料.唯一字段')
      _.http
        .post('/api/saier/purchase_order/item/kpgc/change', {
          cghth: recordset.val('合同号码'),
          cgwyzd: cgwyzd,
          wxwyzd: wxwyzd,
          rid: recordset.val('rid'),
        })
        .then((res) => {
          let d = res.data
          let sdpd = d.sdpd
          let ytsb = d.ytsb
          if (d && (sdpd == 1 || ytsb == 1)) {
            let cgjg = round(d.line.cgjg, 3)
            let nhrl = d.line.nhrl
            let nhwx = d.line.nhwx
            let wxrl = d.line.wxrl
            let kpgc = d.line.kpgc
            let zzjgdm = d.line.zzjgdm
            let kplxr = d.line.kplxr
            let kpdh = d.line.kpdh
            let cpgg = d.line.cpgg
            let sccj1 = d.line.sccj1
            let jsfs = d.line.jsfs
            let cgsl = d.line.cgsl
            let cgxs = d.line.cgxs
            let cgjg1 = round(recordset.val('产品资料.采购单价'), 3)
            let kpgc1 = recordset.val('产品资料.开票工厂')
            let zzjgdm1 = recordset.val('产品资料.组织机构代码')
            let kplxr1 = recordset.val('产品资料.开票联系人')
            let kpdh1 = recordset.val('产品资料.开票电话')
            let cpgg1 = recordset.val('产品资料.产品规格')
            let sccj11 = recordset.val('产品资料.专业厂家')
            let jsfs1 = recordset.val('产品资料.结算方式')
            if (
              kpgc != kpgc1 ||
              zzjgdm != zzjgdm1 ||
              kplxr != kplxr1 ||
              kpdh != kpdh1 ||
              cpgg != cpgg1 ||
              sccj1 != sccj11 ||
              jsfs != jsfs1 ||
              cgjg != cgjg1
            ) {
              if (sdpd == '1') {
                _.ui.message.error(
                  '不好意思,这个货号已经由单证:' +
                    recordset.val('产品资料.单证锁定') +
                    '锁定，请联系相关单证人员解锁',
                )
              } else {
                _.ui.message.error(
                  '不好意思,这个合同已有预填，请先删除相关信息',
                )
              }
              recordset.val('产品资料.采购单价', cgjg)
              recordset.val('产品资料.内盒装箱量', nhrl)
              recordset.val('产品资料.内盒/外箱', nhwx)
              recordset.val('产品资料.外箱装箱量', wxrl)
              recordset.val('产品资料.合同数量', cgsl)
              recordset.val('产品资料.箱    数', cgxs)
              recordset.val('产品资料.开票工厂', kpgc)
              recordset.val('产品资料.组织机构代码', zzjgdm)
              recordset.val('产品资料.开票联系人', kplxr)
              recordset.val('产品资料.开票电话', kpdh)
              recordset.val('产品资料.产品规格', cpgg)
              recordset.val('产品资料.专业厂家', sccj1)
              recordset.val('产品资料.结算方式', jsfs)
            }
          } else {
            recordset.val('产品资料.单证锁定', '')
          }
        })
        .catch((r) => {
          console.log(r)
          _.ui.message.error(r.msg)
        })
    }
  }

  // 改成了保存后执行更新
  // fields = [m + '.产品资料.总 金 额', m + '.产品资料.退 税 率', m + '.产品资料.增值税率']
  // if (fields.indexOf(field.full_name) !== -1) {
  //     if (recordset.val('产品资料.外销唯一字段') != '') {
  //         _.http.post('/api/saier/purchase_order/item/tsl/change', {
  //             wxwyzd: recordset.val('产品资料.外销唯一字段')
  //         }).then(res => {
  //         }).catch(err => {
  //             console.log(err)
  //             _.ui.message.error(err.msg)
  //         })
  //     }
  // }

  fields = [
    m + '.产品资料.总 金 额',
    m + '.产品资料.退 税 率',
    m + '.产品资料.代开金额',
    m + '.产品资料.代开点数',
    m + '.产品资料.赔款单价',
    m + '.产品资料.赔款RMB',
  ]
  if (fields.indexOf(field.full_name) !== -1) {
    let zje = 0
    if (recordset.val('客户判断') != '是') {
      zje =
        recordset.val('产品资料.赔款单价') + recordset.val('产品资料.合同数量')
    } else {
      zje =
        recordset.val('产品资料.赔款RMB') + recordset.val('产品资料.合同数量')
    }
    let htje = recordset.val('产品资料.总 金 额')
    if (htje != 0) {
      if (recordset.val('产品资料.拼箱标记') != '是') {
        htsl =
          recordset.val('产品资料.外箱装箱量') *
          recordset.val('产品资料.箱    数')
      } else {
        htsl = recordset.val('产品资料.合同数量')
      }
      _.http
        .post('/api/saier/purchase_order/item/zje/change', {
          khmc: recordset.val('客户名称'),
          cgbz: recordset.val('产品资料.货币代码'),
        })
        .then((res) => {
          let d = res.data
          let hlcg = d.cghl
          let sb = d.yjpd
          let zjl = d.zjl
          let cgzj =
            recordset.val('产品资料.总 金 额') * hlcg +
            recordset.val('产品资料.辅料总价')
          let zzsl = recordset.val('产品资料.增值税率')
          let tsl = recordset.val('产品资料.退 税 率')
          let zzsl1 = 0
          if (zzsl > 3) {
            zzsl1 = recordset.val('产品资料.增值税率')
          }
          let zzsl2 = 1 + zzsl1 / 100
          let fyl = recordset.val('费 用 率')
          let hl = recordset.val('汇    率')
          let mldx = recordset.val('毛利底线')
          let htsl = recordset.val('产品资料.合同数量')
          let nxkh = d.nxkh
          if (recordset.val('客户名称') != '') {
            if (recordset.val('产品资料.佣金比率') >= 0 && sb == 0) {
              recordset.val(
                '产品资料.佣    金',
                zje * recordset.val('产品资料.佣金比率'),
              )
            } else {
              if (recordset.val('产品资料.佣金单价') >= 0 && sb == 1) {
                recordset.val(
                  '产品资料.佣    金',
                  recordset.val('产品资料.佣金单价') *
                    recordset.val('产品资料.合同数量'),
                )
              }
            }
            if (recordset.val('产品资料.暗佣比率') >= 0 && sb == 0) {
              recordset.val(
                '产品资料.暗佣佣金',
                zje * recordset.val('产品资料.暗佣比率'),
              )
            } else {
              if (recordset.val('产品资料.暗佣单价') >= 0 && sb == 1) {
                recordset.val(
                  '产品资料.暗佣佣金',
                  recordset.val('产品资料.暗佣单价') *
                    recordset.val('产品资料.合同数量'),
                )
              }
            }
          }
          if (nxkh === '是') {
            if (recordset.val('客户判断') === '是') {
              let mjdj =
                recordset.val('产品资料.赔款RMB') *
                recordset.val('产品资料.合同数量')
              let sj1 =
                ((mjdj - cgzj - recordset.val('产品资料.代开金额')) / zzsl2) *
                  (zzsl1 / 100) +
                recordset.val('产品资料.代开点数') *
                  recordset.val('产品资料.代开金额')
              let mll =
                (mjdj -
                  recordset.val('产品资料.佣    金') -
                  cgzj -
                  recordset.val('产品资料.代开金额') -
                  recordset.val('产品资料.暗佣佣金')) /
                (mjdj - recordset.val('产品资料.佣    金'))
              recordset.val('产品资料.毛 利 率', mll)
              recordset.val('产品资料.税   金', sj1)
            } else {
              let mjdj =
                recordset.val('产品资料.赔款单价') *
                recordset.val('产品资料.合同数量') *
                hl
              if (recordset.val('产品资料.佣    金') === 0) {
                recordset.val(
                  '产品资料.佣    金',
                  mjdj * recordset.val('产品资料.佣金比率'),
                )
              }
              let sj1 =
                ((mjdj - cgzj - recordset.val('产品资料.代开金额')) / zzsl2) *
                  (zzsl1 / 100) +
                recordset.val('产品资料.代开点数') *
                  recordset.val('产品资料.代开金额')
              let mll =
                (mjdj -
                  recordset.val('产品资料.佣    金') * hl -
                  cgzj -
                  recordset.val('产品资料.代开金额') -
                  recordset.val('产品资料.暗佣佣金') * hl) /
                mjdj
              recordset.val('产品资料.毛 利 率', mll)
              recordset.val('产品资料.税   金', sj1)
            }
          } else {
            hl = 1
            if (recordset.val('客户判断') !== '是') {
              hl = recordset.val('汇    率')
            }
            if (
              (recordset.val('产品资料.赔款单价') > 0 ||
                recordset.val('产品资料.赔款RMB') > 0) &&
              cgzj > 0
            ) {
              fyl = recordset.val('费 用 率')
              mldx = recordset.val('毛利底线')
              zzsl = recordset.val('产品资料.增值税率')
              htsl = recordset.val('产品资料.合同数量')
              if (tsl === 0) {
                zzsl = 0
              }
              if (tsl > 0 || tsl > zzsl) {
                if (tsl === 3) {
                  zzsl = 3
                  recordset.setfielddataasinteger('产品资料', '增值税率', zzsl)
                }
                if (tsl > 3) {
                  zzsl = zzsl1
                  recordset.setfielddataasinteger('产品资料', '增值税率', zzsl)
                }
              }
              if (htsl > 0 && mldx > 0 && hl > 0) {
                let a = 0
                let hhcb = 0
                let mll = 0
                if (recordset.val('客户判断') !== '是') {
                  hhcb =
                    (cgzj +
                      recordset.val('产品资料.纸卡费用') +
                      recordset.val('产品资料.暗佣佣金') * hl) /
                    (htsl * recordset.val('产品资料.赔款单价') -
                      recordset.val('产品资料.佣    金'))
                } else {
                  hhcb =
                    (cgzj +
                      recordset.val('产品资料.纸卡费用') +
                      recordset.val('产品资料.暗佣佣金')) /
                    (htsl * recordset.val('产品资料.赔款RMB') -
                      recordset.val('产品资料.佣    金'))
                }
                if (zzsl === zzsl1) {
                  if (tsl === 5) {
                    a = 1.11
                  } else {
                    a = 1 + (zzsl - tsl) / 100
                  }
                  if (a * hl !== 0) {
                    if (fyl === 0) {
                      mll = ((zzsl2 / a) * hl - hhcb) / ((zzsl2 / a) * hl)
                    } else {
                      if (a * hl !== 0 && a * hl * fyl !== 0) {
                        mll =
                          ((zzsl2 / a) * hl - (zzsl2 / a) * hl * fyl - hhcb) /
                          ((zzsl2 / a) * hl)
                      }
                    }
                  }
                }
                if (zzsl === 3 && tsl === 3) {
                  if (1.03 * hl !== 0) {
                    mll = (1.03 * hl - 1.03 * hl * fyl - hhcb) / (1.03 * hl)
                  }
                }
                if (zzsl === 1 && tsl === 1) {
                  if (1.01 * hl !== 0) {
                    mll = (1.01 * hl - 1.01 * hl * fyl - hhcb) / (1.01 * hl)
                  }
                }
                if (zzsl === 0 && tsl === 0) {
                  mll = (hl - hl * fyl - hhcb) / hl
                }
                recordset.val('产品资料.毛 利 率', mll)
              }
            }
          }
        })
        .catch((r) => {
          console.log(r)
          _.ui.message.error(r.msg)
        })
    }
  }

  if (field.full_name == m + '.查看人员.查看人员' && value != '') {
    let ckry = recordset.val('查看人员.查看人员')
    let sb = recordset.val('查看人员.识别')
    if (sb != '有') {
      _.http
        .post('/api/saier/purchase_order/view/ckry/change', {
          ckry: ckry,
          module: recordset.module.name,
          rid: recordset.val('rid'),
        })
        .then((res) => {
          let d = res.data
          recordset.val('查看人员.father1', recordset.val('rid'))
          recordset.val('查看人员.module1', recordset.module.name)
          recordset.val('查看人员.objectnumber1', d.uid)
          recordset.val('查看人员.path', d.path)
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    } else {
      _.ui.message.error('该查看人员已存在，无需重复添加')
      _.plaform.active.reload_data()
    }
  }
  if (field.full_name == m + '.查看人员.查看人员') {
    let ckry = recordset.val('查看人员.查看人员')
    let sjck = recordset.val('查看人员.上级查看')
    if (ckry != '') {
      if (sjck == '是') {
        _.http
          .post('/api/saier/purchase_order/view/cksj/change', {
            ckry: ckry,
            module: recordset.module.name,
            rid: recordset.val('rid'),
          })
          .then((res) => {
            let d = res.data
            let t = recordset.tables['查看人员']
            let y = t.view_data
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
              t.sync_operate_data()
              t.modified = true
            }
          })
          .catch((err) => {
            console.log(err)
            _.ui.message.error(err.msg)
          })
      }
    } else {
      _.ui.message.error('请先填写查看人员')
      _.plaform.active.reload_data()
    }
  }
  if (field.full_name == m + '.下单申请' && value != '') {
    if (recordset.val('新旧合同') == '作废') {
      _.ui.message.error('请注意此合同已作废')
      recordset.val('下单申请', '')
      recordset.val('下单申请1', '')
      recordset.val('价格确认', '')
    }
    if (recordset.val('下单申请') != '' && recordset.val('跟单人员') == '') {
      _.ui.message.error('请先填写跟单人员')
      recordset.val('下单申请', '')
      recordset.val('下单申请1', '')
      recordset.val('价格确认', '')
    }
    if (recordset.val('下单申请') != '' && recordset.val('合同号码') == '') {
      _.ui.message.error('请先保存记录')
      recordset.val('下单申请', '')
      recordset.val('下单申请1', '')
      recordset.val('价格确认', '')
    }
    if (
      recordset.val('下单申请') != '' &&
      recordset.val('下单申请') == username
    ) {
      _.ui.message.error('审批人不能是自己')
      recordset.val('下单申请', '')
      recordset.val('下单申请1', '')
      recordset.val('价格确认', '')
    }
    let wyzd = recordset.val('唯一字段')
    if (recordset.val('下单申请') != '' && recordset.val('唯一字段') == '') {
      _.ui.message.error('请先保存记录')
      recordset.val('下单申请', '')
      recordset.val('下单申请1', '')
      recordset.val('价格确认', '')
    }
    if (recordset.val('下单申请') != '') {
      let q = 0
      let b = 0
      let bjdl = recordset.val('业务')
      let hthm = recordset.val('合同号码')
      let xdsq = recordset.val('下单申请')
      let gdry = recordset.val('跟单人员')
      let htrq = recordset.val('交货日期')
      let wfgs = recordset.val('我方公司')
      let jsfs = recordset.val('结算方式')
      let t = recordset.tables['产品资料']
      let lines = t.view_data
      _.http
        .post('/api/saier/purchase_order/xdsq/change', {
          xdsq: xdsq,
          hthm: hthm,
          gsmc: wfgs,
          bjdl: bjdl,
          gdry: gdry,
          jsfs: jsfs,
          lines: lines,
        })
        .then((res) => {
          let d = res.data
          let path1 = d.path1
          let q = d.q
          let hz = d.hz
          let tssp = d.tssp
          if (q == 1 || tssp == '是') {
            recordset.val('特殊审批', '是')
          }
          recordset.val('path1', path1)
          recordset.val('发信识别', '是')
          recordset.val('是否核准', '待审批')
          recordset.val('涨价数目', q)
          for (let r of lines) {
            let rid = r.rid
            if (r.jhrq == '' || r.jhrq == null) {
              r.jhrq = htrq
              t.push_modi_rid(rid)
            }
          }
          t.sync_operate_data()
          t.modified = true
          if (hz == username && spsq != username) {
            _.ui
              .show_input_dialog('请指定跟单人员,空白为不指定', '')
              .then((val) => {
                if (val) {
                  recordset.val('跟单人员', val)
                }
              })
          }
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
          recordset.val('下单申请', '')
          recordset.val('下单申请1', '')
          recordset.val('价格确认', '')
        })
    }
  }
}
_.evts.on(
  _.evtids.RECORD_FIELD_CHANGED,
  purchase_order_field_change,
  '采购合同',
)

const purchase_order_table_set = (
  m,
  t,
  v,
  w,
  y,
  recordset,
  zcpbh,
  cq,
  tsl,
  zzsl,
  hgbm,
  username,
  ywpath,
) => {
  let i4 = 0
  let bjdl = recordset.val('业务')
  for (let r of v) {
    let rid = r.rid
    let b = 0
    i4 = i4 + 1
    let zygc = ''
    r[recordset.module.field_by_full_name(m + '.产品资料.图片货号').db.name] =
      username + new Date().format('yyyyMMdd hhmmss') + ';' + i4
    if (
      r[
        recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name
      ] == ''
    ) {
      r[recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name] =
        recordset.val('交货日期')
    }
    r[recordset.module.field_by_full_name(m + '.产品资料.采购汇率').db.name] =
      recordset.val('汇    率')
    r[recordset.module.field_by_full_name(m + '.产品资料.采购总额2').db.name] =
      recordset.val('汇    率') *
      r[recordset.module.field_by_full_name(m + '.产品资料.总 金 额').db.name]
    r[recordset.module.field_by_full_name(m + '.产品资料.客户名称').db.name] =
      recordset.val('客户名称')
    r[recordset.module.field_by_full_name(m + '.产品资料.采购部门').db.name] =
      recordset.val('采购部门')
    r[recordset.module.field_by_full_name(m + '.产品资料.外销部门').db.name] =
      recordset.val('外销部门')
    r[recordset.module.field_by_full_name(m + '.产品资料.合同日期').db.name] =
      recordset.val('合同日期')
    r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] =
      recordset.val('采购人员')
    r[recordset.module.field_by_full_name(m + '.产品资料.采购path').db.name] =
      bjdl.substring(1, bjdl.length - 1)
    r[recordset.module.field_by_full_name(m + '.产品资料.新旧合同').db.name] =
      recordset.val('新旧合同')
    r[recordset.module.field_by_full_name(m + '.产品资料.下单地点').db.name] =
      recordset.val('下单地点')
    if (
      r[
        recordset.module.field_by_full_name(m + '.产品资料.单证锁定').db.name
      ] == ''
    ) {
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.预计船期').db.name
        ] != '' &&
        r[
          recordset.module.field_by_full_name(m + '.产品资料.预计船期').db.name
        ] != null
      ) {
        if (cq == '') {
          cq =
            r[
              recordset.module.field_by_full_name(m + '.产品资料.预计船期').db
                .name
            ]
        } else {
          if (
            cq <
            r[
              recordset.module.field_by_full_name(m + '.产品资料.预计船期').db
                .name
            ]
          ) {
            cq =
              r[
                recordset.module.field_by_full_name(m + '.产品资料.预计船期').db
                  .name
              ]
          }
        }
      } else {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.预计船期').db.name
        ] = cq
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.唯一字段').db.name
        ] == ''
      ) {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.唯一字段').db.name
        ] = r.rid
      }
      if (
        (r[
          recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db
            .name
        ] == '' ||
          r[
            recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db
              .name
          ] == '无') &&
        r[
          recordset.module.field_by_full_name(m + '.产品资料.是否含税').db.name
        ] == '是'
      ) {
        r[
          recordset.module.field_by_full_name(
            m + '.产品资料.中文报关品名',
          ).db.name
        ] = recordset.val('开票品名')
        r[
          recordset.module.field_by_full_name(m + '.产品资料.海关编码').db.name
        ] = hgbm
        r[
          recordset.module.field_by_full_name(m + '.产品资料.退 税 率').db.name
        ] = tsl
        r[
          recordset.module.field_by_full_name(m + '.产品资料.增值税率').db.name
        ] = zzsl
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.到货地点').db.name
        ] == ''
      ) {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.到货地点').db.name
        ] = recordset.val('交货地点')
      }
      if (recordset.val('跟单人员') != '') {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name
        ] = recordset.val('跟单人员')
      }
      if (recordset.val('跟单部门') != '') {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.跟单部门').db.name
        ] = recordset.val('跟单部门')
      }
      let hbdm = recordset.val('货币代码')
      r[recordset.module.field_by_full_name(m + '.产品资料.导入标志').db.name] =
        '否'
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.未入库数').db.name
        ] == 0
      ) {
        if (
          r[
            recordset.module.field_by_full_name(m + '.产品资料.入库情况').db
              .name
          ] == '否'
        ) {
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.未入库数',
            ).db.name
          ] =
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.合同数量',
              ).db.name
            ]
        }
      }
      r[recordset.module.field_by_full_name(m + '.产品资料.货币代码').db.name] =
        hbdm
      r[recordset.module.field_by_full_name(m + '.产品资料.结算方式').db.name] =
        recordset.val('结算方式')
      r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name] =
        recordset.val('厂商编号')
      r[
        recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name
      ] = recordset.val('专业厂家id')
      r[recordset.module.field_by_full_name(m + '.产品资料.合同号码').db.name] =
        recordset.val('合同号码')
      r[
        recordset.module.field_by_full_name(
          m + '.产品资料.采购合同唯一字段',
        ).db.name
      ] = recordset.val('唯一字段')
      r[recordset.module.field_by_full_name(m + '.产品资料.外销合同').db.name] =
        recordset.val('外销合同')
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.是否含税').db.name
        ] == '是'
      ) {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name
        ] = recordset.val('开票工厂')
        r[
          recordset.module.field_by_full_name(
            m + '.产品资料.组织机构代码',
          ).db.name
        ] = recordset.val('组织机构代码')
        r[
          recordset.module.field_by_full_name(
            m + '.产品资料.开票联系人',
          ).db.name
        ] = recordset.val('开票联系人')
        r[
          recordset.module.field_by_full_name(m + '.产品资料.开票电话').db.name
        ] = recordset.val('开票电话')
        r[
          recordset.module.field_by_full_name(m + '.产品资料.货 源 地').db.name
        ] = recordset.val('货 源 地')
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.未入库数').db.name
        ] == 0
      ) {
        if (
          r[
            recordset.module.field_by_full_name(m + '.产品资料.入库情况').db
              .name
          ] == '否'
        ) {
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.未入库数',
            ).db.name
          ] =
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.合同数量',
              ).db.name
            ]
        }
      }
      r[recordset.module.field_by_full_name(m + '.产品资料.货币代码').db.name] =
        recordset.val('货币代码')
      if (recordset.val('产品资料.厂商名称') != '') {
        zygc = recordset.val('产品资料.厂商名称')
      } else {
        zygc = recordset.val('产品资料.专业厂家')
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.厂商名称').db.name
        ] != recordset.val('产品资料.厂商名称')
      ) {
        b = 1
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name
        ] != recordset.val('专业厂家')
      ) {
        b = 1
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.原有单价').db.name
        ] == 0
      ) {
        r[
          recordset.module.field_by_full_name(m + '.产品资料.原有单价').db.name
        ] =
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.采购单价',
            ).db.name
          ]
      }
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name
        ] !=
        r[recordset.module.field_by_full_name(m + '.产品资料.原有单价').db.name]
      ) {
        b = 1
      }
      if (b == 1) {
        let z = {}
        z[
          recordset.module.field_by_full_name(m + '.修改记录.修改日期').db.name
        ] = new Date().format('yyyy-MM-dd')
        z['rid'] = _.utils.guid()
        z['uid'] = _.user.rid
        z['citme'] = new Date().format('yyyy-MM-dd hh:mm:ss')
        z['pid'] = recordset.val('rid')
        z[
          recordset.module.field_by_full_name(m + '.修改记录.产品货号').db.name
        ] =
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.专业货号',
            ).db.name
          ]
        if (
          r[
            recordset.module.field_by_full_name(m + '.产品资料.厂商名称').db
              .name
          ] != ''
        ) {
          z[
            recordset.module.field_by_full_name(
              m + '.修改记录.原有工厂',
            ).db.name
          ] =
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.厂商名称',
              ).db.name
            ]
          z[
            recordset.module.field_by_full_name(
              m + '.修改记录.新的工厂',
            ).db.name
          ] = zygc
        } else {
          z[
            recordset.module.field_by_full_name(
              m + '.修改记录.原有工厂',
            ).db.name
          ] =
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.专业厂家',
              ).db.name
            ]
          z[
            recordset.module.field_by_full_name(
              m + '.修改记录.新的工厂',
            ).db.name
          ] = zygc
        }
        z[
          recordset.module.field_by_full_name(m + '.修改记录.原有单价').db.name
        ] =
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.原有单价',
            ).db.name
          ]
        z[
          recordset.module.field_by_full_name(m + '.修改记录.新的单价').db.name
        ] =
          r[
            recordset.module.field_by_full_name(
              m + '.产品资料.采购单价',
            ).db.name
          ]
        z[
          recordset.module.field_by_full_name(m + '.修改记录.更改人员').db.name
        ] = username
        w.push(z)
        y.push_new_rid(z.rid)
      }
      r[recordset.module.field_by_full_name(m + '.产品资料.原有单价').db.name] =
        r[recordset.module.field_by_full_name(m + '.产品资料.采购单价').db.name]
      r[recordset.module.field_by_full_name(m + '.产品资料.厂商编号').db.name] =
        recordset.val('厂商编号')
      r[recordset.module.field_by_full_name(m + '.产品资料.厂商名称').db.name] =
        recordset.val('生产厂家')
      r[
        recordset.module.field_by_full_name(m + '.产品资料.专业厂家id').db.name
      ] = recordset.val('专业厂家id')
      r[recordset.module.field_by_full_name(m + '.产品资料.专业厂家').db.name] =
        recordset.val('专业厂家')
      r[recordset.module.field_by_full_name(m + '.产品资料.工厂电话').db.name] =
        recordset.val('工厂电话')
      if (
        r[
          recordset.module.field_by_full_name(m + '.产品资料.采购计划唯一字段')
            .db.name
        ] == ''
      ) {
        // k = k + 1;
        if (zcpbh == '') {
          zcpbh =
            r[
              recordset.module.field_by_full_name(m + '.产品资料.产品编号').db
                .name
            ] +
            r[
              recordset.module.field_by_full_name(m + '.产品资料.专业货号').db
                .name
            ]
        } else {
          zcpbh =
            zcpbh +
            ';' +
            r[
              recordset.module.field_by_full_name(m + '.产品资料.产品编号').db
                .name
            ] +
            r[
              recordset.module.field_by_full_name(m + '.产品资料.专业货号').db
                .name
            ]
        }
      }
      r[recordset.module.field_by_full_name(m + '.产品资料.业务path').db.name] =
        ywpath
      r[recordset.module.field_by_full_name(m + '.产品资料.业务人员').db.name] =
        recordset.val('业务人员')
      // cpbh1 = '';
      // khhh1 = 'zjnblh123456789';
      // if (r[recordset.module.field_by_full_name(m + '.产品资料.产品编号').db.name] != '') {
      //     cpbh1 = r[recordset.module.field_by_full_name(m + '.产品资料.产品编号').db.name];
      // }
      // if (r[recordset.module.field_by_full_name(m + '.产品资料.专业货号').db.name] != '') {
      //     cpbh1 = r[recordset.module.field_by_full_name(m + '.产品资料.专业货号').db.name];
      // }
      // if (trim(r[recordset.module.field_by_full_name(m + '.产品资料.客户货号').db.name]).trim() != '') {
      //     khhh1 = r[recordset.module.field_by_full_name(m + '.产品资料.客户货号').db.name];
      // };
    }
    r[recordset.module.field_by_full_name(m + '.产品资料.采购人员').db.name] =
      recordset.val('采购人员')
    if (recordset.val('客户延期') != '' && recordset.val('客户延期') != null)
      r[recordset.module.field_by_full_name(m + '.产品资料.预计船期').db.name] =
        recordset.val('客户延期')
    // if (recordset.val('跟单人员') != '') r[recordset.module.field_by_full_name(m + '.产品资料.跟单人员').db.name] = recordset.val('跟单人员')
    // if (recordset.val('跟单部门') != '') r[recordset.module.field_by_full_name(m + '.产品资料.跟单部门').db.name] = recordset.val('跟单部门')
    // if (r[recordset.module.field_by_full_name(m + '.产品资料.是否含税').db.name] == '是') {
    //     if (recordset.val('开票工厂') != '')
    //         r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] = recordset.val('开票工厂');
    //     if (recordset.val('组织机构代码') != '') {
    //         r[recordset.module.field_by_full_name(m + '.产品资料.组织机构代码').db.name] = recordset.val('组织机构代码');
    //     }
    //     if (recordset.val('开票联系人') != '') {
    //         r[recordset.module.field_by_full_name(m + '.产品资料.开票联系人').db.name] = recordset.val('开票联系人');
    //     }
    //     if (recordset.val('开票电话') != '') {
    //         r[recordset.module.field_by_full_name(m + '.产品资料.开票电话').db.name] = recordset.val('开票电话');
    //     };
    // }
    // if (r[recordset.module.field_by_full_name(m + '.产品资料.唯一字段').db.name] == '') {
    //     r[recordset.module.field_by_full_name(m + '.产品资料.唯一字段').db.name] = r.rid
    // }
    t.push_modi_rid(rid)
  }
}

const purchase_order_before_save = (evt_id, recordset) => {
  return new Promise((resolve, reject) => {
    let username = _.user.username
    let m = recordset.module.name
    if (recordset.val('是否辅料') == '是' && recordset.val('跟单人员') == '') {
      _.ui.message.error('不好意思,辅料合同跟单人员为必填!')
      reject()
      return
    }
    if (recordset.val('唯一字段') == '') {
      recordset.val('唯一字段', recordset.val('rid'))
    }
    if (recordset.val('客户延期') != '' && recordset.val('客户延期') != null) {
      recordset.val('客户说明', '')
    }
    let wxht = recordset.val('外销合同')
    if (wxht != '' && wxht.indexOf('CSD-') != -1) {
      recordset.val('我方公司', '宁波可思达进出口有限公司')
    }
    if (recordset.val('专业厂家') == '' && recordset.val('生产厂家') == '') {
      _.ui.message.error('请注意专业厂家和生产厂家必需填写一个')
      reject()
      return
    }
    if (recordset.val('合同号码') != '') {
      let zs = recordset.val('合同号码').length
      let zsw = recordset.val('合同号码').substring(zs - 1, zs)
      if (/[0-9]/.test(zsw) && recordset.val('是否辅料') !== '') {
        recordset.val('是否辅料', '是')
      }
    }
    _.http
      .post('/api/saier/purchase_order/save/check', {
        rid: recordset.val('rid'),
        cgry: recordset.val('采购人员'),
        kppm: recordset.val('开票品名'),
        ywry: recordset.val('业务人员'),
        hthm: recordset.val('合同号码'),
        xsht: recordset.val('外销合同'),
        khmc: recordset.val('客户名称'),
        sfhz: recordset.val('是否核准'),
        gdry: recordset.val('跟单人员'),
        sccj: recordset.val('专业厂家'),
        bjbm: recordset.val('报价path'),
      })
      .then((e) => {
        let d = e.data
        let cg_uid = d.cg_uid
        let gd_uid = d.gd_uid
        let gsmc = d.gsmc
        let hgbm = d.hgbm
        let ywpath = d.ywpath
        let tsl = d.tsl
        let zzsl = d.zzsl
        let cdsb = d.cdsb
        let bjbm = d.bjbm
        if (bjbm != '' && bjbm != recordset.val('报价path')) {
          recordset.val('报价path', bjbm)
        }
        if (gsmc != '') {
          recordset.val('我方公司', gsmc)
        }
        if (cdsb == 1) {
          _.ui.message.error('不好意思,客户延期填写则客户说明为必填!')
          reject()
          return
        }
        if (
          recordset.val('自建产品') == '1' ||
          recordset.val('自建产品') == 1
        ) {
          _.ui.message.error(
            '不好意思,你删除了单证锁定的数据或有他人打开此合同，系统不能保存，请直接关闭系统!',
          )
          reject()
          return
        }
        if (recordset.val('是否核准') != '通过') {
          if (recordset.val('下单申请') == '') {
            recordset.val('是否核准', '待审批')
          }
          let hyd = recordset.val('货 源 地')
          if (
            hyd != '' &&
            (hyd.indexOf('其他') != -1 || hyd.indexOf('其它') != -1)
          ) {
            _.ui.message.error('请注意货源地中不能包含其他或其它!')
            recordset.val('货 源 地', '')
          }

          let q = recordset.tables['费用清单']
          let szxq = []
          let ewsr = 0
          let ewzc = 0
          for (let r of q.view_data) {
            szxq.push(
              '合同号码:' +
                recordset.val('合同号码') +
                '费用名称:' +
                r.fymc +
                '收付情况:' +
                r.sfqk +
                '货币代码:' +
                r.hbdm +
                '费用金额:' +
                r.fyje,
            )
            if (r.sfqk == '收入') {
              ewsr += r.fyje
            }
            if (r.sfqk == '支出') {
              ewzc += r.fyje
            }
          }
          recordset.val('收支详情', szxq.join('\n'))
          recordset.val('额外收入', ewsr)
          recordset.val('额外支出', ewzc)
        }
        if (d) {
          if (d.path1 != '') {
            recordset.val('业务', d.path1)
          }
          if (d.szdq != '') {
            recordset.val('所在地区', d.szdq)
            recordset.val('下单地点', d.szdq)
          }
          if (d.bm != '') {
            recordset.val('采购部门', d.bm)
            recordset.val('业务组', d.bm)
          }
          if (cg_uid != '') {
            recordset.val('uid', cg_uid)
          }
          if (d.cgry != '') {
            recordset.val('采购人员', d.cgry)
          }
          if (d.gdbm != '') {
            recordset.val('跟单部门', d.gdbm)
          }
        }
        let t = recordset.tables['产品资料']
        let v = t.view_data
        if (e.code == 0) {
          _.ui
            .show_input_dialog('请输入要更换人员的原因', '')
            .then((val) => {
              _.http
                .post('/api/saier/purchase_order/save/before', {
                  val: val,
                  gd_uid: gd_uid,
                  ywry: recordset.val('业务人员'),
                  cgry: recordset.val('采购人员'),
                  gdry: recordset.val('跟单人员'),
                  gdbm: recordset.val('跟单部门'),
                  spsq: recordset.val('下单申请'),
                  hthm: recordset.val('合同号码'),
                  khmc: recordset.val('客户名称'),
                  rid: recordset.val('rid'),
                  sffl: recordset.val('是否辅料'),
                  wxht: recordset.val('外销合同'),
                  ywpath: ywpath,
                  sfhz: recordset.val('是否核准'),
                  khyq: recordset.val('客户延期'),
                  lines: recordset.tables['产品资料'].view_data,
                  delete_rids: t.delete_rids,
                })
                .then((res) => {
                  let c = res.data
                  if (c.path1 != '') {
                    recordset.val('业务', c.path1)
                  }
                  let cghth = c.cghth
                  if (
                    cghth != '' &&
                    cghth != null &&
                    recordset.val('合同号码') == ''
                  ) {
                    recordset.val('合同号码', cghth)
                  }
                  // let k = 0
                  let zcpbh = ''
                  let cgqx = recordset.val('采购合同期限')
                  let cq = recordset.val('预计船期')
                  let y = recordset.tables['修改记录']
                  let w = y.view_data
                  purchase_order_table_set(
                    m,
                    t,
                    v,
                    w,
                    y,
                    recordset,
                    zcpbh,
                    cq,
                    tsl,
                    zzsl,
                    hgbm,
                    username,
                    ywpath,
                  )
                  t.sync_operate_data()
                  t.modified = true
                  y.sync_operate_data()
                  y.modified = true
                  recordset.val('自建产品', zcpbh)
                  if (cq != '' && cq != null) {
                    recordset.val('预计船期', cq)
                    if (
                      cgqx > 0 &&
                      (recordset.val('合同日期') == '' ||
                        recordset.val('合同日期') == null)
                    ) {
                      recordset.val('合同日期', _addDaysDate(cq, -cgqx - 7))
                    }
                  }
                  resolve()
                  return
                })
                .catch((err) => {
                  console.log(err)
                  reject(err.msg)
                  return
                })
            })
            .catch((err) => {
              console.log(err)
              reject(err.msg)
            })
        } else {
          _.http
            .post('/api/saier/purchase_order/save/before', {
              gd_uid: gd_uid,
              rid: recordset.val('rid'),
              ywry: recordset.val('业务人员'),
              cgry: recordset.val('采购人员'),
              gdry: recordset.val('跟单人员'),
              gdbm: recordset.val('跟单部门'),
              spsq: recordset.val('下单申请'),
              hthm: recordset.val('合同号码'),
              khmc: recordset.val('客户名称'),
              khyq: recordset.val('客户延期'),
              sfhz: recordset.val('是否核准'),
              sffl: recordset.val('是否辅料'),
              wxht: recordset.val('外销合同'),
              lines: recordset.tables['产品资料'].view_data,
              delete_rids: t.delete_rids,
            })
            .then((res) => {
              let c = res.data
              if (c && c != '' && c != null) {
                recordset.val('业务', c)
              }
              // let k = 0
              let zcpbh = ''
              let cgqx = recordset.val('采购合同期限')
              let cq = recordset.val('预计船期')
              let y = recordset.tables['修改记录']
              let cghth = c.cghth
              if (
                cghth != '' &&
                cghth != null &&
                recordset.val('合同号码') == ''
              ) {
                recordset.val('合同号码', cghth)
              }
              let w = y.view_data
              purchase_order_table_set(
                m,
                t,
                v,
                w,
                y,
                recordset,
                zcpbh,
                cq,
                tsl,
                zzsl,
                hgbm,
                username,
                ywpath,
              )
              t.sync_operate_data()
              t.modified = true
              y.sync_operate_data()
              y.modified = true
              recordset.val('自建产品', zcpbh)
              if (cq != '' && cq != null) {
                recordset.val('预计船期', cq)
                if (
                  cgqx > 0 &&
                  (recordset.val('合同日期') == '' ||
                    recordset.val('合同日期') == null)
                ) {
                  recordset.val('合同日期', _addDaysDate(cq, -cgqx - 7))
                }
              }
              resolve()
              return
            })
            .catch((err) => {
              console.log(err)
              reject(err.msg)
              return
            })
        }
      })
      .catch((e) => {
        console.log(e)
        if (e.code == -1) recordset.val('采购人员', '')
        if (e.code == -2) recordset.val('跟单人员', '')
        reject(e.msg)
      })
  })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, purchase_order_before_save, '采购合同')

const purchase_order_form_BtnClick = (evt_id, btn, form) => {
  let recordset = form.recordset
  let m = form.module.name
  let username = _.user.username
  if (btn.name == 'jsfs_update_btn') {
    if (
      recordset.val('下单申请') == '' &&
      (recordset.val('业务人员') == username ||
        recordset.val('采购人员') == username ||
        recordset.val('跟单人员') == username)
    ) {
      recordset.module.field_by_full_name(m + '.结算方式').disable = false
    }
  }
  if (btn.name == 'wxwyzd_update_btn') {
    if (recordset.val('是否辅料') == '是') {
      recordset.val('产品资料.外销唯一字段', '')
    }
  }
  if (btn.name == 'wxdj_update_btn') {
    _.http
      .post('/api/saier/purchase_order/wxdj/update', {
        rid: recordset.val('rid'),
        lines: recordset.tables['产品资料'].view_data,
      })
      .then((res) => {
        let d = res.data
        let t = recordset.tables['产品资料']
        let v = t.view_data
        for (let r of v) {
          let rid = r.rid
          if (d.hasOwnProperty(rid)) {
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.佣金单价',
              ).db.name
            ] = d[rid].sl6
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.暗佣单价',
              ).db.name
            ] = d[rid].asl6
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.佣    金',
              ).db.name
            ] = round(
              d[rid].sl6 *
                r[
                  recordset.module.field_by_full_name(m + '.产品资料.合同数量')
                    .db.name
                ],
              3,
            )
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.暗佣佣金',
              ).db.name
            ] = round(
              d[rid].asl6 *
                r[
                  recordset.module.field_by_full_name(m + '.产品资料.合同数量')
                    .db.name
                ],
              3,
            )
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.赔款单价',
              ).db.name
            ] = d[rid].hydj
            r[
              recordset.module.field_by_full_name(
                m + '.产品资料.赔款RMB',
              ).db.name
            ] = d[rid].hyRMBdj
            t.push_modi_rid(rid)
          }
        }
        t.sync_operate_data()
        recordset.do_re_sum_by_trigger_table('产品资料')
        t.modified = true
        _.ui.message.success('外销单价刷新完成！')
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (btn.name == 'batch_pass_btn') {
    let rids = []
    if (form.is_search) rids = form.current_rids.value
    if (rids.length == 0) {
      if (form.current_rid.value && form.current_rid.value != '') {
        rids = [form.current_rid.value]
      }
    }
    if (rids.length == 0) {
      _.ui.message.error('请选择选择需要处理的采购合同')
      return
    }
    _.http
      .post('/api/saier/purchase_order/batch/pass', {
        rids: rids,
        module: form.module.name,
      })
      .then((res) => {
        _.ui.message.success('操作完成')
        _.platform.active.load_data()
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (btn.name == 'dzsd_update_btn') {
    if (
      recordset.val('产品资料.单证锁定') == '' ||
      recordset.val('产品资料.单证锁定') == undefined
    ) {
      return
    }
    _.http
      .post('/api/saier/purchase_order/item/update/dzsd', {
        cghth: recordset.val('合同号码'),
        pgwy: recordset.val('产品资料.唯一字段'),
      })
      .then((res) => {
        if (res.data == 1) recordset.val('产品资料.单证锁定', '')
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }
  if (btn.name == 'khhh_update_btn') {
    let rids = form.current_rids.value
    if (rids.length == 0) {
      if (form.current_rid.value && form.current_rid.value != '') {
        rids = [form.current_rid.value]
      }
    }
    if (rids.length == 0) {
      _.ui.message.error('请选择选择需要处理的采购合同')
      return
    }
    _.ui.show_input_dialog('请输入要清空的客人货号', '').then((khhh) => {
      if (khhh == null || khhh == '') {
        _.ui.message.error('请输入要清空的客人货号')
        return
      }
      if (khhh.trim() == '') {
        _.ui.message.error('请输入要清空的客人货号')
        return
      }
      _.http
        .post('/api/saier/purchase_order/khhh/btn', {
          rid: form.current_rid.value,
          rids: rids,
          khhh: khhh,
        })
        .then((res) => {
          console.log(res)
          _.ui.message.success('客人货号清除完成！')
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    })
  }
  if (btn.name == 'special_apply_btn') {
    _.http
      .post('/api/saier/purchase_order/get/status', {
        rid: form.current_rid.value,
        module: form.module.name,
      })
      .then((res) => {
        _.ui.show_input_dialog('请输入要特殊审批的原因:', '').then((val) => {
          if (val == null || val == '') {
            _.ui.message.error('请输入要特殊审批的原因')
            return
          }
          _.http
            .post('/api/saier/purchase_order/special/apply', {
              val: val,
              rid: form.current_rid.value,
              module: form.module.name,
            })
            .then((r) => {
              _.http
                .post('/api/saier/workflow/start', {
                  rid: form.current_rid.value,
                  module: form.module.name,
                  flow_name: '采购合同',
                  memo: val,
                })
                .then((res) => {
                  // recordset.val('wf_status', 1)
                })
                .catch((res) => {
                  _.ui.message.error(res.msg)
                  console.log(res)
                })
            })
            .catch((r) => {
              console.log(r)
              _.ui.message.error(r.msg)
            })
        })
      })
      .catch((err) => {
        console.log(err)
        _.ui.message.error(err.msg)
      })
  }

  if (btn.name == 'cancel_update_btn') {
    _.ui.show_input_dialog('请输入作废的原因', '').then((val) => {
      if (val == null || val == '') {
        _.ui.message.error('请输入作废的原因')
        return
      }
      if (val.trim() == '') {
        _.ui.message.error('请输入作废的原因')
        return
      }
      if (recordset.val('是否核准') != '通过') {
        _.ui.message.error('请注意此合同已审批通过,需提交改单申请请后方可取消')
        return
      }
      _.http
        .post('/api/saier/purchase_order/cancel/btn', {
          rid: form.current_rid.value,
          cgry: recordset.val('采购人员'),
          gdry: recordset.val('跟单人员'),
          ywry: recordset.val('业务人员'),
          sfhz: recordset.val('是否核准'),
          val: val,
        })
        .then((res) => {
          console.log(res)
          _.ui.message.success('记录作废完成！')
          _.platform.active.reload_data()
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    })
  }
  if (btn.name == 'upload_to_lingxing_btn') {
    // 正式环境 注释
    // _.http
    //   .post('/api/saier/purchase_contract/upload_to_lingxing', {
    //     rid: recordset.rid,
    //   })
    //   .then((res) => {
    //     console.log(res)
    //     _.ui.message.success('上传到领星采购单完成！')
    //   })
    //   .catch((err) => {
    //     console.log(err)
    //     _.ui.message.error(err.msg)
    //   })
  }
  // 爱马士采购出货统计(产品)
  if (btn.name == 'hermes_stats_btn') {
    _.ui.show_dialog('hermes_export_dialog', {})
  }
  if (btn.name == 'youjing_purchase_btn') {
    _.ui.show_dialog('purchase_contract_dialog', {
      rid: recordset.rid,

    })
  }
  // if (btn.name == 'confirm_update_btn') {
  //     if (recordset.modified == true) {
  //         _.ui.message.error('请先保存当前记录后再进行下单操作！');
  //         return
  //     }
  //     if (recordset.val('新旧合同') == '作废') {
  //         _.ui.message.error('请注意此合同已作废');
  //         recordset.val('下单申请', '');
  //         recordset.val('下单申请1', '');
  //         recordset.val('价格确认', '');
  //         return
  //     }
  //     if (recordset.val('下单申请') == '') {
  //         _.ui.message.error('下单申请为空不能提交下单');
  //         return
  //     }
  //     if (recordset.val('合同号码') == '') {
  //         _.ui.message.error('不好意思,请先保存,谢谢');
  //         recordset.val('下单申请', '');
  //         recordset.val('下单申请1', '');
  //         recordset.val('价格确认', '');
  //         return
  //     }
  //     if (recordset.val('跟单人员') == '') {
  //         _.ui.message.error('不好意思,请先填写跟单人员,谢谢');
  //         recordset.val('下单申请', '');
  //         recordset.val('下单申请1', '');
  //         recordset.val('价格确认', '');
  //         return
  //     }
  //     if (recordset.val('下单申请') == username) {
  //         _.ui.message.error('t不好意思,下单申请人不能是自己,谢谢');
  //         recordset.val('下单申请', '');
  //         recordset.val('下单申请1', '');
  //         recordset.val('价格确认', '');
  //         return
  //     }
  //     let t = recordset.tables['产品资料']
  //     let v = t.view_data
  //     let flag = 0
  //     for (let r of v) {
  //         let sfhs = r.sfhs
  //         if (sfhs == '是' && (r[recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db.name] == undefined ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.中文报关品名').db.name] == '无' ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.海关编码').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.海关编码').db.name] == undefined ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.报关单位').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.报关单位').db.name] == undefined ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.开票工厂').db.name] == undefined ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.货 源 地').db.name] == 0 || r[recordset.module.field_by_full_name(m + '.产品资料.货 源 地').db.name] == undefined)) {
  //             _.ui.message.error('不好意思,有开票必填信息没填:增退税,中文报关品名,海关编码，报关单位,开票工厂,货 源 地');
  //             recordset.val('下单申请', '');
  //             recordset.val('下单申请1', '');
  //             recordset.val('价格确认', '');
  //             return
  //         }
  //         if (recordset.val('交货日期') != '' && recordset.val('交货日期') != null && (r[recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name] == undefined ||
  //                 r[recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name] == '' || r[recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name] == null)) {
  //             r[recordset.module.field_by_full_name(m + '.产品资料.交货日期').db.name] == recordset.val('交货日期')
  //         }
  //         if (r[recordset.module.field_by_full_name(m + '.产品资料.节省费用').db.name] < 0 || r[recordset.module.field_by_full_name(m + '.产品资料.是否确认').db.name] == '否') {
  //             flag = 1
  //         }
  //     }
  //     if (flag == 1) {
  //         recordset.val('特殊审批', '是')
  //     }
  //     _.http.post('/api/saier/purchase_order/apply/btn', {
  //         rid: form.current_rid.value,
  //         gdry: recordset.val('跟单人员'),
  //         ywry: recordset.val('业务人员'),
  //         sfhz: recordset.val('是否核准'),
  //         sfff: recordset.val('是否辅料'),
  //         jsfs: recordset.val('结算方式'),
  //         yw: recordset.val('业务'),
  //         spsq: recordset.val('下单申请'),
  //         gsmc: recordset.val('我方公司'),
  //         hthm: recordset.val('合同号码'),
  //         tssp: recordset.val('特殊审批'),
  //     }).then(res => {
  //         let d = res.data
  //         let gd_flag = d.gd_flag
  //         if (gd_flag == 1) {
  //             _.ui.show_input_dialog('请指定跟单人员,空白为不指定', '').then(val => {
  //                 if (val == null && val.trim() == '') {
  //                     _.http.post('/api/saier/purchase_order/field/update', {
  //                         rid: form.current_rid.value,
  //                         spsq: recordset.val('下单申请'),
  //                         val: val
  //                     }).then(r => {
  //                         _.ui.message.success('下单申请提交成功');
  //                         _.platform.active.reload_data()
  //                     }).catch(err => {
  //                         console.log(err)
  //                         _.ui.message.error(err.msg)
  //                     })
  //                 } else {
  //                     _.ui.message.success('下单申请提交成功');
  //                     _.platform.active.reload_data()
  //                 }
  //             })
  //         } else {
  //             _.ui.message.success('下单申请提交成功');
  //             _.platform.active.reload_data()
  //         }
  //     }).catch(err => {
  //         console.log(err)
  //         _.ui.message.error(err.msg)
  //         recordset.val('下单申请', '');
  //         recordset.val('下单申请1', '');
  //         recordset.val('价格确认', '');
  //     })
  // }

  if (btn.name == 'modify_apply_btn') {
    _.ui.show_input_dialog('请输入改单的原因', '').then((val) => {
      if (val == null || val == '') {
        _.ui.message.error('请输入改单的原因')
        return
      }
      if (val.trim() == '') {
        _.ui.message.error('请输入改单的原因')
        return
      }
      let rids = form.current_rids.value
      if (rids.length == 0) {
        if (form.current_rid.value && form.current_rid.value != '') {
          rids = [form.current_rid.value]
        }
      }
      if (rids.length == 0) {
        _.ui.message.error('请选择选择需要处理的采购合同')
        return
      }
      _.http
        .post('/api/saier/purchase_order/modify/apply', {
          rids: rids,
          flag: 0,
          val: val,
        })
        .then((res) => {
          console.log(res)
          _.ui.message.success('改单申请提交成功')
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    })
  }
  if (btn.name == 'modify_special_btn') {
    _.ui.show_input_dialog('请输入要改单的原因', '').then((val) => {
      if (val == null || val == '') {
        _.ui.message.error('请输入改单的原因')
        return
      }
      if (val.trim() == '') {
        _.ui.message.error('请输入改单的原因')
        return
      }
      _.http
        .post('/api/saier/purchase_order/modify/apply', {
          rids: [form.current_rid.value],
          flag: 1,
          val: val,
        })
        .then((res) => {
          console.log(res)
          _.ui.message.success('改单申请提交成功')
        })
        .catch((err) => {
          console.log(err)
          _.ui.message.error(err.msg)
        })
    })
  }
}
_.evts.on(
  [_.evtids.TOOLBAR_BUTTON_CLICK],
  purchase_order_form_BtnClick,
  '采购合同',
)

const purchase_order_EditorChildShow = (evt_id, form) => {
  if (form.group.value.name == '产品资料') {
    let btns = []
    btns.push({
      name: 'wxwyzd_update_btn',
      caption: '清外销唯一字段',
      icon: 'any-server-update',
      divided: true,
    })
    btns.push({
      name: 'wxdj_update_btn',
      caption: '刷新外销单价',
      icon: 'any-server-update',
      divided: true,
    })
    btns.push({
      name: 'dzsd_update_btn',
      caption: '毛利刷新',
      icon: 'any-server-update',
      divided: true,
    })
    // btns.push({
    //     "name": 'supplier_update_btn',
    //     "caption": '更新工厂评分低毛利',
    //     "icon": 'any-server-update',
    //     "divided": true
    // })
    // btns.push({
    //     "name": 'invoice_update_btn',
    //     "caption": '刷新货源地开票工厂',
    //     "icon": 'any-server-update',
    //     "divided": true
    // })
    // btns.push({
    //     "name": 'item_all_update_btn',
    //     "caption": '更新所有产品',
    //     "icon": 'any-server-update',
    //     "divided": true
    // })
    // btns.push({
    //     "name": 'item_row_update_btn',
    //     "caption": '更新当前产品',
    //     "icon": 'any-server-update',
    //     "divided": true
    // })

    form.toolbar.add([
      {
        name: 'export_btn',
        caption: '扩展',
        icon: 'any-server-update',
        btns: btns,
      },
    ])
  }
}
_.evts.on(
  [_.evtids.MODULE_EDITOR_GROUP_SHOW],
  purchase_order_EditorChildShow,
  '采购合同',
)

// 查询界面或编辑界面打开事件
const purchase_order_Form_Show = (evt_id, form) => {
  let btns = []
  if (form.is_search) {
    btns.push({
      name: 'khhh_update_btn',
      caption: '批量清除客人货号',
      icon: 'any-function',
      divided: true,
    })
    btns.push({
      name: 'special_apply_btn',
      caption: '特殊审批',
      icon: 'any-function',
      divided: true,
    })
    btns.push({
      name: 'modify_apply_btn',
      caption: '改单申请',
      icon: 'any-function',
      divided: true,
    })
    btns.push({
      name: 'modify_special_btn',
      caption: '特殊改单申请',
      icon: 'any-function',
      divided: true,
    })
    btns.push({
      name: 'batch_pass_btn',
      caption: '批量通过',
      icon: 'any-function',
      divided: true,
    })
  } else {
    btns.push({
      name: 'jsfs_update_btn',
      caption: '变更结算方式',
      icon: 'any-function',
      divided: true,
    })
    // btns.push({
    //     "name": 'confirm_update_btn',
    //     "caption": '下单申请',
    //     "icon": 'any-server-update',
    //     "divided": true
    // })
    btns.push({
      name: 'cancel_update_btn',
      caption: '记录作废',
      icon: 'any-server-update',
      divided: true,
    })
    btns.push({
      name: 'upload_to_lingxing_btn',
      caption: '上传到领星采购单',
      icon: 'any-server-update',
      divided: true,
    })
    btns.push({
      name: 'hermes_stats_btn',
      caption: '爱马士采购出货统计(产品)',
      icon: 'any-server-update',
      divided: true,
    })
      btns.push({
      name: 'youjing_purchase_btn',
      caption: '优景采购合同（图）',
      icon: 'any-server-update',
      divided: true,
    })

    // btns.push({
    //     "name": 'batch_pass_btn',
    //     "caption": '批量通过',
    //     "icon": 'any-function',
    //     "divided": true
    // });
  }
  if (btns.length == 0) {
    return
  }
  form.toolbar.insert(
    [
      {
        name: 'export_btn',
        caption: '扩展',
        icon: '#ext-add_database',
        btns: btns,
        divided: true,
      },
    ],
    'close',
  )
}
_.evts.on(
  [_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW],
  purchase_order_Form_Show,
  '采购合同',
)

function purchase_order_table_new_after(evt_id, table, recordset) {
  if (table.group == '产品资料') {
    recordset.val('产品资料.合同数量', 0)
    recordset.val('产品资料.箱    数', 0)
    recordset.val('产品资料.图片货号', '')
    recordset.val('产品资料.唯一字段', recordset.val('rid'))
    recordset.val('产品资料.审单建议', '')
    recordset.val('产品资料.单证锁定', '')
    recordset.val('产品资料.是否赔款', '否')
    recordset.val('产品资料.进仓时间', '')
    recordset.val('产品资料.验货数量', 0)
    recordset.val('产品资料.完成数量', 0)
    recordset.val('产品资料.不 良 率', 0)
    recordset.val('产品资料.结    论', '')
    recordset.val('产品资料.图片上传时间', '')
    recordset.val('产品资料.付款抬头', '')
  }
}
_.evts.on(
  [_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY],
  purchase_order_table_new_after,
  '采购合同',
)

function purchase_order_table_new_before(evt_id, table, recordset) {
  return new Promise((resolve, reject) => {
    if (table.group == '产品资料') {
      if (recordset.val('产品资料.单证锁定') != '') {
        reject()
        _.ui.message.error(
          '不好意思,货号' +
            recordset.val('产品资料.专业货号') +
            '已经由单证:' +
            recordset.val('产品资料.单证锁定') +
            '锁定，您无权删除，请联系相关单证人员解锁',
        )
        return
      }
      _.http
        .post('/api/saier/purchase_order/item/delete/check', {
          zyhh: recordset.val('产品资料.专业货号'),
          dzsd: recordset.val('产品资料.单证锁定'),
          rid: recordset.val('rid'),
          cghth: recordset.val('合同号码'),
          wxwyzd: recordset.val('产品资料.外销唯一字段'),
          cgwyzd: recordset.val('产品资料.唯一字段'),
          zyhh: recordset.val('产品资料.专业货号'),
        })
        .then(function (res) {
          resolve()
          // recordset.save()
          return
        })
        .catch((err) => {
          _.ui.message.error(err.msg)
          console.log(err)
          reject()
          return
        })
    } else if (table.group == '查看人员') {
      if (recordset.val('查看人员.查看人员') == '') {
        resolve()
        return
      }
      if (recordset.val('查看人员.查看人员') == _.user.username) {
        _.ui.message.error('自己不能删除自己查看权限')
        reject()
        return
      }
      _.http
        .post('/api/saier/purchase_order/view/delete/check', {
          ckry: recordset.val('查看人员.查看人员'),
          rid: recordset.val('rid'),
          module: recordset.module.name,
        })
        .then(function (res) {
          resolve()
          return
        })
        .catch((err) => {
          _.ui.message.error(err.msg)
          console.log(err)
          reject()
          return
        })
    } else {
      resolve()
      return
    }
  })
}
_.evts.on(
  [_.evtids.RECORD_TABLE_BEFORE_DELETE],
  purchase_order_table_new_before,
  '采购合同',
)

function purchase_order_after_save(evt_id, recordset) {
  _.http
    .post('/api/saier/purchase_order/save/after', {
      rid: recordset.val('rid'),
    })
    .then((res) => {
      if (recordset.val('wf_status') == 2) return
      if (recordset.val('下单申请') == '') return
      if (recordset.val('wf_status') == 1) {
        if (recordset.val('是否核准') == '待审批') return
        if (recordset.val('下单申请') != _.user.username) return
        _.http
          .post('/api/saier/audit/save/after', {
            rid: recordset.val('rid'),
            module: recordset.module.name,
          })
          .then((r) => {
            console.log(r)
            if (r.code == 0) {
              return
            }
            let d = r.data
            _.http
              .post('/api/workflow/task/flow', {
                instance: d.instance_rid,
                status: 1,
                task_id: d.task_rid,
                memo: recordset.val('未批原因'),
              })
              .then((res) => {})
              .catch((res) => {
                _.ui.message.error(res.msg)
                console.log(res)
              })
          })
          .catch((r) => {
            _.ui.message.error(r.msg)
            console.log(r)
          })
      } else {
        if (recordset.val('业务人员') != _.user.username) return
        _.ui.confirm('是否提交审批？').then(() => {
          _.http
            .post('/api/saier/workflow/start', {
              rid: recordset.val('rid'),
              module: recordset.module.name,
              flow_name: '采购合同',
            })
            .then((res) => {
              recordset.val('wf_status', 1)
            })
            .catch((res) => {
              _.ui.message.error(res.msg)
              console.log(res)
            })
        })
      }
    })
    .catch((err) => {
      console.log(err)
      _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_AFTER_SAVE], purchase_order_after_save, '采购合同')
