package ru.dugaweld.www.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;

    @Column(name = "customer_first_name", nullable = false)
    private String customerFirstName;

    @Column(name = "customer_last_name", nullable = false)
    private String customerLastName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    @Column(name = "customer_city")
    private String customerCity;

    @Column(name = "customer_postal_code")
    private String customerPostalCode;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<OrderItem> orderItems;

    // Статусы заказа
    public enum OrderStatus {
        PENDING("Ожидает обработки"),
        CONFIRMED("Подтвержден"),
        PROCESSING("В обработке"),
        SHIPPED("Отправлен"),
        DELIVERED("Доставлен"),
        CANCELLED("Отменен");

        private final String displayName;

        OrderStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
