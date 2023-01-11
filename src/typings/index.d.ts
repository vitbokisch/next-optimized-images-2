declare const __esModule: boolean

/**
 * Configure webpack and next.js to handle and optimize images with this plugin.
 *
 * @param {object} nextConfig - configuration, see the readme for possible values
 * @param {object} nextComposePlugins - additional information when loaded with next-compose-plugins
 * @returns {object}
 */
declare function withOptimizedImages(
  nextConfig?: object,
  nextComposePlugins?: object
): object

export { __esModule, withOptimizedImages as default }
