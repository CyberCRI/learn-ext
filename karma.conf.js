// Karma configuration
const base_config = require('./webpack.common')
const { dotenv, abspath } = require('./modules/plugins')


module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [ 'mocha', 'chai' ],

    files: [
      'tests/**/*.test.js',
    ],
    exclude: [],
    preprocessors: {
      'src/**/*.js*': [ 'webpack', 'sourcemap' ],
      'tests/**/*.js': [ 'webpack', 'sourcemap' ],
      'tests/fixtures/*': 'file-fixtures',
    },

    fileFixtures: {
      globalName: '__FIXTURES__',
      stripPrefix: 'tests/fixtures/',
    },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      stats: 'errors-only',
      cache: true,
      resolve: {
        alias: {
          ...base_config.resolve.alias,
          '~test-mixins': abspath('tests/mixins'),
        },
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: ['babel-loader'],
          },
          {
            test: /\.(css|scss|sass|svg|woff|ttf)$/,
            use: 'null-loader',
          },
          {
            test: abspath('node_modules/webextension-polyfill/dist/browser-polyfill.js'),
            use: [ 'null-loader' ],
          },
        ],
      },
      plugins: [
        dotenv.PackageEnv.webpackPlugin,
      ],
    },

    webpackServer: {
      noInfo: true,
    },

    reporters: [ 'mocha' ],
    mochaReporter: {
      showDiff: true,
    },

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,

    autoWatch: true,
    autoWatchBatchDelay: 750,

    browsers: ['jsdom'],

    singleRun: false,
    concurrency: Infinity,
  })
}
