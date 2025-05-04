// This file serves as a wrapper for the coco-ssd module to help suppress source map warnings
// @ts-nocheck

// Disable ESLint for this import as it generates source map warnings
/* eslint-disable */
import * as originalCocoSsd from '@tensorflow-models/coco-ssd';
/* eslint-enable */

// Re-export everything from the original module
export default originalCocoSsd; 