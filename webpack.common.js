const WebpackBar = require('webpackbar')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const { LicenseWebpackPlugin } = require('license-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const glob = require('glob')
const _ = require('lodash')

const { dotenv, abspath, locale } = require('./modules/plugins')


const BuildTargets = {
  chrome: {
    buildPath: abspath('./.builds/chrome'),
    assets: [
      { from: './src/manifest.chrome.json', to: './manifest.json' },
    ],
    rules: [],
  },
  firefox: {
    buildPath: abspath('./.builds/firefox'),
    assets: [
      { from: './src/manifest.gecko.json', to: './manifest.json' },
    ],
    rules: [],
  },
  web: {
    buildPath: abspath('./.builds/web'),
    assets: [],
    rules: [
      {
        test: abspath('node_modules/webextension-polyfill/dist/browser-polyfill.js'),
        use: 'null-loader',
      },
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
    from: './modules/atlas/dotatlas/*.js',
    to: './atlas/',
    flatten: true,
  },
  { from: './assets/media/favicons', to: './media/favicons' },
  { from: './assets/media/illustrations', to: './media/illustrations' },
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
        chunks: [ 'vendors', 'modules', 'pages_root', chunkName ],
      }),
      entrypoint: [ chunkName, `./src/pages/${pageName}/index.js` ],
    }
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

    pages_root: './src/pages/index.js',
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
        use: ['pug-loader'],
      },
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      },
      ...target.rules,
    ],
  },

  optimization: {
    concatenateModules: true,
    namedModules: true,
    moduleIds: 'named',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        modules: {
          test: /[\\/]modules[\\/]/,
          name: 'modules',
          chunks: 'all',
          reuseExistingChunk: true,
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
    excludeAssets: /^(fonts|icons|atlas)\/.*/,
    assets: dotenv.flags.verbose === 'yes',
    assetsSort: 'name',
  },

  node: {
    global: false,
  },

  performance: {
    hints: false,
  },

  plugins: [
    new WebpackBar({ name: 'webext-ilearn', profile: false, basic: false }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, logLevel: 'error' }),
    new CopyWebpackPlugin(copySourceBundleRules, { copyUnmodified: true }),
    new MomentLocalesPlugin({ localesToKeep: ['fr'] }),
    new LicenseWebpackPlugin({ perChunkOutput: false, outputFilename: 'module.licenses.txt' }),
    dotenv.PackageEnv.webpackPlugin,
    ...staticPageGeneratorPlugins,
  ],
}
