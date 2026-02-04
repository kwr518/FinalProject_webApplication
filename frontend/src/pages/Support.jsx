import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const Support = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  
  const [showModal, setShowModal] = useState(false);
  const [serialInput, setSerialInput] = useState("");
  const [myDevice, setMyDevice] = useState(null);

  // ★★★ [문제 해결 핵심] 기기 정보 불러오기 ★★★
  const fetchMyDevice = async () => {
    // 1. 유저 정보가 없으면 중단
    if (!user) {
        console.log("❌ [fetchMyDevice] 유저 정보 없음");
        return;
    }

    // 2. 사용할 ID 결정 (history_id를 우선 사용, 없으면 id 사용)
    const targetId = user.history_id || user.id;
    console.log(`📡 [fetchMyDevice] 기기 조회 시작! 타겟 ID: ${targetId}`);

    try {
        const res = await fetch(`http://localhost:8080/api/device/${targetId}`);
        
        if (res.ok) {
            const data = await res.json();
            console.log("✅ [fetchMyDevice] 서버 응답 데이터:", data);

            // 3. 데이터가 '빈 배열'이거나 'null'이면 -> 기기 없음 처리
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log("⚠️ [fetchMyDevice] 등록된 기기가 없습니다.");
                setMyDevice(null);
                return;
            }

            // 4. 배열이면 첫 번째 요소 추출, 아니면 그대로 사용
            const deviceObj = Array.isArray(data) ? data[0] : data;

            // 5. 변수명 대소문자 문제 해결 (serial_no vs serialNo)
            // DB에서 오는 어떤 이름이든 다 받아내도록 처리
            const finalSerial = deviceObj.serialNo || deviceObj.serial_no || deviceObj.serialNumber;

            if (finalSerial) {
                console.log("🎉 [fetchMyDevice] 기기 찾음:", finalSerial);
                setMyDevice({ 
                    ...deviceObj, 
                    serialNo: finalSerial 
                });
            } else {
                console.log("❌ [fetchMyDevice] 데이터는 있는데 시리얼 번호를 못 찾음:", deviceObj);
            }

        } else {
            console.error("❌ [fetchMyDevice] 서버 응답 오류:", res.status);
        }
    } catch (e) {
        console.error("❌ [fetchMyDevice] 네트워크 통신 실패:", e);
    }
  };

  // 화면이 켜질 때 실행
  useEffect(() => {
    fetchMyDevice();
  }, [user]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', { method: 'POST' });
    } catch (error) { console.error(error); } 
    finally {
      logout(); 
      navigate('/login'); 
    }
  };

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 탈퇴하시겠습니까?\n복구할 수 없습니다.")) return;
    const targetId = user?.history_id || user?.id;
    if (!targetId) return;

    try {
        const res = await fetch(`http://localhost:8080/api/user/${targetId}`, { method: 'DELETE' });
        if (res.ok) {
            alert("탈퇴 완료");
            logout(); 
            navigate('/login'); 
        } else {
            alert("탈퇴 실패");
        }
    } catch (e) { console.error(e); }
  };

  // 기기 등록
  const handleRegisterDevice = async () => {
    if (!serialInput.trim()) return alert("시리얼 번호를 입력해주세요.");
    
    const targetId = user?.history_id || user?.id;
    if (!targetId) return alert("로그인 정보가 없습니다.");

    try {
      const res = await fetch('http://localhost:8080/api/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNo: serialInput, historyId: targetId })
      });

      if (res.ok) {
        alert(`✅ 기기(${serialInput}) 등록 완료!`);
        // 등록 즉시 화면 반영 (새로고침 불필요)
        setMyDevice({ serialNo: serialInput });
        setShowModal(false);
        setSerialInput("");
      } else {
        alert("등록 실패: 이미 존재하는 기기이거나 오류입니다.");
      }
    } catch (e) { console.error(e); alert("서버 연결 실패"); }
  };

  // 시리얼 복사
  const handleCopySerial = (e) => {
    e.stopPropagation(); 
    if (myDevice) {
        navigator.clipboard.writeText(myDevice.serialNo);
        alert(`복사됨: ${myDevice.serialNo}`);
    }
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>💬 마이페이지</h1>
        <p>내 정보 및 기기 설정</p>
      </div>

      <div style={{ padding: '20px', paddingBottom: '100px', display: 'flex', flexDirection: 'column' }}>
        
        {/* 프로필 카드 */}
        {user && (
            <div className="analytics-card" style={{ 
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FEF9C3 100%)', 
              border: '1px solid var(--warning-light)', 
              marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '50px' }}>👤</div>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#92400E' }}>
                            {user.nickname || "사용자"}님
                        </div>
                        <div style={{ fontSize: '13px', color: '#B45309', fontWeight: '500' }}>
                            환영합니다! 👋
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(146, 64, 14, 0.7)', marginTop: '2px' }}>
                            {user.email} (ID: {user.history_id || user.id})
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ★ 기기 관리 카드 */}
        <div 
          className="menu-card" 
          onClick={myDevice ? handleCopySerial : () => setShowModal(true)}
          style={{ 
              border: myDevice ? '1px solid #3B82F6' : '1px solid var(--border-light)',
              background: myDevice ? '#EFF6FF' : 'white'
          }}
        >
          <div className={`menu-icon ${myDevice ? 'blue' : ''}`} style={{ background: myDevice ? undefined : '#f3f4f6', color: myDevice ? undefined : '#9ca3af' }}>
              🍓
          </div>
          
          <div className="menu-content">
            <div className="menu-title" style={{ color: myDevice ? '#1E40AF' : 'var(--text-primary)' }}>
                {myDevice ? '내 라즈베리파이 (연결됨)' : '기기 등록하기'}
            </div>
            <div className="menu-desc">
                {myDevice ? (
                    <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                        {myDevice.serialNo}
                    </span>
                ) : (
                    '시리얼 번호를 등록해주세요'
                )}
            </div>
          </div>
          
          <div className="menu-arrow" style={{ fontSize: '12px', fontWeight: 'bold', color: myDevice ? '#3B82F6' : '#ccc' }}>
            {myDevice ? '복사' : '+ 등록'}
          </div>
        </div>

        {/* 하단 메뉴들 (디자인 유지) */}
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)', marginTop: '10px' }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1E40AF', marginBottom: '12px' }}>📞 고객 지원</div>
          <div style={{ fontSize: '13px', color: '#4B5563' }}>support@roadguardian.com / 1234-5678</div>
        </div>

        <div className="menu-card" onClick={() => alert("준비 중입니다.")}>
          <div className="menu-icon green">❓</div>
          <div className="menu-content"><div className="menu-title">자주 묻는 질문</div></div>
          <div className="menu-arrow">›</div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn" onClick={handleLogout} style={{ background: 'var(--bg-secondary)', color: 'var(--danger-red)', border: '1px solid var(--border-light)', width: '100%', margin: 0, justifyContent: 'center' }}>로그아웃</button>
            <div style={{ textAlign: 'center', marginTop: '8px' }}><span onClick={handleDeleteAccount} style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'underline', cursor: 'pointer' }}>회원 탈퇴하기</span></div>
        </div>

      </div>

      {/* 모달 */}
      {showModal && (
        <div className="modal active">
          <div className="modal-content">
            <h3 className="modal-title" style={{ textAlign: 'center' }}>📡 기기 등록</h3>
            <p className="modal-desc" style={{ textAlign: 'center' }}>시리얼 번호를 입력해주세요.</p>
            <input type="text" placeholder="예: RPI-XXXX-XXXX" value={serialInput} onChange={(e) => setSerialInput(e.target.value)} className="chat-input-field" style={{ width: '100%', marginBottom: '20px', height: '48px', textAlign: 'center' }} />
            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)} className="modal-btn modal-btn-cancel">취소</button>
              <button onClick={handleRegisterDevice} className="modal-btn modal-btn-confirm">등록 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;