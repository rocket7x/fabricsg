# FabricSG — Shopify Theme
### nehp9h-xc.myshopify.com · Petal Theme

---

## Setup (one-time)

### 1 — Get Theme Access Password

1. Go to `nehp9h-xc.myshopify.com/admin`
2. **Apps** → **Develop apps** → **Theme Access** (install the app)
3. Click **Create password**
4. Name it `GitHub Actions` → copy the password (starts with `shptka_...`)

### 2 — Get your Theme ID

1. Go to **Online Store → Themes**
2. Click the **⋯** next to your live Petal theme → **Edit code**
3. The URL will be: `.../themes/XXXXXXXXXX/...` — copy that number

### 3 — Add GitHub Secrets

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

Add these 3 secrets:

| Secret name | Value |
|---|---|
| `SHOPIFY_STORE_URL` | `nehp9h-xc.myshopify.com` |
| `SHOPIFY_CLI_THEME_TOKEN` | `shptka_...` (Theme Access Password) |
| `SHOPIFY_THEME_ID` | `XXXXXXXXXX` (your theme ID number) |

---

## How it works

| Trigger | Action |
|---|---|
| Push to `main` | ✅ Deploy live to your Shopify store |
| Open a Pull Request | 🎨 Create a preview theme + post preview URL as PR comment |
| Close a Pull Request | 🗑 Delete the preview theme automatically |
| Push to any PR branch | 🔄 Update the PR preview theme |

---

## Local development

```bash
# Install Shopify CLI
npm install -g @shopify/cli

# Pull latest theme from store to local
shopify theme pull --store=nehp9h-xc.myshopify.com

# Start local dev server (live preview, no publish)
shopify theme dev --store=nehp9h-xc.myshopify.com

# Push your changes to a preview theme (don't overwrite live)
shopify theme push --unpublished --store=nehp9h-xc.myshopify.com

# Push directly to your live theme
shopify theme push --store=nehp9h-xc.myshopify.com --theme=THEME_ID --allow-live
```

---

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Production — deploys live on every push |
| `staging` | Staging — deploy manually |
| `feature/*` | Feature branches — each PR gets a preview theme |

---

## Repo structure

```
fabricsg/
├── .github/
│   └── workflows/
│       ├── deploy.yml        ← Auto-deploy to live on push to main
│       ├── preview.yml       ← PR preview themes
│       └── theme-check.yml   ← Lint check on PRs
├── assets/                   ← CSS, JS, images
├── config/                   ← settings_schema.json, settings_data.json
├── layout/                   ← theme.liquid, password.liquid
├── locales/                  ← Translation files
├── sections/                 ← Section .liquid files
├── snippets/                 ← Reusable .liquid snippets
├── templates/                ← Page templates (JSON + .liquid)
├── shopify.theme.toml        ← Shopify CLI config
├── .gitignore
└── README.md
```
