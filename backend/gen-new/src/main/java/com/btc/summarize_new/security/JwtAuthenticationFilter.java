package com.btc.summarize_new.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.btc.summarize_new.repository.RevokedTokenRepository;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtUtil jwtUtil;
    private final RevokedTokenRepository revokedTokenRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        // 1. Lấy Token từ Header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Khách vãng lai: cho đi tiếp để vào API Public (permitAll)
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        try {
            // 2. Kiểm tra Token đã Logout (Revoked) chưa
            if (revokedTokenRepository.existsByToken(token)) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_REVOKED", "Token has been revoked");
                return;
            }

            // 3. Kiểm tra tính hợp lệ và Extract Claims
            // Lưu ý: jwtUtil.getClaims(token) thường sẽ ném ExpiredJwtException nếu hết hạn
            Claims claims = jwtUtil.getClaims(token);
            String userId = claims.getSubject();
            String role = claims.get("role", String.class);

            if (userId != null && role != null) {
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())
                );
                UsernamePasswordAuthenticationToken auth = 
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);
                
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // QUAN TRỌNG: Bắt lỗi hết hạn và trả về 401 ngay lập tức
            // Điều này kích hoạt handle401Error trong HttpErrorInterceptor của Angular
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "TOKEN_EXPIRED", "Session expired, please refresh token");
            return; 
        } catch (Exception e) {
            // Các lỗi khác (token sai, định dạng hỏng)
            SecurityContextHolder.clearContext();
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "INVALID_TOKEN", "Invalid token provided");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Hàm hỗ trợ ghi response JSON lỗi đồng nhất
     */
    private void sendErrorResponse(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        String json = String.format("{\"error\": \"%s\", \"message\": \"%s\"}", code, message);
        response.getWriter().write(json);
    }
      
}
