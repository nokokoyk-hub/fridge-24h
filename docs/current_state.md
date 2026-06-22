# Current State

更新日：2026-06-22（JST）
バージョン：0.5.2

## 状態

初回MVPをGitHubの `main` で管理し、Vercel本番へ公開済み。公開URLは `https://fridge-24h.vercel.app`。

## 実装済み

- レスポンシブな単一画面ダッシュボード
- 食材の追加、消費済み処理、期限別フィルター
- 期限ステータス集計
- 在庫に連動する実況文
- 基礎フレーズ68本を組み合わせる実況カタログ（状況ごとに最大1,152通り）
- 台本専用ファイル `src/content/narration.ts` と「別の報告」機能
- Web Speech APIによる日本語読み上げ
- 端末内の日本語ナレーター選択、低音候補の自動優先、重低音ON/OFF
- 音声設定の端末内保存
- 一文字ずつ報告を表示する監視端末タイプ演出
- `prefers-reduced-motion` 利用者向けの即時表示
- 単一タイマーによる欠落しにくいタイプ表示（v0.5.1で修正）
- `localStorage` 永続化
- 食品安全に関する注意表示
- Next.js作業ルートの固定
- PostCSS修正版の依存上書き
- `vercel.json` によるNext.jsフレームワーク指定
- Vercel Deployment Protection解除済み（一般公開）

## 検証結果

- `npm run lint`：成功
- `npm run build`：成功
- `npm audit --omit=dev`：脆弱性0件
- 開発サーバー `/`：HTTP 200、主要文言のSSR出力を確認
- Vercel本番URL：HTTP 200、「冷蔵庫24時」「本日の捜査報告」を確認

## 未検証・未実装

- 実ブラウザでのスクリーンショット比較（ブラウザ接続制約により未実施）
- 各OS・ブラウザに搭載される音声の聞き比べ
- 複数端末同期、認証、通知、PWA、写真／バーコード登録
- データの編集、バックアップ、復元
- GitHub Actions CI
- 広告サービスの選定・審査・実装

## データ仕様

食材は `FoodItem` 型で管理し、保存キーは `fridge-24h.inventory.v1`。データはブラウザ内のみで、サーバー送信はしない。
