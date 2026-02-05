// FastAPI 백엔드와 통신하는 API 서비스

const API_BASE_URL = 'http://192.168.0.40:8000';

// 교통 위반 로그 가져오기
export const getViolationLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/logs`);
    if (!response.ok) {
      throw new Error('로그 조회 실패');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

// LLM 챗봇 질문하기
export const askChatbot = async (question) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question })
    });
    
    if (!response.ok) {
      throw new Error('챗봇 요청 실패');
    }
    
    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('Error asking chatbot:', error);
    throw error;
  }
};

// 비디오 업로드
export const uploadVideo = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload-video`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '비디오 업로드 실패');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};
