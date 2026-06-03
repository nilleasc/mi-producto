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
                Product.builder().sku("PAN001").barcode("7701001").name("Pan de Masa Madre").price(new BigDecimal("12000.00")).stock(15).categoryId("c1").isActive(true).build(),
                Product.builder().sku("TEA001").barcode("7701002").name("Té Chai Artesanal").price(new BigDecimal("9500.00")).stock(40).categoryId("c2").isActive(true).build(),
                Product.builder().sku("TAR001").barcode("7701003").name("Tarta de Zanahoria").price(new BigDecimal("8000.00")).stock(8).categoryId("c1").isActive(true).build(),
                Product.builder().sku("GAL001").barcode("7701004").name("Galleta de Avena y Miel").price(new BigDecimal("4500.00")).stock(25).categoryId("c1").isActive(true).build(),
                Product.builder().sku("KOM001").barcode("7701005").name("Kombucha Frutos Rojos").price(new BigDecimal("11000.00")).stock(12).categoryId("c2").isActive(true).build(),
                Product.builder().sku("SAN001").barcode("7701006").name("Sándwich Caprese").price(new BigDecimal("15000.00")).stock(10).categoryId("c3").isActive(true).build(),
                Product.builder().sku("ACA001").barcode("7701007").name("Tazón de Acai").price(new BigDecimal("18000.00")).stock(5).categoryId("c3").isActive(true).build(),
                Product.builder().sku("MUF001").barcode("7701008").name("Muffin de Arándanos").price(new BigDecimal("6000.00")).stock(18).categoryId("c1").isActive(true).build(),
                Product.builder().sku("KAF001").barcode("7701009").name("Café Moka Especial").price(new BigDecimal("10500.00")).stock(50).categoryId("c2").isActive(true).build()
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
