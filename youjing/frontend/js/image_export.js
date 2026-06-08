/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("image-export-form", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('导入Excel数据')"
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
            <el-form-item :label="_l('主表选项')">
                <el-checkbox v-model="data.option.check">检测重复</el-checkbox>
                <el-checkbox v-model="data.option.image">导入图片</el-checkbox>
            </el-form-item>
            <el-form-item :label="_l('子表选项')">
                <el-checkbox v-model="data.option.check_child">检测重复</el-checkbox>
                <el-checkbox v-model="data.option.image_child">导入图片</el-checkbox>
            </el-form-item>
        </el-form>
        <el-input v-model="data.memo" type="textarea" :rows="6" input-style="color:red" disabled ></el-input>
        <template #footer>
            <div>
                <el-button @click="do_cancel">{{_l("取消")}}</el-button>
                <el-button type="primary" @click="do_post">{{_l('确定')}}</el-button>
            </div>
        </template>
    </el-dialog>
    `,
    // <el-form-item :label="_l('选择')">
    //     <el-select v-model="data.select" model-value='' placeholder='请选择'>
    //         <el-option
    //             v-for="item in data.options"
    //             :key="item.value"
    //             :value="item.label">
    //         </el-option>
    //     </el-select>
    // </el-form-item>

    data() {
        return {
            visible: true,
            data: {
                file: undefined,
                name: '',
                memo: '导入主表，需校验唯一时第一列必须是条件字段；\n导入子表，第一列必须是主表的第一列内容，第二列为子表唯一条件字段；\n\
导入图片，图片名称取第一列(子表取第二列)为文件名,图片必须在没合并的单元格内，且上边距、下边距不能超出边框，否则会导致图片与产品对应错误!',
                option:{
                    check: true,
                    image: false,
                    check_child: false,
                    image_child: false,
                },
                // options: [{
                //     "label": "男",
                //     "value": "选项1"
                // }, {
                //     "label": "女",
                //     "value": "选项2"
                // }]
            },
            upload_data: {}
        }
    },
    props: ['id', 'rids'],
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
        do_post() {
            if (this.data.file == undefined) {
                _.ui.error_message(_l('请选择数据文件'))
                return
            }
            _.http.post('/api/whale/data/import', this.data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(res => {
                _.ui.show_process_dialog(_l('正在处理'))
            }).catch(res => {
                this.title=res.msg
                _.ui.show_process_dialog(res.msg)
            })
        },
        do_message(message, msg) {
            // console.warn(msg)
            if (msg.data != undefined) {
                if (msg.data.code == 1) {
                    _.ui.set_process_dialog_position(msg.data.position, msg.data.max)
                } else if (msg.data.code == -1) {
                    _.ui.error_message(msg.data.msg)
                } else if (msg.data.code == 2) {
                    _.ui.set_process_dialog_position(msg.data.position, msg.data.max)
                    _.ui.success_message(`${this.data.file.name}` + msg.data.msg)
                    // _.ui.success_message(`${this.data.file.name}导入完成`)
                    this.$refs.upload.handleRemove(this.data.file)
                }
            }
        },
        do_cancel() {
            this.do_closed()
        }
    },
    mounted() {
        // console.error('this.rids: ', this.rids[0].value);
        this.message = new _.Message()
        this.message.init(_.utils.unique(), 'WHALE_IMPORT')
        this.message.on_message = this.do_message
    }
})