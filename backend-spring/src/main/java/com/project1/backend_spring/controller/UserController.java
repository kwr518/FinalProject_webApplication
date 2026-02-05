package com.project1.backend_spring.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.project1.backend_spring.dto.UserDTO;
import com.project1.backend_spring.mapper.UserMapper;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    // 1. 유저 인증 (로그인/회원가입 동기화)
    @PostMapping("/user/sync") 
    public ResponseEntity<UserDTO> syncSocialUser(@RequestBody UserDTO requestUser) {
        System.out.println("📥 [Java] 로그인 요청 수신: " + requestUser.getLoginSocialId());
        
        try {
            // 이미 존재하는 유저인지 확인
            UserDTO existingUser = userMapper.findBySocialId(requestUser.getLoginSocialId());
            
            if (existingUser != null) {
                System.out.println("✅ 기존 유저 반환 (ID: " + existingUser.getHistoryId() + ")");
                return ResponseEntity.ok(existingUser);
            } else {
                // 신규 유저 저장
                // NULL 방지 (안전신문고 ID/PW는 비워둠)
                if (requestUser.getSafetyPortalId() == null) requestUser.setSafetyPortalId("");
                if (requestUser.getSafetyPortalPw() == null) requestUser.setSafetyPortalPw("");
                
                userMapper.insertUser(requestUser);
                System.out.println("✨ 신규 유저 저장 완료 (ID: " + requestUser.getHistoryId() + ")");
                
                return ResponseEntity.ok(requestUser);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // ❌ [삭제됨] 기기 등록 (DeviceController로 이동함)
    // ❌ [삭제됨] 내 기기 조회 (DeviceController로 이동함)

    // 4. 회원 탈퇴 (연쇄 삭제)
    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable int id) {
        System.out.println("🗑️ 회원 탈퇴 요청 (User ID: " + id + ")");
        try {
            userMapper.deleteReportByUserId(id);
            userMapper.deleteIncidentLogByUserId(id);
            userMapper.deleteDeviceByUserId(id);
            userMapper.deleteUser(id);
            return ResponseEntity.ok("Deleted");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error");
        }
    }
}