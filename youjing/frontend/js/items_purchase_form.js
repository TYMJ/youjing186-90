/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("items_purchase_form", {
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
            <div class="demo-input-suffix">产品编号:
                <el-input v-model="data.cpbh" style="width:80%"></el-input>
            </div>
            <div class="demo-input-suffix">厂商编号:
                <el-input v-model="data.csbh" style="width:80%"></el-input>
            </div>            
            <div class="demo-input-suffix">采购人员:
                <el-input v-model="data.cgry" style="width:80%"></el-input>
            </div>
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
                csbh: '',
                cpbh: '',
                cgry: ''
            },
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
        // 确认按钮
        do_post() {
            if (this.data.csbh==undefined || this.data.csbh.trim()=='') {
                _.ui.error_message(_l('厂商编号不能为空'))
                return
            }
            if (this.data.cpbh==undefined || this.data.cpbh.trim()=='') {
                _.ui.error_message(_l('产品编号不能为空'))
                return
            }
            if (this.data.cgry==undefined || this.data.cgry.trim()=='') {
                _.ui.error_message(_l('采购人员不能为空'))
                return
            }
            this.data.rids = this.rids
            this.data.module = this.module
            _.http.post('/api/saier/items/update/purchase', this.data).then(res => {
                _.ui.success_message(res.msg)
                this.do_closed()
                _.platform.active.load_data();
            }).catch(res => {
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