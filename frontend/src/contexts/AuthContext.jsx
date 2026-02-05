import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 실행 시 로그인 상태 확인 (로컬스토리지 + 서버 세션 이중 체크)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // 1. 로컬 스토리지에서 사용자 정보 가져오기 (화면 깜빡임 방지용)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        // 2. 백엔드 서버에 진짜 세션이 살아있는지 확인 (보안용)
        // 주의: main.py 설정에 따라 주소가 /api/auth/check 또는 /auth/check 일 수 있음
        const res = await fetch('http://192.168.0.40:8000/api/auth/check', {
          credentials: 'include' // 세션 쿠키 전달 필수
        });
        
        if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              // 서버 세션이 유효하면 정보 동기화
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
              console.log("✅ 로그인 세션 확인 완료:", data.user.nickname);
            } else {
              // 서버 세션이 만료되었으면 로그아웃 처리
              if (savedUser) {
                  console.log("⚠️ 서버 세션 만료됨");
                  handleLocalLogout();
              }
            }
        }
      } catch (e) {
        console.error("세션 확인 중 에러 (비로그인 상태):", e);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 내부적으로 상태만 비우는 함수 (코드 중복 방지)
  const handleLocalLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // ★ 로그아웃 기능 (구글 + 카카오 + 서버 세션 모두 정리)
  const logout = async () => {
    try {
        console.log("🚪 로그아웃 시도...");

        // 1. 구글 소셜 로그아웃 (연결 해제)
        if (window.google?.accounts?.id) {
            window.google.accounts.id.revoke(user?.email, () => {
                console.log('Google account revoked');
            });
        }

        // 2. 백엔드 로그아웃 API 호출 (카카오 토큰 만료 및 세션 삭제)
        // 사용자님 auth.py에 정의된 주소: /auth/logout
        await fetch('http://192.168.0.40:8000/auth/logout', { 
            method: 'POST', 
            credentials: 'include' 
        });

    } catch (e) {
        console.error("로그아웃 서버 요청 실패 (무시하고 진행):", e);
    } finally {
        // 3. [핵심] 서버 응답과 상관없이 프론트엔드 상태 무조건 초기화
        // 이걸 해야 화면이 로그인 페이지로 넘어갑니다.
        handleLocalLogout();
        console.log("✅ 로그아웃 완료");
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};