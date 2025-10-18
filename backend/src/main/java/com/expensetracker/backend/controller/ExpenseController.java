package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.ExpenseDtos.CreateExpenseRequest;
import com.expensetracker.backend.controller.dto.ExpenseDtos.UpdateExpenseRequest;
import com.expensetracker.backend.controller.dto.ExpenseDtos.ExpenseResponse;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.service.ExpenseService;
import com.expensetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;
    private final UserService userService;

    public ExpenseController(ExpenseService expenseService, UserService userService) {
        this.expenseService = expenseService;
        this.userService = userService;
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ExpenseResponse get(@PathVariable UUID id) {
        return toRes(expenseService.get(id));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> list(Authentication auth) {
        // Current user (from JWT set by your security filter)
        String email = auth.getName();
        User user = (User) userService.findByEmail(email);

        // Prefer service.listByUser(user.getId()) if available; otherwise filter in memory
        List<ExpenseResponse> body = expenseService.list().stream()
                .filter(e -> e.getUser() != null && user.getId().equals(e.getUser().getId()))
                .map(this::toRes)
                .toList();

        return ResponseEntity.ok(body);
    }

    @PostMapping
    public ExpenseResponse create(@Valid @RequestBody CreateExpenseRequest req, Authentication auth) {
        // Derive user from auth; do NOT accept userId from client
        String email = auth.getName();
        User user = (User) userService.findByEmail(email);

        var saved = expenseService.create(
                req.amount(),
                user.getId(),                              // derived
                UUID.fromString(req.categoryId()),
                req.expenseDate(),
                req.notes()
        );
        return toRes(saved);
    }

    @PutMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ExpenseResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateExpenseRequest req, Authentication auth) {
        // User cannot be reassigned via client; ignore userId entirely
        var saved = expenseService.update(
                id,
                req.amount(),
                req.notes(),
                req.expenseDate(),
                null, // userId not changeable via client updates
                req.categoryId() != null ? UUID.fromString(req.categoryId()) : null
        );
        return toRes(saved);
    }

    @DeleteMapping("/{id:[0-9a-fA-F\\-]{36}}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        expenseService.delete(id);
    }

    private ExpenseResponse toRes(Expense e) {
        // ExpenseResponse: (id, userId, categoryId, expenseDate, amount, notes, createdAt, updatedAt)
        return new ExpenseResponse(
                e.getId().toString(),
                e.getUser() != null ? e.getUser().getId().toString() : null,
                e.getCategory() != null ? e.getCategory().getId().toString() : null,
                e.getDate(),           // LocalDate
                e.getAmount(),         // BigDecimal
                e.getNotes(),
                e.getCreatedAt(),      // Instant
                e.getUpdatedAt()       // Instant
        );
    }
}
