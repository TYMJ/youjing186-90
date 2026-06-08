/* 出货接单统计 相关按钮 */

// 起始日期联动：年份减1生成起始日期1（Pascal: copy(year,1,4)-1 + copy(rest,5,10)）
const calcStartDate1 = (recordset, rq) => {
    const dateStr = String(rq || '').trim()
    if (!dateStr) return
    const year = dateStr.substring(0, 4)
    const rest = dateStr.substring(4)
    const yearNum = parseInt(year, 10)
    if (!isNaN(yearNum)) {
        recordset.val('起始日期1', String(yearNum - 1) + rest)
    }
}

// 结束日期联动：年份减1生成结束日期1，平年2/28自动转闰年2/29
const calcEndDate1 = (recordset, rq) => {
    const dateStr = String(rq || '').trim()
    if (!dateStr) return
    const year = dateStr.substring(0, 4)
    let rest = dateStr.substring(4)
    const yearNum = parseInt(year, 10)
    if (isNaN(yearNum)) return

    // Pascal: If rq1='-02-28' Then rq1 := '-02-29'
    if (rest === '-02-28') {
        rest = '-02-29'
    }

    recordset.val('结束日期1', String(yearNum - 1) + rest)
}

// 公司统计变化时联动部门字段启用状态（Pascal: 公司统计.pas）
const applyCompanyStatDeptState = (recordset, companyStat) => {
    const gstj = String(companyStat || '').trim()
    // Pascal: 公司统计<>'是' 则 部门.enabled=true；='是' 则禁用部门
    recordset.module.field_by_full_name('部门').disabled = (gstj === '是')
}

// 字段变化事件处理
const shipment_order_statistics_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value,
        current_record
    } = opts;
    let n = module.name

    // 起始日期变化时，自动计算起始日期1
    if (field.full_name === n + '.起始日期') {
        calcStartDate1(recordset, value)
    }

    // 结束日期变化时，自动计算结束日期1
    if (field.full_name === n + '.结束日期') {
        calcEndDate1(recordset, value)
    }

    // 公司统计变化时联动部门字段（Pascal: 公司统计.pas）
    if (field.full_name === n + '.公司统计') {
        applyCompanyStatDeptState(recordset, value)
    }

    // 部门判断：部门字段变化时校验权限
    if (field.full_name === n + '.部 门') {
        const dept = String(value || '').trim()
        if (!dept) return

        _.http.post('/api/saier/shipment_order_statistics/dept/change', {
            dept: dept,
            tjry: recordset.val('统计人员')
        }).then(res => {
            // 异常分支
            if (res.code === -1) {
                recordset.val('部 门', '')
                return
            }
            // 无权限分支：清空部门并提示（Pascal 原逻辑：ShowError + 清空字段）
            if (res.data && res.data.clear_dept === 1) {
                _.ui.message.error(res.msg || '不好意思,此组不在您的部门,请重新选择,谢谢!')
                recordset.val('部 门', '')
            }
        }).catch(err => {
            recordset.val('部 门', '')
        })
    }
}

// 记录加载事件处理：初始化字段状态（新样识别）
const shipment_order_statistics_record_load = (evt_id, recordset) => {
    // 日期字段初始化（Pascal: 记录加载时同样计算）
    calcStartDate1(recordset, recordset.val('起始日期'))
    calcEndDate1(recordset, recordset.val('结束日期'))

    const dept = recordset.val('部 门') || ''

    _.http.post('/api/saier/shipment_order_statistics/load/check', {
        dept: dept
    }).then(res => {
        if (res.code !== 1) return
        const data = res.data || {}

        // 公司统计字段初始化赋值（Pascal: setfielddataasstring）
        if (data.gstj_default !== undefined) {
            recordset.val('公司统计', data.gstj_default)
        }

        // 字段启用/禁用控制（Pascal: enabled = true/false）
        // WhaleCloud 用 disabled，与 enabled 相反
        if (data.gstj_disabled !== undefined) {
            recordset.module.field_by_full_name('公司统计').disabled = data.gstj_disabled
        }
        if (data.dept_disabled !== undefined) {
            recordset.module.field_by_full_name('部门').disabled = data.dept_disabled
        } else {
            // 加载后按当前公司统计值同步部门状态（Pascal: 公司统计.pas）
            applyCompanyStatDeptState(recordset, recordset.val('公司统计'))
        }
    })
}

