
# New Body — Nutrition & Meal Planner

DEPLOYED LINK : body-goals-green.vercel.app

A frontend-only fitness web app that calculates personalised daily calorie,
macro, and water targets for losing fat while building muscle, then
generates a full Monday–Sunday meal plan (with a Saturday cheat meal) to
hit those targets — complete with real food photos.

Built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## Features

- **Nutrition calculator** — BMR (Mifflin-St Jeor), TDEE, target calories,
  and a full macro breakdown (protein / carbs / fat / fiber) based on body
  weight, height, age, gender, activity level, and chosen goal intensity
  (mild / moderate / aggressive fat-loss deficit).
- **Weekly meal plan generator** — picks a breakfast, lunch, dinner, and
  snack for every day of the week from a curated meal catalog, scales
  portion sizes so each day's totals land on target, and swaps in a cheat
  meal every Saturday.
- **Real meal photos** — pulled live from [TheMealDB](https://www.themealdb.com/api.php),
  a free, key-less recipe API, with a two-tier fallback so a photo shows up
  even when there's no exact match.
- **No backend required** — everything runs client-side. Nutrition math is
  local, meal images are fetched directly from a public API in the browser.

---

## Tech stack

| Layer | Choice |
|---|---|
| Build tool | Vite |
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (`@theme` design tokens) |
| State | React Context (`UserProfileContext`) |
| External data | [TheMealDB](https://www.themealdb.com/api.php) (images/instructions only — no auth required) |

---

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To type-check without running the dev server:

```bash
npx tsc --noEmit -p tsconfig.app.json
```

To build for production:

```bash
npm run build
```

---

## Project structure

```
src/
├── api/
│   └── mealDbClient.ts       # TheMealDB fetch logic (search + category fallback)
├── components/
│   ├── dashboard/             # CalorieSummary, MacroCard, ResultsDashboard
│   ├── forms/                 # UserProfileForm (the intake form)
│   ├── layout/                # Shared layout pieces
│   ├── mealplan/               # WeeklyMealPlan, DayTabs, MealCard, CheatMealBadge, MealPlanButton
│   └── ui/                    # Button, Spinner, ErrorMessage
├── context/
│   └── UserProfileContext.tsx # Holds the user's profile + calculated targets
├── data/
│   └── mealCatalog.ts         # 33 curated meals with macros + TheMealDB search hints
├── hooks/
│   ├── useMealDetails.ts      # Fetches + caches a meal's photo from TheMealDB
│   ├── useMealPlan.ts         # Memoised weekly meal plan generation
│   └── useNutritionTargets.ts
├── types/
│   ├── meal.ts                # MealCatalogEntry, PlannedMeal, WeeklyMealPlan, etc.
│   ├── nutrition.ts           # NutritionTargets, MacroTargets
│   └── user.ts                # UserProfile, ActivityLevel, GoalIntensity
└── utils/
    ├── calculations.ts        # BMR / TDEE / target calories / macros / water
    └── mealPlanGenerator.ts   # Selects, scales, and tops up each day's meals
```

---

## How the numbers work

1. **BMR** — Mifflin-St Jeor equation, using weight, height, age, and gender.
2. **TDEE** — BMR × an activity multiplier (sedentary → very active).
3. **Target calories** — TDEE minus a deficit based on the chosen goal
   intensity (mild ≈10%, moderate ≈17.5%, aggressive ≈25%), floored at
   `BMR × 1.1` so the app never recommends eating below resting burn.
4. **Macros** — protein and fat are set per kg of bodyweight (protein
   scales up with goal intensity, from 1.8 g/kg to 2.2 g/kg, to protect
   muscle during a bigger deficit); carbs fill whatever calories remain;
   fiber is ~14 g per 1000 kcal.
5. **Water** — 35 ml per kg bodyweight, plus an activity-level top-up.

## How the meal plan works

1. **Selection** — for each slot (breakfast/lunch/dinner/snack), the
   generator picks the catalog meal whose macros best match that slot's
   rough share of the daily target, while penalising meals already used
   earlier in the week so the plan stays varied.
2. **Scaling** — real single-serving meals rarely land exactly on a given
   target, so once a day's meals are chosen, their portions scale up or
   down together (clamped 0.6x–2x) until the day's *total* matches target —
   the same idea as adjusting servings on a recipe.
3. **Top-up** — if a target is high enough that even 2x portions can't
   reach it, the generator adds an extra snack instead of pushing any one
   portion to an unrealistic size.
4. **Saturday** — the dinner slot is swapped for a fixed-size cheat meal
   (not scaled), and the day's other meals scale down to make room for it.

## Meal photos

TheMealDB only has ~300 recipes total, so an exact name search (e.g.
searching "Rice Cakes") often finds nothing. `getMealImage()` in
`api/mealDbClient.ts` tries an exact search first, then falls back to
browsing the meal's category (Chicken, Seafood, Vegetarian, etc.) and
deterministically picking one of those recipes' photos — a real, on-theme
food photo beats a blank placeholder. Results are cached in memory so the
same meal (which can appear on multiple days) is only fetched once per
session.

---

## Known limitations

- **Macros are estimates**, not verified nutrition data — TheMealDB
  doesn't provide macros, so every meal's calorie/protein/carb/fat/fiber
  values in `data/mealCatalog.ts` are reasonable approximations, not
  lab-measured figures.
- **No persistence** — refreshing the page clears your profile and
  targets (state lives in React Context only, nothing is saved to
  `localStorage` or a backend).
- **Fallback photos aren't always the exact dish** — the category
  fallback shows a real, relevant food photo, but it may not be a photo of
  that specific meal if TheMealDB has no matching recipe by name.

## Possible next steps

- Persist the user's profile (`localStorage`) so it survives a refresh.
- Let people regenerate a single day's meals without regenerating the
  whole week.
- Add a shopping list generated from the week's selected meals.
- Swap the estimated macros for a real nutrition database if one becomes
  available with a free tier.