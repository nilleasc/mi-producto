package com.pos.backend.adapter.in.web.dto;

import com.pos.backend.domain.entity.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    private BigDecimal amountReceived; // required for CASH

    private BigDecimal discount; // optional coupon discount applied in frontend
}
