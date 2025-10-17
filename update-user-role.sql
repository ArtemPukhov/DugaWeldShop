-- Проверяем текущую роль пользователя Artem
SELECT id, username, role FROM users WHERE username = 'Artem';

-- Обновляем роль на ADMIN
UPDATE users SET role = 'ADMIN' WHERE username = 'Artem';

-- Проверяем обновление
SELECT id, username, role FROM users WHERE username = 'Artem';

