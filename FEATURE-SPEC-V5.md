# NutriFit — Trainer Mode Feature Spec (v5)

## 📊 Research Summary

### What Competitors Charge for Trainer Features:
- ABC Trainerize: $49-99/month for nutrition coaching add-on
- Fitbudd: $29-99/month for meal plan management
- NutriAdmin: $42/month for meal plan builder
- My PT Hub: $35-57/month for nutrition features
- Strongr Fastr: $19/month for client meal planning

ALL of these are SEPARATE paid platforms. None are built into the user's own app.

### What NO Competitor Does:
1. **Live protein verification score** — as trainer modifies meals, a LIVE counter shows whether the modified plan hits protein target (with green/red indicator)
2. **Per-meal protein budget** — trainer sees "this slot needs 18g protein" and the system validates each replacement against that budget
3. **Protein gap analysis** — after trainer finishes editing, system shows exactly where protein is short/over and suggests fixes
4. **Built-in for FREE** — competitors charge $30-100/mo, NutriFit includes it in the app
5. **Trainer + User same app** — no separate dashboard needed, just a mode toggle

### NutriFit's Monopoly Angle:
Every trainer tool today lets trainers BUILD meal plans. But NONE verify the plan against the user's protein target in real-time as the trainer edits. NutriFit's Trainer Mode acts like a **protein budget validator** — the trainer can't accidentally create a plan that misses the target, because the system alerts them live.

---

## 🆕 FEATURE: Trainer Mode with Live Protein Verification

### Core Concept:
Trainer mode transforms the meal plan into an editable workspace where every modification is **validated in real-time against the user's protein target**. The trainer sees a live "Protein Compliance Score" that turns red when the plan falls short and green when it's on target.

### Entry Point:
```
Settings → Trainer Mode → Toggle ON
→ New "🏋️ Trainer" tab appears in bottom navigation
→ Tap to enter Trainer workspace
```

### Trainer Page Layout:

```
┌─────────────────────────────────────────┐
│ 🏋️ TRAINER MODE                         │
│ "Build the perfect meal plan"           │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ⚡ PROTEIN VERIFICATION PANEL       │ │
│ │                                     │ │
│ │ Target: 120g    Plan Total: 98g     │ │
│ │                                     │ │
│ │ ████████████████░░░░  82%           │ │
│ │                                     │ │
│ │ ⚠️ 22g SHORT — Plan needs more     │ │
│ │    protein to hit target            │ │
│ │                                     │ │
│ │ Per-Meal Breakdown:                 │ │
│ │ BF  ████████░░  24/28g ✅          │ │
│ │ PW  ██████████  35/36g ✅          │ │
│ │ LN  █████░░░░░  18/30g ⚠️ -12g    │ │
│ │ SN  ████░░░░░░   8/12g ⚠️ -4g     │ │
│ │ DN  █████░░░░░  13/22g ⚠️ -9g     │ │
│ │                                     │ │
│ │ [🤖 Auto-fix Protein Gaps]         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ── TARGET OVERRIDE ─────────────────    │
│ User's target: 120g                     │
│ [Override: ____g]  [Reset to user's]    │
│                                         │
│ ── EDITABLE MEAL PLAN ──────────────    │
│                                         │
│ BREAKFAST · 9:00 AM                     │
│ ┌─────────────────────────────────────┐ │
│ │ Paneer Paratha + Curd               │ │
│ │ 🟣 24g protein  (budget: 28g)      │ │
│ │ 400 cal · C:38g · F:18g · 🍳 20m  │ │
│ │                                     │ │
│ │ [✏️ Replace] [🗑️ Remove] [📝 Note] │ │
│ │                                     │ │
│ │ 📝 Trainer note:                    │ │
│ │ "Add 50g paneer for +9g protein"    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ... (all other meal slots)              │
│                                         │
│ ── ADD ENTRIES ─────────────────────    │
│ [➕ Add Custom Meal]                    │
│ [➕ Add Supplement (Protein Powder)]    │
│                                         │
│ ── GENERAL NOTES ───────────────────    │
│ [Trainer notes for today's plan...]     │
│                                         │
│ ── VALIDATION ──────────────────────    │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Calories: 2,150 (target: 2,100) │ │
│ │ ⚠️ Protein: 98g (target: 120g)     │ │
│ │ ✅ Fat: 65g (target: 70g)           │ │
│ │ ✅ Carbs: 245g (target: 250g)       │ │
│ │                                     │ │
│ │ VERDICT: ⚠️ Plan needs 22g more    │ │
│ │ protein. Add high-protein meal or   │ │
│ │ supplement to reach target.         │ │
│ │                                     │ │
│ │ [💾 Save Anyway] [🤖 Auto-Fix]     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [💾 Save & Apply Modified Plan]         │
└─────────────────────────────────────────┘
```

