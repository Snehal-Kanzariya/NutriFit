# NutriFit — Meal Tracker Feature Spec (v4)

## 📊 Research Summary

### What Competitors Do:
- MyFitnessPal: backward logging (you add food AFTER eating) — no check-off, no timeline
- Cronometer: manual food diary — no real-time progress
- HealthifyMe: food logging with AI photo — still backward-looking
- Habitica: gamified task check-off — but not for nutrition/protein
- Noom: psychology-based tracking — color codes foods, no meal timeline
- Centenary Day: has a weekly routine planner with scoring — closest competitor

### What NO Competitor Has (Our Monopoly):
1. **Meal check-off with LIVE protein accumulation** — check a meal → protein ring fills in real-time with animation
2. **Live Day Timeline** — visual timeline showing past (dimmed), current (glowing), future (upcoming) meals with current time marker
3. **Meal prep countdown** — "Start cooking Paneer Tikka in 25 min" based on prep time + meal time
4. **Protein velocity tracking** — "You're averaging 12g/hour — on track to hit 60g by dinner"
5. **Smart meal window alerts** — "Your post-workout window closes in 30 min — eat now for best recovery"
6. **Daily completion ring** — like Apple Watch activity rings but for meals (3/6 meals done = 50%)

These features turn NutriFit from a "meal suggestion app" into a **real-time nutrition mission control**.

---

## 🆕 FEATURE: Meal Check-Off & Live Tracking System

### Core Concept:
Every meal in the plan becomes a **checkable task**. When user checks it off ("I ate this"), the protein instantly adds to the daily total with a satisfying animation. The app becomes a real-time nutrition dashboard that knows exactly where you are in your day.

### Visual Design — The Day Timeline:

```
┌─────────────────────────────────────────┐
│ 📅 Wednesday, March 12, 2026            │
│ ⏰ 1:45 PM IST                          │
│                                         │
│ Today's Progress: 3/6 meals · 47/60g 🟣 │
│ ████████████████░░░░░░░  78%            │
│                                         │
│ ─── TIMELINE ───────────────────────    │
│                                         │
│ ✅ 7:30 AM · BREAKFAST          DONE    │
│    Moong Dal Cheela                     │
│    🟣 +12g protein added               │
│    ░░░░░░░░░░░ (dimmed — completed)     │
│                                         │
│ ✅ 8:30 AM · POST-WORKOUT       DONE   │
│    Paneer Bhurji + Toast                │
│    🟣 +22g protein added               │
│    ░░░░░░░░░░░ (dimmed — completed)     │
│                                         │
│ ✅ 10:30 AM · SNACK             DONE   │
│    Roasted Makhana                      │
│    🟣 +5g protein added                │
│    ░░░░░░░░░░░ (dimmed — completed)     │
│                                         │
│ ⏰ ── NOW: 1:45 PM ──────────────       │
│                                         │
│ 🔴 1:00 PM · LUNCH         ← CURRENT   │
│    Rajma Chawal + Raita                 │
│    🟣 15g protein waiting               │
│    ⚡ "Eat now — you're 45 min late"    │
│    [✓ Mark as Eaten]  [⏭ Skip]         │
│                                         │
│ ⬜ 4:00 PM · SNACK          UPCOMING   │
│    Paneer Tikka (2 skewers)             │
│    🟣 12g protein                       │
│    🍳 Start prep at 3:45 PM (15 min)   │
│                                         │
│ ⬜ 8:00 PM · DINNER         UPCOMING   │
│    Palak Paneer + 2 Roti                │
│    🟣 22g protein                       │
│    🍳 Start prep at 7:30 PM (30 min)   │
│                                         │
│ ─── PROTEIN VELOCITY ───────────────    │
│ 📈 39g eaten in 6 hrs = 6.5g/hr        │
│ 🎯 At this pace: ~62g by 8 PM ✅       │
│                                         │
│ ─── QUICK STATS ────────────────────    │
│ Eaten: 39g 🍽️  |  Remaining: 21g ⏳    │
│ Meals done: 3/6  |  Next in: 2h 15m    │
└─────────────────────────────────────────┘
```

### Meal States (5 states):

| State | Visual | When |
|-------|--------|------|
| **UPCOMING** | ⬜ Gray border, full opacity | Meal time is in the future |
| **PREP NOW** | 🟡 Amber glow border, prep countdown | Current time = meal time - prep minutes |
| **EAT NOW** | 🔴 Red pulse border, "Eat now" prompt | Current time ≥ meal time, not yet checked |
| **DONE** | ✅ Green checkmark, dimmed, protein counted | User checked "Mark as Eaten" |
| **SKIPPED** | ⏭ Strikethrough, fully dimmed | User tapped "Skip" |

