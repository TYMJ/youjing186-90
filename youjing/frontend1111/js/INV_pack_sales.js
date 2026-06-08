/**
 * 导出报关单相关文档的JavaScript模块
 * 注意：此功能是为单条记录生成一个包含多工作表的Excel文件，而非导出列表。
 */

function exportCustomsDocuments() {
    // --- 1. 获取当前在前端界面上选中的行数据 ---
    let selectedRows = null;
    if (typeof(self.datacenter) !== "undefined" && self.datacenter !== null) {
        selectedRows = self.datacenter.getSelected();
    } else if (typeof(self.grid) !== "undefined" && self.grid !== null) {
        selectedRows = self.grid.getSelected();
    }

    // --- 2. 数据校验：必须有且仅有一条记录被选中 ---
    if (!selectedRows || selectedRows.length === 0) {
        showMsg("请先选择一条记录以生成报关单文件。", "info");
        return;
    }
    if (selectedRows.length > 1) {
        showMsg("该功能只能对单条记录进行操作，请取消多余的选择。", "warning");
        return;
    }

    // --- 3. 提取记录ID ---
    const targetRecordId = selectedRows[0].rid; // 请根据实际数据结构确认字段名
    if (!targetRecordId) {
        showMsg("无法获取选中记录的ID，操作失败。", "error");
        return;
    }

    // --- 4. 构造请求数据 ---
    const postData = { record_id: targetRecordId };

    // --- 5. 用户交互：选择保存路径 ---
    const loadingMessage = showLoading("正在生成报关单文件，请稍候...");
    
    // --- 6. 发起请求 ---
    fetch("/api/saier/export/customs/documents", { // 指向新的FastAPI接口
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // "Authorization": "Bearer " + getToken(), // 如需认证
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading(loadingMessage);

        if (data.code === 1) {
            // 成功，获取下载链接
            const fileName = data.data;
            if (fileName) {
                const downloadUrl = `/tmp/${encodeURIComponent(fileName)}`;
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showMsg("文件生成成功，下载已开始。", "success");
            } else {
                showMsg("文件生成成功，但未返回文件名。", "warning");
            }
        } else {
            // 失败，显示后端返回的错误信息
            showMsg(data.msg || "生成文件时发生未知错误。", "error");
        }
    })
    .catch(error => {
        hideLoading(loadingMessage);
        console.error("API 请求失败:", error);
        showMsg("网络连接失败或服务器错误。", "error");
    });
}