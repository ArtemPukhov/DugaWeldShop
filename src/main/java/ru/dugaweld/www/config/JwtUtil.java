package ru.dugaweld.www.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import ru.dugaweld.www.services.UserService;
import ru.dugaweld.www.models.User;

import java.security.Key;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    private final Key key;
    private final long expirationTimeMs;
    private final long refreshExpirationTimeMs;
    
    @Autowired
    private UserService userService;

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
        // Получаем роль из базы данных
        try {
            User user = userService.findByUsername(username);
            if (user != null && user.getRole() != null) {
                return "ROLE_" + user.getRole().name();
            }
        } catch (Exception e) {
            System.err.println("Ошибка получения роли для пользователя " + username + ": " + e.getMessage());
        }
        // По умолчанию возвращаем ROLE_USER
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
