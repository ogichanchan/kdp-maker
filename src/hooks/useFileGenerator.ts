import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useCallback, type RefObject } from 'react';

import { loadFontToBase64 } from '../utils/fontLoader';

// ▼▼▼ 修正箇所: PAGE_SIZES は値なので、型定義と分けてインポートします ▼▼▼
import { PAGE_SIZES } from '../types';
import type { PageSizeKey, LayoutConfig, CsvRow } from '../types';
// ▲▲▲ 修正ここまで ▲▲▲

interface UseFileGeneratorProps {
  bgImage: string | null;
  csvData: CsvRow[];
  pageSizeKey: PageSizeKey;
  layout: Record<string, LayoutConfig>;
  previewRef: RefObject<HTMLDivElement | null>;
}

export type FileType = 'pdf' | 'png' | 'jpeg';

export const useFileGenerator = ({ bgImage, csvData, pageSizeKey, layout, previewRef }: UseFileGeneratorProps) => {
  
  // PDF生成（既存ロジック）
  const generatePDF = useCallback(async () => {
    if (csvData.length === 0) {
      alert("CSVデータがありません。");
      return;
    }
    const ps = PAGE_SIZES[pageSizeKey]; // ★ここでpsの型がPageSizeとなり、marginは存在します
    
    try {
      // ... (中略: PDF生成ロジック) ...
      const doc = new jsPDF({ unit: 'pt', format: [ps.widthPt, ps.heightPt] });
      // フォント読み込み
      const fontUrl = '/fonts/NotoSansKR-Regular.ttf'; 
      try {
        const fontName = 'CustomFont';
        const fontBase64 = await loadFontToBase64(fontUrl);
        doc.addFileToVFS('CustomFont.ttf', fontBase64);
        doc.addFont('CustomFont.ttf', fontName, 'normal');
        doc.setFont(fontName);
      } catch (e) {
        console.error("Font Load Error", e);
      }

      csvData.forEach((row, index) => {
        try {
          if (index > 0) doc.addPage();
          if (bgImage) doc.addImage(bgImage, 'PNG', 0, 0, ps.widthPt, ps.heightPt);

          Object.keys(layout).forEach(key => {
            const item = layout[key];
            const text = row[item.label];
            doc.setFontSize(item.size);
            doc.setTextColor(item.color);
            let pdfX = item.x;
            if (item.align === 'center') pdfX = item.x + (item.width / 2);
            else if (item.align === 'right') pdfX = item.x + item.width;

            doc.text(String(text || ''), pdfX, item.y + item.size, {
              maxWidth: item.width, align: item.align, lineHeightFactor: 1.4, baseline: 'bottom'
            });
          });
        } catch (err) { console.error(err); }
      });
      doc.save('wordbook.pdf');
    } catch (e) {
      alert(`PDF作成エラー: ${e}`);
    }
  }, [bgImage, csvData, pageSizeKey, layout]);

  // 画像ZIP生成（既存ロジック）
  const generateImagesZip = useCallback(async (type: 'png' | 'jpeg') => {
    if (!previewRef.current) return;
    if (csvData.length === 0) {
      alert("データがありません");
      return;
    }
    
    // キャプチャ対象の要素
    const element = previewRef.current.querySelector('.preview-wrapper') as HTMLElement;
    if (!element) return;

    const zip = new JSZip();
    const folder = zip.folder("wordbook_images");
    
    const confirmMsg = `${csvData.length}枚の画像を生成します。時間がかかる場合がありますがよろしいですか？`;
    if (!confirm(confirmMsg)) return;

    try {
      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];

        // 1. DOM上のテキストを一時的に書き換え
        Object.keys(layout).forEach(key => {
          const targetEl = element.querySelector(`[data-layout-key="${key}"]`);
          if (targetEl) {
            targetEl.textContent = row[layout[key].label] || '';
          }
        });

        // 2. html2canvasで撮影
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          onclone: (clonedDoc) => {
            const hiddenElements = clonedDoc.querySelectorAll('.export-hidden');
            hiddenElements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });
          }
        });

        // 3. ZIPに追加
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, `image/${type}`));
        if (blob && folder) {
          const fileName = `card_${String(i + 1).padStart(3, '0')}.${type}`;
          folder.file(fileName, blob);
        }
      }

      // 4. 元の表示（1行目）に戻す
      if (csvData.length > 0) {
        const firstRow = csvData[0];
        Object.keys(layout).forEach(key => {
          const targetEl = element.querySelector(`[data-layout-key="${key}"]`);
          if (targetEl) {
            targetEl.textContent = firstRow[layout[key].label] || '';
          }
        });
      }

      // 5. ダウンロード
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "wordbook_images.zip");

    } catch (e) {
      console.error(e);
      alert("画像生成中にエラーが発生しました");
    }
  }, [previewRef, csvData, layout]);

  const generateFile = (type: FileType) => {
    if (type === 'pdf') {
      generatePDF();
    } else {
      generateImagesZip(type);
    }
  };

  return { generateFile };
};
