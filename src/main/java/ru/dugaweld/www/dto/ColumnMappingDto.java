package ru.dugaweld.www.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ColumnMappingDto {
    private String csvColumn;
    private String targetField;
}
