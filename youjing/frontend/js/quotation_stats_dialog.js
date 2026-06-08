const quotation_stats_b_dialog = {
    name: 'quotation_stats_b_dialog',
    title: '报价统计表（不按客户）导出',
    width: 400,
    height: 200,
    components: [
        {
            type: 'label',
            text: '确定要导出报价统计表（不按客户）吗？',
            x: 20,
            y: 20,
            width: 360,
            height: 30,
            style: {
                fontSize: 14,
                fontWeight: 'bold',
                textAlign: 'center'
            }
        },
        {
            type: 'button',
            name: 'export_btn',
            text: '导出',
            x: 80,
            y: 80,
            width: 100,
            height: 35
        },
        {
            type: 'button',
            name: 'cancel_btn',
            text: '取消',
            x: 220,
            y: 80,
            width: 100,
            height: 35
        }
    ],
    events: {
        on_init: function(dialog) {
            dialog.components.export_btn.on('click', function() {
                dialog.export_statistics()
            })
            dialog.components.cancel_btn.on('click', function() {
                dialog.close()
            })
        },
        export_statistics: function(dialog) {
            _.ui.show_loading_dialog('正在生成报价统计表...')
            
            _.http.post('/api/saier/quotation/statistics/excel', {})
                .then(function(res) {
                    _.ui.hide_loading_dialog('正在生成报价统计表（不按客户）')
                    
                    if (res.code === 1) {
                        _.ui.message.success('报价统计表（不按客户）生成成功')
                        
                        let filename = res.data
                        let download_url = '/api/saier/download/tmp/' + filename
                        
                        let link = document.createElement('a')
                        link.href = download_url
                        link.download = filename
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        
                        dialog.close()
                    } else {
                        _.ui.message.error(res.msg || '报价统计表（不按客户）生成失败')
                    }
                })
                .catch(function(err) {
                    _.ui.hide_loading_dialog('正在生成报价统计表（不按客户）')
                    console.error(err)
                    _.ui.message.error(err.msg || '报价统计表（不按客户）生成失败')
                })
        }
    }
}