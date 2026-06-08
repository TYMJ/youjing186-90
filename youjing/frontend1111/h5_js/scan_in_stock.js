/*
 * @Description: 样品扫码入库逻辑（基于出库模板深度定制）
 */
var component_key = 'scan_in_stock'

_.app.component(component_key, {
  template: /*html*/ `
  <div class="in_stock_container">

    <div style="padding: 16px;">
      <van-button type="primary" block @click="create_in_stock">新建入库单</van-button>
    </div>

    <div class="in_stock_form" v-if="showInStockForm">
      <van-cell-group inset>
        <van-field v-model="mainInfo.Personnel" label="人员" placeholder="请输入人员" />
        <van-field v-model="mainInfo.OpTime" label="入库时间" readonly />
        <van-field v-model="mainInfo.Operator" label="操作人" readonly />
        <van-field 
          is-link  
          v-model="mainInfo.Source" 
          required
          label="样品来源" 
          @click="showPicker = true" 
        />
      </van-cell-group>

      <div style="padding:16px;">
        <van-field 
          ref="manualInput"
          v-model="manual_code" 
          :label="_l('条码录入')"
          :placeholder="_l('扫描或手动输入')" 
          clearable
          autofocus
          @keyup.enter="do_manual_search"
          style="border-radius: 5px; border: 1px solid #ebedf0;"
        />
      </div>

      <div class="in_stock_divider" style="margin-bottom: 12px;" v-if="instocklist.length > 0">
        <van-divider>入库详情 ({{instocklist.length}})</van-divider>
      </div>
      <van-cell-group inset  v-if="instocklist.length > 0">
        <van-swipe-cell v-for="(item, index) in instocklist" :key="item.cpbm" style="margin-bottom: 12px;">
          <div style="border-bottom: 1px solid #ebedf0; padding: 8px 0;">
            <van-field v-model="mainInfo.OpTime" label="日期" readonly />
            <van-field v-model.number="item.InStockQty" label="入库数量" type="digit"  />
            <van-field v-model="mainInfo.Personnel" label="人员"  />
            <van-field v-model="item.detailRemark" label="备注"  />
            <van-field v-model="mainInfo.Operator" label="操作人" readonly />
            <van-field v-model="item.lxm" label="条形码"   required />
            <van-field v-model="item.cpbh" label="产品编号" readonly />
            <van-field v-model="item.zwpm" label="中文品名" readonly  />
            <van-field v-model="mainInfo.Source" label="样品来源" readonly  />
            <van-field 
              v-model="item.company_name" 
              label="生产厂家" 
              placeholder="点击选择"
              readonly
              is-link
              @click="openCompanySearch(index)" 
            />
            <van-field 
              v-model="item.company_id" 
              label="厂家ID" 
              readonly
            />
          </div>
          <template #right>
            <van-button square type="danger" text="删除" @click="do_delete(index)" />
          </template>
        </van-swipe-cell>
      </van-cell-group>


      <div style="padding: 24px 16px; display: flex; gap: 10px;">
        <van-button icon="scan" type="primary" plain block @click="startContinuousScan">连续扫码</van-button>
        <van-button type="success" block @click="submitInStockInfo">提交入库</van-button>
      </div>

      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker 
          :columns="sourceOptions" 
          @confirm="onSourceConfirm" 
          @cancel="showPicker = false" 
        />
      </van-popup>
    </div>

    <van-popup v-model:show="showCompanyDialog" position="right" :style="{ width: '80%', height: '100%' }">
      <van-nav-bar title="选择厂家" left-text="返回" @click-left="showCompanyDialog = false" />
      <van-search
        v-model="companySearchKeyword"
        placeholder="输入厂家名称或ID"
        @search="onCompanySearch"
      />
      <van-list>
        <van-cell 
          v-for="c in companyList" 
          :key="c.id" 
          :title="c.name" 
          :label="c.id" 
          @click="selectCompany(c)"
        />
      </van-list>
    </van-popup>
  </div>
  `,
  data() {
    return {
      showPicker: false,
      showInStockForm: false,
      showCompanyDialog: false,
      companySearchKeyword: '',
      sourceOptions: [
        { text: '客人要样', value: '客人要样' },
        { text: '采购推荐', value: '采购推荐' },
        { text: '业务还样', value: '业务还样' },
      ],
      mainInfo: {
        Personnel: '',
        Source: '客人要样',
        OpTime: this.getTodayStr(),
        Operator: _.user.username, // 修正了字符串引用
      },
      instocklist: [],
      companyList: [],
      activeIndex: -1, // 记录当前正在编辑哪一行的厂家
      manual_code: '',
      company_id: [],
    }
  },
  computed: {
    totalQty() {
      return this.instocklist.reduce(
        (sum, item) => sum + (Number(item.InStockQty) || 0),
        0,
      )
    },
  },
  methods: {
    create_in_stock() {
      this.showInStockForm = true
    },
    getTodayStr() {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    },
    startContinuousScan() {
      this.call_app({ cmd: 'scan', zoom: 0.8 })
    },

    // 选择厂家
    openCompanySearch(index) {
      this.activeIndex = index
      this.companySearchKeyword = ''
      this.companyList = []
      this.showCompanyDialog = true
    },

    onCompanySearch(val) {
      if (!val) {
        this.companyList = []
        _.m.showNotify('请输入厂家名称或ID')
        return
      }
      _.http
        .post('/api/saier/sample/company_search', { keyword: val })
        .then((res) => {
          if (res.data) {
            this.companyList = res.data
          }
        })
    },
    // 选中后的回填逻辑
    selectCompany(company) {
      const target = this.instocklist[this.activeIndex]
      if (target) {
        target.company_name = company.name
        target.company_id = company.id
      }
      this.showCompanyDialog = false
    },
    // 扫码/录入处理
    on_barcode_scan(code) {
      if (!code) return
      this.manual_code = code
      // 先在本地数组中查找是否已存在该条码
      const existingItem = this.instocklist.find((item) => item.lxm === code)

      if (existingItem) {
        // 如果本地已存在，直接累加数量，不需要调用后端接口
        existingItem.InStockQty++
        _.m.showNotify({ type: 'success', message: '数量已累加' })
        this.afterSubmitAction()
        return // 结束流程，不再请求后端
      }

      // 如果本地不存在，再请求后端接口
      _.http
        .post('/api/saier/instock/sample_code/search', { code: code })
        .then((res) => {
          if (res.data && res.data.data) {
            // 核心逻辑：处理扫码/录入数据
            const newRow = {
              ...res.data.data,
              InStockQty: 1,
              detailRemark: '',
            }
            this.instocklist.unshift(newRow)
            console.log('扫码/录入后数组:', this.instocklist)
            this.afterSubmitAction()
          } else {
            _.m.showNotify({ type: 'warning', message: '未找到该样品信息' })
          }
        })
        .catch(() =>
          _.m.showNotify({ type: 'danger', message: '扫码查询失败' }),
        )
    },
    // 手动输入条码查询
    do_manual_search() {
      const code = this.manual_code.trim()
      if (!code) return _.m.showNotify('请输入条码')
      this.on_barcode_scan(code)
    },

    onSourceConfirm({ selectedOptions }) {
      this.mainInfo.Source = selectedOptions[0].text
      this.showPicker = false
    },

    do_delete(index) {
      this.instocklist.splice(index, 1)
    },
    // 提交入库数据
    submitInStockInfo() {
      if (this.instocklist.length === 0) return _.m.showNotify('入库详情为空')

      // _.m.showLoading({ message: '提交中...', forbidClick: true })
      console.log('提交数据:', {
        sample_instock_main: this.mainInfo,
        sample_instock_details: this.instocklist,
      })
      _.http
        .post('/api/saier/sample/instock_submit', {
          sample_instock_main: this.mainInfo,
          sample_instock_details: this.instocklist,
        })
        .then((res) => {
          _.m.showNotify({ type: 'success', message: '入库成功' })
          this.resetForm()
        })
        .catch((err) => _.m.showNotify(err.msg || '提交失败'))
    },
    afterSubmitAction() {
      this.manual_code = ''
      this.$nextTick(() => {
        const input = this.$refs.manualInput?.$el.querySelector('input')
        if (input) input.focus()
      })
    },
    resetForm() {
      this.instocklist = []
      this.mainInfo.Personnel = ''
      this.mainInfo.Remarks = ''
      this.showInStockForm = false
    },
    call_app(cmd) {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview
          .callHandler('call_app', cmd)
          .then((res) => {
            console.log('App调用结果:', res)
          })
          .catch((err) => {
            console.error('App调用失败:', err)
          })
      }
    },
  },
  mounted() {
    document.title = '样品入库'
    window.on_barcode_scan = this.on_barcode_scan
    window.addEventListener(
      'flutterInAppWebViewPlatformReady',
      function (event) {
        // console.log(flutterInAppWebViewPlatformReady)
      },
    )
  },
})
