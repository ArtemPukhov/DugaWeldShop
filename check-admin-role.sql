-- Проверяем роль пользователя admin
SELECT id, username, role FROM users WHERE username = 'admin';

-- Если роль не ADMIN, обновляем:
-- UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

