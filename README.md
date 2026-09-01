# ESJ Law Offices — marketing website

A fast, fully static marketing website for **ESJ Law Offices**, the practice of
**Elizabeth L. Salmon-James, Attorney-at-Law & Notary Public**.

Tagline: _Justice. Integrity. Results._

- Plain **HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no build step, no backend.
- Multi-page site: Home, About, Practice Areas, Contact.
- Mobile-first and responsive, with a hamburger menu on small screens.
- Branding: the "ESJ" monogram appears in the header/nav on every page, large in the
  home hero, and (smaller) in the footer beside the firm name. Header/hero/footer sit
  on dark navy, so they use a cream-and-gold variant of the mark
  (`assets/images/logo-mark-light.png`); the original navy/gold mark is kept for
  light backgrounds and the favicons.
- Interactive: sticky/shrinking header, scroll-reveal animations (`IntersectionObserver`)
  with staggered grouped elements and a more pronounced entrance for section headings,
  hero parallax + scale/fade on scroll, a slim scroll-progress bar, count-up stat
  numbers, hover micro-interactions, back-to-top button, smooth in-page scrolling, and a
  client-side–validated contact form wired for **Netlify Forms**. All scroll effects
  use `transform`/`opacity` only, are `requestAnimationFrame`-throttled, and are
  disabled/neutralised under `prefers-reduced-motion`.
- Accessible: semantic landmarks, logical heading order, visible focus states,
  `alt` text, `aria-label`s on icon-only controls, respects `prefers-reduced-motion`.
- SEO: per-page `<title>` / meta description, Open Graph tags, JSON-LD, favicon set,
  `sitemap.xml`, `robots.txt`.

---

## Project structure

```
esj-law-website/
├── index.html                 # Home
├── about.html                 # Attorney bio, credentials, admissions, philosophy
├── practice-areas.html        # Practice-area cards + detail sections
├── contact.html               # Netlify contact form + office NAP + socials
├── assets/
│   ├── css/styles.css         # All styles; CSS custom properties for palette + spacing
│   ├── js/main.js             # All interactivity (one file, no dependencies)
│   └── images/                # Logo mark, favicons, OG image
├── netlify.toml               # Netlify config (no build; headers; pretty URLs)
├── site.webmanifest           # PWA manifest / icons
├── sitemap.xml
├── robots.txt
├── .gitignore
└── source-materials/          # Original logo + attorney profile PDF (inputs)
```

---

## Run it locally

It is a static site — no build, no install. Any of these work:

**Just open the file:** double-click `index.html` (some browsers restrict
`fetch`, so the contact form's AJAX path won't run from `file://`; everything
else works).

**Or serve it (recommended):**

```bash
npx serve .
```

```bash
# Python 3 alternative
python -m http.server 8000
```

Then visit `http://localhost:3000` (or `:8000`).

> The contact form only actually delivers messages once deployed to Netlify.
> Locally you'll see the client-side validation and the success/error UI, but
> no email is sent.

---

## Deploy

### Netlify (recommended — the contact form works out of the box)

1. Push this repo to GitHub (see below).
2. In Netlify: **Add new site → Import an existing project → GitHub →** pick this repo.
3. Build settings: **build command** empty, **publish directory** `.`
   (already declared in `netlify.toml`).
4. Deploy. The contact form is detected automatically from
   `data-netlify="true"` in `contact.html`; submissions appear under
   **Site → Forms**. Add a notification (email/Slack) there, and optionally
   enable reCAPTCHA. A honeypot field (`bot-field`) is already wired.
5. Point the registered domain at the site: **Site → Domain management → Add
   domain**, then update the domain's DNS as Netlify instructs. DNS is *not*
   configured here.

### Cloudflare Pages

1. Push to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** →
   pick this repo.
