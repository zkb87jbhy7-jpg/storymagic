import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4F46E5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#8B5CF6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        accent: {
          300: '#fcd34d',
          400: '#FBBF24',
          500: '#f59e0b',
        },
        success: {
          400: '#4ade80',
          500: '#22C55E',
          600: '#16a34a',
        },
        warning: {
          400: '#FB923C',
          500: '#f97316',
        },
        danger: {
          400: '#f87171',
          500: '#EF4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        'sans-hebrew': ['Noto Sans Hebrew', 'sans-serif'],
        sans: ['Noto Sans', 'sans-serif'],
        dyslexic: ['OpenDyslexic', 'sans-serif'],
      },
      screens: {
        md: '768px',
        lg: '1024px',
        xl: '1440px',
      },
    },
  },
  plugins: [],
}

export default config
