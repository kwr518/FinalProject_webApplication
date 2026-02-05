import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ReportContext = createContext();

export const useReport = () => useContext(ReportContext);

export const ReportProvider = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]); 

  // 1. DB 목록 불러오기
  const fetchReports = useCallback(async () => {
    if (!user || !user.history_id) return;
    try {
      const res = await fetch(`http://192.168.0.40:8080/api/my-reports?userId=${user.history_id}`);
      if (res.ok) {
        let dbData = await res.json();
        
        // 데이터가 없거나 에러일 경우 빈 배열 처리 (map 에러 방지)
        if (!dbData || !Array.isArray(dbData)) {
            dbData = []; 
        }
        
        setReports(prev => {
          // ★ 중요: 현재 "진행 중"인 것만 남기고 나머지는 DB 데이터로 교체
          // (이미 완료된 임시 카드는 아래 uploadVideo에서 지워짐)
          const processingItems = prev.filter(item => item.status === 'processing');
          
          const formattedDbItems = dbData.map(item => ({
            id: item.reportId,
            reportId: item.reportId,
            title: item.result || item.violationType || '분석 완료', 
            date: `${item.incidentDate} ${item.incidentTime}`,
            plate: item.plateNo || '식별불가',
            status: item.isSubmitted ? 'submitted' : 'complete',
            videoSrc: item.videoUrl, 
            desc: item.desc,
            violation: item.result || item.violationType,
            incidentDate: item.incidentDate,
            incidentTime: item.incidentTime,
            aiDraft: item.aiDraft,
            location: item.location
          }));

          // 분석 중인 항목을 맨 위로
          return [...processingItems, ...formattedDbItems].sort((a, b) => b.id - a.id);
        });
      }
    } catch (e) {
      console.error("목록 로드 실패:", e);
    }
  }, [user]);

  // 2. 영상 업로드
  const uploadVideo = async (file, saveToDevice, myDevice) => {
    let targetSerial = "WEB_UPLOAD";
    let uploadFile = file;

    if (saveToDevice && myDevice) {
        targetSerial = myDevice.serialNo;
    } else {
        const newFileName = `user_${user?.history_id || 'guest'}_${file.name}`;
        uploadFile = new File([file], newFileName, { type: file.type });
    }

    // [스피너 생성] 임시 항목 추가
    const tempId = Date.now(); // 고유 ID 생성
    const tempItem = {
      id: tempId, 
      title: 'AI 영상 분석 중...', 
      date: new Date().toLocaleString(),
      status: 'processing', 
      progressMsg: `분석 엔진 가동 중...`
    };

    setReports(prev => [tempItem, ...prev]);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("serial_no", targetSerial); 

      const res = await fetch('http://192.168.0.40:8000/api/analyze-video', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        // ★ [핵심 수정] 성공 시, 방금 만든 '분석 중' 카드를 제거함!
        // 이걸 안 하면 DB 데이터랑 겹쳐서 카드 2개가 뜸
        setReports(prev => prev.filter(item => item.id !== tempId));

        // DB 목록 새로고침 (진짜 결과 가져오기)
        setTimeout(() => fetchReports(), 500); 
      } else {
        throw new Error("분석 실패");
      }
    } catch (error) {
      console.error(error);
      // 에러 발생 시 상태를 error로 변경
      setReports(prev => prev.map(item => 
        item.id === tempId ? { ...item, status: 'error', title: '분석 실패', progressMsg: '서버 오류 발생' } : item
      ));
    }
  };

  // 3. 삭제
  const removeReport = async (id) => {
    try {
      const res = await fetch(`http://192.168.0.40:8080/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) { alert("삭제 오류"); }
  };

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <ReportContext.Provider value={{ reports, uploadVideo, removeReport, fetchReports }}>
      {children}
    </ReportContext.Provider>
  );
};
export default ReportProvider;