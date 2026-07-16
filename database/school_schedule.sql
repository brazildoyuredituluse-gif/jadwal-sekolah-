-- ============================================================
-- SMKN 1 Cilamaya — Papan Jadwal Hidup
-- Skema database + data awal (khusus kelas XI TKJ 1)
-- ============================================================

CREATE DATABASE IF NOT EXISTS school_schedule
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE school_schedule;

-- ------------------------------------------------------------
-- Akun admin (untuk login dashboard)
-- Password TIDAK disimpan plain text — hanya hash bcrypt.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) DEFAULT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Catatan: jalankan `node backend/utils/createAdmin.js` untuk membuat
-- akun admin pertama dengan password ter-hash secara aman.
-- JANGAN masukkan password contoh langsung lewat SQL.

-- ------------------------------------------------------------
-- Ruang / bangunan (dipakai untuk peta sekolah)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id          VARCHAR(30)  PRIMARY KEY,      -- contoh: 'k9', 'rpstkj', 'lap'
  grid_area   VARCHAR(30)  NOT NULL,         -- nama area pada CSS grid denah
  label       VARCHAR(100) NOT NULL,         -- contoh: 'Ruang Kelas 9'
  mapel       VARCHAR(100) DEFAULT NULL,     -- mapel yang memakai ruang ini (NULL = ruang penunjang)
  category    VARCHAR(30)  DEFAULT NULL,     -- kode warna kategori mapel
  is_facility TINYINT(1)   NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Kelas (sengaja hanya satu baris: XI TKJ 1)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Jam pelajaran (siklus harian, Senin–Jumat)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_slots (
  slot_key   VARCHAR(20) PRIMARY KEY,   -- 'j1', 'istirahat', dst
  label      VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  sort_order INT NOT NULL
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Jadwal per kelas / hari / jam
-- subject_code NULL = tidak ada jam pelajaran tetap (mis. istirahat)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  class_id     INT NOT NULL,
  day          ENUM('Senin','Selasa','Rabu','Kamis','Jumat') NOT NULL,
  slot_key     VARCHAR(20) NOT NULL,
  subject_code VARCHAR(40) DEFAULT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (slot_key) REFERENCES schedule_slots(slot_key) ON DELETE CASCADE,
  UNIQUE KEY uniq_class_day_slot (class_id, day, slot_key)
) ENGINE=InnoDB;

-- ============================================================
-- SEED: jam pelajaran
-- ============================================================
INSERT INTO schedule_slots (slot_key, label, start_time, end_time, sort_order) VALUES
('upacara',   'Upacara/Apel & MBG', '06:30:00', '07:30:00', 1),
('j1',        'Jam 1',              '07:30:00', '08:10:00', 2),
('j2',        'Jam 2',              '08:10:00', '08:50:00', 3),
('j3',        'Jam 3',              '08:50:00', '09:30:00', 4),
('istirahat', 'Istirahat',          '09:30:00', '09:45:00', 5),
('j4',        'Jam 4',              '09:45:00', '10:25:00', 6),
('j5',        'Jam 5',              '10:25:00', '11:05:00', 7),
('j6',        'Jam 6',              '11:05:00', '11:45:00', 8),
('ishoma',    'Ishoma',             '11:45:00', '12:45:00', 9),
('j7',        'Jam 7',              '12:45:00', '13:25:00', 10),
('j8',        'Jam 8',              '13:25:00', '14:05:00', 11),
('j9',        'Jam 9',              '14:05:00', '14:45:00', 12)
ON DUPLICATE KEY UPDATE label=VALUES(label);

