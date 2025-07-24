package com.autospare.project.service;

import com.autospare.project.model.WishlistItem;
import com.autospare.project.repository.WishlistItemRepository;
import com.autospare.project.repository.ActivityLogRepository;
import com.autospare.project.model.ActivityLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishlistService {
    @Autowired
    private WishlistItemRepository wishlistItemRepository;
    @Autowired
    private ActivityLogRepository activityLogRepository;

    public List<WishlistItem> getWishlist(String userEmail) {
        return wishlistItemRepository.findByUserEmail(userEmail);
    }

    public WishlistItem addToWishlist(String userEmail, Long productId, String productName) {
        if (!wishlistItemRepository.existsByUserEmailAndProductId(userEmail, productId)) {
            WishlistItem item = new WishlistItem();
            item.setUserEmail(userEmail);
            item.setProductId(productId);
            item.setProductName(productName);
            WishlistItem saved = wishlistItemRepository.save(item);
            // Log activity
            ActivityLog log = new ActivityLog();
            log.setType("wishlist");
            log.setDescription("Product '" + productName + "' added to wishlist by " + userEmail);
            log.setTimestamp(java.time.LocalDateTime.now());
            activityLogRepository.save(log);
            return saved;
        }
        return null;
    }

    public void removeFromWishlist(String userEmail, Long productId) {
        wishlistItemRepository.deleteByUserEmailAndProductId(userEmail, productId);
    }
} 