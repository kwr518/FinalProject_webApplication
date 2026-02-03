package com.project1.backend_spring.dto;

public class DeviceDTO {
    private String serialNo; // PK (serial_no)
    private int historyId;   // FK (history_id)

    // Getters and Setters
    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public int getHistoryId() { return historyId; }
    public void setHistoryId(int historyId) { this.historyId = historyId; }
}