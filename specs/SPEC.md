# NutriFit — Product Specification Document (v2)

## 🎯 Product Vision

**NutriFit** is an AI-powered personalized daily nutrition guide for fitness enthusiasts. Unlike existing apps that track what you already ate (backward-looking), NutriFit tells you exactly what to eat, when to eat, and makes it delicious (forward-looking).

**Core Innovation:** User sets a protein target (e.g., "I want 60g protein today") → App instantly builds a full day of tasty meals that hit exactly that number — distributed intelligently across meals based on their schedule, workout, and diet type.

**Tagline:** "Tell us your protein goal. We'll build your day."

**Target Users:** Gym-goers, yoga practitioners, runners, home workout enthusiasts — anyone serious about fitness nutrition across Veg / Non-Veg / Vegan diets.

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Framework** | React 18 + Vite | Fast dev, HMR, optimized builds |
| **Styling** | Tailwind CSS 3.4 | Utility-first, rapid UI |
| **State Management** | Zustand | Lightweight, no boilerplate |
| **Routing** | React Router v6 | SPA navigation |
| **AI Engine (Primary)** | Google Gemini 2.5 Flash (FREE) | 250+ RPD, no credit card needed |
| **AI Engine (Fallback)** | Groq — Llama 3.3 70B (FREE) | 14,400 RPD, 300+ tokens/sec |
| **AI Engine (Emergency)** | OpenRouter free models (FREE) | 30+ free models, last-resort backup |
| **Local Database** | JSON-based meal/recipe DB bundled in app | Offline-first, 152+ recipes |
| **Charts** | Recharts | Nutrition tracking visualizations |
| **PDF Parsing** | pdf.js (for BCA report upload) | Extract data from InBody/blood reports |
| **Icons** | Lucide React | Consistent icon system |
| **Animations** | Framer Motion | Smooth transitions, micro-interactions |
| **Storage** | localStorage + IndexedDB (Dexie.js) | Offline profile, history, saved routines |
| **Deployment** | Vercel | Auto-deploy from GitHub |

### AI Provider Details — ALL 100% FREE

```
Primary:   Google Gemini 2.5 Flash  → 250 RPD, 10 RPM, no credit card
Fallback:  Groq (Llama 3.3 70B)    → 14,400 RPD, 300+ tok/sec, no credit card
Emergency: OpenRouter (free models) → 30+ models, auto-fallback
```

**Failover:** Primary fails → Fallback → Emergency → hardcoded local tips. App never breaks.

**Local-first architecture:** Core meal plan generation works 100% offline from JSON database. AI is enhancement only (tips, smart suggestions, BCA parsing).

---

## 📁 Project Structure

