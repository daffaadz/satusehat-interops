"use client";

export default function PractitionerStep({
  form,
  setForm,
  practitioners,
  loadingPractitioners,
  practitionerQuery,
  setPractitionerQuery,
  practitionerDropdownOpen,
  setPractitionerDropdownOpen,
  practitionerHighlight,
  setPractitionerHighlight,
  colors,
  isDark,
  practitionerRef
}) {
  const filteredPractitioners = practitioners.filter(p =>
    p.name.toLowerCase().includes(practitionerQuery.toLowerCase())
  );

  const selectPractitioner = (p) => {
    setForm(prev => ({
      ...prev,
      practitionerNik: p.nik,
      practitionerName: p.name,
      practitionerIhsNumber: p.ihsNumber
    }));
    setPractitionerQuery(p.name);
    setPractitionerDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: colors.primary }}>
          Pilih Praktisi / Dokter
        </h2>
        <p className="text-[11px] opacity-60 mt-0.5">
          Pilih praktisi kesehatan yang akan menangani pasien dari daftar dokter aktif.
        </p>
      </div>

      {/* Searchable Dropdown */}
      <div className="flex flex-col gap-1.5" ref={practitionerRef}>
        <label className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
          Praktisi Medis
        </label>
        <div className="relative">
          <input
            type="text"
            value={practitionerQuery}
            onChange={(e) => {
              setPractitionerQuery(e.target.value);
              setPractitionerDropdownOpen(true);
              setPractitionerHighlight(0);
            }}
            onFocus={() => {
              setPractitionerDropdownOpen(true);
              if (form.practitionerName && practitionerQuery === '') {
                setPractitionerQuery(form.practitionerName);
              }
            }}
            placeholder={loadingPractitioners ? "Memuat praktisi..." : "Ketik untuk mencari dokter..."}
            disabled={loadingPractitioners}
            className="w-full rounded-xl border px-3 py-2 text-xs pr-10 outline-none transition"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderColor: practitionerDropdownOpen ? colors.primary : `${colors.accent}44`,
              color: colors.foreground,
            }}
          />
          <button
            type="button"
            onClick={() => setPractitionerDropdownOpen(o => !o)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 cursor-pointer"
            style={{ color: colors.foreground }}
          >
            {practitionerDropdownOpen ? '▲' : '▼'}
          </button>

          {/* Dropdown list */}
          {practitionerDropdownOpen && (
            <div
              className="absolute z-30 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1a1f1d' : '#ffffff',
                borderColor: `${colors.accent}55`,
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {filteredPractitioners.length === 0 ? (
                <div className="px-3 py-2 text-xs opacity-60">
                  Tidak ada dokter yang cocok.
                </div>
              ) : (
                filteredPractitioners.map((p, idx) => (
                  <button
                    key={p.nik}
                    type="button"
                    onMouseDown={() => selectPractitioner(p)}
                    onMouseEnter={() => setPractitionerHighlight(idx)}
                    className="w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 transition cursor-pointer"
                    style={{
                      backgroundColor: practitionerHighlight === idx
                        ? isDark ? 'rgba(93,184,159,0.15)' : 'rgba(58,138,114,0.1)'
                        : 'transparent',
                      color: colors.foreground,
                      borderBottom: idx < filteredPractitioners.length - 1 ? `1px solid ${colors.accent}22` : 'none',
                    }}
                  >
                    <span className="font-semibold" style={{ color: colors.primary }}>{p.name}</span>
                    <span className="text-[10px] opacity-60">NIK: {p.nik} | IHS: {p.ihsNumber}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Doctor Selected Card */}
      {form.practitionerIhsNumber && (
        <div 
          className="rounded-xl border p-3 flex justify-between items-center"
          style={{
            backgroundColor: `${colors.primary}0a`,
            borderColor: `${colors.primary}33`,
          }}
        >
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: colors.primary }}>
              Dokter Terpilih
            </span>
            <p className="text-xs font-semibold mt-0.5">{form.practitionerName}</p>
            <p className="text-[10px] opacity-60">IHS Number: {form.practitionerIhsNumber}</p>
          </div>
          <span className="text-xl">🩺</span>
        </div>
      )}
    </div>
  );
}
