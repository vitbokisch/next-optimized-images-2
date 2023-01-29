import { createRequire } from 'module'
import path from 'path'

const require = createRequire(import.meta.url)

/**
 * Returns the resource query definition for an svg sprite image
 *
 * @param {object} optimizedConfig - next.js configuration
 * @param {object} detectedLoaders - detected loaders
 * @param {object} imgLoaderOptions - img loader options
 * @param {boolean} optimize - if the svg image should get optimized
 * @returns {object}
 */
const getSvgSpriteLoaderResourceQuery = (
  optimizedConfig,
  detectedLoaders,
  imgLoaderOptions,
  optimize
) => ({
  resourceQuery: /sprite/,
  use: [
    {
      loader: 'svg-sprite-loader',
      options: {
        runtimeGenerator: require.resolve(
          path.resolve(__dirname, 'svg-runtime-generator.js')
        ),
        ...(optimizedConfig.svgSpriteLoader || {}),
      },
    },
  ].concat(
    detectedLoaders.svg && optimize
      ? [
          {
            loader: 'img-loader',
            options: imgLoaderOptions,
          },
        ]
      : []
  ),
})

export { getSvgSpriteLoaderResourceQuery }
