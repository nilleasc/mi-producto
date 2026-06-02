package com.pos.backend.infrastructure.persistence;

import com.pos.backend.domain.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, String> {
    List<Receipt> findBySaleId(String saleId);
    Optional<Receipt> findByTransactionId(String transactionId);
}
