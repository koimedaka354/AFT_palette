# ニシアフ・パレット — GA4 計測の検証とデプロイ手順

以下は `index.html` に埋めた GA4（G-Y2HG56PQSM）スニペットの動作確認と代表的なデプロイ手順です。

## 1) ローカルでの動作確認（まずここを行ってください）

- 起動（Python を使う簡易サーバー）:

```bash
cd "c:\Users\notep\Desktop\ニシアフアプリ"
python -m http.server 8000
```

- または Node がある場合:

```bash
npx http-server -p 8000
```

- ブラウザで `http://localhost:8000/` を開く。
- DevTools の Network タブで `collect?v=2` や `gtag/js` に向けたリクエスト（`https://www.googletagmanager.com/gtag/js` や `https://www.google-analytics.com/g/collect`）が発生しているか確認する。
- GA4 の管理画面 → 「Realtime（リアルタイム）」で自分のアクセスが表示されるか確認する。

ヒント: リアルタイムに出ない場合は、ブラウザにインストールした「Google Analytics Debugger」拡張や、DebugView を使うと詳細が見えます。DebugView を有効にするにはブラウザで `localStorage.setItem('ga_debug', 'true')` などの方法や、GA デバッガ拡張を利用してください。

## 2) 本番デプロイ（代表的な選択肢）

- Netlify (最も簡単：ドラッグ&ドロップ or Git 接続)
  - site を作成 → `dist`/`root` にこのフォルダを指定してデプロイ。

- GitHub Pages
  - リポジトリを作成して push → `gh-pages` ブランチまたは `main` の `docs/` を有効化。

- Vercel
  - Git を接続して自動デプロイ。

どのホスティングでも、公開 URL にアクセスして DevTools の Network と GA4 の Realtime を確認してください。

## 3) デバッグの追加手段

- ブラウザでの確認:
  - Network で `g/collect`（Measurement Protocol の v2）リクエストを確認。
  - コンソールに `gtag` のログを出すには一時的に `gtag('set', {'debug_mode': true});` を追加できます（本番では不要）。

- GA 側:
  - GA4 の「DebugView」を有効にして動作を追跡。

## 4) 次にやること（提案）

- 私が代行できること:
  - ローカルで検証を代行するために、あなたの環境で実行するコマンドを案内します。
  - どのホスティングを使うか教えていただければ、デプロイ手順を詳しく作成します。

---
短く検証したい場合は、どの方法でデプロイしたいか教えてください（Netlify / GitHub Pages / Vercel / 他）。
