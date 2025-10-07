package ru.dugaweld.www.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.dugaweld.www.models.CarouselSlide;
import ru.dugaweld.www.services.CarouselService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/carousel")
@Tag(name = "Карусель")
public class CarouselController {
    
    private final CarouselService carouselService;
    
    public CarouselController(CarouselService carouselService) {
        this.carouselService = carouselService;
    }
    
    @GetMapping("/slides")
    @Operation(summary = "Получение всех слайдов карусели")
    public ResponseEntity<List<CarouselSlide>> getAllSlides() {
        try {
            List<CarouselSlide> slides = carouselService.getAllSlides();
            return ResponseEntity.ok(slides);
        } catch (Exception e) {
            log.error("Ошибка при получении слайдов карусели: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/slides")
    @Operation(summary = "Добавление нового слайда карусели")
    public ResponseEntity<CarouselSlide> addSlide(@RequestBody CarouselSlide slide) {
        try {
            CarouselSlide newSlide = carouselService.addSlide(slide);
            return ResponseEntity.ok(newSlide);
        } catch (Exception e) {
            log.error("Ошибка при добавлении слайда: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/slides/{id}")
    @Operation(summary = "Обновление слайда карусели")
    public ResponseEntity<CarouselSlide> updateSlide(@PathVariable Long id, @RequestBody CarouselSlide slide) {
        try {
            CarouselSlide updatedSlide = carouselService.updateSlide(id, slide);
            return ResponseEntity.ok(updatedSlide);
        } catch (Exception e) {
            log.error("Ошибка при обновлении слайда {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/slides/{id}")
    @Operation(summary = "Удаление слайда карусели")
    public ResponseEntity<Void> deleteSlide(@PathVariable Long id) {
        try {
            carouselService.deleteSlide(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Ошибка при удалении слайда {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/slides/reorder")
    @Operation(summary = "Переупорядочивание слайдов карусели")
    public ResponseEntity<List<CarouselSlide>> reorderSlides(@RequestBody List<Long> slideIds) {
        try {
            List<CarouselSlide> reorderedSlides = carouselService.reorderSlides(slideIds);
            return ResponseEntity.ok(reorderedSlides);
        } catch (Exception e) {
            log.error("Ошибка при переупорядочивании слайдов: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
