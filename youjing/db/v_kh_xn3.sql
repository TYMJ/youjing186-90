DROP VIEW IF EXISTS v_kh_xn3 ;
delimiter $
CREATE VIEW v_kh_xn3 AS (
  select kh_xn3.*
  from kh_xn3
);
delimiter;