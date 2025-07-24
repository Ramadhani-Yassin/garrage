package com.autospare.project.controller;

import com.autospare.project.model.Order;
import com.autospare.project.model.OrderItem;
import com.autospare.project.service.OrderService;
import com.autospare.project.repository.UserRepository;
import com.autospare.project.model.User;
import com.autospare.project.repository.ProductRepository;
import com.autospare.project.model.Product;
import com.autospare.project.repository.ActivityLogRepository;
import com.autospare.project.model.ActivityLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @SuppressWarnings("unchecked")
    @PostMapping("/place")
    public Order placeOrder(@RequestBody Map<String, Object> payload) {
        String userEmail = (String) payload.get("userEmail");
        double total = ((Number) payload.get("total")).doubleValue();
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) payload.get("items");
        List<OrderItem> items = itemsData.stream().map(data -> {
            OrderItem item = new OrderItem();
            item.setProductName((String) data.get("productName"));
            item.setQuantity(((Number) data.get("quantity")).intValue());
            item.setPrice(((Number) data.get("price")).doubleValue());
            return item;
        }).toList();
        return orderService.createOrder(userEmail, total, items);
    }

    @GetMapping("/user/{email}")
    public List<Order> getOrdersByUser(@PathVariable String email) {
        return orderService.getOrdersByUserEmail(email);
    }

    public static class ProductDetailDTO {
        public String name;
        public int quantity;
        public double price;
        public ProductDetailDTO(String name, int quantity, double price) {
            this.name = name;
            this.quantity = quantity;
            this.price = price;
        }
    }

    public static class AdminOrderDTO {
        public Long id;
        public String userName;
        public List<ProductDetailDTO> products;
        public double total;
        public String status;
        public String orderDate;
        public AdminOrderDTO(Long id, String userName, List<ProductDetailDTO> products, double total, String status, String orderDate) {
            this.id = id;
            this.userName = userName;
            this.products = products;
            this.total = total;
            this.status = status;
            this.orderDate = orderDate;
        }
    }

    @GetMapping("/all")
    public List<AdminOrderDTO> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return orders.stream().map(order -> {
            User user = userRepository.findByEmail(order.getUserEmail());
            String userName = (user != null && user.getFullName() != null && !user.getFullName().isEmpty())
                ? user.getFullName()
                : (order.getUserEmail() != null ? order.getUserEmail() : "Unknown Customer");
            List<ProductDetailDTO> products = (order.getItems() != null && !order.getItems().isEmpty())
                ? order.getItems().stream().map(item -> new ProductDetailDTO(
                    item.getProductName(),
                    item.getQuantity(),
                    item.getPrice()
                )).toList()
                : List.of(new ProductDetailDTO("No Products", 0, 0));
            String orderDate = (order.getOrderDate() != null)
                ? order.getOrderDate().toString()
                : "N/A";
            return new AdminOrderDTO(
                order.getId() != null ? order.getId() : -1L,
                userName,
                products,
                order.getTotal(),
                order.getStatus() != null ? order.getStatus() : "pending",
                orderDate
            );
        }).toList();
    }

    @PutMapping("/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @GetMapping("/analytics/summary")
    public Map<String, Object> getOrderSummary() {
        List<Order> orders = orderService.getAllOrders();
        double totalSales = orders.stream().mapToDouble(Order::getTotal).sum();
        Map<String, Long> statusCounts = new HashMap<>();
        for (Order o : orders) {
            String status = o.getStatus() != null ? o.getStatus() : "pending";
            statusCounts.put(status, statusCounts.getOrDefault(status, 0L) + 1);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("totalSales", totalSales);
        result.put("statusCounts", statusCounts);
        return result;
    }

    @GetMapping("/analytics/sales-by-day")
    public Map<String, Double> getSalesByDay() {
        List<Order> orders = orderService.getAllOrders();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Double> salesByDay = new HashMap<>();
        for (Order o : orders) {
            if (o.getOrderDate() != null) {
                String day = o.getOrderDate().format(fmt);
                salesByDay.put(day, salesByDay.getOrDefault(day, 0.0) + o.getTotal());
            }
        }
        return salesByDay;
    }

    @GetMapping("/analytics/sales-by-product")
    public Map<String, Double> getSalesByProduct() {
        List<Order> orders = orderService.getAllOrders();
        Map<String, Double> salesByProduct = new HashMap<>();
        for (Order o : orders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    String name = item.getProductName();
                    double subtotal = item.getPrice() * item.getQuantity();
                    salesByProduct.put(name, salesByProduct.getOrDefault(name, 0.0) + subtotal);
                }
            }
        }
        return salesByProduct;
    }

    @GetMapping("/analytics/product-performance")
    public Map<String, Object> getProductPerformance() {
        List<Order> orders = orderService.getAllOrders();
        Map<String, Integer> productOrderCounts = new HashMap<>();
        for (Order o : orders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    String name = item.getProductName();
                    int qty = item.getQuantity();
                    productOrderCounts.put(name, productOrderCounts.getOrDefault(name, 0) + qty);
                }
            }
        }
        String bestSeller = productOrderCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse("N/A");

        // Low stock: count products with stock <= 3
        int lowStockCount = 0;
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            if (p.getStock() <= 3) {
                lowStockCount++;
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("bestSeller", bestSeller);
        result.put("lowStockCount", lowStockCount);
        return result;
    }

    @GetMapping("/activities/recent")
    public List<ActivityLog> getRecentActivities() {
        return activityLogRepository.findTop10ByOrderByTimestampDesc();
    }
} 