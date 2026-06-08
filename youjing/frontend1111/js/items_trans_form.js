/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("items_trans_form", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('转专属产品')"
        top="15vh"
        class="tiny-width auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-form v-model="data" label-width="120px" class="excel-import-form">
            <div class="demo-input-suffix">业务人员:
                <el-input v-model="data.ywry" style="width:80%"></el-input>
            </div>
            <div class="demo-input-suffix">操作选项:
                <el-checkbox v-model="data.retain">保留专业产品</el-checkbox>
            </div>
            <div class="demo-input-suffix">记录选择:
                <el-radio-group v-model="data.kind">
                    <el-radio :label="1">选中记录</el-radio>
                    <el-radio :label="2">Excel</el-radio>
                </el-radio-group>
            </div>
            <el-alert v-if="data.kind=='2'" :title="_l('请选择符合数据格式的Excel文件上传')" :closable="false" style="margin-bottom:8px"/>
            <el-form-item v-if="data.kind=='2'" :label="_l('选择Excel文件')">
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
                ywry: _.user.username,
                retain: false,
                kind: 1,
            },
            upload_data: {}
        }
    },
    props: ['id', 'rids', 'module'],
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
            console.log(this.rids)
            if (this.data.ywry==undefined || this.data.ywry.trim()=='') {
                _.ui.error_message(_l('业务人员不能为空'))
                return
            }
            this.data.rids = this.rids
            if (this.data.kind=="2") {
                if (this.data.file == undefined) {
                    _.ui.error_message(_l('请选择数据文件'))
                    return
                }
                this.data.module = this.module
                _.http.post('/api/saier/items/import/cpbh', this.data, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(res => {
                    this.do_closed()
                    _.platform.active.load_data();
                    // _.ui.show_process_dialog(_l('正在处理'))
                }).catch(res => {
                    // this.title=res.msg
                    // _.ui.show_process_dialog(res.msg)
                })
            } else {
                this.data.module = this.module
                _.http.post('/api/saier/items/trans/zscp', this.data).then(res => {
                    _.ui.success_message(res.msg)
                    this.do_closed()
                    _.platform.active.load_data();
                }).catch(res => {
                    _.ui.error_message(res.msg)
                })
            }
        },
        do_cancel() {
            this.do_closed()
        }
    },
    mounted() {
    }
})