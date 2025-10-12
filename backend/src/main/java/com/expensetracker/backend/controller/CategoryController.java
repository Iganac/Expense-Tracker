package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.CategoryDtos.*;
import com.expensetracker.backend.model.Category;
import com.expensetracker.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService service;
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest req) {
        var saved = service.create(req.name(), req.description());
        return ResponseEntity.status(HttpStatus.CREATED).body(toRes(saved));
    }

    @GetMapping("/{id}")
    public CategoryResponse get(@PathVariable UUID id) {
        return toRes(service.get(id));
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return service.list().stream().map(this::toRes).toList();
    }

    @PutMapping("/{id}")
    public CategoryResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateCategoryRequest req) {
        var saved = service.update(id, req.name(), req.description());
        return toRes(saved);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    private CategoryResponse toRes(Category c) {
        return new CategoryResponse(c.getId().toString(), c.getName(), c.getDescription(),
                ISO.format(c.getCreatedAt()));
    }
}