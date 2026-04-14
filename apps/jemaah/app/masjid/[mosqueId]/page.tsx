import type { Metadata } from 'next'
import { MosqueProfileShell } from './MosqueProfileShell'
import type { MosqueProfile, Announcement, DoaWish, JanaizEntry, Program, JadualEntry } from './MosqueProfileShell'

/* ─── Metadata ───────────────────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mosqueId: string }>
}): Promise<Metadata> {
  // TODO: fetch real mosque name from Supabase
  await params
  return {
    title: 'Profil Masjid',
  }
}

/* ─── Mock data ──────────────────────────────────────────────────────────── */

const MOCK_MOSQUE: MosqueProfile = {
  id: 'masjid-al-falah-damansara',
  name: 'Masjid Al-Falah Damansara',
  address: 'Jalan SS 22/23, Damansara Jaya, 47400 Petaling Jaya, Selangor',
  phone: '+603-7728 3456',
  website: 'alfalah.com.my',
  zone_code: 'SGR01',
  jemaah_count: 1247,
  announcements_this_month: 8,
  is_following: false,
  theme: {
    primary: '#1B3A5C',
    accent: '#D4943A',
    logo_url: null,
    banner_url: null,
  },
}

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Ceramah Agama: Keutamaan Bulan Rejab',
    body: 'Jemputan kepada seluruh jemaah untuk hadir ceramah agama bertajuk "Keutamaan Bulan Rejab" pada 15 April 2026 jam 8.30 malam selepas solat Isyak. Penceramah jemputan: Ustaz Dr. Mohd Hafiz Ibrahim dari UIAM. Hadir ramai-ramai.',
    published_at: '2026-04-13T14:00:00Z',
    category: 'Aktiviti',
  },
  {
    id: 'ann-2',
    title: 'Gotong-Royong Bulanan — Sabtu Ini',
    body: 'Program gotong-royong bulanan masjid akan diadakan pada Sabtu, 19 April 2026 bermula jam 7.30 pagi. Semua jemaah dijemput hadir bagi memastikan kebersihan masjid terpelihara. Sarapan pagi disediakan.',
    published_at: '2026-04-11T09:00:00Z',
    category: 'Am',
  },
  {
    id: 'ann-3',
    title: 'Peringatan: Yuran Kariah 2026',
    body: 'Jemaah yang belum menyelesaikan yuran kariah bagi tahun 2026 diminta berbuat demikian sebelum 30 April 2026. Pembayaran boleh dibuat di pejabat masjid (Isnin–Sabtu, 9am–4pm) atau melalui perbankan dalam talian. Terima kasih atas kerjasama anda.',
    published_at: '2026-04-08T10:00:00Z',
    category: 'Kewangan',
  },
  {
    id: 'ann-4',
    title: 'Kelas Tajwid — Pendaftaran Dibuka',
    body: 'Kelas Tajwid untuk dewasa kini dibuka pendaftaran. Sesi setiap Rabu malam jam 9.00 malam. Terhad kepada 20 penyertaan sahaja. Hubungi pejabat masjid untuk maklumat lanjut.',
    published_at: '2026-04-05T08:00:00Z',
    category: 'Aktiviti',
  },
  {
    id: 'ann-5',
    title: 'PENTING: Penggantian Imam Baru',
    body: 'Dengan sukacitanya dimaklumkan bahawa Ustaz Hj. Muhammad Fauzi bin Ahmad dilantik sebagai Imam Baru Masjid Al-Falah mulai 1 Mei 2026. Semoga perlantikan ini membawa keberkatan kepada seluruh jemaah.',
    published_at: '2026-04-02T07:00:00Z',
    category: 'Penting',
  },
]

