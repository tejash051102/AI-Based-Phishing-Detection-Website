export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        panel: "#f7f8fb",
        cyber: {
          50: "#effdf8",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488"
        },
        signal: {
          red: "#ef4444",
          amber: "#f59e0b",
          green: "#22c55e"
        }
      },
      boxShadow: {
        glow: "0 20px 80px rgba(20,184,166,0.20)"
      }
    }
  },
  plugins: []
};

