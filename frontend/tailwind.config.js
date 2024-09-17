module.exports = {
  // ... other configurations
  theme: {
    extend: {
      // ... other extensions
      animation: {
        'fill-color': 'fillColor 0.5s ease forwards',
      },
      keyframes: {
        fillColor: {
          '0%': { color: 'transparent' },
          '100%': { color: 'currentColor' },
        },
      },
    },
  },
  // ... other configurations
};