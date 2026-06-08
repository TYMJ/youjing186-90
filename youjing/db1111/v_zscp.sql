DROP VIEW IF EXISTS v_zscp;
delimiter $
CREATE VIEW v_zscp AS (
  select *,0 fljg1,'' Field2,'' Field3,'' Field4,0 Field5,'' Field6,'' Field7,'' Field8,'' Field9,0 Field10,'' Field11,
    '' Field12,0 Field13,0 Field14,'' Field15,'' Field16,'' Field17,'' Field18
  from zscp
);
delimiter;