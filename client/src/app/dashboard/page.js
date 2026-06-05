"use client";

import { useRouter } from 'next/navigation';
import AuthGuard from '../../components/AuthGuard';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

function StatCard({ label, value, colors }) {
  return (
    <div
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        backgroundColor: colors.cardBg,
        borderColor: `${colors.accent}55`,
      }}
    >
      <p className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: colors.accent }}>
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: colors.primary }}>
        {value}
      </p>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const displayName = user?.name || 'Admin Klinik Percobaan';
  const displayRole = user?.role || 'admin';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar userName={user?.username || 'admin'} onLogout={handleLogout} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="sticky top-0 z-20 border-b border-accent/30 bg-background px-6 py-4 lg:px-10"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: colors.accent }}>
            Dashboard Admin
          </p>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl lg:text-3xl" style={{ color: colors.primary }}>
            Halo, {displayName}
          </h1>
        </header>

        <main className="flex-1 px-6 py-5 lg:px-10 lg:py-6 overflow-y-auto">
          <div className="grid gap-5 sm:grid-cols-2 lg:gap-6">
            <StatCard label="Status Sistem" value="Aktif" colors={colors} />
            <StatCard label="Pengguna Terkini" value={displayRole} colors={colors} />
          </div>

          <section
            className="mt-6 rounded-2xl border p-6 lg:mt-8 lg:p-8"
            style={{
              backgroundColor: colors.cardBg,
              borderColor: `${colors.accent}55`,
            }}
          >
            <h2 className="text-xl font-semibold sm:text-2xl" style={{ color: colors.primary }}>
              Ringkasan Klinik
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 sm:text-base" style={{ color: colors.foreground }}>
              Halaman dashboard ini adalah template awal untuk menampung fitur-fitur interoperabilitas.
              Nanti kita tambahkan daftar pasien, jadwal konsultasi, dan pengelolaan encounter.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
