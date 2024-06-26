import { createRequire } from 'module'
import { applyImgLoader } from './img-loader.js'
import { applyWebpLoader } from './webp-loader.js'
import { applyResponsiveLoader } from './responsive-loader.js'
import { applyFileLoader } from './file-loader.js'

const require = createRequire(import.meta.url)

/**
 * Checks if a node module is installed in the current context
 *
 * @param {string} name - module name
 * @param {string} resolvePath - optional resolve path
 * @returns {boolean}
 */
const isModuleInstalled = (name, resolvePath) => {
  try {
    require.resolve(name, resolvePath ? { paths: [resolvePath] } : undefined)

    return true
  } catch (e) {
    return false
  }
}

/**
 * Detects all currently installed image optimization loaders
 *
 * @param {string} resolvePath - optional resolve path
 * @returns {object}
 */
const detectLoaders = (resolvePath) => {
  const jpeg = isModuleInstalled('imagemin-mozjpeg', resolvePath)
    ? 'imagemin-mozjpeg'
    : false
  const gif = isModuleInstalled('imagemin-gifsicle', resolvePath)
    ? 'imagemin-gifsicle'
    : false
  const svg = isModuleInstalled('imagemin-svgo', resolvePath)
    ? 'imagemin-svgo'
    : false
  const svgSprite = isModuleInstalled('svg-sprite-loader', resolvePath)
    ? 'svg-sprite-loader'
    : false
  const webp = isModuleInstalled('webp-loader', resolvePath)
    ? 'webp-loader'
    : false
  const lqip = isModuleInstalled('lqip-loader', resolvePath)
    ? 'lqip-loader'
    : false

  let png = false
  let responsive = false
  let responsiveAdapter = false

  if (isModuleInstalled('imagemin-optipng', resolvePath)) {
    png = 'imagemin-optipng'
  } else if (isModuleInstalled('imagemin-pngquant', resolvePath)) {
    png = 'imagemin-pngquant'
  }

  if (isModuleInstalled('responsive-loader', resolvePath)) {
    responsive = require
      .resolve(
        'responsive-loader',
        resolvePath ? { paths: [resolvePath] } : undefined
      )
      .replace(/(\/|\\)lib(\/|\\)index.js$/g, '')

    if (isModuleInstalled('sharp', resolvePath)) {
      responsiveAdapter = 'sharp'
    } else if (isModuleInstalled('jimp', resolvePath)) {
      responsiveAdapter = 'jimp'
    }
  }

  return {
    jpeg,
    gif,
    svg,
    svgSprite,
    webp,
    png,
    lqip,
    responsive,
    responsiveAdapter,
  }
}

/**
 * Checks which image types should by handled by this plugin
 *
 * @param {object} optimizedConfig - next.js configuration
 * @returns {object}
 */
const getHandledImageTypes = (optimizedConfig) => {
  const { handleImages } = optimizedConfig

  return {
    jpeg: handleImages.indexOf('jpeg') >= 0 || handleImages.indexOf('jpg') >= 0,
    png: handleImages.indexOf('png') >= 0,
    svg: handleImages.indexOf('svg') >= 0,
    webp: handleImages.indexOf('webp') >= 0,
    gif: handleImages.indexOf('gif') >= 0,
    ico: handleImages.indexOf('ico') >= 0,
  }
}

/**
 * Returns the number of image optimization loaders installed
 *
 * @param {object} loaders - detected loaders
 * @returns {number}
 */
const getNumOptimizationLoadersInstalled = (loaders) =>
  Object.values(loaders).filter(
    (loader) =>
      loader &&
      (loader.startsWith('imagemin-') ||
        loader.startsWith('webp-') ||
        loader.startsWith('lqip-'))
  ).length

/**
 * Appends all loaders to the webpack configuration
 *
 * @param {object} webpackConfig - webpack configuration
 * @param {object} optimizedConfig - optimized images configuration
 * @param {object} nextConfig - next.js configuration
 * @param {object} detectedLoaders - detected loaders
 * @param {boolean} isServer - if the build is for the server
 * @param {boolean} optimize - if images should get optimized or just copied
 * @returns {object}
 */
const appendLoaders = (
  webpackConfig,
  optimizedConfig,
  nextConfig,
  detectedLoaders,
  isServer,
  optimize
) => {
  let config = webpackConfig
  const handledImageTypes = getHandledImageTypes(optimizedConfig)
  let imgLoaderHandledTypes = handledImageTypes

  // check if responsive-loader should be the default loader and apply it if so
  if (
    optimizedConfig.defaultImageLoader &&
    optimizedConfig.defaultImageLoader === 'responsive-loader'
  ) {
    // img-loader no longer has to handle jpeg and png images
    imgLoaderHandledTypes = {
      ...imgLoaderHandledTypes,
      jpeg: false,
      png: false,
    }

    config = applyResponsiveLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      isServer,
      detectLoaders
    )
  }

  // apply img loader
  const shouldApplyImgLoader =
    imgLoaderHandledTypes.jpeg ||
    imgLoaderHandledTypes.png ||
    imgLoaderHandledTypes.gif ||
    imgLoaderHandledTypes.svg

  if (
    (detectedLoaders.jpeg ||
      detectedLoaders.png ||
      detectedLoaders.gif ||
      detectedLoaders.svg) &&
    shouldApplyImgLoader
  ) {
    config = applyImgLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      optimize,
      isServer,
      detectedLoaders,
      imgLoaderHandledTypes
    )
  } else if (shouldApplyImgLoader) {
    config = applyImgLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      false,
      isServer,
      detectedLoaders,
      imgLoaderHandledTypes
    )
  }

  // apply webp loader
  if (detectedLoaders.webp && handledImageTypes.webp) {
    config = applyWebpLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      optimize,
      isServer,
      detectLoaders
    )
  } else if (handledImageTypes.webp) {
    config = applyWebpLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      false,
      isServer,
      detectLoaders
    )
  }

  // apply file loader for non optimizable image types
  if (handledImageTypes.ico) {
    config = applyFileLoader(
      webpackConfig,
      optimizedConfig,
      nextConfig,
      isServer,
      /\.(ico)$/i
    )
  }

  return config
}

export {
  isModuleInstalled,
  detectLoaders,
  getHandledImageTypes,
  getNumOptimizationLoadersInstalled,
  appendLoaders,
}
