package ru.dugaweld.www.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CsvProductDto {
    private String name;
    private String description;
    private String price;
    private String categoryId;
    private String imageUrl;
}
