# SAJDA Pages Specification

Layout intent for every page. Read responsive-spec.md alongside this — mobile and desktop layouts differ significantly.

---

## Shell Structure

### HomeShell (`/`)
- Mobile: no top bar, BottomNav fixed bottom, full-bleed background
- Desktop: Sidebar left, content area right, no top bar

### AppShell (all other pages)
- Mobile: sticky top bar (back + title + action), BottomNav fixed bottom
- Desktop: Sidebar left, content area right, optional breadcrumb

---

## `/login` — Login

**Intent**: First impression. Sacred and trustworthy. Not a generic SaaS login.

**Mobile Layout**:
- Full screen centered vertically
- Top: SAJDA logo (SVG) + Arabic "بِسْمِ اللَّهِ" in Amiri, gold
- Middle: auth card — email + password fields + Login button
- Bottom: "Belum ada akaun?" → /daftar

**Desktop Layout**:
- Split screen: left = branded panel (green bg, SAJDA logo, Islamic pattern), right = auth form
- Auth form centered in right panel, max-w-sm

**Data**: Supabase Auth (`signInWithPassword`)

---

## `/daftar` — Registration

**Intent**: Welcoming onboarding. Quick to complete.

**Mobile**: Same structure as login. Fields: Nama Penuh, Email, Password, Confirm Password
**Desktop**: Same split layout as login.

**Data**: Supabase Auth (`signUp`) → creates `jemaah_profiles` row

---

## `/` — Utama (Home)

**Intent**: Daily command centre. Grounding and informative.

**Mobile Layout** (top → bottom):
1. **Header** — "Assalamualaikum, [display_name]" (Jakarta) left, avatar right
2. **Prayer Banner** — hero card, green gradient bg, current/next prayer name (Cormorant large), countdown timer (Jakarta mono), small dots for remaining prayers
3. **Mosque Feed** — section header + horizontal scroll cards. Shows announcements from followed mosques.
4. **Quick Actions** — "Ibadah Hari Ini" section header + 4×2 grid of icon pills
5. **Tazkirah Card** — full width, Cormorant quote, gold border
6. **Quran Continue** — compact row card, last read page from `quran_bookmarks`

**Desktop Layout**:
- Two-column: main (2/3) + right sidebar (1/3)
- Main: Prayer Banner (hero) → Mosque Feed (2-col grid)
- Right: Quick Actions grid → Quran Continue → Tazkirah

