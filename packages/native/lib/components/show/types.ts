/**
 * @fileoverview Type definitions for declarative conditional rendering `<Show>` component
 * @module @teleframe/view/native/components/show/types
 */

import type { NativeChildren } from '@native/tags/base';

/**
 * Properties for declarative conditional rendering component `<Show>`.
 *
 * @template T - Truthy value type passed to children callback
 */
export interface NativeShowProps<T = any> {
    /** Condition or value determining whether to render content or fallback */
    when: T | boolean | null | undefined;
    /** Fallback content rendered when `when` condition is falsy */
    fallback?: NativeChildren;
    /** Content to render, either static children or a typed callback function receiving the truthy value */
    children?: NativeChildren | ((item: NonNullable<T>) => NativeChildren);
}
