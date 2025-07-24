package com.autospare.project.controller;

import com.autospare.project.model.Cart;
import com.autospare.project.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping("/{email}")
    public Cart getCart(@PathVariable String email) {
        return cartService.getCartByUserEmail(email);
    }

    @PostMapping("/{email}/add")
    public Cart addToCart(@PathVariable String email, @RequestParam Long productId, @RequestParam int quantity) {
        return cartService.addToCart(email, productId, quantity);
    }

    @PostMapping("/{email}/update")
    public Cart updateCartItem(@PathVariable String email, @RequestParam Long productId, @RequestParam int quantity) {
        return cartService.updateCartItem(email, productId, quantity);
    }

    @PostMapping("/{email}/remove")
    public Cart removeCartItem(@PathVariable String email, @RequestParam Long productId) {
        return cartService.removeCartItem(email, productId);
    }

    @PostMapping("/{email}/clear")
    public Cart clearCart(@PathVariable String email) {
        return cartService.clearCart(email);
    }

    @PostMapping("/{email}/checkout")
    public void checkout(@PathVariable String email) {
        cartService.checkout(email);
    }
} 