// src/main/java/com/expensetracker/backend/security/JwtService.java
package com.expensetracker.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

  private final Key key;
  private final long expMinutes;

  public JwtService(
      @Value("${security.jwt.secret}") String secret,
      @Value("${security.jwt.exp-min:60}") long expMinutes) {

    this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    this.expMinutes = expMinutes;
  }

  public String generateToken(String email, String uid, String role) {
    long nowMs = System.currentTimeMillis();
    long expMs = nowMs + expMinutes * 60_000L;

    return Jwts.builder()
        .setSubject(email)
        .addClaims(Map.of("uid", uid, "role", role))
        .setIssuedAt(new Date(nowMs))
        .setExpiration(new Date(expMs))
        .signWith(key, SignatureAlgorithm.HS256)
        .compact();
  }

  public String extractUsername(String token) {
    return parse(token).getBody().getSubject();
  }

  public boolean isTokenValid(String token, UserDetails user) {
    try {
      var claims = parse(token).getBody();
      boolean expired = claims.getExpiration().before(new Date());
      return !expired && user.getUsername().equals(claims.getSubject());
    } catch (ExpiredJwtException e) {
      return false; // token expired
    } catch (JwtException e) {
      return false; // malformed/invalid signature, etc.
    }
  }

  private Jws<Claims> parse(String token) {
    // allow small clock skew to avoid edge-case failures
    return Jwts.parserBuilder()
        .setSigningKey(key)
        .setAllowedClockSkewSeconds(30)
        .build()
        .parseClaimsJws(token);
  }
}