### Live Protein Verification System:

**How it works:**
```
1. Trainer opens Trainer Mode
2. System loads current meal plan + user's protein target
3. PROTEIN VERIFICATION PANEL shows at TOP (always visible, sticky)
4. As trainer replaces/adds/removes any meal:
   → Total protein recalculates INSTANTLY
   → Per-slot protein bars update
   → Compliance score updates (green ✅ / amber ⚠️ / red ❌)
5. Trainer cannot miss the score — it's always visible
```

**Verification Logic:**
```javascript
function verifyPlan(meals, supplements, proteinTarget) {
  const foodProtein = meals.reduce((sum, m) => sum + (m?.protein || 0), 0);
  const suppProtein = supplements.reduce((sum, s) => sum + (s?.totalProtein || 0), 0);
  const totalProtein = foodProtein + suppProtein;
  
  const percentage = Math.round((totalProtein / proteinTarget) * 100);
  
  let status, message, color;
  if (percentage >= 95 && percentage <= 110) {
    status = "PASS";
    message = "Plan meets protein target!";
    color = "green";   // emerald-500
  } else if (percentage >= 80 && percentage < 95) {
    status = "WARNING";
    message = `Plan is ${proteinTarget - totalProtein}g short. Consider adding protein.`;
    color = "amber";   // amber-500
  } else if (percentage > 110) {
    status = "OVER";
    message = `Plan exceeds target by ${totalProtein - proteinTarget}g. Consider reducing.`;
    color = "amber";
  } else {
    status = "FAIL";
    message = `Plan is ${proteinTarget - totalProtein}g short. Needs more protein.`;
    color = "red";     // red-500
  }
  
  // Per-slot analysis
  const slotAnalysis = meals.map((meal, i) => {
    const slotTarget = meal.proteinTarget || 0;
    const slotActual = meal?.protein || 0;
    const diff = slotActual - slotTarget;
    return {
      slot: meal.slotType,
      target: slotTarget,
      actual: slotActual,
      diff,
      status: Math.abs(diff) <= 3 ? "on-target" : diff < 0 ? "under" : "over"
    };
  });
  
  return { totalProtein, foodProtein, suppProtein, percentage, status, message, color, slotAnalysis };
}
```

### Trainer Actions:

**1. Replace Meal (with protein validation):**
```
Trainer taps [✏️ Replace] on Lunch:
→ Opens ReplaceMealSheet:
  
  ┌─────────────────────────────────────┐
  │ Replace Lunch · Protein Budget: 30g │
  │                                     │
  │ Search: [_________________] 🔍      │
  │                                     │
  │ Filter: [All] [High-Protein] [Quick]│
  │                                     │
  │ SUGGESTIONS (sorted by protein fit):│
  │                                     │
  │ 🟢 Chicken Curry + Rice    38g ✅   │
  │    408 cal · 🍳 30m                 │
  │    "8g over budget — close match"   │
  │                                     │
  │ 🟢 Rajma Chawal + Raita   22g      │
  │    480 cal · 🍳 30m                 │
  │    "8g under budget"                │
  │                                     │
  │ 🟡 Dal Fry + Rice         16g      │
  │    420 cal · 🍳 30m                 │
  │    "14g under budget ⚠️"            │
  │                                     │
  │ ── OR ENTER CUSTOM MEAL ────────── │
  │ [➕ Create Custom Meal]             │
  └─────────────────────────────────────┘

Each suggestion shows how it compares to the slot's protein budget.
Trainer picks one → meal replaces → verification panel updates LIVE.
```

