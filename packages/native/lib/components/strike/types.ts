/**
 * @fileoverview Type definitions for Strikethrough component
 * @module @telegram-markup/native/components/strike/types
 */

import type { BaseNativeTagWithTagNameProps } from '../../tags/base';

/**
 * Properties for `<Strikethrough>` and `<Strike>` components.
 */
export interface NativeStrikethroughProps extends BaseNativeTagWithTagNameProps {
    /** Underlying HTML tag: 's' (default), 'strike', or 'del' */
    tagName?: 's' | 'strike' | 'del';
}

/**
 * Alias for `NativeStrikethroughProps`.
 */
export type NativeStrikeProps = NativeStrikethroughProps;
