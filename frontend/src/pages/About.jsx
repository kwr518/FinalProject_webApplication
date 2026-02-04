import React from 'react';

const About = () => {
  return (
    <div className="screen active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* 헤더 */}
      <div className="header">
        <h1>ℹ️ 서비스 정보</h1>
        <p>Road Guardian 소개</p>
      </div>

      {/* 컨텐츠 영역 (스크롤 가능) */}
      <div style={{ padding: '20px', overflowY: 'auto', paddingBottom: '100px' }}>
        
        {/* 1. 서비스 소개 카드 */}
        <div className="analytics-card" style={{ 
          background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
          border: '1px solid var(--border-light)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: 'var(--text-primary)', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>🚀</span>
            주요 기능
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)', 
            lineHeight: '1.8'
          }}>
            도로교통법 전문 <b>AI 챗봇 서비스</b>입니다.<br/>
            RAG 기반의 정확한 법률 정보 제공과<br/>
            LLM을 활용한 <b>지능형 신고 시스템</b>을<br/>
            제공합니다.
          </div>
        </div>

        {/* 2. 핵심 특징 카드 */}
        <div className="analytics-card" style={{ 
          background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
          border: '1px solid var(--success-light)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: 'var(--success-green)', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            핵심 특징
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'var(--success-green)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', flexShrink: 0
              }}>1</div>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>도로교통법 전문 AI 상담</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'var(--success-green)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', flexShrink: 0
              }}>2</div>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>RAG 기반 정확한 정보 제공</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'var(--success-green)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', flexShrink: 0
              }}>3</div>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>실시간 영상 분석 및 신고</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '24px', height: '24px', borderRadius: '50%', 
                background: 'var(--success-green)', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', flexShrink: 0
              }}>4</div>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>자동 위치 기록 및 관리</span>
            </div>
          </div>
        </div>

        {/* 3. 버전 정보 */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Road Guardian
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
            Version 1.0.0 (Beta)
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            © 2026 Road Guardian. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;