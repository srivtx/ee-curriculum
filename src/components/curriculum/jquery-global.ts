// jquery-global.ts — set window.jQuery / window.$ before any jquery-ui
// side-effect import evaluates.
//
// jquery's UMD wrapper detects the bundler (`module.exports` is set) and
// passes `noGlobal=true` to its factory — meaning jquery does NOT set
// `window.jQuery` itself. jquery-ui widgets, however, are UMD that look up
// `jQuery` off the global scope (Turbopack doesn't polyfill `define.amd`,
// so they take the browser-globals branch). We bridge the two worlds by
// assigning the bundled jquery function to `window.jQuery` here, as a
// side effect of importing this module.

import jQuery from 'jquery';

if (typeof window !== 'undefined') {
  // Always assign — even if a stale `window.jQuery` is already present
  // (e.g. from a previous load), we want the bundled instance so that
  // jquery-ui widget factories augment the same function reference that
  // `import $ from 'jquery'` returns elsewhere in the bundle.
  (window as any).jQuery = jQuery;
  (window as any).$ = jQuery;
}

export default jQuery;
