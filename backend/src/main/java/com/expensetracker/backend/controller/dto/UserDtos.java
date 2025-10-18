package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;

public class UserDtos {

    // Self-managed (client cannot set role)
    public record SelfUpdateRequest(
        @Email String email,
        @Size(min = 8, max = 72) String password // plaintext; server hashes
    ) {}

    public record UserResponse(
        String id,
        String email,
        String role
    ) {}

    // Admin-only endpoints (if you need them)
    public record AdminCreateUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @NotBlank String role
    ) {}

    public record AdminUpdateUserRequest(
        @Email String email,
        @Size(min = 8, max = 72) String password,
        String role
    ) {}
}
