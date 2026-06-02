package com.pos.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String terminalId;
    private String cashierId;
    private String customerId;

    @Enumerated(EnumType.STRING)
    private SaleStatus status;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sale_id")
    @Builder.Default
    private List<SaleItem> items = new ArrayList<>();

    @Column(precision = 19, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 19, scale = 2)
    private BigDecimal tax;

    @Column(precision = 19, scale = 2)
    private BigDecimal discount;

    @Column(precision = 19, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    private String paymentReference;
    private String transactionId;

    @Column(precision = 19, scale = 2)
    private BigDecimal amountReceived;

    @Column(precision = 19, scale = 2)
    private BigDecimal changeAmount;

    @Column(length = 255)
    private String cancellationReason;

    private LocalDateTime frozenAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = SaleStatus.ACTIVE;
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (tax == null) tax = BigDecimal.ZERO;
        if (discount == null) discount = BigDecimal.ZERO;
        if (total == null) total = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(SaleItem::getLineTotal)
                .filter(lt -> lt != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal taxRate = new BigDecimal("0.19");
        this.tax = subtotal.multiply(taxRate);
        if (discount == null) discount = BigDecimal.ZERO;
        this.total = subtotal.add(tax).subtract(discount);
    }
}
