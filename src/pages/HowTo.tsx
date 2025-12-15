import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const HowTo: React.FC = () => {
  return (
    // ▼▼▼ 修正箇所：h-screen overflow-y-auto に変更 ▼▼▼
    <div className="h-screen overflow-y-auto bg-white font-sans text-gray-800">
      {/* ヘッダー */}
      <header className="p-4 border-b bg-purple-50 flex items-center gap-4 sticky top-0 z-10">
        <Link to="/" className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition">
          <ArrowLeft className="w-5 h-5 text-purple-700" />
        </Link>
        <h1 className="text-xl font-bold text-purple-800">使い方ガイド</h1>
      </header>

      {/* コンテンツ */}
      <main className="max-w-3xl mx-auto p-6 space-y-12 pb-20"> {/* 下部に余白を追加 */}
        
        {/* Step 1 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">1</div>
            <h2 className="text-2xl font-bold">データの準備</h2>
          </div>
          <div className="pl-14 space-y-4">
            <p>まずは単語帳のデータを用意しましょう。Googleスプレッドシートを使うのがおすすめです。</p>
            <div className="bg-gray-50 p-4 rounded-lg border text-sm space-y-2">
              <p className="font-bold flex items-center gap-2"><FileText className="w-4 h-4" /> Googleスプレッドシートの場合</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-600">
                <li>1行目に「項目名（韓国語、読み、意味など）」を入力します。</li>
                <li>2行目以降にデータを入力します。</li>
                <li>メニューの「ファイル」→「共有」→「ウェブに公開」を選択します。</li>
                <li>「ウェブページ」を<strong>「カンマ区切り値 (.csv)」</strong>に変更して公開し、URLをコピーします。</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">2</div>
            <h2 className="text-2xl font-bold">データの読み込み</h2>
          </div>
          <div className="pl-14 space-y-2">
            <p>アプリの左サイドバーにある入力欄にURLを貼り付けて「読込」ボタンを押すか、ローカルのCSVファイルをアップロードします。</p>
            <p>背景画像を設定すると、オリジナルのデザインになります。</p>
          </div>
        </section>

        {/* Step 3 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">3</div>
            <h2 className="text-2xl font-bold">レイアウト調整</h2>
          </div>
          <div className="pl-14 space-y-2">
            <p>プレビュー画面の文字をドラッグして位置を調整します。</p>
            <ul className="list-disc list-inside text-gray-600 ml-2">
              <li>サイドバーで文字の大きさや色を変更できます。</li>
              <li>「＋項目を追加」で、メモ欄などを自由に増やせます。</li>
              <li>項目名はCSVの1行目と同じ名前にしてください。</li>
            </ul>
          </div>
        </section>

        {/* Step 4 */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-lg">4</div>
            <h2 className="text-2xl font-bold">保存・作成</h2>
          </div>
          <div className="pl-14">
            <p>準備ができたら<strong>「作成」</strong>ボタンを押してください。</p>
            <div className="flex gap-4 mt-4 flex-col sm:flex-row">
              <div className="bg-blue-50 p-3 rounded border border-blue-100 flex-1">
                <span className="font-bold text-blue-700 block mb-1">PDF</span>
                Kindle出版やiPadのGoodNotesなどで本として使いたい場合に最適です。
              </div>
              <div className="bg-green-50 p-3 rounded border border-green-100 flex-1">
                <span className="font-bold text-green-700 block mb-1">PNG / JPEG</span>
                現在のページを画像として保存します。SNSへのシェアや表紙作成に使えます。
              </div>
            </div>
          </div>
        </section>

        <div className="pt-8 text-center">
          <Link to="/" className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-purple-700 transition transform hover:scale-105">
            単語帳メーカーを使う
          </Link>
        </div>

      </main>
    </div>
  );
};
