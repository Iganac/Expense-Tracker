package com.expensetracker.backend.controller.dto;

import jakarta.validation.constraints.*;

public class AuthDtos {

        public record RegisterRequest(
                        @NotBlank @Email String email,
                        @NotBlank String password // server will hash
        ) {
        }

        public record LoginRequest(
                        @NotBlank @Email String email,
                        @NotBlank String password) {
        }


        public record AuthResponse(String token) {
        }

        // Strictly for testing /api/me
        public record MeResponse(
                        String id,
                        String email,
                        String role) {
        }
}
