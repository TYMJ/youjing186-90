// // 编辑界面字段change后执行
const commodity_inspection_field_change = (evt_id, opts) => {
    let {
        recordset,
        module,
        field,
        value,
        old_value,
        current_record
    } = opts;
    let n = module.name
    let username = _.user.username
    let row = current_record

    if (field.full_name == n + '.合并产品.报关总价') {
        const v = Number(recordset.value('合并产品.报关总价', row) || 0)
        if (v > 0) {
            const bgzj = Number((Math.round(v * 100) / 100).toFixed(2))
            recordset.val('合并产品.报关总价', bgzj, row)
        }
    }
    if (field.full_name == n + '.发票日期') {
        if (recordset.val('发票日期') != '' || recordset.val('发票日期') != null) {
            const invoiceDate = recordset.val('发票日期');
            const newDate = new Date(invoiceDate);
            newDate.setDate(newDate.getDate() + 7);
            const defaultDate = newDate.format('yyyy-MM-dd');
            recordset.val('出运日期', defaultDate);
        }
    }
    const watchFields = new Set([
        n + '.产品资料.中文报关品名',
        n + '.产品资料.退税率',
        n + '.产品资料.货 源 地',
        n + '.产品资料.海关编码'
    ])
    if (watchFields.has(field.full_name)) {
        const zw = String(recordset.value('产品资料.中文报关品名', row) || '')
        if (zw !== '') {
            const tsl = parseInt(recordset.value('产品资料.退税率', row) || 0, 10) || 0
            const hyd = String(recordset.value('产品资料.货 源 地', row) || '')
            const hgbm = String(recordset.value('产品资料.海关编码', row) || '')
            recordset.val('产品资料.中文品名退税', `${zw}${tsl}${hyd}${hgbm}`, row)
        }
    }

    const packFields = new Set([
        n + '.产品资料.包装长度',
        n + '.产品资料.包装宽度',
        n + '.产品资料.包装高度'
    ])
    if (packFields.has(field.full_name)) {
        const bzcd = Number(recordset.value('产品资料.包装长度', row) || 0)
        const bzkd = Number(recordset.value('产品资料.包装宽度', row) || 0)
        const bzgd = Number(recordset.value('产品资料.包装高度', row) || 0)
        const bztj = bzcd * bzkd * bzgd

        if (bztj !== 0) {
            const v = bztj / 1000000
            const khmc = String(recordset.value('主要信息.客户名称') || '').toUpperCase()

            if (khmc.indexOf('AMAZON') > -1) {
                recordset.val('产品资料.外箱体积', v, row)
            } else {
                let out = Number(v).toFixed(3)
                if (Number(out) < 0.001) out = '0.001'
                recordset.val('产品资料.外箱体积', out, row)
            }
        }
    }

    const grossFields = new Set([
        n + '.产品资料.毛    重',
        n + '.产品资料.箱    数'
    ])
    if (grossFields.has(field.full_name)) {
        const mz = Number(recordset.value('产品资料.毛    重', row) || 0)
        const xs = Number(recordset.value('产品资料.箱    数', row) || 0)
        const total = mz * xs
        if (total !== 0) {
            recordset.val('产品资料.总 毛 重', Number(total).toFixed(2), row)
        }
    }

    const volumeFields = new Set([
        n + '.产品资料.箱    数',
        n + '.产品资料.外箱体积'
    ])
    if (volumeFields.has(field.full_name)) {
        const wx = Number(recordset.value('产品资料.外箱体积', row) || 0)
        const xs = Number(recordset.value('产品资料.箱    数', row) || 0)
        const ztj = wx * xs

        if (ztj !== 0) {
            const khmc = String(recordset.value('主要信息.客户名称') || '').toUpperCase()
            if (khmc.indexOf('AMAZON') > -1) {
                recordset.val('产品资料.总 体 积', ztj, row)
            } else {
                recordset.val('产品资料.总 体 积', Number(ztj).toFixed(3), row)
            }
        }
    }

    const shipQtyFields = new Set([
        n + '.产品资料.外箱容量',
        n + '.产品资料.箱    数'
    ])
    if (shipQtyFields.has(field.full_name)) {
        const sfx = String(recordset.value('产品资料.是否拼箱', row) ?? '').trim()
        if (sfx === '否' || sfx === '') {
            const xs = parseInt(recordset.value('产品资料.箱    数', row) || 0, 10) || 0
            if (xs > 0) {
                const wxrl = Number(recordset.value('产品资料.外箱容量', row) || 0)
                recordset.val('产品资料.出货数量', wxrl * xs, row)
            }
        }
    }
}
_.evts.on(_.evtids.RECORD_FIELD_CHANGED, commodity_inspection_field_change, '商检清单')

