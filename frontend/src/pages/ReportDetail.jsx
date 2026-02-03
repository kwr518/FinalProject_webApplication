import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 목록에서 넘어온 데이터 (DB 데이터 포함)
  const { videoFile, videoSrc, reportId, ...prevData } = location.state || {};
  
  const [resultData, setResultData] = useState(prevData.plate ? prevData : null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addLog = useCallback((message) => {
    setProgressLogs(prev => [...prev, message]);
  }, []);

  // 목록 업데이트 (로컬 스토리지/전역 상태 동기화용)
  const updateReportList = useCallback((finalData, newStatus = 'complete') => {
    if (!reportId) return;

    const saved = localStorage.getItem('myReports');
    if (saved) {
      const list = JSON.parse(saved);
      const newList = list.map(item => {
        if (item.id === reportId) {
          return {
            ...item,
            ...finalData,
            title: finalData.violation || item.title,
            status: newStatus,
            date: finalData.date || item.date,
            plate: finalData.plate || item.plate,
            // ★ 상세 정보 업데이트
            incidentDate: finalData.incidentDate,
            incidentTime: finalData.incidentTime,
            aiDraft: finalData.aiDraft,
            location: finalData.location // ★ 위치 정보 저장
          };
        }
        return item;
      });
      localStorage.setItem('myReports', JSON.stringify(newList));
    }
  }, [reportId]);

  // 영상 분석 로직 (새 영상 업로드 시)
  const startAnalysis = useCallback(async () => {
    if (!videoFile) return;

    setIsAnalyzing(true);
    addLog("📡 서버 연결 중...");
    
    try {
      const formData = new FormData();
      formData.append("file", videoFile);

      addLog("📤 영상 업로드 및 분석 요청...");
      
      const timer1 = setTimeout(() => addLog("👀 AI가 영상을 프레임 단위로 쪼개는 중..."), 1500);
      const timer2 = setTimeout(() => addLog("🚗 차량 및 번호판 인식 시도 중..."), 3500);
      const timer3 = setTimeout(() => addLog("⚖️ 도로교통법 위반 여부 판단 중..."), 5500);

      const res = await fetch('http://localhost:8000/api/analyze-video', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);

      if (res.ok) {
        const data = await res.json();
        addLog("✅ 분석 완료!");
        
        // 시간 파싱 (YYYY-MM-DD HH:MM:SS 형식 가정)
        const rawTime = data.time || "";
        const [datePart, timePart] = rawTime.split(' ');

        const finalResult = {
            plate: data.plate || "식별불가",
            // ★ 날짜/시간 분리 저장
            incidentDate: datePart || new Date().toISOString().split('T')[0],
            incidentTime: timePart || new Date().toTimeString().split(' ')[0],
            
            desc: data.result || "위반 사항이 감지되지 않았습니다.",
            violation: data.result ? data.result.split('(')[0].trim() : "위반 감지",
            
            // ★ AI 초안 및 위치 (새 분석 시 기본값)
            aiDraft: "",
            location: "위치 정보 없음" 
        };
        
        setResultData(finalResult);
        updateReportList(finalResult, 'complete');
        
      } else {
        addLog("❌ 분석 실패");
        const mockResult = {
            plate: "식별불가",
            incidentDate: new Date().toISOString().split('T')[0],
            incidentTime: "00:00:00",
            desc: "서버 연결 실패. (네트워크 오류)",
            violation: "분석 실패",
            aiDraft: "",
            location: "-"
        };
        setResultData(mockResult);
        updateReportList(mockResult, 'complete');
      }

    } catch (error) {
      console.error(error);
      addLog("❌ 네트워크 에러");
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoFile, addLog, updateReportList]);

  // 자동 실행
  useEffect(() => {
    if (videoFile && !resultData && !isAnalyzing) {
      startAnalysis();
    }
  }, [videoFile, resultData, isAnalyzing, startAnalysis]);

  const handleSubmit = () => {
    // 실제 제출 로직
    if (resultData) {
        updateReportList(resultData, 'submitted'); 
    }
    alert('보고서 작성 페이지로 이동합니다. (구현 예정)');
    setShowModal(false);
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>신고 상세</h1>
        <p>AI 분석 리포트</p>
      </div>

      <div className="report-list">
        {/* 영상 영역 */}
        <div style={{ padding: '0' }}>
          {videoSrc ? (
            <video 
              src={videoSrc} 
              width="100%" 
              height="200" 
              controls 
              style={{ background: 'black', borderRadius: '12px', margin: '16px 0', display: 'block' }}
            ></video>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', background: '#f1f5f9', margin:'16px', borderRadius:'12px', color:'#64748B' }}>
                📸 분석 이미지/영상 없음
            </div>
          )}
        </div>

        {/* 분석 로그 */}
        {isAnalyzing && (
            <div style={{ margin: '0 16px 16px 16px', padding: '16px', background: '#1E293B', borderRadius: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#10B981', height: '120px', overflowY: 'auto' }}>
                {progressLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>&gt; {log}</div>
                ))}
                <div className="blink-cursor">_</div>
            </div>
        )}

        {/* 결과 표시 영역 */}
        {!isAnalyzing && resultData && (
            <>
                <div style={{ padding: '0 16px 16px 16px' }}>
                  {/* 위반 내용 */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>위반 내용</div>
                    <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '14px', fontWeight:'bold', color: 'var(--text-primary)' }}>
                      {resultData.desc}
                    </div>
                  </div>

                  {/* ★ [추가] 위반 장소 (위반 내용과 차량 번호 사이) */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>위반 장소</div>
                    <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {resultData.location || "위치 정보 없음"}
                    </div>
                  </div>

                  {/* 차량 번호 */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>차량 번호</div>
                    <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {resultData.plate}
                    </div>
                  </div>

                  {/* 신고 일자/시각 분리 표시 */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>신고 일자</div>
                        <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                            {resultData.incidentDate || "날짜 정보 없음"}
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>신고 시각</div>
                        <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                            {resultData.incidentTime || "시간 정보 없음"}
                        </div>
                    </div>
                  </div>

                  {/* AI 분석 초안 */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px', display:'flex', justifyContent:'space-between' }}>
                        <span>AI 분석 초안</span>
                        <span style={{ fontSize: '11px', color:'#3B82F6' }}>자동 생성됨 ✨</span>
                    </div>
                    <div style={{ padding: '12px', background: '#F0F9FF', border:'1px solid #BAE6FD', borderRadius: '12px', fontSize: '13px', lineHeight: '1.6', color: '#0369A1', whiteSpace: 'pre-wrap' }}>
                      {resultData.aiDraft ? resultData.aiDraft : "(AI가 생성한 초안 내용이 없습니다.)"}
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    보고서 작성
                  </button>
                </div>
            </>
        )}
        
        <div style={{ padding: '0 16px 16px 16px' }}>
            <button className="btn" style={{ background: 'var(--bg-gray)', color: 'var(--text-primary)', width: '100%' }} onClick={() => navigate('/report')}>
                뒤로
            </button>
        </div>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-title">보고서 작성</div>
            <div className="modal-desc">이 내용으로 신고 보고서를 작성하시겠습니까?</div>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowModal(false)}>취소</button>
              <button className="modal-btn modal-btn-confirm" onClick={handleSubmit}>확인</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.blink-cursor { animation: blink 1s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

export default ReportDetail;