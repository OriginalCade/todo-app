/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // all app files
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // if using /app directory
    "./pages/**/*.{js,ts,jsx,tsx}", // if using /pages
    "./components/**/*.{js,ts,jsx,tsx}", // all components
  ],
  theme: { extend: {} },
  plugins: [],
};
