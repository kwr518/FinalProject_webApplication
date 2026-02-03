import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // 유저 정보 및 로그아웃 함수 가져오기

  // App.jsx 경로에 맞춘 메뉴 구성
  const menuItems = [
    { path: '/dashboard', label: '홈 / 대시보드', icon: '🏠' },
    { path: '/report', label: '신고 관리', icon: '🚨' },
    { path: '/chatbot', label: 'AI 법률 상담', icon: '💬' },
    { path: '/support', label: '마이페이지', icon: '👤' },
    { path: '/about', label: '서비스 정보', icon: 'ℹ️' }
  ];

  // 로그아웃 핸들러
  const handleSidebarLogout = async () => {
    try {
        await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
    } catch(e) { 
        console.error(e); 
    } finally {
        logout();
        navigate('/login'); // 로그인 페이지로 이동
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      {/* 헤더 영역 */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">🚦 Road Guardian</h1>
        <p className="text-sm text-gray-400 mt-1">AI 교통 법규 위반 신고</p>
      </div>
      
      {/* 메뉴 리스트 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-white text-gray-900 shadow-lg font-bold'
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 하단 유저 정보 및 로그아웃 */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-sm">
          <p className="text-gray-400 mb-1">로그인 사용자</p>
          <div className="font-bold text-lg text-white mb-3">
             {user ? `${user.nickname}님` : '게스트'}
          </div>
          
          <button 
            onClick={handleSidebarLogout}
            className="w-full text-left flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
          >
            <span>🚪</span> 로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;