# SAJDA Responsive Spec

## Critical Rule

**Mobile and Desktop are COMPLETELY DIFFERENT layouts — not just wider versions of each other.**

- Mobile (`< 768px`): Native app experience. Bottom nav. Card stacks. Swipe interactions.
- Desktop (`≥ 768px`): Dashboard experience. Fixed sidebar. Multi-column. More information density.

Always ask: "How would this feel as a native iOS app?" for mobile. "How would this feel as a web dashboard?" for desktop.

---

## Breakpoints

```
mobile:   < 768px   (default — design this first)
desktop:  ≥ 768px   (md: prefix in Tailwind)
```

No tablet-specific breakpoint needed. `md:` handles the switch.

---

## Shell Structure

### Mobile Shell

```
┌─────────────────────┐
│   [Page Content]    │  ← scrollable, pb-24
│                     │
│                     │
│                     │
│                     │
├─────────────────────┤
│  Utama·Masjid·      │  ← BottomNav fixed, h-16, backdrop-blur
│  Ibadah·Doa·Profil  │
└─────────────────────┘
```

- No top header on HomeShell (Utama)
- AppShell: top bar with back button + page title + optional action icon
- Top bar: `h-14`, `bg-[--surface]/80 backdrop-blur-md`, sticky

### Desktop Shell

```
┌──────────┬──────────────────────────────┐
│          │  [Top Bar — optional]        │
│ Sidebar  │                              │
│  (fixed) │  [Page Content]             │
│  240px   │  max-w-5xl mx-auto          │
│          │  two or three columns        │
│  always  │                              │
│  dark    │                              │
│  green   │                              │
└──────────┴──────────────────────────────┘
```

- Sidebar: fixed left, `w-60`, always dark (`bg-[--surface-sidebar]`)
- Content area: `ml-60`, has its own scroll
- No BottomNav on desktop — `hidden md:hidden`
- No mobile top bar on desktop — sidebar handles navigation

---

## Desktop Sidebar

```
┌──────────────┐
│  SAJDA  logo │  ← logo + wordmark
│              │
│  🕌 Utama    │
│  🕌 Masjid   │  ← nav items with icon + label
│  📿 Ibadah   │     active: green bg pill
│  🤲 Doa      │     inactive: muted text
│  👤 Profil   │
│              │
│  ──────────  │
│              │
│  [Komuniti]  │  ← secondary nav
│  [Settings]  │
│              │
│  ──────────  │
│              │
│  [Avatar]    │  ← user profile at bottom
│  Nama user   │
│  Masjid name │
└──────────────┘
```

Sidebar nav item:

```tsx
// Active
<div className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                bg-[--primary]/20 text-[--primary]">

// Inactive
<div className="flex items-center gap-3 px-4 py-2.5 rounded-xl
                text-white/60 hover:text-white hover:bg-white/5">
```

---

## Page-by-Page Responsive Layouts

### `/` — Utama

**Mobile**:

```
[Greeting + Avatar]          ← row, space-between
[Prayer Banner]              ← full width card, tall, hero
[Mosque Feed]                ← horizontal scroll cards
[Quick Actions 4×2 grid]     ← 4 columns, icon pills
[Tazkirah Card]              ← full width
[Quran Continue]             ← compact row card
```

**Desktop**:

```
┌─────────────────────┬──────────────────┐
│ Prayer Banner       │ Quick Actions    │
│ (hero, large)       │ (2×4 grid)       │
│                     │                  │
├─────────────────────┤ Quran Continue   │
│ Mosque Feed         │ ──────────────── │
│ (2-col grid)        │ Tazkirah Card    │
│                     │                  │
└─────────────────────┴──────────────────┘
```

- Two-column layout: main (2/3) + sidebar (1/3)
- Mosque feed becomes a 2-col card grid (not horizontal scroll)
- Quick actions sidebar-mounted

---

### `/masjid` — Masjid Discovery

**Mobile**:

```
[Search bar]
[Tab: Berdekatan · Diikuti · Semua]
[Mosque cards — vertical list]
```

**Desktop**:

```
┌──────────────────────────────────────────┐
│ [Search bar]        [Tab filters]        │
├──────────────┬───────────────────────────┤
│ Mosque list  │  Map view (optional)       │
│ (left col)   │  or mosque detail panel   │
└──────────────┴───────────────────────────┘
```

- Desktop: list on left, detail panel slides in on right when mosque tapped
- No page navigation needed — panel approach

---

### `/masjid/[mosqueId]` — Profil Masjid

**Mobile**:

```
[Photo banner — full width]
[Mosque name overlay]
[Follow button]
[Tab bar: Pengumuman · Doa · Janaiz · Program · Jadual]
[Tab content — vertical scroll]
```

**Desktop**:

```
┌─────────────────────────────────────────┐
│ [Photo banner — full width, shorter]    │
│ [Name + Follow button overlay]          │
├─────────────┬───────────────────────────┤
│ Tab sidebar │ Tab content               │
│ (vertical   │ (2-col grid for           │
│  tabs left) │  announcements/programs)  │
└─────────────┴───────────────────────────┘
```

---

### `/ibadah` — Ibadah Hub

**Mobile**:

```
[Progress Ring — centered, large]
[Next Prayer card]
[Tool Grid — 2×4]
```

**Desktop**:

```
┌──────────────────┬──────────────────────┐
│ Progress Ring    │ Tool Grid (2×4)       │
│ + stats below    │                       │
│                  │                       │
├──────────────────┤                       │
│ Next Prayer      │                       │
│ + full schedule  │                       │
└──────────────────┴──────────────────────┘
```

