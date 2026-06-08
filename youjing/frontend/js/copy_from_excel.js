/*
 * @Author: Gavin
 * @Date: 2023-10-27 23:23:52
 * @LastEditors: Gavin
 * @LastEditTime: 2023-10-27 23:23:52
 * @Description:
 */
// https://element-plus.org/zh-CN/

_.app.component("copy_from_excel", {
    template: /*html*/ `
    <el-dialog
        v-model="visible"
        @paste.native="pasteInfo($event)"
        :title="_l('Excel数据,ctrl+v粘贴数据到当前界面中')"
        top="15vh"
        class="auto-height"
        style="width:800px"
        :close-on-click-modal="false"
        @closed="do_closed"
        >
        <el-table :data="tableRow" stripe style="width: 100%; height:300px;overflow:auto;" 
            >
            <el-table-column :prop="field.name" :label="field.caption" width="180" v-for="field in tableColumn" :key="field.name"/>
        </el-table>
        <template #footer>
            <div>
                <el-button @click="do_cancel">{{_l("取消")}}</el-button>
                <el-button type="primary" @click="do_append">{{_l('添加')}}</el-button>
            </div>
        </template>
    </el-dialog>
    `,
    data() {
        return {
            visible: true,
            tableColumn: [],
            tableRow: [],
            moduleColumn: {},
            fields_json: {},
        }
    },
    props: ['id', 'rid', 'group_name', 'run_fill','currency'],
    methods: {
        do_closed() {
            _.ui.free_dialog(this.id)
            if (this.message) {
                this.message.close()
            }
        },
        do_set_data(data, recordset, item_data, item_table) {
            let check_list = []
            let new_data = []
            let run_fill = this.run_fill
            let currency = this.currency
            let group_name = this.group_name
            let column = this.moduleColumn
            let seq = item_data.length + 1;
            for (let row of data) {
                let row_json = {}
                let val_json = {}
                let rid = _.utils.guid()
                row_json.rid = rid
                row_json.pid = this.rid
                row_json.ctime = new Date().format('yyyy-MM-dd hh:mm:ss')
                row_json.mtime = new Date().format('yyyy-MM-dd hh:mm:ss')
                row_json.seq = seq                   
                for (let key in row) {
                    if (column[key] == undefined) {
                        if (check_list.indexOf(key) == -1) {
                            check_list.push(key)
                        }
                        continue
                    }

                    let value = row[key]
                    if (value == undefined) {
                        value = ""
                    }
                    if (value == "") {
                        if (column[key].kind == 1 || column[key].kind == 2 || column[key].kind == 6) {
                            value = 0
                        } else if (column[key].kind == 3) {
                            value = null
                        }
                    } else {
                        if (column[key].kind == 1 || column[key].kind == 2 || column[key].kind == 6) {
                            // console.log('a: ',value)
                            if (isNaN(value)){
                                // var regex = /\n/;
                                // let val_list = value
                                // if (regex.test(value)){
                                // console.log('b: ',(String(value)).replace(',',''))
                                value = parseFloat(value.replace(/,/g, ''))
                                // console.log('bsss: ', value)
                                // val_list = value.match(/\d+\.\d+/g)
                                // console.log('c: ',val_list)
                                // // }
                                // if (Array.isArray(val_list)){
                                //     console.log('ddd: ',val_list)
                                //     if (val_list.length>0){
                                //         value = Number(val_list[0])
                                //     } else {
                                //         value=0
                                //     }
                                // }
                                // else {
                                //     console.log('gg: ',val_list)
                                //     value = Number(val_list)
                                // }  
                                // value = Number(value)                          
                            } else {
                                // console.log('222: ',value)
                                value = Number(value)
                            }
                        }
                    }
                    val_json[key] = value
                    row_json[column[key].name] = value
                }
                setTimeout(function(){
                    if (run_fill){
                        item_table.append().then(res=>{
                            for (let v in val_json){
                                recordset.val(group_name+'.'+v, val_json[v])
                            }
                        })
                    }
                })
                // console.log(item_table.group)
                // console.log(item_table.group.indexOf('收入'))

                item_table.push_new_rid(rid)
                new_data.push(row_json)
                seq += 1
            }
            // recordset.refresh_ui()
            return {
                data: new_data,
                msg: check_list
            }
        },
        do_append() {
            let recordset = _.platform.active.recordset
            let item_table = recordset.tables[this.group_name]
            let item_data = item_table.all_data
            res = this.do_set_data(this.tableRow, recordset, item_data, item_table)
            if (!this.run_fill) {
                console.log(res.data)
                item_table.all_data.push(...res.data);
                item_table.sync_operate_data()
                recordset.do_re_sum_by_trigger_table(this.group_name)
                item_table.modified = true;
            }
            this.do_closed()
            if (res.msg.length > 0) {
                _.ui.message.error('【' + this.group_name + '】未找到列标题【' + res.msg.join(';') + '】字段')
            }
        },
        do_cancel() {
            this.do_closed()
        },
        tsvStringToArray(data) {
            // data = data.replace(',','')
            const re = /(\t|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^\t\r\n]*))/gi
            const result = [
                []
            ]
            let matches
            while ((matches = re.exec(data))) {
                if (matches[1].length && matches[1] !== "\t") result.push([])
                result[result.length - 1].push(
                    matches[2] !== undefined ? matches[2].replace(/""/g, '"') : matches[3]
                )
            }
            return result
        },
        pasteInfo(e) {
            try {
                e.preventDefault()
                var data = null;
                var clipboardData = e.clipboardData; // IE
                if (!clipboardData) {
                    //chrome
                    clipboardData = e.originalEvent.clipboardData;
                }
                // 图片处理，不能支持多图，暂时放弃
                // console.log(clipboardData)
                // console.log(clipboardData.getData("Text"))
                // console.log(clipboardData.files)
                // for (var i = 0; i < clipboardData.files.length; i++) {
                //     blob = clipboardData.files[i]
                // }

                // for (var i = 0; i < clipboardData.items.length; i++) {
                //     console.log(clipboardData.items[i])
                //     if (clipboardData.items[i].type.indexOf("image") !== -1) {
                //         blob = clipboardData.items[i].getAsFile();
                //     }
                // }
                data = clipboardData.getData("Text");
                let rowStrArray = this.tsvStringToArray(data)
                this.tableRow = [];
                if (rowStrArray.length < 2) {
                    _.ui.message.error('Excel数据格式不对')
                    return
                }
                var field_list = []
                this.tableColumn = []
                var tdStrArray = rowStrArray[0];
                for (var j = 0; j < tdStrArray.length; j++) {
                    let caption = tdStrArray[j].replace("\n", " ")
                    if (field_list.indexOf(caption) != -1) {
                        _.ui.message.error('列标题【' + String(caption) + '】存在重复')
                        return
                    }
                    this.tableColumn.push({
                        'caption': caption,
                        'name': caption
                    })
                }
                for (var i = 1; i <= rowStrArray.length - 1; i++) {
                    let row_json = {}
                    var tdStrArray = rowStrArray[i];
                    if (tdStrArray == "") {
                        continue
                    }
                    for (var j = 0; j < tdStrArray.length; j++) {
                        let value = tdStrArray[j]
                        if (tdStrArray[j] == undefined) {
                            value = ""
                        }
                        value = value.replace("\n", " ")
                        row_json[this.tableColumn[j].name] = value
                    }
                    this.tableRow.push(row_json);
                }
            } catch (err) {
                _.ui.message.error(err)
            }
        },
    },
    mounted() {
        let fields = _.platform.active.module.group_by_name(this.group_name).fields
        for (let field of fields) {
            this.moduleColumn[field.caption] = {
                'name': field.db.name,
                'kind': field.db.kind
            }
        }
    }
})