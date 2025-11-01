package com.wecaare.insurance.controller;

import com.wecaare.insurance.dto.ApiResponse;
import com.wecaare.insurance.dto.LoginRequest;
import com.wecaare.insurance.dto.LoginResponse;
import com.wecaare.insurance.dto.UserDTO;
import com.wecaare.insurance.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken() {
        UserDTO user = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Token is valid", user));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }
}

