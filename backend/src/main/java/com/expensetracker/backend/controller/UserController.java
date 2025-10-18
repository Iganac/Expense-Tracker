package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.UserDtos.AdminCreateUserRequest;
import com.expensetracker.backend.controller.dto.UserDtos.AdminUpdateUserRequest;
import com.expensetracker.backend.controller.dto.UserDtos.UserResponse;
import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    private final PasswordEncoder encoder;

    public UserController(UserService service, PasswordEncoder encoder) {
        this.service = service;
        this.encoder = encoder;
    }

    // Consider securing this controller with admin-only access via Spring Security
    // config

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody AdminCreateUserRequest req) {
        var role = Role.valueOf(req.role().toUpperCase());
        var passwordHash = encoder.encode(req.password());
        var saved = service.create(req.email(), passwordHash, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(toRes(saved));
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable UUID id) {
        return toRes(service.get(id));
    }

    @GetMapping
    public List<UserResponse> list() {
        return service.list().stream().map(this::toRes).toList();
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody AdminUpdateUserRequest req) {
        Role role = req.role() != null ? Role.valueOf(req.role().toUpperCase()) : null;
        String passwordHash = req.password() != null ? encoder.encode(req.password()) : null;
        var saved = service.update(id, req.email(), passwordHash, role);
        return toRes(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private UserResponse toRes(User u) {
        // UserResponse: (id, email, role)
        return new UserResponse(u.getId().toString(), u.getEmail(), u.getRole().name());
    }
}
