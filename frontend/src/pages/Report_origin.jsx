import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useReport } from '../contexts/ReportContext';

const Report = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { reports, uploadVideo, removeReport } = useReport();
  
  // [추가] 기기 저장 관련 상태
  const [myDevice, setMyDevice] = useState(null);
  const [saveToDevice, setSaveToDevice] = useState(false);
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // [추가] 내 기기 정보 조회 로직
  useEffect(() => {
    if (!user || !user.history_id) return;
    const fetchMyDevice = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/device/${user.history_id}`);
        if (res.ok) {
          const devices = await res.json();
          if (devices && devices.length > 0) {
            setMyDevice(devices[0]);
            setSaveToDevice(true); 
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchMyDevice();
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까? (복구 불가)')) {
      await removeReport(id);
      if (selectedReportId === id) setSelectedReportId(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // [수정] 업로드 시 옵션 전달
    uploadVideo(file, saveToDevice, myDevice);
    e.target.value = ''; 
  };

  const handleReportClick = (report) => {
    if (report.status === 'processing' || report.status === 'error') return;
    if (isDesktop) {
      setSelectedReportId(report.id);
    } else {
      navigate('/report/detail', { state: report });
    }
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // PC용 상세 카드 (원본 유지 + 영상 연결 수정)
  const ReportDetailCard = ({ report, onClose }) => {
    const [detailContent, setDetailContent] = useState(report.detailContent || report.aiDraft || '');
    // [수정] 영상 연결
    const videoSource = report.videoSrc || report.video_url;

    const handleSubmit = () => {
      alert('신고가 안전신문고 양식으로 제출되었습니다.');
      onClose();
    };

    return (
      <div style={{ height: '100%', overflowY: 'auto', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>📄 신고 상세</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✖</button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {videoSource ? (
            <video 
                src={videoSource} 
                width="100%" 
                controls 
                style={{ background: 'black', borderRadius: '12px', marginBottom: '20px', display: 'block', maxHeight: '300px' }} 
            />
          ) : (
            <div style={{ padding:'40px', textAlign:'center', background:'#f8fafc', borderRadius:'12px', marginBottom:'20px', border:'1px dashed #ccc' }}>영상 없음</div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>위반 내용</div>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>{report.title}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>차량 번호</div>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>{report.plate}</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>위반 일자</div>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '14px' }}>{report.incidentDate || report.date}</div>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>위반 시각</div>
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '14px' }}>{report.incidentTime}</div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>상세 내용</div>
             <textarea value={detailContent} onChange={(e) => setDetailContent(e.target.value)} style={{ width: '100%', minHeight: '150px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', resize: 'vertical' }} />
          </div>

          <button onClick={handleSubmit} className="btn btn-primary" style={{ width: '100%', margin: 0 }}>신고 제출하기</button>
        </div>
      </div>
    );
  };

  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* 왼쪽: 신고 목록 영역 */}
      <div style={{ width: isDesktop ? (selectedReportId ? '40%' : '100%') : '100%', display: 'flex', flexDirection: 'column', height: '100%', borderRight: isDesktop ? '1px solid var(--border-light)' : 'none', transition: 'width 0.3s ease' }}>
        
        <div className="header">
          <h1>📝 신고 관리</h1>
          <p>{user ? `${user.nickname}님의 신고 이력` : '로딩 중...'}</p>
        </div>

        {/* 업로드 버튼 */}
        <div onClick={() => fileInputRef.current.click()} style={{ padding: '24px', background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', borderRadius: '16px', margin: '20px', border: '2px dashed var(--primary-blue)', cursor: 'pointer', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
          <div style={{ fontWeight: 'bold', color: 'var(--primary-dark)', fontSize: '18px' }}>영상 자동 분석</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>AI가 위반 내용을 자동으로 분석합니다</div>
        </div>

        {/* [추가] 기기 저장 옵션 UI */}
        {myDevice && (
          <div style={{ padding: '0 20px', marginBottom: '10px', display:'flex', justifyContent:'center' }}>
    {myDevice ? (
        <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'var(--text-secondary)', cursor: 'pointer' }}>
            <input type="checkbox" checked={saveToDevice} onChange={(e) => setSaveToDevice(e.target.checked)} />
            <span>내 기기 <b>[{myDevice.serialNo}]</b> 에도 저장</span>
        </label>
    ) : (
        /* 기기가 없을 때 출력되는 문구 */
        <span style={{ fontSize:'12px', color:'var(--text-tertiary)' }}>※ 연동된 기기가 없습니다.</span>
    )}
</div>
        )}

        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />

        {/* ★ [수정] 리스트 영역: 세로 정렬(column) 강제, 상단 정렬(flex-start) */}
        <div className="report-list" style={{ 
            flex: 1, 
            paddingBottom: isDesktop ? '20px' : '80px', 
            overflowY: 'auto',
            display: 'flex',       
            flexDirection: 'column', // 세로 정렬
            justifyContent: 'flex-start' // 위에서부터 쌓이게
        }}>
          {reports.length === 0 && (
            <div style={{ textAlign:'center', marginTop:'40px', color:'var(--text-tertiary)' }}>
              <div>📂</div>
              <div style={{ marginTop: '8px' }}>저장된 신고 내역이 없습니다.</div>
            </div>
          )}
          
          {reports.map((report) => (
            <div 
                key={report.id} 
                className="report-item" 
                onClick={() => handleReportClick(report)}
                style={{ 
                    /* ★ [수정] 박스 크기 고정 및 찌그러짐 방지 */
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px', 
                    margin: '0 20px 12px 20px', 
                    borderRadius: '12px',
                    border: selectedReportId === report.id ? '2px solid var(--primary-blue)' : '1px solid var(--border-light)',
                    background: selectedReportId === report.id ? 'var(--primary-light)' : 'var(--bg-primary)',
                    cursor: report.status === 'complete' ? 'pointer' : 'default',
                    opacity: report.status === 'processing' ? 0.8 : 1,
                    
                    flexShrink: 0, /* ★ 억지로 줄어들지 않게 함 */
                    height: 'auto', /* 높이는 내용물에 맞춤 */
                    minHeight: '80px' /* 최소 높이 보장 */
                }}
            >
              <div style={{ fontSize: '24px', width: '40px', textAlign: 'center' }}>
                {report.status === 'processing' ? <div className="spinner"></div> : report.status === 'error' ? '⚠️' : '📸'}
              </div>
              
              <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: report.status === 'processing' ? 'var(--primary-blue)' : 'var(--text-primary)' }}>
                      {report.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {report.status === 'processing' ? report.progressMsg : `${report.date || report.incidentDate} | ${report.plate}`}
                  </div>
              </div>
              
              {report.status !== 'processing' && (
                <div onClick={(e) => handleDelete(e, report.id)} style={{ padding: '8px', color: 'var(--text-tertiary)', fontSize: '18px', cursor: 'pointer' }}>✖</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isDesktop && selectedReportId && selectedReport && (
        <div style={{ width: '60%', height: '100%', background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-light)' }}>
          <ReportDetailCard report={selectedReport} onClose={() => setSelectedReportId(null)} />
        </div>
      )}

      <style>{`.spinner { width: 24px; height: 24px; border: 3px solid var(--border-light); border-top: 3px solid var(--primary-blue); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Report;