# ============================================================
#  PASO 1: Iniciar DynamoDB Local
# ============================================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🚀 INICIANDO DYNAMODB LOCAL (PUERTO 8000)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$jarPath = "$PSScriptRoot\..\dynamodb_local_latest"
if (Test-Path "$jarPath\DynamoDBLocal.jar") {
    Push-Location $jarPath
    java "-Djava.library.path=.\DynamoDBLocal_lib" -jar DynamoDBLocal.jar -sharedDb -port 8000
    Pop-Location
} else {
    Write-Host "❌ ERROR: No se encontro DynamoDBLocal.jar en $jarPath" -ForegroundColor Red
    pause
}
