# ESJ Law Offices — marketing website

A fast, fully static marketing website for **ESJ Law Offices**, the practice of
**Elizabeth L. Salmon-James, Attorney-at-Law & Notary Public**.

Tagline: _Justice. Integrity. Results._

- Plain **HTML5 + CSS3 + vanilla JavaScript** — no frameworks, no build step, no backend.
- Multi-page site: Home, About, Practice Areas, Contact.
- Mobile-first and responsive, with a hamburger menu on small screens.
- Branding:
  - Header/nav and footer: plain text wordmark (no logo graphic).
  - Home hero (navy): a small **decorative CSS/type monogram** — " E S J" in the
    serif face with a gold "S", over a rule-flanked "LAW OFFICES". Built entirely
    from markup + CSS in the cream/gold palette so it reads on navy. This is a
    brand accent, **not** the official logo.
  - The real logo file (`source-materials/logo.png`, black background keyed out →
    `assets/images/logo-lockup.png`, used as-is — no redraw) is placed on two
    **light** sections where its navy letterforms read: left-aligned at the top of
    the Home page's "about preview" section, and above the About page's bio.
  See "Design notes" below.
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
- **Logo placement** — `source-materials/logo.png` is a dark, glowing composition
  (gold "S" ribbon between navy "E"/"J" letterforms, plus the firm wordmark and
  tagline). Its navy elements vanish on a blue background, so it is **not** used
  in the dark navy header, hero or footer.
  - `assets/images/logo-lockup.png` — the whole official lockup with only its
    black background alpha-keyed away (nothing redrawn or recoloured) — is placed
    left-aligned as a brand block on two cream sections where every part of it
    reads: the top of the Home "about preview" section and above the About-page
    bio. `alt` carries the full firm name, credentials and tagline.
  - The **navy hero** instead gets a decorative typographic monogram
    (`.hero-monogram` / `.hm-*` in `styles.css`): the letters "E S J" in
    Playfair Display with a gold "S", above a gold-rule-flanked "LAW OFFICES".
    Pure CSS + text, `aria-hidden` (decorative — the firm name is in the header
    and lead copy). It is a matching accent, not a stand-in for the logo file.
- **Header is dark navy** to give the site a conventional, upmarket law-firm feel.
- **Favicons / icons** (`favicon.ico` + 16/32/48/192/512 PNGs,
  `apple-touch-icon.png`) and the Open Graph image (`assets/images/og-image.jpg`)
  were generated earlier from the monogram and are unchanged.
- **Fonts**: Playfair Display (headings) via Google Fonts with a serif fallback;
  a system UI sans-serif stack for body text (no webfont download for body).
- **Type / bio content** on About and Practice Areas is taken verbatim in
  substance from the supplied profile PDF; nothing about her background was
  invented.

---

## License / ownership

All site content and the ESJ Law Offices brand are the property of
Elizabeth L. Salmon-James / ESJ Law Offices. Not licensed for reuse.
