package com.expensetracker.backend.service;

import com.expensetracker.backend.exception.ConflictException;
import com.expensetracker.backend.exception.NotFoundException;
import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    @Transactional
    public User create(String email, String passwordHash, Role role) {
        users.findByEmail(email).ifPresent(u -> {
            throw new ConflictException("Email already exists");
        });
        var u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordHash);
        u.setRole(role == null ? Role.USER : role);
        u.setCreatedAt(Instant.now());
        return users.save(u);
    }

    public User get(UUID id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("User not found"));
    }

    public List<User> list() {
        return users.findAll();
    }

    @Transactional
    public User update(UUID id, String email, String passwordHash, Role role) {
        var u = get(id);
        if (email != null && !email.equals(u.getEmail())) {
            users.findByEmail(email).ifPresent(x -> {
                throw new ConflictException("Email already exists");
            });
            u.setEmail(email);
        }
        if (passwordHash != null)
            u.setPasswordHash(passwordHash);
        if (role != null)
            u.setRole(role);
        return users.save(u);
    }

    @Transactional
    public void delete(UUID id) {
        if (!users.existsById(id))
            throw new NotFoundException("User not found");
        users.deleteById(id);
    }
}
