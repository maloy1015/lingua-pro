/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#050816', 900: '#0a0f24', 800: '#10173a', 700: '#18214f' },
        neon: { purple: '#8b5cf6', blue: '#38bdf8', pink: '#d946ef' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Sora', 'Inter', 'sans-serif'] },
      boxShadow: {
        glow: '0 0 40px -8px rgba(139,92,246,.55)',
        glass: '0 8px 32px rgba(0,0,0,.35)',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
      },
      animation: { float: 'float 6s ease-in-out infinite', fadeUp: 'fadeUp .5s ease both' },
    },
  },
  plugins: [],
}
