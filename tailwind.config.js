/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f0f0f0',
        secondary: '#fff',
        tertiary: '#333',
        active: '#2d1fe8',
      },
    },
  },
  plugins: [],
}

