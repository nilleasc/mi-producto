# ============================================================
#  PASO 3: Ver datos de las tablas en la terminal
#  Muestra los productos y ventas almacenados en DynamoDB Local
# ============================================================

$AWS = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
$ENDPOINT = "http://localhost:8000"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Contenido de las tablas DynamoDB Local" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- Ver Productos ---
Write-Host ""
Write-Host "  TABLA: productos" -ForegroundColor Yellow
Write-Host "  -----------------------------------------" -ForegroundColor DarkGray
$productos = & $AWS dynamodb scan --table-name productos --endpoint-url $ENDPOINT 2>&1
if ($LASTEXITCODE -eq 0) {
    $result = $productos | ConvertFrom-Json
    Write-Host "  Total items: $($result.Count)" -ForegroundColor Green
    if ($result.Count -gt 0) {
        foreach ($item in $result.Items) {
            Write-Host "  - [$($item.sku.S)] $($item.nombre.S) - $($item.precio.N) $($item.moneda.S) (Stock: $($item.stock.N))" -ForegroundColor White
        }
    } else {
        Write-Host "  (Tabla vacia)" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  Error leyendo la tabla (asegurate que DynamoDB Local este corriendo)" -ForegroundColor Red
}

# --- Ver Ventas ---
Write-Host ""
Write-Host "  TABLA: ventas" -ForegroundColor Yellow
Write-Host "  -----------------------------------------" -ForegroundColor DarkGray
$ventas = & $AWS dynamodb scan --table-name ventas --endpoint-url $ENDPOINT 2>&1
if ($LASTEXITCODE -eq 0) {
    $result = $ventas | ConvertFrom-Json
    Write-Host "  Total ventas: $($result.Count)" -ForegroundColor Green
    if ($result.Count -gt 0) {
        foreach ($item in $result.Items) {
            Write-Host "  - ID: $($item.ventaId.S) | Total: $($item.total.N) | Cajero: $($item.cajero.S) | Fecha: $($item.fecha.S)" -ForegroundColor White
        }
    } else {
        Write-Host "  (Sin ventas aun)" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  Error leyendo la tabla" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
pause
