package com.pos.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String transactionId;

    @Column(nullable = false)
    private String saleId;

    @Column(nullable = false)
    private String type; // SALE, RETURN

    private String storeName;
    private String terminalId;
    private String cashierId;
    private String customerId;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;

    @Column(precision = 19, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 19, scale = 2)
    private BigDecimal tax;

    @Column(precision = 19, scale = 2)
    private BigDecimal discount;

    @Column(precision = 19, scale = 2)
    private BigDecimal total;

    private String paymentType;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountReceived;

    @Column(precision = 19, scale = 2)
    private BigDecimal changeAmount;

    private String originalTransactionId; // for return receipts

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