// 子表回填
const fillSubTables = async (recordset, data) => {
    // 1. 对照表
    const dzTable = recordset.tables['对照表']
    if (dzTable) {
        dzTable.clear()
        const rows = data.duizhao || []
        for (let row of rows) {
            await dzTable.append()
            const nr = dzTable.view_data[dzTable.view_data.length - 1]
            nr.val('序  号', row.seq)
            nr.val('统计月份', row.tjyf)
            nr.val('客  户', row.customer)
            nr.val('港口名称', row.gkmc)
            nr.val('出货金额', row.chje)
            nr.val('含佣出货金额', row.hychje)
            nr.val('接单金额', row.jdje)
            nr.val('采购RMB', row.cgrmb)
            nr.val('出货总额', row.chze)
            nr.val('接单总额', row.jdze)
            nr.val('出货客人RMB', row.chkh_rmb)
            nr.val('出货$', row.ch_usd)
            nr.val('含佣接单金额', row.hyjdje)
            nr.val('含佣出货总额', row.hychze)
            nr.val('含佣接单总额', row.hyjdze)
            nr.val('含佣出货客人RMB', row.hychkh_rmb)
            nr.val('含佣出货$', row.hych_usd)
            nr.val('退税合计', row.tshj)
            nr.val('费用合计', row.fyhj)
            nr.val('保费合计', row.bfhj)
            nr.val('毛利合计', row.mlhj)
            nr.val('毛 利 率', row.mll)
            nr.val('预下单柜数', row.yxdgs)
            nr.val('预下单立方', row.yxdlf)
            nr.val('出货柜数', row.chgs)
            nr.val('出货立方', row.chlf)
        }
    }

    // 2. 出货产品统计表
    const chcpTable = recordset.tables['出货产品统计表']
    if (chcpTable) {
        chcpTable.clear()
        const rows = data.chuhuo_product || []
        for (let row of rows) {
            await chcpTable.append()
            const nr = chcpTable.view_data[chcpTable.view_data.length - 1]
            nr.val('下 单 数', row.xds)
            nr.val('产品大类', row.cpfl1)
            nr.val('一级分类', row.yjfl)
            nr.val('二级分类', row.ejfl)
            nr.val('外销总价', row.wxzj)
            nr.val('出货数量', row.chsl)
            nr.val('产品编号', row.zycpbh)
            nr.val('客户货号', row.khhh)
            nr.val('中文品名', row.zwpm)
            nr.val('英文品名', row.ywpm)
            nr.val('产品来源', row.chly)
            nr.val('返 单 数', row.fds1)
            nr.val('询 价 数', row.xjs1)
            nr.val('采购推荐', row.cgtj1)
            nr.val('外销推荐', row.wxtj1)
            nr.val('客户自选', row.khzx1)
            nr.val('样品录入', row.yplr1)
            nr.val('含佣外销总价', row.hywxzj)
        }
    }

    // 3. 下单产品情况表
    const xdcpTable = recordset.tables['下单产品情况表']
    if (xdcpTable) {
        xdcpTable.clear()
        const rows = data.xiadan_product || []
        for (let row of rows) {
            await xdcpTable.append()
            const nr = xdcpTable.view_data[xdcpTable.view_data.length - 1]
            nr.val('产品大类', row.cpfl1)
            nr.val('一级分类', row.yjfl)
            nr.val('二级分类', row.ejfl)
            nr.val('外销总价', row.wxzj)
            nr.val('下单数量', row.chsl)
            nr.val('产品编号', row.zycpbh)
            nr.val('客户货号', row.khhh)
            nr.val('中文品名', row.zwpm)
            nr.val('英文品名', row.ywpm)
            nr.val('产品来源', row.xdly)
            nr.val('含佣外销总价', row.hywxzj)
        }
    }

    // 4. 出货类别统计
    const chlbTable = recordset.tables['出货类别统计']
    if (chlbTable) {
        chlbTable.clear()
        const rows = data.chuhuo_category || []
        for (let row of rows) {
            await chlbTable.append()
            const nr = chlbTable.view_data[chlbTable.view_data.length - 1]
            nr.val('下 单 数', row.xds)
            nr.val('产品大类', row.cpfl1)
            nr.val('一级分类', row.yjfl)
            nr.val('二级分类', row.ejfl)
            nr.val('外销总价', row.wxzj)
            nr.val('含佣外销总价', row.hywxzj)
            nr.val('出货数量', row.chsl)
            nr.val('种类个数', row.m)
            nr.val('所占比率%', row.zbl)
            nr.val('返 单 数', row.fds1)
            nr.val('询 价 数', row.xjs1)
            nr.val('采购推荐', row.cgtj1)
            nr.val('外销推荐', row.wxtj1)
            nr.val('客户自选', row.khzx1)
            nr.val('样品录入', row.yplr1)
        }
    }

    // 5. 下单产品统计表
    const xdtjTable = recordset.tables['下单产品统计表']
    if (xdtjTable) {
        xdtjTable.clear()
        const rows = data.xiadan_stats || []
        for (let row of rows) {
            await xdtjTable.append()
            const nr = xdtjTable.view_data[xdtjTable.view_data.length - 1]
            nr.val('下 单 数', row.xds)
            nr.val('产品大类', row.cpfl1)
            nr.val('一级分类', row.yjfl)
            nr.val('二级分类', row.ejfl)
            nr.val('外销总价', row.wxzj)
            nr.val('合同数量', row.chsl)
            nr.val('返 单 数', row.fds)
            nr.val('询 价 数', row.xjs)
            nr.val('采购推荐', row.cgtj)
            nr.val('外销推荐', row.wxtj)
            nr.val('客户自选', row.khzx)
            nr.val('样品录入', row.yplr)
            nr.val('寄样数量', row.jycp)
            nr.val('种类个数', row.cpbh2)
            nr.val('含佣外销总价', row.hywxzj)
        }
    }

    // 6. 前下单产品统计表
    const qxdtjTable = recordset.tables['前下单产品统计表']
    if (qxdtjTable) {
        qxdtjTable.clear()
        const rows = data.qian_xiadan_stats || []
        for (let row of rows) {
            await qxdtjTable.append()
            const nr = qxdtjTable.view_data[qxdtjTable.view_data.length - 1]
            nr.val('下 单 数', row.xds)
            nr.val('产品大类', row.cpfl1)
            nr.val('一级分类', row.yjfl)
            nr.val('二级分类', row.ejfl)
            nr.val('外销总价', row.wxzj)
            nr.val('合同数量', row.chsl)
            nr.val('返 单 数', row.fds)
            nr.val('询 价 数', row.xjs)
            nr.val('采购推荐', row.cgtj)
            nr.val('外销推荐', row.wxtj)
            nr.val('客户自选', row.khzx)
            nr.val('样品录入', row.yplr)
            nr.val('寄样数量', row.jycp)
            nr.val('种类个数', row.cpbh2)
            nr.val('含佣外销总价', row.hywxzj)
        }
    }
}

