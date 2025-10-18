package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;

public class ExpenseDtos {

    public record CreateExpenseRequest(
        @NotNull @Positive BigDecimal amount,
        @Size(max = 300) String notes,
        @NotNull LocalDate expenseDate,
        @NotBlank String categoryId     // consider UUID type
        // userId OMITTED — derive from auth principal
    ) {}

    public record UpdateExpenseRequest(
        @Positive BigDecimal amount,
        @Size(max = 300) String notes,
        LocalDate expenseDate,
        String categoryId               // nullable = no change
    ) {}

    public record ExpenseResponse(
        String id,
        String userId,
        String categoryId,
        LocalDate expenseDate,          // strong type; serializes as "YYYY-MM-DD"
        BigDecimal amount,
        String notes,
        Instant createdAt,
        Instant updatedAt
    ) {}
}
