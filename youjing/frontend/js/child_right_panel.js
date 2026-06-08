/*
 * @Author: Grays
 * @Date: 2024-02-19 17:01:24
 * @LastEditors: Grays
 * @LastEditTime: 2024-02-20 11:39:13
 * @Description: 
 */
var component_key = "child-table-image-view"
_.app.component(component_key,{
    template:/*html*/`
    <div class="com-child-table-image-view gavin_com-child-table-image-view">
        <a-loading v-show="loading"/>
        <a-field-photo-view :value="value"></a-field-photo-view>
    </div>
    `,
    // <el-alert :title="name" type="success" show-icon :closable="false"  />
    data(){
        return{
            value:'',
            name:'',
            loading:false,
            cache:{}
        }
    },
    props: ['module','recordset','group','table'],
	expose: ["do_record_scroll","do_reset"],
    computed:{
    },
    methods:{
        do_load_image_value(){
            let cpbh = '' 
            cpbh = this.recordset.val('产品资料.专业货号')
            if (this.cache[cpbh]!=undefined){
                this.value = this.cache[cpbh]
                return
            }
            this.loading= true
            _.http.post('/api/module/right/panel/image/view',{
                bjhh:cpbh,
            }).then(res=>{
                this.value = res.data
                if (cpbh!=''){
                    this.cache[cpbh] = res.data
                }
            }).catch(res=>{
                console.error(res)
                this.value = ''
            }).finally(()=>{
                this.loading = false
            })
        },
        do_record_scroll(){
            // console.error('do_record_scroll')
            this.do_load_image_value()
            this.cache = {}
        },
        do_reset(){
            // console.error('do_reset')
            this.value = ''
        },
        is_empty(v){
            return _.utils.is.is_empty(v)
        }
    },
    mounted(){
        // console.log(this)
        // console.log(this.module,this.recordset,this.group,this.table)
        this.do_load_image_value()
        this.cache = {}
    }
})

const do_module_group_show = (eid, { toolbar, module, table, recordset, group,show_right_panel,hide_right_panel }) => {
	if (group.value.name == "产品资料") {
        let is_show_right_panel = _.user.preference.kv.get(component_key, false)
        if (is_show_right_panel){
            show_right_panel(component_key,200)
        }
        toolbar.add({
            name:'preview_photo',
            icon:'any-image-1',
            caption:'图片预览',
            only_icon:true,
            icon_size:18,
            down:is_show_right_panel,
            action:()=>{
                if (is_show_right_panel){
                    hide_right_panel()
                    is_show_right_panel = false
                }else{
                    is_show_right_panel = true
                    show_right_panel(component_key,200)
                }
                const btn = toolbar.btn('preview_photo')
                if (btn){
                    btn.down = is_show_right_panel
                }
                _.user.preference.kv.set(component_key, is_show_right_panel, true)
            }
        })
	}
}
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "外销合同")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "客户报价")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "采购报价")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "业务询价")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "采购计划")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "采购合同")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "采购跟单")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "出运计划")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "预出运单")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "出运明细")
_.evts.on(any.evtids.MODULE_EDITOR_GROUP_SHOW, do_module_group_show, "报关明细")