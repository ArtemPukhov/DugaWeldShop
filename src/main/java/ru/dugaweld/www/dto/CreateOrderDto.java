package ru.dugaweld.www.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderDto {
    private List<OrderItemRequest> items;
    private BigDecimal totalPrice;
    private CustomerInfo customerInfo;

    @Data
    public static class OrderItemRequest {
        private Long id;
        private String name;
        private BigDecimal price;
        private String imageUrl;
        private Integer quantity;
        private Long categoryId;
    }

    @Data
    public static class CustomerInfo {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String postalCode;
        private String comment;
    }
}
