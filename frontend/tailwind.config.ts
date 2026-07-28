import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b12",
        panel: "#101722",
        line: "#263246",
        flame: "#ff4d5e",
        volt: "#21e6c1",
      },
      boxShadow: {
        glow: "0 0 36px rgba(33, 230, 193, 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;
