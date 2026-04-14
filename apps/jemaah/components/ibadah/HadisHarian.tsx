'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Hadis data (30 authentic hadis, cycling by day of month) ───────────── */

const HADIS = [
  {
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    malay: 'Sesungguhnya setiap amalan itu bergantung kepada niat, dan sesungguhnya bagi setiap orang apa yang dia niatkan.',
    source: 'Sahih Bukhari', number: '1', narrator: 'Umar bin al-Khattab RA',
  },
  {
    arabic: 'بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَحَجِّ الْبَيْتِ، وَصَوْمِ رَمَضَانَ',
    malay: 'Islam dibina atas lima perkara: syahadah bahawa tiada tuhan melainkan Allah dan Muhammad itu rasul-Nya, mendirikan solat, menunaikan zakat, mengerjakan haji ke Baitullah, dan berpuasa di bulan Ramadan.',
    source: 'Sahih Bukhari & Muslim', number: '8', narrator: 'Abdullah bin Umar RA',
  },
  {
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    malay: 'Seorang Muslim ialah orang yang kaum Muslimin lain selamat dari gangguan lidah dan tangannya.',
    source: 'Sahih Bukhari', number: '10', narrator: 'Abdullah bin Amr RA',
  },
  {
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    malay: 'Barangsiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata baik atau diam.',
    source: 'Sahih Bukhari & Muslim', number: '6018', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    malay: 'Tidak sempurna iman seseorang di antara kamu sehingga dia mencintai untuk saudaranya apa yang dia cintai untuk dirinya sendiri.',
    source: 'Sahih Bukhari & Muslim', number: '13', narrator: 'Anas bin Malik RA',
  },
  {
    arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    malay: 'Sesungguhnya Allah tidak melihat kepada rupa paras kamu dan harta kamu, tetapi Dia melihat kepada hati dan amalan kamu.',
    source: 'Sahih Muslim', number: '2564', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    malay: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia.',
    source: 'HR Thabrani & Daruquthni', number: '—', narrator: 'Jabir bin Abdullah RA',
  },
  {
    arabic: 'الْحَيَاءُ لَا يَأْتِي إِلَّا بِخَيْرٍ',
    malay: 'Malu itu tidak mendatangkan melainkan kebaikan.',
    source: 'Sahih Bukhari & Muslim', number: '37', narrator: 'Imran bin Husain RA',
  },
  {
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    malay: 'Senyumanmu kepada saudaramu adalah sedekah.',
    source: 'HR Tirmidhi', number: '1956', narrator: 'Abu Dzar al-Ghifari RA',
  },
  {
    arabic: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    malay: 'Menuntut ilmu adalah kewajipan bagi setiap Muslim.',
    source: 'HR Ibn Majah', number: '224', narrator: 'Anas bin Malik RA',
  },
  {
    arabic: 'الدِّينُ النَّصِيحَةُ',
    malay: 'Agama itu adalah nasihat.',
    source: 'Sahih Muslim', number: '55', narrator: 'Tamim ad-Dari RA',
  },
  {
    arabic: 'إِنَّ مِنْ أَكْمَلِ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
    malay: 'Sesungguhnya yang paling sempurna imannya di antara orang mukmin adalah yang paling baik akhlaknya.',
    source: 'HR Abu Dawud & Tirmidhi', number: '4682', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ، ارْحَمُوا مَنْ فِي الْأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
    malay: 'Orang-orang yang penyayang, Allah Yang Maha Penyayang akan menyayangi mereka. Sayangilah makhluk yang ada di bumi, nescaya yang ada di langit akan menyayangi kamu.',
    source: 'HR Abu Dawud & Tirmidhi', number: '1924', narrator: 'Abdullah bin Amr RA',
  },
  {
    arabic: 'مَنْ لَا يَشْكُرِ النَّاسَ لَا يَشْكُرِ اللَّهَ',
    malay: 'Barangsiapa yang tidak bersyukur kepada manusia, dia tidak bersyukur kepada Allah.',
    source: 'HR Abu Dawud & Tirmidhi', number: '4811', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'أَفْضَلُ الصِّيَامِ بَعْدَ رَمَضَانَ شَهْرُ اللَّهِ الْمُحَرَّمُ',
    malay: 'Puasa yang paling utama selepas Ramadan adalah puasa di bulan Allah, iaitu Muharram.',
    source: 'Sahih Muslim', number: '1163', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'مَنْ صَامَ يَوْمًا فِي سَبِيلِ اللَّهِ بَعَّدَ اللَّهُ وَجْهَهُ عَنِ النَّارِ سَبْعِينَ خَرِيفًا',
    malay: 'Barangsiapa yang berpuasa sehari di jalan Allah, Allah akan menjauhkan wajahnya dari api neraka sejauh perjalanan tujuh puluh tahun.',
    source: 'Sahih Bukhari & Muslim', number: '2840', narrator: 'Abu Said al-Khudri RA',
  },
  {
    arabic: 'إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثَةٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ',
    malay: 'Apabila manusia meninggal dunia, terputuslah amalannya kecuali tiga perkara: sedekah jariah, ilmu yang bermanfaat, atau anak soleh yang mendoakannya.',
    source: 'Sahih Muslim', number: '1631', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا إِلَّا كَانَ مَا أُكِلَ مِنْهُ لَهُ صَدَقَةً',
    malay: 'Tidaklah seorang Muslim menanam tanaman melainkan apa yang dimakan darinya menjadi sedekah baginya.',
    source: 'Sahih Muslim', number: '1552', narrator: 'Jabir bin Abdullah RA',
  },
  {
    arabic: 'أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    malay: 'Amalan yang paling dicintai Allah adalah yang paling berterusan walaupun sedikit.',
    source: 'Sahih Bukhari & Muslim', number: '6464', narrator: 'Aisyah RA',
  },
  {
    arabic: 'لَوْ كَانَتِ الدُّنْيَا تَعْدِلُ عِنْدَ اللَّهِ جَنَاحَ بَعُوضَةٍ مَا سَقَى كَافِرًا مِنْهَا شَرْبَةَ مَاءٍ',
    malay: 'Seandainya dunia ini bernilai di sisi Allah seperti sayap nyamuk, nescaya Dia tidak akan memberi minum kepada orang kafir walau seteguk air pun.',
    source: 'HR Tirmidhi', number: '2320', narrator: 'Sahl bin Saad RA',
  },
  {
    arabic: 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
    malay: 'Setiap kebaikan adalah sedekah.',
    source: 'Sahih Bukhari', number: '6021', narrator: 'Jabir bin Abdullah RA',
  },
  {
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    malay: 'Bertakwalah kepada Allah di mana saja kamu berada, ikutilah perbuatan buruk dengan perbuatan baik yang dapat menghapuskannya, dan bergaullah dengan manusia dengan akhlak yang baik.',
    source: 'HR Tirmidhi', number: '1987', narrator: 'Abu Dzar RA & Muaz bin Jabal RA',
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    malay: 'Barangsiapa yang menempuh suatu jalan untuk mencari ilmu, Allah akan mudahkan baginya jalan menuju syurga.',
    source: 'Sahih Muslim', number: '2699', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    malay: 'Sebaik-baik kamu adalah yang mempelajari Al-Quran dan mengajarkannya.',
    source: 'Sahih Bukhari', number: '5027', narrator: 'Utsman bin Affan RA',
  },
  {
    arabic: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ',
    malay: 'Keadaan yang paling dekat antara seorang hamba dengan Tuhannya adalah ketika dia sujud.',
    source: 'Sahih Muslim', number: '482', narrator: 'Abu Hurairah RA',
  },
  {
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    malay: 'Barangsiapa yang membaca satu huruf dari Kitab Allah, maka baginya satu kebaikan, dan satu kebaikan itu dilipatgandakan menjadi sepuluh.',
    source: 'HR Tirmidhi', number: '2910', narrator: 'Abdullah bin Masud RA',
  },
  {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    malay: 'Ya Allah, sesungguhnya Engkau Maha Pemaaf, Engkau mencintai kemaafan, maka maafkanlah aku.',
    source: 'HR Tirmidhi & Ibn Majah', number: '3513', narrator: 'Aisyah RA',
  },
  {
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    malay: 'Doa itulah ibadah.',
    source: 'HR Abu Dawud & Tirmidhi', number: '3372', narrator: 'An-Numan bin Basyir RA',
  },
  {
    arabic: 'أَفْضَلُ الذِّكْرِ لَا إِلَهَ إِلَّا اللَّهُ',
    malay: 'Zikir yang paling utama ialah La ilaha illallah.',
    source: 'HR Tirmidhi & Ibn Majah', number: '3383', narrator: 'Jabir bin Abdullah RA',
  },
  {
    arabic: 'صِلَةُ الرَّحِمِ تَزِيدُ فِي الْعُمْرِ وَتَنْفِي الْفَقْرَ',
    malay: 'Silaturrahim menambah umur dan menolak kefakiran.',
    source: 'HR Ahmad', number: '—', narrator: 'Abu Hurairah RA',
  },
]

