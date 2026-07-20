import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void:           '#EAF3FC',
        obsidian:       '#DCECFA',
        ashstone:       '#CCE3F7',
        graphite:       '#B9D3EF',
        pearl:          '#10151D',
        mist:           '#54627A',
        ghost:          '#8FA2B8',
        arcane:         '#65B8F0',
        'arcane-deep':  '#3A8DC7',
        'arcane-ink':   '#1B5C86',
        'arcane-glow':  'rgba(101, 184, 240, 0.16)',
        'arcane-trace': 'rgba(101, 184, 240, 0.32)',
        vellum:         '#F5F4F0',
        ink:            '#12120F',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
