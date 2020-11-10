const baleada = require('@baleada/tailwind-theme')

module.exports = {
  purge: {
    content: [
      'index.html',
      'src/App.vue',
    ],
  },
  theme: {
    ...baleada,
    maxHeight: {
      ...baleada.maxHeight,
      'screen-sm': '648px',
    },
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
  ],
  variants: {
    extend: {
      scale: ['active']
    }
  }
}
