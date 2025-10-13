package ru.dugaweld.www.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.security.Key;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    private final Key key;
    private final long expirationTimeMs;
    private final long refreshExpirationTimeMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationTimeMs,
            @Value("${jwt.refresh-expiration-ms:1209600000}") long refreshExpirationTimeMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationTimeMs = expirationTimeMs;
        this.refreshExpirationTimeMs = refreshExpirationTimeMs;
    }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTimeMs))
                .claim("roles", getRolesForUser(username))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
    
    private String getRolesForUser(String username) {
        // Для простоты возвращаем роль на основе username
        // В реальном приложении это должно быть из базы данных
        if ("admin".equals(username)) {
            return "ROLE_ADMIN";
        }
        return "ROLE_USER";
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    public String extractRoles(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("roles", String.class);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String generateRefreshToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationTimeMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Date extractExpiration(String token) {
        return Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
    }
}
