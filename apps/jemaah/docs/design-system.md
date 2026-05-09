# SAJDA Design System

**Aesthetic**: Sacred Clarity — clean, grounded, Islamic in character without being decorative for decoration's sake.
**Theme**: Light by default, dark mode available. Both feel intentional, not like inverted colours.
**Feeling**: A well-designed Islamic reference book meets a modern mobile app. Dignified. Readable. Calm.

---

## Typography

```
font-cormorant   → Cormorant Garamond — headings, display, pull quotes
font-jakarta     → Plus Jakarta Sans — body text, UI labels, buttons
font-amiri       → Amiri — ALL Arabic text, no exceptions
```

### Usage Rules
| Element | Font | Weight | Size (mobile) | Size (desktop) |
|---------|------|--------|---------------|----------------|
| Page title / Hero | Cormorant | 600 | 28px | 36px |
| Section heading | Cormorant | 500 | 20px | 24px |
| Card title | Jakarta | 600 | 15px | 16px |
| Body text | Jakarta | 400 | 14px | 15px |
| Caption / meta | Jakarta | 400 | 11px | 12px |
| Button label | Jakarta | 600 | 14px | 14px |
| Arabic large | Amiri | 400 | 24px | 32px |
| Arabic inline | Amiri | 400 | 17px | 20px |

**Rules**:
- NEVER use Inter, Roboto, Arial, system-ui, or Space Grotesk
- Arabic text always: `dir="rtl"` + `text-right` + `leading-loose`
- Cormorant for anything that should feel sacred or literary
- Jakarta for anything functional and readable

---

## Colour System

All colours are CSS variables. Never hardcode hex values in components.

### Light Theme (default)
```css
:root {
  /* Surfaces */
  --surface:          #F7F5F0;   /* warm off-white base */
  --surface-raised:   #FFFFFF;   /* cards */
  --surface-overlay:  #F0EDE6;   /* subtle elevated panels */
  --surface-input:    #F0EDE6;   /* form inputs */
  --surface-sidebar:  #1C2B22;   /* desktop sidebar — always dark */

  /* Brand */
  --primary:          #1E6B45;   /* deep islamic green */
  --primary-hover:    #165435;   /* darker green on hover */
  --primary-muted:    rgba(30,107,69,0.10);  /* green tint bg */
  --gold:             #B8860B;   /* refined dark gold */
  --gold-light:       #D4A017;   /* lighter gold for accents */
  --gold-muted:       rgba(184,134,11,0.12); /* gold tint bg */

  /* Text */
  --text-primary:     #1A1A1A;   /* near black */
  --text-secondary:   #6B6B6B;   /* muted grey */
  --text-disabled:    #ADADAD;   /* inactive */
  --text-inverse:     #F7F5F0;   /* text on dark bg (sidebar) */
  --text-arabic:      #8B6914;   /* gold-toned for Arabic */

  /* Borders */
  --border:           rgba(0,0,0,0.08);
  --border-strong:    rgba(0,0,0,0.15);
  --border-gold:      rgba(184,134,11,0.20);

  /* Semantic */
  --success:          #1E6B45;
  --warning:          #B8860B;
  --error:            #C0392B;
  --info:             #2B6CB0;

  /* Effects */
  --shadow-sm:        0 1px 3px rgba(0,0,0,0.08);
  --shadow-md:        0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg:        0 8px 24px rgba(0,0,0,0.12);
  --shadow-gold:      0 4px 16px rgba(184,134,11,0.15);
}
```

### Dark Theme
```css
[data-theme="dark"] {
  /* Surfaces */
  --surface:          #0F1410;   /* deep forest black */
  --surface-raised:   #182118;   /* card surfaces */
  --surface-overlay:  #1F2B1F;   /* elevated panels */
  --surface-input:    #162016;   /* form inputs */
  --surface-sidebar:  #0A0F0A;   /* sidebar even darker */

  /* Brand */
  --primary:          #4CAF7D;   /* lighter green for dark bg */
  --primary-hover:    #5DC98E;
  --primary-muted:    rgba(76,175,125,0.12);
  --gold:             #C9A84C;   /* gold brighter on dark */
  --gold-light:       #E0C068;
  --gold-muted:       rgba(201,168,76,0.12);

  /* Text */
  --text-primary:     #EAE8E0;
  --text-secondary:   #8A9485;
  --text-disabled:    #4A5245;
  --text-inverse:     #EAE8E0;
  --text-arabic:      #C9A84C;

  /* Borders */
  --border:           rgba(255,255,255,0.07);
  --border-strong:    rgba(255,255,255,0.12);
  --border-gold:      rgba(201,168,76,0.20);

  /* Effects */
  --shadow-sm:        0 1px 3px rgba(0,0,0,0.30);
  --shadow-md:        0 4px 12px rgba(0,0,0,0.40);
  --shadow-lg:        0 8px 24px rgba(0,0,0,0.50);
  --shadow-gold:      0 4px 16px rgba(201,168,76,0.15);
}
```

> **Note**: `--surface-sidebar` stays dark in both themes. The desktop sidebar is always dark green (`#1C2B22` light / `#0A0F0A` dark).

---

## Spacing Scale

