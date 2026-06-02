package com.pos.backend.application.exception;

import java.util.List;

public class InsufficientStockException extends RuntimeException {
    private final List<String> outOfStockItems;

    public InsufficientStockException(String message, List<String> outOfStockItems) {
        super(message);
        this.outOfStockItems = outOfStockItems;
    }

    public InsufficientStockException(String message) {
        super(message);
        this.outOfStockItems = List.of();
    }

    public List<String> getOutOfStockItems() {
        return outOfStockItems;
    }
}
