import React, { useState } from 'react';
import { Upload, FileText, Download, Tablet, Link as LinkIcon, Languages, Plus, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PAGE_SIZES, type PageSizeKey, type LayoutConfig } from '../../types';
import { FileInput } from '../atoms/FileInput';
import { StyleRow } from '../molecules/StyleRow';
import { SeoContent } from '../molecules/SeoContent';
import type { FileType } from '../../hooks/useFileGenerator';

interface SettingsPanelProps {
  pageSizeKey: PageSizeKey;
  setPageSizeKey: (key: PageSizeKey) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCSVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSheetLoad: (url: string) => void;
  layout: Record<string, LayoutConfig>;
  onStyleChange: (key: string, field: keyof LayoutConfig, value: any) => void;
  onAddItem: () => void;
  onDeleteItem: (key: string) => void;
  onGenerateFile: (type: FileType) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  pageSizeKey,
  setPageSizeKey,
  onImageUpload,
  onCSVUpload,
  onSheetLoad,
  layout,
  onStyleChange,
  onAddItem,
  onDeleteItem,
  onGenerateFile,
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [fileType, setFileType] = useState<FileType>('pdf');
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ja' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl shrink-0 h-1/3 md:h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
        <h1 className="text-lg font-bold text-purple-800 flex items-center gap-2">
          <Tablet className="w-5 h-5" />
          {t('common.title')}
        </h1>
        <div className="flex items-center gap-1">
          <Link to="/howto" className="p-1.5 hover:bg-purple-100 rounded-full text-purple-600" title="使い方">
            <HelpCircle className="w-4 h-4" />
          </Link>
          <button onClick={toggleLanguage} className="p-1.5 hover:bg-purple-100 rounded-full text-purple-600">
            <Languages className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('common.dataSource')}</h2>
          
          <div className="flex gap-2 mb-2">
            <input 
              type="text" 
              placeholder={t('common.sheetUrlPlaceholder')} 
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="flex-1 border rounded px-2 py-1 text-xs bg-gray-50 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            <button 
              onClick={() => onSheetLoad(sheetUrl)}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 shrink-0"
            >
              <LinkIcon className="w-3 h-3" /> {t('common.load')}
            </button>
          </div>

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
            <FileInput label={t('common.background')} icon={Upload} accept="image/*" onChange={onImageUpload} />
            <FileInput label={t('common.localCsv')} icon={FileText} accept=".csv" onChange={onCSVUpload} />
          </div>
        </section>

        {/* Style Settings */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('common.layoutAndStyle')}</h2>
            <button 
              onClick={onAddItem}
              className="text-xs flex items-center gap-1 text-purple-600 hover:bg-purple-50 px-2 py-1 rounded transition-colors font-bold"
            >
              <Plus className="w-3 h-3" /> 項目を追加
            </button>
          </div>
          
          <div className="space-y-2">
            {Object.keys(layout).map((key) => (
              <StyleRow 
                key={key} 
                id={key} 
                // ▼▼▼ 修正箇所：翻訳による上書きを削除し、layout[key]をそのまま渡す ▼▼▼
                config={layout[key]} 
                // ▲▲▲ これで編集が可能になります ▲▲▲
                onChange={onStyleChange} 
                onDelete={onDeleteItem}
              />
            ))}
          </div>
        </section>

        <SeoContent />
      </div>

      <div className="p-4 border-t bg-white space-y-2">
        <div className="flex gap-2 text-sm">
          <select 
            value={fileType} 
            onChange={(e) => setFileType(e.target.value as FileType)}
            className="border rounded p-2 bg-gray-50 flex-1 outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="pdf">PDF (電子書籍用)</option>
            <option value="png">PNG (高画質画像)</option>
            <option value="jpeg">JPEG (軽量画像)</option>
          </select>
        </div>
        <button
          onClick={() => onGenerateFile(fileType)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-lg shadow-sm text-sm flex justify-center items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" /> 
          {fileType === 'pdf' ? t('common.generatePdf') : '画像保存'}
        </button>
      </div>
    </div>
  );
};
