package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDtos {
    public record CreateExpenseRequest(
            @NotNull @Positive BigDecimal amount,
            String notes,
            @NotNull LocalDate expenseDate,
            @NotNull String userId,
            @NotNull String categoryId
    ) {}
    public record UpdateExpenseRequest(
            @Positive BigDecimal amount,
            String notes,
            LocalDate expenseDate,
            String userId,
            String categoryId
    ) {}
    public record ExpenseResponse(
            String id, String userId, String categoryId,
            String expenseDate, String amount, String notes,
            String createdAt, String updatedAt
    ) {}
}