**2. Add Custom Meal (with live validation):**
```
Trainer taps [➕ Add Custom Meal]:

  ┌─────────────────────────────────────┐
  │ ➕ CREATE CUSTOM MEAL               │
  │                                     │
  │ Meal Name*: [________________]      │
  │                                     │
  │ Protein (g)*: [____]                │
  │  → Live: "This adds Xg to plan     │
  │     total. New total: Yg / Zg ✅"   │
  │                                     │
  │ Calories*: [____]                   │
  │ Carbs (g): [____]                   │
  │ Fat (g): [____]                     │
  │ Fiber (g): [____]                   │
  │ Prep Time (min): [____]             │
  │                                     │
  │ Ingredients:                        │
  │ [____________________________________]│
  │ (comma separated)                   │
  │                                     │
  │ Assign to slot:                     │
  │ [Breakfast ▼]                       │
  │ Options: Breakfast / Lunch / Dinner │
  │  / Snack / Pre-Workout /           │
  │  Post-Workout / Extra              │
  │                                     │
  │ Trainer Note:                       │
  │ [____________________________________]│
  │                                     │
  │ ── LIVE IMPACT PREVIEW ──────────  │
  │ Current plan: 98g protein           │
  │ After adding: 128g protein          │
  │ Target: 120g → ✅ WILL PASS        │
  │                                     │
  │ [Cancel]          [Add to Plan]     │
  └─────────────────────────────────────┘

The "LIVE IMPACT PREVIEW" updates as trainer types protein value.
Shows whether adding this meal will make the plan pass or not.
```

**3. Auto-Fix Protein Gaps:**
```
Trainer taps [🤖 Auto-Fix Protein Gaps]:

System analyzes which slots are under-target:
  LN: -12g under  →  Suggest higher-protein lunch replacement
  SN: -4g under   →  Suggest protein-rich snack swap
  DN: -9g under   →  Suggest higher-protein dinner replacement

Shows 3 options:
  a) [Swap weak meals] — auto-replaces under-target meals with higher-protein alternatives
  b) [Add supplement] — suggests "Add 1 scoop whey = +24g, plan will pass ✅"
  c) [Add extra meal] — suggests an extra snack/mini-meal to fill the gap

Each option shows the PROJECTED new total before applying.
```

**4. Per-Meal Trainer Notes:**
```
Trainer taps [📝 Note] on any meal:
→ Inline text input appears below the meal card
→ Placeholder: "Add instruction for this meal..."
→ Examples: "Add extra curd for +5g protein"
            "Eat within 30 min of workout"
            "Replace rice with quinoa if available"
→ Saved with amber background and 📝 icon
→ Visible to user on their meal card in normal mode
```

**5. Add Supplement from Trainer Mode:**
```
Trainer taps [➕ Add Supplement]:
→ Opens supplement sheet (same as user's, from v3 spec)
→ BUT also shows live impact on protein verification
→ "Adding 1 scoop whey + milk = +32g → Plan total: 130g / 120g ✅"
```

### Save & Validation Flow:

```
Trainer taps [💾 Save & Apply Modified Plan]:

1. Run full verification:
   - Protein: pass/fail with exact numbers
   - Calories: within ±15% of target? 
   - Carbs/Fat: reasonable check

2. If protein PASSES (≥95% of target):
   ┌──────────────────────────────┐
   │ ✅ Plan Verified!             │
   │                              │
   │ Protein: 125g / 120g (104%) │
   │ Calories: 2,150 / 2,100     │
   │ Meals: 6 planned             │
   │                              │
   │ [Save Plan]                  │
   └──────────────────────────────┘
   → Saves with "Modified by Trainer" badge
   → User sees modified plan on Dashboard

3. If protein FAILS (<95% of target):
   ┌──────────────────────────────┐
   │ ⚠️ Protein Target Not Met    │
   │                              │
   │ Protein: 98g / 120g (82%)   │
   │ Short by: 22g               │
   │                              │
   │ Suggestions:                 │
   │ • Add 1 scoop whey (+24g)   │
   │ • Swap lunch for chicken    │
   │   curry (+15g)              │
   │                              │
   │ [Save Anyway]  [Fix First]  │
   └──────────────────────────────┘
   → Trainer can save anyway (with warning badge)
   → Or fix first, then save

4. After saving:
   → Dashboard shows: "✏️ Plan modified by trainer"
   → Meal cards show trainer notes
   → History logs: { modifiedBy: "trainer", verified: true/false }
```

### State Architecture:

