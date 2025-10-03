-- Обновление цен товаров в сотнях тысяч рублей
UPDATE t_p72161094_stock_management_exc.products 
SET price = (RANDOM() * 500 + 100) * 1000,
    updated_at = NOW();