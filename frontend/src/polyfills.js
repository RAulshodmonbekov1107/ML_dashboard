// Polyfill for process
window.process = window.process || {};
window.process.browser = true;
window.process.env = window.process.env || {};

// Export process as both default and named export
export default window.process;
export const process = window.process; 