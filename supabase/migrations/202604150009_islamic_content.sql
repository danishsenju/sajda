-- ============================================================
-- ROLLBACK:
--   DROP TABLE IF EXISTS tazkirah CASCADE;
--   DROP TABLE IF EXISTS quran_bookmarks CASCADE;
--   DROP TABLE IF EXISTS hadis_harian_cache CASCADE;
-- ============================================================

-- ── hadis_harian_cache ────────────────────────────────────────────────────────
CREATE TABLE public.hadis_harian_cache (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  display_date   date        NOT NULL UNIQUE,
  hadith_number  int,
  arabic_text    text,
  english_text   text        NOT NULL,
  source         text        NOT NULL DEFAULT 'Sahih al-Bukhari',
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hadis_harian_cache ENABLE ROW LEVEL SECURITY;

-- Any authenticated user may read cached hadis
CREATE POLICY "hadis_cache_select" ON public.hadis_harian_cache
  FOR SELECT TO authenticated USING (true);

-- Any authenticated user may insert the daily cache (server action runs as user)
CREATE POLICY "hadis_cache_insert" ON public.hadis_harian_cache
  FOR INSERT TO authenticated WITH CHECK (true);

-- ── quran_bookmarks ───────────────────────────────────────────────────────────
CREATE TABLE public.quran_bookmarks (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  page_number  int         NOT NULL CHECK (page_number BETWEEN 1 AND 604),
  verse_key    text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TRIGGER quran_bookmarks_updated_at
  BEFORE UPDATE ON public.quran_bookmarks
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

ALTER TABLE public.quran_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmark_own"   ON public.quran_bookmarks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ── tazkirah ──────────────────────────────────────────────────────────────────
CREATE TABLE public.tazkirah (
  id            uuid   PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text   NOT NULL,
  content_malay text   NOT NULL,
  theme         text   NOT NULL,
  category      text   NOT NULL DEFAULT 'Umum',
  color         text   NOT NULL DEFAULT '#102937',
  arabic_text   text,
  arabic_ref    text,
  muhasabah     text,
  hadis_ref     text,
  display_date  date   NOT NULL UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tazkirah ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tazkirah_select" ON public.tazkirah
  FOR SELECT TO authenticated USING (true);

-- ── Seed: 30 tazkirah entries (April 2026) ────────────────────────────────────
-- display_date cycles by day-of-month: always query WHERE display_date = ('2026-04-' || LPAD((EXTRACT(DAY FROM CURRENT_DATE)::int - 1) % 30 + 1, 2, '0'))::date
INSERT INTO public.tazkirah (title, content_malay, theme, category, color, arabic_text, arabic_ref, muhasabah, hadis_ref, display_date) VALUES

('Kuasa Niat',
 'Setiap perbuatan bermula dari niat di dalam hati. Rasulullah ﷺ bersabda bahawa semua amalan dinilai berdasarkan niatnya, dan setiap orang mendapat balasan sesuai dengan apa yang diniatkan. Dengan memperbaharui niat setiap pagi, amalan harian yang biasa dapat bertukar menjadi ibadah yang bernilai tinggi di sisi Allah.',
 'Niat', 'Ibadat', '#102937',
 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
 'Hadis Riwayat al-Bukhari (no. 1)',
 'Apakah niatku hari ini — adakah ia benar-benar kerana Allah, atau ada unsur riya'' yang perlu dibersihkan?',
 'Hadis Riwayat al-Bukhari (no. 1) dan Muslim',
 '2026-04-01'),

('Nilai Waktu',
 'Allah bersumpah dengan masa dalam surah Al-''Asr — satu petanda betapa berharganya waktu. Ibn al-Qayyim berkata: "Masa adalah kehidupanmu, dan kehidupanmu adalah modal utamamu." Setiap saat yang berlalu tidak akan kembali, maka gunakanlah ia dengan iman, amal soleh, saling berpesan dengan kebenaran dan kesabaran.',
 'Masa', 'Kehidupan', '#7c3aed',
 'وَالْعَصْرِ ۞ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ۞ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
 'Surah Al-''Asr (103:1-3)',
 'Bagaimana aku akan mengisi masaku hari ini dengan sesuatu yang akan aku syukuri di hari akhirat nanti?',
 NULL,
 '2026-04-02'),

('Redha dengan Takdir',
 'Apa yang menimpa kita sudah ditakdirkan sebelum kita dilahirkan. Redha bukan bermakna kita tidak berusaha — ia bermakna kita menyerahkan keputusan akhir kepada Allah dengan hati yang tenang. Jiwa yang redha adalah jiwa yang paling kaya walaupun hartanya sedikit.',
 'Tawakkal', 'Akidah', '#0f766e',
 'وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
 'Surah Al-Baqarah (2:216)',
 'Adakah aku menerima ketentuan Allah dengan hati yang lapang, atau aku masih merungut terhadap apa yang telah berlaku?',
 NULL,
 '2026-04-03'),

('Keajaiban Sedekah',
 'Allah mengumpamakan sedekah seperti benih yang ditanam — satu biji menghasilkan tujuh bulir, setiap bulir pula mengandungi seratus biji. Nabi ﷺ bersabda bahawa sedekah tidak mengurangkan harta, malah ia membuka pintu rezeki dari arah yang tidak disangka-sangka. Mulailah dengan sedikit, kerana tidak ada sedekah yang terlalu kecil di sisi Allah.',
 'Sedekah', 'Muamalat', '#ca8a04',
 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ',
 'Surah Al-Baqarah (2:261)',
 'Apakah kebaikan kecil yang boleh aku berikan hari ini — kepada seseorang yang memerlukan, atau kepada masjid yang amanah?',
 'Hadis Riwayat Muslim (no. 2588)',
 '2026-04-04'),

('Kesabaran Itu Indah',
 'Sabar bukan tanda kelemahan — ia adalah kekuatan jiwa yang luar biasa. Allah bersama orang-orang yang sabar, bermakna pertolongan-Nya sentiasa dekat. Orang yang sabar bukan sekadar menanggung kesusahan, tetapi dia terus bersyukur, tidak mengadu selain kepada Allah, dan tidak berhenti berbuat baik walaupun dalam kesakitan.',
 'Sabar', 'Akhlak', '#1a6b52',
 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
 'Surah Al-Baqarah (2:153)',
 'Di mana dalam hidupku aku perlu lebih bersabar — dalam hubungan, dalam pekerjaan, atau dalam menanti jawapan doa?',
 NULL,
 '2026-04-05'),

('Jaga Lisan',
 'Nabi ﷺ bersabda: "Sesiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata yang baik atau diam." Lisan yang tidak dijaga boleh meruntuhkan amal soleh bertahun-tahun dalam sekelip mata. Sebaliknya, kata-kata yang lembut dan benar adalah sedekah yang paling mudah, namun sering kita abaikan.',
 'Lisan', 'Akhlak', '#9a3412',
 'قُل لِّعِبَادِي يَقُولُوا الَّتِي هِيَ أَحْسَنُ',
 'Surah Al-Isra'' (17:53)',
 'Pernahkah aku menyakiti hati seseorang dengan kata-kataku hari ini? Masih ada masa untuk memohon maaf.',
 'Hadis Riwayat al-Bukhari (no. 6018) dan Muslim',
 '2026-04-06'),

('Tanda Cinta kepada Allah',
 'Bukti cinta seorang hamba kepada Allah bukan sekadar di bibir — ia terletak pada sejauh mana dia mengikut jejak langkah Nabi ﷺ. Orang yang benar-benar mencintai Allah akan mencintai apa yang Allah cintai dan membenci apa yang Allah benci. Cinta ini mengubah cara dia makan, bercakap, bergaul, dan membuat keputusan.',
 'Mahabbah', 'Akidah', '#5b21b6',
 'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ',
 'Surah Ali ''Imran (3:31)',
 'Adakah cara hidupku hari ini — cara aku berbicara, bekerja, dan bergaul — mencerminkan seseorang yang benar-benar mencintai Allah?',
 NULL,
 '2026-04-07'),

('Kekuatan Doa',
 'Allah berfirman: "Berdoalah kepada-Ku, nescaya Aku perkenankan." Doa adalah senjata orang mukmin. Ia bukan sekadar permintaan — ia adalah pengakuan bahawa kita lemah dan Allah Maha Berkuasa. Jangan pernah meremehkan kekuatan doa yang dipanjatkan di sepertiga malam terakhir, ketika hati dalam keadaan paling jujur.',
 'Doa', 'Ibadat', '#0e7490',
 'ادْعُونِي أَسْتَجِبْ لَكُمْ',
 'Surah Ghafir (40:60)',
 'Berapa kerap aku benar-benar berdoa dengan penuh harap dan keyakinan, bukan sekadar rutiniti?',
 NULL,
 '2026-04-08'),

('Silaturahim: Pintu Rezeki',
 'Nabi ﷺ bersabda bahawa sesiapa yang ingin diluaskan rezekinya dan dipanjangkan umurnya, maka hendaklah dia menyambung silaturrahim. Menziarahi ibu bapa, menghubungi saudara-mara, dan mengucapkan salam kepada jiran adalah amalan mudah yang membawa berkat yang besar. Jangan tunggu majlis istimewa — hubungi mereka hari ini.',
 'Silaturahim', 'Muamalat', '#065f46',
 'وَاتَّقُوا اللَّهَ الَّذِي تَسَاءَلُونَ بِهِ وَالْأَرْحَامَ',
 'Surah An-Nisa'' (4:1)',
 'Siapakah ahli keluarga atau rakan lama yang sudah lama tidak aku hubungi, yang perlu aku hubungi hari ini?',
 'Hadis Riwayat al-Bukhari (no. 5985) dan Muslim',
 '2026-04-09'),

('Ilmu yang Bermanfaat',
 'Allah mengangkat darjat orang-orang yang beriman dan berilmu beberapa darjat. Tetapi ilmu yang paling berharga bukan sekadar yang tersimpan dalam fikiran — ia adalah ilmu yang mengubah perilaku, mendekatkan diri kepada Allah, dan memberi manfaat kepada orang lain. Tuntutlah ilmu dari buaian hingga ke liang lahad.',
 'Ilmu', 'Kehidupan', '#1e40af',
 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
 'Surah Al-Mujadila (58:11)',
 'Apakah yang aku pelajari hari ini yang membawaku lebih dekat kepada Allah dan lebih berguna kepada masyarakat?',
 NULL,
 '2026-04-10'),

('Sifat Malu: Mahkota Mukmin',
 'Rasa malu adalah sebahagian daripada iman. Orang yang tiada rasa malu akan mudah melakukan apa sahaja tanpa mengira batasan agama. Malu yang dimaksudkan bukan malu untuk berbuat baik atau bercakap benar, tetapi malu terhadap Allah apabila hendak melakukan maksiat — walaupun ketika bersendirian.',
 'Malu', 'Akhlak', '#4c1d95',
 NULL, NULL,
 'Adakah aku mempunyai rasa malu kepada Allah apabila aku bersendirian, sama seperti ketika bersama orang ramai?',
 'Hadis Riwayat al-Bukhari (no. 9): "Al-Haya'' min al-Iman"',
 '2026-04-11'),

('Zikir: Penawar Hati',
 'Allah berfirman bahawa dengan zikir kepada-Nya, hati menjadi tenteram. Dalam dunia yang penuh kekacauan dan kerisauan, zikir adalah ubat jiwa yang paling mujarab. Tidak perlu menunggu waktu tertentu — zikir boleh dilakukan sambil berjalan, bekerja, atau sebelum tidur. Lidah yang basah dengan zikir adalah lidah yang diberkati.',
 'Zikir', 'Ibadat', '#134e4a',
 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
 'Surah Ar-Ra''d (13:28)',
 'Berapa banyak zikir yang aku lafazkan hari ini dengan penuh kesedaran, bukan sekadar pergerakan bibir semata-mata?',
 NULL,
 '2026-04-12'),

('Taubat Nasuha: Pintu yang Sentiasa Terbuka',
 'Tidak ada dosa yang terlalu besar untuk diampunkan oleh Allah, selagi nafas masih ada. Allah memanggil hamba-Nya yang berdosa agar jangan berputus asa dari rahmat-Nya. Taubat nasuha bermakna menyesal dengan sungguh-sungguh, berhenti dari dosa itu, dan berazam untuk tidak mengulanginya. Setiap hari adalah peluang baru untuk membersihkan diri.',
 'Taubat', 'Ibadat', '#7f1d1d',
 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
 'Surah Az-Zumar (39:53)',
 'Adakah ada dosa lama yang masih membebani hatiku yang perlu aku lepaskan hari ini dengan taubat yang ikhlas?',
 NULL,
 '2026-04-13'),

('Syukur yang Benar',
 'Allah berjanji bahawa jika kita bersyukur, Dia pasti menambah nikmat. Namun syukur yang benar bukan sekadar kata-kata "Alhamdulillah" — ia adalah pengakuan hati bahawa segala nikmat datang dari Allah, lisan yang memuji-Nya, dan anggota badan yang menggunakan nikmat itu dalam ketaatan. Hitung nikmat kecil hari ini — ia lebih banyak dari yang kita sedar.',
 'Syukur', 'Akidah', '#854d0e',
 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
 'Surah Ibrahim (14:7)',
 'Apakah tiga nikmat hari ini yang sering aku ambil mudah namun sebenarnya merupakan anugerah Allah yang besar?',
 NULL,
 '2026-04-14'),

('Mengingati Mati',
 'Setiap jiwa pasti akan merasai mati. Mengingati mati bukan untuk menjadi murung, sebaliknya untuk mendorong kita mengisi setiap saat dengan amal yang bermakna. Nabi ﷺ bersabda: "Perbanyakkanlah mengingati pemutus segala kelazatan, iaitu maut." Kematian adalah pintu menuju kepada pertemuan dengan Allah.',
 'Mati', 'Akhirat', '#1e293b',
 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ',
 'Surah Ali ''Imran (3:185)',
 'Jika hari ini adalah hari terakhirku, apakah yang masih belum aku lakukan yang perlu aku selesaikan demi Allah?',
 'Hadis Riwayat at-Tirmidhi (no. 2307), Hasan',
 '2026-04-15'),

('Istiqamah: Amalan Kecil yang Berterusan',
 'Rasulullah ﷺ bersabda bahawa amalan yang paling dicintai Allah ialah amalan yang berterusan walaupun sedikit. Istiqamah tidak bermakna sempurna setiap masa — ia bermakna bangkit semula setiap kali kita terjatuh. Pohon yang berakar kukuh tidak mudah rebah dek angin ribut kehidupan.',
 'Istiqamah', 'Ibadat', '#0f4c81',
 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا',
 'Surah Fussilat (41:30)',
 'Apakah satu amalan soleh kecil yang boleh aku lakukan secara istiqamah setiap hari, bermula dari hari ini?',
 'Hadis Riwayat al-Bukhari (no. 6464) dan Muslim',
 '2026-04-16'),

('Al-Quran: Sumber Penawar',
 'Al-Quran diturunkan sebagai penawar bagi apa yang ada dalam dada — kerisauan, kesedihan, kekeliruan, dan kesakitan jiwa. Membaca Al-Quran dengan tadabbur (penghayatan) berbeza dengan sekadar melafazkan huruf. Setiap ayat menyimpan hikmah yang boleh mengubah perspektif dan menguatkan hati.',
 'Al-Quran', 'Ibadat', '#1e3a5f',
 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
 'Surah Al-Isra'' (17:82)',
 'Bilakah kali terakhir aku membaca Al-Quran dengan benar-benar memahami maknanya, bukan sekadar melepaskan tanggungjawab?',
 NULL,
 '2026-04-17'),

('Akhlak Nabi ﷺ: Teladan Abadi',
 'Allah mengiktiraf akhlak Nabi Muhammad ﷺ sebagai "agung" — satu pujian tertinggi dari Pencipta kepada makhluk-Nya. Sayyidah ''Aisyah menggambarkan akhlak Nabi ﷺ sebagai "Al-Quran yang berjalan." Setiap kali kita berdepan dengan situasi sukar, tanyakan: "Bagaimanakah Nabi ﷺ akan bertindak balas dalam keadaan ini?"',
 'Akhlak Nabi', 'Akhlak', '#312e81',
 'وَإِنَّكَ لَعَلَى خُلُقٍ عَظِيمٍ',
 'Surah Al-Qalam (68:4)',
 'Sifat mana dalam diri Nabi ﷺ yang paling aku perlukan untuk diterapkan dalam hidupku pada hari ini?',
 'Hadis Riwayat Muslim (no. 746): ''Aisyah r.a. berkata akhlak Nabi ﷺ adalah Al-Quran',
 '2026-04-18'),

('Kekuatan Istighfar',
 'Nabi Nuh a.s. menyeru kaumnya untuk beristighfar kepada Allah dengan janji bahawa Dia akan menurunkan hujan lebat, menambah kekuatan, memberi anak, kebun, dan sungai. Istighfar bukan sahaja menghapus dosa — ia membuka pintu rezeki, mengangkat bala, dan mendatangkan barakah dalam setiap urusan kehidupan.',
 'Istighfar', 'Ibadat', '#7c2d12',
 'اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا ۞ يُرْسِلِ السَّمَاءَ عَلَيْكُم مِّدْرَارًا',
 'Surah Nuh (71:10-11)',
 'Sudahkah aku beristighfar hari ini — bukan sahaja untuk dosaku sendiri, tetapi juga untuk keluarga, sahabat, dan seluruh umat Islam?',
 NULL,
 '2026-04-19'),

('Takwa: Bekalan Terbaik',
 'Takwa adalah perisai yang melindungi hati dari karat dosa dan penyakit jiwa. Allah menyeru kita agar berbekal dengan takwa kerana ia adalah sebaik-baik bekalan. Orang yang bertakwa melihat Allah dalam setiap tindakannya — bukan sekadar di masjid atau dalam solat, tetapi dalam setiap pilihan harian.',
 'Takwa', 'Akidah', '#14532d',
 'وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَى',
 'Surah Al-Baqarah (2:197)',
 'Bagaimanakah takwaku kepada Allah mempengaruhi keputusan yang aku buat hari ini — dalam perniagaan, dalam perbualan, dalam masa lapang?',
 NULL,
 '2026-04-20'),

('Ukhuwwah: Kekuatan Bersama',
 'Allah memerintahkan kita untuk mendamaikan saudara seIslam yang bertelingkah. Ukhuwwah islamiyyah bukan sekadar perasaan — ia adalah tanggungjawab: mengunjungi yang sakit, membantu yang susah, mendoakan yang ghaib, dan tidak menyakiti hati mereka dengan perkataan atau perbuatan.',
 'Ukhuwwah', 'Muamalat', '#1d4ed8',
 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ',
 'Surah Al-Hujurat (49:10)',
 'Adakah ada saudara seIslamku yang aku tahu sedang memerlukan bantuan atau sokongan moral hari ini yang perlu aku hubungi?',
 NULL,
 '2026-04-21'),

('Qana''ah: Kekayaan Jiwa',
 'Rasulullah ﷺ bersabda: "Bukanlah kaya itu banyak harta, tetapi kaya yang sebenar ialah kaya hati." Qana''ah bermakna merasa cukup dengan apa yang Allah beri tanpa menghentikan usaha untuk menjadi lebih baik. Insan yang qana''ah adalah insan yang bebas — bebas dari tekanan kemewahan dan juga tekanan kekurangan.',
 'Qana''ah', 'Kehidupan', '#78350f',
 NULL, NULL,
 'Adakah aku mensyukuri apa yang aku miliki hari ini, atau masih terperangkap dalam keinginan yang tidak berkesudahan?',
 'Hadis Riwayat al-Bukhari (no. 6446) dan Muslim (no. 1051)',
 '2026-04-22'),

('Husnuzon kepada Allah',
 'Dalam hadis qudsi yang mulia, Allah berfirman: "Aku mengikut sangkaan hamba-Ku terhadap-Ku." Ini bermakna jika kita bersangka baik bahawa Allah akan menolong, mengampunkan, dan memberikan yang terbaik, maka itulah yang akan kita dapati. Jangan biarkan ujian mengaburkan keyakinan bahawa Allah sentiasa merancang kebaikan untuk hamba-Nya.',
 'Husnuzon', 'Akidah', '#155e75',
 NULL, NULL,
 'Apakah sangkaanku terhadap Allah ketika menghadapi kesulitan hari ini — adakah ia sangkaan baik atau masih ada keraguan?',
 'Hadis Qudsi Riwayat al-Bukhari (no. 7505) dan Muslim',
 '2026-04-23'),

('Berbakti kepada Ibu Bapa',
 'Selepas kewajipan menyembah Allah, berbakti kepada ibu bapa adalah kewajipan tertinggi. Allah menyejajarkan keduanya dalam Al-Quran. Nabi ﷺ bersabda bahawa syurga berada di bawah telapak kaki ibu. Setiap hari yang mereka masih hidup adalah peluang emas yang tidak boleh disia-siakan.',
 'Ibu Bapa', 'Muamalat', '#166534',
 'وَقَضَى رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا',
 'Surah Al-Isra'' (17:23)',
 'Bilakah kali terakhir aku menghubungi ibu atau bapaku semata-mata untuk memberitahu bahawa aku menyayangi mereka?',
 'Hadis Riwayat an-Nasa''i (no. 3104), Sahih',
 '2026-04-24'),

('Tafakkur dalam Ciptaan Allah',
 'Orang-orang yang berakal (ulul albab) adalah mereka yang mengingati Allah dalam semua keadaan dan berfikir tentang ciptaan langit dan bumi. Perhatikan alam sekeliling — pergantian siang dan malam, kompleksiti tubuh manusia, keindahan alam semesta — semuanya adalah tanda-tanda yang menunjukkan kepada Pencipta Yang Maha Bijaksana.',
 'Tafakkur', 'Akidah', '#0f4c81',
 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ',
 'Surah Ali ''Imran (3:190)',
 'Adakah aku meluangkan masa hari ini untuk sekadar berhenti seketika dan merenung kebesaran Allah dalam ciptaan-Nya?',
 NULL,
 '2026-04-25'),

('Tawaduk: Sifat Hamba Allah',
 'Hamba-hamba Allah yang Maha Pemurah (Ibadur Rahman) berjalan di muka bumi dengan penuh kerendahan hati. Orang yang tawaduk bukan bermakna lemah atau merendah diri secara berlebihan — ia bermakna dia sedar bahawa segala kehebatan yang dia miliki adalah pinjaman dari Allah, dan Allah boleh mengambilnya bila-bila masa.',
 'Tawaduk', 'Akhlak', '#1e1b4b',
 'وَعِبَادُ الرَّحْمَنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
 'Surah Al-Furqan (25:63)',
 'Dalam situasi mana aku cenderung bersikap sombong atau rasa lebih baik dari orang lain, yang perlu aku selesaikan dengan tawaduk?',
 NULL,
 '2026-04-26'),

('Memaafkan: Kunci Ketenangan',
 'Allah suka kepada orang yang memaafkan. Menahan kemarahan dan memaafkan orang yang menyakiti kita adalah antara ciri-ciri orang bertakwa. Memaafkan bukan untuk kebaikan orang yang bersalah — ia untuk membebaskan diri kita sendiri dari beban kebencian yang meracuni jiwa.',
 'Memaafkan', 'Akhlak', '#059669',
 'وَلْيَعْفُوا وَلْيَصْفَحُوا أَلَا تُحِبُّونَ أَن يَغْفِرَ اللَّهُ لَكُمْ',
 'Surah An-Nur (24:22)',
 'Adakah ada seseorang yang telah menyakiti hatiku yang perlu aku maafkan hari ini demi ketenangan jiwa dan rahmat Allah?',
 NULL,
 '2026-04-27'),

('Rezeki dari Allah',
 'Tidak ada satu makhluk pun di muka bumi melainkan Allah yang menanggung rezekinya. Rezeki bukan semata-mata wang — ia merangkumi kesihatan, keluarga, ilmu, masa, dan ketenangan jiwa. Usaha adalah kewajipan kita, tetapi ketentuan hasil adalah hak Allah. Percayalah pada-Nya, kerana Dia tidak pernah ingkar janji.',
 'Rezeki', 'Tawakkal', '#78350f',
 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا',
 'Surah Hud (11:6)',
 'Adakah aku telah berusaha dengan sungguh-sungguh hari ini dan kemudian menyerahkan hasilnya kepada Allah dengan penuh tawakkal?',
 NULL,
 '2026-04-28'),

('Ikhlas: Roh Setiap Amalan',
 'Ikhlas bermakna melakukan amalan semata-mata kerana Allah, bukan kerana ingin dipuji, ditakuti, atau disanjungi. Imam al-Fudhayl berkata: "Meninggalkan amalan kerana manusia adalah riya'', dan beramal kerana manusia adalah syirik. Ikhlas itu apabila Allah sahaja yang membuatmu beramal." Satu amalan yang ikhlas lebih bernilai dari seribu amalan yang penuh riya''.',
 'Ikhlas', 'Ibadat', '#1e3a5f',
 'وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ',
 'Surah Al-Bayyinah (98:5)',
 'Apakah amalan yang aku lakukan hari ini yang perlu aku periksa semula niatnya — adakah ia benar-benar ikhlas untuk Allah?',
 NULL,
 '2026-04-29'),

('Persediaan untuk Akhirat',
 'Kehidupan dunia ibarat seorang musafir yang berehat sebentar di bawah pokok sebelum meneruskan perjalanan. Tujuan sebenar adalah akhirat — dan setiap amalan, kata-kata, dan niat hari ini akan menjadi teman di sana. Bangunkan akhiratmu seperti engkau akan hidup selama-lamanya, dan kerjakanlah duniamu seperti engkau akan mati esok.',
 'Akhirat', 'Kehidupan', '#0f172a',
 'وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ',
 'Surah Ali ''Imran (3:185)',
 'Apakah satu pelaburan akhirat yang boleh aku buat hari ini — ilmu yang disebarkan, doa yang dipanjatkan, atau kebaikan yang dilakukan?',
 'Hadis Riwayat Ibn Majah (no. 4259): "Bekerjalah untuk duniamu..."',
 '2026-04-30');
