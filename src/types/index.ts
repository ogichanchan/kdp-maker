// src/types/index.ts

/**
 * CSVから読み込まれる単語データ行の型
 */
export type CsvRow = Record<string, string | undefined>;

/**
 * ページのサイズ定義のキー
 */
export type PageSizeKey = '6x9' | 'a4' | 'a5';

/**
 * ページサイズオブジェクトのインターフェース
 * (旧PageSizeConfigを置き換え、marginプロパティを含む)
 */
export interface PageSize {
    widthPt: number;  // 幅 (ポイント)
    heightPt: number; // 高さ (ポイント)
    name: string;
    // ▼ 印刷用の余白情報 (mm) を追加 ▼
    margin: {
        innerMm: number; // ノド側 (内側/綴じ側)
        outerMm: number; // 小口側 (外側)
        topBottomMm: number; // 天地側 (上下)
    };
    // ▲
}

/**
 * レイアウト項目ごとの設定インターフェース
 */
export interface LayoutConfig {
    label: string;      // CSVの列名（表示される項目名）
    x: number;          // X座標 (pt)
    y: number;          // Y座標 (pt)
    width: number;      // 幅 (pt)
    height: number;     // 高さ (pt)
    size: number;       // フォントサイズ (pt)
    color: string;      // 文字色 (#hex)
    align: 'left' | 'center' | 'right'; // 配置
}

/**
 * ページサイズ定数
 */
export const PAGE_SIZES: Record<PageSizeKey, PageSize> = {
    '6x9': {
        widthPt: 432, // 6 inch * 72
        heightPt: 648, // 9 inch * 72
        name: 'Book (6x9 inch)',
        // KDP推奨余白 (裁ち落としなし)
        margin: { innerMm: 12.7, outerMm: 6.4, topBottomMm: 6.4 },
    },
    'a4': {
        widthPt: 595.28,
        heightPt: 841.89,
        name: 'A4',
        margin: { innerMm: 15, outerMm: 10, topBottomMm: 10 },
    },
    'a5': {
        widthPt: 419.53, 
        heightPt: 595.28, 
        name: 'A5 (148x210mm)',
        margin: { innerMm: 10, outerMm: 10, topBottomMm: 10 },
    },
};
