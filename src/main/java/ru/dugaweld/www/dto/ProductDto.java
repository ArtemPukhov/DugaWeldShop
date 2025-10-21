package ru.dugaweld.www.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    private String specifications;

    @NotNull
    private Long categoryId;

    private List<ProductImageDto> images = new ArrayList<>();

    // Ссылка на страницу товара
    private String link;

}
























