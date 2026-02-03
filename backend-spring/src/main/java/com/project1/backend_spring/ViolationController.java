package com.project1.backend_spring;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;

import com.project1.backend_spring.dto.ViolationRequest;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ViolationController {

    private static final String PYTHON_BASE_URL = "http://localhost:8000";

    // 1. 영상 업로드 및 파이썬 중계 로직 (추가됨)
    @PostMapping("/upload-video")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📂 자바 서버 영상 수신: " + file.getOriginalFilename());

            // 파이썬 서버의 업로드 엔드포인트 주소
            String pythonUploadUrl = PYTHON_BASE_URL + "/upload-video";
            
            RestTemplate restTemplate = new RestTemplate();
            
            // Multipart 요청을 위한 헤더 및 바디 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource()); // 파일을 그대로 파이썬으로 전달
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // 파이썬으로 영상 전송
            restTemplate.postForObject(pythonUploadUrl, requestEntity, String.class);
            
            System.out.println("🚀 파이썬 서버로 영상 전달 성공!");

            // 업로드 완료 후 메인 화면(/)으로 리다이렉트
            return ResponseEntity.status(HttpStatus.FOUND)
                                 .header(HttpHeaders.LOCATION, "/")
                                 .build();
                                 
        } catch (Exception e) {
            System.err.println("❌ 업로드 중계 에러: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("업로드 실패: " + e.getMessage());
        }
    }

    // 2. 파이썬(YOLO) 분석 결과 수신 (기존 유지)
    @PostMapping("/violations")
    public ResponseEntity<String> receiveViolation(@RequestBody ViolationRequest data) {
        System.out.println("\n=======================================");
        System.out.println("🚦 [AI 분석 결과 수신]");
        System.out.println("위반종류: " + data.getResult());
        System.out.println("차량번호: " + data.getPlate());
        System.out.println("감지시간: " + data.getTime());
        System.out.println("감지위치: " + data.getLocation());
        System.out.println("=======================================");
        return ResponseEntity.ok("OK");
    }

    // 3. 브라우저 챗봇 질문 중계 (기존 유지)
    @PostMapping("/ask-chatbot")
    public Map<String, String> askChatbot(@RequestBody Map<String, String> request) {
        Map<String, String> result = new HashMap<>();
        try {
            String targetUrl = PYTHON_BASE_URL + "/api/ask"; 
            RestTemplate restTemplate = new RestTemplate();
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(targetUrl, request, Map.class);
            
            if (response != null && response.containsKey("answer")) {
                result.put("answer", response.get("answer").toString());
            } else {
                result.put("answer", "AI 답변 생성 중 오류가 발생했습니다.");
            }
        } catch (Exception e) {
            System.err.println("❌ 챗봇 중계 에러: " + e.getMessage());
            result.put("answer", "파이썬 서버 연결 실패: " + e.getMessage());
        }
        return result;
    }

    // 4. 위반 로그 리스트 중계 (기존 유지)
    @GetMapping("/logs")
    public List<Map<String, Object>> getLogs() {
        try {
            String targetUrl = PYTHON_BASE_URL + "/api/logs";
            RestTemplate restTemplate = new RestTemplate();
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> logs = restTemplate.getForObject(targetUrl, List.class);
            return logs != null ? logs : new ArrayList<>();
        } catch (Exception e) {
            System.err.println("❌ 로그 중계 에러: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // 5. 파이썬 답변 동기화 (기존 유지)
    @PostMapping("/chatbot-response")
    public String receiveChatbot(@RequestBody Map<String, String> data) {
        System.out.println("💬 [AI 답변 수신 성공]: " + data.get("answer"));
        return "OK";
    }
}