/* ─── HadisHarian ────────────────────────────────────────────────────────── */

export function HadisHarian() {
  const todayIdx = (new Date().getDate() - 1) % HADIS.length
  const [idx, setIdx] = useState(todayIdx)
  const [direction, setDirection] = useState(1)

  const hadis = HADIS[idx]!
  const isToday = idx === todayIdx

  function go(d: 1 | -1) {
    setDirection(d)
    setIdx((prev) => (prev + d + HADIS.length) % HADIS.length)
  }

  return (
    <div className="px-4 pt-4 pb-10 md:px-0">

      {/* ── Day badge ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: isToday ? 'var(--accent-soft)' : 'var(--surface-2)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke={isToday ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" />
            <path d="M16 2V6M8 2V6M3 10H21" stroke={isToday ? 'var(--accent)' : 'var(--text-dim)'} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span
            className="text-xs font-semibold"
            style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {isToday ? 'Hadis Hari Ini' : `Hadis Hari ke-${idx + 1}`}
          </span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => go(-1)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => go(1)}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Hadis card ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 24 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* Arabic text */}
          <div
            className="rounded-2xl px-5 py-6 mb-4"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 8px 32px rgba(16,41,55,0.18)',
            }}
          >
            <p
              className="text-center leading-loose"
              style={{
                color: '#fff',
                fontFamily: 'var(--font-amiri)',
                fontSize: 22,
                direction: 'rtl',
                lineHeight: 2.2,
              }}
            >
              {hadis.arabic}
            </p>
          </div>

          {/* Translation */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{
                color: 'var(--text)',
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                lineHeight: 1.85,
              }}
            >
              &ldquo;{hadis.malay}&rdquo;
            </p>
          </div>

          {/* Source & narrator */}
          <div
            className="rounded-xl px-4 py-3 flex items-center justify-between"
            style={{ background: 'var(--surface-2)' }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {hadis.source}
                {hadis.number !== '—' && ` · No. ${hadis.number}`}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-dim)' }}>
                Diriwayatkan oleh {hadis.narrator}
              </p>
            </div>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Hadis Harian — SAJDA',
                    text: `"${hadis.malay}"\n\n${hadis.source}`,
                  })
                }
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface-3)' }}
              aria-label="Kongsi hadis"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="18" cy="5" r="3" stroke="var(--text-dim)" strokeWidth="1.8" />
                <circle cx="6" cy="12" r="3" stroke="var(--text-dim)" strokeWidth="1.8" />
                <circle cx="18" cy="19" r="3" stroke="var(--text-dim)" strokeWidth="1.8" />
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="var(--text-dim)" strokeWidth="1.8" />
              </svg>
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mt-5">
            {Array.from({ length: Math.min(HADIS.length, 30) }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i) }}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 18 : 6,
                  height: 6,
                  background: i === idx ? 'var(--accent)' : 'var(--border-strong)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
