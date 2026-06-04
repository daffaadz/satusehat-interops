# PLANNING.md — Panduan Integrasi FE-BE & Roadmap Pengembangan

## ✅ To-Do List (Project Setup & Milestones)

### Phase 1: Project Setup & Documentation ✅ SELESAI
- [x] Inisialisasi monorepo struktur (client + server)
- [x] Setup workspace configuration (`pnpm-workspace.yaml`)
- [x] Buat client/README.md dengan instruksi FE
- [x] Buat server/README.md dengan instruksi BE
- [x] Setup AGENTS.md di client (Next.js best practices)
- [x] Setup AGENTS.md di server (Express architecture & conventions)
- [x] Commit & push ke branch `Avin1731` (origin & upstream)
- [x] Merge ke `master` dan push ke kedua remote
- [x] Buat PLANNING.md sebagai panduan integrasi FE-BE

### Phase 2: Backend Development ✅ SELESAI UNTUK MVP
- [x] Setup SATUSEHAT OAuth2 token refresh otomatis (`satusehatAuthService`)
- [x] Setup routes structure (`routes/index.js`, `satusehat.js`)
- [x] Setup error handling & logging middleware
- [x] Buat controllers (`healthController`, `authController`, `registrationController`)
- [x] Buat services (`authService`, `patientService`, `practitionerService`, `encounterService`, `locationService`, `registrationService`)
- [x] Buat endpoints untuk patient, practitioner, encounter, location
- [x] Buat Swagger documentation
- [x] Buat auth session lokal untuk admin frontend
- [ ] Setup database schema & persistence (PostgreSQL) — PENDING
- [ ] Testing semua endpoint dengan Postman/Insomnia — PENDING

### Phase 3: Frontend Development ✅ BASIS SUDAH JALAN
- [x] Setup Next.js pages & basic routing structure
- [x] Buat halaman Home
- [x] Buat halaman Login
- [x] Buat halaman Dashboard
- [x] Buat auth guard untuk proteksi route dashboard
- [x] Buat theme system light/dark + persistensi
- [x] Buat komponen dasar UI (Button, Input, Popup, Sidebar, Skeleton)
- [x] Integrasi frontend ke backend auth session (`/api/v1/auth/login`, `/me`, `/logout`)
- [x] Buat halaman Search Patient (by NIK) (via Intake page preview/lookup)
- [x] Buat halaman Patient Registration Form (via Intake page submit)
- [x] Buat halaman Practitioner Search (via Intake page preview/lookup)
- [x] Buat halaman Encounter Management (create flow via Intake page)
- [x] Setup form validation & error handling
- [ ] Setup responsive design & styling untuk fitur domain
- [ ] Testing semua halaman di berbagai device
- [x] Sinkronisasi sidebar/nav dengan halaman fitur yang benar

### Phase 4: Integration & Testing (Pending)
- [ ] Test FE-BE communication end-to-end
- [ ] Test error scenarios & edge cases
- [ ] Performance testing & optimization
- [ ] Security audit (XSS, CSRF, injection attacks)
- [ ] Load testing untuk endpoints kritis
- [ ] Verifikasi dokumentasi vs implementasi aktual

### Phase 5: Deployment (Pending)
- [ ] Setup staging environment
- [ ] Deploy ke staging & testing
- [ ] Setup CI/CD pipeline (GitHub Actions)
- [ ] Deploy ke production
- [ ] Setup monitoring & alerting

---

## 🎯 Ringkasan Proyek

**T1_Intero_2** adalah aplikasi interoperabilitas kesehatan yang mengintegrasikan:
- **Frontend (Client)**: Next.js 16 + React 19 dengan komponen UI dan theme system
- **Backend (Server)**: Express.js dengan integrasi OAuth2 SATUSEHAT FHIR API
- **Auth internal**: session-based admin login untuk akses dashboard frontend

Workflow saat ini:
User → Next.js UI → Express Auth API / SATUSEHAT API → Response terformat

---

