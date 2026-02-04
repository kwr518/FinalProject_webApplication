package com.project1.backend_spring.dto;

import lombok.Data;

@Data // ★ 중요: Getter, Setter 등을 자동으로 생성하여 코드를 다이어트해줍니다.
public class IncidentLogDTO {
    private int incidentLog;      // 로그 식별자 (PK)
    private String serialNo;       // 기기 시리얼 번호
    private String videoUrl;       // 영상 저장 경로
    private String incidentDate;   // 발생 날짜
    private String incidentTime;   // 발생 시각
    private String violationType;  // 위반 종류 (예: 신호위반)
    private String plateNo;        // 차량 번호
    private String aiDraft;        // AI 분석 초안 내용
    private String location;       // 발생 장소/위치 정보
}