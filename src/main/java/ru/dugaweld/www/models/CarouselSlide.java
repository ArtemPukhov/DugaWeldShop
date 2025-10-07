package ru.dugaweld.www.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "carousel_slides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarouselSlide {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String imageUrl;
    
    @Column(nullable = false)
    private String title;
    
    @Column
    private String subtitle;
    
    @Column
    private String linkUrl;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "order", nullable = false)
    private Integer order = 0;
}
