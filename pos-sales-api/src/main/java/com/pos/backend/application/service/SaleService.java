package com.pos.backend.application.service;

import com.pos.backend.adapter.in.web.dto.*;
import com.pos.backend.application.exception.*;
import com.pos.backend.domain.entity.*;
import com.pos.backend.infrastructure.persistence.CustomerRepository;
import com.pos.backend.infrastructure.persistence.ProductRepository;
import com.pos.backend.infrastructure.persistence.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {
    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    // ==================== CREATE ====================

    @Transactional
    public Sale createSale(CreateSaleRequest request) {
        Sale sale = Sale.builder()
                .terminalId(request.getTerminalId())
                .cashierId(request.getCashierId())
                .customerId(request.getCustomerId())
                .status(SaleStatus.ACTIVE)
                .items(new ArrayList<>())
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();
        return saleRepository.save(sale);
    }

    // ==================== ITEMS ====================

    @Transactional
    public Sale addItem(String saleId, AddItemRequest request) {
        Sale sale = findSaleOrThrow(saleId);
        validateSaleIsActive(sale);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(request.getProductId()));

        if (request.getQuantity() < 1) {
            throw new InvalidQuantityException("Quantity must be at least 1");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
        }

        // Check if product already exists in sale — merge quantities
        Optional<SaleItem> existingItem = sale.getItems().stream()
                .filter(item -> item.getProductId().equals(product.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            SaleItem item = existingItem.get();
            int newQty = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQty) {
                throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
            }
            item.setQuantity(newQty);
            item.calculateLineTotal();
        } else {
            SaleItem item = SaleItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(request.getQuantity())
                    .build();
            item.calculateLineTotal();
            sale.getItems().add(item);
        }

        sale.calculateTotals();
        return saleRepository.save(sale);
    }

    @Transactional
    public Sale updateItemQuantity(String saleId, String itemId, int quantity) {
        Sale sale = findSaleOrThrow(saleId);
        validateSaleIsActive(sale);

        if (quantity < 1) {
            throw new InvalidQuantityException("Quantity must be at least 1");
        }

        SaleItem item = sale.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ProductNotFoundException("Item not found: " + itemId));

        Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(item.getProductId()));

        if (product.getStock() < quantity) {
            throw new InsufficientStockException("Insufficient stock for product: " + product.getName());
        }

        item.setQuantity(quantity);
        item.calculateLineTotal();
        sale.calculateTotals();
        return saleRepository.save(sale);
    }

    @Transactional
    public Sale removeItem(String saleId, String itemId) {
        Sale sale = findSaleOrThrow(saleId);
        validateSaleIsActive(sale);

        boolean removed = sale.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ProductNotFoundException("Item not found: " + itemId);
        }

        sale.calculateTotals();
        return saleRepository.save(sale);
    }

    // ==================== CHECKOUT ====================

    @Transactional
    public Sale processCheckout(String saleId, CheckoutRequest request) {
        Sale sale = findSaleOrThrow(saleId);
        validateSaleIsActive(sale);

        if (sale.getItems().isEmpty()) {
            throw new InvalidSaleStateException("Cannot checkout an empty sale");
        }

        // Validate stock availability at checkout time
        List<String> outOfStock = new ArrayList<>();
        for (SaleItem item : sale.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(item.getProductId()));
            if (product.getStock() < item.getQuantity()) {
                outOfStock.add(product.getName() + " (requested: " + item.getQuantity() + ", available: " + product.getStock() + ")");
            }
        }
        if (!outOfStock.isEmpty()) {
            throw new InsufficientStockException("Insufficient stock at checkout", outOfStock);
        }

        // Apply discount if provided
        if (request.getDiscount() != null) {
            sale.setDiscount(request.getDiscount());
            sale.calculateTotals();
        }

        // Payment validation
        if (request.getPaymentType() == PaymentType.CASH) {
            if (request.getAmountReceived() == null || request.getAmountReceived().compareTo(sale.getTotal()) < 0) {
                throw new InsufficientPaymentException("Amount received must be >= sale total of " + sale.getTotal());
            }
            sale.setAmountReceived(request.getAmountReceived());
            sale.setChangeAmount(request.getAmountReceived().subtract(sale.getTotal()));
        } else if (request.getPaymentType() == PaymentType.CREDIT) {
            if (sale.getCustomerId() == null || sale.getCustomerId().isBlank()) {
                throw new CustomerRequiredForCreditException();
            }
            Customer customer = customerRepository.findById(sale.getCustomerId())
                    .orElseThrow(() -> new CustomerNotFoundException(sale.getCustomerId()));
            if (customer.getCreditStatus() != CreditStatus.APPROVED) {
                throw new CreditNotApprovedException("Customer credit status is " + customer.getCreditStatus() + ", must be APPROVED");
            }
            sale.setPaymentReference("CR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }

        // Decrement stock
        for (SaleItem item : sale.getItems()) {
            Product product = productRepository.findById(item.getProductId()).get();
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        sale.setStatus(SaleStatus.COMPLETED);
        sale.setPaymentType(request.getPaymentType());
        sale.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());

        return saleRepository.save(sale);
    }

    // ==================== FREEZE / RESUME ====================

    @Transactional
    public Sale freezeSale(String saleId) {
        Sale sale = findSaleOrThrow(saleId);
        if (sale.getStatus() != SaleStatus.ACTIVE) {
            throw new InvalidSaleStateException("Only ACTIVE sales can be frozen. Current status: " + sale.getStatus());
        }
        sale.setStatus(SaleStatus.FROZEN);
        sale.setFrozenAt(LocalDateTime.now());
        return saleRepository.save(sale);
    }

    @Transactional
    public Sale resumeSale(String saleId) {
        Sale sale = findSaleOrThrow(saleId);
        if (sale.getStatus() != SaleStatus.FROZEN) {
            throw new InvalidSaleStateException("Only FROZEN sales can be resumed. Current status: " + sale.getStatus());
        }
        sale.setStatus(SaleStatus.ACTIVE);
        sale.setFrozenAt(null);
        return saleRepository.save(sale);
    }

    public List<Sale> getFrozenSales(String terminalId) {
        return saleRepository.findByTerminalIdAndStatus(terminalId, SaleStatus.FROZEN);
    }

    // ==================== CANCEL ====================

    @Transactional
    public Sale cancelSale(String saleId, String reason) {
        Sale sale = findSaleOrThrow(saleId);
        if (sale.getStatus() != SaleStatus.ACTIVE && sale.getStatus() != SaleStatus.FROZEN) {
            throw new InvalidSaleStateException("Only ACTIVE or FROZEN sales can be cancelled. Current status: " + sale.getStatus());
        }
        sale.setStatus(SaleStatus.CANCELLED);
        sale.setCancellationReason(reason);
        return saleRepository.save(sale);
    }

    // ==================== RETURNS ====================

    @Transactional
    public Sale processFullReturn(String saleId, String reason) {
        Sale sale = findSaleOrThrow(saleId);
        if (sale.getStatus() != SaleStatus.COMPLETED) {
            throw new InvalidSaleStateException("Only COMPLETED sales can be returned. Current status: " + sale.getStatus());
        }

        // Restore stock for all items
        for (SaleItem item : sale.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(item.getProductId()));
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        sale.setStatus(SaleStatus.RETURNED);
        sale.setCancellationReason(reason);
        return saleRepository.save(sale);
    }

    @Transactional
    public Sale processPartialReturn(String saleId, List<ReturnRequest.ReturnItemRequest> returnItems, String reason) {
        Sale sale = findSaleOrThrow(saleId);
        if (sale.getStatus() != SaleStatus.COMPLETED && sale.getStatus() != SaleStatus.PARTIALLY_RETURNED) {
            throw new InvalidSaleStateException("Only COMPLETED or PARTIALLY_RETURNED sales can have partial returns. Current status: " + sale.getStatus());
        }

        for (ReturnRequest.ReturnItemRequest returnItem : returnItems) {
            SaleItem saleItem = sale.getItems().stream()
                    .filter(i -> i.getId().equals(returnItem.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ProductNotFoundException("Item not found: " + returnItem.getItemId()));

            if (returnItem.getQuantity() > saleItem.getQuantity()) {
                throw new InvalidQuantityException("Return quantity (" + returnItem.getQuantity()
                        + ") exceeds purchased quantity (" + saleItem.getQuantity() + ") for item: " + saleItem.getProductName());
            }

            // Restore stock
            Product product = productRepository.findById(saleItem.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException(saleItem.getProductId()));
            product.setStock(product.getStock() + returnItem.getQuantity());
            productRepository.save(product);

            // Reduce item quantity or remove if fully returned
            int remaining = saleItem.getQuantity() - returnItem.getQuantity();
            if (remaining <= 0) {
                sale.getItems().remove(saleItem);
            } else {
                saleItem.setQuantity(remaining);
                saleItem.calculateLineTotal();
            }
        }

        sale.setStatus(SaleStatus.PARTIALLY_RETURNED);
        sale.setCancellationReason(reason);
        sale.calculateTotals();
        return saleRepository.save(sale);
    }

    // ==================== ASSOCIATE CUSTOMER ====================

    @Transactional
    public Sale associateCustomer(String saleId, String customerId) {
        Sale sale = findSaleOrThrow(saleId);
        validateSaleIsActive(sale);

        customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        sale.setCustomerId(customerId);
        return saleRepository.save(sale);
    }

    // ==================== HELPERS ====================

    private Sale findSaleOrThrow(String saleId) {
        return saleRepository.findById(saleId)
                .orElseThrow(() -> new SaleNotFoundException(saleId));
    }

    private void validateSaleIsActive(Sale sale) {
        if (sale.getStatus() != SaleStatus.ACTIVE) {
            throw new InvalidSaleStateException("Sale must be ACTIVE. Current status: " + sale.getStatus());
        }
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }
}
