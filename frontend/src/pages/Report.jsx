import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useReport } from '../contexts/ReportContext';

const Report = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Context 연결
  const { reports, uploadVideo, removeReport } = useReport();
  
  const [myDevice, setMyDevice] = useState(null);
  const [saveToDevice, setSaveToDevice] = useState(false);

  // 내 기기 정보 조회
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

  // 삭제
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('정말 삭제하시겠습니까? (복구 불가)')) {
      await removeReport(id);
    }
  };

  // 업로드
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Context 함수 호출 (여기서 스피너 관리 다 해줌)
    uploadVideo(file, saveToDevice, myDevice);
    e.target.value = ''; 
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>신고 관리</h1>
        <p>{user ? `${user.nickname}님의 신고 이력` : '로딩 중...'}</p>
      </div>

      <div onClick={() => fileInputRef.current.click()} style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', margin: '16px', border: '2px dashed #CBD5E1', cursor: 'pointer', textAlign: 'center' }}>
        <div style={{ fontSize: '32px' }}>📸</div>
        <div style={{ fontWeight: 'bold', color: '#1E293B' }}>새 영상 업로드</div>
      </div>

      {myDevice && (
        <div style={{ padding: '0 16px', marginBottom: '16px', display:'flex', justifyContent:'center' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#4B5563' }}>
                <input type="checkbox" checked={saveToDevice} onChange={(e) => setSaveToDevice(e.target.checked)} />
                <span>내 기기 <b>[{myDevice.serialNo}]</b> 에 저장하기</span>
            </label>
        </div>
      )}

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="video/*" onChange={handleFileChange} />

      <div className="report-list" style={{ paddingBottom: '80px' }}>
        {reports.length === 0 && <div style={{textAlign:'center', marginTop:'20px', color:'#999'}}>저장된 내역이 없습니다.</div>}
        
        {reports.map((report) => (
          <div key={report.id} className="report-item" 
            onClick={() => report.status !== 'processing' && report.status !== 'error' && navigate('/report/detail', {state: report})}
            style={{ 
                border: report.status === 'processing' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                background: 'white', padding: '16px', margin: '0 16px 12px 16px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                opacity: report.status === 'processing' ? 0.8 : 1
            }}>
              <div style={{ fontSize: '24px', width: '30px', textAlign: 'center' }}>
                {/* ★ 스피너 표시 로직 */}
                {report.status === 'processing' ? <div className="spinner"></div> : report.status === 'error' ? '⚠️' : '📂'}
              </div>
              <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{report.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {report.status === 'processing' ? report.progressMsg : `${report.date} | ${report.plate}`}
                  </div>
              </div>
              {/* 처리 중이 아닐 때만 삭제 버튼 표시 */}
              {report.status !== 'processing' && (
                <div onClick={(e) => handleDelete(e, report.id)} style={{ padding: '8px', color: '#EF4444', fontWeight: 'bold', fontSize: '18px' }}>✖</div>
              )}
          </div>
        ))}
      </div>
      
      {/* ★ 스피너 CSS (이게 없으면 로딩이 안 돕니다) */}
      <style>{`
        .spinner { 
            width: 20px; height: 20px; 
            border: 3px solid #f3f3f3; 
            border-top: 3px solid #3498db; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
            margin: 0 auto; 
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