// CommonJS process module
if (typeof window !== 'undefined') {
  window.process = window.process || {
    env: {},
    browser: true,
    nextTick: function(cb) {
      setTimeout(cb, 0);
    }
  };
}

module.exports = typeof window !== 'undefined' ? window.process : process; 