# Скрипт для установки PostgreSQL локально на Windows
# Альтернатива Docker для случаев, когда Docker не работает

Write-Host "Установка PostgreSQL локально..." -ForegroundColor Green

# Проверяем, установлен ли уже PostgreSQL
$postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($postgresService) {
    Write-Host "PostgreSQL уже установлен!" -ForegroundColor Yellow
    Write-Host "Сервис: $($postgresService.Name)" -ForegroundColor Cyan
    exit 0
}

# Скачиваем PostgreSQL
Write-Host "Скачивание PostgreSQL..." -ForegroundColor Green
$downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-15.7-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath
    Write-Host "Скачивание завершено!" -ForegroundColor Green
} catch {
    Write-Host "Ошибка при скачивании: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Устанавливаем PostgreSQL
Write-Host "Запуск установщика..." -ForegroundColor Green
Write-Host "В установщике используйте следующие параметры:" -ForegroundColor Yellow
Write-Host "- Порт: 5432" -ForegroundColor Cyan
Write-Host "- Пароль: postgres" -ForegroundColor Cyan
Write-Host "- База данных: dugaweldDB" -ForegroundColor Cyan

Start-Process -FilePath $installerPath -Wait

# Проверяем установку
$postgresService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($postgresService) {
    Write-Host "PostgreSQL успешно установлен!" -ForegroundColor Green
    Write-Host "Сервис: $($postgresService.Name)" -ForegroundColor Cyan
    
    # Запускаем сервис
    Start-Service $postgresService.Name
    Write-Host "Сервис PostgreSQL запущен!" -ForegroundColor Green
    
    # Создаем базу данных
    Write-Host "Создание базы данных dugaweldDB..." -ForegroundColor Green
    $env:PGPASSWORD = "postgres"
    createdb -U postgres -h localhost dugaweldDB
    
    Write-Host "Установка завершена!" -ForegroundColor Green
    Write-Host "Параметры подключения:" -ForegroundColor Cyan
    Write-Host "- Хост: localhost" -ForegroundColor White
    Write-Host "- Порт: 5432" -ForegroundColor White
    Write-Host "- База данных: dugaweldDB" -ForegroundColor White
    Write-Host "- Пользователь: postgres" -ForegroundColor White
    Write-Host "- Пароль: postgres" -ForegroundColor White
} else {
    Write-Host "Ошибка: PostgreSQL не был установлен!" -ForegroundColor Red
    exit 1
}

# Очистка
Remove-Item $installerPath -ErrorAction SilentlyContinue














