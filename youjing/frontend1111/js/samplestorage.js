// 编辑界面数据加载以后执行
const samplestorage_recordLoad = (evt_id, recordset) => {
    if (recordset.job == 1) {
        recordset.tables['入库详情']._.toolbar.show('delete', false);
    }
}
_.evts.on([_.evtids.RECORD_LOAD], samplestorage_recordLoad, '样品入库管理')

const samplestorage_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('操作时间详情') == '') {
            recordset.val('操作时间详情', new Date().format('yyyy-MM-dd HH:mm:ss'))
        }
        let flag = false
        let oTable = recordset.tables['入库详情']
        let view_data = oTable.view_data
        let i = 0
        for (row of view_data) {
            i = i + 1
            if (row['wyzd'] == '') {
                // row['wyzd'] = 'ck' + i + row['czr'] + row['lxm'] + new Date().format('yyyy-MM-dd HH:mm:ss')
                row['wyzd'] = row.rid
            }
            row['czry'] = recordset.val('人    员')
            if (row['laiy'] == '') {
                row['laiy'] = recordset.val('来    源')
            }
            oTable.push_modi_rid(row.rid)
            flag = true
        }
        if (flag) {
            oTable.sync_operate_data()
            oTable.modified = true
        }
        _.http.post("/api/saier/samplestorage/before/save", {
            rkxq: view_data
        }).then(res => {
            resolve()
        }).catch(res => {
            console.log(res);
            reject(res.msg);
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, samplestorage_before_save, '样品入库管理')

// 编辑界面字段change后执行
const samplestorage_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name

    if (recordset.val('入库详情.条 形 码') != '') {
        recordset.val('入库详情.操作人', _.user.username)
        recordset.val('入库详情.日    期', new Date().format('yyyy-MM-dd'))
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, samplestorage_field_change, '样品入库管理')

const samplestorage_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '入库详情') {
        form.toolbar.add([{
            "name": 'sample_lxm_input_btn',
            "caption": '条码输入',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], samplestorage_EditorChildShow, '样品入库管理')


const shipmentsample_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('条 形 码') == '') {
            _.http.post("/api/saier/shipmentsample/before/save/get", {
                cpfl: recordset.val('产品分类'),
                yjfl: recordset.val('一级分类'),
                ejfl: recordset.val('二级分类'),
                cgdj: recordset.val('采购单价')
            }).then(res => {
                if (res.code == 1) {
                    let lxm = res.data
                    if (lxm != '') {
                        recordset.val('条 形 码', lxm)
                    }
                } else {
                    console.log(res);
                    reject(res.msg);
                }

            }).catch(res => {
                console.log(res);
                reject(res.msg);
            })
        }
        if (recordset.val('条 形 码') != '' && recordset.val('产品编号') != '') {
            _.http.post("/api/saier/shipmentsample/before/save/update", {
                cpbh: recordset.val('产品编号'),
                lxm: recordset.val('条 形 码')
            }).then(res => {

            }).catch(res => {
                console.log(res);
                reject(res.msg);
            })
        }
        let flag = false
        let oTable = recordset.tables['入库产品信息']
        let view_data = oTable.view_data
        for (row of view_data) {
            row['lxm'] = recordset.val('条 形 码')
            row['cpfl'] = recordset.val('产品分类')
            row['yjfl'] = recordset.val('一级分类')
            row['ejfl'] = recordset.val('二级分类')
            row['sjfl'] = recordset.val('三级分类')
            oTable.push_modi_rid(row.rid)
            flag = true
        }
        if (flag) {
            oTable.sync_operate_data()
            oTable.modified = true
        }
        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, shipmentsample_before_save, '出货样管理')

