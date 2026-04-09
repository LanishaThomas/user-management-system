/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      colors: {
        glass: {
          light: 'rgba(148, 163, 184, 0.14)',
          dark: 'rgba(15, 23, 42, 0.6)'
        },
        neon: {
          cyan: '#00d4ff',
          mint: '#2dffb5',
          amber: '#ffcc66'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(0, 212, 255, 0.3)',
        card: '0 8px 30px rgba(2, 6, 23, 0.45)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 25px rgba(0, 212, 255, 0.35)' },
          '50%': { boxShadow: '0 0 45px rgba(45, 255, 181, 0.45)' }
        },
        floatUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        floatUp: 'floatUp 0.6s ease-out forwards',
        spinSlow: 'spinSlow 8s linear infinite'
      }
    }
  },
  plugins: []
};
