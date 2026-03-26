import { useState, useEffect, useCallback, useRef } from "react";

const MEALS_DB = {
  "non-veg": {
    breakfast: [
      { name: "Egg Bhurji with Multigrain Toast", cal: 380, protein: 24, carbs: 32, fat: 16, fiber: 4, vitC: 8, iron: 3.2, time: 15, tags: ["quick", "high-protein"], ingredients: ["3 eggs", "1 onion", "2 toast", "spices"], glow: ["biotin", "zinc"] },
      { name: "Chicken Keema Paratha", cal: 420, protein: 28, carbs: 38, fat: 18, fiber: 3, vitC: 5, iron: 4.1, time: 25, tags: ["cook", "high-protein"], ingredients: ["wheat flour", "chicken keema", "spices", "curd"], glow: ["iron", "B12"] },
      { name: "Masala Omelette + Avocado Toast", cal: 360, protein: 22, carbs: 28, fat: 20, fiber: 6, vitC: 12, iron: 2.8, time: 10, tags: ["quick", "balanced"], ingredients: ["2 eggs", "avocado", "bread", "tomato"], glow: ["vitE", "biotin"] },
      { name: "Moong Dal Cheela with Egg", cal: 340, protein: 26, carbs: 30, fat: 12, fiber: 5, vitC: 6, iron: 3.5, time: 20, tags: ["cook", "high-protein"], ingredients: ["moong dal", "1 egg", "spices", "chutney"], glow: ["iron", "zinc"] },
    ],
    lunch: [
      { name: "Chicken Curry + Brown Rice + Salad", cal: 520, protein: 38, carbs: 48, fat: 16, fiber: 6, vitC: 18, iron: 4.5, time: 30, tags: ["cook", "balanced"], ingredients: ["chicken", "brown rice", "onion", "tomato", "cucumber"], glow: ["B12", "iron"] },
      { name: "Grilled Fish Thali", cal: 480, protein: 42, carbs: 40, fat: 14, fiber: 5, vitC: 22, iron: 3.8, time: 30, tags: ["cook", "high-protein"], ingredients: ["fish fillet", "rice", "dal", "sabzi", "salad"], glow: ["omega3", "vitD"] },
      { name: "Tandoori Chicken Wrap", cal: 440, protein: 35, carbs: 42, fat: 15, fiber: 4, vitC: 15, iron: 3.2, time: 20, tags: ["quick", "high-protein"], ingredients: ["chicken", "roti", "yogurt", "veggies"], glow: ["B12", "zinc"] },
      { name: "Egg Fried Rice + Raita", cal: 460, protein: 22, carbs: 52, fat: 16, fiber: 4, vitC: 10, iron: 3.0, time: 20, tags: ["quick", "balanced"], ingredients: ["rice", "3 eggs", "veggies", "curd"], glow: ["biotin", "B12"] },
    ],
    dinner: [
      { name: "Chicken Tikka + Roti + Raita", cal: 420, protein: 36, carbs: 34, fat: 14, fiber: 3, vitC: 8, iron: 3.8, time: 25, tags: ["cook", "high-protein"], ingredients: ["chicken breast", "roti", "curd", "spices"], glow: ["B12", "zinc"] },
      { name: "Fish Curry + Steamed Rice", cal: 400, protein: 34, carbs: 38, fat: 12, fiber: 4, vitC: 14, iron: 3.2, time: 30, tags: ["cook", "balanced"], ingredients: ["fish", "rice", "curry paste", "coconut milk"], glow: ["omega3", "vitD"] },
      { name: "Keema Matar + 2 Roti", cal: 440, protein: 32, carbs: 36, fat: 18, fiber: 5, vitC: 12, iron: 5.2, time: 25, tags: ["cook", "high-protein"], ingredients: ["mutton keema", "peas", "roti", "spices"], glow: ["iron", "B12"] },
      { name: "Egg Curry + Jowar Roti", cal: 380, protein: 24, carbs: 36, fat: 14, fiber: 6, vitC: 10, iron: 4.0, time: 20, tags: ["cook", "balanced"], ingredients: ["3 eggs", "jowar roti", "onion gravy"], glow: ["biotin", "iron"] },
    ],
    snack: [
      { name: "Boiled Eggs + Peanuts", cal: 220, protein: 18, carbs: 6, fat: 14, fiber: 2, vitC: 2, iron: 2.0, time: 5, tags: ["quick", "high-protein"], ingredients: ["2 eggs", "handful peanuts"], glow: ["biotin", "zinc"] },
      { name: "Chicken Tikka Bites", cal: 180, protein: 22, carbs: 4, fat: 8, fiber: 1, vitC: 4, iron: 2.5, time: 15, tags: ["cook", "high-protein"], ingredients: ["chicken breast", "yogurt", "spices"], glow: ["B12", "zinc"] },
    ],
    preworkout: [
      { name: "Banana + Peanut Butter Toast", cal: 280, protein: 10, carbs: 38, fat: 12, fiber: 4, vitC: 10, iron: 1.2, time: 5, tags: ["quick", "energy"], ingredients: ["banana", "toast", "peanut butter"], glow: ["potassium", "vitB6"] },
      { name: "Dates + Almonds + Black Coffee", cal: 180, protein: 5, carbs: 28, fat: 8, fiber: 3, vitC: 2, iron: 1.8, time: 2, tags: ["quick", "energy"], ingredients: ["4 dates", "8 almonds", "coffee"], glow: ["iron", "magnesium"] },
    ],
    postworkout: [
      { name: "Whey Shake + Banana", cal: 260, protein: 30, carbs: 32, fat: 4, fiber: 3, vitC: 10, iron: 1.0, time: 3, tags: ["quick", "recovery"], ingredients: ["whey protein", "banana", "milk"], glow: ["calcium", "B12"] },
      { name: "Egg White Omelette + Toast", cal: 240, protein: 26, carbs: 22, fat: 6, fiber: 2, vitC: 5, iron: 1.5, time: 10, tags: ["quick", "recovery"], ingredients: ["4 egg whites", "toast", "veggies"], glow: ["biotin", "selenium"] },
    ],
  },
  veg: {
    breakfast: [
      { name: "Paneer Paratha + Curd", cal: 400, protein: 20, carbs: 38, fat: 18, fiber: 3, vitC: 5, iron: 3.0, time: 20, tags: ["cook", "high-protein"], ingredients: ["wheat flour", "paneer", "curd", "spices"], glow: ["calcium", "B12"] },
      { name: "Moong Dal Cheela + Mint Chutney", cal: 280, protein: 18, carbs: 32, fat: 8, fiber: 6, vitC: 12, iron: 3.8, time: 15, tags: ["cook", "balanced"], ingredients: ["moong dal", "spices", "mint", "curd"], glow: ["iron", "zinc"] },
      { name: "Poha with Peanuts + Chai", cal: 320, protein: 10, carbs: 42, fat: 12, fiber: 4, vitC: 8, iron: 2.5, time: 15, tags: ["quick", "balanced"], ingredients: ["poha", "peanuts", "onion", "lemon"], glow: ["iron", "vitC"] },
      { name: "Besan Cheela + Stuffed Paratha", cal: 380, protein: 16, carbs: 40, fat: 16, fiber: 5, vitC: 6, iron: 3.2, time: 20, tags: ["cook", "balanced"], ingredients: ["besan", "veggies", "wheat flour", "potato"], glow: ["iron", "vitB6"] },
    ],
    lunch: [
      { name: "Rajma Chawal + Salad + Raita", cal: 480, protein: 22, carbs: 62, fat: 12, fiber: 10, vitC: 18, iron: 5.5, time: 30, tags: ["cook", "balanced"], ingredients: ["rajma", "rice", "onion", "curd", "salad"], glow: ["iron", "folate"] },
      { name: "Paneer Tikka Bowl + Quinoa", cal: 460, protein: 28, carbs: 40, fat: 20, fiber: 6, vitC: 15, iron: 3.5, time: 25, tags: ["cook", "high-protein"], ingredients: ["paneer", "quinoa", "bell peppers", "yogurt"], glow: ["calcium", "zinc"] },
      { name: "Chole + 2 Roti + Onion Salad", cal: 440, protein: 18, carbs: 54, fat: 14, fiber: 12, vitC: 14, iron: 5.0, time: 25, tags: ["cook", "balanced"], ingredients: ["chickpeas", "roti", "onion", "spices"], glow: ["iron", "folate"] },
      { name: "Dal Fry + Jeera Rice + Sabzi", cal: 420, protein: 16, carbs: 56, fat: 12, fiber: 8, vitC: 12, iron: 4.2, time: 30, tags: ["cook", "balanced"], ingredients: ["toor dal", "rice", "seasonal veggies"], glow: ["iron", "zinc"] },
    ],
    dinner: [
      { name: "Palak Paneer + 2 Roti", cal: 400, protein: 22, carbs: 34, fat: 18, fiber: 5, vitC: 25, iron: 5.8, time: 25, tags: ["cook", "high-protein"], ingredients: ["paneer", "spinach", "roti", "spices"], glow: ["iron", "vitA", "calcium"] },
      { name: "Mixed Dal Khichdi + Kadhi", cal: 380, protein: 16, carbs: 48, fat: 10, fiber: 7, vitC: 8, iron: 3.8, time: 25, tags: ["cook", "balanced"], ingredients: ["rice", "moong dal", "veggies", "kadhi"], glow: ["zinc", "B6"] },
      { name: "Mushroom Matar + Bajra Roti", cal: 360, protein: 18, carbs: 38, fat: 14, fiber: 8, vitC: 16, iron: 4.5, time: 25, tags: ["cook", "balanced"], ingredients: ["mushroom", "peas", "bajra flour", "spices"], glow: ["selenium", "iron"] },
      { name: "Tofu Bhurji + Multigrain Roti", cal: 340, protein: 20, carbs: 32, fat: 14, fiber: 5, vitC: 10, iron: 5.0, time: 15, tags: ["quick", "high-protein"], ingredients: ["tofu", "multigrain roti", "veggies"], glow: ["calcium", "iron"] },
    ],
    snack: [
      { name: "Paneer Tikka (Air Fried)", cal: 200, protein: 16, carbs: 6, fat: 12, fiber: 1, vitC: 8, iron: 1.5, time: 15, tags: ["cook", "high-protein"], ingredients: ["paneer", "bell peppers", "yogurt"], glow: ["calcium", "zinc"] },
      { name: "Roasted Makhana + Green Tea", cal: 150, protein: 5, carbs: 18, fat: 6, fiber: 2, vitC: 3, iron: 1.8, time: 5, tags: ["quick", "light"], ingredients: ["makhana", "ghee", "spices"], glow: ["calcium", "magnesium"] },
    ],
    preworkout: [
      { name: "Banana + Peanut Butter Toast", cal: 280, protein: 10, carbs: 38, fat: 12, fiber: 4, vitC: 10, iron: 1.2, time: 5, tags: ["quick", "energy"], ingredients: ["banana", "toast", "peanut butter"], glow: ["potassium", "vitB6"] },
      { name: "Dates + Almonds + Black Coffee", cal: 180, protein: 5, carbs: 28, fat: 8, fiber: 3, vitC: 2, iron: 1.8, time: 2, tags: ["quick", "energy"], ingredients: ["4 dates", "8 almonds", "coffee"], glow: ["iron", "magnesium"] },
    ],
    postworkout: [
      { name: "Whey Shake + Banana", cal: 260, protein: 30, carbs: 32, fat: 4, fiber: 3, vitC: 10, iron: 1.0, time: 3, tags: ["quick", "recovery"], ingredients: ["whey protein", "banana", "milk"], glow: ["calcium", "B12"] },
      { name: "Paneer Bhurji + Toast", cal: 300, protein: 22, carbs: 24, fat: 14, fiber: 2, vitC: 5, iron: 2.0, time: 10, tags: ["quick", "recovery"], ingredients: ["paneer", "toast", "veggies"], glow: ["calcium", "zinc"] },
    ],
  },
  vegan: {
    breakfast: [
      { name: "Tofu Scramble + Sourdough", cal: 340, protein: 20, carbs: 32, fat: 14, fiber: 5, vitC: 12, iron: 5.0, time: 15, tags: ["quick", "high-protein"], ingredients: ["tofu", "sourdough", "turmeric", "veggies"], glow: ["iron", "calcium"] },
      { name: "Overnight Oats + Chia + Berries", cal: 320, protein: 12, carbs: 44, fat: 12, fiber: 8, vitC: 20, iron: 3.2, time: 5, tags: ["quick", "balanced"], ingredients: ["oats", "chia seeds", "almond milk", "berries"], glow: ["omega3", "vitC"] },
      { name: "Poha with Peanuts & Veggies", cal: 300, protein: 10, carbs: 42, fat: 10, fiber: 4, vitC: 15, iron: 3.5, time: 15, tags: ["quick", "balanced"], ingredients: ["poha", "peanuts", "onion", "curry leaves"], glow: ["iron", "vitC"] },
      { name: "Ragi Dosa + Coconut Chutney", cal: 280, protein: 8, carbs: 40, fat: 10, fiber: 5, vitC: 6, iron: 4.0, time: 20, tags: ["cook", "balanced"], ingredients: ["ragi flour", "coconut", "dal", "spices"], glow: ["calcium", "iron"] },
    ],
    lunch: [
      { name: "Chana Masala + Brown Rice + Salad", cal: 460, protein: 20, carbs: 58, fat: 12, fiber: 14, vitC: 22, iron: 6.0, time: 30, tags: ["cook", "balanced"], ingredients: ["chickpeas", "brown rice", "tomato", "salad"], glow: ["iron", "folate"] },
      { name: "Tofu Tikka Bowl + Quinoa", cal: 440, protein: 26, carbs: 42, fat: 16, fiber: 8, vitC: 18, iron: 6.5, time: 25, tags: ["cook", "high-protein"], ingredients: ["tofu", "quinoa", "veggies", "tahini"], glow: ["calcium", "iron"] },
      { name: "Rajma + Jeera Rice + Salad", cal: 450, protein: 18, carbs: 60, fat: 10, fiber: 12, vitC: 15, iron: 5.5, time: 30, tags: ["cook", "balanced"], ingredients: ["rajma", "rice", "onion", "cucumber"], glow: ["iron", "folate"] },
      { name: "Sambar Rice + Kootu + Papad", cal: 420, protein: 14, carbs: 56, fat: 12, fiber: 10, vitC: 18, iron: 4.8, time: 30, tags: ["cook", "balanced"], ingredients: ["toor dal", "veggies", "rice", "tamarind"], glow: ["iron", "zinc"] },
    ],
    dinner: [
      { name: "Tofu Palak + Bajra Roti", cal: 360, protein: 22, carbs: 34, fat: 14, fiber: 7, vitC: 28, iron: 7.0, time: 25, tags: ["cook", "high-protein"], ingredients: ["tofu", "spinach", "bajra flour", "spices"], glow: ["iron", "vitA", "calcium"] },
      { name: "Mixed Veg Dal + Roti", cal: 380, protein: 16, carbs: 46, fat: 10, fiber: 8, vitC: 12, iron: 4.5, time: 25, tags: ["cook", "balanced"], ingredients: ["mixed dal", "roti", "seasonal veggies"], glow: ["zinc", "iron"] },
      { name: "Mushroom Stir-fry + Quinoa", cal: 340, protein: 18, carbs: 36, fat: 12, fiber: 6, vitC: 14, iron: 4.0, time: 20, tags: ["quick", "balanced"], ingredients: ["mushroom", "quinoa", "broccoli", "soy sauce"], glow: ["selenium", "vitD"] },
      { name: "Black Bean Tacos (Indian Style)", cal: 380, protein: 16, carbs: 44, fat: 14, fiber: 10, vitC: 20, iron: 4.8, time: 15, tags: ["quick", "balanced"], ingredients: ["black beans", "roti", "avocado", "salsa"], glow: ["iron", "folate"] },
    ],
    snack: [
      { name: "Roasted Chana + Jaggery", cal: 180, protein: 10, carbs: 24, fat: 5, fiber: 6, vitC: 2, iron: 3.0, time: 2, tags: ["quick", "high-protein"], ingredients: ["roasted chana", "jaggery"], glow: ["iron", "zinc"] },
      { name: "Trail Mix (Nuts + Seeds + Dry Fruit)", cal: 220, protein: 8, carbs: 16, fat: 16, fiber: 4, vitC: 3, iron: 2.5, time: 1, tags: ["quick", "energy"], ingredients: ["almonds", "walnuts", "pumpkin seeds", "raisins"], glow: ["omega3", "zinc", "vitE"] },
    ],
    preworkout: [
      { name: "Banana + Peanut Butter + Dates", cal: 300, protein: 10, carbs: 42, fat: 12, fiber: 5, vitC: 10, iron: 1.5, time: 3, tags: ["quick", "energy"], ingredients: ["banana", "peanut butter", "3 dates"], glow: ["potassium", "iron"] },
      { name: "Sweet Potato + Black Coffee", cal: 200, protein: 4, carbs: 38, fat: 2, fiber: 5, vitC: 22, iron: 1.2, time: 10, tags: ["quick", "energy"], ingredients: ["sweet potato", "coffee"], glow: ["vitA", "vitC"] },
    ],
    postworkout: [
      { name: "Soy Protein Shake + Banana", cal: 250, protein: 28, carbs: 30, fat: 4, fiber: 3, vitC: 10, iron: 2.0, time: 3, tags: ["quick", "recovery"], ingredients: ["soy protein", "banana", "almond milk"], glow: ["calcium", "iron"] },
      { name: "Sprouts Chaat + Peanuts", cal: 240, protein: 16, carbs: 26, fat: 8, fiber: 6, vitC: 18, iron: 3.5, time: 10, tags: ["quick", "recovery"], ingredients: ["mixed sprouts", "peanuts", "lemon", "onion"], glow: ["iron", "vitC"] },
    ],
  },
};

