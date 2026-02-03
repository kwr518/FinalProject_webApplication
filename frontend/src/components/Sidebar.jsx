import { Link, useLocation, useNavigate } from 'react-router-dom'; // ★ useNavigate 추가
import { useAuth } from '../contexts/AuthContext'; 

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate(); // ★ 선언
  const { user, logout } = useAuth(); 
  
  const menuItems = [
    { path: '/dashboard', label: '신고센터', icon: '🚨' },
    { path: '/support', label: '고객센터', icon: '💬' },
    { path: '/mypage', label: '마이페이지', icon: '👤' }
  ];

  // ★ 사이드바 로그아웃 함수
  const handleSidebarLogout = async () => {
    try {
        await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
    } catch(e) { 
        console.error(e); 
    } finally {
        logout();
        navigate('/login'); // 로그인 페이지로 강제 이동
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">🚦 AI 교통신고</h1>
        <p className="text-sm text-gray-400 mt-1">스마트 위반 감지 시스템</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'hover:bg-gray-800'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p>로그인 사용자: <span className="text-white font-bold">{user?.nickname || '사용자'}</span></p>
          
          {/* 로그아웃 버튼 연결 */}
          <button 
            onClick={handleSidebarLogout}
            className="mt-2 text-blue-400 hover:text-blue-300 w-full text-left"
          >
            로그아웃 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;