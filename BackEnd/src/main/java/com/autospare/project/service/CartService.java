package com.autospare.project.service;

import com.autospare.project.model.Cart;
import com.autospare.project.model.CartItem;
import com.autospare.project.model.Product;
import com.autospare.project.repository.CartRepository;
import com.autospare.project.repository.CartItemRepository;
import com.autospare.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    @Autowired
    private CartItemRepository cartItemRepository;
    @Autowired
    private ProductRepository productRepository;

    public Cart getCartByUserEmail(String userEmail) {
        return cartRepository.findByUserEmail(userEmail).orElseGet(() -> {
            Cart cart = new Cart();
            cart.setUserEmail(userEmail);
            cart.setItems(new ArrayList<>());
            return cartRepository.save(cart);
        });
    }

    @Transactional
    public Cart addToCart(String userEmail, Long productId, int quantity) {
        Cart cart = getCartByUserEmail(userEmail);
        Product product = productRepository.findById(productId).orElseThrow();
        // Check if item already in cart
        CartItem existing = cart.getItems().stream()
            .filter(item -> item.getProduct().getId().equals(productId))
            .findFirst().orElse(null);
        if (existing != null) {
            existing.setQuantity(existing.getQuantity() + quantity);
            existing.setPrice(product.getPrice());
            cartItemRepository.save(existing);
        } else {
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setQuantity(quantity);
            item.setPrice(product.getPrice());
            cart.getItems().add(item);
        }
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItem(String userEmail, Long productId, int quantity) {
        Cart cart = getCartByUserEmail(userEmail);
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
                break;
            }
        }
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeCartItem(String userEmail, Long productId) {
        Cart cart = getCartByUserEmail(userEmail);
        cart.getItems().removeIf(item -> item.getProduct().getId().equals(productId));
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart clearCart(String userEmail) {
        Cart cart = getCartByUserEmail(userEmail);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }

    // Checkout: convert cart to order (not implemented here, just clear cart)
    @Transactional
    public void checkout(String userEmail) {
        clearCart(userEmail);

    }
} 