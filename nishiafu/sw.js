// ニシアフ・パレットをホーム画面から開いたとき、電波が無くても動くようにするための仕組み。
// ページは「まずネット、だめなら手元の控え」、画像は「手元の控えがあればそれ」で返す。
// 中身を変えたら CACHE の番号を上げる（古い控えが消える）。
const CACHE = 'nishiafu-palette-v3';
const CORE = [
  'palette.html',
  'manifest.webmanifest',
  '../css/chrome.css',
  '../favicon-192.png',
  '../icon-1024.png',
  '../apple-touch-icon.png',
  '../img/palette-hero.png',
  '../img/1normal.png', '../img/2zulu.png', '../img/3oreo.png', '../img/4caramel.png',
  '../img/5patternless.png', '../img/6ghost.png', '../img/7amel.png', '../img/8snow.png',
  '../img/9rakibino.png', '../img/10rakibio.png', '../img/11purple_haze.png',
  '../img/12gold_haze.png', '../img/13whiteout.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('nishiafu-palette-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    const isPalette = new URL(req.url).pathname.endsWith('/palette.html');
    e.respondWith(fetch(req).then(res => {
      if (isPalette && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('palette.html', copy));
      }
      return res;
    }).catch(() => caches.match(isPalette ? 'palette.html' : req, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
