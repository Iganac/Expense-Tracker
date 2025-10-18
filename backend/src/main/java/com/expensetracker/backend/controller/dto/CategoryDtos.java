package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;

public class CategoryDtos {

    public record CreateCategoryRequest(
        @NotBlank @Size(max = 60) String name,
        @Size(max = 200) String description
    ) {}

    public record UpdateCategoryRequest(
        @Size(max = 60) String name,
        @Size(max = 200) String description
    ) {}

    public record CategoryResponse(
        String id,        // consider UUID type in codebase
        String name,
        String description,
        java.time.Instant createdAt
    ) {}
}
