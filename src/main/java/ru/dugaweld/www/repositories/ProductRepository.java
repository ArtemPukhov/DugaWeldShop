package ru.dugaweld.www.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ru.dugaweld.www.models.Product;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);

    @Query(value = """
            SELECT p.*
            FROM products p
            WHERE to_tsvector('russian', coalesce(p.name, '') || ' ' || coalesce(p.description, ''))
                  @@ plainto_tsquery('russian', :query)
            ORDER BY ts_rank(
                to_tsvector('russian', coalesce(p.name, '') || ' ' || coalesce(p.description, '')),
                plainto_tsquery('russian', :query)
            ) DESC
            """, nativeQuery = true)
    List<Product> searchFullText(@Param("query") String query);
}
























