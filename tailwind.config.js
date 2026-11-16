/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',    // Tablet breakpoint
      'lg': '1024px',   // Laptop breakpoint
      'xl': '1280px',
      '2xl': '1440px',  // Full desktop layout breakpoint
    },
    extend: {
      colors: {
        brand: {
          primary: '#6425E8',
          secondary: '#8B5CF6',
          light: '#F2ECFF',
          lavender: '#F2ECFF',
          soft: '#EAE8F2',
          DEFAULT: '#6425E8',
        },
        surface: {
          bg: '#FAFAFF',
          card: '#FFFFFF',
          border: '#EAE8F2',
        },
        content: {
          primary: '#17152F',
          secondary: '#77758B',
          muted: '#9E9CAF',
        },
        status: {
          success: '#16A36A',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['30px', { lineHeight: '38px', fontWeight: '700' }],
        'section-title': ['22px', { lineHeight: '28px', fontWeight: '600' }],
        'card-title': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        'btn': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        'form-label': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'input': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'meta': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'financial': ['30px', { lineHeight: '36px', fontWeight: '700' }],
      },
      borderRadius: {
        'card': '16px',
        'card-lg': '20px',
        'card-sm': '12px',
        'input': '12px',
        'btn': '12px',
      },
      spacing: {
        'card-p': '22px',
        'section': '28px',
        'card-gap': '20px',
        'desktop-p': '32px',
        'tablet-p': '24px',
        'mobile-p': '16px',
        'sidebar': '240px',
      },
      width: {
        'sidebar': '240px',
      },
      maxWidth: {
        'content': '1440px',
        'script-workspace': '1020px',
      },
      height: {
        'nav': '64px',
        'input': '46px',
        'btn': '42px',
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(23, 21, 47, 0.04), 0 4px 16px -4px rgba(23, 21, 47, 0.02)',
        'card': '0 4px 20px -2px rgba(100, 37, 232, 0.05), 0 2px 6px -1px rgba(23, 21, 47, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(100, 37, 232, 0.10), 0 4px 12px -2px rgba(23, 21, 47, 0.04)',
        'glow': '0 0 25px -5px rgba(100, 37, 232, 0.35)',
      }
    },
  },
  plugins: [],
}
