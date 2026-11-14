/**
 * @fileoverview Type definitions for Monospace component
 * @module @telegram-markup/native/components/mono/types
 */

import type { CodeChildren } from '../../tags/base';

/**
 * Properties for `<Mono>` and `<Monospace>` components.
 */
export interface NativeMonoProps {
    /** Monospaced text content only */
    children?: CodeChildren;
    key?: string | number | null;
}
