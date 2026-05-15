# Infinite Canvas

_An infinite 3D canvas built with React Three Fiber for exploring and displaying media in a seamless, immersive space._

![Image Title](https://tympanus.net/codrops/wp-content/uploads/2025/12/edoardo-lunardi-infinite-canvas-featured-image.jpg)

[Article on Codrops](https://tympanus.net/codrops/?p=106679)

[Demo](https://tympanus.net/Tutorials/InfiniteCanvas/)

## Features

- **Infinite 3D space** - Navigate through an endless grid of media items
- **Performance optimized** - Chunk-based rendering with distance-based culling
- **Touch & mouse controls** - Drag to pan, pinch/scroll to zoom
- **Keyboard navigation** - WASD to move, QE for up/down
- **Progressive loading** - Textures load on-demand with progress tracking

## Getting Started

```bash
npm install
npm run dev
```

## Eigen beelden (customizen)

1. Zet bestanden in **`public/`**, bijvoorbeeld `public/artworks/mijn-foto.jpg`.
2. Bewerk **`src/artworks/manifest.json`**: een array van objecten met **`url`** (pad vanaf site-root, bv. `artworks/mijn-foto.jpg`), **`width`** en **`height`** (pixelmaten voor het juiste aspect ratio).
3. De canvas gebruikt nu **`public/artworks/portfolio/`** (PNG’s) met een automatisch opgebouwd manifest; eigen beelden: voeg PNG’s toe en werk `src/artworks/manifest.json` bij (of kopieer bestanden naar `portfolio/` en herbouw het manifest).

Optioneel Art Institute-set opnieuw ophalen (schrijft naar `public/artworks/vendors/artic/` + `src/artworks/manifest.artic.generated.json`):

```bash
npx tsx scripts/download-artworks.ts
```

## Vercel (hosting + wachtwoord)

1. **Project op Vercel**: importeer deze GitHub-repo in [Vercel](https://vercel.com/new) (of `npx vercel` met Node 20–24 als de CLI over je Node-versie klaagt).
2. **Build**: **Framework preset = Vite** (staat in `vercel.json` als `"framework": "vite"`). Build-commando blijft **`npm run build`** (Vite schrijft naar `dist`).
3. **Belangrijk — anders werkt geen wachtwoord via `middleware.ts`:** onder **Project → Settings → General → Build & Output** mag **Output Directory** niet handmatig op `dist` staan als dat “alleen statische files” oplevert zonder Edge Middleware. Laat **Output Directory leeg** (default voor Vite), zodat Vercel de volledige Vite-build inclusief **Routing Middleware** gebruikt.
4. **Site-wachtwoord** (custom login op `/login`, cookie `site_access`):
   - **Settings → Environment Variables**
   - Aanbevolen: **`SITE_ACCESS_PASSWORD`**. Ook ondersteund (legacy): `SITE_BASIC_AUTH_PASSWORD`, `BASIC_AUTH_PASSWORD`, `VERCEL_BASIC_AUTH_PASSWORD`.
   - Zet de variabelen op **Production** én **Preview** als je alle deployment-URL’s wilt afschermen.
   - Na wijzigingen: **Deployments → Redeploy** zodat de nieuwe env zichtbaar is op de edge én in serverless functions (`/api/login`).
   - Zonder wachtwoord-env blijft de site openbaar (geen redirect naar `/login`).

**Lokaal bekijken (alleen frontend):** `npm run preview:dist` — opent de productie-build op poort **4173**. Login/API werken alleen met `npx vercel dev` of na deploy op Vercel.

## Eigen webhosting (FTP / statisch)

1. **Build:** `npm run build` (alias: `npm run build:ftp`) → map **`dist/`**.
2. **Zip (optioneel):** `npm run pack:ftp` → **`infinite-canvas-ftp.zip`** in de projectroot.
3. **Upload:** upload **alle inhoud** van `dist/` naar je webroot (bijv. `public_html`), niet de map `dist` zelf.
4. **Apache:** `.htaccess` uit `public/` wordt mee gekopieerd voor SPA-routes (`/login`, enz.). Staat de site in een **submap**, pas `RewriteBase` in `.htaccess` aan (bijv. `/mijn-map/`).
5. **Let op:** op pure statische hosting werken **geen** Vercel-middleware en **geen** `/api/login` — de custom login en cookie-beveiliging vallen weg; de canvas is dan **openbaar** tenzij je hosting zelf wachtwoordbeveiliging biedt (bijv. Apache `.htpasswd`, panel “Directory privacy”).

## Lokaal openen (dubbelklik / `file://`)

De normale map **`dist/`** werkt **niet** als je `index.html` dubbelklikt (browsers blokkeren ES-modules via `file://`).

Gebruik de **offline-build**:

```bash
npm run build:local
```

Open daarna:

**`dist-local/index.html`** (dubbelklik in Finder)

Of zip: `npm run pack:local` → **`infinite-canvas-local.zip`**.

- Map: `…/infinite-canvas/dist-local/`
- Eén gebundeld script (geen `type="module"`), hash-routing (`#/`)
- Login/API werkt hier niet; je ziet direct de canvas
- Voor Vercel/FTP blijf je **`npm run build`** → **`dist/`** gebruiken

**Als login niet werkt:** controleer stap 3 (Output Directory) en of `SITE_ACCESS_PASSWORD` op Production staat.

## Tech Stack

- React 19
- Three.js
- React Three Fiber
- TypeScript
- Vite

## Credits

- Gebaseerd op het [Infinite Canvas](https://github.com/edoardolunardi/infinite-canvas)-project en de [Codrops-tutorial](https://tympanus.net/codrops/2026/01/07/infinite-canvas-building-a-seamless-pan-anywhere-image-space/).
- Optioneel: beelden via [The Art Institute of Chicago Open Access API](https://www.artic.edu/open-access/public-api) (`scripts/download-artworks.ts`).

## Misc

Follow Edoardo: [Instagram](https://www.instagram.com/edo.tsx/), [GitHub](https://github.com/edoardolunardi), [LinkedIn](https://www.linkedin.com/in/edoardolunardi/), [X](https://x.com/edo_lunardi)

Follow Codrops: [X](http://www.x.com/codrops), [Facebook](https://www.facebook.com/codrops), [Instagram](https://www.instagram.com/codropsss/), [LinkedIn](https://www.linkedin.com/company/codrops/), [GitHub](https://github.com/codrops)

## License

[MIT](LICENSE)
