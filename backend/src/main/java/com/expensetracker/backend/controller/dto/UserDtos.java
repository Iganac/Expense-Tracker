package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;

public class UserDtos {
    public record CreateUserRequest(
            @NotBlank @Email String email,
            @NotBlank String passwordHash,
            @NotBlank String role
    ) {
    }

    public record UpdateUserRequest(
            @Email String email,
            String passwordHash,
            String role) {
    }

    public record UserResponse(
            String id, String email, String role, String createdAt) {
    }
}
