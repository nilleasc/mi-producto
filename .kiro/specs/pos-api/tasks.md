# Implementation Tasks (Sales API - Serverless)

- [x] 1. Initialize Maven Java project with AWS dependencies (Lambda Core, DynamoDB SDK v2, Gson).
- [x] 2. Organize structure following Hexagonal Architecture (`domain`, `application`, `adapter`, `infrastructure`).
- [x] 3. Create Domain Models (`Sale`, `Product` for NoSQL).
- [x] 4. Implement Value Object `Money` / `BigDecimal` logic for calculations.
- [x] 5. Create DynamoDB Repository implementation in `infrastructure` using AWS SDK v2.
- [x] 6. Implement `CrearVentaHandler` for AWS Lambda to process incoming sales.
- [x] 7. Implement checkout logic (calculate totals, decrement stock).
- [x] 8. Expose REST endpoints via AWS API Gateway in `template.yml`.
- [x] 9. Create IaC with AWS SAM (`template.yml`) to define DynamoDB tables and Lambda triggers.
- [x] 10. Write unit and integration tests (with Mockito).
- [x] 11. Test local build with `mvn clean package`.
