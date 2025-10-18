package com.expensetracker.backend.config;

import com.expensetracker.backend.model.*;
import com.expensetracker.backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
@Profile("dev")
public class DemoDataLoader {

        @Bean
        CommandLineRunner initDatabase(UserRepository userRepo,
                        CategoryRepository categoryRepo,
                        ExpenseRepository expenseRepo) {
                return args -> {
                        // Regular user
                        var userEmail = "test@example.com";
                        var user = userRepo.findByEmail(userEmail).orElseGet(() -> userRepo.save(User.builder()
                                        .email(userEmail)
                                        .passwordHash("TEMP")
                                        .role(Role.USER) // if using enum; else "user"
                                        .build()));

                        // Admin
                        var adminEmail = "admin@example.com";
                        userRepo.findByEmail(adminEmail).orElseGet(() -> userRepo.save(User.builder()
                                        .email(adminEmail)
                                        .passwordHash("TEMP")
                                        .role(Role.ADMIN) // or "admin"
                                        .build()));

                        // Default/global categories (users can also create more later)
                        categoryRepo.findByNameIgnoreCase("Uncategorized")
                                        .orElseGet(() -> categoryRepo.save(Category.builder()
                                                        .name("Uncategorized").description("Fallback category")
                                                        .build()));

                        var food = categoryRepo.findByNameIgnoreCase("Food")
                                        .orElseGet(() -> categoryRepo.save(Category.builder()
                                                        .name("Food").description("Meals & groceries").build()));

                        categoryRepo.findByNameIgnoreCase("Travel")
                                        .orElseGet(() -> categoryRepo.save(Category.builder()
                                                        .name("Travel").description("Commute, tickets, gas").build()));

                        // Seed one expense for regular user (only if none exist)
                        if (expenseRepo.findAllByUserIdOrderByDateDesc(user.getId()).isEmpty()) {
                                expenseRepo.save(Expense.builder()
                                                .user(user)
                                                .category(food)
                                                .amount(new BigDecimal("12.50"))
                                                .date(LocalDate.now())
                                                .notes("Lunch at cafe")
                                                .build());
                        }
                };
        }
}
