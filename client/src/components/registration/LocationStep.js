"use client";

export default function LocationStep({
  form,
  setForm,
  locations,
  loadingLocations,
  locationQuery,
  setLocationQuery,
  locationDropdownOpen,
  setLocationDropdownOpen,
  locationHighlight,
  setLocationHighlight,
  colors,
  isDark,
  locationRef
}) {
  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const selectLocation = (l) => {
    setForm(prev => ({
      ...prev,
      locationId: l.id,
      locationName: l.name
    }));
    setLocationQuery(l.name);
    setLocationDropdownOpen(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: colors.primary }}>
          Pilih Ruangan / Lokasi
        </h2>
        <p className="text-[11px] opacity-60 mt-0.5">
          Pilih ruangan poli atau tempat pelayanan pasien dari daftar lokasi terdaftar di SATUSEHAT.
        </p>
      </div>

      {/* Location Searchable Dropdown */}
      <div className="flex flex-col gap-1.5" ref={locationRef}>
        <label className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
          Lokasi Pelayanan
        </label>
        <div className="relative">
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setLocationDropdownOpen(true);
              setLocationHighlight(0);
            }}
            onFocus={() => {
              setLocationDropdownOpen(true);
              if (form.locationName && locationQuery === '') {
                setLocationQuery(form.locationName);
              }
            }}
            placeholder={loadingLocations ? "Memuat lokasi..." : "Ketik untuk mencari ruangan..."}
            disabled={loadingLocations}
            className="w-full rounded-xl border px-3 py-2 text-xs pr-10 outline-none transition"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderColor: locationDropdownOpen ? colors.primary : `${colors.accent}44`,
              color: colors.foreground,
            }}
          />
          <button
            type="button"
            onClick={() => setLocationDropdownOpen(o => !o)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 cursor-pointer"
            style={{ color: colors.foreground }}
          >
            {locationDropdownOpen ? '▲' : '▼'}
          </button>

          {/* Dropdown list */}
          {locationDropdownOpen && (
            <div
              className="absolute z-30 w-full mt-1 rounded-xl border shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1a1f1d' : '#ffffff',
                borderColor: `${colors.accent}55`,
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            >
              {filteredLocations.length === 0 ? (
                <div className="px-3 py-2 text-xs opacity-60">
                  Tidak ada lokasi yang cocok.
                </div>
              ) : (
                filteredLocations.map((l, idx) => (
                  <button
                    key={l.id}
                    type="button"
                    onMouseDown={() => selectLocation(l)}
                    onMouseEnter={() => setLocationHighlight(idx)}
                    className="w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 transition cursor-pointer"
                    style={{
                      backgroundColor: locationHighlight === idx
                        ? isDark ? 'rgba(93,184,159,0.15)' : 'rgba(58,138,114,0.1)'
                        : 'transparent',
                      color: colors.foreground,
                      borderBottom: idx < filteredLocations.length - 1 ? `1px solid ${colors.accent}22` : 'none',
                    }}
                  >
                    <span className="font-semibold" style={{ color: colors.primary }}>{l.name}</span>
                    {l.description && <span className="text-[10px] opacity-60">{l.description}</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Location Card */}
      {form.locationId && (
        <div 
          className="rounded-xl border p-3 flex justify-between items-center"
          style={{
            backgroundColor: `${colors.primary}0a`,
            borderColor: `${colors.primary}33`,
          }}
        >
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: colors.primary }}>
              Lokasi Terpilih
            </span>
            <p className="text-xs font-semibold mt-0.5">{form.locationName}</p>
            <p className="text-[10px] opacity-60">Location ID: {form.locationId}</p>
          </div>
          <span className="text-xl">🏢</span>
        </div>
      )}
    </div>
  );
}