// 清空主表合计字段（Pascal: 统计开始时初始化所有合计字段为0）
const clearSummaryFields = (recordset) => {
    // 出货合计
    const chuhuoFields = [
        '出货金额', '出货数量', '下 单 数', '返 单 数', '询 价 数',
        '采购推荐', '外销推荐', '客户自选', '样品录入',
        '出货总额', '出货次数', '出货种类', '含佣出货金额', '含佣出货总额'
    ]
    for (let f of chuhuoFields) {
        recordset.val(f, 0)
    }

    // 接单合计
    const jiedanFields = [
        '接单总额', '接单数量', '下单数', '返单数', '询价数',
        '采购推', '外销推', '客户选', '样品选', '寄样数量',
        '老产品比重', '客人赔款', '工厂赔款', '含佣接单总额'
    ]
    for (let f of jiedanFields) {
        recordset.val(f, 0)
    }

    // 前接单合计
    const qianJiedanFields = [
        '前接单总额', '前接单数量', '前下单数', '前返单数', '前询价数',
        '前采购推', '前外销推', '前客户选', '前样品选', '前寄样数量',
        '前老产品比重', '含佣前接单总额'
    ]
    for (let f of qianJiedanFields) {
        recordset.val(f, 0)
    }

    // 其他费用
    recordset.val('RMB费用', 0)
    recordset.val('USD费用', 0)
}

