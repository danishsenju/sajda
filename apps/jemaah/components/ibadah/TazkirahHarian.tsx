'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Tazkirah data (30 Islamic reflections, cycling by day) ────────────── */

const TAZKIRAH = [
  {
    title: 'Kekuatan Niat',
    category: 'Amalan',
    color: '#102937',
    content: 'Setiap perbuatan bermula dari hati. Sebelum memulakan hari ini, luangkan masa untuk memperbaharui niat — lakukan segala-galanya kerana Allah, bukan kerana pengiktirafan manusia. Niat yang ikhlas mengubah perkara biasa menjadi ibadah.',
    ayah: null,
    reflection: 'Apakah niatku hari ini untuk Allah atau untuk pandangan manusia?',
  },
  {
    title: 'Nilai Waktu',
    category: 'Kehidupan',
    color: '#7c3aed',
    content: 'Ibn al-Qayyim berkata: "Masa adalah kehidupanmu, dan kehidupanmu adalah modal utamamu." Setiap saat yang berlalu tidak akan kembali. Allah bersumpah dengan masa (Al-Asr) — petanda betapa berharganya ia.',
    ayah: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
    reflection: 'Bagaimana aku akan menggunakan masaku hari ini dengan lebih bermakna?',
  },
  {
    title: 'Redha dengan Ketentuan Allah',
    category: 'Tawakkal',
    color: '#0f766e',
    content: 'Ketahuilah bahawa apa yang menimpa kamu tidak akan meleset darimu, dan apa yang meleset darimu tidak akan menimpamu. Redha adalah ketenangan jiwa yang tidak dapat dibeli dengan harta. Ia adalah hadiah Allah kepada hamba yang percaya kepada-Nya.',
    ayah: null,
    reflection: 'Adakah aku menerima ujian Allah dengan hati yang lapang hari ini?',
  },
  {
    title: 'Keajaiban Sedekah',
    category: 'Sedekah',
    color: '#ca8a04',
    content: 'Nabi ﷺ bersabda bahawa sedekah tidak mengurangkan harta. Malah, sedekah membuka pintu rezeki yang tidak disangka. Mulakan dengan sedikit — senyuman pun adalah sedekah. Harta yang diberi dijalan Allah tidak berkurang, ia berkembang.',
    ayah: null,
    reflection: 'Apakah kebaikan kecil yang boleh aku lakukan hari ini untuk seseorang?',
  },
  {
    title: 'Kesabaran Itu Indah',
    category: 'Akhlaq',
    color: '#1a6b52',
    content: 'Allah bersama orang-orang yang sabar. Sabar bukan bermakna lemah — ia adalah kekuatan jiwa yang luar biasa. Orang yang sabar bukan sahaja menanggung musibah, malah dia syukur, tidak mengadu kepada selain Allah, dan terus berbuat baik.',
    ayah: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    reflection: 'Di manakah aku perlu lebih bersabar dalam hidupku hari ini?',
  },
  {
    title: 'Jaga Lisan',
    category: 'Akhlaq',
    color: '#9a3412',
    content: 'Nabi ﷺ bersabda bahawa seseorang boleh masuk syurga disebabkan lisannya, dan boleh juga masuk neraka disebabkannya. Dua perkara yang perlu dijaga: lisan dan kemaluan. Kata-kata yang baik adalah sedekah; kata-kata yang buruk boleh merosakkan hati.',
    ayah: null,
    reflection: 'Sudahkah aku menjaga percakapanku hari ini — tidak mengumpat, tidak berbohong?',
  },
  {
    title: 'Tanda Kasih Sayang Allah',
    category: 'Iman',
    color: '#5b21b6',
    content: 'Ujian bukan tanda Allah membenci kita. Nabi ﷺ bersabda: "Apabila Allah mencintai seseorang, Dia mengujinya." Ujian adalah cara Allah membersihkan dosa dan mengangkat darjat. Orang yang paling berat ujiannya adalah para nabi, kemudian yang paling soleh.',
    ayah: null,
    reflection: 'Apakah ujian yang sedang aku hadapi sekarang, dan apa yang boleh aku pelajari darinya?',
  },
  {
    title: 'Istighfar yang Menyembuhkan',
    category: 'Taubat',
    color: '#0891b2',
    content: 'Nabi ﷺ beristighfar lebih dari 70 kali sehari walaupun baginda maksum. Istighfar bukan sekadar permohonan ampun — ia membuka pintu rezeki, menurunkan hujan rahmat, dan melapangkan dada yang sempit. "Astaghfirullah wa atubu ilaih."',
    ayah: 'فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا',
    reflection: 'Bilakah kali terakhir aku beristighfar dengan penuh kesedaran dan penyesalan?',
  },
  {
    title: 'Hubungan dengan Al-Quran',
    category: 'Quran',
    color: '#166534',
    content: 'Al-Quran adalah ubat bagi hati yang sakit. Sesiapa yang jauh dari Al-Quran, hatinya akan menjadi keras. Mulakan dengan membaca sehalaman sehari — konsistensi lebih penting dari kuantiti. Al-Quran akan menjadi syafaat pada hari Kiamat.',
    ayah: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
    reflection: 'Berapa lama sudah aku tidak membaca Al-Quran dengan penuh tadabbur?',
  },
  {
    title: 'Kelebihan Solat Subuh',
    category: 'Solat',
    color: '#1d4ed8',
    content: 'Nabi ﷺ bersabda: "Dua rakaat Subuh lebih baik dari dunia dan seisinya." Solat Subuh di awal waktu adalah perjanjian kita dengan Allah setiap pagi. Ia memberkati hari kita dan para malaikat menyaksikannya.',
    ayah: null,
    reflection: 'Adakah aku menunaikan Subuh hari ini di awal waktunya?',
  },
  {
    title: 'Zikir — Makanan Hati',
    category: 'Zikir',
    color: '#0f766e',
    content: 'Hati yang tidak berzikir ibarat tubuh yang tidak makan. Ia akan lemah dan sakit. Allah berfirman bahawa dengan mengingati Allah, hati menjadi tenang. Zikir tidak semestinya panjang — "SubhanAllah" sudah cukup untuk menanam pokok di syurga.',
    ayah: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    reflection: 'Berapa kali lidahku berzikir hari ini berbanding berbual perkara sia-sia?',
  },
  {
    title: 'Berbakti kepada Ibu Bapa',
    category: 'Keluarga',
    color: '#b45309',
    content: 'Redha Allah bergantung pada redha ibu bapa, dan murka Allah bergantung pada murka mereka. Mereka bukan sahaja pintu syurga kita — setiap khidmat kepada mereka adalah ibadah yang Allah hargai. Jangan tunggu mereka pergi baru kita menyesal.',
    ayah: null,
    reflection: 'Sudahkah aku menghubungi ibu atau bapaku hari ini, walaupun sekadar untuk bertanya khabar?',
  },
  {
    title: 'Ikhlaskan Amalan',
    category: 'Amalan',
    color: '#7c3aed',
    content: 'Amalan yang ikhlas walaupun kecil lebih bernilai dari amalan besar yang bercampur riya. Imam Ahmad berkata: "Aku pernah berdoa selama 30 tahun, dan aku malu untuk menceritakannya." Keikhlasan adalah rahsia amalan yang diterima.',
    ayah: null,
    reflection: 'Adakah ada amalan yang aku lakukan untuk dipuji manusia, bukan kerana Allah?',
  },
  {
    title: 'Jaga Hak Jiran',
    category: 'Masyarakat',
    color: '#0e7490',
    content: 'Jibril terus mewasiatkan hak jiran kepada Nabi ﷺ sehingga Nabi ﷺ menyangka jiran akan menjadi ahli waris. Jiran adalah amanah yang Allah titipkan kepada kita. Mulakan dengan salam dan senyuman.',
    ayah: null,
    reflection: 'Bilakah kali terakhir aku berbuat baik kepada jiranku?',
  },
  {
    title: 'Kematian — Pengingat Terbaik',
    category: 'Kehidupan',
    color: '#374151',
    content: 'Nabi ﷺ menasihatkan untuk sering mengingati pemutus segala kelazatan, iaitu kematian. Bukan untuk menjadi sedih, tetapi untuk menjadi lebih bersemangat dalam beramal. Jika kita tahu ini hari terakhir kita, apakah yang akan kita lakukan berbeza?',
    ayah: null,
    reflection: 'Sekiranya aku meninggal hari ini, apakah perkara terakhir yang aku ingin selesaikan?',
  },
  {
    title: 'Kuasa Doa',
    category: 'Doa',
    color: '#1a6b52',
    content: 'Doa adalah senjata orang beriman. Allah berfirman: "Berdoalah kepada-Ku, nescaya Aku perkenankan." Doa bukan sahaja untuk meminta — ia adalah cara kita mengakui kelemahan kita dan kebesaran Allah. Jangan pernah berhenti berdoa.',
    ayah: 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
    reflection: 'Apakah doa terdalam yang sudah lama aku pendam tapi belum aku ungkapkan kepada Allah?',
  },
  {
    title: 'Persahabatan yang Membawa ke Syurga',
    category: 'Masyarakat',
    color: '#5b21b6',
    content: 'Nabi ﷺ bersabda bahawa seseorang itu mengikut agama temannya. Pilih sahabat yang mengingatkan kamu kepada Allah, bukan yang melalaikan kamu dari-Nya. Sahabat yang baik adalah antara nikmat terbesar Allah.',
    ayah: null,
    reflection: 'Adakah sahabat-sahabatku membawa aku lebih dekat atau lebih jauh dari Allah?',
  },
  {
    title: 'Syukur Membuka Pintu Rezeki',
    category: 'Syukur',
    color: '#ca8a04',
    content: 'Allah berjanji: "Jika kamu bersyukur, pasti Aku akan menambah nikmat-Ku." Syukur bukan sekadar ucapan "Alhamdulillah" — ia adalah menggunakan nikmat Allah untuk taat kepada-Nya. Hitung nikmat Allah hari ini dan rasai betapa banyaknya.',
    ayah: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
    reflection: 'Apakah tiga nikmat Allah yang aku bersyukur atas hari ini yang sering aku pandang remeh?',
  },
  {
    title: 'Jangan Tangguh Taubat',
    category: 'Taubat',
    color: '#9a3412',
    content: 'Setiap manusia berdosa, dan sebaik-baik yang berdosa adalah yang bertaubat. Allah membentangkan tangan-Nya pada waktu malam untuk menerima taubat yang berdosa pada waktu siang, dan membentangkannya pada waktu siang untuk menerima taubat yang berdosa pada waktu malam.',
    ayah: null,
    reflection: 'Adakah ada dosa yang sudah lama aku tangguh untuk bertaubat darinya?',
  },
  {
    title: 'Ilmu Sebelum Amal',
    category: 'Ilmu',
    color: '#1d4ed8',
    content: 'Imam Bukhari membuka Sahihnya dengan bab "Ilmu sebelum perkataan dan perbuatan." Amal tanpa ilmu adalah seperti berjalan dalam gelap. Luangkan masa setiap hari untuk menambah ilmu agama — walaupun sehalaman atau satu hadis.',
    ayah: null,
    reflection: 'Apakah ilmu agama yang aku pelajari minggu ini?',
  },
  {
    title: 'Solat — Tiang Agama',
    category: 'Solat',
    color: '#0f766e',
    content: 'Nabi ﷺ bersabda bahawa perkara pertama yang dihisab pada hari kiamat adalah solat. Jika solatnya baik, maka baiklah seluruh amalannya. Jaga solatmu seperti kamu menjaga nyawamu — kerana itulah perbezaan antara iman dan kufur.',
    ayah: null,
    reflection: 'Bagaimana kualiti solatku hari ini — adakah aku hadir sepenuhnya di hadapan Allah?',
  },
  {
    title: 'Keikhlasan dalam Memberi',
    category: 'Sedekah',
    color: '#166534',
    content: 'Sedekah yang paling utama adalah yang diberikan ketika kamu sihat dan kamu mencintai harta itu. Jangan tunggu kaya untuk bersedekah — sedekah dari yang sedikit lebih mulia dari sedekah yang banyak tapi dipaksa. Mulakan sekarang.',
    ayah: null,
    reflection: 'Bila kali terakhir aku bersedekah dengan ikhlas tanpa mengharapkan balasan dari manusia?',
  },
  {
    title: 'Tawadhu — Rendah Hati',
    category: 'Akhlaq',
    color: '#374151',
    content: 'Allah meninggikan orang yang merendah diri dan merendahkan orang yang sombong. Tawadhu bukan bermakna merendahkan diri secara palsu — ia adalah melihat kelebihan orang lain dan mengakui kekurangan diri sendiri dengan jujur.',
    ayah: null,
    reflection: 'Adakah ada perasaan sombong atau rasa lebih baik dari orang lain dalam hatiku hari ini?',
  },
  {
    title: 'Memaafkan Adalah Kekuatan',
    category: 'Akhlaq',
    color: '#0891b2',
    content: 'Allah berfirman bahawa sesiapa yang memaafkan dan mendamaikan, maka pahalanya di sisi Allah. Memaafkan bukan bermakna kamu lemah — ia adalah kekuatan jiwa yang luar biasa. Orang yang paling kuat adalah yang mampu menguasai dirinya ketika marah.',
    ayah: 'فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُ عَلَى اللَّهِ',
    reflection: 'Adakah ada seseorang yang perlu aku maafkan tetapi masih aku pendam dalam hati?',
  },
  {
    title: 'Husnuzan — Sangka Baik',
    category: 'Iman',
    color: '#1a6b52',
    content: 'Allah berfirman dalam hadis qudsi: "Aku sesuai dengan sangkaan hamba-Ku terhadap-Ku." Sangka baik kepada Allah adalah asas keimanan. Yakin bahawa setiap ketentuan Allah adalah yang terbaik, walaupun kita tidak dapat melihatnya sekarang.',
    ayah: null,
    reflection: 'Adakah aku bersangka baik kepada Allah dalam semua keadaan hidupku sekarang?',
  },
  {
    title: 'Rumah Tangga yang Sakinah',
    category: 'Keluarga',
    color: '#b45309',
    content: 'Nabi ﷺ bersabda: "Sebaik-baik kamu adalah yang paling baik terhadap keluarganya." Mulakan dengan keluarga terdekat sebelum berbuat baik kepada orang luar. Rumah yang penuh kasih sayang adalah syurga di dunia.',
    ayah: null,
    reflection: 'Adakah aku sudah menjadi suami/isteri/anak/ibu bapa yang lebih baik hari ini?',
  },
  {
    title: 'Kelebihan Puasa Sunnah',
    category: 'Amalan',
    color: '#7c3aed',
    content: 'Puasa Isnin dan Khamis adalah amalan Nabi ﷺ yang mulia. Pada hari tersebut, amalan diangkat ke hadrat Allah. Nabi ﷺ suka amalannya diangkat ketika baginda berpuasa. Mulakan dengan puasa Isnin minggu ini.',
    ayah: null,
    reflection: 'Bilakah kali terakhir aku berpuasa sunat Isnin atau Khamis?',
  },
  {
    title: 'Jangan Putus Asa',
    category: 'Iman',
    color: '#1d4ed8',
    content: 'Allah berfirman jangan berputus asa dari rahmat Allah — hanya orang yang kafir yang berputus asa dari rahmat-Nya. Tidak kira seberapa jauh kamu tersesat, pintu taubat sentiasa terbuka. Allah lebih gembira menerima taubat hamba-Nya dari seseorang yang menemui kembali barangnya yang hilang.',
    ayah: 'لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    reflection: 'Adakah ada situasi dalam hidupku sekarang yang membuatku berputus asa? Ingat — Allah Maha Kuasa.',
  },
  {
    title: 'Silaturrahim — Jaga Hubungan',
    category: 'Masyarakat',
    color: '#0e7490',
    content: 'Rasulullah ﷺ bersabda bahawa sesiapa yang ingin diluaskan rezekinya dan dipanjangkan umurnya, hendaklah dia menghubungkan silaturrahim. Hubungi ahli keluarga yang sudah lama tidak kamu sapa — mungkin hari ini adalah hari terbaik untuk itu.',
    ayah: null,
    reflection: 'Adakah ada ahli keluarga atau sahabat lama yang sudah lama aku tidak hubungi?',
  },
  {
    title: 'Keutamaan Malam',
    category: 'Amalan',
    color: '#374151',
    content: 'Pada sepertiga malam terakhir, Allah turun ke langit dunia dan bertanya: "Siapakah yang berdoa kepada-Ku, nescaya Aku perkenankan? Siapakah yang memohon kepada-Ku, nescaya Aku beri?" Manfaatkan waktu yang mustajab ini.',
    ayah: null,
    reflection: 'Bila kali terakhir aku bangun pada sepertiga malam terakhir untuk bermunajat kepada Allah?',
  },
]

