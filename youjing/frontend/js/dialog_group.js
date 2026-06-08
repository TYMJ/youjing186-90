_.app.component('quotation_stats_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('导出报价统计报表')"
        width="450px"
        class="auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-form 
          :model="form" 
          :rules="rules" 
          ref="statsForm"
          label-width="110px" 
          style="padding: 20px 20px 0 0;"
          @submit.native.prevent>
          
          <el-form-item :label="_l('报价起始日期')" prop="start_date">
            <el-date-picker
              v-model="form.start_date"
              type="date"
              :placeholder="_l('选择开始日期')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="_l('报价结束日期')" prop="end_date">
            <el-date-picker
              v-model="form.end_date"
              type="date"
              :placeholder="_l('选择结束日期')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="_l('采购人名')" prop="purchaser">
            <el-input 
              v-model="form.purchaser" 
              :placeholder="_l('不输为全部')" 
              clearable
            />
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">{{ _l('取消') }}</el-button>
            <el-button 
              type="primary" 
              :loading="is_loading"
              @click="submit_form">
              {{ _l('确认导出') }}
            </el-button>
          </div>
        </template>
    </el-dialog>
    `,

  data() {
    return {
      visible: true,
      is_loading: false,
      // 表单数据绑定
      form: {
        start_date: '',
        end_date: '',
        purchaser: '',
      },
      // 基础校验规则
      rules: {
        start_date: [
          { required: true, message: _l('请选择起始日期'), trigger: 'change' },
        ],
        end_date: [
          { required: true, message: _l('请选择结束日期'), trigger: 'change' },
        ],
      },
    }
  },
  props: ['id', 'rids', 'module_name'],
  methods: {
    // 提交前的校验
    async submit_form() {
      const formRef = this.$refs.statsForm
      if (!formRef) return

      try {
        await formRef.validate()
        this.do_post()
      } catch (error) {
        console.log('Validation failed', error)
      }
    },

    // 执行导出请求
    do_post() {
      // 1. 构造请求参数，对应 Delphi 中的 qsrq, jsrq, cgryaa
      if (!this.form.start_date || !this.form.end_date) {
        _.ui.message.error('请选择日期范围')
        return
      }

      // 2. 发送请求生成 Excel 数据
      _.http
        .post('/api/saier/quotation/stats/export', {
          start_date: this.form.start_date,
          end_date: this.form.end_date,
          purchaser: this.form.purchaser,
        })
        .then((res) => {
          // 3. 后端返回 code=1 且 data 为文件名
          if (res.code === 1) {
            _.ui.message.success('报表生成成功，开始下载')
            // 4. 调用文件服务器接口下载
            _.http.download(
              '/api/tmp/file/get',
              {
                file: res.data, // 这里的 res.data 是后端生成的临时文件名
              },
              `报价统计表.xlsx`,
            )

            this.visible = false // 关闭对话框
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((res) => {
          console.error(res)
          _.ui.message.error(res.msg || '导出失败')
        })
    },

    do_closed() {
      _.ui.free_dialog(this.id)
    },
  },
})

_.app.component('purchase_contract_dialog', {
  template: /*html*/ `
  <el-dialog v-model="visible" title="生成采购合同报表" width="480px" style="border-radius: 10px;" :close-on-click-modal="false"   :close-on-press-escape="false">
    <el-form :model="form" label-width="100px" style="padding: 18px;">
      <el-form-item label="公司简称">
        <el-select v-model="form.gs" allow-create filterable placeholder="请选择或输入简称" style="width: 100%">
          <el-option label="优景进出口 (输入1)" value="1" />
          <el-option label="锐亿进出口 (输入2)" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="导出格式">
        <el-radio-group v-model="form.export_type">
          <el-radio label="1">Excel</el-radio>
          <el-radio label="2">PDF</el-radio>
          <el-radio label="3">批量 PDF</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="text-align:right">
        <el-button @click="visible=false" :disabled="is_loading" >取消</el-button>
        <el-button type="primary"  @click="do_post" :loading="is_loading">{{ is_loading ? '正在生成中...' : '确认生成' }}</el-button>
      </div>
    </template>
  </el-dialog>
  `,
  props: ['rid'],
  data() {
    return {
      visible: true,
      form: {
        gs: '1',
        export_type: '1',
      },
      is_loading: false,
    }
  },
  methods: {
    async do_post() {
      if (!this.rid) {
        _.ui.message.error('缺少合同 ID，无法生成')
        return
      }

      this.is_loading = true
      const payload = {
        rid: this.rid,
        gs: String(this.form.gs || '1'),
        pdf: String(this.form.export_type || '1'),
      }

      try {
        const res = await _.http.post(
          '/api/saier/purchase_contract/export',
          payload,
        )

        // 只把 code === 1 视为成功（同时兼容字符串 '1'）
        const isSuccess = res && (res.code === 1 || res.code === '1')
        if (!isSuccess) {
          _.ui.message.error(res && res.msg ? res.msg : '生成失败')
          return
        }

        const data = res.data
        // 优先兼容常见文件字段
        let fileStr = null
        if (data) {
          if (typeof data === 'string') {
            // 后端可能直接返回相对路径或文件名的字符串
            if (data.includes('/') || data.includes('.')) fileStr = data
            else _.ui.message.info(data) // 仅为提示字符串
          } else if (typeof data === 'object') {
            fileStr = data.path || data.name
          }
        }

        // 有文件则触发下载并结束
        if (fileStr) {
          // 获取后端返回的真实文件后缀 (比如从 'xxx.zip' 中截取 '.zip')
          const fileExt = fileStr.substring(fileStr.lastIndexOf('.'))
          // 动态组装最终保存的文件名
          const saveName = `采购合同_${(data && data.name) || this.rid}${fileExt}`
          _.http.download('/api/tmp/file/get', { file: fileStr }, saveName)
          _.ui.message.success('单据生成成功，开始下载')
          this.visible = false
          return
        }
        if (data && data.warning_path) {
          const warnFile = data.warning_path // e.g. 'uploads/2026-03-25_诚信报告.txt' 或 'tmp/...'
          const warnName = `诚信报告_${new Date().toISOString().slice(0, 10)}.txt`
          // 使用统一下载接口
          _.http.download('/api/tmp/file/get', { file: warnFile }, warnName)
          // 同时提示用户
          _.ui.message.info(data.warning_msg || '已生成诚信报告，正在下载')
        }

        // 成功但无文件（例如只有 warning 或仅提示）
        // _.ui.message.success(res.msg || '生成成功（无文件）')
        this.visible = false
      } catch (err) {
        console.error(err)
        _.ui.message.error('网络异常，导出失败')
      } finally {
        this.is_loading = false
      }
    },
  },
})

_.app.component('hermes_export_dialog', {
  template: /*html*/ `
  <el-dialog v-model="visible" title="爱马仕统计导出" width="450px" style="border-radius: 10px;" :close-on-click-modal="false">
    <el-form :model="form" label-width="110px" style="padding: 10px 20px;">
      
      <el-form-item label="开始日期"  prop="start_date">
        <el-date-picker
          v-model="form.start_date"
          type="date"
          placeholder="选择开始日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="结束日期" prop="end_date">
        <el-date-picker
          v-model="form.end_date"
          type="date"
          placeholder="选择结束日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

    </el-form>

    <template #footer>
      <div style="text-align:right">
        <el-button @click="visible=false">{{ _l('取消') }}</el-button>
        <el-button type="primary" :loading="loading" @click="do_export">{{ _l('确认导出') }}</el-button>
      </div>
    </template>
  </el-dialog>
  `,
  data() {
    return {
      visible: true,

      form: {
        start_date: '', // 对应 Python 后端的 start_date
        end_date: '', // 对应 Python 后端的 end_date
      },
    }
  },
  methods: {
    // 这里的 _l 是为了兼容你代码中可能存在的国际化函数

    do_export() {
      // 校验日期输入
      if (!this.form.start_date || !this.form.end_date) {
        _.ui.message.warning('请选择完整的起止日期')
        return
      }

      _.http
        .post('/api/saier/hermes/stats/export', {
          start_date: this.form.start_date,
          end_date: this.form.end_date,
        })
        .then((res) => {
          if (res.code === 1) {
            _.ui.message.success('导出完成，开始下载')

            // 调用通用的下载接口
            _.http.download(
              '/api/tmp/file/get',
              {
                file: res.data, // 这里的 res.data 是后端生成的临时文件名
              },
              `爱马士采购出货统计.xlsx`,
            )
            this.visible = false
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg)
        })
    },
  },
})

_.app.component('special_report_dialog', {
  // 接收从 _.ui.show_dialog 传进来的参数

  template: /*html*/ `
  <el-dialog v-model="visible" :title="_l('特殊报表导出')" width="450px" style="border-radius: 10px;" :close-on-click-modal="false">
    <el-form :model="form" label-width="110px" style="padding: 10px 20px;">
      
        <div style="margin-bottom: 10px;">{{ _l('请选择要打印的特殊报表') }}</div>
        <el-select v-model="form.template_name" style="width: 100%">
          <el-option
            v-for="item in template_options"
            :key="item"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
  

    </el-form>

    <template #footer>
      <div style="text-align:right">
        <el-button @click="visible=false">{{ _l('取消') }}</el-button>
        <el-button type="primary"  @click="do_export">{{ _l('确认导出') }}</el-button>
      </div>
    </template>
  </el-dialog>
  `,
  props: ['rid', 'template_options', 'default_zm'],
  data() {
    return {
      visible: true,
      form: {
        template_name: this.default_zm || '', // 使用传进来的默认值
      },
    }
  },
  methods: {
    do_export() {
      // 执行导出逻辑 (对应 Delphi 的后半段逻辑)
      _.http
        .post('/api/saier/quotation/special_print', {
          rid: this.rid,
          zm: this.form.template_name,
        })
        .then((res) => {
          if (res.code === 1) {
            _.ui.message.success('生成成功，开始下载')
            // 下载文件
            _.http.download(
              '/api/tmp/file/get',
              { file: res.data },
              `特殊报表打印.xlsx`,
            )
            this.visible = false
          } else {
            _.ui.message.error(res.msg)
          }
        })
        .catch((err) => {
          console.error(err)
          this.visible = false
          _.ui.message.error(err.msg)
        })
    },
  },
})

//  外销合同 -- 产品接单分析

_.app.component('product_order_analysis_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        title="产品接单分析"
        width="480px"
        :close-on-click-modal="false"
        border-radius="10px"
        @closed="do_closed"
        >
        <el-form :model="form" ref="analysisForm" label-width="120px" style="padding: 10px 20px 0 0;">
          
          <el-form-item label="客人名称">
            <el-input v-model="form.khmc" placeholder="请输入客人名称" clearable />
          </el-form-item>

          <el-form-item label="国家/地区">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-input v-model="form.country" placeholder="国家" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="form.ssdq" placeholder="州别/地区" />
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item label="查看年数">
            <el-select v-model="form.qsrq" style="width: 100%">
              <el-option label="近1年" value="1" />
              <el-option label="近2年" value="2" />  
              <el-option label="近3年" value="3" />
            </el-select>
          </el-form-item>

          <el-form-item label="查看月份">
            <el-select v-model="form.yfeng" clearable placeholder="不选为整年" style="width: 100%">
              <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="String(m).padStart(2, '0')" />  
            </el-select>
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button type="primary"  @click="do_export" :loading="is_loading">
              确认导出
            </el-button>
          </div>
        </template>
    </el-dialog>
  `,
  data() {
    return {
      visible: true,
      is_loading: false,
      form: {
        khmc: '',
        country: '',
        ssdq: '',
        qsrq: '', // 默认3年
        yfeng: '',
      },
    }
  },
  props: ['id'],
  methods: {
    do_export() {
      this.is_loading = true
      _.http
        .post('/api/saier/salesorder/order_analysis/export', this.form)
        .then((res) => {
          if (res.code === 1) {
            _.ui.message.success('分析报表生成成功')
            _.http.download(
              '/api/tmp/file/get',
              { file: res.data },
              `产品接单分析.xlsx`,
            )
            this.visible = false
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg || '导出失败')

          this.visible = false
        })
        .finally(() => {
          this.is_loading = false
        })
    },

    do_closed() {
      _.ui.free_dialog(this.id)
    },
  },
})

