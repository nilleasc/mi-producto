package com.pos.backend.adapter.in.web;

import com.pos.backend.application.service.CustomerService;
import com.pos.backend.domain.entity.Customer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<Customer>> searchCustomers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String document) {

        if (document != null && !document.isBlank()) {
            Customer customer = customerService.searchByDocument(document);
            return ResponseEntity.ok(List.of(customer));
        }

        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(customerService.searchByName(name));
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable String id) {
        return ResponseEntity.ok(customerService.findById(id));
    }
}
