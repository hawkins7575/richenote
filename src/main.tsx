import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/globals.css";
import { register as registerSW } from "./utils/serviceWorker";

// React 앱 렌더링
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Service Worker 등록 - 성능 최적화 및 오프라인 지원
if (import.meta.env.PROD) {
  registerSW({
    onSuccess: () => {
      console.log('✅ Service Worker가 성공적으로 등록되었습니다.');
      console.log('🚀 앱이 오프라인에서도 작동합니다.');
    },
    onUpdate: () => {
      console.log('🔄 새로운 앱 버전이 사용 가능합니다.');
      console.log('📱 모든 탭을 닫고 다시 열어주세요.');
      
      // 사용자에게 업데이트 알림 (선택적)
      const updateAvailable = confirm(
        '새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?\n(페이지가 새로고침됩니다)'
      );
      
      if (updateAvailable) {
        window.location.reload();
      }
    },
    onOffline: () => {
      console.log('📴 오프라인 모드입니다.');
      // 오프라인 알림 표시 (선택적)
    },
    onOnline: () => {
      console.log('🌐 온라인 상태로 돌아왔습니다.');
      // 온라인 복구 알림 (선택적)
    }
  });
} else {
  console.log('🔧 개발 모드에서는 Service Worker가 비활성화됩니다.');
}