### Check-Off Interaction:

```
User taps [✓ Mark as Eaten] on Lunch:
1. Button animates to checkmark ✅
2. Card dims to 60% opacity with green left border
3. "+15g protein" floats up from the card (animated)
4. Protein ring: 39g → 54g with spring animation
5. Progress bar fills from 65% → 90%
6. If this hits 100% → confetti burst 🎉 + "Protein target hit!"
7. Completion counter: 3/6 → 4/6
8. Protein velocity recalculates
9. Next meal highlights as "CURRENT"
```

### Date & Time Display:

**Header Bar (persistent across all pages):**
```
┌─────────────────────────────────────┐
│ Wed, 12 March 2026 · 1:45 PM IST   │
│ Good afternoon, Snehal 👋           │
└─────────────────────────────────────┘
```

- Show: full day name, date, month, year
- Show: current time in 12-hr format with timezone (IST)
- Auto-update every minute
- Greeting changes: Good morning (5-12), Good afternoon (12-5), Good evening (5-9), Good night (9-5)

### Meal Prep Timer:

For meals tagged "cook" with prepTime > 5 min:
```
UPCOMING meal at 4:00 PM, prepTime: 15 min
→ At 3:45 PM, card changes to "PREP NOW" state:
   🍳 "Start cooking Paneer Tikka now! (15 min prep)"
   
UPCOMING meal at 8:00 PM, prepTime: 30 min  
→ At 7:30 PM:
   🍳 "Start cooking Palak Paneer now! (30 min prep)"
```

For meals tagged "quick":
```
No prep timer — just "EAT NOW" when meal time arrives
```

### Protein Velocity Tracker:

```javascript
// Calculate protein intake rate
const firstMealTime = checkedMeals[0]?.time;  // e.g., 7:30 AM
const now = currentTime;                       // e.g., 1:45 PM
const hoursElapsed = (now - firstMealTime) / 3600000;  // 6.25 hours
const proteinEaten = checkedMeals.reduce((sum, m) => sum + m.protein, 0);  // 39g
const velocity = proteinEaten / hoursElapsed;  // 6.24 g/hr

const remainingHours = (lastMealTime - now) / 3600000;  // 6.25 hours to dinner
const projectedTotal = proteinEaten + (velocity * remainingHours);
// 39 + (6.24 * 6.25) = 78g → "On track ✅"

Display:
"📈 39g eaten in 6h = 6.2g/hr"
"🎯 Projected: ~78g by 8 PM ✅" (green if ≥ target)
"🎯 Projected: ~45g by 8 PM ⚠️" (amber if < target)
```

### Smart Meal Window Alerts:

```
POST-WORKOUT meal (recovery window):
→ If not eaten within 45 min after workout:
   "⚡ Your post-workout recovery window is closing! Eat within 15 min for best results."

MEAL OVERDUE (any meal):  
→ If current time > meal time + 60 min and not checked:
   "⏰ Your lunch is 1 hour overdue. Eat soon to stay on track!"

LATE NIGHT eating:
→ If dinner meal time is < 2 hours before sleep time:
   "🌙 Try to eat 2-3 hours before bed for better digestion."
```

### Daily Completion Metrics:

```
┌──────────────────────────────┐
│ TODAY'S COMPLETION            │
│                              │
│ Meals:  ●●●○○○  3/6 (50%)   │
│ Protein: ████████░░  78%     │
│ Streak:  🔥 5 days           │
│                              │
│ Velocity: 6.2g/hr            │
│ Projected: 78g ✅            │
│ Next meal: 2h 15m            │
└──────────────────────────────┘
```

### New Components:

```
src/components/tracker/
├── DayHeader.jsx              # Date, time, greeting (auto-updates)
├── MealTimeline.jsx           # Full day timeline with time marker
├── TrackableMealCard.jsx      # Meal card with check-off, skip, states
├── ProteinAccumulator.jsx     # Animated "+Xg protein" on check
├── ProteinVelocity.jsx        # Rate + projection display
├── MealPrepTimer.jsx          # "Start cooking in X min" countdown
├── MealWindowAlert.jsx        # Smart alerts (overdue, recovery window)
├── CompletionStats.jsx        # 3/6 meals, percentage, streak
└── DailyCompletionRing.jsx    # Apple Watch-style completion ring
```

### State Updates:

