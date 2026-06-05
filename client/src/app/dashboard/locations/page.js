"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Popup from '../../../components/Popup';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';

function AddLocationModal({ onClose, onSuccess, colors, isDark }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Nama lokasi tidak boleh kosong.'); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await api.post('/v1/satusehat/location', {
        name: name.trim(),
        description: name.trim(),
      });
      const newLocationId = result?.data?.locationId;
      onSuccess({
        id: newLocationId || `temp-${Date.now()}`,
        name: name.trim(),
        status: 'active',
        identifier: [],
      });
    } catch (err) {
      setError(err?.payload?.message || err?.message || 'Gagal menambahkan lokasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-2xl border p-6 flex flex-col gap-4"
        style={{ backgroundColor: colors.cardBg, borderColor: `${colors.accent}44` }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: colors.primary }}>Tambah Lokasi</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition hover:opacity-70 cursor-pointer text-lg leading-none"
            style={{ backgroundColor: `${colors.accent}22`, color: colors.foreground }}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            placeholder="Nama lokasi, contoh: Ruang Poli Umum"
            className="w-full rounded-xl border px-3 py-2.5 text-sm transition"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderColor: error ? '#ef4444' : `${colors.accent}55`,
              color: colors.foreground,
              outline: 'none',
            }}
          />

          {error && (
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: colors.primary, color: isDark ? '#0d1210' : '#fff' }}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold border transition cursor-pointer hover:opacity-75"
              style={{ borderColor: `${colors.accent}55`, color: colors.foreground }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LocationsContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const [locations, setLocations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [popup, setPopup] = useState(null);

  const fetchLocations = async () => {
    setLoadingList(true);
    try {
      const response = await api.get('/v1/satusehat/location');
      // Server membungkus response dengan sendSuccess() → data ada di response.data.data
      const bundle = response?.data?.data ?? response?.data;
      if (bundle && bundle.entry) {
        setLocations(bundle.entry.map(e => e.resource));
      } else {
        setLocations([]);
      }
    } catch (err) {
      console.error("Gagal mengambil daftar lokasi:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleModalSuccess = (newLocation) => {
    setShowModal(false);
    // Optimistic update: langsung tampilkan lokasi baru tanpa nunggu SATUSEHAT
    if (newLocation) {
      setLocations((prev) => [...prev, newLocation]);
      setPopup({
        type: 'success',
        title: 'Lokasi Berhasil Ditambahkan',
        message: `Lokasi "${newLocation.name}" dengan ID ${newLocation.id} berhasil terdaftar di SATUSEHAT dan tersimpan di database lokal.`,
        confirmLabel: 'Tutup'
      });
    }
    // Tetap re-fetch di background untuk sinkronisasi
    fetchLocations();
  };

  const statusBadge = (status) => {
    if (status === 'inactive') return { bg: 'rgba(156,163,175,0.2)', color: '#9ca3af' };
    if (status === 'suspended') return { bg: 'rgba(250,204,21,0.2)', color: '#facc15' };
    return { bg: 'rgba(74,222,128,0.2)', color: '#4ade80' };
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Location Management
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Daftar Lokasi Terdaftar
          </h1>
        </header>

        {/* Konten */}
        <main className="flex-1 px-6 py-5 lg:px-10 lg:py-6 overflow-y-auto">
          <div
            className="bg-card-bg backdrop-blur-sm p-6 rounded-2xl shadow-lg border flex flex-col gap-5 min-h-[500px]"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}55`,
            }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                  Lokasi SATUSEHAT
                </h2>
                <p className="text-xs opacity-75" style={{ color: colors.foreground }}>
                  {locations.length} lokasi terdeteksi untuk organisasi Anda
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer hover:opacity-85 active:scale-95"
                style={{
                  backgroundColor: colors.primary,
                  color: isDark ? '#0d1210' : '#fff',
                }}
              >
                <span className="text-base leading-none">+</span>
                Tambah Lokasi
              </button>
            </div>

            {/* Loading */}
            {loadingList ? (
              <div className="flex flex-col gap-3 py-16 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
                <span className="text-sm opacity-85">Mengambil data dari SATUSEHAT...</span>
              </div>
            ) : locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">📍</span>
                <p className="text-base font-medium" style={{ color: colors.primary }}>Belum ada lokasi terdaftar</p>
                <p className="text-xs max-w-xs mt-1 opacity-70">Tambahkan lokasi baru dengan tombol di atas.</p>
              </div>
            ) : (
              /* Table */
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: `${colors.accent}33` }}>
                <table className="w-full text-sm border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: '30%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '43%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                      {['Nama Lokasi', 'Kode', 'Status', 'ID Lokasi'].map((h) => (
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
                    {locations.map((loc, idx) => {
                      const identifierValue = loc.identifier?.[0]?.value ?? '—';
                      const status = loc.status || 'active';
                      const badge = statusBadge(status);
                      const isLast = idx === locations.length - 1;

                      return (
                        <tr
                          key={loc.id}
                          className="transition hover:bg-white/5"
                          style={!isLast ? { borderBottom: `1px solid ${colors.accent}22` } : {}}
                        >
                          {/* Nama */}
                          <td className="px-4 py-3 font-semibold truncate" style={{ color: colors.primary }}>
                            {loc.name || 'Tanpa Nama'}
                          </td>

                          {/* Kode */}
                          <td className="px-4 py-3 font-mono text-xs truncate" style={{ color: colors.primary }}>
                            {identifierValue}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                              {status}
                            </span>
                          </td>

                          {/* ID */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="font-mono text-[11px] px-1.5 py-0.5 rounded truncate min-w-0 flex-1"
                                title={loc.id}
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: colors.foreground }}
                              >
                                {loc.id}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(loc.id);
                                  alert('ID Lokasi disalin: ' + loc.id);
                                }}
                                title="Salin ID"
                                className="shrink-0 text-xs hover:opacity-70 transition cursor-pointer"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <AddLocationModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          colors={colors}
          isDark={isDark}
        />
      )}

      {popup && (
        <Popup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          confirmLabel={popup.confirmLabel}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default function LocationsPage() {
  return (
    <AuthGuard>
      <LocationsContent />
    </AuthGuard>
  );
}