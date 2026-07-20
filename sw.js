/* 银龄健身 Service Worker — 离线缓存策略 */
const CACHE_NAME = 'elder-fit-v1';

const PRE_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './logo.png',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* 安装：预缓存核心文件 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

/* 激活：清理旧缓存 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* 请求：缓存优先（视频走网络） */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 视频文件不缓存，直接从网络加载（太大）
  if (url.pathname.endsWith('.mp4') || url.pathname.endsWith('.m4a')) {
    return; // 浏览器默认网络请求
  }

  // 其他资源：缓存优先
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        // 缓存成功的响应
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
    )
  );
});
