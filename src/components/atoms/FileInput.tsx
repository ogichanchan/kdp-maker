import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FileInputProps {
  label: string;
  icon: LucideIcon;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileInput: React.FC<FileInputProps> = ({ label, icon: Icon, accept, onChange }) => (
  <label className="cursor-pointer bg-white border border-dashed rounded p-2 text-center hover:bg-gray-50 flex flex-col items-center justify-center">
    <Icon className="w-4 h-4 text-gray-400 mb-1" />
    <span className="text-[10px] text-gray-600">{label}</span>
    <input type="file" accept={accept} onChange={onChange} className="hidden" />
  </label>
);
