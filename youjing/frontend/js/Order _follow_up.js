/**
 * 导出详细合同清单的JavaScript模块
 */

function exportDetailedContractList() {
    // 1. 获取当前页面选中的行数据
    let selectedRows = null;

    // 检查是否存在数据网格 (DataGrid) 实例
    if (typeof(self.datacenter) !== "undefined" && self.datacenter !== null) {
        // 使用数据网格的数据中心获取选中行
        selectedRows = self.datacenter.getSelected();
    } else if (typeof(self.grid) !== "undefined" && self.grid !== null) {
        // 如果没有 datacenter，则尝试使用 grid 实例
        selectedRows = self.grid.getSelected();
    }

    // 2. 检查是否有选中行
    if (!selectedRows || selectedRows.length === 0) {
        // 如果没有选中任何行，弹出提示
        showMsg("请至少选择一个合同进行导出！", "info");
        return; // 退出函数，不执行后续操作
    }

    // 3. 提取选中行中的 'rid' 字段值
    const selectedRids = [];
    for (let i = 0; i < selectedRows.length; i++) {
        // 假设每一行数据对象都有一个 'rid' 属性
        // 如果字段名不是 'rid'，请根据实际数据结构调整
        const rowRid = selectedRows[i].rid;
        if (rowRid) {
            selectedRids.push(rowRid);
        }
    }

    // 4. 检查提取到的rids是否为空
    if (selectedRids.length === 0) {
        showMsg("选中的行中没有找到有效的合同ID，无法导出。", "warning");
        return;
    }

    // 5. 构造要发送到后端的数据
    const postData = {
        rids: selectedRids // 将合同ID数组放在一个名为 'rids' 的属性中
    };

    // 6. 显示加载提示
    const loadingId = showLoading("正在生成报表，请稍候...");

    // 7. 发起 POST 请求
    fetch("/api/saier/export/detailed/contract/list", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 如果你的应用使用 token 认证，需要包含 token
            // "Authorization": "Bearer " + getToken(), 
        },
        // 将 JavaScript 对象转换为 JSON 字符串
        body: JSON.stringify(postData)
    })
    .then(response => response.json()) // 解析响应的JSON数据
    .then(data => {
        // 请求成功后的回调
        hideLoading(loadingId); // 隐藏加载提示

        if (data.code === 1) {
            // 后端处理成功，准备下载文件
            const fileName = data.data; // 从后端返回的数据中获取文件名
            if (fileName) {
                // 构造文件的完整下载URL
                const downloadUrl = "/tmp/" + fileName; // 根据你的后端配置调整路径
                // 创建一个隐藏的<a>标签并模拟点击来触发下载
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = fileName; // 设置下载的默认文件名
                link.target = "_blank"; // 在新窗口打开（可选）
                link.click(); // 模拟点击
                // 清理DOM元素
                link.remove();

                showMsg(data.msg || "文件已开始下载", "success"); // 显示成功消息
            } else {
                showMsg("导出成功，但未能获取到文件名。", "warning");
            }
        } else {
            // 后端处理失败，显示错误消息
            showMsg(data.msg || "导出失败", "error");
        }
    })
    .catch(error => {
        // 请求过程中发生错误的回调
        hideLoading(loadingId); // 隐藏加载提示
        console.error("导出请求失败:", error); // 在控制台打印错误详情
        showMsg("网络请求失败或服务器出现异常：" + error.message, "error");
    });
}

// --- 可选：如果需要在页面加载时绑定事件 ---
/*
document.addEventListener('DOMContentLoaded', function () {
    const exportButton = document.getElementById('exportButton'); // 假设你有一个ID为'exportButton'的按钮
    if (exportButton) {
        exportButton.addEventListener('click', exportDetailedContractList);
    }
});
*/

// --- 导出函数供外部调用 ---
// 如果你的前端框架需要全局注册函数，可以取消下面的注释
// window.exportDetailedContractList = exportDetailedContractList;