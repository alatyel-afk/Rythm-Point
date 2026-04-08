# Создаёт ярлык на рабочем столе: «Протокол дня» → Start-Protocol.ps1
# Запуск: правый клик → «Выполнить с помощью PowerShell» или из PowerShell:
#   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
#   .\New-DesktopShortcut.ps1

$ErrorActionPreference = "Stop"
$launcher = Join-Path $PSScriptRoot "Start-Protocol.ps1"
if (-not (Test-Path $launcher)) {
    Write-Error "Не найден Start-Protocol.ps1 рядом со скриптом."
}

$desktop = [Environment]::GetFolderPath("Desktop")
$lnkPath = Join-Path $desktop "Протокол дня.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut($lnkPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.WindowStyle = 1
$shortcut.Description = "Джйотиш · питание — локальный протокол дня"
$iconSvg = Join-Path (Split-Path -Parent $PSScriptRoot) "frontend\public\icons\app-icon.svg"
if (Test-Path $iconSvg) {
    # Windows ярлык не всегда берёт SVG; пробуем системную иконку как запас
    $shortcut.IconLocation = "$env:SystemRoot\System32\imageres.dll,104"
}
$shortcut.Save()

Write-Host "Ярлык создан: $lnkPath" -ForegroundColor Green
