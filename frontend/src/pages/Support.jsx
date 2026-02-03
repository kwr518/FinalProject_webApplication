import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

const Support = () => {
  const { user, logout } = useAuth(); 
  const navigate = useNavigate(); 
  
  const [showModal, setShowModal] = useState(false);
  const [serialInput, setSerialInput] = useState("");
  
  // ★ [NEW] 등록된 기기 정보 상태
  const [myDevice, setMyDevice] = useState(null);

  // 1. 내 기기 정보 가져오기 (페이지 로드 시 실행)
  const fetchMyDevice = async () => {
    if (!user || !user.history_id) return;
    try {
        const res = await fetch(`http://localhost:8080/api/device/${user.history_id}`);
        if (res.ok) {
            const devices = await res.json();
            // 기기가 하나라도 있으면 첫 번째 기기를 저장
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

  // 기기 등록
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
        fetchMyDevice(); // ★ 등록 후 즉시 화면 갱신
      } else {
        alert("등록 실패: 이미 등록된 기기이거나 오류입니다.");
      }
    } catch (e) { console.error(e); alert("서버 연결 실패"); }
  };

  // ★ [NEW] 클립보드 복사 함수
  const handleCopySerial = () => {
    if (myDevice) {
        navigator.clipboard.writeText(myDevice.serialNo);
        alert(`클립보드에 복사되었습니다!\n📋 ${myDevice.serialNo}`);
    }
  };

  return (
    <div className="screen active">
      <div className="header">
        <h1>💬 고객센터</h1>
        <p>지원 및 설정</p>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
        
        {/* 유저 프로필 카드 */}
        {user && (
            <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1px solid #FED7AA', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {user.profile_image ? (
                        <img src={user.profile_image} alt="프로필" style={{ width: '50px', height: '50px', borderRadius: '50%', border: '2px solid white' }} />
                    ) : (
                        <div style={{ fontSize: '40px' }}>👤</div>
                    )}
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#9A3412' }}>{user.nickname}님</div>
                        <div style={{ fontSize: '12px', color: '#C2410C' }}>ID: {user.loginSocialId || user.id}</div>
                    </div>
                </div>
            </div>
        )}

        {/* ★ [수정됨] 라즈베리파이 메뉴 카드 */}
        <div 
          className="menu-card" 
          // 기기가 있으면 복사 실행, 없으면 모달 열기
          onClick={myDevice ? handleCopySerial : () => setShowModal(true)} 
          style={{ 
              cursor: 'pointer', display:'flex', alignItems:'center', padding:'16px', 
              background:'white', borderRadius:'12px', marginBottom:'12px', 
              boxShadow:'0 2px 4px rgba(0,0,0,0.05)',
              border: myDevice ? '1px solid #3B82F6' : '1px solid transparent' // 등록되면 파란 테두리
          }}
        >
          <div style={{ fontSize:'24px', marginRight:'16px' }}>🍓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight:'bold', color:'#333' }}>
                {myDevice ? '내 라즈베리파이 (연결됨)' : '라즈베리파이 등록'}
            </div>
            {/* ★ 시리얼 번호 표시 영역 */}
            <div style={{ fontSize:'12px', color: myDevice ? '#6B7280' : '#888', marginTop:'2px' }}>
                {myDevice ? (
                    <span style={{ fontFamily:'monospace', background:'#F3F4F6', padding:'2px 6px', borderRadius:'4px' }}>
                        {myDevice.serialNo} 📋
                    </span>
                ) : (
                    '내 기기 시리얼 번호 연결'
                )}
            </div>
          </div>
          <div style={{ color: myDevice ? '#3B82F6' : '#ccc', fontSize:'14px', fontWeight: myDevice?'bold':'normal' }}>
            {myDevice ? '복사' : '›'}
          </div>
        </div>

        {/* FAQ */}
        <div className="menu-card" onClick={() => alert("자주 묻는 질문 팝업 준비 중입니다.")} style={{ cursor: 'pointer', display:'flex', alignItems:'center', padding:'16px', background:'white', borderRadius:'12px', marginBottom:'24px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize:'24px', marginRight:'16px' }}>❓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight:'bold', color:'#333' }}>FAQ</div>
            <div style={{ fontSize:'12px', color:'#888' }}>자주 묻는 질문</div>
          </div>
          <div style={{ color:'#ccc' }}>›</div>
        </div>
        
        <div style={{ flex: 1 }}></div>

        {/* 로그아웃 버튼 */}
        <button 
            className="btn" 
            onClick={handleLogout} 
            style={{ width:'100%', background:'#EF4444', color:'white', border:'none', borderRadius:'12px', padding:'16px', fontWeight:'bold', boxShadow:'0 4px 6px rgba(239, 68, 68, 0.2)', marginBottom: '16px' }}
        >
          로그아웃
        </button>

        {/* 회원 탈퇴 */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span onClick={handleDeleteAccount} style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'underline', cursor: 'pointer' }}>회원 탈퇴하기</span>
        </div>

      </div>

      {/* 기기 등록 모달 */}
      {showModal && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'white', width:'80%', maxWidth:'320px', borderRadius:'16px', padding:'24px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin:'0 0 16px 0', fontSize:'18px', textAlign:'center' }}>📡 기기 등록</h3>
            <p style={{ fontSize:'13px', color:'#666', marginBottom:'16px', textAlign:'center' }}>라즈베리파이 시리얼 번호 입력</p>
            <input type="text" placeholder="예: RPI-1234-5678" value={serialInput} onChange={(e) => setSerialInput(e.target.value)} style={{ width:'100%', padding:'12px', border:'1px solid #ddd', borderRadius:'8px', marginBottom:'16px', boxSizing: 'border-box' }} />
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex:1, padding:'12px', borderRadius:'8px', border:'1px solid #ddd', background:'white', cursor:'pointer' }}>취소</button>
              <button onClick={handleRegisterDevice} style={{ flex:1, padding:'12px', borderRadius:'8px', border:'none', background:'#3B82F6', color:'white', fontWeight:'bold', cursor:'pointer' }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;