/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        navy: {
          950: '#060a13',
          900: '#0a0f1e',
          800: '#0c1220',
          700: '#111827',
          600: '#1a2332',
        },
        accent: {
          green: '#00FF88',
          red: '#EF4444',
          amber: '#F59E0B',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        }
      },
      animation: {
        'scan-line': 'scan 2s linear infinite',
        'marquee': 'marquee 30s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
