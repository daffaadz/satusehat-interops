"use client";

import { useState, useEffect, useRef } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Popup from '../../../components/Popup';
import Input from '../../../components/Input';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';

const INITIAL_FORM = {
  patientNik: '',
  patientName: '',
  patientIhsNumber: '',
  practitionerNik: '',
  practitionerName: '',
  practitionerIhsNumber: '',
  locationId: '',
  locationName: '',
};

const isValidNik = (value) => /^\d{16}$/.test(value);
const isValidIhs = (value) => /^\d{5,15}$/.test(value);

const getFriendlyErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (error.payload?.message) return error.payload.message;
  return error.message || fallback;
};

function IntakeContent() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  // Step state: 1 (Patient), 2 (Practitioner), 3 (Location), 4 (Summary & Register)
  const [step, setStep] = useState(1);
  const [patientType, setPatientType] = useState('lama'); // 'lama' or 'baru'
  const [form, setForm] = useState(INITIAL_FORM);

  // Loading states
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [loadingPractitioners, setLoadingPractitioners] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Preview & List states
  const [patientPreview, setPatientPreview] = useState(null);
  const [practitioners, setPractitioners] = useState([]);
  const [locations, setLocations] = useState([]);

  // Search & Dropdown states
  const [practitionerQuery, setPractitionerQuery] = useState('');
  const [practitionerDropdownOpen, setPractitionerDropdownOpen] = useState(false);
  const [practitionerHighlight, setPractitionerHighlight] = useState(0);

  const [locationQuery, setLocationQuery] = useState('');
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [locationHighlight, setLocationHighlight] = useState(0);

  // UI status states
  const [stepError, setStepError] = useState(null);
  const [popup, setPopup] = useState(null);
  const [result, setResult] = useState(null);

  const practitionerRef = useRef(null);
  const locationRef = useRef(null);

  // Fetch practitioners and locations
  useEffect(() => {
    const fetchData = async () => {
      setLoadingPractitioners(true);
      setLoadingLocations(true);
      try {
        // Fetch local database practitioners
        const pracRes = await api.get('/v1/practitioners');
        if (pracRes.data && pracRes.data.data) {
          setPractitioners(pracRes.data.data);
        }

        // Fetch SATUSEHAT location list
        const locRes = await api.get('/v1/satusehat/location');
        const bundle = locRes?.data;
        if (bundle?.entry) {
          setLocations(bundle.entry.map(e => e.resource));
        }
      } catch (err) {
        console.error("Gagal memuat data pendukung:", err);
      } finally {
        setLoadingPractitioners(false);
        setLoadingLocations(false);
      }
    };
    fetchData();
  }, []);

  // Handle outside clicks for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (practitionerRef.current && !practitionerRef.current.contains(event.target)) {
        setPractitionerDropdownOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const lookupPatient = async () => {
    const nik = form.patientNik.trim();

    if (!isValidNik(nik)) {
      setStepError('NIK pasien harus 16 digit angka.');
      setPatientPreview(null);
      return;
    }

    setLoadingPatient(true);
    setStepError(null);

    try {
      const response = await api.get(`/v1/satusehat/patient/${encodeURIComponent(nik)}`);
      if (response.data && response.data.data) {
        const patient = response.data.data;
        setPatientPreview(patient);
        setForm(prev => ({
          ...prev,
          patientName: patient.name,
          patientIhsNumber: patient.ihsNumber
        }));
      } else {
        // Fallback jika nested response format berbeda
        const patient = response.data;
        setPatientPreview(patient);
        setForm(prev => ({
          ...prev,
          patientName: patient.name,
          patientIhsNumber: patient.ihsNumber
        }));
      }
    } catch (error) {
      setPatientPreview(null);
      setStepError(getFriendlyErrorMessage(error, 'Gagal mengambil data pasien dari SATUSEHAT.'));
    } finally {
      setLoadingPatient(false);
    }
  };

  // Filter practitioners
  const filteredPractitioners = practitioners.filter(p =>
    p.name.toLowerCase().includes(practitionerQuery.toLowerCase())
  );

  // Filter locations
  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(locationQuery.toLowerCase())
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
    setStepError(null);
  };

  const selectLocation = (l) => {
    setForm(prev => ({
      ...prev,
      locationId: l.id,
      locationName: l.name
    }));
    setLocationQuery(l.name);
    setLocationDropdownOpen(false);
    setStepError(null);
  };

  // Wizard Step Navigation
  const validateCurrentStep = () => {
    setStepError(null);

    if (step === 1) {
      if (patientType === 'lama') {
        if (!patientPreview) {
          setStepError('Silakan masukkan NIK dan lakukan Lookup Pasien terlebih dahulu.');
          return false;
        }
      } else {
        if (!isValidNik(form.patientNik.trim())) {
          setStepError('NIK pasien harus 16 digit angka.');
          return false;
        }
        if (!form.patientName.trim()) {
          setStepError('Nama lengkap pasien harus diisi.');
          return false;
        }
        if (!isValidIhs(form.patientIhsNumber.trim())) {
          setStepError('IHS Number pasien harus diisi dengan benar (angka).');
          return false;
        }
      }
    } else if (step === 2) {
      if (!form.practitionerIhsNumber || !form.practitionerName) {
        setStepError('Silakan pilih praktisi/dokter terlebih dahulu.');
        return false;
      }
    } else if (step === 3) {
      if (!form.locationId || !form.locationName) {
        setStepError('Silakan pilih lokasi pelayanan/ruangan terlebih dahulu.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setStepError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setStepError(null);
    setSubmitting(true);

    try {
      const payload = {
        patientNik: form.patientNik.trim(),
        patientIhsNumber: form.patientIhsNumber.trim(),
        patientName: form.patientName.trim(),
        practitionerNik: form.practitionerNik.trim(),
        practitionerIhsNumber: form.practitionerIhsNumber.trim(),
        practitionerName: form.practitionerName.trim(),
        locationId: form.locationId,
        locationName: form.locationName,
      };

      const response = await api.post('/v1/register', payload);

      setResult(response.data.data || response.data);
      setPopup({
        type: 'success',
        title: 'Registrasi Berhasil',
        message: 'Encounter berhasil dibuat di SATUSEHAT dan tersimpan di database lokal.',
        confirmLabel: 'Tutup',
      });
    } catch (error) {
      setPopup({
        type: 'error',
        title: 'Registrasi Gagal',
        message: getFriendlyErrorMessage(error, 'Terjadi kesalahan saat registrasi pasien.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setPatientPreview(null);
    setPractitionerQuery('');
    setLocationQuery('');
    setStepError(null);
    setResult(null);
    setPopup(null);
    setStep(1);
  };

  const closePopup = () => {
    setPopup(null);
    if (result) {
      resetForm();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Intake Wizard
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Registrasi Pasien Terpadu
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8 flex flex-col items-center justify-start">
          <div className="w-full max-w-2xl space-y-6">
            
            {/* Step Indicators */}
            <div className="flex justify-between items-center px-2">
              {[
                { s: 1, label: 'Pasien' },
                { s: 2, label: 'Praktisi' },
                { s: 3, label: 'Ruangan' },
                { s: 4, label: 'Ringkasan' }
              ].map(item => (
                <div key={item.s} className="flex flex-col items-center gap-1.5 flex-1 relative">
                  {item.s > 1 && (
                    <div 
                      className="absolute right-[50%] left-[-50%] top-4 h-[2px] -z-10 transition-colors duration-300"
                      style={{ 
                        backgroundColor: step >= item.s ? colors.primary : `${colors.accent}33` 
                      }}
                    />
                  )}
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: step === item.s 
                        ? colors.primary 
                        : step > item.s 
                        ? `${colors.primary}22` 
                        : colors.cardBg,
                      borderColor: step >= item.s ? colors.primary : `${colors.accent}44`,
                      color: step === item.s ? '#ffffff' : colors.foreground,
                    }}
                  >
                    {step > item.s ? '✓' : item.s}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider hidden sm:inline" style={{ color: step >= item.s ? colors.primary : colors.accent }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Wizard Card Container */}
            <div 
              className="rounded-3xl border p-6 lg:p-8 shadow-xl transition-all duration-300 relative"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: `${colors.accent}44`,
              }}
            >
              {/* STEP 1: PASIEN */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                      Data Pasien
                    </h2>
                    <p className="text-xs opacity-60 mt-1">
                      Pilih tipe pasien dan isi data diri pasien secara lengkap.
                    </p>
                  </div>

                  {/* Segmented Control / Toggle */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-accent/10 border border-accent/20">
                    <button
                      type="button"
                      onClick={() => {
                        setPatientType('lama');
                        setStepError(null);
                        setForm(prev => ({ ...prev, patientName: '', patientIhsNumber: '' }));
                        setPatientPreview(null);
                      }}
                      className="py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer"
                      style={{
                        backgroundColor: patientType === 'lama' ? colors.primary : 'transparent',
                        color: patientType === 'lama' ? '#ffffff' : colors.foreground,
                      }}
                    >
                      Pasien Lama (Lookup NIK)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPatientType('baru');
                        setStepError(null);
                        setForm(prev => ({ ...prev, patientName: '', patientIhsNumber: '' }));
                        setPatientPreview(null);
                      }}
                      className="py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer"
                      style={{
                        backgroundColor: patientType === 'baru' ? colors.primary : 'transparent',
                        color: patientType === 'baru' ? '#ffffff' : colors.foreground,
                      }}
                    >
                      Pasien Baru (Input Manual)
                    </button>
                  </div>

                  {/* Patient Lama Form */}
                  {patientType === 'lama' ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-end gap-3">
                        <div className="flex-1">
                          <Input
                            label="NIK Pasien"
                            value={form.patientNik}
                            onChange={(e) => {
                              setStepError(null);
                              setForm(prev => ({ ...prev, patientNik: e.target.value }));
                            }}
                            placeholder="Masukkan 16 digit NIK"
                            inputMode="numeric"
                            autoComplete="off"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={lookupPatient}
                          disabled={loadingPatient}
                          className="py-2.5 h-11 shrink-0"
                        >
                          {loadingPatient ? 'Memproses...' : 'Lookup Pasien'}
                        </Button>
                      </div>

                      {/* Patient Preview */}
                      <div 
                        className="rounded-2xl border p-4"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                          borderColor: `${colors.accent}33`,
                        }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
                          Preview Data Pasien (SATUSEHAT)
                        </p>
                        {patientPreview ? (
                          <div className="mt-3 space-y-2 text-sm">
                            <div>
                              <span className="opacity-60 text-xs block">Nama Lengkap</span>
                              <span className="font-semibold">{patientPreview.name}</span>
                            </div>
                            <div>
                              <span className="opacity-60 text-xs block">IHS Number</span>
                              <span className="font-mono font-semibold" style={{ color: colors.primary }}>
                                {patientPreview.ihsNumber}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs opacity-60 leading-5">
                            Belum ada data pasien. Masukkan NIK lalu klik tombol "Lookup Pasien".
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Patient Baru Form
                    <div className="space-y-4">
                      <Input
                        label="NIK Pasien"
                        value={form.patientNik}
                        onChange={(e) => {
                          setStepError(null);
                          setForm(prev => ({ ...prev, patientNik: e.target.value }));
                        }}
                        placeholder="Masukkan 16 digit NIK"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                      <Input
                        label="Nama Lengkap Pasien"
                        value={form.patientName}
                        onChange={(e) => {
                          setStepError(null);
                          setForm(prev => ({ ...prev, patientName: e.target.value }));
                        }}
                        placeholder="Masukkan nama lengkap sesuai KTP"
                        autoComplete="off"
                      />
                      <Input
                        label="IHS Number Pasien"
                        value={form.patientIhsNumber}
                        onChange={(e) => {
                          setStepError(null);
                          setForm(prev => ({ ...prev, patientIhsNumber: e.target.value }));
                        }}
                        placeholder="Masukkan IHS Number Pasien (misal: 10000000001)"
                        inputMode="numeric"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: PRAKTISI */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                      Pilih Praktisi / Dokter
                    </h2>
                    <p className="text-xs opacity-60 mt-1">
                      Pilih praktisi kesehatan yang akan menangani pasien dari daftar dokter aktif.
                    </p>
                  </div>

                  {/* Searchable Dropdown */}
                  <div className="flex flex-col gap-1.5" ref={practitionerRef}>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
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
                        className="w-full rounded-2xl border px-4 py-2.5 text-sm pr-10 outline-none transition"
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
                          className="absolute z-30 w-full mt-1.5 rounded-2xl border shadow-xl overflow-hidden"
                          style={{
                            backgroundColor: isDark ? '#1a1f1d' : '#ffffff',
                            borderColor: `${colors.accent}55`,
                            maxHeight: '220px',
                            overflowY: 'auto',
                          }}
                        >
                          {filteredPractitioners.length === 0 ? (
                            <div className="px-4 py-3 text-xs opacity-60">
                              Tidak ada dokter yang cocok.
                            </div>
                          ) : (
                            filteredPractitioners.map((p, idx) => (
                              <button
                                key={p.nik}
                                type="button"
                                onMouseDown={() => selectPractitioner(p)}
                                onMouseEnter={() => setPractitionerHighlight(idx)}
                                className="w-full text-left px-4 py-2.5 text-sm flex flex-col gap-0.5 transition cursor-pointer"
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
                      className="rounded-2xl border p-4 flex justify-between items-center"
                      style={{
                        backgroundColor: `${colors.primary}0a`,
                        borderColor: `${colors.primary}33`,
                      }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: colors.primary }}>
                          Dokter Terpilih
                        </span>
                        <p className="text-sm font-semibold mt-1">{form.practitionerName}</p>
                        <p className="text-xs opacity-60 mt-0.5">IHS Number: {form.practitionerIhsNumber}</p>
                      </div>
                      <span className="text-2xl">🩺</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: LOKASI */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                      Pilih Ruangan / Lokasi
                    </h2>
                    <p className="text-xs opacity-60 mt-1">
                      Pilih ruangan poli atau tempat pelayanan pasien dari daftar lokasi terdaftar di SATUSEHAT.
                    </p>
                  </div>

                  {/* Location Searchable Dropdown */}
                  <div className="flex flex-col gap-1.5" ref={locationRef}>
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.accent }}>
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
                        className="w-full rounded-2xl border px-4 py-2.5 text-sm pr-10 outline-none transition"
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
                          className="absolute z-30 w-full mt-1.5 rounded-2xl border shadow-xl overflow-hidden"
                          style={{
                            backgroundColor: isDark ? '#1a1f1d' : '#ffffff',
                            borderColor: `${colors.accent}55`,
                            maxHeight: '220px',
                            overflowY: 'auto',
                          }}
                        >
                          {filteredLocations.length === 0 ? (
                            <div className="px-4 py-3 text-xs opacity-60">
                              Tidak ada lokasi yang cocok.
                            </div>
                          ) : (
                            filteredLocations.map((l, idx) => (
                              <button
                                key={l.id}
                                type="button"
                                onMouseDown={() => selectLocation(l)}
                                onMouseEnter={() => setLocationHighlight(idx)}
                                className="w-full text-left px-4 py-2.5 text-sm flex flex-col gap-0.5 transition cursor-pointer"
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
                      className="rounded-2xl border p-4 flex justify-between items-center"
                      style={{
                        backgroundColor: `${colors.primary}0a`,
                        borderColor: `${colors.primary}33`,
                      }}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: colors.primary }}>
                          Lokasi Terpilih
                        </span>
                        <p className="text-sm font-semibold mt-1">{form.locationName}</p>
                        <p className="text-xs opacity-60 mt-0.5">Location ID: {form.locationId}</p>
                      </div>
                      <span className="text-2xl">🏢</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: RINGKASAN */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
                      Ringkasan Registrasi
                    </h2>
                    <p className="text-xs opacity-60 mt-1">
                      Periksa kembali detail data pendaftaran sebelum dikirim ke SATUSEHAT.
                    </p>
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-4 divide-y divide-accent/20">
                    
                    {/* Pasien */}
                    <div className="pt-0 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
                        Pasien ({patientType === 'lama' ? 'Pasien Lama' : 'Pasien Baru'})
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="opacity-60 text-xs block">Nama Lengkap</span>
                          <span className="font-semibold">{form.patientName}</span>
                        </div>
                        <div>
                          <span className="opacity-60 text-xs block">IHS Number</span>
                          <span className="font-semibold">{form.patientIhsNumber}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="opacity-60 text-xs block">NIK Pasien</span>
                          <span className="font-semibold">{form.patientNik}</span>
                        </div>
                      </div>
                    </div>

                    {/* Dokter */}
                    <div className="pt-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
                        Praktisi / Dokter
                      </span>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="opacity-60 text-xs block">Nama Lengkap</span>
                          <span className="font-semibold">{form.practitionerName}</span>
                        </div>
                        <div>
                          <span className="opacity-60 text-xs block">IHS Number</span>
                          <span className="font-semibold">{form.practitionerIhsNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lokasi */}
                    <div className="pt-4 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: colors.accent }}>
                        Ruangan / Lokasi Pelayanan
                      </span>
                      <div className="text-sm">
                        <span className="opacity-60 text-xs block">Nama Lokasi</span>
                        <span className="font-semibold">{form.locationName}</span>
                        <span className="opacity-60 text-xs block mt-2">Location ID</span>
                        <span className="font-mono text-xs font-semibold">{form.locationId}</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Error Message Display */}
              {stepError && (
                <div
                  className="rounded-2xl border px-4 py-3 text-xs leading-5 mt-5"
                  style={{
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: colors.foreground,
                  }}
                >
                  {stepError}
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex items-center justify-between mt-8 border-t border-accent/20 pt-5 gap-3">
                {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={handlePrev} className="px-5 py-2.5 text-sm">
                    Kembali
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="px-6 py-2.5 text-sm">
                    Lanjut
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 text-sm">
                    {submitting ? 'Memproses...' : 'Kirim Pendaftaran'}
                  </Button>
                )}
              </div>

            </div>

          </div>
        </main>
      </div>

      {popup && (
        <Popup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          confirmLabel={popup.confirmLabel}
          onClose={closePopup}
        />
      )}
    </div>
  );
}

export default function IntakePage() {
  return (
    <AuthGuard>
      <IntakeContent />
    </AuthGuard>
  );
}