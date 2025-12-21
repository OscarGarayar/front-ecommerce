/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // ¡Importante! Busca en archivos TS porque usas templates inline
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'), // Recomendado para estilos de inputs (npm install -D @tailwindcss/forms)
  ],
}
