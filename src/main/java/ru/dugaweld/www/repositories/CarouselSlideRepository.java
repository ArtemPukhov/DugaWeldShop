package ru.dugaweld.www.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.dugaweld.www.models.CarouselSlide;

import java.util.List;

@Repository
public interface CarouselSlideRepository extends JpaRepository<CarouselSlide, Long> {
    
    @Query("SELECT c FROM CarouselSlide c WHERE c.isActive = true ORDER BY c.order ASC")
    List<CarouselSlide> findActiveSlidesOrdered();
    
    List<CarouselSlide> findAllByOrderByOrderAsc();
}
