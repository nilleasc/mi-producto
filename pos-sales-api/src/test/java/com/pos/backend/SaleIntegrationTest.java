package com.pos.backend;

import com.pos.backend.adapter.in.web.dto.*;
import com.pos.backend.domain.entity.*;
import com.pos.backend.infrastructure.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SaleIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SaleRepository saleRepository;

    private String baseUrl;
    private String productId;
    private String customerId;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api";

        // DataLoader already seeds data; grab existing IDs
        productId = productRepository.findAll().get(0).getId();
        customerId = customerRepository.findAll().stream()
                .filter(c -> c.getCreditStatus() == CreditStatus.APPROVED)
                .findFirst().get().getId();

        // Clean sales
        saleRepository.deleteAll();
    }

    // ==================== FULL CASH FLOW ====================

    @Test
    @DisplayName("Flow: Create → Add Items → Checkout CASH → Verify Receipt")
    void cashSaleFlow() {
        // Create sale
        CreateSaleRequest createReq = CreateSaleRequest.builder()
                .terminalId("T1").cashierId("C1").build();
        ResponseEntity<Sale> createResp = restTemplate.postForEntity(
                baseUrl + "/sales", createReq, Sale.class);
        assertEquals(HttpStatus.CREATED, createResp.getStatusCode());
        String saleId = createResp.getBody().getId();

        // Add item
        AddItemRequest addReq = AddItemRequest.builder()
                .productId(productId).quantity(3).build();
        ResponseEntity<Sale> addResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/items", addReq, Sale.class);
        assertEquals(HttpStatus.OK, addResp.getStatusCode());
        assertEquals(1, addResp.getBody().getItems().size());

        // Checkout CASH
        CheckoutRequest checkoutReq = CheckoutRequest.builder()
                .paymentType(PaymentType.CASH)
                .amountReceived(new BigDecimal("20000.00")).build();
        ResponseEntity<Sale> checkoutResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/checkout", checkoutReq, Sale.class);
        assertEquals(HttpStatus.OK, checkoutResp.getStatusCode());
        assertEquals(SaleStatus.COMPLETED, checkoutResp.getBody().getStatus());
        assertNotNull(checkoutResp.getBody().getTransactionId());
        assertNotNull(checkoutResp.getBody().getChangeAmount());

        // Verify receipt was generated
        ResponseEntity<List> receipts = restTemplate.getForEntity(
                baseUrl + "/sales/" + saleId + "/receipts", List.class);
        assertEquals(HttpStatus.OK, receipts.getStatusCode());
        assertFalse(receipts.getBody().isEmpty());
    }

    // ==================== CREDIT FLOW ====================

    @Test
    @DisplayName("Flow: Create → Associate Customer → Add Items → Checkout CREDIT")
    void creditSaleFlow() {
        // Create sale
        CreateSaleRequest createReq = CreateSaleRequest.builder()
                .terminalId("T1").cashierId("C1").customerId(customerId).build();
        ResponseEntity<Sale> createResp = restTemplate.postForEntity(
                baseUrl + "/sales", createReq, Sale.class);
        String saleId = createResp.getBody().getId();

        // Add item
        AddItemRequest addReq = AddItemRequest.builder()
                .productId(productId).quantity(2).build();
        restTemplate.postForEntity(baseUrl + "/sales/" + saleId + "/items", addReq, Sale.class);

        // Checkout CREDIT
        CheckoutRequest checkoutReq = CheckoutRequest.builder()
                .paymentType(PaymentType.CREDIT).build();
        ResponseEntity<Sale> checkoutResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/checkout", checkoutReq, Sale.class);
        assertEquals(HttpStatus.OK, checkoutResp.getStatusCode());
        assertEquals(SaleStatus.COMPLETED, checkoutResp.getBody().getStatus());
        assertNotNull(checkoutResp.getBody().getPaymentReference());
    }

    // ==================== FREEZE FLOW ====================

    @Test
    @DisplayName("Flow: Create → Add Items → Freeze → Resume → Checkout")
    void freezeResumeFlow() {
        // Create and add items
        CreateSaleRequest createReq = CreateSaleRequest.builder()
                .terminalId("T1").cashierId("C1").build();
        ResponseEntity<Sale> createResp = restTemplate.postForEntity(
                baseUrl + "/sales", createReq, Sale.class);
        String saleId = createResp.getBody().getId();

        AddItemRequest addReq = AddItemRequest.builder()
                .productId(productId).quantity(1).build();
        restTemplate.postForEntity(baseUrl + "/sales/" + saleId + "/items", addReq, Sale.class);

        // Freeze
        ResponseEntity<Sale> freezeResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/freeze", null, Sale.class);
        assertEquals(HttpStatus.OK, freezeResp.getStatusCode());
        assertEquals(SaleStatus.FROZEN, freezeResp.getBody().getStatus());

        // Get frozen sales by terminal
        ResponseEntity<List> frozenList = restTemplate.getForEntity(
                baseUrl + "/sales/frozen?terminalId=T1", List.class);
        assertEquals(1, frozenList.getBody().size());

        // Resume
        ResponseEntity<Sale> resumeResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/resume", null, Sale.class);
        assertEquals(HttpStatus.OK, resumeResp.getStatusCode());
        assertEquals(SaleStatus.ACTIVE, resumeResp.getBody().getStatus());

        // Now checkout
        CheckoutRequest checkoutReq = CheckoutRequest.builder()
                .paymentType(PaymentType.CASH)
                .amountReceived(new BigDecimal("10000.00")).build();
        ResponseEntity<Sale> checkoutResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/checkout", checkoutReq, Sale.class);
        assertEquals(SaleStatus.COMPLETED, checkoutResp.getBody().getStatus());
    }

    // ==================== CANCEL FLOW ====================

    @Test
    @DisplayName("Flow: Create → Add Items → Cancel → Verify cannot modify")
    void cancelFlow() {
        // Create and add items
        CreateSaleRequest createReq = CreateSaleRequest.builder()
                .terminalId("T1").cashierId("C1").build();
        ResponseEntity<Sale> createResp = restTemplate.postForEntity(
                baseUrl + "/sales", createReq, Sale.class);
        String saleId = createResp.getBody().getId();

        AddItemRequest addReq = AddItemRequest.builder()
                .productId(productId).quantity(1).build();
        restTemplate.postForEntity(baseUrl + "/sales/" + saleId + "/items", addReq, Sale.class);

        // Cancel
        CancelSaleRequest cancelReq = CancelSaleRequest.builder()
                .reason("Customer left").build();
        ResponseEntity<Sale> cancelResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/cancel", cancelReq, Sale.class);
        assertEquals(SaleStatus.CANCELLED, cancelResp.getBody().getStatus());
        assertEquals("Customer left", cancelResp.getBody().getCancellationReason());

        // Try to add item to cancelled sale → should fail
        ResponseEntity<Map> errorResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/items", addReq, Map.class);
        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, errorResp.getStatusCode());
    }

    // ==================== FULL RETURN FLOW ====================

    @Test
    @DisplayName("Flow: Complete sale → Full Return → Verify stock restored")
    void fullReturnFlow() {
        // Get initial stock
        int initialStock = productRepository.findById(productId).get().getStock();

        // Create, add, checkout
        CreateSaleRequest createReq = CreateSaleRequest.builder()
                .terminalId("T1").cashierId("C1").build();
        ResponseEntity<Sale> createResp = restTemplate.postForEntity(
                baseUrl + "/sales", createReq, Sale.class);
        String saleId = createResp.getBody().getId();

        AddItemRequest addReq = AddItemRequest.builder()
                .productId(productId).quantity(5).build();
        restTemplate.postForEntity(baseUrl + "/sales/" + saleId + "/items", addReq, Sale.class);

        CheckoutRequest checkoutReq = CheckoutRequest.builder()
                .paymentType(PaymentType.CASH)
                .amountReceived(new BigDecimal("30000.00")).build();
        restTemplate.postForEntity(baseUrl + "/sales/" + saleId + "/checkout", checkoutReq, Sale.class);

        // Verify stock decreased
        assertEquals(initialStock - 5, productRepository.findById(productId).get().getStock());

        // Full return
        ReturnRequest returnReq = ReturnRequest.builder()
                .fullReturn(true).reason("All items defective").build();
        ResponseEntity<Sale> returnResp = restTemplate.postForEntity(
                baseUrl + "/sales/" + saleId + "/returns", returnReq, Sale.class);
        assertEquals(SaleStatus.RETURNED, returnResp.getBody().getStatus());

        // Verify stock restored
        assertEquals(initialStock, productRepository.findById(productId).get().getStock());
    }

    // ==================== PRODUCT SEARCH ====================

    @Test
    @DisplayName("Product search by name and barcode")
    void productSearch() {
        ResponseEntity<List> searchResp = restTemplate.getForEntity(
                baseUrl + "/products/search?q=café", List.class);
        assertEquals(HttpStatus.OK, searchResp.getStatusCode());
        assertFalse(searchResp.getBody().isEmpty());

        // Barcode
        ResponseEntity<Product> barcodeResp = restTemplate.getForEntity(
                baseUrl + "/products/barcode/7701001", Product.class);
        assertEquals(HttpStatus.OK, barcodeResp.getStatusCode());
    }

    // ==================== CUSTOMER SEARCH ====================

    @Test
    @DisplayName("Customer search by name and document")
    void customerSearch() {
        ResponseEntity<List> nameResp = restTemplate.getForEntity(
                baseUrl + "/customers?name=Juan", List.class);
        assertEquals(HttpStatus.OK, nameResp.getStatusCode());
        assertFalse(nameResp.getBody().isEmpty());

        ResponseEntity<List> docResp = restTemplate.getForEntity(
                baseUrl + "/customers?document=1234567890", List.class);
        assertEquals(HttpStatus.OK, docResp.getStatusCode());
        assertFalse(docResp.getBody().isEmpty());
    }
}
