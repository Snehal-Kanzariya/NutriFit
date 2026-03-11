<p align="center">
  <img src="https://img.icons8.com/emoji/96/green-salad.png" alt="NutriFit Logo" width="80" />
</p>

<h1 align="center">NutriFit</h1>

<p align="center">
  <strong>AI-Powered Personalized Nutrition Planner for Fitness Enthusiasts</strong>
</p>

<p align="center">
  <em>"Tell us your protein goal. We'll build your day."</em>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#roadmap">Roadmap</a>
</p>

---

## The Problem

Every fitness nutrition app today is **backward-looking** — they tell you *"you ate 1800 calories today"* after you've already eaten. That's a food diary, not a food guide.

Gym-goers, yoga practitioners, and fitness enthusiasts don't need a diary. They need an answer to one simple question:

> **"What exactly should I eat today to hit my protein goal — and will it actually taste good?"**

Existing apps like MyFitnessPal, HealthifyMe, and Cronometer fail at this. They have massive food databases but zero intelligence about Indian cuisine, workout-aligned meal timing, or taste-forward planning.

## The Solution

**NutriFit** flips the model. It's **forward-looking** — you set your protein target, and the app builds your entire day of delicious, Indian-cuisine-friendly meals around it.

```
You say: "I want 60g protein today"

NutriFit builds:
  ├── Breakfast  → Moong Dal Cheela (12g protein)     7:00 AM
  ├── Pre-workout → Banana + Almonds (4g protein)      8:30 AM
  ├── Post-workout → Paneer Bhurji + Toast (18g)       10:00 AM
  ├── Lunch → Rajma Chawal + Raita (16g)                1:00 PM
  ├── Snack → Roasted Makhana (5g)                      4:30 PM
  └── Dinner → Mixed Dal Khichdi (10g)                  8:30 PM
                                          Total: 65g ✅
```

Every meal is protein-matched, workout-timed, and genuinely tasty.

---

## Features

### 🎯 Protein-Target-First Engine (Hero Feature)
The entire app revolves around one question: **"How much protein today?"**
- Set your daily protein goal with a slider (30g — 200g)
- App distributes protein intelligently across meals (30% to post-workout, 25% to lunch, etc.)
- Every meal is filtered and selected to match its protein allocation
- Swap a meal → alternatives are sorted by closest protein match
- Skip a meal → protein auto-redistributes to remaining meals
- End-of-day shortfall → Protein Booster suggests quick fixes

### 🍽️ Smart Meal Plan Generator
- **152+ Indian recipes** across 4 diet types: Non-Veg, Veg, Vegan, Eggetarian
- Meals from North Indian, South Indian, Gujarati, Bengali, and Pan-Indian cuisines
- Every recipe is genuinely tasty — no bland bodybuilder food
- Tagged by prep time: Quick (≤10 min) or Cook (15-30 min)
- Budget-aware: recipes tagged as budget / moderate / premium

### ☀️ Flexible Daily Schedule
- Morning check-in: "What's your plan today?" with protein target + activity picker
- Quick presets: Student, Office (9-6), WFH, Early Bird, Night Shift
- Workout-synced timing: meals auto-adjust around your gym/yoga/cardio schedule
- Rest day? Workout meal slots disappear, protein redistributes to regular meals
- Can't cook? Toggle to quick-meals-only mode

### 📊 Nutrition Dashboard
- **Protein Progress Ring** — the hero element (violet, always visible)
- Per-meal protein contribution bars
- Macro tracking: Calories, Carbs, Fat, Fiber
- Glow Nutrients: Iron, Vitamin C, Zinc, B12, Biotin, Omega-3 for skin/hair health
- Weekly trend charts with protein streak tracking

### 🤖 AI Nutrition Coach (100% Free)
- Personalized daily tips powered by AI
- Protein-aware: "You're 12g short — add paneer to dinner!"
- Multi-provider failover: Gemini → Groq → OpenRouter → local tips
- Zero cost for developers and users — forever

### 🔄 Meal Flexibility
- **Swap**: tap any meal → see 3 protein-matched alternatives
- **Skip**: grey out a meal → protein redistributes automatically
- **Restore**: bring back skipped meals anytime
- **Protein Booster**: quick add-ons when you're short on protein
- **Regenerate**: rebuild the entire day's plan in one tap

---

## Live Demo

