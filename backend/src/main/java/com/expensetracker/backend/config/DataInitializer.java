package com.expensetracker.backend.config;

import com.expensetracker.backend.model.Category;
import com.expensetracker.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Profile("prod") // Runs ONLY on Heroku when you use the "prod" profile
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {

        if (categoryRepository.count() == 0) {
            List<String> names = List.of(
                    "Bills & utilities",
                    "Education",
                    "Entertainment",
                    "Food & drink",
                    "Gas",
                    "Health",
                    "Personal",
                    "Professional",
                    "Shopping",
                    "Travel",
                    "Uncategorized"
            );

            List<Category> categories = names.stream()
                    .map(n -> Category.builder()
                            .name(n)
                            .description(null)
                            .build()
                    ).toList();

            categoryRepository.saveAll(categories);

            System.out.println("[DataInitializer] Seeded default categories.");
        } else {
            System.out.println("[DataInitializer] Categories already exist, skipping seeding.");
        }
    }
}