const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const { resolve } = require('path')

module.exports = (env = {}) => {
  const addItem = (add, item) => add ? item : undefined
  const ifProd = item => addItem(env.prod, item)
  const ifDev = item => addItem(!env.prod, item)
  const removeEmpty = array => array.filter(i => !!i)

  const config = {
    entry: ['whatwg-fetch', './src/app.js'],

    output: {
      filename: env.prod ? 'bundle.[chunkhash].js' : 'bundle.js',
      path: resolve(__dirname, 'server/public/bundles'),
      publicPath: '/bundles'
    },

    devtool: env.prod ? 'source-map' : 'eval',

    resolve: {
      modules: ['src', 'node_modules']
    },

    module: {
      rules: removeEmpty([
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },

        ifProd({
          test: /\.less$/,
          use: ExtractTextPlugin.extract({
            fallback: { loader: 'style-loader' },
            loader: [
              {
                loader: 'css-loader'
              },
              {
                loader: 'less-loader'
              }
            ]
          })
        }),

        ifDev({
          test: /\.less$/,
          use: [
            {
              loader: 'style-loader',
              query: { sourceMap: true }
            },
            {
              loader: 'css-loader'
            },
            {
              loader: 'less-loader'
            }
          ]
        }),

        // { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' },
        { test: /\.json$/, loader: 'json-loader' }
      ])
    },

    plugins: removeEmpty([
      new HtmlWebpackPlugin({
        title: 'Red October',
        inject: false,
        template: './server/views/index.ejs',
        filename: resolve(__dirname, 'server/html/index.html'),
        appMountId: 'app',
        alwaysWriteToDisk: true
      }),

      new HtmlWebpackHarddiskPlugin(),

      ifProd(
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false,
          quiet: true
        })
      ),

      ifProd(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compress: {
            warnings: false,
            screw_ie8: true
          }
        })
      ),

      ifProd(new ExtractTextPlugin('[name].[chunkhash].css'), {
        allChunks: false
      }),

      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: env.prod ? '"production"' : '"development"'
        }
      })
    ])
  }
  return config
}
