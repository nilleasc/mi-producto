# Sales API Design

## Architecture
- **Layered Pattern:** Microservicios Serverless (AWS Lambda).
  - `domain`: Entities, Value Objects (`Money`).
  - `application`: Business Use Cases (`SaleService`).
  - `adapter`: Inbound/Outbound adapters (`CrearVentaHandler`, REST integrations via API Gateway).
  - `infrastructure`: Database configuration, Repositories (AWS DynamoDB SDK v2), `template.yml` (AWS SAM).

## Domain Model
- `Sale`: ventaId, fecha, total, items.
- `Product`: productoId, nombre, precio, stock.

## Tech Stack
- Java 17, AWS Lambda Core
- Amazon DynamoDB (NoSQL), Amazon API Gateway
- AWS SAM (Serverless Application Model) para IaC
- Gson, JUnit 5, Mockito

## API Endpoints
- `GET /productos`
- `GET /productos/search?q={query}`
- `POST /ventas`
