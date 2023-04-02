/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#F1C40F',
      },
      textColor: {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#F1C40F',
      },
      borderColor: {
        primary: '#2C3E50',
        secondary: '#34495E',
        accent: '#F1C40F',
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
      },
      boxShadow: {
        fun: '0 4px 6px -1px rgba(44, 62, 80, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
}
