package com.pos.backend.infrastructure.http;

import com.pos.backend.domain.entity.Product;
import com.pos.backend.domain.valueobject.Money;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") // Para desarrollo
public class ProductController {

    private final List<Product> mockCatalog = Arrays.asList(
            Product.builder().id("1").sku("SKU001").name("Café Espresso").price(Money.of(2.50)).stock(50).categoryId("c1").isActive(true).build(),
            Product.builder().id("2").sku("SKU002").name("Latte").price(Money.of(3.50)).stock(3).categoryId("c1").isActive(true).build(),
            Product.builder().id("3").sku("SKU003").name("Croissant").price(Money.of(2.00)).stock(0).categoryId("c2").isActive(true).build(),
            Product.builder().id("4").sku("123456789").name("Agua Mineral").price(Money.of(1.50)).stock(100).categoryId("c3").isActive(true).build()
    );

    @GetMapping
    public List<Product> getAllProducts() {
        return mockCatalog;
    }

    @GetMapping("/search")
    public List<Product> searchProducts(@RequestParam String q) {
        String query = q.toLowerCase();
        return mockCatalog.stream()
                .filter(p -> p.getName().toLowerCase().contains(query) || p.getSku().toLowerCase().contains(query))
                .collect(Collectors.toList());
    }

    @GetMapping("/{sku}")
    public Product getBySku(@PathVariable String sku) {
        return mockCatalog.stream()
                .filter(p -> p.getSku().equals(sku))
                .findFirst()
                .orElse(null);
    }
}
