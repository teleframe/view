/**
 * @fileoverview Type definitions for Italic component
 * @module @teleframe/view/native/components/italic/types
 */

import type { BaseNativeTagWithTagNameProps } from '@native/tags/base';

/**
 * Properties for `<Italic>` component.
 */
export interface NativeItalicProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'i' (default) or 'em' */
    tagName?: 'i' | 'em';
}
