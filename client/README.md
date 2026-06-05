# Client README

Frontend aplikasi SATUSEHAT Interoperability.

## Teknologi utama
- Next.js 16.2.6
- React 19.2.4
- Tailwind CSS 4

## Tujuan
Folder `client/` berisi antarmuka pengguna web yang akan berkomunikasi dengan backend `server/`.

Catatan: untuk instruksi `clone` dan setup cepat (server + client), lihat `../README.md`.

## Setup dan Jalan
Proyek ini sekarang dikonfigurasi menggunakan monorepo workspace. Sangat disarankan untuk menginstal dependensi dari root folder secara terpadu.

### Cara 1: Menggunakan Perintah dari Root Folder (Sangat Direkomendasikan)
1. Jalankan instalasi dari root folder:
   ```bash
   pnpm install # atau npm install
   ```
2. Jalankan frontend dari root folder:
   ```bash
   pnpm pnpm:client # atau npm run dev:client
   ```

### Cara 2: Dari Direktori `client/`
Jika Anda berada di dalam folder `client`:
1. Instal dependensi:
   ```bash
   pnpm install # atau npm install
   ```
2. Jalankan aplikasi frontend:
   ```bash
   pnpm dev # atau npm run dev
   ```

3. Buka `http://localhost:3000` di browser.

> Pastikan backend sudah berjalan terlebih dahulu di `http://localhost:5000`.

## Status saat ini
- Frontend masih menggunakan halaman starter default Next.js di `src/app/page.js`.
- Belum ada integrasi API backend secara penuh; pengembangan UI dan panggilan API dapat dilanjutkan di folder `src/`.

## Struktur file penting
- `src/app/page.js` — halaman utama saat ini
- `next.config.mjs` — konfigurasi Next.js
- `postcss.config.mjs` — konfigurasi Tailwind CSS
- `package.json` — script dan dependensi

## Catatan untuk kontributor
- Update UI di `src/app/*`.
- Jika perlu memanggil backend, gunakan alamat lengkap `http://localhost:5000/api/v1/...`.
- Baca `../README.md` untuk konteks proyek secara keseluruhan.

## Panduan Commit Frontend
Gunakan format commit ini untuk perubahan client:
```text
<type>@client: <deskripsi singkat>
```

`type` yang direkomendasikan:
- `feat` — fitur baru
- `fix` — perbaikan bug
- `docs` — dokumentasi
- `refactor` — refactor kode tanpa fitur baru
- `chore` — maintenance/dependensi/CI
- `test` — tambahan atau perbaikan tes
- `perf` — peningkatan performa

Contoh:
- `feat@client: tambah halaman pendaftaran pasien`
- `fix@client: perbaiki tampilan responsif navbar`
- `docs@client: update README client dan instruksi setup`

Jika perubahan juga menyentuh backend, gunakan `@client @server` atau pisahkan menjadi dua commit: satu untuk frontend, satu untuk backend.

Pesan commit harus detail namun ringkas: jelaskan apa yang berubah dan kenapa.
 
