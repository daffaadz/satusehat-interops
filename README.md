# SATUSEHAT Interoperability System

Sistem Interoperabilitas terintegrasi untuk platform SATUSEHAT Kementerian Kesehatan Republik Indonesia. Proyek ini memfasilitasi komunikasi data kesehatan melalui API SATUSEHAT menggunakan standar FHIR (Fast Healthcare Interoperability Resources).

## 🚀 Gambaran Proyek

Proyek ini dibangun menggunakan arsitektur monorepo yang terdiri dari dua bagian utama:
1. **Frontend (Client)**: Aplikasi antarmuka pengguna berbasis web yang dibangun menggunakan **Next.js**.
2. **Backend (Server)**: Layanan API (*middleware*) yang dibangun dengan **Node.js & Express** untuk menjembatani komunikasi ke API SATUSEHAT dengan aman (OAuth2) dan menangani operasi FHIR.

## 📁 Struktur Repositori

```text
satusehat-website/
├── client/       # Frontend Next.js (React, TailwindCSS)
├── server/       # Backend Node.js (Express, Axios, Swagger)
└── README.md     # Dokumentasi ini
```

## 📌 Apa yang ada di repo

Root folder berisi:
- `.git/` — metadata Git untuk repo
- `README.md` — dokumentasi utama
- `client/` — aplikasi frontend Next.js
- `server/` — backend API Express

### `client/`
- `package.json` — konfigurasi paket dan skrip
- `pnpm-lock.yaml` — lock file untuk pnpm
- `src/app/` — kode aplikasi Next.js
- `public/` — aset statis
- `next.config.mjs`, `postcss.config.mjs` — konfigurasi Next/Tailwind
- `AGENTS.md` — panduan arsitektur dan gaya kode frontend
- `client/README.md` — panduan setup dan status frontend

### `server/`
- `package.json` — konfigurasi paket dan skrip server
- `.env.example` — contoh konfigurasi environment
- `server.js` — entry point server
- `src/` — routes, controllers, services, dan util
- `AGENTS.md` — panduan arsitektur dan gaya kode backend
- `server/README.md` — panduan setup dan status backend

### Stack Teknologi

