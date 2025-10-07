package ru.dugaweld.www.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.dugaweld.www.models.CarouselSlide;
import ru.dugaweld.www.repositories.CarouselSlideRepository;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
public class CarouselService {
    
    private final CarouselSlideRepository carouselSlideRepository;
    
    public CarouselService(CarouselSlideRepository carouselSlideRepository) {
        this.carouselSlideRepository = carouselSlideRepository;
    }
    
    public List<CarouselSlide> getAllSlides() {
        return carouselSlideRepository.findAllByOrderByOrderAsc();
    }
    
    public List<CarouselSlide> getActiveSlides() {
        return carouselSlideRepository.findActiveSlidesOrdered();
    }
    
    public CarouselSlide addSlide(CarouselSlide slide) {
        // Устанавливаем порядок для нового слайда
        if (slide.getOrder() == null) {
            Long maxOrder = carouselSlideRepository.findAllByOrderByOrderAsc()
                .stream()
                .mapToLong(CarouselSlide::getOrder)
                .max()
                .orElse(0L);
            slide.setOrder(maxOrder.intValue() + 1);
        }
        
        return carouselSlideRepository.save(slide);
    }
    
    public CarouselSlide updateSlide(Long id, CarouselSlide slideData) {
        Optional<CarouselSlide> existingSlide = carouselSlideRepository.findById(id);
        
        if (existingSlide.isEmpty()) {
            throw new RuntimeException("Слайд с ID " + id + " не найден");
        }
        
        CarouselSlide slide = existingSlide.get();
        slide.setImageUrl(slideData.getImageUrl());
        slide.setTitle(slideData.getTitle());
        slide.setSubtitle(slideData.getSubtitle());
        slide.setLinkUrl(slideData.getLinkUrl());
        slide.setIsActive(slideData.getIsActive());
        slide.setOrder(slideData.getOrder());
        
        return carouselSlideRepository.save(slide);
    }
    
    public void deleteSlide(Long id) {
        if (!carouselSlideRepository.existsById(id)) {
            throw new RuntimeException("Слайд с ID " + id + " не найден");
        }
        
        carouselSlideRepository.deleteById(id);
    }
    
    public List<CarouselSlide> reorderSlides(List<Long> slideIds) {
        List<CarouselSlide> slides = carouselSlideRepository.findAllById(slideIds);
        
        for (int i = 0; i < slideIds.size(); i++) {
            Long slideId = slideIds.get(i);
            CarouselSlide slide = slides.stream()
                .filter(s -> s.getId().equals(slideId))
                .findFirst()
                .orElse(null);
            
            if (slide != null) {
                slide.setOrder(i + 1);
                carouselSlideRepository.save(slide);
            }
        }
        
        return carouselSlideRepository.findAllByOrderByOrderAsc();
    }
}
