package com.project1.backend_spring.dto;

import lombok.Data;

@Data // ★ Lombok: Getter, Setter, toString, EqualsAndHashCode 등을 자동 생성합니다.
public class UserDTO {
    private int historyId;           // history_id (PK)
    private String userName;         // user_name (이름)
    private String userNumber;       // user_number (전화번호)
    private String email;            // email (이메일)
    private String loginSocialId;    // login_social_id (소셜 로그인 식별 ID)
    private String safetyPortalId;   // safety_portal_id (안전신문고 ID)
    private String safetyPortalPw;   // safety_portal_pw (안전신문고 PW)
}