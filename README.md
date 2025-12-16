# 📚 単語帳メーカー (Wordbook Maker)

Kindle Direct Publishing (KDP) の固定レイアウト書籍作成、およびSNS向け画像生成を目的としたWebアプリケーションです。

---

## 🛠️ 開発環境構築手順

このプロジェクトは React (TypeScript) と Tailwind CSS を使用して構築されています。パッケージ管理には npm を使用します。

### 1. リポジトリのクローン

git clone https://github.com/ogichanchan/kdp-maker.git
cd kdp-maker

### 2. 依存関係のインストール

必要なライブラリ（React, Tailwind, html2canvas, jszip, papaparseなど）をインストールします。

npm install

### 3. ローカル環境での実行

開発サーバーを起動します。コードの変更は即座にブラウザに反映されます。

npm run dev

ブラウザで http://localhost:5173 (またはターミナルに表示されたURL) にアクセスしてください。

### 4. ビルドとデプロイ

本番環境向けにコードを最適化し、ビルドします。ビルド完了後、dist ディレクトリが生成されます。

npm run build

#### Vercelへのデプロイ

GitHubにプッシュすることで、Vercelの自動デプロイがトリガーされます。

git push origin main

---

## 📝 主な機能

- **データ連携:** Googleスプレッドシートの公開CSV URL またはローカルCSVファイルからのデータ読み込み。
- **レイアウト調整:** 要素のドラッグ＆ドロップによる自由な位置調整、中央揃えスナップ、リサイズ。
- **ガイド機能:** 中央ガイド、KDP印刷用余白ガイドの表示/非表示。
- **ファイル出力:**
    - PDF (電子書籍用固定レイアウト)
    - PNG/JPEG (SNSシェア、表紙作成用)
    - 全ページ画像一括ZIP出力

---

## ⚠️ トラブルシューティング

- **ビルドエラー:** もし TS6133 (未使用変数) のエラーが出た場合、console.error(err) のように変数を使用するか、変数名を _err のようにアンダースコアで始めることで回避してください。
- **描画エラー:** ブラウザのキャッシュが原因の場合があるため、Ctrl + Shift + R (スーパーリロード) を試してください。
