import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useReport } from '../contexts/ReportContext';

const Report = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const { reports, setReports, uploadVideo, removeReport } = useReport();
  
  // 기기 저장 관련 상태
  const [myDevice, setMyDevice] = useState(null);
  const [saveToDevice, setSaveToDevice] = useState(false);
  
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // 내 기기 정보 조회 로직
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

  // DB에서 라즈베리파이/웹 신고 내역 가져오기 
  useEffect(() => {
    if (!user || !user.history_id) return;

    const fetchReportsFromDB = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/reports/${user.history_id}`);
        if (res.ok) {
          const dbData = await res.json();
          
          // DB 데이터를 현재 프론트엔드 리스트 형식에 맞춰 변환
          const formattedReports = dbData.map(item => ({
            id: item.reportId,
            title: item.violationType,
            plate: item.plateNo || "식별불가",
            location: item.location || "위치 정보 없음",
            incidentDate: item.incidentDate,
            incidentTime: item.incidentTime,
            aiDraft: item.aiDraft || item.description,
            video_url: item.videoUrl, // S3 영상 주소
            status: 'complete' // DB에 있는 건 분석 완료 상태
          }));

          // 가져온 데이터를 리스트에 적용
          setReports(formattedReports);
        }
      } catch (err) { 
        console.error("신고 내역 로딩 실패:", err); 
      }
    };

    fetchReportsFromDB();
  }, [user, setReports]);

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

  // PC용 상세 카드
  const ReportDetailCard = ({ report, onClose }) => {
    const [detailContent, setDetailContent] = useState(report.detailContent || report.aiDraft || '');
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
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>위반 장소</div>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold' }}>
                {report.location || "위치 정보 없음"}
            </div>
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

  // --- 리스트 아이템 스타일 (About.jsx와 통일) ---
  const itemStyle = (isSelected, status) => ({
    display: 'flex', 
    alignItems: 'center',
    gap: '16px',
    padding: '16px', 
    borderRadius: '16px',
    border: isSelected ? '2px solid var(--primary-blue)' : '1px solid #f1f3f5',
    backgroundColor: isSelected ? '#EFF6FF' : 'white',
    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.1)' : '0 2px 8px rgba(0,0,0,0.03)',
    cursor: status === 'complete' ? 'pointer' : 'default',
    opacity: status === 'processing' ? 0.8 : 1,
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box'
  });

  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', height: '100%', overflow: 'hidden', background: '#f8f9fa' }}>
      
      {/* 왼쪽: 신고 목록 영역 */}
      <div style={{ width: isDesktop ? (selectedReportId ? '40%' : '100%') : '100%', display: 'flex', flexDirection: 'column', height: '100%', borderRight: isDesktop ? '1px solid var(--border-light)' : 'none', transition: 'width 0.3s ease' }}>
        
        <div className="header" style={{ padding: '20px', textAlign: 'center', background: '#f8f9fa' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 5px 0' }}>📝 신고 관리</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{user ? `${user.nickname}님의 신고 이력` : '로딩 중...'}</p>
        </div>

        {/* 컨텐츠 영역 (스크롤 가능) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* 업로드 버튼 */}
            <div onClick={() => fileInputRef.current.click()} style={{ 
                padding: '24px', 
                background: 'white', 
                borderRadius: '16px', 
                border: '2px dashed #007AFF', 
                cursor: 'pointer', 
                textAlign: 'center', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'background 0.2s'
            }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                <div style={{ fontWeight: 'bold', color: '#007AFF', fontSize: '18px' }}>영상 자동 분석</div>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>AI가 위반 내용을 자동으로 분석합니다</div>
            </div>

            {/* 기기 저장 옵션 */}
            {myDevice && (
                <div style={{ display:'flex', justifyContent:'center', marginBottom: '5px' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#666', cursor: 'pointer', background: 'white', padding: '8px 16px', borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <input type="checkbox" checked={saveToDevice} onChange={(e) => setSaveToDevice(e.target.checked)} />
                        <span>내 기기 <b>[{myDevice.serialNo}]</b> 에도 저장</span>
                    </label>
                </div>
            )}

            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />

            {/* 리스트 아이템들 */}
            {reports.length === 0 && (
                <div style={{ textAlign:'center', marginTop:'40px', color:'#999' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📂</div>
                <div>저장된 신고 내역이 없습니다.</div>
                </div>
            )}
            
            {reports.map((report) => (
                <div 
                    key={report.id} 
                    onClick={() => handleReportClick(report)}
                    style={itemStyle(selectedReportId === report.id, report.status)}
                >
                    {/* 상태 아이콘 */}
                    <div style={{ 
                        width: '50px', height: '50px', borderRadius: '12px', background: '#f1f3f5', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 
                    }}>
                        {report.status === 'processing' ? <div className="spinner"></div> : report.status === 'error' ? '⚠️' : '📸'}
                    </div>
                    
                    {/* 텍스트 정보 */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', color: report.status === 'processing' ? '#007AFF' : '#333', marginBottom: '4px' }}>
                            {report.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888' }}>
                            {report.status === 'processing' ? report.progressMsg : `${report.date || report.incidentDate} | ${report.plate}`}
                        </div>
                    </div>
                    
                    {/* 삭제 버튼 */}
                    {report.status !== 'processing' && (
                        <div 
                            onClick={(e) => handleDelete(e, report.id)} 
                            style={{ 
                                padding: '8px', color: '#adb5bd', fontSize: '18px', cursor: 'pointer', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                transition: 'background 0.2s', width: '32px', height: '32px'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            ✖
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {isDesktop && selectedReportId && selectedReport && (
        <div style={{ width: '60%', height: '100%', background: 'white', borderLeft: '1px solid #eee' }}>
          <ReportDetailCard report={selectedReport} onClose={() => setSelectedReportId(null)} />
        </div>
      )}

      <style>{`.spinner { width: 24px; height: 24px; border: 3px solid #eee; border-top: 3px solid #007AFF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Report;