/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        void: "#030806",
        abyss: "#060e0a",
        panel: "#0a1610",
        deep: "#0d1f15",
        slate: "#111f17",
        line: "rgba(255,255,255,0.08)",
        "line-strong": "rgba(255,255,255,0.16)",
        bone: "#f0fdf4",
        mist: "#b8dcc8",
        dim: "#8aad9a",
        electric: "#34d399",
        neon: "#2dd4bf",
        cyan: "#06b6d4",
        violet: "#8b5cf6",
        amber: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "sans-serif"],
        sans: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 5s ease-in-out infinite",
        "spin-slow": "spin 14s linear infinite",
        float: "float 7s ease-in-out infinite",
        "float-delay": "float 9s ease-in-out 1.2s infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
