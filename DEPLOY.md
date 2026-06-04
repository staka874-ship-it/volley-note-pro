# Volley Note Pro Deployment

## 1. Supabase

1. Supabaseでプロジェクトを作成します。
2. SQL Editorで `supabase-schema.sql` を実行します。
3. Project Settings > API から以下を控えます。
   - Project URL
   - anon public key
   - service_role key

## 2. Stripe

1. Stripeで商品 `Volley Note Pro` を作成します。
2. 月額価格を作成します。
3. Price IDを控えます。
4. Developers > Webhooks で以下を追加します。

```text
https://your-app.vercel.app/api/stripe-webhook
```

Events:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

## 3. Vercel

Vercelにこのフォルダをデプロイし、環境変数を設定します。

```text
PUBLIC_APP_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

## 4. After Deploy

1. 公開URLを開きます。
2. Supabase URL と anon public key をアプリに設定します。
3. チームを作成します。
4. 「料金・契約」からStripe Checkoutのテストをします。
5. 「共有・出力」で公開アプリURLを入力し、招待リンクを作成します。
