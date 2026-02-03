package com.project1.backend_spring.dto;

<<<<<<< HEAD
public class UserDTO {
    private int historyId;          // PK
    private String userName;        // 이름
    private String email;           // 이메일
    private String loginSocialId;   // 소셜 ID (여기에 kakao_12345 들어감)
    private String safetyPortalId;  // 안전신문고 ID
    private String safetyPortalPw;  // 안전신문고 PW

    // Getters and Setters
    public int getHistoryId() { return historyId; }
    public void setHistoryId(int historyId) { this.historyId = historyId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLoginSocialId() { return loginSocialId; }
    public void setLoginSocialId(String loginSocialId) { this.loginSocialId = loginSocialId; }

    public String getSafetyPortalId() { return safetyPortalId; }
    public void setSafetyPortalId(String safetyPortalId) { this.safetyPortalId = safetyPortalId; }

    public String getSafetyPortalPw() { return safetyPortalPw; }
    public void setSafetyPortalPw(String safetyPortalPw) { this.safetyPortalPw = safetyPortalPw; }
=======
import lombok.Data; // Lombok 사용 시

@Data
public class UserDTO {
    private int historyId;        // DB의 history_id
    private String userName;      // DB의 user_name
    private String userNumber;    // DB의 user_number
    private String email;
    private String loginSocialId; // DB의 login_social_id
    private String safetyPortalId;// DB의 safety_portal_id
    private String safetyPortalPw;// DB의 safety_portal_pw
>>>>>>> ui-partner/main
}