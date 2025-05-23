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
          verylightbeige: '#F9F6F1',
          dark: 'rgb(12, 44, 43)',
          medium: 'rgba(49, 114, 113, 1)',
          light: 'rgb(104, 157, 157)',
          lightest: 'rgb(145, 180, 179)',
          bg: 'rgba(232, 245, 233, 1)',
          titleColor: 'rgba(49, 114, 113, 1)',
          buttonColor: '#e1b752',
          buttonHover: '#cfa32c',
          peach: 'hsl(30, 75%, 85%)',
          sand: '#dbd4bd',
          sandLight: '#f5f3ea',
          sandLightest: '#eef1da33',
          verylightbeige: '#F9F6F1',
        },
      },
    },
  },
  plugins: [],
}
