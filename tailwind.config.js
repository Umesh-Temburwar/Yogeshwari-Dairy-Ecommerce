/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fk: {
          blue: {
            DEFAULT: '#2874F0',
            dark: '#1A5DC8',
            light: '#E8F0FE',
            subtle: '#F0F5FF',
          },
          yellow: {
            DEFAULT: '#FFE11B',
            accent: '#FF9F00',
            dark: '#E58F00',
            light: '#FFF9E6',
          },
          orange: {
            DEFAULT: '#FB641B',
            dark: '#E05510',
            light: '#FFF2EC',
          },
          green: {
            DEFAULT: '#388E3C',
            dark: '#2E7D32',
            light: '#E8F5E9',
          },
          bg: '#F1F3F6',
          border: '#E0E0E0',
          text: {
            primary: '#212121',
            secondary: '#878787',
            muted: '#9E9E9E',
          },
        },
        brand: {
          green: {
            DEFAULT: '#0C831F',
            dark: '#086617',
            light: '#E7F7ED',
            fresh: '#008B45',
          },
          yellow: {
            DEFAULT: '#F8CB46',
            accent: '#FFC107',
            light: '#FFF9E5',
          },
          slate: {
            bg: '#F4F6F8',
            surface: '#FFFFFF',
            border: '#E8E8E8',
          },
          text: {
            primary: '#1C1C1C',
            secondary: '#666666',
            muted: '#8C8C8C',
          }
        },
        blinkit: {
          green: {
            DEFAULT: '#0C831F',
            dark: '#086617',
            light: '#E7F7ED',
            hover: '#0A6F1A',
          },
          yellow: {
            DEFAULT: '#F8CB46',
            accent: '#FFC200',
            light: '#FFF9E5',
            badge: '#FEE180',
          },
          slate: {
            bg: '#F4F6F8',
            surface: '#FFFFFF',
            border: '#E8E8E8',
          },
          dark: '#1C1C1C',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'float': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'subtle': '0 1px 3px rgba(0,0,0,0.06)',
        'blinkit-cart': '0 -4px 20px rgba(0, 0, 0, 0.12)',
        'blinkit-badge': '0 2px 6px rgba(12, 131, 31, 0.18)',
        'blinkit-float': '0 10px 25px -5px rgba(12, 131, 31, 0.3)',
      },
      animation: {
        'scale-in': 'scaleIn 0.15s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2s infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
