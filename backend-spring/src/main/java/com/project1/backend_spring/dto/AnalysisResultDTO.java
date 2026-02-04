package com.project1.backend_spring.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data // ★ Lombok: 지루한 Getter/Setter 코드를 자동으로 생성해줍니다.
public class AnalysisResultDTO {
    
    // 1. 기기 시리얼 번호
    // 파이썬에서 "serial_no"로 보내주므로, 이 이름표(@JsonProperty)는 꼭 있어야 합니다.
    @JsonProperty("serial_no") 
    private String serialNo;
    
    // 2. 위반 결과
    private String result;     
    
    // 3. 차량 번호
    private String plate;      
    
    // 4. 위치 정보
    private String location;   
    
    // 5. 발생 시간
    private String time;       
    
    // 6. 영상 URL
    // 파이썬에서 "video_url"로 보내주므로, 이름표 유지 필수!
    @JsonProperty("video_url") 
    private String videoUrl;   
    
    // 7. AI 신뢰도/확률
    private double prob;       
}