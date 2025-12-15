import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// JSONファイルを直接インポートしてバンドルに含めます
import ja from './locales/ja.json';
import en from './locales/en.json';

// i18nの初期化設定
i18n
  .use(LanguageDetector) // ブラウザの言語設定を検知する
  .use(initReactI18next) // Reactと紐付ける（★ここがエラーの原因でした）
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en }
    },
    fallbackLng: 'ja', // 言語が特定できない場合は日本語
    debug: true,       // コンソールに詳細ログを出す（開発用）
    
    interpolation: {
      escapeValue: false // ReactはXSS対策済みなのでエスケープ不要
    }
  });

export default i18n;
