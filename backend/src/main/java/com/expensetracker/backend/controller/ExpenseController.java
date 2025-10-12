package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.ExpenseDtos.*;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {
    private final ExpenseService service;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody CreateExpenseRequest req) {
        var saved = service.create(
                req.amount(),
                UUID.fromString(req.userId()),
                UUID.fromString(req.categoryId()),
                req.expenseDate(),
                req.notes());
        return ResponseEntity.status(HttpStatus.CREATED).body(toRes(saved));
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@PathVariable UUID id) {
        return toRes(service.get(id));
    }

    @GetMapping
    public List<ExpenseResponse> list() {
        return service.list().stream().map(this::toRes).toList();
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateExpenseRequest req) {
        var saved = service.update(
                id,
                req.amount(),
                req.notes(),
                req.expenseDate(),
                req.userId() != null ? UUID.fromString(req.userId()) : null,
                req.categoryId() != null ? UUID.fromString(req.categoryId()) : null);
        return toRes(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private ExpenseResponse toRes(Expense e) {
        return new ExpenseResponse(
                e.getId().toString(),
                e.getUser().getId().toString(),
                e.getCategory().getId().toString(),
                e.getDate().toString(),
                e.getAmount().toPlainString(),
                e.getNotes(),
                ISO.format(e.getCreatedAt()),
                ISO.format(e.getUpdatedAt()));
    }
}
