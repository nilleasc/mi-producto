package com.pos.backend.adapter.in.web;

import com.pos.backend.adapter.in.web.dto.*;
import com.pos.backend.application.service.ReceiptService;
import com.pos.backend.application.service.SaleService;
import com.pos.backend.domain.entity.Receipt;
import com.pos.backend.domain.entity.Sale;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SaleController {
    private final SaleService saleService;
    private final ReceiptService receiptService;

    // ==================== CRUD ====================

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(@Valid @RequestBody CreateSaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(saleService.createSale(request));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<Sale> addItem(@PathVariable String id, @Valid @RequestBody AddItemRequest request) {
        return ResponseEntity.ok(saleService.addItem(id, request));
    }

    @PutMapping("/{id}/items/{itemId}")
    public ResponseEntity<Sale> updateItemQuantity(
            @PathVariable String id,
            @PathVariable String itemId,
            @Valid @RequestBody UpdateItemRequest request) {
        return ResponseEntity.ok(saleService.updateItemQuantity(id, itemId, request.getQuantity()));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<Sale> removeItem(@PathVariable String id, @PathVariable String itemId) {
        return ResponseEntity.ok(saleService.removeItem(id, itemId));
    }

    // ==================== CHECKOUT ====================

    @PostMapping("/{id}/checkout")
    public ResponseEntity<Sale> checkout(@PathVariable String id, @Valid @RequestBody CheckoutRequest request) {
        Sale sale = saleService.processCheckout(id, request);
        // Generate receipt on successful checkout
        receiptService.generateSaleReceipt(sale);
        return ResponseEntity.ok(sale);
    }

    // ==================== FREEZE / RESUME ====================

    @PostMapping("/{id}/freeze")
    public ResponseEntity<Sale> freezeSale(@PathVariable String id) {
        return ResponseEntity.ok(saleService.freezeSale(id));
    }

    @PostMapping("/{id}/resume")
    public ResponseEntity<Sale> resumeSale(@PathVariable String id) {
        return ResponseEntity.ok(saleService.resumeSale(id));
    }

    @GetMapping("/frozen")
    public ResponseEntity<List<Sale>> getFrozenSales(@RequestParam String terminalId) {
        return ResponseEntity.ok(saleService.getFrozenSales(terminalId));
    }

    // ==================== CANCEL ====================

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Sale> cancelSale(@PathVariable String id, @Valid @RequestBody CancelSaleRequest request) {
        return ResponseEntity.ok(saleService.cancelSale(id, request.getReason()));
    }

    // ==================== RETURNS ====================

    @PostMapping("/{id}/returns")
    public ResponseEntity<Sale> processReturn(@PathVariable String id, @Valid @RequestBody ReturnRequest request) {
        if (request.isFullReturn()) {
            return ResponseEntity.ok(saleService.processFullReturn(id, request.getReason()));
        } else {
            return ResponseEntity.ok(saleService.processPartialReturn(id, request.getItems(), request.getReason()));
        }
    }

    // ==================== CUSTOMER ASSOCIATION ====================

    @PatchMapping("/{id}/customer")
    public ResponseEntity<Sale> associateCustomer(@PathVariable String id, @RequestParam String customerId) {
        return ResponseEntity.ok(saleService.associateCustomer(id, customerId));
    }

    // ==================== RECEIPTS ====================

    @GetMapping("/{id}/receipts")
    public ResponseEntity<List<Receipt>> getReceipts(@PathVariable String id) {
        return ResponseEntity.ok(receiptService.getReceiptsBySaleId(id));
    }
}
