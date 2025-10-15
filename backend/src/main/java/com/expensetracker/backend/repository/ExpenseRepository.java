package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findAllByUserIdOrderByDateDesc(UUID userId);
    List<Expense> findAllByUserIdAndDateBetweenOrderByDateDesc(UUID userId, LocalDate start, LocalDate end);
    List<Expense> findByUser_IdOrderByDateDesc(UUID userId);
    boolean existsByCategoryId(UUID categoryId);
    long countByCategoryId(UUID categoryId);
}
