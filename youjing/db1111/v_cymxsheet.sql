DROP VIEW IF EXISTS v_cymxsheet;
delimiter $
CREATE VIEW v_cymxsheet AS (
  select *,0 xz,'' wgxyy,'' bbck
  from cymxsheet
);
delimiter;