'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Adhkar data ────────────────────────────────────────────────────────── */

type Dhikr = {
  arabic: string
  transliteration: string
  meaning: string
  count: number
  benefit?: string
}

const MORNING: Dhikr[] = [
  {
    arabic: 'أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    transliteration: 'A\'udzu billahis-sami\'il-\'alimi minasy-syaithanir-rajim',
    meaning: 'Aku berlindung kepada Allah Yang Maha Mendengar lagi Maha Mengetahui dari syaitan yang direjam.',
    count: 1,
    benefit: 'Perlindungan dari syaitan sepanjang hari',
  },
  {
    arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
    transliteration: 'Allahumma bika ashbahna wa bika amsaina wa bika nahya wa bika namutu wa ilaykan-nusyur',
    meaning: 'Ya Allah, dengan-Mu kami memasuki waktu pagi, dengan-Mu kami memasuki waktu petang, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.',
    count: 1,
  },
  {
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ',
    transliteration: 'Allahumma anta rabbi la ilaha illa anta khalaqtani wa ana \'abduka wa ana \'ala \'ahdika wa wa\'dika mastatha\'tu',
    meaning: 'Ya Allah, Engkaulah Tuhanku, tiada tuhan melainkan Engkau, Engkau menciptakanku dan aku adalah hamba-Mu, aku dalam perjanjian-Mu dan janji-Mu sekadar kemampuanku.',
    count: 1,
    benefit: 'Sayyidul Istighfar — penghulu istighfar',
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    meaning: 'Maha Suci Allah dan segala puji bagi-Nya.',
    count: 100,
    benefit: 'Menghapus dosa walaupun sebanyak buih di lautan',
  },
  {
    arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    transliteration: 'La ilaha illallahu wahdahu la syarika lahu, lahul-mulku wa lahul-hamdu wa huwa \'ala kulli syai\'in qadir',
    meaning: 'Tiada tuhan melainkan Allah semata, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya segala pujian. Dan Dia Maha Kuasa atas segala sesuatu.',
    count: 10,
    benefit: 'Seperti memerdekakan 10 budak, dicatat 100 kebaikan, dihapus 100 keburukan',
  },
  {
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    transliteration: 'Allahumma salli wa sallim \'ala nabiyyina Muhammad',
    meaning: 'Ya Allah, limpahkanlah selawat dan salam atas Nabi kami Muhammad.',
    count: 10,
    benefit: 'Allah akan berselawat 10 kali ke atas pembacanya',
  },
  {
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladzi la yadhurru ma\'asmihi syai\'un fil-ardhi wa la fis-sama\'i wa huwas-sami\'ul-\'alim',
    meaning: 'Dengan nama Allah yang tiada sesuatu pun dapat memberi mudarat bersama nama-Nya di bumi mahupun di langit, dan Dia Maha Mendengar lagi Maha Mengetahui.',
    count: 3,
    benefit: 'Tiada sesuatu yang dapat membahayakannya',
  },
  {
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
    transliteration: 'Radhitu billahi rabba wa bil-islami dina wa bi-muhammadin sallallahu \'alaihi wa sallama nabiyya',
    meaning: 'Aku redha Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad ﷺ sebagai nabi.',
    count: 3,
    benefit: 'Wajib bagi Allah untuk meredhai pembacanya pada hari kiamat',
  },
  {
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
    transliteration: 'Ya Hayyu ya Qayyum, bi-rahmatika astaghithu, ashlih li sya\'ni kullahu wa la takilni ila nafsi tarfata \'ain',
    meaning: 'Wahai Yang Maha Hidup, wahai Yang Maha Berdiri Sendiri, dengan rahmat-Mu aku mohon pertolongan. Perbaikilah semua urusanku dan janganlah Engkau serahkan aku kepada diriku sendiri walaupun sekelip mata.',
    count: 1,
  },
  {
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udzu bi kalimatillahit-tammati min syarri ma khalaq',
    meaning: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.',
    count: 3,
    benefit: 'Tidak ada racun, penyakit, atau ain yang dapat membahayakannya',
  },
]

