package com.project1.backend_spring.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.project1.backend_spring.dto.UserDTO;
import com.project1.backend_spring.dto.DeviceDTO;
import com.project1.backend_spring.dto.IncidentLogDTO;
import com.project1.backend_spring.dto.ReportDTO;
import java.util.List;

@Mapper
public interface UserMapper {
    

    // 1. 유저 및 기기 관리
    // UserDTO의 userName, userNumber DB에 저장
    void insertUser(UserDTO userDTO);   

    // loginSocialId로 UserdTO 정보를 찾아 반환
    UserDTO findBySocialId(String loginSocialId);   

    // historyId(pk)로 유저 찾기
    UserDTO findUserById(int historyId); 

    // 모든 유저 목록 List<DTO> 형태로 가져오기
    List<UserDTO> findAllUsers();   
    
    // 기기 정보 저장
    void insertDevice(DeviceDTO deviceDTO);     
    
    // 특정 유저(history_id)가 가진 기기 조회
    List<DeviceDTO> findDevicesByUserId(int historyId);     

    // 시리얼 번호로 기기 주인의 ID 찾기 
    Integer findUserBySerialNo(String serialNo);    

    // 2. 사고 로그 및 신고 저장
    // AI 분석결과 Incident_log 테이블에 저장
    void insertIncidentLog(IncidentLogDTO dto);

    // 저장된 행의 incident_log_id(pk) 가져오기
    int getLastInsertId();

    // report에 userId, logId, seralNo, aiDraft 넣기
    void insertReport(@Param("userId") int userId, 
                      @Param("logId") int logId, 
                      @Param("serialNo") String serialNo, 
                      @Param("aiDraft") String aiDraft);

    // 3. 신고 관리 및 상세 조회
    List<ReportDTO> findReportsByUserId(int userId);
    
    // 삭제 전 영상 URL 조회 (파일 삭제 연동용)
    String findVideoUrlByReportId(int reportId);
    
    // 신고 삭제 (연관된 로그 삭제는 DB에서 처리하거나 별도 로직 수행)
    void deleteReport(int reportId);
    
    // 최종 신고 제출 (상태 업데이트)
    void submitReport(ReportDTO reportDTO);

    // 4. 회원 탈퇴 시 일괄 삭제 처리
    // 각각의 태그와 1:1 매칭으로 처리
    void deleteReportByUserId(int historyId);   
    void deleteIncidentLogByUserId(int historyId);
    void deleteDeviceByUserId(int historyId);
    void deleteUser(int historyId);
    void deleteDevice(@Param("historyId") int historyId, @Param("serialNo") String serialNo);
}