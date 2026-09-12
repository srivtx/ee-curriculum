// Type declarations for `@wokwi/elements` Lit web components when used as
// intrinsic JSX elements in React 19.
//
// `@wokwi/elements` ships its own react-types.d.ts that augments the global
// `JSX` namespace, but React 19 + Next.js 16 (Turbopack) resolves JSX
// intrinsics against `React.JSX.IntrinsicElements` first — so we declare both
// to be safe.  These are the only three element types we currently use in the
// curriculum. Add more on demand by copying the pattern.
//
// See node_modules/@wokwi/elements/dist/esm/{led,pushbutton,lcd1602}-element.d.ts
// for the full property list of each element.

import type { LEDElement, PushbuttonElement, LCD1602Element } from '@wokwi/elements';

type WokwiAttrs<T> = Partial<T> & {
  /** React 19 supports `className` / `style` on custom elements natively. */
  className?: string;
  style?: React.CSSProperties;
  /** Standard DOM ref. */
  ref?: React.Ref<T>;
  key?: React.Key;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wokwi-led': WokwiAttrs<LEDElement>;
      'wokwi-pushbutton': WokwiAttrs<PushbuttonElement>;
      'wokwi-lcd1602': WokwiAttrs<LCD1602Element>;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'wokwi-led': WokwiAttrs<LEDElement>;
      'wokwi-pushbutton': WokwiAttrs<PushbuttonElement>;
      'wokwi-lcd1602': WokwiAttrs<LCD1602Element>;
    }
  }
}

export {};
