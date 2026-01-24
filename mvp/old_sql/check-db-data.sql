-- Проверка данных в таблицах
SELECT 'CLIENTS DATA:' as section;
SELECT id, first_name, last_name, phone, status, created_at 
FROM clients 
LIMIT 5;

SELECT 'MASTERS DATA:' as section;
SELECT id, first_name, last_name, phone, status, created_at 
FROM masters 
LIMIT 5;

SELECT 'REQUESTS DATA:' as section;
SELECT id, client_id, status, description, created_at 
FROM requests 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'VIEW_ALL_USERS DATA:' as section;
SELECT * FROM view_all_users LIMIT 5;