//  出运明细  优景list 分单价

_.app.component('price_list_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="优景List分单价"
        width="440px"
        :close-on-click-modal="false"
        style="border-radius: 10px;"
        @closed="do_closed"
        >
        
        <el-form 
          :model="form" 
          label-width="100px" 
          style="padding: 10px 10px 0 0;"
          @submit.native.prevent>
 
          <el-form-item :label="_l('导出币种')">
            <el-radio-group v-model="form.currency_type">
              <el-radio label="1">('美金 (USD)')</el-radio>
              <el-radio label="2">('人民币 (RMB)')</el-radio>
            </el-radio-group>
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">{{ _l('取消') }}</el-button>
            <el-button 
              type="primary" 
              :loading="is_loading"
              @click="do_export">
              {{ _l('确认生成') }}
            </el-button>
          </div>
        </template>
    </el-dialog>
  `,

  data() {
    return {
      visible: true,
      is_loading: false,
      form: {
        currency_type: '1', // 默认对应 Delphi 的 "不输为1 (美金)"
      },
    }
  },
  // rid 代表当前选中的明细主表 ID (对应 Delphi 里的 self.getnumber)
  props: ['id', 'rid'],
  methods: {
    // 执行导出请求
    do_export() {
      if (!this.rid) {
        _.ui.message.warning(_l('缺少单据 ID，无法导出'))
        return
      }

      this.is_loading = true

      // 调用你已经写好的 Python 后端 API
      _.http
        .post('/api/saier/shipment/price_list/export', {
          record_id: this.rid,
          currency_type: this.form.currency_type,
        })
        .then((res) => {
          if (res.code === 1) {
            _.ui.message.success(_l('分单价报价单生成成功，开始下载'))
            // 调用统一的临时文件下载接口
            _.http.download(
              '/api/tmp/file/get',
              { file: res.data },
              res.data,
            )
            this.visible = false // 导出成功后自动关闭弹窗
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg || '网络异常，导出失败')
        })
        .finally(() => {
          this.is_loading = false
        })
    },

    do_closed() {
      _.ui.free_dialog(this.id)
    },
  },
})

//  俄文版INV PL
_.app.component('russian_inv_pl_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        title="生成俄文版 INV & PL"
        width="440px"
        :close-on-click-modal="false"
        style="border-radius: 10px;"
        @closed="do_closed"
        >
        
        <el-form 
          :model="form" 
          label-width="100px" 
          style="padding: 10px 10px 0 0;"
          @submit.native.prevent>
 
          <el-form-item label="导出币种">
            <el-radio-group v-model="form.currency_type">
              <el-radio label="1">人民币 (RMB)</el-radio>
              <el-radio label="2">美金 (USD)</el-radio>
            </el-radio-group>
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button 
              type="primary" 
              :loading="is_loading"
              @click="do_export">
              确认生成
            </el-button>
          </div>
        </template>
    </el-dialog>
  `,

  data() {
    return {
      visible: true,
      is_loading: false,
      form: {
        currency_type: '1', // 默认对应 Delphi 里的 "人民币输1, 不输为1"
      },
    }
  },
  // rid 代表当前选中的明细主表 ID
  props: ['id', 'rid'],
  methods: {
    // 执行导出请求
    do_export() {
      if (!this.rid) {
        _.ui.message.warning('缺少单据 ID，无法导出')
        return
      }
      this.is_loading = true
      _.http
        .post('/api/saier/shipment/inv_pl/export', {
          rid: this.rid,
          currency_type: this.form.currency_type,
        })
        .then((res) => {
          if (res.code === 1 && res.data) {
            _.ui.message.success('生成成功，开始下载报表压缩包...')

            // 直接触发一次下载：下载 ZIP 压缩包
            // 此时 res.data 就是后端传来的 "发票号_INV_PL.zip"
            _.http.download(
              '/api/tmp/file/get',
              { file: res.data },
              res.data,
            )

            this.visible = false // 导出成功后自动关闭弹窗
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg || '网络异常，导出失败')
        })
        .finally(() => {
          this.is_loading = false
        })
    },

    do_closed() {
      _.ui.free_dialog(this.id) // 释放组件，防止 DOM 污染
    },
  },
})