// 统计操作主函数
const doStatistics = (recordset, moduleName) => {
    const qsrq = String(recordset.val('起始日期') || '').trim()
    const jsrq = String(recordset.val('结束日期') || '').trim()
    if (!qsrq || !jsrq) {
        _.ui.message.error('请先填写起始日期和结束日期')
        return
    }

    const dept = String(recordset.val('部 门') || '').trim()
    const companyStat = String(recordset.val('公司统计') || '').trim()
    if (!dept && companyStat !== '是') {
        _.ui.message.error('请先选择部门或勾选公司统计')
        return
    }

    let sjcy = 'sjcy'
    let sjcy1 = 'sjcy1'

    const doCall = () => {
        // Pascal: 统计前先清空所有合计字段为0
        clearSummaryFields(recordset)

        _.ui.loading.show({ text: '正在统计...' })

        _.http.post('/api/saier/shipment_order_statistics/do_statistics', {
            qsrq: qsrq,
            jsrq: jsrq,
            qsrq1: recordset.val('起始日期1') || '',
            jsrq1: recordset.val('结束日期1') || '',
            dept: dept,
            company_stat: companyStat,
            customer: recordset.val('客户名称') || '',
            gykr: recordset.val('公用客人') || '',
            stat_type: recordset.val('统计方式') || '金额',
            tjws: recordset.val('统计位数') || 0,
            hl: recordset.val('汇率') || 0,
            sjcy: sjcy,
            sjcy1: sjcy1
        }).then(res => {
            _.ui.loading.hide()
            if (res.code !== 1) {
                _.ui.message.error(res.msg || '统计失败')
                return
            }

            const data = res.data || {}

            // 回填出货合计
            const ch = data.summary && data.summary.chuhuo || {}
            recordset.val('出货总额', ch.chze || 0)
            recordset.val('含佣出货总额', ch.hychze || 0)
            recordset.val('出货次数', ch.chzs || 0)
            recordset.val('出货种类', ch.xdzs || 0)

            // 回填接单合计
            const jd = data.summary && data.summary.jiedan || {}
            recordset.val('客人赔款', jd.kfpk || 0)
            recordset.val('工厂赔款', jd.gcpk || 0)

            // 回填其他费用
            const qt = data.summary && data.summary.qita || {}
            recordset.val('RMB费用', qt.rmb_fy || 0)
            recordset.val('USD费用', qt.usd_fy || 0)

            // 子表回填
            fillSubTables(recordset, data)

        }).catch(err => {
            _.ui.loading.hide()
            _.ui.message.error('统计请求失败')
        })
    }

    // Pascal: 玩具/景驰/爱马士 部门需弹窗选择实际出运/预计出运
    if (dept.indexOf('玩具') >= 0 || dept.indexOf('景驰') >= 0 || dept.indexOf('爱马士') >= 0) {
        _.ui.show_input_dialog('请输入要查询条件：1为实际出运，2为预计出运，默认为1', '1').then(val => {
            if (val === '2') {
                sjcy = 'chyrq'
                sjcy1 = 'chyrq'
            }
            doCall()
        }).catch(() => {})
    } else {
        doCall()
    }
}

