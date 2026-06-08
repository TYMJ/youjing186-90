/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("image-upload-new", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('批量上传图片')"
        top="15vh"
        class="tiny-width auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-alert :title="_l('请选择符合数据格式的图片文件上传')" :closable="false" style="margin-bottom:10px" />
        <el-form v-model="data" class="excel-import-form">
            <el-form-item>
                <el-upload :show-file-list="data.filelist!=undefined" 
                    :auto-upload="false"
                    :on-change="do_add_file"
                    limit=1
                    :max-size="2000 * 1024 * 1024"
                    style="width:100%"
                    accept=".zip"
                    ref="upload"
                >
                    <el-button >{{_l('上传图片文件')}}</el-button>
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
                filelist: [],
                length:0,
            }
        }
    },
    props: ['id', 'rid', 'rids', 'kind'],
    methods: {
        do_closed() {
            console.error(this.module_name)
            _.ui.free_dialog(this.id)
            if (this.message) {
                this.message.close()
            }
        },
        do_add_file(file) {
            this.data.file = file
        },
        // beforeRead (file){
        //     new Promise((resolve) => {
        //         // compressorjs 默认开启 checkOrientation 选项
        //         // 会将图片修正为正确方向
        //         console.log(file);
        //         new Compressor(file, {
        //             success: resolve,
        //             error(err) {
        //                 console.log(err.message);
        //                 _.ui.error_message('文件大小不能超过200M');
        //             },
        //         });
        //     })
        // },
        do_post() {
            if (this.data.file ==undefined) {
                _.ui.error_message(_l('请选择图片文件'))
                return
            }
            if (this.data.file.size / 1024 / 1024 > 2048) {
                _.ui.error_message('文件大小不能超过2G')
              return
            }
            this.data.module_name = this.module_name;
            this.data.length = 1;
            this.data.rid = this.rid
            this.data.kind = this.kind
            _.ui.show_loading_dialog("图片上传中...")
            _.http.post('/api/saier/suppliers/upload/photo', this.data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout:600*1000
            }).then(res => {
                _.ui.success_message(res.msg);
                // this.do_cancel();
            }).catch(res => {
                _.ui.error_message(res.msg);
            }).finally(res=>{
                _.ui.hide_loading_dialog()
            })
        },
        do_cancel() {
            this.do_closed()
        }
    },
    mounted() {
        // console.error('this.rids: ', this.rids[0].value);
    }
})