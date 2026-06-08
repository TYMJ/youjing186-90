_.app.component('Order_Tracking', {
  template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('导出跟单统计报表')"
        width="450px"
        class="auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-form 
          :model="form" 
          ref="statsForm"
          label-width="110px" 
          style="padding: 20px 20px 0 0;"
          @submit.native.prevent>
          
          <el-form-item :label="_l('采购人员')" prop="cgry">
            <el-input 
              v-model="form.cgry" 
              :placeholder="_l('不输为全部')" 
              clearable
            />
          </el-form-item>

          <el-form-item :label="_l('跟单人员')" prop="gdry">
            <el-input 
              v-model="form.gdry" 
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
        cgry: '', // 采购人员
        gdry: '', // 跟单人员
      },
      // 此报表的输入项非必填，因此可以没有校验规则
      // rules: {}
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
      // 1. 构造请求参数，对应后端的 cgry_filter, gdry_filter
      // 2. 发送请求生成 Excel 数据
      _.http
        .post('/api/saier/contract/report/excel', {
          // **关键修改: 将参数名映射到后端期望的名称**
          cgry_filter: this.form.cgry, // 对应后端的 cgry_filter
          gdry_filter: this.form.gdry, // 对应后端的 gdry_filter
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
              `跟单统计报表.xlsx`, // 设置默认下载的文件名
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

