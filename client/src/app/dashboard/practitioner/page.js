"use client";

import { useState, useEffect } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Input from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';
import { useRouter } from 'next/navigation';

function PractitionerContent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [practitioners, setPractitioners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const fetchPractitioners = async (query = '', pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('search', query);
      params.append('page', pageNum);
      params.append('limit', 10);

      const response = await api.get(`/v1/practitioners?${params.toString()}`);
      
      const payload = response?.data;
      if (payload) {
        setPractitioners(payload.data || []);
        setTotalPages(payload.totalPages || 1);
        setTotalItems(payload.total || 0);
      } else {
        setPractitioners([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data praktisi');
      setPractitioners([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Whenever searchQuery changes, reset to page 1
      setPage(1);
      fetchPractitioners(searchQuery, 1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle pagination changes
  useEffect(() => {
    // Prevent fetching again if page changes but it's already handled by search query effect
    // But we need to fetch if ONLY page changes.
    // Actually, setting page in search effect triggers this. 
    // We can just fetch on page change, but avoid double fetching by checking.
    // A simpler way: only fetch when page changes if it's not page 1 resetting from query.
    // Let's just fetch here, and remove fetch from the debounce above (only setPage(1)).
    // Wait, setting state is async, better to fetch explicitly in debounce if query changes,
    // and fetch here only when page changes explicitly via buttons.
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchPractitioners(searchQuery, newPage);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Manajemen Data
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Pencarian Praktisi
          </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-5 lg:px-10 lg:py-6 overflow-y-auto">
          <div
            className="bg-card-bg backdrop-blur-sm p-6 rounded-2xl shadow-lg border flex flex-col gap-5 min-h-[500px]"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}55`,
            }}
          >
            {/* Search Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
                Cari Praktisi Dinamis
              </label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik NIK atau Nama Praktisi..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl border-l-4 p-4"
                style={{
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  borderColor: '#ef4444',
                }}
              >
                <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                  ⚠ {error}
                </p>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border flex-1" style={{ borderColor: `${colors.accent}33` }}>
              <table className="w-full text-sm border-collapse table-fixed">
                <colgroup>
                  <col style={{ width: '40%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '35%' }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                    {['Nama Praktisi', 'NIK', 'IHS Number'].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: colors.accent, borderBottom: `1px solid ${colors.accent}33` }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm opacity-70">
                        <div className="flex justify-center mb-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colors.primary }}></div>
                        </div>
                        Mencari data...
                      </td>
                    </tr>
                  ) : practitioners.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center">
                        <span className="text-4xl mb-3 block">🩺</span>
                        <p className="text-base font-medium" style={{ color: colors.primary }}>Tidak ada praktisi ditemukan</p>
                        <p className="text-xs mt-1 opacity-70">Coba ubah kata kunci pencarian Anda.</p>
                      </td>
                    </tr>
                  ) : (
                    practitioners.map((practitioner, idx) => {
                      const isLast = idx === practitioners.length - 1;
                      return (
                        <tr
                          key={practitioner.nik || idx}
                          className="transition hover:bg-white/5"
                          style={!isLast ? { borderBottom: `1px solid ${colors.accent}22` } : {}}
                        >
                          <td className="px-4 py-3 font-semibold truncate" style={{ color: colors.primary }}>
                            {practitioner.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs truncate" style={{ color: colors.primary }}>
                            {practitioner.nik || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="font-mono text-[11px] px-1.5 py-0.5 rounded truncate min-w-0 flex-1"
                                title={practitioner.ihsNumber}
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: colors.foreground }}
                              >
                                {practitioner.ihsNumber || 'N/A'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 0 && (
              <div className="flex items-center justify-between border-t pt-4 mt-2" style={{ borderColor: `${colors.accent}33` }}>
                <p className="text-xs opacity-75">
                  Menampilkan {practitioners.length} dari {totalItems} data
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: `${colors.accent}22`, color: colors.foreground }}
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-medium px-2" style={{ color: colors.primary }}>
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer hover:opacity-85 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: `${colors.accent}22`, color: colors.foreground }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

          </div>
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
