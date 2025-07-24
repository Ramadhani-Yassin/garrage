package com.autospare.project.repository;

import com.autospare.project.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserEmailOrderByIdDesc(String userEmail);
    List<Order> findAllByOrderByIdDesc();
} 