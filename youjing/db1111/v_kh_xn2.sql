DROP VIEW IF EXISTS v_kh_xn2 ;
delimiter $
CREATE VIEW v_kh_xn2 AS (
  select kh_xn2.*
  from kh_xn2
);
delimiter;