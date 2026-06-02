package com.pos.backend.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequest {
    @NotBlank(message = "Return reason is required")
    private String reason;

    private boolean fullReturn; // true = full return, false = partial

    private List<ReturnItemRequest> items; // only for partial returns

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnItemRequest {
        private String itemId;
        private int quantity;
        private String reason;
    }
}
