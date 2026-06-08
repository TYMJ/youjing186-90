/***默认状态：隐藏"查看人员"，禁用"托数/仓位/备注信息"三个字段
输单人员或管理员：显示"查看人员"分组
仓库操作人员：可以编辑"托数/仓位/备注信息"三个字段***/
const kcmx_record_load = (evt_id, recordset) => {
    var c = 'zjnblh';
    var username = recordset.user.username;
    if (recordset.val('输单人员') == username || username == c) {
        recordset.module.group_by_name('查看人员').show();
    }else{
         recordset.module.group_by_name('查看人员').hide();
    }
     _.http.post('/api/Ravencloud/Select_sys_username_ck', {
                    "username": username
                },

                true).then(res => {
                if (res.code == 1) {
                    var position = res.data;

                    if (position.includes('仓库操作')==true) {

                        recordset.module.field_by_full_name('托数').disabled = false;
                        recordset.module.field_by_full_name('仓位').disabled = false;
                        recordset.module.field_by_full_name('备注信息').disabled = false;
                    }else{
                        recordset.module.field_by_full_name('托数').disabled = true;
                        recordset.module.field_by_full_name('仓位').disabled = true;
                        recordset.module.field_by_full_name('备注信息').disabled = true;
                    }
                    
                    

                }
            })


}
// 模块编辑界面记录加载后接挂点
_.evts.on([_.evtids.RECORD_LOAD], kcmx_record_load, '库存明细')

//部门刷新后触发事件
const evt_inventorydetail_FormShow = (evt_id, form) => {
    if (!form.is_editor) {
        form.toolbar.insert({
            "name": 'depertment-button',
            "caption": '部门刷新',
            "icon": 'any-newspaper',
            "color": 'red',

            "divided": true, //分割线

        }, 'close');
        // form.toolbar.insert({
        //     "name": 'excel-button',
        //     "caption": '选中库存到导出',
        //     "icon": 'any-newspaper',
        //     "color": 'red',

        //     "divided": true, //分割线

        // }, 'close');
       
    }
        let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'export_btn1',
            "caption": '选中库存导出',
            "icon": 'any-function',
            "divided": true
        });
      
    }
    if (btns.length == 0) {
        return;
    }
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '报表按钮',
        "icon": '#ext-add_database',
        "btns": btns,
        "divided": true
    }], 'close');
}
_.evts.on([_.evtids.MODULE_SEARCH_SHOW], evt_inventorydetail_FormShow, '库存明细')

const inventorydetail_order_form_btn = (evt_id, btn, form) => {
    if (btn.name == 'depertment-button') {
       
        fndepertment(form.recordset);
        
    }
      if (btn.name == 'excel-button') {
       
        export_inventorydetail_excel(form);
       
    }

 
  
    if (btn.name === 'export_btn1') {
    let rids = form.current_rids.value;
    
    if (rids.length === 0) {
        if (form.current_rid.value !== '' && form.current_rid.value != null) {
            rids = [form.current_rid.value];
        }
    }
    
    if (rids.length === 0) {
        _.ui.message.error('请先选中要导出的记录');
        return;
    }
    
    _.http.post('/api/RavenCloud/kcdc/report/export', {
        rids: rids
    }).then(res => {
        let d = res.data;
        if (d && d.path !== '' && d.path != null) {
            _.http.download('/api/tmp/file/get', {
                file: d.path
            }, d.name );
        }
    }).catch(err => {
        console.log(err);
        _.ui.message.error(err.msg || '导出失败');
    });
}
   
}
// 菜单按钮click接挂点
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], inventorydetail_order_form_btn, '库存明细')

var fndepertment = (recordset) => {
   
   _.http.post('/api/Ravencloud/Update_inven_depertment', {},true).then(res => {
                if (res.code == 1) {
                     _.ui.message.warning('部门刷新成功！！！');
                    console.log('部门刷新成功');
                   
                    

                }
            })


    
}

// 需要引入 xlsx 库: <script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js"></script>

// 导出库存明细到Excel
const export_inventorydetail_excel = async (form) => {
    try {
        let choose = form.current_rids.value;

        if (choose.length == 0) {
            _.ui.message.warning(_l('未选中记录！'));
            return;
        }
       

        console.log(choose)
        const username = form.recordset.user.username;
        
        // 获取选中的rid列表
        const rid_list = [];
        const numberlist = [];
        
        if (recordset.datacenter) {
            recordset.datacenter.getnumberlist(numberlist);
            rid_list.push(...numberlist);
        }
        
        if (rid_list.length === 0) {
            _.ui.message.error('请选择要导出的数据');
            return;
        }
        
        _.ui.message.info('正在生成Excel，请稍候...');
        
        // ✅ 直接调用已有的后端API
        const res = await _.http.post('/api/Ravencloud/export_inventorydetail_excel', {
            rid_list: rid_list,
            username: username
        }, true);
        
        if (res.code === 1) {
            _.ui.message.success('导出成功');
            
            // 下载文件
            const filename = res.data.filename;
            window.open(filename, '_blank');
        } else {
            _.ui.message.error(res.msg || '导出失败');
        }
        
    } catch (error) {
        console.error('导出失败:', error);
        _.ui.message.error('导出失败: ' + error.message);
    }
};




