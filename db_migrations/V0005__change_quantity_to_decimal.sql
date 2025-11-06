-- Изменение типа quantity и min_stock на NUMERIC(10,3) для поддержки трёх знаков после запятой
ALTER TABLE t_p72161094_stock_management_exc.products 
  ALTER COLUMN quantity TYPE NUMERIC(10,3) USING quantity::NUMERIC(10,3);

ALTER TABLE t_p72161094_stock_management_exc.products 
  ALTER COLUMN min_stock TYPE NUMERIC(10,3) USING min_stock::NUMERIC(10,3);

-- Обновление значений по умолчанию
ALTER TABLE t_p72161094_stock_management_exc.products 
  ALTER COLUMN quantity SET DEFAULT 0.000;

ALTER TABLE t_p72161094_stock_management_exc.products 
  ALTER COLUMN min_stock SET DEFAULT 0.000;