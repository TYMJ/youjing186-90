/**
 * 批量生成唛头标签
 */
const generate_mark_labels = async (recordset) => {
    try {
        console.log('开始生成唛头标签');
        console.log('订单列表:', recordset.rid);
        let rid = recordset.rid;

        // 第一步：输入客人全称
        const khmc = await _.ui.show_input_dialog('请输入客人全称', '');

        if (!khmc || khmc.trim() === '') {
            _.ui.error_message('客人全称不能为空');
            return;
        }

        console.log('客人全称:', khmc);

        // 第二步：选择模式
        const mode = await _.ui.show_input_dialog(
            '请选择模式：\n输入1=从Excel导入\n输入2=从数据库查询\n不输入默认为2',
            '2'
        );

        const selectedMode = mode === '1' ? 'excel' : 'database';
        console.log('选择模式:', selectedMode);

        // 显示加载提示
        _.ui.show_loading_dialog("正在生成唛头标签...");

        if (selectedMode === 'excel') {
            // ========== Excel模式 ==========
            // 弹出文件选择对话框
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.xlsx,.xls';

            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) {
                    _.ui.hide_loading_dialog();
                    return;
                }

                console.log('选择的Excel文件:', file.name);

                // 构建FormData
                const formData = new FormData();
                formData.append('khmc', khmc);
                formData.append('mode', 'excel');
                formData.append('excel_file', file);

                try {
                    const res = await _.http.post(
                        '/api/amazon/tsmt/generate',
                        formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        timeout: 600000 // 10分钟超时
                    }
                    );

                    if (res.code !== 1) {
                        _.ui.error_message(res.msg || '批量总合同生成失败');
                        return;
                    }

                    const files = res.data.files;
                    const count = res.data.count;

                    console.log('生成成功，文件数:', count);

                    // 批量下载PDF
                    if (Array.isArray(files)) {
                        files.forEach((filePath, index) => {
                            setTimeout(() => {
                                _.http.download(
                                    "/api/file/get", {
                                    file: filePath
                                },
                                    `唛头_${index + 1}.pdf`
                                );
                            }, index * 500);
                        });
                    }

                    _.ui.message.success(`成功生成${count}个唛头标签`);

                } catch (err) {
                    console.error('生成错误:', err);
                    _.ui.error_message(err.msg || '生成失败');
                } finally {
                    _.ui.hide_loading_dialog();
                }
            };

            fileInput.click();

        } else {
            // ========== 数据库模式 ==========
            if (!rid || rid.length === 0) {
                _.ui.hide_loading_dialog();
                _.ui.error_message('请先选择订单');
                return;
            }

            console.log('订单列表:', rid);

            // 构建FormData
            const formData = new FormData();
            formData.append('khmc', khmc);
            formData.append('mode', 'database');
            formData.append('number_list', JSON.stringify(rid));

            try {
                const res = await _.http.post(
                    '/api/amazon/tsmt/generate',
                    formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 600000 // 10分钟超时
                }
                );

                if (res.code !== 1) {
                    _.ui.error_message(res.msg || '批量总合同生成失败');
                    return;
                }

                const files = res.data.files;
                const count = res.data.count;

                console.log('生成成功，文件数:', count);

                // 批量下载PDF
                if (Array.isArray(files)) {
                    files.forEach((filePath, index) => {
                        setTimeout(() => {
                            _.http.download(
                                "/api/file/get", {
                                file: filePath
                            },
                                `唛头_${index + 1}.pdf`
                            );
                        }, index * 500);
                    });
                }

                _.ui.message.success(`成功生成${count}个唛头标签`);

            } catch (err) {
                console.error('生成错误:', err);
                _.ui.error_message(err.msg || '生成失败');
            } finally {
                _.ui.hide_loading_dialog();
            }
        }

    } catch (err) {
        console.error('唛头生成异常:', err);
        _.ui.error_message('操作取消或异常');
        _.ui.hide_loading_dialog();
    }
};


