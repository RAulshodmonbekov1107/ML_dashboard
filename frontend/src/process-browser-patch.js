// This is an empty file to satisfy imports of 'process/browser'
// The actual polyfill is provided in polyfills.js

// This is a patch for 'process/browser' imports
var process = {
  browser: true,
  env: {},
  version: '',
  versions: {},
  nextTick: function (fn) {
    setTimeout(fn, 0);
  }
};

// Export a dummy process object
module.exports = process; 