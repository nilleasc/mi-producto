package com.pos.backend.application.service;

import com.pos.backend.application.exception.CustomerNotFoundException;
import com.pos.backend.domain.entity.CreditStatus;
import com.pos.backend.domain.entity.Customer;
import com.pos.backend.infrastructure.persistence.CustomerRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerService customerService;

    @Test
    @DisplayName("should search customers by name")
    void searchByName() {
        Customer c = Customer.builder().id("1").fullName("Juan Pérez")
                .documentType("CC").documentNumber("123").creditStatus(CreditStatus.APPROVED).build();
        when(customerRepository.findByFullNameContainingIgnoreCase("Juan"))
                .thenReturn(List.of(c));

        List<Customer> result = customerService.searchByName("Juan");
        assertEquals(1, result.size());
        assertEquals("Juan Pérez", result.get(0).getFullName());
    }

    @Test
    @DisplayName("should search customer by document number")
    void searchByDocument() {
        Customer c = Customer.builder().id("1").fullName("Juan").documentNumber("123")
                .documentType("CC").creditStatus(CreditStatus.APPROVED).build();
        when(customerRepository.findByDocumentNumber("123")).thenReturn(Optional.of(c));

        Customer result = customerService.searchByDocument("123");
        assertEquals("Juan", result.getFullName());
    }

    @Test
    @DisplayName("should throw when document not found")
    void searchByDocument_notFound() {
        when(customerRepository.findByDocumentNumber("xxx")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class,
                () -> customerService.searchByDocument("xxx"));
    }

    @Test
    @DisplayName("should find customer by ID")
    void findById_success() {
        Customer c = Customer.builder().id("1").fullName("Juan").build();
        when(customerRepository.findById("1")).thenReturn(Optional.of(c));

        Customer result = customerService.findById("1");
        assertEquals("Juan", result.getFullName());
    }

    @Test
    @DisplayName("should throw when customer ID not found")
    void findById_notFound() {
        when(customerRepository.findById("x")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class,
                () -> customerService.findById("x"));
    }
}
