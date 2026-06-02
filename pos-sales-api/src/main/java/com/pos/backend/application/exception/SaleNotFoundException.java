package com.pos.backend.application.exception;

public class SaleNotFoundException extends RuntimeException {
    public SaleNotFoundException(String id) {
        super("Sale not found: " + id);
    }
}
