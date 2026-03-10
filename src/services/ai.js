/**
 * ai.js — Multi-provider AI service with auto-fallback.
 *
 * Provider chain (tried in order):
 *   1. Google Gemini 2.5 Flash  (format: google)
 *   2. Groq — Llama 3.3 70B    (format: openai)
 *   3. OpenRouter free models   (format: openai)
 *   4. Local hardcoded tips     (never fails)
 *
 * App NEVER crashes — all errors are caught and the chain continues.
 */

// ── Provider registry ─────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    name: 'gemini',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    format: 'google',
    apiKey: () => import.meta.env.VITE_GEMINI_API_KEY,
  },
  {
    name: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    format: 'openai',
    apiKey: () => import.meta.env.VITE_GROQ_API_KEY,
  },
  {
    name: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    format: 'openai',
    apiKey: () => import.meta.env.VITE_OPENROUTER_API_KEY,
  },
]

// ── Core request helpers ──────────────────────────────────────────────────────

/**
 * Calls a single provider.
 * Returns { text: string, provider: string } on success.
 * Throws on any failure (HTTP error, missing key, parse error).
 */
async function callProvider(provider, systemPrompt, userPrompt) {
  const key = provider.apiKey()
  if (!key) throw new Error(`No API key for ${provider.name}`)

  let url = provider.endpoint
  let headers = { 'Content-Type': 'application/json' }
  let body

  if (provider.format === 'google') {
    // Google Gemini format — key goes in the query string
    url = `${provider.endpoint}?key=${encodeURIComponent(key)}`
    body = JSON.stringify({
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    })
  } else {
    // OpenAI-compatible format (Groq, OpenRouter)
    headers['Authorization'] = `Bearer ${key}`
    if (provider.name === 'openrouter') {
      headers['HTTP-Referer'] = 'https://nutrifit.app'
    }
    body = JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
    })
  }

  const res = await fetch(url, { method: 'POST', headers, body })

  if (!res.ok) {
    const errText = await res.text().catch(() => res.status)
    throw new Error(`${provider.name} HTTP ${res.status}: ${errText}`)
  }

  const data = await res.json()

  // Extract text depending on format
  let text
  if (provider.format === 'google') {
    text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  } else {
    text = data?.choices?.[0]?.message?.content
  }

  if (!text) throw new Error(`${provider.name} returned empty response`)

  return { text: text.trim(), provider: provider.name }
}

/**
 * Tries each provider in order; returns first success.
 * Falls back to local tip if all fail.
 *
 * @returns {{ text: string, provider: string }}
 */
export async function askAI(systemPrompt, userPrompt) {
  for (const provider of PROVIDERS) {
    try {
      const result = await callProvider(provider, systemPrompt, userPrompt)
      return result
    } catch {
      // Silently try next provider
      continue
    }
  }
  // All providers failed — return local tip
  return { text: getLocalFallbackTip(), provider: 'local' }
}

// ── High-level feature functions ──────────────────────────────────────────────

/**
 * Builds the system prompt from the user's live nutrition context.
 */
function buildSystemPrompt({ proteinTarget, currentProtein, remainingMeals, diet, goal }) {
  const goalLabel = {
    muscle_gain: 'Muscle Gain',
    fat_loss:    'Fat Loss',
    maintain:    'Maintenance',
    recomp:      'Body Recomposition',
  }[goal] ?? goal ?? 'Fitness'

  const dietLabel = {
    nonveg:      'Non-Vegetarian',
    veg:         'Vegetarian',
    vegan:       'Vegan',
    eggetarian:  'Eggetarian',
  }[diet] ?? diet ?? 'Balanced'

  return (
    `You are NutriFit AI — a warm, friendly Indian fitness nutritionist. ` +
    `The user wants ${proteinTarget}g protein today. They've consumed ${currentProtein}g so far. ` +
    `${remainingMeals} meals remaining. Diet: ${dietLabel}. Goal: ${goalLabel}. ` +
    `Give ONE specific, actionable tip (2-3 sentences) about hitting their protein target using Indian foods. ` +
    `Mention exact food names and protein amounts. Be motivational. No markdown.`
  )
}

