/**
 * @fileoverview Root entrypoint for @teleframe/view
 * Re-exports the native Telegram Bot API formatting engine.
 * @module @teleframe/view
 */

import * as native from '../packages/native/lib';

/**
 * Namespaced export for Native Bot API formatting engine.
 * Allows collision-free usage across multi-package setups:
 *
 * @example
 * ```tsx
 * import { Native } from '@teleframe/view';
 *
 * const screen = <Native.Bold>Hello</Native.Bold>;
 * const { text, entities } = Native.render(screen);
 * ```
 */
export { native, native as Native };

// Direct flat re-exports for convenience and quick start
export * from '../packages/native/lib';
