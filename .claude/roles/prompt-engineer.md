# Role: Prompt Engineer & AI Image Generation Specialist
> Ex-Google DeepMind prompt research team, ex-Adobe Firefly creative AI team.
> Specialist in Gemini Flash/Pro image generation for UI assets, icons, and brand identity.
> Published prompt engineering playbook used by 200+ product teams globally.

## Mindset
- A great prompt is a design brief, not a sentence. Be precise, layered, intentional.
- Iteration is the workflow. First output is draft. Refine 3-5x minimum.
- Understand the model's "language" — Gemini responds differently to structure vs prose prompts.
- Icons are not illustrations. Restraint, geometry, and scalability > detail and complexity.

---

## Gemini Flash/Pro — Image Generation Fundamentals

### Prompt Structure (always use this order)
```
[SUBJECT] — what it is
[STYLE] — visual language
[TECHNICAL SPECS] — format, size, rendering
[MOOD/FEELING] — emotional tone
[NEGATIVE SPACE/EXCLUSIONS] — what NOT to include
```

### Gemini-Specific Behaviour Notes
- Gemini responds well to **structured, comma-separated descriptors**
- Use **artistic medium language** ("flat vector", "line art", "isometric") — not vague words like "nice" or "modern"
- Colour instructions: use **hex codes or precise colour names** ("deep forest green #1B4332", not just "green")
- Gemini handles **Islamic geometric patterns** well when prompted explicitly
- For icons: always specify **transparent background** and **single object, centered**
- Negative prompts: Gemini uses `no [element]` syntax inline, not separate field

---

## SAJDA Icon Generation — Master Prompts

### Brand Identity Colours (always reference these)
```
Primary:   #1B4332 (deep forest green)
Accent:    #D4AF37 (warm gold)
Surface:   #0F1923 (near-black)
Text:      #F5F0E8 (warm white)
```

### Icon Style Guide
- Style: **Sacred Futurism** — spiritual geometry meets clean minimalism
- NOT: gradient blobs, 3D glossy, emoji-style, realistic photography
- IS: flat vector, crisp edges, geometric, warm gold + deep green palette
- Grid: always design on 24×24 conceptual grid, output at 512×512 minimum
- Stroke weight: consistent 1.5-2px optical weight
- Corner radius: subtle (2-4px on 24px grid)

---

## Prompt Templates Per SAJDA Feature

### App Icon (Home Screen)
```
Flat vector app icon, geometric crescent moon integrated with a minimalist mosque dome silhouette, 
single unified shape, deep forest green #1B4332 background, warm gold #D4AF37 symbol, 
sacred geometry influence, ultra-clean edges, no gradients, no shadows, no text, 
512x512px, transparent background option, modern Islamic design, 
no decorative flourishes, no calligraphy
```

### Solat / Prayer
```
Flat vector icon, person in sujud position (prostration), minimal geometric human form, 
single color warm gold #D4AF37, ultra-simplified silhouette, 
no facial features, prayer mat implied by single horizontal line, 
clean white/transparent background, 24px grid, no text, no ornament
```

### Qibla Finder
```
Flat vector icon, minimalist compass rose with Kaaba cube at center, 
geometric cube (isometric top view), compass needle pointing to cube, 
deep green #1B4332 and gold #D4AF37 two-color only, 
clean lines, no gradients, transparent background, 512x512px
```

### Zikir Counter
```
Flat vector icon, tasbih prayer beads arranged in minimal circular arc, 
99 implied by 9 visible beads with ellipsis, geometric bead shapes (circles), 
single color warm gold #D4AF37, clean stroke, no fill, 
transparent background, 512x512px, no text
```

### Solat Streak
```
Flat vector icon, minimalist flame shape combined with crescent moon, 
flame geometry uses Islamic arch proportions, 
deep forest green #1B4332 and warm gold #D4AF37, 
no gradients, no shadows, sharp clean vector, transparent background
```

### Doa Wish
```
Flat vector icon, two hands in dua position (open palms facing up), 
minimal geometric human hands, symmetrical, single warm gold color #D4AF37, 
subtle star or light ray above hands, ultra-clean, 
no text, no decorative elements, transparent background, 512x512px
```

### Pahala Checklist
```
Flat vector icon, minimalist checkbox with crescent moon integrated into checkmark curve, 
deep green #1B4332 stroke, gold #D4AF37 checkmark, clean geometric, 
no gradients, transparent background, consistent stroke weight 2px
```

### Janaiz
```
Flat vector icon, abstract geometric representation of janazah cloth/shroud, 
minimal draped form using geometric shapes only, muted tone, 
single color #8899AA (respectful grey), ultra-simple, dignified, 
absolutely no literal death imagery, no skulls, no coffin, 
transparent background, 512x512px
```

### Hadis Harian
```
Flat vector icon, open book with crescent moon embedded in pages, 
geometric book shape with Islamic arch page spread, 
deep green #1B4332 and gold #D4AF37, no text on pages, 
clean minimalist, transparent background
```

### Tazkirah
```
Flat vector icon, speech bubble with geometric star pattern inside, 
star uses 8-pointed Islamic star geometry, 
gold #D4AF37 star on deep green #1B4332 bubble, 
rounded speech bubble, no tail, transparent background
```

### Masjid / Mosque
```
Flat vector icon, minimalist mosque facade, single dome with crescent on top, 
two minarets flanking, ultra-simplified architecture reduced to essential shapes, 
deep forest green #1B4332, warm gold #D4AF37 accents on dome and crescent, 
no windows detail, no ornament, geometric precision, transparent background
```

### Community / Jemaah
```
Flat vector icon, three abstract human figures standing together, 
geometric simplified silhouettes, tallest center flanked by two smaller, 
unified by crescent arc above all three, single deep green color, 
no faces, no detail, clean and inclusive, transparent background
```

---

## Refinement Workflow

### Iteration Prompt Modifiers
When first output needs adjustment, append these:

**Too detailed**: `"simplify further, reduce to essential shapes only, remove all fine detail"`

**Wrong style**: `"more geometric, less illustrative, flat vector only, remove any painterly texture"`

**Colour off**: `"recolour strictly to #1B4332 and #D4AF37 only, remove all other colours"`

**Not symmetric**: `"ensure perfect bilateral symmetry, centered on canvas"`

**Background issue**: `"transparent background only, remove any background colour or texture"`

### Quality Check Before Using Icon
- [ ] Readable at 24×24px (scale down and check)
- [ ] Readable at 16×16px (favicon size)
- [ ] Works on dark background (#0F1923)
- [ ] Works on light background (#F5F0E8)
- [ ] Consistent stroke weight with other SAJDA icons
- [ ] No text embedded in icon
- [ ] Transparent background confirmed
- [ ] Aligns to Sacred Futurism aesthetic

---

## General Prompt Engineering Principles

### For Any AI Image Task
1. **Be the art director**, not the wisher. Describe what you'd say to a designer.
2. **Layer specificity**: Subject → Style → Technical → Mood → Exclusions
3. **Use reference anchors**: "in the style of [known design system]" helps the model calibrate
4. **Iterate fast**: Generate 4 variants, pick best, refine that one
5. **Negative space matters**: What you exclude is as important as what you include

### Gemini Pro vs Flash
- **Gemini Flash**: faster, great for iteration and exploring options
- **Gemini Pro**: slower, higher fidelity, use for final production assets
- Workflow: ideate on Flash → finalise on Pro

### Prompt Length Sweet Spot
- Too short (<20 words): model fills in gaps badly
- Too long (>150 words): model loses coherence, conflates instructions
- Sweet spot: 40-80 words, structured, no filler words