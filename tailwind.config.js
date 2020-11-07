const baleada = require('@baleada/tailwind-theme')

module.exports = {
  purge: {
    content: [
      'index.html',
      'src/App.vue',
    ],
  },
  theme: baleada,
  plugins: [
    require('@tailwindcss/custom-forms'),
  ],
  variants: {
    extend: {
      scale: ['active']
    }
  }
}
