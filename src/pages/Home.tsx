import React, { useState, useRef } from 'react'; // useEffectを削除
import Papa from 'papaparse';
import { useTranslation } from 'react-i18next';
import type { PageSizeKey, LayoutConfig, CsvRow } from '../types';
import { SettingsPanel } from '../components/organisms/SettingsPanel';
import { PreviewCanvas } from '../components/organisms/PreviewCanvas';
import { useFileGenerator } from '../hooks/useFileGenerator';

export const Home: React.FC = () => {
  const { t } = useTranslation(); 

  // --- 状態管理 ---
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [pageSizeKey, setPageSizeKey] = useState<PageSizeKey>('6x9');
  const [showCenterGuide, setShowCenterGuide] = useState(false);
  const [previewScale, setPreviewScale] = useState(1.0);

  // レイアウト設定初期値
  // ※ポイント: ここで t() を使うのは「初期値」としてのみです。
  // 後から言語を変えても、ユーザーが設定した（またはCSVに合わせた）ラベルは維持されます。
  const [layout, setLayout] = useState<Record<string, LayoutConfig>>({
    korean: { label: '韓国語', x: 20, y: 150, width: 390, height: 80, size: 50, color: '#000000', align: 'center' },
    yomi:   { label: '読み',   x: 20, y: 230, width: 390, height: 40, size: 18, color: '#666666', align: 'center' },
    meaning:{ label: '日本語の意味',   x: 20, y: 280, width: 390, height: 60, size: 28, color: '#ff0066', align: 'center' },
    exp:    { label: 'ニュアンス・解説',   x: 40, y: 400, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
    example:{ label: '使える例文',   x: 40, y: 520, width: 350, height: 100, size: 14, color: '#333333', align: 'left' },
  });

  // ★以前あった「言語切り替えでレイアウトを強制更新するuseEffect」は削除しました★

  const previewAreaRef = useRef<HTMLDivElement>(null);
  const { generateFile } = useFileGenerator({ 
    bgImage, csvData, pageSizeKey, layout, previewRef: previewAreaRef 
  });

  // --- イベントハンドラ ---
  const handleStyleChange = (key: string, field: keyof LayoutConfig, value: any) => {
    setLayout(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleAddItem = () => {
    const newKey = `item_${Date.now()}`;
    setLayout(prev => ({
      ...prev,
      [newKey]: { 
        // 新規追加時のデフォルト名は翻訳してもOK（ユーザーが後で変えられるため）
        label: t('items.item_'), 
        x: 50, y: 50, width: 200, height: 50, size: 20, color: '#000000', align: 'left' 
      }
    }));
  };

  const handleDeleteItem = (key: string) => {
    if (Object.keys(layout).length <= 1) {
      alert("これ以上削除できません");
      return;
    }
    if (!window.confirm("この項目を削除しますか？")) return;
    setLayout(prev => {
      const newLayout = { ...prev };
      delete newLayout[key];
      return newLayout;
    });
  };

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
            console.error("CSV Errors:", results.errors);
            alert(`CSVエラー: ${results.errors.length}件`);
          }
          if (results.data.length === 0) {
            alert(t('common.alertCsvEmpty'));
            return;
          }
          setCsvData(results.data);
        },
        error: (err: any) => {
          console.error("File Read Error:", err);
          alert(`Error: ${err.message}`);
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
      if (!response.ok) throw new Error(response.statusText);
      const csvText = await response.text();
      Papa.parse<CsvRow>(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            alert("データが空です");
            return;
          }
          setCsvData(results.data);
          alert(`${results.data.length}件読み込みました`);
        },
        error: (err: any) => alert("CSV解析失敗")
      });
    } catch (e: any) {
      alert("取得失敗: URLを確認してください");
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
        onStyleChange={handleStyleChange}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onGenerateFile={generateFile} 
      />

      <div 
        ref={previewAreaRef} 
        className="flex-1 bg-gray-200 relative overflow-hidden flex items-center justify-center p-4 md:h-full h-2/3"
      >
         {/* 【次の修正への布石】
            画像出力時にUIパーツ（枠線など）が映り込む問題については、
            ここでクラス名を制御するか、useFileGenerator側で対処します。
            まずはデータ読み込み問題を解決しましょう。
         */}
         <div className="preview-wrapper inline-block shadow-2xl relative">
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
      </div>
    </div>
  );
};
