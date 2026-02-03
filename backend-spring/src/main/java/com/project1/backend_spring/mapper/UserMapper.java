package com.project1.backend_spring.mapper;

import org.apache.ibatis.annotations.Mapper;
<<<<<<< HEAD
import org.apache.ibatis.annotations.Param;
import com.project1.backend_spring.dto.UserDTO;
import com.project1.backend_spring.dto.DeviceDTO;
import com.project1.backend_spring.dto.IncidentLogDTO; // ★ 변경: AnalysisResultDTO -> IncidentLogDTO
import com.project1.backend_spring.dto.ReportDTO;
=======
import com.project1.backend_spring.dto.UserDTO;
import com.project1.backend_spring.dto.DeviceDTO;
>>>>>>> ui-partner/main
import java.util.List;

@Mapper
public interface UserMapper {
<<<<<<< HEAD
    // 1. 유저/기기
    void insertUser(UserDTO userDTO);
    UserDTO findBySocialId(String loginSocialId);
    UserDTO findUserById(int historyId);
    List<UserDTO> findAllUsers();
    
    void insertDevice(DeviceDTO deviceDTO);
    List<DeviceDTO> findDevicesByUserId(int historyId);
    Integer findUserBySerialNo(String serialNo); 

    // 2. 로그 저장
    void insertIncidentLog(IncidentLogDTO dto);
    int getLastInsertId();
    void insertReport(@Param("userId") int userId, @Param("logId") int logId, 
                      @Param("serialNo") String serialNo, @Param("aiDraft") String aiDraft);

    // 3. 신고 관리
    List<ReportDTO> findReportsByUserId(int userId);
    
    // ★ [신규] 삭제 전 영상 URL 조회
    String findVideoUrlByReportId(int reportId);
    
    // ★ 삭제 (로그까지 함께 삭제됨)
    void deleteReport(int reportId);
    
    void submitReport(ReportDTO reportDTO);

    // 4. 탈퇴
    void deleteReportByUserId(int historyId);
    void deleteIncidentLogByUserId(int historyId);
    void deleteDeviceByUserId(int historyId);
    void deleteUser(int historyId);
=======
    // [User 테이블 관련]
    void insertUser(UserDTO userDTO);           // 회원가입
    List<UserDTO> findAllUsers();               // 회원 전체 조회
    UserDTO findUserById(int historyId);        // 특정 회원 조회 (PK로 검색)

    // [Device 테이블 관련]
    void insertDevice(DeviceDTO deviceDTO);             // 기기 등록
    List<DeviceDTO> findDevicesByUserId(int historyId); // 내 기기 목록 조회
>>>>>>> ui-partner/main
}