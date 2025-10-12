package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;

public class CategoryDtos {
    public record CreateCategoryRequest(@NotBlank String name, String description) {
    }

    public record UpdateCategoryRequest(String name, String description) {
    }

    public record CategoryResponse(String id, String name, String description, String createdAt) {
    }
}
