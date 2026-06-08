const module_set_recordLoad = (evt_id, recordset) => {
    let module_list = []
    for (let module of _.model.get_all_module_list()){
        module_list.push(module.name)
    }
    recordset.set_list_options(recordset.module.name+'.模块名称', module_list)
    let module_name = recordset.val('模块名称')
    if (module_name!=''){
        let field_list = []
        let groups = _.model.get_module_by_name(recordset.val('模块名称')).groups
        for (let group of groups){
            if (group.is_table) continue
            let fields = group.fields
            for (let field of fields){
                field_list.push(field.name)
            }
        }
        recordset.set_list_options(recordset.module.name+'.条件字段', field_list)

        let group_list = []
        for (let group of _.model.get_module_by_name(module_name).groups){
            group_list.push(group.name)
        }
        recordset.set_list_options(recordset.module.name+'.字段明细.字段组名', group_list)
    }
}
_.evts.on([_.evtids.RECORD_LOAD], module_set_recordLoad, '显示设置')
_.evts.on([_.evtids.RECORD_LOAD], module_set_recordLoad, '必填设置')
_.evts.on([_.evtids.RECORD_LOAD], module_set_recordLoad, '移动设置')

const module_set_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let self_name = recordset.module.name
    var aFullName = [self_name + '.模块名称'];
    let module_name = recordset.val('模块名称')
    if (aFullName.indexOf(field.full_name) != -1) {
        if (recordset.val('模块名称')!=''){
            let field_list = []
            let groups = _.model.get_module_by_name(recordset.val('模块名称')).groups
            for (let group of groups){
                if (group.is_table) continue
                let fields = group.fields
                for (let field of fields){
                    field_list.push(field.name)
                }
            }
            recordset.set_list_options(self_name+'.条件字段', field_list)
        }
        if (recordset.tables['字段明细'].view_data.length>0){
            _.ui.confirm('模块名称发生变化会清空字段明细，是否继续?','操作确认').then(res=>{
                recordset.tables['字段明细'].clear()
                if (module_name!=''){
                    let group_list = []
                    for (let group of _.model.get_module_by_name(module_name).groups){
                        group_list.push(group.name)
                    }
                    recordset.set_list_options(self_name+'.字段明细.字段组名', group_list)
                    recordset.set_list_options(self_name+'.字段明细.字段名称', '')
                } else {
                    recordset.set_list_options(self_name+'.字段明细.字段组名', '')
                    recordset.set_list_options(self_name+'.字段明细.字段名称', '')
                }
            })
        } else {
            if (module_name!=''){
                let group_list = []
                console.log(_.model.get_module_by_name(module_name))
                for (let group of _.model.get_module_by_name(module_name).groups){
                    group_list.push(group.name)
                }
                recordset.set_list_options(self_name+'.字段明细.字段组名', group_list)
                recordset.set_list_options(self_name+'.字段明细.字段名称', '')
            } else {
                recordset.set_list_options(self_name+'.字段明细.字段组名', '')
                recordset.set_list_options(self_name+'.字段明细.字段名称', '')
            }
        }

    }

    var aFullName = [self_name + '.字段明细.字段组名'];
    if (aFullName.indexOf(field.full_name) != -1) {
        if (recordset.val('字段明细.字段组名')!='' && module_name!=''){
            let field_list = []
            let group = _.model.get_module_by_name(module_name).group_by_name(recordset.val('字段明细.字段组名'))
            recordset.val('字段明细.是否子表',group.is_table)
            let fields = group.fields
            for (let field of fields){
                field_list.push(field.name)
            }
            recordset.set_list_options(self_name+'.字段明细.字段名称', field_list)
            recordset.val('字段明细.字段名称','')
            recordset.val('字段明细.字段全名','')
            // recordset.val('字段明细.显示名称','')
        }
    }

    var aFullName = [self_name+ '.字段明细.字段组名',self_name + '.字段明细.字段名称', self_name + '.字段明细.是否子表'];
    if (aFullName.indexOf(field.full_name) != -1) {
        if (recordset.val('字段明细.字段组名')!='' && recordset.val('字段明细.字段名称')!=''  && module_name!=''){
            let full_name = ''
            if (recordset.val('字段明细.是否子表')==true || recordset.val('字段明细.是否子表')==1){
                full_name = module_name+'.'+recordset.val('字段明细.字段组名')+'.'+recordset.val('字段明细.字段名称')
            } else {
                full_name = module_name+'.'+recordset.val('字段明细.字段名称')
            }
            recordset.val('字段明细.字段全名',full_name)
            let kind_json = {'0':'字符','1':'整型','2':'浮点','3':'日期','4':'文本','5':'图片','6':'布尔'}
            let kind = _.model.get_module_by_name(module_name).field_by_full_name(full_name).db.kind
            recordset.val('字段明细.数据类型',kind_json[String(kind)])
            recordset.val('字段明细.表字段名',_.model.get_module_by_name(module_name).field_by_full_name(full_name).db.name)
            // recordset.val('字段明细.显示名称',recordset.val('字段明细.字段名称'))
        } else {
            recordset.val('字段明细.字段全名','')
            recordset.val('字段明细.数据类型','')
            recordset.val('字段明细.表字段名','')
            // recordset.val('字段明细.显示名称','')
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED,module_set_field_change,'显示设置')
_.evts.on(_.evtids.RECORD_FIELD_CHANGED,module_set_field_change,'必填设置')
_.evts.on(_.evtids.RECORD_FIELD_CHANGED,module_set_field_change,'移动设置')

// 子表记录scroll事件
const module_set_table_scroll = (evt_id, table, recordset) => {
    if (table.group=='字段明细') {
        let module_name = recordset.module.name
        if (recordset.val('字段明细.字段组名')!=''  && recordset.val('模块名称')!=''){
            let field_list = []
            let group = _.model.get_module_by_name(recordset.val('模块名称')).group_by_name(recordset.val('字段明细.字段组名'))
            let fields = group.fields
            for (let field of fields){
                field_list.push(field.name)
            }
            recordset.set_list_options(module_name+'.字段明细.字段名称', field_list)
        }
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, module_set_table_scroll, '显示设置')
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, module_set_table_scroll, '必填设置')
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, module_set_table_scroll, '移动设置')