```javascript
// Add to useMealPlanStore
trainerMode: false,          // toggle from settings
trainerEdits: {
  replacedMeals: {},         // { slotIndex: customMealObject }
  addedMeals: [],            // extra meals added by trainer
  removedSlots: new Set(),   // slots trainer removed
  notes: {                   
    general: "",             // overall plan note
    perMeal: {}              // { 0: "Add curd", 2: "Eat before 7pm" }
  },
  proteinOverride: null,     // if trainer overrides target
  supplements: [],           // supplements added by trainer
},
modifiedByTrainer: false,    // true after save
verificationResult: null,    // latest verification output

// Actions
enableTrainerMode(),
disableTrainerMode(),
trainerReplaceMeal(slotIndex, newMeal),
trainerAddCustomMeal(mealData, slotType),
trainerRemoveMeal(slotIndex),
trainerAddNote(slotIndex, note),
trainerSetGeneralNote(note),
trainerOverrideProtein(newTarget),
trainerAddSupplement(supplement),
trainerAutoFix(),            // auto-suggest fixes for protein gaps
verifyPlan(),                // run verification, return result
trainerSavePlan(),           // save with verification
```

### Components:

```
src/pages/Trainer.jsx                     # Main trainer page
src/components/trainer/
├── ProteinVerificationPanel.jsx          # STICKY top panel — live score
├── TrainerMealCard.jsx                   # Editable meal card with replace/note/remove
├── ReplaceMealSheet.jsx                  # Bottom sheet to pick replacement (protein-sorted)
├── CustomMealForm.jsx                    # Manual meal entry with live impact preview
├── TrainerNoteInput.jsx                  # Inline note editor
├── AutoFixSuggestions.jsx                # AI-powered gap fixer
├── PlanValidationModal.jsx              # Final save verification modal
├── ProteinBudgetBar.jsx                  # Per-slot budget bar (actual vs target)
└── TrainerBadge.jsx                      # "Modified by Trainer" badge component
```

### Visual Design:

