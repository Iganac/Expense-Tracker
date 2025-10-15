
package com.expensetracker.backend.security;

import com.expensetracker.backend.model.User;
import com.expensetracker.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  public CustomUserDetailsService(UserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User u = users.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()));
    return org.springframework.security.core.userdetails.User
        .withUsername(u.getEmail())
        .password(u.getPasswordHash())
        .authorities(authorities)
        .accountExpired(false).accountLocked(false)
        .credentialsExpired(false).disabled(false)
        .build();
  }
}
