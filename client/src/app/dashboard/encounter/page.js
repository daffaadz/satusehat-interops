"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';

function EncounterContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search and Pagination
  const [searchNik, setSearchNik] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const fetchEncounters = async (nik = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pageNum,
        limit: 8,
      };
      if (nik.trim()) {
        params.patientNik = nik.trim();
      }

      const res = await api.get('/v1/encounters', { params });
      if (res.data && res.data.data) {
        setEncounters(res.data.data.encounters || []);
        setPagination(res.data.data.pagination || {
          total: 0,
          page: pageNum,
          limit: 8,
          totalPages: 1,
        });
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memuat riwayat encounter.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncounters(searchNik, page);
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEncounters(searchNik, 1);
  };

  const handleClearSearch = () => {
    setSearchNik('');
    setPage(1);
    fetchEncounters('', 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Encounter Logs
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Riwayat Encounter Pasien
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8 space-y-6">
          
          {/* Search Filter Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-end gap-3 max-w-lg p-5 rounded-2xl border shadow-sm"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}44`,
            }}
          >
            <div className="flex-1 w-full">
              <Input
                label="Cari NIK Pasien"
                value={searchNik}
                onChange={(e) => setSearchNik(e.target.value)}
                placeholder="Masukkan 16 digit NIK"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button type="submit" className="flex-1 sm:flex-initial py-2.5 text-xs">
                Cari
              </Button>
              {searchNik && (
                <Button type="button" variant="ghost" onClick={handleClearSearch} className="flex-1 sm:flex-initial py-2.5 text-xs">
                  Reset
                </Button>
              )}
            </div>
          </form>

          {/* Encounter List / Table Card */}
          <div 
            className="rounded-3xl border shadow-xl overflow-hidden"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}44`,
            }}
          >
            {loading ? (
              <div className="px-6 py-12 text-center text-sm opacity-60">
                Memuat riwayat pendaftaran...
              </div>
            ) : error ? (
              <div className="px-6 py-12 text-center text-sm text-red-500 font-medium">
                {error}
              </div>
            ) : encounters.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm opacity-60">
                Belum ada data pendaftaran encounter yang terdaftar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr 
                      className="border-b" 
                      style={{ 
                        borderColor: `${colors.accent}33`,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'
                      }}
                    >
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[10px] opacity-75">Pasien</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[10px] opacity-75">Dokter</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[10px] opacity-75">Lokasi & Waktu</th>
                      <th className="px-5 py-4 font-semibold uppercase tracking-wider text-[10px] opacity-75">Encounter ID & Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/10">
                    {encounters.map((enc) => (
                      <tr 
                        key={enc.encounterId}
                        className="hover:bg-accent/5 transition duration-150"
                      >
                        {/* Pasien (Uncensored) */}
                        <td className="px-5 py-4 space-y-1 vertical-align-top">
                          <p className="font-semibold" style={{ color: colors.primary }}>
                            {enc.patientName}
                          </p>
                          <p className="opacity-70 text-[11px]">NIK: {enc.patientNik}</p>
                          <p className="opacity-60 text-[10px] font-mono select-all">IHS: {enc.patientIhsNumber}</p>
                        </td>

                        {/* Dokter (Uncensored) */}
                        <td className="px-5 py-4 space-y-1">
                          <p className="font-semibold">{enc.practitionerName}</p>
                          <p className="opacity-70 text-[11px]">NIK: {enc.practitionerNik}</p>
                          <p className="opacity-60 text-[10px] font-mono select-all">IHS: {enc.practitionerIhsNumber}</p>
                        </td>

                        {/* Lokasi & Waktu */}
                        <td className="px-5 py-4 space-y-1">
                          <p className="font-semibold">{enc.locationName}</p>
                          <p className="opacity-50 text-[10px]">{enc.locationId}</p>
                          <p className="opacity-75 text-[11px] mt-1">
                            {new Date(enc.registeredAt || enc.createdAt).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>

                        {/* Encounter ID & Status */}
                        <td className="px-5 py-4 space-y-2">
                          <p className="font-mono text-[10px] opacity-75 select-all">{enc.encounterId}</p>
                          <div>
                            <span 
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                              style={{
                                backgroundColor: enc.encounterStatus === 'arrived' 
                                  ? `${colors.primary}22` 
                                  : 'rgba(107, 114, 128, 0.1)',
                                color: enc.encounterStatus === 'arrived' ? colors.primary : colors.accent,
                                border: `1px solid ${enc.encounterStatus === 'arrived' ? colors.primary : colors.accent}33`
                              }}
                            >
                              {enc.encounterStatus}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <div 
                className="flex items-center justify-between px-6 py-4 border-t"
                style={{ borderColor: `${colors.accent}22` }}
              >
                <span className="text-xs opacity-60">
                  Menampilkan halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} item)
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={page <= 1 || loading}
                    onClick={() => handlePageChange(page - 1)}
                    className="py-1.5 px-3 text-xs"
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={page >= pagination.totalPages || loading}
                    onClick={() => handlePageChange(page + 1)}
                    className="py-1.5 px-3 text-xs"
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}

export default function EncounterPage() {
  return (
    <AuthGuard>
      <EncounterContent />
    </AuthGuard>
  );
}
