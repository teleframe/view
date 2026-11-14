/**
 * @fileoverview Type definitions for Italic component
 * @module @telegram-markup/native/components/italic/types
 */

import type { BaseNativeTagWithTagNameProps } from '../../tags/base';

/**
 * Properties for `<Italic>` component.
 */
export interface NativeItalicProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 'i' (default) or 'em' */
    tagName?: 'i' | 'em';
}
