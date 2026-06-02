package com.pos.backend.application.exception;

public class InsufficientPaymentException extends RuntimeException {
    public InsufficientPaymentException(String message) {
        super(message);
    }
}
