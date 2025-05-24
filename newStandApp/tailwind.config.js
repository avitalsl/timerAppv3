/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '900px',
        'desktop': '1200px', // Large desktop and up   // Tablet and up
      },
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
          medium: 'rgba(49, 114, 113, 1)',
          light: 'rgb(104, 157, 157)',
          lightest: 'rgb(145, 180, 179)',
          bg: 'rgba(232, 245, 233, 1)',
          titleColor: 'rgba(49, 114, 113, 1)',
          buttonColor: 'rgb(225, 183, 82)',
          secondaryButtonColor: 'rgba(49, 114, 113, 1)',
          secondaryButtonColorHover: 'rgba(38, 90, 89, 1)',
          buttonHover: 'rgb(163, 129, 35)',
          lightYellow: 'hsl(52, 91%, 75%)',
          peach: 'rgb(255, 224, 191)',
          sand: 'rgb(219, 212, 189)',
          sandLight: 'rgb(245, 243, 234)',
          sandLightest: 'rgba(238, 241, 218, 0.2)',
          verylightbeige: 'rgb(249, 246, 241)',
          lightText: 'rgb(236, 240, 241)',
        },
      },
    },
  },
  plugins: [],
}
