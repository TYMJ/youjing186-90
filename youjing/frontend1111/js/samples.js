const samples_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (_.user.username.indexOf('汕头') != -1) {
            recordset.val('入库区域', '汕头')
        } else {
            recordset.val('入库区域', '宁波')
        }
        if (recordset.val('存储位置') == "" || recordset.val('一级分类') == "") {
            _.ui.message.error('需选择主要信息——存储位置和一级分类后方能生成条形码')
        }
        _.http.post('/api/saier/samples/save/before', {
            rid: recordset.val('rid'),
            ccwz: recordset.val('存储位置'),
            yjfl: recordset.val('一级分类'),
            ejfl: recordset.val('二级分类'),
            cpfl: recordset.val('产品分类'),
            sjfl: recordset.val('三级分类'),
            cpbh: recordset.val('产品编号'),
            txm: recordset.val('条 形 码'),
            txmt: recordset.val('条形码图'),
            ewmt: recordset.val('二维码图'),
        }).then(res => {
            console.log(res)
            if (res.data.txmh != "" && recordset.val('条 形 码') == "") {
                recordset.val('条 形 码', res.data.txmh)
            }
            if (res.data.txmt != "" && (recordset.val('条形码图') == null || recordset.val('条形码图') == "" || recordset.val('条形码图') == '[]')) {
                recordset.val('条形码图', res.data.txmt)
            }
            if (res.data.ewmt != "" && (recordset.val('二维码图') == null || recordset.val('二维码图') == "" || recordset.val('二维码图') == '[]')) {
                recordset.val('二维码图', res.data.ewmt)
            }
            let txm = recordset.val('条 形 码')
            if (txm != "" && recordset.val('产品编号') != "") {
                let c = recordset.tables['出库信息']
                let v = c.view_data
                let f = false
                for (let l of v) {
                    let flag = false
                    if (l.ypxzh != recordset.val('产品编号')) {
                        l.ypxzh = recordset.val('产品编号')
                        flag = true
                    }
                    if (l.lxm != recordset.val('条 形 码')) {
                        l.lxm = recordset.val('条 形 码')
                        flag = true
                    }
                    if (l.zwpm != recordset.val('中文品名')) {
                        l.zwpm = recordset.val('中文品名')
                        flag = true
                    }
                    if (flag) {
                        f = true
                        c.push_modi_rid(l.rid)
                    }
                }
                if (f) {
                    c.sync_operate_data()
                    c.modified = true
                }

                let r = recordset.tables['入库产品信息']
                let d = r.view_data
                f = false
                for (let l of d) {
                    let flag = false
                    if (l.cpfl != recordset.val('产品分类')) {
                        l.cpfl = recordset.val('产品分类')
                        flag = true
                    }
                    if (l.lxm != recordset.val('条 形 码')) {
                        l.lxm = recordset.val('条 形 码')
                        flag = true
                    }
                    if (l.yjfl != recordset.val('一级分类')) {
                        l.yjfl = recordset.val('一级分类')
                        flag = true
                    }
                    if (l.ejfl != recordset.val('二级分类')) {
                        l.ejfl = recordset.val('二级分类')
                        flag = true
                    }
                    if (l.sjfl != recordset.val('三级分类')) {
                        l.sjfl = recordset.val('三级分类')
                        flag = true
                    }
                    if (flag) {
                        f = true
                        r.push_modi_rid(l.rid)
                    }
                }
                if (f) {
                    r.sync_operate_data()
                    r.modified = true
                }
            }
            resolve()
        }).catch(err => {
            reject(err.msg)
            console.log(err)
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, samples_before_save, '样品管理')


const samples_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    if (field.full_name == n + '.库存数量') {
        let r = recordset.val('累计入库')
        if (r > 0) {
            if (recordset.val('库存数量') == 0) {
                _.ui.message.error('请注意库存数已为0')
            }
            if (recordset.val('库存数量') < 0) {
                _.ui.message.error('请注意库这个产品已无库存不能外借')
            }
        }
    }
    if (field.full_name == n + '.产品编号') {
        if (recordset.val('产品编号') == "") {
            recordset.module.field_by_full_name(n + '.产品编号').disabled = false
        } else {
            if (_.user.username.indexOf('汕头') != -1) {
                recordset.val('入库区域', '汕头')
            } else {
                recordset.val('入库区域', '宁波')
            }
            _.http.post('/api/saier/samples/itemno/change', {
                rid: recordset.val('rid'),
                itemno: recordset.val('产品编号'),
            }).then(res => {
                if (res.code == 0) {
                    _.platform.open_record('样品管理', res.data)
                } else {
                    recordset.do_action('事_产品编号')
                }
            }).catch(err => {
                _.ui.message.error(err.msg)
                console.log(err)
            })
        }
    }
    if (field.full_name == n + '.入库产品信息.产品编号') {
        recordset.val('入库产品信息.产品编号1', recordset.val('入库产品信息.产品编号'))
    }
    if (field.full_name == n + '.出库信息.是否核销') {
        _.http.post('/api/saier/samples/sfhx/change', {
            sfhx: recordset.val('出库信息.是否核销'),
            wyzd: recordset.val('出库信息.rid'),
        }).then(res => {

        }).catch(err => {
            _.ui.message.error(err.msg)
            console.log(err)
        })
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, samples_field_change, '样品管理')


const samples_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'barcode_empty_btn') {
        if (form.recordset.val('条 形 码') !== '') {
            form.recordset.val('条 形 码', '');
            form.module.field_by_full_name('条 形 码').disabled = false;
        }
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], samples_BtnClick, '样品管理')


