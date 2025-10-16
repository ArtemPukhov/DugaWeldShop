package ru.dugaweld.www.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.dugaweld.www.models.Order;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    Page<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    @Query("SELECT o FROM Order o WHERE " +
           "LOWER(o.customerFirstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerLastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.customerEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Order> findBySearchTerm(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    Long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate >= :startDate")
    Long countOrdersFromDate(@Param("startDate") LocalDateTime startDate);
}
