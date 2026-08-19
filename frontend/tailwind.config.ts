import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        myntra: {
          pink: '#ff3f6c',
          'pink-dark': '#e6335b',
          dark: '#0f172a',
          gray: '#f5f5f6',
          'gray-2': '#d4d5d9',
          'text-dark': '#282c3f',
          'text-light': '#94969f',
        },
      },
    },
  },
  plugins: [],
};
export default config;
