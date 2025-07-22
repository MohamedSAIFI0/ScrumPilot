/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#5b229b',
        secondary: {
          1: '#fff',
          2: '#2a3840'
        },
        button: '#048ccc',
        cards: '#eceef1',
        dark: {
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#334155',
          text: '#f1f5f9',
          muted: '#64748b'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif']
      },
      fontSize: {
        'title': ['2.2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'paragraph': ['1.2rem', { lineHeight: '1.6' }]
      }
    },
  },
  plugins: [],
};