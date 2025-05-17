/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#1a2a42',
          medium: '#2c4066',
          light: '#4a9fff',
          lightest: '#e6f0ff',
          bg: '#f0f7ff',
        },
      },
    },
  },
  plugins: [],
}
