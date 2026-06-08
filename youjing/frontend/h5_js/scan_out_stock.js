/*
 * @Description: 样品扫码出库逻辑（原生 JS 替代 moment.js）
 */
var component_key = 'scan_out_stock'
_.app.component(component_key, {
  template: /*html*/ `
  <div class="out_stock_container">

    <div style="padding: 16px;">
      <van-button type="success" block @click="create_out_stock">新建出库单</van-button>
    </div>

    <div class="out_stock_form" v-if="showOutStockForm">
      <van-cell-group inset>
        <van-field v-model="mainInfo.OpTime" label="操作时间" readonly />
        <van-field v-model="mainInfo.Operator" label="操作人" readonly />
        <van-field v-model="mainInfo.Personnel" label="领用人员" placeholder="请输入领用人" />
        <van-field 
          is-link  
          v-model="mainInfo.Destination" 
          label="样品去向" 
          @click="showPicker = true" 
        />

        <van-field v-model="mainInfo.Remarks" label="备注" type="textarea" placeholder="填写备注" rows="1" autosize />
        <van-field v-model="totalQty" label="数量合计" readonly />

      </van-cell-group>

      <div style="padding:16px;">
        <van-field 
          ref="manualInput"
          v-model="manual_code" 
          :label="_l('条码录入')"
          :placeholder="_l('手动输入')" 
          clearable
          autofocus
          @keyup.enter="do_manual_search"
          style="border-radius: 5px;"
        />
      </div>


      <div class="out_stock_divider" style="margin-bottom: 12px;"  v-if="outstocklist.length > 0">
        <van-divider>出库详情</van-divider>
      </div>
      <van-cell-group inset  v-if="outstocklist.length > 0">
        <van-swipe-cell v-for="(item, index) in outstocklist" :key="item.cpbm">
          <div style="border-bottom: 1px solid #ebedf0; padding: 8px 0;">
            
            <van-field v-model="mainInfo.OpTime" label="日期" readonly />
            <van-field v-model="mainInfo.Destination" label="样品去向"  />
            <van-field v-model="mainInfo.Personnel" label="领用人员"  />
            
            <van-field v-model.number="item.OutStockQty" label="出库数量" type="digit"  />
            <van-field v-model="mainInfo.Operator" label="操作人" readonly />
            <van-field v-model="item.cpbh" label="产品编号"  />

            <van-field v-model="item.lxm" label="条形码"   required />
            <van-field v-model="item.zwpm" label="中文品名"  />
            <van-field v-model="item.jldw" label="计量单位" readonly  />
            <van-field v-model="mainInfo.Remarks" label="备注"  />
            <van-field v-model="item.writtenoff" label="是否核销"  readonly />
          </div>
          <template #right>
            <van-button square type="danger" text="删除" @click="do_delete(index)" />
          </template>
        </van-swipe-cell>
      </van-cell-group>

  
      <div style="padding: 16px; display: flex; gap: 10px;">
        <van-button icon="scan" type="primary" block @click="startContinuousScan">连续扫码</van-button>
        <van-button type="success" block @click="submitOutStockInfo">提交保存</van-button>
      </div>

      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker :columns="destinationOptions" @confirm="onDestinationConfirm" @cancel="showPicker = false" />
      </van-popup>


      
    </div>
    
  </div>
  `,
  data() {
    return {
      showPicker: false,
      showOutStockForm: false,
      destinationOptions: [
        { text: '借用', value: '借用' },
        { text: '出库', value: '出库' },
        { text: '下架', value: '下架' },
      ],
      mainInfo: {
        Personnel: '',
        Destination: '出库',
        Remarks: '',
        OpTime: this.getTodayStr(), // 使用原生方法获取日期
        Operator: _.user.username, // 系统自动赋操作人
      },
      outstocklist: [],
      sample_list: [],
      manual_code: '',
    }
  },
  computed: {
    // 自动计算合计数量
    totalQty() {
      return this.outstocklist.reduce(
        (sum, item) => sum + (Number(item.OutStockQty) || 0),
        0,
      )
    },
  },
  methods: {
    // 原生日期格式化函数：生成 YYYY-MM-DD
    do_back() {
      this.call_app({ cmd: 'pop' })
      console.log('返回上一页')
    },
    //  用户点击新建 按钮  弹出表单
    create_out_stock() {
      this.showOutStockForm = true
    },

    getTodayStr() {
      const now = new Date()
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      const d = String(now.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },

    // 连续扫码逻辑
    startContinuousScan() {
      this.call_app({ cmd: 'scan' })
    },

    // 处理扫码数据
    on_barcode_scan(code) {
      if (!code) return
      this.manual_code = code

      // 如果扫描同一条码，出库数量自动 +1
      const existingItem = this.outstocklist.find((item) => item.lxm === code)
      if (existingItem) {
        const newQty = (Number(existingItem.OutStockQty) || 0) + 1
        const stockQty = Number(existingItem.kcsl) || 0
        if (newQty > stockQty) {
          _.m.showNotify({
            type: 'danger',
            message: '出库数量不能超过库存数量',
          })
          this.afterSubmitAction()
          return
        }
        existingItem.OutStockQty = newQty
        _.m.showNotify({ type: 'success', message: '出库数量已增加' })
        this.afterSubmitAction()
        return
      }

      // 获取新货号信息
      _.http
        .post('/api/saier/outstock/sample_code/search', { code: code })
        .then((res) => {
          console.log('查询新样品结果', res)

          if (res.data && res.data.data) {
            let newItem = res.data.data
            // 给新条目初始化数量为 1
            newItem.OutStockQty = 1
            // 初始化备注字段为空字符串
            newItem.detailRemark = ''
            newItem.writtenoff = '否'
            // 将新扫描的样品放在列表最前面
            this.outstocklist.unshift(newItem)
            this.afterSubmitAction()
          } else {
            _.m.showNotify(_l('未找到该条码信息'))
            this.manual_code = ''
          }
        })
        .catch((err) => {
          _.m.showNotify(_l(err.msg || '条码无效'))
          this.manual_code = ''
        })
    },

    onDestinationConfirm({ selectedOptions }) {
      // 获取选中项的文本值
      const value = selectedOptions[0].text

      // 更新主表去向
      this.mainInfo.Destination = value

      // 同步更新现有明细的去向逻辑不变
      this.outstocklist.forEach((item) => {
        item.Destination = value
      })

      this.showPicker = false
    },

    do_delete(index) {
      this.outstocklist.splice(index, 1)
    },

    // 手动输入二维码的时候  获取产品信息
    do_manual_search() {
      const code = this.manual_code.trim()
      if (!code) {
        _.m.showNotify(_l('请手动输入条码'))
        return
      }
      this.on_barcode_scan(code)
    },

    // 提交数据
    submitOutStockInfo() {
      if (this.outstocklist.length === 0)
        return _.m.showNotify('请先扫码录入样品')

      // 添加数量合计到 mainInfo 中
      this.mainInfo.totalQty = this.totalQty

      console.log('提交出库单信息mainInfo', this.mainInfo)
      console.log('提交出库单信息details', this.outstocklist)

      _.http
        .post('/api/saier/sample/outstock_submit', {
          sample_outstock_main: this.mainInfo,
          sample_outstock_details: this.outstocklist,
        })
        .then((res) => {
          _.m.showNotify({ type: 'success', message: '出库保存成功' })
          this.resetForm()
        })
        .catch((err) => {
          _.m.showNotify(err.msg || '出库保存失败')
        })
    },

    // 提取公共的后续操作：清空输入框并聚焦
    afterSubmitAction() {
      this.manual_code = ''
      this.$nextTick(() => {
        // 自动聚焦，方便扫码枪连续扫码
        const input = this.$refs.manualInput?.$el.querySelector('input')
        if (input) input.focus()
      })
    },
    resetForm() {
      this.outstocklist = []
      this.mainInfo.Personnel = ''
      this.mainInfo.Remarks = ''
    },

    call_app(cmd) {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview
          .callHandler('call_app', cmd)
          .then((res) => {
            console.log('call_app 调用成功:', res)
          })
          .catch((error) => {
            console.error('call_app 调用失败:', error)
          })
      } else {
        console.log('当不支持 call_app 调用')
        console.log('call_app 调用失败:', error)
      }
    },
  },
  mounted() {
    document.title = '样品出库'
    window.on_barcode_scan = this.on_barcode_scan // 挂载扫码回调
    window.addEventListener(
      'flutterInAppWebViewPlatformReady',
      function (event) {
        // console.log(flutterInAppWebViewPlatformReady)
      },
    )
  },
})
