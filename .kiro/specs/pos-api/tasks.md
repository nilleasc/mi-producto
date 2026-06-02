# Implementation Tasks (Sales API — Spring Boot)

- [x] 1. Initialize Spring Boot 3.x project with H2, JPA, Validation, Lombok, SpringDoc OpenAPI, JaCoCo.
- [x] 2. Organize structure following Clean Architecture (`domain`, `application`, `adapter`, `infrastructure`).
- [x] 3. Create Domain Entities: `Sale`, `SaleItem`, `Product`, `Customer`, `Receipt` with JPA annotations.
- [x] 4. Create Enums: `SaleStatus` (6 states), `PaymentType` (CASH, CREDIT), `CreditStatus` (APPROVED, REJECTED, PENDING).
- [x] 5. Implement Value Object `Money` (BigDecimal wrapper with 2-decimal precision).
- [x] 6. Create Spring Data JPA Repositories with custom query methods.
- [x] 7. Create DTOs with Jakarta Bean Validation (`CreateSaleRequest`, `AddItemRequest`, `CheckoutRequest`, `CancelSaleRequest`, `ReturnRequest`).
- [x] 8. Implement custom exceptions and `GlobalExceptionHandler` (`@ControllerAdvice`) mapping to correct HTTP status codes.
- [x] 9. Implement `SaleService` with full lifecycle: create, add/update/remove items, checkout (CASH/CREDIT), freeze/resume, cancel, full/partial returns.
- [x] 10. Implement `CustomerService` for search by name and document number.
- [x] 11. Implement `ReceiptService` for generating sale and return receipts.
- [x] 12. Implement `FrozenSaleExpiryScheduler` (`@Scheduled`) to auto-cancel expired frozen sales.
- [x] 13. Create `DataLoader` to seed sample products and customers on startup.
- [x] 14. Implement REST Controllers: `SaleController` (10 endpoints), `ProductController` (4 endpoints), `CustomerController` (2 endpoints).
- [x] 15. Configure `application.properties` (H2, port 8088, tax rate, frozen expiry).
- [x] 16. Write unit tests with Mockito: `SaleServiceTest`, `CustomerServiceTest`, `ReceiptServiceTest`, `FrozenSaleExpirySchedulerTest`, `MoneyTest`.
- [x] 17. Write integration tests: `SaleIntegrationTest` with `@SpringBootTest` covering all major flows.
- [x] 18. Verify JaCoCo coverage ≥ 80% with `mvn clean test`.
