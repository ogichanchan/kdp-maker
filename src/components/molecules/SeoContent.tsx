import React from 'react';

export const SeoContent: React.FC = () => {
  return (
    <section className="mt-8 pt-6 border-t border-gray-200 text-gray-600 text-xs leading-relaxed space-y-4">
      <div>
        <h2 className="font-bold text-sm text-gray-800 mb-1">KDP Makerとは？</h2>
        <p>
          KDP Makerは、Kindle出版（KDP）やiPadでの学習に最適な「単語帳PDF」を、
          ブラウザ上で簡単に作成できる無料のWebツールです。
        </p>
      </div>

      <div>
        <h3 className="font-bold text-gray-700 mb-1">主な機能・特徴</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>CSVやスプレッドシートから一括作成</li>
          <li>韓国語・日本語・英語などの多言語フォント対応</li>
          <li>6x9インチ、A4、A5などKindle推奨サイズに対応</li>
          <li>ドラッグ＆ドロップで直感的なレイアウト調整</li>
          <li>完全無料、インストール不要</li>
        </ul>
      </div>

      <div>
        <h3 className="font-bold text-gray-700 mb-1">使い方</h3>
        <ol className="list-decimal pl-4 space-y-1">
          <li>CSVをアップロードするか、スプレッドシートのURLを入力します。</li>
          <li>背景画像を設定し、文字の配置を調整します。</li>
          <li>「PDF作成」ボタンを押してダウンロード！</li>
        </ol>
      </div>
      
      <div className="text-[10px] text-gray-400 pt-4">
        © 2024 KDP Maker - Kindle Wordbook Generator
      </div>
    </section>
  );
};
