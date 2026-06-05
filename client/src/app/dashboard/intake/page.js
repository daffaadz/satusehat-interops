"use client";

import { useState, useEffect, useRef } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import Sidebar from '../../../components/Sidebar';
import Button from '../../../components/Button';
import Popup from '../../../components/Popup';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { api } from '../../../lib/api';

import PatientStep from '../../../components/registration/PatientStep';
import PractitionerStep from '../../../components/registration/PractitionerStep';
import LocationStep from '../../../components/registration/LocationStep';
import SummaryStep from '../../../components/registration/SummaryStep';

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
        const pracRes = await api.get('/v1/practitioners');
        if (pracRes && pracRes.data) {
          setPractitioners(pracRes.data);
        }

        const locRes = await api.get('/v1/locations');
        const list = locRes?.data ?? [];
        setLocations(list.map(l => ({
          id: l.locationId,
          name: l.name,
          description: `ID: ${l.locationId}`
        })));
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
      const patient = response.data.data || response.data;
      if (patient) {
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
      const resData = response.data || response;
      setResult(resData);

      const timestampStr = resData?.encounter?.timestamp
        ? new Date(resData.encounter.timestamp).toLocaleString('id-ID', {
            dateStyle: 'long',
            timeStyle: 'medium'
          })
        : new Date().toLocaleString('id-ID', {
            dateStyle: 'long',
            timeStyle: 'medium'
          });

      setPopup({
        type: 'success',
        title: 'Registrasi Berhasil',
        message: `Encounter berhasil dibuat di SATUSEHAT pada ${timestampStr} dan tersimpan di database lokal.`,
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-3 lg:px-8">
          <p className="text-[9px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Intake Wizard
          </p>
          <h1 className="mt-0.5 text-lg font-semibold sm:text-xl lg:text-2xl" style={{ color: colors.primary }}>
            Registrasi Pasien Terpadu
          </h1>
        </header>

        <main className="flex-1 px-4 py-4 lg:px-8 lg:py-6 flex flex-col items-center justify-start overflow-y-auto">
          <div className="w-full max-w-lg space-y-4">
            
            {/* Step Indicators (Smaller) */}
            <div className="flex justify-between items-center px-1">
              {[
                { s: 1, label: 'Pasien' },
                { s: 2, label: 'Praktisi' },
                { s: 3, label: 'Ruangan' },
                { s: 4, label: 'Ringkasan' }
              ].map(item => (
                <div key={item.s} className="flex flex-col items-center gap-1 flex-1 relative">
                  {item.s > 1 && (
                    <div 
                      className="absolute right-[50%] left-[-50%] top-3 h-[1.5px] -z-10 transition-colors duration-300"
                      style={{ 
                        backgroundColor: step >= item.s ? colors.primary : `${colors.accent}33` 
                      }}
                    />
                  )}
                  <div 
                    className="w-6.5 h-6.5 rounded-full flex items-center justify-center font-semibold text-[10px] border transition-all duration-300 shadow-sm"
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
                  <span className="text-[9px] font-semibold uppercase tracking-wider hidden sm:inline" style={{ color: step >= item.s ? colors.primary : colors.accent }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Compact Wizard Card */}
            <div 
              className="rounded-2xl border p-5 lg:p-6 shadow-lg transition-all duration-300 relative"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: `${colors.accent}33`,
              }}
            >
              {/* Step Components */}
              {step === 1 && (
                <PatientStep
                  patientType={patientType}
                  setPatientType={setPatientType}
                  form={form}
                  setForm={setForm}
                  patientPreview={patientPreview}
                  lookupPatient={lookupPatient}
                  loadingPatient={loadingPatient}
                  colors={colors}
                  isDark={isDark}
                />
              )}

              {step === 2 && (
                <PractitionerStep
                  form={form}
                  setForm={setForm}
                  practitioners={practitioners}
                  loadingPractitioners={loadingPractitioners}
                  practitionerQuery={practitionerQuery}
                  setPractitionerQuery={setPractitionerQuery}
                  practitionerDropdownOpen={practitionerDropdownOpen}
                  setPractitionerDropdownOpen={setPractitionerDropdownOpen}
                  practitionerHighlight={practitionerHighlight}
                  setPractitionerHighlight={setPractitionerHighlight}
                  colors={colors}
                  isDark={isDark}
                  practitionerRef={practitionerRef}
                />
              )}

              {step === 3 && (
                <LocationStep
                  form={form}
                  setForm={setForm}
                  locations={locations}
                  loadingLocations={loadingLocations}
                  locationQuery={locationQuery}
                  setLocationQuery={setLocationQuery}
                  locationDropdownOpen={locationDropdownOpen}
                  setLocationDropdownOpen={setLocationDropdownOpen}
                  locationHighlight={locationHighlight}
                  setLocationHighlight={setLocationHighlight}
                  colors={colors}
                  isDark={isDark}
                  locationRef={locationRef}
                />
              )}

              {step === 4 && (
                <SummaryStep
                  patientType={patientType}
                  form={form}
                  colors={colors}
                />
              )}

              {/* Error Message Display */}
              {stepError && (
                <div
                  className="rounded-xl border px-3 py-2 text-[10px] leading-4 mt-4"
                  style={{
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    color: colors.foreground,
                  }}
                >
                  {stepError}
                </div>
              )}

              {/* Navigation Action Buttons (More Compact) */}
              <div className="flex items-center justify-between mt-6 border-t border-accent/20 pt-4 gap-2.5">
                {step > 1 ? (
                  <Button type="button" variant="ghost" onClick={handlePrev} className="px-4 py-2 text-xs">
                    Kembali
                  </Button>
                ) : (
                  <div />
                )}

                {step < 4 ? (
                  <Button type="button" onClick={handleNext} className="px-5 py-2 text-xs">
                    Lanjut
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} disabled={submitting} className="px-5 py-2 text-xs">
                    {submitting ? 'Memproses...' : 'Kirim'}
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