package ru.dugaweld.www.dto;

import lombok.Data;

@Data
public class ProductImageDto {
    private Long id;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean isPrimary;
}

