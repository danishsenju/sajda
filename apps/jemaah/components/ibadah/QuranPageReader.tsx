'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveQuranBookmark } from '@/app/actions/quran'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Verse = {
  verse_key: string
  verse_number: number
  chapter_id: number
  juz_number: number
  text_uthmani: string
  translation: string
}

/* ─── Surah names (all 114) ─────────────────────────────────────────────── */

const SURAH: Record<number, string> = {
  1:'Al-Fatihah',2:'Al-Baqarah',3:'Ali \'Imran',4:'An-Nisa\'',5:'Al-Ma\'idah',
  6:'Al-An\'am',7:'Al-A\'raf',8:'Al-Anfal',9:'At-Tawbah',10:'Yunus',
  11:'Hud',12:'Yusuf',13:'Ar-Ra\'d',14:'Ibrahim',15:'Al-Hijr',
  16:'An-Nahl',17:'Al-Isra\'',18:'Al-Kahf',19:'Maryam',20:'Taha',
  21:'Al-Anbiya\'',22:'Al-Hajj',23:'Al-Mu\'minun',24:'An-Nur',25:'Al-Furqan',
  26:'Ash-Shu\'ara\'',27:'An-Naml',28:'Al-Qasas',29:'Al-\'Ankabut',30:'Ar-Rum',
  31:'Luqman',32:'As-Sajdah',33:'Al-Ahzab',34:'Saba\'',35:'Fatir',
  36:'Ya-Sin',37:'As-Saffat',38:'Sad',39:'Az-Zumar',40:'Ghafir',
  41:'Fussilat',42:'Ash-Shura',43:'Az-Zukhruf',44:'Ad-Dukhan',45:'Al-Jathiyah',
  46:'Al-Ahqaf',47:'Muhammad',48:'Al-Fath',49:'Al-Hujurat',50:'Qaf',
  51:'Adh-Dhariyat',52:'At-Tur',53:'An-Najm',54:'Al-Qamar',55:'Ar-Rahman',
  56:'Al-Waqi\'ah',57:'Al-Hadid',58:'Al-Mujadila',59:'Al-Hashr',60:'Al-Mumtahanah',
  61:'As-Saf',62:'Al-Jumu\'ah',63:'Al-Munafiqun',64:'At-Taghabun',65:'At-Talaq',
  66:'At-Tahrim',67:'Al-Mulk',68:'Al-Qalam',69:'Al-Haqqah',70:'Al-Ma\'arij',
  71:'Nuh',72:'Al-Jinn',73:'Al-Muzzammil',74:'Al-Muddaththir',75:'Al-Qiyamah',
  76:'Al-Insan',77:'Al-Mursalat',78:'An-Naba\'',79:'An-Nazi\'at',80:'\'Abasa',
  81:'At-Takwir',82:'Al-Infitar',83:'Al-Mutaffifin',84:'Al-Inshiqaq',85:'Al-Buruj',
  86:'At-Tariq',87:'Al-A\'la',88:'Al-Ghashiyah',89:'Al-Fajr',90:'Al-Balad',
  91:'Ash-Shams',92:'Al-Layl',93:'Ad-Duha',94:'Ash-Sharh',95:'At-Tin',
  96:'Al-\'Alaq',97:'Al-Qadr',98:'Al-Bayyinah',99:'Az-Zalzalah',100:'Al-\'Adiyat',
  101:'Al-Qari\'ah',102:'At-Takathur',103:'Al-\'Asr',104:'Al-Humazah',105:'Al-Fil',
  106:'Quraysh',107:'Al-Ma\'un',108:'Al-Kawthar',109:'Al-Kafirun',110:'An-Nasr',
  111:'Al-Masad',112:'Al-Ikhlas',113:'Al-Falaq',114:'An-Nas',
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

const CACHE_KEY = (p: number) => `sajda_qp_${p}`

/* ─── Slide variants ─────────────────────────────────────────────────────── */

const slide = {
  enter: (d: number) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
}

/* ─── GoToPageSheet ──────────────────────────────────────────────────────── */

function GoToSheet({
  current,
  onGo,
  onClose,
}: {
  current: number
  onGo: (p: number) => void
  onClose: () => void
}) {
  const [val, setVal] = useState(String(current))

  function submit() {
    const n = Number(val)
    if (n >= 1 && n <= 604) { onGo(n); onClose() }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl px-5 pt-4 pb-safe-bottom pb-8"
        style={{ background: 'var(--surface)', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)' }}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>
        <p className="text-sm font-bold mb-3" style={{ color: 'var(--text)' }}>Pergi ke halaman</p>
        <div className="flex gap-3">
          <input
            type="number"
            min={1}
            max={604}
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="flex-1 text-center text-lg font-bold px-4 py-3 rounded-xl outline-none"
            style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1.5px solid var(--border)' }}
            autoFocus
          />
          <button
            onClick={submit}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            Pergi
          </button>
        </div>
        <p className="text-center text-[11px] mt-2" style={{ color: 'var(--text-dim)' }}>1 – 604</p>
      </motion.div>
    </>
  )
}

/* ─── QuranPageReader ────────────────────────────────────────────────────── */

export function QuranPageReader({ initialPage = 1 }: { initialPage?: number }) {
  const [page, setPage]           = useState(initialPage)
  const [verses, setVerses]       = useState<Verse[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(false)
  const [direction, setDirection] = useState(0)
  const [bookmarked, setBm]       = useState(false)
  const [goToOpen, setGoTo]       = useState(false)

  const touchX = useRef<number | null>(null)
  const touchY = useRef<number | null>(null)

  /* ── Fetch page ── */
  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    setError(false)

    const cached = sessionStorage.getItem(CACHE_KEY(p))
    if (cached) {
      try {
        setVerses(JSON.parse(cached))
        setLoading(false)
        return
      } catch {}
    }

    try {
      const res = await fetch(`/api/quran/page/${p}`)
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()

      const mapped: Verse[] = (data.verses ?? []).map((v: any) => ({
        verse_key:    v.verse_key,
        verse_number: v.verse_number,
        chapter_id:   v.chapter_id,
        juz_number:   v.juz_number,
        text_uthmani: v.text_uthmani ?? '',
        translation:  stripHtml(v.translations?.[0]?.text ?? ''),
      }))

      setVerses(mapped)
      sessionStorage.setItem(CACHE_KEY(p), JSON.stringify(mapped))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPage(page) }, [page, fetchPage])

  /* ── Navigation ── */
  function goNext() {
    if (page >= 604) return
    setDirection(1)
    setBm(false)
    setPage(p => p + 1)
  }

  function goPrev() {
    if (page <= 1) return
    setDirection(-1)
    setBm(false)
    setPage(p => p - 1)
  }

  function goTo(p: number) {
    setDirection(p > page ? 1 : -1)
    setBm(false)
    setPage(p)
  }

  /* ── Swipe detection (allows normal vertical scroll) ── */
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX
    touchY.current = e.touches[0].clientY
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null || touchY.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    const dy = e.changedTouches[0].clientY - touchY.current
    touchX.current = null; touchY.current = null
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 72) {
      dx < 0 ? goNext() : goPrev()
    }
  }

  /* ── Bookmark ── */
  async function handleBookmark() {
    await saveQuranBookmark({
      pageNumber: page,
      verseKey: verses[0]?.verse_key,
    })
    setBm(true)
    setTimeout(() => setBm(false), 2000)
  }

  /* ── Header info ── */
  const uniqueSurahs = [...new Set(verses.map(v => v.chapter_id))]
  const surahLabel   = uniqueSurahs.map(id => SURAH[id] ?? `Surah ${id}`).join(' · ')
  const juzNum       = verses[0]?.juz_number ?? null

  return (
    <div className="flex flex-col min-h-0 pb-24">
      {/* ── Top bar ── */}
      <div
        className="sticky top-0 z-10 px-4 py-2.5 flex items-center gap-3 md:px-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Page + Juz */}
        <button
          onClick={() => setGoTo(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--surface-2)' }}
        >
          <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>Halaman {page}</span>
          <span className="text-[9px]" style={{ color: 'var(--text-dim)' }}>/ 604</span>
        </button>

        {/* Surah name */}
        <p className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--text-dim)' }}>
          {loading ? '…' : surahLabel}
        </p>

        {/* Juz badge */}
        {juzNum && !loading && (
          <span
            className="text-[10px] px-2 py-1 rounded-full font-medium flex-shrink-0"
            style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
          >
            Juz {juzNum}
          </span>
        )}

        {/* Bookmark button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleBookmark}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            background: bookmarked ? 'var(--primary)' : 'var(--surface-2)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"
              stroke={bookmarked ? '#fff' : 'var(--text-dim)'}
              fill={bookmarked ? '#fff' : 'none'}
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </motion.button>
      </div>

      {/* ── Bookmark confirmation ── */}
      <AnimatePresence>
        {bookmarked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mx-4 mt-2 px-4 py-2 rounded-xl text-center md:mx-0"
            style={{ background: 'rgba(16,41,55,0.08)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
              Penanda dibuat — Halaman {page}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Verses ── */}
      <div
        className="flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 rounded-full"
              style={{ borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)' }}
            />
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>Memuatkan halaman {page}…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center px-8">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Gagal memuatkan halaman
            </p>
            <button
              onClick={() => fetchPage(page)}
              className="text-xs px-5 py-2.5 rounded-full font-semibold"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Cuba Semula
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-y-auto"
              style={{ maxHeight: 'calc(100dvh - 200px)' }}
            >
              <div className="px-4 pb-4 md:px-0">
                {(() => {
                  let prevChapter = -1
                  return verses.map((v, i) => {
                    const showHeader = v.chapter_id !== prevChapter
                    if (showHeader) prevChapter = v.chapter_id

                    return (
                      <div key={v.verse_key}>
                        {/* Surah header divider */}
                        {showHeader && (
                          <div className="my-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                              <div
                                className="px-4 py-1.5 rounded-full text-xs font-bold"
                                style={{ background: 'var(--primary)', color: '#fff' }}
                              >
                                {SURAH[v.chapter_id] ?? `Surah ${v.chapter_id}`}
                              </div>
                              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                            </div>
                            {/* Bismillah (except surah 1 and 9) */}
                            {v.chapter_id !== 1 && v.chapter_id !== 9 && v.verse_number === 1 && (
                              <div
                                className="text-center py-3 mb-2 rounded-xl"
                                style={{ background: 'var(--surface-2)' }}
                              >
                                <p
                                  style={{
                                    fontFamily: 'var(--font-amiri)',
                                    fontSize: 20,
                                    direction: 'rtl',
                                    color: 'var(--primary)',
                                    lineHeight: 2,
                                  }}
                                >
                                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Verse */}
                        <div
                          className="py-4 border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          {/* Ayah number badge */}
                          <div className="flex items-center justify-end mb-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
                            >
                              {v.verse_number}
                            </div>
                          </div>

                          {/* Arabic */}
                          <p
                            className="text-right leading-loose mb-3"
                            style={{
                              fontFamily: 'var(--font-amiri)',
                              fontSize: 24,
                              direction: 'rtl',
                              color: 'var(--text)',
                              lineHeight: 2.4,
                            }}
                          >
                            {v.text_uthmani}
                          </p>

                          {/* Malay translation */}
                          {v.translation && (
                            <p
                              className="text-sm leading-relaxed"
                              style={{ color: 'var(--text-dim)', lineHeight: 1.8 }}
                            >
                              {v.translation}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── Navigation bar ── */}
      <div
        className="fixed bottom-20 left-0 right-0 flex items-center justify-between px-4 py-3 md:px-8"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goPrev}
          disabled={page <= 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{
            background: page <= 1 ? 'var(--surface-2)' : 'var(--primary)',
            color: page <= 1 ? 'var(--text-dim)' : '#fff',
            opacity: page <= 1 ? 0.4 : 1,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Sebelum
        </motion.button>

        {/* Page progress */}
        <div className="text-center">
          <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{page} / 604</p>
          <div
            className="h-1 w-20 rounded-full mt-1 overflow-hidden"
            style={{ background: 'var(--surface-2)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(page / 604) * 100}%`, background: 'var(--primary)' }}
            />
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={goNext}
          disabled={page >= 604}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{
            background: page >= 604 ? 'var(--surface-2)' : 'var(--primary)',
            color: page >= 604 ? 'var(--text-dim)' : '#fff',
            opacity: page >= 604 ? 0.4 : 1,
          }}
        >
          Seterusnya
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      {/* ── Go-to-page sheet ── */}
      <AnimatePresence>
        {goToOpen && (
          <GoToSheet current={page} onGo={goTo} onClose={() => setGoTo(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
