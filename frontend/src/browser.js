// This file serves as a polyfill for 'process/browser'
var process = {
  browser: true,
  env: {},
  version: '',
  versions: {},
  nextTick: function (fn) {
    setTimeout(fn, 0);
  },
  title: 'browser',
  argv: [],
  stdout: {},
  stderr: {},
  platform: 'browser'
};

module.exports = process; 