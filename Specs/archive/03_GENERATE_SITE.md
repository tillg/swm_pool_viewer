# Generate Site

Deploy the React app to `swm-auslastung.de` (domain purchased at GoDaddy).

**Hosting:** GitHub Pages (free, HTTPS included)

**Routing:** HashRouter (`/#/impressum`) - works reliably with static hosting

**Domain:** `swm-auslastung.de` as primary, `www` redirects to apex

---

## Implementation Steps

### 1. Switch to HashRouter

Change `app/src/index.tsx` from `BrowserRouter` to `HashRouter`.

### 2. Configure Build Output to `/docs`

Update `app/webpack.config.js`:
- Change `output.path` to `../docs` (repo root, not inside `/app`)
- Keep `publicPath: '/'`

### 3. Add CNAME File

Create `app/public/CNAME` containing just `swm-auslastung.de`. CopyWebpackPlugin will copy it to `/docs` during build. GitHub Pages requires this file in the served folder root.

### 4. Configure DNS at GoDaddy

A records for apex domain:
- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

CNAME record: `www` → `swm-auslastung.de`

### 5. Configure GitHub Repository

- Settings → Pages → Source: "Deploy from a branch"
- Branch: `main`, folder: `/docs`
- Custom domain: `swm-auslastung.de`
- Enable "Enforce HTTPS"

---

## Deployment Workflow

```bash
npm run build   # generates /docs
git add docs/
git commit -m "Build site"
git push        # GitHub Pages auto-deploys from /docs
```

---

## Notes

- **CORS:** Data is fetched from `raw.githubusercontent.com`. Will test in production; address if issues arise.
