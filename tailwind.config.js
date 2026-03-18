/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        mera: {
          primary: '#191D88',   // Ana Rengin (Derin Lacivert)
          accent: '#FFC436',    // Vurgu Rengin (Canlı Sarı)
        }
      },
      fontFamily: {
        inter: ["Inter-Regular"],
        "inter-semibold": ["Inter-SemiBold"],
        "inter-bold": ["Inter-Bold"],
      }
    },
  },
  plugins: [],
}