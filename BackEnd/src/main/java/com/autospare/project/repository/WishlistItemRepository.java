package com.autospare.project.repository;

import com.autospare.project.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByUserEmail(String userEmail);
    boolean existsByUserEmailAndProductId(String userEmail, Long productId);
    void deleteByUserEmailAndProductId(String userEmail, Long productId);
} 