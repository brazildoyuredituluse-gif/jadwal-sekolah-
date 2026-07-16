-- Migrasi: tambah kolom guru + perbarui data ruang sesuai denah terbaru
ALTER TABLE rooms ADD COLUMN teacher VARCHAR(150) DEFAULT NULL;

UPDATE rooms SET label='UKS' WHERE id='urs';

UPDATE rooms SET mapel='Teori TKJ', category='tkj', teacher='Gina Mardiana, S.Kom' WHERE id='k1';
UPDATE rooms SET mapel='PJOK', category='pjok', teacher='Ubay dan Syamsul' WHERE id='k2';
UPDATE rooms SET mapel='KIK', category='kik', teacher=NULL WHERE id IN ('k3','k4','k5');
UPDATE rooms SET mapel='PIPAS', category='pipas', teacher='Hj. Diana Handi, S.Pd.' WHERE id='k6';
UPDATE rooms SET mapel='PIPAS', category='pipas', teacher='Azzah Fitriah, S.Pd.' WHERE id='k7';
UPDATE rooms SET mapel='Teori TP', category='tp', teacher='Guru Produktif TP' WHERE id='k8';
UPDATE rooms SET mapel='Matematika', category='mtk', teacher='Ary Dwijayanti, S.Pd.' WHERE id='k9';
UPDATE rooms SET mapel='Matematika', category='mtk', teacher='Ema Susanti, S.Pd.' WHERE id='k10';
UPDATE rooms SET mapel='Matematika', category='mtk', teacher='Rohmi Ikhtarini, S.Pd' WHERE id='k11';
UPDATE rooms SET mapel='Bahasa Indonesia', category='bindo', teacher='Enung Herayati, S.Pd.' WHERE id='k12';
UPDATE rooms SET mapel='Bahasa Indonesia', category='bindo', teacher='Nunung Nurilah, S.Pd.' WHERE id='k13';
UPDATE rooms SET mapel='Teori APHP', category='aphp', teacher='Guru Produktif APHP' WHERE id='k14';
UPDATE rooms SET mapel='Teori TKR', category='tkr', teacher='Rian Hidayat, S.T' WHERE id='k15';
UPDATE rooms SET mapel='Teori TKR', category='tkr', teacher='Rian Hidayat, S.T' WHERE id='k16';
UPDATE rooms SET mapel='Bahasa Inggris', category='bing', teacher='Eni, S.Pd.' WHERE id='k17';
UPDATE rooms SET mapel='Bahasa Inggris', category='bing', teacher='Neneng Nurhasanah, S.Pd.' WHERE id='k18';
UPDATE rooms SET mapel='Bahasa Inggris', category='bing', teacher='Marini, S.Pd' WHERE id='k19';
UPDATE rooms SET mapel='Lab. AP', category='ap', teacher='Asep Rida Rosmana, S.Pi' WHERE id='k20';
UPDATE rooms SET mapel='Teori AP', category='ap', teacher='Guru Produktif AP' WHERE id='k21';
UPDATE rooms SET mapel='Bahasa Indonesia', category='bindo', teacher='Triya Setyawati, S.Pd' WHERE id='k22';
UPDATE rooms SET mapel='Bahasa Indonesia', category='bindo', teacher='Teti Fatmawati F., S.Pd.' WHERE id='k23';
UPDATE rooms SET mapel='Dojo K3 & Alat Ukur', category='k3', teacher='Harry Tovanny, S.Pd.' WHERE id='k24';
UPDATE rooms SET mapel='Agama - PKn', category='agama', teacher='Irda Lulita Sari, S.Pd / Dinda Syifa Fauziah, S.Pd.I' WHERE id='coe';
UPDATE rooms SET mapel='Produktif TKJ', category='tkj', teacher='Gina Mardiana, S.Kom' WHERE id='rpstkj';
UPDATE rooms SET mapel='Produktif TKR', category='tkr', teacher='Rian Hidayat, S.T' WHERE id='rpstkr';
UPDATE rooms SET mapel='Produktif APHP', category='aphp', teacher='Rini Martyaning Diyah, S.Pi' WHERE id='rpsaphp';
UPDATE rooms SET mapel='Produktif TP', category='tp', teacher='Dian Astuti, S.T' WHERE id='rpstp';
UPDATE rooms SET mapel='Produktif AP', category='ap', teacher='Putri Pertiwi, S.Pi' WHERE id='rpsap';
UPDATE rooms SET mapel='PIPAS', category='pipas', teacher='Siti Wardiyah, S.Si' WHERE id='lab';
UPDATE rooms SET mapel='Informatika & Bahasa', category='info', teacher='Moch. Suef, S.Pi' WHERE id='labinfo';
