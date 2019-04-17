const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const { dotenv, abspath, locale, manifest } = require('./tools/node-plugins')


// Files that should be copied into the extension directory.
const copySourceBundleRules = [
  { from: './src/manifest.json', to: './', transform: manifest.transform },
  { from: './assets/icons', to: './icons' },
  { from: './assets/banners', to: './banners' },
  {
    from: './assets/locales/*.yml',
    to: './_locales/[name]/messages.json',
    toType: 'template',
    transform: locale.transpile,
  },
  {
    from: './node_modules/webextension-polyfill/dist/browser-polyfill.min.js',
    to: './browser-polyfill.js',
  },
]

// Setup html generator plugin using HtmlWebpackPlugin
const HtmlGenerator = ({ name, chunks, webroot=false }) => {
  const filename = webroot ? `${name}.html` : `pages/${name}.html`
  return new HtmlWebpackPlugin({
    filename,
    template: `src/pages/${name}/_${name}.pug`,
    chunks: [ 'client', 'vendors', 'pages_root', ...chunks ],
  })
}

// Link entry points with the chunks defined here.
const staticPages = [
  HtmlGenerator({ name: 'options', chunks: ['pages_options'] }),
  HtmlGenerator({ name: 'settings', chunks: ['pages_settings'] }),
  HtmlGenerator({ name: 'onboarding', chunks: ['pages_onboarding'] }),
  HtmlGenerator({ name: 'popover', chunks: ['pages_popover'] }),
  HtmlGenerator({ name: 'landing', chunks: ['pages_landing'], webroot: true }),
]

const pageEntryPoint = (chunk) => `./src/pages/${chunk}/index.js`


module.exports = {
  entry: {
    app_root: './src/index.js',
    background: './src/procs/background.js',

    pages_root: './src/pages/index.js',
    pages_popover: pageEntryPoint('popover'),
    pages_options: pageEntryPoint('options'),
    pages_settings: pageEntryPoint('settings'),
    pages_onboarding: pageEntryPoint('onboarding'),
    pages_landing: pageEntryPoint('landing'),
  },
  output: {
    filename: '[name].js',
    path: abspath('./ext'),
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
    },
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
            options: { includePaths: [ abspath('./src') ] },
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
        use: [ 'svg-inline-loader' ],
      },
    ],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          reuseExistingChunk: true,
        },
        client: {
          test: /[\\/]node_modules[\\/](react|@blueprintjs|pose|popper).*/,
          name: 'client',
          chunks: 'all',
          priority: 1,
        },
      },
    },
  },

  stats: {
    entrypoints: false,
    modules: false,
    warnings: false,
  },

  plugins: [
    new WebpackBar({ name: 'ilearn', profile: true, basic: false }),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, logLevel: 'error' }),
    new CopyWebpackPlugin(copySourceBundleRules, { copyUnmodified: true }),
    dotenv.PackageEnv.webpackPlugin,
    ...staticPages,
  ],
}
