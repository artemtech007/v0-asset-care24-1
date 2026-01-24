-- Обновляем тестовые данные для тестирования админки
UPDATE clients 
SET first_name = 'Иван', last_name = 'Петров', phone = '+49123456789'
WHERE id = 'cid_wa_79196811458';

UPDATE requests 
SET category = 'Сантехника', description = 'Протечка крана в ванной'
WHERE id = 1;

UPDATE requests 
SET category = 'Электрика', description = 'Замена розетки в гостиной'
WHERE id = 2;

UPDATE requests 
SET category = 'Малярные работы', description = 'Покраска стен в спальне'
WHERE id = 3;

UPDATE requests 
SET category = 'Уборка', description = 'Генеральная уборка квартиры'
WHERE id = 4;

UPDATE requests 
SET category = 'Садовые работы', description = 'Обрезка кустов в саду'
WHERE id = 5;
