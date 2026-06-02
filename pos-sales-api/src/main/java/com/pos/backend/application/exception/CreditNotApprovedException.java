package com.pos.backend.application.exception;

public class CreditNotApprovedException extends RuntimeException {
    public CreditNotApprovedException(String message) {
        super(message);
    }
}
