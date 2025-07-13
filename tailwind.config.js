/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb', // Blue-600
        'primary-light': '#3b82f6', // Blue-500
        'primary-dark': '#1d4ed8', // Blue-700
        'primary-lighter': '#dbeafe', // Blue-100
        'secondary': '#64748b', // Slate-500
        'secondary-light': '#94a3b8', // Slate-400
        'accent': '#0ea5e9', // Sky-500
        'accent-light': '#38bdf8', // Sky-400
        'background': '#f8fafc', // Slate-50
        'surface': '#ffffff',
        'text-primary': '#1e293b', // Slate-800
        'text-secondary': '#475569', // Slate-600
        'border': '#e2e8f0', // Slate-200
      }
    },
  },
  plugins: [],
}