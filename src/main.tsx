import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ReactGA from "react-ga4"; // ▼ 追加

// ▼▼▼ Google Analytics初期化 ▼▼▼
const gaId = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

if (gaId) {
  ReactGA.initialize(gaId);
  // 初回アクセス時のページビュー送信
  ReactGA.send({ 
    hitType: "pageview", 
    page: window.location.pathname + window.location.search 
  });
}
// ▲▲▲ 追加ここまで ▲▲▲

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
