# Sales API Design

## Architecture
- **Layered Pattern:** Spring Boot 3.x with Clean Architecture.
  - `domain/entity`: JPA Entities (`Sale`, `SaleItem`, `Product`, `Customer`, `Receipt`), Enums (`SaleStatus`, `PaymentType`, `CreditStatus`).
  - `domain/valueobject`: Value Objects (`Money` — BigDecimal wrapper for precise monetary calculations).
  - `application/service`: Business logic (`SaleService`, `CustomerService`, `ReceiptService`).
  - `application/exception`: Custom exceptions mapped to HTTP status codes via `@ControllerAdvice`.
  - `adapter/in/web`: REST Controllers (`SaleController`, `ProductController`, `CustomerController`), DTOs with Jakarta Validation.
  - `infrastructure/persistence`: Spring Data JPA Repositories (H2 in-memory, PostgreSQL-compatible schema).
  - `infrastructure/scheduler`: Scheduled tasks (`FrozenSaleExpiryScheduler`).
  - `infrastructure/config`: Data seeding (`DataLoader`).

## Domain Model
- `Sale`: id, terminalId, cashierId, customerId, status, items[], subtotal, tax, discount, total, paymentType, amountReceived, changeAmount, transactionId, cancellationReason, frozenAt, timestamps.
- `SaleItem`: id, productId, productName, unitPrice, quantity, lineTotal.
- `Product`: id, sku, barcode, name, price, stock, categoryId, isActive.
- `Customer`: id, fullName, documentType, documentNumber, creditStatus.
- `Receipt`: id, transactionId, saleId, type, storeName, terminalId, cashierId, itemsJson, subtotal, tax, discount, total, paymentType, amountReceived, changeAmount, originalTransactionId, createdAt.

## Tech Stack
- Java 17, Spring Boot 3.2.5
- H2 Database (in-memory, PostgreSQL-compatible schema)
- Spring Data JPA / Hibernate
- Jakarta Bean Validation
- SpringDoc OpenAPI (Swagger UI)
- Lombok
- JUnit 5, Mockito, Spring Boot Test, JaCoCo (≥80% coverage)

## API Endpoints
- `POST /api/sales` — Create a new sale
- `POST /api/sales/{id}/items` — Add item to sale
- `PUT /api/sales/{id}/items/{itemId}` — Update item quantity
- `DELETE /api/sales/{id}/items/{itemId}` — Remove item
- `POST /api/sales/{id}/checkout` — Checkout (CASH/CREDIT)
- `POST /api/sales/{id}/freeze` — Freeze sale
- `POST /api/sales/{id}/resume` — Resume frozen sale
- `POST /api/sales/{id}/cancel` — Cancel sale
- `POST /api/sales/{id}/returns` — Full or partial return
- `PATCH /api/sales/{id}/customer` — Associate customer
- `GET /api/sales/frozen?terminalId=X` — List frozen sales
- `GET /api/sales/{id}/receipts` — Get receipts
- `GET /api/products` — List all products
- `GET /api/products/search?q=X` — Search by name
- `GET /api/products/barcode/{code}` — Search by barcode
- `GET /api/customers?name=X` — Search by name
- `GET /api/customers?document=X` — Search by document
