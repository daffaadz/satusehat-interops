"use client";

import { useRouter } from 'next/navigation';
import Button from '../components/Button';
import HomeSkeleton from '../components/skeletons/HomeSkeleton';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { colors, ready } = useTheme();

  if (!ready) {
    return <HomeSkeleton />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div
        className="w-full max-w-3xl rounded-[40px] border p-10 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.accent,
          borderWidth: '2px',
        }}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-inner"
            style={{
              backgroundColor: colors.primary,
              boxShadow: `inset 0 2px 8px ${colors.primary}40`,
            }}
          >
            🩺
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.4em]" style={{ color: colors.accent }}>
              Klinik Percobaan
            </p>
            <h1 className="mt-4 text-5xl font-semibold" style={{ color: colors.primary }}>
              Selamat datang di Klinik Percobaan
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7" style={{ color: colors.foreground }}>
            Aplikasi interoperabilitas SATUSEHAT. Tekan tombol di bawah untuk masuk dan mulai menggunakan dashboard admin.
          </p>
          <Button onClick={() => router.push('/login')}>
            Masuk ke Klinik
          </Button>
        </div>
      </div>
    </div>
  );
}
