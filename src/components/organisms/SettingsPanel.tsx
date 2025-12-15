import React from 'react';
import { Upload, FileText, Download, Tablet } from 'lucide-react';
import { PAGE_SIZES, type PageSizeKey, type LayoutConfig } from '../../types';
import { FileInput } from '../atoms/FileInput';
import { StyleRow } from '../molecules/StyleRow';

interface SettingsPanelProps {
  pageSizeKey: PageSizeKey;
  setPageSizeKey: (key: PageSizeKey) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  layout: Record<string, LayoutConfig>;
  onStyleChange: (key: string, field: keyof LayoutConfig, value: any) => void;
  onGeneratePDF: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  pageSizeKey,
  setPageSizeKey,
  onImageUpload,
  onCSVUpload,
  layout,
  onStyleChange,
  onGeneratePDF,
}) => {
  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl shrink-0 h-1/3 md:h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
        <h1 className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Tablet className="w-5 h-5" />
          KDP Maker
        </h1>
        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full hidden md:block">iPad対応版</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">基本設定</h2>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={pageSizeKey}
              onChange={(e) => setPageSizeKey(e.target.value as PageSizeKey)}
              className="col-span-2 p-2 border rounded bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {Object.keys(PAGE_SIZES).map((key) => (
                <option key={key} value={key}>{PAGE_SIZES[key as PageSizeKey].name}</option>
              ))}
            </select>
            <FileInput label="背景" icon={Upload} accept="image/*" onChange={onImageUpload} />
            <FileInput label="CSV" icon={FileText} accept=".csv" onChange={onCSVUpload} />
          </div>
        </section>

        {/* Style Settings */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">レイアウト & スタイル</h2>
          <div className="space-y-2">
            {Object.keys(layout).map((key) => (
              <StyleRow key={key} id={key} config={layout[key]} onChange={onStyleChange} />
            ))}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t bg-white">
        <button
          onClick={onGeneratePDF}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg shadow-sm text-sm flex justify-center items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> PDF作成
        </button>
      </div>
    </div>
  );
};