Page padding: `16px` mobile, `24px` desktop content area
```
4px   → gap-1
8px   → gap-2
12px  → gap-3
16px  → gap-4   ← default card padding
20px  → gap-5
24px  → gap-6
32px  → gap-8
48px  → gap-12
64px  → gap-16
```

---

## Border Radius
```
4px   → rounded     (tags, badges)
8px   → rounded-lg  (inputs, small elements)
12px  → rounded-xl  (standard cards)
16px  → rounded-2xl (featured cards, sheets)
24px  → rounded-3xl (pill buttons)
9999px → rounded-full (avatars, FAB, icon circles)
```

---

## Component Patterns

### Cards — Light
```tsx
// Standard
<div className="bg-[--surface-raised] border border-[--border] 
                rounded-2xl p-4 shadow-[--shadow-sm]">

// Gold featured
<div className="bg-[--surface-raised] border border-[--border-gold] 
                rounded-2xl p-4 shadow-[--shadow-gold]">
```

### Cards — Dark (same classes, CSS vars handle it)
CSS variables automatically switch — no separate dark: classes needed for colours.

### Buttons
```tsx
// Primary — green
<button className="bg-[--primary] text-white font-jakarta font-semibold 
                   text-sm py-3.5 px-6 rounded-3xl 
                   hover:bg-[--primary-hover] transition-colors">

// Secondary — ghost
<button className="border border-[--border-strong] text-[--text-primary] 
                   font-jakarta font-medium text-sm py-3.5 px-6 rounded-3xl">

// Gold accent
<button className="bg-[--gold] text-white font-jakarta font-semibold 
                   text-sm py-3 px-5 rounded-2xl">

// Icon pill (quick action grid)
<button className="flex flex-col items-center gap-2 
                   bg-[--surface-raised] border border-[--border] 
                   rounded-2xl p-3 min-w-[72px] min-h-[72px]">
```

### FAB
```tsx
<button className="fixed bottom-24 right-4 w-14 h-14 
                   bg-[--primary] text-white rounded-full 
                   shadow-[--shadow-lg] flex items-center justify-center z-50
                   md:hidden"> {/* FAB mobile only */}
```

### Input Fields
```tsx
<input className="w-full bg-[--surface-input] border border-[--border] 
                  rounded-xl px-4 py-3 text-[--text-primary] text-sm
                  font-jakarta placeholder:text-[--text-disabled]
                  focus:outline-none focus:border-[--primary]">
```

### Section Header
```tsx
<div className="flex items-center justify-between mb-3">
  <h2 className="font-cormorant text-xl font-semibold text-[--text-primary]">
    Section Title
  </h2>
  <button className="text-[--primary] text-sm font-jakarta font-medium">
    Lihat Semua
  </button>
</div>
```

### Arabic Text Block
```tsx
// Large — standalone verse/hadith
<p className="font-amiri text-2xl text-[--text-arabic] text-right 
              leading-loose tracking-wide" dir="rtl">
  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
</p>

// Inline mention
<span className="font-amiri text-lg text-[--text-arabic]" dir="rtl">
  Arabic
</span>
```

### Horizontal Scroll Section (mobile)
```tsx
<div className="flex gap-3 overflow-x-auto scrollbar-none 
                -mx-4 px-4 scroll-px-4 snap-x snap-mandatory">
  <div className="snap-start shrink-0 w-[75vw] max-w-[280px]">
    {/* card */}
  </div>
  {/* Last item needs extra right padding so peek works */}
  <div className="shrink-0 w-4" />
</div>
```

### Progress Ring (Ibadah Hub)
```tsx
// SVG circle ring
// Stroke: --gold active, --border track
// Animate strokeDashoffset with Framer Motion on mount
// Center text: count + "selesai"
```

---

## Animation Patterns (Framer Motion)

### Page Entry — staggered
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 }
  }
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 500, damping: 35 } }
}
```

### Button / Tap
```tsx
<motion.button whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.02 }}>
```

### Card Hover (desktop only)
```tsx
<motion.div whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}>
```

### Checklist Check
```tsx
// On check: icon scale 1 → 1.3 → 1, colour flash to --success
```

### Theme Toggle
```tsx
// Smooth: opacity fade + slight scale on icon swap
```

---

## Background Treatments

### Light Theme
- Base: `--surface` (#F7F5F0) — warm white, not pure white
- Cards float on top with white + shadow
- No heavy gradients or textures on content pages
- Subtle top gradient on Utama: `linear-gradient(to bottom, rgba(30,107,69,0.04), transparent)`
- Prayer banner: green gradient `#1E6B45 → #165435`

### Dark Theme  
- Base: `--surface` (#0F1410) — very dark forest green-black
- Cards with `--surface-raised` + subtle border
- Utama: soft green glow orb top-right (blurred radial, 8% opacity)
- Prayer banner: darker green + gold border

---

## Icons
- Library: **Lucide React** (primary)
- Size: 18px (inline), 20px (nav), 24px (featured actions)
- Colour: `text-[--text-secondary]` default, `text-[--primary]` active, `text-[--gold]` highlight
- Arabic/Islamic decorative: custom SVG (crescent, mosque silhouette) — used sparingly as section markers only