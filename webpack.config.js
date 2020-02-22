const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const WebpackHookPlugin = require('webpack-hook-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const glob = require('glob')
const _ = require('lodash')

const { dotenv, abspath, locale } = require('./modules/plugins')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'


const BuildTargets = {
  chrome: {
    buildPath: abspath('./.builds/chrome'),
    assets: [
      { from: './src/manifest.chrome.json', to: './manifest.json' },
    ],
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'extension-auth'],
  },
  firefox: {
    buildPath: abspath('./.builds/firefox'),
    assets: [
      { from: './src/manifest.gecko.json', to: './manifest.json' },
    ],
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'extension-auth'],
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
        minify: false,
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

const scssLoader = (() => {
  return [
    IS_PRODUCTION ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: { importLoaders: 1 },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: { plugins: [
        require('autoprefixer'),
        require('cssnano')({ preset: 'default' }),
      ] },
    },
    {
      loader: require.resolve('sass-loader'),
      options: { sassOptions: {
        includePaths: [ abspath('./src') ],
      }},
    },
  ]
})()

module.exports = {
  mode: IS_PRODUCTION ? 'production' : 'development',
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
    pathinfo: false,
    path: target.buildPath,
  },

  resolve: {
    alias: {
      '~mixins': abspath('src/mixins'),
      '~procs': abspath('src/procs'),
      '~components': abspath('src/components'),
      '~styles': abspath('src/styles'),
      '~pages': abspath('src/pages'),
      '~page-commons': abspath('src/pages/_commons'),
      '~views': abspath('src/views'),
      '@ilearn/modules': abspath('modules'),
    },
    extensions: ['.mjs', '.esm.js', '.js', '.jsx', '.json', '.es.js'],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.s?(c|a)ss$/,
        exclude: /node_modules/,
        use: scssLoader,
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
              'md-transpile': require('./modules/plugins/pugjs-markdown').transpile,
            },
          },
        }],
      },
      ...target.rules,
    ],
  },

  optimization: {
    concatenateModules: false,
    namedModules: true,
    moduleIds: 'named',
    splitChunks: {
      minChunks: 3,
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
    minimize: IS_PRODUCTION,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        extractComments: true,
        exclude: /\.(html)/,
        terserOptions: {
          keep_classnames: true,
          drop_console: true,
        },
        // chunkFilter: (chunk) => chunk.name !== 'vendor',
      }),
    ],
  },

  stats: {
    children: false,
    entrypoints: false,
    hash: false,
    modules: false,
    version: false,
    warnings: false,
    excludeAssets: /^(fonts|icons|atlas|media)\/.*/,
    assets: IS_PRODUCTION,
    assetsSort: 'name',
  },

  devtool: IS_PRODUCTION ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {
    port: 8517,
    hot: true,
    hotOnly: true,
    clientLogLevel: 'error',
    public: 'localhost:8517',
    useLocalIp: true,
    stats: 'minimal',
    inline: true,
    watchContentBase: true,
    open: false,
    overlay: true,
    writeToDisk: false,
  },

  node: { global: true },
  performance: { hints: false },
  bail: true,

  plugins: [
    new WebpackBar({ name: 'webext-ilearn', profile: false, basic: false }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, logLevel: 'error' }),
    new CopyWebpackPlugin(copySourceBundleRules, {
      copyUnmodified: true,
      ignore: ['.DS_Store'],
    }),
    new MomentLocalesPlugin({ localesToKeep: ['fr', 'en-gb', 'hi', 'zh-cn'] }),
    dotenv.PackageEnv.webpackPlugin,
    ...staticPages.reduce((acc, { plugin }) => [ ...acc, plugin ], []),
    ...target.plugins,
    // Remove contents of build directory
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