const LIFESTYLE_PRESETS = {
  student: { wake: "07:00", sleep: "23:30", workStart: "09:00", workEnd: "16:00", label: "Student" },
  office: { wake: "06:30", sleep: "23:00", workStart: "09:30", workEnd: "18:30", label: "Office (9-to-6)" },
  wfh: { wake: "07:30", sleep: "23:30", workStart: "09:00", workEnd: "18:00", label: "Work from Home" },
  earlybird: { wake: "05:00", sleep: "22:00", workStart: "07:00", workEnd: "15:00", label: "Early Bird" },
  nightshift: { wake: "14:00", sleep: "06:00", workStart: "22:00", workEnd: "06:00", label: "Night Shift" },
};

const GOALS = {
  muscle: { label: "Muscle Gain", icon: "💪", proteinMul: 2.2, carbMul: 3.5, fatMul: 0.9 },
  fatloss: { label: "Fat Loss", icon: "🔥", proteinMul: 2.4, carbMul: 2.0, fatMul: 0.7 },
  maintain: { label: "Maintain", icon: "⚖️", proteinMul: 1.8, carbMul: 3.0, fatMul: 0.8 },
  recomp: { label: "Recomposition", icon: "🔄", proteinMul: 2.0, carbMul: 2.5, fatMul: 0.8 },
};

