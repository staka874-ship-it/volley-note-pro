# Volley Note Pro

バレーボールチーム向けの振り返りノートアプリです。

## 開き方

`open-app.cmd` をダブルクリックします。ブラウザで `http://127.0.0.1:5173/` が開きます。

PWAとしてインストールする場合は、ブラウザで開いたあとに「アプリとして追加」を押すか、ブラウザメニューから「アプリをインストール」を選びます。

## 追加した機能

- チーム名とパスワードによる簡易ログイン
- Supabaseデータベース同期
- PWA対応
- ホーム画面/デスクトップへのアプリ追加
- オフライン用キャッシュ
- 選手名ごとの記録
- 練習日・試合日カレンダー
- 成長グラフ
- CSV出力
- PDF出力
- コーチコメント欄
- チーム共有用テキスト
- Supabase招待リンク
- Stripe Checkoutによる月額課金
- Stripe Billing Portalによる契約管理
- バックアップJSONの書き出しと復元
- スマホ対応レイアウト

## 注意

この版は公開版プロトタイプです。Supabaseを設定しない場合は1台のブラウザ内だけに保存されます。

## Supabase接続

1. Supabaseで新しいプロジェクトを作成します。
2. SQL Editorで `supabase-schema.sql` の中身を実行します。
3. Project URL と anon public key をコピーします。
4. アプリのログイン画面、または「共有・出力」画面のクラウド同期欄に貼り付けます。
5. 「接続を保存」またはログインすると、チームデータがSupabaseに同期されます。

## 招待リンク

1. Supabase接続を保存します。
2. 「共有・出力」画面で権限と有効期限を選びます。
3. 公開後のURLを「公開アプリURL」に入力します。
4. 「招待リンクを作成」を押します。
5. 作成されたリンクをコピーして、選手やコーチに送ります。
6. 受け取った人はリンクを開くとチーム情報とSupabase設定が自動入力されます。

`supabase-schema.sql` は公開版プロトタイプ用に anon key で読み書きできる設定です。販売用にする場合は、Supabase Authとユーザー単位のRLSに変更してください。

## 公開と収益化

### 1. Vercelに公開

このフォルダをGitHubにアップしてVercelでImportするか、Vercel CLIで公開します。

必要な環境変数:

- `PUBLIC_APP_URL`: 公開URL
- `SUPABASE_URL`: Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PRICE_ID`: 月額商品のPrice ID
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

### 2. Stripeで商品を作る

Stripeで「Volley Note Pro」の商品を作り、月額価格を作成します。作成されたPrice IDを `STRIPE_PRICE_ID` に設定します。

### 3. Stripe webhookを設定

StripeのWebhook URLに以下を設定します。

`https://あなたの公開URL/api/stripe-webhook`

イベント:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 4. アプリ側で課金開始

アプリにログイン後、「料金・契約」タブから「有料プランを開始」を押すとStripe Checkoutへ進みます。
