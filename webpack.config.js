const glob = require('glob')
const Webpack = require('webpack')
const WebpackBar = require('webpackbar')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
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
      { from: './assets/media', to: './media' },
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

const ProdPlugins = !IS_PRODUCTION ? [] : [
  new CleanWebpackPlugin(),
  new MomentLocalesPlugin({ localesToKeep: ['fr', 'en-gb', 'hi', 'zh-cn'] }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    logLevel: 'error',
  }),
  new MiniCssExtractPlugin({ filename: 'chunks/[name].[hash].css' }),
]

const DevPlugins = IS_PRODUCTION ? [] : [
  new Webpack.HotModuleReplacementPlugin(),
]

// Files that should be copied into the extension directory.
const AssetPatterns = [
  { from: './assets/icons', to: './icons' },
  {
    from: './assets/locales/*.yml',
    to: './_locales/[name]/messages.json',
    toType: 'template',
    transform: locale.transpile,
  },
  { from: './assets/fonts', to: './fonts' },
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
  return [
    {
      loader: IS_PRODUCTION ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
    },
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

  cache: {
    type: 'filesystem',
  },
  watchOptions: {
    ignored: /node_modules/,
  },

  resolve: {
    alias: {
      '~components': abspath('src/components'),
      '~mixins': abspath('src/mixins'),
      '~page-commons': abspath('src/pages/_commons'),
      '~pages': abspath('src/pages'),
      '~procs': abspath('src/procs'),
      '~styles': abspath('src/styles'),
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
    concatenateModules: true,
    namedModules: true,
    moduleIds: 'named',
    splitChunks: {
      minChunks: 3,
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

  devtool: IS_PRODUCTION ? 'cheap-source-map' : 'eval',
  devServer: {
    port: 8517,
    clientLogLevel: 'error',
    stats: 'minimal',
    inline: true,
    open: false,
    overlay: true,
    writeToDisk: false,

    hot: true,
    // injectHot: (compilerConfig) => compilerConfig.name === 'only-include',

    index: 'pages/discover.html',
    compress: true,
    contentBase: target.buildPath,
    proxy: [
      {
        context: ['/api', '/carte', '/.meta'],
        target: dotenv.sys.ILRN_NGAPI_HOST || 'https://staging.welearn.cri-paris.org',
        changeOrigin: true,
      },
      {
        // Prefer to use prod servers for these requests. They kill our staging
        // servers a lot!
        context: ['/meta', '/textract'],
        target: 'https://welearn.cri-paris.org',
        changeOrigin: true,
      },
    ],
  },

  node: { global: true },
  performance: { hints: false },

  plugins: [
    new WebpackBar({ name: dotenv.flags.target, profile: false, basic: false }),
    new CopyWebpackPlugin({ patterns: AssetPatterns }),
    new AssetsPlugin({ useCompilerPath: true }),

    dotenv.PackageEnv.webpackPlugin,

    ...staticPages.reduce((acc, { plugin }) => [ ...acc, plugin ], []),
    ...target.plugins,
    ...ProdPlugins,
    ...DevPlugins,
  ],
}
