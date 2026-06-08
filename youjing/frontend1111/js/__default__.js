// 深度拷贝
_deepClone = function (oData) {
    return _.lodash.cloneDeep(oData);
}

// 取数组中最大值，可以是json数组
function array_max(array, max_key) {
    var max_value = Math.max.apply(Math, list.map(function (max_data) {
        if (max_key == undefined) {
            return max_data;
        } else {
            return max_data[max_key];
        }
    }));
    return max_value;
}

// 取数组中最小值，可以是json数组
function array_min(array, min_key) {
    var min_value = Math.min.apply(Math, array.map(function (min_data) {
        if (min_key == undefined) {
            return min_data;
        } else {
            return min_data[min_key];
        }
    }));
    return min_value;
}

// 计算两个日期距离的天数
function _getDistanceDays(begin_date, end_date) {
    // begin_date例如:'2022-03-05',end_date例如:'2022-03-06'
    const begin_timeStamp = new Date(begin_date) - 0; // 指定时间转换为时间戳,例如返回:1646611200000
    const end_timeStamp = new Date(end_date) - 0; // 指定时间转换为时间戳,例如返回:1654905600000
    // 例如返回:'1'
    return (end_timeStamp - begin_timeStamp) / (24 * 60 * 60 * 1000)
}

// 计算日期指定天数后的日期
function _addDaysDate(begin_date, days) {
    // begin_date例如:'2022-03-05',end_date例如:'2022-03-06'
    const date = new Date(begin_date);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

/**
 * @Author: xuyin
 * @Description: 单元集_判断数组中值是否重复
 */
function Array_isRepeat(arr) {
    var hash = {};
    for (var i in arr) {
        if (hash[arr[i]]) //hash 哈希    
            return true;
        hash[arr[i]] = true;
    }
    return false;
}


/**
 * @Author: xuyin
 * @Description: 单元集_数组去重，如：dedupe([1,2,3,2,1,4])
 * @return {*}
 */
function dedupe(arr) {
    return Array.from(new Set(arr));
};


/**
 * @Description: 单元集_将数字转千分位，如：toDecimalMark(1234567890)
 * @return {*}
 */
function toDecimalMark(num) {
    return num.toLocaleString('en-US');
}


function round(num, point) {
    if (isNaN(num)) {
        return null;
    }
    if (Number(num) > 0) {
        point = point ? parseInt(point) : 0;
        if (point <= 0) return Math.round(num);
        num = Math.round(num * Math.pow(10, point)) / Math.pow(10, point);
        return num;
    } else {
        point = point ? parseInt(point) : 0;
        num = -num;
        if (point <= 0) return -Math.round(num);
        num = Math.round(num * Math.pow(10, point)) / Math.pow(10, point);
        return -num;
    }
}

// 校验自动数据中输入的参数字段是否存在，如果存在就返回数据库字段名
function check_module_field_exist(module_name, field_name) {
    if (_.model.get_module_by_name(module_name) == undefined) {
        return {
            "code": -1,
            "msg": "【" + module_name + "】模块名称不存在!"
        };
    }
    is_child_child_table = false
    if (field_name == "rid" || field_name.search(".rid") != -1) {
        let group_name = ""
        let table_name = ""
        if (field_name.search(".rid") != -1) {
            group_name = field_name.substr(0, field_name.length - 4);
        }
        if (group_name != "") {
            if (_.model.get_module_by_name(module_name).group_by_name(group_name) == undefined) {
                return {
                    "code": 0,
                    "msg": "【" + module_name + '.' + field_name + "】字段名称不存在!"
                };
            }
            table_name = _.model.get_module_by_name(module_name).group_by_name(group_name).table_name
            var module_field = _.model.get_module_by_name(module_name).group_by_name(group_name);
            is_child_child_table = module_field.is_child_child_table
        } else {
            table_name = _.model.get_module_by_name(module_name).table_name
        }
        return {
            "code": 1,
            "field_name": table_name + ".rid",
            "field_db_kind": 0,
            "field_db_name": "rid",
            "table_name": table_name,
            "is_table": true,
            "is_child_child_table": is_child_child_table,
            "group_name": group_name,
            "msg": "校验成功!"
        };
    }
    if (_.model.get_module_by_name(module_name).field_by_full_name(module_name + '.' + field_name) == undefined) {
        return {
            "code": 0,
            "msg": "【" + module_name + '.' + field_name + "】字段名称不存在!"
        };
    }
    var module_field = _.model.get_module_by_name(module_name).field_by_full_name(module_name + '.' + field_name);
    is_child_child_table = module_field.group.is_child_child_table
    return {
        "code": 1,
        "field_name": module_field.full_field_name,
        "field_db_kind": module_field.db.kind,
        "field_db_name": module_field.db.name,
        "table_name": module_field.table_name,
        "is_table": module_field.group.is_table,
        "is_child_child_table": is_child_child_table,
        "group_name": "",
        "msg": "校验成功!"
    };
}

// 根据自动数据传入的参数取出内容取检查目标模块是否存在符合条件的记录
function check_auto_module_data(t_module_name, s_module_name, field_list, message) {
    let t_field_list = []; //存放目标模块的条件字段
    let s_field_list = []; //存放源模块的select中的字段，做为查询目标模块记录是否存在的条件
    let s_table_list = []; //存放源模块的表名，可能会子表
    let where_list = []; //存放查询源模块记录对应字段内容的条件字段
    let group_list = []; //存放字段组名称
    if (JSON.stringify(message) != "{}") {
        if (message.key_field != undefined) {
            if (_.model.get_module_by_name(t_module_name).field_by_full_name(t_module_name + '.' + message.key_field) == undefined) {
                return {
                    "code": 0,
                    "msg": "【" + t_module_name + '.' + message.key_field + "】字段名称不存在!"
                };
            }
        }
        if (message.to_user != undefined) {
            if (_.model.get_module_by_name(t_module_name).field_by_full_name(t_module_name + '.' + message.to_user) == undefined) {
                return {
                    "code": 0,
                    "msg": "【" + t_module_name + '.' + message.to_user + "】字段名称不存在!"
                };
            }
        }
    }
    for (let field_json of field_list) {
        let s_field = "";
        let t_field = "";
        // 目标模块字段
        if (field_json.t_field) {
            t_field = field_json.t_field;
        }

        // 如果源字段为空则视为传入常量
        if (field_json.s_field == undefined) {
            if (field_json.t_value != undefined) {
                s_field = "";
            } else {
                s_field = t_field;
            }
        } else {
            s_field = field_json.s_field;
        }

        // 判断目标字段是否存在
        let check_return_t = check_module_field_exist(t_module_name, t_field);
        if (check_return_t.code != 1) {
            _.ui.set_process_dialog_position(100, 100);
            if (check_return_t.code == -1) {
                _.ui.message.error("【" + t_module_name + "】模块名称不存在!");
            } else {
                _.ui.message.error('字段【' + t_field + '】在模块【' + t_module_name + '】中不存在!');
            }
            return;
        }

        // 如果参数不存在t_value属性，则目标字段为条件字段，就把字段传入数组，做为查询目标模块记录是否存在的条件
        if (field_json.t_value == undefined) {
            let t_field_json = {};
            t_field_json[field_json.t_field] = _.model.get_module_by_name(t_module_name).field_by_full_name(t_module_name + '.' + t_field).db.name;
            t_field_list.push(t_field_json);
        }

        // 如果源字段为空则视为传入常量，否则先校验源字段是否存在，然后把源字段组织为SQL的查询字段
        if (s_field != "") {
            let check_return_s = check_module_field_exist(s_module_name, s_field);
            if (check_return_s.code == 0) {
                _.ui.set_process_dialog_position(100, 100);
                if (check_return_t.code == -1) {
                    _.ui.message.error("【" + s_module_name + "】模块名称不能存在!");
                } else {
                    _.ui.message.error('字段【' + s_field + '】在模块【' + s_module_name + '】中不存在');
                }
                return;
            }

            // 取出源字段对应的表名，可能存在源字段为子表的情况，只支持一个子表，不支持子子表
            let s_table_name = check_return_s.table_name;
            if (s_table_list.indexOf(s_table_name) < 0) {
                s_table_list.push(s_table_name);
            }

            // 把源字段是否为子表，子表则用pid做为查询条件
            if (check_return_s.is_table) {
                if (check_return_s.is_child_child_table) {
                    if (where_list.indexOf(s_table_name + '.mid') < 0) {
                        where_list.push(s_table_name + '.mid');
                    };
                } else {
                    if (where_list.indexOf(s_table_name + '.pid') < 0) {
                        where_list.push(s_table_name + '.pid');
                    };
                }
                if (s_field == "rid" || s_field.search(".rid") != -1) {
                    if (group_list.indexOf(check_return_s.group_name) < 0) {
                        group_list.push(check_return_s.group_name);
                    }
                } else {
                    if (group_list.indexOf(_.model.get_module_by_name(s_module_name).field_by_full_name(s_module_name + '.' + s_field).group.name) < 0) {
                        group_list.push(_.model.get_module_by_name(s_module_name).field_by_full_name(s_module_name + '.' + s_field).group.name);
                    }
                }
            } else {
                if (where_list.indexOf(s_table_name + '.rid') < 0) {
                    where_list.push(s_table_name + '.rid');
                };
                if (group_list.indexOf(s_module_name) < 0) {
                    group_list.push(s_module_name);
                };
            }
            s_field_list.push(check_return_s.field_name + ' ' + t_field);
        } else {
            s_field_list.push('"' + field_json.t_value + '" ' + t_field);
        }
    }

    if (s_table_list.length > 2) {
        return {
            "code": 0,
            "msg": "源字段对应的表名不能大于2个,当前设置了" + group_list.join(",") + "!"
        }
    } else {
        // 返回SQL查询需要的字段，表，和条件内容
        let json_list = {
            "s_table_list": s_table_list,
            "s_field_list": s_field_list,
            "where_list": where_list,
            "t_field_list": t_field_list
        }
        return {
            "code": 1,
            "msg": "校验字段名称成功!",
            "json_list": json_list
        }
    }
}

// 处理新增记录的方法
function append_single_record(t_module_name, data_json, fill_list, message, length, index) {
    let new_module = new _.Recordset(t_module_name);
    _.ui.show_process_dialog('正在生成' + t_module_name + '...');
    new_module.new().then(
        res => {
            // 对目标模块的关键字段赋值，同时处理对应的数据填充
            for (var key in data_json) {
                new_module.val(key, data_json[key]);
            }
            for (fill_name of fill_list) {
                new_module.do_action(fill_name);
            }
            if (t_module_name == '采购合同') {
                if (length == 1) {
                    new_module.val('采购合同', data_json['销售合同']);
                } else {
                    new_module.val('采购合同', data_json['销售合同'] + '-' + String(index));
                    console.log("data_json AAAA: ", data_json['销售合同'] + '-' + String(index))
                }
            }
            new_module.save(false).then(
                res => {
                    //_.ui.set_process_dialog_position(100, 100);
                    // _.ui.message.success('生成成功!');
                    // console.log('new_module success:', new_module);
                    // 保存成功打开对应的记录
                    if (JSON.stringify(message) != "{}") {
                        // console.log('11111111111111111111111: ');
                        let key_no = message['key_field'];
                        let to_user = message['to_user'];
                        if (key_no != undefined && to_user != undefined) {
                            message_to_user(t_module_name, new_module.val(key_no), new_module.val('rid'), new_module.val(to_user))
                        }
                    }
                    _.platform.open_record(t_module_name, new_module.rid);
                    // console.log('aaaaaaaaaaaaaaaa: ');
                }
            ).catch((e) => {
                _.ui.set_process_dialog_position(100, 100);
                _.ui.message.error('生成' + t_module_name + '保存数据出错!e' + e);
                console.log('e: ' + e);
                // console.log('new_module error a:', new_module);
            });
        }
    ).catch((e) => {
        _.ui.set_process_dialog_position(100, 100);
        _.ui.message.error('生成' + t_module_name + '加载数据出错!');
        // console.log('new_module error b:', new_module);
        console.log('e: ', e);
    });
}

// 执行自动数据的主体函数
/*
    t_module_name为目标模块的模块名称,比如销售合同生成出运计划，那么t_module_name为出运计划；
    form为源模块的信息,前面调用时传入form即可(销售合同模块的form对象);
    field_list为目标模块和源模块的字段集，是数组类型,例如
            销售合同生成出运计划，field_list的值为 [{
                    "t_field": "参考合同",//出运计划的参考合同字段
                    "s_field": "销售合同" //销售合同的销售合同字段，这里就是把销售合同的销售合同字段内容赋值给出运计划的参考合同
                }] ；
            采购计划生成采购合同，field_list 的值为 [{
                    "t_field": "采购计划",
                    "s_field": "采购计划" //因为t_field和s_field内容一样，则s_field可以省略，直接写{"t_field":"采购计划"}
                },{
                    "t_field": "厂商编码",
                    "s_field": "采购明细.厂商编码"
                }];
            出运明细生成报关单据，field_list 的值为 [{
                    "t_field": "发票号码"
                },{
                    "t_field":"数据来源",
                    "t_value":"销售合同" //定义了t_value值，这时t_field(数据来源)直接赋值为"销售合同"
                }]
    如果目标模块字段t_field和源模块字段名称s_field一样的话只需要设置目标模块字段即可
    如果目标模块的字段传入的是常量，则需要用t_value传入常量值
    如果传入了t_value,则目标字段不会做为查询目标模块记录是否存在的条件
*/
function do_module_auto_data(t_module_name, form, field_list, check_wf = true, message = {}, check_exist = true, fill_list = []) {
    // return new Promise((resolve, reject) => {
    if (field_list == undefined) {
        field_list = [];
    }
    //源模块名称
    let s_module_name = form.module.name;
    let s_module_rid = ''
    //源模块选中记录的rid
    if (form.is_search == true) {
        s_module_rid = form.current_rid.value;
    }
    if (form.is_editor == true) {
        s_module_rid = form.recordset.rid;
    }
    // 获取目标模块的数据库表名
    let t_table_name = _.model.get_module_by_name(t_module_name).table_name;
    // 返回SQL查询需要的字段，表，和条件内容的函数
    let check_auto_module_data_return = check_auto_module_data(t_module_name, s_module_name, field_list, message);
    if (check_auto_module_data_return.code == 0) {
        _.ui.message.error('生成' + t_module_name + '失败,' + check_auto_module_data_return.msg);
        return;
    }

    // 把目标模块的表名和源模块当前记录的rid传到python端
    let json_list = check_auto_module_data_return["json_list"]
    json_list["s_module_rid"] = s_module_rid;
    json_list["t_table_name"] = t_table_name;
    json_list['check_wf'] = check_wf
    if (check_exist == true) {
        json_list["check_exist"] = 1;
    } else {
        json_list["check_exist"] = 0;
    }

    // 通过python路由取出源字段对应的内容，查询目标模块是否有符合条件的记录存在
    _.http.post('/api/huahai/do_run_module_auto_data', {
            "json_list": json_list
        },
        true).then(res => {
        console.log(res);
        if (res.code == 1) {
            var data = res.data;
            var data_list = data.data_list;
            // python端返回源模块对应字段的内容，如果源字段为子表，则可能会有多条记录
            let i = 0;
            for (let data_json of data_list) {
                i = i + 1;
                append_single_record(t_module_name, data_json, fill_list, message, data_list.length, i);
            }
        } else {
            // if (s_module_name=='出运计划' && t_module_name=='出运明细'){
            //     _.ui.message.warning('生成' + t_module_name + '失败,' + res.msg);
            // } else {
            _.ui.set_process_dialog_position(100, 100);
            // _.ui.message.warning('生成' + t_module_name + '失败,' + res.msg);
            if (res.code == 0) {
                // _.ui.confirm('是否删除记录?', '删除确认').then((e) => {
                //     _.http.post('/api/zhaoli/delete/module/data', {
                //         "table_name": t_table_name,
                //         "t_module_name": t_module_name,
                //         "rid_list": res.data.t_query_data
                //     }).then((d) => {
                //         console.log(d);
                //         if (d.code == 1) {
                //             var data = res.data;
                //             var data_list = data.data_list;
                //             // python端返回源模块对应字段的内容，如果源字段为子表，则可能会有多条记录
                //             let i = 0;
                //             for (let data_json of data_list) {
                //                 i = i + 1;
                //                 append_single_record(t_module_name, data_json, fill_list, message, data_list.length, i);
                //             }
                //         }
                //     }).catch((d) => {
                //         _.ui.message.error('生成' + t_module_name + '失败,' + d.msg);
                //     })
                // }).catch((e) => {
                //     _.ui.message.warning('生成' + t_module_name + '失败,' + res.msg);
                //     setTimeout(function () {
                //         // 如果目标模块已存在记录，则打开对应记录，可能会有多条，所以第三个参数为rids数组
                //         _.platform.open_record(t_module_name, res.data.t_query_data[0], res.data.t_query_data);
                //     }, 200);
                // })
                _.ui.confirm(_l(t_module_name + '记录已存在，是否删除重新生成?'), _l('生成确认')).then((e) => {
                    _.http.post('/api/huahai/delete/module/data', {
                        "table_name": t_table_name,
                        "t_module_name": t_module_name,
                        "rid_list": res.data.t_query_data
                    }).then((d) => {
                        console.log(d);
                        if (d.code == 1) {
                            var data = res.data;
                            var data_list = data.data_list;
                            // python端返回源模块对应字段的内容，如果源字段为子表，则可能会有多条记录
                            let i = 0;
                            for (let data_json of data_list) {
                                i = i + 1;
                                append_single_record(t_module_name, data_json, fill_list, message, data_list.length, i);
                            }
                        }
                    }).catch((d) => {
                        _.ui.message.error('生成' + t_module_name + '失败,' + d.msg);
                    })
                }).catch((e) => {
                    // if (form.module.name=='客户询价'){
                    //     var data = res.data;
                    //     var data_list = data.data_list;
                    //     // python端返回源模块对应字段的内容，如果源字段为子表，则可能会有多条记录
                    //     let i = 0;
                    //     for (let data_json of data_list) {
                    //         i = i + 1;
                    //         append_single_record(t_module_name, data_json, fill_list, message, data_list.length, i);
                    //     }
                    // } else {
                    _.ui.message.warning(_l('生成') + _l(t_module_name) + _l('失败') + ',' + _l(res.msg));
                    setTimeout(function () {
                        // 如果目标模块已存在记录，则打开对应记录，可能会有多条，所以第三个参数为rids数组
                        _.platform.open_record(t_module_name, res.data.t_query_data[0], res.data.t_query_data);
                    }, 200);
                    // }
                })

            } else {
                _.ui.message.error(_l('生成') + _l(t_module_name) + _l('失败') + ',' + _l(res.msg));
            }
            //}
        }
    }).catch(res => {
        _.ui.message.warning(_l('生成') + _l(t_module_name) + _l('失败') + ',' + _l(res.msg));
    });
    // })
}

// function _module_editor_form_show(evt_id, form){
//     form.toolbar.show("delete", false);
// }
// _.evts.on([_.evtids.MODULE_EDITOR_SHOW,],_module_editor_form_show)

// 计算采购合计和退税合计
function _purchaser_total_rebates(recordset, child_name, isEXW, isBilledAmount) {
    if (isEXW == undefined) {
        isEXW = false;
    }
    if (isBilledAmount == undefined) {
        isBilledAmount = false;
    }
    var sTermOfPrice = recordset.val('价格条款');
    var sSettlement = '';
    //  recordset.val('结算类别');
    var fTotal = 0;
    var fTotalTaxRebate = 0;
    if (recordset == undefined || child_name == undefined) {
        return;
    }
    if (recordset.tables[child_name] == undefined) {
        return;
    }
    var child_data = recordset.tables[child_name].view_data;

    for (var child_row of child_data) {
        var fTaxRebate = 0;
        var fPurchAmount = 0;
        var ExportRebatesRate = 0;
        var PurchaseCurrency = '';
        var iVAT = 0;
        if (child_row.VAT) {
            iVAT = 100 + child_row.VAT;
        } else if (child_row.VAT) {
            iVAT = 100 + child_row.ZZSL;
        }
        if (recordset.module.name == '出运明细' && isBilledAmount == true) {
            if (child_row.BilledAmount) {
                fPurchAmount = child_row.BilledAmount;
            }
        } else {
            if (child_row.PurchaseAmount) {
                fPurchAmount = child_row.PurchaseAmount;
            }
        }
        if (child_row.PurchaseCurrency) {
            PurchaseCurrency = child_row.PurchaseCurrency;
        }
        var PurchExchangeRate = 1;
        if ((PurchaseCurrency == 'RMB' || PurchaseCurrency == 'CNY') && (sTermOfPrice != 'EXW' || (sTermOfPrice == 'EXW' && isEXW))) {
            if (sSettlement == '自营出口' || sSettlement == '') {
                if (child_row.ExportRebatesRate) {
                    ExportRebatesRate = child_row.ExportRebatesRate;
                }
                if (iVAT != 0) {
                    fTaxRebate = fPurchAmount * ExportRebatesRate / iVAT;
                } else {
                    fTaxRebate = 0;
                }
            }
        } else {
            if (child_row.PurchExchangeRate != undefined) {
                PurchExchangeRate = child_row.PurchExchangeRate;
            }
            fPurchAmount = round((fPurchAmount * PurchExchangeRate), 3);
        }
        fTotalTaxRebate = fTotalTaxRebate + fTaxRebate;
        fTotal = fTotal + fPurchAmount;
    }
    recordset.val('采购合计', Number(fTotal.toFixed(3)));
    recordset.val('退税总额', Number(fTotalTaxRebate.toFixed(3)));
};

// 计算货柜装量
function _get_container_data(recordset, rid_list, group_name) {
    if (group_name == undefined) {
        group_name = '产品资料';
    }
    var where_list = [];
    where_list.push({
        "container": "20尺柜"
    });
    where_list.push({
        "container": "40尺柜"
    });
    where_list.push({
        "container": "40尺高柜"
    });
    var data_list = recordset.tables[group_name].view_data;
    var module_name = recordset.module_name;
    // console.error("rid_list B:", rid_list);
    _.http.post('/api/huahai/do_item_get_container_data', {
            "where_list": where_list
        },
        true).then(res => {
        console.log(res);
        if (res.code == 1) {
            var query_data = res.query_data;
            for (var data_row of data_list) {
                if (rid_list.indexOf(data_row.rid) < 0) {
                    continue;
                }
                for (let data_json of query_data) {
                    var Volume = 0;
                    var container = data_json["Name"];
                    var OuterCapacity = _get_field_val(module_name, data_row, group_name + '.外箱装量');
                    var OuterVolume = _get_field_val(module_name, data_row, group_name + '.外箱体积');
                    if (OuterVolume != 0) {
                        Volume = Math.trunc(data_json["Volume"] / OuterVolume) * OuterCapacity;
                    }
                    if (container == '20尺柜') {
                        data_row["Container20"] = Volume;
                        //recordset.val(group_name + '.20#装量', Volume);
                    } else if (container == '40尺柜') {
                        data_row["Container40"] = Volume;
                        // recordset.val(group_name + '.40#装量', Volume);
                    } else if (container == '40尺高柜') {
                        data_row["Container40HQ"] = Volume;
                        // recordset.val(group_name + '.40HQ#装量', Volume);
                    }
                }
            }
        } else {
            _.ui.message.error('获取货柜数据失败,' + res.msg);
        }
    });
}

// 获取json数组里面字段对应的值
function _get_field_val(module_name, data_json, field_full_name) {
    var check_return = check_module_field_exist(module_name, field_full_name);
    if (check_return["code"] == 1) {
        var field_db_name = check_return["field_db_name"];
        var field_db_kind = check_return["field_db_kind"];
        if (data_json[field_db_name] == undefined) {
            if (field_db_kind == 1 || field_db_kind == 2 || field_db_kind == 6) {
                return 0
            } else if (field_db_kind == 3) {
                return null
            } else {
                return ""
            }
        } else {
            return data_json[field_db_name];
        }
    } else {
        return ""
    }
}

// 计算退税单价
function _GetRebates(Settlement, PHCurrency, ERRate, iVAT, PHPrice) {
    var fResult = 0;
    if (PHCurrency == 'RMB' || PHCurrency == 'CNY') {
        switch (Settlement) {
            case '自营出口':
                if (iVAT != 0) {
                    fResult = PHPrice * ERRate / iVAT;
                } else {
                    fResult = 0;
                }
                return fResult;
                break;
            case '代理出口':
                fResult = 0;
                return fResult;
        }
    } else {
        return fResult;
    }
};

// 计算一条记录的利润率或者销售单价
function _Formula_Price_Profit_Single(recordset, data_json) {
    var FobPrice = 0;
    var BuyoutPrice = 0;
    var AUnitFreight = 0;
    var fProfit = 0;
    var Rebates = 0;
    var module_name = recordset.module.name;
    var PriceModel = recordset.val('报价模式');
    var ExchangeRate = recordset.val('汇率');
    var Settlement = recordset.val('结算类别');
    var sTermOfPrice = recordset.val('价格条款');
    var StandardRate = recordset.val('基准汇率');
    if (TermOfPrice != "") {
        var TermOfPrice = sTermOfPrice.toUpperCase();
    } else {
        var TermOfPrice = "";
    }
    var Commission = recordset.val('佣金比率') / 100;
    var PlusInsurance = recordset.val('保险加成') * recordset.val('保险比率') / 10000;
    var ProfitRate = _get_field_val(module_name, data_json, '产品资料.利润率') / 100;
    var PurchPrice = _get_field_val(module_name, data_json, '产品资料.采购单价');
    var PurchCurrency = _get_field_val(module_name, data_json, '产品资料.采购币种');
    var PurchCurrencyRate = _get_field_val(module_name, data_json, '产品资料.采购汇率');
    var ExportRebatesRate = _get_field_val(module_name, data_json, '产品资料.退税率');
    var fSettlementRatio = _get_field_val(module_name, data_json, '产品资料.结汇比');
    var OuterCapacity = _get_field_val(module_name, data_json, '产品资料.外箱装量');
    var OuterVolume = _get_field_val(module_name, data_json, '产品资料.外箱体积');
    var CanBill = _get_field_val(module_name, data_json, '产品资料.是否开票');
    var VAT = _get_field_val(module_name, data_json, '产品资料.增值税率');
    var SalePrice = _get_field_val(module_name, data_json, '产品资料.销售单价');

    if (VAT == 0) {
        var iVAT = 113;
    } else {
        var iVAT = 100 + VAT;
    }
    if (OuterCapacity != 0 && ExchangeRate != 0) {
        AUnitFreight = (recordset.val('单位运费') * recordset.val('运费汇率') /
            ExchangeRate) * OuterVolume / OuterCapacity;
    }

    if (StandardRate > 0) {
        BuyoutPrice = ExchangeRate / StandardRate * fSettlementRatio;
    }
    Rebates = _GetRebates(Settlement, PurchCurrency, ExportRebatesRate, iVAT, PurchPrice);
    if (PriceModel == '直接销售价') {
        fProfit = 0;
        if (TermOfPrice == 'CNF' || TermOfPrice == 'C&F' || TermOfPrice == 'CPT') {
            FobPrice = Number(((SalePrice - AUnitFreight) * (1 - Commission)).toFixed(3));
        } else if (TermOfPrice == 'CIF' || TermOfPrice == 'CIP') {
            FobPrice = Number(((SalePrice - AUnitFreight) * (1 - PlusInsurance - Commission)).toFixed(3));
        } else {
            FobPrice = Number((SalePrice * (1 - Commission))).toFixed(3);
        }

        switch (PriceModel + '-' + Settlement) {
            case '直接销售价-自营出口':
                console.log('利润率 B： ', fProfit);
                console.log('TermOfPrice B： ', TermOfPrice);
                if (CanBill == true || CanBill == 1) {
                    if (PurchPrice * PurchCurrencyRate - Rebates != 0) {
                        fProfit = (FobPrice * ExchangeRate + Rebates - PurchPrice * PurchCurrencyRate) / (PurchPrice * PurchCurrencyRate - Rebates) * 100;
                    }
                    console.log('直接销售价-自营出口 开票 利润率 ', fProfit, FobPrice, ExchangeRate, Rebates, PurchPrice, PurchCurrencyRate);
                    data_json["ProfitRate"] = Number(fProfit.toFixed(2));
                } else {
                    if (PurchPrice * PurchCurrencyRate != 0) {
                        fProfit = (FobPrice * ExchangeRate - PurchPrice * PurchCurrencyRate) / (PurchPrice * PurchCurrencyRate) * 100;
                    }
                    console.log('直接销售价-自营出口 不开票 利润率 ', fProfit, FobPrice, ExchangeRate, Rebates, PurchPrice, PurchCurrencyRate);
                    data_json["ProfitRate"] = Number(fProfit.toFixed(2));
                }
                break;
            case '直接销售价-代理出口':
                if (PurchPrice * PurchCurrencyRate != 0) {
                    fProfit = (FobPrice * BuyoutPrice / (PurchPrice * PurchCurrencyRate) - 1) * 100;
                }
                // console.log('直接销售价-代理出口 利润率 ', fProfit);
                data_json["ProfitRate"] = Number(fProfit.toFixed(2));
        }
    } else {
        SalePrice = 0;
        switch (PriceModel + '-' + Settlement) {
            case '利润率算销售价-自营出口':
                //---若不开票，则采购单价为不含税价，反之。
                if (ExchangeRate != 0) {
                    if (CanBill == true || CanBill == 1) {
                        FobPrice = Number(((PurchPrice * PurchCurrencyRate - Rebates) / ExchangeRate * (1 + ProfitRate)).toFixed(2)); //FOB价格=(采购单价*采购币种汇率-退税)/销售币种汇率*（1+利润率/100）   
                    } else {
                        FobPrice = Number((PurchPrice * PurchCurrencyRate / ExchangeRate * (1 + ProfitRate)).toFixed(2));
                    }
                }
                if (TermOfPrice == 'CNF' || TermOfPrice == 'C&F' || TermOfPrice == 'CPT') {
                    if ((1 - Commission) != 0) {
                        SalePrice = FobPrice / (1 - Commission) + AUnitFreight; //销售单价=FOB价格+FOB价格*佣金比率/100+单位运费
                    }
                } else if (TermOfPrice == 'CIF' || TermOfPrice == 'CIP') {
                    if ((1 - PlusInsurance - Commission) != 0) {
                        SalePrice = FobPrice / (1 - PlusInsurance - Commission) + AUnitFreight; //销售价格=FOB价格+FOB价格*保险加成*保险比率/10000+FOB价格*佣金比率/100+单位运费
                    }
                } else {
                    if ((1 - Commission) != 0) {
                        SalePrice = FobPrice / (1 - Commission);
                    }
                }
                console.log('利润率算销售价-自营出口 销售单价 ', SalePrice, FobPrice, PlusInsurance, Commission, AUnitFreight, ExchangeRate, Rebates, PurchPrice, PurchCurrencyRate);
                data_json["SalesPrice"] = Number(SalePrice.toFixed(3)); //销售单价=FOB价格+FOB价格*佣金比率/100
                break;
            case '利润率算销售价-代理出口':
                if (BuyoutPrice != 0) {
                    FobPrice = PurchPrice * PurchCurrencyRate / BuyoutPrice * (1 + ProfitRate);
                    if (TermOfPrice == 'CNF' || TermOfPrice == 'C&F' || TermOfPrice == 'CPT') {
                        if ((1 - Commission) != 0) {
                            SalePrice = FobPrice / (1 - Commission) + AUnitFreight;
                        }
                    } else if (TermOfPrice == 'CIF' || TermOfPrice == 'CIP') {
                        if ((1 - PlusInsurance - Commission) != 0) {
                            SalePrice = FobPrice / (1 - PlusInsurance - Commission) + AUnitFreight;
                        }
                    } else {
                        if ((1 - Commission) != 0) {
                            SalePrice = FobPrice / (1 - Commission);
                        }
                    }
                    // console.log('利润率算销售价-代理出口 销售单价 ', SalePrice);
                }
                console.log('利润率算销售价-代理出口 销售单价 ', SalePrice, FobPrice, PlusInsurance, Commission, AUnitFreight, ExchangeRate, Rebates, PurchPrice, PurchCurrencyRate);
                data_json["SalesPrice"] = Number(SalePrice.toFixed(3));
        }
    }
};

// 计算数组所有记录的利润率或销售单价
function _Formula_Price_Profit_All(recordset, data_fill_modi_rids) {
    var data_list = recordset.tables['产品资料'].view_data;
    if (data_fill_modi_rids.length) {
        for (data_row of data_list) {
            _Formula_Price_Profit_Single(recordset, data_row);
        };
    } else {
        for (data_row of data_list) {
            if (data_fill_modi_rids.indexOf(data_row.rid) < 0) {
                continue;
            }
            _Formula_Price_Profit_Single(recordset, data_row);
        };
    }
};

// 计算销售单价或利润率
function _module_Formula(recordset, s_type, data_fill_modi_rids) {
    //AType:= 'S' 计算当前记录单价或利润率
    //AType:= 'A' 计算全部记录单价或利润率
    if (data_fill_modi_rids == undefined) {
        data_fill_modi_rids = [];
    }
    var index = recordset.tables["产品资料"]._cursor;
    var data_row = recordset.tables["产品资料"].view_data[index];
    switch (s_type) {
        case 'S':
            _Formula_Price_Profit_Single(recordset, data_row);
            break;
        case 'A':
            _Formula_Price_Profit_All(recordset, data_fill_modi_rids);
    }
};

function append_module_data_check(t_table_name, t_where_list) {
    return _.http.post('/api/qiwu/do_check_module_data_exists', {
        "t_table_name": t_table_name,
        "t_where_list": t_where_list
    });
}


// 处理新增记录的方法
function append_module_data_callback(s_form, data_json) {
    var t_module_name = "";
    t_module_name = data_json["t_module_name"];
    var s_set_fields = data_json["s_set_fields"];
    var t_where_fields = [];
    if (data_json["t_where_fields"]) {
        var t_where_fields = data_json["t_where_fields"];
    }
    var main_data = data_json["main_data"];
    var t_where_list = [];
    for (var field_row of s_set_fields) {
        var s_field = field_row.t_field;
        if (field_row.s_field != undefined) {
            s_field = field_row.s_field;
        }
        check_return = check_module_field_exist(t_module_name, field_row.t_field);
        if (check_return["code"] != 1) {
            _.ui.set_process_dialog_position(100, 100);
            _.ui.message.error('生成' + t_module_name + '时,字段检验失败,' + check_return["msg"]);
            return;
        }

        if (field_row.t_value == undefined) {
            check_return = check_module_field_exist(s_form.recordset.module_name, s_field);
            if (check_return["code"] != 1) {
                _.ui.set_process_dialog_position(100, 100);
                _.ui.message.error('生成' + t_module_name + '时,字段检验失败,' + check_return["msg"]);
                return;
            }
        }
    }

    for (var field_row of t_where_fields) {
        var s_field = field_row.t_field;
        var t_where_field = "";
        if (field_row.s_field != undefined) {
            s_field = field_row.s_field;
        }
        check_return = check_module_field_exist(t_module_name, field_row.t_field);
        if (check_return["code"] != 1) {
            _.ui.set_process_dialog_position(100, 100);
            _.ui.message.error('生成' + t_module_name + '时,字段检验失败,' + check_return["msg"]);
            return;
        }
        t_where_field = check_return["field_db_name"];

        check_return = check_module_field_exist(s_form.recordset.module_name, s_field);
        if (check_return["code"] != 1) {
            _.ui.set_process_dialog_position(100, 100);
            _.ui.message.error('生成' + t_module_name + '时,字段检验失败,' + check_return["msg"]);
            return;
        }
        t_where_list.push(t_where_field + '="' + s_form.recordset.val(s_field) + '"')
    }
    var t_table_name = _.model.get_module_by_name(t_module_name).table_name;

    append_module_data_check(t_table_name, t_where_list).then(res => {
        console.log(res);
        if (res.code == 1) {
            if (res.t_query_rid == "") {
                let new_module = new _.Recordset(t_module_name);
                _.ui.show_process_dialog('正在生成' + t_module_name + '...');
                new_module.new().then(
                    new_res => {
                        new_module.tables[t_module_name].append(main_data);
                        if (data_json["group_data"] != undefined) {
                            group_data = data_json["group_data"];
                            var group_name = group_data["name"];
                            var data_list = group_data["data_list"];
                            if (new_module.tables[group_name]) {
                                for (var data_row of data_list) {
                                    new_module.tables[group_name].append(data_row);
                                }
                            }
                        }
                        new_module.save(false).then(
                            save_res => {
                                for (var field_row of s_set_fields) {
                                    if (new_module.val(field_row.t_field) != undefined) {
                                        s_form.recordset.val(field_row.s_field, new_module.val(field_row.t_field));
                                        s_form.recordset.tables[s_form.recordset.module_name].modified = true;
                                    }
                                }
                                _.ui.message.success('生成成功!');
                                _.ui.set_process_dialog_position(100, 100);
                                // _.platform.open_record(t_module_name, new_module.rid);
                            }
                        ).catch((f) => {
                            _.ui.set_process_dialog_position(100, 100);
                            _.ui.message.error('生成' + t_module_name + '保存数据出错!');
                            console.log('生成' + t_module_name + '保存数据出错!', f);
                        });
                    }
                ).catch((e) => {
                    _.ui.set_process_dialog_position(100, 100);
                    _.ui.message.error('生成' + t_module_name + '加载数据出错!');
                    console.log('生成' + t_module_name + '加载数据出错:', e);
                });
            } else {
                _.ui.message.error(res.msg);
            }
        } else {
            _.ui.message.error(res.msg);
        }
    });
}

/**
 * @Author: xuyin
 * @Description: 修改记录状态（只修改界面值，数据库值通过路由后端更新）
 */
function Status(form, sStatusKeyName, sStatusKeyFieldName, sStatusValue) {
    let sModuleName = form.module.name;
    let sModuleTableName = form.module.table_name;
    if (form.is_editor) {
        form.recordset.tables[sModuleName].view_data[sStatusKeyFieldName] = sStatusValue
    } else {
        // 查询界面现在不能修改值 2022-07-01
    }
}

/**
 * @Author: xuyin
 * @Description: 登录后
 */
// const evt_DESKTOP_SHOW = (obj) => {
//     console.log('登录成功！');
//     window.jy = {}; //设定window.jy为全局变量

//     _.http.get('/api/qiwu/select/basedata/default', {}).then((res) => {
//         if (res.code == 100) {
//             // 用户列表
//             window.jy["aAllUserList"] = res["data"]["aAllUserList"];
//             // 业务字典-货币代码_汇率
//             window.jy["oDic_Currency_Rate"] = res["data"]["oDic_Currency_Rate"];
//             // 业务字典-计量单位_英文单复数
//             window.jy["oDic_Unit_Singular_Plural"] = res["data"]["oDic_Unit_Singular_Plural"];
//             // 业务字典-包装方式
//             window.jy["oDic_Package"] = res["data"]["oDic_Package"];
//             // 默认公司信息
//             window.jy["oDefaultCompanyInfo"] = res["data"]["oDefaultCompanyInfo"];
//             // 当前登录者的员工档案信息
//             window.jy["oCurrentUser"] = res["data"]["oCurrentUser"];
//         }
//     })
// }
// _.evts.on([_.evtids.DESKTOP_SHOW], evt_DESKTOP_SHOW)


/**
 * @Author: xuyin
 * @Description: 子表按钮隐藏
 */
function _table_button_hide(obj, hideButtons) {
    /**
    hideButtons = {
        "采购明细": ["new"],
        "使用订单库存": ["new", "copy"],
        "包材采购": ["new"]
    }
    */
    let tableName = obj.group.value.name;
    if (tableName in hideButtons) {
        let ArrayButtonName = hideButtons[tableName];
        for (let i = 0; i < ArrayButtonName.length; i++) {
            let sButtonName = ArrayButtonName[i];
            // 子表按钮隐藏
            obj.toolbar.show(sButtonName, false);
        }
    }
}



//<------------------------单元集_cxTermOfPrice------------------------>
function _TermOfPrice(recordset, clear_flag) {
    //---FCA、CPT、CIP对应于FOB、CFR、CIP，报价算法一致，仅仅因为FCA等不限于海运，运输范围更广。
    //---FAS为船边交货，已停用
    //---DDP为税后交货，即卖方需支付完买方的进口关税及运费后交到指定目的地，无固定计算公式。
    if (clear_flag == undefined) {
        clear_flag = false;
    }
    var sTermOfPrice = (recordset.val('价格条款')).toUpperCase();

    if (recordset.module.field_by_full_name('单位运费')) {
        if (sTermOfPrice.indexOf('CNF') >= 0 || sTermOfPrice.indexOf('CFR') >= 0 || sTermOfPrice.indexOf('CIF') >= 0 || sTermOfPrice.indexOf('CPT') >= 0 || sTermOfPrice.indexOf('CIP') >= 0) {
            recordset.module.field_by_full_name('单位运费').show();
        } else {
            recordset.module.field_by_full_name('单位运费').hide();
            if (clear_flag == true) {
                recordset.val('单位运费', 0);
            }
        }
    }

    if (recordset.module.field_by_full_name('保险加成') && recordset.module.field_by_full_name('保险比率')) {
        if (sTermOfPrice.indexOf('CIF') >= 0 || sTermOfPrice.indexOf('CIP') >= 0) {
            recordset.module.field_by_full_name('保险加成').show();
            recordset.module.field_by_full_name('保险比率').show();
            if (clear_flag == true) {
                recordset.val('保险加成', 110);
                recordset.val('保险比率', 0.5);
            }
        } else {
            recordset.module.field_by_full_name('保险加成').hide();
            recordset.module.field_by_full_name('保险比率').hide();
            if (clear_flag == true) {
                recordset.val('保险加成', 0);
                recordset.val('保险比率', 0);
            }
        }
    }
};


function _fn_union_unit(fQty, sUnitCode, left_right) {
    var sResult;
    if (sUnitCode != '无单位') {
        if (left_right == 'L' || left_right == '') {
            sResult = fQty + sUnitCode;
        } else {
            sResult = sUnitCode + fQty;
        }
    } else {
        sResult = fQty;
    }
    return sResult;
};

function _qty_unit_sum(recordset, group_name, field_list) {
    let total_json = {};
    for (let field_row of field_list) {
        qty = field_row["qty_field"];
        unit = field_row["unit_field"];
        total = field_row["total_field"];
        if (field_row.hasOwnProperty("left_right")) {
            left_right = field_row["left_right"];
        } else {
            left_right = "L";
        }
        if (field_row.hasOwnProperty("need_mix")) {
            need_mix = field_row["need_mix"];
        } else {
            need_mix = true;
        }

        var full_name_total = recordset.module.name + '.' + total;
        if (!full_name_total) {
            return false;
        }

        var full_name_qty = recordset.module.name + '.' + group_name + '.' + qty;
        if (!full_name_qty) {
            return false;
        }
        let field_name_qty = recordset.module.field_by_full_name(full_name_qty).db.name;

        var full_name_unit = recordset.module.name + '.' + group_name + '.' + unit;
        if (!full_name_unit) {
            return false;
        }
        let field_name_unit = recordset.module.field_by_full_name(full_name_unit).db.name;

        total_json[total] = {
            "qty": field_name_qty,
            "unit": field_name_unit
        };
    }
    var data_list = recordset.tables[group_name].view_data;

    if (need_mix) {
        for (var data_row of data_list) {
            for (var total_key in total_json) {
                let field_name_unit = total_json[total_key]["unit"];
                let field_name_qty = total_json[total_key]["qty"];
                var unit_str = data_row[field_name_unit] ? data_row[field_name_unit] : '无单位'
                if (!total_json[total_key].hasOwnProperty(unit_str)) {
                    total_json[total_key][unit_str] = data_row[field_name_qty];
                } else {
                    total_json[total_key][unit_str] = Number(total_json[total_key][unit_str]) + Number(data_row[field_name_qty]);
                }
            }
        }
        for (let total_key in total_json) {
            unit_json = total_json[total_key]
            let fTotalQty = ''
            for (var unit_key in unit_json) {
                if (unit_key != 'unit' && unit_key != 'qty') {
                    fTotalQty = fTotalQty + _fn_union_unit(unit_json[unit_key], unit_key, left_right) + ';';
                }
            }
            if (fTotalQty.length > 0) {
                fTotalQty = fTotalQty.substr(0, fTotalQty.length - 1);
            }
            recordset.val(total_key, fTotalQty);
        }
    } else {
        for (var data_row of data_list) {
            for (var total_key in total_json) {
                let field_name_qty = total_json[total_key]["qty"];
                if (total_json[total_key]["total_qty"]) {
                    total_json[total_key]["total_qty"] = Number(Number(total_json[total_key]["total_qty"]) + Number(data_row[field_name_qty])).toFixed(2);
                } else {
                    total_json[total_key]["total_qty"] = Number(data_row[field_name_qty]).toFixed(2);
                }
            }
        }
        for (let total_key in total_json) {
            recordset.val(total_key, total_json[total_key]["total_qty"]);
        }
    }
};

function get_array_filter_data(array_name, key_field, key_val_str) {
    var filter_data = array_name.filter(item => item[key_field] == key_val_str);
    return filter_data;
}

function union_field_val(recordset, t_group, s_table, field_list = [], split = ';') {
    if (field_list.length == 0) {
        let fields = recordset.module.group_by_name(t_group).fields;
        for (let i = 0; i <= fields.length - 1; i++) {
            let fn = fields[i].name;
            if (fn != '合同数量' && fn != '采购单价') {
                field_list.push({
                    "t_field": fn
                })
            }
        }
    }
    // if (split==undefined){
    //     split = ';'
    // }
    // if (field_list==undefined){
    //     field_list = []
    // }
    for (let i = 0; i <= field_list.length - 1; i++) {
        let t_fn = '',
            s_fn = '';
        if (field_list[i].t_field) {
            t_fn = field_list[i].t_field;
            s_fn = t_fn;
        }
        if (field_list[i].s_field) {
            s_fn = field_list[i].s_field;
        }
        if (!recordset.module.field_by_full_name(t_fn) || !recordset.module.field_by_full_name(s_table + '.' + s_fn)) {
            continue;
        }
        let list = recordset.tables[s_table].column_value(s_table + '.' + s_fn); //取表格某列所有行的值
        recordset.val(t_fn, [...new Set(list)].join(split)); //数组去除重复转换成字符再赋值
    }
}

function all_module_BeforeSave(evt_id, recordset) {
    return new Promise((resolve, reject) => {
        let module = recordset.module.name
        _.http.post('/api/saier/get/module/field/key', {
            module: module,
            kind: '必填'
        }).then(res => {
            if (res.data == "") {
                resolve()
                return
            }
            let field = res.data
            if (!recordset.module.field_by_full_name(module + '.' + field)) {
                resolve()
                return
            }
            let value = recordset.val(field)
            _.http.post('/api/saier/get/module/field/check_attr', {
                module: module,
                field: field,
                value: value
            }).then(res => {
                if (res.code != 1) {
                    resolve()
                    return
                }
                for (let key in res.data) {
                    let table = res.data[key]
                    if (table.is_table == 1) {
                        group_name = key
                        let data = recordset.tables[group_name].all_data
                        if (data.length == 0) {
                            continue
                        }
                        let i = 0
                        for (let row of data) {
                            i += 1
                            for (let field of table.fields) {
                                if (field.sjlx == '整型' || field.sjlx == '浮点型') {
                                    if (row[field.name] == 0 || row[field.name] == undefined) {
                                        reject('【' + field.group + '】第行' + String(i) + '记录【' + field.caption + '】不能为0!')
                                        return
                                    }
                                } else {
                                    if (row[field.name] == '' || row[field.name] == undefined) {
                                        reject('【' + field.group + '】第行' + String(i) + '记录【' + field.caption + '】不能为空!')
                                        return
                                    }
                                }
                            }
                        }
                    } else {
                        group_name = recordset.module.name
                        let data = recordset.tables[group_name].view_data
                        for (let field of table.fields) {
                            if (field.sjlx == '整型' || field.sjlx == '浮点型') {
                                if (data[field.name] == 0 || data[field.name] == undefined) {
                                    reject('【' + field.group + '.' + field.caption + '】不能为0!')
                                    return
                                }
                            } else {
                                if (data[field.name] == '' || data[field.name] == undefined) {
                                    reject('【' + field.group + '.' + field.caption + '】不能为空!')
                                    return
                                }
                            }
                        }
                    }
                }
                resolve()
            }).catch(res => {
                _.ui.message.error(res.msg)
                console.log(res)
                resolve()
            })
        }).catch(r => {
            _.ui.message.error(r.msg)
            console.log(r)
            resolve()
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, all_module_BeforeSave)

const _module_record_load = (evt_id, recordset) => {
    let module = recordset.module.name
    _.http.post('/api/saier/get/module/field/key', {
        module: module,
        kind: '显示'
    }).then(res => {
        if (res.data == "") {
            return
        }
        let m = _.model.get_module(module)
        for (let g of m.groups) {
            if (g.visible) {
                recordset.module.group_by_name(g.name).visible = true
            }
            for (let f of g.fields) {
                if (f.view.show_in_edit) {
                    recordset.module.field_by_full_name(f.full_name).show()
                } else {
                    recordset.module.field_by_full_name(f.full_name).hide()
                }
            }
        }
        let field = res.data
        if (!recordset.module.field_by_full_name(module + '.' + field)) {
            return
        }
        let value = recordset.val(field)
        _.http.post('/api/saier/get/module/field/view_attr', {
            module: module,
            field: field,
            value: value
        }).then(r => {
            for (let row of r.data) {
                if (row.qzdz == 1) {
                    if (recordset.module.group_by_name(row.zdzm)) {
                        if (row.szlx == '只读') {
                            recordset.module.group_by_name(row.zdzm).readonly = true
                        } else {
                            recordset.module.group_by_name(row.zdzm).hide()
                        }
                    }
                } else {
                    if (recordset.module.field_by_full_name(row.zdqm)) {
                        if (row.szlx == '只读') {
                            recordset.module.field_by_full_name(row.zdqm).readonly = true
                        } else {
                            recordset.module.field_by_full_name(row.zdqm).hide()
                        }
                    }
                }
            }
            recordset.refresh_ui()
        }).catch(r => {
            _.ui.message.error(r.msg)
            console.log(r)
        })
    })
}
_.evts.on([_.evtids.RECORD_LOAD], _module_record_load)


const workflow_before_start = (evt_id, form) => {
    return new Promise((resolve, reject) => {
        let module_list = ['工厂拜访','采购报价', '客户报价', '外销合同', '出运计划','放单申请']
        if (module_list.indexOf(form.module.name) == -1) {
            resolve()
            return
        }
        _.http.post('/api/saier/workflow/start/check', {
            module: form.module.name,
            rid: form.current_rid.value
        }).then(res => {
            resolve()
        }).catch(res => {
            console.error(res.msg);
            reject(res.msg)
        })
    })
}
_.evts.on(_.evtids.WORKFLOW_BEFORE_START, workflow_before_start)


const module_workflow_before_cancel = (evt_id, module, rid) => {
    return new Promise((resolve, reject) => {
        let modules = ['采购报价', '客户报价', '外销合同', '采购计划', '采购合同','出运计划','放单申请']
        if (modules.indexOf(module) == -1) {
            resolve()
            return
        }
        _.http.post("/api/saier/workflow/cancel/after", {
            rid: rid,
            module: module
        }).then(res => {
            console.log(res)
            resolve()
        }).catch(res => {
            _.ui.message.error(res.msg)
            console.log(res)
            reject()
        })
    })
}
_.evts.on(_.evtids.WORKFLOW_BEFORE_CANCEL, module_workflow_before_cancel)


const module_audit_before_flow = (evt_id, data, status) => {
    return new Promise((resolve, reject) => {
        let module = data.module
        let rid = data.record_id
        let unit = data.unit
        let instance_id = data.instance_id
        let task_id = data.task_id
        if (status == 2) {
            return resolve()
        }
        console.log('module_audit_before_flow--data--', data)
        console.log('module_audit_before_flow--', module, rid, unit)
        // let m = ['出运计划','工厂拜访', '放单申请', '工厂审批']
        // if (m.indexOf(module) == -1) {
        //     console.log('出运计划--flow--check--')
        //     resolve()
        //     return
        // }
        // console.log('出运计划--flow--check--')
        _.http.post('/api/saier/workflow/flow/out/check', {
            rid: rid,
            instance_id: instance_id,
            module: module,
            status: status,
            task_id: task_id,
            unit: unit
        }).then(r => {
            resolve()
            return
        }).catch(r => {
            console.log(r);
            reject(r.msg)
            return
        })
    })
}
_.evts.on(_.evtids.WORKFLOW_BEFORE_FLOW, module_audit_before_flow)

// 上传文件的对话框
// _.ui.show_upload_dialog({
//     title:'导入工作流',
//     url:'/api/workflow/define/import',
//     accept:'.workflow'
// },(res)=>console.log(res))

// 工作流发消息给用户，提醒用户跟进

// _.message.message_to_user_id(user_id: string, data, kind = consts.msg.MSG_KIND_NORMAL)

// data = {
//     'task_id': self.task_id,
//     'instance_id': self.rid,
//     'module': self.module,
//     'record_id': self.record_id,
//     'user_id': self.user_id,
//     'msg': self.msg,
//     'kind': self.kind,
//     'task_status': self.task_status,
//     'unit': self.unit,
//     'sender': self.sender,
//     'status': self.status,
//     'params': self.params,
//     'notify_status': self.notify_status
// }

// kind = {
//     MSG_KIND_MESSAGE: 2,
//     MSG_KIND_NORMAL: 1,
//     MSG_KIND_NOTIFY: 3,
//     MSG_KIND_PROGRESS: 4,
//     MSG_KIND_REPORT: 5,
//     MSG_KIND_WORKFLOW: 6,
//     MSG_PUB: 3,
//     MSG_SUBSCRIBE: 1,
//     MSG_TO_USER: 4,
//     MSG_UNSUBSCRIBE: 2
// }

// 界面弹框
// _.ui.show_info_notice({
//     msg: '通知测试',
//     type: "info",
//     btns: [{
//         title: '测试',
//         name: 'test_btn1',
//         icon: 'any-reset',
//         color: '#F56C6C'
//     }],
//     duration: 2000 //消息框弹出时间
// })
// // 给用户发信息，可以带按钮
// _.message.message_to_user('admin', {
//     msg: '发信息测试',
//     type: "info",
//     btns: [{
//         title: '测试',
//         name: 'test_btn2',
//         icon: 'any-reset',
//         color: '#F56C6C'
//     }]
// }, _.consts.msg.MSG_KIND_NOTICE_NORMAL)
// // 给用户发信息，打开模块记录
// function message_to_user(module_name, key_no, rid, username, rids = [rid]) {
//     // if (username == '') {
//     //     _.http.post('/api/huahai/do_get_user_data', {
//     //         'rid': rid,
//     //         'module_name': module_name
//     //     }).then(res => {
//     //         let user_data = res.data;
//     //         if (user_data.length > 0) {
//     //             _.message.message_to_user(user_data, {
//     //                 type: 'warning',
//     //                 title: '新任务通知',
//     //                 msg: '你有新的' + module_name + '【' + key_no + '】待处理!',
//     //                 module: module_name,
//     //                 rid: rid,
//     //                 rids: rids,
//     //                 color: '#F56C6C',
//     //                 position: 'top-right'
//     //             }, _.consts.msg.MSG_KIND_NOTICE_RECORD)
//     //         }
//     //     });
//     // } else {
//     _.message.message_to_user(username, {
//         type: 'warning',
//         title: '新任务通知',
//         msg: '你有新的' + module_name + '【' + key_no + '】待处理!',
//         module: module_name,
//         rid: rid,
//         rids: rids,
//         color: '#F56C6C',
//         position: 'top-right',
//         duration:5000
//     }, _.consts.msg.MSG_KIND_NOTICE_RECORD)
//     // }
// }
// // 弹窗打开模块记录
// _.ui.show_record_notice({
//     msg: '销售合同新记录生成通知',
//     module: '销售合同',
//     rid: '',//form.current_rid,
//     rids: [],//[form.current_rid],
//     color: '#F56C6C'
// })
// //通知界面中的按钮接挂点
// const notice_btn = (evt_id, btn) => {
//     if (btn.name == 'test_btn2'){
//         _.ui.message.success(item);
//     }
// }
// _.evts.on(_.evtids.NOTICE_BTN_CLICK, notice_btn)