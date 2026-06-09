# Renova

Planning a kitchen remodel means bouncing between five different tools: a design app, a catalog, a quote estimator, a contractor directory, and your notes app. None of them talk to each other. By the time you have a real plan, you've spent weeks and you still don't know what it will cost.

Renova puts the entire workflow in one place. Enter your dimensions (or upload photos and let AI measure for you), design your cabinets, get a cost estimate, find a contractor, and export a PDF you can take to any bid meeting.

Built solo as a product + engineering project. Every feature started as a user problem, not a technical experiment.

---

## What it does

**Five-step wizard:**

1. **Planner** — Upload kitchen photos (GPT-4 Vision estimates dimensions and layout) or enter measurements manually. Answer design questions: cooking style, household size, budget range, current issues.

2. **Designer** — Choose cabinet style, color, material, and hardware. See a live 2D sketch update as you select. Pick percentage of upper vs lower cabinets.

3. **Quoter** — Linear footage + style + material → directional cost bands (low / mid / high) across cabinets, labor, and contingency. No surprises when you meet a contractor.

4. **Contractor Finder** — Match contractors by ZIP code. View ratings, badges, and price tier. Send a one-click RFQ with your scoped project attached.

5. **Review + Export** — Generate a shareable PDF with your plan, pricing, and matched contractors. Contractors receive qualified leads with full project scope, not cold calls.

---

## PM thinking behind this

The insight that drove the design: homeowners don't fail at kitchen remodels because they make bad decisions. They fail because they make decisions without information, in the wrong order, using tools that weren't designed to work together.

The product sequence mirrors how a good contractor conversation actually goes: dimensions first, then style, then realistic cost, then who to hire. Reversing that order (which most tools force) creates anxiety and bad decisions.

Three specific design choices worth noting:

**Directional pricing, not exact quotes.** Homeowners don't need a precise number from an app — they need enough confidence to have the first contractor conversation. Cost bands (low/mid/high) with clear assumptions are more honest and more useful than a false-precision estimate.

**AI as an onramp, not a dependency.** GPT-4 Vision can analyze kitchen photos to estimate dimensions and layout. But if the confidence score is below a threshold, the app drops into editable fields rather than displaying the result as authoritative. AI that admits uncertainty is more trustworthy than AI that doesn't.

**Contractor matching with scoped leads.** The Angi/Thumbtack model sends contractors unqualified leads. Renova sends contractors a homeowner with dimensions, style choices, budget range, and a detailed RFQ already filled out. Better leads for contractors = better response rates for homeowners.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Animations | Framer Motion |
| Backend | Supabase (auth, Postgres, storage) |
| AI — photo analysis | GPT-4 Vision (OpenAI API) |
| AI — design visualization | DALL-E 3 (OpenAI API) with Replicate + Stability AI fallback |
| Export | PDF generation |

---

## Local setup

```bash
git clone https://github.com/AnjanaG/Renova.git
cd Renova
npm install
cp .env.example .env
# Add Supabase and OpenAI API keys
npm run dev
```

Required environment variables:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENAI_API_KEY=
```

---

## What's next

- Real contractor data via Angi/Thumbtack API integration
- 3D cabinet visualization (Three.js upgrade from current 2D CSS sketch)
- Saved projects with auth — return to a plan across sessions
- Stripe integration for premium design consult add-on
- Contractor-side dashboard for managing RFQs and lead status

---

Built by [Anjana Gummadivalli](https://linkedin.com/in/anjanagummadivalli)
