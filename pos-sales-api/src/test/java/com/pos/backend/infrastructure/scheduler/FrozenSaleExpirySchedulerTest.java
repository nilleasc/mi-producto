package com.pos.backend.infrastructure.scheduler;

import com.pos.backend.domain.entity.Sale;
import com.pos.backend.domain.entity.SaleStatus;
import com.pos.backend.infrastructure.persistence.SaleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FrozenSaleExpirySchedulerTest {

    @Mock
    private SaleRepository saleRepository;

    @InjectMocks
    private FrozenSaleExpiryScheduler scheduler;

    @Test
    @DisplayName("should cancel expired frozen sales")
    void expireFrozenSales_cancelsExpired() {
        ReflectionTestUtils.setField(scheduler, "expiryMinutes", 120);

        Sale expiredSale = Sale.builder()
                .id("sale-expired")
                .status(SaleStatus.FROZEN)
                .frozenAt(LocalDateTime.now().minusMinutes(150)) // 150 min ago
                .build();

        Sale recentSale = Sale.builder()
                .id("sale-recent")
                .status(SaleStatus.FROZEN)
                .frozenAt(LocalDateTime.now().minusMinutes(30)) // 30 min ago
                .build();

        when(saleRepository.findByStatus(SaleStatus.FROZEN))
                .thenReturn(new ArrayList<>(List.of(expiredSale, recentSale)));

        scheduler.expireFrozenSales();

        assertEquals(SaleStatus.CANCELLED, expiredSale.getStatus());
        assertEquals(SaleStatus.FROZEN, recentSale.getStatus());
        verify(saleRepository, times(1)).save(expiredSale);
        verify(saleRepository, never()).save(recentSale);
    }

    @Test
    @DisplayName("should skip frozen sales without frozenAt timestamp")
    void expireFrozenSales_skipsNullFrozenAt() {
        ReflectionTestUtils.setField(scheduler, "expiryMinutes", 120);

        Sale nullFrozenAt = Sale.builder()
                .id("sale-null")
                .status(SaleStatus.FROZEN)
                .frozenAt(null)
                .build();

        when(saleRepository.findByStatus(SaleStatus.FROZEN))
                .thenReturn(List.of(nullFrozenAt));

        scheduler.expireFrozenSales();

        assertEquals(SaleStatus.FROZEN, nullFrozenAt.getStatus());
        verify(saleRepository, never()).save(any());
    }
}