// 查询界面或编辑界面打开事件
const cggd_process_Form_Show = (evt_id, form) => {
    let btns = []
    if (form.is_search) {
        btns.push({
            "name": 'tsmt',
            "caption": '特殊唛头',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'plmt',
            "caption": '批量唛头',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'plht',
            "caption": '批量总合同',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'jcd',
            "caption": '进仓单',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'htpldc',
            "caption": '优景采购合同批量（图）',
            "icon": 'any-function',
            "divided": true
        });
        btns.push({
            "name": 'ammt',
            "caption": 'AMAZON唛头',
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
_.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], cggd_process_Form_Show, '采购跟单')


// 查询界面或编辑界面、子表上按钮点击事件
const cggd_form_BtnClick = (evt_id, btn, form) => {
    let username = _.user.username
    let recordset = form.recordset
    if (btn.name == 'jcd') {
        try {
            console.log('导出采购跟单报表函数被调用');
            //   let choose = form.current_rids.value;

            //         if (choose.length == 0) {
            //             _.ui.message.warning(_l('未选中记录！'));
            //             return;
            //         }

            // let rids = form.current_rids.value
            // if (rids.length == 0) {
            //     if (form.current_rid.value != '' && form.current_rid.value != null) {
            //         rids.push(form.current_rid.value)
            //     }
            // }
            let rids = getCurrentSelectedRids(form)
            if (rids.length == 0) {
                _.ui.message.error('请先选择要操作的记录!')
                return;
            }
            if (rids.length > 1) {
                _.ui.message.error('当前操作仅支持一条记录!')
                return;
            }

            // 弹出输入对话框让用户选择类型（类似 _.ui.confirm 的写法）
            _.ui.show_input_dialog('PDF输1，特殊PDF输2，不输为1', '1').then(value => {
                // 处理用户输入
                let tp = value || '1'; // 默认为1
                if (tp !== '2') {
                    tp = '1'; // 除了2以外都视为1
                }
                if (tp === '2') {
                    tp = '4'; // 特殊PDF映射为4
                }

                console.log('用户选择的类型:', tp);

                // 显示加载提示
                _.ui.show_loading_dialog("正在生成报表...");

                // 调用后端API，传递 tp 参数
                _.http.post('/api/Ravencloud/export_cggd_report', {
                    rid: form.current_rid.value,
                    tp: tp // 传递类型参数：'1'=普通Excel, '4'=特殊PDF
                }, {
                    timeout: 300000 // 5分钟超时
                }).then(res => {
                    if (res.code !== 1) {
                        _.ui.error_message(res.msg || '生成报表失败');
                        return;
                    }

                    const data = res.data.files; // 文件路径
                    const ckmc = res.data.ckmc || ''; // 仓库名称
                    const jcbh = res.data.jcbh || ''; // 进仓编号

                    console.log('返回数据:', res.data);
                    console.log('文件路径:', data);

                    // 判断是数组还是单个文件
                    if (Array.isArray(data)) {
                        // 多个文件，循环下载
                        data.forEach((filePath, index) => {
                            setTimeout(() => {
                                _.http.download(
                                    "/api/file/get", {
                                    file: filePath
                                },
                                    `${index + 1}_${ckmc}_${jcbh}.xlsx`
                                );
                            }, index * 500); // 每隔500ms下载一个
                        });
                        _.ui.message.success(`成功生成${data.length}个报表`);
                    } else {
                        // 单个文件
                        const fileExt = tp === '4' ? '.pdf' : '.xlsx'; // 根据类型决定扩展名
                        _.http.download(
                            "/api/file/get", {
                            file: data
                        },
                            `${ckmc}_${jcbh}${fileExt}`
                        );
                        _.ui.message.success('导出成功');
                    }

                }).catch(err => {
                    console.error('导出错误:', err);
                    _.ui.error_message(err.msg || '导出失败：' + (err.message || err));
                }).finally(() => {
                    _.ui.hide_loading_dialog();
                });

            }).catch(() => {
                // 用户取消输入对话框
                console.log('用户取消导出');
            });

        } catch (error) {
            console.error('导出失败：', error);
            _.ui.error_message('导出失败：' + error.message);
            _.ui.hide_loading_dialog();
        }

    }
    // 在你现有 cggd_form_BtnClick 里面替换 tsmt 分支
    if (btn.name == 'tsmt') {
        (async () => {
            try {
                let rids = getCurrentSelectedRids(form);

                const khmc = await _.ui.show_input_dialog('请输入客人全称', '');
                if (!khmc || !khmc.trim()) {
                    _.ui.error_message('客人全称不能为空');
                    return;
                }

                // 1=excel模式 2=数据库模式 空=自动按后端配置 qxzl 决定
                const modeInput = await _.ui.show_input_dialog(
                    '请选择模式：\n输入1=从Excel导入\n输入2=从数据库查询\n不输入=自动按配置',
                    ''
                );

                let mode = '';
                if (modeInput === '1') mode = 'excel';
                if (modeInput === '2') mode = 'database';

                if (mode === 'database' && rids.length === 0) {
                    _.ui.error_message('数据库模式请先选择订单');
                    return;
                }

                const filenamePrefix = await _.ui.show_input_dialog('请输入文件名前缀（可空）', '特殊唛头_');

                const formData = new FormData();
                formData.append('khmc', khmc.trim());
                formData.append('mode', mode); // excel / database / ''(auto)
                formData.append('filenametp', filenamePrefix || '特殊唛头_');

                if (mode === 'excel') {
                    const file = await chooseExcelFileForSpecialMark();
                    if (!file) {
                        _.ui.error_message('未选择Excel文件');
                        return;
                    }
                    formData.append('file', file);
                } else {
                    // mode=database 或 mode为空（自动）
                    // 自动模式下，如果有选中记录，就传过去；后端可按 qxzl 判定
                    if (rids.length > 0) {
                        formData.append('number_list', JSON.stringify(rids));
                    }
                }

                _.ui.show_loading_dialog('正在生成唛头标签...');

                const res = await _.http.post('/api/Ravencloud/special_mark_generate', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 600000
                });

                if (res.code !== 0) {
                    _.ui.error_message(res.msg || '批量总合同生成失败');
                    return;
                }

                const filePath = res.data;
                if (!filePath) {
                    _.ui.message.warning('未生成文件，请检查数据');
                    return;
                }

                _.http.download('/api/tmp/file/get', {
                    file: filePath
                }, `特殊唛头.pdf`);

                _.ui.message.success('特殊唛头生成完成');
            } catch (err) {
                console.error(err);
                _.ui.error_message(err.msg || err.message || '生成异常');
            } finally {
                _.ui.hide_loading_dialog();
            }
        })();
    }

    if (btn.name == 'ammt') {
        (async () => {
            try {
                const rids = getCurrentSelectedRids(form);
                if (rids.length === 0) {
                    _.ui.message.error('请先选择要操作的记录!');
                    return;
                }

                // ---- 1. 输入产品编号（空=打印全部） ----
                let zycpbh = await _.ui.show_input_dialog('请输入产品编号,如需打印所有则不用填', '');
                if (zycpbh === null) return;
                zycpbh = (zycpbh || '').trim();

                // ---- 2. 选择模式：1=当前, 2=批量 ----
                const da2Input = await _.ui.show_input_dialog('1为当前信息,输2为批量,默认当前', '1');
                if (da2Input === null) return;
                const da2 = String(da2Input || '').trim() === '2' ? '2' : '1';

                if (da2 === '2' && rids.length === 0) {
                    _.ui.message.error('批量模式请先选择订单');
                    return;
                }

                // ---- 3. PDF / 批量PDF 判断 ----
                const tpInput = await _.ui.show_input_dialog('PDF输1,批量PDF输2,不输为1', '1');
                if (tpInput === null) return;
                let tp = String(tpInput || '').trim();
                if (tp !== '1' && tp !== '2') {
                    tp = '1';
                }

                // ---- 4. 批量PDF时输入保存路径前缀 ----
                let filenametp = '';
                if (tp === '2') {
                    const pathInput = await _.ui.show_input_dialog('请选择文件保存路径前缀（如 d:\\批量导出\\）', 'd:\\');
                    if (pathInput === null) return;
                    filenametp = String(pathInput || '').trim() || 'd:\\';
                }

                // ---- 5. 组装参数 ----
                const formData = new FormData();
                formData.append('zycpbh', zycpbh);
                formData.append('da2', da2);
                formData.append('tp', tp);
                if (filenametp) {
                    formData.append('filenametp', filenametp);
                }

                if (da2 === '1') {
                    const current_rid = (form.current_rid && form.current_rid.value)
                        ? form.current_rid.value
                        : (rids[0] || '');
                    if (!current_rid) {
                        _.ui.message.error('未获取到当前记录编号');
                        return;
                    }
                    formData.append('rid', current_rid);
                } else {
                    formData.append('rids', JSON.stringify(rids));
                }

                // ---- 6. 调用后端 ----
                _.ui.show_loading_dialog('正在生成AMAZON唛头...');

                const res = await _.http.post('/api/amazon/tsmt/generate', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 600000
                });

                if (res.code !== 1) {
                    _.ui.error_message(res.msg || 'AMAZON唛头生成失败');
                    return;
                }

                // 参考 RavenJLL-cggdreport.js 风格读取返回结构
                const files = res.data && res.data.files ? res.data.files : [];
                const count = res.data && typeof res.data.count === 'number' ? res.data.count : files.length;

                console.log('AMAZON唛头生成成功，文件数:', count);

                if (!Array.isArray(files) || files.length === 0) {
                    _.ui.message.warning('未生成文件，请检查数据');
                    return;
                }

                // ---- 7. 批量下载 PDF ----
                files.forEach((filePath, index) => {
                    setTimeout(() => {
                        _.http.download('/api/tmp/file/get', {
                            file: filePath
                        }, `AMAZON唛头_${index + 1}.pdf`);
                    }, index * 300);
                });

                _.ui.message.success(`AMAZON唛头生成完成，共${count}个PDF文件`);

            } catch (err) {
                console.error('AMAZON唛头生成异常:', err);
                _.ui.error_message(err.msg || err.message || 'AMAZON唛头生成异常');
            } finally {
                _.ui.hide_loading_dialog();
            }
        })();
    }








    if (btn.name == 'plht') {
        (async () => {
            try {
                const rids = getCurrentSelectedRids(form);
                if (rids.length === 0) {
                    _.ui.message.error('请先选择要操作的记录!');
                    return;
                }

                let company = await _.ui.show_input_dialog('请输入公司名称（默认宁波优景进出口有限公司）', '宁波优景进出口有限公司');
                if (company === null) return;
                company = (company || '').trim() || '宁波优景进出口有限公司';

                const pdfInput = await _.ui.show_input_dialog('请选择导出格式：1=Excel，2=PDF，3=批量PDF（默认1）', '1');
                if (pdfInput === null) return;
                const pdf = ['1', '2', '3'].includes(pdfInput) ? pdfInput : '1';

                const formData = new FormData();
                formData.append('company', company);
                formData.append('pdf', pdf);
                formData.append('rid_list', JSON.stringify(rids));

                _.ui.show_loading_dialog('正在批量生成采购总合同...');
                const res = await _.http.post('/api/Ravencloud/generate_contract_batch', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 600000
                });

                if (res.code !== 1) {
                    _.ui.error_message(res.msg || '批量总合同生成失败');
                    return;
                }

                const files = res.data && Array.isArray(res.data.files) ? res.data.files : [];
                const count = res.data && typeof res.data.count === 'number' ? res.data.count : files.length;

                if (files.length === 0) {
                    _.ui.message.warning('未生成文件，请检查数据');
                    return;
                }

                files.forEach((filePath, index) => {
                    const lower = String(filePath || '').toLowerCase();
                    const ext = lower.endsWith('.xlsx') ? '.xlsx' : '.pdf';
                    setTimeout(() => {
                        _.http.download('/api/file/get', {
                            file: filePath
                            // }, `采购总合同_${index + 1}${ext}`);
                        }, filePath.split("/").slice(-1)[0]);
                    }, index * 300);
                });

                if (res.data && res.data.warning_file) {
                    setTimeout(() => {
                        _.http.download('/api/file/get', {
                            file: res.data.warning_file
                        }, '诚信报告提醒.txt');
                    }, files.length * 300 + 200);
                }

                _.ui.message.success(`批量总合同生成完成，共${count}个文件`);
            } catch (err) {
                _.ui.error_message(err.msg || err.message || '批量总合同生成异常');
            } finally {
                _.ui.hide_loading_dialog();
            }
        })();
    }

    if (btn.name == 'htpldc') {
        (async () => {
            try {
                const rids = getCurrentSelectedRids(form);
                if (!Array.isArray(rids) || rids.length === 0) {
                    _.ui.message.warning('未选中记录！');
                    return;
                }

                const modeInput = await _.ui.show_input_dialog('1为当前信息，输2为批量，默认当前', '1');
                if (modeInput === null) return;
                const da2 = String(modeInput || '').trim() === '2' ? '2' : '1';

                const gsInput = await _.ui.show_input_dialog(
                    '请输入编号,输1为优景,输2为锐亿,其他输简称如(景驰)',
                    '1'
                );
                if (gsInput === null) return;

                let gs = String(gsInput || '').trim();
                if (gs === '' || gs === '1') {
                    gs = '1';
                } else if (gs !== '2') {
                    // 景驰等简称原样传后端，勿改成 '2'
                }

                const pdfInput = await _.ui.show_input_dialog(
                    'excel输1,pdf输2,批量PDF输3,不输为1',
                    '1'
                );
                if (pdfInput === null) return;

                let pdf = String(pdfInput || '').trim();
                if (pdf !== '1' && pdf !== '2' && pdf !== '3') {
                    pdf = '1';
                }

                const payload = { da2, gs, pdf };
                if (da2 === '1') {
                    payload.rid = (form.current_rid && form.current_rid.value) ? form.current_rid.value : rids[0];
                } else {
                    payload.rid_list = rids;
                }

                _.ui.show_loading_dialog('正在生成优景采购合同批量（图）...');

                const res = await _.http.post('/api/saier/purchase_followup/export', payload, {
                    timeout: 600000,
                });

                if (res.code !== 1 && res.code !== '1') {
                    _.ui.error_message(res.msg || '优景采购合同批量（图）生成失败');
                    return;
                }

                const data = res.data || {};
                const fileStr = data.path || data.name;
                if (fileStr) {
                    const dot = fileStr.lastIndexOf('.');
                    const ext = dot >= 0 ? fileStr.substring(dot) : '';
                    const saveName = `采购跟单合同_${data.name || data.hthm || 'export'}${ext}`;
                    _.http.download('/api/tmp/file/get', { file: fileStr }, saveName);
                    _.ui.message.success(res.msg || '生成成功，开始下载');
                } else {
                    _.ui.message.success(res.msg || '处理完成');
                }

                const warnPath = data.warning_path || data.warning_file;
                if (data.warning) {
                    _.ui.message.info(data.warning);
                }
                if (warnPath) {
                    setTimeout(() => {
                        _.http.download(
                            '/api/tmp/file/get',
                            { file: warnPath },
                            `诚信报告_${new Date().toISOString().slice(0, 10)}.txt`
                        );
                    }, 500);
                }
            } catch (err) {
                _.ui.error_message(err.msg || err.message || '优景采购合同批量（图）生成异常');
            } finally {
                _.ui.hide_loading_dialog();
            }
        })();
    }
    // 工具栏按钮：优景采购合同批量（图）
    // 放在你的 toolbar click 事件处理里，替换原 htpldc 分支即可


    // 文件：RavenJLL-cggdreport.js 或其他对应的前端文件
    if (btn.name == 'plmt') { // 批量唛头

        // 批量唛头
        (async () => {
            try {
                const rids = (form.current_rids && form.current_rids.value) ? [...form.current_rids.value] : [];
                if (rids.length === 0) {
                    _.ui.message.warning('未选中记录！');
                    return;
                }

                const regionInput = await _.ui.show_input_dialog('1为BP,输2拉脱维亚 默认BP', '1');
                if (regionInput === null) return;
                const region_opt = (regionInput === '2') ? '2' : '1';

                const envInput = await _.ui.show_input_dialog('1加环保,2不加,3PP,4LDEP-1,5LDPE-2 默认1', '1');
                if (envInput === null) return;
                const env_opt = ['1', '2', '3', '4', '5'].includes(envInput) ? envInput : '1';

                const markTypeInput = await _.ui.show_input_dialog(
                    '唛头类型:\n1内外箱唛头\n2常规唛头\n3港加特标唛头\n4港加特标加警语唛头\n5多货号唛头',
                    region_opt === '1' ? '1' : '3'
                );
                if (markTypeInput === null) return;
                const markTypeMap = {
                    '1': '内外箱唛头',
                    '2': '常规唛头',
                    '3': '港加特标唛头',
                    '4': '港加特标加警语唛头',
                    '5': '多货号唛头'
                };
                const mark_type = markTypeMap[markTypeInput] || '内外箱唛头';

                const outInput = await _.ui.show_input_dialog('PDF输1,JPG输2,低版本批量PDF输3,批量PDF输4,默认1', '1');
                if (outInput === null) return;
                const out_type = ['1', '2', '3', '4'].includes(outInput) ? outInput : '1';

                const mode = 'batch';

                const ship_date = await _.ui.show_input_dialog('请输入船期', '');
                if (ship_date === null) return;

                const filename_prefix = await _.ui.show_input_dialog('请输入文件名前缀（可空）', '批量唛头_');
                if (filename_prefix === null) return;


                const formData = new FormData();
                formData.append('mark_type', mark_type);
                formData.append('env_opt', env_opt);
                formData.append('region_opt', region_opt);
                formData.append('out_type', out_type);
                formData.append('mode', mode);
                formData.append('ship_date', ship_date || '');
                formData.append('filename_prefix', filename_prefix || '批量唛头_');

                formData.append('number_list', JSON.stringify(rids));

                _.ui.show_loading_dialog('正在生成批量唛头...');
                const res = await _.http.post('/api/Ravencloud/batch_mark_generate', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 600000
                });

                if (res.code !== 1) {
                    _.ui.error_message(res.msg || '批量总合同生成失败');
                    return;
                }

                const files = res.data.files || [];
                const count = res.data.count || 0;

                files.forEach((filePath, index) => {
                    setTimeout(() => {
                        _.http.download('/api/file/get', {
                            file: filePath
                        }, `批量唛头_${index + 1}.pdf`);
                    }, index * 300);
                });

                _.ui.message.success(`批量总合同生成完成，共${count}个文件`);
            } catch (e) {
                _.ui.error_message(e.msg || e.message || '批量唛头生成异常');
            } finally {
                _.ui.hide_loading_dialog();
            }
        })();

        // 放到你现有按钮点击里
        // if (btn.name == 'plmt') {
        //     handle_batch_mark(form);
        // }

    }





}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], cggd_form_BtnClick, '采购跟单')


// special_mark_generator.js
// 采购跟单 - 特殊唛头（Pascal迁移版）

// 只保留一个API：/api/Ravencloud/special_mark_generate

const chooseExcelFileForSpecialMark = () => {
    return new Promise((resolve) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx,.xls';
        fileInput.onchange = (e) => {
            const file = (e.target.files || [])[0] || null;
            resolve(file);
        };
        fileInput.click();
    });
};

const getCurrentSelectedRids = (form) => {
    let rids = (form.current_rids && form.current_rids.value) ? [...form.current_rids.value] : [];
    if (rids.length === 0 && form.current_rid && form.current_rid.value) {
        rids.push(form.current_rid.value);
    }
    return rids;
};
