const WebpackBar = require('webpackbar')
const DashboardPlugin = require('webpack-dashboard/plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const { PackageEnv, abspath, transpileLocaleFile } = require('./package.config.js')


// Files that should be copied into the extension directory.
const copySourceBundleRules = [
  { from: './src/manifest.json', to: './' },
  { from: './src/pages', to: './pages' },
  { from: './assets', to: './', ignore: [ 'locales/*', '.DS_Store' ] },
  {
    from: './assets/locales/*.yml',
    to: './_locales/[name]/messages.json',
    toType: 'template',
    transform: transpileLocaleFile,
  },
]


module.exports = {
  entry: {
    app_root: './src/index.js',
    background: './src/procs/background.js',
    ext_pages: './src/pages/common.js',
    // content_scripts: './src/procs/content_scripts.js',
    // page_action: '',
    // browser_action: '',
    // options: '',
  },
  output: {
    filename: '[name].js',
    path: abspath('./ext'),
  },

  resolve: {
    // Alias allows importing modules independent of base paths.
    alias: {
      '~mixins': abspath('src/mixins'),
      '~components': abspath('src/components'),
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
          'sass-loader',
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2|svg|png|gif|jpe?g)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'rawassets/',
        },
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
    new DashboardPlugin(),
    new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false, logLevel: 'error' }),
    new CopyWebpackPlugin(copySourceBundleRules, { copyUnmodified: true }),
    PackageEnv.webpackPlugin,
  ],
}
