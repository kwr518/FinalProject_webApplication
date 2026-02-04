package com.project1.backend_spring.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data // ★ 중요: 복잡한 Getter/Setter를 자동으로 생성하여 에러를 방지합니다.
public class ReportDTO {
    private int reportId;       
    private int historyId;      
    private int incidentLog;    
    
    // 1. 신고 제출 시 입력받는 정보
    private String phoneNumber;   
    private String location;      
    private String description;   
    @JsonProperty("isAgreed")
    private boolean isAgreed;     
    
    @JsonProperty("isSubmitted")
    private boolean isSubmitted;
    // 2. IncidentLog 테이블과 JOIN하여 가져오는 데이터
    private String videoUrl;
    private String violationType; 
    private String plateNo;       
    private String incidentDate;  
    private String incidentTime;  
    private String serialNo;      
    
    // 3. AI 분석 관련 핵심 데이터
    private String aiDraft;
}