//package ru.dugaweld.www.controllers;
//
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/users")
//public class MeController {
//
//    @GetMapping("/me")
//    public Map<String, Object> me(Authentication auth) {
//        if (auth == null) {
//            return Map.of("authenticated", false);
//        }
//        List<String> roles = auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
//        return Map.of(
//                "authenticated", true,
//                "username", auth.getName(),
//                "roles", roles
//        );
//    }
//}
//
//
//
//
//












