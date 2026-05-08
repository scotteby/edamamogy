import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          card: '#161d2e',
          hover: '#1a2235',
        },
        green: {
          bean: '#3B6D11',
          light: '#EAF3DE',
          mid: '#97C459',
          dark: '#27500A',
          border: '#3B6D11',
        },
        border: {
          subtle: 'rgba(255,255,255,0.08)',
          DEFAULT: 'rgba(255,255,255,0.12)',
          strong: 'rgba(255,255,255,0.2)',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
      }
    },
  },
  plugins: [],
}
export default config
