ALTER TABLE doa_wishes
  ADD COLUMN category TEXT NOT NULL DEFAULT 'umum'
  CHECK (category IN (
    'kesihatan', 'keluarga', 'pekerjaan', 'pelajaran',
    'kekuatan_iman', 'jodoh', 'keselamatan', 'ummah', 'umum'
  ));
