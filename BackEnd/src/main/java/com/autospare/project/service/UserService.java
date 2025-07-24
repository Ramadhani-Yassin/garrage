package com.autospare.project.service;

import com.autospare.project.model.User;
import com.autospare.project.repository.UserRepository;
import com.autospare.project.repository.ActivityLogRepository;
import com.autospare.project.model.ActivityLog;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityLogRepository activityLogRepository;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User saved = userRepository.save(user);
        // Log activity
        ActivityLog log = new ActivityLog();
        log.setType("user");
        log.setDescription("New user registered: " + user.getEmail());
        log.setTimestamp(java.time.LocalDateTime.now());
        activityLogRepository.save(log);
        return saved;
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email);
        if (user == null || !user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid email or password");
        }
        return user;
    }

    public User getUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserProfile(User user) {
        User existing = userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        existing.setFullName(user.getFullName());
        existing.setEmail(user.getEmail());
        existing.setRegion(user.getRegion());
        // Only update password if provided (optional)
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(user.getPassword());
        }
        // Optionally update role if needed
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }
        return userRepository.save(existing);
    }

    public User updateUserProfileByEmail(User user) {
        User existing = userRepository.findByEmail(user.getEmail());
        if (existing == null) throw new RuntimeException("User not found");
        existing.setFullName(user.getFullName());
        existing.setRegion(user.getRegion());
        // Optionally update other fields as needed
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(user.getPassword());
        }
        if (user.getRole() != null) {
            existing.setRole(user.getRole());
        }
        return userRepository.save(existing);
    }
} 