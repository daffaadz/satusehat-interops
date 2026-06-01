"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoginNavbar from '../../components/LoginNavbar';
import Popup from '../../components/Popup';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import LoginSkeleton from '../../components/skeletons/LoginSkeleton';

export default function LoginPage() {
  const router = useRouter();
  const { loading, login, checking, isAuthenticated } = useAuth();
  const { colors, ready } = useTheme();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(null);
  const holdRedirectRef = useRef(false);

  // Hanya redirect otomatis jika sudah login sebelumnya (bukan setelah login baru)
  useEffect(() => {
    if (!checking && isAuthenticated && !holdRedirectRef.current && !popup) {
      router.replace('/dashboard');
    }
  }, [checking, isAuthenticated, popup, router]);

  const handlePopupClose = () => {
    const shouldRedirect = popup?.redirectOnClose === true;
    holdRedirectRef.current = false;
    setPopup(null);
    if (shouldRedirect) {
      router.push('/dashboard');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (popup) return;

    try {
      holdRedirectRef.current = true;
      await login(username, password);
      setPopup({
        type: 'success',
        title: 'Login berhasil',
        message:
          'Selamat datang di Klinik Percobaan. Baca pesan ini lalu tutup dengan tombol × atau "Lanjut ke Dashboard".',
        redirectOnClose: true,
        confirmLabel: 'Lanjut ke Dashboard',
      });
    } catch (err) {
      holdRedirectRef.current = false;
      setPopup({
        type: 'error',
        title: 'Login gagal',
        message:
          err?.message ||
          'Periksa kembali username dan password, lalu coba lagi.',
        redirectOnClose: false,
      });
    }
  };

  if (checking || !ready) {
    return <LoginSkeleton />;
  }

  const isPopupOpen = !!popup;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LoginNavbar />

      <div
        className={`flex flex-1 flex-col justify-center px-6 py-10 ${isPopupOpen ? 'pointer-events-none select-none' : ''}`}
        aria-hidden={isPopupOpen}
      >
        <main
          className="mx-auto flex w-full max-w-2xl flex-col gap-10 rounded-[32px] border p-8 shadow-2xl backdrop-blur-xl"
          style={{
            backgroundColor: colors.cardBg,
            borderColor: colors.accent,
            borderWidth: '2px',
          }}
        >
          <div className="space-y-2 text-center">
            <p
              className="text-sm uppercase tracking-[0.3em]"
              style={{ color: colors.primary }}
            >
              Login Klinik Percobaan
            </p>
            <h1 className="text-4xl font-semibold" style={{ color: colors.primary }}>
              Masuk sebagai Admin
            </h1>
            <p className="text-sm leading-6" style={{ color: colors.foreground }}>
              Masuk dengan akun admin klinik. Default development: username <strong>admin</strong> dan password <strong>admin123</strong> (dapat diubah di <code className="text-xs">server/.env</code>).
            </p>
          </div>

          <form
            className={`relative grid gap-6 transition-opacity ${loading ? 'pointer-events-none opacity-60' : ''}`}
            onSubmit={handleSubmit}
          >
            <Input
              label="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
              disabled={isPopupOpen || loading}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="*****"
              autoComplete="current-password"
              disabled={isPopupOpen || loading}
            />
            <Button type="submit" disabled={loading || isPopupOpen}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </main>
      </div>

      {popup ? (
        <Popup
          type={popup.type}
          title={popup.title}
          message={popup.message}
          confirmLabel={popup.confirmLabel}
          onClose={handlePopupClose}
        />
      ) : null}
    </div>
  );
}
