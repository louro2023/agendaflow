export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'adni-marrom': '#2E1A12',
        'adni-marrom-light': '#3B2416',
        'adni-laranja': '#FF7F00',
        'adni-laranja-dark': '#E65100',
        'adni-ouro': '#FFC107',
        'adni-ouro-light': '#FFB300',
        'adni-bronze': '#966F33',
        'adni-ocre': '#B8860B',
      },
      backgroundImage: {
        'adni-gradient': 'linear-gradient(90deg, #FFC107 0%, #FF7F00 100%)',
      }
    },
  },
  plugins: [],
};
