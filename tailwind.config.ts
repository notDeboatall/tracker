import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--line)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
        },
        hi: 'var(--hi)',
        danger: 'var(--danger)',
        success: 'var(--success)',
        block: {
          gym: {
            tint: 'var(--block-gym-tint)',
            strong: 'var(--block-gym-strong)',
          },
          dsa: {
            tint: 'var(--block-dsa-tint)',
            strong: 'var(--block-dsa-strong)',
          },
          aiml: {
            tint: 'var(--block-aiml-tint)',
            strong: 'var(--block-aiml-strong)',
          },
          task: {
            tint: 'var(--block-task-tint)',
            strong: 'var(--block-task-strong)',
          },
          taskUrgent: {
            tint: 'var(--block-task-urgent-tint)',
            strong: 'var(--block-task-urgent-strong)',
          },
          fixed: {
            tint: 'var(--block-fixed-tint)',
            strong: 'var(--block-fixed-strong)',
          },
          ride: {
            tint: 'var(--block-ride-tint)',
            strong: 'var(--block-ride-strong)',
          },
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Instrument Sans Variable"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        input: '10px',
        sheet: '22px',
      },
    },
  },
  plugins: [],
};

export default config;

