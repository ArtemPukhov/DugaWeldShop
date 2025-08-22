//package ru.dugaweld.www.controllers;
//
//import io.swagger.v3.oas.annotations.Operation;
//import io.swagger.v3.oas.annotations.tags.Tag;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.AuthenticationException;
//import org.springframework.web.bind.annotation.*;
//import jakarta.validation.Valid;
//import ru.dugaweld.www.config.JwtUtil;
//import ru.dugaweld.www.models.User;
//import ru.dugaweld.www.services.UserService;
//import ru.dugaweld.www.dto.LoginRequest;
//import ru.dugaweld.www.dto.TokenResponse;
//import ru.dugaweld.www.dto.RegisterRequest;
//
//@RestController
//@RequestMapping("/auth")
//@Tag(name = "Аутентификация", description = "Методы регистрации и входа")
//public class AuthController {
//
//    private final UserService userService;
//    private final AuthenticationManager authenticationManager;
//    private final JwtUtil jwtUtil;
//
//    public AuthController(UserService userService, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
//        this.userService = userService;
//        this.authenticationManager = authenticationManager;
//        this.jwtUtil = jwtUtil;
//    }
//
//    @PostMapping("/register")
//    @Operation(summary = "Регистрация нового пользователя", description = "Создает нового пользователя с логином и паролем")
//    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
//        User user = userService.registerUser(request.getUsername(), request.getPassword());
//        return ResponseEntity.ok("Пользователь " + user.getUsername() + " успешно зарегистрирован!");
//    }
//
//    @PostMapping("/login-user")
//    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
//            );
//            String token = jwtUtil.generateToken(request.getUsername());
//            return ResponseEntity.ok(new TokenResponse(token));
//        } catch (AuthenticationException ex) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Неверный логин или пароль");
//        }
//    }
//}