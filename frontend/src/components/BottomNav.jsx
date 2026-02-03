import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 활성화된 탭인지 확인하는 함수
  const isActive = (path) => {
    // /dashboard가 기본 홈이므로, 루트(/)일 때도 홈 버튼 활성화
    if (path === '/dashboard' && location.pathname === '/') return 'active';
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="bottom-nav">
      {/* 1. 홈 (대시보드) */}
      <div className={`nav-item ${isActive('/dashboard')}`} onClick={() => navigate('/dashboard')}>
        <div className="nav-icon">🏠</div>
        <span>홈</span>
      </div>
      
      {/* 2. 신고 관리 */}
      <div className={`nav-item ${isActive('/report')}`} onClick={() => navigate('/report')}>
        <div className="nav-icon">📋</div>
        <span>신고</span>
      </div>
      
      {/* 3. AI 상담 */}
      <div className={`nav-item ${isActive('/chatbot')}`} onClick={() => navigate('/chatbot')}>
        <div className="nav-icon">💬</div>
        <span>상담</span>
      </div>

      {/* 4. 서비스 정보 */}
      <div className={`nav-item ${isActive('/about')}`} onClick={() => navigate('/about')}>
        <div className="nav-icon">ℹ️</div>
        <span>정보</span>
      </div>

      {/* 5. 마이페이지 (Support) */}
      <div className={`nav-item ${isActive('/support')}`} onClick={() => navigate('/support')}>
        <div className="nav-icon">👤</div>
        <span>마이</span>
      </div>
    </div>
  );
};

export default BottomNav;