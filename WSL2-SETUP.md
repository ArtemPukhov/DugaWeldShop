# Решение проблемы WSL2 для Docker Desktop

## Проблема
Ошибка: "Не найден поставщик поддержки виртуального диска для указанного файла"

## Решение

### 1. Включение виртуализации в BIOS
1. Перезагрузите компьютер и войдите в BIOS
2. Найдите настройки виртуализации (обычно в разделе Advanced или CPU Configuration)
3. Включите:
   - Intel VT-x (для Intel процессоров)
   - AMD-V (для AMD процессоров)
   - SVM Mode
4. Сохраните настройки и перезагрузитесь

### 2. Включение компонентов Windows (требуются права администратора)

Откройте PowerShell **от имени администратора** и выполните:

```powershell
# Включение WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Включение платформы виртуальной машины
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Перезагрузка
shutdown /r /t 0
```

### 3. Установка WSL2 ядра
После перезагрузки скачайте и установите:
https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi

### 4. Установка дистрибутива Linux
```powershell
wsl --install -d Ubuntu
```

### 5. Настройка WSL2 как версии по умолчанию
```powershell
wsl --set-default-version 2
```

### 6. Перезапуск Docker Desktop
1. Закройте Docker Desktop
2. Запустите Docker Desktop заново
3. В настройках Docker Desktop убедитесь, что выбран "Use WSL 2 based engine"

## Альтернативное решение (если WSL2 не работает)

### Использование Hyper-V вместо WSL2
1. В Docker Desktop перейдите в Settings → General
2. Снимите галочку "Use WSL 2 based engine"
3. Перезапустите Docker Desktop

### Использование готового образа PostgreSQL
Используйте упрощенный docker-compose.yml (уже создан):
```yaml
services:
  postgres:
    image: postgres:15-alpine
    # ... остальные настройки
```

## Проверка работы
```powershell
# Проверка WSL
wsl --status

# Проверка Docker
docker info

# Запуск базы данных
docker-compose up -d postgres
```

## Полезные команды
```powershell
# Остановка WSL
wsl --shutdown

# Список дистрибутивов
wsl --list --verbose

# Удаление дистрибутива
wsl --unregister docker-desktop
```


















