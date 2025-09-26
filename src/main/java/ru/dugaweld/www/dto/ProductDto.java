package ru.dugaweld.www.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

@Data
@RequiredArgsConstructor
public class ProductDto {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private BigDecimal price;

    private String imageUrl;

    @NotNull
    private Long categoryId;

}

















