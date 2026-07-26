/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0c10",
        surface: "#121620",
        surfaceBorder: "#1e2638",
        stellarCyan: "#00f2fe",
        stellarPurple: "#7928ca",
        stellarBlue: "#0070f3",
        academicGold: "#ffb703",
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at 50% 0%, rgba(121, 40, 202, 0.15), rgba(0, 242, 254, 0.05) 50%, transparent 80%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
    },
  },
  plugins: [],
};
