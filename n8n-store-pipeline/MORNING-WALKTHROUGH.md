# Morning Build Walkthrough — Step by Step

Follow these in order. Don't skip ahead — each step builds on the last.
When we do this together, I'll wait for you to finish each one before the next.

---

## PART 1 — Accounts (get these ready)

### Step 1: n8n
- Go to **https://n8n.io** → "Get started free" → sign up.
- Pick **n8n Cloud** (easiest). You'll land in an empty workspace.

### Step 2: Shopify
- Go to **https://www.shopify.com** → start free trial.
- Pick a store name (can change later). You now have a store.

### Step 3: Anthropic API key
- Go to **https://console.anthropic.com** → sign up → **API Keys** → Create Key.
- Copy the key somewhere safe (starts with `sk-ant-`). Add ~$5 credit.

### Step 4: ScraperAPI (makes the scraper reliable)
- Go to **https://www.scraperapi.com** → sign up free (1000 calls/mo free).
- Copy your API key from the dashboard.

### Step 5: Google account
- You already have one. ✅

---

## PART 2 — The Google Sheet

### Step 6: Create the sheet
- Go to **https://sheets.google.com** → blank sheet → name it "Store Pipeline".

### Step 7: Make two tabs
- Rename the first tab to **`Products`**.
- Add a second tab named **`Ad Queue`**.

### Step 8: Add the columns (or import the CSVs)
- **Products** tab, row 1: `source_url` | `status`
- **Ad Queue** tab, row 1: `product_title` | `sell_price` | `supplier_price` | `ad_hook` | `fb_primary_text` | `tiktok_caption` | `main_image` | `status`
- (Or: File → Import → upload the two `sheet-template-*.csv` files.)

### Step 9: Grab the Sheet ID
- From the URL: `docs.google.com/spreadsheets/d/`**`THIS_LONG_ID`**`/edit`
- Copy that ID — you'll paste it into n8n.

---

## PART 3 — Import + wire the workflow

### Step 10: Import the workflow
- In n8n: **Workflows → Import from File** → choose `product-to-store-and-ads.json`.
- You'll see the node canvas appear. 🎉

### Step 11: Connect Google Sheets
- Click the trigger node → Credentials → connect your Google account.
- Paste your Sheet ID into the trigger node AND the "Save Ad Creative to Queue" node.

### Step 12: Connect Shopify
- In Shopify admin: **Settings → Apps → Develop apps → Create an app**.
- Give it **Admin API** access with scope `write_products`.
- Install it, copy the **Admin API access token**.
- In n8n, click each Shopify node → add credential → paste the token + your store domain.

### Step 13: Add the Anthropic key
- Click "AI: Extract Product Data" → find the `x-api-key` header → paste your `sk-ant-` key.
- Do the same on "AI: Write Listing + Ad Copy".

### Step 14: Add the ScraperAPI key
- Click "Fetch Product Page" node.
- In the URL, replace `YOUR_SCRAPERAPI_KEY` with your ScraperAPI key.

---

## PART 4 — Test

### Step 15: One product test
- Paste ONE real supplier product URL into the `Products` tab, `source_url` column.
- In n8n, click **Execute Workflow** (or wait for the trigger).
- Watch each node light up green. If one goes red, that's our debug target.

### Step 16: Check the results
- Shopify admin → Products → you should see a new **draft** product with images.
- Google Sheet → Ad Queue tab → a new row with ad copy.

### Step 17: Go live
- Once you trust the output, open the "Create Product in Shopify" node and change
  `published` from `false` to `true` so future products publish automatically.

---

## When something breaks (it might, first run)
That's normal. Tell me which node went red and paste the error — I'll tell you the fix.
Most common first-run issues:
- Google/Shopify credential not connected → reconnect.
- Scraper returned messy HTML → we tweak the AI extract prompt.
- Sheet ID typo → re-paste.

You've got this. 👊
