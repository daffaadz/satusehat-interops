"use client";

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../lib/api';

export default function LocationFormCard({ locationName, onChangeLocationName }) {
  const { colors, isDark } = useTheme();

  const [locations, setLocations] = useState([]);
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [query, setQuery] = useState(locationName || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch lokasi saat komponen mount
  useEffect(() => {
    const fetchLocs = async () => {
      setLoadingLocs(true);
      try {
        const res = await api.get('/v1/satusehat/location');
        const bundle = res?.data;
        if (bundle?.entry) {
          setLocations(bundle.entry.map(e => e.resource));
        }
      } catch (_) {
        // silent fail
      } finally {
        setLoadingLocs(false);
      }
    };
    fetchLocs();
  }, []);

  // Sync query ke parent value
  useEffect(() => {
    setQuery(locationName || '');
  }, [locationName]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = locations.filter((loc) =>
    loc.name?.toLowerCase().includes(query.toLowerCase())
  );

  const selectLocation = (loc) => {
    setQuery(loc.name);
    onChangeLocationName({ target: { value: loc.name } });
    setOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChangeLocationName(e);
    setOpen(true);
    setHighlighted(0);
  };

  const handleKeyDown = (e) => {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return; }
    if (e.key === 'ArrowDown') { setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setHighlighted((h) => Math.max(h - 1, 0)); e.preventDefault(); }
    else if (e.key === 'Enter') { if (filtered[highlighted]) { selectLocation(filtered[highlighted]); } e.preventDefault(); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  const inputStyle = {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    borderColor: open ? colors.primary : `${colors.accent}55`,
    color: colors.foreground,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle = {
    color: colors.accent,
    fontSize: '0.65rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1.5" ref={containerRef}>
        <label style={labelStyle}>Lokasi Pelayanan</label>

        {/* Input + Dropdown toggle */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={loadingLocs ? "Memuat daftar lokasi..." : "Cari atau pilih lokasi..."}
            autoComplete="off"
            className="w-full rounded-xl border px-3 py-2.5 text-sm pr-10"
            style={inputStyle}
            disabled={loadingLocs}
          />
          {/* Chevron icon */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => { setOpen((o) => !o); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-80 transition cursor-pointer"
            style={{ color: colors.foreground }}
          >
            {open ? '▲' : '▼'}
          </button>

          {/* Dropdown list */}
          {open && !loadingLocs && (
            <div
              className="absolute z-30 w-full mt-1.5 rounded-xl border shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1a1f1d' : '#fff',
                borderColor: `${colors.accent}55`,
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-xs opacity-60" style={{ color: colors.foreground }}>
                  {query ? 'Tidak ada lokasi yang cocok.' : 'Belum ada lokasi terdaftar.'}
                </div>
              ) : (
                filtered.map((loc, idx) => (
                  <button
                    key={loc.id}
                    type="button"
                    onMouseDown={() => selectLocation(loc)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className="w-full text-left px-4 py-2.5 text-sm flex flex-col gap-0.5 transition cursor-pointer"
                    style={{
                      backgroundColor:
                        highlighted === idx
                          ? isDark ? 'rgba(93,184,159,0.15)' : 'rgba(58,138,114,0.1)'
                          : 'transparent',
                      color: colors.foreground,
                      borderBottom: idx < filtered.length - 1 ? `1px solid ${colors.accent}22` : 'none',
                    }}
                  >
                    <span className="font-semibold" style={{ color: colors.primary }}>{loc.name}</span>
                    {loc.description && loc.description !== loc.name && (
                      <span className="text-[11px] opacity-60">{loc.description}</span>
                    )}
                    {loc.status && loc.status !== 'active' && (
                      <span className="text-[10px] font-bold uppercase" style={{ color: loc.status === 'inactive' ? '#9ca3af' : '#facc15' }}>
                        {loc.status}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <p className="text-[11px] opacity-60" style={{ color: colors.foreground }}>
          {locations.length > 0
            ? `${locations.length} lokasi tersedia. Ketik untuk mencari atau pilih dari daftar.`
            : 'Tambahkan lokasi terlebih dahulu di halaman Lokasi.'}
        </p>
      </div>

      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: `${colors.accent}33`,
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.accent }}>
          Langkah akhir
        </p>
        <p className="mt-1 text-xs leading-5" style={{ color: colors.foreground }}>
          Setelah data valid, kirim form ini untuk membuat registrasi pasien terpadu.
        </p>
      </div>
    </section>
  );
}