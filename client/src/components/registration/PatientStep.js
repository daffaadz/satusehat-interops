"use client";

import Input from '../Input';
import Button from '../Button';

export default function PatientStep({
  patientType,
  setPatientType,
  form,
  setForm,
  patientPreview,
  lookupPatient,
  loadingPatient,
  colors,
  isDark
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: colors.primary }}>
          Data Pasien
        </h2>
        <p className="text-[11px] opacity-60 mt-0.5">
          Pilih tipe pasien dan isi data diri pasien secara lengkap.
        </p>
      </div>

      {/* Segmented Control / Toggle */}
      <div className="grid grid-cols-2 p-0.5 rounded-xl bg-accent/10 border border-accent/20">
        <button
          type="button"
          onClick={() => {
            setPatientType('lama');
            setForm(prev => ({ ...prev, patientName: '', patientIhsNumber: '' }));
          }}
          className="py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
          style={{
            backgroundColor: patientType === 'lama' ? colors.primary : 'transparent',
            color: patientType === 'lama' ? '#ffffff' : colors.foreground,
          }}
        >
          Pasien Lama
        </button>
        <button
          type="button"
          onClick={() => {
            setPatientType('baru');
            setForm(prev => ({ ...prev, patientName: '', patientIhsNumber: '' }));
          }}
          className="py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer"
          style={{
            backgroundColor: patientType === 'baru' ? colors.primary : 'transparent',
            color: patientType === 'baru' ? '#ffffff' : colors.foreground,
          }}
        >
          Pasien Baru
        </button>
      </div>

      {/* Patient Lama Form */}
      {patientType === 'lama' ? (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="NIK Pasien"
                value={form.patientNik}
                onChange={(e) => setForm(prev => ({ ...prev, patientNik: e.target.value }))}
                placeholder="16 digit NIK"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={lookupPatient}
              disabled={loadingPatient}
              className="py-2 h-9 text-xs shrink-0"
            >
              {loadingPatient ? 'Mengecek...' : 'Lookup'}
            </Button>
          </div>

          {/* Patient Preview */}
          <div 
            className="rounded-xl border p-3"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
              borderColor: `${colors.accent}33`,
            }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
              Preview Pasien (SATUSEHAT)
            </p>
            {patientPreview ? (
              <div className="mt-2 space-y-1.5 text-xs">
                <div>
                  <span className="opacity-60 text-[10px] block">Nama Lengkap</span>
                  <span className="font-semibold">{patientPreview.name}</span>
                </div>
                <div>
                  <span className="opacity-60 text-[10px] block">IHS Number</span>
                  <span className="font-mono font-semibold" style={{ color: colors.primary }}>
                    {patientPreview.ihsNumber}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-[11px] opacity-60 leading-relaxed">
                Belum ada data. Klik "Lookup" untuk memverifikasi NIK.
              </p>
            )}
          </div>
        </div>
      ) : (
        // Patient Baru Form
        <div className="space-y-3">
          <Input
            label="NIK Pasien"
            value={form.patientNik}
            onChange={(e) => setForm(prev => ({ ...prev, patientNik: e.target.value }))}
            placeholder="16 digit NIK"
            inputMode="numeric"
            autoComplete="off"
          />
          <Input
            label="Nama Lengkap Pasien"
            value={form.patientName}
            onChange={(e) => setForm(prev => ({ ...prev, patientName: e.target.value }))}
            placeholder="Nama lengkap sesuai KTP"
            autoComplete="off"
          />
          <Input
            label="IHS Number Pasien"
            value={form.patientIhsNumber}
            onChange={(e) => setForm(prev => ({ ...prev, patientIhsNumber: e.target.value }))}
            placeholder="IHS Number (angka)"
            inputMode="numeric"
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
}
