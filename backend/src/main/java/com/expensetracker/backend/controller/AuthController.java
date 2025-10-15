package com.expensetracker.backend.controller;

import com.expensetracker.backend.controller.dto.AuthDtos.AuthResponse;
import com.expensetracker.backend.controller.dto.AuthDtos.LoginRequest;
import com.expensetracker.backend.controller.dto.AuthDtos.RegisterRequest;
import com.expensetracker.backend.model.Role;
import com.expensetracker.backend.model.User;
import com.expensetracker.backend.security.JwtService;
import com.expensetracker.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
    var user = new User();
    user.setEmail(req.email());
    user.setPasswordHash(encoder.encode(req.password()));
    user.setRole(Role.USER);

    var saved = (User) userService.create(
        user.getEmail(),
        user.getPasswordHash(),
        user.getRole()
    );

    var token = jwtService.generateToken(
        saved.getEmail(),
        saved.getId().toString(),
        saved.getRole().name()
    );

    return ResponseEntity.ok(new AuthResponse(token));
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));

    var user = (User) userService.findByEmail(req.email());

    var token = jwtService.generateToken(
        user.getEmail(),
        user.getId().toString(),
        user.getRole().toString()
    );

    return ResponseEntity.ok(new AuthResponse(token));
  }
}
