DROP FUNCTION if exists get_user_org $
DELIMITER $
CREATE FUNCTION get_user_org(
    p_username VARCHAR(100),
    p_user_id VARCHAR(36)
) 
RETURNS VARCHAR(100)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_org_id VARCHAR(36);
    DECLARE v_full_path VARCHAR(1000);
    -- 获取用户所属机构的oid
    IF p_username IS NOT NULL AND p_username != "" THEN
        SELECT oid INTO v_org_id 
        FROM sys_user 
        WHERE username = p_username 
        LIMIT 1;
    ELSEIF p_user_id IS NOT NULL AND p_user_id != "" THEN
        SELECT oid INTO v_org_id 
        FROM sys_user 
        WHERE rid = p_user_id 
        LIMIT 1;
    ELSE
        RETURN NULL;
    END IF;
    -- 如果没有找到用户或用户没有机构
    IF v_org_id IS NULL OR v_org_id = "" THEN
        RETURN NULL;
    END IF;
    -- 递归查询获取完整路径（从顶层到当前机构）
    WITH RECURSIVE org_hierarchy AS (
        -- 先找出所有机构的路径
        SELECT 
            rid, 
            name, 
            pid, 
            name AS full_path  -- 当前机构名称作为路径
        FROM sys_organization
        WHERE pid IS NULL OR pid = ""  -- 从顶层机构开始
        UNION ALL
        -- 递归添加子机构
        SELECT 
            o.rid, 
            o.name, 
            o.pid, 
            CONCAT(oh.full_path, "\\", o.name)  -- 父路径 + 反斜杠 + 当前机构
        FROM sys_organization o
        INNER JOIN org_hierarchy oh ON o.pid = oh.rid
        WHERE o.pid IS NOT NULL AND o.pid != ""
    )
    -- 查询目标机构的完整路径
    SELECT LEFT(full_path, 100) INTO v_full_path
    FROM org_hierarchy
    WHERE rid = v_org_id;
    -- 如果找到路径则返回
    IF v_full_path IS NOT NULL AND v_full_path != "" THEN
        RETURN LEFT(concat("我的公司\\",v_full_path),100);
    ELSE
        -- 如果没有找到（可能是单层机构），直接返回机构名称
        RETURN (SELECT LEFT(name, 100) FROM sys_organization WHERE rid = v_org_id);
    END IF;
END$
DELIMITER ;