```javascript
// Add to useMealPlanStore
mealStates: {}, // { 0: "upcoming" | "prep" | "eat-now" | "done" | "skipped" }
checkedAt: {},  // { 0: timestamp, 1: timestamp } — when each meal was checked
proteinAccumulated: 0,  // running total of CHECKED meals only
completionCount: 0,     // number of checked meals
currentMealIndex: null,  // which meal is "current" based on time

// Actions
checkMeal(index),        // marks as done, adds protein, triggers animation
skipMeal(index),         // marks as skipped, redistributes
getMealState(index),     // returns state based on current time
getProteinVelocity(),   // calculates rate
getProjectedProtein(),  // estimates end-of-day total
getNextMealCountdown(), // minutes until next unchecked meal

// Timer (runs every 60 seconds)
updateMealStates(),     // recalculates all states based on current time
```

### Key Differentiators vs Competition:

| Feature | MyFitnessPal | HealthifyMe | Habitica | NutriFit |
|---------|-------------|-------------|----------|----------|
| Meal check-off with protein animation | ❌ | ❌ | ❌ | ✅ |
| Live day timeline with time marker | ❌ | ❌ | ❌ | ✅ |
| Meal prep countdown timer | ❌ | ❌ | ❌ | ✅ |
| Protein velocity tracking | ❌ | ❌ | ❌ | ✅ |
| Recovery window alerts | ❌ | ❌ | ❌ | ✅ |
| Forward-looking (what to eat) | ❌ | Partial | ❌ | ✅ |
| Task completion gamification for meals | ❌ | ❌ | Tasks only | ✅ Meals |

---

## 🚀 Claude CLI Prompt

