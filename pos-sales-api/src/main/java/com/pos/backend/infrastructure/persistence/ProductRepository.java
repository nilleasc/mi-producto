package com.pos.backend.infrastructure.persistence;

import com.pos.backend.domain.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String> {
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByNameContainingIgnoreCase(String name);
}
