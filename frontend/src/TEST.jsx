import React, { useState, useEffect } from 'react';
import './AiMonitor.css'; // 위에서 만든 CSS 임포트

const AiMonitor = () => {
  const [logs, setLogs] = useState([]);
  
  // 1. 데이터 가져오기 함수 (FastAPI 연동)
  const fetchLogs = async () => {
    try {
      // Python 서버 주소 (ngrok 주소 혹은 192.168.0.40)
      const response = await fetch('http://192.168.0.40:8000/logs'); 
      const data = await response.json();
      
      // 최신순으로 정렬 (필요시)
      // data.logs가 배열이라고 가정
      setLogs(data.logs || []);
    } catch (error) {
      console.error("로그를 가져오는데 실패했습니다:", error);
    }
  };

  // 2. 3초마다 자동 갱신 (Polling)
  useEffect(() => {
    fetchLogs(); // 최초 실행
    const interval = setInterval(fetchLogs, 3000); // 3초 주기
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 해제
  }, []);

  // 3. 클립보드 복사 기능
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("📝 신고 초안이 복사되었습니다!");
    });
  };

  return (
    <div className="monitor-container">
      {/* 상단 헤더 */}
      <header className="app-header">
        <div className="logo-area">
          <span>🛡️</span> Road Guardian
        </div>
        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
          Live
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="content-area">
        <div className="section-title">
          <span>🚨</span> 실시간 위반 감지 로그
        </div>

        {/* 로그 리스트 출력 */}
        {logs.length === 0 ? (
          <div style={{textAlign:'center', padding:'40px', color:'#9CA3AF'}}>
            데이터 수신 대기 중...
          </div>
        ) : (
          logs.map((log, index) => (
            <div className="report-card" key={index}>
              
              {/* 카드 헤더: 위반항목 & 시간 */}
              <div className="card-header">
                <span className="badge">{log.violation_type || '위반 감지'}</span>
                <span className="timestamp">{log.timestamp || '시간 정보 없음'}</span>
              </div>

              {/* 비디오 영역 */}
              {log.video_url && (
                <div className="video-wrapper">
                  <video controls muted autoPlay loop>
                    {/* Python 서버에서 비디오 파일 서빙 */}
                    <source src={`http://192.168.0.40:8000${log.video_url}`} type="video/mp4" />
                  </video>
                </div>
              )}

              {/* 위치 정보 */}
              <div style={{marginBottom: '10px', fontSize:'0.9rem', color:'#4B5563'}}>
                📍 위치: {log.location || '관제 구역 A-1'}
              </div>

              {/* AI 신고서 초안 */}
              <div className="ai-draft-box">
                <div className="draft-title">🤖 AI 자동 생성 신고 초안</div>
                <div className="draft-content">
                  {log.report_draft || '분석 중이거나 초안 생성 실패...'}
                </div>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(log.report_draft)}
                >
                  초안 복사하기
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 하단 네비게이션 (모양만 구현) */}
      <nav className="bottom-nav">
        <div className="nav-item active">🏠</div>
        <div className="nav-item">📋</div>
        <div className="nav-item">🔔</div>
        <div className="nav-item">👤</div>
      </nav>
    </div>
  );
};

export default AiMonitor;