const tokens = [
  'bg', 'surface', 'surface-2', 'border', 'text', 'muted', 'accent', 'accent-fg', 'accent-soft',
  'gold', 'silver', 'bronze', 'aa', 'a', 'b', 'up', 'down',
]

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: Object.fromEntries(tokens.map(t => [t, `rgb(var(--${t}) / <alpha-value>)`])),
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '8px', lg: '12px' },
      boxShadow: { card: '0 1px 2px rgb(0 0 0 / .04), 0 4px 16px rgb(0 0 0 / .04)' },
    },
  },
  plugins: [],
}
