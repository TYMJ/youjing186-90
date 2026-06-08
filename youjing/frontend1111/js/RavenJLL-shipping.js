// // 查询界面或编辑界面打开事件
// const shipping_Form_Show = (evt_id, form) => {
//     let btns = []
//     if (form.is_search) {
//         btns.push({
//             "name": 'dgmb_booking_btn',
//             "caption": '优景booking',
//             "icon": 'any-function',
//             "divided": true
//         });
//     }
// if (btns.length == 0) {
//         return;
//     }

// }
// _.evts.on([_.evtids.MODULE_SEARCH_SHOW, _.evtids.MODULE_EDITOR_SHOW], shipping_Form_Show, '出运计划')

const shipping_form_BtnClick1 = (evt_id, btn, form) => {
    let recordset = form.recordset;
    let m = form.module.name;
    let username = _.user.username;

    // 按钮事件分支（放到 TOOLBAR_BUTTON_CLICK 里）
if (btn.name === 'dgmb_booking_btn') {
    (async () => {
        try {
            const rids = getCurrentSelectedRids(form);
            if (!Array.isArray(rids) || rids.length === 0) {
                _.ui.message.warning('未选中记录！');
                return;
            }

            let pmsInput = await _.ui.show_input_dialog('请输入要在BOOKING显示品名数，默认为1', '1');
            if (pmsInput === null) return;
            let pms = parseInt(String(pmsInput || '1').trim(), 10);
            if (!Number.isFinite(pms) || pms <= 0) pms = 1;
            if (pms > 20) pms = 20;

            const formData = new FormData();
            formData.append('rid_list', JSON.stringify(rids)); // 批量 rid
            formData.append('pms', String(pms));
            formData.append('mode', '2');

            _.ui.show_loading_dialog('正在生成BOOKING文件...');

            const res = await _.http.post('/api/Ravencloud/export_booking_latest', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 600000
            });

            if (res.code !== 1) {
                _.ui.message.error(res.msg || '生成失败');
                return;
            }

            // 兼容多种后端返回结构
            let files = [];
            if (Array.isArray(res.data?.files)) {
                files = res.data.files;
            } else if (typeof res.data?.file === 'string' && res.data.file) {
                files = [res.data.file];
            } else if (typeof res.data === 'string' && res.data) {
                files = [res.data];
            }

            if (!files.length) {
                _.ui.message.warning('未生成文件');
                return;
            }

            files.forEach((file, i) => {
                setTimeout(() => {
                    _.http.download('/api/file/get', { file: file }, `BOOKING_${i + 1}.xlsx`);
                }, i * 200);
            });

            _.ui.message.success(`生成成功，共${files.length}个文件`);
        } catch (err) {
            _.ui.message.error(err.msg || err.message || '导出异常');
        } finally {
            _.ui.hide_loading_dialog();
        }
    })();
}


// if (btn.name === 'dgmb_inquiry_btn') {
//     (async () => {
//         try {
//             const rid = getCurrentSelectedRids(form);
//             if (!rid || rid.length === 0) {
//                 _.ui.message.warning('请先选择一条记录');
//                 return;
//             }

//             const formData = new FormData();
//             formData.append('rid', String(rid));

//             _.ui.show_loading_dialog('正在生成电商询价表...');

//             const res = await _.http.post('/api/Ravencloud/export_ecom_inquiry_excel', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//                 timeout: 600000
//             });

//             if (res.code !== 1) {
//                 _.ui.error_message(res.msg || '导出失败');
//                 return;
//             }

//             const file = res.data?.file;
//             const name = res.data?.name || '电商询价表.xlsx';
//             if (!file) {
//                 _.ui.message.warning('未生成文件');
//                 return;
//             }

//             _.http.download('/api/file/get', { file }, name);
//             _.ui.message.success('导出成功');
//         } catch (err) {
//             _.ui.error_message(err.msg || err.message || '导出异常');
//         } finally {
//             _.ui.hide_loading_dialog();
//         }
//     })();
// }




}
_.evts.on([_.evtids.TOOLBAR_BUTTON_CLICK], shipping_form_BtnClick1, '出运计划')
const getCurrentSelectedRids = (form) => {
    let rids = (form.current_rids && form.current_rids.value) ? [...form.current_rids.value] : [];
    if (rids.length === 0 && form.current_rid && form.current_rid.value) {
        rids.push(form.current_rid.value);
    }
    return rids;
};
