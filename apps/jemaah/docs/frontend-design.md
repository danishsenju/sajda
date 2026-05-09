# Frontend Design Philosophy

Read and apply this file before generating any UI for SAJDA.

---

## Design Thinking Process

Before writing any code, commit to these answers:

### 1. Purpose
SAJDA serves Malaysian Muslims in their daily ibadah and community life. Every screen is used during sacred moments — before prayer, during Ramadan, at the mosque. The UI must honour that.

### 2. Tone — Sacred Clarity
Not dark and moody. Not brutally minimal. Not corporate SaaS.

**Sacred Clarity**: Clean and grounded like a well-designed Islamic reference book. Dignified typography. Breathing room. Gold used as a highlight, not decoration. Green as the identity colour — unmistakably Islamic without being kitsch.

Light theme is the default because:
- Most ibadah tools are used in daylight
- Light feels more open, readable, trustworthy
- Dark mode is available for night use

### 3. Constraints
- PWA — performance matters, no heavy effects on scroll
- Mobile-first but desktop is a different layout, not just wider
- Framer Motion available — use for purposeful animation only
- Arabic text must always render beautifully — Amiri font, proper RTL
- Accessibility: min 44px tap targets, sufficient contrast in both themes

### 4. What Makes SAJDA Unforgettable
The feeling that this was made specifically for Malaysian Muslims — not adapted from a generic app template. The Arabic renders beautifully. The prayer countdown feels ceremonial. The green and gold palette feels right without trying too hard.

---

## Aesthetic Rules

### Typography
- **Cormorant Garamond** for anything sacred, literary, or important: page titles, hadith translations, tazkirah quotes, prayer names
- **Plus Jakarta Sans** for everything functional: body text, buttons, labels, inputs, meta
- **Amiri** for all Arabic — no other font ever touches Arabic text
- Never use: Inter, Roboto, Arial, system-ui, Space Grotesk, Nunito, Poppins

### Colour
- Follow design-system.md CSS variables exactly
- Light theme base: warm off-white (#F7F5F0), not pure white
- Dark theme base: deep forest black-green (#0F1410), not pure black
- Green (#1E6B45 light / #4CAF7D dark) is the primary action colour
- Gold is the prestige accent — use sparingly, hits harder when rare
- Never purple (old theme was purple — avoid completely)
- Sidebar is always dark green regardless of theme

### Motion
Use Framer Motion. Keep it purposeful:
- **Page entry**: staggered child reveals (staggerChildren: 0.07)
- **Tap**: spring scale whileTap (scale: 0.94)
- **Checklist**: satisfying check animation (scale flash + colour)
- **Prayer countdown**: smooth digit transition
- **Theme toggle**: icon fade/scale swap
- **Avoid**: spinning loaders on everything, parallax, motion that delays content

### Layout
- Mobile: single column, generous padding, card stacks
- Desktop: multi-column, information dense, sidebar navigation
- Cards: rounded-2xl, white surface, subtle shadow — float above warm background
- Section headers: Cormorant heading left, "Lihat Semua" link right
- Breathing room: don't pack everything — let the content breathe
- Horizontal scroll only on mobile — desktop replaces with grids

### Backgrounds
**Light theme**:
- Base surface: #F7F5F0 (warm, not cold)
- Prayer banner: solid deep green gradient
- Cards: pure white floating on warm base
- No heavy textures or grain

**Dark theme**:
- Base: deep forest (#0F1410)
- Subtle green ambient glow on Utama (radial, 6% opacity)
- Cards: slightly lighter dark surface with border

---

## Patterns to AVOID Completely
- Purple anything (this was the old SAJDA — it's gone)
- Pure white (#FFFFFF) as the page background
- Generic blue as primary colour
- Flat grey cards with no elevation
- Inter or system-ui font for any visible text
- Horizontal scroll on desktop
- FAB on desktop (use panel/sidebar forms instead)
- Cookie-cutter bottom nav with circle active indicator
- Emoji icons in navigation
- Gradient text (overused AI aesthetic)
- Neumorphism (too soft, low contrast)

## Patterns to Embrace
- Cormorant for anything that should feel dignified
- Gold sparingly — a gold border on one card makes it feel special
- Arabic text that actually looks beautiful and intentional
- Prayer times that feel ceremonial, not like a bus schedule
- Progress that motivates without gamifying (rings, not progress bars)
- Cards that float (white on warm background)
- Desktop layouts that take advantage of the space (multi-column, rich)
- Framer Motion animations that feel natural, not performative

---

## When in Doubt
Ask: would a thoughtful Malaysian Muslim feel respected using this interface?
If the answer is yes — ship it.
If it feels like a generic app with Islamic content dropped in — redesign it.