# Papan Jadwal Hidup — SMKN 1 Cilamaya (XI TKJ 1)

Website jadwal + denah sekolah interaktif, sekarang dengan backend sungguhan
(bukan lagi satu file HTML statis) supaya lebih aman dan datanya bisa dikelola
lewat dashboard admin, bukan ditulis manual di kode.

## Struktur folder

```
school-schedule/
├── frontend/     halaman publik (jadwal + denah) — HANYA membaca data lewat API
├── backend/      Express API (Node.js) + koneksi MySQL
├── database/     school_schedule.sql — skema + data awal
├── admin/        login.html & dashboard.html untuk mengelola jadwal
└── .env.example  contoh konfigurasi (SALIN jadi .env, isi sendiri)
```

## Cara menjalankan (development)

1. **Siapkan database**
   ```bash
   mysql -u root -p < database/school_schedule.sql
   ```

2. **Konfigurasi backend**
   ```bash
   cd backend
   cp ../.env.example .env
   # edit .env: isi DB_PASSWORD, JWT_SECRET (string acak panjang), dll.
   npm install
   ```

3. **Buat akun admin pertama** (password langsung di-hash, tidak pernah disimpan polos)
   ```bash
   npm run create-admin
   ```

4. **Jalankan server**
   ```bash
   npm start
   ```
   Buka `http://localhost:3000` untuk halaman publik,
   dan `http://localhost:3000/admin/login.html` untuk login admin.

## Kenapa ini lebih aman dari versi HTML tunggal sebelumnya

| Risiko sebelumnya | Perbaikan di versi ini |
|---|---|
| Semua data & logika bisa dilihat/disalin lewat "View Source" | Data jadwal & ruang sekarang disimpan di database, halaman hanya mengambilnya lewat API saat dibuka — tetap bisa dilihat di tab Network, tapi tidak lagi tertanam sebagai kode yang gampang dicomot mentah-mentah |
| Tidak ada kontrol siapa yang boleh mengubah jadwal | Perubahan jadwal/ruang wajib login admin (JWT), password di-hash dengan bcrypt |
| Rawan brute-force jika ada form login | `express-rate-limit` membatasi percobaan login (8x/15 menit per IP) |
| Rawan SQL Injection kalau nanti ditambah database sembarangan | Semua query pakai *prepared statement* (`mysql2` placeholder `?`), tidak ada string concat ke SQL |
| Header HTTP default kurang aman | `helmet` mengaktifkan header keamanan standar + Content-Security-Policy |
| CORS terbuka untuk semua domain | Backend hanya menerima request dari domain yang didaftarkan di `ALLOWED_ORIGINS` |
| Body request tanpa batas ukuran | `express.json({ limit: '100kb' })` mencegah payload raksasa |
| Pesan error bisa membocorkan detail server | Error handler terpusat — detail teknis hanya di log server, client cuma dapat pesan umum |

## Yang masih perlu kamu perhatikan sendiri

- **Halaman publik tetap bisa dilihat "View Source"** — ini berlaku untuk *semua* website, tidak ada cara mencegahnya sepenuhnya di sisi frontend. Yang berhasil diamankan di versi ini adalah *data* dan *hak ubah*, bukan tampilan HTML/CSS itu sendiri.
- **Simpan file `.env` dengan aman**, jangan pernah di-commit ke Git (`.gitignore` sudah menyertakan ini) atau dikirim lewat chat/email.
- **Ganti `JWT_SECRET`** dengan string acak sungguhan (lihat contoh generate di `.env.example`), jangan pakai nilai contoh.
- **Pasang HTTPS** (lewat reverse proxy seperti Nginx/Caddy, atau layanan hosting) sebelum dipakai publik — tanpa HTTPS, token login & password bisa disadap di jaringan.
- Token admin disimpan di `sessionStorage` (hilang saat tab ditutup) agar tidak tertinggal lama di browser bersama, tapi tetap disarankan logout manual di komputer bersama/lab sekolah.

## Kelas yang dilayani

Sengaja **hanya XI TKJ 1** (XI TKJ 2 telah dihapus sesuai permintaan). Untuk
menambah kelas lain di kemudian hari, tambahkan barisnya di tabel `classes`
dan `schedule` pada `database/school_schedule.sql`, lalu sesuaikan
`CLASS_NAME` di `backend/models/scheduleModel.js`.
