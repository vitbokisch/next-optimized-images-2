/**
 * Build options for the webpack image trace loader
 *
 * @param {object} optimizedConfig - next.js configuration
 * @returns {object}
 */
const getImageTraceLoaderOptions = ({ imageTrace }) => ({
  ...(imageTrace || {}),
})

export { getImageTraceLoaderOptions }
