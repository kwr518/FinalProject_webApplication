# React 프론트엔드 설치 및 실행 가이드

## 1. 필요한 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
cd D:\projects\FianlProject_webApplication\frontend

# React Router 설치
npm install react-router-dom

# Tailwind CSS 설치
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 2. Tailwind CSS 설정

`tailwind.config.js` 파일을 다음과 같이 수정하세요:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

`src/index.css` 파일의 최상단에 다음 코드를 추가하세요:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 3. 서버 실행

### FastAPI 백엔드 실행
```bash
cd D:\fastapi
python run.py
# 또는
uvicorn app.main:app --reload --port 8000
```

### React 프론트엔드 실행
```bash
cd D:\projects\FianlProject_webApplication\frontend
npm start
```

## 4. 접속

- React 앱: http://192.168.0.40:3000
- FastAPI 백엔드: http://192.168.0.40:8000
- FastAPI 문서: http://192.168.0.40:8000/docs

## 5. 주요 기능

### 대시보드 (/)
- AI가 감지한 교통 위반 로그를 실시간으로 표시
- 10초마다 자동 갱신
- 차량 번호판, 위반 유형, 시간, 영상 링크 표시

### AI 법률 상담 (/support)
- 교통법규에 대한 질문 가능
- "신고 초안 작성해줘" 입력 시 신고서 초안 생성
- LLM 기반 실시간 대화

### 마이페이지 (/mypage)
- 비디오 파일 업로드
- 사용자 정보 관리

## 문제 해결

### CORS 오류가 발생하는 경우
FastAPI의 `app/main.py`에 CORS 설정이 제대로 되어있는지 확인하세요.

### 백엔드 연결 실패
- FastAPI 서버가 실행 중인지 확인
- 포트 번호가 8000인지 확인
- `src/services/api.js`의 API_BASE_URL 확인

### Tailwind CSS가 작동하지 않는 경우
- `tailwind.config.js` 파일의 content 경로 확인
- `src/index.css`에 Tailwind 지시문이 있는지 확인
- 개발 서버를 재시작