**Client (Frontend):**
- [Next.js](https://nextjs.org/) (Framework React)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

**Server (Backend):**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Axios](https://axios-http.com/) (Untuk request HTTP ke API SATUSEHAT)
- [Swagger](https://swagger.io/) (Untuk dokumentasi API/Endpoint lokal)
- Autentikasi: OAuth2 Client Credentials (SATUSEHAT)

## 🛠️ Prasyarat

Sebelum memulai, pastikan Anda telah memiliki:
- **Node.js** (versi 18+ disarankan)
- Package Manager seperti **pnpm** (direkomendasikan) atau **npm**
- Akun Developer SATUSEHAT dan kredensial (Client ID & Client Secret) dari [Portal SATUSEHAT](https://satusehat.kemkes.go.id/platform/development).

## ⚙️ Instalasi & Konfigurasi

### 1. Kloning Repositori
```bash
git clone https://github.com/daffaadz/satusehat-interops.git
cd satusehat-interops
```

### 2. Instalasi Dependensi (Workspace Root)
Proyek ini sekarang menggunakan monorepo workspace yang memungkinkan instalasi semua dependensi sekaligus dari root folder.

**Menggunakan pnpm (Direkomendasikan):**
```bash
pnpm install
```
*Catatan: pnpm secara otomatis akan mengonfigurasi workspace dan mengotorisasi skrip build dependensi.*

**Menggunakan npm:**
```bash
npm install
```

### 3. Setup Konfigurasi Environment (Backend)
Salin contoh konfigurasi environment di folder `server` dan buat file `.env` baru:
```bash
cp server/.env.example server/.env
```

**Isi dari `server/.env` (sesuaikan dengan kredensial Portal SATUSEHAT Anda):**
```env
PORT=5000
NODE_ENV=development
SATUSEHAT_BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id
SATUSEHAT_ORG_ID=YOUR_ORGANIZATION_ID
SATUSEHAT_CLIENT_ID=YOUR_CLIENT_ID
SATUSEHAT_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

### 4. Menjalankan Aplikasi dalam Mode Pengembangan
Anda dapat menjalankan backend dan frontend langsung dari root folder menggunakan script workspace berikut:

**Menggunakan pnpm:**
*   Menjalankan Frontend (Next.js): `pnpm pnpm:client`
*   Menjalankan Backend (Express): `pnpm pnpm:server`

**Menggunakan npm:**
*   Menjalankan Frontend (Next.js): `npm run dev:client`
*   Menjalankan Backend (Express): `npm run dev:server`

Buka [http://localhost:3000](http://localhost:3000) untuk mengakses frontend dan [http://localhost:5000](http://localhost:5000) untuk backend.

## 🔌 Endpoint Backend Ringkas

Backend saat ini menyediakan endpoint berikut:
- `GET /api/v1/health`
- `POST /api/v1/register`
- `GET /api/v1/satusehat/token`
- `GET /api/v1/satusehat/patient/:nik`
- `GET /api/v1/satusehat/practitioner/:nik`
- `POST /api/v1/satusehat/location`
- `POST /api/v1/satusehat/encounter`
- `GET /api/v1/satusehat/debug/practitioner-nik/:nik`
- `GET /api/v1/satusehat/debug/practitioner`

Catatan: server mengelola token OAuth2 SATUSEHAT secara otomatis dan menyimpannya dalam cache sampai hampir kadaluarsa.

## 📖 Dokumentasi API Backend

Backend menggunakan modul `swagger-ui-express` dan `swagger-jsdoc` untuk memunculkan spesifikasi endpoint secara interaktif. Saat server berjalan, Anda dapat mengakses dokumentasi API melalui endpoint yang telah ditentukan (secara default di dokumentasi ini asumsikan di `/api/docs` atau yang telah dikonfigurasi).

## ✅ Status Saat Ini

### `client`
- Struktur dasar Next.js sudah tersedia
- Halaman awal masih menggunakan starter default di `client/src/app/page.js`
- Belum ada integrasi API backend secara lengkap

### `server`
- Express, Swagger, dan OAuth2-ready middleware telah disiapkan
- `server/.env` harus dibuat agar kredensial SATUSEHAT berfungsi
- Struktur `src/` sudah ada: routes, controller, service, util

### Koneksi client-server
- Jalankan server dahulu, lalu frontend
- Frontend belum otomatis memanggil backend saat ini
- Integrasi akan berjalan setelah frontend ditambahkan panggilan ke endpoint `http://localhost:5000/api/v1/...`

## 🔒 Panduan dan Standar Pengembangan
Setiap direktori (`client` dan `server`) memiliki file `AGENTS.md` yang memuat konvensi, arsitektur, dan panduan kode (seperti struktur *folder*, pola desain *Controller-Service-Route* untuk Express, dan pembaruan framework untuk Next.js). Sangat disarankan untuk membacanya sebelum berkontribusi.

- Server Guidelines: [`server/AGENTS.md`](./server/AGENTS.md)
- Client Guidelines: [`client/AGENTS.md`](./client/AGENTS.md)

## 🤝 Kontribusi

Sebelum commit, gunakan pesan yang jelas dan konsisten:

```text
<type>@<scope>: <deskripsi singkat>
```

`type` yang direkomendasikan:
- `feat` — fitur baru
- `fix` — perbaikan bug
- `docs` — dokumentasi
- `refactor` — perubahan kode tanpa fitur baru atau bug fix
- `chore` — tugas maintenance/ci/dependensi
- `test` — tambahan atau perbaikan tes
- `perf` — peningkatan performa

`scope` yang direkomendasikan:
- `@client` — perubahan frontend
- `@server` — perubahan backend
- `@client @server` — perubahan lintas frontend dan backend

Contoh:
- `feat@client: tambah halaman login`
- `fix@server: perbaiki error handling token`
- `docs@client @server: update README setup`

1. Buat *branch* fitur Anda (`git checkout -b feature/FiturKeren`)
2. *Commit* perubahan Anda (`git commit -m 'feat@client: menambahkan FiturKeren'`)
3. *Push* ke branch (`git push origin feature/FiturKeren`)
4. Buka sebuah *Pull Request*

---

*Proyek ini dikembangkan untuk mendukung Interoperabilitas Data Kesehatan di Indonesia berdasarkan spesifikasi Kementerian Kesehatan.*

