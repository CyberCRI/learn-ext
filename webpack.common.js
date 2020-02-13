const WebpackBar = require('webpackbar')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const WebpackHookPlugin = require('webpack-hook-plugin')
const { LicenseWebpackPlugin } = require('license-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const glob = require('glob')
const _ = require('lodash')

const { dotenv, abspath, locale } = require('./modules/plugins')
const { pugMdFilter } = require('./modules/plugins/pugjs-markdown')


const BuildTargets = {
  chrome: {
    buildPath: abspath('./.builds/chrome'),
    assets: [
      { from: './src/manifest.chrome.json', to: './manifest.json' },
    ],
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'settings', 'extension-auth'],
  },
  firefox: {
    buildPath: abspath('./.builds/firefox'),
    assets: [
      { from: './src/manifest.gecko.json', to: './manifest.json' },
    ],
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'settings', 'extension-auth'],
  },
  web: {
    buildPath: abspath('./.builds/web'),
    assets: [
      { from: './assets/icons/browsers/apple-touch-icon.png', to: './apple-touch-icon.png' },
      { from: './assets/media/favicons/browserconfig.xml', to: './browserconfig.xml' },
    ],
    rules: [
      {
        test: abspath('node_modules/webextension-polyfill/dist/browser-polyfill.js'),
        use: 'null-loader',
      },
    ],
    plugins: [
      // In web builds, we'd like to make discover page to be index.html for the time being.
      new WebpackHookPlugin({
        onBuildExit: ['cp ./.builds/web/pages/discover.html ./.builds/web/index.html'],
      }),
    ],
  },
}
const target = BuildTargets[dotenv.flags.target || 'firefox']

// Files that should be copied into the extension directory.
const copySourceBundleRules = [
  { from: './assets/icons', to: './icons' },
  {
    from: './assets/locales/*.yml',
    to: './_locales/[name]/messages.json',
    toType: 'template',
    transform: locale.transpile,
  },
  {
    from: dotenv.flags.dotatlas_prod || './modules/atlas/dotatlas/dotatlas.js',
    to: './atlas/dotatlas.js',
  },
  { from: './assets/media/favicons', to: './media/favicons' },
  { from: './assets/media/illustrations', to: './media/illustrations' },
  { from: './assets/media/logos', to: './media/logos' },
  { from: './assets/icons/browsers/favicon.ico', to: './favicon.ico' },
  ...target.assets,
]

// Setup html generator plugin using HtmlWebpackPlugin

// Link entry points with the chunks defined here.
// By convention, every static html target page contains `markup.pug`. We
// glob down the fs tree to look for all such files and get the template path,
// and filenames.
const staticPages = glob
  .sync('./src/pages/**/markup.pug')
  .map((entry) => {
    const pageName = /src\/pages\/(.*)\/markup.pug$/.exec(entry)[1]
    const chunkName = `pages_${pageName}`
    return {
      name: pageName,
      plugin: new HtmlWebpackPlugin({
        filename: `pages/${pageName}.html`,
        template: `src/pages/${pageName}/markup.pug`,
        templateParameters: {
          env: dotenv.PackageEnv.vars,
        },
        hash: true,
        chunks: [ 'vendors', 'modules', 'page_init', chunkName ],
      }),
      entrypoint: [ chunkName, `./src/pages/${pageName}/index.js` ],
    }
  })
  .filter((page) => {
    if (target.includePages) {
      return target.includePages.indexOf(page.name) > 0
    }
    // Unless explicitly marked, include all pages.
    return true
  })

// Gather staticPages entries into separate plugin and entrypoint entities.
// We'll merge the entrypoints and plugin instances to respective webpack
// config fields.
const staticEntrypoints = staticPages
  .reduce((acc, { entrypoint }) => {
    const [ chunkName, entryPath ] = entrypoint
    acc[chunkName] = entryPath
    return acc
  }, {})

const staticPageGeneratorPlugins = staticPages
  .reduce((acc, { plugin }) => [ ...acc, plugin ], [])

module.exports = {
  entry: {
    app_root: './src/index.js',
    background: './src/procs/background.js',
    page_init: './src/pages/index.js',

    ...staticEntrypoints,
  },
  output: {
    publicPath: '/',
    chunkFilename: '[name].js',
    filename: (chunkData) => {
      if (/pages_.*/.test(chunkData.chunk.name)) {
        // Put the static html inside `pages/chunks`
        return 'chunks/[name].js'
      } else {
        // Otherwise put it in root directory.
        return '[name].js'
      }
    },
    path: target.buildPath,
  },

  resolve: {
    // Alias allows importing modules independent of base paths.
    alias: {
      '~mixins': abspath('src/mixins'),
      '~procs': abspath('src/procs'),
      '~components': abspath('src/components'),
      '~styles': abspath('src/styles'),
      '~pug-partials': abspath('src/pages/partials'),
      '~pages': abspath('src/pages'),
      '~page-commons': abspath('src/pages/_commons'),
      '~media': abspath('assets/media'),
      '~views': abspath('src/views'),
      '@ilearn/modules': abspath('modules'),
    },
    extensions: [ '.mjs', '.esm.js', '.js', '.jsx', '.json' ],
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: { plugins: [
              require('autoprefixer'),
              require('cssnano'),
            ] },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.s(c|a)ss$/,
        exclude: /node_modules/,
        use: [
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: { plugins: [
              require('autoprefixer'),
              require('cssnano'),
            ] },
          },
          {
            loader: 'sass-loader',
            options: { sassOptions: {
              includePaths: [ abspath('./src') ],
            }},
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: [ {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/',
          },
        } ],
      },
      {
        test: /\.pug$/,
        use: [{
          loader: 'pug-loader',
          options: {
            filters: {
              'md-transpile': pugMdFilter,
            },
          },
        }],
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      },
      ...target.rules,
    ],
  },

  optimization: {
    concatenateModules: false,
    namedModules: true,
    moduleIds: 'named',
    splitChunks: {
      minChunks: 1,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
          priority: 1,
        },
        i18n: {
          test: /[\\/]modules\/i18n[\\/]/,
          name: 'i18n',
          chunks: 'all',
          reuseExistingChunk: false,
          priority: 5,
        },
        modules: {
          test: /[\\/]modules[\\/]/,
          name: 'modules',
          chunks: 'all',
          // reuseExistingChunk: true,
          // priority: 2,
        },
      },
    },
  },

  stats: {
    children: false,
    entrypoints: false,
    hash: false,
    modules: false,
    version: false,
    warnings: false,
    excludeAssets: /^(fonts|icons|atlas|media)\/.*/,
    assets: dotenv.flags.verbose === 'yes',
    assetsSort: 'name',
  },

  node: {
    global: true,
  },

  performance: {
    hints: false,
  },
  bail: true,


  plugins: [
    new WebpackBar({ name: 'webext-ilearn', profile: false, basic: false }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, logLevel: 'error' }),
    new CopyWebpackPlugin(copySourceBundleRules, {
      copyUnmodified: true,
      ignore: ['.DS_Store'],
    }),
    new MomentLocalesPlugin({ localesToKeep: ['fr', 'en-gb', 'hi', 'zh-cn'] }),
    new LicenseWebpackPlugin({ perChunkOutput: false, outputFilename: 'module.licenses.txt' }),
    dotenv.PackageEnv.webpackPlugin,
    ...staticPageGeneratorPlugins,
    ...target.plugins,
  ],
}
