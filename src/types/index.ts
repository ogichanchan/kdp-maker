// すべてのコンポーネントで共有する型定義です。
export type PageSizeKey = '6x9' | 'A4' | 'A5';

export interface PageSizeConfig {
  name: string;
  widthPt: number;
  heightPt: number;
}

export const PAGE_SIZES: Record<PageSizeKey, PageSizeConfig> = {
  '6x9': { name: 'Book (6x9 inch)', widthPt: 432, heightPt: 648 },
  'A4':  { name: 'A4', widthPt: 595.28, heightPt: 841.89 },
  'A5':  { name: 'A5', widthPt: 419.53, heightPt: 595.28 },
};

export interface LayoutConfig {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  size: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface CsvRow {
  [key: string]: string;
}
