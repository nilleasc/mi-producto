package com.pos.backend.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSaleRequest {
    @NotBlank(message = "Terminal ID is required")
    private String terminalId;

    @NotBlank(message = "Cashier ID is required")
    private String cashierId;

    private String customerId; // optional for cash sales
}
