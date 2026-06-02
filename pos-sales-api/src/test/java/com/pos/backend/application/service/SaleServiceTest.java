package com.pos.backend.application.service;

import com.pos.backend.adapter.in.web.dto.*;
import com.pos.backend.application.exception.*;
import com.pos.backend.domain.entity.*;
import com.pos.backend.infrastructure.persistence.CustomerRepository;
import com.pos.backend.infrastructure.persistence.ProductRepository;
import com.pos.backend.infrastructure.persistence.SaleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private SaleService saleService;

    private Product sampleProduct;
    private Sale activeSale;
    private Customer approvedCustomer;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id("prod-1")
                .sku("SKU001")
                .barcode("7701001")
                .name("Café Espresso")
                .price(new BigDecimal("2.50"))
                .stock(50)
                .categoryId("c1")
                .isActive(true)
                .build();

        activeSale = Sale.builder()
                .id("sale-1")
                .terminalId("T1")
                .cashierId("C1")
                .status(SaleStatus.ACTIVE)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        approvedCustomer = Customer.builder()
                .id("cust-1")
                .fullName("Juan Pérez")
                .documentType("CC")
                .documentNumber("1234567890")
                .creditStatus(CreditStatus.APPROVED)
                .build();
    }

    // ==================== CREATE SALE ====================

    @Nested
    @DisplayName("Create Sale")
    class CreateSaleTests {

        @Test
        @DisplayName("should create a new ACTIVE sale")
        void createSale_success() {
            CreateSaleRequest request = CreateSaleRequest.builder()
                    .terminalId("T1").cashierId("C1").build();

            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> {
                Sale s = inv.getArgument(0);
                s.setId("sale-new");
                return s;
            });

            Sale result = saleService.createSale(request);

            assertNotNull(result);
            assertEquals(SaleStatus.ACTIVE, result.getStatus());
            assertEquals("T1", result.getTerminalId());
            verify(saleRepository).save(any(Sale.class));
        }

        @Test
        @DisplayName("should create sale with optional customer")
        void createSale_withCustomer() {
            CreateSaleRequest request = CreateSaleRequest.builder()
                    .terminalId("T1").cashierId("C1").customerId("cust-1").build();

            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.createSale(request);
            assertEquals("cust-1", result.getCustomerId());
        }
    }

    // ==================== ADD ITEM ====================

    @Nested
    @DisplayName("Add Item")
    class AddItemTests {

        @Test
        @DisplayName("should add a new item to the sale")
        void addItem_success() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            AddItemRequest request = AddItemRequest.builder()
                    .productId("prod-1").quantity(3).build();

            Sale result = saleService.addItem("sale-1", request);

            assertEquals(1, result.getItems().size());
            assertEquals(3, result.getItems().get(0).getQuantity());
            assertEquals(new BigDecimal("7.50"), result.getItems().get(0).getLineTotal());
        }

        @Test
        @DisplayName("should merge quantities when product already in sale")
        void addItem_mergeExisting() {
            SaleItem existing = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(2)
                    .lineTotal(new BigDecimal("5.00")).build();
            activeSale.getItems().add(existing);

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            AddItemRequest request = AddItemRequest.builder()
                    .productId("prod-1").quantity(3).build();

            Sale result = saleService.addItem("sale-1", request);

            assertEquals(1, result.getItems().size());
            assertEquals(5, result.getItems().get(0).getQuantity());
        }

        @Test
        @DisplayName("should throw InsufficientStockException when stock is low")
        void addItem_insufficientStock() {
            sampleProduct.setStock(1);
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));

            AddItemRequest request = AddItemRequest.builder()
                    .productId("prod-1").quantity(5).build();

            assertThrows(InsufficientStockException.class,
                    () -> saleService.addItem("sale-1", request));
        }

        @Test
        @DisplayName("should throw when sale not found")
        void addItem_saleNotFound() {
            when(saleRepository.findById("x")).thenReturn(Optional.empty());

            assertThrows(SaleNotFoundException.class,
                    () -> saleService.addItem("x", AddItemRequest.builder().productId("p").quantity(1).build()));
        }

        @Test
        @DisplayName("should throw InvalidQuantityException for quantity < 1")
        void addItem_invalidQuantity() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));

            AddItemRequest request = AddItemRequest.builder()
                    .productId("prod-1").quantity(0).build();

            assertThrows(InvalidQuantityException.class,
                    () -> saleService.addItem("sale-1", request));
        }

        @Test
        @DisplayName("should throw when sale is not ACTIVE")
        void addItem_notActive() {
            activeSale.setStatus(SaleStatus.COMPLETED);
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.addItem("sale-1", AddItemRequest.builder().productId("p").quantity(1).build()));
        }
    }

    // ==================== UPDATE / REMOVE ITEM ====================

    @Nested
    @DisplayName("Update and Remove Item")
    class UpdateRemoveItemTests {

        @Test
        @DisplayName("should update item quantity")
        void updateItem_success() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(2)
                    .lineTotal(new BigDecimal("5.00")).build();
            activeSale.getItems().add(item);

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.updateItemQuantity("sale-1", "item-1", 5);
            assertEquals(5, result.getItems().get(0).getQuantity());
        }

        @Test
        @DisplayName("should remove item from sale")
        void removeItem_success() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(2)
                    .lineTotal(new BigDecimal("5.00")).build();
            activeSale.getItems().add(item);

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.removeItem("sale-1", "item-1");
            assertTrue(result.getItems().isEmpty());
        }
    }

    // ==================== CHECKOUT ====================

    @Nested
    @DisplayName("Checkout")
    class CheckoutTests {

        private Sale saleWithItems() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(2)
                    .lineTotal(new BigDecimal("5.00")).build();
            activeSale.getItems().add(item);
            activeSale.calculateTotals();
            return activeSale;
        }

        @Test
        @DisplayName("should checkout CASH with correct change")
        void checkout_cash_success() {
            Sale sale = saleWithItems();
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CASH)
                    .amountReceived(new BigDecimal("10.00"))
                    .build();

            Sale result = saleService.processCheckout("sale-1", request);

            assertEquals(SaleStatus.COMPLETED, result.getStatus());
            assertEquals(PaymentType.CASH, result.getPaymentType());
            assertNotNull(result.getChangeAmount());
            assertNotNull(result.getTransactionId());
        }

        @Test
        @DisplayName("should throw InsufficientPaymentException for CASH with low amount")
        void checkout_cash_insufficientPayment() {
            Sale sale = saleWithItems();
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CASH)
                    .amountReceived(new BigDecimal("1.00"))
                    .build();

            assertThrows(InsufficientPaymentException.class,
                    () -> saleService.processCheckout("sale-1", request));
        }

        @Test
        @DisplayName("should checkout CREDIT with APPROVED customer")
        void checkout_credit_success() {
            Sale sale = saleWithItems();
            sale.setCustomerId("cust-1");
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(customerRepository.findById("cust-1")).thenReturn(Optional.of(approvedCustomer));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CREDIT).build();

            Sale result = saleService.processCheckout("sale-1", request);

            assertEquals(SaleStatus.COMPLETED, result.getStatus());
            assertEquals(PaymentType.CREDIT, result.getPaymentType());
            assertNotNull(result.getPaymentReference());
        }

        @Test
        @DisplayName("should throw CustomerRequiredForCreditException when no customer")
        void checkout_credit_noCustomer() {
            Sale sale = saleWithItems();
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CREDIT).build();

            assertThrows(CustomerRequiredForCreditException.class,
                    () -> saleService.processCheckout("sale-1", request));
        }

        @Test
        @DisplayName("should throw CreditNotApprovedException when customer not approved")
        void checkout_credit_rejected() {
            Sale sale = saleWithItems();
            sale.setCustomerId("cust-2");
            Customer rejected = Customer.builder()
                    .id("cust-2").creditStatus(CreditStatus.REJECTED).build();

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(customerRepository.findById("cust-2")).thenReturn(Optional.of(rejected));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CREDIT).build();

            assertThrows(CreditNotApprovedException.class,
                    () -> saleService.processCheckout("sale-1", request));
        }

        @Test
        @DisplayName("should throw when checking out an empty sale")
        void checkout_emptySale() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CASH)
                    .amountReceived(BigDecimal.TEN).build();

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.processCheckout("sale-1", request));
        }

        @Test
        @DisplayName("should throw InsufficientStockException at checkout if stock ran out")
        void checkout_stockRanOut() {
            Sale sale = saleWithItems();
            sampleProduct.setStock(0); // Stock depleted since adding

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(sale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));

            CheckoutRequest request = CheckoutRequest.builder()
                    .paymentType(PaymentType.CASH)
                    .amountReceived(new BigDecimal("100.00")).build();

            assertThrows(InsufficientStockException.class,
                    () -> saleService.processCheckout("sale-1", request));
        }
    }

    // ==================== FREEZE / RESUME ====================

    @Nested
    @DisplayName("Freeze and Resume")
    class FreezeResumeTests {

        @Test
        @DisplayName("should freeze an ACTIVE sale")
        void freeze_success() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.freezeSale("sale-1");
            assertEquals(SaleStatus.FROZEN, result.getStatus());
            assertNotNull(result.getFrozenAt());
        }

        @Test
        @DisplayName("should throw when freezing a non-ACTIVE sale")
        void freeze_notActive() {
            activeSale.setStatus(SaleStatus.COMPLETED);
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.freezeSale("sale-1"));
        }

        @Test
        @DisplayName("should resume a FROZEN sale")
        void resume_success() {
            activeSale.setStatus(SaleStatus.FROZEN);
            activeSale.setFrozenAt(LocalDateTime.now());
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.resumeSale("sale-1");
            assertEquals(SaleStatus.ACTIVE, result.getStatus());
            assertNull(result.getFrozenAt());
        }

        @Test
        @DisplayName("should throw when resuming a non-FROZEN sale")
        void resume_notFrozen() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.resumeSale("sale-1"));
        }
    }

    // ==================== CANCEL ====================

    @Nested
    @DisplayName("Cancel")
    class CancelTests {

        @Test
        @DisplayName("should cancel an ACTIVE sale")
        void cancel_active() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.cancelSale("sale-1", "Customer changed mind");
            assertEquals(SaleStatus.CANCELLED, result.getStatus());
            assertEquals("Customer changed mind", result.getCancellationReason());
        }

        @Test
        @DisplayName("should cancel a FROZEN sale")
        void cancel_frozen() {
            activeSale.setStatus(SaleStatus.FROZEN);
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.cancelSale("sale-1", "Timeout");
            assertEquals(SaleStatus.CANCELLED, result.getStatus());
        }

        @Test
        @DisplayName("should throw when cancelling a COMPLETED sale")
        void cancel_completed() {
            activeSale.setStatus(SaleStatus.COMPLETED);
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.cancelSale("sale-1", "reason"));
        }
    }

    // ==================== RETURNS ====================

    @Nested
    @DisplayName("Returns")
    class ReturnTests {

        @Test
        @DisplayName("should process full return and restore stock")
        void fullReturn_success() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(5)
                    .lineTotal(new BigDecimal("12.50")).build();
            activeSale.getItems().add(item);
            activeSale.setStatus(SaleStatus.COMPLETED);

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.processFullReturn("sale-1", "Defective product");

            assertEquals(SaleStatus.RETURNED, result.getStatus());
            assertEquals(55, sampleProduct.getStock()); // 50 + 5 restored
            verify(productRepository).save(sampleProduct);
        }

        @Test
        @DisplayName("should throw when returning an ACTIVE sale")
        void fullReturn_notCompleted() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidSaleStateException.class,
                    () -> saleService.processFullReturn("sale-1", "reason"));
        }

        @Test
        @DisplayName("should process partial return")
        void partialReturn_success() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(5)
                    .lineTotal(new BigDecimal("12.50")).build();
            activeSale.getItems().add(item);
            activeSale.setStatus(SaleStatus.COMPLETED);

            List<ReturnRequest.ReturnItemRequest> returnItems = List.of(
                    ReturnRequest.ReturnItemRequest.builder()
                            .itemId("item-1").quantity(2).reason("Wrong item").build()
            );

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(productRepository.findById("prod-1")).thenReturn(Optional.of(sampleProduct));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.processPartialReturn("sale-1", returnItems, "Partial return");

            assertEquals(SaleStatus.PARTIALLY_RETURNED, result.getStatus());
            assertEquals(3, result.getItems().get(0).getQuantity()); // 5 - 2
            assertEquals(52, sampleProduct.getStock()); // 50 + 2
        }

        @Test
        @DisplayName("should throw when return quantity exceeds purchased")
        void partialReturn_exceedsQuantity() {
            SaleItem item = SaleItem.builder()
                    .id("item-1").productId("prod-1").productName("Café")
                    .unitPrice(new BigDecimal("2.50")).quantity(3)
                    .lineTotal(new BigDecimal("7.50")).build();
            activeSale.getItems().add(item);
            activeSale.setStatus(SaleStatus.COMPLETED);

            List<ReturnRequest.ReturnItemRequest> returnItems = List.of(
                    ReturnRequest.ReturnItemRequest.builder()
                            .itemId("item-1").quantity(10).reason("reason").build()
            );

            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));

            assertThrows(InvalidQuantityException.class,
                    () -> saleService.processPartialReturn("sale-1", returnItems, "reason"));
        }
    }

    // ==================== ASSOCIATE CUSTOMER ====================

    @Nested
    @DisplayName("Associate Customer")
    class AssociateCustomerTests {

        @Test
        @DisplayName("should associate customer to active sale")
        void associateCustomer_success() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(customerRepository.findById("cust-1")).thenReturn(Optional.of(approvedCustomer));
            when(saleRepository.save(any(Sale.class))).thenAnswer(inv -> inv.getArgument(0));

            Sale result = saleService.associateCustomer("sale-1", "cust-1");
            assertEquals("cust-1", result.getCustomerId());
        }

        @Test
        @DisplayName("should throw when customer not found")
        void associateCustomer_notFound() {
            when(saleRepository.findById("sale-1")).thenReturn(Optional.of(activeSale));
            when(customerRepository.findById("x")).thenReturn(Optional.empty());

            assertThrows(CustomerNotFoundException.class,
                    () -> saleService.associateCustomer("sale-1", "x"));
        }
    }

    // ==================== GET FROZEN SALES ====================

    @Test
    @DisplayName("should return frozen sales by terminal")
    void getFrozenSales() {
        Sale frozen = Sale.builder().id("s1").terminalId("T1").status(SaleStatus.FROZEN).build();
        when(saleRepository.findByTerminalIdAndStatus("T1", SaleStatus.FROZEN))
                .thenReturn(List.of(frozen));

        List<Sale> result = saleService.getFrozenSales("T1");
        assertEquals(1, result.size());
    }
}