// 编辑界面显示时注册统计按钮
const shipment_order_statistics_editor_show = (evt_id, form) => {
    form.toolbar.insert([{
        name: 'btn_statistics',
        caption: '统计',
        icon: '#ai3-statistics'
    }, {
        name: 'btn_order_shipment_export',
        caption: '下单出货数据表',
        icon: 'any-keyborad'
    }, {
        name: 'btn_other_customer_export',
        caption: '其他客人统计表',
        icon: 'any-keyborad'
    }], 'close')
}

// 导出报表下载（模式B：data 为文件名字符串）
const downloadExportFile = (res, defaultName) => {
    if (res.code !== 1) {
        _.ui.message.error(res.msg || '导出失败')
        return
    }
    const fileName = String((res && res.data) || '').trim()
    if (!fileName) {
        _.ui.message.error('无可下载文件')
        return
    }
    _.http.download('/api/tmp/file/get', { file: fileName }, fileName || defaultName)
}

// 工具栏按钮点击
const shipment_order_statistics_toolbar_click = (evt_id, btn, form) => {
    if (btn.name === 'btn_statistics') {
        doStatistics(form.recordset, form.module.name)
        return
    }
    if (btn.name === 'btn_order_shipment_export') {
        const rid = String(form.recordset.rid || form.current_rid?.value || '').trim()
        if (!rid) {
            _.ui.message.error('请先保存统计记录后再导出')
            return
        }
        _.ui.loading.show({ text: '正在导出报表...' })
        _.http.post('/api/saier/shipment_order_statistics/order_shipment/export', {
            rid: rid
        }).then(res => {
            _.ui.loading.hide()
            downloadExportFile(res, '下单出货数据表.xlsx')
        }).catch(err => {
            _.ui.loading.hide()
            _.ui.message.error((err && err.msg) || '导出请求失败')
        })
        return
    }
    if (btn.name === 'btn_other_customer_export') {
        const rid = String(form.recordset.rid || form.current_rid?.value || '').trim()
        const dept = String(form.recordset.val('部 门') || '').trim()
        const hl = parseFloat(form.recordset.val('汇率') || 0)
        if (!rid) {
            _.ui.message.error('请先保存统计记录后再导出')
            return
        }
        if (!dept) {
            _.ui.message.error('请先填写部门')
            return
        }
        if (!(hl > 0)) {
            _.ui.message.error('请先填写汇率')
            return
        }
        // Pascal: showinput 输1引LV UAE 输2不引 默认不引
        _.ui.show_input_dialog('输1引LV UAE 输2不引 默认不引', '2').then(val => {
            let da6 = String(val || '2').trim()
            if (da6 !== '1') {
                da6 = '2'
            }
            _.ui.loading.show({ text: '正在导出报表...' })
            _.http.post('/api/saier/shipment_order_statistics/other_customer/export', {
                rid: rid,
                da6: da6
            }).then(res => {
                _.ui.loading.hide()
                downloadExportFile(res, '其他客人统计表.xlsx')
            }).catch(err => {
                _.ui.loading.hide()
                _.ui.message.error((err && err.msg) || '导出请求失败')
            })
        }).catch(() => {})
    }
}

_.evts.on(_.evtids.RECORD_FIELD_CHANGED, shipment_order_statistics_field_change, '出货接单统计')
_.evts.on(_.evtids.RECORD_LOAD, shipment_order_statistics_record_load, '出货接单统计')
_.evts.on(_.evtids.MODULE_EDITOR_SHOW, shipment_order_statistics_editor_show, '出货接单统计')
_.evts.on(_.evtids.TOOLBAR_BUTTON_CLICK, shipment_order_statistics_toolbar_click, '出货接单统计')
