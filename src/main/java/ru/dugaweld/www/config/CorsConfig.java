package ru.dugaweld.www.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Разрешаем запросы с любых источников
        configuration.setAllowedOriginPatterns(List.of("*"));
        
        // Разрешаем все HTTP методы
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        
        // Разрешаем все заголовки
        configuration.setAllowedHeaders(List.of("*"));
        
        // Разрешаем передачу cookies и авторизационных заголовков
        configuration.setAllowCredentials(true);
        
        // Время кеширования preflight запросов
        configuration.setMaxAge(3600L);
        
        // Применяем конфигурацию ко всем путям
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}