## 📐 Arsitektur End-to-End

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                      │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │ Pages/Routes │→ │ Components    │→ │ API Calls      │  │
│  └──────────────┘  └───────────────┘  └────────────────┘  │
└──────────────────────────┬─────────────────────────────────┘
                          HTTP(S)
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                      │
│  ┌────────────┐   ┌────────────┐   ┌──────────────────┐    │
│  │ Routes     │→  │ Controllers│→  │ Services/Utils   │    │
│  └────────────┘   └────────────┘   └──────────────────┘    │
│                          ↓                                   │
│                    ┌──────────────┐                          │
│                    │ SATUSEHAT    │                          │
│                    │ FHIR API     │                          │
│                    └──────────────┘                          │
└──────────────────────────────────────────────────────────────┘
```

### Alur Tipikal Request

1. **User interaksi di UI (Next.js)**
   - Submit form, klik tombol, navigasi halaman

2. **Frontend kirim HTTP request ke Backend**
   - `POST /api/v1/auth/login`
   - `GET /api/v1/auth/me`
   - `POST /api/v1/register`
   - `GET /api/v1/satusehat/patient/:nik`
   - dll.

3. **Backend (Express) menerima request**
   - Route menerima request
   - Controller validasi & parse input
   - Service eksekusi logika bisnis
   - Panggil SATUSEHAT API jika diperlukan

4. **Backend kirim respons terformat**
   ```json
   { "success": true, "message": "...", "data": {...} }
   ```

5. **Frontend tampilkan hasil ke UI**
   - Parse respons
   - Update state
   - Render komponen

---

## 🛠️ Struktur Direktori & Tanggung Jawab

### Frontend (Client)

```
client/
├── src/
│   └── app/
│       ├── layout.js          # Root layout, global setup
│       ├── page.js            # Home page (/)
│       ├── login/page.js      # Login page (/login)
│       ├── dashboard/page.js   # Dashboard (/dashboard)
│       └── [fitur]/           # Setiap fitur dalam folder terpisah
│           ├── page.js        # Halaman utama fitur
│           ├── components/    # Komponen spesifik fitur
│           └── hooks/         # Custom hooks (opsional)
├── components/                # Shared UI components
├── context/                   # Theme/Auth provider
├── hooks/                     # Hook wrapper
├── lib/                       # Shared libraries (api client, auth, theme)
├── public/                    # Static assets (logo, icon, dll)
├── package.json
└── next.config.mjs
```

**Tanggung Jawab FE Developer:**
- Buat halaman & komponen React
- Handle form input dan validasi dasar di client-side
- Kirim request ke backend API
- Display respons, error handling di UI
- Manage state lokal
- Jaga sinkronisasi navigasi dan status auth

### Status implementasi FE saat ini
- Home, login, dan dashboard sudah tersedia
- Auth session frontend sudah aktif
- Theme light/dark sudah aktif dan persist ke storage
- Fitur domain klinik masih perlu ditambahkan

---

### Backend (Server)

```
server/
├── src/
│   ├── config/              # Env vars, constants
│   ├── controllers/         # HTTP request handlers
│   ├── middleware/          # Auth guard, error handler
│   ├── models/              # DB schemas (opsional untuk MVP)
│   ├── routes/              # HTTP route definitions
│   ├── services/            # Business logic & API calls
│   │   ├── authService.js            # Session management admin FE
│   │   ├── satusehatAuthService.js    # OAuth2 token management
│   │   ├── patientService.js         # Patient lookup
│   │   ├── practitionerService.js    # Practitioner lookup
│   │   ├── encounterService.js       # Encounter creation
│   │   └── ...
│   ├── utils/               # Helpers (response formatter, error, dll)
│   ├── docs/
│   │   └── swagger.js       # Swagger/OpenAPI definition
│   ├── server.js            # Entry point
│   └── package.json
└── .env (NOT in git)        # Secrets & env vars
```

**Tanggung Jawab BE Developer:**
- Terima request dari FE
- Validasi & parse input
- Panggil SATUSEHAT API
- Format respons konsisten
- Error handling & logging
- Dokumentasi endpoint (Swagger)

### Status implementasi BE saat ini
- Endpoint health, auth, register, token, patient, practitioner, location, encounter, dan debug sudah ada
- Swagger tersedia di `/api/docs`
- Session admin lokal tersedia untuk dashboard FE
- Database persistence belum ditambahkan

---

## 📋 Konvensi Kode

### Commit Message Format

**Format**: `<type>@<scope>: <deskripsi singkat>`

**Type**:
- `feat` — Fitur baru
- `fix` — Bug fix
- `docs` — Dokumentasi
- `style` — Formatting (tanpa ubah logic)
- `refactor` — Refactoring kode

**Scope**:
- `@client` — Perubahan frontend
- `@server` — Perubahan backend
- `@client @server` — Perubahan di kedua

**Contoh**:
```bash
git commit -m "feat@client: tambah halaman registrasi pasien"
git commit -m "fix@server: perbaiki error handling token SATUSEHAT"
git commit -m "docs@client @server: update README dan instruksi setup"
```

### Naming Convention

#### Frontend (JavaScript/JSX)
- File: `camelCase.js` atau `PascalCase.js` (components)
  - Komponen: `PatientCard.js`
  - Utility: `formatDate.js`
  - Hooks: `usePatient.js`
- Variable/Function: `camelCase`
  - `const fetchPatients = async () => { ... }`
  - `const isLoading = useState(false)`
- Konstanta: `UPPER_SNAKE_CASE`
  - `const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL`

#### Backend (JavaScript)
- File: `camelCase.js` (SELALU lowercase + camelCase)
  - `patientController.js`
  - `satusehatAuthService.js`
  - `response.js`
- Function: `camelCase`
  - `const getPatientByNik = async (nik) => { ... }`
- Konstanta: `UPPER_SNAKE_CASE`
  - `const SATUSEHAT_BASE_URL = process.env.SATUSEHAT_BASE_URL`

---

## 🔌 API Response Format

**Semua respons backend menggunakan format standar**:

### Success Response (200/201)
```json
{
  "success": true,
  "message": "Pasien berhasil dibuat",
  "data": {
    "id": "12345",
    "name": "John Doe",
    "nik": "3571234567891234"
  }
}
```

### Error Response (400/404/500)
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": [
    "NIK harus 16 digit",
    "Email tidak valid"
  ]
}
```

