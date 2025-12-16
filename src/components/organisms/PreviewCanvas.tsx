import React, { useRef, useEffect, useState } from 'react';
// types.ts から必要な定数と型を正しくインポート
import { PAGE_SIZES } from '../../types/index'; // 👈 index.tsを参照
import type { LayoutConfig, PageSizeKey, CsvRow } from '../../types/index'; // 👈 index.tsを参照

interface PreviewCanvasProps {
  pageSizeKey: PageSizeKey;
  bgImage: string | null;
  csvData: CsvRow[];
  layout: Record<string, LayoutConfig>;
  setLayout: React.Dispatch<React.SetStateAction<Record<string, LayoutConfig>>>;
  previewScale: number;
  setPreviewScale: (scale: number) => void;
  showCenterGuide: boolean;
  showMarginGuide: boolean;
}

// リサイズハンドルの位置定義
type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se';

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  pageSizeKey,
  bgImage,
  csvData,
  layout,
  setLayout,
  previewScale,
  setPreviewScale,
  showCenterGuide, // 👈 警告解消のため、後で利用されます
  showMarginGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageSize = PAGE_SIZES[pageSizeKey];
  
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [interactionMode, setInteractionMode] = useState<'move' | 'resize' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialLayout, setInitialLayout] = useState<LayoutConfig | null>(null);
  const [isSnapped, setIsSnapped] = useState(false); // 👈 警告解消のため、後で利用されます

  // 👈 警告解消のため、後で利用されます
  const previewRow = csvData.length > 0 ? csvData[0] : {}; 
  const SNAP_THRESHOLD = 10;

  // mmをptに変換するヘルパー関数
  const mmToPt = (mm: number) => mm * 2.83465;

  // 自動スケール調整 (既存ロジック)
  useEffect(() => {
    if (containerRef.current) {
      const wrapper = containerRef.current.parentElement;
      const parent = wrapper?.parentElement;
      if (parent) {
        const scaleW = (parent.clientWidth - 40) / pageSize.widthPt;
        const scaleH = (parent.clientHeight - 40) / pageSize.heightPt;
        const newScale = Math.min(scaleW, scaleH, 1.2);
        setPreviewScale(newScale);
      }
    }
  }, [pageSize, setPreviewScale]);

  // ウィンドウ全体での操作処理（移動 & リサイズ）
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!activeKey || !interactionMode || !initialLayout) return;
      e.preventDefault();

      const deltaX = (e.clientX - dragStart.x) / previewScale;
      const deltaY = (e.clientY - dragStart.y) / previewScale;

      setLayout(prev => {
        const item = { ...initialLayout };
        const pageCenterX = pageSize.widthPt / 2;
        
        if (interactionMode === 'move') {
          let newX = item.x + deltaX;
          let newY = item.y + deltaY;

          const itemCenterX = newX + (item.width / 2);
          if (Math.abs(itemCenterX - pageCenterX) < SNAP_THRESHOLD) {
            newX = pageCenterX - (item.width / 2);
          }

          return {
            ...prev,
            [activeKey]: { ...prev[activeKey], x: Math.round(newX), y: Math.round(newY) }
          };
        } else if (interactionMode === 'resize' && resizeHandle) {
          let newX = item.x;
          let newY = item.y;
          let newW = item.width;
          let newH = item.height;

          if (resizeHandle.includes('e')) newW = Math.max(20, item.width + deltaX);
          if (resizeHandle.includes('s')) newH = Math.max(20, item.height + deltaY);
          if (resizeHandle.includes('w')) {
            const wDiff = Math.min(item.width - 20, deltaX);
            newX += wDiff;
            newW -= wDiff;
          }
          if (resizeHandle.includes('n')) {
            const hDiff = Math.min(item.height - 20, deltaY);
            newY += hDiff;
            newH -= hDiff;
          }

          return {
            ...prev,
            [activeKey]: { ...prev[activeKey], x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) }
          };
        }
        return prev;
      });
      
      if (activeKey && interactionMode === 'move') {
        const currentItem = layout[activeKey];
        const itemCenterX = currentItem.x + (currentItem.width / 2);
        const pageCenterX = pageSize.widthPt / 2;
        setIsSnapped(Math.abs(itemCenterX - pageCenterX) < SNAP_THRESHOLD);
      }
    };

    const handleWindowMouseUp = () => {
      setInteractionMode(null);
      setResizeHandle(null);
      setInitialLayout(null);
      setIsSnapped(false);
    };

    if (interactionMode) {
      window.addEventListener('mousemove', handleWindowMouseMove);
      window.addEventListener('mouseup', handleWindowMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [activeKey, interactionMode, resizeHandle, dragStart, initialLayout, previewScale, pageSize, setLayout, layout]);


  // ▼▼▼ 警告解消: handleMoveStart を変数として定義し、後で利用されます ▼▼▼
  const handleMoveStart = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(key);
    setInteractionMode('move');
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout[key]);
  };
  // ▲▲▲


  // ▼▼▼ 警告解消: handleResizeStart を変数として定義し、後で利用されます ▼▼▼
  const handleResizeStart = (e: React.MouseEvent, key: string, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(key);
    setInteractionMode('resize');
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout[key]);
  };
  // ▲▲▲


  return (
    <div className="relative flex items-center justify-center select-none">
      <div
        ref={containerRef}
        // ここが描画の核となる要素。サイズを保証
        className="relative bg-white shadow-lg overflow-hidden" 
        style={{
          width: pageSize.widthPt,
          height: pageSize.heightPt,
          transform: `scale(${previewScale})`,
          transformOrigin: 'center center',
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onMouseDown={() => setActiveKey(null)}
      >
        {/* 印刷余白ガイドの描画 (showMarginGuideを利用) */}
        {showMarginGuide && (
          <>
            <div className="absolute inset-y-0 left-0 export-hidden pointer-events-none z-0 border-r-2 border-dashed border-red-500 opacity-60"
              style={{ width: mmToPt(pageSize.margin.innerMm) }}
            />
            <div className="absolute inset-y-0 right-0 export-hidden pointer-events-none z-0 border-l-2 border-dashed border-red-500 opacity-60"
              style={{ width: mmToPt(pageSize.margin.innerMm) }}
            />
            <div className="absolute inset-x-0 top-0 export-hidden pointer-events-none z-0 border-b-2 border-dashed border-red-500 opacity-60"
              style={{ height: mmToPt(pageSize.margin.topBottomMm) }}
            />
            <div className="absolute inset-x-0 bottom-0 export-hidden pointer-events-none z-0 border-t-2 border-dashed border-red-500 opacity-60"
              style={{ height: mmToPt(pageSize.margin.topBottomMm) }}
            />
          </>
        )}

        {/* センターガイド（青線）の描画 (showCenterGuideを利用) */}
        {showCenterGuide && (
          <div className="absolute inset-0 flex justify-center export-hidden pointer-events-none">
            <div className="h-full w-px bg-blue-300 opacity-40"></div>
          </div>
        )}

        {/* スナップ時の動的ガイド（赤線）の描画 (isSnappedを利用) */}
        {isSnapped && interactionMode === 'move' && (
          <div className="absolute inset-0 flex justify-center export-hidden pointer-events-none z-40">
            <div className="h-full w-px bg-red-500 shadow-[0_0_4px_rgba(255,0,0,0.5)]"></div>
          </div>
        )}

        {Object.keys(layout).map((key) => {
          const item = layout[key];
          // 👈 警告解消: previewRowを利用
          const text = previewRow[item.label] || item.label; 
          const isSelected = activeKey === key;

          return (
            <div
              key={key}
              className={`absolute group ${isSelected ? 'z-30' : 'z-10'}`}
              style={{
                left: item.x,
                top: item.y,
                width: item.width,
                height: item.height,
              }}
              // 👈 警告解消: handleMoveStartを利用
              onMouseDown={(e) => handleMoveStart(e, key)} 
            >
              {/* テキスト表示 */}
              <div
                data-layout-key={key} 
                className="w-full h-full whitespace-pre-wrap break-words pointer-events-none"
                style={{
                  fontSize: item.size,
                  color: item.color,
                  textAlign: item.align,
                  lineHeight: 1.4,
                  fontFamily: '"Noto Sans JP", sans-serif',
                }}
              >
                {text}
              </div>

              {/* 枠線 */}
              <div 
                className={`
                  absolute inset-0 border-2 transition-colors export-hidden pointer-events-none
                  ${isSelected ? 'border-purple-600 border-solid' : 'border-gray-300 border-dashed hover:border-purple-300'}
                `}
              />
              
              {/* リサイズハンドル（選択時のみ・操作可能） */}
              {isSelected && (
                <>
                  <div 
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nw-resize export-hidden z-40"
                    // 👈 警告解消: handleResizeStartを利用
                    onMouseDown={(e) => handleResizeStart(e, key, 'nw')}
                  />
                  <div 
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-ne-resize export-hidden z-40"
                    // 👈 警告解消: handleResizeStartを利用
                    onMouseDown={(e) => handleResizeStart(e, key, 'ne')}
                  />
                  <div 
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-sw-resize export-hidden z-40"
                    // 👈 警告解消: handleResizeStartを利用
                    onMouseDown={(e) => handleResizeStart(e, key, 'sw')}
                  />
                  <div 
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-se-resize export-hidden z-40"
                    // 👈 警告解消: handleResizeStartを利用
                    onMouseDown={(e) => handleResizeStart(e, key, 'se')}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ズーム率バッジ */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-70 export-hidden">
        {Math.round(previewScale * 100)}%
      </div>
    </div>
  );
};
