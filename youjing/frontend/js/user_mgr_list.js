function user_mgr_list_table_new_after(evt_id, table, recordset) {
    if (table.group == '成员名单') {
        recordset.val('成员名单.名 称', recordset.val('名 称'));
        recordset.val('成员名单.权限种类', recordset.val('权限种类'));
    }
}
_.evts.on([_.evtids.RECORD_TABLE_AFTER_NEW], user_mgr_list_table_new_after, '成员组管理')