const _apply_table_data = (recordset, tableName, rows) => {
    const t = recordset.tables[tableName];
    if (!t || !Array.isArray(rows)) return;

    // t.clear();
    for (let r of rows) {
        if (!r.rid) r.rid = _.utils.guid();
        if (!r.pid) r.pid = recordset.val('rid');
        if (r.new_flag == 0) {
            t.push_modi_rid(r.rid);
            console.log('11111');
            console.log(r);
        }
        if (r.new_flag == 1) {
            t.push_new_rid(r.rid);
            console.log('22222');
            console.log(r);
        }
    }
    t.view_data = rows;
    t.sync_operate_data();
    t.modified = true;
};

const commodity_inspection_before_save = (evt_id, recordset) => {
    return new Promise((resolve, reject) => {
        const rmbkh = String(recordset.val('RMB客户') || '');
        const hbdm = String(recordset.val('货币代码') || '');
        const khmc = String(recordset.val('客户名称') || '');

        if (rmbkh === '是' && hbdm !== 'RMB') {
            _.ui.message.error(`客户【${khmc}】是RMB客户，币种必须为人民币（RMB）`);
            reject();
            return;
        }
        if (rmbkh !== '是' && hbdm === 'RMB') {
            _.ui.message.error(`客户【${khmc}】不是RMB客户，币种不能为人民币（RMB）`);
            reject();
            return;
        }


        const fphm = String(recordset.val('发票号码') || '');
        const hsfp = String(recordset.val('核算发票') || '');
        const htrq = String(recordset.val('合同日期') || '');

        if (fphm !== '' && hsfp === '') recordset.val('核算发票', fphm);
        if (htrq !== '') {
            recordset.val('申报日期', htrq);
            recordset.val('申报年月', htrq.substring(0, 7));
        }

        const zxbh = String(recordset.val('纸箱批号') || '').trim();
        if (zxbh === '' && fphm !== '') {
            const dashIndex = fphm.lastIndexOf('-');
            if (dashIndex !== -1 && dashIndex < fphm.length - 1) {
                const extractedZxbh = fphm.substring(dashIndex + 1);
                if (extractedZxbh.trim() !== '') {
                    recordset.val('纸箱批号', extractedZxbh.trim());
                }
            }
        }
        const mergeTable = recordset.tables['合并产品'];
        const mergeItems = (mergeTable && Array.isArray(mergeTable.view_data)) ? mergeTable.view_data : [];

        _.http.post('/api/saier/commodity_inspection/save/before', {
            main: {
                rid: recordset.val('rid'),
                fphm: recordset.val('发票号码'),
                hsfp: recordset.val('核算发票'),
                htrq: recordset.val('合同日期'),
                rmbkh: recordset.val('RMB客户'),
                ssgs: recordset.val('所属公司'),
                hbdm: recordset.val('货币代码'),
                bggs: recordset.val('报关公司'),
                khmc: recordset.val('客户名称')
            },
            merge_items: mergeItems
        }).then(res => {
            if (res.code !== 1) {
                _.ui.message.error(res.msg || '保存前处理失败');
                reject();
                return;
            }

            const data = res.data || {};
            _apply_table_data(recordset, '合并产品', data.merge_items || []);
            _apply_table_data(recordset, '报关单', data.declaration_items || []);
            recordset.do_re_sum_by_trigger_table('合并产品');
            resolve();
        }).catch(err => {
            _.ui.message.error((err && err.msg) || '保存前处理异常');
            reject();
        });
    });
};

