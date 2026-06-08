/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("order_apply_form", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('批量合同申请')"
        top="15vh"
        class="tiny-width auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-alert :title="_l('请选择符合数据格式的Excel文件上传')" :closable="false" style="margin-bottom:16px" />
        <el-form v-model="data" label-width="120px" class="excel-import-form">
            <el-form-item  :label="_l('选择数据文件')" >
                <el-upload :show-file-list="data.file!=undefined" :auto-upload="false"
                    :on-change="do_add_file"
                    :on-remove="do_remove_file"
                    :data="upload_data"
                    style="width:100%"
                    :limit="1"
                    accept=".xlsx"
                    ref="upload"
                >
                    <el-button>{{_l('上传文件')}}</el-button>
                </el-upload>
            </el-form-item>
        </el-form>
        <template #footer>
            <div>
                <el-button @click="do_download">{{_l('下载模板')}}</el-button>
                <el-button @click="do_cancel">{{_l("取消")}}</el-button>
                <el-button type="primary" @click="do_post">{{_l('确定')}}</el-button>
            </div>
        </template>
    </el-dialog>
    `,
    data() {
        return {
            visible: true,
            data: {
                file: undefined,
                name: '',
            },
            upload_data: {}
        }
    },
    props: ['id', 'rid', 'module', 'wfgs'],
    methods: {
        do_closed() {
            // console.error(this.id)
            _.ui.free_dialog(this.id)
            if (this.message) {
                this.message.close()
            }
        },
        do_add_file(file) {
            // console.log(file.name, file.size)
            this.data.file = file
            // console.log(this.data)
        },
        do_remove_file(file) {
            this.data.file = undefined;
        },
        // 确认按钮
        do_post() {
            if (this.data.file == undefined) {
                _.ui.error_message(_l('请选择数据文件'))
                return
            }
            this.data.wfgs = this.wfgs
            _.http.post('/api/saier/order_apply/from/excel', this.data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                // _.ui.show_process_dialog(_l('正在处理'))
            }).catch(res => {
                // this.title=res.msg
                // _.ui.show_process_dialog(res.msg)
            })
        },
        do_download() {
            _.http.post('/api/saier/order_apply/download/excel',{
            }).then(res => {
                _.http.download("/api/file/get", {
                        file: res.data
                    },
                    '合同申请模板.xlsx'
                );
            }).catch(res => {
                console.log(res)
                _.ui.error_message(res.msg)
            })
        },
        do_cancel() {
            this.do_closed()
        }
    },
    mounted() {
    }
})