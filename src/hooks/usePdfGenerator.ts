// src/hooks/usePdfGenerator.ts

import jsPDF from 'jspdf';
import { useCallback } from 'react';
import { PAGE_SIZES, type PageSizeKey, type LayoutConfig, type CsvRow } from '../types';
import { loadFontToBase64 } from '../utils/fontLoader';

interface UsePdfGeneratorProps {
  bgImage: string | null;
  csvData: CsvRow[];
  pageSizeKey: PageSizeKey;
  layout: Record<string, LayoutConfig>;
}

export const usePdfGenerator = ({ bgImage, csvData, pageSizeKey, layout }: UsePdfGeneratorProps) => {
  const generatePDF = useCallback(async () => {
    // データチェック
    if (csvData.length === 0) {
      alert("CSVデータがありません。アップロードしてください。");
      return;
    }

    const ps = PAGE_SIZES[pageSizeKey];
    
    try {
      const doc = new jsPDF({ unit: 'pt', format: [ps.widthPt, ps.heightPt] });

      // --- フォント読み込み ---
      // ★注意: 韓国語を表示するには、韓国語対応フォントが必要です！
      // 例: public/fonts/NotoSansKR-Regular.ttf
      const fontUrl = '/fonts/NotoSansKR-Regular.ttf'; // ← ここを韓国語対応フォントに変更推奨
      
      try {
        const fontName = 'CustomFont';
        const fontBase64 = await loadFontToBase64(fontUrl);
        doc.addFileToVFS('CustomFont.ttf', fontBase64);
        doc.addFont('CustomFont.ttf', fontName, 'normal');
        doc.setFont(fontName);
      } catch (fontErr) {
        console.error("Font Loading Error:", fontErr);
        alert("フォントファイルの読み込みに失敗しました。public/fontsフォルダを確認してください。");
        // 処理は続行しますが、文字化けする可能性があります
      }

      // --- PDF生成ループ ---
      csvData.forEach((row, index) => {
        try {
          if (index > 0) doc.addPage();
          
          if (bgImage) {
            doc.addImage(bgImage, 'PNG', 0, 0, ps.widthPt, ps.heightPt);
          }

          Object.keys(layout).forEach(key => {
            const item = layout[key];
            const text = row[item.label]; // 値を取得

            // ▼ データ欠損チェックログ
            // if (text === undefined || text === null || text === '') {
            //   console.warn(`[Row ${index + 1}] Column "${item.label}" is empty or missing.`);
            // }

            doc.setFontSize(item.size);
            doc.setTextColor(item.color);

            let pdfX = item.x;
            if (item.align === 'center') pdfX = item.x + (item.width / 2);
            else if (item.align === 'right') pdfX = item.x + item.width;

            doc.text(String(text || ''), pdfX, item.y + item.size, {
              maxWidth: item.width,
              align: item.align,
              lineHeightFactor: 1.4,
              baseline: 'bottom'
            });
          });
        } catch (rowErr) {
          console.error(`Error processing row ${index + 1}:`, rowErr);
          // 個別の行エラーで全体を止めない（ログだけ出す）
        }
      });
      
      doc.save('wordbook.pdf');
      console.log("PDF generated successfully.");

    } catch (e) {
      // 全体的なエラー（フォント設定ミスやメモリ不足など）
      console.error("PDF Generation Critical Error:", e);
      alert(`PDF作成中に重大なエラーが発生しました。\n詳細はコンソール(F12)を確認してください。\n${e}`);
    }
  }, [bgImage, csvData, pageSizeKey, layout]);

  return { generatePDF };
};
