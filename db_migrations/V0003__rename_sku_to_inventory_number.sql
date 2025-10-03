-- Переименование колонки sku в inventory_number
ALTER TABLE t_p72161094_stock_management_exc.products 
RENAME COLUMN sku TO inventory_number;

-- Обновление комментария к колонке
COMMENT ON COLUMN t_p72161094_stock_management_exc.products.inventory_number IS 'Инвентарный номер товара';