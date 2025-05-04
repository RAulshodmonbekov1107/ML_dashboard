const ignoredWarnings = [
  /Failed to parse source map/,
];

module.exports = function (app) {
  // This file can be used to configure the development server
  // as well as to provide webpack configurations for warning suppression
  
  // Suppress specific warning patterns by extending webpack configuration
  if (process.env.NODE_ENV === 'development') {
    // Gets the original webpack config
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    
    // Find webpack compiler from devServer
    const devServer = app.get('webpackDevMiddleware');
    if (devServer) {
      const compiler = devServer.context.compiler;
      
      // Hook into webpack's done hook to filter warnings
      compiler.hooks.done.tap('FilterWarningsPlugin', stats => {
        stats.compilation.warnings = stats.compilation.warnings.filter(warning => {
          return !ignoredWarnings.some(pattern => pattern.test(warning.message || warning));
        });
      });
    }
  }
}; 