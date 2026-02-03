package com.project1.backend_spring.dto;

public class IncidentLogDTO {
    private int incidentLog;        
    private String serialNo;        
    private String videoUrl;        
    private String incidentDate;    
    private String incidentTime;    
    private String violationType;   
    private String plateNo;         
    private String aiDraft;         
    private String location;        

    // Getters and Setters
    public int getIncidentLog() { return incidentLog; }
    public void setIncidentLog(int incidentLog) { this.incidentLog = incidentLog; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }

    public String getIncidentDate() { return incidentDate; }
    public void setIncidentDate(String incidentDate) { this.incidentDate = incidentDate; }

    public String getIncidentTime() { return incidentTime; }
    public void setIncidentTime(String incidentTime) { this.incidentTime = incidentTime; }

    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }

    public String getPlateNo() { return plateNo; }
    public void setPlateNo(String plateNo) { this.plateNo = plateNo; }

    public String getAiDraft() { return aiDraft; }
    public void setAiDraft(String aiDraft) { this.aiDraft = aiDraft; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}