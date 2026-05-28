# ============================================================
#  PASO 2: Crear Tablas en DynamoDB Local
# ============================================================
$AWS = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
if (-Not (Test-Path $AWS)) {
    $AWS = "aws"
}
$ENDPOINT = "http://localhost:8000"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  🛠️ Creando Tablas en DynamoDB Local" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si DynamoDB local responde
$test = & $AWS dynamodb list-tables --endpoint-url $ENDPOINT 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: No se puede conectar a DynamoDB Local en $ENDPOINT." -ForegroundColor Red
    Write-Host "Asegurate de que el Paso 1 (DynamoDB Local) este corriendo en otra ventana de terminal." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Crear Tabla Ventas
Write-Host "Creando tabla 'ventas'..." -ForegroundColor Yellow
$crearVentas = & $AWS dynamodb create-table `
    --table-name ventas `
    --attribute-definitions AttributeName=ventaId,AttributeType=S `
    --key-schema AttributeName=ventaId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --endpoint-url $ENDPOINT 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tabla 'ventas' creada con exito." -ForegroundColor Green
} else {
    if ($crearVentas -like "*ResourceInUseException*") {
        Write-Host "ℹ️ La tabla 'ventas' ya existe." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al crear tabla 'ventas': $crearVentas" -ForegroundColor Red
    }
}

# Crear Tabla Productos
Write-Host "Creando tabla 'productos'..." -ForegroundColor Yellow
$crearProductos = & $AWS dynamodb create-table `
    --table-name productos `
    --attribute-definitions AttributeName=productoId,AttributeType=S `
    --key-schema AttributeName=productoId,KeyType=HASH `
    --billing-mode PAY_PER_REQUEST `
    --endpoint-url $ENDPOINT 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tabla 'productos' creada con exito." -ForegroundColor Green
    
    # Insertar productos semilla
    Write-Host "Insertando productos semilla..." -ForegroundColor Yellow
    
    # Producto 1
    & $AWS dynamodb put-item --table-name productos --endpoint-url $ENDPOINT --item '{
        "productoId": {"S": "PROD-LECHE"},
        "sku": {"S": "1001"},
        "nombre": {"S": "Leche Entera 1L"},
        "precio": {"N": "3200"},
        "moneda": {"S": "COP"},
        "stock": {"N": "50"}
    }' | Out-Null

    # Producto 2
    & $AWS dynamodb put-item --table-name productos --endpoint-url $ENDPOINT --item '{
        "productoId": {"S": "PROD-PAN"},
        "sku": {"S": "1002"},
        "nombre": {"S": "Pan Tajado Familiar"},
        "precio": {"N": "4500"},
        "moneda": {"S": "COP"},
        "stock": {"N": "30"}
    }' | Out-Null

    # Producto 3
    & $AWS dynamodb put-item --table-name productos --endpoint-url $ENDPOINT --item '{
        "productoId": {"S": "PROD-ARROZ"},
        "sku": {"S": "1003"},
        "nombre": {"S": "Arroz Blanco 1Kg"},
        "precio": {"N": "3800"},
        "moneda": {"S": "COP"},
        "stock": {"N": "100"}
    }' | Out-Null
    
    Write-Host "✅ Productos semilla insertados." -ForegroundColor Green
} else {
    if ($crearProductos -like "*ResourceInUseException*") {
        Write-Host "ℹ️ La tabla 'productos' ya existe." -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al crear tabla 'productos': $crearProductos" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
pause
