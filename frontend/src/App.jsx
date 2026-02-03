import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReportProvider } from './contexts/ReportContext'; // ★ 추가
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

// 내부 컴포넌트
function AppContent() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>로딩중...</div>;
  }

  return (
    <div className="mobile-frame">
      <div className="notch">
          <span>9:41</span>
          <span style={{textAlign: 'right'}}>100%</span>
      </div>

      <div className="app-content">
        <Routes>
          {/* 1. 로그인 페이지 (/login) 명시적으로 지정 */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
          />
          
          {/* 2. 루트 접속 시: 로그인 안됐으면 /login으로 보냄 */}
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
          
          {/* 3. 보호된 라우트들 */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
          <Route path="/report/detail" element={<PrivateRoute><ReportDetail /></PrivateRoute>} />
          <Route path="/chatbot" element={<PrivateRoute><CustomerService /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><Support user={user} /></PrivateRoute>} />
          
          {/* 4. 없는 주소는 대시보드로 */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>

      {isAuthenticated && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReportProvider> {/* ★ AuthProvider 안에, Router 밖에 추가 */}
        <Router>
          <AppContent />
        </Router>
      </ReportProvider>
    </AuthProvider>
  );
}

export default App;