// 编辑界面字段change后执行
const shipmentsample_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name

    if (field.full_name == n + '.库存数量') {
        if (recordset.val('累计入库') > 0) {
            if (recordset.val('库存数量') == 0) {
                _.ui.message.error("请注意库存数已为0")
            }
            if (recordset.val('库存数量') < 0) {
                _.ui.message.error("请注意库这个产品已无库存不能外借")
            }

        }
    }
    if (field.full_name == n + '.产品编号') {
        let r = recordset.val('产品编号')
        if (r != "") {
            _.http.post('/api/saier/shipmentsample/cpbh/change', {
                cpbh: r,
                rid: recordset.val('rid')
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg)
                    recordset.val('产品编号', "")
                } else {
                    recordset.val('条 形 码', res.data.lxm);
                    recordset.val('产品分类', res.data.cpfl);
                    recordset.val('一级分类', res.data.yjfl);
                    recordset.val('二级分类', res.data.ejfl);
                    recordset.val('三级分类', res.data.sjfl);
                    recordset.val('产品规格', res.data.cpggz);
                    recordset.val('中文品名', res.data.zwpm);
                    recordset.val('英文品名', res.data.ywpm);
                    recordset.val('计量单位', res.data.jldw);
                    recordset.val('中文计量单位', res.data.zwdw);
                    recordset.val('报关品名', res.data.bgpm);
                    recordset.val('包装单位', res.data.bzdw);
                    recordset.val('外箱容量', res.data.bzrl);
                    recordset.val('退 税 率', res.data.tsl);
                    recordset.val('起 订 量', res.data.zxcgl);
                    recordset.val('采购单价', res.data.cgdj);
                    recordset.val('外箱体积', res.data.bztj);
                    recordset.val('中文包装', res.data.zhwbzh);
                    recordset.val('英文包装', res.data.bzhfsh);
                    recordset.val('海关编码', res.data.hgbm);
                    recordset.val('毛    重', res.data.mxmz);
                    recordset.val('净    重', res.data.mxjz);
                    recordset.val('产品尺寸', res.data.chpchc);
                    recordset.val('材    质', res.data.caiziz);
                    recordset.val('颜    色', res.data.yse);
                    if (r != res.data.cpbh) {
                        recordset.val('产品编号', res.data.cpbh)
                    }
                    if (recordset.val('条 形 码') == '') {
                        recordset.module.field_by_full_name('条 形 码').disabled = false;
                    }
                }

            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }

    if (field.full_name == n + '.条 形 码') {
        let r = recordset.val('条 形 码')
        if (r != "") {
            _.http.post('/api/saier/shipmentsample/lxm/change', {
                lxm: r,
                cpbh: recordset.val('产品编号')
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg)
                    recordset.val('条 形 码', "")
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }

    if (field.full_name == n + '.入库产品信息.入库数量') {
        if (recordset.val('入库产品信息.生产厂家') != '') {
            recordset.val('外箱容量', recordset.val('入库产品信息.外箱容量'));
            recordset.val('中文品名', recordset.val('入库产品信息.中文品名'));
            recordset.val('英文品名', recordset.val('入库产品信息.英文品名'));
            recordset.val('产品规格', recordset.val('入库产品信息.产品规格'));
            recordset.val('计量单位', recordset.val('入库产品信息.计量单位'));
            recordset.val('产品分类', recordset.val('入库产品信息.产品分类'));
            recordset.val('一级分类', recordset.val('入库产品信息.一级分类'));
            recordset.val('二级分类', recordset.val('入库产品信息.二级分类'));
            recordset.val('三级分类', recordset.val('入库产品信息.三级分类'));
            recordset.val('包装单位', recordset.val('入库产品信息.包装单位'));
            recordset.val('中文包装', recordset.val('入库产品信息.中文包装'));
            recordset.val('英文包装', recordset.val('入库产品信息.英文包装'));
            recordset.val('中文计量单位', recordset.val('入库产品信息.中文计量单位'));
            recordset.val('报关品名', recordset.val('入库产品信息.报关品名'));
            recordset.val('海关编码', recordset.val('入库产品信息.海关编码'));
            // recordset.val('下架数量', recordset.val('入库产品信息.采购人员')); // 被注释掉的代码
            recordset.val('产品尺寸', recordset.val('入库产品信息.产品尺寸'));
            recordset.val('材    质', recordset.val('入库产品信息.材    质'));
            recordset.val('颜    色', recordset.val('入库产品信息.颜    色'));
            recordset.val('外箱体积', recordset.val('入库产品信息.外箱体积'));
            recordset.val('采购单价', recordset.val('入库产品信息.采购单价'));
            recordset.val('退 税 率', recordset.val('入库产品信息.退 税 率'));
            recordset.val('起 订 量', recordset.val('入库产品信息.起 订 量'));
            recordset.val('毛    重', recordset.val('入库产品信息.毛    重'));
            if (recordset.val('组    别') === '') {
                recordset.val('组    别', recordset.val('入库产品信息.专属编号'));
            }
            recordset.val('出运日期', recordset.val('入库产品信息.出运日期'));
        }
    }

    if (field.full_name == n + '.入库产品信息.产品编号') {
        if (recordset.val('入库产品信息.唯一字段') == '') {
            recordset.val('入库产品信息.唯一字段', recordset.val('入库产品信息.rid'));
        }

        if (recordset.val('入库产品信息.产品编号1') == '') {
            recordset.val('入库产品信息.产品编号1', recordset.val('入库产品信息.产品编号'));
        }
    }

    if (field.full_name == n + '.出库信息.数    量' || field.full_name == n + '.出库信息.样品去向') {
        if (recordset.val('出库信息.数    量') == 0) {
            recordset.val('出库信息.下架数量', 0);
            recordset.val('出库信息.出借数量', 0);
        } else {
            if (recordset.val('出库信息.样品去向') == '下架') {
                recordset.val('出库信息.下架数量', recordset.val('出库信息.数    量'));
                recordset.val('出库信息.出借数量', 0);
            } else if (recordset.val('出库信息.样品去向') == '借用') {
                recordset.val('出库信息.下架数量', 0);
                recordset.val('出库信息.出借数量', recordset.val('出库信息.数    量'));
            }
        }
    }

    if (field.full_name == n + '入库产品信息.外销唯一' || field.full_name == n + '入库产品信息.采购合同') {
        if (recordset.val('入库产品信息.外销唯一') != '' && recordset.val('入库产品信息.采购合同') != '') {
            _.http.post('/api/saier/shipmentsample/rkcp/wxwy/change', {
                wxwy: recordset.val('入库产品信息.外销唯一'),
                cght: recordset.val('入库产品信息.采购合同')
            }).then(res => {
                if (res.data && res.data != {}) {
                    recordset.val('入库产品信息.款 式', res.data.ks)
                    recordset.val('入库产品信息.颜    色', res.data.yse)
                    recordset.val('入库产品信息.产品尺寸', res.data.zwcc)
                    recordset.val('入库产品信息.中文包装', res.data.zhwbzh)
                    recordset.val('入库产品信息.起 订 量', float(res.data.qdl))

                    if (recordset.val('入库产品信息.中文计量单位') == '') {
                        recordset.val('入库产品信息.中文计量单位', res.data.zwdw)
                    }
                    if (recordset.val('入库产品信息.产品规格') == '') {
                        recordset.val('入库产品信息.产品规格', res.data.cpgg)
                    }
                    if (recordset.val('入库产品信息.产品分类') == '') {
                        recordset.val('入库产品信息.产品分类', res.data.cpfl)
                    }
                    if (res.data.sccj1id != '') {
                        recordset.val('入库产品信息.厂家ID', res.data.sccj1id)
                    } else {
                        recordset.val('入库产品信息.厂家ID', res.data.csbh)
                    }
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }

    if (field.full_name == n + '入库产品信息.产品编号' || field.full_name == n + '入库产品信息.采购合同') {
        if (recordset.val('入库产品信息.产品编号') != '' && recordset.val('入库产品信息.采购合同') != '') {
            _.http.post('/api/saier/shipmentsample/rkcp/cpbh/change', {
                cpbh: recordset.val('入库产品信息.产品编号'),
                cpbh1: recordset.val('产品编号'),
                cght: recordset.val('入库产品信息.采购合同'),
                wxbm1: ''
            }).then(res => {
                if (res.data && res.data != {}) {
                    if (res.data.b != '') {
                        recordset.val('组    别', res.data.b)
                        recordset.val('入库产品信息.专属编号', res.data.b)
                    }
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shipmentsample_field_change, '出货样管理')

// 编辑界面数据加载以后执行
const shipmentsample_recordLoad = (evt_id, recordset) => {
    recordset.module.field_by_full_name('条 形 码').disabled = true;
    if (recordset.val('公司名称') == '') {
        recordset.do_action('根据产品编号调入产品');
    }

}
_.evts.on([_.evtids.RECORD_LOAD], shipmentsample_recordLoad, '出货样管理')

const shipmentsample_table_after_new = (evt_id, table, recordset) => {
    if (table.group == '入库产品信息') {
        if (recordset.val('产品编号') != '') recordset.val('入库产品信息.产品编号', recordset.val('产品编号'));
        if (recordset.val('条 形 码') != '') recordset.val('入库产品信息.条 形 码', recordset.val('条 形 码'));
    }
    if (table.group == '入库详情') {
        recordset.val('入库详情.唯一字段', recordset.val('入库详情.rid'));
    }
    if (table.group == '入库产品信息') {
        recordset.val('入库产品信息.唯一字段', recordset.val('入库产品信息.rid'));
    }
    if (table.group == '出库详情') {
        recordset.val('出库详情.唯一字段', recordset.val('出库详情.rid'));
    }
    if (table.group == '出库信息') {
        recordset.val('出库信息.唯一字段', recordset.val('出库信息.rid'));
    }
    if (table.group == '下架详情') {
        recordset.val('下架详情.唯一字段', recordset.val('下架详情.rid'));
    }
    if (table.group == '产品清单') {
        recordset.val('产品清单.唯一字段', recordset.val('产品清单.rid'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '出货样管理')
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '样品入库管理')
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '样品出库管理')
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '样品下架管理')
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '客户寄样')
// _.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], shipmentsample_table_after_new, '样品管理')

const shipmentsample_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'lxm_input_update_btn',
            "caption": '更换条码',
            "icon": 'any-keyborad',
        })

        form.toolbar.insert([{
            "name": 'export_btn',
            "caption": '扩展',
            "icon": '#ext-add_database',
            "btns": btns
        }], 'close');
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], shipmentsample_FormShow, '出货样管理')

const sample_BtnClick = (evt_id, btn, form) => {

    if (btn.name == 'sample_lxm_input_btn') {
        _.ui.show_dialog('barcode_form', {
            "rids": [form.current_rid]
        });
    }

    if (btn.name == 'lxm_input_update_btn') {
        _.http.post('/api/saier/shipmentsample/lxm/button/check', {
            cpfl: form.recordset.val('产品分类'),
            yjfl: form.recordset.val('一级分类'),
            ejfl: form.recordset.val('二级分类'),
            cgdj: form.recordset.val('采购单价')
        }).then(res => {
            if (res.code == 1) {
                _.ui._show_input_dialog('', _l('请输入条码，请注意更改后此货号所有条码同步更改慎用！', res.data)).then(val => {
                    if (val == undefined || val == '') {
                        _.ui.message.error(_l('条码不能为空'))
                        return
                    }
                    _.http.post('/api/saier/shipmentsample/lxm/button/update', {
                        "lxm": val,
                        "cpbh": form.recordset.val('产品编号')
                    }).then(res => {
                        if (res.code != 1) {
                            _.ui.message.error(res.msg)
                            return
                        } else {
                            form.recordset.val('条 形 码', res.data)
                        }
                    }).catch(res => {
                        console.log(res)
                        _.ui.message.error(_l(res.msg))
                    })
                })
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        });
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], sample_BtnClick, '出货样管理')

const sampleoutbound_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('操作时间详情') == '') {
            recordset.val('操作时间详情', new Date().format('yyyy-MM-dd HH:mm:ss'))
        }
        let flag = false
        let oTable = recordset.tables['出库详情']
        let view_data = oTable.view_data
        let i = 0
        for (row of view_data) {
            i = i + 1
            if (row['wyzd'] == '') {
                // row['wyzd'] = 'ck' + i + row['czr'] + row['lxm'] + new Date().format('yyyy-MM-dd HH:mm:ss')
                row['wyzd'] = row.rid
            }
            row['czry'] = recordset.val('领用人员')

            if (row['ypqx'] == '') {
                row['ypqx'] = recordset.val('样品去向')
            }
            if (row['bzh'] == '') {
                row['bzh'] = recordset.val('备    注')
            }
            oTable.push_modi_rid(row.rid)
            flag = true
        }
        if (flag) {
            oTable.sync_operate_data()
            oTable.modified = true
        }
        _.http.post("/api/saier/sampleoutbound/before/save", {
            ckxq: view_data
        }).then(res => {

        }).catch(res => {
            console.log(res);
            reject(res.msg);
        })


        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, sampleoutbound_before_save, '样品出库管理')

// 编辑界面数据加载以后执行
const sampleoutbound_recordLoad = (evt_id, recordset) => {
    if (recordset.job == 1) {
        if (recordset.tables['出库详情']) recordset.tables['出库详情']._.toolbar.show('delete', false);
        if (recordset.tables['下架详情']) recordset.tables['下架详情']._.toolbar.show('delete', false);
    }
}
_.evts.on([_.evtids.RECORD_LOAD], sampleoutbound_recordLoad, '样品出库管理')
_.evts.on([_.evtids.RECORD_LOAD], sampleoutbound_recordLoad, '样品下架管理')

const sampleremoval_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('操作时间详情') == '') {
            recordset.val('操作时间详情', new Date().format('yyyy-MM-dd HH:mm:ss'))
        }

        let oTable = recordset.tables['下架详情']
        let view_data = oTable.view_data

        _.http.post("/api/saier/sampleremoval/before/save", {
            xjxq: view_data
        }).then(res => {

        }).catch(res => {
            console.log(res);
            reject(res.msg);
        })


        resolve()
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, sampleremoval_before_save, '样品下架管理')

const sampleremoval_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '下架详情') {
        form.toolbar.add([{
            "name": 'sample_lxm_input_btn',
            "caption": '条码输入',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], sampleremoval_EditorChildShow, '样品下架管理')

// 编辑界面字段change后执行
const sampleremoval_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name

    if (field.full_name == n + '.下架详情.条 形 码') {
        if (recordset.val('下架详情.条 形 码') != '') {
            recordset.val('下架详情.操作人', _.user.username)
            recordset.val('下架详情.日    期', new Date().format('yyyy-MM-dd'))
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, sampleremoval_field_change, '样品下架管理')

const customersample_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let bm = ''
        recordset.val('修改人员', _.user.username)
        _.http.post("/api/saier/get/ywry/info", {
            yhm: recordset.val('经 手 人')
        }).then(res => {
            if (res.code == 1) {
                bm = res.data.bm
            }
            let flag = false
            let oTable = recordset.tables['产品清单']
            let view_data = oTable.view_data
            for (row of view_data) {
                if (row['jsr'] == '') {
                    row['jsr'] = recordset.val('经 手 人')
                    row['ywbm'] = bm
                    row['khmc'] = recordset.val('客户名称')
                }
                row['jsr1'] = recordset.val('经 手 人')
                if (row['jysj'] == '') {
                    row['jysj'] = recordset.val('寄样日期')
                }
                if (row['ydh'] == '') {
                    row['ydh'] = recordset.val('运 单 号')
                }
                if (row['sjr'] == '') {
                    row['sjr'] = recordset.val('收 件 人')
                }
                if (row['mygb'] == '') {
                    row['mygb'] = recordset.val('贸易国别')
                }
                if (row['ssdq'] == '') {
                    row['ssdq'] = recordset.val('所属地区')
                }
                row['hhbz'] = recordset.val('产品编号')
                oTable.push_modi_rid(row.rid)
                flag = true
            }
            if (flag) {
                oTable.sync_operate_data()
                oTable.modified = true
            }
            resolve()
        }).catch(res => {
            console.log(res);
            reject(res.msg);
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, customersample_before_save, '客户寄样')

// 编辑界面数据加载以后执行
const customersample_recordLoad = (evt_id, recordset) => {
    let wfgs = ''
    if (recordset.val('公司名称') != '') {
        return
    }
    _.http.post("/api/saier/get/ywry/info", {
        yhm: recordset.val('经 手 人')
    }).then(res => {
        if (res.code == 1) {
            wfgs = res.data.wfgs
            recordset.val('公司名称', wfgs)
        }
    }).catch(res => {
        console.log(res);
        reject(res.msg);
    })
}
_.evts.on([_.evtids.RECORD_LOAD], customersample_recordLoad, '客户寄样')

// 编辑界面字段change后执行
const customersample_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name

    if (field.full_name == n + '.运 单 号') {
        if (recordset.val('运 单 号') != '') {
            _.http.post('/api/saier/customersample/ydh/change', {
                ydh: recordset.val('运 单 号')
            }).then(res => {
                if (res.code != 1) {
                    _.ui.message.error(res.msg)
                    recordset.val('运 单 号', "")
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }

}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, customersample_field_change, '客户寄样')

// 编辑界面数据加载以后执行
const samplestock_recordLoad = (evt_id, recordset) => {
    let bm = ''
    _.http.post("/api/saier/get/ywry/info", {
        yhm: _.user.username
    }).then(res => {
        if (res.code == 1) {
            bm = res.data.bm
        }
    }).catch(res => {
        console.log(res);
        reject(res.msg);
    })
    recordset.val('所属部门', bm)
}
_.evts.on([_.evtids.RECORD_LOAD], samplestock_recordLoad, '库存产品')