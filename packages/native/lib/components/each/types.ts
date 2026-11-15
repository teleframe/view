/**
 * @fileoverview Type definitions and options for Telegram Native Each collection iterator
 * @module @teleframe/view/native/components/each/types
 */

import type { NativeChildren } from '@native/tags/base';
import type { NumberStyle } from '../list/types';

/**
 * Properties for `<Each>` collection mapping component.
 *
 * @template T - Array element type
 */
export interface NativeEachProps<T = any> {
    /** Array of items to iterate over */
    items: readonly T[] | null | undefined;
    /** Presentation layout mode: 'plain' (default), 'ul', or 'ol' */
    as?: 'plain' | 'ul' | 'ol';
    /** Item render function */
    render?: (item: T, index: number) => NativeChildren;
    /** Children render prop function or static children */
    children?: ((item: T, index: number) => NativeChildren) | NativeChildren;
    /** Content to render if items array is empty, null, or undefined */
    fallback?: NativeChildren;
    /** Delimiter element placed between items in 'plain' mode (default: `<Br />`) */
    separator?: NativeChildren;
    /** Marker character or generator function when as="ul" or as="ol" */
    marker?: string | ((index: number, item: T) => string);
    /** Starting index for numbering when as="ol" (default: 1) */
    start?: number;
    /** Number of line breaks between list items (default: 1) */
    spacing?: number;
    /** Numbering style when as="ol" (default: 'dot') */
    numberStyle?: NumberStyle;
}
