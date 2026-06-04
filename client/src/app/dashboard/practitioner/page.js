"use client";

import { useState } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

function PractitionerCard({ practitioner, colors }) {
  if (!practitioner) {
    return null;
  }

  return (
    <div
      className="space-y-4 rounded-2xl border p-6"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: `${colors.accent}55`,
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
          Informasi Praktisi
        </p>
      </div>

      {/* Nama */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
          Nama Lengkap
        </p>
        <p className="mt-2 text-sm font-semibold" style={{ color: colors.primary }}>
          {practitioner.name || 'N/A'}
        </p>
      </div>

      {/* NIK & IHS Number */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
            NIK
          </p>
          <p className="mt-2 break-all text-sm font-mono font-semibold" style={{ color: colors.primary }}>
            {practitioner.nik || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
            IHS Number
          </p>
          <p className="mt-2 break-all text-sm font-mono font-semibold" style={{ color: colors.primary }}>
            {practitioner.ihsNumber || 'N/A'}
          </p>
        </div>
      </div>

      {/* Status */}
      <div
        className="rounded-lg border-l-4 p-4"
        style={{
          backgroundColor: `${colors.accent}11`,
          borderColor: colors.accent,
        }}
      >
        <p className="text-xs font-semibold" style={{ color: colors.accent }}>
          ✓ Praktisi ditemukan di database lokal
        </p>
      </div>
    </div>
  );
}

function PractitionerContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const [searchType, setSearchType] = useState('nik'); // 'nik' atau 'name'
  const [nik, setNik] = useState('');
  const [name, setName] = useState('');

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSearchByNik = async () => {
    if (!nik.trim()) {
      setError('NIK harus diisi');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await api.get(`/v1/practitioners/${nik}`);
      if (response && response.data) {
        setResults(response.data);
      } else {
        setError('Praktisi tidak ditemukan');
      }
    } catch (err) {
      setError(err.message || 'Gagal mencari praktisi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByName = async () => {
    if (!name.trim()) {
      setError('Nama harus diisi');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const params = new URLSearchParams();
      params.append('search', name);

      const response = await api.get(`/v1/practitioners?${params.toString()}`);
      const data = response?.data ?? response;
      if (data && Array.isArray(data) && data.length > 0) {
        setResults(data[0]);
      } else {
        setError('Praktisi tidak ditemukan');
      }
    } catch (err) {
      setError(err.message || 'Gagal mencari praktisi');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setNik('');
    setName('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Header */}
        <header
          className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-5 lg:px-10"
        >
          <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Manajemen Data
          </p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl lg:text-4xl" style={{ color: colors.primary }}>
            Pencarian Praktisi
          </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-6 lg:px-10 lg:py-8">
          {/* Search Tab */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => {
                setSearchType('nik');
                handleClearSearch();
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition"
              style={{
                backgroundColor: searchType === 'nik' ? colors.primary : colors.cardBg,
                color: searchType === 'nik' ? '#fff' : colors.foreground,
                borderColor: `${colors.accent}55`,
                border: '1px solid',
              }}
            >
              Cari by NIK
            </button>
            <button
              onClick={() => {
                setSearchType('name');
                handleClearSearch();
              }}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition"
              style={{
                backgroundColor: searchType === 'name' ? colors.primary : colors.cardBg,
                color: searchType === 'name' ? '#fff' : colors.foreground,
                borderColor: `${colors.accent}55`,
                border: '1px solid',
              }}
            >
              Cari by Nama
            </button>
          </div>

          {/* Search Form - NIK */}
          {searchType === 'nik' && (
            <div
              className="space-y-4 rounded-2xl border p-6 mb-6"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: `${colors.accent}55`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
                Cari Praktisi by NIK
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="NIK Praktisi (16 digit)"
                    value={nik}
                    onChange={(e) => {
                      setNik(e.target.value);
                      setError(null);
                    }}
                    placeholder="Masukkan NIK 16 digit"
                    inputMode="numeric"
                    maxLength={16}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearchByNik}
                    disabled={loading || !nik.trim()}
                    variant={loading ? 'secondary' : 'primary'}
                  >
                    {loading ? 'Mencari...' : 'Cari'}
                  </Button>
                  {results && (
                    <Button onClick={handleClearSearch} variant="secondary">
                      Bersihkan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Form - Name */}
          {searchType === 'name' && (
            <div
              className="space-y-4 rounded-2xl border p-6 mb-6"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: `${colors.accent}55`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
                Cari Praktisi by Nama
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Input
                    label="Nama Praktisi"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    placeholder="Masukkan nama praktisi"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSearchByName}
                    disabled={loading || !name.trim()}
                    variant={loading ? 'secondary' : 'primary'}
                  >
                    {loading ? 'Mencari...' : 'Cari'}
                  </Button>
                  {results && (
                    <Button onClick={handleClearSearch} variant="secondary">
                      Bersihkan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 rounded-2xl border-l-4 p-4"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.accent,
              }}
            >
              <p className="text-sm font-medium" style={{ color: colors.accent }}>
                ⚠ {error}
              </p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <PractitionerCard practitioner={results} colors={colors} />
            </div>
          )}

          {/* Empty State */}
          {!results && !loading && !error && (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: `${colors.accent}55`,
              }}
            >
              <p className="text-sm leading-6" style={{ color: colors.foreground }}>
                Masukkan kriteria pencarian untuk menampilkan data praktisi.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function PractitionerPage() {
  return (
    <AuthGuard>
      <PractitionerContent />
    </AuthGuard>
  );
}
