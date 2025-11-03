package com.expensetracker.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

  private final JwtService jwtService;
  private final CustomUserDetailsService userDetailsService;

  public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
    this.jwtService = jwtService;
    this.userDetailsService = userDetailsService;
  }

  @Override
  protected void doFilterInternal(@NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain) throws ServletException, IOException {
    final String path = request.getRequestURI();
    final String header = request.getHeader("Authorization");

    // allow unauthenticated routes and preflight
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())
        || "/api/auth/login".equals(path)
        || "/api/auth/register".equals(path)) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      if (header != null && header.startsWith("Bearer ")) {
        final String token = header.substring(7);
        final String username = jwtService.extractUsername(token); // may throw
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
          UserDetails user = userDetailsService.loadUserByUsername(username);
          if (jwtService.isTokenValid(token, user)) {
            var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
          }
        }
      }
    } catch (Exception ex) { // catch broadly to be safe
      SecurityContextHolder.clearContext(); // ensure no partial auth leaks
    }

    filterChain.doFilter(request, response);
  }
}