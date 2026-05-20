# ============================================================
#  PASO 5: Iniciar Servidor API Local (puerto 3000)
#  Levanta un servidor HTTP ligero para pruebas de frontend
# ============================================================

$mvn = "$PSScriptRoot\..\apache-maven-3.9.6\bin\mvn.cmd"
$backendDir = "$PSScriptRoot\.."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🚀 INICIANDO API LOCAL (PUERTO 3000)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-Not (Test-Path "$backendDir\target\pos-backend-1.0.0.jar")) {
    Write-Host "Compilando backend..." -ForegroundColor Yellow
    Push-Location $backendDir
    & $mvn package -q
    Pop-Location
} else {
    Write-Host "JAR encontrado, saltando compilacion (usa script 4 si hay cambios en codigo)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Iniciando servidor (Ctrl+C para detener)..." -ForegroundColor Yellow

$env:IS_LOCAL = "true"
Push-Location $backendDir
java -DIS_LOCAL=true -cp "target\pos-backend-1.0.0.jar" com.pos.LocalApiServer
Pop-Location