_.evts.on(_.evtids.RECORD_BEFORE_SAVE, commodity_inspection_before_save, '商检清单');


const customs_merge_items1 = (recordset) => {
    let merge_table = recordset.tables['合并产品'];
    let items_table = recordset.tables['产品资料'];

    let items_data = items_table.view_data || [];
    let new_data = [];
    let filter_list = [];
    let seq = 0;

    const num = (v, d = 0) => {
        const n = Number(v);
        return Number.isNaN(n) ? d : n;
    };
    const intv = (v, d = 0) => {
        const n = parseInt(v, 10);
        return Number.isNaN(n) ? d : n;
    };
    const r2 = (v) => Number(num(v).toFixed(2));
    const r3 = (v) => Number(num(v).toFixed(3));
    const trunc = (v) => (num(v) >= 0 ? Math.floor(num(v)) : Math.ceil(num(v)));

    // 对齐 Pascal：先清空合并产品
    merge_table.clear();

    // 1) 按 中文品名退税 聚合
    for (let row of items_data) {
        if (row.sfdb !== '是' && intv(row.zzsl) > 0) {
            // Pascal: 仅处理 6/4/3
            if (String(row.zzsl) === '6' || intv(row.zzsl) === 6) row.tsl = '5';
            if (String(row.zzsl) === '4' || intv(row.zzsl) === 4) row.tsl = '4';
            if (String(row.zzsl) === '3' || intv(row.zzsl) === 3) row.tsl = '3';

            let zwpmts = String(row.zwpmts || '');
            if (zwpmts === '') continue;

            if (filter_list.indexOf(zwpmts) < 0) {
                filter_list.push(zwpmts);
                let rid = _.utils.guid();
                seq += 1;

                let row_json = {};
                row_json.rid = rid;
                row_json.pid = recordset.rid;
                row_json.ctime = new Date().format('yyyy-MM-dd hh:mm:ss');
                row_json.mtime = new Date().format('yyyy-MM-dd hh:mm:ss');
                row_json.seq = seq;

                row_json.hgbm = row.hgbm || '';
                row_json.zwpm = row.zhwbgpm || '';
                row_json.sbys = row.sbys || '';
                row_json.chsl = r2(row.chsl);
                row_json.jldw = row.jldw || '';
                row_json.chxs = intv(row.chxs);
                row_json.bzdw = row.bzdw || '';
                row_json.gczj = r2(row.gczj);
                row_json.wxzj1 = r2(row.wxzj);
                row_json.zmz = r2(row.zmz);
                row_json.zjz = r2(row.zjz);
                row_json.ztj = r3(row.ztj);
                row_json.dyg = row.dyg || '';
                row_json.hbdm = row.hbdm || ''; // 修正：不是 hgbm
                row_json.zzsl = row.zzsl || 0;
                row_json.tsl = row.tsl || 0;
                row_json.hgjldw = row.hgjldw || '';
                row_json.zwpm1 = row.zhwbgpm || '';
                row_json.mjzj = r2(row.mjzj);
                row_json.hyd = row.hyd || '';
                row_json.bgbh = row.bgbh || '';
                row_json.zwpmts = row.zwpmts || '';
                row_json.cz = row.caiziz ? String(row.caiziz).substring(0, 48) : '无';

                new_data.push(row_json);
                merge_table.push_new_rid(rid);
            } else {
                let idx = filter_list.indexOf(zwpmts);

                if (row.caiziz && new_data[idx].cz === '无') {
                    new_data[idx].cz = String(row.caiziz).substring(0, 48);
                }

                new_data[idx].chsl = r2(num(new_data[idx].chsl) + num(row.chsl));
                new_data[idx].gczj = r2(num(new_data[idx].gczj) + num(row.gczj));
                new_data[idx].wxzj1 = r2(num(new_data[idx].wxzj1) + num(row.wxzj));
                new_data[idx].mjzj = r2(num(new_data[idx].mjzj) + num(row.mjzj));

                if ((row.yfph || '') === '') {
                    new_data[idx].chxs = intv(new_data[idx].chxs) + intv(row.chxs);
                    new_data[idx].zmz = r2(num(new_data[idx].zmz) + num(row.zmz));
                    new_data[idx].zjz = r2(num(new_data[idx].zjz) + num(row.zjz));
                    new_data[idx].ztj = r3(num(new_data[idx].ztj) + num(row.ztj));
                }
            }
        }
    }

    // 2) 回填英文品名（去重，; \r\n）
    for (let i = 0; i < new_data.length; i++) {
        const current_yw = [];
        for (let row of items_data) {
            if (row.sfdb !== '是' && String(row.zwpmts || '') === String(new_data[i].zwpmts || '')) {
                let en = String(row.djpmy || '').trim();
                if (en !== '' && !current_yw.includes(en)) current_yw.push(en);
            }
        }
        const ywbgpm1 = current_yw.join('; \r\n');
        new_data[i].ywpm = ywbgpm1;
        new_data[i].ywhj = ywbgpm1;
    }

    // 3) 单价 + 明佣分摊
    let zwpmhyd = [];
    let zwpm = [];
    let hyd1 = [];
    let bgbh1 = [];
    let yjhj = 0;

    for (let i = 0; i < new_data.length; i++) {
        const chsl = num(new_data[i].chsl);

        if (recordset.val('RMB客户') === '是') {
            new_data[i].mjdj1 = chsl !== 0 ? num(new_data[i].mjzj) / chsl : 0;
        } else {
            new_data[i].wxjg = chsl !== 0 ? num(new_data[i].wxzj1) / chsl : 0;
        }

        // 你当前 declaration 里沿用 bgbh 维度
        const key = `${new_data[i].zwpm || ''};${new_data[i].hyd || ''};${new_data[i].bgbh || ''}`;
        if (!zwpmhyd.includes(key)) {
            zwpmhyd.push(key);
            zwpm.push(new_data[i].zwpm || '');
            hyd1.push(new_data[i].hyd || '');
            bgbh1.push(new_data[i].bgbh || '');
        }

        if (num(recordset.val('明佣合计')) > 0) {
            const myhj = num(recordset.val('明佣合计'));

            if (recordset.val('RMB客户') === '是') {
                const base = num(recordset.val('合并金额RMB合计'));
                new_data[i].yjzj = base !== 0 ? trunc((num(new_data[i].mjzj) / base) * myhj) : 0;
                new_data[i].mjdj1 = chsl !== 0 ? trunc(((num(new_data[i].mjzj) - num(new_data[i].yjzj)) / chsl) * 1000) / 1000 : 0;
                new_data[i].yjzj = Math.round((num(new_data[i].mjzj) - num(new_data[i].mjdj1) * chsl) * 100) / 100;
            } else {
                const base = num(recordset.val('合并金额合计'));
                new_data[i].yjzj = base !== 0 ? trunc((num(new_data[i].wxzj1) / base) * myhj) : 0;
                new_data[i].wxjg = chsl !== 0 ? trunc(((num(new_data[i].wxzj1) - num(new_data[i].yjzj)) / chsl) * 1000) / 1000 : 0;
                new_data[i].yjzj = Math.round((num(new_data[i].wxzj1) - num(new_data[i].wxjg) * chsl) * 100) / 100;
            }

            yjhj += num(new_data[i].yjzj);

            if (i === new_data.length - 1 && new_data.length > 1) {
                new_data[i].yjzj = num(new_data[i].yjzj) + myhj - yjhj;
                if (recordset.val('RMB客户') === '是') {
                    new_data[i].mjdj1 = chsl !== 0 ? (num(new_data[i].mjzj) - num(new_data[i].yjzj)) / chsl : 0;
                } else {
                    new_data[i].wxjg = chsl !== 0 ? (num(new_data[i].wxzj1) - num(new_data[i].yjzj)) / chsl : 0;
                }
            }
        }
    }

    // 4) 同组重复货源地加点，并同步回产品资料
    for (let i2 = 0; i2 < zwpmhyd.length; i2++) {
        let j1 = 0;
        for (let i = 0; i < new_data.length; i++) {
            const key = `${new_data[i].zwpm || ''};${new_data[i].hyd || ''};${new_data[i].bgbh || ''}`;
            if (key === zwpmhyd[i2]) {
                j1++;
                if (j1 > 1) {
                    if (j1 === 2) new_data[i].hyd = hyd1[i2] + '.';
                    if (j1 === 3) new_data[i].hyd = hyd1[i2] + ' .';
                    if (j1 === 4) new_data[i].hyd = hyd1[i2] + '  .';
                    if (j1 === 5) new_data[i].hyd = hyd1[i2] + '   .';

                    for (const rc of items_table.view_data) {
                        if (
                            rc.zhwbgpm === zwpm[i2] &&
                            rc.bgbh === bgbh1[i2] &&
                            new_data[i].hgbm === rc.hgbm &&
                            String(new_data[i].tsl || '') === String(rc.tsl || '') &&
                            rc.sfdb !== '是'
                        ) {
                            rc.hyd = new_data[i].hyd;
                            items_table.push_modi_rid(rc.rid);
                        }
                    }
                }
            }
        }
    }

    // 5) 回写
    for (let r of new_data) {
        merge_table.push_new_rid(r.rid);
    }
    merge_table.view_data = new_data;
    merge_table.sync_operate_data();
    items_table.sync_operate_data();
    recordset.do_re_sum_by_trigger_table('合并产品');

    merge_table.modified = true;
    items_table.modified = true;
};


