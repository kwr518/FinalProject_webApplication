import React, { useState, useEffect } from 'react';
import axios from 'axios';

const About = () => {
  // 1. 상태 관리
  const [reports, setReports] = useState([]);           
  const [selectedReport, setSelectedReport] = useState(null); 
  const [loading, setLoading] = useState(true);

  // 2. DB 데이터 조회
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // [설정] 유저 ID (로그인 기능 완성 전까지 3번으로 고정)
        const userId = 3; 

        const response = await axios.get(`http://localhost:8080/api/my-reports?userId=${userId}`);
        console.log("데이터 로드 완료:", response.data);
        setReports(response.data);
      } catch (error) {
        console.error("조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // 3. 핸들러 함수들
  const handleBoxClick = (report) => setSelectedReport(report);
  const handleBack = () => setSelectedReport(null);

  // [임시저장 핸들러]
  const handleTempSave = async (formData) => {
    if (!selectedReport) return;
    try {
      await axios.put(`http://localhost:8080/api/reports/${selectedReport.reportId}/submit`, {
        description: formData.content,
        phoneNumber: formData.phone,
        isAgreed: formData.agreed, // true/false 값 전달
        violationType: formData.reportType,
        plateNo: formData.carNumber,
        location: formData.address,
        incidentDate: formData.occurrenceDate,
        incidentTime: formData.occurrenceTime
      });
      
      alert("신고 내용이 임시저장 되었습니다.");
      window.location.reload(); // 새로고침하여 뱃지 상태 반영
      
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  // [자동신고 핸들러]
  const handleAutoReport = () => {
    alert("안전신문고 자동신고 기능은 준비 중입니다.");
  };

  // 화면 전환
  if (selectedReport) {
    return (
      <DetailView 
        report={selectedReport} 
        onBack={handleBack} 
        onTempSave={handleTempSave} 
        onAutoReport={handleAutoReport} 
      />
    );
  }

  // =================================================================
  // [목록 뷰] 내 신고 보관함
  // =================================================================
  return (
    <div className="screen active" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div className="header" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>📂 내 신고 보관함</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          분석 완료된 내역을 확인하고 신고하세요
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '50px' }}>로딩 중...</p>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#999' }}>
            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📭</p>
            <p>신고 내역이 없습니다.</p>
          </div>
        ) : (
          reports.map((item) => (
            <div key={item.reportId} onClick={() => handleBoxClick(item)} style={summaryBoxStyle}>
              <div style={thumbnailStyle}>
                {item.videoUrl ? (
                   <video 
                     src={item.videoUrl.startsWith('http') ? item.videoUrl : `http://localhost:8080/${item.videoUrl}`} 
                     style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                   />
                ) : (
                   <span style={{ fontSize: '24px' }}>🎬</span>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={typeBadgeStyle}>{item.violationType || '분석 중'}</span>
                  
                  {/* ★ [상태 뱃지 표시 로직] ★ */}
                  {item.isSubmitted ? (
                    // 안전신문고 제출 완료 시 (Green)
                    <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>✔ 제출완료</span>
                  ) : (item.phoneNumber && item.phoneNumber.length > 0) ? (
                    // 전화번호가 있으면 임시저장된 것으로 판단 (Blue)
                    <span style={{ fontSize: '12px', color: '#007AFF', fontWeight: 'bold' }}>💾 임시저장됨</span>
                  ) : (
                    // 아무것도 없으면 미작성 (Gray)
                    <span style={{ fontSize: '12px', color: '#ccc' }}>미작성</span>
                  )}

                </div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#333' }}>
                  {item.plateNo && item.plateNo !== '번호 없음' ? item.plateNo : '차량번호 미식별'}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                  {item.incidentDate} {item.incidentTime}
                </p>
              </div>
              <div style={{ fontSize: '20px', color: '#ccc' }}>&gt;</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// =================================================================
// [상세 정보 뷰]
// =================================================================
const DetailView = ({ report, onBack, onTempSave, onAutoReport }) => {
  const [formData, setFormData] = useState({
    reportType: report.violationType || '기타',
    carNumber: report.plateNo || '',
    occurrenceDate: report.incidentDate || '',
    occurrenceTime: report.incidentTime || '',
    address: report.location || '',
    content: report.description || report.aiDraft || '', 
    phone: report.phoneNumber || '',
    agreed: report.isAgreed || false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) {
        formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
        formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    setFormData({ ...formData, phone: formatted });
  };

  const videoSrc = report.videoUrl && report.videoUrl.startsWith('http') 
    ? report.videoUrl 
    : `http://localhost:8080/${report.videoUrl}`;

  return (
    <div className="screen active" style={{ backgroundColor: '#f8f9fa', paddingBottom: '80px', minHeight: '100vh' }}>
      
      {/* 헤더 */}
      <div className="header" style={{ 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: 'white', 
          borderBottom: '1px solid #eee',
          position: 'sticky', 
          top: 0,
          zIndex: 100 
      }}>
        <h1 style={{ fontSize: '20px', margin: '0', fontWeight: 'bold' }}>상세 정보 수정</h1>
        
        <button 
          type="button" 
          onClick={(e) => { e.stopPropagation(); onBack(); }} 
          style={{ 
            border: 'none', background: '#f1f3f5', padding: '8px 12px', borderRadius: '6px', 
            fontSize: '13px', cursor: 'pointer', fontWeight: 'bold', color: '#333', pointerEvents: 'auto' 
          }}
        >
          뒤로가기 ↩
        </button>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 영상 */}
        <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'black', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            {report.videoUrl ? (
                <video src={videoSrc} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
                <div style={{ color: '#888', textAlign: 'center', paddingTop: '20%', fontSize: '14px' }}>증거 영상이 없습니다.</div>
            )}
        </div>

        {/* 폼 입력 */}
        <div className="form-group">
          <label style={labelStyle}>신고 유형</label>
          <select name="reportType" value={formData.reportType} onChange={handleChange} style={inputStyle}>
            <option value="중앙선 침범">중앙선 침범</option>
            <option value="차로 변경 위반">차로 변경 위반</option>
            <option value="신호 위반">신호 위반</option>
            <option value="기타">기타</option>
            <option value="정상 주행">정상 주행</option>
          </select>
        </div>

        <div className="form-group">
          <label style={labelStyle}>차량번호</label>
          <input type="text" name="carNumber" value={formData.carNumber} onChange={handleChange} style={inputStyle} />
        </div>

        <div className="form-group">
          <label style={labelStyle}>발생 일자 및 시각</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" name="occurrenceDate" value={formData.occurrenceDate} onChange={handleChange} style={{ ...inputStyle, flex: 1, textAlign: 'center' }} />
            <input type="time" name="occurrenceTime" value={formData.occurrenceTime} onChange={handleChange} style={{ ...inputStyle, flex: 1, textAlign: 'center' }} />
          </div>
        </div>

        <div className="form-group">
          <label style={labelStyle}>발생지역</label>
          <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} />
        </div>

        <div className="form-group">
          <label style={labelStyle}>상세 내용</label>
          <textarea name="content" value={formData.content} onChange={handleChange} placeholder="위반 당시 상황을 상세히 입력해주세요." rows="5" style={inputStyle}></textarea>
        </div>

        <div className="form-group">
          <label style={labelStyle}>휴대전화 번호</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} placeholder="010-0000-0000" maxLength="13" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
          <input type="checkbox" id="agree" name="agreed" checked={formData.agreed} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
          <label htmlFor="agree" style={{ fontSize: '14px', cursor: 'pointer' }}>신고 내용 공유 동의</label>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => onTempSave(formData)} style={{ ...buttonStyleMain, backgroundColor: '#6C757D', color: 'white' }}>임시저장</button>
          <button onClick={onAutoReport} style={{ ...buttonStyleMain, backgroundColor: '#007AFF', color: 'white' }}>안전신문고 자동신고</button>
        </div>
      </div>
    </div>
  );
};

// --- 스타일 ---
const summaryBoxStyle = { backgroundColor: 'white', padding: '15px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer', border: '1px solid #F3F4F6', transition: 'transform 0.1s' };
const thumbnailStyle = { width: '80px', height: '80px', backgroundColor: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const typeBadgeStyle = { backgroundColor: '#EFF6FF', color: '#1D4ED8', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' };
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '15px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };
const buttonStyleMain = { flex: 1, padding: '16px', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };

export default About;