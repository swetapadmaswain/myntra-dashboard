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
          'pink-light': '#ff6b8b',
          'neon-pink': '#ff2d8f',
          orange: '#ff6f00',
          'orange-light': '#ff9248',
          purple: '#5b21b6',
          'purple-light': '#7c3aed',
          dark: '#0f172a',
          gray: '#f5f5f6',
          'gray-2': '#d4d5d9',
          'text-dark': '#282c3f',
          'text-light': '#94969f',
        },
      },
      backgroundImage: {
        'myntra-gradient': 'linear-gradient(135deg, #ff3f6c 0%, #ff6f00 100%)',
        'myntra-gradient-soft': 'linear-gradient(135deg, #ff3f6c22 0%, #ff6f0022 100%)',
        'neon-gradient': 'linear-gradient(135deg, #ff2d8f 0%, #5b21b6 100%)',
      },
    },
  },
  plugins: [],
};
export default config;
