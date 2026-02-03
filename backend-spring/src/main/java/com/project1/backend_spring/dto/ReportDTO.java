package com.project1.backend_spring.dto;

public class ReportDTO {
    private int reportId;       
    private int historyId;      
    private int incidentLog;    
    
    // 신고 제출 시 입력받을 정보
    private String phoneNumber;   
    private String location;      // incident_log의 location을 담을 수도 있고, report의 location일 수도 있음
    private String description;   
    private boolean isAgreed;     
    private boolean isSubmitted;  

    // IncidentLog 테이블에서 JOIN으로 가져올 데이터
    private String videoUrl;
    private String violationType; // 위반 내용 (ex: 중앙선침범)
    private String plateNo;       // 차량 번호
    private String incidentDate;  // 날짜
    private String incidentTime;  // 시간
    private String serialNo;      // 기기 번호
    
    // ★ [핵심] AI 분석 결과 및 위치 정보
    private String aiDraft;
    
    // ==========================================
    // Getters and Setters
    // ==========================================
    public int getReportId() { return reportId; }
    public void setReportId(int reportId) { this.reportId = reportId; }

    public int getHistoryId() { return historyId; }
    public void setHistoryId(int historyId) { this.historyId = historyId; }

    public int getIncidentLog() { return incidentLog; }
    public void setIncidentLog(int incidentLog) { this.incidentLog = incidentLog; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean getIsAgreed() { return isAgreed; }
    public void setIsAgreed(boolean isAgreed) { this.isAgreed = isAgreed; }

    public boolean getIsSubmitted() { return isSubmitted; }
    public void setIsSubmitted(boolean isSubmitted) { this.isSubmitted = isSubmitted; }
    public void setSubmitted(boolean submitted) { this.isSubmitted = submitted; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }

    public String getPlateNo() { return plateNo; }
    public void setPlateNo(String plateNo) { this.plateNo = plateNo; }

    public String getIncidentDate() { return incidentDate; }
    public void setIncidentDate(String incidentDate) { this.incidentDate = incidentDate; }

    public String getIncidentTime() { return incidentTime; }
    public void setIncidentTime(String incidentTime) { this.incidentTime = incidentTime; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getAiDraft() { return aiDraft; }
    public void setAiDraft(String aiDraft) { this.aiDraft = aiDraft; }
}