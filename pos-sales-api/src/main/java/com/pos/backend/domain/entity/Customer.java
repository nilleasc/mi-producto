package com.pos.backend.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String documentType;

    @Column(unique = true, nullable = false)
    private String documentNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreditStatus creditStatus;
}