- Desktop: ring + prayer schedule left, tool grid right
- Prayer schedule shows all 5 times on desktop (not just next)

---

### `/ibadah/checklist` — Senarai Semak

**Mobile**:

```
[Streak + Points bar]
[Category tabs: Wajib · Sunnah · Akhlaq]
[Checklist items — full width]
```

**Desktop**:

```
┌────────────────┬────────────────┬────────────────┐
│ Wajib          │ Sunnah         │ Akhlaq         │
│ (column)       │ (column)       │ (column)       │
│                │                │                │
│ checklist      │ checklist      │ checklist      │
│ items          │ items          │ items          │
└────────────────┴────────────────┴────────────────┘
```

- Desktop: all 3 categories side-by-side in 3 columns
- No tab switching needed — see everything at once

---

### `/ibadah/quran` — Al-Quran

**Mobile**:

```
[Top bar: Surah name + Page num + Bookmark]
[Page — full screen, swipe L/R]
[Bottom: Prev · page input · Next]
```

**Desktop**:

```
┌────────────────┬─────────────────────────┐
│ Surah index    │ Quran page (centered)   │
│ (left panel,   │ max-w-2xl               │
│  collapsible)  │                         │
│                │ [Prev]   [X/604]  [Next]│
└────────────────┴─────────────────────────┘
```

- Desktop: surah list panel on left, page display right
- Page max-width constrained for readability

---

### `/ibadah/solat` — Waktu Solat

**Mobile**:

```
[Zone badge]
[Prayer list — 5 rows, full width]
[Streak counter]
```

**Desktop**:

```
┌──────────────────────┬──────────────────┐
│ Prayer times (table) │ Streak card      │
│ Full week calendar   │ Monthly calendar │
│ view                 │ of completed days│
└──────────────────────┴──────────────────┘
```

- Desktop: richer data — show weekly prayer times + monthly streak heatmap

---

### `/ibadah/tasbih` — Tasbih & Zikir

**Mobile**:

```
[Zikir text — Arabic + Malay]
[Large counter number]
[Giant tap button — 80% screen width]
[Zikir selector at bottom]
```

**Desktop**:

```
[Same layout but centered, max-w-md]
[Keyboard shortcut: Space bar to count]
```

- Desktop: centered single-column, constrained width
- Add keyboard shortcut hint

---

### `/doa` — Doa Bersama

**Mobile**:

```
[Category filter — horizontal scroll pills]
[Doa cards — vertical list]
[FAB — bottom right]
```

**Desktop**:

```
┌──────────────────────┬──────────────────┐
│ Doa feed             │ Submit doa panel  │
│ (left, main)         │ (right, sticky)   │
│                      │                  │
│ Category filter top  │ Category filter  │
│                      │                  │
└──────────────────────┴──────────────────┘
```

- Desktop: no FAB — submit form always visible in right panel
- Two-column layout

---

### `/komuniti` — Komuniti

**Mobile**:

```
[Category filter pills]
[Request cards — vertical]
[FAB]
```

**Desktop**:

```
┌──────────────────────┬──────────────────┐
│ Request cards        │ Post form (sticky)│
│ (2-col grid)         │                  │
│                      │ Category filter  │
└──────────────────────┴──────────────────┘
```

---

### `/profil` — Profil

**Mobile**:

```
[Avatar — centered, large]
[Name + mosque]
[Stats row: 3 columns]
[Settings list]
```

**Desktop**:

```
┌────────────────┬─────────────────────────┐
│ Avatar         │ Stats (3 cards)          │
│ Name           │ ─────────────────────── │
│ Mosque         │ Settings list            │
│ Edit button    │                          │
└────────────────┴─────────────────────────┘
```

---

## Component Behaviour Differences

| Component         | Mobile                   | Desktop             |
| ----------------- | ------------------------ | ------------------- |
| Mosque feed       | Horizontal scroll        | 2-col grid          |
| Quick actions     | 4×2 grid                 | 2×4 sidebar grid    |
| Ibadah tools      | 2×4 grid, full width     | 2×4 grid, right col |
| Checklist         | Tabbed categories        | 3-col all-at-once   |
| Doa submit        | FAB → modal              | Right panel sticky  |
| Prayer schedule   | Next prayer only         | Full 5-prayer table |
| Quran navigation  | Swipe                    | Click + keyboard    |
| Tasbih tap        | Touch tap area           | Space bar + click   |
| Navigation        | BottomNav                | Sidebar             |
| Modals            | Bottom sheet (slides up) | Centered dialog     |
| Horizontal scroll | Present                  | Replaced by grid    |

---

## Implementation Pattern

Use Tailwind `md:` prefix for all desktop overrides:

```tsx
// Navigation — mobile bottom, desktop hidden
<BottomNav className="md:hidden" />

// Sidebar — desktop only
<Sidebar className="hidden md:flex" />

// Horizontal scroll → desktop grid
<div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-2 md:overflow-visible">

// Single column → two column
<div className="space-y-4 md:grid md:grid-cols-[2fr_1fr] md:gap-6 md:space-y-0">

// FAB — mobile only
<FAB className="md:hidden" />

// Bottom sheet → centered dialog on desktop
// Use a component that renders differently based on useMediaQuery
```

---

## Content Width

```
Mobile:  full width, px-4 (16px) gutters
Desktop: content area = calc(100vw - 240px) [sidebar]
         inner max-width: max-w-5xl (1024px), centered
         page padding: px-8 (32px)
```
