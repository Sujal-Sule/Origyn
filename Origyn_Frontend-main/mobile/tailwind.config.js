/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0A0F1E',
          800: '#111827',
        },
        green: {
          accent: '#00FF88', // neon green
        },
        farmer: '#4ADE80',
        distributor: '#38BDF8',
        retailer: '#A78BFA',
        consumer: '#FBBF24',
      }
    },
  },
  plugins: [],
}
