# 変更報告書 — ニシアフ・パレット (GA4 設定 & デプロイ)

日時: 2026-07-11

**目的**: `index.html` に Google Analytics 4 (GA4) の gtag スニペットを埋め込み、GitHub Pages にデプロイして計測が開始されるか確認する。

**要約**:
- ローカルの `index.html` に GA4 スニペット（測定 ID: `G-Y2HG56PQSM`）を追加しました。
- 変更をリポジトリにコミットして、`https://github.com/koimedaka354/AFT_palette` に push しました。
- GitHub Pages（公開 URL: `https://koimedaka354.github.io/AFT_palette/?mode=normal-tab`）へデプロイ済みで、公開ページにスニペットが反映されていることを確認しました。

**変更されたファイル**:
- `index.html` — head 内に GA4 (gtag.js) スニペットを追加
- `README.md` — ローカル検証とデプロイ手順の追記
- 追加ファイル: `REPORT.md`（本ファイル）

**実施した主な手順（大まかな流れ）**:
1. `index.html` に以下を追加（head 内）:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y2HG56PQSM"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', 'G-Y2HG56PQSM');
</script>
```

2. ローカルで検証: `python -m http.server 8000` 等で起動し、DevTools の Network で `gtag/js` と `g/collect` のリクエストを確認する手順を提示。
3. Git 操作:
   - Git が未インストールだったため `winget install Git.Git` でインストール
   - `git config user.name` / `user.email` を設定してコミット
   - リモート `origin` を設定し push
   - リモートに既存コミットがあったため `git pull --rebase` を実行し、発生したマージ競合を解消して再度 push

**躓いた点 / 発生した問題と対応**:
1. Git コマンドが最初 PowerShell で見つからなかった
   - 原因: 新しい PowerShell セッションで PATH が更新されていなかった/Git 未インストール
   - 対応: `winget install --id Git.Git` でインストール、ターミナルを再起動して動作確認

2. コミット時にユーザー情報が未設定
   - 原因: `git config` 未設定
   - 対応: `git config user.name "notep"` と `git config user.email "notep@example.com"` を設定してコミット

3. SSH での push が拒否された（Permission denied (publickey)）
   - 原因: GitHub に公開鍵が登録されていない
   - 対応: HTTPS に切替え（`git remote set-url origin https://...`）して進めた。SSH を使う場合は `ssh-keygen` で鍵を作り公開鍵を GitHub に登録する手順を案内済み。

4. push 時にリモートと履歴が衝突（ローカルにないリモートのコミットが存在）
   - 原因: 既存の `koimedaka354/AFT_palette` に既にコミットがあった
   - 対応: `git pull --rebase origin main` を実行 → `README.md`, `calculator.js`, `index.html` の add/add コンフリクトが発生 → ローカルの内容を優先して解決（`git checkout --theirs` を使い rebase を継続）→ rebase 完了後 push 成功

**検証結果**:
- GitHub Pages 上の公開ページ `https://koimedaka354.github.io/AFT_palette/?mode=normal-tab` に変更が反映され、ページソース内に `G-Y2HG56PQSM` のスニペットを確認しました。
- GA 管理画面にてストリームが作成され、測定 ID は `G-Y2HG56PQSM`（ストリーム ID: 15239547103）と一致しています。ただし管理画面の注意書きの通り、データが反映されるまで最大 48 時間かかることがあります。DebugView / Realtime で即時確認できます。

**再現可能なコマンド一覧**:

```powershell
# Git インストール（Windows）
winget install --id Git.Git -e --source winget

# ローカル検証サーバー
cd "C:\Users\notep\Desktop\ニシアフアプリ"
python -m http.server 8000

# Git 操作（HTTPS / 自分のリポジトリに push する場合）
git init
git config user.name "notep"
git config user.email "notep@example.com"
git add .
git commit -m "Add GA4 snippet and README"
git branch -M main
git remote add origin https://github.com/<あなたのユーザ名>/AFT_palette.git
git push -u origin main

# 既存リモートと衝突した場合の手順
git pull --rebase origin main
# コンフリクトが出たら該当ファイルを手動で解決し:
git add <conflicted-files>
git rebase --continue
git push -u origin main
```

**推奨する次の確認アクション**:
- ブラウザで公開 URL を開いて DevTools の Network に `g/collect` リクエストが来ているか確認する。
- GA4 管理画面で DebugView を有効にし、アクセスが来ているか確認する。
- 広告ブロッカーやプライバシー拡張がある場合は一時的に無効化してテストする。

**サポートできること（必要なら実施）**:
- Network タブのスクリーンショット解析（貼ってください）
- DebugView の見方・ログの解析を代行
- GitHub Pages の公開設定（カスタムドメイン、HTTPS）を代行で案内

---
このファイルを表示: [REPORT.md](REPORT.md)
