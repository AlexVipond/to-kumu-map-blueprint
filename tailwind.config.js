const colors = require('tailwindcss/colors')
const plugin = require('tailwindcss/plugin')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: colors.slate,
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    plugin(({ addComponents }) => addComponents({
      '.btn': {
        '@apply p-2 rounded bg-indigo-50 text-indigo-900 shadow hover:shadow-md hover:scale-110 active:shadow active:scale-100 transition duration-150 transform cursor-pointer': {}
      },
    }))
  ],
}
