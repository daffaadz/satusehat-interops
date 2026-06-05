"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';

function AddEncounterModal({ onClose, onSuccess, colors, isDark }) {
  const [patientNik, setPatientNik] = useState('9104025209000006');
  const [practitionerNik, setPractitionerNik] = useState('3322071302900002');
  const [locationName, setLocationName] = useState('Ruang Poli Umum');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientNik.trim() || !practitionerNik.trim()) { 
      setError('NIK Pasien dan Dokter wajib diisi.'); 
      return; 
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/v1/register', {
        patientNik: patientNik.trim(),
        practitionerNik: practitionerNik.trim(),
        locationName: locationName.trim() || "Ruang Poli Umum"
      });

      onSuccess(response);
    } catch (err) {
      console.error("Gagal mendaftarkan kunjungan:", err);
      setError(err.payload?.message || err.message || 'Gagal mendaftarkan encounter. Pastikan backend berjalan.');
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
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ backgroundColor: colors.cardBg, borderColor: `${colors.accent}44` }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold" style={{ color: colors.primary }}>Registrasi Kunjungan Baru</h2>
          <button
            onClick={onClose}
            className="rounded-full flex items-center justify-center transition hover:opacity-70 cursor-pointer text-lg leading-none"
            style={{ width: '28px', height: '28px', backgroundColor: `${colors.accent}22`, color: colors.foreground }}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium opacity-80">NIK Pasien (16 digit)</label>
            <input
              required
              autoFocus
              value={patientNik || ""}
              onChange={(e) => { setPatientNik(e.target.value); setError(null); }}
              placeholder="Contoh: 1000000000000001"
              className="w-full rounded-xl border px-3 py-2 text-sm transition font-mono"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderColor: error ? '#ef4444' : `${colors.accent}55`,
                color: colors.foreground,
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium opacity-80">NIK Dokter / Practitioner</label>
            <input
              required
              value={practitionerNik || ""}
              onChange={(e) => setPractitionerNik(e.target.value)}
              placeholder="Contoh: 1000000000000002"
              className="w-full rounded-xl border px-3 py-2 text-sm transition font-mono"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderColor: `${colors.accent}55`,
                color: colors.foreground,
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium opacity-80">Nama Ruangan / Lokasi</label>
            <input
              value={locationName || ""}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Contoh: Ruang Poli Umum"
              className="w-full rounded-xl border px-3 py-2 text-sm transition"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                borderColor: `${colors.accent}55`,
                color: colors.foreground,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: colors.primary, color: isDark ? '#0d1210' : '#fff' }}
            >
              {loading ? 'Memproses...' : 'Daftarkan Pasien'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl text-sm font-semibold border transition cursor-pointer hover:opacity-75"
              style={{ 
                paddingLeft: '24px', 
                paddingRight: '24px', 
                paddingTop: '10px', 
                paddingBottom: '10px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                borderColor: `${colors.accent}55`, 
                color: colors.foreground 
              }}
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EncountersContent() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const [encounters, setEncounters] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEncounters = async (nikQuery = '') => {
    setLoadingList(true);
    try {
      let path = '/v1/encounters';
      if (nikQuery.trim()) {
        path += `?patientNik=${encodeURIComponent(nikQuery.trim())}`;
      }
      
      const response = await api.get(path);

      const fetchedData = response?.data?.encounters || response?.encounters || [];
      setEncounters(fetchedData);
      
    } catch (err) {
      console.error("Gagal mengambil daftar riwayat kunjungan:", err);
      setEncounters([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchEncounters();
  }, []);

  const handleSearchClick = () => {
    fetchEncounters(searchQuery);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    fetchEncounters();
  };

  const statusBadge = (status) => {
    if (status === 'arrived') return { bg: 'rgba(74,222,128,0.2)', color: '#4ade80', label: 'ARRIVED' };
    if (status === 'finished') return { bg: 'rgba(156,163,175,0.2)', color: '#9ca3af', label: 'FINISHED' };
    if (status === 'in-progress') return { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6', label: 'IN PROGRESS' };
    return { bg: 'rgba(250,204,21,0.2)', color: '#facc15', label: (status || 'UNKNOWN').toUpperCase() };
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Encounters
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Riwayat Kunjungan
          </h1>
        </header>

        <main className="flex-1 px-6 py-5 lg:px-10 lg:py-6 overflow-y-auto">
          <div
            className="bg-card-bg backdrop-blur-sm p-6 rounded-2xl border flex flex-col gap-6 min-h-[500px]"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}55`,
            }}
          >
            
            {/* SEARCH AND CONTROL HEADERS */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end justify-between">
              <div className="flex flex-col gap-3 flex-1 max-w-xl">
                
                {/* Search Fields Controls */}
                <div className="flex gap-3 w-full">
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan NIK Pasien..."
                    className="flex-1 rounded-xl border px-4 py-3 text-sm transition min-w-0 font-mono"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      borderColor: `${colors.accent}55`,
                      color: colors.foreground,
                      outline: 'none',
                    }}
                  />
                  <button 
                    onClick={handleSearchClick}
                    className="rounded-xl text-sm font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 shadow-sm"
                    style={{ 
                      paddingLeft: '32px', 
                      paddingRight: '32px', 
                      paddingTop: '12px', 
                      paddingBottom: '12px', 
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      minWidth: 'max-content',
                      backgroundColor: colors.primary, 
                      color: isDark ? '#0d1210' : '#fff' 
                    }}
                  >
                    Cari NIK
                  </button>
                </div>
              </div>

              {/* Functional Interactive Trigger Buttons */}
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-xl text-sm font-semibold transition cursor-pointer hover:opacity-85 active:scale-95 shadow-sm"
                style={{
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  minWidth: 'max-content',
                  backgroundColor: colors.primary,
                  color: isDark ? '#0d1210' : '#fff',
                }}
              >
                <span className="text-base leading-none">+</span>
                Tambah Kunjungan
              </button>
            </div>

            {/* DATA VIEWPORT MANAGEMENT AREA */}
            {loadingList ? (
              <div className="flex flex-col gap-3 py-16 items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
                <span className="text-sm opacity-85">Mengambil riwayat kunjungan...</span>
              </div>
            ) : encounters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="text-5xl mb-4">🏥</span>
                <p className="text-base font-medium" style={{ color: colors.primary }}>Belum ada kunjungan terdaftar</p>
                <p className="text-xs max-w-xs mt-1 opacity-70">
                  {searchQuery ? `Tidak ada kunjungan untuk NIK "${searchQuery}"` : "Daftarkan pasien baru menggunakan tombol di atas."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border mt-2" style={{ borderColor: `${colors.accent}33` }}>
                <table className="w-full text-sm border-collapse table-fixed">
                  <colgroup>
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '25%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '20%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                      {['Pasien', 'Dokter Penanggung Jawab', 'Lokasi', 'Status', 'ID Kunjungan'].map((h) => (
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
                    {encounters.map((enc, idx) => {
                      const isLast = idx === encounters.length - 1;
                      const badge = statusBadge(enc.encounterStatus);

                      return (
                        <tr
                          key={enc.id || enc.encounterId}
                          className="transition hover:bg-white/5"
                          style={!isLast ? { borderBottom: `1px solid ${colors.accent}22` } : {}}
                        >
                          <td className="px-4 py-4 min-w-0">
                            <div className="flex flex-col truncate">
                              <span className="font-semibold truncate" style={{ color: colors.primary }}>
                                {enc.patientName || 'Tanpa Nama'}
                              </span>
                              <span className="text-[10px] font-mono opacity-60 tracking-wide mt-0.5">
                                IHS: {enc.patientIhsNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 min-w-0">
                            <div className="flex flex-col truncate">
                              <span className="font-medium truncate opacity-90">
                                {enc.practitionerName || '—'}
                              </span>
                              <span className="text-[10px] font-mono opacity-50 tracking-wide mt-0.5">
                                IHS: {enc.practitionerIhsNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs truncate opacity-80" title={enc.locationName}>
                            {enc.locationName || '—'}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider"
                              style={{ backgroundColor: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="font-mono text-[11px] px-1.5 py-0.5 rounded truncate min-w-0 flex-1"
                                title={enc.encounterId}
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: colors.foreground }}
                              >
                                {enc.encounterId}
                              </span>
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
        <AddEncounterModal
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          colors={colors}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default function EncountersPage() {
  return (
    <AuthGuard>
      <EncountersContent />
    </AuthGuard>
  );
}