package ru.dugaweld.www.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.dugaweld.www.models.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
}









