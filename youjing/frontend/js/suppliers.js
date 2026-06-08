// const suppliers_qz_field_change = (evt_id, opts) => {
//     let {
//         recordset,
//         module,
//         field,
//         value,
//         old_value
//     } = opts;
//     let n = module.name
//     if (field.full_name == n + '.拜访日期') {
//         if (recordset.val('拜访日期') == '' && recordset.val('拜访日期') == null) {
//             recordset.val('拜访人员', _.user.username)
//         }
//     }
//     if (field.full_name == n + '.厂商简称') {
//         if (recordset.val('厂商简称') == '') {
//             recordset.val('厂商简称', recordset.val('厂商名称'))
//         }
//     }
//     if (field.full_name == n + '.认证人员') {
//         recordset.val('认证人员1', recordset.val('认证人员'))
//         if (recordset.val('认证人员') != '') {
//             recordset.val('是否确认', '否')
//         }
//     }
//     if (field.full_name == n + '.联系人查看') {
//         recordset.val('认证人员1', recordset.val('认证人员'))
//         if (recordset.val('联系人查看') == '是') {
//             recordset.module.group_by_name('联系人表').show()
//         } else {
//             recordset.module.group_by_name('联系人表').hide()
//         }
//     }
//     if (field.full_name == n + '.额外分值') {
//         let r = recordset.val('额外分值')
//         if (r != 0) {
//             _.http.post('/api/saier/suppliers/get/rate').then(res => {
//                 let q = recordset.val('综合评分')
//                 if (res.data == 1) {
//                     if (recordset.val('额外分值') > 0) {
//                         if (recordset.val('工厂属性') == '一般纳税人') {
//                             recordset.val('额外分值', 0)
//                         }
//                     } else {
//                         if (recordset.val('额外分值') < -10) {
//                             recordset.val('额外分值', -10)
//                         }
//                     }
//                 }
//                 if (q + recordset.val('额外分值') > 100) {
//                     recordset.val('综合评分', 100)
//                 } else {
//                     recordset.val('综合评分', q + recordset.val('额外分值'))
//                 }
//             }).catch(res => {
//                 console.log(res)
//                 _.ui.message.error(res.msg)
//             })
//         }
//     }

//     if (field.full_name == n + '.货 源 地') {
//         let v = recordset.val('货 源 地')
//         if (v == '') return
//         if (v.indexOf('其他') != -1 || v.indexOf('其它') != -1) {
//             _.ui.message.error('请注意货源地中不能包含其他或其它')
//             recordset.val('货 源 地', '')
//             return
//         }
//         _.http.post('/api/saier/suppliers/hyd/change', {
//             hyd: v,
//             kpgc: recordset.val('厂商名称'),
//             cs_id: recordset.val('厂商编号')
//         }).then(res => {

//         }).catch(res => {
//             console.log(res)
//             _.ui.message.error(res.msg)
//         })
//     }

//     if (field.full_name == n + '.开票工厂') {
//         let r = recordset.val('开票工厂')
//         if (r != "") {
//             _.http.post('/api/saier/suppliers/kpgc/change', {
//                 kpgc: recordset.val('开票工厂'),
//                 sccj: recordset.val('厂商名称'),
//             }).then(res => {
//                 recordset.val('信用代码', res.data.zzjgdm)
//                 recordset.val('开票联系人', res.data.kplxr)
//                 recordset.val('开票电话', res.data.kpdh)
//             }).catch(res => {
//                 console.log(res)
//                 _.ui.message.error(res.msg)
//             })
//         }
//     }
//     if (field.full_name == n + '.结算详细') {
//         let r = recordset.val('结算详细')
//         if (r != "") {
//             _.http.post('/api/saier/suppliers/jsxq/change', {
//                 jsxx: r,
//             }).then(res => {

//             }).catch(res => {
//                 console.log(res)
//                 _.ui.message.error(res.msg)
//                 recordset.val('结算详细', "")
//             })
//         }
//     }
//     let fields = ['潜在工厂.可否开票', '潜在工厂.定 金(万)', '潜在工厂.付款比例%', '潜在工厂.结算条件', '潜在工厂.结算详细', '潜在工厂.余款比例%', '潜在工厂.余款天数', '潜在工厂.定 金(%)', '潜在工厂.定 订 金']
//     if (fields.indexOf(field.full_name) != -1) {
//         let jsfs = ''
//         if (recordset.val('定 订 金') == '订金') {
//             if (recordset.val('定 金(万)') > 0) {
//                 jsfs = '需方预付订金' + recordset.val('定 金(万)') + '万';
//             } else {
//                 jsfs = '需方预付订金' + recordset.val('定 金(%)') + '%';
//             }
//         } else {
//             if (recordset.val('定 金(万)') > 0) jsfs = '需方预付定金' + recordset.val('定 金(万)') + '万'
//             if (recordset.val('定 金(%)') > 0) jsfs = '需方预付定金' + recordset.val('定 金(%)') + '%'
//         }
//         if (recordset.val('可否开票') == '可以') {
//             if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
//                 if (jsfs == '') {
//                     jsfs = '供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
//                 } else {
//                     jsfs = jsfs + ',供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
//                 }
//             } else {
//                 if (jsfs == '') {
//                     jsfs = '供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款';
//                 } else {
//                     jsfs = jsfs + ',供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款';
//                 }
//             }
//         } else {
//             if (recordset.val('可否开票') == '后开') {
//                 if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
//                     if (jsfs == '') {
//                         jsfs = '供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
//                     } else {
//                         jsfs = jsfs + ',供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
//                     }
//                 } else {
//                     if (jsfs == '') {
//                         jsfs = '供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
//                     } else {
//                         jsfs = jsfs + ',供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
//                     }
//                 }
//             } else {
//                 if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
//                     if (jsfs == '') {
//                         jsfs = '供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
//                     } else {
//                         jsfs = jsfs + ',供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
//                     }
//                 } else {
//                     if (jsfs == '') {
//                         jsfs = '供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
//                     } else {
//                         jsfs = jsfs + ',供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
//                     }
//                 }
//             }
//         }
//         if ((recordset.val('余款比例%') > 0) && (recordset.val('余款天数') != '0') && (recordset.val('余款天数') != '')) {
//             if (recordset.val('可否开票') == '可以') {
//                 jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款见票' + recordset.val('余款天数') + '天内付清';
//             } else {
//                 if (recordset.val('可否开票') == '后开') {
//                     jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款见票' + recordset.val('余款天数') + '天内付清';
//                 } else {
//                     jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款' + recordset.val('余款天数') + '天内付清';
//                 }
//             }
//         }
//         if (jsfs != '') {
//             recordset.val('结算方式', jsfs)
//         }
//         _.http.post('/api/saier/suppliers/jsfs/change', {}).then(res => {
//             recordset.module.field_by_full_name(n + '.结算方式').readonly = (res.data == 0)
//         }).catch(res => {
//             console.log(res)
//             _.ui.message.error(res.msg)
//         })
//     }


//     if (field.full_name == n + '.认证申请') {
//         let r = recordset.val('认证申请')
//         if (r != "") {
//             if (recordset.val('工厂详情') == "" || recordset.val('合作公司') == "" || recordset.val('营业执照') == "" || recordset.val('生产车间') == "" || recordset.val('纳税人登记表') == "" || recordset.val('纳税申报表') == "") {
//                 _.ui.message.error('请填写工厂详情、合作公司、营业执照、生产车间、纳税人登记表、纳税申报表！')
//                 recordset.val('认证申请', '')
//             }
//             _.http.post('/api/saier/suppliers/rzsq/change', {
//                 gcID: recordset.val('厂商编号')
//             }).then(res => {
//                 if (res.code == 1) {
//                     recordset.val('申请人员', _.user.username)
//                     recordset.val('申请日期', new Date().format('yyyy-MM-dd'))
//                 } else {
//                     _.ui.confirm('请注意此工厂已有认证,重新申请请点确定,否则点取消').then(r => {
//                         recordset.val('申请人员', _.user.username)
//                         recordset.val('申请日期', new Date().format('yyyy-MM-dd'))
//                     }).catch(r => {
//                         recordset.val('认证申请', '')
//                     })
//                 }
//                 if (recordset.val('认证申请') != "") {
//                     _.ui.message.warning('请注意保存后货源地将锁定不能改')
//                 }
//             }).catch(res => {
//                 console.log(res)
//                 _.ui.message.error(res.msg)
//             })
//         }
//     }

// }
// _.evts.on(_.evtids.RECORD_FIELD_CHANGED, suppliers_qz_field_change, '潜在工厂')


