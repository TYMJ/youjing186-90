var component_key = 'products_info_list'

_.app.component(component_key, {
  template: /*html*/ `
    <div class="products_info_list_search_container">

      <div class="products_info_list_search_form" style="padding: 4px 0;">
        <van-cell-group inset>
          <van-field
            v-model="query.barcode"
            label="产品编码"
            placeholder="请输入产品编码"
            clearable
            @keyup.enter="onSearch"
          />
          <van-field
            v-model="query.productname"
            label="中文品名"
            placeholder="请输入中文品名"
            clearable
            @keyup.enter="onSearch"
          />
        </van-cell-group>
        <div style="margin: 12px 16px 2px 16px;">
          <van-button type="primary" block color="#1989fa" :loading="loading"  loading-text="加载中..." @click="do_click">
            查询
          </van-button>
        </div>
      </div>

      <div class="products_info_list_section_header">
        <van-divider>产品信息</van-divider>
      </div>

      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="(item, index) in list" :key="index" class="products_info_list_product_item_card">
            <div class="products_info_list_product_main_content">
              <div class="products_info_list_product_image_box">
                <van-image
                  width="100"
                  height="100"
                  fit="cover"
                  :src="get_img_url(item.yytp)"
                  @click="previewImage(item.yytp)"
                >
                  <template v-slot:loading>
                    <van-loading type="spinner" size="20" />
                  </template>
                </van-image>
              </div>

              <div class="products_info_list_product_info_box">
                <div class="products_info_list_info_row">
                  <span class="products_info_list_label">产品编号</span>
                  <span class="products_info_list_value">{{ item.display_info['基本信息'][0].value }}</span>
                </div>
                
                <van-collapse v-model="activeNames" :border="false">
                  <van-collapse-item title="更多信息" :name="index" size="small">
                    <div class="products_info_list_more_info_content">
                      <p v-for="(info, index) in item.display_info['基本信息']" :key="index">
                        <span class="sub-label">{{ info.caption }}:</span> {{ info.value }}
                      </p>
                      <p v-for="(info, index) in item.display_info['辅助信息']" :key="index">
                        <span class="sub-label">{{ info.caption }}:</span> {{ info.value }}
                      </p>
                    </div>
                  </van-collapse-item>
                </van-collapse>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
      <div style="margin-top: 10px;padding:11px;display:flex;" v-if="list.length > 0">
				<van-button style="margin:0px 5px;" type="warning" block @click="do_click">继续扫码</van-button>
			</div>
    </div>

   
  `,
  props: ['tab_id', 'params'],
  data() {
    return {
      query: {
        barcode: '',
        productname: '', // 建议初始设为空，除非逻辑需要
      },
      list: [],
      loading: false,
      // 【关键改动 1】初始设为 true，防止组件挂载时自动触发 onLoad
      finished: true,
      refreshing: false,
      page: 1,
      activeNames: [],
    }
  },
  methods: {
    do_click() {
      this.call_app({ cmd: 'scan', zoom: 0.8 })
    },
    on_barcode_scan(code) {
      this.query.barcode = code
      this.onSearch()
    },
    // 【关键改动 2】点击查询按钮
    onSearch() {
      // 1. 获取去掉空格后的长度
      const barcodeLen = this.query.barcode.trim().length
      const productnameLen = this.query.productname.trim().length
      if (barcodeLen === 0 && productnameLen === 0) {
        _.m.showNotify('请输入产品编码或中文品名')
        return
      }
      // 2. 校验：当产品编码小于等于 5 位时提示用户
      if (barcodeLen < 5 && barcodeLen > 0) {
        // 如果 barcode 为空，提示输入内容；如果太短，提示具体要求
        const msg = '产品编码不能少于5个字符'

        // 使用 Vant 的提示组件
        if (this.$vant && this.$vant.showToast) {
          this.$vant.showToast(msg)
        } else {
          _.m.showNotify(msg) // 或者使用你项目中封装好的通知方法
        }
        return // 拦截执行，不再调用接口
      }
      this.list = []
      this.page = 1
      this.finished = false // 【解锁】允许加载数据
      this.loading = true

      this.onLoad() // 手动触发第一次加载
    },

    // 下拉刷新
    onRefresh() {
      // 如果还没查询过就下拉，可以直接结束刷新
      this.finished = false
      this.loading = true
      this.page = 1
      this.onLoad()
    },

    // 加载数据
    onLoad() {
      // 如果是静默状态（未点击查询），不执行逻辑
      if (this.finished && !this.loading) return

      if (this.refreshing) {
        this.list = []
        this.refreshing = false
      }

      _.http
        .post('/api/sample/products/list/query', {
          ...this.query,
          page: this.page,
          limit: 10,
        })
        .then((res) => {
          const data = res.data || []
          this.list.push(...data)

          this.loading = false
          console.log('this.list什么', this.list)
          // 【核心分页逻辑】
          if (data.length < 10) {
            // 返回数据不足一页，说明后面没了
            this.finished = true
          } else {
            // 还有数据，页码+1，准备下次滚动加载
            this.page++
            this.finished = false
          }
        })
        .catch((err) => {
          this.loading = false
          this.finished = true
          _.m.showNotify(err.msg || '数据加载失败')
        })
    },

    get_img_url(img) {
      if (!img) return 'https://img01.yzcdn.cn/vant/apple-1.jpg'
      return `/api/image/get?file=${img}&width=200&height=200`
    },

    previewImage(img) {
      if (!img) return
      const url = `/api/image/get?file=${img}`
      this.$vant.ImagePreview([url])
    },

    call_app(cmd) {
      if (window.flutter_inappwebview) {
        window.flutter_inappwebview
          .callHandler('call_app', cmd)
          .then((res) => {
            console.log('Flutter call success:', res)
          })
          .catch((res) => {
            console.error('Flutter call error:', res)
          })
      }
    },
  },
  mounted() {
    document.title = '产品资料查询'
    window.on_barcode_scan = this.on_barcode_scan
    window.addEventListener(
      'flutterInAppWebViewPlatformReady',
      function (event) {
        // console.log(flutterInAppWebViewPlatformReady)
      },
    )
    // this.call_app({ cmd: 'scan', zoom: 0.8 })
  },
})
