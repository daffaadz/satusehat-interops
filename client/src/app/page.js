"use client";

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/Button';
import HomeSkeleton from '../components/skeletons/HomeSkeleton';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const router = useRouter();
  const { colors, ready } = useTheme();
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 1;

    const tryPlay = () => audio.play().catch(() => {});

    tryPlay();
    document.addEventListener('click', tryPlay, { once: true });

    return () => document.removeEventListener('click', tryPlay);
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(prev => !prev);
  };

  if (!ready) {
    return <HomeSkeleton />;
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{
        backgroundImage: "url('/bg-landing.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <audio
        ref={audioRef}
        src="/horror%20ambient.mp3"
        loop
      />

      <div className="absolute inset-0 bg-black/60" />

      <button
        onClick={toggleMute}
        className="fixed top-20 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
        title={muted ? 'Aktifkan suara' : 'Matikan suara'}
      >
        {muted ? '🔇' : '🔊'}
      </button>

      <div
        className="relative z-10 w-full max-w-3xl rounded-[40px] border p-10 shadow-2xl backdrop-blur-xl"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
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
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">
              Klinik Percobaan
            </p>
            <h1 className="mt-4 text-5xl font-semibold text-white">
              Selamat datang di Klinik Percobaan
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-white/75">
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
