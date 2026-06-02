Write-Host "== Consultando Base de Datos (Ventas Registradas) ==" -ForegroundColor Cyan
try {
    $sales = Invoke-RestMethod -Uri "http://localhost:8088/api/v1/sales" -Method Get -ErrorAction Stop
    if ($sales -eq $null -or $sales.Count -eq 0) {
        Write-Host "Aún no hay ventas registradas en la base de datos." -ForegroundColor Yellow
    } else {
        $sales | Select-Object id, status, paymentType, total, createdAt | Format-Table -AutoSize
        Write-Host "Total de ventas encontradas: $($sales.Count)" -ForegroundColor Green
    }
} catch {
    Write-Host "Error: No se pudo conectar a la API. Asegúrate de que el servidor (npm run dev) esté corriendo." -ForegroundColor Red
}
