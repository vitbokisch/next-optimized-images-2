import path from 'path'
import fs from 'fs'

const __filename = import.meta.url

/**
 * Build options for the webpack file loader
 *
 * @param {object} optimizedConfig - optimized configuration
 * @param {object} nextConfig - next.js configuration
 * @param {boolean} isServer - if the build is for the server
 * @returns {object}
 */
const getFileLoaderOptions = (
  { imagesPublicPath, imagesOutputPath, imagesFolder, imagesName },
  { assetPrefix },
  isServer
) => {
  let publicPath = `/_next/static/${imagesFolder}/`

  if (imagesPublicPath) {
    publicPath = imagesPublicPath
  } else if (assetPrefix) {
    publicPath = `${assetPrefix}${
      assetPrefix.endsWith('/') ? '' : '/'
    }_next/static/${imagesFolder}/`
  }

  return {
    publicPath,
    outputPath:
      imagesOutputPath || `${isServer ? '../' : ''}static/${imagesFolder}/`,
    name: imagesName,
  }
}

/**
 * Get the file-loader path
 *
 * @returns {string}
 */
const getFileLoaderPath = () => {
  const absolutePath = path.resolve(
    path.dirname(__filename),
    '..',
    '..',
    'node_modules',
    'file-loader',
    'dist',
    'cjs.js'
  )

  if (fs.existsSync(absolutePath)) {
    return absolutePath
  }

  return 'file-loader'
}

/**
 * Apply the file loader to the webpack configuration
 *
 * @param {object} webpackConfig - webpack configuration
 * @param {object} optimizedConfig - optimized configuration
 * @param {object} nextConfig - next.js configuration
 * @param {boolean} isServer - if the build is for the server
 * @param {RegExp} fileRegex - regex for files to handle
 * @returns {object}
 */
const applyFileLoader = (
  webpackConfig,
  optimizedConfig,
  nextConfig,
  isServer,
  fileRegex
) => {
  webpackConfig.module.rules.push({
    test: fileRegex,
    oneOf: [
      {
        use: {
          loader: getFileLoaderPath(),
          options: getFileLoaderOptions(optimizedConfig, nextConfig, isServer),
        },
      },
    ],
  })

  return webpackConfig
}

export { getFileLoaderOptions, getFileLoaderPath, applyFileLoader }
