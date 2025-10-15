package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public record RegisterRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    public record AuthResponse(String token) {
    }

    // optional, handy for /api/me
    // public record MeResponse(String id, String email, String role) {
    // }
}
