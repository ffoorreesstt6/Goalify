/* Static Tailwind build for the vanilla SPA (index.html + app.js).
   Mirrors the old inline cdn.tailwindcss.com config exactly — keep in sync
   if utilities change. Build:  npx -y tailwindcss@3.4.14 -c tw.config.cjs -o assets/tw.css -m */
module.exports = {
  content: ['./index.html', './app.js'],
  darkMode: 'class',
  theme: { extend: {
    colors: {
      accent: { blue: '#3b82f6', purple: '#8b5cf6', violet: '#a855f7' },
      bg: 'var(--bg)', surface: 'var(--card)', card: 'var(--card)', sidebar: 'var(--sidebar)',
      border: 'var(--border)', hair: 'var(--hair)', muted: 'var(--muted)', ink: 'var(--text)',
      brand1: 'var(--accent1)', brand2: 'var(--accent2)', brand3: 'var(--accent3)',
    },
    fontFamily: { sans: ['var(--font)', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'system-ui', 'sans-serif'] },
    borderRadius: { ios: '1.25rem', 'ios-lg': '1.5rem', 'ios-xl': '2rem' },
    boxShadow: { card: 'var(--shadow-md)', elev: 'var(--shadow-lg)', glass: 'var(--shadow-glass)', glow: '0 0 40px -10px color-mix(in srgb,var(--accent2) 70%,transparent)' },
    transitionTimingFunction: { spring: 'cubic-bezier(.2,.8,.2,1)', smooth: 'cubic-bezier(.4,0,.2,1)' },
    animation: {
      float: 'float 6s ease-in-out infinite',
      'fade-up': 'fadeUp .6s cubic-bezier(.2,.8,.2,1) forwards',
      'fade-in': 'fadeIn .5s ease forwards',
      'scale-in': 'scaleIn .4s cubic-bezier(.2,.8,.2,1) forwards',
      sheen: 'sheen 2.4s linear infinite',
    },
    keyframes: {
      float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
      fadeUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      scaleIn: { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      sheen: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
    },
  }},
};
