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

## Before going live

1. ~~**CTA links.**~~ **Done.** Both live at the top of `site/main.js`:

   ```js
   var LINKS = {
     book:  null,                      // on-page: scrolls to the #book booking section
     login: 'https://chat.saig.co/'    // Sage Chat
   };
   ```

   Every "Book a call" / "Login to Sage Chat" button on the page carries
   `data-cta="book"` or `data-cta="login"` and picks these up automatically.
   A `null` value leaves the button on its on-page anchor.

   **Leave `book` as `null`.** Booking happens on the page — all six "Book a call"
   buttons are anchors to `#book`, which is the iClosed embed at the bottom. Setting
   a URL here sends people off-site and skips that section.

   `login` is cross-origin, so the five "Login to Sage Chat" buttons get
   `target="_blank" rel="noopener"` automatically. With JS off they fall back to the
   `#sage-chat` anchor.

2. **Domain.** `https://saig.com.au` is a placeholder. Replace it in
   `site/index.html` (canonical + Open Graph tags), `site/robots.txt`, and
   `site/sitemap.xml`.

3. ~~**Loom walkthrough.**~~ **Done.** The Sage Chat section embeds the walkthrough
   in `.embed-slot`, lazily loaded since it sits below the fold.

   `frame-src https://www.loom.com` is already allowed in `site/_headers`. Any other
   embed host needs adding there or the iframe silently fails to load.

   The frame's `aspect-ratio` in `styles.css` is **`208 / 135`** — the ratio of the
   current recording (1664×1080), not 16:9. If the walkthrough is re-recorded at a
   different size, update that number or the player letterboxes inside its frame.

## Booking section (`#book`)

The bottom section embeds the iClosed scheduler (`app.iclosed.io/e/Phlo/saig`) and is
the target of every "Book a call" on the page.

Because it is third-party, it only works if `site/_headers` keeps `app.iclosed.io` in
**`script-src`** (widget.js), **`frame-src`** (the calendar iframe), **`connect-src`**
(its callbacks) and **`img-src`**, plus `'unsafe-inline'` in `style-src` — the vendor
snippet carries an inline `style` attribute, and widgets of this kind usually inject a
`<style>` block too. Tighten any of those and the calendar goes blank with only a
console error; there is a "Calendar not loading?" fallback link under the card, and a
`<noscript>` fallback inside it, so visitors are never fully stuck.

To swap schedulers, replace the `.iclosed-widget` div and its `<script>` in
`site/index.html` and update those four directives to the new host.

The embed is themed to the site beige, so it sits in a beige band (`.booking`)
rather than a card — anything painted behind it shows as a frame around the edges.

## A note on hosting claims

Sydney is the default, but customers can and do run workloads in the US for the cost
saving, so the page must not state that data never leaves Australia. Two FAQ entries
("Is it hosted in Australia?" and "Can we host outside Australia?") set this out, and
the hero tile, Security card 01 and the Infrastructure lead are worded as "by default"
/ "the region you choose" for the same reason.

Keep the distinction when editing copy: **ownership** claims ("Australian-owned and
operated", "Sovereign infra") are true for every customer. **Residency** claims ("never
leaves AU", "not routed offshore", "data stays local") are not, and are the ones that
would be misleading under Australian Consumer Law.

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
