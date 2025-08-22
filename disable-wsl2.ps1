# Скрипт для отключения WSL2 в Docker Desktop
# Выполняется, если Docker Desktop не запускается

Write-Host "Отключение WSL2 в Docker Desktop..." -ForegroundColor Green

# Путь к файлу настроек Docker Desktop
$settingsPath = "$env:USERPROFILE\AppData\Roaming\Docker\settings.json"

# Проверяем, существует ли файл настроек
if (Test-Path $settingsPath) {
    Write-Host "Найден файл настроек: $settingsPath" -ForegroundColor Cyan
    
    # Читаем текущие настройки
    $settings = Get-Content $settingsPath | ConvertFrom-Json
    
    # Отключаем WSL2
    $settings.wslEngineEnabled = $false
    
    # Сохраняем настройки
    $settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath
    
    Write-Host "WSL2 отключен в настройках Docker Desktop!" -ForegroundColor Green
    Write-Host "Теперь запустите Docker Desktop заново." -ForegroundColor Yellow
} else {
    Write-Host "Файл настроек не найден. Создаем новый..." -ForegroundColor Yellow
    
    # Создаем базовые настройки с отключенным WSL2
    $settings = @{
        wslEngineEnabled = $false
        useCredentialHelper = $false
        experimental = $false
    }
    
    # Создаем директорию, если её нет
    $settingsDir = Split-Path $settingsPath -Parent
    if (!(Test-Path $settingsDir)) {
        New-Item -ItemType Directory -Path $settingsDir -Force
    }
    
    # Сохраняем настройки
    $settings | ConvertTo-Json | Set-Content $settingsPath
    
    Write-Host "Создан файл настроек с отключенным WSL2!" -ForegroundColor Green
}

Write-Host "`nСледующие шаги:" -ForegroundColor Cyan
Write-Host "1. Закройте Docker Desktop (если запущен)" -ForegroundColor White
Write-Host "2. Запустите Docker Desktop заново" -ForegroundColor White
Write-Host "3. Проверьте, что WSL2 отключен в Settings -> General" -ForegroundColor White
