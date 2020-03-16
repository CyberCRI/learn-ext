const webpack = require('webpack')
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const glob = require('glob')
const _ = require('lodash')

const { dotenv, abspath, locale } = require('./modules/plugins')

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

const BuildTargets = {
  chrome: {
    buildPath: abspath('./.builds/chrome'),
    outputFmt: '[name]',
    assets: [
      { from: './src/manifest.chrome.json', to: './manifest.json' },
    ],
    chunks: {
      background: './src/procs/background.js',
      content_script: './src/procs/content-script',
    },
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'extension-auth'],
  },
  firefox: {
    buildPath: abspath('./.builds/firefox'),
    outputFmt: '[name]',
    assets: [
      { from: './src/manifest.gecko.json', to: './manifest.json' },
    ],
    chunks: {
      background: './src/procs/background.js',
      content_script: './src/procs/content-script',
    },
    rules: [],
    plugins: [],
    includePages: ['changelog', 'popover', 'extension-auth'],
  },
  web: {
    buildPath: abspath('./.builds/web'),
    outputFmt: IS_PRODUCTION ? '[name].[hash]' : '[name]',
    chunks: {},
    assets: [
      { from: './assets/icons/browsers/apple-touch-icon.png', to: './apple-touch-icon.png' },
      { from: './assets/media/favicons/browserconfig.xml', to: './browserconfig.xml' },
      {
        from: dotenv.flags.dotatlas_prod || './modules/atlas/dotatlas/dotatlas.js',
        to: './atlas/dotatlas.js',
      },
    ],
    rules: [
      {
        test: abspath('node_modules/webextension-polyfill/dist/browser-polyfill.js'),
        use: 'null-loader',
      },
    ],
    plugins: [],
    includePages: [
      'changelog', 'about-us', 'dashboard', 'onboarding',
      'privacy-policy', 'settings', 'support', 'discover',
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
  { from: './assets/fonts', to: './fonts' },
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
        minify: false,
        chunks: [ 'vendors', 'modules', 'common_css', 'i18n', chunkName ],
      }),
      entrypoint: [ chunkName, `./src/pages/${pageName}/index.js` ],
    }
  })
  .filter((page) => {
    if (target.includePages) {
      return target.includePages.indexOf(page.name) >= 0
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
  const cssExtractPlugin = {
    loader: MiniCssExtractPlugin.loader,
    options: {
      esModule: true,
      hmr: IS_PRODUCTION,
      reloadAll: true,
    },
  }

  return [
    // IS_PRODUCTION ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
    cssExtractPlugin,
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
    common_css: './src/pages/_commons/common.scss',

    ...target.chunks,
    ...staticEntrypoints,
  },
  output: {
    publicPath: '/',
    chunkFilename: `chunks/${target.outputFmt}.js`,
    filename: `chunks/${target.outputFmt}.js`,
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
      minChunks: 4,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 1,
        },
        modules: {
          test: /[\\/]modules[\\/]/,
          name: 'modules',
          chunks: 'all',
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
    assetsSort: 'type',
  },

  devtool: IS_PRODUCTION ? 'source-map' : 'eval-cheap-module-source-map',
  devServer: {
    port: 8517,
    hot: true,
    hotOnly: true,
    clientLogLevel: 'error',
    stats: 'minimal',
    inline: true,
    // watchContentBase: true,
    open: false,
    overlay: true,
    writeToDisk: true,
  },

  node: { global: true },
  performance: { hints: false },
  bail: IS_PRODUCTION,

  plugins: [
    new WebpackBar({ name: dotenv.flags.target, profile: false, basic: false }),
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
    new MiniCssExtractPlugin({ filename: 'css/[name].[hash].css' }),
    new webpack.HotModuleReplacementPlugin(),
  ],
}
