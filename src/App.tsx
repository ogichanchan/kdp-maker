import React, { useState } from 'react';
import Papa from 'papaparse';
import type { PageSizeKey, LayoutConfig, CsvRow } from './types';
import { SettingsPanel } from './components/organisms/SettingsPanel';
import { PreviewCanvas } from './components/organisms/PreviewCanvas';
import { usePdfGenerator } from './hooks/usePdfGenerator';

const App: React.FC = () => {
  // --- 状態管理 ---
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [pageSizeKey, setPageSizeKey] = useState<PageSizeKey>('6x9');
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const [previewScale, setPreviewScale] = useState(1.0);

  // レイアウト設定初期値
  const [layout, setLayout] = useState<Record<string, LayoutConfig>>({
    korean: { label: '韓国語', x: 20, y: 150, width: 390, height: 80, size: 50, color: '#000000', align: 'center' },
    yomi:   { label: '読み',   x: 20, y: 230, width: 390, height: 40, size: 18, color: '#666666', align: 'center' },
    meaning:{ label: '意味',   x: 20, y: 280, width: 390, height: 60, size: 28, color: '#ff0066', align: 'center' },
    exp:    { label: '解説',   x: 40, y: 400, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
    example:{ label: '例文',   x: 40, y: 520, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
  });

  // --- PDF生成フック ---
  const { generatePDF } = usePdfGenerator({ bgImage, csvData, pageSizeKey, layout });

  // --- イベントハンドラ ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') setBgImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        // エラー許容設定（必要に応じて）
        // transformHeader: (h) => h.trim(), 
        complete: (results) => {
          // 1. パースエラーのチェック
          if (results.errors.length > 0) {
            console.error("CSV Parse Errors:", results.errors);
            alert(`CSV読み込みエラー: ${results.errors.length}件の問題があります。\nF12キーでコンソールを確認してください。`);
          }
          
          // 2. データの中身をログ出力（デバッグ用）
          console.log("Loaded CSV Data:", results.data);
          
          // 3. データが空の場合の警告
          if (results.data.length === 0) {
            alert("CSVデータが空です。正しいファイルか確認してください。");
            return;
          }

          setCsvData(results.data);
        },
        error: (err) => {
          console.error("File Read Error:", err);
          alert(`ファイル読み込み失敗: ${err.message}`);
        }
      });
    }
  };

  const handleStyleChange = (key: string, field: keyof LayoutConfig, value: any) => {
    setLayout(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800">
      {/* 左サイドバー：設定パネル */}
      <SettingsPanel 
        pageSizeKey={pageSizeKey}
        setPageSizeKey={setPageSizeKey}
        onImageUpload={handleImageUpload}
        onCSVUpload={handleCSVUpload}
        layout={layout}
        onStyleChange={handleStyleChange}
        onGeneratePDF={generatePDF}
      />

      {/* 右エリア：プレビューキャンバス */}
      <PreviewCanvas 
        pageSizeKey={pageSizeKey}
        bgImage={bgImage}
        csvData={csvData}
        layout={layout}
        setLayout={setLayout}
        previewScale={previewScale}
        setPreviewScale={setPreviewScale}
        showCenterGuide={showCenterGuide}
        setShowCenterGuide={setShowCenterGuide}
      />
    </div>
  );
};

export default App;
