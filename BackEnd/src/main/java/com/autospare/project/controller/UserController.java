package com.autospare.project.controller;

import com.autospare.project.model.User;
import com.autospare.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User loginUser(@RequestBody LoginRequest loginRequest) {
        return userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @GetMapping("/profile")
    public User getUserProfile(@RequestParam String email) {
        return userService.getUserByEmail(email);
    }

    @PutMapping("/profile")
    public User updateUserProfile(@RequestBody User user) {
        return userService.updateUserProfile(user);
    }

    @PutMapping("/profile-by-email")
    public User updateUserProfileByEmail(@RequestBody User user) {
        return userService.updateUserProfileByEmail(user);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    public static class LoginRequest {
        private String email;
        private String password;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
} 