const MOCK_DOA_WISHES: DoaWish[] = [
  {
    id: 'doa-1',
    doa_text: 'Ya Allah, permudahkanlah urusan kami dalam mencari rezeki yang halal dan diredhai-Mu. Jauhkanlah kami dari segala kesempitan dan berikanlah kami keluasan dalam setiap perkara.',
    is_anonymous: false,
    display_name: 'Ahmad Firdaus',
    aamiin_count: 47,
    user_has_aamined: false,
    created_at: '2026-04-14T07:30:00Z',
  },
  {
    id: 'doa-2',
    doa_text: 'Mohon doa untuk ibu saya yang sedang sakit di hospital. Semoga Allah memberikan kesembuhan dan kekuatan kepadanya. Aamiin ya Rabbal Alamin.',
    is_anonymous: false,
    display_name: 'Nur Hidayah',
    aamiin_count: 89,
    user_has_aamined: true,
    created_at: '2026-04-13T20:15:00Z',
  },
  {
    id: 'doa-3',
    doa_text: 'Ya Allah, peliharalah anak-anak kami dari segala kejahatan dan fitnah dunia. Jadikanlah mereka anak-anak yang soleh dan solehah, pewaris syurga-Mu.',
    is_anonymous: true,
    display_name: null,
    aamiin_count: 132,
    user_has_aamined: false,
    created_at: '2026-04-13T15:00:00Z',
  },
  {
    id: 'doa-4',
    doa_text: 'Doakan saya yang bakal menduduki peperiksaan minggu hadapan. Semoga Allah permudahkan dan berikan kejayaan yang cemerlang. Bismillah.',
    is_anonymous: false,
    display_name: 'Muhammad Irfan',
    aamiin_count: 61,
    user_has_aamined: false,
    created_at: '2026-04-12T19:45:00Z',
  },
  {
    id: 'doa-5',
    doa_text: 'Ya Allah, kurniakanlah kami zuriat yang soleh dan solehah. Jadikanlah rumah tangga kami penuh dengan kasih sayang dan kebahagiaan yang berkekalan.',
    is_anonymous: true,
    display_name: null,
    aamiin_count: 204,
    user_has_aamined: false,
    created_at: '2026-04-11T10:20:00Z',
  },
]

const MOCK_JANAIZ: JanaizEntry[] = [
  {
    id: 'jnz-1',
    arwah_name: 'Allahyarham Hj. Mohd Tahir bin Abdullah',
    age: 78,
    date_passed: '2026-04-13T23:45:00Z',
    solat_jenazah_time: '2026-04-14T09:00:00Z',
    jenazah_location: 'Masjid Al-Falah Damansara, Jalan SS 22/23',
    notes: 'Dikebumikan di Tanah Perkuburan Islam Damansara. Semoga Allah merahmatinya.',
  },
  {
    id: 'jnz-2',
    arwah_name: 'Allahyarhamah Puan Zainab binti Ismail',
    age: 65,
    date_passed: '2026-04-11T04:20:00Z',
    solat_jenazah_time: '2026-04-11T13:30:00Z',
    jenazah_location: 'Masjid Al-Falah Damansara',
    notes: null,
  },
  {
    id: 'jnz-3',
    arwah_name: 'Allahyarham Encik Roslan bin Mahmud',
    age: 52,
    date_passed: '2026-04-07T16:10:00Z',
    solat_jenazah_time: '2026-04-08T09:30:00Z',
    jenazah_location: 'Masjid Subang Jaya (atas permintaan keluarga)',
    notes: 'Dikebumikan di Tanah Perkuburan Islam Seksyen 12, Shah Alam.',
  },
]

const MOCK_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    title: 'Ceramah Perdana: Keutamaan Malam Nisfu Syaaban',
    description: 'Ceramah khas sempena malam Nisfu Syaaban bersama Ustaz Dr. Mohd Hafiz Ibrahim. Terbuka untuk semua jemaah, keluarga dan sahabat handai.',
    event_date: '2026-04-16T20:30:00Z',
    event_time: '8:30 PM',
    location: 'Dewan Utama Masjid Al-Falah',
    image_url: null,
    category: 'Ceramah',
  },
  {
    id: 'prog-2',
    title: 'Kursus Fardu Ain — Siri 3',
    description: 'Kursus Fardu Ain untuk dewasa merangkumi bab Thaharah, Solat dan Puasa. Sijil penyertaan diberikan. Daftar di pejabat masjid.',
    event_date: '2026-04-19T09:00:00Z',
    event_time: '9:00 AM – 5:00 PM',
    location: 'Bilik Kuliah Masjid Al-Falah',
    image_url: null,
    category: 'Kursus',
  },
  {
    id: 'prog-3',
    title: 'Gotong-Royong Bulanan',
    description: 'Program gotong-royong bulanan masjid. Sarapan pagi disediakan. Semua jemaah dijemput hadir.',
    event_date: '2026-04-19T07:30:00Z',
    event_time: '7:30 AM',
    location: 'Kawasan Masjid Al-Falah',
    image_url: null,
    category: 'Aktiviti',
  },
  {
    id: 'prog-4',
    title: 'Majlis Sambutan Maulidur Rasul',
    description: 'Sambutan Maulidur Rasul peringkat kariah dengan bacaan selawat, nasyid dan ceramah ringkas. Jemputan terbuka.',
    event_date: '2026-05-06T08:00:00Z',
    event_time: '8:00 PM',
    location: 'Dewan Utama Masjid Al-Falah',
    image_url: null,
    category: 'Majlis',
  },
]

