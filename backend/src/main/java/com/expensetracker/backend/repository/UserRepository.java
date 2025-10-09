package com.expensetracker.backend.repository;

import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(Role role);
    boolean existsByRole(Role role);
}
