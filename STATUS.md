# SAJDA — Project Status
> Last updated: 2026-05-16
> Only load this file when explicitly asked about project status.

## Legend
- `[x]` = Complete
- `[~]` = Partial (implemented but incomplete / uses mock data)
- `[ ]` = Not started
- `[!]` = Error / broken

## Overall Progress
```
Foundation          ███████░░░  70%
Jemaah Features     ███████░░░  75%
Mosque Admin        ░░░░░░░░░░   5%
Islamic Tools       ███████░░░  70%
Community           ████░░░░░░  40%
Payments            █░░░░░░░░░  10%
```

---

## Foundation
- [x] Next.js 14 App Router setup
- [x] Supabase project initialised (16 migrations, 49 RLS policies)
- [~] Auth (email + Google SSO) — email auth complete; Google OAuth callback route exists but provider not wired in UI
- [~] PWA manifest + service worker — manifest exists (`app/manifest.ts`), **no service worker file**
- [x] Tailwind CSS + design tokens (Tailwind v4, full CSS variable system, light/dark)
- [x] Landing page (Sacred Futurism)
- [~] Billplz sandbox integration — only `.env.local` placeholder vars, **zero Billplz SDK/API code**
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Sentry error tracking
- [ ] Staging environment

---

## Jemaah Features
- [x] Jemaah profile page (`app/profil/` + `ProfilContent.tsx`)
- [x] Follow mosque (`MosqueSwitcher.tsx` — follow/unfollow with primary badge)
- [x] Jemaah home/hub feed (`HomeShell.tsx` — announcements from followed mosques, pinned first)
- [~] Mosque-specific page with custom theme — UI complete (`MosqueProfileShell`) but **uses mock data, not DB**
- [x] Mosque switcher (top bar) (`components/home/MosqueSwitcher.tsx`)
- [~] Push notifications (waktu solat) — `hooks/useNotifications.ts` + `NotificationPanel.tsx` exist but **client-side only, no Web Push API**
- [x] Pahala checklist (daily) (`DeenChecklist.tsx` — 14 items, points system; localStorage only)
- [x] Solat streak (private) (`SolatTracker.tsx` + `solat.ts` server actions, DB-synced)
- [x] Zikir harian counter (`TasbihCounter.tsx` — 6 presets, haptic feedback)
- [x] Doa wish (post + aamiin) (`DoaContent.tsx` + `doa.ts` server actions, DB-synced)
- [x] Qibla finder (`QiblaCompass.tsx` — geolocation, device orientation, bearing math, distance to Kaaba)
- [x] Waktu solat (JAKIM API) (`app/api/prayer/route.ts` — WaktuSolat.app + AlAdhan fallback)
- [x] Hadis harian (`HadisHarian.tsx` + `hadis.ts` — 50 hadith seeded in DB with Arabic/Malay/English)
- [x] Tazkirah harian (`TazkirahHarian.tsx` — `lib/tazkirah-data.ts` local content)
- [~] View Imam & Bilal timetable — UI exists in `MosqueProfileShell` "Jadual" tab but **uses hardcoded mock data**

---

## Mosque Admin Dashboard
- [ ] Mosque profile setup
- [ ] Custom theme picker
- [ ] Announcement management
- [ ] Jemaah list view
- [ ] Janaiz management
- [ ] Sadaqah collection page
- [ ] Analytics dashboard
- [ ] Manage timetable for Imam & Bilal

> Note: `apps/admin/` is a Next.js boilerplate only — no actual implementation yet.

---

## Islamic Tools
- [x] Waktu solat widget (location-based) (`PrayerBanner.tsx` on home + full API route)
- [x] Qibla compass — geolocation, device orientation (`QiblaCompass.tsx`)
- [x] Zikir counter with haptics (`TasbihCounter.tsx`)
- [~] Hadis harian API integration — uses Supabase DB (50 hadith seeded), **not an external hadith API**
- [~] Tazkirah harian content pipeline — uses `lib/tazkirah-data.ts` local file, **not an external API**
- [x] Al-Mathurat morning/evening (`app/ibadah/mathurat/` + `MathuratReader.tsx`)
- [x] Deen checklist (`DeenChecklist.tsx` — 14 items, categories, max 20 pts; localStorage-based)

---

## Quran
- [x] Quran page reader (`app/ibadah/quran/` + `app/api/quran/page/[pageNum]/route.ts` — api.quran.com)
- [x] Quran bookmarks (`app/actions/quran.ts` + `quran_bookmarks` table — DB-synced)

---

## Community Features
- [x] Doa wish feed (per mosque) — fetches from `doa_wishes`, counts aamiin & comments
- [x] Aamiin reaction system — `logAamiin`/`removeAamiin` in `doa.ts`, `doa_aamiin` table
- [~] Minta pertolongan (community help requests) — `komuniti` page + `keperluan` table exists, minimal UI
- [ ] Janaiz notification + community response
- [ ] Khatam Together (group Quran reading tracker)

---

## Payments & Subscriptions
- [~] Billplz sandbox payment — `.env.local` placeholder vars only, **no SDK or API calls in code**
- [ ] Subscription tier enforcement (feature gating) — schema ready (tier enum, trial_ends_at), no enforcement
- [ ] Webhook handler (idempotent)
- [ ] Subscription management page (mosque admin)
- [ ] Sadaqah collection + payout flow
- [ ] Receipt email

---

## Infrastructure
- [ ] Production environment configured
- [ ] Custom domain
- [ ] Database backups enabled (Supabase platform handles automatic backups)
- [x] RLS policies audited (49 policies across all tables, least-privilege, recursion bug fixed in migration 11)
- [ ] Performance audit (Lighthouse >90)

---

## Known Issues / Tech Debt
- [~] Pahala checklist & Tasbih counter use localStorage only — not synced to DB
- [~] Mosque detail page (`/masjid/[mosqueId]`) uses hardcoded mock data instead of Supabase queries
- [~] Imam & Bilal timetable tab uses `MOCK_JADUAL` — needs DB connection
- [~] Google SSO: auth callback route exists but OAuth provider not configured in Supabase dashboard / UI
- [~] PWA not truly installable offline — service worker missing
- [~] Minta pertolongan / komuniti feature is minimal

---

## Next Up (Current Sprint)
<!-- Update this weekly -->
1. 
2. 
3. 

---

## Milestone Targets
- [ ] **v0.1 MVP**: Waktu solat + follow mosque + announcements
- [ ] **v0.2**: Full Islamic tools suite
- [ ] **v0.3**: Community features (doa wish, pertolongan)
- [ ] **v0.4**: Janaiz module
- [ ] **v1.0**: Payment live + 10 pilot mosques
- [ ] **v1.1**: 50 paying mosques 🎯