const EVENING: Dhikr[] = [
  {
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Allahumma bika amsaina wa bika ashbahna wa bika nahya wa bika namutu wa ilaykal-masir',
    meaning: 'Ya Allah, dengan-Mu kami memasuki waktu petang, dengan-Mu kami memasuki waktu pagi, dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.',
    count: 1,
  },
  {
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Amsaina wa amsal-mulku lillahi wal-hamdu lillahi',
    meaning: 'Kami memasuki waktu petang dan kerajaan di petang hari adalah milik Allah, segala pujian hanya untuk Allah.',
    count: 1,
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    meaning: 'Maha Suci Allah dan segala puji bagi-Nya.',
    count: 100,
    benefit: 'Menghapus dosa walaupun sebanyak buih di lautan',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
    transliteration: 'Allahumma inni amsaitu usyhiduka wa usyhidu hamalata \'arshika wa mala\'ikataka wa jami\'a khalqika annaka antallahu la ilaha illa anta wahdaka la syarika laka wa anna muhammadan \'abduka wa rasuluka',
    meaning: 'Ya Allah, sesungguhnya aku memasuki petang hari mempersaksikan-Mu, para pemikul Arsy-Mu, para malaikat-Mu dan seluruh makhluk-Mu bahawa Engkau adalah Allah, tiada tuhan melainkan Engkau semata, tiada sekutu bagi-Mu, dan bahawa Muhammad adalah hamba dan utusan-Mu.',
    count: 4,
    benefit: 'Allah akan membebaskan pembacanya dari api neraka',
  },
  {
    arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي',
    transliteration: 'Allahumma \'afini fi badani, Allahumma \'afini fi sam\'i, Allahumma \'afini fi bashari',
    meaning: 'Ya Allah, sembuhkanlah badanku. Ya Allah, sembuhkanlah pendengaranku. Ya Allah, sembuhkanlah penglihatanku.',
    count: 3,
    benefit: 'Doa kesihatan yang menyeluruh',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ',
    transliteration: 'Allahumma inni a\'udzu bika minal-kufri wal-faqri wa a\'udzu bika min \'adzabil-qabr',
    meaning: 'Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekafiran dan kefakiran, dan aku berlindung kepada-Mu dari azab kubur.',
    count: 3,
  },
  {
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    transliteration: 'Hasbiyallahu la ilaha illa huwa \'alayhi tawakkaltu wa huwa rabbul-\'arshil-\'azim',
    meaning: 'Cukuplah Allah bagiku, tiada tuhan melainkan Dia, kepada-Nya aku bertawakkal dan Dia adalah Tuhan Arsy yang agung.',
    count: 7,
    benefit: 'Allah akan mencukupkan keperluannya dunia dan akhirat',
  },
  {
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladzi la yadhurru ma\'asmihi syai\'un fil-ardhi wa la fis-sama\'i wa huwas-sami\'ul-\'alim',
    meaning: 'Dengan nama Allah yang tiada sesuatu pun dapat memberi mudarat bersama nama-Nya di bumi mahupun di langit.',
    count: 3,
  },
  {
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udzu bi kalimatillahit-tammati min syarri ma khalaq',
    meaning: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.',
    count: 3,
  },
  {
    arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
    transliteration: 'Allahumma bika amsaina...',
    meaning: 'Penutup zikir petang.',
    count: 1,
  },
]

/* ─── MathuratReader ─────────────────────────────────────────────────────── */

