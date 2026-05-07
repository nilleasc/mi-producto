# Implementation Tasks — Enterprise POS Frontend

## Task Overview

Tasks are ordered by dependency. Each task references the requirements and design sections it implements. Complete tasks in order — later tasks depend on earlier ones.

---

## Phase 1: Project Foundation & Architecture

- [x] 1. Initialize Next.js 14+ project with strict TypeScript configuration
  - [x] 1.1 Bootstrap Next.js 14 project with App Router using `create-next-app`
  - [x] 1.2 Configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUncheckedIndexedAccess: true`
  - [x] 1.3 Install and configure Tailwind CSS, Radix UI, Zustand, TanStack Query v5, Zod, React Hook Form, `idb`, `fast-check`
  - [x] 1.4 Configure ESLint with `@typescript-eslint/strict` ruleset and Prettier
  - [x] 1.5 Set up Vitest + React Testing Library + Playwright
  - [x] 1.6 Create the full folder structure: `src/domain/`, `src/infrastructure/`, `src/app/`, `src/components/`, `src/hooks/`, `src/stores/`
  - [x] 1.7 Add ESLint rule to forbid imports of `react`, `next`, or third-party libs from `src/domain/`
  - *References: Requirement 1, Design § Project Structure*

- [x] 2. Implement domain value objects
  - [x] 2.1 Implement `Money` value object with integer-cent arithmetic, `add`, `subtract`, `multiply`, currency guard
  - [x] 2.2 Implement `SKU` value object with format validation
  - [x] 2.3 Implement `Email` value object with RFC-compliant validation
  - [x] 2.4 Implement `PhoneNumber` value object
  - [x] 2.5 Implement `TransactionId` value object (UUID v4)
  - [x] 2.6 Write PBT properties for `Money`: commutativity of add, no negative results, currency mismatch throws
  - *References: Requirement 1, Design § Value Objects*

- [x] 3. Define all domain entities and ports
  - [x] 3.1 Define `Product`, `ProductVariant`, `Category` entities
  - [x] 3.2 Define `Cart`, `CartItem` entities
  - [x] 3.3 Define `Transaction`, `TenderEntry`, `Receipt` entities
  - [x] 3.4 Define `Customer`, `LoyaltyAccount` entities
  - [x] 3.5 Define `Shift`, `Terminal`, `User` entities
  - [x] 3.6 Define `Discount`, `Coupon`, `Tax` entities
  - [x] 3.7 Define `Refund`, `InventoryItem`, `StockAdjustment` entities
  - [x] 3.8 Define all Repository Ports: `IProductRepository`, `ICartRepository`, `ITransactionRepository`, `ICustomerRepository`, `IInventoryRepository`, `IShiftRepository`
  - [x] 3.9 Define all Service Ports: `IAuthService`, `IPaymentService`, `IDiscountService`, `IPrintService`, `ILoggingService`, `IMetricsService`, `ISyncService`
  - *References: Requirement 1, Design § Core Entities, § Ports*

- [ ] 4. Implement RBAC policies
  - [ ] 4.1 Define `PERMISSIONS` const object with all permission strings
  - [ ] 4.2 Define `ROLE_PERMISSIONS` map for `cashier`, `manager`, `admin`
  - [ ] 4.3 Implement `hasPermission(role, permission): boolean` pure function
  - [ ] 4.4 Write unit tests: cashier cannot access admin permissions, admin has all permissions
  - *References: Requirement 2.6, Requirement 11.4, Design § RBAC Policies*

---

## Phase 2: Infrastructure Adapters

- [~] 5. Implement HTTP API client and base adapters
  - [ ] 5.1 Implement `ApiClient` wrapper with request/response interceptors, auth header injection, and error normalization
  - [ ] 5.2 Define all API endpoint constants in `infrastructure/http/endpoints.ts`
  - [ ] 5.3 Implement `HttpProductRepository` with Zod validation on all responses
  - [ ] 5.4 Implement `HttpCartRepository`
  - [ ] 5.5 Implement `HttpTransactionRepository`
  - [ ] 5.6 Implement `HttpCustomerRepository`
  - [ ] 5.7 Implement `HttpInventoryRepository`
  - [ ] 5.8 Implement `HttpShiftRepository`
  - *References: Requirement 1.5, Requirement 15.7, Design § HTTP Adapter*

- [~] 6. Implement offline IndexedDB adapters
  - [ ] 6.1 Define IndexedDB schema and initialize database via `idb` in `infrastructure/offline/db.ts`
  - [ ] 6.2 Implement `IndexedDbTransactionRepository` with `findPendingSync` method
  - [ ] 6.3 Implement `IndexedDbProductRepository` for offline product cache
  - [ ] 6.4 Implement `IndexedDbCartRepository` for offline cart persistence
  - [ ] 6.5 Implement `syncQueue.ts` — FIFO queue for pending transactions
  - [ ] 6.6 Implement `conflictResolver.ts` — marks conflicting transactions for Manager review
  - *References: Requirement 12, Design § Offline Strategy, § IndexedDB Schema*

- [~] 7. Implement service adapters
  - [ ] 7.1 Implement `JwtAuthService` implementing `IAuthService` with token refresh logic
  - [ ] 7.2 Implement `SentryLoggingService` implementing `ILoggingService`
  - [ ] 7.3 Implement `WebVitalsMetricsService` implementing `IMetricsService` using `web-vitals`
  - [ ] 7.4 Implement `ThermalPrintService` implementing `IPrintService`
  - [ ] 7.5 Implement `RestDiscountService` implementing `IDiscountService`
  - [ ] 7.6 Implement `BackgroundSyncService` implementing `ISyncService`
  - *References: Requirement 13.1, Requirement 16, Design § Infrastructure Layer*

- [~] 8. Implement DI containers
  - [ ] 8.1 Implement `authContainer.ts` — wires `JwtAuthService` into auth use cases
  - [ ] 8.2 Implement `cartContainer.ts` — wires repos and services into cart use cases, switches between online/offline adapters
  - [ ] 8.3 Implement `paymentContainer.ts`
  - [ ] 8.4 Implement `customerContainer.ts`
  - [ ] 8.5 Implement `inventoryContainer.ts`
  - [ ] 8.6 Implement `reportsContainer.ts`
  - *References: Requirement 1.5, Design § DI Container*

---

## Phase 3: Domain Use Cases

- [~] 9. Implement authentication use cases
  - [ ] 9.1 Implement `LoginUseCase` — validates credentials via `IAuthService`, returns session
  - [ ] 9.2 Implement `LogoutUseCase` — invalidates session, clears tokens, logs event
  - [ ] 9.3 Implement `RefreshTokenUseCase` — silently refreshes access token before expiry
  - [ ] 9.4 Write unit tests for all auth use cases with mock `IAuthService`
  - *References: Requirement 2*

- [~] 10. Implement cart use cases
  - [ ] 10.1 Implement `AddItemToCartUseCase` — validates stock, updates cart, recalculates totals
  - [ ] 10.2 Implement `RemoveItemFromCartUseCase` — removes item, recalculates totals
  - [ ] 10.3 Implement `ApplyDiscountUseCase` — validates discount, applies to item or cart
  - [ ] 10.4 Implement `ApplyCouponUseCase` — validates coupon via `IDiscountService`, applies benefit
  - [ ] 10.5 Implement `ClearCartUseCase` — clears all items, logs audit event
  - [ ] 10.6 Implement cart total calculation: `subtotal + tax - discounts = total`
  - [ ] 10.7 Write PBT: `total === subtotal + tax - discounts` for any item combination; discount never makes total negative
  - *References: Requirement 5, Design § Use Cases*

- [~] 11. Implement payment use cases
  - [ ] 11.1 Implement `ProcessPaymentUseCase` — initiates payment via `IPaymentService`, handles result
  - [ ] 11.2 Implement `ProcessSplitPaymentUseCase` — accumulates tenders until total is covered
  - [ ] 11.3 Implement `CompleteTransactionUseCase` — creates immutable Transaction, decrements inventory, generates Receipt
  - [ ] 11.4 Write PBT: sum of all tenders always equals transaction total for split payments
  - *References: Requirement 6, Requirement 9.1*

- [~] 12. Implement shift use cases
  - [ ] 12.1 Implement `OpenShiftUseCase` — records opening cash, timestamp, cashier, terminal
  - [ ] 12.2 Implement `CloseShiftUseCase` — validates no pending transactions, calculates cash difference, generates report
  - [ ] 12.3 Write unit tests: close shift blocked when pending transaction exists
  - *References: Requirement 3*

- [~] 13. Implement refund and void use cases
  - [ ] 13.1 Implement `ProcessRefundUseCase` — requires Manager authorization, supports partial/full refund, restores inventory
  - [ ] 13.2 Implement `VoidTransactionUseCase` — cancels in-progress transaction, releases resources
  - [ ] 13.3 Write unit tests: void blocked on completed transactions; refund creates new Refund entity
  - *References: Requirement 7*

- [~] 14. Implement customer use cases
  - [ ] 14.1 Implement `FindCustomerUseCase` — searches by name, email, phone
  - [ ] 14.2 Implement `CreateCustomerUseCase` — validates unique email, creates record
  - [ ] 14.3 Implement `UpdateCustomerUseCase` — records change history with Manager ID and timestamp
  - [ ] 14.4 Implement loyalty points calculation logic in domain
  - *References: Requirement 8*

- [~] 15. Implement inventory use cases
  - [ ] 15.1 Implement `AdjustInventoryUseCase` — requires reason, records before/after values
  - [ ] 15.2 Implement `TransferStockUseCase` — records origin, destination, Manager authorization
  - *References: Requirement 9*

---

## Phase 4: Zustand Stores & Custom Hooks

- [~] 16. Implement Zustand stores
  - [x] 16.1 Implement `cartStore` with encrypted `persist` middleware, multi-cart support
  - [ ] 16.2 Implement `authStore` — session state, role, permissions (in-memory only, no persistence)
  - [ ] 16.3 Implement `shiftStore` — active shift state, elapsed time
  - [ ] 16.4 Implement `offlineStore` — connectivity status, pending sync count
  - *References: Requirement 5.8, Requirement 5.10, Requirement 15.3, Design § State Management*

- [~] 17. Implement custom hooks
  - [ ] 17.1 Implement `useCart` — wraps cart use cases from DI container, exposes cart state and actions
  - [ ] 17.2 Implement `useProducts` — TanStack Query for product search with 300ms debounce
  - [ ] 17.3 Implement `useCustomer` — customer search and selection
  - [ ] 17.4 Implement `usePayment` — payment flow state machine
  - [ ] 17.5 Implement `useShift` — shift open/close flow
  - [ ] 17.6 Implement `useOfflineStatus` — detects connectivity loss within 5 seconds, triggers offline mode
  - [ ] 17.7 Implement `usePermission(permission)` — returns boolean based on current user role
  - [ ] 17.8 Implement `useInactivityLock` — 5-minute inactivity timer, triggers screen lock
  - *References: Requirement 2.4, Requirement 12.2, Requirement 15.5, Design § Component Architecture*

---

## Phase 5: Next.js App Router & Layouts

- [~] 18. Configure Next.js security and middleware
  - [ ] 18.1 Implement `middleware.ts` — route protection and RBAC enforcement
  - [ ] 18.2 Configure CSP headers in `next.config.js`
  - [ ] 18.3 Configure `SameSite=Strict` cookie settings for auth tokens
  - [ ] 18.4 Implement global Error Boundary in `app/error.tsx` with logging context
  - *References: Requirement 15.1, Requirement 15.4, Requirement 16.3, Design § Middleware*

- [~] 19. Implement route layouts and guards
  - [ ] 19.1 Implement root `app/layout.tsx` with TanStack Query provider, Zustand provider, theme provider
  - [ ] 19.2 Implement `app/(auth)/layout.tsx` — redirects authenticated users away from login
  - [ ] 19.3 Implement `app/(pos)/layout.tsx` — auth guard + active shift guard
  - [ ] 19.4 Implement `app/(manager)/layout.tsx` — requires manager or admin role
  - [ ] 19.5 Implement `app/(admin)/layout.tsx` — requires admin role
  - *References: Requirement 2.1, Requirement 2.7, Requirement 3.1, Design § Route Protection*

- [~] 20. Implement authentication pages
  - [ ] 20.1 Implement `app/(auth)/login/page.tsx` — login form with React Hook Form + Zod
  - [ ] 20.2 Implement MFA step component — shown after primary credential validation when MFA is enabled
  - [ ] 20.3 Implement screen lock overlay component — shown on inactivity, requires PIN
  - *References: Requirement 2.1–2.10, Requirement 15.5*

---

## Phase 6: Core POS UI Components

- [~] 21. Implement primitive UI components
  - [ ] 21.1 Implement `Button` — variants (primary, secondary, danger), loading state, min 44×44px touch target
  - [ ] 21.2 Implement `Input` — with label, error state, DOMPurify sanitization on value
  - [ ] 21.3 Implement `Modal` — accessible (Radix Dialog), focus trap, keyboard dismissal
  - [ ] 21.4 Implement `Skeleton` — for async loading states >200ms
  - [ ] 21.5 Implement `Toast` — success/error/warning variants
  - [ ] 21.6 Implement `OfflineBanner` — shows pending sync count, offline indicator
  - [ ] 21.7 Ensure all components meet WCAG 2.1 AA: ARIA labels, color contrast, keyboard navigation
  - *References: Requirement 14*

- [~] 22. Implement product catalog components
  - [x] 22.1 Implement `ProductSearch` — debounced input, barcode scanner input handler
  - [x] 22.2 Implement `ProductCard` — displays name, SKU, price, stock status badges ("Sin stock", "Stock bajo")
  - [x] 22.3 Implement `ProductGrid` — paginated grid (20 items/page), category filter tabs
  - [ ] 22.4 Implement `VariantSelector` — modal for selecting product variants before adding to cart
  - *References: Requirement 4*

- [~] 23. Implement cart components
  - [x] 23.1 Implement `CartItem` — quantity editor, item discount, remove button
  - [x] 23.2 Implement `CartTotals` — pure display: subtotal, tax breakdown, discounts, total
  - [x] 23.3 Implement `CartPanel` — list of CartItems + CartTotals + coupon input + hold/resume controls
  - [ ] 23.4 Implement multi-cart tab bar — shows up to N carts on hold, allows switching
  - *References: Requirement 5*

- [~] 24. Implement payment components
  - [ ] 24.1 Implement `CashTender` — amount input, real-time change calculation
  - [ ] 24.2 Implement `CardTender` — terminal status display, polling for payment result
  - [ ] 24.3 Implement `SplitTender` — multi-tender accumulator, shows remaining balance
  - [ ] 24.4 Implement `PaymentModal` — orchestrates tender selection and payment flow
  - [ ] 24.5 Implement `ReceiptPreview` — HTML receipt with print and email options
  - *References: Requirement 6, Requirement 13*

- [~] 25. Implement shift management components
  - [ ] 25.1 Implement `OpenShiftForm` — opening cash declaration form
  - [ ] 25.2 Implement `CloseShiftSummary` — transactions grouped by tender, cash difference
  - [ ] 25.3 Implement `ShiftStatusBar` — elapsed time, accumulated sales summary
  - *References: Requirement 3*

---

## Phase 7: Manager & Admin Screens

- [~] 26. Implement refund screen
  - [ ] 26.1 Implement transaction search UI (by number, date, customer)
  - [ ] 26.2 Implement Manager PIN authorization modal
  - [ ] 26.3 Implement partial/full refund item selector
  - [ ] 26.4 Implement refund confirmation and receipt generation
  - *References: Requirement 7*

- [~] 27. Implement customer management screen
  - [ ] 27.1 Implement customer search panel with 500ms debounce
  - [ ] 27.2 Implement customer profile card — loyalty points, credit, recent purchases
  - [ ] 27.3 Implement new customer registration form with duplicate email detection
  - [ ] 27.4 Implement customer edit form (Manager only) with change history display
  - *References: Requirement 8*

- [~] 28. Implement inventory management screen
  - [ ] 28.1 Implement inventory list with real-time low-stock alerts
  - [ ] 28.2 Implement stock adjustment form — requires reason, shows before/after
  - [ ] 28.3 Implement physical count workflow — hidden expected values, discrepancy report
  - [ ] 28.4 Implement stock transfer form between branches
  - *References: Requirement 9*

- [~] 29. Implement reports and analytics screen
  - [ ] 29.1 Implement real-time dashboard — daily sales, transaction count, average ticket, day-over-day comparison
  - [ ] 29.2 Implement date range report selector with server-side pagination
  - [ ] 29.3 Implement chart components (bar, line, pie) via `RechartsChartService` adapter
  - [ ] 29.4 Implement CSV and PDF export functionality
  - [ ] 29.5 Implement recurring report scheduler UI
  - *References: Requirement 10*

- [~] 30. Implement settings and configuration screen
  - [ ] 30.1 Implement company and branch configuration forms
  - [ ] 30.2 Implement terminal registration with activation code generation
  - [ ] 30.3 Implement role and permission management UI
  - [ ] 30.4 Implement tax configuration (applies to new transactions only)
  - [ ] 30.5 Implement external integrations configuration panel
  - *References: Requirement 11*

---

## Phase 8: Offline Support & Sync

- [~] 31. Implement offline detection and mode switching
  - [ ] 31.1 Implement network status detection in `useOfflineStatus` — detects loss within 5 seconds
  - [ ] 31.2 Implement DI container mode switching — swaps HTTP adapters for IndexedDB adapters on offline detection
  - [ ] 31.3 Display offline indicator and pending sync count in `OfflineBanner`
  - [ ] 31.4 Mark cached product prices as "pendientes de actualización" when cache >24 hours old
  - *References: Requirement 12*

- [~] 32. Implement background sync
  - [ ] 32.1 Implement `BackgroundSyncService` — processes sync queue in chronological order on reconnection
  - [ ] 32.2 Implement conflict detection and Manager review queue
  - [ ] 32.3 Implement sync status UI — shows progress during sync
  - [ ] 32.4 Write PBT: all queued transactions are synced in chronological order without data loss
  - *References: Requirement 12.4, Requirement 12.5, Design § PBT Strategy*

---

## Phase 9: Observability & Performance

- [~] 33. Implement logging and metrics
  - [ ] 33.1 Wire `SentryLoggingService` into all use cases via DI containers
  - [ ] 33.2 Implement correlation ID generation and propagation across all transaction logs
  - [ ] 33.3 Implement `WebVitalsMetricsService` — reports LCP, FID, CLS to metrics port
  - [ ] 33.4 Implement performance degradation detection — alert when operations exceed 2× expected time
  - *References: Requirement 16*

- [~] 34. Performance optimization
  - [ ] 34.1 Implement route-level code splitting for manager and admin routes
  - [ ] 34.2 Implement product image lazy loading with `next/image`
  - [ ] 34.3 Implement TanStack Query cache warming for frequent products on shift open
  - [ ] 34.4 Verify Lighthouse Performance Score ≥ 90 on main cashier route
  - [ ] 34.5 Verify LCP < 2.5 seconds on 4G connection
  - *References: Requirement 14.3, Requirement 14.4*

---

## Phase 10: Testing & Quality

- [~] 35. Unit and integration tests
  - [ ] 35.1 Achieve ≥ 90% coverage on all domain use cases
  - [ ] 35.2 Write integration tests for each DI container — verify correct adapter wiring
  - [ ] 35.3 Write component tests for all POS components using React Testing Library
  - [ ] 35.4 Write PBT suites: Money arithmetic, cart totals, split payment, RBAC, offline sync order
  - *References: Requirement 1, Design § PBT Strategy*

- [~] 36. End-to-end tests
  - [ ] 36.1 E2E: complete sale flow — login → open shift → add products → pay → receipt
  - [ ] 36.2 E2E: refund flow — find transaction → Manager auth → partial refund → receipt
  - [ ] 36.3 E2E: offline flow — disconnect → complete sale → reconnect → verify sync
  - [ ] 36.4 E2E: RBAC — cashier cannot access manager routes; manager cannot access admin routes
  - *References: All requirements*

- [~] 37. Accessibility audit
  - [ ] 37.1 Run automated WCAG 2.1 AA audit with `axe-core` on all routes
  - [ ] 37.2 Verify full keyboard navigation on cashier sale screen
  - [ ] 37.3 Verify touch targets ≥ 44×44px on touch device viewport
  - [ ] 37.4 Verify dark/light theme toggle persists per user
  - *References: Requirement 14.1–14.6*
