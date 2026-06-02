package com.pos.backend.application.service;

import com.pos.backend.domain.entity.Receipt;
import com.pos.backend.domain.entity.Sale;
import com.pos.backend.domain.entity.SaleItem;
import com.pos.backend.infrastructure.persistence.ReceiptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceiptService {
    private final ReceiptRepository receiptRepository;

    public Receipt generateSaleReceipt(Sale sale) {
        String itemsJson = sale.getItems().stream()
                .map(item -> String.format("{\"product\":\"%s\",\"qty\":%d,\"unitPrice\":%s,\"lineTotal\":%s}",
                        item.getProductName(), item.getQuantity(),
                        item.getUnitPrice().toPlainString(), item.getLineTotal().toPlainString()))
                .collect(Collectors.joining(",", "[", "]"));

        Receipt receipt = Receipt.builder()
                .transactionId(sale.getTransactionId())
                .saleId(sale.getId())
                .type("SALE")
                .storeName("Supermarket POS")
                .terminalId(sale.getTerminalId())
                .cashierId(sale.getCashierId())
                .customerId(sale.getCustomerId())
                .itemsJson(itemsJson)
                .subtotal(sale.getSubtotal())
                .tax(sale.getTax())
                .discount(sale.getDiscount())
                .total(sale.getTotal())
                .paymentType(sale.getPaymentType() != null ? sale.getPaymentType().name() : null)
                .amountReceived(sale.getAmountReceived())
                .changeAmount(sale.getChangeAmount())
                .build();

        return receiptRepository.save(receipt);
    }

    public Receipt generateReturnReceipt(Sale sale, List<SaleItem> returnedItems) {
        String itemsJson = returnedItems.stream()
                .map(item -> String.format("{\"product\":\"%s\",\"qty\":%d,\"unitPrice\":%s,\"lineTotal\":%s}",
                        item.getProductName(), item.getQuantity(),
                        item.getUnitPrice().toPlainString(), item.getLineTotal().toPlainString()))
                .collect(Collectors.joining(",", "[", "]"));

        Receipt receipt = Receipt.builder()
                .transactionId("RTN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .saleId(sale.getId())
                .type("RETURN")
                .storeName("Supermarket POS")
                .terminalId(sale.getTerminalId())
                .cashierId(sale.getCashierId())
                .customerId(sale.getCustomerId())
                .itemsJson(itemsJson)
                .subtotal(sale.getSubtotal())
                .tax(sale.getTax())
                .discount(sale.getDiscount())
                .total(sale.getTotal())
                .originalTransactionId(sale.getTransactionId())
                .build();

        return receiptRepository.save(receipt);
    }

    public List<Receipt> getReceiptsBySaleId(String saleId) {
        return receiptRepository.findBySaleId(saleId);
    }
}