🔗 **[nutrifit.vercel.app](https://nutrifit.vercel.app)** *(replace with your actual Vercel URL)*

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS 3.4 |
| **State** | Zustand |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Storage** | IndexedDB (Dexie.js) |
| **AI (Primary)** | Google Gemini 2.5 Flash — FREE |
| **AI (Fallback)** | Groq Llama 3.3 70B — FREE |
| **AI (Emergency)** | OpenRouter free models — FREE |
| **Deployment** | Vercel |

### Why These AI Providers?

All three AI providers are **100% free** with no credit card required:

| Provider | Free Limit | Speed | Use Case |
|----------|-----------|-------|----------|
| Google Gemini 2.5 Flash | 250 RPD | Fast | Primary — daily tips, meal suggestions |
| Groq (Llama 3.3 70B) | 14,400 RPD | Ultra fast | Fallback when Gemini hits limits |
| OpenRouter | 30+ free models | Varies | Emergency backup |

**Local-first architecture:** The core meal plan generation works 100% offline from the bundled recipe database. AI is an enhancement layer — if all APIs fail, the app still works perfectly.

---

## Getting Started

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

### Get Your Free API Keys

1. **Gemini**: Visit [aistudio.google.com](https://aistudio.google.com) → Get API Key
2. **Groq**: Visit [console.groq.com](https://console.groq.com) → Sign up → API Keys
3. **OpenRouter**: Visit [openrouter.ai/keys](https://openrouter.ai/keys) → Create Key

Add them to your `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_key_here
VITE_GROQ_API_KEY=your_groq_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Deploy to Vercel

```bash
# Push to GitHub (Vercel auto-deploys on push to main)
git add -A
git commit -m "feat: ready for production"
git push origin main
```

Or deploy manually:
```bash
npx vercel --prod
```

---

## How It Works

### The Protein-Target-First Algorithm

NutriFit's core innovation is building meals **around a protein target**, not just tracking calories.

```
┌─────────────────────────────────────────────────────┐
│                   USER INPUT                        │
│  "I want 60g protein today" + Gym at 9 AM + Veg    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│            SCHEDULE ENGINE                          │
│  Wake 6:30 → Workout 9:00 → Sleep 23:00            │
│  Generates: 6 meal slots with optimal timing        │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│          PROTEIN ALLOCATOR                          │
│  60g distributed:                                   │
│  Post-WO: 18g │ Lunch: 15g │ BF: 12g               │
│  Dinner: 9g   │ Pre-WO: 3g │ Snack: 3g             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│            MEAL ENGINE                              │
│  For each slot → filter DB by:                      │
│  diet type → meal type → cooking ability →          │
│  SORT by closest protein match → pick from top 5    │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│           YOUR DAILY MEAL PLAN                      │
│  6 meals, protein-matched, workout-timed, tasty     │
│  Total: ~63g protein (within ±15% tolerance) ✅     │
└─────────────────────────────────────────────────────┘
```

### Protein Distribution Rules

| Meal Slot | With Workout | Rest Day |
|-----------|-------------|----------|
| Post-workout | 30% | — |
| Lunch | 25% | 35% |
| Breakfast | 20% | 25% |
| Dinner | 15% | 25% |
| Pre-workout | 5% | — |
| Snack | 5% | 15% |

### Smart Redistribution

When you **skip** a meal, its protein doesn't disappear — it redistributes:

```
Skip lunch (15g) →
  Dinner: 9g → 16g (boosted)
  Snack: 3g → 6g (boosted)
  Protein Booster: "Add peanuts (+7g) to hit your target"
```

---

## Project Structure

```
nutrifit/
├── src/
│   ├── stores/              # Zustand state management
│   │   ├── useProfileStore  # Profile + protein target
│   │   ├── useScheduleStore # Daily schedule + routines
│   │   ├── useMealPlanStore # Meal plans + protein tracking
│   │   └── useNutritionStore # Daily/weekly nutrition data
│   │
│   ├── services/            # Core business logic
│   │   ├── proteinAllocator # Distribute protein across meals
│   │   ├── mealEngine       # Protein-match meal selection
│   │   ├── scheduleEngine   # Workout-aware meal timing
│   │   ├── nutritionCalc    # BMR, TDEE, macro formulas
│   │   └── ai               # Multi-provider AI (Gemini/Groq/OpenRouter)
│   │
│   ├── data/                # 152+ recipe database
│   │   ├── meals-nonveg     # 38 non-veg Indian recipes
│   │   ├── meals-veg        # 38 vegetarian recipes
│   │   ├── meals-vegan      # 38 vegan recipes
│   │   ├── meals-eggetarian # 38 eggetarian recipes
│   │   └── protein-boosters # Quick protein add-ons
│   │
│   ├── components/
│   │   ├── protein/         # ProteinRing, TargetPicker, Booster
│   │   ├── meals/           # MealCard, SwapSheet, FilterSheet
│   │   ├── nutrition/       # MacroRing, GlowNutrients, Charts
│   │   ├── schedule/        # MorningCheckin, RoutinePicker
│   │   └── ai/              # AiCoachCard, BcaUploader
│   │
│   └── pages/               # Onboarding, Dashboard, MealPlan,
│                             # Nutrients, Profile, History, Settings
├── SPEC.md                  # Full product specification
└── CLI-GUIDE.md             # Claude CLI execution prompts
```

---

## Key Formulas

### BMR (Mifflin-St Jeor)
```
Male:   (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### Recommended Daily Protein
```
Muscle Gain:    2.2g per kg body weight
Fat Loss:       2.4g per kg body weight
Maintain:       1.8g per kg body weight
Recomposition:  2.0g per kg body weight
```

---

## Meal Database

**152 recipes** covering 4 diet types with full protein range coverage:

| Diet Type | Recipes | Protein Range | Cuisines |
|-----------|---------|---------------|----------|
| Non-Veg | 38 | 3g — 42g | Chicken tikka, fish curry, egg bhurji |
| Vegetarian | 38 | 3g — 28g | Paneer paratha, palak paneer, rajma chawal |
| Vegan | 38 | 3g — 26g | Tofu scramble, chana masala, ragi dosa |
| Eggetarian | 38 | 3g — 28g | Egg curry, omelette wraps, anda bhurji |

Each recipe includes: full macro breakdown, protein sources, prep time, ingredients, glow nutrients, cost tier, regional cuisine tag, and seasonal availability.

---

## What Makes NutriFit Different

| Feature | MyFitnessPal | HealthifyMe | NutriFit |
|---------|-------------|-------------|----------|
| Approach | Backward (food diary) | Backward + coach | **Forward (food guide)** |
| Protein-first planning | ❌ | ❌ | **✅ Core feature** |
| Indian cuisine depth | Limited | Good | **152+ recipes, regional variety** |
| Meal timing × workout | ❌ | Basic | **Auto-adapts to workout type & time** |
| Skip meal redistribution | ❌ | ❌ | **✅ Auto-redistributes protein** |
| Protein Booster suggestions | ❌ | ❌ | **✅ Quick-add when short** |
| AI Coach | ❌ (paid) | ❌ (paid) | **✅ Free forever** |
| Cost to user | $79.99/yr | ₹9,600/yr | **Free** |

---

## Roadmap

### v1.0 (Current) ✅
- [x] Protein-target-first meal planning
- [x] 152 recipe database (4 diet types)
- [x] Workout-synced meal timing
- [x] Swap, skip, protein booster
- [x] Free AI coach (Gemini + Groq + OpenRouter)
- [x] Nutrition dashboard with glow nutrients
- [x] Flexible scheduling (presets + daily check-in)

### v2.0 (Planned)
- [ ] BCA / InBody report upload → auto-adjust protein target
- [ ] Blood report PDF parsing → detect deficiencies → adapt meals
- [ ] Ayurvedic dosha integration (Prakriti assessment)
- [ ] Grocery list generation from meal plan
- [ ] Family mode (shared meals with individual protein adjustments)
- [ ] Budget optimization (₹/day constraint)
- [ ] Photo-based meal logging with AI recognition

### v3.0 (Future)
- [ ] Wearable integration (Apple Watch, Fitbit)
- [ ] CGM (Continuous Glucose Monitor) data integration
- [ ] Community recipes and meal sharing
- [ ] Regional language support (Hindi, Gujarati, Tamil)
- [ ] Progressive Web App with offline support

---

## Development Approach

NutriFit was built using a **spec-driven development** approach with Claude CLI:

1. **SPEC.md** — Complete product specification written first
2. **10 targeted prompts** — Each prompt references SPEC.md for consistency
3. **5-day sprint** — 2 prompts per day, commit after each
4. **Conventional commits** — `feat:`, `fix:`, `docs:` prefixes

This approach ensures every component follows the same architecture, design system, and data flow — resulting in a cohesive product despite being built incrementally.

---

## Contributing

Contributions are welcome! Please read the SPEC.md first to understand the architecture and conventions.

```bash
# Fork the repo
# Create a feature branch
git checkout -b feat/your-feature

# Make changes and commit
git commit -m "feat: add your feature"

# Push and open a PR
git push origin feat/your-feature
```

---

## License

MIT License — free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Snehal-Kanzariya">Snehal Kanzariya</a>
</p>

<p align="center">
  <strong>NutriFit</strong> — Stop counting calories. Start hitting protein. 🎯
</p>
