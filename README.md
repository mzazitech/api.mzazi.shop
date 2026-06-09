# NexusAPI Documentation Website

A modern, responsive API documentation website with dark glassmorphism design, neon blue accents, and full Vercel deployment support.

## Features

- **5 Pages**: Home, Documentation, Pricing, Status, Contact
- **Dark Glassmorphism UI** with neon blue (`#00d4ff`) accents
- **Responsive** — works on mobile, tablet, and desktop
- **Sidebar navigation** on the docs page
- **Search endpoints** — live filter on the documentation page
- **Copy buttons** — copy endpoint URLs, request examples, and response examples
- **Toast notifications** — confirmation feedback on copy actions
- **Animated statistics** — counter animations on scroll
- **API key section** — mock key display with copy and regenerate
- **Live latency simulation** — updates every 2 seconds on the status page
- **Uptime history charts** — 90-day uptime visualization
- **Contact form** — with submit animation
- **Mobile menu** — hamburger toggle for small screens
- **Page loader** — smooth loading animation
- **Vercel-ready** — deploys in one click

## File Structure

```
/
├── index.html          # Home page
├── docs.html           # API documentation with endpoint cards
├── pricing.html        # Free / Premium / Enterprise plans
├── status.html         # Live system status & uptime history
├── contact.html        # Telegram, WhatsApp, Email, GitHub, Discord
├── css/
│   └── style.css       # All styles (glassmorphism, animations, responsive)
├── js/
│   └── script.js       # Copy, search, counters, toast, sidebar highlight
├── vercel.json         # Vercel routing & cache headers config
└── README.md           # This file
```

## Deploy to Vercel

### Option 1 — Vercel CLI

```bash
npm i -g vercel
cd api-docs
vercel
```

### Option 2 — Vercel Dashboard

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import Repository
3. Select your repo — Vercel detects it as a static site automatically
4. Click **Deploy**

No build step required. The site is pure HTML/CSS/JS.

## Customization

### Change the API name
Search for `NexusAPI` across all HTML files and replace it with your API name.

### Change the base URL
Search for `api.nexusapi.dev` across all files and replace it with your real API domain.

### Update endpoints (docs.html)
Each endpoint is a `.endpoint-card` div. Copy an existing card and update:
- The `id` attribute (used for sidebar linking)
- The `data-copy` value on the Copy URL button
- The method badge class (`badge-get`, `badge-post`, `badge-del`, etc.)
- The path, description, parameters, and code examples

### Update contact links (contact.html)
- Replace `https://t.me/nexusapi_support` with your Telegram handle
- Replace `https://wa.me/15551234567` with your WhatsApp number
- Replace `support@nexusapi.dev` with your email address
- Replace `https://github.com/nexusapi` with your GitHub URL

### Change the color accent
In `css/style.css`, update the CSS variables:
```css
--neon: #00d4ff;        /* Primary neon accent */
--neon-2: #7c3aed;      /* Secondary purple accent */
```

## Tech Stack

- Pure HTML5, CSS3, JavaScript (ES2020)
- Google Fonts: Inter + JetBrains Mono
- No frameworks, no build tools, no dependencies
- CSS custom properties for theming
- IntersectionObserver for scroll animations
- Clipboard API for copy functionality
