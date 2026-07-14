# Product → Store + Ad Creative — n8n Line (Setup Guide)

This is a **semi-automated** dropshipping pipeline. You drop a product URL into a
Google Sheet; the line does the rest and hands you ready-to-launch ad creative.
The only manual step is the one that's legally/technically gated: **launching the
paid ad**.

## What the line does (automatically)

```
You paste a supplier URL into a Google Sheet
        │
        ▼
1. Fetch the product page HTML
2. AI extracts: title, price, features, images
3. Compute your sell price + margin (3x markup, $12 min margin — editable)
4. AI writes: store listing (HTML) + SEO + Facebook & TikTok ad copy
5. Create the product in Shopify as a DRAFT
6. Attach up to 5 product images
7. Drop all ad creative into an "Ad Queue" sheet, marked READY TO LAUNCH
        │
        ▼
You review the draft product + ad row, then launch the ad yourself (one click)
```

## What you need before importing

| Thing | Cost | Why |
|---|---|---|
| n8n (Cloud or self-hosted) | ~$20/mo cloud, or free self-host on a VPS | Runs the line 24/7 |
| Shopify store | ~$29/mo | The store + Admin API |
| Anthropic API key | pay-per-use, pennies per product | The AI extract + copywriting |
| Google account | free | The input sheet + ad queue |

## Step-by-step

### 1. Create the Google Sheet
Make one sheet with **two tabs**:
- **`Products`** — columns: `source_url`, `status`
- **`Ad Queue`** — columns: `product_title`, `sell_price`, `supplier_price`, `ad_hook`, `fb_primary_text`, `tiktok_caption`, `main_image`, `status`

Copy the Sheet ID from its URL (the long string between `/d/` and `/edit`).

### 2. Import the workflow
In n8n: **Workflows → Import from File →** select `product-to-store-and-ads.json`.

### 3. Wire up credentials (one-time)
- **Google Sheets nodes** → connect your Google account, then replace `YOUR_GOOGLE_SHEET_ID` in the two trigger/sheet nodes.
- **Shopify nodes** → create a Shopify custom app (Admin API) with `write_products` scope, paste the token into the Shopify credential.
- **Anthropic** → in the two "AI:" HTTP nodes, put your API key in the `x-api-key` header.

### 4. Test with ONE product
Paste a single supplier URL into the `Products` tab. Watch the execution. Expect
to fix small things on the first run (that's normal).

### 5. Go live gradually
- Products are created as **DRAFT** (`published: false`) on purpose. Review a few,
  and once you trust the output, flip `published` to `true` in the Shopify node.

## Editable knobs

- **Pricing** — in the `Compute Price + Margin` node: `MARKUP` (default 3x) and
  `MIN_MARGIN` (default $12).
- **Model** — nodes use `claude-sonnet-5`. Fine as-is; cheaper models exist if you want.
- **Image count** — capped at 5 in `Split Image URLs`.

## Honest limitations (read this)

- **Scraping breaks.** Big suppliers block bots. If `Fetch Product Page` returns junk
  or gets blocked, swap it for a scraping API (ScraperAPI / Apify) — a 5-minute change.
- **Auto-launching paid ads is NOT included** and can't be, cleanly. Meta's Marketing
  API needs business verification + app review; TikTok Shop's API is partner-gated.
  This line gets you to *one click from launch*, which is the real, working version.
- **Product picking is still yours.** The line prices and lists whatever you feed it —
  it can't tell a winner from a dud. That judgment is where the money is made or lost.

## Where this saves you

Every product normally = 20-30 min of manual listing + copy + creative work.
This line makes it ~30 seconds of your time (paste URL, later click launch).
That's the real leverage: volume without the grind.
