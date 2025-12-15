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
    meaning:{ label: '日本語の意味',   x: 20, y: 280, width: 390, height: 60, size: 28, color: '#ff0066', align: 'center' },
    exp:    { label: 'ニュアンス・解説',   x: 40, y: 400, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
    example:{ label: '使える例文',   x: 40, y: 520, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
  });

  const { generatePDF } = usePdfGenerator({ bgImage, csvData, pageSizeKey, layout });

  // --- イベントハンドラ ---
  
  // ▼▼▼ 追加：不足していた関数 handleStyleChange ▼▼▼
  const handleStyleChange = (key: string, field: keyof LayoutConfig, value: any) => {
    setLayout(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };
  // ▲▲▲ 追加ここまで ▲▲▲

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
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV Parse Errors:", results.errors);
            alert(`CSV読み込みエラー: ${results.errors.length}件の問題があります。`);
          }
          if (results.data.length === 0) {
            alert("CSVデータが空です。");
            return;
          }
          setCsvData(results.data);
        },
        // ▼▼▼ 修正：err に :any を追加 ▼▼▼
        error: (err: any) => {
          console.error("File Read Error:", err);
          alert(`ファイル読み込み失敗: ${err.message}`);
        }
      });
    }
  };

  const handleSheetLoad = async (url: string) => {
    if (!url) {
      alert("URLを入力してください");
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();

      Papa.parse<CsvRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            alert("データが空です。正しい公開URLか確認してください。");
            return;
          }
          console.log("Sheet Data Loaded:", results.data);
          setCsvData(results.data);
          alert(`${results.data.length}件のデータを読み込みました！`);
        },
        // ▼▼▼ 修正：err に :any を追加 ▼▼▼
        error: (err: any) => {
          console.error("Parse Error:", err);
          alert("CSV解析に失敗しました。");
        }
      });
    } catch (e: any) {
      console.error("Fetch Error:", e);
      alert("データの取得に失敗しました。\n・URLが「ウェブに公開」されたCSVリンクか確認してください。\n・インターネット接続を確認してください。");
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans text-gray-800">
      <SettingsPanel 
        pageSizeKey={pageSizeKey}
        setPageSizeKey={setPageSizeKey}
        onImageUpload={handleImageUpload}
        onCSVUpload={handleCSVUpload}
        onSheetLoad={handleSheetLoad}
        layout={layout}
        onStyleChange={handleStyleChange} // 定義したのでエラーが消えます
        onGeneratePDF={generatePDF}
      />

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