// Helper to get YYYY-MM-DD for N days from today
function dateOffset(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const MOCK_JADUAL: JadualEntry[] = [
  // Today
  { id: 'j1',  date: dateOffset(0), prayer: 'subuh',   role: 'imam',   officer_name: 'Ustaz Hj. Fauzi Ahmad',     notes: null },
  { id: 'j2',  date: dateOffset(0), prayer: 'subuh',   role: 'bilal',  officer_name: 'Encik Razali Hamid',        notes: null },
  { id: 'j3',  date: dateOffset(0), prayer: 'zohor',   role: 'imam',   officer_name: 'Ustaz Hj. Fauzi Ahmad',     notes: null },
  { id: 'j4',  date: dateOffset(0), prayer: 'zohor',   role: 'bilal',  officer_name: 'Encik Razali Hamid',        notes: null },
  { id: 'j5',  date: dateOffset(0), prayer: 'asar',    role: 'imam',   officer_name: 'Ustaz Hafizuddin Malik',    notes: null },
  { id: 'j6',  date: dateOffset(0), prayer: 'asar',    role: 'bilal',  officer_name: 'Encik Razali Hamid',        notes: null },
  { id: 'j7',  date: dateOffset(0), prayer: 'maghrib', role: 'imam',   officer_name: 'Ustaz Hj. Fauzi Ahmad',     notes: null },
  { id: 'j8',  date: dateOffset(0), prayer: 'maghrib', role: 'bilal',  officer_name: 'Encik Azman Yusof',         notes: null },
  { id: 'j9',  date: dateOffset(0), prayer: 'isyak',   role: 'imam',   officer_name: 'Ustaz Hafizuddin Malik',    notes: null },
  { id: 'j10', date: dateOffset(0), prayer: 'isyak',   role: 'bilal',  officer_name: 'Encik Azman Yusof',         notes: null },
  // Tomorrow
  { id: 'j11', date: dateOffset(1), prayer: 'subuh',   role: 'imam',   officer_name: 'Ustaz Hafizuddin Malik',    notes: null },
  { id: 'j12', date: dateOffset(1), prayer: 'subuh',   role: 'bilal',  officer_name: 'Encik Azman Yusof',         notes: null },
  { id: 'j13', date: dateOffset(1), prayer: 'zohor',   role: 'imam',   officer_name: 'Ustaz Hj. Fauzi Ahmad',     notes: null },
  { id: 'j14', date: dateOffset(1), prayer: 'asar',    role: 'imam',   officer_name: 'Ustaz Hafizuddin Malik',    notes: null },
  { id: 'j15', date: dateOffset(1), prayer: 'maghrib', role: 'imam',   officer_name: 'Ustaz Hj. Fauzi Ahmad',     notes: null },
  { id: 'j16', date: dateOffset(1), prayer: 'isyak',   role: 'imam',   officer_name: 'Ustaz Hafizuddin Malik',    notes: null },
]

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function MosquePage({
  params,
}: {
  params: Promise<{ mosqueId: string }>
}) {
  // TODO: use mosqueId to fetch from Supabase
  await params

  return (
    <MosqueProfileShell
      mosque={MOCK_MOSQUE}
      announcements={MOCK_ANNOUNCEMENTS}
      doaWishes={MOCK_DOA_WISHES}
      janaizList={MOCK_JANAIZ}
      programs={MOCK_PROGRAMS}
      jadualList={MOCK_JADUAL}
    />
  )
}
