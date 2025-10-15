package com.expensetracker.backend.service;

import com.expensetracker.backend.exception.NotFoundException;
import com.expensetracker.backend.model.Category;
import com.expensetracker.backend.model.Expense;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.repository.ExpenseRepository;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class ExpenseService {
    private final ExpenseRepository expenses;
    private final UserRepository users;
    private final CategoryRepository categories;

    public ExpenseService(ExpenseRepository expenses, UserRepository users, CategoryRepository categories) {
        this.expenses = expenses;
        this.users = users;
        this.categories = categories;
    }

    @Transactional
    public Expense create(BigDecimal amount, UUID userId, UUID categoryId, LocalDate expenseDate, String notes) {
        User u = users.findById(userId).orElseThrow(() -> new NotFoundException("User not found"));
        Category c = categories.findById(categoryId).orElseThrow(() -> new NotFoundException("Category not found"));
        var e = new Expense();
        e.setAmount(amount);
        e.setUser(u);
        e.setCategory(c);
        e.setDate(expenseDate);
        e.setNotes(notes);
        e.setCreatedAt(Instant.now());
        e.setUpdatedAt(Instant.now());
        return expenses.save(e);
    }

    public Expense get(UUID id) {
        return expenses.findById(id).orElseThrow(() -> new NotFoundException("Expense not found"));
    }

    public List<Expense> list() {
        return expenses.findAll(Sort.by(Sort.Direction.DESC, "date"));
    }

    @Transactional
    public Expense update(UUID id, BigDecimal amount, String notes, LocalDate expenseDate, UUID userId,
            UUID categoryId) {
        var e = get(id);
        if (amount != null)
            e.setAmount(amount);
        if (notes != null)
            e.setNotes(notes);
        if (expenseDate != null)
            e.setDate(expenseDate);
        if (userId != null)
            e.setUser(users.findById(userId).orElseThrow(() -> new NotFoundException("User not found")));
        if (categoryId != null)
            e.setCategory(
                    categories.findById(categoryId).orElseThrow(() -> new NotFoundException("Category not found")));
        e.setUpdatedAt(Instant.now());
        return expenses.save(e);
    }

    @Transactional
    public void delete(UUID id) {
        if (!expenses.existsById(id))
            throw new NotFoundException("Expense not found");
        expenses.deleteById(id);
    }

    public List<Expense> listByUser(UUID userId) {
        return expenses.findByUser_IdOrderByDateDesc(userId);
    }
}
