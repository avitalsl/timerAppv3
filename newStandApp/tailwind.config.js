/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        opensans: [
          'Open Sans',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          dark: 'rgb(12, 44, 43)',
          medium: '#2c4066',
          light: '#4a9fff',
          lightest: '#e6f0ff',
          bg: '#f0f7ff',
          titleColor: 'rgba(49, 114, 113, 1)',
          buttonColor: '#e1b752',
          buttonHover: '#cfa32c',
          peach: 'hsl(30, 75%, 85%)',
          sand: '#dbd4bd',
        },
      },
    },
  },
  plugins: [],
}
