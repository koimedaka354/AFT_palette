# ニシアフ・パレット

ニシアフリカトカゲモドキ（African Fat-tailed Gecko）のモルフ(品種)交配結果を予測する、ブラウザで動く遺伝計算ツールです。

- 両親のモルフを選択すると、生まれてくる子の見た目・確率を計算します(通常モード)。
- 欲しいモルフから逆算して、必要な親の組み合わせを探すこともできます(逆引きモード)。
- 結果はあくまで統計的な予測であり、実際の交配結果を保証するものではありません。

公開URL: https://koimedaka354.github.io/AFT_palette/

## 技術構成

ビルド不要のプレーンHTML/CSS/JSのみで構成されています。フレームワーク・パッケージ管理(package.json等)は使用していません。

- `index.html` — ページ本体。UI・遺伝計算ロジックともにこのファイルにインラインで実装
- `img/` — モルフごとのサムネイル画像
- `scripts/debug_purple.js` — ページには読み込まれないNode実行用のデバッグスクリプト(交配ロジックの動作確認用)
- `.github/workflows/` — 画像自動圧縮などのGitHub Actionsワークフロー

## ローカルでの実行

```bash
python -m http.server 8000
```

またはNodeがある場合:

```bash
npx http-server -p 8000
```

ブラウザで `http://localhost:8000/` を開いて確認してください。

## デプロイ

`main` ブランチにcommit・pushするだけです。GitHub Pagesが `main` のルートから直接配信するため、ビルドや別ブランチへの反映作業は不要です。

`img/` 配下にPNG画像をpushすると、GitHub Actions(`optimize-images.yml`)が自動でpngquantによる圧縮を行い、圧縮後の画像を自動コミットします。

## その他

過去のGA4(アクセス解析)セットアップの経緯や検証手順など、詳細な設定履歴は `REPORT.md` を参照してください。
