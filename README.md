# SAIG — landing page

Marketing site for **SAIG (Secure Artificial Intelligence Grid)** — Australian-owned AI
infrastructure for business. Static site, no build step, deployed on Cloudflare Pages.

```
site/            ← everything that gets deployed
  index.html
  404.html
  styles.css
  main.js
  assets/        ← logo, Australia map, hero background, favicons
  _headers       ← Cloudflare Pages security + cache headers
  robots.txt
  sitemap.xml
design/          ← the Claude Design handoff this was built from (not deployed)
```

## Run it locally

No dependencies, no build. Any static server works:

```bash
cd site && python3 -m http.server 8000
# → http://localhost:8000
```

Opening `site/index.html` directly via `file://` won't work — the asset paths are
root-absolute (`/assets/…`), which is what Pages serves.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, pick this repo.
3. Build settings:

   | Setting                  | Value           |
   | ------------------------ | --------------- |
   | Framework preset         | `None`          |
   | Build command            | *(leave empty)* |
   | Build output directory   | `site`          |
   | Root directory           | `/`             |

4. Save and deploy. Every push to `main` redeploys; other branches get preview URLs.

`site` as the output directory is deliberate — it keeps `design/` (including the chat
transcripts) off the public site.

## Before going live — three things to fill in

1. **CTA links.** Both live at the top of `site/main.js`:

   ```js
   var LINKS = {
     book:  null,  // e.g. 'https://cal.com/saig/intro'
     login: null   // e.g. 'https://chat.saig.com.au/login'
   };
   ```

   Every "Book a call" / "Login to Sage Chat" button on the page carries
   `data-cta="book"` or `data-cta="login"` and picks these up automatically.
   While they're `null` the buttons just scroll to the relevant section.

2. **Domain.** `https://saig.com.au` is a placeholder. Replace it in
   `site/index.html` (canonical + Open Graph tags), `site/robots.txt`, and
   `site/sitemap.xml`.

3. **Loom walkthrough.** The Sage Chat section has a striped placeholder box.
   Drop the embed in:

   ```html
   <div class="embed-slot">
     <iframe src="https://www.loom.com/embed/YOUR_VIDEO_ID" allowfullscreen title="Sage Chat walkthrough"></iframe>
   </div>
   ```

   `frame-src https://www.loom.com` is already allowed in `site/_headers`. Any other
   embed host needs adding there or the iframe silently fails to load.

## Design system

Set as CSS custom properties at the top of `site/styles.css`:

| Token     | Value     | Use                    |
| --------- | --------- | ---------------------- |
| `--g`     | `#1F6B4F` | primary green          |
| `--beige` | `#F5F1E8` | page background        |
| `--ink`   | `#1B1D1A` | body text              |
| `--mint`  | `#A8C8B8` | muted green accents    |
| `--line`  | `#D9E3DB` | borders, panel tone    |
| `--card`  | `#FCFBF8` | off-white cards        |
| `--r`     | `20px`    | card radius            |

Type: **Instrument Serif** for headlines, **Manrope** for everything else, both from
Google Fonts.

## Notes on the port

- The desktop composition matches the handoff design exactly at ≥1040px; below that
  it degrades in stages (grids collapse, the pill nav becomes a menu). The prototype
  was desktop-only.
- The logo asset was trimmed of its transparent padding, so it renders legibly in the
  nav instead of at ~17px tall. To restore the prototype's exact rendering, swap
  `site/assets/saig-logo.png` for `design/project/saig-logo.png` and set
  `.brand img { height: 38px }` / `.footer-brand img { height: 44px }`.
- `hero-bg.png` was 2.4 MB. It ships as two WebP sizes with JPEG fallbacks:
  `hero-bg.webp` (1600px, 134 KB) and `hero-bg-900.webp` (900px, 50 KB), swapped in
  `styles.css` at `max-width: 900px`. The `<link rel="preload">` tags in `index.html`
  are media-scoped to match — **keep the `media` attributes**, or the browser
  preloads both and every visitor downloads the hero twice.
- All motion (marquee, typing, parallax, rotating headline, pulsing Sydney dot) is
  disabled under `prefers-reduced-motion`.