export function MathuratReader() {
  const now = new Date()
  const defaultTab: 'pagi' | 'petang' =
    now.getHours() >= 15 || now.getHours() < 6 ? 'petang' : 'pagi'

  const [tab, setTab] = useState<'pagi' | 'petang'>(defaultTab)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const dhikrList = tab === 'pagi' ? MORNING : EVENING
  const totalItems = dhikrList.length
  const completedItems = dhikrList.filter((_, i) => (counts[`${tab}-${i}`] ?? 0) >= dhikrList[i]!.count).length

  function increment(idx: number) {
    const key = `${tab}-${idx}`
    const maxCount = dhikrList[idx]!.count
    setCounts((prev) => {
      const cur = prev[key] ?? 0
      if (cur >= maxCount) return prev
      return { ...prev, [key]: cur + 1 }
    })
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(8)
  }

  function reset() {
    setCounts((prev) => {
      const next = { ...prev }
      dhikrList.forEach((_, i) => { delete next[`${tab}-${i}`] })
      return next
    })
  }

  const allDone = completedItems === totalItems

  return (
    <div className="pb-10">

      {/* ── Tab toggle ─────────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 pt-4 mb-5 md:px-0">
        {(['pagi', 'petang'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: tab === t ? 'var(--primary)' : 'var(--surface-2)',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              boxShadow: tab === t ? '0 4px 16px rgba(16,41,55,0.20)' : 'none',
            }}
          >
            <span>{t === 'pagi' ? '🌅' : '🌇'}</span>
            Zikir {t === 'pagi' ? 'Pagi' : 'Petang'}
          </button>
        ))}
      </div>

      {/* ── Progress bar ───────────────────────────────────────────── */}
      <div className="px-4 mb-5 md:px-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
            {completedItems}/{totalItems} zikir selesai
          </span>
          {allDone ? (
            <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>
              MasyaAllah! ✓
            </span>
          ) : (
            <button onClick={reset} className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Reset
            </button>
          )}
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--primary)' }}
            animate={{ width: `${(completedItems / totalItems) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Dhikr list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-4 md:px-0">
        {dhikrList.map((d, i) => {
          const key = `${tab}-${i}`
          const cur = counts[key] ?? 0
          const done = cur >= d.count
          const isExpanded = expandedIdx === i

          return (
            <motion.div
              key={`${tab}-${i}`}
              layout
              className="rounded-2xl overflow-hidden card-shadow"
              style={{
                background: done ? 'var(--primary)' : 'var(--surface-2)',
                opacity: done ? 0.85 : 1,
              }}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="flex items-start gap-3 w-full p-4 text-left"
              >
                {/* Count button */}
                <motion.div
                  whileTap={done ? {} : { scale: 0.85 }}
                  onClick={(e) => { e.stopPropagation(); increment(i) }}
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm cursor-pointer"
                  style={{
                    background: done ? 'rgba(255,255,255,0.15)' : 'var(--surface-3)',
                    color: done ? '#fff' : 'var(--accent)',
                  }}
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    `${cur}/${d.count}`
                  )}
                </motion.div>

                <div className="flex-1 min-w-0">
                  {/* Arabic snippet */}
                  <p
                    className="text-right leading-relaxed mb-1 line-clamp-2"
                    style={{
                      color: done ? 'rgba(255,255,255,0.80)' : 'var(--text)',
                      fontFamily: 'var(--font-amiri)',
                      fontSize: 16,
                      direction: 'rtl',
                    }}
                  >
                    {d.arabic}
                  </p>
                  <p
                    className="text-[11px] line-clamp-1"
                    style={{ color: done ? 'rgba(255,255,255,0.55)' : 'var(--text-dim)' }}
                  >
                    {d.transliteration}
                  </p>
                </div>

                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  className="flex-shrink-0 mt-1 transition-transform"
                  style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    stroke: done ? 'rgba(255,255,255,0.50)' : 'var(--text-dim)',
                  }}
                >
                  <path d="M6 9L12 15L18 9" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-4 pb-4 border-t"
                      style={{ borderColor: done ? 'rgba(255,255,255,0.10)' : 'var(--border)' }}
                    >
                      <p
                        className="text-sm mt-3 leading-relaxed"
                        style={{ color: done ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)', fontStyle: 'italic' }}
                      >
                        {d.meaning}
                      </p>
                      {d.benefit && (
                        <div
                          className="mt-2 px-3 py-2 rounded-lg"
                          style={{ background: done ? 'rgba(255,255,255,0.08)' : 'var(--accent-soft)' }}
                        >
                          <p
                            className="text-[11px] font-medium"
                            style={{ color: done ? 'rgba(255,255,255,0.70)' : 'var(--accent)' }}
                          >
                            ✦ {d.benefit}
                          </p>
                        </div>
                      )}
                      {/* Tap to count */}
                      {!done && (
                        <button
                          onClick={() => increment(i)}
                          className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: 'var(--accent)', color: '#fff' }}
                        >
                          Tekan untuk zikir ({cur}/{d.count})
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-5 py-4 rounded-2xl text-center md:mx-0"
          style={{ background: 'var(--primary)' }}
        >
          <p className="text-white font-semibold" style={{ fontFamily: 'var(--font-playfair)' }}>
            MasyaAllah! Zikir {tab === 'pagi' ? 'pagi' : 'petang'} selesai 🤲
          </p>
          <p className="text-white/60 text-xs mt-1">
            Semoga Allah terima dan berkati hari anda.
          </p>
        </motion.div>
      )}
    </div>
  )
}
