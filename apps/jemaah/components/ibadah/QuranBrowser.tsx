'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Surah = {
  number: number
  name: string                 // Arabic
  englishName: string          // English transliteration
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: 'Meccan' | 'Medinan'
}

type Verse = {
  numberInSurah: number
  text: string                 // Arabic
  translation: string
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const REVELATION_LABEL: Record<string, string> = {
  Meccan: 'Makkiyah',
  Medinan: 'Madaniyah',
}

const JUZ_STARTS: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13,
  14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19,
  20: 20, 21: 21, 22: 22, 23: 23, 24: 24, 25: 25,
  26: 26, 27: 27, 28: 28, 29: 29, 30: 30,
}

/* ─── QuranBrowser ───────────────────────────────────────────────────────── */

export function QuranBrowser() {
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [versesLoading, setVersesLoading] = useState(false)
  const [lastRead, setLastRead] = useState<number | null>(null)

  /* ── Fetch surah list ──────────────────────────────────────────── */
  useEffect(() => {
    const cached = sessionStorage.getItem('sajda_surah_list')
    if (cached) {
      try { setSurahs(JSON.parse(cached)); setLoading(false); return } catch {}
    }

    fetch('https://api.alquran.cloud/v1/surah')
      .then((r) => r.json())
      .then((d) => {
        if (d.code === 200) {
          setSurahs(d.data)
          sessionStorage.setItem('sajda_surah_list', JSON.stringify(d.data))
        } else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    // Load last read from localStorage
    try {
      const lr = localStorage.getItem('sajda_quran_lastread')
      if (lr) setLastRead(Number(lr))
    } catch {}
  }, [])

  /* ── Fetch verses ──────────────────────────────────────────────── */
  async function openSurah(surah: Surah) {
    setSelectedSurah(surah)
    setVersesLoading(true)
    setVerses([])

    try {
      localStorage.setItem('sajda_quran_lastread', String(surah.number))
      setLastRead(surah.number)

      const cacheKey = `sajda_surah_${surah.number}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        setVerses(JSON.parse(cached))
        setVersesLoading(false)
        return
      }

      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surah.number}/editions/quran-simple,ms.basmeih`
      )
      const data = await res.json()

      if (data.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabicAyahs = data.data[0].ayahs
        const translationAyahs = data.data[1].ayahs

        const merged: Verse[] = arabicAyahs.map((a: { numberInSurah: number; text: string }, i: number) => ({
          numberInSurah: a.numberInSurah,
          text: a.text,
          translation: translationAyahs[i]?.text ?? '',
        }))

        setVerses(merged)
        sessionStorage.setItem(cacheKey, JSON.stringify(merged))
      }
    } catch {
      // show fallback
    } finally {
      setVersesLoading(false)
    }
  }

  /* ── Filtered list ─────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    if (!search.trim()) return surahs
    const q = search.toLowerCase()
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        String(s.number).includes(q)
    )
  }, [surahs, search])

  /* ── Verse reader view ─────────────────────────────────────────── */
  if (selectedSurah) {
    return (
      <div className="pb-10">
        {/* Back + header */}
        <div
          className="sticky top-0 z-10 px-4 py-3 flex items-center gap-3 md:px-0"
          style={{ background: 'var(--surface)' }}
        >
          <button
            onClick={() => { setSelectedSurah(null); setVerses([]) }}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="var(--text)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>
              {selectedSurah.number}. {selectedSurah.englishName}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {selectedSurah.numberOfAyahs} ayat · {REVELATION_LABEL[selectedSurah.revelationType]}
            </p>
          </div>
          <p
            className="text-xl flex-shrink-0"
            style={{ fontFamily: 'var(--font-amiri)', color: 'var(--primary)', direction: 'rtl' }}
          >
            {selectedSurah.name}
          </p>
        </div>

        {/* Bismillah (except Al-Fatihah which has it as verse 1, and At-Tawbah) */}
        {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
          <div className="mx-4 mb-4 px-5 py-4 rounded-2xl text-center md:mx-0"
            style={{ background: 'var(--primary)' }}>
            <p
              style={{ fontFamily: 'var(--font-amiri)', fontSize: 22, color: '#fff', direction: 'rtl', lineHeight: 2 }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {versesLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--accent)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Memuatkan surah...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1 px-4 md:px-0">
            {verses.map((v) => (
              <motion.div
                key={v.numberInSurah}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(v.numberInSurah * 0.02, 0.5) }}
                className="py-4 border-b"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Ayah number badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
                  >
                    {v.numberInSurah}
                  </div>
                </div>
                {/* Arabic */}
                <p
                  className="text-right leading-loose mb-3"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    fontSize: 22,
                    direction: 'rtl',
                    color: 'var(--text)',
                    lineHeight: 2.2,
                  }}
                >
                  {v.text}
                </p>
                {/* Translation */}
                {v.translation && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)', lineHeight: 1.8 }}>
                    {v.translation}
                  </p>
                )}
              </motion.div>
            ))}
            {verses.length === 0 && !versesLoading && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--text-dim)' }}>
                Gagal memuatkan ayat. Sila semak sambungan internet.
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  /* ── Surah list view ───────────────────────────────────────────── */
  return (
    <div className="pb-10">
      {/* Search */}
      <div className="px-4 pt-4 pb-3 md:px-0">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1.5px solid var(--border)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="var(--text-dim)" strokeWidth="1.8" />
            <path d="M21 21L16.65 16.65" stroke="var(--text-dim)" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari surah..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-dim)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Last read */}
        {lastRead && !search && (
          <button
            onClick={() => {
              const s = surahs.find((s) => s.number === lastRead)
              if (s) openSurah(s)
            }}
            className="flex items-center gap-2 mt-3 w-full px-4 py-2.5 rounded-xl text-left"
            style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-accent)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="var(--accent)" strokeWidth="1.8" />
            </svg>
            <span className="text-xs font-semibold flex-1" style={{ color: 'var(--accent)' }}>
              Sambung membaca — Surah {surahs.find((s) => s.number === lastRead)?.englishName ?? lastRead}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 rounded-full"
            style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Memuatkan senarai surah...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-16 text-center px-8">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
            Gagal memuatkan Al-Quran
          </p>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>Sila semak sambungan internet anda.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="px-4 md:px-0">
            {filtered.map((surah, i) => (
              <motion.button
                key={surah.number}
                onClick={() => openSurah(surah)}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 w-full py-3.5 border-b text-left"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Surah number */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: surah.number === lastRead ? 'var(--accent)' : 'var(--surface-2)',
                    color: surah.number === lastRead ? '#fff' : 'var(--text-dim)',
                  }}
                >
                  {surah.number}
                </div>

                {/* Names */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>
                    {surah.englishName}
                    <span className="font-normal ml-1" style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                      · {surah.englishNameTranslation}
                    </span>
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                    {surah.numberOfAyahs} Ayat · {REVELATION_LABEL[surah.revelationType] ?? surah.revelationType}
                  </p>
                </div>

                {/* Arabic name */}
                <p
                  className="flex-shrink-0 text-base"
                  style={{ fontFamily: 'var(--font-amiri)', color: 'var(--text-muted)', direction: 'rtl' }}
                >
                  {surah.name}
                </p>
              </motion.button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center py-10 text-sm" style={{ color: 'var(--text-dim)' }}>
                Tiada surah ditemui untuk &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
