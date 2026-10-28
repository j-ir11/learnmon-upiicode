/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lime: { DEFAULT: '#badb24', dark: '#a3c41a', soft: '#e9f3b6' },
        forest: { DEFAULT: '#52723e', dark: '#3f5a2f', deep: '#2f4423', soft: '#6b8a4e' },
        lemon: { DEFAULT: '#f5d005', soft: '#fff496', pale: '#fff7c2' },
        sage: { DEFAULT: '#d4df9c', soft: '#eef3dc' },
        ink: '#1f2a17',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'Poppins', 'sans-serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(63,90,47,.25)',
        lime: '0 12px 24px -10px rgba(186,219,36,.8)',
        card: '0 1px 0 rgba(255,255,255,.6) inset, 0 18px 40px -24px rgba(47,68,35,.45)',
      },
    },
  },
  plugins: [],
}
