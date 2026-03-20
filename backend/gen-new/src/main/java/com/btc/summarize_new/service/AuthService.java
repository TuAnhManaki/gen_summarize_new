package com.btc.summarize_new.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.btc.summarize_new.dto.AuthResponse;
import com.btc.summarize_new.dto.LoginRequest;
import com.btc.summarize_new.dto.RegisterRequest;
import com.btc.summarize_new.dto.UserMeResponse;
import com.btc.summarize_new.model.RefreshToken;
import com.btc.summarize_new.model.RevokedToken;
import com.btc.summarize_new.model.User;
import com.btc.summarize_new.repository.RefreshTokenRepository;
import com.btc.summarize_new.repository.RevokedTokenRepository;
import com.btc.summarize_new.repository.UserRepository;
import com.btc.summarize_new.security.JwtUtil;

import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiresAt;
	
	private final UserRepository userRepository;
	private final RevokedTokenRepository revokedTokenRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final AuthenticationManager authenticationManager;

	public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        String accessToken = jwtUtil.generateToken(user);
        
        String refreshTokenStr = createAndSaveRefreshToken(user.getId());
        
        return new AuthResponse(accessToken, refreshTokenStr, user.getRole());
    }
	
	@Transactional 
	public AuthResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {  
	        throw new RuntimeException("Email " + request.getEmail() + " đã được sử dụng");
	    }

	    User user = new User();
	    user.setEmail(request.getEmail());
	    user.setFullName(request.getFullname());  
	    user.setPassword(passwordEncoder.encode(request.getPassword()));
	    user.setRole("USER"); 
	    user = userRepository.save(user);

	    String accessToken = jwtUtil.generateToken(user);
	    
	    String refreshTokenStr = createAndSaveRefreshToken(user.getId());
	    
	    return new AuthResponse(accessToken, refreshTokenStr, user.getRole());
	}
    
	private String createAndSaveRefreshToken(Long userId) {
	    RefreshToken refreshToken = new RefreshToken();
	    refreshToken.setToken(UUID.randomUUID().toString());
	    refreshToken.setUserId(userId);
	    refreshToken.setExpiresAt(Instant.now().plusMillis(refreshExpiresAt));
	    
	    refreshTokenRepository.save(refreshToken);
	    return refreshToken.getToken();
	}
	
    public void logout(String accessToken, String refreshTokenValue) {
    	// Neu token da revoke roi -> ignore
    	if(revokedTokenRepository.existsByToken(accessToken)) {
    		return;
    	}
    	
    	// Revoked refresh token
    	refreshTokenRepository.findByToken(refreshTokenValue)
        .ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    	
    	// Clear context hien tai
    	SecurityContextHolder.clearContext();
    	
    	Instant expiresAt = jwtUtil.getExpiration(accessToken);
    	RevokedToken revoked = new RevokedToken();
    	revoked.setToken(accessToken);
    	revoked.setExpiresAt(expiresAt);
    	revokedTokenRepository.save(revoked);
    }
    
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }
    
	public AuthResponse refresh(String refreshTokenValue) {

		RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
				.orElseThrow(() -> new RuntimeException("Invalid refresh token"));

		if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
			throw new RuntimeException("Refresh token expired");
		}

		User user = userRepository.findById(refreshToken.getUserId())
				.orElseThrow(() -> new RuntimeException("User not found"));

		String newAccessToken = jwtUtil.generateToken(user);

		return new AuthResponse(newAccessToken, refreshTokenValue, user.getRole());
	}
	
	@Transactional
	public void logoutAllDevices(String accessToken) {
		Claims claims = jwtUtil.parseToken(accessToken);
		Long userId = Long.valueOf(claims.getSubject());
		
		refreshTokenRepository.revokeAllByUserId(userId);
	}
	
	public UserMeResponse me(String token) {
		Claims claims = jwtUtil.parseToken(token);
		Long userId = Long.valueOf(claims.getSubject());

		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

		return new UserMeResponse(user.getId(), user.getEmail(), user.getRole());
	}
}
