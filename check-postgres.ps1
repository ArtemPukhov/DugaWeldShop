# Скрипт для проверки и настройки PostgreSQL

Write-Host "Проверка PostgreSQL..." -ForegroundColor Green

# Добавляем путь к PostgreSQL в PATH
$env:PATH += ";C:\Program Files\PostgreSQL\15\bin"

# Проверяем статус сервиса
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Сервис PostgreSQL: $($service.Status)" -ForegroundColor Cyan
    
    if ($service.Status -ne "Running") {
        Write-Host "Запускаем сервис PostgreSQL..." -ForegroundColor Yellow
        Start-Service $service.Name
        Start-Sleep -Seconds 3
    }
} else {
    Write-Host "Сервис PostgreSQL не найден!" -ForegroundColor Red
    exit 1
}

# Устанавливаем пароль
$env:PGPASSWORD = "postgres"

# Проверяем подключение
Write-Host "Проверка подключения к PostgreSQL..." -ForegroundColor Green
try {
    $result = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Подключение успешно!" -ForegroundColor Green
        Write-Host $result -ForegroundColor Cyan
    } else {
        Write-Host "Ошибка подключения: $result" -ForegroundColor Red
    }
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем список баз данных
Write-Host "`nСписок баз данных:" -ForegroundColor Green
try {
    $databases = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
    if ($LASTEXITCODE -eq 0) {
        Write-Host $databases -ForegroundColor Cyan
    }
} catch {
    Write-Host "Ошибка при получении списка баз данных: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем, существует ли база данных dugaweldDB
Write-Host "`nПроверка базы данных dugaweldDB..." -ForegroundColor Green
try {
    $checkDB = & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -h localhost -d dugaweldDB -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "База данных dugaweldDB существует!" -ForegroundColor Green
    } else {
        Write-Host "База данных dugaweldDB не найдена. Создаем..." -ForegroundColor Yellow
        $createDB = & "C:\Program Files\PostgreSQL\15\bin\createdb.exe" -U postgres -h localhost dugaweldDB
        if ($LASTEXITCODE -eq 0) {
            Write-Host "База данных dugaweldDB создана!" -ForegroundColor Green
        } else {
            Write-Host "Ошибка создания базы данных: $createDB" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nПараметры подключения:" -ForegroundColor Cyan
Write-Host "- Хост: localhost" -ForegroundColor White
Write-Host "- Порт: 5432" -ForegroundColor White
Write-Host "- База данных: dugaweldDB" -ForegroundColor White
Write-Host "- Пользователь: postgres" -ForegroundColor White
Write-Host "- Пароль: postgres" -ForegroundColor White




