/* ─── TazkirahHarian ─────────────────────────────────────────────────────── */

export function TazkirahHarian() {
  const todayIdx = (new Date().getDate() - 1) % TAZKIRAH.length
  const [idx, setIdx] = useState(todayIdx)
  const [direction, setDirection] = useState(1)

  const tazkirah = TAZKIRAH[idx]!
  const isToday = idx === todayIdx

  function go(d: 1 | -1) {
    setDirection(d)
    setIdx((prev) => (prev + d + TAZKIRAH.length) % TAZKIRAH.length)
  }

  return (
    <div className="px-4 pt-4 pb-10 md:px-0">

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: isToday ? `${tazkirah.color}18` : 'var(--surface-2)' }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: isToday ? tazkirah.color : 'var(--border-strong)' }} />
          <span className="text-xs font-semibold" style={{ color: isToday ? tazkirah.color : 'var(--text-dim)' }}>
            {isToday ? 'Tazkirah Hari Ini' : `Hari ke-${idx + 1}`}
          </span>
        </div>

        <div className="flex gap-1">
          {([[-1, '←'], [1, '→']] as [1 | -1, string][]).map(([d, arrow]) => (
            <button
              key={d}
              onClick={() => go(d)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
            >
              {arrow}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: direction * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -direction * 28 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex flex-col gap-4"
        >
          {/* ── Header ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: tazkirah.color, boxShadow: `0 8px 28px ${tazkirah.color}40` }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full mb-3 inline-block"
              style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.80)' }}
            >
              {tazkirah.category}
            </span>
            <h2
              className="text-xl font-bold"
              style={{ color: '#fff', fontFamily: 'var(--font-playfair)' }}
            >
              {tazkirah.title}
            </h2>
          </div>

          {/* ── Ayah (if any) ──────────────────────────────────────── */}
          {tazkirah.ayah && (
            <div
              className="px-5 py-4 rounded-xl"
              style={{ background: 'var(--surface-2)', borderLeft: `3px solid ${tazkirah.color}` }}
            >
              <p
                className="text-right leading-loose"
                style={{
                  color: 'var(--text)',
                  fontFamily: 'var(--font-amiri)',
                  fontSize: 20,
                  direction: 'rtl',
                  lineHeight: 2,
                }}
              >
                {tazkirah.ayah}
              </p>
            </div>
          )}

          {/* ── Content ────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text)', lineHeight: 1.9 }}
            >
              {tazkirah.content}
            </p>
          </div>

          {/* ── Muhasabah ──────────────────────────────────────────── */}
          <div
            className="rounded-xl p-4"
            style={{ background: `${tazkirah.color}0f`, border: `1px solid ${tazkirah.color}25` }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-widest mb-2"
              style={{ color: tazkirah.color }}
            >
              Muhasabah Diri
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text)', fontStyle: 'italic' }}>
              {tazkirah.reflection}
            </p>
          </div>

          {/* ── Progress dots ──────────────────────────────────────── */}
          <div className="flex justify-center gap-1.5 pt-2">
            {TAZKIRAH.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i) }}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 6,
                  height: 6,
                  background: i === idx ? tazkirah.color : 'var(--border-strong)',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
