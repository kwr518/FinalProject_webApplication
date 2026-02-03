import React from 'react';

const About = () => {
  return (
    <div className="screen active">
      <div className="header">
<<<<<<< HEAD
        <h1>ℹ️ 정보</h1>
        <p>Road Guardian</p>
      </div>

      <div style={{ padding: '16px' }}>
        {/* 주요 기능 카드 */}
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, #F0F9FF 100%)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
            🚀 주요 기능
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            도로교통법 전문 AI 챗봇. RAG 기반 정확한 법률 정보 제공과 LLM을 활용한 지능형 신고 시스템.
=======
        <h1>ℹ️ 서비스 정보</h1>
        <p></p>
      </div>

      <div style={{ padding: '20px' }}>
        {/* 서비스 소개 카드 */}
        <div className="analytics-card" style={{ 
          background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
          border: '1px solid var(--border-light)',
          marginBottom: '16px'
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
            도로교통법 전문 AI 챗봇 서비스입니다.<br/>
            RAG 기반 정확한 법률 정보 제공과<br/>
            LLM을 활용한 지능형 신고 시스템을<br/>
            제공합니다.
>>>>>>> ui-partner/main
          </div>
        </div>

        {/* 특징 카드 */}
<<<<<<< HEAD
        <div className="analytics-card" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--success-green)', marginBottom: '8px' }}>
            ✨ 특징
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            1. 도로교통법 전문 AI 상담<br />
            2. RAG 기반 정확한 정보<br />
            3. 실시간 신고 시스템<br />
            4. 자동 위치 기록 및 분석
=======
        <div className="analytics-card" style={{ 
          background: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%)',
          border: '1px solid var(--success-light)',
          marginBottom: '16px'
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '700', 
            color: 'var(--success-green)', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>✨</span>
            핵심 특징
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)', 
            lineHeight: '2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'var(--success-green)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>1</span>
              <span style={{ fontWeight: '500' }}>도로교통법 전문 AI 상담</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'var(--success-green)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>2</span>
              <span style={{ fontWeight: '500' }}>RAG 기반 정확한 정보</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'var(--success-green)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>3</span>
              <span style={{ fontWeight: '500' }}>실시간 신고 시스템</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: 'var(--success-green)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700'
              }}>4</span>
              <span style={{ fontWeight: '500' }}>자동 위치 기록 및 분석</span>
            </div>
          </div>
        </div>

        {/* 버전 정보 */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            Version 1.0.0
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            © 2026 Road Guardian. All rights reserved.
>>>>>>> ui-partner/main
          </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default About;
=======
export default About;
>>>>>>> ui-partner/main
