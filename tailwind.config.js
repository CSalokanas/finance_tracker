/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        bg2: 'var(--bg-2)',
        surface: 'var(--surface)',
        surface2: 'var(--surface-2)',
        surfaceSolid: 'var(--surface-solid)',
        border: 'var(--border)',
        borderSoft: 'var(--border-soft)',
        ink: 'var(--text)',
        'ink-muted': 'var(--text-muted)',
        'ink-faint': 'var(--text-faint)',
        primary: 'var(--primary)',
        'primary-strong': 'var(--primary-strong)',
        'primary-dim': 'var(--primary-dim)',
        accent: 'var(--accent)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        success: 'var(--success)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      boxShadow: {
        card: 'var(--shadow-sm)',
        pop: 'var(--shadow)'
      },
      borderRadius: {
        xl2: '1rem'
      }
    }
  },
  plugins: []
};