**Kode HTTP Standar**:
- `200` OK (request berhasil)
- `201` Created (resource baru dibuat)
- `400` Bad Request (validasi gagal)
- `401` Unauthorized (token invalid/expired)
- `404` Not Found (resource tidak ada)
- `500` Internal Server Error (error backend)

---

## 🚀 Workflow Pengembangan Feature

### Scenario: Tambah Fitur "Search Patient by NIK"

#### 1️⃣ **Backend Development**

**Step 1: Tambah route**
```javascript
// server/src/routes/patient.js
router.get('/search', (req, res, next) => {
  patientController.searchByNik(req, res, next);
});
```

**Step 2: Buat controller**
```javascript
// server/src/controllers/patientController.js
const searchByNik = async (req, res, next) => {
  try {
    const { nik } = req.query;
    if (!nik || nik.length !== 16) {
      return res.status(400).json(errorResponse('NIK harus 16 digit'));
    }
    const result = await patientService.searchByNik(nik);
    return res.json(successResponse(result, 'Pasien ditemukan'));
  } catch (error) {
    next(error);
  }
};
```

**Step 3: Buat service**
```javascript
// server/src/services/patientService.js
const searchByNik = async (nik) => {
  const token = await satusehatAuthService.getToken();
  const response = await fetch(
    `${SATUSEHAT_BASE_URL}/fhir-r4/v1/Patient?identifier=${nik}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) throw new Error('SATUSEHAT API error');
  const data = await response.json();
  return data.entry || [];
};
```

**Step 4: Test endpoint**
```bash
curl "http://localhost:5000/api/patients/search?nik=3571234567891234"
```

#### 2️⃣ **Frontend Development**

**Step 1: Buat halaman/komponen**
```jsx
// client/src/app/search/page.js
'use client';
import { useState } from 'react';

