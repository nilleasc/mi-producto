package com.pos.backend.application.exception;

public class InvalidSaleStateException extends RuntimeException {
    public InvalidSaleStateException(String message) {
        super(message);
    }
}
