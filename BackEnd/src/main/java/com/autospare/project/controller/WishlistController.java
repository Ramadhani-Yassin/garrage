package com.autospare.project.controller;

import com.autospare.project.model.WishlistItem;
import com.autospare.project.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/{email}")
    public List<WishlistItem> getWishlist(@PathVariable String email) {
        return wishlistService.getWishlist(email);
    }

    @PostMapping("/add")
    public WishlistItem addToWishlist(@RequestParam String email, @RequestParam Long productId, @RequestParam String productName) {
        return wishlistService.addToWishlist(email, productId, productName);
    }

    @PostMapping("/remove")
    public void removeFromWishlist(@RequestParam String email, @RequestParam Long productId) {
        wishlistService.removeFromWishlist(email, productId);
    }
} 