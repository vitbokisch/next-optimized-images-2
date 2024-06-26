/**
 * Enriches the next-optimized-images configuration object with default config values for
 * next-optimized-iamges and returns it
 *
 * @param {object} optimizedConfig - next-optimized-images configuration object
 * @returns {object} enriched config
 */
const getConfig = (optimizedConfig) => ({
  optimizeImages: true,
  optimizeImagesInDev: false,
  handleImages: ['jpeg', 'png', 'svg', 'webp', 'gif'],
  imagesFolder: 'images',
  imagesName: '[name]-[hash].[ext]',
  removeOriginalExtension: false,
  inlineImageLimit: 8192,
  defaultImageLoader: 'img-loader',
  mozjpeg: {},
  optipng: {},
  pngquant: {},
  gifsicle: {
    interlaced: true,
    optimizationLevel: 3,
  },
  svgo: {
    plugins: [{ name: 'removeViewBox', active: false }],
  },
  svgSpriteLoader: {
    symbolId: '[name]-[hash:8]',
  },
  webp: {},
  ...optimizedConfig,
})

export default getConfig
