package com.project1.backend_spring.controller;

import com.project1.backend_spring.dto.DeviceDTO;
import com.project1.backend_spring.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/device")
@CrossOrigin(origins = "*") // CORS 허용
public class DeviceController {

    @Autowired
    private UserMapper userMapper;

    // 1. 기기 조회 (기존에 있던 것)
    @GetMapping("/{historyId}")
    public ResponseEntity<List<DeviceDTO>> getMyDevice(@PathVariable int historyId) {
        return ResponseEntity.ok(userMapper.findDevicesByUserId(historyId));
    }

    // 2. 기기 등록 (기존에 있던 것)
    @PostMapping("/register")
    public ResponseEntity<String> registerDevice(@RequestBody DeviceDTO dto) {
        try {
            // 중복 체크 로직 등이 필요하다면 추가
            userMapper.insertDevice(dto);
            return ResponseEntity.ok("Registered");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error");
        }
    }

    // ▼▼▼ [추가] 3. 기기 연동 해제 (삭제) ▼▼▼
    @DeleteMapping("/disconnect")
    public ResponseEntity<String> disconnectDevice(@RequestBody Map<String, Object> params) {
        try {
            int historyId = Integer.parseInt(params.get("historyId").toString());
            String serialNo = params.get("serialNo").toString();

            System.out.println("🔌 연동 해제 요청: " + serialNo + " (User: " + historyId + ")");
            userMapper.deleteDevice(historyId, serialNo);
            
            return ResponseEntity.ok("Disconnected");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error");
        }
    }
}