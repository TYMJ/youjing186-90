/*
 * @Author: Grays
 * @Date: 2022-11-01 23:23:52
 * @LastEditors: Grays
 * @LastEditTime: 2022-11-02 19:40:03
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("barcode_form", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        :title="_l('请扫条码')"
        top="15vh"
        class="tiny-width auto-height"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-form class="excel-import-form" @submit.native.prevent>
            <el-form-item label="条形码" style="margin-top:18px">
                <el-input v-model="code" @keyup.enter.native="do_post" style="margin-bottom:18px"/>
            </el-form-item>
        </el-form>
    </el-dialog>
    `,
    // <template #footer>
    //     <div>
    //         <el-button @click="do_cancel">{{_l("取消")}}</el-button>
    //         <el-button type="primary" @click="do_post">{{_l('确定')}}</el-button>
    //     </div>
    // </template>
    data() {
        return {
            visible: true,
            code:'',
        }
    },
    props: ['id', 'rids','module_name'],
    methods: {
        do_closed() {
            _.ui.free_dialog(this.id)
            if (this.message) {
                this.message.close()
            }
        },
        do_post() {
            if (this.code!=undefined && this.code!=""){
                _.platform.active.recordset.tables['产品资料'].append().then(res=>{
                    _.platform.active.recordset.val('产品资料.产品条码',this.code)
                    // _.platform.active.recordset.val('产品资料.专业货号',this.code)
                    // _.platform.active.recordset.val('产品资料.询价货号',this.code)
                    this.code=''
                })
            }
        },
        do_cancel() {
            this.do_closed()
        }
    },
    mounted() {
        // console.error('this.rids: ', this.rids[0].value);
    }
})