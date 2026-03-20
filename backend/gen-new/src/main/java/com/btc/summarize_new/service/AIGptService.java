package com.btc.summarize_new.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import java.util.*;

@Service
@Slf4j
public class AIGptService {

    @Value("${openai.api-key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String summarize(String content) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // Cấu trúc Prompt tối ưu cho tin tức
            String prompt = "Bạn là một biên tập viên tin tức chuyên nghiệp. " +
                            "Hãy tóm tắt bài báo sau đây thành 3-4 câu ngắn gọn, súc tích bằng tiếng Việt. " +
                            "Giữ nguyên các con số và sự kiện quan trọng.\n\nNội dung bài báo:\n" + content;

            // Tạo Body cho request (Dùng Map để Jackson tự chuyển sang JSON)
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Gửi request
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            
            // Bóc tách kết quả từ cấu trúc trả về của OpenAI
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            
            return (String) message.get("content");

        } catch (Exception e) {
            log.error("Lỗi khi gọi OpenAI API: {}", e.getMessage());
            return null;
        }
    }
}
