const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Always provide process for the browser
if (typeof window !== 'undefined') {
  window.process = window.process || {
    env: {},
    browser: true
  };
}

module.exports = {
  entry: ['./src/process-module.js', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs'],
    fallback: {
      "path": false,
      "fs": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "http": false,
      "https": false,
      "zlib": false,
      "util": false,
      "assert": false,
      "buffer": false,
      "process": require.resolve('./src/process-browser.js')
    },
    alias: {
      'process/browser': path.resolve(__dirname, 'src/browser.js'),
      'process/browser.js': path.resolve(__dirname, 'src/browser.js'),
      'process': path.resolve(__dirname, 'src/process-module.js')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    new webpack.ProvidePlugin({
      process: path.resolve(__dirname, 'src/process-browser.js')
    }),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env': JSON.stringify({})
    })
  ],
  devServer: {
    historyApiFallback: true,
    hot: true
  }
}; 