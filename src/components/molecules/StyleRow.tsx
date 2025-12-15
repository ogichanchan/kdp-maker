import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'; // Trash2追加
import type { LayoutConfig } from '../../types';

interface StyleRowProps {
  id: string;
  config: LayoutConfig;
  onChange: (key: string, field: keyof LayoutConfig, value: any) => void;
  onDelete: (key: string) => void; // 追加
}

export const StyleRow: React.FC<StyleRowProps> = ({ id, config, onChange, onDelete }) => {
  return (
    <div className="bg-white border rounded p-2 text-sm shadow-sm group">
      {/* 上段：ラベル編集と削除ボタン */}
      <div className="flex justify-between items-center mb-2 gap-2">
        {/* ラベル編集入力欄 */}
        <input
          type="text"
          value={config.label}
          onChange={(e) => onChange(id, 'label', e.target.value)}
          className="font-bold text-xs bg-gray-50 border-b border-transparent focus:border-purple-500 focus:bg-white outline-none px-1 py-0.5 rounded w-full transition-colors"
          placeholder="項目名 (CSV列名)"
        />
        
        {/* 整列ボタン */}
        <div className="flex gap-1 shrink-0">
          {[
            { val: 'left', icon: AlignLeft },
            { val: 'center', icon: AlignCenter },
            { val: 'right', icon: AlignRight }
          ].map((opt: any) => (
            <button
              key={opt.val}
              onClick={() => onChange(id, 'align', opt.val)}
              className={`p-1 rounded ${config.align === opt.val ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-50'}`}
              title="配置"
            >
              <opt.icon className="w-3 h-3" />
            </button>
          ))}
          {/* 削除ボタン */}
          <button 
            onClick={() => onDelete(id)}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
            title="削除"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 下段：サイズと色 */}
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={config.size}
            onChange={(e) => onChange(id, 'size', Number(e.target.value))}
            className="w-12 border rounded px-1 text-xs py-1"
            title="文字サイズ"
          />
          <span className="text-[10px] text-gray-400">px</span>
        </div>
        <input
          type="color"
          value={config.color}
          onChange={(e) => onChange(id, 'color', e.target.value)}
          className="w-6 h-6 border rounded cursor-pointer p-0 ml-auto"
          title="文字色"
        />
      </div>
    </div>
  );
};
