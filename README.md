
 Renova

Renova is a one-stop web app for homeowners to plan, design, quote, and hire for kitchen remodels. It combines layout planning, cabinet visualization, cost estimation, and contractor matching into a single, seamless workflow.
It sits between Houzz (inspiration), IKEA/Home Depot (catalogs), and Angi (contractors), but unifies the workflow.

Primary User: Homeowners of older homes (30+ years) planning a remodel.
Secondary User: Contractors/designers who want inbound leads with scoped projects.

Segmentation attributes:
Demographic: 30–55 y/o homeowners, mid–upper income, often first or second home purchase.
Psychographic: Frustrated with fragmented remodel process, value transparency and time, speed and quality control.
Behavioral: Research-heavy, spend weeks hopping between complex IKEA and other planners, Home Depot quotes, and Angi contractor calls.
Needs: Clear budget upfront, confidence in choices, simplified contractor discovery.
Buyer vs User: Buyer = Homeowner; User = Homeowner doing planning + Contractor responding to leads.


Customer Problems to be Solved
“I don’t know where to start. Designing my kitchen feels overwhelming.”
“Every tool does one thing: design OR price OR contractor. I need all-in-one.” - Easy to generate a design, transparent pricing, and easy trusted contractor contacts 
“I can’t get a real sense of what cabinets will cost me until too late.”
“Finding a trustworthy installer is painful—endless calls and vague quotes.”


Product Requirements / Functionality
Planner: Input room dimensions, layout type, ceiling height; auto-estimate linear footage.
Designer: Pick cabinet style, material, hardware, % uppers; show quick sketch preview.
Quoter: Translate LF + style + material → directional price bands (cabinet + labor + contingency).
Contractor Finder: Match by ZIP, show ratings/badges, one-click RFQ request.
Export: Generate sharable PDF with plan, pricing, and contractors.
Save Projects: User can log in and save progress; contractors can view RFQs.

Guidance on User Experience
Desired UX: Smooth, playful, confidence-building. Feels less like an enterprise tool, more like Canva meets Zillow.


Critical tasks / flows:
Enter room dimensions → see LF estimate.
Choose style/material → see design sketch + live price update.
Compare costs (low/med/high) → understand budget range.
Enter ZIP → match contractors → send RFQ.

Visual design aesthetic: Clean, modern, airy. Rounded cards, soft shadows, pastel gradients. “Home improvement shouldn’t feel stressful; it should feel inspiring.”

Data Model (MVP)
User: id, name, email, zip, saved projects.
Project: id, user_id, room_dims, layout, style, material, hardware, LF, notes.
Estimate: project_id, subtotal_cabinets, subtotal_labor, contingency, total.
Contractor: id, name, zips_served, rating, badges, jobs, price_tier.
RFQ: id, project_id, contractor_id, status, messages.

Guidance on Tech Stack / Components to Use
Frontend: React + Vite, TailwindCSS, shadcn/ui for components, Framer Motion for micro-interactions.
Visualization: Simple 2D with CSS/Framer (MVP), upgrade to Three.js for 3D later.
Backend: Supabase (auth, Postgres DB, storage).
Integrations: Angi / Thumbtack / Houzz APIs for contractor data. Stripe for payment flows later.

Other Important Info
Business model (future): Lead-gen marketplace (contractors pay per qualified RFQ). Upsell to premium homeowners with pro design consult add-ons.
Scope discipline: Stay directional. It’s a vibe-coded planner, not AutoCAD. The magic is the all-in-one flow, not millimeter-perfect design.

MVP Goal: Deliver confidence + transparency to homeowners, and qualified leads to contractors.


