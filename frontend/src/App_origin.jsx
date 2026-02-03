import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerService from './pages/CustomerService';
import Report from './pages/Report';
import ReportDetail from './pages/ReportDetail';
import About from './pages/About';
import Support from './pages/Support';
import BottomNav from './components/BottomNav';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // ★ 추가: 사용자 정보 저장용
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/check', {
          credentials: 'include' 
        });
        const data = await res.json();
        
        if (data.authenticated) {
          setIsLoggedIn(true);
          setUser(data.user); // ★ 추가: 서버에서 받은 사용자 정보 저장
          console.log("로그인 정보:", data.user);
        }
      } catch (e) {
        console.log("로그인 안 됨");
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>로딩중...</div>;
  }

  return (
    <Router>
      <div className="mobile-frame">
        <div className="notch">
            <span>9:41</span>
            <span style={{textAlign: 'right'}}>100%</span>
        </div>

        <div className="app-content">
          <Routes>
            <Route 
              path="/" 
              element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />} 
            />
            
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/report" element={isLoggedIn ? <Report /> : <Navigate to="/" />} />
            <Route path="/report/detail" element={isLoggedIn ? <ReportDetail /> : <Navigate to="/" />} />
            <Route path="/chatbot" element={isLoggedIn ? <CustomerService /> : <Navigate to="/" />} />
            <Route path="/about" element={isLoggedIn ? <About /> : <Navigate to="/" />} />
            
            {/* ★ 수정: user 정보를 Support 페이지로 전달 */}
            <Route path="/support" element={isLoggedIn ? <Support user={user} /> : <Navigate to="/" />} />
          </Routes>
        </div>

        {isLoggedIn && <BottomNav />}
      </div>
    </Router>
  );
}

export default App;