const suppliers_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let n = module.name
    // if (field.full_name == n + '.额外分值') {
    //     let r = recordset.val('额外分值')
    //     if (r != 0) {
    //         _.http.post('/api/saier/suppliers/get/rate').then(res => {
    //             let q = recordset.val('综合评分')
    //             if (res.data == 1) {
    //                 if (recordset.val('额外分值') > 0) {
    //                     if (recordset.val('工厂属性') == '一般纳税人') {
    //                         recordset.val('额外分值', 0)
    //                     }
    //                 } else {
    //                     if (recordset.val('额外分值') < -10) {
    //                         recordset.val('额外分值', -10)
    //                     }
    //                 }
    //             }
    //             if (q + recordset.val('额外分值') > 100) {
    //                 recordset.val('综合评分', 100)
    //             } else {
    //                 recordset.val('综合评分', q + recordset.val('额外分值'))
    //             }
    //         }).catch(res => {
    //             console.log(res)
    //             _.ui.message.error(res.msg)
    //         })
    //     }
    // }
    if (field.full_name == n + '.拜访日期') {
        if (recordset.val('拜访日期') != '' && recordset.val('拜访日期') != null) {
            recordset.val('拜访人员', _.user.username)
        }
    }
    if (field.full_name == n + '.认证人员') {
        recordset.val('认证人员1', recordset.val('认证人员'))
        if (recordset.val('认证人员') != '') {
            recordset.val('是否确认', '否')
        }
    }
    if (field.full_name == n + '.联系人查看') {
        recordset.val('认证人员1', recordset.val('认证人员'))
        if (recordset.val('联系人查看') == '是') {
            recordset.module.group_by_name('联系人表').show()
        } else {
            recordset.module.group_by_name('联系人表').hide()
        }
    }
    if (field.full_name == n + '.货 源 地') {
        let v = recordset.val('货 源 地')
        if (v != '') {
            if (v.indexOf('其他') != -1 || v.indexOf('其它') != -1 || v.indexOf(' ') != -1) {
                _.ui.message.error('请注意货源地中不能包含其他或其它')
                recordset.val('货 源 地', '')
            } else {
                _.http.post('/api/saier/suppliers/hyd/change', {
                    hyd: v,
                    kpgc: recordset.val('厂商名称'),
                    cs_id: recordset.val('厂商编号')
                }).then(res => {

                }).catch(res => {
                    console.log(res)
                    _.ui.message.error(res.msg)
                })
            }
        }
    }
    if (field.full_name == n + '.开票工厂') {
        let r = recordset.val('开票工厂')
        if (r != "") {
            _.http.post('/api/saier/suppliers/kpgc/change', {
                kpgc: recordset.val('开票工厂'),
                sccj: recordset.val('厂商名称'),
            }).then(res => {
                recordset.val('信用代码', res.data.zzjgdm)
                recordset.val('开票联系人', res.data.kplxr)
                recordset.val('开票电话', res.data.kpdh)
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }
    if (field.full_name == n + '.结算详细') {
        let r = recordset.val('结算详细')
        if (r != "") {
            _.http.post('/api/saier/suppliers/jsxq/change', {
                jsxx: r,
            }).then(res => {

            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
                recordset.val('结算详细', "")
            })
        }
    }
    let fields = [n + '.可否开票', n + '.定 金(万)', n + '.付款比例%', n + '.结算条件', n + '.结算详细', n + '.余款比例%', n + '.余款天数', n + '.定 金(%)', n + '.定 订 金']
    if (fields.indexOf(field.full_name) != -1) {
        let jsfs = ''
        if (recordset.val('定 订 金') == '订金') {
            if (recordset.val('定 金(万)') > 0) {
                jsfs = '需方预付订金' + recordset.val('定 金(万)') + '万';
            } else {
                jsfs = '需方预付订金' + recordset.val('定 金(%)') + '%';
            }
        } else {
            if (recordset.val('定 金(万)') > 0) jsfs = '需方预付定金' + recordset.val('定 金(万)') + '万'
            if (recordset.val('定 金(%)') > 0) jsfs = '需方预付定金' + recordset.val('定 金(%)') + '%'
        }
        if (recordset.val('可否开票') == '可以') {
            if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
                if (jsfs == '') {
                    jsfs = '供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
                } else {
                    jsfs = jsfs + ',供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
                }
            } else {
                if (jsfs == '') {
                    jsfs = '供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款';
                } else {
                    jsfs = jsfs + ',供方凭增值税发票、盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款';
                }
            }
        } else {
            if (recordset.val('可否开票') == '后开') {
                if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
                    if (jsfs == '') {
                        jsfs = '供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
                    } else {
                        jsfs = jsfs + ',供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
                    }
                } else {
                    if (jsfs == '') {
                        jsfs = '供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
                    } else {
                        jsfs = jsfs + ',供方凭盖章开票合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
                    }
                }
            } else {
                if ((recordset.val('付款比例%') == 100) || (recordset.val('付款比例%') == 0)) {
                    if (jsfs == '') {
                        jsfs = '供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清'
                    } else {
                        jsfs = jsfs + ',供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '结清';
                    }
                } else {
                    if (jsfs == '') {
                        jsfs = '供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
                    } else {
                        jsfs = jsfs + ',供方凭盖章合同，进仓单及3件出货样品于' + recordset.val('结算条件') + recordset.val('结算详细') + '付' + recordset.val('付款比例%') + '%货款'
                    }
                }
            }
        }
        if ((recordset.val('余款比例%') > 0) && (recordset.val('余款天数') != '0') && (recordset.val('余款天数') != '')) {
            if (recordset.val('可否开票') == '可以') {
                if (recordset.val('余款比例%') <= 100) {
                    jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款见票' + recordset.val('余款天数') + '天内付清';
                } else {
                    jsfs = jsfs + ',' + recordset.val('结余款比例%') + '余款见票' + recordset.val('余款天数') + '天内付清';
                }
            } else if (recordset.val('可否开票') == '后开') {
                if (recordset.val('余款比例%') <= 100) {
                    jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款见票' + recordset.val('余款天数') + '天内付清';
                } else {
                    jsfs = jsfs + ',' + recordset.val('结余款比例%') + '余款见票' + recordset.val('余款天数') + '天内付清';
                }
            } else {
                if (recordset.val('余款比例%') <= 100) {
                    jsfs = jsfs + ',' + recordset.val('余款比例%') + '%余款' + recordset.val('余款天数') + '天内付清';
                } else {
                    jsfs = jsfs + ',' + recordset.val('结余款比例%') + '余款' + recordset.val('余款天数') + '天内付清';
                }
            }
        }
        if (jsfs != '') {
            recordset.val('结算方式', jsfs)
        }
        _.http.post('/api/saier/suppliers/jsfs/change').then(res => {
            recordset.module.field_by_full_name(n + '.结算方式').readonly = (res.data == 0)
            recordset.module.field_by_full_name(n + '.结算方式').disabled = (res.data == 0)
        }).catch(res => {
            console.log(res)
            _.ui.message.error(res.msg)
        })
    }
    if (field.full_name == n + '.厂商名称') {
        if (recordset.val('厂商简称') == '') {
            recordset.val('厂商简称', recordset.val('厂商名称'))
        }
    }
    if (n == '专业工厂' && field.full_name == n + '.黑 名 单') {
        if (recordset.val('黑 名 单') != '是') {
            recordset.module.field_by_full_name(n + '.黑 名 单').disabled = false
            recordset.module.field_by_full_name(n + '.黑名单理由').disabled = true
            recordset.val('评定人员', '')
        } else {
            recordset.module.field_by_full_name(n + '.黑名单理由').disabled = false
        }
    }
    if (n == '潜在工厂' && field.full_name == n + '.认证申请') {
        let r = recordset.val('认证申请')
        if (r != "") {
            if (recordset.val('工厂详情') == "" || recordset.val('工厂详情') == undefined || recordset.val('合作公司') == "" || recordset.val('合作公司') == undefined ||
                recordset.val('营业执照') == "" || recordset.val('营业执照') == "[]" || recordset.val('营业执照') == undefined ||
                recordset.val('生产车间') == "" || recordset.val('生产车间') == "[]" || recordset.val('生产车间') == undefined ||
                recordset.val('纳税人登记表') == "" || recordset.val('纳税人登记表') == "[]" || recordset.val('纳税人登记表') == undefined ||
                recordset.val('纳税申报表') == "" || recordset.val('纳税申报表') == "[]" || recordset.val('纳税申报表') == undefined) {
                _.ui.message.error('请填写工厂详情、合作公司、营业执照、生产车间、纳税人登记表、纳税申报表！')
                recordset.val('认证申请', '')
            }
            _.http.post('/api/saier/suppliers/rzsq/change', {
                gcID: recordset.val('厂商编号')
            }).then(res => {
                if (res.code == 1) {
                    recordset.val('申请人员', _.user.username)
                    recordset.val('申请日期', new Date().format('yyyy-MM-dd'))
                } else {
                    _.ui.confirm('请注意此工厂已有认证,重新申请请点确定,否则点取消').then(r => {
                        recordset.val('申请人员', _.user.username)
                        recordset.val('申请日期', new Date().format('yyyy-MM-dd'))
                    }).catch(r => {
                        recordset.val('认证申请', '')
                    })
                }
                if (recordset.val('认证申请') != "") {
                    _.ui.message.warning('请注意保存后货源地将锁定不能改')
                    recordset.val('验厂识别', '是')
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }
    if (n == '专业工厂' && field.full_name == n + '.结算变更.结算方式' && value != "") {
        // let r = recordset.val('结算变更.结算方式')
        if (value != recordset.val('结算变更.结算方式1')) {
            console.log(value + '---' + old_value)
            _.http.post('/api/saier/suppliers/child/jsfs/change', {
                jsfs: value,
                rid: recordset.val('结算变更.rid'),
            }).then(res => {
                // 校验是否有变更的权限
                let jsfs_1 = res.data.jsfs_1
                if (res.data.jsbg == 1) {
                    recordset.val('结算变更.zt', "有")
                    recordset.val('结算变更.结算方式1', recordset.val('结算变更.结算方式'))
                    recordset.val('结算方式', recordset.val('结算变更.结算方式'))
                    recordset.val('结算变更.变更时间', new Date().format('yyyy-MM-dd'))
                    recordset.val('结算变更.变更人员', _.user.username)
                } else {
                    if (res.data.jscz == 1) {
                        recordset.val('结算变更.zt', "有")
                        recordset.val('结算变更.结算方式1', recordset.val('结算变更.结算方式'))
                        recordset.val('结算变更.变更时间', new Date().format('yyyy-MM-dd'))
                        recordset.val('结算变更.变更人员', _.user.username)
                    } else {
                        recordset.val('结算变更.结算方式', jsfs_1)
                        _.ui.message.error('不好意思,无此结算方式,请重新选择,谢谢')
                    }
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, suppliers_field_change, '潜在工厂')
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, suppliers_field_change, '专业工厂')

const suppliers_qz_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('是否专属') == '是') {
            _.ui.message.error('此工厂为专业工厂，请去专业工厂修改')
            reject()
            return
        }
        if (recordset.val('自行开票') == '是' && (recordset.val('货 源 地') == '' || recordset.val('可开票品名') == '')) {
            _.ui.message.error('请填写货源地和可开票品名')
            reject()
            return
        }
        // if (recordset.val('开票工厂') != '' && recordset.val('开票工厂') != recordset.val('厂商名称')) {
        //     _.ui.message.error('开票工厂必须与厂商名称一致')
        //     reject()
        //     return
        // }
        // if (recordset.val('厂商编号') == ''){
        if (recordset.val('认证申请') != '') {
            if (recordset.val('工厂详情') == "" || recordset.val('工厂详情') == undefined || recordset.val('合作公司') == "" || recordset.val('合作公司') == undefined ||
                recordset.val('营业执照') == "" || recordset.val('营业执照') == "[]" || recordset.val('营业执照') == undefined ||
                recordset.val('生产车间') == "" || recordset.val('生产车间') == "[]" || recordset.val('生产车间') == undefined ||
                recordset.val('纳税人登记表') == "" || recordset.val('纳税人登记表') == "[]" || recordset.val('纳税人登记表') == undefined ||
                recordset.val('纳税申报表') == "" || recordset.val('纳税申报表') == "[]" || recordset.val('纳税申报表') == undefined) {
                _.ui.message.error('请填写工厂详情、合作公司、营业执照、生产车间、纳税人登记表、纳税申报表！')
                // recordset.val('认证申请', '')
                reject()
                return
            }
        }
        recordset.val('厂商名称1', recordset.val('厂商名称'))
        // }
        if (recordset.val('开票工厂') != recordset.val('厂商名称') && recordset.val('开票工厂') != '') {
            _.ui.message.error('请注意开票工厂和厂商名称不一致')
        }
        _.http.post('/api/saier/suppliers/save/before', {
            job: recordset.job,
            rid: recordset.rid,
            gcpf: recordset.val('综合评分'),
            cs_id: recordset.val('厂商编号'),
            cs_name: recordset.val('厂商名称'),
            module: recordset.module.name,
            kpgc: recordset.val('开票工厂'),
            // sqry: recordset.val('申请人员'),
            // rzsq: recordset.val('认证申请'),
            // sqrq: recordset.val('申请日期'),
        }).then(res => {
            if (recordset.job != 1) {
                recordset.val('编号部门', res.data.bhbm)
                recordset.val('编号机构', res.data.bhjg)
            }
            if (res.data.kpgc == '') {
                recordset.val('开票工厂', '')
            }
            if (recordset.module.name == '专业工厂') {
                resolve();
                return
            }
            // 移入到工厂审批处理，暂时注释掉评分逻辑
            // let i = 0
            // if (recordset.val('是否确认') == '是') {
            //     if (recordset.val('黑名单') != '是') {
            //         if (recordset.val('综合评分') != 60) {
            //             if (recordset.val('管理人数') == '1-5人') {
            //                 i = i + 5;
            //             } else {
            //                 if ((recordset.val('管理人数') == '5-10人') || (recordset.val('管理人数') == '我司配合指定跟单人员')) {
            //                     i = i + 10;
            //                 }
            //             }
            //             if ((recordset.val('经营模式') == '加工型') || (recordset.val('经营模式') == '贸易型')) {
            //                 i = i + 5;
            //             } else {
            //                 if ((recordset.val('经营模式') == '生产型') || (recordset.val('经营模式') == '工贸型')) {
            //                     i = i + 10;
            //                 }
            //             }
            //             if (recordset.val('厂房性质') == '租赁') {
            //                 i = i + 5
            //             } else if (recordset.val('厂房性质') == '自有') {
            //                 i = i + 10;
            //             }
            //             if (recordset.val('销售方式') == '内销为主') {
            //                 i = i + 5;
            //             } else {
            //                 if (recordset.val('销售方式') == '出口为主') {
            //                     i = i + 10;
            //                 } else if (recordset.val('销售方式') == '品牌经营') {
            //                     i = i + 15;
            //                 }
            //             }
            //             if ((recordset.val('主要市场').indexOf('北美') != -1) || (recordset.val('主要市场').indexOf('西欧') != -1)) {
            //                 i = i + 10;
            //             } else {
            //                 if ((recordset.val('主要市场').indexOf('南美') != -1) || (recordset.val('主要市场').indexOf('中东') != -1) || (recordset.val('主要市场').indexOf('东欧') != -1) || (recordset.val('主要市场').indexOf('大洋洲') != -1)) {
            //                     i = i + 5;
            //                 }
            //             }
            //             if (recordset.val('年销售额') == '0-500万') {
            //                 i = i + 3;
            //             } else if (recordset.val('年销售额') == '500-1000万') {
            //                 i = i + 5;
            //             } else if (recordset.val('年销售额') == '1000-2000万') {
            //                 i = i + 10;
            //             } else if (recordset.val('年销售额') == '2000万-5000万') {
            //                 i = i + 15;
            //             } else if (recordset.val('年销售额') == '5000万以上') {
            //                 i = i + 20;
            //             }
            //             if ((recordset.val('配套资源').indexOf('设计研发') != -1 || (recordset.val('配套资源').indexOf('模具制造') != -1) || (recordset.val('配套资源').indexOf('原料生产') != -1) || (recordset.val('配套资源').indexOf('印染能力') != -1))) {
            //                 i = i + 10;
            //             } else if ((recordset.val('配套资源').indexOf('来样加工') != -1) || (recordset.val('配套资源').indexOf('来图加工') != -1)) {
            //                 i = i + 5;
            //             }
            //             if (recordset.val('企业认证') != '') {
            //                 i = i + 10;
            //             }
            //             if (recordset.val('工厂环境') == '整洁') {
            //                 i = i + 5;
            //             } else if (recordset.val('工厂环境') == '一般') {
            //                 i = i + 3;
            //             }
            //             if (recordset.val('交 货 期') == '准时') {
            //                 i = i + 15;
            //             } else if (recordset.val('交 货 期') == '偶然有延期') {
            //                 i = i - 5;
            //             } else if (recordset.val('交 货 期') == '延期') {
            //                 i = i - 10
            //             }
            //             if (res.data.gcsh == 1) {
            //                 if (recordset.val('额外分值') > 0) {
            //                     if (recordset.val('工厂属性') == '一般纳税人') {
            //                         recordset.val('额外分值', 0)
            //                     }
            //                 } else if (recordset.val('额外分值') < -10) {
            //                     recordset.val('额外分值', -10)
            //                 }
            //             }
            //             i = i + recordset.val('额外分值')
            //             if (i == 60) {
            //                 i = i + 1
            //             }
            //             recordset.val('综合评分', i)
            //         } else {
            //             i = 60
            //             if (recordset.val('交 货 期') == '准时') {
            //                 i = i + 15
            //             } else if (recordset.val('交 货 期') == '偶然有延期') {
            //                 i = i - 5
            //             } else if (recordset.val('交 货 期') == '延期') {
            //                 i = i - 10
            //             }
            //             recordset.val('综合评分', i)
            //         }
            //     }
            //     recordset.val('认证人员', '')
            // }
            resolve();
        }).catch(res => {
            reject(res.msg);
            console.log(res)
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, suppliers_qz_before_save, '潜在工厂')

const suppliers_zy_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        let n = recordset.module.name
        if (recordset.val('黑 名 单') == '是') {
            if (recordset.val('评定人员') == '') {
                recordset.val('评定人员', _.user.username);
            }
            recordset.val('综合评分', 0);
            recordset.val('审核结果', '待审批');
            recordset.module.field_by_full_name(n + '.黑 名 单').disabled = true;
            if (recordset.val('黑名单理由') == '') {
                reject('未填写黑名单理由，系统不能保存')
                return
            };
        };
        if (recordset.val('自行开票') == '是' && (recordset.val('货 源 地') == '' || recordset.val('可开票品名') == '')) {
            _.ui.message.error('请填写货源地和可开票品名')
            reject()
            return
        }
        // if (recordset.val('开票工厂') != '' && recordset.val('开票工厂') != recordset.val('厂商名称')) {
        //     _.ui.message.error('开票工厂必须与厂商名称一致')
        //     reject()
        //     return
        // }
        if (recordset.val('厂商编号') == '') {
            recordset.val('厂商名称1', recordset.val('厂商名称'))
        }
        if (recordset.val('开票工厂') != recordset.val('厂商名称') && recordset.val('开票工厂') != '') {
            _.ui.message.error('请注意开票工厂和厂商名称不一致')
        }
        // console.log('suppliers_zy_before_save')
        recordset.val('回访情况', recordset.val('验厂资质').substring(0, 255))
        _.http.post('/api/saier/suppliers/save/before', {
            job: recordset.job,
            rid: recordset.rid,
            gcpf: recordset.val('综合评分'),
            cs_id: recordset.val('厂商编号'),
            cs_name: recordset.val('厂商名称'),
            data: recordset.tables['专业工厂'].view_data,
            kpgc: recordset.val('开票工厂'),
            module: recordset.module.name,
            // zhkp: recordset.val('厂商名称'),
            // hyd: recordset.val('货 源 地'),
            // kkppm: recordset.val('可开票品名'),
            // zhkp: recordset.val('厂商名称'),
            // sqry: recordset.val('申请人员'),
            // rzsq: recordset.val('认证申请'),
            // sqrq: recordset.val('申请日期'),
        }).then(res => {
            // if (recordset.job != 1) {
            //     recordset.val('编号部门', res.data.bhbm)
            //     recordset.val('编号机构', res.data.bhjg)
            // }
            // (recordset.val('工厂详情') != '') && (recordset.val('合作公司') != '') && (recordset.val('生产车间') != '') && (recordset.val('营业执照') != '') && (recordset.val('纳税人登记表') != '') && (recordset.val('纳税申报表') != '')
            if (recordset.val('新建识别') == '是' && res.data.xjsb == 1) {
                reject('请注意要有工厂详情，合作公司，上传营业执照和生产车间、纳税人登记表、纳税申报表才能保存')
                return
            }
            if (res.data.kpgc == '') {
                recordset.val('开票工厂', '')
            }
            console.log('res data', res.data)
            let t = recordset.tables['工厂评分']
            let v = t.view_data
            let flag = 0
            for (let r of v) {
                let flag = 0
                if (r.company_name == undefined || r.company_name == '') {
                    r.company_name = recordset.val('厂商名称')
                    flag = 1
                }
                if (r.wyph == undefined || r.wyph == '') {
                    r.wyph = 'zycs' + recordset.val('厂商名称') + _.user.username + new Date().format('yyyy-MM-dd hh:mm:ss')
                    flag = 1
                }
                if (flag) {
                    t.push_modi_rid(r.rid)
                }
            }
            if (flag) {
                t.sync_operate_data()
                t.modified = true
            }
            let d = recordset.tables['结算变更']
            let x = d.view_data
            flag = 0
            let j = 0
            for (let r of x) {
                let flag = 0
                if (r.zt != '无') {
                    r.zt = '无'
                    flag = 1
                }
                if (r.jsfs == recordset.val('结算方式')) {
                    j += 1
                }
                if (flag) {
                    t.push_modi_rid(r.rid)
                }
            }
            if (res.data.xgsb == 0) {
                _.ui.message.error('您无权修改此记录,如有认证已自动提交，关闭即可')
                reject()
                return
            }
            // console.log('新增结算变更记录 a')
            if (j == 0 && recordset.tables['结算变更'].view_data.length >= 5) {
                _.ui.message.warning('结算方式超过5条记录')
            } else {
                if (j == 0 && recordset.tables['结算变更'].view_data.length < 5) {
                    // console.log('新增结算变更记录 b')
                    let r = {}
                    r.rid = _.utils.guid()
                    r.pid = recordset.val('rid')
                    r.citme = new Date().format('yyyy-MM-dd hh:mm:ss')
                    r.uid = _.user.rid
                    r.jsfs = recordset.val('结算方式')
                    r.bgsj = new Date().format('yyyy-MM-dd')
                    r.bgry = _.user.username
                    r.zt = '无'
                    x.push(r)
                    d.push_new_rid(r.rid)
                    flag = 1
                }
                // console.log('新增结算变更记录 c')
                d.sync_operate_data()
                d.modified = true
            }

            // 移入到工厂审批处理，暂时注释掉评分逻辑
            // let i = 0
            // if (recordset.val('是否确认') == '是') {
            //     if (recordset.val('黑名单') != '是') {
            //         if (recordset.val('综合评分') != 60) {
            //             if (recordset.val('管理人数') == '1-5人') {
            //                 i = i + 5;
            //             } else {
            //                 if ((recordset.val('管理人数') == '5-10人') || (recordset.val('管理人数') == '我司配合指定跟单人员')) {
            //                     i = i + 10;
            //                 }
            //             }
            //             if ((recordset.val('经营模式') == '加工型') || (recordset.val('经营模式') == '贸易型')) {
            //                 i = i + 5;
            //             } else {
            //                 if ((recordset.val('经营模式') == '生产型') || (recordset.val('经营模式') == '工贸型')) {
            //                     i = i + 10;
            //                 }
            //             }
            //             if (recordset.val('厂房性质') == '租赁') {
            //                 i = i + 5
            //             } else if (recordset.val('厂房性质') == '自有') {
            //                 i = i + 10;
            //             }
            //             if (recordset.val('销售方式') == '内销为主') {
            //                 i = i + 5;
            //             } else {
            //                 if (recordset.val('销售方式') == '出口为主') {
            //                     i = i + 10;
            //                 } else if (recordset.val('销售方式') == '品牌经营') {
            //                     i = i + 15;
            //                 }
            //             }
            //             if ((recordset.val('主要市场').indexOf('北美') != -1) || (recordset.val('主要市场').indexOf('西欧') != -1)) {
            //                 i = i + 10;
            //             } else {
            //                 if ((recordset.val('主要市场').indexOf('南美') != -1) || (recordset.val('主要市场').indexOf('中东') != -1) || (recordset.val('主要市场').indexOf('东欧') != -1) || (recordset.val('主要市场').indexOf('大洋洲') != -1)) {
            //                     i = i + 5;
            //                 }
            //             }
            //             if (recordset.val('年销售额') == '0-500万') {
            //                 i = i + 3;
            //             } else if (recordset.val('年销售额') == '500-1000万') {
            //                 i = i + 5;
            //             } else if (recordset.val('年销售额') == '1000-2000万') {
            //                 i = i + 10;
            //             } else if (recordset.val('年销售额') == '2000万-5000万') {
            //                 i = i + 15;
            //             } else if (recordset.val('年销售额') == '5000万以上') {
            //                 i = i + 20;
            //             }
            //             if ((recordset.val('配套资源').indexOf('设计研发') != -1 || (recordset.val('配套资源').indexOf('模具制造') != -1) || (recordset.val('配套资源').indexOf('原料生产') != -1) || (recordset.val('配套资源').indexOf('印染能力') != -1))) {
            //                 i = i + 10;
            //             } else if ((recordset.val('配套资源').indexOf('来样加工') != -1) || (recordset.val('配套资源').indexOf('来图加工') != -1)) {
            //                 i = i + 5;
            //             }
            //             if (recordset.val('企业认证') != '') {
            //                 i = i + 10;
            //             }
            //             if (recordset.val('工厂环境') == '整洁') {
            //                 i = i + 5;
            //             } else if (recordset.val('工厂环境') == '一般') {
            //                 i = i + 3;
            //             }
            //             if (recordset.val('交 货 期') == '准时') {
            //                 i = i + 15;
            //             } else if (recordset.val('交 货 期') == '偶然有延期') {
            //                 i = i - 5;
            //             } else if (recordset.val('交 货 期') == '延期') {
            //                 i = i - 10
            //             }
            //             if (res.data.gcsh == 1) {
            //                 if (recordset.val('额外分值') > 0) {
            //                     if (recordset.val('工厂属性') == '一般纳税人') {
            //                         recordset.val('额外分值', 0)
            //                     }
            //                 } else if (recordset.val('额外分值') < -10) {
            //                     recordset.val('额外分值', -10)
            //                 }
            //             }
            //             i = i + recordset.val('额外分值')
            //             if (i == 60) {
            //                 i = i + 1
            //             }
            //             recordset.val('综合评分', i)
            //         } else {
            //             i = 60
            //             if (recordset.val('交 货 期') == '准时') {
            //                 i = i + 15
            //             } else if (recordset.val('交 货 期') == '偶然有延期') {
            //                 i = i - 5
            //             } else if (recordset.val('交 货 期') == '延期') {
            //                 i = i - 10
            //             }
            //             recordset.val('综合评分', i)
            //         }
            //         recordset.val('认证人员', '')
            //     }
            // }
            resolve();
        }).catch(res => {
            reject(res.msg);
            console.log(res)
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, suppliers_zy_before_save, '专业工厂')

const suppliers_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'suppliers_trans_btn') {
        _.ui.confirm('确定要转专业工厂吗？').then(() => {
            _.http.post("/api/saier/suppliers/trans/zy", {
                rids: [form.current_rid.value]
            }).then(res => {
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            })
        })
    };

    if (btn.name == 'suppliers_notice_btn') {
        _.ui.confirm('确定要提交转专业工厂申请吗？').then(() => {
            _.http.post('/api/saier/suppliers/get/user').then(res => {
                _.ui.show_input_select_dialog('请输入要提交的主管:', '', res.data).then(val => {
                    _.http.post("/api/saier/supplier/task/new", {
                        module: form.module.name,
                        rid: form.current_rid.value,
                        key_field: '厂商编号',
                        title: '潜在工厂[厂商简称]' + '转专业工厂申请',
                        content: _.user.username + '申请潜在工厂:[厂商简称],厂商编号:[厂商编号]转到专业工厂',
                        to_list: [val],
                        kind: '潜在转专业'
                    }).then(res => {
                        _.ui.message.success(res.msg);
                    }).catch(res => {
                        _.ui.message.error(res.msg);
                        console.log(res);
                    })
                })
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };

    if (btn.name == 'suppliers_download_file_btn') {
        _.ui.confirm('确定要下载诚信经营书吗？').then(() => {
            _.http.post('/api/saier/suppliers/download/file', {
                rid: form.current_rid.value
            }).then(res => {
                _.ui.message.success(_l('正在下载文件...'))
                let f_path = res.data.path;
                let f_name = res.data.name;
                _.http.download(
                    "/api/file/get", {
                        file: f_path
                    },
                    f_name
                );
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };

    if (btn.name == 'suppliers_download_photo_btn') {
        _.ui.show_input_select_dialog('请选择类型', '专业工厂', ['专业工厂', '潜在工厂']).then(val => {
            _.ui.show_process_dialog(_l('正在下载图片...'))
            _.http.post('/api/saier/suppliers/download/photo', {
                rid: form.current_rid.value,
                kind: val
            }).then(res => {
                let f_path = res.data.path;
                let f_name = res.data.name;
                _.http.download(
                    "/api/tmp/file/get", {
                        file: f_path
                    },
                    f_name
                );
            }).catch(res => {
                _.ui.message.error(_l(res.msg))
            }).finally(() => {
                _.ui.hide_process_dialog()
            })
        })
    };
    if (btn.name == 'suppliers_upload_btn') {
        _.ui.show_input_select_dialog('请选择类型', '专业工厂', ['专业工厂', '潜在工厂']).then(val => {
            // _.ui.show_upload_dialog({
            //         title: '图片更新',
            //         params: {rid: form.current_rid.value,kind: val},
            //         url: '/api/saier/suppliers/upload/photo', //api地址 
            //         accept: '.zip',
            //         success_msg: '上传成功',
            //         error_msg: '上传失败',
            //         // auto_close: true
            //     },
            //     (res) => {
            //         console.log('上传成功', res)
            // })
            _.ui.show_dialog('image-upload-new', {
                rid: form.current_rid.value,
                rids: [form.current_rid],
                kind: val
            });
        })
    }
    if (btn.name == 'suppliers_update_cxgc_btn') {
        // _.ui.show_input_dialog('输1为专业,输2为潜在,默认为专业', '1').then(val => {
        _.ui.show_upload_dialog({
                title: '诚信经营书上传',
                params: {
                    rid: form.current_rid.value
                },
                url: '/api/saier/suppliers/update/cxgc', //api地址 
                accept: '.png,.jpeg',
                success_msg: '上传成功',
                error_msg: '上传失败',
                // auto_close: true
            },
            (res) => {
                console.log('上传成功', res)
            })
        // })
    }
    if (btn.name == 'update_supplier_jsfs_btn') {
        form.recordset.val('结算方式', form.recordset.val('结算变更.结算方式'))
    }
    if (btn.name == 'update_supplier_user_insert_btn') {
        _.http.post('/api/saier/suppliers/child/kggry/get', {}).then(res => {
            _.ui.show_input_select_dialog('请选择可修改人员', '', res.data).then(val => {
                let t = form.recordset.tables['可修改人员']
                let d = t.view_data
                let flag = true
                for (let r of d) {
                    if (r.kggry == val) {
                        _.ui.message.error('该用户已【' + val + '】经存在')
                        flag = false
                        break
                    }
                }
                if (flag) {
                    t.append().then(r => {
                        recordset.val('可修改人员.可更改人员', val)
                        recordset.val('可修改人员.可更改人员1', val)
                        recordset.val('可修改人员.添加人员', _.user.username)
                    })
                }
            })
        }).catch(res => {
            _.ui.message.error(_l(res.msg))
        })
    }
    if (btn.name == 'update_supplier_user_update_btn') {
        _.http.post('/api/saier/suppliers/child/kggry/get', {}).then(res => {
            _.ui.show_input_select_dialog('请选择可修改人员', '', res.data).then(val => {
                let t = form.recordset.tables['可修改人员']
                let d = t.view_data
                let flag = true
                for (let r of d) {
                    if (r.kggry == val) {
                        _.ui.message.error('该用户已【' + val + '】经存在')
                        flag = false
                        break
                    }
                }
                if (flag) {
                    recordset.val('可修改人员.可更改人员', val)
                    recordset.val('可修改人员.可更改人员1', val)
                }
            })
        }).catch(res => {
            _.ui.message.error(_l(res.msg))
        })
    }

    if (btn.name == 'suppliers_certificat_btn') {
        _.ui.confirm('确定要提交认证申请吗？').then(() => {
            _.http.post('/api/saier/workflow/start', {
                rid: form.current_rid.value,
                module: form.module.name,
                kind: '认证申请'
            }).then(res => {
                if (form.is_editor) {
                    _.platform.active.reload_data()
                } else {
                    _.platform.active.load_data();
                }
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
    if (btn.name == 'suppliers_audit_btn') {
        _.ui.confirm('确定要提交加分申请吗？').then(() => {
            _.http.post('/api/saier/workflow/start', {
                rid: form.current_rid.value,
                module: form.module.name,
                kind: '加分申请'
            }).then(res => {
                if (form.is_editor) {
                    _.platform.active.reload_data()
                } else {
                    _.platform.active.load_data();
                }
                _.ui.message.success(res.msg);
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    };
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], suppliers_BtnClick, '潜在工厂')
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], suppliers_BtnClick, '专业工厂')

const suppliers_qz_FormShow = (evt_id, form) => {
    let btns = []
    if (form.is_editor) {
        btns.push({
            "name": 'suppliers_notice_btn',
            "caption": '转专业申请',
            "icon": 'any-keyborad',
        })
    }
    btns.push({
        "name": 'suppliers_certificat_btn',
        "caption": '认证申请',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'suppliers_audit_btn',
        "caption": '加分申请',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'suppliers_trans_btn',
        "caption": '潜在转专业',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');

}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], suppliers_qz_FormShow, '潜在工厂')


const suppliers_zy_FormShow = (evt_id, form) => {
    let btns = []
    // btns.push({
    //     "name": 'suppliers_download_photo_btn',
    //     "caption": '图片引出',
    //     "icon": 'any-keyborad',
    // })
    // btns.push({
    //     "name": 'suppliers_upload_btn',
    //     "caption": '图片更换',
    //     "icon": 'any-keyborad',
    // })
    btns.push({
        "name": 'suppliers_update_cxgc_btn',
        "caption": '诚信经营书上传',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'suppliers_certificat_btn',
        "caption": '认证申请',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'suppliers_audit_btn',
        "caption": '加分申请',
        "icon": 'any-keyborad',
    })
    btns.push({
        "name": 'suppliers_download_file_btn',
        "caption": '当前诚信经营书导出',
        "icon": 'any-keyborad',
    })

    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW, _.evtids.MODULE_SEARCH_SHOW], suppliers_zy_FormShow, '专业工厂')

// 编辑界面数据加载以后执行
const suppliers_recordLoad = (evt_id, recordset) => {
    let n = recordset.module.name;
    recordset.module.field_by_full_name(n + '.结算方式').disabled = true;
    if (recordset.val('开票工厂') != recordset.val('厂商名称') && recordset.val('开票工厂') != '') {
        _.ui.message.error('请注意开票工厂和厂商名称不一致')
    }
    if (_.user.username == 'zjnblh') {
        recordset.module.field_by_full_name(n + '.修改清单').show();
    } else {
        recordset.module.field_by_full_name(n + '.修改清单').hide();
    }
    if (recordset.val('是否验厂') == '') {
        recordset.val('是否验厂', '否')
    }
    if (recordset.val('公司主页') == '') {
        recordset.val('公司主页', '无')
    }
    recordset.module.field_by_full_name(n + '.认证人员').hide()
    recordset.module.field_by_full_name(n + '.负面情况').hide()
    recordset.module.field_by_full_name(n + '.认证申请').disabled = (recordset.val('认证申请') != '')
    recordset.module.field_by_full_name(n + '.认证人员').disabled = (recordset.val('认证更改') == '否')
    recordset.module.field_by_full_name(n + '.有无拜访').disabled = (recordset.val('有无拜访') == '有')
    if (recordset.val('认证人员') != '' || recordset.val('意见建议') != '') {
        if (recordset.val('认证人员') == _.user.username) {
            recordset.module.field_by_full_name(n + '.认证人员').disabled = true
            recordset.module.field_by_full_name(n + '.认证人员').show()
        }
    }
    if (recordset.val('认证申请') == _.user.username) {
        if (recordset.val('是否确认') == "是") {
            recordset.module.field_by_full_name(n + '.是否确认').show()
        }
    }
    if (recordset.module.name == '专业工厂') {
        // recordset.val('正常日期',new Date().format('yyyy-MM-dd'))
        recordset.module.field_by_full_name(n + '.黑 名 单').disabled = true
        recordset.module.field_by_full_name(n + '.黑名单').disabled = true
        recordset.module.field_by_full_name(n + '.负面情况').disabled = true
        recordset.module.field_by_full_name(n + '.黑名单理由').disabled = true
        recordset.module.group_by_name('联系人表').hide()
        recordset.module.group_by_name('可修改人员').hide()
        let j = recordset.tables['结算变更']
        recordset.module.group_by_name('结算变更').readonly = (j.view_data.length > 4)
    }
    recordset.module.field_by_full_name(n + '.不批原因').disabled = true
    _.http.post('/api/saier/suppliers/load/check', {
        module: recordset.module.name
    }).then(res => {
        let d = res.data;

        if (d.deleted == 1) {
            recordset.tables['联系人表']._.toolbar.hide('delete');
            if (recordset.module.name == '专业工厂') {
                recordset.tables['工厂评分']._.toolbar.hide('delete');
                recordset.tables['结算变更']._.toolbar.hide('delete');
            }
        }
        if (d.rzsq == 1) {
            recordset.module.field_by_full_name(n + '.认证申请').disabled = false
            if (recordset.module.name == '专业工厂') {
                recordset.module.field_by_full_name(n + '.黑 名 单').disabled = false
            }
        }
        if (d.gcrz == 1) {
            if (recordset.val('是否确认') != '是' && (recordset.val('认证人员') == _.user.username || _.user.username == '谢培雅')) {
                recordset.module.field_by_full_name(n + '.经营地址').disabled = false
                recordset.module.field_by_full_name(n + '.管理人数').disabled = false
                recordset.module.field_by_full_name(n + '.员工人数').disabled = false
                recordset.module.field_by_full_name(n + '.设备数量').disabled = false
                recordset.module.field_by_full_name(n + '.经营模式').disabled = false
                recordset.module.field_by_full_name(n + '.厂房面积').disabled = false
                recordset.module.field_by_full_name(n + '.主营产品').disabled = false
                recordset.module.field_by_full_name(n + '.主营行业').disabled = false
                recordset.module.field_by_full_name(n + '.主要市场').disabled = false
                recordset.module.field_by_full_name(n + '.销售方式').disabled = false
                recordset.module.field_by_full_name(n + '.年销售额').disabled = false
                recordset.module.field_by_full_name(n + '.价格区间').disabled = false
                recordset.module.field_by_full_name(n + '.客户群体').disabled = false
                recordset.module.field_by_full_name(n + '.月 产 量').disabled = false
                recordset.module.field_by_full_name(n + '.最高月产量').disabled = false
                recordset.module.field_by_full_name(n + '.日平均产量').disabled = false
                recordset.module.field_by_full_name(n + '.品牌名称').disabled = false
                recordset.module.field_by_full_name(n + '.工厂环境').disabled = false
                recordset.module.field_by_full_name(n + '.配套资源').disabled = false
                // recordset.module.field_by_full_name(n + '.交 货 期').disabled = true;
                recordset.module.field_by_full_name(n + '.验厂信息').disabled = false
                recordset.module.field_by_full_name(n + '.意见建议').disabled = false
                recordset.module.field_by_full_name(n + '.企业认证').disabled = false
            } else {
                recordset.module.field_by_full_name(n + '.厂房性质').disabled = true
                recordset.module.field_by_full_name(n + '.经营地址').disabled = true
                recordset.module.field_by_full_name(n + '.管理人数').disabled = true
                recordset.module.field_by_full_name(n + '.员工人数').disabled = true
                recordset.module.field_by_full_name(n + '.设备数量').disabled = true
                recordset.module.field_by_full_name(n + '.经营模式').disabled = true
                recordset.module.field_by_full_name(n + '.厂房面积').disabled = true
                recordset.module.field_by_full_name(n + '.主营产品').disabled = true
                recordset.module.field_by_full_name(n + '.主营行业').disabled = true
                recordset.module.field_by_full_name(n + '.主要市场').disabled = true
                recordset.module.field_by_full_name(n + '.销售方式').disabled = true
                recordset.module.field_by_full_name(n + '.年销售额').disabled = true
                recordset.module.field_by_full_name(n + '.价格区间').disabled = true
                recordset.module.field_by_full_name(n + '.客户群体').disabled = true
                recordset.module.field_by_full_name(n + '.月 产 量').disabled = true
                recordset.module.field_by_full_name(n + '.最高月产量').disabled = true
                recordset.module.field_by_full_name(n + '.日平均产量').disabled = true
                recordset.module.field_by_full_name(n + '.品牌名称').disabled = true
                recordset.module.field_by_full_name(n + '.工厂环境').disabled = true
                recordset.module.field_by_full_name(n + '.配套资源').disabled = true
                // recordset.module.field_by_full_name(n + '.交 货 期').disabled = true;
                recordset.module.field_by_full_name(n + '.验厂信息').disabled = true
                recordset.module.field_by_full_name(n + '.意见建议').disabled = true
                recordset.module.field_by_full_name(n + '.是否确认').disabled = true
                recordset.module.field_by_full_name(n + '.企业认证').disabled = true
            }
            recordset.module.field_by_full_name(n + '.公司名称').disabled = false
            recordset.module.field_by_full_name(n + '.注册地址').disabled = false
            recordset.module.field_by_full_name(n + '.成立日期').disabled = false
            recordset.module.field_by_full_name(n + '.注 册 号').disabled = false
            recordset.module.field_by_full_name(n + '.法   人').disabled = false
            recordset.module.field_by_full_name(n + '.登记机关').disabled = false
            recordset.module.field_by_full_name(n + '.企业类型').disabled = false
            recordset.module.field_by_full_name(n + '.营业期限').disabled = false
            recordset.module.field_by_full_name(n + '.年检时间').disabled = false
            recordset.module.field_by_full_name(n + '.经营范围').disabled = false
            recordset.module.field_by_full_name(n + '.注册资本').disabled = false
            recordset.module.field_by_full_name(n + '.税务登记证号').disabled = false
        } else {
            recordset.module.field_by_full_name(n + '.厂房性质').disabled = true
            recordset.module.field_by_full_name(n + '.经营地址').disabled = true
            recordset.module.field_by_full_name(n + '.管理人数').disabled = true
            recordset.module.field_by_full_name(n + '.员工人数').disabled = true
            recordset.module.field_by_full_name(n + '.设备数量').disabled = true
            recordset.module.field_by_full_name(n + '.经营模式').disabled = true
            recordset.module.field_by_full_name(n + '.厂房面积').disabled = true
            recordset.module.field_by_full_name(n + '.主营产品').disabled = true
            recordset.module.field_by_full_name(n + '.主营行业').disabled = true
            recordset.module.field_by_full_name(n + '.主要市场').disabled = true
            recordset.module.field_by_full_name(n + '.销售方式').disabled = true
            recordset.module.field_by_full_name(n + '.年销售额').disabled = true
            recordset.module.field_by_full_name(n + '.价格区间').disabled = true
            recordset.module.field_by_full_name(n + '.客户群体').disabled = true
            recordset.module.field_by_full_name(n + '.月 产 量').disabled = true
            recordset.module.field_by_full_name(n + '.最高月产量').disabled = true
            recordset.module.field_by_full_name(n + '.日平均产量').disabled = true
            recordset.module.field_by_full_name(n + '.品牌名称').disabled = true
            recordset.module.field_by_full_name(n + '.工厂环境').disabled = true
            recordset.module.field_by_full_name(n + '.配套资源').disabled = true
            // recordset.module.field_by_full_name(n + '.交 货 期').disabled = true
            recordset.module.field_by_full_name(n + '.验厂信息').disabled = true
            recordset.module.field_by_full_name(n + '.意见建议').disabled = true
            recordset.module.field_by_full_name(n + '.企业认证').disabled = true

            recordset.module.field_by_full_name(n + '.是否确认').disabled = true
            recordset.module.field_by_full_name(n + '.公司名称').disabled = true
            recordset.module.field_by_full_name(n + '.注册地址').disabled = true
            recordset.module.field_by_full_name(n + '.成立日期').disabled = true
            recordset.module.field_by_full_name(n + '.注 册 号').disabled = true
            recordset.module.field_by_full_name(n + '.法   人').disabled = true
            recordset.module.field_by_full_name(n + '.登记机关').disabled = true
            recordset.module.field_by_full_name(n + '.企业类型').disabled = true
            recordset.module.field_by_full_name(n + '.营业期限').disabled = true
            recordset.module.field_by_full_name(n + '.年检时间').disabled = true
            recordset.module.field_by_full_name(n + '.经营范围').disabled = true
            recordset.module.field_by_full_name(n + '.注册资本').disabled = true
            recordset.module.field_by_full_name(n + '.税务登记证号').disabled = true
        }
        if (d.sfgd == 1) {
            // recordset.module.field_by_full_name(n + '.交 货 期').disabled = false;
        } else {
            recordset.module.group_by_name('联系人表').readonly = true;
        }
        if (d.gcsh == 1) {
            recordset.module.field_by_full_name(n + '.审核结果').disabled = false;
            recordset.module.field_by_full_name(n + '.不批原因').disabled = false;
        } else {
            recordset.module.field_by_full_name(n + '.审核结果').disabled = true;
            // recordset.module.field_by_full_name(n + '.不批原因').disabled = true;
            recordset.module.field_by_full_name(n + '.额外分值').disabled = true;
            recordset.module.field_by_full_name(n + '.不批原因').disabled = true
        }
        if (d.hmd == 1) {
            recordset.module.field_by_full_name(n + '.负面情况').disabled = false
            if (recordset.module.field_by_full_name(n + '.黑 名 单')) {
                recordset.module.field_by_full_name(n + '.黑 名 单').disabled = false
                if (recordset.val('黑 名 单') != '是') {
                    recordset.module.field_by_full_name(n + '.额外分值').disabled = false;
                    recordset.module.field_by_full_name(n + '.审核结果').disabled = false;
                    recordset.module.field_by_full_name(n + '.不批原因').disabled = false;
                }
            } else {
                recordset.module.field_by_full_name(n + '.额外分值').disabled = false;
                recordset.module.field_by_full_name(n + '.审核结果').disabled = false;
                recordset.module.field_by_full_name(n + '.不批原因').disabled = false;
            }
            // recordset.module.field_by_full_name(n + '.额外分值').disabled = false;
            // if (recordset.val('是否确认') == "是") {
            //     recordset.module.field_by_full_name(n + '.是否确认').disabled = false
            // }
            recordset.module.field_by_full_name(n + '.意见建议').show()
            recordset.module.field_by_full_name(n + '.认证人员').show()
        } else {
            // console.log('没有黑名单权限')
            // recordset.module.field_by_full_name(n + '.认证人员').hide()
            recordset.module.field_by_full_name(n + '.意见建议').hide()
        }
        if (d.gcgg == 1) {
            if (recordset.val('综合评分') > 0) {
                recordset.module.field_by_full_name(n + '.厂商名称').disabled = true;
            }
            if (recordset.val('验厂识别') == '是' && recordset.val('货 源 地') != "") {
                recordset.module.field_by_full_name(n + '.货 源 地').disabled = true;
            }
        }
        if (recordset.module.name == '专业工厂' && d.sfcw == 1) {
            recordset.module.group_by_name('联系人表').hide()
            recordset.module.group_by_name('可修改人员').hide()
            recordset.module.group_by_name('结算方式').hide()
            recordset.module.group_by_name('结算变更').hide()
            recordset.module.group_by_name('工厂评分').hide()
            recordset.module.group_by_name('认证信息').hide()
            recordset.module.group_by_name('老板档案').hide()
            recordset.module.group_by_name('工厂产品').hide()
            recordset.module.field_by_full_name(n + '.备    注').hide()
            recordset.module.field_by_full_name(n + '.老板档案').hide()
            recordset.module.field_by_full_name(n + '.联 系 人').hide()
            recordset.module.field_by_full_name(n + '.联系人级别').hide()
            recordset.module.field_by_full_name(n + '.电话号码').hide()
            recordset.module.field_by_full_name(n + '.传真号码').hide()
            recordset.module.field_by_full_name(n + '.手机号码').hide()
            recordset.module.field_by_full_name(n + '.老板名字').hide()
            recordset.module.field_by_full_name(n + '.老板电话').hide()
            recordset.module.field_by_full_name(n + '.企业QQ').hide()
            recordset.module.field_by_full_name(n + '.详细地址').hide()
            recordset.module.field_by_full_name(n + '.电子邮件').hide()
            recordset.module.field_by_full_name(n + '.公司主页').hide()
            recordset.module.field_by_full_name(n + '.工厂属性').hide()
            recordset.module.field_by_full_name(n + '.提供样品').hide()
            recordset.module.field_by_full_name(n + '.产品品质').hide()
            recordset.module.field_by_full_name(n + '.可开票品名').hide()
            recordset.module.field_by_full_name(n + '.工厂详情').hide()
            recordset.module.field_by_full_name(n + '.工厂来源').hide()
            recordset.module.field_by_full_name(n + '.下单产品').hide()
            recordset.module.field_by_full_name(n + '.直接工厂').hide()
            recordset.module.field_by_full_name(n + '.集团合作').hide()
            recordset.module.field_by_full_name(n + '.验厂类别').hide()
            recordset.module.field_by_full_name(n + '.合作公司').hide()
            recordset.module.field_by_full_name(n + '.验厂资质').hide()
            recordset.module.field_by_full_name(n + '.工厂证书').hide()
            recordset.module.field_by_full_name(n + '.首次合作').hide()
            recordset.module.field_by_full_name(n + '.是否专属').hide()
            recordset.module.field_by_full_name(n + '.联系人查看').hide()
        }
        recordset.refresh_ui()
    }).catch(err => {
        console.log(err)
        _.ui.message.error(err.msg)
    })
}
_.evts.on([_.evtids.RECORD_LOAD], suppliers_recordLoad, '潜在工厂')
_.evts.on([_.evtids.RECORD_LOAD], suppliers_recordLoad, '专业工厂')


// 子表记录删除前事件
const suppliers_table_delete_before = (evt_id, table, recordset) => {
    return new Promise((resolve, reject) => {
        if (table.group == '结算变更') {
            let rid = recordset.val('结算变更.rid')
            let new_rids = recordset.tables['结算变更'].new_rids
            if (recordset.val('结算变更.结算方式1') == '' || recordset.val('结算变更.zt') == '有' || new_rids.indexOf(rid) != -1 || _.user.username == 'zjnblh') {
                resolve()
                return
            }
            _.http.post("/api/saier/suppliers/jsfs/delete").then(res => {
                resolve()
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
                reject()
            })
        } else {
            resolve()
        }
    })
}
_.evts.on(_.evtids.RECORD_TABLE_BEFORE_DELETE, suppliers_table_delete_before, '专业工厂')


// 工厂报价添加更新出货数量按钮
const suppliers_zy_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '结算变更') {
        form.toolbar.add([{
            "name": 'update_supplier_jsfs_btn',
            "caption": '填充结算方式',
            "icon": 'any-server-update',
        }]);
    }
    if (form.group.value.name == '可修改人员') {
        form.toolbar.add([{
            "name": 'update_supplier_user_insert_btn',
            "caption": '添加',
            "icon": 'any-server-update',
        }, {
            "name": 'update_supplier_user_update_btn',
            "caption": '修改',
            "icon": 'any-server-update',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], suppliers_zy_EditorChildShow, '专业工厂')


function suppliers_table_new_before(evt_id, table, recordset) {
    return new Promise((resolve, reject) => {
        if (table.group != '结算变更') {
            resolve()
            return
        }
        if (recordset.tables['结算变更'].view_data.length > 4) {
            _.ui.message.error('结算变更记录不能超过5条')
            reject()
            return
        }
        resolve()
    })
}
_.evts.on([_.evtids.RECORD_TABLE_BEFORE_NEW, _.evtids.RECORD_TABLE_BEFORE_COPY], suppliers_table_new_before, '专业工厂')


function suppliers_table_new_after(evt_id, table, recordset) {
    if (table.group == '工厂评分') {
        recordset.val('工厂评分.厂商名称', recordset.val('厂商名称'));
        recordset.val('工厂评分.唯一编号', recordset.val('工厂评分.rid'));
        recordset.val('新建识别', '是')
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW, _.evtids.RECORD_TABLE_AFTER_COPY], suppliers_table_new_after, '专业工厂')


// 子表记录scroll事件
const suppliers_table_scroll = (evt_id, table, recordset) => {
    if (table.group == '工厂评分') {
        if (_.user.username == '陈妍科' || _.user.username == '侯柳红') {
            return
        }
        let rid = recordset.val('工厂评分.rid')
        let rids = recordset.tables['工厂评分'].new_rids
        let g = recordset.module.group_by_name('工厂评分')
        // console.log(g)
        if (rids.indexOf(rid) == -1) { // && _.user.admin==false){
            for (let f of g.fields) {
                recordset.module.field_by_full_name('专业工厂.工厂评分.' + f.name).disabled = true
            }
        } else {
            for (let g of _.model.get_module_by_name('专业工厂').groups) {
                if (g.name == table.group) {
                    for (let f of g.fields) {
                        if (f.readonly || f.disabled) {
                            continue
                        }
                        recordset.module.field_by_full_name('专业工厂.工厂评分.' + f.name).disabled = false
                    }
                    break
                }
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_TABLE_SCROLL, suppliers_table_scroll, '专业工厂')

// const suppliers_after_save = (evt_id, recordset) => {
//     if (recordset.val('综合评分') < 60) return
//     _.http.post("/api/saier/suppliers/save/after", {
//         gcpf: recordset.val('综合评分'),
//         cs_id: recordset.val('厂商编号')
//     }).then(res => {}).catch(res => {
//         _.ui.message.error(res.msg);
//         console.log(res);
//     })
// }
// _.evts.on(_.evtids.RECORD_BEFORE_SAVE, suppliers__save, '专业工厂')


const suppliers_audit_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        if (recordset.val('是否确认') == '否') {
            if (recordset.val('认证日期') != '' && recordset.val('认证日期') != null) {
                recordset.val('认证日期', '')
            }
        } else {
            if (recordset.val('认证日期') == '' || recordset.val('认证日期') == null) {
                recordset.val('认证日期', new Date().format('yyyy-MM-dd'))
            }
        }
        if (recordset.val('审核结果') != '') {
            if (recordset.val('审 核 人') == '') recordset.val('审 核 人', _.user.username)
            // if (recordset.val('审核日期') == '' || recordset.val('审核日期') == null) recordset.val('审核日期', new Date().format('yyyy-MM-dd'))
        }
        if (recordset.val('黑名单') == '是') {
            recordset.val('综合评分', 0)
            recordset.val('计算评分', 0)
            recordset.val('额外分值', 0)
            return resolve()
        }
        if (recordset.val('额外分值') > 60) {
            recordset.val('额外分值', 60)
            _.ui.message.error('额外分值不能大于60分，已自动调整为60分')
        }
        _.http.post('/api/saier/suppliers/save/before', {
            job: recordset.job,
            rid: recordset.rid,
            gcpf: recordset.val('综合评分'),
            cs_id: recordset.val('厂商编号'),
            cs_name: recordset.val('厂商名称'),
            module: recordset.module.name,
            kpgc: recordset.val('开票工厂'),
            splx: recordset.val('审批类型'),
            gclx: recordset.val('工厂类型'),
            // sqry: recordset.val('申请人员'),
            // rzsq: recordset.val('认证申请'),
            // sqrq: recordset.val('申请日期'),
        }).then(res => {
            let i = 0
            if (recordset.val('审批类型') != '认证申请') {
                let zhpf = recordset.val('额外分值') + res.data.hzdj1
                if (res.data.hzdj1 >= 60) {
                    zhpf = res.data.hzdj1
                    console.log('综合评分 c:', zhpf)
                } else if (res.data.hzdj1 < 60 && zhpf > 60) {
                    zhpf = 60
                    console.log('综合评分 b:', zhpf)
                }
                console.log('综合评分 a:', zhpf)
                recordset.val('综合评分', zhpf)
                resolve()
                return
            }
            if (recordset.val('黑名单') != '是') {
                if (recordset.val('综合评分') != 60) {
                    if (recordset.val('管理人数') == '1-5人') {
                        i = i + 5;
                    } else {
                        if ((recordset.val('管理人数') == '5-10人') || (recordset.val('管理人数') == '我司配合指定跟单人员')) {
                            i = i + 10;
                        }
                    }
                    if ((recordset.val('经营模式') == '加工型') || (recordset.val('经营模式') == '贸易型')) {
                        i = i + 5;
                    } else {
                        if ((recordset.val('经营模式') == '生产型') || (recordset.val('经营模式') == '工贸型')) {
                            i = i + 10;
                        }
                    }
                    if (recordset.val('厂房性质') == '租赁') {
                        i = i + 5
                    } else if (recordset.val('厂房性质') == '自有') {
                        i = i + 10;
                    }
                    if (recordset.val('销售方式') == '内销为主') {
                        i = i + 5;
                    } else {
                        if (recordset.val('销售方式') == '出口为主') {
                            i = i + 10;
                        } else if (recordset.val('销售方式') == '品牌经营') {
                            i = i + 15;
                        }
                    }
                    if ((recordset.val('主要市场').indexOf('北美') != -1) || (recordset.val('主要市场').indexOf('西欧') != -1)) {
                        i = i + 10;
                    } else {
                        if ((recordset.val('主要市场').indexOf('南美') != -1) || (recordset.val('主要市场').indexOf('中东') != -1) || (recordset.val('主要市场').indexOf('东欧') != -1) || (recordset.val('主要市场').indexOf('大洋洲') != -1)) {
                            i = i + 5;
                        }
                    }
                    if (recordset.val('年销售额') == '0-500万') {
                        i = i + 3;
                    } else if (recordset.val('年销售额') == '500-1000万') {
                        i = i + 5;
                    } else if (recordset.val('年销售额') == '1000-2000万') {
                        i = i + 10;
                    } else if (recordset.val('年销售额') == '2000万-5000万') {
                        i = i + 15;
                    } else if (recordset.val('年销售额') == '5000万以上') {
                        i = i + 20;
                    }
                    if ((recordset.val('配套资源').indexOf('设计研发') != -1 || (recordset.val('配套资源').indexOf('模具制造') != -1) || (recordset.val('配套资源').indexOf('原料生产') != -1) || (recordset.val('配套资源').indexOf('印染能力') != -1))) {
                        i = i + 10;
                    } else if ((recordset.val('配套资源').indexOf('来样加工') != -1) || (recordset.val('配套资源').indexOf('来图加工') != -1)) {
                        i = i + 5;
                    }
                    if (recordset.val('企业认证') != '') {
                        i = i + 10;
                    }
                    if (recordset.val('工厂环境') == '整洁') {
                        i = i + 5;
                    } else if (recordset.val('工厂环境') == '一般') {
                        i = i + 3;
                    }
                    if (recordset.val('交 货 期') == '准时') {
                        i = i + 15;
                    } else if (recordset.val('交 货 期') == '偶然有延期') {
                        i = i - 5;
                    } else if (recordset.val('交 货 期') == '延期') {
                        i = i - 10
                    }
                    if (res.data.gcsh == 1) {
                        if (recordset.val('额外分值') > 0) {
                            if (recordset.val('工厂属性') == '一般纳税人') {
                                recordset.val('额外分值', 0)
                            }
                        } else if (recordset.val('额外分值') < -10) {
                            recordset.val('额外分值', -10)
                        }
                    }
                    i = i + recordset.val('额外分值')
                    if (i == 60) {
                        i = i + 1
                    }
                    recordset.val('计算评分', i)
                    recordset.val('综合评分', i)
                } else {
                    i = 60
                    if (recordset.val('交 货 期') == '准时') {
                        i = i + 15
                    } else if (recordset.val('交 货 期') == '偶然有延期') {
                        i = i - 5
                    } else if (recordset.val('交 货 期') == '延期') {
                        i = i - 10
                    }
                    recordset.val('计算评分', i)
                    recordset.val('综合评分', i)
                }
            }
            resolve();
        }).catch(res => {
            reject(res.msg);
            console.log(res)
        })
    })
}
_.evts.on(_.evtids.RECORD_BEFORE_SAVE, suppliers_audit_before_save, '工厂审批')


const suppliers_audit_after_save = (evt_id, recordset) => {
    let splx = recordset.val('审批类型')
    let spjg = recordset.val('审核结果')
    let sfqr = recordset.val('是否确认')
    let rzry = recordset.val('认证人员')
    let bpyy = recordset.val('不批原因')
    let status = 1
    if (splx == '加分申请') {
        if (sfqr == '' && (recordset.val('审批用户').indexOf(_.user.username) != -1)) {
            return
        }
    } else if (splx == '认证申请') {
        if (recordset.val('wf_unit') == '审批处理' && (rzry == '' || recordset.val('审批用户').includes(_.user.username) == false)) {
            return
        } else if (recordset.val('wf_unit') == '认证人员' && (rzry != _.user.username || recordset.val('是否确认') != '是')) {
            return
        }
        // if ((sfqr == '' || sfqr == '否') && recordset.val('认证人员') == _.user.username && recordset.val('wf_unit') == '认证人员') {
        //     return
        // }
    }
    _.http.post('/api/saier/audit/save/after', {
        rid: recordset.val('rid'),
        module: recordset.module.name,
    }).then(r => {
        console.log(r)
        if (r.code == 0) {
            return
        }
        let d = r.data
        _.http.post('/api/workflow/task/flow', {
            instance: d.instance_rid,
            status: status,
            task_id: d.task_rid,
            memo: bpyy
        }).then(res => {
            if (recordset.val('wf_unit') == '审批处理' && recordset.val('认证申请') == recordset.val('认证人员')) {
                // recordset.val('wf_unit', '认证人员')
                // recordset.module.field_by_full_name('工厂审批.是否确认').disabled = false
            }
        }).catch(res => {
            _.ui.message.error(res.msg);
            console.log(res);
        })
    }).catch(r => {
        _.ui.message.error(r.msg);
        console.log(r);
    })
}
// _.evts.on(_.evtids.RECORD_AFTER_SAVE, suppliers_audit_after_save, '工厂审批')

// const suppliers_audit_before_flow = (evt_id, data, status) => {
//     return new Promise((resolve, reject) => {
//         let module = data.module
//         let rid = data.record_id
//         let unit = data.unit
//         if (status == 2) {
//             return resolve()
//         }
//         _.http.post('/api/saier/suppliers/audit/flow/before', {
//             rid: rid,
//             module: module,
//             status: status,
//             unit: unit
//         }).then(r => {
//             resolve()
//             return
//         }).catch(r => {
//             // _.ui.message.error();
//             console.log(r);
//             reject(r.msg)
//             return
//         })
//     })
// }
// _.evts.on(_.evtids.WORKFLOW_BEFORE_FLOW, suppliers_audit_before_flow, '工厂审批')


const suppliers_audit_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value
    } = opts;
    let m = module.name
    if (field.full_name == m + '.额外分值') {
        let r = recordset.val('额外分值')
        if (r != 0) {
            _.http.post('/api/saier/suppliers/get/rate').then(res => {
                let q = recordset.val('计算评分')
                if (res.data == 1) {
                    if (recordset.val('额外分值') > 0) {
                        if (recordset.val('工厂属性') == '一般纳税人') {
                            recordset.val('额外分值', 0)
                        }
                    } else {
                        if (recordset.val('额外分值') < -10) {
                            recordset.val('额外分值', -10)
                        }
                    }
                } else {
                    // recordset.val('额外分值', 0)
                }
                if (q + recordset.val('额外分值') > 100) {
                    recordset.val('综合评分', 100)
                } else {
                    recordset.val('综合评分', q + recordset.val('额外分值'))
                }
            }).catch(res => {
                console.log(res)
                _.ui.message.error(res.msg)
            })
        }
    }
    if (field.full_name == m + '.审核结果') {
        if (value == '不通过') {
            _.ui.show_input_dialog('请输入不批原因', '').then(res => {
                recordset.val('不批原因', res)
            })
        } else if (value == '通过' && recordset.val('额外分值') == 0) {
            if (recordset.val('计算评分') < 60) {
                recordset.val('额外分值', 60 - recordset.val('计算评分'))
                recordset.val('综合评分', 60)
            } else {
                recordset.val('额外分值', recordset.val('计算评分') - 60)
                recordset.val('综合评分', recordset.val('计算评分'))
            }
        }
    }
    if (field.full_name == m + '.认证人员') {
        if (recordset.val('wf_unit') == '认证人员' || (recordset.val('认证人员') == _.user.username && recordset.val('wf_unit') == '审批处理')) {
            recordset.module.field_by_full_name(m + '.是否确认').disabled = false
        } else {
            recordset.module.field_by_full_name(m + '.是否确认').disabled = true
        }
        if (recordset.val('认证人员') != '') {
            recordset.module.field_by_full_name(m + '.经营地址').disabled = false
            recordset.module.field_by_full_name(m + '.管理人数').disabled = false
            recordset.module.field_by_full_name(m + '.员工人数').disabled = false
            recordset.module.field_by_full_name(m + '.设备数量').disabled = false
            recordset.module.field_by_full_name(m + '.经营模式').disabled = false
            recordset.module.field_by_full_name(m + '.厂房面积').disabled = false
            recordset.module.field_by_full_name(m + '.主营产品').disabled = false
            recordset.module.field_by_full_name(m + '.主营行业').disabled = false
            recordset.module.field_by_full_name(m + '.主要市场').disabled = false
            recordset.module.field_by_full_name(m + '.销售方式').disabled = false
            recordset.module.field_by_full_name(m + '.年销售额').disabled = false
            recordset.module.field_by_full_name(m + '.价格区间').disabled = false
            recordset.module.field_by_full_name(m + '.客户群体').disabled = false
            recordset.module.field_by_full_name(m + '.月 产 量').disabled = false
            recordset.module.field_by_full_name(m + '.最高月产量').disabled = false
            recordset.module.field_by_full_name(m + '.日平均产量').disabled = false
            recordset.module.field_by_full_name(m + '.品牌名称').disabled = false
            recordset.module.field_by_full_name(m + '.工厂环境').disabled = false
            recordset.module.field_by_full_name(m + '.配套资源').disabled = false
            // recordset.module.field_by_full_name(m + '.交 货 期').disabled = true;
            recordset.module.field_by_full_name(m + '.验厂信息').disabled = false
            recordset.module.field_by_full_name(m + '.意见建议').disabled = false
            recordset.module.field_by_full_name(m + '.企业认证').disabled = false
        } else {
            recordset.module.field_by_full_name(m + '.厂房性质').disabled = true
            recordset.module.field_by_full_name(m + '.经营地址').disabled = true
            recordset.module.field_by_full_name(m + '.管理人数').disabled = true
            recordset.module.field_by_full_name(m + '.员工人数').disabled = true
            recordset.module.field_by_full_name(m + '.设备数量').disabled = true
            recordset.module.field_by_full_name(m + '.经营模式').disabled = true
            recordset.module.field_by_full_name(m + '.厂房面积').disabled = true
            recordset.module.field_by_full_name(m + '.主营产品').disabled = true
            recordset.module.field_by_full_name(m + '.主营行业').disabled = true
            recordset.module.field_by_full_name(m + '.主要市场').disabled = true
            recordset.module.field_by_full_name(m + '.销售方式').disabled = true
            recordset.module.field_by_full_name(m + '.年销售额').disabled = true
            recordset.module.field_by_full_name(m + '.价格区间').disabled = true
            recordset.module.field_by_full_name(m + '.客户群体').disabled = true
            recordset.module.field_by_full_name(m + '.月 产 量').disabled = true
            recordset.module.field_by_full_name(m + '.最高月产量').disabled = true
            recordset.module.field_by_full_name(m + '.日平均产量').disabled = true
            recordset.module.field_by_full_name(m + '.品牌名称').disabled = true
            recordset.module.field_by_full_name(m + '.工厂环境').disabled = true
            recordset.module.field_by_full_name(m + '.配套资源').disabled = true
            // recordset.module.field_by_full_name(m + '.交 货 期').disabled = true;
            recordset.module.field_by_full_name(m + '.验厂信息').disabled = true
            recordset.module.field_by_full_name(m + '.意见建议').disabled = true
            recordset.module.field_by_full_name(m + '.是否确认').disabled = true
            recordset.module.field_by_full_name(m + '.企业认证').disabled = true
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, suppliers_audit_field_change, '工厂审批')


// 编辑界面数据加载以后执行
const suppliers_audit_recordLoad = (evt_id, recordset) => {
    let m = recordset.module.name;
    if (recordset.val('是否确认') != '是' && (recordset.val('认证人员') == _.user.username)) {
        recordset.module.field_by_full_name(m + '.经营地址').disabled = false
        recordset.module.field_by_full_name(m + '.管理人数').disabled = false
        recordset.module.field_by_full_name(m + '.员工人数').disabled = false
        recordset.module.field_by_full_name(m + '.设备数量').disabled = false
        recordset.module.field_by_full_name(m + '.经营模式').disabled = false
        recordset.module.field_by_full_name(m + '.厂房面积').disabled = false
        recordset.module.field_by_full_name(m + '.主营产品').disabled = false
        recordset.module.field_by_full_name(m + '.主营行业').disabled = false
        recordset.module.field_by_full_name(m + '.主要市场').disabled = false
        recordset.module.field_by_full_name(m + '.销售方式').disabled = false
        recordset.module.field_by_full_name(m + '.年销售额').disabled = false
        recordset.module.field_by_full_name(m + '.价格区间').disabled = false
        recordset.module.field_by_full_name(m + '.客户群体').disabled = false
        recordset.module.field_by_full_name(m + '.月 产 量').disabled = false
        recordset.module.field_by_full_name(m + '.最高月产量').disabled = false
        recordset.module.field_by_full_name(m + '.日平均产量').disabled = false
        recordset.module.field_by_full_name(m + '.品牌名称').disabled = false
        recordset.module.field_by_full_name(m + '.工厂环境').disabled = false
        recordset.module.field_by_full_name(m + '.配套资源').disabled = false
        // recordset.module.field_by_full_name(m + '.交 货 期').disabled = true;
        recordset.module.field_by_full_name(m + '.验厂信息').disabled = false
        recordset.module.field_by_full_name(m + '.意见建议').disabled = false
        recordset.module.field_by_full_name(m + '.企业认证').disabled = false
    } else {
        recordset.module.field_by_full_name(m + '.厂房性质').disabled = true
        recordset.module.field_by_full_name(m + '.经营地址').disabled = true
        recordset.module.field_by_full_name(m + '.管理人数').disabled = true
        recordset.module.field_by_full_name(m + '.员工人数').disabled = true
        recordset.module.field_by_full_name(m + '.设备数量').disabled = true
        recordset.module.field_by_full_name(m + '.经营模式').disabled = true
        recordset.module.field_by_full_name(m + '.厂房面积').disabled = true
        recordset.module.field_by_full_name(m + '.主营产品').disabled = true
        recordset.module.field_by_full_name(m + '.主营行业').disabled = true
        recordset.module.field_by_full_name(m + '.主要市场').disabled = true
        recordset.module.field_by_full_name(m + '.销售方式').disabled = true
        recordset.module.field_by_full_name(m + '.年销售额').disabled = true
        recordset.module.field_by_full_name(m + '.价格区间').disabled = true
        recordset.module.field_by_full_name(m + '.客户群体').disabled = true
        recordset.module.field_by_full_name(m + '.月 产 量').disabled = true
        recordset.module.field_by_full_name(m + '.最高月产量').disabled = true
        recordset.module.field_by_full_name(m + '.日平均产量').disabled = true
        recordset.module.field_by_full_name(m + '.品牌名称').disabled = true
        recordset.module.field_by_full_name(m + '.工厂环境').disabled = true
        recordset.module.field_by_full_name(m + '.配套资源').disabled = true
        // recordset.module.field_by_full_name(m + '.交 货 期').disabled = true;
        recordset.module.field_by_full_name(m + '.验厂信息').disabled = true
        recordset.module.field_by_full_name(m + '.意见建议').disabled = true
        recordset.module.field_by_full_name(m + '.是否确认').disabled = true
        recordset.module.field_by_full_name(m + '.企业认证').disabled = true
    }
    recordset.module.field_by_full_name(m + '.额外分值').disabled = !(recordset.val('审批类型') == '加分申请')
    if (recordset.val('审批类型') == '加分申请') {
        recordset.module.field_by_full_name(m + '.审核结果').show()
        recordset.module.field_by_full_name(m + '.不批原因').show()
        recordset.module.field_by_full_name(m + '.审 核 人').show()
        recordset.module.field_by_full_name(m + '.认证日期').hide()
        recordset.module.field_by_full_name(m + '.认证人员').hide()
        recordset.module.field_by_full_name(m + '.是否确认').hide()
        recordset.module.field_by_full_name(m + '.认证人员').show()
        recordset.module.field_by_full_name(m + '.审核结果').readonly = false
        recordset.module.field_by_full_name(m + '.审核结果').disabled = false
        recordset.module.field_by_full_name(m + '.认证人员').disabled = true
    } else {
        if (recordset.val('wf_unit') == '认证人员' || (recordset.val('认证人员') == _.user.username && recordset.val('wf_unit') == '审批处理')) {
            recordset.module.field_by_full_name(m + '.是否确认').disabled = false
        } else {
            recordset.module.field_by_full_name(m + '.是否确认').disabled = true
        }
        recordset.module.field_by_full_name(m + '.审核结果').hide()
        recordset.module.field_by_full_name(m + '.不批原因').hide()
        recordset.module.field_by_full_name(m + '.审 核 人').hide()
        recordset.module.field_by_full_name(m + '.计算评分').hide()
        recordset.module.field_by_full_name(m + '.认证日期').show()
        recordset.module.field_by_full_name(m + '.认证人员').show()
        recordset.module.field_by_full_name(m + '.审核结果').disabled = true
        recordset.module.field_by_full_name(m + '.审核结果').readonly = true
    }
    if (recordset.val('审批类型') == '加分申请') {
        recordset.module.field_by_full_name(m + '.生产管理').disabled = true
        recordset.module.field_by_full_name(m + '.经营地址').disabled = true
        recordset.module.field_by_full_name(m + '.管理人数').disabled = true
        recordset.module.field_by_full_name(m + '.员工人数').disabled = true
        recordset.module.field_by_full_name(m + '.设备数量').disabled = true
        recordset.module.field_by_full_name(m + '.经营模式').disabled = true
        recordset.module.field_by_full_name(m + '.厂房面积').disabled = true
        recordset.module.field_by_full_name(m + '.主营产品').disabled = true
        recordset.module.field_by_full_name(m + '.主营行业').disabled = true
        recordset.module.field_by_full_name(m + '.主要市场').disabled = true
        recordset.module.field_by_full_name(m + '.销售方式').disabled = true
        recordset.module.field_by_full_name(m + '.年销售额').disabled = true
        recordset.module.field_by_full_name(m + '.价格区间').disabled = true
        recordset.module.field_by_full_name(m + '.客户群体').disabled = true
        recordset.module.field_by_full_name(m + '.月 产 量').disabled = true
        recordset.module.field_by_full_name(m + '.最高月产量').disabled = true
        recordset.module.field_by_full_name(m + '.日平均产量').disabled = true
        recordset.module.field_by_full_name(m + '.品牌名称').disabled = true
        recordset.module.field_by_full_name(m + '.工厂环境').disabled = true
        recordset.module.field_by_full_name(m + '.配套资源').disabled = true
        recordset.module.field_by_full_name(m + '.交 货 期').disabled = true
        recordset.module.field_by_full_name(m + '.验厂信息').disabled = true
        recordset.module.field_by_full_name(m + '.意见建议').disabled = true
        recordset.module.field_by_full_name(m + '.企业认证').disabled = true
    }
}
_.evts.on([_.evtids.RECORD_LOAD], suppliers_audit_recordLoad, '工厂审批')

// const suppliers_audit_before_show = (evt_id, module,job) => {
//     return new Promise((resolve, reject) => {
//         console.log(module)
//         console.log(job)
//         if (module.name=='工厂审批'){
//             reject()
//             let rid = job.rid
//             console.log(rid)
//             console.log('写自己的代码')
//             return
//         }
//         resolve()
//     })
// }
// _.evts.on(_.evtids.MODULE_EDITOR_BEFORE_SHOW, suppliers_audit_before_show)


const suppliers_after_save = (evt_id, recordset) => {
    // if (recordset.val('综合评分') < 60) return
    // _.http.post("/api/saier/suppliers/save/after", {
    //     gcpf: recordset.val('综合评分'),
    //     cs_id: recordset.val('厂商编号')
    // }).then(res => {}).catch(res => {
    //     _.ui.message.error(res.msg);
    //     console.log(res);
    // })
    if (recordset.val('认证申请') == '' || recordset.val('认证申请') == null || recordset.val('申请人员') != _.user.username || recordset.val('申请人员') == '') {
        return
    }
    _.http.post('/api/saier/suppliers/save/check',{
        cs_id: recordset.val('厂商编号'),
        sqry: recordset.val('申请人员'),
        rzsq: recordset.val('认证申请'),
    }).then(r => {
        _.ui.confirm('要提交认证申请吗？').then(() => {
            _.http.post('/api/saier/workflow/start', {
                rid: recordset.val('rid'),
                module: recordset.module.name,
                kind: '认证申请'
            }).then(res => {
                _.platform.active.reload_data()
            }).catch(res => {
                _.ui.message.error(res.msg);
                console.log(res);
            });
        })
    }).catch(e=>{
        console.log(e)
        _.ui.message.error(e.msg)
    })

}
_.evts.on(_.evtids.RECORD_AFTER_SAVE, suppliers_after_save, '潜在工厂')
_.evts.on(_.evtids.RECORD_AFTER_SAVE, suppliers_after_save, '专业工厂')