```
nutrifit/
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   │
│   ├── stores/
│   │   ├── useProfileStore.js       # Profile + proteinTarget + recommendedProtein
│   │   ├── useScheduleStore.js      # Schedule, routines, presets
│   │   ├── useMealPlanStore.js      # Meal plans, protein per slot, boosters
│   │   ├── useNutritionStore.js     # Daily totals, weekly history
│   │   └── useAppStore.js           # UI state, loading, current screen
│   │
│   ├── data/
│   │   ├── meals-nonveg.json        # 38 non-veg recipes
│   │   ├── meals-veg.json           # 38 veg recipes
│   │   ├── meals-vegan.json         # 38 vegan recipes
│   │   ├── meals-eggetarian.json    # 38 eggetarian recipes
│   │   ├── nutrients-map.json       # Glow nutrients ↔ food mapping
│   │   └── protein-boosters.json    # Quick protein add-ons
│   │
│   ├── services/
│   │   ├── ai.js                    # Multi-provider AI (Gemini → Groq → OpenRouter → local)
│   │   ├── mealEngine.js            # Protein-target-first meal selection
│   │   ├── proteinAllocator.js      # Distribute protein across meal slots
│   │   ├── nutritionCalc.js         # BMR, TDEE, macro calculations
│   │   ├── scheduleEngine.js        # Meal timing from user schedule
│   │   ├── bcaParser.js             # BCA/blood report PDF parser
│   │   └── storage.js               # IndexedDB wrapper (Dexie)
│   │
│   ├── components/
│   │   ├── ui/                      # Button, Card, Input, Select, Toggle, ProgressBar,
│   │   │                            # CircularProgress, Badge, Modal, Slider, BottomSheet
│   │   │
│   │   ├── protein/                 # HERO FEATURE COMPONENTS
│   │   │   ├── ProteinTargetPicker.jsx    # Slider + presets: "How much protein today?"
│   │   │   ├── ProteinDistribution.jsx    # Visual split across meals
│   │   │   ├── ProteinProgressRing.jsx    # Big ring: 47/60g
│   │   │   ├── ProteinPerMealBar.jsx      # Per-meal horizontal bars
│   │   │   └── ProteinBooster.jsx         # "You're 12g short — quick fixes"
│   │   │
│   │   ├── meals/                   # MealCard, MealSlot, MealSwapSheet,
│   │   │                            # MealFilterSheet, SkippedMealBanner, RecipeDetail
│   │   │
│   │   ├── nutrition/               # MacroRing, NutrientBar, DailyOverview,
│   │   │                            # GlowNutrients, WeeklyChart
│   │   │
│   │   ├── schedule/                # MorningCheckin, RoutinePicker,
│   │   │                            # TimeAdjuster, ScheduleSheet
│   │   │
│   │   └── ai/                      # AiCoachCard, AiMealChat, BcaUploader
│   │
│   ├── pages/
│   │   ├── Onboarding.jsx           # 5-step (includes protein target setup)
│   │   ├── Dashboard.jsx            # Protein ring hero + check-in
│   │   ├── MealPlan.jsx             # Meals with per-meal protein bars
│   │   ├── Nutrients.jsx            # Protein-first tracking
│   │   ├── Profile.jsx              # Edit protein target + goals
│   │   ├── History.jsx              # Protein streak tracking
│   │   └── Settings.jsx
│   │
│   └── utils/
│       ├── constants.js             # Goals, activity types, protein presets
│       ├── formatters.js
│       ├── validators.js
│       └── helpers.js
│
├── SPEC.md
├── CLI-GUIDE.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔧 Core Features

### F0: PROTEIN-TARGET-FIRST ENGINE (HERO FEATURE)

This is what makes NutriFit different from EVERY competitor.

#### User Flow:
```
1. User opens app → Morning check-in
2. First question: "How much protein today?"
   - Smart default from profile (weight × goal multiplier)
   - Slider: 30g ←━━━━●━━━━→ 200g
   - Presets: [ Light 40g ] [ Regular 80g ] [ Beast 150g ]
3. User sets: 60g protein
4. App INSTANTLY generates full day meals hitting EXACTLY 60g
5. Each meal shows protein contribution visually
```

#### Protein Distribution Algorithm (`proteinAllocator.js`):
```
Input:  targetProtein (60g), mealSlots (6 meals), workoutType
Output: proteinPerSlot { breakfast: 12g, lunch: 15g, ... }

WITH WORKOUT:
  Post-workout:  30% → 18g  (recovery priority)
  Lunch:         25% → 15g  (main meal)
  Breakfast:     20% → 12g  (start the day)
  Dinner:        15% →  9g  (lighter at night)
  Pre-workout:    5% →  3g  (light fuel)
  Snack:          5% →  3g  (bridge gaps)

NO WORKOUT (rest day):
  Lunch:         35% → 21g
  Breakfast:     25% → 15g
  Dinner:        25% → 15g
  Snack:         15% →  9g