-- ============================================================
-- SEED: kelas (hanya XI TKJ 1)
-- ============================================================
INSERT INTO classes (name) VALUES ('XI TKJ 1')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================
-- SEED: ruang / denah sekolah
-- ============================================================
INSERT INTO rooms (id, grid_area, label, mapel, category, is_facility) VALUES
('k20','k20','Ruang Kelas 20','Lab. AP','ap',0),
('kolam1','kolam1','Kolam',NULL,NULL,1),
('k19','k19','Ruang Kelas 19','Bahasa Inggris','bing',0),
('k18','k18','Ruang Kelas 18','Bahasa Inggris','bing',0),
('urs','urs','URS',NULL,NULL,1),
('k17','k17','Ruang Kelas 17','Bahasa Inggris','bing',0),
('labinfo','labinfo','Lab. Informatika & Bahasa','Informatika & Bahasa','info',0),
('guru','guru','Ruang Guru',NULL,NULL,1),
('toilet1','toilet1','Toilet',NULL,NULL,1),
('rapat','rapat','Ruang Rapat',NULL,NULL,1),
('rpstkj','rpstkj','RPS TKJ','Produktif TKJ','tkj',0),
('k21','k21','Ruang Kelas 21','Bahasa Indonesia','bindo',0),
('bkk','bkk','Ruang BKK',NULL,NULL,1),
('k22','k22','Ruang Kelas 22','Bahasa Indonesia','bindo',0),
('koperasi','koperasi','Koperasi',NULL,NULL,1),
('perpus','perpus','Ruang Perpustakaan',NULL,NULL,1),
('k1','k1','Ruang Kelas 1','Teori TKJ','tkj',0),
('k23','k23','Ruang Kelas 23','Bahasa Indonesia','bindo',0),
('kolam2','kolam2','Kolam',NULL,NULL,1),
('toilet2','toilet2','Toilet',NULL,NULL,1),
('labipa','labipa','Laboratorium IPA',NULL,NULL,1),
('k2','k2','Ruang Kelas 2','PJOK','pjok',0),
('lap','lap','Lapangan',NULL,NULL,1),
('toilet3','toilet3','Toilet',NULL,NULL,1),
('k8','k8','Ruang Kelas 8','Bahasa Indonesia','bindo',0),
('k7','k7','Ruang Kelas 7','PIPAS','pipas',0),
('k6','k6','Ruang Kelas 6','PIPAS','pipas',0),
('k5','k5','Ruang Kelas 5','KIK','kik',0),
('k4','k4','Ruang Kelas 4','KIK','kik',0),
('k3','k3','Ruang Kelas 3','KIK','kik',0),
('coe','coe','Ruang COE','Agama - PKn','agama',0),
('tpa','tpa','TPA',NULL,NULL,1),
('rpstkr','rpstkr','RPS TKR','Produktif TKR','tkr',0),
('k16','k16','Ruang Kelas 16','Teori TKR','tkr',0),
('k15','k15','Ruang Kelas 15','Teori TKR','tkr',0),
('k14','k14','Ruang Kelas 14','Teori TP','tp',0),
('k13','k13','Ruang Kelas 13','Teori APHP','aphp',0),
('k12','k12','Ruang Kelas 12','Teori AP','ap',0),
('bkuks','bkuks','Rencana Ajuan Ruang BK & UKS',NULL,NULL,1),
('k11','k11','Ruang Kelas 11','Matematika','mtk',0),
('k10','k10','Ruang Kelas 10','Matematika','mtk',0),
('k9','k9','Ruang Kelas 9','Matematika','mtk',0),
('kolam3','kolam3','Kolam',NULL,NULL,1),
('rencanaap','rencanaap','Rencana Ajuan RPS AP',NULL,NULL,1),
('rpsaphp','rpsaphp','RPS APHP','Produktif APHP','aphp',0),
('rpstp','rpstp','RPS Teknik Pemesinan','Produktif TP','tp',0),
('k24','k24','Ruang Kelas 24','Dojo K3 & Alat Ukur','k3',0),
('toilet4','toilet4','Toilet',NULL,NULL,1),
('rpsap','rpsap','RPS AP','Produktif AP','ap',0),
('ruangserba','ruangserba','Ruang Tambahan',NULL,NULL,1),
('kepsek','kepsek','Ruang Kepala Sekolah',NULL,NULL,1),
('gudang','gudang','Gudang',NULL,NULL,1),
('tu','tu','Ruang Tata Usaha',NULL,NULL,1)
ON DUPLICATE KEY UPDATE label=VALUES(label), mapel=VALUES(mapel), category=VALUES(category);

