package com.expensetracker.backend.service;

import com.expensetracker.backend.exception.ConflictException;
import com.expensetracker.backend.exception.NotFoundException;
import com.expensetracker.backend.model.Category;
import com.expensetracker.backend.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {
    private final CategoryRepository categories;

    public CategoryService(CategoryRepository categories) {
        this.categories = categories;
    }

    @Transactional
    public Category create(String name, String description) {
        categories.findByNameIgnoreCase(name).ifPresent(c -> {
            throw new ConflictException("Category already exists");
        });
        var c = new Category();
        c.setName(name);
        c.setDescription(description);
        c.setCreatedAt(Instant.now());
        return categories.save(c);
    }

    public Category get(UUID id) {
        return categories.findById(id).orElseThrow(() -> new NotFoundException("Category not found"));
    }

    public List<Category> list() {
        return categories.findAll(Sort.by("name").ascending());
    }

    @Transactional
    public Category update(UUID id, String name, String description) {
        var c = get(id);
        if (name != null && !name.equalsIgnoreCase(c.getName())) {
            categories.findByNameIgnoreCase(name).ifPresent(x -> {
                throw new ConflictException("Category already exists");
            });
            c.setName(name);
        }
        if (description != null)
            c.setDescription(description);
        return categories.save(c);
    }

    @Transactional
    public void delete(UUID id) {
        if (!categories.existsById(id))
            throw new NotFoundException("Category not found");
        categories.deleteById(id);
    }
}
