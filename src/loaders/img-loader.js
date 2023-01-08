import { createRequire } from 'module'
import { getResourceQueries } from './resource-queries.js'
import { getWebpResourceQuery } from './webp-loader.js'
import { getUrlLoaderOptions } from './url-loader.js'
import { getSvgSpriteLoaderResourceQuery } from './svg-sprite-loader/index.js'

const require = createRequire(import.meta.url)

/**
 * Requires an imagemin plugin and configures it
 *
 * @param {string} plugin - plugin name
 * @param {*} nextConfig - next.js configuration
 * @return {function}
 */
const requireImageminPlugin = async (plugin, nextConfig) => {
  let moduleName = plugin

  if (nextConfig.overwriteImageLoaderPaths) {
    moduleName = require.resolve(plugin, {
      paths: [nextConfig.overwriteImageLoaderPaths],
    })
  }

  const result = await import(moduleName)

  return result.default(nextConfig[plugin.replace('imagemin-', '')] || {})
}

/**
 * Build options for the img loader
 *
 * @param {object} nextConfig - next.js configuration
 * @param {object} detectedLoaders - detected loaders
 * @param {boolean} optimize - if images should get optimized
 * @return {object}
 */
const getImgLoaderOptions = async (nextConfig, detectedLoaders, optimize) => {
  if (!optimize) {
    return {
      plugins: [],
    }
  }

  return {
    plugins: [
      detectedLoaders.jpeg
        ? await requireImageminPlugin(detectedLoaders.jpeg, nextConfig)
        : undefined,

      detectedLoaders.png
        ? await requireImageminPlugin(detectedLoaders.png, nextConfig)
        : undefined,

      detectedLoaders.svg
        ? await requireImageminPlugin(detectedLoaders.svg, nextConfig)
        : undefined,

      detectedLoaders.gif
        ? await requireImageminPlugin(detectedLoaders.gif, nextConfig)
        : undefined,
    ].filter(Boolean),
  }
}

/**
 * Build the regex for all handled image types
 *
 * @param {object} handledImageTypes - handled image types
 * @return {RegExp}
 */
const getHandledFilesRegex = (handledImageTypes) => {
  const handledFiles = [
    handledImageTypes.jpeg ? 'jpe?g' : null,
    handledImageTypes.png ? 'png' : null,
    handledImageTypes.svg ? 'svg' : null,
    handledImageTypes.gif ? 'gif' : null,
  ]

  return new RegExp(`\\.(${handledFiles.filter(Boolean).join('|')})$`, 'i')
}

/**
 * Apply the img loader to the webpack configuration
 *
 * @param {object} webpackConfig - webpack configuration
 * @param {object} nextConfig - next.js configuration
 * @param {boolean} optimize - if images should get optimized
 * @param {boolean} isServer - if the build is for the server
 * @param {object} detectedLoaders - detected loaders
 * @param {object} handledImageTypes - detected image types
 * @returns {object}
 */
const applyImgLoader = (
  webpackConfig,
  nextConfig,
  optimize,
  isServer,
  detectedLoaders,
  handledImageTypes
) => {
  const imgLoaderOptions = getImgLoaderOptions(
    nextConfig,
    detectedLoaders,
    optimize
  )

  webpackConfig.module.rules.push({
    test: getHandledFilesRegex(handledImageTypes),
    oneOf: [
      // add all resource queries
      ...getResourceQueries(
        nextConfig,
        isServer,
        optimize ? 'img-loader' : null,
        imgLoaderOptions,
        detectedLoaders
      ),

      // ?webp: convert an image to webp
      handledImageTypes.webp
        ? getWebpResourceQuery(nextConfig, isServer)
        : undefined,

      // ?sprite: add icon to sprite
      detectedLoaders.svgSprite
        ? getSvgSpriteLoaderResourceQuery(
            nextConfig,
            detectedLoaders,
            imgLoaderOptions,
            optimize
          )
        : undefined,

      // default behavior: inline if below the definied limit, external file if above
      {
        use: [
          {
            loader: 'url-loader',
            options: getUrlLoaderOptions(nextConfig, isServer),
          },
          {
            loader: 'img-loader',
            options: imgLoaderOptions,
          },
        ],
      },
    ].filter(Boolean),
  })

  return webpackConfig
}

export {
  requireImageminPlugin,
  getImgLoaderOptions,
  getHandledFilesRegex,
  applyImgLoader,
}
