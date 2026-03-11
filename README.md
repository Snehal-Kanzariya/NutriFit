# 🥗 NutriFit — AI-Powered Personalized Nutrition Guide

🔗 **Live Demo:** [https://nutri-fit-iota.vercel.app](https://nutri-fit-iota.vercel.app/)

**Tell us your protein goal. We'll build your day.**

NutriFit is an AI-powered daily nutrition planner built for fitness enthusiasts. Unlike traditional calorie-tracking apps that look backward at what you ate, NutriFit looks forward — it tells you **exactly what to eat, when to eat it, and makes it delicious**, all built around your protein target.

![NutriFit](https://img.shields.io/badge/NutriFit-Protein--First%20Nutrition-8b5cf6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🎯 The Problem

Every fitness nutrition app today asks: *"What did you eat?"* — then tells you how many calories you consumed. That's backward-looking and unhelpful.

**What people actually need:** *"I want 60g protein today — what exactly should I eat?"*

No existing app answers this well, especially for Indian cuisine.

## 💡 The Solution

NutriFit flips the model. You set your **protein target** → the app builds your entire day's meals around it.

**How it works:**
1. Set your protein goal (e.g., 60g)
2. Pick today's activity (gym, yoga, rest day)
3. App generates a full day of tasty Indian meals hitting exactly your target
4. Each meal shows its protein contribution
5. Swap, skip, or boost meals — protein totals update in real-time

---

## ✨ Key Features

### 🎯 Protein-Target-First Engine
The hero feature. Set your daily protein target, and the app intelligently distributes it across meals — post-workout gets 30%, lunch gets 25%, breakfast 20%, etc. Every meal is selected by **protein-match-first** algorithm, not random selection.

### 🍽️ Smart Meal Planning
- **152+ Indian recipes** across 4 diet types (Non-Veg, Veg, Vegan, Eggetarian)
- Recipes from North Indian, South Indian, Gujarati, Bengali, and fusion cuisines
- Every meal is genuinely **tasty** — no bland bodybuilder food
- Meals tagged by prep time (⚡ Quick ≤10min or 🍳 Cook 15-30min)

### 🔄 Full Meal Flexibility
- **Swap** any meal → alternatives sorted by closest protein match
- **Skip** a meal → protein auto-redistributes to remaining meals
- **Protein Booster** → when you're short, get quick-add suggestions (peanuts +7g, milk +8g, etc.)
- Adjust schedule mid-day without losing your plan

### 📅 Life Schedule Adaptation
- Morning check-in: *"What's your plan today?"*
- Presets: Student, Office, WFH, Early Bird, Night Shift
- Workout-synced timing: meals adapt around your gym/yoga/cardio schedule
- Can't cook? Toggle to quick-meals-only mode

### 📊 Nutrition Dashboard
- **Protein Progress Ring** — big, violet, front-and-center
- Per-meal protein breakdown bars
- Macro tracking: Calories, Carbs, Fat, Fiber
- Glow Nutrients: Iron, Vitamin C, Zinc, B12, Biotin (for skin, hair, energy)
- Weekly protein trend chart with streak tracking

### 🤖 AI Nutrition Coach (100% Free)
- Personalized daily tips powered by AI
- Protein-focused advice using Indian food suggestions
- Multi-provider setup: never fails, always free

### 🌿 Diet Support
- **Non-Veg**: Chicken tikka, fish curry, egg bhurji, keema
- **Vegetarian**: Paneer paratha, palak paneer, rajma, chole
- **Vegan**: Tofu scramble, chana masala, ragi dosa, mushroom stir-fry
- **Eggetarian**: Egg curry, omelette combos, egg fried rice

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3.4 |
| State | Zustand |
| Routing | React Router v6 |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Storage | IndexedDB (Dexie.js) |
| AI (Primary) | Google Gemini 2.5 Flash — FREE |
| AI (Fallback) | Groq Llama 3.3 70B — FREE |
| AI (Emergency) | OpenRouter free models — FREE |
| Deployment | Vercel |

**Zero API cost** — all AI providers are free tier, no credit card required.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Snehal-Kanzariya/NutriFit.git
cd NutriFit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Get Free API Keys

| Provider | URL | Cost |
|----------|-----|------|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | Free |
| Groq | [console.groq.com](https://console.groq.com) | Free |
| OpenRouter | [openrouter.ai/keys](https://openrouter.ai/keys) | Free |

Add your keys to `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_key
VITE_GROQ_API_KEY=your_groq_key
VITE_OPENROUTER_API_KEY=your_openrouter_key
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Push to GitHub → Vercel auto-deploys
git push origin main
```

Live at: [https://nutri-fit-iota.vercel.app](https://nutri-fit-iota.vercel.app/)

---

## 📁 Project Structure

```
nutrifit/
├── src/
│   ├── stores/              # Zustand state management
│   │   ├── useProfileStore    # Profile + protein target
│   │   ├── useScheduleStore   # Daily schedule + routines
│   │   ├── useMealPlanStore   # Meal plans + protein per slot
│   │   └── useNutritionStore  # Daily totals + weekly history
│   │
│   ├── services/            # Core business logic
│   │   ├── proteinAllocator   # Distribute protein across meals
│   │   ├── mealEngine         # Protein-match meal selection
│   │   ├── scheduleEngine     # Meal timing from schedule
│   │   ├── nutritionCalc      # BMR, TDEE, macro formulas
│   │   └── ai                 # Multi-provider AI (Gemini/Groq/OpenRouter)
│   │
│   ├── data/                # 152+ Indian recipes (JSON)
│   │   ├── meals-nonveg       # 38 non-veg recipes
│   │   ├── meals-veg          # 38 vegetarian recipes
│   │   ├── meals-vegan        # 38 vegan recipes
│   │   ├── meals-eggetarian   # 38 eggetarian recipes
│   │   └── protein-boosters   # Quick protein add-ons
│   │
│   ├── components/          # UI components
│   │   ├── protein/           # Protein ring, bars, booster, picker
│   │   ├── meals/             # Meal cards, swap sheet, filters
│   │   ├── nutrition/         # Macro rings, nutrient bars, charts
│   │   ├── schedule/          # Check-in, routine picker
│   │   └── ai/               # AI coach card
│   │
│   └── pages/               # Route-level pages
│       ├── Onboarding         # 5-step profile + protein setup
│       ├── Dashboard          # Protein ring + daily overview
│       ├── MealPlan           # Full day meals with protein bars
│       ├── Nutrients          # Protein-first tracking
│       ├── Profile            # Edit goals + protein target
│       └── History            # Protein streaks + trends
│
├── SPEC.md                  # Full product specification
└── CLI-GUIDE.md             # Claude CLI execution guide
```

---

## 📐 How the Protein Engine Works

### 1. User sets target
```
"I want 60g protein today"
```

### 2. Protein Allocator distributes across meals
```
Post-workout:  30% → 18g  (recovery priority)
Lunch:         25% → 15g  (main meal)
Breakfast:     20% → 12g  (start the day)
Dinner:        15% →  9g  (lighter at night)
Pre-workout:    5% →  3g  (light fuel)
Snack:          5% →  3g  (bridge gaps)
```

### 3. Meal Engine finds best protein-matched meals
```
Post-workout (target 18g) → Paneer Bhurji + Toast (22g) ≈ closest match
Lunch (target 15g) → Rajma Chawal + Raita (16g) ≈ close
Breakfast (target 12g) → Moong Dal Cheela (12g) ✅ exact
```

### 4. Smart redistribution on skip
```
Skip lunch? → Its 15g protein redistributes to dinner + snack
App auto-suggests higher-protein alternatives for remaining meals
```

---

## 🧮 Nutrition Formulas Used

**BMR (Mifflin-St Jeor):**
- Male: (10 × weight) + (6.25 × height) - (5 × age) + 5
- Female: (10 × weight) + (6.25 × height) - (5 × age) - 161

**Recommended Protein per kg body weight:**

| Goal | Protein/kg | 70kg Example |
|------|-----------|-------------|
| Muscle Gain | 2.2g | 154g |
| Fat Loss | 2.4g | 168g |
| Maintain | 1.8g | 126g |
| Recomposition | 2.0g | 140g |

---

## 🤖 AI Architecture

NutriFit uses a **multi-provider fallback** system — all free, zero cost:

```
Request → Gemini Flash (primary)
              ↓ fails?
         → Groq Llama 3.3 (fallback)
              ↓ fails?
         → OpenRouter free (emergency)
              ↓ fails?
         → Local hardcoded tips (offline)
```

The app **never breaks** — even without internet, the core meal planning works from the local JSON database.

---

## 🛣️ Roadmap

- [x] Protein-target-first meal engine
- [x] 152+ Indian recipe database
- [x] Multi-provider free AI coach
- [x] Morning check-in with flexible scheduling
- [x] Swap, skip, protein booster
- [x] Nutrition dashboard with protein ring
- [x] Glow nutrients tracking
- [x] Weekly protein streaks
- [ ] BCA / Blood report upload (PDF parsing)
- [ ] Ayurvedic dosha-based meal preferences
- [ ] Family meal planning mode
- [ ] Budget-aware meal optimization (₹/day)
- [ ] Grocery list generation
- [ ] PWA offline support
- [ ] Multi-language support (Hindi, Gujarati)

---

## 🏆 What Makes NutriFit Different

| Feature | MyFitnessPal | HealthifyMe | NutriFit |
|---------|-------------|-------------|----------|
| Protein-first planning | ❌ | ❌ | ✅ |
| Forward-looking meal guide | ❌ | Partial | ✅ |
| Indian cuisine depth | Poor | Good | ✅ 152+ recipes |
| Free AI coaching | ❌ (paid) | ❌ (paid) | ✅ (forever free) |
| Per-meal protein bars | ❌ | ❌ | ✅ |
| Skip → auto redistribute | ❌ | ❌ | ✅ |
| Protein booster suggestions | ❌ | ❌ | ✅ |
| Veg + Vegan + Eggetarian | Basic | Good | ✅ 4 diet types |
| No subscription needed | ❌ ($80/yr) | ❌ (₹800/mo) | ✅ Free |

---

## 🙏 Built With

This project was built using a **spec-driven development approach** with [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) — 10 targeted prompts referencing a single SPEC.md file, completed in 5 days.

**Development workflow:**
1. Write comprehensive SPEC.md (product spec + tech spec + algorithms)
2. Execute prompts sequentially in Claude CLI
3. Commit after each prompt
4. Deploy via Vercel auto-deploy on git push

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 👤 Author

**Snehal Kanzariya**
- GitHub: [@Snehal-Kanzariya](https://github.com/Snehal-Kanzariya)

---

<p align="center">
  <b>NutriFit</b> — Because every fitness enthusiast deserves to know exactly what to eat today. 🎯
</p>
