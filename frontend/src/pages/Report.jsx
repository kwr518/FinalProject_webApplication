import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Report = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('myReports');
    const parsed = saved ? JSON.parse(saved) : [];
    // 처리 중이던 건 오류로 처리 (새로고침 대응)
    return parsed.map(item => {
        if (item.status === 'processing') {
            return {
                ...item,
                status: 'error',
                progressMsg: '분석 중단됨 (재시도 필요)',
                title: '분석 취소됨'
            };
        }
        return item;
    });
  });

  useEffect(() => {
    localStorage.setItem('myReports', JSON.stringify(reports));
  }, [reports]);

  // ★ [핵심] S3 삭제 + 목록 삭제 함수
  const deleteReport = async (e, id, filename) => {
    e.stopPropagation(); 
    
    if (window.confirm('이 신고 내역을 삭제하시겠습니까?\n(서버의 영상 파일도 함께 삭제됩니다)')) {
      
      // 1. 만약 파일명이 있다면 서버에 삭제 요청 (분석 완료된 건)
      if (filename) {
          try {
              await fetch(`http://localhost:8000/api/delete-video?filename=${filename}`, {
                  method: 'DELETE',
                  credentials: 'include' // 로그인 정보 전송
              });
              console.log("서버 파일 삭제 요청 완료");
          } catch (err) {
              console.error("서버 파일 삭제 중 오류 (무시하고 목록 삭제 진행):", err);
          }
      }

      // 2. 화면 목록에서 삭제
      setReports(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateItemStatus = (id, newStatus, message, finalData = null) => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          progressMsg: message,
          ...finalData
        };
      }
      return item;
    }));
  };

  const processVideoAnalysis = async (id, file) => {
    updateItemStatus(id, 'processing', 'AI가 영상을 정밀 분석 중입니다...');

    try {
      const formData = new FormData();
      formData.append("file", file);

      // ★ [확인] 주소와 옵션이 제대로 되어있는지 확인
      const res = await fetch('http://localhost:8000/api/analyze-direct', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        const violationTitle = data.result ? data.result.split('(')[0].trim() : '위반 감지';

        setReports(prev => prev.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    status: 'complete',
                    title: violationTitle,
                    plate: data.plate || '식별불가',
                    date: data.time,
                    time: data.time,
                    desc: data.result,
                    videoSrc: URL.createObjectURL(file),
                    // ★ [중요] 삭제를 위해 파일명을 여기에 저장해둡니다!
                    filename: file.name 
                };
            }
            return item;
        }));
        
      } else {
        throw new Error("서버 에러 응답");
      }

    } catch (error) {
      console.error("분석 실패:", error);
      updateItemStatus(id, 'error', '서버 연결 실패');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newId = Date.now();
    
    const newReport = {
      id: newId,
      title: '영상 분석 중...',
      date: new Date().toLocaleString(),
      plate: '-',
      status: 'processing', 
      progressMsg: '서버 연결 대기 중...',
      videoSrc: null,
      filename: file.name // 초기 생성 시에도 파일명 저장
    };

    setReports([newReport, ...reports]); 
    processVideoAnalysis(newId, file);
    
    e.target.value = ''; 
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>신고 관리</h1>
        <p>내 신고 목록</p>
      </div>

      <div 
        style={{ 
            padding: '24px', 
            background: '#F8FAFC', 
            borderRadius: '16px', 
            margin: '16px', 
            border: '2px dashed #CBD5E1', 
            cursor: 'pointer', 
            textAlign: 'center',
            transition: 'all 0.2s ease'
        }} 
        onClick={handleUploadClick}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = '#CBD5E1'}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
        <div style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
            신고 자동 작성
        </div>
        <div style={{ fontSize: '13px', color: '#64748B' }}>
            영상을 업로드하면 AI가 분석하여 신고서를 작성합니다.
        </div>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />

      <div className="report-list">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="report-item" 
            onClick={() => report.status === 'complete' && navigate('/report/detail', {state: report})}
            style={{ 
                opacity: report.status === 'processing' ? 0.9 : 1,
                border: report.status === 'processing' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                background: report.status === 'processing' ? '#EFF6FF' : 'white',
                transition: 'all 0.3s ease',
                cursor: report.status === 'complete' ? 'pointer' : 'default',
                padding: '16px',
                margin: '0 16px 12px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
              <div className="report-thumbnail" style={{ 
                  width: '48px', height: '48px', 
                  borderRadius: '8px', 
                  background: report.status === 'processing' ? 'white' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px'
              }}>
                {report.status === 'processing' ? (
                    <div className="spinner"></div>
                ) : report.status === 'error' ? (
                    '⚠️'
                ) : (
                    '📸'
                )}
              </div>

              <div className="report-info" style={{ flex: 1 }}>
                  <div className="report-title" style={{ 
                      fontWeight: 'bold', 
                      fontSize: '15px',
                      color: report.status === 'processing' ? '#2563EB' : '#1E293B',
                      marginBottom: '4px'
                  }}>
                      {report.title}
                  </div>
                  
                  {report.status === 'processing' ? (
                    <div style={{ fontSize: '12px', color: '#3B82F6', fontWeight: '500' }}>
                        {report.progressMsg}
                    </div>
                  ) : report.status === 'error' ? (
                    <div style={{ fontSize: '12px', color: '#EF4444' }}>
                        {report.progressMsg}
                    </div>
                  ) : (
                    <div className="report-meta" style={{ fontSize: '12px', color: '#64748B' }}>
                        {report.date} | {report.plate}
                    </div>
                  )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {/* ★ 삭제 버튼: 클릭 시 파일명(report.filename)을 함께 넘김 */}
                  <div 
                    onClick={(e) => deleteReport(e, report.id, report.filename)}
                    style={{ 
                        cursor: 'pointer', 
                        color: '#94A3B8', 
                        fontSize: '14px',
                        padding: '4px'
                    }}
                    title="삭제"
                  >
                    ✖
                  </div>

                  {report.status === 'complete' && (
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', background: '#DCFCE7', color: '#166534', fontWeight: '600' }}>
                        완료
                    </span>
                  )}
                  {report.status === 'submitted' && (
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', background: '#DBEAFE', color: '#1E40AF', fontWeight: '600' }}>
                        제출됨
                    </span>
                  )}
                  {report.status === 'error' && (
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontWeight: '600' }}>
                        오류
                    </span>
                  )}
              </div>
          </div>
        ))}
      </div>

      <style>{`
        .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid #E2E8F0;
            border-top: 3px solid #3B82F6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

export default Report;