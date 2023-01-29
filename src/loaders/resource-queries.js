import { createRequire } from 'module'
import { getUrlLoaderOptions } from './url-loader.js'
import { getFileLoaderOptions, getFileLoaderPath } from './file-loader.js'
import { getLqipLoaderOptions } from './lqip-loader/index.js'
import { getResponsiveLoaderOptions } from './responsive-loader.js'
import { getImageTraceLoaderOptions } from './image-trace-loader.js'

const require = createRequire(import.meta.url)

/**
 * Configure the common resource queries
 */
const queries = [
  // ?url: force a file url/reference, never use inlining
  {
    test: 'url',
    loaders: [getFileLoaderPath()],
    optimize: true,
    combinations: ['original'],
  },

  // ?inline: force inlining an image regardless of the defined limit
  {
    test: 'inline',
    loaders: ['url-loader'],
    options: [
      {
        limit: undefined,
      },
    ],
    optimize: true,
    combinations: ['original'],
  },

  // ?include: include the image directly, no data uri or external file
  {
    test: 'include',
    loaders: ['raw-loader'],
    optimize: true,
    combinations: ['original'],
  },

  // ?original: use the original image and don't optimize it
  {
    test: 'original',
    loaders: ['url-loader'],
    optimize: false,
  },

  // ?lqip: low quality image placeholder
  {
    test: 'lqip(&|$)',
    loaders: [
      require.resolve('./lqip-loader/picture-export-loader.js'),
      'lqip-loader',
      'url-loader',
    ],
    optimize: false,
  },

  // ?lqip: low quality image placeholder
  {
    test: 'lqip-colors',
    loaders: [
      require.resolve('./lqip-loader/colors-export-loader.js'),
      'lqip-loader',
      'url-loader',
    ],
    options: [
      {},
      {
        base64: false,
        palette: true,
      },
    ],
    optimize: false,
  },

  // ?resize: resize images
  {
    test: 'size',
    loaders: ['responsive-loader'],
    optimize: false,
  },

  // ?trace: generate svg image traces for placeholders
  {
    test: 'trace',
    loaders: ['image-trace-loader', 'url-loader'],
    optimize: true,
    combinations: ['original'],
  },
]

/**
 * Add combinations
 */
;[].concat(queries).forEach((queryConfig) => {
  if (queryConfig.combinations) {
    queryConfig.combinations.forEach((combination) => {
      if (combination === 'original') {
        queries.unshift({
          ...queryConfig,
          test: `(${queryConfig.test}.*original|original.*${queryConfig.test})`,
          optimize: false,
        })
      }
    })
  }
})

/**
 * Returns all common resource queries for the given optimization loader
 *
 * @param {object} optimizedConfig - optimized configuration
 * @param {object} nextConfig - next.js configuration object
 * @param {boolean} isServer - if the current build is for a server
 * @param {string} optimizerLoaderName - name of the loader used to optimize the images
 * @param {object} optimizerLoaderOptions - config for the optimization loader
 * @returns {array}
 */
const getResourceQueries = (
  optimizedConfig,
  nextConfig,
  isServer,
  optimizerLoaderName,
  optimizerLoaderOptions,
  detectLoaders
) => {
  const loaderOptions = {
    'url-loader': getUrlLoaderOptions(optimizedConfig, nextConfig, isServer),
    'file-loader': getFileLoaderOptions(optimizedConfig, nextConfig, isServer),
    [getFileLoaderPath()]: getFileLoaderOptions(
      optimizedConfig,
      nextConfig,
      isServer
    ),
    'lqip-loader': getLqipLoaderOptions(optimizedConfig, nextConfig, isServer),
    'responsive-loader': getResponsiveLoaderOptions(
      optimizedConfig,
      nextConfig,
      isServer,
      detectLoaders
    ),
    'image-trace-loader': getImageTraceLoaderOptions(optimizedConfig),
  }

  return queries.map((queryConfig) => {
    const loaders = []

    queryConfig.loaders.forEach((loader, index) => {
      const loaderConfig = {
        loader,
      }

      if (loaderOptions[loader]) {
        loaderConfig.options = loaderOptions[loader]
      }

      if (queryConfig.options) {
        loaderConfig.options = {
          ...(loaderConfig.options || {}),
          ...(queryConfig.options[index] || {}),
        }
      }

      loaders.push(loaderConfig)
    })

    return {
      resourceQuery: new RegExp(queryConfig.test),
      use: loaders.concat(
        queryConfig.optimize && optimizerLoaderName !== null
          ? [
              {
                loader: optimizerLoaderName,
                options: optimizerLoaderOptions,
              },
            ]
          : []
      ),
    }
  })
}

export { getResourceQueries }
