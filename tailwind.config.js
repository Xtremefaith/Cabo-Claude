/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claude Cabo palette: a tropical-sunset neon nightclub.
        night: {
          900: '#0c0a1f', // deep night sky (app background)
          800: '#15102e',
          700: '#1f1840',
          600: '#2b2157',
        },
        hot: {
          DEFAULT: '#ff3d77', // HOT — hot pink
          glow: '#ff6fa5',
        },
        not: {
          DEFAULT: '#39c0d6', // NOT — cool cyan
          glow: '#7fe0ee',
        },
        sun: {
          DEFAULT: '#ffb347', // sunset amber accent
          glow: '#ffd27a',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 50px -12px rgba(0,0,0,0.7)',
        'glow-hot': '0 0 28px -2px rgba(255,61,119,0.65)',
        'glow-not': '0 0 28px -2px rgba(57,192,214,0.65)',
        'glow-sun': '0 0 28px -2px rgba(255,179,71,0.6)',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.25s ease-out',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
