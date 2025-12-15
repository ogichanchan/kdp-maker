import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import type { LayoutConfig } from '../../types';

interface StyleRowProps {
  id: string;
  config: LayoutConfig;
  onChange: (key: string, field: keyof LayoutConfig, value: any) => void;
}

export const StyleRow: React.FC<StyleRowProps> = ({ id, config, onChange }) => {
  return (
    <div className="bg-white border rounded p-2 text-sm shadow-sm">
      <div className="flex justify-between mb-2">
        <span className="font-bold text-xs bg-gray-100 px-1 rounded flex items-center">{config.label}</span>
        <div className="flex gap-1">
          {[
            { val: 'left', icon: AlignLeft },
            { val: 'center', icon: AlignCenter },
            { val: 'right', icon: AlignRight }
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => onChange(id, 'align', opt.val)}
              className={`p-1 rounded ${config.align === opt.val ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              <opt.icon className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>
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
        />
      </div>
    </div>
  );
};
