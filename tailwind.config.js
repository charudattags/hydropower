/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#03070f', 900: '#060d1a', 800: '#0a1628', 700: '#10213b' },
        aqua: { DEFAULT: '#2ee6ff', dim: '#1aa9c4' },
        volt: { DEFAULT: '#ffc233', hot: '#ffe27a' },
      },
      fontFamily: {
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(46,230,255,.25), 0 10px 40px -10px rgba(46,230,255,.35)',
      },
    },
  },
  plugins: [],
};
