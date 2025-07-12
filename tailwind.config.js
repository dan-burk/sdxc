/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sdxc-teal': '#BEE2E1',
        'sdxc-green': '#9AC596',
        'sdxc-dark-teal': '#9EBBB7',
        'sdxc-light': '#F6FFF5',
      }
    },
  },
  plugins: [],
}