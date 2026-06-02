package com.pos.backend.infrastructure.config;

import com.pos.backend.domain.entity.CreditStatus;
import com.pos.backend.domain.entity.Customer;
import com.pos.backend.domain.entity.Product;
import com.pos.backend.infrastructure.persistence.CustomerRepository;
import com.pos.backend.infrastructure.persistence.ProductRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;

/**
 * Loads sample data into H2 on startup for development and testing.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @PostConstruct
    public void loadData() {
        loadProducts();
        loadCustomers();
    }

    private void loadProducts() {
        if (productRepository.count() == 0) {
            productRepository.saveAll(Arrays.asList(
                Product.builder().sku("SKU001").barcode("7701001").name("Café Espresso").price(new BigDecimal("4500.00")).stock(50).categoryId("c1").isActive(true).build(),
                Product.builder().sku("SKU002").barcode("7701002").name("Latte").price(new BigDecimal("8900.00")).stock(30).categoryId("c1").isActive(true).build(),
                Product.builder().sku("SKU003").barcode("7701003").name("Croissant").price(new BigDecimal("5500.00")).stock(2).categoryId("c2").isActive(true).build(),
                Product.builder().sku("SKU004").barcode("7701004").name("Agua Mineral").price(new BigDecimal("3200.00")).stock(100).categoryId("c3").isActive(true).build(),
                Product.builder().sku("SKU005").barcode("7701005").name("Pan Integral").price(new BigDecimal("6000.00")).stock(40).categoryId("c2").isActive(true).build()
            ));
            log.info("Loaded {} sample products", productRepository.count());
        }
    }

    private void loadCustomers() {
        if (customerRepository.count() == 0) {
            customerRepository.saveAll(Arrays.asList(
                Customer.builder().fullName("Juan Pérez").documentType("CC").documentNumber("1234567890").creditStatus(CreditStatus.APPROVED).build(),
                Customer.builder().fullName("María García").documentType("CC").documentNumber("9876543210").creditStatus(CreditStatus.REJECTED).build(),
                Customer.builder().fullName("Carlos López").documentType("CE").documentNumber("5555555555").creditStatus(CreditStatus.PENDING).build()
            ));
            log.info("Loaded {} sample customers", customerRepository.count());
        }
    }
}