const samples_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'barcode_empty_btn',
            "caption": '清空条码',
            "icon": 'any-keyborad',
        })
    }
    // btns.push({
    //     "name": 'suppliers_trans_btn',
    //     "caption": '潜在转专业',
    //     "icon": 'any-keyborad',
    // })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');

}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], samples_FormShow, '样品管理')

// 编辑界面数据加载以后执行
const samples_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
    _.http.post('/api/saier/samples/load/check', {
        module: recordset.module.name
    }).then(res => {
        if (res.data == 1) {
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = false;
        }
        if (recordset.val('条 形 码') !== '') {
            recordset.module.field_by_full_name(n + '.条 形 码').disabled = true;
        }
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })

}
_.evts.on([_.evtids.RECORD_LOAD], samples_recordLoad, '样品管理')


function samples_table_new_after(evt_id, table, recordset) {
    if (table.group == '入库产品信息') {
        recordset.val('入库产品信息.生产厂家', recordset.val('生产厂家1'));
        recordset.val('入库产品信息.厂家ID', recordset.val('厂家ID1'));
        recordset.val('入库产品信息.采购人员', recordset.val('采购人员'));
        recordset.val('入库产品信息.中文品名', recordset.val('中文品名'));
        recordset.val('入库产品信息.产品编号', recordset.val('产品编号'));
        recordset.val('入库产品信息.条 形 码', recordset.val('条 形 码'));

        recordset.val('入库产品信息.产品分类', recordset.val('产品分类'));
        recordset.val('入库产品信息.一级分类', recordset.val('一级分类'));
        recordset.val('入库产品信息.二级分类', recordset.val('二级分类'));
        recordset.val('入库产品信息.三级分类', recordset.val('三级分类'));
        recordset.val('入库产品信息.产品规格', recordset.val('产品规格'));
        recordset.val('入库产品信息.英文品名', recordset.val('英文品名'));

        recordset.val('入库产品信息.计量单位', recordset.val('计量单位'));
        recordset.val('入库产品信息.中文计量单位', recordset.val('中文计量单位'));
        recordset.val('入库产品信息.报关品名', recordset.val('报关品名'));
        recordset.val('入库产品信息.包装单位', recordset.val('包装单位'));
        recordset.val('入库产品信息.外箱容量', recordset.val('外箱容量'));
        recordset.val('入库产品信息.退 税 率', recordset.val('退 税 率'));

        recordset.val('入库产品信息.起 订 量', recordset.val('起 订 量'));
        recordset.val('入库产品信息.采购单价', recordset.val('采购单价'));
        recordset.val('入库产品信息.外箱体积', recordset.val('外箱体积'));
        recordset.val('入库产品信息.中文包装', recordset.val('中文包装'));
        recordset.val('入库产品信息.英文包装', recordset.val('英文包装'));
        recordset.val('入库产品信息.海关编码', recordset.val('海关编码'));
        recordset.val('入库产品信息.产品尺寸', recordset.val('产品尺寸'));
        recordset.val('入库产品信息.毛    重', recordset.val('毛    重'));
        recordset.val('入库产品信息.净    重', recordset.val('净    重'));
        recordset.val('入库产品信息.材    质', recordset.val('材    质'));
        recordset.val('入库产品信息.颜    色', recordset.val('颜    色'));
        recordset.val('入库产品信息.产品编号1', recordset.val('入库产品信息.产品编号'));
        recordset.val('入库产品信息.唯一字段', recordset.val('入库产品信息.rid'));
    }
    if (table.group == '出库信息') {
        recordset.val('出库信息.唯一字段', recordset.val('出库信息.rid'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], samples_table_new_after, '样品管理')