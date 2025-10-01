import defaultTheme from "tailwindcss/defaultTheme";
import preline from "preline/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,tsx}",
    "./node_modules/preline/preline.js",
  ],
  theme: {
    extend: {
      animation: {
        wobble: "wobble .5s ease-in-out",
      },
      keyframes: {
        wobble: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
      },
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [preline],
};
