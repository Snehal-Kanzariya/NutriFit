/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        // Protein HERO color
        protein: {
          DEFAULT: '#8b5cf6', // violet-500
          bg: '#2e1065',      // violet-950
        },
        // Accent
        accent: '#10b981', // emerald-500
      },
    },
  },
  plugins: [],
}
