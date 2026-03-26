# NutriFit — Next.js Migration + Responsive + SEO Spec (v6)

## 📊 Research Summary

### Why Migrate:
- Vite+React = Client-Side Rendering (CSR) → Google sees empty div + script tag → BAD for SEO
- Next.js = Server-Side Rendering (SSR) + Static Generation (SSG) → Google sees full HTML → GOOD for SEO
- Next.js official migration guide exists: nextjs.org/docs/app/guides/migrating/from-vite
- Vercel (already your host) is built by the Next.js team → zero-config deployment
- Next.js App Router gives: file-based routing, built-in SEO metadata, automatic code splitting, image optimization

### Migration Strategy (from Next.js official docs):
1. Create fresh Next.js project with App Router
2. Move components, stores, services, data AS-IS (they're all client components)
3. Convert pages from React Router → file-system routing
4. Add 'use client' to interactive components (Zustand stores, animations, forms)
5. Add SEO metadata to each page (server components)
6. Make responsive with Tailwind breakpoints
7. Deploy to same Vercel project

### What Changes vs What Stays:

| Layer | Before (Vite) | After (Next.js) | Change Level |
|-------|--------------|-----------------|-------------|
| Framework | Vite + React 18 | Next.js 15 (App Router) | **MAJOR** |
| Routing | react-router-dom v6 | File-system routing (/app) | **MAJOR** |
| Styling | Tailwind CSS 3.4 | Tailwind CSS 3.4 (same) | No change |
| State | Zustand | Zustand (same) | No change |
| Components | All client-side | 'use client' directive | Minor |
| Data/JSON | Local imports | Local imports (same) | No change |
| Services | ai.js, mealEngine, etc. | Same files, same logic | No change |
| SEO | None | Full metadata per page | **NEW** |
| Images | Standard img tags | next/image (optimized) | Minor |
| Fonts | Google Fonts link | next/font/google | Minor |
| Deployment | Vercel (same) | Vercel (same) | No change |

---

## 📁 New Project Structure (Next.js App Router)

```
nutrifit/
├── app/                              # Next.js App Router (replaces src/pages)
│   ├── layout.jsx                    # Root layout (html, body, font, global CSS, bottom nav)
│   ├── page.jsx                      # Landing/redirect → /dashboard or /onboarding
│   ├── globals.css                   # Tailwind imports + custom styles
│   ├── loading.jsx                   # Global loading skeleton
│   ├── not-found.jsx                 # Custom 404 page
│   │
│   ├── onboarding/
│   │   └── page.jsx                  # 5-step onboarding (client component)
│   │
│   ├── dashboard/
│   │   ├── layout.jsx                # Dashboard layout with bottom nav
│   │   └── page.jsx                  # Main dashboard with protein ring
│   │
│   ├── meals/
│   │   └── page.jsx                  # Meal plan with check-off tracking
│   │
│   ├── nutrients/
│   │   └── page.jsx                  # Nutrition tracking
│   │
│   ├── trainer/
│   │   └── page.jsx                  # Trainer mode
│   │
│   ├── profile/
│   │   └── page.jsx                  # Profile & settings
│   │
│   ├── history/
│   │   └── page.jsx                  # Meal history & streaks
│   │
│   └── sitemap.js                    # Auto-generated sitemap for SEO
│
├── components/                       # All reusable components (SAME as before)
│   ├── ui/                           # Button, Card, Input, etc.
│   ├── protein/                      # ProteinRing, ProteinBar, etc.
│   ├── meals/                        # MealCard, SwapSheet, etc.
│   ├── nutrition/                    # MacroRing, NutrientBar, etc.
│   ├── schedule/                     # MorningCheckin, RoutinePicker, etc.
│   ├── tracker/                      # DayHeader, MealTimeline, etc.
│   ├── trainer/                      # ProteinVerification, TrainerCard, etc.
│   ├── supplements/                  # SupplementSheet, SupplementCard, etc.
│   ├── ai/                           # AiCoachCard, CustomMealChat, etc.
│   └── layout/                       # NEW: responsive layout components
│       ├── BottomNav.jsx             # Mobile bottom nav
│       ├── Sidebar.jsx               # Desktop sidebar nav
│       ├── ResponsiveLayout.jsx      # Switches between mobile/tablet/desktop
│       ├── MobileContainer.jsx       # Max-w-md centered container
│       └── DesktopGrid.jsx           # Multi-column desktop layout
│
├── stores/                           # Zustand stores (SAME, no changes)
├── services/                         # ai.js, mealEngine, etc. (SAME)
├── data/                             # JSON meal database (SAME)
├── utils/                            # Helpers (SAME)
│
├── public/
│   ├── icons/                        # PWA icons (192x192, 512x512)
│   ├── og-image.png                  # Open Graph image for social sharing
│   ├── favicon.ico
│   └── manifest.json
│
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Updated with responsive breakpoints
├── package.json                      # Updated dependencies
├── .env.local                        # Environment variables (Next.js uses .env.local)
├── SPEC.md
├── README.md
└── vercel.json                       # (optional, Vercel auto-detects Next.js)
```

---

## 📱 Responsive Design System

### Breakpoints (Tailwind):
```
Mobile:   < 640px   (default — mobile-first)
Tablet:   640-1024px (sm: and md:)
Desktop:  > 1024px   (lg: and xl:)
```

### Layout per Breakpoint:

**Mobile (default):**
```
┌──────────────────────┐
│ [Header / DayHeader] │
│                      │
│ [Content Area]       │
│ (single column,      │
│  full width,         │
│  scrollable)         │
│                      │
│ [Bottom Nav Bar]     │
└──────────────────────┘
Max-width: 100vw
Padding: px-4
Bottom nav: fixed bottom
```

**Tablet (sm: to md:):**
```
┌─────────────────────────────┐
│ [Header / DayHeader]        │
│                             │
│ ┌───────────┐ ┌───────────┐│
│ │ Protein   │ │ Quick     ││
│ │ Ring +    │ │ Stats +   ││
│ │ Stats     │ │ AI Coach  ││
│ └───────────┘ └───────────┘│
│                             │
│ [Meal Cards — wider cards]  │
│                             │
│ [Bottom Nav Bar]            │
└─────────────────────────────┘
Max-width: 768px centered
2-column grid for stats
```

**Desktop (lg:+):**
```
┌──────────────────────────────────────────────┐
│ ┌─────┐ ┌─────────────────┐ ┌─────────────┐│
│ │     │ │                 │ │             ││
│ │ S   │ │ Main Content    │ │ Side Panel  ││
│ │ I   │ │ (Meal Plan /    │ │ (Protein    ││
│ │ D   │ │  Nutrients /    │ │  Stats /    ││
│ │ E   │ │  Timeline)      │ │  AI Coach / ││
│ │ B   │ │                 │ │  Quick      ││
│ │ A   │ │                 │ │  Actions)   ││
│ │ R   │ │                 │ │             ││
│ │     │ │                 │ │             ││
│ └─────┘ └─────────────────┘ └─────────────┘│
└──────────────────────────────────────────────┘
Sidebar nav (replaces bottom nav)
3-column: sidebar + main + side panel
Max-width: 1280px centered
```

### Component Responsive Rules:
```
MealCard:
  Mobile:  full width, stacked layout
  Tablet:  wider card, protein bar inline
  Desktop: larger card with more details visible, side-by-side layout

ProteinRing:
  Mobile:  120px diameter
  Tablet:  160px diameter
  Desktop: 200px diameter

DailyOverview:
  Mobile:  single column stack
  Tablet:  2-column grid
  Desktop: horizontal strip with all stats inline

MealTimeline:
  Mobile:  vertical timeline, full width
  Tablet:  vertical timeline, centered
  Desktop: vertical timeline in main column, stats in side panel

BottomSheet/Modal:
  Mobile:  slides up from bottom (sheet)
  Tablet:  slides up from bottom (wider sheet)
  Desktop: centered modal dialog

Navigation:
  Mobile:  bottom nav bar (fixed)
  Tablet:  bottom nav bar (fixed)
  Desktop: left sidebar (fixed)
```

---

## 🔍 SEO Configuration

### Per-Page Metadata:

```javascript
// app/layout.jsx — Root metadata
export const metadata = {
  metadataBase: new URL('https://nutri-fit-iota.vercel.app'),
  title: {
    default: 'NutriFit — AI-Powered Protein-First Nutrition Planner',
    template: '%s | NutriFit'
  },
  description: 'Set your protein target. Get a full day of delicious Indian meals instantly. Free AI-powered nutrition guide for gym, yoga & fitness enthusiasts. Veg, Non-Veg, Vegan.',
  keywords: ['protein tracker', 'meal planner', 'Indian diet plan', 'fitness nutrition', 'gym meal plan', 'protein calculator', 'veg protein meals', 'workout nutrition'],
  authors: [{ name: 'Snehal Kanzariya' }],
  creator: 'Snehal Kanzariya',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://nutri-fit-iota.vercel.app',
    title: 'NutriFit — Hit Your Protein Target Every Day',
    description: 'AI-powered daily nutrition guide. 152+ Indian recipes. Protein-first meal planning for gym, yoga & fitness enthusiasts.',
    siteName: 'NutriFit',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'NutriFit - Protein-First Nutrition' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriFit — AI Protein-First Nutrition Planner',
    description: 'Set your protein goal. Get delicious Indian meals. Free forever.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://nutri-fit-iota.vercel.app' },
};

// app/dashboard/page.jsx
export const metadata = {
  title: 'Dashboard',
  description: 'Track your daily protein intake with real-time meal check-offs and protein velocity tracking.',
};

// app/meals/page.jsx
export const metadata = {
  title: 'Meal Plan',
  description: 'Your personalized protein-matched Indian meal plan. Swap, skip, or check off meals as you eat them.',
};

// app/nutrients/page.jsx
export const metadata = {
  title: 'Nutrition Tracking',
  description: 'Detailed protein, macro, and micronutrient tracking. Glow nutrients for skin, hair, and energy.',
};

// app/trainer/page.jsx
export const metadata = {
  title: 'Trainer Mode',
  description: 'Modify meal plans with live protein verification. Auto-fix protein gaps and validate nutrition targets.',
};
```

### Structured Data (JSON-LD):
```javascript
// app/layout.jsx — add to <head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "NutriFit",
  "url": "https://nutri-fit-iota.vercel.app",
  "description": "AI-powered protein-first nutrition planner with 152+ Indian recipes",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
}
</script>
```

### Sitemap (auto-generated):
```javascript
// app/sitemap.js
export default function sitemap() {
  return [
    { url: 'https://nutri-fit-iota.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://nutri-fit-iota.vercel.app/dashboard', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: 'https://nutri-fit-iota.vercel.app/meals', lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: 'https://nutri-fit-iota.vercel.app/nutrients', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: 'https://nutri-fit-iota.vercel.app/trainer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];
}
```

### robots.txt:
```javascript
// app/robots.js
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://nutri-fit-iota.vercel.app/sitemap.xml',
  };
}
```

---

## 🚀 Claude CLI Prompts (3 Prompts)

### PROMPT 1: Create Next.js Project + Migrate Files

```
I need to migrate NutriFit from React+Vite to Next.js App Router. Read FEATURE-SPEC-V6.md for the full plan.

IMPORTANT: Do NOT delete the existing code. Create a NEW Next.js project alongside, then move files.

Step 1 — Create new Next.js project:
- Run: npx create-next-app@latest nutrifit-next --js --app --tailwind --eslint --no-src-dir --import-alias "@/*"
- This creates a fresh Next.js App Router project with Tailwind

Step 2 — Install all existing dependencies:
npm install zustand recharts framer-motion lucide-react dexie

Step 3 — Move files from old project to new:
- Copy components/ → nutrifit-next/components/ (ALL component folders as-is)
- Copy stores/ → nutrifit-next/stores/
- Copy services/ → nutrifit-next/services/
- Copy data/ → nutrifit-next/data/
- Copy utils/ → nutrifit-next/utils/
- Copy public/ assets → nutrifit-next/public/

Step 4 — Convert pages to App Router file-system routing:

Create app/layout.jsx (root layout):
- Import globals.css (Tailwind)
- Load 'Outfit' font using next/font/google
- Add full SEO metadata from FEATURE-SPEC-V6.md (title, description, openGraph, twitter, keywords)
- Add JSON-LD structured data
- Wrap children with Zustand providers if needed
- Add bg-gray-950 to html and body
- Add responsive container

Create these page files (each exports metadata + a 'use client' component):
- app/page.jsx → redirect to /dashboard or /onboarding based on isOnboarded
- app/onboarding/page.jsx → import existing Onboarding component with 'use client'
- app/dashboard/page.jsx → import Dashboard with 'use client' + page metadata
- app/meals/page.jsx → import MealPlan with 'use client' + page metadata  
- app/nutrients/page.jsx → import Nutrients with 'use client' + page metadata
- app/trainer/page.jsx → import Trainer with 'use client' + page metadata
- app/profile/page.jsx → import Profile with 'use client' + page metadata
- app/history/page.jsx → import History with 'use client' + page metadata
- app/sitemap.js → generate sitemap from FEATURE-SPEC-V6.md
- app/robots.js → generate robots.txt from FEATURE-SPEC-V6.md
- app/not-found.jsx → custom 404 page with NutriFit branding
- app/loading.jsx → skeleton loading component

Step 5 — Fix all imports:
- Add 'use client' directive to ALL components that use: useState, useEffect, useRef, onClick, onChange, Zustand hooks, Framer Motion, Recharts, or any browser API
- Update import paths to use @/ alias (e.g., @/components/protein/ProteinRing)
- Replace react-router-dom navigation:
  * useNavigate() → useRouter() from 'next/navigation'
  * <Link to="/meals"> → <Link href="/meals"> from 'next/link'
  * useParams() → useParams() from 'next/navigation'
  * useLocation() → usePathname() from 'next/navigation'
- Remove react-router-dom from package.json

Step 6 — Update navigation:
- Replace BottomNav links from react-router <Link> to next/link <Link>
- Active tab detection: use usePathname() instead of useLocation()
- Create components/layout/BottomNav.jsx with 'use client'

Step 7 — Create next.config.js:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },  // for Vercel free tier
};
module.exports = nextConfig;
```

Step 8 — Update .env:
- Rename .env to .env.local (Next.js convention)
- NEXT_PUBLIC_GEMINI_API_KEY (was VITE_GEMINI_API_KEY)
- NEXT_PUBLIC_GROQ_API_KEY (was VITE_GROQ_API_KEY)
- NEXT_PUBLIC_OPENROUTER_API_KEY (was VITE_OPENROUTER_API_KEY)
- Update all import.meta.env.VITE_* references to process.env.NEXT_PUBLIC_*

Step 9 — Test:
npm run dev → open localhost:3000
- Verify onboarding flow works
- Verify dashboard loads
- Verify meals page works
- Verify all navigation works
- Check browser console for errors
```

### PROMPT 2: Make Fully Responsive (Mobile + Tablet + Desktop)

```
Read FEATURE-SPEC-V6.md responsive design section. Make NutriFit fully responsive across mobile, tablet, and desktop.

1. Update tailwind.config.js — ensure breakpoints:
   sm: 640px, md: 768px, lg: 1024px, xl: 1280px

2. Create components/layout/ResponsiveLayout.jsx:
   - Detects screen size using Tailwind responsive classes
   - Mobile (<640px): single column, bottom nav, max-w-md mx-auto
   - Tablet (640-1024px): wider content, 2-column stats grid, bottom nav
   - Desktop (>1024px): sidebar nav + main content + side panel (3-column grid)

3. Create components/layout/Sidebar.jsx (desktop only):
   - Left sidebar: 64px wide, fixed, dark bg
   - Icons: Dashboard, Meals, Nutrients, Trainer, Profile, History
   - Active indicator: violet-500 left border
   - Only visible on lg: breakpoint and above
   - Replaces bottom nav on desktop

4. Create components/layout/DesktopGrid.jsx:
   - 3-column layout for desktop: sidebar (64px) + main (flex-1) + side panel (320px)
   - Side panel shows: protein stats, AI coach, quick actions
   - Only on lg: and above

5. Update app/dashboard/layout.jsx:
   - Mobile/Tablet: BottomNav at bottom
   - Desktop: Sidebar on left, no bottom nav
   - Use responsive classes: hidden lg:block for sidebar, lg:hidden for bottom nav

6. Update ALL components for responsive behavior:

   MealCard:
   - Mobile: full width, stacked
   - sm: wider padding, protein bar has more space
   - lg: larger card, show more details inline, side-by-side protein bar + stats

   ProteinProgressRing:
   - Mobile: w-28 h-28 (112px)
   - sm: w-36 h-36 (144px)
   - lg: w-48 h-48 (192px)

   DailyOverview:
   - Mobile: stacked vertically
   - sm: grid grid-cols-2 gap-4
   - lg: grid grid-cols-4 gap-6 (all stats in one row)

   MealTimeline:
   - Mobile: full width vertical timeline
   - lg: timeline in main column, stats in side panel

   Morning Check-in / Bottom Sheets:
   - Mobile: bottom sheet (slides up)
   - lg: centered modal dialog (max-w-lg mx-auto)

   Per-Meal Protein Bars:
   - Mobile: thin bars (h-2)
   - sm: medium bars (h-3)
   - lg: larger bars (h-4) with labels inside

   Onboarding:
   - Mobile: full-screen steps, single column
   - sm: max-w-lg centered card
   - lg: max-w-xl centered with decorative side panel

   Trainer Mode:
   - Mobile: single column, sticky verification panel
   - lg: 2-column: editable meals left, verification panel right (sticky)

   Navigation tabs (Meals | Nutrients | AI Coach):
   - Mobile: full-width tabs
   - lg: tabs within main content area

7. Typography responsive:
   - Headings: text-xl sm:text-2xl lg:text-3xl
   - Body: text-sm sm:text-base
   - Stats numbers: text-2xl sm:text-3xl lg:text-4xl
   - Protein ring number: text-3xl sm:text-4xl lg:text-5xl

8. Spacing responsive:
   - Page padding: px-4 sm:px-6 lg:px-8
   - Card padding: p-4 sm:p-5 lg:p-6
   - Gap between cards: gap-3 sm:gap-4 lg:gap-6

9. Test at these widths:
   - 375px (iPhone SE)
   - 390px (iPhone 14)
   - 768px (iPad)
   - 1024px (iPad landscape)
   - 1440px (Desktop)
   - 1920px (Large desktop)
   Verify: no horizontal scroll, no overflow, no cut-off content at ANY width.
```

### PROMPT 3: SEO + Performance + README Update

```
Read FEATURE-SPEC-V6.md SEO section. Add full SEO and optimize performance.

1. SEO Metadata — already added in Prompt 1, verify all pages have:
   - Unique title and description
   - OpenGraph tags (title, description, image, url)
   - Twitter card tags
   - Canonical URL

2. Create public/og-image.png:
   - Generate a simple OG image using HTML canvas or a pre-made image
   - 1200x630px, dark background (#030712), NutriFit logo/text, tagline
   - "NutriFit — Hit Your Protein Target Every Day"
   - Violet accent color

3. Add JSON-LD structured data to app/layout.jsx:
   - WebApplication schema
   - name: NutriFit, category: HealthApplication, price: 0

4. Verify app/sitemap.js generates correct XML sitemap
5. Verify app/robots.js generates correct robots.txt
6. Add app/manifest.json link for PWA support

7. Performance optimizations:
   - Use next/image for any images (with lazy loading)
   - Use next/font/google for Outfit font (no external request)
   - Add loading.jsx skeletons for each page
   - Verify Tailwind CSS is purged (no unused classes in production)
   - Check: npm run build → verify no errors, check bundle size

8. Accessibility:
   - All buttons have aria-labels
   - All images have alt text
   - Color contrast: text on dark bg meets WCAG AA
   - Focus indicators on interactive elements
   - Skip to content link

9. Create app/not-found.jsx:
   - Custom 404 page with NutriFit branding
   - "This page doesn't exist" message
   - Link back to Dashboard
   - Dark theme matching app

### PART FINAL: Update README.md

After ALL migration work, update README.md:

1. Update "🏗️ Tech Stack" table:
   - Change "React 18 + Vite" → "Next.js 15 (App Router) + React 18"
   - Change "React Router v6" → "File-system routing (Next.js App Router)"
   - Add row: "SEO | Next.js Metadata API + JSON-LD + Sitemap"
   - Add row: "Font | next/font/google (Outfit, zero layout shift)"
   - Add row: "Responsive | Mobile + Tablet + Desktop (Tailwind breakpoints)"

2. Add new feature section:
   ### 📱 Fully Responsive Design
   NutriFit works beautifully on every screen size — phone, tablet, and desktop. Mobile gets a bottom navigation bar, tablets get a 2-column layout, and desktop users get a full sidebar + main content + side panel layout. Every component scales gracefully from 375px to 1920px.

   ### 🔍 SEO Optimized
   Built with Next.js App Router for server-side rendering. Every page has unique meta tags, OpenGraph images for social sharing, structured JSON-LD data, auto-generated sitemap, and robots.txt. Google can fully crawl and index every page — unlike client-side-only React apps.

3. Update "🛣️ Roadmap":
   - [x] Migrate to Next.js (SEO + SSR)
   - [x] Fully responsive (mobile + tablet + desktop)

4. Update "🏆 What Makes NutriFit Different" table:
   Add rows:
   | SEO optimized (SSR) | ❌ (CSR only) | ❌ (CSR only) | ✅ Next.js SSR |
   | Responsive (phone to desktop) | ✅ | ✅ | ✅ (3-column desktop) |

5. Update project structure to reflect new /app directory layout

Test:
- npm run build (no errors)
- npm run start (production mode works)
- Check localhost:3000 → all pages load
- View page source → verify HTML content is present (not empty div)
- Test Google Rich Results: https://search.google.com/test/rich-results
- Test mobile: Chrome DevTools → responsive mode → 375px, 768px, 1440px
- Deploy: git push → Vercel auto-deploys Next.js

Commit: git add -A && git commit -m "feat: migrate to Next.js + responsive design + SEO optimization + update README"
```
