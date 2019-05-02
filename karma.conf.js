// Karma configuration
const base_config = require('./webpack.common')
const { dotenv } = require('./tools/node-plugins')


module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [ 'mocha', 'chai' ],

    files: [
      'src/**/test*.js*',
    ],
    exclude: [],


    // preprocess matching files before serving them to the browser
    preprocessors: {
      'src/**/*.js*': 'webpack',
    },

    // test results reporter to use
    reporters: [ 'mocha' ],

    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      stats: 'minimal',
      cache: true,
      resolve: base_config.resolve,
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
        ],
      },
      plugins: [
        dotenv.PackageEnv.webpackPlugin,
      ],
    },

    webpackServer: {
      noInfo: true,
    },

    mochaReporter: {
      showDiff: true,
    },

    port: 9876,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch: true,
    autoWatchBatchDelay: 750,

    browsers: ['jsdom'],

    singleRun: false,
    concurrency: Infinity,
  })
}
