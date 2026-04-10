# 🚀 もちスラ Lab デプロイ手順書

`lab.mochisura-lab.com` を公開するための手順です。
所要時間：約30分（DNS反映待ちを除く）

---

## ステップ1：GitHubにコードをアップロード

### 1-1. GitHubでリポジトリを作成
1. [github.com/new](https://github.com/new) にアクセス
2. リポジトリ名: `mochisura-lab`（任意）
3. **Private**（非公開）を選択
4. 「Create repository」をクリック

### 1-2. ローカルからプッシュ
ターミナルで `50_web_site` フォルダにて以下を実行：

```powershell
git init
git add .
git commit -m "🚀 もちスラ Lab: 初回デプロイ"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/mochisura-lab.git
git push -u origin main
```

> ⚠️ `.gitignore` に `node_modules/` と `.next/` が含まれていることを確認してください。

---

## ステップ2：Vercelにデプロイ

### 2-1. Vercelアカウント作成
1. [vercel.com](https://vercel.com) にアクセス
2. 「Sign Up」→ **GitHub アカウントで連携**

### 2-2. プロジェクトをインポート
1. ダッシュボードの「Add New → Project」をクリック
2. 先ほど作成した `mochisura-lab` リポジトリを選択
3. Framework Preset: **Next.js**（自動検出されるはず）
4. Root Directory: `./`（そのまま）
5. 「Deploy」をクリック

### 2-3. デプロイ完了の確認
- 数分で `mochisura-lab.vercel.app` のようなURLが発行される
- このURLでサイトが表示されればOK

---

## ステップ3：Vercelにカスタムドメインを登録

### 3-1. ドメイン設定画面を開く
1. Vercel ダッシュボード → プロジェクトを選択
2. 上部メニューの **Settings** → 左メニューの **Domains**
3. 入力欄に `lab.mochisura-lab.com` と入力
4. 「Add」をクリック

### 3-2. Vercelが表示するDNS設定をメモ
Vercel が以下のような情報を表示します：

```
Type:  CNAME
Name:  lab
Value: cname.vercel-dns.com
```

> この `Value` の値を次のステップで使います。

---

## ステップ4：スタードメインでDNS設定

### 4-1. スタードメイン管理画面にログイン
1. [www.star-domain.jp](https://www.star-domain.jp/) にログイン
2. 「管理ドメイン一覧」から `mochisura-lab.com` を選択

### 4-2. DNS レコードを追加
1. 「DNSレコード編集」をクリック
2. 以下のレコードを **新規追加**：

| 項目 | 入力内容 |
|------|----------|
| **ホスト名** | `lab` |
| **タイプ** | `CNAME` |
| **コンテンツ（値）** | `cname.vercel-dns.com` |
| **TTL** | `3600`（デフォルトでOK） |

3. 「確認画面へ」→「確定する」

> ⚠️ スタードメインの画面によっては「サブドメイン」の欄に `lab` と入力する場合もあります。

### 4-3. DNS反映を待つ
- 通常 **5分〜1時間** で反映
- 最大24時間かかることもあるが、ほとんどの場合すぐ

---

## ステップ5：SSL証明書の確認

Vercel は HTTPS を**自動で設定**してくれます。
DNS が反映されると、Vercel の Domains 画面で：

- ✅ `Valid Configuration` と表示される
- 🔒 SSL証明書が自動発行される

これで `https://lab.mochisura-lab.com` が有効になります。

---

## ステップ6：最終確認

ブラウザで以下にアクセスして確認：

- [ ] `https://lab.mochisura-lab.com` → トップページが表示される
- [ ] `https://lab.mochisura-lab.com/lab` → 記事一覧が表示される
- [ ] `https://lab.mochisura-lab.com/newsletter` → きだからの手紙が表示される
- [ ] ヘッダーロゴ（もちスラ画像）が表示される
- [ ] 深海テーマ（ダークブルー背景）が適用されている

---

## 🔄 記事の更新方法（デプロイ後）

1. Obsidian で記事を書く（`publish: true` をフロントマターに付与）
2. `50_web_site` フォルダで `npm run sync` を実行
3. 以下のコマンドで GitHub にプッシュ：

```powershell
git add .
git commit -m "📒 新しい研究ノートを追加"
git push
```

4. Vercel が自動でビルド＆デプロイ（約1〜2分）
5. サイトに反映される ✨

---

## 💡 トラブルシューティング

### DNS が反映されない場合
```powershell
nslookup lab.mochisura-lab.com
```
→ `cname.vercel-dns.com` が返ってくれば設定は正しい。まだ反映待ち。

### ビルドが失敗する場合
Vercel ダッシュボード → Deployments → 失敗したビルドのログを確認。
よくある原因：
- `node_modules` がコミットされている → `.gitignore` に追加
- TypeScript の型エラー → ローカルで `npm run build` を先に試す

---

**きだ 記**
*Connecting the Pulse. Visualizing the Process.*
