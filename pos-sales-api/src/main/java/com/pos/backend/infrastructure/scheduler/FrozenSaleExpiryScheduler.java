package com.pos.backend.infrastructure.scheduler;

import com.pos.backend.domain.entity.Sale;
import com.pos.backend.domain.entity.SaleStatus;
import com.pos.backend.infrastructure.persistence.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Automatically cancels FROZEN sales that have exceeded the configured expiry time.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FrozenSaleExpiryScheduler {

    private final SaleRepository saleRepository;

    @Value("${pos.frozen.expiry-minutes:120}")
    private int expiryMinutes;

    @Scheduled(fixedRate = 300000) // every 5 minutes
    @Transactional
    public void expireFrozenSales() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(expiryMinutes);
        List<Sale> frozenSales = saleRepository.findByStatus(SaleStatus.FROZEN);

        for (Sale sale : frozenSales) {
            if (sale.getFrozenAt() != null && sale.getFrozenAt().isBefore(cutoff)) {
                sale.setStatus(SaleStatus.CANCELLED);
                sale.setCancellationReason("Automatically cancelled: frozen sale expired after " + expiryMinutes + " minutes");
                saleRepository.save(sale);
                log.info("Expired frozen sale: {}", sale.getId());
            }
        }
    }
}
