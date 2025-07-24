package com.autospare.project.service;

import com.autospare.project.model.Order;
import com.autospare.project.model.OrderItem;
import com.autospare.project.repository.OrderRepository;
import com.autospare.project.repository.ActivityLogRepository;
import com.autospare.project.model.ActivityLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ActivityLogRepository activityLogRepository;

    public Order createOrder(String userEmail, double total, List<OrderItem> items) {
        Order order = new Order();
        order.setUserEmail(userEmail);
        order.setTotal(total);
        order.setOrderDate(LocalDateTime.now());
        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserEmail(String userEmail) {
        return orderRepository.findByUserEmailOrderByIdDesc(userEmail);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAllByOrderByIdDesc();
    }

    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        // Log activity
        ActivityLog log = new ActivityLog();
        log.setType("order");
        log.setDescription("Order #" + id + " status updated to " + status);
        log.setTimestamp(java.time.LocalDateTime.now());
        activityLogRepository.save(log);
        return updated;
    }
} 