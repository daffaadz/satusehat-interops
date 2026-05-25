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

### 2. Setup Server (Backend)
Backend berfungsi sebagai *middleware* untuk berkomunikasi dengan SATUSEHAT API secara aman tanpa mengekspos rahasia dari sisi *client*.

1. Pindah ke direktori `server`:
   ```bash
   cd server
   ```
2. Instal dependensi:
   ```bash
   npm install
   # atau jika menggunakan pnpm:
   pnpm install
   ```
3. Buat file konfigurasi environment (`.env`) berdasarkan kredensial SATUSEHAT Anda:
   ```bash
   cp .env.example .env # atau buat file .env baru secara manual
   ```
   **Isi dari `.env` (berdasarkan konfigurasi environment):**
   ```env
   PORT=5000
   NODE_ENV=development
   SATUSEHAT_BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id
   SATUSEHAT_ORG_ID=YOUR_ORGANIZATION_ID
   SATUSEHAT_CLIENT_ID=YOUR_CLIENT_ID
   SATUSEHAT_CLIENT_SECRET=YOUR_CLIENT_SECRET
   ```
4. Jalankan server mode pengembangan:
   ```bash
   npm run dev
   # Server akan berjalan di http://localhost:5000
   ```

### 3. Setup Client (Frontend)
Frontend menyediakan antarmuka pengguna sistem.

1. Buka terminal baru dan pindah ke direktori `client`:
   ```bash
   cd client
   ```
2. Instal dependensi:
   ```bash
   npm install
   # atau
   pnpm install
   ```
3. Jalankan aplikasi web:
   ```bash
   npm run dev
   # atau
   pnpm dev
   ```
4. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📖 Dokumentasi API Backend

Backend menggunakan modul `swagger-ui-express` dan `swagger-jsdoc` untuk memunculkan spesifikasi endpoint secara interaktif. Saat server berjalan, Anda dapat mengakses dokumentasi API melalui endpoint yang telah ditentukan (secara default di dokumentasi ini asumsikan di `/api/docs` atau yang telah dikonfigurasi).

## 🔒 Panduan dan Standar Pengembangan
Setiap direktori (`client` dan `server`) memiliki file `AGENTS.md` yang memuat konvensi, arsitektur, dan panduan kode (seperti struktur *folder*, pola desain *Controller-Service-Route* untuk Express, dan pembaruan framework untuk Next.js). Sangat disarankan untuk membacanya sebelum berkontribusi.

- Server Guidelines: [`server/AGENTS.md`](./server/AGENTS.md)
- Client Guidelines: [`client/AGENTS.md`](./client/AGENTS.md)

## 🤝 Kontribusi

1. *Fork* repositori ini
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturKeren`)
3. *Commit* perubahan Anda (`git commit -m 'feat: menambahkan FiturKeren'`)
4. *Push* ke branch (`git push origin feature/FiturKeren`)
5. Buka sebuah *Pull Request*

---

*Proyek ini dikembangkan untuk mendukung Interoperabilitas Data Kesehatan di Indonesia berdasarkan spesifikasi Kementerian Kesehatan.*
