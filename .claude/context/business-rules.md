# SAJDA — Business Rules & Domain Logic
> Load this when implementing features that touch subscriptions, Islamic logic, or Malaysian-specific behaviour.

## Subscription Tiers & Feature Gates

| Feature | Surau (RM49) | Kariah (RM149) | Komuniti (RM349) |
|---------|:---:|:---:|:---:|
| Announcements | 5/mo | Unlimited | Unlimited |
| Jemaah limit | 200 | 1,000 | Unlimited |
| Custom theme | ✗ | ✓ | ✓ |
| Janaiz module | ✗ | ✓ | ✓ |
| Sadaqah collection | ✗ | ✓ | ✓ |
| Analytics | ✗ | Basic | Full |
| Community features | ✗ | ✗ | ✓ |
| API access | ✗ | ✗ | ✓ |

Feature gating: check `masjid.features` JSONB or `masjid.tier` before rendering premium features.

## Sadaqah Collection Policy
- Platform takes **ZERO % of sadaqah**. 100% goes to mosque.
- This is a core brand promise and syariah-aligned decision.
- Billplz transaction fee (~1% + RM0.50) is absorbed by the mosque as part of their subscription value.
- Revenue model is subscription only — not transaction-based on ibadah.
- Display to jemaah: "100% sadaqah anda sampai ke masjid"

## Malaysian Time & Prayer Logic
- Timezone: Asia/Kuala_Lumpur (UTC+8) — always
- Pahala checklist resets: at Fajr time (not midnight)
- Solat streak: resets if no solat logged within 24h of prayer window closing
- Waktu solat zones: use JAKIM zone codes (e.g. WLY01 for KL)

## Data Privacy (PDPA Malaysia)
- User location: stored as zone code only, never exact coordinates in DB
- Solat streak: never publicly visible, never aggregated without consent
- Janaiz data: restricted to mosque admins only, not visible to other jemaah
- Right to deletion: user can delete account + all personal data
- Data retention: inactive accounts data purged after 2 years

## Multi-Mosque Jemaah Logic
- Jemaah can follow unlimited mosques
- Hub feed = aggregated feed from all followed mosques
- Mosque-specific page = isolated to that mosque's content + theme
- Islamic tools (waktu solat, zikir, streak) = global to jemaah, not per-mosque
- Doa wish = can be mosque-scoped OR global feed (feature flag)

## Janaiz Module Rules
- Only mosque admin can create janaiz record
- Jemaah can indicate solat jenazah attendance
- Arwah name visible to all followers of that mosque
- Personal details (IC, address) visible to admin only
- No gamification elements anywhere near janaiz feature

## Content Moderation
- Doa wish: auto-flag if contains phone numbers, URLs, or profanity
- Community help requests: require mosque admin approval before showing
- All Arabic text must come from pre-approved content library (no free-input Arabic)

## Mosque Onboarding
1. Admin registers → creates mosque profile
2. 14-day free trial starts automatically (Kariah tier features)
3. Day 7: reminder email to upgrade
4. Day 14: downgrade to Surau tier if no payment
5. Mosque data retained for 30 days post-cancellation before deletion