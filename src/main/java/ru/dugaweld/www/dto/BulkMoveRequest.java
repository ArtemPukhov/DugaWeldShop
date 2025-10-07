package ru.dugaweld.www.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Data
@RequiredArgsConstructor
public class BulkMoveRequest {
    @NotEmpty
    private List<Long> productIds;
    
    @NotNull
    private Long targetCategoryId;
}
