import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 로그인한 유저 정보

  // 1. 상태 관리: 통계 수치 (초기값 0)
  const [stats, setStats] = useState({
    total: 0,      // 신고 접수
    completed: 0,  // 처리 완료
    ongoing: 0,    // 진행 중
    score: 0       // 안전 점수
  });

  // 2. 날짜 및 인사말 계산 함수
  const getCurrentDate = () => {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '좋은 아침입니다';
    if (hour < 18) return '좋은 오후입니다';
    return '좋은 저녁입니다';
  };

  // 3. 데이터 로드 (실제 DB 연동)
  useEffect(() => {
    if (!user || !user.history_id) return;

    const fetchMyStats = async () => {
      try {
        // 자바 서버에서 내 신고 내역 가져오기
        const res = await fetch(`http://localhost:8080/api/my-reports?userId=${user.history_id}`);
        if (res.ok) {
          const reports = await res.json();
          
          const totalCount = reports.length;
          // isSubmitted가 true인 것만 '완료'로 간주 (혹은 status 체크)
          const completedCount = reports.filter(r => r.isSubmitted || r.status === 'submitted' || r.status === 'complete').length;
          const ongoingCount = totalCount - completedCount;
          const safetyScore = completedCount * 10; // 점수 계산 로직

          setStats({
            total: totalCount,
            completed: completedCount,
            ongoing: ongoingCount,
            score: safetyScore
          });
        }
      } catch (e) {
        console.error("대시보드 데이터 로드 실패:", e);
      }
    };

    fetchMyStats();
    // 데이터 갱신 (3초마다)
    const interval = setInterval(fetchMyStats, 3000);
    return () => clearInterval(interval);

  }, [user]);

  return (
    <div className="screen active">
      {/* 헤더: 시간별 인사 + 날짜 */}
      <div className="header">
        <h1>{getGreeting()} <span style={{fontSize:'0.8em', opacity:0.9}}>👋</span></h1>
        <p>{getCurrentDate()}</p>
        {user && <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>{user.nickname}님의 활동 현황</p>}
      </div>

      {/* 통계 요약 카드 (그라데이션 배경) */}
      <div className="stats-container" style={{ padding: '24px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', margin: '20px', borderRadius: '24px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {/* 총 신고 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563EB', marginBottom: '4px' }}>
                {stats.total}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#60A5FA' }}>신고 접수</div>
          </div>
          
          {/* 구분선 */}
          <div style={{ width: '1px', height: '40px', background: 'rgba(37, 99, 235, 0.1)' }}></div>

          {/* 완료 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#10B981', marginBottom: '4px' }}>
                {stats.completed}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#34D399' }}>처리 완료</div>
          </div>

          {/* 구분선 */}
          <div style={{ width: '1px', height: '40px', background: 'rgba(37, 99, 235, 0.1)' }}></div>

          {/* 점수 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#8B5CF6', marginBottom: '4px' }}>
                {stats.score}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#A78BFA' }}>안전 점수</div>
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 (2열 그리드) */}
      <div style={{ padding: '0 20px', paddingBottom: '80px' }}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>빠른 메뉴</h3>
        
        <div className="quick-menu-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          
          {/* 1. 신고 작성 */}
          <div className="menu-card quick-box" onClick={() => navigate('/report')} style={{ margin: 0, flexDirection: 'column', alignItems: 'flex-start', padding: '20px', height: 'auto', gap: '12px' }}>
            <div className="menu-icon blue" style={{ width: '48px', height: '48px', fontSize: '24px' }}>📝</div>
            <div className="menu-content">
              <div className="menu-title" style={{ fontSize: '16px' }}>신고 작성</div>
              <div className="menu-desc">AI 자동 작성</div>
            </div>
          </div>

          {/* 2. 법률 상담 */}
          <div className="menu-card quick-box" onClick={() => navigate('/chatbot')} style={{ margin: 0, flexDirection: 'column', alignItems: 'flex-start', padding: '20px', height: 'auto', gap: '12px' }}>
            <div className="menu-icon green" style={{ width: '48px', height: '48px', fontSize: '24px' }}>💬</div>
            <div className="menu-content">
              <div className="menu-title" style={{ fontSize: '16px' }}>법률 상담</div>
              <div className="menu-desc">AI 챗봇 대화</div>
            </div>
          </div>

          {/* 3. 신고 기록 (목록으로 이동) */}
          <div className="menu-card quick-box" onClick={() => navigate('/report')} style={{ margin: 0, flexDirection: 'column', alignItems: 'flex-start', padding: '20px', height: 'auto', gap: '12px' }}>
            <div className="menu-icon orange" style={{ width: '48px', height: '48px', fontSize: '24px' }}>📋</div>
            <div className="menu-content">
              <div className="menu-title" style={{ fontSize: '16px' }}>신고 기록</div>
              <div className="menu-desc">이력 조회</div>
            </div>
          </div>

          {/* 4. 마이페이지 (기기 설정 등) */}
          <div className="menu-card quick-box" onClick={() => navigate('/support')} style={{ margin: 0, flexDirection: 'column', alignItems: 'flex-start', padding: '20px', height: 'auto', gap: '12px' }}>
            <div className="menu-icon red" style={{ width: '48px', height: '48px', fontSize: '24px' }}>👤</div>
            <div className="menu-content">
              <div className="menu-title" style={{ fontSize: '16px' }}>마이페이지</div>
              <div className="menu-desc">설정 관리</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;