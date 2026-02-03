import React, { useState, useRef, useEffect } from 'react';

const CustomerService = () => {
  // 1. 상태 관리
  const [messages, setMessages] = useState([
    { 
      text: "👋 안녕하세요! 저는 대한민국 도로교통법 전문 AI 챗봇입니다.\n\n신호 위반, 중앙선 침범, 음주운전 처벌 기준 등 궁금한 점을 무엇이든 물어보세요!", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true); // 질문 예시 표시 여부
  
  // 스크롤 제어용 Ref
  const messagesEndRef = useRef(null);

  // 메시지가 추가될 때마다 스크롤 하단으로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // 2. 메시지 전송 로직 (파이썬 서버 8000번 연동)
  const sendMessage = async (overrideInput = null) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;
    
    // 사용자 메시지 화면에 추가
    const newMessages = [...messages, { text: messageToSend, isUser: true }];
    setMessages(newMessages);
    setInput("");
    setShowSuggestions(false); // 질문하면 예시 숨김
    setIsLoading(true);

    try {
      // ★ 핵심: 파이썬 AI 서버로 질문 전송
      const res = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: messageToSend })
      });
      
      if (res.ok) {
        const data = await res.json();
        // AI 답변 추가
        setMessages(prev => [...prev, { text: data.answer, isUser: false }]);
      } else {
        throw new Error("서버 응답 오류");
      }
      
    } catch (e) {
      console.error("AI 요청 실패:", e);
      setMessages(prev => [
        ...prev, 
        { 
          text: "죄송합니다. AI 서버와 연결할 수 없습니다.\n잠시 후 다시 시도해주시거나 관리자에게 문의해주세요.", 
          isUser: false 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (question) => {
    sendMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div className="header">
        <h1>💬 도로법 전문 상담</h1>
        <p>AI 챗봇과 실시간 대화</p>
      </div>
      
      {/* 채팅 영역 */}
      <div className="chatbot-container">
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.isUser ? 'user' : ''}`}>
              <div className={`chat-bubble ${msg.isUser ? 'user' : 'assistant'}`}>
                {/* 줄바꿈 처리 */}
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i !== msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {/* 로딩 표시 (스피너) */}
          {isLoading && (
            <div className="chat-message">
              <div className="chat-bubble assistant" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--primary-blue)' }}></div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>답변 생성 중...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* 질문 예시 토글 버튼 */}
        <div style={{ padding: '0 20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)' }}>
          <button 
            onClick={() => setShowSuggestions(!showSuggestions)}
            style={{
              width: '100%',
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{showSuggestions ? '질문 예시 접기' : '질문 예시 보기'}</span>
            <span style={{ transform: showSuggestions ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>▼</span>
          </button>
        </div>

        {/* 질문 예시 목록 (애니메이션 적용) */}
        {showSuggestions && (
          <div className="suggestions-container" style={{ animation: 'slideDown 0.3s ease' }}>
            <button className="suggestion-btn" onClick={() => handleSuggestion('신호 위반 벌금은 얼마인가요?')} disabled={isLoading}>
              🚦 신호 위반 벌금은?
            </button>
            <button className="suggestion-btn" onClick={() => handleSuggestion('중앙선 침범 처벌 기준 알려줘')} disabled={isLoading}>
              🟡 중앙선 침범 처벌
            </button>
            <button className="suggestion-btn" onClick={() => handleSuggestion('음주운전 면허 취소 기준은?')} disabled={isLoading}>
              🍺 음주운전 기준
            </button>
            <button className="suggestion-btn" onClick={() => handleSuggestion('어린이 보호구역 속도 위반 과태료')} disabled={isLoading}>
              🚸 스쿨존 속도 위반
            </button>
          </div>
        )}
        
        {/* 입력 영역 */}
        <div className="chat-input-area">
          <textarea 
            className="chat-input-field" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="도로교통법 관련 질문을 입력하세요..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            className="chat-send-btn" 
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            style={{
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>

      <style>{`
        .suggestion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CustomerService;