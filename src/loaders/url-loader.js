import { getFileLoaderOptions, getFileLoaderPath } from './file-loader.js'

/**
 * Build options for the webpack url loader
 *
 * @param {object} optimizedConfig - optimized configuration
 * @param {object} nextConfig - next.js configuration
 * @param {boolean} isServer - if the build is for the server
 * @returns {object}
 */
const getUrlLoaderOptions = (
  { inlineImageLimit, ...optimizedConfig },
  nextConfig,
  isServer
) => ({
  ...getFileLoaderOptions(optimizedConfig, nextConfig, isServer),
  limit: inlineImageLimit,
  fallback: getFileLoaderPath(),
})

export { getUrlLoaderOptions }
