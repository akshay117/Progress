package com.wecaare.insurance.service;

import com.wecaare.insurance.dto.LoginRequest;
import com.wecaare.insurance.dto.LoginResponse;
import com.wecaare.insurance.dto.UserDTO;
import com.wecaare.insurance.model.User;
import com.wecaare.insurance.repository.UserRepository;
import com.wecaare.insurance.security.JwtTokenProvider;
import com.wecaare.insurance.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    
    public LoginResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        UserDTO userDTO = new UserDTO(userDetails.getId(), userDetails.getUsername(), userDetails.getRole());
        
        return new LoginResponse(jwt, userDTO);
    }
    
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return new UserDTO(userDetails.getId(), userDetails.getUsername(), userDetails.getRole());
        }
        throw new RuntimeException("User not authenticated");
    }
}

