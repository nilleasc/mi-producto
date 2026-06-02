package com.pos.backend.infrastructure.persistence;

import com.pos.backend.domain.entity.Sale;
import com.pos.backend.domain.entity.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, String> {
    List<Sale> findByTerminalIdAndStatus(String terminalId, SaleStatus status);
    List<Sale> findByStatus(SaleStatus status);
}
