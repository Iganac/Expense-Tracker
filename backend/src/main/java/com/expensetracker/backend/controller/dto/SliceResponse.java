package com.expensetracker.backend.controller.dto;

import java.util.List;

public record SliceResponse<T>(
        List<T> content,
        boolean hasNext,
        int number, // page index
        int size // page size
) {
}