**Data**:
- User: `jemaah_profiles` (display_name, avatar_url)
- Prayer times: `/api/prayer?zone=[zone_code]`
- Mosque feed: `announcements` JOIN `masjid` WHERE mosque_id IN (user's `jemaah_follows`)
- Quran bookmark: `quran_bookmarks` WHERE user_id = current user
- Tazkirah: `hadith` table (daily rotation by date % 50)

**Quick Actions Grid** (8 items):
| Label | Route | Icon |
|-------|-------|------|
| Al-Quran | /ibadah/quran | BookOpen |
| Waktu Solat | /ibadah/solat | Clock |
| Tasbih | /ibadah/tasbih | Circle |
| Kiblat | /ibadah/qibla | Navigation |
| Senarai Semak | /ibadah/checklist | CheckSquare |
| Tazkirah | /ibadah/tazkirah | Lightbulb |
| Doa Bersama | /doa | Heart |
| Komuniti | /komuniti | Users |

---

## `/doa` — Doa Bersama

**Intent**: Community prayer wall. Intimate and warm.

**Mobile Layout**:
1. Category filter — horizontal scroll pill tabs (9 categories + "Semua")
2. Doa feed — vertical list of cards
3. FAB "+" — bottom right, opens submit sheet

**Desktop Layout**:
- Left (2/3): category filter top, doa feed below
- Right (1/3): sticky submit form panel

**Doa Card**:
- Avatar + display_name (or "Tanpa Nama" if anonymous) + mosque name + time
- Doa text (Jakarta, readable)
- Aamiin button (count from `doa_aamiin`) + comment icon (count from `doa_comments`)
- Gold "Aamiin 🤲" button — tapping inserts row in `doa_aamiin`

**Submit Form**:
- Textarea: doa text (min 10, max 500 chars)
- Category select
- Anonymous toggle
- Submit → inserts into `doa_wishes`

**Data**:
- Feed: `doa_wishes` + count from `doa_aamiin` + count from `doa_comments`
- Filter by category if selected
- Aamiin: INSERT into `doa_aamiin`, increment `doa_wishes.aamiin_count`

---

## `/ibadah` — Ibadah Hub

**Intent**: Personal ibadah overview. Motivating without being gamified.

**Mobile Layout**:
1. Progress ring — large SVG, gold stroke, center: "X selesai hari ini"
2. Next prayer card — prayer name + time remaining
3. Tool grid — 2×4, same 8 tools as Utama quick actions

**Desktop Layout**:
- Left: Progress ring + full 5-prayer schedule (from `solat_logs` today)
- Right: Tool grid 2×4

**Progress Ring Data**:
Count completed from `pahala_checklist` today:
- subuh_done, zohor_done, asar_done, maghrib_done, isyak_done = 5 items
- quran_done, zikir_done = 2 items
- Total: 7 trackable items → ring shows X/7

---

## `/ibadah/checklist` — Senarai Semak

**Intent**: Daily ibadah accountability. Satisfying to complete.

**Mobile Layout**:
1. Stats bar — streak (from `solat_streaks.current_streak`) + today's count
2. Category tabs — Wajib · Sunnah · Akhlaq
3. Checklist items per tab

**Desktop Layout**:
- 3-column: Wajib | Sunnah | Akhlaq — all visible simultaneously
- Stats bar spans full width at top

**Checklist Items**:

Wajib (maps to `pahala_checklist`):
- Subuh (`subuh_done`) · Zohor (`zohor_done`) · Asar (`asar_done`)
- Maghrib (`maghrib_done`) · Isyak (`isyak_done`)

Sunnah (maps to `pahala_checklist.extra` jsonb):
- Solat Rawatib · Solat Dhuha · Puasa Sunnah · Membaca Quran (`quran_done`)
- Berzikir (`zikir_done`)

Akhlaq (maps to `pahala_checklist.extra` jsonb):
- Bantu Orang Lain · Sedekah · Hubungi Keluarga

**Data**: UPSERT `pahala_checklist` WHERE user_id + checklist_date = today

---

## `/ibadah/hadis` — Hadis Harian

**Intent**: One hadith a day. Read and reflect.

**Layout** (same mobile/desktop, just width constrained on desktop):
1. Date — Hijri + Masihi, centered, caption
2. Theme badge — pill tag (e.g. "Ikhlas", "Ilmu")
3. Arabic text — Amiri, large, RTL, gold colour
4. Thin gold divider
5. Malay translation — Jakarta, readable
6. Source — rawi + kitab, muted
7. Share button row — WhatsApp · Telegram · Copy (logs to `hadith_shares`)

**Data**:
- Daily hadith: `hadith` WHERE number = (day_of_year % 50) + 1
- Share: INSERT into `hadith_shares`

---

## `/ibadah/mathurat` — Al-Mathurat

**Intent**: Guided supplication reader. Focused.

**Layout**:
1. Pagi / Petang toggle at top
2. Progress: "X / Y" + dot indicators
3. Full-screen paged reader — swipe mobile, click desktop

**Each Page**:
- Number badge + title
- Arabic (Amiri large, RTL)
- Transliteration (italic, muted)
- Malay meaning
- Repeat count badge ("×3")

**Data**: Static content (no DB), stored as JSON/constants

---

## `/ibadah/qibla` — Penentu Kiblat

**Intent**: Accurate qibla compass. Fast and functional.

**Layout**:
1. Geolocation permission prompt if needed
2. Compass — large circular SVG, animated needle
3. Info below: "Makkah: X km · Bearing: Y°"
4. Accuracy badge

**Data**: Browser Geolocation API → calculate qibla bearing

---

## `/ibadah/quran` — Al-Quran

**Intent**: Immersive Quran reading. Distraction-free.

**Mobile Layout**:
- Top: Surah name (Cormorant) + page X/604 + bookmark icon
- Full page: image from `/api/quran/page/[pageNum]`
- Swipe left = next, swipe right = prev
- Bottom: minimal prev/next controls

**Desktop Layout**:
- Left panel: collapsible surah list (114 surahs)
- Center: page display, max-w-2xl, keyboard navigation
- Bookmark saves to `quran_bookmarks`

**Data**:
- Page: `/api/quran/page/[pageNum]`
- Bookmark: UPSERT `quran_bookmarks` (user has one bookmark — last read)

---

## `/ibadah/solat` — Waktu Solat

**Intent**: Prayer times at a glance. Clean and fast.

**Mobile Layout**:
1. Zone badge (zone_code from `jemaah_profiles`)
2. 5 prayer rows: name + time + check button
3. Active/next prayer: gold left border accent
4. Streak: "X hari berturut-turut 🔥"

**Desktop Layout**:
- Left: 5-prayer table + zone info
- Right: monthly streak calendar (heatmap of `solat_logs` dates)

**Prayer Row Check**:
- Tap → INSERT into `solat_logs` (prayer, log_date, user_id)
- Update `pahala_checklist.[prayer]_done = true`
- Recalculate streak in `solat_streaks`

**Data**:
- Times: `/api/prayer?zone=[zone_code]`
- Logs: `solat_logs` WHERE user_id + log_date = today
- Streak: `solat_streaks` WHERE user_id

---

## `/ibadah/tasbih` — Tasbih & Zikir

**Intent**: Digital tasbih. Meditative and minimal.

**Mobile Layout**:
- Zikir text: Arabic (Amiri) + Malay (Jakarta)
- Counter: large number, center screen (Jakarta, very large)
- Target: "X / 33" or "X / 99"
- Tap area: large circle, 80%+ screen width
- Bottom: zikir selector (bottom sheet)
- Reset: top right corner, small

**Desktop Layout**:
- Same but centered, max-w-xs
- Spacebar = count
- Keyboard shortcut hint shown

**Zikir Options** (static):
- SubhanAllah (×33) · Alhamdulillah (×33) · Allahu Akbar (×33)
- La ilaha illallah (×100) · Istighfar (×100) · Selawat (×100)

**Data**: Local state only (no persistence)

---

## `/ibadah/tazkirah` — Tazkirah Harian

**Intent**: Daily reflection. Read and be moved.

**Layout** (desktop: max-w-2xl centered):
1. Date + Hijri
2. Theme/topic badge
3. Featured quote — Cormorant italic, large
4. Source attribution — muted
5. Full reflection text — Jakarta, comfortable line height
6. Share button

**Data**: `hadith` table (reused as tazkirah, or separate static content)

---

## `/komuniti` — Komuniti

**Intent**: Community help board. People helping people.

**Mobile Layout**:
1. Category filter pills
2. Request cards — vertical list
3. FAB "+" to post

**Desktop Layout**:
- Left (2/3): 2-col card grid
- Right (1/3): sticky post form

**Request Card** (from `keperluan` table):
- Category badge (colour coded)
- Title + description preview
- User + mosque + time
- Contact button

---

## `/masjid` — Masjid Discovery

**Intent**: Find and follow mosques.

**Mobile Layout**:
1. Search bar
2. Tabs: Berdekatan · Diikuti · Semua
3. Mosque cards — vertical list

**Desktop Layout**:
- List left, detail panel right (no page nav)
- Clicking mosque → panel slides in

**Mosque Card**:
- Name (Jakarta bold) + area + tier badge
- Follow / Following button
- Distance if Berdekatan tab

**Data**:
- Diikuti: `jemaah_follows` WHERE user_id
- Semua: `masjid` table
- Berdekatan: `masjid` filtered by zone_code match

---

## `/masjid/[mosqueId]` — Profil Masjid

**Intent**: Everything about one mosque.

**Mobile**: Banner → name + follow → tab bar → tab content (scroll)
**Desktop**: Banner → horizontal tab bar → content in 2-col grid

**Tabs**:
- **Pengumuman**: `announcements` WHERE mosque_id, ordered by published_at
- **Doa**: `doa_wishes` WHERE mosque_id
- **Janaiz**: filtered `announcements` WHERE category = 'janaiz' (if applicable)
- **Program**: future `events` table (or `announcements` tagged as program)
- **Jadual**: static prayer schedule for this mosque's zone

---

## `/profil` — Profil Pengguna

**Intent**: Personal space. Stats and settings.

**Mobile Layout**:
1. Avatar (large, centered) — tap to change
2. display_name + mosque affiliation (from primary `jemaah_follows`)
3. Stats row — 3 columns: Masjid Diikuti · Doa Dihantar · Streak Solat
4. Settings list
5. Theme toggle (Gelap / Terang)
6. Log Keluar

**Desktop Layout**:
- Left col: avatar + name + mosque + edit
- Right col: stats cards + settings

**Stats Data**:
- Masjid Diikuti: COUNT `jemaah_follows` WHERE user_id
- Doa Dihantar: COUNT `doa_wishes` WHERE user_id
- Streak Solat: `solat_streaks.current_streak`

**Settings**:
- Zon Solat (updates `jemaah_profiles.zone_code`)
- Tema (dark/light toggle → localStorage `sajda-theme` + `data-theme` on html)
- Notifikasi (PWA push permission)
- Tentang SAJDA
- Log Keluar (Supabase `signOut`)