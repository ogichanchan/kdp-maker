import React, { useRef, useEffect, useState } from 'react';
import { PAGE_SIZES } from '../../types';
import type { LayoutConfig, PageSizeKey, CsvRow } from '../../types';

interface PreviewCanvasProps {
  pageSizeKey: PageSizeKey;
  bgImage: string | null;
  csvData: CsvRow[];
  layout: Record<string, LayoutConfig>;
  setLayout: React.Dispatch<React.SetStateAction<Record<string, LayoutConfig>>>;
  previewScale: number;
  setPreviewScale: (scale: number) => void;
  showCenterGuide: boolean;
  setShowCenterGuide: (show: boolean) => void;
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
  showCenterGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageSize = PAGE_SIZES[pageSizeKey];
  
  // 操作状態の管理
  const [activeKey, setActiveKey] = useState<string | null>(null); // 現在選択中のアイテム
  const [interactionMode, setInteractionMode] = useState<'move' | 'resize' | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // マウス開始位置
  const [initialLayout, setInitialLayout] = useState<LayoutConfig | null>(null); // 操作開始時のアイテム状態
  const [isSnapped, setIsSnapped] = useState(false); // 中央に吸着中かどうか

  const previewRow = csvData.length > 0 ? csvData[0] : {};
  const SNAP_THRESHOLD = 10; // 吸着する距離（ピクセル）

  // 自動スケール調整
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

  // ▼▼▼ ウィンドウ全体での操作処理（移動 & リサイズ） ▼▼▼
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!activeKey || !interactionMode || !initialLayout) return;
      e.preventDefault();

      // 現在のマウス位置（スケール考慮なしの移動量計算用）
      // ※移動量はスケールで割って補正する
      const deltaX = (e.clientX - dragStart.x) / previewScale;
      const deltaY = (e.clientY - dragStart.y) / previewScale;

      setLayout(prev => {
        const item = { ...initialLayout }; // 初期状態から計算
        const pageCenterX = pageSize.widthPt / 2;
        let snapped = false;

        if (interactionMode === 'move') {
          // --- 移動処理 ---
          let newX = item.x + deltaX;
          let newY = item.y + deltaY;

          // センターへのスナップ計算
          const itemCenterX = newX + (item.width / 2);
          if (Math.abs(itemCenterX - pageCenterX) < SNAP_THRESHOLD) {
            newX = pageCenterX - (item.width / 2);
            snapped = true;
          }

          return {
            ...prev,
            [activeKey]: { ...prev[activeKey], x: Math.round(newX), y: Math.round(newY) }
          };
        } else if (interactionMode === 'resize' && resizeHandle) {
          // --- リサイズ処理 ---
          let newX = item.x;
          let newY = item.y;
          let newW = item.width;
          let newH = item.height;

          // ハンドルごとの計算
          if (resizeHandle.includes('e')) newW = Math.max(20, item.width + deltaX);
          if (resizeHandle.includes('s')) newH = Math.max(20, item.height + deltaY);
          if (resizeHandle.includes('w')) {
            const wDiff = Math.min(item.width - 20, deltaX); // 幅がマイナスにならないように
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
        setIsSnapped(snapped);
        return prev;
      });
      
      // 移動モードのときだけスナップ判定結果を反映
      if (interactionMode === 'move') {
        const currentItem = layout[activeKey];
        const itemCenterX = currentItem.x + (currentItem.width / 2);
        const pageCenterX = pageSize.widthPt / 2;
        setIsSnapped(Math.abs(itemCenterX - pageCenterX) < 1); // ほぼ0ならスナップ表示
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

  // 移動開始
  const handleMoveStart = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(key);
    setInteractionMode('move');
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout[key]);
  };

  // リサイズ開始
  const handleResizeStart = (e: React.MouseEvent, key: string, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveKey(key);
    setInteractionMode('resize');
    setResizeHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialLayout(layout[key]);
  };

  return (
    <div className="relative flex items-center justify-center select-none">
      <div
        ref={containerRef}
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
        onMouseDown={() => setActiveKey(null)} // 背景クリックで選択解除
      >
        {/* 常時表示のセンターガイド（設定でONのとき） */}
        {showCenterGuide && (
          <div className="absolute inset-0 flex justify-center export-hidden pointer-events-none">
            <div className="h-full w-px bg-blue-300 opacity-40"></div>
          </div>
        )}

        {/* スナップ時の動的ガイド（赤線） */}
        {isSnapped && (
          <div className="absolute inset-0 flex justify-center export-hidden pointer-events-none z-40">
            <div className="h-full w-px bg-red-500 shadow-[0_0_4px_rgba(255,0,0,0.5)]"></div>
          </div>
        )}

        {Object.keys(layout).map((key) => {
          const item = layout[key];
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
              // ここで移動開始
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

              {/* 枠線: 通常は薄い点線、選択時は実線 */}
              <div 
                className={`
                  absolute inset-0 border-2 transition-colors export-hidden pointer-events-none
                  ${isSelected ? 'border-purple-600 border-solid' : 'border-gray-300 border-dashed hover:border-purple-300'}
                `}
              />
              
              {/* リサイズハンドル（選択時のみ・操作可能） */}
              {isSelected && (
                <>
                  {/* 四隅のハンドルにイベントを設定 */}
                  <div 
                    className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nw-resize export-hidden z-40"
                    onMouseDown={(e) => handleResizeStart(e, key, 'nw')}
                  />
                  <div 
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-ne-resize export-hidden z-40"
                    onMouseDown={(e) => handleResizeStart(e, key, 'ne')}
                  />
                  <div 
                    className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-sw-resize export-hidden z-40"
                    onMouseDown={(e) => handleResizeStart(e, key, 'sw')}
                  />
                  <div 
                    className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-se-resize export-hidden z-40"
                    onMouseDown={(e) => handleResizeStart(e, key, 'se')}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ズーム率 */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-70 export-hidden">
        {Math.round(previewScale * 100)}%
      </div>
    </div>
  );
};
