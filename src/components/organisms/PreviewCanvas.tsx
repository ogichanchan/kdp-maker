import React, { useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { PAGE_SIZES } from '../../types';
import type { PageSizeKey, LayoutConfig, CsvRow } from '../../types';

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

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  pageSizeKey,
  bgImage,
  csvData,
  layout,
  setLayout,
  previewScale,
  setPreviewScale,
  showCenterGuide,
  setShowCenterGuide,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentSize = PAGE_SIZES[pageSizeKey];

  // レスポンシブ対応
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const targetWidth = PAGE_SIZES[pageSizeKey].widthPt;
        const targetHeight = PAGE_SIZES[pageSizeKey].heightPt;
        const scaleX = (containerWidth - 40) / targetWidth;
        const scaleY = (containerHeight - 40) / targetHeight;
        setPreviewScale(Math.min(scaleX, scaleY, 1.0));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [pageSizeKey, setPreviewScale]);

  // ドラッグ処理（吸着ロジック）
  const handleDrag = (_e: any, d: any, key: string) => {
    const pageWidth = PAGE_SIZES[pageSizeKey].widthPt;
    const itemWidth = layout[key].width;
    const pageCenterX = pageWidth / 2;
    const currentItemCenterX = d.x + (itemWidth / 2);
    const dist = Math.abs(currentItemCenterX - pageCenterX);
    
    let nextX = d.x;
    const SNAP_THRESHOLD = 5;

    if (dist <= SNAP_THRESHOLD) {
      nextX = pageCenterX - (itemWidth / 2);
      setShowCenterGuide(true);
    } else {
      setShowCenterGuide(false);
    }

    setLayout(prev => ({
      ...prev,
      [key]: { ...prev[key], x: nextX, y: d.y }
    }));
  };

  const handleResizeStop = (_e: any, _dir: any, ref: any, _delta: any, position: any, key: string) => {
    setLayout(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
        ...position, 
      }
    }));
  };

  return (
    <div ref={containerRef} className="flex-1 bg-gray-200 relative overflow-hidden flex items-center justify-center p-4 md:h-full h-2/3">
      {/* Canvas Wrapper */}
      <div 
        className="bg-white shadow-2xl relative transition-transform duration-200 ease-out"
        style={{ 
          width: `${currentSize.widthPt}px`,
          height: `${currentSize.heightPt}px`,
          transform: `scale(${previewScale})`,
        }}
      >
        {/* Background */}
        {bgImage && <img src={bgImage} alt="bg" className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none" />}
        
        {/* Center Guide */}
        {showCenterGuide && (
          <div 
            style={{
              position: 'absolute',
              top: 0, bottom: 0, left: '50%', width: 0,
              borderLeft: '2px dashed #ef4444',
              transform: 'translateX(-1px)',
              zIndex: 50,
              pointerEvents: 'none',
            }} 
          />
        )}

        {/* Draggable Items */}
        {Object.keys(layout).map(key => (
          <Rnd
            key={key}
            size={{ width: layout[key].width, height: layout[key].height }}
            position={{ x: layout[key].x, y: layout[key].y }}
            onDrag={(e, d) => handleDrag(e, d, key)}
            onDragStop={() => setShowCenterGuide(false)}
            onResizeStop={(e, dir, ref, delta, pos) => handleResizeStop(e, dir, ref, delta, pos, key)}
            bounds="parent"
            scale={previewScale}
            className={`hover:border-2 hover:border-purple-400 group transition-colors ${showCenterGuide ? 'z-40' : 'z-10'}`}
            resizeHandleStyles={{
              bottomRight: { cursor: 'se-resize', width: '12px', height: '12px', background: '#9333ea', borderRadius: '50%', right: '-6px', bottom: '-6px' }
            }}
          >
            <div 
              className="w-full h-full flex items-start overflow-hidden cursor-move hover:bg-purple-50/10"
              style={{
                fontSize: `${layout[key].size}px`,
                color: layout[key].color,
                justifyContent: layout[key].align === 'left' ? 'flex-start' : layout[key].align === 'right' ? 'flex-end' : 'center',
                textAlign: layout[key].align,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.4,
                padding: '4px',
                border: '1px dashed rgba(0,0,0,0.1)',
              }}
            >
              {csvData.length > 0 ? csvData[0][layout[key].label] : layout[key].label}
            </div>
          </Rnd>
        ))}
      </div>

      {/* Scale Indicator */}
      <div className="absolute bottom-6 right-6 bg-gray-800/80 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-mono shadow-lg pointer-events-none">
        {Math.round(previewScale * 100)}%
      </div>
    </div>
  );
};
