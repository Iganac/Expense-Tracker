// src/main/java/com/expensetracker/backend/controller/MeController.java
package com.expensetracker.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class MeController {
  @GetMapping("/api/me")
  public Map<String, Object> me(Authentication auth) {
    return Map.of(
      "name", auth.getName(),
      "authorities", auth.getAuthorities().stream().map(Object::toString).collect(Collectors.toList())
    );
  }
}
