# SAJDA — Claude Code Instructions

## Project Overview

SAJDA is a mosque management & jemaah companion PWA. It serves mosque administrators and regular Muslim users (jemaah) in Malaysia. The app covers ibadah tracking, community features, mosque discovery, Quran reading, and Islamic daily tools.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (Auth + Postgres + RLS)
- **Animation**: Framer Motion
- **Type**: PWA (mobile-first, desktop-supported)

## Key References — READ ALL BEFORE GENERATING ANY UI

Before generating any frontend code, read these files in this exact order:

1. `docs/frontend-design.md` — Core design philosophy & aesthetic principles
2. `docs/design-system.md` — SAJDA tokens, components, colour system, dual theme
3. `docs/responsive-spec.md` — Mobile vs Desktop layout rules (CRITICAL — layouts are completely different)
4. `docs/pages-spec.md` — Page-by-page layout intent & component breakdown

> ⚠️ MOBILE AND DESKTOP ARE NOT THE SAME DESIGN. Read `docs/responsive-spec.md` carefully.

---

## Architecture

### Shells

- `HomeShell` — wraps `/` (Utama) only
- `AppShell` — wraps all other pages
- Both shells render differently on mobile vs desktop — see `docs/responsive-spec.md`

### Navigation

- **Mobile**: `BottomNav` fixed at bottom — Utama · Masjid · Ibadah · Doa · Profil
- **Desktop**: `Sidebar` fixed left — full nav with labels, mosque switcher, user profile at bottom

### Routing Convention

```
/                    → Utama (home)
/masjid              → Mosque discovery
/masjid/[mosqueId]   → Mosque profile
/ibadah              → Ibadah Hub
/ibadah/[tool]       → Individual ibadah tools
/doa                 → Doa Bersama
/komuniti            → Komuniti
/profil              → User profile
/login               → Auth
/daftar              → Registration
```

---

## Database Schema (Supabase)

### Tables

| Table              | Purpose                              |
| ------------------ | ------------------------------------ |
| `masjid`           | Mosque profiles, tier, theme config  |
| `jemaah_profiles`  | User display name, avatar, zone      |
| `jemaah_follows`   | User ↔ mosque follow relationship    |
| `announcements`    | Mosque announcements                 |
| `doa_wishes`       | Community doa posts                  |
| `doa_aamiin`       | Aamiin reactions on doa              |
| `doa_comments`     | Comments on doa                      |
| `hadith`           | 50 hadith (Arabic + Malay + English) |
| `hadith_shares`    | Sharing logs                         |
| `pahala_checklist` | Daily ibadah checklist per user      |
| `solat_logs`       | Prayer completion logs               |
| `solat_streaks`    | Streak tracking per user             |
| `quran_bookmarks`  | Last read Quran page per user        |
| `mosque_admins`    | Admin role per mosque                |

### Key Relationships

- User → `jemaah_profiles` (1:1)
- User → `jemaah_follows` → `masjid` (many:many)
- User → `pahala_checklist` (1 row per day)
- User → `solat_streaks` (1:1)
- User → `quran_bookmarks` (1:1 — last read page)
- `masjid` → `announcements` (1:many)
- `doa_wishes` → `doa_aamiin`, `doa_comments` (1:many)

### Doa Categories

`kesihatan` · `keluarga` · `pekerjaan` · `pelajaran` · `kekuatan_iman` · `jodoh` · `keselamatan` · `ummah` · `umum`

### Prayer Names (solat_logs)

`subuh` · `zohor` · `asar` · `maghrib` · `isyak`

---

## Data Sources

| Data            | Source                                       |
| --------------- | -------------------------------------------- |
| Auth + User     | Supabase Auth                                |
| User profile    | `jemaah_profiles` table                      |
| Mosque follows  | `jemaah_follows` table                       |
| Announcements   | `announcements` table                        |
| Doa wishes      | `doa_wishes` + `doa_aamiin` + `doa_comments` |
| Daily checklist | `pahala_checklist` table                     |
| Prayer logs     | `solat_logs` table                           |
| Prayer streaks  | `solat_streaks` table                        |
| Quran bookmark  | `quran_bookmarks` table                      |
| Hadith          | `hadith` table                               |
| Prayer times    | `/api/prayer?zone=...`                       |
| Quran pages     | `/api/quran/page/[pageNum]`                  |

---

## Coding Standards

- Always use TypeScript — no `any` types
- `'use client'` only when necessary (interactivity, hooks, browser APIs)
- Server Components by default
- Tailwind utility classes — no inline styles
- Framer Motion for all animations
- Mobile-first responsive — but mobile and desktop have fundamentally different layouts
- All Arabic text: `font-amiri` class, `dir="rtl"`
- Never bypass Supabase RLS
- Theme: use CSS variables only — never hardcode colour hex values
- Dark/light mode: controlled via `[data-theme="dark"]` on `<html>`

## Theming

- **Default**: Light theme
- **Toggle**: `[data-theme="dark"]` on `<html>` element
- All colours via CSS variables defined in `docs/design-system.md`
- User preference stored in `localStorage` key: `sajda-theme`
