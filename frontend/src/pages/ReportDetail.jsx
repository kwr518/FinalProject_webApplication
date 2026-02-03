import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ReportDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 목록에서 넘어온 데이터 (DB 데이터 포함)
  const { videoFile, videoSrc, reportId, ...prevData } = location.state || {};
  
  // 결과 데이터 상태
  const [resultData, setResultData] = useState(prevData.plate ? prevData : null);
  // 상세 내용 (AI 초안 또는 사용자 수정본)
  const [detailContent, setDetailContent] = useState(''); 
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressLogs, setProgressLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const addLog = useCallback((message) => {
    setProgressLogs(prev => [...prev, message]);
  }, []);

  // 목록 업데이트 (로컬 스토리지 동기화)
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
            // 상세 정보 업데이트
            incidentDate: finalData.incidentDate,
            incidentTime: finalData.incidentTime,
            location: finalData.location,
            plate: finalData.plate,
            detailContent: finalData.detailContent // 수정된 내용 저장
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
      const timer4 = setTimeout(() => addLog("📝 LLM이 신고 초안을 작성하는 중..."), 7000);

      const res = await fetch('http://localhost:8000/api/analyze-video', {
        method: 'POST',
        body: formData
      });

      clearTimeout(timer1); clearTimeout(timer2); 
      clearTimeout(timer3); clearTimeout(timer4);

      if (res.ok) {
        const data = await res.json();
        addLog("✅ 분석 완료!");
        
        // 시간 파싱 (YYYY-MM-DD HH:MM:SS 형식 가정)
        const rawTime = data.time || "";
        const [datePart, timePart] = rawTime.includes(' ') ? rawTime.split(' ') : [new Date().toISOString().split('T')[0], "00:00:00"];

        // AI 리포트 내용 가져오기
        const aiGeneratedDraft = data.ai_report || `[AI 자동 생성 초안]
위반 내용: ${data.result || '위반 감지'}
차량 번호: ${data.plate || '식별불가'}

상세 내용:
위 차량이 교통법규를 위반하는 장면이 확인되었습니다.`;

        const finalResult = {
            plate: data.plate || "식별불가",
            incidentDate: datePart,
            incidentTime: timePart,
            location: "위치 정보 없음", // 추후 GPS 연동 가능
            desc: data.result || "위반 사항이 감지되지 않았습니다.",
            violation: data.result ? data.result.split('(')[0].trim() : "위반 감지",
            detailContent: aiGeneratedDraft
        };
        
        setResultData(finalResult);
        setDetailContent(aiGeneratedDraft);
        updateReportList(finalResult, 'complete');
        
      } else {
        throw new Error("분석 실패");
      }

    } catch (error) {
      console.error(error);
      addLog("❌ 분석 실패 또는 네트워크 오류");
      
      const errorResult = {
          plate: "식별불가",
          incidentDate: new Date().toISOString().split('T')[0],
          incidentTime: "00:00:00",
          desc: "서버 연결 실패",
          violation: "분석 실패",
          detailContent: "네트워크 오류로 인해 초안을 생성할 수 없습니다. 수동으로 작성해주세요."
      };
      setResultData(errorResult);
      setDetailContent(errorResult.detailContent);
      updateReportList(errorResult, 'complete');
      
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoFile, addLog, updateReportList]);

  // 자동 실행 (처음 진입 시)
  useEffect(() => {
    if (videoFile && !resultData && !isAnalyzing) {
      startAnalysis();
    }
  }, [videoFile, resultData, isAnalyzing, startAnalysis]);

  // 기존 데이터 로드 (상세 내용이 있다면)
  useEffect(() => {
    if (prevData && prevData.detailContent) {
      setDetailContent(prevData.detailContent);
    }
  }, [prevData]);

  // 최종 제출 핸들러
  const handleSubmit = () => {
    if (resultData) {
        const updatedData = {
          ...resultData,
          detailContent: detailContent
        };
        updateReportList(updatedData, 'submitted'); 
    }
    alert('신고가 안전신문고 양식으로 제출되었습니다.');
    setShowModal(false);
    navigate('/report');
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>📄 신고 상세</h1>
        <p>AI 분석 리포트</p>
      </div>

      <div className="report-list">
        {/* 영상 영역 */}
        <div style={{ padding: '0' }}>
          {videoSrc ? (
            <video 
              src={videoSrc} 
              width="100%" 
              height="220" 
              controls 
              style={{ 
                background: 'var(--bg-dark)', 
                borderRadius: 'var(--radius-lg)', 
                margin: '20px', 
                width: 'calc(100% - 40px)',
                display: 'block',
                boxShadow: 'var(--shadow-md)'
              }}
            ></video>
          ) : (
            <div style={{ 
              padding: '40px', 
              textAlign: 'center', 
              background: 'var(--bg-tertiary)', 
              margin:'20px', 
              borderRadius:'var(--radius-lg)',
              border: '2px dashed var(--border-medium)'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  분석 영상 없음
                </div>
            </div>
          )}
        </div>

        {/* 분석 로그 (분석 중일 때만 표시) */}
        {isAnalyzing && (
            <div style={{ 
              margin: '0 20px 20px 20px', 
              padding: '20px', 
              background: 'var(--bg-dark)', 
              borderRadius: 'var(--radius-lg)', 
              fontFamily: 'monospace', 
              fontSize: '13px', 
              color: 'var(--success-green)', 
              height: '160px', 
              overflowY: 'auto',
              boxShadow: 'var(--shadow-md)'
            }}>
                {progressLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '6px', lineHeight: '1.6' }}>&gt; {log}</div>
                ))}
                <div className="blink-cursor">_</div>
            </div>
        )}

        {/* 결과 표시 영역 (분석 완료 시) */}
        {!isAnalyzing && resultData && (
            <>
                <div style={{ padding: '0 20px' }}>
                  {/* 위반 내용 카드 */}
                  <div style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>위반 내용</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{resultData.desc}</div>
                  </div>

                  {/* 차량 번호 카드 */}
                  <div style={{ padding: '20px', marginBottom: '16px', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase' }}>차량 번호</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '2px' }}>{resultData.plate}</div>
                  </div>

                  {/* 일시 및 장소 (2열 배치) */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>위반 일자</div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{resultData.incidentDate}</div>
                    </div>
                    <div style={{ flex: 1, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>위반 시각</div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{resultData.incidentTime}</div>
                    </div>
                  </div>

                  {/* 상세 내용 (초안 작성) - 수정 가능 */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>상세 내용 (AI 초안)</span>
                        <span style={{ fontSize: '10px', background: 'var(--warning-light)', color: 'var(--warning-orange)', padding: '2px 8px', borderRadius: '99px', fontWeight: '700' }}>수정 가능</span>
                    </div>
                    <textarea
                      value={detailContent}
                      onChange={(e) => setDetailContent(e.target.value)}
                      style={{ 
                        width: '100%',
                        minHeight: '200px',
                        padding: '16px', 
                        background: 'var(--bg-primary)', 
                        borderRadius: 'var(--radius-lg)', 
                        fontSize: '14px', 
                        lineHeight: '1.6', 
                        color: 'var(--text-primary)',
                        border: '2px solid var(--border-light)',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      placeholder="상세 내용을 입력하세요..."
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>
                      💡 Tip: AI가 생성한 초안을 자유롭게 수정하여 신고서를 완성하세요.
                    </div>
                  </div>

                  <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ width: '100%', margin: '0 0 12px 0' }}>
                    신고 제출하기
                  </button>
                </div>
            </>
        )}
        
        <div style={{ padding: '0 20px 20px 20px' }}>
          <button 
            className="btn" 
            style={{ 
              background: 'var(--bg-tertiary)', 
              color: 'var(--text-primary)', 
              width: '100%', 
              margin: 0,
              border: '1px solid var(--border-light)'
            }} 
            onClick={() => navigate('/report')}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>

      {/* 제출 확인 모달 */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-title">✅ 제출 확인</div>
            <div className="modal-desc">
              작성된 내용으로 신고를 접수하시겠습니까?<br/>
              제출 후에는 수정이 불가능합니다.
            </div>
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