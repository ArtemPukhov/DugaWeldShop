package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import ru.dugaweld.www.config.JwtUtil;
import ru.dugaweld.www.models.User;
import ru.dugaweld.www.services.UserService;
import ru.dugaweld.www.dto.LoginRequest;
import ru.dugaweld.www.dto.TokenResponse;
import ru.dugaweld.www.dto.RegisterRequest;

import java.util.Date;

@RestController
@RequestMapping("/auth")
@Tag(name = "Аутентификация", description = "Методы регистрации и входа")
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    @Operation(summary = "Регистрация нового пользователя", description = "Создает нового пользователя с логином, паролем и дополнительной информацией")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(
                request.getUsername(), 
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getPostalCode()
            );
            return ResponseEntity.ok("Пользователь " + user.getUsername() + " успешно зарегистрирован!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login-user")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            String token = jwtUtil.generateToken(request.getUsername());
            String refresh = jwtUtil.generateRefreshToken(request.getUsername());
            return ResponseEntity.ok(new TokenResponse(token, refresh));
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
        }
    }

    @PostMapping("/refresh")
    @Operation(summary = "Обновление JWT", description = "Принимает refreshToken и выдаёт новую пару токенов")
    public ResponseEntity<?> refresh(@Valid @RequestBody ru.dugaweld.www.dto.RefreshRequest request) {
        if (!jwtUtil.validateToken(request.getRefreshToken())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String username = jwtUtil.extractUsername(request.getRefreshToken());
        String token = jwtUtil.generateToken(username);
        String refresh = jwtUtil.generateRefreshToken(username);
        return ResponseEntity.ok(new TokenResponse(token, refresh));
    }

    @PostMapping("/logout")
    @Operation(summary = "Выход", description = "Статлес-выход: клиент удаляет JWT у себя. Возвращаем время истечения refresh")
    public ResponseEntity<?> logout(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                    @RequestBody(required = false) ru.dugaweld.www.dto.RefreshRequest request) {
        // В статлес-сценарии сервер не хранит состояние. Клиент должен забыть оба токена.
        // Для UX можно вернуть клиенту подсказку, когда истечёт текущий refresh (если передан).
        Date refreshExp = null;
        try {
            if (request != null && request.getRefreshToken() != null) {
                refreshExp = jwtUtil.extractExpiration(request.getRefreshToken());
            }
        } catch (Exception ignored) {}
        return ResponseEntity.ok(java.util.Map.of(
                "message", "logged_out",
                "refreshExp", refreshExp != null ? refreshExp.getTime() : null
        ));
    }
}