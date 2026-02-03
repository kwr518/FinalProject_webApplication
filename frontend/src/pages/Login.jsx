import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 1. 카카오 로그인 핸들러 (기존 유지)
  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8000/auth/kakao/login';
  };

  // 2. 구글 로그인 콜백 핸들러 (기존 유지)
  const handleGoogleCallback = async (response) => {
    try {
      console.log("구글 토큰 수신:", response.credential);

      const res = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
        credentials: 'include' 
      });

      if (res.ok) {
        const data = await res.json();
        login(data.user);
        navigate('/dashboard');
      } else {
        alert("구글 로그인 실패 (서버 응답 오류)");
      }
    } catch (e) {
      console.error("구글 로그인 에러:", e);
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  // 3. 구글 버튼 렌더링 (스크립트 로드)
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: "121207632304-46j66kom4rbshbe11dgelog8ge9b4f4p.apps.googleusercontent.com", 
          callback: handleGoogleCallback
        });

        // 상대방 디자인에 맞춘 구글 버튼 스타일링
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInDiv'),
          { 
            theme: 'outline', 
            size: 'large', 
            width: '100%', 
            text: 'continue_with',
            shape: 'pill' // 둥근 버튼 (디자인 통일)
          }
        );
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  // 4. 통합된 UI 렌더링 (상대방 디자인 적용)
  return (
    <div className="login-screen">
      <div className="login-container">
        
        {/* 헤더 (로고 영역) */}
        <div className="login-header">
          <div className="login-icon">🚗</div>
          <h1 className="login-title">Road Guardian</h1>
          <p className="login-subtitle">
            도로교통법 전문 AI 챗봇<br/>
            당신의 스마트한 교통안전 파트너
          </p>
        </div>

        {/* 로그인 버튼 영역 */}
        <div className="login-buttons">
          {/* 카카오 버튼 */}
          <button className="login-btn kakao-login-btn" onClick={handleKakaoLogin}>
            <span className="btn-icon">💬</span>
            <span>카카오로 계속하기</span>
          </button>

          {/* 구글 버튼 (스크립트가 여기에 렌더링) */}
          <div id="googleSignInDiv" style={{ width: '100%', marginTop: '4px' }}></div>
        </div>

        {/* 푸터 영역 (보안 배지 등) */}
        <div className="login-footer">
          <div className="security-badge">
            <span className="security-badge-dot"></span>
            <span>안전한 보안 연결</span>
          </div>
          <div className="login-footer-text" style={{ marginTop: '16px' }}>
            로그인하시면 <span className="login-footer-highlight">신고 관리</span>와<br/>
            <span className="login-footer-highlight">AI 법률 상담</span>을 이용하실 수 있습니다.
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;