- Trainer page: amber/gold accent theme (distinct from user's violet protein theme)
- Verification panel: sticky at top, bg-gray-900 with amber border when warning, green when passing
- Per-slot protein bars: violet fill on gray track, with target marker line
- Trainer notes: amber-100 bg with 📝 icon
- Modified badge: amber badge "✏️ Modified by Trainer"
- Custom meal form: violet "Add to Plan" button, live impact preview in emerald/red

---

## 🚀 Claude CLI Prompt

```
Read FEATURE-SPEC-V5.md thoroughly. Build the complete Trainer Mode with Live Protein Verification:

### PART 1: Trainer Mode Toggle & Navigation

1. Update Settings page:
   - Add "🏋️ Trainer Mode" toggle with description: "Enable meal plan editing tools for trainers/coaches"
   - Persist trainerMode in useProfileStore (saved to IndexedDB)
   - Toggle styled with amber-500 ON state (to distinguish from user's violet theme)

2. Update bottom navigation:
   - When trainerMode=true: show 5 tabs: Dashboard | Meals | Nutrients | 🏋️ Trainer | Profile
   - Trainer tab: amber-500 active color, clipboard-edit icon from Lucide
   - When trainerMode=false: standard 4 tabs (Trainer tab hidden)

### PART 2: Protein Verification Panel (THE KEY COMPONENT)

Create src/components/trainer/ProteinVerificationPanel.jsx:
- STICKY at top of Trainer page (position: sticky, top: 0, z-index: 40)
- Shows:
  * "Target: {X}g   Plan Total: {Y}g"
  * Progress bar: filled width = (totalProtein/target * 100)%
    - Green (emerald-500) when ≥95% of target
    - Amber (amber-500) when 80-94%
    - Red (red-500) when <80%
  * Status message: "✅ On target!" or "⚠️ 22g short" or "❌ 45g short"
  * Per-meal breakdown: horizontal bars for each slot showing actual vs budget
    - Each bar: slot label | filled bar | "actual/budget" | status icon
    - Green: within ±3g | Amber: within ±10g | Red: >10g off
  * [🤖 Auto-fix Protein Gaps] button at bottom

This panel RECALCULATES every time any meal is modified, added, or removed. Use useEffect watching the meal plan state.

### PART 3: Trainer Page

Create src/pages/Trainer.jsx:
- Header: "🏋️ Trainer Mode" with amber accent
- ProteinVerificationPanel (sticky top)
- Target override: input field to change protein target for this session
  * Shows: "User's target: {X}g" with [Override] button
  * Override input: number field + [Apply] + [Reset to user's]
  * When overridden: all verification recalculates against new target
- List of all meal slots as TrainerMealCards
- [➕ Add Custom Meal] button — opens CustomMealForm
- [➕ Add Supplement] button — opens supplement sheet with impact preview
- General trainer note: textarea with placeholder "Add notes for today's plan..."
- Final section: PlanValidationModal trigger
- [💾 Save & Apply Modified Plan] button at bottom (amber gradient)

### PART 4: TrainerMealCard

Create src/components/trainer/TrainerMealCard.jsx:
- Shows all meal info: name, protein (violet), cal, carbs, fat, prepTime, tags
- Protein budget bar: shows THIS slot's actual protein vs slot target
  * Format: "🟣 24g / 28g budget" with mini progress bar
  * Green if within ±3g, amber if ±10g, red if >10g off
- Three action buttons:
  * [✏️ Replace] → opens ReplaceMealSheet
  * [🗑️ Remove] → removes meal from slot (with confirmation: "Remove this meal? Plan protein will drop by Xg")
  * [📝 Note] → toggles TrainerNoteInput inline
- If meal was modified: show amber "✏️ Modified" badge
- If slot is empty (meal removed): show dashed border + "No meal assigned" + [➕ Add Meal] button
- Trainer note below card if exists: amber-50 bg, italic text, 📝 icon

### PART 5: Replace Meal Sheet (Protein-Sorted)

Create src/components/trainer/ReplaceMealSheet.jsx:
- Bottom sheet triggered from TrainerMealCard [✏️ Replace]
- Header: "Replace {slotType} · Protein Budget: {X}g"
- Search input to filter meals by name
- Filter buttons: [All] [High Protein] [Quick] [Budget]
- Meal list from database, SORTED by closest protein match to slot budget:
  * Each item: meal name, protein (large, color-coded), cal, prepTime
  * Color: green if protein within ±5g of budget, amber if ±10g, red if >10g off
  * Shows diff: "+8g over budget" or "12g under budget"
- At bottom: [➕ Create Custom Meal Instead] → opens CustomMealForm
- On select → replaces meal in plan → ProteinVerificationPanel recalculates LIVE

### PART 6: Custom Meal Form (with Live Impact Preview)

Create src/components/trainer/CustomMealForm.jsx:
- Opens as full-screen modal or large bottom sheet
- Fields:
  * Meal Name (required, text)
  * Protein in grams (required, number) — THIS IS THE KEY FIELD
  * Calories (required, number)
  * Carbs (number, optional)
  * Fat (number, optional)
  * Fiber (number, optional)
  * Prep Time in minutes (number, optional, default 10)
  * Ingredients (text, comma separated)
  * Assign to slot: dropdown — Breakfast / Lunch / Dinner / Snack / Pre-Workout / Post-Workout / Extra
  * Trainer Note (text, optional)

- LIVE IMPACT PREVIEW (updates as trainer types protein value):
  * "Current plan total: 98g protein"
  * "After adding this meal: {98 + inputProtein}g protein"
  * "Target: 120g → {status}"
  * Status: "✅ Will PASS" (green) or "⚠️ Still short by Xg" (amber) or "❌ Still far from target" (red)
  * This preview updates in real-time as the protein input changes

- Validation: name required, protein > 0, calories > 0
- [Cancel] and [Add to Plan] buttons
- On add: creates meal object with id "trainer-custom-{timestamp}", adds to plan, panel recalculates

### PART 7: Auto-Fix Protein Gaps

Create src/components/trainer/AutoFixSuggestions.jsx:
- Triggered from [🤖 Auto-fix Protein Gaps] button on verification panel
- Analyzes which slots are under-target
- Generates 3 fix strategies:

Strategy A: "Swap weak meals"
  - For each under-target slot, find a higher-protein meal from DB
  - Show: "Replace {current} with {suggested} → +{diff}g"
  - Preview new total after all swaps
  - [Apply All Swaps] button

Strategy B: "Add supplement"
  - "Add 1 scoop whey with milk = +32g protein"
  - Preview: "Plan total: 98g → 130g ✅"
  - [Add Supplement] button

Strategy C: "Add extra snack"
  - Suggest a high-protein snack as additional meal
  - "Add Roasted Chana + Peanuts = +14g protein"
  - Preview new total
  - [Add Extra Snack] button

Each strategy shows projected total and whether it passes verification.

### PART 8: Plan Validation Modal

Create src/components/trainer/PlanValidationModal.jsx:
- Triggered when trainer taps [💾 Save & Apply Modified Plan]
- Runs full verification and shows results:

IF PASSES (protein ≥95% of target):
  ┌─────────────────────────────┐
  │ ✅ Plan Verified!            │
  │                             │
  │ Protein: 125g/120g (104%)  │
  │ Calories: 2,150/2,100      │
  │ Meals: 6 planned            │
  │ Trainer notes: 3 added      │
  │                             │
  │ [✅ Save & Apply Plan]      │
  └─────────────────────────────┘

IF FAILS (protein <95%):
  ┌─────────────────────────────┐
  │ ⚠️ Protein Target Not Met   │
  │                             │
  │ Protein: 98g/120g (82%)    │
  │ Short by: 22g              │
  │                             │
  │ Quick fixes:                │
  │ • Add whey shake (+24g)    │
  │ • Swap lunch to X (+15g)   │
  │                             │
  │ [Save Anyway] [Fix First]  │
  └─────────────────────────────┘

- "Save Anyway" saves with a ⚠️ warning badge
- "Fix First" closes modal, goes back to editing
- After save: modifiedByTrainer = true, user sees changes on Dashboard

### PART 9: User-Facing Changes After Trainer Save

On Dashboard (normal user view):
- Show badge: "✏️ Plan modified by trainer" (amber badge, top of meal list)
- Trainer notes visible on each meal card (amber bg, 📝 icon, italic)
- If trainer added supplements → show in supplement section
- If trainer replaced meals → show "✏️ Modified" tag on those cards

On History page:
- Log: { date, modifiedBy: "trainer", verified: boolean, proteinTarget, proteinActual }

### PART 10: Zustand Store Updates

Add to useMealPlanStore:
```javascript
// Trainer state
trainerMode: false,
trainerEdits: {
  replacedMeals: {},       // { slotIndex: newMealObject }
  addedMeals: [],          // custom meals added
  removedSlots: new Set(), // removed slot indices
  notes: { general: "", perMeal: {} },
  proteinOverride: null,
  supplements: [],
},
modifiedByTrainer: false,
verificationResult: null,

// Actions
enableTrainerMode: () => set({ trainerMode: true }),
disableTrainerMode: () => set({ trainerMode: false, trainerEdits: initialEdits }),
trainerReplaceMeal: (index, meal) => { /* replace + reverify */ },
trainerAddCustomMeal: (meal, slot) => { /* add + reverify */ },
trainerRemoveMeal: (index) => { /* remove + reverify */ },
trainerAddNote: (index, note) => { /* save note */ },
trainerSetGeneralNote: (note) => { /* save general note */ },
trainerOverrideProtein: (target) => { /* override + reverify */ },
trainerAutoFix: () => { /* analyze gaps, return suggestions */ },
verifyPlan: () => { /* run verification logic, update verificationResult */ },
trainerSavePlan: () => { /* save edits, set modifiedByTrainer, persist */ },
```

### ANIMATIONS:
- Verification panel: progress bar width transitions smoothly on any change
- Status color: smooth transition between green/amber/red
- Per-slot bars: animate width changes
- Replace: old meal slides out, new slides in
- Custom meal form: live impact preview number animates (count up/down)
- Save success: checkmark scale animation + green flash on panel
- Save warning: shake animation on panel
- TrainerMealCard modified badge: pop-in animation

### TESTING CHECKLIST:
1. Enable trainer mode → Trainer tab appears
2. See verification panel with current plan's protein score
3. Replace a meal → panel recalculates LIVE → bars update
4. Add custom meal with 30g protein → see live impact preview update as you type
5. Remove a meal → total drops → panel turns amber/red
6. Add trainer note → appears on card with amber bg
7. Tap Auto-fix → see 3 strategies with projected totals
8. Override protein target → all verification recalculates
9. Save when passing → green "Verified!" modal → saves
10. Save when failing → amber warning → "Save Anyway" or "Fix First"
11. Disable trainer mode → Trainer tab disappears, user sees modifications
12. Check Dashboard shows "Modified by trainer" badge
13. Check meal cards show trainer notes
14. Test mobile (375px) → verification panel fits, forms scrollable
```
