// Customize webpack configuration using react-app-rewired
const path = require('path');
const webpack = require('webpack');

module.exports = function override(config, env) {
  // Completely disable source-map-loader for @tensorflow-models
  if (config.module && config.module.rules) {
    // Find and modify the source-map-loader rules
    config.module.rules.forEach(rule => {
      if (rule.enforce === 'pre' && rule.use && rule.use.some(loader => 
        loader.loader && loader.loader.includes('source-map-loader')
      )) {
        // Add an exclusion pattern for tensorflow-models
        rule.exclude = [
          /node_modules[\/\\]@tensorflow-models/,
          /node_modules[\/\\]@tensorflow\//
        ];
      }
    });
  }
  
  // Create a custom IgnoreWarningsPlugin
  class IgnoreSourceMapWarningsPlugin {
    apply(compiler) {
      // Handle warnings after emit - this is safer than compilation.hooks.moduleWarning
      compiler.hooks.afterEmit.tap('IgnoreSourceMapWarningsPlugin', (compilation) => {
        if (compilation.warnings) {
          compilation.warnings = compilation.warnings.filter(warning => {
            if (typeof warning === 'object' && warning.message) {
              return !warning.message.includes('Failed to parse source map');
            }
            
            if (typeof warning === 'string') {
              return !warning.includes('Failed to parse source map');
            }
            
            return true;
          });
        }
      });
    }
  }
  
  // Add our custom plugin to webpack config
  config.plugins.push(new IgnoreSourceMapWarningsPlugin());
  
  // Disable source maps for production
  if (env === 'production') {
    config.devtool = false;
  } else {
    // Use a simpler source map in development
    config.devtool = 'eval-source-map';
  }

  // Allow importing worker files
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' },
  });

  // Configure fallbacks for Node.js modules used by transformer.js
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: require.resolve('path-browserify'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    os: require.resolve('os-browserify/browser'),
    util: require.resolve('util/'),
    assert: require.resolve('assert/'),
    buffer: require.resolve('buffer/'),
    process: require.resolve('./src/process-browser.js')
  };

  // Add alias to resolve process/browser
  if (!config.resolve.alias) {
    config.resolve.alias = {};
  }
  
  config.resolve.alias['process/browser'] = path.resolve(__dirname, 'src/browser.js');
  config.resolve.alias['process/browser.js'] = path.resolve(__dirname, 'src/browser.js');

  // Add necessary polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: path.resolve(__dirname, 'src/process-browser.js'),
      Buffer: ['buffer', 'Buffer'],
    }),
  ];

  // This configures webpack to handle the transformer library's worker files
  config.output.globalObject = 'this';

  return config;
}; 