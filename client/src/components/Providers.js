"use client";

import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemeToggle />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
