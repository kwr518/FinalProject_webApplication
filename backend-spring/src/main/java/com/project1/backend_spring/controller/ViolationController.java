package com.project1.backend_spring.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import com.project1.backend_spring.dto.AnalysisResultDTO; 
import com.project1.backend_spring.dto.IncidentLogDTO;  
import com.project1.backend_spring.dto.ReportDTO;
import com.project1.backend_spring.mapper.UserMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ViolationController {

    @Autowired
    private UserMapper userMapper;

    private static final String PYTHON_BASE_URL = "http://192.168.0.40:8000";

    // 1. 영상 업로드
    @PostMapping("/upload-video")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📂 [Java] 영상 중계 시작: " + file.getOriginalFilename());
            String pythonUploadUrl = PYTHON_BASE_URL + "/upload-video";
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            restTemplate.postForObject(pythonUploadUrl, requestEntity, String.class);
            return ResponseEntity.ok("Uploaded to Python");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // 2. 결과 저장 (ID 파싱 및 위치정보 포함)
    @PostMapping("/violations")
    public ResponseEntity<String> saveViolation(@RequestBody IncidentLogDTO dto) {
        System.out.println("📹 저장 요청 수신: " + dto.getSerialNo());
        System.out.println("   - AI 초안: " + dto.getAiDraft()); // 로그 확인용

        try {
            Integer userId = null;
            // WEB_UPLOAD시 파일명에서 ID 추출 (새로고침 유지용)
            if ("WEB_UPLOAD".equals(dto.getSerialNo())) {
                try {
                    String url = dto.getVideoUrl();
                    if (url.contains("?")) url = url.split("\\?")[0];
                    String filename = url.substring(url.lastIndexOf("/") + 1);
                    if (filename.startsWith("user_")) {
                        userId = Integer.parseInt(filename.split("_")[1]);
                        System.out.println("✨ [ID 복구] " + userId);
                    }
                } catch (Exception e) {}
            }
            if (userId == null) userId = userMapper.findUserBySerialNo(dto.getSerialNo());
            if (userId == null) userId = 1;

            // ★ 수정됨: 파이썬이 보내준 dto를 그대로 DB에 저장 (더 이상 가공 필요 없음)
            // 만약 location이나 aiDraft가 null이면 기본값 처리만 살짝 해줌
            if (dto.getLocation() == null) dto.setLocation("위치 정보 없음");
            // aiDraft는 파이썬이 보내준 그대로 둠!

            userMapper.insertIncidentLog(dto);
            int logId = userMapper.getLastInsertId();
            
            // 신고 테이블에도 연결
            userMapper.insertReport(userId, logId, dto.getSerialNo(), dto.getAiDraft());
            
            return ResponseEntity.ok("Saved");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error");
        }
    }

    // 3. 조회
    @GetMapping("/my-reports")
    public ResponseEntity<List<ReportDTO>> getMyReports(@RequestParam int userId) {
        return ResponseEntity.ok(userMapper.findReportsByUserId(userId));
    }

    // 4. 삭제 (S3 + DB)
    @DeleteMapping("/reports/{id}")
    public ResponseEntity<String> deleteReport(@PathVariable int id) {
        System.out.println("🗑️ 삭제 요청: ID " + id);
        try {
            // S3 삭제 요청
            String videoUrl = userMapper.findVideoUrlByReportId(id);
            if (videoUrl != null && !videoUrl.isEmpty()) {
                try {
                    String pythonDeleteUrl = PYTHON_BASE_URL + "/api/delete-video";
                    RestTemplate restTemplate = new RestTemplate();
                    Map<String, String> body = new HashMap<>();
                    body.put("video_url", videoUrl);
                    restTemplate.postForObject(pythonDeleteUrl, body, String.class);
                } catch (Exception e) {
                    System.out.println("⚠️ S3 삭제 실패 (DB만 삭제 진행)");
                }
            }
            // DB 삭제
            userMapper.deleteReport(id);
            return ResponseEntity.ok("Deleted");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error");
        }
    }

    @PutMapping("/reports/{id}/submit")
    public ResponseEntity<String> submitReport(@PathVariable int id, @RequestBody ReportDTO dto) {
        dto.setReportId(id);
        userMapper.submitReport(dto);
        return ResponseEntity.ok("Submitted");
    }
    
    @PostMapping("/ask-chatbot")
    public Map<String, String> askChatbot(@RequestBody Map<String, String> request) { return new HashMap<>(); }
    @GetMapping("/logs")
    public List<Map<String, Object>> getLogs() { return new ArrayList<>(); }
}