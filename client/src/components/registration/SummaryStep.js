"use client";

export default function SummaryStep({ patientType, form, colors }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: colors.primary }}>
          Ringkasan Registrasi
        </h2>
        <p className="text-[11px] opacity-60 mt-0.5">
          Periksa kembali detail data pendaftaran sebelum dikirim ke SATUSEHAT.
        </p>
      </div>

      {/* Summary Details */}
      <div className="space-y-3 divide-y divide-accent/20 max-h-[300px] overflow-y-auto pr-1">
        
        {/* Pasien */}
        <div className="pt-0 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
            Pasien ({patientType === 'lama' ? 'Pasien Lama' : 'Pasien Baru'})
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="opacity-60 text-[10px] block">Nama Lengkap</span>
              <span className="font-semibold">{form.patientName}</span>
            </div>
            <div>
              <span className="opacity-60 text-[10px] block">IHS Number</span>
              <span className="font-semibold">{form.patientIhsNumber}</span>
            </div>
            <div className="col-span-2">
              <span className="opacity-60 text-[10px] block">NIK Pasien</span>
              <span className="font-semibold">{form.patientNik}</span>
            </div>
          </div>
        </div>

        {/* Dokter */}
        <div className="pt-3 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
            Praktisi / Dokter
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="opacity-60 text-[10px] block">Nama Lengkap</span>
              <span className="font-semibold">{form.practitionerName}</span>
            </div>
            <div>
              <span className="opacity-60 text-[10px] block">IHS Number</span>
              <span className="font-semibold">{form.practitionerIhsNumber}</span>
            </div>
          </div>
        </div>

        {/* Lokasi */}
        <div className="pt-3 space-y-1">
          <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
            Ruangan / Lokasi Pelayanan
          </span>
          <div className="text-xs space-y-1">
            <div>
              <span className="opacity-60 text-[10px] block">Nama Lokasi</span>
              <span className="font-semibold">{form.locationName}</span>
            </div>
            <div>
              <span className="opacity-60 text-[10px] block">Location ID</span>
              <span className="font-mono text-[10px] font-semibold">{form.locationId}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
