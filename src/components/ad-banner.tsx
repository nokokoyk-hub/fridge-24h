"use client";

import styles from "./ad-banner.module.css";

/**
 * 捜査協力パートナー（広告バナー）
 *
 * A8.net 等のアフィリエイトタグを表示するコンポーネント。
 * 将来、課金ユーザーには非表示にする想定。
 *   → 親側で {!isPremium && <AdBanner />} とするだけ。
 *
 * 使い方:
 *   審査通過後、A8管理画面から取得した広告タグ（HTML）を
 *   下記の dangerouslySetInnerHTML 部分に貼り付ける。
 *   複数の広告主をローテーションする場合は adSlots 配列に追加。
 */

/* ── A8タグをここに追加していく ── */
const adSlots: string[] = [
  // 審査通過後、A8管理画面の広告タグ（HTML文字列）をここに貼る
  // 例: '<a href="https://px.a8.net/..." ...><img src="..." /></a>'
];

function pickSlot(slots: string[]): string | null {
  if (slots.length === 0) return null;
  return slots[Math.floor(Math.random() * slots.length)];
}

export function AdBanner() {
  const tag = pickSlot(adSlots);

  return (
    <aside className={styles.sponsor} aria-label="捜査協力パートナー">
      <div className={styles.label}>
        <span className={styles.kicker}>INVESTIGATION PARTNER</span>
        <span className={styles.title}>捜査協力パートナー</span>
      </div>
      <div className={styles.slot}>
        {tag ? (
          <div dangerouslySetInnerHTML={{ __html: tag }} />
        ) : (
          <p className={styles.placeholder}>
            ─ 現在、協力パートナーを捜索中 ─
          </p>
        )}
      </div>
      <span className={styles.ad}>AD</span>
    </aside>
  );
}