```
Read FEATURE-SPEC-V4.md thoroughly. Build the complete Meal Check-Off & Live Tracking System:

### PART 1: Day Header with Live Date/Time

Create src/components/tracker/DayHeader.jsx:
- Shows: full date (e.g., "Wednesday, 12 March 2026") + current time (e.g., "1:45 PM IST")
- Time auto-updates every 60 seconds using setInterval
- Greeting: "Good morning/afternoon/evening/night, {name}" based on hour
- Use Intl.DateTimeFormat for proper formatting
- Styled: text-sm text-gray-400 for date, text-xl font-bold text-white for greeting
- Place this at the TOP of Dashboard page, above everything else

### PART 2: Trackable Meal Cards with Check-Off

Update meal cards (or create src/components/tracker/TrackableMealCard.jsx):
Each meal card now has 5 states based on current time:

UPCOMING (meal time in future):
- Gray border, full content visible
- Shows: meal name, protein, cal, prepTime, ingredients
- NO action buttons yet (can't eat it yet)
- If prepTime > 5 min AND current time >= mealTime - prepTime:
  → Switch to PREP state: amber border, show "🍳 Start cooking now! ({prepTime} min)"

EAT NOW (current time >= meal time AND not checked):
- Violet/purple pulsing border (use CSS animation: pulse)  
- Shows "⚡ Time to eat!" badge
- Two buttons: [✓ Mark as Eaten] (violet, prominent) and [⏭ Skip] (gray, small)
- If overdue by 30+ min: show "⏰ {X} min overdue" in amber

DONE (user checked "Mark as Eaten"):
- Green left border (4px solid emerald-500)
- Dimmed opacity (opacity-60)
- Green checkmark ✅ badge
- Shows: "🟣 +{protein}g protein added" with timestamp "Eaten at 1:45 PM"
- No action buttons (completed)

SKIPPED (user tapped Skip):
- Strikethrough on meal name, opacity-40
- Gray dashed border
- "Skipped" badge
- [Restore] button to undo

### PART 3: Check-Off Animation

When user taps "Mark as Eaten":
1. Button morphs into ✅ checkmark (Framer Motion: scale 0 → 1 with spring)
2. "+{protein}g" text floats upward from card and fades out (motion.div: y: 0 → -40, opacity: 1 → 0)
3. Card transitions: border goes green, opacity dims to 0.6 (0.3s transition)
4. Protein ring on Dashboard: smoothly animates from old value to new value
5. Progress bar width transitions
6. Completion counter increments: "3/6 → 4/6"
7. If total protein >= target after this check: show celebration 🎉
   - Confetti: 8-10 motion.span elements with random x/y trajectories, scale, rotation
   - Text: "🎉 Protein target hit!" appears and fades after 3 seconds
8. Store the check timestamp: checkedAt[index] = Date.now()

### PART 4: Live Timeline View

Create src/components/tracker/MealTimeline.jsx:
- Vertical timeline with a line connecting all meal slots
- Current time marker: a horizontal line with "NOW · 1:45 PM" label, colored violet
- Past meals (checked): dimmed, green checkmarks, positioned above NOW line
- Current meal: highlighted with pulse, positioned at NOW line
- Future meals: full opacity, positioned below NOW line
- The timeline auto-scrolls to keep the "NOW" marker centered in viewport

Timeline visual:
```
│ ✅ 7:30 AM — Breakfast (12g) ........... dimmed
│ ✅ 8:30 AM — Post-Workout (22g) ........ dimmed
│ ✅ 10:30 AM — Snack (5g) ............... dimmed
│
├── NOW: 1:45 PM ─────────────────────── violet line
│
│ 🔴 1:00 PM — Lunch (15g) .............. CURRENT (pulsing)
│ ⬜ 4:00 PM — Snack (12g) .............. upcoming
│ ⬜ 8:00 PM — Dinner (22g) ............. upcoming
```

### PART 5: Protein Velocity & Projection

Create src/components/tracker/ProteinVelocity.jsx:
- Calculate: proteinEaten / hoursElapsed = velocity (g/hr)
- Project: proteinEaten + (velocity × remainingHours) = projectedTotal
- Display: "📈 39g in 6h = 6.2g/hr"
- Display: "🎯 Projected: ~78g by 8 PM ✅" (green if >= target, amber if <)
- Only shows after at least 1 meal is checked
- Updates every time a meal is checked

### PART 6: Meal Prep Countdown

Create src/components/tracker/MealPrepTimer.jsx:
- For each UPCOMING meal with tag "cook" and prepTime > 5:
  - Calculate: mealTime - prepTime = prepStartTime
  - If currentTime >= prepStartTime AND meal not checked:
    → Show amber card: "🍳 Start cooking {mealName} now! ({prepTime} min prep)"
  - If currentTime < prepStartTime:
    → Show subtle text: "🍳 Start prep at {prepStartTime}" on the meal card
- For "quick" meals: no prep timer, just "⚡ Quick — no cooking needed"

### PART 7: Completion Stats

Create src/components/tracker/CompletionStats.jsx:
- Meal completion: ●●●○○○ 3/6 (50%) — filled dots for done meals
- Protein: ████████░░ 78% — with actual/target numbers
- Streak: 🔥 5 days — consecutive days where protein target was hit (±10% tolerance)
- Next meal: "Next meal in 2h 15m" countdown (updates every minute)
- Place this card between the protein ring and meal list on Dashboard

### PART 8: Auto-Updating State Engine

Add to useMealPlanStore or create a custom hook useTimeTracker():
- Runs a setInterval every 60 seconds
- For each meal slot: computes current state (upcoming/prep/eat-now/done/skipped) based on:
  - Current time vs meal scheduled time
  - Whether user has checked it
  - Meal's prepTime
- Updates mealStates object in store
- Triggers re-render of timeline and cards

### PART 9: Integration with Existing Pages

Dashboard.jsx:
- Add DayHeader at very top
- Replace static protein ring with live ring that only counts CHECKED meals
- Add CompletionStats card below protein ring
- Add ProteinVelocity below stats

MealPlan.jsx (Meals tab):
- Replace existing MealCards with TrackableMealCards
- Add MealTimeline view as the primary layout
- Current time marker visible
- MealPrepTimer alerts show on relevant cards

History.jsx:
- Track daily completion: { date, mealsPlanned, mealsCompleted, proteinTarget, proteinActual, streak }
- Show completion percentage per day

### ANIMATIONS:
- DayHeader time: fade-transition when minute changes
- Meal state transitions: Framer Motion layoutId for smooth card rearrangement
- Check-off: spring animation on checkmark, float-up on protein number
- Timeline NOW marker: subtle pulse animation
- Completion dots: pop-in animation as each meal is completed
- Protein velocity: count-up animation on numbers
- Prep timer: countdown number animation (every minute)
- 100% completion: confetti explosion + protein ring glow pulse

Test everything:
1. Open app → see current date/time/greeting updating
2. Past meals show as "EAT NOW" (since you haven't checked them)
3. Tap "Mark as Eaten" → protein adds with animation → card dims → counter updates
4. Check all meals → 100% → confetti celebration
5. Skip a meal → it dims, protein doesn't count
6. Verify protein velocity calculates correctly
7. Verify meal prep timer appears at correct time
8. Check mobile responsiveness (375px)

Run npm run dev and verify all test cases.
```
