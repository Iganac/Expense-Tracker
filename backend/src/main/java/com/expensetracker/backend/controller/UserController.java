package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.UserDtos.*;
import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        var role = Role.valueOf(req.role().toUpperCase());
        var saved = service.create(req.email(), req.passwordHash(), role);
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
    public UserResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest req) {
        Role role = req.role() != null ? Role.valueOf(req.role().toUpperCase()) : null;
        var saved = service.update(id, req.email(), req.passwordHash(), role);
        return toRes(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private UserResponse toRes(User u) {
        return new UserResponse(u.getId().toString(), u.getEmail(), u.getRole().name(), ISO.format(u.getCreatedAt()));
    }
}
