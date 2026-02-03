import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReportProvider } from './contexts/ReportContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// 페이지들 임포트
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerService from './pages/CustomerService';
import Report from './pages/Report';
import ReportDetail from './pages/ReportDetail';
import About from './pages/About';
import Support from './pages/Support';
import BottomNav from './components/BottomNav';
import './index.css';

// 내부 레이아웃 컴포넌트
function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>
        로딩중...
      </div>
    );
  }

  return (
    <div className="mobile-frame">
      {/* 상태바 레이아웃 (디자인) */}
      <div className="notch">
          <span>9:41</span>
          <span style={{textAlign: 'right'}}>100%</span>
      </div>

      <div className="app-content">
        <Routes>
          {/* 1. 로그인 및 초기 접속 설정 */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* 2. 보호된 라우트 (건우님 기능 + 새로운 UI) */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
          <Route path="/report/detail" element={<PrivateRoute><ReportDetail /></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><CustomerService /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><Support user={user} /></PrivateRoute>} />
          
          {/* 3. 예외 처리 */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>

      {/* 로그인 상태일 때만 하단 내비게이션 표시 */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
}

// 메인 App 컴포넌트
function App() {
  return (
    <AuthProvider>
      <ReportProvider> 
        {/* Router는 전체 앱에서 딱 하나만 있어야 합니다! */}
        <Router>
          <AppContent />
        </Router>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;