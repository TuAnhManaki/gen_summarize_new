package com.btc.summarize_new.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;
import java.util.*;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class GeminiService {

    @Value("${google.gemini.api.key}")
    private String apiKey;

    @Value("${google.gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String summarize(String content) {
        try {
            // 1. Cấu hình URL kèm API Key
            String urlWithKey = apiUrl + "?key=" + apiKey;
         // Đảm bảo không có khoảng trắng thừa
            log.debug("Calling URL: {}", urlWithKey); // In ra để kiểm tra xem có đúng định dạng không
            // 2. Tạo Header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 3. Tạo Prompt
//            String prompt = "Bạn là chuyên gia tóm tắt tin tức. Hãy tóm tắt bài báo sau thành 3-5 câu súc tích, " +
//                            "giữ lại các ý chính và số liệu. Ngôn ngữ: Tiếng Việt.\n\nNội dung:\n" + content;
//            String prompt = "Bạn là chuyên gia biên tập tin tức. Hãy tóm tắt bài báo sau đây. " +
//                    "Yêu cầu trả về định dạng HTML để hiển thị trên website như sau:\n" +
//                    "- Sử dụng thẻ <p> cho các đoạn văn.\n" +
//                    "- Sử dụng thẻ <ul> và <li> cho các ý chính.\n" +
//                    "- Sử dụng thẻ <strong> cho các từ khóa hoặc con số quan trọng.\n" +
//                    "- Không bao gồm thẻ <html> hay <body>, chỉ lấy nội dung bên trong.\n\n" +
//                    "Nội dung bài báo:\n" + content;
            
            String prompt = "Bạn là biên tập viên tin tức. Hãy thực hiện 2 nhiệm vụ sau:\n" +
                    "1. Tóm tắt bài báo thành HTML (p, ul, li, strong).\n" +
                    "2. Phân loại bài báo vào một trong các nhãn sau: [Thời sự, Công nghệ, Thể thao, Kinh doanh, Giải trí].\n" +
                    "Trả về định dạng JSON: {\"summary\": \"...\", \"category\": \"...\"}\n\n" +
                    "Nội dung: " + content;
            
            // 4. Cấu trúc Payload của Gemini (Khác với OpenAI)
            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> contents = Map.of("contents", List.of(parts));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

            // 5. Gửi Request
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithKey, entity, Map.class);

            // 6. Bóc tách kết quả (Cấu trúc của Gemini khá sâu)
            // candidates[0] -> content -> parts[0] -> text
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> resContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> resParts = (List<Map<String, Object>>) resContent.get("parts");
            
            return (String) resParts.get(0).get("text");

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API: {}", e.getMessage());
            return null;
        }
    }
}