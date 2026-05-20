# ============================================================
#  PASO 4: Compilar el backend Java para modo local
#  Genera el JAR que necesita SAM para ejecutar las Lambdas
# ============================================================

$mvn = "$PSScriptRoot\..\apache-maven-3.9.6\bin\mvn.cmd"
$backendDir = "$PSScriptRoot\.."

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🔨 Compilando backend Java con Maven" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-Not (Test-Path $mvn)) {
    Write-Host "❌ ERROR: No se encontro Maven en $mvn" -ForegroundColor Red
    pause
    exit 1
}

Push-Location $backendDir
& $mvn clean package -q
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Compilacion exitosa!" -ForegroundColor Green
    Write-Host "   JAR generado en: pos-backend\target\pos-backend-1.0.0.jar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📌 Proximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Asegurate que DynamoDB Local este corriendo (script 1)" -ForegroundColor White
    Write-Host "   2. Crea las tablas si no las has creado (script 2)" -ForegroundColor White
    Write-Host "   3. Prueba los endpoints con curl o Postman:" -ForegroundColor White
    Write-Host ""
    Write-Host "   GET  http://localhost:3000/productos" -ForegroundColor Yellow
    Write-Host "   POST http://localhost:3000/ventas" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ ERROR en la compilacion. Revisa los mensajes de error arriba." -ForegroundColor Red
}
pause