3. Framework preset **None**, build command **empty**, output directory `/`.
4. Deploy, then add the custom domain under **Custom domains**.
   Note: Cloudflare Pages has **no built-in form handling** — if you host here,
   switch the contact form to a service such as Formspree, Web3Forms, or a
   Cloudflare Pages Function.

### GitHub Pages

Works for the static pages (Settings → Pages → deploy from `main` / root).
The contact form will need an external form service, as with Cloudflare Pages.

---

## Before go-live — fill in the `TODO`s

The attorney profile PDF did not include contact/office specifics, so these are
left as clearly marked `<!-- TODO: -->` placeholders in the HTML:

| Placeholder | Where | What to add |
|---|---|---|
| Phone number | header + footer + `contact.html` (`tel:+1000000000`, `(000) 000-0000`) | Real office phone |
| Street address | footer `<address>`, `contact.html` office details | Full mailing address |
| Public email | footer + `contact.html` (`info@esjlawoffices.com`) | Confirm the real address |
| Office hours | `contact.html` | Confirm opening hours |
| Social links | every page footer + `contact.html` (`href="#"`) | Real profile URLs, or delete unused icons |
| Attorney headshot | `index.html`, `about.html` (portrait placeholder) | Add `assets/images/elizabeth-salmon-james.jpg` and swap in the `<img>` |
| Google Map | `contact.html` (`#map`) | Paste the Maps embed `<iframe>` |
| Production domain | `sitemap.xml`, `robots.txt`, `<link rel="canonical">` and `og:url` in each HTML file | Currently assumes `https://www.esjlawoffices.com/` — change if the real domain differs |

Search the project for `TODO:` to find them all.

### Testimonials

Deliberately **omitted**. Attorney-advertising rules in many jurisdictions
restrict client testimonials. A commented-out template sits in `index.html`
marked:

```
<!-- TESTIMONIALS SECTION - verify with the state bar's advertising rules before enabling -->
```

Confirm compliance with the relevant regulator (e.g. the General Legal Council
of Jamaica) before enabling it.

---

## Design notes / decisions made

- **Palette sampled from `source-materials/logo.png`** (a navy-and-gold "ESJ"
  wordmark rendered on a dark background):
  - Navy `#011f4b` (primary), deep navy `#01152e` (header/footer)
  - Gold `#c9a227` (accent), bright gold `#e6c65c` (hover/highlight)
  - Cream `#f8f5ee` (page background) — a warm off-white chosen to complement the
    gold, per the brief (the logo's own background is dark, not cream).
  These are defined once as CSS custom properties at the top of `styles.css`.
- **Logo assets**: the "ESJ" monogram was cropped from the source PNG and its
  near-black background made transparent → `assets/images/logo-mark.png` (navy
  letterforms + gold "S", for light backgrounds and the favicons). Because the
  header, home hero and footer are all dark navy, a recoloured variant with
  cream letterforms → `assets/images/logo-mark-light.png` is used in those three
  places so the mark actually reads. The firm name beside it in the header/footer
  is real text (crisper, accessible, keeps the image small); `alt=""` on those
  instances is intentional. The hero instance carries `alt="ESJ Law Offices"`.
  Regenerate the light variant with the recolour step in the image script noted
  in git history if the source mark changes.
- **Header is dark navy** so the navy/gold mark sits on it natively and to give
  the site a conventional, upmarket law-firm feel.
- **Favicons / icons** were generated from the same monogram
  (`favicon.ico` + 16/32/48/192/512 PNGs, `apple-touch-icon.png`), plus an
  Open Graph image (`assets/images/og-image.jpg`).
- **Fonts**: Playfair Display (headings) via Google Fonts with a serif fallback;
  a system UI sans-serif stack for body text (no webfont download for body).
- **Type / bio content** on About and Practice Areas is taken verbatim in
  substance from the supplied profile PDF; nothing about her background was
  invented.

---

## License / ownership

All site content and the ESJ Law Offices brand are the property of
Elizabeth L. Salmon-James / ESJ Law Offices. Not licensed for reuse.
