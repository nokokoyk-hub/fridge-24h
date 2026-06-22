// Service Worker for 冷蔵庫24時
// PWA化とGoogle Play出店（TWA）に必要な最小限の実装

const CACHE_NAME = "fridge-24h-v1";

// インストール時：最低限のシェルをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/"])
    )
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// フェッチ時：ネットワーク優先、失敗したらキャッシュ
self.addEventListener("fetch", (event) => {
  // ナビゲーションリクエスト以外はそのまま通す
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match("/")
    )
  );
});
