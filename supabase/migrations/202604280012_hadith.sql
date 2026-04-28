-- ============================================================
-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.get_hadith_harian();
--   DROP TABLE IF EXISTS public.hadith_shares CASCADE;
--   DROP TABLE IF EXISTS public.hadith CASCADE;
-- ============================================================

-- ── hadith ────────────────────────────────────────────────────────────────────
CREATE TABLE public.hadith (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number       int  NOT NULL UNIQUE CHECK (number BETWEEN 1 AND 50),
  theme        text NOT NULL,
  source       text NOT NULL,
  arabic_text  text NOT NULL,
  malay_text   text NOT NULL,
  english_text text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hadith ENABLE ROW LEVEL SECURITY;

-- Authenticated and anonymous users can read (needed for share links)
CREATE POLICY "hadith_select_auth" ON public.hadith
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "hadith_select_anon" ON public.hadith
  FOR SELECT TO anon USING (true);

-- ── get_hadith_harian() ───────────────────────────────────────────────────────
-- Returns the calling user's hadith for today.
-- Algorithm: (abs(hashtext(user_id)) + days_since_epoch) % 50 + 1
-- This gives each user a unique daily rotation offset so different users
-- see different hadith on the same day, and every user sees a new hadith daily.
CREATE OR REPLACE FUNCTION public.get_hadith_harian()
RETURNS TABLE (
  id           uuid,
  number       int,
  theme        text,
  source       text,
  arabic_text  text,
  malay_text   text,
  english_text text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT h.id, h.number, h.theme, h.source, h.arabic_text, h.malay_text, h.english_text
  FROM   public.hadith h
  WHERE  h.number = (
    (
      (abs(hashtext(auth.uid()::text))::bigint
       + (EXTRACT(EPOCH FROM CURRENT_DATE)::bigint / 86400))
      % 50
    )::int + 1
  );
$$;

-- ── hadith_shares ─────────────────────────────────────────────────────────────
CREATE TABLE public.hadith_shares (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  hadith_id  uuid        NOT NULL REFERENCES public.hadith ON DELETE CASCADE,
  platform   text        CHECK (platform IN ('whatsapp', 'telegram', 'twitter', 'copy', 'other')),
  shared_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hadith_shares ENABLE ROW LEVEL SECURITY;

-- Users can insert and read their own shares
CREATE POLICY "hadith_shares_own" ON public.hadith_shares
  FOR ALL TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ── Seed: 50 hadith ──────────────────────────────────────────────────────────
INSERT INTO public.hadith (number, theme, source, arabic_text, malay_text, english_text) VALUES

(1, 'Niat & Ikhlas', 'Sahih al-Bukhari No. 1',
 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
 'Sesungguhnya setiap amalan itu bergantung kepada niat, dan sesungguhnya setiap orang mendapat apa yang diniatkan.',
 'Actions are judged by intentions, and every person will get what they intended.'),

(2, 'Akhlak & Komuniti', 'Sahih al-Bukhari No. 10',
 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
 'Seorang Muslim ialah orang yang kaum Muslimin selamat dari gangguan lidah dan tangannya.',
 'A Muslim is the one from whose tongue and hand other Muslims are safe.'),

(3, 'Ukhuwwah', 'Sahih al-Bukhari No. 13',
 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
 'Tidaklah sempurna iman seseorang di antara kamu sehingga dia mencintai untuk saudaranya apa yang dia cintai untuk dirinya sendiri.',
 'None of you truly believes until he loves for his brother what he loves for himself.'),

(4, 'Nasihat & Tarbiyah', 'Sahih Muslim No. 55',
 'الدِّينُ النَّصِيحَةُ',
 'Agama itu ialah nasihat yang ikhlas.',
 'The religion is sincere advice (nasihah).'),

(5, 'Akhlak & Percakapan', 'Sahih al-Bukhari No. 6018',
 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
 'Barangsiapa beriman kepada Allah dan Hari Akhirat, hendaklah dia berkata yang baik atau diam.',
 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.'),

(6, 'Istiqamah', 'Sahih al-Bukhari No. 6464',
 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
 'Amalan yang paling disukai Allah ialah yang paling berterusan walaupun sedikit.',
 'The most beloved deeds to Allah are those that are most regular, even if they are few.'),

(7, 'Bersuci & Solat', 'Sahih Muslim No. 223',
 'الطَّهُورُ شَطْرُ الإِيمَانِ',
 'Kebersihan adalah separuh daripada iman.',
 'Cleanliness is half of faith.'),

(8, 'Al-Quran & Ilmu', 'Sahih al-Bukhari No. 5027',
 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
 'Sebaik-baik kamu adalah orang yang mempelajari al-Quran dan mengajarkannya.',
 'The best of you are those who learn the Quran and teach it.'),

(9, 'Ilmu & Tarbiyah', 'Sahih Muslim No. 2699',
 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
 'Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan memudahkan baginya jalan menuju syurga.',
 'Whoever travels a path in search of knowledge, Allah will make easy for him a path to Paradise.'),

(10, 'Solat', 'Sahih Muslim No. 233',
 'الصَّلَوَاتُ الْخَمْسُ وَالْجُمُعَةُ إِلَى الْجُمُعَةِ كَفَّارَةٌ لِمَا بَيْنَهُنَّ',
 'Solat lima waktu dan solat Jumaat ke Jumaat berikutnya adalah penghapus dosa antara keduanya.',
 'The five daily prayers and Jumuah to Jumuah are expiation for what comes between them.'),

(11, 'Sedekah & Amal Jariah', 'Sahih Muslim No. 1631',
 'إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ',
 'Apabila seseorang meninggal dunia, amalannya terputus kecuali tiga perkara: sedekah jariah, ilmu yang bermanfaat, atau anak yang soleh yang mendoakannya.',
 'When a person dies, his deeds come to an end except for three: ongoing charity, knowledge that is benefited from, or a righteous child who prays for him.'),

(12, 'Ukhuwwah & Komuniti', 'Sahih Muslim No. 2586',
 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ',
 'Perumpamaan orang-orang beriman dalam kasih sayang dan belas kasihan mereka seperti satu jasad: apabila satu anggota sakit, seluruh jasad ikut berjaga dan merasai demam.',
 'The example of the believers in their mutual love, mercy and compassion is that of one body: if one part aches, the whole body responds with fever and sleeplessness.'),

(13, 'Ukhuwwah & Keadilan', 'Sahih al-Bukhari No. 2443',
 'انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا',
 'Tolonglah saudaramu sama ada dia zalim atau dizalimi (dengan menghentikannya dari kezaliman).',
 'Help your brother whether he is an oppressor or the one being oppressed (by stopping him from oppressing).'),

(14, 'Akhlak & Syukur', 'Sunan Abi Dawud No. 4811 (Sahih)',
 'مَنْ لَمْ يَشْكُرِ النَّاسَ لَمْ يَشْكُرِ اللَّهَ',
 'Orang yang tidak berterima kasih kepada manusia tidak bersyukur kepada Allah.',
 'He who does not thank people does not thank Allah.'),

(15, 'Akhlak & Kelembutan', 'Sahih al-Bukhari No. 6927',
 'إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ',
 'Sesungguhnya Allah itu Maha Lembut dan mencintai kelembutan dalam segala urusan.',
 'Verily, Allah is gentle and He loves gentleness in all matters.'),

(16, 'Sedekah & Kebaikan', 'Sahih al-Bukhari No. 6021',
 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
 'Setiap kebaikan adalah sedekah.',
 'Every act of kindness is charity (sadaqah).'),

(17, 'Sedekah', 'Sahih al-Bukhari No. 1419',
 'أَفْضَلُ الصَّدَقَةِ أَنْ تَصَدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ',
 'Sedekah yang terbaik ialah yang kamu berikan ketika kamu sihat dan takut kemiskinan.',
 'The best charity is that which you give while you are healthy and fearful of poverty.'),

(18, 'Kekuatan Iman', 'Sahih Muslim No. 2664',
 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ',
 'Mukmin yang kuat lebih baik dan lebih dicintai Allah daripada mukmin yang lemah.',
 'The strong believer is better and more beloved to Allah than the weak believer.'),

(19, 'Solat Subuh', 'Sahih Muslim No. 657',
 'مَنْ صَلَّى الْفَجْرَ فَهُوَ فِي ذِمَّةِ اللَّهِ',
 'Barangsiapa menunaikan solat Subuh, maka dia berada dalam perlindungan Allah.',
 'Whoever prays Fajr is under the protection of Allah.'),

(20, 'Khidmat & Komuniti', 'Tabarani, Al-Mu''jam al-Kabir (Sahih)',
 'لأَنْ يَمْشِيَ أَحَدُكُمْ فِي حَاجَةِ أَخِيهِ خَيْرٌ لَهُ مِنْ أَنْ يَعْتَكِفَ فِي مَسْجِدِي هَذَا شَهْرًا',
 'Seseorang berjalan untuk memenuhi keperluan saudaranya adalah lebih baik baginya daripada beriktikaf di masjidku ini selama sebulan.',
 'For one of you to walk in service of his brother''s need is better for him than performing i''tikaf in my mosque for a month.'),

(21, 'Solat Berjemaah', 'Sahih al-Bukhari No. 657',
 'إِنَّ أَثْقَلَ صَلاَةٍ عَلَى الْمُنَافِقِينَ صَلاَةُ الْعِشَاءِ وَصَلاَةُ الْفَجْرِ',
 'Sesungguhnya solat yang paling berat ke atas orang munafik ialah solat Isyak dan solat Subuh, namun jika mereka tahu pahalanya nescaya mereka datang walaupun merangkak.',
 'The heaviest prayers for the hypocrites are Isha and Fajr, yet if they knew the reward they would come even crawling.'),

(22, 'Solat Berjemaah', 'Sahih al-Bukhari No. 647',
 'صَلاَةُ الرَّجُلِ فِي جَمَاعَةٍ تُضَعَّفُ عَلَى صَلاَتِهِ فِي بَيْتِهِ وَفِي سُوقِهِ خَمْسًا وَعِشْرِينَ ضِعْفًا',
 'Solat seseorang berjemaah melebihi solatnya di rumah atau di kedainya sebanyak dua puluh lima kali ganda.',
 'A man''s prayer in congregation is twenty-five times more excellent than his prayer in his house or his shop.'),

(23, 'Masjid', 'Sahih al-Bukhari No. 450',
 'مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ',
 'Barangsiapa membina masjid kerana Allah, nescaya Allah akan membina untuknya sebuah rumah yang serupa di syurga.',
 'Whoever builds a mosque for Allah, Allah will build for him a similar house in Paradise.'),

(24, 'Tauhid & Kalimah Syahadah', 'Sunan Abi Dawud No. 3116 (Sahih)',
 'مَنْ كَانَ آخِرُ كَلاَمِهِ لاَ إِلَهَ إِلاَّ اللَّهُ دَخَلَ الْجَنَّةَ',
 'Barangsiapa yang kata-kata terakhirnya adalah ''Tiada tuhan selain Allah'', dia akan masuk syurga.',
 'Whoever''s last words are ''La ilaha illallah'' will enter Paradise.'),

(25, 'Persahabatan & Ukhuwwah', 'Jami'' at-Tirmidhi No. 1944 (Sahih)',
 'خَيْرُ الأَصْحَابِ عِنْدَ اللَّهِ خَيْرُهُمْ لِصَاحِبِهِ',
 'Sebaik-baik sahabat di sisi Allah ialah yang paling baik kepada sahabatnya.',
 'The best of companions in the sight of Allah is the one who is best to his companion.'),

(26, 'Hormat Ibu Bapa', 'Sahih al-Bukhari No. 5973',
 'إِنَّ مِنْ أَكْبَرِ الْكَبَائِرِ أَنْ يَلْعَنَ الرَّجُلُ وَالِدَيْهِ',
 'Termasuk dosa-dosa besar yang paling besar ialah seseorang melaknat kedua orang tuanya.',
 'Among the greatest of major sins is for a man to curse his own parents.'),

(27, 'Hormat Ibu Bapa', 'Sunan an-Nasa''i No. 3104 (Sahih)',
 'الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ',
 'Syurga itu di bawah telapak kaki ibu.',
 'Paradise lies under the feet of mothers.'),

(28, 'Kasih Sayang & Rahmat', 'Jami'' at-Tirmidhi No. 1924 (Sahih)',
 'الرَّاحِمُونَ يَرْحَمُهُمُ الرَّحْمَنُ ارْحَمُوا مَنْ فِي الأَرْضِ يَرْحَمْكُمْ مَنْ فِي السَّمَاءِ',
 'Orang-orang yang penyayang akan disayangi oleh Yang Maha Penyayang. Sayangilah siapa yang ada di bumi, nescaya Yang di langit akan menyayangimu.',
 'The merciful will be shown mercy by the Most Merciful. Be merciful to those on earth and the One above the heavens will have mercy upon you.'),

(29, 'Sedekah & Kemurahan Hati', 'Sahih al-Bukhari No. 1429',
 'الْيَدُ الْعُلْيَا خَيْرٌ مِنَ الْيَدِ السُّفْلَى',
 'Tangan yang di atas lebih baik daripada tangan yang di bawah (yakni tangan yang memberi lebih baik daripada tangan yang menerima).',
 'The upper hand is better than the lower hand (i.e. the giving hand is better than the receiving hand).'),

(30, 'Keikhlasan & Hati', 'Sahih Muslim No. 2564',
 'إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
 'Sesungguhnya Allah tidak melihat rupa paras dan harta kamu, tetapi Dia melihat hati dan amalan kamu.',
 'Indeed, Allah does not look at your appearance or wealth, but He looks at your hearts and deeds.'),

(31, 'Perdamaian & Komuniti', 'Sunan Abi Dawud No. 4919 (Sahih)',
 'أَلاَ أُخْبِرُكُمْ بِأَفْضَلَ مِنْ دَرَجَةِ الصِّيَامِ وَالصَّلاَةِ وَالصَّدَقَةِ؟ إِصْلاَحُ ذَاتِ الْبَيْنِ',
 'Mahukah kamu aku beritahu tentang sesuatu yang lebih utama darjatnya dari puasa, solat dan sedekah? Iaitu mendamaikan hubungan antara manusia.',
 'Shall I not tell you of something better in degree than fasting, prayer and charity? Making peace between people.'),

(32, 'Jiran & Komuniti', 'Sahih Muslim No. 46',
 'لاَ يَدْخُلُ الْجَنَّةَ مَنْ لاَ يَأْمَنُ جَارُهُ بَوَائِقَهُ',
 'Tidak akan masuk syurga orang yang jirannya tidak selamat dari kejahatannya.',
 'He will not enter Paradise from whose harm his neighbour is not safe.'),

(33, 'Bantu-Membantu', 'Sahih Muslim No. 2699',
 'مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ',
 'Barangsiapa meringankan kesusahan seorang mukmin di dunia, Allah akan meringankan kesusahannya pada hari kiamat.',
 'Whoever relieves a believer of a hardship in this world, Allah will relieve him of a hardship on the Day of Resurrection.'),

(34, 'Cinta kepada Allah', 'Sahih al-Bukhari No. 6507',
 'مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ',
 'Barangsiapa yang suka berjumpa Allah, Allah pun suka berjumpa dengannya.',
 'Whoever loves to meet Allah, Allah loves to meet him.'),

(35, 'Solat & Sujud', 'Sahih Muslim No. 482',
 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ',
 'Keadaan seorang hamba yang paling dekat kepada Tuhannya ialah ketika dia bersujud.',
 'The closest a servant can be to his Lord is when he is in prostration (sujud).'),

(36, 'Al-Quran', 'Jami'' at-Tirmidhi No. 2910 (Sahih)',
 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
 'Barangsiapa membaca satu huruf dari Kitab Allah, baginya satu kebaikan, dan satu kebaikan itu digandakan sepuluh kali.',
 'Whoever reads one letter from the Book of Allah will have one good deed, and one good deed is multiplied ten times over.'),

(37, 'Al-Quran', 'Sahih Muslim No. 817',
 'إِنَّ اللَّهَ يَرْفَعُ بِهَذَا الْكِتَابِ أَقْوَامًا وَيَضَعُ بِهِ آخَرِينَ',
 'Sesungguhnya Allah mengangkat darjat sesetengah kaum dengan kitab ini dan merendahkan darjat kaum yang lain dengannya.',
 'Verily, Allah elevates some people with this Book and degrades others with it.'),

(38, 'Hak Muslim & Komuniti', 'Sahih Muslim No. 2162',
 'حَقُّ الْمُسْلِمِ عَلَى الْمُسْلِمِ سِتٌّ',
 'Hak seorang Muslim ke atas Muslim lain ada enam: ucapkan salam ketika berjumpa, perkenankan undangannya, nasihatilah dia dengan ikhlas, doakan apabila dia bersin, ziarahilah ketika sakit, dan iringilah jenazahnya.',
 'The rights of a Muslim upon another Muslim are six: greet him when you meet him, accept his invitation, advise him sincerely, say yarhamukallah when he sneezes, visit him when he is sick, and follow his funeral.'),

(39, 'Salam & Ukhuwwah', 'Sahih Muslim No. 54',
 'أَفْشُوا السَّلاَمَ بَيْنَكُمْ',
 'Sebarluaskanlah salam di antara kamu.',
 'Spread the greeting of peace (salam) among yourselves.'),

(40, 'Ukhuwwah & Komuniti', 'Sahih Muslim No. 2563',
 'لاَ تَحَاسَدُوا وَلاَ تَنَاجَشُوا وَلاَ تَبَاغَضُوا وَلاَ تَدَابَرُوا وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا',
 'Janganlah kamu saling dengki, janganlah saling menipu, janganlah saling benci, janganlah saling berpaling, dan jadilah hamba-hamba Allah yang bersaudara.',
 'Do not envy one another, do not outbid one another, do not hate one another, do not turn away from one another, and be servants of Allah as brothers.'),

(41, 'Akhlak & Sedekah', 'Jami'' at-Tirmidhi No. 1956 (Sahih)',
 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
 'Senyumanmu di hadapan saudaramu adalah sedekah.',
 'Your smile for your brother is a charity.'),

(42, 'Taqwa & Akhlak', 'Jami'' at-Tirmidhi No. 1987 (Sahih)',
 'اتَّقُوا اللَّهَ حَيْثُمَا كُنْتَ وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
 'Bertakwalah kepada Allah di mana sahaja kamu berada, ikutilah kejahatan dengan kebaikan nescaya ia menghapusnya, dan bergaullah dengan manusia dengan akhlak yang baik.',
 'Fear Allah wherever you are, follow a bad deed with a good deed and it will erase it, and treat people with good character.'),

(43, 'Ramadan & Puasa', 'Sahih al-Bukhari No. 38',
 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
 'Barangsiapa berpuasa Ramadan dengan penuh keimanan dan mengharap pahala, akan diampunkan dosanya yang telah lalu.',
 'Whoever fasts Ramadan out of faith and hoping for reward, his previous sins will be forgiven.'),

(44, 'Ramadan & Puasa', 'Sahih al-Bukhari No. 7492',
 'لِلصَّائِمِ فَرْحَتَانِ: فَرْحَةٌ عِنْدَ فِطْرِهِ وَفَرْحَةٌ عِنْدَ لِقَاءِ رَبِّهِ',
 'Orang yang berpuasa mempunyai dua kegembiraan: satu ketika berbuka puasa dan satu lagi ketika berjumpa Tuhannya.',
 'The fasting person has two moments of joy: one when he breaks his fast, and one when he meets his Lord.'),

(45, 'Ramadan & Lailatul Qadar', 'Sahih al-Bukhari No. 1901',
 'مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
 'Barangsiapa mendirikan solat pada Malam Lailatul Qadar dengan penuh keimanan dan mengharap pahala, akan diampunkan dosanya yang telah lalu.',
 'Whoever stands in prayer on Laylatul Qadr out of faith and seeking reward, his previous sins will be forgiven.'),

(46, 'Doa & Zikir', 'Sahih al-Bukhari No. 6306 (Sayyid al-Istighfar)',
 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ',
 'Ya Allah, Engkau adalah Tuhanku. Tiada tuhan selain Engkau. Engkau menciptakanku dan aku adalah hamba-Mu.',
 'O Allah, You are my Lord. There is no deity but You. You created me and I am Your servant.'),

(47, 'Zikir & Tasbih', 'Sahih al-Bukhari No. 6405',
 'مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِئَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ',
 'Barangsiapa membaca ''Subhanallahi wa bihamdih'' seratus kali sehari, dosa-dosanya akan dihapuskan walaupun sebanyak buih lautan.',
 'Whoever says ''Subhanallahi wa bihamdih'' one hundred times in a day, his sins will be wiped away even if they were like the foam of the sea.'),

(48, 'Doa & Syukur', 'Jami'' at-Tirmidhi No. 3458 (Hasan)',
 'مَنْ أَكَلَ طَعَامًا فَقَالَ الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
 'Barangsiapa makan makanan kemudian membaca ''Alhamdulillah alladhi at''amani hadha wa razaqanihi'', akan diampunkan dosanya yang telah lalu.',
 'Whoever eats food and then says Alhamdulillah alladhi at''amani hadha wa razaqanihi will be forgiven his past sins.'),

(49, 'Sedekah', 'Jami'' at-Tirmidhi No. 2616 (Sahih)',
 'الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ',
 'Sedekah memadamkan dosa seperti air memadamkan api.',
 'Charity extinguishes sin just as water extinguishes fire.'),

(50, 'Sedekah & Kebaikan', 'Sahih al-Bukhari No. 2989',
 'كُلُّ سُلاَمَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ',
 'Setiap sendi tubuh manusia wajib bersedekah setiap hari matahari terbit: berlaku adil antara dua orang adalah sedekah, membantu seseorang dengan kenderaannya adalah sedekah, kata-kata yang baik adalah sedekah, setiap langkah menuju solat adalah sedekah, dan menyingkirkan gangguan dari jalan adalah sedekah.',
 'Every joint of a person must perform a charity every day the sun rises: being just between two people is charity, helping someone with their mount is charity, a good word is charity, every step taken towards prayer is charity, and removing harm from the road is charity.');
