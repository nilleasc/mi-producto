package com.pos.backend.application.service;

import com.pos.backend.application.exception.CustomerNotFoundException;
import com.pos.backend.domain.entity.Customer;
import com.pos.backend.infrastructure.persistence.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    public List<Customer> searchByName(String name) {
        return customerRepository.findByFullNameContainingIgnoreCase(name);
    }

    public Customer searchByDocument(String documentNumber) {
        return customerRepository.findByDocumentNumber(documentNumber)
                .orElseThrow(() -> new CustomerNotFoundException(documentNumber));
    }

    public Customer findById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }
}
