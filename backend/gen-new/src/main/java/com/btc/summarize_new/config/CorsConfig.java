package com.btc.summarize_new.config;



import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // SỬA Ở ĐÂY: Dùng Pattern thay vì Origins cứng nhắc.
        // Dấu "*" đại diện cho mọi domain (Ngrok, VS Code, Localhost...) bay vào đều nhận.
        config.setAllowedOriginPatterns(List.of("*")); 

        // 2. Cho phép các Method nào
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // 3. Cho phép các Header (Mở rộng thêm '*' để không bao giờ bị block header lạ khi dev)
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control", "*"));
        
        // 4. Cho phép gửi kèm Cookie/Authentication
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
