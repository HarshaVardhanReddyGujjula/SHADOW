/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#090d16",
          card: "#111726",
          border: "#1f293d",
          hover: "#1a2336",
        },
        risk: {
          normal: "#10b981",
          suspicious: "#f59e0b",
          high: "#ef4444",
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
