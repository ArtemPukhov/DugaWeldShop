package ru.dugaweld.www.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.dugaweld.www.dto.CreateOrderDto;
import ru.dugaweld.www.dto.OrderDto;
import ru.dugaweld.www.models.Order;
import ru.dugaweld.www.models.OrderItem;
import ru.dugaweld.www.repositories.OrderRepository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ru.dugaweld.www.repositories.UserRepository userRepository;

    public OrderDto createOrder(CreateOrderDto createOrderDto) {
        Order order = new Order();
        
        // Генерируем уникальный номер заказа
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setTotalPrice(createOrderDto.getTotalPrice());
        
        // Связываем заказ с пользователем, если указан userId
        if (createOrderDto.getUserId() != null) {
            userRepository.findById(createOrderDto.getUserId()).ifPresent(order::setUser);
        }
        
        // Заполняем данные клиента
        CreateOrderDto.CustomerInfo customerInfo = createOrderDto.getCustomerInfo();
        order.setCustomerFirstName(customerInfo.getFirstName());
        order.setCustomerLastName(customerInfo.getLastName());
        order.setCustomerEmail(customerInfo.getEmail());
        order.setCustomerPhone(customerInfo.getPhone());
        order.setCustomerAddress(customerInfo.getAddress());
        order.setCustomerCity(customerInfo.getCity());
        order.setCustomerPostalCode(customerInfo.getPostalCode());
        order.setComment(customerInfo.getComment());
        
        // Сохраняем заказ
        final Order savedOrder = orderRepository.save(order);
        
        // Создаем товары заказа
        List<OrderItem> orderItems = createOrderDto.getItems().stream()
            .map(itemDto -> {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setProductId(itemDto.getId());
                orderItem.setProductName(itemDto.getName());
                orderItem.setPrice(itemDto.getPrice());
                orderItem.setQuantity(itemDto.getQuantity());
                orderItem.setProductImageUrl(itemDto.getImageUrl());
                orderItem.setCategoryId(itemDto.getCategoryId());
                return orderItem;
            })
            .collect(Collectors.toList());
        
        savedOrder.setOrderItems(orderItems);
        final Order finalOrder = orderRepository.save(savedOrder);
        
        return toDto(finalOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
            .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<OrderDto> getOrderById(Long id) {
        return orderRepository.findById(id)
            .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<OrderDto> getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
            .map(this::toDto);
    }

    public OrderDto updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Заказ не найден"));
        
        order.setStatus(status);
        order = orderRepository.save(order);
        
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByStatus(status, pageable)
            .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> searchOrders(String searchTerm, Pageable pageable) {
        return orderRepository.findBySearchTerm(searchTerm, pageable)
            .map(this::toDto);
    }

    public void deleteOrder(Long id) {
        if (!orderRepository.existsById(id)) {
            throw new RuntimeException("Заказ не найден");
        }
        orderRepository.deleteById(id);
    }

    private String generateOrderNumber() {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "ORD-" + timestamp.substring(timestamp.length() - 6) + "-" + uuid;
    }

    private OrderDto toDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber());
        dto.setStatus(order.getStatus());
        dto.setStatusDisplayName(order.getStatus().getDisplayName());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setCustomerFirstName(order.getCustomerFirstName());
        dto.setCustomerLastName(order.getCustomerLastName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setCustomerAddress(order.getCustomerAddress());
        dto.setCustomerCity(order.getCustomerCity());
        dto.setCustomerPostalCode(order.getCustomerPostalCode());
        dto.setComment(order.getComment());
        dto.setOrderDate(order.getOrderDate());
        
        if (order.getOrderItems() != null) {
            List<OrderDto.OrderItemDto> itemDtos = order.getOrderItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
            dto.setOrderItems(itemDtos);
        }
        
        return dto;
    }

    private OrderDto.OrderItemDto toItemDto(OrderItem orderItem) {
        OrderDto.OrderItemDto dto = new OrderDto.OrderItemDto();
        dto.setId(orderItem.getId());
        dto.setProductId(orderItem.getProductId());
        dto.setProductName(orderItem.getProductName());
        dto.setProductPrice(orderItem.getPrice());
        dto.setQuantity(orderItem.getQuantity());
        dto.setTotalPrice(orderItem.getPrice().multiply(BigDecimal.valueOf(orderItem.getQuantity())));
        dto.setProductImageUrl(orderItem.getProductImageUrl());
        dto.setCategoryId(orderItem.getCategoryId());
        return dto;
    }
}
