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
    void insertUser(UserDTO userDTO);
    UserDTO findBySocialId(String loginSocialId);
    UserDTO findUserById(int historyId);
    List<UserDTO> findAllUsers();
    
    void insertDevice(DeviceDTO deviceDTO);
    List<DeviceDTO> findDevicesByUserId(int historyId);
    Integer findUserBySerialNo(String serialNo); 

    // 2. 사고 로그 및 신고 저장
    void insertIncidentLog(IncidentLogDTO dto);
    int getLastInsertId();
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
    void deleteReportByUserId(int historyId);
    void deleteIncidentLogByUserId(int historyId);
    void deleteDeviceByUserId(int historyId);
    void deleteUser(int historyId);
}