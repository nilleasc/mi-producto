package com.pos.backend.application.service;

import com.pos.backend.domain.entity.*;
import com.pos.backend.infrastructure.persistence.ReceiptRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReceiptServiceTest {

    @Mock
    private ReceiptRepository receiptRepository;

    @InjectMocks
    private ReceiptService receiptService;

    @Test
    @DisplayName("should generate sale receipt")
    void generateSaleReceipt() {
        SaleItem item = SaleItem.builder()
                .productName("Café").quantity(2)
                .unitPrice(new BigDecimal("2.50"))
                .lineTotal(new BigDecimal("5.00")).build();

        Sale sale = Sale.builder()
                .id("sale-1").terminalId("T1").cashierId("C1")
                .transactionId("TXN-123").paymentType(PaymentType.CASH)
                .items(new ArrayList<>(List.of(item)))
                .subtotal(new BigDecimal("5.00"))
                .tax(new BigDecimal("0.95"))
                .discount(BigDecimal.ZERO)
                .total(new BigDecimal("5.95"))
                .amountReceived(new BigDecimal("10.00"))
                .changeAmount(new BigDecimal("4.05"))
                .build();

        when(receiptRepository.save(any(Receipt.class))).thenAnswer(inv -> {
            Receipt r = inv.getArgument(0);
            r.setId("receipt-1");
            return r;
        });

        Receipt receipt = receiptService.generateSaleReceipt(sale);

        assertNotNull(receipt);
        assertEquals("SALE", receipt.getType());
        assertEquals("TXN-123", receipt.getTransactionId());
        assertEquals("sale-1", receipt.getSaleId());
        verify(receiptRepository).save(any(Receipt.class));
    }

    @Test
    @DisplayName("should generate return receipt")
    void generateReturnReceipt() {
        SaleItem item = SaleItem.builder()
                .productName("Café").quantity(1)
                .unitPrice(new BigDecimal("2.50"))
                .lineTotal(new BigDecimal("2.50")).build();

        Sale sale = Sale.builder()
                .id("sale-1").terminalId("T1").cashierId("C1")
                .transactionId("TXN-123")
                .subtotal(new BigDecimal("2.50"))
                .tax(new BigDecimal("0.48"))
                .discount(BigDecimal.ZERO)
                .total(new BigDecimal("2.98"))
                .build();

        when(receiptRepository.save(any(Receipt.class))).thenAnswer(inv -> {
            Receipt r = inv.getArgument(0);
            r.setId("receipt-2");
            return r;
        });

        Receipt receipt = receiptService.generateReturnReceipt(sale, List.of(item));

        assertNotNull(receipt);
        assertEquals("RETURN", receipt.getType());
        assertEquals("TXN-123", receipt.getOriginalTransactionId());
        assertTrue(receipt.getTransactionId().startsWith("RTN-"));
    }

    @Test
    @DisplayName("should get receipts by sale ID")
    void getReceiptsBySaleId() {
        Receipt r = Receipt.builder().id("r1").saleId("sale-1").type("SALE").build();
        when(receiptRepository.findBySaleId("sale-1")).thenReturn(List.of(r));

        List<Receipt> result = receiptService.getReceiptsBySaleId("sale-1");
        assertEquals(1, result.size());
    }
}
