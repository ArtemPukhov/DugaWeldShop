package ru.dugaweld.www.dto;

import lombok.Data;
import ru.dugaweld.www.models.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Order.OrderStatus status;
    private String statusDisplayName;
    private BigDecimal totalPrice;
    private String customerFirstName;
    private String customerLastName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    private String customerCity;
    private String customerPostalCode;
    private String comment;
    private LocalDateTime orderDate;
    private List<OrderItemDto> orderItems;

    @Data
    public static class OrderItemDto {
        private Long id;
        private Long productId;
        private String productName;
        private BigDecimal productPrice;
        private Integer quantity;
        private BigDecimal totalPrice;
        private String productImageUrl;
        private Long categoryId;
    }
}
