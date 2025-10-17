package ru.dugaweld.www.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.dugaweld.www.dto.UserDto;
import ru.dugaweld.www.services.UserService;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class MeController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        
        try {
            var user = userService.findByUsername(auth.getName());
            if (user != null) {
                UserDto userDto = UserDto.fromUser(user);
                return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "user", userDto
                ));
            } else {
                return ResponseEntity.ok(Map.of("authenticated", false));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
    }
}
//
//
//
//
//

