/**
 * Returns a daily protein-focused AI tip.
 *
 * @param {object} profile     - { proteinTarget, diet, goal }
 * @param {object} mealPlan    - { slots, skippedTypes }
 * @param {object} totals      - { protein }
 * @returns {Promise<{ text: string, provider: string }>}
 */
export async function getProteinTip(profile, mealPlan, totals) {
  const proteinTarget  = profile?.proteinTarget ?? 80
  const currentProtein = totals?.protein ?? 0
  const diet           = profile?.diet ?? ''
  const goal           = profile?.goal ?? ''

  const activeSlots = (mealPlan?.slots ?? []).filter(
    (s) => !(mealPlan?.skippedTypes ?? []).includes(s.type)
  )
  const remainingMeals = activeSlots.filter(
    (s) => !s.meal || s.meal.protein === 0
  ).length || Math.max(0, activeSlots.length - 1)

  const systemPrompt = buildSystemPrompt({
    proteinTarget,
    currentProtein,
    remainingMeals,
    diet,
    goal,
  })

  const userPrompt = `My protein status: ${currentProtein}g eaten out of ${proteinTarget}g target. Give me one actionable tip.`

  return askAI(systemPrompt, userPrompt)
}

/**
 * Returns 3 AI-suggested meals for the given query.
 *
 * @param {string} query
 * @param {number} proteinNeeded
 * @param {string} diet
 * @returns {Promise<{ text: string, provider: string }>}
 */
export async function getAiMealSuggestion(query, proteinNeeded, diet) {
  const dietLabel = {
    nonveg:     'Non-Vegetarian',
    veg:        'Vegetarian',
    vegan:      'Vegan',
    eggetarian: 'Eggetarian',
  }[diet] ?? 'Balanced'

  const systemPrompt =
    `You are NutriFit AI — an Indian fitness nutritionist. ` +
    `Suggest exactly 3 Indian ${dietLabel} meals or snacks that provide roughly ${proteinNeeded}g protein. ` +
    `For each, give: name, approximate protein amount, and one-line preparation tip. No markdown.`

  const userPrompt = query || `Suggest 3 high-protein ${dietLabel} Indian meals with ~${proteinNeeded}g protein.`

  return askAI(systemPrompt, userPrompt)
}

// ── Local fallback tips ───────────────────────────────────────────────────────

const LOCAL_TIPS = [
  "Add 100g paneer to your next meal for an easy 18g protein boost — stir-fry it with capsicum for a quick sabzi!",
  "Moong dal chilla (3 pieces) gives you about 15g protein and takes only 10 minutes to make — perfect for a high-protein breakfast.",
  "A cup of Greek yogurt (curd hung for 30 min) has 10g protein — pair it with some roasted chana for a 17g protein snack.",
  "Boil 2 eggs and eat with whole wheat bread for 12g of complete protein — great for a quick post-workout refuel.",
  "Rajma or chhole (1 cup cooked) packs 15g protein. Add it to rice or roti to build a complete meal.",
  "Sattu (roasted gram flour) is underrated — 2 tablespoons in water or lassi gives you 7g protein in under a minute.",
  "Soya chunks (50g dry) soaked and stir-fried deliver 25g protein — a vegetarian powerhouse for muscle gain.",
  "Low-fat cottage cheese (paneer) has 3.5g protein per 30g. Snack on 100g cubes with black salt and chaat masala for 11g protein.",
  "A glass of skimmed milk (250ml) provides 8g protein. Blend with banana and a teaspoon of peanut butter for 13g total.",
  "Sprouted moong (1 cup) gives 7g protein raw and is packed with enzymes. Add lemon, salt, and chili for a quick high-protein snack.",
]

/**
 * Returns a random hardcoded protein tip.
 * @returns {string}
 */
export function getLocalFallbackTip() {
  return LOCAL_TIPS[Math.floor(Math.random() * LOCAL_TIPS.length)]
}
