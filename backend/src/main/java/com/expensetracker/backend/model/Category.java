package com.expensetracker.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "categories",
       uniqueConstraints = @UniqueConstraint(name = "uk_category_name_ci", columnNames = "name"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Category {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", nullable = false)
    @org.hibernate.annotations.CreationTimestamp
    private Instant createdAt = Instant.now();
}
