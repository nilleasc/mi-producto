package com.pos.backend.application.exception;

public class CustomerNotFoundException extends RuntimeException {
    public CustomerNotFoundException(String id) {
        super("Customer not found: " + id);
    }
}