export default function SearchPatient() {
  const [nik, setNik] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/search?nik=${nik}`
      );
      const data = await res.json();
      
      if (!data.success) {
        setError(data.message);
        return;
      }
      setResults(data.data);
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          placeholder="Masukkan NIK (16 digit)"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Mencari...' : 'Cari'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}
      
      {results.length > 0 && (
        <ul>
          {results.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

**Step 2: Deploy ke staging dan test**

#### 3️⃣ **Commit & Push**

```bash
# Backend commit
git add server/src/routes/patient.js server/src/controllers/patientController.js server/src/services/patientService.js
git commit -m "feat@server: tambah endpoint search pasien by NIK"
git push origin feature-branch

# Frontend commit
git add client/src/app/search/page.js
git commit -m "feat@client: tambah halaman cari pasien"
git push origin feature-branch
```

---

## 📝 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env - JANGAN di-commit)
```
PORT=5000
NODE_ENV=development

# SATUSEHAT
SATUSEHAT_BASE_URL=https://api-satusehat-stg.dto.kemkes.go.id
SATUSEHAT_ORG_ID=<your-org-id>
SATUSEHAT_CLIENT_ID=<your-client-id>
SATUSEHAT_CLIENT_SECRET=<your-client-secret>
```

---

## 🔒 Keamanan (Best Practices)

1. **Never commit `.env`** — Sudah ada di `.gitignore`
2. **Validasi input di backend** — Jangan percaya input dari client
3. **Use HTTPS di production** — Jangan HTTP
4. **Token refresh otomatis** — `satusehatAuthService` handle ini
5. **Error messages generic** — Jangan expose internal error ke client
6. **Rate limiting** — Implementasikan jika banyak traffic

---

## 📚 Endpoint List (Current)

| Method | Endpoint | Controller | Deskripsi |
|--------|----------|-----------|-----------|
| GET | `/health` | healthController | Health check |
| POST | `/register` | registrationController | Registrasi user baru |
| GET | `/patients` | patientService | List semua pasien |
| POST | `/patients` | patientService | Create pasien baru |
| GET | `/practitioners` | practitionerService | List dokter |
| POST | `/encounters` | encounterService | Create kunjungan |

**Lihat detail lengkap di**: [BACKEND_ENDPOINTS.md](./BACKEND_ENDPOINTS.md)

---

## 🎓 Tips untuk FE Developer

### Do's ✅
- Selalu handle loading state & error di UI
- Gunakan `try-catch` atau `.catch()` saat fetch
- Display user-friendly error messages
- Validate input sebelum kirim ke backend
- Gunakan environment variables untuk API URL
- Test halaman di berbagai ukuran layar (responsive)

### Don'ts ❌
- Jangan hardcode API URL (`http://localhost:5000`)
- Jangan kirim password plain text (enkripsi di backend)
- Jangan forget error handling
- Jangan block UI tanpa loading indicator
- Jangan console.log sensitive data di production

---

## 📖 Development Workflow

### Setup Awal
```bash
# Terminal 1: Backend
cd server
npm install
echo "PORT=5000" > .env
echo "SATUSEHAT_BASE_URL=..." >> .env
npm run dev

# Terminal 2: Frontend
cd client
npm install
npm run dev
```

### Per Feature Development
1. Buat branch baru: `git checkout -b feat/fitur-baru`
2. Develop di branch, test di local
3. Push ke remote: `git push origin feat/fitur-baru`
4. Merge ke master (setelah review jika perlu)
5. Hapus branch lama (opsional)

### Debugging
- **Frontend**: Buka DevTools browser (F12)
- **Backend**: Check terminal output & check `.env` vars
- **SATUSEHAT**: Simulasi endpoint di Postman/Insomnia

---

## 🔗 Referensi

- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Docs](https://expressjs.com/)
- [SATUSEHAT API Docs](https://satusehat.kemkes.go.id/platform/docs)
- [README.md](./README.md) — Quick start
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) — Detailed setup
- [client/README.md](./client/README.md) — Frontend specifics
- [server/README.md](./server/README.md) — Backend specifics

---

## 📅 Roadmap (Placeholder)

- [ ] v1.0 — MVP: patient registration + SATUSEHAT integration
- [ ] v1.1 — Add practitioner search
- [ ] v1.2 — Add encounter management
- [ ] v2.0 — Database persistence (PostgreSQL)
- [ ] v2.1 — Advanced search & filtering

---

**Last Updated**: June 2, 2026
**Maintained By**: FE & BE Team