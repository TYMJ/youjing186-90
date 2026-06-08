_.app.component('Quotation_Station_Table', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('导出报价统计报表（不按客户）')"
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
        .post('/api/saier/quotation/statistics/excel', {
          // **关键修改: 将参数名映射到后端期望的名称**
          qsrq: this.form.start_date, // 对应后端的 qsrq
          jsrq: this.form.end_date,   // 对应后端的 jsrq
          // purchaser 字段后端似乎未使用，但也可以一并发送
          // cgryaa: this.form.purchaser, 
        })
        .then((res) => {
          // 3. 后端返回 code=1 且 data 为文件名
          if (res.code === 1) {
            _.ui.message.success('报表生成成功，开始下载')
            // 4. 调用文件服务器接口下载
            console.log('Generated file:', res.data)
            _.http.download(
              'http://192.168.3.189:8080/api/tmp/file/get',
              {
                file: res.data, // 这里的 res.data 是后端生成的临时文件名
              },
              `报价统计表(不按客户).xlsx`,
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