// 优景财务出运清单

// 优景财务出运清单导出弹窗
_.app.component('finance_shipment_list_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        title="生成财务出运清单"
        width="440px"
        :close-on-click-modal="false"
        style="border-radius: 10px;"
        @closed="do_closed"
        >
        <el-form 
          :model="form" 
          label-width="130px" 
          style="padding: 10px 10px 0 0;"
          @submit.native.prevent>
          <el-form-item label="外销单价保留位数">
            <el-radio-group v-model="form.decimal_places">
              <el-radio label="1">1位</el-radio>
              <el-radio label="2">2位 (默认)</el-radio>
              <el-radio label="3">3位</el-radio>
              <el-radio label="4">4位</el-radio>
            </el-radio-group>
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button 
              type="primary" 
              :loading="is_loading"
              @click="do_export">
              确认生成
            </el-button>
          </div>
        </template>
    </el-dialog>
  `,

  data() {
    return {
      visible: true,
      is_loading: false,
      form: {
        decimal_places: '2', // 默认对应 Delphi 里的保留2位小数
      },
    }
  },
  // rid 代表当前选中的明细主表 ID
  props: ['id', 'rid'],
  methods: {
    // 执行导出请求
    do_export() {
      if (!this.rid) {
        _.ui.message.warning('缺少单据 ID，无法导出')
        return
      }
      this.is_loading = true
      _.http
        .post('/api/saier/shipment/finance_list/export', {
          record_id: this.rid,
          decimal_places: this.form.decimal_places,
        })
        .then((res) => {
          if (res.code === 1 && res.data) {
            _.ui.message.success('生成成功，即将下载报表...')

            // 触发下载单份 Excel 报表 (注意：我们已经移除了 ZIP 打包)
            _.http.download(
              '/api/tmp/file/get',
              { file: res.data },
              res.data,
            )

            this.visible = false // 导出成功后自动关闭弹窗
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg)
        })
        .finally(() => {
          this.is_loading = false
        })
    },

    do_closed() {
      _.ui.free_dialog(this.id) // 释放组件，防止 DOM 污染
    },
  },
})



// 出运明细 - 生成报关单/商业发票/装箱单
_.app.component('declaration_export_dialog', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        title="生成报关单/发票/装箱单"
        width="550px"
        :close-on-click-modal="false"
        style="border-radius: 10px;"
        @closed="do_closed"
        >
        
        <el-form 
          :model="form" 
          label-width="120px" 
          style="padding: 10px 20px 0 0;"
          @submit.native.prevent>
 
          <el-form-item label="外销单价位数">
            <el-radio-group v-model="form.djws">
              <el-radio label="1">1位</el-radio>
              <el-radio label="2">2位 (默认)</el-radio>
              <el-radio label="3">3位</el-radio>
              <el-radio label="4">4位</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="公司抬头" v-if="!is_uae">
            <el-radio-group v-model="form.gs11">
              <el-radio label="1">优胜 (默认)</el-radio>
              <el-radio label="2">其他</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="单据类型" v-if="!is_uae">
            <el-checkbox-group v-model="form.ed_list">
              <el-checkbox label="1">报关单 (BGD)</el-checkbox>
              <el-checkbox label="2">商业发票 (INV)</el-checkbox>
              <el-checkbox label="3">装箱单 (PL)</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="导出币种" v-if="!is_uae">
            <el-radio-group v-model="form.hbdm">
              <el-radio label="1">美金 (USD)</el-radio>
              <el-radio label="2">人民币 (RMB)</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="模板大类" v-if="!is_uae">
            <el-radio-group v-model="form.hr1">
              <el-radio label="1">优景/景驰</el-radio>
              <el-radio label="2">FF/俄罗斯</el-radio>
              <el-radio label="3">通用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="排版方向" v-if="!is_uae">
            <el-radio-group v-model="form.da1">
              <el-radio label="1">竖版</el-radio>
              <el-radio label="2">横版</el-radio>
              <el-radio label="3">BP或景驰</el-radio>
            </el-radio-group>
          </el-form-item>

        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="visible = false">取消</el-button>
            <el-button 
              type="primary" 
              :loading="is_loading"
              @click="do_export">
              确认生成
            </el-button>
          </div>
        </template>
    </el-dialog>
  `,

  data() {
    return {
      visible: true,
      is_loading: false,
   
      form: {
        djws: '2',
        gs11: '1',
        ed_list: ['1', '2', '3'],
        hbdm: '1',
        hr1: '1',
        da1: '3',
      },
    }
  },
  props: ['id', 'rid', 'is_uae'], // is_uae 用于区分是否为 UAE 版本，UAE 版本隐藏部分选项
  methods: {
    do_export() {
      if (!this.rid) {
        _.ui.message.warning('缺少单据 ID，无法导出')
        return
      }
      this.is_loading = true
      
      const payload = {
        rid: this.rid,
        djws: this.form.djws,
        gs11: this.form.gs11,
        ed: this.form.ed_list.join(''),
        hbdm: this.form.hbdm,
        hr1: this.form.hr1,
        da1: this.form.da1
      }

      _.http
        .post('/api/saier/shipment/declaration/export', payload)
        .then((res) => {
          if (res.code === 1 && res.data) {
            _.ui.message.success('生成成功，开始下载...')
            _.http.download('/api/tmp/file/get', { file: res.data }, res.data)
            this.visible = false
          } else {
            _.ui.message.error(res.msg || '生成失败')
          }
        })
        .catch((err) => {
          console.error(err)
          _.ui.message.error(err.msg || '网络异常，导出失败')
        })
        .finally(() => {
          this.is_loading = false
        })
    },
    do_closed() {
      _.ui.free_dialog(this.id)
    },
  },
})
