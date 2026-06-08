DROP VIEW IF EXISTS v_xsht ;
delimiter $
CREATE VIEW v_xsht AS (
  select xsht.*,(select Group_concat(distinct cght.cgddh) from  cght where cght.HONo=xsht.HONo limit 1) cgdd
  from xsht
);
delimiter;