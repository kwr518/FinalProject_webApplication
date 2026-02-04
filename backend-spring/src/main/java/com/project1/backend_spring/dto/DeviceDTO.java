package com.project1.backend_spring.dto;

import lombok.Data;

@Data // ★ 중요: Getter, Setter, toString 등을 자동으로 생성해줍니다.
public class DeviceDTO {
    // DB의 auto_increment 기본키와 매칭됩니다.
    private int deviceId; 
    
    // 기기 고유 시리얼 번호
    private String serialNo; 
    
    // 사용자 식별 ID (외래키)
    private int historyId; 
}