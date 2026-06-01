"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const EXIT_MS = 190;

export default function Popup({
  type = 'success',
  title,
  message,
  onClose,
  confirmLabel,
}) {
  const { colors, isDark } = useTheme();
  const dialogRef = useRef(null);
  const [phase, setPhase] = useState('enter');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const requestClose = useCallback(() => {
    if (phase === 'exit') return;
    setPhase('exit');
    window.setTimeout(() => {
      onClose();
    }, EXIT_MS);
  }, [phase, onClose]);

  const isSuccess = type === 'success';
  const icon = isSuccess ? '✓' : '!';

  const stopBackgroundKeys = (event) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const overlayClass = phase === 'enter' ? 'popup-overlay-in' : 'popup-overlay-out';
  const panelClass = phase === 'enter' ? 'popup-panel-in' : 'popup-panel-out';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
      aria-describedby="popup-message"
      onKeyDown={stopBackgroundKeys}
    >
      <div
        className={`absolute inset-0 ${overlayClass}`}
        style={{ backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(34, 51, 47, 0.45)' }}
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl outline-none ${panelClass}`}
        style={{
          backgroundColor: isDark ? '#24302c' : '#F6F4EE',
          border: `2px solid ${isSuccess ? colors.primary : '#ef4444'}`,
        }}
      >
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: isSuccess ? colors.primary : '#ef4444' }}
        />

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ backgroundColor: isSuccess ? colors.primary : '#dc2626' }}
              aria-hidden="true"
            >
              {icon}
            </div>

            <div className="min-w-0 flex-1 pr-8">
              <p
                className="text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: colors.accent }}
              >
                {isSuccess ? 'Berhasil' : 'Gagal'}
              </p>
              <h2
                id="popup-title"
                className="mt-1 text-xl font-semibold sm:text-2xl"
                style={{ color: colors.primary }}
              >
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={requestClose}
              autoFocus={false}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-lg font-semibold transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(34, 51, 47, 0.08)',
                color: colors.foreground,
              }}
              aria-label="Tutup popup"
            >
              ×
            </button>
          </div>

          <p
            id="popup-message"
            className="mt-5 text-sm leading-7 sm:text-base"
            style={{ color: colors.foreground }}
          >
            {message}
          </p>

          <p className="mt-3 text-xs opacity-70" style={{ color: colors.accent }}>
            Tutup hanya dengan tombol × atau tombol di bawah.
          </p>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {confirmLabel ? (
              <button
                type="button"
                onClick={requestClose}
                autoFocus={false}
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                style={{ backgroundColor: colors.primary }}
              >
                {confirmLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={requestClose}
                autoFocus={false}
                className="inline-flex items-center justify-center rounded-full border-2 px-6 py-3 text-sm font-semibold transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{
                  borderColor: colors.accent,
                  color: colors.foreground,
                  backgroundColor: 'transparent',
                }}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
