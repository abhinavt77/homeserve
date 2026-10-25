package com.app.homeservice.service;

import com.app.homeservice.dto.AuthRequest;
import com.app.homeservice.dto.AuthResponse;
import com.app.homeservice.dto.RegisterRequest;
import com.app.homeservice.dto.UserResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    AuthResponse register(RegisterRequest request);
    UserResponse getCurrentUser(String email);
}
