# Live Shopping Platform - Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- A Mux account (free tier works for testing)
- A Shopify store (development store is fine)

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready

### Run Database Migration
1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL to create all tables and policies

### Get Credentials
From Project Settings > API:
- Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Mux Setup

### Create Account
1. Go to [mux.com](https://mux.com) and create an account
2. Create a new environment (development is fine)

### Get API Credentials
From Settings > API Access Tokens:
1. Create a new token with Live Stream permissions
2. Copy the **Token ID** → `MUX_TOKEN_ID`
3. Copy the **Token Secret** → `MUX_TOKEN_SECRET`

### Setup Webhook (optional for MVP)
1. Go to Settings > Webhooks
2. Add a webhook URL: `https://your-domain.com/api/webhooks/mux`
3. Copy the **Signing Secret** → `MUX_WEBHOOK_SECRET`

## 3. Shopify Setup

### Create/Access Store
You can use an existing store or create a development store through Shopify Partners.

### Create a Custom App
1. Go to your Shopify Admin > Settings > Apps and sales channels
2. Click "Develop apps" → "Create an app"
3. Name it "Live Shopping Integration"

### Configure Storefront API Access
1. In your app, go to "Configuration"
2. Enable "Storefront API integration"
3. Select scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`

### Get Credentials
1. Install the app to your store
2. Go to "API credentials"
3. Copy the **Storefront API access token** → `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
4. Your store domain (e.g., `my-store.myshopify.com`) → `SHOPIFY_STORE_DOMAIN`

## 4. Environment Setup

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in all the values from the steps above.

## 5. Initialize Database

After setting up `.env.local`, run the setup script:

```bash
npx tsx scripts/setup-brand.ts
```

This creates your brand entry in the database.

## 6. Run the App

```bash
npm run dev
```

Visit:
- **Home**: http://localhost:3000
- **Host Login**: http://localhost:3000/login
- **Host Dashboard**: http://localhost:3000/host (requires login)

## 7. First Show

1. Log in at `/login` with an email (you'll receive a magic link)
2. Go to the host dashboard at `/host`
3. Create a new show with a title and scheduled time
4. In the show control panel:
   - Copy the RTMP URL and Stream Key
   - Use OBS, Streamlabs, or a mobile app to stream to that URL
   - Add products from your Shopify store
5. When ready, click "Start Show"
6. View the live show at `/live/[showId]`

## Streaming from Mobile

You can use apps like:
- **iOS**: Streamlabs, Larix Broadcaster
- **Android**: Streamlabs, Larix Broadcaster, Prism Live

Configure with:
- Server: `rtmps://global-live.mux.com:443/app`
- Stream Key: (from the host panel)

## RTL/Hebrew

The app is configured for Hebrew (RTL) by default. The layout flips automatically.

## Troubleshooting

### "No brands found"
Make sure you ran the setup script and the database migration.

### Stream not showing
- Check that your stream key is correct
- Ensure you're streaming to the RTMP**S** URL (with SSL)
- Wait a few seconds after starting the stream

### Products not loading
- Verify your Shopify Storefront API token has the correct scopes
- Check the browser console for errors

### Chat not working
- Make sure Supabase Realtime is enabled for your project
- Check that the `chat_messages` table is in the Realtime publication
