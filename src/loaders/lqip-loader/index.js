import { getFileLoaderOptions } from '../file-loader.js'

/**
 * Build options for the webpack lqip loader
 *
 * @param {object} optimizedConfig - optimized configuration
 * @param {object} nextConfig - next.js configuration
 * @param {boolean} isServer - if the build is for the server
 * @returns {object}
 */
const getLqipLoaderOptions = (optimizedConfig, nextConfig, isServer) => ({
  ...getFileLoaderOptions(optimizedConfig, nextConfig, isServer),
  ...(optimizedConfig.lqip || {}),
})

export { getLqipLoaderOptions }