// 查询界面或编辑界面、子表上按钮点击事件
const commodity_inspection_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset

    if (btn.name == 'declaration_hbcpbhb_btn') {
        customs_merge_items1(recordset)
    }

}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], commodity_inspection_form_BtnClick, '商检清单')

const commodity_inspection_FormShow = (evt_id, form) => {
    let btns = []
    btns.push({
        "name": 'declaration_hbcpbhb_btn',
        "caption": '合并产品(英文不合并)',
        "icon": 'any-keyborad',
    })
    form.toolbar.insert([{
        "name": 'export_btn',
        "caption": '扩展',
        "icon": '#ext-add_database',
        "btns": btns
    }], 'close');
}
_.evts.on([_.evtids.MODULE_EDITOR_SHOW], commodity_inspection_FormShow, '商检清单')

const commodity_inspection_BtnClick = (evt_id, btn, form) => {
    if (btn.name == 'bCopyFromExcel') {
        _.ui.show_dialog('copy_from_excel', {
            "rid": form.recordset.rid,
            "group_name": "合并产品",
            "run_fill": true,
        });
    }
}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], commodity_inspection_BtnClick, '商检清单')

const commodity_inspection_EditorChildShow = (evt_id, form) => {
    if (form.group.value.name == '合并产品') {
        form.toolbar.add([{
            "name": 'bCopyFromExcel',
            "caption": '粘贴数据',
            "icon": 'exticon ext-xlsx',
        }]);
    }
}
_.evts.on([_.evtids.MODULE_EDITOR_GROUP_SHOW], commodity_inspection_EditorChildShow, '商检清单')




const commodity_inspection_record_load = (evt_id, recordset) => {
    if (recordset.val('出运日期') === '' || recordset.val('出运日期') === null) {
        const now = new Date();
        now.setDate(now.getDate() + 7);
        const defaultDate = now.format('yyyy-MM-dd');
        recordset.val('出运日期', defaultDate);
    }
};
_.evts.on(_.evtids.RECORD_LOAD, commodity_inspection_record_load, '商检清单')
