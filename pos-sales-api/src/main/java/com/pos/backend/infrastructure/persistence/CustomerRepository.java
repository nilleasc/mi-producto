package com.pos.backend.infrastructure.persistence;

import com.pos.backend.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    List<Customer> findByFullNameContainingIgnoreCase(String name);
    Optional<Customer> findByDocumentNumber(String documentNumber);
}
