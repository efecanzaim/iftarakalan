/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ef',
          100: '#c2dfd7',
          200: '#9ccbbe',
          300: '#75b7a5',
          400: '#58a792',
          500: '#1a5f4a',
          600: '#155240',
          700: '#104436',
          800: '#0b362c',
          900: '#062822',
        },
        gold: {
          50: '#fdf9e6',
          100: '#fbf0bf',
          200: '#f8e795',
          300: '#f5de6b',
          400: '#f3d74b',
          500: '#c9a227',
          600: '#b8921f',
          700: '#a38117',
          800: '#8e700f',
          900: '#795f07',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
