"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from './Button';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Registrasi', path: '/dashboard/intake' },
  { label: 'Riwayat Encounter', path: '/dashboard/encounter' },
  { label: 'Praktisi', path: '/dashboard/practitioner' },
  { label: 'Lokasi', path: '/dashboard/locations' },
];

export default function Sidebar({ userName = 'admin', onLogout }) {
  const pathname = usePathname();
  const { colors, isDark } = useTheme();

  return (
    <aside
      className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r lg:w-72"
      style={{
        borderColor: `${colors.accent}66`,
        backgroundColor: isDark ? 'rgba(26, 31, 29, 0.98)' : 'rgba(246, 244, 238, 0.98)',
        color: colors.foreground,
      }}
    >
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white shadow-md"
            style={{ backgroundColor: colors.primary }}
          >
            🩺
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
              Klinik
            </p>
            <p className="truncate text-lg font-semibold leading-tight" style={{ color: colors.primary }}>
              Percobaan
            </p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className="block rounded-2xl px-4 py-2.5 text-sm font-medium transition"
                style={{
                  color: colors.foreground,
                  backgroundColor: isActive
                    ? isDark
                      ? 'rgba(93, 184, 159, 0.2)'
                      : 'rgba(58, 138, 114, 0.18)'
                    : 'transparent',
                  borderLeft: isActive ? `3px solid ${colors.primary}` : '3px solid transparent',
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="space-y-3 border-t p-5 lg:p-6"
        style={{ borderColor: `${colors.accent}44` }}
      >
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            backgroundColor: isDark ? 'rgba(93, 184, 159, 0.08)' : 'rgba(58, 138, 114, 0.08)',
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: colors.accent }}>
            Role
          </p>
          <p className="mt-1 font-semibold" style={{ color: colors.primary }}>
            Admin
          </p>
          <p className="text-sm opacity-80" style={{ color: colors.foreground }}>
            {userName}
          </p>
        </div>
        <Button variant="secondary" className="w-full" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
