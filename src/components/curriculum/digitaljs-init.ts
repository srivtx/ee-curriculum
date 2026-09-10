// digitaljs-init.ts — bridge jquery + jquery-ui for Turbopack/Next.js 16.
//
// Why this file exists:
//   digitaljs's source (`src/index.mjs`) does `import $ from 'jquery'` then
//   `import 'jquery-ui/ui/widgets/dialog.js'`. jquery-ui ships as UMD that
//   checks `typeof define === 'function' && define.amd` — but Turbopack does
//   NOT polyfill `define.amd`, so jquery-ui takes the browser-globals branch
//   and calls `factory(jQuery)` against `window.jQuery`. The AMD dep array
//   (e.g. dialog.js lists `["jquery", "./button", "./draggable", "./mouse",
//   "./resizable", "../focusable", "../keycode", "../position",
//   "../tabbable", "../unique-id", "../version", "../widget"]`) is NOT
//   picked up by the bundler as a static dep graph — it's just data — so
//   none of the transitive jquery-ui prerequisites load. dialog.js then
//   calls `$.widget("ui.dialog", ...)` and throws `$.widget is not a
//   function`, or `$.ui.plugin.add(...)` throws `Cannot read properties of
//   undefined (reading 'add')`.
//
// Fix:
//   1. Statically import jquery and assign it to `window.jQuery`/`window.$`
//      BEFORE any jquery-ui side-effect imports evaluate. We do this in a
//      dedicated `jquery-global.ts` module which is the FIRST static import
//      below — ESM evaluates static imports in source order, so by the time
//      the jquery-ui imports evaluate, `window.jQuery` is set.
//   2. Statically import every jquery-ui file that dialog.js transitively
//      needs, in topological order. Each one calls
//      `factory(window.jQuery)` and augments the same jQuery function
//      reference, so by the time dialog.js evaluates, `$.widget`,
//      `$.ui.plugin`, `$.ui.mouse`, `$.ui.draggable`, `$.ui.resizable`,
//      `$.ui.button`, etc. are all defined.
//   3. Finally import `digitaljs`. Its own `import 'jquery-ui/ui/widgets/
//      dialog.js'` is a no-op (module is already in the bundle) and its
//      `import $ from 'jquery'` resolves to the same jQueryFn that
//      `window.jQuery` points to — so all jquery-ui augmentations are
//      visible to digitaljs.
//
// Re-exports digitaljs's surface so VerilogPlayground can do
// `await import('./digitaljs-init')` and get a single lazy-loaded chunk
// that contains jquery + jquery-ui + digitaljs, all initialized correctly.

import './jquery-global';

// ── jquery-ui dependency graph, topologically sorted ─────────────────────
// Layer 0: leaf utilities (only depend on jquery+version)
import 'jquery-ui/ui/version.js';
import 'jquery-ui/ui/data.js';
import 'jquery-ui/ui/plugin.js';
import 'jquery-ui/ui/disable-selection.js';
import 'jquery-ui/ui/scroll-parent.js';
import 'jquery-ui/ui/focusable.js';
import 'jquery-ui/ui/keycode.js';
import 'jquery-ui/ui/position.js';
import 'jquery-ui/ui/unique-id.js';
import 'jquery-ui/ui/form-reset-mixin.js';
import 'jquery-ui/ui/labels.js';

// Layer 1: the widget factory itself (adds $.widget + $.Widget)
import 'jquery-ui/ui/widget.js';

// Layer 2: tabbable (needs focusable); mouse (needs widget)
import 'jquery-ui/ui/tabbable.js';
import 'jquery-ui/ui/widgets/mouse.js';

// Layer 3: controlgroup (needs widget); checkboxradio (needs form-reset-mixin, labels, widget)
import 'jquery-ui/ui/widgets/controlgroup.js';
import 'jquery-ui/ui/widgets/checkboxradio.js';

// Layer 4: draggable (needs mouse, data, plugin, scroll-parent, widget)
//          resizable  (needs mouse, disable-selection, plugin, widget)
//          button     (needs controlgroup, checkboxradio, keycode, widget)
import 'jquery-ui/ui/widgets/draggable.js';
import 'jquery-ui/ui/widgets/resizable.js';
import 'jquery-ui/ui/widgets/button.js';

// Layer 5: dialog (needs button, draggable, mouse, resizable, focusable, keycode,
//                  position, tabbable, unique-id, widget)
import 'jquery-ui/ui/widgets/dialog.js';

// Finally pull in digitaljs — its `import 'jquery-ui/ui/widgets/dialog.js'`
// is now a no-op (already evaluated above) and `import $ from 'jquery'`
// resolves to the same jQuery function that the widget factory augmented.
export * from 'digitaljs';
