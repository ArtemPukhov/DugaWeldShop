package ru.dugaweld.www.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CsvImportRequest {
    private List<ColumnMappingDto> columnMappings;
}



