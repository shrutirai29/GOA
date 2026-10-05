/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: '#F7F0E6',
          bgSec: '#EFE4D4',
          card: '#FFF9F1',
          maroon: '#7C263D',
          maroonHover: '#681F32',
          wine: '#541C2D',
          gold: '#B58A52',
          goldLight: '#D4AF7A',
          rose: '#D9A9A5',
          teal: '#4D7774',
          tealDark: '#3A5C59',
          text: '#2D2522',
          textSec: '#766B64',
          border: 'rgba(84, 28, 45, 0.12)',
          success: '#4D8063',
          warning: '#B77A3D',
          // Dark palette - High visibility white & bright yellow
          darkBg: '#181214',
          darkSec: '#22181B',
          darkCard: '#3A2A2D',
          darkText: '#FFFFFF',
          darkGold: '#FDE047',
          darkBorder: 'rgba(253, 224, 71, 0.25)'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        'warm-sm': '0 2px 8px rgba(84, 28, 45, 0.05)',
        'warm-md': '0 8px 24px rgba(84, 28, 45, 0.08)',
        'warm-lg': '0 16px 40px rgba(84, 28, 45, 0.12)',
        'inner-warm': 'inset 0 1px 3px rgba(84, 28, 45, 0.08)'
      }
    },
  },
  plugins: [],
}