const ACTIVITY_TYPES = [
  { id: "gym", label: "Gym / Weight Training", icon: "🏋️" },
  { id: "yoga", label: "Yoga / Pilates", icon: "🧘" },
  { id: "cardio", label: "Running / Cardio", icon: "🏃" },
  { id: "sports", label: "Sports / Games", icon: "⚽" },
  { id: "home", label: "Home Workout", icon: "🏠" },
  { id: "rest", label: "Rest Day", icon: "😴" },
];

function calcBMR(weight, height, age, gender) {
  if (gender === "male") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calcTDEE(bmr, activityLevel) {
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, intense: 1.9 };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

function generateMealSlots(schedule, workoutTime) {
  const wake = parseInt(schedule.wake.split(":")[0]) * 60 + parseInt(schedule.wake.split(":")[1]);
  const sleep = parseInt(schedule.sleep.split(":")[0]) * 60 + parseInt(schedule.sleep.split(":")[1]);
  const adjustedSleep = sleep < wake ? sleep + 1440 : sleep;
  const workout = workoutTime ? parseInt(workoutTime.split(":")[0]) * 60 + parseInt(workoutTime.split(":")[1]) : null;
  const adjustedWorkout = workout !== null && workout < wake ? workout + 1440 : workout;

  const slots = [];
  const fmt = (m) => { const mm = ((m % 1440) + 1440) % 1440; const h = Math.floor(mm / 60); const mi = mm % 60; const ampm = h >= 12 ? "PM" : "AM"; const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h; return `${h12}:${String(mi).padStart(2, "0")} ${ampm}`; };

  slots.push({ type: "breakfast", label: "Breakfast", time: fmt(wake + 30), priority: 1 });

  if (adjustedWorkout !== null) {
    if (adjustedWorkout - wake < 180) {
      slots.push({ type: "postworkout", label: "Post-Workout", time: fmt(adjustedWorkout + 45), priority: 2 });
      slots.push({ type: "snack", label: "Mid-Morning Snack", time: fmt(wake + 240), priority: 3 });
    } else {
      slots.push({ type: "snack", label: "Mid-Morning Snack", time: fmt(wake + 180), priority: 3 });
      slots.push({ type: "preworkout", label: "Pre-Workout", time: fmt(adjustedWorkout - 60), priority: 2 });
      slots.push({ type: "postworkout", label: "Post-Workout", time: fmt(adjustedWorkout + 45), priority: 2 });
    }
  } else {
    slots.push({ type: "snack", label: "Mid-Morning Snack", time: fmt(wake + 180), priority: 3 });
  }

  const lunchTime = wake + Math.round((adjustedSleep - wake) * 0.4);
  slots.push({ type: "lunch", label: "Lunch", time: fmt(lunchTime), priority: 1 });

  if (adjustedWorkout !== null && adjustedWorkout > lunchTime && adjustedWorkout < adjustedSleep - 180) {
    if (!slots.find(s => s.type === "preworkout")) {
      slots.push({ type: "preworkout", label: "Pre-Workout", time: fmt(adjustedWorkout - 60), priority: 2 });
    }
    if (!slots.find(s => s.type === "postworkout")) {
      slots.push({ type: "postworkout", label: "Post-Workout", time: fmt(adjustedWorkout + 45), priority: 2 });
    }
  }

  slots.push({ type: "dinner", label: "Dinner", time: fmt(adjustedSleep - 120), priority: 1 });

  slots.sort((a, b) => {
    const parseTime = (t) => { const [time, period] = t.split(" "); let [h, m] = time.split(":").map(Number); if (period === "PM" && h !== 12) h += 12; if (period === "AM" && h === 12) h = 0; return h * 60 + m; };
    return parseTime(a.time) - parseTime(b.time);
  });

  return slots;
}

function pickMeal(db, type, cookAvail, usedMeals) {
  const meals = db[type] || db.snack || [];
  const available = meals.filter(m => !usedMeals.has(m.name) && (cookAvail || m.tags.includes("quick")));
  if (available.length === 0) return meals[Math.floor(Math.random() * meals.length)];
  return available[Math.floor(Math.random() * available.length)];
}

const GlowBadge = ({ nutrient }) => {
  const colors = { iron: "bg-red-100 text-red-700", zinc: "bg-blue-100 text-blue-700", biotin: "bg-pink-100 text-pink-700", calcium: "bg-teal-100 text-teal-700", vitC: "bg-yellow-100 text-yellow-700", vitA: "bg-orange-100 text-orange-700", vitD: "bg-amber-100 text-amber-700", vitE: "bg-green-100 text-green-700", B12: "bg-purple-100 text-purple-700", omega3: "bg-cyan-100 text-cyan-700", folate: "bg-emerald-100 text-emerald-700", selenium: "bg-slate-100 text-slate-700", magnesium: "bg-indigo-100 text-indigo-700", potassium: "bg-lime-100 text-lime-700", vitB6: "bg-fuchsia-100 text-fuchsia-700" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[nutrient] || "bg-gray-100 text-gray-600"}`}>{nutrient}</span>;
};

const CircularProgress = ({ value, max, size = 80, color, label, unit = "g" }) => {
  const pct = Math.min((value / max) * 100, 100);
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm font-bold text-white">{Math.round(value)}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>
      <span className="text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );
};

const MealCard = ({ slot, meal, onSwap, onSkip, skipped, expanded, onToggle }) => {
  if (skipped) {
    return (
      <div className="rounded-2xl p-4 border border-dashed border-gray-700 opacity-50">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">{slot.time} · {slot.label}</span>
            <p className="text-gray-500 text-sm mt-1 line-through">{meal.name}</p>
          </div>
          <button onClick={onSkip} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-emerald-400 hover:bg-gray-700 transition-all">Restore</button>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl p-4 border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 hover:border-gray-700 transition-all" onClick={onToggle} style={{ cursor: "pointer" }}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: slot.type === "preworkout" ? "#fbbf24" : slot.type === "postworkout" ? "#34d399" : "#94a3b8" }}>{slot.time}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500 font-medium tracking-wider uppercase">{slot.label}</span>
          </div>
          <h3 className="text-white font-semibold text-base leading-snug">{meal.name}</h3>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-emerald-400 font-medium">{meal.cal} cal</span>
            <span className="text-blue-400">P: {meal.protein}g</span>
            <span className="text-amber-400">C: {meal.carbs}g</span>
            <span className="text-pink-400">F: {meal.fat}g</span>
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {meal.tags.map(t => (
              <span key={t} className={`px-2 py-0.5 rounded text-xs ${t === "quick" ? "bg-emerald-950 text-emerald-400" : t === "high-protein" ? "bg-blue-950 text-blue-400" : t === "recovery" ? "bg-purple-950 text-purple-400" : "bg-gray-800 text-gray-400"}`}>
                {t === "quick" ? "⚡ Quick" : t === "cook" ? "🍳 Cook" : t === "high-protein" ? "💪 High Protein" : t === "energy" ? "⚡ Energy" : t === "recovery" ? "🔄 Recovery" : t}
              </span>
            ))}
            <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-400">⏱ {meal.time} min</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 ml-3">
          <button onClick={(e) => { e.stopPropagation(); onSwap(); }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-blue-400 hover:bg-blue-950 transition-all whitespace-nowrap">🔄 Swap</button>
          <button onClick={(e) => { e.stopPropagation(); onSkip(); }} className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 text-red-400 hover:bg-red-950 transition-all whitespace-nowrap">✕ Skip</button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Ingredients</p>
          <div className="flex flex-wrap gap-1.5">
            {meal.ingredients.map((ing, i) => <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded-lg text-gray-300">{ing}</span>)}
          </div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mt-3 mb-2">Glow Nutrients</p>
          <div className="flex flex-wrap gap-1.5">
            {meal.glow.map((g, i) => <GlowBadge key={i} nutrient={g} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default function NutriFit() {
  const [screen, setScreen] = useState("onboard");
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ name: "", age: 25, gender: "male", weight: 70, height: 170, goal: "muscle", diet: "non-veg", activityLevel: "moderate", allergies: [], budget: 200 });
  const [schedule, setSchedule] = useState({ wake: "06:30", sleep: "23:00", workType: "office", workStart: "09:30", workEnd: "18:30", workoutTime: "07:00", workoutType: "gym", workoutDuration: 60, canCook: true, scheduleMode: "daily" });
  const [mealPlan, setMealPlan] = useState([]);
  const [skippedMeals, setSkippedMeals] = useState(new Set());
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [dailyView, setDailyView] = useState("meals");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState("");
  const [todayActivity, setTodayActivity] = useState(null);
  const [showCheckin, setShowCheckin] = useState(true);
  const contentRef = useRef(null);

  const bmr = calcBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = calcTDEE(bmr, profile.activityLevel);
  const goalCals = profile.goal === "muscle" ? tdee + 300 : profile.goal === "fatloss" ? tdee - 400 : tdee;
  const goalData = GOALS[profile.goal] || GOALS.maintain;
  const macros = {
    protein: Math.round(profile.weight * goalData.proteinMul),
    carbs: Math.round(profile.weight * goalData.carbMul),
    fat: Math.round(profile.weight * goalData.fatMul),
  };

  const generatePlan = useCallback(() => {
    const db = MEALS_DB[profile.diet] || MEALS_DB["non-veg"];
    const slots = generateMealSlots(schedule, todayActivity === "rest" ? null : schedule.workoutTime);
    const used = new Set();
    const plan = slots.map(slot => {
      const meal = pickMeal(db, slot.type, schedule.canCook, used);
      used.add(meal.name);
      return { slot, meal };
    });
    setMealPlan(plan);
    setSkippedMeals(new Set());
    setExpandedMeal(null);
  }, [profile.diet, schedule, todayActivity]);

  const swapMeal = (idx) => {
    const db = MEALS_DB[profile.diet] || MEALS_DB["non-veg"];
    const current = mealPlan[idx];
    const used = new Set(mealPlan.map(m => m.meal.name));
    used.delete(current.meal.name);
    const newMeal = pickMeal(db, current.slot.type, schedule.canCook, used);
    const updated = [...mealPlan];
    updated[idx] = { ...current, meal: newMeal };
    setMealPlan(updated);
  };

  const toggleSkip = (idx) => {
    const next = new Set(skippedMeals);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setSkippedMeals(next);
  };

  const totals = mealPlan.reduce((acc, m, i) => {
    if (skippedMeals.has(i)) return acc;
    return { cal: acc.cal + m.meal.cal, protein: acc.protein + m.meal.protein, carbs: acc.carbs + m.meal.carbs, fat: acc.fat + m.meal.fat, fiber: acc.fiber + m.meal.fiber, iron: acc.iron + m.meal.iron, vitC: acc.vitC + m.meal.vitC };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, vitC: 0 });

  const redistributeNote = skippedMeals.size > 0
    ? `${skippedMeals.size} meal(s) skipped — remaining meals cover ${Math.round((totals.cal / goalCals) * 100)}% of your target. Consider larger portions or adding a snack.`
    : null;

  const fetchAiTip = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `You are a friendly Indian fitness nutritionist. Give ONE short, actionable tip (2-3 sentences) for this person:
- Goal: ${profile.goal}, Diet: ${profile.diet}, Weight: ${profile.weight}kg
- Today's workout: ${todayActivity || schedule.workoutType}
- Current meal plan hits: ${totals.protein}g protein, ${totals.cal} calories
- Target: ${macros.protein}g protein, ${goalCals} calories
Include an Indian food suggestion. Be warm and motivational. No markdown.` }],
        }),
      });
      const data = await res.json();
      setAiTip(data.content?.[0]?.text || "Stay consistent with your meals today! Small wins add up.");
    } catch {
      setAiTip("Great job planning ahead! Remember to hydrate well between meals — try adding nimbu pani with a pinch of salt post-workout.");
    }
    setAiLoading(false);
  };

  const handleCheckin = (activity) => {
    setTodayActivity(activity);
    setShowCheckin(false);
    setTimeout(() => generatePlan(), 100);
  };

  useEffect(() => { if (todayActivity) generatePlan(); }, [todayActivity, generatePlan]);

  // --- SCREENS ---

  if (screen === "onboard") {
    const steps = [
      // Step 0: Welcome
      <div key="s0" className="flex flex-col items-center justify-center min-h-full text-center px-6 py-12">
        <div className="text-6xl mb-6">🥗</div>
        <h1 className="text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>NutriFit</h1>
        <p className="text-gray-400 mt-3 text-lg max-w-xs leading-relaxed">Your AI-powered daily nutrition guide for fitness enthusiasts</p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["💪 Gym", "🧘 Yoga", "🏃 Cardio", "🥦 Veg", "🍗 Non-Veg", "🌱 Vegan"].map(t => (
            <span key={t} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300">{t}</span>
          ))}
        </div>
        <button onClick={() => setStep(1)} className="mt-8 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-lg transition-all transform hover:scale-105">Get Started →</button>
      </div>,

      // Step 1: Basic info
      <div key="s1" className="px-5 py-8">
        <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-2">Step 1 of 4</p>
        <h2 className="text-2xl font-bold text-white mb-6">About You</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Your Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} placeholder="Enter your name" className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Age</label>
              <input type="number" value={profile.age} onChange={e => setProfile(p => ({...p, age: +e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Gender</label>
              <div className="flex gap-2">
                {["male", "female"].map(g => (
                  <button key={g} onClick={() => setProfile(p => ({...p, gender: g}))} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${profile.gender === g ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{g === "male" ? "♂ Male" : "♀ Female"}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Weight (kg)</label>
              <input type="number" value={profile.weight} onChange={e => setProfile(p => ({...p, weight: +e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Height (cm)</label>
              <input type="number" value={profile.height} onChange={e => setProfile(p => ({...p, height: +e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>
        </div>
        <button onClick={() => setStep(2)} className="w-full mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all">Continue →</button>
      </div>,

      // Step 2: Goal & Diet
      <div key="s2" className="px-5 py-8">
        <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-2">Step 2 of 4</p>
        <h2 className="text-2xl font-bold text-white mb-6">Goal & Diet Type</h2>
        <p className="text-sm text-gray-400 mb-3">Your fitness goal</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {Object.entries(GOALS).map(([k, v]) => (
            <button key={k} onClick={() => setProfile(p => ({...p, goal: k}))} className={`p-4 rounded-xl text-left transition-all ${profile.goal === k ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"}`}>
              <span className="text-2xl">{v.icon}</span>
              <p className="text-sm font-semibold mt-1">{v.label}</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mb-3">Diet preference</p>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[["non-veg","🍗","Non-Veg"],["veg","🥦","Veg"],["vegan","🌱","Vegan"]].map(([k,icon,label]) => (
            <button key={k} onClick={() => setProfile(p => ({...p, diet: k}))} className={`p-4 rounded-xl text-center transition-all ${profile.diet === k ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-300 border border-gray-700"}`}>
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-semibold mt-1">{label}</p>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-400 mb-3">Activity level</p>
        <div className="grid grid-cols-2 gap-2">
          {[["sedentary","Sedentary"],["light","Light Active"],["moderate","Moderate"],["active","Very Active"],["intense","Intense"]].map(([k,l]) => (
            <button key={k} onClick={() => setProfile(p => ({...p, activityLevel: k}))} className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${profile.activityLevel === k ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => setStep(3)} className="w-full mt-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all">Continue →</button>
      </div>,

      // Step 3: Schedule
      <div key="s3" className="px-5 py-8">
        <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-2">Step 3 of 4</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your Daily Schedule</h2>
        <p className="text-sm text-gray-500 mb-5">Meals will adapt to your routine</p>

        <p className="text-sm text-gray-400 mb-2">Quick preset</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(LIFESTYLE_PRESETS).map(([k, v]) => (
            <button key={k} onClick={() => setSchedule(s => ({...s, wake: v.wake, sleep: v.sleep, workStart: v.workStart, workEnd: v.workEnd, workType: k}))} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${schedule.workType === k ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{v.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Wake up</label>
            <input type="time" value={schedule.wake} onChange={e => setSchedule(s => ({...s, wake: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Sleep time</label>
            <input type="time" value={schedule.sleep} onChange={e => setSchedule(s => ({...s, sleep: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Workout time</label>
            <input type="time" value={schedule.workoutTime} onChange={e => setSchedule(s => ({...s, workoutTime: e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Duration (min)</label>
            <input type="number" value={schedule.workoutDuration} onChange={e => setSchedule(s => ({...s, workoutDuration: +e.target.value}))} className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:border-emerald-500 focus:outline-none" />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm text-gray-400 mb-2 block">Can you cook today?</label>
          <div className="flex gap-2">
            {[true, false].map(v => (
              <button key={String(v)} onClick={() => setSchedule(s => ({...s, canCook: v}))} className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${schedule.canCook === v ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{v ? "🍳 Yes, I can cook" : "⚡ Quick meals only"}</button>
            ))}
          </div>
        </div>
        <button onClick={() => setStep(4)} className="w-full mt-4 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all">Continue →</button>
      </div>,

      // Step 4: Summary
      <div key="s4" className="px-5 py-8">
        <p className="text-xs text-emerald-400 font-semibold tracking-widest uppercase mb-2">Step 4 of 4</p>
        <h2 className="text-2xl font-bold text-white mb-2">Your Nutrition Profile</h2>
        <p className="text-sm text-gray-500 mb-5">Here's your calculated targets</p>
        <div className="bg-gray-800 rounded-2xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">BMR</span><p className="text-white font-bold text-lg">{Math.round(bmr)} cal</p></div>
            <div><span className="text-gray-500">TDEE</span><p className="text-white font-bold text-lg">{tdee} cal</p></div>
            <div><span className="text-gray-500">Goal Calories</span><p className="text-emerald-400 font-bold text-lg">{goalCals} cal</p></div>
            <div><span className="text-gray-500">Goal</span><p className="text-white font-bold text-lg">{GOALS[profile.goal]?.icon} {GOALS[profile.goal]?.label}</p></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-2xl p-5 mb-6">
          <p className="text-sm text-gray-400 mb-3 font-semibold">Daily Macro Targets</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-blue-400 font-bold text-xl">{macros.protein}g</p><p className="text-xs text-gray-500">Protein</p></div>
            <div><p className="text-amber-400 font-bold text-xl">{macros.carbs}g</p><p className="text-xs text-gray-500">Carbs</p></div>
            <div><p className="text-pink-400 font-bold text-xl">{macros.fat}g</p><p className="text-xs text-gray-500">Fat</p></div>
          </div>
        </div>
        <button onClick={() => { setScreen("dashboard"); setShowCheckin(true); }} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-lg transition-all transform hover:scale-105">🚀 Generate My Meal Plan</button>
      </div>,
    ];

    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col" style={{ fontFamily: "'Outfit', sans-serif", maxWidth: 480, margin: "0 auto" }}>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {step > 0 && step < 4 && (
          <div className="px-5 pt-5">
            <div className="flex gap-1.5">
              {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-emerald-500" : "bg-gray-800"}`} />)}
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col">{steps[step]}</div>
        {step > 0 && (
          <div className="px-5 pb-5">
            <button onClick={() => setStep(s => s - 1)} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">← Back</button>
          </div>
        )}
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" style={{ fontFamily: "'Outfit', sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, <span className="text-white font-semibold">{profile.name || "Champion"}</span> 👋</p>
            <h1 className="text-xl font-bold text-white mt-0.5">Today's Nutrition</h1>
          </div>
          <button onClick={() => { setScreen("onboard"); setStep(0); }} className="p-2 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
        </div>
      </div>

      {/* Morning Check-in */}
      {showCheckin && mealPlan.length === 0 && (
        <div className="px-5 py-4">
          <div className="bg-gradient-to-br from-emerald-950 to-gray-900 rounded-2xl p-5 border border-emerald-900">
            <h3 className="text-lg font-bold text-white mb-1">☀️ What's your plan today?</h3>
            <p className="text-sm text-gray-400 mb-4">I'll build your meals around it</p>
            <div className="grid grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map(a => (
                <button key={a.id} onClick={() => handleCheckin(a.id)} className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-emerald-500 transition-all text-center">
                  <span className="text-xl block">{a.icon}</span>
                  <span className="text-xs text-gray-400 mt-1 block leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      {mealPlan.length > 0 && (
        <div className="px-5 pb-3">
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">Today's Progress</span>
              <span className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400">
                {todayActivity && ACTIVITY_TYPES.find(a => a.id === todayActivity)?.icon} {todayActivity && ACTIVITY_TYPES.find(a => a.id === todayActivity)?.label}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black text-white">{totals.cal}</p>
                <p className="text-xs text-gray-500">of {goalCals} cal target</p>
              </div>
              <div className="flex gap-4">
                <div className="relative">
                  <CircularProgress value={totals.protein} max={macros.protein} size={64} color="#60a5fa" label="Protein" />
                </div>
                <div className="relative">
                  <CircularProgress value={totals.carbs} max={macros.carbs} size={64} color="#fbbf24" label="Carbs" />
                </div>
                <div className="relative">
                  <CircularProgress value={totals.fat} max={macros.fat} size={64} color="#f472b6" label="Fat" />
                </div>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${Math.min((totals.cal / goalCals) * 100, 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Nav Tabs */}
      {mealPlan.length > 0 && (
        <div className="px-5 mb-3">
          <div className="flex gap-1 bg-gray-900 rounded-xl p-1">
            {[["meals","🍽 Meals"],["nutrients","📊 Nutrients"],["ai","🤖 AI Tip"]].map(([k,l]) => (
              <button key={k} onClick={() => { setDailyView(k); if (k === "ai" && !aiTip) fetchAiTip(); }} className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${dailyView === k ? "bg-emerald-500 text-black" : "text-gray-400 hover:text-white"}`}>{l}</button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-5 pb-24 flex-1 overflow-y-auto" ref={contentRef}>
        {mealPlan.length > 0 && dailyView === "meals" && (
          <div className="space-y-3">
            {redistributeNote && (
              <div className="p-3 rounded-xl bg-amber-950 border border-amber-800 text-amber-300 text-xs">⚠️ {redistributeNote}</div>
            )}
            {mealPlan.map((m, i) => (
              <MealCard key={i} slot={m.slot} meal={m.meal} skipped={skippedMeals.has(i)} expanded={expandedMeal === i} onToggle={() => setExpandedMeal(expandedMeal === i ? null : i)} onSwap={() => swapMeal(i)} onSkip={() => toggleSkip(i)} />
            ))}
            <button onClick={generatePlan} className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-500 hover:text-emerald-400 hover:border-emerald-800 text-sm transition-all mt-2">🔄 Regenerate entire plan</button>
          </div>
        )}

        {mealPlan.length > 0 && dailyView === "nutrients" && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Macronutrients</h3>
              {[
                { label: "Calories", value: totals.cal, max: goalCals, unit: "cal", color: "#10b981" },
                { label: "Protein", value: totals.protein, max: macros.protein, unit: "g", color: "#60a5fa" },
                { label: "Carbs", value: totals.carbs, max: macros.carbs, unit: "g", color: "#fbbf24" },
                { label: "Fat", value: totals.fat, max: macros.fat, unit: "g", color: "#f472b6" },
                { label: "Fiber", value: totals.fiber, max: 35, unit: "g", color: "#a78bfa" },
              ].map(n => (
                <div key={n.label} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{n.label}</span>
                    <span className="text-white font-medium">{Math.round(n.value)} / {n.max} {n.unit}</span>
                  </div>
                  <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((n.value / n.max) * 100, 100)}%`, backgroundColor: n.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Glow Nutrients</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Iron", value: totals.iron, max: 18, unit: "mg", icon: "🩸", benefit: "Energy & Hair" },
                  { label: "Vitamin C", value: totals.vitC, max: 90, unit: "mg", icon: "🍊", benefit: "Skin Glow" },
                  { label: "Fiber", value: totals.fiber, max: 35, unit: "g", icon: "🌾", benefit: "Gut Health" },
                ].map(n => (
                  <div key={n.label} className="bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span>{n.icon}</span>
                      <span className="text-sm text-white font-medium">{n.label}</span>
                    </div>
                    <p className="text-lg font-bold text-white">{n.value.toFixed(1)} <span className="text-xs text-gray-500">/ {n.max}{n.unit}</span></p>
                    <p className="text-xs text-emerald-400 mt-1">{n.benefit}</p>
                    <div className="h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((n.value / n.max) * 100, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {mealPlan.length > 0 && dailyView === "ai" && (
          <div className="bg-gradient-to-br from-purple-950 to-gray-900 rounded-2xl p-5 border border-purple-900">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">AI Nutrition Coach</h3>
            </div>
            {aiLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Analyzing your plan...</span>
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed">{aiTip || "Tap to get a personalized tip based on today's meal plan."}</p>
            )}
            <button onClick={fetchAiTip} className="mt-4 w-full py-2.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-300 text-sm font-medium transition-all">✨ Get new tip</button>
          </div>
        )}
      </div>

      {/* Bottom Action - Change Schedule */}
      {mealPlan.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950 to-transparent" style={{ maxWidth: 480, margin: "0 auto" }}>
          <button onClick={() => setShowCheckin(true)} className="w-full py-3 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-all flex items-center justify-center gap-2">
            <span>📅</span> Change today's plan
          </button>
        </div>
      )}

      {/* Floating check-in modal */}
      {showCheckin && mealPlan.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-50" style={{ maxWidth: 480, margin: "0 auto" }}>
          <div className="w-full bg-gray-900 rounded-t-3xl p-6 border-t border-gray-700">
            <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">Change today's plan</h3>
            <p className="text-sm text-gray-400 mb-4">What are you doing today?</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {ACTIVITY_TYPES.map(a => (
                <button key={a.id} onClick={() => handleCheckin(a.id)} className={`p-3 rounded-xl border transition-all text-center ${todayActivity === a.id ? "bg-emerald-500 text-black border-emerald-400" : "bg-gray-800 border-gray-700 hover:border-emerald-500"}`}>
                  <span className="text-xl block">{a.icon}</span>
                  <span className="text-xs mt-1 block leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Workout time</label>
                <input type="time" value={schedule.workoutTime} onChange={e => setSchedule(s => ({...s, workoutTime: e.target.value}))} className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cooking?</label>
                <div className="flex gap-1">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setSchedule(s => ({...s, canCook: v}))} className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${schedule.canCook === v ? "bg-emerald-500 text-black" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>{v ? "🍳 Yes" : "⚡ No"}</button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setShowCheckin(false)} className="w-full py-3 rounded-xl bg-gray-800 text-gray-400 text-sm mt-2">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
