package com.pos.backend.domain.entity;

import com.pos.backend.domain.valueobject.Money;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    private String id;
    private String sku;
    private String name;
    private Money price;
    private int stock;
    private String categoryId;
    private boolean isActive;
}
