import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const Support = () => {
  // 1. 건우님의 핵심 로직 (Context 사용)
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  
  const [showModal, setShowModal] = useState(false);
  const [serialInput, setSerialInput] = useState("");
  const [myDevice, setMyDevice] = useState(null);

  // 내 기기 정보 가져오기
  const fetchMyDevice = async () => {
    if (!user || !user.history_id) return;
    try {
        const res = await fetch(`http://localhost:8080/api/device/${user.history_id}`);
        if (res.ok) {
            const devices = await res.json();
            if (devices.length > 0) {
                setMyDevice(devices[0]);
            }
        }
    } catch (e) {
        console.error("기기 조회 실패:", e);
    }
  };

  useEffect(() => {
    fetchMyDevice();
  }, [user]);

  // 로그아웃 로직
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
    } catch (error) { console.error(error); } 
    finally {
      logout(); 
      navigate('/login'); 
    }
  };

  // 회원 탈퇴 로직
  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?\n신고 내역과 기기 정보가 모두 삭제되며 복구할 수 없습니다.")) return;
    if (!user || !user.history_id) return;

    try {
        const res = await fetch(`http://localhost:8080/api/user/${user.history_id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("탈퇴가 완료되었습니다.");
            logout(); 
            navigate('/login'); 
        } else {
            alert("탈퇴 실패: 서버 오류");
        }
    } catch (e) { console.error(e); alert("서버 연결 실패"); }
  };

  // 기기 등록 로직
  const handleRegisterDevice = async () => {
    if (!serialInput.trim()) return alert("시리얼 번호를 입력해주세요.");
    if (!user || !user.history_id) return alert("로그인 정보가 없습니다.");

    try {
      const res = await fetch('http://localhost:8080/api/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNo: serialInput, historyId: user.history_id })
      });

      if (res.ok) {
        alert(`✅ 기기(${serialInput})가 등록되었습니다!`);
        setShowModal(false);
        setSerialInput("");
        fetchMyDevice(); 
      } else {
        alert("등록 실패: 이미 등록된 기기이거나 오류입니다.");
      }
    } catch (e) { console.error(e); alert("서버 연결 실패"); }
  };

  // 클립보드 복사
  const handleCopySerial = (e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지
    if (myDevice) {
        navigator.clipboard.writeText(myDevice.serialNo);
        alert(`클립보드에 복사되었습니다!\n📋 ${myDevice.serialNo}`);
    }
  };

  // 2. 상대방의 UI 디자인 적용
  return (
    <div className="screen active">
      {/* 헤더 디자인 */}
      <div className="header">
        <h1>💬 마이페이지</h1>
        <p>내 정보 및 기기 설정</p>
      </div>

      <div style={{ padding: '20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
        
        {/* 프로필 카드 (그라데이션 디자인) */}
        {user && (
            <div className="analytics-card" style={{ 
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%)', 
              border: '1px solid var(--warning-light)', 
              marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {user.profile_image ? (
                        <img 
                            src={user.profile_image} 
                            alt="프로필" 
                            style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} 
                        />
                    ) : (
                        <div style={{ fontSize: '50px' }}>👤</div>
                    )}
                    
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400E' }}>
                            {user.nickname}님
                        </div>
                        <div style={{ fontSize: '13px', color: '#B45309', fontWeight: '500' }}>
                            환영합니다! 👋
                        </div>
                        {user.email && (
                            <div style={{ fontSize: '11px', color: 'rgba(146, 64, 14, 0.7)', marginTop: '2px' }}>
                                {user.email}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* ★ [핵심] 기기 관리 카드 (디자인 + 기능 통합) */}
        <div 
          className="menu-card" 
          onClick={myDevice ? handleCopySerial : () => setShowModal(true)}
          style={{ 
              border: myDevice ? '1px solid #3B82F6' : '1px solid var(--border-light)',
              background: myDevice ? '#EFF6FF' : 'white'
          }}
        >
          {/* 아이콘: 기기 있으면 파란색, 없으면 회색 */}
          <div className={`menu-icon ${myDevice ? 'blue' : ''}`} style={{ background: myDevice ? undefined : '#f3f4f6', color: myDevice ? undefined : '#9ca3af' }}>
             🍓
          </div>
          
          <div className="menu-content">
            <div className="menu-title" style={{ color: myDevice ? '#1E40AF' : 'var(--text-primary)' }}>
                {myDevice ? '내 라즈베리파이 (연결됨)' : '기기 등록하기'}
            </div>
            <div className="menu-desc">
                {myDevice ? (
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{myDevice.serialNo}</span>
                ) : (
                    '시리얼 번호를 등록해주세요'
                )}
            </div>
          </div>
          
          <div className="menu-arrow" style={{ fontSize: '12px', fontWeight: 'bold', color: myDevice ? '#3B82F6' : '#ccc' }}>
            {myDevice ? '복사' : '+ 등록'}
          </div>
        </div>

        {/* 지원 정보 카드 */}
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', marginTop: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E40AF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📞</span> 고객 지원
          </div>
          <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.8' }}>
            <div><span style={{ fontWeight: '600' }}>이메일:</span> support@roadguardian.com</div>
            <div><span style={{ fontWeight: '600' }}>전화:</span> 1234-5678 (평일 09:00-18:00)</div>
          </div>
        </div>

        {/* FAQ 버튼 */}
        <div className="menu-card" onClick={() => alert("준비 중입니다.")}>
          <div className="menu-icon green">❓</div>
          <div className="menu-content">
            <div className="menu-title">자주 묻는 질문</div>
            <div className="menu-desc">앱 사용 방법 및 도움말</div>
          </div>
          <div className="menu-arrow">›</div>
        </div>
        
        {/* 하단 버튼 그룹 */}
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 로그아웃 */}
            <button 
              className="btn" 
              onClick={handleLogout}
              style={{ 
                background: 'var(--bg-secondary)', 
                color: 'var(--danger-red)', 
                border: '1px solid var(--border-light)', 
                width: '100%', 
                margin: 0,
                justifyContent: 'center'
              }}
            >
              로그아웃
            </button>

            {/* 회원 탈퇴 */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <span 
                    onClick={handleDeleteAccount} 
                    style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'underline', cursor: 'pointer' }}
                >
                    회원 탈퇴하기
                </span>
            </div>
        </div>

      </div>

      {/* 모달 디자인 (Glassmorphism 적용) */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center' }}>📡 기기 등록</h3>
            <p className="modal-desc" style={{ textAlign: 'center' }}>
                라즈베리파이에 부착된<br/>시리얼 번호를 입력해주세요.
            </p>
            
            <input 
                type="text" 
                placeholder="예: RPI-XXXX-XXXX" 
                value={serialInput} 
                onChange={(e) => setSerialInput(e.target.value)} 
                className="chat-input-field"
                style={{ width: '100%', marginBottom: '20px', height: '48px', textAlign: 'center', fontSize: '16px' }}
            />
            
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="modal-btn modal-btn-cancel">
                취소
              </button>
              <button onClick={handleRegisterDevice} className="modal-btn modal-btn-confirm">
                등록 확인
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Support;