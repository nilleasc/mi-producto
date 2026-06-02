# AWS Integration (Placeholder)

Este directorio contiene **placeholders** para futura integración con AWS.

## ⚠️ IMPORTANTE

**NO hay integración real con AWS en este momento.**

Los archivos en este directorio son:
- Estructuras de código preparadas
- Interfaces y contratos definidos
- NO contienen credenciales
- NO realizan llamadas reales a AWS
- NO requieren AWS SDK instalado

## 📁 Archivos

### DynamoProductRepository.ts
Repositorio de productos usando DynamoDB.

**Futuras operaciones**:
- `GetItem` - Obtener producto por ID
- `Query` - Buscar productos por criterios
- `Scan` - Escanear catálogo completo
- `BatchGetItem` - Obtener múltiples productos

**Tabla DynamoDB esperada**:
```
Table: pos-productos
Partition Key: productoId (String)
GSI: codigoBarras-index
GSI: categoria-index
```

### DynamoSalesRepository.ts
Repositorio de ventas usando DynamoDB.

**Futuras operaciones**:
- `PutItem` - Guardar venta
- `GetItem` - Obtener venta por ID
- `Query` - Buscar ventas por fecha
- `Scan` - Listar todas las ventas

**Tabla DynamoDB esperada**:
```
Table: pos-ventas
Partition Key: ventaId (String)
Sort Key: timestamp (String)
GSI: fecha-index
```

### LambdaApiClient.ts
Cliente para Lambda functions via API Gateway.

**Futuras funciones Lambda**:
- `procesarVenta` - Procesar una venta
- `validarStock` - Validar disponibilidad
- `calcularDescuentos` - Aplicar reglas de negocio
- `generarRecibo` - Generar recibo PDF

**API Gateway esperado**:
```
POST /api/v1/ventas
GET  /api/v1/ventas/{id}
GET  /api/v1/productos/{id}
POST /api/v1/productos/search
```

## 🔧 Configuración Futura

Cuando se implemente la integración real, se necesitará:

### 1. Variables de Entorno
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
DYNAMODB_PRODUCTOS_TABLE=pos-productos
DYNAMODB_VENTAS_TABLE=pos-ventas
API_GATEWAY_URL=https://xxx.execute-api.us-east-1.amazonaws.com
```

### 2. Dependencias NPM
```bash
npm install @aws-sdk/client-dynamodb
npm install @aws-sdk/lib-dynamodb
npm install @aws-sdk/client-lambda
npm install @aws-sdk/signature-v4
```

### 3. IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/pos-productos",
        "arn:aws:dynamodb:*:*:table/pos-ventas"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:*:*:function:pos-*"
    }
  ]
}
```

## 🏗️ Arquitectura Futura

```
Frontend (Next.js)
    ↓
DependencyProvider
    ↓
DynamoProductRepository ──→ DynamoDB (pos-productos)
DynamoSalesRepository   ──→ DynamoDB (pos-ventas)
LambdaApiClient         ──→ API Gateway ──→ Lambda
```

## 🧪 Testing Local

Para testing local sin AWS real:

1. **DynamoDB Local**:
```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

2. **LocalStack**:
```bash
docker run -p 4566:4566 localstack/localstack
```

3. **Mock Adapters**:
Usar `MockDependencyProvider` con implementaciones mock.

## 📝 Próximos Pasos

Cuando se implemente la integración real:

1. ✅ Instalar AWS SDK
2. ✅ Configurar credenciales
3. ✅ Crear tablas DynamoDB
4. ✅ Desplegar Lambda functions
5. ✅ Configurar API Gateway
6. ✅ Implementar métodos en repositorios
7. ✅ Agregar retry logic
8. ✅ Agregar circuit breaker
9. ✅ Agregar monitoring (CloudWatch)
10. ✅ Agregar tests de integración

## 🔐 Seguridad

**NUNCA** commitear:
- Credenciales AWS
- Access Keys
- Secret Keys
- API Keys
- Tokens

Usar:
- AWS IAM Roles (recomendado)
- AWS Secrets Manager
- Environment variables
- AWS Systems Manager Parameter Store