-- ============================================================
-- SEED: jadwal XI TKJ 1 (Senin–Jumat, sesuai dokumen sumber)
-- ============================================================
SET @class_id = (SELECT id FROM classes WHERE name = 'XI TKJ 1');

INSERT INTO schedule (class_id, day, slot_key, subject_code) VALUES
-- Senin
(@class_id,'Senin','j1','MTK'), (@class_id,'Senin','j2','MTK'), (@class_id,'Senin','j3','MTK'),
(@class_id,'Senin','j4','B.IND'), (@class_id,'Senin','j5','B.IND'), (@class_id,'Senin','j6','B.IND'),
(@class_id,'Senin','j7','WK'), (@class_id,'Senin','j8','WK'), (@class_id,'Senin','j9','Kebersihan-Apel'),
-- Selasa
(@class_id,'Selasa','j1','B.ING'), (@class_id,'Selasa','j2','B.ING'), (@class_id,'Selasa','j3','B.ING'),
(@class_id,'Selasa','j4','KIK.TKJ'), (@class_id,'Selasa','j5','KIK.TKJ'), (@class_id,'Selasa','j6','KIK.TKJ'),
(@class_id,'Selasa','j7','KL'), (@class_id,'Selasa','j8','KL'), (@class_id,'Selasa','j9','Kebersihan-Apel'),
-- Rabu
(@class_id,'Rabu','j1','PJOK'), (@class_id,'Rabu','j2','PJOK'), (@class_id,'Rabu','j3','PJOK'),
(@class_id,'Rabu','j4','KIK.TKJ'), (@class_id,'Rabu','j5','KIK.TKJ'), (@class_id,'Rabu','j6','KIK.TKJ'),
(@class_id,'Rabu','j7','English Club'), (@class_id,'Rabu','j8','English Club'), (@class_id,'Rabu','j9','Kebersihan-Apel'),
-- Kamis
(@class_id,'Kamis','j1','SJR'), (@class_id,'Kamis','j2','SJR'), (@class_id,'Kamis','j3','SJR'),
(@class_id,'Kamis','j4','MN'), (@class_id,'Kamis','j5','MN'), (@class_id,'Kamis','j6','MN'),
(@class_id,'Kamis','j7','Ekskul'), (@class_id,'Kamis','j8','Ekskul'), (@class_id,'Kamis','j9','Kebersihan-Apel'),
-- Jumat
(@class_id,'Jumat','j1','Senam'), (@class_id,'Jumat','j2','GAMES'), (@class_id,'Jumat','j3','GAMES'),
(@class_id,'Jumat','j4','KOM SNB & SUN'), (@class_id,'Jumat','j5','KOM SNB & SUN'), (@class_id,'Jumat','j6','KOM SNB & SUN'),
(@class_id,'Jumat','j7','Refleksi Mandiri'), (@class_id,'Jumat','j8','Refleksi Mandiri')
ON DUPLICATE KEY UPDATE subject_code = VALUES(subject_code);

-- ============================================================
-- SEED: kode mapel -> nama ruang mapel (dipakai backend untuk mencari ruang)
-- ============================================================
CREATE TABLE IF NOT EXISTS subject_codes (
  code       VARCHAR(40) PRIMARY KEY,
  mapel_name VARCHAR(100) DEFAULT NULL  -- NULL = kegiatan tanpa ruang tetap
) ENGINE=InnoDB;

INSERT INTO subject_codes (code, mapel_name) VALUES
('MTK','Matematika'), ('B.IND','Bahasa Indonesia'), ('B.ING','Bahasa Inggris'),
('PJOK','PJOK'), ('KIK.TKJ','KIK'),
('SJR',NULL), ('MN',NULL), ('WK',NULL), ('KL',NULL), ('English Club',NULL),
('KOM SNB & SUN',NULL), ('Ekskul',NULL), ('Refleksi Mandiri',NULL),
('Senam',NULL), ('GAMES',NULL), ('Kebersihan-Apel',NULL), ('Upacara/Apel & MBG',NULL)
ON DUPLICATE KEY UPDATE mapel_name = VALUES(mapel_name);
