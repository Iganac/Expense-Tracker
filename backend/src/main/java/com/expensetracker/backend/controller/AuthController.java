package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.AuthDtos.AuthResponse;
import com.expensetracker.backend.controller.dto.AuthDtos.LoginRequest;
import com.expensetracker.backend.controller.dto.AuthDtos.MeResponse;
import com.expensetracker.backend.controller.dto.AuthDtos.RegisterRequest;
import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.security.JwtService;
import com.expensetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthenticationManager authManager;
  private final UserService userService;
  private final PasswordEncoder encoder;
  private final JwtService jwtService;

  public AuthController(
      AuthenticationManager authManager,
      UserService userService,
      PasswordEncoder encoder,
      JwtService jwtService
  ) {
    this.authManager = authManager;
    this.userService = userService;
    this.encoder = encoder;
    this.jwtService = jwtService;
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    final String email = req.email().trim().toLowerCase();

    var user = new User();
    user.setEmail(email);
    user.setPasswordHash(encoder.encode(req.password()));
    user.setRole(Role.USER);

    User saved;
    try {
      saved = (User) userService.create(user.getEmail(), user.getPasswordHash(), user.getRole());
    } catch (DataIntegrityViolationException dup) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 if email already exists
    }

    var token = jwtService.generateToken(
        saved.getEmail(),
        saved.getId().toString(),
        saved.getRole().name()
    );

    return ResponseEntity
        .created(URI.create("/api/auth/me"))
        .body(new AuthResponse(token));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    final String email = req.email().trim().toLowerCase();

    authManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));

    var user = (User) userService.findByEmail(email);
    var token = jwtService.generateToken(
        user.getEmail(),
        user.getId().toString(),
        user.getRole().name()
    );

    return ResponseEntity.ok(new AuthResponse(token));
  }

  @GetMapping("/me")
  public ResponseEntity<MeResponse> me(Authentication auth) {
    var user = (User) userService.findByEmail(auth.getName());
    var body = new MeResponse(user.getId().toString(), user.getEmail(), user.getRole().name());
    return ResponseEntity.ok(body);
  }
}
