package com.btc.summarize_new.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.AuthResponse;
import com.btc.summarize_new.dto.LoginRequest;
import com.btc.summarize_new.dto.LogoutRequest;
import com.btc.summarize_new.dto.RefreshTokenRequest;
import com.btc.summarize_new.dto.RegisterRequest;
import com.btc.summarize_new.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
	private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    public String testAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return "OK";
    }
    
    @PostMapping("/refresh")
    public AuthResponse refresh(@RequestBody RefreshTokenRequest request) {
        return authService.refresh(request.getRefreshToken());
    }

	@PostMapping("/logout")
	public void logout(@RequestHeader("Authorization") String author, @RequestBody LogoutRequest logoutRequest) {
		String accessToken = author.substring(7);
		authService.logout(accessToken, logoutRequest.getRefreshToken());
	}
}
