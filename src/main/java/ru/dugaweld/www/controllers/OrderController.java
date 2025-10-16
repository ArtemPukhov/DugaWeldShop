package ru.dugaweld.www.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.dugaweld.www.dto.CreateOrderDto;
import ru.dugaweld.www.dto.OrderDto;
import ru.dugaweld.www.models.Order;
import ru.dugaweld.www.services.OrderService;

import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(@RequestBody CreateOrderDto createOrderDto) {
        try {
            OrderDto order = orderService.createOrder(createOrderDto);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<Page<OrderDto>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "orderDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            System.out.println("Getting orders - page: " + page + ", size: " + size);
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<OrderDto> orders;
            
            if (search != null && !search.trim().isEmpty()) {
                System.out.println("Searching orders with term: " + search);
                orders = orderService.searchOrders(search.trim(), pageable);
            } else if (status != null && !status.trim().isEmpty()) {
                try {
                    Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
                    System.out.println("Getting orders by status: " + orderStatus);
                    orders = orderService.getOrdersByStatus(orderStatus, pageable);
                } catch (IllegalArgumentException e) {
                    System.out.println("Invalid status, getting all orders");
                    orders = orderService.getAllOrders(pageable);
                }
            } else {
                System.out.println("Getting all orders");
                orders = orderService.getAllOrders(pageable);
            }
            
            System.out.println("Found " + orders.getTotalElements() + " orders");
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.err.println("Error in getAllOrders: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(@PathVariable Long id) {
        Optional<OrderDto> order = orderService.getOrderById(id);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getOrderByNumber(@PathVariable String orderNumber) {
        Optional<OrderDto> order = orderService.getOrderByNumber(orderNumber);
        return order.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderDto order = orderService.updateOrderStatus(id, orderStatus);
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/statuses")
    public ResponseEntity<Order.OrderStatus[]> getOrderStatuses() {
        return ResponseEntity.ok(Order.OrderStatus.values());
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Orders API is working!");
    }
}
