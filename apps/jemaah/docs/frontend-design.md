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

## Premium, Exclusive & Native Feel — Non-Negotiable

**This app must feel like it costs RM50/month to use.**
Reference aesthetic: Notion's calm precision + Halide's tactile depth + a well-designed Islamic reference app.
If a screen looks like it was built with a free UI kit — redesign it.

---

### Native Mobile Rules (apply to every mobile screen)

**Tap states must feel physical:**
- Every tappable element: `whileTap={{ scale: 0.96 }}` minimum
- Buttons: scale down + slight opacity drop on press
- Cards: scale 0.98 on tap, spring back immediately
- Never flat colour-change only — must have physical dimension

**Lists over cards where possible:**
- Settings, prayer times, checklist items → full-bleed rows with hairline dividers
- Hairline divider: `border-b border-[--border]` (0.5–1px, never thicker)
- Cards are for featured content only — not for every list item
- Inset dividers (start after icon/avatar) feel more native than full-width

**Typography contrast must be dramatic:**
- Hero text vs body text: at least 2x size difference
- Page titles: 28–32px Cormorant, bold
- Meta/caption: 11–12px Jakarta, muted
- Never all the same size — hierarchy is felt before it is read

**Spacing must breathe:**
- Section gaps: minimum 32px (gap-8)
- Don't stack cards edge-to-edge — give them room
- Empty space is not wasted space — it signals premium

**Bottom sheets, not modals:**
- All overlays on mobile slide up from bottom
- Rounded top corners (rounded-t-3xl), drag handle at top
- Never centered modal dialogs on mobile — feels like a website

**No websitey shadows:**
- Avoid `box-shadow: 0 4px 12px rgba(0,0,0,0.15)` — looks like Bootstrap
- Use instead: `backdrop-blur` + subtle border + slight background difference
- If shadow is needed: extremely subtle, warm-tinted, low spread

**Every interaction has feedback:**
- Checklist tap → scale flash + colour change + subtle haptic-like spring
- Aamiin button → count increments with spring animation
- Theme toggle → icon morphs, not just swaps
- Pull to refresh → custom Islamic-themed indicator (crescent or geometric)

---

### Premium Visual Rules (apply to every screen)

**Gold rule — one per screen:**
- Maximum ONE gold element per screen
- Gold on the prayer banner OR a card border OR an icon — never all three
- When gold appears once, it commands attention. When everywhere, it's noise.

**Every screen has one hero moment:**
- One element that stops the eye immediately
- Utama: the prayer banner countdown
- Ibadah: the progress ring
- Hadis: the Arabic text
- Tasbih: the giant counter number
- Design everything else around that hero — support it, don't compete

**Designed empty states — never placeholder text:**
```
❌ "Tiada pengumuman"
✅ Subtle Islamic geometric illustration + 
   "Masjid anda belum ada pengumuman" in Cormorant +
   "Ikuti masjid untuk melihat kemas kini" in Jakarta muted
```

**Skeleton screens, not spinners:**
- All loading states use skeleton screens (animated shimmer)
- Spinner only acceptable for button loading state (inline, small)
- Skeleton must match the exact layout of the loaded content

**Errors are calm, not alarming:**
```
❌ Red box: "Error: Failed to fetch prayer times"
✅ Soft inline message with retry: 
   "Tidak dapat memuatkan waktu solat. Cuba semula →"
```

**Micro-details that signal craft:**
- Hijri date always shown alongside Masihi date
- Prayer names in Arabic alongside Malay (e.g. "الفجر · Subuh")
- Numbers use tabular figures (font-variant-numeric: tabular-nums)
- Time displays: use 12h format with am/pm in small caps
- Streak counts: animate number change, don't just swap

---

### The Exclusivity Test

Before finishing any screen, ask these questions:

1. **Would someone screenshot this to show a friend?** If no — add more craft.
2. **Does it feel like a RM0 free app or a RM50 premium app?** If free — elevate it.
3. **Is there one moment on this screen that is genuinely beautiful?** If no — find it and build it.
4. **Does the Arabic text look like it belongs, or like it was added last minute?** If last minute — redesign its placement.
5. **Do tap interactions feel satisfying?** If no — add spring physics.

---

## When in Doubt
Ask: would a thoughtful Malaysian Muslim feel respected using this interface?
If the answer is yes — ship it.
If it feels like a generic app with Islamic content dropped in — redesign it.