const module_set_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        // if (_.user.admin){
        //     console.log('123')
        //     resolve()
        //     return
        // }
        // console.log('456')
        let module_name = recordset.val('模块名称')
        let field_list = []
        let group_json = {}
        if (_.model.get_module(module_name)==undefined){
            reject('模块名称【'+module_name+'】不存在')
            return
        }
        let data = recordset.tables['字段明细'].view_data
        for (let row of data){
            if (_.model.get_module(module_name).group_by_name(row.zdzm)==undefined){
                reject('字段组名【'+row.zdzm+'】不存在')
                return
            }
            if (_.model.get_module(module_name).field_by_full_name(row.zdqm)==undefined && row.qzdz==0){
                reject('字段名称【'+row.zdqm+'】不存在')
                return
            }
            if (field_list.indexOf(row.zdqm)<0){
                field_list.push(row.zdqm)
            } else {
                reject('字段名称【'+row.zdqm+'】重复设置')
                return
            }
            if (group_json[row.zdzm]==undefined){
                group_json[row.zdzm]={'qzdz':row.qzdz,'zdmc':row.zdmc}
            } else {
                if (group_json[row.zdzm]['qzdz']==1 || group_json[row.zdzm]['qzdz']==true){
                    reject('字段组名【'+row.zdzm+'】设置了全字段组时不能再设置字段名称【'+row.zdmc+'】')
                    return
                } else if (row.qzdz==1 || row.qzdz==true){
                    reject('字段组名【'+row.zdzm+'】设置了全字段组时不能再设置字段名称【'+group_json[row.zdzm]['zdmc']+'】')
                    return
                }
            }
        }
        resolve();
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, module_set_before_save, '显示设置')
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, module_set_before_save, '必填设置')
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, module_set_before_save, '移动设置')


const bug_recordLoad = (evt_id, recordset) => {
    let module_list = []
    for (let module of _.model.get_all_module_list()){
        module_list.push(module.name)
    }
    recordset.set_list_options(recordset.module.name+'.模块名称', module_list)
}
_.evts.on([_.evtids.RECORD_LOAD], bug_recordLoad, '系统问题提交')


const bug_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let t = recordset.tables['处理跟进'].view_data
        let i = t.length
        if (i>0){
            recordset.val('处理状态', t[i-1].clzt)
            recordset.val('跟进说明', t[i-1].gjsm)
        } else {
            recordset.val('处理状态', '未处理')
            recordset.val('跟进说明', '')
        }
        resolve();
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, bug_before_save, '系统问题提交')