```

#### Protein-Aware Meal Selection:
```
For each slot:
1. Get protein target for this slot (e.g., 18g for post-workout)
2. Filter meals by: diet type → meal type → cooking ability
3. SORT by protein distance: |meal.protein - slotTarget| ascending
4. Apply ±15% tolerance (e.g., 18g target → accept 15g-21g)
5. From top 5 matches → pick random (for variety)
6. If no match in range → pick closest + show "±Xg" warning
```

#### Smart Protein Redistribution on Skip:
```
User skips lunch (15g protein target):
1. Remove lunch from plan
2. Redistribute 15g to remaining meals proportionally
3. For each remaining slot → find higher-protein alternative
4. Show: "Dinner boosted from 9g → 16g to compensate"
5. Protein ring stays accurate
```

#### Protein Booster (end-of-day shortfall):
```
"You're 12g short of 60g. Quick protein fixes:"
🥜 Handful of peanuts     → +7g
🥛 Glass of milk          → +8g
🍳 2 boiled eggs          → +12g
🫘 Cup of moong sprouts   → +7g
🧀 30g paneer cube        → +6g
🥣 2 tbsp sattu in water  → +7g
```

### F1: Smart Onboarding (5 Steps)

**Step 1 — About You:** Name, age, gender, weight (kg), height (cm)

**Step 2 — Goal & Diet:**
- Goal: Muscle Gain 💪 | Fat Loss 🔥 | Maintain ⚖️ | Recomposition 🔄
- Diet: Non-Veg 🍗 | Veg 🥦 | Vegan 🌱 | Eggetarian 🥚
- Activity: Sedentary | Light | Moderate | Active | Intense

**Step 3 — Protein Target (KEY STEP):**
- App calculates: "Based on your profile → Xg protein/day recommended"
- Slider (30g—200g) + manual input
- Presets: Light | Moderate | High | Max
- Tooltip: "At 70kg for muscle gain, 2.2g/kg = 154g protein is optimal"
- This becomes daily default (changeable each morning)

**Step 4 — Life Schedule:**
- Presets: Student | Office | WFH | Early Bird | Night Shift
- Workout: time, duration, type
- Cooking: Can cook | Quick meals only
- Budget: ₹/day (optional)

**Step 5 — Summary:**
- BMR, TDEE, goal calories, protein target
- Protein distribution preview across meal slots
- "Generate My Meal Plan 🚀"

### F2: Morning Check-in (Protein + Schedule)

```
┌──────────────────────────────────┐
│ ☀️ What's your plan today?        │
│                                  │
│ 🎯 PROTEIN TARGET                │
│ [━━━━━━━━●━━━━━━━] 60g          │
│ [Light 40g] [Regular 80g] [Max]  │
│                                  │
│ TODAY'S ACTIVITY                 │
│ [🏋️] [🧘] [🏃] [⚽] [🏠] [😴]     │
│                                  │
│ Workout: [07:00]  Cook? [✓][✗]  │
│                                  │
│ [━━━ Generate My Day →━━━]       │
└──────────────────────────────────┘
```

### F3: Meal Plan with Per-Meal Protein

Each MealCard shows:
```
┌──────────────────────────────────┐
│ 7:30 AM · BREAKFAST              │
│ Moong Dal Cheela + Mint Chutney  │
│                                  │
│ ████████████░░░░  12g protein    │ ← protein bar (violet)
│ (20% of your 60g target)         │
│                                  │
│ 280 cal · C:32g · F:8g · ⏱ 15m │
│ 🍳 Cook · 🌿 High Protein        │
│                                  │
│ [🔄 Swap]              [✕ Skip] │
└──────────────────────────────────┘
```

Swap shows alternatives SORTED by protein match to slot target.
Skip redistributes protein to remaining meals.

### F4: Nutrition Dashboard (Protein-Hero)

```
┌─────────────────────────────────┐
│  🎯 TODAY'S PROTEIN              │
│       ╭─────────╮              │
│       │  47/60g │  ← BIG RING  │
│       │ protein │   (violet)    │
│       ╰─────────╯              │
│  ████████████████░░░░  78%      │
│                                 │
│  Per-Meal Breakdown:            │
│  BF ██████░░░ 12g               │
│  PW ████████████░ 18g           │
│  LN ████████░░ 15g              │
│  SN ██░░░░░░ 3g                 │
│  DN █████░░░ 9g                 │
│  ───────────────                │
│  Eaten: 47g  Remaining: 13g    │
│                                 │
│  Cal: 1450/2100 C:180g F:45g   │
│                                 │
│  [🚀 Protein Booster]           │
└─────────────────────────────────┘
```

### F5: AI Coach (FREE Multi-Provider)

```javascript
// services/ai.js
const PROVIDERS = [
  { name: "gemini",     endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", format: "google" },
  { name: "groq",       endpoint: "https://api.groq.com/openai/v1/chat/completions", model: "llama-3.3-70b-versatile", format: "openai" },
  { name: "openrouter",  endpoint: "https://openrouter.ai/api/v1/chat/completions", model: "meta-llama/llama-3.1-8b-instruct:free", format: "openai" }
];

async function askAI(systemPrompt, userPrompt) {
  for (const provider of PROVIDERS) {
    try { return await callProvider(provider, systemPrompt, userPrompt); }
    catch { continue; }
  }
  return getLocalFallbackTip(); // never fails
}
```

System prompt always includes user's protein target + current intake.

### F6: Glow Nutrients & Skin/Hair Mode

Based on blood report or user preference, weave nutrient-rich foods into the protein-matched plan:
- Iron 🩸 → Hair & Energy
- Vitamin C 🍊 → Skin Glow
- Zinc 💎 → Immunity & Skin
- B12 🧬 → Energy
- Biotin 💅 → Hair & Nails
- Omega-3 🐟 → Skin & Brain

### F7: BCA & Blood Report Upload (v2)

Upload InBody/blood PDF → AI parses → auto-adjusts protein target based on lean mass → highlights deficiencies → adapts meal plan.

---

## 📊 Meal Database Schema

```json
{
  "id": "veg-bf-001",
  "name": "Moong Dal Cheela + Mint Chutney",
  "type": "breakfast",
  "diet": "veg",
  "cal": 280,
  "protein": 18,
  "carbs": 32,
  "fat": 8,
  "fiber": 6,
  "vitamins": { "C": 12, "D": 0, "B12": 0, "A": 15, "E": 2 },
  "minerals": { "iron": 3.8, "zinc": 2.1, "calcium": 45, "magnesium": 30 },
  "prepTime": 15,
  "tags": ["cook", "high-protein", "budget"],
  "ingredients": ["1 cup moong dal", "green chili", "ginger", "mint", "curd"],
  "glowNutrients": ["iron", "zinc"],
  "costTier": "budget",
  "cuisine": "north-indian",
  "season": "all",
  "proteinSources": ["moong dal", "curd"],
  "proteinLevel": "medium"
}
```

**Protein range per meal type (ensure coverage):**
```
Breakfast:     8g — 28g
Lunch:        12g — 42g
Dinner:        8g — 36g
Snack:         3g — 18g
Pre-workout:   3g — 12g
Post-workout: 15g — 35g
```

---

## 🎨 Design System

```
Protein (HERO): violet-500 (#8b5cf6), bg: violet-950 (#2e1065)
Accent: emerald-500 (#10b981)
Carbs: amber-400, Fat: pink-400, Calories: emerald-500
Background: gray-950, Cards: gray-900, Borders: gray-800
Font: 'Outfit' (Google Fonts), weights 300-900
```

---

## 📐 Key Formulas

### BMR (Mifflin-St Jeor)
```
Male:   (10 × weight) + (6.25 × height) - (5 × age) + 5
Female: (10 × weight) + (6.25 × height) - (5 × age) - 161
```

### Recommended Protein
```
Muscle Gain:  2.2g/kg  |  Fat Loss:    2.4g/kg
Maintain:     1.8g/kg  |  Recomp:      2.0g/kg
```

### Protein Distribution
```
With workout:  Post-WO 30%, Lunch 25%, BF 20%, Dinner 15%, Pre 5%, Snack 5%
Rest day:      Lunch 35%, BF 25%, Dinner 25%, Snack 15%
Match tolerance: ±15% per slot
```

---

## 🔐 Environment Variables

```env
VITE_GEMINI_API_KEY=          # aistudio.google.com (free)
VITE_GROQ_API_KEY=            # console.groq.com (free)
VITE_OPENROUTER_API_KEY=      # openrouter.ai/keys (free)
VITE_APP_NAME=NutriFit
VITE_APP_VERSION=1.0.0
```

---

## ✅ Definition of Done

- [ ] Protein target picker works (slider + presets)
- [ ] Protein distribution splits correctly across meal slots
- [ ] Per-meal protein bars visible on every MealCard
- [ ] Meals are selected by protein-match-first algorithm
- [ ] Swap shows protein-matched alternatives
- [ ] Skip triggers protein redistribution
- [ ] Protein Booster appears when daily total falls short
- [ ] Protein progress ring is hero element on dashboard
- [ ] Weekly protein streak tracked in history
- [ ] 152 recipes in DB (38 × 4 diets) with protein range coverage
- [ ] Free AI works (Gemini → Groq → OpenRouter → local fallback)
- [ ] Onboarding includes protein target step
- [ ] Morning check-in has protein slider front and center
- [ ] All data persists (IndexedDB)
- [ ] Deployed to Vercel, mobile-responsive, no errors
