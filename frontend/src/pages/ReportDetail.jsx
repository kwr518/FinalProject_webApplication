import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 목록(Report.jsx)에서 넘겨준 데이터 받기
  const { videoFile, videoSrc, reportId, ...prevData } = location.state || {};
  
  const [resultData, setResultData] = useState(prevData.plate ? prevData : null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addLog = useCallback((message) => {
    setProgressLogs(prev => [...prev, message]);
  }, []);

  // 목록 업데이트 (로컬 스토리지)
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
            // 서버에서 받은 시간(time)을 목록에도 저장
            date: finalData.time || item.date,
            plate: finalData.plate || item.plate
          };
        }
        return item;
      });
      localStorage.setItem('myReports', JSON.stringify(newList));
    }
  }, [reportId]);

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

      // 👇 [수정됨] 주소 변경(/api/analyze-direct) 및 credentials 옵션 추가
      const res = await fetch('http://localhost:8000/api/analyze-direct', {
        method: 'POST',
        body: formData,
        credentials: 'include' // 👈 ★ 핵심: 이게 있어야 로그인 ID가 파이썬 서버로 전달됨
      });

      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);

      if (res.ok) {
        const data = await res.json();
        addLog("✅ 분석 완료!");
        
        // ★ [핵심] 서버 응답값 매핑
        const finalResult = {
            // 서버는 'plate'로 줌
            plate: data.plate || "식별불가",
            
            // 서버는 'time'으로 줌 ("2026-01-30 14:54:56")
            time: data.time || new Date().toLocaleString(), 
            
            // 서버는 'result'에 "중앙선침범 (car)" 처럼 줌 -> 이걸 desc에 넣음
            desc: data.result || "위반 사항이 감지되지 않았습니다.",
            
            // 제목용으로 앞글자만 따기 ("중앙선침범"만 추출)
            violation: data.result ? data.result.split('(')[0].trim() : "위반 감지"
        };
        
        setResultData(finalResult);
        updateReportList(finalResult, 'complete');
        
      } else {
        addLog("❌ 분석 실패");
        const mockResult = {
            plate: "식별불가",
            time: new Date().toLocaleString(),
            desc: "서버 연결 실패. (네트워크 오류)",
            violation: "분석 실패"
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
    if (resultData) {
        updateReportList(resultData, 'submitted'); 
    }
    alert('신고가 안전신문고 양식으로 제출되었습니다.');
    setShowModal(false);
    navigate('/report');
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>신고 상세</h1>
        <p>AI 분석 리포트</p>
      </div>

      <div className="report-list">
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
            <div style={{ padding: '20px', textAlign: 'center', background: '#f1f5f9', margin:'16px', borderRadius:'12px' }}>
                📸 분석 이미지
            </div>
          )}
        </div>

        {isAnalyzing && (
            <div style={{ margin: '0 16px 16px 16px', padding: '16px', background: '#1E293B', borderRadius: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#10B981', height: '120px', overflowY: 'auto' }}>
                {progressLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>&gt; {log}</div>
                ))}
                <div className="blink-cursor">_</div>
            </div>
        )}

        {!isAnalyzing && resultData && (
            <>
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>위반 내용</div>
                  {/* data.result 값이 여기에 들어감 */}
                  <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)' }}>{resultData.desc}</div>
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>차량 번호</div>
                  <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>{resultData.plate}</div>
                </div>

                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>신고 일시</div>
                  {/* data.time 값이 여기에 들어감 */}
                  <div style={{ padding: '12px', background: 'var(--bg-gray)', borderRadius: '12px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    {resultData.time}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => setShowModal(true)}>신고 제출</button>
            </>
        )}
        
        <button className="btn" style={{ background: 'var(--bg-gray)', color: 'var(--text-primary)', width: 'calc(100% - 32px)' }} onClick={() => navigate('/report')}>뒤로</button>
      </div>

      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-title">제출 확인</div>
            <div className="modal-desc">해당 내용으로 신고를 접수하시겠습니까?</div>
            <div className="modal-buttons">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowModal(false)}>취소</button>
              <button className="modal-btn modal-btn-confirm" onClick={handleSubmit}>제출</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.blink-cursor { animation: blink 1s step-end infinite; } @keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
};

export default ReportDetail;