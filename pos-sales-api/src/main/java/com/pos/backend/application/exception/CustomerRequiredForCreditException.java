package com.pos.backend.application.exception;

public class CustomerRequiredForCreditException extends RuntimeException {
    public CustomerRequiredForCreditException() {
        super("Customer is required for credit sales");
    }
}
