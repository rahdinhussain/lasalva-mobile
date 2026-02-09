/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        // Secondary gradients
        purple: {
          500: '#a855f7',
          600: '#9333ea',
        },
        // Backgrounds
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          700: '#334155',
          900: '#0f172a',
        },
        // Status colors
        emerald: {
          50: '#ecfdf5',
          500: '#10b981',
          700: '#047857',
        },
        rose: {
          50: '#fff1f2',
          500: '#f43f5e',
          600: '#e11d48',
        },
        amber: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        cyan: {
          500: '#06b6d4',
        },
        violet: {
          500: '#8b5cf6',
        },
        orange: {
          500: '#f97316',
        },
        teal: {
          500: '#14b8a6',
        },
        pink: {
          500: '#ec4899',
        },
        sky: {
          500: '#0ea5e9',
        },
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
    },
  },
  plugins: [],
};
