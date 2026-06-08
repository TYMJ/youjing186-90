DROP VIEW IF EXISTS v_kh_xn1 ;
delimiter $
CREATE VIEW v_kh_xn1 AS (
  select kh_xn1.*
  from kh_xn1
);
delimiter;