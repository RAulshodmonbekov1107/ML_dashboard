// ESM-compatible process polyfill
const process = {
  browser: true,
  env: {},
  nextTick: function(fn) {
    setTimeout(fn, 0);
  }
};

export default process;
export { process }; 