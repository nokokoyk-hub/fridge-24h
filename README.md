# 冷蔵庫24時

冷蔵庫の中身を、重厚なドキュメンタリー風ナレーションで報告する食材管理アプリです。

公開版：[fridge-24h.vercel.app](https://fridge-24h.vercel.app)

## 現在できること

- 食材名・分類・数量・期限の登録
- 期限超過／本日／3日以内／安全圏の自動判定
- 在庫状況に応じたオリジナル実況文（基礎フレーズ68本を組み合わせ）
- 開始・事件本編・締めの抽選により、状況ごとに最大1,152通り
- 再読込・在庫更新・「別の報告」操作による台本切り替え
- 捜査報告が一文字ずつ現れる監視端末タイプ演出
- ブラウザ標準音声による日本語読み上げ
- 日本語ナレーター選択・低音候補の自動優先・重低音演出
- 消費済み処理と期限フィルター
- `localStorage` を使った端末内保存

> 期限表示は目安です。食品のにおい、見た目、保存状況を確認し、食品安全を優先してください。

## 開発

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 品質確認

```bash
npm run lint
npm run build
npm audit --omit=dev
```

## 技術構成

- Next.js 16 / App Router
- React 19
- TypeScript
- CSS Modules + Tailwind CSS 4
- 保存先：ブラウザの `localStorage`（外部送信なし）

プロダクト方針は [NORTH_STAR.md](./NORTH_STAR.md)、現在地は [docs/current_state.md](./docs/current_state.md) を参照してください。
