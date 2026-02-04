package com.project1.backend_spring.dto;

import lombok.Data;

@Data // ★ 중요: Getter/Setter 자동 생성으로 컴파일 에러를 원천 차단합니다.
public class UserDTO {
    private int historyId;           // PK (사용자 고유 번호)
    private String loginSocialId;    // 소셜 로그인 ID (예: kakao_12345)
    private String nickname;         // 사용자 닉네임 (화면 표시용)
    private String profileImage;     // 프로필 이미지 URL
    private String email;            // 사용자 이메일
    
    // 안전신문고 연동 정보 (필요 시 사용)
    private String safetyPortalId;   
    private String safetyPortalPw;   
    
    // 기존에 쓰던 필드와 호환성을 위해 추가 (선택 사항)
    private String userName;         
}