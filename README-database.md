# База данных PostgreSQL для DugaWeld

## Описание
PostgreSQL 15 для проекта DugaWeld Shop. Поддерживает как Docker, так и локальную установку.

## ⚠️ Важно: Решение проблем с WSL2

Если у вас возникают проблемы с Docker и WSL2, смотрите файл `WSL2-SETUP.md` для подробных инструкций по решению.

## Быстрое решение проблем

### Если Docker не работает:
1. Запустите `install-postgres-local.ps1` для локальной установки PostgreSQL
2. Или следуйте инструкциям в `WSL2-SETUP.md`

## Параметры подключения
- **Хост**: localhost
- **Порт**: 5432
- **База данных**: dugaweldDB
- **Пользователь**: postgres
- **Пароль**: postgres

## Запуск с помощью Docker Compose

### Запуск базы данных:
```bash
docker-compose up -d postgres
```

### Остановка:
```bash
docker-compose down
```

### Просмотр логов:
```bash
docker-compose logs postgres
```

## Запуск с помощью Docker

### Сборка образа:
```bash
docker build -f Dockerfile.postgres -t dugaweld-postgres .
```

### Запуск контейнера:
```bash
docker run -d \
  --name dugaweld-postgres \
  -e POSTGRES_DB=dugaweldDB \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  dugaweld-postgres
```

## Подключение к базе данных

### Через psql (внутри контейнера):
```bash
docker exec -it dugaweld-postgres psql -U postgres -d dugaweldDB
```

### Через внешний клиент:
- Host: localhost
- Port: 5432
- Database: dugaweldDB
- Username: postgres
- Password: postgres

## Переменные окружения

Можно переопределить параметры через переменные окружения:

```bash
export DB_USERNAME=your_username
export DB_PASSWORD=your_password
```

## Структура файлов

```
├── Dockerfile.postgres          # Dockerfile для PostgreSQL
├── docker-compose.yml           # Docker Compose конфигурация
├── init-scripts/                # Скрипты инициализации
│   └── 01-init.sql             # Базовый скрипт инициализации
└── README-database.md           # Этот файл
```

## Резервное копирование

### Создание бэкапа:
```bash
docker exec dugaweld-postgres pg_dump -U postgres dugaweldDB > backup.sql
```

### Восстановление из бэкапа:
```bash
docker exec -i dugaweld-postgres psql -U postgres dugaweldDB < backup.sql
```

## Мониторинг

### Статистика подключений:
```sql
SELECT * FROM pg_stat_activity;
```

### Статистика запросов:
```sql
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```
